import { motion } from 'framer-motion'
import { CalendarDays, Leaf, Star, Users } from 'lucide-react'
import { RESTAURANT } from '../data/restaurant'
import { EASE } from '../lib/motion'

const ITEMS = [
  { icon: Star, text: `${RESTAURANT.rating} en Google · ${RESTAURANT.reviews} opiniones` },
  { icon: CalendarDays, text: 'Menú del día · 14,50 €' },
  { icon: Leaf, text: 'Cocina de temporada' },
  { icon: Users, text: 'Grupos hasta 30 personas' },
]

export function TrustBar() {
  return (
    <section aria-label="La Alacena en pocas palabras" className="border-b border-nogal/10 bg-estraza">
      <ul className="no-scrollbar wrap flex snap-x snap-mandatory gap-0 overflow-x-auto py-5 md:justify-between md:overflow-visible">
        {ITEMS.map(({ icon: Icon, text }, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.7, ease: EASE }}
            className="flex shrink-0 snap-start items-center gap-2.5 whitespace-nowrap pr-8 text-[15px] font-medium text-nogal md:pr-0 [&:not(:last-child)]:md:after:ml-8 [&:not(:last-child)]:md:after:h-5 [&:not(:last-child)]:md:after:w-px [&:not(:last-child)]:md:after:bg-nogal/20 [&:not(:last-child)]:md:after:content-['']"
          >
            <Icon size={17} className="text-almagra" aria-hidden />
            {text}
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
