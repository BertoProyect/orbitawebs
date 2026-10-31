# Vaivén · fotografía de bodas · demo

Demo de Órbita Webs servida en `orbitawebs.com/vaiven-fotografia/`.
React 19 + TypeScript + Tailwind 4 + Framer Motion, compilado con Vite.

```bash
npm install
npm run dev     # desarrollo
npm run build   # compila a ../../public/vaiven-fotografia/
```

- `index.html` va a la raíz de la demo y el JS/CSS con hash a `app/` (solo esa carpeta se borra al compilar).
- En `public/vaiven-fotografia/` siguen la intro de cristal (`assets/intro*.js`), la fuente Geist, la marca (`brand/`) y las páginas legales (que usan `assets/styles.css`).
- Textos, enlaces y fotos: `src/data/site.ts`. Cambiar las fotos de muestra por las reales = tocar solo `PHOTOS`, `GALLERY`, `STEPS` y `REEL`.
- Agenda: `src/data/availability.ts`. Empieza en `status: 'closed'`; para abrirla, `status: 'open'` y las fechas en `availableDates` / `occupiedDates` (AAAA-MM-DD). Nada se marca disponible si no está ahí.
- Banda curva bajo la portada: `src/components/CurvedReel.tsx` (misma geometría y valores que la original).
- Lleva `noindex`: es una demo y no debe salir en Google como web oficial.
