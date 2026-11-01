/* PUNTO DE INTEGRACIÓN DEL FORMULARIO DE CITA
 *
 * La web no tiene servidor propio. Cuando la clínica tenga dónde recibir las solicitudes
 * (una función en Cloudflare, Supabase o un servicio de formularios), basta con compilar con
 *   VITE_BOOKING_ENDPOINT=https://…   npm run build
 * y añadir ese dominio a connect-src en public/_headers.
 *
 * El endpoint recibe un POST JSON con { nombre, telefono, tipo, dia, hora, nota, privacidad }
 * y debe responder 2xx si guarda la solicitud. Solo se envía lo imprescindible para llamar al paciente.
 *
 * Sin endpoint, la web NUNCA dice que la solicitud se ha enviado: prepara el resumen y
 * pide al paciente que llame para confirmarla.
 */
export type BookingRequest = {
  nombre: string
  telefono: string
  tipo: string
  dia: string
  hora: string
  nota?: string
  privacidad: true
}

export type BookingResult = { status: 'sent' } | { status: 'unconfigured' } | { status: 'error'; message: string }

const ENDPOINT: string | undefined = import.meta.env.VITE_BOOKING_ENDPOINT

export async function submitBooking(data: BookingRequest): Promise<BookingResult> {
  if (!ENDPOINT) return { status: 'unconfigured' }
  try {
    const ctrl = new AbortController()
    const t = window.setTimeout(() => ctrl.abort(), 12000)
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: ctrl.signal,
    })
    window.clearTimeout(t)
    if (!res.ok) return { status: 'error', message: 'No hemos podido enviar tu solicitud.' }
    return { status: 'sent' }
  } catch {
    return { status: 'error', message: 'Parece que no hay conexión. Inténtalo de nuevo o llámanos.' }
  }
}
