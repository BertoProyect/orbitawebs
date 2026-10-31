/* Vaivén: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var WA = 'https://wa.me/34959807018?text=';

  /* ────────────────────────────────────────────────────────────────
   * Banda curva. Port sin React de TiltedGridHero (misma geometría y mismos valores).
   * Una fila de fotos recorre por dentro un cilindro de derecha a izquierda: el centro
   * queda de frente, los extremos se curvan hacia ti y se funden con la página.
   * Cada foto se corta en SLICES tiras verticales, cada una girada a su sitio en el arco;
   * lo que se mueve es la foto entera (un único rotateY), así las tiras nunca se separan.
   * ──────────────────────────────────────────────────────────────── */
  var SLICES = 16;
  var CAMERA = 1.6;
  var MAX_WIDTH = 55;

  var arc = function (bend) {
    return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
  };

  var measureBand = function (width, height, tile, aspect, gap, bend) {
    var h = Math.min((tile / 100) * height, ((MAX_WIDTH / 100) * width) / aspect);
    var radius = width * arc(bend);
    if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
    var deg = function (rad) { return (rad * 180) / Math.PI; };
    var unit = deg(h / radius);
    var pitch = (aspect + gap / 100) * unit;
    var limit = deg(bend) + (aspect * unit) / 2;
    var columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
    var round = function (n) { return +n.toFixed(4); };
    var sweep = round((columns * pitch) / 2);
    return { columns: columns, sweep: sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
  };

  var mountBand = function (root, opts) {
    var images = opts.images || [];
    var speed = opts.speed || 4;
    var tileHeight = opts.tileHeight || 26;
    var aspect = opts.aspectRatio || 16 / 9;
    var gap = opts.gap == null ? 6 : opts.gap;
    var axis = opts.axis == null ? 56 : opts.axis;
    var fade = opts.fade == null ? 12 : opts.fade;
    var bend = (Math.min(85, Math.max(5, opts.curve == null ? 80 : opts.curve)) * Math.PI) / 180;

    var id = 'v' + Math.random().toString(36).slice(2, 8);
    var orbit = 'tgh-o-' + id;
    var tileClass = 'tgh-t-' + id;

    var styleEl = document.createElement('style');
    var layer = document.createElement('div');
    layer.className = 'reel__layer';
    layer.setAttribute('aria-hidden', 'true');
    root.insertBefore(layer, root.firstChild);
    root.insertBefore(styleEl, root.firstChild);

    var fix = function (n, d) { return +n.toFixed(d); };
    var u = function (n) {
      return 'calc(' + fix(n, 4) + ' * min(' + tileHeight + 'cqh, ' + fix(MAX_WIDTH / aspect, 4) + 'cqw))';
    };
    var r = 100 * arc(bend);
    var radius = fix(r, 3) + 'cqw';
    var turn = function (d) {
      return 'translateZ(' + radius + ') rotateY(' + fix(d, 4) + 'deg) translateZ(-' + radius + ')';
    };
    var share = aspect / SLICES;
    var mask = 'linear-gradient(90deg,transparent,#000 ' + fade + '%,#000 ' + (100 - fade) + '%,transparent)';

    layer.style.perspective = fix(r * CAMERA, 3) + 'cqw';
    layer.style.perspectiveOrigin = '50% ' + axis + '%';
    layer.style.maskImage = mask;
    layer.style.webkitMaskImage = mask;

    /* Se descargan todas antes: cada foto toma la siguiente justo antes de volver a verse */
    images.forEach(function (img) { var pre = new Image(); pre.src = img.src; });

    var current = null;

    var build = function (layout) {
      var columns = layout.columns;
      var sweep = layout.sweep;
      var limit = layout.limit;
      var unit = layout.unit;
      var duration = columns * speed;
      var hide = fix(((sweep - limit) / (2 * sweep || 1)) * 100, 4);

      styleEl.textContent =
        '@keyframes ' + orbit + '{' +
        'from{transform:' + turn(-sweep) + '}to{transform:' + turn(sweep) + '}' +
        '0%,' + hide + '%,' + (100 - hide) + '%,100%{visibility:hidden}' +
        (hide + 0.001) + '%,' + (100 - hide - 0.001) + '%{visibility:visible}}' +
        /* !important: el atajo «animation» en línea de cada foto anularía la pausa */
        '@media(prefers-reduced-motion:reduce){.' + tileClass + '{animation-play-state:paused!important}}';

      var frag = document.createDocumentFragment();
      for (var t = 0; t < columns; t++) {
        (function (t) {
          var first = columns - 1 - t;
          var shown = first;
          var tile = document.createElement('div');
          tile.className = 'reel__tile ' + tileClass;
          tile.style.left = 'calc(50% - ' + u(aspect / 2) + ')';
          tile.style.top = 'calc(' + axis + '% - ' + u(0.5) + ')';
          tile.style.width = u(aspect);
          tile.style.height = u(1);
          tile.style.animation = orbit + ' ' + duration + 's linear ' + (-t * speed) + 's infinite';

          var imgs = [];
          var src = images.length ? images[shown % images.length].src : '';
          for (var k = 0; k < SLICES; k++) {
            var strip = document.createElement('div');
            strip.className = 'reel__strip' + (k === 0 ? ' reel__strip--first' : '') + (k === SLICES - 1 ? ' reel__strip--last' : '');
            /* Cada tira asoma 1px por cada lado (salvo los bordes de la foto) para que no se abra
               ninguna rendija entre facetas, se pinten en el orden que se pinten */
            var padL = k === 0 ? 0 : 1;
            var padR = k === SLICES - 1 ? 0 : 1;
            strip.style.left = 'calc(' + u((aspect - share) / 2) + ' - ' + padL + 'px)';
            strip.style.width = 'calc(' + u(share) + ' + ' + (padL + padR) + 'px)';
            strip.style.height = u(1);
            strip.style.transform = turn((aspect / 2 - (k + 0.5) * share) * unit);
            if (src) {
              var img = document.createElement('img');
              img.src = src;
              img.alt = '';
              img.draggable = false;
              img.decoding = 'async';
              img.style.left = 'calc(' + u(-k * share) + ' + ' + padL + 'px)';
              img.style.width = u(aspect);
              img.style.height = u(1);
              strip.appendChild(img);
              imgs.push(img);
            }
            tile.appendChild(strip);
          }

          /* Al dar la vuelta (fuera de la vista) la foto pasa a la siguiente de la lista */
          tile.addEventListener('animationiteration', function (e) {
            if (!images.length) return;
            var lap = Math.round(e.elapsedTime / duration);
            var next = lap * columns + first;
            if (next === shown) return;
            shown = next;
            var nextSrc = images[next % images.length].src;
            imgs.forEach(function (im) { im.src = nextSrc; });
          });

          frag.appendChild(tile);
        })(t);
      }
      layer.replaceChildren(frag);
      layer.classList.add('is-ready');
    };

    var relayout = function (width, height) {
      var next = measureBand(width, height, tileHeight, aspect, gap, bend);
      if (current && current.columns === next.columns && current.sweep === next.sweep && current.unit === next.unit) return;
      current = next;
      build(next);
    };

    if ('ResizeObserver' in window) {
      new ResizeObserver(function (entries) {
        var box = entries[0].contentRect;
        relayout(box.width, box.height);
      }).observe(root);
    } else {
      relayout(root.clientWidth, root.clientHeight);
    }
  };

  var reel = $('#reel');
  if (reel) {
    var list = [];
    try { list = JSON.parse(reel.getAttribute('data-images') || '[]'); } catch (e) { list = []; }
    var supportsCq = !!(window.CSS && CSS.supports && CSS.supports('width: 1cqw'));
    var num = function (name, fallback) {
      var v = parseFloat(reel.getAttribute('data-' + name));
      return isNaN(v) ? fallback : v;
    };
    if (supportsCq && list.length) {
      mountBand(reel, {
        images: list,
        speed: num('speed', 4),
        tileHeight: num('tile-height', 26),
        aspectRatio: num('aspect', 16 / 9),
        gap: num('gap', 6),
        axis: num('axis', 56),
        curve: num('curve', 80),
        fade: num('fade', 12)
      });
    }
  }

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

  /* Un día de boda: en escritorio la sección se fija y el scroll recorre las fotos (CSS).
     Aquí solo se mide cuánto hay que desplazar la fila. */
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
