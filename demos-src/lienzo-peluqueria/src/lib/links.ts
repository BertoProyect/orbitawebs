import { BUSINESS } from "../data/business";
import type { Photo } from "../data/content";

/* Enlace de WhatsApp con el mensaje codificado */
export function waLink(message?: string) {
  const base = `https://wa.me/${BUSINESS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const WA_GENERIC = waLink("Hola, quiero pedir cita en Lienzo Peluquería.");

/* Fotos de Pexels en varios tamaños */
export const pexels = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export function srcSet(photo: Photo, widths: number[]) {
  return widths.map((w) => `${pexels(photo.id, w)} ${w}w`).join(", ");
}

/* Desplazamiento suave a una sección, respetando «reducir movimiento» */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
