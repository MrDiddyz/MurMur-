{
  description = "MurMur development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            python310
          ];

          shellHook = ''
            echo "MurMur dev shell ready"
            echo "Node: $(node --version) | npm: $(npm --version) | Python: $(python --version)"
          '';
        };
      });
}
