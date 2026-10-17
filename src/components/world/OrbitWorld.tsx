import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ProcessBuild } from "../ProcessScene3D";
import { processProgressSource } from "@/lib/world-state";

/**
 * MUNDO ÓRBITA — el fondo 3D de toda la portada.
 *
 * Un planeta azul con su anillo (el isologo en 3D) y, alrededor, una isla
 * flotante por cada sección de la página. El scroll mueve una cámara que
 * "vuela por el mundo": se queda en la isla de la sección que estás leyendo
 * (con una ligera órbita mientras lees) y, al pasar a la siguiente sección,
 * sube, sobrevuela y baja a la isla siguiente.
 *
 * Cómo se conecta con la página: cada sección lleva `data-world-scene="N"`.
 * En cada fotograma se mira qué sección cruza el centro de la pantalla y
 * cuánto falta para la siguiente; de ahí sale la posición de la cámara. No
 * hay que tocar nada aquí si cambian las alturas (secciones fijadas con
 * GSAP incluidas): se mide en vivo.
 *
 * Todo es geometría simple (sin modelos ni texturas externas salvo las
 * capturas del portfolio), así que pesa poco y funciona en móvil.
 */

const BRAND = "#005ad9";
const SKY = "#2997ff";
const INK = "#1d1d1f";

type V3 = [number, number, number];

// ---------------------------------------------------------------------------
// Dónde está cada isla (escenas 1-5). La 0 es la vista de llegada y la 6 la
// panorámica final.
// ---------------------------------------------------------------------------
const ISLANDS: Record<number, V3> = {
  1: [-26, 4, 6], // Qué incluye: dispositivos
  2: [25, -1, 9], // Proceso: el taller donde se construye la web
  3: [-12, -5, -26], // Con quién trabajamos: un barrio de negocios
  4: [23, 7, -21], // Portfolio: pantallas flotantes
  5: [3, 14, 27], // Contacto: antena que emite
};

/**
 * Giro (rad) del punto de vista de cada isla respecto a la línea isla-planeta.
 * Sin él, el planeta queda justo detrás de cada escena y la tapa; con él, se
 * ve de fondo a un lado. La isla gira lo mismo para seguir mirando a cámara.
 */
const ISLAND_YAW: Record<number, number> = { 1: 0.6, 2: -1.3, 3: 0.55, 4: -1.15, 5: 1.25 };

/** Encuadre: desplaza el punto de interés en la pantalla (fracciones). */
interface Framing {
  dx: number; // ordenador: + = a la derecha
  dy: number; // ordenador: + = hacia arriba
  mdx: number; // móvil
  mdy: number;
}

interface Shot {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  /** Giro alrededor del objetivo durante la lectura de la sección (rad). */
  orbit: number;
  frame: Framing;
}

function islandShot(
  idx: number,
  opts: { dist: number; height: number; lookY: number; orbit: number; frame: Framing },
): Shot {
  const c = new THREE.Vector3(...ISLANDS[idx]);
  // la cámara se coloca "por fuera" de la isla, mirando hacia el planeta:
  // así el planeta aparece de fondo detrás de cada escena
  const out = new THREE.Vector3(c.x, 0, c.z)
    .normalize()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), ISLAND_YAW[idx] ?? 0);
  return {
    pos: c.clone().addScaledVector(out, opts.dist).add(new THREE.Vector3(0, opts.height, 0)),
    target: c.clone().add(new THREE.Vector3(0, opts.lookY, 0)),
    orbit: opts.orbit,
    frame: opts.frame,
  };
}

