---
name: setup-jstack
description: One-time jstack setup on a machine for the current harness (Cursor, Claude Code, or Codex). Turns on the Codex question picker and offers verification skills for the project. Use for /setup-jstack or "set up jstack". Model choices are not configured here; they ship in the plugin's harness files.
---

# Setup jstack

Prepare this machine and project for jstack. jstack's models are the one config in `../vrub-mode/references/models.md`, shipped with the plugin. There is no per-user model config, so this skill never writes one. To use different models, fork jstack and edit that block.

**Ask with the question tool.** A question in a normal message goes unseen, and the thread looks done. Put every question that has two or more real options through the harness question tool, so the thread shows that it is waiting: `AskUserQuestion` on Claude Code, `request_user_input` on Codex, `AskQuestion` on Cursor. Make each question stand alone, with what you found, what blocks you, and the options. Follow the tool's own schema for how many questions and options one call takes, and put the recommended option first, marked. When there are more questions than one call takes, make back-to-back calls and never drop to prose. Ask in prose only when a question has no real options, or when the tool is missing or its call fails. Then start your message with the question, use prose for the rest of the session, and say once how to get the picker: on Codex, Plan mode or the `default_mode_request_user_input` feature flag that `/setup-jstack` sets; on Cursor, a local chat on a model that has the tool.

## Steps

### 1. Detect the harness

Read [the harness guide](../vrub-mode/references/harness/README.md), then the adapter matching the host. On an unrecognized host, use its advertised capabilities. Ask only for information that cannot be observed.

### 2. Turn on the Codex question picker

Codex only. Codex takes `request_user_input` outside Plan mode only when the `default_mode_request_user_input` feature flag is on. Run `codex features list` to read it. If the flag is listed and off, turn it on: add `default_mode_request_user_input = true` under `[features]` in `~/.codex/config.toml`, keeping every other line. If it is on, or `codex features list` does not list it, change nothing and say which.

### 3. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill`. On no, move on without pushing.

### 4. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." On yes, invoke `/create-formal-verification-skill`. On no, move on without pushing.

### 5. Confirm

Say what changed on this machine, and that a Codex feature flag change applies to new sessions.
