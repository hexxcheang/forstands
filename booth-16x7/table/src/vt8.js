const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: 1100, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.goto('file:///home/user/forstands/booth-16x7/table/index.html', { waitUntil: 'domcontentloaded' });
  await p.click('#open3d'); await p.waitForSelector('#stage canvas', { timeout: 120000 }); await p.waitForTimeout(2000);
  await p.click('#finToggle');
  const slots = async () => (await p.$$eval('#finSlots .slot', bs => bs.map(b => b.textContent))).join(' | ');
  console.log('swatches', await p.$$eval('.fsw', x => x.length), 'groups', await p.$$eval('.fin-g', x => x.map(e => e.textContent).join(',')));
  console.log('round:', await slots());
  await p.click('#finSlots .slot:nth-child(1)'); await p.click('.fsw[aria-label="Calacatta gold"]'); await p.waitForTimeout(1500);
  await p.click('#finSlots .slot:nth-child(3)'); await p.click('.fsw[aria-label="Navy to gold"]'); await p.waitForTimeout(1500);
  console.log('picked:', await slots(), '/', await p.textContent('#finFor'));
  for (const f of ['round28', 'rect28']) { await p.click(`button[data-f="${f}"]`, { noWaitAfter: true, timeout: 180000 }); await p.waitForTimeout(15000); console.log(f + ':', await slots()); }
  await p.click("#arrToggle", { timeout: 180000 }); await p.click("#listSum", { timeout: 180000 });
  console.log('rect28 items:', (await p.$$eval('#items button.it', bs => bs.map(b => b.textContent))).slice(7).join(' / '));
  await p.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' })); await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(__dirname, 'out-ed', 'live28.png'), clip: await p.locator('#stage').boundingBox(), timeout: 120000 });
  await p.screenshot({ path: path.join(__dirname, 'out-ed', 'panel28.png'), clip: await p.locator('#finishes').boundingBox(), timeout: 120000 });
  console.log('errors', errs); await b.close();
})();
