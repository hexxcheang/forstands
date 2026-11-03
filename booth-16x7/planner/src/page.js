(() => {
  const $ = id => document.getElementById(id);
  const P = window.BoothPlanner, stage = $('stage');
  let viewer = null, selected = null, layout = null;
  const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';

  /* ---------- saving: the page's database, else this browser ---------- */
  const LS = 'maxsen-booth-planner-v1';
  let ref = null, lastSaved = null, writing = false, again = false, timer = 0, local = false;
  const say = t => { $('saveState').textContent = t; };
  try { const t = localStorage.getItem(LS); if (t) layout = P.sanitize(JSON.parse(t)); } catch (e) {}
  (async () => {
    await null;
    let db = null;
    try { db = (typeof claude !== 'undefined' && claude.use) ? await claude.use('db') : null; } catch (e) { db = null; }
    if (!db) { local = true; say('Saved in this browser only'); return; }
    ref = db.doc('planner/layout');
    const slow = setTimeout(() => say('Cannot reach the saved layout yet; changes are kept in this browser'), 10000);
    ref.onSnapshot(snap => {
      if (!snap.fromCache) clearTimeout(slow);
      if (!snap.exists) { lastSaved = null; if (!snap.fromCache) say(''); return; }
      const items = P.sanitize((snap.data() || {}).items); if (!items) return;
      const json = JSON.stringify(items); lastSaved = json;
      if (json !== JSON.stringify(layout)) { layout = items; if (viewer) { viewer.editor.setLayout(items); refresh(); } }
      if (!snap.fromCache && !writing) say('Saved');
    }, () => { clearTimeout(slow); ref = null; local = true; say('Saved in this browser only'); });
  })();
  function keep() {
    try { localStorage.setItem(LS, JSON.stringify(layout)); } catch (e) {}
    if (!ref) { say(local ? 'Saved in this browser only' : ''); return; }
    say('Saving…'); clearTimeout(timer); timer = setTimeout(flush, 700);
  }
  async function flush(retried) {
    if (!ref) return;
    if (writing) { again = true; return; }
    const json = JSON.stringify(layout); if (json === lastSaved) { say('Saved'); return; }
    writing = true;
    try { await ref.set({ items: layout, updatedAt: Date.now() }); lastSaved = json; say('Saved'); }
    catch (e) {
      if (e && e.code === 'unavailable' && !retried) { writing = false; setTimeout(() => flush(true), 600 + Math.random() * 900); return; }
      ref = null; local = true; say('Saved in this browser only: only editors of this page save to it');
    } finally { writing = false; if (again) { again = false; flush(); } }
  }

  /* ---------- the planner ---------- */
  (async () => {
    try {
      if (!window.THREE) await load(CDN + 'build/three.min.js');
      for (const f of ['examples/js/controls/OrbitControls.js', 'examples/js/environments/RoomEnvironment.js']) await load(CDN + f);
      try { await document.fonts.ready; } catch (e) {}
      viewer = await P.mount(THREE, stage, {
        layout: layout || undefined, view: 'three',
        onChange: l => { layout = l; keep(); refresh(); },
        onSelect: info => { selected = info; renderSel(); renderList(); }
      });
      $('loading').hidden = true; refresh();
    } catch (e) { $('loading').textContent = 'The planner did not load. Reload the page to try again.'; }
  })();

  document.querySelector('.bar[aria-label="Views"]').addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if (!b || !viewer) return;
    viewer.view(b.dataset.v);
    document.querySelectorAll('button[data-v]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  });
  $('snap').addEventListener('click', () => {
    const on = $('snap').getAttribute('aria-pressed') !== 'true';
    $('snap').setAttribute('aria-pressed', String(on)); if (viewer) viewer.editor.setSnap(on);
  });
  $('addRow').addEventListener('click', e => {
    const b = e.target.closest('button[data-add]'); if (!b || !viewer) return;
    if (!viewer.editor.add(b.dataset.add)) say('Sixty pieces at most');
  });
  const ed = () => viewer && viewer.editor;
  $('selR').addEventListener('input', e => { $('selROut').textContent = e.target.value + '°'; ed() && ed().update(null, { r: -e.target.value * Math.PI / 180 }); });
  $('turn90').addEventListener('click', () => ed() && selected && ed().update(null, { r: (selected.r || 0) - Math.PI / 2 }));
  $('selW').addEventListener('change', e => ed() && ed().update(null, { w: +e.target.value }));
  $('selFace').addEventListener('change', e => ed() && ed().update(null, { face: e.target.value }));
  $('selFin').addEventListener('change', e => ed() && ed().update(null, { finish: e.target.value }));
  $('selForm').addEventListener('change', e => ed() && ed().update(null, { form: e.target.value }));
  $('selDup').addEventListener('click', () => ed() && ed().duplicate());
  $('selDel').addEventListener('click', () => ed() && ed().remove());
  $('selNone').addEventListener('click', () => ed() && ed().select(null));
  let armed = 0;
  $('reset').addEventListener('click', () => {
    const r = $('reset'); if (!ed()) return;
    if (!armed) { r.textContent = 'Press again to clear your layout'; r.classList.add('dark'); armed = setTimeout(() => { armed = 0; r.textContent = 'Back to the starting layout'; r.classList.remove('dark'); }, 4000); return; }
    clearTimeout(armed); armed = 0; r.textContent = 'Back to the starting layout'; r.classList.remove('dark');
    ed().setLayout(ed().defaults()); layout = ed().layout(); keep(); refresh();
  });
  document.addEventListener('keydown', e => {
    if (!selected || !ed() || e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input,select,textarea')) return;
    const step = $('snap').getAttribute('aria-pressed') === 'true' ? .05 : .01;
    const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (mv) { ed().update(null, { x: selected.x + mv[0], z: selected.z + mv[1] }); e.preventDefault(); }
    else if (e.key === 'r' || e.key === 'R') { ed().update(null, { r: (selected.r || 0) + (e.shiftKey ? 1 : -1) * Math.PI / 12 }); e.preventDefault(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { ed().remove(); e.preventDefault(); }
    else if (e.key === 'Escape') ed().select(null);
  });

  const opt = (sel, list, value) => sel.replaceChildren(...list.map(([v, label]) => { const o = document.createElement('option'); o.value = v; o.textContent = label; o.selected = String(v) === String(value); return o; }));
  const mm = v => Math.round(v * 1000).toLocaleString('en');
  function renderSel() {
    const s = selected; $('sel').hidden = !s; if (!s) return;
    $('selName').textContent = s.name;
    $('selSize').textContent = `${mm(s.size[0])} × ${mm(s.size[1])} mm, ${mm(s.height)} high`;
    let deg = Math.round(-(s.r || 0) * 180 / Math.PI) % 360; if (deg > 180) deg -= 360; if (deg < -180) deg += 360;
    if (document.activeElement !== $('selR')) $('selR').value = deg; $('selROut').textContent = deg + '°';
    const board = s.type === 'board';
    $('wWrap').hidden = $('faceWrap').hidden = $('finWrap').hidden = !board; $('formWrap').hidden = s.type !== 'counter';
    if (board) {
      opt($('selW'), P.BOARD_WIDTHS.map(w => [w, mm(w) + ' mm']), s.w);
      opt($('selFace'), Object.entries(P.BOARD_FACES), s.face);
      opt($('selFin'), Object.entries(P.BOARD_FINISHES), s.finish);
    }
    if (s.type === 'counter') opt($('selForm'), Object.entries(P.COUNTER_FORMS).map(([k, f]) => [k, f.name]), s.form);
  }
  function refresh() { renderList(); renderSel(); }
  function renderList() {
    if (!viewer) return;
    const list = viewer.editor.layout(), names = viewer.editor.names(), clash = new Set(viewer.editor.clashes());
    const counts = {}; list.forEach(d => counts[d.type] = (counts[d.type] || 0) + 1);
    const word = { board: ['sample board', 'sample boards'], counter: ['counter', 'counters'], table: ['table', 'tables'], chair: ['chair', 'chairs'], plant: ['plant', 'plants'] };
    const summary = Object.keys(word).filter(k => counts[k]).map(k => counts[k] + ' ' + word[k][counts[k] > 1 ? 1 : 0]).join(' · ');
    $('listSum').textContent = summary ? '· ' + summary : '';
    $('countFact').textContent = list.length; $('countSub').textContent = list.length === 1 ? 'piece in the booth' : 'pieces in the booth';
    $('items').replaceChildren(...list.map(d => {
      const li = document.createElement('li');
      const a = document.createElement('button'); a.type = 'button'; a.className = 'it' + (clash.has(d.id) ? ' clash' : '');
      a.append(names[d.id] + ' ', Object.assign(document.createElement('span'), { textContent: (clash.has(d.id) ? '· overlaps · ' : '· ') + `${mm(d.x + P.BW / 2)} from the left, ${mm(P.BD / 2 - d.z)} from the aisle` }));
      a.setAttribute('aria-current', String(!!selected && selected.id === d.id));
      a.addEventListener('click', () => viewer.editor.select(d.id));
      const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.textContent = 'Remove'; x.setAttribute('aria-label', 'Remove ' + names[d.id]);
      x.addEventListener('click', () => viewer.editor.remove(d.id));
      li.append(a, x); return li;
    }));
    const n = clash.size; $('warn').hidden = !n; $('warn').textContent = n ? `${n} pieces overlap: they are outlined in red.` : '';
    const area = list.reduce((s, d) => s + P.KINDS[d.type].size(d).reduce((a, b) => a * b), 0), total = P.BW * P.BD;
    $('floorUse').textContent = `The pieces cover about ${area.toFixed(1)} m² of the ${total.toFixed(1)} m² floor (${Math.round(area / total * 100)}%), leaving about ${(total - area).toFixed(1)} m² to walk and stand in. Distances in the list are to the middle of each piece.`;
  }
})();
