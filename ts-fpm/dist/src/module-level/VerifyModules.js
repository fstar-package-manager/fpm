"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyModules = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const FStarCli_1 = require("../utils/FStarCli");
const DepTree_1 = require("./DepTree");
const Utils_1 = require("../utils/Utils");
class VerifyModulesError extends Error {
    constructor(cause) {
        super();
        this.cause = cause;
    }
    get message() {
        return "[VerifyModulesError.message] TODO";
    }
}
let VerifyModules = ({ includePaths, modules, plugins, verificationBinaries, verificationOptions }, destination) => __awaiter(void 0, void 0, void 0, function* () {
    {
        let duplicated = (0, Utils_1.duplicates)([
            ...(yield Promise.all(includePaths.map(path => {
                try {
                    return (0, Utils_1.readdir_fullpaths)(path);
                }
                catch (e) {
                    throw new VerifyModulesError({ kind: 'includePathNotFound', path });
                }
            })))
                .flat().filter(Utils_1.is_fstar_module),
            ...modules, ...plugins
        ], path_1.basename);
        if (duplicated.size)
            throw new VerifyModulesError({ kind: 'duplicatedModules', duplicated });
    }
    let all_includes = [...new Set([...[...modules, ...plugins].map(x => (0, path_1.dirname)(x)), ...includePaths])].filter(x => x);
    let module_names = yield (0, DepTree_1.sort_by_dependencies)({
        bin: verificationBinaries,
        include: all_includes
    }, ...modules.map(n => (0, path_1.basename)(n)));
    let dest = destination || (yield (0, tmp_promise_1.dir)({ keep: true })).path;
    let make_checked = (mod) => (0, FStarCli_1.fstar)({
        bin: verificationBinaries,
        include: all_includes,
        load_cmxs: plugins.map(n => (0, path_1.basename)(n, '.cmxs'))
    }, ...(0, Utils_1.verificationOptions_to_flags)(verificationOptions), "--cache_checked_modules", "--cache_dir", dest, "--warn_error", "-321", mod);
    for (let mod of module_names) {
        yield make_checked(mod);
        let checked_basename = mod + '.checked';
        let checked = dest + '/' + checked_basename;
        try {
            yield (0, fs_extra_1.stat)(checked);
        }
        catch (e) {
            let path = all_includes.find((path) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield (0, fs_extra_1.stat)(path + '/' + checked_basename);
                }
                catch (e) {
                    return false;
                }
                return true;
            }));
            if (path !== undefined) {
                console.warn(`The include path [${path}] contains already a checked file for the module ${mod}. Copying to destination dir.`);
                yield (0, fs_extra_1.copy)(path, checked);
            }
            else {
                console.error(`Checked file for module ${mod} was not generated!`);
                throw e;
            }
        }
    }
    return dest;
});
exports.VerifyModules = VerifyModules;
//# sourceMappingURL=VerifyModules.js.map