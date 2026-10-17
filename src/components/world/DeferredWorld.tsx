import { lazy, Suspense, useEffect, useState } from "react";

/**
 * Carga el mundo 3D en un archivo aparte y solo cuando el navegador ya ha
 * pintado el texto y está libre: la portada se lee al instante y el mundo
 * aparece un momento después (con un fundido), sin penalizar la velocidad.
 */
const OrbitWorld = lazy(() => import("./OrbitWorld").then((m) => ({ default: m.OrbitWorld })));

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function DeferredWorld() {
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    const start = () => setReady(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 1200 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(start, 250);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
      style={{ opacity: shown ? 1 : 0 }}
      aria-hidden="true"
    >
      {ready && (
        <Suspense fallback={null}>
          <OrbitWorld />
        </Suspense>
      )}
    </div>
  );
}
