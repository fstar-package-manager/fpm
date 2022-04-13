{
  types,
  lib
}:
let
  mkEndpoint = inT: outT: {inherit inT outT;};
  t = types;
  list = t.list;
  option = t.option;
  struct = t.struct;
  library = t.library;
  # api = types.sum "api" {
  #   hey = t.string;
  # };
  api = types.sum "api" (lib.mapAttrs (k: {inT, outT}:
    (struct "anon" {
      inputT  = inT;
      outputT = outT;
    })
  ) actions');
  actions = lib.mapAttrs (k: {inT, outT}:
    types.defun [inT outT]
  ) actions';
  actions' = {
    CmxsFilesOfLibrary = mkEndpoint
      (t.struct "CmxsFilesOfLibrary" {
        lib = library t.Resolved;
        ocamlBinaries = t.ocamlBinaries;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (t.list t.cmxsFile);
    CmxsOfLibrary = mkEndpoint
      (struct "CmxsOfLibrary" {
        lib = library t.Resolved;
        ocamlBinaries = t.ocamlBinaries;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (t.cmxsFile);
    ExtractModules = mkEndpoint
      (struct "ExtractModules" {
        extractionOptions = t.extractionOptions;
        includePaths = list t.includePath;
        modules = list t.fstarModule;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) t.extractionProduct;
    ExtractTarget = mkEndpoint
      (t.extractionTarget t.Resolved)
      (t.extractionProduct);
    IncludePathsOfLibrary = mkEndpoint
      (struct "IncludePathsOfLibrary" {
        lib = library t.Resolved;
        ocamlBinaries = option t.ocamlBinaries;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (list t.includePath);
    OCamlCmxsBuilder = mkEndpoint
      (struct "OCamlCmxsBuilder" {
        cmxsName = t.string;
        extractionProduct = t.extractionProduct;
        ocamlBinaries = t.ocamlBinaries;
        ocamlPackages = list t.ocamlPackage;
      }) (t.ocamlPackagePlugin);
    ResolveBinaries = mkEndpoint
      (t.verificationBinaries t.Unresolved)
      (t.verificationBinaries t.Resolved);
    ResolveExtractionTarget = mkEndpoint
      (struct "ResolveExtractionTarget" {
        extractionTarget = t.extractionTarget t.Unresolved;
        packageSet = t.packageSet t.Resolved;
      })
      (struct "ResolveExtractionTarget-out" {
        binEnv = t.verificationBinaries t.Resolved;
        result = t.extractionTarget t.Resolved;
      });
    ResolveLibrary = mkEndpoint
      (struct "ResolveLibrary" {
        library = library t.Unresolved;
        packageSet = t.packageSet t.Resolved;
      })
      (struct "ResolveLibrary-out" {
        binEnv = t.verificationBinaries t.Resolved;
        result = library t.Resolved;
      });
    ResolvePackage = mkEndpoint
      (struct "ResolvePackage" {
        packageT = t.packageT t.Unresolved;
        packageSet = t.packageSet t.Resolved;
      })
      (struct "ResolvePackage-out" {
        binEnv = t.extractionTarget t.Resolved;
        result = t.packageT t.Resolved;
      });
    ResolvePackageSet = mkEndpoint
      (struct "ResolvePackageSet" {
        packageSet = t.packageSet t.Unresolved;
        packages = list t.string;
      }) (t.packageSet t.Resolved);
    VerifyLibrary = mkEndpoint
      (struct "VerifyLibrary" {
        lib = library t.Resolved;
        ocamlBinaries = option t.ocamlBinaries;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (t.checkedFiles);
    VerifyModules = mkEndpoint
      (struct "VerifyModules" {
        includePaths = list t.includePath;
        modules = list t.fstarModule;
        plugins = list t.cmxsFile;
        verificationBinaries = t.verificationBinaries t.Resolved;
        verificationOptions = t.verificationOptions;
      }) (t.checkedFiles);
  };
in
actions // {inherit api;}
