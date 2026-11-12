# Harness: Cursor

Use this adapter when the host identifies itself as Cursor. Read [the shared capability guide](README.md) first. The mappings below are examples; use only the tools and arguments advertised by the current session.

## Model tokens

The config is in [`../models.md`](../models.md#config). Cursor's `Task` tool runs every provider's models, so every seat runs natively: pass the model picker slug for that model and effort, such as `claude-opus-5-5-max` for `claudeAgent/claude-opus-5-5@max`. With no effort, use the model's default slug. Inside T3 Code, the README's T3 route wins.

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
| ask the user | `AskQuestion`, in local Agent and Plan chats. Cloud Agents and some models (Grok 4.5) do not get the tool, so use prose there. |
| todo list | the built-in todo list |
| loop | Use `/loop` when available; otherwise follow the shared guide for scheduled or foreground continuation. |
| skill invocation | `/<skill>` |
| transcripts | `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`, named in the system prompt |
| project skills dir | `.cursor/skills/` or `.agents/skills/` |
| another provider's model | the `Task` tool's `model` field. A `council` seat is a model picker slug, which names its provider and carries its effort, and the picker lists the providers. Inside T3 Code, the README's T3 route and its seat form win. |
