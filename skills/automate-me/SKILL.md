---
name: automate-me
description: "Use for \"automate me\", \"create/update/refresh my -mode skill\", \"turn/capture my preferences or working style into a skill\", or wanting agents to follow how the user works. Drafts or revises a personal -mode skill via skill authoring + unslop, optionally pulling fresh evidence from recent transcripts."
disable-model-invocation: true
---

# Automate me

A guided flow for turning the user's working conventions into a skill agents will follow. The output is one `-mode` skill tailored to them (e.g. `jay-mode`, `priya-mode`).

This skill orchestrates three others: an inline mining pass (see step 1), the authoring guide (`playbooks/authoring-a-skill.md` in the vrub-mode skill), and the **unslop** skill (prose discipline). It sequences them. It doesn't replace them.

## Flow

### 0. Check for an existing skill

Look recursively for `*-mode/SKILL.md` under the project skills directory (`project skills dir` verb) and the user skills directory for your harness, matching the user's handle. Mode skills can live in a personal category directory (`<project skills dir>/<handle>/`), not only at the top level. If one exists, confirm intent (unless they already said "update my skill" or similar):

- Update the existing skill (default for repeat runs)
- Start fresh (rare, ask why before doing it)

Update mode changes the rest of the flow:
- Step 1 mines only history since the skill was last edited (`git log -1 --format=%cI <path>`).
- Step 2 asks what's changed or missing, not what to capture from zero.
- Step 4 edits the existing file in place. Preserve sections the user hasn't contradicted. Revise ones with new evidence. Add new sections only for genuinely new rules.

### 1. Mine their history

Locate the active workspace's transcripts before fanning out. Use the harness transcript directory (the `transcripts` verb in your harness file), scoped to this workspace. Use only that path. Don't glob across other workspaces' transcript directories. That crosses workspace boundaries and reads private chats from unrelated projects.

Survey recent agent conversations within that scope for recurring patterns. Run multiple parallel subagents across slices of history (e.g. last 2-4 weeks, split into 3 slices so each has enough material). Pick each subagent's reasoning level for the job, per the Subagents section of the **vrub-mode** skill. Each slice mining subagent reads transcripts from the workspace-scoped path the parent provides, looks for the signals below, and returns a short structured list of patterns it saw with evidence pointers. Default signals worth hunting:

- Response preferences (length, tone, format, "dumb it down" corrections)
- Delegation habits (subagents, models, specialized workflows, parallelism)
- Verification posture (what "done" means, unit tests vs live repro, reviewers)
- Code and prose discipline (style, principles cited, lint/format tools)
- Process conventions (worktrees, commits, PRs, review/merge tooling)
- Meta preferences (fixing skills mid-task, proposing new ones)

Cross-check across slices before elevating a signal. Patterns seen in 2+ slices are high-confidence. Lone signals are weak and usually get dropped.

### 2. Ask the user directly

Mining misses intent that hasn't come up yet. Offer structured choices rather than asking the user to type from scratch.

**Ask with the question tool.** A question in a normal message goes unseen, and the thread looks done. Put every question that has two or more real options through the harness question tool, so the thread shows that it is waiting: `AskUserQuestion` on Claude Code, `request_user_input` on Codex, `AskQuestion` on Cursor. Make each question stand alone, with what you found, what blocks you, and the options. Follow the tool's own schema for how many questions and options one call takes, and put the recommended option first, marked. When there are more questions than one call takes, make back-to-back calls and never drop to prose. Ask in prose only when a question has no real options, or when the tool is missing or its call fails. Then start your message with the question, use prose for the rest of the session, and say once how to get the picker: on Codex, Plan mode or the `default_mode_request_user_input` feature flag that `/setup-jstack` sets; on Cursor, a local chat on a model that has the tool.

Shape: one or two questions, each with as many options as the tool takes, and multi-select for category questions where the tool has it. Start broad ("Which areas matter most?"), then follow up on selected areas with specific options. After the structured rounds, one free-form chat question catches anything the options missed.

Don't dump 20 questions.

### 3. Cluster findings

Group the combined signals into sections. Common ones (use only what applies):

- **Response style**: length, tone, format.
- **Autonomy**: how much to do without asking, MCP tool use.
- **Understand first**: which skills to reach for when scoping or investigating a change.
- **Subagents**: default, parallelism, model-to-task, specialized workflows.
- **Prose / code discipline**: principles, lint tools, style guides.
- **Review and verify**: repro posture, verification skills, live-testing tools.
- **Process**: git worktrees, commits, PRs, review/merge tooling.
- **Skills**: skill-authoring habits, fix-the-skill-first, proposing new skills.

The **vrub-mode** skill shows the shape. Read it for granularity. Don't copy its content. The user's rules are not the same as vrub-mode's.

### 4. Draft the skill

Author the skill with the authoring guide. Placement:

- Path: preserve an existing mode skill's category. For a new mode, use `<project skills dir>/<handle>/<handle>-mode/SKILL.md` when the repo has an established personal category for that handle. Otherwise default to `<project skills dir>/<handle>-mode/SKILL.md` in the project (the `project skills dir` verb), or `<handle>-mode/` under the user skills directory for your harness if the user prefers a personal skill.
- Handle: the user's first name or chosen identifier.
- Frontmatter `description`: trigger on their name + `/<handle>-mode` + "work in their style", not on generic keywords like "write code" or "review PR".
- Frontmatter formatting: follow the authoring guide's YAML rules. Keep `description` as one YAML scalar. Quote it or use `description: >-` with indented continuation lines when punctuation or wrapping requires it.
- Frontmatter `disable-model-invocation: true` by default. Opt out only if the user explicitly wants their mode to apply on every turn.

### 5. Iterate on prose

Apply the **unslop** skill and the authoring guide's writing guidelines to every line.

Show the draft to the user and take feedback. Expect multiple iterations. Cut ruthlessly. A mode skill is not a manual.

### 6. Land it

Work in a worktree off main. Commit and open a PR. Don't push to main directly.

## Guardrails

- **Don't overfit to one conversation.** A preference stated once and contradicted another time is noise. Require multiple instances before codifying it.
- **Don't be clever.** Restating other skills' contents, inventing metaphors, or writing "poetic" prose for an agent reader is cost without benefit. Keep it operational.
- **Reference, don't inline.** Other skills the user relies on should appear as path references, not pasted excerpts. Same for any principle docs they maintain elsewhere.
- **Keep sections minimal.** Only add a section if the user has a specific, non-default rule there. "Communicate clearly" is not a section. "Short paragraphs. Tables when comparing options. Bullets only when items are genuinely parallel." is.
- **Name conventions generic.** Use "the user" or "the human" in imperatives, not the author's first name.
- **Don't force symmetry.** If a user has no process rules worth writing down, skip the Process section entirely.

## Evaluation

A `-mode` skill is subjective output. The authoring guide's test/iterate benchmark loop isn't useful here. Vibe-check with the user: does it read like them? Did it miss anything? Then ship.

Run a description-optimization loop only if the skill's trigger accuracy turns out to be a problem in practice.

## When not to use

- User wants a task-specific skill (not working conventions): the authoring guide alone, no mining required.
- User wants to capture one narrow workflow (e.g. "how I write commit messages"). That's a regular skill, not a mode skill.
