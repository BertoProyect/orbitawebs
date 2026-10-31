import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { scrollToId } from "../lib/links";

/* Peticiones de reserva desde cualquier parte de la web (carta, color, raíz…) */
export type BookingRequest = { serviceId: string; note?: string; nonce: number };

type Ctx = {
  request: BookingRequest | null;
  book: (serviceId: string, note?: string) => void;
};

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const book = useCallback((serviceId: string, note?: string) => {
    setRequest({ serviceId, note, nonce: Date.now() });
    scrollToId("reserva");
  }, []);
  const value = useMemo(() => ({ request, book }), [request, book]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking fuera de BookingProvider");
  return ctx;
}

/* Tono elegido en la carta de colores, compartido con «¿Cuándo te toca volver?» */
