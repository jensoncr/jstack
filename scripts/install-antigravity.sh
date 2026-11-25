#!/usr/bin/env bash
# Copy this checkout into Antigravity's plugin folder and into each T3 Code
# Antigravity profile. T3 Code runs Antigravity against its own profile, which
# loads plugins only from that profile. Each copy is a real one, because a
# subagent there cannot read a plugin symlinked in from outside the profile.
# Re-run after every update, and after adding an Antigravity provider in T3 Code.
set -euo pipefail
src="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$src/.antigravity-plugin/plugin.json" ] || { echo "not a jstack checkout: $src" >&2; exit 1; }
for config in "$HOME/.gemini/config" "$HOME"/.t3/userdata/providers/antigravity/*/config; do
  [ "$config" = "$HOME/.gemini/config" ] || [ -d "$config" ] || continue
  dst="$config/plugins/jstack"
  if [ -L "$dst" ]; then rm "$dst"; fi
  mkdir -p "$dst"
  rsync -a --delete \
    --exclude .git --exclude node_modules --exclude .DS_Store \
    "$src/" "$dst/"
  echo "installed to $dst"
done
echo "start a new Antigravity session to load it"
