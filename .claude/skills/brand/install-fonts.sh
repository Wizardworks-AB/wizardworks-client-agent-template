#!/usr/bin/env bash
# Install the Inter typeface for /document and /deck (macOS, Linux).
# Fonts are binaries and cannot travel inside the agent template, so this
# fetches the official release from GitHub into the user's font directory.
#
#   bash .claude/skills/brand/install-fonts.sh
#
# Idempotent: exits 0 without downloading when Typst already sees Inter.
set -euo pipefail

if command -v typst >/dev/null 2>&1 && typst fonts 2>/dev/null | grep -qi '^inter$'; then
  echo "Inter is already installed."
  exit 0
fi

VERSION="${INTER_VERSION:-4.1}"
URL="https://github.com/rsms/inter/releases/download/v${VERSION}/Inter-${VERSION}.zip"

case "$(uname -s)" in
  Darwin) DEST="$HOME/Library/Fonts" ;;
  Linux)  DEST="${XDG_DATA_HOME:-$HOME/.local/share}/fonts" ;;
  *) echo "Unsupported OS $(uname -s). On Windows run install-fonts.ps1." >&2; exit 1 ;;
esac

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
echo "Downloading Inter ${VERSION} …"
curl -fsSL "$URL" -o "$TMP/inter.zip"
unzip -q "$TMP/inter.zip" -d "$TMP/inter"
mkdir -p "$DEST"
# The variable fonts cover every weight Typst asks for (regular … black, italic).
find "$TMP/inter" -name 'Inter*Variable*.ttf' -exec cp {} "$DEST/" \;
command -v fc-cache >/dev/null 2>&1 && fc-cache -f "$DEST" >/dev/null || true
echo "Installed Inter into $DEST"
command -v typst >/dev/null 2>&1 && typst fonts | grep -qi '^inter$' && echo "Typst sees Inter." || true
