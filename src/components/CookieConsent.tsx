import { useEffect, useState } from "react";
import { ANALYTICS_ENABLED, GA_MEASUREMENT_ID } from "@/lib/analytics-config";

const CONSENT_STORAGE_KEY = "orbita-cookie-consent"; // "accepted" | "rejected"

/** Inyecta el script de Google Analytics solo tras consentimiento explícito. */
function loadGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || document.getElementById("ga-script")) return;

  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = "ga-inline";
  inline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
  `;
  document.head.appendChild(inline);
}

function removeGoogleAnalytics() {
  document.getElementById("ga-script")?.remove();
  document.getElementById("ga-inline")?.remove();
  // Borra también las cookies propias de GA si ya se habían creado.
  ["_ga", "_ga_" + GA_MEASUREMENT_ID.replace("G-", ""), "_gid", "_gat"].forEach((name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Si la analítica ni siquiera está activada en el proyecto, no
    // molestamos a nadie con un banner que no tiene sentido mostrar.
    if (!ANALYTICS_ENABLED) return;

    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "accepted") {
      loadGoogleAnalytics();
    } else if (stored !== "rejected") {
      setVisible(true);
    }
  }, []);

  if (!ANALYTICS_ENABLED || !visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
    loadGoogleAnalytics();
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "rejected");
    removeGoogleAnalytics();
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="card-surface flex w-full max-w-2xl flex-col gap-4 bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-base font-semibold text-foreground">
            ¿Aceptas las cookies?
          </p>
          <p className="mt-1 text-sm text-foreground/70">
            Las usamos para entender cómo se usa la web. Consulta nuestra{" "}
            <a
              href="/cookies"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-primary"
            >
              Política de Cookies
            </a>{" "}
            para más info.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={reject}
            className="rounded-full border border-foreground/15 px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-foreground/5"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
