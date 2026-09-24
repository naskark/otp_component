#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
  nvm use
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Node 22+ required (current: $(node -v)). Run: nvm install 22 && nvm use 22"
  exit 1
fi

export NODE_BINARY="$(command -v node)"
echo "Using Node $("$NODE_BINARY" -v) at $NODE_BINARY"

cd android
./gradlew assembleRelease "$@"

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK" ]; then
  echo ""
  echo "APK: $APK"
fi
