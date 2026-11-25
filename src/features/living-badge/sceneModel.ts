import type { PortraitAdjustments, PosterFormat } from '../studio/studioModel'

export type BadgeScene = {
  format: PosterFormat['id']
  name: string
  photo?: HTMLImageElement
  adjustments: PortraitAdjustments
  scenery: HTMLImageElement
  mark: HTMLImageElement
}

export const fileTypes = ['png', 'gif', 'mp4'] as const
export type FileType = typeof fileTypes[number]
export const loopSeconds = 6
export const videoFps = 30
export const gifDelayMs = 80
export const photoArea = { x: -44, y: 86, w: 88, h: 88 * 5 / 6 }

const sizes = { square: [2400, 2400], portrait: [2400, 3000], story: [2160, 3840] } as const

export function sceneSize(format: BadgeScene['format'], type: FileType, preview = false) {
  const [width, height] = sizes[format]
  const scale = preview || type === 'mp4' ? .5 : type === 'gif' ? .25 : 1
  return { width: width * scale, height: height * scale }
}

export function sceneGeometry(width: number, height: number) {
  const aspect = width / height
  return {
    x: width * (aspect < .65 ? .57 : .62),
    y: height * (aspect < .65 ? .12 : .055),
    scale: Math.min(width * .61, height * .42) / 100,
    focal: aspect < .65 ? .58 : .64,
  }
}

export function badgeAngle(time: number) {
  return (3 + 1.35 * Math.sin(time * 4 * Math.PI / loopSeconds)) * Math.PI / 180
}
