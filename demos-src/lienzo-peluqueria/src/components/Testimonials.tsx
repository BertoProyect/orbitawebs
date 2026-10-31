import { m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Quote } from "lucide-react";
import { BUSINESS, GOOGLE_REVIEWS_SEARCH } from "../data/business";
import { TESTIMONIALS } from "../data/content";
import { Counter, EASE, RevealLines, Stars } from "./ui";

export function Testimonials() {
  const reduce = useReducedMotion();
  return (
    <section
      id="opiniones"
      aria-labelledby="opiniones-title"
      className="relative overflow-hidden bg-bg-2 py-[clamp(96px,13vw,176px)]"
    >
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <RevealLines
            lines={["Lo cuentan quienes", "ya se sientan en", "nuestra silla."]}
            className="display h-lg"
            id="opiniones-title"
          />
          <m.div
            className="flex items-end gap-6 lg:justify-end"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <p className="flex items-baseline text-[clamp(4.5rem,10vw,8rem)] font-extralight leading-[0.85] tracking-[-0.06em] text-gold-light tabular">
              <Counter to={BUSINESS.rating.value} decimals={1} />
              <span className="ml-2 text-[0.3em] tracking-normal text-muted">/ 5</span>
            </p>
            <div className="pb-2">
              <Stars />
              <p className="mt-2 text-sm text-ink-2">
                <Counter to={BUSINESS.rating.count} /> opiniones en Google
              </p>
            </div>
          </m.div>
        </div>

        <ul className="mt-16 grid gap-5 md:grid-cols-3 lg:mt-24 lg:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <m.li
              key={t.name}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
              className="group"
            >
              <figure className="flex h-full flex-col justify-between rounded-[var(--radius-card)] border border-line bg-bg/60 p-7 transition-[border-color,transform,background-color] duration-700 ease-[var(--ease-expo)] hover:-translate-y-1 hover:border-gold/40 hover:bg-bg sm:p-8">
                <div>
                  <Quote className="h-6 w-6 text-gold/70" aria-hidden="true" strokeWidth={1.25} />
                  <blockquote className="mt-6 text-[1.2rem] font-light leading-snug tracking-[-0.01em] text-ink">
                    <p>«{t.text}»</p>
                  </blockquote>
                </div>
                <figcaption className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-5 text-sm">
                  <span className="text-ink">{t.name}</span>
                  <span className="rounded-full border border-line px-3 py-1 text-muted">
                    {t.service}
                  </span>
                </figcaption>
              </figure>
            </m.li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
          <p className="max-w-[40ch] text-sm text-muted">
            Resúmenes de opiniones de clientes. Las reseñas completas están en Google.
          </p>
          <a
            href={GOOGLE_REVIEWS_SEARCH}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost"
          >
            Ver opiniones en Google
            <ArrowUpRight className="btn__arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
