import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { AlertCircle, CalendarCheck, Check, Loader2, Phone, PhoneCall, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BASE, CLINIC, MOTIVOS, type Motivo } from '../../data/clinic'
import { submitBooking } from '../../lib/booking-api'
import { EASE } from '../../lib/motion'
import { nextDays, times } from '../../lib/time'
import { useBooking } from '../../state/booking'
import { Magnetic } from '../ui/Magnetic'
import { FadeIn, WordReveal } from '../ui/WordReveal'

type Field = 'nombre' | 'telefono' | 'tipo' | 'dia' | 'hora' | 'privacidad'
type Status = 'idle' | 'loading' | 'sent' | 'unconfigured' | 'error'

const cleanPhone = (v: string) => v.replace(/[\s.\-()]/g, '').replace(/^(\+34|0034)/, '')
const phoneOk = (v: string) => /^[6789]\d{8}$/.test(cleanPhone(v))
const formatPhone = (v: string) => {
  const d = cleanPhone(v).replace(/\D/g, '').slice(0, 9)
  return d.replace(/^(\d{3})(\d{0,3})(\d{0,3}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))
}

const MESSAGES: Record<Field, string> = {
  nombre: 'Escribe tu nombre para saber por quién preguntar.',
  telefono: 'Necesitamos un teléfono español de 9 cifras.',
  tipo: 'Elige el tipo de cita.',
  dia: 'Elige el día que mejor te venga.',
  hora: 'Elige una hora.',
  privacidad: 'Para llamarte necesitamos que aceptes la política de privacidad.',
}

