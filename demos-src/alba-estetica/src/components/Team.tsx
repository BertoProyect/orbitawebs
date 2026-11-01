import { m, useReducedMotion } from "framer-motion";
import { TEAM } from "../data/content";
import { ClipImage, EASE, SectionHead } from "./ui";

/* Tres composiciones editoriales escalonadas: el retrato se abre con clip-path y el texto
   entra justo después. */
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
            <li key={p.name} className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-8" : ""}>
              <ClipImage
                photo={p.photo}
                sizes="(min-width: 768px) 30vw, 100vw"
                objectPosition={p.position}
                parallax={30}
                className="aspect-[4/5] rounded-[var(--radius-lg)]"
              />
              <m.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 }}
              >
                <h3 className="display t-h3 mt-7">{p.name}</h3>
                <p className="eyebrow mt-2 text-plum">{p.role}</p>
                <p className="mt-4 max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-2">{p.bio}</p>
              </m.div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
