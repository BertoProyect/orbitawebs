// Borra solo la carpeta de salida hasheada (app/). No toca intro, marca ni páginas legales.
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const out = fileURLToPath(new URL('../../../public/lienzo-peluqueria/app', import.meta.url))
rmSync(out, { recursive: true, force: true })
console.log('limpio:', out)
