#!/usr/bin/env bash
# Deterministic transform from an upstream pstack tree to the jstack tree.
# Usage: scripts/rename.sh <upstream-pstack-dir> <output-dir>
# The output dir is emptied first (its .git, if any, is kept).
# Mechanical transforms only: renames, plus the edits every sync would
# otherwise conflict on. Anything that is jstack's own content lives as commits
# on main, not here, so upstream changes merge cleanly.
set -euo pipefail
src="$(cd "$1" && pwd)"
mkdir -p "$2"
dst="$(cd "$2" && pwd)"
find "$dst" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
rsync -a --exclude .git --exclude node_modules --exclude .DS_Store "$src/" "$dst/"
cd "$dst"

find . -depth -path ./.git -prune -o \( -name '*poteto*' -o -name '*pstack*' \) -print | while read -r p; do
  new="$(dirname "$p")/$(basename "$p" \
    | sed -e 's/poteto-mode/vrub-mode/g' -e 's/poteto-agent/vrub-agent/g' -e 's/poteto-help/vrub-help/g' \
          -e 's/poteto/vrubzy/g' | perl -pe 's/(?<![A-Za-z])pstack/jstack/g')"
  [ "$p" != "$new" ] && mv "$p" "$new"
done

grep -rlIE "poteto|Poteto|pstack" . --exclude-dir=.git | while read -r f; do
  perl -pi -e '
    s#https://x\.com/poteto#https://x.com/Vrubzy#g;
    s/poteto-mode/vrub-mode/g;
    s/poteto-agent/vrub-agent/g;
    s/poteto-help/vrub-help/g;
    s/Poteto Mode/Vrub Mode/g;
    s/Poteto mode/Vrub mode/g;
    s/Poteto subagent/Vrub subagent/g;
    s/Poteto/Vrubzy/g;
    s/poteto/vrubzy/g;
    s/(?<![A-Za-z])pstack/jstack/g;
  ' "$f"
done

# Script packages ship under upstream's npm scope. jstack names them under its own.
{ grep -rlI '@cursor-skill/' . --exclude-dir=.git || true; } | while read -r f; do
  perl -pi -e 's#\@cursor-skill/#\@jstack/#g' "$f"
done

# Claude Code blocks routed invocation of flagged skills, so vrub-mode could
# not run them. These stay typed-only on purpose.
for f in skills/*/SKILL.md; do
  case "$f" in skills/automate-me/*|skills/vrub-help/*) continue ;; esac
  perl -ni -e 'print unless /^disable-model-invocation: true\s*$/' "$f"
done

# jstack reviews with its own local agents, not Cursor's Bugbot, so the triage rubric carries a neutral name.
if [ -f skills/vrub-mode/references/bugbot-triage.md ]; then
  mv skills/vrub-mode/references/bugbot-triage.md skills/vrub-mode/references/review-triage.md
fi
{ grep -rlI 'bugbot-triage\.md' . --exclude-dir=.git || true; } | while read -r f; do
  perl -pi -e 's/bugbot-triage\.md/review-triage.md/g' "$f"
done

# pstack's logo is its author's avatar. jstack ships none.
rm -rf assets

# The benny automation pack and the make-bot-ui skill run only on Cursor automations. jstack ships neither.
rm -rf automations skills/make-bot-ui

# jstack ships one manifest per harness and its own adapters under
# skills/vrub-mode/references/harness/, so upstream's Agent Plugins manifest and
# Cursor-name adapter docs would only contradict them.
rm -rf plugin.json docs/harness

# jstack versions itself (scripts/bump-version.sh) and has no logo, so drop both.
perl -0pi -e '
  s/\n\t"version": "[^"]*",//;
  s/\n\t"logo": "[^"]*",//;
  s/"author": \{\s*"name": "[^"]*"\s*\}/"author": {\n\t\t"name": "Jenson Cripps",\n\t\t"url": "https:\/\/x.com\/Vrubzy"\n\t}/;
  s#"homepage": "[^"]*"#"homepage": "https://github.com/jensoncr/jstack"#;
  s#"repository": "[^"]*"#"repository": "https://github.com/jensoncr/jstack"#;
' .cursor-plugin/plugin.json
