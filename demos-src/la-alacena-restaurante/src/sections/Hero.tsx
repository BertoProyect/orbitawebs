import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '../components/ui'
import { Lines } from '../components/ui'
import { Stars } from '../components/Stars'
import { PHOTOS, RESTAURANT, pexels, srcSet } from '../data/restaurant'
import { useIntroDone, useRichMotion } from '../lib/hooks'
import { EASE } from '../lib/motion'
import { waGeneric } from '../lib/whatsapp'

const HERO_D = srcSet(PHOTOS.heroDesktop.id, [960, 1280, 1600, 1920, 2400])
const HERO_M = srcSet(PHOTOS.heroMobile.id, [480, 720, 960, 1280])

export function Hero() {
  const go = useIntroDone()
  const rich = useRichMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  /* Al bajar, la foto se queda un poco atrás y el texto se aleja: profundidad sin secuestrar el scroll. */
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', rich ? '16%' : '0%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', rich ? '-18%' : '0%'])
  const textO = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  const enter = (d: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: go ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.9, ease: EASE, delay: d },
  })

  return (
    <section
      id="inicio"
      ref={ref}
      aria-labelledby="hero-title"
      className="on-dark relative isolate flex min-h-[92svh] flex-col overflow-hidden bg-nogal text-cal"
    >
      <motion.div className="absolute inset-0 -z-10" style={{ y: photoY }} aria-hidden>
        <motion.picture
          className="block h-full w-full"
          initial={{ scale: 1.08 }}
          animate={go ? { scale: 1 } : { scale: 1.08 }}
          transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <source media="(max-width: 767px)" srcSet={HERO_M} sizes="100vw" />
          <img
            src={pexels(PHOTOS.heroDesktop.id, 1920)}
            srcSet={HERO_D}
            sizes="100vw"
            width={1920}
            height={1280}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </motion.picture>
        {/* Velo para leer el texto: más denso a la izquierda y abajo, donde va el titular. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,19,14,0.78)_0%,rgba(26,19,14,0.45)_48%,rgba(26,19,14,0.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(26,19,14,0.7),transparent)]" />
      </motion.div>

      <motion.div style={{ y: textY, opacity: textO }} className="wrap flex flex-1 flex-col justify-end pb-16 pt-32 md:justify-center md:pb-24">
        <motion.span className="eyebrow" {...enter(0.05)}>
          Cocina de mercado · Huelva
        </motion.span>
        <Lines
          as="h1"
          id="hero-title"
          animate={go}
          delay={0.15}
          lines={['Del mercado de esta mañana', 'a tu mesa.']}
          className="mt-5 max-w-[15ch] font-serif text-[clamp(2.7rem,7.4vw,6.4rem)] leading-[0.98] tracking-[-0.02em] text-cal md:max-w-none"
        />
        <motion.p className="lead mt-6 max-w-[44ch] text-cal/88" {...enter(0.6)}>
          Cocina casera de temporada, con el pescado y la verdura que compramos cada mañana.
        </motion.p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <motion.div {...enter(0.75)}>
            <Button href={waGeneric} external className="w-full sm:w-auto">
              Reservar por WhatsApp
            </Button>
          </motion.div>
          <motion.div {...enter(0.85)}>
            <Button href="#carta" variant="outline-light" className="w-full sm:w-auto">
              Descubrir nuestra carta
            </Button>
          </motion.div>
        </div>
        <motion.p className="mt-8 flex items-center gap-2.5 text-[15px] text-cal/85" {...enter(1)}>
          <Stars className="text-ocre" />
          <span>
            <strong className="font-semibold text-cal">{RESTAURANT.rating}</strong> en Google · {RESTAURANT.reviews} opiniones
          </span>
        </motion.p>
      </motion.div>

      {/* Sello que gira despacio: el único adorno flotante de la portada. */}
      <motion.div
        aria-hidden
        className="absolute bottom-24 right-[6vw] hidden md:block"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={go ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.2, duration: 1, ease: EASE }}
      >
        <motion.svg
          viewBox="0 0 200 200"
          className="h-36 w-36 text-cal/75 lg:h-40 lg:w-40"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
        >
          <defs>
            <path id="sello" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text fill="currentColor" fontSize="13.5" letterSpacing="2.6" fontFamily="Figtree, sans-serif" fontWeight="600">
            <textPath href="#sello">COMPRAMOS CADA MAÑANA · DESDE 2011 · HUELVA ·</textPath>
          </text>
        </motion.svg>
        <span className="absolute inset-0 grid place-items-center font-serif text-[34px] text-cal">LA</span>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.a
        href="#historia"
        aria-label="Bajar a nuestra historia"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 md:block"
        initial={{ opacity: 0 }}
        animate={go ? { opacity: 1 } : {}}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="relative block h-11 w-[26px] rounded-full border-2 border-cal/50">
          <motion.span
            className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-cal"
            animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.a>

      <div className="zocalo" aria-hidden />
    </section>
  )
}
