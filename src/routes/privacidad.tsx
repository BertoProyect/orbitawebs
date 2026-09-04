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
    <LegalPageLayout title="Política de Privacidad" updated="5 de septiembre de 2026">
      <p>
        En <strong>Órbita Webs</strong> nos tomamos en serio tu privacidad.
        Esta política explica cómo tratamos tus datos personales cuando
        visitas nuestra web o te pones en contacto con nosotros, de acuerdo
        con el Reglamento General de Protección de Datos (RGPD) (UE)
        2016/679 y la Ley Orgánica 3/2018 de Protección de Datos Personales
        y garantía de los derechos digitales (LOPDGDD).
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          1. Responsable del tratamiento
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nombre comercial: Órbita Webs</li>
          <li>Correo de contacto: websorbita@gmail.com</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          2. Datos que recopilamos
        </h2>
        <p>
          Nuestra web no tiene formularios propios ni newsletter. No te
          pedimos ningún dato mientras navegas. Solo tratamos datos
          personales si tú decides escribirnos voluntariamente:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>WhatsApp:</strong> si pulsas el botón de WhatsApp, se
            abre una conversación con tu número de teléfono y el mensaje que
            decidas enviarnos.
          </li>
          <li>
            <strong>Correo electrónico:</strong> si nos escribes a
            websorbita@gmail.com, recibimos tu dirección de correo, tu
            nombre (si lo incluyes) y el contenido de tu mensaje.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          3. Finalidad del tratamiento
        </h2>
        <p>Tus datos de contacto se usan únicamente para:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Responder a tu consulta o solicitud de presupuesto.</li>
          <li>
            Gestionar la relación contigo si contratas nuestros servicios de
            diseño y mantenimiento web.
          </li>
        </ul>
        <p>
          No usamos tus datos con fines publicitarios ni te suscribimos a
          ninguna lista de correo sin que lo pidas expresamente.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          4. Legitimación
        </h2>
        <p>
          La base legal para tratar tus datos es tu propio consentimiento,
          que otorgas al escribirnos voluntariamente (art. 6.1.a RGPD). En
          cualquier momento puedes retirarlo escribiendo a
          websorbita@gmail.com.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          5. Conservación de los datos
        </h2>
        <p>
          Conservamos tus mensajes solo mientras dure la conversación o
          gestión de tu consulta. Si contratas nuestros servicios, los datos
          necesarios para la relación contractual se conservan durante el
          tiempo exigido por la normativa fiscal y mercantil aplicable.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          6. Datos técnicos de navegación (hosting)
        </h2>
        <p>
          Nuestro proveedor de alojamiento (Cloudflare) registra
          automáticamente datos técnicos básicos (dirección IP, tipo de
          navegador, páginas visitadas) con fines de seguridad y
          funcionamiento del servicio. No se usan para elaborar perfiles ni
          con fines publicitarios.
        </p>
        <p>
          Actualmente <strong>no utilizamos Google Analytics ni ninguna
          otra herramienta de analítica o publicidad</strong>. Si en el
          futuro incorporamos alguna, te lo pediremos mediante un aviso de
          cookies antes de activarla, y actualizaremos esta política y la de
          cookies.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          7. Destinatarios y transferencias
        </h2>
        <p>
          No vendemos ni cedemos tus datos a terceros, salvo obligación
          legal. Tus mensajes de WhatsApp los procesa WhatsApp/Meta según
          sus propias condiciones, al ser tú quien inicia esa conversación
          desde su aplicación.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          8. Tus derechos
        </h2>
        <p>Como usuario, tienes derecho a:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Acceder a tus datos personales.</li>
          <li>Rectificar datos inexactos.</li>
          <li>Solicitar la supresión de tus datos.</li>
          <li>Oponerte al tratamiento de tus datos.</li>
          <li>Solicitar la limitación o portabilidad de tus datos.</li>
        </ul>
        <p>
          Puedes ejercer estos derechos escribiendo a{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=websorbita@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary"
          >
            websorbita@gmail.com
          </a>
          . También puedes reclamar ante la Agencia Española de Protección
          de Datos (
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary"
          >
            aepd.es
          </a>
          ) si consideras que no hemos respetado tus derechos.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          9. Seguridad
        </h2>
        <p>
          Adoptamos medidas técnicas y organizativas razonables para
          proteger tus datos y evitar accesos no autorizados, pérdida o mal
          uso.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          10. Modificaciones
        </h2>
        <p>
          Podemos actualizar esta política para adaptarla a cambios
          normativos o mejoras del proyecto. Si el cambio es relevante, lo
          indicaremos en esta misma página junto con la fecha de
          actualización.
        </p>
      </section>
    </LegalPageLayout>
  );
}
