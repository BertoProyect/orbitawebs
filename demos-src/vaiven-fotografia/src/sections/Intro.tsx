import { motion } from 'framer-motion'
import { CurvedReel } from '../components/CurvedReel'
import { Eyebrow, RevealImage, Words } from '../components/ui'
import { BRAND, PHOTOS, REEL } from '../data/site'
import { fadeUp, stagger, VIEW } from '../lib/motion'

const REEL_SRC = REEL.map((id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=480&h=720`)

/* Bisagra entre la portada y el texto: la banda curva de bodas recientes. */
export function Reel() {
  return (
    <section aria-label="Bodas recientes" className="relative bg-white pt-6 md:pt-10">
      <CurvedReel
        images={REEL_SRC}
        caption="Bodas recientes en Huelva, Sevilla y el Algarve."
        speed={4}
        tileHeight={44}
        aspectRatio={0.6667}
        gap={7}
        axis={48}
        curve={70}
        fade={12}
      />
    </section>
  )
}

const PARAGRAPHS = [
  'Las manos que tiemblan antes de entrar. Una mirada que lo dice todo. Los abrazos que duran un poquito más.',
  'Me gusta contar las bodas como suceden: sin interrumpir, sin dirigir cada movimiento y sin convertir vuestra historia en una sesión de fotos.',
  'Vosotros vividla. Yo me encargo de conservarla.',
]

/* Introducción editorial: titular grande que entra palabra a palabra, párrafos que se suceden
 * y una foto pequeña a la derecha, desplazada hacia abajo, con parallax contenido. */
export function Intro() {
  return (
    <section aria-labelledby="intro-title" className="relative bg-white pb-28 pt-24 md:pb-40 md:pt-36 lg:pb-48">
      <div className="wrap grid grid-cols-12 gap-x-5 md:gap-x-8">
        <div className="col-span-12 lg:col-span-9">
          <Eyebrow>No se trata de posar</Eyebrow>
          <Words
            id="intro-title"
            text="No quiero que recordéis cómo salisteis en las fotos. Quiero que recordéis cómo os sentisteis."
            className="mt-8 max-w-[19ch] text-[clamp(2.1rem,5vw,4.6rem)] leading-[1.02] tracking-[-0.045em]"
          />
        </div>

        <motion.div
          className="col-span-12 mt-14 md:col-span-7 md:col-start-2 md:mt-20 lg:col-span-5 lg:col-start-2"
          variants={stagger(0.16, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEW}
        >
          {PARAGRAPHS.map((p, i) => (
            <motion.p key={i} variants={fadeUp} className={`lead ${i ? 'mt-6' : ''} ${i === PARAGRAPHS.length - 1 ? 'text-fg' : ''}`}>
              {p}
            </motion.p>
          ))}
          <motion.p variants={fadeUp} className="mt-10 flex items-center gap-4 text-[15px] text-muted">
            <span aria-hidden className="h-px w-10 bg-border-strong" />
            <span className="text-[26px] font-light tracking-[-0.03em] text-fg">{BRAND.photographer}</span>
          </motion.p>
        </motion.div>

        <div className="col-span-8 col-start-5 mt-16 sm:col-span-6 sm:col-start-7 md:col-span-4 md:col-start-9 md:-mt-10 lg:col-span-3 lg:col-start-10 lg:-mt-40">
          <RevealImage photo={PHOTOS.intro} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 60vw" widths={[360, 540, 720]} ratio="3 / 4" parallax={7} />        </div>
      </div>
    </section>
  )
}
