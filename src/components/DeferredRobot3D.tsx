import { lazy, Suspense, useEffect, useState } from "react";

/**
 * El robot 3D (three.js) pesa casi 1 MB de JavaScript. Importarlo
 * directamente en la home obligaba a descargarlo y ejecutarlo antes de que
 * la página respondiera, lo que penaliza la velocidad en móvil (Core Web
 * Vitals, que Google tiene en cuenta).
 *
 * Aquí se carga en un archivo aparte y solo cuando el navegador ya ha
 * pintado el contenido y está libre. El texto del hero aparece igual que
 * antes; el robot entra con su animación un instante después.
 */
const InteractiveRobot3D = lazy(() =>
  import("./InteractiveRobot3D").then((m) => ({ default: m.InteractiveRobot3D })),
);

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function DeferredRobot3D({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    const start = () => setReady(true);

    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    // Safari no tiene requestIdleCallback
    const t = window.setTimeout(start, 300);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={className}>
      {ready && (
        <Suspense fallback={null}>
          <InteractiveRobot3D className="h-full w-full" />
        </Suspense>
      )}
    </div>
  );
}
