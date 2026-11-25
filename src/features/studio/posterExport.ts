import type { PosterFormat } from './studioModel'

export function posterFilename(name: string, format: PosterFormat['id'], extension = 'png') {
  const safe = Array.from(name.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/gu, ''))
    .slice(0, 60).join('').replace(/-+$/u, '')
  return `HGC-2026-Attendee-${safe || 'Poster'}-${format}.${extension}`
}

export function encodePoster(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob?.size && blob.type === 'image/png') resolve(blob)
      else reject(new Error('PNG encoding failed.'))
    }, 'image/png')
  })
}

export function downloadPoster(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  try {
    document.body.append(link)
    link.click()
  } finally {
    link.remove()
    // Give the browser time to start consuming the local download.
    window.setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
}
