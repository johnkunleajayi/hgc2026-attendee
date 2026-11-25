import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/App'
import officialFlyer from '../../assets/official/HOLYGHOST-CONGRESS-2026-1.jpg'

vi.mock('../studio/usePoster', () => ({
  usePoster: () => ({ canvas: { current: null }, canDownload: false }),
}))

function Location() {
  const { pathname, hash } = useLocation()
  return <output aria-label="Current location">{pathname}{hash}</output>
}

function renderApp(path = '/') {
  render(<MemoryRouter initialEntries={[path]}><App /><Location /></MemoryRouter>)
}

beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Homepage', () => {
  it('renders the homepage and official event title', () => {
    renderApp()
    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Holy Ghost Congress 2026' })).toBeTruthy()
  })

  it('presents the official theme', () => {
    renderApp()
    expect(screen.getAllByText('THE LORD OF HOSTS')).toHaveLength(4)
  })

  it('opens the studio from the hero CTA', () => {
    renderApp()
    const hero = screen.getByRole('region', { name: 'Holy Ghost Congress 2026' })
    fireEvent.click(within(hero).getByRole('link', { name: 'Create My Poster' }))
    expect(screen.getByLabelText('Current location').textContent).toBe('/create')
    expect(screen.getByRole('heading', { name: 'Create your living badge' })).toBeTruthy()
  })

  it('renders the three-step process and focuses it from the hero', () => {
    renderApp()
    const hero = screen.getByRole('region', { name: 'Holy Ghost Congress 2026' })
    fireEvent.click(within(hero).getByRole('link', { name: 'How It Works' }))
    const process = screen.getByRole('region', { name: 'How It Works' })
    expect(within(process).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByLabelText('Current location').textContent).toBe('/#how-it-works')
    expect(document.activeElement).toBe(process)
  })

  it('renders the event dates and venue', () => {
    renderApp()
    const details = screen.getByRole('region', { name: 'RCCG Holy Ghost Congress 2026' })
    expect(within(details).getByText('7–12 December 2026')).toBeTruthy()
    expect(within(details).getByText(/KM 46 Lagos–Ibadan Expressway, Mowe/)).toBeTruthy()
  })

  it('references the official square flyer in the event section', () => {
    renderApp()
    const flyer = screen.getByRole('img', { name: /^Official Holy Ghost Congress 2026 flyer/ })
    expect(flyer.getAttribute('src')).toBe(officialFlyer)
    expect(flyer.getAttribute('width')).toBe('1080')
    expect(flyer.getAttribute('height')).toBe('1080')
  })

  it('navigates between routes and marks the active link', () => {
    renderApp('/create')
    const navigation = screen.getByRole('navigation', { name: 'Primary' })
    const create = within(navigation).getByRole('link', { name: 'Create Poster' })
    const home = within(navigation).getByRole('link', { name: 'Home' })
    expect(create.getAttribute('aria-current')).toBe('page')
    fireEvent.click(home)
    expect(home.getAttribute('aria-current')).toBe('page')
    fireEvent.click(create)
    expect(create.getAttribute('aria-current')).toBe('page')
    fireEvent.click(within(navigation).getByRole('link', { name: 'How It Works' }))
    expect(screen.getByLabelText('Current location').textContent).toBe('/#how-it-works')
  })

  it('dismisses the mobile menu with Escape and returns focus to its toggle', () => {
    renderApp()
    const toggle = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(screen.getByRole('navigation', { name: 'Primary' }), { key: 'Escape' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })
})
