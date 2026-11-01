import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { PHOTOS } from "../data/content";
import { CATEGORIES, inCategory, LASER_GROUPS, type CategoryId, type Treatment } from "../data/treatments";
import { eur, mins } from "../lib/format";
import { scrollToId } from "../lib/links";
import { AddButton } from "./AddButton";
import { EASE, Img, SectionHead } from "./ui";

const CAT_PHOTO = {
  faciales: PHOTOS.faciales,
  corporales: PHOTOS.corporales,
  cejas: PHOTOS.cejas,
  manos: PHOTOS.manos,
  laser: PHOTOS.laser,
} as const;

const CAT_LINE: Record<CategoryId, string> = {
  faciales: "Limpieza, hidratación, luz y firmeza para tu rostro.",
  corporales: "Masajes y aparatología para cuidarte de pies a cabeza.",
  cejas: "Una mirada definida y natural, sin pasarse.",
  manos: "Manos y pies cuidados con detalle y acabados duraderos.",
  laser: "Precios por sesión. Con el bono de 6 sesiones pagas solo 5.",
};

/* Escena 3 · El descubrimiento.
   En escritorio la foto queda anclada a la izquierda y cambia con la categoría mientras la carta
   avanza a la derecha. En móvil, foto arriba y lista debajo, sin scroll horizontal. */
export function Treatments() {
  const [cat, setCat] = useState<CategoryId>("faciales");
  const reduce = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = CATEGORIES.findIndex((c) => c.id === cat);
    let n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % CATEGORIES.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + CATEGORIES.length) % CATEGORIES.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = CATEGORIES.length - 1;
    if (n < 0) return;
    e.preventDefault();
    setCat(CATEGORIES[n].id);
    tabs.current[n]?.focus();
  };

  const items = inCategory(cat);

  return (
    <section id="tratamientos" aria-labelledby="trat-title" className="bg-surface py-[clamp(88px,12vw,160px)]">
      <div className="wrap">
        <SectionHead
          eyebrow="Tratamientos"
          id="trat-title"
          label="Tu piel. Tu momento. Tu mejor versión."
          lines={[
            "Tu piel. Tu momento.",
            <>
              <em>Tu mejor versión.</em>
            </>,
          ]}
          intro="Faciales, corporales, láser, cejas, pestañas y manicura, con resultados naturales y la misma esteticista en cada visita."
        />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* Imagen anclada */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] bg-plum-soft sm:aspect-[16/9] lg:aspect-[4/5]">
                <AnimatePresence initial={false} mode="sync">
                  <m.div
                    key={cat}
                    className="absolute inset-0"
                    initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
                    animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0.999 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    <m.div
                      className="h-full w-full"
                      initial={reduce ? false : { scale: 1.12 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.4, ease: EASE }}
                    >
                      <Img
                        photo={CAT_PHOTO[cat]}
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="h-full w-full object-cover"
                      />
                    </m.div>
                  </m.div>
                </AnimatePresence>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(38,16,25,0)_55%,rgba(38,16,25,0.6)_100%)]"
                />
                <div className="on-dark absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                  <AnimatePresence mode="wait" initial={false}>
                    <m.p
                      key={cat}
                      className="display text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)]"
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <em className="!text-white">{CATEGORIES.find((c) => c.id === cat)?.label}</em>
                    </m.p>
                  </AnimatePresence>
                  <span className="eyebrow text-white/80 tabular-nums" aria-hidden="true">
                    {String(CATEGORIES.findIndex((c) => c.id === cat) + 1).padStart(2, "0")} / 0{CATEGORIES.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carta */}
          <div className="lg:col-span-7">
            <div
              role="tablist"
              aria-label="Categorías de tratamientos"
              onKeyDown={onKey}
              className="flex flex-wrap gap-1.5"
            >
              {CATEGORIES.map((c, i) => {
                const sel = c.id === cat;
                return (
                  <button
                    key={c.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    id={`tab-${c.id}`}
                    aria-selected={sel}
                    aria-controls="panel-trat"
                    tabIndex={sel ? 0 : -1}
                    onClick={() => setCat(c.id)}
                    className={`relative min-h-11 rounded-full px-4 text-[0.875rem] font-medium transition-colors duration-300 ${
                      sel ? "text-white" : "text-ink-2 hover:text-plum"
                    }`}
                  >
                    {sel && (
                      <m.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-full bg-plum"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    {!sel && <span className="absolute inset-0 rounded-full border border-line" aria-hidden="true" />}
                    <span className="relative">{c.label}</span>
                  </button>
                );
              })}
            </div>

            <div
              id="panel-trat"
              role="tabpanel"
              aria-labelledby={`tab-${cat}`}
              tabIndex={0}
              className="mt-8 rounded-[var(--radius-sm)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={cat}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <p className="mb-4 text-[0.9375rem] text-muted">{CAT_LINE[cat]}</p>
                  {cat === "laser" ? (
                    <>
                      {LASER_GROUPS.map((g) => (
                        <div key={g.name} className="mt-6 first:mt-0">
                          <h3 className="eyebrow mb-1 text-plum">{g.name}</h3>
                          <ul>
                            {g.items.map((t, i) => (
                              <Row key={t.id} t={t} i={i} perSession />
                            ))}
                          </ul>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => scrollToId("laser")}
                        className="btn btn-ghost mt-8"
                      >
                        Calcular mi bono de láser
                        <ArrowRight size={16} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <ul>
                      {items.map((t, i) => (
                        <Row key={t.id} t={t} i={i} />
                      ))}
                    </ul>
                  )}
                </m.div>
              </AnimatePresence>
              <p className="mt-6 text-[0.8125rem] text-muted">Todos los precios incluyen IVA.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Fila editorial: fondo que entra al pasar el ratón, la flecha avanza y el precio cambia de tono. */
function Row({ t, i, perSession = false }: { t: Treatment; i: number; perSession?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <m.li
      className="group relative border-t border-line first:border-t-0"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.04 * i }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -mx-3 origin-left scale-x-[0.96] rounded-[var(--radius-sm)] bg-plum-soft opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-expo)] group-hover:scale-x-100 group-hover:opacity-100 sm:-mx-4"
      />
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-3 py-5 sm:flex-nowrap">
        <div className="min-w-0 flex-1 basis-full sm:basis-auto">
          <h4 className="font-serif text-[1.25rem] leading-snug font-[400] sm:text-[1.375rem]">{t.name}</h4>
          {!perSession && <p className="mt-1 max-w-[52ch] text-[0.875rem] leading-relaxed text-muted">{t.desc}</p>}
        </div>
        {t.mins !== null && (
          <span className="flex shrink-0 items-center gap-1.5 text-[0.8125rem] text-muted tabular-nums">
            <Clock size={13} strokeWidth={1.8} aria-hidden="true" />
            {mins(t.mins)}
          </span>
        )}
        <span className="flex shrink-0 items-center gap-2 sm:w-[112px] sm:justify-end">
          <ArrowRight
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
            className="-translate-x-2 text-plum opacity-0 transition-all duration-500 ease-[var(--ease-expo)] group-hover:translate-x-0 group-hover:opacity-100"
          />
          <span className="font-serif text-[1.375rem] tabular-nums transition-colors duration-500 group-hover:text-plum">
            {eur(t.price)}
          </span>
          {perSession && <span className="text-[0.75rem] text-muted">/ sesión</span>}
        </span>
        <AddButton id={t.id} className="ml-auto sm:ml-0" />
      </div>
    </m.li>
  );
}
