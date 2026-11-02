---
name: setup-jstack
description: Configure which models jstack uses per role on the current harness (Cursor, Claude Code, or Codex). Detects the harness and its available models, then writes an always-loaded model config. Use for /setup-jstack, "configure jstack models", or changing jstack's model choices.
---

# Setup jstack

Write the jstack model config for the harness you are running in. Skills resolve every delegation through it per the vrub-mode skill's `references/models.md`, and fall back to the harness defaults when a line is absent, so this is an override layer, not a requirement.

## Steps

### 1. Detect the harness

Read [the harness guide](../vrub-mode/references/harness/README.md), then the adapter matching the host. Inspect the actual spawn schema before choosing model configuration or tool arguments. On an unrecognized host, use its advertised capabilities. Ask only for information that cannot be observed.

### 2. Detect available models

Enumerate the model tokens the spawn tool accepts in this session. That is the dependable source. On Claude Code it is the `Agent` tool's `model` enum. On Codex prefer the exposed spawn tool's model and effort options, then current host model metadata. A CLI model picker does not prove that the session can select subagent models. On Cursor it is the slugs `Task` accepts, and a models API or CLI listing the user's entitled models is better when present. If you cannot detect any, ask the user to paste the tokens they have access to. Never write a real token you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid.

### 3. Load current state

If the harness's user file already exists, read it and treat its values as the current choices. Otherwise start from the harness file's defaults. A role line that is not in the harness file's defaults block, such as `how critics`, is from a retired role. Drop it.

### 4. Map and confirm

Show the four tiers and every role with its current value, marking any real token not in the detected set as needing a choice. Also list each line step 3 dropped. Ask whether to accept as-is or change specific lines. Offer the detected tokens, the tier names, and `inherit-parent` (which runs the role on the parent chat model, and `auto` means the same) as the options. Prefer the harness's structured question tool over free text. In a non-interactive session (no question tool, or a scripted run) accept the current values without asking and say so.

Explain the shapes once. A tier is one model, except `panel`, which is a list, and `judge`, which may be `differs-from-parent`. A role value is a tier name, a token, a token list, or an alias. For panel roles one subagent runs per entry, alias entries included, so the list length sets the count. On a single-family harness repeated entries get split lenses, per `references/models.md`.

### 5. Validate

Every real token written must be in the detected set. Tier names and aliases always pass. The `computer use` role is the exception: it is a Codex `<model>@<effort>` token on every harness, so check it against the models the codex CLI lists, not the spawn tool. If a chosen token is not available, stop and ask again.

### 6. Write the config

Write the whole file so re-runs stay idempotent. The body is the same shape on every harness, the shape shown in the harness file's defaults block, with one `harness:` line, a `## Tiers` section, and a `## Roles` section. Prefix it with these two comment lines:

```
# jstack model configuration. Edit freely; re-run /setup-jstack to regenerate.
# A role value is a tier name, a model token, a token list, or `inherit-parent`. Delete a role line to fall back to its tier.
```

Then the harness-specific wiring:

- **Cursor.** Write `~/.cursor/rules/jstack-models.mdc` with frontmatter `description: jstack per-role model choices` and `alwaysApply: true`.
- **Claude Code.** Write `~/.claude/jstack-models.md`. Ensure `~/.claude/CLAUDE.md` contains the line `@~/.claude/jstack-models.md`. Append it if absent, and never duplicate it.
- **Codex.** Write `~/.codex/jstack-models.md`. Ensure `~/.codex/AGENTS.md` contains the line `Before any jstack delegation, read ~/.codex/jstack-models.md for the model per role.`. Append it if absent. If the native spawn tool accepts `model` and a reasoning field, use those at delegation time. No custom agent profile or global default change is needed. If it selects configured profiles through `agent_type`, inspect the current host's documented agent configuration before creating the required profiles. Do not infer a universal `default_subagent_model` setting or require a feature flag when native delegation already works. If no override mechanism exists, explain that role preferences are saved but this host inherits its default model.

If the harness refuses the write under the home directory (a sandboxed or non-interactive session), do not write into the repository instead. Print the full file body and the exact shell commands that put it in place, then stop.

### 7. Confirm

Tell the user which file was written and that it applies to new sessions. Re-running this skill updates it.

### 8. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill`. On no, move on without pushing.

### 9. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." On yes, invoke `/create-formal-verification-skill`. On no, move on without pushing.
