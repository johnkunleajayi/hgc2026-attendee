import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { exportScene } from '../living-badge/exportScene'
import { fileTypes, sceneSize } from '../living-badge/sceneModel'
import type { BadgeScene, FileType } from '../living-badge/sceneModel'
import { downloadPoster, posterFilename } from './posterExport'

const labels = { png: 'PNG — Still image', gif: 'GIF — Animated image', mp4: 'MP4 — Animated video' }
type Props = { scene?: BadgeScene; format: BadgeScene['format']; ready: boolean }

export function BadgeDownloads({ scene, format, ready }: Props) {
  const [type, setType] = useState<FileType>('png')
  const [mp4, setMp4] = useState<{ format: Props['format']; supported: boolean }>()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const jobRef = useRef<AbortController | null>(null)
  const alive = useRef(false)
  const size = sceneSize(format, type)
  const gifSupported = typeof Worker !== 'undefined'
  const mp4Pending = mp4?.format !== format
  const mp4Supported = !mp4Pending && mp4.supported
  const unavailable = type === 'gif' && !gifSupported || type === 'mp4' && !mp4Supported

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; jobRef.current?.abort() }
  }, [])

  useEffect(() => {
    const job = new AbortController()
    const size = sceneSize(format, 'mp4')
    async function check() {
      if (!globalThis.isSecureContext || typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') return false
      const { checkMp4Support } = await import('../living-badge/encodeMp4')
      await checkMp4Support(size.width, size.height, job.signal)
      return true
    }
    check().catch(() => false).then(supported => {
      if (!job.signal.aborted) setMp4({ format, supported })
    })
    return () => job.abort()
  }, [format])

  async function start() {
    if (!scene || !ready || unavailable || jobRef.current) return
    const job = new AbortController()
    jobRef.current = job
    setBusy(true)
    setError('')
    setProgress(0)
    setStatus('Preparing your living badge…')
    try {
      const blob = await exportScene(scene, type, {
        signal: job.signal,
        report: ({ completed, total }) => {
          if (!alive.current || job.signal.aborted) return
          setStatus(`Encoding ${type.toUpperCase()}…`)
          setProgress(completed / total)
        },
        finalizing: () => {
          if (alive.current && !job.signal.aborted) setStatus('Finalizing your file…')
        },
      })
      job.signal.throwIfAborted()
      downloadPoster(blob, posterFilename(scene.name, format, type))
      if (alive.current) setStatus('File sent to your browser for download.')
    } catch (reason) {
      if (!alive.current) return
      setStatus(job.signal.aborted ? 'Export cancelled.' : '')
      if (!job.signal.aborted) setError(type !== 'png' && reason instanceof Error
        ? reason.message : `The ${type.toUpperCase()} could not be created. Please try again.`)
    } finally {
      jobRef.current = null
      if (alive.current) setBusy(false)
    }
  }

  return <section className="studio-panel studio-export" aria-labelledby="download-heading">
    <h2 id="download-heading">Download</h2>
    <div className="studio-field">
      <label htmlFor="badge-file-type">Download format</label>
      <select id="badge-file-type" value={type} disabled={busy} onChange={e => {
        setType(e.currentTarget.value as FileType)
        setError('')
        setStatus('')
      }}>
        {fileTypes.map(value => <option key={value} value={value}
          disabled={value === 'gif' && !gifSupported || value === 'mp4' && !mp4Supported}>{labels[value]}</option>)}
      </select>
    </div>
    <p className="studio-help">{size.width} × {size.height} px{type === 'png' ? ' · Still image' : ' · 6 seconds'}</p>
    {!mp4Supported && <p className="studio-help">{mp4Pending ? 'Checking for H.264 encoding…' : 'MP4 is unavailable at this size in your browser. It requires H.264 encoding on a secure page.'}</p>}
    {!gifSupported && <p className="studio-help">GIF requires browser worker support.</p>}
    {!ready && <p className="studio-help">Add a valid name and photograph to download your badge.</p>}
    <div className="studio-export-actions">
      <button type="button" className="primary-link studio-download" disabled={!ready || busy || unavailable} onClick={() => void start()}>
        <Download size={18} aria-hidden="true" /> Download {type.toUpperCase()}
      </button>
      {busy && type !== 'png' && <button type="button" className="studio-reset" onClick={() => {
        jobRef.current?.abort()
        setStatus('Cancelling export…')
      }}>Cancel export</button>}
    </div>
    <p role="status">{status}</p>
    {busy && type !== 'png' && <progress aria-label="Encoding progress" max={1} value={progress} />}
    {error && <p className="studio-error" role="alert">{error}</p>}
  </section>
}
