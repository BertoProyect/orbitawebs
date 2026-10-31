import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { Info } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button, Lines, Reveal } from '../components/ui'
import { DAILY } from '../data/restaurant'
import { EASE, VIEW } from '../lib/motion'

/* El precio cuenta hasta 14,50 € cuando la carta entra en pantalla. */
function Price() {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduce = useReducedMotion()
  const v = useMotionValue(reduce ? DAILY.price : 0)
  const text = useTransform(v, (x) => x.toFixed(2).replace('.', ','))
  useEffect(() => {
    if (!seen || reduce) return
    const c = animate(v, DAILY.price, { duration: 1.6, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [seen, reduce, v])
  return (
    <span ref={ref} className="num" aria-label={DAILY.priceLabel}>
      <motion.span aria-hidden>{text}</motion.span>
      <span aria-hidden className="ml-1 text-[0.55em]">€</span>
    </span>
  )
}

export function DailyMenu() {
  return (
    <section id="menu-del-dia" aria-labelledby="dia-title" className="on-dark relative overflow-hidden bg-verde py-24 text-tiza md:py-36">
      <div className="wrap grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="eyebrow">De martes a viernes</span>
          </Reveal>
          <Lines id="dia-title" lines={['El menú que sabe', 'a mercado.']} className="display mt-5 text-cal" />
          <Reveal delay={0.15} as="p" className="lead mt-6 text-tiza/85">
            Cada día cocinamos con lo que nos ofrece el mercado.
          </Reveal>
          <Reveal delay={0.25} className="mt-8 space-y-1.5 text-[16px] text-tiza/80">
            <p className="font-semibold text-cal">{DAILY.when}</p>
            <p>{DAILY.includes}</p>
          </Reveal>
          <Reveal delay={0.35} className="mt-9">
            <Button href="#reserva" variant="light">
              Reservar mi menú
            </Button>
          </Reveal>
        </div>

        {/* La carta del día, impresa en papel grueso */}
        <motion.article
          aria-label={`Menú del día, ${DAILY.priceLabel}`}
          className="relative rounded-[6px] bg-blanco px-7 py-10 text-texto shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)] md:px-14 md:py-14 lg:col-span-6 lg:col-start-7"
          initial={{ opacity: 0, y: 60, rotate: 1.4 }}
          whileInView={{ opacity: 1, y: 0, rotate: -0.6 }}
          viewport={VIEW}
          transition={{ duration: 1.3, ease: EASE }}
        >
          <div className="pointer-events-none absolute inset-3 rounded-[3px] border border-nogal/15" aria-hidden />
          <header className="flex items-end justify-between gap-6 border-b border-nogal/15 pb-6">
            <div>
              <p className="font-serif text-[22px] text-nogal">Menú del día</p>
              <p className="mt-1 text-[14px] text-apagado">13:00 a 16:00</p>
            </div>
            <p className="font-serif text-[clamp(3rem,7vw,4.6rem)] leading-none text-almagra">
              <Price />
            </p>
          </header>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEW}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.4 } } }}
          >
            {DAILY.courses.map((c) => (
              <motion.section
                key={c.title}
                className="mt-8"
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
              >
                <h3 className="flex items-center gap-4 font-serif text-[15px] tracking-[0.18em] text-almagra">
                  {c.title.toUpperCase()}
                  <motion.span
                    className="h-px flex-1 origin-left bg-almagra/30"
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1, ease: EASE } } }}
                  />
                </h3>
                <ul className="mt-3 space-y-2">
                  {c.items.map((it) => (
                    <li key={it} className="font-serif text-[clamp(1.05rem,1.8vw,1.25rem)] leading-snug text-nogal">
                      {it}
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </motion.div>
          <p className="mt-9 flex gap-3 rounded-[10px] bg-estraza/70 p-4 text-[15px] leading-relaxed">
            <Info size={18} className="mt-0.5 shrink-0 text-almagra" aria-hidden />
            {DAILY.notice}
          </p>
        </motion.article>
      </div>
    </section>
  )
}
