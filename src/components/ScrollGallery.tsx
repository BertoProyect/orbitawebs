import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export interface PortfolioItem {
  name: string;
  link: string;
  imageMobile: string;
  imageDesktop: string;
}

interface ScrollGalleryProps {
  items: PortfolioItem[];
  title: ReactNode;
}

export function ScrollGallery({ items, title }: ScrollGalleryProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLAnchorElement | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const lastItem = lastItemRef.current;
    if (!wrap || !track) return;

    const ctx = gsap.context(() => {
      let st: ScrollTrigger | undefined;

      const setup = () => {
        st?.kill();
        gsap.set(track, { x: 0 });

        // la ultima foto real termina centrada en la pantalla, no pegada al borde
        let distance = 0;
        if (lastItem) {
          const lastCenter = lastItem.offsetLeft + lastItem.offsetWidth / 2;
          distance = Math.max(lastCenter - wrap.clientWidth / 2, 0);
        } else {
          distance = Math.max(track.scrollWidth - wrap.clientWidth, 0);
        }

        if (distance <= 0) return;

        st = ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: gsap.to(track, {
            x: () => -distance,
            ease: "none",
          }),
        });
      };

      setup();

      // Solo las fotos que se están mostrando: la versión móvil o la de
      // escritorio está oculta con display:none y, al ir con carga diferida,
      // nunca se descarga (esperarla bloquearía el recálculo).
      const imgs = Array.from(track.querySelectorAll("img")).filter(
        (img) => img.getClientRects().length > 0,
      );
      let pending = imgs.filter((img) => !img.complete).length;
      if (pending === 0) {
        ScrollTrigger.refresh();
      } else {
        imgs.forEach((img) => {
          if (!img.complete) {
            img.addEventListener(
              "load",
              () => {
                pending -= 1;
                if (pending <= 0) {
                  setup();
                  ScrollTrigger.refresh();
                }
              },
              { once: true }
            );
          }
        });
      }

      // Solo recalculamos si cambia el ANCHO. En móvil, mostrar/ocultar la
      // barra de direcciones dispara "resize" cambiando solo el alto, y
      // volver a montar el ScrollTrigger en ese momento provoca un salto
      // visible en el scroll.
      let lastWidth = window.innerWidth;
      const onResize = () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        setup();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        st?.kill();
      };
    }, wrap);

    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={wrapRef} className="relative w-full max-w-full overflow-x-hidden">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
        {/* Título: se queda fijo arriba, dentro de la misma pantalla pineada */}
        <div className="container-page shrink-0 pb-2 pt-14 sm:pt-16">{title}</div>

        {/* Pista de fotos: pegada al título, sin centrado vertical excesivo */}
        <div className="flex flex-1 items-start overflow-hidden pt-6 sm:pt-8">
          <div className="flex items-center gap-10 px-[6vw] will-change-transform" ref={trackRef}>
            {items.map((item, i) => (
              <a
                key={item.name}
                ref={i === items.length - 1 ? lastItemRef : undefined}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 flex-col items-center"
                aria-label={item.name}
              >
                <div className="relative">
                  <img
                    src={item.imageDesktop}
                    alt={`Web de ${item.name} diseñada por Órbita Webs (vista escritorio)`}
                    width={1340}
                    height={700}
                    loading="lazy"
                    decoding="async"
                    className="hidden h-[42vh] max-w-[90vw] rounded-2xl object-cover shadow-[3px_5px_30px_rgba(0,0,0,0.22)] sm:block"
                    style={{ aspectRatio: "1340 / 700", width: "auto" }}
                    draggable={false}
                  />
                  <img
                    src={item.imageMobile}
                    alt={`Web de ${item.name} diseñada por Órbita Webs (vista móvil)`}
                    width={720}
                    height={1400}
                    loading="lazy"
                    decoding="async"
                    className="block h-[46vh] max-w-[90vw] rounded-2xl object-cover shadow-[3px_5px_30px_rgba(0,0,0,0.22)] sm:hidden"
                    style={{ aspectRatio: "9 / 17.7", width: "auto" }}
                    draggable={false}
                  />
                  <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-md bg-white/25 text-white backdrop-blur-sm">
                    <ArrowUpRight size={18} strokeWidth={2.25} />
                  </span>
                </div>
                <p className="mt-4 text-center text-lg font-bold text-foreground sm:text-xl">
                  {item.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
