import { motion } from 'framer-motion'
import { Button, Eyebrow, RevealImage, Words } from '../components/ui'
import { PHOTOS, WHATSAPP } from '../data/site'
import { fadeUp, stagger, VIEW } from '../lib/motion'

const COPY = [
  'Llevo fotografiando bodas en Huelva desde 2014.',
  'Me gusta observar antes que intervenir. Estar cerca sin hacerme notar. Encontrar esos pequeños momentos que muchas veces pasan desapercibidos y que, con el tiempo, terminan significándolo todo.',
  'Trabajo sola o con una segunda fotógrafa, dependiendo de lo que necesite vuestra boda.',
  'Mi objetivo es sencillo: que dentro de veinte años podáis volver a ese día y sentirlo otra vez.',
]

/* Detrás de la cámara · el retrato sube sobre el fondo gris del método (continuidad entre
 * secciones) y el texto se lee al lado, sin tarjetas. */
export function About() {
  return (
    <section aria-labelledby="about-title" className="relative bg-white pb-28 md:pb-40">
      <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-surface md:h-44" />
      <div className="wrap relative grid grid-cols-12 gap-x-5 md:gap-x-8">
        <div className="col-span-10 md:col-span-5 lg:col-span-5">
          <RevealImage photo={PHOTOS.irene} sizes="(min-width: 768px) 40vw, 84vw" widths={[480, 720, 960]} ratio="4 / 5" parallax={5} />
        </div>
        <div className="col-span-12 mt-12 md:col-span-6 md:col-start-7 md:mt-56 lg:col-span-5 lg:col-start-7">
          <Eyebrow>Detrás de la cámara</Eyebrow>
          <Words id="about-title" text="Soy Irene. Y me gustan las historias que no necesitan guion." className="mt-8 text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.04] tracking-[-0.04em]" />
          <motion.div className="mt-10" variants={stagger(0.12, 0.1)} initial="hidden" whileInView="show" viewport={VIEW}>
            {COPY.map((p, i) => (
              <motion.p key={i} variants={fadeUp} className={`text-[17px] leading-[1.65] text-fg-2 ${i ? 'mt-5' : 'text-fg'}`}>
                {p}
              </motion.p>
            ))}
            <motion.div variants={fadeUp} className="mt-10">
              <Button href={WHATSAPP} external variant="outline">
                Vamos a conocernos
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
