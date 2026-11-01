import { m, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { ABOUT_POINTS, PHOTOS } from "../data/content";
import { ClipImage, Counter, EASE, Reveal, RevealLines } from "./ui";

export function About() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="about-title" className="wrap py-[clamp(88px,12vw,168px)]">
      <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Composición asimétrica de imágenes */}
        <div className="relative lg:col-span-6 lg:pb-24">
          <ClipImage
            photo={PHOTOS.about}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/5] rounded-[var(--radius-lg)] lg:w-[86%]"
            parallax={50}
          />
          <ClipImage
            photo={PHOTOS.cabina}
            sizes="(min-width: 1024px) 22vw, 50vw"
            from="left"
            parallax={90}
            className="absolute -bottom-10 right-0 hidden aspect-[3/4] w-[44%] rounded-[var(--radius-md)] border-[6px] border-bg sm:block lg:bottom-0"
          />
        </div>

        <div className="lg:col-span-6 lg:pt-16">
          <Reveal as="p" className="eyebrow mb-5 text-plum" y={12}>
            Quiénes somos
          </Reveal>
          <RevealLines
            id="about-title"
            label="Belleza que se nota. Confianza que se siente."
            className="display t-h2"
            lines={[
              "Belleza que se nota.",
              <>
                <em>Confianza</em> que se siente.
              </>,
            ]}
          />
          <Reveal as="p" delay={0.15} className="t-lead mt-8 max-w-[46ch] text-ink-2">
            En Alba Estética creemos que cuidarte no debería ser complicado. Queremos que te sientas escuchada, que
            entiendas qué necesita tu piel y que disfrutes de cada visita.
          </Reveal>

          <ul className="mt-10 grid gap-x-8 sm:grid-cols-2">
            {ABOUT_POINTS.map((p, i) => (
              <m.li
                key={p}
                className="flex items-center gap-3 border-t border-line py-3.5 text-[0.9375rem]"
                initial={reduce ? false : { opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.07 }}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-plum-soft text-plum">
                  <Check size={13} strokeWidth={2.4} aria-hidden="true" />
                </span>
                {p}
              </m.li>
            ))}
          </ul>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {[
              { v: <Counter to={2014} from={1990} duration={1.8} />, l: "Abrimos en Huelva" },
              { v: <Counter to={4.9} decimals={1} />, l: "Nota en Google" },
              { v: <Counter to={212} />, l: "Opiniones" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="display text-[clamp(2rem,1.4rem+2.2vw,3.25rem)] tabular-nums">{s.v}</dd>
                <dd className="mt-1 text-[0.8125rem] text-muted" aria-hidden="true">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
