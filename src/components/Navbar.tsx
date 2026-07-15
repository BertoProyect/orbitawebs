import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import isologo from "@/assets/isologo-orbita-webs.png.asset.json";

const logoDesktop = { url: "/logo-orbita-webs-new.png" };

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Proceso" },
  { href: "#contacto", label: "Contacto" },
  { href: "#preguntas", label: "Preguntas" },
];

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 80 && y > lastY) setHidden(true);
      else setHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (panelRef.current) {
      setPanelHeight(panelRef.current.scrollHeight);
    }
  }, [open]);

  // cerrar el menú al pulsar fuera de él
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-[1100px] -translate-x-1/2 transition-all duration-500 ${
        hidden ? "-translate-y-32 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="glass-nav overflow-hidden rounded-[28px]">

        <nav className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3">
          <a href="#inicio" className="flex items-center gap-2 shrink-0" aria-label="Órbita Webs">
            <img
              src={logoDesktop.url}
              alt="Órbita Webs"
              className="hidden h-11 w-auto lg:block"
            />
            <img
              src={isologo.url}
              alt="Órbita Webs"
              className="h-11 w-auto lg:hidden"
            />
            <span className="hidden text-lg font-bold tracking-tight text-foreground sm:inline lg:hidden">
              Órbita Webs
            </span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href="#contacto" className="btn-primary hidden sm:inline-flex !py-2.5 !px-4 text-sm">
              Hablemos
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-transform duration-300 lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <span className="relative grid h-5 w-5 place-items-center">
                <Menu
                  size={20}
                  className={`absolute transition-all duration-300 ${
                    open ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <X
                  size={20}
                  className={`absolute transition-all duration-300 ${
                    open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile dropdown fused inside the same container */}
        <div
          style={{ height: open ? panelHeight : 0 }}
          className="overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden"
          aria-hidden={!open}
        >
          <div ref={panelRef} className="border-t border-white/40 px-3 pb-4 pt-3">
            <ul className="flex flex-col gap-1">
              {links.map((l, i) => (
                <li
                  key={l.href}
                  style={{
                    transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                  }}
                  className={`transform transition-all duration-500 ease-out ${
                    open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                  }`}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/60 hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li
                style={{
                  transitionDelay: open ? `${120 + links.length * 60}ms` : "0ms",
                }}
                className={`pt-2 transform transition-all duration-500 ease-out ${
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                <a
                  href="#contacto"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Hablemos
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
