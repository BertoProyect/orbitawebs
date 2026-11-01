import { BASE, CLINIC, HOURS_TEXT, NAV, TREATMENTS } from '../../data/clinic'
import { Logo } from '../ui/Logo'

/* Pie azul noche. Crédito obligatorio de las demos: «By» + logo de Órbita en blanco,
   horizontal en escritorio y apilado en móvil. */
export function Footer() {
  const col = 'text-[12.5px] font-semibold uppercase tracking-[0.14em] text-muted-light'
  const link = 'text-[15px] text-text-light/85 transition-colors hover:text-white'
  return (
    <footer className="on-night night relative z-10 -mt-px">
      <div className="wrap pb-10 pt-[clamp(72px,10vw,128px)]">
        <div className="grid12 gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <a href={`${BASE}/`} className="inline-block">
              <Logo tone="light" className="h-7 w-auto" />
              <span className="sr-only">Cúspide Clínica Dental</span>
            </a>
            <p className="mt-6 max-w-[16ch] text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-text-light">{CLINIC.slogan}</p>
            <a href="#cita" className="btn btn--light mt-8">
              Pedir cita
            </a>
          </div>

          <nav aria-label="Secciones" className="col-span-6 sm:col-span-4 lg:col-span-2 lg:col-start-6">
            <p className={col}>Navegación</p>
            <ul className="mt-5 grid gap-3">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className={link}>
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#cita" className={link}>
                  Pedir cita
                </a>
              </li>
            </ul>
          </nav>

          <div className="col-span-6 sm:col-span-4 lg:col-span-2">
            <p className={col}>Tratamientos</p>
            <ul className="mt-5 grid gap-3">
              {TREATMENTS.map((t) => (
                <li key={t.id}>
                  <a href="#tratamientos" className={link}>
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 sm:col-span-4 lg:col-span-3">
            <p className={col}>Contacto</p>
            <address className="mt-5 grid gap-1 text-[15px] not-italic leading-[1.5] text-text-light/85">
              <span>{CLINIC.street}</span>
              <span>
                {CLINIC.postal} {CLINIC.city}
              </span>
              <a href={CLINIC.tel} className={`num mt-2 ${link}`}>
                {CLINIC.phone}
              </a>
            </address>
            <dl className="mt-6 grid gap-1.5 text-[14px]">
              {HOURS_TEXT.map((h) => (
                <div key={h.label} className="flex justify-between gap-4 border-b border-white/[0.08] pb-1.5">
                  <dt className="text-muted-light">{h.label}</dt>
                  <dd className="num text-right text-text-light/85">{h.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-[clamp(64px,8vw,104px)] flex flex-col gap-6 border-t border-white/10 pt-7 text-[13.5px] text-muted-light md:flex-row md:items-center md:justify-between">
          <p className="m-0">© 2026 Cúspide Clínica Dental</p>
          <nav aria-label="Información legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <a href={`${BASE}/privacidad/`} className="hover:text-white">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href={`${BASE}/aviso-legal/`} className="hover:text-white">
                  Aviso legal
                </a>
              </li>
              <li>
                <a href={`${BASE}/cookies/`} className="hover:text-white">
                  Política de cookies
                </a>
              </li>
            </ul>
          </nav>
          <a href="https://orbitawebs.com" target="_blank" rel="noopener" className="inline-flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100">
            <span>By</span>
            <picture>
              <source media="(min-width: 768px)" srcSet={`${BASE}/brand/orbita-logo-horizontal-white.webp`} width={99} height={14} />
              <img src={`${BASE}/brand/orbita-logo-apilado-white.webp`} width={48} height={28} alt="Órbita Webs" loading="lazy" decoding="async" className="h-auto" />
            </picture>
          </a>
        </div>
      </div>
    </footer>
  )
}
