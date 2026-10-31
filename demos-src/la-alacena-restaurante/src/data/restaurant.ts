/* Todos los datos del negocio en un solo sitio. Para adaptar la demo a un restaurante real,
 * se cambia este archivo (y las fotos de PHOTOS) sin tocar los componentes. */

export const BASE = '/la-alacena-restaurante'

export const RESTAURANT = {
  name: 'La Alacena',
  slogan: 'Del mercado de esta mañana a tu mesa.',
  street: 'Calle Concepción, 17',
  postal: '21001',
  city: 'Huelva',
  phoneDisplay: '959 80 70 18',
  phoneHref: 'tel:+34959807018',
  whatsapp: '34959807018',
  whatsappDisplay: '+34 959 807 018',
  rating: '4,8',
  reviews: '386',
  payments: 'Efectivo, tarjeta o Bizum',
  founded: 2011,
  geo: { lat: 37.25745, lng: -6.9515 },
  mapEmbed:
    'https://www.openstreetmap.org/export/embed.html?bbox=-6.9575%2C37.2546%2C-6.9455%2C37.2603&layer=mapnik&marker=37.25745%2C-6.95150',
  directions:
    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Calle Concepción 17, 21001 Huelva'),
} as const

/* Horario. Día 0 = domingo, como Date.getDay(). Cada tramo en minutos desde medianoche. */
export type Slot = [number, number]
const m = (h: number, min = 0) => h * 60 + min
const LUNCH: Slot = [m(13), m(16, 30)]
const DINNER: Slot = [m(20), m(23, 30)]
export const HOURS: { day: number; label: string; slots: Slot[] }[] = [
  { day: 2, label: 'Martes', slots: [LUNCH, DINNER] },
  { day: 3, label: 'Miércoles', slots: [LUNCH, DINNER] },
  { day: 4, label: 'Jueves', slots: [LUNCH, DINNER] },
  { day: 5, label: 'Viernes', slots: [LUNCH, DINNER] },
  { day: 6, label: 'Sábado', slots: [LUNCH, DINNER] },
  { day: 0, label: 'Domingo', slots: [LUNCH] },
  { day: 1, label: 'Lunes', slots: [] },
]

/* ---------- Fotos ----------
 * Las de Pexels que ya usaba la demo. Para cambiarlas por fotos reales del restaurante basta con
 * poner aquí la URL (o una ruta local) y el texto alternativo. `null` = sin foto: el plato se
 * presenta como composición tipográfica hasta que haya una foto buena. */
