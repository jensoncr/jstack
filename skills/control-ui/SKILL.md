---
name: control-ui
description: "Drive and inspect a web, IDE, or Electron UI through a local browser or Chrome DevTools Protocol harness, and keep the evidence. Use to verify a UI change, reproduce a UI bug, or capture screenshots, accessibility snapshots, console and network logs, or performance profiles."
---

# Control UI

Verify UI behavior with evidence from a real browser. Reuse the repo's own harness first: its Playwright or Cypress tests, Storybook, browser scripts, or Electron launch scripts. A project `verify-*` skill from `/create-verification-skill` wins over everything here. Otherwise use your harness's browser tool if it has one, and fall back to a temporary local harness around the app's dev server or Chromium debug port.

## Uses

- Reproduce a bug that depends on real focus, keyboard input, scrolling, resizing, or rendering.
- Verify a visual or accessibility change with screenshots and snapshots.
- Check a web, IDE, or Electron change before it ships.
- Capture console logs, network logs, CPU profiles, traces, or heap snapshots.
- Collect before-and-after evidence for a PR or a verifier's verdict.

## Set up

1. Start the app with the repo's documented dev command.
2. Look for an existing harness, as listed above.
3. For a web app, open the local URL with the browser tooling you have.
4. For Electron or another Chromium app, enable a remote debugging port when the app supports one.
5. Pick the page by a stable app marker, not by tab order.
6. Target elements by accessibility role, label, or a stable `data-*` attribute, not by coordinates.

## A temporary web probe

When the repo already has Playwright, a one-off probe looks like this:

```javascript
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://127.0.0.1:<port>");
await page.getByRole("button", { name: /submit/i }).click();
await page.screenshot({ path: "/tmp/ui-probe-after.png", fullPage: true });
await browser.close();
```

Don't add Playwright to the project for a probe unless the user asks. Use the dev dependencies or browser tools that are already there.

## A temporary DevTools probe

For Electron or a Chromium app started with `--remote-debugging-port=<port>`, connect over the Chrome DevTools Protocol:

```javascript
import { chromium } from "playwright";

const browser = await chromium.connectOverCDP("http://127.0.0.1:<debug-port>");
const pages = browser.contexts().flatMap((context) => context.pages());
let page;
for (const candidate of pages) {
  if (await candidate.locator("<app-root-selector>").count()) {
    page = candidate;
    break;
  }
}

if (!page) {
  console.log(await Promise.all(pages.map(async (p) => ({ title: await p.title(), url: p.url() }))));
  throw new Error("No matching app page found");
}

await page.screenshot({ path: "/tmp/ui-probe-cdp.png", fullPage: true });
await browser.close();
```

Replace `<app-root-selector>` with a stable marker from this repo, such as the root app node, a landmark, or a product `data-*` attribute.

## Interaction loop

1. Capture a snapshot or screenshot before you act.
2. Choose a target from the latest page structure.
3. Take exactly one action: click, type, press a key, drag, scroll, navigate, or resize.
4. Capture a fresh snapshot or screenshot.
5. Check that the state changed as expected.
6. Keep the before-and-after artifacts when the user asked for proof.

## DevTools capabilities

Use raw DevTools Protocol calls only when the higher-level browser API can't do the job:

- Performance: CPU profiles, traces, paint flashing, layout-shift inspection.
- Memory: heap snapshots and forced garbage collection, for leaks.
- Network: request blocking, throttling, cache bypass, request and response logs.
- Rendering: viewport changes, color-scheme and reduced-motion emulation, accessibility checks.
- Debugging: console streaming, exception capture, DOM snapshots.

## Choosing the page

When several windows or tabs share one debug port, match a positive marker for the surface under test, and a negative marker to rule out the wrong one when you need it. If no page matches, list the page titles and URLs instead of guessing.

## Guardrails

- Don't reuse an element reference after a navigation or a structural change.
- Click by coordinates only right after a fresh screenshot.
- Keep test data local and disposable.
- Don't keep screenshots or heap snapshots from a privacy-sensitive workspace unless the user agrees.
- Discover this repo's selectors, ports, and scripts. Never copy them from another repo.
- Stop the dev servers, debug sessions, and temporary profiles you started.

Adapted from the `control-ui` skill in Cursor's `cursor-team-kit` (MIT).
