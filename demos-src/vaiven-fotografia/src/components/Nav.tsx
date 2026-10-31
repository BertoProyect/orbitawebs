import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BRAND, NAV, WHATSAPP } from '../data/site'
import { useActiveSection, useScrollLock } from '../lib/hooks'
import { EASE } from '../lib/motion'
import { BrandMark, scrollToTop } from './ui'

const IDS = NAV.map((n) => n.id)

/* Navegación: transparente sobre la portada, blanca con un filete al bajar.
 * En escritorio una línea fina marca el capítulo en el que estás. En móvil, menú a pantalla completa. */
export function Nav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(IDS)
  const btnRef = useRef<HTMLButtonElement>(null)
  useScrollLock(open)

  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 24))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  /* Si se agranda la ventana con el menú abierto, se cierra. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => mq.matches && setOpen(false)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const light = !solid && !open
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-500 ease-[var(--ease-expo)] ${
          light ? 'border-b border-transparent text-white' : 'border-b border-border bg-white/95 text-fg backdrop-blur-md supports-[backdrop-filter]:bg-white/85'
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between gap-6 md:h-[72px]">
          <a href="#inicio" onClick={(e) => { setOpen(false); scrollToTop(e) }} className="flex items-center gap-2.5" aria-label={`${BRAND.legalName}, volver al inicio`}>
            <BrandMark className="h-[18px] w-auto" />
            <span className="text-[21px] font-medium tracking-[-0.04em]">{BRAND.name}</span>
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={active === l.id ? 'true' : undefined}
                    className={`relative block px-3.5 py-2 text-[14px] transition-opacity duration-300 ${active === l.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                  >
                    {l.label}
                    {active === l.id && !light && (
                      <motion.span layoutId="nav-dot" className="absolute inset-x-3.5 -bottom-px h-px bg-current" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#fecha"
              onClick={() => setOpen(false)}
              className={`btn hidden !min-h-10 !px-4 !text-[14px] sm:inline-flex ${light ? 'bg-white text-fg hover:bg-surface-2' : 'bg-primary text-white hover:bg-primary-hover'}`}
            >
              Comprobar fecha
            </a>
            <button
              ref={btnRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className="relative -mr-2 grid h-11 w-11 place-items-center lg:hidden"
            >
              <span className="relative block h-3 w-[22px]">
                <motion.span className="absolute left-0 top-0 h-[1.5px] w-full bg-current" animate={open ? { y: 5.25, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.4, ease: EASE }} />
                <motion.span className="absolute bottom-0 left-0 h-[1.5px] w-full bg-current" animate={open ? { y: -5.25, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.4, ease: EASE }} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fixed inset-0 z-40 flex flex-col bg-white pt-16 lg:hidden"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Menú móvil" className="wrap flex flex-1 flex-col justify-center pb-10">
              <ul>
                {NAV.map((l, i) => (
                  <li key={l.id} className="overflow-hidden border-b border-border">
                    <motion.a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4 text-[clamp(2rem,9vw,2.75rem)] font-medium tracking-[-0.045em]"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%', transition: { duration: 0.25 } }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.18 + i * 0.05 }}
                    >
                      <span>{l.label}</span>
                      <span className="text-[13px] font-normal tracking-normal text-muted tabular-nums">{l.n}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
              <motion.div
                className="mt-10 flex flex-col gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
              >
                <a href="#fecha" onClick={() => setOpen(false)} className="btn bg-primary text-white">
                  Comprobar fecha
                </a>
                <a href={WHATSAPP} target="_blank" rel="noopener" className="btn border border-border-strong">
                  Escribir por WhatsApp
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
