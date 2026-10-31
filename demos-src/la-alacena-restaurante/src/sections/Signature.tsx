import { motion } from 'framer-motion'
import { Button, Img, SectionHead } from '../components/ui'
import { SIGNATURE, type Photo } from '../data/restaurant'
import { EASE, EASE_IN_OUT, VIEW } from '../lib/motion'

/* Composición asimétrica: cada plato ocupa una celda distinta en escritorio.
 * Los platos sin foto se presentan como una etiqueta de carta grande en papel o en color. */
const LAYOUT = [
  'md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[640px]',
  'md:col-span-5 aspect-[5/4]',
  'md:col-span-5 aspect-[5/4] md:-mt-10 md:ml-[-12%] md:z-10',
  'md:col-span-4 aspect-[4/5]',
  'md:col-span-4 aspect-[4/5] md:mt-16',
  'md:col-span-4 aspect-[4/5] md:-mt-8',
]
const TILE_TONES = ['bg-estraza text-nogal', 'bg-verde text-tiza', 'bg-almagra text-cal']

export function Signature() {
  let tone = 0
  return (
    <section aria-labelledby="cocina-title" className="bg-blanco py-24 md:py-36">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead id="cocina-title" eyebrow="De nuestra cocina" title={['El mercado manda.', 'Nosotros ponemos el cariño.']} />
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VIEW} transition={{ delay: 0.3 }}>
            <Button href="#carta" variant="ghost">
              Ver toda la carta
            </Button>
          </motion.div>
        </div>

        <ul className="mt-14 grid gap-5 md:mt-20 md:grid-cols-12 md:gap-6">
          {SIGNATURE.map((d, i) => (
            <li key={d.name} className={`relative ${LAYOUT[i]}`}>
              {d.photo ? (
                <PhotoDish name={d.name} price={d.price} photo={d.photo} index={i} />
              ) : (
                <TypeDish name={d.name} price={d.price} tone={TILE_TONES[tone++ % TILE_TONES.length]} index={i} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Label({ name, price, index, dark }: { name: string; price: string; index: number; dark?: boolean }) {
  return (
    <motion.figcaption
      className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7 ${dark ? 'text-cal' : ''}`}
      initial="hidden"
      whileInView="show"
      viewport={VIEW}
      variants={{ hidden: {}, show: { transition: { delayChildren: 0.5 + (index % 3) * 0.1, staggerChildren: 0.08 } } }}
    >
      <motion.span
        variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
        className="max-w-[16ch] font-serif text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.08]"
      >
        {name}
      </motion.span>
      <motion.span
        variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } } }}
        className={`num shrink-0 rounded-full px-3.5 py-1.5 text-[15px] font-bold ${dark ? 'bg-cal text-nogal' : 'bg-nogal text-cal'}`}
      >
        {price}
      </motion.span>
    </motion.figcaption>
  )
}

function PhotoDish({ name, price, photo, index }: { name: string; price: string; photo: Photo; index: number }) {
  return (
    <motion.figure
      className="group relative m-0 h-full overflow-hidden rounded-[14px] bg-estraza"
      initial={{ clipPath: 'inset(0 0 100% 0 round 14px)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0 round 14px)' }}
      viewport={VIEW}
      transition={{ duration: 1.2, ease: EASE_IN_OUT, delay: (index % 3) * 0.1 }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={VIEW}
        transition={{ duration: 1.6, ease: EASE, delay: (index % 3) * 0.1 }}
      >
        <div className="h-full w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
          <Img photo={photo} sizes={index === 0 ? '(min-width: 900px) 58vw, 100vw' : '(min-width: 900px) 34vw, 100vw'} />
        </div>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(26,19,14,0.72),transparent)]" />
      <Label name={name} price={price} index={index} dark />
    </motion.figure>
  )
}

function TypeDish({ name, price, tone, index }: { name: string; price: string; tone: string; index: number }) {
  const dark = !tone.includes('estraza')
  return (
    <motion.figure
      className={`group relative m-0 h-full overflow-hidden rounded-[14px] ${tone}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ duration: 1, ease: EASE, delay: (index % 3) * 0.1 }}
    >
      {/* Plato visto desde arriba: dos aros finos que giran un poco al pasar el ratón. */}
      <div className="absolute inset-0 grid place-items-center" aria-hidden>
        <div className="aspect-square w-[62%] rounded-full border border-current opacity-20 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
          <div className="m-[14%] aspect-square rounded-full border border-current" />
        </div>
      </div>
      <Label name={name} price={price} index={index} dark={dark} />
    </motion.figure>
  )
}
