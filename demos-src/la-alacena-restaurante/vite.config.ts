import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DAILY, HOURS, MENU, RESTAURANT } from './src/data/restaurant.ts'

const OUT = fileURLToPath(new URL('../../public/la-alacena-restaurante', import.meta.url))
const URL_ = 'https://orbitawebs.com/la-alacena-restaurante/'

/* Datos estructurados (Restaurant) generados desde los mismos datos que pinta la web. */
function jsonLd() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const t = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  const spec = HOURS.flatMap((h) => h.slots.map(([a, b]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: days[h.day], opens: t(a), closes: t(b) })))
  const price = (p: string) => p.match(/[\d,]+/)?.[0]?.replace(',', '.')
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: RESTAURANT.name,
    slogan: RESTAURANT.slogan,
    url: URL_,
    image: URL_ + 'og-alacena.jpg',
    telephone: '+34959807018',
    priceRange: '€€',
    servesCuisine: ['Cocina de mercado', 'Andaluza'],
    acceptsReservations: 'True',
    paymentAccepted: 'Efectivo, tarjeta, Bizum',
    address: { '@type': 'PostalAddress', streetAddress: RESTAURANT.street, postalCode: RESTAURANT.postal, addressLocality: RESTAURANT.city, addressCountry: 'ES' },
    geo: { '@type': 'GeoCoordinates', latitude: RESTAURANT.geo.lat, longitude: RESTAURANT.geo.lng },
    openingHoursSpecification: spec,
    hasMenu: {
      '@type': 'Menu',
      name: 'Carta de La Alacena',
      url: URL_ + '#carta',
      hasMenuSection: [
        ...MENU.map((c) => ({
          '@type': 'MenuSection',
          name: c.title,
          hasMenuItem: c.dishes.map((d) => ({
            '@type': 'MenuItem',
            name: d.name,
            ...(price(d.price) ? { offers: { '@type': 'Offer', price: price(d.price), priceCurrency: 'EUR' } } : {}),
          })),
        })),
        {
          '@type': 'MenuSection',
          name: 'Menú del día (de martes a viernes)',
          offers: { '@type': 'Offer', price: DAILY.price.toFixed(2), priceCurrency: 'EUR' },
        },
      ],
    },
  }
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const hash = (p: string) => createHash('md5').update(readFileSync(p)).digest('hex').slice(0, 8)

function demoHead(): Plugin {
  return {
    name: 'alacena-head',
    transformIndexHtml(html) {
      return html
        .replace('%JSONLD%', jsonLd())
        .replace(/%V:([\w.-]+)%/g, (_, f) => hash(`${OUT}/assets/${f}`))
    },
  }
}

// La demo vive en orbitawebs.com/la-alacena-restaurante/. El build escribe index.html en esa carpeta
// y todo lo compilado en app/, sin borrar lo demás (intro de cristal, copa 3D, fuentes, marca, legales).
export default defineConfig({
  base: '/la-alacena-restaurante/',
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
