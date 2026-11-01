import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Check } from 'lucide-react'
import { useRef, useState } from 'react'
import { IMG, STEPS } from '../../data/clinic'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { useDesktop } from '../../lib/hooks'
import { EASE } from '../../lib/motion'
import { Magnetic } from '../ui/Magnetic'
import { RevealImage } from '../ui/RevealImage'
import { FadeIn, WordReveal } from '../ui/WordReveal'

/* Escena 6: la primera visita en tres pasos. En escritorio la sección se fija y los pasos
   pasan en horizontal con una línea de progreso; en móvil, en vertical y sin fijar nada. */
export function FirstVisit() {
  const desktop = useDesktop()
  return (
    <section id="primera-visita" aria-labelledby="visit-title" className="porcelain relative">
      <div className="wrap" style={{ paddingTop: 'var(--section)' }}>
        <div className="grid12 items-end gap-y-6">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow">Primera visita</p>
            <WordReveal id="visit-title" text="Tu primera visita, sin sorpresas." className="h2 mt-5 max-w-[12ch]" />
          </div>
          <FadeIn className="col-span-12 lg:col-span-4 lg:col-start-9" delay={0.2}>
            <p className="lead">Unos 30 minutos para conocernos, entender qué necesitas y explicarte todas las opciones.</p>
            <p className="chip mt-5">
              <Check size={14} strokeWidth={3} aria-hidden /> Primera visita gratis · Sin compromiso
            </p>
          </FadeIn>
        </div>
      </div>
      {desktop ? <Horizontal /> : <Vertical />}
      <div className="wrap flex flex-col items-start gap-4 pb-[var(--section)] pt-4 sm:flex-row sm:items-center sm:gap-6 lg:pt-0">
        <Magnetic href="#cita">Reservar primera visita</Magnetic>
        <p className="fine m-0">Te llamamos para confirmar el día y la hora.</p>
      </div>
    </section>
  )
}

function Visual({ i, active }: { i: number; active: boolean }) {
  if (i === 2) return <Budget active={active} />
  const img = i === 0 ? IMG.equipo : IMG.radiografia
  return <RevealImage img={img} widths={[640, 960, 1280]} sizes="(min-width: 1024px) 34vw, 100vw" from={i === 0 ? 'left' : 'up'} className="aspect-[4/3] rounded-[var(--r-card)] lg:aspect-[5/4]" parallax={0} />
}

