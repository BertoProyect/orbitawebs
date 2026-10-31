import { HOURS, type Slot } from '../data/restaurant'

/* Hora actual en Huelva (Europe/Madrid), independiente de la zona del visitante. */
export function madridNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0'
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return { day: days.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export const fmt = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
export const fmtSlots = (slots: Slot[]) => (slots.length ? slots.map(([a, b]) => `${fmt(a)}–${fmt(b)}`).join(' / ') : 'Cerrado')

export function openStatus(d = new Date()) {
  const { day, minutes } = madridNow(d)
  const today = HOURS.find((h) => h.day === day)!
  const current = today.slots.find(([a, b]) => minutes >= a && minutes < b)
  if (current) return { open: true, text: `Abierto ahora · hasta las ${fmt(current[1])}`, day }
  const later = today.slots.find(([a]) => minutes < a)
  if (later) return { open: false, text: `Cerrado ahora · abrimos hoy a las ${fmt(later[0])}`, day }
  for (let i = 1; i <= 7; i++) {
    const nd = (day + i) % 7
    const next = HOURS.find((h) => h.day === nd)!
    if (next.slots.length) {
      const when = i === 1 ? 'mañana' : `el ${next.label.toLowerCase()}`
      return { open: false, text: `Cerrado ahora · abrimos ${when} a las ${fmt(next.slots[0][0])}`, day }
    }
  }
  return { open: false, text: 'Cerrado ahora', day }
}

/* Horas de reserva para un día concreto (cada 30 min, hasta 1 h antes del cierre). */
export function bookingTimes(iso: string): string[] {
  if (!iso) return []
  const [y, mo, d] = iso.split('-').map(Number)
  const day = new Date(y, mo - 1, d).getDay()
  const slots = HOURS.find((h) => h.day === day)?.slots ?? []
  const out: string[] = []
  for (const [a, b] of slots) for (let t = a; t <= b - 60; t += 30) out.push(fmt(t))
  return out
}
export const isClosedDay = (iso: string) => !!iso && bookingTimes(iso).length === 0
