import { MotionConfig } from 'framer-motion'
import { Nav } from './components/Nav'
import { About } from './sections/About'
import { Contact, FinalCta } from './sections/Closing'
import { DateCheck } from './sections/DateCheck'
import { Faq } from './sections/Faq'
import { Footer, WhatsAppFloat } from './sections/Footer'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { Intro, Reel } from './sections/Intro'
import { Investment } from './sections/Investment'
import { Pause } from './sections/Pause'
import { Process } from './sections/Process'

/* Cinco capítulos (los de la navegación). Cada uno agrupa sus secciones para que el
 * capítulo activo se marque bien mientras se baja. */
export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="fixed left-4 top-3 z-[90] -translate-y-24 rounded-[8px] bg-fg px-4 py-2.5 text-[14px] font-medium text-white transition-transform focus:translate-y-0">
        Saltar al contenido
      </a>
      <Nav />
      <main id="main">
        <div id="inicio">
          <Hero />
          <Reel />
          <Intro />
        </div>
        <div id="historias">
          <Gallery />
          <Pause />
        </div>
        <div id="como-trabajo">
          <Process />
          <About />
        </div>
        <div id="inversion">
          <Investment />
          <DateCheck />
          <Faq />
          <FinalCta />
        </div>
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </MotionConfig>
  )
}
