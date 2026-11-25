import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { App } from '../../app/App'
import scenery from '../../assets/official/hgc-2026-heavenly-scene.png'
import { badgeAngle, loopSeconds, photoArea as photo, sceneSize } from '../living-badge/sceneModel'
import { portraitCrop } from './portraitCrop'


import { posterFilename } from './posterExport'

const createUrl = vi.fn(() => 'blob:local')
const revokeUrl = vi.fn()
const decode = vi.fn<() => Promise<void>>()
const drawImage = vi.fn()
const rotate = vi.fn()
const translate = vi.fn()
const clip = vi.fn()
const fillText = vi.fn()
const context = {
  drawImage, rotate, translate, clip, fillText, arc: vi.fn(), scale: vi.fn(), roundRect: vi.fn(), closePath: vi.fn(), fill: vi.fn(), stroke: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
  setTransform: vi.fn(), save: vi.fn(), restore: vi.fn(), rect: vi.fn(),
  beginPath: vi.fn(), strokeRect: vi.fn(), fillRect: vi.fn(),
  measureText: (value: string) => ({ width: value.length * 5 }),
} as unknown as CanvasRenderingContext2D

beforeEach(() => {
  createUrl.mockReset().mockReturnValue('blob:local')
  decode.mockReset().mockResolvedValue(undefined)
  revokeUrl.mockClear()
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = createUrl
    static revokeObjectURL = revokeUrl
  })
  vi.stubGlobal('Image', class {
    decode = decode
    naturalWidth = 1080
    naturalHeight = 1080
    src = ''
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  for (const spy of [drawImage, rotate, translate, clip, fillText]) spy.mockClear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function openStudio() {
  return render(<MemoryRouter initialEntries={['/create']}><App /></MemoryRouter>)
}

const png = (name = 'photo.png') => new File(
  [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], name, { type: 'image/png' },
)
const upload = (file: File) => fireEvent.change(screen.getByLabelText('Photograph file'), { target: { files: [file] } })
const poster = () => screen.getByRole<HTMLCanvasElement>('img', { name: /I'm Attending living badge/ })
const portrait = () => screen.findByRole<HTMLCanvasElement>('img', { name: /with your photo and/ })
const previewRegion = () => screen.getByRole('region', { name: 'Live preview' })
const download = () => screen.getByRole<HTMLButtonElement>('button', { name: 'Download PNG' })
const slider = (name: string) => screen.getByRole<HTMLInputElement>('slider', { name })
const setSlider = (name: string, value: number) => fireEvent.change(slider(name), { target: { value } })


it('opens the studio and draws the official art using native pixel crops from the original source', async () => {
  openStudio()
  expect(screen.getByRole('heading', { name: 'Create your living badge' })).toBeTruthy()
  expect(screen.getByText(/PNG captures the resting pose/)).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Print preview' })).toBeNull()
  await waitFor(() => expect(drawImage).toHaveBeenCalledWith(expect.objectContaining({ src: scenery }), expect.any(Number), expect.any(Number), expect.any(Number), expect.any(Number)))
})

it('renders a Unicode name and validates blank, unsupported and long entries', async () => {
  openStudio()
  const input = screen.getByLabelText('Attendee name')
  fireEvent.blur(input)
  expect(screen.getByText('Enter your name.')).toBeTruthy()
  fireEvent.change(input, { target: { value: 'Adéọlá O’Neill-王' } })
  await waitFor(() => expect(poster().getAttribute('aria-label')).toContain('Adéọlá O’Neill-王'))
  fireEvent.change(input, { target: { value: 'Ada123' } })
  expect(input.getAttribute('aria-invalid')).toBe('true')
  fireEvent.change(input, { target: { value: '王'.repeat(61) } })
  expect(screen.getByText(/60 characters or fewer/)).toBeTruthy()
})

it('selects, replaces and removes a photo, releasing obsolete URLs', async () => {
  openStudio()
  upload(png())
  await portrait()
  await waitFor(() => expect(drawImage.mock.calls.some(([image]) => image.src === 'blob:local')).toBe(true))
  setSlider('Zoom', 150)
  createUrl.mockReturnValueOnce('blob:replacement')
  upload(png('replacement.png'))
  await waitFor(() => expect(screen.getByText('replacement.png')).toBeTruthy())
  await portrait()
  await waitFor(() => expect(drawImage.mock.calls.some(([image]) => image.src === 'blob:replacement')).toBe(true))
  expect(slider('Zoom').value).toBe('100')
  expect(revokeUrl).toHaveBeenCalledWith('blob:local')
  fireEvent.click(screen.getByRole('button', { name: 'Remove photo' }))
  expect(screen.queryByRole('img', { name: /with your photo and/ })).toBeNull()
  expect(revokeUrl).toHaveBeenCalledWith('blob:replacement')
  expect(slider('Zoom').matches(':disabled')).toBe(true)
})

it('accepts a dropped photo and releases it on unmount', async () => {
  const view = openStudio()
  fireEvent.drop(screen.getByRole('button', { name: /Choose photo/ }), { dataTransfer: { files: [png()] } })
  await portrait()
  view.unmount()
  expect(revokeUrl).toHaveBeenCalledWith('blob:local')
})

it('rejects a disguised file and an oversized file before creating an object URL', async () => {
  openStudio()
  upload(new File(['invalid'], 'fake.png', { type: 'image/png' }))
  expect((await screen.findByRole('alert')).textContent).toMatch(/Choose a JPEG/)
  upload(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }))
  expect((await screen.findByRole('alert')).textContent).toMatch(/10 MB or smaller/)
  expect(createUrl).not.toHaveBeenCalled()
})

it('rejects a corrupt replacement and retains the previous photo', async () => {
  openStudio()
  upload(png())
  await portrait()
  createUrl.mockReturnValueOnce('blob:corrupt')
  decode.mockRejectedValueOnce(new Error('Decode failed'))
  upload(png('corrupt.png'))
  expect((await screen.findByRole('alert')).textContent).toMatch(/could not be opened/)
  await portrait()
  await waitFor(() => expect(drawImage.mock.calls.some(([image]) => image.src === 'blob:local')).toBe(true))
  expect(revokeUrl).toHaveBeenCalledWith('blob:corrupt')
})

it('updates all three preview aspect ratios', () => {
  const view = openStudio()
  const frame = view.container.querySelector<HTMLElement>('.studio-preview-frame')
  expect(frame?.style.aspectRatio).toBe('1 / 1')
  fireEvent.click(screen.getByRole('radio', { name: 'Portrait 4:5' }))
  expect(frame?.style.aspectRatio).toBe('4 / 5')
  fireEvent.click(screen.getByRole('radio', { name: 'Story 9:16' }))
  expect(frame?.style.aspectRatio).toBe('9 / 16')
})

it('updates only the portrait transform and resets all four controls', async () => {
  openStudio()
  upload(png())
  await portrait()
  setSlider('Zoom', 150)
  setSlider('Rotation', 45)
  setSlider('Horizontal position', 20)
  setSlider('Vertical position', -15)
  await waitFor(() => {
    expect(rotate).toHaveBeenCalledWith(Math.PI / 4)
    expect(translate).toHaveBeenCalledWith(photo.x + photo.w / 2, photo.y + photo.h / 2)
    const crop = portraitCrop(1080, 1080, photo.w, photo.h, { zoom: 150, rotation: 45, x: 20, y: -15 })
    expect(drawImage).toHaveBeenCalledWith(expect.objectContaining({ src: 'blob:local' }), crop.left, crop.top, crop.width, crop.height)
    expect(clip).toHaveBeenCalled()
  })
  fireEvent.click(screen.getByRole('button', { name: 'Reset adjustments' }))
  await waitFor(() => expect(rotate).toHaveBeenCalledWith(0))
  expect(translate).toHaveBeenCalledWith(photo.x + photo.w / 2, photo.y + photo.h / 2)
})

it('disables portrait controls without an image and requires a photo to export', () => {
  openStudio()
  expect(screen.getAllByRole('slider').every(input => input.matches(':disabled'))).toBe(true)
  for (const name of ['Reset adjustments', 'Download PNG']) {
    expect(screen.getByRole('button', { name }).matches(':disabled')).toBe(true)
  }
})

it.each([
  ['square', 2400, 2400, 'Square 1:1'],
  ['portrait', 2400, 3000, 'Portrait 4:5'],
  ['story', 2160, 3840, 'Story 9:16'],
] as const)('uses the same aspect ratio for the %s preview and PNG export', async (id, width, height, radio) => {
  openStudio()
  fireEvent.click(screen.getByRole('radio', { name: radio }))
  expect(sceneSize(id, 'png')).toEqual({ width, height })
  await waitFor(() => expect([poster().width, poster().height]).toEqual([width / 2, height / 2]))
})

it('closes the timeline at the PNG pose and preserves Unicode filenames', () => {
  expect(badgeAngle(loopSeconds)).toBeCloseTo(badgeAngle(0))
  expect(badgeAngle(loopSeconds / 8)).not.toBeCloseTo(badgeAngle(0))
  expect(posterFilename(' Adéọlá / 王 : O’Neill ', 'story')).toBe('HGC-2026-Attendee-Adéọlá-王-O-Neill-story.png')
  expect(posterFilename(':::','square')).toBe('HGC-2026-Attendee-Poster-square.png')
})

it('encodes a full-resolution scene, prevents duplicate export and handles encoding errors', async () => {
  openStudio()
  expect(download().disabled).toBe(true)
  upload(png())
  await portrait()
  expect(download().disabled).toBe(true)
  fireEvent.change(screen.getByLabelText('Attendee name'), { target: { value: 'Adéọlá 王' } })
  await waitFor(() => expect(download().disabled).toBe(false))
  expect(fillText).toHaveBeenCalledWith('Adéọlá 王', 0, expect.any(Number), 88)
  const clicked = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  let encode: BlobCallback | undefined
  const toBlob = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => { encode = callback })
  const canvas = poster()
  fireEvent.click(download())
  const busy = screen.getByRole<HTMLButtonElement>('button', { name: 'Download PNG' })
  expect(busy.disabled).toBe(true)
  fireEvent.click(busy)
  await waitFor(() => expect(toBlob).toHaveBeenCalledTimes(1))
  expect(toBlob.mock.contexts[0]).not.toBe(canvas)
  expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
  encode?.(null)
  expect((await screen.findByRole('alert')).textContent).toMatch(/could not be created/)
  fireEvent.click(download())
  const pngBlob = new Blob(['png'], { type: 'image/png' })
  await waitFor(() => expect(toBlob).toHaveBeenCalledTimes(2))
  encode?.(pngBlob)
  await waitFor(() => expect(clicked).toHaveBeenCalledTimes(1))
  expect(createUrl).toHaveBeenCalledWith(pngBlob)
  expect((clicked.mock.contexts[0] as HTMLAnchorElement).download).toBe('HGC-2026-Attendee-Adéọlá-王-square.png')
  expect(previewRegion().contains(canvas)).toBe(true)
})


it('keeps the crop filled at both positioning limits and at every format ratio', () => {
  {
    for (const rotation of [0, 45, 90, 180]) {
      const centered = portraitCrop(700, 1100, photo.w, photo.h, { x: 0, y: 0, zoom: 150, rotation })
      const edge = portraitCrop(700, 1100, photo.w, photo.h, { x: 50, y: -50, zoom: 150, rotation })
      expect(edge.left).toBeCloseTo(centered.left + centered.travelX / 2)
      expect(edge.top).toBeCloseTo(centered.top - centered.travelY / 2)
      expect(edge.width - edge.travelX).toBeCloseTo(photo.w * Math.abs(Math.cos(edge.angle)) + photo.h * Math.abs(Math.sin(edge.angle)))
    }
  }
})

it('updates both crop controls when the preview receives captured pointer movement', async () => {
  const view = openStudio()
  upload(png())
  await portrait()
  setSlider('Zoom', 150)
  const surface = view.container.querySelector<HTMLElement>('.portrait-drag')!
  const capture = vi.fn()
  Object.defineProperty(surface, 'setPointerCapture', { value: capture })
  vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect)
  function pointer(type: string, x: number, y: number) {
    const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 })
    Object.defineProperty(event, 'pointerId', { value: 1 })
    fireEvent(surface, event)
  }
  pointer('pointerdown', 50, 60)
  pointer('pointermove', 65, 80)
  expect(capture).toHaveBeenCalledWith(1)
  expect(Number(slider('Horizontal position').value)).toBeGreaterThan(0)
  expect(Number(slider('Vertical position').value)).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Reset adjustments' }))
  expect(slider('Horizontal position').value).toBe('0')
  expect(slider('Vertical position').value).toBe('0')
})
