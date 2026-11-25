import { useRef } from 'react'
import { badgeAngle, photoArea as area } from '../living-badge/sceneModel'
import { portraitCrop } from './portraitCrop'
import type { PortraitAdjustments } from './studioModel'

type Props = {
  image: HTMLImageElement
  adjustments: PortraitAdjustments
  onPan: (x: number, y: number) => void
}

const clamp = (value: number) => Math.max(-50, Math.min(50, Math.round(value)))

export function PortraitDrag({ image, adjustments, onPan }: Props) {
  const drag = useRef<{ id: number; clientX: number; clientY: number; x: number; y: number; angle: number; scale: number } | null>(null)
  const crop = portraitCrop(image.naturalWidth, image.naturalHeight, area.w, area.h, adjustments)

  return (
    <div
      aria-hidden="true"
      className="portrait-drag"
      style={{ left: area.x + '%', top: area.y + '%', width: area.w + '%', height: area.h + '%' }}
      onPointerDown={e => {
        if (drag.current || e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { id: e.pointerId, clientX: e.clientX, clientY: e.clientY,
          x: adjustments.x, y: adjustments.y, angle: Number.parseFloat(e.currentTarget.parentElement?.style.getPropertyValue('--rig-angle') || '') || badgeAngle(0), scale: area.w / (e.currentTarget.offsetWidth || e.currentTarget.getBoundingClientRect().width) }
      }}
      onPointerMove={e => {
        const start = drag.current
        if (!start || start.id !== e.pointerId) return
        const dx = (e.clientX - start.clientX) * start.scale
        const dy = (e.clientY - start.clientY) * start.scale
        const c = Math.cos(crop.angle + start.angle)
        const s = Math.sin(crop.angle + start.angle)
        const x = crop.travelX > 0.01 ? clamp(start.x + (dx * c + dy * s) / crop.travelX * 100) : start.x
        const y = crop.travelY > 0.01 ? clamp(start.y + (-dx * s + dy * c) / crop.travelY * 100) : start.y
        onPan(x, y)
      }}
      onLostPointerCapture={() => { drag.current = null }}
    />
  )
}
