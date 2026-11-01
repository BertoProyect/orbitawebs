import { motion, useReducedMotion } from 'framer-motion'
import { LOWER_ROW, TEETH, UPPER_ROW } from '../../data/teeth'

/* Selector en plano: las dos arcadas como las ve el dentista, con una curva leve
   (arriba sonríe, abajo al revés) y la línea media marcada. */
export function Odontogram({ active, onPick }: { active: number; onPick: (fdi: number) => void }) {
  const reduce = useReducedMotion()
  const row = (list: number[], dir: 1 | -1, label: string) => (
    <div role="group" aria-label={label} className="relative grid grid-cols-16 gap-[2px] sm:gap-1">
      {list.map((f, i) => {
        const d = Math.abs(i - 7.5)
        const on = f === active
        const t = TEETH[f]
        return (
          <button
            key={f}
            type="button"
            className="tooth-btn !min-w-0"
            style={{ transform: `translateY(${dir * -d * d * 0.22}px)` }}
            aria-pressed={on}
            aria-label={`Diente ${f}, ${t.name.toLowerCase()}`}
            title={t.short}
            onClick={() => onPick(f)}
          >
            {on && <motion.span layoutId="tooth-fill" className="tooth-btn__fill" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className={t.pos >= 6 ? 'text-[11px] sm:text-[12px]' : 'text-[11px] sm:text-[12px]'}>{f}</span>
          </button>
        )
      })}
      <span className="pointer-events-none absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-white/12" aria-hidden />
    </div>
  )
  return (
    <div className="grid gap-5 pt-2 sm:gap-6">
      {row(UPPER_ROW, 1, 'Arcada superior')}
      {row(LOWER_ROW, -1, 'Arcada inferior')}
    </div>
  )
}
