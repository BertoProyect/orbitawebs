import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Info, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { GREY_LEVELS, NATURAL_COLORS, SHADES, type Shade } from "../data/content";
import { coarse, hex, useLock, wake } from "../hooks/useLock";
import { shadeLabel, useHair } from "../state/hair";
import { useBooking } from "../state/booking";
import { EASE, Reveal, RevealLines } from "./ui";

type Natural = (typeof NATURAL_COLORS)[number];
type Grey = (typeof GREY_LEVELS)[number];

/* Orientación honesta según la distancia entre tu color natural y el tono elegido */
function advise(shade: Shade, natural: Natural, grey: Grey) {
  const diff = shade.level - natural.level;
  let technique: string;
  if (shade.code === "10.1") {
    technique =
      grey.id === "muchas"
        ? "Con muchas canas, el plata se consigue aprovechándolas: un baño de color las matiza y les da brillo."
        : "Llegar a un plata pide aclarar el pelo antes y matizarlo después. Suele hacerse en más de una sesión.";
  } else if (diff <= -1) {
    technique = "Es más oscuro que tu color natural: lo conseguimos con un tinte completo.";
  } else if (diff <= 1) {
    technique = "Está muy cerca de tu color natural: basta con un tinte o un baño de color.";
  } else if (diff <= 3) {
    technique =
      "Aclara un par de tonos: con tinte aclarante, mechas o balayage, según el efecto que busques.";
  } else {
    technique =
      "Es bastante más claro que tu pelo: hay que aclararlo antes con mechas o decoloración, y puede llevar más de una sesión.";
  }
  const greyNote =
    grey.id === "ninguna"
      ? ""
      : grey.id === "algunas"
        ? "Las canas se cubren en la misma cita."
        : "Con muchas canas, la raíz se nota antes: calcula un retoque cada 4 a 6 semanas.";
  return { technique, greyNote };
}

