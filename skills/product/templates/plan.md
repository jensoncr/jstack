# plan.md template

`docs/spec/plan.md` is a vrub-mode multi-phase plan. Copy the skeleton from
`../../vrub-mode/playbooks/multi-phase-plan.md` and keep every heading, sub-block, and rule it
names, so `check-plan.mjs` passes. This file says only what a product plan adds on top. A fresh
owner with no access to the spec conversation must be able to execute any PR section from the
plan plus the files it points at.

## Execution playbook

Name `playbooks/autopilot-stack.md` in **How to read this** unless the user granted merge
authority for independent PRs, in which case name `playbooks/autopilot-full.md`. A product the
user steps away from for days takes `playbooks/orchestrate.md`.

## PR order

1. **Walking skeleton (first PR, always).** The thinnest deployed end-to-end slice. One screen,
   one server call, one database row, deployed. It scaffolds exactly the stack ADR-001 names,
   with the package manager ADR-001 names. It wires CI (lint, typecheck, tests, build) on every
   push. It imports `design/tokens.css` in the root stylesheet when a design system exists. It
   runs `../../create-verification-skill/SKILL.md` so the project gains the `verify-*` control
   skill every later live lane drives. It applies the auth approach from ADR-001 to one
   protected page. Integration risk surfaces here, not later.
2. **Core workflow next.** A user gets value from the first two PRs alone.
3. **One PR per story slice after that,** dependency-ordered. A PR is one change with its own
   evidence. No epics ("build the backend"), no confetti (twenty PRs that are one change).

## Verify boxes for a product PR

- **Verify, unit.** Encode cheap, focused checks before the code they cover, per
  `../../tdd/SKILL.md`. Name each test after the EARS criterion it proves. Pure logic gets unit
  tests. Every database access policy gets its allowed case and its cross-tenant denial case, in
  the same PR as the policy. Do not add tests after the code to cover it, and do not write unit
  tests that only exercise mocks (`../../principle-test-behavior-not-implementation/SKILL.md`).
- **Verify, live.** The ten lanes walk ux.md's flows for the stories this PR delivers through the
  project's `verify-*` skill: happy path, each error and empty branch, and security.md's
  unauthorized and revoked paths (request another user's resource and assert the response, not
  just the missing UI). One lane runs the design-conformance check: no raw color literals or
  arbitrary values outside the token layer in the files this PR touched. When a journey should
  stay fixed, the PR also adds a re-runnable journey script and records its output, per
  `../../principle-prove-it-works/SKILL.md`.
- **Verify, perf.** Use the NFR budgets from spec.md. Where the spec is silent, default to
  LCP < 2.5 s, CLS < 0.1, and INP < 200 ms on the core-workflow pages.

## Appendices a product plan adds

- **Appendix C. Risks** also records external accounts and API keys each PR needs and when,
  decisions deferred to build time (each references an assumptions-log entry in
  product-definition.md), and estimate honesty. State the rough effort per PR against the
  deadline in product-definition.md. If they don't fit, say so.
- **Appendix E. Traceability matrix.** Every P0 and P1 story has a full row. An empty cell is a
  validator finding.

  | Story | Priority | Architecture components | Security reqs | PR ids |
  |---|---|---|---|---|
  | US-01 | P0 | api, web, db | SR-01 | PR-2, PR-3 |

## Spec drift

When building reveals the spec is wrong, not just incomplete, the owner stops and surfaces it.
On the user's approval, the same PR updates the spec artifact and the code, so they never drift
apart silently.
