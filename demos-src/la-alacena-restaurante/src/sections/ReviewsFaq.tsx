import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { SectionHead } from '../components/ui'
import { Stars } from '../components/Stars'
import { FAQ, RESTAURANT, REVIEWS } from '../data/restaurant'
import { EASE, VIEW } from '../lib/motion'

export function Reviews() {
  return (
    <section aria-labelledby="opiniones-title" className="bg-cal py-24 md:py-36">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead id="opiniones-title" eyebrow="Opiniones" title={['Lo que se cuenta', 'alrededor de una mesa.']} />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={VIEW}
            className="flex items-center gap-3 text-[15px] text-apagado"
          >
            <span className="num font-serif text-[44px] leading-none text-nogal">{RESTAURANT.rating}</span>
            <span>
              <Stars className="text-almagra" />
              <span className="block">{RESTAURANT.reviews} opiniones en Google</span>
            </span>
          </motion.p>
        </div>
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.li
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className={`flex flex-col rounded-[14px] border border-nogal/12 bg-blanco p-7 md:p-8 ${i === 1 ? 'md:mt-8 md:-mb-8' : ''}`}
            >
              <span aria-hidden className="font-serif text-[64px] leading-[0.6] text-almagra/80">“</span>
              <blockquote className="m-0 mt-4 flex-1 font-serif text-[clamp(1.15rem,1.7vw,1.3rem)] leading-snug text-nogal">
                {r.text}
              </blockquote>
              <p className="mt-6 flex items-center justify-between gap-3 border-t border-nogal/10 pt-4 text-[15px] font-semibold text-nogal">
                {r.name}
                <Stars className="text-almagra" size={13} />
              </p>
            </motion.li>
          ))}
        </ul>
        <p className="mt-16 text-[14px] text-apagado md:mt-20">Resúmenes de lo que nos cuentan nuestros clientes, no citas literales de Google.</p>
      </div>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const base = useId()
  return (
    <section aria-labelledby="faq-title" className="border-t border-nogal/10 bg-cal py-24 md:py-32">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead id="faq-title" eyebrow="Antes de venir" title={['Preguntas', 'frecuentes']} />
        </div>
        <ul className="lg:col-span-8">
          {FAQ.map((f, i) => {
            const on = open === i
            return (
              <motion.li
                key={f.q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
                className="border-b border-nogal/15"
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    id={`${base}-q${i}`}
                    aria-expanded={on}
                    aria-controls={`${base}-a${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left font-serif text-[clamp(1.2rem,2vw,1.45rem)] text-nogal"
                  >
                    {f.q}
                    <motion.span
                      animate={{ rotate: on ? 45 : 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${on ? 'border-almagra bg-almagra text-cal' : 'border-nogal/25'}`}
                    >
                      <Plus size={18} aria-hidden />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`${base}-a${i}`}
                      role="region"
                      aria-labelledby={`${base}-q${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[60ch] pb-7 pr-12 text-[17px] leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
