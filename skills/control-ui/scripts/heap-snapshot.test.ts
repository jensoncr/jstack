import { expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const strings = ["", "(root)", "Window", "Array", "Leaky", "window", "cache", "(GC roots)"];
const meta = {
  node_fields: ["type", "name", "id", "self_size", "edge_count"],
  node_types: [["hidden", "array", "string", "object", "code", "closure", "regexp", "number", "native", "synthetic"]],
  edge_fields: ["type", "name_or_index", "to_node"],
  edge_types: [["context", "element", "property", "internal", "hidden", "shortcut", "weak"]],
};
const NF = 5;

// root → Window --cache--> Array --[i]--> Leaky × leaks, and Window --Leaky--> the Leaky class itself
function snapshot(leaks: number) {
  const nodes = [9, 1, 1, 0, 1, 3, 2, 3, 100, 2, 3, 3, 5, 16, leaks];
  const edges = [2, 5, 1 * NF, 2, 6, 2 * NF, 2, 4, (3 + leaks) * NF];
  for (let i = 0; i < leaks; i++) {
    nodes.push(3, 4, 7 + i * 2, 1000, 0);
    edges.push(1, i, (3 + i) * NF);
  }
  nodes.push(5, 4, 9999, 32, 0);
  return JSON.stringify({ snapshot: { meta }, nodes, edges, strings });
}

async function run(...args: string[]) {
  const p = Bun.spawn(["bun", join(import.meta.dir, "heap-snapshot.ts"), ...args], { stdout: "pipe", stderr: "pipe" });
  return (await new Response(p.stdout).text()) + (await new Response(p.stderr).text());
}

test("diff names what grew and what holds it", async () => {
  const dir = mkdtempSync(join(tmpdir(), "heap-"));
  await Bun.write(join(dir, "before.heapsnapshot"), snapshot(1));
  await Bun.write(join(dir, "after.heapsnapshot"), snapshot(4));
  const out = await run("summary", join(dir, "after.heapsnapshot"), "--base", join(dir, "before.heapsnapshot"), "--retainers", "Leaky");

  const leakyRow = out.split("\n").find((l) => l.endsWith(" Leaky"));
  expect(leakyRow).toMatch(/^\s+\+3\s+\+0\.00 MB\s+4\s+Leaky$/);
  expect(out).toContain("→ Window (via .window)");
  expect(out).toContain("→ Array (via .cache)");
  expect(out).toContain("→ Leaky (via .[3])");
});

test("--times singles out objects that grew once per action", async () => {
  const dir = mkdtempSync(join(tmpdir(), "heap-"));
  await Bun.write(join(dir, "before.heapsnapshot"), snapshot(1));
  await Bun.write(join(dir, "after.heapsnapshot"), snapshot(4));
  const hit = await run("summary", join(dir, "after.heapsnapshot"), "--base", join(dir, "before.heapsnapshot"), "--times", "3");
  expect(hit.split("likely leaks")[1]!.split("app objects")[0]).toContain(" Leaky");
  const miss = await run("summary", join(dir, "after.heapsnapshot"), "--base", join(dir, "before.heapsnapshot"), "--times", "2");
  expect(miss.split("likely leaks")[1]!.split("app objects")[0]).toContain("(none)");
});

test("a summary without a base lists the biggest groups", async () => {
  const dir = mkdtempSync(join(tmpdir(), "heap-"));
  await Bun.write(join(dir, "s.heapsnapshot"), snapshot(2));
  const out = await run("summary", join(dir, "s.heapsnapshot"));
  expect(out).toContain("6 objects");
  expect(out.split("\n").find((l) => l.endsWith(" Leaky"))).toMatch(/^\s+2\s+0\.00 MB\s+Leaky$/);
  expect(out).toContain(" Leaky()");
});
