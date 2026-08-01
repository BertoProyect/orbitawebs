import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/34959807018?text=Hola%2C%20he%20visto%20vuestra%20web%20y%20me%20interesa%20tener%20algo%20parecido%20para%20mi%20negocio.%20%C2%BFPod%C3%A9is%20contarme%20c%C3%B3mo%20trabaj%C3%A1is%3F";

/**
 * Botón flotante de WhatsApp. Deliberadamente NO usa el verde oficial de
 * WhatsApp para no desentonar con la paleta de marca (azul/celeste) — usa
 * el azul primario (--primary) en su lugar, según feedback.
 *
 * Solo aparece a partir de que el usuario ha bajado un poco (para no
 * competir con los CTA del hero) y se oculta al llegar cerca de la sección
 * de contacto, donde ya hay un botón de WhatsApp explícito, evitando
 * duplicidad visual.
 */
export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const contacto = document.getElementById("contacto");

    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.7;
      const nearContact = contacto
        ? contacto.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;
      setVisible(pastHero && !nearContact);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 ease-out hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
        boxShadow: "0 6px 20px -6px rgba(53, 90, 207, 0.55)",
      }}
    >
      <MessageCircle size={20} strokeWidth={2.2} />
    </a>
  );
}
