import * as types from "../../types/types"
import { mkdirp, symlink, access, readdir } from "fs-extra"
import { basename, dirname } from "path"
import * as child_process from "child_process"
import { execFile } from "./Utils"
import { withDir } from "tmp-promise"

export let fstar = async (
    { bin, include, load_cmxs, quiet }:
        {
            bin: types.verificationBinaries["Resolved"],
            include?: string[],
            load_cmxs?: string[],
            quiet?: true
        },
    ...rest: string[]
): Promise<{
    error?: number,
    stdout: string | Buffer,
    stderr: string | Buffer
}> => {
    let mkFlag = (flag: string, value: string) => [`--${flag}`, value];
    let mkFlags = (flag: string, values: string[] = []) => values.map(value => mkFlag(flag, value)).flat();
    let flags = [
        ...mkFlags("include", include),
        ...mkFlags("load_cmxs", load_cmxs),
        // TODO respect !bin.z3
        ...(rest || [])
    ];
    console.log([bin.fstar_binary, ...flags].join(' '));
    return await execFile(
        bin.fstar_binary,
        flags,
        {},
        quiet
    );
};

