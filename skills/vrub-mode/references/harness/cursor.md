# Harness: Cursor

You are in Cursor when the spawn tool is `Task` with `readonly` and `environment` parameters and the question tool is `AskQuestion`.

## Model config

User file: `~/.cursor/rules/jstack-models.mdc` with `alwaysApply: true`, so it is in context every session. `/setup-jstack` writes it.

Model tokens are Cursor model picker slugs, exactly as the `Task` tool accepts them.

Defaults when no config exists:

```
harness: cursor

## Tiers
strong: claude-fable-5-1-thinking-max
fast: grok-4.6-fast-xhigh
panel: claude-fable-5-1-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
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
reflect tooling: gpt-5.6-sol-max
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

## Vocabulary

| jstack says | Cursor |
|---|---|
| spawn a subagent | `Task` tool |
| general-purpose subagent | `subagent_type: generalPurpose` |
| named agent (`vrub-agent`, `comment-sicko`) | `subagent_type: "<name>"` from the plugin's `agents/` |
| model | `model: "<slug>"`; omit for `inherit-parent` or `auto` |
| read-only | `readonly: true` (strips MCP access, so not for investigators that need MCPs) |
| background | `run_in_background: true` |
| own worktree | create it with `git worktree add` and name the path in the brief |
| cloud | `environment: "cloud"`, with `cloud_base_branch` when starting from a pushed branch |
| ask the user | `AskQuestion` |
| todo list | the built-in todo list |
| loop | `/loop` |
| skill invocation | `/<skill>` |
| transcripts | `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`, named in the system prompt |
| project skills dir | `.cursor/skills/` or `.agents/skills/` |
