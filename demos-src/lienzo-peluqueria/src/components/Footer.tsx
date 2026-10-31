import { BUSINESS, HOURS_TABLE, NAV_LINKS } from "../data/business";
import { scrollToId, WA_GENERIC } from "../lib/links";
import { Logo, WhatsAppIcon } from "./ui";

export function Footer() {
  const base = BUSINESS.base;
  return (
    <footer id="pie" className="border-t border-line bg-bg pb-28 pt-20 md:pb-12">
      <div className="wrap">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a
              href={base}
              className="inline-block rounded-md"
              aria-label="Lienzo Peluquería, volver arriba"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("inicio");
              }}
            >
              <Logo size="lg" />
            </a>
            <p className="mt-6 max-w-[22rem] text-[1.35rem] font-light leading-snug tracking-[-0.02em]">
              {BUSINESS.slogan}
            </p>
            <a
              href={WA_GENERIC}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary mt-8"
            >
              <WhatsAppIcon /> Reservar por WhatsApp
            </a>
          </div>

          <nav aria-label="Secciones">
            <h2 className="text-sm text-muted">Navegación</h2>
            <ul className="mt-4 grid gap-2.5">
              {[
                ...NAV_LINKS,
                { id: "reserva", label: "Reservar cita" },
                { id: "preguntas", label: "Preguntas frecuentes" },
              ].map((l) => (
                <li key={l.id}>
                  <a
                    href={`${base}#${l.id}`}
                    className="link text-ink-2"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(l.id);
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm text-muted">Contacto</h2>
            <address className="mt-4 grid gap-2.5 not-italic text-ink-2">
              <span>
                {BUSINESS.address.street}
                <br />
                {BUSINESS.address.postalCode} {BUSINESS.address.city}
              </span>
              <a href={BUSINESS.phoneHref} className="link w-fit text-ink-2">
                {BUSINESS.phoneDisplay}
              </a>
              <a
                href={WA_GENERIC}
                target="_blank"
                rel="noopener noreferrer"
                className="link w-fit text-ink-2"
              >
                WhatsApp {BUSINESS.whatsappDisplay}
              </a>
            </address>
          </div>

          <div>
            <h2 className="text-sm text-muted">Horario</h2>
            <dl className="mt-4 grid gap-3 text-ink-2">
              {HOURS_TABLE.map((r) => (
                <div key={r.days}>
                  <dt className="text-ink">{r.days}</dt>
                  <dd className="tabular">{r.hours}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-muted">Efectivo · Tarjeta · Bizum</p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 Lienzo Peluquería</p>
          <nav aria-label="Información legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <a className="link text-muted" href={`${base}aviso-legal/`}>
              Aviso legal
            </a>
            <a className="link text-muted" href={`${base}privacidad/`}>
              Privacidad
            </a>
            <a className="link text-muted" href={`${base}cookies/`}>
              Cookies
            </a>
          </nav>
          <a
            className="inline-flex items-center gap-2.5 text-ink-2 opacity-80 transition-opacity hover:opacity-100"
            href="https://orbitawebs.com"
            target="_blank"
            rel="noopener"
          >
            <span>By</span>
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet={`${base}brand/orbita-logo-horizontal-white.webp`}
                width={106}
                height={15}
              />
              <img
                src={`${base}brand/orbita-logo-apilado-white.webp`}
                width={48}
                height={28}
                alt="Órbita Webs"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </a>
        </div>
      </div>
    </footer>
  );
}
