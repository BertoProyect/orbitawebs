import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { dayState, type DayState } from '../data/availability'
import { EASE } from '../lib/motion'

/* Calendario de bodas · mes a mes, con saltos de año.
 * Teclado como un selector nativo: flechas (día/semana), Inicio/Fin (semana), RePág/AvPág (mes),
 * Mayús + RePág/AvPág (año), Intro o espacio para elegir. Semanas de lunes a domingo. */

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const WEEK = [
  ['L', 'lunes'],
  ['M', 'martes'],
  ['X', 'miércoles'],
  ['J', 'jueves'],
  ['V', 'viernes'],
  ['S', 'sábado'],
  ['D', 'domingo'],
]
const YEARS_AHEAD = 3

const pad = (n: number) => String(n).padStart(2, '0')
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d: Date, n: number) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()
  return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last))
}
export const human = (d: Date) => `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`

const STATE_LABEL: Record<DayState, string> = {
  available: 'disponible',
  occupied: 'reservada',
  unconfirmed: 'sin confirmar',
  closed: 'agenda aún no abierta',
}

export function Calendar({ value, onChange, today }: { value: string | null; onChange: (iso: string) => void; today: Date }) {
  const min = useMemo(() => addDays(today, 1), [today])
  const max = useMemo(() => new Date(today.getFullYear() + YEARS_AHEAD, 11, 31), [today])
  const clamp = (d: Date) => (d < min ? min : d > max ? max : d)

  const start = value ? fromIso(value) : min
  const [view, setView] = useState(() => new Date(start.getFullYear(), start.getMonth(), 1))
  const [focus, setFocus] = useState<Date>(start)
  const [dir, setDir] = useState(0)
  const grid = useRef<HTMLDivElement>(null)

  const firstMonth = new Date(min.getFullYear(), min.getMonth(), 1)
  const lastMonth = new Date(max.getFullYear(), max.getMonth(), 1)

  const show = (d: Date, moveFocus = false) => {
    const m = new Date(d.getFullYear(), d.getMonth(), 1)
    const target = m < firstMonth ? firstMonth : m > lastMonth ? lastMonth : m
    setDir(Math.sign(target.getTime() - view.getTime()))
    setView(target)
    if (moveFocus) {
      const f = clamp(d)
      setFocus(f)
      requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-iso="${iso(f)}"]`)?.focus())
    } else {
      /* Al cambiar de mes con las flechas, el foco del teclado se coloca en el mismo día de ese mes. */
      setFocus(clamp(new Date(target.getFullYear(), target.getMonth(), Math.min(focus.getDate(), 28))))
    }
  }

  /* 6 semanas fijas: la altura no salta al cambiar de mes. */
  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7
    return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset))
  }, [view])

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = e.key
    let next: Date | null = null
    if (k === 'ArrowRight') next = addDays(focus, 1)
    else if (k === 'ArrowLeft') next = addDays(focus, -1)
    else if (k === 'ArrowDown') next = addDays(focus, 7)
    else if (k === 'ArrowUp') next = addDays(focus, -7)
    else if (k === 'Home') next = addDays(focus, -((focus.getDay() + 6) % 7))
    else if (k === 'End') next = addDays(focus, 6 - ((focus.getDay() + 6) % 7))
    else if (k === 'PageDown') next = addMonths(focus, e.shiftKey ? 12 : 1)
    else if (k === 'PageUp') next = addMonths(focus, e.shiftKey ? -12 : -1)
    if (!next) return
    e.preventDefault()
    next = clamp(next)
    if (next.getMonth() !== view.getMonth() || next.getFullYear() !== view.getFullYear()) show(next, true)
    else {
      setFocus(next)
      grid.current?.querySelector<HTMLButtonElement>(`[data-iso="${iso(next)}"]`)?.focus()
    }
  }

  const prevMonthOk = view > firstMonth
  const nextMonthOk = view < lastMonth
  const prevYearOk = view.getFullYear() > firstMonth.getFullYear()
  const nextYearOk = view.getFullYear() < lastMonth.getFullYear()
  const label = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`
  const focusIso = iso(focus)
  const focusVisible = focus.getMonth() === view.getMonth() && focus.getFullYear() === view.getFullYear()
  const fallback = cells.find((d) => d.getMonth() === view.getMonth() && d >= min && d <= max)
  const tabIso = focusVisible && focus >= min ? focusIso : fallback ? iso(fallback) : ''

  return (
    <div className="select-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex">
          <NavBtn label="Año anterior" disabled={!prevYearOk} onClick={() => show(new Date(view.getFullYear() - 1, view.getMonth(), 1))}>
            <ChevronsLeft size={18} strokeWidth={1.5} />
          </NavBtn>
          <NavBtn label="Mes anterior" disabled={!prevMonthOk} onClick={() => show(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
            <ChevronLeft size={18} strokeWidth={1.5} />
          </NavBtn>
        </div>
        <div className="relative h-7 flex-1 overflow-hidden text-center" aria-live="polite">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.p
              key={label}
              custom={dir}
              className="text-[17px] font-medium capitalize tracking-[-0.02em]"
              variants={{ enter: (d: number) => ({ y: d * 14, opacity: 0 }), center: { y: 0, opacity: 1 }, exit: (d: number) => ({ y: d * -14, opacity: 0 }) }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
            >
              {label}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex">
          <NavBtn label="Mes siguiente" disabled={!nextMonthOk} onClick={() => show(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
            <ChevronRight size={18} strokeWidth={1.5} />
          </NavBtn>
          <NavBtn label="Año siguiente" disabled={!nextYearOk} onClick={() => show(new Date(view.getFullYear() + 1, view.getMonth(), 1))}>
            <ChevronsRight size={18} strokeWidth={1.5} />
          </NavBtn>
        </div>
      </div>

      <div ref={grid} role="grid" aria-label={`Calendario, ${label}`} onKeyDown={onKey} className="mt-5">
        <div role="row" className="grid grid-cols-7">
          {WEEK.map(([s, l]) => (
            <span key={l} role="columnheader" aria-label={l} className="pb-3 text-center text-[12px] font-medium text-muted">
              {s}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, w) => (
          <div role="row" key={w} className="grid grid-cols-7">
            {cells.slice(w * 7, w * 7 + 7).map((d) => {
              const key = iso(d)
              const outside = d.getMonth() !== view.getMonth()
              if (outside) return <span key={key} role="gridcell" aria-hidden className="aspect-square" />
              const disabled = d < min || d > max
              const state = dayState(key)
              const selected = value === key
              const isToday = key === iso(today)
              const tabbable = key === tabIso
              return (
                <span key={key} role="gridcell" aria-selected={selected} className="p-[2px]">
                  <button
                    type="button"
                    data-iso={key}
                    disabled={disabled}
                    tabIndex={tabbable && !disabled ? 0 : -1}
                    onClick={() => {
                      setFocus(d)
                      onChange(key)
                    }}
                    aria-label={`${human(d)}${disabled ? '' : `, ${STATE_LABEL[state]}`}`}
                    aria-pressed={selected}
                    className={`relative grid aspect-square w-full place-items-center rounded-[8px] text-[15px] tabular-nums transition-[background-color,color,transform] duration-200 active:scale-95 ${
                      selected
                        ? 'bg-fg font-medium text-white'
                        : disabled
                          ? 'cursor-not-allowed text-border-strong'
                          : 'text-fg hover:bg-surface-2'
                    } ${d.getDay() === 6 && !selected && !disabled ? 'font-medium' : ''}`}
                  >
                    <span>{d.getDate()}</span>
                    {!disabled && (state === 'available' || state === 'occupied') && (
                      <span aria-hidden className={`absolute bottom-[18%] h-1 w-1 rounded-full ${state === 'available' ? 'bg-success' : 'bg-error'} ${selected ? 'ring-2 ring-fg' : ''}`} />
                    )}
                    {isToday && <span aria-hidden className="absolute inset-[3px] rounded-[6px] border border-border-strong" />}
                  </button>
                </span>
              )
            })}
          </div>
        ))}
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-[12px] text-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" /> Disponible
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-error" /> Reservada
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-muted" /> Sin confirmar
        </li>
      </ul>
    </div>
  )
}

function NavBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-[8px] text-fg transition-[background-color,color,transform] duration-200 hover:bg-surface-2 active:scale-95 disabled:pointer-events-none disabled:text-border-strong"
    >
      {children}
    </button>
  )
}
