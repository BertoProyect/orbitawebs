import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Check } from "lucide-react";
import { useRef, useState } from "react";
import { STAGES } from "../data/content";
import { useWide } from "../hooks/useMediaQuery";
import { ClipImage, EASE, Img, Reveal, SectionHead } from "./ui";

/* Escena 6 · La experiencia humana.
   Escritorio: la foto queda fija un rato (250 vh en total, 1,5 pantallas de recorrido) mientras
   el texto cambia por etapas y los indicadores se llenan con el scroll. Móvil: etapas apiladas. */
export function Experience() {
  const wide = useWide();
  const reduce = useReducedMotion();
  return (
    <section id="experiencia" aria-labelledby="exp-title" className="pt-[clamp(88px,12vw,160px)]">
      <div className="wrap">
        <SectionHead
          eyebrow="La experiencia"
          id="exp-title"
          label="No vienes solo a hacerte un tratamiento. Vienes a sentirte cuidada."
          lines={[
            "No vienes solo a",
            "hacerte un tratamiento.",
            <>
              <em>Vienes a sentirte cuidada.</em>
            </>,
          ]}
        />
      </div>
      {wide && !reduce ? <Pinned /> : <Stacked />}
    </section>
  );
}

function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const s = Math.min(STAGES.length - 1, Math.max(0, Math.floor(p * STAGES.length * 0.999)));
    setStage((c) => (c === s ? c : s));
  });
  const st = STAGES[stage];

  return (
    <div ref={ref} className="relative mt-16 h-[250vh]">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="wrap grid w-full grid-cols-12 items-center gap-16">
          {/* Foto fija que cambia por etapa */}
          <div className="col-span-6">
            <div className="relative aspect-[4/5] max-h-[78svh] overflow-hidden rounded-[var(--radius-lg)] bg-plum-soft">
              <AnimatePresence initial={false}>
                <m.div
                  key={stage}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0.999 }}
                  transition={{ duration: 1, ease: EASE }}
                >
                  <m.div className="h-full w-full" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: EASE }}>
                    <Img photo={st.photo} sizes="45vw" className="h-full w-full object-cover" />
                  </m.div>
                </m.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Texto por etapas + progreso */}
          <div className="col-span-5 col-start-8">
            <ol className="mb-12 flex gap-2" aria-label="Etapas">
              {STAGES.map((s, i) => (
                <li key={s.kicker} className="flex-1">
                  <Bar progress={scrollYProgress} i={i} />
                  <span className={`mt-3 block text-[0.75rem] font-semibold tracking-[0.14em] uppercase transition-colors duration-500 ${i === stage ? "text-plum" : "text-muted"}`}>
                    {s.kicker}
                  </span>
                </li>
              ))}
            </ol>
            <div className="relative min-h-[300px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={stage}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <p className="font-sans text-[0.8125rem] text-muted tabular-nums">0{stage + 1} — 0{STAGES.length}</p>
                  <h3 className="display mt-4 text-[clamp(2rem,1.4rem+1.8vw,3.25rem)]">{st.title}</h3>
                  <p className="t-lead mt-5 text-ink-2">{st.body}</p>
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {st.points.map((p, i) => (
                      <m.li
                        key={p}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: EASE }}
                        className="inline-flex items-center gap-2 rounded-full bg-plum-soft px-4 py-2 text-[0.875rem] text-plum"
                      >
                        <Check size={14} strokeWidth={2.2} aria-hidden="true" /> {p}
                      </m.li>
                    ))}
                  </ul>
                </m.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ progress, i }: { progress: MotionValue<number>; i: number }) {
  const n = STAGES.length;
  const scaleX = useTransform(progress, [i / n, (i + 1) / n], [0, 1]);
  return (
    <span className="block h-[2px] overflow-hidden rounded-full bg-line" aria-hidden="true">
      <m.span className="block h-full origin-left bg-plum" style={{ scaleX }} />
    </span>
  );
}

function Stacked() {
  return (
    <div className="wrap mt-12 grid gap-16 pb-4 sm:grid-cols-2 lg:grid-cols-3">
      {STAGES.map((s, i) => (
        <article key={s.kicker}>
          <ClipImage photo={s.photo} sizes="(min-width: 640px) 50vw, 100vw" className="aspect-[4/5] rounded-[var(--radius-lg)]" parallax={0} />
          <Reveal className="mt-6">
            <p className="eyebrow text-plum">
              0{i + 1} · {s.kicker}
            </p>
            <h3 className="display t-h3 mt-3">{s.title}</h3>
            <p className="mt-3 text-ink-2">{s.body}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {s.points.map((p) => (
                <li key={p} className="inline-flex items-center gap-2 rounded-full bg-plum-soft px-3.5 py-1.5 text-[0.8125rem] text-plum">
                  <Check size={13} strokeWidth={2.2} aria-hidden="true" /> {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </article>
      ))}
    </div>
  );
}
