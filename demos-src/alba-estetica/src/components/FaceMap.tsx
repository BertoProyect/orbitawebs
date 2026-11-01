import { AnimatePresence, m, useInView, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HOTSPOTS } from "../data/content";
import { getTreatment } from "../data/treatments";
import { useWide } from "../hooks/useMediaQuery";
import { eur, mins } from "../lib/format";
import { AddButton } from "./AddButton";
import { EASE, SectionHead } from "./ui";

/* Dibujo del rostro, en línea fina (viewBox 400 × 500) */
const FACE_PATHS = [
  // pelo
  "M200 44C112 44 62 118 64 210C66 300 82 386 58 472",
  "M200 44C288 44 338 118 336 210C334 300 318 386 342 472",
  "M200 44C192 70 168 92 132 104",
  "M200 44C214 66 240 84 276 92",
  // óvalo
  "M200 72C276 72 314 140 312 222C310 302 286 372 248 410C230 428 214 438 200 438C186 438 170 428 152 410C114 372 90 302 88 222C86 140 124 72 200 72Z",
  // cuello
  "M170 430C172 458 170 480 160 500",
  "M230 430C228 458 230 480 240 500",
  // cejas
  "M130 178C146 166 168 164 184 172",
  "M216 172C232 164 254 166 270 178",
  // ojos cerrados y pestañas
  "M136 208C150 218 168 218 182 208",
  "M218 208C232 218 250 218 264 208",
  "M144 214L140 222M156 217L154 226M169 216L170 225",
  "M231 216L230 225M244 217L246 226M256 214L260 222",
  // nariz
  "M200 204C199 236 194 260 189 278C195 287 206 287 212 279",
  // labios
  "M168 336C182 326 194 330 200 334C206 330 218 326 232 336",
  "M168 336C186 357 214 357 232 336",
  "M172 337C190 343 210 343 228 337",
];

/* Escena 4 · El mapa del rostro.
   Al entrar, el dibujo se traza y los puntos se encienden uno a uno. Al elegir uno: el punto
   se expande, una línea lo une con la ficha y la información cambia con un fundido. */
