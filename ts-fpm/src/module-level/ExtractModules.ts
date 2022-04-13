import * as api from "./../../types/api"

import { readdir, unlink } from "fs-extra"
import { basename, dirname } from "path"
import { dir } from "tmp-promise"
import { fstar } from "./../utils/FStarCli"
import { extractionOptions_to_flags, is_implem, withDestination } from "../utils/Utils"

export let ExtractModules: withDestination<api.ExtractModules> = async (
    {
        verificationBinaries,
        extractionOptions,
        includePaths,
        modules
    },
    destination?: string
) => {
    let all_includes: string[] = [...new Set([...modules.map(x => dirname(x)), ...includePaths])].filter(x => x);
    let dest = destination || (await dir({ keep: true })).path;

    let modules_ = modules.map(n => basename(n))
    modules_ = modules_.filter(m => !is_implem(m) || (is_implem(m) && !modules.includes(m + 'i')));

    let extract = async (...modules: string[]) => await fstar(
        {
            bin: verificationBinaries,
            include: all_includes,
        },
        "--odir", dest,
        ...extractionOptions_to_flags(extractionOptions),
        ...modules,
    );
    await extract(...modules_);
    await Promise.all(modules.filter(m => !modules_.includes(m)).map(m => extract(m)));

    let ocaml_names = new Set(modules.map(m => m.replace(/[.]fsti?$/, '').replace('.', '_')));
    for (let file of await readdir(dest)) {
        let mod = file.replace(/[.]ml$/, '').replace('.', '_');
        if (!ocaml_names.has(mod))
            await unlink(dest + '/' + file)
    }

    return dest;
}
