import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Smile,
  MessageCircle,
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
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { DeferredRobot3D } from "@/components/DeferredRobot3D";
import { ProcessShowcase, type ProcessStep } from "@/components/ProcessShowcase";
import { DeferredWorld } from "@/components/world/DeferredWorld";
import { IncludesCinematic } from "@/components/IncludesCinematic";
import { ScrollGallery } from "@/components/ScrollGallery";
import { ClientCardScrollReveal } from "@/components/ClientCardScrollReveal";
import { fastScrollTo } from "@/lib/fast-scroll-to";
import { HOME_JSON_LD, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/seo";
const logo = { url: "/logo-orbita-webs-dark.webp" };

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(HOME_JSON_LD) }],
  }),
});

const clients = [
  { icon: Scissors, title: "Peluquerías y barberías", photo: "/negocios/peluqueria.webp", focal: "center 55%" },
  { icon: Sparkles, title: "Centros de estética", photo: "/negocios/estetica.webp", focal: "75% 60%" },
  { icon: Stethoscope, title: "Clínicas dentales", photo: "/negocios/dental.webp", focal: "65% 50%" },
  { icon: UtensilsCrossed, title: "Bares y restaurantes", photo: "/negocios/restaurante.webp", focal: "center 60%" },
  { icon: Camera, title: "Fotógrafos", photo: "/negocios/fotografo.webp", focal: "55% 40%" },
  { icon: ShoppingBasket, title: "Tiendas de alimentación", photo: "/negocios/alimentacion.webp", focal: "55% 60%" },
  { icon: Store, title: "Tiendas en general", photo: "/negocios/tienda.webp", focal: "45% 55%" },
];

// 4 pasos (antes 5: "Empezamos a construir" y "La hacemos realidad" decían
// lo mismo). Cada paso tiene su propia escena en la animación 3D de la derecha.
const process: ProcessStep[] = [
  {
    title: "Vemos tu negocio primero",
    desc: "Te mostramos una demo gratuita de tu web, hecha a partir de tu propio negocio.",
    tag: "Demo gratuita",
  },
  {
    title: "Lo afinamos juntos",
    desc: "En una llamada ajustamos cada detalle contigo, hasta que la web sea exactamente la que quieres.",
    tag: "Ajustes contigo",
  },
  {
    title: "La construimos",
    desc: "Con todo aprobado, programamos tu web: rápida, segura y perfecta en cualquier pantalla. Tú la revisas antes de publicarla.",
    tag: "Desarrollo",
  },
  {
    title: "Tu web sale a trabajar",
    desc: "La publicamos y queda lista para atraer clientes. Si después quieres ajustar algún detalle, es completamente gratis.",
    tag: "Publicación",
  },
];

