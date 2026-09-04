/**
 * Configuración central de analítica de terceros (Google Analytics).
 *
 * IMPORTANTE (RGPD / LSSI-CE): Google Analytics NO puede cargarse antes de
 * que el usuario dé su consentimiento expreso mediante el banner de
 * cookies. Por eso el script de Google solo se carga si `ANALYTICS_ENABLED`
 * es `true` Y el usuario pulsa "Aceptar" en el banner (ver
 * `CookieConsent.tsx`). Activado el 5 de septiembre de 2026.
 */
export const ANALYTICS_ENABLED = true;

export const GA_MEASUREMENT_ID = "G-XEFHFXHCVK";
