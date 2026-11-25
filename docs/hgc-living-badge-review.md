# HGC 2026 living badge review

## Cairo source review

- `src/features/badge/BadgeConcept.tsx` builds the suspended credential, fabric straps and hardware as one rig. `src/design/concepts.css` defines the stage, scene crop, strap silhouettes and depth.
- `src/features/badge/useBadgeMotion.ts` and `idleSwing.ts` drive the pivot with a damped response and idle swing. HGC uses the same spring constants and idle frequency with a restrained amplitude, a single shared pivot, pointer response, pause and reduced-motion fallback. Offscreen and hidden stages stop updating.
- `src/app/Landing.tsx`, `src/design/landing.css` and `src/design/assets.ts` informed the white editorial layout alongside a self-contained atmospheric stage. Cairo's studio informed the light control surfaces and separate preview area. Only HGC assets appear in the HGC presentation.
- Cairo's Canvas pipeline was reviewed separately. HGC keeps its existing deterministic Canvas renderer alive when the browser-only Hanging badge is selected. The preview mode never changes the export.

## Official art and colour

The source and working JPEG both retain SHA-256 `514aab45445003f39027c083409aa93c88983223a1ed04a4f3dd613b99a321bb`. The 1080 × 449 scene PNG copies the official flyer's pixels at (0, 143). The 81 × 82 crest PNG copies the complete official HGC mark at (282, 55). Coordinates are zero-based. The PNGs retain their original colours. The rectangular crest includes a narrow margin of source artwork and is not a standalone transparent logo. Both straps repeat the crop twice, upright relative to the fabric, above the joint.

White dominates the page and studio, including under the OS dark preference. Accents and derived fabric highlights, shadows and hardware tones use white and the existing sampled RCCG indigo, red and green tokens. See `rccg-brand-research.md` for provenance.

## Verification

TypeScript, ESLint, production build and 24 unit tests were run. The Edge browser harness and its captures are in `validation/living-badge`. It covers 375, 768, 1024 and 1440 px, motion, manual pause and reduced-motion fallback, authentic strap images, the local studio upload and preview-mode switching. Square (2400 × 2400), Portrait (2400 × 3000) and Story (2160 × 3840) PNG downloads use the existing renderer. Badge motion is a web presentation feature. The exported posters are static PNGs.

I inspected the desktop comparison sheet with Cairo on the left and HGC on the right, homepage above studio. Cairo places hero copy over the pyramids and shows two credentials. HGC uses a white copy column and one suspended credential, leaving the King and white horse visible beside it. Both stages keep the straps and card on the same moving assembly. In the HGC studio the name and uploaded image appeared on the hanging credential while the print preview remained available separately.

The production build passed the Edge harness with zero HGC console errors. Each downloaded PNG matched the decoded print-preview Canvas pixel for pixel, including when downloaded in Hanging badge mode. The built flyer had the same SHA-256 as the reference. TypeScript, ESLint, the build and all 24 unit tests passed. Browser coverage used Edge viewport emulation, with no physical-device or other-browser validation.
