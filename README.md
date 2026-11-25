# HGC 2026 Attendee Poster Generator

Create a browser-only attendee living badge for RCCG Holy Ghost Congress 2026. The studio previews the official heavenly artwork, branded lanyard and personalised credential.

## Run locally

```powershell
Set-Location 'C:\hgc2026-attendee'
npm.cmd ci
npm.cmd run dev
```

Open the Vite URL, then choose **Create My Poster**. Enter your name and choose or drop a JPEG, PNG or WebP file up to 10 MB and 32 megapixels. Select a format, frame your portrait by dragging or using the keyboard-accessible sliders, and download a still PNG or an animated GIF or MP4 where supported. Photos are held in route memory and processed in the browser. The retired white-polo workflow and backend are outside the current product.

| Format | PNG dimensions |
| --- | --- |
| Square | 2400 × 2400 |
| Portrait | 2400 × 3000 |
| Story | 2160 × 3840 |

## Validate

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

See the [living badge export guide](docs/living-badge-export-system.md), [architecture](docs/architecture.md), [RCCG brand research](docs/rccg-brand-research.md), [original asset provenance](docs/visual-reference-analysis.md), and [project direction](docs/milestones.md).

## Migration validation

TypeScript, ESLint, production build and 24 frontend tests passed. The browser comparison used the existing Cairo build read-only. HGC homepage and studio had no horizontal overflow at 375, 768, 1024 and 1440 px. Browser downloads were decoded and visually reviewed at 2400 × 2400, 2400 × 3000 and 2160 × 3840. Review samples are in `validation/` and use a transient portrait crop from the supplied studio concept. Browser checks exercised keyboard crop and reset. Pointer movement was verified in automated integration tests, and the compiled reduced-motion rules were inspected in the browser. The official source, working copy and build asset shared the expected SHA-256.
