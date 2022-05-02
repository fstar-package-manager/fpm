import { VerifyModules } from "../module-level/VerifyModules"
import * as api from "../../types/api"
import * as types from "../../types/types"
import "buffer"
import { mkdirp, move, pathExists, symlink, unlink } from "fs-extra"
import * as path from "path"
import { dirname, resolve, basename } from "path"

import { Config, computeLibMetadata, mkHash } from '../utils/Config'
import { ExtractModules } from "../module-level/ExtractModules"
import { OCamlPluginBuilder } from "../module-level/OCamlPluginBuilder"
import { readdir_fullpaths, withTempDir } from "../utils/Utils"
import { Logger } from "../utils/Log"
import { dir, DirectoryResult } from "tmp-promise"
import { gatherFiles } from "../utils/FStarCli"


const MODULE_ISOLATION = true;

export let CollectModulesOfLibrary = (config: Config, log: Logger): api.CollectModulesOfLibrary =>
    async ({ lib, excludeSelf }) => {
        let modules = [
            ...(await Promise.all(lib.dependencies.map(lib => CollectModulesOfLibrary(config, log)({ lib })))).flat(),
            ...(excludeSelf ? [] : lib.modules)
        ];
        return MODULE_ISOLATION ? await readdir_fullpaths((await gatherFiles(modules)).path) : modules;
    }


let mkCollector = <R, O extends { lib: types.library["Resolved"], excludeSelf?: boolean }>(
    f: (config: Config, log: Logger) => (opts: O) => Promise<R | undefined>
) => (config: Config, log: Logger): ((opts: O) => Promise<R[]>) => {
    let collector = async (opts: O): Promise<R[]> => [
        ...(opts.excludeSelf ? [] : [await f(config, log)(opts)]),
        ...(await Promise.all(
            opts.lib.dependencies.map(lib => {
                return collector({ ...opts, lib, excludeSelf: false });
            })
        )).flat()
    ].filter((x: R | undefined): x is R => x !== undefined);
    return collector;
}

let cachify = async (log: Logger, cache_dir: string, f: (path: string) => Promise<void>): Promise<string> => {
    if (!await pathExists(cache_dir))
        await withTempDir(async path => {
            await f(path);
            await move(path, cache_dir);
        });
    return cache_dir;
};

export let VerifyLibrary = (config: Config, log: Logger): api.VerifyLibrary =>
    async ({ lib, verificationBinaries, ocamlBinaries }) => {
        let cache = (await computeLibMetadata(config, lib)).cacheDir;
        await mkdirp(cache);
        return await cachify(log,
            cache + '/checked' + (lib.verificationOptions.lax ? '_lax' : ''),
            async path => {
                let checked = await CollectCheckedOfLibrary(config, log)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true });
                debugger;
                await VerifyModules(log)({
                    includePaths: [
                        ...new Set((await CollectModulesOfLibrary(config, log)({ lib, excludeSelf: true })).map(d => dirname(d))),
                        ...checked,
                    ],
                    modules: lib.modules,
                    plugins: await CollectPluginsOfLibrary(config, log)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true }),
                    verificationBinaries,
                    verificationOptions: lib.verificationOptions
                }, path);
            }
        )
    };

export let CollectCheckedOfLibrary: (config: Config, log: Logger) => api.CollectCheckedOfLibrary
    = mkCollector(VerifyLibrary)

export let ExtractTarget = (config: Config, log: Logger): api.ExtractTarget =>
    async ({ target, verificationBinaries, ocamlBinaries }) => {
        let { cacheDir: cache } = (await computeLibMetadata(config, target.lib));
        await mkdirp(cache + '/extractions/');
        let actualCacheDir = cache + '/extractions/' + mkHash(JSON.stringify(target));
        return await cachify(log,
            actualCacheDir
            , async path => {
                let { lib, opts: extractionOptions } = target;
                if (target.opts.lang !== "Plugin") {
                    for (let e of await Promise.all(target.lib.dependencies.map(lib =>
                        ExtractTarget(config, log)({ target: { lib, opts: extractionOptions }, verificationBinaries, ocamlBinaries })
                    )))
                        for (let f of await readdir_fullpaths(e))
                            await symlink(resolve(f), resolve(path + '/' + basename(f)))
                }
                await ExtractModules(log)({
                    verificationBinaries,
                    extractionOptions,
                    includePaths: [
                        ...await CollectCheckedOfLibrary(config, log)({
                            verificationBinaries, ocamlBinaries, lib
                        }),
                        ...new Set((await CollectModulesOfLibrary(config, log)({ lib, excludeSelf: true })).map(d => dirname(d))),
                    ],
                    modules: lib.modules,
                    enableLaxMode: lib.verificationOptions.lax
                }, path);
            });
    }

export let PluginOfLibrary = (config: Config, log: Logger): api.PluginOfLibrary =>
    async ({ lib, verificationBinaries, ocamlBinaries }) => {
        if (lib.plugin_ocaml_disable)
            return;
        let { cacheDir: cache, name: cmxsName } = (await computeLibMetadata(config, lib));
        await mkdirp(cache);
        let extractionProduct = await gatherFiles([
            // The order is important: [plugin_ocaml_modules] have
            // precedence over extracted modules
            ...(lib.plugin_ocaml_modules || []),//.filter(x => EXCLUDE.includes(path.basename(x))),
            ...await readdir_fullpaths(await ExtractTarget(config, log)({
                target: { lib, opts: { lang: 'Plugin' } },
                verificationBinaries, ocamlBinaries
                // enableLaxMode: lib.verificationOptions.lax
            }))
        ], true);
        let result = await cachify(log, cache + '/plugin', async path => {
            await OCamlPluginBuilder(log)({
                ocamlBinaries, cmxsName,
                ocamlPackages: await CollectPluginsOfLibrary(config, log)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true }),
                extractionProduct: extractionProduct.path
            }, path);
        });
        await Promise.all((await readdir_fullpaths(extractionProduct.path)).map(p => unlink(p)));
        extractionProduct.cleanup();
        return result;
    };

export let CollectPluginsOfLibrary: (config: Config, log: Logger) => api.CollectPluginsOfLibrary
    = mkCollector(PluginOfLibrary)

