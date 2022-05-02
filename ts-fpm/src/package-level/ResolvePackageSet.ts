import * as types from "./../../types/types"
import * as api from "./../../types/api"
import "buffer"
import { readFile, move, remove, pathExists } from "fs-extra"
import { resolve } from "path"
import { withGitRepo } from './../utils/Utils';
import { Config, cachePathOf, PACKAGE_FILE_NAME } from '../utils/Config';
import { validators, mapResult, AjvError } from "./../utils/Validation"
import { PackageSetResolutionError } from "../utils/Exn";
import { Logger } from "../utils/Log"

type maybeLazy<T> = ((x: string) => Promise<T>) | { [key: string]: T }
async function callMaybeLazy<T>(f: maybeLazy<T>, x: string) {
    if (f instanceof Function)
        return await f(x);
    return f[x];
}
function addMaybeLazy<T>(f: maybeLazy<T>, k: string, v: T): maybeLazy<T> {
    if (f instanceof Function)
        return async (x: string) => x == k ? v : await f(x);
    return { ...f, [k]: v };
}
type maybeLazyPackageSet = maybeLazy<types.packageT["Resolved"]>

export let ResolveLibraryLazy = async (
    { packageSet, lib, src }: {
        packageSet: maybeLazyPackageSet,
        lib: types.library["Unresolved"],
        src: types.absolutePath
    }
): Promise<types.library["Resolved"]> => ({
    dependencies: await Promise.all( // sequential?
        lib.dependencies.map(async l => {
            let o = (await callMaybeLazy(packageSet, l)).lib;
            // If the current library is verified with lax, its dependencies should be checked with lax as well
            if (lib.verificationOptions.lax)
                return { ...o, verificationOptions: { ...o.verificationOptions, lax: true } };
            else if (lib.verificationOptions.lax)
                throw Error("TODO: WRITE ERROR (something like: a non-MLish library depends on a MLish one, this is forbidden)");
            return o;
        })
    ),
    plugin_ocaml_disable: lib.plugin_ocaml_disable,
    plugin_ocaml_modules: (lib.plugin_ocaml_modules || []).map(rel => resolve(`${src}/${rel}`)), // TODO better transformation from rel path to abs one
    modules: lib.modules.map(rel => resolve(`${src}/${rel}`)), // TODO better transformation from rel path to abs one
    verificationOptions: lib.verificationOptions
});
export let ResolveExtractionTargetLazy = async (
    { target, ...opts }: {
        packageSet: maybeLazyPackageSet,
        target: types.extractionTarget["Unresolved"],
        src: types.absolutePath
    }
): Promise<types.extractionTarget["Resolved"]> => ({
    lib: typeof target.lib == 'string'
        ? (await callMaybeLazy(opts.packageSet, target.lib)).lib
        : await ResolveLibraryLazy({ ...opts, lib: target.lib }),
    opts: target.opts
});
export let ResolvePackageLazy = async (
    { pkg, packageSet, ...opts }: {
        packageSet: maybeLazyPackageSet,
        pkg: types.packageT["Unresolved"],
        src: types.absolutePath
    }
): Promise<types.packageT["Resolved"]> => {
    let extractions: types.packageT["Resolved"]["extractions"] = {};
    let self = {
        name: pkg.name, extractions,
        lib: await ResolveLibraryLazy({ ...opts, packageSet, lib: pkg.lib })
    };
    for (let [name, target] of Object.entries(pkg.extractions || {})) {
        extractions[name] = await ResolveExtractionTargetLazy({ ...opts, packageSet: addMaybeLazy(packageSet, pkg.name, self), target });
    }
    return self;
}

export let ResolvePackage: api.ResolvePackage = ResolvePackageLazy
export let ResolveLibrary: api.ResolveLibrary = ResolveLibraryLazy
export let ResolveExtractionTarget: api.ResolveExtractionTarget = ResolveExtractionTargetLazy

export let ResolvePackageSet = (config: Config, log: Logger): api.ResolvePackageSet =>
    async ({ packageSet, packages }): Promise<types.packageSet["Resolved"]> => {
        let resolved_pkgs: { [key: string]: types.packageT["Resolved"] } = {};
        let resolveOne = async (pkgName: string): Promise<types.packageT["Resolved"]> => {
            if (resolved_pkgs[pkgName])
                return resolved_pkgs[pkgName];
            if (!packageSet[pkgName])
                throw new PackageSetResolutionError({ packageSet, packages, kind: 'packageNotFound', pkgName });
            let ref: types.packageReference = packageSet[pkgName];
            let path_sources: string;
            if (typeof ref == "string") {
                path_sources = resolve(ref);
                if (!await pathExists(path_sources))
                    throw new Error("(TODO error message), local package not found, " + ref);
            } else {
                let gitRef: types.gitReference = ref;
                let path = await cachePathOf.package(config, pkgName);
                path_sources = `${path}/src`;
                if (!await pathExists(path_sources))
                    await withGitRepo(gitRef.gitUri, gitRef.rev)(async temp => {
                        await remove(temp + '/' + '.git');
                        await move(temp + '/' + gitRef.subpath, path_sources);
                    });
            }
            let json_pkg = JSON.parse(await readFile(path_sources + '/' + PACKAGE_FILE_NAME, 'utf8'));
            return await mapResult(
                validators.packageT.Unresolved(json_pkg),
                async unresolved_pkg =>
                    (resolved_pkgs[pkgName] = await ResolvePackageLazy({ packageSet: resolveOne, pkg: unresolved_pkg, src: path_sources })),
                errors => {
                    throw new PackageSetResolutionError({ packageSet, packages, kind: 'jsonValidationFailure', pkgName, validationError: errors, ref })
                }
            );
        };
        for (let pkg of packages)
            await resolveOne(pkg);
        return resolved_pkgs;
    };
