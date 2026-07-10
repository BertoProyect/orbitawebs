import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface PortfolioItem {
  name: string;
  link: string;
  imageMobile: string;
  imageDesktop: string;
}

interface ScrollGalleryProps {
  items: PortfolioItem[];
}

export function ScrollGallery({ items }: ScrollGalleryProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const ctx = gsap.context(() => {
      gsap.set(track, { x: 0 });

      const tween = gsap.to(track, {
        x: () =>
          -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.1),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, wrap);

    return () => ctx.revert();
  }, [items]);

  // repetimos el primer item al final para que la última captura visible
  // asome cortada por el margen derecho de forma natural
  const displayItems = items.length > 0 ? [...items, items[0]] : items;

  return (
    <div ref={wrapRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-10 pl-[6vw] pr-[10vw] will-change-transform"
        >
          {displayItems.map((item, i) => (
            <a
              key={`${item.name}-${i}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block shrink-0"
              aria-label={item.name}
            >
              <img
                src={item.imageDesktop}
                alt={item.name}
                className="hidden h-[58vh] max-w-[80vw] rounded-2xl object-cover shadow-[0_30px_60px_rgba(26,26,46,0.25)] sm:block"
                style={{ aspectRatio: "1340 / 700", width: "auto" }}
                draggable={false}
              />
              <img
                src={item.imageMobile}
                alt={item.name}
                className="block h-[62vh] max-w-[80vw] rounded-2xl object-cover shadow-[0_20px_40px_rgba(26,26,46,0.25)] sm:hidden"
                style={{ aspectRatio: "9 / 17.7", width: "auto" }}
                draggable={false}
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
