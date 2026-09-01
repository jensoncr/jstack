#!/usr/bin/env bash
# Pull the latest upstream pstack into the generated `upstream-renamed` branch,
# then merge that branch into the current branch so upstream changes land as a
# normal 3-way merge on top of jstack's own edits.
#
# Usage: scripts/sync-upstream.sh [upstream-ref]   (default: upstream/main)
# Read-only against upstream: it only fetches. Nothing is ever pushed there.
set -euo pipefail
repo="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo"
ref="${1:-upstream/main}"
gen_branch="upstream-renamed"

git fetch --quiet upstream main
sha="$(git rev-parse "$ref")"
short="$(git rev-parse --short "$sha")"
version="$(git show "$sha:pstack/.cursor-plugin/plugin.json" | grep -oE '"version": *"[^"]+"' | cut -d'"' -f4)"

if [ "$(git show "$gen_branch:UPSTREAM" 2>/dev/null | head -1)" = "$sha" ]; then
  echo "$gen_branch already at pstack $version ($short). nothing to sync."
  exit 0
fi

tmp="$(mktemp -d)"
wt="$tmp/wt"
cleanup() { git worktree remove --force "$wt" 2>/dev/null || true; rm -rf "$tmp"; }
trap cleanup EXIT
git archive "$sha" pstack | tar -x -C "$tmp"
git worktree add --quiet "$wt" "$gen_branch"
bash scripts/rename.sh "$tmp/pstack" "$wt"
printf '%s\npstack %s\n' "$sha" "$version" > "$wt/UPSTREAM"
git -C "$wt" add -A
git -C "$wt" commit --quiet -m "sync: pstack $version @ $short"
echo "$gen_branch now at pstack $version ($short)."
echo
echo "merging into $(git branch --show-current)..."
if git merge --no-edit "$gen_branch"; then
  echo "merged clean. run the tests in skills/vrub-mode/scripts, then scripts/install-cursor-local.sh."
else
  echo "merge has conflicts. resolve them, then: git commit"
  exit 1
fi
