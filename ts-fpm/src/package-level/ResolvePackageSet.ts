import * as types from "./../../types/types"
import * as api from "./../../types/api"
import "buffer"
import { readFile, move, remove, pathExists } from "fs-extra"
import { withGitRepo } from './../utils/Utils';
import { Config, cachePathOf, PACKAGE_FILE_NAME } from '../utils/Config';
import { validators, mapResult, AjvError } from "./../utils/Validation"


class PackageSetResolutionError extends Error {
    constructor(public cause: (
        {
            packageSet: types.packageSet["Unresolved"],
            packages: string[]
        } & (
            { kind: 'packageNotFound', pkgName: string } |
            { kind: 'jsonValidationFailure', validationError: AjvError }
        )
    )) {
        super();
    }
    get message() {
        return "[PackageSetResolutionError.message] TODO";
    }
}

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
                async unresolved_pkg => {
                    let resolved_pkg: types.packageT["Resolved"] = {
                        name: unresolved_pkg.name,
                        lib: {
                            dependencies: await Promise.all( // sequential?
                                unresolved_pkg.lib.dependencies.map(async l => (await resolveOne(l)).lib)
                            ),
                            modules: unresolved_pkg.lib.modules.map(rel => `${path_sources}/${rel}`), // TODO better transformation from rel path to abs one
                            verificationOptions: unresolved_pkg.lib.verificationOptions
                        }
                    } as any;
                    return resolved_pkgs[pkgName] = resolved_pkg;
                },
                errors => {
                    throw new PackageSetResolutionError({ packageSet, packages, kind: 'jsonValidationFailure', validationError: errors })
                }
            );
        };
        for (let pkg of packages)
            await resolveOne(pkg);
        return resolved_pkgs;
    };
