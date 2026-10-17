import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * Escena 3D de la sección "Proceso". Cuenta los 4 pasos con una web que se
 * construye sola a medida que se hace scroll:
 *
 *   0 · (antes de empezar) piezas sueltas flotando: "tu negocio"
 *   1 · Demo gratuita      → las piezas se juntan en un plano azul (wireframe)
 *   2 · Lo afinamos juntos → se recolocan, toman color; aparece la paleta
 *   3 · La construimos     → la web se vuelve sólida y aparece la versión móvil
 *   4 · Sale a trabajar    → gira hacia ti y un anillo orbita a su alrededor
 *
 * No usa texturas, modelos ni fuentes externas: solo cajas, así que pesa
 * casi nada y va fluido. El progreso llega por una ref (0..1) que actualiza
 * el scroll, sin re-renders de React.
 */

const BRAND = "#005ad9";
const SKY = "#2997ff";
const INK = "#1d1d1f";

type V3 = [number, number, number];

interface Block {
  /** Posición final (diseño aprobado). */
  p: V3;
  /** Posición en el plano de la demo (paso 1): algunas piezas cambian de lado. */
  demo: V3;
  s: V3;
  color: string;
  glow?: number;
}

// Maqueta de una web dentro de una ventana de 4,4 x 3 unidades.
const BLOCKS: Block[] = [
  { p: [0.3, 1.02, 0.07], demo: [0.3, 1.02, 0.07], s: [3.3, 0.13, 0.04], color: "#e8e8ed" }, // menú
  { p: [-1.72, 1.02, 0.09], demo: [-1.72, 1.02, 0.09], s: [0.4, 0.18, 0.05], color: BRAND }, // logo
  { p: [-0.98, 0.58, 0.08], demo: [1.02, 0.58, 0.08], s: [1.9, 0.24, 0.05], color: INK }, // titular 1
  { p: [-1.23, 0.24, 0.08], demo: [0.77, 0.24, 0.08], s: [1.4, 0.24, 0.05], color: INK }, // titular 2
  { p: [-1.08, -0.07, 0.07], demo: [0.92, -0.07, 0.07], s: [1.7, 0.1, 0.04], color: "#86868b" }, // texto
  { p: [-1.48, -0.38, 0.1], demo: [0.52, -0.38, 0.1], s: [0.8, 0.2, 0.06], color: BRAND, glow: 0.35 }, // botón
  { p: [1.05, 0.22, 0.08], demo: [-1.05, 0.22, 0.08], s: [1.8, 1.2, 0.06], color: "#4f95f5" }, // imagen
  { p: [-1.4, -0.98, 0.07], demo: [-1.4, -0.98, 0.07], s: [1.2, 0.62, 0.05], color: "#f5f5f7" }, // tarjeta
  { p: [0, -0.98, 0.07], demo: [0, -0.98, 0.07], s: [1.2, 0.62, 0.05], color: "#f5f5f7" }, // tarjeta
  { p: [1.4, -0.98, 0.07], demo: [1.4, -0.98, 0.07], s: [1.2, 0.62, 0.05], color: "#f5f5f7" }, // tarjeta
];

const SWATCHES = [BRAND, SKY, INK, "#e8e8ed"];

// Aleatorio con semilla: las piezas sueltas salen siempre igual.
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Devuelve [tramo, mezcla] para un progreso 0..1 repartido en 4 pasos. */
function stageOf(progress: number): [number, number] {
  const t = clamp01(progress) * 4;
  const seg = Math.min(3, Math.floor(t));
  // la transición ocupa el primer 65 % de cada paso; el resto se queda quieta
  const mix = ease(clamp01((t - seg) / 0.65));
  return [seg, mix];
}

/** Interpola un valor definido para los 5 estados (0..4). */
function pick(values: number[], seg: number, mix: number) {
  return values[seg] + (values[seg + 1] - values[seg]) * mix;
}

