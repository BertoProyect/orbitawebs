/* Datos del negocio. Un solo sitio para teléfono, horario y enlaces. */
export const BUSINESS = {
  name: "Alba Estética",
  street: "Calle Puerto, 22",
  zip: "21001",
  city: "Huelva",
  phoneDisplay: "959 80 70 18",
  phoneHref: "tel:+34959807018",
  whatsappNumber: "34959807018",
  payment: "Efectivo, tarjeta y Bizum",
  rating: 4.9,
  reviews: 212,
  since: 2014,
  mapsPlace:
    "https://www.google.com/maps/search/?api=1&query=Alba+Est%C3%A9tica+Calle+Puerto+22+21001+Huelva",
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Calle+Puerto+22%2C+21001+Huelva",
  mapsEmbed:
    "https://www.openstreetmap.org/export/embed.html?bbox=-6.9562%2C37.2543%2C-6.9442%2C37.2599&layer=mapnik&marker=37.25705%2C-6.95020",
} as const;

/* Horario: índice de día JS (0 = domingo) -> tramos [abre, cierra] en minutos */
export const SCHEDULE: Record<number, [number, number][]> = {
  0: [],
  1: [[600, 840], [990, 1230]],
  2: [[600, 840], [990, 1230]],
  3: [[600, 840], [990, 1230]],
  4: [[600, 840], [990, 1230]],
  5: [[600, 840], [990, 1230]],
  6: [[600, 840]],
};

export const HOURS_ROWS = [
  { days: "Lunes a viernes", slots: ["10:00 – 14:00", "16:30 – 20:30"] },
  { days: "Sábado", slots: ["10:00 – 14:00"] },
  { days: "Domingo", slots: [] as string[] },
];
