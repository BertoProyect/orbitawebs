import { motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronRight, Clock, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CLINIC, IMG, TRUST_CHIPS, srcset } from '../../data/clinic'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { scrollToId, useIntroDone } from '../../lib/hooks'
import { EASE, EASE_IN_OUT } from '../../lib/motion'
import { openState } from '../../lib/time'
import { Magnetic } from '../ui/Magnetic'
import { WordReveal } from '../ui/WordReveal'

/* Portada al estilo de una página de producto de Apple: marca pequeña, titular enorme con
   degradado, una línea de apoyo, el botón azul y, abajo, la sonrisa a lo ancho como «producto»,
   cortada por el borde de la pantalla para invitar a bajar. */
export function Hero() {
  const play = useIntroDone()
  const reduce = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(() => openState())

  useEffect(() => {
    const t = window.setInterval(() => setOpen(openState()), 60_000)
    return () => window.clearInterval(t)
  }, [])

  // Profundidad al bajar: el texto se aleja más rápido que la foto y las fichas flotan a ritmos distintos.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
        gsap.to('[data-hero-copy]', { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: st })
        gsap.fromTo('[data-hero-depth]', { yPercent: 0, scale: 1 }, { yPercent: 9, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '[data-hero-media]', start: 'top 70%', end: 'bottom top', scrub: 0.6 } })
        gsap.to('[data-hero-float="a"]', { yPercent: -70, ease: 'none', scrollTrigger: { ...st, end: 'bottom 20%' } })
        gsap.to('[data-hero-float="b"]', { yPercent: -150, ease: 'none', scrollTrigger: { ...st, end: 'bottom 20%' } })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const t = (d: number) => ({ duration: 0.95, ease: EASE, delay: d })
  const up = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }
  const state = play || reduce ? 'show' : 'hidden'
  const init = reduce ? false : 'hidden'

  return (
    <section id="inicio" ref={root} aria-labelledby="hero-title" className="relative overflow-hidden bg-white" style={{ paddingTop: 'calc(var(--nav-h) + clamp(40px, 9vh, 112px))' }}>
      <div data-hero-copy className="wrap will-change-transform">
        <WordReveal
          as="h1"
          id="hero-title"
          text="Sonríe sin sorpresas."
          className="display max-w-[11ch] sm:max-w-none"
          play={play}
          delay={0.05}
          stagger={0.09}
          gradient={['#0b1b33', '#7d8aa1']}
        />

        {/* Debajo del titular: compromisos a la izquierda, texto y botones empezando a la derecha. */}
        <div className="grid12 mt-8 items-end gap-y-9 sm:mt-10 lg:mt-14">
          <div className="col-span-12 md:order-2 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
            <motion.p className="lead max-w-[36ch] font-medium text-night/80" variants={up} initial={init} animate={state} transition={t(0.5)}>
              Primera visita y diagnóstico gratis. Antes de empezar, te damos el presupuesto cerrado y por escrito.
            </motion.p>
            <motion.div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2" variants={up} initial={init} animate={state} transition={t(0.7)}>
              <Magnetic href="#cita">Pedir mi primera cita</Magnetic>
              <button type="button" className="link-arrow whitespace-nowrap" onClick={() => scrollToId('confianza')}>
                <span>Descubrir la clínica</span>
                <ChevronRight size={18} strokeWidth={2.2} aria-hidden />
              </button>
            </motion.div>
          </div>

          <ul className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-3 sm:gap-x-10 md:order-1 md:col-span-5 md:grid-cols-1 md:pb-3 lg:col-span-6 lg:max-w-[540px] lg:grid-cols-2" aria-label="Lo que te garantizamos">
            {TRUST_CHIPS.map((c, i) => (
              <motion.li key={c} className="flex items-center gap-2 text-left text-[14px] font-medium text-slate" variants={up} initial={init} animate={state} transition={t(0.9 + i * 0.09)}>
                <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-ice text-blue">
                  <Check size={11} strokeWidth={3} aria-hidden />
                </span>
                {c}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* La sonrisa: se abre desde el centro con una máscara y queda cortada por abajo. */}
      <div className="relative mx-auto mt-12 w-full max-w-[1520px] px-3 sm:mt-14 sm:px-[var(--gutter)]">
        <motion.div
          data-hero-media
          className="media relative h-[min(118vw,560px)] rounded-[24px] sm:h-[clamp(440px,64vh,760px)] sm:rounded-[32px]"
          initial={reduce ? false : { clipPath: 'inset(24% 22% 0% 22% round 40px)' }}
          animate={play || reduce ? { clipPath: 'inset(0% 0% 0% 0% round 0px)' } : undefined}
          transition={{ duration: 1.55, ease: EASE_IN_OUT, delay: 0.25 }}
        >
          <div data-hero-depth className="absolute inset-0 will-change-transform">
            <motion.picture
              className="block h-full w-full"
              initial={reduce ? false : { scale: 1.22 }}
              animate={play || reduce ? { scale: 1.02 } : undefined}
              transition={{ duration: 2.2, ease: EASE, delay: 0.25 }}
            >
              <source media="(max-width: 639px)" srcSet={srcset(IMG.heroMobile, [480, 720, 960])} sizes="100vw" />
              <img
                src={IMG.hero.src(1600)}
                srcSet={srcset(IMG.hero, [960, 1280, 1600, 2000, 2400])}
                sizes="(min-width: 1520px) 1424px, 94vw"
                width={IMG.hero.w}
                height={IMG.hero.h}
                alt={IMG.hero.alt}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-[50%_40%]"
              />
            </motion.picture>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,51,0)_55%,rgba(11,27,51,0.28)_100%)]" aria-hidden />

          {/* Fichas informativas con datos reales: flotan muy despacio. */}
          <motion.div
            data-hero-float="a"
            className="absolute bottom-5 left-5 sm:bottom-24 sm:left-10"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={play || reduce ? { opacity: 1, y: 0 } : undefined}
            transition={t(1.35)}
          >
            <div className={reduce ? '' : 'animate-[float_7s_ease-in-out_infinite]'}>
              <div className="flex items-center gap-3 rounded-2xl bg-white/85 py-2.5 pl-2.5 pr-4 shadow-[0_18px_40px_-18px_rgba(11,27,51,0.45)] backdrop-blur-md">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${open.open ? 'bg-[#e3f4ea] text-[#16794a]' : 'bg-ice text-blue'}`}>
                  <Clock size={17} aria-hidden />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-[12px] font-medium text-mist">Horario de hoy</span>
                  <span className="block text-[14px] font-semibold text-night">{open.text}</span>
                </span>
              </div>
            </div>
          </motion.div>
          <motion.a
            data-hero-float="b"
            href="#contacto"
            className="absolute right-5 top-5 hidden sm:right-10 sm:top-10 md:block"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={play || reduce ? { opacity: 1, y: 0 } : undefined}
            transition={t(1.5)}
          >
            <div className={reduce ? '' : 'animate-[float_9s_ease-in-out_-3s_infinite]'}>
              <div className="flex items-center gap-3 rounded-2xl bg-white/85 py-2.5 pl-2.5 pr-4 shadow-[0_18px_40px_-18px_rgba(11,27,51,0.45)] backdrop-blur-md transition-colors hover:bg-white">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ice text-blue">
                  <MapPin size={17} aria-hidden />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-[12px] font-medium text-mist">En el centro de Huelva</span>
                  <span className="block text-[14px] font-semibold text-night">{CLINIC.street}</span>
                </span>
              </div>
            </div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
