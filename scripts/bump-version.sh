#!/usr/bin/env bash
# Set jstack's own version in every manifest. pstack's version lives only in
# UPSTREAM. Claude Code and Codex fetch a new version only when this changes.
# Usage: scripts/bump-version.sh major|minor|patch|<x.y.z>
set -euo pipefail
cd "$(dirname "$0")/.."
manifests=(.claude-plugin/plugin.json .claude-plugin/marketplace.json .codex-plugin/plugin.json .cursor-plugin/plugin.json)
current="$(grep -oE '"version": *"[^"]+"' .claude-plugin/plugin.json | cut -d'"' -f4)"
IFS=. read -r major minor patch <<<"$current"
case "${1:?usage: bump-version.sh major|minor|patch|<x.y.z>}" in
  major) next="$((major + 1)).0.0" ;;
  minor) next="$major.$((minor + 1)).0" ;;
  patch) next="$major.$minor.$((patch + 1))" ;;
  *) next="$1" ;;
esac
for m in "${manifests[@]}"; do
  perl -pi -e "s/\"version\": *\"[^\"]+\"/\"version\": \"$next\"/" "$m"
  grep -q "\"version\": \"$next\"" "$m" || { echo "no version field in $m" >&2; exit 1; }
done
echo "$next"
