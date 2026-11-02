#!/bin/bash
# Run one task through Codex's native Computer Use: the cua_repl server and Codex Computer Use.app that the
# ChatGPT/Codex desktop app drives. One run holds the screen at a time.
# Usage: run.sh [--model M] [--effort E] [--wait SECONDS] <task.md> <out-dir>
#        run.sh --approved-apps
#        run.sh --approve <bundle-id>...
#        run.sh --approve-all     (every installed app; backs up the approvals file and prints the undo)
set -euo pipefail

APP_CODEX=/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex
CODEX_HOME_DIR=${CODEX_HOME:-$HOME/.codex}
HERE=$(cd "$(dirname "$0")" && pwd)
APPROVALS="$HOME/Library/Group Containers/2DC432GLL2.com.openai.sky.CUAService/Library/Application Support/Software/ComputerUseAppApprovals.json"
model="" effort="" wait=0

die() { echo "codex-computer-use: $1" >&2; exit "${2:-1}"; }
# Apps the user chose "Always allow" for in the Codex app. A headless run cannot answer an approval prompt.
approved_apps() { [ -f "$APPROVALS" ] && plutil -extract approvedBundleIdentifiers json -o - "$APPROVALS" | tr -d '[]"' | tr ',' '\n' | awk NF; }
installed_apps() {
  for dir in /Applications /Applications/Utilities /System/Applications /System/Applications/Utilities "$HOME/Applications"; do
    find "$dir" -maxdepth 2 -name '*.app' -prune 2>/dev/null
  done | while IFS= read -r app; do defaults read "$app/Contents/Info" CFBundleIdentifier 2>/dev/null || true; done | sort -u
}
# Same effect as choosing Always allow in the Codex app, for each bundle ID on stdin. Backs the file up first.
approve() {
  [ -f "$APPROVALS" ] || die "no approvals file at $APPROVALS; approve one app in the Codex app first"
  mkdir -p "$CODEX_HOME_DIR/tmp"
  backup="$CODEX_HOME_DIR/tmp/ComputerUseAppApprovals.$(date +%Y%m%dT%H%M%S).json"
  cp -p "$APPROVALS" "$backup"
  have=$(approved_apps) added=0
  while IFS= read -r id; do
    [ -n "$id" ] || continue
    if ! printf '%s\n' "$have" | grep -qxF "$id"; then
      plutil -insert approvedBundleIdentifiers -string "$id" -append "$APPROVALS"
      have=$(printf '%s\n%s' "$have" "$id") added=$((added + 1))
    fi
  done
  echo "codex-computer-use: approved $added new apps; $(approved_apps | wc -l | tr -d ' ') total. Undo: cp '$backup' '$APPROVALS'" >&2
}

while [ $# -gt 0 ]; do
  case $1 in
    --model) model=$2; shift 2 ;;
    --effort) effort=$2; shift 2 ;;
    --wait) wait=$2; shift 2 ;;
    --approved-apps) approved_apps; exit 0 ;;
    --approve) shift; printf '%s\n' "$@" | approve; exit 0 ;;
    --approve-all) installed_apps | approve; exit 0 ;;
    -h|--help) sed -n 2,7p "$0"; exit 0 ;;
    *) break ;;
  esac
done
[ $# -eq 2 ] || die "usage: run.sh [--model M] [--effort E] [--wait SECONDS] <task.md> <out-dir>" 64
task=$1 out=$2
[ -s "$task" ] || die "task file $task is missing or empty" 66

# The `computer use` role line in the jstack model config, e.g. `computer use: gpt-6.1-sol@high`.
if [ -z "$model" ]; then
  for config in ./jstack-models.md "$HOME/.claude/jstack-models.md" "$CODEX_HOME_DIR/jstack-models.md" "$HOME/.cursor/rules/jstack-models.mdc"; do
    [ -f "$config" ] || continue
    token=$(sed -n 's/^computer use:[[:space:]]*\([^[:space:]]*\).*/\1/p' "$config" | head -1)
    if [ -n "$token" ]; then break; fi
  done
  token=${token:-gpt-6.1-sol@high}
  model=${token%@*}
  if [ "$token" != "$model" ]; then effort=${effort:-${token#*@}}; fi
fi

[ -x "$APP_CODEX" ] || die "ChatGPT.app's bundled codex CLI is missing at $APP_CODEX; install or update the ChatGPT desktop app"
[ -d "$CODEX_HOME_DIR/computer-use/Codex Computer Use.app" ] || die "Codex Computer Use.app is not installed; enable Computer Use once in the Codex app"
grep -A1 -F '[plugins."unified-computer-use@openai-bundled"]' "$CODEX_HOME_DIR/config.toml" 2>/dev/null | grep -q 'enabled = true' \
  || die "plugin unified-computer-use@openai-bundled is not enabled in $CODEX_HOME_DIR/config.toml; turn on Computer Use in the Codex app"
"$APP_CODEX" login status >/dev/null 2>&1 || die "codex is not logged in; run: $APP_CODEX login"

mkdir -p "$out"
out=$(cd "$out" && pwd)
mkdir -p "$CODEX_HOME_DIR/tmp"
lock="$CODEX_HOME_DIR/tmp/jstack-computer-use.lock"

args=(exec --skip-git-repo-check --json -C "$out" -s workspace-write -c approval_policy=never -m "$model" -o "$out/report.md")
if [ -n "$effort" ]; then args+=(-c "model_reasoning_effort=$effort"); fi

echo "codex-computer-use: model=$model effort=${effort:-default} out=$out" >&2
set +e
{ cat "$HERE/preamble.md"; printf '\n## Task\n\n'; cat "$task"; } \
  | lockf -t "$wait" "$lock" "$APP_CODEX" "${args[@]}" - > "$out/events.jsonl" 2> "$out/stderr.log"
status=$?
set -e
if [ $status -eq 75 ]; then die "another computer-use run holds the screen; retry later or pass --wait SECONDS" 75; fi

calls=$(grep -c '"server":"cua_repl"' "$out/events.jsonl" || true)
echo "codex-computer-use: exit=$status cua_repl_calls=$calls report=$out/report.md" >&2
if [ $status -ne 0 ]; then tail -5 "$out/stderr.log" >&2; exit "$status"; fi
denied=$(grep -o 'Computer Use was not approved to use [^"\\]*' "$out/events.jsonl" | head -1 | sed 's/.*to use //' || true)
if [ -n "$denied" ]; then
  die "$denied is not approved for headless runs. Choose Always allow for it in the Codex app, or ask the user before running --approve <bundle-id>. Approved now: $(approved_apps | paste -sd, -)" 77
fi
if head -1 "$out/report.md" 2>/dev/null | grep -q COMPUTER_USE_UNAVAILABLE; then die "Codex had no Computer Use tool in this session" 69; fi
exit 0
