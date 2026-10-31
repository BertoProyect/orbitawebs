import type { Variants, Transition } from 'framer-motion'

/* Curvas y variantes compartidas: un solo lenguaje de movimiento para toda la web. */
export const EASE = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
export const T: Transition = { duration: 0.9, ease: EASE }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: T },
}
export const stagger = (s = 0.08, d = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: s, delayChildren: d } },
})
/* Revelado de imagen: la máscara se abre de abajo arriba mientras la foto se asienta. */
export const maskUp: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0% round 14px)' },
  show: { clipPath: 'inset(0% 0% 0% 0% round 14px)', transition: { duration: 1.25, ease: EASE_IN_OUT } },
}
export const settle: Variants = {
  hidden: { scale: 1.14 },
  show: { scale: 1, transition: { duration: 1.6, ease: EASE } },
}
export const VIEW = { once: true, margin: '0px 0px -12% 0px' } as const
