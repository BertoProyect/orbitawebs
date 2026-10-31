import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, MessageCircle, Users } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Lines, Reveal } from '../components/ui'
import { RESTAURANT } from '../data/restaurant'
import { bookingTimes, isClosedDay, madridNow } from '../lib/hours'
import { EASE, VIEW } from '../lib/motion'
import { bookingMessage, waLink, type Booking as B } from '../lib/whatsapp'

const GUESTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Más de 10']

function todayIso() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

const input =
  'mt-2 block w-full min-h-12 rounded-[10px] border bg-blanco px-4 text-[16px] text-nogal outline-none transition-[border-color,box-shadow] duration-300 focus:border-almagra focus:shadow-[0_0_0_3px_rgba(161,61,38,0.18)]'

export function Booking() {
  const [f, setF] = useState<B>({ name: '', guests: '2', date: '', time: '', type: 'mesa', notes: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof B, string>>>({})
  const [sent, setSent] = useState<string | null>(null)
  const set = <K extends keyof B>(k: K, v: B[K]) => {
    setF((p) => ({ ...p, [k]: v, ...(k === 'date' ? { time: '' } : {}) }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const big = f.guests === 'Más de 10'
  const times = useMemo(() => {
    const all = bookingTimes(f.date)
    if (f.date !== todayIso()) return all
    const now = madridNow().minutes + 30 // hoy, solo horas con margen
    return all.filter((t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) >= now)
  }, [f.date])
  const closed = isClosedDay(f.date)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err: typeof errors = {}
    if (!f.name.trim()) err.name = 'Escribe tu nombre para que sepamos a quién guardar la mesa.'
    if (!f.date) err.date = 'Elige el día.'
    else if (f.date < todayIso()) err.date = 'Ese día ya ha pasado. Elige otro.'
    else if (closed) err.date = 'Ese día cerramos (los lunes no abrimos). Elige otro.'
    else if (!times.length) err.date = 'Hoy ya no quedan horas para reservar. Elige otro día.'
    if (!err.date && !f.time) err.time = 'Elige la hora.'
    setErrors(err)
    if (Object.keys(err).length) {
      document.getElementById(`res-${Object.keys(err)[0]}`)?.focus()
      return
    }
    const url = waLink(bookingMessage({ ...f, type: big ? 'grupo' : f.type }))
    window.open(url, '_blank', 'noopener')
    setSent(url)
  }

  return (
    <section id="reserva" aria-labelledby="reserva-title" className="on-dark relative bg-verde py-24 text-tiza md:py-36">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="eyebrow">Reservas</span>
          </Reveal>
          <Lines id="reserva-title" lines={['Reserva tu mesa', 'en un minuto.']} className="display mt-5 text-cal" />
          <Reveal delay={0.15} as="p" className="lead mt-6 text-tiza/85">
            Rellena los datos y se abrirá WhatsApp con el mensaje ya escrito. Solo tienes que enviarlo.
          </Reveal>
          <Reveal delay={0.25} className="mt-8 flex gap-3 rounded-[12px] border border-tiza/20 p-5 text-[15px] leading-relaxed text-tiza/90">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-ocre" aria-hidden />
            <p>
              Es una <strong className="text-cal">solicitud de reserva</strong>, no una reserva confirmada. Te contestamos por WhatsApp para
              confirmar que hay mesa. Si tienes prisa, llámanos al{' '}
              <a href={RESTAURANT.phoneHref} className="font-semibold text-cal underline underline-offset-4">
                {RESTAURANT.phoneDisplay}
              </a>
              .
            </p>
          </Reveal>
        </div>

        <motion.div
          className="rounded-[14px] bg-cal p-6 text-texto md:p-10 lg:col-span-7"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 1, ease: EASE }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="py-6 text-center"
                role="status"
              >
                <CheckCircle2 size={44} className="mx-auto text-abierto" aria-hidden />
                <h3 className="mt-5 text-[28px]">Ya casi está, {f.name.trim().split(' ')[0]}.</h3>
                <p className="mx-auto mt-3 max-w-md">
                  Te hemos abierto WhatsApp con tu solicitud. Envíala y te confirmamos la mesa en cuanto la veamos.
                </p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <a
                    href={sent}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-almagra px-6 font-semibold text-cal hover:bg-almagra-2"
                  >
                    <MessageCircle size={18} aria-hidden /> Abrir WhatsApp otra vez
                  </a>
                  <button
                    type="button"
                    onClick={() => setSent(null)}
                    className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-nogal/25 px-6 font-semibold text-nogal hover:border-nogal"
                  >
                    Cambiar los datos
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="res-guests" label="Personas">
                    <select id="res-guests" className={`${input} border-nogal/20`} value={f.guests} onChange={(e) => set('guests', e.target.value)}>
                      {GUESTS.map((g) => (
                        <option key={g} value={g}>
                          {g === 'Más de 10' ? g : `${g} ${g === '1' ? 'persona' : 'personas'}`}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="res-name" label="Nombre" error={errors.name}>
                    <input
                      id="res-name"
                      autoComplete="name"
                      className={`${input} ${errors.name ? 'border-error' : 'border-nogal/20'}`}
                      value={f.name}
                      onChange={(e) => set('name', e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'res-name-err' : undefined}
                    />
                  </Field>
                  <Field id="res-date" label="Día" error={errors.date}>
                    <input
                      id="res-date"
                      type="date"
                      min={todayIso()}
                      className={`${input} ${errors.date ? 'border-error' : 'border-nogal/20'}`}
                      value={f.date}
                      onChange={(e) => set('date', e.target.value)}
                      aria-invalid={!!errors.date}
                      aria-describedby={errors.date ? 'res-date-err' : undefined}
                    />
                  </Field>
                  <Field id="res-time" label="Hora" error={errors.time}>
                    <select
                      id="res-time"
                      disabled={!f.date || closed || !times.length}
                      className={`${input} disabled:opacity-55 ${errors.time ? 'border-error' : 'border-nogal/20'}`}
                      value={f.time}
                      onChange={(e) => set('time', e.target.value)}
                      aria-invalid={!!errors.time}
                      aria-describedby={errors.time ? 'res-time-err' : undefined}
                    >
                      <option value="">{!f.date ? 'Elige antes el día' : closed ? 'Ese día cerramos' : !times.length ? 'Sin horas libres hoy' : 'Elige una hora'}</option>
                      {times.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <AnimatePresence initial={false}>
                  {big && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="mt-5 flex gap-3 rounded-[10px] bg-estraza p-4 text-[15px] leading-relaxed">
                        <Users size={19} className="mt-0.5 shrink-0 text-almagra" aria-hidden />
                        Para más de 10 personas os preparamos el salón de abajo (hasta 30) con uno de nuestros menús de grupo. Indica en las notas
                        cuántos seréis y lo cerramos por WhatsApp.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <fieldset className="mt-6 border-0 p-0">
                  <legend className="text-[15px] font-semibold text-nogal">Tipo de reserva (opcional)</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(['mesa', 'grupo'] as const).map((t) => {
                      const on = (big ? 'grupo' : f.type) === t
                      return (
                        <label
                          key={t}
                          className={`relative flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border text-[15px] font-semibold transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-almagra ${
                            on ? 'border-nogal bg-nogal text-cal' : 'border-nogal/20 text-texto hover:border-nogal/50'
                          }`}
                        >
                          <input type="radio" name="tipo" className="sr-only" checked={on} onChange={() => set('type', t)} />
                          {t === 'mesa' ? 'Mesa normal' : 'Menú de grupo'}
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                <Field id="res-notes" label="Notas (opcional)" className="mt-5">
                  <textarea
                    id="res-notes"
                    rows={3}
                    placeholder="Una trona, alguna alergia, terraza…"
                    className={`${input} resize-y border-nogal/20 py-3`}
                    value={f.notes}
                    onChange={(e) => set('notes', e.target.value)}
                  />
                </Field>

                <button
                  type="submit"
                  className="group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[10px] bg-almagra px-6 text-[17px] font-semibold text-cal transition-colors hover:bg-almagra-2 active:scale-[0.98]"
                >
                  <MessageCircle size={20} aria-hidden className="transition-transform duration-300 group-hover:-rotate-6" />
                  Enviar solicitud por WhatsApp
                </button>
                <p className="mt-3 text-center text-[14px] text-apagado">El restaurante confirmará la disponibilidad por WhatsApp.</p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

function Field({ id, label, error, children, className = '' }: { id: string; label: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-[15px] font-semibold text-nogal">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-err`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-[14px] font-medium text-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
