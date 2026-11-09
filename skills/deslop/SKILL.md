---
name: deslop
description: "Strip AI slop from the code a branch adds: defensive checks the path doesn't need, type escapes, needless nesting, leftovers, and code that doesn't match its neighbors. Use for /deslop, 'deslop it', or before a commit when a diff reads machine-written."
---

# Deslop

Clean the code this branch adds or changes, compared with its merge base with the base branch. Leave the rest of the file alone. Comments are the **no-comments** skill's job, which runs after this one, and prose is the **unslop** skill's.

## What to cut

- **Defensive code the path doesn't need.** A `try`/`catch`, null check, fallback, or retry around a trusted call, where the file's own code has none. A guard stays only when the state it handles is legitimate, per the **fix-root-causes** principle skill.
- **Type escapes.** A cast to `any`, `as unknown as`, a non-null assertion, or a `@ts-ignore` that only silences the checker. Fix the type instead, per the **type-system-discipline** principle skill.
- **Needless nesting.** Flatten nested branches with early returns.
- **Leftovers.** Dead code, unused variables and imports, debug logging, and wrappers that only pass their arguments through.
- **Code that doesn't match its neighbors.** Naming, error handling, logging, or a helper that the file or the codebase already does another way. Match the local style.

## Guardrails

- Keep behavior the same. Change it only to fix a clear bug, and say so.
- Prefer small edits to rewrites.
- Run the repo's checks for the touched paths after the edits.
- End with a summary of one to three sentences that says what you cut.

Adapted from the `deslop` skill in Cursor's `cursor-team-kit` (MIT).
