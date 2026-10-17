import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageCircle, Pencil, Code2, Send } from "lucide-react";
import { Reveal } from "./Reveal";
import { worldState } from "@/lib/world-state";

gsap.registerPlugin(ScrollTrigger);

export interface ProcessStep {
  title: string;
  desc: string;
  /** Etiqueta corta del indicador de paso. */
  tag: string;
}

const ICONS = [MessageCircle, Pencil, Code2, Send];

/**
 * Proceso: 4 pasos que se activan con el scroll. La animación no vive aquí:
 * el progreso (0..1) se publica en `worldState` y lo usa la isla del taller
 * del mundo 3D (OrbitWorld), que la cámara encuadra mientras lees esta
 * sección. Mismo componente en móvil y en ordenador:
 *  - ordenador: pasos a la izquierda, escena a la derecha;
 *  - móvil: escena arriba, cada paso entra por abajo en su tarjeta.
 */
export function ProcessShowcase({ items }: { items: ProcessStep[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    if (!list || !fill) return;
    const n = items.length;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: list,
        start: "top 55%",
        end: "bottom 55%",
        onUpdate: (self) => {
          worldState.processProgress = self.progress;
          gsap.set(fill, { scaleY: self.progress });
          const idx = Math.min(n - 1, Math.floor(self.progress * n));
          setActive((prev) => (prev === idx ? prev : idx));
        },
        onLeaveBack: () => {
          worldState.processProgress = 0;
        },
      });
    }, list);
    return () => ctx.revert();
  }, [items.length]);

  return (
    <div className="container-page pt-24 sm:pt-32">
      <Reveal>
        <div className="max-w-3xl">
          <h2 className="section-title text-white">Simple, claro y sin sorpresas.</h2>
          <p className="mt-5 max-w-xl text-lg text-[color:var(--on-dark-muted)] lg:text-xl">
            De la primera demo a tu web publicada, en cuatro pasos.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid lg:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="relative pb-[12vh]">
          {/* raíl de progreso */}
          <div
            className="absolute bottom-[12vh] left-0 top-0 hidden w-px bg-white/10 lg:block"
            aria-hidden="true"
          >
            <div
              ref={fillRef}
              className="h-full w-full origin-top bg-[color:var(--primary-on-dark)]"
              style={{ transform: "scaleY(0)" }}
            />
          </div>

          <ol ref={listRef}>
            {items.map((step, i) => {
              const Icon = ICONS[i % ICONS.length];
              const isActive = i === active;
              return (
                <li
                  key={step.title}
                  className="flex min-h-[88svh] items-end pb-[6svh] lg:min-h-[72vh] lg:items-center lg:pb-0 lg:pl-14"
                  aria-current={isActive ? "step" : undefined}
                >
                  <div
                    className="w-full rounded-[18px] bg-black/70 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
                    style={{
                      opacity: isActive ? 1 : 0.22,
                      transform: isActive ? "translateY(0)" : "translateY(10px)",
                    }}
                  >
                    <div className="flex items-center gap-3 text-[color:var(--primary-on-dark)]">
                      <span className="text-sm font-semibold tabular-nums tracking-[0.12em]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-8 bg-current opacity-50" />
                      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white lg:mt-5 lg:text-[2.6rem]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-md text-[1.05rem] leading-relaxed text-[color:var(--on-dark-muted)] lg:mt-5 lg:text-xl">
                      {step.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* columna derecha vacía: ahí se ve el taller del mundo 3D; solo el
            indicador de paso se queda fijo abajo */}
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="sticky top-[calc(100vh-5.5rem)] flex justify-center pb-6">
            <div className="flex items-center gap-3 rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/85 backdrop-blur-md">
              <span className="font-semibold tabular-nums text-[color:var(--primary-on-dark)]">
                {String(active + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
              </span>
              <span>{items[active]?.tag}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
