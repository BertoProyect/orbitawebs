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

import { CustomCursor } from "@/components/CustomCursor";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

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
      { title: "Órbita Webs — Diseño y desarrollo web para negocios" },
      {
        name: "description",
        content:
          "Estudio de diseño y desarrollo web en Huelva. Creamos páginas rápidas, bonitas y pensadas para conseguir clientes.",
      },
      { name: "author", content: "Órbita Webs" },
      { name: "theme-color", content: "#cce7f1" },
      { property: "og:title", content: "Órbita Webs — Diseño y desarrollo web para negocios" },
      {
        property: "og:description",
        content: "Creamos páginas web rápidas, bonitas y pensadas para conseguir clientes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Órbita Webs — Diseño y desarrollo web para negocios" },
      {
        name: "twitter:description",
        content: "Diseño y desarrollo web para negocios locales.",
      },
      { name: "description", content: "Orbita Webs Studio builds premium, modern landing pages for web development agencies." },
      { property: "og:description", content: "Orbita Webs Studio builds premium, modern landing pages for web development agencies." },
      { name: "twitter:description", content: "Orbita Webs Studio builds premium, modern landing pages for web development agencies." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e4f373ff-8c77-4fbf-96df-3b48e8f2aa9c/id-preview-46641c89--76367f4d-7f04-4650-871e-be9dd8a5d54c.lovable.app-1782909403499.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e4f373ff-8c77-4fbf-96df-3b48e8f2aa9c/id-preview-46641c89--76367f4d-7f04-4650-871e-be9dd8a5d54c.lovable.app-1782909403499.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "canonical", href: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Órbita Webs",
          description:
            "Estudio de diseño y desarrollo web para negocios locales.",
          areaServed: "Huelva, España",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Huelva",
            addressCountry: "ES",
          },
          email: "websorbita@gmail.com",
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
      <CustomCursor />
      <Outlet />
    </QueryClientProvider>
  );
}
