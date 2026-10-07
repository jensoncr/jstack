# ux.md template

Every user story in spec.md must be reachable through a flow here, and every screen must
specify its non-happy states (empty, loading, error). "Should be accessible" is a lint error —
accessibility requirements are concrete and testable.

```markdown
# UX — <project>

*Status: Draft | Validated | Approved · Serves spec.md v<…>*

## 1. Design direction
<!-- If `design/design.md` exists (from /design-system), DO NOT restate it. Write one line
     pointing to it as the visual source of truth and note its character in a sentence; screens
     in §4 then reference its component inventory. Example:
       "Visual system: `design/design.md` (character: <its 3–5 adjectives>). All screens below
        use its components and tokens; this doc adds flows/states, not visual values."
     If NO design system exists, capture prose direction from the interview: density, tone, the
     comparable UIs the user named (liked AND hated, with why), brand constraints — and flag that
     a /design-system pass is recommended before build. -->

## 2. Navigation map
​```mermaid
flowchart TD
    Landing --> Auth --> Home
    Home --> <primary workflow screen>
​```

## 3. User flows
<!-- One flowchart per P0/P1 story, decision points included. Step count matters:
     the most frequent action (from interview §Core workflows) gets the shortest path. -->
### Flow: US-01 <title>
​```mermaid
flowchart TD
    A[entry point] --> B{decision}
    B -->|happy| C[done state]
    B -->|error| D[error state + recovery]
​```

## 4. Screen inventory
| Screen | Purpose | Key elements | Empty state | Loading | Error states |
|---|---|---|---|---|---|
| <Home> | <…> | <…> | <first-run: what the user sees + CTA> | <skeleton/spinner> | <offline, 403, 500> |

## 5. Interaction rules
<!-- Cross-cutting: optimistic vs confirmed updates, undo vs confirm-dialogs, keyboard
     shortcuts for the frequent action, mobile gestures if applicable, notification behavior. -->

## 6. Accessibility requirements
- All interactive elements shall be operable by keyboard alone.
- <floor from constitution, e.g. WCAG 2.2 AA>: contrast ≥ 4.5:1 body text, visible focus,
  labels on all inputs, announced async state changes.
- <any persona-driven needs from the interview>

## 7. Content & tone
<!-- Voice, error-message style, empty-state copy direction. -->
```
