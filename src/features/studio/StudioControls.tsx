import { RotateCcw } from 'lucide-react'
import { formats } from './studioModel'
import type { PortraitAdjustments, PosterFormat } from './studioModel'

const sliders = [
  { key: 'zoom', label: 'Zoom', min: 100, max: 250, step: 5, unit: '%' },
  { key: 'rotation', label: 'Rotation', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'x', label: 'Horizontal position', min: -50, max: 50, step: 1, unit: '%' },
  { key: 'y', label: 'Vertical position', min: -50, max: 50, step: 1, unit: '%' },
] as const

type Props = {
  format: PosterFormat
  onFormat: (format: PosterFormat) => void
  adjustments: PortraitAdjustments
  onAdjust: (key: keyof PortraitAdjustments, value: number) => void
  onReset: () => void
  hasPhoto: boolean
}

export function StudioControls({ format, onFormat, adjustments, onAdjust, onReset, hasPhoto }: Props) {
  return (
    <section className="studio-panel studio-controls" aria-labelledby="editing-heading">
      <h2 id="editing-heading">Editing controls</h2>
      <fieldset className="studio-format">
        <legend>Poster format</legend>
        {formats.map(option => (
          <label key={option.id} className="studio-format-option">
            <input type="radio" name="poster-format" checked={format.id === option.id} onChange={() => onFormat(option)} />
            {option.label} <span>{option.width}:{option.height}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="studio-sliders" disabled={!hasPhoto} aria-describedby={hasPhoto ? undefined : 'portrait-help'}>
        <legend>Crop and position</legend>
        {!hasPhoto && <p id="portrait-help" className="studio-help">Choose a photo to enable adjustments.</p>}
        {sliders.map(({ key, label, min, max, step, unit }) => {
          const value = adjustments[key]
          return (
            <div key={key} className="studio-slider">
              <label htmlFor={`portrait-${key}`}>{label}</label>
              <output htmlFor={`portrait-${key}`} aria-hidden="true">{value}{unit}</output>
              <input
                id={`portrait-${key}`}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-valuetext={`${value}${unit}`}
                onChange={e => onAdjust(key, e.target.valueAsNumber)}
              />
            </div>
          )
        })}
        <button className="studio-reset" type="button" onClick={onReset}><RotateCcw size={17} aria-hidden="true" /> Reset adjustments</button>
      </fieldset>
    </section>
  )
}
