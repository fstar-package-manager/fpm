"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonCli = exports.call = void 0;
const All_1 = require("./library-level/All");
const ExtractModules_1 = require("./module-level/ExtractModules");
const OCamlCmxsBuilder_1 = require("./module-level/OCamlCmxsBuilder");
const VerifyModules_1 = require("./module-level/VerifyModules");
const ResolvePackageSet_1 = require("./package-level/ResolvePackageSet");
const Validation_1 = require("./utils/Validation");
const Utils_1 = require("./utils/Utils");
let mkEndpoints = (config) => ({
    CmxsFilesOfLibrary: (0, All_1.CmxsFilesOfLibrary)(config),
    CmxsOfLibrary: (0, All_1.CmxsOfLibrary)(config),
    ExtractModules: ExtractModules_1.ExtractModules,
    ExtractTarget: (0, All_1.ExtractTarget)(config),
    IncludePathsOfLibrary: (0, All_1.IncludePathsOfLibrary)(config),
    OCamlCmxsBuilder: OCamlCmxsBuilder_1.OCamlCmxsBuilder,
    ResolveBinaries: Utils_1.resolveVerificationBinariesWithEnv,
    ResolveLibrary: ResolvePackageSet_1.ResolveLibrary,
    ResolveExtractionTarget: ResolvePackageSet_1.ResolveExtractionTarget,
    ResolvePackage: ResolvePackageSet_1.ResolvePackage,
    ResolvePackageSet: (0, ResolvePackageSet_1.ResolvePackageSet)(config),
    VerifyLibrary: (0, All_1.VerifyLibrary)(config),
    VerifyModules: VerifyModules_1.VerifyModules,
});
const getKeys = (o) => Object.keys(o);
let call = (config) => (req) => {
    let endpoints = mkEndpoints(config);
    if (Object.keys(req).length > 1)
        throw "TODO msg error: only one action per object";
    // TODO? No idea how to write something generic that typechecks
    // (maybe we don't care actually!)
    if ('CmxsFilesOfLibrary' in req)
        return endpoints.CmxsFilesOfLibrary(req.CmxsFilesOfLibrary);
    else if ('CmxsOfLibrary' in req)
        return endpoints.CmxsOfLibrary(req.CmxsOfLibrary);
    else if ('ExtractModules' in req)
        return endpoints.ExtractModules(req.ExtractModules);
    else if ('ExtractTarget' in req)
        return endpoints.ExtractTarget(req.ExtractTarget);
    else if ('IncludePathsOfLibrary' in req)
        return endpoints.IncludePathsOfLibrary(req.IncludePathsOfLibrary);
    else if ('OCamlCmxsBuilder' in req)
        return endpoints.OCamlCmxsBuilder(req.OCamlCmxsBuilder);
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
let jsonCli = (config) => (json) => (0, Validation_1.mapResult)(Validation_1.validators.api(json), x => (0, exports.call)(config)(x), error => {
    console.error("[jsonCli] The given object does not conform to [api] schema.");
    console.error("Input object:");
    console.error(json);
    console.error("Validation errors:");
    console.error(error);
});
exports.jsonCli = jsonCli;
//# sourceMappingURL=endpoints.js.map