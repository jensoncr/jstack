# security.md template

Design-phase security: a data-flow diagram with trust boundaries, STRIDE applied per element
(not boilerplate — a STRIDE row that could appear in any project's threat model is a validator
finding), and mitigations promoted into EARS-form requirements.

```markdown
# Security — <project>

*Status: Draft | Validated | Approved · Serves spec.md v<…>, architecture.md v<…>*

## 1. Data flow diagram
​```mermaid
flowchart LR
    subgraph internet["Untrusted: Internet"]
        U[User browser]
    end
    subgraph app["Trust boundary: our infrastructure"]
        A[API]
        D[(Database)]
    end
    E[External service]
    U -->|credentials, user data| A
    A -->|queries| D
    A -->|<data>| E
​```
<!-- Mark every trust boundary. Every arrow gets a STRIDE pass below. -->

## 2. Data classification
| Data | Class | Storage rule | Retention | Deletion |
|---|---|---|---|---|
| <email> | PII | encrypted at rest | account lifetime | on account delete |

## 3. STRIDE analysis
<!-- One row per (element × applicable threat). Specific to THIS system. -->
| Element | Threat | Scenario | Mitigation | Requirement |
|---|---|---|---|---|
| API auth endpoint | Spoofing | <concrete attack> | <concrete control> | SR-01 |
| DB | Information disclosure | <…> | <…> | SR-02 |

## 4. Security requirements (EARS)
- SR-01: IF a request lacks a valid session token, THEN the API shall return 401 without
  disclosing whether the resource exists.
- SR-02: The system shall <…>.
<!-- Every mitigation in §3 lands here; these flow into plan.md PR sections like any requirement. -->

## 5. AuthN & AuthZ model
<!-- How identity is established (from ADR-003); the permission matrix: role × resource ×
     action, covering every role in product-definition.md. Server-side enforcement statement. -->

## 6. Secrets & keys
<!-- Where secrets live, rotation expectations, what never touches the client. -->

## 7. Accepted risks
| Risk | Why accepted at launch | Revisit trigger |
```
