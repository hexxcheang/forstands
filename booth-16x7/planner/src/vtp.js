const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: 1100, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  const url = 'file:///home/user/forstands/booth-16x7/planner/index.html';
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('#stage canvas', { timeout: 120000 }); await p.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout: 120000 });
  const list = async () => (await p.$$eval('#items button.it', bs => bs.map(b => b.textContent))).join('\n   ');
  console.log('start:\n   ' + await list());
  await p.click('button[data-add="table"]', { noWaitAfter: true }); await p.waitForTimeout(2500);
  await p.click('button[data-add="chair"]', { noWaitAfter: true }); await p.waitForTimeout(2500);
  console.log('selected after adding a chair:', await p.textContent('#selName'), '|', await p.textContent('#selSize'));
  // drag board1 onto the counter in plan view
  await p.click('button[data-v="plan"]', { noWaitAfter: true }); await p.waitForTimeout(2500);
  await p.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' })); await p.waitForTimeout(1500);
  const box = await p.locator('#stage canvas').boundingBox();
  // in plan: x across 16:9 frame; board2 sits at x=-1.3, z=.3 -> about (0.35, 0.56) of the frame
  let hit = null;
  for (const [fx, fy] of [[.36, .56], [.35, .55], [.37, .57], [.34, .56]]) {
    await p.mouse.move(box.x + box.width * fx, box.y + box.height * fy); await p.waitForTimeout(2500);
    if (await p.evaluate(() => document.querySelector('#stage canvas').style.cursor) === 'grab') { hit = [box.x + box.width * fx, box.y + box.height * fy]; break; }
  }
  console.log('grab at', hit);
  if (hit) { await p.mouse.down(); await p.waitForTimeout(1200); await p.mouse.move(hit[0] + 150, hit[1] - 150, { steps: 6 }); await p.waitForTimeout(1500); await p.mouse.up(); await p.waitForTimeout(2000); }
  console.log('warning:', await p.textContent('#warn'), '| hidden', await p.$eval('#warn', e => e.hidden));
  console.log('floor:', await p.textContent('#floorUse'));
  await p.screenshot({ path: path.join(__dirname, 'out', 'page-plan.png'), clip: box, timeout: 120000 });
  // a board: change width and samples
  await p.click('#items li:nth-child(2) button.it', { noWaitAfter: true }); await p.waitForTimeout(1500);
  await p.selectOption('#selW', '1', { noWaitAfter: true }); await p.waitForTimeout(2000);
  await p.selectOption('#selFin', 'blackgold', { noWaitAfter: true }); await p.waitForTimeout(2000);
  console.log('board now:', await p.textContent('#selName'), '|', await p.textContent('#selSize'));
  // reload: the layout comes back
  await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout: 120000 }); await p.waitForTimeout(1500);
  console.log('after reload:\n   ' + await list());
  console.log('errors', errs); await b.close();
})();
