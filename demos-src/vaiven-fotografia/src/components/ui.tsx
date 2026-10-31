import { motion, useScroll, useTransform, type MotionStyle } from 'framer-motion'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { useRef, type ElementType, type ReactNode } from 'react'
import { pexels, srcSet, type Photo } from '../data/site'
import { useReduced, useRichMotion } from '../lib/hooks'
import { EASE, EASE_IN_OUT, fadeUp, stagger, VIEW } from '../lib/motion'

/* ---------- Botones ----------
 * Tres variantes y un solo tamaño táctil (48 px). La flecha se desplaza 3 px al pasar el ratón. */
type BtnProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'light' | 'outline' | 'outline-light'
  external?: boolean
  arrow?: 'right' | 'down' | false
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}
const BTN = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  light: 'bg-white text-fg hover:bg-surface-2',
  outline: 'border border-border-strong text-fg hover:border-fg',
  'outline-light': 'border border-white/40 text-white hover:border-white hover:bg-white/10',
}
export function Button({ href, children, variant = 'primary', external, arrow = 'right', className = '', onClick }: BtnProps) {
  const Icon = arrow === 'down' ? ArrowDown : ArrowRight
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      className={`btn group ${BTN[variant]} ${className}`}
    >
      <span>{children}</span>
      {arrow && (
        <Icon
          aria-hidden
          size={17}
          strokeWidth={1.75}
          className={`shrink-0 transition-transform duration-300 ease-out ${arrow === 'down' ? 'group-hover:translate-y-[3px]' : 'group-hover:translate-x-[3px]'}`}
        />
      )}
    </a>
  )
}

/* Enlace de texto con subrayado que se dibuja de izquierda a derecha. */
export function TextLink({
  href,
  children,
  external,
  className = '',
  onClick,
}: {
  href: string
  children: ReactNode
  external?: boolean
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <a href={href} onClick={onClick} {...(external ? { target: '_blank', rel: 'noopener' } : {})} className={`tlink ${className}`}>
      {children}
    </a>
  )
}

/* ---------- Etiqueta de apartado: número de capítulo opcional + texto en versalitas ---------- */
export function Eyebrow({ children, n, light, className = '' }: { children: ReactNode; n?: string; light?: boolean; className?: string }) {
  return (
    <p className={`eyebrow ${light ? 'text-white/75' : 'text-muted'} ${className}`}>
      {n && <span className={`tabular-nums ${light ? 'text-white' : 'text-fg'}`}>{n}</span>}
      {n && <span aria-hidden className={`h-px w-6 ${light ? 'bg-white/40' : 'bg-border-strong'}`} />}
      <span>{children}</span>
    </p>
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
      style={photo.pos ? { objectPosition: photo.pos } : undefined}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}

/* ---------- Foto que se revela con máscara ----------
 * La máscara se abre en la dirección indicada mientras la foto se asienta de 1.12 a 1.
 * Con parallax (solo escritorio con ratón) la foto se desplaza un poco más lenta que la página. */
const CLIP = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
}
export function RevealImage({
  photo,
  sizes,
  widths,
  className = '',
  ratio,
  parallax = 0,
  delay = 0,
  from = 'up',
  children,
}: {
  photo: Photo
  sizes: string
  widths?: number[]
  className?: string
  ratio?: string
  parallax?: number
  delay?: number
  from?: keyof typeof CLIP
  children?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rich = useRichMotion()
  const reduced = useReduced()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`])
  const px: MotionStyle = rich && parallax ? { y, scale: 1 + (parallax * 2.4) / 100 } : {}
  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden bg-surface-2 ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
      initial={reduced ? false : { clipPath: CLIP[from] }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={VIEW}
      transition={{ duration: 1.25, ease: EASE_IN_OUT, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={reduced ? false : { scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={VIEW}
        transition={{ duration: 1.7, ease: EASE, delay }}
      >
        <motion.div style={px} className="h-full w-full will-change-transform">
          <Img photo={photo} sizes={sizes} widths={widths} />
        </motion.div>
      </motion.div>
      {children}
    </motion.div>
  )
}

/* ---------- Bloque que entra desde abajo al aparecer ---------- */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'p' | 'li' | 'section' | 'header'
}) {
  const M = motion[as] as typeof motion.div
  const v = delay
    ? { hidden: fadeUp.hidden, show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE, delay } } }
    : fadeUp
  return (
    <M className={className} variants={v} initial="hidden" whileInView="show" viewport={VIEW}>
      {children}
    </M>
  )
}

/* Contenedor que escalona a sus hijos con variants="fadeUp". */
export function Stagger({ children, className = '', gap = 0.1, delay = 0 }: { children: ReactNode; className?: string; gap?: number; delay?: number }) {
  return (
    <motion.div className={className} variants={stagger(gap, delay)} initial="hidden" whileInView="show" viewport={VIEW}>
      {children}
    </motion.div>
  )
}

/* ---------- Titular que entra por líneas, cada una saliendo de su propio recorte ----------
 * Si se pasa `play`, la entrada se controla desde fuera (portada); si no, al aparecer. */
export function Lines({
  lines,
  as: Tag = 'h2',
  className = '',
  lineClassName = '',
  play,
  delay = 0,
  gap = 0.11,
  id,
}: {
  lines: ReactNode[]
  as?: ElementType
  className?: string
  lineClassName?: string
  play?: boolean
  delay?: number
  gap?: number
  id?: string
}) {
  const controlled = play !== undefined
  /* El observador va en el contenedor: cada línea está recortada por su máscara y,
     escondida, nunca «entraría» en pantalla por sí misma. */
  return (
    <Tag id={id} className={className}>
      <motion.span
        className="block"
        initial="hidden"
        {...(controlled ? { animate: play ? 'show' : 'hidden' } : { whileInView: 'show', viewport: VIEW })}
      >
        {lines.map((l, i) => (
          <span key={i} className={`block overflow-hidden pb-[0.08em] -mb-[0.08em] ${lineClassName}`}>
            <motion.span
              className="block will-change-transform"
              variants={{
                hidden: { y: '108%' },
                show: { y: '0%', transition: { duration: 1.05, ease: EASE, delay: delay + i * gap } },
              }}
            >
              {l}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/* ---------- Texto largo que entra palabra a palabra (para titulares que reflowean) ---------- */
export function Words({ text, as: Tag = 'h2', className = '', delay = 0, id }: { text: string; as?: ElementType; className?: string; delay?: number; id?: string }) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={className}>
      <motion.span className="block" initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.028, delay)} aria-label={text}>
        {words.map((w, i) => (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-top">
            <motion.span
              className="inline-block will-change-transform"
              variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.95, ease: EASE } } }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/* ---------- Marca de Vaivén: cinco barras que crecen hacia los extremos (el vaivén) ---------- */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 27.6 24" fill="currentColor" aria-hidden focusable="false">
      <rect x="0" y="2" width="3.2" height="20" rx="1.2" />
      <rect x="4.8" y="5.5" width="4.6" height="13" rx="1.2" />
      <rect x="11" y="7" width="5.6" height="10" rx="1.2" />
      <rect x="18.2" y="5.5" width="4.6" height="13" rx="1.2" />
      <rect x="24.4" y="2" width="3.2" height="20" rx="1.2" />
    </svg>
  )
}

/* Desplazamiento suave a un ancla respetando «reducir movimiento» (el CSS ya lo hace; esto cubre el logo). */
export function scrollToTop(e?: React.MouseEvent) {
  e?.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  history.replaceState(null, '', window.location.pathname)
}
