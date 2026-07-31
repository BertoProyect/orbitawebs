import { useEffect, useRef, useState } from "react";

const logo = { url: "/logo-orbita-webs-new.png" };

// Duración mínima de la barra: un pelín larga a propósito (según feedback),
// para que la marca respire un instante en vez de parpadear.
const MIN_DURATION_MS = 2200;
// Tope al que puede llegar la barra mientras seguimos esperando a que el
// robot 3D y las fuentes terminen de cargar de verdad, para no "mentir"
// llegando al 100% antes de tiempo si algo tarda más de la cuenta.
const SOFT_CAP = 92;

interface LoadingScreenProps {
  /** true cuando el robot 3D y las fuentes ya están listos de verdad */
  ready: boolean;
  /** se llama cuando el fundido de salida ha terminado y se puede desmontar */
  onDone: () => void;
}

export function LoadingScreen({ ready, onDone }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    let rafId: number;
    let finishTimeout: ReturnType<typeof setTimeout>;
    let fadeTimeout: ReturnType<typeof setTimeout>;
    const start = performance.now();
    let finished = false;

    const tick = (now: number) => {
      const elapsed = now - start;
      const timeRatio = Math.min(1, elapsed / MIN_DURATION_MS);
      const cap = readyRef.current ? 100 : SOFT_CAP;
      const nextProgress = Math.min(timeRatio * 100, cap);
      setProgress(nextProgress);

      if (elapsed >= MIN_DURATION_MS && readyRef.current && !finished) {
        finished = true;
        setProgress(100);
        finishTimeout = setTimeout(() => {
          setFadeOut(true);
          fadeTimeout = setTimeout(onDone, 650);
        }, 200);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(finishTimeout);
      clearTimeout(fadeTimeout);
    };
  }, [onDone]);

  return (
    <div
      aria-hidden={fadeOut}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background transition-opacity ease-out"
      style={{
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "auto",
        transitionDuration: "650ms",
      }}
    >
      <img
        src={logo.url}
        alt="Órbita Webs"
        className="h-auto w-[190px] max-w-[55vw] sm:w-[230px]"
        style={{
          opacity: 0,
          animation: "loader-logo-in 0.6s ease forwards",
        }}
      />
      <div
        className="mt-8 h-[6px] w-[220px] max-w-[50vw] overflow-hidden rounded-full bg-white"
        style={{ boxShadow: "inset 0 0 0 1px rgba(26,26,46,0.06)" }}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%`, transition: "width 160ms linear" }}
        />
      </div>
    </div>
  );
}
