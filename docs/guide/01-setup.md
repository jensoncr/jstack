# Set up jstack

In this page you install the plugin, run setup, and run your first task.

## Install the plugin

The repo is private, so each install needs GitHub access to it.

In Claude Code, run:

```text
/plugin marketplace add jensoncr/jstack
/plugin install jstack@jstack
```

Claude Code prefixes plugin commands, so each command in this guide takes a `jstack:` prefix there, such as `/jstack:setup-jstack`. To test a local checkout instead, run `claude --plugin-dir ~/path/to/jstack`.

In Codex, run:

```text
codex plugin marketplace add jensoncr/jstack
codex plugin add jstack@jstack
```

In Cursor, clone the repo and run `scripts/install-cursor-local.sh` from it, then run **Developer: Reload Window**. The script copies the checkout into `~/.cursor/plugins/local/jstack`, so run it again after each update.

On any harness that reads skills, run:

```text
npx skills add jensoncr/jstack
```

## The models

One [model config](../../skills/vrub-mode/references/models.md#config) maps tiers to models and roles to tiers, for every harness. Each model is a seat, `<provider>/<model>@<effort>`. A seat on your chat's provider runs as a normal subagent. A seat on another provider runs through T3 Code's cross-provider delegation, and outside T3 Code it falls back to your chat's model. Every jstack skill reads that one block, on every machine, so there is nothing to configure per user. To pick different models, fork jstack and edit it.

A role set to `inherit-parent` or `auto` omits the subagent `model` field, so the subagent runs on your parent chat model. Both values mean the same thing, and neither is a model token. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size.

## Run setup

Run:

```text
/setup-jstack
```

[`/setup-jstack`](../../skills/setup-jstack/SKILL.md) turns on the Codex question picker and offers the verification skills below. Run it once per machine, then start a new chat.

## Accept the verification offers, or don't

At the end of setup, `/setup-jstack` looks for a way to prove app behavior in your project. If it finds none, it offers [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md). It writes `verify-<app>/` under the project skills directory (the `project skills dir` verb in your harness file), a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to jstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

Then it offers [`/create-formal-verification-skill`](../../skills/create-formal-verification-skill/SKILL.md). Tests check the cases someone thought to write. A formal verification skill checks one key property of your code, such as "a job never runs twice at once", in every case within a stated scope. Say yes when your code has concurrency, retries, a state machine, or a parser. You can run either skill yourself any time. [Verify and ship](./06-verify-and-ship.md#prove-a-property-with-a-formal-verification-skill) covers it.

## Keep the cost in check

jstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Ask for fewer candidates when you start a panel. Each one runs a subagent.
- Save `/vrub-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/vrub-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/vrub-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. How long `/vrub-mode` stays on depends on the harness. On Cursor, pick it from the `/` menu with Option+Enter (Mac) or Alt+Enter (Windows) instead of Enter. That makes it a [Custom Mode](https://cursor.com/docs/skills#using-a-skill-as-a-custom-mode), which stays in context on every turn until you exit it. Plain Enter attaches the skill to one message, and it fades as the chat moves on. On Claude Code and Codex, the skill stays in context while the task does, so invoke it again when you start a fresh task.

Next: [Route work through `/vrub-mode`](./02-vrub-mode.md).
