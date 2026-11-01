import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Si se entra con un ancla (#laser, #contacto…), se va ahí cuando la intro suelta el scroll
if (location.hash) {
  const raw = decodeURIComponent(location.hash.slice(1));
  const alias: Record<string, string> = { reserva: "contacto", depilacion: "laser", "mapa-rostro": "rostro" };
  const id = alias[raw] ?? raw;
  const go = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
  const root = document.documentElement;
  const whenFree = () => {
    if (!root.classList.contains("gi-hold")) {
      requestAnimationFrame(() => requestAnimationFrame(go));
      return true;
    }
    return false;
  };
  window.addEventListener("load", () => {
    if (whenFree()) return;
    const obs = new MutationObserver(() => whenFree() && obs.disconnect());
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  });
}
