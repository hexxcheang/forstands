/* Maxsen booth planner: a 16 ft x 7 ft booth (4,877 x 2,134 mm) to fill with sample boards, counters, tables, chairs and plants.
   Units are metres: x along the 16 ft front, z from the back (-) to the aisle (+), y up. */
window.BoothPlanner = (function () {
  const BW = 4.877, BD = 2.134;                 // the booth, 16 ft by 7 ft
  const FT = .3048;

  /* ---------- what can go in the booth ---------- */
  const COUNTER_FORMS = {
    round:   { name: 'Rounded, gold top', gold: true, R: .15, top: .12 },
    round28: { name: 'Rounded, marble to 2/8', gold: false, R: .15, top: .85 * 2 / 8 },
    rect28:  { name: 'Rectangular, marble to 2/8', gold: false, R: .006, top: .85 * 2 / 8 },
    rect:    { name: 'Rectangular, marble to 3/8', gold: false, R: .006, top: .85 * 3 / 8 }
  };
  const BOARD_FACES = { switches: 'Lusano switches', locks: 'Lenovo smart locks', smart: 'Maxsen smart home and S8' };
  const BOARD_FINISHES = { whitegold: 'White and gold', whiterose: 'White and rose gold', oakbronze: 'Light oak and bronze', blackgold: 'Black and gold' };
  const BOARD_WIDTHS = [.6, .8, 1.0, 1.2];
  const KINDS = {
    board:   { name: 'Sample board', size: d => [d.w || .6, .45], h: 1.2 },
    counter: { name: 'Switch counter', size: d => COUNTER_FORMS[d.form || 'round'].gold ? [1.54, .55] : [1.4, .5], h: 1.41 },
    table:   { name: 'Round table', size: () => [.6, .6], h: .76 },
    chair:   { name: 'Chair', size: () => [.46, .48], h: .83 },
    plant:   { name: 'Olive tree', size: () => [.42, .42], h: 1.5 }
  };
  const DEFAULT_LAYOUT = [
    { id: 'counter1', type: 'counter', form: 'round', x: 0, z: -.7, r: 0 },
    { id: 'board1', type: 'board', w: .6, face: 'switches', finish: 'whitegold', x: -2.05, z: .3, r: Math.PI / 2 },
    { id: 'board2', type: 'board', w: .6, face: 'locks', finish: 'whitegold', x: -1.3, z: .3, r: Math.PI / 2 },
    { id: 'board3', type: 'board', w: .6, face: 'smart', finish: 'whitegold', x: 1.3, z: .3, r: Math.PI / 2 },
    { id: 'board4', type: 'board', w: .6, face: 'switches', finish: 'whitegold', x: 2.05, z: .3, r: Math.PI / 2 }
  ];
  function itemName(d) {
    if (d.type === 'board') return 'Sample board · ' + Math.round((d.w || .6) * 1000) + ' wide';
    if (d.type === 'counter') return 'Switch counter · ' + COUNTER_FORMS[d.form || 'round'].name.toLowerCase();
    return KINDS[d.type].name;
  }
  function sanitize(list) {
    if (!Array.isArray(list)) return null;
    const num = (v, lo, hi, dflt) => (typeof v === 'number' && isFinite(v)) ? Math.min(hi, Math.max(lo, v)) : dflt;
    const out = [], seen = new Set();
    for (const d of list.slice(0, 60)) {
      if (!d || typeof d !== 'object' || !(d.type in KINDS)) continue;
      const id = typeof d.id === 'string' && /^[a-z0-9_-]{1,40}$/i.test(d.id) && !seen.has(d.id) ? d.id : d.type + Math.random().toString(36).slice(2, 8);
      seen.add(id);
      const e = { id, type: d.type, x: num(d.x, -3, 3, 0), z: num(d.z, -2, 2, 0), r: num(d.r, -7, 7, 0) };
      if (d.type === 'board') {
        e.w = BOARD_WIDTHS.includes(d.w) ? d.w : .6;
        e.face = d.face in BOARD_FACES ? d.face : 'switches';
        e.finish = d.finish in BOARD_FINISHES ? d.finish : 'whitegold';
      }
      if (d.type === 'counter') e.form = d.form in COUNTER_FORMS ? d.form : 'round';
      out.push(e);
    }
    return out;
  }
  // the footprint, turned by r: half-extents of its box on the floor
  function corners(d) {
    const [w, dd] = KINDS[d.type].size(d), c = Math.cos(d.r || 0), s = Math.sin(d.r || 0);
    return [[-w / 2, -dd / 2], [w / 2, -dd / 2], [w / 2, dd / 2], [-w / 2, dd / 2]].map(([x, z]) => [d.x + x * c + z * s, d.z - x * s + z * c]);
  }
  function keepInside(d) {
    const pts = corners(d);
    const minx = Math.min(...pts.map(p => p[0])), maxx = Math.max(...pts.map(p => p[0])), minz = Math.min(...pts.map(p => p[1])), maxz = Math.max(...pts.map(p => p[1]));
    const m = .005;
    if (minx < -BW / 2 + m) d.x += -BW / 2 + m - minx; if (maxx > BW / 2 - m) d.x -= maxx - (BW / 2 - m);
    if (minz < -BD / 2 + m) d.z += -BD / 2 + m - minz; if (maxz > BD / 2 - m) d.z -= maxz - (BD / 2 - m);
  }
  function overlap(a, b) {   // two turned rectangles, by separating axes
    const A = corners(a), B = corners(b);
    for (const P of [A, B]) for (let i = 0; i < 4; i++) {
      const [x1, z1] = P[i], [x2, z2] = P[(i + 1) % 4], nx = z1 - z2, nz = x2 - x1;
      const pa = A.map(p => p[0] * nx + p[1] * nz), pb = B.map(p => p[0] * nx + p[1] * nz);
      if (Math.max(...pa) <= Math.min(...pb) + 1e-6 || Math.max(...pb) <= Math.min(...pa) + 1e-6) return false;
    }
    return true;
  }

  /* ---------- textures ---------- */
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  function marbleCanvas() {
    const [c, g] = canvas(1024, 512); g.fillStyle = '#F4F1EC'; g.fillRect(0, 0, 1024, 512);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = `rgba(${k % 4 ? '110,108,106' : '176,142,92'},${.2 + rnd() * .35})`; g.lineWidth = .6 + rnd() * 2;
      g.beginPath(); let x = -20, y = rnd() * 512; g.moveTo(x, y); const dr = (rnd() - .5) * 50;
      while (x < 1050) { const nx = x + 25 + rnd() * 45, ny = y + dr * .3 + (rnd() - .5) * 30; g.lineTo(nx, ny); x = nx; y = ny; } g.stroke();
    }
    return c;
  }
  function woodCanvas(base, dark, light) {
    const [c, g] = canvas(1024, 256); g.fillStyle = base; g.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 120; i++) { g.strokeStyle = `rgba(${rnd() > .5 ? dark : light},${.06 + rnd() * .2})`; g.lineWidth = .5 + rnd() * 2; let y = rnd() * 256; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) { y += (rnd() - .5) * 3; g.lineTo(x, y); } g.stroke(); }
    return c;
  }
  // the booth floor: carpet with a 1 ft grid, the edge, and the dimensions round it
  function floorCanvas() {
    const PX = 200, MX = 1.2, MZ = 1.0, W = Math.round((BW + 2 * MX) * PX), H = Math.round((BD + 2 * MZ) * PX);
    const [c, g] = canvas(W, H), X = x => (x + BW / 2 + MX) * PX, Z = z => (z + BD / 2 + MZ) * PX;
    g.fillStyle = '#d9d4cd'; g.fillRect(0, 0, W, H);                          // the hall floor
    g.fillStyle = '#ece6dd'; g.fillRect(X(-BW / 2), Z(-BD / 2), BW * PX, BD * PX); // the booth carpet
    g.strokeStyle = 'rgba(120,104,90,.18)'; g.lineWidth = 2;
    for (let x = -BW / 2 + FT; x < BW / 2 - .01; x += FT) { g.beginPath(); g.moveTo(X(x), Z(-BD / 2)); g.lineTo(X(x), Z(BD / 2)); g.stroke(); }
    for (let z = -BD / 2 + FT; z < BD / 2 - .01; z += FT) { g.beginPath(); g.moveTo(X(-BW / 2), Z(z)); g.lineTo(X(BW / 2), Z(z)); g.stroke(); }
    g.strokeStyle = '#7e5643'; g.lineWidth = 6; g.strokeRect(X(-BW / 2), Z(-BD / 2), BW * PX, BD * PX);
    g.fillStyle = '#5b4e47'; g.font = '700 46px Lato, Arial, sans-serif'; g.textAlign = 'center';
    g.fillText('16 ft · 4,877 mm', X(0), Z(BD / 2) + 90);
    g.fillText('AISLE', X(0), Z(BD / 2) + 170);
    g.fillText('BACK OF BOOTH', X(0), Z(-BD / 2) - 60);
    g.save(); g.translate(X(-BW / 2) - 70, Z(0)); g.rotate(-Math.PI / 2); g.fillText('7 ft · 2,134 mm', 0, 0); g.restore();
    g.save(); g.translate(X(BW / 2) + 70, Z(0)); g.rotate(Math.PI / 2); g.fillText('7 ft · 2,134 mm', 0, 0); g.restore();
    return [c, BW + 2 * MX, BD + 2 * MZ];
  }
  // a board face: brand header and a printed backdrop for the samples
  function faceCanvas(face, dark) {
    const [c, g] = canvas(512, 1024);
    g.fillStyle = dark ? '#161514' : '#F6F3EE'; g.fillRect(0, 0, 512, 1024);
    const ink = dark ? '#E8D3B4' : '#29221F', soft = dark ? 'rgba(232,211,180,.55)' : 'rgba(41,34,31,.55)';
    g.textAlign = 'center'; g.fillStyle = ink;
    const T = { switches: ['LUSANO', 'SWAROVSKI CRYSTAL SWITCHES', true], locks: ['LENOVO', 'SMART LOCKS · MYDIGITALLOCK', false], smart: ['MAXSEN', 'THE SMART HOME', false] }[face];
    g.font = T[2] ? '500 84px "EB Garamond", Georgia, serif' : '700 64px Lato, Arial, sans-serif';
    if (g.letterSpacing !== undefined) g.letterSpacing = T[2] ? '14px' : '18px';
    g.fillText(T[0], 263, 140);
    g.font = '700 22px Lato, Arial, sans-serif'; if (g.letterSpacing !== undefined) g.letterSpacing = '5px'; g.fillStyle = soft; g.fillText(T[1], 258, 190);
    g.strokeStyle = soft; g.lineWidth = 2; g.beginPath(); g.moveTo(156, 222); g.lineTo(356, 222); g.stroke();
    g.font = '700 18px Lato, Arial, sans-serif'; g.fillText('MAXSEN.SG', 256, 990);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }

  /* ---------- the scene ---------- */
  function build(THREE, renderer) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE9E4DD); scene.fog = new THREE.Fog(0xE9E4DD, 24, 40);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new THREE.RoomEnvironment(), .04).texture;
    const std = o => new THREE.MeshStandardMaterial(Object.assign({ roughness: .6, metalness: 0, envMapIntensity: .5 }, o));
    let parent = scene;
    const add = (geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true; parent.add(m); return m; };
    const group = fn => { const g = new THREE.Group(), prev = parent; parent = g; try { fn(); } finally { parent = prev; } return g; };
    const tex = (c, rx = 1, ry = 1) => { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };

    const [fc, fw, fd] = floorCanvas();
    const floor = add(new THREE.PlaneGeometry(fw, fd), std({ map: tex(fc), roughness: .95 }), 0, 0, 0, { cast: false }); floor.rotation.x = -Math.PI / 2;
    const out = add(new THREE.PlaneGeometry(40, 40), std({ color: 0xd9d4cd, roughness: .95 }), 0, -.002, 0, { cast: false }); out.rotation.x = -Math.PI / 2;
    scene.add(new THREE.HemisphereLight(0xfff7ef, 0x9d8f80, .3));
    const key = new THREE.DirectionalLight(0xfff3e6, .75); key.position.set(-2.5, 6, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 3, bottom: -3, near: .5, far: 15 }); key.shadow.bias = -.0005; scene.add(key);

    const marble = std({ map: tex(marbleCanvas()), roughness: .35 });
    const oak = std({ map: tex(woodCanvas('#D2B994', '150,116,78', '238,220,192'), 1, 1), roughness: .55 });
    const bronze = std({ color: 0x29221F, roughness: .4, metalness: .5 });
    const gold = std({ color: 0xB98A3E, roughness: .3, metalness: 1, envMapIntensity: 1 });
    const rose = std({ color: 0xB06A55, roughness: .3, metalness: 1, envMapIntensity: 1 });
    const white = std({ color: 0xF2EFEA, roughness: .5 });
    const black = std({ color: 0x161514, roughness: .45 });
    const led = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xFF7E00).convertSRGBToLinear() });   // 1800 K
    const plateMats = ['#E3D5C7', '#E4E6E7', '#151515', '#3a3a3a', '#A08A74', '#4A4F5C'].map(c => std({ color: new THREE.Color(c).convertSRGBToLinear(), roughness: .3, metalness: .15 }));
    const band = std({ color: 0x120c0a, roughness: .4 });
    const screen = (() => { const [c, g] = canvas(256, 160); g.fillStyle = '#121318'; g.fillRect(0, 0, 256, 160); g.fillStyle = '#f2efea'; g.font = '700 16px Lato, Arial'; g.fillText('Sat 1 Nov · 10:30', 14, 24);
      [['#cfa594', 14], ['#d9c08a', 74]].forEach(([col, x]) => { g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x, 40, 54, 100); g.fillStyle = col; g.beginPath(); g.arc(x + 14, 56, 6, 0, 7); g.fill(); });
      g.fillStyle = '#e9e6e1'; g.fillRect(134, 40, 50, 48); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(134, 94, 50, 46); g.fillRect(192, 40, 26, 100); g.fillStyle = '#f2efea'; g.fillRect(192, 70, 26, 70);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return new THREE.MeshBasicMaterial({ map: t }); })();
    const roundRect = (w, d, r) => { const s = new THREE.Shape(), x = -w / 2, y = -d / 2; r = Math.max(.002, Math.min(r, w / 2, d / 2));
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + d - r); s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2);
      s.lineTo(x + r, y + d); s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI); s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5); return s; };
    const slab = (shape, h) => { const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 20 }); g.rotateX(Math.PI / 2); g.translate(0, h, 0); return g; };
    // a switch plate facing +z, its back at z0
    function plate(x, y, z0, i) { add(new THREE.BoxGeometry(.086, .086, .008), plateMats[i % 6], x, y, z0 + .004); add(new THREE.BoxGeometry(.086, .014, .0012), band, x, y, z0 + .0085, { cast: false }); }
    function s8(x, y, z0) { add(new THREE.BoxGeometry(.216, .116, .014), black, x, y, z0 + .007); add(new THREE.PlaneGeometry(.172, .108), screen, x - .018, y, z0 + .0142, { cast: false }); }
    function lockFace(x, y, z0, finish) {   // a Lenovo lock body: 78 x 410, dark glass upper, finish panel lower
      add(new THREE.BoxGeometry(.078, .41, .05), std({ color: 0x1a1a1b, roughness: .3, metalness: .8 }), x, y, z0 + .025);
      add(new THREE.PlaneGeometry(.07, .22), std({ color: 0x0b0b0d, roughness: .08, emissive: 0x223044, emissiveIntensity: .4 }), x, y + .085, z0 + .0505, { cast: false });
      add(new THREE.PlaneGeometry(.07, .16), std({ color: finish, roughness: .2 }), x, y - .11, z0 + .0505, { cast: false });
    }

    /* the sample board: a two-sided panel on a triangular base that braces it in front and behind */
    function makeBoard(d) {
      const w = d.w || .6, F = { whitegold: [white, gold, false], whiterose: [white, rose, false], oakbronze: [oak, bronze, false], blackgold: [black, gold, true] }[d.finish || 'whitegold'];
      const [panelMat, baseMat, dark] = F, H = 1.2, BH = .22, BDp = .45, T = .03;
      return group(() => {
        // the base: a triangular prism, 450 deep and 220 high, running the width of the board
        const tri = new THREE.Shape(); tri.moveTo(-BDp / 2, 0); tri.lineTo(BDp / 2, 0); tri.lineTo(.03, BH); tri.lineTo(-.03, BH); tri.lineTo(-BDp / 2, 0);
        const g = new THREE.ExtrudeGeometry(tri, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2);
        add(g, baseMat);
        add(new THREE.BoxGeometry(w + .01, .012, BDp + .01), bronze, 0, .006, 0);   // a thin plinth under it
        // the board: 30 mm thick, from the base to 1,200
        const faceA = faceCanvasMat(d.face, dark), faceB = faceCanvasMat(d.face, dark);
        add(new THREE.BoxGeometry(w, H - BH + .04, T), [panelMat, panelMat, panelMat, panelMat, faceA, faceB], 0, BH - .04 + (H - BH + .04) / 2, 0);
        add(new THREE.BoxGeometry(w + .006, .012, T + .006), baseMat, 0, H, 0);     // a capping strip
        // the samples, on both faces
        [1, -1].forEach(side => {
          const z0 = side * T / 2, gp = new THREE.Group(); parent.add(gp); if (side < 0) gp.rotation.y = Math.PI;
          const prev = parent; parent = gp;
          const cols = Math.max(2, Math.floor((w - .08) / .12)), x0 = -(cols - 1) * .12 / 2;
          if (d.face === 'switches') { for (let r = 0; r < 4; r++) for (let k = 0; k < cols; k++) plate(x0 + k * .12, .9 - r * .135, T / 2, r * cols + k); }
          else if (d.face === 'locks') { const n = Math.max(1, Math.floor((w - .06) / .2)); for (let k = 0; k < n; k++) lockFace(-(n - 1) * .1 + k * .2, .62, T / 2, [0x6b2a18, 0x0c0c0d, 0x26282c, 0x2a2b2d, 0x0e2a1c][k % 5]); }
          else { s8(0, .9, T / 2); for (let k = 0; k < Math.min(cols, 4); k++) plate(-(Math.min(cols, 4) - 1) * .06 + k * .12, .72, T / 2, k + 1); for (let k = 0; k < Math.min(cols, 3); k++) add(new THREE.CylinderGeometry(.03, .03, .02, 24).rotateX(Math.PI / 2), white, -(Math.min(cols, 3) - 1) * .06 + k * .12, .56, T / 2 + .01); }
          parent = prev; void z0;
        });
      });
    }
    const faceCache = {};
    function faceCanvasMat(face, dark) { const k = face + dark; return faceCache[k] || (faceCache[k] = std({ map: faceCanvas(face, dark), roughness: .5 })); }

    /* the switch counter, in any of its four forms, at its real size */
    function makeCounter(d) {
      const F = COUNTER_FORMS[d.form || 'round'], H = F.gold ? .84 : .85, TOP = F.top, Y1 = H - TOP, L = 1.4, D = .5, R = F.R;
      return group(() => {
        add(slab(roundRect(L - .13, D - .13, Math.max(.01, R - .06)), .058), bronze, 0, .002, 0);
        add(slab(roundRect(L - .03, D - .03, Math.max(.005, R - .015)), Y1 - .06), oak, 0, .06, 0);
        // the open end bays, in shadow, with their shelves
        [-1, 1].forEach(sd => {
          add(new THREE.BoxGeometry(.33, Y1 - .12, .02), std({ color: 0x8c7458, roughness: .8 }), sd * .515, .06 + (Y1 - .06) / 2, D / 2 - .025);
          const n = F.gold ? 2 : 1; for (let i = 1; i <= n; i++) add(new THREE.BoxGeometry(.33, .025, .03), oak, sd * .515, .1 + (Y1 - .1) * i / (n + 1), D / 2 - .01);
        });
        add(slab(roundRect(L, D, R), TOP), marble, 0, Y1, 0);
        if (F.gold) add(slab(roundRect(L * 1.1, D * 1.1, R * 1.1), .01), gold, 0, H, 0);
        add(new THREE.BoxGeometry(L - .06, .006, .006), led, 0, Y1 - .006, D / 2 - .01, { cast: false });
        // LUSANO on the closed centre
        const [lc, lg] = canvas(1024, 200); lg.font = '500 150px "EB Garamond", Georgia, serif'; lg.textAlign = 'center'; lg.textBaseline = 'middle'; if (lg.letterSpacing !== undefined) lg.letterSpacing = '24px'; lg.fillStyle = '#3A2C24'; lg.fillText('LUSANO', 524, 108);
        const lt = new THREE.CanvasTexture(lc); lt.encoding = THREE.sRGBEncoding;
        add(new THREE.PlaneGeometry(.56, .11), new THREE.MeshBasicMaterial({ map: lt, transparent: true }), 0, .1 + (Y1 - .1) * .615, D / 2 - .012, { cast: false });
        // the front row: three Noble, the S8, three Prestige
        const ey = H - TOP / 2;
        [-.383, -.277, -.171, .171, .277, .383].forEach((x, i) => plate(x, ey, D / 2, i));
        s8(0, ey, D / 2);
        // six Lenovo locks on their stands, staggered, and the ball light
        const HG = H + (F.gold ? .01 : 0);
        [[-.445, -.077], [-.225, .104], [-.03, -.079], [.188, .092], [.391, -.069], [.566, .062]].forEach(([x, z], i) => {
          add(new THREE.BoxGeometry(.17, .012, .15), bronze, x, HG + .006, z);
          add(new THREE.BoxGeometry(.15, .55, .045), oak, x, HG + .012 + .275, z);
          lockFace(x - .005, HG + .3, z + .0225, [0x6b2a18, 0x0c0c0d, 0x26282c, 0x2a2b2d, 0x0e2a1c, 0x0e2a1c][i]);
        });
        add(new THREE.CylinderGeometry(.06, .07, .022, 32), bronze, -.596, HG + .011, .116);
        add(new THREE.SphereGeometry(.1, 32, 20), std({ color: 0xf1ece4, emissive: 0xffb46b, emissiveIntensity: .6, roughness: .4 }), -.596, HG + .122, .116, { cast: false });
      });
    }
    function makeTable() { return group(() => {
      add(new THREE.CylinderGeometry(.3, .3, .03, 48), marble, 0, .745, 0);
      add(new THREE.CylinderGeometry(.03, .03, .72, 16), bronze, 0, .37, 0);
      add(new THREE.CylinderGeometry(.22, .24, .02, 32), bronze, 0, .01, 0);
    }); }
    const seat = std({ color: 0xC69A87, roughness: .95 });
    function makeChair() { return group(() => {   // facing +z
      add(new THREE.BoxGeometry(.44, .09, .44), seat, 0, .45, 0);
      add(new THREE.BoxGeometry(.44, .34, .07), seat, 0, .66, -.19);
      [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]].forEach(([a, b]) => add(new THREE.CylinderGeometry(.012, .012, .42, 8), bronze, a, .21, b));
    }); }
    function makePlant() { return group(() => {
      add(new THREE.CylinderGeometry(.17, .14, .32, 32), bronze, 0, .16, 0);
      add(new THREE.CylinderGeometry(.018, .025, .8, 10), std({ color: 0x6b5a48, roughness: .9 }), 0, .7, 0);
      const leaf = std({ color: new THREE.Color('#7d8b6a').convertSRGBToLinear(), roughness: .8, flatShading: true });
      [[0, 1.2, 0, .24], [.13, 1.1, .05, .17], [-.13, 1.14, -.03, .18], [.02, 1.36, -.02, .16]].forEach(([x, y, z, r]) => add(new THREE.IcosahedronGeometry(r, 1), leaf, x, y, z));
    }); }
    const MAKE = { board: makeBoard, counter: makeCounter, table: makeTable, chair: makeChair, plant: makePlant };
    return { scene, make: d => MAKE[d.type](d) };
  }

  const VIEWS = {
    three: { pos: [-3.4, 3.1, 4.6], at: [0, .55, 0], fov: 42 },
    front: { pos: [0, 1.6, 5.6], at: [0, .7, 0], fov: 40 },
    plan:  { pos: [0, 18, .01], at: [0, 0, 0], fov: 16.5 },     // high and narrow, so the plan is close to true
    side:  { pos: [5.6, 1.8, 1.2], at: [0, .6, 0], fov: 40 }
  };

  async function mount(THREE, el, opts = {}) {
    try { await document.fonts.load('500 100px "EB Garamond"'); } catch (e) {}
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.capture });
    renderer.setPixelRatio(opts.ratio || Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const { scene, make } = build(THREE, renderer);
    const cam = new THREE.PerspectiveCamera(40, 1, .05, 80);
    let controls = null;
    if (THREE.OrbitControls && !opts.capture) { controls = new THREE.OrbitControls(cam, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .49; controls.minDistance = 1; controls.maxDistance = 20; }
    function size() { const w = el.clientWidth || opts.w, h = el.clientHeight || opts.h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    function view(k) { const v = VIEWS[k]; cam.fov = v.fov; cam.position.set(...v.pos); cam.lookAt(...v.at); if (controls) { controls.target.set(...v.at); controls.update(); } cam.updateProjectionMatrix(); }

    /* ---------- the editor ---------- */
    const items = new Map();
    let snap = opts.snap !== false;
    const outlineMat = new THREE.LineBasicMaterial({ color: 0xB98A3E, transparent: true, opacity: .8 }), clashMat = new THREE.LineBasicMaterial({ color: 0xC0392B });
    const clashFill = new THREE.MeshBasicMaterial({ color: 0xC0392B, transparent: true, opacity: .32, depthWrite: false });
    function outline(it) {
      const pts = corners(it.d).map(([x, z]) => new THREE.Vector3(x, .004, z));
      if (!it.line) { it.line = new THREE.LineLoop(new THREE.BufferGeometry(), outlineMat); it.line.userData.skip = true; scene.add(it.line); }
      it.line.geometry.setFromPoints(pts);
      // a red wash under the piece, shown only while it overlaps another
      if (!it.fill) { const [w, dd] = KINDS[it.d.type].size(it.d); it.fill = new THREE.Mesh(new THREE.PlaneGeometry(w + .02, dd + .02), clashFill); it.fill.rotation.order = 'YXZ'; it.fill.visible = false; scene.add(it.fill); }
      it.fill.position.set(it.d.x, .003, it.d.z); it.fill.rotation.set(-Math.PI / 2, it.d.r || 0, 0);
    }
    function place(it) {
      const d = it.d;
      if (snap) { d.x = Math.round(d.x / .05) * .05; d.z = Math.round(d.z / .05) * .05; }
      keepInside(d);
      it.g.position.set(d.x, 0, d.z); it.g.rotation.y = d.r || 0; outline(it);
    }
    function clashes() {
      const list = [...items.values()], hit = new Set();
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const a = list[i].d, b = list[j].d;
        if ((a.type === 'chair' && b.type === 'table') || (a.type === 'table' && b.type === 'chair')) continue;   // a chair tucks under a table
        if (overlap(a, b)) { hit.add(a.id); hit.add(b.id); }
      }
      list.forEach(it => { if (it.line) it.line.material = hit.has(it.d.id) ? clashMat : outlineMat; if (it.fill) it.fill.visible = hit.has(it.d.id); });
      return hit;
    }
    function spawn(d) { const g = make(d); g.userData.id = d.id; scene.add(g); const it = { d, g }; items.set(d.id, it); place(it); return it; }
    function drop(it) {
      scene.remove(it.g); if (it.line) { scene.remove(it.line); it.line.geometry.dispose(); } if (it.fill) { scene.remove(it.fill); it.fill.geometry.dispose(); }
      it.g.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      items.delete(it.d.id); if (sel === it) select(null);
    }
    const selBox = new THREE.Box3(), helper = new THREE.Box3Helper(selBox, 0xE9C27A);
    helper.material.depthTest = false; helper.material.transparent = true; helper.renderOrder = 999; helper.visible = false; scene.add(helper);
    let sel = null;
    const frame = () => { if (sel) selBox.setFromObject(sel.g); };
    const info = it => it ? Object.assign(JSON.parse(JSON.stringify(it.d)), { name: itemName(it.d), size: KINDS[it.d.type].size(it.d), height: KINDS[it.d.type].h }) : null;
    function select(id) { sel = (id && items.get(id)) || null; helper.visible = !!sel; frame(); if (opts.onSelect) opts.onSelect(info(sel)); }
    const getLayout = () => [...items.values()].map(it => JSON.parse(JSON.stringify(it.d)));
    const changed = () => { const c = clashes(); if (opts.onChange) opts.onChange(getLayout(), [...c]); if (sel && opts.onSelect) opts.onSelect(info(sel)); };
    function setLayout(list) { const clean = sanitize(list); if (!clean) return; const keep = sel && sel.d.id; [...items.values()].forEach(drop); clean.forEach(spawn); select(keep && items.has(keep) ? keep : null); clashes(); }
    function freeSpot(d) {   // the clear spot nearest the middle of the booth
      let best = null;
      for (let z = -.75; z <= .75; z += .25) for (let x = -2.1; x <= 2.1; x += .15) {
        const t = Object.assign({}, d, { x, z }); keepInside(t);
        const n = [...items.values()].filter(o => overlap(t, o.d)).length, score = n * 10 + Math.abs(x) * .2 + Math.abs(z) * .1;
        if (!best || score < best[0]) best = [score, t.x, t.z];
      }
      return [best[1], best[2]];
    }
    const uid = t => t + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5);
    const editor = {
      layout: getLayout, setLayout, select, selected: () => info(sel), defaults: () => JSON.parse(JSON.stringify(DEFAULT_LAYOUT)),
      names: () => Object.fromEntries([...items.values()].map(it => [it.d.id, itemName(it.d)])),
      clashes: () => [...clashes()],
      setSnap(on) { snap = !!on; },
      add(type) {
        if (!(type in KINDS) || items.size >= 60) return null;
        const d = sanitize([{ id: uid(type), type, x: 0, z: 0, r: type === 'board' ? Math.PI / 2 : 0 }])[0];
        [d.x, d.z] = freeSpot(d); const it = spawn(d); select(d.id); changed(); return it.d.id;
      },
      remove(id) { const it = items.get(id || (sel && sel.d.id)); if (it) { drop(it); changed(); } },
      duplicate(id) {
        const it = items.get(id || (sel && sel.d.id)); if (!it) return null;
        const d = JSON.parse(JSON.stringify(it.d)); d.id = uid(d.type); [d.x, d.z] = freeSpot(d);
        spawn(d); select(d.id); changed(); return d.id;
      },
      update(id, patch) {
        const it = items.get(id || (sel && sel.d.id)); if (!it) return;
        const d = it.d, rebuild = ['w', 'face', 'finish', 'form'].some(k => patch[k] !== undefined && patch[k] !== d[k]);
        ['x', 'z', 'r'].forEach(k => { if (typeof patch[k] === 'number' && isFinite(patch[k])) d[k] = patch[k]; });
        if (snap && typeof patch.r === 'number') d.r = Math.round(d.r / (Math.PI / 12)) * (Math.PI / 12);
        if (rebuild) {
          const nd = sanitize([Object.assign({}, d, patch)])[0]; nd.id = d.id; const wasSel = sel === it;
          drop(it); spawn(nd); if (wasSel) select(nd.id);
        } else place(it);
        frame(); changed();
      },
      setEnabled(on) { editing = !!on; if (!editing) select(null); }
    };
    let editing = opts.editing !== false;

    // pointer: press on a piece and drag it across the floor; drag anywhere else to turn the view
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), tmp = new THREE.Vector3();
    const aim = ev => { const r = renderer.domElement.getBoundingClientRect(); ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); };
    function pick(ev) {
      aim(ev);
      const hits = ray.intersectObjects([...items.values()].map(i => i.g), true);
      for (const h of hits) { let o = h.object; while (o && !(o.userData && o.userData.id)) o = o.parent; if (o) return items.get(o.userData.id); }
      return null;
    }
    const onFloor = ev => { aim(ev); return ray.ray.intersectPlane(plane, tmp) ? tmp.clone() : null; };
    let drag = null, down = null, hoverBusy = false;
    const onDown = ev => {
      if (!editing || ev.button !== 0) return;
      down = [ev.clientX, ev.clientY];
      const it = pick(ev); if (!it) return;
      ev.stopImmediatePropagation(); ev.preventDefault(); select(it.d.id);
      const p = onFloor(ev); drag = { it, off: p ? [it.d.x - p.x, it.d.z - p.z] : [0, 0], moved: false };
      renderer.domElement.style.cursor = 'grabbing'; try { el.setPointerCapture(ev.pointerId); } catch (e) {}
    };
    const onMove = ev => {
      if (!editing) return;
      if (drag) { const p = onFloor(ev); if (!p) return; drag.it.d.x = p.x + drag.off[0]; drag.it.d.z = p.z + drag.off[1]; drag.moved = true; place(drag.it); frame(); clashes(); ev.stopImmediatePropagation(); return; }
      if (ev.buttons === 0 && !hoverBusy) { hoverBusy = true; requestAnimationFrame(() => { hoverBusy = false; renderer.domElement.style.cursor = editing && pick(ev) ? 'grab' : ''; }); }
    };
    const end = ev => {
      if (drag) { const moved = drag.moved; drag = null; renderer.domElement.style.cursor = 'grab'; try { el.releasePointerCapture(ev.pointerId); } catch (e) {} if (moved) changed(); ev.stopImmediatePropagation(); return; }
      if (editing && down && ev.type === 'pointerup' && Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) < 5) select(null);
      down = null;
    };
    const LISTEN = [['pointerdown', onDown], ['pointermove', onMove], ['pointerup', end], ['pointercancel', end]];
    LISTEN.forEach(([t, f]) => el.addEventListener(t, f, true));

    setLayout(opts.layout || DEFAULT_LAYOUT);
    size(); view(opts.view || 'three');
    let raf = 0; const loop = () => { raf = requestAnimationFrame(loop); if (controls) controls.update(); if (sel) frame(); renderer.render(scene, cam); };
    if (!opts.capture) loop();
    window.addEventListener('resize', size);
    return {
      view, size, editor,
      capture(k) { const hv = helper.visible; helper.visible = false; view(k); renderer.render(scene, cam); const u = renderer.domElement.toDataURL('image/png'); helper.visible = hv; return u; },
      stop() { editing = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); LISTEN.forEach(([t, f]) => el.removeEventListener(t, f, true)); if (controls) controls.dispose(); renderer.dispose(); }
    };
  }
  return { mount, VIEWS, KINDS, COUNTER_FORMS, BOARD_FACES, BOARD_FINISHES, BOARD_WIDTHS, DEFAULT_LAYOUT, sanitize, BW, BD };
})();
