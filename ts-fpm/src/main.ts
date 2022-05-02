import { VerifyModules } from "./module-level/VerifyModules"
import { ExtractModules } from "./module-level/ExtractModules"
import * as types from "./../types/types"
import * as api from "./../types/api"
import "buffer"
import * as path from "path"

import { Config, getUnresolvedPackageSet } from './utils/Config'
import { ocamlBinariesOfEnv } from './utils/Utils'
import { ResolvePackageSet } from './package-level/ResolvePackageSet'
import { VerifyLibrary } from './library-level/All'
import { rootLogger } from "./utils/Log"

function readStream(stream: NodeJS.ReadWriteStream, encoding: BufferEncoding = "utf8"):
    Promise<string> {
    stream.setEncoding(encoding);
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("data", chunk => data += chunk);
        stream.on("end", () => resolve(data));
        stream.on("error", error => reject(error));
    });
}



let ExtractTarget = "TODO" as any as api.ExtractTarget;

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

(async () => {
    let ocamlBins = await ocamlBinariesOfEnv();

    let config: Config = {
        defaultPackageSet: "git@github.com:fstar-package-manager/fstarpkgs.git",
        cachePath: process.cwd() + "/.fpm"
    };
    if (!path.isAbsolute(config.cachePath)) {
        console.error('config =', config);
        throw "[config.cachePath] should be an absolute path.";
    }
    // await prepareCache(config);
    let unresolved_ps = await getUnresolvedPackageSet(config);
    // let { rev, packageSet: unresolved_ps } = await readPackageSet(cachePackageSetPath(config));
    let ps = await ResolvePackageSet(config, rootLogger)({
        packageSet: unresolved_ps,
        packages: ['foo']
    });

    await VerifyLibrary(config, rootLogger)({
        lib: ps['foo'].lib,
        verificationBinaries: ({ fstar_binary: "fstar.exe", z3_binary: "z3.exe" } as any),
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
})();


// let test: api.verify_library = {} as any


