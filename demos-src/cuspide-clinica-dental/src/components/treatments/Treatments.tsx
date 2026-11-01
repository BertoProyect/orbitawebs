import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { TREATMENTS, type Treatment } from '../../data/clinic'
import { EASE } from '../../lib/motion'
import { FadeIn, WordReveal } from '../ui/WordReveal'
import { RevealImage } from '../ui/RevealImage'
import { TreatmentSheet } from './TreatmentSheet'

/* Escena 3: los tratamientos como una maqueta editorial. Tamaños distintos, alturas
   desplazadas y cada foto entra desde un lado diferente para no repetir el mismo gesto. */
const LAYOUT: Record<Treatment['layout'], { card: string; media: string; sizes: string }> = {
  feature: { card: 'lg:col-span-7', media: 'aspect-[4/3] lg:aspect-[7/6]', sizes: '(min-width: 1024px) 56vw, 100vw' },
  tall: { card: 'lg:col-span-5 lg:mt-40', media: 'aspect-[4/5]', sizes: '(min-width: 1024px) 40vw, 100vw' },
  half: { card: 'lg:col-span-5 lg:mt-8', media: 'aspect-[4/3] lg:aspect-[5/6]', sizes: '(min-width: 1024px) 40vw, 100vw' },
  wide: { card: 'lg:col-span-7 lg:mt-48', media: 'aspect-[4/3] lg:aspect-[16/11]', sizes: '(min-width: 1024px) 56vw, 100vw' },
  band: { card: 'lg:col-span-12', media: 'aspect-[4/3] lg:aspect-auto lg:h-full', sizes: '(min-width: 1024px) 58vw, 100vw' },
}

export function Treatments() {
  const [open, setOpen] = useState<Treatment | null>(null)
  return (
    <section id="tratamientos" aria-labelledby="treat-title" className="section bg-white">
      <div className="wrap">
        <header className="grid12 items-end gap-y-6">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow">Tratamientos</p>
            <WordReveal id="treat-title" text="Cada sonrisa tiene su propio camino." className="h2 mt-5 max-w-[13ch]" />
          </div>
          <FadeIn className="col-span-12 lg:col-span-4 lg:col-start-9" delay={0.2}>
            <p className="lead">Te explicamos todas las opciones con claridad para que puedas decidir con tranquilidad.</p>
          </FadeIn>
        </header>

        <div className="grid12 mt-16 gap-y-16 sm:mt-20 lg:gap-y-0">
          {TREATMENTS.map((t, i) => (
            <Card key={t.id} t={t} index={i} onOpen={() => setOpen(t)} />
          ))}
        </div>
      </div>
      <TreatmentSheet treatment={open} onClose={() => setOpen(null)} />
    </section>
  )
}

function Card({ t, index, onOpen }: { t: Treatment; index: number; onOpen: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const L = LAYOUT[t.layout]
  const band = t.layout === 'band'
  const go = inView || reduce

  const media = (
    <button type="button" onClick={onOpen} data-cursor="Ver" className={`group/img block w-full overflow-hidden rounded-[var(--r-card)] text-left ${band ? 'lg:h-full' : ''}`} aria-label={`Ver ${t.title.toLowerCase()}`}>
      <div className="h-full transition-transform duration-[1.1s] ease-[var(--ease)] group-hover/img:scale-[1.035]">
        <RevealImage img={t.img} widths={[640, 960, 1280, 1600]} sizes={L.sizes} from={t.from} className={`rounded-[var(--r-card)] ${L.media}`} parallax={band ? 4 : 7} />
      </div>
    </button>
  )

  return (
    <motion.article
      ref={ref}
      className={`group col-span-12 ${L.card} ${band ? 'grid gap-8 lg:mt-40 lg:grid-cols-12 lg:items-stretch lg:gap-8' : ''}`}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={go ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease: EASE, delay: (index % 2) * 0.12 }}
      aria-labelledby={`t-${t.id}`}
    >
      <div className={band ? 'lg:col-span-7 lg:min-h-[460px]' : ''}>{media}</div>
      <div className={band ? 'flex flex-col justify-center lg:col-span-4 lg:col-start-9' : 'mt-6'}>
        <p className="num flex items-center gap-3 text-[13px] font-semibold tracking-[0.08em] text-blue">
          {t.n}
          <span className="h-px w-6 bg-blue/40" aria-hidden />
        </p>
        <h3 id={`t-${t.id}`} className={`mt-3 ${band ? 'h2 !text-[clamp(2rem,3.6vw,3.25rem)]' : 'h3'}`}>
          {t.title}
        </h3>
        <p className={`mt-3 max-w-[40ch] text-slate ${band ? 'lead' : 'text-[17px] leading-[1.5]'}`}>{t.text}</p>
        <div className="relative mt-5">
          <button type="button" onClick={onOpen} className="group/cta inline-flex min-h-11 items-center gap-3 text-[16px] font-medium text-night">
            <span className="relative">
              Descubrir tratamiento
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-night transition-transform duration-500 ease-[var(--ease)] group-hover/cta:origin-left group-hover/cta:scale-x-100" />
            </span>
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line transition-[background-color,border-color] duration-500 ease-[var(--ease)] group-hover/cta:border-blue group-hover/cta:bg-blue group-hover/cta:text-white">
              <ArrowUpRight size={17} className="transition-transform duration-500 ease-[var(--ease)] group-hover/cta:-translate-y-6 group-hover/cta:translate-x-6" aria-hidden />
              <ArrowUpRight size={17} className="absolute -translate-x-6 translate-y-6 transition-transform duration-500 ease-[var(--ease)] group-hover/cta:translate-x-0 group-hover/cta:translate-y-0" aria-hidden />
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}