const SHOTS: Shot[] = [
  // 0 · Llegada (hero): el sistema completo, lejos, en el espacio
  {
    pos: new THREE.Vector3(16, 16, 92),
    target: new THREE.Vector3(0, 0, 0),
    orbit: 0.18,
    frame: { dx: 0.04, dy: -0.28, mdx: 0, mdy: -0.32 },
  },
  // 1 · Qué incluye
  islandShot(1, {
    dist: 10.5,
    height: 5.2,
    lookY: 0.8,
    orbit: 0.9,
    frame: { dx: 0.3, dy: -0.04, mdx: 0, mdy: -0.36 },
  }),
  // 2 · Proceso (el taller)
  islandShot(2, {
    dist: 7.6,
    height: 2.4,
    lookY: 1.75,
    orbit: 0.3,
    frame: { dx: 0.24, dy: 0, mdx: 0, mdy: 0.2 },
  }),
  // 3 · Con quién trabajamos
  islandShot(3, {
    dist: 12,
    height: 6,
    lookY: 0.6,
    orbit: 0.6,
    frame: { dx: 0.36, dy: 0.02, mdx: 0, mdy: 0.26 },
  }),
  // 4 · Portfolio
  islandShot(4, {
    dist: 11,
    height: 4.2,
    lookY: 1.4,
    orbit: 0.5,
    frame: { dx: 0.26, dy: 0.24, mdx: 0, mdy: 0.3 },
  }),
  // 5 · Contacto
  islandShot(5, {
    dist: 9,
    height: 3.6,
    lookY: 1.6,
    orbit: 0.45,
    frame: { dx: 0.36, dy: -0.12, mdx: 0, mdy: -0.34 },
  }),
  // 6 · Despedida (FAQ + pie): todo el mundo desde arriba
  {
    pos: new THREE.Vector3(-8, 50, 76),
    target: new THREE.Vector3(0, -2, 0),
    orbit: 0.35,
    frame: { dx: -0.2, dy: 0, mdx: 0, mdy: 0.1 },
  },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function bezier(out: THREE.Vector3, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, t: number) {
  const it = 1 - t;
  const a = it * it * it;
  const b = 3 * it * it * t;
  const c = 3 * it * t * t;
  const d = t * t * t;
  out.set(
    a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    a * p0.z + b * p1.z + c * p2.z + d * p3.z,
  );
  return out;
}

/** Posición de cámara de una escena para un avance de lectura d (0..1). */
function shotPose(s: Shot, d: number, k: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  outTarget.copy(s.target);
  outPos.copy(s.pos).sub(s.target).multiplyScalar(k);
  outPos.applyAxisAngle(UP, s.orbit * (d - 0.5));
  outPos.add(s.target);
}
const UP = new THREE.Vector3(0, 1, 0);

interface ScrollReading {
  from: number;
  to: number;
  u: number; // 0..1 vuelo de `from` a `to`
  dFrom: number; // avance de lectura en la escena de salida
  dTo: number; // en la de llegada
}

/** Lee el DOM: qué escena se está leyendo y cuánto falta para la siguiente. */
function readScroll(els: HTMLElement[]): ScrollReading {
  const vh = window.innerHeight;
  const c = vh * 0.5;
  const T = vh * 0.45; // medio tramo de vuelo (un vuelo ≈ 0,9 pantallas de scroll)
  const n = els.length;
  if (!n) return { from: 0, to: 0, u: 0, dFrom: 0.5, dTo: 0.5 };
  const rects = els.map((el) => el.getBoundingClientRect());
  const scene = (i: number) => Number(els[i].dataset.worldScene ?? 0);
  const dwell = (i: number) => {
    const r = rects[i];
    const span = r.height - 2 * T;
    return span <= 0 ? 0.5 : clamp01((c - (r.top + T)) / span);
  };

  let i = rects.findIndex((r) => r.top <= c && r.bottom > c);
  if (i === -1) i = rects[0].top > c ? 0 : n - 1;
  const r = rects[i];

  if (i + 1 < n && r.bottom - c < T) {
    return { from: scene(i), to: scene(i + 1), u: (T - (r.bottom - c)) / (2 * T), dFrom: 1, dTo: 0 };
  }
  if (i > 0 && c - r.top < T) {
    return { from: scene(i - 1), to: scene(i), u: 0.5 + (c - r.top) / (2 * T), dFrom: 1, dTo: 0 };
  }
  const d = dwell(i);
  return { from: scene(i), to: scene(i), u: 0, dFrom: d, dTo: d };
}

// ---------------------------------------------------------------------------
// Cámara
// ---------------------------------------------------------------------------
function CameraRig({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const { camera, size } = useThree();
  const els = useRef<HTMLElement[]>([]);
  const pos = useMemo(() => new THREE.Vector3().copy(SHOTS[0].pos), []);
  const target = useMemo(() => new THREE.Vector3().copy(SHOTS[0].target), []);
  const frame = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const tmp = useMemo(
    () => ({
      aPos: new THREE.Vector3(),
      aTgt: new THREE.Vector3(),
      bPos: new THREE.Vector3(),
      bTgt: new THREE.Vector3(),
      p1: new THREE.Vector3(),
      p2: new THREE.Vector3(),
      wantPos: new THREE.Vector3(),
      wantTgt: new THREE.Vector3(),
      dir: new THREE.Vector3(),
    }),
    [],
  );
  const first = useRef(true);

  useEffect(() => {
    const collect = () => {
      els.current = Array.from(document.querySelectorAll<HTMLElement>("[data-world-scene]"));
    };
    collect();
    const id = window.setInterval(collect, 1500);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.05);
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    // en pantallas verticales la cámara se aleja para que la isla quepa
    const k = THREE.MathUtils.clamp(1.6 / aspect, 1, 2.4);

    const r = readScroll(els.current);
    let u = easeInOut(clamp01(r.u));
    if (reducedMotion) u = r.u < 0.5 ? 0 : 1; // sin vuelos: cambio directo de escena

    const A = SHOTS[r.from] ?? SHOTS[0];
    const B = SHOTS[r.to] ?? A;
    shotPose(A, reducedMotion ? 0.5 : r.dFrom, k, tmp.aPos, tmp.aTgt);
    shotPose(B, reducedMotion ? 0.5 : r.dTo, k, tmp.bPos, tmp.bTgt);

    if (r.from === r.to || u <= 0) {
      tmp.wantPos.copy(tmp.aPos);
      tmp.wantTgt.copy(tmp.aTgt);
    } else if (u >= 1) {
      tmp.wantPos.copy(tmp.bPos);
      tmp.wantTgt.copy(tmp.bTgt);
    } else {
      // vuelo: sale hacia atrás y arriba de A, sobrevuela y baja a B
      const dist = tmp.aPos.distanceTo(tmp.bPos);
      const lift = Math.max(7, dist * 0.42);
      tmp.dir.copy(tmp.aPos).sub(tmp.aTgt).normalize();
      tmp.p1.copy(tmp.aPos).addScaledVector(tmp.dir, 4).add(new THREE.Vector3(0, lift, 0));
      tmp.dir.copy(tmp.bPos).sub(tmp.bTgt).normalize();
      tmp.p2.copy(tmp.bPos).addScaledVector(tmp.dir, 4).add(new THREE.Vector3(0, lift, 0));
      bezier(tmp.wantPos, tmp.aPos, tmp.p1, tmp.p2, tmp.bPos, u);
      tmp.wantTgt.lerpVectors(tmp.aTgt, tmp.bTgt, u);
    }

    // parallax del ratón (solo ordenador) y respiración mínima de cámara
    const pt = pointer.current;
    pt.sx = THREE.MathUtils.damp(pt.sx, pt.x, 2, delta);
    pt.sy = THREE.MathUtils.damp(pt.sy, pt.y, 2, delta);
    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      tmp.wantPos.x += Math.sin(t * 0.25) * 0.15 + pt.sx * 0.6;
      tmp.wantPos.y += Math.sin(t * 0.33) * 0.1 - pt.sy * 0.35;
    }

    // la cámara persigue a la posición deseada: absorbe tirones del scroll
    if (first.current || reducedMotion) {
      pos.copy(tmp.wantPos);
      target.copy(tmp.wantTgt);
      first.current = false;
    } else {
      const lambda = mobile ? 6 : 4.5;
      pos.x = THREE.MathUtils.damp(pos.x, tmp.wantPos.x, lambda, delta);
      pos.y = THREE.MathUtils.damp(pos.y, tmp.wantPos.y, lambda, delta);
      pos.z = THREE.MathUtils.damp(pos.z, tmp.wantPos.z, lambda, delta);
      target.x = THREE.MathUtils.damp(target.x, tmp.wantTgt.x, lambda, delta);
      target.y = THREE.MathUtils.damp(target.y, tmp.wantTgt.y, lambda, delta);
      target.z = THREE.MathUtils.damp(target.z, tmp.wantTgt.z, lambda, delta);
    }
    cam.position.copy(pos);
    cam.lookAt(target);

    // encuadre: desplaza la imagen para dejar sitio al texto de cada sección
    const fA = A.frame;
    const fB = B.frame;
    const fx = mobile ? fA.mdx + (fB.mdx - fA.mdx) * u : fA.dx + (fB.dx - fA.dx) * u;
    const fy = mobile ? fA.mdy + (fB.mdy - fA.mdy) * u : fA.dy + (fB.dy - fA.dy) * u;
    frame.current.x = reducedMotion ? fx : THREE.MathUtils.damp(frame.current.x, fx, 4, delta);
    frame.current.y = reducedMotion ? fy : THREE.MathUtils.damp(frame.current.y, fy, 4, delta);
    const w = size.width;
    const h = size.height;
    cam.setViewOffset(w, h, -frame.current.x * w, frame.current.y * h, w, h);
    cam.updateProjectionMatrix();
  });

  return null;
}

