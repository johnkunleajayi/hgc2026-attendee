import { useEffect, useMemo, useRef, useState } from 'react'
import flyer from '../../assets/official/HOLYGHOST-CONGRESS-2026-1.jpg'
import { downloadPoster, encodePoster, posterFilename } from './posterExport'
import { posterLayouts } from './posterLayout'
import { drawPoster } from './posterRenderer'
import type { PosterComposition, PosterImage } from './posterRenderer'
import type { LocalPhoto, PortraitAdjustments, PosterFormat } from './studioModel'

export function usePoster(name: string, photo: Pick<LocalPhoto, 'image'> | null, format: PosterFormat, adjustments: PortraitAdjustments) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const exporting = useRef(false)
  const active = useRef(false)
  const [art, setArt] = useState<PosterImage | null>(null)
  const [assetError, setAssetError] = useState('')
  const [renderError, setRenderError] = useState('')
  const [exportError, setExportError] = useState('')
  const [busy, setBusy] = useState(false)
  const [painted, setPainted] = useState<PosterComposition | null>(null)
  const layout = posterLayouts[format.id]

  useEffect(() => {
    active.current = true
    let cancelled = false
    const image = new Image()
    image.src = flyer
    const fonts = document.fonts?.load('800 90px "Inter Variable"', "I'M ATTENDING")
    Promise.all([image.decode(), fonts]).then(() => {
      if (!cancelled) setArt({ source: image, width: image.naturalWidth, height: image.naturalHeight })
    }).catch(() => {
      if (!cancelled) setAssetError('The poster artwork or font could not load. Reload the studio to try again.')
    })
    const node = canvas.current
    return () => {
      cancelled = true
      active.current = false
      if (node) {
        node.width = 1
        node.height = 1
      }
    }
  }, [])

  const composition = useMemo<PosterComposition | null>(() => art ? {
    layout, artwork: art, portrait: photo ? {
      source: photo.image, width: photo.image.naturalWidth, height: photo.image.naturalHeight,
    } : null, name, adjustments,
  } : null, [art, photo, name, layout, adjustments])

  useEffect(() => {
    if (!composition || !canvas.current) return
    const node = canvas.current
    const frame = requestAnimationFrame(() => {
      try {
        drawPoster(node, composition)
        setPainted(composition)
        setRenderError('')
      } catch {
        setPainted(null)
        setRenderError('The poster could not render. Try a different photo or reload the studio.')
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [composition])

  const ready = Boolean(composition && painted === composition)
  const canDownload = Boolean(ready && name && photo && !busy)

  async function download() {
    if (!canDownload || !canvas.current || exporting.current) return
    exporting.current = true
    setBusy(true)
    setExportError('')
    try {
      const blob = await encodePoster(canvas.current)
      if (active.current) downloadPoster(blob, posterFilename(name, format.id))
    } catch {
      if (active.current) setExportError('The PNG could not be created. Try downloading again.')
    } finally {
      exporting.current = false
      if (active.current) setBusy(false)
    }
  }

  return { canvas, canDownload, busy, download, error: assetError || renderError, exportError }
}
