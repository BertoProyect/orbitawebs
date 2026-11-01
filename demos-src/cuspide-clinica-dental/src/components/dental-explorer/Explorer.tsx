import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { BASE } from '../../data/clinic'
import { ORDER, TEETH } from '../../data/teeth'
import { useDesktop } from '../../lib/hooks'
import { EASE } from '../../lib/motion'
import { useBooking } from '../../state/booking'
import { FadeIn, WordReveal } from '../ui/WordReveal'
import { Odontogram } from './Odontogram'

/* Escena 4: la boca en 3D. El modelo (assets/dientes.js, Three.js ya compilado) se descarga
   solo al acercarse y expone una pequeña API en el elemento [data-mouth]:
   select(fdi), reset() y zoom(factor), y avisa con el evento «tooth» al cambiar de diente.
   El panel, el selector y los controles son de React; el motor solo pinta y gira la boca. */
type MouthApi = { select: (fdi: number) => void; reset: () => void; zoom: (f: number) => void }
type MouthEl = HTMLDivElement & { __mouth?: MouthApi }

const START = 11

export function Explorer() {
  const root = useRef<MouthEl>(null)
  const [fdi, setFdi] = useState(START)
  const fdiRef = useRef(START)
  const [ready, setReady] = useState(false)
  const [flat, setFlat] = useState(false)
  const { request } = useBooking()

  const choose = useCallback((n: number) => {
    fdiRef.current = n
    setFdi(n)
    root.current?.__mouth?.select(n)
  }, [])

  // Eventos del motor + descarga diferida del modelo.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const onTooth = (e: Event) => {
      const n = (e as CustomEvent<{ fdi: number }>).detail.fdi
      fdiRef.current = n
      setFdi(n)
    }
    const onApi = () => fdiRef.current !== START && el.__mouth?.select(fdiRef.current)
    const classes = new MutationObserver(() => {
      setReady(el.classList.contains('is-ready'))
      setFlat(el.classList.contains('mouth--flat'))
    })
    el.addEventListener('tooth', onTooth)
    el.addEventListener('mouth-api', onApi)
    classes.observe(el, { attributes: true, attributeFilter: ['class'] })

    const v = document.querySelector<HTMLMetaElement>('meta[name="dientes-v"]')?.content
    const load = () => {
      import(/* @vite-ignore */ `${BASE}/assets/dientes.js${v ? `?v=${v}` : ''}`).catch(() => el.classList.add('mouth--flat'))
    }
    let io: IntersectionObserver | null = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((en) => {
        if (en.some((x) => x.isIntersecting)) {
          io?.disconnect()
          load()
        }
      }, { rootMargin: '1400px 0px' })
      io.observe(el)
    } else load()

    return () => {
      el.removeEventListener('tooth', onTooth)
      el.removeEventListener('mouth-api', onApi)
      classes.disconnect()
      io?.disconnect()
    }
  }, [])

  const step = (d: 1 | -1) => choose(ORDER[(ORDER.indexOf(fdi) + d + ORDER.length) % ORDER.length])
  const api = useCallback(() => root.current?.__mouth, [])

  return (
    <section id="tu-boca" aria-labelledby="mouth-title" className="on-night night relative overflow-hidden" style={{ paddingBlock: 'var(--section)' }}>
      {/* Luz ambiente muy suave detrás del escenario */}
      <div className="pointer-events-none absolute left-1/2 top-[30%] h-[720px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(26,91,214,0.22),rgba(26,91,214,0))]" aria-hidden />
      <div className="wrap relative">
        <header className="grid12 items-end gap-y-6">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow">Herramienta educativa</p>
            <WordReveal id="mouth-title" text="Conoce tu boca. Diente a diente." className="h2 mt-5 max-w-[12ch] text-text-light" />
          </div>
          <FadeIn className="col-span-12 lg:col-span-4 lg:col-start-9" delay={0.2}>
            <p className="lead">Explora la anatomía dental y descubre qué tratamientos pueden estar relacionados con cada pieza.</p>
          </FadeIn>
        </header>

        <div ref={root} data-mouth className="mouth mt-14 grid gap-4 sm:mt-16 lg:grid-cols-12 lg:gap-5">
          <FadeIn className="lg:col-span-8">
            <Stage ready={ready} api={api} />
            <div className="mt-4 rounded-[var(--r-card)] border border-white/10 bg-white/[0.03] px-3 py-4 sm:px-6 sm:py-5">
              <div className="mb-3 flex items-center justify-between px-1 text-[12px] font-medium text-muted-light">
                <span>Derecha del paciente</span>
                <span className="hidden sm:inline">Elige un diente</span>
                <span>Izquierda</span>
              </div>
              <Odontogram active={fdi} onPick={choose} />
            </div>
            {flat && <p className="fine mt-3">Tu navegador no puede mostrar la boca en 3D, pero puedes elegir cada diente en el esquema.</p>}
          </FadeIn>

          <FadeIn className="lg:col-span-4" delay={0.15}>
            <Panel fdi={fdi} onStep={step} onBook={() => request({ motivo: TEETH[fdi].motivo, nota: `Diente ${fdi} · ${TEETH[fdi].name.toLowerCase()}` })} />
          </FadeIn>

          {/* Nodos que el motor rellena por su cuenta; la interfaz visible es la de React. */}
          <GhostPanel />
        </div>

        <p className="fine mt-6 max-w-[64ch]">
          Herramienta educativa con medidas medias de un adulto. No es un diagnóstico: cada boca es distinta y en la primera visita vemos la tuya.
        </p>
      </div>
    </section>
  )
}

