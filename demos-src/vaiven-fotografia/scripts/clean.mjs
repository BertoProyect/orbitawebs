// Borra solo la carpeta de salida con hash (app/). No toca la intro, la marca, las fuentes ni las páginas legales.
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const out = fileURLToPath(new URL('../../../public/vaiven-fotografia/app', import.meta.url))
rmSync(out, { recursive: true, force: true })
console.log('limpio:', out)
