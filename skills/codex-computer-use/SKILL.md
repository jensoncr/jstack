---
name: codex-computer-use
description: Run a task in a native macOS app (Excel, Finder, Preview, System Settings, any desktop app) through Codex's own Computer Use, the same one the ChatGPT/Codex desktop app drives. Use when a task needs a desktop app on this Mac and no API, CLI, file read, or connector can do it. Not for websites; use the project's browser skill for those.
---

# Codex Computer Use

`scripts/run.sh` sends one task to the codex CLI (the one on `PATH`, a standard install location, or ChatGPT.app's own copy; `CODEX_BIN` overrides) and waits for it. Codex controls the screen through the `cua_repl` server and `Codex Computer Use.app`, the same stack and per-app approvals as the desktop app. Any harness can call it: Claude Code, Codex, or Cursor.

## Before you reach for it

- Prefer an API, CLI, connector, or reading the file directly. Computer Use is slow and uses the user's real screen, mouse, and keyboard while it runs.
- For a web page, use a browser skill. Computer Use drives the user's real Chrome profile, and the run stops if the user touches the mouse.
- Read-only questions that `osascript`, `mdfind`, or a file read can answer do not need it.

## Run it

1. Check that the target app is approved: `scripts/run.sh --approved-apps` prints bundle IDs. A headless run cannot answer an approval prompt (see [App approvals](#app-approvals)). When the app is missing, ask the user. With their go, run `scripts/run.sh --approve <bundle-id>` (`osascript -e 'id of app "Name"'` gives the ID), or have them choose **Always allow** for it in the Codex app.
2. Write the task to a file in a scratch directory outside any repository. State:
   - the goal and the app by name,
   - **Authorized:** the exact actions allowed (for example "type into a new untitled document, then discard it"). Anything that sends, buys, deletes, publishes, or changes a setting must be listed here, or Codex stops before it,
   - when to stop,
   - **Deliverable:** what to report and which screenshots to save.
3. Run it in the background and wait for it to finish. It can take several minutes:

   ```bash
   <skill-dir>/scripts/run.sh <task.md> <out-dir>
   ```

   Options: `--model`, `--effort`, `--wait SECONDS` (how long to wait for another run's screen lock; the default fails at once).
4. Read `<out-dir>/report.md`. Its first line is `DONE`, `PARTIAL`, or `STOPPED`. Screenshots sit next to it. Open them to check the claim before you report it. The full event log is `events.jsonl`.

The script prepends [the rules](scripts/preamble.md) every run follows: use only the named apps, never type or record a secret, stop at logins, payments, permission prompts, and unexpected screens.

## Exit codes

| Code | Meaning | Do |
|---|---|---|
| 0 | Codex finished; read the report's first line | Check the screenshots |
| 75 | Another computer-use run holds the screen | Wait, or rerun with `--wait` |
| 77 | An app needs approval | Ask the user, then `--approve <bundle-id>` |
| 69 | Codex had no Computer Use tool | Check that Computer Use is turned on in the Codex app |
| other | Preflight or codex failure | Read the message and `stderr.log` |

## App approvals

The first time Computer Use touches an app, it asks the Codex client "Allow Computer Use to use X?". The desktop app shows that as a dialog. `codex exec` has no one to ask, so it declines, whatever `approval_policy`, `approvals_reviewer`, or `[computer_use]` config says (checked 2026-11-02). The one thing a headless run honors is the Computer Use service's own **Always allow** list, `ComputerUseAppApprovals.json` in the `2DC432GLL2.com.openai.sky.CUAService` group container.

- `--approve <bundle-id>...` adds apps to that list, the same as choosing Always allow.
- `--approve-all` adds every app installed under `/Applications`, `/System/Applications`, and `~/Applications`. Rerun it after installing an app.
- Both back up the file to `~/.codex/tmp/` first and print the `cp` that undoes them.
- Apps that OpenAI's policy forbids or the user's organization denies stay blocked. The list cannot override those.

Approving an app also lets Codex desktop sessions use it without asking. Change the list only when the user asks.

## Model

The `computer use` role line in the jstack model config sets the Codex model token, for example `computer use: gpt-6.1-sol@high`. It is always a Codex token, whatever harness calls the script. The script reads it from [the model config](../vrub-mode/references/models.md#config). `--model` and `--effort` override it.

## Safety

- Tell the user before a run starts. They can press Esc to stop it.
- Never put a password, token, or key in the task file. If the task needs one, have the user type it.
- One run at a time. The script holds a global lock, so parallel subagents cannot fight over the screen.
