import { useEffect, useRef, useState, type PropsWithChildren, type MouseEventHandler } from "react";

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends PropsWithChildren {
  className?: string;
}

/**
 * Tarjeta con una mancha de luz radial (azul de marca) que sigue al cursor/dedo.
 * Adaptado de react-bits (SpotlightCard) a la paleta cerrada de Órbita Webs.
 */
export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };
  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };
  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  // Equivalente táctil: la mancha de luz sigue al dedo al deslizar sobre la
  // tarjeta. Usamos Pointer Events (no Touch Events) porque GSAP tiene
  // activado ScrollTrigger.normalizeScroll() en móvil para el scroll suave,
  // y eso intercepta los eventos touch* de toda la página en cuanto detecta
  // un gesto de deslizamiento, congelando la posición. Los Pointer Events no
  // se ven afectados por esa normalización. En ningún momento llamamos a
  // preventDefault, así el scroll de la página nunca se interrumpe.
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const updateFromPointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      updateFromPointer(e);
      setOpacity(1);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      updateFromPointer(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      setOpacity(0);
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(53, 90, 207, 0.55) 0%, rgba(53, 90, 207, 0.25) 25%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
