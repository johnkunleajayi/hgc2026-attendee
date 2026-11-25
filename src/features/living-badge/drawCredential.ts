import { event } from '../../app/event'
import { brand } from '../../styles/brand'
import { portraitCrop } from '../studio/portraitCrop'
import { photoArea } from './sceneModel'
import type { BadgeScene } from './sceneModel'

type Context = CanvasRenderingContext2D
export function rounded(ctx: Context, x: number, y: number, width: number, height: number, radius: number, color: string) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.fillStyle = color
  ctx.fill()
}

function text(ctx: Context, value: string, x: number, y: number, size: number, weight: number, color = brand.ink as string, maxWidth = 88) {
  ctx.font = `${weight} ${size}px "Inter Variable", sans-serif`
  ctx.fillStyle = color
  ctx.fillText(value, x, y, maxWidth)
}

function namePlate(ctx: Context, name: string) {
  const value = name || 'Your name'
  ctx.font = '850 7px "Inter Variable", sans-serif'
  if (ctx.measureText(value).width <= 88) {
    text(ctx, value, 0, 172, 7, 850)
    return
  }
  const chars = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), unit => unit.segment)
  const midpoint = Math.ceil(chars.length / 2)
  const space = chars.findIndex((char, index) => char === ' ' && Math.abs(index - midpoint) <= 4)
  const split = space > 0 ? space : midpoint
  text(ctx, chars.slice(0, split).join('').trim(), 0, 169, 5.5, 850)
  text(ctx, chars.slice(split).join('').trim(), 0, 175, 5.5, 850)
}

function photo(ctx: Context, scene: BadgeScene) {
  const { x, y, w, h } = photoArea
  rounded(ctx, x, y, w, h, 4, brand.ink + '14')
  if (!scene.photo) {
    text(ctx, 'Your photo', 0, y + h / 2, 4.8, 650)
    return
  }
  const crop = portraitCrop(scene.photo.naturalWidth, scene.photo.naturalHeight, w, h, scene.adjustments)
  ctx.save()
  ctx.clip()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(crop.angle)
  ctx.drawImage(scene.photo, crop.left, crop.top, crop.width, crop.height)
  ctx.restore()
}

export function drawCredential(ctx: Context, scene: BadgeScene) {
  rounded(ctx, -49, 55, 101, 152, 7, brand.ink + '80')
  rounded(ctx, -50, 54, 100, 152, 7, brand.paper)
  ctx.strokeStyle = brand.ink + '30'
  ctx.lineWidth = .45
  ctx.stroke()
  rounded(ctx, -7, 63, 14, 3, 1.5, brand.ink)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.drawImage(scene.mark, -37, 69, 14, 14 * 82 / 81)
  ctx.textAlign = 'left'
  text(ctx, 'HOLY GHOST', -20, 74, 5.35, 840)
  text(ctx, 'CONGRESS 2026', -20, 80, 5.35, 840)
  ctx.textAlign = 'center'
  photo(ctx, scene)
  ctx.beginPath()
  for (const [x, y] of [[-40,154],[40,154],[44,159],[40,164],[-40,164],[-44,159]]) ctx.lineTo(x,y)
  ctx.closePath()
  ctx.fillStyle = brand.red
  ctx.fill()
  text(ctx, 'I’M ATTENDING', 0, 159, 5.3, 850, brand.paper)
  namePlate(ctx, scene.name)
  text(ctx, event.theme, 0, 184, 4.4, 780, brand.green)
  ctx.fillStyle = brand.ink + '24'
  ctx.fillRect(-43, 188, 86, .4)
  text(ctx, event.dates, 0, 193, 3.8, 650)
  text(ctx, 'Redemption City, Mowe', 0, 198, 3.8, 650)
}
