/**
 * Configuración central de analítica de terceros (Google Analytics).
 *
 * IMPORTANTE (RGPD / LSSI-CE): Google Analytics NO puede cargarse antes de
 * que el usuario dé su consentimiento expreso mediante el banner de
 * cookies. Por eso este interruptor está en `false` por defecto: aunque se
 * rellene el ID de medición más abajo, el script de Google no se cargará
 * hasta que `ANALYTICS_ENABLED` sea `true` Y el usuario pulse "Aceptar" en
 * el banner (ver `CookieConsent.tsx`).
 *
 * Cuando tengáis el dominio definitivo y querías activarlo:
 *   1. Cread la propiedad en Google Analytics (analytics.google.com).
 *   2. Pegad aquí el ID de medición (formato "G-XXXXXXXXXX").
 *   3. Cambiad ANALYTICS_ENABLED a `true`.
 *   4. Actualizad también la fecha y el contenido de /cookies para reflejar
 *      que ya usáis Google Analytics (el texto actual dice que no).
 */
export const ANALYTICS_ENABLED = false;

export const GA_MEASUREMENT_ID = ""; // p. ej. "G-ABC1234XYZ"
