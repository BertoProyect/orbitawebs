// Borra solo la salida compilada (app/). No toca la intro de cristal, la copa 3D, la marca ni las páginas legales.
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const out = fileURLToPath(new URL('../../../public/la-alacena-restaurante/app', import.meta.url))
rmSync(out, { recursive: true, force: true })
console.log('limpio:', out)
