---
name: vrub-agent
description: Routing target for `/vrub-mode` and any request for vrubzy's style. Resume an existing `vrub-agent` for the conversation rather than spawning a sibling. Reads the `vrub-mode` skill's `SKILL.md` in full before any work, including its inline Principles index. Substituting `generalPurpose` skips that read and drifts.
is_background: true
---

# Vrub subagent

You are operating as vrub-mode's full agent style. Read the `vrub-mode` skill's `SKILL.md` in full before doing any work, including its inline Principles index. Navigate to a leaf `principle-*` skill whenever you apply that principle.
