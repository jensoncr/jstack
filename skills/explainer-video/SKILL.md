---
name: explainer-video
description: "Teach a concept with a narrated explainer video, from caching to heaps to how a rocket reaches orbit. Researches the concept, designs the explanation, and builds the video in code with whatever renderer shows it best, voiced by ElevenLabs with word-synced subtitles. Use for /explainer-video, 'make me a video explaining X', or 'help me understand X'."
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

Length follows the concept: as long as it takes to reach real understanding, without padding. A concept too big for one video (how to build a rocket) becomes a short series, one core idea per episode, each building on the last. A survey of many parts (a whole tech stack, a field) still needs one model that ties the parts together; follow one thing through all of them, and offer deep dives on single parts in the reply.

## 3. Write the script

- Conversational and second person. Short sentences. One idea per sentence.
- One idea per scene. A scene starts where the picture needs to change.
- Write for what the picture will show: narrate the diagram, or the metaphor. Never name something the viewer can't see.
- Let the key moments breathe: leave a beat after a reveal rather than talking over it.
- Read it back as the viewer: if a sentence uses an idea not yet shown, reorder.

## 4. Choose the tools

The video is code: you write the scenes and a renderer turns them into frames. Pick the tools that best show this concept, read their current docs or agent skills rather than working from memory, and add whatever imports the scenes need. Pin exact versions. Use a renderer's own skill for how the tool works; where its workflow conflicts with this skill (asking you to pick a storyline, waiting for approval, a usage beacon), this skill wins: decide, keep going, and send no telemetry.

Starting points that worked:

| Tool | Good for | Measured on one 73 s video |
|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML, SVG, GSAP) | Diagrams that morph: mechanisms, systems, code, tables | 36 s render, 155 MB install |
| [Remotion](https://www.remotion.dev) with React Three Fiber | 3D scenes with a moving camera: physical ideas and physical metaphors | 46 s render, 1.2 GB install |
| [Manim](https://www.manim.community) | Math: equations and plots that transform | not measured |
| Blender, driven by Python | Photoreal 3D, when hours of rendering are acceptable | not measured |

Combine them when it helps: a 3D scene with 2D panels over it, a real diagram inside a 3D world. Remotion needs a company license for larger for-profit companies; say so if it applies.

Each video is its own project in `~/explainers/<slug>/`, outside every repository, because its installs run to gigabytes. Put it inside a repository only when the user asks, and then in a gitignored folder.

## 5. Make it look good

- **One visual world.** One picture that evolves from scene to scene: the same objects move, grow, and change color, and the camera or layout moves between them. Never cut to an unrelated picture.
- **A small palette with fixed meanings.** Three or four colors, each meaning one thing for the whole video (in use, done with, trouble), on a dark background with high contrast.
- **Motion with intent.** Ease every move. Draw things on, grow them, morph one structure into the next; avoid fading between static slides. Move one thing at a time so the eye knows where to look.
- **Depth and light in 3D.** Soft shadows, a key light and a rim light, rounded edges, slightly glossy materials. Ease the camera between positions; never cut.
- **Readable at a glance.** Labels sit on or beside the thing they name, never floating loose. Text at least 28 px at 1080p as it appears on screen, after any camera zoom. Comparisons and readouts go in flat panels over the scene.
- **Build assets from code.** Shapes, geometry, and diagrams drawn in code stay crisp and change with the script. Use outside images or models only when the concept needs the real thing, and only with a license that allows it.
- **1080p at 30 fps** unless the user wants otherwise.

## 6. Sync it to the voice

Narrate early, so the picture can follow the voice instead of guessing:

- Write the scenes to `script.json` in the project root: `[{ "id": "leak", "text": "A leak is..." }]`.
- `bun <this skill>/scripts/narrate.ts <project>` voices each scene with ElevenLabs and writes `narration.json`: per scene `{ id, audio, duration, words: [{ word, start, end }] }`, times in seconds from the scene's start. It puts the audio in `public/` or `assets/` if the project has one, or wherever `--audio-dir` says. It skips scenes already narrated; `--redo <scene>` regenerates one after a script change, `--dry-run` prints the cost and the quota left, and `--voice` and `--model` override the defaults (Matilda, `eleven_v4`).
- Make each scene as long as its narration plus a short beat, and time every animation from the word timings: start a move on the word that names it. Never hand-type seconds. A small build script that reads `narration.json` and writes the scene starts, audio clips, and subtitle cues into the composition keeps this exact after every `--redo`.
- Subtitles show one sentence at a time near the bottom, or one phrase when a sentence runs past two lines, each word lit as it is spoken. Keep moving subjects clear of them.

## 7. Review it as a teacher

1. Render a still at the key moment of each scene and look at each: does it show the idea the narration is stating right then, and is anything cropped, overlapping, or unreadable? Fix and re-render.
2. Render the final video, then look at one frame every 3.5 seconds: subtitles match the voice, nothing is broken. Check audio with `ffmpeg -i <video> -af volumedetect -vn -f null -` (peak near -1 dB, never silent). You cannot hear it, so say so.
3. Watch it as someone new to the concept, from the frames and the script: where would they get lost, which term arrives unexplained, which step is skipped? Fix those and render again.

```bash
# rows = video seconds / 3.5 / 6, rounded up
ffmpeg -i <video> -vf "fps=1/3.5,scale=480:270,tile=6x<rows>:padding=4" -frames:v 1 sheet.png
```

Reply with the embedded video and its path, the mental model it builds, the one-sentence takeaway, the sources you checked, what you checked in the render, the ElevenLabs quota left, and what you'd improve.

## The ElevenLabs key

`narrate.ts` reads `ELEVENLABS_API_KEY`, then `~/.config/jstack/elevenlabs.key`. If neither exists, get the key through the harness's secret prompt if it has one and pass it to the command as `ELEVENLABS_API_KEY`. Without a secret prompt, tell the user to set the variable or create the file with `chmod 600`. Never ask for the key in chat, and never write it into the project. A key starts with `sk_`; the ID shown next to it in the dashboard is not the key.

## Known traps

- Remotion: animate from `useCurrentFrame()` only, never from `useFrame` or timers, or frames render differently each time.
- Remotion with three.js: drei's `Text` never finishes laying out glyphs in the headless render and stalls it. Draw labels as text on a canvas texture after the font has loaded.
- Remotion with three.js: `@react-three/postprocessing` renders black. Fake glow with a wide, faint copy of each bright line, and a CSS vignette.
- 3D labels hanging in space overlap each other and sink into objects. Put readouts in 2D panels over the canvas.
- HyperFrames: its `check` command flags text too small to read and stretches where nothing moves.
