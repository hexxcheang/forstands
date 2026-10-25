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
  const FH = 1800; // face artwork covers the full height: no canopies or overhangs
  const Y = h => FH - h; // height above floor (mm) to canvas y
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

  const FACES = {
    prestige: { name: 'Lusano Prestige', sub: 'SWAROVSKI CRYSTALS · AUSTRIA', info: ['Onyx · Champagne · Midnight', '1, 2 and 3-gang'], draw(g, cx) {
      const f = ['#1d1b1a', '#cbb79c', '#2b2f3a'];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) plate(g, cx - 150 + c * 150, 1250 - r * 150, 86, f[r], 'crystal');
    } },
    noble: { name: 'Lusano Noble', sub: 'WITH THE HALO DIMMER', info: ['Champagne · Ivory · Onyx', 'Halo: turn the ring, turn the face'], draw(g, cx) {
      const f = ['#cbb79c', '#efe8dc', '#1d1b1a'];
      for (let c = 0; c < 3; c++) plate(g, cx - 200 + c * 200, 1240, 90, f[c], 'noble');
      const hy = Y(1010), r = 62;
      const rim = g.createLinearGradient(cx - r, hy - r, cx + r, hy + r);
      rim.addColorStop(0, '#f7f6f4'); rim.addColorStop(.45, '#8f8b87'); rim.addColorStop(1, '#efedea');
      g.save(); g.shadowColor = 'rgba(40,25,15,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 6;
      g.fillStyle = rim; g.beginPath(); g.arc(cx, hy, r, 0, 7); g.fill(); g.restore();
      const pearl = g.createRadialGradient(cx - 15, hy - 15, 5, cx, hy, r * .8);
      pearl.addColorStop(0, '#fffaf4'); pearl.addColorStop(.6, '#efe4f0'); pearl.addColorStop(1, '#dfe9ef');
      g.fillStyle = pearl; g.beginPath(); g.arc(cx, hy, r * .8, 0, 7); g.fill();
    } },
    nova: { name: 'Nova+ Pro', sub: 'A NAME ON EVERY KEY', info: ['Champagne · Black · White · Silver', 'Nova S8 panel'], draw(g, cx) {
      const f = ['#cbb79c', '#232221', '#f4f2ee', '#c9c9c9'];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) plate(g, cx - 225 + c * 150, 1270 - r * 140, 86, f[c], 'nova');
      screen(g, cx, 950, 234, 128, 3);
    } },
    folio: { name: 'Folio + Ark', sub: 'SLIM AND SIMPLE', info: ['Folio: White and Black marble', 'Ark: White · Gold · Silver · Black'], draw(g, cx) {
      const top = ['#f3f1ee', '#1f1f20', '#f4f2ee', '#565a62'];
      for (let c = 0; c < 4; c++) plate(g, cx - 225 + c * 150, 1250, 86, top[c], c >= 2 ? 'nova' : 'noble');
      const ark = ['#f4f2ee', '#d9c08a', '#cfcfcf', '#1f1d1c'];
      for (let c = 0; c < 4; c++) plate(g, cx - 225 + c * 150, 1030, 86, ark[c], 'dot');
    } },
    panels: { name: 'Control panels', sub: 'EVERY ROOM, ONE QUIET SCREEN', info: ['Nova S10 · 10-inch', 'Nova S7 · Alexa built in'], draw(g, cx) {
      screen(g, cx - 170, 1110, 300, 190, 3); screen(g, cx + 190, 1110, 230, 140, 2);
    } },
    locks: { name: 'Smart locks', sub: 'LENOVO · WITH MYDIGITALLOCK', info: ['F3 Ultra · The Sun solar', 'Door and gate locks'], draw(g, cx) {
      const f = ['#5a2a1b', '#2a2622', '#3a3d42', '#5a2a1b', '#2a2622', '#3a3d42'];
      for (let i = 0; i < 6; i++) {
        const x = cx - 300 + i * 120, y = Y(1330);
        g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 5;
        g.fillStyle = f[i]; rr(g, x - 32, y, 64, 300, 14); g.fill(); g.restore();
        g.fillStyle = '#111'; rr(g, x - 22, y + 30, 44, 60, 6); g.fill();
        g.fillStyle = i % 3 === 1 ? '#b48a4a' : '#9aa0a6'; g.fillRect(x - 22, y + 180, 44, 8);
      }
    } },
    secure: { name: 'Smart locks', sub: 'LENOVO · WITH MYDIGITALLOCK', info: ['F3 Ultra · The Sun solar · gate locks', 'Nova S1: Leave and Home at the door'], draw(g, cx) {
      const f = ['#5a2a1b', '#2a2622', '#3a3d42', '#5a2a1b', '#2a2622', '#3a3d42'];
      for (let i = 0; i < 6; i++) {
        const x = cx - 340 + i * 90, y = Y(1330);
        g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 5;
        g.fillStyle = f[i]; rr(g, x - 28, y, 56, 290, 12); g.fill(); g.restore();
        g.fillStyle = '#111'; rr(g, x - 19, y + 28, 38, 54, 5); g.fill();
        g.fillStyle = i % 3 === 1 ? '#b48a4a' : '#9aa0a6'; g.fillRect(x - 19, y + 170, 38, 7);
      }
      screen(g, cx + 270, 1100, 130, 130, 2);
    } },
    s1: { name: 'Nova S1', sub: 'LEAVE AND HOME, AT THE DOOR', info: ['Door and window sensor', 'Motion sensor'], draw(g, cx) {
      screen(g, cx - 150, 1100, 130, 130, 2);
      g.fillStyle = '#f4f2ee'; rr(g, cx + 40, Y(1160), 36, 90, 6); g.fill(); rr(g, cx + 84, Y(1150), 18, 70, 5); g.fill();
      g.beginPath(); g.arc(cx + 210, Y(1110), 40, 0, 7); g.fill();
      g.strokeStyle = '#cfc8c0'; g.lineWidth = 2; g.stroke();
    } },
    packages: { name: 'Packages', sub: "SCAN FOR THIS MONTH'S OFFERS", info: ['Planned, fitted and handed over', 'by our in-house team'], draw(g, cx) {
      const t = ['Ark Core', 'Nova+ Pro 10', 'Lusano+ Premium Core'];
      for (let i = 0; i < 3; i++) {
        const x = cx - 360 + i * 245, y = Y(1330);
        g.fillStyle = i === 2 ? INK : '#fbf8f4'; rr(g, x, y, 225, 460, 8); g.fill();
        g.fillStyle = i === 2 ? ROSE : ROSE_T; g.font = `700 20px ${SANS}`; g.textAlign = 'left'; g.fillText('PACKAGE', x + 20, y + 44);
        g.fillStyle = i === 2 ? '#fbf8f4' : INK; g.font = `400 40px ${SERIF}`;
        const words = t[i].split(' '); let line = '', ly = y + 100;
        words.forEach(w => { if (g.measureText(line + w).width > 190) { g.fillText(line, x + 20, ly); line = ''; ly += 44; } line += w + ' '; });
        g.fillText(line, x + 20, ly);
        qr(g, x + 60, y + 330, 104, i + 3);
      }
    } }
  };

  function faceTexture(THREE, wmm, key, surface) {
    const f = FACES[key];
    const [c, g] = cv(wmm, FH);
    const cx = wmm / 2;
    // ground: laminate for the carpentry wall, porcelain fabric for the stands
    const bg = g.createLinearGradient(0, 0, 0, FH);
    if (surface === 'wall') { bg.addColorStop(0, '#E6D8C5'); bg.addColorStop(1, '#D8C6AE'); }
    else { bg.addColorStop(0, '#F7F1EA'); bg.addColorStop(1, '#EDE3D7'); }
    g.fillStyle = bg; g.fillRect(0, 0, wmm, FH);
    lattice(g, 0, wmm);
    g.fillStyle = INK; g.fillRect(0, Y(50), wmm, 50);
    // header
    g.fillStyle = INK; g.textAlign = 'center';
    g.font = `400 112px ${SERIF}`; g.fillText(f.name, cx, Y(1590));
    g.fillStyle = ROSE_T; g.font = `700 24px ${SANS}`;
    if (g.letterSpacing !== undefined) g.letterSpacing = '6px';
    g.fillText(f.sub, cx, Y(1515));
    if (g.letterSpacing !== undefined) g.letterSpacing = '0px';
    // cassette
    g.save(); g.shadowColor = 'rgba(40,25,15,.25)'; g.shadowBlur = 18; g.shadowOffsetY = 8;
    g.fillStyle = surface === 'wall' ? '#F3ECE2' : '#E6D7C4'; g.fillRect(cx - 400, Y(1350), 800, 500); g.restore();
    g.strokeStyle = 'rgba(126,86,67,.35)'; g.lineWidth = 2; g.strokeRect(cx - 400, Y(1350), 800, 500);
    f.draw(g, cx);
    // LED light channel above the cassette
    const lg = g.createLinearGradient(0, Y(1360), 0, Y(1200));
    lg.addColorStop(0, 'rgba(255,214,160,.55)'); lg.addColorStop(1, 'rgba(255,214,160,0)');
    g.fillStyle = lg; g.fillRect(cx - 400, Y(1360), 800, 160);
    g.fillStyle = INK; g.fillRect(cx - 420, Y(1390), 840, 30);
    g.fillStyle = '#FFE9C8'; g.fillRect(cx - 400, Y(1364), 800, 4);
    // info strip
    g.textAlign = 'left'; g.fillStyle = INK; g.font = `400 34px ${SANS}`;
    g.fillText(f.info[0], cx - 400, Y(790)); g.fillStyle = '#5B4E47'; g.font = `300 30px ${SANS}`; g.fillText(f.info[1], cx - 400, Y(745));
    g.fillStyle = ROSE_T; g.font = `700 20px ${SANS}`; g.fillText('SCAN FOR PRICING & PACKAGES', cx - 400, Y(680));
    qr(g, cx + 290, Y(840), 110, key.length);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }

  function lightboxTexture(THREE) {
    const wmm = D * 1000, vis = (D - CW) * 1000; // visible part starts at the front edge (u = 0)
    const [c, g] = cv(wmm, 1800);
    const cx = vis / 2;
    const bg = g.createRadialGradient(cx, 760, 50, cx, 760, 1300);
    bg.addColorStop(0, '#FFF3DF'); bg.addColorStop(.55, '#F7E3C8'); bg.addColorStop(1, '#EBCFAE');
    g.fillStyle = bg; g.fillRect(0, 0, wmm, 1800);
    g.strokeStyle = 'rgba(126,86,67,.12)'; g.lineWidth = 3;
    for (let x = -1800; x < wmm + 1800; x += 180) { g.beginPath(); g.moveTo(x, 1800); g.lineTo(x + 1000, 0); g.stroke(); g.beginPath(); g.moveTo(x + 1000, 1800); g.lineTo(x, 0); g.stroke(); }
    const veil = g.createRadialGradient(cx, 780, 60, cx, 780, 820);
    veil.addColorStop(0, 'rgba(255,246,232,.95)'); veil.addColorStop(1, 'rgba(255,246,232,0)');
    g.fillStyle = veil; g.fillRect(0, 0, wmm, 1800);
    g.textAlign = 'center'; g.fillStyle = INK;
    g.font = `700 64px ${SANS}`; if (g.letterSpacing !== undefined) g.letterSpacing = '30px';
    g.fillText('MAXSEN', cx + 15, 330); if (g.letterSpacing !== undefined) g.letterSpacing = '0px';
    g.font = `400 190px ${SERIF}`; g.fillText('The art of', cx, 720);
    g.fillStyle = ROSE_T; g.font = `italic 400 190px ${SERIF}`; g.fillText('a single touch.', cx, 920);
    g.fillStyle = '#5B4E47'; g.font = `700 36px ${SANS}`; if (g.letterSpacing !== undefined) g.letterSpacing = '12px';
    g.fillText('SMART HOME · SINGAPORE', cx + 6, 1060); if (g.letterSpacing !== undefined) g.letterSpacing = '0px';
    g.strokeStyle = ROSE; g.lineWidth = 14; g.beginPath(); g.arc(cx, 1360, 150, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(207,165,148,.5)'; g.lineWidth = 4; g.beginPath(); g.arc(cx, 1360, 118, 0, 7); g.stroke();
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }

  /* ---------- the model ---------- */
  function build(THREE) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE7E1DA);
    scene.fog = new THREE.Fog(0xE7E1DA, 14, 32);
    const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .8, metalness: 0 }, o));
    const bronze = std({ color: 0x2B231F, roughness: .55, metalness: .35 });
    const add = (geo, mat, x, y, z, o = {}) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
      m.castShadow = o.cast !== false; m.receiveShadow = true; scene.add(m); return m;
    };

    scene.add(new THREE.HemisphereLight(0xfffaf4, 0xb9ab9c, .5));
    const sun = new THREE.DirectionalLight(0xfff6ec, .5);
    sun.position.set(7, 9, 8); sun.target.position.set(2.4, 0, 1); scene.add(sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
    sun.shadow.bias = -0.0005; scene.add(sun);

    // floors
    const expo = add(new THREE.PlaneGeometry(60, 60), std({ color: 0xD6D0C8 }), W / 2, 0, D / 2, { cast: false });
    expo.rotation.x = -Math.PI / 2;
    add(new THREE.BoxGeometry(W, .012, D), std({ color: 0xB3A291, roughness: 1 }), W / 2, .006, D / 2, { cast: false });
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, .001, D)), new THREE.LineBasicMaterial({ color: 0xB08A75 }));
    edge.position.set(W / 2, .014, D / 2); scene.add(edge);

    // LED light channel above each cassette: a slim bar and a soft wash down the face
    const barMat = new THREE.MeshBasicMaterial({ color: 0xfff0d6 });
    function channel(x, z, nx, nz) {
      const along = nz !== 0;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(along ? .84 : .03, .03, along ? .03 : .84), bronze);
      bar.position.set(x + nx * .015, 1.375, z + nz * .015); scene.add(bar);
      const led = new THREE.Mesh(new THREE.BoxGeometry(along ? .8 : .006, .006, along ? .006 : .8), barMat);
      led.position.set(x + nx * .031, 1.362, z + nz * .031); scene.add(led);
      const s = new THREE.SpotLight(0xffdcb0, .8, 1.6, 1.0, .9, 1.8);
      s.position.set(x + nx * .22, 1.42, z + nz * .22); s.target.position.set(x, 1.0, z);
      scene.add(s); scene.add(s.target);
    }

    // fabric lightbox along the left 7 ft side
    const lbTex = lightboxTexture(THREE);
    const frame = std({ color: 0xD9D4CE, roughness: .4, metalness: .6 });
    const lbMats = [new THREE.MeshBasicMaterial({ map: lbTex }), frame, frame, frame, frame, frame];
    add(new THREE.BoxGeometry(LB, H, D), lbMats, LB / 2, H / 2, D / 2);
    const glow = new THREE.PointLight(0xffe2bc, .35, 3, 2); glow.position.set(.8, 1.1, 1.15); scene.add(glow);

    // one-sided carpentry wall along the back, four panels
    const keys = ['prestige', 'noble', 'nova', 'folio'];
    const lam = std({ color: 0xD8C6AE, roughness: .7 });
    keys.forEach((k, i) => {
      const x = LB + PW * i + PW / 2;
      const tex = faceTexture(THREE, PW * 1000 - 6, k, 'wall');
      const mats = [lam, lam, lam, lam, std({ map: tex, roughness: .75 }), lam];
      add(new THREE.BoxGeometry(PW - .006, H, CW), mats, x, H / 2, CW / 2);
      channel(x, CW, 0, 1);
    });

    // one two-sided stand set at 45° across the front right corner:
    // the outer face looks at both aisles, the inner face looks at the tables
    const dark = bronze;
    const outer = std({ map: faceTexture(THREE, 1000, 'panels', 'stand'), roughness: .85 });
    const inner = std({ map: faceTexture(THREE, 1000, 'secure', 'stand'), roughness: .85 });
    const stand = new THREE.Group(); stand.position.set(4.277, 0, 1.534); stand.rotation.y = Math.PI / 4; scene.add(stand);
    const sm = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; stand.add(o); return o; };
    sm(new THREE.BoxGeometry(1, H, .2), [dark, dark, dark, dark, outer, inner], 0, H / 2, 0);
    sm(new THREE.BoxGeometry(1, .012, .6), bronze, 0, .006, 0);
    [1, -1].forEach(n => {
      sm(new THREE.BoxGeometry(.84, .03, .03), bronze, 0, 1.375, n * .115);
      sm(new THREE.BoxGeometry(.8, .006, .006), barMat, 0, 1.362, n * .131);
      const sp = new THREE.SpotLight(0xffdcb0, .8, 1.6, 1.0, .9, 1.8);
      sp.position.set(0, 1.42, n * .32); sp.target.position.set(0, 1.0, n * .1);
      stand.add(sp); stand.add(sp.target);
    });

    // two consult tables with two chairs each
    const top = std({ color: 0xFBF8F4, roughness: .35 });
    const seat = std({ color: 0xCFA594, roughness: .9 });
    const leg = std({ color: 0x2B231F, roughness: .4, metalness: .5 });
    function table(x, z) {
      add(new THREE.CylinderGeometry(.3, .3, .03, 48), top, x, .745, z);
      add(new THREE.CylinderGeometry(.03, .03, .72, 16), leg, x, .37, z);
      add(new THREE.CylinderGeometry(.22, .24, .02, 32), leg, x, .01, z);
    }
    function chair(x, z, face) {
      const g = new THREE.Group();
      const m = (geo, mat, px, py, pz) => { const o = new THREE.Mesh(geo, mat); o.position.set(px, py, pz); o.castShadow = true; o.receiveShadow = true; g.add(o); };
      m(new THREE.BoxGeometry(.42, .06, .42), seat, 0, .45, 0);
      m(new THREE.BoxGeometry(.42, .38, .05), seat, 0, .67, -.19);
      [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]].forEach(([a, b]) => m(new THREE.CylinderGeometry(.012, .012, .42, 8), leg, a, .21, b));
      g.position.set(x, 0, z); g.rotation.y = face; scene.add(g);
    }
    table(.85, 1.35); chair(.4, 1.35, Math.PI / 2); chair(1.3, 1.35, -Math.PI / 2);
    table(2.95, 1.35); chair(2.5, 1.35, Math.PI / 2); chair(3.4, 1.35, -Math.PI / 2);
    // an iPad and a finish tray on the tables
    add(new THREE.BoxGeometry(.25, .008, .18), std({ color: 0x1b1b1d, roughness: .3 }), .85, .764, 1.32);
    add(new THREE.BoxGeometry(.3, .02, .2), std({ color: 0xCBB79C, roughness: .5 }), 2.95, .77, 1.34);
    const menu = std({ color: 0x29221F, roughness: .6 });
    [.85, 2.95].forEach(x => { const m = add(new THREE.BoxGeometry(.15, .21, .012), menu, x + .12, .865, 1.55); m.rotation.x = -.15; });

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

  function mount(THREE, el, opts = {}) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.capture });
    renderer.setPixelRatio(opts.ratio || Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .92;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = false;
    el.appendChild(renderer.domElement);
    const scene = build(THREE);
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
