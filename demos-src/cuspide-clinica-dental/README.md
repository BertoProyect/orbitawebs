# Cúspide Clínica Dental · demo

Demo de Órbita Webs servida en `orbitawebs.com/cuspide-clinica-dental/`.
React 19 + TypeScript + Tailwind 4 + Framer Motion + GSAP (ScrollTrigger), compilado con Vite.

```bash
npm install
npm run dev     # desarrollo
npm run build   # compila a ../../public/cuspide-clinica-dental/
```

- `index.html` va a la raíz de la demo y el JS/CSS con hash a `app/` (solo esa carpeta se borra al compilar).
- En `public/cuspide-clinica-dental/` siguen la intro de cristal (`assets/intro*.js`), la boca 3D
  (`assets/dientes.js` + `dientes-worker.js`), la fuente, la marca (`brand/`) y las páginas legales.
- La boca 3D expone en `[data-mouth]` la API `__mouth.select(fdi) / reset() / zoom(f)` y lanza el evento `tooth`.
- Datos y textos: `src/data/`. Formulario de cita: punto de integración en `src/lib/booking-api.ts`
  (`VITE_BOOKING_ENDPOINT`). Sin endpoint, la web no finge el envío: prepara la solicitud y pide la llamada.
- Lleva `noindex`: es una demo y no debe salir en Google como web oficial.
