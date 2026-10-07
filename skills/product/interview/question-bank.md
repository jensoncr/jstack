# Interview Question Bank

Templates per coverage area. Adapt wording to the domain and inject Phase-1 research into the
options ("Competitor X does A, Competitor Y does B — which is closer?"). Rules of engagement:

- ≤4 questions per question-tool round, grouped by area.
- Open-ended areas (2 Core workflows, 9 Look & feel) are asked conversationally, not as
  multiple choice — options would constrain the answer.
- Every answer that introduces a new noun, role, or interaction spawns follow-ups (patterns
  below) until the area scores *defined* on the rubric.
- Play back *defined* areas in one line for confirmation instead of asking.

## 1 Problem & users
- Who feels this pain most acutely — describe the person, not the market.
- How do they solve it today (tool, spreadsheet, nothing)? What breaks about that?
- Why does this need to exist *now*?
- If two user types were mentioned: which one do we disappoint when their needs conflict?

## 2 Core workflows (conversational)
- "Walk me through the main thing a user does, step by step, from opening the app to done."
- What's the single most frequent action? (This gets the best UX budget.)
- What does a user do in their first 5 minutes? First session ends with what accomplished?
- Follow-up pattern: for each step — what does the user see, what can go wrong, what's next?

## 3 Data & entities
- For each noun the user has mentioned: who creates it, who can edit it, can it be deleted, and
  what happens to things attached to it when it is?
- What must never be lost? What's disposable?
- Do any of these things belong to a person vs a team vs the whole account?
- Import/export expectations — does data arrive from or leave to somewhere?

## 4 Roles & access
- List the user types. For each: what can they see, what can they change?
- Sharing model: private by default? invite by email/link? public option?
- Who administers — is there an owner role, and can ownership transfer?
- Follow-up pattern: "X can share Y" → who can they share with, what permission levels exist,
  what happens when access is revoked mid-use?

## 5 Edge cases & failure
- What happens on day one when everything is empty?
- Two people change the same thing at once — who wins?
- Limits: is there a size/count/rate at which we say no? What happens at the limit?
- How could someone abuse this, and do we care at launch?

## 6 Integrations
- What existing systems must this read from or write to?
- For each: which direction does data flow, how fresh must it be, and what does the app do when
  that system is down?
- Auth expectations: standalone accounts, SSO, social login, or inherit from an existing system?

## 7 Platform & reach
- Where is this used — desk, phone on the go, both? Native app expectations or is web enough?
- Does any part need to work offline?
- Browser/device floor; localization now, later, or never?

## 8 Business model
- Is anything paid at launch? Where is the free/paid line?
- Pricing mechanics if known (per seat, usage, flat) — or explicitly deferred?
- What must be gated to make upgrading worth it?

## 9 Look & feel (conversational)
- **Skip this area if `design/design.md` exists** — the design system already answers it. Play
  back its character in one line ("Your design system reads as <adjectives> — carrying that
  through") and move on. Only ask below if there's no design system.
- "Name 2–3 products whose UI you'd be happy to be compared to — and one you'd hate."
- Dense-and-powerful or spacious-and-simple? Playful or businesslike?
- Any brand constraints (colors, fonts, logo, existing site to match)?

## 10 Non-goals
- "What will this deliberately NOT do — even if users ask?"
- Of everything discussed, what could ship six months later without hurting launch?
- Follow-up: propose 2–3 candidate non-goals from the research and have the user confirm/reject.

## 11 Success & constraints
- Ninety days after launch, what number or observable fact tells you it's working?
- Deadline or external event this must hit? Budget ceiling for services/infra?
- Who's building it (solo, team, agencies) and what stack are they already good at?
- Compliance obligations (GDPR, HIPAA, SOC2, app-store rules) — known or "find out for me"?

## 12 Scale & tenancy (Tier 3 only)
- Expected users/tenants at launch and at 12 months; peak vs average load shape.
- Tenancy isolation: shared tables, schema-per-tenant, or hard isolation? Regulatory driver?
- SLA expectations; disaster-recovery tolerance (RPO/RTO).

## Follow-up patterns (apply everywhere)
- **New noun** → run area 3 questions on it.
- **New role** → run area 4 questions on it.
- **"Sharing/collaboration"** → invite mechanics, permission levels, revocation, conflicts.
- **"Notifications"** → which events, which channels, user control, digest vs realtime.
- **"Search"** → over what, how fresh, fuzzy or exact, who's allowed to find what.
- **Contradiction with an earlier answer** → quote both, ask the user to pick. Never resolve
  silently.
