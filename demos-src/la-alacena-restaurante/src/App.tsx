import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion'
import { Nav } from './components/Nav'
import { Booking } from './sections/Booking'
import { Carta } from './sections/Carta'
import { Contact } from './sections/Contact'
import { DailyMenu } from './sections/DailyMenu'
import { Footer, WhatsAppFloat } from './sections/Footer'
import { Groups } from './sections/Groups'
import { Hero } from './sections/Hero'
import { Faq, Reviews } from './sections/ReviewsFaq'
import { Signature } from './sections/Signature'
import { Story } from './sections/Story'
import { TrustBar } from './sections/TrustBar'
import { Wine } from './sections/Wine'

/* Barra de progreso de lectura: una línea fina de almagra arriba del todo. */
function Progress() {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-almagra" style={{ scaleX: x }} />
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-[10px] bg-nogal px-4 py-2 font-semibold text-cal transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <Progress />
      <Nav />
      <main id="main">
        <Hero />
        <TrustBar />
        <Story />
        <Signature />
        <DailyMenu />
        <Carta />
        <Wine />
        <Groups />
        <Reviews />
        <Faq />
        <Contact />
        <Booking />
      </main>
      <Footer />
      <WhatsAppFloat />
    </MotionConfig>
  )
}
