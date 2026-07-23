import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * En escritorio las tarjetas de "Con quién trabajamos" despliegan su foto con
 * :hover. En móvil no hay hover, así que aquí activamos la misma clase
 * (.is-scroll-active) cuando cada tarjeta cruza el centro de la pantalla.
 * Una vez desplegada se queda así aunque sigas bajando; solo se pliega si
 * vuelves a subir por encima de ella.
 */
export function ClientCardScrollReveal() {
  useLayoutEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isDesktop || prefersReducedMotion) return;

    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".client-card")
    );
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      const triggers = cards.map((card) =>
        ScrollTrigger.create({
          trigger: card,
          start: "top 68%",
          end: "bottom 40%",
          onEnter: () => card.classList.add("is-scroll-active"),
          onEnterBack: () => card.classList.add("is-scroll-active"),
          onLeaveBack: () => card.classList.remove("is-scroll-active"),
        })
      );

      return () => triggers.forEach((t) => t.kill());
    });

    return () => ctx.revert();
  }, []);

  return null;
}
