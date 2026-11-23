---
name: research
description: "Answer a question from the web with cited sources, routing each kind of question to Exa or Parallel through the Executor MCP. Use for /research, and whenever a skill or task says to search the web, look up a current fact, or find prior art."
---

# Research

Name the decision each question would change before you search. A question that changes no decision is not asked.

## Route by question

| Question | Tool | Executor path |
|---|---|---|
| One fact or definition | Exa answer | `tools.exa.custom.answer` |
| Find docs, repos, posts, or prior art | Exa search | `tools.exa.custom.search` |
| Read one page or PDF in full | Parallel extract | `tools.parallel.extract.v1ExtractPost` |
| Several parts that need synthesis | Parallel Task, processor `pro` | `tools.parallel.tasks.runsPostV1TasksRunsPost` |

Read each tool's input with the Executor `describe` tool before its first call. Never guess argument names. Every call takes the `accountId` from that signature, with the tool's own arguments under `input`, and Parallel's under `input.body`.

- **Exa search.** Ask for `contents: { highlights: true }`, not full text. Ten searches at once draw 429s, so run five or fewer.
- **Parallel extract.** Pass an `objective`. Full text goes under `advanced_settings.full_content`.
- **Parallel Task.** Start it first, then keep working. It takes one to fifteen minutes. Say in `task_spec.output_schema`, as plain text, what the report must hold: primary sources, a URL for every claim, and measured evidence kept apart from opinion. Collect it with `tools.parallel.tasks.runsResultGetV1TasksRunsRunIdResultGet` and a `query.timeout` of 40 seconds or less, because the MCP client cuts longer calls. A timeout, or an error that names HTTP 408, means the run is still going, so call again. When you need the answer before it finishes, answer from the other tools and say the Task was unfinished.

When the Executor tools are missing, use the harness's web search and say so in the reply.

## Check before you rely on it

Read the primary source for any claim a decision rests on. A Task report or an Exa answer is a lead, not the source. When the primary source is paywalled, name the best free copy and say it is not the original.

**Reply:** the claims, each with its URL and its date, or "undated". Say which sources you read and which you know only through a summary. Say what you could not find or verify.
