{
  lib,
  yants
}:
let
  nullable = t: lib.hasAttr "either" t && lib.elem {raw = "undefined";} t.either;
  compress-eithers = t:
    let h = t: # ts-type -> list ts-type
          let variant = lib.head (lib.attrNames t); in
          ({
            either = (l: lib.flatten (map h l));
          }.${variant} or (_: [t])) t.${variant};
        r = lib.unique (h t);
    in
      if lib.length r == 1
      then lib.head r
      else {either = r;};
  either-without-null = t:
    if lib.hasAttr "either" t then
      {either = lib.filter (x: x != {raw = "undefined";}) t.either;}
    else t;
  ts-type-fields = {
    raw = yants.string;
    enum = yants.list yants.string;
    either = yants.list ts-type;
    record = yants.attrs ts-type;
    dic = ts-type;
    list = ts-type;
    arrow = yants.list ts-type;
    indexed-type = yants.struct "ts-indexed-type" {
      input-type = yants.any;
      # # if we had dependent type, [yants.any] would be [input-type] here
      # fun = yants.defun [yants.any yants.type];
      fun = yants.any;
      input-type-inhabitants = yants.list yants.any;
    };
  };
  reserved-words = ["namespace" "package"];
  type-ident-to-ts-ident = i:
    let i' = lib.replaceChars ["-"] ["_"] i; in
    if lib.elem i' reserved-words
    then i'+"T" else i';
  binder-default-names' = ["x" "y" "z" "t" "u" "v" "w" "a" "b" "c" "d" "e"];
  binder-default-names = n: binder-default-names' ++ map (i: "x${toString (i+1)}") (lib.range 0 n);
  ts-type = yants.sum "ts-type" ts-type-fields;
  ts-type-to-string = yants.defun [
    yants.any # ts-type // sadly [yants.defun …] is not a type itself
    yants.string
  ]
    (let fn = t:
           let
             name = 0;
             variant = lib.head (lib.attrNames t);
             actions = {
               raw          = yants.defun [ts-type-fields.raw          yants.string]
                 (t: t)
               ;
               enum         = yants.defun [ts-type-fields.enum         yants.string]
                 (lib.concatMapStringsSep " | " builtins.toJSON)
               ;
               either       = yants.defun [ts-type-fields.either       yants.string]
                 (lib.concatMapStringsSep " | " ts-type-to-string)
               ;
               list         = yants.defun [ts-type-fields.list         yants.string]
                 (t: "${ts-type-to-string t}[]")
               ;
               dic          = yants.defun [ts-type-fields.dic          yants.string]
                 (t: "{[key: string]: ${ts-type-to-string t}}")
               ;
               arrow        = yants.defun [ts-type-fields.arrow        yants.string]
                 (l:
                   let
                     len = lib.length l;
                     input-types = lib.zipLists (lib.take (len - 1) l) (binder-default-names len);
                     output-type = lib.last l;
                     input-types-str = lib.concatMapStringsSep ", " (
                       {fst, snd}: "${snd}: ${ts-type-to-string fst}"
                     ) input-types;
                   in
                     "(${input-types-str}) => Promise<${ts-type-to-string output-type}>"
                     # "${if len > 1 then "${input-types-str} => " else ""}${ts-type-to-string output-type}"
                   # lib.concatMapStringsSep " | "
                   # 
                 )
               ;
               record       = yants.defun [ts-type-fields.record       yants.string]
                 (attrset:
                   "{${
                     lib.concatStringsSep ", " (
                       lib.mapAttrsToList (name: type:
                         ''"${type-ident-to-ts-ident name}"${
                           if nullable type then "?" else ""
                         }: ${ts-type-to-string (either-without-null type)}''
                       ) attrset
                     )
                   }}"
                 )
               ;
               indexed-type = yants.defun [ts-type-fields.indexed-type yants.string]
                 ({input-type, fun, input-type-inhabitants}:
                   let record = lib.listToAttrs (map (x: {
                         name  = toString x; # ts-type-to-string x;
                         value = fun x;
                       }) input-type-inhabitants);
                   in ts-type-to-string {inherit record;}
                 )
               ;
             };
           in actions.${variant} t.${variant};
     in t:
       let s = fn t;
       in
         if isNull (builtins.match "[^ ]*" s)
         then "(${s})"
         else     s);
  inhabitants-of = type:
    if lib.hasAttr "enum" type
    then type.enum
    else
      if type == {raw = "status";}
      then ["Resolved" "Unresolved"]
      else throw "Can only compute inhabitants of inlinable enumerations.";
  types =
  #   yants.attrs (yants.eitherN [
  #   (yants.defun [yants.type ts-type])
  #   # yants.any
  #   ts-type
  # ])
    {
      path   = {raw = "string";};
      string = {raw = "string";};
      drv    = {raw = "string";};
      nat    = {raw = "number";};
      int    = {raw = "number";};
      bool   = {raw = "boolean";};
      type   = {raw = "TYPE";};
      option = t: {either = [t {raw = "undefined";}];};
      list = t: {list = t;};
      restrict = _: _: t: t;
      # sum = name: set: {either = lib.mapAttrsToList (k: t: {record = {"hey" = {raw = "hola";};};}) set;};
      sum = name: set: {either = lib.mapAttrsToList (k: t: {record = {${k} = t;};}) set;};
      # sum = name: set: {either = [{raw = "hola";}];};
      either = t1: t2: compress-eithers ({either = [t1 t2];});
      enum = name: l: {enum = l;};
      attrs = k: {dic = k;};
      # indexed type only
      defun = sig:
        let
          input-type  = lib.head sig;
          output-type = lib.last sig;
        in
          if output-type == {raw = "TYPE";}
          then fun:
            {
              indexed-type = {
                inherit input-type fun;
                input-type-inhabitants = inhabitants-of input-type;
              };
            }
          else { arrow = sig; }
      ;
      struct = name:
        let h = typ: {record = typ;}; in
        if lib.isString name
        then h else h name;
    };
  fix' = f:
    let self' = f self;
        mk    = k: v:
          if ts-type.check v
          then
            # v
            if lib.hasAttr "indexed-type" v
            then (x: {raw = ''${type-ident-to-ts-ident k}["${x}"]'';})
            else {raw = "${type-ident-to-ts-ident k}";}
          else v;
        self  = lib.mapAttrs mk self';
    in {result = self'; symbols = self;};
  fix = f:
    let r = fix' f; in
    r.result // {_symbols = r.symbols;}
  ;
  ts-types-to-string = x: lib.concatStringsSep "\n" (
    lib.filter (x: !(isNull x))
      (
        lib.mapAttrsToList (k: v:
          (
            if ts-type.check v
            then "export type ${type-ident-to-ts-ident k} = ${ts-type-to-string v}"
            else
              if yants.string.check v
              then "export let ${type-ident-to-ts-ident k} = ${builtins.toJSON v}"
              else
                if k == "_symbols"
                then null
                else "// ${k} is not a type"
          )
        ) x
      )
  );
  ts-types-names = x: 
    lib.filter (x: !(isNull x))
      (
        lib.mapAttrsToList (k: v:
          if ts-type.check v || yants.string.check v
          then type-ident-to-ts-ident k
          else null
        ) x
      );
in
{inherit fix fix' types ts-type ts-type-to-string type-ident-to-ts-ident ts-types-to-string ts-types-names;}
