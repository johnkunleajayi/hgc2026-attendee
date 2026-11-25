declare module 'gifenc' {
  type Palette = number[][];
  export function quantize(pixels: Uint8Array | Uint8ClampedArray, maxColors: number, options: { format: 'rgb565' }): Palette;
  export function applyPalette(pixels: Uint8Array | Uint8ClampedArray, palette: Palette, format: 'rgb565'): Uint8Array;
  export function GIFEncoder(): {
    writeFrame(indices: Uint8Array, width: number, height: number, options: {
      palette?: Palette;
      delay: number;
      repeat: number;
      dispose: number;
      transparent?: boolean;
      transparentIndex?: number;
    }): void;
    finish(): void;
    bytes(): Uint8Array<ArrayBuffer>;
  };
}
