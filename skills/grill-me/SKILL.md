---
name: grill-me
description: "Interview the user until their intent is pinned down: rounds of numbered questions, each with a recommended answer. Facts get looked up, not asked. Ends with an intent brief the user confirms before any work starts. Use only when the user asks for it: /grill-me, 'grill me', 'interview me first', 'stress-test my plan', or 'make sure you get what I want before building'."
---

# Grill me

Interview the user until you both hold the same picture of what they want. The deliverable is a confirmed intent brief, not code. Start no work until the user confirms it.

## Map the decision tree

Model the request as a tree of decisions. Each decision branches into the decisions that depend on it. Seed the root with what every playbook needs:

- The outcome, who notices it, and what the next owner of the code inherits.
- The done predicate, a check that passes or fails on the real artifact (the **prove-it-works** principle skill).
- Scope and non-goals.
- One-way doors: data shape, public surface, migrations, anything costly to reverse.

Attack the premise first. If the request looks like the wrong fix for the stated goal, the first round says so.

## Sort every question before you ask it

Each open node is one of three kinds. Only decisions reach the user.

- **Fact.** The repo, git history, docs, or tools can answer it. Look it up. Run the **how** skill for how something works now and the **why** skill for why it's shaped that way. Send bulk lookups to subagents on the `how explorer` role, per the vrub-mode skill's `references/models.md`.
- **Empirical.** Running something would settle it: behavior, layout, timing, output. Sketch it per the vrub-mode skill's `playbooks/prototype.md` and let the result decide, or list it as a prototype step in the brief.
- **Decision.** A product, preference, or priority call that no lookup or experiment settles. Ask it.

Don't block on lookups. A running lookup is an unsettled prerequisite, so only the questions downstream of it wait. Ask the rest of the frontier now.

A lookup that contradicts the user is itself a decision. "You said partial refunds, but `refund.ts` only refunds whole orders. Which is right?" goes in the next round.

## Ask in rounds

The frontier is every decision whose prerequisites are settled. Ask the whole frontier in one round, then stop and wait. A question that depends on another question in the same round belongs to a later round.

Phrase each question as a choice between named options, not yes or no, so the recommendation names an option. Give your real judgment with a one-line reason. "Don't build this" is a valid recommendation.

**Ask with the question tool.** Put every question that has two or more real options through the harness question tool: `AskUserQuestion` on Claude Code, `request_user_input` on Codex, `AskQuestion` on Cursor. Follow the tool's own schema for how many questions and options one call takes, and put the recommended option first, marked. When there are more questions than one call takes, make back-to-back calls and never drop to prose. Ask in prose only when a question has no real options, or when the tool is missing or its call fails. Then use prose for the rest of the session and say once how to get the picker: on Codex, Plan mode or the `default_mode_request_user_input` feature flag that `/setup-jstack` sets; on Cursor, a local chat on a model that has the tool.

Put the one-line reason in the recommended option's description. The prose form of a round:

```
❓ **Q1. <title>.** <context and the options>

➡️ <recommended option>. <one-line reason>
```

Number questions across the whole session so the user can answer by number.

Each round of answers moves the frontier. Recompute it from scratch and ask the next round. If an answer reopens a settled branch, reopen it.

## Pin the vocabulary

When the user uses a vague or overloaded term ("account": the Customer or the User?), propose one canonical term as a decision. Probe the boundary between two terms with a concrete edge case.

If the repo has a `GLOSSARY.md`, a `GLOSSARY-MAP.md`, or `docs/adr/`, or the user asks for docs, follow [`references/domain-docs.md`](references/domain-docs.md).

## Close with the intent brief

The interview ends when the frontier is empty, with every branch visited and nothing silently assumed. "Wrap up" from the user ends it early. Unvisited branches go under Open with the default you'd apply.

Write the brief:

- **Goal.** The outcome and who notices it.
- **Done when.** The predicate.
- **Decisions.** One line each: the decision, the answer, and what settled it (the user, or a fact or prototype with its evidence).
- **Out of scope.**
- **Open.** Each parked branch with its default.

Ask the user in prose to confirm or correct it, so the brief stays on screen. Do not start work until they confirm. On a correction, update the brief and ask again. If the work will continue in another session or a subagent, save the brief to a file and give its path.

Under the vrub-mode skill, the confirmed brief is the input to the matched playbook. Standalone, offer the `/vrub-mode` prompt that starts the work from the brief.

**Reply:** the current round, or the brief awaiting confirmation. Never a report about the interview.
