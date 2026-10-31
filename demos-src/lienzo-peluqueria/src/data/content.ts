/* Contenido editorial: equipo, opiniones, preguntas, tonos y fotos. */

export type Photo = { id: number; w: number; h: number; alt: string };

export const PHOTOS = {
  heroDesktop: {
    id: 3992875,
    w: 1920,
    h: 1280,
    alt: "Peluquera trabajando el pelo de una clienta en un salón con luz cálida",
  },
  heroMobile: {
    id: 3993447,
    w: 3830,
    h: 5745,
    alt: "Peluquera cortando el pelo mojado de una clienta con peine y tijera",
  },
  statement: {
    id: 3993308,
    w: 1200,
    h: 1582,
    alt: "Puesto del salón con sillón negro frente al espejo",
  },
  consult: {
    id: 3992863,
    w: 1920,
    h: 1280,
    alt: "Peluquera hablando con una clienta frente al espejo antes de empezar",
  },
  cutting: {
    id: 3993447,
    w: 3830,
    h: 5745,
    alt: "Peluquera cortando el pelo de una clienta con peine y tijera",
  },
  styling: {
    id: 3993465,
    w: 3601,
    h: 5401,
    alt: "Clienta sonriendo mientras le peinan en el salón",
  },
} satisfies Record<string, Photo>;

export const EXPERIENCE = [
  {
    n: "01",
    title: "Hablamos frente al espejo.",
    text: "Escuchamos lo que quieres y lo adaptamos a tu pelo y a tu día a día.",
    photo: PHOTOS.consult,
  },
  {
    n: "02",
    title: "Precio antes de empezar.",
    text: "Sin sorpresas. Te explicamos qué vamos a hacer y cuánto cuesta.",
    photo: PHOTOS.cutting,
  },
  {
    n: "03",
    title: "Te enseñamos a peinarlo.",
    text: "Queremos que el resultado también funcione cuando estés en casa.",
    photo: PHOTOS.styling,
  },
];

export const TEAM = [
  {
    name: "Rocío Toscano",
    role: "Fundadora de Lienzo",
    focus: "Especialista en color, mechas y balayage.",
    extra: "Abrió Lienzo en 2016 en el centro de Huelva.",
    photo: {
      id: 3993458,
      w: 960,
      h: 1440,
      alt: "Rocío Toscano con unas tijeras en la mano, en el salón",
    },
  },
  {
    name: "Inma Carrasco",
    role: "",
    focus: "Cortes de mujer y peinados de novia.",
    extra: "",
    photo: {
      id: 8834025,
      w: 960,
      h: 1440,
      alt: "Inma Carrasco de brazos cruzados junto al espejo del salón",
    },
  },
  {
    name: "Dani Bermejo",
    role: "",
    focus: "Barbería, degradados y cortes de niño.",
    extra: "",
    photo: { id: 3998390, w: 960, h: 1440, alt: "Dani Bermejo preparando su puesto de barbería" },
  },
];

/* Resúmenes de opiniones facilitados por el negocio. No se añaden más. */
export const TESTIMONIALS = [
  {
    name: "Lucía M.",
    service: "Balayage",
    text: "Me asesoraron antes de empezar y el resultado quedó precioso.",
  },
  {
    name: "Álvaro G.",
    service: "Corte y barba",
    text: "Reservé por WhatsApp a las once de la noche y fue comodísimo.",
  },
  {
    name: "Carmen D.",
    service: "Cortes infantiles",
    text: "Voy con mis dos hijos. Siempre nos atienden genial.",
  },
];

export const FAQ = [
  {
    q: "¿Tengo que pedir cita?",
    a: "Mejor sí, por WhatsApp o llamando. Si hay hueco sin cita, te atendemos.",
  },
  { q: "¿Cuánto dura un balayage?", a: "Entre 2 horas y media y 3 horas." },
  { q: "¿Cortáis a niños?", a: "Sí, desde los 2 años. Tenemos asiento elevador." },
  { q: "¿Cómo puedo pagar?", a: "Efectivo, tarjeta o Bizum." },
  {
    q: "¿Peináis a novias a domicilio?",
    a: "Sí, podemos desplazarnos para peinar a la novia y acompañantes.",
  },
  {
    q: "¿Y si no puedo ir?",
    a: "Avísanos por WhatsApp con unas horas de antelación y cambiamos tu cita.",
  },
];

/* Carta de colores. level = altura de tono (1 negro … 10 rubio muy claro). */
export type Shade = {
  code: string;
  name: string;
  level: number;
  root: string;
  tip: string;
  desc: string;
};

export const SHADES: Shade[] = [
  {
    code: "1",
    name: "Negro",
    level: 1,
    root: "#141211",
    tip: "#2a2422",
    desc: "Negro intenso y con brillo. Cubre las canas por completo.",
  },
  {
    code: "4",
    name: "Castaño medio",
    level: 4,
    root: "#3b281d",
    tip: "#5e4130",
    desc: "El castaño de toda la vida: cálido, natural y fácil de mantener.",
  },
  {
    code: "5.5",
    name: "Castaño claro caoba",
    level: 5,
    root: "#45191a",
    tip: "#7c2c27",
    desc: "Castaño con reflejo rojo profundo, que se nota más con la luz del sol.",
  },
  {
    code: "6.4",
    name: "Rubio oscuro cobrizo",
    level: 6,
    root: "#6e3317",
    tip: "#b35a2b",
    desc: "Cobre luminoso. Da mucha vida a las pieles claras y a los ojos verdes o miel.",
  },
  {
    code: "7.3",
    name: "Rubio dorado",
    level: 7,
    root: "#8c6239",
    tip: "#c99c63",
    desc: "Rubio miel que ilumina la cara sin aclarar demasiado.",
  },
  {
    code: "8.1",
    name: "Rubio claro ceniza",
    level: 8,
    root: "#9b8d7b",
    tip: "#cbbfac",
    desc: "Rubio frío y mate, sin reflejos amarillos ni anaranjados.",
  },
  {
    code: "10.1",
    name: "Plata",
    level: 10,
    root: "#8d9096",
    tip: "#d5d7da",
    desc: "Gris plata luminoso. Para lucir las canas con brillo o pasarte al gris sin que amarillee.",
  },
];

export const NATURAL_COLORS = [
  { id: "castano-oscuro", label: "Castaño oscuro", level: 3, hex: "#2b1d15" },
  { id: "castano-claro", label: "Castaño claro", level: 5, hex: "#5a3d29" },
  { id: "rubio-oscuro", label: "Rubio oscuro", level: 6, hex: "#7d5f3f" },
] as const;

export const GREY_LEVELS = [
  { id: "ninguna", label: "Ninguna", amount: 0 },
  { id: "algunas", label: "Algunas", amount: 0.16 },
  { id: "muchas", label: "Muchas", amount: 0.45 },
] as const;
