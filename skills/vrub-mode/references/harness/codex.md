# Harness: Codex

You are in Codex when the spawn tool is `spawn_agent` (with `wait_agent`, `send_input`, `close_agent`), the question tool is `request_user_input`, and the todo tool is `update_plan`.

## Model config

User file: `~/.codex/jstack-models.md`, pointed at by a line in `~/.codex/AGENTS.md` that says to read it before any jstack delegation. `/setup-jstack` writes both, and one custom agent per distinct model token under `~/.codex/agents/jstack-<slug>.toml` so a token is spawnable by `agent_type`.

Model tokens are `<model>@<reasoning effort>`. The model is a Codex model id (`gpt-5.6-sol`, `gpt-5.6-luna`, or whatever `/model` lists), and the effort is one of `low`, `medium`, `high`, `xhigh`. A token without `@` uses the model's default effort.

Defaults when no config exists:

```
harness: codex

## Tiers
strong: gpt-5.6-sol@xhigh
fast: gpt-5.6-sol@high
panel: gpt-5.6-sol@xhigh, gpt-5.6-sol@high
judge: gpt-5.6-sol@xhigh

## Roles
feature, refactoring: strong
bug-fix: strong
perf-issue: strong
hillclimb: strong
hardest tasks: strong
judgment and prose: strong
how explorer: fast
how explainer: strong
how critics: panel
why investigators: fast
why synthesizer: strong
reflect tooling: fast
reflect judgment, divergent, synthesizer: strong
arena runners: panel
arena cross-judge: judge
swarm workers: fast
architect runners: panel
interrogate reviewers: panel
trail reviewer: judge
orchestrate verifier: judge
recall workers: fast
```

One family and often one model, so the rules in `../models.md` under "Panels on a single-family harness" apply. `judge` is a fixed token here because `differs-from-parent` cannot be satisfied.

## Vocabulary

| jstack says | Codex |
|---|---|
| spawn a subagent | `spawn_agent`; requires `[features] multi_agent = true` in `~/.codex/config.toml` |
| general-purpose subagent | `agent_type: "worker"` (or `"explorer"` for read-only) |
| named agent (`vrub-agent`, `comment-sicko`) | not available; give a worker the agent file's body as its brief |
| model | `agent_type: "jstack-<slug>"`, the custom agent setup wrote for that token. When the spawn schema has no `agent_type`, a spawned subagent runs on `[agents] default_subagent_model` from `config.toml` (setup pins it to the `strong` model); for a `fast` role that must differ, run `codex exec -m <model> -c model_reasoning_effort=<effort> "<brief>"` from the shell instead |
| read-only | `agent_type: "explorer"`, or `sandbox_mode = "read-only"` in the custom agent |
| background | every `spawn_agent` is asynchronous; collect with `wait_agent` |
| own worktree | create it with `git worktree add` and name the path in the brief |
| cloud | no equivalent; run locally |
| ask the user | `request_user_input` when enabled, otherwise ask in prose and stop |
| todo list | `update_plan` when enabled (`[tools.update_plan] enabled = true`), otherwise a checklist in your reply |
| loop | none in the CLI; Codex app Automations, or `codex exec` under cron |
| skill invocation | `$<skill-name>` |
| transcripts | `~/.codex/sessions/` |
| project skills dir | `.agents/skills/` |
