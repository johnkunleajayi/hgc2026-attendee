import { brand } from '../../styles/brand'
import { rounded } from './drawCredential'

export function drawStraps(ctx: CanvasRenderingContext2D, mark: HTMLImageElement) {
  for (const side of [-1, 1]) {
    ctx.save()
    ctx.translate(side * 22, 2)
    ctx.rotate(side * 26 * Math.PI / 180)
    rounded(ctx, -11, 0, 22, 51, 4, brand.green)
    ctx.save()
    ctx.clip()
    ctx.fillStyle = brand.ink + '35'
    ctx.fillRect(-10, 0, 3, 51)
    ctx.fillStyle = brand.paper + '24'
    for (let y = 1; y < 51; y += 1) ctx.fillRect(-11, y, 22, .19)
    ctx.restore()
    for (const y of [11, 28]) {
      ctx.save()
      ctx.translate(0, y)
      ctx.rotate(-side * Math.PI / 2)
      ctx.drawImage(mark, -7, -7, 14, 14 * 82 / 81)
      ctx.restore()
    }
    ctx.restore()
  }
  rounded(ctx, -35, 0, 70, 4.5, 2.2, brand.ink)
}

export function drawClasp(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.arc(0, 54, 5, 0, Math.PI * 2)
  ctx.strokeStyle = brand.ink + '95'
  ctx.lineWidth = 2.3
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 54, 4.9, Math.PI, Math.PI * 1.65)
  ctx.strokeStyle = brand.paper
  ctx.lineWidth = 1
  ctx.stroke()
  rounded(ctx, -2.8, 57.8, 5.6, 11, 2.6, brand.ink + 'a5')
  rounded(ctx, -1.7, 58, 1.4, 9, .7, brand.paper)
}
