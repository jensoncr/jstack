#!/usr/bin/env bash
# Remove the worktrees and branches of PRs that just merged. Holds back the main
# worktree, the caller's own worktree, and any worktree with tracked uncommitted
# edits, since those edits would be gone. A branch is deleted only when its PR
# merged and the merged head contains the branch tip, so no unmerged commit is
# lost. The remote branch stays while an open PR is based on it.
# Usage: cleanup-merged-worktrees.sh <branch>...   (run inside the target repo)
set -euo pipefail
[ $# -gt 0 ] || { echo "usage: cleanup-merged-worktrees.sh <branch>..." >&2; exit 1; }

# gh would otherwise read PRs from `upstream` when that remote exists.
GH_REPO=$(git remote get-url origin); export GH_REPO
git worktree prune
main_wt=$(git worktree list --porcelain | sed -n '1s/^worktree //p')
here=$(git rev-parse --show-toplevel)

for branch in "$@"; do
  ref="refs/heads/$branch"
  pr=$(gh pr view "$branch" --json state,headRefOid --jq '.state + " " + .headRefOid' 2>/dev/null || true)
  state=${pr%% *} head=${pr#* }
  if [ "$state" != MERGED ]; then echo "held     $branch (PR ${state:-not found})"; continue; fi
  if git show-ref -q --verify "$ref"; then
    git cat-file -e "$head^{commit}" 2>/dev/null || git fetch -q origin "$head" 2>/dev/null || true
    if ! git merge-base --is-ancestor "$ref" "$head" 2>/dev/null; then
      echo "held     $branch (local commits not in the merged PR)"; continue
    fi
  fi

  wt=$(git worktree list --porcelain | awk -v ref="$ref" '
    /^worktree /{path=substr($0, 10)} $0 == "branch " ref {print path}')
  if [ -n "$wt" ]; then
    if [ "$wt" = "$main_wt" ]; then echo "held     $wt (main worktree)"; continue; fi
    if [ "$wt" = "$here" ]; then echo "held     $wt (this session runs in it)"; continue; fi
    wip=$(git -C "$wt" status --porcelain | grep -cv '^??' || true)
    if [ "$wip" -gt 0 ]; then echo "held     $wt ($wip uncommitted tracked edits)"; continue; fi
    scratch=$(git -C "$wt" status --porcelain | sed -n 's/^?? //p' | tr '\n' ' ')
    if ! git worktree remove --force "$wt" 2>/dev/null; then echo "held     $wt (worktree remove failed, locked?)"; continue; fi
    [ -d "$wt" ] && rm -rf "$wt"
    echo "removed  $wt${scratch:+ (dropped untracked: $scratch)}"
  fi
  if git show-ref -q --verify "$ref"; then
    git branch -q -D "$branch" 2>/dev/null || { echo "held     $branch (branch delete failed)"; continue; }
    echo "deleted  $branch"
  fi

  remote=0
  git ls-remote --exit-code -q --heads origin "$ref" >/dev/null || remote=$?
  case $remote in
    0)
      stacked=$(gh pr list --base "$branch" --state open --json number --jq 'map("#\(.number)") | join(" ")' 2>/dev/null) \
        || { echo "held     origin/$branch (gh pr list failed)"; continue; }
      if [ -n "$stacked" ]; then echo "held     origin/$branch (base of open $stacked)"; continue; fi
      if git push -q origin --delete --force-with-lease="$ref:$head" "$branch" 2>/dev/null; then
        echo "deleted  origin/$branch"
      else
        echo "held     origin/$branch (delete rejected, tip may differ from the merged PR head)"
      fi ;;
    2) git branch -q -d -r "origin/$branch" 2>/dev/null || true ;;
    *) echo "held     origin/$branch (ls-remote failed)" ;;
  esac
done
git worktree prune