// ---------------------------------------------------------------------------
// Piezas del mundo
// ---------------------------------------------------------------------------
function Stars({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    let seed = 11;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < count; i++) {
      const r = 110 + rnd() * 120;
      const th = rnd() * Math.PI * 2;
      const ph = Math.acos(2 * rnd() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.cos(ph);
      arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
  useEffect(() => () => geom.dispose(), [geom]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.004;
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#ffffff" size={0.55} sizeAttenuation transparent opacity={0.75} fog={false} />
    </points>
  );
}

function Planet() {
  const ring = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (body.current) body.current.rotation.y += dt * 0.03;
    if (ring.current) ring.current.rotation.z += dt * 0.02;
  });
  return (
    <group>
      <mesh ref={body}>
        <icosahedronGeometry args={[4, 4]} />
        <meshStandardMaterial color={BRAND} roughness={0.55} metalness={0.05} flatShading />
      </mesh>
      {/* el anillo del isologo */}
      <group rotation={[1.12, 0.3, -0.55]}>
        <group ref={ring}>
          <mesh>
            <torusGeometry args={[6.8, 0.17, 12, 220]} />
            <meshStandardMaterial color="#f5f5f7" roughness={0.35} />
          </mesh>
          <mesh position={[6.8, 0, 0]}>
            <sphereGeometry args={[0.32, 20, 20]} />
            <meshBasicMaterial color={SKY} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Roca flotante sobre la que se monta cada escena. Mira hacia la cámara. */
function Island({
  idx,
  radius = 3,
  children,
}: {
  idx: number;
  radius?: number;
  children?: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const [x, y, z] = ISLANDS[idx];
  const facing = Math.atan2(x, z) + (ISLAND_YAW[idx] ?? 0);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = y + Math.sin(state.clock.elapsedTime * 0.6 + idx) * 0.18;
  });
  return (
    <group ref={ref} position={[x, y, z]} rotation={[0, facing, 0]}>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[radius, radius * 0.86, 0.6, 10]} />
        <meshStandardMaterial color="#2c2c2e" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[radius * 0.97, radius * 0.97, 0.02, 10]} />
        <meshStandardMaterial color="#48484a" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, -1.75, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius * 0.86, 2.3, 10]} />
        <meshStandardMaterial color="#1c1c1e" roughness={1} flatShading />
      </mesh>
      {children}
    </group>
  );
}

