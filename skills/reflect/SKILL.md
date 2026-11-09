---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Before fanning out, find this conversation's transcript in the harness transcript directory (the `transcripts` verb in your harness file), scoped to this workspace. Do not glob across other workspaces' transcript directories. That crosses workspace boundaries and reads private chats from unrelated projects.

```bash
ls -t <transcripts>/*.jsonl <transcripts>/*/*.jsonl <transcripts>/*/subagents/*.jsonl 2>/dev/null | head -10
```

That covers Cursor's legacy flat (`<id>.jsonl`), current nested (`<id>/<id>.jsonl`), and subagent (`<parent>/subagents/<child>.jsonl`) layouts. Claude Code stores one `<session>.jsonl` per session under its project directory. For each candidate, read the first JSONL line. Take the file whose first user message contains the conversation's opening user prompt. If none matches, pass a tight digest of the session instead.

## 2. Spawn three reviewers in parallel

One message, three general-purpose subagents, explicit model on each, agent mode (keeps MCP access). Reviewers need MCP access to look up the tickets, chat threads, and observability traces the transcript references, and read-only modes strip MCPs on some harnesses. The prompt forbids file writes. The parent applies edits.

Each spawn below names a role and its tier, resolved per the vrub-mode skill's `references/models.md`. Map the verbs below to tools per your harness file under its `references/harness/`. Pick each subagent's reasoning level for the job, per the Subagents section of the **vrub-mode** skill.

| Lens | `model` | Prompt template |
|---|---|---|
| Judgment | role `reflect judgment, divergent, synthesizer`, tier `strong` | `references/judgment-reviewer.md` |
| Tooling | role `reflect tooling`, tier `fast` | `references/tooling-reviewer.md` |
| Divergent | role `reflect judgment, divergent, synthesizer`, tier `strong` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their response body.

## 3. Synthesize

One general-purpose subagent on role `reflect judgment, divergent, synthesizer` (tier `strong`), agent mode (keeps MCP access). It spot-verifies citations through MCP, and read-only modes strip MCPs on some harnesses. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

File each Backlog item to your team's devex or backlog tracker without waiting. Only the Accepted list waits for approval.

Never edit a skill under `plugins/cache/`. Before approval, show its destination, `.cursor/skills/<skill>/` or `~/.cursor/skills/<skill>/`. After approval, copy the skill folder there and edit the copy. Never open a PR or push.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to Cursor's built-in `create-skill` skill where it exists; on other harnesses follow `playbooks/authoring-a-skill.md` in the vrub-mode skill, and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to the same authoring route and run its description-optimization loop.
- `new skill via create-skill: <kebab-name>`: hand creation to the same authoring route. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
