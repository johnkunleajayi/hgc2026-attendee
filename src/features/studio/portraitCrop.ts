import type { PortraitAdjustments } from './studioModel'

export function portraitCrop(iw: number, ih: number, fw: number, fh: number, crop: PortraitAdjustments) {
  const angle = crop.rotation * Math.PI / 180
  const cosine = Math.abs(Math.cos(angle))
  const sine = Math.abs(Math.sin(angle))
  const viewWidth = fw * cosine + fh * sine
  const viewHeight = fw * sine + fh * cosine
  const scale = Math.max(viewWidth / iw, viewHeight / ih) * crop.zoom / 100
  const width = iw * scale
  const height = ih * scale
  return {
    angle, width, height,
    travelX: width - viewWidth, travelY: height - viewHeight,
    left: -width / 2 + (width - viewWidth) * crop.x / 100,
    top: -height / 2 + (height - viewHeight) * crop.y / 100,
  }
}
