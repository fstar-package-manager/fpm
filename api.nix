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
  api_inputs = types.sum "api" (lib.mapAttrs (k: {inT, outT}:
    inT
  ) actions');
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
    # Actions on modules
    VerifyModules = mkEndpoint
      (struct "VerifyModules" {
        includePaths = list t.includePath;
        modules = list t.fstarModule;
        plugins = list t.ocamlPackagePlugin;
        verificationBinaries = t.verificationBinaries t.Resolved;
        verificationOptions = t.verificationOptions;
      }) (t.checkedFiles);
    ExtractModules = mkEndpoint
      (struct "ExtractModules" {
        extractionOptions = t.extractionOptions;
        includePaths = list t.includePath;
        modules = list t.fstarModule;
        verificationBinaries = t.verificationBinaries t.Resolved;
        enableLaxMode = t.option t.bool;
      }) t.extractionProduct;

    # Build recipies from extraction products
    OCamlPluginBuilder = mkEndpoint
      (struct "OCamlPluginBuilder" {
        cmxsName = t.string;
        extractionProduct = t.extractionProduct;
        ocamlBinaries = t.ocamlBinaries;
        ocamlPackages = list t.ocamlPackage;
      }) (t.ocamlPackagePlugin);

    # Actions on libraries
    VerifyLibrary = mkEndpoint
      (struct "VerifyLibrary" {
        lib = library t.Resolved;
        ocamlBinaries = t.ocamlBinaries; # To compile the plugins of the dependencies
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (t.checkedFiles);
    PluginOfLibrary = mkEndpoint
      (struct "PluginOfLibrary" {
        lib = library t.Resolved;
        ocamlBinaries = t.ocamlBinaries;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (t.option t.ocamlPackagePlugin); # if library has no plugin
    ExtractTarget = mkEndpoint
      (struct "ExtractTarget-inputs" {
        target = t.extractionTarget t.Resolved;
        ocamlBinaries = t.ocamlBinaries; # To compile the plugins of the dependencies
        verificationBinaries = t.verificationBinaries t.Resolved;
        # enableLaxMode = t.option t.bool;
      })
      (t.extractionProduct);
    
    # Collect actions of libraries
    CollectCheckedOfLibrary = mkEndpoint
      (t.struct "CollectCheckedOfLibrary" {
        lib = library t.Resolved;
        excludeSelf = t.option t.bool;
        ocamlBinaries = t.ocamlBinaries;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (t.list t.checkedFiles);
    CollectPluginsOfLibrary = mkEndpoint
      (t.struct "CollectPluginsOfLibrary" {
        lib = library t.Resolved;
        excludeSelf = t.option t.bool;
        ocamlBinaries = t.ocamlBinaries;
        verificationBinaries = t.verificationBinaries t.Resolved;
      }) (t.list t.ocamlPackagePlugin);
    CollectModulesOfLibrary = mkEndpoint
      (struct "CollectModulesOfLibrary" {
        lib = library t.Resolved;
        excludeSelf = t.option t.bool;
      }) (list t.fstarModule);
    
    # Resolvers
    ResolveBinaries = mkEndpoint
      (t.verificationBinaries t.Unresolved)
      (t.verificationBinaries t.Resolved);
    ResolveExtractionTarget = mkEndpoint
      (struct "ResolveExtractionTarget" {
        packageSet = t.packageSet t.Resolved;
        target = t.extractionTarget t.Unresolved;
        src = t.absolutePath;
      })
      (t.extractionTarget t.Resolved);
    ResolveLibrary = mkEndpoint
      (struct "ResolveLibrary" {
        packageSet = t.packageSet t.Resolved;
        lib = library t.Unresolved;
        src = t.absolutePath;
      })
      (library t.Resolved);
    ResolvePackage = mkEndpoint
      (struct "ResolvePackage" {
        packageSet = t.packageSet t.Resolved;
        pkg = t.packageT t.Unresolved;
        src = t.absolutePath;
      })
      (t.packageT t.Resolved);
    ResolvePackageSet = mkEndpoint
      (struct "ResolvePackageSet" {
        packageSet = t.packageSet t.Unresolved;
        packages = list t.string;
      }) (t.packageSet t.Resolved);
    
  };
in
actions // {inherit api api_inputs;}
