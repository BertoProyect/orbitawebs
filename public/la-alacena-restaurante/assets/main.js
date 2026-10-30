/* La Alacena: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var WHATSAPP = '34959807018';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var hasIO = 'IntersectionObserver' in window;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var restart = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- Fecha y hora del restaurante (Europe/Madrid), sea cual sea la zona del visitante ---------- */
  var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  /* Horario de apertura en minutos desde medianoche (0 = domingo). Lunes cerrado. */
  var OPEN = {
    0: [[780, 990]],
    2: [[780, 990], [1200, 1410]], 3: [[780, 990], [1200, 1410]], 4: [[780, 990], [1200, 1410]],
    5: [[780, 990], [1200, 1410]], 6: [[780, 990], [1200, 1410]]
  };
  /* Horas a las que se puede reservar: comidas de 13:30 a 15:30 y cenas de 20:30 a 22:30 */
  var LUNCH = [810, 840, 870, 900, 930];
  var DINNER = [1230, 1260, 1290, 1320, 1350];
  var seatsFor = function (dow, fromMins) {
    if (!OPEN[dow]) return [];
    var groups = [{ label: 'Comidas', list: LUNCH }];
    if (OPEN[dow].length > 1) groups.push({ label: 'Cenas', list: DINNER });
    return groups.map(function (g) {
      return { label: g.label, list: g.list.filter(function (t) { return t >= fromMins; }) };
    }).filter(function (g) { return g.list.length; });
  };

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
  var NOW = madridNow();

  /* ---------- Navegación: transparente sobre la portada, sólida al bajar ---------- */
  var nav = $('.nav');
  if (nav && hasIO && !nav.classList.contains('is-scrolled')) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:48px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- Barra fija en móvil: aparece al dejar atrás la portada y se oculta en la reserva y el pie ---------- */
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

  /* ---------- Menú del día: la pizarra muestra el de hoy (o el próximo) ---------- */
  var MENUS = {
    2: { p: ['Potaje de garbanzos con espinacas', 'Ensalada de tomate y melva', 'Arroz caldoso de verduras'],
         s: ['Choco a la plancha con alioli', 'Pollo de corral al ajillo', 'Pescado del día con patatas a lo pobre'],
         d: 'Flan de huevo casero o fruta' },
    3: { p: ['Lentejas estofadas', 'Salmorejo con huevo y jamón', 'Espárragos trigueros a la plancha'],
         s: ['Albóndigas de choco en salsa', 'Secreto ibérico con pimientos', 'Merluza en salsa verde'],
         d: 'Arroz con leche o fruta' },
    4: { p: ['Puchero con su pringá', 'Ensalada de pimientos asados', 'Revuelto de espárragos'],
         s: ['Caballa a la brasa', 'Carrillada al vino tinto', 'Pollo en pepitoria'],
         d: 'Natillas o fruta' },
    5: { p: ['Crema de calabaza', 'Sopa de pescado', 'Ensalada de bacalao y naranja'],
         s: ['Pescaíto frito variado', 'Pez espada a la plancha', 'Solomillo de cerdo al whisky'],
         d: 'Tocino de cielo o fruta' }
  };
  /* El menú se sirve a mediodía: pasadas las 16:00 se enseña el del siguiente día con menú */
  var menuDay = null;
  for (var mk = 0; mk < 8 && !menuDay; mk++) {
    var md = dayFrom(NOW, mk);
    if (MENUS[md.dow] && (mk > 0 || NOW.mins < 960)) menuDay = { k: mk, dow: md.dow, date: md.date, month: md.month };
  }
  var pizarra = $('#pizarra');
  if (pizarra && menuDay) {
    var menu = MENUS[menuDay.dow];
    var lis = function (items) { return items.map(function (t) { return '<li class="chalk">' + t + '</li>'; }).join(''); };
    $('#menu-primeros').innerHTML = lis(menu.p);
    $('#menu-segundos').innerHTML = lis(menu.s);
    $('#menu-postre').innerHTML = lis([menu.d]);
    var when = DAYS[menuDay.dow] + ' ' + menuDay.date + ' de ' + MONTHS[menuDay.month];
    $('#menu-date').textContent = menuDay.k === 0 ? 'Hoy, ' + when : menuDay.k === 1 ? 'Mañana, ' + when : cap(when);
  }

  /* ---------- Carta: pestañas con indicador que se desliza ---------- */
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
    window.addEventListener('alacena:counts', function () { placeThumb(currentTab); });
  }

  /* ---------- Filtro de alérgenos: apaga los platos que llevan lo que has marcado ---------- */
  var algToggle = $('#alg-toggle');
  var algPanel = $('#alg-panel');
  if (algToggle && algPanel) {
    var chips = $$('.chip', algPanel);
    var dishes = $$('.dish');
    var sum = $('#alg-sum');
    var clearBtn = $('#alg-clear');
    var count = $('#alg-count');
    var names = {};
    chips.forEach(function (c) { names[c.getAttribute('data-alg')] = c.getAttribute('data-name'); });
    var joinList = function (arr, last) {
      return arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + (last || ' y ') + arr[arr.length - 1];
    };

    algToggle.addEventListener('click', function () {
      var open = algToggle.getAttribute('aria-expanded') !== 'true';
      algToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      algPanel.hidden = !open;
      if (open) restart(algPanel, 'is-in');
    });

    var apply = function () {
      var marked = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })
        .map(function (c) { return c.getAttribute('data-alg'); });
      var ok = 0;
      dishes.forEach(function (d) {
        var has = (d.getAttribute('data-alg') || '').split(' ').filter(Boolean);
        var hits = marked.filter(function (a) { return has.indexOf(a) > -1; });
        var out = hits.length > 0;
        d.classList.toggle('is-out', out);
        var flag = $('.dish__flag', d);
        if (flag) flag.textContent = out ? 'Lleva ' + joinList(hits.map(function (a) { return names[a]; })) : '';
        if (!out) ok++;
      });
      /* Cuántos platos aptos quedan en cada pestaña */
      $$('.tab').forEach(function (t) {
        var n = $('.tab__n', t);
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        var left = $$('.dish:not(.is-out)', panel).length;
        n.textContent = left;
        n.hidden = marked.length === 0;
      });
      count.textContent = marked.length;
      count.hidden = marked.length === 0;
      clearBtn.hidden = marked.length === 0;
      sum.textContent = marked.length === 0 ? '' :
        'Puedes pedir ' + ok + ' de ' + dishes.length + ' platos sin ' + joinList(marked.map(function (a) { return names[a]; }), ' ni ') + '.';
      window.dispatchEvent(new Event('alacena:counts'));
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        apply();
      });
    });
    clearBtn.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      apply();
      chips[0].focus();
    });
    apply();
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
  var optionHTML = function (key, i, value, main, sub, label) {
    return '<div class="dd__opt" role="option" id="o-' + key + '-' + i + '" aria-selected="false" data-value="' + value + '"' +
      (label ? ' data-label="' + label + '"' : '') + '><span>' + main + '</span>' + (sub ? '<small>' + sub + '</small>' : '') +
      '<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-check"/></svg></div>';
  };

  /* ---------- Reserva de mesa por WhatsApp ---------- */
  var form = $('#form-reserva');
  var done = $('#form-done');
  if (form && done) {
    var nameInput = $('#f-nombre', form);
    var note = $('#f-nota', form);
    var autoNote = '';
    var dayInfo = {};
    var dayByK = {};

    var peopleDD = Dropdown($('#dd-personas'), function () { clearError(rules[0]); });
    var hourDD = Dropdown($('#dd-hora'), function () { clearError(rules[1]); });
    var rules = [
      { el: peopleDD.btn, error: $('#e-personas', form), valid: function () { return peopleDD.value !== ''; } },
      { el: hourDD.btn, error: $('#e-hora', form), valid: function () { return hourDD.value !== ''; } },
      { el: nameInput, error: $('#e-nombre', form), valid: function () { return nameInput.value.trim().length >= 2; } }
    ];

    /* Próximos días que abre: hoy solo si queda alguna hora libre dentro de media hora */
    var dayItems = [];
    for (var k = 0; dayItems.length < 12 && k < 21; k++) {
      var day = dayFrom(NOW, k);
      var from = k === 0 ? NOW.mins + 30 : 0;
      if (!seatsFor(day.dow, from).length) continue;
      var long = DAYS[day.dow] + ' ' + day.date + ' de ' + MONTHS[day.month];
      var short = DAYS_SHORT[day.dow] + ' ' + day.date + ' ' + MONTHS_SHORT[day.month];
      var main = k === 0 ? 'Hoy' : k === 1 ? 'Mañana' : cap(DAYS[day.dow]);
      var value = k === 0 ? 'hoy, ' + long : k === 1 ? 'mañana, ' + long : 'el ' + long;
      var label = k < 2 ? main + ', ' + short : main + ' ' + day.date + ' ' + MONTHS_SHORT[day.month];
      dayInfo[value] = { dow: day.dow, from: from };
      dayByK[k] = value;
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
      hourDD.setOptions(seatsFor(info.dow, info.from).map(function (g, gi) {
        return '<div class="dd__grp" role="group" aria-labelledby="g-hora-' + gi + '"><span class="dd__grp-label" id="g-hora-' + gi + '">' + g.label + '</span><div class="dd__items">' +
          g.list.map(function (t) { return optionHTML('hora', n++, clock(t), clock(t), '', ''); }).join('') + '</div></div>';
      }).join(''));
    };
    var dayDD = Dropdown($('#dd-dia'), function (v) { fillHours(v); });
    $('#lb-dia').innerHTML = dayItems.join('');
    var firstDay = Object.keys(dayInfo)[0] || 'otro';
    dayDD.setValue(firstDay, true);
    fillHours(dayDD.value);

    var setNote = function (text) {
      if (note.value === '' || note.value === autoNote) { note.value = text; autoNote = text; }
    };
    var goToForm = function (trigger, focusEl) {
      if (!done.hidden) resetForm(false);
      if (trigger.tagName === 'BUTTON') $('#reserva').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(function () { focusEl.focus({ preventScroll: true }); }, 10);
    };

    /* «Reservar para el menú»: el día del menú de la pizarra, a las 14:00 */
    document.addEventListener('click', function (e) {
      var menuBtn = e.target.closest('[data-menu-book]');
      var groupBtn = e.target.closest('[data-group]');
      if (menuBtn) {
        goToForm(menuBtn, peopleDD.btn);
        if (menuDay && dayByK[menuDay.k] !== undefined) {
          dayDD.setValue(dayByK[menuDay.k], true);
          fillHours(dayDD.value);
          if (hourDD.setValue('14:00', true)) clearError(rules[1]);
          dayDD.flash();
        }
        setNote('Venimos a por el menú del día.');
      } else if (groupBtn) {
        goToForm(groupBtn, peopleDD.btn);
        setNote('Somos un grupo y nos interesa el ' + groupBtn.getAttribute('data-group') + '.');
        peopleDD.flash();
      }
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
        'Hola, soy ' + name + '. Quiero reservar mesa en La Alacena.',
        'Personas: ' + peopleDD.value,
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

    var resetForm = function (focusFirst) {
      form.reset();
      autoNote = '';
      peopleDD.setValue('', true);
      dayDD.setValue(firstDay, true);
      fillHours(dayDD.value);
      hourDD.setValue('', true);
      rules.forEach(clearError);
      done.hidden = true;
      form.hidden = false;
      if (focusFirst) peopleDD.btn.focus();
    };
    $('#form-reset', done).addEventListener('click', function () { resetForm(true); });
  }

  /* ---------- Abierto o cerrado ahora (estado real según el horario) ---------- */
  var status = $('#status');
  if (status) {
    var today = OPEN[dayFrom(NOW, 0).dow] || [];
    var openNow = today.filter(function (s) { return NOW.mins >= s[0] && NOW.mins < s[1]; })[0];
    if (openNow) {
      status.textContent = 'Abierto ahora, hasta las ' + clock(openNow[1]);
      status.classList.add('is-open');
    } else {
      var msg = '';
      for (var j = 0; j < 8 && !msg; j++) {
        var dd = dayFrom(NOW, j);
        var sl = OPEN[dd.dow];
        if (!sl) continue;
        for (var s = 0; s < sl.length; s++) {
          if (j > 0 || sl[s][0] > NOW.mins) {
            var whenTxt = j === 0 ? 'hoy' : j === 1 ? 'mañana' : 'el ' + DAYS[dd.dow];
            msg = 'Cerrado ahora. Abrimos ' + whenTxt + ' a las ' + clock(sl[s][0]);
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
        var target = 4.8;
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
    /* [selector, efecto, escalonado, contador, disparador] */
    var plan = [
      ['.section h2, .reviews h2', 'words', false],
      ['.section__head p', 'up', false],
      ['.proof__list > li', 'up', true],
      ['.pizarra', 'hang', false],
      ['.pizarra .chalk, .pizarra .pizarra__date, .pizarra__note', 'chalk', true, null, '.pizarra'],
      ['.pizarra__price', 'ring', false, null, '.pizarra'],
      ['.today__photo', 'curtain', false],
      ['.today__aside > p, .today__aside > .btn', 'up', true],
      ['.alg', 'up', false],
      ['.tabs', 'up', false],
      ['.panel:not([hidden]) .dish', 'up', true],
      ['.carta__fine', 'fade', false],
      ['.carta__media, .market__media, .groups__media, .reviews__media', 'curtain', false],
      ['.day > li', 'up', true],
      ['.ticket', 'rise', true],
      ['.groups__note', 'fade', false],
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    plan.forEach(function (step) {
      var groups = new Map();
      var chalkIndex = 0;
      $$(step[0]).forEach(function (el) {
        if (el.classList.contains('rv')) return;
        var custom = step[4] ? el.closest(step[4]) : null;
        var box = (custom || el).getBoundingClientRect();
        if (box.top < limit) return;
        if (step[1] === 'words') splitWords(el);
        var parent = el.parentNode;
        var i = groups.get(parent) || 0;
        groups.set(parent, i + 1);
        el.classList.add('rv');
        el.setAttribute('data-rv', step[1]);
        /* La tiza escribe en orden de lectura, después de que la pizarra se asiente */
        if (step[1] === 'chalk') el.style.setProperty('--d', (0.55 + chalkIndex++ * 0.16).toFixed(2) + 's');
        else if (step[1] === 'ring') el.style.setProperty('--d', (0.55 + $$('.pizarra .chalk').length * 0.16).toFixed(2) + 's');
        else if (step[2]) el.style.setProperty('--d', (Math.min(i, 8) * 0.075).toFixed(3) + 's');
        if (step[3]) el.setAttribute('data-count', step[3]);
        var trigger = custom || ((step[2] || step[1] === 'curtain') ? parent : el);
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
