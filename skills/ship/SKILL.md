---
name: ship
description: Merge or land a pull request or stack, including fixing blockers, independent verification, and merge-when-ready. Use for "merge this PR", "ship it", or "land the stack". Does not authorize production deployment.
---

# Ship

Read [the harness guide](../vrub-mode/references/harness/README.md). This entry point does not require activating vrub-mode.

Resolve the shared playbooks' `scripts/`, `references/`, and `playbooks/` paths from the installed `vrub-mode/` directory. Run scripts by absolute path while keeping the target repository as the working directory.

Inspect the current PR or stack. If CI or review blockers remain, run the shared [Babysit playbook](../vrub-mode/playbooks/babysit.md) first. Then continue directly into [Shipping](../vrub-mode/playbooks/shipping.md) under the user's existing merge authorization. A status update or successful readiness pass does not end a request to merge.

An explicitly excluded PR stays excluded. Preserve required repository approvals and independent verification. If a required capability is unavailable, report the specific unmet gate and what remains unmerged. Do not substitute the author's own verdict for an independent review. A request to merge does not by itself authorize a separate deployment operation.
