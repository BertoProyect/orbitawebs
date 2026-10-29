/* Marisma Clínica Dental: comportamiento de la página. Sin dependencias. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Línea inferior de la navegación al hacer scroll */
  var nav = $('.nav');
  if (nav && hasIO) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:4px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
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

    var tweenFee = function (target) {
      cancelAnimationFrame(frame);
      if (reduceMotion) { shown = target; feeOut.textContent = formatFee(target); return; }
      var from = shown;
      var start = performance.now();
      var duration = 320;
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
      tweenFee(fee);
      clearTimeout(srTimer);
      srTimer = setTimeout(function () {
        srOut.textContent = 'Cuota de ' + formatFee(fee) + ' euros al mes durante ' + months + ' meses.';
      }, 500);
    };

    range.addEventListener('input', renderCalc);
    calc.addEventListener('change', function (e) { if (e.target.name === 'plazo') renderCalc(); });
    renderCalc();
  }

  /* Formulario de cita */
  var form = $('#form-cita');
  var done = $('#form-done');
  if (form && done) {
    var nameInput = $('#f-nombre', form);
    var telInput = $('#f-tel', form);
    var privInput = $('#f-priv', form);

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
      if (firstInvalid) { firstInvalid.focus(); return; }

      var firstName = nameInput.value.trim().split(/\s+/)[0];
      var franja = form.querySelector('input[name="franja"]:checked');
      $('[data-name]', done).textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      $('[data-franja]', done).textContent = franja && franja.value === 'tarde' ? 'por la tarde' : 'por la mañana';
      form.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
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
