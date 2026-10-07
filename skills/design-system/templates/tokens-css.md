# tokens.css template — Tailwind v4 `@theme`

Pure transcription of design.md into Tailwind v4's CSS-first theme. Any value here that is not
in design.md is a defect. Because `@theme` compiles to CSS custom properties on `:root`, this
file is also directly usable as plain CSS variables in non-Tailwind projects — import it and use
`var(--color-brand)`.

Use Tailwind's **namespaces** so utilities are auto-generated (`--color-*` → `bg-brand`,
`text-brand`; `--radius-*` → `rounded-md`; `--ease-*`, `--animate-*`, `--font-*`, `--text-*`,
`--shadow-*`, `--spacing`):

```css
@import "tailwindcss";

@theme {
  /* Color — semantic names, not hue names. ~20 tokens max. */
  --color-brand: …;
  --color-brand-hover: …;
  --color-surface: …;
  --color-surface-raised: …;
  --color-surface-sunken: …;
  --color-text: …;
  --color-text-muted: …;
  --color-text-faint: …;
  --color-border: …;
  --color-border-strong: …;
  --color-success: …;  --color-success-bg: …;
  --color-warning: …;  --color-warning-bg: …;
  --color-danger: …;   --color-danger-bg: …;
  --color-info: …;     --color-info-bg: …;

  /* Typography */
  --font-display: …;
  --font-body: …;
  --font-mono: …;
  --text-display: …;  --text-display--line-height: …;  --text-display--font-weight: …;
  /* …h1–h3, body, small, caption via --text-* with sub-properties */

  /* Spacing: prefer Tailwind's multiplier (one token) over a bespoke ramp */
  --spacing: {base}px;

  /* Shape & depth */
  --radius-sm: …;  --radius-md: …;  --radius-lg: …;  --radius-full: 9999px;
  --shadow-sm: …;  --shadow-md: …;  --shadow-lg: …;

  /* Motion */
  --ease-out-soft: cubic-bezier(…);
  --ease-spring: cubic-bezier(…);
  --duration-fast: …ms;  --duration-base: …ms;  --duration-slow: …ms;
  /* Named keyframes for signature moves: */
  --animate-{name}: {name} var(--duration-base) var(--ease-spring);
}

/* Keyframes for --animate-* tokens live outside @theme */
@keyframes {name} { … }

/* Dark mode: override only the tokens design.md says flip */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: …;
    /* … */
  }
}
/* If the project uses a class strategy, use `.dark { … }` instead — match the project. */
```

Rules:
- **Semantic over literal**: `--color-brand`, never `--color-blue-500`. Renaming a hue shouldn't
  rename a token.
- **Cap the set**: ~20 colors, 7 type steps, 4 radii, 3 shadows, 3 durations, 2–3 easings. Every
  token must be exercised by at least one showcase component, or delete it.
- **Replicate mode**: the cap is the source's own rendered set. Expect surfaces 0–3, four text
  levels, two borders, three overlay alphas, semantic hue + bg pairs, sidebar tokens, chart
  tokens, a control-height ladder (`--size-control-xs…lg`), a radius ladder that may include odd
  steps (`3px`, `5px`, `7px`, `10px`), a z-index scale, and the source's easings verbatim. Prune
  tokens the source declares but never renders (list them in design.md's fidelity ledger). If the
  project already consumes shadcn-style names (`--background`, `--card`…), keep those names so
  existing components keep working, and add the semantic aliases beside them.
- **Theme strategy**: match the project (`.dark` class vs `prefers-color-scheme`); in a project
  with a theme switcher, class strategy is mandatory.
- **Tailwind v3 project detected?** Emit a `tailwind.config` `theme.extend` mirror of the same
  values instead of `@theme`, plus a plain `:root` CSS variables file — same names, same values.
- Durations/easings as tokens mean motion stays consistent app-wide — the same reason color
  tokens exist. Don't leave motion as raw values in components.
