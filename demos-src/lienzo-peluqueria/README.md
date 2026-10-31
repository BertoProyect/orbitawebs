# Lienzo Peluquería · demo

Demo de Órbita Webs servida en `orbitawebs.com/lienzo-peluqueria/`.
React 19 + TypeScript + Tailwind 4 + Framer Motion, compilado con Vite.

```bash
npm install
npm run dev     # desarrollo
npm run build   # compila a ../../public/lienzo-peluqueria/
```

- `index.html` va a la raíz de la demo y el JS/CSS con hash a `app/` (solo esa carpeta se borra al compilar).
- En `public/lienzo-peluqueria/` siguen la intro de cristal (`assets/intro*.js`), la marca (`brand/`) y las páginas legales.
- Datos del negocio, carta y textos: `src/data/`. El pelo con física: `src/lib/hair-engine.ts`.
- Lleva `noindex`: es una demo y no debe salir en Google como web oficial.
