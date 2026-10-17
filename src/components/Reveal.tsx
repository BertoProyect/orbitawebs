import { useEffect, useRef, useState } from "react";

/**
 * Entrada suave de un bloque al llegar a él con el scroll.
 *
 * - Visible por defecto: el HTML del servidor no lleva opacity 0, así que el
 *   contenido se ve aunque el JavaScript tarde o falle (y Google lo ve).
 * - Solo se "arma" (se oculta para animarlo) si al montar está por debajo de
 *   la pantalla; lo que ya está a la vista no parpadea.
 * - Con "reducir movimiento" solo hace un fundido, sin desplazamiento.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "armed" | "shown">("idle");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // ya visible
    setState("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = state === "armed";
  return (
    <div
      ref={ref}
      className={className}
      style={
        state === "idle"
          ? undefined
          : {
              transition: reduced
                ? "opacity 300ms ease-out"
                : "opacity 520ms cubic-bezier(0.23,1,0.32,1), transform 520ms cubic-bezier(0.23,1,0.32,1)",
              transitionDelay: `${delay}ms`,
              opacity: hidden ? 0 : 1,
              transform: hidden && !reduced ? "translateY(14px)" : "none",
            }
      }
    >
      {children}
    </div>
  );
}
