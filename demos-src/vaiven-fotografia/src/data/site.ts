/* Vaivén · datos de la web.
 * Todo el contenido vive aquí: textos, enlaces y fotos. La interfaz solo lo pinta.
 * Las fotos son de Pexels y sirven de muestra: se cambian por las de Irene tocando solo PHOTOS. */

export const BASE = '/vaiven-fotografia'

export const BRAND = {
  name: 'vaivén',
  legalName: 'Vaivén',
  tagline: 'Vuestra boda, tal y como fue.',
  photographer: 'Irene',
  since: 2014,
  area: ['Huelva', 'Sevilla', 'Algarve'],
  phoneDisplay: '959 80 70 18',
  phoneHref: 'tel:+34959807018',
  studio: 'Estudio en Huelva, con cita previa.',
  travel: 'Huelva y Sevilla, sin coste de desplazamiento. Otros destinos, con presupuesto a medida.',
} as const

/* Todos los botones de WhatsApp abren exactamente este enlace. */
export const WHATSAPP =
  'https://wa.me/34959807018?text=Hola%2C%20Irene.%20Quer%C3%ADa%20informaci%C3%B3n%20sobre%20un%20reportaje.'

/* Navegación: cinco capítulos. El número acompaña a cada apartado en la página. */
export const NAV = [
  { id: 'inicio', label: 'Inicio', n: '01' },
  { id: 'historias', label: 'Historias', n: '02' },
  { id: 'como-trabajo', label: 'Cómo trabajo', n: '03' },
  { id: 'inversion', label: 'Inversión', n: '04' },
  { id: 'contacto', label: 'Contacto', n: '05' },
] as const
export const CHAPTERS = NAV.length

/* ---------- Fotos ---------- */
export type Photo = { id: number; w: number; h: number; alt: string; pos?: string }

