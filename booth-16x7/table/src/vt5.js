const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: 1000, height: 800 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.goto('file:///home/user/forstands/booth-16x7/table/index.html');
  await p.click('#open3d'); await p.waitForSelector('#stage canvas', { timeout: 120000 }); await p.waitForTimeout(2000);
  await p.click('#arrToggle'); await p.click('#listSum');
  const list = async () => (await p.$$eval('#items button.it', bs => bs.map(b => b.textContent))).join(' / ');
  console.log('open:', await list());
  for (const sel of (process.argv[2] || 'closed').split(',')) {
    await p.click(`button[data-${sel.split('=')[0]}="${sel.split('=')[1] || sel}"]`.replace('data-closed="closed"', 'data-s="closed"')); await p.waitForTimeout(6000);
    console.log(sel + ':', await list());
  }
  console.log('errors', errs); await b.close();
})();
