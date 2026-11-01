import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { BUSINESS } from "../data/business";
import { scrollToId } from "../lib/links";
import { NAV } from "./Nav";
import { EASE, Wordmark } from "./ui";

const base = import.meta.env.BASE_URL;

/* Entrada de cine sutil: el gran «Alba» sube desde detrás de su máscara y las columnas
   aparecen escalonadas. */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const go = inView || !!reduce;
  const col = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: go ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: EASE, delay: 0.25 + i * 0.08 },
  });

  return (
    <footer ref={ref} className="on-dark overflow-hidden bg-night pb-20 pt-20 text-white/80 sm:pt-28 lg:pb-0">
      <div className="wrap">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <m.div className="lg:col-span-4" {...col(0)}>
            <Wordmark light className="text-white" />
            <p className="mt-5 max-w-[30ch] text-[0.9375rem]">Para que te digan «qué buena cara tienes».</p>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener"
              className="link-u mt-6 inline-block text-[0.875rem] font-medium text-white"
            >
              Instagram
            </a>
          </m.div>
          <m.nav aria-label="Pie de página" className="lg:col-span-2" {...col(1)}>
            <h2 className="eyebrow mb-5 text-plum-light">Navegar</h2>
            <ul className="space-y-2 text-[0.9375rem]">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(n.id);
                    }}
                    className="inline-block py-1 transition-colors hover:text-white"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.nav>
          <m.div className="lg:col-span-3" {...col(2)}>
            <h2 className="eyebrow mb-5 text-plum-light">Contacto</h2>
            <address className="text-[0.9375rem] not-italic leading-relaxed">
              {BUSINESS.street}
              <br />
              {BUSINESS.zip} {BUSINESS.city}
            </address>
            <a href={BUSINESS.phoneHref} className="mt-3 inline-block py-1 text-[0.9375rem] text-white">
              {BUSINESS.phoneDisplay}
            </a>
          </m.div>
          <m.div className="lg:col-span-3" {...col(3)}>
            <h2 className="eyebrow mb-5 text-plum-light">Horario</h2>
            <dl className="space-y-2 text-[0.9375rem]">
              <div>
                <dt className="text-white">Lunes a viernes</dt>
                <dd>10:00 – 14:00 · 16:30 – 20:30</dd>
              </div>
              <div>
                <dt className="text-white">Sábado</dt>
                <dd>10:00 – 14:00</dd>
              </div>
              <div>
                <dt className="text-white">Domingo</dt>
                <dd>Cerrado</dd>
              </div>
            </dl>
          </m.div>
        </div>

        {/* Gran firma */}
        <div className="line-mask mt-20 sm:mt-28" aria-hidden="true">
          <m.p
            className="display select-none whitespace-nowrap text-center text-[clamp(3.25rem,0.5rem+12.5vw,15rem)] leading-[0.85] text-white/[0.08]"
            initial={reduce ? false : { y: "100%" }}
            animate={go ? { y: "0%" } : undefined}
            transition={{ duration: 1.6, ease: EASE, delay: 0.1 }}
          >
            Alba <em className="!text-plum-light/30">Estética</em>
          </m.p>
        </div>

        <m.div
          className="flex flex-col gap-5 border-t border-line-light py-8 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between"
          {...col(4)}
        >
          <p>© 2026 Alba Estética.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <a className="hover:text-white" href={`${base}aviso-legal/`}>
              Aviso legal
            </a>
            <a className="hover:text-white" href={`${base}privacidad/`}>
              Privacidad
            </a>
            <a className="hover:text-white" href={`${base}cookies/`}>
              Cookies
            </a>
          </nav>
          <a
            className="inline-flex items-center gap-2.5 opacity-80 transition-opacity hover:opacity-100"
            href="https://orbitawebs.com"
            target="_blank"
            rel="noopener"
          >
            <span>By</span>
            <picture>
              <source media="(min-width: 768px)" srcSet={`${base}brand/orbita-logo-horizontal-white.webp`} width={106} height={15} />
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
        </m.div>
      </div>
    </footer>
  );
}
