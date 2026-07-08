import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";
import { SpotlightCard } from "@/components/SpotlightCard";

gsap.registerPlugin(ScrollTrigger);

interface GridItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface StaggerGridProps {
  items: GridItem[];
}

export function StaggerGrid({ items }: StaggerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.set(card, { opacity: 0, scale: 0.7 });
        gsap.to(card, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          delay: i * 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <div ref={containerRef} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r, i) => (
        <div
          key={r.title}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          style={{ transformOrigin: "center" }}
        >
          <SpotlightCard
            className="card-surface card-hover flex h-full items-start gap-4 p-6"
            showSpotlight={false}
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <r.icon size={22} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold">{r.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{r.desc}</p>
            </div>
          </SpotlightCard>
        </div>
      ))}
    </div>
  );
}
