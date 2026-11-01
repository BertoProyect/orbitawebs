import type { Motivo } from './clinic'

/* Ficha de cada diente (numeración FDI). Son los mismos textos que usa el modelo 3D
   (assets/dientes.js), aquí para que el panel funcione aunque el 3D no cargue. */

const NAMES = ['Incisivo central', 'Incisivo lateral', 'Canino', 'Primer premolar', 'Segundo premolar', 'Primer molar', 'Segundo molar', 'Tercer molar']
const ALIAS: Record<number, string> = { 3: 'el colmillo', 8: 'la muela del juicio' }

const TEXT: Record<string, string> = {
  U1: 'Corta los alimentos como unas tijeras. Es el diente que más se ve al sonreír y te ayuda a pronunciar la f y la v.',
  U2: 'Ayuda al central a cortar. Es más estrecho y a veces nace pequeño, con forma de cono, o no llega a salir.',
  U3: 'Desgarra los alimentos y guía la mordida cuando mueves la mandíbula hacia los lados. Tiene la raíz más larga de toda la boca.',
  U4: 'Tritura y desgarra. Suele tener dos raíces y es el que se quita cuando hace falta sitio para enderezar los dientes.',
  U5: 'Tritura la comida antes de pasarla a las muelas. Se parece mucho al primero, pero casi siempre tiene una sola raíz.',
  U6: 'Muele la comida con cuatro cúspides. Sale hacia los 6 años detrás de las muelas de leche, sin que se caiga ninguna, y por eso a veces se confunde con una de leche.',
  U7: 'Muele junto a la primera. Sale hacia los 12 años y, al estar tan atrás, es fácil que el cepillo no llegue bien.',
  U8: 'Sale entre los 17 y los 25 años, si sale. Cuando no tiene sitio, duele, se infecta o empuja a las demás.',
  L1: 'El diente más pequeño de la boca. Por dentro es donde más sarro se acumula, así que es el que más agradece una limpieza.',
  L2: 'Corta junto al central. Como está tan pegado a sus vecinos, es donde antes se nota si los dientes empiezan a apiñarse.',
  L3: 'Desgarra los alimentos y guía la mordida. Su raíz es de las más largas y por eso aguanta muchos años en su sitio.',
  L4: 'Hace de puente entre el colmillo y las muelas. Su cúspide de dentro es tan pequeña que casi parece otro colmillo.',
  L5: 'Tritura con dos o tres cúspides. Después de las muelas del juicio, es el diente que más veces no llega a formarse.',
  L6: 'La muela que más fuerza hace al masticar, con cinco cúspides. Sale hacia los 6 años detrás de las de leche y suele ser la primera en tener caries.',
  L7: 'Muele junto a la primera. Sale hacia los 12 años y, al estar tan atrás, es fácil que el cepillo no llegue bien.',
  L8: 'Sale entre los 17 y los 25 años, si sale. Abajo es la que más se queda atrapada en el hueso y la que más se extrae.',
}
const AGE = { U: ['7–8', '8–9', '11–12', '10–11', '10–12', '6–7', '12–13', '17–25'], L: ['6–7', '7–8', '9–10', '10–12', '11–12', '6–7', '11–13', '17–25'] }
const ROOTS = { U: ['1', '1', '1', '2', '1', '3', '3', '3, a veces unidas'], L: ['1', '1', '1', '1', '1', '2', '2', '2, a veces unidas'] }

const CARE: Record<string, { list: string[]; motivo: Motivo }> = {
  front: { list: ['Carillas', 'Blanqueamiento', 'Ortodoncia invisible'], motivo: 'Estética dental' },
  lowFront: { list: ['Limpieza dental', 'Ortodoncia invisible'], motivo: 'Limpieza' },
  canine: { list: ['Ortodoncia invisible', 'Carillas', 'Blanqueamiento'], motivo: 'Ortodoncia invisible' },
  premolar: { list: ['Empastes', 'Endodoncia', 'Coronas'], motivo: 'Primera visita o revisión' },
  molar: { list: ['Empastes', 'Endodoncia', 'Implantes'], motivo: 'Primera visita o revisión' },
  wisdom: { list: ['Radiografía panorámica', 'Extracción'], motivo: 'Me duele algo' },
}

export type Tooth = {
  fdi: number
  jaw: 'U' | 'L'
  pos: number // 1 = incisivo central … 8 = muela del juicio
  name: string
  short: string
  alias: string
  text: string
  age: string
  roots: string
  care: string[]
  motivo: Motivo
}

function make(fdi: number): Tooth {
  const q = Math.floor(fdi / 10)
  const pos = fdi % 10
  const jaw = q <= 2 ? 'U' : 'L'
  const right = q === 1 || q === 4
  const kind = pos === 8 ? 'wisdom' : pos >= 6 ? 'molar' : pos >= 4 ? 'premolar' : pos === 3 ? 'canine' : jaw === 'U' ? 'front' : 'lowFront'
  const where = `${jaw === 'U' ? 'superior' : 'inferior'} ${right ? 'derecho' : 'izquierdo'}`
  return {
    fdi,
    jaw,
    pos,
    name: `${NAMES[pos - 1]} ${where}`,
    short: `${NAMES[pos - 1]} ${jaw === 'U' ? 'sup.' : 'inf.'} ${right ? 'dcho.' : 'izq.'}`,
    alias: ALIAS[pos] ?? '',
    text: TEXT[`${jaw}${pos}`],
    age: AGE[jaw][pos - 1],
    roots: ROOTS[jaw][pos - 1],
    care: CARE[kind].list,
    motivo: CARE[kind].motivo,
  }
}

const range = (q: number, dir: 1 | -1) => Array.from({ length: 8 }, (_, i) => q * 10 + (dir === 1 ? i + 1 : 8 - i))

/* Orden del recorrido (como el modelo 3D): arriba de derecha a izquierda del paciente y vuelta por abajo. */
export const ORDER: number[] = [...range(1, -1), ...range(2, 1), ...range(3, -1), ...range(4, 1)]
export const TEETH: Record<number, Tooth> = Object.fromEntries(ORDER.map((f) => [f, make(f)]))

/* Filas del odontograma tal y como las ve el dentista (derecha del paciente a la izquierda de la pantalla). */
export const UPPER_ROW = [...range(1, -1), ...range(2, 1)]
export const LOWER_ROW = [...range(4, -1), ...range(3, 1)]
