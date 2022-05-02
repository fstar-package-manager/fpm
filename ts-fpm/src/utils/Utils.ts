import {
    verificationOptions, absolutePath, fuel, extractionOptions,
    ocamlBinaries, verificationBinaries, ocamlPackagePlugin
} from "./../../types/types"

import { readdir, remove, mkdirp, pathExists } from "fs-extra"
import { basename } from "path"
import { dir } from "tmp-promise"
import * as child_process from "child_process"
import { promisify } from "util"
import { withDir } from "tmp-promise"
import simpleGit, { SimpleGit } from 'simple-git';
import { BinaryResolutionError } from './Exn';

import which from "which"
import path from "path"
import { queue } from "./Queue"

import pino from 'pino'
import pino_pretty from 'pino-pretty'

import { Level, Logger } from './Log'

export const defaultLogger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            ignore: 'pid,hostname',
        }
    }
});

export type withDestination<T extends ((x: any) => any)> = (x: Parameters<T>[0], dest?: string) => ReturnType<T>

export type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never

let execFile0 = promisify(child_process.execFile);
type execFileRet = { stderr: string | Buffer, stdout: string | Buffer }
export let execFile1 = (log: Logger) => (
    file: Parameters<typeof execFile0>[0],
    args: Parameters<typeof execFile0>[1],
    options: Parameters<typeof execFile0>[2],
    quiet?: boolean
): Promise<execFileRet> => {
    let l = log(Level.NOTICE, file + ' ' + (args || []).join(' ') + '\ncwd="' + options?.cwd + '"');
    return new Promise((a, r) => {
        let p = child_process.execFile(file, args, options, (e, stdout, stderr) => {
            // console.log({ stderr, stdout });
            if (e === null) {
                l.done();
                a({ stderr, stdout });
            } else {
                log(Level.NOTICE, stdout.toString());
                log(Level.ERROR, stderr.toString());
                console.log({ stderr, stdout });
                throw e;
            }
        });
        if (quiet === false) {
            let handle = (data: string) =>
                log(Level.INFO, data + '');
            p.stdout?.on('data', handle);
            p.stderr?.on('data', handle);
        }
        // execFile0(file, args, options).then(a).catch(e => )
    });
}
/*
    let p = execFile0(file, args, options);
    // let msg = '';
    // let sub = log(Level.NOTICE, msg);
    // let handle = (data: string) =>
    //     sub.setMessage(msg += data);
    // p.child.stdout?.on('data', handle);
    // p.child.stderr?.on('data', handle);
    try {
        let r = await p;
        // sub.done();
        return r;
    } catch (e) {
        if (e instanceof child_process.ChildProcess["ExecException"])
            log(Level.ERROR, e);
        else
            throw e;
    }
    }*/

export let execFile: typeof execFile1
    = (log: Logger) => (file, args, options, quiet) =>
        // execFile1(log)(file, args, options, quiet);
        queue.add(() => execFile1(log)(file, args, options, quiet));

export function duplicates<T, P>(l: T[], proj: (x: T) => P): Map<P, Set<T>> {
    let duplicates = new Map<P, Set<T>>();
    let seen = new Map<P, T>();
    l.forEach(x => {
        let y = proj(x);
        seen.has(y) ? duplicates.set(
            y, new Set<T>([...(duplicates.get(y) || []), seen.get(y) as T, x])
        ) : seen.set(y, x);
    });
    return duplicates;
}

export let readdir_fullpaths = async (p: string): Promise<string[]> => {
    return (await readdir(p)).map(name => p + '/' + name);
}
export let is_interface = (m: string): boolean => m.endsWith('.fsti')
export let is_implem = (m: string): boolean => m.endsWith('.fst')
export let is_fstar_module = (m: string): boolean => is_interface(m) || is_implem(m)

export let fuel_to_string = (fuel: fuel): string | undefined =>
    fuel.max === undefined && fuel.initial === undefined
        ? undefined : "${fuel.max || fuel.initial},${fuel.max || fuel.initial}";

export let extractionOptions_to_flags = (o: extractionOptions): string[] => {
    return [
        ['--codegen', o.lang],
        (o.codegenLib || []).map(ns => ["--codegen-lib", ns]).flat(),
        o.inlineModules
            ? ["--cmi"] : [],
        o.normalizePure
            ? ["--normalize_pure_terms_for_extraction"] : [],
    ].flat()
}


