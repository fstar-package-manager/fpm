"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectPluginsOfLibrary = exports.PluginOfLibrary = exports.ExtractTarget = exports.CollectCheckedOfLibrary = exports.VerifyLibrary = exports.CollectModulesOfLibrary = void 0;
const VerifyModules_1 = require("../module-level/VerifyModules");
require("buffer");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const Config_1 = require("../utils/Config");
const ExtractModules_1 = require("../module-level/ExtractModules");
const OCamlPluginBuilder_1 = require("../module-level/OCamlPluginBuilder");
const Utils_1 = require("../utils/Utils");
const FStarCli_1 = require("../utils/FStarCli");
const MODULE_ISOLATION = true;
let CollectModulesOfLibrary = (config, log) => async ({ lib, excludeSelf }) => {
    let modules = [
        ...(await Promise.all(lib.dependencies.map(lib => (0, exports.CollectModulesOfLibrary)(config, log)({ lib })))).flat(),
        ...(excludeSelf ? [] : lib.modules)
    ];
    return MODULE_ISOLATION ? await (0, Utils_1.readdir_fullpaths)((await (0, FStarCli_1.gatherFiles)(modules)).path) : modules;
};
exports.CollectModulesOfLibrary = CollectModulesOfLibrary;
let mkCollector = (f) => (config, log) => {
    let collector = async (opts) => [
        ...(opts.excludeSelf ? [] : [await f(config, log)(opts)]),
        ...(await Promise.all(opts.lib.dependencies.map(lib => {
            return collector(Object.assign(Object.assign({}, opts), { lib, excludeSelf: false }));
        }))).flat()
    ].filter((x) => x !== undefined);
    return collector;
};
let cachify = async (log, cache_dir, f) => {
    if (!await (0, fs_extra_1.pathExists)(cache_dir))
        await (0, Utils_1.withTempDir)(async (path) => {
            await f(path);
            await (0, fs_extra_1.move)(path, cache_dir);
        });
    return cache_dir;
};
let VerifyLibrary = (config, log) => async ({ lib, verificationBinaries, ocamlBinaries }) => {
    let cache = (await (0, Config_1.computeLibMetadata)(config, lib)).cacheDir;
    await (0, fs_extra_1.mkdirp)(cache);
    return await cachify(log, cache + '/checked' + (lib.verificationOptions.lax ? '_lax' : ''), async (path) => {
        let checked = await (0, exports.CollectCheckedOfLibrary)(config, log)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true });
        debugger;
        await (0, VerifyModules_1.VerifyModules)(log)({
            includePaths: [
                ...new Set((await (0, exports.CollectModulesOfLibrary)(config, log)({ lib, excludeSelf: true })).map(d => (0, path_1.dirname)(d))),
                ...checked,
            ],
            modules: lib.modules,
            plugins: await (0, exports.CollectPluginsOfLibrary)(config, log)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true }),
            verificationBinaries,
            verificationOptions: lib.verificationOptions
        }, path);
    });
};
exports.VerifyLibrary = VerifyLibrary;
exports.CollectCheckedOfLibrary = mkCollector(exports.VerifyLibrary);
let ExtractTarget = (config, log) => async ({ target, verificationBinaries, ocamlBinaries }) => {
    let { cacheDir: cache } = (await (0, Config_1.computeLibMetadata)(config, target.lib));
    await (0, fs_extra_1.mkdirp)(cache + '/extractions/');
    let actualCacheDir = cache + '/extractions/' + (0, Config_1.mkHash)(JSON.stringify(target));
    return await cachify(log, actualCacheDir, async (path) => {
        let { lib, opts: extractionOptions } = target;
        if (target.opts.lang !== "Plugin") {
            for (let e of await Promise.all(target.lib.dependencies.map(lib => (0, exports.ExtractTarget)(config, log)({ target: { lib, opts: extractionOptions }, verificationBinaries, ocamlBinaries }))))
                for (let f of await (0, Utils_1.readdir_fullpaths)(e))
                    await (0, fs_extra_1.symlink)((0, path_1.resolve)(f), (0, path_1.resolve)(path + '/' + (0, path_1.basename)(f)));
        }
        await (0, ExtractModules_1.ExtractModules)(log)({
            verificationBinaries,
            extractionOptions,
            includePaths: [
                ...await (0, exports.CollectCheckedOfLibrary)(config, log)({
                    verificationBinaries, ocamlBinaries, lib
                }),
                ...new Set((await (0, exports.CollectModulesOfLibrary)(config, log)({ lib, excludeSelf: true })).map(d => (0, path_1.dirname)(d))),
            ],
            modules: lib.modules,
            enableLaxMode: lib.verificationOptions.lax
        }, path);
    });
};
exports.ExtractTarget = ExtractTarget;
let PluginOfLibrary = (config, log) => async ({ lib, verificationBinaries, ocamlBinaries }) => {
    if (lib.plugin_ocaml_disable)
        return;
    let { cacheDir: cache, name: cmxsName } = (await (0, Config_1.computeLibMetadata)(config, lib));
    await (0, fs_extra_1.mkdirp)(cache);
    let extractionProduct = await (0, FStarCli_1.gatherFiles)([
        // The order is important: [plugin_ocaml_modules] have
        // precedence over extracted modules
        ...(lib.plugin_ocaml_modules || []),
        ...await (0, Utils_1.readdir_fullpaths)(await (0, exports.ExtractTarget)(config, log)({
            target: { lib, opts: { lang: 'Plugin' } },
            verificationBinaries, ocamlBinaries
            // enableLaxMode: lib.verificationOptions.lax
        }))
    ], true);
    let result = await cachify(log, cache + '/plugin', async (path) => {
        await (0, OCamlPluginBuilder_1.OCamlPluginBuilder)(log)({
            ocamlBinaries, cmxsName,
            ocamlPackages: await (0, exports.CollectPluginsOfLibrary)(config, log)({ lib, verificationBinaries, ocamlBinaries, excludeSelf: true }),
            extractionProduct: extractionProduct.path
        }, path);
    });
    await Promise.all((await (0, Utils_1.readdir_fullpaths)(extractionProduct.path)).map(p => (0, fs_extra_1.unlink)(p)));
    extractionProduct.cleanup();
    return result;
};
exports.PluginOfLibrary = PluginOfLibrary;
exports.CollectPluginsOfLibrary = mkCollector(exports.PluginOfLibrary);
//# sourceMappingURL=All.js.map