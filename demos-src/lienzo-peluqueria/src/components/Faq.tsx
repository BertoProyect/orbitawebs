import { AnimatePresence, m } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { FAQ } from "../data/content";
import { EASE, Reveal, RevealLines } from "./ui";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      className="bg-bg py-[clamp(96px,13vw,176px)]"
    >
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <RevealLines
            lines={["Preguntas", "frecuentes."]}
            className="display h-md lg:sticky lg:top-[calc(var(--nav-h)+40px)]"
            id="preguntas-title"
          />
        </div>
        <Reveal>
          <ul className="border-t border-line">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              const btn = `${base}-q${i}`;
              const panel = `${base}-a${i}`;
              return (
                <li key={item.q} className="border-b border-line">
                  <h3>
                    <button
                      id={btn}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panel}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left text-[1.15rem] font-light tracking-[-0.01em] transition-colors duration-500 hover:text-gold-light sm:text-[1.3rem]"
                    >
                      {item.q}
                      <m.span
                        aria-hidden="true"
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${
                          isOpen
                            ? "border-gold bg-gold text-bg"
                            : "border-line-strong text-ink group-hover:border-gold"
                        }`}
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                      >
                        <Plus className="h-4 w-4" />
                      </m.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        id={panel}
                        role="region"
                        aria-labelledby={btn}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[56ch] pb-7 pr-12 text-ink-2">{item.a}</p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
