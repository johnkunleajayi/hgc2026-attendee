import { useEffect, useRef, useState } from 'react'
import { validatePhoto } from './localPhoto'
import { defaultAdjustments, formats, validateName } from './studioModel'
import type { LocalPhoto, PortraitAdjustments, PosterFormat } from './studioModel'

export function useStudio() {
  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [photo, setPhoto] = useState<LocalPhoto | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [format, setFormat] = useState<PosterFormat>(formats[0])
  const [adjustments, setAdjustments] = useState(defaultAdjustments)
  const request = useRef(0)
  const currentUrl = useRef<string | null>(null)
  const pendingUrl = useRef<string | null>(null)

  const resetAdjustments = () => setAdjustments(defaultAdjustments)

  function cancelPending() {
    request.current += 1
    if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current)
    pendingUrl.current = null
  }

  function releaseCurrent() {
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
    currentUrl.current = null
  }

  useEffect(() => () => {
    cancelPending()
    releaseCurrent()
  }, [])

  function removePhoto() {
    cancelPending()
    releaseCurrent()
    setPhoto(null)
    setPhotoError('')
    resetAdjustments()
  }

  async function selectPhoto(files: FileList | File[]) {
    if (!files.length) return
    cancelPending()
    if (files.length !== 1) {
      setPhotoError('Choose one photo at a time.')
      return
    }
    const file = files[0]
    const id = request.current
    setPhotoError('')
    try {
      const error = await validatePhoto(file)
      if (id !== request.current) return
      if (error) {
        setPhotoError(error)
        return
      }
      const url = URL.createObjectURL(file)
      pendingUrl.current = url
      const image = new Image()
      image.src = url
      await image.decode()
      if (id !== request.current) return
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 32_000_000) {
        cancelPending()
        setPhotoError('Choose a photo with no more than 32 megapixels.')
        return
      }
      pendingUrl.current = null
      releaseCurrent()
      currentUrl.current = url
      setPhoto({ file, url, image })
      resetAdjustments()
    } catch {
      if (id !== request.current) return
      cancelPending()
      setPhotoError('This image could not be opened. Try another JPEG, PNG or WebP photo.')
    }
  }

  const validation = validateName(name)
  return {
    name, setName, markNameTouched: () => setNameTouched(true),
    nameError: nameTouched || name.length > 0 ? validation : '',
    previewName: validation ? '' : name.trim(),
    photo, photoError, selectPhoto, removePhoto,
    format, setFormat, adjustments, resetAdjustments,
    pan: (x: number, y: number) => setAdjustments(previous => ({ ...previous, x, y })),
    adjust: (key: keyof PortraitAdjustments, value: number) =>
      setAdjustments(previous => ({ ...previous, [key]: value })),
  }
}
