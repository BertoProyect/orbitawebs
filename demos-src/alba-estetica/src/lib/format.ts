const NBSP = " ";

/* 45 -> «45 €», 29.1666 -> «29,17 €» */
export function eur(n: number) {
  const rounded = Math.round(n * 100) / 100;
  const txt = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(".", ",");
  return `${txt}${NBSP}€`;
}

/* 60 -> «1 h», 75 -> «1 h 15 min», 50 -> «50 min» */
export function mins(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h}${NBSP}h ${m}${NBSP}min`;
  if (h) return `${h}${NBSP}h`;
  return `${m}${NBSP}min`;
}
