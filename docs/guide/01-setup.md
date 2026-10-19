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

Claude Code prefixes plugin commands, so each command in this guide takes a `jstack:` prefix there, such as `/jstack:setup-jstack`.

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

You only override what you care about. A role with no line keeps its tier, and the tier maps to your harness's default model. To restore a default, delete that role's line. A rerun of `/setup-jstack` starts from your current config and drops lines for retired roles.

You might be wondering what happens if you use Auto. Set a role to `inherit-parent` or `auto` and jstack omits the subagent `model` field, so the subagent inherits your parent chat model. Both values mean the same thing, and neither is a model token. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm.

## Accept the verification offers, or don't

At the end of setup, `/setup-jstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `verify-<app>/` under the project skills directory (the `project skills dir` verb in your harness file), a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to jstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

Then setup offers once to generate a formal verification skill with [`/create-formal-verification-skill`](../../skills/create-formal-verification-skill/SKILL.md), unless the project already has one. Tests check the cases someone thought to write. A formal verification skill checks one key property of your code, such as "a job never runs twice at once", in every case within a stated scope. Say yes when your code has concurrency, retries, a state machine, or a parser, where a bug is costly and tests rarely reach the case that breaks. Otherwise say no, and run it later if that changes. [Verify and ship](./06-verify-and-ship.md#prove-a-property-with-a-formal-verification-skill) covers it.

After setup, start a new chat. The model config applies to new sessions.

## Keep the cost in check

jstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `/setup-jstack` and pick a smaller reasoning budget or cheaper models. A strong model in the main chat with cheaper, faster models in the code roles is a good split.
- Set a role to `auto` or `inherit-parent` so it runs on the chat's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/vrub-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/vrub-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/vrub-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. How long `/vrub-mode` stays on depends on the harness. On Cursor, pick it from the `/` menu with Option+Enter (Mac) or Alt+Enter (Windows) instead of Enter. That makes it a [Custom Mode](https://cursor.com/docs/skills#using-a-skill-as-a-custom-mode), which stays in context on every turn until you exit it. Plain Enter attaches the skill to one message, and it fades as the chat moves on. On Claude Code and Codex, the skill stays in context while the task does, so invoke it again when you start a fresh task.

Next: [Route work through `/vrub-mode`](./02-vrub-mode.md).
