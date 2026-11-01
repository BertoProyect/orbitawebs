import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Phone } from 'lucide-react'
import { useId, useState } from 'react'
import { CLINIC, FAQ } from '../../data/clinic'
import { EASE } from '../../lib/motion'
import { FadeIn, WordReveal } from '../ui/WordReveal'

/* Preguntas frecuentes: solo una abierta a la vez, altura animada y un «+» que gira a «−». */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion()
  const uid = useId()

  return (
    <section id="preguntas" aria-labelledby="faq-title" className="section bg-white">
      <div className="wrap grid12 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+48px)]">
            <p className="eyebrow">Preguntas frecuentes</p>
            <WordReveal id="faq-title" text="Lo que suele preguntarse antes de venir." className="h2 mt-5 max-w-[11ch] !text-[clamp(2.25rem,4vw,3.5rem)]" />
            <FadeIn delay={0.2}>
              <p className="mt-6 text-[17px] leading-[1.55] text-slate">¿Tienes otra duda? Llámanos y te lo contamos.</p>
              <a href={CLINIC.tel} className="link-arrow mt-2">
                <Phone size={16} aria-hidden /> <span>{CLINIC.phone}</span>
              </a>
            </FadeIn>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          <ul>
            {FAQ.map((f, i) => {
              const on = open === i
              const btn = `${uid}-b${i}`
              const panel = `${uid}-p${i}`
              return (
                <motion.li
                  key={f.q}
                  className="border-b border-soft-line first:border-t"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.8, ease: EASE, delay: i * 0.05 }}
                >
                  <h3 className="m-0">
                    <button
                      id={btn}
                      type="button"
                      aria-expanded={on}
                      aria-controls={panel}
                      onClick={() => setOpen(on ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
                    >
                      <span className={`text-[19px] font-medium leading-[1.3] tracking-[-0.015em] transition-colors duration-300 sm:text-[22px] ${on ? 'text-night' : 'text-slate group-hover:text-night'}`}>{f.q}</span>
                      <span className={`relative grid h-10 w-10 flex-none place-items-center rounded-full transition-colors duration-500 ${on ? 'bg-night text-white' : 'bg-porcelain text-night group-hover:bg-ice'}`} aria-hidden>
                        <span className="absolute h-[1.5px] w-3.5 rounded bg-current" />
                        <motion.span className="absolute h-3.5 w-[1.5px] rounded bg-current" animate={{ rotate: on ? 90 : 0, opacity: on ? 0 : 1 }} transition={{ duration: 0.45, ease: EASE }} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        id={panel}
                        role="region"
                        aria-labelledby={btn}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: reduce ? 0 : 0.55, ease: EASE }, opacity: { duration: 0.35 } }}
                        className="overflow-hidden"
                      >
                        <motion.p className="m-0 max-w-[56ch] pb-7 pr-14 text-[17px] leading-[1.6] text-slate" initial={reduce ? false : { y: -8 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                          {f.a}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
