import { useEffect, useRef, useState } from "react";
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
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [railStyle, setRailStyle] = useState<{ top: number; height: number }>({
    top: 0,
    height: 0,
  });
  const [dotTops, setDotTops] = useState<number[]>([]);

  // Mide la posición real de las tarjetas para alinear la línea y los puntos con precisión
  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const cards = cardRefs.current;
      if (!container || cards.some((c) => !c)) return;

      const containerTop = container.getBoundingClientRect().top;
      const firstCard = cards[0]!.getBoundingClientRect();
      const lastCard = cards[cards.length - 1]!.getBoundingClientRect();

      const iconCenterOffset = 28 + 20; // padding de la tarjeta (p-7=28px) + mitad del icono (h-10=40px → 20px)

      const top = firstCard.top - containerTop + iconCenterOffset;
      const bottom = lastCard.top - containerTop + iconCenterOffset;

      setRailStyle({ top, height: bottom - top });
      setDotTops(
        cards.map((c) => c!.getBoundingClientRect().top - containerTop + iconCenterOffset)
      );
    };

    measure();
    window.addEventListener("resize", measure);
    const timeout = setTimeout(measure, 200); // por si las fuentes tardan en cargar

    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timeout);
    };
  }, [items.length]);

  useEffect(() => {
    const container = containerRef.current;
    const fill = fillRef.current;
    if (!container || !fill || railStyle.height === 0) return;

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
          trigger: container,
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
    }, container);

    return () => ctx.revert();
  }, [items.length, railStyle.height]);

  return (
    <div ref={containerRef} className="container-page relative mx-auto mt-14 max-w-2xl sm:mt-16">
      {/* línea base tenue, medida para empezar/acabar justo en el icono de la primera/última tarjeta */}
      <div
        className="absolute left-3 w-[3px] -translate-x-1/2 rounded-full bg-primary/10 sm:left-4"
        style={{ top: railStyle.top, height: railStyle.height }}
      />
      {/* línea de relleno, crece con el scroll */}
      <div
        ref={fillRef}
        className="absolute left-3 w-[3px] -translate-x-1/2 rounded-full bg-primary sm:left-4"
        style={{ top: railStyle.top, height: railStyle.height }}
      />

      <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
        {items.map((p, i) => (
          <div key={p.title} className="relative pl-14 sm:pl-16">
            {/* punto del paso, colocado en la posición real medida del icono */}
            <div
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="absolute left-3 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-md sm:left-4"
              style={{ opacity: 0, top: dotTops[i] ?? 0 }}
            />

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
  );
}
