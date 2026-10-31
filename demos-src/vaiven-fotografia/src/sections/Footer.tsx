import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { BrandMark, scrollToTop } from '../components/ui'
import { BASE, BRAND, WHATSAPP } from '../data/site'

const LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#historias', label: 'Historias' },
  { href: '#como-trabajo', label: 'Cómo trabajo' },
  { href: '#contacto', label: 'Contacto' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="wrap grid gap-10 py-14 md:grid-cols-12 md:gap-8 md:py-16">
        <div className="md:col-span-5">
          <a href="#inicio" onClick={scrollToTop} className="inline-flex items-center gap-2.5" aria-label={`${BRAND.legalName}, volver al inicio`}>
            <BrandMark className="h-5 w-auto" />
            <span className="text-[26px] font-medium tracking-[-0.045em]">{BRAND.name}</span>
          </a>
          <p className="mt-3 text-[15px] text-muted">Fotografía de bodas en Huelva.</p>
        </div>
        <nav aria-label="Pie de página" className="md:col-span-7 md:justify-self-end">
          <ul className="flex flex-wrap gap-x-7 gap-y-3 text-[15px]">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={l.href === '#inicio' ? scrollToTop : undefined} className="text-fg-2 transition-colors hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="wrap flex flex-col gap-5 border-t border-border py-6 text-[13px] text-muted md:flex-row md:items-center md:justify-between">
        <p>© 2026 {BRAND.legalName}. Todos los derechos reservados.</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li><a href={`${BASE}/aviso-legal/`} className="transition-colors hover:text-fg">Aviso legal</a></li>
          <li><a href={`${BASE}/privacidad/`} className="transition-colors hover:text-fg">Privacidad</a></li>
          <li><a href={`${BASE}/cookies/`} className="transition-colors hover:text-fg">Cookies</a></li>
        </ul>
        {/* Crédito de Órbita: «By» + logo muy pequeño. Horizontal en escritorio, apilado en móvil. */}
        <a href="https://orbitawebs.com" target="_blank" rel="noopener" className="inline-flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
          <span>By</span>
          <picture>
            <source media="(min-width: 768px)" srcSet={`${BASE}/brand/orbita-logo-horizontal.webp`} width={98} height={14} />
            <img src={`${BASE}/brand/orbita-logo-apilado.webp`} width={48} height={28} alt="Órbita Webs" loading="lazy" decoding="async" />
          </picture>
        </a>
      </div>
    </footer>
  )
}

/* WhatsApp siempre a mano, discreto: aparece al dejar la portada y se aparta en la zona de contacto. */
export function WhatsAppFloat() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    const contact = document.getElementById('contacto')
    const nearContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.85 : false
    const next = v > window.innerHeight * 0.8 && !nearContact
    setShow((s) => (s === next ? s : next))
  })
  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={WHATSAPP}
          target="_blank"
          rel="noopener"
          aria-label="Escribir a Irene por WhatsApp"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-fg text-white shadow-[0_10px_30px_-10px_rgba(9,9,11,0.45)] md:bottom-7 md:right-7 md:h-14 md:w-14"
        >
          <MessageCircle size={21} strokeWidth={1.75} aria-hidden />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
