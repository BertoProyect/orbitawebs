import {
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Photo } from "../data/content";
import { useFinePointer } from "../hooks/useMediaQuery";
import { pexels, srcSet } from "../lib/links";

export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_SOFT = [0.22, 0.61, 0.36, 1] as const;

/* ---------- Foto de Pexels con srcset ---------- */
export function Img({
  photo,
  widths = [480, 720, 960, 1280],
  sizes,
  priority = false,
  className,
  alt,
  decorative = false,
  style,
}: {
  photo: Photo;
  widths?: number[];
  sizes: string;
  priority?: boolean;
  className?: string;
  alt?: string;
  decorative?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={pexels(photo.id, widths[Math.min(2, widths.length - 1)])}
      srcSet={srcSet(photo, widths)}
      sizes={sizes}
      width={photo.w}
      height={photo.h}
      alt={decorative ? "" : (alt ?? photo.alt)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // @ts-expect-error fetchpriority aún no está en los tipos de React 19 para img
      fetchpriority={priority ? "high" : undefined}
      className={className}
      style={style}
      draggable={false}
    />
  );
}

/* ---------- Titular revelado línea a línea ----------
   Cada línea sube desde detrás de una máscara. Las palabras en cursiva (<em>) llevan un
   pequeño desfase vertical propio, para que entren con un matiz distinto. */
const lineVariants: Variants = {
  hidden: { y: "110%" },
  show: (d: number) => ({ y: "0%", transition: { duration: 1.05, ease: EASE, delay: d } }),
};

export function RevealLines({
  lines,
  label,
  as: Tag = "h2",
  className,
  id,
  start,
  delay = 0,
  stagger = 0.1,
  amount = 0.5,
}: {
  lines: ReactNode[];
  /** texto plano para lectores de pantalla */
  label: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  /** Si se pasa, la animación depende de este valor y no de entrar en pantalla */
  start?: boolean;
  delay?: number;
  stagger?: number;
  amount?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduce = useReducedMotion();
  const go = start ?? inView;
  const MotionTag = m[Tag];
  return (
    <MotionTag ref={ref as never} id={id} className={className} aria-label={label}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask" aria-hidden="true">
          <m.span
            className="block will-change-transform"
            custom={delay + i * stagger}
            variants={lineVariants}
            initial={reduce ? false : "hidden"}
            animate={go || reduce ? "show" : "hidden"}
          >
            {line}
          </m.span>
        </span>
      ))}
    </MotionTag>
  );
}

