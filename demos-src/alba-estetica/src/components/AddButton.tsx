import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { getTreatment, treatmentLabel } from "../data/treatments";
import { useCita } from "../state/cita";

/* Añadir / quitar un tratamiento de la cita. El icono gira de + a ✓ y el botón da un pequeño
   «latido» al añadir. */
export function AddButton({
  id,
  size = "md",
  dark = false,
  className = "",
}: {
  id: string;
  size?: "md" | "lg";
  dark?: boolean;
  className?: string;
}) {
  const { has, toggle } = useCita();
  const reduce = useReducedMotion();
  const on = has(id);
  const t = getTreatment(id);
  const name = t ? treatmentLabel(t) : id;
  const base =
    size === "lg"
      ? "h-12 px-5 text-[0.9375rem]"
      : "h-11 px-4 text-[0.8125rem]";
  const tone = dark
    ? on
      ? "bg-plum-light text-night border-plum-light"
      : "border-white/30 text-white hover:border-white"
    : on
      ? "bg-plum text-white border-plum"
      : "border-line-strong text-ink hover:border-plum hover:text-plum";
  return (
    <m.button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={on}
      aria-label={on ? `Quitar ${name} de mi cita` : `Añadir ${name} a mi cita`}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      animate={on && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative inline-flex shrink-0 items-center gap-2 rounded-full border font-semibold transition-colors duration-300 ${base} ${tone} ${className}`}
    >
      <span className="relative grid h-4 w-4 place-items-center" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {on ? (
            <m.span
              key="on"
              initial={reduce ? false : { rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              className="absolute"
            >
              <Check size={15} strokeWidth={2.4} />
            </m.span>
          ) : (
            <m.span
              key="off"
              initial={reduce ? false : { rotate: 90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              className="absolute"
            >
              <Plus size={15} strokeWidth={2.2} />
            </m.span>
          )}
        </AnimatePresence>
      </span>
      <span>{on ? "En tu cita" : "Añadir"}</span>
    </m.button>
  );
}
