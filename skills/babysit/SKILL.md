---
name: babysit
description: Check pull requests, fix failing CI, and address review feedback. Use for "check PR", "babysit", "watch CI", "get it green", or "merge-ready". Requests to merge or land route to ship.
---

# Babysit

Read [the harness guide](../vrub-mode/references/harness/README.md), then execute the shared [Babysit playbook](../vrub-mode/playbooks/babysit.md). This entry point does not require activating vrub-mode.

Resolve the playbook's `scripts/`, `references/`, and `playbooks/` paths from the installed `vrub-mode/` directory. Run its scripts by absolute path while keeping the target repository as the working directory.

Declare the playbook's mode before acting. A status question gets one read-only check; a request to fix or watch gets the appropriate ongoing mode. Preserve any narrower scope the user specified.

When the request includes merging, landing, shipping, or merge-when-ready, use [Ship](../ship/SKILL.md), which owns the full path through readiness and merge. A merge-ready request alone does not authorize merging.
