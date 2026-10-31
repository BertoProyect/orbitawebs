import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NAV, RESTAURANT } from '../data/restaurant'
import { useActiveSection } from '../lib/hooks'
import { EASE } from '../lib/motion'
import { BrandMark } from './BrandMark'

const IDS = NAV.map((n) => n.id)

export function Nav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(IDS)
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 40))

  /* Menú móvil: bloquea el scroll de fondo y se cierra con Escape. */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const light = !solid && !open // texto claro sobre la foto de portada

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          solid && !open ? 'bg-cal/85 shadow-[0_1px_0_rgba(42,31,24,0.1)] backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="wrap flex h-[68px] items-center justify-between gap-6">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`flex items-center gap-2.5 transition-colors duration-500 ${light ? 'text-cal' : 'text-nogal'}`}
            aria-label="La Alacena, volver al inicio"
          >
            <BrandMark className="h-8 w-8" />
            <span className="font-serif text-[19px] tracking-[0.06em]">LA ALACENA</span>
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    aria-current={active === n.id ? 'true' : undefined}
                    className={`relative block px-3.5 py-2 text-[15px] font-medium transition-colors duration-300 ${
                      light ? 'text-cal/85 hover:text-cal' : 'text-texto hover:text-nogal'
                    }`}
                  >
                    {n.label}
                    {active === n.id && (
                      <motion.span
                        layoutId="nav-dot"
                        className={`absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full ${light ? 'bg-cal' : 'bg-almagra'}`}
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <span
              className={`hidden items-center gap-1.5 text-[14px] xl:flex ${light ? 'text-cal/80' : 'text-apagado'}`}
            >
              <MapPin size={15} aria-hidden /> {RESTAURANT.city}
            </span>
            <a
              href="#reserva"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-[10px] bg-almagra px-4 text-[15px] font-semibold text-cal transition-colors hover:bg-almagra-2 active:scale-[0.97] sm:px-5"
            >
              Reservar mesa
            </a>
            <button
              type="button"
              className={`relative grid h-11 w-11 place-items-center rounded-[10px] lg:hidden ${light ? 'text-cal' : 'text-nogal'}`}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3.5 w-6">
                <motion.span
                  className="absolute left-0 top-0 h-[2px] w-6 rounded-full bg-current"
                  animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 h-[2px] w-6 rounded-full bg-current"
                  animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
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
            className="fixed inset-0 z-40 flex flex-col bg-cal pt-[68px] lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Menú móvil" className="wrap flex flex-1 flex-col justify-center">
              <ul>
                {NAV.map((n, i) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + i * 0.06, duration: 0.6, ease: EASE }}
                    className="border-b border-nogal/10"
                  >
                    <a
                      href={`#${n.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4 font-serif text-[34px] leading-tight text-nogal"
                    >
                      {n.label}
                      {active === n.id && <span className="h-2 w-2 rounded-full bg-almagra" aria-hidden />}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-10 text-[15px] text-apagado"
              >
                {RESTAURANT.street} · {RESTAURANT.city}
                <br />
                <a href={RESTAURANT.phoneHref} className="font-semibold text-nogal underline-offset-4 hover:underline">
                  {RESTAURANT.phoneDisplay}
                </a>
              </motion.p>
            </nav>
            <div className="zocalo" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
