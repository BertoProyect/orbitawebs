import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useFinePointer } from "../hooks/useMediaQuery";
import { waLink } from "../lib/links";
import { AlbaMark, EASE, Reveal, RevealLines } from "./ui";

export function Gift() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 160, damping: 18 });
  const tilt = fine && !reduce;

  return (
    <section aria-labelledby="regalo-title" className="overflow-hidden bg-plum-soft py-[clamp(88px,12vw,160px)]">
      <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="[perspective:1200px]">
          <m.div
            className="relative mx-auto aspect-[1.586] w-full max-w-[460px] rounded-[var(--radius-md)] bg-plum p-7 text-white shadow-[0_40px_80px_-30px_rgba(105,17,56,0.55)] sm:p-9"
            style={tilt ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : undefined}
            initial={reduce ? false : { opacity: 0, y: 50, rotate: -6 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, ease: EASE }}
            onPointerMove={(e) => {
              if (!tilt) return;
              const r = e.currentTarget.getBoundingClientRect();
              px.set((e.clientX - r.left) / r.width - 0.5);
              py.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onPointerLeave={() => {
              px.set(0);
              py.set(0);
            }}
            data-cursor
            aria-hidden="true"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-md)]">
              <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(247,179,133,0.55),rgba(247,179,133,0))]" />
            </div>
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <AlbaMark light className="h-5 w-auto" />
                <span className="eyebrow text-[0.625rem] text-white/70">Tarjeta regalo</span>
              </div>
              <div>
                <p className="serif-italic text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-tight">Un momento para ella.</p>
                <div className="mt-4 flex items-end justify-between text-[0.75rem] text-white/70">
                  <span className="font-semibold tracking-[0.24em] uppercase">Alba Estética</span>
                  <span>Tratamiento o importe a tu elección</span>
                </div>
              </div>
            </div>
          </m.div>
        </div>

        <div>
          <Reveal as="p" className="eyebrow mb-5 text-plum" y={12}>
            Tarjetas regalo
          </Reveal>
          <RevealLines
            id="regalo-title"
            label="Regala un momento para ella."
            className="display t-h2"
            lines={[
              "Regala un momento",
              <>
                <em>para ella.</em>
              </>,
            ]}
          />
          <Reveal as="p" delay={0.15} className="t-lead mt-6 max-w-[44ch] text-ink-2">
            Elige cualquier tratamiento o importe y convierte el cuidado personal en un regalo especial.
          </Reveal>
          <Reveal delay={0.25} className="mt-9">
            <a
              href={waLink("Hola, Alba. Me gustaría regalar una tarjeta regalo de Alba Estética. ¿Me contáis cómo funciona?")}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
            >
              Quiero regalar Alba Estética
              <ArrowRight size={16} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />
            </a>
            <p className="mt-4 text-[0.8125rem] text-muted">Se piden por WhatsApp y se recogen en el centro.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
