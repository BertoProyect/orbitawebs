import { AnimatePresence, m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Plus, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { PHOTOS } from "../data/content";
import { getTreatment, LASER_GROUPS } from "../data/treatments";
import { eur } from "../lib/format";
import { waLink } from "../lib/links";
import { useCita } from "../state/cita";
import { AnimatedNumber, ClipImage, Reveal, RevealLines } from "./ui";

const int = (v: number) => eur(Math.round(v));
const dec = (v: number) => eur(Math.round(v * 100) / 100);

/* Escena 5 · La experiencia láser.
   El fondo pasa del blanco cálido al ciruela profundo mientras la sección entra, con tipografía
   grande y la calculadora como panel interactivo. */
export function Laser() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.55"] });
  const bg = useTransform(scrollYProgress, [0, 1], ["#fcfafb", "#261019"]);

  return (
    <m.section
      id="laser"
      ref={ref}
      aria-labelledby="laser-title"
      className="on-dark relative overflow-hidden py-[clamp(110px,14vw,200px)] text-white"
      style={{ backgroundColor: reduce ? "#261019" : bg }}
    >
      {/* Luz cálida muy suave detrás del titular (estática, sin animar el desenfoque) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[20%] -top-[10%] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(133,32,74,0.45),rgba(133,32,74,0))]"
      />
      <div className="wrap relative grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal as="p" className="eyebrow mb-6 text-plum-light" y={12} amount={0.9}>
            Depilación láser
          </Reveal>
          <RevealLines
            id="laser-title"
            label="Libertad para sentirte cómoda en tu piel."
            className="display t-h2 text-white lg:text-[clamp(3rem,1.6rem+3.6vw,5.5rem)]"
            amount={0.8}
            lines={[
              "Libertad para",
              <>
                sentirte <em>cómoda</em>
              </>,
              "en tu piel.",
            ]}
          />
          <Reveal as="p" delay={0.15} className="t-lead mt-7 text-white/75">
            Láser de diodo con seguimiento personalizado.
          </Reveal>
          <Reveal delay={0.25} className="mt-8">
            <p className="inline-flex items-center gap-3 rounded-full border border-sunrise/40 bg-sunrise/10 py-2.5 pl-3 pr-5 text-[0.9375rem]">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sunrise text-night">
                <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
              </span>
              <span>
                Tu bono de 6 sesiones: <strong className="font-semibold text-sunrise">pagas solo 5.</strong>
              </span>
            </p>
          </Reveal>
          <ClipImage
            photo={PHOTOS.laser}
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="mt-12 hidden aspect-[4/5] rounded-[var(--radius-lg)] lg:block"
            parallax={40}
          />
        </div>

        <div className="lg:col-span-7">
          <Calculator />
        </div>
      </div>
    </m.section>
  );
}

function Calculator() {
  const [sel, setSel] = useState<string[]>([]);
  const [bono, setBono] = useState(true);
  const reduce = useReducedMotion();
  const { add, has } = useCita();

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const items = sel.map((id) => getTreatment(id)).filter((t) => !!t);
  const per = items.reduce((s, t) => s + (t?.price ?? 0), 0);
  const six = per * 6;
  const pack = per * 5;
  const save = six - pack;
  const avg = pack / 6;
  const names = items.map((t) => t!.name).join(", ");
  const allInCita = sel.length > 0 && sel.every((id) => has(id));

  const message = sel.length
    ? `Hola, Alba. Me interesa el bono de láser de 6 sesiones para: ${names}. Precio por sesión: ${eur(per)}. Con el bono (pagas 5 y te llevas 6): ${eur(pack)}, ahorro de ${eur(save)}. ¿Me contáis cómo funciona y qué disponibilidad tenéis?`
    : "Hola, Alba. Me gustaría informarme sobre el bono de láser de 6 sesiones. ¿Me contáis cómo funciona?";

  return (
    <Reveal className="rounded-[var(--radius-lg)] border border-line-light bg-night-2/80 p-6 sm:p-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h3 className="display t-h3">Calcula tu bono</h3>
        <p className="text-[0.8125rem] text-white/60">Elige una o varias zonas</p>
      </div>

      <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {LASER_GROUPS.map((g) => (
          <fieldset key={g.name} className={g.name === "Piernas e ingles" ? "sm:col-span-2" : ""}>
            <legend className="eyebrow mb-2 text-plum-light">{g.name}</legend>
            <ul className={g.name === "Piernas e ingles" ? "grid gap-x-8 sm:grid-cols-2" : ""}>
              {g.items.map((t) => {
                const on = sel.includes(t.id);
                return (
                  <li key={t.id} className="border-b border-line-light">
                    <label className="group flex min-h-12 cursor-pointer items-center gap-3 py-2">
                      <input type="checkbox" className="peer sr-only" checked={on} onChange={() => toggle(t.id)} />
                      <span
                        aria-hidden="true"
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-colors duration-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-plum-light ${
                          on ? "border-plum-light bg-plum-light text-night" : "border-white/35 group-hover:border-white"
                        }`}
                      >
                        <AnimatePresence initial={false}>
                          {on && (
                            <m.span
                              initial={reduce ? false : { scale: 0.3, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.3, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 600, damping: 28 }}
                            >
                              <Check size={13} strokeWidth={3} />
                            </m.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="flex-1 text-[0.9375rem]">{t.name}</span>
                      <span className="font-serif text-[1.125rem] tabular-nums text-white/85">{eur(t.price)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      {/* Resultado */}
      <div className="mt-9 rounded-[var(--radius-md)] bg-white/[0.04] p-5 sm:p-7" aria-live="polite">
        <div role="radiogroup" aria-label="Forma de pago" className="relative inline-grid grid-cols-2 rounded-full border border-line-light p-1">
          {[
            { v: false, l: "6 sueltas" },
            { v: true, l: "Bono 6 × 5" },
          ].map((o) => (
            <button
              key={o.l}
              type="button"
              role="radio"
              aria-checked={bono === o.v}
              onClick={() => setBono(o.v)}
              className={`relative min-h-10 rounded-full px-4 text-[0.8125rem] font-semibold transition-colors duration-300 ${
                bono === o.v ? "text-night" : "text-white/70 hover:text-white"
              }`}
            >
              {bono === o.v && (
                <m.span
                  layoutId="bono-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{o.l}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-3">
          <div>
            <p className="text-[0.8125rem] text-white/60">{bono ? "Precio del bono (6 sesiones)" : "6 sesiones sueltas"}</p>
            <AnimatedNumber
              value={bono ? pack : six}
              format={int}
              className="display mt-1 block text-[clamp(3rem,2rem+4vw,4.75rem)] leading-none"
            />
          </div>
          <AnimatePresence>
            {bono && save > 0 && (
              <m.p
                key="save"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
                className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sunrise px-3.5 py-1.5 text-[0.875rem] font-semibold text-night"
              >
                Ahorras <AnimatedNumber value={save} format={int} />
              </m.p>
            )}
          </AnimatePresence>
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line-light pt-6 text-[0.875rem] sm:grid-cols-3">
          {[
            { k: "Por sesión", v: per, f: int },
            { k: "6 sesiones sueltas", v: six, f: int },
            { k: "Bono (pagas 5)", v: pack, f: int },
            { k: "Ahorro", v: save, f: int, hi: true },
            { k: "Media por sesión con bono", v: avg, f: dec },
          ].map((r) => (
            <div key={r.k}>
              <dt className="text-white/55">{r.k}</dt>
              <dd className={`mt-0.5 font-serif text-[1.375rem] ${r.hi && save > 0 ? "text-sunrise" : ""}`}>
                <AnimatedNumber value={r.v} format={r.f} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-5 text-[0.8125rem] leading-relaxed text-white/60">
        Los precios son por sesión. La promoción se aplica al bono de 6 sesiones: pagas 5 y te llevas 6. Los bonos se pueden
        pagar en dos pagos.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <a href={waLink(message)} target="_blank" rel="noopener" className="btn btn-light">
          Consultar mi bono por WhatsApp
          <ArrowRight size={16} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />
        </a>
        <button
          type="button"
          disabled={!sel.length || allInCita}
          onClick={() => sel.forEach(add)}
          className="btn btn-outline-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allInCita ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : <Plus size={16} strokeWidth={2} aria-hidden="true" />}
          {allInCita ? "Zonas en tu cita" : "Añadir zonas a mi cita"}
        </button>
      </div>
    </Reveal>
  );
}
