---
name: explainer-video
description: "Teach a concept with a narrated explainer video, from caching to heaps to how a rocket reaches orbit. Researches the concept, designs the explanation, and renders it as a 2D diagram video (HyperFrames) or a 3D one (Remotion with three.js), voiced by ElevenLabs with word-synced subtitles. Use for /explainer-video, 'make me a video explaining X', or 'help me understand X'."
---

# Explainer video

The goal is that the viewer understands the concept well enough to reason with it: predict what happens in a case the video never showed. A pretty video that leaves them able to repeat words but not predict anything has failed. Run start to finish without stopping for approval, and hand back the finished video.

## 1. Understand it yourself first

You cannot teach what you only half know, and a confident wrong explanation is worse than none.

- Research the concept from primary sources before writing a word: the spec, the official docs, the source code, a textbook, the original paper. For a software concept in the user's project, read the code that implements it there.
- Write down, privately: the problem it solves, the core mechanism in one sentence, the one or two numbers that give it scale (a read from memory takes nanoseconds and a round trip across a network milliseconds; an orbital rocket is roughly 90% propellant by mass), the main tradeoff, and the most common misconception.
- Verify every number and claim you will put on screen. Say where a figure is approximate.

## 2. Design the explanation

Find the one mental model that makes the rest obvious, then order everything so each step needs only what came before.

- **Problem before mechanism.** Open with the situation that makes the concept necessary: the slow request, the program that runs out of memory, the rocket that can't carry enough fuel. A viewer who feels the problem wants the answer.
- **The naive attempt.** Show the obvious approach and exactly why it fails. The real idea lands as the fix.
- **One core model.** Choose one picture or metaphor that maps faithfully onto the mechanism, and keep it for the whole video. Say where it breaks down, once, when it matters.
- **Concrete before abstract.** Walk one specific example with real values step by step, then generalize. Show the formula or the code only after the intuition, as a label on what the viewer already saw.
- **Cause and effect on screen.** Every change in the picture has a visible reason, and the narration says why while the picture shows what. With the sound off, the picture should still teach.
- **Contrast.** Show with and without: cached vs uncached, a reference cut vs kept, a single stage vs staged.
- **Name the misconception** and show why it's wrong.
- **Earn every term.** Define each piece of jargon the first time, in plain words, and only once the viewer needs it.
- **End on use.** A one-sentence summary, then a short "so now you can predict" moment: pose a case and show the answer.

Shape it to the kind of concept:

| Kind | Examples | What makes it click |
|---|---|---|
| A software mechanism | caching, the heap, a hash map, TCP | State changing over time. Show the data structure step by step through one concrete run, then the failure case, then the real code it maps to. |
| A system or architecture | a CDN, a database index, a build pipeline | Follow one request or item through the parts, then show what each part buys and costs. |
| Physical or engineering | a rocket reaching orbit, a jet engine, a bridge | Forces and quantities with real numbers, and the tradeoff that drives the design (the rocket equation makes every kilogram cost fuel). Usually 3D. |
| Math or an algorithm | gradient descent, Big-O, Bayes' rule | Build visual intuition first, then reveal the formula as a description of the picture. |
| History or a "why" | why JavaScript has two equality operators | The constraint at the time, the decision, and its consequences. |

Length follows the concept: as long as it takes to reach real understanding, without padding. A concept too big for one video (how to build a rocket) becomes a short series, one core idea per episode, each building on the last. Say so in the reply.

## 3. Write the script

- Conversational and second person. Short sentences. One idea per sentence.
- One idea per scene. A scene starts where the picture needs to change.
- Write for what the chosen mode shows. A 2D video narrates its diagram, a 3D video its metaphor. Never name something the viewer can't see.
- Let the key moments breathe: leave a beat after a reveal rather than talking over it.
- Read it back as the viewer: if a sentence uses an idea not yet shown, reorder.

## 4. Pick the mode

