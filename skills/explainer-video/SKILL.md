---
name: explainer-video
description: "Make a narrated explainer video that teaches one concept: a quick 2D diagram video (HyperFrames) or a cinematic 3D one (Remotion with three.js), voiced by ElevenLabs with word-synced subtitles. Use for /explainer-video, 'make me a video explaining X', or 'help me understand X with a video'."
---

# Explainer video

Teach one concept in a 60 to 90 second narrated video. The video is code: you write the scenes, a renderer turns them into an MP4. You direct and review every shot. The renderer draws the frames.

**Ask with the question tool.** A question in a normal message goes unseen, and the thread looks done. Put every question that has two or more real options through the harness question tool, so the thread shows that it is waiting: `AskUserQuestion` on Claude Code, `request_user_input` on Codex, `AskQuestion` on Cursor. Make each question stand alone, with what you found, what blocks you, and the options. Follow the tool's own schema for how many questions and options one call takes, and put the recommended option first, marked. When there are more questions than one call takes, make back-to-back calls and never drop to prose. Ask in prose only when a question has no real options, or when the tool is missing or its call fails. Then start your message with the question, use prose for the rest of the session, and say once how to get the picker: on Codex, Plan mode or the `default_mode_request_user_input` feature flag that `/setup-jstack` sets; on Cursor, a local chat on a model that has the tool.

## Pick the mode

| Mode | Renderer | Use when | Measured on a 73 s video |
|---|---|---|---|
| **2D** (default) | HyperFrames: HTML, SVG, and GSAP | The goal is understanding. Nodes, arrows, tables, and code morph into each other. | 36 s render, 155 MB install, 6.7 MB output |
| **3D** | Remotion with React Three Fiber | A physical metaphor carries the idea, or the video should be memorable more than precise. | 46 s render, 1.2 GB install, 24 MB output |

Default to 2D. Use 3D when the user asks for it or the concept is a physical metaphor at heart. Remotion is free for individuals and small companies; larger for-profit companies need its company license. HyperFrames is Apache-2.0.

## Where it lives

Each video is its own project in `~/explainers/<slug>/`, outside every repository, because its installs run 155 MB to 1.2 GB. Put it inside a repository only when the user asks, and then in a gitignored folder (`--dir`).

```bash
bun <this skill>/scripts/new.ts 2d <slug>        # or 3d; prints the project path
```

The script copies the template, installs its pinned dependencies with `bun install --frozen-lockfile`, and copies the fonts (and GSAP for 2D) into the project. Each template is a complete, working video about heap memory leaks. Read it before writing your own: it shows every pattern below. Then replace `script.json` and the scenes.

Needs `bun` and `ffmpeg`. Each renderer downloads a headless Chrome on its first render.

## Workflow

1. **Script for the mode.** Write `script.json`: 5 to 8 scenes as `{ id, text }`, one idea per scene, about 900 characters in all. Write the narration for what the chosen mode shows. A 2D video narrates the diagram. A 3D video narrates the metaphor. Narration that names a robot the viewer never sees confuses them.
2. **One visual world.** Build one picture that evolves from scene to scene: the same objects move, grow, and change color, and the camera or layout moves between them. Never cut to an unrelated picture. A color means one thing for the whole video.
3. **Style frames.** Render a still at the key moment of each scene and look at every one yourself. Fix anything cropped, overlapping, unreadable, or off-message before the user sees it.
4. **Silent preview, then ask.** Render a silent preview with estimated timing. It is free. Show it with the script and ask the user to approve, change the look, change the script, or pick another voice. Never spend narration before this approval.
5. **Narrate.** `bun <this skill>/scripts/narrate.ts <project>` voices each scene with ElevenLabs and writes `narration.json` with per-word timings. Scene lengths then follow the voice. It skips scenes already narrated. `--redo <scene>` regenerates one, `--dry-run` prints the character cost, `--voice` and `--model` override the defaults (Matilda, `eleven_v4`). It reports the quota left. Tell the user.
6. **Render and check.** Render the final video, then extract one frame every 3.5 seconds and look at all of them: subtitles match the voice, every scene shows what is being said, nothing is cropped or broken. Check audio with `ffmpeg -i <video> -af volumedetect -vn -f null -` (peak near -1 dB, never silent). You cannot hear it, so say so.
7. **Reply** with the embedded video, its path, what each scene shows, what you checked, and the weak spots you saw.

```bash
ffmpeg -i <video> -vf "fps=1/3.5,scale=480:270,tile=4x6:padding=4" -frames:v 1 sheet.png
```

## The ElevenLabs key

`narrate.ts` reads `ELEVENLABS_API_KEY`, then `~/.config/jstack/elevenlabs.key`. Neither in place: ask the user for the key through the harness's secret prompt if it has one, and pass it to the command as `ELEVENLABS_API_KEY`. Without a secret prompt, tell the user to set the variable or create the file with `chmod 600`. Never ask for the key in chat, and never write it into the project. A key starts with `sk_`; the ID shown next to it in the dashboard is not the key.

## 2D mode

- `bun run build` writes `proj/index.html` from `scene.html`, `script.json`, and `narration.json`. `bun run render` builds and renders to `out/video.mp4`. `bun run check` runs HyperFrames' lint, runtime, and layout checks, which flag text too small to read.
- Time animations to speech, not to fixed seconds: `w("leak", "cache")` is when the word "cache" is spoken in scene `leak`. Before narration exists, word times are estimated, so the same code renders the silent preview.
- Draw shapes on with stroke animation, morph one structure into the next (the heap outline becomes the snapshot table), and keep text 28 px or larger.

## 3D mode

- `bun run still out/<name>.png --frame=<n>` renders one frame. `bun run preview` renders a silent half-resolution preview. `bun run render` renders `out/video.mp4`.
- Animate from `useCurrentFrame()` only, never from `useFrame` or timers, so every frame renders the same way every time.
- Labels are text drawn onto canvas textures (`Label` in `World.tsx`). drei's `Text` never finishes laying out glyphs in Remotion's headless render and stalls it.
- No `@react-three/postprocessing`: its `EffectComposer` renders black under Remotion. Fake glow with a wide, faint line under each bright line (`Cable`), and a CSS vignette.
- Readouts and comparisons go in 2D panels over the canvas. Labels hanging in 3D overlap each other and sink into objects.
- Keep moving subjects out of the bottom 200 px, where the subtitles sit, and inside the frame for the whole scene.
