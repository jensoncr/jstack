### Opening a PR

For code or instruction changes that should be submitted. Read-only investigations and status checks do not open PRs.

**Worktree.** Work from a git worktree off main. Subagents inherit it. Multiple subagents spawned on the same branch each get their own worktree, or `git fetch && git reset --hard origin/<branch>` between them. Dirty branch with unrelated work: patch out, fresh worktree, apply. Snarled worktree: reset from main, redo minimally.

**Commits.** Commit liberally. Rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit. New commit when separable.

**Push gate.** Every push to a branch with an open PR runs its CI, so push to one only at a green checkpoint. Before the push that opens or updates a PR, run the repo's local checks on the committed head. Use its verify command when it has one. Otherwise run its typecheck, lint, and the tests for the touched paths, as its AGENTS.md or CLAUDE.md files and rules name them. A pre-commit hook pass is not proof. Fix a red check before the push. Batch every known fix into one push, and never push to learn whether CI passes. When a verifier gates the PR, get its verdict on the local commit first, then push the exact SHA it passed. A later commit needs its own verdict, and the patch-id rule in `playbooks/shipping.md` step 3 decides whether a verdict holds after a rebase.

A verify receipt is a record that the repo's verify command writes for one tree, for example under `$(git rev-parse --git-common-dir)/verify/<tree-hash>`. It holds the tree hash, the commands, and their exit status. A verifier checks the hash against `git rev-parse <sha>^{tree}` and treats a missing or mismatched receipt as no local proof. A verifier on another machine fetches a local commit from a scratch `<branch>-verify` branch with no PR, deleted after the verdict. Push a branch that has no PR as often as you like for backup. Neither push costs CI unless the repo's CI runs on every branch push.

**PRs.** Strip slop from the diff before commit. Use the `deslop` skill from the `cursor-team-kit` plugin when it is installed (Cursor). Otherwise use the **unslop** skill for prose and the **no-comments** skill for code. Run `/no-comments` before review. Write every PR title, PR description, and commit body with `/technical-writing`, then apply `/unslop`. Apply every technical-writing layer except Diátaxis. Use one word for each action, keep articles, and avoid `-ing` when a plain verb works.

**Titles.** Use Conventional Commits in the form `type(scope): subject`. Use `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf` as the type. Use the changed area, such as `jstack` or `vrub-mode`, as the scope. Keep the subject short and imperative. Name a real symbol when one carries the change. For example, `fix(jstack): retarget opening-a-pr babysit trigger`. Do not add a trailing period.

**Descriptions.** The PR body is a briefing, not the lab notebook. A reviewer who has the diff should learn why the change exists, what it leaves out, what it could break, and how you proved it works, in under a minute. Write short, simple sentences with few identifiers. Do not write walls of text. The squash commit body is the PR body. If the body would make the squash commit longer than about 40 lines, cut the body.

Put each section under a `##` heading, not a bold lead-in, so the sections stand apart. Use these sections in order. Drop a section when it has nothing to say.

- `## Why` gives the problem and the approach in one to three short sentences. Do not list SHAs or rebase genealogy. Do not add a "based on main" preamble.
- `## What changed` has one to three short bullets. Name a real symbol or path only when it carries the change. Name both sides of a rename or retarget.
- `## Scope` always names what the PR covers and what it deliberately leaves out, for example a related follow-up or a known gap. Use one to three short items. Do not list symbols or paths, and do not write a file-by-file essay.
- `## Tradeoffs` names only rejected alternatives that a reviewer would otherwise ask about. Skip this section when there was no real choice.
- `## Blast Radius` gives one or two sentences on who or what the change touches and why that is safe or risky. If main is red, state the cost of leaving it red.
- `## Verification` has one to three bullets. Each bullet names a real run path and its outcome. For a performance change, report one primary number with its unit in `before → after` form. Link the arena or swarm directory for the remaining evidence. Do not include sample-size methodology, swarm recitals, or metric tables.

After these sections, attach videos or screenshots when they prove a claim. Do not paste full SHAs, swarm or arena lane recitals, lever-correction essays, file-by-file checklists, or "CLEAN" verdicts. Put these details in a linked artifact. A commit body does not restate its subject.

**Forge.** Resolve the forge before the first PR operation and keep that choice for create, edit, view, watch, and merge. GitHub CLI (`gh`) is the default. If `command -v origin` succeeds and Origin can resolve the repository, prefer `origin pr ...`. If Origin is absent or cannot resolve the repository, stay on `gh` and record the fallback. Do not require Graphite (`gt`).

**Built-in PR tool.** When the run provides a built-in PR tool, create, edit, retarget, and mark ready through it, never through a forge CLI. Its own instructions say how. A PR made with the CLI misses what the tool tracks, such as a description later runs can edit. Use the resolved forge for everything the tool does not cover, and for every PR operation when the run has no such tool.

**Size and stacks.** Prefer five narrow PRs to one large PR. A stack is a base-branch chain. The root PR targets trunk. Each child branch rebases onto its parent's exact tip and its PR targets the parent branch. Without a built-in PR tool, create a child with `origin pr create --status open --base <parent-branch>` or `gh pr create --base <parent-branch>` according to the resolved forge, and retarget an existing child with `origin pr edit <pr> --base <parent-branch>` or `gh pr edit <pr> --base <parent-branch>`. Branch from trunk only for independent work. Rebase on trunk before substantial stack work.

**Readiness.** Open every PR ready, never as a draft. A built-in PR tool can default to draft, so set `draft: false` on every creation call through it. With Origin, pass `--status open`. With `gh`, omit `--draft`. If a PR still opens as a draft, mark it ready through the PR tool, or run `origin pr ready <number>` or `gh pr ready <number>` according to the resolved forge. Run `origin pr view <number>` or `gh pr view <number>` before you refer to PR status.

**Next stage.** Opening a PR alone does not start a watch or authorize a merge. If the user already asked to get the change green, continue through the `babysit` skill after the planned build work finishes. If the request includes merging, continue through `ship` without asking for the same authorization again. For a stack, finish the planned build phase before driving its lowest unmerged PR. A babysit for each new PR stalls the build and spends checks on commits later waves restart. Otherwise report the PR URL and the requested build result. Push back when feedback drifts from intent.

A subagent that opens a PR runs `interrogate`, the slop-strip above, and `/no-comments`, and posts the URL. Then it returns to the parent without babysitting, unless it is an Autopilot-full or Autopilot-stack owner. That owner's brief assigns the babysit loop and is the ask `playbooks/babysit.md` waits for. The owner starts the loop after its code-ready report and reports merge-ready or STACK-READY as its playbook says. The rules here and in `playbooks/babysit.md` that hold babysitting until a whole stack is built do not apply to that owner.
