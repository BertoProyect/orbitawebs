import { animate, m, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type SVGProps } from "react";
import type { Photo } from "../data/content";
import { pexels, srcSet } from "../lib/links";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Foto de Pexels con srcset ---------- */
export function Img({
  photo,
  widths = [480, 720, 960, 1280],
  sizes,
  priority = false,
  className,
  alt,
  decorative = false,
}: {
  photo: Photo;
  widths?: number[];
  sizes: string;
  priority?: boolean;
  className?: string;
  alt?: string;
  decorative?: boolean;
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
      draggable={false}
    />
  );
}

/* ---------- Titular revelado línea a línea ---------- */
const lineVariants: Variants = {
  hidden: { y: "108%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 1.1, ease: EASE, delay: i * 0.09 } }),
};

export function RevealLines({
  lines,
  as: Tag = "h2",
  className,
  id,
  start,
  delay = 0,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  id?: string;
  /** Si se pasa, la animación depende de este valor y no de entrar en pantalla */
  start?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const go = start ?? inView;
  const MotionTag = m[Tag];
  return (
    <MotionTag ref={ref as never} id={id} className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask" aria-hidden="true">
          <m.span
            className="block will-change-transform"
            custom={i + delay / 0.09}
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

/* ---------- Aparición suave al entrar en pantalla ---------- */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "p" | "figure" | "header";
}) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Imagen que se abre con máscara al entrar ---------- */
export function MaskReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={reduce ? false : { clipPath: "inset(18% 12% 18% 12% round 20px)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 20px)", opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.4, ease: EASE, delay }}
    >
      {children}
    </m.div>
  );
}

/* ---------- Contador ---------- */
export function Counter({
  to,
  decimals = 0,
  className,
}: {
  to: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const fmt = (v: number) =>
    v.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [text, setText] = useState(() => fmt(reduce ? to : 0));
  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setText(fmt(to));
      return;
    }
    const ctrl = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: (v) => setText(fmt(v)) });
    return () => ctrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to]);
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/* ---------- Iconos propios ---------- */
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M152.58,145.23l23,11.48A24,24,0,0,1,152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-40,24a8,8,0,0,0-4.42-7.16l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88A40,40,0,0,0,192,152Z" />
    </svg>
  );
}

export function Stars({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-gold" role="img" aria-label="4,9 de 5 estrellas">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={className}
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 2.6l2.8 6.1 6.7.7-5 4.5 1.4 6.6L12 17.1l-5.9 3.4 1.4-6.6-5-4.5 6.7-.7z" />
        </svg>
      ))}
    </span>
  );
}

/* ---------- Marca: tres mechones + LIENZO ---------- */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="26" height="4" rx="2" fill="currentColor" />
      <path d="M5.5 10h6v15.2c0 1.6-1.2 2.8-3 2.8s-3-1.2-3-2.8z" fill="#7d6a45" />
      <path d="M13 10h6v17.2c0 1.6-1.2 2.8-3 2.8s-3-1.2-3-2.8z" fill="#b59d6c" />
      <path d="M20.5 10h6v13.2c0 1.6-1.2 2.8-3 2.8s-3-1.2-3-2.8z" fill="#e3d3ab" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark className={size === "lg" ? "h-9 w-9" : "h-7 w-7"} />
      <span className={`wordmark ${size === "lg" ? "text-xl" : "text-[0.95rem]"}`}>Lienzo</span>
    </span>
  );
}
