#!/usr/bin/env bash
# Hover / focus / open-state probe. Usage:
#   AGENT_BROWSER_SESSION=<session> bash probe-state.sh <out-dir>
# Edit the PROBES list: each line is  label | action | JS expression returning the element to measure.
# Actions: hover:<css> | click:<css> | key:<Key> | focus:<css> | none
# The script performs the action, waits for transitions to settle, and prints the element's
# computed rest/hover/etc. styles as one JSON line per probe. Keep JS expressions quote-free
# (use double quotes inside) so they survive the shell.
set -u
OUT=${1:-.}
mkdir -p "$OUT"

PROBES=(
  'nav rest      | none                       | document.querySelector("nav a, aside a")'
  'nav hover     | hover:nav a, aside a       | document.querySelector("nav a, aside a")'
  'button rest   | none                       | document.querySelector("button")'
  'button hover  | hover:button               | document.querySelector("button")'
  'input focus   | click:input                | document.querySelector("input").parentElement'
  'tab focus     | key:Tab                    | document.activeElement'
  'row hover     | hover:tbody tr             | document.querySelector("tbody tr")'
)

measure() {
  agent-browser eval "(()=>{const e=($1);if(!e)return 'none';const s=getComputedStyle(e);const b=e.getBoundingClientRect();return {w:b.width,h:b.height,bg:s.backgroundColor,color:s.color,border:s.borderColor,bw:s.borderWidth,shadow:s.boxShadow,outline:s.outline,outlineOffset:s.outlineOffset,transform:s.transform,opacity:s.opacity,filter:s.filter,transition:s.transition,animation:s.animation}})()" 2>&1 | tr -d '\n'
}

for p in "${PROBES[@]}"; do
  label=$(echo "$p" | cut -d'|' -f1 | xargs)
  action=$(echo "$p" | cut -d'|' -f2 | xargs)
  expr=$(echo "$p" | cut -d'|' -f3- | sed 's/^ *//')
  case "$action" in
    hover:*) agent-browser hover "${action#hover:}" >/dev/null 2>&1 ;;
    click:*) agent-browser click "${action#click:}" >/dev/null 2>&1 ;;
    focus:*) agent-browser focus "${action#focus:}" >/dev/null 2>&1 ;;
    key:*)   agent-browser press "${action#key:}" >/dev/null 2>&1 ;;
    none) ;;
  esac
  agent-browser wait 300 >/dev/null 2>&1
  echo "## $label"; measure "$expr"; echo
done | tee "$OUT/states.txt"

# Mid-transition sampling (animation feel): trigger, sample at ~100ms, then at rest.
# agent-browser click "<trigger>"; agent-browser wait 100; measure "<el>"; agent-browser wait 400; measure "<el>"
