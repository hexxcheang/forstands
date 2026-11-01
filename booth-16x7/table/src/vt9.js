const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: 1000, height: 800 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.goto('file:///home/user/forstands/booth-16x7/table/index.html', { waitUntil: 'domcontentloaded' });
  await p.click('#open3d'); await p.waitForSelector('#stage canvas', { timeout: 120000 }); await p.waitForTimeout(2000);
  await p.click('#arrToggle'); await p.click('button[data-v="detail"]', { noWaitAfter: true }); await p.waitForTimeout(2500);
  await p.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' })); await p.waitForTimeout(1500);
  const box = await p.locator('#stage canvas').boundingBox();
  // the detail view: the switch row runs across the middle of the picture
  let hit = null;
  for (const fy of [.45, .5, .4]) { for (const fx of [.6, .55, .65, .5]) {
    const x = box.x + box.width * fx, y = box.y + box.height * fy;
    await p.mouse.move(x, y); await p.waitForTimeout(2500);
    if (await p.evaluate(() => document.querySelector('#stage canvas').style.cursor) === 'grab') { hit = [x, y]; break; }
  } if (hit) break; }
  console.log('grab at', hit);
  await p.mouse.down(); await p.waitForTimeout(1500);
  const before = await p.textContent('#selName');
  const sel0 = await p.evaluate(() => JSON.parse(localStorage.getItem('maxsen-counter-layout-v1') || '[]').length);
  await p.mouse.move(hit[0] + 150, hit[1], { steps: 6 }); await p.waitForTimeout(2000); await p.mouse.up(); await p.waitForTimeout(2000);
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('maxsen-counter-layout-v1') || '[]').filter(d => d.type === 'switch').map(d => d.v + '@' + d.x.toFixed(3)).join(' '));
  console.log('picked', before, '| saved switches:', saved);
  console.log('errors', errs); await b.close();
})();
