import script from "../script.json";
import narration from "../narration.json";

export type SceneId = string;

export const FPS = 30;
const GAP = 0.6;

type Word = { word: string; start: number; end: number };
type Narrated = { id: SceneId; audio: string; duration: number; words: Word[] };

// Until the narration is generated, scenes are timed by an estimate of speaking speed.
const narrated = narration as Narrated[];
export const scenes = script.map((s) => {
  const n = narrated.find((x) => x.id === s.id);
  const seconds = (n?.duration ?? s.text.split(/\s+/).length / 2.6) + GAP;
  return { ...s, frames: Math.round(seconds * FPS), audio: n?.audio, words: n?.words ?? [] };
});

export const starts = scenes.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + scenes[i - 1]!.frames], []);
export const totalFrames = scenes.reduce((t, s) => t + s.frames, 0);

export function sceneAt(frame: number) {
  let i = scenes.length - 1;
  while (i > 0 && starts[i]! > frame) i--;
  const s = scenes[i]!;
  const local = frame - starts[i]!;
  return { id: s.id, index: i, local, t: Math.min(1, local / s.frames), frames: s.frames };
}

export const startOf = (id: SceneId) => starts[scenes.findIndex((s) => s.id === id)]!;
export const lengthOf = (id: SceneId) => scenes.find((s) => s.id === id)!.frames;
