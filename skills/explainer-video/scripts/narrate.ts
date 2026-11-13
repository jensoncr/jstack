#!/usr/bin/env bun
// Narrate each scene of <project>/script.json with ElevenLabs and record per-word timings in narration.json.
// Scenes already in narration.json are skipped, so a rerun only pays for new or deleted scenes.
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const USAGE = "bun narrate.ts <project> [--audio-dir <dir>] [--voice <id>] [--model <id>] [--redo <scene-id>] [--dry-run]";
const args = Bun.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const projectArg = args[0];
if (!projectArg || projectArg.startsWith("--")) {
  console.error(USAGE);
  process.exit(1);
}
const project = resolve(projectArg);
const voice = flag("--voice") ?? "XrExE9yKIg1WjnnlVkGX";
const model = flag("--model") ?? "eleven_v4";
const redo = flag("--redo");
const dryRun = args.includes("--dry-run");

type Word = { word: string; start: number; end: number };
type Narrated = { id: string; audio: string; duration: number; words: Word[] };
const script = (await Bun.file(join(project, "script.json")).json()) as { id: string; text: string }[];
const narrationPath = join(project, "narration.json");
let narration = (existsSync(narrationPath) ? await Bun.file(narrationPath).json() : []) as Narrated[];
// Audio goes where the renderer serves static files: Remotion's public/, HyperFrames' assets/.
// A fresh HyperFrames project has no assets/ yet, so its hyperframes.json decides.
const audioDir = flag("--audio-dir")
  ? resolve(project, flag("--audio-dir")!)
  : (["public", "assets"].map((d) => join(project, d)).find((d) => existsSync(d)) ??
    join(project, existsSync(join(project, "hyperframes.json")) ? "assets" : "public"));

const kept = narration.filter((n) => n.id !== redo);
const todo = script.filter((s) => !kept.some((n) => n.id === s.id));
const chars = todo.reduce((t, s) => t + s.text.length, 0);
console.log(`${todo.length} scene(s) to narrate, ${chars} characters, audio into ${audioDir}`);
if (todo.length === 0 && !dryRun) process.exit(0);

function apiKey(): string {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const file = join(homedir(), ".config", "jstack", "elevenlabs.key");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  console.error(`No ElevenLabs key. Set ELEVENLABS_API_KEY, or save the key (it starts with sk_) to ${file} with chmod 600.`);
  process.exit(2);
}
const key = apiKey();
async function quota(): Promise<{ left: number; limit: number }> {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key } });
  if (!res.ok) {
    console.error(`ElevenLabs rejected the key: ${res.status} ${(await res.text()).slice(0, 200)}`);
    process.exit(2);
  }
  const q = (await res.json()) as { character_count: number; character_limit: number };
  return { left: q.character_limit - q.character_count, limit: q.character_limit };
}
const before = await quota();
if (dryRun) {
  console.log(`ElevenLabs quota: ${before.left} of ${before.limit} characters left`);
  process.exit(0);
}

// The real file length, so the renderer never schedules audio past its end.
function audioSeconds(file: string): number | undefined {
  const probe = Bun.spawnSync(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  const seconds = Number(probe.stdout.toString().trim());
  return probe.exitCode === 0 && seconds > 0 ? seconds : undefined;
}

mkdirSync(audioDir, { recursive: true });
if (redo) {
  const old = narration.find((n) => n.id === redo);
  if (old && existsSync(join(audioDir, old.audio))) unlinkSync(join(audioDir, old.audio));
  narration = kept;
}

for (const s of todo) {
  const i = script.indexOf(s);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({ text: s.text, model_id: model, previous_text: script[i - 1]?.text, next_text: script[i + 1]?.text }),
  });
  if (!res.ok) {
    console.error(`${s.id}: ElevenLabs ${res.status} ${(await res.text()).slice(0, 300)}`);
    process.exit(1);
  }
  const body = (await res.json()) as { audio_base64: string; alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } };
  const audio = `vo-${s.id}.mp3`;
  await Bun.write(join(audioDir, audio), Buffer.from(body.audio_base64, "base64"));

  const a = body.alignment;
  const words: Word[] = [];
  let current = "";
  let start = 0;
  a.characters.forEach((c, k) => {
    if (c === " ") {
      if (current) words.push({ word: current, start, end: a.character_end_times_seconds[k - 1]! });
      current = "";
      return;
    }
    if (!current) start = a.character_start_times_seconds[k]!;
    current += c;
  });
  if (current) words.push({ word: current, start, end: a.character_end_times_seconds.at(-1)! });

  narration.push({ id: s.id, audio, duration: audioSeconds(join(audioDir, audio)) ?? a.character_end_times_seconds.at(-1)!, words });
  narration.sort((x, y) => script.findIndex((q) => q.id === x.id) - script.findIndex((q) => q.id === y.id));
  await Bun.write(narrationPath, `${JSON.stringify(narration, null, 1)}\n`);
  console.log(`${s.id}: ${narration.find((n) => n.id === s.id)!.duration.toFixed(2)} s, ${words.length} words`);
}

// ElevenLabs' own counter lags by a minute or more, so subtract what this run sent.
console.log(`ElevenLabs quota: about ${before.left - chars} of ${before.limit} characters left`);
