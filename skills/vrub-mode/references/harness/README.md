# Harness capabilities

Use the current session's tool descriptions, schemas, permissions, and user instructions as the source of truth. Read the matching adapter for examples: [Codex](codex.md), [Cursor](cursor.md), or [Claude Code](claude-code.md). Product names and optional UI fields do not establish which tools a session supports.

Before a workflow needs delegation, questions, or continuation, check those capabilities. Use supported arguments only. Reuse an existing capability decision until a tool becomes unavailable or the environment changes.

- **Delegation.** Use the native subagent tool when available and permitted. Resolve role models through [model resolution](../models.md); pass an override only through a supported field. Respect restrictions on inherited context and model overrides. Do not launch another CLI or change global configuration to bypass an unavailable capability or policy.
- **Cross-provider delegation.** Some skills, such as council, need models from other providers. On Cursor the native subagent tool runs other vendors' models. In T3 Code, any harness can call `orchestrator_capabilities` to list the providers it can run and `delegate_task` to start a child on another provider's model. Start every council seat that way, the lead's own provider included, so each seat runs the model and effort it was given. Elsewhere there is none, so report the unmet need. Never launch another CLI to get one.
- **Isolation.** Use native worktree isolation when offered; otherwise create a separate git worktree and give the worker its absolute path. Verify its starting revision. Cloud execution is optional; local execution must still provide the required tools and evidence.
- **Questions and planning.** Use the available question or planning tool. If absent, use concise prose and a checklist. Continue work that does not depend on an unanswered question. Preserve authorization already given in this session.
- **Required gates.** A missing independent reviewer, test environment, approval, or forge permission is an unmet gate. Report it and continue unrelated authorized work. Never turn missing capability into a passing verdict. Optional conveniences may be skipped with a short explanation.

## Continuing a watch

Use the playbook's existing watcher for event detection. A running shell process alone does not guarantee that the agent will return to handle its output after the turn ends.

For an authorized ongoing watch, use the host's native loop or scheduled continuation when available. Attach continuation to the current task where supported. Save the repository, PR list, mode, authorization scope, latest evidence, next action, and stop condition. Reuse or update an existing continuation for the same work; do not create duplicate watchers.

Notify on a meaningful change, completion, failure, or required decision. Stop the task's watcher and cancel its continuation when the requested outcome is reached or the user stops it. Do not stop work owned by another task.

Without a scheduler, keep the watch within the active session using bounded tool waits. If the session must end, save a resumable handoff and state that monitoring is no longer active. Do not invent a `/loop` command, install a system cron job, or claim an unscheduled background watch.

Persist the objective and completion predicate in task state. Use a native goal feature only when available and authorized under that tool's rules. A saved objective does not itself schedule another turn.

## Skill selection

Skill names and descriptions are the portable discovery mechanism. Read supporting files relative to the skill that owns them. Explicit invocation syntax and persistent modes are host-specific; do not assume Cursor's mode metadata makes a skill stay active in other hosts.
