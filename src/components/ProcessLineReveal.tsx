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
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    const fill = fillRef.current;
    if (!container || !fill) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(fill, { scaleY: 1 });
        blockRefs.current.forEach((el) => el && gsap.set(el, { opacity: 1, y: 0 }));
        dotRefs.current.forEach((el) => el && gsap.set(el, { opacity: 1, scale: 1.2 }));
        return;
      }

      // La línea se rellena de forma continua según el scroll de TODO el bloque, sin pin
      gsap.set(fill, { scaleY: 0, transformOrigin: "top" });
      gsap.to(fill, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      // Cada bloque y su punto aparecen individualmente al entrar en pantalla
      blockRefs.current.forEach((el, i) => {
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
    }, container);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <div ref={containerRef} className="container-page relative mx-auto max-w-2xl">
      {/* línea base tenue, siempre a la izquierda */}
      <div className="absolute left-2 top-0 bottom-0 w-[3px] rounded-full bg-primary/10 sm:left-3" />
      {/* línea de relleno, crece con el scroll */}
      <div
        ref={fillRef}
        className="absolute left-2 top-0 bottom-0 w-[3px] rounded-full bg-primary sm:left-3"
      />

      <div className="relative z-10 flex flex-col gap-10 py-4 sm:gap-14">
        {items.map((p, i) => (
          <div
            key={p.title}
            ref={(el) => {
              blockRefs.current[i] = el;
            }}
            className="relative pl-12 sm:pl-14"
          >
            {/* punto del paso */}
            <div
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="absolute left-2 top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-md sm:left-3"
              style={{ opacity: 0 }}
            />

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
        ))}
      </div>
    </div>
  );
}