export let verificationOptions_to_flags = (v: verificationOptions): string[] => {
    let fuel = v.fuel ? fuel_to_string(v.fuel) : undefined;
    let ifuel = v.ifuel ? fuel_to_string(v.ifuel) : undefined;
    return [
        v.MLish
            ? ["--MLish"] : [],
        v.lax
            ? ["--lax"] : [],
        fuel
            ? ["--fuel", fuel] : [],
        ifuel
            ? ["--ifuel", ifuel] : [],
        v.no_default_include
            ? ["--no_default_include"] : [],
        v.no_load_fstartaclib
            ? ["--no_load_fstartaclib"] : [],
        v.no_smt
            ? ["--no_smt"] : [],
        v.quake
            ? ["--quake", `${v.quake.n}/${v.quake.m || v.quake.n}${v.quake.unconditionally ? "k" : ""}`] : [],
        v.retry
            ? ["--retry", v.retry.toString()] : [],
        v.unsafe_tactic_exec
            ? ["--unsafe_tactic_exec"] : [],
    ].flat()
}

export function longestPrefix<T>(lists: T[][]): T[] {
    if (!lists.length)
        throw "[longestPrefix] expected a non-empty list as parameter";
    let prefix = lists[0].slice(
        0, lists.map(l => l.length).reduce((x, y) => Math.min(x, y))
    );
    while (prefix.length) {
        if (lists.every(l => prefix.every((segment, i) => l[i] == segment)))
            return prefix;
        prefix.pop();
    };
    return [];
};



export let withTempDir = async <T>(fun: (path: string) => Promise<T>): Promise<T> =>
    await withDir(async ({ path }) => {
        let result = await fun(path);
        // FIXME: [withDir] tries to remove [path], but not recursively
        // thus here I remove everything recursively
        if (await pathExists(path))
            await remove(path);
        await mkdirp(path);
        return result;
    });

export let withGitRepo = (gitUri: string, rev?: string) =>
    async <T>(fun: (path: string, git: SimpleGit) => Promise<T>): Promise<T> =>
        await withTempDir(async path => {
            let git = simpleGit(path);
            // TODO: handle errors nicely here
            await git.clone(gitUri, path);
            if (rev !== undefined)
                await git.reset(["--hard", rev]);
            return await fun(path, git);
        });

function ensureDefined<T>(x: T | undefined, error: Error): T {
    if (x === undefined)
        throw error;
    return x;
}

export let ocamlBinariesOfEnv = async (): Promise<ocamlBinaries> => {
    let whichE = async (binName: string): Promise<absolutePath> => {
        try { return which(binName) }
        catch (details) { throw new BinaryResolutionError({ kind: 'missingBinary', binName, path: process.env.PATH || '', caller: 'ocamlBinariesOfEnv', details }) }
    };
    return {
        OCAMLPATH: ensureDefined(process.env.OCAMLPATH, new BinaryResolutionError({ kind: 'envVarNotFound', varName: 'OCAMLPATH', env: process.env, caller: 'ocamlBinariesOfEnv' })),
        gcc: await whichE('gcc'),
        ocamlbin: path.resolve(await whichE('ocamlc') + '/..'),
        ocamlbuild: await whichE('ocamlbuild'),
        ocamlfind: await whichE('ocamlfind')
    };
};

export let verificationBinariesOfEnv = async (): Promise<verificationBinaries["Resolved"]> => {
    let whichE = async (binName: string): Promise<absolutePath> => {
        try { return which(binName) }
        catch (details) { throw new BinaryResolutionError({ kind: 'missingBinary', binName, path: process.env.PATH || '', caller: 'verificationBinariesOfEnv', details }) }
    };
    return {
        fstar_binary: await whichE('fstar.exe'),
        ocamlBinaries: await ocamlBinariesOfEnv(),
        z3_binary: await whichE('z3')
    };
}

export let resolveVerificationBinariesWithEnv =
    async ({ fstar_binary, z3_binary }: verificationBinaries["Unresolved"]):
        Promise<verificationBinaries["Resolved"]> => {
        if (fstar_binary || z3_binary)
            throw Error("[resolveVerificationBinariesWithEnv] Constraint resolution for F* or Z3 is not implemented");
        return await verificationBinariesOfEnv();
    };

export let resolveCmxsFilename = async (pkg: ocamlPackagePlugin): Promise<string> => {
    let r = (await readdir(pkg)).find(f => f.endsWith(".cmxs"));
    if (!r)
        throw new Error("[resolveCmxsFilename] no cmxs file found in OCaml plugin package located at " + pkg);
    return basename(r, '.cmxs');
};


