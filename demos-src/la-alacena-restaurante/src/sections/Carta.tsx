import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ChevronDown, ShieldAlert, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SectionHead } from '../components/ui'
import { ALLERGENS, MENU, allergenLabel, type AllergenKey, type Dish } from '../data/restaurant'
import { useDesktop } from '../lib/hooks'
import { EASE } from '../lib/motion'

const TOTAL = MENU.reduce((n, c) => n + c.dishes.length, 0)
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`)

type Verdict = 'ok' | 'contains' | 'pending'
const verdict = (d: Dish, ex: Set<AllergenKey>): Verdict => {
  if (!ex.size) return 'ok'
  if (d.status === 'pending') return 'pending'
  return d.allergens.some((a) => ex.has(a)) ? 'contains' : 'ok'
}

export function Carta() {
  const desktop = useDesktop()
  const [excluded, setExcluded] = useState<Set<AllergenKey>>(new Set())
  const [panelOpen, setPanelOpen] = useState(false)
  const [active, setActive] = useState(MENU[0].id)

  const toggle = (k: AllergenKey) =>
    setExcluded((s) => {
      const n = new Set(s)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })

  const okCount = useMemo(
    () => MENU.reduce((n, c) => n + c.dishes.filter((d) => verdict(d, excluded) === 'ok').length, 0),
    [excluded],
  )

  /* Pestaña activa según la categoría que está a la vista. */
  useEffect(() => {
    const els = MENU.map((c) => document.getElementById(`cat-${c.id}`)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (es) => {
        const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (v[0]) setActive(v[0].target.id.replace('cat-', ''))
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  const goTo = (id: string) => {
    setActive(id)
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const names = [...excluded].map(allergenLabel).map((s) => s.toLowerCase())

  const panel = (
    <div className="rounded-[14px] border border-nogal/12 bg-blanco p-5 md:p-6">
      <h3 className="font-serif text-[22px] leading-tight">¿Hay algún ingrediente que debamos tener en cuenta?</h3>
      <p className="mt-2 text-[15px] text-apagado">Selecciona los alérgenos que quieres excluir de tu búsqueda.</p>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Alérgenos">
        {ALLERGENS.map((a) => {
          const on = excluded.has(a.key)
          return (
            <li key={a.key}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(a.key)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-medium transition-colors duration-300 active:scale-[0.96] ${
                  on ? 'border-almagra bg-almagra text-cal' : 'border-nogal/20 text-texto hover:border-nogal/50'
                }`}
              >
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="inline-flex overflow-hidden"
                    >
                      <X size={14} aria-hidden />
                    </motion.span>
                  )}
                </AnimatePresence>
                Sin {a.label.toLowerCase()}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-5 min-h-[52px] border-t border-nogal/10 pt-4 text-[15px]" aria-live="polite">
        {excluded.size ? (
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p>
              Puedes pedir{' '}
              <motion.strong key={okCount} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="num inline-block font-serif text-[22px] text-almagra">
                {okCount}
              </motion.strong>{' '}
              de {TOTAL} platos sin {list(names)}.
            </p>
            <button type="button" onClick={() => setExcluded(new Set())} className="text-[14px] font-semibold text-almagra underline-offset-4 hover:underline">
              Quitar filtros
            </button>
          </div>
        ) : (
          <p className="text-apagado">Sin filtros: ves los {TOTAL} platos de la carta.</p>
        )}
      </div>
      <p className="mt-4 flex gap-2.5 rounded-[10px] bg-estraza/60 p-3.5 text-[14px] leading-relaxed">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-almagra" aria-hidden />
        Si tienes una alergia o intolerancia, consulta siempre con nuestro equipo antes de realizar tu pedido. Para alergias graves, avísanos al reservar.
      </p>
    </div>
  )

  return (
    <section id="carta" aria-labelledby="carta-title" className="bg-cal py-24 md:py-36">
      <div className="wrap">
        <SectionHead
          id="carta-title"
          eyebrow="Nuestra carta"
          title={['La carta, con los', 'alérgenos a la vista.']}
          lead="Cinco apartados y veintitrés platos. Marca lo que no puedes comer y te decimos qué puedes pedir."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Filtro: fijo a la izquierda en escritorio, desplegable en móvil */}
          <aside className="lg:col-span-5 xl:col-span-4" aria-label="Filtro de alérgenos">
            {desktop ? (
              <div className="sticky top-[92px]">{panel}</div>
            ) : (
              <div>
                <button
                  type="button"
                  aria-expanded={panelOpen}
                  aria-controls="panel-alergenos"
                  onClick={() => setPanelOpen((o) => !o)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-[10px] border border-nogal/20 bg-blanco px-5 text-left font-semibold text-nogal"
                >
                  <span className="flex items-center gap-2.5">
                    <SlidersHorizontal size={18} className="text-almagra" aria-hidden />
                    Filtrar por alérgenos
                    {excluded.size > 0 && (
                      <span className="num rounded-full bg-almagra px-2 py-0.5 text-[13px] text-cal">{excluded.size}</span>
                    )}
                  </span>
                  <motion.span animate={{ rotate: panelOpen ? 180 : 0 }} transition={{ duration: 0.35 }}>
                    <ChevronDown size={20} aria-hidden />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {panelOpen && (
                    <motion.div
                      id="panel-alergenos"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3">{panel}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!panelOpen && excluded.size > 0 && (
                  <p className="mt-3 text-[15px]" aria-live="polite">
                    Puedes pedir <strong className="num text-almagra">{okCount}</strong> de {TOTAL} platos sin {list(names)}.
                  </p>
                )}
              </div>
            )}
          </aside>

          <div className="lg:col-span-7 xl:col-span-8">
            {/* Pestañas de categoría: llevan a cada apartado */}
            <LayoutGroup id="tabs-carta">
              <nav
                aria-label="Apartados de la carta"
                className="no-scrollbar sticky top-[68px] z-20 -mx-5 flex gap-1 overflow-x-auto border-b border-nogal/12 bg-cal/92 px-5 py-2 backdrop-blur-md md:mx-0 md:px-0"
              >
                {MENU.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-current={active === c.id ? 'true' : undefined}
                    onClick={() => goTo(c.id)}
                    className={`relative shrink-0 rounded-[10px] px-4 py-2.5 text-[15px] font-semibold transition-colors duration-300 ${
                      active === c.id ? 'text-cal' : 'text-texto hover:text-nogal'
                    }`}
                  >
                    {active === c.id && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 -z-10 rounded-[10px] bg-nogal"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{c.title}</span>
                  </button>
                ))}
              </nav>
            </LayoutGroup>

            {MENU.map((c) => (
              <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`h-${c.id}`} className="scroll-mt-[140px] pt-12">
                <motion.h3
                  id={`h-${c.id}`}
                  className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] text-nogal"
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  {c.title}
                </motion.h3>
                {c.note && <p className="mt-2 text-[15px] text-apagado">{c.note}</p>}
                <ul className="mt-4">
                  {c.dishes.map((d, i) => (
                    <DishRow key={d.name} dish={d} v={verdict(d, excluded)} excluded={excluded} index={i} />
                  ))}
                </ul>
              </section>
            ))}

            <p className="mt-12 border-t border-nogal/12 pt-6 text-[15px] text-apagado">
              Precios con IVA incluido. Cada plato indica sus alérgenos. Si tienes una alergia grave, avísanos al reservar.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function DishRow({ dish, v, excluded, index }: { dish: Dish; v: Verdict; excluded: Set<AllergenKey>; index: number }) {
  const hits = dish.allergens.filter((a) => excluded.has(a))
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.05 }}
      className="border-b border-nogal/10 py-5"
    >
      <motion.div animate={{ opacity: v === 'contains' ? 0.38 : 1 }} transition={{ duration: 0.45 }}>
        <div className="flex items-baseline">
          <span className={`font-serif text-[clamp(1.15rem,2vw,1.35rem)] leading-snug text-nogal ${v === 'contains' ? 'line-through decoration-almagra/60 decoration-1' : ''}`}>
            {dish.name}
          </span>
          <span className="leader" aria-hidden />
          <span className="num shrink-0 font-semibold text-nogal">{dish.price}</span>
        </div>
        {dish.note && <p className="mt-1 text-[15px] text-apagado">{dish.note}</p>}
        <p className="mt-2 text-[13.5px] text-apagado">
          {dish.status === 'pending'
            ? 'Alérgenos pendientes de verificar por el restaurante.'
            : dish.allergens.length
              ? `Alérgenos: ${list(dish.allergens.map(allergenLabel).map((s) => s.toLowerCase()))}.`
              : 'Sin alérgenos de declaración obligatoria.'}
        </p>
      </motion.div>
      <AnimatePresence initial={false}>
        {v !== 'ok' && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <span className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold ${v === 'pending' ? 'bg-ocre/40 text-nogal' : 'bg-almagra/10 text-almagra'}`}>
              {v === 'pending' ? 'Consúltanos antes de pedirlo' : `Lleva ${list(hits.map(allergenLabel).map((s) => s.toLowerCase()))}`}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
      {v === 'ok' && excluded.size > 0 && (
        <span className="sr-only">Sin los alérgenos marcados.</span>
      )}
    </motion.li>
  )
}
