import { eur, mins } from "./format";
import { getTreatment } from "../data/treatments";

export type Answers = { tarde: string; mejorar: string; tiempo: string };

const SKIN_NOTE: Record<string, string> = {
  seca: "Cuando la piel se nota tirante, suele agradecer hidratación y confort.",
  "brillo-todo": "Si brilla en casi todo el rostro, una buena limpieza suele ser un buen punto de partida.",
  "brillo-t": "Con brillo en frente, nariz y barbilla, conviene cuidar la zona T con una limpieza a medida.",
  apagada: "Cuando la piel está cómoda pero se ve apagada, suele ayudar un empujón de luminosidad.",
  "no-claro": "Si no lo tienes claro, es muy normal: para eso está el diagnóstico gratuito en cabina.",
};

const GOAL: Record<string, { short: string; main: string; label: string }> = {
  hidratacion: { short: "vitamina-c", main: "facial-alba", label: "hidratar tu piel" },
  manchas: { short: "peeling", main: "peeling", label: "cuidar manchas y tono irregular" },
  poros: { short: "higiene-express", main: "higiene", label: "limpiar los poros" },
  firmeza: { short: "rf-facial", main: "reafirmante", label: "cuidar la firmeza" },
  luminosidad: { short: "vitamina-c", main: "facial-alba", label: "darle luminosidad" },
  calmar: { short: "calmante", main: "calmante", label: "calmar y cuidar tu piel" },
};

export type Recommendation = {
  ids: string[];
  intro: string;
  /** frase sobre el tiempo, si hay algo que aclarar */
  timeNote?: string;
};

export function recommend(a: Answers): Recommendation {
  const g = GOAL[a.mejorar] ?? GOAL.hidratacion;
  const short = a.tiempo === "30";
  const mainId = short ? g.short : g.main;
  const ids = [mainId];
  if (a.tiempo === "mas" && mainId !== "contorno-ojos") ids.push("contorno-ojos");
  const t = getTreatment(mainId);
  let timeNote: string | undefined;
  if (short && t && (t.mins ?? 0) > 30) timeNote = `Es el que mejor encaja con lo que buscas, aunque dura ${mins(t.mins ?? 0)}.`;
  if (a.tiempo === "asesoren") timeNote = "Como prefieres que te asesoremos, lo decidimos juntas en cabina.";
  return {
    ids,
    intro: `${SKIN_NOTE[a.tarde] ?? SKIN_NOTE["no-claro"]} Como quieres ${g.label}, podría gustarte esto:`,
    timeNote,
  };
}

/* Mensaje de WhatsApp con las respuestas, para pedir el diagnóstico gratuito */
export function quizMessage(a: Answers, labels: Record<string, string>, rec: Recommendation) {
  const list = rec.ids
    .map((id) => getTreatment(id))
    .filter((t) => !!t)
    .map((t) => `${t!.name} (${t!.mins ? mins(t!.mins) + ", " : ""}${eur(t!.price)})`)
    .join(" y ");
  return `Hola, Alba. Me gustaría solicitar el diagnóstico de piel gratuito. He hecho el test de la web: a media tarde mi piel está «${labels[a.tarde]}», me gustaría mejorar «${labels[a.mejorar]}» y tengo «${labels[a.tiempo]}». La orientación del test fue: ${list}. ¿Qué disponibilidad tenéis?`;
}
