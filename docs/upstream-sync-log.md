# Upstream sync log

One entry per pstack sync, newest first. Each entry lists the upstream commits pulled in and what jstack took, adapted, or left out. `UPSTREAM` holds the current upstream sha. `scripts/sync-upstream.sh` does the merge.

## pstack 0.15.28 → 0.15.36 (2026-11-09, jstack 1.8.0)

Upstream range `d457567..c742dd6`, 24 commits under `pstack/`. Merged on top of jstack 1.7.0. 15 files conflicted.

### Taken as is or adapted

| Upstream | Change | In jstack |
|---|---|---|
| `eb4db2b` `7698375` `4ec7ffa` `076f4b2` `34b1b7c` `740d2c0` `519d36a` `00d5dec` | `/statechart` skill and compiler, and generated formal-verification skills read results with it | Added. `rename.sh` now maps the `@cursor-skill/` npm scope to `@jstack/` for every script package. |
| `3c0fdb4` `ab1f702` | `/ketchup-video` skill, with subtitles | Added unchanged. |
| `88d4751` | `/sharpen` returns only the rewritten prompt | Taken. |
| `ab1f702` | `/interrogate` keeps only findings a run proves, and its four reference files are deleted | Taken, with the `interrogate reviewers` tier lookup. On a single-family harness each repeated adversary attacks a different part of the intent first. |
| `ab1f702` | vrub-mode restates the goal first, runs steers and resumes in the background, and chains fallbacks for a rejected model | Taken. The fallback ends at step 4 of `references/models.md`, with no model names. |
| `ab1f702` | Autopilot-full blocks only on a problem a run or a wrong doc line shows, gives wording-only changes no verifier, and rebases on a known concurrent change | Taken. jstack keeps its fix-forward through the push gate, since the review cap counts rounds by it. |
| `ab1f702` | Autopilot-stack is Autopilot-full without the merge | Taken, plus the patch-id rule from `shipping.md` and a single verifier for a changed patch. |
| `ab1f702` | Arena drops a seat it can't run, and its judge never comes from the parent's family | Adapted. `differs-from-parent` in `references/models.md` now picks another family first. On a single-family harness the judge runs in a fresh context and counts as same-model, medium signal, instead of being skipped. |
| `ab1f702` | Opening a PR drops `interrogate`. Babysit, multi-phase plan, autonomous run and Explain the Number wording | Taken. |
| `c742dd6` | Orchestrate runs on the agent's own tools, and the `orch` scripts are deleted | Taken, with harness verbs, the push gate, the local verify receipt, and a verifier on another family where the harness has one. |
| `7054003` | reflect never edits a skill in the plugin cache | Adapted to the Cursor, Claude Code and Codex caches and the `project skills dir` verb. |
| `e73df47` `96dec8e` `fe096ef` `f83fbe6` `86c2448` | swarm renumbering, watch-pr fork heads and deadline sleeps, worktree-audit GNU `stat`, check-plan inline code | Taken. |
| `a0b0ad9` | Claude Code leaves auto-update off for third-party marketplaces | Adapted to the `jstack` marketplace. |

### Left out

