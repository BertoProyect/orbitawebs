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

interface ProcessTimelineProps {
  items: ProcessStep[];
}

export function ProcessTimeline({ items }: ProcessTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const fill = fillRef.current;
    const dot = dotRef.current;
    if (!section || !pin || !fill || !dot) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(fill, { scaleY: 1 });
        gsap.set(dot, { top: "100%" });
        itemRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 1, scale: 1 });
        });
        return;
      }

      const scrollDistance = window.innerHeight * (items.length * 0.9);

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${scrollDistance}`,
        pin: pin,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress });
          gsap.set(dot, { top: `${self.progress * 100}%` });
        },
      });

      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = i / items.length;
        gsap.set(el, { opacity: 0, scale: 0.85 });

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${scrollDistance}`,
          onUpdate: (self) => {
            if (self.progress >= start - 0.02) {
              gsap.to(el, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            } else {
              gsap.to(el, {
                opacity: 0,
                scale: 0.85,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
              });
            }
          },
        });
      });

      return () => st.kill();
    }, section);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <div ref={sectionRef} className="relative">
      <div ref={pinRef} className="flex min-h-screen items-center py-16">
        <div className="container-page w-full">
          <div className="mx-auto flex max-w-2xl gap-8 sm:gap-12">
            <div className="relative w-1 flex-shrink-0 self-stretch">
              <div className="absolute inset-0 rounded-full bg-white" />
              <div
                ref={fillRef}
                className="absolute inset-x-0 top-0 origin-top rounded-full"
                style={{ height: "100%", background: "#355ACF", transform: "scaleY(0)" }}
              />
              <div
                ref={dotRef}
                className="absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md"
                style={{ background: "#355ACF", top: "0%" }}
              />
            </div>

            <div className="flex flex-1 flex-col gap-16 py-2 sm:gap-24">
              {items.map((p, i) => (
                <div
                  key={p.title}
                  ref={(el) => {
                    itemRefs.current[i] = el;
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
