# Harness: Antigravity

Use this adapter when the host identifies itself as Antigravity: the `agy` CLI, or an Antigravity thread in T3 Code, which runs `agy acp`. Read [the shared capability guide](README.md) first. The mappings below were checked on those two and are examples; tool names and optional arguments vary between versions.

## Model tokens

The config is in [`../models.md`](../models.md#config). `invoke_subagent` takes neither a model id nor an effort, only a `Model` tier (`inherit`, `flash_lite`, `flash`, `pro`), so it cannot pass what a seat names. Start every seat with the `another provider's model` verb when the session has it. Otherwise leave `Model` out, so the subagent runs on the session's model, and report the seat's effort as not applied and its model as unconfirmed. An agent file's `model:` takes the same tiers, and the loader skips an agent whose `model:` is anything else. So jstack's agent files set none.

## Skill loading

Antigravity has no skill tool. The system prompt lists each skill's name, description, and `SKILL.md` path. Load a skill by reading that file, and read its supporting files relative to that folder. A skill with `disable-model-invocation: true` is left out of the list, so `automate-me`, `vrub-help`, and `product` run only when the user types them.

## Subagents in T3 Code

T3 Code bundles its own `agy`, and `$ANTIGRAVITY_LS_VERSION` names it. On `cli-1.5.14`, a subagent's permission prompt never reaches T3 Code and fails after 60 seconds. Antigravity's changelog lists that as fixed in 1.5.16. Until then a subagent cannot run a shell command, write in your workspace, or touch a path outside the workspace and the installed plugin. It can still read both, and write in its own `share` worktree. So keep `invoke_subagent` for reading and research, and start any subagent that runs commands or writes your files with the `another provider's model` verb, on the seat `antigravity/<your model>`. When that route is missing too, do the work yourself and report the delegation as unmet.

## Vocabulary

| jstack says | Antigravity |
|---|---|
| spawn a subagent | `invoke_subagent` with `TypeName`, `Role`, and `Prompt`, in the shape the current schema gives |
| general-purpose subagent | `TypeName: "self"` |
| named agent (`vrub-agent`, `comment-sicko`) | `TypeName: "self"`, with the body of the agent file (`agents/<name>.md` at the plugin root) as the brief. `TypeName: "<name>"` is accepted, but that subagent gets a read-only tool set, with no file writes and no shell. |
| model | no model id per spawn; see Model tokens |
| read-only | a no-writes brief, which is an instruction, not a sandbox |
| background | every subagent runs in the background and wakes you with a message when it finishes. Follow up with `send_message`; list or stop with `manage_subagents`. |
| own worktree | `Workspace: "share"`, which gives the subagent a new git worktree on a `subagent-*` branch at your HEAD, under Antigravity's app data folder. Find its path and branch with `git worktree list`, and remove both when the work has landed. |
| cloud | no equivalent; run locally |
| ask the user | `ask_question`. Give each question its options without an "Other", because the picker adds one, and prefix the recommended option with `(Recommended)`. |
| todo list | `update_steps` when exposed; otherwise keep a concise checklist |
| loop | the `schedule` tool when exposed; there is no `/loop`. Otherwise follow the shared guide for foreground continuation. |
| skill invocation | `/jstack:<skill>`, typed first in the message. `agy` expands only the prefixed form. When a message carries an unexpanded `/jstack:<skill>`, as a message delegated through T3 Code does, read that skill's `SKILL.md` yourself, hidden skills included. |
| transcripts | `<app data>/brain/<conversation id>/.system_generated/logs/transcript.jsonl`. `<app data>` is `$ANTIGRAVITY_APP_DATA_DIR` when set, as T3 Code sets it, and `~/.gemini/antigravity-cli` otherwise. `$ANTIGRAVITY_CONVERSATION_ID` is this session's id. The folders hold every project's conversations, so before reading another one, confirm that its transcript names this workspace. |
| project skills dir | `.agents/skills/` |
| another provider's model | T3 Code's `delegate_task`, after `orchestrator_capabilities` lists the providers, when your tool list has `delegate_task` itself; a delegated thread can have `orchestrator_capabilities` without it. None in plain `agy`. A `council` seat is `<provider>/<model>[@<effort>]`, where the provider is a `driverKind` from `orchestrator_capabilities` (see `../models.md`). |
