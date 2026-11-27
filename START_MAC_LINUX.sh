#!/usr/bin/env sh
TARGET="$(dirname "$0")/../browsergame/tools/asset-studio/START_STUDIO_MAC_LINUX.sh"
if [ ! -f "$TARGET" ]; then
  echo "FEHLER: $TARGET nicht gefunden. Bitte browsergame neben asset_labor klonen." >&2
  exit 2
fi
exec sh "$TARGET" "$@"