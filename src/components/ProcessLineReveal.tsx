import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface ProcessStep {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface ProcessLineRevealProps {
  items: ProcessStep[];
}

export function ProcessLineReveal({ items }: ProcessLineRevealProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const itemsWrapperRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const outer = outerRef.current;
    const itemsWrapper = itemsWrapperRef.current;
    const fill = fillRef.current;
    if (!outer || !itemsWrapper || !fill) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(fill, { scaleY: 1 });
        cardRefs.current.forEach((el) => el && gsap.set(el, { opacity: 1, y: 0 }));
        dotRefs.current.forEach((el) => el && gsap.set(el, { opacity: 1, scale: 1.2 }));
        return;
      }

      // La línea se rellena según se scrollea EXACTAMENTE la altura de las tarjetas
      gsap.set(fill, { scaleY: 0, transformOrigin: "top" });
      gsap.to(fill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: itemsWrapper,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, y: 24 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        const dot = dotRefs.current[i];
        if (dot) {
          gsap.set(dot, { opacity: 0, scale: 1 });
          gsap.to(dot, {
            opacity: 1,
            scale: 1.2,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 65%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });
    }, outer);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <div ref={outerRef} className="container-page relative mx-auto mt-14 max-w-2xl sm:mt-16">
      {/* Envoltorio que contiene SOLO las tarjetas: la línea se ancla a este, no al bloque exterior */}
      <div ref={itemsWrapperRef} className="relative">
        {/* columna de referencia ancha: línea y puntos se centran igual dentro de ella, sin importar su ancho propio */}
        <div className="absolute inset-y-0 left-3 w-8 -translate-x-1/2 sm:left-4">
          {/* línea base tenue — abarca exactamente desde el inicio de la 1ª tarjeta hasta el final de la última */}
          <div className="absolute inset-y-0 inset-x-0 mx-auto w-[3px] rounded-full bg-primary/10" />
          {/* línea de relleno, crece con el scroll */}
          <div
            ref={fillRef}
            className="absolute inset-y-0 inset-x-0 mx-auto w-[3px] rounded-full bg-primary"
          />
        </div>

        <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
          {items.map((p, i) => (
            <div key={p.title} className="relative pl-14 sm:pl-16">
              {/* columna de referencia del punto, misma posición y ancho que la de la línea */}
              <div className="absolute left-3 top-12 h-4 w-8 -translate-x-1/2 -translate-y-1/2 sm:left-4">
                <div
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className="absolute inset-y-0 inset-x-0 z-10 mx-auto h-4 w-4 rounded-full bg-primary shadow-md"
                  style={{ opacity: 0 }}
                />
              </div>

              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="card-surface p-7"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <p.icon className="text-primary" size={22} strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
