/// <reference lib="webworker" />
import { createGifFrames } from './gifFrames';

export type GifCommand =
  | { kind: 'frame'; pixels: ArrayBuffer; width: number; height: number }
  | { kind: 'finish' };
export type GifReply =
  | { kind: 'frame' }
  | { kind: 'finished'; bytes: ArrayBuffer }
  | { kind: 'error' };

const port = self as unknown as DedicatedWorkerGlobalScope;
let encoder: ReturnType<typeof createGifFrames> | undefined;

port.onmessage = ({ data }: MessageEvent<GifCommand>) => {
  try {
    if (data.kind === 'frame') {
      encoder ??= createGifFrames(data.width, data.height);
      encoder.add(new Uint8ClampedArray(data.pixels));
      port.postMessage({ kind: 'frame' } satisfies GifReply);
    } else {
      if (!encoder) throw new Error();
      const bytes = encoder.finish();
      encoder = undefined;
      port.postMessage({ kind: 'finished', bytes: bytes.buffer } satisfies GifReply, [bytes.buffer]);
    }
  } catch {
    port.postMessage({ kind: 'error' } satisfies GifReply);
  }
};
