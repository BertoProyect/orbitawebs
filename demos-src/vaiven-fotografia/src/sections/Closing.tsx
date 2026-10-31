import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUp, MessageCircle, Phone } from 'lucide-react'
import { useRef } from 'react'
import { Button, Eyebrow, Lines, Reveal } from '../components/ui'
import { BRAND, PHOTOS, WHATSAPP, pexels, srcSet } from '../data/site'
import { useRichMotion } from '../lib/hooks'
import { EASE } from '../lib/motion'

/* Cierre · foto a sangre, la frase final y dos caminos: escribir o comprobar la fecha. */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const rich = useRichMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], rich ? ['-7%', '7%'] : ['0%', '0%'])

  return (
    <section ref={ref} aria-labelledby="final-title" className="on-dark relative isolate flex min-h-[92svh] items-center overflow-hidden bg-fg text-white">
      <motion.picture className="absolute inset-[-12%_0] -z-10 block will-change-transform" style={{ y }} aria-hidden>
        <source media="(max-width: 767px)" srcSet={srcSet(PHOTOS.finalMobile.id, [480, 720, 960])} sizes="100vw" />
        <img
          src={pexels(PHOTOS.finalDesktop.id, 1920)}
          srcSet={srcSet(PHOTOS.finalDesktop.id, [1280, 1600, 1920, 2400])}
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[50%_40%]"
        />
      </motion.picture>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[rgba(9,9,11,0.5)]" />

      <div className="wrap py-28 text-center">
        <Lines
          id="final-title"
          as="h2"
          gap={0.13}
          lines={['Vuestra historia no', 'necesita ser perfecta.', 'Necesita ser vuestra.']}
          className="mx-auto max-w-[17ch] text-[clamp(2.3rem,6vw,5.6rem)] leading-[0.98] tracking-[-0.05em]"
        />
        <Reveal delay={0.35}>
          <p className="mx-auto mt-8 max-w-[38ch] text-[17px] leading-[1.6] text-white/85 md:text-[19px]">
            Si sentís que mi manera de fotografiar encaja con vosotros, me encantará conoceros.
          </p>
        </Reveal>
        <Reveal delay={0.5} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button href={WHATSAPP} external variant="light">
            Escribir a Irene
          </Button>
          <a href="#fecha" className="btn group border border-white/40 text-white hover:border-white hover:bg-white/10">
            <span>Comprobar disponibilidad</span>
            <motion.span
              aria-hidden
              className="inline-flex"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 }}
            >
              <ArrowUp size={17} strokeWidth={1.75} />
            </motion.span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* Contacto · mínimo: quién, dónde, cómo y hasta dónde. */
export function Contact() {
  const rows = [
    { k: 'Fotógrafa', v: BRAND.photographer },
    { k: 'Estudio', v: BRAND.studio },
    { k: 'Teléfono', v: <a href={BRAND.phoneHref} className="tlink !py-0">{BRAND.phoneDisplay}</a> },
    { k: 'Desplazamientos', v: BRAND.travel },
  ]
  return (
    <section id="contacto" aria-labelledby="contact-title" className="bg-white pb-20 pt-24 md:pb-28 md:pt-36">
      <div className="wrap grid grid-cols-12 gap-x-5 gap-y-12 md:gap-x-8">
        <div className="col-span-12 lg:col-span-6">
          <Eyebrow n="05">Contacto</Eyebrow>
          <Lines id="contact-title" lines={['Contadme cómo', 'os imagináis el día.']} className="display mt-8" />
          <Reveal delay={0.15}>
            <p className="lead mt-8 max-w-[36ch]">Os respondo yo misma, sin compromiso y sin formularios.</p>
          </Reveal>
          <Reveal delay={0.25} className="mt-10 flex flex-col gap-3 xs:flex-row">
            <a href={WHATSAPP} target="_blank" rel="noopener" className="btn group bg-primary text-white hover:bg-primary-hover">
              <MessageCircle aria-hidden size={17} strokeWidth={1.75} />
              <span>Escribir por WhatsApp</span>
            </a>
            <a href={BRAND.phoneHref} className="btn group border border-border-strong hover:border-fg">
              <Phone aria-hidden size={16} strokeWidth={1.75} />
              <span>Llamar al {BRAND.phoneDisplay}</span>
            </a>
          </Reveal>
        </div>

        <motion.dl
          className="col-span-12 self-end border-t border-fg lg:col-span-5 lg:col-start-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-border py-5 text-[16px] sm:grid-cols-[10rem_1fr]">
              <dt className="text-muted">{r.k}</dt>
              <dd className="m-0">{r.v}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
