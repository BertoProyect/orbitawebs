import type { Transition, Variants } from 'framer-motion'

/* Un solo lenguaje de movimiento: salidas largas y suaves (expo), entradas sin rebote. */
export const EASE = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const
export const T: Transition = { duration: 0.9, ease: EASE }

export const VIEW = { once: true, margin: '0px 0px -14% 0px' } as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: T },
}

export const stagger = (s = 0.08, d = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: s, delayChildren: d } },
})

/* Máscaras de imagen: cada entrada abre desde un lado distinto para no repetir. */
export type From = 'up' | 'down' | 'left' | 'right' | 'center'
const CLOSED: Record<From, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  center: 'inset(14% 18% 14% 18%)',
}
export const mask = (from: From, delay = 0): Variants => ({
  hidden: { clipPath: CLOSED[from] },
  show: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.25, ease: EASE_IN_OUT, delay } },
})
export const settle = (delay = 0): Variants => ({
  hidden: { scale: 1.18 },
  show: { scale: 1, transition: { duration: 1.7, ease: EASE, delay } },
})
