import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { useRef } from "react";
import { BUSINESS } from "../data/business";
import { PHOTOS } from "../data/content";
import { useFinePointer } from "../hooks/useMediaQuery";
import { scrollToId, waLink } from "../lib/links";
import { EASE, Img, Italic, Magnetic, RevealLines } from "./ui";

/* Escena 1 · La primera impresión.
   Entrada (~1,5 s, cuando suelta la intro de cristal): la foto aparece y se asienta de 1,08 a 1,
   el titular sube línea a línea, «buena cara» entra con su propio matiz vertical, después el texto,
   los botones escalonados y, al final, las señales de confianza.
   Al bajar: la foto se recoge y redondea, el titular sube y se desvanece. */
export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const still = reduce ?? false;
  const frameScale = useTransform(scrollYProgress, [0, 1], [1, still ? 1 : fine ? 0.86 : 0.92]);
  const radius = useTransform(scrollYProgress, [0, 0.6], [0, still ? 0 : 28]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", still || !fine ? "0%" : "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, still ? 0 : fine ? -160 : -70]);
  const textO = useTransform(scrollYProgress, [0, 0.55], [1, still ? 1 : 0]);
  const go = ready || still;

  const fade = (delay: number, y = 18) => ({
    initial: still ? false : { opacity: 0, y },
    animate: go ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.85, ease: EASE, delay },
  });

  return (
    <section
      id="inicio"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative h-[95svh] min-h-[560px] overflow-hidden bg-bg"
    >
      {/* Marco de la foto: se recoge al hacer scroll */}
      <m.div
        className="absolute inset-0 origin-top overflow-hidden bg-night will-change-transform"
        style={{ scale: frameScale, borderRadius: radius }}
      >
        <m.div className="absolute inset-0" style={{ y: imgY }}>
          <m.div
            className="h-full w-full"
            initial={still ? false : { opacity: 0, scale: 1.08 }}
            animate={go ? { opacity: 1, scale: 1 } : undefined}
            transition={{ opacity: { duration: 0.9, ease: "easeOut" }, scale: { duration: 1.6, ease: EASE } }}
          >
            <Img
              photo={PHOTOS.hero}
              widths={[640, 960, 1280, 1600, 1920, 2400]}
              sizes="100vw"
              priority
              className="h-full w-full object-cover object-[62%_50%]"
            />
          </m.div>
        </m.div>
        {/* Contraste cálido para el texto (abajo a la izquierda) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(38,16,25,0.42)_0%,rgba(38,16,25,0)_26%),linear-gradient(72deg,rgba(38,16,25,0.86)_0%,rgba(38,16,25,0.52)_42%,rgba(38,16,25,0.05)_75%)]"
        />
      </m.div>

      <m.div
        className="on-dark wrap relative flex h-full flex-col justify-end pb-[clamp(40px,8vh,96px)] pt-[calc(var(--nav-h)+24px)] text-white"
        style={{ y: textY, opacity: textO }}
      >
        <m.p className="eyebrow mb-6 text-white/80" {...fade(0.1, 10)}>
          Centro de estética · Huelva
        </m.p>

        <RevealLines
          as="h1"
          id="hero-title"
          label="Para que te digan qué buena cara tienes."
          start={go}
          delay={0.22}
          stagger={0.12}
          className="display t-hero max-w-[16ch] text-white"
          lines={[
            "Para que te digan",
            <>
              qué <Italic go={go} delay={0.5}>buena cara</Italic> tienes.
            </>,
          ]}
        />

        <m.p className="t-lead mt-7 max-w-[34ch] text-white/85" {...fade(0.72)}>
          Tu piel merece tiempo, conocimiento y manos expertas.
        </m.p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <m.div {...fade(0.86, 14)}>
            <Magnetic>
              <a
                href="#tratamientos"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("tratamientos");
                }}
                className="btn btn-light"
              >
                Descubre nuestros tratamientos
                <ArrowRight size={17} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />
              </a>
            </Magnetic>
          </m.div>
          <m.div {...fade(0.96, 14)}>
            <a
              href={waLink("Hola, Alba. Me gustaría pedir mi primera cita y el diagnóstico de piel gratuito. ¿Qué disponibilidad tenéis?")}
              target="_blank"
              rel="noopener"
              className="btn btn-outline-light"
            >
              Pide tu primera cita
            </a>
          </m.div>
        </div>

        <m.ul
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.875rem] text-white/80"
          aria-label="Valoraciones"
          {...fade(1.12, 10)}
        >
          <li className="flex items-center gap-2">
            <span className="flex gap-0.5 text-sunrise" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </span>
            <span>
              <strong className="font-semibold text-white">4,9</strong> en Google
            </span>
          </li>
          <li className="hidden h-3 w-px bg-white/30 xs:block" aria-hidden="true" />
          <li>{BUSINESS.reviews} opiniones</li>
          <li className="hidden h-3 w-px bg-white/30 xs:block" aria-hidden="true" />
          <li>Desde {BUSINESS.since}</li>
        </m.ul>
      </m.div>

      {/* Indicador de scroll */}
      <m.div className="absolute bottom-6 right-[var(--gutter)] hidden md:block" style={{ opacity: textO }}>
        <m.a
          href="#confianza"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("confianza");
          }}
          aria-label="Bajar al contenido"
          className="flex h-14 w-11 flex-col items-center justify-end gap-2 text-white/75"
          initial={still ? false : { opacity: 0 }}
          animate={go ? { opacity: 1 } : undefined}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span className="eyebrow text-[0.625rem]">Scroll</span>
          <span className="relative h-8 w-px overflow-hidden bg-white/25">
            <span className="scroll-cue absolute inset-0 bg-white" />
          </span>
        </m.a>
      </m.div>
    </section>
  );
}
