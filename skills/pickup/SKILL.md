---
name: pickup
description: Resume or take over a prior agent's in-flight work from a transcript, a pushed branch, or a cloud-agent link. Use for "take over this branch", "pick up where the last session left off", or "resume this work".
---

# Pickup

Read [the harness guide](../vrub-mode/references/harness/README.md), then execute the shared [Session pickup playbook](../vrub-mode/playbooks/session-pickup.md). This entry point does not require activating vrub-mode.

The prior trail is authoritative. Find the resume point and do not redo finished work.

When step 4 routes the remaining work to a playbook, load [vrub-mode](../vrub-mode/SKILL.md) and continue under it, since that playbook relies on its principles and spawn rules. A pickup whose verdict is a report, such as a postmortem or a ratified conclusion, ends here.
