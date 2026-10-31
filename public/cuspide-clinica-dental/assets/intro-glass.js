/* Intro de entrada: el símbolo de la marca aparece tras una lámina de cristal que lo curva en
 * los bordes y luego lo suelta. Lo arranca intro.js (en el <head>) solo la primera vez por sesión.
 * Un único pase WebGL2, sin dependencias. El campo de distancias del logo se calcula en un Worker
 * (este mismo archivo) para no bloquear la carga de la página, que sigue cargando por detrás.
 * Shader y línea de tiempo adaptados de zanwei/glass-icon-reveal (MIT). */
(function () {
  'use strict';

  var TEX = 1024; // tamaño de la textura del logo
  var BOX = 0.75; // parte de la textura que ocupa el logo (el resto es margen para el campo)

  /* ------------------------------------------------------------------ *
   * Worker: campo de distancias con signo (método TinySDF)
   * ------------------------------------------------------------------ */
  if (typeof document === 'undefined') {
    self.onmessage = function (e) {
      var sdf = buildSdf(new Uint8ClampedArray(e.data));
      self.postMessage(sdf.buffer, [sdf.buffer]);
    };
    return;
  }

  function buildSdf(rgba) {
    var n = TEX * TEX;
    var INF = 1e20;
    var outer = new Float64Array(n);
    var inner = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      var a = rgba[i * 4 + 3] / 255;
      if (a >= 1) { outer[i] = 0; inner[i] = INF; }
      else if (a <= 0) { outer[i] = INF; inner[i] = 0; }
      else {
        var dd = 0.5 - a;
        outer[i] = dd > 0 ? dd * dd : 0;
        inner[i] = dd < 0 ? dd * dd : 0;
      }
    }
    var f = new Float64Array(TEX);
    var z = new Float64Array(TEX + 1);
    var v = new Uint16Array(TEX);
    edt(outer, f, v, z, INF);
    edt(inner, f, v, z, INF);
    var sdf = new Float32Array(n);
    for (var j = 0; j < n; j++) sdf[j] = (Math.sqrt(outer[j]) - Math.sqrt(inner[j])) / TEX;
    return sdf;
  }
  function edt(grid, f, v, z, INF) {
    for (var x = 0; x < TEX; x++) edt1d(grid, x, TEX, f, v, z, INF);
    for (var y = 0; y < TEX; y++) edt1d(grid, y * TEX, 1, f, v, z, INF);
  }
  function edt1d(grid, offset, stride, f, v, z, INF) {
    v[0] = 0; z[0] = -INF; z[1] = INF; f[0] = grid[offset];
    for (var q = 1, k = 0, s = 0; q < TEX; q++) {
      f[q] = grid[offset + q * stride];
      var q2 = q * q;
      do {
        var r = v[k];
        s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
      } while (s <= z[k] && --k > -1);
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    for (var q3 = 0, k2 = 0; q3 < TEX; q3++) {
      while (z[k2 + 1] < q3) k2++;
      var r2 = v[k2];
      var qr = q3 - r2;
      grid[offset + q3 * stride] = f[r2] + qr * qr;
    }
  }

  /* ------------------------------------------------------------------ *
   * Página
   * ------------------------------------------------------------------ */
  var G = window.__glassIntro;
  if (!G || G.started) return;
  G.started = true;
  var C = G.config;
  var selfUrl = (document.currentScript && document.currentScript.src) || C.engine;

  var LIGHT = {
    tileSize: 256, logoScale: 0.6, finalScale: 0.8, iconPlate: false,
    opticalDepth: 1.1, dispersion: 1.7, colorBleed: 1.25, doubleBevel: 1, bevelWidth: 0.14, corner: 4.8,
    cornerPull: 2.1, cornerWidth: 2.2, cornerFocus: 0.58, edgeSmear: 2.85, stretch: 0, tilt: 0.35, bulge: 1,
    specular: 1, halo: 0, shadow: 1, ripple: 1,
    bounce: 0, response: 0.42, startSize: 0.2, startZoom: 2.3, glide: 2.3, present: 2.4, drift: 0.12, swell: 0.5, focus: 1,
    sheen: 1, lightTurn: 0.9,
    background: '#e9e9eb', plateColor: '#ffffff'
  };
  var DARK = assign({}, LIGHT, {
    logoScale: 0.72, finalScale: 1, iconPlate: true,
    halo: 1, shadow: 0, ripple: 0.5, startZoom: 1.6, drift: 0.05,
    opticalDepth: 0.75, bevelWidth: 0.22, dispersion: 0.9,
    colorBleed: 0.45, corner: 5, cornerPull: 1.4, edgeSmear: 1.2, tilt: 0, cornerWidth: 1.2, cornerFocus: 0.4,
    background: '#000000', plateColor: '#05070b'
  });
  function assign(t) {
    for (var i = 1; i < arguments.length; i++) {
      var s = arguments[i];
      for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k) && s[k] !== undefined) t[k] = s[k];
    }
    return t;
  }
  var P = assign({}, C.look === 'dark' ? DARK : LIGHT, {
    background: C.bg,
    plateColor: C.plate,
    logoScale: C.scale,
    finalScale: C.final,
    startZoom: C.zoom
  });

  var HOLD = 0.35; // segundos con el logo ya quieto antes de abrir la web
  var FADE = 0.75; // fundido hacia la web
  var FADE_FAST = 0.4; // fundido si se salta con un toque o una tecla
  var WAIT = 3; // si el logo no está listo en este tiempo, se abre la web sin intro

  var overlay = null;
  var canvas = null;
  var renderer = null;
  var worker = null;
  var raf = 0;
  var closing = false;
  var startedAt = performance.now();

  /* ---------- logo → textura y campo de distancias ---------- */
  function prepareLogo() {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        try {
          var w = img.naturalWidth || TEX;
          var h = img.naturalHeight || TEX;
          var s = (TEX * BOX) / Math.max(w, h);
          var cv = document.createElement('canvas');
          cv.width = cv.height = TEX;
          var cx = cv.getContext('2d', { willReadFrequently: true });
          cx.imageSmoothingQuality = 'high';
          cx.drawImage(img, (TEX - w * s) / 2, (TEX - h * s) / 2, w * s, h * s);
          var px = cx.getImageData(0, 0, TEX, TEX).data;
          worker = new Worker(selfUrl);
          worker.onmessage = function (e) {
            worker.terminate();
            worker = null;
            resolve({ canvas: cv, sdf: new Float32Array(e.data) });
          };
          worker.onerror = function () { reject(new Error('intro: worker')); };
          worker.postMessage(px.buffer, [px.buffer]);
        } catch (err) { reject(err); }
      };
      img.onerror = function () { reject(new Error('intro: logo')); };
      img.src = C.logo;
    });
  }

  /* ---------- shader ---------- */
  var VERT = '#version 300 es\nin vec2 aPos;\nvoid main() { gl_Position = vec4(aPos, 0.0, 1.0); }';

  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'out vec4 outColor;',
    'uniform vec2 uCenter; uniform float uTile; uniform sampler2D uSdf; uniform sampler2D uCol;',
    'uniform float uTexSize; uniform float uBoxFrac; uniform float uPlateScale; uniform float uShapeN;',
    'uniform float uCornerN; uniform float uOptics; uniform float uPlateAlpha; uniform float uLogoHalf;',
    'uniform vec2 uLogoOff; uniform float uBold; uniform float uBlur; uniform float uFrost; uniform float uDome;',
    'uniform float uDrop; uniform float uPinch; uniform float uTilt; uniform float uRim; uniform float uHalo;',
    'uniform float uShadow; uniform float uGhost; uniform float uRipR; uniform float uRipA; uniform float uBare;',
    'uniform float uReach; uniform float uCornerPull; uniform float uStreak; uniform float uWiden; uniform float uSlab;',
    'uniform float uEtaSpread; uniform float uFocus; uniform float uFocusK; uniform float uFocusSplit;',
    'uniform float uRimLine; uniform float uCornerOn; uniform float uDissolve; uniform float uGlow;',
    'uniform float uFaceDisp; uniform float uVivid; uniform float uDisp; uniform float uDouble; uniform float uBevelW;',
    'uniform float uSpec; uniform float uIconPlate; uniform float uUseColor; uniform float uLightScene;',
    'uniform float uLightGlass; uniform float uKeep; uniform float uSheen; uniform float uSweep; uniform float uLightAng;',
    'uniform vec3 uBg; uniform vec3 uPlateCol; uniform vec3 uLogoCol;',
    'float px;',
    'vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }',
    'vec4 logoAt(vec2 q, float blur, float aa) {',
    '  float L = uLogoHalf;',
    '  float k = 0.5 * uBoxFrac / L;',
    '  vec2 uv = vec2(0.5 + (q.x - uLogoOff.x) * k, 0.5 - (q.y - uLogoOff.y) * k);',
    '  float d = texture(uSdf, uv).r / k;',
    '  float w = 0.75 * aa + blur;',
    '  float a = 1.0 - smoothstep(-w, w, d - uBold * L);',
    '  vec3 c = uLogoCol;',
    '  if (uUseColor > 0.5) {',
    '    float lod = log2(max(1.0, w * k * uTexSize));',
    '    vec4 c0 = textureLod(uCol, uv, lod);',
    '    vec4 c1 = textureLod(uCol, uv, lod + 3.0);',
    '    vec4 c2 = textureLod(uCol, uv, 7.0);',
    '    c = c2.rgb / max(c2.a, 1e-4);',
    '    c = mix(c, c1.rgb / max(c1.a, 1e-4), smoothstep(0.0, 0.06, c1.a));',
    '    c = mix(c, c0.rgb / max(c0.a, 1e-4), smoothstep(0.02, 0.3, c0.a));',
    '  }',
    '  return vec4(c, a);',
    '}',
    'float shape(vec2 p, float scale, float n, out vec2 nOut, out float g, out vec2 dg) {',
    '  vec2 pp = p / scale;',
    '  vec2 a = max(abs(pp), vec2(1e-6));',
    '  g = pow(pow(a.x, n) + pow(a.y, n), 1.0 / n);',
    '  dg = sign(pp) * pow(a, vec2(n - 1.0)) * pow(max(g, 1e-6), 1.0 - n);',
    '  float dgl = max(length(dg), 1e-6);',
    '  nOut = dg / dgl;',
    '  return (g - 1.0) / dgl * scale;',
    '}',
    'float contourRadius(vec2 p, float scale, float n) {',
    '  vec2 a = max(abs(p / scale), vec2(1e-4));',
    '  vec2 a1 = pow(a, vec2(n - 1.0));',
    '  vec2 a2 = pow(a, vec2(n - 2.0));',
    '  float k = (n - 1.0) * (a2.x * a1.y * a1.y + a2.y * a1.x * a1.x) / pow(max(dot(a1, a1), 1e-30), 1.5);',
    '  return scale / max(k, 1e-3);',
    '}',
    'vec2 refractSample(float x, float bwF, float eta, float R, vec2 dirOut, vec2 p, float dome, float offMul) {',
    '  float u = clamp(1.0 - x, 0.0, 0.995);',
    '  float th = asin(u), thr = asin(u / eta);',
    '  float z = uSlab + bwF * sqrt(1.0 - u * u);',
    '  float off = offMul * z * tan(th - thr);',
    '  off = off / (1.0 + off / (6.0 * R));',
    '  return p - (dirOut * off + p * dome) * uOptics;',
    '}',
    'float gauss(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }',
    'float band(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }',
    'float bump(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }',
    'vec3 spectrum(float x) {',
    '  return vec3(bump(x, 0.34, 0.2) + 0.08 * bump(x, 0.93, 0.05), bump(x, 0.58, 0.1), bump(x, 0.8, 0.11));',
    '}',
    'float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
    'void main() {',
    '  px = 2.0 / uTile;',
    '  vec2 p = (gl_FragCoord.xy - uCenter) * px;',
    '  vec4 lg = logoAt(p, uBlur, px);',
    '  vec3 plain = mix(uBg, lg.rgb, lg.a * uBare);',
    '  vec2 nOut, dg; float g;',
    '  float sd = shape(p, uPlateScale, uShapeN, nOut, g, dg);',
    '  float s = -sd;',
    '  float bw = max(uBevelW, 0.004) * uPlateScale;',
    '  float x = clamp(s / bw, 0.0, 1.0);',
    '  float R = contourRadius(p, uPlateScale, uShapeN);',
    '  vec2 pq = p * p;',
    '  float diag = 4.0 * pq.x * pq.y / max((pq.x + pq.y) * (pq.x + pq.y), 1e-6);',
    '  float tilt = mix(1.0 - uTilt, 1.0, smoothstep(-0.02, 0.02, p.x * p.y));',
    '  float pinchPart = uPinch * min(g * g, 1.0) * diag * diag * tilt;',
    '  float dome = uDome * (1.0 - min(g * g, 1.0)) + pinchPart;',
    '  vec2 dirOut = normalize(mix(nOut, p / max(length(p), 1e-4), 0.2));',
    '  float cornerness = max(smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y), smoothstep(0.15, 0.75, diag));',
    '  float offMul = 1.0 + 0.4 * max(uCornerPull - 1.0, 0.0) * tilt * cornerness * uCornerOn;',
    '  vec2 focus = sign(p) * (pow(0.5, 1.0 / uShapeN) - uFocus * 0.70710678) * uPlateScale;',
    '  float focusW = tilt * cornerness * uOptics * uCornerOn;',
    '  float bwF = max(uReach, 0.004) * (1.0 + uWiden * tilt * cornerness * uCornerOn);',
    '  float xf = clamp(s / bwF, 0.0, 1.0);',
    '  vec2 qc = refractSample(xf, bwF, 1.5, R, dirOut, p, dome, offMul);',
    '  float foot = max(max(length(dFdx(qc)), length(dFdy(qc))), 0.25 * px);',
    '  vec3 bg = uBg;',
    '  vec3 lift = mix(uBg + vec3(0.06), mix(uBg, vec3(1.0), 0.55), uLightScene);',
    '  if (uGhost > 0.001) {',
    '    vec2 gn, gdg; float gg;',
    '    float gsd = shape(p, 1.0, uCornerN, gn, gg, gdg);',
    '    bg = mix(bg, lift, uGhost * 0.12 * (1.0 - smoothstep(-0.16, 0.14, gsd)));',
    '    bg *= 1.0 - uGhost * 0.03 * uLightScene * exp(-max(gsd, 0.0) / 0.12) * step(0.0, gsd);',
    '  }',
    '  float outside = max(sd, 0.0);',
    '  if (uRipA > 0.001) {',
    '    float d0 = (uRipR - 1.0) * uPlateScale;',
    '    float rx = (sd - d0) / 0.022;',
    '    float ring = exp(-rx * rx);',
    '    bg += uRipA * ring * (0.04 * (0.55 + 0.45 * dot(nOut, normalize(vec2(-0.5, 0.8))))) * mix(0.5, 1.0, uLightScene);',
    '    bg -= uRipA * 0.016 * uLightScene * exp(-(rx - 1.6) * (rx - 1.6));',
    '  }',
    '  float shadowFall = max(sd, 0.0) / (0.9 * uPlateScale);',
    '  bg *= 1.0 - uShadow * 0.03 * exp(-shadowFall * shadowFall) * step(0.0, sd);',
    '  vec3 haloCol = mix(vec3(0.62, 0.69, 0.80), vec3(1.0), uLightScene);',
    '  bg = mix(bg, haloCol, clamp(uHalo * (0.30 * exp(-outside / (0.025 * uPlateScale)) + 0.07 * exp(-outside / (0.12 * uPlateScale))), 0.0, 1.0) * step(0.0, sd));',
    '  vec3 col = bg;',
    '  float soft = px + uBlur * 0.8 + 0.06 * uDissolve * (1.0 - uKeep) * uPlateScale;',
    '  if (sd < soft) {',
    '    float y1 = 1.0 - x;',
    '    const float K = 2.6;',
    '    float base1 = max(1.0 - pow(y1, K), 1e-4);',
    '    float db = min(pow(y1, K - 1.0) * pow(base1, 1.0 / K - 1.0), 25.0);',
    '    float s1 = bw * 0.62;',
    '    float w2 = bw * 0.22;',
    '    float t2 = clamp((s - s1) / w2, -1.0, 1.0);',
    '    float dh2 = uDouble * bw * 0.16;',
    '    float dd = dh2 * 0.5 * cos(t2 * 1.5707963) * 1.5707963 / w2 * step(abs(t2), 0.999);',
    '    vec2 gDome = -uDome * 2.0 * g * dg * step(g, 1.0);',
    '    vec2 grad = -(db + dd) * nOut + gDome;',
    '    vec3 back = mix(uBg, uPlateCol, uIconPlate);',
    '    vec3 liftG = mix(back + vec3(0.06), mix(back, vec3(1.0), 0.55), uLightGlass);',
    '    float rblur = uBlur + 0.05 * length(qc - p) + min(uGlow * uOptics * (1.0 - xf) * foot / px, 0.04);',
    '    float cornerW = smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y);',
    '    float streak = 0.35 * uStreak * bw * mix(0.15, 1.0, cornerW) * pow(1.0 - xf, 1.5) * uOptics;',
    '    vec2 tangent = vec2(-nOut.y, nOut.x);',
    '    vec3 acc = vec3(0.0), wsum = vec3(0.0);',
    '    for (int i = 0; i < 20; i++) {',
    '      float lam = (float(i) + 0.5) / 20.0;',
    '      float c = uDisp * (1.0 - 2.0 * lam);',
    '      vec2 along = tangent * (streak * 2.0 * (fract(float(i) * 0.618034 + 0.31) - 0.5));',
    '      float cf = uDisp * (1.0 - 2.0 * lam) * (lam > 0.5 ? 1.0 : 0.5);',
    '      vec2 sp = refractSample(xf, bwF, 1.5 + uEtaSpread * c, R, dirOut, p + along, dome + pinchPart * 0.3 * c, offMul);',
    '      vec2 focusL = focus - sign(p) * (0.70710678 * uFocusSplit * c * uPlateScale);',
    '      float wFocus = pow(1.0 - xf, uFocusK) * smoothstep(0.0, uRimLine * (1.0 + 0.6 * c), xf);',
    '      sp = mix(sp, mix(p + along, focusL, wFocus), focusW);',
    '      float faceOnly = smoothstep(0.7, 1.0, xf) * uOptics;',
    '      sp *= 1.0 + uFaceDisp * cf * faceOnly;',
    '      vec4 l = logoAt(sp, rblur + 0.12 * streak + uFaceDisp * 0.5 * max(c, 0.0) * faceOnly, foot);',
    '      vec3 w = spectrum(lam);',
    '      acc += mix(back, l.rgb, l.a) * w;',
    '      wsum += w;',
    '    }',
    '    vec3 trans = acc / wsum;',
    '    float tl = dot(trans, vec3(0.2126, 0.7152, 0.0722));',
    '    trans = clamp(tl + (trans - tl) * (1.0 + uVivid * uOptics), 0.0, 1.0);',
    '    float hazeLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));',
    '    float hazeGate = mix(1.0 - smoothstep(0.25, 0.75, hazeLum), smoothstep(0.25, 0.75, hazeLum), uLightGlass);',
    '    trans = mix(trans, liftG, uFrost * 0.45 * hazeGate);',
    '    float glassAmt = pow(1.0 - uDissolve, 1.5);',
    '    float lit = uSpec * glassAmt;',
    '    vec3 rimCol = mix(vec3(0.80, 0.87, 0.97), vec3(1.0), uLightGlass);',
    '    float sc = uPlateScale;',
    '    float tLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));',
    '    float lightOnly = smoothstep(0.35, 0.85, tLum);',
    '    float hw = smoothstep(-0.85, 0.5, dot(nOut, rot(vec2(0.5, 0.866), uLightAng)));',
    '    float tileBand = band(s, 0.016 * sc, 0.075 * sc, 0.022 * sc);',
    '    float dropBand = (1.0 - smoothstep(0.06 * sc, 0.13 * sc, s)) * smoothstep(0.0, 0.004 * sc, s);',
    '    float glow = mix(0.32 * tileBand, 0.75 * dropBand, uDrop) * lightOnly;',
    '    float edgeLine = gauss(s, 0.005 * sc, 0.0045 * sc);',
    '    float lip = gauss(s, 0.15 * sc, 0.007 * sc) * uDouble * (1.0 - uDrop);',
    '    vec3 lightGlass = mix(trans, vec3(1.0), glow * glassAmt);',
    '    lightGlass += (0.075 * hw * edgeLine + 0.06 * (0.4 + 0.6 * hw) * lip) * lit;',
    '    lightGlass *= 1.0 - 0.05 * (1.0 - hw) * edgeLine * glassAmt * (1.0 - uDrop);',
    '    lightGlass = mix(lightGlass, vec3(1.0), 0.55 * uDrop * glassAmt * edgeLine);',
    '    vec3 Nl = normalize(vec3(-grad, 1.0));',
    '    float edge = 1.0 - Nl.z;',
    '    vec2 ldir = rot(normalize(vec2(-0.62, 0.78)), uLightAng);',
    '    float side = dot(nOut, ldir);',
    '    float fres = pow(edge, 1.5);',
    '    vec3 rim = rimCol * fres * (0.35 + 0.65 * max(side, -side * 0.8)) * uRim * 0.65;',
    '    vec3 Hv = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));',
    '    float spc = pow(max(dot(Nl, Hv), 0.0), 140.0) * 0.8 * smoothstep(0.0, 0.25, y1);',
    '    vec3 darkGlass = trans * (1.0 - 0.25 * fres) + (rim + vec3(spc)) * lit;',
    '    darkGlass = mix(darkGlass, rimCol, uDrop * 0.4 * uSpec * (1.0 - smoothstep(0.0, 0.1 * uPlateScale, s)));',
    '    vec3 glass = mix(darkGlass, lightGlass, uLightGlass);',
    '    float sweepD = dot(p / uPlateScale, normalize(vec2(0.8, 0.6))) - uSweep;',
    '    float sheen = uSheen * glassAmt * exp(-sweepD * sweepD / 0.03) * (0.55 + 0.45 * (1.0 - x));',
    '    glass = mix(glass, vec3(1.0), sheen * mix(0.22, 0.42, uLightGlass));',
    '    float cov = clamp(0.5 - sd / soft, 0.0, 1.0);',
    '    col = mix(bg, glass, cov);',
    '  }',
    '  vec3 outc = mix(plain, col, uPlateAlpha);',
    '  outc += (hash(gl_FragCoord.xy) - 0.5) / 255.0;',
    '  outColor = vec4(outc, 1.0);',
    '}'
  ].join('\n');

  /* ---------- renderer ---------- */
  // Compila el shader sin bloquear la página: con KHR_parallel_shader_compile el compilado se hace
  // en paralelo y solo se consulta su estado cuando ya ha terminado.
  function createRenderer(cv) {
    var gl = cv.getContext('webgl2', { antialias: false, premultipliedAlpha: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return Promise.reject(new Error('intro: webgl2'));
    var par = gl.getExtension('KHR_parallel_shader_compile');
    function shader(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    }
    var vs = shader(gl.VERTEX_SHADER, VERT);
    var fs = shader(gl.FRAGMENT_SHADER, FRAG);
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    return new Promise(function (resolve, reject) {
      var wait = function () {
        if (gl.isContextLost()) { reject(new Error('intro: context')); return; }
        if (par && !gl.getProgramParameter(prog, par.COMPLETION_STATUS_KHR)) { requestAnimationFrame(wait); return; }
        try { resolve(finishRenderer(gl, prog, vs, fs)); } catch (err) { reject(err); }
      };
      requestAnimationFrame(wait);
    });
  }

  function finishRenderer(gl, prog, vs, fs) {
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || gl.getProgramInfoLog(prog) || 'program');
    }
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    var count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < count; i++) {
      var info = gl.getActiveUniform(prog, i);
      U[info.name] = gl.getUniformLocation(prog, info.name);
    }
    var sdfTex = gl.createTexture();
    var colTex = gl.createTexture();
    gl.uniform1i(U.uSdf, 0);
    gl.uniform1i(U.uCol, 1);
    var hasLogo = false;

    function params(filter) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    return {
      setLogo: function (logo) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sdfTex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, TEX, TEX, 0, gl.RED, gl.FLOAT, logo.sdf);
        params(gl.LINEAR);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, colTex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, logo.canvas);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.generateMipmap(gl.TEXTURE_2D);
        params(gl.LINEAR_MIPMAP_LINEAR);
        hasLogo = true;
      },
      render: function (fr, w, h, tilePx) {
        if (!hasLogo) return;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(U.uCenter, w / 2, h / 2);
        gl.uniform1f(U.uTile, tilePx);
        gl.uniform1f(U.uTexSize, TEX);
        gl.uniform1f(U.uBoxFrac, BOX);
        for (var k in fr) {
          var v = fr[k];
          if (typeof v === 'number' && U[k]) gl.uniform1f(U[k], v);
        }
        gl.uniform3fv(U.uBg, fr.uBg);
        gl.uniform3fv(U.uPlateCol, fr.uPlateCol);
        gl.uniform3fv(U.uLogoCol, fr.uLogoCol);
        gl.uniform2fv(U.uLogoOff, fr.uLogoOff);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      dispose: function () {
        var ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    };
  }

  /* ---------- línea de tiempo (muelles) ---------- */
  var TAIL = 1.1;
  var END = P.present + TAIL;

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function smoother(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); }
  function hexToRgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    var v = parseInt(h.slice(0, 6), 16) || 0;
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  }
  function luminance(c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function spring(t, response, damping) {
    if (t <= 0) return 0;
    var w = (2 * Math.PI) / response;
    if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    var wd = w * Math.sqrt(1 - damping * damping);
    return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t));
  }
  function timeToReach(level, response, damping) {
    var lo = 0, hi = 3;
    for (var i = 0; i < 40; i++) {
      var mid = (lo + hi) / 2;
      if (spring(mid, response, damping) < level) lo = mid; else hi = mid;
    }
    return hi;
  }

  var damping = 1 - P.bounce;
  var TL = timeToReach(0.85, P.response, damping) - 0.01;
  var TM = timeToReach(0.92, P.response, damping) - 0.01;
  var BG = hexToRgb(P.background);
  var PLATE = hexToRgb(P.plateColor);
  var LOGO_COL = [1, 1, 1];
  var LIGHT_SCENE = luminance(BG) > 0.5 ? 1 : 0;
  var LIGHT_GLASS = luminance(P.iconPlate ? PLATE : BG) > 0.5 ? 1 : 0;

  function frameAt(T) {
    var tx = P.present;
    var grow = spring(T + 0.01, P.response, damping);
    var morph = spring(T - TM, 0.4, 1);
    var drop = 1 - smooth(0.05, 1, morph);
    var appear = smooth(0, 0.08, T);
    var drift = P.drift * spring(T - 0.3, 2.2, 1);
    var zoomIn = 0.25 * spring(T, 0.7, 1) + 0.75 * smoother(0, P.glide, T);
    var settle = spring(T - 0.5, 2.4, 1);
    var exit = spring(T - tx, 0.95, 1);
    var release = spring(T - tx - 0.05, 0.65, 1);
    var dome = 0.15 * P.bulge * (1 - smooth(0.4, 0.95, grow));
    var view = (1 + (P.startZoom - 1) * (1 - zoomIn)) * (1 - 0.045 * settle) * mix(1, P.finalScale, exit);
    var bandW = mix(P.bevelWidth, Math.max(P.bevelWidth, 0.4), drop);
    var plateScale = mix(P.startSize, 1, grow) * (1 + drift) * (1 + 0.14 * release);
    return {
      uPlateScale: plateScale,
      uShapeN: mix(2, P.corner, morph),
      uCornerN: P.corner,
      uOptics: 1 - smooth(0.55, 1, release),
      uPlateAlpha: appear * (1 - smooth(0.45, 1, release)),
      uLogoHalf: P.logoScale * view,
      uLogoOff: [0, 0],
      uKeep: 0,
      uSheen: P.sheen,
      uSweep: mix(-1.6, 1.6, smoother(0.9, tx - 0.1, T)),
      uLightAng: P.lightTurn * smoother(0.4, tx + 0.4, T),
      uBold: P.swell * 0.03 * (1 - zoomIn),
      uBlur: P.focus * 0.05 * (1 - smooth(0.3, 0.95, grow)),
      uFrost: P.focus * (1 - smooth(0.5, 0.95, grow)),
      uPinch: 0.38 * P.stretch * smooth(0.1, 0.9, morph) * smooth(0.75, 0.97, zoomIn),
      uTilt: P.tilt,
      uDome: dome,
      uDrop: drop,
      uRim: 1 + 0.8 * drop,
      uHalo: P.halo * (0.5 + 0.5 * drop),
      uShadow: P.shadow * smooth(0.45, 0.8, grow) * (1 - smooth(0, 0.6, morph)),
      uGhost: smooth(0, 0.03, T) * (1 - smooth(0.04, 0.08, T)),
      uRipR: 1 + 0.9 * Math.max(0, T - TL),
      uRipA: P.ripple * smooth(TL, TL + 0.06, T) * Math.exp(-Math.max(0, T - TL) / 0.6),
      uBare: smooth(tx - 0.25, tx, T),
      uReach: bandW * plateScale,
      uCornerPull: P.cornerPull,
      uStreak: P.edgeSmear,
      uWiden: P.cornerWidth,
      uSlab: 0.3 * P.opticalDepth,
      uEtaSpread: 0.06,
      uFocus: P.cornerFocus,
      uFocusK: 1.0,
      uFocusSplit: 0.056 * P.colorBleed,
      uRimLine: 0.09,
      uCornerOn: smooth(0.35, 1, morph),
      uGlow: 0.012 * P.colorBleed,
      uFaceDisp: 0.012 * P.dispersion,
      uVivid: 0.85,
      uDissolve: release,
      uDisp: P.dispersion,
      uDouble: P.doubleBevel,
      uBevelW: bandW * (1 - release),
      uSpec: P.specular,
      uIconPlate: P.iconPlate ? 1 : 0,
      uUseColor: 1,
      uLightScene: LIGHT_SCENE,
      uLightGlass: LIGHT_GLASS,
      uBg: BG,
      uPlateCol: PLATE,
      uLogoCol: LOGO_COL
    };
  }

  /* ---------- capa de la intro ---------- */
  function onBody(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'gi-intro';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;background:' + P.background +
      ';opacity:1;touch-action:none;cursor:pointer;contain:strict;';
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    overlay.appendChild(canvas);
    // Fuera de <body>: así la regla que pausa las animaciones de la web no la toca.
    document.documentElement.appendChild(overlay);
    var skip = function () { close(true); };
    overlay.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    overlay.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    overlay.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });
    overlay._skip = skip;
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); close(true); });
    try { return createRenderer(canvas); } catch (err) { return Promise.reject(err); }
  }

  function close(fast) {
    if (closing) return;
    closing = true;
    if (worker) { worker.terminate(); worker = null; }
    G.release(); // la web arranca sus animaciones mientras la intro se funde
    if (!overlay) return;
    window.removeEventListener('keydown', overlay._skip);
    var d = fast ? FADE_FAST : FADE;
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity ' + d + 's cubic-bezier(0.4, 0, 0.2, 1)';
    canvas.style.transition = 'transform ' + d + 's cubic-bezier(0.4, 0, 0.2, 1)';
    requestAnimationFrame(function () {
      overlay.style.opacity = '0';
      canvas.style.transform = 'scale(1.04)';
    });
    setTimeout(function () {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (renderer) renderer.dispose();
      renderer = null;
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }, d * 1000 + 80);
  }

  function play(both) {
    var logo = both[0];
    if (closing) { both[1].dispose(); return; }
    renderer = both[1];
    renderer.setLogo(logo);
    G.uncover();
    var time = 0;
    var holdLeft = HOLD;
    var last = performance.now();
    // Resolución adaptativa: si el móvil no llega, baja la densidad de píxeles en vez de dar tirones.
    var dprCap = Math.min(window.devicePixelRatio || 1, 2);
    var slowRun = 0;
    var drawnAt = -1;
    // Si aun así va a menos de minFps (GPU muy floja), se abre la web directamente.
    var minFps = C.minFps === undefined ? 10 : C.minFps;
    var playStart = last;
    var frames = 0;
    var checked = false;
    var tick = function (now) {
      raf = 0;
      if (!renderer) return;
      var raw = (now - last) / 1000;
      var dt = Math.min(0.1, raw);
      last = now;
      if (raw > 0.04) slowRun++; else slowRun = 0;
      if (slowRun >= 6 && dprCap > 1) { dprCap = Math.max(1, dprCap - 0.5); slowRun = 0; }
      frames++;
      if (!checked && now - playStart > 1500) {
        checked = true;
        if ((frames * 1000) / (now - playStart) < minFps) { close(true); return; }
      }
      if (time < END) time = Math.min(END, time + dt);
      else if (!closing) {
        holdLeft -= dt;
        if (holdLeft <= 0) close(false);
      }
      var dpr = dprCap;
      var cw = canvas.clientWidth;
      var ch = canvas.clientHeight;
      var w = Math.max(1, Math.round(cw * dpr));
      var h = Math.max(1, Math.round(ch * dpr));
      var resized = canvas.width !== w || canvas.height !== h;
      if (resized) { canvas.width = w; canvas.height = h; }
      // Con el logo ya quieto (espera y fundido) solo se redibuja si cambia el tamaño.
      if (resized || time !== drawnAt) {
        var tile = Math.min(P.tileSize, Math.min(cw, ch) / 1.75);
        renderer.render(frameAt(time), w, h, tile * dpr);
        drawnAt = time;
      }
      if (renderer) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  var ready = prepareLogo();
  var timeout = new Promise(function (_, reject) {
    setTimeout(function () { reject(new Error('intro: timeout')); }, WAIT * 1000 - (performance.now() - startedAt));
  });

  onBody(function () {
    var gpu = buildOverlay();
    Promise.race([Promise.all([ready, gpu]), timeout]).then(play, function () { close(true); });
  });
})();
