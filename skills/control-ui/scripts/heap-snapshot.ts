#!/usr/bin/env bun
// Capture and read V8 heap snapshots (.heapsnapshot) without DevTools.
// capture: Chrome, Electron, or Node over CDP. summary: any V8-format snapshot, Bun's included.

type Json = Record<string, unknown>;
type Snapshot = {
  snapshot: { meta: { node_fields: string[]; node_types: [string[]]; edge_fields: string[]; edge_types: [string[]] } };
  nodes: number[];
  edges: number[];
  strings: string[];
};

const USAGE = `heap-snapshot capture <cdp> [-o file] [--target <url part>]
  <cdp>: a port (9229), http://host:port, or a ws:// URL such as \`agent-browser get cdp-url\` prints
heap-snapshot summary <after> [--base <before> [--times N]] [--top N] [--retainers <name>]
  --times: how many times the suspected action ran between the two snapshots`;

function arg(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

class Cdp {
  private id = 0;
  private pending = new Map<number, { resolve: (v: Json) => void; reject: (e: Error) => void }>();
  private listeners: ((method: string, params: Json, sessionId?: string) => void)[] = [];
  private constructor(private ws: WebSocket) {
    ws.onmessage = (e) => {
      const msg = JSON.parse(String(e.data)) as { id?: number; result?: Json; error?: { message: string }; method?: string; params?: Json; sessionId?: string };
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) p?.reject(new Error(msg.error.message));
        else p?.resolve(msg.result ?? {});
      } else if (msg.method) this.listeners.forEach((l) => l(msg.method!, msg.params ?? {}, msg.sessionId));
    };
  }
  static open(url: string): Promise<Cdp> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.onopen = () => resolve(new Cdp(ws));
      ws.onerror = () => reject(new Error(`cannot connect to ${url}`));
    });
  }
  send(method: string, params: Json = {}, sessionId?: string): Promise<Json> {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  on(l: (method: string, params: Json, sessionId?: string) => void) {
    this.listeners.push(l);
  }
  close() {
    this.ws.close();
  }
}

async function resolveWsUrl(cdp: string): Promise<string> {
  if (cdp.startsWith("ws://") || cdp.startsWith("wss://")) return cdp;
  const base = /^\d+$/.test(cdp) ? `http://127.0.0.1:${cdp}` : cdp.replace(/\/$/, "");
  const version = (await (await fetch(`${base}/json/version`)).json()) as { webSocketDebuggerUrl?: string };
  if (version.webSocketDebuggerUrl) return version.webSocketDebuggerUrl;
  const list = (await (await fetch(`${base}/json/list`)).json()) as { webSocketDebuggerUrl: string }[];
  if (!list[0]) throw new Error(`no debuggable target at ${base}`);
  return list[0].webSocketDebuggerUrl;
}

async function capture(args: string[]) {
  const cdpArg = args[0];
  if (!cdpArg) throw new Error(USAGE);
  const out = arg(args, "-o") ?? `heap-${Date.now()}.heapsnapshot`;
  const want = arg(args, "--target");
  const wsUrl = await resolveWsUrl(cdpArg);
  const conn = await Cdp.open(wsUrl);

  // A browser endpoint has no heap of its own, so attach to one page. A Node or page endpoint is the heap.
  let sessionId: string | undefined;
  if (wsUrl.includes("/devtools/browser/")) {
    const pages = ((await conn.send("Target.getTargets")).targetInfos as { targetId: string; type: string; url: string }[]).filter((t) => t.type === "page");
    const page = want ? pages.find((t) => t.url.includes(want)) : pages[0];
    if (!page) throw new Error(`no page${want ? ` whose URL contains "${want}"` : ""}. Pages: ${pages.map((p) => p.url).join(", ") || "none"}`);
    sessionId = (await conn.send("Target.attachToTarget", { targetId: page.targetId, flatten: true })).sessionId as string;
    console.error(`page: ${page.url}`);
  }

  const chunks: string[] = [];
  conn.on((method, params, sid) => {
    if (method === "HeapProfiler.addHeapSnapshotChunk" && sid === sessionId) chunks.push(params.chunk as string);
  });
  await conn.send("HeapProfiler.enable", {}, sessionId);
  await conn.send("HeapProfiler.collectGarbage", {}, sessionId);
  await conn.send("HeapProfiler.takeHeapSnapshot", { reportProgress: false }, sessionId);
  conn.close();
  const body = chunks.join("");
  await Bun.write(out, body);
  console.log(`${out} (${(body.length / 1e6).toFixed(1)} MB)`);
}

