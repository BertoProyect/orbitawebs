import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import { EXPERIENCE } from "../data/content";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { EASE, Img, MaskReveal, Reveal, RevealLines } from "./ui";

function Heading() {
  return (
    <div className="max-w-[36rem]">
      <RevealLines
        lines={["Así es tu cita", "en Lienzo."]}
        className="display h-md"
        id="experiencia-title"
      />
      <Reveal delay={0.15}>
        <p className="lead mt-5">
          Da igual que vengas a cortarte las puntas o a cambiar de look: siempre en este orden.
        </p>
      </Reveal>
    </div>
  );
}

/* Escritorio: foto fija a la izquierda y tres pasos que avanzan con el scroll */
function StickyStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useTransform(scrollYProgress, [0.04, 0.96], [0, 1]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.12, 1.02]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(
      Math.min(EXPERIENCE.length - 1, Math.max(0, Math.floor(v * EXPERIENCE.length * 0.999))),
    );
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${EXPERIENCE.length * 85 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="wrap grid w-full grid-cols-[1.05fr_1fr] items-center gap-[clamp(40px,6vw,104px)]">
          <div className="media relative aspect-[4/5] max-h-[78svh] w-full">
            {EXPERIENCE.map((step, i) => (
              <m.div
                key={step.n}
                className="absolute inset-0"
                initial={false}
                animate={{
                  clipPath: i <= active ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
                }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                style={{ zIndex: i }}
              >
                <m.div className="h-full w-full" style={{ scale: imgScale }}>
                  <Img
                    photo={step.photo}
                    widths={[640, 960, 1280]}
                    sizes="(min-width: 1320px) 640px, 48vw"
                    className="h-full w-full object-cover"
                    alt={i === active ? step.photo.alt : ""}
                  />
                </m.div>
              </m.div>
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-bg/60 to-transparent" />
            <AnimatePresence mode="wait">
              <m.span
                key={active}
                className="absolute bottom-6 left-6 z-20 text-sm text-ink-2 tabular"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {EXPERIENCE[active].n} / 03
              </m.span>
            </AnimatePresence>
          </div>

          <div>
            <Heading />
            <ol className="relative mt-14 border-l border-line pl-8">
              <m.span
                aria-hidden="true"
                className="absolute -left-px top-0 h-full w-px origin-top bg-gold"
                style={{ scaleY: bar }}
              />
              {EXPERIENCE.map((step, i) => {
                const on = i === active;
                return (
                  <li key={step.n} className="relative py-5" aria-current={on ? "step" : undefined}>
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[37px] top-[1.9rem] h-2.5 w-2.5 rounded-full border transition-all duration-700 ${
                        i <= active
                          ? "border-gold bg-gold shadow-[0_0_0_6px_rgb(217_197_154/0.14)]"
                          : "border-line-strong bg-bg"
                      }`}
                    />
                    <m.div
                      animate={{ opacity: on ? 1 : 0.32, x: on ? 0 : -6 }}
                      transition={{ duration: 0.8, ease: EASE }}
                    >
                      <p className="eyebrow mb-2 tabular">{step.n}</p>
                      <h3 className="h-sm font-light">{step.title}</h3>
                      {/* Altura con CSS (grid 0fr→1fr): animar height:auto con JS cortaría el scroll suave */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-expo)] ${
                          on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <p className="min-h-0 overflow-hidden text-ink-2">
                          <span className="block max-w-[30rem] pt-3">{step.text}</span>
                        </p>
                      </div>
                    </m.div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Móvil y tableta: los tres pasos en columna, cada foto se abre al entrar */
function StackedStory() {
  return (
    <div className="wrap">
      <Heading />
      <ol className="mt-14 grid gap-16 md:grid-cols-3 md:gap-8">
        {EXPERIENCE.map((step, i) => (
          <li key={step.n}>
            <MaskReveal className="media aspect-[4/5]" delay={i * 0.05}>
              <Img
                photo={step.photo}
                widths={[480, 720, 960]}
                sizes="(min-width: 768px) 30vw, 90vw"
                className="h-full w-full object-cover"
              />
            </MaskReveal>
            <Reveal className="mt-6" delay={0.1}>
              <p className="eyebrow mb-2 tabular">{step.n}</p>
              <h3 className="h-sm font-light">{step.title}</h3>
              <p className="mt-3 text-ink-2">{step.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Experience() {
  const desktop = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const reduce = useReducedMotion();
  return (
    <section
      id="experiencia"
      aria-labelledby="experiencia-title"
      className={desktop && !reduce ? "bg-bg" : "bg-bg py-[clamp(96px,14vw,180px)]"}
    >
      {desktop && !reduce ? <StickyStory /> : <StackedStory />}
    </section>
  );
}
