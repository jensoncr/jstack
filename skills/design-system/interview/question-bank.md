# Interview question bank

Coverage areas to score after research merges. Each area is *defined / partially / undefined*
against the merged reports + anything the user already said. Ask only about undefined areas and
reference conflicts; play back defined areas as one-liners for confirmation. **One
question-tool round, ≤4 questions** — pick the four highest-stakes gaps. The preview loop
handles the rest.

Derive options from the research, never generic ("family.co is 24px-radius springy; your Vercel
base is 6px near-static — which way?" beats "how rounded do you want things?").

| Area | Pin down | Ask when |
|---|---|---|
| **Character** | 3–5 words the UI should evoke; what it must NOT feel like | References span personalities, or user gave none. Ask conversationally, not as options. |
| **Color direction** | Adopt reference palette vs recolor its structure with user's brand; light or dark default | User has an existing brand color, or references clash |
| **Dark mode** | Both modes day one, or single mode + token discipline for later | Almost always undefined — cheap, high-stakes question |
| **Motion intensity** | None / subtle (fades, 150ms) / expressive (springs, signature moves); what never animates | Image-only references (motion unobservable) or conflicting reference motion |
| **Density** | Airy-marketing vs compact-dashboard; will one system serve both surfaces? | Building an app but references are landing pages — the classic Pluto trap: hero inspo says nothing about the dashboard |
| **Radius/depth philosophy** | Rounded-soft vs sharp; borders-first vs shadows-first | References conflict — the #1 consistency killer, never pick silently |
| **Component inventory** | Which components beyond the core set (dialog, form, dropdown, tooltip, alert, avatar, nav, table, tabs, toast…) the project needs now | Project type unclear. Multi-select. |
| **Typeface reality** | Reference uses a paid/custom face — license it, or pick the closest free stand-in? | Research flags a non-free font |

Replicate mode: the source answers every area above. Ask at most: (1) which brand elements to
keep over the source's (accent colour, logo, loader), (2) which source defects to fix rather than
copy, (3) component scope for this pass. Nothing else. Autonomous session → log all three as
assumptions and proceed.

Rules of engagement:
- Never re-ask what a reference clearly answers or the user already stated in Phase 0.
- Reference conflicts are always surfaced, never silently resolved.
- "Use your judgment" → make the call, log it in design.md's Assumptions & decisions log, move on.
- Answers that reveal new gaps get folded into the preview loop, not a second question round.
