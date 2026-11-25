import { brand } from '../../styles/brand'
import { drawCredential } from './drawCredential'
import { drawClasp, drawStraps } from './drawRig'
import { badgeAngle, sceneGeometry } from './sceneModel'
import type { BadgeScene } from './sceneModel'

export function prepareScene(canvas: HTMLCanvasElement, scene: BadgeScene, width: number, height: number, readPixels = false) {
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: readPixels })
  const rig = document.createElement('canvas')
  const rigContext = rig.getContext('2d')
  if (!ctx || !rigContext) throw new Error('Could not allocate the badge canvas.')
  ctx.imageSmoothingQuality = rigContext.imageSmoothingQuality = 'high'
  const { x, y, scale, focal } = sceneGeometry(width, height)
  rig.width = Math.ceil(122 * scale)
  rig.height = Math.ceil(225 * scale)
  rigContext.scale(scale, scale)
  rigContext.translate(61, 5)
  drawStraps(rigContext, scene.mark)
  drawCredential(rigContext, scene)
  drawClasp(rigContext)
  const backgroundScale = Math.max(width / scene.scenery.naturalWidth, height / scene.scenery.naturalHeight)
  const backgroundWidth = scene.scenery.naturalWidth * backgroundScale
  const backgroundHeight = scene.scenery.naturalHeight * backgroundScale

  function draw(time: number) {
    const angle = badgeAngle(time)
    ctx!.drawImage(scene.scenery, (width - backgroundWidth) * focal, (height - backgroundHeight) / 2, backgroundWidth, backgroundHeight)
    ctx!.save()
    ctx!.translate(x, y)
    ctx!.rotate(angle)
    ctx!.shadowColor = brand.ink + '55'
    ctx!.shadowBlur = 5 * scale
    ctx!.shadowOffsetX = 2 * scale
    ctx!.shadowOffsetY = 4 * scale
    ctx!.drawImage(rig, -61 * scale, -5 * scale)
    ctx!.restore()
  }

  function dispose() { rig.width = rig.height = 0 }
  return { canvas, ctx, draw, dispose }
}
export type BadgeFrames = ReturnType<typeof prepareScene>