function ScreenBars({ w, h, light }: { w: number; h: number; light?: boolean }) {
  // contenido abstracto de una web: menú, titular, imagen, tarjetas
  const fg = light ? INK : "#f5f5f7";
  return (
    <group>
      <mesh position={[0, h * 0.38, 0.002]}>
        <planeGeometry args={[w * 0.86, h * 0.06]} />
        <meshBasicMaterial color={light ? "#e8e8ed" : "#3a3a3c"} />
      </mesh>
      <mesh position={[-w * 0.18, h * 0.15, 0.002]}>
        <planeGeometry args={[w * 0.4, h * 0.1]} />
        <meshBasicMaterial color={fg} />
      </mesh>
      <mesh position={[-w * 0.24, h * 0.0, 0.002]}>
        <planeGeometry args={[w * 0.28, h * 0.1]} />
        <meshBasicMaterial color={fg} />
      </mesh>
      <mesh position={[w * 0.22, h * 0.06, 0.002]}>
        <planeGeometry args={[w * 0.36, h * 0.34]} />
        <meshBasicMaterial color={SKY} toneMapped={false} />
      </mesh>
      <mesh position={[-w * 0.3, -h * 0.17, 0.002]}>
        <planeGeometry args={[w * 0.16, h * 0.08]} />
        <meshBasicMaterial color={BRAND} toneMapped={false} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * w * 0.29, -h * 0.36, 0.002]}>
          <planeGeometry args={[w * 0.25, h * 0.16]} />
          <meshBasicMaterial color={light ? "#f5f5f7" : "#2c2c2e"} />
        </mesh>
      ))}
    </group>
  );
}