export const pexels = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`
export const srcSet = (id: number, widths: number[]) => widths.map((w) => `${pexels(id, w)} ${w}w`).join(', ')

export const PHOTOS = {
  heroDesktop: { id: 13924636, w: 5472, h: 3648, alt: 'Los novios, frente con frente, junto al mar al atardecer', pos: '50% 45%' },
  heroMobile: { id: 36725414, w: 1000, h: 1500, alt: 'Los novios en un jardín con la luz dorada del atardecer', pos: '50% 40%' },
  intro: { id: 40618548, w: 560, h: 840, alt: 'El vestido de novia colgado en un pasillo acristalado, con los zapatos debajo' },
  pauseDesktop: { id: 3352398, w: 6016, h: 4016, alt: 'Los recién casados caminan de la mano por un campo dorado', pos: '50% 55%' },
  pauseMobile: { id: 15904730, w: 4128, h: 6192, alt: 'Los recién casados caminan de la mano por un parque al amanecer' },
  irene: { id: 29162190, w: 960, h: 1200, alt: 'Una fotógrafa sonríe con su cámara en las manos' },
  weddings: { id: 36725425, w: 560, h: 840, alt: 'Los novios bailan al aire libre en un día de sol' },
  finalDesktop: { id: 5085332, w: 4853, h: 3235, alt: 'Los recién casados pasean por la playa, riéndose', pos: '50% 40%' },
  finalMobile: { id: 38788863, w: 720, h: 1080, alt: 'Los novios al anochecer, con la última luz del día' },
} satisfies Record<string, Photo>

/* Banda curva bajo la portada (diez fotos que recorren el arco). */
export const REEL = [36725414, 40618548, 36725425, 36725399, 33647901, 38788866, 40479997, 36725419, 33647864, 38788815]

/* ---------- 02 · Historias ---------- */
export type Story = { n: string; title: string; couple: string; place: string; photo: Photo }
export const GALLERY: Story[] = [
  { n: '01', title: 'Los preparativos', couple: 'Carmen y Álvaro', place: 'Moguer', photo: { id: 35538623, w: 720, h: 1080, alt: 'La novia, todavía en bata, mira su vestido en el espejo' } },
  { n: '02', title: 'Cinco minutos antes de vestirse', couple: 'Rocío y Pablo', place: 'Huelva', photo: { id: 40618553, w: 720, h: 1080, alt: 'La novia cierra los ojos mientras la maquillan' } },
  { n: '03', title: 'Antes de verse', couple: 'Ana y Sergio', place: 'Aracena', photo: { id: 40479989, w: 720, h: 1080, alt: 'Los novios se dan la mano a través de una puerta, sin verse', pos: '50% 45%' } },
  { n: '04', title: 'El sí', couple: 'Marta y Hugo', place: 'Ayamonte', photo: { id: 33647872, w: 720, h: 1080, alt: 'Los novios abrazados durante la ceremonia al aire libre' } },
  { n: '05', title: 'Recién casados', couple: 'Elena y Mario', place: 'Lepe', photo: { id: 36725423, w: 720, h: 1080, alt: 'Los novios caminan juntos al salir de la ceremonia' } },
  { n: '06', title: 'El primer baile', couple: 'Marta y Hugo', place: 'Ayamonte', photo: { id: 33647855, w: 720, h: 1080, alt: 'Los novios bailan en un callejón del casco antiguo' } },
  { n: '07', title: 'La última luz', couple: 'Paula y Andrés', place: 'El Rompido', photo: { id: 38788863, w: 720, h: 1080, alt: 'Los novios al anochecer, con la última luz del día' } },
]

/* ---------- 03 · Cómo trabajo ---------- */
export const STEPS: { n: string; title: string; text: string; photo: Photo }[] = [
  {
    n: '01',
    title: 'Nos conocemos',
    text: 'Tomamos un café en el estudio o hacemos una videollamada. Os enseño bodas completas para que conozcáis mi forma de trabajar.',
    photo: { id: 7156283, w: 4000, h: 6000, alt: 'Dos personas se dan la mano junto a dos tazas de café' },
  },
  {
    n: '02',
    title: 'Reservamos vuestra fecha',
    text: 'Cuando decidís que queréis que cuente vuestra historia, reservamos la fecha con una señal del 30 %.',
    photo: { id: 20091878, w: 4000, h: 6000, alt: 'Las manos de una pareja con sus alianzas' },
  },
  {
    n: '03',
    title: 'Hacemos la preboda',
    text: 'Un paseo de una hora, sin prisas ni poses forzadas. Está incluida y sirve para que os acostumbréis a mi cámara.',
    photo: { id: 4119959, w: 6123, h: 4082, alt: 'Una pareja de espaldas sobre las rocas de la orilla, con la luz del atardecer' },
  },
  {
    n: '04',
    title: 'Recibís vuestros recuerdos',
    text: 'En un máximo de seis semanas tendréis vuestra galería privada. Las primeras 20 fotografías llegarán al día siguiente de la boda.',
    photo: { id: 8114119, w: 4000, h: 6000, alt: 'Unas manos sostienen una fotografía impresa' },
  },
]

/* ---------- 04 · Inversión ---------- */
export const WEDDING = {
  from: '1.290 €',
  includes: [
    'Preboda de una hora.',
    'Cobertura de jornada completa hasta el primer baile.',
    'Galería privada online.',
    '500–800 fotografías editadas a mano.',
    'Fotografías en alta resolución.',
    'Sin marcas de agua.',
    'Entrega en un máximo de seis semanas.',
    '20 fotografías de adelanto al día siguiente.',
  ],
  payment: ['30 % para reservar la fecha.', 'El resto, una semana antes de la boda.'],
  optional: 'Álbum cosido a mano.',
}

export const OTHER_SERVICES = [
  { name: 'Familias', from: '150 €', text: 'Una hora en playa o campo, aprovechando la luz del atardecer.' },
  { name: 'Comuniones', from: '180 €', text: 'Iglesia, estudio o exteriores, incluyendo fotografías familiares.' },
  { name: 'Retratos', from: '120 €', text: 'Para tu web, perfil profesional o simplemente para ti.' },
]

/* ---------- Preguntas ---------- */
export const FAQ = [
  { q: '¿Cuánto cuesta un reportaje de boda?', a: 'Los reportajes de boda empiezan en 1.290 €. Incluyen la preboda, cobertura de jornada completa hasta el primer baile y una galería online privada.' },
  { q: '¿Cuántas fotografías recibiremos?', a: 'Entre 500 y 800 fotografías, editadas a mano, en alta resolución y sin marcas de agua.' },
  { q: '¿Cuándo tendremos las fotografías?', a: 'En un máximo de seis semanas. Al día siguiente de la boda recibiréis un adelanto de 20 fotografías.' },
  { q: '¿Te desplazas fuera de Huelva?', a: 'Sí. Los desplazamientos por la provincia de Huelva y Sevilla están incluidos. Para el resto de España, se detalla el desplazamiento en el presupuesto.' },
  { q: '¿Y si llueve?', a: 'Fotografiamos igualmente. La lluvia también puede formar parte de una historia preciosa. Llevo paraguas transparentes para esos momentos.' },
  { q: '¿También haces vídeo?', a: 'No realizo vídeo, pero trabajo con dos videógrafos de Huelva que puedo recomendaros.' },
  { q: '¿Con cuánta antelación debemos reservar?', a: 'Los sábados de mayo a octubre suelen reservarse con más de un año de antelación. Si tenéis una fecha en mente, lo mejor es consultarla cuanto antes.' },
  { q: '¿Podemos conocernos antes?', a: 'Por supuesto. Podemos tomar un café en mi estudio de Huelva, con cita previa, o hacer una videollamada. Os enseñaré bodas completas para que conozcáis mi trabajo.' },
]
