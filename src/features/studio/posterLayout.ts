import type { PosterFormat } from './studioModel'

export type Box = { x: number; y: number; w: number; h: number }
const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h })

export type PosterLayout = {
  designWidth: number
  width: number
  height: number
  card: Box
  photo: Box
  banner: Box
  artwork: Box
  nameplate: Box
}

// Each output reserves its own stage around the card, following Cairo's format
// specific centring and scale rather than cropping an exported Portrait PNG.
export const posterLayouts = {
  square: {
    designWidth: 1200, width: 2400, height: 2400, card: box(260, 70, 680, 1060),
    photo: box(272, 82, 656, 620), banner: box(308, 669, 584, 52),
    artwork: box(272, 1055, 656, 63), nameplate: box(291, 733, 618, 306),
  },
  portrait: {
    designWidth: 800, width: 2400, height: 3000, card: box(95, 27, 610, 946),
    photo: box(106, 38, 588, 557), banner: box(141, 563, 518, 50),
    artwork: box(106, 906, 588, 54), nameplate: box(123, 625, 554, 265),
  },
  story: {
    designWidth: 1080, width: 2160, height: 3840, card: box(84, 240, 912, 1420),
    photo: box(99, 255, 882, 835), banner: box(148, 1045, 784, 72),
    artwork: box(99, 1555, 882, 90), nameplate: box(125, 1135, 830, 406),
  },
} satisfies Record<PosterFormat['id'], PosterLayout>
