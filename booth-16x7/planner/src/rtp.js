const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
const out = process.argv[2], W = +(process.argv[4] || 1600), Hh = Math.round(W * .5625), views = (process.argv[3] || 'three').split(',');
const layout = process.env.LAYOUT ? JSON.parse(fs.readFileSync(process.env.LAYOUT, 'utf8')) : undefined;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('err', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console', m.text().slice(0, 200)); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.goto('file://' + path.join(__dirname, 'rtp.html'));
  const shots = await p.evaluate(async ({ views, W, H, layout }) => {
    const el = document.createElement('div'); el.style.cssText = `width:${W}px;height:${H}px`; document.body.appendChild(el);
    const v = await BoothPlanner.mount(THREE, el, { capture: true, ratio: 1, w: W, h: H, layout });
    return { shots: views.map(k => [k, v.capture(k)]), clash: v.editor.clashes(), layout: v.editor.layout() };
  }, { views, W, H: Hh, layout });
  fs.mkdirSync(out, { recursive: true });
  for (const [k, d] of shots.shots) fs.writeFileSync(path.join(out, k + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('clashes', shots.clash, 'items', shots.layout.map(d => d.id + '@' + d.x.toFixed(2) + ',' + d.z.toFixed(2)).join(' '));
  await b.close();
})();
