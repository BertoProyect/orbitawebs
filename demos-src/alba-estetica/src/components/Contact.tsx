import { m, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock, CreditCard, MapPin, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BUSINESS, HOURS_ROWS } from "../data/business";
import { waLink } from "../lib/links";
import { openState } from "../lib/time";
import { EASE, Italic, Magnetic, Reveal, RevealLines } from "./ui";

const WA_CITA = waLink("Hola, Alba. Quiero pedir cita. ¿Qué disponibilidad tenéis?");

/* Escena 7 · La invitación final + contacto */
export function Contact() {
  const head = useRef<HTMLDivElement>(null);
  const inView = useInView(head, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [now, setNow] = useState(() => openState());
  useEffect(() => {
    const t = window.setInterval(() => setNow(openState()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="pb-[clamp(88px,12vw,160px)] pt-[clamp(110px,14vw,200px)]">
      <div className="wrap">
        <div ref={head} className="flex flex-col items-start gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal as="p" className="eyebrow mb-6 text-plum" y={12}>
              Contacto
            </Reveal>
            <RevealLines
              id="contacto-title"
              label="Tu próxima visita puede empezar aquí."
              start={inView}
              className="display t-mega"
              lines={[
                "Tu próxima visita",
                <>
                  puede empezar <Italic go={inView || !!reduce} delay={0.35}>aquí.</Italic>
                </>,
              ]}
            />
          </div>
          <m.div
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={inView || reduce ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
            className="relative shrink-0"
          >
            {/* Acento animado: halo cálido que respira detrás del botón */}
            <span aria-hidden="true" className="cta-halo absolute inset-0 rounded-full bg-sunrise/60" />
            <Magnetic strength={0.3}>
              <a href={WA_CITA} target="_blank" rel="noopener" className="btn btn-primary relative min-h-16 px-8 text-[1rem]">
                Quiero pedir cita
                <ArrowRight size={18} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />
              </a>
            </Magnetic>
          </m.div>
        </div>

        <div className="mt-16 grid gap-10 border-t border-line pt-12 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-6">
            <Reveal>
              <h3 className="eyebrow flex items-center gap-2 text-plum">
                <MapPin size={14} strokeWidth={2} aria-hidden="true" /> Dirección
              </h3>
              <address className="mt-4 font-serif text-[1.375rem] not-italic leading-snug">
                {BUSINESS.street}
                <br />
                {BUSINESS.zip} {BUSINESS.city}
              </address>
              <a href={BUSINESS.mapsDirections} target="_blank" rel="noopener" className="btn btn-ghost btn-sm mt-5">
                Cómo llegar <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="eyebrow flex items-center gap-2 text-plum">
                <Phone size={14} strokeWidth={2} aria-hidden="true" /> Teléfono y WhatsApp
              </h3>
              <a href={BUSINESS.phoneHref} className="link-u mt-4 inline-block font-serif text-[1.375rem]">
                {BUSINESS.phoneDisplay}
              </a>
              <div>
                <a href={WA_CITA} target="_blank" rel="noopener" className="btn btn-ghost btn-sm mt-5">
                  Escribir por WhatsApp <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <h3 className="eyebrow flex items-center gap-2 text-plum">
                <Clock size={14} strokeWidth={2} aria-hidden="true" /> Horario
              </h3>
              <p className="mt-4 inline-flex items-center gap-2 text-[0.875rem]" aria-live="polite">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${now.open ? "bg-[#3f9a62]" : "bg-plum-light"}`} />
                {now.label}
              </p>
              <dl className="mt-4 space-y-3 text-[0.9375rem]">
                {HOURS_ROWS.map((r) => (
                  <div key={r.days}>
                    <dt className="font-semibold">{r.days}</dt>
                    <dd className="text-ink-2 tabular-nums">{r.slots.length ? r.slots.join(" · ") : "Cerrado"}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.16}>
              <h3 className="eyebrow flex items-center gap-2 text-plum">
                <CreditCard size={14} strokeWidth={2} aria-hidden="true" /> Formas de pago
              </h3>
              <p className="mt-4 text-[0.9375rem] text-ink-2">{BUSINESS.payment}.</p>
              <p className="mt-2 text-[0.9375rem] text-ink-2">Los bonos de láser, en dos pagos.</p>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-6" delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-plum-soft">
              <iframe
                title="Mapa: Alba Estética en Calle Puerto, 22, Huelva"
                src={BUSINESS.mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full grayscale-[0.35] saturate-[0.85]"
              />
            </div>
            <a href={BUSINESS.mapsPlace} target="_blank" rel="noopener" className="link-u mt-4 inline-block text-[0.875rem] font-medium text-plum">
              Abrir en Google Maps
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
