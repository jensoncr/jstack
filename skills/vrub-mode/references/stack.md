# Preferred stack

Read this when you start a new project or app, or choose a new framework, library, or service for one. In an existing project, follow the stack it already uses, and use this list only to choose between options it leaves open.

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Application logic | Effect v4: services, typed errors, Schema at boundaries, tracing with `Effect.fn` |
| Local tools and package manager | Bun. Deployed code runs on Cloudflare's runtime, so Bun only runs installs, scripts, and the deploy. |
| Tests | Vitest with `@effect/vitest` |
| UI | React |
| Styling | Tailwind |
| Database | PlanetScale Postgres, through Drizzle and `@effect/sql-pg` |
| Auth | Clerk |
| Hosting | Cloudflare Workers, reaching the database through Hyperdrive. Work that outgrows a Worker (long CPU time, large memory, native binaries, always-on processes) runs in Cloudflare Containers, or on Fly when it needs a plain long-running server. |
| Infrastructure as code | Alchemy v2, written as Effect. It is in beta, so pin its version. |

A layer that doesn't fit the requirements gets researched on its own. Say which layer you changed and why.
