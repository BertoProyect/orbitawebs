import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Motivo } from '../data/clinic'
import { scrollToId } from '../lib/hooks'

/* Cualquier parte de la web puede abrir la cita con datos ya rellenos
   (un tratamiento, un diente del 3D, la financiación). */
export type Prefill = { motivo?: Motivo; nota?: string; stamp: number }

type Ctx = { prefill: Prefill | null; request: (p: Omit<Prefill, 'stamp'>) => void; clearNote: () => void }
const BookingCtx = createContext<Ctx | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefill] = useState<Prefill | null>(null)
  const request = useCallback((p: Omit<Prefill, 'stamp'>) => {
    setPrefill({ ...p, stamp: Date.now() })
    // Framer Motion mide las alturas «auto» (la nota que aparece en el formulario) y al medir
    // devuelve el scroll a su sitio: el desplazamiento empieza justo después de esa medición.
    window.setTimeout(() => scrollToId('cita'), 90)
  }, [])
  const clearNote = useCallback(() => setPrefill((p) => (p ? { ...p, nota: undefined } : p)), [])
  return <BookingCtx.Provider value={{ prefill, request, clearNote }}>{children}</BookingCtx.Provider>
}

export function useBooking() {
  const c = useContext(BookingCtx)
  if (!c) throw new Error('useBooking fuera de BookingProvider')
  return c
}