/** 1 · Qué incluye: portátil, móvil y tablet con la misma web; un anillo de
 *  "velocidad" gira encima. */
function DevicesIsland() {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (ring.current) {
      ring.current.rotation.z -= dt * 1.2;
      ring.current.position.y = 2.9 + Math.sin(state.clock.elapsedTime) * 0.12;
    }
  });
  return (
    <Island idx={1} radius={3.2}>
      {/* portátil */}
      <group position={[-0.3, 0, 0.2]}>
        <RoundedBox args={[2.6, 0.08, 1.7]} radius={0.04} position={[0, 0.06, 0]}>
          <meshStandardMaterial color="#d2d2d7" roughness={0.35} metalness={0.4} />
        </RoundedBox>
        <group position={[0, 0.1, -0.82]} rotation={[-0.22, 0, 0]}>
          <RoundedBox args={[2.6, 1.65, 0.06]} radius={0.04} position={[0, 0.82, 0]}>
            <meshStandardMaterial color="#2c2c2e" roughness={0.4} metalness={0.3} />
          </RoundedBox>
          <group position={[0, 0.82, 0.032]}>
            <mesh>
              <planeGeometry args={[2.42, 1.48]} />
              <meshBasicMaterial color="#fbfbfd" />
            </mesh>
            <ScreenBars w={2.42} h={1.48} light />
          </group>
        </group>
      </group>
      {/* móvil */}
      <group position={[1.75, 0.66, 0.6]} rotation={[0, -0.35, 0]}>
        <RoundedBox args={[0.62, 1.26, 0.07]} radius={0.08}>
          <meshStandardMaterial color={INK} roughness={0.3} metalness={0.5} />
        </RoundedBox>
        <group position={[0, 0, 0.037]}>
          <mesh>
            <planeGeometry args={[0.54, 1.16]} />
            <meshBasicMaterial color="#fbfbfd" />
          </mesh>
          <ScreenBars w={0.54} h={1.16} light />
        </group>
      </group>
      {/* tablet */}
      <group position={[-2.1, 0.62, 0.9]} rotation={[0, 0.45, 0]}>
        <RoundedBox args={[1.0, 1.36, 0.06]} radius={0.06}>
          <meshStandardMaterial color="#3a3a3c" roughness={0.3} metalness={0.4} />
        </RoundedBox>
        <group position={[0, 0, 0.032]}>
          <mesh>
            <planeGeometry args={[0.9, 1.24]} />
            <meshBasicMaterial color="#fbfbfd" />
          </mesh>
          <ScreenBars w={0.9} h={1.24} light />
        </group>
      </group>
      <mesh ref={ring} position={[0.9, 2.9, -0.4]}>
        <torusGeometry args={[0.55, 0.06, 10, 48, Math.PI * 1.5]} />
        <meshBasicMaterial color={SKY} toneMapped={false} />
      </mesh>
    </Island>
  );
}

