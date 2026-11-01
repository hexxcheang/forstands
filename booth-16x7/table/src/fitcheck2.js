const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('err', e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.goto('file://' + path.join(__dirname, 'rt2.html'));
  for (const shelves of [true, false]) console.log(shelves, await p.evaluate(async shelves => {
    const el = document.createElement('div'); el.style.cssText = 'width:400px;height:250px'; document.body.appendChild(el);
    const v = await MaxsenTable.rect.mount(THREE, el, { capture: true, ratio: 1, w: 400, h: 250, shelves });
    const L = v.editor.labels();
    return JSON.stringify(L) + '\n' + v.editor.layout().map(d => d.id + '@' + d.on).join(' ');
  }, shelves));
  await b.close();
})();
