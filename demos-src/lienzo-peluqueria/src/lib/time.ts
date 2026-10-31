import { OPENING_HOURS } from "../data/business";

export const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
export const SLOT = 30;

export type MadridNow = { y: number; m: number; d: number; dow: number; mins: number };

/* Hora local de Huelva (Europe/Madrid), sea cual sea la zona del visitante. */
export function madridNow(date: Date = new Date()): MadridNow {
  const o: Record<string, string> = {};
  try {
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .forEach((p) => (o[p.type] = p.value));
  } catch {
    o.year = String(date.getFullYear());
    o.month = String(date.getMonth() + 1);
    o.day = String(date.getDate());
    o.hour = String(date.getHours());
    o.minute = String(date.getMinutes());
  }
  const y = +o.year;
  const m = +o.month;
  const d = +o.day;
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, dow, mins: (+o.hour % 24) * 60 + +o.minute };
}

export const clock = (mins: number) =>
  `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;

export type OpenStatus = { open: boolean; label: string; detail: string };

/* Estado de apertura con el horario real del salón. */
export function openStatus(now: MadridNow = madridNow()): OpenStatus {
  const today = OPENING_HOURS[now.dow] ?? [];
  const current = today.find(([a, b]) => now.mins >= a && now.mins < b);
  if (current) {
    const left = current[1] - now.mins;
    return {
      open: true,
      label: "Abierto ahora",
      detail: left <= 30 ? `Cerramos en ${left} min` : `Hasta las ${clock(current[1])}`,
    };
  }
  const laterToday = today.find(([a]) => a > now.mins);
  if (laterToday)
    return {
      open: false,
      label: "Cerrado ahora",
      detail: `Abrimos hoy a las ${clock(laterToday[0])}`,
    };
  for (let k = 1; k <= 7; k++) {
    const dow = (now.dow + k) % 7;
    const ranges = OPENING_HOURS[dow];
    if (ranges?.length) {
      const when = k === 1 ? "mañana" : `el ${DAYS[dow]}`;
      return {
        open: false,
        label: "Cerrado ahora",
        detail: `Abrimos ${when} a las ${clock(ranges[0][0])}`,
      };
    }
  }
  return { open: false, label: "Cerrado ahora", detail: "" };
}

/* Fechas en formato del input date (AAAA-MM-DD), calculadas en hora de Madrid */
export const isoDate = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function addDaysIso(now: MadridNow, k: number) {
  const t = new Date(Date.UTC(now.y, now.m - 1, now.d + k));
  return isoDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function parseIso(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = +m[1],
    mo = +m[2],
    d = +m[3];
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
  return { y, m: mo, d, dow: t.getUTCDay() };
}

export function longDate(iso: string) {
  const p = parseIso(iso);
  if (!p) return "";
  return `${DAYS[p.dow]} ${p.d} de ${MONTHS[p.m - 1]}`;
}

/* Horas de inicio posibles de un día, cada media hora, dejando la última media hora libre.
   Si es hoy, solo a partir de dentro de media hora. */
export function slotsFor(iso: string, now: MadridNow = madridNow()) {
  const p = parseIso(iso);
  if (!p) return { morning: [] as number[], afternoon: [] as number[] };
  const isToday = iso === isoDate(now.y, now.m, now.d);
  const from = isToday ? now.mins + SLOT : 0;
  const morning: number[] = [];
  const afternoon: number[] = [];
  for (const [a, b] of OPENING_HOURS[p.dow] ?? []) {
    for (let t = a; t <= b - SLOT; t += SLOT) {
      if (t < from) continue;
      (t < 15 * 60 ? morning : afternoon).push(t);
    }
  }
  return { morning, afternoon };
}

export type DateCheck = { ok: true } | { ok: false; message: string };

export function checkDate(iso: string, now: MadridNow = madridNow()): DateCheck {
  if (!iso) return { ok: false, message: "Elige el día que te viene bien." };
  const p = parseIso(iso);
  if (!p) return { ok: false, message: "Esa fecha no es válida. Elígela en el calendario." };
  const today = isoDate(now.y, now.m, now.d);
  if (iso < today)
    return { ok: false, message: "Esa fecha ya ha pasado. Elige un día a partir de hoy." };
  if (iso > addDaysIso(now, 90))
    return {
      ok: false,
      message: "Reservamos con hasta tres meses de antelación. Elige una fecha más cercana.",
    };
  if (!OPENING_HOURS[p.dow])
    return { ok: false, message: "Los domingos y lunes cerramos. Elige de martes a sábado." };
  const s = slotsFor(iso, now);
  if (!s.morning.length && !s.afternoon.length)
    return { ok: false, message: "Hoy ya no quedan horas. Elige otro día." };
  return { ok: true };
}
