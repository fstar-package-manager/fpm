"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.VerifyLibrary = exports.CmxsFilesOfLibrary = exports.CmxsOfLibrary = exports.ExtractTarget = exports.IncludePathsOfLibrary = exports.IncludePathsOfLibrary_excludingSelf = void 0;
const VerifyModules_1 = require("../module-level/VerifyModules");
require("buffer");
const fs_extra_1 = require("fs-extra");
const path = __importStar(require("path"));
const Config_1 = require("../utils/Config");
const CmxsOfModules_1 = require("../module-level/CmxsOfModules");
const ExtractModules_1 = require("../module-level/ExtractModules");
let IncludePathsOfLibrary_excludingSelf = (config) => ({ lib, verificationBinaries, ocamlBinaries }) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield Promise.all(lib.dependencies.map(lib => (0, exports.IncludePathsOfLibrary)(config)({ lib, verificationBinaries, ocamlBinaries })))).flat();
});
exports.IncludePathsOfLibrary_excludingSelf = IncludePathsOfLibrary_excludingSelf;
let IncludePathsOfLibrary = (config) => ({ lib, verificationBinaries, ocamlBinaries }) => __awaiter(void 0, void 0, void 0, function* () {
    return [
        yield ((0, exports.VerifyLibrary)(config)({ lib, verificationBinaries, ocamlBinaries })),
        ...(ocamlBinaries ? [
            path.resolve((yield ((0, exports.CmxsOfLibrary)(config)({ lib, verificationBinaries, ocamlBinaries }))) + "/..")
        ] : []),
        ...(yield Promise.all(lib.dependencies.map(lib => (0, exports.IncludePathsOfLibrary)(config)({ lib, verificationBinaries, ocamlBinaries })))).flat()
    ];
});
exports.IncludePathsOfLibrary = IncludePathsOfLibrary;
let ExtractTarget = (config) => ({ target, verificationBinaries, ocamlBinaries }) => __awaiter(void 0, void 0, void 0, function* () {
    let { lib, opts: extractionOptions } = target;
    (0, ExtractModules_1.ExtractModules)({
        verificationBinaries,
        extractionOptions,
        includePaths: yield (0, exports.IncludePathsOfLibrary)(config)({
            verificationBinaries,
            ocamlBinaries,
            lib
        }),
        modules: lib.modules
    });
    return {};
});
exports.ExtractTarget = ExtractTarget;
let CmxsOfLibrary = (config) => ({ lib, verificationBinaries, ocamlBinaries }) => __awaiter(void 0, void 0, void 0, function* () {
    let { cacheDir: cache, name: cmxsName } = (yield (0, Config_1.computeLibMetadata)(config, lib));
    yield (0, fs_extra_1.mkdirp)(cache);
    let plugin_cache_dir = cache + '/plugin';
    if (!(yield (0, fs_extra_1.pathExists)(plugin_cache_dir))) {
        let plugin = yield (0, CmxsOfModules_1.CmxsOfModules)({
            modules: lib.modules,
            verificationBinaries,
            includePaths: (yield Promise.all(lib.dependencies.map(lib => (0, exports.IncludePathsOfLibrary)(config)({ lib, verificationBinaries, ocamlBinaries })))).flat(),
            ocamlBinaries,
            cmxsName
        });
        yield (0, fs_extra_1.move)(plugin, plugin_cache_dir);
    }
    ;
    return plugin_cache_dir + '/' + cmxsName + '.cmxs';
});
exports.CmxsOfLibrary = CmxsOfLibrary;
let CmxsFilesOfLibrary = (config) => (opts) => __awaiter(void 0, void 0, void 0, function* () {
    return [
        yield (0, exports.CmxsOfLibrary)(config)(opts),
        ...(yield Promise.all(opts.lib.dependencies.map(lib => (0, exports.CmxsFilesOfLibrary)(config)(Object.assign(Object.assign({}, opts), { lib }))))).flat()
    ];
});
exports.CmxsFilesOfLibrary = CmxsFilesOfLibrary;
let VerifyLibrary = (config) => ({ lib, verificationBinaries, ocamlBinaries }) => __awaiter(void 0, void 0, void 0, function* () {
    let cache = (yield (0, Config_1.computeLibMetadata)(config, lib)).cacheDir;
    yield (0, fs_extra_1.mkdirp)(cache);
    let checked_cache_dir = cache + '/checked';
    if (!(yield (0, fs_extra_1.pathExists)(checked_cache_dir))) {
        let includePaths = (yield Promise.all(lib.dependencies.map(lib => (0, exports.IncludePathsOfLibrary)(config)({ lib, verificationBinaries, ocamlBinaries })))).flat();
        console.log({ lib, includePaths });
        let checked = yield (0, VerifyModules_1.VerifyModules)({
            includePaths,
            modules: lib.modules,
            plugins: ocamlBinaries ? (yield Promise.all(lib.dependencies.map(lib => (0, exports.CmxsFilesOfLibrary)(config)({ lib, verificationBinaries, ocamlBinaries })))).flat() : [],
            verificationBinaries,
            verificationOptions: lib.verificationOptions
        });
        yield (0, fs_extra_1.move)(checked, checked_cache_dir);
    }
    return checked_cache_dir;
});
exports.VerifyLibrary = VerifyLibrary;
//# sourceMappingURL=All.js.map