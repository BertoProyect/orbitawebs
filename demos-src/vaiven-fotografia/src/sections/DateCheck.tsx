import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Calendar, fromIso, human, iso, MONTHS } from '../components/Calendar'
import { Lines, Reveal } from '../components/ui'
import { dayState, nearestSaturdays, weddingAvailability, type DayState } from '../data/availability'
import { WHATSAPP } from '../data/site'
import { EASE } from '../lib/motion'

/* ¿Tenéis ya una fecha? · calendario + respuesta inmediata.
 * La respuesta sale de data/availability.ts y de nada más: mientras la agenda esté cerrada,
 * cualquier día lleva al aviso de «agenda todavía no abierta». */

const COPY: Record<DayState, { badge: string; dot: string; text: string; cta: string }> = {
  available: {
    badge: 'Disponible',
    dot: 'bg-success',
    text: '¡Qué buena noticia! Esta fecha aparece disponible.',
    cta: 'Reservar esta fecha por WhatsApp',
  },
  occupied: {
    badge: 'Reservada',
    dot: 'bg-error',
    text: 'Esta fecha ya está reservada, pero podemos buscar otra opción.',
    cta: 'Consultar otra fecha',
  },
  closed: {
    badge: 'Agenda aún no abierta',
    dot: 'border border-muted',
    text: 'La agenda para esta temporada todavía no está abierta. Escríbeme y te avisaré cuando pueda confirmar disponibilidad.',
    cta: 'Consultar por WhatsApp',
  },
  unconfirmed: {
    badge: 'Sin confirmar',
    dot: 'border border-muted',
    text: 'La agenda para esta temporada todavía no está abierta. Escríbeme y te avisaré cuando pueda confirmar disponibilidad.',
    cta: 'Consultar por WhatsApp',
  },
}

export function DateCheck() {
  const today = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }, [])
  const [date, setDate] = useState<string | null>(null)

  /* Estado inicial: si la agenda está cerrada se avisa desde el principio; si está abierta, se invita a elegir. */
  const state: DayState | null = date ? dayState(date) : weddingAvailability.status === 'closed' ? 'closed' : null
  const alts = date && state === 'occupied' ? nearestSaturdays(date, iso(today)) : []

  return (
    <section id="fecha" aria-labelledby="date-title" className="relative scroll-mt-16 bg-surface py-24 md:py-36">
      <div className="wrap grid grid-cols-12 gap-x-5 gap-y-12 md:gap-x-8">
        <header className="col-span-12 lg:col-span-5">
          <Lines id="date-title" lines={['¿Tenéis ya', 'una fecha?']} className="display" />
          <Reveal delay={0.15}>
            <p className="lead mt-8 max-w-[34ch]">Comprobad si vuestra fecha está disponible y empecemos a imaginar vuestra historia.</p>
          </Reveal>
        </header>

        <Reveal className="col-span-12 lg:col-span-7 lg:col-start-6">
          <div className="grid overflow-hidden rounded-[12px] border border-border bg-white md:grid-cols-[1.15fr_1fr]">
            <div className="p-4 xs:p-5 md:border-r md:border-border md:p-7">
              <Calendar value={date} onChange={setDate} today={today} />
            </div>

            <div className="flex flex-col border-t border-border p-5 md:border-t-0 md:p-7" aria-live="polite" aria-atomic="true">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${date}-${state}`}
                  className="flex flex-1 flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {date && <p className="text-[13px] text-muted first-letter:uppercase">{human(fromIso(date))}</p>}
                  {state ? (
                    <>
                      <p className={`inline-flex items-center gap-2 text-[13px] font-medium ${date ? 'mt-3' : ''}`}>
                        <span aria-hidden className={`h-2 w-2 rounded-full ${COPY[state].dot}`} />
                        {COPY[state].badge}
                      </p>
                      <p className="mt-4 text-[19px] font-medium leading-[1.35] tracking-[-0.02em]">{COPY[state].text}</p>

                      {alts.length > 0 && (
                        <div className="mt-6">
                          <p className="text-[13px] text-muted">Sábados disponibles más cercanos:</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {alts.map((a) => {
                              const d = fromIso(a)
                              return (
                                <button
                                  key={a}
                                  type="button"
                                  onClick={() => setDate(a)}
                                  className="min-h-10 rounded-[8px] border border-border-strong px-3.5 text-[14px] transition-colors hover:border-fg"
                                >
                                  Sábado {d.getDate()} de {MONTHS[d.getMonth()]}
                                  {d.getFullYear() !== fromIso(date!).getFullYear() ? ` de ${d.getFullYear()}` : ''}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-auto pt-8">
                        <a href={WHATSAPP} target="_blank" rel="noopener" className="btn group w-full bg-primary !whitespace-normal text-center text-white hover:bg-primary-hover">
                          <MessageCircle aria-hidden size={17} strokeWidth={1.75} className="shrink-0" />
                          <span>{COPY[state].cta}</span>
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-[19px] font-medium leading-[1.35] tracking-[-0.02em]">Elegid un día en el calendario y os digo al momento si está libre.</p>
                  )}
                </motion.div>
              </AnimatePresence>
              <p className="mt-5 text-[12px] text-muted">La disponibilidad se confirma personalmente con Irene.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
