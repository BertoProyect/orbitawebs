import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "../data/business";
import { useActiveSection } from "../hooks/useActiveSection";
import { scrollToId, WA_GENERIC } from "../lib/links";
import { useCita } from "../state/cita";
import { EASE, Wordmark } from "./ui";

export const NAV = [
  { id: "inicio", label: "Inicio" },
  { id: "tratamientos", label: "Tratamientos" },
  { id: "laser", label: "Depilación láser" },
  { id: "equipo", label: "El equipo" },
  { id: "opiniones", label: "Opiniones" },
  { id: "contacto", label: "Contacto" },
];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, mass: 0.3 });
  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-plum"
      style={{ scaleX }}
    />
  );
}

export function Nav({ ready }: { ready: boolean }) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(NAV.map((n) => n.id));
  const reduce = useReducedMotion();
  const { ids, openPanel } = useCita();
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Transparente sobre la portada, superficie de cristal cálido al bajar
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > Math.min(window.innerHeight * 0.55, 520);
    setSolid((s) => (s === next ? s : next));
  });
  useEffect(() => {
    setSolid(window.scrollY > Math.min(window.innerHeight * 0.55, 520));
  }, []);

  // Menú móvil: bloquea el scroll del fondo y se cierra con Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const light = !solid && !open; // texto blanco sobre la foto
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <m.header
      className="fixed inset-x-0 top-0 z-50"
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
    >
      <div
        className={`absolute inset-0 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid && !open
            ? "border-b border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent"
        }`}
        aria-hidden="true"
      />
      <div className="wrap relative flex h-[var(--nav-h)] items-center gap-6">
        <a
          href="#inicio"
          onClick={go("inicio")}
          className={`relative z-10 -my-2 py-2 transition-colors duration-500 ${light ? "text-white" : "text-ink"}`}
          aria-label="Alba Estética, inicio"
        >
          <Wordmark light={light} />
        </a>

        <nav aria-label="Principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={go(n.id)}
                  aria-current={active === n.id ? "true" : undefined}
                  className={`relative block px-3.5 py-2.5 text-[0.875rem] font-medium transition-colors duration-500 ${
                    light ? "text-white/85 hover:text-white" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {n.label}
                  {active === n.id && (
                    <m.span
                      layoutId="nav-dot"
                      className={`absolute bottom-0.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full ${
                        light ? "bg-white" : "bg-plum"
                      }`}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-2 lg:ml-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openPanel();
            }}
            className={`btn btn-sm ${light ? "btn-light" : "btn-primary"}`}
          >
            Pedir cita
            <AnimatePresence initial={false}>
              {ids.length > 0 && (
                <m.span
                  key={ids.length}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className={`grid h-[22px] min-w-[22px] place-items-center rounded-full px-1.5 text-[0.75rem] font-bold tabular-nums ${
                    light ? "bg-plum text-white" : "bg-white text-plum"
                  }`}
                  aria-label={`${ids.length} en tu cita`}
                >
                  {ids.length}
                </m.span>
              )}
            </AnimatePresence>
          </button>
          <button
            ref={menuBtn}
            type="button"
            className={`grid h-11 w-11 place-items-center rounded-full transition-colors duration-500 lg:hidden ${
              light ? "text-white" : "text-ink"
            }`}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="menu-movil"
            className="fixed inset-0 -z-10 flex flex-col bg-bg pt-[calc(var(--nav-h)+24px)] lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <nav aria-label="Menú" className="wrap flex-1 overflow-y-auto">
              <ul>
                {NAV.map((n, i) => (
                  <li key={n.id} className="border-b border-line">
                    <m.a
                      href={`#${n.id}`}
                      onClick={go(n.id)}
                      className="display flex items-baseline justify-between py-4 text-[clamp(2rem,9vw,3rem)]"
                      initial={reduce ? false : { y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.12 + i * 0.05 }}
                    >
                      {n.label}
                      <span className="font-sans text-xs tabular-nums text-muted">0{i + 1}</span>
                    </m.a>
                  </li>
                ))}
              </ul>
            </nav>
            <m.div
              className="wrap flex flex-col gap-3 pb-[max(24px,env(safe-area-inset-bottom))] pt-6"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <a href={WA_GENERIC} target="_blank" rel="noopener" className="btn btn-primary w-full">
                Pedir cita por WhatsApp
              </a>
              <a href={BUSINESS.phoneHref} className="btn btn-ghost w-full">
                Llamar al {BUSINESS.phoneDisplay}
              </a>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