/* Palabra en cursiva que entra con un leve movimiento vertical propio */
export function Italic({ children, delay = 0, go }: { children: ReactNode; delay?: number; go: boolean }) {
  const reduce = useReducedMotion();
  return (
    <m.em
      className="inline-block"
      initial={reduce ? false : { y: "0.32em", opacity: 0 }}
      animate={go || reduce ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </m.em>
  );
}

/* ---------- Aparición suave al entrar en pantalla ---------- */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "p" | "figure" | "header" | "span";
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.95, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Imagen editorial: se abre con clip-path, se asienta en escala
   y, en escritorio con ratón, se desplaza un poco más lenta que la página ---------- */
export function ClipImage({
  photo,
  sizes,
  className = "",
  imgClassName = "",
  parallax = 60,
  from = "bottom",
  priority = false,
  objectPosition,
}: {
  photo: Photo;
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** desplazamiento máximo en px (0 = sin parallax) */
  parallax?: number;
  from?: "bottom" | "left" | "right";
  priority?: boolean;
  objectPosition?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  // Se abre en cuanto asoma (no al 20 %): así nunca queda un hueco vacío en pantalla
  const inView = useInView(ref, { once: true, amount: 0, margin: "0px 0px -6% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = fine && !reduce ? parallax : 0;
  const y = useTransform(scrollYProgress, [0, 1], [-p, p]);
  const hidden =
    from === "left" ? "inset(0% 100% 0% 0%)" : from === "right" ? "inset(0% 0% 0% 100%)" : "inset(100% 0% 0% 0%)";
  return (
    // El marco tiene color de fondo propio: mientras la foto se abre, se ve la forma, no un blanco
    <div ref={ref} className={`relative overflow-hidden bg-plum-soft ${className}`}>
    <m.div
      className="absolute inset-0"
      initial={reduce ? false : { clipPath: hidden }}
      animate={inView || reduce ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{ duration: 1, ease: EASE }}
    >
      <m.div
        className="absolute inset-x-0 will-change-transform"
        style={{ y, top: -p, bottom: -p }}
      >
        <m.div
          className="h-full w-full"
          initial={reduce ? false : { scale: 1.14 }}
          animate={inView || reduce ? { scale: 1 } : undefined}
          transition={{ duration: 1.8, ease: EASE }}
        >
          <Img
            photo={photo}
            sizes={sizes}
            priority={priority}
            className={`h-full w-full object-cover ${imgClassName}`}
            style={objectPosition ? { objectPosition } : undefined}
          />
        </m.div>
      </m.div>
    </m.div>
    </div>
  );
}

/* ---------- Número que cuenta al aparecer ---------- */
export function Counter({
  to,
  decimals = 0,
  duration = 1.6,
  className,
  from = 0,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  className?: string;
  from?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const fmt = (v: number) => v.toFixed(decimals).replace(".", ",");
  const [txt, setTxt] = useState(fmt(reduce ? to : from));
  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setTxt(fmt(to));
      return;
    }
    const c = animate(from, to, { duration, ease: EASE, onUpdate: (v) => setTxt(fmt(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to]);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{txt}</span>
      <span className="sr-only">{fmt(to)}</span>
    </span>
  );
}

/* ---------- Número que transita con un muelle suave al cambiar (precios, totales) ---------- */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (v: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useSpring(value, { stiffness: 170, damping: 26, mass: 0.7 });
  useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  const text = useTransform(mv, (v) => format(Math.abs(v - value) < 0.05 ? value : v));
  return (
    <span className={className}>
      <span className="sr-only">{format(value)}</span>
      {reduce ? (
        <span aria-hidden="true">{format(value)}</span>
      ) : (
        <m.span aria-hidden="true" className="tabular-nums">
          {text}
        </m.span>
      )}
    </span>
  );
}

/* ---------- Botón magnético (sutil, solo con ratón) ---------- */
export function Magnetic({ children, strength = 0.22, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const on = fine && !reduce;
  return (
    <m.span
      ref={ref}
      className={`inline-flex ${className ?? ""}`}
      style={on ? { x: sx, y: sy } : undefined}
      onPointerMove={(e) => {
        if (!on || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </m.span>
  );
}

/* ---------- Cabecera de sección ---------- */
export function SectionHead({
  eyebrow,
  lines,
  label,
  id,
  intro,
  dark = false,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  lines: ReactNode[];
  label: string;
  id: string;
  intro?: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header className={`${align === "center" ? "mx-auto text-center" : ""} max-w-4xl ${className}`}>
      <Reveal as="p" className={`eyebrow mb-5 ${dark ? "text-plum-light" : "text-plum"}`} y={12}>
        {eyebrow}
      </Reveal>
      <RevealLines lines={lines} label={label} id={id} className="display t-h2" />
      {intro && (
        <Reveal
          as="p"
          delay={0.2}
          className={`t-lead mt-6 max-w-2xl ${align === "center" ? "mx-auto" : ""} ${dark ? "text-white/75" : "text-muted"}`}
        >
          {intro}
        </Reveal>
      )}
    </header>
  );
}

/* Marca de Alba: sol naciente sobre el horizonte (mismo dibujo que la intro y el favicon) */
export function AlbaMark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="1.6 8.6 36.8 16.6" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={light ? "am-l" : "am-d"}>
          <rect x="0" y="0" width="40" height="18.4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${light ? "am-l" : "am-d"})`}>
        <circle cx="20" cy="18.6" r="8.6" fill="#f7b385" />
      </g>
      <path d="M3 19.4h34" stroke={light ? "#efa6bb" : "#85204a"} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path
        d="M11 23.6h18"
        stroke={light ? "#efa6bb" : "#85204a"}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".55"
        fill="none"
      />
    </svg>
  );
}

export function Wordmark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <AlbaMark light={light} className="h-[15px] w-auto shrink-0" />
      <span className="whitespace-nowrap font-sans text-[0.75rem] font-semibold tracking-[0.2em] uppercase sm:text-[0.8125rem] sm:tracking-[0.26em]">
        Alba Estética
      </span>
    </span>
  );
}
