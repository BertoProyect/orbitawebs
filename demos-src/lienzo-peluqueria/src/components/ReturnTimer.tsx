import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { findService } from "../data/services";
import { hex, useLock, wake } from "../hooks/useLock";
import { waLink } from "../lib/links";
import { useBooking } from "../state/booking";
import { shadeLabel, useHair } from "../state/hair";
import { EASE, Reveal, RevealLines, WhatsAppIcon } from "./ui";

const CM_PER_WEEK = 0.29; // el pelo crece algo más de 1 cm al mes
const LOCK_CM = 20;

function advice(w: number) {
  if (w <= 3)
    return {
      title: "Tu color todavía está reciente.",
      text: "La raíz apenas asoma. Con un champú sin sulfatos, el color te dura más.",
      recommend: false,
    };
  if (w <= 5)
    return {
      title: "Es un buen momento para revisar la raíz.",
      text: "Con luz de día ya empieza a notarse, sobre todo si tienes canas.",
      recommend: true,
    };
  if (w <= 8)
    return {
      title: "Puede que necesites un retoque.",
      text: "Hay más de un centímetro de raíz. El tinte nuevo se funde con el anterior y no queda escalón.",
      recommend: true,
    };
  return {
    title: "Tu color agradecerá una puesta a punto.",
    text: "La raíz ya se ve a distancia y las puntas empiezan a abrirse. Mejor retocar y sanear en la misma cita.",
    recommend: true,
  };
}

const fmtCm = (v: number) => `${v.toFixed(1).replace(".", ",").replace(/,0$/, "")} cm`;
const weeksText = (w: number) => (w === 1 ? "1 semana" : `${w} semanas`);

