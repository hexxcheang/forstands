/* The Maxsen counter table from the sketch: 1,400 long, 600 deep (assumed), 1,000 high.
   Units are metres. x runs along the length, z from the back (-) to the front (+), y is up. */
window.MaxsenTable = (function () {
  const L = 1.4, D = 0.6, H = 1.0, TOP = 0.04, R = 0.15; // top: 40 mm slab, 150 mm corner radius
  const INSET = 0.03;                                     // the top overhangs the body by 30 mm
  const BL = L - 2 * INSET, BD = D - 2 * INSET, BR = R - INSET;
  const BASE = 0.06;                                      // floating base
  const CORE = 0.76;                                      // closed centre section
  const MID = 0.48, OAK = 0.04;                           // the oak line across the middle, 480 to 520
  const SHELF_Y = [BASE, MID, H - TOP - 0.027];           // shelf boards, bottom to top
  const SERIF = '"EB Garamond", Garamond, Georgia, serif';
  const SANS = 'Lato, "Helvetica Neue", Arial, sans-serif';

  function rrShape(THREE, w, d, r, cx = 0, cz = 0) {
    const s = new THREE.Shape(), x = cx - w / 2, y = cz - d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  // a shelf board for one end: square on the inside, rounded at the two outer corners
  function endShape(THREE, side, w, d, r) {
    const s = new THREE.Shape(), z0 = -d / 2, z1 = d / 2;
    if (side > 0) {
      s.moveTo(0, z0); s.lineTo(w - r, z0); s.quadraticCurveTo(w, z0, w, z0 + r);
      s.lineTo(w, z1 - r); s.quadraticCurveTo(w, z1, w - r, z1); s.lineTo(0, z1); s.lineTo(0, z0);
    } else {
      s.moveTo(0, z0); s.lineTo(-w + r, z0); s.quadraticCurveTo(-w, z0, -w, z0 + r);
      s.lineTo(-w, z1 - r); s.quadraticCurveTo(-w, z1, -w + r, z1); s.lineTo(0, z1); s.lineTo(0, z0);
    }
    return s;
  }
  // extrude a plan shape (drawn in x/z) upward by h, starting at y
  function slab(THREE, shape, h, bevel) {
    const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 4, curveSegments: 24 });
    g.rotateX(Math.PI / 2); g.translate(0, h, 0); // shape y becomes +z, extrusion becomes +y
    g.computeVertexNormals();
    return g;
  }

  function marble(THREE) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d');
    g.fillStyle = '#F3F0EB'; g.fillRect(0, 0, 2048, 1024);
    let v = 21; const rnd = () => (v = (v * 9301 + 49297) % 233280) / 233280;
    const cloud = g.createRadialGradient(700, 400, 50, 700, 400, 900); cloud.addColorStop(0, 'rgba(225,218,208,.5)'); cloud.addColorStop(1, 'rgba(225,218,208,0)');
    g.fillStyle = cloud; g.fillRect(0, 0, 2048, 1024);
    for (let k = 0; k < 16; k++) {
      g.strokeStyle = `rgba(${95 + rnd() * 40},${88 + rnd() * 30},${80 + rnd() * 25},${.12 + rnd() * .26})`;
      g.lineWidth = .6 + rnd() * (k < 4 ? 3.5 : 1.5);
      g.beginPath(); let x = rnd() * 2048, y = -20; g.moveTo(x, y);
      const drift = (rnd() - .3) * 70;
      while (y < 1050) { x += drift + (rnd() - .5) * 90; y += 18 + rnd() * 34; g.lineTo(x, y); }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / L, 1 / D); t.offset.set(.5, .5);
    return t;
  }

  function oakTex(THREE) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#A67C55'; g.fillRect(0, 0, 1024, 256);
    let v = 3; const rnd = () => (v = (v * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 140; i++) {
      g.strokeStyle = `rgba(${rnd() > .5 ? '80,52,30' : '196,150,104'},${.08 + rnd() * .18})`; g.lineWidth = .5 + rnd() * 2.5;
      let y = rnd() * 256; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 64) { y += (rnd() - .5) * 5; g.lineTo(x, y); }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.2, 1); return t;
  }

  function coreFront(THREE) {
    const w = 1520, h = 1800; // 0.5 px per mm of a 760 x 900 panel
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#E4D5C1'); bg.addColorStop(1, '#D9C7AF');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // fine vertical grain of the laminate
    let v = 5; const rnd = () => (v = (v * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(120,95,70,${rnd() * .035})`; g.fillRect(rnd() * w, 0, 1 + rnd() * 3, h); }
    g.fillStyle = '#3A2E26'; g.textAlign = 'center';
    g.font = `700 58px ${SANS}`; if (g.letterSpacing !== undefined) g.letterSpacing = '30px';
    g.fillText('MAXSEN', w / 2 + 15, h * .26);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
  }

  function floorGlow(THREE) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    const f = g.createRadialGradient(256, 128, 40, 256, 128, 250);
    f.addColorStop(0, 'rgba(255,196,130,.0)'); f.addColorStop(.42, 'rgba(255,196,130,.85)'); f.addColorStop(.6, 'rgba(255,196,130,.35)'); f.addColorStop(1, 'rgba(255,196,130,0)');
    g.save(); g.scale(1, .52); g.translate(0, 118); g.fillStyle = f; g.fillRect(0, -128, 512, 512); g.restore();
    return new THREE.CanvasTexture(c);
  }

  function build(THREE, renderer, mood) {
    const night = mood === 'night';
    const scene = new THREE.Scene();
    const bgc = night ? 0x1E1915 : 0xE9E4DD;
    scene.background = new THREE.Color(bgc);
    scene.fog = new THREE.Fog(bgc, 5.5, 13);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new THREE.RoomEnvironment(), .04).texture;

    const std = o => new THREE.MeshStandardMaterial(Object.assign({ roughness: .7, metalness: 0, envMapIntensity: night ? .22 : .5 }, o));
    const add = (geo, mat, x = 0, y = 0, z = 0, o = {}) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
      m.castShadow = o.cast !== false; m.receiveShadow = true; scene.add(m); return m;
    };

    // studio: a warm concrete floor and soft light
    const floor = add(new THREE.PlaneGeometry(40, 40), std({ color: night ? 0x3a322c : 0xC2B7AA, roughness: .92 }), 0, 0, 0, { cast: false });
    floor.rotation.x = -Math.PI / 2;
    scene.add(new THREE.HemisphereLight(0xfff7ef, night ? 0x1a1410 : 0x9d8f80, night ? .08 : .22));
    const key = new THREE.DirectionalLight(0xfff3e6, night ? .12 : .78);
    key.position.set(-2.6, 4.2, 3.2); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 6;
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: .5, far: 12 }); key.shadow.bias = -.0004;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe6cc, night ? .05 : .22); rim.position.set(3, 2.5, -3); scene.add(rim);

    // materials from the Maxsen palette
    const stone = new THREE.MeshPhysicalMaterial({ map: marble(THREE), roughness: .25, clearcoat: .5, clearcoatRoughness: .25, envMapIntensity: night ? .3 : .6, color: 0xF2EEE8 });
    const lam = std({ color: 0xD3BFA4, roughness: .55 });
    const shelfMat = std({ color: 0xC4AD8F, roughness: .5 });
    const oak = std({ map: oakTex(THREE), roughness: .55 });
    const bronze = std({ color: 0x2B231F, roughness: .38, metalness: .55 });
    const led = new THREE.MeshBasicMaterial({ color: night ? 0xffd9a8 : 0xfff1dc });

    // top: 40 mm slab, 150 mm corner radius, a small softened edge
    add(slab(THREE, rrShape(THREE, L - .006, D - .006, R), TOP - .006, .003), stone, 0, H - TOP + .003, 0);

    // LED strip tucked 20 mm under the top edge, washing down the body
    const ledRing = slab(THREE, rrShape(THREE, BL + .03, BD + .03, BR + .015), .006);
    const ringCut = rrShape(THREE, BL + .016, BD + .016, BR + .008); // a thin ring, not a solid sheet
    const ringShape = rrShape(THREE, BL + .03, BD + .03, BR + .015); ringShape.holes.push(ringCut);
    add(slab(THREE, ringShape, .006), led, 0, H - TOP - .007, 0, { cast: false });
    ledRing.dispose();

    // closed centre section
    const frontTex = coreFront(THREE);
    const coreMats = [lam, lam, lam, lam, std({ map: frontTex, roughness: .55 }), lam];
    add(new THREE.BoxGeometry(CORE, H - TOP - BASE - .002, BD), coreMats, 0, BASE + (H - TOP - BASE) / 2, 0);

    // the oak band across the centre, front and back, continuing the oak shelves
    [1, -1].forEach(zs => add(new THREE.BoxGeometry(CORE + .002, OAK, .016), oak, 0, MID + OAK / 2, zs * (BD / 2 + .008)));

    // open shelves at both ends, wrapping round the rounded corners, carried on slim bronze posts
    const endW = BL / 2 - CORE / 2;
    [1, -1].forEach(side => {
      const x0 = side * CORE / 2;
      SHELF_Y.forEach((y, i) => {
        const mid = y === MID, th = mid ? OAK : .027;
        add(slab(THREE, endShape(THREE, side, endW, BD, BR), th, mid ? .002 : 0), mid ? oak : shelfMat, x0, y, 0);
      });
    });

    // floating base: a bronze plinth set back 60 mm, with an LED line that lights the floor
    add(slab(THREE, rrShape(THREE, BL - .12, BD - .12, BR - .04), BASE - .004), bronze, 0, .002, 0);
    const baseRing = rrShape(THREE, BL - .1, BD - .1, BR - .03); baseRing.holes.push(rrShape(THREE, BL - .114, BD - .114, BR - .036));
    add(slab(THREE, baseRing, .005), led, 0, BASE - .012, 0, { cast: false });
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(BL + .7, BD + .55), new THREE.MeshBasicMaterial({ map: floorGlow(THREE), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: night ? .9 : .45 }));
    gl.rotation.x = -Math.PI / 2; gl.position.y = .002; scene.add(gl);

    // warm light from the LEDs: under the top onto the body, and from the base onto the floor
    THREE.RectAreaLightUniformsLib.init();
    const washI = night ? 7 : 2.2;
    [[0, BD / 2 + .012, 0, BL - .3], [0, -BD / 2 - .012, Math.PI, BL - .3]].forEach(([x, z, ry, w]) => {
      const a = new THREE.RectAreaLight(0xffc98f, washI, w, .02);
      a.position.set(x, H - TOP - .012, z); a.lookAt(x, 0, z + (z > 0 ? .05 : -.05)); scene.add(a);
    });
    [[1, 0], [-1, 0]].forEach(([s]) => {
      const a = new THREE.RectAreaLight(0xffc98f, washI * .8, .02, BD - .2);
      a.position.set(s * (BL / 2 + .012), H - TOP - .012, 0); a.lookAt(s * (BL / 2 + .06), 0, 0); scene.add(a);
    });
    const low = new THREE.RectAreaLight(0xffc48a, night ? 5 : 2, BL - .1, BD - .1);
    low.position.set(0, BASE - .015, 0); low.lookAt(0, -1, 0); scene.add(low);
    // light inside each shelf bay, so the products glow
    [1, -1].forEach(s => SHELF_Y.slice(1).forEach(y => {
      const p = new THREE.PointLight(0xffcf98, night ? .5 : .18, .5, 2); p.position.set(s * (CORE / 2 + endW / 2), y - .03, 0); scene.add(p);
    }));

    // a few things on the shelves and top, for scale
    const paper = std({ color: 0xF6F1EA, roughness: .9 });
    const ceramic = std({ color: 0xEDE7DF, roughness: .45 });
    const plateCols = [0x1d1b1a, 0xcbb79c, 0x2b2f3a];
    const L0 = -(CORE / 2 + endW / 2), R0 = CORE / 2 + endW / 2;
    // left: brochures and a vase; right: switch samples and a small book stack
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(.21, .006, .297), i % 2 ? paper : std({ color: 0x2B231F, roughness: .6 }), L0 - .02, SHELF_Y[0] + .03 + i * .007, .03);
    add(new THREE.CylinderGeometry(.045, .055, .22, 32), ceramic, L0 + .04, MID + OAK + .11, -.04);
    add(new THREE.CylinderGeometry(.05, .045, .1, 32), std({ color: 0x8A7563, roughness: .8 }), L0 - .08, MID + OAK + .05, .1);
    plateCols.forEach((c, i) => {
      const p = add(new THREE.BoxGeometry(.086, .086, .01), std({ color: c, roughness: .3, metalness: .2 }), R0 - .09 + i * .095, MID + OAK + .05, .08);
      p.rotation.x = -.18;
    });
    for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(.17, .025, .23), std({ color: [0xCFA594, 0xEDE7DF, 0x2B231F][i], roughness: .8 }), R0 - .03, SHELF_Y[0] + .04 + i * .026, -.02);
    add(new THREE.BoxGeometry(.11, .11, .04), std({ color: 0x18181b, roughness: .25 }), R0 + .07, MID + OAK + .055, -.12);
    // on the top: an iPad and a small vase of flowers
    const pad = add(new THREE.BoxGeometry(.25, .007, .178), std({ color: 0x1b1b1d, roughness: .2, metalness: .3 }), -.25, H + .0035, .05);
    pad.rotation.y = .15;
    add(new THREE.CylinderGeometry(.03, .04, .13, 28), ceramic, .42, H + .065, -.08);
    [0xFBF6EF, 0xEAD3C8, 0xFBF6EF, 0xD9B5A6].forEach((c, k) => {
      const a = k * 1.6;
      add(new THREE.SphereGeometry(.024, 16, 12), std({ color: c, roughness: .9 }), .42 + Math.cos(a) * .028, H + .16 + (k % 2) * .015, -.08 + Math.sin(a) * .028);
    });
    return scene;
  }

  const VIEWS = {
    hero:   { pos: [-1.95, 1.45, 2.35], at: [.02, .5, 0], fov: 27 },
    front:  { pos: [0, 1.05, 3.1], at: [0, .52, 0], fov: 30 },
    end:    { pos: [2.3, 1.2, 1.45], at: [.2, .5, 0], fov: 30 },
    detail: { pos: [1.05, 1.08, .95], at: [.5, .78, .15], fov: 36 },
    top:    { pos: [0, 3.3, 1.6], at: [0, .5, 0], fov: 30 }
  };

  function mount(THREE, el, opts = {}) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.capture });
    renderer.setPixelRatio(opts.ratio || Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = opts.mood === 'night' ? 1.0 : .85;
    renderer.physicallyCorrectLights = false;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const scene = build(THREE, renderer, opts.mood);
    const cam = new THREE.PerspectiveCamera(34, 1, .02, 60);
    let controls = null;
    if (THREE.OrbitControls && !opts.capture) {
      controls = new THREE.OrbitControls(cam, renderer.domElement);
      controls.enableDamping = true; controls.maxPolarAngle = Math.PI * .49; controls.minDistance = .6; controls.maxDistance = 7;
    }
    function size() { const w = el.clientWidth || opts.w, h = el.clientHeight || opts.h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    function view(k) { const v = VIEWS[k]; cam.fov = v.fov; cam.position.set(...v.pos); cam.lookAt(...v.at); if (controls) { controls.target.set(...v.at); controls.update(); } cam.updateProjectionMatrix(); }
    size(); view(opts.view || 'hero');
    let raf = 0;
    const loop = () => { raf = requestAnimationFrame(loop); if (controls) controls.update(); renderer.render(scene, cam); };
    if (!opts.capture) loop();
    window.addEventListener('resize', size);
    return { view, size, capture(k) { view(k); renderer.render(scene, cam); return renderer.domElement.toDataURL('image/png'); }, stop() { cancelAnimationFrame(raf); } };
  }
  return { mount, VIEWS };
})();
