import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const OUT = fileURLToPath(new URL('../../public/cuspide-clinica-dental', import.meta.url))
const hash = (p: string) => createHash('md5').update(readFileSync(p)).digest('hex').slice(0, 8)

/* Versiona por contenido los archivos que no compila Vite (intro de cristal, boca 3D). */
function demoHead(): Plugin {
  return {
    name: 'cuspide-head',
    transformIndexHtml: (html) => html.replace(/%V:([\w.-]+)%/g, (_, f) => hash(`${OUT}/assets/${f}`)),
  }
}

// La demo vive en orbitawebs.com/cuspide-clinica-dental/. El build escribe index.html en esa carpeta
// y lo compilado en app/, sin borrar lo demás (intro de cristal, boca 3D, fuente, marca, legales).
export default defineConfig({
  base: '/cuspide-clinica-dental/',
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
