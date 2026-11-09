---
name: council
description: "Get review or feedback from a council of models from different providers, fix what holds up, and loop until no member has a blocking finding. Use for /council, 'council', 'ask the council', or 'council review this'."
---

# Council

A council is one strong model from each of two or more providers, given the same request and context independently. Providers have different blind spots, so a finding that two of them raise on their own is strong signal. You lead the council: you brief the members, judge what they say, and make the changes. Members never write code.

## Before the council meets

Show the council the work as it will ship. Address the open PR comments, fix the issues you already know about, and run the repo's pre-push checks (the push gate in the vrub-mode skill's `playbooks/opening-a-pr.md`). Don't hold a known fix back for the review. When the user wants to throw the implementation away and explore new ideas, skip fixes to code that is being replaced.

State the user's goal and the intent of the work with the **in-your-own-words** skill. The scope is what the user names. Otherwise it is the branch diff from its merge base with the base branch, through the working tree.

## Seat the council

1. Seat the members the user names.
2. Otherwise seat the `council` line in the jstack model config, which lists one `<provider>/<model>[@<effort>]` per seat, using the provider and model ids that the host's cross-provider tool reports.
3. Otherwise seat the newest flagship model of each provider the host can run.

Each seat is on a different provider, at high reasoning effort unless the config gives another. Two seats is the minimum. Never fill a seat with a second model from a provider that already has one, and never substitute for a member the user named or the config lists. Report each seat that can't run. If fewer than two providers can run, say so and stop.

Reach the other providers through the host's cross-provider delegation (see the vrub-mode skill's `references/harness/README.md`). In T3 Code, call `orchestrator_capabilities` once, then start one `delegate_task` per seat, all in parallel. A host without cross-provider delegation can seat only its own provider, so the council can't meet there. Report that, and never launch another CLI to get around it.

## Brief the members

Give each member the same brief: the user's goal, the intent, the scope, and pointers to the files and the PR. Members are read-only: tell them to write nothing, and use a read-only mode where the host has one. Ask each member for:

- Each finding with its file and line, what goes wrong, and how they know. When they ran something, they include the command and its output.
- A score out of 10, for a code review.
- Anything they would change outside the scope, marked as out of scope.

Wait for each report as the host delivers it. Don't poll.

## Decide

Read every report. Merge findings that share a cause, and note which members raised each one. Check each finding against the code yourself before you act on it, because a member's claim is not evidence. Then sort each finding into one bucket:

- **Blocks.** A bug a user would hit, a failed check, or a doc line the work made wrong, and you confirmed it. Fix it.
- **In scope.** Real and inside what the user asked for. Fix it when you agree.
- **Follow-up.** Out of scope, or a matter of taste. List it with the members who raised it.
- **Wrong.** Dismiss it with the reason.

Fight scope creep. A review always finds more to do, but the user's request sets what this change does.

## Loop

After the fixes, start a new round with a new delegation for each seat. Each new brief carries the previous round's findings and what you did about each one. Each full pass of the council is one round. Stop when no member has a blocking finding left. If members still disagree with a call you made, report the disagreement rather than looping on it.

## Report

Open the final reply with the user's goal. Then give:

- the seats (provider and model),
- each round's scores,
- what you fixed,
- what you dismissed and why,
- the follow-ups, with the members who raised them,
- any seat that couldn't run.

If the work has a PR, put the scores in its description, just before the model and harness line at the end. Edit the description, and don't post a comment. For example:

```markdown
## Council review

Rounds: 2

| Member | Round 1 | Round 2 |
| --- | --- | --- |
| <provider> <model> | 7/10 | 9/10 |
| <provider> <model> | 8/10 | 10/10 |
```

Write `no score` when a member gives none. Never invent one. With no PR, the same table goes in the final reply.

Adapted from the `council` skill in [t3dotgg/tstack](https://github.com/t3dotgg/tstack) (MIT).
