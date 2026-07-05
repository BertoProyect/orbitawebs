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

interface ProcessSlidesProps {
  items: ProcessStep[];
}

export function ProcessSlides({ items }: ProcessSlidesProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const setActive = (activeIndex: number) => {
        slideRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            opacity: i === activeIndex ? 1 : 0,
            y: i === activeIndex ? 0 : 12,
            scale: i === activeIndex ? 1 : 0.97,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
            pointerEvents: i === activeIndex ? "auto" : "none",
          });
        });
        dotRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            backgroundColor: i === activeIndex ? "#355ACF" : "#D9D9D9",
            scale: i === activeIndex ? 1.25 : 1,
            duration: 0.3,
            overwrite: true,
          });
        });
      };

      slideRefs.current.forEach((el, i) => {
        if (el)
          gsap.set(el, {
            opacity: i === 0 ? 1 : 0,
            y: i === 0 ? 0 : 12,
            scale: i === 0 ? 1 : 0.97,
            position: "absolute",
            inset: 0,
            pointerEvents: i === 0 ? "auto" : "none",
          });
      });
      dotRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { backgroundColor: i === 0 ? "#355ACF" : "#D9D9D9" });
      });

      if (prefersReducedMotion) return;

      const scrollDistance = window.innerHeight * (items.length * 0.7);

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${scrollDistance}`,
        pin: pin,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const activeIndex = Math.min(
            items.length - 1,
            Math.floor(self.progress * items.length)
          );
          setActive(activeIndex);
        },
      });

      return () => st.kill();
    }, section);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <div ref={sectionRef} className="relative">
      <div ref={pinRef} className="flex min-h-screen items-center justify-center py-16">
        <div className="container-page w-full">
          <div className="card-surface relative mx-auto h-72 max-w-md p-8 sm:h-80 sm:p-10">
            {items.map((p, i) => (
              <div
                key={p.title}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-10"
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10">
                  <p.icon className="text-primary" size={32} strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold sm:text-2xl">{p.title}</h3>
                <p className="text-sm text-foreground/70 sm:text-base">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {items.map((p, i) => (
              <div
                key={p.title}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="h-2 w-2 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
