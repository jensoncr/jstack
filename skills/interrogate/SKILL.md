---
name: interrogate
description: "Use for \"interrogate\", \"adversarial review\", \"multi-model review\", \"challenge this\", \"stress test this code\", \"find blind spots\", or \"tear this apart\". Adversaries try to break a change or design, and only findings proven by a run survive."
---

# Interrogate

Adversaries try to break a change or a design. A finding survives only when a run proves it. Report the findings. Do not apply fixes.

## Frame

The scope is what the user names. Otherwise it is the branch diff from its merge base with the base branch, through the working tree. State the intent with the **in-your-own-words** skill, from the user's message, the commits, and the PR description. Ask the user when the intent is unclear.

**Ask with the question tool.** A question in a normal message goes unseen, and the thread looks done. Put every question that has two or more real options through the harness question tool, so the thread shows that it is waiting: `AskUserQuestion` on Claude Code, `request_user_input` on Codex, `AskQuestion` on Cursor. Make each question stand alone, with what you found, what blocks you, and the options. Follow the tool's own schema for how many questions and options one call takes, and put the recommended option first, marked. When there are more questions than one call takes, make back-to-back calls and never drop to prose. Ask in prose only when a question has no real options, or when the tool is missing or its call fails. Then start your message with the question, use prose for the rest of the session, and say once how to get the picker: on Codex, Plan mode or the `default_mode_request_user_input` feature flag that `/setup-jstack` sets; on Cursor, a local chat on a model that has the tool.

**Ask rarely.** Ask only when you cannot continue alone: the goal is ambiguous in a way that changes the result, or the next step is irreversible or outside what the user authorized. Decide everything else yourself with a sensible default, and list those decisions in the report.

## Fan out

Run Phase A steps 3 and 4 and Phase B of the **arena** skill, with five changes. Resolve `interrogate reviewers` (tier `panel`) per the vrub-mode skill's `references/models.md` in place of `arena runners`. Copy the scope's uncommitted changes into each worktree. Spawn each adversary as a general-purpose subagent. When entries repeat a model, give each repeat a different part of the intent to break first, in place of a design constraint, so their attempts diverge. In place of the arena task and rationale, give each adversary the scope, the intent, and this brief:

> Break this change. Prove each finding with a run against the real code, such as a failing test, a repro script, or command output that shows the wrong behavior. For a design or plan, run a prototype or probe the current tree. Keep repros in your own worktree. Report each finding with a title, the exact command, the output it printed, and the output the intent requires. Leave out anything you did not run. That covers style, naming, structure, and risks that need a future change to matter. No findings is a valid result.

## Verify

Verify each finding per arena Phase F by rerunning its command. Keep a finding when the output shows the failure and the failure breaks the intent. Drop the rest. Merge findings that share a root cause.

Skip arena Phases C, D, and E. Adversaries find different failures, so the verdict keeps every verified finding, not one adversary's list.

## Output

- **Intent**: the restatement.
- **Findings**: for each verified finding, the command, its output, how it breaks the intent, and the adversaries that found it. Say "no verified findings" when none survive.
- **Dropped**: for each adversary, the count of dropped findings and why.
