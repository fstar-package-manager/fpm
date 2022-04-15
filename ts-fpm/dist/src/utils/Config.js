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
exports.computeLibMetadata = exports.getUnresolvedPackageSet = exports.unresolvedPackageSetOfFlakeLock = exports.cachePathOf = exports.PACKAGE_FILE_NAME = exports.mkDefaultConfig = void 0;
require("buffer");
const fs_extra_1 = require("fs-extra");
const Utils_1 = require("./../utils/Utils");
const crypto_1 = require("crypto");
const mkDefaultConfig = () => ({
    defaultPackageSet: "git@github.com:fstar-package-manager/fstarpkgs.git",
    cachePath: process.cwd() + "/.fpm"
});
exports.mkDefaultConfig = mkDefaultConfig;
exports.PACKAGE_FILE_NAME = 'fstar.json';
exports.cachePathOf = {
    packageSetJSON: (config) => __awaiter(void 0, void 0, void 0, function* () { return (yield exports.cachePathOf.fstarpkgs(config)) + '/fstarpkgs.json'; }),
    package: (config, packageName) => __awaiter(void 0, void 0, void 0, function* () { return (yield exports.cachePathOf.fstarpkgs(config)) + '/' + packageName; }),
    fstarpkgs: ({ fstarpkgs_rev, cachePath }) => __awaiter(void 0, void 0, void 0, function* () {
        if (!fstarpkgs_rev)
            throw "[cachePathOf.fstarpkgs] called with undefined [fstarpkgs_rev] in config.";
        let path = cachePath + '/fstarpkgs/' + fstarpkgs_rev + "/";
        yield (0, fs_extra_1.mkdirp)(path);
        return path;
    }),
};
function unresolvedPackageSetOfFlakeLock(flakeLock) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.unresolvedPackageSetOfFlakeLock = unresolvedPackageSetOfFlakeLock;
;
let getUnresolvedPackageSet = (config) => __awaiter(void 0, void 0, void 0, function* () {
    if (config.fstarpkgs_rev !== undefined && (yield (0, fs_extra_1.pathExists)(yield exports.cachePathOf.packageSetJSON(config)))) {
        return yield JSON.parse(yield (0, fs_extra_1.readFile)(yield exports.cachePathOf.packageSetJSON(config), 'utf8'));
    }
    else {
        return yield (0, Utils_1.withGitRepo)(config.defaultPackageSet, config.fstarpkgs_rev)((path, git) => __awaiter(void 0, void 0, void 0, function* () {
            config.fstarpkgs_rev = config.fstarpkgs_rev || (yield git.revparse("HEAD"));
            let pkgs = yield unresolvedPackageSetOfFlakeLock(JSON.parse(yield (0, fs_extra_1.readFile)(`${path}/flake.lock`, 'utf8')));
            yield (0, fs_extra_1.writeFile)(yield exports.cachePathOf.packageSetJSON(config), JSON.stringify(pkgs, null, 4));
            return pkgs;
        }));
    }
});
exports.getUnresolvedPackageSet = getUnresolvedPackageSet;
let computeLibMetadata = (config, lib) => __awaiter(void 0, void 0, void 0, function* () {
    let path = (0, Utils_1.longestPrefix)(lib.modules.map(m => m.split('/'))).join('/');
    let fstarpkgs_path = yield exports.cachePathOf.fstarpkgs(config);
    if (path.startsWith(fstarpkgs_path)) {
        let segments_leftover = path.slice(fstarpkgs_path.length).split('/').filter(x => x);
        if (!segments_leftover.length) {
            console.error(lib);
            throw new Error('[computeLibMetadata] Bad location for modules for library:');
        }
        let name = segments_leftover[0];
        return { cacheDir: fstarpkgs_path + '/' + name + '/cache', name };
    }
    else {
        let mkHash = (s) => (0, crypto_1.createHash)('sha256').update(s).digest('hex');
        console.warn('[computeLibMetadata] Experimental cache directory for local libraries used by lib ', lib);
        let hash = mkHash(JSON.stringify([
            lib,
            yield Promise.all(lib.modules.map(p => (0, fs_extra_1.readFile)(p, 'utf8')).map((f) => __awaiter(void 0, void 0, void 0, function* () { return mkHash(yield f); })))
        ]));
        let cache = config.cachePath + '/_local_librairies/' + hash + '/cache';
        console.warn('[computeLibMetadata] (changes are deteted a bit loosely, removing [${path}] might help if a build fails)');
        return { cacheDir: cache, name: (config.cachePath.split('/').pop() || 'unknown') + '-' + hash.slice(0, 6) };
    }
});
exports.computeLibMetadata = computeLibMetadata;
//# sourceMappingURL=Config.js.map