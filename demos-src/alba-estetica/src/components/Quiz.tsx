import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { QUIZ } from "../data/content";
import { getTreatment } from "../data/treatments";
import { eur, mins } from "../lib/format";
import { waLink } from "../lib/links";
import { quizMessage, recommend, type Answers } from "../lib/quiz";
import { AddButton } from "./AddButton";
import { EASE, Reveal, RevealLines } from "./ui";

const LABELS: Record<string, string> = Object.fromEntries(
  QUIZ.flatMap((q) => q.options.map((o) => [o.id, o.label])),
);

export function Quiz() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const done = step >= QUIZ.length;
  const progress = Math.min(step, QUIZ.length) / QUIZ.length;

  const focusBox = () => requestAnimationFrame(() => box.current?.focus({ preventScroll: true }));

  const choose = (qid: string, oid: string) => {
    setAnswers((a) => ({ ...a, [qid]: oid }));
    setDir(1);
    window.setTimeout(() => {
      setStep((s) => s + 1);
      focusBox();
    }, reduce ? 0 : 260);
  };
  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
    focusBox();
  };
  const restart = () => {
    setDir(-1);
    setAnswers({});
    setStep(0);
    focusBox();
  };

  const rec = done ? recommend(answers as Answers) : null;
  const slide = {
    initial: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -40 }),
  };

  return (
    <section id="test" aria-labelledby="test-title" className="bg-plum-soft/60 py-[clamp(88px,12vw,160px)]">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal as="p" className="eyebrow mb-5 text-plum" y={12}>
            Diagnóstico de piel gratis
          </Reveal>
          <RevealLines
            id="test-title"
            label="Vamos a conocer tu piel."
            className="display t-h2"
            lines={[
              "Vamos a",
              <>
                conocer <em>tu piel.</em>
              </>,
            ]}
          />
          <Reveal as="p" delay={0.15} className="t-lead mt-6 text-muted">
            Un pequeño test para orientarte antes de tu primera visita.
          </Reveal>

          {/* Progreso */}
          <div className="mt-10 max-w-xs" aria-hidden="true">
            <div className="flex justify-between text-[0.8125rem] text-muted tabular-nums">
              <span>{done ? "Tu orientación" : `Pregunta ${step + 1} de ${QUIZ.length}`}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="mt-3 flex gap-1.5">
              {QUIZ.map((q, i) => (
                <div key={q.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-plum/15">
                  <m.div
                    className="h-full origin-left bg-plum"
                    initial={false}
                    animate={{ scaleX: i < step ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={box}
          tabIndex={-1}
          className="relative rounded-[var(--radius-lg)] bg-surface p-6 outline-none sm:p-10 lg:col-span-8"
          aria-live="polite"
        >
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {!done ? (
              <m.fieldset
                key={QUIZ[step].id}
                custom={dir}
                variants={slide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
              >
                <legend className="display t-h3 mb-7 max-w-[24ch]">{QUIZ[step].title}</legend>
                <div role="radiogroup" aria-label={QUIZ[step].title} className="grid gap-2.5 sm:grid-cols-2">
                  {QUIZ[step].options.map((o, i) => {
                    const sel = answers[QUIZ[step].id as keyof Answers] === o.id;
                    return (
                      <m.button
                        key={o.id}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        onClick={() => choose(QUIZ[step].id, o.id)}
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.05 * i }}
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                        className={`group flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-5 py-3 text-left text-[0.9375rem] transition-colors duration-300 ${
                          sel ? "border-plum bg-plum-soft text-plum" : "border-line hover:border-plum/60 hover:bg-plum-soft/50"
                        }`}
                      >
                        {o.label}
                        <span
                          aria-hidden="true"
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                            sel ? "border-plum bg-plum" : "border-line-strong group-hover:border-plum"
                          }`}
                        >
                          {sel && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                      </m.button>
                    );
                  })}
                </div>
                {step > 0 && (
                  <button type="button" onClick={back} className="mt-7 inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-medium text-muted hover:text-ink">
                    <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" /> Anterior
                  </button>
                )}
              </m.fieldset>
            ) : (
              rec && (
                <m.div
                  key="result"
                  custom={dir}
                  variants={slide}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="eyebrow text-plum">Tu orientación</p>
                  <p className="t-lead mt-4 max-w-[52ch] text-ink-2">{rec.intro}</p>
                  <ul className="mt-6 grid gap-3">
                    {rec.ids.map((id, i) => {
                      const t = getTreatment(id);
                      if (!t) return null;
                      return (
                        <m.li
                          key={id}
                          initial={reduce ? false : { opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: EASE, delay: 0.15 + i * 0.1 }}
                          className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--radius-md)] border border-line p-5"
                        >
                          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                            <h3 className="font-serif text-[1.375rem] leading-tight">{t.name}</h3>
                            <p className="mt-1 text-[0.875rem] text-muted">{t.desc}</p>
                          </div>
                          {t.mins !== null && (
                            <span className="flex items-center gap-1.5 text-[0.8125rem] text-muted">
                              <Clock size={13} strokeWidth={1.8} aria-hidden="true" /> {mins(t.mins)}
                            </span>
                          )}
                          <span className="font-serif text-[1.375rem] text-plum">{eur(t.price)}</span>
                          <AddButton id={t.id} />
                        </m.li>
                      );
                    })}
                  </ul>
                  {rec.timeNote && <p className="mt-4 text-[0.875rem] text-muted">{rec.timeNote}</p>}
                  <p className="mt-6 rounded-[var(--radius-sm)] bg-plum-soft/70 p-4 text-[0.875rem] leading-relaxed text-ink-2">
                    Este test no es un diagnóstico. La recomendación final te la hará Alba después de valorar tu piel en persona,
                    con lupa y luz de Wood. Es gratis en tu primera visita.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <a
                      href={waLink(quizMessage(answers as Answers, LABELS, rec))}
                      target="_blank"
                      rel="noopener"
                      className="btn btn-primary"
                    >
                      Solicitar diagnóstico gratuito
                      <ArrowRight size={16} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />
                    </a>
                    <button type="button" onClick={restart} className="btn btn-ghost">
                      <RotateCcw size={15} strokeWidth={1.8} aria-hidden="true" /> Repetir el test
                    </button>
                  </div>
                </m.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
