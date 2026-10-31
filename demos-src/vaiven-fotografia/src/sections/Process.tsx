import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Eyebrow, Img, Lines, Reveal, RevealImage } from '../components/ui'
import { STEPS } from '../data/site'
import { useDesktop } from '../lib/hooks'
import { EASE, EASE_IN_OUT } from '../lib/motion'

/* Cómo trabajo · secuencia fija.
 * Escritorio: la foto se queda anclada a la izquierda mientras los cuatro pasos avanzan a la
 * derecha; cada paso que llega al centro cambia la foto (cortinilla de abajo arriba) y enciende
 * su número. La línea de la izquierda se llena con el scroll.
 * Móvil: lista vertical sencilla, cada paso con su foto, sin elementos fijos. */
export function Process() {
  const desktop = useDesktop()
  return (
    <section aria-labelledby="process-title" className="relative bg-surface pb-28 pt-24 md:pb-40 md:pt-36">
      <div className="wrap">
        <header className="grid grid-cols-12 gap-x-8">
          <div className="col-span-12 lg:col-span-8">
            <Eyebrow n="03">Así de sencillo</Eyebrow>
            <Lines id="process-title" lines={['Nos conocemos.', 'Lo demás fluye.']} className="display mt-8" />
          </div>
        </header>
        {desktop ? <StickySteps /> : <StackedSteps />}
      </div>
    </section>
  )
}

function StickySteps() {
  const [active, setActive] = useState(0)
  const list = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 55%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  useEffect(() => {
    const items = list.current?.querySelectorAll<HTMLElement>('[data-step]')
    if (!items) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.step)))
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="mt-20 grid grid-cols-12 gap-x-8">
      {/* Foto anclada */}
      <div className="col-span-6 xl:col-span-5">
        <div className="sticky top-[max(96px,calc(50svh-min(36svh,350px)))]">
          <div className="relative overflow-hidden bg-surface-2" style={{ aspectRatio: '4 / 5', maxHeight: 'min(72svh, 700px)' }}>
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                exit={{ opacity: 1 }}
                transition={{ duration: 1.05, ease: EASE_IN_OUT }}
              >
                <motion.div className="h-full w-full" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: EASE }}>
                  <Img photo={STEPS[active].photo} sizes="(min-width: 1280px) 38vw, 46vw" widths={[720, 960, 1280]} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <p className="absolute bottom-4 left-4 z-10 rounded-[6px] bg-white/90 px-2.5 py-1 text-[12px] tabular-nums text-fg backdrop-blur">
              {STEPS[active].n} <span className="text-muted">/ 0{STEPS.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pasos */}
      <ol ref={list} className="relative col-span-6 col-start-7 xl:col-span-5 xl:col-start-8">
        <span aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px bg-border" />
        <motion.span aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px origin-top bg-fg" style={{ scaleY: fill }} />
        {STEPS.map((s, i) => (
          <li key={s.n} data-step={i} className="relative flex min-h-[72svh] gap-8 py-6 first:pt-0 last:min-h-[56svh]">
            <span
              className={`relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full border text-[13px] tabular-nums transition-[background-color,color,border-color] duration-500 ${
                i <= active ? 'border-fg bg-fg text-white' : 'border-border-strong bg-surface text-muted'
              }`}
            >
              {s.n}
            </span>
            <motion.div animate={{ opacity: i === active ? 1 : 0.35 }} transition={{ duration: 0.5 }} className="pt-1.5">
              <h3 className="text-[clamp(1.6rem,2.4vw,2.25rem)] leading-[1.08]">{s.title}</h3>
              <p className="lead mt-5 max-w-[38ch]">{s.text}</p>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StackedSteps() {
  return (
    <ol className="mt-14 space-y-16">
      {STEPS.map((s) => (
        <li key={s.n}>
          <RevealImage photo={s.photo} sizes="100vw" widths={[480, 720, 960]} ratio="4 / 3" />
          <Reveal className="mt-6 flex gap-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fg text-[12px] tabular-nums text-white">{s.n}</span>
            <div>
              <h3 className="text-[26px] leading-[1.1]">{s.title}</h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-fg-2">{s.text}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}
