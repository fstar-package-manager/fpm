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
exports.computeLibMetadata = exports.mkHash = exports.getUnresolvedPackageSet_with_overrides = exports.getUnresolvedPackageSet = exports.unresolvedPackageSetOfFlakeLock = exports.cachePathOf = exports.PACKAGE_FILE_NAME = exports.mkDefaultConfig = void 0;
require("buffer");
const fs_extra_1 = require("fs-extra");
const path = __importStar(require("path"));
const Utils_1 = require("./../utils/Utils");
const crypto_1 = require("crypto");
const chalk_1 = __importDefault(require("chalk"));
let prefixesOf = (l) => [...Array(l.length + 1).keys()].map((_, i) => l.slice(0, i));
const mkDefaultConfig = async () => {
    let cwd = process.cwd();
    let parents = prefixesOf(cwd.split(path.sep)).map(x => [...x, '.fpm'].join(path.sep));
    let cachePath = cwd + '/.fpm';
    for (let parent of parents)
        if (await (0, fs_extra_1.pathExists)(parent)) {
            cachePath = parent;
            break;
        }
    return {
        defaultPackageSet: "git@github.com:fstar-package-manager/fstarpkgs.git",
        cachePath
    };
};
exports.mkDefaultConfig = mkDefaultConfig;
exports.PACKAGE_FILE_NAME = 'fstar.json';
exports.cachePathOf = {
    packageSetJSON: async (config) => await exports.cachePathOf.fstarpkgs(config) + '/fstarpkgs.json',
    package: async (config, packageName) => await exports.cachePathOf.fstarpkgs(config) + '/' + packageName,
    fstarpkgs: async ({ fstarpkgs_rev, cachePath }) => {
        if (!fstarpkgs_rev)
            throw "[cachePathOf.fstarpkgs] called with undefined [fstarpkgs_rev] in config.";
        let path = cachePath + '/fstarpkgs/' + fstarpkgs_rev + "/";
        await (0, fs_extra_1.mkdirp)(path);
        return path;
    },
};
async function unresolvedPackageSetOfFlakeLock(flakeLock) {
    let nodes = flakeLock.nodes;
    let root = nodes[flakeLock.root];
    let blacklist = ['fpm'];
    let inputs = root.inputs;
    return Object.fromEntries(Object.keys(inputs)
        .filter(i => !blacklist.includes(i))
        .map(i => [i, nodes[inputs[i]]])
        .filter(([_, { flake }]) => !flake)
        .map(([i, { locked }]) => [i, {
            rev: locked.rev,
            ref: locked.ref,
            // TODO better parsing / more support for different URIs
            subpath: (locked.url.match(/\?dir=(.*)$/) || [])[1] || "/",
            gitUri: locked.url.split('?dir=')[0]
        }]));
}
exports.unresolvedPackageSetOfFlakeLock = unresolvedPackageSetOfFlakeLock;
;
let getUnresolvedPackageSet = async (config) => {
    console.warn('TODO: this is broken, this downloads all the time');
    config.fstarpkgs_rev = 'b04ec80c6f5ffc75822d29683d91ae16cf5d75d2'; // TODO hardcocded
    if (config.fstarpkgs_rev !== undefined && await (0, fs_extra_1.pathExists)(await exports.cachePathOf.packageSetJSON(config))) {
        return await JSON.parse(await (0, fs_extra_1.readFile)(await exports.cachePathOf.packageSetJSON(config), 'utf8'));
    }
    else {
        return await (0, Utils_1.withGitRepo)(config.defaultPackageSet, config.fstarpkgs_rev)(async (path, git) => {
            config.fstarpkgs_rev = config.fstarpkgs_rev || await git.revparse("HEAD");
            let pkgs = await unresolvedPackageSetOfFlakeLock(JSON.parse(await (0, fs_extra_1.readFile)(`${path}/flake.lock`, 'utf8')));
            await (0, fs_extra_1.writeFile)(await exports.cachePathOf.packageSetJSON(config), JSON.stringify(pkgs, null, 4));
            return pkgs;
        });
    }
};
exports.getUnresolvedPackageSet = getUnresolvedPackageSet;
// TODO: drop this, figure out something better
let getUnresolvedPackageSet_with_overrides = async (config) => {
    let filename = "./ps_overrides.json";
    let overrides = await (0, fs_extra_1.pathExists)("./ps_overrides.json") ? JSON.parse(await (0, fs_extra_1.readFile)(filename, 'utf8')) : {};
    return Object.assign(Object.assign({}, await (0, exports.getUnresolvedPackageSet)(config)), overrides);
};
exports.getUnresolvedPackageSet_with_overrides = getUnresolvedPackageSet_with_overrides;
let mkHash = (s) => (0, crypto_1.createHash)('sha256').update(s).digest('hex');
exports.mkHash = mkHash;
let computeLibMetadata = async (config, lib) => {
    let module_root = (0, Utils_1.longestPrefix)(lib.modules.map(m => m.split('/'))).join('/');
    let fstarpkgs_path = await exports.cachePathOf.fstarpkgs(config);
    let meta;
    if (module_root.startsWith(fstarpkgs_path)) {
        let segments_leftover = module_root.slice(fstarpkgs_path.length).split('/').filter(x => x);
        if (!segments_leftover.length)
            throw new Error(`The library consisting of modules ${lib.modules.map(m => chalk_1.default.bold(path.basename(m))).join(', ')} is malformed. 
All of its modules should live in exactly one root directory right under ${fstarpkgs_path}.`);
        let name = segments_leftover[0];
        meta = { cacheDir: fstarpkgs_path + '/' + name + '/cache', name };
    }
    else {
        // log(Level.WARNING, `Local library ${module_root}: `)
        // console.warn('[computeLibMetadata] Experimental cache directory for local libraries used by lib [?]');
        let hash = (0, exports.mkHash)(JSON.stringify([
            lib,
            await Promise.all(lib.modules.map(p => (0, fs_extra_1.readFile)(p, 'utf8')).map(async (f) => (0, exports.mkHash)(await f)))
        ]));
        let name = path.basename(module_root);
        // console.log({ name, hash, lib });
        // if (name == 'ulib') throw "xxx";
        let cache = config.cachePath + '/_local_librairies/' + name + '-' + hash.slice(0, 16) + '/cache';
        // console.warn('[computeLibMetadata] (changes are deteted a bit loosely, removing [${path}] might help if a build fails)');
        // console.log({ cachePath: config.cachePath, path })
        meta = {
            cacheDir: cache, name: name + '-' + hash.slice(0, 6)
        };
    }
    return meta;
};
exports.computeLibMetadata = computeLibMetadata;
//# sourceMappingURL=Config.js.map