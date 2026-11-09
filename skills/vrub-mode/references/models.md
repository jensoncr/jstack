# Model resolution

Every jstack delegation names a **role** and its **tier**. Read [the harness guide](harness/README.md) before resolving a role. Roles and tiers are shared across hosts; the config maps them to supported model tokens. The current spawn schema controls how an override is passed.

## Tiers

| Tier | Intent | Shape |
|---|---|---|
| `strong` | Judgment, prose, vague intent, hard code, and precisely specified steps that must be followed to the letter. | one model |
| `fast` | Mechanical edits, exploration, verification lanes, any cheap fan-out. | one model |
| `panel` | Independent reviewers or runners. One subagent per entry, so the list length sets the count. Repeats are allowed. | list |
| `judge` | The one independent reviewer that grades or verifies another agent's work. | one model, or `differs-from-parent` |

`differs-from-parent` means the first `panel` entry from a model family other than the parent chat's, such as a `gpt-*` or `grok-*` entry under a Claude parent. With no entry from another family, it means the first entry whose model differs from the parent's. When every entry matches the parent, use the first entry and say so in the reply. A judge from the parent's own family is same-model, medium signal, as in the panel rules below.

## Roles

One line per role in the config. A value is a tier name, a model token, a list of model tokens, or the alias `inherit-parent` (`auto` means the same), which runs the role on the parent chat model by omitting the model field. Delete a line to fall back to the tier the skill names.

| Role | Tier | Consumer |
|---|---|---|
| `feature, refactoring` | `strong` | feature and refactoring playbooks |
| `bug-fix` | `strong` | bug-fix playbook |
| `perf-issue` | `strong` | perf-issue playbook |
| `hillclimb` | `strong` | hillclimb playbook |
| `hardest tasks` | `strong` | vrub-mode delegate tiering |
| `judgment and prose` | `strong` | vrub-mode delegate tiering |
| `how explorer` | `fast` | how |
| `how explainer` | `strong` | how |
| `why investigators` | `fast` | why |
| `why synthesizer` | `strong` | why |
| `reflect tooling` | `fast` | reflect |
| `reflect judgment, divergent, synthesizer` | `strong` | reflect |
| `arena runners` | `panel` | arena, architect, eval |
| `arena cross-judge` | `judge` | arena, eval, figure-it-out |
| `swarm workers` | `fast` | swarm, verification lanes in multi-phase plans |
| `architect runners` | `panel` | architect |
| `interrogate reviewers` | `panel` | interrogate |
| `trail reviewer` | `judge` | show-me-your-work |
| `orchestrate verifier` | `judge` | orchestrate |
| `recall workers` | `fast` | recall |
| `computer use` | Codex token | codex-computer-use |

`computer use` is always a Codex `<model>@<effort>` token, whatever the harness, because the run goes through the codex CLI that ships inside ChatGPT.app. Its default is `gpt-6.1-sol@high`.

## Resolving a role

1. Find the config. If a jstack model table is already in context (the always-applied rule on Cursor, the `CLAUDE.md` import on Claude Code, the `AGENTS.md` pointer on Codex), use it. Otherwise read the user file at the path your harness file names. A `jstack-models.md` at the repository root overrides the user file only when its `harness:` line matches the harness you are running in; a root file for another harness is ignored, since its tokens are not spawnable here. If neither exists, use the defaults in your harness file.
2. Look up the role line. A tier name resolves through the `Tiers` section of the same config. A model token or list is used as written. `inherit-parent` or `auto` omits the model field; never treat these aliases as broken tokens.
3. A role with no line uses the tier the skill names, resolved through the config's `Tiers` section.
4. Validate the token and effort against the current host's advertised options. If an optional configured token is unavailable, use an available model appropriate to the role or inherit the parent and disclose the substitution. If the user requires a particular model or independent model diversity, report that unmet requirement instead of substituting. Do not change global configuration or launch another CLI to evade host restrictions.

## Panels on a single-family harness

A panel exists to surface independent blind spots. On Cursor the entries are different vendors. On Claude Code or Codex the list repeats one family, so:

- Give every repeated model a distinct lens taken from the skill's rubric (split the rubric's sections across the repeats). Do not assign personas.
- Agreement between distinct models is high-signal. Agreement between same-model lenses is medium-signal. Say which one the report is counting.
- When the panel is generation-bound rather than judgment-bound (arena runners, architect runners), give each repeat a distinct design constraint instead of a lens so the candidates diverge structurally.
- When the harness cannot run subagents in parallel, run the panel sequentially in fresh sessions and label the report `sequential, one model`.
