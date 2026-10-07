---
name: design-system
description: Build a token-based design system from design references (URLs, screenshots, existing design.md files). Use when the user wants to create a design system, extract design from inspiration sites, replicate a product's UI with high fidelity, set up design tokens, or establish a visual source of truth for a project. Triggers on "design system", "design tokens", "use this site as design inspiration", "make my app look consistent", "match this app's design". Step 1 of the `/product` pipeline.
---

Turn design references into a **token-based design system** that becomes the project's single
source of truth. The core thesis: inconsistent AI-built apps happen because design decisions live
as scattered raw values (hex codes, px radii) instead of named tokens. This skill produces three
synchronized artifacts, then refines them in a preview loop until the user approves.

**The three artifacts** (written to `design/` in the target project, or cwd if standalone):

1. `design/design.md` — the canonical spec. Token tables, typography scale, spacing/radius/shadow
   rules, motion guidelines, component recipes, state matrix, brand character. Written for future
   agents: any session that reads this file should be able to build on-system UI without this
   conversation's context.
2. `design/tokens.css` — Tailwind v4 `@theme` block. Because `@theme` values are CSS custom
   properties, this file is also directly consumable as plain CSS variables in non-Tailwind
   contexts. See `templates/tokens-css.md` for namespaces and structure.
3. `design/showcase.html` — a fully self-contained showcase page (tokens inlined, no external
   requests) rendering the palette, type scale, spacing/radius ramps, motion demos, and every
   component in the inventory in every state. This is the visual validation surface for the
   preview loop.

Plus `design/research-notes.md`: the merged measurement/analysis reports the drafts derive from.

**Consistency invariant**: `design.md` is canonical; `tokens.css` and `showcase.html` derive from
it. Every visual value in the showcase must reference a token — a raw hex or px value outside the
token definitions is a defect. Any change during refinement is applied to all three in the same
edit pass.

---

## Modes

Pick the mode in Phase 0 and say which one you are in. It changes how research, interview and
validation run.

