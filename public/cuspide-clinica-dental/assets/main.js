/* Cúspide Clínica Dental: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var motion = !reduceMotion && hasIO;
  var each = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };

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
    var revealRest = function () {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      var k = 0;
      each('[data-reveal]:not(.is-in), [data-split]:not(.is-in)', function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el, k++);
      });
    };
    window.addEventListener('scroll', revealRest, { passive: true });
    revealRest();
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

  /* Navegación: transparente sobre la portada, blanca en cuanto la portada queda atrás */
  var nav = $('.nav');
  var hero = $('.hero');
  if (nav && hero && hasIO) {
    var heroObserver = null;
    var watchHero = function () {
      if (heroObserver) heroObserver.disconnect();
      var navH = nav.getBoundingClientRect().height || 64;
      heroObserver = new IntersectionObserver(function (entries) {
        nav.classList.toggle('is-solid', !entries[0].isIntersecting);
      }, { rootMargin: '-' + Math.round(navH) + 'px 0px 0px 0px' });
      heroObserver.observe(hero);
    };
    watchHero();
    window.matchMedia('(min-width: 768px)').addEventListener('change', watchHero);
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

  /* Calculadora de financiación */
  var calc = $('[data-calc]');
  if (calc) {
    var range = $('#calc-amount', calc);
    var amountOut = $('#calc-amount-out', calc);
    var feeOut = $('#calc-fee', calc);
    var totalOut = $('#calc-total', calc);
    var srOut = $('#calc-sr', calc);
    var whole = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
    var money = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var formatFee = function (n) {
      var rounded = Math.round(n * 100) / 100;
      return Number.isInteger(rounded) ? whole.format(rounded) : money.format(rounded);
    };
    var shown = 150;
    var frame = 0;
    var srTimer = 0;
    /* Con movimiento, la cuota arranca en 0 y sube al aparecer la calculadora */
    var calcVisible = !motion;
    var introDuration = 0;
    if (!calcVisible) { shown = 0; feeOut.textContent = '0'; }

    var tweenFee = function (target, duration) {
      cancelAnimationFrame(frame);
      if (reduceMotion) { shown = target; feeOut.textContent = formatFee(target); return; }
      var from = shown;
      var start = performance.now();
      duration = duration || 320;
      var step = function (now) {
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        shown = from + (target - from) * eased;
        feeOut.textContent = t < 1 ? whole.format(Math.round(shown)) : formatFee(target);
        if (t < 1) frame = requestAnimationFrame(step); else shown = target;
      };
      frame = requestAnimationFrame(step);
    };

    var renderCalc = function () {
      var amount = Number(range.value);
      var checked = calc.querySelector('input[name="plazo"]:checked');
      var months = checked ? Number(checked.value) : 12;
      var min = Number(range.min);
      var max = Number(range.max);
      var fee = amount / months;
      range.style.setProperty('--p', ((amount - min) / (max - min)) * 100 + '%');
      amountOut.textContent = whole.format(amount) + ' €';
      totalOut.textContent = months + ' cuotas. Total: ' + whole.format(amount) + ' €, sin intereses.';
      if (calcVisible) tweenFee(fee, introDuration);
      introDuration = 0;
      clearTimeout(srTimer);
      srTimer = setTimeout(function () {
        srOut.textContent = 'Cuota de ' + formatFee(fee) + ' euros al mes durante ' + months + ' meses.';
      }, 500);
    };

    range.addEventListener('input', renderCalc);
    calc.addEventListener('change', function (e) { if (e.target.name === 'plazo') renderCalc(); });
    renderCalc();
    if (!calcVisible) {
      calc.addEventListener('reveal', function () {
        setTimeout(function () {
          calcVisible = true;
          introDuration = 1400;
          renderCalc();
        }, 350);
      });
    }
  }

  /* Formulario de cita */
  var form = $('#form-cita');
  var done = $('#form-done');
  if (form && done) {
    var nameInput = $('#f-nombre', form);
    var telInput = $('#f-tel', form);
    var privInput = $('#f-priv', form);
    var submitBtn = $('button[type="submit"]', form);

    var rules = [
      { el: nameInput, error: $('#e-nombre', form), valid: function () { return nameInput.value.trim().length >= 2; } },
      { el: telInput, error: $('#e-tel', form), valid: function () {
          var digits = telInput.value.replace(/[\s.()-]/g, '').replace(/^(\+34|0034)/, '');
          return /^[6789]\d{8}$/.test(digits);
        } },
      { el: privInput, error: $('#e-priv', form), valid: function () { return privInput.checked; } }
    ];

    var setState = function (rule, ok) {
      rule.el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      rule.error.hidden = ok;
    };

    rules.forEach(function (rule) {
      var evt = rule.el.type === 'checkbox' ? 'change' : 'input';
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
      if (firstInvalid) { firstInvalid.focus(); shake(firstInvalid); return; }
      if (submitBtn.classList.contains('is-loading')) return;

      var firstName = nameInput.value.trim().split(/\s+/)[0];
      var franja = form.querySelector('input[name="franja"]:checked');
      $('[data-name]', done).textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      $('[data-franja]', done).textContent = franja && franja.value === 'tarde' ? 'por la tarde' : 'por la mañana';
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
      rules.forEach(function (rule) { rule.el.removeAttribute('aria-invalid'); rule.error.hidden = true; });
      done.hidden = true;
      form.hidden = false;
      nameInput.focus();
    });
  }
})();
