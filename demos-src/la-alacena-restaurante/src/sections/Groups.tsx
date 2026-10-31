import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button, RevealImage, SectionHead } from '../components/ui'
import { GROUP_MENUS, PHOTOS } from '../data/restaurant'
import { EASE, VIEW } from '../lib/motion'
import { waGroup } from '../lib/whatsapp'

export function Groups() {
  return (
    <section id="grupos" aria-labelledby="grupos-title" className="bg-blanco py-24 md:py-36">
      <div className="wrap">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <SectionHead
              id="grupos-title"
              eyebrow="Las buenas mesas se comparten"
              title={['Si sois unos cuantos,', 'tenemos sitio para todos.']}
              lead="Para grupos de 8 a 30 personas, en nuestro salón de abajo."
            />
          </div>
          <RevealImage
            photo={PHOTOS.groups}
            sizes="(min-width: 1024px) 45vw, 100vw"
            ratio="4 / 3"
            parallax={5}
            className="lg:col-span-6"
          />
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:mt-20">
          {GROUP_MENUS.map((g, i) => (
            <motion.li
              key={g.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW}
              transition={{ duration: 1, ease: EASE, delay: i * 0.14 }}
              whileHover={{ y: -6 }}
              className={`group relative flex flex-col rounded-[14px] p-7 transition-shadow duration-500 md:p-10 ${
                i ? 'on-dark bg-verde text-tiza hover:shadow-[0_30px_60px_-34px_rgba(30,58,47,0.8)]' : 'border border-nogal/15 bg-cal hover:shadow-[0_30px_60px_-36px_rgba(42,31,24,0.45)]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-current/15 pb-6">
                <h3 className={`font-serif text-[clamp(1.7rem,3vw,2.2rem)] ${i ? 'text-cal' : ''}`}>{g.name}</h3>
                <p className="shrink-0 text-right">
                  <span className={`num font-serif text-[clamp(2.2rem,4vw,3rem)] leading-none ${i ? 'text-ocre' : 'text-almagra'}`}>{g.price}</span>
                  <span className={`block text-[14px] ${i ? 'text-tiza/70' : 'text-apagado'}`}>por persona</span>
                </p>
              </div>
              <Block title="Para compartir" items={g.share} dark={!!i} />
              <Block title={g.mainLabel} items={g.main} dark={!!i} />
              <div className="mt-6">
                <p className={`text-[14px] font-semibold ${i ? 'text-tiza/70' : 'text-apagado'}`}>Incluye</p>
                <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  {g.includes.map((x) => (
                    <li key={x} className="flex items-center gap-1.5 text-[15px]">
                      <Check size={15} className={i ? 'text-ocre' : 'text-almagra'} aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <Button href={waGroup(g.name)} external variant={i ? 'light' : 'primary'} className="w-full sm:w-auto">
                  Consultar menú para grupos
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Block({ title, items, dark }: { title: string; items: string[]; dark: boolean }) {
  return (
    <div className="mt-6">
      <p className={`text-[14px] font-semibold ${dark ? 'text-tiza/70' : 'text-apagado'}`}>{title}</p>
      <ul className="mt-1.5">
        {items.map((x) => (
          <li key={x} className={`font-serif text-[19px] leading-relaxed ${dark ? 'text-cal' : 'text-nogal'}`}>
            {x}
          </li>
        ))}
      </ul>
    </div>
  )
}
