import { motion } from 'framer-motion'
import { useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { Button, Eyebrow, Lines, Reveal, RevealImage } from '../components/ui'
import { GALLERY, type Story } from '../data/site'
import { EASE, VIEW } from '../lib/motion'

/* Composición de exposición: proporciones distintas, alineaciones alternas y aire.
 * Cada pieza define su columna y su respiración en escritorio; en móvil, columna única
 * con anchos alternos (nunca más ancho que la pantalla). */
const LAYOUT: { box: string; ratio: string; parallax: number; from: 'up' | 'down' | 'left' | 'right'; sizes: string }[] = [
  { box: 'w-[86%] md:col-span-5 md:col-start-1 md:w-auto', ratio: '4 / 5', parallax: 4, from: 'up', sizes: '(min-width: 768px) 40vw, 86vw' },
  { box: 'ml-auto w-[68%] md:col-span-4 md:col-start-8 md:mt-44 md:w-auto lg:col-span-3', ratio: '2 / 3', parallax: 8, from: 'up', sizes: '(min-width: 768px) 24vw, 68vw' },
  { box: 'w-full md:col-span-7 md:col-start-3 md:mt-12 md:w-auto', ratio: '3 / 2', parallax: 5, from: 'left', sizes: '(min-width: 768px) 56vw, 100vw' },
  { box: 'w-[74%] md:col-span-4 md:col-start-1 md:mt-24 md:w-auto', ratio: '3 / 4', parallax: 6, from: 'up', sizes: '(min-width: 768px) 32vw, 74vw' },
  { box: 'ml-auto w-[88%] md:col-span-6 md:col-start-6 md:mt-52 md:w-auto', ratio: '4 / 5', parallax: 4, from: 'up', sizes: '(min-width: 768px) 48vw, 88vw' },
  { box: 'w-[78%] md:col-span-4 md:col-start-2 md:-mt-24 md:w-auto', ratio: '2 / 3', parallax: 7, from: 'down', sizes: '(min-width: 768px) 32vw, 78vw' },
  { box: 'ml-auto w-full md:col-span-6 md:col-start-7 md:mt-28 md:w-auto', ratio: '5 / 4', parallax: 5, from: 'right', sizes: '(min-width: 768px) 48vw, 100vw' },
]

function Piece({ s, i, onOpen }: { s: Story; i: number; onOpen: (i: number) => void }) {
  const l = LAYOUT[i]
  return (
    <figure className={`${l.box} m-0`}>
      <button type="button" onClick={() => onOpen(i)} className="zoom group block w-full cursor-zoom-in text-left" aria-label={`Ampliar «${s.title}», ${s.couple} en ${s.place}`}>
        <RevealImage photo={s.photo} sizes={l.sizes} widths={[480, 720, 960, 1280]} ratio={l.ratio} parallax={l.parallax} from={l.from} />
      </button>
      <motion.figcaption
        className="mt-4 flex items-baseline gap-4"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEW}
        transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
      >
        <span className="text-[12px] tabular-nums text-muted">{s.n}</span>
        <span>
          <span className="block text-[15px] font-medium tracking-[-0.01em]">{s.title}</span>
          <span className="block text-[13px] text-muted">
            {s.couple} · {s.place}
          </span>
        </span>
      </motion.figcaption>
    </figure>
  )
}

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section aria-labelledby="gallery-title" className="relative bg-white pb-28 pt-8 md:pb-40">
      <div className="wrap">
        <header className="grid grid-cols-12 gap-x-8 border-t border-border pt-10 md:pt-14">
          <div className="col-span-12 md:col-span-7">
            <Eyebrow n="02">Una historia en siete momentos</Eyebrow>
            <Lines id="gallery-title" lines={['Un día de boda.']} className="display mt-8" />
          </div>
          <Reveal className="col-span-12 mt-6 self-end md:col-span-4 md:col-start-9 md:mt-0" delay={0.2}>
            <p className="lead max-w-[30ch]">Siete instantes. Una historia que solo podía ser vuestra.</p>
          </Reveal>
        </header>

        <div className="mt-16 flex flex-col gap-16 md:mt-24 md:grid md:grid-cols-12 md:gap-x-8 md:gap-y-0">
          {GALLERY.map((s, i) => (
            <Piece key={s.photo.id} s={s} i={i} onOpen={setOpen} />
          ))}
        </div>

        {/* Final de la exposición: el primer punto de conversión después de ver el trabajo. */}
        <Reveal className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-border pt-10 md:mt-36 md:flex-row md:items-end">
          <p className="max-w-[22ch] text-[clamp(1.6rem,2.6vw,2.25rem)] font-medium leading-[1.1] tracking-[-0.035em]">¿Os imagináis así vuestro día?</p>
          <Button href="#fecha">Contadme vuestra fecha</Button>
        </Reveal>      </div>

      <Lightbox items={GALLERY} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  )
}
