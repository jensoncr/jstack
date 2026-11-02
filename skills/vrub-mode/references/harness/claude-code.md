# Harness: Claude Code

Use this adapter when the host identifies itself as Claude Code. Read [the shared capability guide](README.md) first. The mappings below are examples; tool names and optional arguments vary between versions.

## Model config

User file: `~/.claude/jstack-models.md`, imported into context by a `@~/.claude/jstack-models.md` line in `~/.claude/CLAUDE.md`. `/setup-jstack` writes both.

Model tokens are the `Agent` tool's `model` aliases. jstack uses `opus` only; `fable`, `sonnet`, and `haiku` are never written by default. Single-model panels get split lenses per `../models.md`.

Defaults when no config exists:

```
harness: claude-code

## Tiers
strong: opus
fast: opus
panel: opus, opus
judge: opus

## Roles
feature, refactoring: strong
bug-fix: strong
perf-issue: strong
hillclimb: strong
hardest tasks: strong
judgment and prose: strong
how explorer: fast
how explainer: strong
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
computer use: gpt-6.1-sol@high
```

The panel is one family, so the rules in `../models.md` under "Panels on a single-family harness" apply. Lengthen the `panel` list to add reviewers; repeats get split lenses.

## Skill visibility

Claude Code hard-blocks the Skill tool on any skill with `disable-model-invocation: true` and tells the model not to replicate it, and `skillOverrides` does not apply to plugin skills. So jstack ships that flag only on `make-bot-ui`, `automate-me`, `vrub-help`, and `product`. Every skill vrub-mode routes to stays model-invocable. Cursor still lists all skills in its `/` palette either way.

## Vocabulary

| jstack says | Claude Code |
|---|---|
| spawn a subagent | `Agent` tool |
| general-purpose subagent | `subagent_type: "general-purpose"` |
| named agent (`vrub-agent`, `comment-sicko`) | `subagent_type: "<name>"` from the plugin's `agents/` |
| model | `model: "<token>"`; omit for `inherit-parent` |
| read-only | `subagent_type: "Explore"` (no Edit or Write, keeps MCP), or tell a general-purpose agent to write nothing |
| background | `run_in_background: true` |
| own worktree | `isolation: "worktree"` |
| cloud | no equivalent; run locally |
| ask the user | `AskUserQuestion` |
| todo list | `TodoWrite` |
| loop | Use a native loop or scheduling tool only when exposed; otherwise follow the shared guide for foreground continuation. |
| skill invocation | `Skill` tool, or `/jstack:<skill>` when installed as a plugin |
| transcripts | `~/.claude/projects/<slug>/*.jsonl` (slug is the project path with `/` replaced by `-`) |
| project skills dir | `.claude/skills/` |
