import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Button, Lines, TextLink } from '../components/ui'
import { BRAND, CHAPTERS, PHOTOS, pexels, srcSet } from '../data/site'
import { useIntroDone, useRichMotion } from '../lib/hooks'
import { EASE } from '../lib/motion'

const HERO_D = srcSet(PHOTOS.heroDesktop.id, [1280, 1600, 1920, 2400])
const HERO_M = srcSet(PHOTOS.heroMobile.id, [480, 720, 960, 1280])

/* Portada · secuencia de entrada, en este orden y nada más:
 * la foto se asienta (1.08 → 1), etiqueta, titular línea a línea, subtítulo, botones y,
 * al final, la línea que invita a bajar. Al hacer scroll la foto va algo más lenta que la página. */
export function Hero() {
  const go = useIntroDone()
  const rich = useRichMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', rich ? '18%' : '0%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', rich ? '-10%' : '0%'])
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, rich ? 0 : 1])

  const enter = (delay: number, y = 16) => ({
    initial: { opacity: 0, y },
    animate: go ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.9, ease: EASE, delay },
  })

  return (
    <section ref={ref} aria-labelledby="hero-title" className="on-dark relative isolate flex h-[100svh] min-h-[560px] flex-col overflow-hidden bg-fg text-white">
      <motion.div className="absolute inset-0 -z-10 will-change-transform" style={{ y: photoY }} aria-hidden>
        <motion.picture
          className="block h-full w-full"
          initial={{ scale: 1.08 }}
          animate={go ? { scale: 1 } : { scale: 1.08 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
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
            className="h-full w-full object-cover object-[50%_40%] md:object-[50%_45%]"
          />
        </motion.picture>
        {/* Velo solo donde va el texto: abajo, y algo a la izquierda en escritorio. */}
        <div className="absolute inset-x-0 bottom-0 h-[72%] bg-[linear-gradient(0deg,rgba(9,9,11,0.72)_0%,rgba(9,9,11,0.32)_45%,transparent_100%)]" />
        <div className="absolute inset-y-0 left-0 hidden w-2/3 bg-[linear-gradient(90deg,rgba(9,9,11,0.28),transparent)] md:block" />
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(9,9,11,0.35),transparent)]" />
      </motion.div>

      <motion.div style={{ y: copyY, opacity: copyO }} className="wrap flex flex-1 flex-col justify-end pb-28 pt-28 md:pb-32 lg:pb-36">
        <motion.p className="eyebrow text-white/80" {...enter(0.1, 10)}>
          Fotografía de bodas · Huelva
        </motion.p>
        <Lines
          as="h1"
          id="hero-title"
          play={go}
          delay={0.25}
          gap={0.12}
          lines={['Vuestra boda,', 'tal y como fue.']}
          className="mt-6 text-[clamp(3rem,12.6vw,4.25rem)] font-medium leading-[0.96] tracking-[-0.05em] sm:text-[clamp(3.5rem,8.6vw,6.9rem)]"
        />
        <motion.p className="mt-7 max-w-[34ch] text-[17px] leading-[1.55] text-white/85 md:text-[19px]" {...enter(0.75)}>
          Historias reales. Emociones sin ensayar. Recuerdos para toda la vida.
        </motion.p>
        <motion.div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8" {...enter(0.95)}>
          <Button href="#fecha" variant="light">
            Contadme vuestra fecha
          </Button>
          <TextLink href="#historias" className="text-[15px] text-white">
            Descubrir historias <span aria-hidden>↓</span>
          </TextLink>
        </motion.div>
      </motion.div>

      {/* Pie de la portada: zonas, indicador de scroll y capítulo. */}
      <motion.div
        className="wrap absolute inset-x-0 bottom-0 flex items-end justify-between pb-6 text-[11px] font-medium uppercase tracking-[0.16em] text-white/75 md:pb-8"
        initial={{ opacity: 0 }}
        animate={go ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.9, delay: 1.3 }}
      >
        <p>{BRAND.area.join(' · ')}</p>
        <a href="#historias" aria-label="Bajar a las historias" className="absolute left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="relative block h-12 w-px overflow-hidden bg-white/25">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-white"
              animate={{ y: ['-100%', '200%'] }}
              transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1], repeat: Infinity, repeatDelay: 0.4 }}
            />
          </span>
        </a>
        <p className="tabular-nums">
          01 <span className="text-white/45">/ {String(CHAPTERS).padStart(2, '0')}</span>
        </p>
      </motion.div>
    </section>
  )
}
