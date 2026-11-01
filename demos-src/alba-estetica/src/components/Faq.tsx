import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FAQ } from "../data/content";
import { EASE, Reveal, SectionHead } from "./ui";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="faq-title" className="py-[clamp(88px,12vw,160px)]">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead
            eyebrow="Preguntas frecuentes"
            id="faq-title"
            label="Lo que suelen preguntarnos."
            lines={[
              "Lo que suelen",
              <>
                <em>preguntarnos.</em>
              </>,
            ]}
          />
        </div>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <ul className="border-t border-line">
            {FAQ.map((f, i) => {
              const on = open === i;
              return (
                <li key={f.q} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={on}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(on ? null : i)}
                      className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className={`font-serif text-[clamp(1.1875rem,1rem+0.5vw,1.5rem)] transition-colors duration-300 ${on ? "text-plum" : "group-hover:text-plum"}`}>
                        {f.q}
                      </span>
                      <m.span
                        aria-hidden="true"
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                          on ? "border-plum bg-plum text-white" : "border-line-strong group-hover:border-plum"
                        }`}
                        animate={{ rotate: on ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 26 }}
                      >
                        <Plus size={16} strokeWidth={1.8} />
                      </m.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {on && (
                      <m.div
                        id={`faq-a-${i}`}
                        role="region"
                        aria-labelledby={`faq-q-${i}`}
                        className="overflow-hidden"
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                      >
                        <p className="max-w-[58ch] pb-7 pr-14 text-ink-2">{f.a}</p>
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
