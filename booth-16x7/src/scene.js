/* The Maxsen corner booth as a 3D model. Units are metres: x runs along the 16 ft side,
   z from the back (0) to the front aisle (2.134), y is up. Nothing is taller than 1.8 m. */
window.MaxsenBooth = (function () {
  const W = 4.877, D = 2.134, H = 1.8, LB = 0.12, CW = 0.15, PW = (W - LB) / 4;
  const SERIF = '"EB Garamond", Garamond, Georgia, serif';
  const SANS = 'Lato, "Helvetica Neue", Arial, sans-serif';
  const INK = '#29221F', ROSE = '#CFA594', ROSE_T = '#7E5643';

  /* ---------- 2D artwork for every face, drawn 1 px = 1.25 mm ---------- */
  const K = 0.8; // px per mm
  function cv(wmm, hmm) {
    const c = document.createElement('canvas');
    c.width = Math.round(wmm * K); c.height = Math.round(hmm * K);
    const g = c.getContext('2d'); g.scale(K, K); return [c, g];
  }
  const FH = 1750; // face artwork runs from 50 mm (the floating base) to 1,800 mm: no canopies or overhangs
  const Y = h => 1800 - h; // height above floor (mm) to canvas y
  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  function plate(g, cx, cyH, s, fill, kind) {
    const x = cx - s / 2, y = Y(cyH) - s / 2;
    g.save();
    g.shadowColor = 'rgba(40,25,15,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 5;
    g.fillStyle = fill; rr(g, x, y, s, s, 4); g.fill();
    g.restore();
    const sh = g.createLinearGradient(x, y, x + s, y + s);
    sh.addColorStop(0, 'rgba(255,255,255,.35)'); sh.addColorStop(.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.12)');
    g.fillStyle = sh; rr(g, x, y, s, s, 4); g.fill();
    if (kind === 'crystal') {
      g.fillStyle = '#1c1a19'; g.fillRect(x, y + s * .4, s, s * .2);
      g.fillStyle = '#fff6e6'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(x + 6 + i * (s - 12) / 13, y + s * .5, 1.6, 0, 7); g.fill(); }
    } else if (kind === 'nova') {
      g.fillStyle = '#16161a'; rr(g, x + s * .08, y + s * .08, s * .84, s * .84, 3); g.fill();
      g.fillStyle = '#ffcf8a'; g.fillRect(x + s * .2, y + s * .42, s * .6, 3);
      g.fillStyle = 'rgba(255,207,138,.7)'; for (let i = 0; i < 3; i++) g.fillRect(x + s * (.25 + i * .25) - 2, y + s * .78, 4, 4);
    } else if (kind === 'noble') {
      g.strokeStyle = '#fff3dc'; g.lineWidth = 1.5; g.strokeRect(x + 5, y + 5, s - 10, s - 10);
    } else if (kind === 'dot') {
      g.fillStyle = 'rgba(80,140,255,.8)'; g.beginPath(); g.arc(cx, y + s * .8, 2.5, 0, 7); g.fill();
    }
  }
  function screen(g, cx, cyH, w, h, rows) {
    const x = cx - w / 2, y = Y(cyH) - h / 2;
    g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 12; g.shadowOffsetY = 6;
    g.fillStyle = '#18181b'; rr(g, x, y, w, h, 6); g.fill(); g.restore();
    const cols = ['#cfa594', '#e9dccb', '#8fb3c9', '#d9c08a', '#a7c49a', '#e9dccb'];
    const m = w * .07, tw = (w - m * 2 - (rows - 1) * 6) / rows, th = (h - m * 2 - 6) / 2;
    for (let r = 0; r < 2; r++) for (let c = 0; c < rows; c++) {
      g.fillStyle = cols[(r * rows + c) % cols.length]; g.globalAlpha = .85;
      rr(g, x + m + c * (tw + 6), y + m + r * (th + 6), tw, th, 3); g.fill();
    }
    g.globalAlpha = 1;
  }
  function qr(g, x, y, s, seed) {
    g.fillStyle = '#fff'; g.fillRect(x - 6, y - 6, s + 12, s + 12);
    let v = seed * 9301 + 49297; const n = 13, c = s / n;
    g.fillStyle = INK;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      v = (v * 9301 + 49297) % 233280;
      const corner = (i < 4 && j < 4) || (i > 8 && j < 4) || (i < 4 && j > 8);
      if (corner ? ((i % 4 === 0 || i % 4 === 3 || j % 4 === 0 || j % 4 === 3) && !(i === 3 || j === 3) || (i % 4 === 1 && j % 4 === 1)) : v / 233280 > .5) g.fillRect(x + i * c, y + j * c, c, c);
    }
  }
  function lattice(g, x0, w) {
    g.save(); g.beginPath(); g.rect(x0, Y(550), w, 500); g.clip();
    g.strokeStyle = 'rgba(126,86,67,.18)'; g.lineWidth = 2;
    for (let x = x0 - 600; x < x0 + w + 600; x += 120) {
      g.beginPath(); g.moveTo(x, Y(550)); g.lineTo(x + 300, Y(50)); g.stroke();
      g.beginPath(); g.moveTo(x + 300, Y(550)); g.lineTo(x, Y(50)); g.stroke();
    }
    g.restore();
  }

  const ROW = 1100; // every product sits on one line inside its niche
  const FACES = {
    prestige: { name: 'Lusano Prestige', draw(g, cx) {
      ['#1d1b1a', '#cbb79c', '#2b2f3a'].forEach((f, k) => plate(g, cx - 200 + k * 200, ROW, 86, f, 'crystal'));
    } },
    noble: { name: 'Lusano Noble', draw(g, cx) {
      plate(g, cx - 210, ROW, 90, '#cbb79c', 'noble'); plate(g, cx + 210, ROW, 90, '#1d1b1a', 'noble');
      const hy = Y(ROW), r = 62;
      const rim = g.createLinearGradient(cx - r, hy - r, cx + r, hy + r);
      rim.addColorStop(0, '#f7f6f4'); rim.addColorStop(.45, '#8f8b87'); rim.addColorStop(1, '#efedea');
      g.save(); g.shadowColor = 'rgba(40,25,15,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 6;
      g.fillStyle = rim; g.beginPath(); g.arc(cx, hy, r, 0, 7); g.fill(); g.restore();
      const pearl = g.createRadialGradient(cx - 15, hy - 15, 5, cx, hy, r * .8);
      pearl.addColorStop(0, '#fffaf4'); pearl.addColorStop(.6, '#efe4f0'); pearl.addColorStop(1, '#dfe9ef');
      g.fillStyle = pearl; g.beginPath(); g.arc(cx, hy, r * .8, 0, 7); g.fill();
    } },
    nova: { name: 'Nova+ Pro', draw(g, cx) {
      ['#cbb79c', '#232221', '#c9c9c9'].forEach((f, k) => plate(g, cx - 300 + k * 140, ROW, 86, f, 'nova'));
      screen(g, cx + 200, ROW, 234, 128, 3);
    } },
    folio: { name: 'Folio + Ark', draw(g, cx) {
      plate(g, cx - 240, ROW, 86, '#f3f1ee', 'noble'); plate(g, cx - 80, ROW, 86, '#1f1f20', 'noble');
      plate(g, cx + 80, ROW, 86, '#565a62', 'nova'); plate(g, cx + 240, ROW, 86, '#d9c08a', 'dot');
    } },
    panels: { name: 'Control panels', draw(g, cx) {
      screen(g, cx - 140, ROW, 300, 190, 3); screen(g, cx + 190, ROW, 230, 140, 2);
    } },
    secure: { name: 'Smart locks', draw(g, cx) {
      ['#5a2a1b', '#2a2622', '#3a3d42'].forEach((f, i) => {
        const x = cx - 270 + i * 120, y = Y(1250);
        g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 5;
        g.fillStyle = f; rr(g, x - 30, y, 60, 300, 13); g.fill(); g.restore();
        g.fillStyle = '#111'; rr(g, x - 20, y + 28, 40, 56, 5); g.fill();
        g.fillStyle = i === 1 ? '#b48a4a' : '#9aa0a6'; g.fillRect(x - 20, y + 176, 40, 7);
      });
      screen(g, cx + 220, ROW, 130, 130, 2);
    } }
  };

  function faceTexture(THREE, wmm, key, surface, opts = {}) {
    const f = FACES[key];
    const [c, g] = cv(wmm, FH);
    g.translate(0, -50); // canvas y 0 is 1,800 mm; the face stops at 50 mm
    const cx = wmm / 2;
    const bg = g.createLinearGradient(0, 0, 0, 1800);
    if (surface === 'wall') { bg.addColorStop(0, '#E8DBC9'); bg.addColorStop(1, '#DDCBB4'); }
    else { bg.addColorStop(0, '#F7F1EA'); bg.addColorStop(1, '#EEE5D9'); }
    g.fillStyle = bg; g.fillRect(0, 0, wmm, 1800);
    // the product name, and nothing else
    g.fillStyle = INK; g.textAlign = 'center';
    g.font = `400 104px ${SERIF}`; g.fillText(f.name, cx, Y(1560));
    // a niche 40 mm deep, lit from a strip hidden in its top edge
    const nx = cx - 400, ny = Y(1350), nw = 800, nh = 500;
    g.fillStyle = surface === 'wall' ? '#D4C0A6' : '#E2D3C0'; g.fillRect(nx, ny, nw, nh);
    const wash = g.createLinearGradient(0, ny, 0, ny + nh);
    wash.addColorStop(0, 'rgba(255,220,170,.95)'); wash.addColorStop(.35, 'rgba(255,214,160,.45)'); wash.addColorStop(1, 'rgba(255,214,160,0)');
    g.fillStyle = wash; g.fillRect(nx, ny, nw, nh);
    const side = (x0, dir) => { const s = g.createLinearGradient(x0, 0, x0 + dir * 40, 0); s.addColorStop(0, 'rgba(60,38,20,.28)'); s.addColorStop(1, 'rgba(60,38,20,0)'); g.fillStyle = s; g.fillRect(Math.min(x0, x0 + dir * 40), ny, 40, nh); };
    side(nx, 1); side(nx + nw, -1);
    const bot = g.createLinearGradient(0, ny + nh, 0, ny + nh - 40); bot.addColorStop(0, 'rgba(60,38,20,.22)'); bot.addColorStop(1, 'rgba(60,38,20,0)');
    g.fillStyle = bot; g.fillRect(nx, ny + nh - 40, nw, 40);
    g.fillStyle = 'rgba(40,25,15,.55)'; g.fillRect(nx, ny, nw, 6);
    g.fillStyle = 'rgba(255,248,236,.7)'; g.fillRect(nx, ny + nh, nw, 3);
    f.draw(g, cx);
    if (opts.cupboard) { // the staff cupboard, a flush door in the lower face
      g.strokeStyle = 'rgba(60,38,20,.22)'; g.lineWidth = 3;
      g.strokeRect(cx - 520, Y(640), 1040, 560); g.beginPath(); g.moveTo(cx, Y(640)); g.lineTo(cx, Y(80)); g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }

  function lightboxTexture(THREE, photo) {
    const wmm = D * 1000, vis = (D - CW) * 1000; // visible part starts at the front edge (u = 0)
    const [c, g] = cv(wmm, 1800);
    g.fillStyle = '#2a1e16'; g.fillRect(0, 0, wmm, 1800);
    if (photo) {
      const r = Math.max(vis / photo.width, 1800 / photo.height), w = photo.width * r, h = photo.height * r;
      g.drawImage(photo, (vis - w) / 2, (1800 - h) / 2, w, h);
    }
    const fade = g.createLinearGradient(0, 1250, 0, 1800);
    fade.addColorStop(0, 'rgba(20,14,10,0)'); fade.addColorStop(1, 'rgba(20,14,10,.75)');
    g.fillStyle = fade; g.fillRect(0, 0, vis, 1800);
    g.textAlign = 'center'; g.fillStyle = '#FBF3E8';
    g.font = `700 54px ${SANS}`; if (g.letterSpacing !== undefined) g.letterSpacing = '26px';
    g.fillText('MAXSEN', vis / 2 + 13, 1650); if (g.letterSpacing !== undefined) g.letterSpacing = '0px';
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }

  function marbleTexture(THREE) {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#F4F1EC'; g.fillRect(0, 0, 512, 512);
    let v = 7; const rnd = () => (v = (v * 9301 + 49297) % 233280) / 233280;
    for (let k = 0; k < 9; k++) {
      g.strokeStyle = `rgba(120,110,100,${.08 + rnd() * .14})`; g.lineWidth = .8 + rnd() * 2.2;
      g.beginPath(); let x = rnd() * 512, y = 0; g.moveTo(x, y);
      while (y < 512) { x += (rnd() - .5) * 60; y += 20 + rnd() * 30; g.lineTo(x, y); }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }

  /* ---------- the model ---------- */
  function build(THREE, photo) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE5DED6);
    scene.fog = new THREE.Fog(0xE5DED6, 14, 32);
    const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .8, metalness: 0 }, o));
    const bronze = std({ color: 0x2B231F, roughness: .55, metalness: .35 });
    const add = (geo, mat, x, y, z, o = {}) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
      m.castShadow = o.cast !== false; m.receiveShadow = true; scene.add(m); return m;
    };
    const B = .05, FHm = H - B; // the floating base and the height of every face above it

    scene.add(new THREE.HemisphereLight(0xfff6ee, 0xb3a493, .45));
    const sun = new THREE.DirectionalLight(0xfff2e4, .45);
    sun.position.set(7, 9, 8); sun.target.position.set(2.4, 0, 1); scene.add(sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
    sun.shadow.bias = -0.0005; scene.add(sun);

    // floors: warm stone carpet, and a wool rug under each table
    const expo = add(new THREE.PlaneGeometry(60, 60), std({ color: 0xD3CCC3 }), W / 2, 0, D / 2, { cast: false });
    expo.rotation.x = -Math.PI / 2;
    add(new THREE.BoxGeometry(W, .012, D), std({ color: 0xCFC2B3, roughness: 1 }), W / 2, .006, D / 2, { cast: false });
    const rug = std({ color: 0x8A7563, roughness: 1 });
    [.85, 2.95].forEach(x => add(new THREE.CylinderGeometry(.7, .7, .01, 72), rug, x, .017, 1.35, { cast: false }));

    // the warm line of light under the wall and the stand
    const glowTex = (() => {
      const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,200,140,.9)'); gr.addColorStop(1, 'rgba(255,200,140,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 4, 128); return new THREE.CanvasTexture(c);
    })();
    const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55 });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffe2bc });

    // light hidden in the top edge of each niche
    function nicheLight(parent, x, z, nx, nz) {
      const s = new THREE.SpotLight(0xffcf98, .75, 1.5, 1.05, .95, 1.8);
      s.position.set(x + nx * .2, 1.42, z + nz * .2); s.target.position.set(x, .95, z);
      parent.add(s); parent.add(s.target);
    }

    // fabric lightbox along the left 7 ft side: one photograph of a Maxsen home, dimmed to about 65%
    const lbTex = lightboxTexture(THREE, photo);
    const frame = std({ color: 0xD9D4CE, roughness: .4, metalness: .6 });
    const lbMats = [new THREE.MeshBasicMaterial({ map: lbTex, color: 0xb8b8b8 }), frame, frame, frame, frame, frame];
    add(new THREE.BoxGeometry(LB, H, D), lbMats, LB / 2, H / 2, D / 2);
    const glow = new THREE.PointLight(0xffd6a6, .3, 3, 2); glow.position.set(.8, 1.1, 1.15); scene.add(glow);

    // one-sided carpentry wall: four panels with 10 mm shadow gaps, floating 50 mm off the floor
    const keys = ['prestige', 'noble', 'nova', 'folio'];
    const lam = std({ color: 0xDDCBB4, roughness: .7 });
    add(new THREE.BoxGeometry(W - LB, FHm, .1), bronze, LB + (W - LB) / 2, B + FHm / 2, .05);
    add(new THREE.BoxGeometry(W - LB, B, CW - .05), bronze, LB + (W - LB) / 2, B / 2, (CW - .05) / 2, { cast: false });
    keys.forEach((k, i) => {
      const x = LB + PW * i + PW / 2;
      const tex = faceTexture(THREE, PW * 1000 - 10, k, 'wall', { cupboard: k === 'folio' });
      const mats = [lam, lam, lam, lam, std({ map: tex, roughness: .75 }), lam];
      add(new THREE.BoxGeometry(PW - .01, FHm, CW), mats, x, B + FHm / 2, CW / 2);
      nicheLight(scene, x, CW, 0, 1);
    });
    const wl = W - LB;
    const led = add(new THREE.BoxGeometry(wl, .006, .006), ledMat, LB + wl / 2, .03, CW - .03, { cast: false });
    const wg = new THREE.Mesh(new THREE.PlaneGeometry(wl, .32), glowMat);
    wg.rotation.x = -Math.PI / 2; wg.position.set(LB + wl / 2, .014, CW + .16); scene.add(wg);

    // one two-sided stand at 45° across the front right corner, also floating
    const dark = bronze;
    const outer = std({ map: faceTexture(THREE, 1000, 'panels', 'stand'), roughness: .85 });
    const inner = std({ map: faceTexture(THREE, 1000, 'secure', 'stand'), roughness: .85 });
    const stand = new THREE.Group(); stand.position.set(4.277, 0, 1.534); stand.rotation.y = Math.PI / 4; scene.add(stand);
    const sm = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; stand.add(o); return o; };
    sm(new THREE.BoxGeometry(1, FHm, .2), [dark, dark, dark, dark, outer, inner], 0, B + FHm / 2, 0);
    sm(new THREE.BoxGeometry(.96, B, .12), bronze, 0, B / 2, 0);
    sm(new THREE.BoxGeometry(1, .008, .6), bronze, 0, .004, 0);
    [1, -1].forEach(n => {
      sm(new THREE.BoxGeometry(.96, .006, .006), ledMat, 0, .03, n * .065);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(1, .28), glowMat);
      sg.rotation.x = -Math.PI / 2; sg.position.set(0, .013, n * .24); if (n < 0) sg.rotation.z = Math.PI; stand.add(sg);
      nicheLight(stand, 0, n * .1, 0, n);
    });

    // two consult tables: marble-look tops, upholstered chairs, flowers
    const top = std({ map: marbleTexture(THREE), roughness: .3 });
    const seat = std({ color: 0xC69A87, roughness: .95 });
    const leg = std({ color: 0x2B231F, roughness: .4, metalness: .5 });
    function table(x, z) {
      add(new THREE.CylinderGeometry(.3, .3, .03, 48), top, x, .745, z);
      add(new THREE.CylinderGeometry(.03, .03, .72, 16), leg, x, .37, z);
      add(new THREE.CylinderGeometry(.22, .24, .02, 32), leg, x, .03, z);
    }
    function chair(x, z, face) {
      const g = new THREE.Group();
      const m = (geo, mat, px, py, pz) => { const o = new THREE.Mesh(geo, mat); o.position.set(px, py, pz); o.castShadow = true; o.receiveShadow = true; g.add(o); };
      m(new THREE.BoxGeometry(.44, .09, .44), seat, 0, .45, 0);
      m(new THREE.BoxGeometry(.44, .34, .07), seat, 0, .66, -.19);
      [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]].forEach(([a, b]) => m(new THREE.CylinderGeometry(.012, .012, .42, 8), leg, a, .21, b));
      g.position.set(x, 0, z); g.rotation.y = face; scene.add(g);
    }
    table(.85, 1.35); chair(.4, 1.35, Math.PI / 2); chair(1.3, 1.35, -Math.PI / 2);
    table(2.95, 1.35); chair(2.5, 1.35, Math.PI / 2); chair(3.4, 1.35, -Math.PI / 2);
    add(new THREE.BoxGeometry(.25, .008, .18), std({ color: 0x1b1b1d, roughness: .3 }), .82, .764, 1.3);
    add(new THREE.BoxGeometry(.3, .02, .2), std({ color: 0xB9A17F, roughness: .5 }), 2.92, .77, 1.3);
    const menu = std({ color: 0x29221F, roughness: .6 });
    [.85, 2.95].forEach(x => { const m = add(new THREE.BoxGeometry(.15, .21, .012), menu, x + .14, .865, 1.56); m.rotation.x = -.15; });
    const ceramic = std({ color: 0xF2EEE8, roughness: .5 });
    const stem = std({ color: 0x6E7A5A, roughness: .9 });
    const bloomCols = [0xFBF6EF, 0xEAD3C8, 0xFBF6EF, 0xD9B5A6, 0xFBF6EF];
    [.85, 2.95].forEach(x => {
      add(new THREE.CylinderGeometry(.035, .045, .15, 24), ceramic, x - .13, .835, 1.5);
      bloomCols.forEach((col, k) => {
        const a = k * 1.3;
        add(new THREE.CylinderGeometry(.003, .003, .1, 6), stem, x - .13 + Math.cos(a) * .012, .95, 1.5 + Math.sin(a) * .012);
        add(new THREE.SphereGeometry(.026, 14, 10), std({ color: col, roughness: .9 }), x - .13 + Math.cos(a) * .035, 1.0 + (k % 2) * .02, 1.5 + Math.sin(a) * .035);
      });
    });

    // an olive tree beside the lightbox, under 1.8 m
    add(new THREE.CylinderGeometry(.2, .16, .42, 32), std({ color: 0x3A302A, roughness: .6 }), .42, .21, 1.86);
    add(new THREE.CylinderGeometry(.19, .19, .01, 32), std({ color: 0x4a3b2e, roughness: 1 }), .42, .41, 1.86, { cast: false });
    add(new THREE.CylinderGeometry(.018, .03, .72, 10), std({ color: 0x5b4a3c, roughness: .9 }), .42, .78, 1.86);
    const leafA = std({ color: 0x66704F, roughness: .85 }), leafB = std({ color: 0x7E8866, roughness: .85 });
    let lv = 11; const lr = () => (lv = (lv * 9301 + 49297) % 233280) / 233280;
    [[-.1, 1.02, .05, .55], [.12, 1.08, -.04, .5]].forEach(([dx, y, dz, len]) => {
      const br = add(new THREE.CylinderGeometry(.008, .012, len * .45, 6), std({ color: 0x5b4a3c, roughness: .9 }), .42 + dx * .5, y + .1, 1.86 + dz * .5);
      br.rotation.z = -dx * 2.4; br.rotation.x = dz * 2.4;
    });
    for (let k = 0; k < 46; k++) {
      const th = lr() * Math.PI * 2, ph = Math.acos(2 * lr() - 1), r = Math.cbrt(lr());
      const x = .42 + Math.sin(ph) * Math.cos(th) * .3 * r, y = 1.36 + Math.cos(ph) * .24 * r, z = 1.86 + Math.sin(ph) * Math.sin(th) * .26 * r;
      const m = add(new THREE.IcosahedronGeometry(.055 + lr() * .05, 0), lr() > .5 ? leafA : leafB, x, y, z);
      m.scale.set(1.25, .7, 1); m.rotation.set(lr() * 3, lr() * 3, lr() * 3);
    }

    // two visitors for scale, 1.7 m
    const skin = std({ color: 0x9E968D, roughness: .9 });
    const people = new THREE.Group(); scene.add(people);
    function person(x, z) {
      const part = (geo, y) => { const o = new THREE.Mesh(geo, skin); o.position.set(x, y, z); o.castShadow = true; people.add(o); };
      part(new THREE.CylinderGeometry(.06, .05, .86, 12), .43);
      part(new THREE.CylinderGeometry(.15, .1, .62, 16), 1.17);
      part(new THREE.SphereGeometry(.095, 20, 16), 1.6);
    }
    person(2.05, .72); person(-0.55, 2.9);
    scene.userData.people = people;
    return scene;
  }

  const VIEWS = {
    corner: { pos: [7.3, 1.8, 4.7], at: [2.65, .8, 1.0], fov: 40, label: 'Aisle corner', people: true },
    front:  { pos: [2.44, 1.6, 6.2], at: [2.44, .85, .95], fov: 40, label: 'Front aisle', people: true },
    inside: { pos: [3.95, 1.6, 1.3], at: [.8, .85, .45], fov: 54, label: 'From the tables', people: false },
    side:   { pos: [7.4, 1.6, 0.9], at: [3.3, .85, 1.1], fov: 40, label: 'Side aisle', people: false },
    stand:  { pos: [3.0, 1.55, 0.27], at: [4.2, 1.0, 1.46], fov: 50, label: 'Corner stand, inside', people: false },
    top:    { pos: [5.6, 6.4, 5.6], at: [2.3, 0, 1.0], fov: 36, label: 'From above', people: false }
  };

  function loadImage(src) {
    return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  }

  async function mount(THREE, el, opts = {}) {
    const photo = await loadImage(opts.photo || 'assets/lightbox-photo.jpg');
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.capture });
    renderer.setPixelRatio(opts.ratio || Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = false;
    el.appendChild(renderer.domElement);
    const scene = build(THREE, photo);
    const cam = new THREE.PerspectiveCamera(40, 1, .05, 80);
    let controls = null;
    if (THREE.OrbitControls && !opts.capture) {
      controls = new THREE.OrbitControls(cam, renderer.domElement);
      controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .49; controls.minDistance = 1.2; controls.maxDistance = 14;
    }
    function size() {
      const w = el.clientWidth || opts.w, h = el.clientHeight || opts.h;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    function view(k) {
      const v = VIEWS[k]; cam.fov = v.fov;
      if (scene.userData.people) scene.userData.people.visible = !!v.people; cam.position.set(...v.pos); cam.lookAt(...v.at);
      if (controls) { controls.target.set(...v.at); controls.update(); }
      cam.updateProjectionMatrix();
    }
    size(); view(opts.view || 'corner');
    let raf = 0;
    function loop() { raf = requestAnimationFrame(loop); if (controls) controls.update(); renderer.render(scene, cam); }
    if (!opts.capture) loop();
    window.addEventListener('resize', size);
    return {
      view, size,
      capture(k) { view(k); renderer.render(scene, cam); return renderer.domElement.toDataURL('image/jpeg', .9); },
      stop() { cancelAnimationFrame(raf); }
    };
  }

  return { mount, VIEWS };
})();
