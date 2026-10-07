# showcase.html requirements

The visual validation surface. One self-contained HTML file — the tokens from tokens.css inlined
as `:root` custom properties (transcribed, not re-invented), all CSS/JS inline, no external
requests except fonts (Google Fonts `<link>` for the real faces when they are free, always with a
system-stack fallback and a caption naming the faces; offline it must still render). It must
render identically as a local file and as a published Artifact.

Before writing it, load the `frontend-design` skill — the showcase itself must exemplify the
system's character, not display it in a sterile grid. A playful system gets a playful showcase.

## Required sections, in order

1. **Header** — system name, character statement, the source references it was built from.
2. **Color** — swatches grouped (brand / surfaces / text / borders / semantic), each labeled with
   token name AND value. Show fg/bg pairs as rendered text samples with their contrast ratio.
3. **Typography** — every step of the scale rendered at true size with token name, size/leading/
   weight annotation. Display font vs body font vs mono, each shown.
4. **Spacing & radius ramps** — visual bars/squares per step, labeled.
5. **Shadows/depth** — cards at each elevation.
6. **Motion** — live demos: a hover card, a button with its real hover transition, one signature
   animation, each labeled with duration + easing tokens. Wrap in
   `@media (prefers-reduced-motion: reduce)` guards.
7. **Components** — every component in design.md's inventory, each in all its variants and
   states (default / hover / active / disabled; filled / outline / ghost; error state for
   inputs). Buttons, badges, inputs + form row, card, dialog (rendered open, static), dropdown
   (rendered open), tooltip, alert set, avatar, nav bar sample.
8. **Dark mode** — a toggle (inline JS flipping a `.dark` class that swaps the overridden
   tokens) so both modes are validated in one file.
9. **In-context sample** — one small composed slice (a mini hero or dashboard card cluster) so
   the user judges the system working together, not just parts in isolation. Replicate mode:
   the app shell at measured dimensions (sidebar, top bar, toolbar, content, rail) with real nav
   items, one open overlay, and the state matrix rendered as a grid (one column per state, one
   row per control) so every measured state is visible without hovering.

## Hard rules

- **Every visual value is a `var(--…)` reference.** Raw hex/px in a component style is a defect
  the mechanical check will catch. If a component needs a value that has no token, that's a
  missing token — add it to design.md and tokens.css first.
- Label everything with its token name — the user critiques by pointing at names.
- Static states: hover/active/focus/disabled must also be shown as forced classes
  (`.is-hover`, `.is-focus`) so a screenshot shows them; the live pseudo-classes stay too.
- Responsive: the page must not scroll horizontally; wide component rows get their own
  `overflow-x: auto`.
- Keep the same file path across preview-loop iterations so the Artifact URL stays stable.
