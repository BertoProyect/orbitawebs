import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Button, Eyebrow, Lines, Reveal, RevealImage } from '../components/ui'
import { OTHER_SERVICES, PHOTOS, WEDDING, WHATSAPP } from '../data/site'
import { fadeUp, stagger, VIEW } from '../lib/motion'

/* Inversión · sin tarjetas de precios: tipografía, filetes y aire.
 * La boda manda (cifra grande y lista completa); el resto de reportajes va en filas discretas. */
export function Investment() {
  return (
    <section aria-labelledby="investment-title" className="relative bg-white pb-24 pt-24 md:pb-32 md:pt-36">
      <div className="wrap">
        <header className="border-t border-border pt-10 md:pt-14">
          <Eyebrow n="04">La inversión</Eyebrow>
          <Lines id="investment-title" lines={['Una forma de recordar', 'lo que importa.']} className="display mt-8 max-w-[16ch] md:max-w-none" />
        </header>

        <div className="mt-16 grid grid-cols-12 gap-x-5 gap-y-12 md:mt-24 md:gap-x-8">
          <div className="col-span-12 lg:col-span-4">
            <Reveal>
              <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">Bodas</p>
              <p className="mt-4 text-[clamp(3.2rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.055em]">
                <span className="mr-3 align-top text-[0.28em] font-normal tracking-[-0.01em] text-muted">Desde</span>
                {WEDDING.from}
              </p>
            </Reveal>
            <RevealImage className="mt-10 hidden lg:block" photo={PHOTOS.weddings} sizes="28vw" widths={[480, 720]} ratio="4 / 5" parallax={4} />
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">Incluye</p>
            <motion.ul className="mt-4 grid border-t border-border sm:grid-cols-2 sm:gap-x-8" variants={stagger(0.05)} initial="hidden" whileInView="show" viewport={VIEW}>
              {WEDDING.includes.map((it) => (
                <motion.li key={it} variants={fadeUp} className="border-b border-border py-4 text-[16px] leading-[1.45]">
                  {it}
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8">
              <Reveal>
                <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">Forma de pago</p>
                <ul className="mt-4 space-y-2 text-[16px] text-fg-2">
                  {WEDDING.payment.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">Opcional</p>
                <p className="mt-4 text-[16px] text-fg-2">{WEDDING.optional}</p>
              </Reveal>
            </div>

            <Reveal className="mt-12">
              <Button href="#fecha">Consultar mi fecha</Button>
            </Reveal>
          </div>
        </div>

        {/* Otros reportajes */}
        <div className="mt-24 md:mt-32">
          <Reveal>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">También fotografío</p>
          </Reveal>
          <motion.ul className="mt-5 border-t border-fg" variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={VIEW}>
            {OTHER_SERVICES.map((s) => (
              <motion.li key={s.name} variants={fadeUp} className="border-b border-border">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener"
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 md:grid-cols-12 md:gap-x-8 md:py-8"
                  aria-label={`${s.name}, desde ${s.from}. Consultar por WhatsApp`}
                >
                  <span className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium tracking-[-0.035em] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-2 md:col-span-4 md:row-start-auto">
                    {s.name}
                  </span>
                  <span className="col-span-2 row-start-2 text-[15px] text-fg-2 md:col-span-5 md:row-start-auto">{s.text}</span>
                  <span className="col-start-2 row-start-1 flex items-center gap-3 text-[16px] font-medium tabular-nums md:col-span-3 md:col-start-auto md:row-start-auto md:justify-end">
                    <span className="hidden text-muted sm:inline">Desde</span> {s.from}
                    <ArrowUpRight aria-hidden size={18} strokeWidth={1.5} className="text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  )
}
