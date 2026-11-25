import { Pause, Play, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import anthem from '../assets/audio/redeemed-anthem.ogg'
import './anthemControls.css'

export function AnthemControls() {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const player = audio.current
    if (!player) return
    player.volume = .25
    if (!player.canPlayType('audio/ogg; codecs="opus"')) return
    let active = true
    // Defer until the mounted effect survives React's development setup/cleanup check.
    queueMicrotask(() => {
      if (active) void player.play().catch(() => {})
    })
    return () => {
      active = false
      if (!player.paused) player.pause()
    }
  }, [])

  function toggle() {
    const player = audio.current
    if (!player) return
    if (!player.paused) player.pause()
    else void player.play().catch(() => {})
  }

  function stop() {
    const player = audio.current
    if (!player) return
    player.pause()
    player.currentTime = 0
  }

  return <div className="anthem-controls" role="group" aria-label="Background music">
    <audio ref={audio} src={anthem} loop preload="auto"
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setPlaying(false); setUnavailable(true) }} />
    {unavailable ? <span role="status">Music unavailable</span> : <>
      <button type="button" onClick={toggle} aria-label={playing ? 'Pause Music' : 'Play Music'}>
        {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        <span>{playing ? 'Pause' : 'Play Music'}</span>
      </button>
      <button type="button" onClick={stop} aria-label="Stop Music" title="Stop Music">
        <Square size={14} aria-hidden="true" />
      </button>
    </>}
  </div>
}
