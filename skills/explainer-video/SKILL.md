---
name: explainer-video
description: "Make a narrated explainer video that teaches one concept: a quick 2D diagram video (HyperFrames) or a cinematic 3D one (Remotion with three.js), voiced by ElevenLabs with word-synced subtitles. Use for /explainer-video, 'make me a video explaining X', or 'help me understand X with a video'."
---

# Explainer video

Teach one concept in a narrated video, as long as the concept needs. The video is code: you write the scenes, a renderer turns them into an MP4. You direct and review every shot. The renderer draws the frames.

## Pick the mode

| Mode | Renderer | Use when | Measured on one 73 s video |
|---|---|---|---|
| **2D** (default) | [HyperFrames](https://github.com/heygen-com/hyperframes): HTML, SVG, and GSAP | The goal is understanding. Nodes, arrows, tables, and code morph into each other. | 36 s render, 155 MB install, 6.7 MB output |
| **3D** | [Remotion](https://www.remotion.dev) with React Three Fiber | A physical metaphor carries the idea, or the video should be memorable more than precise. | 46 s render, 1.2 GB install, 24 MB output |

Default to 2D. Use 3D when the user asks for it or the concept is a physical metaphor at heart. Remotion is free for individuals and small companies; larger for-profit companies need its company license. HyperFrames is Apache-2.0.

Learn each renderer from its own agent guidance, not from memory: HyperFrames' skills (its plugin, which `hyperframes init` also points to in the project's `AGENTS.md`) and [Remotion's skills](https://github.com/remotion-dev/skills).

## Where it lives

Each video is its own project in `~/explainers/<slug>/`, outside every repository, because its installs run 155 MB to 1.2 GB. Put it inside a repository only when the user asks, and then in a gitignored folder. Scaffold with the renderer's own CLI (`bunx hyperframes init`, or Remotion's `create-video` plus `@remotion/three`, `@react-three/fiber`, `@react-three/drei`, and `three`), and pin exact versions. Use bun, and `ffmpeg` for frame checks.

## The data

- `script.json` in the project root: scenes as `[{ "id": "leak", "text": "A leak is..." }]`, one idea per scene.
- `narration.json`, written by `narrate.ts`: per scene `{ id, audio, duration, words: [{ word, start, end }] }`, times in seconds from the scene's start. Until it exists, estimate: 2.6 words per second, so the silent preview renders with the same code.
- Scene length is its narration's duration plus a 0.6 s gap. Time every animation from these values, never from hand-typed seconds, so the picture follows the voice.

## Workflow

1. **Script for the mode.** Write the narration for what the chosen mode shows. A 2D video narrates the diagram. A 3D video narrates the metaphor. Narration that names a robot the viewer never sees confuses them.
2. **One visual world.** Build one picture that evolves from scene to scene: the same objects move, grow, and change color, and the camera or layout moves between them. Never cut to an unrelated picture. A color means one thing for the whole video.
3. **Style frames.** Render a still at the key moment of each scene and look at every one yourself. Fix anything cropped, overlapping, unreadable, or off-message before the user sees it.
4. **Silent preview, then ask.** Render a silent preview with estimated timing. It is free. Show it with the script, and ask the user with the harness question tool to approve, change the look, change the script, or pick another voice. Never spend narration before this approval.
5. **Narrate.** `bun <this skill>/scripts/narrate.ts <project>` voices each scene with ElevenLabs into the renderer's static folder (`public/` or `assets/`, or `--audio-dir`) and writes `narration.json`. It skips scenes already narrated. `--redo <scene>` regenerates one, `--dry-run` prints the character cost and the quota left without changing anything, which also confirms the key works, and `--voice` and `--model` override the defaults (Matilda, `eleven_v4`). Tell the user the quota left.
6. **Render and check.** Render the final video, then extract one frame every 3.5 seconds and look at all of them: subtitles match the voice, every scene shows what is being said, nothing is cropped or broken. Check audio with `ffmpeg -i <video> -af volumedetect -vn -f null -` (peak near -1 dB, never silent). You cannot hear it, so say so.
7. **Reply** with the embedded video, its path, what each scene shows, what you checked, and the weak spots you saw.

```bash
ffmpeg -i <video> -vf "fps=1/3.5,scale=480:270,tile=4x6:padding=4" -frames:v 1 sheet.png
```

## Subtitles

Show one sentence at a time, near the bottom, and light up each word as it is spoken from `words[].start`. Keep 40 px text on a translucent dark pill. Keep moving subjects out of the bottom 200 px.

## The ElevenLabs key

`narrate.ts` reads `ELEVENLABS_API_KEY`, then `~/.config/jstack/elevenlabs.key`. Neither in place: ask the user for the key through the harness's secret prompt if it has one, and pass it to the command as `ELEVENLABS_API_KEY`. Without a secret prompt, tell the user to set the variable or create the file with `chmod 600`. Never ask for the key in chat, and never write it into the project. A key starts with `sk_`; the ID shown next to it in the dashboard is not the key.

## 2D pitfalls

- Cue animations on spoken words: a helper like `w("leak", "cache")` returns when "cache" is spoken in scene `leak`. It reads the most precise timing the data has.
- Draw shapes on with stroke animation and morph one structure into the next (the heap outline becomes the snapshot table) instead of fading between slides.
- Keep text 28 px or larger. HyperFrames' `check` command flags text too small to read.

## 3D pitfalls

- Animate from `useCurrentFrame()` only, never from `useFrame` or timers, so every frame renders the same way every time.
- Draw labels as text on a canvas texture mapped onto a plane, after the font has loaded (`FontFace.load()` behind a `delayRender`). drei's `Text` never finishes laying out glyphs in Remotion's headless render and stalls it.
- No `@react-three/postprocessing`: its `EffectComposer` renders black under Remotion. Fake glow with a wide, faint copy of each bright line, and a CSS vignette.
- Readouts and comparisons go in 2D panels over the canvas. Labels hanging in 3D overlap each other and sink into objects.
- Move the camera between per-scene keyframes with easing. Never cut.
