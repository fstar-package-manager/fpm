import * as types from "./../types/types"
import * as api from "./../types/api"

import {
    CmxsFilesOfLibrary, CmxsOfLibrary,
    IncludePathsOfLibrary, VerifyLibrary,
    ExtractTarget
} from "./library-level/All"
import { CmxsOfModules } from "./module-level/CmxsOfModules"
import { ExtractModules } from "./module-level/ExtractModules"
import { OCamlCmxsBuilder } from "./module-level/OCamlCmxsBuilder"
import { VerifyModules } from "./module-level/VerifyModules"
import { ResolveExtractionTarget, ResolveLibrary, ResolvePackage, ResolvePackageSet } from "./package-level/ResolvePackageSet"
import { Config, mkDefaultConfig } from "./utils/Config"
import { validators, mapResult } from "./utils/Validation"
import { resolveVerificationBinariesWithEnv, UnionToIntersection } from "./utils/Utils"

type apiAll = UnionToIntersection<api.api>
type endpoints = { [key in keyof apiAll]: (x: apiAll[key]["inputT"], destination?: string) => Promise<apiAll[key]["outputT"]> }

let mkEndpoints = (config: Config): endpoints => ({
    CmxsFilesOfLibrary: CmxsFilesOfLibrary(config),
    CmxsOfLibrary: CmxsOfLibrary(config),
    ExtractModules: ExtractModules,
    ExtractTarget: ExtractTarget(config),
    IncludePathsOfLibrary: IncludePathsOfLibrary(config),
    OCamlCmxsBuilder: OCamlCmxsBuilder,
    ResolveBinaries: resolveVerificationBinariesWithEnv,
    ResolveLibrary: ResolveLibrary,
    ResolveExtractionTarget: ResolveExtractionTarget,
    ResolvePackage: ResolvePackage,
    ResolvePackageSet: ResolvePackageSet(config),
    VerifyLibrary: VerifyLibrary(config),
    VerifyModules: VerifyModules,
})

const getKeys = <T extends {}>(o: T): Array<keyof T> => <Array<keyof T>>Object.keys(o);

export let call = (config: Config) => (req: api.api_inputs) => {
    let endpoints = mkEndpoints(config);
    if (Object.keys(req).length > 1)
        throw "TODO msg error: only one action per object";
    // TODO? No idea how to write something generic that typechecks
    // (maybe we don't care actually!)
    if ('CmxsFilesOfLibrary' in req)
        return endpoints.CmxsFilesOfLibrary(req.CmxsFilesOfLibrary)
    else if ('CmxsOfLibrary' in req)
        return endpoints.CmxsOfLibrary(req.CmxsOfLibrary)
    else if ('ExtractModules' in req)
        return endpoints.ExtractModules(req.ExtractModules)
    else if ('ExtractTarget' in req)
        return endpoints.ExtractTarget(req.ExtractTarget)
    else if ('IncludePathsOfLibrary' in req)
        return endpoints.IncludePathsOfLibrary(req.IncludePathsOfLibrary)
    else if ('OCamlCmxsBuilder' in req)
        return endpoints.OCamlCmxsBuilder(req.OCamlCmxsBuilder)
    else if ('ResolveBinaries' in req)
        return endpoints.ResolveBinaries(req.ResolveBinaries)
    else if ('ResolvePackageSet' in req)
        return endpoints.ResolvePackageSet(req.ResolvePackageSet)
    else if ('VerifyLibrary' in req)
        return endpoints.VerifyLibrary(req.VerifyLibrary)
    else if ('VerifyModules' in req)
        return endpoints.VerifyModules(req.VerifyModules)
    else throw "Impossible"
};


export let jsonCli = (config: Config) => (json: object) =>
    mapResult(
        validators.api(json),
        x => call(config)(x) as any,
        error => {
            console.error("[jsonCli] The given object does not conform to [api] schema.");
            console.error("Input object:");
            console.error(json);
            console.error("Validation errors:");
            console.error(error);
        }
    );
