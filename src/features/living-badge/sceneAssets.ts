import { useEffect, useState } from 'react'
import mark from '../../assets/official/hgc-2026-mark.png'
import scenery from '../../assets/official/hgc-2026-heavenly-scene.png'

async function load(src: string) {
  const image = new Image()
  image.src = src
  await image.decode()
  return image
}

export function useSceneAssets(name: string) {
  const [assets, setAssets] = useState<{ mark: HTMLImageElement; scenery: HTMLImageElement }>()
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    Promise.all([load(mark), load(scenery)]).then(([mark, scenery]) => {
      if (active) setAssets({ mark, scenery })
    }).catch(() => {
      if (active) setError('The official badge artwork could not load. Reload the studio to try again.')
    })
    return () => { active = false }
  }, [])

  // Inter is split by Unicode range. Wait for the attendee's text as well as the fixed labels.
  const [fontName, setFontName] = useState<string>()
  useEffect(() => {
    let active = true
    Promise.resolve(document.fonts?.load('850 20px "Inter Variable"', name + ' I’M ATTENDING')).then(() => {
      if (active) setFontName(name)
    }).catch(() => {
      if (active) setError('The badge font could not load. Reload the studio to try again.')
    })
    return () => { active = false }
  }, [name])
  return { assets, fontReady: fontName === name, error }
}
