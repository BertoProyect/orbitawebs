import { useEffect, useRef, type RefObject } from "react";
import {
  addLock,
  coarse,
  hex,
  Lock,
  reduce,
  removeLock,
  sizeCanvas,
  track,
  wake,
} from "../lib/hair-engine";

export type LockApi = {
  L: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

type Opts = {
  /** posición horizontal del nacimiento del mechón (0..1 del ancho) */
  x?: number;
  seed?: number;
  root: string;
  tip: string;
  /** se llama tras construir (o reconstruir al cambiar el tamaño) */
  onBuild?: (L: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/* Un mechón grande con física, dentro de un <canvas>, que reacciona al cursor o al dedo
   y solo se anima mientras se ve. */
export function useLock(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  opts: Opts,
) {
  const lockRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage || !canvas.getContext) return;
    let visible = false;
    let dropped = false;

    const build = () => {
      const o = optsRef.current;
      const r = sizeCanvas(canvas);
      if (r.width < 10 || r.height < 10) return;
      const w = Math.min(170, r.width * 0.4);
      const len = r.height * 0.76;
      const prev = lockRef.current;
      if (prev) removeLock(prev);
      const L = new (Lock as any)({
        // eslint-disable-line @typescript-eslint/no-explicit-any
        canvas,
        guides: 9,
        segs: 20,
        strands: coarse ? 170 : 260,
        width: w,
        length: len,
        taper: 0.22,
        ox: r.width * (o.x ?? 0.5),
        oy: r.height * 0.06,
        root: hex(o.root),
        tip: hex(o.tip),
        seed: o.seed ?? 4242,
        lineW: 0.95,
        big: true,
      });
      L.breeze = !reduce;
      L.visible = visible;
      lockRef.current = L;
      addLock(L);
      o.onBuild?.(L);
      if (!dropped && !reduce) {
        L.drop = -1;
      }
      L.draw();
      wake(L);
    };

    build();

    const io = new IntersectionObserver(
      (entries) => {
        const on = entries[entries.length - 1].isIntersecting;
        visible = on;
        const L = lockRef.current;
        if (!L) return;
        L.visible = on;
        if (on) {
          if (!dropped) {
            dropped = true;
            // Al aparecer, el mechón cae con su peso
            L.drop = 0;
            if (!reduce) {
              // Caída suave: el mechón empieza recogido hacia arriba (sin cruzar las guías)
              // y se estira con su peso
              for (let g = 0; g < L.G; g++)
                for (let i = 2; i <= L.S; i++) {
                  const j = L.idx(g, i);
                  const sway = Math.sin(i * 0.32) * i * 1.4;
                  L.x[j] = L.px[j] = L.restX(g, i) + sway;
                  L.y[j] = L.py[j] = L.oy + i * L.seg[g] * 0.38;
                }
              L.awake = 1;
            }
          }
          wake(L);
        }
      },
      { rootMargin: "80px 0px" },
    );
    io.observe(stage);
    const untrack = track(
      stage,
      () => (lockRef.current ? [lockRef.current] : []),
      coarse ? 46 : 64,
      1.6,
    );

    let rt = 0;
    let lastW = canvas.getBoundingClientRect().width;
    const ro = new ResizeObserver(() => {
      const w = canvas.getBoundingClientRect().width;
      if (Math.abs(w - lastW) < 2) return;
      lastW = w;
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        dropped = true;
        build();
      }, 180);
    });
    ro.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      untrack();
      window.clearTimeout(rt);
      if (lockRef.current) removeLock(lockRef.current);
      lockRef.current = null;
    };
  }, [canvasRef, stageRef]);

  return lockRef;
}

export { hex, wake, reduce, coarse };
