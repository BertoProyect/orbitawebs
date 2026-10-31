/* Puerta de la intro de entrada. Va en el <head> sin defer (pesa ~1 KB) para tapar la web antes
 * del primer pintado; la animación (intro-glass.js) solo se descarga si toca mostrarla:
 * la primera vez por sesión, con WebGL2 y sin «reducir movimiento». */
(function () {
  'use strict';
  var s = document.currentScript;
  if (!s) return;
  var ds = s.dataset;
  var root = document.documentElement;

  try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) { /* sigue */ }
  if (!('WebGL2RenderingContext' in window) || !('Worker' in window) || !('Promise' in window)) return;

  var key = 'intro-visto:' + (ds.key || location.pathname);
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
  } catch (e) { /* sin almacenamiento: se muestra igualmente */ }

  var bg = ds.bg || '#000000';
  var css = document.createElement('style');
  css.textContent =
    // Sin scroll mientras dura, reservando el hueco de la barra para que la web no salte al soltarla.
    'html.gi-hold{overflow:hidden;scrollbar-gutter:stable}' +
    // Las animaciones de entrada de la web esperan a que se abra la intro.
    'html.gi-hold body *,html.gi-hold body *::before,html.gi-hold body *::after{animation-play-state:paused!important}' +
    // Telón del color de fondo hasta que la animación toma el relevo.
    'html.gi-cover::after{content:"";position:fixed;inset:0;z-index:2147483646;background:' + bg + '}';
  document.head.appendChild(css);
  root.classList.add('gi-hold', 'gi-cover');

  var released = false;
  var G = window.__glassIntro = {
    started: false,
    config: {
      engine: ds.engine,
      logo: ds.logo,
      look: ds.look || 'light',
      bg: bg,
      plate: ds.plate || undefined,
      scale: ds.scale ? parseFloat(ds.scale) : undefined,
      final: ds.final ? parseFloat(ds.final) : undefined,
      zoom: ds.zoom ? parseFloat(ds.zoom) : undefined,
      minFps: ds.minFps ? parseFloat(ds.minFps) : undefined
    },
    uncover: function () { root.classList.remove('gi-cover'); },
    release: function () {
      if (released) return;
      released = true;
      root.classList.remove('gi-hold', 'gi-cover');
    }
  };

  // Red de seguridad: si la animación no llega a arrancar, la web se abre sola.
  setTimeout(function () { if (!G.started) G.release(); }, 3500);

  var e = document.createElement('script');
  e.src = ds.engine;
  e.async = true;
  e.onerror = G.release;
  document.head.appendChild(e);
})();
