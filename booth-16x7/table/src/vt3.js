const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const npm = path.join(__dirname, '..', '..', 'npm3', 'package');
const out = path.join(__dirname, 'out-ed');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.128.0/**', r => { const u = new URL(r.request().url()).pathname.replace('/npm/three@0.128.0/', ''); r.fulfill({ body: fs.readFileSync(path.join(npm, u)), contentType: 'text/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  const url = 'file:///home/user/forstands/booth-16x7/table/index.html';
  await p.goto(url);
  await p.click('#open3d');
  await p.waitForSelector('#stage canvas', { timeout: 120000 });
  await p.waitForTimeout(4000);
  await p.locator('#stage').scrollIntoViewIfNeeded();
  await p.click('#arrToggle');
  // project a lock's centre to the screen, then drag it
  const scr = async (x, y, z) => p.evaluate(([x, y, z]) => {
    const c = document.querySelector('#stage canvas').getBoundingClientRect();
    return { c: [c.left, c.top, c.width, c.height] };
  }, [x, y, z]);
  const before = await p.evaluate(() => JSON.parse(localStorage.getItem('maxsen-counter-layout-v1') || 'null'));
  console.log('stored before', before && before.length);
  // click front view, find a lock by scanning for cursor grab
  await p.click('button[data-v="front"]'); await p.waitForTimeout(1500);
  await p.evaluate(() => document.getElementById('stage').scrollIntoView({ block: 'start' })); await p.waitForTimeout(500);
  const box = await p.locator('#stage canvas').boundingBox();
  let hit = null;
  const sb = await p.locator('#stage').boundingBox(); await p.screenshot({ path: path.join(out, 'edit-front.png'), clip: sb }); console.log('stage', JSON.stringify(sb));
  console.log('errs so far', errs);
  for (let i = 0; i < 80 && !hit; i++) {
    const fx = .3 + (i % 8) * .06, fy = .15 + Math.floor(i / 8) * .07;
    const x = box.x + box.width * fx, y = box.y + box.height * fy;
    await p.mouse.move(x, y); await p.waitForTimeout(900);
    const cur = await p.evaluate(() => document.querySelector('#stage canvas').style.cursor);
    if (cur === 'grab') hit = [x, y];
  }
  console.log('grab at', hit);
  await p.mouse.down(); await p.mouse.move(hit[0] + 60, hit[1] + 40, { steps: 8 }); await p.mouse.up();
  await p.waitForTimeout(500);
  console.log('selected', await p.textContent('#selName'));
  await p.click('button[data-add="plant"][data-v="olive"]'); await p.waitForTimeout(800);
  console.log('after add selected', await p.textContent('#selName'));
  await p.selectOption('#selOn', 'L2').catch(e => console.log('olive to shelf refused (expected)', e.message.slice(0, 60)));
  const opts = await p.$$eval('#selOn option', os => os.map(o => o.textContent + (o.disabled ? ' [x]' : '')));
  console.log('olive surfaces', opts.join(' | '));
  // move the lusano catalogues up to the top
  await p.click('#listSum');
  const names = await p.$$eval('#items button.it', bs => bs.map(b => b.textContent));
  console.log('items', names.length, names.slice(0, 12).join(' / '));
  const idx = names.findIndex(n => n.startsWith('Lusano catalogues'));
  await p.locator('#items button.it').nth(idx).click();
  await p.selectOption('#selOn', 'top'); await p.waitForTimeout(400);
  await p.fill('#selR', '30').catch(() => {});
  await p.locator('#selR').evaluate(e => { e.value = 30; e.dispatchEvent(new Event('input')); });
  // take the halo catalogues off
  const n2 = await p.$$eval('#items button.it', bs => bs.map(b => b.textContent));
  await p.locator('#items button.x').nth(n2.findIndex(n => n.startsWith('Halo catalogues'))).click();
  await p.waitForTimeout(400);
  await p.click('button[data-v="hero"]'); await p.waitForTimeout(1500);
  await p.locator('#stage').screenshot({ path: path.join(out, 'edit-1.png') });
  await p.locator('.arrange').screenshot({ path: path.join(out, 'edit-panel.png') });
  const stored = await p.evaluate(() => JSON.parse(localStorage.getItem('maxsen-counter-layout-v1')));
  console.log('stored', stored.length, 'status:', await p.textContent('#saveState'));
  // mood change keeps the layout
  await p.click('button[data-m="night"]'); await p.waitForTimeout(5000);
  const n3 = await p.evaluate(() => document.querySelectorAll('#items li').length);
  console.log('after night remount items', n3);
  // reload: the arrangement comes back
  await p.reload(); await p.click('#open3d'); await p.waitForSelector('#stage canvas', { timeout: 120000 }); await p.waitForTimeout(4000);
  await p.click('#arrToggle'); await p.click('#listSum');
  const n4 = await p.$$eval('#items button.it', bs => bs.map(b => b.textContent));
  console.log('after reload', n4.length, n4.filter(n => /Olive|Lusano cat/.test(n)).join(' / '));
  console.log('errors', errs);
  await b.close();
})();
