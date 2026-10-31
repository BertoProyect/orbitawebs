import type { Transition, Variants } from 'framer-motion'

/* Un único lenguaje de movimiento. Curva «expo out» para entrar y una en S para las máscaras.
 * Duraciones cortas: el movimiento acompaña a la foto, no compite con ella. */
export const EASE = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
export const T: Transition = { duration: 0.85, ease: EASE }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: T },
}
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
}
export const stagger = (s = 0.09, d = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: s, delayChildren: d } },
})

/* Se dispara un poco antes de que el elemento llegue al centro, y solo una vez. */
export const VIEW = { once: true, margin: '0px 0px -14% 0px' } as const
