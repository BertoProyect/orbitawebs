/* Cúspide Clínica Dental: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var motion = !reduceMotion && hasIO;
  var each = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };

  /* Marcadores en el borde superior e inferior del documento (sin escuchar el scroll) */
  var sentinel = function (where) {
    var el = document.createElement('div');
    el.className = 'edge-sentinel';
    el.setAttribute('aria-hidden', 'true');
    el.style.top = where === 'top' ? '0' : 'calc(100% - 1px)';
    document.body.appendChild(el);
    return el;
  };
  if (getComputedStyle(document.body).position === 'static') document.body.style.position = 'relative';

  /* Movimiento: cada bloque aparece al entrar en pantalla.
     Sin JS o con "reducir movimiento" no se oculta nada. */
  if (motion) {
    document.documentElement.classList.add('motion');

    /* Titulares palabra a palabra: el texto real queda en aria-label */
    each('[data-split]', function (el) {
      var text = el.textContent.trim().replace(/\s+/g, ' ');
      var wrap = document.createElement('span');
      wrap.setAttribute('aria-hidden', 'true');
      text.split(' ').forEach(function (word, i) {
        if (i) wrap.appendChild(document.createTextNode(' '));
        var mask = document.createElement('span');
        mask.className = 'w';
        var inner = document.createElement('span');
        inner.textContent = word;
        inner.style.setProperty('--wi', i);
        mask.appendChild(inner);
        wrap.appendChild(mask);
      });
      el.setAttribute('aria-label', text);
      el.textContent = '';
      el.appendChild(wrap);
    });

    var revealObserver;
    var reveal = function (el, k) {
      el.style.setProperty('--d', Math.min(k, 6) * 110 + 'ms');
      el.classList.add('is-in');
      revealObserver.unobserve(el);
      el.dispatchEvent(new CustomEvent('reveal'));
    };
    revealObserver = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (e) { if (e.isIntersecting) reveal(e.target, k++); });
    }, { rootMargin: '0px 0px -8% 0px' });
    each('[data-reveal], [data-split]', function (el) { revealObserver.observe(el); });

    /* Al llegar al final de la página, lo último del pie no entra en la zona de arriba: se muestra igual */
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      var k = 0;
      each('[data-reveal]:not(.is-in), [data-split]:not(.is-in)', function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el, k++);
      });
    }).observe(sentinel('bottom'));
  }

  /* Sacude un campo con error para llamar la atención */
  var shake = function (el) {
    if (!motion || !el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    el.addEventListener('animationend', function done(e) {
      if (e.target !== el) return;
      el.classList.remove('shake');
      el.removeEventListener('animationend', done);
    });
  };

  /* Navegación: sin fondo arriba del todo, blanca en cuanto empiezas a bajar */
  var nav = $('.nav');
  if (nav && hasIO && !nav.classList.contains('is-solid')) {
    var topMark = sentinel('top');
    topMark.style.height = '8px';
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-solid', !entries[0].isIntersecting);
    }).observe(topMark);
  } else if (nav) {
    nav.classList.add('is-solid');
  }

  /* Barra fija en móvil: aparece al dejar atrás los botones del hero
     y se oculta al llegar a la cita o al pie */
  var bar = $('#bar');
  var heroActions = $('#hero-actions');
  if (bar && heroActions && hasIO) {
    var pastHero = false;
    var endsInView = new Set();
    var renderBar = function () {
      var show = pastHero && endsInView.size === 0;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (show) bar.removeAttribute('inert'); else bar.setAttribute('inert', '');
    };
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      renderBar();
    }).observe(heroActions);
    var endObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) endsInView.add(e.target); else endsInView.delete(e.target);
      });
      renderBar();
    });
    ['#cita', '.footer'].forEach(function (sel) { var el = $(sel); if (el) endObserver.observe(el); });
  }

  /* Preguntas: donde no hay interpolate-size (Safari, Firefox), la apertura y el cierre se animan aquí */
  var sizeInterp = window.CSS && CSS.supports && CSS.supports('interpolate-size', 'allow-keywords');
  if (!sizeInterp && !reduceMotion && 'animate' in Element.prototype) {
    each('.faq details', function (d) {
      var summary = d.querySelector('summary');
      var body = d.querySelector('.faq__a');
      var anim = null;
      var easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (anim) return;
        if (d.open) {
          d.classList.add('is-closing');
          anim = body.animate({ height: [body.offsetHeight + 'px', '0px'] }, { duration: 380, easing: easing });
          anim.onfinish = function () { d.open = false; d.classList.remove('is-closing'); anim = null; };
        } else {
          d.open = true;
          anim = body.animate({ height: ['0px', body.offsetHeight + 'px'] }, { duration: 420, easing: easing });
          anim.onfinish = function () { anim = null; };
        }
      });
    });
  }

  /* Desplegable propio (combobox de solo selección, patrón WAI-ARIA).
     Se monta sobre un <select> nativo, que sigue guardando el valor. */
  var ddCount = 0;
  var fold = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var makeDropdown = function (select) {
    var id = 'dd' + (ddCount += 1);
    var shell = select.parentNode;
    var label = document.querySelector('label[for="' + select.id + '"]');
    var box = document.createElement('div');
    var btn = document.createElement('div');
    var valueEl = document.createElement('span');
    var list = document.createElement('ul');
    var opts = [];
    var active = -1;
    var typed = '';
    var typedTimer = 0;

    box.className = 'dd';
    btn.className = 'dd__btn';
    btn.id = id + '-btn';
    btn.tabIndex = 0;
    btn.setAttribute('role', 'combobox');
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id + '-list');
    if (label) btn.setAttribute('aria-labelledby', label.id);
    if (select.getAttribute('aria-describedby')) btn.setAttribute('aria-describedby', select.getAttribute('aria-describedby'));
    if (select.required) btn.setAttribute('aria-required', 'true');
    valueEl.className = 'dd__value';
    list.className = 'dd__list';
    list.id = id + '-list';
    list.tabIndex = -1;
    list.setAttribute('role', 'listbox');
    if (label) list.setAttribute('aria-labelledby', label.id);
    btn.appendChild(valueEl);
    box.appendChild(btn);
    box.appendChild(list);
    shell.parentNode.insertBefore(box, shell);
    shell.hidden = true;
    select.tabIndex = -1;

    var isOpen = function () { return box.classList.contains('is-open'); };
    var sync = function () {
      var o = select.options[select.selectedIndex];
      valueEl.textContent = o ? o.textContent : '';
      btn.classList.toggle('is-placeholder', !o || o.value === '');
      opts.forEach(function (li) { li.setAttribute('aria-selected', Number(li.dataset.index) === select.selectedIndex ? 'true' : 'false'); });
      var off = select.disabled;
      btn.setAttribute('aria-disabled', off ? 'true' : 'false');
      btn.tabIndex = off ? -1 : 0;
    };
    var build = function () {
      list.textContent = '';
      opts = [];
      Array.prototype.forEach.call(select.options, function (o, i) {
        if (o.value === '') return;
        var li = document.createElement('li');
        li.id = id + '-o' + i;
        li.className = 'dd__opt';
        li.setAttribute('role', 'option');
        li.dataset.index = i;
        li.textContent = o.textContent;
        list.appendChild(li);
        opts.push(li);
      });
      sync();
    };
    var setActive = function (i) {
      if (!opts.length) return;
      active = Math.max(0, Math.min(opts.length - 1, i));
      opts.forEach(function (li, k) { li.classList.toggle('is-active', k === active); });
      var li = opts[active];
      btn.setAttribute('aria-activedescendant', li.id);
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop - 6;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight + 6;
    };
    var selectedPos = function () {
      for (var k = 0; k < opts.length; k += 1) if (Number(opts[k].dataset.index) === select.selectedIndex) return k;
      return 0;
    };
    var open = function () {
      if (select.disabled || isOpen() || !opts.length) return;
      if (makeDropdown.current) makeDropdown.current.close();
      makeDropdown.current = api;
      var r = btn.getBoundingClientRect();
      var listH = Math.min(288, opts.length * 46 + 14);
      var below = window.innerHeight - r.bottom;
      /* Si no cabe debajo, primero se intenta bajar la página; si no se puede, se abre hacia arriba */
      var need = listH + 16 - below;
      if (need > 0) {
        var nav = document.querySelector('.nav');
        var room = r.top - (nav ? nav.offsetHeight : 0) - 12;
        var left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
        if (room >= need && left >= need) {
          window.scrollBy({ top: need, behavior: reduceMotion ? 'auto' : 'smooth' });
          below += need;
        }
      }
      box.classList.toggle('is-up', below < listH + 16 && r.top > below);
      box.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      setActive(selectedPos());
    };
    var close = function () {
      if (!isOpen()) return;
      box.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.removeAttribute('aria-activedescendant');
      if (makeDropdown.current === api) makeDropdown.current = null;
    };
    var choose = function (k) {
      if (!opts[k]) return;
      var changed = select.selectedIndex !== Number(opts[k].dataset.index);
      select.selectedIndex = Number(opts[k].dataset.index);
      sync();
      close();
      if (changed) select.dispatchEvent(new Event('change', { bubbles: true }));
    };

    btn.addEventListener('click', function () { if (isOpen()) close(); else open(); });
    btn.addEventListener('blur', close);
    btn.addEventListener('keydown', function (e) {
      var key = e.key;
      if (select.disabled) return;
      if (!isOpen()) {
        if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') { e.preventDefault(); open(); }
        else if (key === 'Home' || key === 'End') { e.preventDefault(); open(); setActive(key === 'Home' ? 0 : opts.length - 1); }
        else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { open(); }
        else return;
      }
      if (!isOpen()) return;
      if (key === 'ArrowDown') { e.preventDefault(); if (e.altKey) return; setActive(active + 1); }
      else if (key === 'ArrowUp') { e.preventDefault(); if (e.altKey) { choose(active); return; } setActive(active - 1); }
      else if (key === 'PageDown') { e.preventDefault(); setActive(active + 6); }
      else if (key === 'PageUp') { e.preventDefault(); setActive(active - 6); }
      else if (key === 'Home') { e.preventDefault(); setActive(0); }
      else if (key === 'End') { e.preventDefault(); setActive(opts.length - 1); }
      else if (key === 'Enter' || (key === ' ' && !typed)) { e.preventDefault(); choose(active); }
      else if (key === 'Escape') { e.preventDefault(); close(); }
      else if (key === 'Tab') { choose(active); }
      else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        clearTimeout(typedTimer);
        typed += fold(key);
        typedTimer = setTimeout(function () { typed = ''; }, 600);
        var start = typed.length > 1 ? active : active + 1;
        for (var n = 0; n < opts.length; n += 1) {
          var k = (start + n) % opts.length;
          if (fold(opts[k].textContent).indexOf(typed) === 0) { setActive(k); break; }
        }
      }
    });
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.dd__opt');
      if (li) { choose(opts.indexOf(li)); btn.focus(); }
    });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('.dd__opt');
      if (li && opts.indexOf(li) !== active) setActive(opts.indexOf(li));
    });
    if (label) label.addEventListener('click', function (e) { e.preventDefault(); if (!select.disabled) btn.focus(); });

    var api = { btn: btn, build: build, sync: sync, close: close, select: select };
    build();
    return api;
  };
  document.addEventListener('pointerdown', function (e) {
    var cur = makeDropdown.current;
    if (cur && !cur.btn.parentNode.contains(e.target)) cur.close();
  });

  /* Formulario de cita */
  var form = $('#form-cita');
  var done = $('#form-done');
  if (form && done) {
    var nameInput = $('#f-nombre', form);
    var telInput = $('#f-tel', form);
    var privInput = $('#f-priv', form);
    var daySelect = $('#f-dia', form);
    var hourSelect = $('#f-hora', form);
    var submitBtn = $('button[type="submit"]', form);

    /* Días: los próximos 15 laborables desde mañana. Horas: huecos de 30 minutos según el horario */
    var dayFmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var dayText = function (d) { return dayFmt.format(d).replace(',', ''); };
    var dayByValue = {};
    (function () {
      var d = new Date();
      d.setHours(12, 0, 0, 0);
      var count = 0;
      while (count < 15) {
        d.setDate(d.getDate() + 1);
        var wd = d.getDay();
        if (wd === 0 || wd === 6) continue;
        var value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        var text = dayText(d);
        dayByValue[value] = { text: text, weekday: wd };
        daySelect.add(new Option(text.charAt(0).toUpperCase() + text.slice(1), value));
        count += 1;
      }
    })();
    var slots = function (from, to) {
      var out = [];
      for (var m = from; m <= to; m += 30) out.push(Math.floor(m / 60) + ':' + pad(m % 60));
      return out;
    };
    var hoursFor = function (weekday) {
      if (weekday === 5) return slots(9 * 60 + 30, 14 * 60);
      return slots(9 * 60 + 30, 13 * 60 + 30).concat(slots(16 * 60 + 30, 20 * 60));
    };
    var fillHours = function () {
      var day = dayByValue[daySelect.value];
      var previous = hourSelect.value;
      hourSelect.length = 0;
      hourSelect.add(new Option(day ? 'Elige una hora' : 'Elige primero el día', ''));
      if (day) hoursFor(day.weekday).forEach(function (h) { hourSelect.add(new Option(h, h)); });
      hourSelect.disabled = !day;
      hourSelect.value = previous;
      if (hourSelect.selectedIndex < 0) hourSelect.selectedIndex = 0;
      if (hourDd) hourDd.build();
    };

    var dayDd = makeDropdown(daySelect);
    var hourDd = null;
    fillHours();
    hourDd = makeDropdown(hourSelect);
    var motivoDd = makeDropdown($('#f-motivo', form));
    /* El botón de la boca en 3D elige el tipo de cita desde fuera: el desplegable se pone al día */
    $('#f-motivo', form).addEventListener('change', function () { motivoDd.sync(); });
    daySelect.addEventListener('change', fillHours);

    var rules = [
      { el: nameInput, error: $('#e-nombre', form), valid: function () { return nameInput.value.trim().length >= 2; } },
      { el: telInput, error: $('#e-tel', form), valid: function () {
          var digits = telInput.value.replace(/[\s.()-]/g, '').replace(/^(\+34|0034)/, '');
          return /^[6789]\d{8}$/.test(digits);
        } },
      { el: dayDd.btn, watch: daySelect, error: $('#e-dia', form), valid: function () { return daySelect.value !== ''; } },
      { el: hourDd.btn, watch: hourSelect, error: $('#e-hora', form), valid: function () { return daySelect.value === '' || hourSelect.value !== ''; } },
      { el: privInput, error: $('#e-priv', form), valid: function () { return privInput.checked; } }
    ];

    var setState = function (rule, ok) {
      rule.el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      rule.error.hidden = ok;
    };

    rules.forEach(function (rule) {
      var target = rule.watch || rule.el;
      var evt = rule.watch || rule.el.type === 'checkbox' ? 'change' : 'input';
      target.addEventListener(evt, function () {
        if (rule.el.getAttribute('aria-invalid') === 'true' && rule.valid()) setState(rule, true);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      rules.forEach(function (rule) {
        var ok = rule.valid();
        setState(rule, ok);
        if (!ok && !firstInvalid) firstInvalid = rule.el;
      });
      if (firstInvalid) { firstInvalid.focus(); shake(firstInvalid); return; }
      if (submitBtn.classList.contains('is-loading')) return;

      var firstName = nameInput.value.trim().split(/\s+/)[0];
      $('[data-name]', done).textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      $('[data-when]', done).textContent = dayByValue[daySelect.value].text + ' a las ' + hourSelect.value;
      var showDone = function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.removeAttribute('aria-disabled');
        form.hidden = true;
        done.hidden = false;
        done.focus({ preventScroll: true });
      };
      if (!motion) { showDone(); return; }
      /* Breve estado de envío antes de confirmar */
      submitBtn.classList.add('is-loading');
      submitBtn.setAttribute('aria-disabled', 'true');
      setTimeout(showDone, 800);
    });

    $('#form-reset', done).addEventListener('click', function () {
      form.reset();
      fillHours();
      dayDd.sync();
      motivoDd.sync();
      rules.forEach(function (rule) { rule.el.removeAttribute('aria-invalid'); rule.error.hidden = true; });
      done.hidden = true;
      form.hidden = false;
      nameInput.focus();
    });
  }

  /* Boca en 3D: el código pesa, así que se descarga solo al acercarse a la sección */
  var mouth = $('[data-mouth]');
  if (mouth) {
    var loadMouth = function () {
      import('/cuspide-clinica-dental/assets/dientes.js?v=cfefb370').catch(function () { mouth.classList.add('mouth--flat'); });
    };
    if (hasIO) {
      var mouthIO = new IntersectionObserver(function (entries) {
        if (entries.some(function (x) { return x.isIntersecting; })) { mouthIO.disconnect(); loadMouth(); }
      }, { rootMargin: '1500px 0px' });
      mouthIO.observe(mouth);
    } else loadMouth();
  }
})();
