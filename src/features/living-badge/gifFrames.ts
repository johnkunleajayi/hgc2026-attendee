import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import { gifDelayMs } from './mediaSettings';

const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const transparentIndex = 255;

function paletteLookup(palette: number[][]) {
  const samples = new Uint8Array(65536 * 4);
  for (let key = 0; key < 65536; key += 1) {
    samples[key * 4] = (key >> 11) * 8 + 4;
    samples[key * 4 + 1] = ((key >> 5) & 63) * 4 + 2;
    samples[key * 4 + 2] = (key & 31) * 8 + 4;
    samples[key * 4 + 3] = 255;
  }
  return applyPalette(samples, palette, 'rgb565');
}

export function createGifFrames(width: number, height: number) {
  const encoder = GIFEncoder();
  let lookup: Uint8Array | undefined;
  let previous: Uint8Array | undefined;

  function add(pixels: Uint8ClampedArray) {
    let globalPalette: number[][] | undefined;
    if (!lookup) {
      const palette = quantize(pixels, transparentIndex, { format: 'rgb565' });
      lookup = paletteLookup(palette);
      globalPalette = palette.slice();
      while (globalPalette.length < 256) globalPalette.push([0, 0, 0]);
    }

    // Screen-fixed dithering and one color lookup keep stationary pixels identical.
    const indexed = new Uint8Array(width * height);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = y * width + x;
        const i = pixel * 4;
        const shift = (bayer[(y & 3) * 4 + (x & 3)] - 7.5) * .57;
        pixels[i] += shift;
        pixels[i + 1] += shift;
        pixels[i + 2] += shift;
        const key = ((pixels[i] >> 3) << 11) | ((pixels[i + 1] >> 2) << 5) | (pixels[i + 2] >> 3);
        indexed[pixel] = lookup[key];
      }
    }

    const options = { delay: gifDelayMs, repeat: 0, dispose: 1 };
    if (previous) {
      const delta = previous;
      for (let i = 0; i < indexed.length; i += 1) {
        delta[i] = indexed[i] === delta[i] ? transparentIndex : indexed[i];
      }
      encoder.writeFrame(delta, width, height, { ...options, transparent: true, transparentIndex });
    } else {
      encoder.writeFrame(indexed, width, height, { ...options, palette: globalPalette });
    }
    previous = indexed;
  }

  function finish() {
    encoder.finish();
    return encoder.bytes();
  }

  return { add, finish };
}
