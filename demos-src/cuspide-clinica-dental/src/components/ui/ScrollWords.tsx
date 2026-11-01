import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'

/* Frase que se «enciende» palabra a palabra al bajar (patrón «scroll word reveal» de 21st.dev,
   reescrito con Framer Motion). Ligado al scroll, así que se lee al ritmo de quien baja. */
export function ScrollWords({ text, className = '', dim = 0.18 }: { text: string; className?: string; dim?: number }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  if (reduce) return <p className={className}>{text}</p>
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} p={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} dim={dim}>
          {w}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, p, range, dim }: { children: string; p: MotionValue<number>; range: [number, number]; dim: number }) {
  const opacity = useTransform(p, range, [dim, 1])
  return (
    <span aria-hidden="true">
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </span>
  )
}
