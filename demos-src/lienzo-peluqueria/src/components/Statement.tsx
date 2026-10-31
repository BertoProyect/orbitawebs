import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { PHOTOS } from "../data/content";
import { Img } from "./ui";

const LINE_1 = "Un buen corte no termina cuando sales de aquí.";
const LINE_2 = "Empieza cuando te peinas en casa.";

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, ["0.35em", "0em"]);
  return (
    <span className="relative inline-block overflow-hidden pb-[0.08em] align-bottom">
      <m.span className="inline-block text-gold-light will-change-transform" style={{ opacity, y }}>
        {word}
      </m.span>
    </span>
  );
}

/* Manifiesto: la segunda frase se revela con el scroll y la foto se abre detrás */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  const clip = useTransform(
    scrollYProgress,
    [0, 0.55],
    ["inset(26% 34% 26% 34% round 20px)", "inset(0% 0% 0% 0% round 0px)"],
  );
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.02]);
  const imgOpacity = useTransform(scrollYProgress, [0, 0.35, 1], [0.55, 0.32, 0.22]);
  const line1Opacity = useTransform(enter, [0.35, 0.9], [0, 1]);
  const line1Y = useTransform(enter, [0.35, 1], [40, 0]);

  const words = LINE_2.split(" ");
  const start = 0.18;
  const end = 0.78;
  const step = (end - start) / words.length;

  if (reduce) {
    return (
      <section
        id="manifiesto"
        aria-labelledby="manifiesto-title"
        className="relative overflow-hidden py-32"
      >
        <div className="absolute inset-0 -z-10 opacity-25">
          <Img
            photo={PHOTOS.statement}
            sizes="100vw"
            decorative
            className="h-full w-full object-cover"
          />
        </div>
        <div className="wrap text-center">
          <h2 id="manifiesto-title" className="display h-lg mx-auto max-w-[18ch]">
            {LINE_1} <span className="text-gold-light">{LINE_2}</span>
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section
      id="manifiesto"
      ref={ref}
      aria-labelledby="manifiesto-title"
      className="relative h-[230vh] bg-bg"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <m.div
          className="absolute inset-0 -z-0 will-change-[clip-path]"
          style={{ clipPath: clip }}
          aria-hidden="true"
        >
          <m.div className="h-full w-full" style={{ scale: imgScale, opacity: imgOpacity }}>
            <Img
              photo={PHOTOS.statement}
              widths={[720, 960, 1280, 1600]}
              sizes="100vw"
              decorative
              className="h-full w-full object-cover"
            />
          </m.div>
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgb(13_12_11/0.35),rgb(13_12_11/0.85))]" />
        </m.div>

        <div className="wrap relative text-center">
          <h2
            id="manifiesto-title"
            className="display h-lg mx-auto max-w-[19ch]"
            aria-label={`${LINE_1} ${LINE_2}`}
          >
            <m.span
              className="block"
              style={{ opacity: line1Opacity, y: line1Y }}
              aria-hidden="true"
            >
              {LINE_1}
            </m.span>
            <span className="mt-[0.35em] block" aria-hidden="true">
              {words.map((w, i) => (
                <span key={i}>
                  <Word
                    word={w}
                    progress={scrollYProgress}
                    range={[start + i * step, start + (i + 1) * step]}
                  />
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
