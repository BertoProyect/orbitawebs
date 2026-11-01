# Alba Estética · demo

Demo de Órbita Webs servida en `orbitawebs.com/alba-estetica/`.
React 19 + TypeScript + Tailwind 4 + Framer Motion, compilado con Vite.

```bash
npm install
npm run dev     # desarrollo
npm run build   # compila a ../../public/alba-estetica/
```

- `index.html` va a la raíz de la demo y el JS/CSS con hash a `app/` (solo esa carpeta se borra al compilar).
- En `public/alba-estetica/` siguen la intro de cristal (`assets/intro*.js`), las fuentes, la marca (`brand/`)
  y las páginas legales (que usan `assets/styles.css`).
- Precios y servicios: `src/data/catalog.json` (de ahí salen también los datos estructurados del `<head>`).
- Recorrido en 7 escenas: portada, filosofía, tratamientos, mapa del rostro, láser, experiencia y equipo, invitación final.
- La escena 2 adapta el componente «Scroll word reveal» de Motion (21st.dev).
- Lleva `noindex`: es una demo y no debe salir en Google como web oficial.
