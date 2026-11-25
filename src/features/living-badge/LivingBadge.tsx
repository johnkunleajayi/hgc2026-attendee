import { Pause, Play, UserRound } from 'lucide-react'
import { useState } from 'react'
import { event } from '../../app/event'
import mark from '../../assets/official/hgc-2026-mark.png'
import scenery from '../../assets/official/hgc-2026-heavenly-scene.png'
import { portraitCrop } from '../studio/portraitCrop'
import { defaultAdjustments } from '../studio/studioModel'
import type { PortraitAdjustments } from '../studio/studioModel'
import { useBadgeMotion } from './useBadgeMotion'
import './livingBadge.css'

type Props = {
  name?: string
  image?: HTMLImageElement
  adjustments?: PortraitAdjustments
  priority?: boolean
}

function CredentialPhoto({ image, adjustments }: { image?: HTMLImageElement; adjustments: PortraitAdjustments }) {
  if (!image) return <div className="living-photo"><UserRound size={32} strokeWidth={1.4} /><span>Your photo</span></div>
  const width = 420
  const height = 350
  const crop = portraitCrop(image.naturalWidth, image.naturalHeight, width, height, adjustments)
  return (
    <div className="living-photo">
      <div style={{ transform: `rotate(${crop.angle}rad)` }}>
        <img src={image.src} alt="" draggable={false} style={{
          width: `${crop.width / width * 100}%`, height: `${crop.height / height * 100}%`,
          left: `${50 + crop.left / width * 100}%`, top: `${50 + crop.top / height * 100}%`,
        }} />
      </div>
    </div>
  )
}

export function LivingBadge({ name, image, adjustments = defaultAdjustments, priority }: Props) {
  const [paused, setPaused] = useState(false)
  const { rig, stage, nudge, settle } = useBadgeMotion(paused)

  return (
    <div className="living-stage" ref={stage} onPointerMove={nudge} onPointerLeave={settle}>
      <img className="living-scenery" src={scenery} alt="" width={1080} height={449} fetchPriority={priority ? 'high' : 'auto'} />
      <div className="living-rig" ref={rig} aria-hidden="true">
        <div className="living-support" />
        <div className="living-lanyard">
          {(['left', 'right'] as const).map(side => (
            <div className={`living-strap living-strap-${side}`} key={side}>
              <img src={mark} alt="" width={81} height={82} draggable={false} />
              <img src={mark} alt="" width={81} height={82} draggable={false} />
            </div>
          ))}
        </div>
        <div className="living-hardware"><i /><b /></div>
        <div className="living-card">
          <div className="living-slot" />
          <div className="living-card-heading">
            <img src={mark} alt="" width={81} height={82} />
            <span>HOLY GHOST<br />CONGRESS 2026</span>
          </div>
          <CredentialPhoto image={image} adjustments={adjustments} />
          <p className="living-ribbon">I’M ATTENDING</p>
          <p className="living-name" data-long={Array.from(name || '').length > 30}>{name || 'Your name'}</p>
          <p className="living-theme">{event.theme}</p>
          <p className="living-meta">{event.dates}<span>Redemption City, Mowe</span></p>
        </div>
      </div>
      <span className="sr-only">HGC 2026 hanging credential for {name || 'the attendee'}, with the official crest repeated on both straps.</span>
      <button className="living-pause" type="button" onClick={() => setPaused(value => !value)}
        aria-label={paused ? 'Play badge motion' : 'Pause badge motion'}>
        {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
      </button>
    </div>
  )
}
