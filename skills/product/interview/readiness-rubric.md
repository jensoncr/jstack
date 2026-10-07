# Definition-of-Ready Rubric

Score every coverage area **defined / partial / undefined** during Phase 0 intake, and re-score
after every interview round. The interview exits only when every area required for the tier is
*defined* or *explicitly-deferred-to-model* (logged in the Assumptions & Decisions log).

"Defined" means: a fresh reader could draft that section of the spec from the recorded answers
alone, without guessing. If drafting would require invention, the area is at best *partial*.

## Coverage areas

| # | Area | *Defined* means the record answers… | Tier 1 | Tier 2 | Tier 3 |
|---|------|--------------------------------------|:--:|:--:|:--:|
| 1 | Problem & users | Who exactly (segments/personas), what pain, how they solve it today, why now | ✓ | ✓ | ✓ |
| 2 | Core workflows | The 3–7 jobs users do, step by step, in the user's own words; the single most frequent action | ✓ | ✓ | ✓ |
| 3 | Data & entities | The nouns of the system, their relationships, and lifecycle — who creates/edits/deletes each, what happens on delete | ✓ | ✓ | ✓ |
| 4 | Roles & access | User types; what each can see and do; sharing/collaboration model; account vs workspace vs org structure | — | ✓ | ✓ |
| 5 | Edge cases & failure | Empty states, conflicts, limits/quotas, abuse vectors, what "wrong" looks like for the critical flows | ✓ | ✓ | ✓ |
| 6 | Integrations | External systems it must talk to; direction of data flow; what happens when each is down | — | ✓ | ✓ |
| 7 | Platform & reach | Web/mobile/desktop; offline needs; browser/device floor; localization | — | ✓ | ✓ |
| 8 | Business model | Free/paid boundary; pricing mechanics if any; what is gated; billing expectations | — | ✓ | ✓ |
| 9 | Look & feel | Density, tone, 2–3 comparable UIs the user likes/hates and why; brand constraints. **Auto-*defined* if `design/design.md` exists** — play its character back, don't re-interview | — | ✓ | ✓ |
| 10 | Non-goals | What it explicitly will NOT do — extracted from the user, not assumed | ✓ | ✓ | ✓ |
| 11 | Success & constraints | Measurable "it's working" definition; budget/team/deadline; compliance regimes | ✓ | ✓ | ✓ |
| 12 | Scale & tenancy (Tier 3) | Expected load, growth, tenancy model, isolation requirements, SLAs | — | — | ✓ |

✓ = must reach *defined* (or logged deferral) before the interview may exit.
— = ask only if the user's context raises it; otherwise a one-line assumption is acceptable.

## Scoring discipline

- Score from the **recorded evidence**, not your impression. If you can't quote or paraphrase
  the user's answer for an area, it is not *defined*.
- An answer that introduces new nouns, roles, or interactions downgrades the *other* areas it
  touches (e.g. "teams can share boards" re-opens Roles & access until sharing is pinned down).
- "Use your judgment" moves an area to *explicitly-deferred-to-model* — record your decision in
  the assumptions log at that moment, not later.
