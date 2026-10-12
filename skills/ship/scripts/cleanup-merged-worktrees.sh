#!/usr/bin/env bash
# Remove the worktrees and branches of PRs that just merged. Holds back the main
# worktree, the caller's own worktree, and any worktree with tracked uncommitted
# edits, since those edits would be gone. A branch is deleted only when its PR
# merged and the merged head contains the local tip, so no unpushed commit is
# lost. The remote branch stays while an open PR is based on it.
# Usage: cleanup-merged-worktrees.sh <branch>...   (run inside the target repo)
set -euo pipefail
[ $# -gt 0 ] || { echo "usage: cleanup-merged-worktrees.sh <branch>..." >&2; exit 1; }

main_wt=$(git worktree list --porcelain | sed -n '1s/^worktree //p')
here=$(git rev-parse --show-toplevel)

for branch in "$@"; do
  wt=$(git worktree list --porcelain | awk -v ref="refs/heads/$branch" '
    /^worktree /{path=substr($0, 10)} $0 == "branch " ref {print path}')
  pr=$(gh pr view "$branch" --json state,headRefOid --jq '.state + " " + .headRefOid' 2>/dev/null || true)
  state=${pr%% *} head=${pr#* }
  if [ "$state" != MERGED ]; then echo "held     $branch (PR ${state:-not found})"; continue; fi
  if [ -n "$wt" ]; then
    if [ "$wt" = "$main_wt" ]; then echo "held     $wt (main worktree)"; continue; fi
    if [ "$wt" = "$here" ]; then echo "held     $wt (this session runs in it)"; continue; fi
    wip=$(git -C "$wt" status --porcelain | grep -cv '^??' || true)
    if [ "$wip" -gt 0 ]; then echo "held     $wt ($wip uncommitted tracked edits)"; continue; fi
    scratch=$(git -C "$wt" status --porcelain | sed -n 's/^?? //p' | tr '\n' ' ')
    git worktree remove --force "$wt"
    [ -d "$wt" ] && rm -rf "$wt"
    echo "removed  $wt${scratch:+ (dropped untracked: $scratch)}"
  fi
  if git show-ref -q --verify "refs/heads/$branch"; then
    if git merge-base --is-ancestor "$branch" "$head" 2>/dev/null; then
      git branch -q -D "$branch"
      echo "deleted  $branch"
    else
      echo "held     $branch (local commits not in the merged PR)"
    fi
  fi
  if git ls-remote --exit-code -q --heads origin "$branch" >/dev/null; then
    stacked=$(gh pr list --base "$branch" --state open --json number --jq 'map("#\(.number)") | join(" ")')
    if [ -n "$stacked" ]; then echo "held     origin/$branch (base of open $stacked)"; continue; fi
    git push -q origin --delete "$branch"
    echo "deleted  origin/$branch"
  else
    git branch -q -d -r "origin/$branch" 2>/dev/null || true
  fi
done
git worktree prune
