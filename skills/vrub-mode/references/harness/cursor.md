# Harness: Cursor

Use this adapter when the host identifies itself as Cursor. Read [the shared capability guide](README.md) first. The mappings below are examples; use only the tools and arguments advertised by the current session.

## Model config

User file: `~/.cursor/rules/jstack-models.mdc` with `alwaysApply: true`, so it is in context every session. `/setup-jstack` writes it.

Model tokens are Cursor model picker slugs, exactly as the `Task` tool accepts them.

Defaults when no config exists:

```
harness: cursor

## Tiers
strong: claude-opus-5-5-max
fast: grok-4.7-xhigh-fast
panel: claude-opus-5-5-max, gpt-6.1-sol-max, grok-4.7-xhigh-fast
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
why investigators: fast
why synthesizer: strong
reflect tooling: gpt-6.1-sol-max
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
| loop | Use `/loop` when available; otherwise follow the shared guide for scheduled or foreground continuation. |
| skill invocation | `/<skill>` |
| transcripts | `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`, named in the system prompt |
| project skills dir | `.cursor/skills/` or `.agents/skills/` |
