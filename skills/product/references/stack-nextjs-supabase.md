# API and server conventions for Next.js + Supabase

Use this file only when ADR-001 picks Next.js App Router with Supabase. Copy the rules that apply
into the project's AGENTS.md during the walking-skeleton PR, so every owner follows them without
reading this skill. These rules exist so every route and action in the codebase is shaped
identically. Consistency is the feature.

## Where logic lives

- **Server Components** for reads: query Supabase directly in the component (server-side
  client). No API route for data a page renders.
- **Server Actions** for app-internal mutations (forms, buttons). Route handlers
  (`app/api/*/route.ts`) only for genuine external surfaces: webhooks, third-party callbacks,
  or a documented public API from spec.md. Don't build a REST layer the spec never asked for.
- Shared business logic lives in `lib/`, imported by both — never duplicated between an action
  and a route.

## The boundary rules (every action and route)

1. **Validate input with zod at entry.** The schema is the contract; parse, don't trust.
   `schema.safeParse` → failure returns the standard error envelope, never a throw to the user.
2. **AuthN then authZ, server-side, first.** Get the user from the server Supabase client
   (`supabase.auth.getUser()` — not `getSession()` alone, and never a client-supplied ID).
   Authorization = RLS as the floor **plus** explicit ownership/role checks per security.md's
   permission matrix for anything RLS can't express. UI hiding is not authZ.
3. **Standard error envelope** everywhere:
   `{ error: { code: "not_found" | "unauthorized" | "invalid_input" | …, message } }` with the
   matching HTTP status. Messages are user-safe: no stack traces, no SQL, and 404 (not 403) when
   revealing existence is itself a leak — per security.md.
4. **Return typed results.** Actions return a discriminated union
   (`{ ok: true, data } | { ok: false, error }`) so the client narrows without try/catch.

## Supabase specifics

- **Clients**: browser client (anon key) for client components; server client bound to cookies
  for RSC/actions/routes. The `service_role` key is CI/admin-script territory only — it appears
  in **no** app code path, ever.
- **RLS on from the first migration.** Every table gets policies when created, not "later" —
  and each policy gets its denial test (the Verify, unit rule in `../templates/plan.md`).
- **Migrations are the only schema channel**: `supabase migration new …`, applied locally, then
  linked/pushed. Never mutate schema through the dashboard on a linked project.
- **Types are generated**, not hand-written: `supabase gen types typescript` into
  `lib/database.types.ts`; regenerate in the same commit as any migration.
- Query best practices: defer to `supabase-postgres-best-practices` (indexes, N+1, pagination).

## Cross-cutting

- Secrets in env vars, validated at boot with a zod env schema (`lib/env.ts`); a missing var
  fails the build, not a 3am request. `NEXT_PUBLIC_` prefix only for genuinely public values.
- Rate limiting on public/unauthenticated surfaces per security.md's abuse answers.
- Every mutation logs enough context to debug (who, what, entity id) — console structured
  logs are fine at MVP; the shape matters more than the sink.
