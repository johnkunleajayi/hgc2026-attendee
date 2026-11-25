# Cairo fidelity review

The Portrait export was built and compared first. Both applications downloaded an actual Portrait PNG using John Olukunle Ajayi and the same local portrait crop. Square and Story were adapted after inspecting the paired Portrait files. This is an implementation review awaiting project-owner visual approval.

## Read-only Cairo source trace

- `src/features/editor/Studio.tsx`, `usePosterDraft.ts`, `src/features/photo/PhotoControls.tsx`, `PhotoFrame.tsx`, `crop.ts` and `loadPhoto.ts` manage photo, crop and preview inputs.
- `src/features/portrait/PortraitConcept.tsx` and `PosterDetails.tsx` compose the DOM portrait preview with masthead, photo, ribbon, identity and scenery.
- `src/features/export/ExportControls.tsx`, `runExport.ts`, `exportRequest.ts`, `assets.ts`, `producePng.ts`, `layout.ts` and `formats.ts` validate the draft, decode assets, size and position the card, then encode the Canvas.
- `src/features/export/renderPortrait.ts`, `drawing.ts` and `text.ts` provide the rounded white frame and shadow, four-point angled header, contained logo, cover-clipped portrait, six-vertex bevelled ribbon, fitted type, split details and scenery strip.
- `src/features/export/renderBadge.ts`, `drawLanyard.ts`, `animationFrames.ts` and `src/features/badge/BadgeConcept.tsx`, `idleSwing.ts` and `useBadgeMotion.ts` implement the other Cairo experience. Its clasp and layered lanyard pivot are separate from the flat Portrait poster. HGC keeps its short reduced-motion-aware studio entrance and a stationary crop surface.

## What was adapted

`badgeDrawing.ts` adapts the Cairo rounded path, shadowed card, clipped photo, four-point masthead and six-point 4.8% bevel ribbon. `posterRenderer.ts` adapts the layer order, fitted identity block, paired location/date fields and bottom scenery. HGC uses the existing rotation-aware cover crop and a single Canvas for preview and download. `posterLayout.ts` applies Cairo's format-specific card scale and inset principle with dedicated geometry for each HGC export. Square uses smaller lateral card occupancy. Story has generous top and bottom stage margins.

The Portrait card is 610 × 946 logical units on an 800 × 1000 stage. Its 588 × 557 portrait occupies the upper card, with a 518 × 50 red ribbon crossing the lower seam. The event title, distinct theme, full-width fitted name and two-column details follow. The masthead displays the native RCCG and HGC mark region of the official flyer inside a white plate. The footer uses a native crop of its left-side scenery. The full flyer remains on the homepage. Cairo branding and imagery appear only in validation references. Drawn colours use the four existing sampled tokens, with alpha variations for depth and rules. The badge overlay crops use original, unrecoloured pixels.

## Visual comparison and limits

Review files live in `validation/cairo-fidelity/`. `equivalent-format-comparison.png` shows Cairo above HGC, with Portrait, Square and Story left to right. `portrait-native-detail.png` shows the HGC type at native pixel scale. Each pair preserves a dominant portrait, white frame, masthead angle, seam ribbon, centred identity and separate event details. HGC adds the official theme and uses a quiet tinted stage so the native flyer detail stays within the card. The same supplied concept portrait crop was resampled to 333 × 399 for Cairo's upload minimum. Its softness at full output resolution reflects the source. The screenshots include a 375px studio and desktop preview.

## Validation

| Check | Result |
| --- | --- |
| TypeScript, ESLint, production build | Passed |
| Automated frontend suite | 24 passed |
| HGC browser PNGs | Portrait 2400 × 3000, Square 2400 × 2400, Story 2160 × 3840 |
| Actual Cairo reference PNGs | Portrait 1080 × 1350, Square 1080 × 1080, Story 1080 × 1920 |
| Preview against downloads | Zero decoded channel difference in all three comparisons |
| Browser studio | No horizontal overflow at 375/768/1024/1440px. Pointer drag, zoom, rotation, reset, 60-code-point name and reduced motion checked. |
| Flyer original, working copy and production asset | SHA-256 `514aab45445003f39027c083409aa93c88983223a1ed04a4f3dd613b99a321bb` |

`verify-exports.mjs` records the Windows Edge test. It was run with a validation-only Playwright installation and the two loopback builds. Cairo remained read-only. The migrated workflow uses local image processing and static PNG output.
