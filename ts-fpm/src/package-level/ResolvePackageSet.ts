import * as types from "./../../types/types"
import * as api from "./../../types/api"
import "buffer"
import { readFile, move, remove, pathExists } from "fs-extra"
import { withGitRepo } from './../utils/Utils';
import { Config, cachePathOf, PACKAGE_FILE_NAME } from '../utils/Config';
import { validators, mapResult, AjvError } from "./../utils/Validation"
import { PackageSetResolutionError } from "../utils/Exn";

type maybeLazy<T> = ((x: string) => Promise<T>) | { [key: string]: T }
async function callMaybeLazy<T>(f: maybeLazy<T>, x: string) {
    if (f instanceof Function)
        return await f(x);
    return f[x];
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
        lib.dependencies.map(async l => (await callMaybeLazy(packageSet, l)).lib)
    ),
    modules: lib.modules.map(rel => `${src}/${rel}`), // TODO better transformation from rel path to abs one
    verificationOptions: lib.verificationOptions
});
export let ResolveExtractionTargetLazy = async (
    { target, ...opts }: {
        packageSet: maybeLazyPackageSet,
        target: types.extractionTarget["Unresolved"],
        src: types.absolutePath
    }
): Promise<types.extractionTarget["Resolved"]> => ({
    lib: await ResolveLibraryLazy({ ...opts, lib: target.lib }),
    opts: target.opts
});
export let ResolvePackageLazy = async (
    { pkg, ...opts }: {
        packageSet: maybeLazyPackageSet,
        pkg: types.packageT["Unresolved"],
        src: types.absolutePath
    }
): Promise<types.packageT["Resolved"]> => {
    let extractions: types.packageT["Resolved"]["extractions"] = {};
    for (let [name, target] of Object.entries(pkg.extractions || {}))
        extractions[name] = await ResolveExtractionTargetLazy({ ...opts, target });
    return {
        name: pkg.name, extractions,
        lib: await ResolveLibraryLazy({ ...opts, lib: pkg.lib })
    };
}

export let ResolvePackage: api.ResolvePackage = ResolvePackageLazy
export let ResolveLibrary: api.ResolveLibrary = ResolveLibraryLazy
export let ResolveExtractionTarget: api.ResolveExtractionTarget = ResolveExtractionTargetLazy

export let ResolvePackageSet = (config: Config): api.ResolvePackageSet =>
    async ({ packageSet, packages }): Promise<types.packageSet["Resolved"]> => {
        let resolved_pkgs: { [key: string]: types.packageT["Resolved"] } = {};
        let resolveOne = async (pkgName: string): Promise<types.packageT["Resolved"]> => {
            if (resolved_pkgs[pkgName])
                return resolved_pkgs[pkgName];
            if (!packageSet[pkgName])
                throw new PackageSetResolutionError({ packageSet, packages, kind: 'packageNotFound', pkgName });
            let gitRef: types.gitReference = packageSet[pkgName];
            let path = await cachePathOf.package(config, pkgName);
            let path_sources = `${path}/src`;
            if (!await pathExists(path_sources))
                await withGitRepo(gitRef.gitUri, gitRef.rev)(async temp => {
                    await remove(temp + '/' + '.git');
                    await move(temp + '/' + gitRef.subpath, path_sources);
                });
            let json_pkg = JSON.parse(await readFile(path_sources + '/' + PACKAGE_FILE_NAME, 'utf8'));
            return await mapResult(
                validators.packageT.Unresolved(json_pkg),
                async unresolved_pkg =>
                    (resolved_pkgs[pkgName] = await ResolvePackageLazy({ packageSet: resolveOne, pkg: unresolved_pkg, src: path_sources })),
                errors => {
                    throw new PackageSetResolutionError({ packageSet, packages, kind: 'jsonValidationFailure', pkgName, validationError: errors, gitRef })
                }
            );
        };
        for (let pkg of packages)
            await resolveOne(pkg);
        return resolved_pkgs;
    };
