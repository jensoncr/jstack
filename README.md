# jstack

i'm [vrubzy](https://x.com/Vrubzy). jstack is my fork of [pstack](https://github.com/cursor/plugins/tree/main/pstack), lauren tan's engineering-rigor plugin for cursor. much of the skills, playbooks, and principles are hers, but I've made some adaptions to be harness agnostic / fit my workflow. 


## install

cursor:

```bash
/add-plugin jstack
```

claude code, for local testing:

```bash
claude --plugin-dir ~/path/to/jstack
```

claude code, installed:

```bash
/plugin marketplace add jensoncr/jstack
/plugin install jstack
```

claude code leaves auto-update off for third-party marketplaces, so jstack stays on the version you installed. to turn it on, run `/plugin`, open the **marketplaces** tab, select `jstack`, and choose **enable auto-update**. to update once by hand, run `claude plugin marketplace update jstack && claude plugin update jstack@jstack`.

any harness that reads skills:

```bash
npx skills add jensoncr/jstack
```

claude code prefixes plugin commands and agents, so `/vrub-mode` is `/jstack:vrub-mode`.

## get started

two steps:

1. run [`/setup-jstack`](./skills/setup-jstack/SKILL.md) and choose which models you want.
2. use [`/vrub-mode`](./skills/vrub-mode/SKILL.md) whenever you're doing anything that requires rigor.

new here? the [jstack guide](./docs/guide/README.md) walks you through a first real task, from setup and prompting through verification and overnight runs. stuck, or unsure which skill fits? ask [`/vrub-help`](./skills/vrub-help/SKILL.md).

that's it. the other skills are situational; the mode skill uses them for you as needed. out of the box the mode splits work by tier: `strong` for judgment, prose, and all delegated code, `fast` for exploration and verification fan-out, `panel` for reviewers, `judge` for the independent grader. each harness maps tiers to the models it can spawn: on cursor that is opus 5.5 / sol / grok 4.7, on claude code it is opus for every tier, on codex it is gpt-6.1 sol at two reasoning levels. [`/setup-jstack`](./skills/setup-jstack/SKILL.md) changes any of it.

## usage

use [`/vrub-mode`](./skills/vrub-mode/SKILL.md) at the start of a task. it reads your request, picks from a set of playbooks, and runs the other skills as the steps need them.

on cursor, pick `/vrub-mode` from the `/` menu before you type your task, so cursor attaches the skill to the message.

for PR work, select [`babysit`](./skills/babysit/SKILL.md) to check status, fix CI, or address review feedback. select [`ship`](./skills/ship/SKILL.md) when you want a PR or stack merged. ship carries an authorized request through readiness and independent verification before merging, then removes the merged branches' worktrees. select [`pickup`](./skills/pickup/SKILL.md) to take over a prior session's branch. these are discoverable skills that share the existing playbooks; they do not require vrub-mode.

### just use [`/vrub-mode`](./skills/vrub-mode/SKILL.md)

this skill is the main shortcut. i use it whenever i need the agent to do rigorous engineering work. it comes with twenty-three playbooks:

```
/vrub-mode this pr has a subtle bug where the scroll drifts every 750ms even when idle. repro
first, then fix and verify.
```

```
/vrub-mode i'm going to bed. land the stack even if ci flakes. i want everything merged by
morning.
```

<details>
<summary>the twenty-three playbooks</summary>