| | **inspiration** (default) | **replicate** |
|---|---|---|
| Ask | "I like these sites, build me a system" | "match this product's UI with high precision" — one product URL (or screenshots of one product), often the user's own app, a vendor app they want parity with, or a redesign target |
| Research output | design intelligence report (values + judgement, ≤150 lines) | measurement report per `research/capture-protocol.md` (exact tokens, type clusters, geometry, state matrix, motion, both themes, ≤400 lines) |
| Values | may be normalised/rounded into a clean ramp | transcribed as measured; the source's ladder is the ramp even if it is odd (12.5px text, 5px radius) |
| Interview | taste + gaps | only brand overrides and scope; no taste questions |
| Validation | consistency + a11y | consistency + a11y + **fidelity** (each drafted value traceable to a measured value or a logged deviation) |
| Failure mode to avoid | screenshot literalism | silent "improvement" of the source (rounding 12.5→12, swapping the source's easing for a "nicer" one, dropping a state) |

Replicate is the right mode whenever the user says "high fidelity", "replicate", "match",
"pixel", "our app should look like X", or gives a logged-in product URL. Note the ethics line: the
mode reproduces a *design language* (tokens, recipes, motion) so a team can build consistent UI;
it does not copy assets, copy, logos or proprietary content.

---

## Phase 0 — Intake

**Existing system first.** If the project already has `design/design.md`, it is the source of
truth. A change request ("less rounded", "add a toast recipe") edits design.md, then tokens.css,
then showcase.html, per the consistency invariant, and re-runs the Phase 4 checks. Do not re-run
research or the interview unless the user asks for a new or rebuilt system.

The user arrives with some mix of: URLs to sites they admire or want to match, screenshot/image
paths, an existing design.md to use as a base layer, and prose about what they want. Do not ask
for references they already gave.

1. Choose the **mode** (above) and state it in one line.
2. Inventory the references. For each, note what the user said about *why* they like it (whole
   vibe vs. a specific element — "just the buttons", "the motion, not the colors"). Scope the
   research accordingly. In replicate mode, list the pages/surfaces to capture: the given page,
   the app shell, every overlay reachable from it, both themes.
3. Detect the target project: Tailwind version (v4 CSS-first vs v3 config), existing design files
   and token layers (`globals.css`, `tokens.css`, `docs/**/spec*.md`), component library
   (`src/components/ui`), framework, agent instruction file (`AGENTS.md` / `CLAUDE.md`). The tokens
   file must land in the project's idiom. Standalone: default to Tailwind v4 `@theme`.
4. If the user provided an existing design.md base (e.g. vercel.com/design.md), or the project has
   an earlier capture of the same product, read it now — it becomes the foundation the new
   research layers on top of. Never re-measure what a dated capture already records unless the
   user says it drifted.
5. Access: if the reference needs a login, confirm a credential path that never puts secrets in
   tool output (agent-browser auth vault, OS keychain). If none exists, ask once, up front.

## Phase 1 — Reference research (subagent fan-out)

Deep reference analysis is delegated so raw page dumps and screenshots never bloat the main
context. **Spawn one `general-purpose` agent per URL, in parallel**, each with the prompt
template in `research/reference-analyst.md` (URL variant for inspiration mode, **replicate
variant** for replicate mode) filled in with the URL, the user's stated interest, and the
scratchpad path for raw dumps. Each agent browses the live site with agent-browser — screenshots,
2–4 key subpages, computed styles, hover/motion observation, light+dark modes — and returns a
compact report (structured markdown, exact values not vibes).

In replicate mode the agent follows `research/capture-protocol.md` and uses the scripts in
`research/scripts/` (`tokens-and-text.js`, `measure.js`, `portals.js`, `probe-state.sh`). When the
main agent already holds an authenticated session or the capture is a single page, it may run the
protocol itself instead of delegating; the report shape is the same.

User-provided images: if ≤3, Read them directly in the main context and extract the same report
fields yourself. If more, batch them to a single subagent using the template's image variant. In
replicate mode from screenshots only, mark every colour as `~estimate`, mark motion and states as
"not observable", and tell the user which fidelity ceiling that imposes — offer to capture the live
product if a URL exists.

Reduce: merge the reports into `design/research-notes.md` — where references disagree (two sites,
two radius philosophies), record the conflict; it becomes an interview question, not a silent
choice. In replicate mode also add a **drift audit** section when the target project already has
tokens: token-by-token comparison (match / differs / missing / ours-only) in each theme, plus a
count of raw palette classes and hex literals in the codebase.

## Phase 2 — Targeted interview

Ask only what research did not resolve. Score the merged research against the coverage areas in
`interview/question-bank.md` (color, typography, motion, density, component inventory, dark mode,
brand character) — areas the references clearly pin down get a one-line playback for
confirmation, not a question. Genuine gaps and reference conflicts become **one round of the
harness question tool (≤4 questions)** with concrete options derived from the research ("family.co uses 24px
radii and springy motion; Vercel base uses 6px and near-none — which direction?"). Open-ended
taste questions ("what should someone remember about this UI?") go as plain conversation, not
options.

Replicate mode: the source answers taste. Ask only about (a) brand overrides the user wants to
keep (their accent colour, logo/loader), (b) which of the source's own defects to *not* replicate,
(c) scope (which components ship now). If the session is autonomous, log these as assumptions
and proceed.

Escape valve: "use your judgment" is always acceptable — log the decision in an Assumptions
section of design.md rather than asking again.

## Phase 3 — Draft

Draft in dependency order:

1. `design/design.md` from `templates/design-md.md` — synthesize research + interview into named
   decisions. Every token gets a value *and* a one-line rationale traceable to a reference or an
   interview answer. Replicate mode adds the template's measured sections: app shell, sizing
   ladder, state matrix, iconography, theme mapping, fidelity ledger.
2. `design/tokens.css` from `templates/tokens-css.md` — transcribe design.md into `@theme`.
   Transcription, not invention: any value here that isn't in design.md is a defect.
3. `design/showcase.html` per `templates/showcase.md` — render everything using only the tokens
   (inline the `@theme` block as `:root` variables so the file is self-contained). Replicate
   mode: also render the app-shell sample at measured dimensions and every control in every row
   of the state matrix.

## Phase 4 — Validate

Two layers, cheap one first:

**Mechanical checks** (run yourself):
- No raw color values in showcase.html outside the inlined token block:
  `grep -nE '#[0-9a-fA-F]{3,8}|rgb\(|hsl\(' design/showcase.html` — every hit must be inside the
  token definitions.
- Every `var(--…)` referenced in showcase.html is defined in tokens.css, and every token in
  tokens.css appears in design.md.
- Replicate mode: every measured value in research-notes.md that the spec claims to adopt appears
  verbatim in design.md (spot-check the sizing ladder, the type clusters, the motion table).

**Consistency validator** (fresh-context subagent): spawn a `general-purpose` agent with
`validators/consistency.md` plus the three artifacts and research-notes.md — never this
conversation. It is read-only and adversarial, returning severity-rated findings
(`[SEVERITY] file § section — issue — why — suggested fix`). It checks artifact sync, token
coverage (can a full app be built from these tokens alone?), WCAG contrast on every fg/bg pair,
and fidelity to the research reports (with tolerances in replicate mode).

Repair CRITICAL/HIGH findings across all three artifacts, re-run only the failed checks.
**Max 2 repair rounds** — anything still open goes to the user in the preview step rather than
looping.

## Phase 5 — Preview loop (where the sauce happens)

Show `showcase.html` on the richest surface the harness offers: an Artifact or HTML preview where
one exists, otherwise the file in a browser. Keep the same file path so the URL is stable across
iterations. Tell the user to critique
in plain language — "less rounded", "the accent feels AI-ish", "more bounce in the hover". In
replicate mode, put the source screenshots next to the showcase (in the scratchpad, not the
artifact, when they contain private data) and ask the user to call out any component that reads
differently from the product.

Each round: apply the change to **design.md first, then tokens.css, then showcase.html** →
re-run mechanical checks → republish → next critique. Expect to spend most of the session here;
that is by design. Do not gold-plate between rounds — change only what was asked.

Exit when the user approves. If the user goes idle mid-loop, leave the artifacts in their current
consistent state and summarize what's settled vs. still open.

## Phase 6 — Handoff

1. Final sync pass: confirm the three artifacts agree (re-run Phase 4 mechanical checks).
2. Wire into the project: import `design/tokens.css` in the app's root stylesheet if a project
   exists. If the project already declares the same tokens (a `globals.css` with `:root`/`.dark`
   blocks), do not create a second copy silently: either move those blocks into `tokens.css` and
   import it, or leave the app file as-is and record in design.md that it must be migrated —
   say which you did and why. A CSS move needs a browser check of the running app before it
   ships.
3. Add a short section to the project's agent instructions (`AGENTS.md` or `CLAUDE.md`, whichever
   the project uses; create `AGENTS.md` if neither exists):
   *"Design source of truth: `design/design.md`. All UI work must use tokens from
   `design/tokens.css` — never raw hex/px values. To change the design, change the tokens, not
   the component."*
4. Enforcement (offer, then do if accepted or if the user asked for enforcement up front): an
   ESLint rule restricting raw palette classes (`text-gray-500`, `bg-zinc-…`) and hex/hsl
   literals in TSX, allowlisting files with known drift until migrated; a CI check that runs the
   Phase 4 mechanical checks.
5. Close with a one-paragraph summary: the system's character, where the artifacts live, and the
   rule for future sessions.

---

## Failure modes to design against

- **Screenshot literalism** (inspiration mode): AI can't clone a site 1:1 from pixels and
  shouldn't try — the reference is a foundation to extract *decisions* from. If the user expects a
  clone from screenshots alone, reset that expectation in Phase 0 and offer live capture.
- **Estimated fidelity** (replicate mode): "~#1a1a1a", "about 13px", "feels like 150ms" are
  defects. If it was not measured, it is marked "not observed", not guessed.
- **Silent normalisation** (replicate mode): rounding the source's 12.5px to 12, 5px radius to
  4, or `cubic-bezier(0,0,.2,1)` to `ease-out`. The source's ladder is the ramp.
- **Token sprawl**: an LLM will happily emit 400 tokens. Cap the ramp sizes (see the tokens
  template); every token must be used by at least one showcase component or be deleted. In
  replicate mode the cap is the source's own set, pruned of tokens the source declares but never
  renders.
- **Silent drift**: never edit showcase.html cosmetically without updating design.md — the spec
  going stale is how the source of truth dies.
- **Interview bloat**: one round of ≤4 questions, then build. The preview loop is the real
  interview.
- **Copying the source's bugs**: a widget with literal light colours in dark mode, a link with no
  focus ring. Record them under Conflicts, fix them in the system, log the fix in the fidelity
  ledger.
