import { Suspense, lazy } from "react";
const Spline = lazy(() => import("@splinetool/react-spline"));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
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
      {/* Tapa la marca de agua "Built with Spline" (esquina inferior derecha) */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-11 w-40 bg-[color:var(--color-background)]" />
    </div>
  );
}
