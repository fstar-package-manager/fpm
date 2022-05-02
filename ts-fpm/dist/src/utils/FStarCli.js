"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fstar = exports.gatherModules = exports.gatherFiles = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const Utils_1 = require("./Utils");
const tmp_promise_1 = require("tmp-promise");
const Log_1 = require("./Log");
let gatherFiles = async (files, ignoreDuplicates = false) => {
    let temp = await (0, tmp_promise_1.dir)({ keep: true });
    for (let file of files) {
        let destination = temp.path + '/' + (0, path_1.basename)(file);
        // console.log('before pathExists', { file, destination, res: await pathExists(destination) });
        if (await (0, fs_extra_1.pathExists)(destination)) {
            // console.log('pathExists', { file, destination });
            if (!ignoreDuplicates)
                throw new Error("[gatherFiles] was given a list of files with duplicates basenames");
        }
        else
            await (0, fs_extra_1.symlink)((0, path_1.resolve)(file), (0, path_1.resolve)(destination));
    }
    return temp;
};
exports.gatherFiles = gatherFiles;
let gatherModules = async (directories) => await (0, exports.gatherFiles)((await Promise.all(directories.map(dir => (0, Utils_1.readdir_fullpaths)(dir))))
    .flat()
    .filter(m => m.match(/[.](fsti?|cmxs|checked|checked[.]lax|hint)$/)));
exports.gatherModules = gatherModules;
// This is due to the dependency bug (TODO post issue)
const FSTAR_GATHER_MODULES = true;
let fstar = (msg) => (0, Log_1.logCAFn)(Log_1.Level.NOTICE, msg, log => async ({ bin, include, load_cmxs, quiet }, ...rest) => {
    let mkFlag = (flag, value) => [`--${flag}`, value];
    let mkFlags = (flag, values = []) => values.map(value => mkFlag(flag, value)).flat();
    let gatheredModules = (include === null || include === void 0 ? void 0 : include.length) === 1
        ? { path: include[0], cleanup: () => Promise.resolve() }
        : undefined;
    if (gatheredModules === undefined && FSTAR_GATHER_MODULES) {
        gatheredModules = await (0, exports.gatherModules)(include || []);
        let path = gatheredModules.path;
        let clean = gatheredModules.cleanup;
        gatheredModules.cleanup = async () => {
            for (let d of await (0, Utils_1.readdir_fullpaths)(path))
                await (0, fs_extra_1.unlink)(d);
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
    let r = await ((0, Utils_1.execFile)(log)(bin.fstar_binary, flags, Object.assign({}, (gatheredModules ? { cwd: gatheredModules.path } : {})), quiet));
    gatheredModules === null || gatheredModules === void 0 ? void 0 : gatheredModules.cleanup();
    return r;
});
exports.fstar = fstar;
//# sourceMappingURL=FStarCli.js.map