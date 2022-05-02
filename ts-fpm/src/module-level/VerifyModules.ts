import { checkedFiles, includePath, fstarModule, moduleName, ocamlPackagePlugin } from "../../types/types"
import * as api from "../../types/api"

import { copy, pathExists, readdir, stat } from "fs-extra"
import { basename, dirname } from "path"
import { dir } from "tmp-promise"
import { fstar } from "../utils/FStarCli"
import { depTree } from "./DepTree"
import { duplicates, readdir_fullpaths, is_fstar_module, verificationOptions_to_flags, withDestination, resolveCmxsFilename } from "../utils/Utils"
import { VerifyModulesError } from "../utils/Exn"
import chalk from "chalk"
import { Level, logCAFn, Logger } from "../utils/Log"

let EnsureNoDuplicatedModules = logCAFn(
    Level.NOTICE, "Ensuring no module is duplicated",
    (log: Logger) => async (
        includePaths: includePath[],
        modules: fstarModule[],
        plugins: ocamlPackagePlugin[]
    ): Promise<void> => {
        {
            let duplicated = duplicates([
                ...(await Promise.all([...includePaths, ...plugins].map(path => {
                    try {
                        return readdir_fullpaths(path)
                    } catch (e) {
                        throw new VerifyModulesError({ kind: 'includePathNotFound', path });
                    }
                })))
                    .flat().filter(is_fstar_module),
                ...modules
            ], basename);
            if (duplicated.size)
                throw new VerifyModulesError({ kind: 'duplicatedModules', duplicated });
        }
    });

export let VerifyModules = logCAFn(Level.INFO, "Verifying set of modules",
    (log: Logger): withDestination<api.VerifyModules> => async (
        {
            includePaths,
            modules,
            plugins,
            verificationBinaries,
            verificationOptions
        },
        destination?: string
    ): Promise<checkedFiles> => {
        await EnsureNoDuplicatedModules(log)(includePaths, modules, plugins);

        let all_includes: string[] = [...new Set([...[...modules].map(x => dirname(x)), ...includePaths, ...plugins])].filter(x => x);

        let dest: string = destination || (await dir({ keep: true })).path;

        let module_names = modules.map(n => basename(n));
        let deps = await depTree(log)({
            bin: verificationBinaries,
            include: all_includes
        }, ...module_names);

        let jobs: Map<moduleName, Promise<void>> = new Map();

        let checked_suffix = verificationOptions.lax ? '.checked.lax' : '.checked';

        let control_checked_files = async (mod: string, err_details: string) => {
            let checked_basename = mod + checked_suffix;
            let checked = dest + '/' + checked_basename;
            try { await stat(checked) } catch (e) {
                let existing_checked_path: string | undefined;
                for (let ipath of all_includes) {
                    let existing_checked_path0 = ipath + '/' + checked_basename;
                    try { await stat(existing_checked_path0) }
                    catch (e) { continue; }
                    existing_checked_path = existing_checked_path0;
                    break;
                }
                if (existing_checked_path !== undefined) {
                    log(Level.WARNING, `Checked file ${existing_checked_path} exists already and was in the include paths. Copying to destination dir.`).done();
                    await copy(existing_checked_path, checked);
                } else {
                    log(Level.ERROR, `Checked file for module ${mod} was not generated!`).done();
                    console.log(err_details);
                    throw e;
                }
            }
        };

        let make_checked = async (mod: string) => {
            if (!module_names.includes(mod)) {
                if (!(await Promise.all(includePaths.map(p => pathExists(p + '/' + mod + checked_suffix)))).find(x => x))
                    throw `Missing checked file for module [${mod}]`; // TODO better reporting
                return;
            }
            let cached = jobs.get(mod);
            if (cached !== undefined)
                return await cached;
            let p = (async () => {
                await Promise.all([...deps[mod]].map(make_checked));
                let logs = await fstar("Verifying " + mod)(log)(
                    {
                        bin: verificationBinaries,
                        include: all_includes,
                        load_cmxs: await Promise.all(plugins.map(resolveCmxsFilename))
                    },
                    ...verificationOptions_to_flags(verificationOptions),
                    "--cache_checked_modules",
                    "--cache_dir", dest,
                    "--warn_error", "-321",
                    // "--admit_smt_queries", "true",
                    mod
                );
                await control_checked_files(mod, logs as any);
            })();
            jobs.set(mod, p);
            return await p;
        }

        await Promise.all(module_names.map(make_checked));

        return dest;
    });