| Upstream | Why |
|---|---|
| `ab1f702`: "Open the PR early so CI and bots run alongside the work" and "push each finished unit" in Autopilot-full | Left out again for the same reason as last sync (#7). jstack opens the PR at the code-ready head, and before that pushes the branch after every verifiable unit. |
| `ab1f702`: the cross-judge and verifier never run on the parent's family | On Claude Code and Codex every model is one family, so arena would never judge and orchestrate PRs could never merge. jstack keeps that rule where the harness has another family. |
| `ab1f702`: Cursor slug fallbacks, family prefixes and the default judge pool in arena, swarm, setup and vrub-mode | jstack resolves models through `references/models.md` and the harness adapters. |
| `3c596e7`: orch prefers the active PR | The `orch` scripts are deleted in `c742dd6`. |
| Bumps `642289e` `b1a1298` `7c7bde7` `164ced1`, and 0.15.35 inside `ab1f702` | jstack versions itself. |

### jstack rules kept through the merge

- The push gate, opening the PR at the code-ready head, the fix-forward pushed once through the push gate, verdicts on the local commit, and the rebase test (#7).
- Two review rounds per PR (#6), in Autopilot-full and the multi-phase plan skeleton.
- Role and tier wording in place of model names, and harness verbs in place of Cursor-only tools.

### Expect conflicts next sync in

`skills/vrub-mode/playbooks/{autopilot-full,autopilot-stack,babysit,multi-phase-plan,orchestrate}.md` (push discipline and harness verbs), `skills/vrub-mode/SKILL.md`, `skills/{arena,interrogate,swarm,setup-jstack}/SKILL.md` (tier wording), `README.md`, `docs/guide/04-design.md`.

## pstack 0.15.12 → 0.15.28 (2026-10-19, jstack 1.6.0)

Upstream range `807c031..d457567`, 48 commits under `pstack/`. Merged on top of jstack 1.5.0 plus #7 (push discipline). 41 files conflicted.

### Taken as is or adapted

| Upstream | Change | In jstack |
|---|---|---|
| `978ca6e` `ea32d95` `d00ba6e` `c86f349` `afd51cf` `16541c6` `bc14437` `8043881` | `/ketchup` skill, and autopilot loops catch the operator up with it | Added. Without Cursor's `/visualize`, ketchup uses the harness's chart or HTML preview tool. |
| `79afd75` `75fabac` | `/sharpen` skill | Added unchanged. |
| `7d8d909` `dbf4981` | `/in-your-own-words` skill | Added unchanged. |
| `4382e68` `6b78e9f` `7b353f7` `f9be7aa` `d457567` | `create-` / `maintain-formal-verification-skill`, offered in setup and help | Added. The generated skill goes under `<project skills dir>/`. setup-jstack gets a new step 9 that offers it, and vrub-help shows its state. |
| `ce649c0` | Effort matched to the job, Graphite dropped from orchestrate, playbooks cut to principles, autopilot-stack down to 4 steps, swarm-verify once, rebase only when trunk can affect the patch | Took the new structure, the Graphite removal and the four-step autopilot-stack. The effort rule appears as "Match the effort to the job", with no model names or Cursor-only tools. Swarm-once and the rebase test already came in through #7. Shipping went from 9 steps to 6. |
| `ff8f83d` | watch-pr reads review threads past the first 100 | Already ported in #7. |
| `cf9a111` | worktree-audit checks MERGED against the default branch | Taken (`-b <pr-base-ref>`). |
| `87c8103` | Plan checks respect fenced code blocks, plus `check-plan.test.ts` | Taken. The test fixture uses jstack's `swarm workers` role wording. |
| `2bd5dd4` `b93e811` `364a77e` | The `/vrub-mode` chat runs the playbook and `vrub-agent` is only a delegate. Bundled leaf skills are easier to find | Taken. `vrub-agent` searches all three harness plugin directories. |
| `c49b37a` | For create-verification-skill, "ready" means the app is usable | Taken. |
| `36cecbf` | After a deep debugging dig, propose a cheap always-on signal | Taken. |
| `00b14f1` `08bd59b` `99743e9` `e5136d8` | Token-cutting rewrites of skill prompts | Taken, with jstack's role and tier wording, harness verbs, single-family lenses, and `comment-sicko` named agent re-applied. |
| `2cbf585` `019a6a2` | Guide refresh, plus a check that the docs match the tree | Guide taken without the chapter images. The check lives outside `pstack/`, so it was ported as `scripts/check-jstack-docs.mjs`. |
| `a968159` `de2dba6` `0317eb8` `bc697d0` | Skill names match folders, Comment Sicko id, a type-guard brand, unslop description | Taken. jstack already used `comment-sicko`. |

### Left out

| Upstream | Why |
|---|---|
| `ce649c0` and `autopilot-full`: "Open the PR early so CI and bots run alongside the work" and "push after every unit worth keeping" | Each push to an open PR is a full CI run. jstack opens the PR at the code-ready head, after the push gate in `opening-a-pr.md`. Before the PR opens, pushes still happen often for durability, and they run no CI (#7). |
| `ce649c0`: unconditional merge-prep rebase | jstack keeps the rebase test from #7 (`shipping.md` step 4). |
| `df58112` `1e56b29`: drop Sol, default to Opus xhigh and Grok, setup budget prompt | jstack sets model defaults per harness (`skills/vrub-mode/references/harness/*.md`): opus only on Claude Code, `gpt-6.1-sol` on Codex, and `gpt-6.1-sol-max` kept on Cursor (d0bf11a). setup-jstack has no reasoning-budget step. |
| `182f2ce` `1b80080` `e5a02f8`: root `plugin.json`, generated Claude Code tree, `docs/harness/claude-code.md` | jstack ships its own `.claude-plugin`, `.codex-plugin` and `.cursor-plugin` manifests and has its own harness layer. The upstream adapter writes `~/.claude/rules/` and falls back to Cursor model names. `rename.sh` now deletes these files. |
| Bumps `3177dab` `997ffc7` `1b6d44f` `1e5c90a` `6ce45c5` `0b8e952` `0148b78` | jstack versions itself. |

### jstack rules kept through the merge

- The push gate, opening the PR at the code-ready head, swarm-verify once, verdicts on the local commit, babysit reproducing failures locally, and the rebase test (#7).
- Two review rounds per PR (#6).
- Role and tier wording in place of model names, and harness verbs in place of Cursor-only tools.
- grill-me, pickup, design-system → spec → build, and ship's worktree removal.
- The three-harness vrub-help, setup-jstack and README.

### Expect conflicts next sync in

`skills/vrub-mode/playbooks/{autopilot-full,autopilot-stack,babysit,opening-a-pr,shipping,multi-phase-plan}.md` (push discipline), `skills/vrub-mode/scripts/check-plan.test.ts` (fixture wording), `skills/vrub-help/SKILL.md`, `skills/setup-jstack/SKILL.md`, `README.md`.
