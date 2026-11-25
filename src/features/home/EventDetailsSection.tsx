import { CalendarDays, MapPin } from 'lucide-react'
import { event } from '../../app/event'
import flyer from '../../assets/official/HOLYGHOST-CONGRESS-2026-1.jpg'

export function EventDetailsSection() {
  return (
    <section className="event-section" aria-labelledby="event-title">
      <div className="content-container section-spacing event-grid">
        <div>
          <p className="eyebrow">Event information</p>
          <h2 id="event-title">{event.name}</h2>
          <p className="event-theme">{event.theme}</p>
          <dl className="event-details">
            <div>
              <CalendarDays size={23} aria-hidden="true" />
              <dt>Dates</dt>
              <dd>{event.dates}</dd>
            </div>
            <div>
              <MapPin size={23} aria-hidden="true" />
              <dt>Venue</dt>
              <dd><strong>{event.venue}</strong><br />{event.address}</dd>
            </div>
          </dl>
        </div>
        <a className="official-flyer" href={flyer}>
          <img src={flyer} width={1080} height={1080} loading="lazy" decoding="async"
            alt="Official Holy Ghost Congress 2026 flyer for The Lord of Hosts" />
          <span>View the official flyer</span>
        </a>
      </div>
    </section>
  )
}
