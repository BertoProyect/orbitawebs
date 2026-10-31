import { ArrowUpRight, Clock, CreditCard, MapPin, Phone } from "lucide-react";
import { ADDRESS_LINE, BUSINESS, HOURS_TABLE, MAP_EMBED, MAPS_DIRECTIONS } from "../data/business";
import { useMadridNow } from "../hooks/useNow";
import { WA_GENERIC } from "../lib/links";
import { OpenBadge } from "./Hero";
import { MaskReveal, Reveal, RevealLines, WhatsAppIcon } from "./ui";

export function Location() {
  const now = useMadridNow();
  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      className="bg-bg-2 py-[clamp(96px,13vw,176px)]"
    >
      <div className="wrap">
        <RevealLines
          lines={["Estamos en el", "centro de Huelva."]}
          className="display h-lg"
          id="contacto-title"
        />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <MaskReveal className="media relative min-h-[360px] lg:min-h-[560px]">
            <iframe
              title="Mapa con la ubicación de Lienzo Peluquería en Calle Rico, 18, Huelva"
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="map-dark absolute inset-0 h-full w-full border-0"
            />
            <a
              href={MAPS_DIRECTIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--sm absolute bottom-4 left-4 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.7)]"
            >
              Cómo llegar
              <ArrowUpRight className="btn__arrow" />
            </a>
          </MaskReveal>

          <Reveal className="flex flex-col gap-9" delay={0.1}>
            <div className="flex gap-4">
              <MapPin
                className="mt-1 h-5 w-5 shrink-0 text-gold"
                aria-hidden="true"
                strokeWidth={1.5}
              />
              <div>
                <h3 className="text-sm text-muted">Dirección</h3>
                <address className="mt-1 text-[1.15rem] not-italic">
                  {BUSINESS.address.street}
                  <br />
                  {BUSINESS.address.postalCode} {BUSINESS.address.city}
                </address>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock
                className="mt-1 h-5 w-5 shrink-0 text-gold"
                aria-hidden="true"
                strokeWidth={1.5}
              />
              <div className="flex-1">
                <h3 className="text-sm text-muted">Horario</h3>
                <OpenBadge className="mt-2" />
                <dl className="mt-4 divide-y divide-line border-y border-line">
                  {HOURS_TABLE.map((row) => {
                    const today = (row.dows as readonly number[]).includes(now.dow);
                    return (
                      <div
                        key={row.days}
                        className={`flex justify-between gap-4 py-3 text-[0.98rem] ${today ? "text-ink" : "text-ink-2"}`}
                      >
                        <dt className="flex items-center gap-2">
                          {row.days}
                          {today && (
                            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.7rem] text-gold-light">
                              Hoy
                            </span>
                          )}
                        </dt>
                        <dd className="text-right tabular">{row.hours}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone
                className="mt-1 h-5 w-5 shrink-0 text-gold"
                aria-hidden="true"
                strokeWidth={1.5}
              />
              <div>
                <h3 className="text-sm text-muted">Teléfono y WhatsApp</h3>
                <p className="mt-1 flex flex-wrap gap-x-6 gap-y-2 text-[1.15rem]">
                  <a href={BUSINESS.phoneHref} className="link">
                    {BUSINESS.phoneDisplay}
                  </a>
                  <a
                    href={WA_GENERIC}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link inline-flex items-center gap-2"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-gold" />
                    {BUSINESS.whatsappDisplay}
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CreditCard
                className="mt-1 h-5 w-5 shrink-0 text-gold"
                aria-hidden="true"
                strokeWidth={1.5}
              />
              <div>
                <h3 className="text-sm text-muted">Formas de pago</h3>
                <ul className="mt-2 flex flex-wrap gap-2" aria-label="Formas de pago">
                  {BUSINESS.payments.map((p) => (
                    <li
                      key={p}
                      className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="sr-only">{ADDRESS_LINE}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
