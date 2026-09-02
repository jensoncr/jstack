# Harness: Claude Code

You are in Claude Code when the spawn tool is `Agent` (older builds also answer to `Task`), the question tool is `AskUserQuestion`, and the todo tool is `TodoWrite`.

## Model config

User file: `~/.claude/jstack-models.md`, imported into context by a `@~/.claude/jstack-models.md` line in `~/.claude/CLAUDE.md`. `/setup-jstack` writes both.

Model tokens are the `Agent` tool's `model` aliases. jstack uses `fable` and `opus` only; `sonnet` and `haiku` are never written by default.

Defaults when no config exists:

```
harness: claude-code

## Tiers
strong: fable
fast: opus
panel: fable, opus
judge: differs-from-parent

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

The panel is one family, so the rules in `../models.md` under "Panels on a single-family harness" apply. Lengthen the `panel` list to add reviewers; repeats get split lenses.

## Skill visibility

Claude Code hard-blocks the Skill tool on any skill with `disable-model-invocation: true` and tells the model not to replicate it, and `skillOverrides` does not apply to plugin skills. So jstack ships that flag only on `make-bot-ui` and `automate-me`; every skill vrub-mode routes to stays model-invocable. Cursor still lists all skills in its `/` palette either way.

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
| loop | `/loop`, or `ScheduleWakeup` from inside a loop |
| skill invocation | `Skill` tool, or `/jstack:<skill>` when installed as a plugin |
| transcripts | `~/.claude/projects/<slug>/*.jsonl` (slug is the project path with `/` replaced by `-`) |
| project skills dir | `.claude/skills/` |
