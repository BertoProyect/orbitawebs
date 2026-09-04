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
    <LegalPageLayout title="Política de Cookies" updated="5 de septiembre de 2026 (Google Analytics activado)">
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
          <>
            <p>
              Usamos <strong>Google Analytics</strong> para entender de forma
              anónima cómo se usa la web (páginas visitadas, tiempo de
              navegación, origen del tráfico). Estas cookies solo se
              instalan si pulsas "Aceptar" en el aviso de cookies, y puedes
              rechazarlas o eliminarlas en cualquier momento cambiando tu
              elección.
            </p>
            <div className="overflow-x-auto">
              <table className="mt-2 w-full min-w-[420px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="py-2 pr-4 font-semibold text-foreground">Cookie</th>
                    <th className="py-2 pr-4 font-semibold text-foreground">Finalidad</th>
                    <th className="py-2 font-semibold text-foreground">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-foreground/10">
                    <td className="py-2 pr-4">_ga</td>
                    <td className="py-2 pr-4">Distingue usuarios únicos</td>
                    <td className="py-2">2 años</td>
                  </tr>
                  <tr className="border-b border-foreground/10">
                    <td className="py-2 pr-4">_ga_XEFHFXHCVK</td>
                    <td className="py-2 pr-4">Mantiene el estado de la sesión</td>
                    <td className="py-2">2 años</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
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
          ¿Cómo puedo rechazar o retirar mi consentimiento?
        </h2>
        <p>
          Puedes rechazar las cookies de analítica desde el propio banner
          cuando aparece, pulsando "Rechazar". Si ya aceptaste y quieres
          cambiar de opinión, borra las cookies del sitio desde los ajustes
          de tu navegador y el banner volverá a aparecer en tu próxima
          visita para que elijas de nuevo.
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
