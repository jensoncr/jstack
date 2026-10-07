# Capture protocol — replicate mode

How to measure a live product UI precisely enough to rebuild it. Used by the reference analyst
when the skill runs in **replicate** mode (see SKILL.md § Modes). Estimates are not acceptable in
this mode: every number in the report must come from a computed style, a bounding box, a stylesheet
rule or a mid-transition sample. The scripts in `scripts/` are the tools; they worked unmodified on
a Tailwind/shadcn app and need only their TARGETS edited for other stacks.

## 0. Session hygiene

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix ds)"
agent-browser --headed --restore open <url>      # headed + restore keeps logins across daemon restarts
agent-browser set viewport 1440 900               # measure at one canonical size first
```

- Never use the default shared session. Close yours (`agent-browser close`) when done.
- Login: prefer `agent-browser auth login <profile>` (vault). Two-step email→password forms time
  out the vault's password wait; then click Continue, `wait "input[type=password]"`, and
  `fill "input[type=password]" "$PW"` with the secret read from the OS keychain into a shell
  variable. **`fill … --stdin` is not a flag — it types the literal string `--stdin`.**
- Screenshots and DOM dumps of a logged-in product contain private data. Keep them in the
  scratchpad; commit only the derived report.

## 1. What to capture (checklist)

For the target page and 1–3 sibling pages that share the shell:

1. **Screenshot** viewport + `--full`, in both themes.
2. **Token dump** (`scripts/tokens-and-text.js`): every `--custom-property` declared in same-origin
   stylesheets with its value per selector (`:root`, `.dark`, `[data-theme]`…), the computed value on
   `html`, fonts actually loaded (`document.fonts`), keyframes, every declared `transition` /
   `animation`, scrollbar / `::selection` / `focus-visible` / reduced-motion rules.
3. **Text-style clusters** (same script): every visible text node grouped by
   family|size|weight|line-height|tracking|transform|colour with counts and samples. The top cluster
   is the product's "body"; the rest are the type scale. Do not invent a scale — transcribe this.
4. **Geometry** (`scripts/measure.js`): the layout tree of every box ≥100×40 (path, rect, bg,
   border, padding, gap, overflow, position) plus anatomy for nav items, inputs, buttons, cards,
   tables, tabs, badges, avatars, kbd and icons. Edit TARGETS to name the page's real components
   (e.g. `entityPicker: { sel: 'button[class*="bg-surface-2"]', children: true }`).
5. **State matrix** (`scripts/probe-state.sh` or ad-hoc `hover` + `eval`): rest / hover / active /
   selected / focus-visible / disabled for every interactive control class. Hover with a **CSS
   selector** or `find role button --name`; `find text` often hovers a same-named element elsewhere
   (a sidebar link instead of the toolbar chip). Read the computed style of the element *and its
   label/icon children* — the label may change colour while the icon does not.
6. **Overlays**: open every popover, menu, dialog, command palette and date picker. Dump with
   `scripts/portals.js` (portal roots at `body > *` plus Radix/ARIA roots). If a layer renders
   inside the app root (command palettes often do), locate it from its input and walk ancestors.
   Sample the enter animation mid-flight: `click`, `wait 100`, read `animation`, `opacity`,
   `transform`, then `wait 400` and read again. Record `data-state`/`data-side` attributes and the
   overlay's backdrop (`background-color`, `backdrop-filter`, `z-index`).
7. **Structural transitions**: sidebar collapse/expand (width, duration, what the rail shows),
   collapsible groups (does content animate height or unmount?), tab switches, accordion,
   drawer/sheet slide.
8. **Loading**: navigate to a slow route and screenshot immediately; identify spinner/skeleton
   elements and their keyframes. If nothing shows, say so.
9. **Theme**: find the theme control (usually in the user menu), switch, and repeat 1–6 for the
   second theme. Record which tokens flip and which components keep literal colours (those are
   the source's bugs; note them, do not copy them).
10. **Responsive**: `set viewport 768 900` and `390 844`; note what collapses, hides or reflows.
11. **Icons**: viewBox families, stroke width, caps/joins, rendered sizes per context, colour
    inheritance. If the library is identifiable (Lucide, Phosphor, Iconify set), name it.

## 2. Recording rules

- Report Tailwind classes **and** resolved pixels when the source is Tailwind: classes carry
  intent (`h-7`, `text-xs`, `rounded-[5px]`), pixels prove it.
- Distinguish **declared** tokens from **rendered** values. A `--selected-bg: .16` token that the
  nav never uses (it renders `foreground/[0.08]`) is recorded as a conflict; the rendered value wins.
- One row per control class in the state matrix; one row per motion primitive in the motion table.
- Type scale rows carry size / line-height / weight / tracking / case / colour role / usage.
- Geometry: sidebar width, top bar height, rail widths, gutters, control heights (the product's
  sizing ladder, e.g. 20 / 24 / 28 / 32 / 36 px), table row heights, cell padding.
- Anything you could not observe: write "not observed" with what you tried. Never fill gaps with
  typical values.

## 3. Report shape

Use the **replicate variant** of `reference-analyst.md`. Target ≤ 400 lines; put raw JSON in files
and cite paths. The report is the only thing the drafting phase reads, so if a value is not in the
report it will be invented downstream.

## 4. Pitfalls seen in practice

| Symptom | Cause | Fix |
|---|---|---|
| Password field shows 7 dots, login fails | `fill … --stdin` typed literally | pass the secret as the argument from a shell variable |
| Popover dump returns unrelated widgets | selector too broad (`[class*=fixed]`) | use `body > *` portals + `[data-radix-popper-content-wrapper]`, `[role=dialog|menu|listbox]` |
| `find text "X" hover` measures the wrong element | duplicate labels (sidebar vs toolbar) | hover by CSS selector or `find role … --name` |
| Click refused: "covered by div.fixed.inset-0" | an overlay/palette is still open | `press Escape`, then click the overlay element via `eval` if needed |
| Sidebar expand click hits a nav item | collapsed rail re-orders buttons | `document.elementFromPoint(x, y)` on the visible handle |
| Enter animation reads as `none` | sampled after it finished | sample at ~100ms after the trigger |
| Group collapse shows no transition | content unmounts | record "unmount, no height animation" |
| Theme toggle not on page | it lives in the user/account menu | open the avatar menu |
| Screenshot theme differs from expectation | app honours `prefers-color-scheme` | set theme explicitly via the app control, record `html.className` |
