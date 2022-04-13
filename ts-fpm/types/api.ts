import {Resolved, Unresolved, absolutePath, absolutePathToDir, checkedFiles, cmxsFile, extractionOptions, extractionProduct, extractionTarget, fstarModule, fuel, gitReference, includePath, lang, library, moduleName, namespaceT, nat, ocamlBinaries, ocamlPackage, ocamlPackagePlugin, packageName, packageSet, packageT, relativePath, status, verificationBinaries, verificationOptions} from "./types"
export type CmxsFilesOfLibrary = (x: {
  lib: library["Resolved"];
  ocamlBinaries: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<cmxsFile[]>;
export type CmxsOfLibrary = (x: {
  lib: library["Resolved"];
  ocamlBinaries: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<cmxsFile>;
export type ExtractModules = (x: {
  extractionOptions: extractionOptions;
  includePaths: includePath[];
  modules: fstarModule[];
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<extractionProduct>;
export type ExtractTarget = (
  x: extractionTarget["Resolved"]
) => Promise<extractionProduct>;
export type IncludePathsOfLibrary = (x: {
  lib: library["Resolved"];
  ocamlBinaries?: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<includePath[]>;
export type OCamlCmxsBuilder = (x: {
  cmxsName: string;
  extractionProduct: extractionProduct;
  ocamlBinaries: ocamlBinaries;
  ocamlPackages: ocamlPackage[];
}) => Promise<ocamlPackagePlugin>;
export type ResolveBinaries = (
  x: verificationBinaries["Unresolved"]
) => Promise<verificationBinaries["Resolved"]>;
export type ResolveExtractionTarget = (x: {
  extractionTarget: extractionTarget["Unresolved"];
  packageSet: packageSet["Resolved"];
}) => Promise<{
  binEnv: verificationBinaries["Resolved"];
  result: extractionTarget["Resolved"];
}>;
export type ResolveLibrary = (x: {
  library: library["Unresolved"];
  packageSet: packageSet["Resolved"];
}) => Promise<{
  binEnv: verificationBinaries["Resolved"];
  result: library["Resolved"];
}>;
export type ResolvePackage = (x: {
  packageSet: packageSet["Resolved"];
  packageT: packageT["Unresolved"];
}) => Promise<{
  binEnv: extractionTarget["Resolved"];
  result: packageT["Resolved"];
}>;
export type ResolvePackageSet = (x: {
  packageSet: packageSet["Unresolved"];
  packages: string[];
}) => Promise<packageSet["Resolved"]>;
export type VerifyLibrary = (x: {
  lib: library["Resolved"];
  ocamlBinaries?: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<checkedFiles>;
export type VerifyModules = (x: {
  includePaths: includePath[];
  modules: fstarModule[];
  plugins: cmxsFile[];
  verificationBinaries: verificationBinaries["Resolved"];
  verificationOptions: verificationOptions;
}) => Promise<checkedFiles>;
export type api =
  | {
      CmxsFilesOfLibrary: {
        inputT: {
          lib: library["Resolved"];
          ocamlBinaries: ocamlBinaries;
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: cmxsFile[];
      };
    }
  | {
      CmxsOfLibrary: {
        inputT: {
          lib: library["Resolved"];
          ocamlBinaries: ocamlBinaries;
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: cmxsFile;
      };
    }
  | {
      ExtractModules: {
        inputT: {
          extractionOptions: extractionOptions;
          includePaths: includePath[];
          modules: fstarModule[];
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: extractionProduct;
      };
    }
  | {
      ExtractTarget: {
        inputT: extractionTarget["Resolved"];
        outputT: extractionProduct;
      };
    }
  | {
      IncludePathsOfLibrary: {
        inputT: {
          lib: library["Resolved"];
          ocamlBinaries?: ocamlBinaries;
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: includePath[];
      };
    }
  | {
      OCamlCmxsBuilder: {
        inputT: {
          cmxsName: string;
          extractionProduct: extractionProduct;
          ocamlBinaries: ocamlBinaries;
          ocamlPackages: ocamlPackage[];
        };
        outputT: ocamlPackagePlugin;
      };
    }
  | {
      ResolveBinaries: {
        inputT: verificationBinaries["Unresolved"];
        outputT: verificationBinaries["Resolved"];
      };
    }
  | {
      ResolveExtractionTarget: {
        inputT: {
          extractionTarget: extractionTarget["Unresolved"];
          packageSet: packageSet["Resolved"];
        };
        outputT: {
          binEnv: verificationBinaries["Resolved"];
          result: extractionTarget["Resolved"];
        };
      };
    }
  | {
      ResolveLibrary: {
        inputT: {
          library: library["Unresolved"];
          packageSet: packageSet["Resolved"];
        };
        outputT: {
          binEnv: verificationBinaries["Resolved"];
          result: library["Resolved"];
        };
      };
    }
  | {
      ResolvePackage: {
        inputT: {
          packageSet: packageSet["Resolved"];
          packageT: packageT["Unresolved"];
        };
        outputT: {
          binEnv: extractionTarget["Resolved"];
          result: packageT["Resolved"];
        };
      };
    }
  | {
      ResolvePackageSet: {
        inputT: { packageSet: packageSet["Unresolved"]; packages: string[] };
        outputT: packageSet["Resolved"];
      };
    }
  | {
      VerifyLibrary: {
        inputT: {
          lib: library["Resolved"];
          ocamlBinaries?: ocamlBinaries;
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: checkedFiles;
      };
    }
  | {
      VerifyModules: {
        inputT: {
          includePaths: includePath[];
          modules: fstarModule[];
          plugins: cmxsFile[];
          verificationBinaries: verificationBinaries["Resolved"];
          verificationOptions: verificationOptions;
        };
        outputT: checkedFiles;
      };
    };
