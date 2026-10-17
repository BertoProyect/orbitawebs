import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageCircle, Pencil, Code2, Send } from "lucide-react";
import { ProcessLineReveal } from "./ProcessLineReveal";
import { Reveal } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

export interface ProcessStep {
  title: string;
  desc: string;
  /** Etiqueta corta que se ve sobre la escena 3D mientras el paso está activo. */
  tag: string;
}

/**
 * La escena 3D (three.js) va en un archivo aparte: solo se descarga en
 * ordenador y cuando la sección está a punto de verse. three ya lo usa el
 * robot del hero, así que comparten la librería y el coste extra es mínimo.
 */
const ProcessScene3D = lazy(() =>
  import("./ProcessScene3D").then((m) => ({ default: m.ProcessScene3D })),
);

const ICONS = [MessageCircle, Pencil, Code2, Send];

function useIsDesktop() {
  // false en el servidor y en el primer render del navegador (así no hay
  // diferencias de hidratación); se corrige justo después de montar.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function ProcessShowcase({ items }: { items: ProcessStep[] }) {
  const isDesktop = useIsDesktop();

  // Al cambiar entre la versión móvil y la de ordenador cambia la altura de
  // la sección, y las secciones fijadas con scroll de más abajo (portfolio)
  // tienen que recalcular dónde empiezan.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [isDesktop]);

  return (
    <div className="container-page py-24 sm:py-32 lg:pb-0">
      <Reveal>
        <div className="max-w-3xl">
          <p className="eyebrow !text-[color:var(--primary-on-dark)]">Proceso</p>
          <h2 className="section-title mt-3 text-white">Simple, claro y sin sorpresas.</h2>
          <p className="mt-5 max-w-xl text-lg text-[color:var(--on-dark-muted)] lg:text-xl">
            De la primera demo a tu web publicada, en cuatro pasos.
          </p>
        </div>
      </Reveal>

      {isDesktop ? (
        <DesktopProcess items={items} />
      ) : (
        <ProcessLineReveal
          tone="dark"
          items={items.map((it, i) => ({ ...it, icon: ICONS[i % ICONS.length] }))}
        />
      )}
    </div>
  );
}

function DesktopProcess({ items }: { items: ProcessStep[] }) {
  const stepsRef = useRef<HTMLOListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  // Progreso 0..1 del recorrido por los pasos. Se guarda en una ref (no en
  // estado) para que la escena 3D lo lea en cada fotograma sin re-renders.
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);
  const [sceneMounted, setSceneMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useLayoutEffect(() => {
    const steps = stepsRef.current;
    const fill = fillRef.current;
    if (!steps || !fill) return;
    const n = items.length;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: steps,
        start: "top 55%",
        end: "bottom 55%",
        onUpdate: (self) => {
          progressRef.current = self.progress;
          gsap.set(fill, { scaleY: self.progress });
          const idx = Math.min(n - 1, Math.floor(self.progress * n));
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
    }, steps);
    return () => ctx.revert();
  }, [items.length]);

  // Monta la escena un poco antes de que la sección entre en pantalla y
  // la pausa (deja de dibujar) cuando sale, para no gastar batería.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setSceneMounted(true);
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mt-16 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-12 xl:gap-20">
      {/* IZQUIERDA: pasos. Cada uno ocupa casi una pantalla para que dé
          tiempo a ver su escena a la derecha. */}
      <div className="relative pb-[14vh]">
        {/* raíl de progreso */}
        <div className="absolute bottom-[14vh] left-0 top-0 w-px bg-white/10" aria-hidden="true">
          <div
            ref={fillRef}
            className="h-full w-full origin-top bg-[color:var(--primary-on-dark)]"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        {/* El progreso se mide sobre la lista (sin el margen final), así cada
            paso ocupa exactamente 1/4 del recorrido */}
        <ol ref={stepsRef}>
          {items.map((step, i) => {
            const Icon = ICONS[i % ICONS.length];
            const isActive = i === active;
            return (
              <li
                key={step.title}
                className="flex min-h-[72vh] items-center pl-10 xl:pl-14"
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className="transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    opacity: isActive ? 1 : 0.28,
                    transform: isActive ? "translateX(0)" : "translateX(-6px)",
                  }}
                >
                  <div className="flex items-center gap-3 text-[color:var(--primary-on-dark)]">
                    <span className="text-sm font-semibold tabular-nums tracking-[0.12em]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-8 bg-current opacity-50" />
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-5 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-md text-xl leading-relaxed text-[color:var(--on-dark-muted)]">
                    {step.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* DERECHA: escena fija mientras se recorren los pasos */}
      <div className="relative">
        <div ref={stageRef} className="sticky top-0 flex h-[100vh] items-center">
          <div className="relative h-[84vh] w-full">
            {sceneMounted && (
              <Suspense fallback={null}>
                <ProcessScene3D progressRef={progressRef} running={inView} />
              </Suspense>
            )}

            {/* Indicador del paso actual */}
            <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/85 backdrop-blur-md">
              <span className="font-semibold tabular-nums text-[color:var(--primary-on-dark)]">
                {String(active + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
              </span>
              <span key={active} className="animate-in fade-in duration-500">
                {items[active]?.tag}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
