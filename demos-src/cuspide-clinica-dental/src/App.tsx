import { MotionConfig } from 'framer-motion'
import { Booking } from './components/booking/Booking'
import { Contact } from './components/contact/Contact'
import { Explorer } from './components/dental-explorer/Explorer'
import { Faq } from './components/faq/Faq'
import { Hero } from './components/hero/Hero'
import { CursorLabel, ScrollProgress } from './components/layout/Chrome'
import { Footer } from './components/layout/Footer'
import { Nav } from './components/layout/Nav'
import { Financing } from './components/sections/Financing'
import { FirstVisit } from './components/sections/FirstVisit'
import { Trust } from './components/sections/Trust'
import { Team } from './components/team/Team'
import { Treatments } from './components/treatments/Treatments'
import { BookingProvider } from './state/booking'

/* La web como una película en escenas:
   portada → promesa → tratamientos → boca 3D → primera visita → equipo → financiación
   → preguntas → cita → contacto. */
export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BookingProvider>
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        <ScrollProgress />
        <Nav />
        <main id="contenido">
          <Hero />
          <Trust />
          <Treatments />
          <Explorer />
          <Team />
          <FirstVisit />
          <Financing />
          <Faq />
          <Booking />
          <Contact />
        </main>
        <Footer />
        <CursorLabel />
      </BookingProvider>
    </MotionConfig>
  )
}
