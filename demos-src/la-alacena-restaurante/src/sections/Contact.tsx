import { motion } from 'framer-motion'
import { Clock, CreditCard, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Lines, Reveal } from '../components/ui'
import { HOURS, RESTAURANT } from '../data/restaurant'
import { fmtSlots, openStatus } from '../lib/hours'
import { EASE, VIEW } from '../lib/motion'
import { waGeneric } from '../lib/whatsapp'

export function useOpenStatus() {
  const [s, setS] = useState(() => openStatus())
  useEffect(() => {
    const t = window.setInterval(() => setS(openStatus()), 60_000)
    return () => window.clearInterval(t)
  }, [])
  return s
}

export function Contact() {
  const status = useOpenStatus()
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="bg-estraza py-24 md:py-36">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">Dónde estamos</span>
        </Reveal>
        <Lines id="contacto-title" lines={['Estamos en el', 'corazón de Huelva.']} className="display mt-5" />

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <motion.div
            className="relative min-h-[340px] overflow-hidden rounded-[14px] border border-nogal/15 bg-estraza-2 lg:col-span-7 lg:min-h-[520px]"
            initial={{ clipPath: 'inset(0 0 100% 0 round 14px)' }}
            whileInView={{ clipPath: 'inset(0 0 0% 0 round 14px)' }}
            viewport={VIEW}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
          >
            <iframe
              title="Mapa con la ubicación de La Alacena en Huelva"
              src={RESTAURANT.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full border-0 [filter:sepia(0.25)_saturate(0.85)]"
            />
          </motion.div>

          <motion.div
            className="flex flex-col rounded-[14px] bg-blanco p-7 md:p-9 lg:col-span-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          >
            <p className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[14px] font-semibold ${status.open ? 'bg-abierto/12 text-abierto' : 'bg-nogal/8 text-texto'}`}>
              <span className={`h-2 w-2 rounded-full ${status.open ? 'animate-pulse bg-abierto' : 'bg-apagado'}`} aria-hidden />
              {status.text}
            </p>
            <address className="mt-6 not-italic">
              <p className="flex gap-3 font-serif text-[22px] leading-snug text-nogal">
                <MapPin size={20} className="mt-1.5 shrink-0 text-almagra" aria-hidden />
                <span>
                  {RESTAURANT.street}
                  <br />
                  {RESTAURANT.postal} {RESTAURANT.city}
                </span>
              </p>
            </address>

            <h3 className="mt-8 flex items-center gap-2 font-sans text-[15px] font-semibold text-nogal">
              <Clock size={17} className="text-almagra" aria-hidden /> Horario
            </h3>
            <dl className="mt-3 text-[15px]">
              {HOURS.map((h) => {
                const today = h.day === status.day
                return (
                  <div
                    key={h.label}
                    className={`flex justify-between gap-4 rounded-[8px] px-3 py-2 ${today ? 'bg-estraza font-semibold text-nogal' : ''}`}
                  >
                    <dt>
                      {h.label}
                      {today && <span className="sr-only"> (hoy)</span>}
                    </dt>
                    <dd className="num m-0 text-right">{fmtSlots(h.slots)}</dd>
                  </div>
                )
              })}
            </dl>
            <p className="mt-5 flex items-center gap-2 text-[15px] text-apagado">
              <CreditCard size={17} aria-hidden /> {RESTAURANT.payments}
            </p>

            <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
              <Action href={RESTAURANT.directions} icon={Navigation} label="Cómo llegar" external />
              <Action href={RESTAURANT.phoneHref} icon={Phone} label="Llamar" />
              <Action href={waGeneric} icon={MessageCircle} label="WhatsApp" external />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Action({ href, icon: Icon, label, external }: { href: string; icon: typeof Phone; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-nogal/20 px-3 text-[15px] font-semibold text-nogal transition-colors duration-300 hover:border-almagra hover:text-almagra active:scale-[0.97]"
    >
      <Icon size={17} aria-hidden /> {label}
    </a>
  )
}
