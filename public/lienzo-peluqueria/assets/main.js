/* Lienzo Peluquería: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var WHATSAPP = '34959807018';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var hasIO = 'IntersectionObserver' in window;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var restart = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- Fecha y hora de Huelva (Europe/Madrid), sea cual sea la zona del visitante ---------- */
  var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  /* Horario en minutos desde medianoche, por día de la semana (0 = domingo) */
  var HOURS = { 2: [[570, 840], [990, 1230]], 3: [[570, 840], [990, 1230]], 4: [[570, 840], [990, 1230]], 5: [[570, 840], [990, 1230]], 6: [[540, 840]] };
  var SLOT = 30;

  var madridNow = function () {
    var o = {};
    try {
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) {
      var d = new Date();
      o = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes() };
    }
    return { y: +o.year, m: +o.month, d: +o.day, mins: (+o.hour % 24) * 60 + (+o.minute) };
  };
  var dayFrom = function (now, k) {
    var t = new Date(Date.UTC(now.y, now.m - 1, now.d + k));
    return { dow: t.getUTCDay(), date: t.getUTCDate(), month: t.getUTCMonth() };
  };
  var clock = function (mins) { return Math.floor(mins / 60) + ':' + ('0' + (mins % 60)).slice(-2); };
  /* Horas de inicio posibles de un día, cada media hora, dejando media hora antes de cerrar */
  var slotsFor = function (dow, fromMins) {
    return (HOURS[dow] || []).map(function (range) {
      var list = [];
      for (var t = range[0]; t <= range[1] - SLOT; t += SLOT) if (t >= fromMins) list.push(t);
      return list;
    }).filter(function (list) { return list.length; });
  };

  /* ---------- Navegación: transparente sobre la portada, sólida al bajar ---------- */
  var nav = $('.nav');
  if (nav && hasIO) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:48px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Barra fija en móvil: aparece al dejar atrás el hero y se oculta en la reserva y el pie ---------- */
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
      entries.forEach(function (e) { if (e.isIntersecting) endsInView.add(e.target); else endsInView.delete(e.target); });
      renderBar();
    });
    ['#reserva', '.footer'].forEach(function (sel) { var el = $(sel); if (el) endObserver.observe(el); });
  }

  /* ---------- Carta de servicios: pestañas con indicador que se desliza ---------- */
  var tabsRoot = $('[data-tabs]');
  if (tabsRoot) {
    var tabList = $('[role="tablist"]', tabsRoot);
    var tabs = $$('[role="tab"]', tabsRoot);
    var media = $$('[data-media]');
    var thumb = document.createElement('span');
    thumb.className = 'tabs__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    tabList.prepend(thumb);
    tabList.classList.add('has-thumb');
    var placeThumb = function (tab) {
      thumb.style.width = tab.offsetWidth + 'px';
      thumb.style.height = tab.offsetHeight + 'px';
      thumb.style.transform = 'translate(' + tab.offsetLeft + 'px,' + tab.offsetTop + 'px)';
    };
    var currentTab = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    var selectTab = function (tab, focus) {
      currentTab = tab;
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      restart(document.getElementById(tab.getAttribute('aria-controls')), 'is-in');
      media.forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-media') === tab.getAttribute('data-tab')); });
      placeThumb(tab);
      if (focus) tab.focus();
      var left = tab.offsetLeft;
      if (left < tabList.scrollLeft || left + tab.offsetWidth > tabList.scrollLeft + tabList.clientWidth) {
        tabList.scrollTo({ left: Math.max(0, left - 20), behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };
    requestAnimationFrame(function () { placeThumb(currentTab); requestAnimationFrame(function () { thumb.classList.add('is-ready'); }); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { placeThumb(currentTab); }).observe(tabList);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeThumb(currentTab); });
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  }

  /* ---------- Carta de colores ---------- */
  var locks = $$('.lock');
  var toneBook = $('#tone-book');
  var current = null;
  if (locks.length) {
    var swap = $('#tone-detail');
    var selectTone = function (lock, focus) {
      locks.forEach(function (l) {
        var on = l === lock;
        l.setAttribute('aria-checked', on ? 'true' : 'false');
        l.tabIndex = on ? 0 : -1;
      });
      if (focus) lock.focus();
      if (current === lock) return;
      current = lock;
      restart(lock, 'is-swing');
      $('#tone-code').textContent = lock.getAttribute('data-code');
      $('#tone-name').textContent = lock.getAttribute('data-name');
      $('#tone-desc').textContent = lock.getAttribute('data-desc');
      $('#tone-ideal').textContent = lock.getAttribute('data-ideal');
      restart(swap, 'is-changing');
    };
    current = locks.filter(function (l) { return l.getAttribute('aria-checked') === 'true'; })[0] || locks[0];
    locks.forEach(function (lock, i) {
      lock.addEventListener('click', function () { selectTone(lock, false); });
      lock.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = locks[(i + 1) % locks.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = locks[(i - 1 + locks.length) % locks.length];
        else if (e.key === 'Home') next = locks[0];
        else if (e.key === 'End') next = locks[locks.length - 1];
        if (next) { e.preventDefault(); selectTone(next, true); }
      });
    });
  }

  /* ---------- Desplegable propio (patrón «select» accesible: botón + lista) ---------- */
  var openDropdown = null;
  function Dropdown(root, onChange) {
    var btn = $('.dd__btn', root);
    var list = $('[role="listbox"]', root);
    var valueEl = $('.dd__value', btn);
    var placeholder = valueEl.getAttribute('data-placeholder');
    var value = '';
    var active = null;
    var typed = '';
    var typedTimer = 0;
    var api;

    var options = function () { return $$('[role="option"]', list); };
    var index = function () {
      options().forEach(function (o, i) { o.style.setProperty('--o', Math.min(i, 14)); });
    };
    var keepInList = function (o) {
      var top = o.offsetTop;
      var bottom = top + o.offsetHeight;
      if (top < list.scrollTop + 6) list.scrollTop = top - 6;
      else if (bottom > list.scrollTop + list.clientHeight - 6) list.scrollTop = bottom - list.clientHeight + 6;
    };
    var setActive = function (o, scroll) {
      if (active) active.classList.remove('is-active');
      active = o || null;
      if (!active) { list.removeAttribute('aria-activedescendant'); return; }
      active.classList.add('is-active');
      list.setAttribute('aria-activedescendant', active.id);
      if (scroll) keepInList(active);
    };
    var select = function (o, silent) {
      options().forEach(function (x) { x.setAttribute('aria-selected', x === o ? 'true' : 'false'); });
      value = o ? o.getAttribute('data-value') : '';
      valueEl.textContent = o ? (o.getAttribute('data-label') || value) : placeholder;
      valueEl.classList.toggle('is-placeholder', !o);
      if (o) restart(valueEl, 'is-set');
      if (!silent && onChange) onChange(value, o);
    };
    var open = function () {
      if (root.classList.contains('is-open')) return;
      if (openDropdown && openDropdown !== api) openDropdown.close(false);
      openDropdown = api;
      index();
      root.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      list.focus({ preventScroll: true });
      setActive(list.querySelector('[aria-selected="true"]') || options()[0], true);
      /* Si la lista se sale por abajo, la pantalla baja lo justo para verla entera */
      requestAnimationFrame(function () {
        var r = $('.dd__pop', root).getBoundingClientRect();
        var overflow = r.bottom - (window.innerHeight - 16);
        if (overflow > 0) window.scrollBy({ top: overflow, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    };
    var close = function (focusBtn) {
      if (!root.classList.contains('is-open')) return;
      root.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      setActive(null);
      if (openDropdown === api) openDropdown = null;
      if (focusBtn) btn.focus({ preventScroll: true });
    };
    var move = function (step) {
      var all = options();
      if (!all.length) return;
      var i = all.indexOf(active);
      setActive(all[Math.max(0, Math.min(all.length - 1, i < 0 ? 0 : i + step))], true);
    };

    btn.addEventListener('click', function () { if (root.classList.contains('is-open')) close(true); else open(); });
    btn.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) > -1) { e.preventDefault(); open(); }
    });
    list.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (k === 'Home') { e.preventDefault(); setActive(options()[0], true); }
      else if (k === 'End') { e.preventDefault(); var all = options(); setActive(all[all.length - 1], true); }
      else if (k === 'PageDown') { e.preventDefault(); move(5); }
      else if (k === 'PageUp') { e.preventDefault(); move(-5); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (active) select(active); close(true); }
      else if (k === 'Escape') { e.preventDefault(); close(true); }
      else if (k === 'Tab') { if (active) select(active); close(false); }
      else if (k.length === 1 && /\S/.test(k)) {
        clearTimeout(typedTimer);
        typed += k.toLowerCase();
        typedTimer = setTimeout(function () { typed = ''; }, 600);
        var hit = options().filter(function (o) { return o.textContent.trim().toLowerCase().indexOf(typed) === 0; })[0];
        if (hit) setActive(hit, true);
      }
    });
    list.addEventListener('click', function (e) {
      var o = e.target.closest('[role="option"]');
      if (!o) return;
      select(o);
      close(true);
    });
    list.addEventListener('pointermove', function (e) {
      var o = e.target.closest('[role="option"]');
      if (o && o !== active) setActive(o, false);
    });
    document.addEventListener('pointerdown', function (e) { if (!root.contains(e.target)) close(false); });
    root.addEventListener('focusout', function (e) { if (e.relatedTarget && !root.contains(e.relatedTarget)) close(false); });

    api = {
      root: root,
      btn: btn,
      close: close,
      get value() { return value; },
      setValue: function (v, silent) {
        var o = options().filter(function (x) { return x.getAttribute('data-value') === v; })[0] || null;
        select(o, silent);
        return !!o;
      },
      setOptions: function (htmlString) {
        var keep = value;
        list.innerHTML = htmlString;
        list.scrollTop = 0;
        if (!api.setValue(keep, true)) select(null, true);
      },
      flash: function () { restart(root, 'is-flash'); }
    };
    return api;
  }
  /* Bloque de opciones para un desplegable generado aquí (días y horas) */
  var optionHTML = function (key, i, value, main, sub, label) {
    return '<div class="dd__opt" role="option" id="o-' + key + '-' + i + '" aria-selected="false" data-value="' + value + '"' +
      (label ? ' data-label="' + label + '"' : '') + '><span>' + main + '</span>' + (sub ? '<small>' + sub + '</small>' : '') +
      '<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-check"/></svg></div>';
  };

  /* ---------- Reserva por WhatsApp ---------- */
  var form = $('#form-reserva');
  var done = $('#form-done');
  if (form && done) {
    var nameInput = $('#f-nombre', form);
    var note = $('#f-nota', form);
    var autoNote = '';
    var now = madridNow();
    var dayInfo = {};

    var serviceDD = Dropdown($('#dd-servicio'), function () { clearError(rules[0]); });
    var hourDD = Dropdown($('#dd-hora'), function () { clearError(rules[1]); });
    var rules = [
      { el: serviceDD.btn, error: $('#e-servicio', form), valid: function () { return serviceDD.value !== ''; } },
      { el: hourDD.btn, error: $('#e-hora', form), valid: function () { return hourDD.value !== ''; } },
      { el: nameInput, error: $('#e-nombre', form), valid: function () { return nameInput.value.trim().length >= 2; } }
    ];

    /* Próximos días que abre: hoy solo si queda alguna hora libre dentro de media hora */
    var dayItems = [];
    for (var k = 0; dayItems.length < 10 && k < 21; k++) {
      var day = dayFrom(now, k);
      var from = k === 0 ? now.mins + SLOT : 0;
      if (!slotsFor(day.dow, from).length) continue;
      var long = DAYS[day.dow] + ' ' + day.date + ' de ' + MONTHS[day.month];
      var short = DAYS_SHORT[day.dow] + ' ' + day.date + ' ' + MONTHS_SHORT[day.month];
      var main = k === 0 ? 'Hoy' : k === 1 ? 'Mañana' : DAYS[day.dow].charAt(0).toUpperCase() + DAYS[day.dow].slice(1);
      var value = k === 0 ? 'hoy, ' + long : k === 1 ? 'mañana, ' + long : 'el ' + long;
      var label = k < 2 ? main + ', ' + short : main + ' ' + day.date + ' ' + MONTHS_SHORT[day.month];
      dayInfo[value] = { dow: day.dow, from: from };
      dayItems.push(optionHTML('dia', dayItems.length, value, main, k < 2 ? short : day.date + ' ' + MONTHS_SHORT[day.month], label));
    }
    dayItems.push(optionHTML('dia', dayItems.length, 'otro', 'Otro día', 'Lo hablamos', 'Otro día, lo hablamos'));

    var fillHours = function (dayValue) {
      var info = dayInfo[dayValue];
      if (!info) {
        hourDD.setOptions('<div class="dd__grp" role="group" aria-label="Hora"><div class="dd__items">' +
          optionHTML('hora', 0, 'lo hablamos', 'Lo hablamos', '', 'Lo hablamos') + '</div></div>');
        hourDD.setValue('lo hablamos', true);
        clearError(rules[1]);
        return;
      }
      var n = 0;
      var groups = slotsFor(info.dow, info.from).map(function (list) {
        var part = list[0] < 15 * 60 ? 'Por la mañana' : 'Por la tarde';
        return '<div class="dd__grp" role="group" aria-label="' + part + '"><div class="dd__items">' +
          list.map(function (t) { return optionHTML('hora', n++, clock(t), clock(t), '', ''); }).join('') + '</div></div>';
      });
      hourDD.setOptions(groups.join(''));
    };
    var dayDD = Dropdown($('#dd-dia'), function (v) { fillHours(v); });
    var dayList = $('#lb-dia');
    dayList.innerHTML = dayItems.join('');
    dayDD.setValue(Object.keys(dayInfo)[0] || 'otro', true);
    fillHours(dayDD.value);

    /* Botones «Reservar» de la carta y «Pedir diagnóstico» de la carta de colores */
    var prefill = function (serviceName, noteText) {
      serviceDD.setValue(serviceName, true);
      serviceDD.flash();
      clearError(rules[0]);
      if (noteText !== undefined && (note.value === '' || note.value === autoNote)) {
        note.value = noteText; autoNote = noteText;
      }
    };
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-book]');
      if (!trigger) return;
      var isTone = trigger === toneBook;
      prefill(trigger.getAttribute('data-book'), isTone && current
        ? 'Me interesa el tono ' + (current.getAttribute('data-code') === 'Plata' ? '' : current.getAttribute('data-code') + ' ') + current.getAttribute('data-name') + '.'
        : undefined);
      if (!done.hidden) resetForm(false);
      if (trigger.tagName === 'BUTTON') {
        $('#reserva').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      setTimeout(function () { serviceDD.btn.focus({ preventScroll: true }); }, 10);
    });

    var setState = function (rule, ok) { rule.el.setAttribute('aria-invalid', ok ? 'false' : 'true'); rule.error.hidden = ok; };
    function clearError(rule) { if (!rule) return; rule.el.removeAttribute('aria-invalid'); rule.error.hidden = true; }
    nameInput.addEventListener('input', function () {
      if (nameInput.getAttribute('aria-invalid') === 'true' && rules[2].valid()) setState(rules[2], true);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      rules.forEach(function (rule) {
        var ok = rule.valid();
        setState(rule, ok);
        if (!ok) {
          restart(rule.el.closest('.field'), 'is-shake');
          if (!firstInvalid) firstInvalid = rule.el;
        }
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var name = nameInput.value.trim().replace(/\s+/g, ' ');
      var lines = [
        'Hola, soy ' + name + '. Quiero pedir cita en Lienzo.',
        'Servicio: ' + serviceDD.value,
        'Día: ' + (dayDD.value === 'otro' || !dayDD.value ? 'otro día, lo hablamos' : dayDD.value),
        'Hora: ' + hourDD.value
      ];
      if (note.value.trim()) lines.push('Nota: ' + note.value.trim().replace(/\s+/g, ' '));
      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));

      $('#wa-again', done).href = url;
      window.open(url, '_blank', 'noopener');
      form.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
    });

    var resetForm = function (focusName) {
      form.reset();
      autoNote = '';
      serviceDD.setValue('', true);
      dayDD.setValue(Object.keys(dayInfo)[0] || 'otro', true);
      fillHours(dayDD.value);
      hourDD.setValue('', true);
      rules.forEach(clearError);
      done.hidden = true;
      form.hidden = false;
      if (focusName) nameInput.focus();
    };
    $('#form-reset', done).addEventListener('click', function () { resetForm(true); });
  }

  /* ---------- Abierto o cerrado ahora (estado real según el horario) ---------- */
  var status = $('#status');
  if (status) {
    var n = madridNow();
    var today = HOURS[dayFrom(n, 0).dow] || [];
    var openNow = today.filter(function (s) { return n.mins >= s[0] && n.mins < s[1]; })[0];
    if (openNow) {
      status.textContent = 'Abierto ahora, hasta las ' + clock(openNow[1]);
      status.classList.add('is-open');
    } else {
      var msg = '';
      for (var j = 0; j < 8 && !msg; j++) {
        var dd = dayFrom(n, j);
        var sl = HOURS[dd.dow];
        if (!sl) continue;
        for (var s = 0; s < sl.length; s++) {
          if (j > 0 || sl[s][0] > n.mins) {
            var when = j === 0 ? 'hoy' : j === 1 ? 'mañana' : 'el ' + DAYS[dd.dow];
            msg = 'Cerrado ahora. Abrimos ' + when + ' a las ' + clock(sl[s][0]);
            break;
          }
        }
      }
      status.textContent = msg;
    }
    status.hidden = false;
  }

  /* ---------- Animaciones al aparecer en pantalla ----------
     Todo es visible por defecto. Solo lo que aún está por debajo de la pantalla se prepara
     para entrar; si este script no carga o el visitante pide menos movimiento, no se oculta nada. */
  if (hasIO && !reduceMotion) {
    var splitWords = function (el) {
      if (el.querySelector('.w')) return;
      var words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', el.textContent.trim());
      el.innerHTML = words.map(function (w, i) {
        return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
      }).join(' ');
      el.classList.add('split');
    };
    var counters = {
      score: function (el) {
        var num = $('.score__num', el);
        if (!num) return;
        var target = 4.9;
        var start = performance.now();
        var step = function (t) {
          var p = Math.min(1, (t - start) / 1500);
          var eased = 1 - Math.pow(1 - p, 4);
          num.textContent = (target * eased).toFixed(1).replace('.', ',');
          if (p < 1) requestAnimationFrame(step);
        };
        num.textContent = '0,0';
        setTimeout(function () { requestAnimationFrame(step); }, 250);
      }
    };
    var plan = [
      ['.section', 'line', false],
      ['.section h2', 'words', false],
      ['.section__head p', 'up', false],
      ['.proof__list > li', 'up', true],
      ['.tabs', 'up', false],
      ['.panel:not([hidden]) .menu__item', 'up', true],
      ['.fine', 'fade', false],
      ['.carta__media, .visit__media, .reviews__media', 'curtain', false],
      ['.chart__ring', 'hang', false],
      ['.chart__swap > *, #tone-book', 'up', true],
      ['.flow > li', 'up', true],
      ['.team__copy > p', 'up', true],
      ['.crew > li', 'photo', true],
      ['.score', 'up', false, 'score'],
      ['.quotes > li', 'up', true],
      ['.faq details', 'up', true],
      ['.form-card', 'rise', false],
      ['.form > .field, .form__row > .field, .form > .btn', 'up', true],
      ['.info > *', 'up', true],
      ['.footer__top > *, .footer__nav a, .footer__bottom > *', 'up', true]
    ];
    var limit = window.innerHeight * 0.94;
    var byTrigger = new Map();
    var reveal = function (el) {
      if (!el.classList.contains('rv') || el.classList.contains('is-in')) return;
      el.classList.add('is-in');
      var counter = el.getAttribute('data-count');
      if (counter && counters[counter]) counters[counter](el);
      var delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
      /* Al terminar, se limpian las clases para que los efectos al pasar el ratón no hereden el retraso */
      setTimeout(function () {
        el.classList.remove('rv', 'is-in');
        el.removeAttribute('data-rv');
        el.style.removeProperty('--d');
      }, delay * 1000 + 2800);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        (byTrigger.get(entry.target) || []).forEach(reveal);
        byTrigger.delete(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

    plan.forEach(function (step) {
      var groups = new Map();
      $$(step[0]).forEach(function (el) {
        if (el.classList.contains('rv')) return;
        if (el.getBoundingClientRect().top < limit) return;
        if (step[1] === 'words') splitWords(el);
        var parent = el.parentNode;
        var i = groups.get(parent) || 0;
        groups.set(parent, i + 1);
        el.classList.add('rv');
        el.setAttribute('data-rv', step[1]);
        if (step[2]) el.style.setProperty('--d', (Math.min(i, 8) * 0.075).toFixed(3) + 's');
        if (step[3]) el.setAttribute('data-count', step[3]);
        /* Grupos y fotos recortadas se disparan desde su contenedor: así entran juntos, escalonados,
           y también los que están fuera por los lados (equipo deslizable en móvil) */
        var trigger = (step[2] || step[1] === 'curtain' || step[1] === 'photo') ? parent : el;
        if (!byTrigger.has(trigger)) { byTrigger.set(trigger, []); io.observe(trigger); }
        byTrigger.get(trigger).push(el);
      });
    });

    /* Al llegar al final de la página entra todo lo que quede (pie incluido) */
    var end = document.createElement('div');
    end.setAttribute('aria-hidden', 'true');
    end.style.cssText = 'height:1px;';
    document.body.appendChild(end);
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) $$('.rv').forEach(reveal);
    }).observe(end);
  }
})();
