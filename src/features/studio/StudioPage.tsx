import { useMemo } from 'react'
import { event } from '../../app/event'
import { useSceneAssets } from '../living-badge/sceneAssets'
import type { BadgeScene } from '../living-badge/sceneModel'
import { AttendeeDetails } from './AttendeeDetails'
import { BadgeDownloads } from './BadgeDownloads'
import { PosterPreview } from './PosterPreview'
import { StudioControls } from './StudioControls'
import { useStudio } from './useStudio'
import './studio.css'

export function StudioPage() {
  const studio = useStudio()
  const { previewName, photo, format, adjustments } = studio
  const { assets, fontReady, error } = useSceneAssets(previewName)
  const scene = useMemo<BadgeScene | undefined>(() => assets && ({
    ...assets, name: previewName, photo: photo?.image, format: format.id, adjustments,
  }), [assets, previewName, photo, format, adjustments])

  return (
    <div className="studio-page">
      <header className="studio-heading">
        <p>{event.name} · {event.theme}</p>
        <h1>Create your living badge</h1>
        <p>Add your details, frame your photograph and download your HGC living badge.</p>
      </header>
      <div className="studio-workspace">
        <div className="studio-editor">
          <AttendeeDetails
            name={studio.name} nameError={studio.nameError} onName={studio.setName} onNameBlur={studio.markNameTouched}
            photo={studio.photo} photoError={studio.photoError} onPhoto={studio.selectPhoto} onRemove={studio.removePhoto}
          />
          <StudioControls
            format={format} onFormat={studio.setFormat} adjustments={adjustments}
            onAdjust={studio.adjust} onReset={studio.resetAdjustments} hasPhoto={Boolean(photo)}
          />
          <BadgeDownloads scene={scene} format={format.id} ready={Boolean(scene && !error && fontReady && previewName && photo)} />
        </div>
        <PosterPreview scene={fontReady ? scene : undefined} format={format} error={error} onPan={studio.pan} />
      </div>
    </div>
  )
}
