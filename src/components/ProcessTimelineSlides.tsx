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

interface ProcessTimelineSlidesProps {
  items: ProcessStep[];
}

export function ProcessTimelineSlides({ items }: ProcessTimelineSlidesProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

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
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, {
          position: "absolute",
          inset: 0,
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 24,
        });
      });

      if (prefersReducedMotion) {
        gsap.set(fill, { scaleY: 1 });
        gsap.set(dot, { top: "100%" });
        return;
      }

      const scrollDistance = window.innerHeight * (items.length * 0.9);
      let currentIndex = 0;

      const goTo = (nextIndex: number) => {
        if (nextIndex === currentIndex) return;
        const goingForward = nextIndex > currentIndex;
        const outgoing = slideRefs.current[currentIndex];
        const incoming = slideRefs.current[nextIndex];

        if (outgoing) {
          gsap.to(outgoing, {
            opacity: 0,
            y: goingForward ? -24 : 24,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
          });
        }
        if (incoming) {
          gsap.fromTo(
            incoming,
            { opacity: 0, y: goingForward ? 24 : -24 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", overwrite: true }
          );
        }
        currentIndex = nextIndex;
      };

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

          const activeIndex = Math.min(
            items.length - 1,
            Math.floor(self.progress * items.length)
          );
          goTo(activeIndex);
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

            <div className="relative h-56 flex-1 overflow-hidden sm:h-52">
              {items.map((p, i) => (
                <div
                  key={p.title}
                  ref={(el) => {
                    slideRefs.current[i] = el;
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
