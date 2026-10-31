/* Datos del negocio: una sola fuente para toda la web. */

export const BUSINESS = {
  name: "Lienzo Peluquería",
  shortName: "Lienzo",
  slogan: "El corte que sabes peinar en casa.",
  promise: "Te asesoramos antes de cortar o teñir y te decimos el precio antes de empezar.",
  phoneDisplay: "959 80 70 18",
  phoneHref: "tel:+34959807018",
  whatsappDisplay: "+34 959 807 018",
  whatsappNumber: "34959807018",
  address: {
    street: "Calle Rico, 18",
    postalCode: "21001",
    city: "Huelva",
  },
  coords: { lat: 37.2585, lng: -6.95065 },
  foundedYear: 2016,
  rating: { value: 4.9, count: 212 },
  payments: ["Efectivo", "Tarjeta", "Bizum"],
  base: "/lienzo-peluqueria/",
} as const;

export const ADDRESS_LINE = `${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}`;

/* Mapa embebido de OpenStreetMap (permitido en la CSP de la demo) */
export const MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=-6.9566%2C37.2556%2C-6.9447%2C37.2614&layer=mapnik&marker=37.25850%2C-6.95065";

/* Búsqueda estándar de Google Maps por dirección (no es un enlace de ficha inventado).
   Con un cliente real se cambia por el enlace de su ficha de Google. */
export const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}`,
)}`;
export const GOOGLE_REVIEWS_SEARCH = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${BUSINESS.name} ${BUSINESS.address.street} ${BUSINESS.address.city}`,
)}`;

/* Horario en minutos desde medianoche, por día de la semana (0 = domingo) */
export const OPENING_HOURS: Record<number, [number, number][]> = {
  2: [
    [570, 840],
    [990, 1230],
  ],
  3: [
    [570, 840],
    [990, 1230],
  ],
  4: [
    [570, 840],
    [990, 1230],
  ],
  5: [
    [570, 840],
    [990, 1230],
  ],
  6: [[540, 840]],
};

export const HOURS_TABLE = [
  { days: "Martes a viernes", dows: [2, 3, 4, 5], hours: "9:30–14:00 · 16:30–20:30" },
  { days: "Sábado", dows: [6], hours: "9:00–14:00" },
  { days: "Domingo y lunes", dows: [0, 1], hours: "Cerrado" },
] as const;

export const NAV_LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "servicios", label: "Servicios" },
  { id: "color", label: "Color" },
  { id: "equipo", label: "Equipo" },
  { id: "opiniones", label: "Opiniones" },
  { id: "contacto", label: "Contacto" },
] as const;
