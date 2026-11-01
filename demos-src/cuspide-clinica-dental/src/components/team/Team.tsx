import { motion, useReducedMotion } from 'framer-motion'
import { TEAM } from '../../data/clinic'
import { EASE } from '../../lib/motion'
import { FadeIn, WordReveal } from '../ui/WordReveal'

/* Escena 5: las personas. Nombres enormes, separadores finos y nada inventado:
   sin títulos, premios ni años de experiencia que la clínica no haya dado. */
export function Team() {
  const reduce = useReducedMotion()
  return (
    <section id="equipo" aria-labelledby="team-title" className="section bg-white">
      <div className="wrap">
        <div className="grid12 gap-y-6">
          <div className="col-span-12 lg:col-span-6">
            <p className="eyebrow">El equipo</p>
            <WordReveal id="team-title" text="Siempre te atiende el mismo equipo." className="h2 mt-5 max-w-[12ch]" />
          </div>
          <FadeIn className="col-span-12 self-end lg:col-span-4 lg:col-start-9" delay={0.2}>
            <p className="lead">Seguimos tu caso de principio a fin, así no tienes que contar tu historia cada vez que vienes.</p>
          </FadeIn>
        </div>

        <ul className="mt-16 sm:mt-24">
          {TEAM.map((p, i) => {
            return (
              <motion.li
                key={p.name}
                className="group relative"
                initial={reduce ? false : 'hidden'}
                whileInView="show"
                viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                variants={{ hidden: {}, show: { transition: { delayChildren: i * 0.08 } } }}
              >
                <motion.span
                  className="hairline absolute inset-x-0 top-0 block"
                  variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, ease: EASE } } }}
                  aria-hidden
                />
                <div className="grid grid-cols-12 items-center gap-x-4 gap-y-3 py-8 sm:py-10 lg:py-12">
                  <div className="col-span-12 overflow-hidden lg:col-span-7">
                    <motion.h3
                      className="text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.045em] transition-[transform,color] duration-700 ease-[var(--ease)] lg:group-hover:translate-x-3 lg:group-hover:text-blue"
                      variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 1.1, ease: EASE } } }}
                    >
                      {p.name}
                    </motion.h3>
                  </div>
                  <motion.div
                    className="col-span-12 lg:col-span-4 lg:col-start-9"
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.2 } } }}
                  >
                    {p.role && <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-blue">{p.role}</p>}
                    <p className={`${p.role ? 'mt-1.5' : ''} text-[19px] font-medium leading-[1.35] text-night`}>{p.focus}</p>
                    {p.bio && <p className="mt-3 max-w-[40ch] text-[16px] leading-[1.55] text-slate">{p.bio}</p>}
                  </motion.div>
                </div>
              </motion.li>
            )
          })}
          <li aria-hidden>
            <span className="hairline block" />
          </li>
        </ul>
      </div>
    </section>
  )
}