export type Photo = { id: number; alt: string; w: number; h: number }
export const pexels = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`
export const srcSet = (id: number, widths: number[]) => widths.map((w) => `${pexels(id, w)} ${w}w`).join(', ')

export const PHOTOS = {
  heroDesktop: { id: 16715741, alt: '', w: 1920, h: 1280 },
  heroMobile: { id: 16715740, alt: '', w: 1280, h: 1920 },
  market: { id: 21287049, alt: 'Puesto de fruta y verdura en un mercado de abastos, con gente comprando', w: 5869, h: 3913 },
  table: { id: 21327968, alt: 'Amigos comiendo tapas alrededor de una mesa de restaurante', w: 2667, h: 4000 },
  cupboard: { id: 36877722, alt: 'Rincón del comedor con azulejos y botellas de vino en las estanterías', w: 4160, h: 6240 },
  croquetas: { id: 21327952, alt: 'Croquetas caseras en un plato, con vino y una caña en la mesa', w: 2667, h: 4000 },
  presa: { id: 31097311, alt: 'Carne de cerdo dorándose en la parrilla', w: 5184, h: 3456 },
  postre: { id: 33614670, alt: 'Postre de huevo con caramelo en un plato de barro', w: 3194, h: 4791 },
  potaje: { id: 35646479, alt: 'Cuenco de legumbres estofadas con pimiento rojo', w: 4457, h: 6218 },
  salmorejo: { id: 12675815, alt: 'Salmorejo en un cuenco de barro con huevo duro y taquitos de jamón', w: 4000, h: 6000 },
  pescado: { id: 28843593, alt: 'Pescado a la brasa con rodajas de limón', w: 3930, h: 5342 },
  groups: { id: 21327968, alt: 'Grupo de amigos compartiendo una mesa larga llena de platos', w: 2667, h: 4000 },
} satisfies Record<string, Photo>

/* ---------- Alérgenos (los 14 de declaración obligatoria) ---------- */
export const ALLERGENS = [
  { key: 'gluten', label: 'Gluten' },
  { key: 'crustaceos', label: 'Crustáceos' },
  { key: 'huevo', label: 'Huevo' },
  { key: 'pescado', label: 'Pescado' },
  { key: 'cacahuetes', label: 'Cacahuetes' },
  { key: 'soja', label: 'Soja' },
  { key: 'lacteos', label: 'Lácteos' },
  { key: 'frutos', label: 'Frutos de cáscara' },
  { key: 'apio', label: 'Apio' },
  { key: 'mostaza', label: 'Mostaza' },
  { key: 'sesamo', label: 'Sésamo' },
  { key: 'sulfitos', label: 'Sulfitos' },
  { key: 'altramuces', label: 'Altramuces' },
  { key: 'moluscos', label: 'Moluscos' },
] as const
export type AllergenKey = (typeof ALLERGENS)[number]['key']
export const allergenLabel = (k: AllergenKey) => ALLERGENS.find((a) => a.key === k)!.label

/* `status`: 'confirmed' = el restaurante ha verificado los alérgenos del plato; 'pending' = falta
 * verificarlos. Un plato 'pending' nunca se presenta como apto: el filtro lo marca para consultar.
 * En esta demo los datos son de ejemplo; con un cliente real se sustituyen por su ficha. */
export type Dish = {
  name: string
  price: string
  note?: string
  allergens: AllergenKey[]
  status: 'confirmed' | 'pending'
}
export type Category = { id: string; title: string; note?: string; dishes: Dish[] }

const c = (name: string, price: string, allergens: AllergenKey[], note?: string): Dish => ({
  name,
  price,
  note,
  allergens,
  status: 'confirmed',
})

export const MENU: Category[] = [
  {
    id: 'picar',
    title: 'Para picar',
    dishes: [
      c('Croquetas de puchero', '9,50 €', ['gluten', 'huevo', 'lacteos', 'apio'], 'Seis unidades, con la carne del cocido.'),
      c('Jamón ibérico de bellota', '22 €', [], 'Cortado a cuchillo en el momento.'),
      c('Gambas blancas a la plancha', '19 €', ['crustaceos'], 'Con sal gorda y unas gotas de limón.'),
      c('Ensaladilla de la casa', '7,50 €', ['huevo', 'pescado'], 'Con melva y mayonesa hecha aquí.'),
      c('Queso de cabra curado', '11 €', ['gluten', 'lacteos'], 'Con picos de pan.'),
    ],
  },
  {
    id: 'huerta',
    title: 'De la huerta',
    dishes: [
      c('Salmorejo', '7 €', ['gluten', 'huevo'], 'Con huevo duro y taquitos de jamón.'),
      c('Alcachofas confitadas', '13 €', [], 'Terminadas a la plancha, con lascas de jamón.'),
      c('Tomate rosa con ventresca', '12 €', ['pescado']),
      c('Revuelto de setas', '12,50 €', ['huevo'], 'Con las setas que haya en el mercado.'),
      c('Ensalada de naranja y bacalao', '10,50 €', ['pescado']),
    ],
  },
  {
    id: 'mercado',
    title: 'Del mercado',
    note: 'El arroz marinero se sirve a partir de dos personas.',
    dishes: [
      c('Pescado del día a la brasa', 'Según mercado', ['pescado'], 'Pregúntanos qué ha llegado hoy de la lonja.'),
      c('Chocos fritos', '14 €', ['moluscos']),
      c('Atún rojo de almadraba', '21 €', ['pescado', 'sesamo', 'soja']),
      c('Arroz marinero', '18 € por persona', ['crustaceos', 'moluscos', 'pescado', 'apio'], 'Mínimo dos personas.'),
      c('Almejas a la marinera', '16 €', ['moluscos', 'gluten', 'sulfitos']),
    ],
  },
  {
    id: 'carnes',
    title: 'Carnes',
    dishes: [
      c('Presa ibérica a la brasa', '19 €', []),
      c('Carrillada al vino tinto', '16,50 €', ['sulfitos', 'lacteos', 'apio']),
      c('Lagarto ibérico', '17 €', []),
      c('Albóndigas de la abuela', '12 €', ['gluten', 'huevo', 'frutos']),
    ],
  },
  {
    id: 'postres',
    title: 'Postres',
    dishes: [
      c('Tocino de cielo', '5,50 €', ['huevo']),
      c('Tarta de queso al horno', '6 €', ['lacteos', 'huevo', 'gluten']),
      c('Arroz con leche', '5 €', ['lacteos']),
      c('Fruta de temporada', '4 €', []),
    ],
  },
]

/* ---------- Platos destacados (sección «De nuestra cocina») ---------- */
export const SIGNATURE: { name: string; price: string; photo: Photo | null }[] = [
  { name: 'Croquetas de puchero', price: '9,50 €', photo: PHOTOS.croquetas },
  { name: 'Gambas blancas a la plancha', price: '19 €', photo: null },
  { name: 'Presa ibérica a la brasa', price: '19 €', photo: PHOTOS.presa },
  { name: 'Chocos fritos', price: '14 €', photo: null },
  { name: 'Atún rojo de almadraba', price: '21 €', photo: null },
  { name: 'Tocino de cielo', price: '5,50 €', photo: PHOTOS.postre },
]

/* ---------- Menú del día ---------- */
export const DAILY = {
  price: 14.5,
  priceLabel: '14,50 €',
  when: 'De martes a viernes · De 13:00 a 16:00',
  includes: 'Con pan, bebida y postre o café.',
  courses: [
    { title: 'Primeros', items: ['Potaje de garbanzos con espinacas', 'Ensalada de tomate y melva', 'Arroz caldoso de verduras'] },
    { title: 'Segundos', items: ['Choco a la plancha con alioli', 'Pollo de corral al ajillo', 'Pescado del día con patatas a lo pobre'] },
    { title: 'Postre', items: ['Flan de huevo casero', 'Fruta de temporada'] },
  ],
  notice: 'Si un plato se acaba, lo borramos de la pizarra. Si tienes alguno en mente, reserva para las 14:00.',
}

/* ---------- Vino ---------- */
export const PAIRING = {
  dish: 'Gambas blancas a la plancha',
  wineKey: 'manzanilla', // clave que entiende la copa 3D (copa.js)
  wine: 'Manzanilla',
  origin: 'D.O. Manzanilla-Sanlúcar de Barrameda',
  glass: '2,80 €',
  bottle: '16 €',
}

/* ---------- Menús de grupo ---------- */
export const GROUP_MENUS = [
  {
    name: 'Menú Alacena',
    price: '28 €',
    share: ['Croquetas de puchero', 'Ensaladilla', 'Tomate con ventresca'],
    mainLabel: 'Principal a elegir',
    main: ['Presa ibérica', 'Pescado del día'],
    includes: ['Postre casero', 'Una bebida', 'Agua', 'Pan'],
  },
  {
    name: 'Menú Mercado',
    price: '38 €',
    share: ['Jamón ibérico', 'Gambas blancas', 'Alcachofas con jamón'],
    mainLabel: 'Principal',
    main: ['Arroz marinero', 'Presa ibérica'],
    includes: ['Postre casero', 'Café', 'Vino blanco o tinto del Condado', 'Agua', 'Pan'],
  },
]

/* Resúmenes de opiniones facilitados por el restaurante: no son citas literales de Google. */
export const REVIEWS = [
  { name: 'Marta R.', text: 'Una comida de mercado estupenda. El menú del día y el choco estaban buenísimos.' },
  { name: 'Javier L.', text: 'Fuimos con mi madre, que es celíaca. Nos atendieron con mucha atención y pudimos consultar las opciones.' },
  { name: 'Elena P.', text: 'Organizamos una comida de empresa para 13 personas y todo salió fenomenal.' },
]

export const FAQ = [
  { q: '¿Hace falta reservar?', a: 'Especialmente los viernes por la noche y los fines de semana, recomendamos reservar.' },
  {
    q: '¿Tenéis opciones sin gluten?',
    a: 'Disponemos de un filtro de alérgenos en nuestra carta. Consulta siempre con nuestro equipo para confirmar cada plato y evitar riesgos de contaminación cruzada.',
  },
  { q: '¿Tenéis menú para niños?', a: 'Sí. Filete de pollo o croquetas con patatas, bebida y helado por 9 €. También disponemos de tronas.' },
  { q: '¿Puedo ir con mi perro?', a: 'Sí, en la terraza. Tenemos un cuenco de agua para él.' },
  { q: '¿Hay aparcamiento?', a: 'Hay un aparcamiento público a unos 3 minutos andando.' },
  { q: '¿Qué métodos de pago aceptáis?', a: 'Efectivo, tarjeta o Bizum.' },
]

export const NAV = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'historia', label: 'Nuestra historia' },
  { id: 'carta', label: 'Menú' },
  { id: 'grupos', label: 'Grupos' },
  { id: 'contacto', label: 'Contacto' },
]
