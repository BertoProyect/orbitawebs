import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { srcset, type Img } from '../../data/clinic'
import { mask, settle, type From } from '../../lib/motion'
import { useMedia } from '../../lib/hooks'

type Props = {
  img: Img
  widths: number[]
  sizes: string
  from?: From
  className?: string
  /** Desplazamiento de la foto dentro de su marco al hacer scroll, en % de su alto. */
  parallax?: number
  delay?: number
  priority?: boolean
  imgClassName?: string
}

/* Imagen que se abre con máscara desde un lado, se asienta (escala 1.18 → 1)
   y, en pantallas grandes, flota un poco dentro de su marco con el scroll. */
export function RevealImage({ img, widths, sizes, from = 'up', className = '', parallax = 6, delay = 0, priority, imgClassName = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduce = useReducedMotion()
  const big = useMedia('(min-width: 768px)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-parallax}%`, `${parallax}%`])
  const still = reduce || !big || !parallax

  return (
    <motion.div
      ref={ref}
      className={`media ${className}`}
      variants={mask(from, delay)}
      initial={reduce ? false : 'hidden'}
      animate={inView || reduce ? 'show' : 'hidden'}
    >
      <motion.div className="absolute" style={{ inset: still ? 0 : `-${parallax}% 0`, y: still ? 0 : y }}>
        <motion.img
          src={img.src(widths[Math.min(1, widths.length - 1)])}
          srcSet={srcset(img, widths)}
          sizes={sizes}
          width={img.w}
          height={img.h}
          alt={img.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`h-full w-full object-cover ${imgClassName}`}
          variants={settle(delay)}
        />
      </motion.div>
    </motion.div>
  )
}
