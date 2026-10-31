import { motion, useScroll, useTransform, type MotionStyle } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { pexels, srcSet, type Photo } from '../data/restaurant'
import { fadeUp, maskUp, settle, stagger, VIEW } from '../lib/motion'
import { useRichMotion } from '../lib/hooks'

/* ---------- Botón ---------- */
type BtnProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'light' | 'outline-light'
  external?: boolean
  className?: string
  arrow?: boolean
  onClick?: () => void
}
const VARIANTS = {
  primary: 'bg-almagra text-cal hover:bg-almagra-2',
  ghost: 'border border-nogal/30 text-nogal hover:border-nogal hover:bg-nogal/[0.04]',
  light: 'bg-cal text-nogal hover:bg-blanco',
  'outline-light': 'border border-cal/45 text-cal hover:border-cal hover:bg-cal/10',
}
export function Button({ href, children, variant = 'primary', external, className = '', arrow = true, onClick }: BtnProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      className={`group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-[10px] px-6 text-[16px] font-semibold transition-[background-color,border-color,transform] duration-300 ease-out active:scale-[0.97] ${VARIANTS[variant]} ${className}`}
    >
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden
          size={18}
          strokeWidth={2}
          className="transition-transform duration-300 ease-out group-hover:translate-x-1"
        />
      )}
    </a>
  )
}

/* ---------- Foto de Pexels con tamaños responsivos ---------- */
export function Img({
  photo,
  sizes,
  widths = [480, 720, 960, 1280, 1600],
  className = '',
  eager,
  alt,
}: {
  photo: Photo
  sizes: string
  widths?: number[]
  className?: string
  eager?: boolean
  alt?: string
}) {
  return (
    <img
      src={pexels(photo.id, widths[Math.min(2, widths.length - 1)])}
      srcSet={srcSet(photo.id, widths)}
      sizes={sizes}
      width={photo.w}
      height={photo.h}
      alt={alt ?? photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  )
}

/* ---------- Foto que se revela con máscara y se asienta; parallax suave solo en escritorio ---------- */
export function RevealImage({
  photo,
  sizes,
  className = '',
  ratio,
  parallax = 0,
  delay = 0,
}: {
  photo: Photo
  sizes: string
  className?: string
  ratio?: string
  parallax?: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rich = useRichMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`])
  const style: MotionStyle = rich && parallax ? { y, scale: 1 + parallax / 50 } : {}
  return (
    <motion.div
      ref={ref}
      variants={maskUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEW}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-[14px] bg-estraza ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <motion.div variants={settle} className="h-full w-full">
        <motion.div style={style} className="h-full w-full">
          <Img photo={photo} sizes={sizes} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ---------- Titular que entra por líneas ---------- */
export function Lines({
  lines,
  as: Tag = 'h2',
  className = '',
  id,
  delay = 0,
  animate,
}: {
  lines: string[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  id?: string
  delay?: number
  /** Si se pasa, se controla desde fuera (portada); si no, entra al verse. */
  animate?: boolean
}) {
  const MotionTag = motion[Tag]
  const control =
    animate === undefined
      ? { initial: 'hidden' as const, whileInView: 'show' as const, viewport: VIEW }
      : { initial: 'hidden' as const, animate: animate ? 'show' : 'hidden' }
  return (
    <MotionTag id={id} className={className} variants={stagger(0.11, delay)} {...control}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: '105%' },
              show: { y: '0%', transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}

/* ---------- Bloque que aparece al verse ---------- */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'p' | 'li' | 'ul' | 'span'
}) {
  const M = motion[as]
  return (
    <M className={className} variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEW} transition={{ delay }}>
      {children}
    </M>
  )
}

/* ---------- Cabecera de sección ---------- */
export function SectionHead({
  eyebrow,
  title,
  lead,
  id,
  className = '',
  align = 'left',
}: {
  eyebrow: string
  title: string[]
  lead?: string
  id: string
  className?: string
  align?: 'left' | 'center'
}) {
  return (
    <header className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <Lines id={id} lines={title} className="display mt-4" delay={0.05} />
      {lead && (
        <Reveal delay={0.2} className={`lead mt-5 ${align === 'center' ? 'mx-auto' : ''}`}>
          {lead}
        </Reveal>
      )}
    </header>
  )
}
