import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Lines, Reveal, RevealImage } from '../components/ui'
import { PHOTOS, RESTAURANT } from '../data/restaurant'
import { useDesktop } from '../lib/hooks'
import { EASE, VIEW } from '../lib/motion'
import { Pizarra } from '../components/Pizarra'

const CHAPTERS = [
  {
    time: '08:00',
    title: 'El mercado',
    text: 'Cada mañana, Rafa va a la lonja a buscar el pescado y recorre el mercado de abastos para elegir las verduras de temporada.',
    media: 'market' as const,
  },
  {
    time: '11:30',
    title: 'La pizarra',
    text: 'Lo que llega fresco inspira los platos del día. Si algo se termina, se borra de la pizarra. Así de sencillo.',
    media: 'pizarra' as const,
  },
  {
    time: '13:30',
    title: 'A la mesa',
    text: 'El mejor momento del día: compartir lo que hemos preparado.',
    media: 'table' as const,
  },
]

export function Story() {
  const desktop = useDesktop()
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 60%', 'end 60%'] })
  const line = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="historia" aria-labelledby="historia-title" className="relative bg-cal py-24 md:py-36">
      <div className="wrap">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <Reveal>
              <span className="eyebrow">El sabor de lo cotidiano</span>
            </Reveal>
            <Lines
              id="historia-title"
              lines={['Hay cosas que no cambian.', 'Y por eso saben mejor.']}
              className="display mt-5"
            />
          </div>
          <Reveal delay={0.15} className="md:col-span-5 md:pt-14">
            <p className="lead">
              Manoli y Rafa abrieron La Alacena en {RESTAURANT.founded}, en una antigua casa del centro de Huelva. Desde
              entonces, seguimos creyendo en lo mismo: comprar bien, cocinar con cariño y sentar a la gente alrededor de una
              buena mesa.
            </p>
          </Reveal>
        </div>

        {/* El día, de 08:00 a 13:30. En escritorio la hora se queda fija y cambia al bajar. */}
        <div ref={track} className="relative mt-20 md:mt-32 md:grid md:grid-cols-12 md:gap-8">
          {desktop && (
            <div className="md:col-span-5">
              <div className="sticky top-[18vh] flex gap-8">
                {/* Línea del día */}
                <div className="relative w-px self-stretch bg-nogal/15" aria-hidden>
                  <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-almagra" style={{ scaleY: line }} />
                  {CHAPTERS.map((c, i) => (
                    <span
                      key={c.time}
                      className={`absolute -left-[5px] h-[11px] w-[11px] rounded-full border-2 transition-colors duration-500 ${
                        i <= active ? 'border-almagra bg-almagra' : 'border-nogal/30 bg-cal'
                      }`}
                      style={{ top: `${i * 50}%`, transform: 'translateY(-50%)' }}
                    />
                  ))}
                </div>
                <div className="min-h-[46vh] py-1">
                  <p className="text-[15px] font-semibold text-apagado">Un día en La Alacena</p>
                  <div className="relative mt-3 h-[clamp(5rem,8.4vw,8rem)] overflow-hidden" aria-live="polite">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p
                        key={CHAPTERS[active].time}
                        className="num font-serif text-[clamp(5rem,8.4vw,8rem)] leading-none tracking-[-0.03em] text-almagra"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        exit={{ y: '-100%', opacity: 0 }}
                        transition={{ duration: 0.8, ease: EASE }}
                      >
                        {CHAPTERS[active].time}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <ol className="mt-6 space-y-2">
                    {CHAPTERS.map((c, i) => (
                      <li
                        key={c.time}
                        className={`font-serif text-[22px] transition-colors duration-500 ${
                          i === active ? 'text-nogal' : 'text-nogal/30'
                        }`}
                      >
                        {c.title}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          <div className="md:col-span-7">
            {/* Línea del día en móvil */}
            {!desktop && (
              <div className="absolute bottom-0 left-[7px] top-2 w-px bg-nogal/15" aria-hidden>
                <motion.div className="h-full origin-top bg-almagra" style={{ scaleY: line }} />
              </div>
            )}
            {CHAPTERS.map((c, i) => (
              <Chapter key={c.time} index={i} chapter={c} onActive={setActive} desktop={desktop} />
            ))}
          </div>
        </div>

        {/* Remate: de dónde viene el nombre */}
        <div className="mt-24 grid items-center gap-10 md:mt-36 md:grid-cols-12 md:gap-8">
          <RevealImage
            photo={PHOTOS.cupboard}
            sizes="(min-width: 900px) 40vw, 100vw"
            ratio="4 / 5"
            parallax={4}
            className="md:col-span-5 md:col-start-2"
          />
          <div className="md:col-span-5 md:col-start-8">
            <Lines
              as="p"
              lines={['La alacena de la abuela de Manoli', 'sigue en la pared del comedor.', 'De ahí viene nuestro nombre.']}
              className="font-serif text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.18] text-nogal"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Chapter({
  chapter,
  index,
  onActive,
  desktop,
}: {
  chapter: (typeof CHAPTERS)[number]
  index: number
  onActive: (i: number) => void
  desktop: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const inMiddle = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inMiddle) onActive(index)
  }, [inMiddle, index, onActive])

  /* El texto se mueve a otra velocidad que la foto. */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], desktop ? [60, -60] : [0, 0])

  return (
    <article
      ref={ref}
      aria-labelledby={`cap-${index}`}
      className={`relative pl-9 md:pl-0 ${index ? 'mt-20 md:mt-[22vh]' : ''} md:min-h-[78vh]`}
    >
      {!desktop && (
        <span className="absolute left-[2px] top-3 h-[11px] w-[11px] rounded-full border-2 border-almagra bg-cal" aria-hidden />
      )}
      {!desktop && (
        <motion.p
          className="num font-serif text-[64px] leading-none tracking-[-0.03em] text-almagra"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {chapter.time}
        </motion.p>
      )}
      <div className="mt-6 md:mt-0">
        {chapter.media === 'pizarra' ? (
          <Pizarra />
        ) : (
          <RevealImage
            photo={chapter.media === 'market' ? PHOTOS.market : PHOTOS.table}
            sizes="(min-width: 900px) 55vw, 100vw"
            ratio={chapter.media === 'market' ? '3 / 2' : '4 / 5'}
            parallax={5}
            className={chapter.media === 'table' ? 'md:mx-auto md:w-[78%]' : ''}
          />
        )}
      </div>
      <motion.div style={{ y: textY }} className="relative mt-7 max-w-md md:ml-[8%] md:mt-10">
        <Lines id={`cap-${index}`} as="h3" lines={[chapter.title]} className="font-serif text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight" />
        <Reveal delay={0.12} as="p" className="mt-3 text-[18px] leading-relaxed">
          {chapter.text}
        </Reveal>
      </motion.div>
    </article>
  )
}
