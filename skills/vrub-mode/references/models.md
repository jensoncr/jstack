# Model resolution

Every jstack delegation names a **role** and its **tier**. Read [the harness guide](harness/README.md) before resolving a role. Roles and tiers are shared across hosts; the config maps them to supported model tokens. The current spawn schema controls how an override is passed.

## Tiers

| Tier | Intent | Shape |
|---|---|---|
| `strong` | Judgment, prose, vague intent, hard code, and precisely specified steps that must be followed to the letter. | one model |
| `fast` | Mechanical edits, exploration, verification lanes, any cheap fan-out. | one model |
| `panel` | Independent reviewers or runners. One subagent per entry, so the list length sets the count. Repeats are allowed. | list |
| `judge` | The one independent reviewer that grades or verifies another agent's work. | one model, or `differs-from-parent` |

`differs-from-parent` means the first `panel` entry whose provider is not the parent chat's. With no such entry that can run, it means the first entry whose model differs from the parent's. When every entry matches the parent, use the first entry and say so in the reply. A judge from the parent's own provider is medium signal, as in the panel rules below.

## Roles

One line per role in the config. A value is a tier name, a seat, a list of seats, or the alias `inherit-parent` (`auto` means the same), which runs the role on the parent chat model by omitting the model field. Delete a line to fall back to the tier the skill names.

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
| `council` | none | council |

`council` lists one seat per provider. Step 4 below never substitutes a council seat: one that can't run is reported. With no line, the council skill seats the newest flagship of each provider the host can run, so list the seats you want to leave a provider out.

`computer use` is always a Codex `<model>@<effort>` token, whatever the harness, because the run goes through the codex CLI that ships inside ChatGPT.app. Its default is `gpt-6.1-sol@high`.

## Seats

A model token is a seat: `<provider>/<model>[@<effort>]`, such as `claudeAgent/claude-fable-5-2` or `codex/gpt-6.1-sol@high`. The provider is a T3 Code `driverKind` (`claudeAgent`, `codex`), never a provider instance id, because instance ids differ between machines and projects (`claudeAgent` on one, `claudeAgent_2` on another). Write `@<effort>` to pin a seat's effort. Without it, the effort depends on the route: a native spawn may use the model's default or a host-configured default, and a T3 child on your own instance and model inherits yours. One config serves every harness, because each harness file says how to start a seat.

## Config

The one config every jstack skill reads, on every harness and machine. There is no per-user or per-repository override: change a model by editing this block.

```
## Tiers
strong: claudeAgent/claude-fable-5-2
fast: claudeAgent/claude-opus-5-5
panel: claudeAgent/claude-fable-5-2, claudeAgent/claude-opus-5-5, codex/gpt-6.1-sol@high
judge: differs-from-parent

## Roles
feature, refactoring: strong
bug-fix: strong
perf-issue: strong
hillclimb: strong
hardest tasks: strong
judgment and prose: strong
how explorer: fast
how explainer: strong
why investigators: fast
why synthesizer: strong
reflect tooling: fast
reflect judgment, divergent, synthesizer: strong
arena runners: panel
arena cross-judge: judge
swarm workers: fast
architect runners: panel
interrogate reviewers: panel
trail reviewer: judge
orchestrate verifier: judge
recall workers: fast
computer use: gpt-6.1-sol@high
council: claudeAgent/claude-fable-5-2@high, codex/gpt-6.1-sol@high
```

## Resolving a role

1. Find the config. It is the block under [Config](#config).
2. Look up the role line. A tier name resolves through the `Tiers` section of the same config. A model token or list is used as written. `inherit-parent` or `auto` omits the model field; never treat these aliases as broken tokens.
3. A role with no line uses the tier the skill names, resolved through the config's `Tiers` section.
4. Start the seat. Use the native subagent tool when the seat's provider is the host's and that tool can pass everything the seat names, as your harness file maps it. Otherwise use the `another provider's model` verb in your harness file. Validate the model and effort against what the route advertises. Before reporting a seat's model, confirm the model that served it, as your harness file says; report a seat you can't confirm as unconfirmed. If a seat can't run inside T3 Code, report it and don't substitute unless the user asked for a fallback. Elsewhere, use an available model appropriate to the role or inherit the parent and disclose the substitution. If the user requires a particular model or independent model diversity, report that unmet requirement instead of substituting. Do not change global configuration or launch another CLI to evade host restrictions.

## Panels with one provider

A panel exists to surface independent blind spots, so the config's panel spans providers. A host with no `another provider's model` verb, such as plain Claude Code or Codex, can run only its own provider's seats. The other seats fall back per step 4, the list repeats one provider, and:

- Give every repeated model a distinct lens taken from the skill's rubric (split the rubric's sections across the repeats), or the split the skill names. Do not assign personas.
- Agreement between distinct models is high-signal. Agreement between same-model lenses is medium-signal. Say which one the report is counting.
- When the panel is generation-bound rather than judgment-bound (arena runners, architect runners), give each repeat a distinct design constraint instead of a lens so the candidates diverge structurally.
- When the harness cannot run subagents in parallel, run the panel sequentially in fresh sessions and label the report `sequential, one model`.
