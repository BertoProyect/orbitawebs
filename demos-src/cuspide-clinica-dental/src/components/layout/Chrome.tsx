import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useFinePointer } from '../../lib/hooks'

/* Barra fina de progreso de lectura, pegada arriba. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  const s = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  return <motion.div className="progress" style={{ scaleX: reduce ? scrollYProgress : s }} aria-hidden />
}

/* Cursor con etiqueta, solo con ratón y solo donde aporta: sobre las fotos de los tratamientos
   («Ver») y sobre la boca 3D («Girar»). En el resto de la web, el cursor del sistema. */
export function CursorLabel() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const [label, setLabel] = useState<string | null>(null)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 })

  useEffect(() => {
    if (!fine || reduce) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const el = (e.target as Element | null)?.closest?.('[data-cursor]')
      setLabel(el ? el.getAttribute('data-cursor') : null)
    }
    const out = () => setLabel(null)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', out)
    window.addEventListener('scroll', out, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', out)
      window.removeEventListener('scroll', out)
    }
  }, [fine, reduce, x, y])

  if (!fine || reduce) return null
  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[70]" style={{ x: sx, y: sy }} aria-hidden>
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-night px-4 py-2 text-[13px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(11,27,51,0.6)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
