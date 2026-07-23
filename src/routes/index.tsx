import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Wrench,
  Sparkles,
  Smile,
  MessageCircle,
  Pencil,
  Code2,
  Send,
  Star,
  Mail,
  Plus,
  MapPin,
  Scissors,
  Stethoscope,
  UtensilsCrossed,
  Camera,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { InteractiveRobot3D } from "@/components/InteractiveRobot3D";
import { ProcessLineReveal } from "@/components/ProcessLineReveal";
import { IncludesCinematic } from "@/components/IncludesCinematic";
import { SpotlightCard } from "@/components/SpotlightCard";
import { ScrollGallery } from "@/components/ScrollGallery";
import { ClientCardScrollReveal } from "@/components/ClientCardScrollReveal";
const logo = { url: "/logo-orbita-webs-new.png" };

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Orbita Webs" },
      {
        name: "description",
        content:
          "Tu negocio merece una web a la altura.",
      },
      { property: "og:title", content: "Orbita Webs" },
      {
        property: "og:description",
        content: "Tu negocio merece una web a la altura.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

const clients = [
  { icon: Scissors, title: "Peluquerías y barberías", photo: "/negocios/peluqueria.jpg", focal: "center 55%" },
  { icon: Sparkles, title: "Centros de estética", photo: "/negocios/estetica.jpg", focal: "75% 60%" },
  { icon: Stethoscope, title: "Clínicas dentales", photo: "/negocios/dental.jpg", focal: "65% 50%" },
  { icon: UtensilsCrossed, title: "Bares y restaurantes", photo: "/negocios/restaurante.jpg", focal: "center 60%" },
  { icon: Camera, title: "Fotógrafos", photo: "/negocios/fotografo.jpg", focal: "55% 40%" },
  { icon: ShoppingBasket, title: "Tiendas de alimentación", photo: "/negocios/alimentacion.jpg", focal: "55% 60%" },
  { icon: Store, title: "Tiendas en general", photo: "/negocios/tienda.jpg", focal: "45% 55%" },
];

const process = [
  { icon: MessageCircle, title: "Vemos tu negocio primero", desc: "Te mostramos una demo gratuita de tu web, hecha a partir de tu propio negocio." },
  { icon: Pencil, title: "Lo afinamos juntos", desc: "En una llamada ajustamos cada detalle contigo, hasta que la web sea exactamente la que quieres." },
  { icon: Code2, title: "Empezamos a construir", desc: "Con todo aprobado, arrancamos la programación de tu web." },
  { icon: Wrench, title: "La hacemos realidad", desc: "Creamos la web exactamente como tú quieras, hasta tenerla lista y aprobada por ti." },
  { icon: Send, title: "Tu web sale a trabajar", desc: "La publicamos y queda lista para atraer clientes. Si después quieres ajustar algún detalle, es completamente gratis." },
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
];

const testimonials = [
  {
    name: "Berto Project",
    biz: "bertoproject.com",
    quote:
      "Desde que publicamos la nueva web, varios clientes nos han dicho que llegamos a ellos porque la web les transmitió mucha confianza. Trato muy amable y profesional.",
    initials: "BP",
  },
  {
    name: "Antonio Ruiz",
    biz: "Naturaleza y Viajes",
    quote: "Gracias a la nueva he superado a la competencia. Funciona todo perfecto y es simple. Trato muy amable y profesional.",
    initials: "AR",
  },
];

const faqs = [
  {
    q: "¿Cuánto tarda mi web?",
    a: "Depende del proyecto, pero una landing suele estar lista en 2 semanas y una web completa entre 4 y 6.",
  },
  {
    q: "¿Cuánto cuesta una web?",
    a: "Cada proyecto es único. Nos cuentas lo que necesitas y te pasamos un presupuesto claro y sin sorpresas. Por lo general, una web suele costar entre 200 y 330 euros.",
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
  {
    q: "¿Tengo que pagar algo para ver la demo?",
    a: "No. La primera demo es gratuita y sin compromiso.",
  },
  {
    q: "¿Tengo que saber de tecnología?",
    a: "No. Nosotros nos encargamos de la parte técnica y te explicamos todo de forma sencilla.",
  },
];

function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <main className="relative z-[2] overflow-hidden">
      <Navbar />

      {/* HERO — ocupa la primera pantalla completa; Servicios empieza justo
          después, así aparece nada más deslizar un poco */}
      <section
        id="inicio"
        className="relative min-h-[100dvh] overflow-hidden pt-28 pb-6 sm:pt-32"
      >
        {/* ROBOT 3D INTERACTIVO — a pantalla completa, contenido dentro del
            hero (no debe asomar sobre Servicios) */}
        <div className="absolute inset-0 z-0">
          <InteractiveRobot3D className="h-full w-full" />
        </div>

        <div className="container-page relative z-10 pointer-events-none">
          <div className="w-full">
            <Reveal delay={80}>
              <h1 className="text-[2.95rem] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Tu negocio
                <br />
                merece una
                <br />
                web <span className="hero-gradient-text">a la altura.</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 max-w-xl text-base text-foreground/70 sm:text-lg">
                Creamos webs modernas y pensadas para convertir visitantes en
                clientes. Te enseñamos una demo gratuita de tu propio negocio
                antes de empezar.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="pointer-events-auto mt-9 flex flex-wrap gap-3">
                <a href="#contacto" className="btn-primary">
                  Quiero ver mi demo gratis <ArrowRight size={18} />
                </a>
                <a href="#proceso" className="btn-ghost">
                  Ver cómo trabajamos
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE TU WEB */}
      <section className="relative">
        <IncludesCinematic />
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

      {/* CON QUIÉN TRABAJAMOS */}
      <section id="servicios" className="container-page pb-24 pt-8 sm:pb-32 sm:pt-12">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Con quién trabajamos
            </p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
              Negocios como el tuyo.
            </h2>
          </div>
        </Reveal>

        <ClientCardScrollReveal />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {clients.map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="client-card card-surface group relative flex h-32 items-center gap-5 overflow-hidden p-6">
                <div
                  className="client-card-photo absolute inset-0"
                  style={{ backgroundImage: `url(${c.photo})`, backgroundPosition: c.focal }}
                  aria-hidden="true"
                />
                <div className="client-card-overlay absolute inset-0" />
                <div className="client-card-content relative z-10 flex items-center gap-5">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <c.icon size={26} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-bold sm:text-xl">{c.title}</h3>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={clients.length * 80}>
            <div className="card-surface card-hover flex h-full items-center gap-5 p-6 sm:col-span-2">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Smile size={26} strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold sm:text-xl">
                No importa que tu negocio no esté aquí. ¡Trabajamos con todo
                tipo de negocios!
              </h3>
            </div>
          </Reveal>
        </div>
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

        <div className="mt-14 grid gap-6 sm:max-w-3xl md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <SpotlightCard className="card-surface card-hover flex h-full flex-col p-7">
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
              </SpotlightCard>
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
              href="https://wa.me/34959807018?text=Hola%2C%20he%20visto%20vuestra%20web%20y%20me%20interesa%20tener%20algo%20parecido%20para%20mi%20negocio.%20%C2%BFPod%C3%A9is%20contarme%20c%C3%B3mo%20trabaj%C3%A1is%3F"
              target="_blank"
              rel="noreferrer"
              className="btn-primary !px-8 !py-4 text-base"
            >
              Quiero mi demo gratis <ArrowRight size={18} />
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
                FAQ
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
              href="https://mail.google.com/mail/?view=cm&fs=1&to=websorbita@gmail.com"
              target="_blank"
              rel="noreferrer"
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
