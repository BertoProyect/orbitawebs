import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Lines } from '../components/ui'
import { PHOTOS, pexels, srcSet } from '../data/site'
import { useRichMotion } from '../lib/hooks'

/* Pausa emocional entre la galería y el método: una foto a sangre y una sola frase.
 * La foto va más lenta que la página (profundidad); en móvil queda quieta. */
export function Pause() {
  const ref = useRef<HTMLElement>(null)
  const rich = useRichMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], rich ? ['-6%', '6%'] : ['0%', '0%'])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], rich ? [1.18, 1.14, 1.18] : [1, 1, 1])

  return (
    <section ref={ref} aria-label="Hay momentos que solo necesitan ser recordados" className="on-dark relative isolate flex min-h-[88svh] items-end overflow-hidden bg-fg text-white md:min-h-[100svh]">
      <motion.picture className="absolute inset-0 -z-10 block will-change-transform" style={{ y, scale }} aria-hidden>
        <source media="(max-width: 767px)" srcSet={srcSet(PHOTOS.pauseMobile.id, [480, 720, 960, 1280])} sizes="100vw" />
        <img
          src={pexels(PHOTOS.pauseDesktop.id, 1920)}
          srcSet={srcSet(PHOTOS.pauseDesktop.id, [1280, 1600, 1920, 2400])}
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[50%_55%]"
        />
      </motion.picture>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(9,9,11,0.66)_0%,rgba(9,9,11,0.18)_55%,rgba(9,9,11,0.08)_100%)]" />

      <div className="wrap pb-20 md:pb-28">
        <Lines
          as="p"
          gap={0.14}
          lines={['Hay momentos que no', 'necesitan repetirse.', <span className="text-white/65">Solo necesitan</span>, <span className="text-white/65">ser recordados.</span>]}
          className="max-w-[18ch] text-[clamp(2.25rem,6.4vw,6rem)] font-medium leading-[0.98] tracking-[-0.05em]"
        />
      </div>
    </section>
  )
}
