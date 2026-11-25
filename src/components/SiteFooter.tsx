import { Link } from 'react-router-dom'
import { event } from '../app/event'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-container footer-inner">
        <div>
          <p className="footer-name">{event.name}</p>
          <p className="footer-theme">{event.theme}</p>
          <p>A personalised poster experience for Congress attendees.</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to={`/#${event.processId}`}>How It Works</Link>
          <Link to="/create">Create Poster</Link>
        </nav>
      </div>
    </footer>
  )
}
