import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const OUT = fileURLToPath(new URL('../../public/vaiven-fotografia', import.meta.url))
const hash = (p: string) => createHash('md5').update(readFileSync(p)).digest('hex').slice(0, 8)

/* Versiona por contenido los archivos fijos de la demo (intro de cristal, fuente). */
function demoHead(): Plugin {
  return {
    name: 'vaiven-head',
    transformIndexHtml(html) {
      return html.replace(/%V:([\w.-]+)%/g, (_, f) => hash(`${OUT}/assets/${f}`))
    },
  }
}

// La demo vive en orbitawebs.com/vaiven-fotografia/. El build escribe index.html en esa carpeta
// y todo lo compilado en app/, sin borrar lo demás (intro de cristal, fuente, marca, legales).
export default defineConfig({
  base: '/vaiven-fotografia/',
  publicDir: false,
  plugins: [react(), tailwindcss(), demoHead()],
  build: {
    outDir: OUT,
    emptyOutDir: false,
    assetsDir: 'app',
    target: 'es2020',
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
  },
})
