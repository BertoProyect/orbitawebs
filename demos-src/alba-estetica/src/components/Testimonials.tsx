import { animate, m, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { BUSINESS } from "../data/business";
import { TESTIMONIALS } from "../data/content";
import { EASE, Reveal, RevealLines } from "./ui";

/* Carrusel horizontal: se arrastra con el dedo o el ratón, se mueve con las flechas del teclado
   y lleva una barra de progreso. Opiniones de ejemplo (demo), marcadas como tales. */
export function Testimonials() {
  const reduce = useReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [geo, setGeo] = useState({ step: 1, max: 0, last: 0 });
  const maxRef = useRef(0);
  maxRef.current = geo.max;
  const progress = useTransform(x, (v) => (maxRef.current ? Math.min(1, Math.max(0, -v / maxRef.current)) : 1));

  const measure = useCallback(() => {
    const vp = viewport.current;
    const tr = track.current;
    const first = tr?.firstElementChild as HTMLElement | null;
    if (!vp || !tr || !first) return;
    const gap = parseFloat(getComputedStyle(tr).columnGap || "0") || 0;
    const step = first.offsetWidth + gap;
    const max = Math.max(0, tr.scrollWidth - vp.clientWidth);
    const last = Math.min(TESTIMONIALS.length - 1, Math.ceil(max / step - 0.01));
    setGeo({ step, max, last });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, [measure]);

  const snap = useCallback(
    (i: number) => {
      const n = Math.max(0, Math.min(geo.last, i));
      setIndex(n);
      const target = -Math.min(geo.max, n * geo.step);
      if (reduce) x.set(target);
      else animate(x, target, { type: "spring", stiffness: 260, damping: 34 });
    },
    [geo, reduce, x],
  );

  // Al cambiar el tamaño, recoloca la tarjeta activa
  useEffect(() => {
    x.set(-Math.min(geo.max, Math.min(index, geo.last) * geo.step));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      snap(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      snap(index - 1);
    }
  };

  return (
    <section id="opiniones" aria-labelledby="op-title" className="overflow-hidden bg-surface py-[clamp(88px,12vw,160px)]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div className="max-w-3xl">
            <Reveal as="p" className="eyebrow mb-5 text-plum" y={12}>
              Opiniones
            </Reveal>
            <RevealLines
              id="op-title"
              label="Lo que cuentan quienes ya nos conocen."
              className="display t-h2"
              lines={[
                "Lo que cuentan quienes",
                <>
                  ya <em>nos conocen.</em>
                </>,
              ]}
            />
          </div>
          <Reveal className="flex items-center gap-5">
            <p className="display text-[clamp(3.5rem,2.5rem+3vw,5.5rem)] leading-none">
              4,9<span className="text-[0.4em] text-muted"> / 5</span>
            </p>
            <div>
              <span className="flex gap-0.5 text-sunrise" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <p className="mt-1.5 text-[0.9375rem] text-ink-2">{BUSINESS.reviews} opiniones en Google</p>
              <a href={BUSINESS.mapsPlace} target="_blank" rel="noopener" className="link-u mt-1 inline-block text-[0.8125rem] font-medium text-plum">
                Leerlas en Google
              </a>
            </div>
          </Reveal>
        </div>

        <div
          ref={viewport}
          role="region"
          aria-roledescription="carrusel"
          aria-label="Opiniones de clientas"
          tabIndex={0}
          onKeyDown={onKey}
          className="mt-14 cursor-grab rounded-[var(--radius-md)] active:cursor-grabbing lg:mt-20"
        >
          <m.ul
            ref={track}
            className="flex gap-4 sm:gap-6"
            style={{ x, touchAction: "pan-y" }}
            drag={geo.max > 0 ? "x" : false}
            dragConstraints={{ left: -geo.max, right: 0 }}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const projected = x.get() + info.velocity.x * 0.18;
              snap(Math.round(-projected / geo.step));
            }}
          >
            {TESTIMONIALS.map((t, i) => {
              const on = i >= index && i < index + 3;
              return (
                <m.li
                  key={t.name}
                  aria-roledescription="opinión"
                  aria-label={`${i + 1} de ${TESTIMONIALS.length}: ${t.name}, ${t.service}`}
                  className="flex w-[min(84vw,400px)] shrink-0 select-none flex-col rounded-[var(--radius-lg)] border border-line bg-bg p-7 sm:p-9"
                  animate={{ opacity: on || reduce ? 1 : 0.5, scale: on || reduce ? 1 : 0.97 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-plum-soft px-3.5 py-1.5 text-[0.75rem] font-semibold text-plum">{t.service}</span>
                    <span className="flex gap-0.5 text-sunrise" aria-label="5 de 5 estrellas">
                      {Array.from({ length: 5 }, (_, k) => (
                        <Star key={k} size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                      ))}
                    </span>
                  </div>
                  <blockquote className="mt-7 flex-1">
                    <Quote size={22} strokeWidth={1.2} className="mb-3 text-plum-light" aria-hidden="true" />
                    <p className="font-serif text-[1.1875rem] leading-[1.45] text-ink">{t.text}</p>
                  </blockquote>
                  <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
                    <span className="serif-italic grid h-11 w-11 place-items-center rounded-full bg-plum text-[1.25rem] text-white" aria-hidden="true">
                      {t.name[0]}
                    </span>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-[0.8125rem] text-muted">{t.note}</p>
                    </div>
                  </div>
                </m.li>
              );
            })}
          </m.ul>
        </div>

        <p className="mt-6 text-[0.75rem] text-muted">Opiniones de ejemplo para esta demo.</p>

        <div className="mt-6 flex items-center gap-6">
          <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <m.div className="h-full origin-left bg-plum" style={{ scaleX: progress }} />
          </div>
          <span className="text-[0.8125rem] text-muted tabular-nums" aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => snap(index - 1)}
              disabled={index === 0}
              aria-label="Opinión anterior"
              className="grid h-12 w-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-plum hover:text-plum disabled:opacity-35"
            >
              <ArrowLeft size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => snap(index + 1)}
              disabled={index >= geo.last}
              aria-label="Opinión siguiente"
              className="grid h-12 w-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-plum hover:text-plum disabled:opacity-35"
            >
              <ArrowRight size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
