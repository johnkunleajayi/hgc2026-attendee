import { EventDetailsSection } from './EventDetailsSection'
import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'
import './home.css'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <EventDetailsSection />
    </>
  )
}
