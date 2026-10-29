/* Salitre Peluquería: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var WHATSAPP = '34959807018';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var hasIO = 'IntersectionObserver' in window;
  var restart = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- Fecha y hora de Huelva (Europe/Madrid), sea cual sea la zona del visitante ---------- */
  var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  /* Horario en minutos desde medianoche, por día de la semana (0 = domingo) */
  var HOURS = { 2: [[570, 840], [990, 1230]], 3: [[570, 840], [990, 1230]], 4: [[570, 840], [990, 1230]], 5: [[570, 840], [990, 1230]], 6: [[540, 840]] };

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
  /* Día de calendario desplazado k días, calculado en UTC para no depender de la zona del visitante */
  var dayFrom = function (now, k) {
    var t = new Date(Date.UTC(now.y, now.m - 1, now.d + k));
    return { dow: t.getUTCDay(), date: t.getUTCDate(), month: t.getUTCMonth() };
  };
  var clock = function (mins) { return Math.floor(mins / 60) + ':' + ('0' + (mins % 60)).slice(-2); };

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

  /* ---------- Carta de servicios: pestañas ---------- */
  var tabsRoot = $('[data-tabs]');
  if (tabsRoot) {
    var tabs = $$('[role="tab"]', tabsRoot);
    var media = $$('[data-media]');
    var selectTab = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      restart(document.getElementById(tab.getAttribute('aria-controls')), 'is-in');
      media.forEach(function (img) { img.classList.toggle('is-active', img.getAttribute('data-media') === tab.getAttribute('data-tab')); });
      if (focus) tab.focus();
      var list = tab.parentNode;
      var left = tab.offsetLeft - list.offsetLeft;
      if (left < list.scrollLeft || left + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
        list.scrollTo({ left: Math.max(0, left - 20), behavior: 'smooth' });
      }
    };
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

  /* ---------- Reserva por WhatsApp ---------- */
  var form = $('#form-reserva');
  var done = $('#form-done');
  if (form && done) {
    var service = $('#f-servicio', form);
    var nameInput = $('#f-nombre', form);
    var note = $('#f-nota', form);
    var daysBox = $('#f-dias', form);
    var otherDay = $('#dia-otro', form);
    var morning = $('#franja-m', form);
    var afternoon = $('#franja-t', form);
    var satHint = $('#h-sabado', form);
    var autoNote = '';
    var now = madridNow();

    /* Próximos seis días con hueco (de martes a sábado) */
    var added = 0;
    for (var k = 0; added < 6 && k < 14; k++) {
      var day = dayFrom(now, k);
      var slots = HOURS[day.dow];
      if (!slots) continue;
      if (k === 0 && now.mins >= slots[slots.length - 1][1] - 30) continue;
      var id = 'dia-' + k;
      var long = DAYS[day.dow] + ' ' + day.date + ' de ' + MONTHS[day.month];
      var value = k === 0 ? 'hoy, ' + long : k === 1 ? 'mañana, ' + long : 'el ' + long;
      var top = k === 0 ? 'Hoy' : k === 1 ? 'Mañana' : DAYS_SHORT[day.dow].charAt(0).toUpperCase() + DAYS_SHORT[day.dow].slice(1);
      var input = document.createElement('input');
      input.type = 'radio'; input.name = 'dia'; input.id = id; input.value = value;
      input.setAttribute('data-dow', day.dow);
      if (k === 0) input.setAttribute('data-today', '');
      var label = document.createElement('label');
      label.htmlFor = id;
      label.innerHTML = top + '<small>' + (k < 2 ? DAYS_SHORT[day.dow] + ' ' : '') + day.date + ' ' + MONTHS_SHORT[day.month] + '</small>';
      daysBox.insertBefore(label, otherDay);
      daysBox.insertBefore(input, label);
      if (added === 0) input.checked = true;
      added++;
    }

    /* Los sábados solo por la mañana; hoy, solo las franjas que aún no han pasado */
    var syncSlots = function () {
      var picked = form.querySelector('input[name="dia"]:checked');
      var dow = picked && picked.hasAttribute('data-dow') ? +picked.getAttribute('data-dow') : -1;
      var isToday = picked && picked.hasAttribute('data-today');
      var noAfternoon = dow === 6;
      var noMorning = isToday && now.mins >= 13 * 60 + 30;
      afternoon.disabled = noAfternoon;
      morning.disabled = noMorning && !noAfternoon;
      if (afternoon.disabled && afternoon.checked) morning.checked = true;
      if (morning.disabled && morning.checked) afternoon.checked = true;
      satHint.hidden = !noAfternoon;
    };
    daysBox.addEventListener('change', syncSlots);
    syncSlots();

    /* Botones «Reservar» de la carta y «Pedir diagnóstico» de la carta de colores */
    var prefill = function (serviceName, noteText) {
      service.value = serviceName;
      if (service.value !== serviceName) service.selectedIndex = 0;
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
        $('#reserva').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
      setTimeout(function () { service.focus({ preventScroll: true }); }, 10);
    });

    var rules = [
      { el: service, error: $('#e-servicio', form), valid: function () { return service.value !== ''; } },
      { el: nameInput, error: $('#e-nombre', form), valid: function () { return nameInput.value.trim().length >= 2; } }
    ];
    var setState = function (rule, ok) { rule.el.setAttribute('aria-invalid', ok ? 'false' : 'true'); rule.error.hidden = ok; };
    function clearError(rule) { rule.el.removeAttribute('aria-invalid'); rule.error.hidden = true; }
    rules.forEach(function (rule) {
      var evt = rule.el.tagName === 'SELECT' ? 'change' : 'input';
      rule.el.addEventListener(evt, function () {
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
      if (firstInvalid) { firstInvalid.focus(); return; }

      var name = nameInput.value.trim().replace(/\s+/g, ' ');
      var day = form.querySelector('input[name="dia"]:checked');
      var slot = form.querySelector('input[name="franja"]:checked');
      var lines = [
        'Hola, soy ' + name + '. Quiero pedir cita en Salitre.',
        'Servicio: ' + service.value,
        'Día: ' + (!day || day.value === 'otro' ? 'otro día, lo hablamos' : day.value),
        'Hora: ' + (slot ? slot.value : 'me da igual')
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
      var first = form.querySelector('input[name="dia"]');
      if (first) first.checked = true;
      syncSlots();
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
    var open = today.filter(function (s) { return n.mins >= s[0] && n.mins < s[1]; })[0];
    if (open) {
      status.textContent = 'Abierto ahora, hasta las ' + clock(open[1]);
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
})();
