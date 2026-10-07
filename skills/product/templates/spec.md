# spec.md template (PRD)

The WHAT and WHY. Hard rule: **no tech stack, frameworks, APIs, schemas, or architecture
patterns in this file** — those live in architecture.md. Every statement must trace to
product-definition.md or research-notes.md.

## EARS notation for acceptance criteria (mandatory)

| Pattern | Template | Use for |
|---|---|---|
| Ubiquitous | The system shall `<response>` | always-true rules |
| Event-driven | WHEN `<trigger>`, the system shall `<response>` | user/system events |
| State-driven | WHILE `<state>`, the system shall `<response>` | modes and ongoing states |
| Unwanted behavior | IF `<condition>`, THEN the system shall `<response>` | errors, abuse, limits |
| Optional feature | WHERE `<feature enabled>`, the system shall `<response>` | tier-gated features |

One capability per statement. Every threshold is a number ("within 2s at 1k concurrent users"),
never an adjective ("quickly", "appropriate", "robust" are lint errors).

```markdown
# Product Specification — <project>

*Status: Draft | Validated | Approved · Traces to product-definition.md §…*

## 1. Overview
### Executive summary        <!-- one paragraph: what, for whom, expected impact -->
### Problem statement        <!-- the pain + evidence it's real, from interview/research -->
### Target users             <!-- personas from the interview; primary persona flagged -->
### Why now

## 2. Goals & success metrics
| Metric | Target | Type |
|---|---|---|
| <e.g. weekly active creators> | <number by when> | primary |
| <e.g. task-capture time> | <threshold> | guardrail |

## 3. User stories & requirements
<!-- Grouped by workflow. MoSCoW priority. Each story: -->
### US-01 <title> (P0)
As a <persona>, I want <capability>, so that <outcome>.
**Acceptance criteria** (EARS):
- WHEN <trigger>, the system shall <response>.
- IF <bad condition>, THEN the system shall <response>.
**Edge cases:** <empty/conflict/limit behavior for this story>

## 4. Non-functional requirements
<!-- Numbers only. Performance, availability, data durability, accessibility floor,
     browser/device floor, localization. Each in EARS form where possible. -->

## 5. Out of scope
<!-- The explicit non-goals list, verbatim from product-definition.md. As load-bearing as §3. -->

## 6. Launch & rollout
<!-- Phases, feature flags, rollback criteria, success criteria per phase. Tier 2+. -->

## 7. Risks & mitigations
| Risk | Likelihood | Impact | Mitigation |

## 8. Assumptions
<!-- Mirror of the Assumptions & Decisions log entries that affect requirements. -->
```
