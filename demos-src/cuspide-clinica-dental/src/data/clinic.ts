/* Datos del negocio. Una sola fuente: lo que se pinta en la web sale de aquí. */
export const BASE = '/cuspide-clinica-dental'

export const CLINIC = {
  name: 'Cúspide Clínica Dental',
  slogan: 'Sonríe sin sorpresas.',
  street: 'Calle Puerto, 23',
  postal: '21001',
  city: 'Huelva',
  phone: '959 24 87 31',
  tel: 'tel:+34959248731',
  geo: { lat: 37.25615, lng: -6.94885 },
  maps: 'https://www.google.com/maps/dir/?api=1&destination=Calle+Puerto+23%2C+21001+Huelva',
  osm: 'https://www.openstreetmap.org/export/embed.html?bbox=-6.9548%2C37.2532%2C-6.9429%2C37.2591&layer=mapnik&marker=37.25615%2C-6.94885',
} as const

/* Horario en minutos desde medianoche. 0 = domingo. */
export const HOURS: { day: number; slots: [number, number][] }[] = [
  { day: 1, slots: [[570, 840], [990, 1230]] },
  { day: 2, slots: [[570, 840], [990, 1230]] },
  { day: 3, slots: [[570, 840], [990, 1230]] },
  { day: 4, slots: [[570, 840], [990, 1230]] },
  { day: 5, slots: [[570, 870]] },
]

export const HOURS_TEXT = [
  { label: 'Lunes a jueves', value: '9:30–14:00 · 16:30–20:30' },
  { label: 'Viernes', value: '9:30–14:30' },
  { label: 'Sábado y domingo', value: 'Cerrado' },
]

export const NAV = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'tratamientos', label: 'Tratamientos' },
  { id: 'equipo', label: 'El equipo' },
  { id: 'primera-visita', label: 'Primera visita' },
  { id: 'preguntas', label: 'Preguntas frecuentes' },
] as const

export const TRUST_CHIPS = [
  'Primera visita gratis',
  'Presupuesto cerrado por escrito',
  'Hasta 12 meses sin intereses',
  'Urgencias en el día',
]

export const BENEFITS = [
  { n: '01', title: 'Primera visita gratis', text: 'Revisión, radiografía digital y diagnóstico.' },
  { n: '02', title: 'Presupuesto cerrado', text: 'Siempre por escrito y antes de empezar.' },
  { n: '03', title: 'Financiación flexible', text: '3, 6 o 12 cuotas sin intereses.' },
  { n: '04', title: 'Urgencias en el día', text: 'Si necesitas atención, llámanos a primera hora.' },
]

