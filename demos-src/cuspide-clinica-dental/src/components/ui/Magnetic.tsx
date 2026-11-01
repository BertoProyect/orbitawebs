import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useRef, type ReactNode, type MouseEvent } from 'react'
import { useFinePointer } from '../../lib/hooks'

type Common = { children: ReactNode; className?: string; strength?: number; 'aria-label'?: string }
type AsLink = Common & { href: string; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void; target?: string; rel?: string }
type AsButton = Common & { href?: undefined; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; 'aria-disabled'?: boolean }

/* Botón magnético: se deja llevar unos píxeles hacia el cursor y vuelve con muelle.
   La etiqueta se mueve un poco más que la cápsula, para dar profundidad.
   Solo con ratón y sin «reducir movimiento»; en táctil es un botón normal. */
export function Magnetic(props: AsLink | AsButton) {
  const { children, className = 'btn', strength = 0.28 } = props
  const ref = useRef<HTMLElement>(null)
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const on = fine && !reduce
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 })
  const lx = useTransform(sx, (v) => v * 0.45)
  const ly = useTransform(sy, (v) => v * 0.45)

  const move = (e: React.PointerEvent) => {
    if (!on || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }
  const style = on ? { x: sx, y: sy } : undefined
  const inner = (
    <motion.span className="btn__label" style={on ? { x: lx, y: ly } : undefined}>
      {children}
    </motion.span>
  )

  if (props.href !== undefined) {
    const { href, onClick, target, rel } = props
    return (
      <motion.a ref={ref as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick} target={target} rel={rel} className={className} style={style} onPointerMove={move} onPointerLeave={leave} aria-label={props['aria-label']}>
        {inner}
      </motion.a>
    )
  }
  const { onClick, type = 'button', disabled } = props
  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={props['aria-disabled']}
      className={className}
      style={style}
      onPointerMove={move}
      onPointerLeave={leave}
      aria-label={props['aria-label']}
    >
      {inner}
    </motion.button>
  )
}
