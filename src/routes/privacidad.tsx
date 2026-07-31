import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const Route = createFileRoute("/privacidad")({
  component: Privacidad,
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Órbita Webs" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function Privacidad() {
  return (
    <LegalPageLayout title="Política de Privacidad" updated="1 de agosto de 2026">
      <p>
        <strong>
          ⚠️ Plantilla pendiente de rellenar con los datos reales de Órbita
          Webs (NIF, domicilio) antes de publicar. No constituye asesoramiento
          legal — se recomienda su revisión por un profesional antes de
          publicarla.
        </strong>
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          1. Responsable del tratamiento
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Responsable: [Nombre completo o razón social] — Órbita Webs</li>
          <li>NIF/CIF: [NIF o CIF]</li>
          <li>Domicilio: [Dirección fiscal, Huelva, España]</li>
          <li>Correo electrónico: websorbita@gmail.com</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          2. ¿Qué datos tratamos y con qué finalidad?
        </h2>
        <p>
          Este sitio web no dispone de formularios propios que envíen datos a
          nuestros servidores. El contacto se realiza siempre a través de
          servicios de terceros que tú eliges abrir voluntariamente:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>WhatsApp:</strong> si pulsas el botón de WhatsApp, se abre
            una conversación en la app de WhatsApp con tu número de teléfono
            y el mensaje que decidas enviar. Ese tratamiento lo realiza
            WhatsApp/Meta conforme a su propia política de privacidad.
          </li>
          <li>
            <strong>Correo electrónico:</strong> si nos escribes a
            websorbita@gmail.com, trataremos tu dirección de correo, nombre y
            el contenido del mensaje únicamente para responder a tu
            consulta.
          </li>
        </ul>
        <p>
          La finalidad en ambos casos es exclusivamente atender tu solicitud
          de información o presupuesto sobre nuestros servicios de diseño
          web.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          3. Datos técnicos de navegación (hosting)
        </h2>
        <p>
          Como en cualquier web, nuestro proveedor de alojamiento (Cloudflare)
          puede registrar de forma automática datos técnicos como tu
          dirección IP, tipo de navegador o páginas visitadas, con fines de
          seguridad y funcionamiento del servicio. Estos registros no se usan
          para elaborar perfiles ni para fines publicitarios.
        </p>
        <p>
          Actualmente <strong>no utilizamos Google Analytics ni ninguna otra
          herramienta de analítica o publicidad</strong>. Si en el futuro
          incorporamos alguna, te lo notificaremos mediante un aviso de
          cookies antes de activarla, y actualizaremos esta política y la de
          cookies.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          4. Legitimación
        </h2>
        <p>
          La base legal para el tratamiento de tus datos de contacto es tu
          propio consentimiento, manifestado al escribirnos voluntariamente
          (art. 6.1.a del Reglamento General de Protección de Datos, RGPD).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          5. Conservación de los datos
        </h2>
        <p>
          Conservaremos los datos de tus mensajes únicamente durante el
          tiempo necesario para atender tu consulta y, si contratas nuestros
          servicios, durante el tiempo exigido por la normativa fiscal y
          mercantil aplicable.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          6. Destinatarios y cesiones
        </h2>
        <p>
          No cedemos tus datos a terceros, salvo obligación legal. Tus
          mensajes de WhatsApp los procesa WhatsApp/Meta según sus propias
          condiciones, al ser tú quien inicia esa conversación desde su
          aplicación.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          7. Tus derechos
        </h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión,
          oposición, limitación del tratamiento y portabilidad escribiendo a{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=websorbita@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary"
          >
            websorbita@gmail.com
          </a>
          . También tienes derecho a presentar una reclamación ante la
          Agencia Española de Protección de Datos (
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary"
          >
            aepd.es
          </a>
          ) si consideras que el tratamiento de tus datos no se ajusta a la
          normativa.
        </p>
      </section>
    </LegalPageLayout>
  );
}
