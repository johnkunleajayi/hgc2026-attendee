import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, canEncodeVideo } from 'mediabunny';
import type { BadgeFrames } from './renderScene';
import { abortable, yieldToBrowser, type AnimationJob } from './animationJob';
import { prepareMp4Anthem } from './mp4Anthem';
import { framePlan, videoFps } from './mediaSettings';

const unsupported = 'MP4 needs browser support for H.264 encoding at this size. Try a supported browser or choose GIF or PNG.';

function bitrate(width: number, height: number) {
  return Math.round(width * height * 3.1);
}

export async function checkMp4Support(width: number, height: number, signal: AbortSignal) {
  if (!globalThis.isSecureContext || typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
    throw new Error(unsupported);
  }
  const supported = await abortable(canEncodeVideo('avc', {
    width, height, bitrate: bitrate(width, height), frameRate: videoFps,
  }), signal);
  if (!supported) throw new Error(unsupported);
}

export async function encodeMp4(frames: BadgeFrames, job: AnimationJob) {
  const { signal } = job;
  const { width, height } = frames.canvas;
  const anthem = await prepareMp4Anthem(signal);
  const target = new BufferTarget();
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
  const source = new CanvasSource(frames.canvas, {
    codec: 'avc', bitrate: bitrate(width, height), keyFrameInterval: 2, latencyMode: 'quality',
  });
  output.addVideoTrack(source, { frameRate: videoFps });
  output.addAudioTrack(anthem.source);
  const { count, duration } = framePlan('mp4');

  try {
    await abortable(output.start(), signal);
    for (let index = 0; index < count; index += 1) {
      signal.throwIfAborted();
      const timestamp = index / videoFps;
      await abortable(anthem.writeBefore((index + 1) / videoFps), signal);
      frames.draw(timestamp);
      await abortable(source.add(timestamp, duration), signal);
      if (index % 6 === 5 || index === count - 1) {
        job.report({ phase: 'encoding', completed: index + 1, total: count });
        await yieldToBrowser();
      }
    }
    anthem.source.close();
    source.close();
    job.finalizing();
    await abortable(output.finalize(), signal);
    signal.throwIfAborted();
    if (!target.buffer?.byteLength) throw new Error('The video encoder returned an empty file.');
    return new Blob([target.buffer], { type: 'video/mp4' });
  } catch (error) {
    if (signal.aborted) throw signal.reason;
    consoleProblem(error);
    throw new Error('MP4 encoding stopped. Try again, close other tabs, or choose GIF or PNG.');
  } finally {
    if (output.state !== 'finalized') await output.cancel();
  }
}

function consoleProblem(error: unknown) {
  // Avoid logging participant data or input URLs.
  if (import.meta.env.DEV && error instanceof DOMException) console.debug('MP4 encoder:', error.name);
}