function Scene({
  progressRef,
  reducedMotion,
}: {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const blockRefs = useRef<Array<THREE.Group | null>>([]);
  const frameFill = useRef<THREE.MeshStandardMaterial>(null);
  const frameEdge = useRef<THREE.LineBasicMaterial>(null);
  const barRef = useRef<THREE.Group>(null);
  const swatchRefs = useRef<Array<THREE.Mesh | null>>([]);
  const phoneRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const satRefs = useRef<Array<THREE.Mesh | null>>([]);
  const shown = useRef(0);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  const unitBox = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const unitEdges = useMemo(() => new THREE.EdgesGeometry(unitBox), [unitBox]);
  const frameEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(4.4, 3, 0.1)),
    [],
  );

  const mats = useMemo(
    () =>
      BLOCKS.map((b) => ({
        fill: new THREE.MeshStandardMaterial({
          color: SKY,
          roughness: 0.45,
          metalness: 0.05,
          transparent: true,
          emissive: new THREE.Color(b.glow ? b.color : "#000000"),
          emissiveIntensity: 0,
        }),
        edge: new THREE.LineBasicMaterial({ color: SKY, transparent: true }),
        final: new THREE.Color(b.color),
      })),
    [],
  );

  // Posiciones y giros de las piezas sueltas (estado 0)
  const scatter = useMemo(() => {
    const r = seeded(7);
    return BLOCKS.map(() => ({
      p: [(r() - 0.5) * 6.4, (r() - 0.5) * 4.6, (r() - 0.5) * 3 - 0.4] as V3,
      r: [(r() - 0.5) * 1.6, (r() - 0.5) * 1.6, (r() - 0.5) * 1.2] as V3,
    }));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(
    () => () => {
      unitBox.dispose();
      unitEdges.dispose();
      frameEdges.dispose();
      mats.forEach((m) => {
        m.fill.dispose();
        m.edge.dispose();
      });
    },
    [unitBox, unitEdges, frameEdges, mats],
  );

  const sky = useMemo(() => new THREE.Color(SKY), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.05);
    // Suaviza el progreso: la escena "persigue" al scroll en vez de dar saltos
    shown.current = reducedMotion
      ? progressRef.current
      : THREE.MathUtils.damp(shown.current, progressRef.current, 3.2, delta);
    const [seg, mix] = stageOf(shown.current);
    const time = state.clock.elapsedTime;

    // Encaja la escena en el ancho disponible
    const fit = Math.min(1.3, state.viewport.width / 5.9, state.viewport.height / 4.4);
    if (root.current) root.current.scale.setScalar(fit);

    // Giro general por estado + ligera flotación + parallax del ratón
    const pt = pointer.current;
    pt.sx = THREE.MathUtils.damp(pt.sx, pt.x, 2.5, delta);
    pt.sy = THREE.MathUtils.damp(pt.sy, pt.y, 2.5, delta);
    const idle = reducedMotion ? 0 : 1;
    if (tilt.current) {
      tilt.current.rotation.x =
        pick([0.18, -0.14, -0.06, -0.1, 0.06], seg, mix) + pt.sy * 0.08 * idle + Math.sin(time * 0.6) * 0.02 * idle;
      tilt.current.rotation.y =
        pick([-0.6, 0.42, 0.16, -0.36, -0.14], seg, mix) + pt.sx * 0.14 * idle + Math.sin(time * 0.4) * 0.03 * idle;
      tilt.current.rotation.z = pick([0.06, 0, 0, 0.02, 0], seg, mix);
      tilt.current.position.x = pick([0, 0, -0.2, -0.38, -0.3], seg, mix);
      tilt.current.position.y = pick([0, 0, 0, 0.05, 0.12], seg, mix) + Math.sin(time * 0.8) * 0.04 * idle;
    }

    // Piezas de la web
    const fillOp = [0.6, 0.1, 0.88, 1, 1];
    const edgeOp = [0.0, 0.95, 0.25, 0, 0];
    const depth = [0.9, 1, 1, 2.6, 1.6];
    BLOCKS.forEach((b, i) => {
      const g = blockRefs.current[i];
      if (!g) return;
      const sc = scatter[i];
      const xs = [sc.p[0], b.demo[0], b.p[0], b.p[0], b.p[0]];
      const ys = [sc.p[1], b.demo[1], b.p[1], b.p[1], b.p[1]];
      const zs = [sc.p[2], b.demo[2], b.p[2], b.p[2] + 0.1, b.p[2]];
      g.position.set(pick(xs, seg, mix), pick(ys, seg, mix), pick(zs, seg, mix));
      // las piezas sueltas giran despacio sobre sí mismas
      const spin = seg === 0 ? (1 - mix) * Math.sin(time * 0.5 + i) * 0.15 * idle : 0;
      g.rotation.set(
        pick([sc.r[0], 0, 0, 0, 0], seg, mix) + spin,
        pick([sc.r[1], 0, 0, 0, 0], seg, mix) + spin,
        pick([sc.r[2], 0, 0, 0, 0], seg, mix),
      );
      g.scale.set(b.s[0], b.s[1], b.s[2] * pick(depth, seg, mix));

      const m = mats[i];
      m.fill.opacity = pick(fillOp, seg, mix);
      m.edge.opacity = pick(edgeOp, seg, mix);
      // color: azul plano en los estados 0-1, color real a partir del 2
      const colorMix = pick([0, 0, 1, 1, 1], seg, mix);
      tmp.copy(sky).lerp(m.final, colorMix);
      m.fill.color.copy(tmp);
      m.fill.emissiveIntensity = b.glow ? pick([0, 0, 0.1, 0.3, 0.6], seg, mix) : 0;
    });

    // Ventana del navegador
    if (frameFill.current) frameFill.current.opacity = pick([0, 0.05, 0.6, 1, 1], seg, mix);
    if (frameEdge.current) frameEdge.current.opacity = pick([0, 0.9, 0.25, 0, 0], seg, mix);
    if (barRef.current) {
      const v = pick([0, 0, 1, 1, 1], seg, mix);
      barRef.current.scale.setScalar(Math.max(0.0001, v));
    }

    // Paleta de colores (solo en "Lo afinamos juntos")
    const swatchV = pick([0, 0, 1, 0, 0], seg, mix);
    swatchRefs.current.forEach((m, i) => {
      if (!m) return;
      m.scale.setScalar(Math.max(0.0001, swatchV * 0.17));
      const a = time * 0.7 + i * (Math.PI / 2);
      m.position.set(2.75 + Math.cos(a) * 0.08 * idle, 0.95 - i * 0.62 + Math.sin(a) * 0.06 * idle, 0.35);
    });

    // Versión móvil (desde "La construimos")
    if (phoneRef.current) {
      const v = pick([0, 0, 0, 1, 1], seg, mix);
      phoneRef.current.scale.setScalar(Math.max(0.0001, v));
      phoneRef.current.position.set(2.6, -0.5 + (1 - v) * -0.6, 0.85);
      phoneRef.current.rotation.set(0.05, -0.5 + Math.sin(time * 0.5) * 0.04 * idle, 0.02);
    }

    // Anillo en órbita (al publicar)
    if (ringRef.current) {
      const v = pick([0, 0, 0, 0, 1], seg, mix);
      ringRef.current.scale.setScalar(Math.max(0.0001, 0.6 + v * 0.4));
      ringRef.current.visible = v > 0.01;
      ringRef.current.rotation.z = -0.22 + time * 0.05 * idle;
      satRefs.current.forEach((s, i) => {
        if (!s) return;
        const a = time * (0.55 + i * 0.12) * (idle || 0.0) + i * 2.1;
        s.position.set(Math.cos(a) * 2.8, Math.sin(a) * 2.8, 0);
        const mat = s.material as THREE.MeshBasicMaterial;
        mat.opacity = v;
      });
      const ringMat = (ringRef.current.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
      ringMat.opacity = v * 0.9;
    }
  });

  return (
    <group ref={root}>
      <group ref={tilt}>
        {/* Ventana */}
        <RoundedBox args={[4.4, 3, 0.1]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial ref={frameFill} color="#fbfbfd" roughness={0.6} transparent opacity={0} />
        </RoundedBox>
        <lineSegments geometry={frameEdges}>
          <lineBasicMaterial ref={frameEdge} color={SKY} transparent opacity={0} />
        </lineSegments>

        {/* Barra superior con los tres puntos */}
        <group ref={barRef} position={[0, 1.33, 0.06]}>
          <mesh position={[0, 0, 0]} scale={[4.3, 0.26, 0.01]} geometry={unitBox}>
            <meshStandardMaterial color="#ececf0" roughness={0.7} />
          </mesh>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <mesh key={c} position={[-1.95 + i * 0.16, 0, 0.02]}>
              <circleGeometry args={[0.045, 20]} />
              <meshBasicMaterial color={c} />
            </mesh>
          ))}
        </group>

        {/* Piezas */}
        {BLOCKS.map((b, i) => (
          <group
            key={i}
            ref={(el) => {
              blockRefs.current[i] = el;
            }}
          >
            <mesh geometry={unitBox} material={mats[i].fill} />
            <lineSegments geometry={unitEdges} material={mats[i].edge} />
          </group>
        ))}

        {/* Paleta */}
        {SWATCHES.map((c, i) => (
          <mesh
            key={c}
            ref={(el) => {
              swatchRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={c} roughness={0.3} metalness={0.1} />
          </mesh>
        ))}

        {/* Móvil */}
        <group ref={phoneRef} scale={0.0001}>
          <RoundedBox args={[1.05, 2.1, 0.1]} radius={0.14} smoothness={4}>
            <meshStandardMaterial color={INK} roughness={0.35} metalness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0, 0.056]}>
            <planeGeometry args={[0.93, 1.96]} />
            <meshStandardMaterial color="#fbfbfd" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.84, 0.06]} scale={[0.3, 0.06, 0.01]} geometry={unitBox}>
            <meshBasicMaterial color={INK} />
          </mesh>
          <mesh position={[-0.12, 0.55, 0.065]} scale={[0.6, 0.12, 0.02]} geometry={unitBox}>
            <meshStandardMaterial color={INK} />
          </mesh>
          <mesh position={[-0.2, 0.38, 0.065]} scale={[0.45, 0.12, 0.02]} geometry={unitBox}>
            <meshStandardMaterial color={INK} />
          </mesh>
          <mesh position={[0, -0.05, 0.065]} scale={[0.78, 0.55, 0.02]} geometry={unitBox}>
            <meshStandardMaterial color="#4f95f5" />
          </mesh>
          <mesh position={[-0.17, -0.48, 0.07]} scale={[0.42, 0.12, 0.025]} geometry={unitBox}>
            <meshStandardMaterial color={BRAND} emissive={BRAND} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, -0.75, 0.065]} scale={[0.78, 0.22, 0.02]} geometry={unitBox}>
            <meshStandardMaterial color="#e8e8ed" />
          </mesh>
        </group>

        {/* Órbita */}
        <group ref={ringRef} rotation={[1.2, 0.18, 0]} visible={false}>
          <mesh>
            <torusGeometry args={[2.8, 0.012, 8, 160]} />
            <meshBasicMaterial color={SKY} transparent opacity={0} toneMapped={false} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              ref={(el) => {
                satRefs.current[i] = el;
              }}
            >
              <sphereGeometry args={[i === 0 ? 0.09 : 0.06, 20, 20]} />
              <meshBasicMaterial color={i === 0 ? "#ffffff" : SKY} transparent opacity={0} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export function ProcessScene3D({
  progressRef,
  running,
}: {
  progressRef: MutableRefObject<number>;
  running: boolean;
}) {
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  return (
    <Canvas
      className="!absolute inset-0"
      aria-hidden="true"
      flat
      dpr={[1, 1.75]}
      frameloop={running ? "always" : "never"}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 7]} intensity={1.6} />
      <directionalLight position={[-6, -3, 4]} intensity={0.55} color={SKY} />
      <Scene progressRef={progressRef} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
