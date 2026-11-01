import { m, useReducedMotion } from "framer-motion";
import { TEAM } from "../data/content";
import { EASE, SectionHead } from "./ui";

/* Tres composiciones editoriales. Sin fotos inventadas: un monograma en cursiva sobre la luz
   de cabina, a la espera de los retratos reales del equipo. */
export function Team() {
  const reduce = useReducedMotion();
  return (
    <section id="equipo" aria-labelledby="equipo-title" className="py-[clamp(88px,12vw,160px)]">
      <div className="wrap">
        <SectionHead
          eyebrow="El equipo"
          id="equipo-title"
          label="Las manos detrás de cada cuidado."
          lines={[
            "Las manos detrás",
            <>
              de cada <em>cuidado.</em>
            </>,
          ]}
        />
        <ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-20 lg:gap-12">
          {TEAM.map((p, i) => (
            <m.li
              key={p.name}
              className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-8" : ""}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.12 }}
            >
              <div className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-plum-soft">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,rgba(247,179,133,0.45),rgba(247,179,133,0)_60%)] transition-transform duration-[1200ms] ease-[var(--ease-expo)] group-hover:scale-110"
                />
                <m.span
                  aria-hidden="true"
                  className="serif-italic absolute inset-0 grid place-items-center text-[clamp(9rem,18vw,15rem)] leading-none text-plum/85"
                  initial={reduce ? false : { y: "18%", opacity: 0 }}
                  whileInView={{ y: "0%", opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.4, ease: EASE, delay: 0.15 + i * 0.12 }}
                >
                  {p.initial}
                </m.span>
                <span aria-hidden="true" className="absolute inset-x-8 bottom-8 h-px bg-plum/25" />
              </div>
              <h3 className="display t-h3 mt-7">{p.name}</h3>
              <p className="eyebrow mt-2 text-plum">{p.role}</p>
              <p className="mt-4 max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-2">{p.bio}</p>
            </m.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
