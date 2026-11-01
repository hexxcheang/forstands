const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage(); p.on('pageerror', e => console.log('err', e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.goto('file://' + path.join(__dirname, 'rt2.html'));
  for (const form of ['round', 'rect28']) console.log(form, await p.evaluate(async form => {
    const M = form === 'round' ? MaxsenTable : MaxsenTable[form];
    const el = document.createElement('div'); el.style.cssText = 'width:300px;height:200px'; document.body.appendChild(el);
    const v = await M.mount(THREE, el, { capture: true, ratio: 1, w: 300, h: 200 });
    const E = v.editor, sw = () => E.layout().filter(d => d.type === 'switch');
    const out = [];
    out.push('switches ' + sw().map(d => d.v + '@' + d.x.toFixed(3)).join(' '));
    E.select('sw1'); E.update(null, { x: -2, z: .5 }); out.push('sw1 pushed far left/up -> x ' + E.selected().x.toFixed(3) + ' z ' + E.selected().z.toFixed(3) + ' surfaces ' + E.selected().surfaces.map(s => s.key));
    E.select('sw5'); E.update(null, { v: 'prestige-onyx' }); out.push('sw5 now ' + E.selected().v + ' named ' + E.selected().name);
    const id = E.add('switch', 's8'); out.push('added ' + E.selected().name + ' on ' + E.selected().on + ' at x ' + E.selected().x.toFixed(3));
    E.update(id, { on: 'top' }); out.push('tried to move it to the top: still on ' + E.selected().on);
    E.setLayout([{ id: 'lock1', type: 'lock', v: '0', on: 'top', x: 0, z: 0, r: 0 }]); out.push('old layout without switches -> ' + sw().length + ' switches restored');
    return out.join('\n   ');
  }, form));
  await b.close();
})();
