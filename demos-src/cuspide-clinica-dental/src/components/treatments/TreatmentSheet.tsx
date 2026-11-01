import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { srcset, type Treatment } from '../../data/clinic'
import { useBooking } from '../../state/booking'
import { EASE, EASE_IN_OUT } from '../../lib/motion'
import { useDesktop } from '../../lib/hooks'

/* Ficha del tratamiento: panel lateral en escritorio y hoja desde abajo en móvil.
   Solo cuenta lo que la clínica ha dicho; nada de precios ni promesas clínicas. */
const HOW = [
  'Primera visita gratis: revisión, radiografía digital y diagnóstico.',
  'Te explicamos las opciones con palabras claras, en la pantalla.',
  'Presupuesto cerrado y por escrito antes de empezar.',
  'Si lo necesitas, 3, 6 o 12 cuotas sin intereses.',
]

export function TreatmentSheet({ treatment, onClose }: { treatment: Treatment | null; onClose: () => void }) {
  const desktop = useDesktop()
  const reduce = useReducedMotion()
  const { request } = useBooking()
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  // La cita se abre cuando la ficha ha terminado de salir (antes, el scroll aún está bloqueado).
  const pending = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!treatment) return
    lastFocus.current = document.activeElement as HTMLElement
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    const f = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60)
    return () => {
      html.style.overflow = prev
      window.removeEventListener('keydown', key)
      window.clearTimeout(f)
      lastFocus.current?.focus({ preventScroll: true })
    }
  }, [treatment, onClose])

  const panel = desktop
    ? { initial: { x: '104%' }, animate: { x: 0 }, exit: { x: '104%' } }
    : { initial: { y: '104%' }, animate: { y: 0 }, exit: { y: '104%' } }

  return (
    <AnimatePresence
      onExitComplete={() => {
        pending.current?.()
        pending.current = null
      }}
    >
      {treatment && (
        <motion.div className="fixed inset-0 z-[60]" initial="i" animate="a" exit="e">
          <motion.button
            type="button"
            aria-label="Cerrar"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-night/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-30px_80px_-30px_rgba(11,27,51,0.5)] lg:inset-y-3 lg:left-auto lg:right-3 lg:max-h-none lg:w-[min(560px,44vw)] lg:rounded-[28px]"
            {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : panel)}
            transition={{ duration: 0.75, ease: EASE_IN_OUT }}
          >
            <div className="relative aspect-[16/10] flex-none overflow-hidden bg-ice">
              <motion.img
                src={treatment.img.src(960)}
                srcSet={srcset(treatment.img, [640, 960, 1280])}
                sizes="(min-width: 1024px) 560px, 100vw"
                alt={treatment.img.alt}
                className="h-full w-full object-cover"
                initial={reduce ? false : { scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.4, ease: EASE }}
              />
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar ficha" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-night shadow-sm backdrop-blur transition-transform hover:scale-105">
                <X size={20} aria-hidden />
              </button>
            </div>
            <motion.div
              className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-7 sm:px-9"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            >
              <p className="num text-[13px] font-semibold tracking-[0.08em] text-blue">{treatment.n} · Tratamiento</p>
              <h2 id="sheet-title" className="h2 mt-3 !text-[clamp(2rem,4vw,2.75rem)]">
                {treatment.title}
              </h2>
              <p className="lead mt-4">{treatment.text}</p>
              <div className="hairline my-7" />
              <h3 className="text-[15px] font-semibold">Cómo empezamos</h3>
              <ul className="mt-4 grid gap-3">
                {HOW.map((h) => (
                  <li key={h} className="flex gap-3 text-[16px] leading-[1.5] text-slate">
                    <span className="mt-[3px] grid h-5 w-5 flex-none place-items-center rounded-full bg-ice text-blue">
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn mt-8 w-full sm:w-auto"
                onClick={() => {
                  const t = treatment
                  pending.current = () => request({ motivo: t.motivo, nota: `Me interesa: ${t.title.toLowerCase()}` })
                  onClose()
                }}
              >
                Pedir cita para {treatment.title.toLowerCase()}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
