/* Contenido editorial: fotos, equipo, opiniones, preguntas, mapa del rostro y test. */

export type Photo = { id: number; w: number; h: number; alt: string };

export const PHOTOS = {
  hero: {
    id: 3985332,
    w: 6000,
    h: 4000,
    alt: "Esteticista aplicando un tratamiento facial a una clienta relajada en una cabina luminosa",
  },
  about: {
    id: 4586740,
    w: 6240,
    h: 4160,
    alt: "Esteticista revisando la piel de una clienta sentada en la cabina",
  },
  faciales: {
    id: 4586718,
    w: 4160,
    h: 6240,
    alt: "Esteticista aplicando una mascarilla facial a una clienta tumbada en la camilla",
  },
  corporales: {
    id: 4599377,
    w: 2667,
    h: 4000,
    alt: "Masajista dando un masaje a una clienta tumbada en la camilla",
  },
  cejas: {
    id: 5128222,
    w: 3475,
    h: 5213,
    alt: "Esteticista trabajando las pestañas de una clienta con los ojos cerrados",
  },
  manos: {
    id: 6135681,
    w: 6000,
    h: 4000,
    alt: "Manicurista limando las uñas de una clienta en el salón",
  },
  laser: {
    id: 29021128,
    w: 2818,
    h: 4185,
    alt: "Esteticista haciendo una sesión de depilación láser en la cabina",
  },
  camilla: {
    id: 17891757,
    w: 4000,
    h: 5872,
    alt: "Esteticista preparando la camilla de la cabina antes de un tratamiento",
  },
  cabina: {
    id: 6899553,
    w: 3198,
    h: 4542,
    alt: "Cabina de Alba Estética con camilla, peonías y estanterías con productos",
  },
} satisfies Record<string, Photo>;

/* ---------- Franja de confianza ---------- */
export const TRUST = [
  { icon: "scan", title: "Diagnóstico de piel gratis", text: "En tu primera visita, con lupa y luz de Wood." },
  { icon: "heart", title: "Siempre la misma esteticista", text: "Quien te conoce es quien te cuida." },
  { icon: "zap", title: "Láser de diodo", text: "Con seguimiento personalizado." },
  { icon: "gift", title: "Tarjetas regalo", text: "Para cualquier tratamiento o importe." },
] as const;

/* ---------- Quiénes somos ---------- */
export const ABOUT_POINTS = [
  "Atención personalizada",
  "Diagnóstico profesional",
  "Seguimiento de tu piel",
  "La misma profesional en cada visita",
  "Resultados naturales",
];

/* ---------- Mapa del rostro ---------- */
export type Hotspot = {
  id: string;
  label: string;
  /** posición dentro del dibujo (viewBox 400 × 500) */
  x: number;
  y: number;
  treatment: string;
  line: string;
  note?: string;
};

export const HOTSPOTS: Hotspot[] = [
  {
    id: "frente",
    label: "Frente y entrecejo",
    x: 200,
    y: 118,
    treatment: "rf-facial",
    line: "Un cuidado pensado para la firmeza de la piel de la frente y el entrecejo.",
  },
  {
    id: "cejas",
    label: "Cejas",
    x: 250,
    y: 168,
    treatment: "laminado-cejas",
    line: "Cejas peinadas y definidas, con un aspecto más lleno y natural.",
  },
  {
    id: "pestanas",
    label: "Pestañas",
    x: 150,
    y: 210,
    treatment: "lifting-pestanas",
    line: "Pestañas curvadas desde la raíz para una mirada más abierta.",
  },
  {
    id: "ojeras",
    label: "Ojeras y bolsas",
    x: 250,
    y: 236,
    treatment: "contorno-ojos",
    line: "Un cuidado específico para la delicada piel que rodea los ojos.",
  },
  {
    id: "manchas",
    label: "Manchas",
    x: 126,
    y: 284,
    treatment: "peeling",
    line: "Para cuidar el tono irregular. Antes lo valoramos contigo en cabina.",
  },
  {
    id: "poros",
    label: "Poros",
    x: 200,
    y: 262,
    treatment: "higiene",
    line: "Una limpieza profunda para sentir la piel más limpia y despejada.",
  },
  {
    id: "vello",
    label: "Vello",
    x: 200,
    y: 314,
    treatment: "laser-labio",
    line: "Láser de diodo con seguimiento. El precio que ves es por sesión.",
    note: "Puedes sumar otras zonas y calcular tu bono más abajo.",
  },
  {
    id: "flacidez",
    label: "Flacidez",
    x: 258,
    y: 398,
    treatment: "reafirmante",
    line: "Masaje y aparatología para mimar la firmeza del contorno del rostro.",
  },
  {
    id: "apagada",
    label: "Piel apagada",
    x: 280,
    y: 296,
    treatment: "facial-alba",
    line: "Hidratación y masaje para devolverle luz a una piel cansada.",
  },
];

