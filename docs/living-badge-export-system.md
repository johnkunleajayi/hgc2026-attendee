# HGC 2026 living badge exports

## Cairo reference

Cairo's `src/features/export/ExportControls.tsx` selects file type and layout and exposes job progress, cancellation and errors. `formats.ts` defines 1080 × 1080, 1080 × 1350 and 1080 × 1920. `mediaSettings.ts` offers PNG for both Cairo designs and GIF and MP4 for its badge. Cairo PNG and MP4 use full Cairo dimensions, and GIF uses half. `exportRequest.ts`, `runExport.ts` and `download.ts` handle validation, names, status and browser hand-off. `producePng.ts` draws the still to Canvas and encodes it with `toBlob`. `animationFrames.ts` caches the scenery and credential and renders the badge at deterministic timestamps. Cairo uses worker-based gifenc with a fixed palette and delta frames and WebCodecs H.264 with Mediabunny for MP4. Its animation is six seconds at 12.5 fps for GIF or 30 fps for MP4.

## HGC scene

`sceneModel.ts` defines output dimensions, crop, pivot, portrait area and time-to-angle mapping. `renderScene.ts` uses attendee name, decoded photo, crop settings and official assets. It rasterizes the credential, straps and hardware as one assembly, with the authentic crest drawn twice on each strap. It transforms that assembly around its top pivot against the fixed heavenly scene. All art crops and the original flyer are unchanged. UI and decorative colours come from `rccg-brand-research.md`.

The studio Canvas and all encoders call this renderer. The homepage keeps its existing promotional DOM animation. PNG uses the three-degree resting pose, which matches a paused or reduced-motion studio preview. The studio loop uses two restrained swings per six seconds. Reduced motion keeps the preview still and lets visitors choose animated downloads explicitly. Each export snapshots the name, current photo and crop, and selected ratio.

| Composition | PNG still | GIF, 12.5 fps, infinite repeat | MP4, 30 fps, H.264 |
| --- | --- | --- | --- |
| Square | 2400 × 2400 | 600 × 600 | 1200 × 1200 |
| Portrait | 2400 × 3000 | 600 × 750 | 1200 × 1500 |
| Story | 2160 × 3840 | 540 × 960 | 1080 × 1920 |

## Encoding and safeguards

PNG uses the browser's Canvas encoder. GIF adapts Cairo's gifenc 1.0.3 worker (8.5 kB built), transfers one frame at a time and uses a shared palette of up to 255 colours plus a transparent delta index. MP4 uses Cairo's Mediabunny 1.66.2 adapter with native H.264 and fast-start muxing. The MP4 chunk is about 56 kB gzip. It loads for the capability probe on secure pages with WebCodecs. The probe checks H.264 at the chosen dimensions. Unsupported formats are disabled with an explanation. There is no format substitution.

Frames are generated on demand for the six-second timeline. The browser allocates temporary Canvas buffers and accumulated compressed output. Cancellation terminates the GIF worker or cancels unfinished MP4 muxing. The studio prevents concurrent exports, shows progress and errors, releases temporary buffers and object URLs, and suspends preview animation offscreen or when the document is hidden. All photo processing stays in the browser.

## Reproduce validation

From the project folder, run `npm.cmd run build` and `npm.cmd run preview -- --host 127.0.0.1 --port 4187`. In a second shell, run `node validation/living-badge-exports/verify.mjs` and `python validation/living-badge-exports/check_media.py`. The harness uses local Edge, the project's existing validation copy of Playwright Core and Pillow. Review the files under `validation/living-badge-exports`. The contact sheet has Square, Portrait and Story rows. Each row shows the PNG, three GIF frames and three MP4 frames, in that order.

## Validation results

TypeScript, ESLint, all 24 unit tests and the Vite production build passed. Edge production preview passed at 375, 768, 1024 and 1440 px for all three ratios. The harness checked local upload, name entry, drag and reset, reduced motion, pause, GIF cancellation, and disabled GIF and MP4 under simulated missing capabilities. No HGC browser console errors were recorded.

All nine files were downloaded and decoded. PNG dimensions match the table. GIFs contain 75 frames, 6 seconds and infinite looping. MP4s use the MP4 container, H.264 video, 180 frames, 6 seconds and 30 fps. Peak frames from both animated formats matched the corresponding preview frames within the format-specific tolerances. Visual inspection confirmed the scenery, connected hardware, branded straps, photo and name in all three ratios. The resized PNG-to-preview mean RGB differences were 0.78, 0.74 and 0.61 on a 255-level scale for Square, Portrait and Story. Animated file sizes ranged from 2.35 to 4.56 MB for the supplied validation portrait. File sizes and encoding time vary with hardware and photo content.

The official JPEG source, working copy and built asset all retained SHA-256 514aab45445003f39027c083409aa93c88983223a1ed04a4f3dd613b99a321bb. Browser testing used Edge and viewport emulation. Other browser engines and physical mobile devices were not tested.

See [Redeemed Anthem integration](living-badge-music.md) for the MP4 audio track and website music controls.
