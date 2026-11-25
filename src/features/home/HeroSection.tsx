import { CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { event } from '../../app/event'
import { LivingBadge } from '../living-badge/LivingBadge'

export function HeroSection() {
  return (
    <section className="campaign-hero" aria-labelledby="home-title">
      <div className="content-container hero-grid">
        <div className="hero-intro">
          <p className="eyebrow">The Redeemed Christian Church of God</p>
          <h1 id="home-title">Holy Ghost Congress <span>2026</span></h1>
          <p className="hero-theme">{event.theme}</p>
          <p className="hero-description">Create your “I’m Attending” poster with your own photograph, then download it in the format you want to share.</p>
          <ul className="hero-facts" aria-label="Event at a glance">
            <li><CalendarDays size={19} aria-hidden="true" />{event.dates}</li>
            <li><MapPin size={19} aria-hidden="true" />{event.venue}, Mowe</li>
          </ul>
          <div className="hero-actions">
            <Link className="primary-link" to="/create">Create My Poster</Link>
            <Link className="secondary-link" to={`/#${event.processId}`}>How It Works</Link>
          </div>
        </div>
        <div className="hero-stage">
          <LivingBadge priority />
        </div>
      </div>
    </section>
  )
}
