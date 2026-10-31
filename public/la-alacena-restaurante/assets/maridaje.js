/* La Alacena: «¿Qué vino le pedimos?». El panel funciona solo; la copa en 3D se carga al acercarse. */
(function () {
  'use strict';
  var root = document.querySelector('[data-pour]');
  if (!root) return;
  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-wine]'));
  var out = {
    name: document.getElementById('pour-name'),
    origin: document.getElementById('pour-origin'),
    why: document.getElementById('pour-why'),
    glass: document.getElementById('pour-glass'),
    bottle: document.getElementById('pour-bottle')
  };
  var wine = root.querySelector('.pour__wine');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = chips[0];
  var ready = false, served = false;

  var serve = function (chip) {
    if (!ready) return;
    served = true;
    root.dispatchEvent(new CustomEvent('pour:serve', { detail: { key: chip.getAttribute('data-wine'), name: chip.getAttribute('data-name'), origin: chip.getAttribute('data-origin') } }));
  };
  var pick = function (chip, focus) {
    chips.forEach(function (c) {
      var on = c === chip;
      c.setAttribute('aria-checked', on ? 'true' : 'false');
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
      c.tabIndex = on ? 0 : -1;
    });
    if (focus) chip.focus();
    if (chip === current && served) return;
    current = chip;
    out.name.textContent = chip.getAttribute('data-name');
    out.origin.textContent = chip.getAttribute('data-origin');
    out.why.textContent = chip.getAttribute('data-why');
    out.glass.textContent = chip.getAttribute('data-glass');
    out.bottle.textContent = chip.getAttribute('data-bottle');
    if (!reduce) { wine.classList.remove('is-changing'); void wine.offsetWidth; wine.classList.add('is-changing'); }
    serve(chip);
  };
  chips.forEach(function (chip, i) {
    chip.setAttribute('aria-pressed', chip.getAttribute('aria-checked'));
    chip.addEventListener('click', function () { pick(chip, false); });
    chip.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = chips[(i + 1) % chips.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = chips[(i - 1 + chips.length) % chips.length];
      if (next) { e.preventDefault(); pick(next, true); }
    });
  });

  /* La primera copa se sirve cuando la escena entra en pantalla */
  var stage = root.querySelector('.pour__stage');
  var firstServe = function () {
    if (!('IntersectionObserver' in window)) { serve(current); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting && e.intersectionRatio > 0.4; })) { io.disconnect(); if (!served) serve(current); }
    }, { threshold: [0, 0.4, 0.7] });
    io.observe(stage);
  };
  root.addEventListener('pour:ready', function () { ready = true; firstServe(); });

  var load = function () {
    import('/la-alacena-restaurante/assets/copa.js' + (load.v ? '?' + load.v : '')).catch(function () { root.classList.add('pour--flat'); });
  };
  load.v = (function () { var s = document.querySelector('script[src*="maridaje.js"]'); return s ? s.src.split('?')[1] || '' : ''; })();
  if ('IntersectionObserver' in window) {
    var near = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { near.disconnect(); load(); }
    }, { rootMargin: '900px 0px' });
    near.observe(root);
  } else load();
})();