/** 2 · Proceso: la web que se construye sola (misma escena de antes). */
function WorkshopIsland({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Island idx={2} radius={2.4}>
      <group position={[0, 1.7, 0]}>
        <ProcessBuild progressRef={processProgressSource} reducedMotion={reducedMotion} fit={0.72} />
      </group>
    </Island>
  );
}

/** 3 · Con quién trabajamos: un barrio de pequeños negocios. */
const BUILDINGS: { p: V3; s: V3; c: string; awning: string }[] = [
  { p: [-1.7, 0, -0.6], s: [1.1, 1.5, 1.0], c: "#f5f5f7", awning: BRAND },
  { p: [-0.4, 0, -1.1], s: [1.0, 2.2, 1.0], c: "#d2d2d7", awning: SKY },
  { p: [0.85, 0, -0.7], s: [1.2, 1.2, 1.0], c: "#e8e8ed", awning: BRAND },
  { p: [2.0, 0, -0.1], s: [0.9, 1.7, 0.9], c: "#c7c7cc", awning: SKY },
  { p: [-1.1, 0, 1.2], s: [0.9, 1.0, 0.8], c: "#e8e8ed", awning: BRAND },
];
const TREES: V3[] = [
  [0.4, 0, 1.0],
  [1.4, 0, 1.4],
  [-2.3, 0, 0.7],
  [2.4, 0, -1.4],
];

