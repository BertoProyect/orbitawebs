import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-orbita-webs.png.asset.json";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Proceso" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <header
      className={`fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-[1100px] -translate-x-1/2 transition-all duration-500 ${
        hidden ? "-translate-y-48 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <nav className="glass-nav flex items-center justify-between rounded-full px-4 py-4 sm:px-5 sm:py-5">
        <a href="#inicio" className="flex items-center gap-2 shrink-0" aria-label="Órbita Webs">
          <img src={logo.url} alt="Órbita Webs" className="h-28 w-auto sm:h-36" />
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
            className="grid h-10 w-10 place-items-center rounded-full text-foreground lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass-nav mt-2 rounded-3xl p-4 lg:hidden">
          <a href="#inicio" onClick={() => setOpen(false)} className="mb-2 flex items-center gap-2 px-2 py-2">
            <img src={logo.url} alt="Órbita Webs" className="h-28 w-auto" />
          </a>
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground hover:bg-white/60"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-1">
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
      )}
    </header>
  );
}
