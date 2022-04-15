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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvePackageSet = exports.ResolveExtractionTarget = exports.ResolveLibrary = exports.ResolvePackage = exports.ResolvePackageLazy = exports.ResolveExtractionTargetLazy = exports.ResolveLibraryLazy = void 0;
require("buffer");
const fs_extra_1 = require("fs-extra");
const Utils_1 = require("./../utils/Utils");
const Config_1 = require("../utils/Config");
const Validation_1 = require("./../utils/Validation");
class PackageSetResolutionError extends Error {
    constructor(cause) {
        super();
        this.cause = cause;
    }
    get message() {
        return "[PackageSetResolutionError.message] TODO";
    }
}
function callMaybeLazy(f, x) {
    return __awaiter(this, void 0, void 0, function* () {
        if (f instanceof Function)
            return yield f(x);
        return f[x];
    });
}
let ResolveLibraryLazy = ({ packageSet, lib, src }) => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        dependencies: yield Promise.all(// sequential?
        lib.dependencies.map((l) => __awaiter(void 0, void 0, void 0, function* () { return (yield callMaybeLazy(packageSet, l)).lib; }))),
        modules: lib.modules.map(rel => `${src}/${rel}`),
        verificationOptions: lib.verificationOptions
    });
});
exports.ResolveLibraryLazy = ResolveLibraryLazy;
let ResolveExtractionTargetLazy = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { target } = _a, opts = __rest(_a, ["target"]);
    return ({
        lib: yield (0, exports.ResolveLibraryLazy)(Object.assign(Object.assign({}, opts), { lib: target.lib })),
        opts: target.opts
    });
});
exports.ResolveExtractionTargetLazy = ResolveExtractionTargetLazy;
let ResolvePackageLazy = (_b) => __awaiter(void 0, void 0, void 0, function* () {
    var { pkg } = _b, opts = __rest(_b, ["pkg"]);
    let extractions = {};
    for (let [name, target] of Object.entries(pkg.extractions || {}))
        extractions[name] = yield (0, exports.ResolveExtractionTargetLazy)(Object.assign(Object.assign({}, opts), { target }));
    return {
        name: pkg.name, extractions,
        lib: yield (0, exports.ResolveLibraryLazy)(Object.assign(Object.assign({}, opts), { lib: pkg.lib }))
    };
});
exports.ResolvePackageLazy = ResolvePackageLazy;
exports.ResolvePackage = exports.ResolvePackageLazy;
exports.ResolveLibrary = exports.ResolveLibraryLazy;
exports.ResolveExtractionTarget = exports.ResolveExtractionTargetLazy;
let ResolvePackageSet = (config) => ({ packageSet, packages }) => __awaiter(void 0, void 0, void 0, function* () {
    let resolved_pkgs = {};
    let resolveOne = (pkgName) => __awaiter(void 0, void 0, void 0, function* () {
        if (resolved_pkgs[pkgName])
            return resolved_pkgs[pkgName];
        if (!packageSet[pkgName])
            throw new PackageSetResolutionError({ packageSet, packages, kind: 'packageNotFound', pkgName });
        let gitRef = packageSet[pkgName];
        let path = yield Config_1.cachePathOf.package(config, pkgName);
        let path_sources = `${path}/src`;
        if (!(yield (0, fs_extra_1.pathExists)(path_sources)))
            yield (0, Utils_1.withGitRepo)(gitRef.gitUri, gitRef.rev)((temp) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, fs_extra_1.remove)(temp + '/' + '.git');
                yield (0, fs_extra_1.move)(temp + '/' + gitRef.subpath, path_sources);
            }));
        let json_pkg = JSON.parse(yield (0, fs_extra_1.readFile)(path_sources + '/' + Config_1.PACKAGE_FILE_NAME, 'utf8'));
        return yield (0, Validation_1.mapResult)(Validation_1.validators.packageT.Unresolved(json_pkg), (unresolved_pkg) => __awaiter(void 0, void 0, void 0, function* () { return (resolved_pkgs[pkgName] = yield (0, exports.ResolvePackageLazy)({ packageSet: resolveOne, pkg: unresolved_pkg, src: path_sources })); }), errors => {
            throw new PackageSetResolutionError({ packageSet, packages, kind: 'jsonValidationFailure', validationError: errors });
        });
    });
    for (let pkg of packages)
        yield resolveOne(pkg);
    return resolved_pkgs;
});
exports.ResolvePackageSet = ResolvePackageSet;
//# sourceMappingURL=ResolvePackageSet.js.map