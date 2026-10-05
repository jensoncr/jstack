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
          -e 's/poteto/vrubzy/g' -e 's/pstack/jstack/g')"
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
    s/pstack/jstack/g;
    s#\@cursor-skill/vrub-mode-tools#\@jstack/vrub-mode-tools#g;
  ' "$f"
done

# Claude Code blocks routed invocation of flagged skills, so vrub-mode could
# not run them. These two stay typed-only on purpose.
for f in skills/*/SKILL.md; do
  case "$f" in skills/automate-me/*|skills/make-bot-ui/*) continue ;; esac
  perl -ni -e 'print unless /^disable-model-invocation: true\s*$/' "$f"
done

# pstack's logo is its author's avatar. jstack ships none.
rm -rf assets

# jstack versions itself (scripts/bump-version.sh) and has no logo, so drop both.
perl -0pi -e '
  s/\n\t"version": "[^"]*",//;
  s/\n\t"logo": "[^"]*",//;
  s/"author": \{\s*"name": "[^"]*"\s*\}/"author": {\n\t\t"name": "Jenson Cripps",\n\t\t"url": "https:\/\/x.com\/Vrubzy"\n\t}/;
  s#"homepage": "[^"]*"#"homepage": "https://github.com/jensoncr/jstack"#;
  s#"repository": "[^"]*"#"repository": "https://github.com/jensoncr/jstack"#;
' .cursor-plugin/plugin.json
