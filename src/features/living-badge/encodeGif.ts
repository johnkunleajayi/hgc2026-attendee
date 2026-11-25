import type { BadgeFrames } from './renderScene';
import type { AnimationJob } from './animationJob';
import type { GifCommand, GifReply } from './gifWorker';
import { framePlan } from './mediaSettings';

const gifError = 'GIF encoding stopped. Try again, close other tabs, or choose PNG.';

export async function encodeGif(frames: BadgeFrames, job: AnimationJob) {
  const { signal } = job;
  let worker: Worker;
  try {
    worker = new Worker(new URL('./gifWorker.ts', import.meta.url), { type: 'module' });
  } catch {
    throw new Error('This browser could not start the GIF encoder. Try another browser or choose PNG.');
  }

  async function send(command: GifCommand, transfer: Transferable[] = []) {
    signal.throwIfAborted();
    let abort: (() => void) | undefined;
    try {
      return await new Promise<GifReply>((resolve, reject) => {
        abort = () => reject(signal.reason);
        signal.addEventListener('abort', abort, { once: true });
        worker.onmessage = ({ data }: MessageEvent<GifReply>) => resolve(data);
        worker.onerror = event => {
          event.preventDefault();
          reject(new Error(gifError));
        };
        worker.onmessageerror = () => reject(new Error(gifError));
        worker.postMessage(command, transfer);
      });
    } finally {
      if (abort) signal.removeEventListener('abort', abort);
      worker.onmessage = worker.onerror = worker.onmessageerror = null;
    }
  }

  try {
    const { count, duration } = framePlan('gif');
    const { width, height } = frames.canvas;
    for (let index = 0; index < count; index += 1) {
      signal.throwIfAborted();
      frames.draw(index * duration);
      const pixels = frames.ctx.getImageData(0, 0, width, height).data.buffer;
      const reply = await send({ kind: 'frame', pixels, width, height }, [pixels]);
      if (reply.kind !== 'frame') throw new Error(gifError);
      job.report({ phase: 'encoding', completed: index + 1, total: count });
    }
    job.finalizing();
    const reply = await send({ kind: 'finish' });
    signal.throwIfAborted();
    if (reply.kind !== 'finished' || !reply.bytes.byteLength) throw new Error(gifError);
    return new Blob([reply.bytes], { type: 'image/gif' });
  } finally {
    worker.terminate();
  }
}