/* El escenario 3D. Memorizado: el motor mete el canvas dentro y React no debe tocarlo. */
const Stage = memo(function Stage({ ready, api }: { ready: boolean; api: () => MouthApi | undefined }) {
  return (
    <div className="mouth__stage mouth__stage-3d aspect-square sm:aspect-[4/3] lg:aspect-[16/11]">
      <div className="mouth-loading absolute inset-0 flex items-center justify-center gap-2.5 text-[14px] text-muted-light transition-opacity duration-500" aria-hidden>
        <span className="h-2 w-2 animate-pulse rounded-full bg-sky" /> Preparando la boca
      </div>
      <span className="mouth__tip" aria-hidden="true" hidden />

      <div className="mouth-ui absolute left-3 top-3 z-[2] sm:left-4 sm:top-4">
        <button type="button" data-roots-toggle aria-pressed="false" className="seg glass-dark relative grid h-11 grid-cols-2 items-center rounded-full p-1 text-[13px] font-medium" aria-label="Ver las raíces">
          <span className="seg__thumb absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white transition-transform duration-500 ease-[var(--ease)]" aria-hidden />
          <span className="seg__a relative z-[1] px-3.5 transition-colors duration-300 sm:px-4">Exterior</span>
          <span className="seg__b relative z-[1] px-3.5 transition-colors duration-300 sm:px-4">Raíces</span>
        </button>
      </div>

      <div className="mouth-ui glass-dark absolute right-3 top-3 z-[2] flex items-center gap-0.5 rounded-full p-0.5 sm:right-4 sm:top-4" role="group" aria-label="Cámara">
        <button type="button" className="ctrl" aria-label="Alejar" onClick={() => api()?.zoom(1 / 0.85)} disabled={!ready}>
          <Minus size={17} aria-hidden />
        </button>
        <button type="button" className="ctrl" aria-label="Acercar" onClick={() => api()?.zoom(0.85)} disabled={!ready}>
          <Plus size={17} aria-hidden />
        </button>
        <span className="mx-0.5 h-5 w-px bg-white/15" aria-hidden />
        <button type="button" className="ctrl" aria-label="Volver a la vista inicial" onClick={() => api()?.reset()} disabled={!ready}>
          <RotateCcw size={16} aria-hidden />
        </button>
      </div>

      <p className="mouth-ui mouth-hint glass-dark pointer-events-none absolute bottom-3 left-1/2 z-[2] m-0 -translate-x-1/2 whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] text-muted-light transition-opacity duration-500 sm:bottom-4" aria-hidden>
        Arrastra para girar · toca un diente
      </p>
    </div>
  )
})

