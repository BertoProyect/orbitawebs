import { m, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useFinePointer } from "../hooks/useMediaQuery";

/* Anillo que sigue al ratón (solo escritorio). El cursor del sistema se queda tal cual:
   esto acompaña, no sustituye. Crece sobre lo que se puede pulsar. */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 40, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 520, damping: 40, mass: 0.35 });
  const [hover, setHover] = useState(false);
  const [shown, setShown] = useState(false);
  const on = fine && !reduce;

  useEffect(() => {
    if (!on) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setShown(true);
      const t = e.target as Element | null;
      const h = !!t?.closest?.("a, button, [role='tab'], [role='radio'], label, input, summary, [data-cursor]");
      setHover((p) => (p === h ? p : h));
    };
    const leave = () => setShown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [on, x, y]);

  if (!on) return null;
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[80] mix-blend-multiply"
      style={{ x: sx, y: sy }}
    >
      <m.div
        className="-ml-4 -mt-4 h-8 w-8 rounded-full border border-plum/50"
        animate={{ scale: hover ? 1.6 : 1, opacity: shown ? 1 : 0, backgroundColor: hover ? "rgba(250,233,237,0.7)" : "rgba(250,233,237,0)" }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      />
    </m.div>
  );
}
