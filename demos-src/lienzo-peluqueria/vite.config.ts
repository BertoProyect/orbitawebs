import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Compila la demo dentro de la web de Órbita: public/lienzo-peluqueria/
// - index.html va a la raíz de la demo
// - el JS y el CSS con hash van a app/ (scripts/clean.mjs solo borra esa carpeta)
// - no se vacía la carpeta: la intro de cristal, la marca y las páginas legales viven ahí
export default defineConfig({
  base: '/lienzo-peluqueria/',
  publicDir: false,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../../public/lienzo-peluqueria',
    emptyOutDir: false,
    assetsDir: 'app',
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: false,
  },
})