| playbook | for |
|---|---|
| [investigation](./skills/vrub-mode/playbooks/investigation.md) | a read-only question. how does x work, why was y built this way, are we sure. |
| [bug fix](./skills/vrub-mode/playbooks/bug-fix.md) | reproduce a defect, root-cause it, and fix with runtime evidence. |
| [perf](./skills/vrub-mode/playbooks/perf-issue.md) | trace a measured slowness and improve it against a baseline. |
| [hillclimb](./skills/vrub-mode/playbooks/hillclimb.md) | sustained, scientific improvement of one metric against a target, looping hypotheses with before/after measurement and one commit per accepted win. |
| [runtime forensics](./skills/vrub-mode/playbooks/runtime-forensics.md) | diagnose a live symptom (leak, idle-cpu spin, glitch) from instrumentation. |
| [trace forensics](./skills/vrub-mode/playbooks/trace-forensics.md) | diagnose a captured profiling artifact (cpuprofile, trace, spindump, heap snapshot). |
| [feature](./skills/vrub-mode/playbooks/feature.md) | new or changed behavior, built from a named data shape. |
| [refactoring](./skills/vrub-mode/playbooks/refactoring.md) | a behavior-preserving change to structure or shape. |
| [prototype](./skills/vrub-mode/playbooks/prototype.md) | a throwaway sketch to make a design or behavioral decision cheaply, or to settle an empirical fork by observing it. |
| [visual parity](./skills/vrub-mode/playbooks/visual-parity.md) | pixel-exact ui equivalence between two implementations. |
| [authoring a skill](./skills/vrub-mode/playbooks/authoring-a-skill.md) | writing or editing a SKILL.md. |
| [eval](./skills/vrub-mode/playbooks/eval.md) | test how a skill or prompt change affects agent behavior, blinded. |
| [babysit](./skills/vrub-mode/playbooks/babysit.md) | drive a pr or a stack to merge-ready: conflicts, review threads, ci. |
| [shipping](./skills/vrub-mode/playbooks/shipping.md) | independently verify a green stack, then land the contiguous verified run bottom-up through github by default or origin when available. |
| [autonomous run](./skills/vrub-mode/playbooks/autonomous-run.md) | drive a long task to completion without stopping. |
| [orchestrate](./skills/vrub-mode/playbooks/orchestrate.md) | a standing project handed to one coordinator chat: multi-day, many stacked prs, fleets of subagents. |
| [autopilot-full](./skills/vrub-mode/playbooks/autopilot-full.md) | run independent prs to merged with one owner per pr and one root swarm verdict at the code-ready head. |
| [autopilot-stack](./skills/vrub-mode/playbooks/autopilot-stack.md) | autopilot-full without the merge. build and verify prs for the operator to review and land, stacking a pr only on a pr it builds on. |
| [session pickup](./skills/vrub-mode/playbooks/session-pickup.md) | resume or take over a prior agent's in-flight work. |
| [pause safely](./skills/vrub-mode/playbooks/pause-safely.md) | suspend in-flight work cleanly so it can be resumed later. |
| [multi-phase plan](./skills/vrub-mode/playbooks/multi-phase-plan.md) | work that spans phases or stacked PRs. |
| [worktree cleanup](./skills/vrub-mode/playbooks/worktree-cleanup.md) | reclaim disk by pruning merged or abandoned worktrees and stale ios simulators, safety-gated. |
| [opening a pr](./skills/vrub-mode/playbooks/opening-a-pr.md) | open a ready pr from small ordered commits with a conventional commits title and a briefing-style body. invoked at the end of every other playbook. |

</details>



when invoked it:

1. matches your task to a [playbook](./skills/vrub-mode/playbooks/) and opens a todo list whose first items are its steps, copied in verbatim.
2. routes to the other skills as the steps fire.
3. writes unslopped replies framed for the consumer and the maintainer.

the full rules and playbooks live in [`skills/vrub-mode/SKILL.md`](./skills/vrub-mode/SKILL.md).

