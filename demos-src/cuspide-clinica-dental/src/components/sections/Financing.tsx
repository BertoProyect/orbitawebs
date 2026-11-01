import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { IdCard, Landmark } from 'lucide-react'
import { useState } from 'react'
import { EASE } from '../../lib/motion'
import { useBooking } from '../../state/booking'
import { Magnetic } from '../ui/Magnetic'
import { FadeIn, WordReveal } from '../ui/WordReveal'

const PLANS = [3, 6, 12] as const

/* Escena 7: la financiación. Sin cifras ni condiciones inventadas: solo se ve cómo un mismo
   presupuesto se reparte en 3, 6 o 12 partes iguales. */
export function Financing() {
  const [n, setN] = useState<(typeof PLANS)[number]>(6)
  const reduce = useReducedMotion()
  const { request } = useBooking()

  return (
    <section id="financiacion" aria-labelledby="fin-title" className="on-night relative z-10">
      <div className="night-sheet" style={{ paddingBlock: 'var(--section)' }}>
        <div className="wrap grid12 gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <p className="eyebrow">Financiación</p>
            <WordReveal id="fin-title" text="Tu tratamiento, con la tranquilidad de saber cuánto vas a pagar." className="h2 mt-5 max-w-[15ch] text-text-light" />
            <FadeIn delay={0.2}>
              <p className="lead mt-8 max-w-[38ch]">Financiación disponible en 3, 6 o 12 cuotas sin intereses.</p>
            </FadeIn>
          </div>

          <FadeIn className="col-span-12 lg:col-span-5 lg:col-start-8 lg:self-end" delay={0.15}>
            <div className="rounded-[var(--r-stage)] border border-white/10 bg-white/[0.04] p-5 sm:p-8">
              <div role="radiogroup" aria-label="Número de cuotas" className="grid grid-cols-3 gap-1 rounded-full bg-night p-1 ring-1 ring-white/10">
                {PLANS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={n === p}
                    onClick={() => setN(p)}
                    className={`relative z-0 h-12 rounded-full text-[15px] font-semibold transition-colors duration-300 ${n === p ? 'text-night' : 'text-muted-light hover:text-text-light'}`}
                  >
                    {n === p && <motion.span layoutId="fin-pill" className="absolute inset-0 -z-10 rounded-full bg-white" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
                    {p} cuotas
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-end gap-4">
                <motion.span key={n} className="num text-[clamp(4.5rem,9vw,7.5rem)] font-medium leading-[0.82] tracking-[-0.05em] text-text-light" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                  {n}
                </motion.span>
                <span className="pb-1.5 text-[17px] leading-[1.3] text-muted-light">
                  cuotas
                  <br />
                  <span className="font-semibold text-sky">sin intereses</span>
                </span>
              </div>

              {/* El presupuesto, partido en cuotas iguales */}
              <div className="mt-7 flex h-3 gap-1" aria-hidden>
                <AnimatePresence initial={false} mode="popLayout">
                  {Array.from({ length: n }, (_, i) => (
                    <motion.span
                      key={i}
                      layout={!reduce}
                      className="h-full flex-1 origin-left rounded-full bg-sky"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1 - i * 0.04, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                    />
                  ))}
                </AnimatePresence>
              </div>
              <p className="mt-3 text-[13px] text-muted-light">Un mismo presupuesto cerrado, repartido en partes iguales.</p>

              <ul className="mt-7 grid gap-3 border-t border-white/10 pt-6 text-[15px] text-muted-light">
                <li className="flex items-center gap-3">
                  <IdCard size={18} className="text-sky" aria-hidden /> Tramitación directamente en clínica
                </li>
                <li className="flex items-center gap-3">
                  <Landmark size={18} className="text-sky" aria-hidden /> Solo necesitas tu DNI y tu cuenta bancaria
                </li>
              </ul>

              <div className="mt-8">
                <Magnetic className="btn btn--light w-full sm:w-auto" onClick={() => request({ motivo: 'Otro', nota: `Consultar financiación en ${n} cuotas` })}>
                  Consultar financiación
                </Magnetic>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
