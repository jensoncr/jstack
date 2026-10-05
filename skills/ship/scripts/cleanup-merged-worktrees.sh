#!/usr/bin/env bash
# Remove the worktrees of branches that just merged. Branch refs survive, so no
# commits are lost. Holds back the main worktree, the caller's own worktree, and
# any worktree with tracked uncommitted edits, since those edits would be gone.
# Usage: cleanup-merged-worktrees.sh <branch>...   (run inside the target repo)
set -euo pipefail
[ $# -gt 0 ] || { echo "usage: cleanup-merged-worktrees.sh <branch>..." >&2; exit 1; }

main_wt=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')
here=$(git rev-parse --show-toplevel)

for branch in "$@"; do
  wt=$(git worktree list --porcelain | awk -v ref="refs/heads/$branch" '
    /^worktree /{path=substr($0, 10)} $0 == "branch " ref {print path}')
  if [ -z "$wt" ]; then echo "none     $branch"; continue; fi
  if [ "$wt" = "$main_wt" ]; then echo "held     $wt (main worktree)"; continue; fi
  if [ "$wt" = "$here" ]; then echo "held     $wt (this session runs in it)"; continue; fi
  wip=$(git -C "$wt" status --porcelain | grep -cv '^??' || true)
  if [ "$wip" -gt 0 ]; then echo "held     $wt ($wip uncommitted tracked edits)"; continue; fi
  scratch=$(git -C "$wt" status --porcelain | sed -n 's/^?? //p' | tr '\n' ' ')
  git worktree remove --force "$wt"
  [ -d "$wt" ] && rm -rf "$wt"
  echo "removed  $wt${scratch:+ (dropped untracked: $scratch)}"
done
git worktree prune
