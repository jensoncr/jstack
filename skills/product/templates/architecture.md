# architecture.md template

The HOW. Every component must serve a requirement in spec.md; every significant choice gets an
ADR with real alternatives. Diagrams are Mermaid — C4 levels 1–2 only (Context, Container);
component diagrams only for Tier 3.

```markdown
# Architecture — <project>

*Status: Draft | Validated | Approved · Serves spec.md v<…>*

## 1. System context (C4 level 1)
​```mermaid
C4Context
    title System Context — <project>
    Person(user, "<primary persona>", "<what they do>")
    System(app, "<project>", "<one-line purpose>")
    System_Ext(ext1, "<external system>", "<why it's needed>")
    Rel(user, app, "<uses for>")
    Rel(app, ext1, "<data + direction>")
​```

## 2. Containers (C4 level 2)
​```mermaid
C4Container
    title Containers — <project>
    Container(web, "<client>", "<runtime>", "<responsibility>")
    Container(api, "<backend>", "<runtime>", "<responsibility>")
    ContainerDb(db, "<store>", "<engine>", "<what it holds>")
​```
<!-- For each container: responsibility, why it exists (which NFR/story forces it),
     and its failure mode (what users experience when it's down). -->

## 3. Data model
​```mermaid
erDiagram
    USER ||--o{ THING : owns
​```
<!-- Every entity from product-definition.md §Data & entities. Lifecycle notes:
     delete behavior, retention, ownership transfer. -->

## 4. Critical flows (sequence diagrams)
<!-- 2–3 sequenceDiagram blocks for the highest-risk flows (auth, the core workflow,
     the trickiest integration). -->

## 5. Integration points
| System | Direction | Freshness | When it's down |

## 6. Architecture Decision Records
<!-- Numbered, never deleted. ADR-001 is always the stack decision. When the user's
     instructions or product-definition.md name a preferred stack, ADR-001 verifies that stack
     against this project's requirements instead of searching from scratch. Otherwise it records
     the stack chosen in the interview. The plan's walking-skeleton PR scaffolds exactly this. -->
### ADR-001: Tech stack
- **Status:** Accepted <date>
- **Decision:** <framework, hosting, data store, auth, package manager, each named explicitly>
- **Verified against:** <each NFR/integration/tenancy/compliance requirement checked, one line
  each, with any stress points noted>
- **Deviations:** <none | where the preferred stack doesn't fit, the alternative chosen for that
  layer, the research behind it (cited), and the user's explicit approval>
- **Consequences:** <positive AND negative — a consequences section with no negatives is
  a validator finding>

### ADR-002: <data store> · ADR-003: <auth approach> · ADR-004: <hosting> · …
```
