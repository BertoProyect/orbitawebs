import { m, useReducedMotion } from "framer-motion";
import { TEAM } from "../data/content";
import { EASE, Img, Reveal, RevealLines } from "./ui";

export function Team() {
  const reduce = useReducedMotion();
  return (
    <section
      id="equipo"
      aria-labelledby="equipo-title"
      className="bg-bg py-[clamp(96px,13vw,176px)]"
    >
      <div className="wrap">
        <RevealLines
          lines={["Tres personas.", "Una misma forma", "de entender el cabello."]}
          className="display h-lg max-w-[16ch]"
          id="equipo-title"
        />

        <ul
          className="no-scrollbar -mx-[var(--gutter)] mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:mt-20 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:gap-8"
          aria-label="Equipo de Lienzo"
        >
          {TEAM.map((p, i) => (
            <m.li
              key={p.name}
              className="group w-[78vw] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none"
              initial={reduce ? false : { opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.1, ease: EASE, delay: i * 0.12 }}
            >
              <figure>
                <div className={`media aspect-[3/4] ${i === 1 ? "md:translate-y-12" : ""}`}>
                  <Img
                    photo={p.photo}
                    widths={[480, 720, 960]}
                    sizes="(min-width: 1320px) 400px, (min-width: 768px) 30vw, 78vw"
                    className="h-full w-full object-cover grayscale-[35%] transition-[transform,filter] duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.06] group-hover:grayscale-0"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/70 to-transparent" />
                </div>
                <figcaption className={`mt-6 ${i === 1 ? "md:mt-[4.5rem]" : ""}`}>
                  <h3 className="text-[1.45rem] font-light tracking-[-0.02em]">{p.name}</h3>
                  {p.role && <p className="mt-1 text-sm text-gold">{p.role}</p>}
                  <p className="mt-3 text-ink-2">{p.focus}</p>
                  {p.extra && <p className="mt-1 text-ink-2">{p.extra}</p>}
                </figcaption>
              </figure>
            </m.li>
          ))}
        </ul>

        <Reveal className="mt-16 md:mt-28">
          <div className="rule-gold" />
          <p className="mt-8 max-w-[34ch] text-[clamp(1.35rem,1rem+1.4vw,2.1rem)] font-light leading-snug tracking-[-0.02em] text-ink">
            Hoy somos tres y cada cliente tiene a su peluquero de confianza.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
