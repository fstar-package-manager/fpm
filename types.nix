{
  types, lib, fix ? lib.fix
}:
with types;
let
  nameRe = "[[:digit:]]*[[:alpha:]][[:alnum:]]*(-[[:digit:]]*[[:alpha:]][[:alnum:]]*)*";
  checkedRe = ".*[.]checked([.]lax)?";
  cmxsRe = ".*[.]cmxs";
  fstarModuleRe = ".*[.]fsti?";
  match = re: s: !(isNull (builtins.match re s));
  mutuallyExclusive = f1: f2:
    let hasAttr = attr: set: lib.hasAttr attr set && !(isNull set.${attr}); in
    restrict "'${f1}' '${f2}' are mutually exclusive" (g:
      !(hasAttr f1 g) || !(hasAttr f2 g)
    )
  ;
  isDir = path: builtins.pathExists (path + "/.");
  isFile = path: builtins.pathExists path;
  attrsetRestrictedKey = attrRestriction: type:
    restrict "restricted"
      (set:
        lib.all attrRestriction (lib.attrNames set)
      )
      (attrs type)
  ;
  absolutePath' = expectDir: either
    (restrict
      "path exists"
      (if expectDir then isDir else builtins.pathExists)
      (either types.path string)
    )
    drv;
in
fix (self: with self; {
  Unresolved = "Unresolved";
  Resolved   = "Resolved";
  
  absolutePath = absolutePath' false;
  absolutePathToDir = absolutePath' true;
  
  nat = restrict "nat" (n: n >= 0) int;
  relativePath = string;
  includePath = absolutePath;

  checkedFiles = absolutePathToDir;
  # cmxsFile = restrict "cmxsFile" (p:
  #   match cmxsRe "${p}"
  # ) absolutePath;
  fstarModule = restrict "fstarModule" (p:
    match fstarModuleRe "${p}"
  ) absolutePath;

  extractionProduct = absolutePathToDir;
  ocamlPackage = absolutePathToDir;
  ocamlPackagePlugin = restrict "ocamlPackagePlugin" (
    path:
    let
      files = lib.filter (x: !(isNull x)) (lib.mapAttrsToList (file: kind:
        if kind == "directory" then null else file
      ) (readDir path));
      cmxs = lib.filter (match ".*[.]cmxs") files;
      cmxa = lib.filter (match ".*[.]cmxa") files;
    in
      lib.length cmxs == 1 && (
        let plugin_name = lib.head cmxs;
        in lib.length cmxa == [plugin_name] &&
           lib.elem "META"         files &&
           lib.elem "library.json" files
      )
  ) extractionProduct;

  moduleName = string;
  namespaceT = string;
  packageName = restrict "packageName" (match nameRe) string;
  lang = enum "extractionLang" ["OCaml" "FSharp" "Krml" "Plugin"];

  fuel = struct "fuel" {
    initial = option nat;
    max     = option nat;
  };
    
  verificationOptions = mutuallyExclusive "quake" "retry"
    (struct "verificationOptions" {
      MLish  = option bool;
      lax    = option bool; # TODO: Do we want this parameter here?
      fuel   = option fuel;
      ifuel  = option fuel;
      no_smt = option bool;
      retry  = option nat;
      quake  = option (struct "quake" {
        n               =        nat ;
        m               = option nat ;
        unconditionally = option bool;
      });
      no_default_include  = option bool;
      no_load_fstartaclib = option bool;
      unsafe_tactic_exec  = option bool;
    });
  
  extractionOptions = struct "extractionOptions" {
    codegenLib    = option (list namespaceT);
    inlineModules = option bool;
    lang          = lang;
    normalizePure = option bool;
  };

  status = enum "libStatus" [Unresolved Resolved];

  ocamlBinaries = struct "ocamlBinaries" {
    OCAMLPATH = string;
    gcc = absolutePath;
    ocamlbin = absolutePathToDir;
    ocamlbuild = absolutePath;
    ocamlfind = absolutePath;
  };
  
  verificationBinaries = defun [status type]
    (s: struct "${s}VerificationBinaries" ({
      z3_binary    = if s == Unresolved then option string else absolutePath;
      fstar_binary = if s == Unresolved then option string else absolutePath;
    } // (if s == Unresolved then {} else {
      ocamlBinaries = ocamlBinaries;
    })));
  
  library = defun [status type]
    (s: struct "${s}Library" ({
      modules      = list (if s == Unresolved
                           then relativePath
                           else absolutePath);
      dependencies = list (if s == Unresolved
                           then packageName
                           else library s);
      verificationOptions = verificationOptions;
      plugin_ocaml_modules = option (list (if s == Unresolved
                                           then relativePath
                                           else absolutePath));
      plugin_ocaml_disable = option bool;
    } // (if s == Resolved then {} else {
      verificationBinaries = option (verificationBinaries Unresolved);
    })));
  
  extractionTarget = defun [status type]
    (s: struct "${s}ExtractionTarget" {
      lib  = (if s == Unresolved
              then either packageName
              else (t: t)) (self.library s);
      opts = extractionOptions;
    });

  emailAddress = string;
  packageT = defun [status type]
    (s: struct "${s}PackageT" {
      name        = string;
      lib         = library s;
      extractions = option (attrs (extractionTarget s));
      license     = option string;
      license-files = option (list (if s == Unresolved
                                    then relativePath
                                    else absolutePath));
      author     = option string;
      maintainer = option emailAddress;
      homepage   = option string;
      synopsis   = option string;
      description= option string;
    });

  gitReference = struct "gitReference" {
    gitUri = string;
    ref    = string;
    rev    = string;
    subpath = string;
  };
  packageReference = either gitReference relativePath;
  
  packageSet = defun [status type]
    (s: attrsetRestrictedKey
      (attr: match nameRe attr)
      ( if s == Unresolved
        then packageReference
        else packageT s
      )
    );
})
