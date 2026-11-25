import { encodePoster } from '../studio/posterExport'
import type { AnimationJob } from './animationJob'
import { yieldToBrowser } from './animationJob'
import { prepareScene } from './renderScene'
import { sceneSize } from './sceneModel'
import type { BadgeScene, FileType } from './sceneModel'

export async function exportScene(scene: BadgeScene, type: FileType, job: AnimationJob) {
  await yieldToBrowser()
  job.signal.throwIfAborted()
  const { width, height } = sceneSize(scene.format, type)
  const canvas = document.createElement('canvas')
  let frames: ReturnType<typeof prepareScene> | undefined
  try {
    frames = prepareScene(canvas, scene, width, height, type === 'gif')
    if (type === 'png') {
      frames.draw(0)
      return await encodePoster(canvas)
    }
    if (type === 'gif') {
      const { encodeGif } = await import('./encodeGif')
      return await encodeGif(frames, job)
    }
    const { checkMp4Support, encodeMp4 } = await import('./encodeMp4')
    await checkMp4Support(width, height, job.signal)
    return await encodeMp4(frames, job)
  } finally {
    frames?.dispose()
    canvas.width = canvas.height = 0
  }
}
