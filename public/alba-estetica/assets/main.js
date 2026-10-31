/* Alba Estética: comportamiento de la página. Sin dependencias. */
(() => {
  'use strict';

  const d = document;
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const motion = !reduce && hasIO;
  const fine = matchMedia('(pointer: fine)').matches;
  const WA = '34959807018';

  const fmtEur = (n) => (n === 0 ? 'Gratis' : `${String(Math.round(n * 100) / 100).replace('.', ',')} €`);
  const fmtMins = (m) => {
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return `${h} h${r ? ` ${r} min` : ''}`;
  };
  const pad = (n) => String(n).padStart(2, '0');
  const hm = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const tween = (from, to, dur, onUpdate, done) => {
    if (reduce || dur <= 0) { onUpdate(to); if (done) done(); return () => {}; }
    let raf, t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / dur);
      onUpdate(from + (to - from) * easeOutExpo(k));
      if (k < 1) raf = requestAnimationFrame(step); else if (done) done();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  };
  const swapClass = (el, cls, ms) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    clearTimeout(el['_t' + cls]);
    el['_t' + cls] = setTimeout(() => el.classList.remove(cls), ms);
  };
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };

  /* Hora de Huelva (Europe/Madrid), venga de donde venga la visita */
  const madridNow = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const g = (t) => +parts.find((p) => p.type === t).value;
      return new Date(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
    } catch (e) { return new Date(); }
  };
  const HOURS = { 1: [[600, 840], [990, 1230]], 2: [[600, 840], [990, 1230]], 3: [[600, 840], [990, 1230]], 4: [[600, 840], [990, 1230]], 5: [[600, 840], [990, 1230]], 6: [[600, 840]], 0: [] };
  const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /* ------------------------------------------------------------ catálogo y cita */
  let catalog = {};
  try { catalog = JSON.parse($('#catalog').textContent); } catch (e) { /* sin catálogo */ }

  const COLORS = [
    ['oklch(0.42 0.14 0)', '#fff'],
    ['oklch(0.82 0.1 55)', 'oklch(0.23 0.025 0)'],
    ['oklch(0.31 0.08 355)', '#fff'],
    ['oklch(0.87 0.045 10)', 'oklch(0.23 0.025 0)'],
    ['oklch(0.5 0.13 22)', '#fff'],
  ];

  const store = {
    items: [],
    subs: [],
    load() {
      const saved = ls.get('alba-cita-v1');
      if (Array.isArray(saved)) this.items = saved.filter((i) => i && i.id && (catalog[i.id] || i.id === 'laser'));
      this.items.forEach((it, n) => { if (it.c == null) it.c = n % COLORS.length; });
    },
    save() { ls.set('alba-cita-v1', this.items); },
    has(id) { return this.items.some((i) => i.id === id); },
    get(id) { return this.items.find((i) => i.id === id); },
    nextColor() {
      const used = this.items.map((i) => i.c);
      for (let c = 0; c < COLORS.length; c++) if (!used.includes(c)) return c;
      return this.items.length % COLORS.length;
    },
    put(item, info) {
      const ex = this.get(item.id);
      if (ex) Object.assign(ex, item); else this.items.push(Object.assign({ c: this.nextColor() }, item));
      this.save(); this.emit(Object.assign({ type: ex ? 'update' : 'add', id: item.id }, info));
    },
    add(id, info) {
      if (this.has(id) || !catalog[id]) return;
      const c = catalog[id];
      this.put({ id, name: c.name, mins: c.mins, price: c.price }, info);
    },
    remove(id) {
      if (!this.has(id)) return;
      this.items = this.items.filter((i) => i.id !== id);
      this.save(); this.emit({ type: 'remove', id });
    },
    clear() { this.items = []; this.save(); this.emit({ type: 'clear' }); },
    mins() { return this.items.reduce((s, i) => s + i.mins, 0); },
    price() { return this.items.reduce((s, i) => s + i.price, 0); },
    on(fn) { this.subs.push(fn); },
    emit(ev) { this.subs.forEach((fn) => fn(ev)); },
  };
  store.load();

  /* ------------------------------------------------------------ avisos */
  const toastEl = $('#toast');
  let toastT;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  };

  /* ------------------------------------------------------------ movimiento: entradas */
  if (motion) {
    d.documentElement.classList.add('motion');

    $$('[data-split]').forEach((el) => {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      const wrap = d.createElement('span');
      wrap.setAttribute('aria-hidden', 'true');
      text.split(' ').forEach((word, i) => {
        if (i) wrap.appendChild(d.createTextNode(' '));
        const w = d.createElement('span');
        w.className = 'w';
        const inner = d.createElement('span');
        inner.textContent = word;
        inner.style.setProperty('--wi', i);
        w.appendChild(inner);
        wrap.appendChild(w);
      });
      el.setAttribute('aria-label', text);
      el.textContent = '';
      el.appendChild(wrap);
    });
  }

  const revealHandlers = new Map();
  const onReveal = (el, fn) => { if (el) revealHandlers.set(el, fn); };
  const reveal = (el, k) => {
    if (el.classList.contains('is-in')) return;
    el.style.setProperty('--d', `${Math.min(k, 5) * 90}ms`);
    el.classList.add('is-in');
    const fn = revealHandlers.get(el);
    if (fn) fn();
  };
  const revealTargets = $$('[data-reveal], [data-split]');
  if (motion) {
    const io = new IntersectionObserver((entries) => {
      let k = 0;
      entries.forEach((e) => { if (e.isIntersecting) { reveal(e.target, k++); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealTargets.forEach((el) => io.observe(el));
    /* Al llegar al final, lo que quede por mostrar aparece igual */
    const end = d.createElement('div');
    end.setAttribute('aria-hidden', 'true');
    end.style.cssText = 'position:absolute;left:0;bottom:0;width:1px;height:1px;pointer-events:none';
    d.body.style.position = d.body.style.position || 'relative';
    d.body.appendChild(end);
    new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      let k = 0;
      revealTargets.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) reveal(el, k++); });
    }).observe(end);
    addEventListener('beforeprint', () => revealTargets.forEach((el) => el.classList.add('is-in')));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
    requestAnimationFrame(() => revealHandlers.forEach((fn) => fn()));
  }

  /* Contadores (4,9) */
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = +el.dataset.decimals || 0;
    const host = el.closest('[data-reveal]') || el;
    const run = () => tween(0, target, 1800, (v) => { el.textContent = v.toFixed(dec).replace('.', ','); });
    if (motion) { el.textContent = (0).toFixed(dec).replace('.', ','); const prev = revealHandlers.get(host); onReveal(host, () => { if (prev) prev(); run(); }); }
  });

  /* ------------------------------------------------------------ navegación */
  const nav = $('#nav');
  const sentinel = d.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none';
  d.body.prepend(sentinel);
  if (hasIO && nav) new IntersectionObserver((es) => nav.classList.toggle('is-solid', !es[0].isIntersecting)).observe(sentinel);

  const menuBtn = $('#menu-btn');
  const menu = $('#menu');
  let menuOpen = false;
  const setMenu = (open) => {
    if (!menu || open === menuOpen) return;
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar el menú' : 'Abrir el menú');
    nav.classList.toggle('is-open', open);
    d.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      menu.classList.remove('is-closing');
      swapClass(menu, 'is-opening', 800);
      const first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-opening');
      if (reduce) { menu.hidden = true; return; }
      menu.classList.add('is-closing');
      setTimeout(() => { menu.hidden = true; menu.classList.remove('is-closing'); }, 440);
    }
    updateDock();
  };
  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(!menuOpen));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });
    matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* Barra de progreso y paralaje suave de la portada */
  const bar = $('.progress span');
  const heroImg = $('.horizon__img');
  const horizon = $('#horizon');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = d.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      if (heroImg && fine && !reduce && horizon) {
        const r = horizon.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const p = (innerHeight - r.top) / (innerHeight + r.height);
          heroImg.style.translate = `0 ${((p - 0.5) * 12).toFixed(2)}%`;
        }
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------ cinta de la cita */
  const ribbonHTML = (host, startMins) => {
    const items = store.items;
    host.hidden = items.length === 0;
    if (!items.length) { host.innerHTML = ''; return; }
    let barEl = $('.ribbon__bar', host);
    if (!barEl) {
      host.innerHTML = '<div class="ribbon__bar" aria-hidden="true"></div><div class="ribbon__scale"></div>';
      barEl = $('.ribbon__bar', host);
    }
    const existing = new Map($$('.ribbon__seg', barEl).map((s) => [s.dataset.id, s]));
    items.forEach((it) => {
      let seg = existing.get(it.id);
      const [bg, fg] = COLORS[it.c % COLORS.length];
      if (!seg) {
        seg = d.createElement('div');
        seg.className = 'ribbon__seg is-new';
        seg.dataset.id = it.id;
        seg.style.flexGrow = '0';
        barEl.appendChild(seg);
        requestAnimationFrame(() => requestAnimationFrame(() => { seg.style.flexGrow = String(it.mins); }));
        setTimeout(() => seg.classList.remove('is-new'), 1000);
      } else {
        seg.style.flexGrow = String(it.mins);
        existing.delete(it.id);
        barEl.appendChild(seg);
      }
      seg.style.setProperty('--c', bg);
      seg.style.color = fg;
      seg.title = `${it.name} · ${fmtMins(it.mins).replace(/ /g, ' ')}`;
      seg.innerHTML = `<span>${it.short || it.name}</span>`;
    });
    existing.forEach((seg) => {
      seg.style.flexGrow = '0';
      seg.style.opacity = '0';
      setTimeout(() => seg.remove(), reduce ? 0 : 700);
    });
    const total = store.mins();
    const scale = $('.ribbon__scale', host);
    scale.innerHTML = startMins != null
      ? `<span><strong>${hm(startMins)}</strong></span><span>${fmtMins(total)}</span><span>Terminas sobre las <strong>${hm(startMins + total)}</strong></span>`
      : `<span>Duración</span><span><strong>${fmtMins(total)}</strong></span>`;
  };

  const listHTML = (host) => {
    const ids = store.items.map((i) => i.id);
    $$('li', host).forEach((li) => {
      if (!ids.includes(li.dataset.id)) {
        if (reduce) { li.remove(); return; }
        li.classList.add('is-leaving');
        setTimeout(() => li.remove(), 380);
      }
    });
    store.items.forEach((it) => {
      let li = $(`li[data-id="${it.id}"]`, host);
      const html = `<span class="sw" style="--c:${COLORS[it.c % COLORS.length][0]}" aria-hidden="true"></span><span class="nm">${it.name}${it.sub ? `<br><small class="mt">${it.sub}</small>` : ''}</span><span class="mt">${fmtMins(it.mins)} · ${fmtEur(it.price)}</span><button class="rm" type="button" aria-label="Quitar ${it.name} de tu cita" data-remove="${it.id}"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-x"/></svg></button>`;
      if (!li) {
        li = d.createElement('li');
        li.dataset.id = it.id;
        host.appendChild(li);
      } else if (li.classList.contains('is-leaving')) {
        li.classList.remove('is-leaving');
      }
      if (li._html !== html) { li.innerHTML = html; li._html = html; }
    });
  };

  /* ------------------------------------------------------------ dock de la cita */
  const dock = $('#dock');
  const dockPanel = $('#dock-panel');
  const dockToggle = $('#dock-toggle');
  let pastHero = false;
  const endsInView = new Set();
  let dockShown = false;
  let panelOpen = false;
  function updateDock() {
    if (!dock) return;
    const show = pastHero && endsInView.size === 0 && !menuOpen;
    if (show !== dockShown) {
      dockShown = show;
      dock.classList.toggle('is-visible', show);
      dock.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (show) dock.removeAttribute('inert'); else { dock.setAttribute('inert', ''); setPanel(false); }
    }
  }
  const setPanel = (open) => {
    if (!dockPanel || open === panelOpen) return;
    if (open && !store.items.length) { $('#reserva').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    panelOpen = open;
    dockToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      dockPanel.hidden = false;
      dockPanel.classList.remove('is-closing');
      swapClass(dockPanel, 'is-opening', 600);
    } else if (reduce) {
      dockPanel.hidden = true;
    } else {
      dockPanel.classList.add('is-closing');
      setTimeout(() => { dockPanel.hidden = true; dockPanel.classList.remove('is-closing'); }, 300);
    }
  };
  if (dock && hasIO) {
    const heroActions = $('#hero-actions');
    new IntersectionObserver((es) => {
      const e = es[0];
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      updateDock();
    }).observe(heroActions);
    const eo = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) endsInView.add(e.target); else endsInView.delete(e.target); });
      updateDock();
    });
    ['#reserva', '.footer'].forEach((s) => { const el = $(s); if (el) eo.observe(el); });
    dockToggle.addEventListener('click', () => setPanel(!panelOpen));
    $('#dock-close').addEventListener('click', () => { setPanel(false); dockToggle.focus(); });
    $('#dock-go').addEventListener('click', () => setPanel(false));
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panelOpen) { setPanel(false); dockToggle.focus(); } });
    d.addEventListener('click', (e) => { if (panelOpen && !dock.contains(e.target)) setPanel(false); });
  }

  /* Punto que vuela del botón a la cita */
  const fly = (fromEl) => {
    if (reduce || !fromEl || !dock) return;
    const target = dockShown ? $('.dock__mini', dock) : $('.nav__cta', nav);
    if (!target || !target.offsetParent) return;
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    if (!a.width) return;
    const dot = d.createElement('span');
    dot.className = 'fly';
    d.body.appendChild(dot);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
    const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 120;
    const anim = dot.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
      { transform: `translate(${mx}px, ${my}px) scale(1.25)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${x1}px, ${y1}px) scale(0.5)`, opacity: 0.2 },
    ], { duration: 820, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
    dot.style.left = '0'; dot.style.top = '0';
    anim.onfinish = () => { dot.remove(); if (dockShown) swapClass(dock, 'is-bump', 600); };
  };

  /* Pintar todo lo que depende de la cita */
  const countEls = $$('[data-cita-count]');
  const totalEls = $$('[data-cita-total]');
  const listEls = $$('[data-cita-list]');
  const ribbonEls = $$('[data-ribbon]');
  const emptyEls = $$('[data-cita-empty]');
  let selectedStart = null;
  const renderCita = () => {
    const n = store.items.length, m = store.mins(), p = store.price();
    countEls.forEach((el) => { el.hidden = n === 0; el.textContent = n; });
    totalEls.forEach((el) => { el.textContent = n ? `${fmtMins(m)} · ${fmtEur(p)}` : ''; });
    listEls.forEach(listHTML);
    ribbonEls.forEach((r) => ribbonHTML(r, r.closest('#cita-box') ? selectedStart : null));
    emptyEls.forEach((el) => { el.hidden = n > 0; });
    const t = $('[data-dock-title]'), s = $('[data-dock-sub]'), mini = $('[data-mini]');
    if (t) t.textContent = n ? `Tu cita · ${n} ${n === 1 ? 'tratamiento' : 'tratamientos'}` : 'Tu cita';
    if (s) s.textContent = n ? `${fmtMins(m)} · ${fmtEur(p)}`.replace(/ /g, ' ') : 'Toca + para añadir';
    if (mini) mini.innerHTML = store.items.map((it) => `<i style="--c:${COLORS[it.c % COLORS.length][0]};flex-grow:${it.mins}"></i>`).join('');
    if (!n) setPanel(false);
    $$('[data-add]').forEach((btn) => {
      const on = store.has(btn.dataset.add);
      if (btn.classList.contains('qchip')) { btn.hidden = on; return; }
      btn.setAttribute('aria-pressed', String(on));
      const label = $('.add__label', btn);
      if (label) label.textContent = on ? label.dataset.on : label.dataset.off;
      if (btn.dataset.labelOn) btn.setAttribute('aria-label', on ? btn.dataset.labelOn : btn.dataset.labelOff);
      const row = btn.closest('.row');
      if (row) row.classList.toggle('is-picked', on);
    });
  };
  store.on((ev) => {
    renderCita();
    if (ev.type === 'add') { const it = store.get(ev.id); toast(`${it.short || it.name} · añadido a tu cita`); }
    if (ev.type === 'remove') toast('Quitado de tu cita');
    if (typeof refreshHours === 'function') refreshHours();
    if (typeof syncLaserBtn === 'function') syncLaserBtn();
  });

  d.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      const id = add.dataset.add;
      if (store.has(id) && !add.classList.contains('qchip')) store.remove(id);
      else { fly(add); store.add(id); }
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) { e.stopPropagation(); store.remove(rm.dataset.remove); }
  });

  /* ------------------------------------------------------------ mapa del rostro */
  const face = $('#face');
  if (face) {
    const S = 1.6;
    const lens = $('#lens');
    const lensEls = ['#lens-clip-c', '#lens-bg', '#lens-ring'].map((s) => $(s, face));
    const zoom = $('#lens-zoom');
    const chips = $$('.zchip');
    const panels = $$('.zpanel');
    const spots = $$('.spot', face);
    const auras = $$('.aura', face);
    const lines = $$('.fl', face);
    const hint = $('#face-hint');
    $('.zpanels').classList.add('is-live');
    const pos = {};
    spots.forEach((s) => {
      const m = /translate\(([\d.]+) ([\d.]+)\)/.exec(s.getAttribute('transform'));
      pos[s.dataset.zone] = [+m[1], +m[2]];
    });
    let cur = chips.find((c) => c.getAttribute('aria-selected') === 'true')?.dataset.zone || 'mejillas';
    let lx = pos[cur][0], ly = pos[cur][1];
    let stopTween = () => {};
    const placeLens = (x, y) => {
      lensEls.forEach((c) => { c.setAttribute('cx', x.toFixed(2)); c.setAttribute('cy', y.toFixed(2)); });
      zoom.setAttribute('transform', `translate(${(x * (1 - S)).toFixed(2)} ${(y * (1 - S)).toFixed(2)}) scale(${S})`);
    };
    const highlight = (zone, redraw) => {
      lines.forEach((l) => {
        const on = zone === 'todo' || (l.dataset.z || '').split(' ').includes(zone);
        l.classList.toggle('is-on', on);
        if (on && redraw && motion) swapClass(l, 'is-redraw', 1000);
      });
      auras.forEach((a) => a.classList.toggle('is-on', a.dataset.zone === zone));
      spots.forEach((s) => s.classList.toggle('is-on', s.dataset.zone === zone));
    };
    let autoplay = null, interacted = false;
    const select = (zone, opts = {}) => {
      if (!pos[zone] && zone !== 'todo') return;
      const prev = cur;
      cur = zone;
      chips.forEach((c) => {
        const on = c.dataset.zone === zone;
        c.setAttribute('aria-selected', String(on));
        c.tabIndex = on ? 0 : -1;
        if (on && opts.scrollChip !== false) {
          const box = c.parentElement;
          const left = c.offsetLeft - (box.clientWidth - c.offsetWidth) / 2;
          box.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' });
        }
      });
      // panel
      const next = panels.find((p) => p.dataset.zone === zone);
      const old = panels.find((p) => !p.hidden && p !== next);
      if (next && next.hidden) {
        if (old) {
          if (motion) {
            old.classList.add('is-leaving');
            setTimeout(() => { old.hidden = true; old.classList.remove('is-leaving'); }, 340);
          } else old.hidden = true;
        }
        next.hidden = false;
        if (motion) swapClass(next, 'is-entering', 900);
      }
      highlight(zone, prev !== zone);
      // lupa
      stopTween();
      if (zone === 'todo') { lens.classList.add('is-off'); return; }
      lens.classList.remove('is-off');
      const [tx, ty] = pos[zone];
      const fx = lx, fy = ly;
      stopTween = tween(0, 1, 850, (k) => { lx = fx + (tx - fx) * k; ly = fy + (ty - fy) * k; placeLens(lx, ly); }, () => {
        if (motion) { lens.classList.remove('is-arrive'); void lens.getBBox(); lens.classList.add('is-arrive'); }
      });
    };
    const userSelect = (zone, focusChip) => {
      interacted = true;
      stopAuto();
      if (hint) hint.classList.add('is-gone');
      select(zone);
      if (focusChip) { const c = chips.find((x) => x.dataset.zone === zone); if (c) c.focus(); }
    };
    chips.forEach((c, i) => {
      c.addEventListener('click', () => userSelect(c.dataset.zone));
      c.addEventListener('keydown', (e) => {
        let j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % chips.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + chips.length) % chips.length;
        if (e.key === 'Home') j = 0;
        if (e.key === 'End') j = chips.length - 1;
        if (j != null) { e.preventDefault(); userSelect(chips[j].dataset.zone, true); }
      });
    });
    spots.forEach((s) => s.addEventListener('click', () => userSelect(s.dataset.zone)));
    placeLens(lx, ly);
    highlight(cur, false);

    /* Mientras nadie toca, la lupa recorre la cara para enseñar que se puede tocar */
    const tour = ['mejillas', 'ojos', 'frente', 'labio', 'cejas', 'nariz', 'ovalo', 'pestanas'];
    let tourI = 0;
    const stopAuto = () => { clearInterval(autoplay); autoplay = null; };
    const startAuto = () => {
      if (reduce || interacted || autoplay) return;
      autoplay = setInterval(() => {
        tourI = (tourI + 1) % tour.length;
        select(tour[tourI], { scrollChip: false });
        if (tourI === 0) { interacted = true; stopAuto(); }
      }, 4200);
    };
    const section = face.closest('section');
    section.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') stopAuto(); });
    section.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !interacted) startAuto(); });
    section.addEventListener('click', () => { interacted = true; stopAuto(); });
    section.addEventListener('focusin', () => { interacted = true; stopAuto(); });
    if (hasIO) {
      new IntersectionObserver((es) => {
        if (es[0].isIntersecting) setTimeout(startAuto, motion ? 3000 : 0);
        else stopAuto();
      }, { threshold: 0.45 }).observe(face);
    }
    onReveal(face, () => {
      face.classList.add('is-drawing');
      setTimeout(() => face.classList.remove('is-drawing'), 3600);
    });
  }

  /* ------------------------------------------------------------ diagnóstico */
  const quiz = $('#quiz');
  if (quiz) {
    const form = $('#quiz-form');
    const steps = $$('.qstep', form);
    const back = $('#quiz-back');
    const result = $('#quiz-result');
    const barQ = $('#quiz-bar');
    quiz.classList.add('is-live');
    const answers = {};
    let step = 0;
    const setBar = (k) => { barQ.style.transform = `scaleX(${Math.max(0.04, k)})`; };
    const show = (n, dir) => {
      const old = steps[step];
      step = n;
      steps.forEach((s, i) => { if (i !== n && s !== old) s.hidden = true; });
      if (old && old !== steps[n]) {
        if (motion) {
          old.classList.add('is-leaving');
          setTimeout(() => { old.hidden = true; old.classList.remove('is-leaving'); }, 330);
        } else old.hidden = true;
      }
      const el = steps[n];
      el.hidden = false;
      if (motion) swapClass(el, 'is-entering', 900);
      back.hidden = n === 0;
      setBar(n / steps.length);
      if (dir !== 'init') { const first = $('input:checked', el) || $('input', el); if (first) setTimeout(() => first.focus({ preventScroll: true }), motion ? 360 : 0); }
    };
    steps.forEach((s, i) => { if (i) s.hidden = true; });
    show(0, 'init');

    const REC = {
      manchas: { corto: ['vitamina-c'], medio: ['peeling'], largo: ['peeling', 'contorno-ojos'] },
      arrugas: { corto: ['radiofrecuencia'], medio: ['reafirmante'], largo: ['reafirmante', 'contorno-ojos'] },
      poros: { corto: ['higiene-express'], medio: ['higiene'], largo: ['higiene', 'vitamina-c'] },
      luz: { corto: ['vitamina-c'], medio: ['facial-alba'], largo: ['facial-alba', 'contorno-ojos'] },
      firmeza: { corto: ['radiofrecuencia'], medio: ['reafirmante'], largo: ['reafirmante', 'diseno-cejas'] },
    };
    const OBJ = {
      manchas: 'Para las manchas, lo que mejor funciona es aclarar poco a poco y unificar el tono.',
      arrugas: 'Para las líneas, lo que funciona es estimular tu propio colágeno.',
      poros: 'Para los poros, lo primero es una limpieza a fondo con extracción.',
      luz: 'Para que la piel recupere la luz, la clave es hidratarla en profundidad.',
      firmeza: 'Para la firmeza, combinamos calor y masaje, que tensan el óvalo.',
    };
    const PIEL = {
      seca: 'Como tu piel tiende a tirar, usaremos activos sin alcohol y terminaremos con una mascarilla nutritiva.',
      mixta: 'En la zona T trabajaremos el poro y en las mejillas nos centraremos en hidratar.',
      grasa: 'Usaremos productos sin aceites que regulan el brillo sin resecar.',
      sensible: 'Como tu piel se enrojece con facilidad, haremos una prueba antes y elegiremos activos calmantes.',
      normal: 'Tu piel está equilibrada, así que podemos ir directas a lo que quieres mejorar.',
    };
    const PLUS = {
      'contorno-ojos': ['para que la mirada acompañe', 'el contorno de ojos'],
      'vitamina-c': ['para cerrar el poro y darle luz', 'la vitamina C'],
      'diseno-cejas': ['para enmarcar la cara', 'el diseño de cejas'],
    };
    const renderResult = () => {
      let ids = (REC[answers.objetivo] || REC.luz)[answers.tiempo] || ['facial-alba'];
      if (answers.piel === 'sensible' && answers.objetivo === 'luz') ids = ['calmante'].concat(ids.slice(1));
      const main = catalog[ids[0]];
      const extra = ids[1] && catalog[ids[1]];
      const why = `${OBJ[answers.objetivo] || ''} ${PIEL[answers.piel] || ''}`.trim();
      result.innerHTML = `
        <p class="result__label"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-sparkle"/></svg>Te recomendamos</p>
        <h3 class="result__name">${main.name}</h3>
        <p class="result__meta"><span>${fmtMins(main.mins)}</span><span>${fmtEur(main.price)}</span></p>
        <p class="result__why">${why}</p>
        ${extra ? `<p class="result__plus">Y como tienes tiempo, añade <strong>${extra.name}</strong> (${fmtMins(extra.mins)}, ${fmtEur(extra.price)}) ${(PLUS[ids[1]] || [''])[0]}.</p>` : '<p class="result__fine">Es una orientación. En tu primera visita lo confirmamos con un diagnóstico de piel gratis.</p>'}
        <div class="result__actions">
          <button class="add" type="button" data-add="${ids[0]}" aria-pressed="false"><span class="add__icon" aria-hidden="true"><svg class="ic ic--plus"><use href="#i-plus"/></svg><svg class="ic ic--check"><use href="#i-check"/></svg></span><span class="add__label" data-on="En tu cita" data-off="Añadir a mi cita">Añadir a mi cita</span></button>
          ${extra ? (() => { const lb = (PLUS[ids[1]] || ['', extra.name])[1]; const cap = lb.replace(/^(el |la )/, '').replace(/^./, (c) => c.toUpperCase()); return `<button class="add" type="button" data-add="${ids[1]}" aria-pressed="false"><span class="add__icon" aria-hidden="true"><svg class="ic ic--plus"><use href="#i-plus"/></svg><svg class="ic ic--check"><use href="#i-check"/></svg></span><span class="add__label" data-on="${cap}, en tu cita" data-off="Añadir ${lb}">Añadir ${lb}</span></button>`; })() : ''}
          <button class="linkbtn" type="button" id="quiz-again"><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-redo"/></svg>Repetir</button>
        </div>`;
      renderCita();
      $('#quiz-again', result).addEventListener('click', restart);
    };
    const finish = () => {
      renderResult();
      const old = steps[step];
      if (motion) { old.classList.add('is-leaving'); setTimeout(() => { old.hidden = true; old.classList.remove('is-leaving'); }, 330); } else old.hidden = true;
      setTimeout(() => {
        form.hidden = true;
        result.hidden = false;
        if (motion) { swapClass(result, 'is-entering', 1400); swapClass(quiz, 'is-glow', 1400); }
        result.focus({ preventScroll: true });
      }, motion ? 340 : 0);
      setBar(1);
    };
    const restart = () => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      $$('input', form).forEach((i) => { i.checked = false; });
      result.hidden = true;
      form.hidden = false;
      steps.forEach((s) => { s.hidden = true; });
      step = 0;
      show(0);
    };
    let advanceT;
    form.addEventListener('change', (e) => {
      const input = e.target;
      answers[input.name] = input.value;
      clearTimeout(advanceT);
      advanceT = setTimeout(() => {
        if (step < steps.length - 1) show(step + 1); else finish();
      }, reduce ? 120 : 420);
    });
    back.addEventListener('click', () => { clearTimeout(advanceT); if (step > 0) show(step - 1); });
  }

  /* ------------------------------------------------------------ carta */
  const carta = $('#tratamientos');
  if (carta) {
    const tabs = $$('.tab', carta);
    const panelsC = $$('.panel', carta);
    const ink = $('.carta__ink', carta);
    const photos = $$('.carta__media .photo', carta);
    const moveInk = (tab, instant) => {
      if (!ink || !tab) return;
      ink.style.transition = instant || reduce ? 'none' : 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      ink.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth / 100})`;
    };
    const pick = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panelsC.forEach((p) => {
        const on = p.id === tab.getAttribute('aria-controls');
        if (on && p.hidden) { p.hidden = false; if (motion) swapClass(p, 'is-entering', 1000); }
        if (!on) p.hidden = true;
      });
      photos.forEach((ph) => ph.classList.toggle('is-active', ph.dataset.media === tab.dataset.tab));
      moveInk(tab);
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => {
        let j = null;
        if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') j = 0;
        if (e.key === 'End') j = tabs.length - 1;
        if (j != null) { e.preventDefault(); pick(tabs[j], true); }
      });
    });
    const sel = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    requestAnimationFrame(() => moveInk(sel(), true));
    addEventListener('resize', () => moveInk(sel(), true));
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => moveInk(sel(), true));
  }

  /* ------------------------------------------------------------ láser */
  let syncLaserBtn;
  const laserSec = $('#laser');
  if (laserSec) {
    const chipsL = $$('.lz', laserSec);
    const note = $('#lz-note');
    const empty = $('#lout-empty');
    const full = $('#lout-full');
    const zonesEl = $('#lout-zones');
    const sessions = $('#sessions');
    const endEl = $('#lout-end');
    const addBtn = $('#laser-add');
    const live = $('#lout-live');
    let liveT;
    const nums = { session: $('[data-num="session"]'), bono: $('[data-num="bono"]'), save: $('[data-num="save"]') };
    const vals = { session: 0, bono: 0, save: 0 };
    const stops = {};
    const setNum = (k, v) => {
      if (stops[k]) stops[k]();
      const from = vals[k];
      vals[k] = v;
      stops[k] = tween(from, v, 900, (x) => { nums[k].textContent = Math.round(x); });
    };
    const selected = () => chipsL.filter((c) => c.getAttribute('aria-pressed') === 'true');
    const joinEs = (arr) => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} y ${arr[arr.length - 1]}`);
    let lastSig = '';
    const state = () => {
      const sel = selected();
      const price = sel.reduce((s, c) => s + +c.dataset.price, 0);
      const mins = sel.reduce((s, c) => s + +c.dataset.mins, 0);
      const names = sel.map((c) => c.dataset.name.toLowerCase());
      const onlyFace = sel.length > 0 && sel.every((c) => c.dataset.group === 'rostro');
      return { sel, price, mins, names, weeks: onlyFace ? 4 : 6 };
    };
    const renderSessions = (weeks) => {
      const now = madridNow();
      let html = '<span class="sessions__line"></span>';
      let last;
      for (let k = 0; k < 6; k++) {
        const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k * weeks * 7);
        last = dt;
        html += `<div class="sess" style="--k:${k}"><span class="sess__dot"></span><span class="sess__m"><strong>${k + 1}.ª</strong>${k === 0 ? 'esta semana' : MON[dt.getMonth()]}</span></div>`;
      }
      sessions.innerHTML = html;
      sessions.classList.remove('is-on');
      requestAnimationFrame(() => requestAnimationFrame(() => sessions.classList.add('is-on')));
      endEl.innerHTML = `Una sesión cada ${weeks} semanas. Si empiezas esta semana, terminas en <strong>${MONTHS[last.getMonth()]} de ${last.getFullYear()}</strong>.`;
    };
    let lastWeeks = 0;
    const render = () => {
      const st = state();
      const has = st.sel.length > 0;
      if (has && full.hidden) {
        empty.hidden = true; full.hidden = false;
        if (motion) swapClass(full, 'is-entering', 1000);
      } else if (!has && !full.hidden) {
        full.hidden = true; empty.hidden = false;
        if (motion) swapClass(empty, 'is-entering', 800);
      }
      if (!has) { lastWeeks = 0; live.textContent = 'Sin zonas elegidas.'; syncLaserBtn(); return; }
      zonesEl.textContent = `${joinEs(st.names).replace(/^./, (c) => c.toUpperCase())} · ${st.mins} min por sesión`;
      setNum('session', st.price);
      setNum('bono', st.price * 5);
      setNum('save', st.price);
      if (st.weeks !== lastWeeks) { renderSessions(st.weeks); lastWeeks = st.weeks; }
      clearTimeout(liveT);
      liveT = setTimeout(() => { live.textContent = `${st.price} euros por sesión. Con el bono de 6 sesiones, ${st.price * 5} euros.`; }, 700);
      syncLaserBtn();
    };
    const laserItem = () => {
      const st = state();
      return {
        id: 'laser',
        name: `Láser de diodo: ${joinEs(st.names)}`,
        short: 'Láser',
        sub: '1.ª sesión del bono de 6',
        mins: st.mins,
        price: st.price,
        zones: st.sel.map((c) => c.dataset.lz),
      };
    };
    syncLaserBtn = () => {
      if (!addBtn) return;
      const st = state();
      const inCita = store.get('laser');
      const label = $('span', addBtn);
      let txt = 'Añadir el láser a mi cita', done = false;
      if (inCita) {
        const same = st.sel.length && inCita.zones && inCita.zones.join() === st.sel.map((c) => c.dataset.lz).join();
        txt = same ? 'El láser ya está en tu cita' : st.sel.length ? 'Actualizar el láser en mi cita' : 'Añadir el láser a mi cita';
        done = !!same;
      }
      label.textContent = txt;
      addBtn.classList.toggle('is-done', done);
      addBtn.setAttribute('aria-pressed', String(done));
    };
    const toggle = (chip, force) => {
      const on = force != null ? force : chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', String(on));
      if (on) {
        if (motion) swapClass(chip, 'is-zap', 700);
        const ex = (chip.dataset.excludes || '').split(' ').filter(Boolean);
        const off = chipsL.filter((c) => ex.includes(c.dataset.lz) && c.getAttribute('aria-pressed') === 'true');
        off.forEach((c) => c.setAttribute('aria-pressed', 'false'));
        if (off.length) note.textContent = `${chip.dataset.name} ya incluye ${joinEs(off.map((c) => c.dataset.name.toLowerCase()))}, así que lo hemos quitado.`;
        else note.textContent = '';
      } else note.textContent = '';
      render();
    };
    chipsL.forEach((c) => c.addEventListener('click', () => toggle(c)));
    addBtn.addEventListener('click', () => {
      const st = state();
      if (!st.sel.length) return;
      const inCita = store.get('laser');
      if (inCita && addBtn.classList.contains('is-done')) { store.remove('laser'); return; }
      fly(addBtn);
      store.put(laserItem());
      if (inCita) toast('Láser actualizado en tu cita');
    });
    $$('[data-laser-pick]').forEach((a) => a.addEventListener('click', () => {
      const chip = chipsL.find((c) => c.dataset.lz === a.dataset.laserPick);
      if (chip && chip.getAttribute('aria-pressed') !== 'true') setTimeout(() => toggle(chip, true), motion ? 650 : 0);
    }));
    /* Si ya había un láser guardado, recupera sus zonas */
    const saved = store.get('laser');
    if (saved && saved.zones) chipsL.forEach((c) => c.setAttribute('aria-pressed', String(saved.zones.includes(c.dataset.lz))));
    render();
  }

  /* ------------------------------------------------------------ opiniones */
  const stage = $('#reviews');
  if (stage) {
    const quotes = $$('.quote', stage);
    const dots = $$('.qdot', stage);
    $('.quotes', stage).classList.add('is-live');
    let i = 0, timer = null, hovering = false, visible = false;
    const DUR = 7000;
    stage.style.setProperty('--qdur', `${DUR}ms`);
    const go = (n) => {
      n = (n + quotes.length) % quotes.length;
      if (n === i) return;
      const old = quotes[i], next = quotes[n];
      i = n;
      if (motion) {
        old.classList.add('is-leaving');
        setTimeout(() => { old.hidden = true; old.classList.remove('is-leaving'); }, 380);
        setTimeout(() => { next.hidden = false; swapClass(next, 'is-entering', 900); }, 300);
      } else { old.hidden = true; next.hidden = false; }
      dots.forEach((dt, k) => dt.setAttribute('aria-current', String(k === n)));
      restart();
    };
    const play = () => {
      stop();
      if (reduce || hovering || !visible) { stage.classList.remove('is-playing'); return; }
      stage.classList.add('is-playing');
      timer = setTimeout(() => go(i + 1), DUR);
    };
    const stop = () => { clearTimeout(timer); timer = null; };
    const restart = () => { stage.classList.remove('is-playing'); void stage.offsetWidth; play(); };
    dots.forEach((dt) => dt.addEventListener('click', () => go(+dt.dataset.q)));
    $$('.qarrow', stage).forEach((b) => b.addEventListener('click', () => go(i + +b.dataset.dir)));
    stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; stop(); stage.classList.add('is-paused'); } });
    stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hovering = false; stage.classList.remove('is-paused'); restart(); } });
    stage.addEventListener('focusin', () => { hovering = true; stop(); stage.classList.add('is-paused'); });
    stage.addEventListener('focusout', (e) => { if (!stage.contains(e.relatedTarget)) { hovering = false; stage.classList.remove('is-paused'); restart(); } });
    let sx = null;
    stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
    stage.addEventListener('pointerup', (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    });
    if (hasIO) new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) restart(); else { stop(); stage.classList.remove('is-playing'); } }, { threshold: 0.4 }).observe(stage);
  }

  /* ------------------------------------------------------------ preguntas */
  $$('.qa').forEach((det) => {
    const sum = $('summary', det);
    const body = $('.qa__a', det);
    let anim = null;
    sum.addEventListener('click', (e) => {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      if (det.open) {
        const h = body.offsetHeight;
        det.classList.add('is-closing');
        anim = body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
        anim.onfinish = () => { det.open = false; det.classList.remove('is-closing'); anim = null; };
      } else {
        det.classList.remove('is-closing');
        det.open = true;
        const h = body.offsetHeight;
        anim = body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* ------------------------------------------------------------ horario: abierto o cerrado */
  const status = $('#status');
  if (status) {
    const now = madridNow();
    const day = now.getDay();
    const m = now.getHours() * 60 + now.getMinutes();
    const block = (HOURS[day] || []).find(([a, b]) => m >= a && m < b);
    if (block) {
      status.textContent = `Abierto ahora · cierra a las ${hm(block[1])}`;
      status.classList.add('is-open');
    } else {
      const later = (HOURS[day] || []).find(([a]) => a > m);
      let txt;
      if (later) txt = `Cerrado · abre hoy a las ${hm(later[0])}`;
      else {
        for (let k = 1; k <= 7; k++) {
          const dd = (day + k) % 7;
          if (HOURS[dd].length) { txt = `Cerrado · abre ${k === 1 ? 'mañana' : `el ${DAYS[dd]}`} a las ${hm(HOURS[dd][0][0])}`; break; }
        }
      }
      status.textContent = txt;
    }
    status.hidden = false;
    $$('.hours [data-days]').forEach((row) => row.classList.toggle('is-today', row.dataset.days.split(' ').includes(String(day))));
  }

  /* ------------------------------------------------------------ desplegables propios */
  const dropdown = (root, onChange) => {
    const btn = $('.dd__btn', root);
    const list = $('.dd__list', root);
    const valueEl = $('.dd__value', btn);
    let value = null, active = -1;
    const opts = () => $$('.dd__opt:not([aria-disabled="true"])', list);
    const setActive = (n) => {
      const o = opts();
      if (!o.length) return;
      active = Math.max(0, Math.min(o.length - 1, n));
      o.forEach((x, k) => x.classList.toggle('is-active', k === active));
      list.setAttribute('aria-activedescendant', o[active].id);
      o[active].scrollIntoView({ block: 'nearest' });
    };
    const open = () => {
      $$('.dd.is-open').forEach((x) => { if (x !== root) x._dd.close(); });
      root.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      const o = opts();
      const cur = o.findIndex((x) => x.dataset.value === value);
      setActive(cur >= 0 ? cur : 0);
      list.focus({ preventScroll: true });
      const pop = $('.dd__pop', root);
      setTimeout(() => {
        const r = pop.getBoundingClientRect();
        const over = r.bottom - (innerHeight - 16);
        if (over > 0) scrollBy({ top: over, behavior: reduce ? 'auto' : 'smooth' });
      }, 60);
    };
    const close = (focusBtn) => {
      root.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      list.removeAttribute('aria-activedescendant');
      if (focusBtn) btn.focus({ preventScroll: true });
    };
    const choose = (opt) => {
      if (!opt || opt.getAttribute('aria-disabled') === 'true') return;
      value = opt.dataset.value;
      $$('.dd__opt', list).forEach((x) => x.setAttribute('aria-selected', String(x === opt)));
      valueEl.textContent = opt.dataset.label || opt.textContent.trim();
      valueEl.classList.remove('is-placeholder');
      close(true);
      onChange(value, opt);
    };
    const reset = () => {
      value = null;
      valueEl.textContent = valueEl.dataset.placeholder;
      valueEl.classList.add('is-placeholder');
      $$('.dd__opt', list).forEach((x) => x.setAttribute('aria-selected', 'false'));
    };
    btn.addEventListener('click', () => (root.classList.contains('is-open') ? close(true) : open()));
    btn.addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); } });
    list.addEventListener('click', (e) => choose(e.target.closest('.dd__opt')));
    list.addEventListener('keydown', (e) => {
      const o = opts();
      const cols = root.classList.contains('dd--grid') ? 3 : 1;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + cols); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - cols); }
      else if (e.key === 'ArrowRight' && cols > 1) { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowLeft' && cols > 1) { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(o.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(o[active]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') close(false);
    });
    d.addEventListener('pointerdown', (e) => { if (!root.contains(e.target)) close(false); });
    root._dd = { close, reset, get value() { return value; }, setOptions(html) { list.innerHTML = html; } };
    return root._dd;
  };

  /* ------------------------------------------------------------ reserva */
  let refreshHours;
  const formC = $('#form-cita');
  if (formC) {
    const dayErr = $('#e-dia'), hourErr = $('#e-hora'), nameErr = $('#e-nombre');
    const nameIn = $('#f-nombre'), noteIn = $('#f-nota');
    let dayVal = null, hourVal = null;
    const today = madridNow();
    const nowMins = today.getHours() * 60 + today.getMinutes();
    const iso = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    const dateFromIso = (s) => { const [y, mo, da] = s.split('-').map(Number); return new Date(y, mo - 1, da); };
    const longDay = (dt) => `${DAYS[dt.getDay()]} ${dt.getDate()} de ${MONTHS[dt.getMonth()]}`;
    const dur = () => Math.max(30, store.mins() || 0);
    const slotsFor = (dt) => {
      const blocks = HOURS[dt.getDay()] || [];
      const isToday = iso(dt) === iso(today);
      const out = [];
      blocks.forEach(([a, b], bi) => {
        for (let t = a; t + 30 <= b; t += 30) {
          if (isToday && t < nowMins + 60) continue;
          out.push({ t, ok: t + dur() <= b, block: bi });
        }
      });
      return out;
    };
    const ddDay = dropdown($('#dd-dia'), (v) => {
      dayVal = v;
      $('#dd-dia').closest('.field').classList.remove('has-error'); dayErr.hidden = true;
      hourVal = null; ddHour.reset();
      refreshHours();
    });
    const ddHour = dropdown($('#dd-hora'), (v) => {
      hourVal = +v;
      $('#dd-hora').closest('.field').classList.remove('has-error'); hourErr.hidden = true;
      selectedStart = hourVal; renderCita();
    });
    // Días: las próximas dos semanas, sin domingos ni días sin huecos
    let dayHTML = '';
    for (let k = 0, n = 0; k < 21 && n < 14; k++) {
      const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + k);
      if (!(HOURS[dt.getDay()] || []).length) continue;
      if (k === 0 && !slotsFor(dt).length) continue;
      const label = k === 0 ? `Hoy, ${DAYS[dt.getDay()]} ${dt.getDate()}` : k === 1 ? `Mañana, ${DAYS[dt.getDay()]} ${dt.getDate()}` : `${DAYS[dt.getDay()].replace(/^./, (c) => c.toUpperCase())} ${dt.getDate()} de ${MONTHS[dt.getMonth()]}`;
      const short = dt.getDay() === 6 ? 'Solo mañana' : '';
      dayHTML += `<div class="dd__opt" role="option" id="o-dia-${n}" aria-selected="false" data-value="${iso(dt)}" data-label="${label}"><span>${label}</span>${short ? `<small>${short}</small>` : ''}<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-check"/></svg></div>`;
      n++;
    }
    ddDay.setOptions(dayHTML);

    refreshHours = () => {
      if (!dayVal) {
        ddHour.setOptions('<p class="dd__empty">Elige primero el día.</p>');
        selectedStart = null;
        renderCita();
        return;
      }
      const slots = slotsFor(dateFromIso(dayVal));
      let html = '', lastBlock = -1, n = 0;
      slots.forEach((s) => {
        if (s.block !== lastBlock) { html += `<p class="dd__group" role="presentation">${s.t < 900 ? 'Mañana' : 'Tarde'}</p>`; lastBlock = s.block; }
        html += `<div class="dd__opt" role="option" id="o-hora-${n++}" aria-selected="${String(hourVal === s.t)}" ${s.ok ? '' : 'aria-disabled="true" title="Tu cita no cabe antes del cierre"'} data-value="${s.t}">${hm(s.t)}</div>`;
      });
      ddHour.setOptions(html || '<p class="dd__empty">Ese día ya no quedan horas. Prueba con otro.</p>');
      if (hourVal != null) {
        const still = slots.find((s) => s.t === hourVal && s.ok);
        if (!still) {
          hourVal = null; ddHour.reset();
          toast('Con lo que has añadido, tu cita ya no cabe a esa hora. Elige otra.');
        }
      }
      selectedStart = hourVal;
      ribbonEls.forEach((r) => { if (r.closest('#cita-box')) ribbonHTML(r, selectedStart); });
    };
    refreshHours();

    const shake = (el) => { if (!motion || !el.animate) return; el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 420, easing: 'ease-out' }); };
    nameIn.addEventListener('input', () => { if (nameIn.value.trim()) { nameIn.closest('.field').classList.remove('has-error'); nameErr.hidden = true; } });

    formC.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      const fail = (field, err, focusEl) => { field.classList.add('has-error'); err.hidden = false; shake(field); if (!firstBad) firstBad = focusEl; };
      if (!dayVal) fail($('#dd-dia').closest('.field'), dayErr, $('#f-dia'));
      if (hourVal == null) fail($('#dd-hora').closest('.field'), hourErr, $('#f-hora'));
      if (!nameIn.value.trim()) fail(nameIn.closest('.field'), nameErr, nameIn);
      if (firstBad) { firstBad.focus(); return; }
      const dt = dateFromIso(dayVal);
      const lines = ['Hola, Alba Estética. Me gustaría pedir cita.', ''];
      if (store.items.length) {
        store.items.forEach((it) => lines.push(`• ${it.name}${it.sub ? ` (${it.sub})` : ''}: ${fmtMins(it.mins).replace(/ /g, ' ')}, ${fmtEur(it.price).replace(/ /g, ' ')}`));
        lines.push(`Total aprox.: ${fmtMins(store.mins()).replace(/ /g, ' ')} · ${fmtEur(store.price()).replace(/ /g, ' ')}`);
      } else {
        lines.push('Aún no sé qué tratamiento hacerme, me gustaría que me aconsejéis.');
      }
      lines.push('', `Día: ${longDay(dt)}`, `Hora: ${hm(hourVal)}${store.items.length ? ` (terminaría sobre las ${hm(hourVal + store.mins())})` : ''}`, `Nombre: ${nameIn.value.trim()}`);
      if (noteIn.value.trim()) lines.push(`Nota: ${noteIn.value.trim()}`);
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`;
      $('#wa-again').href = url;
      window.open(url, '_blank', 'noopener');
      formC.hidden = true;
      $('#cita-box').hidden = true;
      const done = $('#form-done');
      done.hidden = false;
      done.focus({ preventScroll: true });
      done.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    });
    $('#form-reset').addEventListener('click', () => {
      formC.reset();
      store.clear();
      dayVal = null; hourVal = null; selectedStart = null;
      ddDay.reset(); ddHour.reset(); refreshHours();
      $('#form-done').hidden = true;
      formC.hidden = false;
      $('#cita-box').hidden = false;
      $('#f-dia').focus();
    });
  }

  renderCita();
})();
