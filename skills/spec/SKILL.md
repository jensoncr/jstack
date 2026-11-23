---
name: spec
description: "Turn a messy problem into a folder an agent or a swarm can build from and be judged against: a spec, runnable checks, a plan, and a contract for choices that are hard to reverse. Use for /spec, 'spec this out', or an ambiguous brief that needs settling before code."
---

# Spec

The deliverable is a folder, not code. A reader with no jstack and no access to this chat must be able to build from it and know when they are done.

Write it under `docs/spec/<slug>/` unless the user names a path. `references/example/` is a complete worked folder. Match its shape.

| File | Holds | When |
|---|---|---|
| `spec.md` | What must be true. Stays current. | Always |
| `checks/` | The cases and rules the build is judged by. Frozen once approved. | Always |
| `plan.md` | Slices in order, how to run them, when to stop. A record once built. | More than one slice |
| `contracts/` | The data model and interfaces as real types or schema. | A choice is hard to reverse |

## Start

Open a todolist with one entry per step.

## 1. Frame

State the outcome, who notices it, and what is out of scope. If the request looks like the wrong fix for the goal, say so first. A time limit is a ceiling. Stop when step 7 passes, not when the time is used.

## 2. Sort the unknowns

Each unknown is one of three kinds.

- **Decision.** Only the user or their customer can make it. Run the **grill-me** skill.
- **Fact.** Look it up: in the repo, or with the **research** skill for the web.
- **Experiment.** Running something settles it. Use the vrub-mode skill's `playbooks/prototype.md`.

A question nobody can answer yet goes in `spec.md` with the default the builder applies. Never fill a gap with a silent guess.

## 3. Write the checks

Do this before any design. For each requirement write:

- **Cases.** An input and the result the user agrees is correct. A case names no function, file, or framework.
- **Rules.** What must hold on every input.

Name the one command that runs them and the score line it prints. Hold back about a third of the cases in `checks/holdout/` for the reviewer. A requirement with no check is rewritten until it has one, or marked as judged by a person. The user approves the checks. After that they change only in their own commit, with the user's say.

## 4. Settle what is hard to reverse

Usually the data model, the public interfaces, and where data lives. Skip this step when nothing qualifies. When the shape is already clear, write the contract directly.

1. When the shape is open, run the **architect** skill with a checkpoint. It develops each concept on its own worktree, has another provider judge them, and brings back one design. Give it the requirements and the checks from step 3 as its rubric.
2. The user signs off, seeing the judging and any disagreement that is left.
3. Write the chosen model and interfaces as real types or schema in `contracts/`. Fields live there and nowhere else.
4. Record the choice in `spec.md`, with one line for each concept that lost and why.
5. Add at most two Mermaid diagrams to `spec.md`: how the parts connect, and how the records link, without fields.

Everything else belongs to the builder. Say so in `spec.md`.

## 5. Slice

The first slice is a walking skeleton that makes the check command run and print an honest score. Order the rest riskiest first (the **sequence-verifiable-units** principle skill). Each slice names what it delivers, what it depends on, the paths it owns, the checks it turns green, and its evidence.

## 6. Write the files

`spec.md` and `plan.md` follow `references/example/`. `plan.md` carries the prompt that starts one agent, the rules for several, what the builder may do without asking, and the stop rules.

## 7. Cold read

Spawn a fresh subagent with the folder and nothing else. Ask what it would build first, what it would have to guess, and how it would know it is done. Fix every guess, then ask again. Two rounds at most. What is still open goes to the user.

## 8. Hand back

Stop. Building starts on the user's go. One agent takes the prompt in `plan.md`. A swarm takes the slices through the vrub-mode skill's `playbooks/multi-phase-plan.md`. One number to push up takes `playbooks/hillclimb.md`.

**Reply:** the folder path, the check command and its score line, the design chosen in step 4, what lost, and how it was judged, each open question with its default, and what the cold read still had to guess.
