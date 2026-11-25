export const formats = [
  { id: 'square', label: 'Square', width: 1, height: 1 },
  { id: 'portrait', label: 'Portrait', width: 4, height: 5 },
  { id: 'story', label: 'Story', width: 9, height: 16 },
] as const

export type PosterFormat = (typeof formats)[number]
export type PortraitAdjustments = { zoom: number; rotation: number; x: number; y: number }
export type LocalPhoto = { file: File; url: string; image: HTMLImageElement }

export const defaultAdjustments: PortraitAdjustments = { zoom: 100, rotation: 0, x: 0, y: 0 }
export const nameLimit = 60

export function validateName(name: string) {
  if (!name.trim()) return 'Enter your name.'
  if (Array.from(name).length > nameLimit) return `Keep your name to ${nameLimit} characters or fewer.`
  if (!/\p{L}/u.test(name) || !/^[\p{L}\p{M}\p{Zs}'’ʼ.·\p{Pd}]+$/u.test(name)) {
    return 'Use letters, spaces, hyphens, apostrophes, periods or middle dots.'
  }
  return ''
}
