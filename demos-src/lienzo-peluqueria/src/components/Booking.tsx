import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Info, PencilLine } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { BUSINESS } from "../data/business";
import { ADVICE_OPTION, CATEGORIES, findService, priceLabel } from "../data/services";
import { useMadridNow } from "../hooks/useNow";
import { waLink } from "../lib/links";
import { addDaysIso, checkDate, clock, isoDate, longDate, slotsFor } from "../lib/time";
import { useBooking } from "../state/booking";
import { EASE, Reveal, RevealLines, WhatsAppIcon } from "./ui";

const STEPS = ["Servicio", "Día y hora", "Tus datos", "Revisar"] as const;
const NOTE_MAX = 300;

export function Booking() {
  const now = useMadridNow();
  const reduce = useReducedMotion();
  const { request } = useBooking();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [autoNote, setAutoNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  const service = serviceId ? findService(serviceId) : undefined;
  const today = isoDate(now.y, now.m, now.d);
  const dateCheck = date ? checkDate(date, now) : null;
  const slots = useMemo(
    () => (date && dateCheck?.ok ? slotsFor(date, now) : { morning: [], afternoon: [] }),
    [date, dateCheck?.ok, now],
  );

  // Si la hora elegida deja de existir (otro día, o se pasó la hora de hoy), se borra
  useEffect(() => {
    if (time && ![...slots.morning, ...slots.afternoon].map(clock).includes(time)) setTime("");
  }, [slots, time]);

  // Peticiones desde la carta, la carta de colores o la raíz
  useEffect(() => {
    if (!request) return;
    setServiceId(request.serviceId);
    setSent(false);
    if (request.note !== undefined && (notes.trim() === "" || notes === autoNote)) {
      setNotes(request.note);
      setAutoNote(request.note);
    }
    setErrors({});
    setDir(1);
    setStep(1);
    const t = window.setTimeout(
      () => document.getElementById("cita-fecha")?.focus({ preventScroll: true }),
      900,
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.nonce]);

  // Al cambiar de paso, el foco va al título del paso (lectores de pantalla y teclado)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [step, sent]);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && !service)
      e.service = "Elige un servicio, o «Aún no lo sé» si prefieres que te aconsejemos.";
    if (s === 1) {
      const c = checkDate(date, now);
      if (!c.ok) e.date = c.message;
      else if (!time) e.time = "Elige la hora que prefieres.";
    }
    if (s === 2 && name.trim().replace(/\s+/g, " ").length < 2)
      e.name = "Escribe tu nombre para saber quién nos escribe.";
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      const target = {
        service: "cita-servicios",
        date: "cita-fecha",
        time: "cita-horas",
        name: "cita-nombre",
      }[firstKey];
      window.setTimeout(() => document.getElementById(target!)?.focus(), 30);
    }
    return !firstKey;
  };

  const go = (to: number) => {
    if (to > step && !validate(step)) return;
    setErrors({});
    setDir(to > step ? 1 : -1);
    setStep(to);
    if (card.current && card.current.getBoundingClientRect().top < 0) {
      card.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) go(step + 1);
  };

  const cleanName = name.trim().replace(/\s+/g, " ");
  const message = useMemo(() => {
    if (!service) return "";
    const lines = [
      `Hola, soy ${cleanName}. Me gustaría pedir cita en ${BUSINESS.name}.`,
      "",
      `- Servicio: ${service.name}${service.price >= 0 ? ` (${priceLabel(service).toLowerCase()})` : ""}`,
      `- Día: ${longDate(date)}`,
      `- Hora: ${time}`,
    ];
    if (notes.trim()) lines.push(`- Notas: ${notes.trim().replace(/\s+/g, " ")}`);
    lines.push("", "¿Me confirmáis si hay hueco? Gracias.");
    return lines.join("\n");
  }, [service, cleanName, date, time, notes]);
  const href = message ? waLink(message) : waLink();

  const reset = () => {
    setServiceId("");
    setDate("");
    setTime("");
    setName("");
    setNotes("");
    setAutoNote("");
    setErrors({});
    setSent(false);
    setDir(-1);
    setStep(0);
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -28 }),
  };

  return (
    <section
      id="reserva"
      aria-labelledby="reserva-title"
      className="relative overflow-hidden bg-bg py-[clamp(96px,13vw,176px)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[20%] top-[10%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,rgb(217_197_154/0.08),transparent_65%)]"
      />
      <div className="wrap relative grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        <div>
          <RevealLines
            lines={["Tu próxima cita", "empieza aquí."]}
            className="display h-lg"
            id="reserva-title"
          />
          <Reveal delay={0.1}>
            <p className="lead mt-6 max-w-[30rem]">
              Elige servicio, día y hora. Se abrirá WhatsApp con tu mensaje listo para enviar.
            </p>
            <p className="mt-8 flex max-w-[30rem] gap-3 rounded-[var(--radius-card)] border border-line bg-bg-2/60 p-5 text-[0.95rem] text-ink-2">
              <Info
                className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                aria-hidden="true"
                strokeWidth={1.5}
              />
              <span>
                Es una <strong className="font-medium text-ink">solicitud de cita</strong>, no una
                reserva cerrada. Te confirmamos por WhatsApp si hay hueco a esa hora.
              </span>
            </p>
            <p className="mt-8 text-sm text-muted">
              ¿Prefieres llamar?{" "}
              <a href={BUSINESS.phoneHref} className="link text-ink">
                {BUSINESS.phoneDisplay}
              </a>
            </p>
          </Reveal>
        </div>

        <Reveal y={40}>
          <div
            ref={card}
            className="scroll-mt-[calc(var(--nav-h)+16px)] rounded-[calc(var(--radius-card)+4px)] border border-line bg-bg-2/85 p-5 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)] backdrop-blur sm:p-8 lg:p-10"
          >
            {/* Progreso */}
            {!sent && (
              <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Pasos de la reserva">
                {STEPS.map((label, i) => (
                  <li key={label} aria-current={i === step ? "step" : undefined}>
                    <button
                      type="button"
                      disabled={i > step}
                      onClick={() => i < step && go(i)}
                      className="group w-full text-left disabled:cursor-default"
                      aria-label={`${i + 1}. ${label}${i < step ? " (editar)" : ""}`}
                    >
                      <span className="block h-[2px] overflow-hidden rounded-full bg-line">
                        <m.span
                          className="block h-full origin-left bg-gold"
                          initial={false}
                          animate={{ scaleX: i <= step ? 1 : 0 }}
                          transition={{ duration: 0.6, ease: EASE }}
                        />
                      </span>
                      <span
                        className={`mt-2.5 hidden text-xs transition-colors sm:block ${
                          i === step
                            ? "text-ink"
                            : i < step
                              ? "text-ink-2 group-hover:text-gold-light"
                              : "text-muted"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}

            <form onSubmit={onSubmit} noValidate>
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                {sent ? (
                  <m.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="py-6 text-center"
                  >
                    <m.span
                      className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-bg"
                      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    >
                      <Check className="h-7 w-7" />
                    </m.span>
                    <h3 ref={heading} tabIndex={-1} className="h-sm mt-6 outline-none">
                      Tu mensaje está listo en WhatsApp
                    </h3>
                    <p className="mx-auto mt-3 max-w-[26rem] text-ink-2">
                      Solo falta pulsar enviar. Te confirmamos la cita en el mismo chat en cuanto
                      veamos el hueco.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary"
                      >
                        <WhatsAppIcon /> Abrir WhatsApp otra vez
                      </a>
                      <button type="button" className="btn btn--ghost" onClick={reset}>
                        Pedir otra cita
                      </button>
                    </div>
                  </m.div>
                ) : (
                  <m.div
                    key={step}
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {step === 0 && (
                      <fieldset>
                        <legend className="contents">
                          <h3 ref={heading} tabIndex={-1} className="h-sm outline-none">
                            ¿Qué te quieres hacer?
                          </h3>
                        </legend>
                        <div
                          id="cita-servicios"
                          tabIndex={-1}
                          className="no-scrollbar mt-6 max-h-[440px] overflow-y-auto overscroll-contain rounded-[var(--radius-input)] pr-1 outline-none"
                          aria-describedby={errors.service ? "err-service" : undefined}
                        >
                          {[
                            ...CATEGORIES.map((c) => ({ label: c.label, items: c.services })),
                            { label: "Otros", items: [ADVICE_OPTION] },
                          ].map((g) => (
                            <div key={g.label} className="mb-5">
                              <p className="mb-2 text-xs tracking-[0.12em] text-muted uppercase">
                                {g.label}
                              </p>
                              <div className="grid gap-2">
                                {g.items.map((s) => {
                                  const on = serviceId === s.id;
                                  return (
                                    <label
                                      key={s.id}
                                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-input)] border px-4 py-3.5 transition-colors duration-300 ${
                                        on
                                          ? "border-gold bg-gold/10"
                                          : "border-line hover:border-line-strong"
                                      } has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold`}
                                    >
                                      <input
                                        type="radio"
                                        name="servicio"
                                        value={s.id}
                                        checked={on}
                                        onChange={() => {
                                          setServiceId(s.id);
                                          setErrors({});
                                        }}
                                        className="sr-only"
                                      />
                                      <span className="flex items-center gap-3">
                                        <span
                                          aria-hidden="true"
                                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                                            on
                                              ? "border-gold bg-gold text-bg"
                                              : "border-line-strong"
                                          }`}
                                        >
                                          {on && <Check className="h-3 w-3" strokeWidth={3} />}
                                        </span>
                                        <span>
                                          <span className="block text-[0.98rem] text-ink">
                                            {s.name}
                                          </span>
                                          <span className="block text-xs text-muted">
                                            {s.duration}
                                          </span>
                                        </span>
                                      </span>
                                      {s.price >= 0 && (
                                        <span
                                          className={`shrink-0 text-sm tabular ${s.price === 0 ? "text-success" : "text-gold-light"}`}
                                        >
                                          {priceLabel(s)}
                                        </span>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <ErrorText id="err-service" text={errors.service} />
                      </fieldset>
                    )}

                    {step === 1 && (
                      <div>
                        <h3 ref={heading} tabIndex={-1} className="h-sm outline-none">
                          ¿Qué día y a qué hora?
                        </h3>
                        {service && <p className="mt-2 text-sm text-muted">{service.name}</p>}
                        <div className="mt-6">
                          <label htmlFor="cita-fecha" className="field-label">
                            Día
                          </label>
                          <input
                            id="cita-fecha"
                            type="date"
                            className="input"
                            min={today}
                            max={addDaysIso(now, 90)}
                            value={date}
                            onChange={(e) => {
                              setDate(e.target.value);
                              setErrors({});
                            }}
                            aria-invalid={
                              errors.date || (dateCheck && !dateCheck.ok) ? "true" : undefined
                            }
                            aria-describedby="hint-fecha err-date"
                          />
                          <p id="hint-fecha" className="mt-2 text-xs text-muted">
                            Abrimos de martes a sábado.
                          </p>
                          <ErrorText
                            id="err-date"
                            text={
                              errors.date ||
                              (dateCheck && !dateCheck.ok ? dateCheck.message : undefined)
                            }
                          />
                        </div>

                        <fieldset className="mt-7" disabled={!dateCheck?.ok}>
                          <legend className="field-label">Hora</legend>
                          {!dateCheck?.ok ? (
                            <p className="rounded-[var(--radius-input)] border border-dashed border-line px-4 py-5 text-sm text-muted">
                              Elige primero el día y te enseñamos las horas.
                            </p>
                          ) : (
                            <div
                              id="cita-horas"
                              tabIndex={-1}
                              className="grid gap-5 outline-none"
                              aria-describedby={errors.time ? "err-time" : undefined}
                            >
                              {(
                                [
                                  ["Por la mañana", slots.morning],
                                  ["Por la tarde", slots.afternoon],
                                ] as const
                              ).map(([label, list]) =>
                                list.length ? (
                                  <div key={label}>
                                    <p className="mb-2 text-xs text-muted">{label}</p>
                                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                                      {list.map((t) => {
                                        const v = clock(t);
                                        return (
                                          <label key={v} className="chip px-0 tabular">
                                            <input
                                              type="radio"
                                              name="hora"
                                              value={v}
                                              checked={time === v}
                                              onChange={() => {
                                                setTime(v);
                                                setErrors({});
                                              }}
                                            />
                                            {v}
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : null,
                              )}
                            </div>
                          )}
                          <ErrorText id="err-time" text={errors.time} />
                        </fieldset>
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <h3 ref={heading} tabIndex={-1} className="h-sm outline-none">
                          ¿Cómo te llamas?
                        </h3>
                        <div className="mt-6">
                          <label htmlFor="cita-nombre" className="field-label">
                            Tu nombre
                          </label>
                          <input
                            id="cita-nombre"
                            className="input"
                            type="text"
                            autoComplete="given-name"
                            maxLength={60}
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (errors.name) setErrors({});
                            }}
                            aria-invalid={errors.name ? "true" : undefined}
                            aria-describedby={errors.name ? "err-name" : undefined}
                            required
                          />
                          <ErrorText id="err-name" text={errors.name} />
                        </div>
                        <div className="mt-6">
                          <label htmlFor="cita-notas" className="field-label">
                            ¿Algo que debamos saber? <span className="text-muted">(opcional)</span>
                          </label>
                          <textarea
                            id="cita-notas"
                            className="input"
                            rows={3}
                            maxLength={NOTE_MAX}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Por ejemplo: tengo el pelo muy largo, o vengo con mi hijo."
                            aria-describedby="cita-notas-count"
                          />
                          <p
                            id="cita-notas-count"
                            className="mt-1.5 text-right text-xs text-muted tabular"
                          >
                            {notes.length}/{NOTE_MAX}
                          </p>
                        </div>
                      </div>
                    )}

                    {step === 3 && service && (
                      <div>
                        <h3 ref={heading} tabIndex={-1} className="h-sm outline-none">
                          Revisa tu solicitud
                        </h3>
                        <dl className="mt-6 divide-y divide-line rounded-[var(--radius-input)] border border-line">
                          {[
                            {
                              k: "Servicio",
                              v: service.name,
                              extra: `${service.duration} · ${priceLabel(service)}`,
                              to: 0,
                            },
                            { k: "Día", v: longDate(date), to: 1 },
                            { k: "Hora", v: time, to: 1 },
                            { k: "Nombre", v: cleanName, to: 2 },
                            ...(notes.trim() ? [{ k: "Notas", v: notes.trim(), to: 2 }] : []),
                          ].map((row) => (
                            <div
                              key={row.k}
                              className="flex items-start justify-between gap-4 px-4 py-3.5"
                            >
                              <div className="min-w-0">
                                <dt className="text-xs text-muted">{row.k}</dt>
                                <dd className="mt-0.5 break-words text-ink first-letter:uppercase">
                                  {row.v}
                                </dd>
                                {"extra" in row && row.extra && (
                                  <dd className="text-sm text-gold-light">{row.extra}</dd>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => go(row.to)}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted transition-colors hover:text-gold-light"
                                aria-label={`Cambiar ${row.k.toLowerCase()}`}
                              >
                                <PencilLine className="h-3.5 w-3.5" aria-hidden="true" /> Cambiar
                              </button>
                            </div>
                          ))}
                        </dl>
                        <p className="mt-5 flex gap-2.5 text-sm text-muted">
                          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          Al continuar se abre WhatsApp con este mensaje. La cita queda confirmada
                          cuando te respondamos.
                        </p>
                      </div>
                    )}
                  </m.div>
                )}
              </AnimatePresence>

              {!sent && (
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {step > 0 ? (
                    <button type="button" className="btn btn--ghost" onClick={() => go(step - 1)}>
                      <ArrowLeft /> Atrás
                    </button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  {step < 3 ? (
                    <button type="submit" className="btn btn--primary">
                      Continuar <ArrowRight className="btn__arrow" />
                    </button>
                  ) : (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--primary"
                      onClick={() => window.setTimeout(() => setSent(true), 300)}
                    >
                      <WhatsAppIcon /> Continuar por WhatsApp
                    </a>
                  )}
                </div>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ErrorText({ id, text }: { id: string; text?: string }) {
  return (
    <AnimatePresence initial={false}>
      {text && (
        <m.p
          id={id}
          role="alert"
          className="mt-2.5 text-sm text-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {text}
        </m.p>
      )}
    </AnimatePresence>
  );
}
