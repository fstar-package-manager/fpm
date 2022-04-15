import {
    verificationOptions, absolutePath, fuel, extractionOptions,
    ocamlBinaries, verificationBinaries
} from "./../../types/types"

import { symlink, readdir, remove, mkdirp } from "fs-extra"
import { basename } from "path"
import { dir } from "tmp-promise"
import * as child_process from "child_process"
import { promisify } from "util"
import { withDir } from "tmp-promise"
import simpleGit, { SimpleGit } from 'simple-git';

import which from "which"
import path from "path"

export type withDestination<T extends ((x: any) => any)> = (x: Parameters<T>[0], dest?: string) => ReturnType<T>

export type UnionToIntersection<T> =
    (T extends any ? (x: T) => any : never) extends
    (x: infer R) => any ? R : never

let execFile_ = promisify(child_process.execFile);
export async function execFile(
    file: Parameters<typeof execFile_>[0],
    args: Parameters<typeof execFile_>[1],
    options: Parameters<typeof execFile_>[2],
    quiet?: true
): Promise<{ stderr: string | Buffer, stdout: string | Buffer }> {
    let p = execFile_(file, args, options);
    if (quiet) {
        p.child.stdout?.pipe(process.stdout);
        p.child.stderr?.pipe(process.stderr);
    }
    return await p;
}

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
    console.log('[readdir_fullpaths] ' + p);
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


export let withGitRepo = (gitUri: string, rev?: string) =>
    async <T>(fun: (path: string, git: SimpleGit) => Promise<T>): Promise<T> =>
        await withDir(async ({ path }) => {
            let git = simpleGit(path);
            // TODO: handle errors nicely here
            await git.clone(gitUri, path);
            if (rev !== undefined)
                await git.reset(["--hard", rev]);
            let result = await fun(path, git);
            // FIXME: [withDir] tries to remove [path], but not recursively
            // thus here I remove everything recursively
            await remove(path); await mkdirp(path);
            return result;
        });



class BinaryResolutionError extends Error {
    constructor(public cause: (
        { kind: 'envVarNotFound', varName: string, env: NodeJS.ProcessEnv, caller: string } |
        { kind: 'missingBinary', binName: string, path: string, caller: string, details: unknown }
    )) {
        super();
    }
    get message() {
        console.log(this.cause);
        return "[BinaryResolutionError.message] TODO";
    }
}


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

