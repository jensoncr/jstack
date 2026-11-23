---
name: arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
---

# Arena

Open a todolist with one entry per phase (Frame, Fan out, Cross-judge, Pick, Graft, Verify) before launching anything.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
3. Pick the runners. Resolve `arena runners` (tier `panel`) per the vrub-mode skill's `references/models.md`, one candidate per entry, and map the verbs below to tools per your harness file under its `references/harness/`. When the host can't run an entry, follow step 4 of `references/models.md` or drop the seat, keep at least two runners, and say so. Spawn more for multiple design directions, and repeat one model when the work is generation-bound, not judgment-sensitive, with a distinct design constraint for each repeat. Pick each subagent's reasoning level for the job, per the Subagents section of the **vrub-mode** skill.
4. Give each candidate its own output location (a git worktree where possible, otherwise `/tmp/arena-<slug>/candidate-<n>/`), per the **separate-before-serializing-shared-state** principle skill.

## Phase B: Fan out

Spawn all N subagents in one message, in the background, each with the task, the path to the shared grounding, its own output path, and instructions to produce the artifact and a short rationale naming the alternatives it considered and what it rejected.

If a candidate produces no output, proceed with N-1 and note the dropout.

## Phase C: Cross-judge

After all Phase B candidates complete, resolve `arena cross-judge` (tier `judge`) and spawn the judges as read-only subagents. A role line that names seats is used as written, one judge per seat. A line that resolves to `differs-from-parent` seats judges per the two-judge rule in `references/models.md`: two from providers other than the parent's when the config has two, and one when it has one. On a host that runs only one provider, that rule seats a single judge on the parent's family. It runs in a fresh context, and the synthesis note counts its agreement as same-model, medium signal, per `references/models.md`. An `inherit-parent` or `auto` value never judges. If no judge can run, skip Phase C, pick the base alone in Phase D, and say so. Say how many judges ran and why.

Each judge works alone. It sees the rubric and the candidates by path label, never by model, scores each criterion, and recommends a base with rationale. The judges run in parallel with your reading in Phase D. Don't spawn them while candidates are still writing.

When two judges recommend different bases, run one more round. Give each judge the other's scores and rationale, unnamed, and ask it to hold or change its pick against the rubric. Don't run a third round.

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel, and compare with the cross-judges when Phase C ran them. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous. Read every rationale before deciding, and name a judge who still disagrees in the synthesis note.

Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API, per the Laziness Protocol.

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, per the **redesign-from-first-principles** principle skill, so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. No graft is needed. If they wildly diverge, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

After a graft, send the synthesized artifact back to the Phase C judges once. Each checks it against the rubric and names what a graft broke. Fix what you can show is wrong.

Verify the synthesized artifact like any other output, per the **prove-it-works** principle skill. If verification finds a problem the arena missed, either Phase A was wrong (re-frame and re-run) or a candidate caught it and you missed the graft (go back to Phase E). Don't paper over it.

## Outputs

One synthesized artifact, with a short synthesis note alongside naming the base and why, each cross-judge's verdict and whether they agreed, or that Phase C skipped them, each graft with its source candidate, what was rejected and why, any convergence or dropouts, and the verification result.
