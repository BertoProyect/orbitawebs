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
import { ParticleTextEffect } from "@/components/ParticleTextEffect";
import { InteractiveRobotSpline } from "@/components/InteractiveRobotSpline";
import { ProcessLineReveal } from "@/components/ProcessLineReveal";
import { IncludesCinematic } from "@/components/IncludesCinematic";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TiltCard } from "@/components/TiltCard";
import { ScrollGallery } from "@/components/ScrollGallery";
const logo = { url: "/logo-orbita-webs-new.png" };

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Orbita Webs" },
      {
        name: "description",
        content:
          "Webs hechas para conseguir clientes.",
      },
      { property: "og:title", content: "Orbita Webs" },
      {
        property: "og:description",
        content: "Webs hechas para conseguir clientes.",
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
  { icon: MessageCircle, title: "Vemos tu negocio primero", desc: "Te mostramos una demo gratuita de tu web, hecha a partir de tu propio negocio." },
  { icon: Pencil, title: "Lo afinamos juntos", desc: "En una llamada ajustamos cada detalle contigo, hasta que la web sea exactamente la que quieres." },
  { icon: Code2, title: "Empezamos a construir", desc: "Con todo aprobado, arrancamos la programación de tu web." },
  { icon: Wrench, title: "La hacemos realidad", desc: "Damos forma a cada sección con cuidado, paso a paso, hasta tenerla lista." },
  { icon: Send, title: "Tu web sale a trabajar", desc: "La publicamos y queda lista para atraer clientes. Y si después quieres ajustar algún detalle, es completamente gratis." },
];

const reasons = [
  { icon: Zap, title: "Webs rápidas", desc: "Rendimiento medido, sin peso innecesario." },
  { icon: MessageCircle, title: "Soporte cercano", desc: "Hablas con quien hace tu web." },
  { icon: Search, title: "Optimización SEO", desc: "Preparada para que te encuentren." },
  { icon: Smartphone, title: "Perfecta en cualquier pantalla", desc: "Se ve impecable en el móvil y en el ordenador." },
  { icon: Sparkles, title: "Animación de bienvenida incluida", desc: "Cada web incluye una animación de entrada cuidada, de serie." },
  { icon: Smile, title: "Informe semanal de progreso", desc: "Cada semana te contamos en qué hemos avanzado en tu proyecto." },
];

const portfolio = [
  {
    name: "Naturaleza y Viajes",
    link: "https://naturalezayviajes.com/",
    imageMobile: "/portfolio/naturaleza-y-viajes.jpg",
    imageDesktop: "/portfolio/naturaleza-desktop.jpg",
  },
  {
    name: "Berto Project",
    link: "https://bertoproject.lovable.app/",
    imageMobile: "/portfolio/berto-project.jpg",
    imageDesktop: "/portfolio/berto-desktop.jpg",
  },
  {
    name: "Goiko",
    link: "https://www.goiko.com/es/",
    imageMobile: "/portfolio/goiko.jpg",
    imageDesktop: "/portfolio/goiko-desktop.jpg",
  },
  {
    name: "Vicio",
    link: "https://vicio.com/",
    imageMobile: "/portfolio/vicio.jpg",
    imageDesktop: "/portfolio/vicio-desktop.jpg",
  },
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
    a: "Sí, simplemente nos contactas por email o WhatsApp y en 24 horas está publicado.",
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
            <h1 className="text-6xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-[7rem]">
              Webs que generan
            </h1>
            <ParticleTextEffect
              words={["CLIENTES"]}
              className="-ml-2 mt-1 h-[110px] w-[420px] sm:h-[140px] sm:w-[540px] lg:h-[170px] lg:w-[640px]"
            />
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

      {/* ROBOT 3D INTERACTIVO */}
      <section className="container-page pb-16 sm:pb-24">
        <Reveal delay={100}>
          <div className="card-surface relative overflow-hidden">
            <div className="relative z-10 px-6 pt-8 sm:px-10 sm:pt-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Interactivo
              </p>
              <h2 className="mt-2 max-w-md text-2xl font-bold sm:text-3xl">
                Así de vivas quedan las webs que hacemos.
              </h2>
            </div>
            <div className="h-[380px] w-full sm:h-[460px]">
              <InteractiveRobotSpline
                scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                className="h-full w-full"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Servicios
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Todo lo que tu negocio necesita.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <SpotlightCard className="card-surface card-hover h-full p-8">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:rotate-6">
                  <s.icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 text-foreground/70">{s.desc}</p>
              </SpotlightCard>
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

        <ProcessLineReveal items={process} />
      </section>

      {/* QUÉ INCLUYE TU WEB */}
      <section className="relative">
        <IncludesCinematic />
      </section>

      {/* PORTFOLIO */}
      <section className="relative">
        <ScrollGallery
          title={
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
              </div>
            </Reveal>
          }
          items={portfolio}
        />
      </section>

      {/* TESTIMONIOS */}
      <section className="container-page pt-10 pb-24 sm:pt-14 sm:pb-32">
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
              <TiltCard className="card-surface card-hover flex h-full flex-col p-7">
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
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contacto" className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="card-surface contact-card-glow relative overflow-hidden px-6 py-20 text-center sm:px-14 sm:py-28">
            <div className="contact-card-blob pointer-events-none absolute" />
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
                <FaqItem
                  key={i}
                  q={f.q}
                  a={f.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="container-page pb-14">
        <div className="card-surface flex w-full flex-col gap-8 px-6 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 md:flex-row md:items-center md:justify-between md:gap-12 md:p-10">
          <div className="flex items-center justify-start pl-6 md:pl-0">
            <img
              src={logo.url}
              alt="Órbita Webs"
              className="h-auto w-52 sm:w-60 md:w-72 lg:w-80"
            />
          </div>

          <div className="flex flex-col items-start gap-3 pl-6 text-sm text-foreground/70 md:items-start md:pl-0 md:gap-4">
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

function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
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
