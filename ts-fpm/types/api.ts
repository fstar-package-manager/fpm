import {Resolved, Unresolved, absolutePath, absolutePathToDir, checkedFiles, emailAddress, extractionOptions, extractionProduct, extractionTarget, fstarModule, fuel, gitReference, includePath, lang, library, moduleName, namespaceT, nat, ocamlBinaries, ocamlPackage, ocamlPackagePlugin, packageName, packageReference, packageSet, packageT, relativePath, status, verificationBinaries, verificationOptions} from "./types"
export type CollectCheckedOfLibrary = (x: {
  excludeSelf?: boolean;
  lib: library["Resolved"];
  ocamlBinaries: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<checkedFiles[]>;
export type CollectModulesOfLibrary = (x: {
  excludeSelf?: boolean;
  lib: library["Resolved"];
}) => Promise<fstarModule[]>;
export type CollectPluginsOfLibrary = (x: {
  excludeSelf?: boolean;
  lib: library["Resolved"];
  ocamlBinaries: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<ocamlPackagePlugin[]>;
export type ExtractModules = (x: {
  enableLaxMode?: boolean;
  extractionOptions: extractionOptions;
  includePaths: includePath[];
  modules: fstarModule[];
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<extractionProduct>;
export type ExtractTarget = (x: {
  ocamlBinaries: ocamlBinaries;
  target: extractionTarget["Resolved"];
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<extractionProduct>;
export type OCamlPluginBuilder = (x: {
  cmxsName: string;
  extractionProduct: extractionProduct;
  ocamlBinaries: ocamlBinaries;
  ocamlPackages: ocamlPackage[];
}) => Promise<ocamlPackagePlugin>;
export type PluginOfLibrary = (x: {
  lib: library["Resolved"];
  ocamlBinaries: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<ocamlPackagePlugin | undefined>;
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
  ocamlBinaries: ocamlBinaries;
  verificationBinaries: verificationBinaries["Resolved"];
}) => Promise<checkedFiles>;
export type VerifyModules = (x: {
  includePaths: includePath[];
  modules: fstarModule[];
  plugins: ocamlPackagePlugin[];
  verificationBinaries: verificationBinaries["Resolved"];
  verificationOptions: verificationOptions;
}) => Promise<checkedFiles>;
export type api =
  | {
      CollectCheckedOfLibrary: {
        inputT: {
          excludeSelf?: boolean;
          lib: library["Resolved"];
          ocamlBinaries: ocamlBinaries;
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: checkedFiles[];
      };
    }
  | {
      CollectModulesOfLibrary: {
        inputT: { excludeSelf?: boolean; lib: library["Resolved"] };
        outputT: fstarModule[];
      };
    }
  | {
      CollectPluginsOfLibrary: {
        inputT: {
          excludeSelf?: boolean;
          lib: library["Resolved"];
          ocamlBinaries: ocamlBinaries;
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: ocamlPackagePlugin[];
      };
    }
  | {
      ExtractModules: {
        inputT: {
          enableLaxMode?: boolean;
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
          ocamlBinaries: ocamlBinaries;
          target: extractionTarget["Resolved"];
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT: extractionProduct;
      };
    }
  | {
      OCamlPluginBuilder: {
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
      PluginOfLibrary: {
        inputT: {
          lib: library["Resolved"];
          ocamlBinaries: ocamlBinaries;
          verificationBinaries: verificationBinaries["Resolved"];
        };
        outputT?: ocamlPackagePlugin;
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
          ocamlBinaries: ocamlBinaries;
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
          plugins: ocamlPackagePlugin[];
          verificationBinaries: verificationBinaries["Resolved"];
          verificationOptions: verificationOptions;
        };
        outputT: checkedFiles;
      };
    };
export type api_inputs =
  | {
      CollectCheckedOfLibrary: {
        excludeSelf?: boolean;
        lib: library["Resolved"];
        ocamlBinaries: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      CollectModulesOfLibrary: {
        excludeSelf?: boolean;
        lib: library["Resolved"];
      };
    }
  | {
      CollectPluginsOfLibrary: {
        excludeSelf?: boolean;
        lib: library["Resolved"];
        ocamlBinaries: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      ExtractModules: {
        enableLaxMode?: boolean;
        extractionOptions: extractionOptions;
        includePaths: includePath[];
        modules: fstarModule[];
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      ExtractTarget: {
        ocamlBinaries: ocamlBinaries;
        target: extractionTarget["Resolved"];
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      OCamlPluginBuilder: {
        cmxsName: string;
        extractionProduct: extractionProduct;
        ocamlBinaries: ocamlBinaries;
        ocamlPackages: ocamlPackage[];
      };
    }
  | {
      PluginOfLibrary: {
        lib: library["Resolved"];
        ocamlBinaries: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
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
        ocamlBinaries: ocamlBinaries;
        verificationBinaries: verificationBinaries["Resolved"];
      };
    }
  | {
      VerifyModules: {
        includePaths: includePath[];
        modules: fstarModule[];
        plugins: ocamlPackagePlugin[];
        verificationBinaries: verificationBinaries["Resolved"];
        verificationOptions: verificationOptions;
      };
    };
