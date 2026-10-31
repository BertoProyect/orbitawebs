// @ts-nocheck
/* Motor de pelo con física (portado de la versión anterior, pelo.js). Sin dependencias. */
const reduce =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const coarse =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
const DPR = Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 2);
/* ---------- Color ---------- */
var hex = function (h) {
  h = String(h).trim().replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
};
var mixc = function (a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
};
var mul = function (a, k) {
  return [a[0] * k, a[1] * k, a[2] * k];
};
var css = function (c, al) {
  var f = function (v) {
    return Math.max(0, Math.min(255, Math.round(v)));
  };
  return "rgba(" + f(c[0]) + "," + f(c[1]) + "," + f(c[2]) + "," + (al == null ? 1 : al) + ")";
};
var lum = function (c) {
  return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
};

/* Números pseudoaleatorios repetibles: cada mechón tiene siempre el mismo peinado */
var rng = function (seed) {
  var s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/* ---------- Un mechón ----------
   La física va en unas pocas «guías» (cadenas de puntos con inercia, gravedad y rigidez);
   cada cabello que se dibuja sigue a las dos guías que tiene a los lados. */
function Lock(o) {
  this.canvas = o.canvas;
  this.ctx = o.canvas.getContext("2d");
  this.G = o.guides;
  this.S = o.segs;
  this.N = o.strands;
  this.width = o.width;
  this.length = o.length;
  this.taper = o.taper == null ? 0.2 : o.taper;
  this.ox = o.ox;
  this.oy = o.oy;
  this.root = o.root;
  this.tip = o.tip;
  this.lineW = o.lineW || 0.9;
  this.big = !!o.big;
  // estado del simulador de raíz
  this.regrowth = 0; // px de raíz sin teñir
  this.painted = 0; // 0..1 parte de la raíz ya pintada (animación de salida)
  this.natural = [43, 29, 21];
  this.grey = 0; // proporción de canas en la raíz
  this.damage = 0; // puntas abiertas y color apagado (0..1)
  this.cut = 1; // largo que queda (1 = entero)
  this.gloss = 1;
  this.brushY = -1;
  this.parts = [];
  this.awake = 0;
  this.time = 0;
  this.drop = 0;
  var rand = rng(o.seed || 7);
  var G = this.G,
    S = this.S;
  this.seg = [];
  this.rx = [];
  var n = G * (S + 1);
  this.x = new Float32Array(n);
  this.y = new Float32Array(n);
  this.px = new Float32Array(n);
  this.py = new Float32Array(n);
  for (var g = 0; g < G; g++) {
    this.rx[g] = (g / (G - 1) - 0.5) * this.width;
    this.seg[g] = (this.length * (0.975 + rand() * 0.025)) / S;
  }
  this.reset();
  // cabellos
  this.strands = [];
  for (var k = 0; k < this.N; k++) {
    var u = Math.min(0.9999, (k + rand()) / this.N);
    var gu = u * (G - 1);
    var r = rand();
    this.strands.push({
      g: Math.floor(gu),
      f: gu - Math.floor(gu),
      off: (rand() - 0.5) * (this.width / (G - 1)) * 0.7,
      len: 0.84 + 0.16 * Math.pow(rand(), 0.55),
      v: r < 0.28 ? 0 : r < 0.78 ? 1 : 2,
      grey: rand(),
      fz: rand() * 6.283,
      fa: rand(),
      lag: (rand() - 0.5) * 0.9,
    });
  }
}
Lock.prototype.idx = function (g, i) {
  return g * (this.S + 1) + i;
};
Lock.prototype.restX = function (g, i) {
  return this.ox + this.rx[g] * (1 - (this.taper * i) / this.S);
};
Lock.prototype.reset = function () {
  for (var g = 0; g < this.G; g++)
    for (var i = 0; i <= this.S; i++) {
      var j = this.idx(g, i);
      this.x[j] = this.px[j] = this.restX(g, i);
      this.y[j] = this.py[j] = this.oy + i * this.seg[g];
    }
};
/* Recogido arriba, listo para caer con su peso */
Lock.prototype.fold = function () {
  for (var g = 0; g < this.G; g++)
    for (var i = 0; i <= this.S; i++) {
      var j = this.idx(g, i);
      var a = i * 0.55 + g * 0.2;
      this.x[j] = this.px[j] = this.restX(g, 0) + Math.sin(a) * i * 0.6;
      this.y[j] = this.py[j] = this.oy + Math.min(i, 2) * this.seg[g] * 0.6;
    }
  this.awake = 1;
};
Lock.prototype.kick = function (amount) {
  for (var g = 0; g < this.G; g++)
    for (var i = 2; i <= this.S; i++) {
      var j = this.idx(g, i);
      this.px[j] -= amount * (i / this.S) * (0.85 + 0.3 * Math.sin(g * 1.7));
    }
  this.awake = 1;
};

Lock.prototype.step = function (ptr) {
  var G = this.G,
    S = this.S,
    x = this.x,
    y = this.y,
    px = this.px,
    py = this.py;
  var grav = this.big ? 0.42 : 0.34;
  var damp = 0.97;
  var energy = 0;
  this.time += 1 / 60;
  var breeze = this.breeze
    ? (Math.sin(this.time * 0.9) * 0.006 + Math.sin(this.time * 2.1 + 1) * 0.003) / S
    : 0;
  for (var g = 0; g < G; g++)
    for (var i = 2; i <= S; i++) {
      var j = this.idx(g, i);
      var vx = (x[j] - px[j]) * damp,
        vy = (y[j] - py[j]) * damp;
      px[j] = x[j];
      py[j] = y[j];
      x[j] += vx + breeze * i;
      y[j] += vy + grav;
      energy += Math.abs(vx) + Math.abs(vy);
      if (ptr) {
        var dx = x[j] - ptr.x,
          dy = y[j] - ptr.y;
        var d2 = dx * dx + dy * dy,
          R = ptr.r;
        if (d2 < R * R) {
          var d = Math.sqrt(d2) || 1,
            w = 1 - d / R;
          w *= w;
          x[j] += ptr.vx * w * 0.5 + (dx / d) * w * ptr.push;
          y[j] += ptr.vy * w * 0.22 + (dy / d) * w * ptr.push * 0.3;
        }
      }
    }
  var pinned = function (lock, g) {
    var j0 = lock.idx(g, 0),
      j1 = lock.idx(g, 1);
    x[j0] = lock.restX(g, 0);
    y[j0] = lock.oy;
    x[j1] = lock.restX(g, 1);
    y[j1] = lock.oy + lock.seg[g];
  };
  for (var it = 0; it < 7; it++) {
    for (g = 0; g < G; g++) {
      var seg = this.seg[g];
      pinned(this, g); // la pinza sujeta los dos primeros puntos
      for (i = 2; i <= S; i++) {
        var a = this.idx(g, i - 1),
          b = this.idx(g, i);
        var ddx = x[b] - x[a],
          ddy = y[b] - y[a];
        var dl = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
        var diff = (dl - seg) / dl;
        if (i === 2) {
          x[b] -= ddx * diff;
          y[b] -= ddy * diff;
        } else {
          x[a] += ddx * diff * 0.5;
          y[a] += ddy * diff * 0.5;
          x[b] -= ddx * diff * 0.5;
          y[b] -= ddy * diff * 0.5;
        }
        // rigidez: el punto de dos más arriba no puede acercarse (el pelo no se dobla en seco)
        var c = this.idx(g, i - 2);
        var bx = x[b] - x[c],
          by = y[b] - y[c];
        var bl = Math.sqrt(bx * bx + by * by) || 1;
        if (bl < seg * 2) {
          var kb = ((0.32 * (1 - i / S) + 0.06) * (seg * 2 - bl)) / bl;
          if (i <= 3) {
            x[b] += bx * kb;
            y[b] += by * kb;
          } else {
            x[c] -= bx * kb * 0.5;
            y[c] -= by * kb * 0.5;
            x[b] += bx * kb * 0.5;
            y[b] += by * kb * 0.5;
          }
        }
      }
    }
    // el mechón se mantiene unido: cada guía guarda la distancia con su vecina
    for (g = 0; g < G - 1; g++) {
      var rest = this.rx[g + 1] - this.rx[g];
      for (i = 2; i <= S; i++) {
        var p = this.idx(g, i),
          q = this.idx(g + 1, i);
        var target = rest * (1 - (this.taper * i) / S);
        var ex = x[q] - x[p],
          ey = y[q] - y[p];
        var el = Math.sqrt(ex * ex + ey * ey) || 1;
        var k = ((el - target) / el) * 0.12;
        x[p] += ex * k;
        y[p] += ey * k * 0.3;
        x[q] -= ex * k;
        y[q] -= ey * k * 0.3;
      }
    }
  }
  for (g = 0; g < G; g++) pinned(this, g);
  // recortes que caen
  for (var m = this.parts.length - 1; m >= 0; m--) {
    var pt = this.parts[m];
    pt.vy += 0.16;
    pt.vx *= 0.985;
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.a += pt.va;
    pt.life -= 1 / 75;
    if (pt.life <= 0) this.parts.splice(m, 1);
  }
  var still = energy < G * S * 0.012;
  if (still && !ptr && !this.breeze && !this.parts.length && !this.anim)
    this.awake = Math.max(0, this.awake - 0.02);
  else this.awake = 1;
};

/* Posición de un cabello en el punto i (con su desfase y algo de encrespado) */
Lock.prototype.strandPts = function (s, out) {
  var S = this.S,
    x = this.x,
    y = this.y;
  var a = this.idx(s.g, 0),
    b = this.idx(Math.min(s.g + 1, this.G - 1), 0);
  var frizz = this.damage;
  var lenFrac = s.len * this.cut;
  var last = Math.max(2, lenFrac * S);
  var n = Math.ceil(last);
  for (var i = 0; i <= n; i++) {
    var ii = Math.min(i, S);
    var xa = x[a + ii],
      ya = y[a + ii],
      xb = x[b + ii],
      yb = y[b + ii];
    var t = i / S;
    var fz = frizz * Math.pow(t, 3) * Math.sin(s.fz + i * 1.9) * 7 * s.fa;
    var wave = Math.sin(s.fz + i * 0.5) * s.fa * 1.3 * t + s.lag * t * t * 2.2;
    out[i * 2] = xa + (xb - xa) * s.f + s.off * (1 - this.taper * t) + fz + wave;
    out[i * 2 + 1] = ya + (yb - ya) * s.f;
  }
  // el último punto, a la fracción exacta del largo
  var fr = last - Math.floor(last);
  if (fr > 0 && n >= 1) {
    out[n * 2] = out[(n - 1) * 2] + (out[n * 2] - out[(n - 1) * 2]) * fr;
    out[n * 2 + 1] = out[(n - 1) * 2 + 1] + (out[n * 2 + 1] - out[(n - 1) * 2 + 1]) * fr;
  }
  return n;
};

var buf = new Float32Array(256);
Lock.prototype.trace = function (ctx, list) {
  for (var k = 0; k < list.length; k++) {
    var n = this.strandPts(list[k], buf);
    ctx.moveTo(buf[0], buf[1]);
    for (var i = 1; i < n; i++) {
      var mx = (buf[i * 2] + buf[i * 2 + 2]) * 0.5,
        my = (buf[i * 2 + 1] + buf[i * 2 + 3]) * 0.5;
      ctx.quadraticCurveTo(buf[i * 2], buf[i * 2 + 1], mx, my);
    }
    ctx.lineTo(buf[n * 2], buf[n * 2 + 1]);
  }
};

/* Degradado vertical del color del pelo, con la raíz natural si la hay */
Lock.prototype.grad = function (ctx, k, greyStrand, shift) {
  var top = this.oy,
    L = this.length;
  var g0 = ctx.createLinearGradient(0, top, 0, top + L);
  var g = {
    addColorStop: function (o, c) {
      g0.addColorStop(Math.max(0, Math.min(1, o)), c);
    },
  };
  var fade = this.damage * 0.22;
  var root = mul(this.root, k),
    tip = mixc(mul(this.tip, k), [226, 210, 180], fade);
  var dark = mul(root, 0.55);
  var r = this.regrowth / L;
  if (r > 0.002) {
    var nat = greyStrand ? [214, 210, 202] : mul(this.natural, k);
    var p = Math.min(r, this.painted * r);
    var edge = Math.min(0.98, r + (shift || 0) / L);
    g.addColorStop(0, css(p > 0 ? mul(root, 0.8) : mul(nat, 0.6)));
    if (p > 0.004) {
      g.addColorStop(Math.max(0, p - 0.003), css(root));
      g.addColorStop(p, css(nat));
    }
    g.addColorStop(Math.min(edge - 0.004, Math.max(p + 0.002, 0.03)), css(nat));
    g.addColorStop(Math.max(edge - 0.004, 0.001), css(nat));
    g.addColorStop(Math.min(edge + 0.008, 0.99), css(root));
  } else {
    g.addColorStop(0, css(dark));
    g.addColorStop(0.07, css(root));
  }
  g.addColorStop(Math.max(0.3, r + 0.08), css(root));
  g.addColorStop(1, css(tip));
  return g0;
};

Lock.prototype.draw = function () {
  var ctx = this.ctx,
    c = this.canvas;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, c.width / DPR, c.height / DPR);
  if (this.drop < 0) return;
  var G = this.G,
    S = this.S,
    x = this.x,
    y = this.y;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // cuerpo: una sombra densa detrás para que el mechón no se transparente
  ctx.beginPath();
  var cut = this.cut * 0.86;
  var lastI = Math.max(2, Math.floor(cut * S));
  var j;
  for (var i = 0; i <= lastI; i++) {
    j = this.idx(0, i);
    if (i === 0) ctx.moveTo(x[j] + 1, y[j]);
    else ctx.lineTo(x[j] + 1.5, y[j]);
  }
  for (var g = 1; g < G - 1; g++) {
    j = this.idx(g, lastI);
    ctx.lineTo(x[j], y[j] + this.seg[g] * 0.4);
  }
  for (i = lastI; i >= 0; i--) {
    j = this.idx(G - 1, i);
    ctx.lineTo(x[j] - 1.5, y[j]);
  }
  ctx.closePath();
  var body = this.grad(ctx, 0.62, false, 0);
  ctx.fillStyle = body;
  ctx.fill();

  // cabellos por grupos de tono
  var groups = [[], [], [], []];
  for (var k = 0; k < this.strands.length; k++) {
    var s = this.strands[k];
    if (this.regrowth > 0 && s.grey < this.grey) groups[3].push(s);
    else groups[s.v].push(s);
  }
  var tones = [0.78, 1, 1.16];
  var shifts = [-2, 1.5, 3];
  for (var v = 0; v < 3; v++) {
    if (!groups[v].length) continue;
    ctx.beginPath();
    this.trace(ctx, groups[v]);
    ctx.strokeStyle = this.grad(ctx, tones[v], false, shifts[v]);
    ctx.lineWidth = this.lineW * (v === 0 ? 1.35 : 1);
    ctx.globalAlpha = v === 0 ? 1 : 0.92;
    ctx.stroke();
  }
  if (groups[3].length) {
    ctx.beginPath();
    this.trace(ctx, groups[3]);
    ctx.strokeStyle = this.grad(ctx, 1.05, true, 0);
    ctx.lineWidth = this.lineW * 0.85;
    ctx.globalAlpha = 0.95;
    ctx.stroke();
  }

  // brillo: una franja de luz que cruza el mechón y se desplaza con el movimiento
  var sway = 0;
  for (g = 0; g < G; g++) {
    j = this.idx(g, S >> 1);
    sway += x[j] - this.restX(g, S >> 1);
  }
  sway /= G;
  var band =
    this.oy +
    this.length * (0.27 + Math.max(-0.08, Math.min(0.08, sway * 0.004))) +
    (this.shineY || 0);
  var L = this.length;
  var hl = mixc(this.tip, [255, 248, 236], 0.55);
  var sg = ctx.createLinearGradient(0, band - L * 0.12, 0, band + L * 0.12);
  sg.addColorStop(0, css(hl, 0));
  sg.addColorStop(0.5, css(hl, 0.55));
  sg.addColorStop(1, css(hl, 0));
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.22 * this.gloss * (1 - this.damage * 0.6) * (lum(this.tip) > 0.7 ? 0.55 : 1);
  ctx.beginPath();
  this.trace(
    ctx,
    this.strands.filter(function (st, i2) {
      return i2 % 3 === 0;
    }),
  );
  ctx.strokeStyle = sg;
  ctx.lineWidth = this.lineW * 1.4;
  ctx.stroke();
  // segundo reflejo, más bajo y suave
  var b2 = band + L * 0.36;
  var sg2 = ctx.createLinearGradient(0, b2 - L * 0.08, 0, b2 + L * 0.08);
  sg2.addColorStop(0, css(hl, 0));
  sg2.addColorStop(0.5, css(hl, 0.35));
  sg2.addColorStop(1, css(hl, 0));
  ctx.strokeStyle = sg2;
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  // puntas abiertas: horquillas claras al final de algunos cabellos
  if (this.damage > 0.05) {
    var dry = mixc(this.tip, [236, 222, 196], 0.45);
    ctx.beginPath();
    for (k = 0; k < this.strands.length; k += 3) {
      s = this.strands[k];
      if (s.fa > this.damage) continue;
      var n = this.strandPts(s, buf);
      var ex = buf[n * 2],
        ey = buf[n * 2 + 1];
      var dxp = ex - buf[(n - 1) * 2],
        dyp = ey - buf[(n - 1) * 2 + 1];
      var dl = Math.sqrt(dxp * dxp + dyp * dyp) || 1;
      var ux = dxp / dl,
        uy = dyp / dl,
        sp = 3 + 4 * this.damage;
      ctx.moveTo(ex - ux * 6, ey - uy * 6);
      ctx.lineTo(ex + ux * sp - uy * sp * 0.55, ey + uy * sp + ux * sp * 0.55);
      ctx.moveTo(ex - ux * 6, ey - uy * 6);
      ctx.lineTo(ex + ux * sp + uy * sp * 0.6, ey + uy * sp - ux * sp * 0.6);
    }
    ctx.strokeStyle = css(dry, 0.75);
    ctx.lineWidth = this.lineW * 0.7;
    ctx.stroke();
  }

  // la línea dorada del pincel cuando se retoca la raíz
  if (this.brushY >= 0) {
    var by = this.oy + this.brushY;
    var bg = ctx.createLinearGradient(this.ox - this.width, 0, this.ox + this.width, 0);
    bg.addColorStop(0, "rgba(241,230,200,0)");
    bg.addColorStop(0.5, "rgba(241,230,200,0.9)");
    bg.addColorStop(1, "rgba(241,230,200,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(this.ox - this.width * 0.8, by - 1, this.width * 1.6, 2);
  }

  // recortes cayendo
  if (this.parts.length) {
    ctx.strokeStyle = css(this.tip, 0.9);
    ctx.lineWidth = this.lineW;
    for (k = 0; k < this.parts.length; k++) {
      var pt = this.parts[k];
      ctx.globalAlpha = Math.max(0, Math.min(1, pt.life * 1.6));
      ctx.beginPath();
      var ca = Math.cos(pt.a),
        sa = Math.sin(pt.a);
      for (i = 0; i < pt.pts.length; i += 2) {
        var qx = pt.x + pt.pts[i] * ca - pt.pts[i + 1] * sa,
          qy = pt.y + pt.pts[i] * sa + pt.pts[i + 1] * ca;
        if (i === 0) ctx.moveTo(qx, qy);
        else ctx.lineTo(qx, qy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
};

/* Corta las puntas: lo que queda por debajo se suelta y cae */
Lock.prototype.snip = function (keep) {
  var old = this.cut;
  for (var k = 0; k < this.strands.length; k += 2) {
    var s = this.strands[k];
    var n = this.strandPts(s, buf);
    var from = Math.floor((keep / old) * n);
    if (from >= n) continue;
    var pts = [],
      ox = buf[from * 2],
      oy = buf[from * 2 + 1];
    for (var i = from; i <= n; i++) pts.push(buf[i * 2] - ox, buf[i * 2 + 1] - oy);
    this.parts.push({
      pts: pts,
      x: ox,
      y: oy,
      vx: (Math.random() - 0.5) * 1.6,
      vy: Math.random() * 0.6,
      a: 0,
      va: (Math.random() - 0.5) * 0.05,
      life: 1 + Math.random() * 0.4,
    });
  }
  this.cut = keep;
  this.awake = 1;
};

/* ---------- Bucle compartido ---------- */
var locks = [];
var running = false;
var lastT = 0,
  acc = 0;
var tick = function (now) {
  running = false;
  var any = false;
  // pasos fijos de 1/60 s: el pelo se mueve igual en pantallas de 60 y de 120 Hz
  var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60;
  lastT = now;
  acc += dt;
  var steps = Math.min(3, Math.floor(acc * 60 + 0.25));
  acc = Math.max(0, acc - steps / 60);
  for (var i = 0; i < locks.length; i++) {
    var L = locks[i];
    if (!L.visible) continue;
    if (L.anim) L.anim();
    if (L.awake > 0) {
      for (var k = 0; k < steps; k++) L.step(L.ptr && L.ptr.on ? L.ptr : null);
      if (steps) L.draw();
      any = true;
    }
    if (L.ptr) {
      L.ptr.vx *= 0.6;
      L.ptr.vy *= 0.6;
    }
  }
  if (any) {
    running = true;
    requestAnimationFrame(tick);
  } else lastT = 0;
};
export var wake = function (L) {
  L.awake = 1;
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
};
export var addLock = function (L) {
  if (locks.indexOf(L) < 0) locks.push(L);
};
export var removeLock = function (L) {
  locks = locks.filter(function (x) {
    return x !== L;
  });
};

export var sizeCanvas = function (canvas) {
  var r = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(r.width * DPR));
  canvas.height = Math.max(1, Math.round(r.height * DPR));
  return r;
};

/* Seguimiento del cursor o del dedo sobre una zona, en coordenadas de cada lienzo. Devuelve la limpieza. */
export var track = function (area, getLocks, radius, push) {
  var last = null;
  var move = function (e) {
    var now = { x: e.clientX, y: e.clientY };
    var vx = last ? now.x - last.x : 0,
      vy = last ? now.y - last.y : 0;
    last = now;
    getLocks().forEach(function (L) {
      var r = L.canvas.getBoundingClientRect();
      var lx = now.x - r.left,
        ly = now.y - r.top;
      var inside = lx > -radius && lx < r.width + radius && ly > -radius && ly < r.height + radius;
      if (!L.ptr) L.ptr = { x: 0, y: 0, vx: 0, vy: 0, r: radius, push: push, on: false };
      L.ptr.x = lx;
      L.ptr.y = ly;
      L.ptr.vx = L.ptr.vx * 0.4 + vx * 0.6;
      L.ptr.vy = L.ptr.vy * 0.4 + vy * 0.6;
      L.ptr.on = inside;
      if (inside) wake(L);
    });
  };
  var leave = function () {
    last = null;
    getLocks().forEach(function (L) {
      if (L.ptr) L.ptr.on = false;
    });
  };
  area.addEventListener("pointermove", move);
  area.addEventListener("pointerdown", move);
  area.addEventListener("pointerleave", leave);
  area.addEventListener("pointercancel", leave);
  return function () {
    area.removeEventListener("pointermove", move);
    area.removeEventListener("pointerdown", move);
    area.removeEventListener("pointerleave", leave);
    area.removeEventListener("pointercancel", leave);
  };
};

export { Lock, hex, css, lum, mixc, reduce };
