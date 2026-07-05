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

interface ProcessScrollTextProps {
  items: ProcessStep[];
}

export function ProcessScrollText({ items }: ProcessScrollTextProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);
  const descRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        lineRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0.3, color: i === 0 ? "#355ACF" : "#1A1A2E" });
        });
        descRefs.current.forEach((el, i) => {
          if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, height: i === 0 ? "auto" : 0 });
        });
        return;
      }

      const scrollDistance = window.innerHeight * (items.length * 1.1);

      const setActive = (activeIndex: number) => {
        lineRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            opacity: i === activeIndex ? 1 : 0.25,
            color: i === activeIndex ? "#355ACF" : "#1A1A2E",
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
        });
        descRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            opacity: i === activeIndex ? 1 : 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
        });
      };

      lineRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0.25, color: i === 0 ? "#355ACF" : "#1A1A2E" });
      });
      descRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0 });
      });

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
      <div ref={pinRef} className="flex min-h-screen items-center py-16">
        <div className="container-page w-full">
          <div className="mx-auto flex max-w-3xl flex-col gap-8 sm:gap-10">
            {items.map((p, i) => (
              <div key={p.title}>
                <div
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  className="flex items-center gap-4 text-2xl font-bold sm:text-4xl"
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground sm:h-11 sm:w-11">
                    {i + 1}
                  </span>
                  <span>{p.title}</span>
                </div>
                <p
                  ref={(el) => {
                    descRefs.current[i] = el;
                  }}
                  className="mt-2 pl-13 text-base text-foreground/70 sm:pl-16 sm:text-lg"
                  style={{ opacity: 0 }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
