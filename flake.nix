{
  inputs = {
    yants = {
      url = "git+https://code.tvl.fyi/depot.git/?ref=canon";
      flake = false;
    };
    flake-utils.url = "github:numtide/flake-utils";
    typescript-json-schema = {
      url = path:./typescript-json-schema;
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-utils.follows = "flake-utils";
    };
  };

  outputs = {self, yants, nixpkgs, flake-utils, typescript-json-schema, ...}:
    let lib = nixpkgs.lib;
        yants-types = import "${yants}/nix/yants/default.nix" {
          inherit lib;
        };
        out = rec {
          types = yants-types // import ./types.nix {inherit types lib;};
          input = import ./input.nix {inherit types lib;};
          api = import ./api.nix {inherit types;};
          typescript-types =
            let
              ts-types = import ./yants-to-typescript.nix {inherit lib; yants = yants-types;};
              result = import ./types.nix {inherit lib; inherit (ts-types) types fix;};
              api = import ./api.nix {inherit lib; types = ts-types.types // result._symbols;};
            in
              { types = ts-types.ts-types-to-string result;
                api   = ts-types.ts-types-to-string api;
                types-exports = ts-types.ts-types-names result;
              };
        };
    in out // flake-utils.lib.eachSystem flake-utils.lib.defaultSystems (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      rec {
        checks = {
          
        };
        packages = {
          typescript-definitions = pkgs.stdenv.mkDerivation {
            name = "typescript-type-definitions";
            phases = ["installPhase"];
            buildInputs = [pkgs.nodePackages.prettier
                          typescript-json-schema.defaultPackage.${system}
                          ];
            installPhase = ''
               mkdir "$out"
               prettier ${pkgs.writeText "types.ts" out.typescript-types.types} > $out/types.ts
               {
                  echo 'import {${lib.concatStringsSep ", " out.typescript-types.types-exports}} from "./types"'
                  prettier ${pkgs.writeText   "api.ts" out.typescript-types.api  }
               } > $out/api.ts
               typescript-json-schema --required --defaultNumberType integer "$out/*.ts" "*" > $out/types-schema.json
            '';
          };
        };

        apps = {
          generate-typescript-types = {
            type = "app";
            program = "${pkgs.writeScript "generate-typescript-types" ''
                 echo $PWD
                 [[ -d "ts-fpm" ]] && cd ts-fpm
                 mkdir -p types 
                 cd types
                 FILES="api.ts types.ts types-schema.json"
                 rm $FILES 2>/dev/null
                 for file in $FILES; do
                     cat '${packages.typescript-definitions}'/$file > $file
                 done
              ''}";
          };
        };
      }
    );
}
