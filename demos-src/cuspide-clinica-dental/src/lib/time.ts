import { HOURS } from '../data/clinic'

/* Todo en hora de Madrid, esté donde esté quien mira la web. */
function madridParts(d = new Date()) {
  const f = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' })
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]))
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  const day = days.indexOf(p.weekday.replace('.', ''))
  return { day, min: Number(p.hour) * 60 + Number(p.minute), y: Number(p.year), m: Number(p.month), d: Number(p.day) }
}

export function openState(now = new Date()) {
  const { day, min } = madridParts(now)
  const today = HOURS.find((h) => h.day === day)
  const slot = today?.slots.find(([a, b]) => min >= a && min < b)
  if (slot) return { open: true, text: `Abierto ahora · hasta las ${fmt(slot[1])}` }
  const later = today?.slots.find(([a]) => min < a)
  if (later) return { open: false, text: `Cerrado ahora · abrimos a las ${fmt(later[0])}` }
  for (let i = 1; i <= 7; i++) {
    const h = HOURS.find((x) => x.day === (day + i) % 7)
    if (h) return { open: false, text: `Cerrado ahora · abrimos ${i === 1 ? 'mañana' : DAY_NAMES[(day + i) % 7]} a las ${fmt(h.slots[0][0])}` }
  }
  return { open: false, text: 'Cerrado ahora' }
}

export const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
const DAY_NAMES = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado']

export type Day = { key: string; weekday: string; date: string; day: number; slots: [number, number][] }

/* Próximos días con consulta (sin contar hoy), para elegir el día preferido. */
export function nextDays(count = 10): Day[] {
  const { y, m, d } = madridParts()
  const out: Day[] = []
  const base = new Date(Date.UTC(y, m - 1, d, 12))
  const wd = new Intl.DateTimeFormat('es-ES', { weekday: 'short', timeZone: 'UTC' })
  const dm = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  for (let i = 1; out.length < count && i < 30; i++) {
    const dt = new Date(base.getTime() + i * 864e5)
    const h = HOURS.find((x) => x.day === dt.getUTCDay())
    if (!h) continue
    out.push({
      key: dt.toISOString().slice(0, 10),
      weekday: wd.format(dt).replace('.', ''),
      date: dm.format(dt).replace('.', ''),
      day: dt.getUTCDay(),
      slots: h.slots,
    })
  }
  return out
}

/* Horas de inicio cada media hora; la última, media hora antes de cerrar. */
export function times([a, b]: [number, number]) {
  const out: string[] = []
  for (let t = a; t <= b - 30; t += 30) out.push(fmt(t))
  return out
}
