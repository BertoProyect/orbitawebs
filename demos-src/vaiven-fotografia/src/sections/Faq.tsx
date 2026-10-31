import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState, type KeyboardEvent } from 'react'
import { Eyebrow, Lines, Reveal } from '../components/ui'
import { FAQ } from '../data/site'
import { EASE } from '../lib/motion'

/* Preguntas · acordeón numerado, sin cajas: filetes y una cruz que gira.
 * Solo una abierta a la vez. Teclado: ↑ ↓ entre preguntas, Inicio/Fin a la primera/última. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = FAQ.length
    const to = e.key === 'ArrowDown' ? (i + 1) % n : e.key === 'ArrowUp' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (to < 0) return
    e.preventDefault()
    refs.current[to]?.focus()
  }

  return (
    <section aria-labelledby="faq-title" className="bg-white py-24 md:py-36">
      <div className="wrap grid grid-cols-12 gap-x-5 gap-y-12 md:gap-x-8">
        <header className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Eyebrow>Antes de dar el paso</Eyebrow>
            <Lines id="faq-title" lines={['Algunas cosas', 'que quizá', 'os preguntáis.']} className="mt-8 text-[clamp(2.1rem,3.6vw,3.4rem)] leading-[1.02] tracking-[-0.045em]" />
          </div>
        </header>

        <Reveal className="col-span-12 lg:col-span-7 lg:col-start-6">
          <ul className="border-t border-fg">
            {FAQ.map((f, i) => {
              const isOpen = open === i
              const id = `faq-${i}`
              return (
                <li key={f.q} className="border-b border-border">
                  <h3 className="m-0 text-[inherit] font-[inherit] leading-[inherit] tracking-[inherit]">
                    <button
                      ref={(el) => {
                        refs.current[i] = el
                      }}
                      type="button"
                      id={`${id}-q`}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-a`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      onKeyDown={(e) => onKey(e, i)}
                      className="group flex w-full items-start gap-5 py-6 text-left md:gap-8 md:py-7"
                    >
                      <span className="w-6 shrink-0 pt-1 text-[12px] tabular-nums text-muted">{String(i + 1).padStart(2, '0')}</span>
                      <span className={`flex-1 text-[18px] font-medium leading-[1.35] tracking-[-0.02em] transition-opacity duration-300 md:text-[21px] ${isOpen ? '' : 'opacity-80 group-hover:opacity-100'}`}>
                        {f.q}
                      </span>
                      <span aria-hidden className="relative mt-1.5 h-4 w-4 shrink-0">
                        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                        <motion.span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" animate={{ rotate: isOpen ? 0 : 90 }} transition={{ duration: 0.45, ease: EASE }} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`${id}-a`}
                        role="region"
                        aria-labelledby={`${id}-q`}
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.5, ease: EASE }, opacity: { duration: 0.3 } }}
                      >
                        <p className="max-w-[56ch] pb-7 pl-11 text-[16px] leading-[1.65] text-fg-2 md:pl-14 md:text-[17px]">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
