import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, CalendarHeart, Clock, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { treatmentLabel } from "../data/treatments";
import { useWide } from "../hooks/useMediaQuery";
import { eur, mins } from "../lib/format";
import { scrollToId, WA_GENERIC } from "../lib/links";
import { useCita } from "../state/cita";
import { AnimatedNumber, EASE } from "./ui";

/* La cita: resumen flotante (barra compacta en móvil, píldora en escritorio) y panel lateral.
   Nunca se da por confirmada: solo prepara el mensaje de WhatsApp. */
export function CitaPanel({ ready }: { ready: boolean }) {
  const cita = useCita();
  const { items, totals, panelOpen, closePanel, openPanel, remove, clear, durationLabel, whatsappHref } = cita;
  const reduce = useReducedMotion();
  const wide = useWide();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const { scrollY } = useScroll();
  const [past, setPast] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const n = y > window.innerHeight * 0.8;
    setPast((p) => (p === n ? p : n));
  });

  // Panel: foco al abrir, Escape para cerrar, sin scroll del fondo
  useEffect(() => {
    if (!panelOpen) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeBtn.current?.focus());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [panelOpen, closePanel]);

  const n = items.length;
  const showBar = ready && !panelOpen && (wide ? n > 0 : past || n > 0);

  return (
    <>
      {/* Resumen flotante */}
      <AnimatePresence>
        {showBar && (
          <m.div
            className={
              wide
                ? "fixed bottom-6 right-6 z-40"
                : "fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40"
            }
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {n === 0 ? (
              <a href={WA_GENERIC} target="_blank" rel="noopener" className="btn btn-primary w-full shadow-[0_18px_40px_-16px_rgba(105,17,56,0.6)]">
                Pedir cita por WhatsApp
              </a>
            ) : (
              <button
                type="button"
                onClick={openPanel}
                className={`flex min-h-14 items-center gap-4 rounded-full bg-night py-2 pl-5 pr-2 text-left text-white shadow-[0_18px_40px_-16px_rgba(38,16,25,0.7)] ${wide ? "" : "w-full"}`}
                aria-label={`Ver mi cita: ${n} tratamiento${n > 1 ? "s" : ""}, ${eur(totals.price)}`}
              >
                <CalendarHeart size={18} strokeWidth={1.6} className="text-plum-light" aria-hidden="true" />
                <span className="flex-1 text-[0.875rem]" aria-hidden="true">
                  <m.span key={n} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="block font-semibold">
                    {n} tratamiento{n > 1 ? "s" : ""}
                  </m.span>
                  <span className="text-white/65 tabular-nums">
                    {durationLabel} · <AnimatedNumber value={totals.price} format={(v) => eur(Math.round(v))} />
                  </span>
                </span>
                <span className="rounded-full bg-white px-4 py-2.5 text-[0.8125rem] font-semibold text-night" aria-hidden="true">
                  Ver cita
                </span>
              </button>
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <m.div
              className="fixed inset-0 z-[65] bg-night/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={closePanel}
              aria-hidden="true"
            />
            <m.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="cita-title"
              className={
                wide
                  ? "fixed bottom-3 right-3 top-3 z-[70] flex w-[440px] flex-col rounded-[var(--radius-lg)] bg-bg"
                  : "fixed inset-x-0 bottom-0 z-[70] flex max-h-[88svh] flex-col rounded-t-[var(--radius-lg)] bg-bg"
              }
              initial={reduce ? { opacity: 0 } : wide ? { x: "105%" } : { y: "100%" }}
              animate={reduce ? { opacity: 1 } : wide ? { x: 0 } : { y: 0 }}
              exit={reduce ? { opacity: 0 } : wide ? { x: "105%" } : { y: "100%" }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <header className="flex items-center justify-between border-b border-line px-6 py-5">
                <div>
                  <p className="eyebrow text-plum">Tu cita</p>
                  <h2 id="cita-title" className="display mt-1 text-[1.75rem]">
                    {n ? "Lo que te interesa" : "Aún no has elegido nada"}
                  </h2>
                </div>
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={closePanel}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ink"
                  aria-label="Cerrar"
                >
                  <X size={18} strokeWidth={1.6} aria-hidden="true" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {n === 0 ? (
                  <div className="py-6">
                    <p className="text-ink-2">
                      Añade tratamientos desde la carta, el mapa del rostro, el test o la calculadora de láser. O escríbenos y te
                      asesoramos.
                    </p>
                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          closePanel();
                          requestAnimationFrame(() => scrollToId("tratamientos"));
                        }}
                      >
                        Ver tratamientos
                      </button>
                      <a href={WA_GENERIC} target="_blank" rel="noopener" className="btn btn-ghost">
                        Pedir cita por WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <ul>
                    <AnimatePresence initial={false}>
                      {items.map((t) => (
                        <m.li
                          key={t.id}
                          layout={!reduce}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24, transition: { duration: 0.25 } }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="flex items-center gap-4 border-b border-line py-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-serif text-[1.125rem] leading-snug">{treatmentLabel(t)}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-muted">
                              <Clock size={12} strokeWidth={1.8} aria-hidden="true" />
                              {t.mins ? mins(t.mins) : "Duración a confirmar"}
                              {t.cat === "laser" && " · por sesión"}
                            </p>
                          </div>
                          <span className="font-serif text-[1.125rem] tabular-nums">{eur(t.price)}</span>
                          <button
                            type="button"
                            onClick={() => remove(t.id)}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-plum-soft hover:text-plum"
                            aria-label={`Quitar ${treatmentLabel(t)}`}
                          >
                            <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />
                          </button>
                        </m.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
                {n > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      className="min-h-11 text-[0.875rem] font-medium text-plum"
                      onClick={() => {
                        closePanel();
                        requestAnimationFrame(() => scrollToId("tratamientos"));
                      }}
                    >
                      + Añadir más tratamientos
                    </button>
                    <button type="button" className="min-h-11 text-[0.8125rem] text-muted hover:text-ink" onClick={clear}>
                      Vaciar
                    </button>
                  </div>
                )}
              </div>

              {n > 0 && (
                <footer className="border-t border-line px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
                  <dl className="grid grid-cols-2 gap-4" aria-live="polite">
                    <div>
                      <dt className="text-[0.8125rem] text-muted">Duración aproximada</dt>
                      <dd className="mt-0.5 font-serif text-[1.375rem]">
                        {totals.mins ? (
                          <AnimatedNumber value={totals.mins} format={(v) => mins(Math.round(v / 5) * 5 || 5)} />
                        ) : (
                          "A confirmar"
                        )}
                        {totals.hasOpenEnded && totals.mins > 0 && <span className="text-[0.8125rem] text-muted"> + láser</span>}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-[0.8125rem] text-muted">Precio orientativo</dt>
                      <dd className="mt-0.5 font-serif text-[1.375rem] text-plum">
                        <AnimatedNumber value={totals.price} format={(v) => eur(Math.round(v))} />
                      </dd>
                    </div>
                  </dl>
                  <a href={whatsappHref} target="_blank" rel="noopener" className="btn btn-primary mt-5 w-full">
                    Reservar por WhatsApp
                    <ArrowRight size={16} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />
                  </a>
                  <p className="mt-3 text-center text-[0.75rem] leading-relaxed text-muted">
                    Te abrimos WhatsApp con tu selección. La cita no queda confirmada hasta que te respondamos con el día y la hora.
                  </p>
                </footer>
              )}
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
