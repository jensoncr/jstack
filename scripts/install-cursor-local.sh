#!/usr/bin/env bash
# Copy this checkout into Cursor's local plugin folder. Cursor rejects symlinks
# that resolve outside ~/.cursor/plugins/local, so this is a real copy.
# Re-run after every edit, then Developer: Reload Window in Cursor.
set -euo pipefail
src="$(cd "$(dirname "$0")/.." && pwd)"
dst="$HOME/.cursor/plugins/local/jstack"
mkdir -p "$dst"
rsync -a --delete \
  --exclude .git --exclude node_modules --exclude .DS_Store \
  "$src/" "$dst/"
echo "installed to $dst"
echo "restart Cursor or run Developer: Reload Window"