function Swatches({ value, onChange }: { value: Shade; onChange: (s: Shade) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();
  const onKey = (e: KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % SHADES.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (i - 1 + SHADES.length) % SHADES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = SHADES.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(SHADES[next]);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label="Carta de colores"
      className="grid grid-cols-7 gap-2 sm:gap-3.5"
    >
      {SHADES.map((s, i) => {
        const on = s.code === value.code;
        return (
          <m.button
            key={s.code}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={shadeLabel(s)}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(s)}
            onKeyDown={(e) => onKey(e, i)}
            className="group relative flex flex-col items-center gap-2.5 rounded-full pt-1.5 focus-visible:outline-none"
            whileHover={reduce ? undefined : { y: -3 }}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            <span className="relative block w-full max-w-[64px]">
              <span
                className="swatch"
                style={{ ["--root" as string]: s.root, ["--tip" as string]: s.tip }}
              />
              {on && (
                <m.span
                  layoutId="shade-ring"
                  aria-hidden="true"
                  className="absolute -inset-[5px] rounded-full border border-gold shadow-[0_0_22px_-2px_rgb(217_197_154/0.55),inset_0_0_10px_rgb(217_197_154/0.25)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="pointer-events-none absolute -inset-[5px] rounded-full ring-2 ring-transparent ring-offset-0 group-focus-visible:ring-gold-light" />
            </span>
            <span
              className={`text-[0.78rem] tabular transition-colors duration-500 ${on ? "text-gold-light" : "text-muted"}`}
            >
              {s.code}
            </span>
          </m.button>
        );
      })}
    </div>
  );
}

export function ColorLab() {
  const { shade, setShade, natural, setNatural, grey, setGrey } = useHair();
  const { book } = useBooking();
  const reduce = useReducedMotion();
  const [result, setResult] = useState(false);
  const [run, setRun] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ shade, natural, grey, result });
  state.current = { shade, natural, grey, result };

  const lockRef = useLock(canvas, stage, {
    x: 0.5,
    seed: 5150,
    root: shade.root,
    tip: shade.tip,
    onBuild: (L) => {
      const s = state.current;
      L.natural = hex(s.natural.hex);
      L.grey = s.grey.amount;
      L.gloss = s.result ? 1.45 : 1.1;
    },
  });

  // Al cambiar de tono: el mechón toma el color nuevo y se balancea
  useEffect(() => {
    const L = lockRef.current;
    if (!L) return;
    L.anim = null;
    L.brushY = -1;
    L.regrowth = 0;
    L.painted = 0;
    L.root = hex(shade.root);
    L.tip = hex(shade.tip);
    L.gloss = 1.1;
    if (!reduce) L.kick(4);
    wake(L);
  }, [shade, lockRef, reduce]);

  // Cambiar el punto de partida invalida el resultado anterior
  useEffect(() => {
    setResult(false);
  }, [shade, natural, grey]);

  // «Ver cómo sales»: el mechón parte de tu color natural (con tus canas) y el pincel lo tiñe
  useEffect(() => {
    if (!run) return;
    const L = lockRef.current;
    if (!L) return;
    L.root = hex(shade.root);
    L.tip = hex(shade.tip);
    L.natural = hex(natural.hex);
    L.grey = grey.amount;
    const R = L.length * 1.0;
    if (reduce) {
      L.regrowth = 0;
      L.painted = 0;
      L.gloss = 1.45;
      wake(L);
      return;
    }
    L.regrowth = R;
    L.painted = 0;
    L.gloss = 0.9;
    const t0 = performance.now();
    const dur = 1700;
    L.anim = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const e = 1 - Math.pow(1 - p, 2.2);
      L.painted = e;
      L.brushY = p < 1 ? e * R : -1;
      L.gloss = 0.9 + 0.55 * e;
      L.awake = 1;
      if (p >= 1) {
        L.regrowth = 0;
        L.painted = 0;
        L.anim = null;
        L.kick(1.2);
      }
    };
    wake(L);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const { technique, greyNote } = advise(shade, natural, grey);

  return (
    <section
      id="color"
      aria-labelledby="color-title"
      className="relative bg-bg py-[clamp(96px,13vw,176px)]"
    >
      <div className="wrap">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-[clamp(48px,6vw,104px)]">
          {/* Escenario del mechón */}
          <Reveal
            className="order-2 lg:sticky lg:top-[calc(var(--nav-h)+28px)] lg:order-none"
            y={40}
          >
            <div
              ref={stage}
              className="relative aspect-[4/5] max-h-[78svh] w-full overflow-hidden rounded-[var(--radius-media)] border border-line bg-[radial-gradient(70%_55%_at_50%_18%,#2a2622_0%,#171513_55%,#100f0e_100%)]"
              style={{ touchAction: "pan-y" }}
            >
              {/* barra de la que cuelga el mechón */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-[6%] h-[7px] w-[46%] -translate-x-1/2 -translate-y-[85%] rounded-full bg-gradient-to-b from-[#6f685e] via-[#3c3732] to-[#25211e] shadow-[0_6px_14px_rgb(0_0_0/0.5)]"
              />
              <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
              <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <div aria-live="polite">
                  <p className="text-xs text-muted">{result ? "Así sales" : "Tono elegido"}</p>
                  <p className="text-[1.05rem] text-ink">{shadeLabel(shade)}</p>
                </div>
                <p className="max-w-[11rem] text-right text-xs leading-snug text-muted">
                  {coarse ? "Pasa el dedo por el mechón" : "Pasa el cursor por el mechón"}
                </p>
              </div>
            </div>
          </Reveal>

          <div className="contents lg:block">
            <div className="order-1">
              <RevealLines
                lines={["Encuentra tu", "próximo tono."]}
                className="display h-lg"
                id="color-title"
              />
              <Reveal delay={0.1}>
                <p className="lead mt-6 max-w-[32rem]">
                  Toca un color de nuestra carta y mira cómo queda en un mechón. En el diagnóstico
                  gratis lo comparamos con tu pelo y con tu piel.
                </p>
              </Reveal>
            </div>

            <Reveal className="order-3 lg:mt-10" delay={0.15}>
              <Swatches value={shade} onChange={setShade} />
              <div className="mt-8 min-h-[7.5rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={shade.code}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <p className="flex items-baseline gap-4">
                      <span className="text-[2.6rem] font-extralight leading-none tracking-[-0.04em] text-gold-light tabular">
                        {shade.code}
                      </span>
                      <span className="text-[1.35rem] font-light tracking-[-0.02em]">
                        {shade.name}
                      </span>
                    </p>
                    <p className="mt-3 max-w-[30rem] text-ink-2">{shade.desc}</p>
                  </m.div>
                </AnimatePresence>
              </div>
            </Reveal>

            <Reveal
              className="order-4 rounded-[var(--radius-card)] border border-line bg-bg-2/70 p-6 sm:p-8 lg:mt-10"
              delay={0.1}
            >
              <h3 className="h-sm">Ajústalo a tu pelo.</h3>
              <fieldset className="mt-6">
                <legend className="field-label">Tu color natural</legend>
                <div className="flex flex-wrap gap-2.5">
                  {NATURAL_COLORS.map((n) => (
                    <label key={n.id} className="chip gap-2.5">
                      <input
                        type="radio"
                        name="natural"
                        checked={natural.id === n.id}
                        onChange={() => setNatural(n)}
                      />
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 rounded-full border border-white/20"
                        style={{ background: n.hex }}
                      />
                      {n.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-6">
                <legend className="field-label">Canas</legend>
                <div className="flex flex-wrap gap-2.5">
                  {GREY_LEVELS.map((g) => (
                    <label key={g.id} className="chip">
                      <input
                        type="radio"
                        name="canas"
                        checked={grey.id === g.id}
                        onChange={() => setGrey(g)}
                      />
                      {g.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="button"
                className="btn btn--primary mt-8 w-full sm:w-auto"
                onClick={() => {
                  setResult(true);
                  setRun((r) => r + 1);
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    stage.current?.scrollIntoView({
                      behavior: reduce ? "auto" : "smooth",
                      block: "center",
                    });
                  }
                }}
              >
                <Sparkles />
                {result ? "Verlo otra vez" : "Ver cómo sales"}
              </button>

              {/* Se despliega con CSS (grid 0fr→1fr) para no cortar el scroll suave hacia el mechón */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-expo)] ${
                  result ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
                aria-hidden={!result}
                inert={!result}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="mt-8 border-t border-line pt-7" aria-live="polite">
                    <div className="flex items-center gap-3 text-sm text-ink-2">
                      <span
                        className="h-5 w-5 rounded-full border border-white/20"
                        style={{ background: natural.hex }}
                        aria-hidden="true"
                      />
                      <span>
                        {natural.label}
                        {grey.id !== "ninguna" ? `, ${grey.label.toLowerCase()} canas` : ""}
                      </span>
                      <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
                      <span
                        className="h-5 w-5 rounded-full border border-white/20"
                        style={{
                          background: `linear-gradient(170deg, ${shade.root}, ${shade.tip})`,
                        }}
                        aria-hidden="true"
                      />
                      <span className="text-ink">{shadeLabel(shade)}</span>
                    </div>
                    <p className="mt-5 text-[1.08rem] leading-relaxed text-ink">{technique}</p>
                    {greyNote && <p className="mt-2 text-ink-2">{greyNote}</p>}
                    <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold-light">
                      El diagnóstico de color es GRATIS.
                    </p>
                    <p className="mt-5 flex gap-2.5 text-[0.85rem] leading-relaxed text-muted">
                      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      Es una simulación orientativa, no una foto de tu pelo. El resultado final
                      depende de tu color actual, de lo que te hayas hecho antes y de cómo lo veamos
                      en el salón.
                    </p>
                    <button
                      type="button"
                      className="btn btn--ghost mt-6 w-full sm:w-auto"
                      onClick={() =>
                        book(
                          "diagnostico",
                          `Me interesa el tono ${shadeLabel(shade)}. Mi color natural es ${natural.label.toLowerCase()}${
                            grey.id === "ninguna"
                              ? ", sin canas"
                              : `, con ${grey.label.toLowerCase()} canas`
                          }.`,
                        )
                      }
                    >
                      Pedir diagnóstico gratis
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
