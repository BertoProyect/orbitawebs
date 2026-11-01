import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BUSINESS } from "../data/business";
import { getTreatment, treatmentLabel, type Treatment } from "../data/treatments";
import { eur, mins } from "../lib/format";
import { waLink } from "../lib/links";

/* La cita que va armando la clienta: se comparte entre carta, mapa, test, láser y panel.
   Se guarda en sessionStorage para que sobreviva a un refresco, nada más. */
const KEY = "alba-cita-v2";

function read(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw) as unknown;
    return Array.isArray(ids) ? ids.filter((i): i is string => typeof i === "string" && !!getTreatment(i)) : [];
  } catch {
    return [];
  }
}

type Totals = {
  price: number;
  mins: number;
  /** hay servicios sin duración fija (láser) */
  hasOpenEnded: boolean;
};

type Ctx = {
  ids: string[];
  items: Treatment[];
  totals: Totals;
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  durationLabel: string;
  whatsappHref: string;
};

const CitaContext = createContext<Ctx | null>(null);

export function CitaProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(read);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* sin almacenamiento: la cita sigue funcionando en memoria */
    }
  }, [ids]);

  const add = useCallback((id: string) => setIds((c) => (c.includes(id) ? c : [...c, id])), []);
  const remove = useCallback((id: string) => setIds((c) => c.filter((i) => i !== id)), []);
  const toggle = useCallback(
    (id: string) => setIds((c) => (c.includes(id) ? c.filter((i) => i !== id) : [...c, id])),
    [],
  );
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<Ctx>(() => {
    const items = ids.map((id) => getTreatment(id)).filter((t): t is Treatment => !!t);
    const totals: Totals = {
      price: items.reduce((s, t) => s + t.price, 0),
      mins: items.reduce((s, t) => s + (t.mins ?? 0), 0),
      hasOpenEnded: items.some((t) => t.mins === null),
    };
    const durationLabel = !items.length
      ? "—"
      : totals.mins
        ? `${mins(totals.mins)}${totals.hasOpenEnded ? " + láser" : ""}`
        : "A confirmar";
    const list = items
      .map((t) => `${treatmentLabel(t)} (${t.mins ? mins(t.mins) + ", " : ""}${eur(t.price)}${t.cat === "laser" ? " por sesión" : ""})`)
      .join("; ");
    const durationText = !items.length
      ? ""
      : totals.mins
        ? `${mins(totals.mins)}${totals.hasOpenEnded ? " (más la sesión de láser, a confirmar)" : ""}`
        : "a confirmar según la zona de láser";
    const whatsappHref = waLink(
      items.length
        ? `Hola, Alba. Me gustaría pedir cita. Estos son los tratamientos que me interesan: ${list}. Duración aproximada: ${durationText}. Precio orientativo: ${eur(totals.price)}. ¿Qué disponibilidad tenéis?`
        : `Hola, Alba. Me gustaría pedir cita en ${BUSINESS.name}. ¿Qué disponibilidad tenéis?`,
    );
    return {
      ids,
      items,
      totals,
      has: (id) => ids.includes(id),
      add,
      remove,
      toggle,
      clear,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      durationLabel,
      whatsappHref,
    };
  }, [ids, panelOpen, add, remove, toggle, clear]);

  return <CitaContext.Provider value={value}>{children}</CitaContext.Provider>;
}

export function useCita() {
  const ctx = useContext(CitaContext);
  if (!ctx) throw new Error("useCita fuera de CitaProvider");
  return ctx;
}
