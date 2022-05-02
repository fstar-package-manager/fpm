import * as types from "../../types/types"
import { mkdirp, symlink, access, readdir, unlink, pathExists } from "fs-extra"
import { basename, dirname, resolve } from "path"
import * as child_process from "child_process"
import { execFile, readdir_fullpaths } from "./Utils"
import { dir, DirectoryResult, withDir } from "tmp-promise"
import { Level, logCAFn, Logger } from "./Log"

export let gatherFiles = async (files: string[], ignoreDuplicates = false): Promise<DirectoryResult> => {
    let temp = await dir({ keep: true });
    for (let file of files) {
        let destination = temp.path + '/' + basename(file);
        // console.log('before pathExists', { file, destination, res: await pathExists(destination) });
        if (await pathExists(destination)) {
            // console.log('pathExists', { file, destination });
            if (!ignoreDuplicates)
                throw new Error("[gatherFiles] was given a list of files with duplicates basenames");
        } else
            await symlink(resolve(file), resolve(destination));
    }
    return temp;
};
export let gatherModules = async (directories: string[]): Promise<DirectoryResult> =>
    await gatherFiles(
        (await Promise.all(directories.map(dir => readdir_fullpaths(dir))))
            .flat()
            .filter(m => m.match(/[.](fsti?|cmxs|checked|checked[.]lax|hint)$/))
    )

// This is due to the dependency bug (TODO post issue)
const FSTAR_GATHER_MODULES = true

export let fstar = (msg: string) => logCAFn(
    Level.NOTICE, msg,
    log => async (
        { bin, include, load_cmxs, quiet }:
            {
                bin: types.verificationBinaries["Resolved"],
                include?: string[],
                load_cmxs?: string[],
                quiet?: boolean
            },
        ...rest: string[]
    ): Promise<{
        error?: number,
        stdout: string | Buffer,
        stderr: string | Buffer
    }> => {
        let mkFlag = (flag: string, value: string) => [`--${flag}`, value];
        let mkFlags = (flag: string, values: string[] = []) => values.map(value => mkFlag(flag, value)).flat();
        let gatheredModules = include?.length === 1
            ? { path: include[0], cleanup: () => Promise.resolve() }
            : undefined;
        if (gatheredModules === undefined && FSTAR_GATHER_MODULES) {
            gatheredModules = await gatherModules(include || []);
            let path = gatheredModules.path;
            let clean = gatheredModules.cleanup;
            gatheredModules.cleanup = async () => {
                for (let d of await readdir_fullpaths(path))
                    await unlink(d);
                clean();
            };
        }
        // if (include?.length === 1)
        //     gatheredModules = { path: include[0], cleanup: () => Promise.resolve() };
        let flags = [
            '--no_load_fstartaclib',
            '--no_default_includes',
            ...mkFlags("include", gatheredModules ? ['.'] : include),
            ...mkFlags("load_cmxs", load_cmxs),
            // TODO respect bin.z3
            ...(rest || [])
        ];
        let r = await (execFile(log)(
            bin.fstar_binary,
            flags,
            {
                ...(gatheredModules ? { cwd: gatheredModules.path } : {})
            },
            quiet
        ));
        gatheredModules?.cleanup();
        return r;
    });

