# Set up jstack

In this page you install the plugin, pick which models jstack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

In a Cursor chat, run:

```text
/add-plugin jstack
```

Cursor confirms the plugin is installed.

In Claude Code, run `claude --plugin-dir ~/path/to/jstack` to test a local checkout, or install it:

```text
/plugin marketplace add jensoncr/jstack
/plugin install jstack
```

On any harness that reads skills, run:

```text
npx skills add jensoncr/jstack
```

## Pick your models

Run:

```text
/setup-jstack
```

[`/setup-jstack`](../../skills/setup-jstack/SKILL.md) detects the models you have access to, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It writes a small always-loaded config every jstack skill reads: `~/.cursor/rules/jstack-models.mdc` on Cursor, `~/.claude/jstack-models.md` on Claude Code, `~/.codex/jstack-models.md` on Codex.

You only override what you care about. A role with no line keeps its tier, and the tier maps to your harness's default model. To restore a default later, delete that role's line, or just run `/setup-jstack` again.

You might be wondering what happens if you use Auto. Set a role to `inherit-parent` or `auto` and jstack omits the subagent `model` field, so the subagent inherits your parent chat model. Both values mean the same thing, and neither is a model token. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

At the end of setup, `/setup-jstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `verify-<app>/` under the project skills directory (the `project skills dir` verb in your harness file), a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers when it earns its place.

After setup, start a new chat. The model config applies to new sessions.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/vrub-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. The first item is always "read the Principles section". The rest are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/vrub-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. `/vrub-mode` is sticky. It stays on for the conversation until you opt out by saying so.

Next: [Route work through `/vrub-mode`](./02-vrub-mode.md).
