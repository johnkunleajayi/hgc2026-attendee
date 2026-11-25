# Architecture

React, TypeScript, Vite and Tailwind implement the local frontend. Routes are `/` and `/create`. Cairo Dreamin’ is a read-only design and functional reference. Its editorial hero, editor and sticky preview split, cover-based crop and layered Canvas output informed this implementation. The HGC workflow is attendee-only with three static PNG formats.

`useStudio` owns a validated Unicode name, decoded original photo, crop and format. Signature, MIME, a 10 MB limit, browser decode and a 32-megapixel limit protect the workflow. Temporary object URLs are released at replacement, removal, rejection or unmount. There is no persistent attendee storage or photo network request.

`portraitCrop.ts` calculates a uniform cover scale for the viewport in the rotated photo's coordinate space and limits displacement to available crop travel. Dragging maps CSS pixels and rotation to the same state as the sliders. At minimum zoom one axis can have no spare travel. Zoom in to create more room for adjustment. `posterLayout.ts` defines three independent credential stages. The Canvas renderer follows the Cairo Portrait layer order with a framed HGC card, clipped portrait, angled header, bevelled ribbon, fitted name and event details. Native flyer crops supply the mark region and lower artwork strip. The homepage presents the full original flyer. See [the fidelity review](cairo-fidelity-review.md).

`usePoster` coalesces redraws with animation frames. CSS scales the high-resolution canvas for the responsive preview and `toBlob` encodes that same canvas for PNG downloads. Unicode glyphs outside Inter use system fonts. A larger export does not add detail to a low-resolution photo or the 1080px source artwork.

`src/styles/brand.ts` owns both CSS and Canvas RGB channels. The interface follows the operating system’s colour and reduced-motion preferences. The previous AI provider, networking and Python backend were retired. The pre-existing local credential and extracted crest were preserved separately from the frontend. Review and revoke or remove the obsolete API credential through its provider account when appropriate.
