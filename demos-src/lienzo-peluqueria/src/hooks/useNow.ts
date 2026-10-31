import { useEffect, useState } from "react";
import { madridNow, type MadridNow } from "../lib/time";

/* Hora de Madrid, actualizada al cambiar de minuto */
export function useMadridNow(): MadridNow {
  const [now, setNow] = useState(() => madridNow());
  useEffect(() => {
    let t = 0;
    const schedule = () => {
      const ms = 60000 - (Date.now() % 60000) + 50;
      t = window.setTimeout(() => {
        setNow(madridNow());
        schedule();
      }, ms);
    };
    schedule();
    const onVis = () => document.visibilityState === "visible" && setNow(madridNow());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return now;
}
