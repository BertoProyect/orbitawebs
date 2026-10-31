import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { scrollToId, WA_GENERIC } from "../lib/links";
import { EASE, WhatsAppIcon } from "./ui";

/* Botón de WhatsApp, volver arriba y barra fija de reserva en móvil.
   Se apartan cuando la reserva o el pie están en pantalla. */
export function Floating({ ready }: { ready: boolean }) {
  const { scrollY } = useScroll();
  const [past, setPast] = useState(false);
  const [far, setFar] = useState(false);
  const [endVisible, setEndVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setPast(y > window.innerHeight * 0.75);
    setFar(y > window.innerHeight * 1.6);
  });

  useEffect(() => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        setEndVisible(seen.size > 0);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    // Espera a que existan en el DOM
    const t = window.setTimeout(() => {
      ["reserva", "pie"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 100);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);

  const showFab = ready && past && !endVisible;
  const showBar = ready && past && !endVisible;

  return (
    <>
      {/* Escritorio y tableta: botones flotantes */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 md:flex">
        <AnimatePresence>
          {ready && far && (
            <m.button
              key="top"
              type="button"
              aria-label="Volver arriba"
              onClick={() => scrollToId("inicio")}
              className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-line-strong bg-bg/70 text-ink backdrop-blur-md transition-colors duration-500 hover:border-gold hover:text-gold-light"
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <ArrowUp className="h-5 w-5" />
            </m.button>
          )}
          {showFab && (
            <m.a
              key="wa"
              href={WA_GENERIC}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir a Lienzo por WhatsApp"
              className="group pointer-events-auto flex h-14 items-center gap-0 overflow-hidden rounded-full bg-gold pl-4 pr-4 text-bg shadow-[0_18px_40px_-14px_rgb(217_197_154/0.6)] transition-[background-color,gap,padding] duration-500 hover:gap-2.5 hover:bg-gold-light hover:pr-5"
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <WhatsAppIcon className="h-6 w-6 shrink-0" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width] duration-500 group-hover:max-w-[10rem]">
                Escríbenos
              </span>
            </m.a>
          )}
        </AnimatePresence>
      </div>

      {/* Móvil: barra fija abajo */}
      <AnimatePresence>
        {showBar && (
          <m.div
            key="bar"
            className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 px-4 pt-3 backdrop-blur-xl md:hidden"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="flex items-center gap-2.5">
              <a
                href="#reserva"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("reserva");
                }}
                className="btn btn--primary flex-1"
              >
                Reservar cita
              </a>
              <a
                href={WA_GENERIC}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escribir por WhatsApp"
                className="btn btn--ghost w-[52px] shrink-0 px-0"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
