import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { BUSINESS } from "../data/business";
import { PHOTOS } from "../data/content";
import { useFinePointer } from "../hooks/useMediaQuery";
import { useMadridNow } from "../hooks/useNow";
import { pexels, scrollToId, srcSet } from "../lib/links";
import { openStatus } from "../lib/time";
import { EASE, RevealLines, Stars, WhatsAppIcon } from "./ui";

export function OpenBadge({ className = "" }: { className?: string }) {
  const now = useMadridNow();
  const s = openStatus(now);
  return (
    <p className={`inline-flex items-center gap-2.5 text-sm ${className}`} aria-live="polite">
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        {s.open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-success/60 motion-reduce:hidden" />
        )}
        <span
          className={`relative h-2.5 w-2.5 rounded-full ${s.open ? "bg-success" : "bg-error"}`}
        />
      </span>
      <span>
        <strong className="font-medium text-ink">{s.label}</strong>
        {s.detail && <span className="text-ink-2"> · {s.detail}</span>}
      </span>
    </p>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const parallax = !reduce;
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", fine ? "18%" : "8%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, fine ? 1.15 : 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const show = ready || !!reduce;
  const t = (delay: number) => ({ duration: 1.1, ease: EASE, delay: reduce ? 0 : delay });
  const fade = (delay: number, y = 22) => ({
    initial: reduce ? false : ({ opacity: 0, y } as const),
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: t(delay),
  });

  return (
    <section
      id="inicio"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative isolate flex h-[100svh] min-h-[600px] items-end overflow-hidden bg-black"
    >
      {/* Foto: se abre con una máscara al terminar la intro */}
      <m.div
        className="absolute inset-0 -z-10"
        initial={reduce ? false : { clipPath: "inset(38% 28% 38% 28% round 28px)" }}
        animate={show ? { clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
        transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <m.div
          className="absolute inset-0"
          style={parallax ? { y: imgY, scale: imgScale } : { scale: 1.08 }}
        >
          <m.picture
            className="block h-full w-full"
            initial={reduce ? false : { scale: 1.28, opacity: 0.4 }}
            animate={show ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 2.2, ease: EASE }}
          >
            <source
              media="(max-width: 767px)"
              srcSet={srcSet(PHOTOS.heroMobile, [480, 720, 960, 1280])}
              sizes="100vw"
              width={1280}
              height={1920}
            />
            <img
              src={pexels(PHOTOS.heroDesktop.id, 1920)}
              srcSet={srcSet(PHOTOS.heroDesktop, [960, 1280, 1600, 1920, 2400])}
              sizes="100vw"
              width={1920}
              height={1280}
              alt=""
              // @ts-expect-error fetchpriority aún no está en los tipos de React para img
              fetchpriority="high"
              decoding="async"
              className="hero-drift h-full w-full object-cover object-[62%_40%] md:object-center"
            />
          </m.picture>
        </m.div>
        {/* Velos para leer el texto */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_30%,transparent_20%,rgb(13_12_11/0.55)_70%,rgb(13_12_11/0.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-bg via-bg/70 to-transparent" />
        <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-bg/70 to-transparent md:block" />
      </m.div>

      <m.div
        className="wrap relative pb-[max(32px,calc(env(safe-area-inset-bottom)+92px))] md:pb-16 lg:pb-20"
        style={parallax ? { y: contentY, opacity: contentOpacity } : undefined}
      >
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-[54rem]">
            <m.div {...fade(0.55, 12)} className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="eyebrow">Peluquería unisex · Huelva</p>
              <span className="hidden h-px w-10 bg-gold/50 sm:block" aria-hidden="true" />
              <p className="text-sm text-ink-2">Mujer · Hombre · Niños</p>
            </m.div>

            <RevealLines
              as="h1"
              id="hero-title"
              lines={["El corte que", "sabes peinar", "en casa."]}
              className="display h-xl text-ink"
              start={show}
              delay={0.75}
            />

            <m.p {...fade(1.25)} className="lead mt-7 max-w-[34rem]">
              {BUSINESS.promise}
            </m.p>

            <m.div
              {...fade(1.45, 28)}
              className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap"
            >
              <a
                href="#reserva"
                className="btn btn--primary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("reserva");
                }}
              >
                <WhatsAppIcon />
                Reservar por WhatsApp
              </a>
              <a
                href="#experiencia"
                className="btn btn--ghost"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("experiencia");
                }}
              >
                Descubrir Lienzo
                <ArrowRight className="btn__arrow" />
              </a>
            </m.div>
          </div>

          {/* Confianza y estado: flotan a la derecha en escritorio */}
          <m.div
            {...fade(1.7, 16)}
            className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end"
          >
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-line bg-bg/40 px-4 py-2.5 backdrop-blur-md">
              <OpenBadge />
            </div>
            <a
              href="#opiniones"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("opiniones");
              }}
              className="group inline-flex w-fit items-center gap-3 rounded-full border border-line bg-bg/40 px-4 py-2.5 text-sm backdrop-blur-md transition-colors duration-500 hover:border-gold/60"
            >
              <Stars className="h-3.5 w-3.5" />
              <span>
                <strong className="font-medium">4,9</strong> en Google ·{" "}
                <span className="text-ink-2">212 opiniones</span>
              </span>
            </a>
          </m.div>
        </div>
      </m.div>

      {/* Indicador de scroll */}
      <m.a
        href="#manifiesto"
        aria-label="Bajar a la siguiente sección"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("manifiesto");
        }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.7rem] tracking-[0.25em] text-muted uppercase md:flex"
        initial={reduce ? false : { opacity: 0 }}
        animate={show ? { opacity: 1 } : undefined}
        transition={t(2.1)}
      >
        <span className="relative block h-10 w-px overflow-hidden bg-line-strong">
          <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-gold" />
        </span>
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </m.a>
    </section>
  );
}
