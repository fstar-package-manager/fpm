{
  types,
  lib
}:
with types;
let
  maybeAttr = set: attr: f:
    if lib.hasAttr set attr && !(isNull set.${attr})
    then f set.${attr}
    else null;
in
{
  colon-sep-list = l:
    lib.concatMapStringsSep ":" (x: lib.escapeShellArg "${x}") l;
  parent-folders = files: lib.unique (map dirOf files);
  verification-options-to-string = defun [verification-options string]
    (opts: lib.concatStringsSep " " (verification-options-to-string opts));
  verification-options-to-strings = defun [verification-options (list string)]
    (opts:
      [ (maybeAttr opts "ifuel" (v: "--ifuel ${toString v}"))
        (maybeAttr opts "fuel" (v: "--fuel ${toString v}"))
        (maybeAttr opts "MLish" (v: "--MLish"))
        (maybeAttr opts "no_smt" (v: "--no_smt"))
        (maybeAttr opts "no_default_include" (v: "--no_default_include"))
        (maybeAttr opts "quake" ({n, m ? n, unconditionally ? false}:
          "--quake ${toString n}/${toString m}${if unconditionally then "/k" else ""}"
        ))
        (maybeAttr opts "retry" (v: "--retry ${toString v}"))
        (maybeAttr opts "unsafe_tactic_exec" (v: "--unsafe_tactic_exec"))
      ]
    );
}