on cursor, to keep [`/vrub-mode`](./skills/vrub-mode/SKILL.md) on across turns, pick it from the `/` menu and press option+enter (mac) or alt+enter (windows) instead of enter. that makes it a [custom mode](https://cursor.com/docs/skills#using-a-skill-as-a-custom-mode), which cursor offers in the agents window and the cli. it stays in context every turn until you exit the mode. plain enter attaches it to one message only. on claude code and codex, persistence and invocation syntax depend on the host, so select the skill for each new task instead of relying on cursor's mode metadata.

long-running work uses the host's available loop or scheduled continuation. the [harness guide](./skills/vrub-mode/references/harness/README.md) defines capability detection, saved watch state, and the foreground fallback when no scheduler exists. a skill file alone does not keep an agent running after its session ends.

## skills

[`/vrub-mode`](./skills/vrub-mode/SKILL.md) runs most of these for you when a step needs them (`how`, `why`, `architect`, `arena`, `swarm`, `interrogate`, `unslop`, `no-comments`, `technical-writing`, `tdd`, and the principles). the table below is for when you want one directly:

```
/how do we cancel runs? do we have an n+1 when we look up every run to cancel?
```

```
/interrogate review this pr.
```

<details>
<summary>all skills</summary>

| skill | use it when |
|---|---|
| [`/vrub-mode`](./skills/vrub-mode/SKILL.md) | default entry point for any non-trivial task. |
| [`/vrub-help`](./skills/vrub-help/SKILL.md) | you're new to jstack, or unsure which skill, playbook, or principle fits. finds out what you're trying to do, answers that part, and hands you a prompt to type. type `/vrub-help` with your question. |
| [`/in-your-own-words`](./skills/in-your-own-words/SKILL.md) | you want the agent to play back your goal and the problem before it starts. |
| [`/sharpen`](./skills/sharpen/SKILL.md) | you want a prompt made deeper, not bigger, before you send it: what a top professional would do that you didn't ask for, the raw material they'd start from, their methods and tools, and an outside check that the result is right. hands back the rewritten prompt and leaves your choices open. doesn't do the task. |
| [`babysit`](./skills/babysit/SKILL.md) | check a PR, fix CI, or address review feedback; stop at the requested readiness state. |
| [`ship`](./skills/ship/SKILL.md) | carry an authorized merge request through readiness, independent verification, and merge, then remove the merged worktrees. |
| [`pickup`](./skills/pickup/SKILL.md) | take over or resume a prior agent's in-flight work without redoing it. |
| [`/how`](./skills/how/SKILL.md) | you want a walkthrough of how a subsystem works. |
| [`/why`](./skills/why/SKILL.md) | you want to know why something was built this way. discovers available MCPs at run time and queries each evidence category in parallel (source control, issue tracker, long-form docs, real-time chat, infra observability, error tracking, analytics warehouse). |
| [`/recall`](./skills/recall/SKILL.md) | you're starting or resuming work and want your recent context on a topic rebuilt from your own chat history and the shared record, handed back as a tight current-state brief. |
| [`/ketchup`](./skills/ketchup/SKILL.md) | you want what changed in this chat since your last message, in plain words and small visuals, with every item waiting on you listed and decidable from the reply alone, even when that makes the reply long. |
| [`/ketchup-video`](./skills/ketchup-video/SKILL.md) | you want the `/ketchup` catch-up as a short subtitled video of slides, with the calls waiting on you as text under it. |
| [`/blast-radius`](./skills/blast-radius/SKILL.md) | you have a small-looking change and want to know what else it could break, with the one fact it's safe because of proven by running code, not asserted. |
| [`/grill-me`](./skills/grill-me/SKILL.md) | you want to be interviewed on a request or plan before any work starts. asks in rounds of numbered questions with a recommended answer each, looks up facts instead of asking you, and ends with an intent brief you confirm. adapted from [matt pocock's grilling skills](https://github.com/mattpocock/skills). |
| [`/product`](./skills/product/SKILL.md) | you're starting a new product. runs design-system when there's none, interviews you into a validated spec, and writes a vrub-mode plan the autopilot playbooks build. explicit invoke only. |
| [`/design-system`](./skills/design-system/SKILL.md) | you want a token-based design system from reference sites or screenshots, or to replicate a product's UI with high fidelity. writes `design/design.md`, `tokens.css`, and a showcase you refine in a preview loop. |
| [`/architect`](./skills/architect/SKILL.md) | you're about to write code that crosses a function boundary and want the caller's usage, types, and module shape settled first. |
| [`/arena`](./skills/arena/SKILL.md) | you want N parallel attempts at the same thing, then to grab the best parts of each. |
| [`/swarm`](./skills/swarm/SKILL.md) | you want N parallel workers across different slices or races, then one aggregated report. |
| [`/interrogate`](./skills/interrogate/SKILL.md) | you have a diff and want a panel of adversaries to try to break it, keeping only findings a run proves. |
| [`/automate-me`](./skills/automate-me/SKILL.md) | you want your own `-mode` skill, drafted from how you've actually worked. |
| [`/make-bot-ui`](./skills/make-bot-ui/SKILL.md) | you want a page or dashboard whose buttons wake a Grok Bot over a webhook, including the sender-key handoff and Tailscale. |
| [`/setup-jstack`](./skills/setup-jstack/SKILL.md) | you want to pick which models jstack uses per role. detects your harness and models and writes a config file. |
| [`/reflect`](./skills/reflect/SKILL.md) | a long task landed and you want the recipe captured as a skill edit. |
| [`/correct`](./skills/correct/SKILL.md) | you keep correcting agents for the same mistakes. mines history for mistake classes, fixes each at the highest level that works (architecture, then types, lint, and ci, then tests, with docs last), and keeps a table pairing each rule with what enforces it. |
| [`/teach`](./skills/teach/SKILL.md) | you want to actually understand a change or subsystem, not just have it summarized. runs how + why and weaves one plain explanation, built up diagram by diagram. |
| [`/tdd`](./skills/tdd/SKILL.md) | you're fixing a bug and there's a cheap local test path. write the failing test first, then the fix. |
| [`/codex-computer-use`](./skills/codex-computer-use/SKILL.md) | a task needs a desktop app on your mac (excel, finder, system settings) and no api or cli can do it. runs codex's native computer use, the one inside the chatgpt/codex app, one run at a time. |
| [`/benchmark-checklist`](./skills/benchmark-checklist/SKILL.md) | you ran a benchmark or measured a speedup or regression. vets the number (limiter, tuning, errors, repeat runs, end-to-end relevance) before you report or act on it. |
| [`/no-comments`](./skills/no-comments/SKILL.md) | strip comments before review; spawns `comment-sicko`, fixes accepted findings, offers encodings for claimed constraints. |
| [`/typescript-best-practices`](./skills/typescript-best-practices/SKILL.md) | you're reading or editing typescript. grounds the type-system-discipline principle in syntax. |
| [`/figure-it-out`](./skills/figure-it-out/SKILL.md) | no bundled playbook fits. designs a rigorous, auditable playbook for the task. |
| [`/show-me-your-work`](./skills/show-me-your-work/SKILL.md) | you want a reviewable decision trail. logs decisions to a tsv you can commit. |
| [`/create-verification-skill`](./skills/create-verification-skill/SKILL.md) | your project has no scripted way to prove app behavior. generates a project-local verify skill with a feature map, for any language or platform. |
| [`/maintain-verification-skill`](./skills/maintain-verification-skill/SKILL.md) | your verify skill's feature map has drifted from the app. source wave + one live pass, at most one PR of proven corrections. |
| [`/create-formal-verification-skill`](./skills/create-formal-verification-skill/SKILL.md) | tests can't reach the case that breaks a race, retry, state machine, parser, or unsafe code. verifies one property with the tool that fits and generates a project-local skill to recheck it on every change. |
| [`/maintain-formal-verification-skill`](./skills/maintain-formal-verification-skill/SKILL.md) | code your formal verification covers has changed since it was last checked. updates the model, harness, or properties to match the code, reruns, and says whether each failure is drift in the verification or a bug in the code. |
| [`/statechart`](./skills/statechart/SKILL.md) | someone who owns the behavior needs to see it, not read a spec. checks a tla+ model, draws what the user sees as a mermaid statechart, marks each state that breaks a rule, and gives the shortest path to each one. |
| [`/unslop`](./skills/unslop/SKILL.md) | you're cleaning up writing. removes AI tells. |
| [`/bro`](./skills/bro/SKILL.md) | you want the last message restated in plain human language, no jargon. |
| [`/technical-writing`](./skills/technical-writing/SKILL.md) | layered doc standard (Diátaxis + Google developer style + STE + Global English) for docs, RFCs, readmes, PR descriptions, commit messages. |

</details>



### examples

mostly i type [`/vrub-mode`](./skills/vrub-mode/SKILL.md) at the start of a task and let it route to a playbook. the other skills fire as the steps need them. a few i reach for directly.


<details>
<summary>all the examples</summary>

```
bug fix:           /vrub-mode this pr has a subtle bug where the scroll drifts every 750ms even
                   when idle. repro first, then fix and verify.
perf:              /vrub-mode a big list takes a second or two to load even though we virtualize.
                   run a cpu trace and tell me why.
feature:           /vrub-mode build a small feature behind a feature flag. verify it really works.
prototype:         /vrub-mode build two prototypes of the markdown renderer so we can compare.
                   spawn an agent for each.
multi-phase:       /vrub-mode open source these skills as a plugin. nothing internal leaks, work
                   in a temp dir, show me the dependency graph first.
overnight run:     /vrub-mode i'm going to bed. land the stack even if ci flakes. i want
                   everything merged by morning.
babysit:           /vrub-mode check on pr 123. anything outstanding?
visual parity:     /vrub-mode the row spacing is too tall when this flag is on. the second image
                   is correct. repro and fix until it matches.
figure it out:     /vrub-mode i'm stepping away. migrate every caller from the synchronous store
                   to the new async one, keeping behavior identical. i want to trust it was done
                   right when i'm back.
how:               /how do we cancel runs? do we have an n+1 when we look up every run to cancel?
why:               /why is this feature flag not on yet?
grill me:          /grill-me i want offline mode in the editor. grill me before you build anything.
architect:         design this instrumentation to be high signal with no false positives. /architect
                   this first.
arena:             /arena take my prompt to the arena verbatim. i want to compare their proposals
                   with yours.
swarm:             /swarm check every package under packages/ against its check.sh. one worker per
                   package. one report.
interrogate:       /interrogate review this pr.
tdd:               /tdd implement
unslop:            can we unslop and tighten the new changes?
reflect:           /reflect that took too long. capture what we learned so the next run doesn't
                   repeat it.
correct:           /correct
show-me-your-work: /show-me-your-work keep a decision trail i can review when i'm back.
automate-me:       /automate-me
help:              /vrub-help which skill should i use to review this branch?
```

</details>

## the `vrub-agent` and `comment-sicko` subagents

[`/vrub-mode`](./skills/vrub-mode/SKILL.md) runs in the chat that receives it. that chat owns the playbook, the todo list, and every subagent spawn.

jstack also ships the [`vrub-agent`](./agents/vrub-agent.md) named agent as the wrapper for delegates spawned during a run. it reads `vrub-mode` in full, including its inline principles index, before doing any work. substituting a general-purpose subagent skips that read and drifts. do not spawn `vrub-agent` to run the playbook itself.

[`/vrub-mode`](./skills/vrub-mode/SKILL.md) and the [`vrub-agent`](./agents/vrub-agent.md) named agent route through the same wrapper.

jstack also ships [`comment-sicko`](./agents/comment-sicko.md), a read-only comment reviewer available as the `comment-sicko` named agent. usually invoke it through [`/no-comments`](./skills/no-comments/SKILL.md), not directly.

## principles

twenty-four short skills, one principle each. `vrub-mode` indexes them inline and reads that index at task start. the standalone files are there so other skills can reference a principle by name, and so the index can point at the full rule for each.

<details>
<summary>all twenty-four principles</summary>

| principle | group | rule |
|---|---|---|
| [laziness-protocol](./skills/principle-laziness-protocol/SKILL.md) | core | Bias toward deletion and the smallest change that solves the problem. |
| [foundational-thinking](./skills/principle-foundational-thinking/SKILL.md) | core | Apply before writing logic: choosing core types and data structures, sequencing scaffold-vs-feature work, asking what concurrent actors share. Get the data structures right so downstream code becomes obvious. |
| [redesign-from-first-principles](./skills/principle-redesign-from-first-principles/SKILL.md) | core | Redesign as if the requirement had been a foundational assumption from day one, instead of bolting it on. |
| [attack-the-premise](./skills/principle-attack-the-premise/SKILL.md) | core | Apply when two or more fixes that share one premise have failed the same gate. Write the premise down and test it directly before you write another fix that assumes it. |
| [subtract-before-you-add](./skills/principle-subtract-before-you-add/SKILL.md) | core | Remove dead weight, redundant validators, and stub references first, then build on the simpler base. |
| [minimize-reader-load](./skills/principle-minimize-reader-load/SKILL.md) | core | Count layers between question and answer, and hidden state in the reader's head; collapse one-caller wrappers and shrink mutable scope. |
| [outcome-oriented-execution](./skills/principle-outcome-oriented-execution/SKILL.md) | core | Apply during planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture; don't preserve smooth intermediate states with throwaway compatibility code. |
| [experience-first](./skills/principle-experience-first/SKILL.md) | core | Choose user delight over implementation convenience; ship fewer polished features over more rough ones. |
| [exhaust-the-design-space](./skills/principle-exhaust-the-design-space/SKILL.md) | core | Build 2-3 competing prototypes and compare side by side before committing. |
| [build-the-lever](./skills/principle-build-the-lever/SKILL.md) | core | Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. Build the tool that does it or proves it (codemod, script, generator, or a skill your subagents follow) instead of working by hand. The tool is the artifact a reviewer can rerun. |
| [model-the-domain](./skills/principle-model-the-domain/SKILL.md) | architecture | Encode the domain in a structure instead of scattered conditionals. |
| [boundary-discipline](./skills/principle-boundary-discipline/SKILL.md) | architecture | Concentrate guards at system boundaries (CLI, config, network, external APIs); trust internal types and keep business logic in pure functions. |
| [type-system-discipline](./skills/principle-type-system-discipline/SKILL.md) | architecture | Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, exhaust variants, derive from authoritative schemas. |
| [make-operations-idempotent](./skills/principle-make-operations-idempotent/SKILL.md) | architecture | Converge to the same end state regardless of partial prior runs. |
| [migrate-callers-then-delete-legacy-apis](./skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | architecture | Migrate callers and delete the old API in the same wave instead of preserving compatibility layers. |
| [separate-before-serializing-shared-state](./skills/principle-separate-before-serializing-shared-state/SKILL.md) | architecture | Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant. |
| [prove-it-works](./skills/principle-prove-it-works/SKILL.md) | verification | Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'. |
| [fix-root-causes](./skills/principle-fix-root-causes/SKILL.md) | verification | Trace each symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate. |
| [sequence-verifiable-units](./skills/principle-sequence-verifiable-units/SKILL.md) | verification | Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer. |
| [test-behavior-not-implementation](./skills/principle-test-behavior-not-implementation/SKILL.md) | verification | Apply when you write, change, or keep a test. Assert what the code's users can observe, so the test fails when that behavior breaks and keeps passing when only the internals change. |
| [explain-the-number](./skills/principle-explain-the-number/SKILL.md) | verification | Apply before you trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result. Find what limits it, and rule out that it measured something other than the work you think. |
| [guard-the-context-window](./skills/principle-guard-the-context-window/SKILL.md) | delegation | Route bulk to subagents; keep summaries in the main thread, not raw payloads. |
| [never-block-on-the-human](./skills/principle-never-block-on-the-human/SKILL.md) | delegation | Proceed, present the result, let the human course-correct after the fact; reserve confirmation for irreversible actions. |
| [encode-lessons-in-structure](./skills/principle-encode-lessons-in-structure/SKILL.md) | meta | Encode the rule as a lint, metadata flag, runtime check, or script instead of more text. |

</details>

## make it yours

`vrub-mode` is my style. you may not want exactly that.

type [`/automate-me`](./skills/automate-me/SKILL.md). it mines your recent transcripts, drafts a `<your-name>-mode` skill from how you've actually worked, and routes through jstack underneath. you keep jstack as the base and end up with your own routing skill alongside `vrub-mode`.

models are configurable too. type [`/setup-jstack`](./skills/setup-jstack/SKILL.md). it detects your harness (cursor, claude code, or codex) and the models it can spawn, then writes a small always-loaded config mapping tiers to models and roles to tiers. every skill reads it and falls back to the harness defaults when a line is absent, so you override only what you want.

a rerun starts from your current config and drops lines for retired roles, such as `how critics`.

## license

MIT