const px = (id: number) => (w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

export type Img = { src: (w: number) => string; w: number; h: number; alt: string }

export const IMG = {
  hero: {
    // Primer plano de una sonrisa natural, recortado por las caras para que la boca quede centrada.
    src: (w: number) =>
      `https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?auto=format&fit=crop&crop=faces,center&q=72&w=${w}&h=${Math.round(w * 0.5)}`,
    w: 2400,
    h: 1200,
    alt: 'Mujer sonriendo de forma natural, en primer plano',
  },
  heroMobile: {
    src: (w: number) =>
      `https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?auto=format&fit=crop&crop=faces,center&q=72&w=${w}&h=${Math.round(w * 1.15)}`,
    w: 960,
    h: 1104,
    alt: 'Mujer sonriendo de forma natural, en primer plano',
  },
  revision: { src: px(3845810), w: 2560, h: 1707, alt: 'Paciente sonriendo junto a su dentista durante una revisión en la clínica' },
  implantes: { src: px(6502305), w: 1200, h: 800, alt: 'Maqueta de una boca con implantes dentales' },
  ortodoncia: { src: px(3845985), w: 960, h: 1440, alt: 'Mano sujetando un alineador transparente de ortodoncia invisible' },
  estetica: { src: px(5355899), w: 960, h: 640, alt: 'Dentista comparando el color de los dientes de una paciente con una guía de tonos' },
  ninos: { src: px(7800560), w: 1280, h: 853, alt: 'Dentista revisando los dientes de una niña que sonríe' },
  radiografia: { src: px(7800669), w: 960, h: 1440, alt: 'Dentistas revisando una radiografía dental en la clínica' },
  equipo: { src: px(6812467), w: 1280, h: 855, alt: 'Dentista de Cúspide atendiendo en la clínica' },
} satisfies Record<string, Img>

export const srcset = (img: Img, widths: number[]) => widths.map((w) => `${img.src(w)} ${w}w`).join(', ')

export type Treatment = {
  id: string
  n: string
  title: string
  text: string
  img: Img
  motivo: Motivo
  layout: 'feature' | 'tall' | 'wide' | 'half' | 'band'
  from: 'up' | 'left' | 'right' | 'down'
}

export const MOTIVOS = [
  'Primera visita o revisión',
  'Me duele algo',
  'Limpieza',
  'Implantes',
  'Ortodoncia invisible',
  'Estética dental',
  'Revisión para un niño',
  'Otro',
] as const
export type Motivo = (typeof MOTIVOS)[number]

export const TREATMENTS: Treatment[] = [
  { id: 'implantes', n: '01', title: 'Implantes dentales', text: 'Recupera una pieza fija que muerde y se ve como la tuya.', img: IMG.implantes, motivo: 'Implantes', layout: 'feature', from: 'up' },
  { id: 'ortodoncia', n: '02', title: 'Ortodoncia invisible', text: 'Alineadores transparentes que puedes quitarte para comer.', img: IMG.ortodoncia, motivo: 'Ortodoncia invisible', layout: 'tall', from: 'right' },
  { id: 'estetica', n: '03', title: 'Estética dental', text: 'Blanqueamiento y carillas para mejorar la apariencia de tu sonrisa.', img: IMG.estetica, motivo: 'Estética dental', layout: 'half', from: 'left' },
  { id: 'revisiones', n: '04', title: 'Revisiones y limpiezas', text: 'Cuida tu salud bucodental con revisiones periódicas y limpiezas.', img: IMG.revision, motivo: 'Limpieza', layout: 'wide', from: 'down' },
  { id: 'ninos', n: '05', title: 'Dentista para niños', text: 'Primeras visitas cortas y tranquilas, adaptadas a los más pequeños.', img: IMG.ninos, motivo: 'Revisión para un niño', layout: 'band', from: 'up' },
]

export const STEPS = [
  { n: '01', title: 'Nos cuentas qué te pasa.', text: 'Te escuchamos con calma y entendemos qué te preocupa antes de mirar nada.' },
  { n: '02', title: 'Lo ves en la pantalla.', text: 'Radiografía digital y una explicación clara, con palabras sencillas.' },
  { n: '03', title: 'Te llevas el presupuesto.', text: 'Tu propuesta de tratamiento, cerrada y por escrito, antes de empezar.' },
]

export const TEAM = [
  { name: 'Andrés Moreno', role: 'Director médico', focus: 'Implantes y cirugía oral', bio: 'Abrió Cúspide en 2014 con una idea clara: ofrecer una atención dental cercana y transparente.' },
  { name: 'Lucía Garrido', role: null, focus: 'Ortodoncia invisible y odontopediatría', bio: null },
  { name: 'Marta Vélez', role: null, focus: 'Higiene dental', bio: null },
]

export const FAQ = [
  { q: '¿La primera visita es gratis?', a: 'Sí. Incluye revisión, radiografía digital y presupuesto.' },
  { q: '¿Los tratamientos duelen?', a: 'Utilizamos anestesia local cuando está indicada. Si levantas la mano, paramos.' },
  { q: '¿Trabajáis con seguros dentales?', a: 'Trabajamos con las principales aseguradoras. Avísanos al pedir tu cita para comprobarlo.' },
  { q: '¿Atendéis urgencias?', a: 'Sí. Llámanos a primera hora y haremos lo posible por atenderte ese mismo día.' },
  { q: '¿A qué edad debe ir un niño al dentista por primera vez?', a: 'Recomendamos realizar la primera visita alrededor de los 3 años.' },
  { q: '¿Cómo funciona la financiación?', a: 'Puedes consultar las opciones de 3, 6 o 12 cuotas sin intereses. El trámite se realiza en clínica con DNI y cuenta bancaria.' },
]
