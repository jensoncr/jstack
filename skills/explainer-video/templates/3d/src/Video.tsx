import { ThreeCanvas } from "@remotion/three";
import { useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, lengthOf, sceneAt, scenes, startOf, starts } from "./timeline";
import { C, World } from "./World";

function Subtitle() {
  const f = useCurrentFrame();
  const s = sceneAt(f);
  const scene = scenes[s.index]!;
  const now = s.local / FPS;
  // With narration, show the current sentence and light up words as they are spoken.
  const words = scene.words.length ? scene.words : scene.text.split(/\s+/).map((w) => ({ word: w, start: 0, end: 0 }));
  const sentences: (typeof words)[] = [[]];
  for (const w of words) {
    sentences.at(-1)!.push(w);
    if (/[.?!]$/.test(w.word)) sentences.push([]);
  }
  const current = scene.words.length ? (sentences.find((ws) => ws.length && ws.at(-1)!.end + 0.25 >= now) ?? sentences.filter((x) => x.length).at(-1)!) : words;
  return (
    <div style={{ position: "absolute", bottom: 56, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 1400, padding: "14px 30px", borderRadius: 18, background: "rgba(8,10,14,.62)", backdropFilter: "blur(8px)", fontFamily: "Inter", fontWeight: 600, fontSize: 38, lineHeight: 1.3, textAlign: "center", color: "#fff" }}>
        {current.map((w, i) => (
          <span key={i} style={{ opacity: !scene.words.length || w.start <= now ? 1 : 0.4 }}>{w.word} </span>
        ))}
      </div>
    </div>
  );
}

function Flash() {
  const f = useCurrentFrame() - startOf("snapshot");
  if (f < 0 || f > 30) return null;
  return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 3, 30], [0, 0.95, 0]) }} />;
}

function Readout() {
  const f = useCurrentFrame() - startOf("snapshot");
  const len = lengthOf("snapshot");
  if (f < 0 || f >= len) return null;
  const rows: [string, string, string][] = [
    ["user, cart, photo", "1 KB each", "held by your code"],
    ["cache", "180 MB", "held by your code"],
    ["old page × 96", "1.9 MB each", "held by cache"],
  ];
  const panel = interpolate(f, [len * 0.12, len * 0.22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 120, right: 110, width: 760, padding: "30px 36px", borderRadius: 18, background: "rgba(12,15,21,.86)", border: "1px solid rgba(255,255,255,.12)", fontFamily: "Inter", opacity: panel, transform: `translateX(${(1 - panel) * 40}px)` }}>
      <div style={{ fontWeight: 800, fontSize: 30, color: "#fff", marginBottom: 18, letterSpacing: 1 }}>HEAP SNAPSHOT</div>
      {rows.map(([name, size, held], i) => {
        const row = interpolate(f, [len * (0.25 + i * 0.12), len * (0.3 + i * 0.12)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const color = i === 2 ? C.done : C.use;
        return (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "1.3fr .9fr 1.2fr", gap: 12, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.08)", opacity: row, fontSize: 28 }}>
            <span style={{ fontWeight: 800, color }}>{name}</span>
            <span style={{ fontWeight: 600, color: "#cfd6e2" }}>{size}</span>
            <span style={{ fontWeight: 600, color: i === 2 ? C.done : C.code }}>{held}</span>
          </div>
        );
      })}
    </div>
  );
}

function Polaroid({ title, count, grew, x }: { title: string; count: number; grew?: boolean; x: number }) {
  return (
    <div style={{ position: "absolute", top: 210, left: x, width: 560, padding: "26px 26px 30px", background: "#f3efe6", borderRadius: 10, boxShadow: "0 30px 80px rgba(0,0,0,.6)", fontFamily: "Inter" }}>
      <div style={{ height: 300, borderRadius: 6, background: "#141820", display: "flex", flexDirection: "column", justifyContent: "center", padding: 36, gap: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 40, color: grew ? C.bad : C.done }}>{`old page × ${count}`}</div>
        <div style={{ fontWeight: 600, fontSize: 30, color: C.use }}>{grew ? "cache · 180 MB" : "cache · 12 MB"}</div>
        {grew && <div style={{ fontWeight: 800, fontSize: 30, color: C.bad }}>grew +84</div>}
      </div>
      <div style={{ marginTop: 20, fontWeight: 800, fontSize: 34, color: "#1a1a1a", textAlign: "center" }}>{title}</div>
    </div>
  );
}

function Compare() {
  const f = useCurrentFrame() - startOf("compare");
  const len = lengthOf("compare");
  if (f < 0) return null;
  const inA = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const inB = interpolate(f, [len * 0.18, len * 0.18 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(f, [len * 0.42, len * 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (out <= 0) return null;
  return (
    <AbsoluteFill style={{ background: `rgba(6,8,12,${0.7 * out})`, opacity: out }}>
      <div style={{ opacity: inA, transform: `translateY(${(1 - inA) * 40}px) rotate(-2deg)` }}>
        <Polaroid title="photo 1" count={12} x={300} />
      </div>
      <div style={{ opacity: inB, transform: `translateY(${(1 - inB) * 40}px) rotate(2deg)` }}>
        <Polaroid title="photo 2, later" count={96} grew x={1060} />
      </div>
    </AbsoluteFill>
  );
}

function useInter() {
  const [ready, setReady] = useState(false);
  useState(() => {
    const handle = delayRender("Inter");
    Promise.all(["600", "800"].map((w) => new FontFace("Inter", `url(${staticFile(`inter-${w}.woff`)})`, { weight: w }).load()))
      .then((faces) => {
        faces.forEach((face) => document.fonts.add(face));
        setReady(true);
        continueRender(handle);
      });
  });
  return ready;
}

export function Video() {
  const { width, height } = useVideoConfig();
  const fontsReady = useInter();
  return (
    <AbsoluteFill style={{ background: "#0a0c10" }}>
      {fontsReady && <ThreeCanvas width={width} height={height} shadows dpr={1} camera={{ fov: 42, position: [15, 9, 19], near: 0.1, far: 100 }} gl={{ antialias: true, toneMapping: 4, outputColorSpace: "srgb" }}>
        <World />
      </ThreeCanvas>}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
      <Readout />
      <Flash />
      <Compare />
      <Subtitle />
      {scenes.map((s, i) => s.audio && (
        <Sequence key={s.id} from={starts[i]!} durationInFrames={s.frames}>
          <Audio src={staticFile(s.audio)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
