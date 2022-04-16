import { absolutePath, checkedFiles } from "../../types/types"
import * as api from "../../types/api"

import { copy, stat } from "fs-extra"
import { basename, dirname } from "path"
import { dir } from "tmp-promise"
import { fstar } from "../utils/FStarCli"
import { sort_by_dependencies } from "./DepTree"
import { duplicates, readdir_fullpaths, is_fstar_module, verificationOptions_to_flags, withDestination } from "../utils/Utils"
import { VerifyModulesError } from "../utils/Exn"

export let VerifyModules: withDestination<api.VerifyModules> = async (
    {
        includePaths,
        modules,
        plugins,
        verificationBinaries,
        verificationOptions
    },
    destination?: string
): Promise<checkedFiles> => {
    {
        let duplicated = duplicates([
            ...(await Promise.all(includePaths.map(path => {
                try {
                    return readdir_fullpaths(path)
                } catch (e) {
                    throw new VerifyModulesError({ kind: 'includePathNotFound', path });
                }
            })))
                .flat().filter(is_fstar_module),
            ...modules, ...plugins
        ], basename);
        if (duplicated.size)
            throw new VerifyModulesError({ kind: 'duplicatedModules', duplicated });
    }

    let all_includes: string[] = [...new Set([...[...modules, ...plugins].map(x => dirname(x)), ...includePaths])].filter(x => x);
    let module_names = await sort_by_dependencies({
        bin: verificationBinaries,
        include: all_includes
    }, ...modules.map(n => basename(n)));

    let dest: string = destination || (await dir({ keep: true })).path;
    let make_checked = (mod: string) => fstar(
        {
            bin: verificationBinaries,
            include: all_includes,
            load_cmxs: plugins.map(n => basename(n, '.cmxs'))
        },
        ...verificationOptions_to_flags(verificationOptions),
        "--cache_checked_modules",
        "--cache_dir", dest,
        "--warn_error", "-321",
        mod
    );

    for (let mod of module_names) {
        await make_checked(mod);
        let checked_basename = mod + '.checked';
        let checked = dest + '/' + checked_basename;
        try { await stat(checked) } catch (e) {
            let path = all_includes.find(async path => {
                try { await stat(path + '/' + checked_basename) }
                catch (e) { return false }
                return true;
            });
            if (path !== undefined) {
                console.warn(`The include path [${path}] contains already a checked file for the module ${mod}. Copying to destination dir.`);
                await copy(path, checked);
            } else {
                console.error(`Checked file for module ${mod} was not generated!`);
                throw e;
            }
        }
    }

    return dest;
}

