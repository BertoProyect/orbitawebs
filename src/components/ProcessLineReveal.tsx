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

  const [rail, setRail] = useState<{ top: number; height: number } | null>(null);

  // Mide la posición real del primer y último punto para que la línea empiece y acabe exactamente ahí
  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = itemsWrapperRef.current;
      const firstDot = dotRefs.current[0];
      const lastDot = dotRefs.current[dotRefs.current.length - 1];
      if (!wrapper || !firstDot || !lastDot) return;

      const wrapperTop = wrapper.getBoundingClientRect().top;
      const firstCenter =
        firstDot.getBoundingClientRect().top + firstDot.getBoundingClientRect().height / 2;
      const lastCenter =
        lastDot.getBoundingClientRect().top + lastDot.getBoundingClientRect().height / 2;

      setRail({
        top: firstCenter - wrapperTop,
        height: lastCenter - firstCenter,
      });
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
