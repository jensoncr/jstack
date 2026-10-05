# Domain docs

## Read

- `GLOSSARY.md` at the repo root holds the project's terms.
- `GLOSSARY-MAP.md` at the root means several contexts, one `GLOSSARY.md` each. Read the ones the request touches.
- `docs/adr/` holds decisions. Read the ones that touch the area in question.

If the repo keeps terms or decisions somewhere else, such as an RFC folder or `docs/decisions/`, use that instead.

When the user's term conflicts with the glossary, ask which is right in the next round. When the request contradicts an ADR, say so and ask whether to reopen it.

## Write the glossary

Write a term the moment it resolves, not at the end. Create `GLOSSARY.md` only when the first term resolves.

```md
# {Context name}

{One or two sentences on what this context is.}

## Language

**Order**:
A request from a Customer to buy one or more items.
_Avoid_: purchase, transaction
```

- One or two sentences per term. Say what it is, not what it does.
- Pick one word per concept. List the rejected synonyms under `_Avoid_`.
- Only terms specific to this project. No general programming concepts, no implementation details, no spec.

## Write an ADR

Write one only when all three hold:

1. Hard to reverse.
2. Surprising to a reader without context.
3. The result of a real trade-off between alternatives.

Most sessions produce none. Name it `docs/adr/NNNN-slug.md` with the next number. The body is a title and one to three sentences of context, decision, and why. Add the rejected options only when the rejection is non-obvious.
