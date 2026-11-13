# Preferred stack

Read this when you start a new project or app, or choose a new framework, library, or service for one. In an existing project, follow the stack it already uses, and use this list only to choose between options it leaves open.

| Layer | Choice |
|---|---|
| Language | TypeScript. Large data processing (document parsing, ML or numeric libraries, batch jobs) uses Python. |
| Application logic | Effect v4: services, typed errors, Schema at boundaries, tracing with `Effect.fn`. A new project's `AGENTS.md` tells agents to read `node_modules/effect/AGENTS.md` before writing Effect code. |
| Local tools and package manager | Bun. Deployed code runs on Cloudflare's runtime, so Bun only runs installs, scripts, and the deploy. |
| Tests | Vitest with `@effect/vitest` |
| Python data processing | Python 3.12 or later, with uv (lockfile committed), Pydantic at boundaries, psycopg 3, pytest. FastAPI when it serves requests. Ruff lints and formats; Pyright in strict mode type-checks. |
| UI | React |
| Styling | Tailwind |
| Database | PlanetScale Postgres, through Drizzle 1.0 rc (`drizzle-orm@rc`, `drizzle-kit@rc`) via `drizzle-orm/effect-postgres` on `@effect/sql-pg`. Drizzle's stable 0.x releases and `@effect/sql-drizzle` support only Effect v3. A new project follows `https://orm.drizzle.team/agent-setup/prompt.md` once to install Drizzle's bundled agent skill and MCP server. |
| Auth | Clerk |
| Hosting | Cloudflare Workers, reaching the database through Hyperdrive. Work that outgrows a Worker (long CPU time, large memory, native binaries, always-on processes) runs in Cloudflare Containers, or on Fly when it needs a plain long-running server. Python data jobs run on Modal: scheduled with `modal.Cron`, fanned out with `.map()`, secrets in Modal, CPU and memory sized per function. Modal also covers work that needs more than a Cloudflare container's 4 vCPU and 12 GiB, or a GPU. |
| Infrastructure as code | Alchemy v2, written as Effect. It is in beta, so pin its version. |

A layer that doesn't fit the requirements gets researched on its own. Say which layer you changed and why.
