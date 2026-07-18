import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface StackItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface DepthStackProps {
  items: StackItem[];
}

export function DepthStack({ items }: DepthStackProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        gsap.set(card, {
          y: i === 0 ? 0 : 60,
          scale: 1 - i * 0.04,
          opacity: i === 0 ? 1 : 0,
          zIndex: cards.length - i,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          pin: wrap.querySelector(".depth-stack-sticky"),
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => {
        if (i === 0) return;
        const prev = cards[i - 1];
        tl.to(
          prev,
          {
            y: -40,
            scale: 0.92,
            opacity: 0,
            filter: "blur(4px)",
            duration: 1,
            ease: "power1.inOut",
          },
          i - 1
        );
        tl.fromTo(
          card,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power1.inOut",
          },
          i - 1
        );
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    }, wrap);

    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={wrapRef} className="relative" style={{ height: `${items.length * 62}vh` }}>
      <div className="depth-stack-sticky sticky top-0 grid h-[100dvh] place-items-center [perspective:1500px]">
        {items.map((item, i) => (
          <div
            key={item.title}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="card-surface absolute w-[min(560px,86vw)] p-8 sm:p-10 shadow-[inset_0_0_0_1px_var(--color-border),0_40px_80px_rgba(26,26,46,0.18)] will-change-transform"
          >
            <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <item.icon size={26} strokeWidth={1.75} />
            </div>
            <h3 className="mt-6 text-2xl sm:text-3xl font-bold">{item.title}</h3>
            <p className="mt-3 text-base text-foreground/70 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
