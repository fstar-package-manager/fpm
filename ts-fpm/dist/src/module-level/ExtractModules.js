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
exports.ExtractModules = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const FStarCli_1 = require("./../utils/FStarCli");
const Utils_1 = require("../utils/Utils");
let ExtractModules = ({ verificationBinaries, extractionOptions, includePaths, modules }, destination) => __awaiter(void 0, void 0, void 0, function* () {
    let all_includes = [...new Set([...modules.map(x => (0, path_1.dirname)(x)), ...includePaths])].filter(x => x);
    let dest = destination || (yield (0, tmp_promise_1.dir)({ keep: true })).path;
    let modules_ = modules.map(n => (0, path_1.basename)(n));
    modules_ = modules_.filter(m => !(0, Utils_1.is_implem)(m) || ((0, Utils_1.is_implem)(m) && !modules.includes(m + 'i')));
    let extract = (...modules) => __awaiter(void 0, void 0, void 0, function* () {
        return yield (0, FStarCli_1.fstar)({
            bin: verificationBinaries,
            include: all_includes,
        }, "--odir", dest, ...(0, Utils_1.extractionOptions_to_flags)(extractionOptions), ...modules);
    });
    yield extract(...modules_);
    yield Promise.all(modules.filter(m => !modules_.includes(m)).map(m => extract(m)));
    let ocaml_names = new Set(modules.map(m => m.replace(/[.]fsti?$/, '').replace('.', '_')));
    for (let file of yield (0, fs_extra_1.readdir)(dest)) {
        let mod = file.replace(/[.]ml$/, '').replace('.', '_');
        if (!ocaml_names.has(mod))
            yield (0, fs_extra_1.unlink)(dest + '/' + file);
    }
    return dest;
});
exports.ExtractModules = ExtractModules;
//# sourceMappingURL=ExtractModules.js.map