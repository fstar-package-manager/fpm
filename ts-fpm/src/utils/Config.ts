import { VerifyModules } from "./../module-level/VerifyModules"
import { OCamlCmxsBuilder } from "./../module-level/OCamlCmxsBuilder"
import { ExtractModules } from "./../module-level/ExtractModules"
import * as types from "./../../types/types"
import * as api from "./../../types/api"
import "buffer"
import { mkdirp, readFile, writeFile, move, remove, pathExists } from "fs-extra"
import * as path from "path"
import { withDir } from "tmp-promise"
import schemaDefinition from '../../types/types-schema.json';
import simpleGit, { CleanOptions, SimpleGit, CheckRepoActions, ResetMode } from 'simple-git';
import { longestPrefix, withGitRepo } from './../utils/Utils';
import { createHash } from 'crypto';
import which from 'which';





export type Config = {
    defaultPackageSet: string,
    fstarpkgs_rev?: string,
    cachePath: string
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

export let computeLibMetadata = async (config: Config, lib: types.library["Resolved"]): Promise<{
    cacheDir: string,
    name: string
}> => {
    let path = longestPrefix(lib.modules.map(m => m.split('/'))).join('/');
    let fstarpkgs_path = await cachePathOf.fstarpkgs(config);
    if (path.startsWith(fstarpkgs_path)) {
        let segments_leftover = path.slice(fstarpkgs_path.length).split('/').filter(x => x);
        if (!segments_leftover.length) {
            console.error(lib);
            throw new Error('[computeLibMetadata] Bad location for modules for library:');
        }
        let name = segments_leftover[0];
        return { cacheDir: fstarpkgs_path + '/' + name + '/cache', name };
    } else {
        let mkHash = (s: string) => createHash('sha256').update(s).digest('hex');
        console.warn('[computeLibMetadata] Experimental cache directory for local libraries used by lib ', lib);
        let hash = mkHash(JSON.stringify([
            lib,
            await Promise.all(lib.modules.map(p => readFile(p, 'utf8')).map(async f => mkHash(await f)))
        ]));
        let cache = config.cachePath + '/_local_librairies/' + hash + '/cache';
        console.warn('[computeLibMetadata] (changes are deteted a bit loosely, removing [${path}] might help if a build fails)');
        return { cacheDir: path, name: (config.cachePath.split('/').pop() || 'unknown') + '-' + hash.slice(0, 6) };
    }
};

