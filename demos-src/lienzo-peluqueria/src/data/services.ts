/* Carta completa. Precios con IVA incluido. */

export type Service = {
  id: string;
  name: string;
  minutes: number | null;
  duration: string;
  price: number;
  from?: boolean;
  note?: string;
};

export type Category = {
  id: "cortes" | "color" | "peinados" | "tratamientos" | "barberia";
  label: string;
  intro: string;
  image: { id: number; w: number; h: number; alt: string };
  services: Service[];
};

export const CATEGORIES: Category[] = [
  {
    id: "cortes",
    label: "Cortes",
    intro: "Cortamos pensando en cómo te vas a peinar tú cada mañana.",
    image: {
      id: 3993447,
      w: 3830,
      h: 5745,
      alt: "Peluquera cortando el pelo mojado de una clienta con peine y tijera",
    },
    services: [
      {
        id: "corte-mujer",
        name: "Corte mujer",
        minutes: 45,
        duration: "45 min",
        price: 22,
        note: "Incluye lavar, cortar y peinar.",
      },
      {
        id: "corte-hombre",
        name: "Corte hombre",
        minutes: 30,
        duration: "30 min",
        price: 13,
        note: "Incluye lavado y peinado.",
      },
      {
        id: "corte-infantil",
        name: "Corte infantil",
        minutes: 20,
        duration: "20 min",
        price: 10,
        note: "Hasta 12 años.",
      },
      { id: "flequillo", name: "Arreglo de flequillo", minutes: 10, duration: "10 min", price: 5 },
    ],
  },
  {
    id: "color",
    label: "Color",
    intro: "Primero miramos tu pelo y su historia. Después elegimos tono y técnica.",
    image: {
      id: 3993326,
      w: 3975,
      h: 5962,
      alt: "Peluquera aplicando color en el pelo de una clienta",
    },
    services: [
      { id: "tinte-raiz", name: "Tinte de raíz", minutes: 60, duration: "1 h", price: 28 },
      {
        id: "tinte-completo",
        name: "Tinte completo",
        minutes: 90,
        duration: "1 h 30 min",
        price: 38,
        from: true,
      },
      {
        id: "mechas",
        name: "Mechas",
        minutes: 120,
        duration: "2 h",
        price: 45,
        from: true,
        note: "Papel de plata o gorro.",
      },
      {
        id: "balayage",
        name: "Balayage",
        minutes: 150,
        duration: "2 h 30 min",
        price: 75,
        from: true,
      },
      { id: "bano-color", name: "Baño de color", minutes: 30, duration: "30 min", price: 18 },
      {
        id: "diagnostico",
        name: "Diagnóstico de color",
        minutes: 15,
        duration: "15 min",
        price: 0,
      },
    ],
  },
  {
    id: "peinados",
    label: "Peinados",
    intro: "Del secado de diario al recogido que tiene que durar toda la boda.",
    image: {
      id: 3993465,
      w: 3601,
      h: 5401,
      alt: "Clienta sonriendo mientras le peinan en el salón",
    },
    services: [
      {
        id: "lavar-secar",
        name: "Lavar y secar",
        minutes: 30,
        duration: "30 min",
        price: 15,
        from: true,
      },
      { id: "ondas", name: "Ondas", minutes: 40, duration: "40 min", price: 20 },
      {
        id: "recogido",
        name: "Recogido",
        minutes: 60,
        duration: "1 h",
        price: 35,
        from: true,
        note: "Bodas, comuniones y eventos.",
      },
      {
        id: "novias",
        name: "Novias",
        minutes: null,
        duration: "2 citas",
        price: 120,
        from: true,
        note: "Prueba y día de la boda.",
      },
    ],
  },
  {
    id: "tratamientos",
    label: "Tratamientos",
    intro: "Para el pelo seco, castigado o con frizz. Sin vender lo que no necesitas.",
    image: {
      id: 3993449,
      w: 3811,
      h: 5716,
      alt: "Peluquera lavando el pelo a una clienta en el lavacabezas",
    },
    services: [
      {
        id: "hidratacion",
        name: "Hidratación profunda",
        minutes: 30,
        duration: "30 min",
        price: 20,
      },
      { id: "reconstruccion", name: "Reconstrucción", minutes: 45, duration: "45 min", price: 30 },
      {
        id: "keratina",
        name: "Alisado de keratina",
        minutes: 150,
        duration: "2 h 30 min",
        price: 90,
        from: true,
      },
      { id: "masaje", name: "Masaje capilar", minutes: 15, duration: "15 min", price: 10 },
    ],
  },
  {
    id: "barberia",
    label: "Barbería",
    intro: "Degradados, barba y afeitado clásico, con el tiempo que pide cada uno.",
    image: {
      id: 3998399,
      w: 4000,
      h: 6000,
      alt: "Barbero cortando el pelo a un cliente frente al espejo",
    },
    services: [
      { id: "degradado", name: "Corte con degradado", minutes: 40, duration: "40 min", price: 16 },
      { id: "corte-barba", name: "Corte y barba", minutes: 45, duration: "45 min", price: 20 },
      { id: "arreglo-barba", name: "Arreglo de barba", minutes: 20, duration: "20 min", price: 9 },
      {
        id: "afeitado",
        name: "Afeitado clásico",
        minutes: 30,
        duration: "30 min",
        price: 14,
        note: "Toalla caliente y navaja.",
      },
    ],
  },
];

export const ALL_SERVICES: (Service & { category: string })[] = CATEGORIES.flatMap((c) =>
  c.services.map((s) => ({ ...s, category: c.label })),
);

export const ADVICE_OPTION: Service & { category: string } = {
  id: "consejo",
  name: "Aún no lo sé, quiero que me aconsejéis",
  minutes: null,
  duration: "Lo vemos juntos",
  price: -1,
  category: "Otros",
};

export function findService(idOrName: string) {
  return (
    ALL_SERVICES.find((s) => s.id === idOrName || s.name === idOrName) ??
    (idOrName === ADVICE_OPTION.id ? ADVICE_OPTION : undefined)
  );
}

export function priceLabel(s: Pick<Service, "price" | "from">) {
  if (s.price < 0) return "Te lo decimos antes de empezar";
  if (s.price === 0) return "Gratis";
  return `${s.from ? "Desde " : ""}${s.price} €`;
}

export const PRICE_NOTE =
  "Precios con IVA incluido. En pelo largo o muy abundante, te confirmamos el precio final antes de empezar.";
