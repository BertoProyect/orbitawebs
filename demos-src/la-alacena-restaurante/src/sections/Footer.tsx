import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { BASE, RESTAURANT } from '../data/restaurant'
import { EASE } from '../lib/motion'
import { waGeneric } from '../lib/whatsapp'

const LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#historia', label: 'Historia' },
  { href: '#carta', label: 'Carta' },
  { href: '#grupos', label: 'Grupos' },
  { href: '#contacto', label: 'Contacto' },
]

export function Footer() {
  return (
    <motion.footer
      className="on-dark relative bg-verde text-tiza"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1 }}
    >
      <div className="zocalo" aria-hidden />
      <div className="wrap grid gap-12 pb-28 pt-20 md:grid-cols-12 md:pb-16">
        <motion.div
          className="md:col-span-5"
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
        >
          <p className="flex items-center gap-3 text-cal">
            <BrandMark className="h-10 w-10" />
            <span className="font-serif text-[26px] tracking-[0.06em]">LA ALACENA</span>
          </p>
          <p className="mt-5 max-w-[24ch] font-serif text-[24px] leading-snug text-tiza/85">{RESTAURANT.slogan}</p>
        </motion.div>
        <nav aria-label="Pie de página" className="md:col-span-2">
          <p className="text-[14px] font-semibold text-tiza/60">Navegación</p>
          <ul className="mt-3 space-y-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-[16px] text-tiza/90 underline-offset-4 hover:text-cal hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="text-[14px] font-semibold text-tiza/60">Contacto</p>
          <address className="mt-3 space-y-1 text-[16px] not-italic text-tiza/90">
            <p>{RESTAURANT.street}</p>
            <p>
              {RESTAURANT.postal} {RESTAURANT.city}
            </p>
            <p>
              <a href={RESTAURANT.phoneHref} className="underline-offset-4 hover:text-cal hover:underline">
                {RESTAURANT.phoneDisplay}
              </a>
            </p>
          </address>
        </div>
        <div className="md:col-span-2">
          <p className="text-[14px] font-semibold text-tiza/60">Horario</p>
          <p className="mt-3 text-[15px] leading-relaxed text-tiza/90">
            Martes a sábado
            <br />
            13:00–16:30 y 20:00–23:30
            <br />
            Domingo 13:00–16:30
            <br />
            Lunes cerrado
          </p>
        </div>
      </div>
      <div className="wrap flex flex-col gap-4 border-t border-tiza/15 py-6 text-[14px] text-tiza/70 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 La Alacena.</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a href={`${BASE}/aviso-legal/`} className="hover:text-cal">
              Aviso legal
            </a>
          </li>
          <li>
            <a href={`${BASE}/privacidad/`} className="hover:text-cal">
              Privacidad
            </a>
          </li>
          <li>
            <a href={`${BASE}/cookies/`} className="hover:text-cal">
              Cookies
            </a>
          </li>
        </ul>
        <a href="https://orbitawebs.com" target="_blank" rel="noopener" className="inline-flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100">
          <span>By</span>
          <picture>
            <source media="(min-width: 768px)" srcSet={`${BASE}/brand/orbita-logo-horizontal-white.webp`} width={106} height={15} />
            <img src={`${BASE}/brand/orbita-logo-apilado-white.webp`} width={48} height={28} alt="Órbita Webs" loading="lazy" decoding="async" />
          </picture>
        </a>
      </div>
    </motion.footer>
  )
}

/* Botón flotante de WhatsApp: aparece al dejar atrás la portada. */
export function WhatsAppFloat() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    const nearEnd = v + window.innerHeight > document.documentElement.scrollHeight - 520
    setShow(v > window.innerHeight * 0.7 && !nearEnd)
  })
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={waGeneric}
          target="_blank"
          rel="noopener"
          aria-label="Reservar por WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#1f7a4d] pl-4 pr-5 font-semibold text-white shadow-[0_14px_30px_-12px_rgba(20,60,40,0.7)] md:bottom-7 md:right-7"
        >
          <MessageCircle size={22} aria-hidden />
          <span className="text-[15px]">Reservar</span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
