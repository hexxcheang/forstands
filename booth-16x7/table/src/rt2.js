const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
const out = process.argv[2], W = +(process.argv[4] || 2400), Hh = Math.round(W * .625);
const LAYOUT = process.env.LAYOUT ? JSON.parse(fs.readFileSync(process.env.LAYOUT, 'utf8')) : undefined;
const jobs = (process.argv[3] || 'day:hero').split(',').map(s => s.split(':'));
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  p.on('pageerror', e => console.log('err', e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', m.text().slice(0, 200)); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => {
    const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', '');
    r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' });
  });
  await p.goto('file://' + path.join(__dirname, 'rt2.html'));
  await p.evaluate(async () => { await document.fonts.load('700 30px Lato'); });
  fs.mkdirSync(out, { recursive: true });
  const moods = [...new Set(jobs.map(j => j[0]))];
  for (const mood of moods) {
    const t0 = Date.now();
    const shots = await p.evaluate(async ({ mood, views, W, H, layout, dbg, shelvesOff, rect, finishes }) => {
      const M = rect ? MaxsenTable.rect : MaxsenTable;
      if (dbg) M.VIEWS.dbg = dbg;
      const el = document.createElement('div'); el.style.cssText = `width:${W}px;height:${H}px`; document.body.appendChild(el);
      const v = await M.mount(THREE, el, { capture: true, ratio: 1, w: W, h: H, mood, layout, shelves: !shelvesOff, finishes });
      const r = views.map(k => [k, v.capture(k)]); el.remove(); return r;
    }, { mood, views: jobs.filter(j => j[0] === mood).map(j => j[1]), W, H: Hh, layout: LAYOUT, dbg: process.env.DBG ? JSON.parse(process.env.DBG) : null, shelvesOff: process.env.SHELVES === '0', rect: process.env.RECT === '1', finishes: process.env.FINISH ? JSON.parse(process.env.FINISH) : undefined });
    for (const [k, d] of shots) fs.writeFileSync(path.join(out, `${mood}-${k}.png`), Buffer.from(d.split(',')[1], 'base64'));
    console.log(mood, shots.length, 'in', Date.now() - t0, 'ms');
  }
  await b.close();
})();
