import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Layout,
  Rocket,
  Wrench,
  Zap,
  Sparkles,
  Smile,
  Search,
  Smartphone,
  MessageCircle,
  Pencil,
  Code2,
  Send,
  Star,
  Mail,
  Plus,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import logo from "@/assets/logo-orbita-webs-original.png.asset.json";
import isologo from "@/assets/isologo-orbita-webs.png.asset.json";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Órbita Webs — Diseño y desarrollo web para negocios" },
      {
        name: "description",
        content:
          "Creamos webs rápidas y profesionales hechas para conseguir clientes.",
      },
      { property: "og:title", content: "Órbita Webs — Diseño y desarrollo web para negocios" },
      {
        property: "og:description",
        content: "Páginas web rápidas, bonitas y pensadas para conseguir clientes.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

const services = [
  {
    icon: Layout,
    title: "Diseño Web",
    desc: "Sitios completos, cuidados hasta el último píxel, con la personalidad de tu negocio.",
  },
  {
    icon: Rocket,
    title: "Landing Pages",
    desc: "Páginas de aterrizaje rápidas y enfocadas en convertir visitas en clientes.",
  },
  {
    icon: Wrench,
    title: "Mantenimiento",
    desc: "Actualizamos, mejoramos y cuidamos tu web para que siempre funcione impecable.",
  },
];

const process = [
  { icon: MessageCircle, title: "Contacto", desc: "Hablamos y entendemos tu proyecto." },
  { icon: Pencil, title: "Diseño", desc: "Damos forma visual a tus ideas." },
  { icon: Code2, title: "Desarrollo", desc: "Construimos con código limpio y rápido." },
  { icon: Send, title: "Lanzamiento", desc: "Publicamos y te acompañamos." },
];

const reasons = [
  { icon: Zap, title: "Webs rápidas", desc: "Rendimiento medido, sin peso innecesario." },
  { icon: Sparkles, title: "Diseño moderno", desc: "Estética actual y coherente con tu marca." },
  { icon: Smile, title: "Sin complicaciones", desc: "Un proceso claro, sin tecnicismos." },
  { icon: MessageCircle, title: "Soporte cercano", desc: "Hablas con quien hace tu web." },
  { icon: Search, title: "Optimización SEO", desc: "Preparada para que te encuentren." },
  { icon: Smartphone, title: "Adaptadas al móvil", desc: "Perfectas en cualquier pantalla." },
];

const portfolio = [
  { name: "Café Aurora", type: "Restaurante", hue: "#e8d5c4" },
  { name: "Estudio Nueve", type: "Arquitectura", hue: "#d6e4ea" },
  { name: "Marea Salón", type: "Peluquería", hue: "#cddbe8" },
  { name: "Taller Norte", type: "Automoción", hue: "#dcdce4" },
];

const testimonials = [
  {
    name: "Lucía Márquez",
    biz: "Panadería Ondina",
    quote:
      "Nos hicieron una web preciosa y ahora recibimos pedidos cada semana. Trato cercano y muy profesional.",
    initials: "LM",
  },
  {
    name: "Javier Ruiz",
    biz: "Estudio Nueve",
    quote:
      "Cuidan cada detalle. Se nota que aman lo que hacen. La web transmite exactamente lo que somos.",
    initials: "JR",
  },
  {
    name: "Marta Delgado",
    biz: "Clínica Serena",
    quote:
      "Rápidos, claros y con muchísimo gusto. Repetiría sin dudarlo. Muy recomendables.",
    initials: "MD",
  },
];

const faqs = [
  {
    q: "¿Cuánto tarda mi web?",
    a: "Depende del proyecto, pero una landing suele estar lista en 2 semanas y una web completa entre 4 y 6.",
  },
  {
    q: "¿Cuánto cuesta una web?",
    a: "Cada proyecto es único. Nos cuentas lo que necesitas y te pasamos un presupuesto claro y sin sorpresas.",
  },
  {
    q: "¿Puedo actualizarla yo después?",
    a: "Sí. Preparamos la web para que puedas modificar textos e imágenes sin conocimientos técnicos.",
  },
  {
    q: "¿Trabajáis con negocios fuera de Huelva?",
    a: "Por supuesto. Trabajamos con clientes de toda España de forma 100% online.",
  },
  {
    q: "¿Qué incluye el mantenimiento?",
    a: "Copias de seguridad, actualizaciones, mejoras de rendimiento y soporte por email o WhatsApp.",
  },
];

function Landing() {
  return (
    <main className="relative z-[2] overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section
        id="inicio"
        className="container-page relative pt-28 pb-16 sm:pt-32"
      >
        <div className="w-full">
          <Reveal delay={80}>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-[7rem]">
              webs que generan{" "}
              <span className="hero-gradient-text">clientes</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#contacto" className="btn-primary">
                Quiero mi web <ArrowRight size={18} />
              </a>
              <a href="#proceso" className="btn-ghost">
                Ver cómo trabajamos
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Servicios
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Todo lo que tu negocio necesita en la web.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <article className="card-surface card-hover h-full p-8">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:rotate-6">
                  <s.icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 text-foreground/70">{s.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROCESO */}
      <section id="proceso" className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Proceso
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Simple, claro y sin sorpresas.
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-16">
          {/* connector line desktop */}
          <div
            className="pointer-events-none absolute left-8 right-8 top-8 hidden h-px md:block"
            style={{
              background:
                "linear-gradient(to right, rgba(53,90,207,0.35), rgba(53,90,207,0.15))",
            }}
          />
          <ol className="grid gap-6 md:grid-cols-4">
            {process.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <li className="card-surface relative p-7">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <p.icon className="text-primary" size={22} strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{p.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Por qué elegirnos
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Detalles que marcan la diferencia.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 100}>
              <div className="card-surface card-hover flex h-full items-start gap-4 p-6">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <r.icon size={22} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{r.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{r.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Portfolio
              </p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
                Proyectos recientes.
              </h2>
            </div>
            <p className="text-foreground/60">Selección de trabajos.</p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {portfolio.map((p, i) => (
            <Reveal key={p.name} delay={(i % 2) * 100}>
              <a href="#contacto" className="group block">
                <div className="card-surface overflow-hidden p-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_30px_50px_-30px_rgba(53,90,207,0.35)]">
                  <div
                    className="aspect-[4/3] w-full overflow-hidden rounded-2xl"
                    style={{ backgroundColor: p.hue }}
                  >
                    <div className="grid h-full w-full place-items-center transition-transform duration-700 group-hover:scale-[1.03]">
                      <img
                        src={isologo.url}
                        alt=""
                        className="h-24 w-24 opacity-70"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-5">
                    <div>
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <p className="text-sm text-foreground/60">{p.type}</p>
                    </div>
                    <ArrowRight
                      className="text-primary transition-transform duration-500 group-hover:translate-x-1"
                      size={20}
                    />
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Testimonios
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Lo que dicen quienes ya trabajan con nosotros.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="card-surface card-hover flex h-full flex-col p-7">
                <div className="flex gap-0.5 text-primary" aria-label="5 estrellas">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-foreground/80">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-foreground/60">{t.biz}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="preguntas" className="container-page py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Preguntas
              </p>
              <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
                Todo lo que sueles preguntar.
              </h2>
              <p className="mt-6 text-foreground/70">
                ¿Tienes otra duda? Escríbenos y te respondemos rápido.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card-surface divide-y divide-[color:var(--color-border)] overflow-hidden">
              {faqs.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contacto" className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="card-surface relative overflow-hidden px-6 py-20 text-center sm:px-14 sm:py-28">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Contacto
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-[1.05] sm:text-6xl">
              ¿Hablamos sobre tu proyecto?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-foreground/70">
              Cuéntanos qué necesitas. Te respondemos en menos de 24 horas.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:websorbita@gmail.com"
              className="btn-primary !px-8 !py-4 text-base"
            >
              Solicitar presupuesto <ArrowRight size={18} />
            </a>
            <a
              href="https://wa.me/34959807018?text=Hola%2C%20he%20visto%20vuestra%20web%20y%20me%20interesa%20tener%20algo%20parecido%20para%20mi%20negocio.%20%C2%BFPod%C3%A9is%20contarme%20c%C3%B3mo%20trabaj%C3%A1is%3F"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !px-8 !py-4 text-base"
            >
              Escribir por WhatsApp
            </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="container-page pb-14">
        <div className="card-surface flex flex-col gap-8 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="Órbita Webs" className="h-8 w-auto" />
          </div>
          <div className="grid gap-3 text-sm text-foreground/70 sm:grid-cols-3 sm:gap-8">
            <a
              href="mailto:websorbita@gmail.com"
              className="flex items-center gap-2 hover:text-primary"
            >
              <Mail size={16} /> websorbita@gmail.com
            </a>
            <a
              href="https://wa.me/34959807018?text=Hola%2C%20he%20visto%20vuestra%20web%20y%20me%20interesa%20tener%20algo%20parecido%20para%20mi%20negocio.%20%C2%BFPod%C3%A9is%20contarme%20c%C3%B3mo%20trabaj%C3%A1is%3F"
              className="flex items-center gap-2 hover:text-primary"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={16} /> Huelva, España
            </span>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-foreground/50">
          © {new Date().getFullYear()} Órbita Webs. Todos los derechos reservados.
        </p>
      </footer>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-primary/5 sm:px-8"
        aria-expanded={open}
      >
        <span className="text-base font-semibold sm:text-lg">{q}</span>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform duration-500"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <Plus size={16} />
        </span>
      </button>
      <div
        className="grid overflow-hidden px-6 transition-[grid-template-rows,opacity,padding] duration-500 ease-out sm:px-8"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          paddingBottom: open ? "1.25rem" : "0",
        }}
      >
        <div className="min-h-0">
          <p className="text-foreground/70">{a}</p>
        </div>
      </div>
    </div>
  );
}
