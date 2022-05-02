"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonCli = exports.call = void 0;
const All_1 = require("./library-level/All");
const ExtractModules_1 = require("./module-level/ExtractModules");
const OCamlPluginBuilder_1 = require("./module-level/OCamlPluginBuilder");
const VerifyModules_1 = require("./module-level/VerifyModules");
const ResolvePackageSet_1 = require("./package-level/ResolvePackageSet");
const Validation_1 = require("./utils/Validation");
const Utils_1 = require("./utils/Utils");
const Log_1 = require("./utils/Log");
let x = 0;
let _ = x.oo;
let mkEndpoints = (config, log) => ({
    CollectPluginsOfLibrary: (0, All_1.CollectPluginsOfLibrary)(config, log),
    CollectCheckedOfLibrary: (0, All_1.CollectCheckedOfLibrary)(config, log),
    CollectModulesOfLibrary: (0, All_1.CollectModulesOfLibrary)(config, log),
    PluginOfLibrary: (0, All_1.PluginOfLibrary)(config, log),
    ExtractModules: (0, ExtractModules_1.ExtractModules)(log),
    ExtractTarget: (0, All_1.ExtractTarget)(config, log),
    OCamlPluginBuilder: (0, OCamlPluginBuilder_1.OCamlPluginBuilder)(log),
    ResolveBinaries: Utils_1.resolveVerificationBinariesWithEnv,
    ResolveLibrary: ResolvePackageSet_1.ResolveLibrary,
    ResolveExtractionTarget: ResolvePackageSet_1.ResolveExtractionTarget,
    ResolvePackage: ResolvePackageSet_1.ResolvePackage,
    ResolvePackageSet: (0, ResolvePackageSet_1.ResolvePackageSet)(config, log),
    VerifyLibrary: (0, All_1.VerifyLibrary)(config, log),
    VerifyModules: (0, VerifyModules_1.VerifyModules)(log),
});
const getKeys = (o) => Object.keys(o);
let call = (config, log) => (req) => {
    let endpoints = mkEndpoints(config, log);
    if (Object.keys(req).length > 1)
        throw "TODO msg error: only one action per object";
    // TODO? No idea how to write something generic that typechecks
    // (maybe we don't care actually!)
    if ('CollectPluginsOfLibrary' in req)
        return endpoints.CollectPluginsOfLibrary(req.CollectPluginsOfLibrary);
    if ('CollectCheckedOfLibrary' in req)
        return endpoints.CollectCheckedOfLibrary(req.CollectCheckedOfLibrary);
    if ('CollectModulesOfLibrary' in req)
        return endpoints.CollectModulesOfLibrary(req.CollectModulesOfLibrary);
    else if ('PluginOfLibrary' in req)
        return endpoints.PluginOfLibrary(req.PluginOfLibrary);
    else if ('ExtractModules' in req)
        return endpoints.ExtractModules(req.ExtractModules);
    else if ('ExtractTarget' in req)
        return endpoints.ExtractTarget(req.ExtractTarget);
    else if ('OCamlPluginBuilder' in req)
        return endpoints.OCamlPluginBuilder(req.OCamlPluginBuilder);
    else if ('ResolveBinaries' in req)
        return endpoints.ResolveBinaries(req.ResolveBinaries);
    else if ('ResolvePackageSet' in req)
        return endpoints.ResolvePackageSet(req.ResolvePackageSet);
    else if ('VerifyLibrary' in req)
        return endpoints.VerifyLibrary(req.VerifyLibrary);
    else if ('VerifyModules' in req)
        return endpoints.VerifyModules(req.VerifyModules);
    else
        throw "Impossible";
};
exports.call = call;
let jsonCli = (config) => (json) => (0, Validation_1.mapResult)(Validation_1.validators.api(json), x => (0, exports.call)(config, Log_1.rootLogger)(x), error => {
    console.error("[jsonCli] The given object does not conform to [api] schema.");
    console.error("Input object:");
    console.error(json);
    console.error("Validation errors:");
    console.error(error);
});
exports.jsonCli = jsonCli;
//# sourceMappingURL=endpoints.js.map