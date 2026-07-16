import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

  const [rail, setRail] = useState<{ top: number; height: number; dotFractions: number[] } | null>(
    null
  );

  // Mide: la línea empieza en el 1er punto y acaba al final de la última tarjeta.
  // Además calcula en qué % del recorrido cae cada punto, para sincronizar su aparición con el relleno.
  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = itemsWrapperRef.current;
      const dots = dotRefs.current;
      const lastCard = cardRefs.current[cardRefs.current.length - 1];
      if (!wrapper || !lastCard || dots.some((d) => !d)) return;

      const wrapperTop = wrapper.getBoundingClientRect().top;
      const firstTop = dots[0]!.getBoundingClientRect().top;
      const lastCardBottom = lastCard.getBoundingClientRect().bottom;

      const top = firstTop - wrapperTop;
      const height = lastCardBottom - firstTop;

      const dotFractions = dots.map((d) => {
        const dotTop = d!.getBoundingClientRect().top;
        return height > 0 ? (dotTop - firstTop) / height : 0;
      });

      setRail({ top, height, dotFractions });
    };

    measure();
    window.addEventListener("resize", measure);
    const timeout = setTimeout(measure, 250); // por si las fuentes cargan tarde y cambian alturas

    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timeout);
    };
  }, [items.length]);

  useEffect(() => {
    const outer = outerRef.current;
    const itemsWrapper = itemsWrapperRef.current;
    const fill = fillRef.current;
    if (!outer || !itemsWrapper || !fill || !rail) return;

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

      gsap.set(fill, { scaleY: 0, transformOrigin: "top" });
      dotRefs.current.forEach((el) => el && gsap.set(el, { opacity: 0, scale: 1 }));

      gsap.to(fill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: itemsWrapper,
          start: "top center",
          end: "bottom center",
          scrub: true,
          onUpdate: (self) => {
            rail.dotFractions.forEach((fraction, i) => {
              const dot = dotRefs.current[i];
              if (!dot) return;
              const shouldShow = self.progress >= fraction - 0.01;
              const isVisible = Number(gsap.getProperty(dot, "opacity")) > 0.5;
              if (shouldShow && !isVisible) {
                gsap.to(dot, { opacity: 1, scale: 1.2, duration: 0.35, ease: "power2.out" });
              } else if (!shouldShow && isVisible) {
                gsap.to(dot, { opacity: 0, scale: 1, duration: 0.25, ease: "power2.out" });
              }
            });
          },
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
      });
    }, outer);

    return () => ctx.revert();
  }, [items.length, rail]);

  return (
    <div ref={outerRef} className="container-page relative mx-auto mt-12 max-w-2xl sm:mt-14">
      <div ref={itemsWrapperRef} className="relative">
        {/* columna de referencia ancha: línea y puntos se centran igual dentro de ella */}
        <div
          className="absolute left-3 w-8 -translate-x-1/2 sm:left-4"
          style={{ top: rail?.top ?? 0, height: rail?.height ?? 0 }}
        >
          {/* línea base tenue — empieza y acaba exactamente en el centro del 1º y último punto */}
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
              <div className="absolute left-3 top-0 h-4 w-8 -translate-x-1/2 sm:left-4">
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
              >
              <div className="card-surface p-7">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
