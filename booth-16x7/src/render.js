const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = __dirname, npm = path.join(dir, '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('err:', e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => {
    const u = r.request().url();
    const f = u.includes('OrbitControls') ? 'examples/js/controls/OrbitControls.js' : 'build/three.min.js';
    r.fulfill({ body: fs.readFileSync(path.join(npm, f)), contentType: 'text/javascript' });
  });
  await p.goto('file://' + path.join(dir, process.argv[2] || 'rtest.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(async () => { await document.fonts.load('400 100px "EB Garamond"'); await document.fonts.load('italic 400 100px "EB Garamond"'); await document.fonts.load('700 30px Lato'); await document.fonts.load('300 30px Lato'); await document.fonts.load('400 30px Lato'); });
  const views = (process.argv[3] || 'corner,front,inside,side,top').split(',');
  const out = process.argv[4] || path.join(dir, 'renders');
  fs.mkdirSync(out, { recursive: true });
  const t0 = Date.now();
  const shots = await p.evaluate(async (views) => {
    const el = document.createElement('div'); el.style.cssText = 'width:1600px;height:1000px'; document.body.appendChild(el);
    const v = await MaxsenBooth.mount(THREE, el, { capture: true, ratio: 1, w: 1600, h: 1000 });
    return views.map(k => [k, v.capture(k)]);
  }, views);
  for (const [k, d] of shots) fs.writeFileSync(path.join(out, k + '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('rendered', shots.length, 'in', Date.now() - t0, 'ms');
  await b.close();
})();
