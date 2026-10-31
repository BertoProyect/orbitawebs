import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { CATEGORIES, PRICE_NOTE, priceLabel, type Category } from "../data/services";
import { useBooking } from "../state/booking";
import { EASE, Img, Reveal, RevealLines, WhatsAppIcon } from "./ui";

export function Services() {
  const [current, setCurrent] = useState<Category["id"]>("cortes");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { book } = useBooking();
  const reduce = useReducedMotion();
  const cat = CATEGORIES.find((c) => c.id === current) ?? CATEGORIES[0];

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % CATEGORIES.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + CATEGORIES.length) % CATEGORIES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = CATEGORIES.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setCurrent(CATEGORIES[next].id);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <section
      id="servicios"
      aria-labelledby="servicios-title"
      className="relative bg-bg-2 py-[clamp(96px,13vw,176px)]"
    >
      <span id="precios" className="absolute -top-20" aria-hidden="true" />
      <div className="wrap">
        <header className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <RevealLines
            lines={["Todo lo que tu", "pelo necesita."]}
            className="display h-lg"
            id="servicios-title"
          />
          <Reveal delay={0.1}>
            <p className="lead max-w-[30rem] lg:mb-3">
              Desde un buen corte hasta un cambio de color. Siempre con asesoramiento previo.
            </p>
          </Reveal>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[clamp(40px,5vw,88px)]">
          {/* Foto de la categoría */}
          <div className="hidden lg:block">
            <div className="media sticky top-[calc(var(--nav-h)+32px)] aspect-[4/5]">
              <AnimatePresence initial={false}>
                <m.div
                  key={cat.id}
                  className="absolute inset-0"
                  initial={
                    reduce
                      ? { opacity: 0, zIndex: 1 }
                      : { clipPath: "inset(0% 0% 0% 100%)", zIndex: 1 }
                  }
                  animate={
                    reduce
                      ? { opacity: 1, zIndex: 1 }
                      : { clipPath: "inset(0% 0% 0% 0%)", zIndex: 1 }
                  }
                  exit={{ zIndex: 0, transition: { duration: 1 } }}
                  transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                >
                  <m.div
                    className="h-full w-full"
                    initial={reduce ? false : { scale: 1.15 }}
                    animate={{ scale: 1.03 }}
                    transition={{ duration: 1.6, ease: EASE }}
                  >
                    <Img
                      photo={cat.image}
                      widths={[480, 720, 960, 1200]}
                      sizes="(min-width: 1320px) 480px, 36vw"
                      className="h-full w-full object-cover"
                    />
                  </m.div>
                </m.div>
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg/80 to-transparent" />
              <AnimatePresence mode="wait">
                <m.p
                  key={cat.id}
                  className="absolute inset-x-7 bottom-7 max-w-[22rem] text-[1.05rem] leading-snug text-ink"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
                >
                  {cat.intro}
                </m.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="min-w-0">
            {/* Pestañas */}
            <div
              role="tablist"
              aria-label="Categorías de servicios"
              className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-1 overflow-x-auto border-b border-line px-[var(--gutter)] lg:mx-0 lg:px-0"
            >
              {CATEGORIES.map((c, i) => {
                const on = c.id === current;
                return (
                  <button
                    key={c.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${c.id}`}
                    aria-selected={on}
                    aria-controls={`panel-${c.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setCurrent(c.id)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`relative shrink-0 snap-start rounded-t-md px-4 pb-4 pt-2 text-[0.98rem] transition-colors duration-500 ${
                      on ? "text-ink" : "text-muted hover:text-ink-2"
                    }`}
                  >
                    {c.label}
                    {on && (
                      <m.span
                        layoutId="tab-underline"
                        className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-gold"
                        transition={{ type: "spring", stiffness: 420, damping: 38 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-ink-2 lg:hidden">{cat.intro}</p>

            {/* Carta de la categoría */}
            <div
              id={`panel-${cat.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${cat.id}`}
              tabIndex={0}
              className="rounded-md"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.ul key={cat.id} className="mt-4" initial="hidden" animate="show" exit="exit">
                  {cat.services.map((s, i) => (
                    <m.li
                      key={s.id}
                      variants={{
                        hidden: { opacity: 0, y: reduce ? 0 : 16 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.7, ease: EASE, delay: i * 0.06 },
                        },
                        exit: { opacity: 0, y: reduce ? 0 : -8, transition: { duration: 0.25 } },
                      }}
                      className="group relative grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-b border-line py-6"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-gold to-gold/0 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100"
                      />
                      <h3 className="text-[1.2rem] font-normal tracking-[-0.015em] text-ink sm:text-[1.35rem]">
                        {s.name}
                      </h3>
                      <p
                        className={`text-right text-[1.2rem] tabular sm:text-[1.35rem] ${s.price === 0 ? "text-success" : "text-gold-light"}`}
                      >
                        {s.from && (
                          <span className="mr-1.5 text-[0.8rem] tracking-wide text-muted">
                            desde
                          </span>
                        )}
                        {s.price === 0 ? "Gratis" : `${s.price} €`}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.92rem] text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {s.duration}
                        </span>
                        {s.note && <span className="text-ink-2/80">{s.note}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => book(s.id)}
                        aria-label={`Reservar ${s.name}, ${priceLabel(s)}`}
                        className="inline-flex items-center justify-self-end gap-2 rounded-full border border-line px-3.5 py-1.5 text-[0.82rem] text-ink-2 transition-all duration-500 hover:border-gold hover:bg-gold hover:text-bg focus-visible:border-gold"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        Reservar
                      </button>
                    </m.li>
                  ))}
                </m.ul>
              </AnimatePresence>
            </div>

            <p className="mt-8 flex gap-3 text-sm text-muted">
              <span className="mt-[0.6em] h-px w-6 shrink-0 bg-gold/60" aria-hidden="true" />
              {PRICE_NOTE}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
