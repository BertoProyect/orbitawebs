import { motion, useInView } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Lines, Reveal } from '../components/ui'
import { BASE, PAIRING } from '../data/restaurant'
import { EASE, VIEW } from '../lib/motion'

/* «¿Qué vino le pedimos?». La copa en 3D (copa.js, Three.js ya compilado) se descarga solo al
 * acercarse a la sección y sirve la Manzanilla al entrar en pantalla. Sin WebGL queda el panel. */
export function Wine() {
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const near = useInView(root, { once: true, margin: '900px 0px' })
  const visible = useInView(stage, { amount: 0.4 })
  const [ready, setReady] = useState(false)
  const [served, setServed] = useState(false)

  const serve = useCallback(() => {
    root.current?.dispatchEvent(
      new CustomEvent('pour:serve', { detail: { key: PAIRING.wineKey, name: PAIRING.wine, origin: PAIRING.origin } }),
    )
    setServed(true)
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const onReady = () => setReady(true)
    el.addEventListener('pour:ready', onReady)
    return () => el.removeEventListener('pour:ready', onReady)
  }, [])

  useEffect(() => {
    if (!near) return
    const v = document.querySelector<HTMLMetaElement>('meta[name="copa-v"]')?.content
    import(/* @vite-ignore */ `${BASE}/assets/copa.js${v ? `?v=${v}` : ''}`).catch(() => root.current?.classList.add('pour--flat'))
  }, [near])

  useEffect(() => {
    if (ready && visible && !served) serve()
  }, [ready, visible, served, serve])

  return (
    <section aria-labelledby="vino-title" className="bg-estraza py-24 md:py-36">
      <div className="wrap">
        <div ref={root} data-pour className="pour grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            ref={stage}
            className="pour__stage relative isolate aspect-[4/4.4] overflow-hidden rounded-[14px] sm:aspect-[16/12] lg:col-span-7 lg:aspect-auto lg:h-[620px]"
            style={{ background: 'radial-gradient(70% 60% at 50% 38%, #6b5640 0%, #2a2018 62%, #1c1612 100%)' }}
            initial={{ clipPath: 'inset(8% 8% 8% 8% round 14px)', opacity: 0 }}
            whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 14px)', opacity: 1 }}
            viewport={VIEW}
            transition={{ duration: 1.2, ease: EASE }}
          >
            <p className="pour__loading absolute inset-0 m-0 grid place-items-center font-serif text-[18px] text-tiza/70 transition-opacity" aria-hidden>
              Sacando la copa
            </p>
          </motion.div>

          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow">Para acompañar</span>
            </Reveal>
            <Lines id="vino-title" lines={['¿Qué vino', 'le pedimos?']} className="display mt-4" />
            <Reveal delay={0.1} as="p" className="lead mt-4">
              Un buen plato merece una buena compañía.
            </Reveal>

            {/* Plato + vino, unidos por una línea que se dibuja */}
            <div className="mt-9">
              <p className="text-[14px] font-semibold text-apagado" id="plato-l">
                Elige el plato
              </p>
              <div role="radiogroup" aria-labelledby="plato-l" className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  role="radio"
                  aria-checked="true"
                  onClick={() => ready && serve()}
                  className="inline-flex min-h-11 items-center rounded-full bg-almagra px-4 text-[15px] font-semibold text-cal"
                >
                  {PAIRING.dish}
                </button>
              </div>
              <svg viewBox="0 0 40 56" className="ml-6 mt-1 h-14 w-10 text-almagra" aria-hidden>
                <motion.path
                  d="M4 2 C 4 26, 36 30, 36 54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeDasharray="1 5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={VIEW}
                  transition={{ duration: 1.1, delay: 0.4, ease: 'easeInOut' }}
                />
              </svg>
              <motion.div
                aria-live="polite"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEW}
                transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
                className="border-t border-nogal/20 pt-5"
              >
                <p className="font-serif text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-nogal">{PAIRING.wine}</p>
                <p className="mt-2 text-[15px] font-semibold text-almagra-2">{PAIRING.origin}</p>
                <dl className="mt-5 flex gap-10">
                  <div>
                    <dt className="text-[14px] text-apagado">Copa</dt>
                    <dd className="num m-0 font-serif text-[26px] text-nogal">{PAIRING.glass}</dd>
                  </div>
                  <div>
                    <dt className="text-[14px] text-apagado">Botella</dt>
                    <dd className="num m-0 font-serif text-[26px] text-nogal">{PAIRING.bottle}</dd>
                  </div>
                </dl>
                <p className="mt-5 text-[14px] text-apagado">Es una sugerencia de la casa, no un maridaje cerrado. Pregúntanos por otros vinos.</p>
              </motion.div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#reserva">Reservar mesa</Button>
              {ready && (
                <button
                  type="button"
                  onClick={serve}
                  className="inline-flex min-h-12 items-center gap-2 rounded-[10px] px-4 text-[15px] font-semibold text-nogal hover:bg-nogal/5"
                >
                  <RotateCcw size={16} aria-hidden /> Servir otra copa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
