"use strict";
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
const path_1 = require("path");
const Utils_1 = require("./../utils/Utils");
const Config_1 = require("../utils/Config");
const Validation_1 = require("./../utils/Validation");
const Exn_1 = require("../utils/Exn");
async function callMaybeLazy(f, x) {
    if (f instanceof Function)
        return await f(x);
    return f[x];
}
function addMaybeLazy(f, k, v) {
    if (f instanceof Function)
        return async (x) => x == k ? v : await f(x);
    return Object.assign(Object.assign({}, f), { [k]: v });
}
let ResolveLibraryLazy = async ({ packageSet, lib, src }) => ({
    dependencies: await Promise.all(// sequential?
    lib.dependencies.map(async (l) => {
        let o = (await callMaybeLazy(packageSet, l)).lib;
        // If the current library is verified with lax, its dependencies should be checked with lax as well
        if (lib.verificationOptions.lax)
            return Object.assign(Object.assign({}, o), { verificationOptions: Object.assign(Object.assign({}, o.verificationOptions), { lax: true }) });
        else if (lib.verificationOptions.lax)
            throw Error("TODO: WRITE ERROR (something like: a non-MLish library depends on a MLish one, this is forbidden)");
        return o;
    })),
    plugin_ocaml_disable: lib.plugin_ocaml_disable,
    plugin_ocaml_modules: (lib.plugin_ocaml_modules || []).map(rel => (0, path_1.resolve)(`${src}/${rel}`)),
    modules: lib.modules.map(rel => (0, path_1.resolve)(`${src}/${rel}`)),
    verificationOptions: lib.verificationOptions
});
exports.ResolveLibraryLazy = ResolveLibraryLazy;
let ResolveExtractionTargetLazy = async (_a) => {
    var { target } = _a, opts = __rest(_a, ["target"]);
    return ({
        lib: typeof target.lib == 'string'
            ? (await callMaybeLazy(opts.packageSet, target.lib)).lib
            : await (0, exports.ResolveLibraryLazy)(Object.assign(Object.assign({}, opts), { lib: target.lib })),
        opts: target.opts
    });
};
exports.ResolveExtractionTargetLazy = ResolveExtractionTargetLazy;
let ResolvePackageLazy = async (_a) => {
    var { pkg, packageSet } = _a, opts = __rest(_a, ["pkg", "packageSet"]);
    let extractions = {};
    let self = {
        name: pkg.name, extractions,
        lib: await (0, exports.ResolveLibraryLazy)(Object.assign(Object.assign({}, opts), { packageSet, lib: pkg.lib }))
    };
    for (let [name, target] of Object.entries(pkg.extractions || {})) {
        extractions[name] = await (0, exports.ResolveExtractionTargetLazy)(Object.assign(Object.assign({}, opts), { packageSet: addMaybeLazy(packageSet, pkg.name, self), target }));
    }
    return self;
};
exports.ResolvePackageLazy = ResolvePackageLazy;
exports.ResolvePackage = exports.ResolvePackageLazy;
exports.ResolveLibrary = exports.ResolveLibraryLazy;
exports.ResolveExtractionTarget = exports.ResolveExtractionTargetLazy;
let ResolvePackageSet = (config, log) => async ({ packageSet, packages }) => {
    let resolved_pkgs = {};
    let resolveOne = async (pkgName) => {
        if (resolved_pkgs[pkgName])
            return resolved_pkgs[pkgName];
        if (!packageSet[pkgName])
            throw new Exn_1.PackageSetResolutionError({ packageSet, packages, kind: 'packageNotFound', pkgName });
        let ref = packageSet[pkgName];
        let path_sources;
        if (typeof ref == "string") {
            path_sources = (0, path_1.resolve)(ref);
            if (!await (0, fs_extra_1.pathExists)(path_sources))
                throw new Error("(TODO error message), local package not found, " + ref);
        }
        else {
            let gitRef = ref;
            let path = await Config_1.cachePathOf.package(config, pkgName);
            path_sources = `${path}/src`;
            if (!await (0, fs_extra_1.pathExists)(path_sources))
                await (0, Utils_1.withGitRepo)(gitRef.gitUri, gitRef.rev)(async (temp) => {
                    await (0, fs_extra_1.remove)(temp + '/' + '.git');
                    await (0, fs_extra_1.move)(temp + '/' + gitRef.subpath, path_sources);
                });
        }
        let json_pkg = JSON.parse(await (0, fs_extra_1.readFile)(path_sources + '/' + Config_1.PACKAGE_FILE_NAME, 'utf8'));
        return await (0, Validation_1.mapResult)(Validation_1.validators.packageT.Unresolved(json_pkg), async (unresolved_pkg) => (resolved_pkgs[pkgName] = await (0, exports.ResolvePackageLazy)({ packageSet: resolveOne, pkg: unresolved_pkg, src: path_sources })), errors => {
            throw new Exn_1.PackageSetResolutionError({ packageSet, packages, kind: 'jsonValidationFailure', pkgName, validationError: errors, ref });
        });
    };
    for (let pkg of packages)
        await resolveOne(pkg);
    return resolved_pkgs;
};
exports.ResolvePackageSet = ResolvePackageSet;
//# sourceMappingURL=ResolvePackageSet.js.map