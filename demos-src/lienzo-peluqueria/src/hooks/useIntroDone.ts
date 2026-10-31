import { useEffect, useState } from "react";

/* La intro de cristal (assets/intro.js) pone la clase gi-hold en <html> mientras dura.
   La portada espera a que se quite para empezar su propia secuencia. */
const holding = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("gi-hold");

export function useIntroDone() {
  const [done, setDone] = useState(() => !holding());
  useEffect(() => {
    if (done) return;
    const root = document.documentElement;
    const check = () => {
      if (!holding()) {
        setDone(true);
        obs.disconnect();
      }
    };
    const obs = new MutationObserver(check);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    // Red de seguridad por si la intro se quedara colgada
    const t = window.setTimeout(() => setDone(true), 6000);
    check();
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, [done]);
  return done;
}