function Horizontal() {
  const pin = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.desktop, () => {
        const track = pin.current!.querySelector<HTMLElement>('[data-track]')!
        const panels = track.querySelectorAll<HTMLElement>(':scope > li')
        // Cada paso queda alineado a la izquierda en su momento; el siguiente asoma por la derecha.
        const dist = () => panels[panels.length - 1].offsetLeft - panels[0].offsetLeft
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pin.current,
            start: 'top top',
            end: () => `+=${dist() * 1.1}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setActive(Math.min(2, Math.round(self.progress * 2))),
          },
        })
        tl.to(track, { x: () => -dist(), ease: 'none' }, 0)
        tl.fromTo('[data-line]', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
      })
      return () => mm.revert()
    },
    { scope: pin },
  )

  return (
    <div ref={pin} className="relative flex h-[100svh] min-h-[640px] flex-col justify-center overflow-hidden">
      {/* Línea de progreso con los tres pasos */}
      <div className="wrap">
        <div className="relative flex items-center justify-between" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
          <span data-line className="absolute inset-x-0 top-1/2 h-[2px] origin-left -translate-y-1/2 bg-blue" />
          {STEPS.map((s, i) => (
            <span key={s.n} className="relative flex items-center gap-3 bg-porcelain px-3 first:pl-0 last:pr-0">
              <span className={`num grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold transition-colors duration-500 ${i <= active ? 'bg-blue text-white' : 'bg-white text-mist ring-1 ring-line'}`}>{s.n}</span>
              <span className={`text-[14px] font-medium transition-colors duration-500 ${i <= active ? 'text-night' : 'text-mist'}`}>{['Escuchamos', 'Te lo enseñamos', 'Presupuesto'][i]}</span>
            </span>
          ))}
        </div>
      </div>
      <ol data-track className="mt-14 flex w-max gap-[6vw] pl-[max(var(--gutter),calc((100vw-var(--max))/2))] pr-[max(var(--gutter),calc((100vw-var(--max))/2))] will-change-transform">
        {STEPS.map((s, i) => (
          <li key={s.n} className="grid w-[min(76vw,1040px)] grid-cols-12 items-center gap-8" aria-current={i === active ? 'step' : undefined}>
            <div className="col-span-7">
              <Visual i={i} active={i === active} />
            </div>
            <div className={`col-span-5 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-35'}`}>
              <p className="num text-[clamp(4rem,7vw,6.5rem)] font-medium leading-[0.85] tracking-[-0.05em] text-blue/90">{s.n}</p>
              <h3 className="mt-6 text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">{s.title}</h3>
              <p className="lead mt-4 max-w-[30ch]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Vertical() {
  const ref = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1])
  return (
    <div className="wrap pt-14">
      <ol ref={ref} className="relative grid gap-14 pl-12">
        <span className="absolute bottom-2 left-[15px] top-2 w-px bg-line" aria-hidden />
        <motion.span className="absolute bottom-2 left-[15px] top-2 w-[2px] origin-top bg-blue" style={{ scaleY: reduce ? 1 : fill }} aria-hidden />
        {STEPS.map((s, i) => (
          <li key={s.n} className="relative">
            <span className="num absolute -left-12 top-0 grid h-8 w-8 place-items-center rounded-full bg-blue text-[12px] font-semibold text-white">{s.n}</span>
            <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -12% 0px' }} transition={{ duration: 0.9, ease: EASE }}>
              <h3 className="text-[26px] font-semibold leading-[1.1] tracking-[-0.025em]">{s.title}</h3>
              <p className="mt-2 text-[17px] leading-[1.5] text-slate">{s.text}</p>
              <div className="mt-6">
                <Visual i={i} active />
              </div>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* Paso 3: un presupuesto en papel, sin cifras inventadas. El sello «Cerrado» cae al llegar. */
function Budget({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const bar = (w: string, c = 'bg-soft-line') => <span className={`block h-2.5 rounded-full ${c}`} style={{ width: w }} />
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--r-card)] bg-ice sm:aspect-[4/3] lg:aspect-[5/4]" role="img" aria-label="Presupuesto cerrado y por escrito, entregado antes de empezar">
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_30%_20%,#ffffff,rgba(255,255,255,0))]" />
      <motion.div
        className="absolute left-1/2 top-1/2 w-[64%] -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] rounded-[14px] bg-white p-[6%] shadow-[0_40px_80px_-30px_rgba(11,27,51,0.35),0_2px_6px_rgba(11,27,51,0.06)]"
        initial={reduce ? false : { y: 30, rotate: -6, opacity: 0 }}
        whileInView={{ y: 0, rotate: -3, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist">Presupuesto</p>
            <p className="mt-1 text-[15px] font-semibold text-night">Cúspide Clínica Dental</p>
          </div>
          <span className="h-7 w-7 rounded-full bg-ice" />
        </div>
        <div className="mt-6 grid gap-2.5">
          {bar('86%')}
          {bar('72%')}
          {bar('58%')}
        </div>
        <div className="mt-6 grid gap-3 border-t border-soft-line pt-5">
          {[0, 1, 2].map((r) => (
            <div key={r} className="flex items-center justify-between gap-6">
              {bar(['48%', '40%', '54%'][r])}
              {bar('16%', 'bg-line')}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-night/80 pt-4">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-night">Total</span>
          {bar('22%', 'bg-night/80')}
        </div>
        <p className="mt-5 text-[11.5px] text-mist">Por escrito · Antes de empezar</p>
        <motion.span
          className="absolute -right-5 top-[44%] grid h-24 w-24 place-items-center rounded-full border-[2.5px] border-blue text-center text-[12px] font-bold uppercase leading-tight tracking-[0.1em] text-blue"
          initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -24 }}
          animate={active || reduce ? { scale: 1, opacity: 1, rotate: -14 } : { scale: 1.8, opacity: 0, rotate: -24 }}
          transition={{ duration: 0.55, ease: [0.34, 1.4, 0.64, 1], delay: active ? 0.25 : 0 }}
          aria-hidden
        >
          Precio
          <br />
          cerrado
        </motion.span>
      </motion.div>
    </div>
  )
}
