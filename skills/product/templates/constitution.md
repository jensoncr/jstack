# Constitution template

10–15 lines of non-negotiable principles distilled from the interview. This is the root
authority: validators auto-escalate any conflict with a MUST line to CRITICAL. Keep it short —
every line must be checkable against an artifact. No tech stack names in here (that's ADR
territory); principles only.

```markdown
# Constitution — <project>

*Approved by <user> on <date>. Amendments require explicit user approval.*

## Product principles
- The product MUST <core value promise, e.g. "let a user capture a task in under 5 seconds">.
- <The primary persona>'s workflow MUST take priority when needs conflict.
- The product MUST NOT <top non-goal from the interview>.

## Quality bars
- Every P0 user story MUST have EARS-form acceptance criteria and a test approach.
- Performance: <the NFR numbers the user agreed to, e.g. p95 interactive < 300ms>.
- Accessibility: <agreed floor, e.g. WCAG 2.2 AA on all user-facing screens>.

## Security & data
- All user data MUST be <classification/handling rule, e.g. encrypted at rest and in transit>.
- <PII rule, e.g. "PII is limited to email + display name; nothing else is collected at launch">.
- AuthZ MUST be enforced server-side for every operation, never UI-only.

## Engineering posture
- Prefer boring, well-supported technology; new/unfamiliar tech requires an ADR.
- Buy over build for <commodity capabilities the user agreed to, e.g. auth, payments, email>.
- Scope: when in doubt, cut — additions after sign-off go through the assumptions log.
```
