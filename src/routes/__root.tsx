import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CookieConsent } from "../components/CookieConsent";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
// En móvil, mostrar/ocultar la barra de direcciones al hacer scroll dispara
// un evento "resize" que por defecto hace que ScrollTrigger recalcule (y
// "teletransporte") todas las secciones pineadas. Esto lo desactiva.
ScrollTrigger.config({ ignoreMobileResize: true });
// En móvil, el scroll táctil (con inercia) no se lleva bien con varias
// secciones "pineadas" (DepthStack, IncludesCinematic, ProcessSlides,
// ScrollGallery): el navegador puede frenar el scroll a mitad de gesto o
// el pin puede "rebotar" al punto anterior. normalizeScroll unifica el
// scroll táctil con el pin de GSAP y elimina ese atasco/rebote.
if (typeof window !== "undefined") {
  ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página no se cargó
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo salió mal. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Reintentar
          </button>
          <a href="/" className="btn-ghost">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light" },
      { title: "Órbita Webs | Diseño web para negocios en Huelva" },
      {
        name: "description",
        content:
          "Creamos webs profesionales para negocios en Huelva y toda España. Demo gratuita sin compromiso. Dominio incluido y mantenimiento desde 29 €/mes.",
      },
      { name: "author", content: "Órbita Webs" },
      { name: "theme-color", content: "#cce7f1" },
      { name: "robots", content: "noimageindex" },
      { property: "og:title", content: "Órbita Webs | Diseño web para negocios en Huelva" },
      {
        property: "og:description",
        content:
          "Creamos webs profesionales para negocios en Huelva y toda España. Demo gratuita sin compromiso. Dominio incluido y mantenimiento desde 29 €/mes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://orbitawebs.com/" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Órbita Webs | Diseño web para negocios en Huelva" },
      {
        name: "twitter:description",
        content:
          "Creamos webs profesionales para negocios en Huelva y toda España. Demo gratuita sin compromiso. Dominio incluido y mantenimiento desde 29 €/mes.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "canonical", href: "https://orbitawebs.com/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Órbita Webs",
          url: "https://orbitawebs.com",
          description:
            "Estudio de diseño y desarrollo web para negocios locales en Huelva y toda España.",
          areaServed: ["Huelva", "España"],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Huelva",
            addressRegion: "Andalucía",
            addressCountry: "ES",
          },
          email: "websorbita@gmail.com",
          telephone: "+34959807018",
          priceRange: "€€",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <CookieConsent />
    </QueryClientProvider>
  );
}