export function ReturnTimer() {
  const { shade, natural, grey } = useHair();
  const { book } = useBooking();
  const reduce = useReducedMotion();
  const [weeks, setWeeks] = useState(6);
  const [geo, setGeo] = useState({ oy: 0, len: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ weeks, shade, natural, grey });
  live.current = { weeks, shade, natural, grey };

  const apply = (L: any, kick = 0) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!L) return;
    const s = live.current;
    const px = ((s.weeks * CM_PER_WEEK) / LOCK_CM) * L.length;
    L.root = hex(s.shade.root);
    L.tip = hex(s.shade.tip);
    L.natural = hex(s.natural.hex);
    L.grey = s.grey.amount;
    L.regrowth = px;
    L.painted = 0;
    L.damage = Math.max(0, Math.min(1, (s.weeks - 5) / 7));
    L.gloss = 1 - Math.min(0.5, s.weeks / 24);
    if (kick && !reduce) L.kick(kick);
    wake(L);
  };

  const lockRef = useLock(canvas, stage, {
    x: 0.42,
    seed: 4242,
    root: shade.root,
    tip: shade.tip,
    onBuild: (L) => {
      apply(L);
      setGeo({ oy: L.oy, len: L.length });
    },
  });

  useEffect(() => {
    apply(lockRef.current, 0.8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeks]);
  useEffect(() => {
    apply(lockRef.current, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shade, natural, grey]);

  const cm = weeks * CM_PER_WEEK;
  const markerY = geo.oy + (geo.len * cm) / LOCK_CM;
  const a = advice(weeks);
  const root = findService("tinte-raiz")!;
  const note = `Hace ${weeksText(weeks)} de mi último color (${shadeLabel(shade)}).`;
  const consult = waLink(
    `Hola, ${note.charAt(0).toLowerCase() + note.slice(1)} ¿Me toca retoque de raíz?`,
  );
  const pct = ((weeks - 1) / 11) * 100;

  return (
    <section
      id="raiz"
      aria-labelledby="raiz-title"
      className="relative bg-bg-2 py-[clamp(96px,13vw,176px)]"
    >
      <div className="wrap grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-[clamp(48px,6vw,104px)]">
        <div className="contents lg:block">
          <div className="order-1">
            <RevealLines
              lines={["¿Cuándo te", "toca volver?"]}
              className="display h-lg"
              id="raiz-title"
            />
            <Reveal delay={0.1}>
              <p className="lead mt-5">El color también tiene su calendario.</p>
            </Reveal>
          </div>

          <Reveal className="order-3 lg:mt-12" delay={0.15}>
            <div className="flex items-end justify-between gap-6">
              <label htmlFor="semanas" className="max-w-[12rem] text-ink-2">
                Semanas desde tu último color
              </label>
              <output htmlFor="semanas" className="flex items-baseline gap-2" aria-live="polite">
                <span className="relative inline-block min-w-[2ch] overflow-hidden text-right text-[clamp(3.5rem,8vw,5.5rem)] font-extralight leading-[0.9] tracking-[-0.05em] text-gold-light tabular">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <m.span
                      key={weeks}
                      className="inline-block"
                      initial={reduce ? false : { y: "60%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={reduce ? undefined : { y: "-60%", opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      {weeks}
                    </m.span>
                  </AnimatePresence>
                </span>
                <span className="text-ink-2">{weeks === 1 ? "semana" : "semanas"}</span>
              </output>
            </div>
            <input
              id="semanas"
              type="range"
              min={1}
              max={12}
              step={1}
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              aria-valuetext={weeksText(weeks)}
              className="range mt-5"
              style={{ ["--p" as string]: `${pct}%` }}
            />
            <div
              className="mt-1 flex justify-between text-xs text-muted tabular"
              aria-hidden="true"
            >
              <span>1</span>
              <span>4</span>
              <span>8</span>
              <span>12</span>
            </div>
          </Reveal>

          <div className="order-4 min-h-[17rem] lg:mt-10" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={a.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h3 className="h-sm">{a.title}</h3>
                <p className="mt-3 max-w-[32rem] text-ink-2">{a.text}</p>
                {a.recommend ? (
                  <div className="mt-7 flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-card)] border border-gold/30 bg-[linear-gradient(135deg,rgb(217_197_154/0.1),rgb(217_197_154/0.02))] p-5 sm:p-6">
                    <div>
                      <p className="eyebrow">Te recomendamos</p>
                      <p className="mt-2 text-[1.25rem] font-light">Retoque de raíz</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-sm text-ink-2">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> 1 hora
                      </p>
                    </div>
                    <p className="text-[2rem] font-extralight tracking-[-0.03em] text-gold-light tabular">
                      {root.price} €
                    </p>
                  </div>
                ) : (
                  <p className="mt-7 text-sm text-muted">
                    Si tienes dudas, pregúntanos: te decimos si merece la pena esperar.
                  </p>
                )}
              </m.div>
            </AnimatePresence>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <a
                href={consult}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                <WhatsAppIcon />
                Consultar por WhatsApp
                <ArrowUpRight className="btn__arrow" />
              </a>
              {a.recommend && (
                <button
                  type="button"
                  className="link w-fit text-[0.95rem]"
                  onClick={() => book("tinte-raiz", note)}
                >
                  O pide cita desde aquí
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mechón con la raíz creciendo */}
        <Reveal className="order-2 lg:order-none" y={40}>
          <div
            ref={stage}
            className="relative mx-auto aspect-[4/5] max-h-[80svh] w-full max-w-[560px] overflow-hidden rounded-[var(--radius-media)] border border-line bg-[radial-gradient(70%_55%_at_45%_18%,#28241f_0%,#161412_55%,#0f0e0d_100%)]"
            style={{ touchAction: "pan-y" }}
          >
            <span
              aria-hidden="true"
              className="absolute left-[42%] top-[6%] h-[7px] w-[46%] -translate-x-1/2 -translate-y-[85%] rounded-full bg-gradient-to-b from-[#6f685e] via-[#3c3732] to-[#25211e] shadow-[0_6px_14px_rgb(0_0_0/0.5)]"
            />
            <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
            {geo.len > 0 && (
              <m.div
                aria-hidden="true"
                className="absolute left-[64%] right-5 top-0 flex items-center gap-3"
                initial={false}
                animate={{ y: markerY }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
              >
                <span className="h-px flex-1 border-t border-dashed border-gold/70" />
                <span className="whitespace-nowrap rounded-full border border-gold/40 bg-bg/70 px-2.5 py-1 text-xs text-gold-light backdrop-blur tabular">
                  {fmtCm(cm)} de raíz
                </span>
              </m.div>
            )}
            <p className="pointer-events-none absolute inset-x-5 bottom-5 text-xs text-muted">
              Simulación con tu tono ({shadeLabel(shade)}). El pelo crece algo más de un centímetro
              al mes.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