export function FaceMap() {
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const wide = useWide();
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const touched = useRef(false);

  // Tras encenderse los puntos, se selecciona el primero (si nadie ha tocado nada aún)
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => {
      if (!touched.current) setActive(HOTSPOTS[0].id);
    }, reduce ? 0 : 2300);
    return () => window.clearTimeout(t);
  }, [inView, reduce]);

  const pick = (id: string) => {
    touched.current = true;
    setActive(id);
  };

  const spot = HOTSPOTS.find((h) => h.id === active) ?? null;
  const t = spot ? getTreatment(spot.treatment) : undefined;
  const go = inView || !!reduce;

  // Línea de conexión: hacia la ficha (derecha en escritorio, abajo en móvil)
  const connector = spot
    ? wide
      ? `M${spot.x} ${spot.y}C${(spot.x + 400) / 2} ${spot.y} ${(spot.x + 400) / 2} 250 400 250`
      : `M${spot.x} ${spot.y}C${spot.x} ${(spot.y + 500) / 2} 200 ${(spot.y + 500) / 2} 200 500`
    : "";

  return (
    <section id="rostro" aria-labelledby="rostro-title" className="overflow-hidden py-[clamp(88px,12vw,160px)]">
      <div className="wrap">
        <SectionHead
          eyebrow="Mapa del rostro"
          id="rostro-title"
          label="Cada piel tiene su propio mapa."
          lines={[
            "Cada piel tiene",
            <>
              su propio <em>mapa.</em>
            </>,
          ]}
          intro="Descubre qué tratamiento puede ayudarte según lo que quieres cuidar."
        />

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-0">
          {/* Ilustración */}
          <div ref={stage} className="relative mx-auto w-full max-w-[420px] lg:col-span-5 lg:max-w-none">
            <div className="relative aspect-[4/5]">
              <div aria-hidden="true" className="absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,#fae9ed,rgba(250,233,237,0))]" />
              <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                <g fill="#f7b385" opacity="0.18">
                  <circle cx="128" cy="286" r="30" />
                  <circle cx="272" cy="286" r="30" />
                </g>
                {FACE_PATHS.map((d, i) => (
                  <m.path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#27181c"
                    strokeOpacity={0.78}
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={go ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={{ duration: 1.6, ease: EASE, delay: 0.04 * i }}
                  />
                ))}
                {/* Zona elegida */}
                <AnimatePresence>
                  {spot && (
                    <m.circle
                      key={`z-${spot.id}`}
                      cx={spot.x}
                      cy={spot.y}
                      r={34}
                      fill="#efa6bb"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 0.28, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      style={{ transformOrigin: `${spot.x}px ${spot.y}px` }}
                    />
                  )}
                </AnimatePresence>
                {/* Línea que une el punto con la ficha */}
                <AnimatePresence>
                  {spot && (
                    <m.path
                      key={`l-${spot.id}-${wide}`}
                      d={connector}
                      fill="none"
                      stroke="#85204a"
                      strokeWidth={1.2}
                      strokeLinecap="round"
                      initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 1 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ pathLength: { duration: 0.75, ease: EASE, delay: 0.1 }, opacity: { duration: 0.3 } }}
                    />
                  )}
                </AnimatePresence>
              </svg>

              {/* Puntos interactivos (botones HTML de 44 px para el dedo) */}
              {HOTSPOTS.map((h, i) => {
                const on = h.id === active;
                const tip = hover === h.id;
                return (
                  <m.button
                    key={h.id}
                    type="button"
                    onClick={() => pick(h.id)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setHover(h.id)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(h.id)}
                    onBlur={() => setHover(null)}
                    aria-pressed={on}
                    aria-label={`${h.label}: ${getTreatment(h.treatment)?.name ?? ""}`}
                    className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                    style={{ left: `${(h.x / 400) * 100}%`, top: `${(h.y / 500) * 100}%` }}
                    initial={reduce ? false : { opacity: 0, scale: 0.3 }}
                    animate={go ? { opacity: 1, scale: 1 } : undefined}
                    transition={{ type: "spring", stiffness: 420, damping: 22, delay: reduce ? 0 : 1 + i * 0.12 }}
                  >
                    {!on && <span aria-hidden="true" className="hotspot-pulse absolute h-3.5 w-3.5 rounded-full bg-plum/40" />}
                    <m.span
                      aria-hidden="true"
                      className="relative rounded-full border-2 border-white bg-plum shadow-[0_2px_10px_rgba(133,32,74,0.35)]"
                      animate={{ width: on ? 22 : 13, height: on ? 22 : 13 }}
                      transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    />
                    <AnimatePresence>
                      {tip && !on && (
                        <m.span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded-full bg-night px-3 py-1.5 text-[0.75rem] font-medium text-white"
                          initial={{ opacity: 0, y: 6, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.96 }}
                          transition={{ duration: 0.25, ease: EASE }}
                        >
                          {h.label}
                        </m.span>
                      )}
                    </AnimatePresence>
                  </m.button>
                );
              })}
            </div>
          </div>

          {/* Ficha */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="relative min-h-[300px] rounded-[var(--radius-lg)] border border-line bg-surface p-7 sm:p-10" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {spot && t ? (
                  <m.div
                    key={spot.id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.15 }}
                  >
                    <p className="eyebrow text-plum">{spot.label}</p>
                    <h3 className="display t-h3 mt-4">{t.cat === "laser" ? "Láser de diodo" : t.name}</h3>
                    <p className="mt-3 max-w-[44ch] text-ink-2">{spot.line}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.9375rem]">
                      {t.mins !== null && (
                        <span className="flex items-center gap-1.5 text-muted">
                          <Clock size={14} strokeWidth={1.8} aria-hidden="true" />
                          {mins(t.mins)}
                        </span>
                      )}
                      <span className="font-serif text-[1.5rem] text-plum tabular-nums">
                        {t.cat === "laser" ? `desde ${eur(t.price)}` : eur(t.price)}
                        {t.cat === "laser" && <span className="ml-1 font-sans text-[0.8125rem] text-muted">/ sesión</span>}
                      </span>
                    </div>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <AddButton id={t.id} size="lg" />
                      {spot.note && <p className="text-[0.8125rem] text-muted">{spot.note}</p>}
                    </div>
                  </m.div>
                ) : (
                  <m.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="eyebrow text-plum">Elige una zona</p>
                    <p className="display t-h3 mt-4 max-w-[18ch]">Toca un punto del rostro para ver qué podría ayudarte.</p>
                  </m.div>
                )}
              </AnimatePresence>
              <p className="mt-8 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-muted">
                Es una orientación, no un diagnóstico. En tu primera visita valoramos tu piel en persona y te recomendamos
                lo que de verdad necesita.
              </p>
            </div>

            {/* Índice de zonas (también sirve en móvil y con teclado) */}
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Zonas del rostro">
              {HOTSPOTS.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => pick(h.id)}
                    aria-pressed={h.id === active}
                    className={`min-h-11 rounded-full border px-4 text-[0.8125rem] font-medium transition-colors duration-300 ${
                      h.id === active
                        ? "border-plum bg-plum-soft text-plum"
                        : "border-line text-ink-2 hover:border-plum hover:text-plum"
                    }`}
                  >
                    {h.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