const GhostPanel = memo(function GhostPanel() {
  return (
    <div className="mouth__panel mouth__ghost" aria-hidden="true">
      <button type="button" data-prev tabIndex={-1} />
      <strong data-fdi>11</strong>
      <button type="button" data-next tabIndex={-1} />
      <div className="mouth__swap">
        <span data-name />
        <span data-alias />
        <span data-age />
        <span data-roots />
        <span data-text />
        <ul data-care />
      </div>
      <a data-book href="#cita" tabIndex={-1} />
    </div>
  )
})

/* Ficha del diente. En móvil se pliega en un cajón: cabecera siempre visible y detalle al tocar. */
function Panel({ fdi, onStep, onBook }: { fdi: number; onStep: (d: 1 | -1) => void; onBook: () => void }) {
  const t = TEETH[fdi]
  const reduce = useReducedMotion()
  const desktop = useDesktop()
  const [expanded, setExpanded] = useState(false)
  const showBody = desktop || expanded
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, y: reduce ? 0 : -8, transition: { duration: 0.18 } },
  }

  return (
    <div className="flex h-full flex-col rounded-[var(--r-stage)] border border-white/10 bg-night-2/70 p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-light">Diente</span>
        <div className="flex gap-1.5">
          <button type="button" className="ctrl border border-white/10" aria-label="Diente anterior" onClick={() => onStep(-1)}>
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button type="button" className="ctrl border border-white/10" aria-label="Diente siguiente" onClick={() => onStep(1)}>
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div aria-live="polite" className="mt-2 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={fdi} initial="hidden" animate="show" exit="exit" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
            <motion.p variants={item} className="num text-[clamp(4rem,8vw,6rem)] font-medium leading-[0.9] tracking-[-0.05em] text-sky">
              {fdi}
            </motion.p>
            <motion.h3 variants={item} className="mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-text-light sm:text-[24px]">
              {t.name}
            </motion.h3>
            {t.alias && (
              <motion.p variants={item} className="mt-1 text-[15px] text-muted-light">
                También llamado {t.alias}.
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {!desktop && (
          <button type="button" className="mt-4 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-sky" aria-expanded={expanded} aria-controls="tooth-body" onClick={() => setExpanded((x) => !x)}>
            {expanded ? 'Ocultar la ficha' : 'Ver la ficha completa'}
            <ChevronDown size={17} className={`transition-transform duration-500 ease-[var(--ease)] ${expanded ? 'rotate-180' : ''}`} aria-hidden />
          </button>
        )}

        <AnimatePresence initial={false}>
          {showBody && (
            <motion.div
              id="tooth-body"
              key="body"
              initial={desktop ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={fdi} initial="hidden" animate="show" exit="exit" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}>
                  <motion.dl variants={item} className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-4">
                    <div>
                      <dt className="text-[12.5px] text-muted-light">Erupción aproximada</dt>
                      <dd className="num mt-1 text-[19px] font-semibold text-text-light">{t.age} años</dd>
                    </div>
                    <div>
                      <dt className="text-[12.5px] text-muted-light">Raíces</dt>
                      <dd className="num mt-1 text-[19px] font-semibold text-text-light">{t.roots}</dd>
                    </div>
                  </motion.dl>
                  <motion.p variants={item} className="mt-4 text-[16px] leading-[1.55] text-muted-light">
                    {t.text}
                  </motion.p>
                  <motion.p variants={item} className="mt-5 text-[13px] font-semibold text-text-light">
                    Tratamientos relacionados
                  </motion.p>
                  <motion.ul variants={item} className="mt-2.5 flex flex-wrap gap-2">
                    {t.care.map((c) => (
                      <li key={c} className="chip !min-h-[30px] !text-[13.5px]">
                        {c}
                      </li>
                    ))}
                  </motion.ul>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button type="button" className="btn mt-7 w-full" onClick={onBook}>
        Pedir cita para este diente
      </button>
    </div>
  )
}
