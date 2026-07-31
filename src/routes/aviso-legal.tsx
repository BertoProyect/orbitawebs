import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const Route = createFileRoute("/aviso-legal")({
  component: AvisoLegal,
  head: () => ({
    meta: [
      { title: "Aviso Legal — Órbita Webs" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function AvisoLegal() {
  return (
    <LegalPageLayout title="Aviso Legal" updated="1 de agosto de 2026">
      <p>
        <strong>
          ⚠️ Plantilla pendiente de rellenar con los datos reales de Órbita
          Webs antes de publicar la web con dominio propio. Sustituye todo lo
          que aparece entre corchetes. Este texto es una guía orientativa y no
          constituye asesoramiento legal — se recomienda su revisión por un
          gestor o abogado antes de publicarlo.
        </strong>
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          1. Datos identificativos
        </h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de
          la Sociedad de la Información y de Comercio Electrónico (LSSI-CE),
          se informa de los siguientes datos:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Titular: [Nombre completo o razón social]</li>
          <li>NIF/CIF: [NIF o CIF]</li>
          <li>Domicilio: [Dirección fiscal, Huelva, España]</li>
          <li>Correo electrónico de contacto: websorbita@gmail.com</li>
          <li>Nombre comercial: Órbita Webs</li>
          <li>
            Actividad: diseño y desarrollo de páginas web para negocios
            locales
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          2. Objeto y aceptación
        </h2>
        <p>
          El presente Aviso Legal regula el uso del sitio web{" "}
          <strong>orbitawebs.com</strong> (en adelante, "el sitio web"). La
          navegación por el sitio web atribuye la condición de usuario y
          acepta, desde ese mismo momento, las condiciones aquí establecidas.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          3. Propiedad intelectual e industrial
        </h2>
        <p>
          Todos los contenidos del sitio web (textos, imágenes, logotipos,
          código, diseño) son propiedad de Órbita Webs o de terceros que han
          autorizado su uso, y están protegidos por la normativa de propiedad
          intelectual e industrial. Queda prohibida su reproducción total o
          parcial sin autorización expresa.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          4. Exclusión de responsabilidad
        </h2>
        <p>
          Órbita Webs no se hace responsable de los daños derivados del uso
          incorrecto del sitio web, ni de la disponibilidad continua del
          mismo, ni de posibles enlaces a sitios de terceros.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          5. Legislación aplicable
        </h2>
        <p>
          Las presentes condiciones se rigen por la legislación española.
          Para cualquier controversia, las partes se someterán a los
          juzgados y tribunales que correspondan según la normativa vigente.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          6. Contacto
        </h2>
        <p>
          Para cualquier duda relacionada con este Aviso Legal, puedes
          escribirnos a{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=websorbita@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary"
          >
            websorbita@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
