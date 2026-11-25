import { useEffect } from 'react'
import { Link, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteNavigation } from '../components/SiteNavigation'
import { HomePage } from '../features/home/HomePage'
import { StudioPage } from '../features/studio/StudioPage'

export function App() {
  const { hash, key, pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      target?.focus({ preventScroll: true })
      target?.scrollIntoView?.()
    } else if (navigationType !== 'POP') {
      document.getElementById('main-content')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [hash, key, navigationType, pathname])

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteNavigation />
      <main id="main-content" tabIndex={-1} className={pathname === '/' ? undefined : 'page-shell'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<StudioPage />} />
          <Route path="*" element={
            <section className="surface">
              <h1>Page unavailable</h1>
              <p><Link to="/">Return home</Link></p>
            </section>
          } />
        </Routes>
      </main>
      {pathname === '/' && <SiteFooter />}
    </>
  )
}
