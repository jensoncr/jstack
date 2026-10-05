---
name: ship
description: Merge or land a pull request or stack, including fixing blockers, independent verification, merge-when-ready, and removing the merged branches' worktrees. Use for "merge this PR", "ship it", or "land the stack". Does not authorize production deployment.
---

# Ship

Read [the harness guide](../vrub-mode/references/harness/README.md). This entry point does not require activating vrub-mode.

Resolve the shared playbooks' `scripts/`, `references/`, and `playbooks/` paths from the installed `vrub-mode/` directory. Run scripts by absolute path while keeping the target repository as the working directory.

Inspect the current PR or stack. If CI or review blockers remain, run the shared [Babysit playbook](../vrub-mode/playbooks/babysit.md) first. Then continue directly into [Shipping](../vrub-mode/playbooks/shipping.md) under the user's existing merge authorization. A status update or successful readiness pass does not end a request to merge.

After the merges, remove the merged branches' local worktrees. Run [`scripts/cleanup-merged-worktrees.sh`](scripts/cleanup-merged-worktrees.sh) by absolute path from the target repository with every branch that merged. It holds back the main worktree, the one this session runs in, and any with uncommitted tracked edits. Report what it removed and why it held each one back. With merge-when-ready, run it once each merge lands, or report the cleanup as pending if the session ends first. Leave unmerged branches' worktrees alone, and leave a full disk cleanup to the Worktree cleanup playbook.

An explicitly excluded PR stays excluded. Preserve required repository approvals and independent verification. If a required capability is unavailable, report the specific unmet gate and what remains unmerged. Do not substitute the author's own verdict for an independent review. A request to merge does not by itself authorize a separate deployment operation.
