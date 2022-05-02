import * as types from "./../types/types"
import * as api from "./../types/api"

import {
    PluginOfLibrary, VerifyLibrary, ExtractTarget,
    CollectCheckedOfLibrary, CollectModulesOfLibrary, CollectPluginsOfLibrary
} from "./library-level/All"
import { ExtractModules } from "./module-level/ExtractModules"
import { OCamlPluginBuilder } from "./module-level/OCamlPluginBuilder"
import { VerifyModules } from "./module-level/VerifyModules"
import { ResolveExtractionTarget, ResolveLibrary, ResolvePackage, ResolvePackageSet } from "./package-level/ResolvePackageSet"
import { Config, mkDefaultConfig } from "./utils/Config"
import { validators, mapResult } from "./utils/Validation"
import { resolveVerificationBinariesWithEnv, UnionToIntersection } from "./utils/Utils"

import { Logger, rootLogger } from "./utils/Log"

let x: { oo?: string } = 0 as any

let _ = x.oo

type apiAll = UnionToIntersection<api.api>
type endpoints = { [key in keyof apiAll]: (x: apiAll[key]["inputT"], destination?: string) => Promise<apiAll[key]["outputT"]> }

let mkEndpoints = (config: Config, log: Logger): endpoints => ({
    CollectPluginsOfLibrary: CollectPluginsOfLibrary(config, log),
    CollectCheckedOfLibrary: CollectCheckedOfLibrary(config, log),
    CollectModulesOfLibrary: CollectModulesOfLibrary(config, log),
    PluginOfLibrary: PluginOfLibrary(config, log),
    ExtractModules: ExtractModules(log),
    ExtractTarget: ExtractTarget(config, log),
    OCamlPluginBuilder: OCamlPluginBuilder(log),
    ResolveBinaries: resolveVerificationBinariesWithEnv,
    ResolveLibrary: ResolveLibrary,
    ResolveExtractionTarget: ResolveExtractionTarget,
    ResolvePackage: ResolvePackage,
    ResolvePackageSet: ResolvePackageSet(config, log),
    VerifyLibrary: VerifyLibrary(config, log),
    VerifyModules: VerifyModules(log),
})

const getKeys = <T extends {}>(o: T): Array<keyof T> => <Array<keyof T>>Object.keys(o);

export let call = (config: Config, log: Logger) => (req: api.api_inputs) => {
    let endpoints = mkEndpoints(config, log);
    if (Object.keys(req).length > 1)
        throw "TODO msg error: only one action per object";
    // TODO? No idea how to write something generic that typechecks
    // (maybe we don't care actually!)
    if ('CollectPluginsOfLibrary' in req)
        return endpoints.CollectPluginsOfLibrary(req.CollectPluginsOfLibrary)
    if ('CollectCheckedOfLibrary' in req)
        return endpoints.CollectCheckedOfLibrary(req.CollectCheckedOfLibrary)
    if ('CollectModulesOfLibrary' in req)
        return endpoints.CollectModulesOfLibrary(req.CollectModulesOfLibrary)
    else if ('PluginOfLibrary' in req)
        return endpoints.PluginOfLibrary(req.PluginOfLibrary)
    else if ('ExtractModules' in req)
        return endpoints.ExtractModules(req.ExtractModules)
    else if ('ExtractTarget' in req)
        return endpoints.ExtractTarget(req.ExtractTarget)
    else if ('OCamlPluginBuilder' in req)
        return endpoints.OCamlPluginBuilder(req.OCamlPluginBuilder)
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
        x => call(config, rootLogger)(x) as any,
        error => {
            console.error("[jsonCli] The given object does not conform to [api] schema.");
            console.error("Input object:");
            console.error(json);
            console.error("Validation errors:");
            console.error(error);
        }
    );
