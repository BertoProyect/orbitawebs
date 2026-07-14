import { Suspense, lazy, useEffect, useRef } from "react";
const Spline = lazy(() => import("@splinetool/react-spline"));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hideWatermark = () => {
      const link = container.querySelector<HTMLAnchorElement>('a[href*="spline.design"]');
      if (link) link.style.display = "none";
    };

    hideWatermark();
    const observer = new MutationObserver(hideWatermark);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <Suspense
        fallback={
          <div
            className={`flex h-full w-full items-center justify-center bg-[color:var(--color-background)] ${className ?? ""}`}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </div>
  );
}
