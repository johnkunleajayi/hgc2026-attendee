import { event } from '../../app/event'
import { brand } from '../../styles/brand'
import { artworkDetail, drawFrame, drawMasthead, drawPortrait, drawRibbon, officialScenery } from './badgeDrawing'
import type { PosterImage } from './badgeDrawing'
import type { PosterLayout } from './posterLayout'
import type { PortraitAdjustments } from './studioModel'

export type { PosterImage } from './badgeDrawing'

export type PosterComposition = {
  layout: PosterLayout
  artwork: PosterImage
  portrait: PosterImage | null
  name: string
  adjustments: PortraitAdjustments
}

const fontFamily = '"Inter Variable", "Segoe UI", system-ui, sans-serif'

export function fitName(name: string, width: number, height: number, measure: (text: string, size: number) => number) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  for (let size = Math.min(92, Math.floor(height * 0.52)); size >= 1; size -= 1) {
    const lines: string[] = []
    let line = ''
    for (const word of name.split(/\s+/u)) {
      const pending = line ? line + ' ' + word : word
      if (measure(pending, size) <= width) {
        line = pending
        continue
      }
      if (line) lines.push(line)
      line = ''
      for (const { segment } of segmenter.segment(word)) {
        if (line && measure(line + segment, size) > width) {
          lines.push(line)
          line = ''
        }
        line += segment
      }
    }
    if (line) lines.push(line)
    if (lines.length <= 3 && lines.length * size * 1.15 <= height &&
      lines.every(text => measure(text, size) <= width)) return { lines, size }
  }
  return { lines: [], size: 1 }
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string, weight = 750) {
  ctx.font = `${weight} ${size}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.fillText(value, x, y)
}

function drawIdentity(ctx: CanvasRenderingContext2D, composition: PosterComposition) {
  const { nameplate: panel } = composition.layout
  const x = panel.x + panel.w / 2
  const unit = panel.h / 265
  const widthUnit = panel.w / 554
  const y = (offset: number) => panel.y + offset * unit
  text(ctx, event.name.toUpperCase(), x, y(21), 27 * widthUnit, brand.ink, 850)
  text(ctx, event.theme, x, y(61), 21 * widthUnit, brand.green, 800)

  const nameHeight = 84 * unit
  const nameTop = y(83)
  const fitted = fitName(composition.name || 'Your name', panel.w - 32, nameHeight, (value, size) => {
    ctx.font = `850 ${size}px ${fontFamily}`
    const metrics = ctx.measureText(value)
    return Math.max(metrics.width, (metrics.actualBoundingBoxLeft || 0) + (metrics.actualBoundingBoxRight || 0))
  })
  for (const [index, line] of fitted.lines.entries()) {
    const offset = (index - (fitted.lines.length - 1) / 2) * fitted.size * 1.15
    text(ctx, line, x, nameTop + nameHeight / 2 + offset, fitted.size, brand.ink, 850)
  }

  ctx.fillStyle = brand.ink + '40'
  ctx.fillRect(panel.x + 14, y(186), panel.w - 28, 1)
  ctx.fillRect(x - 18 * widthUnit, y(205), 1, 38 * unit)
  text(ctx, event.dates, x - panel.w * 0.265, y(226), 18 * widthUnit, brand.ink)
  text(ctx, event.venue, x + panel.w * 0.22, y(216), 20 * widthUnit, brand.ink)
  text(ctx, 'Mowe, Ogun State, Nigeria', x + panel.w * 0.22, y(241), 15 * widthUnit, brand.ink, 650)
}

export function drawPoster(canvas: HTMLCanvasElement, composition: PosterComposition) {
  const { layout, artwork, portrait, adjustments } = composition
  const { width, height, designWidth, card, photo, banner } = layout
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('Canvas rendering is unavailable.')
  const scale = width / designWidth
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.imageSmoothingQuality = 'high'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = brand.paper
  ctx.fillRect(0, 0, designWidth, height / scale)
  ctx.fillStyle = brand.ink + '16'
  ctx.fillRect(0, 0, designWidth, height / scale)
  drawFrame(ctx, card)
  drawPortrait(ctx, photo, portrait, adjustments)
  if (!portrait) text(ctx, 'YOUR PHOTO', photo.x + photo.w / 2, photo.y + photo.h / 2, 22, brand.paper)
  drawMasthead(ctx, photo, artwork)
  drawRibbon(ctx, banner)
  text(ctx, "I'M ATTENDING", banner.x + banner.w / 2, banner.y + banner.h / 2, banner.h * 0.60, brand.paper, 850)
  drawIdentity(ctx, composition)
  artworkDetail(ctx, artwork, officialScenery, layout.artwork)
}
