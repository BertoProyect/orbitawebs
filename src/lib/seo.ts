/**
 * Datos SEO compartidos por todas las rutas (title, description, URL
 * canónica y datos estructurados). Cambiar aquí y se actualiza en todas
 * partes: <head>, Open Graph, Twitter y JSON-LD.
 */
export const SITE_URL = "https://orbitawebs.com";

export const SITE_TITLE = "Órbita Webs | Diseño web para negocios en toda España";

// Sin precios: el coste depende de cada proyecto y no debe aparecer en Google.
export const SITE_DESCRIPTION =
  "Órbita Webs: diseño web profesional para negocios de toda España. Te enseñamos una demo gratuita de tu web antes de empezar. Con base en Huelva, 100% online.";

export const INSTAGRAM_URL = "https://www.instagram.com/orbita.webs/";

/**
 * Datos estructurados de la home. WebSite le dice a Google cómo se llama
 * el sitio (el nombre que muestra encima del enlace en los resultados) y
 * las variantes con las que la gente lo busca; ProfessionalService es la
 * ficha de la empresa (logo, contacto, zona de servicio y perfiles).
 */
export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Órbita Webs",
      alternateName: ["Orbita Webs", "OrbitaWebs", "orbitawebs.com"],
      inLanguage: "es-ES",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: "Órbita Webs",
      alternateName: ["Orbita Webs", "OrbitaWebs"],
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon-512.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/og-image.png`,
      description:
        "Estudio de diseño y desarrollo web para negocios de toda España, con base en Huelva.",
      email: "contacto@orbitawebs.com",
      telephone: "+34959807018",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Huelva",
        addressRegion: "Andalucía",
        addressCountry: "ES",
      },
      areaServed: { "@type": "Country", name: "España" },
      knowsLanguage: "es",
      sameAs: [INSTAGRAM_URL],
    },
  ],
};
