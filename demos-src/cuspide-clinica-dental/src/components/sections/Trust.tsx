import { useRef } from 'react'
import { BENEFITS } from '../../data/clinic'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { ScrollWords } from '../ui/ScrollWords'
import { WordReveal } from '../ui/WordReveal'

/* Escena 2: la promesa. Una lámina azul noche sube sobre la portada, la idea central se
   enciende con el scroll y los cuatro compromisos pasan de apagados a nítidos uno a uno. */
export function Trust() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.desktop, () => {
        gsap.fromTo('[data-sheet]', { scale: 0.94, borderRadius: 56 }, { scale: 1, borderRadius: 40, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 25%', scrub: 0.5 } })
      })
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>('[data-benefit]').forEach((row) => {
          gsap.fromTo(row, { opacity: 0.16 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 52%', scrub: 0.4 } })
          gsap.fromTo(row.querySelector('[data-rule]'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 90%', end: 'top 60%', scrub: 0.4 } })
          gsap.fromTo(row.querySelector('[data-num]'), { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top 90%', end: 'top 55%', scrub: 0.4 } })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="confianza" ref={root} aria-labelledby="trust-title" className="on-night relative z-10 -mt-8 sm:-mt-12">
      <div data-sheet className="night-sheet origin-top will-change-transform" style={{ paddingBlock: 'var(--section)' }}>
        <div className="wrap">
          <ScrollWords
            className="max-w-[22ch] text-[clamp(1.75rem,4.2vw,3.5rem)] font-medium leading-[1.12] tracking-[-0.03em] text-text-light"
            text="En Cúspide sabes qué necesitas, cuánto cuesta y qué va a pasar antes de empezar."
          />

          <div className="grid12 mt-[clamp(80px,12vw,160px)] gap-y-12">
            <div className="col-span-12 lg:col-span-5">
              <div className="lg:sticky lg:top-[calc(var(--nav-h)+48px)]">
                <p className="eyebrow">Por qué Cúspide</p>
                <WordReveal id="trust-title" text="La tranquilidad también forma parte del tratamiento." className="h2 mt-5 max-w-[14ch] text-text-light" />
              </div>
            </div>
            <ol className="col-span-12 lg:col-span-7">
              {BENEFITS.map((b) => (
                <li key={b.n} data-benefit className="relative grid grid-cols-[auto_1fr] items-start gap-x-6 py-8 sm:gap-x-10 sm:py-10">
                  <span data-rule className="hairline absolute inset-x-0 top-0" aria-hidden />
                  <span className="overflow-hidden">
                    <span data-num className="num block text-[clamp(3rem,7vw,6.25rem)] font-medium leading-[0.86] tracking-[-0.05em] text-sky" aria-hidden>
                      {b.n}
                    </span>
                  </span>
                  <div className="pt-1 sm:pt-2">
                    <h3 className="h3 text-text-light">{b.title}</h3>
                    <p className="mt-2 max-w-[34ch] text-[17px] leading-[1.5] text-muted-light sm:text-[19px]">{b.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
