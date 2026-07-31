import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

const logo = { url: "/logo-orbita-webs-new.png" };

export function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="relative z-[2] min-h-screen overflow-hidden">
      <header className="container-page flex items-center justify-between pt-8 pb-6">
        <Link to="/" className="flex items-center">
          <img src={logo.url} alt="Órbita Webs" className="h-auto w-40 sm:w-48" />
        </Link>
        <Link to="/" className="btn-ghost text-sm">
          Volver al inicio
        </Link>
      </header>

      <article className="container-page pb-24">
        <div className="card-surface max-w-3xl px-6 py-8 sm:px-10 sm:py-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-foreground/50">
            Última actualización: {updated}
          </p>
          <div className="legal-content mt-8 space-y-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
            {children}
          </div>
        </div>
      </article>
    </main>
  );
}
