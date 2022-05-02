import * as types from "./../../types/types"
import "buffer"
import { mkdirp, readFile, writeFile, pathExists } from "fs-extra"
import * as path from "path"
import { longestPrefix, withGitRepo } from './../utils/Utils';
import { createHash } from 'crypto';
import chalk from 'chalk';

export type Config = {
    defaultPackageSet: string,
    fstarpkgs_rev?: string,
    cachePath: string
};

let prefixesOf = <T>(l: T[]): T[][] =>
    [...Array(l.length + 1).keys()].map((_, i) => l.slice(0, i));

export const mkDefaultConfig = async (): Promise<Config> => {
    let cwd = process.cwd();
    let parents = prefixesOf(cwd.split(path.sep)).map(x => [...x, '.fpm'].join(path.sep));
    let cachePath = cwd + '/.fpm';
    for (let parent of parents)
        if (await pathExists(parent)) {
            cachePath = parent;
            break;
        }
    return {
        defaultPackageSet: "git@github.com:fstar-package-manager/fstarpkgs.git",
        cachePath
    }
};

export const PACKAGE_FILE_NAME = 'fstar.json'

export const cachePathOf = {
    packageSetJSON: async (config: Config): Promise<string> =>
        await cachePathOf.fstarpkgs(config) + '/fstarpkgs.json',
    package: async (config: Config, packageName: string): Promise<string> =>
        await cachePathOf.fstarpkgs(config) + '/' + packageName,
    fstarpkgs: async ({ fstarpkgs_rev, cachePath }: Config): Promise<string> => {
        if (!fstarpkgs_rev)
            throw "[cachePathOf.fstarpkgs] called with undefined [fstarpkgs_rev] in config."
        let path = cachePath + '/fstarpkgs/' + fstarpkgs_rev + "/";
        await mkdirp(path);
        return path;
    },
};

export async function unresolvedPackageSetOfFlakeLock(flakeLock: any): Promise<types.packageSet["Unresolved"]> {
    let nodes = flakeLock.nodes;
    let root = nodes[flakeLock.root];
    let blacklist = ['fpm'];
    let inputs: { [key: string]: string } = root.inputs;
    return Object.fromEntries(
        Object.keys(inputs)
            .filter(i => !blacklist.includes(i))
            .map(i => [i, nodes[inputs[i]]])
            .filter(([_, { flake }]) => !flake)
            .map(([i, { locked }]): [string, types.gitReference] => [i, {
                rev: locked.rev,
                ref: locked.ref,
                // TODO better parsing / more support for different URIs
                subpath: (locked.url.match(/\?dir=(.*)$/) || [])[1] || "/",
                gitUri: locked.url.split('?dir=')[0]
            }])
    );
};

export let getUnresolvedPackageSet = async (config: Config): Promise<types.packageSet["Unresolved"]> => {
    console.warn('TODO: this is broken, this downloads all the time');
    config.fstarpkgs_rev = 'b04ec80c6f5ffc75822d29683d91ae16cf5d75d2'; // TODO hardcocded
    if (config.fstarpkgs_rev !== undefined && await pathExists(await cachePathOf.packageSetJSON(config))) {
        return await JSON.parse(await readFile(await cachePathOf.packageSetJSON(config), 'utf8')) as any;
    } else {
        return await withGitRepo(config.defaultPackageSet, config.fstarpkgs_rev)(async (path, git) => {
            config.fstarpkgs_rev = config.fstarpkgs_rev || await git.revparse("HEAD");
            let pkgs = await unresolvedPackageSetOfFlakeLock(
                JSON.parse(await readFile(`${path}/flake.lock`, 'utf8'))
            );
            await writeFile(
                await cachePathOf.packageSetJSON(config),
                JSON.stringify(pkgs, null, 4)
            );
            return pkgs as types.packageSet["Unresolved"];
        });
    }
};

// TODO: drop this, figure out something better
export let getUnresolvedPackageSet_with_overrides = async (config: Config): Promise<types.packageSet["Unresolved"]> => {
    let filename = "./ps_overrides.json";
    let overrides: types.packageSet["Unresolved"] = await pathExists("./ps_overrides.json") ? JSON.parse(await readFile(filename, 'utf8')) : {};
    return { ...await getUnresolvedPackageSet(config), ...overrides };
};

export let mkHash = (s: string) => createHash('sha256').update(s).digest('hex');

export let computeLibMetadata = async (config: Config, lib: types.library["Resolved"]): Promise<{
    cacheDir: string,
    name: string
}> => {
    let module_root = longestPrefix(lib.modules.map(m => m.split('/'))).join('/');
    let fstarpkgs_path = await cachePathOf.fstarpkgs(config);
    let meta;
    if (module_root.startsWith(fstarpkgs_path)) {
        let segments_leftover = module_root.slice(fstarpkgs_path.length).split('/').filter(x => x);
        if (!segments_leftover.length)
            throw new Error(`The library consisting of modules ${lib.modules.map(m => chalk.bold(path.basename(m))).join(', ')} is malformed. 
All of its modules should live in exactly one root directory right under ${fstarpkgs_path}.`);
        let name = segments_leftover[0];
        meta = { cacheDir: fstarpkgs_path + '/' + name + '/cache', name };
    } else {
        // log(Level.WARNING, `Local library ${module_root}: `)
        // console.warn('[computeLibMetadata] Experimental cache directory for local libraries used by lib [?]');
        let hash = mkHash(JSON.stringify([
            lib,
            await Promise.all(lib.modules.map(p => readFile(p, 'utf8')).map(async f => mkHash(await f)))
        ]));
        let name = path.basename(module_root);
        // console.log({ name, hash, lib });
        // if (name == 'ulib') throw "xxx";
        let cache = config.cachePath + '/_local_librairies/' + name + '-' + hash.slice(0, 16) + '/cache';
        // console.warn('[computeLibMetadata] (changes are deteted a bit loosely, removing [${path}] might help if a build fails)');
        // console.log({ cachePath: config.cachePath, path })
        meta = {
            cacheDir: cache, name: name + '-' + hash.slice(0, 6)
        };
    }
    return meta;
};

