import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CLINIC, HOURS_TEXT } from '../../data/clinic'
import { openState } from '../../lib/time'
import { Magnetic } from '../ui/Magnetic'
import { FadeIn, WordReveal } from '../ui/WordReveal'

export function Contact() {
  const [open, setOpen] = useState(() => openState())
  const [mapOn, setMapOn] = useState(false)
  useEffect(() => {
    const t = window.setInterval(() => setOpen(openState()), 60_000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <section id="contacto" aria-labelledby="contact-title" className="section bg-white">
      <div className="wrap grid12 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow">Contacto</p>
          <WordReveal id="contact-title" text="Estamos en Huelva. Estamos cerca." className="h2 mt-5 max-w-[12ch]" />

          <FadeIn delay={0.15}>
            <p className={`mt-8 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[14px] font-medium ${open.open ? 'bg-[#e3f4ea] text-[#16794a]' : 'bg-porcelain text-slate'}`}>
              <span className={`h-2 w-2 rounded-full ${open.open ? 'animate-pulse bg-[#22a061]' : 'bg-mist'}`} aria-hidden />
              {open.text}
            </p>

            <dl className="mt-8 grid gap-7">
              <div className="flex gap-4">
                <MapPin size={20} className="mt-0.5 flex-none text-blue" aria-hidden />
                <div>
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mist">Dirección</dt>
                  <dd className="mt-1.5 text-[18px] leading-[1.4] text-night">
                    {CLINIC.street}
                    <br />
                    {CLINIC.postal} {CLINIC.city}
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone size={20} className="mt-0.5 flex-none text-blue" aria-hidden />
                <div>
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mist">Teléfono</dt>
                  <dd className="num mt-1.5 text-[18px] text-night">
                    <a href={CLINIC.tel} className="underline-offset-4 hover:underline">
                      {CLINIC.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock size={20} className="mt-0.5 flex-none text-blue" aria-hidden />
                <div className="flex-1">
                  <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-mist">Horario</dt>
                  <dd className="mt-1.5">
                    <table className="w-full max-w-[360px] text-[16px]">
                      <tbody>
                        {HOURS_TEXT.map((h) => (
                          <tr key={h.label} className="border-b border-soft-line last:border-0">
                            <th scope="row" className="py-2 pr-4 text-left font-normal text-slate">
                              {h.label}
                            </th>
                            <td className={`num py-2 text-right font-medium ${h.value === 'Cerrado' ? 'text-mist' : 'text-night'}`}>{h.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Magnetic href={CLINIC.tel}>
                <Phone size={18} aria-hidden /> Llamar ahora
              </Magnetic>
              <a href={CLINIC.maps} target="_blank" rel="noopener" className="btn btn--ghost">
                Cómo llegar <ArrowUpRight size={18} aria-hidden />
              </a>
            </div>
          </FadeIn>
        </div>

        <FadeIn className="col-span-12 lg:col-span-6 lg:col-start-7" delay={0.1}>
          <div className="relative aspect-[4/3.4] overflow-hidden rounded-[var(--r-stage)] bg-ice lg:aspect-auto lg:h-full lg:min-h-[560px]">
            <MapArt />
            <iframe
              title="Mapa con la ubicación de Cúspide Clínica Dental en Calle Puerto, 23, Huelva"
              src={CLINIC.osm}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setMapOn(true)}
              className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-700 [filter:saturate(0.55)_contrast(1.03)] ${mapOn ? 'opacity-100' : 'opacity-0'}`}
            />
            <a href={CLINIC.maps} target="_blank" rel="noopener" className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold text-night shadow-[0_12px_30px_-12px_rgba(11,27,51,0.4)] transition-transform duration-500 ease-[var(--ease)] hover:-translate-y-0.5">
              <MapPin size={16} className="text-blue" aria-hidden /> Abrir en Google Maps
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* Plano dibujado (sin cargar terceros hasta que se pide): calles, la ría y el punto de la clínica. */
function MapArt() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 520" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="600" height="520" fill="#eef3fa" />
      <path d="M-20 430 C 120 400, 210 470, 340 440 S 560 380, 640 410 L 640 540 L -20 540 Z" fill="#d8e6f8" />
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        <path d="M-10 120 L 610 190" strokeWidth="18" />
        <path d="M80 -10 L 210 530" strokeWidth="14" />
        <path d="M330 -10 L 300 420" strokeWidth="22" />
        <path d="M-10 300 L 610 260" strokeWidth="12" />
        <path d="M470 -10 L 540 420" strokeWidth="10" />
        <path d="M150 60 L 560 60" strokeWidth="8" />
        <path d="M20 210 L 290 230" strokeWidth="8" />
        <path d="M380 330 L 600 330" strokeWidth="8" />
      </g>
      <g stroke="#dfe7f2" fill="none" strokeWidth="1.5">
        <path d="M-10 120 L 610 190" />
        <path d="M330 -10 L 300 420" />
      </g>
      <text x="345" y="150" fontSize="13" fontWeight="600" fill="#5b6880" fontFamily="Instrument Sans, sans-serif" transform="rotate(-86 345 150)">
        Calle Puerto
      </text>
      <circle cx="316" cy="246" r="48" fill="rgba(26,91,214,0.12)">
        <animate attributeName="r" values="22;56;22" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="316" cy="246" r="13" fill="#1a5bd6" stroke="#fff" strokeWidth="4" />
    </svg>
  )
}
