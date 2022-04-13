import { includePath, fstarModule, verificationBinaries, ocamlBinaries, absolutePathToDir } from "../../types/types"
import { ExtractModules } from "./ExtractModules"
import { OCamlCmxsBuilder } from "./OCamlCmxsBuilder"

export let CmxsOfModules =
    async ({ verificationBinaries, includePaths, modules, ocamlBinaries, cmxsName }: {
        includePaths: includePath[],
        modules: fstarModule[],
        verificationBinaries: verificationBinaries["Resolved"],
        ocamlBinaries: ocamlBinaries,
        cmxsName: string
    }): Promise<absolutePathToDir> => await OCamlCmxsBuilder({
        ocamlBinaries, ocamlPackages: [],
        extractionProduct: await ExtractModules({
            verificationBinaries,
            includePaths,
            modules,
            extractionOptions: { lang: "Plugin" }
        }),
        cmxsName
    });