type Group = { count: number; size: number };

function load(file: string): Promise<Snapshot> {
  return Bun.file(file).json() as Promise<Snapshot>;
}

function view(s: Snapshot) {
  const m = s.snapshot.meta;
  const nf = m.node_fields.length;
  const ef = m.edge_fields.length;
  const [fType, fName, fId, fSize, fEdges] = ["type", "name", "id", "self_size", "edge_count"].map((f) => m.node_fields.indexOf(f)) as [number, number, number, number, number];
  const [eType, eName, eTo] = ["type", "name_or_index", "to_node"].map((f) => m.edge_fields.indexOf(f)) as [number, number, number];
  const nodeTypes = m.node_types[0];
  const edgeTypes = m.edge_types[0];
  const count = s.nodes.length / nf;
  const firstEdge = new Uint32Array(count + 1);
  for (let i = 0; i < count; i++) firstEdge[i + 1] = firstEdge[i]! + s.nodes[i * nf + fEdges]!;
  const type = (i: number) => nodeTypes[s.nodes[i * nf + fType]!]!;
  // Objects group by constructor name, functions as `name()` so a class never mixes with its instances,
  // and strings, numbers, and code by kind.
  const group = (i: number) => {
    const t = type(i);
    const name = s.strings[s.nodes[i * nf + fName]!]!;
    return t === "closure" ? `${name}()` : t === "object" || t === "native" || t === "regexp" ? name : `(${t})`;
  };
  const edgesOf = function* (i: number) {
    for (let e = firstEdge[i]!; e < firstEdge[i + 1]!; e++) {
      const t = edgeTypes[s.edges[e * ef + eType]!]!;
      const raw = s.edges[e * ef + eName]!;
      yield { type: t, name: t === "element" || t === "hidden" ? `[${raw}]` : s.strings[raw]!, to: s.edges[e * ef + eTo]! / nf };
    }
  };
  return { count, group, type, edgesOf, id: (i: number) => s.nodes[i * nf + fId]!, size: (i: number) => s.nodes[i * nf + fSize]! };
}

function groups(v: ReturnType<typeof view>): Map<string, Group> {
  const g = new Map<string, Group>();
  for (let i = 0; i < v.count; i++) {
    const k = v.group(i);
    const cur = g.get(k) ?? { count: 0, size: 0 };
    cur.count++;
    cur.size += v.size(i);
    g.set(k, cur);
  }
  return g;
}

// Shortest strong path from the synthetic root (node 0) to the newest instance of `name`.
function retainerPath(v: ReturnType<typeof view>, name: string): string[] | undefined {
  const parent = new Int32Array(v.count).fill(-1);
  const via: string[] = new Array(v.count);
  parent[0] = 0;
  const queue = [0];
  for (let q = 0; q < queue.length; q++) {
    const n = queue[q]!;
    for (const e of v.edgesOf(n)) {
      // DevTools keeps handles to recently inspected objects. They are not the app's references.
      if (e.type === "weak" || e.type === "shortcut" || e.name.includes("DevTools console") || parent[e.to] !== -1) continue;
      parent[e.to] = n;
      via[e.to] = e.name;
      queue.push(e.to);
    }
  }
  let target = -1;
  for (let i = 0; i < v.count; i++) if (v.group(i) === name && parent[i] !== -1 && (target < 0 || v.id(i) > v.id(target))) target = i;
  if (target < 0) return undefined;
  const path: string[] = [];
  for (let n = target; n !== 0; n = parent[n]!) path.unshift(`${v.group(n)} (via .${via[n]})`);
  return path;
}

