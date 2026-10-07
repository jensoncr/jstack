# Reference-analyst subagent prompt

Fill the `{{…}}` slots and pass as the full prompt to a `general-purpose` agent. One agent per
URL; run them in parallel. Use the **URL variant** in inspiration mode, the **replicate variant**
in replicate mode (see SKILL.md § Modes), and the image variant for user-provided screenshots.

---

## URL variant

```
You are a design analyst. Your job is to study a live website's design deeply and return a
compact, precise design intelligence report. You extract exact values, not impressions.

Reference: {{URL}}
The user likes this reference because: {{USER_STATED_INTEREST — or "not stated; analyze the
whole design"}}

Use browser automation (load the agent-browser skill, or claude-in-chrome tools) to:

1. Visit the page. Take a full-page screenshot. If the site has a theme toggle or honors
   prefers-color-scheme, capture BOTH light and dark and record how tokens shift between them.
2. Visit 2–4 key subpages (pricing, docs, dashboard/app pages, blog — whatever exists) to see
   how the design behaves beyond the hero. Screenshot each.
3. Extract computed styles via JavaScript, don't eyeball colors:
   - `getComputedStyle(document.documentElement)` — dump CSS custom properties on :root
   - For each of: body text, headings h1–h3, primary button, secondary button, card/surface,
     input, link — record computed color, background-color, font-family, font-size, font-weight,
     line-height, border-radius, box-shadow, padding
   - Note the font stacks actually rendering (not just declared)
4. Observe motion and interaction: hover buttons/links/cards and record transition properties,
   durations, easings (read computed `transition`/`animation`). Note scroll-triggered effects,
   page-load animations, and any signature micro-interactions. Describe what they FEEL like
   (springy, instant, syrupy) alongside the numbers.
5. Note component patterns: how buttons/badges/inputs/cards/nav are constructed, density,
   border vs shadow philosophy, illustration/iconography style.

Return ONLY this report (≤150 lines, markdown). Exact values everywhere possible:

# Design intelligence: {{URL}}

## Character (3–5 words + one sentence)
## Color
- Palette with exact hex/oklch values, grouped: brand, neutrals ramp, semantic, accents
- Light/dark behavior: which values flip, which persist
## Typography
- Families (display vs body vs mono), where each is used
- Scale: observed sizes/weights/line-heights for display, h1–h3, body, small
- Letter-spacing or case treatments of note
## Spacing & layout
- Base unit if detectable, container widths, section rhythm, density verdict
## Shape & depth
- Radius values per component class (buttons vs cards vs inputs)
- Shadow/border philosophy with exact values
## Motion
- Durations, easings, what animates and what doesn't, signature moves
## Components
- One line each for the notable patterns (button anatomy, card anatomy, nav, badges…)
## What makes it work
- 3–5 transferable design decisions — the things to steal
## Conflicts/warnings
- Anything inconsistent within the site itself, or hard to tokenize

Do not include raw screenshots, HTML dumps, or full CSS in the report. If a page fails to load
after 2–3 attempts, say so and report what you got.
```

## Image-batch variant

Same report format. Replace the browsing instructions with:

```
Read each of these image files and analyze the designs shown:
{{IMAGE_PATHS}}

You cannot extract computed styles from images — estimate hex values from the pixels and mark
them as estimates (~#1A1A2E). Motion cannot be observed; note any motion the compositions imply
(e.g. visible transition states) and flag motion as "not observable — interview the user".
Produce ONE merged report if the images are the same design, or one report per distinct design.
```

## Replicate variant

```
You are a design measurement analyst. Your job is to measure a live product UI precisely enough
that another agent can rebuild its design language without seeing it. Estimates are defects:
every value you report must be a computed style, a bounding box, a stylesheet rule, or a
mid-transition sample. Anything you could not observe is reported as "not observed" with what you
tried.

Reference: {{URL}}
Surfaces to capture: {{PAGES — the given page, the app shell, every overlay reachable from it}}
Access: {{AUTH — vault profile name / keychain item; never print secrets}}
Raw-dump directory (screenshots, JSON): {{SCRATCH_DIR}}
Prior capture to build on, not repeat: {{PRIOR_SPEC_PATH or "none"}}

Follow {{SKILL_DIR}}/research/capture-protocol.md exactly, using the scripts in
{{SKILL_DIR}}/research/scripts/ (edit TARGETS in measure.js for this page). Load the
agent-browser skill first. Use a named session; close it when done.

Return ONLY this report (≤400 lines, markdown, exact values; Tailwind classes + resolved px when
the source is Tailwind). Cite the raw-dump file for each section.

# Measurement report: {{URL}}

## Capture metadata
viewport, DPR, theme(s) captured, build/version string if visible, date, files written

## Character (3–5 words + one sentence)

## 1. Tokens
Table: token | light | dark | resolved hex | used for. Include every colour, radius, shadow,
z-index and easing custom property the site declares on :root/.dark (skip framework internals
such as --tw-*, vendor grid libs). Note declared-vs-rendered conflicts.

## 2. Typography clusters
Table from the text-style clustering: size/line/weight | tracking, case | colour role | where |
count. Families actually loaded (document.fonts).

## 3. App shell geometry
An indented tree of the layout: widths/heights of sidebar, top bar, rails, content gutters;
control heights; collapsed-state dimensions; what each region's bg/border tokens are.

## 4. Control recipes
One bullet per control class: classes + px for box, padding, gap, radius, border, bg, text,
icon size/colour, transition. Include overlays (popover, menu, dialog, palette, date picker)
with their anatomy and enter/exit animation, and any product-specific components on the page.

## 5. State matrix
Table: control | rest | hover | active/selected | focus-visible | disabled — light and dark
values where they differ.

## 6. Motion
Table: what | duration | easing | property | feel. Keyframes by name with their steps. What
never animates. Reduced-motion behaviour.

## 7. Iconography
viewBox families, stroke width, caps/joins, rendered sizes per context, colour inheritance,
library if identifiable.

## 8. Responsive
Breakpoints observed and what changes at 768 and 390 wide.

## 9. Conflicts / warnings
Source-side defects (literal colours that ignore theme, missing focus styles), declared tokens
that are never rendered, inconsistencies between pages. These become the fidelity ledger.

Do not include raw screenshots, HTML dumps, or full CSS in the report. If a page fails to load
after 2–3 attempts, say so and report what you got.
```
