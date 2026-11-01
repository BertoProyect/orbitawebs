import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

type Item = { id: string; cat: string; name: string; price: number; mins: number | null }
type Cat = { id: string; label: string }

/* Mete en el <head> los datos estructurados (BeautySalon + catálogo de servicios) a partir del
   mismo catalog.json que usa la web: así precios y servicios nunca se desincronizan. */
function structuredData(): Plugin {
  return {
    name: 'alba-structured-data',
    transformIndexHtml(html) {
      const catalog = JSON.parse(readFileSync(new URL('./src/data/catalog.json', import.meta.url), 'utf8')) as {
        categories: Cat[]
        items: Item[]
      }
      const base = 'https://orbitawebs.com/alba-estetica/'
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const ld = {
        '@context': 'https://schema.org',
        '@type': 'BeautySalon',
        '@id': `${base}#salon`,
        name: 'Alba Estética',
        url: base,
        image: `${base}og-alba.jpg`,
        description:
          'Centro de estética en Huelva: faciales, corporales, depilación láser, cejas, pestañas y manicura.',
        telephone: '+34959807018',
        priceRange: '€€',
        currenciesAccepted: 'EUR',
        paymentAccepted: 'Efectivo, tarjeta, Bizum',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Calle Puerto, 22',
          postalCode: '21001',
          addressLocality: 'Huelva',
          addressRegion: 'Huelva',
          addressCountry: 'ES',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 37.25705, longitude: -6.9502 },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '212' },
        openingHoursSpecification: [
          { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: '10:00', closes: '14:00' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: '16:30', closes: '20:30' },
          { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Tratamientos de estética',
          itemListElement: catalog.categories.map((c) => ({
            '@type': 'OfferCatalog',
            name: c.label,
            itemListElement: catalog.items
              .filter((i) => i.cat === c.id)
              .map((i) => ({
                '@type': 'Offer',
                priceCurrency: 'EUR',
                price: String(i.price),
                itemOffered: { '@type': 'Service', name: c.id === 'laser' ? `Láser de diodo · ${i.name} (por sesión)` : i.name },
              })),
          })),
        },
      }
      return html.replace('<!--JSONLD-->', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
    },
  }
}

// Compila la demo dentro de la web de Órbita: public/alba-estetica/
// - index.html va a la raíz de la demo
// - el JS y el CSS con hash van a app/ (scripts/clean.mjs solo borra esa carpeta)
// - no se vacía la carpeta: la intro de cristal, la marca, las fuentes y las páginas legales viven ahí
export default defineConfig({
  base: '/alba-estetica/',
  publicDir: false,
  plugins: [react(), tailwindcss(), structuredData()],
  build: {
    outDir: '../../public/alba-estetica',
    emptyOutDir: false,
    assetsDir: 'app',
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: false,
  },
})
