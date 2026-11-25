import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { prepareScene } from '../living-badge/renderScene'
import { badgeAngle, sceneGeometry, sceneSize } from '../living-badge/sceneModel'
import type { BadgeScene } from '../living-badge/sceneModel'
import { PortraitDrag } from './PortraitDrag'
import type { PosterFormat } from './studioModel'

type Props = {
  scene?: BadgeScene
  format: PosterFormat
  error: string
  onPan: (x: number, y: number) => void
}

export function PosterPreview({ scene, format, error, onPan }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const dragLayer = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [renderError, setRenderError] = useState('')
  const { width, height } = sceneSize(format.id, 'png', true)
  const geometry = sceneGeometry(width, height)

  useEffect(() => {
    const node = canvas.current
    const layer = dragLayer.current
    if (!scene || !node) return
    let frame = 0
    let start: number | undefined
    let painter: ReturnType<typeof prepareScene>
    try {
      painter = prepareScene(node, scene, width, height)
      setRenderError('')
    } catch {
      setRenderError('The badge preview could not be drawn. Reload the studio to try again.')
      return
    }
    const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined
    let visible = true

    function paint(time: number) {
      painter.draw(time)
      layer?.style.setProperty('--rig-angle', badgeAngle(time) + 'rad')
      if (node) node.dataset.pose = String(time)
    }

    function tick(now: number) {
      start ??= now
      paint((now - start) / 1000)
      frame = requestAnimationFrame(tick)
    }

    function sync() {
      cancelAnimationFrame(frame)
      start = undefined
      paint(0)
      if (media && !media.matches && !paused && visible && !document.hidden) frame = requestAnimationFrame(tick)
    }

    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    }) : undefined
    observer?.observe(node)
    media?.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      media?.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      observer?.disconnect()
      cancelAnimationFrame(frame)
      painter.dispose()
    }
  }, [scene, width, height, paused])

  return <section className="studio-panel studio-preview" aria-labelledby="preview-heading">
    <div className="studio-preview-heading">
      <h2 id="preview-heading">Live preview</h2>
      <span>{format.label} · {format.width}:{format.height}</span>
    </div>
    <figure>
      <div className="studio-preview-frame" data-format={format.id} style={{ aspectRatio: `${format.width} / ${format.height}` }}>
        <canvas ref={canvas} role="img" aria-label={`I'm Attending living badge for ${scene?.name || 'your name'}, ${scene?.photo ? 'with your photo and ' : ''}with the official HGC scenery and lanyard`} />
        {scene && <div ref={dragLayer} className="studio-rig-controls" style={{
          left: geometry.x / width * 100 + '%', top: geometry.y / height * 100 + '%',
          width: geometry.scale * 100 / width * 100 + '%',
        }}>
          {scene.photo && <PortraitDrag key={scene.photo.src + format.id} image={scene.photo} adjustments={scene.adjustments} onPan={onPan} />}
        </div>}
        {scene && <button className="living-pause" type="button" onClick={() => setPaused(value => !value)}
          aria-label={paused ? 'Play badge motion' : 'Pause badge motion'}>
          {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
        </button>}
      </div>
      {(error || renderError) && <p role="alert" className="studio-error">{error || renderError}</p>}
      <figcaption>Drag the portrait or use the crop controls. PNG captures the resting pose. GIF and MP4 follow the preview’s six-second loop.</figcaption>
    </figure>
  </section>
}
