/* Sal y Plata: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var WA = 'https://wa.me/34959807018?text=';

  /* Portada: las copias que aún no han cargado se «revelan» al llegar.
     Las que ya están (caché) se quedan tal cual, sin parpadeo. */
  $$('.wall__print').forEach(function (fig) {
    var img = $('img', fig);
    if (!img || (img.complete && img.naturalWidth) || reduceMotion) return;
    fig.classList.add('is-pending');
    var done = false;
    var reveal = function () {
      if (done) return;
      done = true;
      fig.classList.remove('is-pending');
      fig.classList.add('is-developed');
    };
    img.addEventListener('load', reveal, { once: true });
    img.addEventListener('error', reveal, { once: true });
    setTimeout(reveal, 2500);
  });

  /* Línea inferior de la navegación al hacer scroll */
  var nav = $('.nav');
  if (nav && hasIO && !nav.classList.contains('is-scrolled')) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:4px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* La barra pasa a oscura mientras tiene debajo una sala oscura */
  var darkRooms = $$('.day, .check');
  if (nav && hasIO && darkRooms.length) {
    var under = new Set();
    var darkObserver = null;
    var watchDark = function () {
      if (darkObserver) darkObserver.disconnect();
      var navH = nav.offsetHeight;
      darkObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) under.add(e.target); else under.delete(e.target); });
        nav.classList.toggle('is-dark', under.size > 0);
      }, { rootMargin: '0px 0px ' + (navH - window.innerHeight) + 'px 0px' });
      darkRooms.forEach(function (el) { darkObserver.observe(el); });
    };
    watchDark();
    var lastH = window.innerHeight;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerHeight - lastH) > 80) { lastH = window.innerHeight; watchDark(); }
    });
  }

  /* Un día de boda: en escritorio la sala se recorre con el scroll (CSS scroll-driven).
     Aquí solo se mide cuánto hay que desplazar la fila de fotos. */
  var day = $('#bodas');
  var track = $('#day-track');
  if (day && track) {
    var canPin = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
    var desktop = window.matchMedia('(min-width: 1024px)');
    var sticky = $('.day__sticky', day);
    var measure = function () {
      var pin = canPin && desktop.matches && !reduceMotion;
      day.classList.toggle('is-pinned', pin);
      if (pin) {
        var dist = Math.max(0, Math.ceil(track.offsetWidth - sticky.clientWidth));
        day.style.setProperty('--dist', dist + 'px');
        track.removeAttribute('tabindex');
      } else {
        day.style.removeProperty('--dist');
        track.setAttribute('tabindex', '0');
      }
    };
    measure();
    if (desktop.addEventListener) desktop.addEventListener('change', measure);
    if ('ResizeObserver' in window) {
      var raf = 0;
      new ResizeObserver(function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      }).observe(sticky);
    } else {
      window.addEventListener('resize', measure);
    }
  }

  /* ¿Está libre vuestra fecha? Simulación determinista de la agenda */
  var form = $('#check-form');
  var input = $('#check-date');
  var errorEl = $('#check-error');
  var result = $('#check-result');
  if (form && input && result) {
    var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var DAY_MS = 864e5;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var lastOpenYear = today.getFullYear() + 2;

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var addDays = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
    var parse = function (v) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
      if (!m) return null;
      var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return isNaN(d.getTime()) ? null : d;
    };
    var human = function (d) {
      return DAYS[d.getDay()] + ' ' + d.getDate() + ' de ' + MONTHS[d.getMonth()] + ' de ' + d.getFullYear();
    };
    var hash = function (n) {
      n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
      n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
      return (n ^ (n >>> 16)) >>> 0;
    };
    var inSeason = function (d) { var m = d.getMonth(); return m >= 4 && m <= 9; };
    var isBooked = function (d) {
      var dow = d.getDay();
      var r = hash(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 100;
      var monthsAway = (d - today) / (DAY_MS * 30.44);
      if (dow === 6) return inSeason(d) ? r < (monthsAway < 12 ? 72 : 40) : r < 18;
      if (dow === 5 || dow === 0) return inSeason(d) ? r < 20 : r < 5;
      return false;
    };
    var bookable = function (d) { return d > today && d.getFullYear() <= lastOpenYear; };
    var freeSeasonSaturdays = function (year) {
      var d = new Date(year, 4, 1);
      d = addDays(d, (6 - d.getDay() + 7) % 7);
      var n = 0;
      while (d.getMonth() <= 9 && d.getFullYear() === year) {
        if (bookable(d) && !isBooked(d)) n++;
        d = addDays(d, 7);
      }
      return n;
    };
    var nearestFreeSaturdays = function (d) {
      var base = addDays(d, (6 - d.getDay() + 7) % 7);
      var before = null;
      var after = null;
      for (var k = 0; k < 40 && !(before && after); k++) {
        var next = addDays(base, 7 * k);
        var prev = addDays(base, -7 * (k + 1));
        if (!after && next.getTime() !== d.getTime() && bookable(next) && !isBooked(next)) after = next;
        if (!before && prev.getTime() !== d.getTime() && bookable(prev) && !isBooked(prev)) before = prev;
      }
      return [before, after].filter(Boolean);
    };

    var showError = function (msg) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      result.hidden = true;
      input.focus();
    };
    var clearError = function () {
      errorEl.hidden = true;
      input.removeAttribute('aria-invalid');
    };

    var render = function (tplId, fill) {
      var tpl = document.getElementById(tplId);
      result.replaceChildren(tpl.content.cloneNode(true));
      fill(result);
      result.hidden = false;
      result.focus({ preventScroll: true });
      var r = result.getBoundingClientRect();
      if (r.bottom > window.innerHeight || r.top < 0) {
        result.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };

    var check = function () {
      var d = parse(input.value);
      if (!d) { showError('Elegid una fecha para comprobarla.'); return; }
      if (d < today) { showError('Esa fecha ya ha pasado. Elegid una a partir de mañana.'); return; }
      if (d.getTime() === today.getTime()) { showError('Para hoy ya no llego. Elegid una fecha a partir de mañana.'); return; }
      clearError();

      if (d.getFullYear() > lastOpenYear) {
        render('tpl-later', function (root) {
          $('[data-text]', root).textContent = 'Todavía no he abierto la agenda de ' + d.getFullYear() + '. Escribidme y os aviso en cuanto la abra.';
          $('[data-wa]', root).href = WA + encodeURIComponent('Hola, Irene. Nos casamos el ' + human(d) + '. ¿Nos avisas cuando abras la agenda de ' + d.getFullYear() + '?');
        });
        return;
      }

      if (isBooked(d)) {
        render('tpl-busy', function (root) {
          $('[data-text]', root).textContent = 'El ' + human(d) + ' ya tengo una boda.';
          var alts = $('[data-alts]', root);
          var options = nearestFreeSaturdays(d);
          if (!options.length) {
            alts.previousElementSibling.textContent = 'Escribidme y buscamos otra fecha juntos.';
            return;
          }
          options.forEach(function (alt) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'chip';
            var label = alt.getDate() + ' de ' + MONTHS[alt.getMonth()];
            if (alt.getFullYear() !== d.getFullYear()) label += ' de ' + alt.getFullYear();
            b.textContent = 'Sábado ' + label;
            b.addEventListener('click', function () {
              input.value = iso(alt);
              check();
            });
            alts.appendChild(b);
          });
        });
        return;
      }

      render('tpl-free', function (root) {
        $('[data-text]', root).textContent = 'El ' + human(d) + ' está libre.';
        var note = $('[data-note]', root);
        if (d.getDay() === 6 && inSeason(d)) {
          var n = freeSeasonSaturdays(d.getFullYear());
          note.textContent = n === 1
            ? 'Es el último sábado libre entre mayo y octubre de ' + d.getFullYear() + '.'
            : 'Me quedan ' + n + ' sábados libres entre mayo y octubre de ' + d.getFullYear() + '.';
        } else {
          note.textContent = 'Para reservarla os pido una señal del 30 %.';
        }
        $('[data-wa]', root).href = WA + encodeURIComponent('Hola, Irene. Queremos reservar el ' + human(d) + ' para nuestra boda. ¿Hablamos?');
      });
    };

    input.min = iso(addDays(today, 1));
    form.addEventListener('submit', function (e) { e.preventDefault(); check(); });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true' && parse(input.value)) clearError(); });
    /* En móvil el selector nativo ya es una confirmación: comprobamos al elegir */
    if (window.matchMedia('(pointer: coarse)').matches) {
      input.addEventListener('change', function () { if (parse(input.value)) check(); });
    }
  }
})();
