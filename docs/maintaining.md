# Maintaining jstack

This page is for whoever changes this repo, person or agent. To learn how to use jstack, read the [guide](./guide/README.md) instead.

jstack is a fork of [pstack](https://github.com/cursor/plugins/tree/main/pstack), Cursor's engineering-rigor plugin. It keeps pstack's skills, playbooks, and principles current, and changes four things: the names, support for Claude Code and Codex as well as Cursor, a few rules, and a few skills of its own.

## What is in the repo

| Path | What it holds |
|---|---|
| `skills/` | One folder per skill, each with a `SKILL.md`. `vrub-mode` is the entry point. Its `playbooks/` hold the step lists, and its `references/` hold the model and harness layers. |
| `agents/` | The two named agents, `vrub-agent` and `comment-sicko`. |
| `docs/guide/` | The user guide, ten pages. |
| `docs/upstream-sync-log.md` | One entry per pstack sync: what was taken, adapted, and left out, and why. |
| `scripts/` | The sync, rename, release, install, and docs-check scripts. |
| `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.agents/plugins/` | One manifest per harness. They share one version number. |
| `UPSTREAM` | The pstack commit and version this tree was last synced to. |

## How jstack differs from pstack

- **Names.** `poteto-mode` is `vrub-mode`, and `pstack` is `jstack`. `scripts/rename.sh` applies the renames, so never rename by hand.
- **Three harnesses.** Skills name no models and no harness-specific tools. They name a role and a tier, which `skills/vrub-mode/references/models.md` resolves, and verbs such as "spawn a subagent", which the files in `skills/vrub-mode/references/harness/` map to each harness's tools. Model names and tool names belong only in those harness files, with one exception. Every skill that asks the user a question carries the same **Ask with the question tool** paragraph, which names the three question tools, so the skill shows the picker when it runs without `vrub-mode`. The skills that ask only when blocked also share an **Ask rarely** paragraph. Edit all copies together. The docs check fails when they differ.
- **Its own rules.**
  - A PR opens only when the code is ready, and every push to an open PR passes the push gate in `playbooks/opening-a-pr.md`. pstack opens the PR early.
  - Everything jstack routes to is bundled. Nothing depends on Cursor's `cursor-team-kit` plugin or on Cursor's built-in `create-skill`.
- **Its own skills.** `grill-me`, `product`, `design-system`, `council`, `codex-computer-use`, `deslop`, `control-ui`, and `control-cli`. `babysit`, `ship`, and `pickup` are short entry points to pstack's own Babysit, Shipping, and Session pickup playbooks, so those run without `/vrub-mode`. `setup-jstack` and `vrub-help` are rewritten for three harnesses.
- **Left out.** pstack's benny automation pack, its `make-bot-ui` skill, its root `plugin.json`, its Claude Code adapter doc, and its logo. `rename.sh` deletes them on every sync.

## Sync from pstack

1. Start a branch.
2. Run `scripts/sync-upstream.sh`. It fetches pstack, runs `rename.sh` over it, commits the result on the `upstream-renamed` branch, and merges that branch into yours.
3. Resolve the conflicts. Take pstack's meaning, and write it in jstack's tier wording and harness verbs. Keep jstack's own rules from the list above.
4. Add an entry to `docs/upstream-sync-log.md`.
5. Run the checks below, then `scripts/bump-version.sh minor`.
6. Open the PR and merge it with a merge commit, never a squash. `main` must keep `upstream-renamed` as a parent, or the next sync conflicts on everything again. Push `upstream-renamed` too.

`UPSTREAM` is how the sync script knows where it left off. The script reads the copy on the `upstream-renamed` branch, compares its first line with pstack's current commit, and stops when they match. `main` gets its copy through the merge. Deleting it from `main` would make every later sync conflict, because each sync rewrites the file.

## Checks

```bash
node scripts/check-jstack-docs.mjs            # the docs match the tree
cd skills/vrub-mode/scripts && bun test       # the watch-pr and check-plan scripts
cd skills/control-ui/scripts && bun test      # the heap-snapshot script
```

The docs check fails when the README or the guide names a skill that doesn't exist, misses one that does, links to a missing file, when any doc, skill, or agent mentions `cursor-team-kit` outside a credit line, or when an asking skill lacks the **Ask with the question tool** paragraph or carries a different copy of it.

## Release and install

1. Run `scripts/bump-version.sh minor` (or `major`, `patch`, or an exact version). It sets the version in all four manifests. Claude Code and Codex fetch an update only when the version changes.
2. Merge to `main`.
3. Update each harness:
   - Claude Code: `claude plugin marketplace update jstack && claude plugin update jstack@jstack`, then restart.
   - Codex: `codex plugin marketplace upgrade jstack`.
   - Cursor: `scripts/install-cursor-local.sh`, then **Developer: Reload Window**.

## One trap

This checkout has two remotes, and a bare `gh` command resolves to `upstream`, which is `cursor/plugins`. Pass `--repo jensoncr/jstack` to every `gh` call, or a PR lookup or a new PR goes to the wrong repo.
