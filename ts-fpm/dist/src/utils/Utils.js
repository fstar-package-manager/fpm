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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveVerificationBinariesWithEnv = exports.verificationBinariesOfEnv = exports.ocamlBinariesOfEnv = exports.withGitRepo = exports.longestPrefix = exports.verificationOptions_to_flags = exports.extractionOptions_to_flags = exports.fuel_to_string = exports.is_fstar_module = exports.is_implem = exports.is_interface = exports.readdir_fullpaths = exports.duplicates = exports.execFile = void 0;
const fs_extra_1 = require("fs-extra");
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const tmp_promise_1 = require("tmp-promise");
const simple_git_1 = __importDefault(require("simple-git"));
const Exn_1 = require("./Exn");
const which_1 = __importDefault(require("which"));
const path_1 = __importDefault(require("path"));
let execFile_ = (0, util_1.promisify)(child_process.execFile);
function execFile(file, args, options, quiet) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let p = execFile_(file, args, options);
        if (quiet) {
            (_a = p.child.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
            (_b = p.child.stderr) === null || _b === void 0 ? void 0 : _b.pipe(process.stderr);
        }
        return yield p;
    });
}
exports.execFile = execFile;
function duplicates(l, proj) {
    let duplicates = new Map();
    let seen = new Map();
    l.forEach(x => {
        let y = proj(x);
        seen.has(y) ? duplicates.set(y, new Set([...(duplicates.get(y) || []), seen.get(y), x])) : seen.set(y, x);
    });
    return duplicates;
}
exports.duplicates = duplicates;
let readdir_fullpaths = (p) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[readdir_fullpaths] ' + p);
    return (yield (0, fs_extra_1.readdir)(p)).map(name => p + '/' + name);
});
exports.readdir_fullpaths = readdir_fullpaths;
let is_interface = (m) => m.endsWith('.fsti');
exports.is_interface = is_interface;
let is_implem = (m) => m.endsWith('.fst');
exports.is_implem = is_implem;
let is_fstar_module = (m) => (0, exports.is_interface)(m) || (0, exports.is_implem)(m);
exports.is_fstar_module = is_fstar_module;
let fuel_to_string = (fuel) => fuel.max === undefined && fuel.initial === undefined
    ? undefined : "${fuel.max || fuel.initial},${fuel.max || fuel.initial}";
exports.fuel_to_string = fuel_to_string;
let extractionOptions_to_flags = (o) => {
    return [
        ['--codegen', o.lang],
        (o.codegenLib || []).map(ns => ["--codegen-lib", ns]).flat(),
        o.inlineModules
            ? ["--cmi"] : [],
        o.normalizePure
            ? ["--normalize_pure_terms_for_extraction"] : [],
    ].flat();
};
exports.extractionOptions_to_flags = extractionOptions_to_flags;
let verificationOptions_to_flags = (v) => {
    let fuel = v.fuel ? (0, exports.fuel_to_string)(v.fuel) : undefined;
    let ifuel = v.ifuel ? (0, exports.fuel_to_string)(v.ifuel) : undefined;
    return [
        v.MLish
            ? ["--MLish"] : [],
        fuel
            ? ["--fuel", fuel] : [],
        ifuel
            ? ["--ifuel", ifuel] : [],
        v.no_default_include
            ? ["--no_default_include"] : [],
        v.no_load_fstartaclib
            ? ["--no_load_fstartaclib"] : [],
        v.no_smt
            ? ["--no_smt"] : [],
        v.quake
            ? ["--quake", `${v.quake.n}/${v.quake.m || v.quake.n}${v.quake.unconditionally ? "k" : ""}`] : [],
        v.retry
            ? ["--retry", v.retry.toString()] : [],
        v.unsafe_tactic_exec
            ? ["--unsafe_tactic_exec"] : [],
    ].flat();
};
exports.verificationOptions_to_flags = verificationOptions_to_flags;
function longestPrefix(lists) {
    if (!lists.length)
        throw "[longestPrefix] expected a non-empty list as parameter";
    let prefix = lists[0].slice(0, lists.map(l => l.length).reduce((x, y) => Math.min(x, y)));
    while (prefix.length) {
        if (lists.every(l => prefix.every((segment, i) => l[i] == segment)))
            return prefix;
        prefix.pop();
    }
    ;
    return [];
}
exports.longestPrefix = longestPrefix;
;
let withGitRepo = (gitUri, rev) => (fun) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, tmp_promise_1.withDir)(({ path }) => __awaiter(void 0, void 0, void 0, function* () {
        let git = (0, simple_git_1.default)(path);
        // TODO: handle errors nicely here
        yield git.clone(gitUri, path);
        if (rev !== undefined)
            yield git.reset(["--hard", rev]);
        let result = yield fun(path, git);
        // FIXME: [withDir] tries to remove [path], but not recursively
        // thus here I remove everything recursively
        yield (0, fs_extra_1.remove)(path);
        yield (0, fs_extra_1.mkdirp)(path);
        return result;
    }));
});
exports.withGitRepo = withGitRepo;
function ensureDefined(x, error) {
    if (x === undefined)
        throw error;
    return x;
}
let ocamlBinariesOfEnv = () => __awaiter(void 0, void 0, void 0, function* () {
    let whichE = (binName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return (0, which_1.default)(binName);
        }
        catch (details) {
            throw new Exn_1.BinaryResolutionError({ kind: 'missingBinary', binName, path: process.env.PATH || '', caller: 'ocamlBinariesOfEnv', details });
        }
    });
    return {
        OCAMLPATH: ensureDefined(process.env.OCAMLPATH, new Exn_1.BinaryResolutionError({ kind: 'envVarNotFound', varName: 'OCAMLPATH', env: process.env, caller: 'ocamlBinariesOfEnv' })),
        gcc: yield whichE('gcc'),
        ocamlbin: path_1.default.resolve((yield whichE('ocamlc')) + '/..'),
        ocamlbuild: yield whichE('ocamlbuild'),
        ocamlfind: yield whichE('ocamlfind')
    };
});
exports.ocamlBinariesOfEnv = ocamlBinariesOfEnv;
let verificationBinariesOfEnv = () => __awaiter(void 0, void 0, void 0, function* () {
    let whichE = (binName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return (0, which_1.default)(binName);
        }
        catch (details) {
            throw new Exn_1.BinaryResolutionError({ kind: 'missingBinary', binName, path: process.env.PATH || '', caller: 'verificationBinariesOfEnv', details });
        }
    });
    return {
        fstar_binary: yield whichE('fstar.exe'),
        ocamlBinaries: yield (0, exports.ocamlBinariesOfEnv)(),
        z3_binary: yield whichE('z3')
    };
});
exports.verificationBinariesOfEnv = verificationBinariesOfEnv;
let resolveVerificationBinariesWithEnv = ({ fstar_binary, z3_binary }) => __awaiter(void 0, void 0, void 0, function* () {
    if (fstar_binary || z3_binary)
        throw Error("[resolveVerificationBinariesWithEnv] Constraint resolution for F* or Z3 is not implemented");
    return yield (0, exports.verificationBinariesOfEnv)();
});
exports.resolveVerificationBinariesWithEnv = resolveVerificationBinariesWithEnv;
//# sourceMappingURL=Utils.js.map