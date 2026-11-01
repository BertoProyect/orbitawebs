import { SCHEDULE } from "../data/business";

const DAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/* Hora actual en Huelva, vivas donde vivas */
function nowInMadrid(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: DAYS[get("weekday")] ?? 0, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type OpenState = { open: boolean; label: string };

export function openState(date = new Date()): OpenState {
  const { day, minutes } = nowInMadrid(date);
  const today = SCHEDULE[day] ?? [];
  const current = today.find(([a, b]) => minutes >= a && minutes < b);
  if (current) return { open: true, label: `Abierto ahora · cierra a las ${fmt(current[1])}` };
  const later = today.find(([a]) => minutes < a);
  if (later) return { open: false, label: `Cerrado ahora · abre a las ${fmt(later[0])}` };
  const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const slot = (SCHEDULE[d] ?? [])[0];
    if (slot) return { open: false, label: `Cerrado ahora · abre el ${i === 1 ? "mañana" : names[d]} a las ${fmt(slot[0])}` };
  }
  return { open: false, label: "Cerrado ahora" };
}
