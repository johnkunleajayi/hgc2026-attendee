import { ImagePlus, Menu, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { event } from '../app/event'
import { AnthemControls } from './AnthemControls'

export function SiteNavigation() {
  const [expanded, setExpanded] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const closeMenu = () => setExpanded(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="wordmark" aria-label={event.name} onClick={closeMenu}>
          <span>RCCG</span>
          <span>Holy Ghost Congress 2026</span>
        </Link>
        <AnthemControls />
        <div
          className="nav-disclosure"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) closeMenu()
          }}
          onKeyDown={(e) => {
            if (expanded && e.key === 'Escape') {
              e.preventDefault()
              closeMenu()
              toggle.current?.focus()
            }
          }}
        >
          <button
            ref={toggle}
            type="button"
            className="menu-toggle"
            aria-expanded={expanded}
            aria-controls="primary-navigation"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span>Menu</span>
          </button>
          <nav id="primary-navigation" aria-label="Primary" data-expanded={expanded}>
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <Link to={`/#${event.processId}`} onClick={closeMenu}>How It Works</Link>
            <NavLink to="/create" className="primary-link" onClick={closeMenu}>
              <ImagePlus size={18} aria-hidden="true" /> Create Poster
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}
