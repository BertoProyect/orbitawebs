import { Fragment, useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

/* Escena 2 · La filosofía.
   Adaptado del componente «Scroll word reveal» de Motion (21st.dev): cada palabra pasa de
   casi transparente a plena según avanza el scroll de la página. Aquí con tres líneas que
   alternan redonda y cursiva, y un tramo fijo corto (200 vh, una pantalla de recorrido) para no atrapar a nadie. */
const LINES = [
  { text: "Tu piel merece", italic: false },
  { text: "un momento", italic: true },
  { text: "solo para ella.", italic: false },
];
const REST = 0.12;
const SPAN = 0.78;
const WINDOW = 0.16;

const WORDS = LINES.flatMap((l, li) => l.text.split(" ").map((w) => ({ w, li, italic: l.italic })));

function Word({ children, progress, index, italic }: { children: string; progress: MotionValue<number>; index: number; italic: boolean }) {
  const start = (index / (WORDS.length - 1)) * SPAN;
  const end = Math.min(1, start + WINDOW);
  const opacity = useTransform(progress, [start, end], [REST, 1]);
  const y = useTransform(progress, [start, end], ["0.18em", "0em"]);
  return (
    <m.span
      aria-hidden="true"
      className={`inline-block will-change-transform ${italic ? "serif-italic text-plum" : ""}`}
      style={{ opacity, y }}
    >
      {children}
    </m.span>
  );
}

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.4", "end end"] });
  const bar = useTransform(scrollYProgress, [0, 0.95], [0, 1]);

  const heading = (
    <h2 className="display t-mega text-center" aria-label={LINES.map((l) => l.text).join(" ")}>
      {LINES.map((_, li) => (
        <span key={li} className="block">
          {WORDS.map((wd, i) =>
            wd.li !== li ? null : (
              <Fragment key={i}>
                {reduce ? (
                  <span aria-hidden="true" className={wd.italic ? "serif-italic text-plum" : ""}>
                    {wd.w}
                  </span>
                ) : (
                  <Word progress={scrollYProgress} index={i} italic={wd.italic}>
                    {wd.w}
                  </Word>
                )}{" "}
              </Fragment>
            ),
          )}
        </span>
      ))}
    </h2>
  );

  if (reduce) {
    return (
      <section aria-label="Nuestra filosofía" className="wrap py-28">
        {heading}
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="Nuestra filosofía" className="relative h-[200vh]">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="wrap">
          <p className="eyebrow mb-8 text-center text-plum">Nuestra filosofía</p>
          {heading}
          <div className="mx-auto mt-12 h-px w-40 overflow-hidden bg-line" aria-hidden="true">
            <m.div className="h-full origin-left bg-plum" style={{ scaleX: bar }} />
          </div>
        </div>
      </div>
    </section>
  );
}
