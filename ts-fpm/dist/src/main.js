"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
require("buffer");
const path = __importStar(require("path"));
const Config_1 = require("./utils/Config");
const Utils_1 = require("./utils/Utils");
const ResolvePackageSet_1 = require("./package-level/ResolvePackageSet");
const All_1 = require("./library-level/All");
function readStream(stream, encoding = "utf8") {
    stream.setEncoding(encoding);
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("data", chunk => data += chunk);
        stream.on("end", () => resolve(data));
        stream.on("error", error => reject(error));
    });
}
let ExtractTarget = "TODO";
// let FStarWrapper = (config: Config, pkg: types.packageT["Resolved"]) =>
//     (args: string[]) => {
//         let includes = IncludePathsOfLibrary(config)({
//             lib: pkg.lib, verificationBinaries, ocamlBinaries
//         });
//     };
// type xx = Extract<api.api, { CmxsFilesOfLibrary: any }>
// async function runRequest(request: api.api): Promise<any> {
//     if ('VerifyModules' in request) {
//         let x = request.VerifyModules;
//         return VerifyModules(x.input, x.destination);
//     } else if ('OCamlCmxsBuilder' in request) {
//         let x = request.OCamlCmxsBuilder;
//         return OCamlCmxsBuilder(x.input, x.destination);
//     } else if ('ExtractModules' in request) {
//         let x = request.ExtractModules;
//         return ExtractModules(x.input, x.destination);
//     } else if ('VerifyLibrary' in request) {
//         throw "[VerifyLibrary] not implemented"
//     } else if ('CmxsOfLibrary' in request) {
//         throw "[CmxsOfLibrary] not implemented"
//     } else if ('IncludePathsOfLibrary' in request) {
//         throw "[IncludePathsOfLibrary] not implemented"
//     } else if ('CmxsFilesOfLibrary' in request) {
//         throw "[CmxsFilesOfLibrary] not implemented"
//     } else if ('ExtractTarget' in request) {
//         throw "[ExtractTarget] not implemented"
//     } else if ('ResolvePackageSet' in request) {
//         throw "[ResolvePackageSet] not implemented"
//     } else if ('ResolveBinaries' in request) {
//         throw "[ResolveBinaries] not implemented"
//     } else if ('ResolveLibrary' in request) {
//         throw "[ResolveLibrary] not implemented"
//     } else if ('ResolveExtractionTarget' in request) {
//         throw "[ResolveExtractionTarget] not implemented"
//     } else if ('ResolvePackage' in request) {
//         throw "[ResolvePackage] not implemented"
//     } else {
//     }
// }
(() => __awaiter(void 0, void 0, void 0, function* () {
    let ocamlBins = yield (0, Utils_1.ocamlBinariesOfEnv)();
    let config = {
        defaultPackageSet: "git@github.com:fstar-package-manager/fstarpkgs.git",
        cachePath: process.cwd() + "/.fpm"
    };
    if (!path.isAbsolute(config.cachePath)) {
        console.error('config =', config);
        throw "[config.cachePath] should be an absolute path.";
    }
    // await prepareCache(config);
    let unresolved_ps = yield (0, Config_1.getUnresolvedPackageSet)(config);
    // let { rev, packageSet: unresolved_ps } = await readPackageSet(cachePackageSetPath(config));
    let ps = yield (0, ResolvePackageSet_1.ResolvePackageSet)(config)({
        packageSet: unresolved_ps,
        packages: ['foo']
    });
    yield (0, All_1.VerifyLibrary)(config)({
        lib: ps['foo'].lib,
        verificationBinaries: { fstar_binary: "fstar.exe", z3_binary: "z3.exe" },
        ocamlBinaries: ocamlBins
    });
    // let request = JSON.parse(await readStream(process.stdin));
    // let validate = ajv.getSchema('#/definitions/api');
    // if (!validate)
    //     throw 'Could not find schema';
    // if (!validate(request)) {
    //     console.error("The JSON read in stdin is invalid:");
    //     console.error(validate.errors);
    //     process.exit(1);
    // } else
    //     runRequest(request as any);
}))();
// let test: api.verify_library = {} as any
//# sourceMappingURL=main.js.map