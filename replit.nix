{ pkgs }: {
  # System packages available in the Replit workspace.
  # Node 20 is provided by the [modules] entry in .replit; this file adds:
  #   - python3 + pkg-config + gcc for native-module builds (better-sqlite3)
  #   - openssl headers for jose / native crypto bindings
  #   - sqlite for command-line inspection of the dev database
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.python3
    pkgs.pkg-config
    pkgs.gcc
    pkgs.gnumake
    pkgs.openssl
    pkgs.sqlite
  ];
}
