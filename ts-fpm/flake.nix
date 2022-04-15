{
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {self, nixpkgs, flake-utils}:
    flake-utils.lib.eachSystem flake-utils.lib.defaultSystems (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      rec {
        defaultPackage = (import ./. {inherit pkgs system;}).package;
        defaultApp = {
          type = "app";
          program = "${defaultPackage}/bin/fpm";
        };
      }
    );
}
