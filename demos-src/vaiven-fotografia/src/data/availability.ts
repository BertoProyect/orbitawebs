/* Agenda de bodas · disponibilidad configurable.
 *
 * Nada de lo que muestra el calendario se inventa: solo se marca una fecha como disponible u
 * ocupada si aparece aquí. Mientras la agenda esté cerrada, cualquier día lleva al mensaje de
 * «agenda todavía no abierta».
 *
 * Para abrir la agenda:
 *   status: 'open',
 *   availableDates: ['2027-06-12', '2027-06-26'],   // AAAA-MM-DD
 *   occupiedDates:  ['2027-06-19'],
 * Los días abiertos que no estén en ninguna lista se muestran como «sin confirmar». */

export type AgendaStatus = 'open' | 'closed'

export const weddingAvailability: {
  status: AgendaStatus
  availableDates: string[]
  occupiedDates: string[]
} = {
  status: 'closed',
  availableDates: [],
  occupiedDates: [],
}

export type DayState = 'available' | 'occupied' | 'unconfirmed' | 'closed'

export function dayState(iso: string): DayState {
  const a = weddingAvailability
  if (a.status === 'closed') return 'closed'
  if (a.occupiedDates.includes(iso)) return 'occupied'
  if (a.availableDates.includes(iso)) return 'available'
  return 'unconfirmed'
}

/* Los sábados disponibles más cercanos a una fecha (solo de los configurados, nunca inventados). */
export function nearestSaturdays(iso: string, today: string, max = 2): string[] {
  const t = Date.parse(iso)
  return weddingAvailability.availableDates
    .filter((d) => d > today && new Date(`${d}T12:00:00`).getDay() === 6)
    .sort((x, y) => Math.abs(Date.parse(x) - t) - Math.abs(Date.parse(y) - t))
    .slice(0, max)
    .sort()
}
