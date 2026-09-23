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
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../lib/seo";

const FAVICON_VERSION = "2";

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
    // Valores por defecto para todas las páginas. Cada ruta sobrescribe
    // title, description, og:*, canonical y robots con los suyos propios.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "author", content: "Órbita Webs" },
      { name: "theme-color", content: "#cce7f1" },
      { property: "og:site_name", content: "Órbita Webs" },
      { property: "og:locale", content: "es_ES" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Órbita Webs" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Fuente propia (ver @font-face en styles.css): se precarga para que
      // el titular se pinte ya con la tipografía final.
      {
        rel: "preload",
        href: "/fonts/inter-tight-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      // Favicon: isologo oficial (O azul + anillo negro). Google exige que
      // sea cuadrado y de un tamaño múltiplo de 48 px (48, 192...). El ?v=
      // obliga a los navegadores a olvidar el icono anterior en caché.
      { rel: "icon", href: `/favicon.ico?v=${FAVICON_VERSION}`, sizes: "16x16 32x32 48x48" },
      ...[48, 192, 512].map((size) => ({
        rel: "icon",
        href: `/favicon-${size}.png?v=${FAVICON_VERSION}`,
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
      {
        rel: "apple-touch-icon",
        href: `/apple-touch-icon.png?v=${FAVICON_VERSION}`,
        sizes: "180x180",
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
