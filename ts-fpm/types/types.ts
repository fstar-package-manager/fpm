export let Resolved = "Resolved";
export let Unresolved = "Unresolved";
export type absolutePath = string;
export type absolutePathToDir = string;
export type checkedFiles = absolutePathToDir;
export type cmxsFile = absolutePath;
export type emailAddress = string;
export type extractionOptions = {
  codegenLib?: namespaceT[];
  inlineModules?: boolean;
  lang: lang;
  normalizePure?: boolean;
};
export type extractionProduct = absolutePathToDir;
export type extractionTarget = {
  Resolved: { lib: library["Resolved"]; opts: extractionOptions };
  Unresolved: { lib: library["Unresolved"]; opts: extractionOptions };
};
export type fstarModule = absolutePath;
export type fuel = { initial?: nat; max?: nat };
export type gitReference = {
  gitUri: string;
  ref: string;
  rev: string;
  subpath: string;
};
export type includePath = absolutePath;
export type lang = "OCaml" | "FSharp" | "Krml" | "Plugin";
export type library = {
  Resolved: {
    dependencies: library["Resolved"][];
    modules: absolutePath[];
    verificationOptions: verificationOptions;
  };
  Unresolved: {
    dependencies: packageName[];
    modules: relativePath[];
    verificationBinaries?: verificationBinaries["Unresolved"];
    verificationOptions: verificationOptions;
  };
};
export type moduleName = string;
export type namespaceT = string;
export type nat = number;
export type ocamlBinaries = {
  OCAMLPATH: string;
  gcc: absolutePath;
  ocamlbin: absolutePathToDir;
  ocamlbuild: absolutePath;
  ocamlfind: absolutePath;
};
export type ocamlPackage = absolutePathToDir;
export type ocamlPackagePlugin = extractionProduct;
export type packageName = string;
export type packageSet = {
  Resolved: { [key: string]: packageT["Resolved"] };
  Unresolved: { [key: string]: gitReference };
};
export type packageT = {
  Resolved: {
    author?: string;
    description?: string;
    extractions?: { [key: string]: extractionTarget["Resolved"] };
    homepage?: string;
    lib: library["Resolved"];
    license?: string;
    license_files?: absolutePath[];
    maintainer?: emailAddress;
    name: string;
    synopsis?: string;
  };
  Unresolved: {
    author?: string;
    description?: string;
    extractions?: { [key: string]: extractionTarget["Unresolved"] };
    homepage?: string;
    lib: library["Unresolved"];
    license?: string;
    license_files?: relativePath[];
    maintainer?: emailAddress;
    name: string;
    synopsis?: string;
  };
};
export type relativePath = string;
export type status = "Unresolved" | "Resolved";
export type verificationBinaries = {
  Resolved: {
    fstar_binary: absolutePath;
    ocamlBinaries: ocamlBinaries;
    z3_binary: absolutePath;
  };
  Unresolved: { fstar_binary?: string; z3_binary?: string };
};
export type verificationOptions = {
  MLish?: boolean;
  fuel?: fuel;
  ifuel?: fuel;
  no_default_include?: boolean;
  no_load_fstartaclib?: boolean;
  no_smt?: boolean;
  quake?: { m?: nat; n: nat; unconditionally?: boolean };
  retry?: nat;
  unsafe_tactic_exec?: boolean;
};
