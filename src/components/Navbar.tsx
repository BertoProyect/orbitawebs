import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

// Versiones para fondo oscuro (anillo blanco en vez de negro).
const logoDesktop = { url: "/logo-orbita-webs-dark.webp" };
const isologo = { url: "/isologo-orbita-webs-dark.png" };

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#proceso", label: "Proceso" },
  { href: "#contacto", label: "Contacto" },
  { href: "#preguntas", label: "FAQ" },
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
      className={`fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-[78rem] -translate-x-1/2 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity ${
        hidden ? "-translate-y-32 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="glass-nav overflow-hidden rounded-[22px]">

        <nav className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3">
          <a href="#inicio" className="flex items-center gap-2 shrink-0" aria-label="Órbita Webs">
            <img
              src={logoDesktop.url}
              alt="Órbita Webs"
              width={1200}
              height={180}
              className="hidden h-9 w-auto lg:block"
            />
            <img
              src={isologo.url}
              alt="Órbita Webs"
              width={200}
              height={200}
              className="h-11 w-auto lg:hidden"
            />
            <span className="hidden text-lg font-semibold tracking-tight text-foreground sm:inline lg:hidden">
              Órbita Webs
            </span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href="#contacto" className="btn-primary hidden sm:inline-flex !py-2 !px-4 !text-sm">
              Hablemos
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="grid h-10 w-10 place-items-center rounded-full text-white lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <span className="relative grid h-5 w-5 place-items-center">
                <Menu
                  size={20}
                  className={`absolute transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    open ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <X
                  size={20}
                  className={`absolute transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile dropdown fused inside the same container */}
        <div
          style={{ height: open ? panelHeight : 0 }}
          className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none lg:hidden"
          aria-hidden={!open}
        >
          <div
            ref={panelRef}
            className="border-t border-white/10 px-3 pb-4 pt-3"
          >
            <ul className="flex flex-col gap-1">
              {links.map((l, i) => (
                <li
                  key={l.href}
                  style={{
                    transitionDelay: open ? `${60 + i * 40}ms` : "0ms",
                  }}
                  className={`transform transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                  }`}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li
                style={{
                  transitionDelay: open ? `${60 + links.length * 40}ms` : "0ms",
                }}
                className={`pt-2 transform transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
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
