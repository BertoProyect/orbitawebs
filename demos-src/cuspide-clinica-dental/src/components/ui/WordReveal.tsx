import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ElementType } from 'react'
import { EASE } from '../../lib/motion'

type Props = {
  text: string
  as?: ElementType
  className?: string
  id?: string
  /** true = arranca ya; undefined = arranca al entrar en pantalla */
  play?: boolean
  delay?: number
  stagger?: number
  /** Degradado horizontal repartido entre las palabras, como un titular de Apple. */
  gradient?: [string, string]
}

/* Titular editorial: cada palabra sube desde detrás de su línea. Palabras, no letras:
   se lee antes y no cansa. Los lectores de pantalla reciben la frase entera. */
export function WordReveal({ text, as: Tag = 'h2', className = '', id, play, delay = 0, stagger = 0.06, gradient }: Props) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduce = useReducedMotion()
  const go = play ?? inView
  const words = text.split(' ')
  const n = words.length

  return (
    <Tag ref={ref} id={id} className={className} aria-label={text}>
      {words.map((w, i) => {
        const style = gradient
          ? {
              backgroundImage: `linear-gradient(90deg, color-mix(in oklab, ${gradient[0]}, ${gradient[1]} ${(i / n) * 100}%), color-mix(in oklab, ${gradient[0]}, ${gradient[1]} ${((i + 1) / n) * 100}%))`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }
          : undefined
        return (
          <span key={i} className="word" aria-hidden="true">
            <motion.span
              style={style}
              initial={reduce ? false : { y: '108%' }}
              animate={go || reduce ? { y: '0%' } : { y: '108%' }}
              transition={{ duration: 1.05, ease: EASE, delay: delay + i * stagger }}
            >
              {w}
            </motion.span>
            {i < n - 1 ? ' ' : null}
          </span>
        )
      })}
    </Tag>
  )
}

/* Párrafo que aparece con un leve ascenso: para textos de apoyo, sin trocear. */
export function FadeIn({ children, className = '', delay = 0, play, as: Tag = 'div' }: { children: React.ReactNode; className?: string; delay?: number; play?: boolean; as?: 'div' | 'p' | 'li' | 'span' }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const go = play ?? inView
  const M = motion[Tag] as typeof motion.div
  return (
    <M
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={go || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}
