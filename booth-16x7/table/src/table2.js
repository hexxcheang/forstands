/* The Maxsen switch counter, after the reference image, in the Maxsen colourway.
   1,400 long, 500 deep, 850 high to the top of the gold. Units are metres: x along the length,
   z from the back (-) to the front (+), y up. */
// Forms from the one model: the rounded counter with its gold top (the default), or a marble block
// taking a share of the 850 height with no gold: { frac: 3/8 or 2/8, rect: square in plan, or rounded }.
function MaxsenModel(cfg = {}) {
  const RECT = !!cfg.rect, FRAC = cfg.frac || (RECT ? 3 / 8 : 0), GOLD = !FRAC;
  const L = 1.4, D = 0.5;
  const H = GOLD ? 0.84 : 0.85;            // H: top of the marble; on the gold form the 10 mm gold top brings it to 850
  const TOP = GOLD ? 0.12 : H * FRAC;      // the marble: 120 mm under the gold, or 3/8 (319 mm) or 2/8 (212 mm) of the height
  const R = RECT ? 0.006 : 0.15;           // corner radius of the marble in plan; switches sit on its front face
  const OV = 0.015;                        // the top overhangs the body by 15 mm
  const BL = L - 2 * OV, BD = D - 2 * OV, BR = RECT ? 0.022 : R - OV;
  const BASE = 0.06, T = 0.02;             // floating base; panel thickness
  const GS = GOLD ? 1.1 : 1, GT = GOLD ? 0.01 : 0, HG = H + GT; // the gold top: the marble's plan scaled 1.1x, 10 mm thick
  const Y0 = BASE, Y1 = H - TOP;           // body from the base to the underside of the top
  const DIV = 0.33;                        // dividers either side of the centre niche, 660 apart
  // shelf heights in both end bays, evenly spaced in the body below the marble: two shelves, or one on the shorter rectangular body
  const SHELVES = GOLD ? [0.307, 0.513] : [(Y0 + .04 + Y1) / 2 - .0125];
  const SANS = 'Lato, "Helvetica Neue", Arial, sans-serif';

  /* ---------- finishes: the Maxsen palette, for every surface ---------- */
  // colours are the look you see (sRGB); the metals are tuned to read right under the show lights
  const mrb = (bg, v1, v2) => `linear-gradient(135deg,${bg} 0 38%,${v1} 40%,${bg} 43% 68%,${v2} 70%,${bg} 72%)`;
  const grain = (a, b) => `repeating-linear-gradient(0deg,${a} 0 3px,${b} 3px 4px)`;
  const shine = (a, b, c) => `linear-gradient(135deg,${a},${b},${c})`;
  const fade = (a, b) => `linear-gradient(0deg,${a},${b})`;
  const FINISHES = {
    // stone
    marble:     { group: 'Stone', name: 'White marble', tex: 'marble', roughness: .38, clearcoat: .25, clearcoatRoughness: .35, css: mrb('#f4f1ec', '#cfcac3', '#c9ad84') },
    calacatta:  { group: 'Stone', name: 'Calacatta gold', tex: 'calacatta', roughness: .35, clearcoat: .3, clearcoatRoughness: .3, css: mrb('#f6f3ee', '#b8955a', '#c9a46a') },
    rosa:       { group: 'Stone', name: 'Rosa marble', tex: 'rosa', roughness: .35, clearcoat: .3, clearcoatRoughness: .3, css: mrb('#e8cfc8', '#fbf6f4', '#f6ece8') },
    verde:      { group: 'Stone', name: 'Verde marble', tex: 'verde', roughness: .3, clearcoat: .45, clearcoatRoughness: .2, css: mrb('#1f3a2e', '#dfe8e2', '#b9cfc2') },
    nero:       { group: 'Stone', name: 'Black marble', tex: 'nero', roughness: .3, clearcoat: .45, clearcoatRoughness: .2, css: mrb('#171615', '#a9a6a2', '#c9a46a') },
    travertine: { group: 'Stone', name: 'Travertine', tex: 'travertine', roughness: .6, css: 'repeating-linear-gradient(0deg,#dccbb0 0 5px,#cdb998 5px 7px,#e3d4bc 7px 11px)' },
    terrazzo:   { group: 'Stone', name: 'Terrazzo', tex: 'terrazzo', roughness: .45, clearcoat: .2, css: 'radial-gradient(circle at 30% 30%,#cfa594 0 3px,transparent 4px),radial-gradient(circle at 70% 60%,#29221f 0 2px,transparent 3px),radial-gradient(circle at 45% 75%,#b98a3e 0 2px,transparent 3px),radial-gradient(circle at 75% 25%,#9a9590 0 3px,transparent 4px),#eee8e0' },
    // colour
    white:      { group: 'Colour', name: 'White', color: 0xF2EFEA, roughness: .6, css: '#F2EFEA' },
    gloss:      { group: 'Colour', name: 'Gloss white', color: 0xF8F6F3, roughness: .1, clearcoat: 1, clearcoatRoughness: .05, css: 'linear-gradient(135deg,#ffffff,#e9e6e1)' },
    ivory:      { group: 'Colour', name: 'Ivory', color: 0xEFE6D6, roughness: .55, css: '#EFE6D6' },
    sand:       { group: 'Colour', name: 'Sand', color: 0xD8C3A5, roughness: .6, css: '#D8C3A5' },
    greige:     { group: 'Colour', name: 'Greige', color: 0xB8AB9C, roughness: .6, css: '#B8AB9C' },
    blush:      { group: 'Colour', name: 'Blush', color: 0xE6C9BC, roughness: .55, css: '#E6C9BC' },
    rose:       { group: 'Colour', name: 'Maxsen rose', color: 0xCFA594, roughness: .55, css: '#CFA594' },
    dustypink:  { group: 'Colour', name: 'Dusty pink', color: 0xC9928B, roughness: .55, css: '#C9928B' },
    terracotta: { group: 'Colour', name: 'Terracotta', color: 0xB86B4B, roughness: .6, css: '#B86B4B' },
    lilac:      { group: 'Colour', name: 'Lilac', color: 0xC4B4CC, roughness: .55, css: '#C4B4CC' },
    powder:     { group: 'Colour', name: 'Powder blue', color: 0xB9C7D3, roughness: .55, css: '#B9C7D3' },
    sage:       { group: 'Colour', name: 'Sage', color: 0x9AA58E, roughness: .6, css: '#9AA58E' },
    forest:     { group: 'Colour', name: 'Forest green', color: 0x2C4638, roughness: .5, css: '#2C4638' },
    navy:       { group: 'Colour', name: 'Navy', color: 0x1F2A3C, roughness: .5, css: '#1F2A3C' },
    mocha:      { group: 'Colour', name: 'Mocha', color: 0x6E5444, roughness: .55, css: '#6E5444' },
    charcoal:   { group: 'Colour', name: 'Charcoal', color: 0x34322F, roughness: .55, css: '#34322F' },
    black:      { group: 'Colour', name: 'Matte black', color: 0x141414, roughness: .7, css: '#141414' },
    // wood
    oak:        { group: 'Wood', name: 'Light oak', tex: 'oak', roughness: .55, css: grain('#d2b994', '#c3a67d') },
    paleoak:    { group: 'Wood', name: 'Pale oak', tex: 'paleoak', roughness: .55, css: grain('#e2d0b4', '#d3bd9b') },
    teak:       { group: 'Wood', name: 'Teak', tex: 'teak', roughness: .5, css: grain('#9a6a40', '#7f5530') },
    smoked:     { group: 'Wood', name: 'Smoked oak', tex: 'smoked', roughness: .5, css: grain('#7b6450', '#634e3d') },
    walnut:     { group: 'Wood', name: 'Walnut', tex: 'walnut', roughness: .5, css: grain('#5a3d2b', '#3f2a1d') },
    ebony:      { group: 'Wood', name: 'Ebony', tex: 'ebony', roughness: .45, css: grain('#2a1e18', '#1a120e') },
    // metal
    gold:       { group: 'Metal', name: 'Brushed gold', color: 0xB98A3E, metalness: 1, roughness: .3, clearcoat: .25, clearcoatRoughness: .25, css: shine('#8f6526', '#e0bf7a', '#b98a3e') },
    rosegold:   { group: 'Metal', name: 'Rose gold', color: 0xB06A55, metalness: 1, roughness: .28, clearcoat: .25, clearcoatRoughness: .25, css: shine('#9a6555', '#efc8b8', '#c08a78') },
    champagne:  { group: 'Metal', name: 'Champagne', color: 0xCDB58E, metalness: 1, roughness: .32, clearcoat: .2, clearcoatRoughness: .25, css: shine('#a8916a', '#efe0c2', '#cdb58e') },
    brass:      { group: 'Metal', name: 'Antique brass', color: 0x8C6A33, metalness: 1, roughness: .4, css: shine('#5e4520', '#b9955a', '#8c6a33') },
    copper:     { group: 'Metal', name: 'Copper', color: 0xB0663E, metalness: 1, roughness: .32, clearcoat: .2, css: shine('#7d4224', '#e3a37a', '#b0663e') },
    silver:     { group: 'Metal', name: 'Brushed silver', color: 0xC4C4C6, metalness: 1, roughness: .3, css: shine('#8d8d90', '#f2f2f3', '#c4c4c6') },
    gunmetal:   { group: 'Metal', name: 'Gunmetal', color: 0x4A4C50, metalness: 1, roughness: .35, css: shine('#2b2c2f', '#7d8085', '#4a4c50') },
    blackchrome:{ group: 'Metal', name: 'Black chrome', color: 0x1C1C1E, metalness: 1, roughness: .18, clearcoat: .5, css: shine('#050505', '#5b5b60', '#1c1c1e') },
    bronze:     { group: 'Metal', name: 'Midnight bronze', color: 0x29221F, metalness: .5, roughness: .4, css: '#29221F' },
    // gradient: from the bottom of the surface to the top
    fadeRose:   { group: 'Gradient', name: 'White to rose gold', grad: [0xF4F1EC, 0xC07F6B], metalness: .3, roughness: .3, clearcoat: .4, clearcoatRoughness: .2, css: fade('#f4f1ec', '#c07f6b') },
    fadeGold:   { group: 'Gradient', name: 'White to gold', grad: [0xF4F1EC, 0xC69A4F], metalness: .3, roughness: .3, clearcoat: .4, clearcoatRoughness: .2, css: fade('#f4f1ec', '#c69a4f') },
    fadeChamp:  { group: 'Gradient', name: 'Ivory to champagne', grad: [0xF4EEE4, 0xCDB58E], metalness: .25, roughness: .3, clearcoat: .4, clearcoatRoughness: .2, css: fade('#f4eee4', '#cdb58e') },
    blushGold:  { group: 'Gradient', name: 'Blush to gold', grad: [0xE6C9BC, 0xC69A4F], metalness: .3, roughness: .35, clearcoat: .3, clearcoatRoughness: .25, css: fade('#e6c9bc', '#c69a4f') },
    blushRose:  { group: 'Gradient', name: 'Blush to rose gold', grad: [0xF1DDD4, 0xB8735E], metalness: .3, roughness: .32, clearcoat: .35, clearcoatRoughness: .2, css: fade('#f1ddd4', '#b8735e') },
    roseGold2:  { group: 'Gradient', name: 'Rose gold to gold', grad: [0xC07F6B, 0xC69A4F], metalness: .45, roughness: .3, clearcoat: .3, clearcoatRoughness: .2, css: fade('#c07f6b', '#c69a4f') },
    lilacBlush: { group: 'Gradient', name: 'Lilac to blush', grad: [0xC4B4CC, 0xF1DDD4], roughness: .5, css: fade('#c4b4cc', '#f1ddd4') },
    sunset:     { group: 'Gradient', name: 'Terracotta to blush', grad: [0xB86B4B, 0xF1DDD4], roughness: .5, css: fade('#b86b4b', '#f1ddd4') },
    sageFade:   { group: 'Gradient', name: 'Sage to white', grad: [0x9AA58E, 0xF4F1EC], roughness: .5, css: fade('#9aa58e', '#f4f1ec') },
    skyFade:    { group: 'Gradient', name: 'Powder blue to white', grad: [0xB9C7D3, 0xF4F1EC], roughness: .5, css: fade('#b9c7d3', '#f4f1ec') },
    silverFade: { group: 'Gradient', name: 'White to silver', grad: [0xF4F1EC, 0xB9BABD], metalness: .35, roughness: .3, clearcoat: .4, clearcoatRoughness: .2, css: fade('#f4f1ec', '#b9babd') },
    navyGold:   { group: 'Gradient', name: 'Navy to gold', grad: [0x1F2A3C, 0xC69A4F], metalness: .35, roughness: .35, clearcoat: .3, clearcoatRoughness: .25, css: fade('#1f2a3c', '#c69a4f') },
    blackGold:  { group: 'Gradient', name: 'Black to gold', grad: [0x141414, 0xC69A4F], metalness: .4, roughness: .32, clearcoat: .3, clearcoatRoughness: .25, css: fade('#141414', '#c69a4f') },
    dusk:       { group: 'Gradient', name: 'Bronze to rose gold', grad: [0x2A2320, 0xC07F6B], metalness: .45, roughness: .32, clearcoat: .3, clearcoatRoughness: .25, css: fade('#2a2320', '#c07f6b') }
  };
  const SLOTS = [['top', 'Top'], ...(GOLD ? [['gold', 'Gold layer']] : []), ['body', 'Body'], ['inner', 'Shelves and bays'], ['base', 'Base'], ['stands', 'Lock stands']];
  const FINISH_DEFAULT = { top: 'marble', gold: 'gold', body: 'oak', inner: 'paleoak', base: 'bronze', stands: 'oak' };
  const PRESETS = {
    original: { name: 'As designed', f: FINISH_DEFAULT },
    porcelain: { name: 'Porcelain and rose gold', f: { top: 'marble', gold: 'rosegold', body: 'gloss', inner: 'blush', base: 'rosegold', stands: 'gloss' } },
    rosefade: { name: 'Rose gold fade', f: { top: 'marble', gold: 'rosegold', body: 'fadeRose', inner: 'white', base: 'rosegold', stands: 'white' } },
    midnight: { name: 'Midnight', f: { top: 'nero', gold: 'gold', body: 'bronze', inner: 'walnut', base: 'bronze', stands: 'walnut' } },
    sage: { name: 'Sage and brass', f: { top: 'calacatta', gold: 'brass', body: 'sage', inner: 'ivory', base: 'brass', stands: 'ivory' } },
    navy: { name: 'Navy and gold', f: { top: 'marble', gold: 'gold', body: 'navy', inner: 'walnut', base: 'gold', stands: 'navy' } },
    terracotta: { name: 'Terracotta', f: { top: 'terrazzo', gold: 'copper', body: 'terracotta', inner: 'travertine', base: 'bronze', stands: 'sand' } }
  };
  const cleanFinishes = f => { const o = Object.assign({}, FINISH_DEFAULT); if (f && typeof f === 'object') for (const [k, v] of Object.entries(f)) if (k in FINISH_DEFAULT && typeof v === 'string' && v in FINISHES) o[k] = v; return o; };

  /* ---------- the arrangement: what stands where, and the surfaces it can stand on ---------- */
  const LOCK_VARIANTS = [
    { name: 'F3 Ultra Air View · Rosewood', frame: 0x1c1917, trim: '#B9876A', lower: 'rosewood', cam: false },
    { name: 'F3 Ultra Air View · Gold Aurora Marble', frame: 0x161616, trim: '#C9A46A', lower: 'marble', cam: false },
    { name: 'F3 Ultra camera · Shooting Stars', frame: 0x34373c, trim: '#B8BCC2', lower: 'stars', cam: true },
    { name: 'F3 Ultra camera · Frosted Onyx Marble', frame: 0x1a1a1b, trim: '#B8BCC2', lower: 'onyx', cam: true },
    { name: 'The Sun Air View · solar', frame: 0xA27E4E, trim: '#D8B27A', lower: 'solar', cam: false },
    { name: 'The Sun camera · solar', frame: 0xB8955F, trim: '#E0C08A', lower: 'solar', cam: true }
  ];
  const CATALOGUES = { maxsen: 'Maxsen catalogues', lusano: 'Lusano catalogues', lenovo: 'Lenovo lock catalogues', halo: 'Halo catalogues' };
  const BROCHURES = { lenovo: 'Lenovo brochure stand', lusano: 'Lusano brochure stand', maxsen: 'Maxsen brochure stand' };
  const PLANTS = { olive: 'Olive tree', monstera: 'Monstera', succulent: 'Succulent bowl', orchid: 'White orchid', pothos: 'Golden pothos (trailing)', ivy: 'English ivy (trailing)', pearls: 'String of pearls (trailing)' };
  const KIND_VARIANTS = { lock: LOCK_VARIANTS.map((v, i) => [String(i), v.name]), catalogues: Object.entries(CATALOGUES), brochures: Object.entries(BROCHURES), plant: Object.entries(PLANTS), ball: [] };
  // each surface: its height, its plan outline (corner radii back-left, back-right, front-right, front-left) and the clear height above it
  const shelfY = [Y0 + .04, ...SHELVES.map(y => y + .0125)];
  const shelfH = shelfY.map((y, i) => (i < SHELVES.length ? SHELVES[i] - .0185 : Y1 - .012) - y);
  const SURF = {
    top: { label: GOLD ? 'Gold top' : 'Marble top', y: HG, x0: -L * GS / 2, x1: L * GS / 2, z0: -D * GS / 2, z1: D * GS / 2, rc: [R * GS, R * GS, R * GS, R * GS], h: 1.8 - HG }
  };
  (shelfY.length === 2 ? ['lower', 'upper'] : ['bottom', 'middle', 'top']).forEach((nm, i) => {
    SURF['L' + i] = { label: 'Left bay · ' + nm + ' shelf', y: shelfY[i], x0: -BL / 2 + .004, x1: -DIV - .015, z0: -BD / 2 + T + .004, z1: BD / 2 - .004, rc: [BR - T, 0, 0, BR], h: shelfH[i] };
    SURF['R' + i] = { label: 'Right bay · ' + nm + ' shelf', y: shelfY[i], x0: DIV + .015, x1: BL / 2 - .004, z0: -BD / 2 + T + .004, z1: BD / 2 - .004, rc: [0, BR - T, BR, 0], h: shelfH[i] };
  });
  const SURF_ORDER = ['top', ...shelfY.map((y, i) => 'L' + i).reverse(), ...shelfY.map((y, i) => 'R' + i).reverse()];
  // the arrangement from the page, saved 1 November 2026: locks staggered front and back, catalogues on the top shelves,
  // and trailing plants on the middle shelves, their vines hanging over the front edges
  const DEFAULT_LAYOUT = [
    { id: 'lock1', type: 'lock', v: '0', on: 'top', x: -.445, z: -.077, r: 0 },
    { id: 'lock2', type: 'lock', v: '1', on: 'top', x: -.225, z: .104, r: 0 },
    { id: 'lock3', type: 'lock', v: '2', on: 'top', x: -.03, z: -.079, r: 0 },
    { id: 'lock4', type: 'lock', v: '3', on: 'top', x: .188, z: .092, r: 0 },
    { id: 'lock5', type: 'lock', v: '4', on: 'top', x: .391, z: -.069, r: 0 },
    { id: 'lock6', type: 'lock', v: '5', on: 'top', x: .601, z: .099, r: 0 },
    { id: 'ball1', type: 'ball', on: 'top', x: -.608, z: .116, r: 0 },
    { id: 'cat1', type: 'catalogues', v: 'maxsen', on: 'L2', x: -.498, z: .056, r: 0, n: 4 },
    { id: 'cat2', type: 'catalogues', v: 'lusano', on: 'R2', x: .526, z: .035, r: 0, n: 4 },
    { id: 'pothos1', type: 'plant', v: 'pothos', on: 'L1', x: -.6, z: .15, r: 0, s: 1 },
    { id: 'ivy1', type: 'plant', v: 'ivy', on: 'L1', x: -.43, z: .16, r: .6, s: 1 },
    { id: 'pearls1', type: 'plant', v: 'pearls', on: 'R1', x: .43, z: .16, r: 0, s: 1 },
    { id: 'pothos2', type: 'plant', v: 'pothos', on: 'R1', x: .6, z: .15, r: 2, s: 1 }
  ];
  if (SHELVES.length === 1) DEFAULT_LAYOUT.forEach(d => { if (d.on === 'L2' || d.on === 'R2') d.on = d.on[0] + '0'; });
  // without shelves: the ends are closed, only the top is free; plants sit at the back corners and hang down the ends
  const DEFAULT_CLOSED = [
    ...DEFAULT_LAYOUT.filter(d => d.type === 'lock' || d.type === 'ball'),
    { id: 'pothos3', type: 'plant', v: 'pothos', on: 'top', x: -.66, z: -.13, r: 0, s: 1 },
    { id: 'ivy3', type: 'plant', v: 'ivy', on: 'top', x: .66, z: -.13, r: 0, s: 1 }
  ];
  function itemName(d) {
    if (d.type === 'lock') return 'Lenovo ' + (LOCK_VARIANTS[+d.v] || LOCK_VARIANTS[0]).name;
    if (d.type === 'ball') return 'Ball light';
    if (d.type === 'catalogues') return CATALOGUES[d.v] || 'Catalogues';
    if (d.type === 'brochures') return BROCHURES[d.v] || 'Brochure stand';
    return PLANTS[d.v] || 'Plant';
  }
  // keep untrusted saved layouts to known kinds, surfaces and sane numbers
  function sanitize(list) {
    if (!Array.isArray(list)) return null;
    const num = (v, lo, hi, dflt) => (typeof v === 'number' && isFinite(v)) ? Math.min(hi, Math.max(lo, v)) : dflt;
    const out = [], seen = new Set();
    for (const d of list.slice(0, 80)) {
      if (!d || typeof d !== 'object' || !(d.type in KIND_VARIANTS) || !(d.on in SURF)) continue;
      const id = typeof d.id === 'string' && /^[a-z0-9_-]{1,40}$/i.test(d.id) && !seen.has(d.id) ? d.id : d.type + Math.random().toString(36).slice(2, 8);
      seen.add(id);
      const vs = KIND_VARIANTS[d.type].map(v => v[0]);
      const v = vs.length ? (vs.includes(String(d.v)) ? String(d.v) : vs[0]) : undefined;
      const e = { id, type: d.type, on: d.on, x: num(d.x, -1, 1, 0), z: num(d.z, -1, 1, 0), r: num(d.r, -7, 7, 0) };
      if (v !== undefined) e.v = v;
      if (d.type === 'plant') e.s = num(d.s, .6, 1.4, 1);
      if (d.type === 'catalogues') e.n = Math.round(num(d.n, 1, 8, 4));
      out.push(e);
    }
    return out;
  }
  // the footprint of an item turned by r, as offsets from its origin
  function footprint(box, r, sc) {
    const c = Math.cos(r), s = Math.sin(r), e = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 };
    [[box.min.x, box.min.z], [box.max.x, box.min.z], [box.max.x, box.max.z], [box.min.x, box.max.z]].forEach(([x, z]) => {
      const X = (x * c + z * s) * sc, Z = (-x * s + z * c) * sc;
      e.x0 = Math.min(e.x0, X); e.x1 = Math.max(e.x1, X); e.z0 = Math.min(e.z0, Z); e.z1 = Math.max(e.z1, Z);
    });
    return e;
  }
  // keep the footprint on the surface, rounded corners included
  function clampTo(S, x, z, e) {
    const m = .004;
    x = Math.max(S.x0 + m - e.x0, Math.min(x, S.x1 - m - e.x1));
    z = Math.max(S.z0 + m - e.z0, Math.min(z, S.z1 - m - e.z1));
    [[S.x0, S.z0, -1, -1], [S.x1, S.z0, 1, -1], [S.x1, S.z1, 1, 1], [S.x0, S.z1, -1, 1]].forEach(([cx, cz, sx, sz], i) => {
      const r = S.rc[i]; if (!r) return;
      const ax = cx - sx * r, az = cz - sz * r;
      const px = x + (sx > 0 ? e.x1 : e.x0), pz = z + (sz > 0 ? e.z1 : e.z0);
      if ((px - ax) * sx > 0 && (pz - az) * sz > 0) {
        const dx = px - ax, dz = pz - az, d = Math.hypot(dx, dz), lim = r - m;
        if (d > lim) { const k = (d - lim) / d; x -= dx * k; z -= dz * k; }
      }
    });
    return [x, z];
  }

  /* ---------- plan shapes, drawn in x / z ---------- */
  function rr(THREE, w, d, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
    s.lineTo(x + w, y + d - r); s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2);
    s.lineTo(x + r, y + d); s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5); return s;
  }
  function arcBand(THREE, cx, cz, r, t, a0, a1) { // a curved wall, t thick, from angle a0 to a1
    const s = new THREE.Shape();
    s.moveTo(cx + Math.cos(a0) * r, cz + Math.sin(a0) * r); s.absarc(cx, cz, r, a0, a1, false);
    s.lineTo(cx + Math.cos(a1) * (r - t), cz + Math.sin(a1) * (r - t)); s.absarc(cx, cz, r - t, a1, a0, true); return s;
  }
  function endShelf(THREE, side, xIn, xOut, z0, z1, rb, rf) { // square at the divider, rounded at the two outer corners
    const s = new THREE.Shape();
    if (side > 0) {
      s.moveTo(xIn, z0); s.lineTo(xOut - rb, z0); s.absarc(xOut - rb, z0 + rb, rb, -Math.PI / 2, 0);
      s.lineTo(xOut, z1 - rf); s.absarc(xOut - rf, z1 - rf, rf, 0, Math.PI / 2); s.lineTo(xIn, z1); s.lineTo(xIn, z0);
    } else {
      s.moveTo(xIn, z0); s.lineTo(xIn, z1); s.lineTo(xOut + rf, z1); s.absarc(xOut + rf, z1 - rf, rf, Math.PI / 2, Math.PI);
      s.lineTo(xOut, z0 + rb); s.absarc(xOut + rb, z0 + rb, rb, Math.PI, Math.PI * 1.5); s.lineTo(xIn, z0);
    }
    return s;
  }
  function slab(THREE, shape, h, bevel) {
    const g = new THREE.ExtrudeGeometry(shape, { depth: h - (bevel ? 2 * bevel : 0), bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 5, curveSegments: 32 });
    g.rotateX(Math.PI / 2); g.translate(0, h - (bevel || 0), 0); g.computeVertexNormals(); return g;
  }

  // points every `step` metres round a rounded rectangle, with the direction of travel
  function perimeter(w, d, r, step) {
    const pts = [], hw = w / 2 - r, hd = d / 2 - r;
    const line = (x0, z0, x1, z1) => { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / step)); for (let i = 0; i < n; i++) { const t = i / n; pts.push({ x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t, a: Math.atan2(z1 - z0, x1 - x0) }); } };
    const arc = (cx, cz, a0, a1) => { const n = Math.max(1, Math.round(r * Math.abs(a1 - a0) / step)); for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, a: a + Math.PI / 2 }); } };
    line(-hw, d / 2, hw, d / 2); arc(hw, hd, Math.PI / 2, 0); line(w / 2, hd, w / 2, -hd); arc(hw, -hd, 0, -Math.PI / 2);
    line(hw, -d / 2, -hw, -d / 2); arc(-hw, -hd, -Math.PI / 2, -Math.PI); line(-w / 2, -hd, -w / 2, hd); arc(-hw, hd, -Math.PI, -Math.PI * 1.5);
    return pts;
  }

  /* ---------- textures ---------- */
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
  function tex(THREE, c, rx = 1, ry = 1) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; }
  const STONES = { // ground, two cloud tones, three vein tones and the accent vein
    white:     ['#F4F1EC', '228,222,214', '250,248,245', '244,241,236', ['120,118,116', '96,94,92', '110,108,106'], '176,142,92'],
    nero:      ['#161514', '40,38,36', '12,12,11', '22,21,20', ['150,148,145', '214,212,208', '190,188,184'], '176,142,92'],
    calacatta: ['#F6F3EE', '232,226,216', '252,250,247', '246,243,238', ['168,140,96', '150,118,70', '160,134,98'], '186,146,72'],
    rosa:      ['#E8CFC8', '240,222,216', '222,192,184', '232,207,200', ['250,244,242', '255,251,250', '205,172,162'], '190,150,138'],
    verde:     ['#1F3A2E', '34,66,50', '16,40,30', '31,58,46', ['170,196,182', '226,236,230', '186,206,196'], '214,224,216']
  };
  function stone(THREE, kind) { // marble: clouds, soft and sharp veins, and an accent vein
    const [bg, c1, c2, c0, vc, acc] = STONES[kind === true ? 'nero' : kind || 'white'];
    const [c, g] = canvas(2048, 1024);
    g.fillStyle = bg; g.fillRect(0, 0, 2048, 1024);
    for (let k = 0; k < 26; k++) { const x = rnd() * 2048, y = rnd() * 1024, r = 120 + rnd() * 320; const f = g.createRadialGradient(x, y, 0, x, y, r); f.addColorStop(0, `rgba(${rnd() > .6 ? c1 : c2},.7)`); f.addColorStop(1, `rgba(${c0},0)`); g.fillStyle = f; g.fillRect(0, 0, 2048, 1024); }
    const vein = (w, a, col, wob) => {
      g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = w; g.lineCap = 'round';
      g.beginPath(); let x = -40, y = rnd() * 1024; g.moveTo(x, y); const drift = (rnd() - .5) * 70;
      while (x < 2100) { const nx = x + 30 + rnd() * 60, ny = y + drift + (rnd() - .5) * wob; g.quadraticCurveTo(x + (nx - x) / 2, y + (rnd() - .5) * wob, nx, ny); x = nx; y = ny; }
      g.stroke();
    };
    for (let k = 0; k < 5; k++) { g.filter = 'blur(6px)'; vein(10 + rnd() * 12, .18, vc[0], 40); g.filter = 'none'; vein(1.6 + rnd() * 2.2, .55, vc[1], 30); }
    for (let k = 0; k < 14; k++) vein(.6 + rnd() * 1.2, .28 + rnd() * .2, vc[2], 50);
    for (let k = 0; k < 4; k++) vein(1 + rnd() * 1.4, .35, acc, 30);
    if (kind === 'calacatta') for (let k = 0; k < 3; k++) { g.filter = 'blur(3px)'; vein(6 + rnd() * 6, .3, acc, 35); g.filter = 'none'; vein(2 + rnd() * 2, .6, acc, 30); }
    return c;
  }
  function travertine(THREE) { // warm beige in soft horizontal bands, with small pits
    const [c, g] = canvas(2048, 1024);
    g.fillStyle = '#DCCBB0'; g.fillRect(0, 0, 2048, 1024);
    for (let y = 0; y < 1024; y += 4 + rnd() * 18) { g.fillStyle = `rgba(${rnd() > .5 ? '196,174,140' : '232,220,198'},${.15 + rnd() * .35})`; g.fillRect(0, y, 2048, 2 + rnd() * 10); }
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(150,124,92,${.25 + rnd() * .4})`; g.beginPath(); g.ellipse(rnd() * 2048, rnd() * 1024, 2 + rnd() * 9, 1 + rnd() * 2.5, 0, 0, 7); g.fill(); }
    return c;
  }
  function terrazzo(THREE) { // pale ground with chips in the Maxsen colours
    const [c, g] = canvas(2048, 1024);
    g.fillStyle = '#EEE8E0'; g.fillRect(0, 0, 2048, 1024);
    const chips = ['#CFA594', '#29221F', '#B98A3E', '#9A9590', '#E6C9BC', '#C9C3BA'];
    for (let k = 0; k < 2600; k++) {
      g.fillStyle = chips[Math.floor(rnd() * chips.length)]; g.beginPath();
      const x = rnd() * 2048, y = rnd() * 1024, r = 3 + rnd() * (rnd() > .9 ? 22 : 9), n = 5 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) { const a = i / n * 7, rr2 = r * (.6 + rnd() * .5); i ? g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2) : g.moveTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
      g.fill();
    }
    return c;
  }
  function wood(THREE, base, dark, light) { // straight grain, running along the length
    const [c, g] = canvas(2048, 512);
    g.fillStyle = base; g.fillRect(0, 0, 2048, 512);
    for (let i = 0; i < 260; i++) {
      g.strokeStyle = `rgba(${rnd() > .5 ? dark : light},${.06 + rnd() * .2})`; g.lineWidth = .5 + rnd() * 2.6;
      let y = rnd() * 512; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= 2048; x += 64) { y += (rnd() - .5) * 4; g.lineTo(x, y); } g.stroke();
    }
    return c;
  }
  function switchFace(THREE, kind) {
    const [c, g] = canvas(256, 256);
    const plate = { prestige: '#1d1b1a', noble: '#E9E1D4', nova: '#202022', nova2: '#2a2a2c', folio: '#F2EFEA', ark: '#D9C08A' }[kind] || '#202022';
    g.fillStyle = plate; g.fillRect(0, 0, 256, 256);
    const sh = g.createLinearGradient(0, 0, 256, 256); sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(.5, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, 256, 256);
    if (kind === 'prestige') { g.fillStyle = '#111'; g.fillRect(0, 100, 256, 56); g.fillStyle = '#fff4e2'; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(14 + i * 13.5, 128, 3, 0, 7); g.fill(); } }
    if (kind === 'nova') { g.fillStyle = '#ffcf8a'; g.fillRect(56, 120, 144, 6); for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(78 + i * 50, 200, 5, 0, 7); g.fill(); } }
    if (kind === 'noble') { g.strokeStyle = '#fff6e6'; g.lineWidth = 4; g.strokeRect(14, 14, 228, 228); g.strokeStyle = 'rgba(160,140,110,.5)'; g.lineWidth = 1; g.strokeRect(20, 20, 216, 216); }
    if (kind === 'ark') { g.strokeStyle = 'rgba(90,70,40,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(128, 30); g.lineTo(128, 226); g.stroke(); g.fillStyle = '#5aa0ff'; g.beginPath(); g.arc(70, 200, 6, 0, 7); g.fill(); g.beginPath(); g.arc(186, 200, 6, 0, 7); g.fill(); }
    if (kind === 'nova2') { g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 20); g.lineTo(128, 236); g.stroke(); }
    if (kind === 'folio') { g.strokeStyle = 'rgba(120,110,100,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(20, 60); g.bezierCurveTo(90, 90, 150, 40, 240, 120); g.stroke(); g.fillStyle = '#7fb2ff'; [0, 1, 2, 3].forEach(i => { g.beginPath(); g.arc(70 + i * 38, 128, 7, 0, 7); g.strokeStyle = '#7fb2ff'; g.lineWidth = 3; g.stroke(); }); }
    return c;
  }
  function floorGlow(THREE, colour) {
    const [c, g] = canvas(512, 256);
    const f = g.createRadialGradient(256, 128, 40, 256, 128, 250);
    f.addColorStop(0, 'rgba(255,196,130,0)'); f.addColorStop(.44, 'rgba(255,196,130,.85)'); f.addColorStop(.62, 'rgba(255,196,130,.3)'); f.addColorStop(1, 'rgba(255,196,130,0)');
    g.save(); g.scale(1, .5); g.translate(0, 128); g.fillStyle = f; g.fillRect(0, -128, 512, 512); g.restore();
    if (colour && g.createConicGradient) { // the same ring of light, in the colours flowing round the strip
      const cg = g.createConicGradient(Math.PI / 2, 256, 128);
      for (let k = 0; k <= 6; k++) cg.addColorStop(k / 6, `hsl(${((1 - k / 6) * 360 + 324) % 360},90%,60%)`);
      g.globalCompositeOperation = 'source-in'; g.fillStyle = cg; g.fillRect(0, 0, 512, 256); g.globalCompositeOperation = 'source-over';
    }
    return new THREE.CanvasTexture(c);
  }
  function screenTex(THREE) {
    const [c, g] = canvas(512, 320);
    g.fillStyle = '#141416'; g.fillRect(0, 0, 512, 320);
    const cols = ['#cfa594', '#e9dccb', '#8fb3c9', '#d9c08a', '#a7c49a', '#e9dccb'];
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) { g.fillStyle = cols[r * 3 + k]; g.globalAlpha = .9; g.fillRect(30 + k * 156, 34 + r * 136, 140, 116); }
    return tex(THREE, c);
  }

  /* ---------- the model ---------- */
  function build(THREE, renderer, mood, imgs = {}, shelves = true) {
    const colour = mood === 'colour', night = ['night', 'colour', 'low', 'high'].includes(mood);
    // the ball light on the top: brightness and colour temperature set from Halo and the switches
    const BALL = { low: [.16, 2700], high: [1, 4500] }[mood] || [.7, 3000];
    const scene = new THREE.Scene();
    const bgc = night ? 0x1E1915 : 0xE6E0D8;
    scene.background = new THREE.Color(bgc); scene.fog = new THREE.Fog(bgc, 5.5, 13);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new THREE.RoomEnvironment(), .04).texture;
    const std = o => new THREE.MeshStandardMaterial(Object.assign({ roughness: .7, metalness: 0, envMapIntensity: night ? .22 : .5 }, o));
    let parent = scene;   // movable pieces are built into their own group
    const add = (geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true; parent.add(m); return m; };

    const floor = add(new THREE.PlaneGeometry(40, 40), std({ color: night ? 0x3a322c : 0xC9BFB3, roughness: .92 }), 0, 0, 0, { cast: false });
    floor.rotation.x = -Math.PI / 2;
    scene.add(new THREE.HemisphereLight(0xfff7ef, night ? 0x1a1410 : 0x9d8f80, night ? .07 : .22));
    const key = new THREE.DirectionalLight(0xfff3e6, night ? .1 : .75);
    key.position.set(-2.4, 4.4, 3.4); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: .5, far: 12 }); key.shadow.bias = -.0004; scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe6cc, night ? .05 : .22); rim.position.set(3, 2.5, -3); scene.add(rim);

    // Maxsen colourway: porcelain stone, Midnight Bronze body, champagne-lit interiors
    // every surface that takes a finish has its own material, refinished in place when the finish changes
    const canv = {};
    const texCanvas = k => canv[k] || (canv[k] = {
      marble: () => stone(THREE), nero: () => stone(THREE, 'nero'), calacatta: () => stone(THREE, 'calacatta'), rosa: () => stone(THREE, 'rosa'), verde: () => stone(THREE, 'verde'),
      travertine: () => travertine(THREE), terrazzo: () => terrazzo(THREE),
      teak: () => wood(THREE, '#9A6A40', '70,40,20', '190,140,90'), smoked: () => wood(THREE, '#7B6450', '40,28,18', '150,120,96'), ebony: () => wood(THREE, '#2A1E18', '8,5,3', '80,60,50'),
      oak: () => wood(THREE, '#D2B994', '150,116,78', '238,220,192'), paleoak: () => wood(THREE, '#E2D0B4', '160,128,92', '246,234,214'),
      walnut: () => wood(THREE, '#5A3D2B', '30,18,10', '122,86,60')
    }[k]());
    const slotMats = {}, finishNow = Object.assign({}, FINISH_DEFAULT);
    // where each surface's gradient runs: up its height, or along the length for the thin gold layer
    const GRAD = { top: [0, Y1, H], gold: [1, -L * GS / 2, L * GS / 2], body: [0, Y0, Y1], inner: [0, Y0, Y1], base: [0, 0, BASE], stands: [0, HG, HG + .55] };
    function slotMat(slot, o = {}) {
      const m = new THREE.MeshPhysicalMaterial({ roughness: .5 });
      const g = { on: false, a: { value: new THREE.Color() }, b: { value: new THREE.Color() }, r: { value: new THREE.Vector3(...GRAD[slot]) } };
      m.userData = { o, g };
      m.onBeforeCompile = sh => {
        if (!g.on) return;
        sh.uniforms.gA = g.a; sh.uniforms.gB = g.b; sh.uniforms.gR = g.r;
        sh.vertexShader = 'varying vec3 vGW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vGW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        sh.fragmentShader = 'uniform vec3 gA;\nuniform vec3 gB;\nuniform vec3 gR;\nvarying vec3 vGW;\n' + sh.fragmentShader.replace('#include <map_fragment>',
          '#include <map_fragment>\n  float gT = clamp(((gR.x > .5 ? vGW.x : vGW.y) - gR.y) / (gR.z - gR.y), 0., 1.);\n  diffuseColor.rgb *= mix(gA, gB, smoothstep(0., 1., gT));');
      };
      m.customProgramCacheKey = () => g.on ? 'grad' : 'flat';
      (slotMats[slot] = slotMats[slot] || []).push(m);
      refinish(m, finishNow[slot]);
      return m;
    }
    function refinish(m, key) {
      const F = FINISHES[key], { o, g } = m.userData;
      if (m.map) m.map.dispose();
      m.map = null;
      if (F.tex) { const t = tex(THREE, texCanvas(F.tex), ...(o.rep || [1, 1])); if (o.off) t.offset.set(...o.off); if (o.rot) t.rotation = o.rot; m.map = t; }
      m.color.set(F.tex || F.grad ? 0xffffff : F.color); if (!F.tex && !F.grad && (F.metalness || 0) < .5) m.color.convertSRGBToLinear();
      m.metalness = F.metalness || 0; m.roughness = F.roughness ?? .5;
      m.clearcoat = F.clearcoat || 0; m.clearcoatRoughness = F.clearcoatRoughness ?? .3;
      m.envMapIntensity = F.metalness ? (night ? .5 : 1.05) : (night ? .25 : .5);
      g.on = !!F.grad; if (F.grad) { g.a.value.set(F.grad[0]).convertSRGBToLinear(); g.b.value.set(F.grad[1]).convertSRGBToLinear(); }
      m.needsUpdate = true;
    }
    function setFinish(slot, key) {
      if (!(slot in FINISH_DEFAULT) || !(key in FINISHES)) return;
      finishNow[slot] = key; (slotMats[slot] || []).forEach(m => refinish(m, key));
    }
    const stoneMat = slotMat('top', { rep: [1 / L, 1 / D], off: [.5, .5] });
    const bodyMat = slotMat('body', { rep: [1.2, 1] });
    const bodyMatV = slotMat('body', { rep: [1, 1], rot: Math.PI / 2 });
    const inner = slotMat('inner', { rep: [1.5, 1] });
    const baseMat = slotMat('base');
    const bronze = std({ color: 0x29221F, roughness: .4, metalness: .5 });
    // IC RGBCCT strips: every pixel addressable, warm white for daily use, full colour on demand
    const warm = new THREE.Color(night ? 0xffd9a8 : 0xfff0d8);
    const pix = t => colour ? new THREE.Color().setHSL((t + .9) % 1, 1, .58) : warm.clone();
    const glowMat = (() => {
      const [c, g] = canvas(32, 64); const gr = g.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 64);
      return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: colour ? 1 : night ? .7 : .35 });
    })();
    function pixels(pts, y, tOf) {
      const m = new THREE.InstancedMesh(new THREE.BoxGeometry(.017, .005, .007), new THREE.MeshBasicMaterial({ color: 0xffffff }), pts.length);
      const o = new THREE.Object3D();
      pts.forEach((p, i) => { o.position.set(p.x, y, p.z); o.rotation.set(0, -p.a, 0); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, pix(tOf ? tOf(p) : i / pts.length)); });
      m.instanceColor.needsUpdate = true; scene.add(m);
      // a soft glow round each pixel, the way a diffused strip reads to the eye
      const gm = new THREE.InstancedMesh(new THREE.PlaneGeometry(.02, .05), glowMat, pts.length);
      for (let i = 0; i < pts.length; i++) { m.getMatrixAt(i, o.matrix); gm.setMatrixAt(i, o.matrix); gm.setColorAt(i, pix(tOf ? tOf(pts[i]) : i / pts.length)); }
      gm.instanceColor.needsUpdate = true; scene.add(gm);
      return m;
    }
    const row = (x0, x1, z) => { const pts = []; for (let x = x0; x < x1; x += .016) pts.push({ x, z, a: 0 }); return pts; };
    const byX = p => (p.x + L / 2) / L * .9;

    // the top: 100 mm thick, rounded corners and softened edges
    add(slab(THREE, rr(THREE, L - .012, D - .012, Math.max(.003, R - .006)), TOP, RECT ? .003 : .006), stoneMat, 0, Y1, 0);
    // a thin, flat gold top on the marble, following its outline at 1.1x
    const gold = slotMat('gold');
    if (GOLD) add(slab(THREE, rr(THREE, L * GS - .004, D * GS - .004, R * GS - .002), GT, .002), gold, 0, H, 0);
    // the LED line along the underside edge of the top
    pixels(perimeter(BL + .006, BD + .006, BR + .003, .016), Y1 - .006);

    // live Maxsen switches set into the top, in one row down the middle
    // six smart switches and the Halo dimmer in the centre, on the front edge of the top
    // Lusano Noble on the left, Lusano Prestige on the right, from the product photos
    const SW = [['noble-champagne', -.375], ['noble-ivory', -.25], ['noble-onyx', -.125], ['halo', 0], ['prestige-onyx', .125], ['prestige-champagne', .25], ['prestige-midnight', .375]];
    const ey = H - TOP / 2, ez = D / 2;
    const edgeMat = std({ color: 0x1a1a1a, roughness: .4 });
    SW.forEach(([k, x]) => {
      if (k === 'halo') {
        add(new THREE.BoxGeometry(.086, .086, .006), std({ color: 0xC9B79C, roughness: .35, metalness: .5 }), x, ey, ez + .003);
        const ring = new THREE.CylinderGeometry(.03, .03, .026, 48); ring.rotateX(Math.PI / 2);
        add(ring, std({ color: 0xE8E4DF, roughness: .18, metalness: .95 }), x, ey, ez + .019);
        const face = new THREE.CylinderGeometry(.023, .023, .003, 40); face.rotateX(Math.PI / 2);
        add(face, std({ color: 0xF6EEF2, roughness: .25, metalness: .1 }), x, ey, ez + .033);
      } else {
        const img = (imgs.sw || {})[k];
        let map;
        if (img) { map = new THREE.Texture(img); map.needsUpdate = true; map.encoding = THREE.sRGBEncoding; map.anisotropy = 8; }
        else map = tex(THREE, switchFace(THREE, k.startsWith('prestige') ? 'prestige' : 'noble'));
        const m = std({ map, roughness: k.startsWith('prestige') ? .22 : .3, metalness: .15 });
        add(new THREE.BoxGeometry(.086, .086, .006), [edgeMat, edgeMat, edgeMat, edgeMat, m, edgeMat], x, ey, ez + .003);
      }
    });

    // Lenovo smart locks, modelled after the product photos, each on its own small door panel
    const doorMat = slotMat('stands', { rep: [1, 1], rot: Math.PI / 2 });

    function lenovoLock({ x, frame, trim, lower, cam }) {
      // its own stand: a bronze foot and a 150 x 550 slice of a 45 mm door; the lock at true size, about 78 x 410 x 70 mm
      const z0 = -.05, DT = .045, base = HG + .012, PH = .55, PW = .15;
      add(new THREE.BoxGeometry(PW + .02, .012, .15), bronze, x, HG + .006, z0);           // bronze foot
      add(new THREE.BoxGeometry(PW, PH, DT), doorMat, x, base + PH / 2, z0);                // door panel
      const LW = .078, LH = .41, LD = .07, lx = x - .005, ly = base + PH / 2 + .01, lz = z0 + DT / 2;
      // body: a rounded metal frame
      const sh = new THREE.Shape(), r = .008, hw = LW / 2, hh = LH / 2;
      sh.moveTo(-hw + r, -hh); sh.lineTo(hw - r, -hh); sh.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0); sh.lineTo(hw, hh - r); sh.absarc(hw - r, hh - r, r, 0, Math.PI / 2);
      sh.lineTo(-hw + r, hh); sh.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI); sh.lineTo(-hw, -hh + r); sh.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5);
      const bg = new THREE.ExtrudeGeometry(sh, { depth: LD - .004, bevelEnabled: true, bevelThickness: .002, bevelSize: .0015, bevelSegments: 3, curveSegments: 10 });
      const frameMat = std({ color: frame, roughness: .28, metalness: .85, envMapIntensity: night ? .3 : .9 });
      add(bg, frameMat, lx, ly, lz + .002);
      const fz = lz + LD + .0006;                                        // the front face
      // upper glass: camera, lit keypad, fingerprint reader
      const PX = 4000, gw = LW - .006, gh = LH * .555;
      const [gc, g] = canvas(Math.round(gw * PX), Math.round(gh * PX)), [ec, e] = canvas(gc.width, gc.height);
      const W2 = gc.width, H2 = gc.height;
      const gl = g.createLinearGradient(0, 0, W2, H2); gl.addColorStop(0, '#1b1c20'); gl.addColorStop(.5, '#0a0a0c'); gl.addColorStop(1, '#141418');
      g.fillStyle = gl; g.fillRect(0, 0, W2, H2); e.fillStyle = '#000'; e.fillRect(0, 0, W2, H2);
      const ring = (ctx, cx, cy, rr, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke(); };
      if (cam) { g.fillStyle = '#050506'; g.beginPath(); g.arc(W2 / 2, 70, 26, 0, 7); g.fill(); ring(g, W2 / 2, 70, 26, '#3a3a40', 4); g.fillStyle = '#20304a'; g.beginPath(); g.arc(W2 / 2, 70, 11, 0, 7); g.fill(); }
      else { g.fillStyle = '#2a2a30'; g.beginPath(); g.arc(W2 / 2 + 40, 60, 7, 0, 7); g.fill(); }
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
      e.fillStyle = '#ffffff'; e.textAlign = 'center'; e.textBaseline = 'middle'; e.font = '600 34px Lato, Arial, sans-serif';
      keys.forEach((k, i) => e.fillText(k, W2 / 2 + (i % 3 - 1) * 62, 210 + Math.floor(i / 3) * 74));
      ring(e, W2 / 2, 210 + 4 * 74, 14, '#ffffff', 4);                                   // lock key
      ring(g, W2 / 2, H2 - 95, 30, '#2c2c32', 5); g.fillStyle = '#101013'; g.beginPath(); g.arc(W2 / 2, H2 - 95, 26, 0, 7); g.fill();
      for (let k = 0; k < 5; k++) ring(g, W2 / 2, H2 - 95, 6 + k * 4, 'rgba(90,90,100,.6)', 1.2);   // fingerprint ridges
      const gt = new THREE.CanvasTexture(gc); gt.encoding = THREE.sRGBEncoding; const et = new THREE.CanvasTexture(ec);
      const glass = new THREE.MeshPhysicalMaterial({ map: gt, emissiveMap: et, emissive: new THREE.Color(0xcfe4ff), emissiveIntensity: night ? 1.1 : .75, roughness: .06, metalness: .1, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: night ? .4 : 1.1 });
      add(new THREE.PlaneGeometry(gw, gh), glass, lx, ly + LH / 2 - .006 - gh / 2, fz, { cast: false });
      // trim band with the Lenovo name
      const [tc, tg] = canvas(256, 48); tg.fillStyle = trim; tg.fillRect(0, 0, 256, 48);
      tg.fillStyle = '#0d0d0f'; tg.fillRect(0, 10, 256, 28); tg.fillStyle = trim; tg.font = '600 20px Lato, Arial, sans-serif'; tg.textAlign = 'center'; tg.textBaseline = 'middle'; tg.fillText('Lenovo', 128, 25);
      const tt = new THREE.CanvasTexture(tc); tt.encoding = THREE.sRGBEncoding;
      const bandY = ly + LH / 2 - .006 - gh - .007;
      add(new THREE.PlaneGeometry(gw, .012), std({ map: tt, roughness: .3, metalness: .6 }), lx, bandY, fz + .0002, { cast: false });
      // lower finish panel: Rosewood, Gold Aurora Marble or solar glass
      const lh = LH - .012 - gh - .014 - .006;
      const [lc, lg] = canvas(Math.round(gw * PX), Math.round(lh * PX)), LW2 = lc.width, LH2 = lc.height;
      if (lower === 'rosewood') {
        const rg = lg.createLinearGradient(0, 0, LW2, LH2); rg.addColorStop(0, '#4a1a10'); rg.addColorStop(.5, '#6b2a18'); rg.addColorStop(1, '#3a120a'); lg.fillStyle = rg; lg.fillRect(0, 0, LW2, LH2);
        for (let k = 0; k < 40; k++) { lg.strokeStyle = `rgba(${rnd() > .5 ? '20,6,3' : '150,70,40'},${.2 + rnd() * .35})`; lg.lineWidth = 1 + rnd() * 4; lg.beginPath(); let yy = rnd() * LH2; lg.moveTo(0, yy); for (let xx = 0; xx <= LW2; xx += 20) { yy += Math.sin(xx / 30 + k) * 6 + (rnd() - .5) * 8; lg.lineTo(xx, yy); } lg.stroke(); }
      } else if (lower === 'marble') {
        lg.fillStyle = '#0c0c0d'; lg.fillRect(0, 0, LW2, LH2);
        for (let k = 0; k < 9; k++) { lg.strokeStyle = `rgba(${200 + rnd() * 40},${160 + rnd() * 30},${90 + rnd() * 30},${.4 + rnd() * .5})`; lg.lineWidth = .8 + rnd() * 2.4; lg.beginPath(); let xx = rnd() * LW2, yy = 0; lg.moveTo(xx, yy); while (yy < LH2) { xx += (rnd() - .5) * 60; yy += 20 + rnd() * 40; lg.lineTo(xx, yy); } lg.stroke(); }
      } else if (lower === 'stars') {
        lg.fillStyle = '#26282c'; lg.fillRect(0, 0, LW2, LH2);
        for (let k = 0; k < 500; k++) { lg.fillStyle = `rgba(255,255,255,${.15 + rnd() * .6})`; lg.fillRect(rnd() * LW2, rnd() * LH2, 1 + rnd() * 2, 1 + rnd() * 2); }
        for (let k = 0; k < 14; k++) { lg.strokeStyle = 'rgba(200,205,215,.18)'; lg.lineWidth = 1; lg.beginPath(); const xx = rnd() * LW2, yy = rnd() * LH2; lg.moveTo(xx, yy); lg.lineTo(xx + 40 + rnd() * 60, yy + 80 + rnd() * 120); lg.stroke(); }
      } else if (lower === 'onyx') {
        lg.fillStyle = '#2a2b2d'; lg.fillRect(0, 0, LW2, LH2);
        for (let k = 0; k < 12; k++) { lg.strokeStyle = `rgba(230,232,235,${.15 + rnd() * .4})`; lg.lineWidth = .6 + rnd() * 2; lg.beginPath(); let xx = rnd() * LW2, yy = 0; lg.moveTo(xx, yy); while (yy < LH2) { xx += (rnd() - .5) * 50; yy += 20 + rnd() * 40; lg.lineTo(xx, yy); } lg.stroke(); }
      } else {
        const sg2 = lg.createLinearGradient(0, 0, LW2, LH2); sg2.addColorStop(0, '#0e2a1c'); sg2.addColorStop(.6, '#05140c'); sg2.addColorStop(1, '#0b2116'); lg.fillStyle = sg2; lg.fillRect(0, 0, LW2, LH2);
        lg.strokeStyle = 'rgba(120,200,160,.12)'; lg.lineWidth = 1; for (let yy = 0; yy < LH2; yy += 40) { lg.beginPath(); lg.moveTo(0, yy); lg.lineTo(LW2, yy); lg.stroke(); }
        for (let xx = 0; xx < LW2; xx += 62) { lg.beginPath(); lg.moveTo(xx, 0); lg.lineTo(xx, LH2); lg.stroke(); }
      }
      const shine = lg.createLinearGradient(0, 0, LW2, LH2 * .6); shine.addColorStop(0, 'rgba(255,255,255,.12)'); shine.addColorStop(.4, 'rgba(255,255,255,0)'); lg.fillStyle = shine; lg.fillRect(0, 0, LW2, LH2);
      const lt = new THREE.CanvasTexture(lc); lt.encoding = THREE.sRGBEncoding;
      add(new THREE.PlaneGeometry(gw, lh), new THREE.MeshPhysicalMaterial({ map: lt, roughness: .12, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: night ? .4 : 1 }), lx, bandY - .007 - lh / 2, fz, { cast: false });
      // push-pull grip: a recessed slot down the free side of the body
      add(new THREE.BoxGeometry(.003, .14, .024), std({ color: 0x0a0a0a, roughness: .5 }), lx + LW / 2 + .0005, ly - .07, lz + LD / 2 + .004, { cast: false });
      // the inside unit on the back of the door, with a thumb-turn
      add(new THREE.BoxGeometry(.072, .32, .03), std({ color: 0x1e1e20, roughness: .35, metalness: .4 }), lx, ly, z0 - DT / 2 - .015);
      const turn = new THREE.CylinderGeometry(.014, .014, .012, 24); turn.rotateX(Math.PI / 2);
      add(turn, frameMat, lx, ly - .04, z0 - DT / 2 - .036);
      // mortise faceplate and latch on the door's edge
      add(new THREE.BoxGeometry(.002, .42, .024), std({ color: 0xC8C8CC, roughness: .25, metalness: .95 }), x + PW / 2 + .001, ly, z0);
      add(new THREE.BoxGeometry(.012, .02, .014), std({ color: 0xC8C8CC, roughness: .25, metalness: .95 }), x + PW / 2 + .007, ly + .02, z0);
    }

    // body: bottom board, back, dividers and ends, in Midnight Bronze wood
    add(slab(THREE, rr(THREE, BL, BD, BR), .04, .004), bodyMat, 0, Y0, 0);
    const xs = BL / 2 - BR, zs = BD / 2 - BR;
    add(new THREE.BoxGeometry(2 * xs, Y1 - Y0 - .04, T), bodyMat, 0, Y0 + .04 + (Y1 - Y0 - .04) / 2, -BD / 2 + T / 2);
    const wallH = Y1 - Y0 - .04;
    const wall = (shape) => add(slab(THREE, shape, wallH), bodyMatV, 0, Y0 + .04, 0);
    wall(arcBand(THREE, -xs, -zs, BR, T, Math.PI, Math.PI * 1.5));        // back left corner
    wall(arcBand(THREE, xs, -zs, BR, T, -Math.PI / 2, 0));               // back right corner
    if (shelves) {
      add(new THREE.BoxGeometry(T, wallH, zs + .02), bodyMat, -BL / 2 + T / 2, Y0 + .04 + wallH / 2, -zs / 2 + .01); // left end, back half
      add(new THREE.BoxGeometry(T, wallH, zs + .02), bodyMat, BL / 2 - T / 2, Y0 + .04 + wallH / 2, -zs / 2 + .01); // right end, back half
    } else {
      // no shelves: the ends close, and the wood wraps all four corners
      [-1, 1].forEach(sd => {
        add(new THREE.BoxGeometry(T, wallH, 2 * zs + .002), bodyMat, sd * (BL / 2 - T / 2), Y0 + .04 + wallH / 2, 0);                  // full end
        wall(arcBand(THREE, sd * xs, zs, BR, T, sd > 0 ? 0 : Math.PI / 2, sd > 0 ? Math.PI / 2 : Math.PI));                       // front corner
        const x0 = DIV - .015 + .006, w = xs - x0;                                                                                     // a 6 mm shadow gap beside the centre panel
        add(new THREE.BoxGeometry(w, wallH, T), bodyMat, sd * (x0 + w / 2), Y0 + .04 + wallH / 2, BD / 2 - T / 2);
      });
    }
    [-DIV, DIV].forEach(x => add(new THREE.BoxGeometry(.03, wallH, BD - T), bodyMat, x, Y0 + .04 + wallH / 2, T / 2));
    // champagne-lit interiors: back faces of the bays and the niche
    add(new THREE.BoxGeometry(2 * xs - .04, wallH - .002, .004), inner, 0, Y0 + .04 + wallH / 2, -BD / 2 + T + .002, { cast: false });
    // shelves: the same at both ends, rounded where they wrap the front corners
    const lx0 = -BL / 2, lx1 = -DIV - .015, rx0 = DIV + .015, rx1 = BL / 2;
    if (shelves) SHELVES.forEach(y => {
      add(slab(THREE, endShelf(THREE, -1, lx1, lx0 + .002, -BD / 2 + T, BD / 2 - .002, BR - T, BR), .025), inner, 0, y - .0125, 0);
      add(slab(THREE, endShelf(THREE, 1, rx0, rx1 - .002, -BD / 2 + T, BD / 2 - .002, BR - T, BR), .025), inner, 0, y - .0125, 0);
      // LED under the front edge of each shelf, lighting the bay below
      pixels(row(lx0 + BR, lx1 - .01, BD / 2 - .03), y - .015, byX);
      pixels(row(rx0 + .01, rx1 - BR, BD / 2 - .03), y - .015, byX);
    });
    // LED under the top, lighting the top bay
    if (shelves) {
      pixels(row(lx0 + BR, lx1 - .01, BD / 2 - .03), Y1 - .01, byX);
      pixels(row(rx0 + .01, rx1 - BR, BD / 2 - .03), Y1 - .01, byX);
    }
    // the closed centre: a light wood panel with LUSANO in bronze letters, lit from behind
    add(new THREE.BoxGeometry(2 * DIV - .03, wallH, T), bodyMat, 0, Y0 + .04 + wallH / 2, BD / 2 - T / 2);
    {
      const word = 'LUSANO', fs = 300, ls = 34;
      const [mc, mg] = canvas(1700, 300); mg.font = `500 ${fs}px "EB Garamond", Garamond, Georgia, serif`;
      if (mg.letterSpacing !== undefined) mg.letterSpacing = ls + 'px';
      mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillStyle = '#fff'; mg.fillText(word, 850 + ls / 2, 160);
      const [gc, gg] = canvas(1700, 300); gg.shadowColor = 'rgba(255,205,140,1)'; gg.shadowBlur = 40;
      for (let k = 0; k < 3; k++) gg.drawImage(mc, 0, 0);
      const tw = mg.measureText(word).width + ls * word.length, w = .56 * 1700 / tw, h = w * 300 / 1700, y = Y0 + .04 + (Y1 - Y0 - .04) * .615, zf = BD / 2 + .002; // letters span 560 of the 630 mm panel
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, opacity: night ? .95 : .6, color: night ? 0xffcf96 : 0xf2b46a, blending: night ? THREE.AdditiveBlending : THREE.NormalBlending }));
      glow.position.set(0, y, zf); scene.add(glow);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(mc), transparent: true, color: 0x3A2C24, roughness: .35, metalness: .55, envMapIntensity: night ? .2 : .5 }));
      face.position.set(0, y, zf + .004); scene.add(face);
    }

    // floating base with an LED line that lights the floor
    add(slab(THREE, rr(THREE, BL - .1, BD - .1, Math.max(.008, BR - .04)), BASE - .004), baseMat, 0, .002, 0);
    pixels(perimeter(BL - .09, BD - .09, Math.max(.013, BR - .035), .016), BASE - .012);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(BL + .7, BD + .55), new THREE.MeshBasicMaterial({ map: floorGlow(THREE, colour), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: night ? .9 : .4 }));
    gl.rotation.x = -Math.PI / 2; gl.position.y = .002; scene.add(gl);

    // light: the top's LED line washing down the body, the base, and each bay
    THREE.RectAreaLightUniformsLib.init();
    const wash = night ? 6 : 1.8;
    const lc0 = c => colour ? c : new THREE.Color(0xffc98f);
    [[BD / 2 + .015, 1, .15], [-BD / 2 - .015, -1, .65]].forEach(([z, s, t]) => { const a = new THREE.RectAreaLight(lc0(pix(t)), wash, BL - .3, .02); a.position.set(0, Y1 - .01, z); a.lookAt(0, 0, z + s * .06); scene.add(a); });
    const low = new THREE.RectAreaLight(lc0(pix(.4)), night ? 5 : 1.6, BL - .1, BD - .1); low.position.set(0, BASE - .015, 0); low.lookAt(0, -1, 0); scene.add(low);
    if (shelves) [(lx0 + lx1) / 2, (rx0 + rx1) / 2 - .03].forEach(x => [...SHELVES, Y1 + .0125].forEach(y => {
      const p = new THREE.PointLight(lc0(pix(byX({ x }))), night ? .5 : .16, .5, 2); p.position.set(x, y - .04, .12); scene.add(p);
    }));

    // catalogues and brochures in the open bays
    const paper = std({ color: 0xF6F1EA, roughness: .9 });
    const cover = (bg, title, sub, fg, serif) => {
      const [c, g] = canvas(420, 594); g.fillStyle = bg; g.fillRect(0, 0, 420, 594);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(40, 180, 340, 250);
      g.fillStyle = fg; g.textAlign = 'center'; g.font = serif ? '500 64px "EB Garamond", Georgia, serif' : '700 40px Lato, Arial, sans-serif';
      if (g.letterSpacing !== undefined) g.letterSpacing = serif ? '10px' : '14px'; g.fillText(title, 214, 110);
      if (g.letterSpacing !== undefined) g.letterSpacing = '3px'; g.font = '400 22px Lato, Arial, sans-serif'; g.fillText(sub, 212, 520);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return std({ map: t, roughness: .5 });
    };
    const catMat = cover('#DCCBBB', 'MAXSEN', 'THE COLLECTION 2026', '#29221F', false);
    const lusMat = cover('#1d1b1a', 'LUSANO', 'SWAROVSKI CRYSTALS', '#E8D3B4', true);
    const lockMat = cover('#2B231F', 'LENOVO', 'SMART LOCKS · MYDIGITALLOCK', '#DDB8A6', false);
    const halMat = cover('#F4EEE6', 'HALO', 'THE ROTARY DIMMER', '#7E5643', true);
    const COVERS = { maxsen: catMat, lusano: lusMat, lenovo: lockMat, halo: halMat };
    const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: .9, transparent: true, opacity: .25, roughness: .05 });

    /* ---------- the movable pieces: each a group with its origin on the surface it stands on ---------- */
    const group = (fn, ox = 0, oy = 0, oz = 0) => {
      const g = new THREE.Group(), prev = parent; parent = g;
      try { fn(); } finally { parent = prev; }
      g.children.forEach(c => { c.position.x -= ox; c.position.y -= oy; c.position.z -= oz; });
      return g;
    };
    function instanced(geo, mat, list) {
      const m = new THREE.InstancedMesh(geo, mat, list.length), o = new THREE.Object3D();
      list.forEach((q, i) => {
        o.position.set(...q.p); o.rotation.order = q.o || 'XYZ'; o.rotation.set(...q.r); o.scale.set(...(q.s || [1, 1, 1])); o.updateMatrix();
        m.setMatrixAt(i, o.matrix); if (q.c) m.setColorAt(i, q.c);
      });
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    }
    const tube = (pts, r, mat) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 20, r, 8), mat);

    const makeLock = v => group(() => lenovoLock(Object.assign({}, LOCK_VARIANTS[+v] || LOCK_VARIANTS[0], { x: 0 })), 0, HG, -.05);

    // the ball light: brightness and colour temperature set from Halo and the switches
    const makeBall = () => group(() => {
      const [lvl, k] = BALL;
      const kc = new THREE.Color({ 2700: 0xffa95c, 3000: 0xffb46b, 4500: 0xffdbba }[k]);
      const br = .1, by = .022 + br;
      add(new THREE.CylinderGeometry(.06, .07, .022, 40), bronze, 0, .011, 0);
      const ballMat = new THREE.MeshPhysicalMaterial({ color: night ? 0x6e6862 : 0xe8e3dc, emissive: kc, emissiveIntensity: .05 + Math.pow(lvl, 1.3) * 1.25, roughness: .45, clearcoat: .4, envMapIntensity: night ? .15 : .4 });
      add(new THREE.SphereGeometry(br, 48, 32), ballMat, 0, by, 0, { cast: false });
      const [hc, hg] = canvas(128, 128); const hr = hg.createRadialGradient(64, 64, 10, 64, 64, 64);
      hr.addColorStop(0, 'rgba(255,255,255,.9)'); hr.addColorStop(.4, 'rgba(255,255,255,.35)'); hr.addColorStop(1, 'rgba(255,255,255,0)'); hg.fillStyle = hr; hg.fillRect(0, 0, 128, 128);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), color: kc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: (night ? .95 : .45) * Math.pow(lvl, 1.2) }));
      halo.scale.set(.3 + lvl * .45, .3 + lvl * .45, 1); halo.position.set(0, by, 0); parent.add(halo);
      const bl = new THREE.PointLight(kc, (night ? 2.2 : 1.1) * Math.pow(lvl, 1.3), 1.8, 2); bl.position.set(0, by, 0); parent.add(bl);
    });

    // a stack of A4 catalogues, the chosen cover on top
    const makeCatalogues = (v, n = 4) => group(() => {
      for (let i = 0; i < n; i++) {
        const m = add(new THREE.BoxGeometry(.21, .008, .297), [paper, paper, i === n - 1 ? (COVERS[v] || catMat) : paper, paper, paper, paper], 0, .004 + i * .0085, 0);
        m.rotation.y = .03 * i - .04;
      }
    });
    // a clear stand of DL brochures, leaning back
    const makeBrochures = v => group(() => {
      add(new THREE.BoxGeometry(.11, .11, .05), acrylic, 0, .055, 0, { cast: false });
      [COVERS[v] || lockMat, v === 'halo' ? catMat : halMat].forEach((mat, i) => {
        const b = add(new THREE.BoxGeometry(.099, .21, .003), [paper, paper, paper, paper, mat, paper], (i - .5) * .004, .105, -.01 + i * .02);
        b.rotation.x = -.12;
      });
    });

    // plants, in stone and bronze pots
    const potStone = std({ color: 0xE6DED3, roughness: .85 });
    const soil = std({ color: 0x3b2c22, roughness: 1 });
    const bark = std({ color: 0x6b5a48, roughness: .9 });
    const pot = (rt, rb, h, mat) => {
      add(new THREE.CylinderGeometry(rt, rb, h, 40), mat, 0, h / 2, 0);
      add(new THREE.CylinderGeometry(rt - .006, rt - .006, .004, 32), soil, 0, h - .01, 0, { cast: false });
    };
    const white = () => std({ color: 0xffffff, roughness: .6, side: THREE.DoubleSide });

    const makeOlive = () => group(() => {
      pot(.075, .06, .15, bronze);
      tube([[0, .14, 0], [.01, .25, 0], [-.01, .36, .005], [.004, .44, 0]], .009, bark);
      tube([[0, .32, 0], [.04, .4, .01], [.075, .48, 0]], .005, bark);
      tube([[-.005, .36, 0], [-.05, .43, -.01], [-.075, .51, .01]], .005, bark);
      const list = [];
      [[0, .5, 0, .1], [.075, .51, .01, .075], [-.075, .54, 0, .075], [0, .6, -.01, .07], [.03, .45, .05, .06]].forEach(([cx, cy, cz, cr]) => {
        for (let i = 0; i < 120; i++) {
          const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, q = cr * Math.cbrt(.25 + .75 * rnd()), w = Math.sqrt(1 - u * u);
          list.push({ p: [cx + q * w * Math.cos(a), cy + q * u * .8, cz + q * w * Math.sin(a)], r: [rnd() * 3, rnd() * 3, rnd() * 3], c: new THREE.Color().setHSL(.2 + rnd() * .06, .14 + rnd() * .12, .3 + rnd() * .16) });
        }
      });
      const leaf = new THREE.SphereGeometry(1, 6, 4); leaf.scale(.021, .0025, .0065);
      instanced(leaf, white(), list);
    });

    function monsteraLeaf(w) {
      const s = new THREE.Shape();
      s.moveTo(0, 0); s.bezierCurveTo(-w * .25, -w * .12, -w * .62, -w * .02, -w * .55, w * .38); s.bezierCurveTo(-w * .5, w * .72, -w * .15, w * .95, 0, w * 1.05);
      s.bezierCurveTo(w * .15, w * .95, w * .5, w * .72, w * .55, w * .38); s.bezierCurveTo(w * .62, -w * .02, w * .25, -w * .12, 0, 0);
      [[.26, .28], [.3, .52], [.22, .75]].forEach(([hx, hy]) => [-1, 1].forEach(sd => {
        const h = new THREE.Path(); h.absellipse(sd * hx * w, hy * w, .1 * w, .032 * w, 0, Math.PI * 2, false, sd * .5); s.holes.push(h);
      }));
      return new THREE.ShapeGeometry(s, 14);
    }
    const makeMonstera = () => group(() => {
      pot(.085, .07, .16, potStone);
      const stem = std({ color: 0x4f7a45, roughness: .6 });
      const n = 7;
      for (let k = 0; k < n; k++) {
        const a = k / n * Math.PI * 2 + rnd() * .5, d = .06 + rnd() * .05, h = .3 + rnd() * .16, tilt = .5 + rnd() * .5, w = .15 + rnd() * .06;
        const E = [Math.cos(a) * d, h, Math.sin(a) * d];
        tube([[0, .15, 0], [Math.cos(a) * d * .3, h * .85, Math.sin(a) * d * .3], E], .004, stem);
        const m = new THREE.Mesh(monsteraLeaf(w), std({ color: new THREE.Color().setHSL(.34 + rnd() * .03, .55, .13 + rnd() * .05), roughness: .5, side: THREE.DoubleSide }));
        m.position.set(...E); m.rotation.order = 'YXZ'; m.rotation.set(Math.PI / 2 - tilt, Math.PI / 2 - a, 0);
        m.castShadow = true; m.receiveShadow = true; parent.add(m);
      }
    });

    const makeSucculent = () => group(() => {
      add(new THREE.CylinderGeometry(.1, .07, .06, 48), potStone, 0, .03, 0);
      add(new THREE.CylinderGeometry(.094, .094, .004, 40), soil, 0, .054, 0, { cast: false });
      const leaf = new THREE.SphereGeometry(1, 8, 6); leaf.scale(.0065, .0045, .02); leaf.translate(0, 0, .018);
      const list = [];
      [[0, 0, 1.2], [.05, .03, .9], [-.05, .025, 1], [.02, -.05, .85], [-.035, -.045, .75]].forEach(([cx, cz, sz]) => {
        [[5, 1.2], [8, .75], [11, .3]].forEach(([nk, t], j) => {
          for (let k = 0; k < nk; k++) list.push({ p: [cx, .056, cz], o: 'YXZ', r: [-t, k / nk * Math.PI * 2 + j * .4, 0], s: [sz * (.6 + j * .25), sz * (.6 + j * .25), sz * (.6 + j * .25)], c: new THREE.Color().setHSL(.36 + rnd() * .1, .2 + rnd() * .1, .5 + j * .04 + rnd() * .08) });
        });
      });
      instanced(leaf, white(), list);
    });

    const makeOrchid = () => group(() => {
      pot(.045, .038, .08, potStone);
      const leaf = new THREE.SphereGeometry(1, 12, 8); leaf.scale(.024, .003, .065); leaf.translate(0, 0, .055);
      instanced(leaf, std({ color: 0x2f5a35, roughness: .45 }), [0, 2.1, 4.2].map(a => ({ p: [0, .078, 0], o: 'YXZ', r: [-.25, a, 0] })));
      const stem = std({ color: 0x5b6b3c, roughness: .6 });
      const pts = [[0, .08, 0], [.005, .14, 0], [.02, .18, .01], [.05, .195, .02], [.08, .185, .03]];
      tube(pts, .0018, stem);
      const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
      const petal = new THREE.SphereGeometry(1, 10, 6); petal.scale(.0075, .011, .0015); petal.translate(0, .009, 0);
      const list = [], centres = [];
      [.55, .68, .8, .91, 1].forEach((t, i) => {
        const P = curve.getPoint(t), sc = 1 - i * .1;
        for (let k = 0; k < 5; k++) list.push({ p: [P.x, P.y - .006, P.z + .006], r: [0, 0, k / 5 * Math.PI * 2], s: [sc, sc, sc] });
        centres.push(P);
      });
      instanced(petal, std({ color: 0xFBF7F4, roughness: .5, side: THREE.DoubleSide }), list);
      centres.forEach(P => add(new THREE.SphereGeometry(.0035, 10, 8), std({ color: 0xC2557A, roughness: .5 }), P.x, P.y - .006, P.z + .008, { cast: false }));
    });

    /* trailing plants: a small pot with a mound of leaves, and vines that run to the open edge of the surface and hang over it */
    const heartGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(-.25, -.08, -.55, .1, -.42, .42); s.bezierCurveTo(-.3, .72, -.08, .85, 0, 1); s.bezierCurveTo(.08, .85, .3, .72, .42, .42); s.bezierCurveTo(.55, .1, .25, -.08, 0, 0); return new THREE.ShapeGeometry(s, 8); })();
    const ivyGeo = (() => {   // five pointed lobes
      const s = new THREE.Shape(); const pts = [];
      for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 - Math.PI * .1 + k / 10 * Math.PI * 1.2 - Math.PI * .5, lobe = k % 2 ? .55 : [.6, .8, 1, .8, .6, .6][k / 2]; pts.push([Math.cos(a + Math.PI) * lobe * .62, .32 + Math.sin(a + Math.PI) * lobe * .68]); }
      s.moveTo(0, 0); pts.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(0, 0); return new THREE.ShapeGeometry(s);
    })();
    const pearlGeo = new THREE.SphereGeometry(1, 10, 8);
    const TRAIL = {
      pothos: { leaf: heartGeo, size: [.05, .028], strands: 7, step: .032, stem: 0x6f8f3e, colour: r => new THREE.Color().setHSL(.28 + r() * .05, .62, .17 + r() * .07).lerp(new THREE.Color(0xcfc45a), r() * r() * .4), pot: [.06, .05, .08], potMat: () => potStone },
      ivy: { leaf: ivyGeo, size: [.036, .02], strands: 9, step: .026, stem: 0x5a4a35, colour: r => new THREE.Color().setHSL(.31 + r() * .04, .42, .14 + r() * .07), pot: [.055, .046, .075], potMat: () => bronze },
      pearls: { leaf: pearlGeo, size: [.0048, .0038], strands: 14, step: .0085, stem: 0x6e7d4a, colour: r => new THREE.Color().setHSL(.25 + r() * .05, .38, .5 + r() * .1), pot: [.05, .042, .07], potMat: () => potStone, beads: true }
    };
    const up = new THREE.Vector3(0, 1, 0);
    function strandLeaves(T, curve, out, list, r, scaleAt) {
      const side = new THREE.Vector3().crossVectors(up, out).normalize(), len = curve.getLength(), n = Math.max(2, Math.floor(len / T.step));
      for (let i = 1; i <= n; i++) {
        const t = i / n, P = curve.getPointAt(t), Tg = curve.getTangentAt(t), sc = scaleAt(t) * (.8 + r() * .4);
        if (T.beads) { list.push({ m: new THREE.Matrix4().compose(P.clone().add(side.clone().multiplyScalar((r() - .5) * .006)), new THREE.Quaternion(), new THREE.Vector3(sc, sc, sc)), c: T.colour(r) }); continue; }
        const s = i % 2 ? 1 : -1, h = Math.min(1, Math.max(0, -Tg.y));
        const u = Tg.clone().multiplyScalar(.5).add(side.clone().multiplyScalar(s * .85)).add(new THREE.Vector3(0, .3 * (1 - h), 0)).add(new THREE.Vector3(r() - .5, r() - .5, r() - .5).multiplyScalar(.4)).normalize();
        const nb = up.clone().multiplyScalar(1 - h).add(out.clone().multiplyScalar(h + .15)).add(new THREE.Vector3(r() - .5, r() - .5, r() - .5).multiplyScalar(.5)).normalize();
        const nn = nb.sub(u.clone().multiplyScalar(nb.dot(u))).normalize(), X = new THREE.Vector3().crossVectors(u, nn);
        const m = new THREE.Matrix4().makeBasis(X, u, nn).scale(new THREE.Vector3(sc, sc, sc)).setPosition(P.clone().add(X.clone().multiplyScalar(s * .004)).add(nn.clone().multiplyScalar(.002)));
        list.push({ m, c: T.colour(r) });
      }
    }
    function leafMesh(T, list) {
      const m = new THREE.InstancedMesh(T.leaf, std({ color: 0xffffff, roughness: T.beads ? .35 : .5, side: THREE.DoubleSide }), list.length);
      list.forEach((q, i) => { m.setMatrixAt(i, q.m); m.setColorAt(i, q.c); });
      m.instanceColor.needsUpdate = true; m.castShadow = true; m.receiveShadow = true; return m;
    }
    const makeTrailing = (v, id) => {
      const T = TRAIL[v];
      const g = group(() => {
        const [rt, rb, h] = T.pot;
        pot(rt, rb, h, T.potMat());
        // the mound: leaves rising out of the pot
        const r = (() => { let sd = [...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 3); return () => (sd = (sd * 9301 + 49297) % 233280) / 233280; })();
        const list = [];
        for (let k = 0; k < (T.beads ? 10 : 7); k++) {
          const a = k / (T.beads ? 10 : 7) * Math.PI * 2 + r() * .5, o = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
          const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, h - .01, 0), o.clone().multiplyScalar(rt * .5).setY(h + .022 + r() * .018), o.clone().multiplyScalar(rt * 1.05).setY(h + .01)]);
          strandLeaves(T, c, o, list, r, t => T.size[0] * (1 - t * .3));
        }
        parent.add(leafMesh(T, list));
      });
      const drape = new THREE.Group(); g.add(drape); g.userData.drapeRoot = drape;
      // vines: rebuilt whenever the pot settles somewhere new, in the room's own directions
      g.userData.drape = (S, x, z, rot, sc) => {
        drape.children.forEach(o => { o.geometry && o.geometry !== T.leaf && o.geometry.dispose(); }); drape.clear();
        drape.rotation.y = -rot; drape.scale.setScalar(1 / sc);
        let sd = [...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 17); const r = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
        const [rt, , h] = T.pot.map(v => v * sc), none = { x0: 0, x1: 0, z0: 0, z1: 0 };
        const inside = (px, pz) => { const [qx, qz] = clampTo(S, px, pz, none); return Math.abs(qx - px) < 1e-4 && Math.abs(qz - pz) < 1e-4; };
        const shelf = S !== SURF.top, maxHang = Math.min(shelf ? .32 : .42, S.y - .03);
        const list = [], stem = std({ color: T.stem, roughness: .7 });
        const reach = a => { let e = rt; while (e < 1 && inside(x + Math.sin(a) * (e + .005), z + Math.cos(a) * (e + .005))) e += .005; return e; };
        let aim = 0;
        if (!shelf) { let best = 9; for (let a = -Math.PI; a < Math.PI; a += Math.PI / 24) { const e = reach(a); if (e < best - 1e-6) { best = e; aim = a; } } }
        for (let k = 0; k < T.strands; k++) {
          const th = aim + (k / (T.strands - 1) - .5) * 2.4 + (r() - .5) * .3, out = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
          let e = rt; while (e < .5 && inside(x + out.x * (e + .005), z + out.z * (e + .005))) e += .005;
          const ex = x + out.x * e, ez = z + out.z * e;
          const open = !shelf || (ez > .03 && Math.abs(ex) > DIV + .03);
          const pts = [out.clone().multiplyScalar(rt * .8).setY(h - .006), out.clone().multiplyScalar(rt + .012).setY(h + .004)];
          if (e > rt + .05) pts.push(out.clone().multiplyScalar(rt + .035).setY(.008), out.clone().multiplyScalar(e - .01).setY(.006));
          else pts.push(out.clone().multiplyScalar(e - .004).setY(.01));
          if (open) {
            const L = maxHang * (.35 + r() * .65), sw = (r() - .5) * .05, sideV = new THREE.Vector3(out.z, 0, -out.x);
            pts.push(out.clone().multiplyScalar(e + .012).setY(-.004), out.clone().multiplyScalar(e + .02).setY(-.04));
            for (let j = 1; j <= 3; j++) pts.push(out.clone().multiplyScalar(e + .022 + j * .004).add(sideV.clone().multiplyScalar(sw * j / 3)).setY(-.04 - L * j / 3));
          } else pts.push(out.clone().multiplyScalar(Math.max(e - .03, rt + .02)).add(new THREE.Vector3(out.z, 0, -out.x).multiplyScalar(.03 * (r() - .5))).setY(.006));
          const c = new THREE.CatmullRomCurve3(pts);
          const m = new THREE.Mesh(new THREE.TubeGeometry(c, 48, T.beads ? .0008 : .0014, 5), stem); m.castShadow = true; drape.add(m);
          const before = list.length; strandLeaves(T, c, out, list, r, t => T.size[0] + (T.size[1] - T.size[0]) * t);
          if (T.beads) list.splice(before, Math.min(4, list.length - before));   // bare stem over the pot rim
        }
        drape.add(leafMesh(T, list));
      };
      return g;
    };

    const KINDS = {
      lock: d => makeLock(d.v), ball: () => makeBall(),
      catalogues: d => makeCatalogues(d.v, d.n || 4), brochures: d => makeBrochures(d.v),
      plant: d => TRAIL[d.v] ? makeTrailing(d.v, d.id) : ({ olive: makeOlive, monstera: makeMonstera, succulent: makeSucculent, orchid: makeOrchid }[d.v] || makeOlive)()
    };
    function make(d) {
      // the same item always comes out the same, whatever else is on the counter
      const keep = seed; seed = [...d.id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 233280, 7);
      try { return KINDS[d.type](d); } finally { seed = keep; }
    }
    return { scene, make, setFinish, finishes: () => Object.assign({}, finishNow) };
  }


  const VIEWS = {
    hero:   { pos: [-1.6, 1.95, 2.35], at: [.02, .68, 0], fov: 34 },
    low:    { pos: [-1.45, 1.2, 2.75], at: [.05, .74, 0], fov: 36 },
    front:  { pos: [0, 1.15, 3.1], at: [0, .7, 0], fov: 33 },
    end:    { pos: [2.35, 1.6, 2.0], at: [.28, .8, .05], fov: 36 },
    detail: { pos: [.25, 1.1, 1.0], at: [0, .96, .3], fov: 36 },
    gold:   { pos: [1.05, 1.22, .75], at: [.6, 1.0, .1], fov: 34 },
    locks:  { pos: [.05, 1.36, 1.25], at: [.03, 1.2, -.04], fov: 46 },
    ball:   { pos: [-.15, 1.38, 1.15], at: [-.42, 1.13, -.04], fov: 44 },
    shelf:  { pos: [1.3, .95, 1.3], at: [.5, .5, .08], fov: 38 },
    top:    { pos: [0, 3.01, .3], at: [0, 1.01, .02], fov: 34 }
  };
  // the cameras were framed for a 1,000 counter: move them down with it
  Object.values(VIEWS).forEach(v => { if (v.pos[1] < 3) v.pos[1] += HG - 1.01; v.at[1] += HG - 1.01; });

  function loadImage(src) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }

  async function mount(THREE, el, opts = {}) {
    try { await document.fonts.load('500 200px "EB Garamond"'); } catch (e) {}
    const imgs = { sw: {} };
    const base = opts.assets || 'assets/';
    for (const k of ['noble-champagne', 'noble-ivory', 'noble-onyx', 'prestige-onyx', 'prestige-champagne', 'prestige-midnight']) imgs.sw[k] = await loadImage(base + 'lusano-' + k + '.jpg');
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.capture });
    renderer.setPixelRatio(opts.ratio || Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = opts.mood && opts.mood !== 'day' ? 1.0 : .88;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const shelves = opts.shelves !== false, ORDER = shelves ? SURF_ORDER : ['top'], START = shelves ? DEFAULT_LAYOUT : DEFAULT_CLOSED;
    const { scene, make, setFinish, finishes } = build(THREE, renderer, opts.mood, imgs, shelves);
    Object.entries(cleanFinishes(opts.finishes)).forEach(([k, v]) => setFinish(k, v));
    const cam = new THREE.PerspectiveCamera(32, 1, .02, 60);
    let controls = null;
    if (THREE.OrbitControls && !opts.capture) { controls = new THREE.OrbitControls(cam, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .49; controls.minDistance = .5; controls.maxDistance = 7; }
    function size() { const w = el.clientWidth || opts.w, h = el.clientHeight || opts.h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    function view(k) { const v = VIEWS[k]; cam.fov = v.fov; cam.position.set(...v.pos); cam.lookAt(...v.at); if (controls) { controls.target.set(...v.at); controls.update(); } cam.updateProjectionMatrix(); }

    /* ---------- the arrangement editor ---------- */
    const statics = []; scene.traverse(o => { if (o.isMesh && !o.isInstancedMesh && !(o.material && o.material.transparent)) statics.push(o); });
    const items = new Map();
    const tmp = new THREE.Vector3(), tmpBox = new THREE.Box3(), im = new THREE.Matrix4();
    function localBox(g) {       // the item's own extent, before it is turned or scaled
      const b = new THREE.Box3(); g.updateMatrixWorld(true);
      g.traverse(o => {
        if (!o.isMesh || !o.geometry) return;
        for (let q = o; q && q !== g; q = q.parent) if (q === g.userData.drapeRoot) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        if (o.isInstancedMesh) for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, im); im.premultiply(o.matrixWorld); b.union(tmpBox.copy(o.geometry.boundingBox).applyMatrix4(im)); }
        else b.union(tmpBox.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));
      });
      return b;
    }
    const fits = (it, on) => it.box.max.y * (it.d.s || 1) <= SURF[on].h + .001;
    function place(it, moving) {
      const d = it.d, S = SURF[d.on], sc = d.s || 1;
      [d.x, d.z] = clampTo(S, d.x, d.z, footprint(it.box, d.r || 0, sc));
      it.g.position.set(d.x, S.y, d.z); it.g.rotation.y = d.r || 0; it.g.scale.setScalar(sc);
      if (it.g.userData.drape && !moving) it.g.userData.drape(S, d.x, d.z, d.r || 0, sc);
      if (sel === it) frame();
    }
    function spawn(d) {
      const g = make(d); g.userData.id = d.id;
      const it = { d, g, box: localBox(g) };
      if (!ORDER.includes(d.on) || !fits(it, d.on)) d.on = ORDER.find(k => fits(it, k)) || 'top';
      items.set(d.id, it); scene.add(g); place(it); return it;
    }
    function drop(it) {
      scene.remove(it.g); items.delete(it.d.id);
      it.g.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      if (sel === it) select(null);
    }
    // the selection: a gold box drawn over everything
    const selBox = new THREE.Box3(), helper = new THREE.Box3Helper(selBox, 0xE9C27A);
    helper.material.depthTest = false; helper.material.transparent = true; helper.renderOrder = 999; helper.visible = false; scene.add(helper);
    let sel = null;
    function frame() {
      const d = sel.d, sc = d.s || 1, e = footprint(sel.box, d.r || 0, sc), y = SURF[d.on].y;
      selBox.min.set(d.x + e.x0 - .006, y + .001, d.z + e.z0 - .006); selBox.max.set(d.x + e.x1 + .006, y + sel.box.max.y * sc + .006, d.z + e.z1 + .006);
    }
    function info(it) {
      if (!it) return null;
      const d = it.d;
      return Object.assign(JSON.parse(JSON.stringify(d)), { name: itemName(d), variants: KIND_VARIANTS[d.type], surfaces: ORDER.map(k => ({ key: k, label: SURF[k].label, fits: fits(it, k) })) });
    }
    function select(id) {
      sel = (id && items.get(id)) || null; helper.visible = !!sel; if (sel) frame();
      if (opts.onSelect) opts.onSelect(info(sel));
    }
    const changed = () => { if (opts.onChange) opts.onChange(getLayout()); if (sel && opts.onSelect) opts.onSelect(info(sel)); };
    const getLayout = () => [...items.values()].map(it => JSON.parse(JSON.stringify(it.d)));
    function setLayout(list) {
      const clean = sanitize(list); if (!clean) return;
      const keep = sel && sel.d.id;
      [...items.values()].forEach(drop); clean.forEach(spawn);
      if (keep && items.has(keep)) select(keep); else select(null);
    }
    function freeSpot(it, on) {     // the place on a surface furthest from what is already there
      const S = SURF[on], others = [...items.values()].filter(o => o !== it && o.d.on === on);
      let best = [(S.x0 + S.x1) / 2, 0], bestScore = -1;
      for (let x = S.x0 + .06; x <= S.x1 - .06; x += .02) for (const z of [.08, 0, -.08, .14]) {
        const score = others.length ? Math.min(...others.map(o => Math.hypot(o.d.x - x, (o.d.z - z) * 1.5))) : 1 - Math.abs(x) * .1 - Math.abs(z);
        if (score > bestScore + 1e-6) { bestScore = score; best = [x, z]; }
      }
      return best;
    }
    const uid = t => t + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5);
    const editor = {
      layout: getLayout, setLayout, select, defaults: () => JSON.parse(JSON.stringify(START)),
      names: () => Object.fromEntries([...items.values()].map(it => [it.d.id, itemName(it.d)])),
      labels: () => Object.fromEntries(ORDER.map(k => [k, SURF[k].label])),
      selected: () => info(sel),
      add(type, v) {
        if (!(type in KIND_VARIANTS)) return null;
        if (type === 'ball' && [...items.values()].filter(i => i.d.type === 'ball').length >= 3) return null;
        const vs = KIND_VARIANTS[type];
        const d = { id: uid(type), type, on: 'top', x: 0, z: 0, r: 0 };
        if (vs.length) d.v = vs.some(x => x[0] === String(v)) ? String(v) : vs[0][0];
        if (type === 'plant') d.s = 1;
        const it = spawn(d); [d.x, d.z] = freeSpot(it, d.on); place(it);
        select(d.id); changed(); return d.id;
      },
      remove(id) { const it = items.get(id || (sel && sel.d.id)); if (it) { drop(it); changed(); } },
      duplicate(id) {
        const it = items.get(id || (sel && sel.d.id)); if (!it) return null;
        const d = JSON.parse(JSON.stringify(it.d)); d.id = uid(d.type);
        const n = spawn(d); [d.x, d.z] = freeSpot(n, d.on); place(n); select(d.id); changed(); return d.id;
      },
      update(id, patch) {
        const it = items.get(id || (sel && sel.d.id)); if (!it) return;
        const d = it.d;
        if (patch.v !== undefined && String(patch.v) !== d.v) {   // a different finish or kind: build it again in place
          const nd = Object.assign({}, d, { v: String(patch.v) }); const wasSel = sel === it;
          drop(it); const n = spawn(nd); if (wasSel) select(nd.id); changed(); return;
        }
        if (patch.on && patch.on !== d.on && ORDER.includes(patch.on) && fits(it, patch.on)) { d.on = patch.on; [d.x, d.z] = freeSpot(it, d.on); }
        if (typeof patch.r === 'number' && isFinite(patch.r)) d.r = patch.r;
        if (typeof patch.x === 'number' && isFinite(patch.x)) d.x = patch.x;
        if (typeof patch.z === 'number' && isFinite(patch.z)) d.z = patch.z;
        if (typeof patch.s === 'number' && isFinite(patch.s) && d.type === 'plant') {
          const s0 = d.s; d.s = Math.min(1.4, Math.max(.6, patch.s));
          if (!fits(it, d.on)) d.s = s0;
        }
        place(it); changed();
      },
      setEnabled(on) { editing = !!on; if (!editing) { select(null); renderer.domElement.style.cursor = ''; } }
    };
    let editing = false;
    // pointer: in arrange mode, press on a piece to pick it up and slide it across its surface; anywhere else still turns the view
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    function aim(ev) { const r = renderer.domElement.getBoundingClientRect(); ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); }
    function pick(ev) {
      aim(ev);
      const hits = ray.intersectObjects([...[...items.values()].map(i => i.g), ...statics], true);
      for (const h of hits) {
        if (h.object.isSprite || (h.object.material && h.object.material.transparent && h.object.material.opacity < .3)) continue;
        let o = h.object; while (o && !(o.userData && o.userData.id)) o = o.parent;
        return o ? items.get(o.userData.id) : null;   // the first solid thing under the pointer, piece or counter
      }
      return null;
    }
    function onPlane(ev, y) { aim(ev); plane.constant = -y; return ray.ray.intersectPlane(plane, tmp) ? tmp.clone() : null; }
    let drag = null, down = null;
    const onDown = ev => {
      if (!editing || ev.button !== 0) return;
      down = [ev.clientX, ev.clientY];
      const it = pick(ev); if (!it) return;
      ev.stopImmediatePropagation(); ev.preventDefault();
      select(it.d.id);
      const p = onPlane(ev, SURF[it.d.on].y);
      drag = { it, off: p ? [it.d.x - p.x, it.d.z - p.z] : [0, 0], moved: false };
      renderer.domElement.style.cursor = 'grabbing';
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}
    };
    const onMove = ev => {
      if (!editing) return;
      if (drag) {
        const p = onPlane(ev, SURF[drag.it.d.on].y); if (!p) return;
        drag.it.d.x = p.x + drag.off[0]; drag.it.d.z = p.z + drag.off[1]; drag.moved = true; place(drag.it, true);
        ev.stopImmediatePropagation(); return;
      }
      if (ev.buttons === 0 && !hoverBusy) { hoverBusy = true; requestAnimationFrame(() => { hoverBusy = false; renderer.domElement.style.cursor = editing && pick(ev) ? 'grab' : ''; }); }
    };
    let hoverBusy = false;
    const end = ev => {
      if (drag) { const moved = drag.moved; if (moved) place(drag.it); drag = null; renderer.domElement.style.cursor = 'grab'; try { el.releasePointerCapture(ev.pointerId); } catch (e) {} if (moved) changed(); ev.stopImmediatePropagation(); return; }
      if (editing && down && ev.type === 'pointerup' && Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) < 5) select(null);   // a click on empty space lets go
      down = null;
    };
    const LISTEN = [['pointerdown', onDown], ['pointermove', onMove], ['pointerup', end], ['pointercancel', end]];
    LISTEN.forEach(([t, f]) => el.addEventListener(t, f, true));

    setLayout(opts.layout || START);
    size(); view(opts.view || 'hero');
    let raf = 0; const loop = () => { raf = requestAnimationFrame(loop); if (controls) controls.update(); renderer.render(scene, cam); };
    if (!opts.capture) loop();
    window.addEventListener('resize', size);
    return {
      view, size, editor,
      finish: { set: setFinish, get: finishes, setAll: f => Object.entries(cleanFinishes(f)).forEach(([k, v]) => setFinish(k, v)) },
      capture(k) { const hv = helper.visible; helper.visible = false; view(k); renderer.render(scene, cam); const u = renderer.domElement.toDataURL('image/png'); helper.visible = hv; return u; },
      stop() { editing = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); LISTEN.forEach(([t, f]) => el.removeEventListener(t, f, true)); if (controls) controls.dispose(); renderer.dispose(); }
    };
  }
  return { mount, VIEWS, DEFAULT_LAYOUT, DEFAULT_CLOSED, sanitize, FINISHES, SLOTS, PRESETS, cleanFinishes };
}
window.MaxsenTable = MaxsenModel();
window.MaxsenTable.rect = MaxsenModel({ rect: true, frac: 3 / 8 });
window.MaxsenTable.rect28 = MaxsenModel({ rect: true, frac: 2 / 8 });
window.MaxsenTable.round28 = MaxsenModel({ frac: 2 / 8 });
