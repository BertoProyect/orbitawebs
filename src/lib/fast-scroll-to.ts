import gsap from "gsap";

/**
 * Desplazamiento rápido con animación propia (no el scroll suave nativo del
 * navegador, que es más lento y lineal). Pensado para los CTA de la
 * portada: al pulsar, un "deslizamiento" veloz lleva directo a la sección,
 * en vez del scroll estándar.
 */
export function fastScrollTo(
  e: React.MouseEvent<HTMLAnchorElement>,
  targetId: string,
) {
  e.preventDefault();
  const target = document.querySelector(targetId);
  if (!target) return;

  gsap.to(window, {
    duration: 0.55,
    ease: "power4.inOut",
    scrollTo: { y: target as HTMLElement, offsetY: 0 },
  });

  // Mantiene el hash en la URL para que se pueda compartir/volver al enlace
  // directo, sin provocar un segundo salto de scroll.
  history.pushState(null, "", targetId);
}
