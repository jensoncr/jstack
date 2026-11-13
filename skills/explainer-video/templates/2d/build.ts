// Builds proj/index.html from scene.html: scene timing, narration clips, and sentence subtitles.
// Without narration.json entries, word times are estimated so a silent preview can render.
const dir = import.meta.dir;
const FPS = 30;
const GAP = 0.6;
const WORDS_PER_SECOND = 2.6;

type Word = { word: string; start: number; end: number };
type Narrated = { id: string; audio: string; duration: number; words: Word[] };

const script = (await Bun.file(`${dir}/script.json`).json()) as { id: string; text: string }[];
const narration = (await Bun.file(`${dir}/narration.json`).json()) as Narrated[];

const estimate = (text: string): Narrated => {
  const words = text.split(/\s+/).map((word, i) => ({ word, start: i / WORDS_PER_SECOND, end: (i + 1) / WORDS_PER_SECOND }));
  return { id: "", audio: "", duration: words.length / WORDS_PER_SECOND, words };
};

let frame = 0;
const scenes = script.map(({ id, text }) => {
  const n = narration.find((x) => x.id === id) ?? estimate(text);
  const frames = Math.round((n.duration + GAP) * FPS);
  const s = { id, audio: n.audio, start: frame / FPS, dur: frames / FPS, words: n.words };
  frame += frames;
  return s;
});
const total = frame / FPS;

const clips: string[] = [];
for (const s of scenes) {
  if (s.audio) clips.push(`<audio id="a-${s.id}" src="assets/${s.audio}" data-start="${s.start.toFixed(3)}" data-duration="${s.dur.toFixed(3)}" data-volume="1"></audio>`);
  const sentences: Word[][] = [[]];
  for (const w of s.words) {
    sentences.at(-1)!.push(w);
    if (/[.?!]$/.test(w.word)) sentences.push([]);
  }
  const done = sentences.filter((x) => x.length);
  done.forEach((ws, i) => {
    const from = s.start + ws[0]!.start;
    const to = i + 1 < done.length ? s.start + done[i + 1]![0]!.start : s.start + s.dur;
    clips.push(`<div class="clip sub" data-start="${from.toFixed(3)}" data-duration="${(to - from).toFixed(3)}">${ws.map((w) => w.word).join(" ")}</div>`);
  });
}

const template = await Bun.file(`${dir}/scene.html`).text();
const data = scenes.map(({ id, start, words }) => ({ id, start, words: words.map((w) => [w.word, w.start]) }));
await Bun.write(
  `${dir}/proj/index.html`,
  template
    .replaceAll("__TOTAL__", total.toFixed(3))
    .replace("<!--CLIPS-->", clips.join("\n      "))
    .replace("/*SCENES*/", `const SCENES = ${JSON.stringify(data)};`),
);
console.log(`${total.toFixed(1)} s, ${scenes.length} scenes, ${narration.length ? "narrated" : "estimated timing (silent)"}`);
