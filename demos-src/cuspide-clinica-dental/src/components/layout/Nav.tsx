import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BASE, CLINIC, NAV } from '../../data/clinic'
import { useActiveSection } from '../../lib/hooks'
import { EASE } from '../../lib/motion'
import { Logo } from '../ui/Logo'
import { Magnetic } from '../ui/Magnetic'

/* Todas las escenas: así el indicador sabe también cuándo estás en una que no sale en el menú. */
const SCENES = ['inicio', 'confianza', 'tratamientos', 'tu-boca', 'equipo', 'primera-visita', 'financiacion', 'preguntas', 'cita', 'contacto'] as const
const ALIAS: Record<string, string> = { confianza: 'inicio', 'tu-boca': 'tratamientos' }

/* ¿Hay una sección azul noche debajo de la barra? */
const overNight = () => {
  const y = 32
  return [...document.querySelectorAll<HTMLElement>('.on-night')].some((el) => {
    const r = el.getBoundingClientRect()
    return r.top <= y && r.bottom >= y
  })
}

export function Nav() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const scene = useActiveSection(SCENES)
  const active = ALIAS[scene] ?? scene
  const [dark, setDark] = useState(false)
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const toggleRef = useRef<HTMLButtonElement>(null)

  useMotionValueEvent(scrollY, 'change', (v) => {
    setSolid(v > 24)
    setDark(overNight())
  })
  const night = dark && !open

  // Menú móvil: bloquea el fondo, cierra con Escape y devuelve el foco al botón.
  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    return () => {
      html.style.overflow = prev
      window.removeEventListener('keydown', key)
      toggleRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => mq.matches && setOpen(false)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          night
            ? 'bg-night/75 shadow-[0_1px_0_rgba(244,247,251,0.08)] backdrop-blur-xl backdrop-saturate-150'
            : solid || open
              ? 'bg-white/80 shadow-[0_1px_0_var(--soft-line)] backdrop-blur-xl backdrop-saturate-150'
              : 'bg-transparent'
        }`}
        style={{ height: 'var(--nav-h)' }}
      >
        <div className="wrap flex h-full items-center justify-between gap-6">
          <a href={`${BASE}/`} className="relative z-10 -ml-1 flex items-center rounded-md p-1" onClick={() => setOpen(false)}>
            <Logo className="h-[22px] w-auto" tone={night ? 'light' : 'dark'} />
            <span className="sr-only">Cúspide Clínica Dental, inicio</span>
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => {
                const on = active === n.id
                return (
                  <li key={n.id}>
                    <a
                      href={`#${n.id}`}
                      aria-current={on ? 'true' : undefined}
                      className={`group relative block rounded-full px-3.5 py-2 text-[14px] font-medium tracking-[-0.005em] transition-colors duration-300 ${on ? (night ? 'text-white' : 'text-night') : night ? 'text-muted-light hover:text-white' : 'text-mist hover:text-night'}`}
                    >
                      {n.label}
                      {on && (
                        <motion.span
                          layoutId="nav-indicator"
                          className={`absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full ${night ? 'bg-sky' : 'bg-blue'}`}
                          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                        />
                      )}
                      {!on && (
                        <span className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 bg-line transition-transform duration-500 ease-[var(--ease)] group-hover:scale-x-100" />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <a href={CLINIC.tel} className={`hidden items-center gap-2 rounded-full px-3 py-2 text-[14px] font-medium transition-colors xl:inline-flex ${night ? 'text-muted-light hover:text-white' : 'text-slate hover:text-night'}`}>
              <Phone size={15} aria-hidden /> {CLINIC.phone}
            </a>
            <Magnetic href="#cita" className="btn btn--sm hidden sm:inline-flex" strength={0.2}>
              Pedir cita
            </Magnetic>
            <button
              ref={toggleRef}
              type="button"
              className="relative grid h-11 w-11 place-items-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5" aria-hidden>
                <motion.span className={`absolute left-0 top-0 h-[1.5px] w-5 rounded ${night ? 'bg-white' : 'bg-night'}`} animate={open ? { y: 5.25, rotate: 45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.45, ease: EASE }} />
                <motion.span className={`absolute bottom-0 left-0 h-[1.5px] w-5 rounded ${night ? 'bg-white' : 'bg-night'}`} animate={open ? { y: -5.25, rotate: -45 } : { y: 0, rotate: 0 }} transition={{ duration: 0.45, ease: EASE }} />
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
            className="fixed inset-0 z-40 flex flex-col bg-white px-[var(--gutter)] pb-8 lg:hidden"
            style={{ paddingTop: 'calc(var(--nav-h) + 24px)' }}
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Menú móvil" className="flex-1">
              <ul>
                {NAV.map((n, i) => (
                  <li key={n.id} className="overflow-hidden border-b border-soft-line">
                    <motion.a
                      href={`#${n.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4 text-[clamp(1.75rem,8vw,2.5rem)] font-semibold tracking-[-0.03em]"
                      initial={reduce ? false : { y: '100%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.22 + i * 0.06 }}
                    >
                      {n.label}
                      <span className="num text-[13px] font-medium tracking-normal text-mist">0{i + 1}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="grid gap-3"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
            >
              <a href="#cita" className="btn w-full" onClick={() => setOpen(false)}>
                Pedir mi primera cita
              </a>
              <a href={CLINIC.tel} className="btn btn--ghost w-full">
                <Phone size={17} aria-hidden /> Llamar al {CLINIC.phone}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
