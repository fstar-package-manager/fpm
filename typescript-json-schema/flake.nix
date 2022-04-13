{
  description = "An example of Napalm with flakes";

  inputs =
    {
      nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
      napalm = {
        url = "github:nix-community/napalm";
        inputs.nixpkgs.follows = "nixpkgs";
      };
    };

  outputs = { self, nixpkgs, napalm }:
    let
      # Generate a user-friendly version number.
      version = builtins.substring 0 8 self.lastModifiedDate;

      # System types to support.
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "i686-linux" "x86_64-darwin" "aarch64-darwin" ];

      # Helper function to generate an attrset '{ x86_64-linux = f "x86_64-linux"; ... }'.
      forAllSystems = f:
        nixpkgs.lib.genAttrs supportedSystems (system: f system);

      # Nixpkgs instantiated for supported system types.
      nixpkgsFor = forAllSystems (system:
        import nixpkgs {
          inherit system;
          # Add napalm to you overlay's list
          overlays = [
            self.overlay
            napalm.overlay
          ];
        });

    in
    {
      # A Nixpkgs overlay.
      overlay = final: prev: {
        # Example package
        typescript-json-schema = final.napalm.buildPackage ./. { };
      };

      # Provide your packages for selected system types.
      packages = forAllSystems (system:
        let pkgs = nixpkgsFor.${system}; in
        {
          typescript-json-schema = pkgs.writeScriptBin "typescript-json-schema"
            ''${pkgs.typescript-json-schema}/_napalm-install/node_modules/typescript-json-schema/bin/typescript-json-schema "$@"'';
        }
      );

      # The default package for 'nix build'. This makes sense if the
      # flake provides only one package or there is a clear "main"
      # package.
      defaultPackage =
        forAllSystems (system: self.packages.${system}.typescript-json-schema);
    };
}
