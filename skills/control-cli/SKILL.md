---
name: control-cli
description: "Drive, inspect, and profile an interactive CLI or TUI through a repeatable local harness, such as tmux or a pseudo-terminal script, and keep the transcript. Use for CLI UX checks, prompt flows, startup regressions, memory leaks, hangs, or terminal demos."
---

# Control CLI

Exercise an interactive CLI through a repeatable harness instead of poking at it by hand. Reuse the repo's own test or demo harness first. A project `verify-*` skill from `/create-verification-skill` wins over everything here. Otherwise assemble a temporary harness from standard local tools.

## Uses

- Reproduce a CLI or TUI bug with deterministic input.
- Verify keyboard flows, prompts, interrupts, resize behavior, and terminal layout.
- Capture before-and-after transcripts for a fix.
- Profile startup time, a slow operation, a hang, or memory growth.
- Record a short terminal demo when output is easier to show than to explain.

## Harness loop

1. Name the command under test and the smallest workspace that reproduces the behavior.
2. Look for an existing harness: package scripts, end-to-end tests, demo recorders, expect scripts, or pseudo-terminal helpers.
3. If there is none, start the CLI in an isolated terminal session with fixed environment variables.
4. Capture the screen before you interact.
5. Send one action at a time: text, Enter, arrows, Escape, Ctrl-C, or a resize.
6. Wait for a specific screen pattern or prompt before the next action.
7. Save the transcript and any profile artifacts.
8. End the session cleanly.

## Harness options

- **The repo's own harness.** Prefer checked-in scripts, because they know the app's startup, environment, and prompts.
- **tmux.** Managed sessions, with `capture-pane`, `send-keys`, attach, and detach.
- **A pseudo-terminal probe.** A short Python, Node, or expect script, when tmux isn't available.
- **A runtime inspector.** The Node or Bun inspector, for CPU profiles, heap snapshots, and live evaluation.
- **A terminal recorder.** The repo's demo tools, or an asciinema-compatible recorder, when the user asks for a demo.

## A minimal tmux harness

```bash
SESSION="cli-harness-$(date +%s)"
tmux new-session -d -s "$SESSION" -- <command-under-test>
tmux capture-pane -pt "$SESSION"
tmux send-keys -t "$SESSION" "help" Enter
tmux capture-pane -pt "$SESSION"
tmux kill-session -t "$SESSION"
```

For a Node CLI, start it with the inspector, then read the inspector URL from the terminal output:

```bash
NODE_OPTIONS="--inspect=127.0.0.1:0" tmux new-session -d -s "$SESSION" -- <node-cli-command>
```

## A minimal pseudo-terminal harness

Use one when you need deterministic waits and the repo has neither tmux nor a demo harness. Keep it temporary unless the user asks for a reusable test.

```python
import os
import pty
import select
import subprocess
import time

master_fd, slave_fd = pty.openpty()
proc = subprocess.Popen(
    ["<command>", "<arg>"],
    stdin=slave_fd,
    stdout=slave_fd,
    stderr=slave_fd,
    close_fds=True,
)
os.close(slave_fd)

deadline = time.time() + 30
buffer = b""
while time.time() < deadline:
    ready, _, _ = select.select([master_fd], [], [], 0.25)
    if not ready:
        continue
    buffer += os.read(master_fd, 4096)
    if b"<ready text>" in buffer:
        os.write(master_fd, b"help\n")
        break

print(buffer.decode(errors="replace"))
proc.terminate()
os.close(master_fd)
```

For richer terminal control, use `pty.fork()` or a pseudo-terminal library the repo already has.

## Profiling recipes

- **Startup regression.** Time the baseline and the change on the same machine, environment, and command.
- **Slow operation.** Start a CPU profile, run the operation, stop the profile, and compare the functions with the most self time.
- **Memory leak.** Force garbage collection if you can, take a heap snapshot, repeat the operation, force garbage collection again, and take another snapshot.
- **Hang.** Capture the screen, the active handles, and a stack or CPU sample before you interrupt it.

## Guardrails

- Wait on output, not on sleeps. If you must sleep, say why.
- Never send credentials or destructive commands into a controlled session.
- Keep the harness in a temporary directory unless the repo already has a test or demo harness.
- Adapt commands to this repo's scripts and runtime. Never copy paths from another repo.
- Clean up tmux sessions, temporary directories, inspector processes, and demo artifacts unless the user asks to keep them.

Adapted from the `control-cli` skill in Cursor's `cursor-team-kit` (MIT).
