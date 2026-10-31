import { RESTAURANT } from '../data/restaurant'

export const waLink = (text: string) => `https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(text)}`

export const waGeneric = waLink('Hola, me gustaría reservar una mesa en La Alacena.')

export const waGroup = (menu?: string) =>
  waLink(
    `Hola, queremos reservar para un grupo en La Alacena${menu ? ` con el ${menu}` : ''}.\n\n` +
      'Personas: \nFecha: \nHora: \n\n¿Tenéis sitio en el salón de abajo? ¡Gracias!',
  )

export type Booking = {
  name: string
  guests: string
  date: string
  time: string
  type: 'mesa' | 'grupo'
  notes: string
}

const fmtDate = (iso: string) => {
  const [y, mo, d] = iso.split('-').map(Number)
  const dt = new Date(y, mo - 1, d)
  return dt.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const bookingMessage = (b: Booking) =>
  [
    'Hola, me gustaría reservar una mesa en La Alacena.',
    '',
    `Nombre: ${b.name.trim()}`,
    `Personas: ${b.guests}`,
    `Fecha: ${fmtDate(b.date)}`,
    `Hora: ${b.time}`,
    `Tipo: ${b.type === 'grupo' ? 'Menú de grupo' : 'Mesa normal'}`,
    `Notas: ${b.notes.trim() || 'Ninguna'}`,
    '',
    '¡Gracias!',
  ].join('\n')
