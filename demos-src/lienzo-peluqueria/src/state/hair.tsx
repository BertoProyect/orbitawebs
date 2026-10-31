import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { GREY_LEVELS, NATURAL_COLORS, SHADES, type Shade } from "../data/content";

type Natural = (typeof NATURAL_COLORS)[number];
type Grey = (typeof GREY_LEVELS)[number];

type Ctx = {
  shade: Shade;
  setShade: (s: Shade) => void;
  natural: Natural;
  setNatural: (n: Natural) => void;
  grey: Grey;
  setGrey: (g: Grey) => void;
};

const HairContext = createContext<Ctx | null>(null);

/* Tono, color natural y canas: los comparten la carta de colores y «¿Cuándo te toca volver?» */
export function HairProvider({ children }: { children: ReactNode }) {
  const [shade, setShade] = useState<Shade>(SHADES[4]);
  const [natural, setNatural] = useState<Natural>(NATURAL_COLORS[0]);
  const [grey, setGrey] = useState<Grey>(GREY_LEVELS[0]);
  const value = useMemo(
    () => ({ shade, setShade, natural, setNatural, grey, setGrey }),
    [shade, natural, grey],
  );
  return <HairContext.Provider value={value}>{children}</HairContext.Provider>;
}

export function useHair() {
  const ctx = useContext(HairContext);
  if (!ctx) throw new Error("useHair fuera de HairProvider");
  return ctx;
}

export const shadeLabel = (s: Shade) => `${s.code} ${s.name}`;
