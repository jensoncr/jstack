---
name: product
description: "Explicit-invoke only. Take a new product or a large new feature from idea to a built product. Runs design-system when the project has none, then a deep interview, live research, and independent validators that produce a validated spec, then writes a vrub-mode multi-phase plan that the autopilot playbooks execute. Use only when the user types /product."
disable-model-invocation: true
---

# /product

The pipeline is **design system → spec → plan → build**.

1. **Design.** The **design-system** skill (`../design-system/SKILL.md`) settles the visual system.
2. **Spec.** This skill interviews, researches, drafts, and validates the spec.
3. **Plan.** This skill writes `docs/spec/plan.md` as a vrub-mode multi-phase plan.
4. **Build.** On the user's go, the plan's execution playbook builds it (`autopilot-stack`,
   `autopilot-full`, or `orchestrate` under `../vrub-mode/playbooks/`). That playbook owns
   testing, verification, PRs, and merging. This skill never writes product code.

Drafting transcribes an agreed definition. It never invents one. **Never silently fill a gap
with a plausible guess.** Ask about every gap, or log it as an explicit assumption.

## Output layout

All artifacts land in the target project at `docs/spec/`:

```
docs/spec/
├── product-definition.md   # Signed-off interview record + assumptions log (Phase 2)
├── constitution.md         # Non-negotiable principles (Phase 2)
├── spec.md                 # PRD (Phase 4)
├── architecture.md         # C4 diagrams + data model + ADRs (Phase 4, tier 2+)
├── security.md             # DFD + STRIDE + security requirements (Phase 4, tier 2+)
├── ux.md                   # Flows, screens, a11y (Phase 4, tier 2+)
├── validation-report.md    # Final validator findings + resolutions (Phase 5)
├── plan.md                 # vrub-mode multi-phase plan (Phase 6)
└── working/
    └── research-notes.md   # Cited research (Phases 1 and 3)
```

If there is no project directory yet, ask the user where to put it (default
`~/Projects/<idea-slug>/`). Track the phases in the harness's task or todo list so the user sees
progress.

## Phase 0. Intake

1. **Ingest** everything the user provides. Read the files they mention and fetch their links.
   Ask nothing yet.
2. **Design system.** Check the target project for `design/design.md`.
   - **If present**, read it. It answers the *Look and feel* coverage area (character, color,
     typography, density, component inventory). Mark that area defined, never re-interview it,
     and reference it in Phase 4 instead of restating it.
   - **If absent and the tier is 2 or higher**, run the **design-system** skill now. It is step 1
     of this pipeline. If the user declines, gather *Look and feel* in the interview and give
     `ux.md` a prose direction instead of tokens.
3. **Gap analysis.** Score the user's context against every coverage area in
   `interview/readiness-rubric.md`. Mark each area defined, partial, or undefined. This map drives
   the interview. Play defined areas back for confirmation. Never re-ask them.
4. **Tier.** Classify, and confirm with one question.
   - **Tier 1. Feature** in an existing product. spec.md and plan.md only, with architecture and
     security as sections inside spec.md. Validators are consistency and simplicity. An existing
     codebase usually fits vrub-mode's Feature or Multi-phase plan playbook better. Say so and
     offer that route first.
   - **Tier 2. Product** (new product or MVP). All artifacts, all six validators.
   - **Tier 3. Platform** (multi-service, compliance-heavy). All artifacts, per-service C4
     component diagrams, the full traceability matrix, all validators, and at least 2 repair
     rounds.

## Phase 1. Reconnaissance research

Before interviewing, run a light web-search pass so the questions are informed. Cover how
comparable products solve this, table-stakes versus differentiator features, and obvious
landmines (compliance, platform policies). Write findings with source URLs to
`docs/spec/working/research-notes.md`.

The point is question quality. "Competitor X auto-assigns on mention. Do you want that, or is
doing Y your differentiator?" beats "what features do you want?".

## Phase 2. Deep interview

Read `interview/readiness-rubric.md` and `interview/question-bank.md` first. Loop:

```
pick weakest coverage area → ask one round → record answers → re-score rubric →
pursue follow-ups spawned by answers → next area → … → all areas pass → playback → sign-off
```

- **Batched rounds by area.** Use the harness question tool, at most 4 questions per round, with
  concrete options from Phase 1 research. Ask open-ended areas (core workflows, look and feel) as
  plain conversation, since options would constrain the answer.
- **Only ask about gaps.** A well-researched user gets a short interview. A napkin sketch gets a
  long one.
- **Pursue follow-ups.** Every answer that introduces a new noun, role, or interaction spawns
  follow-ups until the area scores defined. ("Teams can share boards" leads to who invites, what
  happens on member removal, and whether there is an owner role.)
- **Surface contradictions immediately.** Check each answer against earlier ones and put
  conflicts back to the user.
