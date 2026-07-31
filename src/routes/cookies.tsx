import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { ANALYTICS_ENABLED } from "@/lib/analytics-config";

export const Route = createFileRoute("/cookies")({
  component: Cookies,
  head: () => ({
    meta: [
      { title: "Política de Cookies — Órbita Webs" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function Cookies() {
  return (
    <LegalPageLayout title="Política de Cookies" updated="1 de agosto de 2026">
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          ¿Qué son las cookies?
        </h2>
        <p>
          Las cookies son pequeños archivos que un sitio web guarda en tu
          navegador para recordar información sobre tu visita.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Cookies que usamos actualmente
        </h2>
        {ANALYTICS_ENABLED ? (
          <p>
            Usamos <strong>Google Analytics</strong> para entender de forma
            anónima cómo se usa la web (páginas visitadas, tiempo de
            navegación). Estas cookies solo se instalan si pulsas
            "Aceptar" en el aviso de cookies, y puedes rechazarlas o
            eliminarlas en cualquier momento.
          </p>
        ) : (
          <p>
            <strong>Actualmente esta web no utiliza ninguna cookie de
            analítica, publicidad o seguimiento.</strong> No verás ningún
            aviso de cookies porque, de momento, no instalamos ninguna que lo
            requiera. Solo se generan las cookies puramente técnicas que
            nuestro proveedor de hosting (Cloudflare) necesita para el
            funcionamiento y la seguridad básica del sitio (por ejemplo,
            protección contra tráfico malicioso), exentas de consentimiento
            según el artículo 22.2 de la LSSI-CE.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Si en el futuro añadimos analítica
        </h2>
        <p>
          Si en algún momento incorporamos Google Analytics u otra
          herramienta similar, te lo pediremos mediante un banner con dos
          botones igual de visibles: "Aceptar" y "Rechazar". El script solo
          se cargará si pulsas "Aceptar", y podrás cambiar tu decisión
          cuando quieras.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          ¿Cómo puedo gestionar las cookies desde mi navegador?
        </h2>
        <p>
          Además de nuestro propio banner (cuando aplique), puedes
          configurar tu navegador para bloquear o eliminar cookies en
          cualquier momento desde sus ajustes de privacidad (Chrome, Firefox,
          Safari, Edge, etc.).
        </p>
      </section>
    </LegalPageLayout>
  );
}
