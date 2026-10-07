# design.md template

The canonical spec. Written for a future agent with zero context: it must be able to build
on-system UI from this file alone. Every token value carries a one-line rationale traceable to a
reference or interview answer — rationale is what stops future sessions from "improving" the
design back into slop.

Keep it under ~300 lines. If a section is growing past that, the token set is sprawling — prune.

```markdown
# {Project} Design System

> Source of truth for all UI. Use tokens from `design/tokens.css` — never raw hex/px values.
> To change the design, change the token here and in tokens.css, then verify in showcase.html.

## Character

{3–5 adjectives + one paragraph. What should someone remember about this UI? What is it NOT?
e.g. "Playful but tasteful — cartoon warmth with engineering precision. Not corporate, not
sterile, never cluttered."}

## Color

Light mode is default; dark mode swaps the semantic layer only (see Dark mode).

| Token | Value | Role / rationale |
|---|---|---|
| color-brand | … | Primary brand hue — from {reference} |
| color-brand-hover | … | … |
| color-surface / -raised / -sunken | … | Page, card, inset backgrounds |
| color-text / -muted / -faint | … | Three text emphasis levels only |
| color-border / -border-strong | … | … |
| color-success / -warning / -danger / -info | … | Semantic; each with -bg pair |

Rules: {e.g. "brand color appears once per view — buttons OR links, not both";
"never pure #000/#FFF"}. All fg/bg pairs must pass WCAG AA (4.5:1 body, 3:1 large).

## Typography

| Token | Value | Used for |
|---|---|---|
| font-display / font-body / font-mono | … | … |

Scale (fixed ramp — do not invent sizes):

| Step | Size / line-height / weight | Used for |
|---|---|---|
| display | … | Hero only |
| h1 … h3 | … | … |
| body / small / caption | … | … |

{Case/letter-spacing rules, e.g. "headings tight (-0.02em); no all-caps except badges".}

## Spacing

Base unit: {n}px. Ramp: spacing-1 … spacing-12 (values). Rules: {e.g. "section padding
spacing-10; card padding spacing-5; never off-ramp values"}.

## Shape & depth

| Token | Value | Applied to |
|---|---|---|
| radius-sm / -md / -lg / -full | … | inputs, buttons+cards, modals, pills |
| shadow-sm / -md / -lg | … | … |

Philosophy: {borders-first vs shadows-first, and why — this is the #1 consistency killer}.

## Motion

| Token | Value | Used for |
|---|---|---|
| ease-out-soft / ease-spring … | cubic-bezier(…) | … |
| duration-fast / -base / -slow | …ms | micro / standard / entrances |

Rules: {what animates (transform+opacity only?), what never animates, signature moves from
references, reduced-motion behavior}.

## Components

One subsection per component in the inventory (button variants, badge, input, card, dialog,
form, dropdown, tooltip, avatar, alert, nav, …). Each: 2–4 lines of anatomy expressed in
tokens — e.g. "Button primary: bg color-brand, text color-surface, radius-md, padding
spacing-2/spacing-4, text small/semibold, hover: color-brand-hover + translateY(-1px)
duration-fast ease-out-soft."

## Dark mode

Which tokens flip and to what. Semantic tokens (surface/text/border) swap; brand and semantic
hues {adjust how}. Anything that must NOT simply invert.

## Replicate-mode sections (required when the system replicates a measured product)

### App shell
The measured layout tree: sidebar/rail widths (expanded and collapsed), bar heights, gutters,
what each region's bg/border tokens are, and how the shell reflows at 768 / 390.

### Sizing ladder
Control heights and icon sizes the product actually uses (e.g. buttons 20/24/28/32, icons
9/10/12/14/15/16/24) as tokens; components pick from the ladder, never from ad-hoc heights.

### State matrix
Table: control | rest | hover | active/selected | focus-visible | disabled, expressed in tokens,
for every interactive control in the inventory. Both themes where values differ.

### Iconography
Icon families (viewBox, stroke width, caps), sizes per context, colour inheritance rule.

### Theme mapping
Table: token | light | dark, for every token that flips; a list of tokens that intentionally do
not flip.

### Fidelity ledger
Every place the system deviates from the measured source: | Source value | System value | Why |.
Includes source defects deliberately fixed, brand overrides, and declared-but-unrendered tokens
that were dropped. If this table is empty, say so explicitly.

## Assumptions & decisions log

Every place the user said "use your judgment", with the call made. | Decision | Chosen | Why |
```
