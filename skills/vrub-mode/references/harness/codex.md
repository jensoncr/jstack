# Harness: Codex

Use this adapter when the host identifies itself as Codex. Read [the shared capability guide](README.md) first. Desktop, CLI, and hosted sessions expose different tool schemas; absent optional tools do not mean this is a different host.

## Model tokens

The config is in [`../models.md`](../models.md#config). A `codex` seat runs natively on the spawn tool: pass the model id as its model and the effort as its reasoning field, or omit the effort to use the model's default. Any other provider's seat uses the `another provider's model` verb below.

## Vocabulary

| jstack says | Codex |
|---|---|
| spawn a subagent | Use the exposed native spawn tool, commonly `spawn_agent`, and its current schema. Do not require config edits when the tool is already available. |
| general-purpose subagent | Use the default role, or a supported `agent_type` if the schema offers it. |
| named agent | Use a registered agent only when the host exposes it; otherwise give a general-purpose agent the named agent file as its brief. |
| model | Prefer supported `model` and reasoning fields. On hosts that expose only `agent_type`, use a confirmed configured profile. Otherwise inherit the parent and disclose any unavailable requested override. Respect restrictions on model overrides when forking full history. |
| read-only | Use a supported read-only mode, or a no-writes brief for an ordinary delegate; the latter is an instruction, not a sandbox. |
| background | Native spawning is generally asynchronous. Use the returned agent identifier with the available wait and messaging tools; names and parameters vary by host. |
| own worktree | Create an isolated git worktree and put its absolute path and starting revision in the brief, unless native isolation is available. |
| cloud | Use only an explicitly available remote subagent capability. A user-owned task-creation tool is not a substitute for a subagent. Otherwise work locally. |
| ask the user | `request_user_input`, or the asynchronous variant when offered. One call takes up to 3 questions with 2 to 3 options each, from the root thread only. It works in Plan mode, and in Default mode only when the `default_mode_request_user_input` feature flag is on. Otherwise the call fails, so use prose. |
| todo list | Use a plan tool if exposed; otherwise keep a concise checklist. |
| loop | Follow the continuation procedure below. |
| skill invocation | Select the exposed plugin skill by name; CLI and IDE commonly support `$<skill-name>`. Use the host's actual namespacing. |
| transcripts | Use the current task's supplied transcript location or read-task tool; CLI sessions commonly live under `~/.codex/sessions/`. |
| project skills dir | `.agents/skills/` |
| another provider's model | T3 Code's `delegate_task`, after `orchestrator_capabilities` lists the providers, when the session has them; none in plain Codex. A `council` seat is `<provider>/<model>[@<effort>]`, with the ids `orchestrator_capabilities` reports. |

## Continuing a watch

When a native scheduling tool is available, use its documented create/update operation for an authorized ongoing watch. Prefer continuation in the current task over creating a new task for each check. Inspect existing continuations and reuse the one for this repository and PR. Preserve the watch state and stop conditions from [the shared guide](README.md).

Codex desktop may expose an automation tool with a thread heartbeat mode. Follow that tool's current schema and scheduling rules. Confirm creation before reporting that monitoring will continue, and pause or remove the continuation once the requested outcome is reached. A status-only question does not create an automation.

When no scheduling capability exists, run the watcher within the active session using bounded tool waits. Do not invent a CLI `/loop`, install cron as a fallback, or promise continued monitoring after the session ends. Persist a handoff when continued observation is unavailable.
