# Harness: Claude Code

Use this adapter when the host identifies itself as Claude Code. Read [the shared capability guide](README.md) first. The mappings below are examples; tool names and optional arguments vary between versions.

## Model tokens

The config is in [`../models.md`](../models.md#config). A `claudeAgent` seat runs natively on the `Agent` tool: pass the model's family as `model` (`claude-fable-5-2` is `fable`, `claude-opus-5-5` is `opus`) and the effort as `effort` when the tool takes it. Any other provider's seat uses the `another provider's model` verb below.

## Skill visibility

Claude Code hard-blocks the Skill tool on any skill with `disable-model-invocation: true` and tells the model not to replicate it, and `skillOverrides` does not apply to plugin skills. So jstack ships that flag only on `automate-me`, `vrub-help`, and `product`. Every skill vrub-mode routes to stays model-invocable. Cursor still lists all skills in its `/` palette either way.

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
| ask the user | `AskUserQuestion`. One call takes up to 4 questions with 2 to 4 options each. |
| todo list | `TodoWrite` |
| loop | Use a native loop or scheduling tool only when exposed; otherwise follow the shared guide for foreground continuation. |
| skill invocation | `Skill` tool, or `/jstack:<skill>` when installed as a plugin |
| transcripts | `~/.claude/projects/<slug>/*.jsonl` (slug is the project path with `/` replaced by `-`) |
| project skills dir | `.claude/skills/` |
| another provider's model | T3 Code's `delegate_task`, after `orchestrator_capabilities` lists the providers, when the session has them; none in plain Claude Code. A `council` seat is `<provider>/<model>[@<effort>]`, with the ids `orchestrator_capabilities` reports. |
