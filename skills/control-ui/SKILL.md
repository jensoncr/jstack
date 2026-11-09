---
name: control-ui
description: "Drive and inspect a web, IDE, or Electron UI in a real browser, and keep the evidence. Use to verify a UI change, reproduce a UI bug, or capture screenshots, accessibility snapshots, console and network logs, or performance profiles."
---

# Control UI

Verify UI behavior with evidence from a real browser. This skill picks the driver and sets the rules for using it. The driver's own instructions say how to run it.

## Pick the driver

Use the first one that exists:

1. **The project's `verify-*` skill**, from `/create-verification-skill`. It knows this app's startup, auth, and flows.
2. **The repo's own harness.** Playwright or Cypress tests, Storybook, browser scripts, or Electron launch scripts.
3. **The `agent-browser` CLI**, when `command -v agent-browser` finds it. It drives Chrome and Electron apps through accessibility snapshots and element refs. Before its first command, load its instructions from the CLI itself: `agent-browser skills get core`, and `agent-browser skills get electron` for an Electron app.
4. **Your harness's own browser tool**, when it has one.

With none of these, say so and name what is missing. Don't add a browser dependency to the project unless the user asks.

## Uses

- Reproduce a bug that depends on real focus, keyboard input, scrolling, resizing, or rendering.
- Verify a visual or accessibility change with screenshots and snapshots.
- Check a web, IDE, or Electron change before it ships.
- Capture console logs, network logs, CPU profiles, traces, or heap snapshots.
- Collect before-and-after evidence for a PR or a verifier's verdict.

## Set up

1. Start the app with the repo's documented dev command.
2. For Electron or another Chromium app, enable a remote debugging port when the app supports one.
3. Pick the page by a stable app marker, not by tab order. When several windows or tabs share one debug port and none matches, list the page titles and URLs instead of guessing.
4. Target elements by accessibility role, label, or a stable `data-*` attribute, not by coordinates.

## Interaction loop

1. Capture a snapshot or screenshot before you act.
2. Choose a target from the latest page structure.
3. Take exactly one action: click, type, press a key, drag, scroll, navigate, or resize.
4. Capture a fresh snapshot or screenshot.
5. Check that the state changed as expected.
6. Keep the before-and-after artifacts when the user asked for proof.

## Guardrails

- Don't reuse an element reference after a navigation or a structural change.
- Click by coordinates only right after a fresh screenshot.
- Keep test data local and disposable.
- Don't keep screenshots or heap snapshots from a privacy-sensitive workspace unless the user agrees.
- Discover this repo's selectors, ports, and scripts. Never copy them from another repo.
- Stop the dev servers, browser sessions, and temporary profiles you started.

Adapted from the `control-ui` skill in Cursor's `cursor-team-kit` (MIT).