function TownIsland() {
  return (
    <Island idx={3} radius={3.3}>
      {BUILDINGS.map((b, i) => (
        <group key={i} position={[b.p[0], b.s[1] / 2, b.p[2]]}>
          <mesh>
            <boxGeometry args={b.s} />
            <meshStandardMaterial color={b.c} roughness={0.8} flatShading />
          </mesh>
          {/* tejado */}
          <mesh position={[0, b.s[1] / 2 + 0.05, 0]}>
            <boxGeometry args={[b.s[0] + 0.08, 0.1, b.s[2] + 0.08]} />
            <meshStandardMaterial color="#636366" roughness={0.9} />
          </mesh>
          {/* toldo */}
          <mesh position={[0, -b.s[1] / 2 + 0.62, b.s[2] / 2 + 0.16]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[b.s[0] * 0.86, 0.04, 0.38]} />
            <meshStandardMaterial color={b.awning} roughness={0.6} />
          </mesh>
          {/* escaparate iluminado */}
          <mesh position={[0, -b.s[1] / 2 + 0.3, b.s[2] / 2 + 0.005]}>
            <planeGeometry args={[b.s[0] * 0.7, 0.4]} />
            <meshBasicMaterial color="#ffd78a" toneMapped={false} />
          </mesh>
          {/* ventanas */}
          {b.s[1] > 1.4 &&
            [-0.22, 0.22].map((wx) => (
              <mesh key={wx} position={[wx * b.s[0], b.s[1] / 2 - 0.45, b.s[2] / 2 + 0.005]}>
                <planeGeometry args={[0.2, 0.26]} />
                <meshBasicMaterial color={i % 2 ? "#ffe2a8" : "#3a3a3c"} toneMapped={false} />
              </mesh>
            ))}
        </group>
      ))}
      {TREES.map((t, i) => (
        <group key={i} position={t}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.36, 6]} />
            <meshStandardMaterial color="#5c4a3a" />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <coneGeometry args={[0.32, 0.8, 7]} />
            <meshStandardMaterial color="#2f6b4f" roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
    </Island>
  );
}

/** 4 · Portfolio: las capturas reales de los proyectos, flotando. */
function ScreensIsland() {
  const tex = useTexture([
    "/portfolio/naturaleza-desktop.webp",
    "/portfolio/berto-bio-desktop.webp",
    "/portfolio/naturaleza-y-viajes.webp",
  ]);
  useEffect(() => {
    tex.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    });
  }, [tex]);
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });
  const screens: { tex: THREE.Texture; p: V3; r: number; w: number; h: number }[] = [
    { tex: tex[0], p: [-1.1, 1.6, 0.2], r: 0.28, w: 2.6, h: 1.36 },
    { tex: tex[1], p: [1.2, 2.1, -0.5], r: -0.25, w: 2.6, h: 1.36 },
    { tex: tex[2], p: [0.25, 1.1, 1.1], r: -0.05, w: 0.66, h: 1.28 },
  ];
  return (
    <Island idx={4} radius={2.8}>
      <group ref={group}>
        {screens.map((s, i) => (
          <group key={i} position={s.p} rotation={[0, s.r, 0]}>
            <RoundedBox args={[s.w + 0.1, s.h + 0.1, 0.05]} radius={0.04}>
              <meshStandardMaterial color={INK} roughness={0.4} metalness={0.4} />
            </RoundedBox>
            <mesh position={[0, 0, 0.027]}>
              <planeGeometry args={[s.w, s.h]} />
              <meshBasicMaterial map={s.tex} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </Island>
  );
}

/** 5 · Contacto: una antena que emite ondas. */
function BeaconIsland({ reducedMotion }: { reducedMotion: boolean }) {
  const waves = useRef<Array<THREE.Mesh | null>>([]);
  const lamp = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    waves.current.forEach((m, i) => {
      if (!m) return;
      const ph = reducedMotion ? 0.35 + i * 0.25 : (t * 0.45 + i / 3) % 1;
      m.scale.setScalar(0.4 + ph * 5.5);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.8;
    });
    if (lamp.current) lamp.current.color.setScalar(0.6 + 0.4 * Math.abs(Math.sin(t * 2.2)));
  });
  return (
    <Island idx={5} radius={2.6}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.07, 0.14, 2.8, 8]} />
        <meshStandardMaterial color="#d2d2d7" roughness={0.4} metalness={0.5} />
      </mesh>
      <group position={[0, 2.0, 0.15]} rotation={[-0.9, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.85, 28, 12, 0, Math.PI * 2, 0, Math.PI / 3.2]} />
          <meshStandardMaterial color="#f5f5f7" roughness={0.3} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <mesh position={[0, 2.95, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial ref={lamp} color={SKY} toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, 2.95, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          ref={(el) => {
            waves.current[i] = el;
          }}
        >
          <torusGeometry args={[0.5, 0.012, 6, 80]} />
          <meshBasicMaterial color={SKY} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </Island>
  );
}

// ---------------------------------------------------------------------------
export function OrbitWorld() {
  const { reducedMotion, mobile } = useMemo(() => {
    if (typeof window === "undefined") return { reducedMotion: false, mobile: false };
    return {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      mobile: window.matchMedia("(pointer: coarse), (max-width: 860px)").matches,
    };
  }, []);

  return (
    <Canvas
      flat
      dpr={mobile ? [1, 1.25] : [1, 1.6]}
      camera={{ fov: 40, near: 0.1, far: 400, position: SHOTS[0].pos.toArray() }}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 70, 200]} />
      <hemisphereLight args={["#bcd6ff", "#0a0a0c", 0.55]} />
      <directionalLight position={[14, 18, 12]} intensity={2.1} />
      <directionalLight position={[-14, 6, -18]} intensity={1.3} color={SKY} />
      <ambientLight intensity={0.18} />

      <CameraRig reducedMotion={reducedMotion} mobile={mobile} />
      <Stars count={mobile ? 700 : 1800} />
      <Planet />
      <DevicesIsland />
      <WorkshopIsland reducedMotion={reducedMotion} />
      <TownIsland />
      <Suspense fallback={null}>
        <ScreensIsland />
      </Suspense>
      <BeaconIsland reducedMotion={reducedMotion} />
    </Canvas>
  );
}
