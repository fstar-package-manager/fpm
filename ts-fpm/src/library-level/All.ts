import { VerifyModules } from "../module-level/VerifyModules"
import * as api from "../../types/api"
import "buffer"
import { mkdirp, move, pathExists } from "fs-extra"
import * as path from "path"

import { Config, computeLibMetadata } from '../utils/Config'
import { CmxsOfModules } from '../module-level/CmxsOfModules'
import { ExtractModules } from "../module-level/ExtractModules"


export let IncludePathsOfLibrary_excludingSelf = (config: Config): api.IncludePathsOfLibrary =>
    async ({ lib, verificationBinaries, ocamlBinaries }) =>
        (await Promise.all(
            lib.dependencies.map(lib => IncludePathsOfLibrary(config)({ lib, verificationBinaries, ocamlBinaries }))
        )).flat();

export let IncludePathsOfLibrary = (config: Config): api.IncludePathsOfLibrary =>
    async ({ lib, verificationBinaries, ocamlBinaries }) =>
        [
            await (VerifyLibrary(config)({ lib, verificationBinaries, ocamlBinaries })),
            ...(ocamlBinaries ? [
                path.resolve((await (CmxsOfLibrary(config)({ lib, verificationBinaries, ocamlBinaries }))) + "/..")
            ] : []),
            ...(await Promise.all(
                lib.dependencies.map(lib => IncludePathsOfLibrary(config)({ lib, verificationBinaries, ocamlBinaries }))
            )).flat()
        ];


export let ExtractTarget = (config: Config): api.ExtractTarget =>
    async ({ target, verificationBinaries, ocamlBinaries }) => {
        let { lib, opts: extractionOptions } = target;
        ExtractModules({
            verificationBinaries,
            extractionOptions,
            includePaths: await IncludePathsOfLibrary(config)({
                verificationBinaries,
                ocamlBinaries,
                lib
            }),
            modules: lib.modules
        });
        return {} as any;
    }



export let CmxsOfLibrary = (config: Config): api.CmxsOfLibrary =>
    async ({ lib, verificationBinaries, ocamlBinaries }) => {
        let { cacheDir: cache, name: cmxsName } = (await computeLibMetadata(config, lib));
        await mkdirp(cache);
        let plugin_cache_dir = cache + '/plugin';
        if (!(await pathExists(plugin_cache_dir))) {
            let plugin = await CmxsOfModules({
                modules: lib.modules,
                verificationBinaries,
                includePaths: (await Promise.all(
                    lib.dependencies.map(lib => IncludePathsOfLibrary(config)({ lib, verificationBinaries, ocamlBinaries }))
                )).flat(),
                ocamlBinaries,
                cmxsName
            });
            await move(plugin, plugin_cache_dir);
        };
        return plugin_cache_dir + '/' + cmxsName + '.cmxs';
    };

export let CmxsFilesOfLibrary = (config: Config): api.CmxsFilesOfLibrary =>
    async opts => [
        await CmxsOfLibrary(config)(opts),
        ...(await Promise.all(opts.lib.dependencies.map(lib => CmxsFilesOfLibrary(config)({ ...opts, lib })))).flat()
    ];

export let VerifyLibrary = (config: Config): api.VerifyLibrary =>
    async ({ lib, verificationBinaries, ocamlBinaries }) => {
        let cache = (await computeLibMetadata(config, lib)).cacheDir;
        await mkdirp(cache);
        let checked_cache_dir = cache + '/checked';
        if (!(await pathExists(checked_cache_dir))) {
            let includePaths = (await Promise.all(
                lib.dependencies.map(lib => IncludePathsOfLibrary(config)({ lib, verificationBinaries, ocamlBinaries }))
            )).flat();
            console.log({ lib, includePaths });
            let checked = await VerifyModules({
                includePaths,
                modules: lib.modules,
                plugins: ocamlBinaries ? (await Promise.all(
                    lib.dependencies.map(lib => CmxsFilesOfLibrary(config)({ lib, verificationBinaries, ocamlBinaries }))
                )).flat() : [],
                verificationBinaries,
                verificationOptions: lib.verificationOptions
            })
            await move(checked, checked_cache_dir);
        }
        return checked_cache_dir;
    };
