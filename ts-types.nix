{
  lib,
  yants
}:
let
  ts-type-fields = {
    raw = yants.string;
    enum = yants.list yants.string;
    either = yants.list ts-type;
    record = yants.attrset yants.string ts-type;
    indexed-type = yants.struct "ts-indexed-type" {
      input-type = yants.type;
      # if we had dependent type, [yants.any] would be [input-type] here
      fun = yants.defun [yants.any yants.type];
      input-type-inhabitants = yants.list yants.any;
    };
    list = ts-type;
  };
  type-ident-to-ts-ident = lib.replaceChars ["-"] ["_"];
  ts-type = yants.sum "ts-type" ts-type-fields;
  ts-type-to-string = yants.defun [ts-type yants.string]
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
                 (lib.concatMapStringsSep " || " ts-type-to-string)
               ;
               list         = yants.defun [ts-type                     yants.string]
                 (t: "${ts-type-to-string t}[]")
               ;
               record       = yants.defun [ts-type-fields.record       yants.string]
                 (attrset:
                   "{${
                     lib.concatStringSep ", " (
                       lib.mapAttrsToList (name: type:
                         "\"${type-ident-to-ts-ident name}\": ${ts-type-to-string type}"
                       ) attrset
                     )
                   }}"
                 )
               ;
               indexed-type = yants.defun [ts-type-fields.indexed-type yants.string]
                 ({input-type, fun, input-type-inhabitants}:
                   ts-type-to-string {
                     record =
                       lib.listToAttrs (map (x: {
                         name  = ts-type-to-string x;
                         value = fun x;
                       }) input-type-inhabitants);
                   }
                 )
               ;
             };
           in actions.${variant} t.${variant};
     in t: "(${fn t})");
  types = yants.eitherN [
    (yants.defun [yants.type ts-type])
    ts-type
  ]
    {
      path   = {raw = "string";};
      string = {raw = "string";};
      drv    = {raw = "string";};
      nat    = {raw = "number";};
      int    = {raw = "number";};
      bool   = {raw = "boolean";};
      option = t: {either = [t {raw = "null";}];};
      list = t: {list = t;};
      restrict = _: _: t: t;
      either = t1: t2: {either = [t1 t2];};
      enum = name: l: {enum = l;};
      attrset = k: {raw = "TODO";};
      # indexed type only
      defun = sig: mk-type:
        {
          indexed-type = {
            input-type = lib.head sig;
            fun = mk-type;
            input-type-inhabitants = ["Resolved" "Unresolved"];
          };
        };
      struct = name: typ:
        ''{${
          lib.concatStringsSep ", "
            (lib.mapAttrsToList (k: v: ''"${k}": ${v}'') typ)
        }}''
      ;
    };
  fix = f:
    let self' = f self;
        mk    = k: v:
          if ts-type.check v
          then
            if lib.hasAttr "indexed-type"
            then (x: {raw = ''${ts-type-to-string k}["${x}"]'';})
            else {raw = "${ts-type-to-string k}";}
          else v;
        self  = lib.mapAttrs mk self';
    in self';
in
{inherit fix types;}
