import { brand } from '../../styles/brand'
import { portraitCrop } from './portraitCrop'
import type { Box } from './posterLayout'
import type { PortraitAdjustments } from './studioModel'

export type PosterImage = { source: CanvasImageSource; width: number; height: number }

export function roundPath(ctx: CanvasRenderingContext2D, box: Box, radius: number) {
  ctx.beginPath()
  ctx.roundRect(box.x, box.y, box.w, box.h, radius)
}

export function plate(ctx: CanvasRenderingContext2D, box: Box, color: string, radius: number) {
  ctx.fillStyle = color
  roundPath(ctx, box, radius)
  ctx.fill()
}

export function drawFrame(ctx: CanvasRenderingContext2D, card: Box) {
  ctx.save()
  ctx.shadowColor = brand.ink + '40'
  ctx.shadowBlur = 24
  ctx.shadowOffsetX = 4
  ctx.shadowOffsetY = 13
  plate(ctx, card, brand.paper, 16)
  ctx.restore()
  roundPath(ctx, card, 16)
  ctx.strokeStyle = brand.ink + '35'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

export function drawPortrait(ctx: CanvasRenderingContext2D, box: Box, image: PosterImage | null, adjustment: PortraitAdjustments) {
  plate(ctx, box, brand.ink, 9)
  if (!image) return
  const crop = portraitCrop(image.width, image.height, box.w, box.h, adjustment)
  ctx.save()
  roundPath(ctx, box, 9)
  ctx.clip()
  ctx.translate(box.x + box.w / 2, box.y + box.h / 2)
  ctx.rotate(crop.angle)
  ctx.drawImage(image.source, crop.left, crop.top, crop.width, crop.height)
  ctx.restore()
}

// Native pixel regions within the immutable 1080px official flyer.
export const officialLockup = { x: 205, y: 49, w: 161, h: 92 }
export const officialScenery = { x: 10, y: 186, w: 362, h: 40 }

export function artworkDetail(ctx: CanvasRenderingContext2D, artwork: PosterImage, source: Box, dest: Box) {
  ctx.save()
  roundPath(ctx, dest, 5)
  ctx.clip()
  const scale = Math.max(dest.w / source.w, dest.h / source.h)
  const w = Math.min(source.w, dest.w / scale)
  const h = Math.min(source.h, dest.h / scale)
  ctx.drawImage(artwork.source, source.x + (source.w - w) / 2, source.y + (source.h - h) / 2, w, h,
    dest.x, dest.y, dest.w, dest.h)
  ctx.restore()
}

export function drawMasthead(ctx: CanvasRenderingContext2D, box: Box, artwork: PosterImage) {
  const { x, y, w } = box
  const headerHeight = w * 0.19
  ctx.save()
  roundPath(ctx, box, 9)
  ctx.clip()
  ctx.fillStyle = brand.ink
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + headerHeight * 0.43)
  ctx.lineTo(x, y + headerHeight)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  const lockup = { x: x + 15, y: y + 13, w: w * 0.235, h: w * 0.235 * officialLockup.h / officialLockup.w }
  plate(ctx, { x: lockup.x - 3, y: lockup.y - 3, w: lockup.w + 6, h: lockup.h + 6 }, brand.paper, 7)
  artworkDetail(ctx, artwork, officialLockup, lockup)
}

export function drawRibbon(ctx: CanvasRenderingContext2D, box: Box) {
  const { x, y, w, h } = box
  const bevel = w * 0.048
  ctx.fillStyle = brand.red
  ctx.save()
  ctx.shadowColor = brand.ink + '45'
  ctx.shadowBlur = 7
  ctx.shadowOffsetY = 4
  ctx.beginPath()
  ctx.moveTo(x + bevel, y)
  ctx.lineTo(x + w - bevel, y)
  ctx.lineTo(x + w, y + h / 2)
  ctx.lineTo(x + w - bevel, y + h)
  ctx.lineTo(x + bevel, y + h)
  ctx.lineTo(x, y + h / 2)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
