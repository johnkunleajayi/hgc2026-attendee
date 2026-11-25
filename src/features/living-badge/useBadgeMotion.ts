import { useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'

const reducedMotion = '(prefers-reduced-motion: reduce)'

export function useBadgeMotion(paused: boolean) {
  const stage = useRef<HTMLDivElement>(null)
  const rig = useRef<HTMLDivElement>(null)
  const target = useRef(0)

  useEffect(() => {
    const node = rig.current
    const viewport = stage.current
    if (!node || !viewport || typeof matchMedia !== 'function') return
    const media = matchMedia(reducedMotion)
    let visible = false
    let running = false
    let frame = 0
    let previous = 0
    let elapsed = 0
    let angle = 0
    let velocity = 0

    // Cairo's damped spring drives the entire assembly from one pivot.
    function tick(now: number) {
      const step = previous ? Math.min((now - previous) / 1000, 0.033) : 1 / 60
      previous = now
      elapsed += step
      const idle = Math.sin(elapsed * 1.65) * 1.35
      velocity += ((idle + target.current - angle) * 17 - velocity * 5.5) * step
      angle += velocity * step
      node?.style.setProperty('--badge-swing', angle.toFixed(3) + 'deg')
      node?.style.setProperty('--badge-depth', String(0.2 + Math.min(Math.abs(angle), 4) * 0.018))
      frame = requestAnimationFrame(tick)
    }

    function sync() {
      const shouldRun = visible && !paused && !media.matches && !document.hidden
      if (shouldRun === running) return
      running = shouldRun
      previous = 0
      cancelAnimationFrame(frame)
      if (running) frame = requestAnimationFrame(tick)
      else {
        target.current = 0
        node?.style.removeProperty('--badge-swing')
        node?.style.removeProperty('--badge-depth')
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(viewport)
    media.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      cancelAnimationFrame(frame)
      target.current = 0
      node.style.removeProperty('--badge-swing')
      node.style.removeProperty('--badge-depth')
    }
  }, [paused])

  function nudge(event: PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    target.current = Math.max(-3, Math.min(3, (0.5 - (event.clientX - bounds.left) / bounds.width) * 6))
  }

  return { stage, rig, nudge, settle: () => { target.current = 0 } }
}
