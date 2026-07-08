import { useRef, useState, type PropsWithChildren, type MouseEventHandler } from "react";

interface TiltCardProps extends PropsWithChildren {
  className?: string;
  /** Grados máximos de inclinación. Sutil por defecto para no dificultar la lectura de texto. */
  maxTilt?: number;
}

/**
 * Tarjeta que se inclina en 3D siguiendo la posición del ratón/dedo, con un
 * pequeño efecto de profundidad (translateZ) en el contenido interior.
 * Adaptado de react-bits (TiltedCard) a una versión ligera sin framer-motion,
 * pensada para tarjetas con texto (testimonios) en vez de imágenes.
 */
export function TiltCard({ children, className = "", maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotateX = (offsetY / (rect.height / 2)) * -maxTilt;
    const rotateY = (offsetX / (rect.width / 2)) * maxTilt;

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: "transform 80ms ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </div>
  );
}
