import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { DAILY } from '../data/restaurant'

/* La pizarra del comedor, dibujada en código: se escribe línea a línea con tiza y, al rato, un
 * plato se tacha porque se ha terminado. Es lo que cuenta el capítulo de las 11:30. */
const LINES = [
  { group: 'Primeros', items: [DAILY.courses[0].items[0], DAILY.courses[0].items[1]] },
  { group: 'Segundos', items: [DAILY.courses[1].items[0], DAILY.courses[1].items[2]] },
]
const SOLD_OUT = DAILY.courses[1].items[0]

export function Pizarra() {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const reduce = useReducedMotion()
  let n = 0
  const write = (i: number) => ({
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: seen ? { clipPath: 'inset(0 0% 0 0)' } : {},
    transition: { duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.25 + i * 0.32, ease: [0.45, 0, 0.25, 1] as const },
  })
  const strikeDelay = 0.25 + 7 * 0.32 + 1.1

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Pizarra del menú del día: ${DAILY.priceLabel}. ${SOLD_OUT}, tachado porque se ha terminado.`}
      className="relative mx-auto max-w-[620px] rounded-[16px] bg-[#6e4a31] p-3 shadow-[0_30px_60px_-30px_rgba(42,31,24,0.55)] md:p-4"
    >
      <svg className="absolute h-0 w-0" aria-hidden>
        <filter id="tiza">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="r" />
          <feDisplacementMap in="SourceGraphic" in2="r" scale="1.6" />
        </filter>
      </svg>
      <div
        aria-hidden
        className="relative overflow-hidden rounded-[8px] px-7 py-8 text-tiza md:px-11 md:py-11"
        style={{
          background:
            'radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,0.07), transparent 60%), radial-gradient(80% 70% at 80% 90%, rgba(255,255,255,0.05), transparent 70%), #26302b',
        }}
      >
        <div style={{ filter: 'url(#tiza)' }}>
          <motion.p {...write(n++)} className="font-serif text-[clamp(1.9rem,4vw,2.7rem)] leading-none text-tiza">
            Menú del día
          </motion.p>
          <motion.p {...write(n++)} className="mt-2 font-serif text-[28px] text-ocre">
            {DAILY.priceLabel}
          </motion.p>
          {LINES.map((g) => (
            <div key={g.group} className="mt-6">
              <motion.p {...write(n++)} className="text-[13px] font-bold uppercase tracking-[0.18em] text-tiza/60">
                {g.group}
              </motion.p>
              {g.items.map((it) => {
                const w = write(n++)
                return (
                <div key={it} className="relative mt-2 w-fit">
                  <motion.p
                    initial={w.initial}
                    animate={seen ? { clipPath: 'inset(0 0% 0 0)', opacity: it === SOLD_OUT ? 0.45 : 1 } : {}}
                    transition={{
                      clipPath: w.transition,
                      opacity: { delay: reduce ? 0 : strikeDelay + 0.3, duration: 0.6 },
                    }}
                    className="font-serif text-[clamp(1.1rem,2.2vw,1.4rem)] leading-snug"
                  >
                    {it}
                  </motion.p>
                  {it === SOLD_OUT && (
                    <svg viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute inset-x-[-4%] top-1/2 h-4 w-[108%] -translate-y-1/2">
                      <motion.path
                        d="M2 12 C 60 6, 120 15, 180 9 S 270 8, 298 11"
                        fill="none"
                        stroke="#eeede4"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={seen ? { pathLength: 1 } : {}}
                        transition={{ delay: reduce ? 0 : strikeDelay, duration: reduce ? 0 : 0.7, ease: 'easeOut' }}
                      />
                    </svg>
                  )}
                </div>
                )
              })}
            </div>
          ))}
          <motion.p
            className="mt-7 font-serif text-[17px] text-ocre"
            initial={{ opacity: 0 }}
            animate={seen ? { opacity: 1 } : {}}
            transition={{ delay: reduce ? 0 : strikeDelay + 0.9, duration: 0.8 }}
          >
            ¡Se acabó el choco!
          </motion.p>
        </div>
      </div>
    </div>
  )
}
