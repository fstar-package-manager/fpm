"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyModules = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const FStarCli_1 = require("../utils/FStarCli");
const DepTree_1 = require("./DepTree");
const Utils_1 = require("../utils/Utils");
const Exn_1 = require("../utils/Exn");
const Log_1 = require("../utils/Log");
let EnsureNoDuplicatedModules = (0, Log_1.logCAFn)(Log_1.Level.NOTICE, "Ensuring no module is duplicated", (log) => async (includePaths, modules, plugins) => {
    {
        let duplicated = (0, Utils_1.duplicates)([
            ...(await Promise.all([...includePaths, ...plugins].map(path => {
                try {
                    return (0, Utils_1.readdir_fullpaths)(path);
                }
                catch (e) {
                    throw new Exn_1.VerifyModulesError({ kind: 'includePathNotFound', path });
                }
            })))
                .flat().filter(Utils_1.is_fstar_module),
            ...modules
        ], path_1.basename);
        if (duplicated.size)
            throw new Exn_1.VerifyModulesError({ kind: 'duplicatedModules', duplicated });
    }
});
exports.VerifyModules = (0, Log_1.logCAFn)(Log_1.Level.INFO, "Verifying set of modules", (log) => async ({ includePaths, modules, plugins, verificationBinaries, verificationOptions }, destination) => {
    await EnsureNoDuplicatedModules(log)(includePaths, modules, plugins);
    let all_includes = [...new Set([...[...modules].map(x => (0, path_1.dirname)(x)), ...includePaths, ...plugins])].filter(x => x);
    let dest = destination || (await (0, tmp_promise_1.dir)({ keep: true })).path;
    let module_names = modules.map(n => (0, path_1.basename)(n));
    let deps = await (0, DepTree_1.depTree)(log)({
        bin: verificationBinaries,
        include: all_includes
    }, ...module_names);
    let jobs = new Map();
    let checked_suffix = verificationOptions.lax ? '.checked.lax' : '.checked';
    let control_checked_files = async (mod, err_details) => {
        let checked_basename = mod + checked_suffix;
        let checked = dest + '/' + checked_basename;
        try {
            await (0, fs_extra_1.stat)(checked);
        }
        catch (e) {
            let existing_checked_path;
            for (let ipath of all_includes) {
                let existing_checked_path0 = ipath + '/' + checked_basename;
                try {
                    await (0, fs_extra_1.stat)(existing_checked_path0);
                }
                catch (e) {
                    continue;
                }
                existing_checked_path = existing_checked_path0;
                break;
            }
            if (existing_checked_path !== undefined) {
                log(Log_1.Level.WARNING, `Checked file ${existing_checked_path} exists already and was in the include paths. Copying to destination dir.`).done();
                await (0, fs_extra_1.copy)(existing_checked_path, checked);
            }
            else {
                log(Log_1.Level.ERROR, `Checked file for module ${mod} was not generated!`).done();
                console.log(err_details);
                throw e;
            }
        }
    };
    let make_checked = async (mod) => {
        if (!module_names.includes(mod)) {
            if (!(await Promise.all(includePaths.map(p => (0, fs_extra_1.pathExists)(p + '/' + mod + checked_suffix)))).find(x => x))
                throw `Missing checked file for module [${mod}]`; // TODO better reporting
            return;
        }
        let cached = jobs.get(mod);
        if (cached !== undefined)
            return await cached;
        let p = (async () => {
            await Promise.all([...deps[mod]].map(make_checked));
            let logs = await (0, FStarCli_1.fstar)("Verifying " + mod)(log)({
                bin: verificationBinaries,
                include: all_includes,
                load_cmxs: await Promise.all(plugins.map(Utils_1.resolveCmxsFilename))
            }, ...(0, Utils_1.verificationOptions_to_flags)(verificationOptions), "--cache_checked_modules", "--cache_dir", dest, "--warn_error", "-321", 
            // "--admit_smt_queries", "true",
            mod);
            await control_checked_files(mod, logs);
        })();
        jobs.set(mod, p);
        return await p;
    };
    await Promise.all(module_names.map(make_checked));
    return dest;
});
//# sourceMappingURL=VerifyModules.js.map