export function Booking() {
  const { prefill, clearNote } = useBooking()
  const reduce = useReducedMotion()
  const days = useMemo(() => nextDays(10), [])
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [tipo, setTipo] = useState<Motivo | null>(null)
  const [dia, setDia] = useState<string | null>(null)
  const [franja, setFranja] = useState(0)
  const [hora, setHora] = useState<string | null>(null)
  const [privacidad, setPrivacidad] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const card = useAnimationControls()
  const nameRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const day = days.find((d) => d.key === dia) ?? null
  const slots = day ? day.slots : days[0]?.slots ?? []
  const hours = day ? times(slots[Math.min(franja, slots.length - 1)]) : []

  const errors: Partial<Record<Field, string>> = {}
  if (nombre.trim().length < 2) errors.nombre = MESSAGES.nombre
  if (!phoneOk(telefono)) errors.telefono = MESSAGES.telefono
  if (!tipo) errors.tipo = MESSAGES.tipo
  if (!dia) errors.dia = MESSAGES.dia
  if (!hora) errors.hora = MESSAGES.hora
  if (!privacidad) errors.privacidad = MESSAGES.privacidad
  const show = (f: Field) => (touched[f] ? errors[f] : undefined)

  // Datos que llegan desde otra parte de la web (un tratamiento, un diente, la financiación).
  useEffect(() => {
    if (!prefill) return
    if (prefill.motivo) setTipo(prefill.motivo)
    if (status !== 'idle' && status !== 'error') setStatus('idle')
    if (!reduce) card.start({ boxShadow: ['0 0 0 0px rgba(26,91,214,0)', '0 0 0 6px rgba(26,91,214,0.22)', '0 0 0 0px rgba(26,91,214,0)'], transition: { duration: 1.6, delay: 0.6 } })
    const t = window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 900)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.stamp])

  const pickDay = (k: string) => {
    setDia(k)
    const d = days.find((x) => x.key === k)!
    if (franja >= d.slots.length) setFranja(0)
    setHora(null)
    setTouched((t) => ({ ...t, dia: true }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setTouched({ nombre: true, telefono: true, tipo: true, dia: true, hora: true, privacidad: true })
    const first = (['nombre', 'telefono', 'tipo', 'dia', 'hora', 'privacidad'] as Field[]).find((f) => errors[f])
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)
      el?.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true })
      // Tras medir los avisos de error (Framer Motion devuelve el scroll al medir alturas «auto»).
      window.setTimeout(() => el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }), 90)
      if (!reduce) card.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.45 } })
      return
    }
    setStatus('loading')
    const res = await submitBooking({
      nombre: nombre.trim(),
      telefono: cleanPhone(telefono),
      tipo: tipo!,
      dia: dia!,
      hora: hora!,
      nota: prefill?.nota,
      privacidad: true,
    })
    setStatus(res.status)
  }

  const reset = () => {
    setStatus('idle')
    setHora(null)
    setDia(null)
    setTouched({})
    window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 50)
  }

  const firstName = nombre.trim().split(/\s+/)[0]
  const whenText = day && hora ? `el ${day.weekday} ${day.date} a las ${hora}` : ''
  const done = status === 'sent' || status === 'unconfigured'

  return (
    <section id="cita" aria-labelledby="cita-title" className="porcelain section">
      <div className="wrap grid12 gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+48px)]">
            <p className="eyebrow">Pedir cita</p>
            <WordReveal id="cita-title" text="El primer paso hacia tu nueva sonrisa." className="h2 mt-5 max-w-[12ch]" />
            <FadeIn delay={0.2}>
              <p className="lead mt-6 max-w-[34ch]">Cuéntanos qué necesitas. Te llamamos para confirmar tu cita.</p>
              <ul className="mt-9 grid gap-4">
                {[
                  [CalendarCheck, 'Primera visita y diagnóstico gratis'],
                  [ShieldCheck, 'Presupuesto cerrado y por escrito'],
                  [PhoneCall, 'Te llamamos nosotros para confirmar'],
                ].map(([Icon, t]) => {
                  const I = Icon as typeof Check
                  return (
                    <li key={t as string} className="flex items-center gap-3.5 text-[16px] font-medium text-night">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-blue shadow-[0_1px_0_var(--soft-line)]">
                        <I size={18} aria-hidden />
                      </span>
                      {t as string}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-9 text-[15px] text-mist">
                ¿Prefieres hablar ya?{' '}
                <a href={CLINIC.tel} className="font-semibold text-blue underline-offset-4 hover:underline">
                  Llama al {CLINIC.phone}
                </a>
              </p>
            </FadeIn>
          </div>
        </div>

        <FadeIn className="col-span-12 lg:col-span-7" delay={0.1}>
          <motion.div animate={card} className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_40px_90px_-50px_rgba(11,27,51,0.35),0_1px_0_var(--soft-line)]">
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <Result key="done" status={status as 'sent' | 'unconfigured'} name={firstName} when={whenText} phone={formatPhone(telefono)} tipo={tipo!} onReset={reset} />
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  noValidate
                  onSubmit={submit}
                  className="p-6 sm:p-10"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  aria-describedby="cita-ayuda"
                >
                  <p id="cita-ayuda" className="sr-only">Todos los campos son obligatorios.</p>

                  <AnimatePresence initial={false}>
                    {prefill?.nota && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                        <div className="mb-6 flex items-center justify-between gap-3 rounded-[var(--r-input)] bg-ice px-4 py-3">
                          <p className="m-0 text-[14.5px] font-medium text-[#12428f]">
                            <span className="text-mist">Sobre: </span>
                            {prefill.nota}
                          </p>
                          <button type="button" onClick={clearNote} className="grid h-8 w-8 flex-none place-items-center rounded-full text-[#12428f] hover:bg-white/70" aria-label="Quitar esta nota">
                            <X size={16} aria-hidden />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Text field="nombre" label="Nombre completo" error={show('nombre')} ok={!errors.nombre}>
                      <input
                        ref={nameRef}
                        id="f-nombre"
                        className="field__input"
                        placeholder=" "
                        autoComplete="name"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                        aria-invalid={!!show('nombre')}
                        aria-describedby={show('nombre') ? 'e-nombre' : undefined}
                        required
                      />
                    </Text>
                    <Text field="telefono" label="Teléfono" error={show('telefono')} ok={!errors.telefono}>
                      <input
                        id="f-telefono"
                        className="field__input num"
                        placeholder=" "
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={11}
                        value={telefono}
                        onChange={(e) => setTelefono(formatPhone(e.target.value))}
                        onBlur={() => setTouched((t) => ({ ...t, telefono: true }))}
                        aria-invalid={!!show('telefono')}
                        aria-describedby={show('telefono') ? 'e-telefono' : undefined}
                        required
                      />
                    </Text>
                  </div>

                  <Group field="tipo" legend="Tipo de cita" error={show('tipo')}>
                    <div role="radiogroup" aria-labelledby="l-tipo" className="flex flex-wrap gap-2">
                      {MOTIVOS.map((m) => (
                        <Option key={m} on={tipo === m} group="tipo" onClick={() => (setTipo(m), setTouched((t) => ({ ...t, tipo: true })))}>
                          {m}
                        </Option>
                      ))}
                    </div>
                  </Group>

                  <Group field="dia" legend="Día preferido" error={show('dia')}>
                    <div role="radiogroup" aria-labelledby="l-dia" className="-mx-6 flex snap-x scroll-px-6 gap-2 overflow-x-auto px-6 pb-1 sm:scroll-px-10 [scrollbar-width:none] sm:-mx-10 sm:px-10 [&::-webkit-scrollbar]:hidden">
                      {days.map((d) => (
                        <Option key={d.key} on={dia === d.key} group="dia" onClick={() => pickDay(d.key)} className="!h-auto min-w-[76px] snap-start flex-col !rounded-[16px] !px-3 py-2.5">
                          <span className="text-[12px] font-medium capitalize opacity-70">{d.weekday}</span>
                          <span className="num text-[15px] font-semibold">{d.date}</span>
                        </Option>
                      ))}
                    </div>
                  </Group>

                  <Group field="hora" legend="Hora preferida" error={show('hora')}>
                    {!day ? (
                      <p className="m-0 rounded-[var(--r-input)] border border-dashed border-line px-4 py-3.5 text-[15px] text-mist">Elige primero un día y te enseñamos las horas libres de consulta.</p>
                    ) : (
                      <div>
                        {slots.length > 1 && (
                          <div role="tablist" aria-label="Franja" className="mb-3 inline-grid grid-cols-2 gap-1 rounded-full bg-porcelain p-1">
                            {['Mañana', 'Tarde'].map((l, i) => (
                              <button key={l} type="button" role="tab" aria-selected={franja === i} onClick={() => (setFranja(i), setHora(null))} className={`relative z-0 h-9 rounded-full px-5 text-[14px] font-medium transition-colors ${franja === i ? 'text-night' : 'text-mist'}`}>
                                {franja === i && <motion.span layoutId="franja" className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                                {l}
                              </button>
                            ))}
                          </div>
                        )}
                        <div role="radiogroup" aria-labelledby="l-hora" className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                          {hours.map((h) => (
                            <Option key={h} on={hora === h} group="hora" onClick={() => (setHora(h), setTouched((t) => ({ ...t, hora: true })))} className="num !px-0">
                              {h}
                            </Option>
                          ))}
                        </div>
                      </div>
                    )}
                  </Group>

                  <div data-field="privacidad" className="mt-8">
                    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-[1.45] text-slate">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={privacidad}
                        onChange={(e) => (setPrivacidad(e.target.checked), setTouched((t) => ({ ...t, privacidad: true })))}
                        aria-invalid={!!show('privacidad')}
                        aria-describedby={show('privacidad') ? 'e-privacidad' : undefined}
                        required
                      />
                      <span className="check mt-px" aria-hidden>
                        <Check size={14} strokeWidth={3} color="#fff" />
                      </span>
                      <span>
                        He leído y acepto la{' '}
                        <a href={`${BASE}/privacidad/`} className="font-medium text-blue underline underline-offset-2" target="_blank" rel="noopener">
                          política de privacidad
                        </a>
                        .
                      </span>
                    </label>
                    <ErrorText id="e-privacidad" text={show('privacidad')} />
                  </div>

                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="mt-6 flex items-start gap-2 rounded-[var(--r-input)] bg-[#fdecea] px-4 py-3 text-[15px] text-error">
                          <AlertCircle size={18} className="mt-0.5 flex-none" aria-hidden />
                          <span>
                            No hemos podido enviar tu solicitud. Vuelve a intentarlo o llámanos al{' '}
                            <a href={CLINIC.tel} className="font-semibold underline">
                              {CLINIC.phone}
                            </a>
                            .
                          </span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-9 flex flex-col-reverse items-stretch gap-4 border-t border-soft-line pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="m-0 text-[13.5px] leading-[1.45] text-mist sm:max-w-[30ch]">Solo usamos tus datos para llamarte y confirmar la cita.</p>
                    <Magnetic type="submit" className="btn w-full sm:w-auto" aria-disabled={status === 'loading'}>
                      <AnimatePresence mode="wait" initial={false}>
                        {status === 'loading' ? (
                          <motion.span key="l" className="inline-flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <Loader2 size={18} className="animate-spin" aria-hidden /> Enviando…
                          </motion.span>
                        ) : (
                          <motion.span key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            Solicitar mi cita
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Magnetic>
                  </div>
                  <p className="sr-only" aria-live="polite">
                    {status === 'loading' ? 'Enviando la solicitud' : ''}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  )
}

function Text({ field, label, error, ok, children }: { field: Field; label: string; error?: string; ok: boolean; children: ReactNode }) {
  return (
    <div data-field={field} className="field">
      {children}
      <label htmlFor={`f-${field}`} className="field__label">
        {label}
      </label>
      <AnimatePresence>
        {ok && (
          <motion.span className="pointer-events-none absolute right-4 top-[19px] grid h-[22px] w-[22px] place-items-center rounded-full bg-[#e3f4ea] text-[#16794a]" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} aria-hidden>
            <Check size={13} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      <ErrorText id={`e-${field}`} text={error} />
    </div>
  )
}

function Group({ field, legend, error, children }: { field: Field; legend: string; error?: string; children: ReactNode }) {
  return (
    <div data-field={field} className="mt-8">
      <p id={`l-${field}`} className="legend">
        {legend}
      </p>
      {children}
      <ErrorText id={`e-${field}`} text={error} />
    </div>
  )
}

function Option({ on, onClick, children, className = '', group }: { on: boolean; onClick: () => void; children: ReactNode; className?: string; group: string }) {
  const reduce = useReducedMotion()
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={`option ${className}`}>
      {on && <motion.span layoutId={`opt-${group}`} className="option__fill" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38 }} />}
      {children}
    </button>
  )
}

function ErrorText({ id, text }: { id: string; text?: string }) {
  return (
    <AnimatePresence initial={false}>
      {text && (
        <motion.p id={id} className="field__error overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
          <AlertCircle size={15} className="flex-none" aria-hidden /> {text}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/* Resultado. Si hay servidor, confirma la recepción (la cita aún no está cerrada: llamamos).
   Si no lo hay, no finge un envío: deja la solicitud preparada y pide la llamada. */
function Result({ status, name, when, phone, tipo, onReset }: { status: 'sent' | 'unconfigured'; name: string; when: string; phone: string; tipo: Motivo; onReset: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => ref.current?.focus({ preventScroll: true }), [])
  const sent = status === 'sent'
  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="p-6 outline-none sm:p-10"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <motion.span className={`grid h-14 w-14 place-items-center rounded-full ${sent ? 'bg-[#e3f4ea] text-[#16794a]' : 'bg-ice text-blue'}`} initial={reduce ? false : { scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 }} aria-hidden>
        {sent ? <Check size={26} strokeWidth={2.6} /> : <Phone size={24} />}
      </motion.span>
      <h3 className="mt-6 text-[clamp(1.75rem,3vw,2.375rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
        {sent ? `Solicitud recibida, ${name}.` : `Tu solicitud está lista, ${name}.`}
      </h3>
      <p className="lead mt-3 max-w-[42ch]">
        {sent
          ? `Te llamamos al ${phone} para confirmar tu cita. Hasta que hablemos, la cita no está cerrada.`
          : `Llámanos y la confirmamos al momento. Con estos datos lo dejamos cerrado en un minuto.`}
      </p>
      <dl className="mt-7 grid gap-px overflow-hidden rounded-[var(--r-card)] bg-soft-line sm:grid-cols-3">
        {[
          ['Tipo de cita', tipo],
          ['Cuándo te viene bien', when],
          ['Teléfono', phone],
        ].map(([k, v]) => (
          <div key={k} className="bg-porcelain px-5 py-4">
            <dt className="text-[12.5px] text-mist">{k}</dt>
            <dd className="num mt-1 text-[16px] font-semibold text-night first-letter:uppercase">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {!sent && (
          <Magnetic href={CLINIC.tel}>
            <Phone size={18} aria-hidden /> Llamar al {CLINIC.phone}
          </Magnetic>
        )}
        <button type="button" onClick={onReset} className={sent ? 'btn btn--ghost' : 'link-arrow justify-center sm:ml-2'}>
          {sent ? 'Pedir otra cita' : <span>Cambiar algún dato</span>}
        </button>
      </div>
    </motion.div>
  )
}
