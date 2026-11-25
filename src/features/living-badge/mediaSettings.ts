import { gifDelayMs, loopSeconds, videoFps } from './sceneModel'

export { gifDelayMs, videoFps }

export function framePlan(type: 'gif' | 'mp4') {
  const duration = type === 'gif' ? gifDelayMs / 1000 : 1 / videoFps
  return { count: Math.round(loopSeconds / duration), duration }
}
