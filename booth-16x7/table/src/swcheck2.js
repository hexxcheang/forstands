const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('err', e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.goto('file://' + path.join(__dirname, 'rt2.html'));
  console.log(await p.evaluate(async () => {
    const el = document.createElement('div'); el.style.cssText = 'width:300px;height:200px'; document.body.appendChild(el);
    const v = await MaxsenTable.mount(THREE, el, { capture: true, ratio: 1, w: 300, h: 200 });
    const E = v.editor, sw = () => E.layout().filter(d => d.type === 'switch').map(d => d.v + '@' + d.x.toFixed(3)).join(' ');
    const out = ['default: ' + sw()];
    const old = [['noble-champagne', -.489], ['noble-ivory', -.383], ['noble-onyx', -.277], ['halo', -.171], ['s8', 0], ['prestige-onyx', .171], ['prestige-champagne', .277], ['prestige-midnight', .383]].map(([v, x], i) => ({ id: 'sw' + (i + 1), type: 'switch', v, on: 'front', x, z: 0, r: 0 }));
    E.setLayout([{ id: 'lock1', type: 'lock', v: '0', on: 'top', x: 0, z: 0, r: 0 }, ...old]); out.push('saved old row: ' + sw());
    old[3].x = -.6; E.setLayout(old); out.push('a row the user moved stays: ' + sw());
    return out.join('\n');
  }));
  await b.close();
})();
