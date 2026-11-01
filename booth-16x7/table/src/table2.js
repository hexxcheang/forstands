/* The Maxsen switch counter, after the reference image, in the Maxsen colourway.
   1,400 long, 600 deep (assumed), 1,000 high. Units are metres: x along the length,
   z from the back (-) to the front (+), y up. */
window.MaxsenTable = (function () {
  const L = 1.4, D = 0.5, H = 1.0;
  const TOP = 0.12, R = 0.15;              // a 120 mm stone top with 150 mm corners; switches sit on its front edge
  const OV = 0.015;                        // the top overhangs the body by 15 mm
  const BL = L - 2 * OV, BD = D - 2 * OV, BR = R - OV;
  const BASE = 0.06, T = 0.02;             // floating base; panel thickness
  const Y0 = BASE, Y1 = H - TOP;           // body from the base to the underside of the top
  const DIV = 0.33;                        // dividers either side of the centre niche, 660 apart
  const SHELVES = [0.33, 0.6];             // shelf heights in both end bays
  const SANS = 'Lato, "Helvetica Neue", Arial, sans-serif';

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
  function stone(THREE) { // white marble with bold grey and soft gold veining
    const [c, g] = canvas(2048, 1024);
    g.fillStyle = '#F4F1EC'; g.fillRect(0, 0, 2048, 1024);
    for (let k = 0; k < 26; k++) { const x = rnd() * 2048, y = rnd() * 1024, r = 120 + rnd() * 320; const f = g.createRadialGradient(x, y, 0, x, y, r); f.addColorStop(0, `rgba(${rnd() > .6 ? '228,222,214' : '250,248,245'},.7)`); f.addColorStop(1, 'rgba(244,241,236,0)'); g.fillStyle = f; g.fillRect(0, 0, 2048, 1024); }
    const vein = (w, a, col, wob) => {
      g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = w; g.lineCap = 'round';
      g.beginPath(); let x = -40, y = rnd() * 1024; g.moveTo(x, y); const drift = (rnd() - .5) * 70;
      while (x < 2100) { const nx = x + 30 + rnd() * 60, ny = y + drift + (rnd() - .5) * wob; g.quadraticCurveTo(x + (nx - x) / 2, y + (rnd() - .5) * wob, nx, ny); x = nx; y = ny; }
      g.stroke();
    };
    for (let k = 0; k < 5; k++) { g.filter = 'blur(6px)'; vein(10 + rnd() * 12, .18, '120,118,116', 40); g.filter = 'none'; vein(1.6 + rnd() * 2.2, .55, '96,94,92', 30); }
    for (let k = 0; k < 14; k++) vein(.6 + rnd() * 1.2, .28 + rnd() * .2, '110,108,106', 50);
    for (let k = 0; k < 4; k++) vein(1 + rnd() * 1.4, .35, '176,142,92', 30);
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
  function build(THREE, renderer, mood, imgs = {}) {
    const colour = mood === 'colour', night = mood === 'night' || colour;
    const scene = new THREE.Scene();
    const bgc = night ? 0x1E1915 : 0xE6E0D8;
    scene.background = new THREE.Color(bgc); scene.fog = new THREE.Fog(bgc, 5.5, 13);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new THREE.RoomEnvironment(), .04).texture;
    const std = o => new THREE.MeshStandardMaterial(Object.assign({ roughness: .7, metalness: 0, envMapIntensity: night ? .22 : .5 }, o));
    const add = (geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true; scene.add(m); return m; };

    const floor = add(new THREE.PlaneGeometry(40, 40), std({ color: night ? 0x3a322c : 0xC9BFB3, roughness: .92 }), 0, 0, 0, { cast: false });
    floor.rotation.x = -Math.PI / 2;
    scene.add(new THREE.HemisphereLight(0xfff7ef, night ? 0x1a1410 : 0x9d8f80, night ? .07 : .22));
    const key = new THREE.DirectionalLight(0xfff3e6, night ? .1 : .75);
    key.position.set(-2.4, 4.4, 3.4); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: .5, far: 12 }); key.shadow.bias = -.0004; scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe6cc, night ? .05 : .22); rim.position.set(3, 2.5, -3); scene.add(rim);

    // Maxsen colourway: porcelain stone, Midnight Bronze body, champagne-lit interiors
    const stoneMat = new THREE.MeshPhysicalMaterial({ map: tex(THREE, stone(THREE), 1 / L, 1 / D), roughness: .38, clearcoat: .25, clearcoatRoughness: .35, envMapIntensity: night ? .3 : .45 });
    stoneMat.map.offset.set(.5, .5);
    const bodyWood = wood(THREE, '#D2B994', '150,116,78', '238,220,192');
    const bodyMat = std({ map: tex(THREE, bodyWood, 1.2, 1), roughness: .55 });
    const bodyMatV = std({ map: tex(THREE, bodyWood, 1, 1), roughness: .55 }); bodyMatV.map.rotation = Math.PI / 2;
    const inner = std({ map: tex(THREE, wood(THREE, '#E2D0B4', '160,128,92', '246,234,214'), 1.5, 1), roughness: .55 });
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
    add(slab(THREE, rr(THREE, L - .012, D - .012, R - .006), TOP, .006), stoneMat, 0, Y1, 0);
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

    // Lenovo smart locks on the top, each on a small door panel so it reads as a real door
    const doorMat = std({ map: tex(THREE, wood(THREE, '#CDB59A', '150,120,90', '240,226,206'), 1, 1), roughness: .5 });
    doorMat.map.rotation = Math.PI / 2;
    const LOCKS = [[-.42, 0x5a2a1b, 0x9aa0a6], [0, 0x2a2622, 0xb48a4a], [.42, 0x3a3d42, 0x9aa0a6]];
    LOCKS.forEach(([x, body, trim]) => {
      const z0 = -.06;
      add(new THREE.BoxGeometry(.24, .012, .16), bronze, x, H + .006, z0);
      add(new THREE.BoxGeometry(.22, .46, .036), doorMat, x, H + .012 + .23, z0);
      const lz = z0 + .018 + .016;
      add(new THREE.BoxGeometry(.074, .37, .032), std({ color: body, roughness: .3, metalness: .4 }), x + .04, H + .012 + .23, lz);
      add(new THREE.BoxGeometry(.052, .07, .004), std({ color: 0x0c0c0e, roughness: .15, metalness: .2 }), x + .04, H + .012 + .36, lz + .017);
      add(new THREE.BoxGeometry(.052, .006, .004), std({ color: trim, roughness: .25, metalness: .8 }), x + .04, H + .012 + .17, lz + .017);
      add(new THREE.BoxGeometry(.018, .14, .022), std({ color: trim, roughness: .25, metalness: .8 }), x + .04, H + .012 + .26, lz + .027);
    });

    // body: bottom board, back, dividers and ends, in Midnight Bronze wood
    add(slab(THREE, rr(THREE, BL, BD, BR), .04, .004), bodyMat, 0, Y0, 0);
    const xs = BL / 2 - BR, zs = BD / 2 - BR;
    add(new THREE.BoxGeometry(2 * xs, Y1 - Y0 - .04, T), bodyMat, 0, Y0 + .04 + (Y1 - Y0 - .04) / 2, -BD / 2 + T / 2);
    const wallH = Y1 - Y0 - .04;
    const wall = (shape) => add(slab(THREE, shape, wallH), bodyMatV, 0, Y0 + .04, 0);
    wall(arcBand(THREE, -xs, -zs, BR, T, Math.PI, Math.PI * 1.5));        // back left corner
    wall(arcBand(THREE, xs, -zs, BR, T, -Math.PI / 2, 0));               // back right corner
    add(new THREE.BoxGeometry(T, wallH, zs + .02), bodyMat, -BL / 2 + T / 2, Y0 + .04 + wallH / 2, -zs / 2 + .01); // left end, back half
    add(new THREE.BoxGeometry(T, wallH, zs + .02), bodyMat, BL / 2 - T / 2, Y0 + .04 + wallH / 2, -zs / 2 + .01); // right end, back half
    [-DIV, DIV].forEach(x => add(new THREE.BoxGeometry(.03, wallH, BD - T), bodyMat, x, Y0 + .04 + wallH / 2, T / 2));
    // champagne-lit interiors: back faces of the bays and the niche
    add(new THREE.BoxGeometry(2 * xs - .04, wallH - .002, .004), inner, 0, Y0 + .04 + wallH / 2, -BD / 2 + T + .002, { cast: false });
    // shelves: the same at both ends, rounded where they wrap the front corners
    const lx0 = -BL / 2, lx1 = -DIV - .015, rx0 = DIV + .015, rx1 = BL / 2;
    SHELVES.forEach(y => {
      add(slab(THREE, endShelf(THREE, -1, lx1, lx0 + .002, -BD / 2 + T, BD / 2 - .002, BR - T, BR), .025), inner, 0, y - .0125, 0);
      add(slab(THREE, endShelf(THREE, 1, rx0, rx1 - .002, -BD / 2 + T, BD / 2 - .002, BR - T, BR), .025), inner, 0, y - .0125, 0);
      // LED under the front edge of each shelf, lighting the bay below
      pixels(row(lx0 + BR, lx1 - .01, BD / 2 - .03), y - .015, byX);
      pixels(row(rx0 + .01, rx1 - BR, BD / 2 - .03), y - .015, byX);
    });
    // the closed centre: a light wood panel with LUSANO in bronze letters, lit from behind
    add(new THREE.BoxGeometry(2 * DIV - .03, wallH, T), bodyMat, 0, Y0 + .04 + wallH / 2, BD / 2 - T / 2);
    {
      const word = 'LUSANO', fs = 300, ls = 34;
      const [mc, mg] = canvas(1700, 300); mg.font = `500 ${fs}px "EB Garamond", Garamond, Georgia, serif`;
      if (mg.letterSpacing !== undefined) mg.letterSpacing = ls + 'px';
      mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillStyle = '#fff'; mg.fillText(word, 850 + ls / 2, 160);
      const [gc, gg] = canvas(1700, 300); gg.shadowColor = 'rgba(255,205,140,1)'; gg.shadowBlur = 40;
      for (let k = 0; k < 3; k++) gg.drawImage(mc, 0, 0);
      const tw = mg.measureText(word).width + ls * word.length, w = .56 * 1700 / tw, h = w * 300 / 1700, y = .58, zf = BD / 2 + .002; // letters span 560 of the 630 mm panel
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false, opacity: night ? .95 : .6, color: night ? 0xffcf96 : 0xf2b46a, blending: night ? THREE.AdditiveBlending : THREE.NormalBlending }));
      glow.position.set(0, y, zf); scene.add(glow);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(mc), transparent: true, color: 0x3A2C24, roughness: .35, metalness: .55, envMapIntensity: night ? .2 : .5 }));
      face.position.set(0, y, zf + .004); scene.add(face);
    }

    // floating base with an LED line that lights the floor
    add(slab(THREE, rr(THREE, BL - .1, BD - .1, BR - .04), BASE - .004), bronze, 0, .002, 0);
    pixels(perimeter(BL - .09, BD - .09, BR - .035, .016), BASE - .012);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(BL + .7, BD + .55), new THREE.MeshBasicMaterial({ map: floorGlow(THREE, colour), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: night ? .9 : .4 }));
    gl.rotation.x = -Math.PI / 2; gl.position.y = .002; scene.add(gl);

    // light: the top's LED line washing down the body, the base, and each bay
    THREE.RectAreaLightUniformsLib.init();
    const wash = night ? 6 : 1.8;
    const lc0 = c => colour ? c : new THREE.Color(0xffc98f);
    [[BD / 2 + .015, 1, .15], [-BD / 2 - .015, -1, .65]].forEach(([z, s, t]) => { const a = new THREE.RectAreaLight(lc0(pix(t)), wash, BL - .3, .02); a.position.set(0, Y1 - .01, z); a.lookAt(0, 0, z + s * .06); scene.add(a); });
    const low = new THREE.RectAreaLight(lc0(pix(.4)), night ? 5 : 1.6, BL - .1, BD - .1); low.position.set(0, BASE - .015, 0); low.lookAt(0, -1, 0); scene.add(low);
    [[(lx0 + lx1) / 2], [(rx0 + rx1) / 2 - .03], [0]].forEach(([x]) => [Y0 + .04, ...SHELVES].forEach((y, i, arr) => {
      const top = i < arr.length - 1 ? arr[i + 1] : Y1;
      if (x === 0) return;
      const p = new THREE.PointLight(lc0(pix(byX({ x }))), night ? .55 : .16, .55, 2); p.position.set(x, top - .04, .12); scene.add(p);
    }));

    // a few things on the shelves
    const ceramic = std({ color: 0xEDE7DF, roughness: .45 });
    const paper = std({ color: 0xF6F1EA, roughness: .9 });
    const lc = (lx0 + lx1) / 2, rc = (rx0 + rx1) / 2 - .04;
    add(new THREE.CylinderGeometry(.04, .05, .17, 28), ceramic, lc + .03, SHELVES[1] + .1, -.05);
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(.21, .006, .2), i % 2 ? paper : bronze, lc, SHELVES[0] + .016 + i * .007, .02);
    add(new THREE.CylinderGeometry(.05, .045, .1, 28), std({ color: 0x8A7563, roughness: .8 }), lc, Y0 + .04 + .05, 0);
    [0x1d1b1a, 0xcbb79c, 0x2b2f3a].forEach((c, i) => { const p = add(new THREE.BoxGeometry(.086, .086, .01), std({ color: c, roughness: .3, metalness: .2 }), rc - .1 + i * .095, SHELVES[1] + .058, .02); p.rotation.x = -.18; });
    for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(.16, .022, .2), std({ color: [0xCFA594, 0xEDE7DF, 0x29221F][i], roughness: .8 }), rc, SHELVES[0] + .025 + i * .023, -.02);
    add(new THREE.SphereGeometry(.05, 24, 16), ceramic, rc + .02, Y0 + .04 + .05, 0);
    return scene;
  }

  const VIEWS = {
    hero:   { pos: [-1.6, 1.95, 2.35], at: [.02, .68, 0], fov: 34 },
    low:    { pos: [-1.45, 1.2, 2.75], at: [.05, .74, 0], fov: 36 },
    front:  { pos: [0, 1.15, 3.1], at: [0, .7, 0], fov: 33 },
    end:    { pos: [2.2, 1.45, 1.85], at: [.3, .68, .05], fov: 34 },
    detail: { pos: [.25, 1.08, 1.0], at: [0, .95, .3], fov: 36 },
    top:    { pos: [0, 3.1, .35], at: [0, .9, 0], fov: 30 }
  };

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
    const scene = build(THREE, renderer, opts.mood, imgs);
    const cam = new THREE.PerspectiveCamera(32, 1, .02, 60);
    let controls = null;
    if (THREE.OrbitControls && !opts.capture) { controls = new THREE.OrbitControls(cam, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .49; controls.minDistance = .5; controls.maxDistance = 7; }
    function size() { const w = el.clientWidth || opts.w, h = el.clientHeight || opts.h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    function view(k) { const v = VIEWS[k]; cam.fov = v.fov; cam.position.set(...v.pos); cam.lookAt(...v.at); if (controls) { controls.target.set(...v.at); controls.update(); } cam.updateProjectionMatrix(); }
    size(); view(opts.view || 'hero');
    let raf = 0; const loop = () => { raf = requestAnimationFrame(loop); if (controls) controls.update(); renderer.render(scene, cam); };
    if (!opts.capture) loop();
    window.addEventListener('resize', size);
    return { view, size, capture(k) { view(k); renderer.render(scene, cam); return renderer.domElement.toDataURL('image/png'); }, stop() { cancelAnimationFrame(raf); } };
  }
  return { mount, VIEWS };
})();