| Mode | Renderer | Use when | Measured on one 73 s video |
|---|---|---|---|
| **2D** (default) | [HyperFrames](https://github.com/heygen-com/hyperframes): HTML, SVG, and GSAP | Mechanisms, systems, math, and code: nodes, arrows, tables, and code morph into each other. | 36 s render, 155 MB install, 6.7 MB output |
| **3D** | [Remotion](https://www.remotion.dev) with React Three Fiber | Physical and engineering concepts, or when a physical metaphor carries the idea. | 46 s render, 1.2 GB install, 24 MB output |

Remotion is free for individuals and small companies; larger for-profit companies need its company license. HyperFrames is Apache-2.0. Learn each renderer from its own agent guidance, not from memory: HyperFrames' skills (its plugin, which `hyperframes init` also points to in the project's `AGENTS.md`) and [Remotion's skills](https://github.com/remotion-dev/skills).

## 5. Build it

Each video is its own project in `~/explainers/<slug>/`, outside every repository, because its installs run 155 MB to 1.2 GB. Put it inside a repository only when the user asks, and then in a gitignored folder. Scaffold with the renderer's own CLI (`bunx hyperframes init`, or Remotion's `create-video` plus `@remotion/three`, `@react-three/fiber`, `@react-three/drei`, and `three`), and pin exact versions. Use bun, and `ffmpeg` for frame checks.

- `script.json` in the project root: scenes as `[{ "id": "leak", "text": "A leak is..." }]`.
- Narrate early: `bun <this skill>/scripts/narrate.ts <project>` voices each scene with ElevenLabs into the renderer's static folder (`public/` or `assets/`, or `--audio-dir`) and writes `narration.json`: per scene `{ id, audio, duration, words: [{ word, start, end }] }`, times in seconds from the scene's start. It skips scenes already narrated; `--redo <scene>` regenerates one after a script change, `--dry-run` prints the cost and the quota left, and `--voice` and `--model` override the defaults (Matilda, `eleven_v4`).
- Scene length is its narration's duration plus a 0.6 s gap. Time every animation from these values, never from hand-typed seconds, so the picture follows the voice.
- **One visual world.** One picture that evolves from scene to scene: the same objects move, grow, and change color, and the camera or layout moves between them. Never cut to an unrelated picture. A color means one thing for the whole video.
- **Subtitles.** One sentence at a time near the bottom, each word lit as it is spoken from `words[].start`, 40 px on a translucent dark pill. Keep moving subjects out of the bottom 200 px.

## 6. Review it as a teacher

1. Render a still at the key moment of each scene and look at each: does it show the idea the narration is stating right then, and is anything cropped, overlapping, or unreadable? Fix and re-render.
2. Render the final video, then look at one frame every 3.5 seconds: subtitles match the voice, nothing is broken. Check audio with `ffmpeg -i <video> -af volumedetect -vn -f null -` (peak near -1 dB, never silent). You cannot hear it, so say so.
3. Watch it as someone new to the concept, from the frames and the script: where would they get lost, which term arrives unexplained, which step is skipped? Fix those and render again.

```bash
ffmpeg -i <video> -vf "fps=1/3.5,scale=480:270,tile=4x6:padding=4" -frames:v 1 sheet.png
```

Reply with the embedded video and its path, the mental model it builds, the one-sentence takeaway, the sources you checked, what you checked in the render, the ElevenLabs quota left, and what you'd improve.

## The ElevenLabs key

`narrate.ts` reads `ELEVENLABS_API_KEY`, then `~/.config/jstack/elevenlabs.key`. If neither exists, get the key through the harness's secret prompt if it has one and pass it to the command as `ELEVENLABS_API_KEY`. Without a secret prompt, tell the user to set the variable or create the file with `chmod 600`. Never ask for the key in chat, and never write it into the project. A key starts with `sk_`; the ID shown next to it in the dashboard is not the key.

## 2D pitfalls

- Cue animations on spoken words: a helper like `w("leak", "cache")` returns when "cache" is spoken in scene `leak`.
- Draw shapes on with stroke animation and morph one structure into the next (the heap outline becomes the snapshot table) instead of fading between slides.
- Keep text 28 px or larger. HyperFrames' `check` command flags text too small to read.

## 3D pitfalls

- Animate from `useCurrentFrame()` only, never from `useFrame` or timers, so every frame renders the same way every time.
- Draw labels as text on a canvas texture mapped onto a plane, after the font has loaded (`FontFace.load()` behind a `delayRender`). drei's `Text` never finishes laying out glyphs in Remotion's headless render and stalls it.
- No `@react-three/postprocessing`: its `EffectComposer` renders black under Remotion. Fake glow with a wide, faint copy of each bright line, and a CSS vignette.
- Readouts and comparisons go in 2D panels over the canvas. Labels hanging in 3D overlap each other and sink into objects.
- Move the camera between per-scene keyframes with easing. Never cut.