const portfolio = [
  {
    name: "Naturaleza y Viajes",
    link: "https://naturalezayviajes.com/",
    imageMobile: "/portfolio/naturaleza-y-viajes.webp",
    imageDesktop: "/portfolio/naturaleza-desktop.webp",
  },
  {
    name: "Berto Project",
    link: "https://bertoproject.com/",
    imageMobile: "/portfolio/berto-bio.webp",
    imageDesktop: "/portfolio/berto-bio-desktop.webp",
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
    q: "¿Trabajáis con negocios de toda España?",
    a: "Sí. Trabajamos 100% online con clientes de cualquier punto de España, estén donde estén.",
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
    <>
    {/* Mundo 3D fijo detrás de toda la página; cada sección indica con
        data-world-scene qué isla enseña la cámara mientras se lee. */}
    <DeferredWorld />
    <main className="relative z-[2] overflow-clip">
      <FloatingWhatsApp />
      <Navbar />

      {/* HERO — ocupa la primera pantalla completa; Servicios empieza justo
          después, así aparece nada más deslizar un poco */}
      <section
        id="inicio"
        data-world-scene="0"
        className="over-world relative min-h-[100dvh] overflow-hidden pt-28 pb-6 sm:pt-32"
      >
        {/* ROBOT 3D INTERACTIVO — a pantalla completa, contenido dentro del
            hero (no debe asomar sobre Servicios) */}
        <div className="absolute inset-0 z-0">
          <DeferredRobot3D className="h-full w-full" />
        </div>

        <div className="container-page relative z-10 pointer-events-none">
          <div className="w-full">
            <Reveal delay={80}>
              <h1 className="text-[2.95rem] font-semibold leading-[1.03] tracking-[-0.04em] sm:text-5xl lg:text-6xl xl:text-7xl">
                Tu negocio
                <br />
                merece una
                <br />
                web <span className="hero-gradient-text">a la altura.</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 max-w-xl text-base text-foreground/75 sm:text-xl">
                Creamos webs modernas y pensadas para convertir visitantes en
                clientes. Te enseñamos una demo gratuita de tu propio negocio
                antes de empezar.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="pointer-events-auto mt-9 flex flex-wrap gap-3">
                <a
                  href="#contacto"
                  className="btn-primary"
                  onClick={(e) => fastScrollTo(e, "#contacto")}
                >
                  Quiero ver mi demo gratis <ArrowRight size={18} />
                </a>
                <a
                  href="#proceso"
                  className="btn-ghost"
                  onClick={(e) => fastScrollTo(e, "#proceso")}
                >
                  Ver cómo trabajamos
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE TU WEB */}
      <section id="incluye" data-world-scene="1" className="over-world">
        <IncludesCinematic />
      </section>

      {/* PROCESO — sección oscura: pasos a la izquierda y escena 3D a la
          derecha que cambia con cada paso (en móvil, lista de pasos) */}
      <section id="proceso" data-world-scene="2" className="over-world">
        <ProcessShowcase items={process} />
      </section>

      {/* CON QUIÉN TRABAJAMOS */}
      <section id="servicios" data-world-scene="3" className="over-world">
       <div className="container-page py-24 sm:py-32">
        <Reveal>
          <div className="max-w-3xl">
            <h2 className="section-title">Negocios como el tuyo.</h2>
            <p className="mt-5 max-w-xl text-lg text-[color:var(--on-dark-muted)] lg:text-xl">
              Webs para negocios locales que quieren que los encuentren y los elijan.
            </p>
          </div>
        </Reveal>

        <ClientCardScrollReveal />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:max-w-[46rem]">
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
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color:var(--primary-on-dark)]/15 text-[color:var(--primary-on-dark)]">
                    <c.icon size={26} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold sm:text-xl">{c.title}</h3>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={clients.length * 80}>
            <div className="card-surface card-hover flex h-full items-center gap-5 p-6 sm:col-span-2">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[color:var(--primary-on-dark)]/15 text-[color:var(--primary-on-dark)]">
                <Smile size={26} strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold sm:text-xl">
                No importa que tu negocio no esté aquí. ¡Trabajamos con todo
                tipo de negocios!
              </h3>
            </div>
          </Reveal>
        </div>
       </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" data-world-scene="4" className="over-world">
        <ScrollGallery
          title={
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <h2 className="section-title">Proyectos recientes.</h2>
                </div>
              </div>
            </Reveal>
          }
          items={portfolio}
        />
      </section>

      {/* CTA FINAL */}
      {/* a pantalla completa (y algo más) para que la cámara llegue a posarse
          en la antena antes de seguir volando */}
      <section id="contacto" data-world-scene="5" className="over-world flex min-h-[125svh] items-start">
       <div className="container-page w-full pt-[22svh] pb-24">
        <Reveal>
          <div className="text-center">
            <h2 className="mx-auto max-w-4xl text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              ¿Hablamos sobre tu proyecto?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[color:var(--on-dark-muted)] sm:text-xl">
              Cuéntanos qué necesitas. Te respondemos en menos de 24 horas.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/34959807018?text=Hola%2C%20he%20visto%20vuestra%20web%20y%20me%20interesa%20tener%20algo%20parecido%20para%20mi%20negocio.%20%C2%BFPod%C3%A9is%20contarme%20c%C3%B3mo%20trabaj%C3%A1is%3F"
              target="_blank"
              rel="noreferrer"
              className="btn-primary !px-8 !py-4 !text-lg"
            >
              Quiero mi demo gratis <ArrowRight size={18} />
            </a>
            </div>
          </div>
        </Reveal>
       </div>
      </section>

      {/* FAQ */}
      <section id="preguntas" data-world-scene="6" className="over-world">
       <div className="container-page py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <h2 className="section-title">Todo lo que sueles preguntar.</h2>
              <p className="mt-6 text-foreground/70 lg:text-xl">
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
       </div>
      </section>

      {/* FOOTER */}
      <footer data-world-scene="6" className="over-world">
       <div className="container-page pb-14">
        <div className="card-surface flex w-full flex-col gap-8 px-6 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 md:flex-row md:items-center md:justify-between md:gap-12 md:p-10">
          <div className="flex items-center justify-start pl-6 md:pl-0">
            <img
              src={logo.url}
              alt="Órbita Webs"
              width={1200}
              height={180}
              loading="lazy"
              decoding="async"
              className="h-auto w-52 sm:w-60 md:w-72 lg:w-80"
            />
          </div>

          <div className="flex flex-col items-start gap-3 pl-6 text-sm text-foreground/70 md:items-start md:pl-0 md:gap-4">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=contacto@orbitawebs.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-[color:var(--primary-on-dark)]"
            >
              <Mail size={16} /> contacto@orbitawebs.com
            </a>
            <a
              href="https://wa.me/34959807018?text=Hola%2C%20he%20visto%20vuestra%20web%20y%20me%20interesa%20tener%20algo%20parecido%20para%20mi%20negocio.%20%C2%BFPod%C3%A9is%20contarme%20c%C3%B3mo%20trabaj%C3%A1is%3F"
              className="flex items-center gap-2 hover:text-[color:var(--primary-on-dark)]"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={16} /> Huelva · Toda España
            </span>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-foreground/60">
          © {new Date().getFullYear()} Órbita Webs. Todos los derechos reservados.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-foreground/60">
          <a
            href="/aviso-legal"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[color:var(--primary-on-dark)] hover:underline"
          >
            Aviso legal
          </a>
          <a
            href="/privacidad"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[color:var(--primary-on-dark)] hover:underline"
          >
            Política de privacidad
          </a>
          <a
            href="/cookies"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[color:var(--primary-on-dark)] hover:underline"
          >
            Política de cookies
          </a>
        </div>
       </div>
      </footer>
    </main>
    </>
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
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.04] sm:px-8 lg:py-6"
        aria-expanded={open}
      >
        <span className="text-base font-semibold sm:text-lg lg:text-xl">{q}</span>
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <Plus size={16} />
        </span>
      </button>
      <div
        className="grid overflow-hidden px-6 transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none sm:px-8"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="min-h-0">
          <p className="pb-5 text-foreground/70 lg:text-lg">{a}</p>
        </div>
      </div>
    </div>
  );
}
