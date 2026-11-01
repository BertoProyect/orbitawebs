import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/* Escritorio con ratón: ahí van el parallax, el cursor y los efectos más caros */
export const useFinePointer = () => useMediaQuery("(min-width: 1024px) and (pointer: fine)");
/* Dos columnas con imagen fija: solo en pantallas anchas */
export const useWide = () => useMediaQuery("(min-width: 1024px)");
