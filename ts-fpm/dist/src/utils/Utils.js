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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCmxsFilename = exports.resolveVerificationBinariesWithEnv = exports.verificationBinariesOfEnv = exports.ocamlBinariesOfEnv = exports.withGitRepo = exports.withTempDir = exports.longestPrefix = exports.verificationOptions_to_flags = exports.extractionOptions_to_flags = exports.fuel_to_string = exports.is_fstar_module = exports.is_implem = exports.is_interface = exports.readdir_fullpaths = exports.duplicates = exports.execFile = exports.execFile1 = exports.defaultLogger = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const tmp_promise_1 = require("tmp-promise");
const simple_git_1 = __importDefault(require("simple-git"));
const Exn_1 = require("./Exn");
const which_1 = __importDefault(require("which"));
const path_2 = __importDefault(require("path"));
const Queue_1 = require("./Queue");
const pino_1 = __importDefault(require("pino"));
const Log_1 = require("./Log");
exports.defaultLogger = (0, pino_1.default)({
    transport: {
        target: 'pino-pretty',
        options: {
            ignore: 'pid,hostname',
        }
    }
});
let execFile0 = (0, util_1.promisify)(child_process.execFile);
let execFile1 = (log) => (file, args, options, quiet) => {
    let l = log(Log_1.Level.NOTICE, file + ' ' + (args || []).join(' ') + '\ncwd="' + (options === null || options === void 0 ? void 0 : options.cwd) + '"');
    return new Promise((a, r) => {
        var _a, _b;
        let p = child_process.execFile(file, args, options, (e, stdout, stderr) => {
            // console.log({ stderr, stdout });
            if (e === null) {
                l.done();
                a({ stderr, stdout });
            }
            else {
                log(Log_1.Level.NOTICE, stdout.toString());
                log(Log_1.Level.ERROR, stderr.toString());
                console.log({ stderr, stdout });
                throw e;
            }
        });
        if (quiet === false) {
            let handle = (data) => log(Log_1.Level.INFO, data + '');
            (_a = p.stdout) === null || _a === void 0 ? void 0 : _a.on('data', handle);
            (_b = p.stderr) === null || _b === void 0 ? void 0 : _b.on('data', handle);
        }
        // execFile0(file, args, options).then(a).catch(e => )
    });
};
exports.execFile1 = execFile1;
/*
    let p = execFile0(file, args, options);
    // let msg = '';
    // let sub = log(Level.NOTICE, msg);
    // let handle = (data: string) =>
    //     sub.setMessage(msg += data);
    // p.child.stdout?.on('data', handle);
    // p.child.stderr?.on('data', handle);
    try {
        let r = await p;
        // sub.done();
        return r;
    } catch (e) {
        if (e instanceof child_process.ChildProcess["ExecException"])
            log(Level.ERROR, e);
        else
            throw e;
    }
    }*/
let execFile = (log) => (file, args, options, quiet) => 
// execFile1(log)(file, args, options, quiet);
Queue_1.queue.add(() => (0, exports.execFile1)(log)(file, args, options, quiet));
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
let readdir_fullpaths = async (p) => {
    return (await (0, fs_extra_1.readdir)(p)).map(name => p + '/' + name);
};
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
        v.lax
            ? ["--lax"] : [],
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
let withTempDir = async (fun) => await (0, tmp_promise_1.withDir)(async ({ path }) => {
    let result = await fun(path);
    // FIXME: [withDir] tries to remove [path], but not recursively
    // thus here I remove everything recursively
    if (await (0, fs_extra_1.pathExists)(path))
        await (0, fs_extra_1.remove)(path);
    await (0, fs_extra_1.mkdirp)(path);
    return result;
});
exports.withTempDir = withTempDir;
let withGitRepo = (gitUri, rev) => async (fun) => await (0, exports.withTempDir)(async (path) => {
    let git = (0, simple_git_1.default)(path);
    // TODO: handle errors nicely here
    await git.clone(gitUri, path);
    if (rev !== undefined)
        await git.reset(["--hard", rev]);
    return await fun(path, git);
});
exports.withGitRepo = withGitRepo;
function ensureDefined(x, error) {
    if (x === undefined)
        throw error;
    return x;
}
let ocamlBinariesOfEnv = async () => {
    let whichE = async (binName) => {
        try {
            return (0, which_1.default)(binName);
        }
        catch (details) {
            throw new Exn_1.BinaryResolutionError({ kind: 'missingBinary', binName, path: process.env.PATH || '', caller: 'ocamlBinariesOfEnv', details });
        }
    };
    return {
        OCAMLPATH: ensureDefined(process.env.OCAMLPATH, new Exn_1.BinaryResolutionError({ kind: 'envVarNotFound', varName: 'OCAMLPATH', env: process.env, caller: 'ocamlBinariesOfEnv' })),
        gcc: await whichE('gcc'),
        ocamlbin: path_2.default.resolve(await whichE('ocamlc') + '/..'),
        ocamlbuild: await whichE('ocamlbuild'),
        ocamlfind: await whichE('ocamlfind')
    };
};
exports.ocamlBinariesOfEnv = ocamlBinariesOfEnv;
let verificationBinariesOfEnv = async () => {
    let whichE = async (binName) => {
        try {
            return (0, which_1.default)(binName);
        }
        catch (details) {
            throw new Exn_1.BinaryResolutionError({ kind: 'missingBinary', binName, path: process.env.PATH || '', caller: 'verificationBinariesOfEnv', details });
        }
    };
    return {
        fstar_binary: await whichE('fstar.exe'),
        ocamlBinaries: await (0, exports.ocamlBinariesOfEnv)(),
        z3_binary: await whichE('z3')
    };
};
exports.verificationBinariesOfEnv = verificationBinariesOfEnv;
let resolveVerificationBinariesWithEnv = async ({ fstar_binary, z3_binary }) => {
    if (fstar_binary || z3_binary)
        throw Error("[resolveVerificationBinariesWithEnv] Constraint resolution for F* or Z3 is not implemented");
    return await (0, exports.verificationBinariesOfEnv)();
};
exports.resolveVerificationBinariesWithEnv = resolveVerificationBinariesWithEnv;
let resolveCmxsFilename = async (pkg) => {
    let r = (await (0, fs_extra_1.readdir)(pkg)).find(f => f.endsWith(".cmxs"));
    if (!r)
        throw new Error("[resolveCmxsFilename] no cmxs file found in OCaml plugin package located at " + pkg);
    return (0, path_1.basename)(r, '.cmxs');
};
exports.resolveCmxsFilename = resolveCmxsFilename;
//# sourceMappingURL=Utils.js.map