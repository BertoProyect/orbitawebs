import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BUSINESS, NAV_LINKS } from "../data/business";
import { useActiveSection } from "../hooks/useActiveSection";
import { scrollToId, WA_GENERIC } from "../lib/links";
import { EASE, Logo, WhatsAppIcon } from "./ui";

const IDS = NAV_LINKS.map((l) => l.id);

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 });
  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-gold-hover via-gold to-gold-light"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  );
}

export function Nav({ ready }: { ready: boolean }) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(IDS);
  const lastY = useRef(0);
  const reduce = useReducedMotion();
  const menuBtn = useRef<HTMLButtonElement>(null);
  const entered = useRef(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > 40);
    const goingDown = y > lastY.current;
    // Se esconde al bajar rápido y vuelve en cuanto subes
    if (Math.abs(y - lastY.current) > 6) setHidden(goingDown && y > window.innerHeight * 0.9);
    lastY.current = y;
  });

  // Menú móvil: bloquea el scroll, cierra con Escape y devuelve el foco
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      menuBtn.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // espera a que se suelte el bloqueo de scroll del menú
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-50"
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={ready ? { y: hidden && !open ? "-110%" : 0, opacity: 1 } : { y: -24, opacity: 0 }}
        transition={{
          duration: ready && !hidden ? 0.9 : 0.5,
          ease: EASE,
          delay: ready && !entered.current ? 1.5 : 0,
        }}
        onAnimationComplete={() => {
          if (ready) entered.current = true;
        }}
      >
        <div
          className={`absolute inset-0 -z-10 border-b transition-[background-color,border-color,backdrop-filter] duration-700 ${
            solid || open
              ? "border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-150"
              : "border-transparent bg-gradient-to-b from-bg/60 to-transparent"
          }`}
        />
        <nav
          aria-label="Principal"
          className="wrap flex h-[var(--nav-h)] items-center justify-between gap-6"
        >
          <a
            href={BUSINESS.base}
            className="relative z-10 rounded-md text-ink"
            aria-label="Lienzo Peluquería, inicio"
            onClick={go("inicio")}
          >
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  aria-current={active === l.id ? "true" : undefined}
                  className={`relative block px-3.5 py-2 text-[0.9rem] transition-colors duration-500 ${
                    active === l.id ? "text-ink" : "text-ink-2/75 hover:text-ink"
                  }`}
                >
                  {l.label}
                  {active === l.id && (
                    <m.span
                      layoutId="nav-active"
                      className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 36 }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#reserva"
              onClick={go("reserva")}
              className="btn btn--primary btn--sm hidden sm:inline-flex"
            >
              Reservar cita
            </a>
            <button
              ref={menuBtn}
              type="button"
              className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-line-strong text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              <AnimatePresence initial={false} mode="wait">
                <m.span
                  key={open ? "x" : "menu"}
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </m.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fixed inset-0 z-40 flex flex-col bg-bg/97 backdrop-blur-xl lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="wrap flex flex-1 flex-col justify-between pb-10 pt-[calc(var(--nav-h)+24px)]">
              <ul className="flex flex-col">
                {[...NAV_LINKS, { id: "reserva", label: "Reservar cita" }].map((l, i) => (
                  <m.li
                    key={l.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.05 }}
                    className="border-b border-line"
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={go(l.id)}
                      className={`flex items-baseline justify-between py-4 text-[1.9rem] font-light tracking-[-0.03em] ${
                        active === l.id ? "text-gold-light" : "text-ink"
                      }`}
                    >
                      {l.label}
                    </a>
                  </m.li>
                ))}
              </ul>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 grid gap-3"
              >
                <a
                  href={WA_GENERIC}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary btn--block"
                >
                  <WhatsAppIcon /> Escribir por WhatsApp
                </a>
                <a href={BUSINESS.phoneHref} className="btn btn--ghost btn--block">
                  Llamar al {BUSINESS.phoneDisplay}
                </a>
              </m.div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
