import {Resolved, Unresolved, absolutePath, absolutePathToDir, checkedFiles, cmxsFile, emailAddress, extractionOptions, extractionProduct, extractionTarget, fstarModule, fuel, gitReference, includePath, lang, library, moduleName, namespaceT, nat, ocamlBinaries, ocamlPackage, ocamlPackagePlugin, packageName, packageSet, packageT, relativePath, status, verificationBinaries, verificationOptions} from "./types"
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
export type ExtractTarget = (x: {
  ocamlBinaries?: ocamlBinaries;
  target: extractionTarget["Resolved"];
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<extractionProduct>;
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
  packageSet: packageSet["Resolved"];
  src: absolutePath;
  target: extractionTarget["Unresolved"];
}) => Promise<extractionTarget["Resolved"]>;
export type ResolveLibrary = (x: {
  lib: library["Unresolved"];
  packageSet: packageSet["Resolved"];
  src: absolutePath;
}) => Promise<library["Resolved"]>;
export type ResolvePackage = (x: {
  packageSet: packageSet["Resolved"];
  pkg: packageT["Unresolved"];
  src: absolutePath;
}) => Promise<packageT["Resolved"]>;
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
        inputT: {
          ocamlBinaries?: ocamlBinaries;
          target: extractionTarget["Resolved"];
          verificationBinaries: verificationBinaries["Resolved"];
        };
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
          packageSet: packageSet["Resolved"];
          src: absolutePath;
          target: extractionTarget["Unresolved"];
        };
        outputT: extractionTarget["Resolved"];
      };
    }
  | {
      ResolveLibrary: {
        inputT: {
          lib: library["Unresolved"];
          packageSet: packageSet["Resolved"];
          src: absolutePath;
        };
        outputT: library["Resolved"];
      };
    }
  | {
      ResolvePackage: {
        inputT: {
          packageSet: packageSet["Resolved"];
          pkg: packageT["Unresolved"];
          src: absolutePath;
        };
        outputT: packageT["Resolved"];
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
export type api_inputs =
  | {
      CmxsFilesOfLibrary: {
        lib: library["Resolved"];
        ocamlBinaries: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      CmxsOfLibrary: {
        lib: library["Resolved"];
        ocamlBinaries: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      ExtractModules: {
        extractionOptions: extractionOptions;
        includePaths: includePath[];
        modules: fstarModule[];
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      ExtractTarget: {
        ocamlBinaries?: ocamlBinaries;
        target: extractionTarget["Resolved"];
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      IncludePathsOfLibrary: {
        lib: library["Resolved"];
        ocamlBinaries?: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      OCamlCmxsBuilder: {
        cmxsName: string;
        extractionProduct: extractionProduct;
        ocamlBinaries: ocamlBinaries;
        ocamlPackages: ocamlPackage[];
      };
    }
  | { ResolveBinaries: verificationBinaries["Unresolved"] }
  | {
      ResolveExtractionTarget: {
        packageSet: packageSet["Resolved"];
        src: absolutePath;
        target: extractionTarget["Unresolved"];
      };
    }
  | {
      ResolveLibrary: {
        lib: library["Unresolved"];
        packageSet: packageSet["Resolved"];
        src: absolutePath;
      };
    }
  | {
      ResolvePackage: {
        packageSet: packageSet["Resolved"];
        pkg: packageT["Unresolved"];
        src: absolutePath;
      };
    }
  | {
      ResolvePackageSet: {
        packageSet: packageSet["Unresolved"];
        packages: string[];
      };
    }
  | {
      VerifyLibrary: {
        lib: library["Resolved"];
        ocamlBinaries?: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      VerifyModules: {
        includePaths: includePath[];
        modules: fstarModule[];
        plugins: cmxsFile[];
        verificationBinaries: verificationBinaries["Resolved"];
        verificationOptions: verificationOptions;
      };
    };