const mb = (b: number) => `${(b / 1e6).toFixed(2)} MB`;
const signed = (n: number, f: (n: number) => string = String) => (n > 0 ? `+${f(n)}` : n < 0 ? `-${f(-n)}` : f(0));

async function summary(args: string[]) {
  const after = args[0];
  if (!after) throw new Error(USAGE);
  const top = Number(arg(args, "--top") ?? 15);
  const baseFile = arg(args, "--base");
  const av = view(await load(after));
  const ag = groups(av);
  const total = [...ag.values()].reduce((t, g) => t + g.size, 0);
  console.log(`${after}: ${av.count} objects, ${mb(total)}`);

  type Row = { k: string; size: number; count: number; dSize: number; dCount: number };
  let rows: Row[];
  if (baseFile) {
    const bg = groups(view(await load(baseFile)));
    const baseTotal = [...bg.values()].reduce((t, g) => t + g.size, 0);
    console.log(`grew ${signed(total - baseTotal, mb)} since ${baseFile}`);
    rows = [...new Set([...ag.keys(), ...bg.keys()])]
      .map((k) => {
        const a = ag.get(k) ?? { count: 0, size: 0 };
        const b = bg.get(k) ?? { count: 0, size: 0 };
        return { k, size: a.size, count: a.count, dSize: a.size - b.size, dCount: a.count - b.count };
      })
      .filter((r) => r.dSize > 0 || r.dCount > 0);
  } else rows = [...ag].map(([k, g]) => ({ k, ...g, dSize: g.size, dCount: g.count }));

  // Engine bookkeeping (strings, compiled code, Blink and V8 internals) outweighs app objects but rarely names a leak.
  // A leak shows as an app object whose count tracks the number of times the action ran.
  const internal = (k: string) => k.startsWith("(") || k.startsWith("system /") || k.includes("::");
  const app = rows.filter((r) => !internal(r.k)).sort((x, y) => y.dCount - x.dCount || y.dSize - x.dSize);
  const engine = rows.filter((r) => internal(r.k)).sort((x, y) => y.dSize - x.dSize);
  const line = (r: Row) =>
    baseFile
      ? `${signed(r.dCount).padStart(12)}   ${signed(r.dSize, mb).padStart(11)}   ${String(r.count).padStart(6)}   ${r.k}`
      : `${String(r.count).padStart(12)}   ${mb(r.size).padStart(11)}   ${r.k}`;
  const head = baseFile ? "count change   size change      now   name" : "       count          size   name";
  const times = Number(arg(args, "--times") ?? 0);
  if (baseFile && times > 0) {
    const tracks = app.filter((r) => r.dCount >= times && r.dCount % times === 0);
    console.log(`\ngrew by a multiple of ${times}, the times the action ran: likely leaks\n${head}\n${tracks.slice(0, top).map(line).join("\n") || "  (none)"}`);
  }
  console.log(`\napp objects\n${head}\n${app.slice(0, top).map(line).join("\n") || "  (none)"}`);
  console.log(`\nengine internals, largest\n${head}\n${engine.slice(0, 3).map(line).join("\n")}`);

  const who = arg(args, "--retainers");
  if (who) {
    const path = retainerPath(av, who);
    console.log(path ? `\nwhat holds the newest ${who}:\n  (root)\n${path.map((p, i) => `${"  ".repeat(i + 2)}→ ${p}`).join("\n")}` : `\nno reachable ${who} in ${after}`);
  }
}

const [cmd, ...rest] = Bun.argv.slice(2);
const commands: Record<string, (args: string[]) => Promise<void>> = { capture, summary };
(commands[cmd ?? ""] ?? (() => Promise.reject(new Error(USAGE))))(rest).catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});
