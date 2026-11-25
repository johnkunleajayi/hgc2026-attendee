import { Download, ImageUp, SlidersHorizontal } from 'lucide-react'
import { event } from '../../app/event'

const steps = [
  { title: 'Add your details', description: 'Enter your name and choose a photograph.', icon: ImageUp },
  { title: 'Frame your portrait', description: 'Choose a format and adjust the crop in the live preview.', icon: SlidersHorizontal },
  { title: 'Download & share', description: 'Save a high-resolution PNG to share with friends and family.', icon: Download },
]

export function HowItWorksSection() {
  return (
    <section className="process-section" id={event.processId} tabIndex={-1} aria-labelledby="process-title">
      <div className="content-container section-spacing">
        <h2 id="process-title">How It Works</h2>
        <ol className="process-list">
          {steps.map(({ title, description, icon: Icon }) => (
            <li key={title}><Icon size={27} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></li>
          ))}
        </ol>
      </div>
    </section>
  )
}