- **Facts are not questions.** If running something or reading the code answers it, do that
  instead of asking (vrub-mode's prototype rule).
- **Escape valve.** "Use your judgment" is a valid answer. Make the call and log it in the
  Assumptions and Decisions log in product-definition.md. Deferral is allowed. Silent
  gap-filling is not.
- **Round caps.** Tier 1 about 2 rounds, Tier 2 about 4 to 5, Tier 3 about 6 to 8. Anything open
  at the cap becomes a logged assumption, not another round.
- **Exit** when every rubric area for the tier scores defined or explicitly deferred.

**Close the phase.**

1. Play back the full product definition as a structured summary and get sign-off.
2. Draft `constitution.md` (10 to 15 lines of non-negotiables, per `templates/constitution.md`)
   and get it approved. It is the root authority for validators.
3. Write `product-definition.md` with the signed-off summary, the per-area interview record, and
   the assumptions log.

## Phase 3. Targeted research

Research deeply, scoped by the real requirements. Run searches in parallel.

- **Stack (ADR-001).** If the user's instructions (their AGENTS.md or CLAUDE.md) or the interview
  name a preferred stack, verify its fit against the requirements (NFRs, integrations, platform
  reach, tenancy, compliance) instead of running an open-ended search. Where a layer genuinely
  doesn't fit, research alternatives for that layer only and get explicit user approval before
  deviating. With no preference, research the options and put the choice to the user. ADR-001
  names framework, hosting, data store, auth, and package manager, because the walking-skeleton
  PR scaffolds exactly that.
- **Buy versus build** per capability the interview surfaced (payments, email, observability),
  with current options fetched live. Never recommend from memory alone.
- **Domain deep-dives** on anything flagged (offline sync, multi-tenancy, compliance regimes).

Extend `working/research-notes.md`. Cite a source for every claim that drives a decision.

## Phase 4. Draft the spec

Use `templates/` for each artifact. Draft in dependency order, since each feeds the next:
**spec.md → architecture.md → security.md → ux.md**.

- Every statement traces to product-definition.md or research-notes.md. If you need something
  in neither, stop and ask the user or add a logged assumption.
- spec.md holds **no tech stack or implementation detail**. What and why only.
- Acceptance criteria use **EARS notation** (the templates explain the five patterns). "Fast" is
  a lint error. "p95 < 300ms" is a requirement.
- Diagrams are Mermaid in markdown (C4Context or C4Container, erDiagram, sequenceDiagram,
  flowchart).
- **Design system.** If `design/design.md` exists, ux.md §1 references it as the visual source of
  truth and builds the screen inventory from its components. Never invent competing visual
  tokens in the spec.
- When ADR-001 picks Next.js with Supabase, read `references/stack-nextjs-supabase.md` and draft
  architecture.md's API and data-access sections to match it.

## Phase 5. Validate the spec

Fan out the tier's validators in parallel as fresh-context subagents (vrub-mode's Subagents
section and `../vrub-mode/references/models.md` pick the model). Each prompt is its file in
`validators/`, plus absolute paths to the `docs/spec/` artifacts, constitution.md,
product-definition.md, and `design/design.md` if it exists. Validators are read-only and never
see this conversation. Each returns findings in this format:

```
[CRITICAL|HIGH|MEDIUM|LOW] artifact.md § section — issue — why it matters — suggested fix
```

1. **Merge.** Deduplicate, and resolve conflicts between validators against the constitution.
   Escalate genuine tensions (security versus simplicity) to the user.
2. **Repair** every CRITICAL and HIGH finding.
3. **Re-run only the affected validators.**
4. **Converge** when no CRITICAL or HIGH remains. At most 3 rounds (Tier 3 at least 2). Record
   MEDIUM and LOW without looping on them. Still failing after 3 rounds means a real ambiguity.
   Present the impasse to the user.
5. Write `validation-report.md` with rounds run, findings fixed, residual MEDIUM and LOW, and
   impasses.

## Phase 6. Plan

Write `docs/spec/plan.md` per `templates/plan.md`. It is a vrub-mode multi-phase plan, so it
follows `../vrub-mode/playbooks/multi-phase-plan.md` in full, including the `check-plan.mjs` run.
The first PR is always the walking skeleton, which also creates the project's `verify-*` control
skill. Then re-run validators against plan.md with the same merge, repair, and converge loop as
Phase 5. Tier 1 re-runs consistency and simplicity. Tier 2 and up re-run feasibility, consistency,
and security.

## Phase 7. Human gate and handoff

Present a final summary in chat:

- What is being built and for whom.
- The stack and key ADRs, one line each.
- The top 3 risks.
- Residual MEDIUM and LOW findings.
- **Every entry in the Assumptions and Decisions log**, so each "use your judgment" call gets a
  final veto.
- The PR ids in order, the execution playbook plan.md names, and the `check-plan.mjs` output.

The spec is done only when the user approves it. Building starts only on the user's explicit go,
under the execution playbook plan.md names. Leave the project so a fresh session needs only
`docs/spec/plan.md` and the files it points at, never this conversation.