/* ---------- Test de piel ---------- */
export const QUIZ = [
  {
    id: "tarde",
    title: "¿Cómo notas tu piel a media tarde?",
    options: [
      { id: "seca", label: "Tirante o seca" },
      { id: "brillo-todo", label: "Brillante en casi todo el rostro" },
      { id: "brillo-t", label: "Brillante en frente, nariz y barbilla" },
      { id: "apagada", label: "Cómoda, pero algo apagada" },
      { id: "no-claro", label: "No lo tengo claro" },
    ],
  },
  {
    id: "mejorar",
    title: "¿Qué te gustaría mejorar?",
    options: [
      { id: "hidratacion", label: "Hidratación" },
      { id: "manchas", label: "Manchas y tono irregular" },
      { id: "poros", label: "Poros y limpieza" },
      { id: "firmeza", label: "Firmeza" },
      { id: "luminosidad", label: "Luminosidad" },
      { id: "calmar", label: "Calmar y cuidar mi piel" },
    ],
  },
  {
    id: "tiempo",
    title: "¿Cuánto tiempo tienes?",
    options: [
      { id: "30", label: "30 minutos" },
      { id: "45-60", label: "45-60 minutos" },
      { id: "mas", label: "Más de una hora" },
      { id: "asesoren", label: "Prefiero que me asesoren" },
    ],
  },
] as const;

/* ---------- La experiencia ---------- */
export const STAGES = [
  {
    kicker: "Tu espacio",
    title: "Una cabina solo para ti.",
    body: "Cabinas individuales con luz regulable, para que elijas cómo quieres sentirte mientras te cuidamos.",
    points: ["Cabinas individuales", "Iluminación regulable"],
    photo: PHOTOS.cabina,
  },
  {
    kicker: "Tu tratamiento",
    title: "Sabrás qué te hacemos, y por qué.",
    body: "Te explicamos cada paso mientras lo hacemos. Y guardamos tu historial para que cada visita continúe donde acabó la anterior.",
    points: ["Cada paso explicado", "Historial personalizado"],
    photo: PHOTOS.about,
  },
  {
    kicker: "Tu seguimiento",
    title: "Cuidarte no acaba al salir.",
    body: "Te llevas por escrito las recomendaciones para casa. Y quien te atiende hoy es quien te atenderá la próxima vez.",
    points: ["Recomendaciones por escrito", "La misma profesional siempre"],
    photo: PHOTOS.camilla,
  },
] as const;

/* ---------- Equipo ---------- */
export const TEAM = [
  {
    name: "Alba Romero",
    initial: "A",
    role: "Faciales y aparatología",
    bio: "Abrió Alba Estética en 2014, después de diez años de experiencia en cabina. Es la encargada de realizar los diagnósticos de piel y acompañarte en el cuidado de tu rostro.",
  },
  {
    name: "Lucía Márquez",
    initial: "L",
    role: "Láser y tratamientos corporales",
    bio: "Especialista en tratamientos de láser y cuidado corporal, con atención personalizada en cada sesión.",
  },
  {
    name: "Inma Vázquez",
    initial: "I",
    role: "Manos, pies, cejas y pestañas",
    bio: "Cuida cada detalle para que disfrutes de un resultado cuidado y natural.",
  },
] as const;

/* ---------- Opiniones: solo nombre y servicio hasta tener reseñas verificadas ---------- */
export const TESTIMONIALS = [
  { name: "Rocío M.", service: "Peeling", note: "Clienta de Alba Estética." },
  { name: "Laura S.", service: "Higiene facial", note: "Nos encontró a través del test de la web." },
  { name: "Paula G.", service: "Láser", note: "Clienta de Alba Estética." },
  { name: "Carmen L.", service: "Facial reafirmante", note: "Clienta de Alba Estética." },
  { name: "Marta P.", service: "Lifting de pestañas", note: "Clienta de Alba Estética." },
] as const;

/* ---------- Preguntas frecuentes ---------- */
export const FAQ = [
  {
    q: "¿Es mi primera visita?",
    a: "Te ofrecemos un diagnóstico de piel gratuito con lupa y luz de Wood. Si decides realizarte un tratamiento ese día, solo pagas el tratamiento.",
  },
  {
    q: "¿Duele el láser?",
    a: "Se puede notar una pequeña sensación de calor. El equipo enfría la piel en cada disparo.",
  },
  {
    q: "¿Puedo hacerme el láser en verano?",
    a: "Sí, salvo en zonas que vayan a estar expuestas al sol. Consúltanos antes de la sesión.",
  },
  {
    q: "¿Cómo puedo cancelar mi cita?",
    a: "Te pedimos que nos avises con 24 horas de antelación por WhatsApp.",
  },
  {
    q: "¿Tenéis tarjetas regalo?",
    a: "Sí. Puedes elegir cualquier tratamiento o importe. Se solicitan por WhatsApp y se recogen en el centro.",
  },
  {
    q: "¿Qué formas de pago aceptáis?",
    a: "Efectivo, tarjeta o Bizum. Los bonos de láser se pueden pagar en dos pagos.",
  },
] as const;
