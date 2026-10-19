# Upstream sync log

One entry per pstack sync, newest first. Each entry lists the upstream commits pulled in and what jstack took, adapted, or left out. `UPSTREAM` holds the current upstream sha. `scripts/sync-upstream.sh` does the merge.

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
