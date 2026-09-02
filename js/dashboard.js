/* ============================================================
   dashboard.js — Dashboard-Rendering (Header, Kategorien, Charts, Snapshots)
   Teil der Vermögensaufstellung — automatisch aus index.html ausgelagert.
   ============================================================ */

/* ============================================================
   HELP POPOVERS
   ============================================================ */
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.helpbtn');
  if (btn){
    const id = btn.dataset.help;
    const pop = document.getElementById(id);
    if (!pop) return;
    const willShow = !pop.classList.contains('show');
    document.querySelectorAll('.help-pop.show').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.helpbtn.active').forEach(b => b.classList.remove('active'));
    if (willShow){ pop.classList.add('show'); btn.classList.add('active'); }
    return;
  }
  if (!ev.target.closest('.help-pop')){
    document.querySelectorAll('.help-pop.show').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.helpbtn.active').forEach(b => b.classList.remove('active'));
  }
});

/* ============================================================
   RENDER: HEADER / TOTAL / DELTA
   ============================================================ */
function renderTotal(){
  const money = moneyTotal();
  const tang = tangibleTotal();
  document.getElementById('total-value').innerHTML = fmtEUR.format(money).replace(/(,\d+)(\s?€)/, '<span class="cents">$1$2</span>');

  // Zweite Zeile: Gesamtwert inkl. Sachwerte — nur zeigen, wenn Sachwerte vorhanden.
  const inclWrap = document.getElementById('total-incl');
  if (inclWrap){
    if (tang > 0.005){
      inclWrap.style.display = '';
      document.getElementById('total-incl-value').textContent = fmtEUR.format(money + tang);
    } else {
      inclWrap.style.display = 'none';
    }
  }

  const last = lastSnapshot();
  const el = document.getElementById('total-delta');
  if (!last){
    el.className = 'delta flat';
    el.innerHTML = '<span class="arrow">·</span><span class="abs">Noch kein Snapshot</span><span class="sep">·</span><span class="pct">—</span>';
    return;
  }
  const base = snapshotMoneyValue(last);
  const d = money - base;
  const p = base === 0 ? 0 : (d / base) * 100;
  const dir = d > 0.005 ? 'up' : d < -0.005 ? 'down' : 'flat';
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·';
  const sign = d >= 0 ? '+' : '−';
  el.className = 'delta ' + dir;
  el.innerHTML = `<span class="arrow">${arrow}</span><span class="abs">${sign}${fmtEUR.format(Math.abs(d))}</span><span class="sep">/</span><span class="pct">${sign}${fmtPct.format(Math.abs(p))}\u00a0%</span>`;
}

/* ============================================================
   RENDER: CATEGORIES (accordion)
   ============================================================ */
function renderAccordion(){
  const root = document.getElementById('accordion');
  root.innerHTML = '';
  const t = total();
  const last = lastSnapshot();

  // Compute per-entry deltas against latest snapshot
  // and identify global winner/loser
  let totalEntries = 0;
  const deltas = {}; // entryId -> abs delta
  if (last && last.entries){
    for (const c of CATS) for (const e of state.entries[c.id]){
      const prev = last.entries[e.id];
      if (prev !== undefined && prev !== null){
        deltas[e.id] = (Number(e.value)||0) - Number(prev);
      }
    }
  }
  let winnerId = null, loserId = null;
  if (last){
    let maxD = 0, minD = 0;
    for (const [id, d] of Object.entries(deltas)){
      if (d > maxD){ maxD = d; winnerId = id; }
      if (d < minD){ minD = d; loserId = id; }
    }
  }

  for (const c of CATS){
    const sum = catSum(c.id);
    const share = t > 0 ? (sum/t*100) : 0;
    const open = !!state.settings.openCats[c.id];
    const section = document.createElement('div');
    section.className = 'cat' + (open ? ' open':'');
    section.dataset.cat = c.id;

    section.innerHTML = `
      <div class="cat-head" data-toggle="${c.id}">
        <span class="chev"></span>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="cat-sw ${c.sw}"></span>
          <span class="cat-title">${c.label}</span>
        </div>
        <span class="cat-sum mono">${fmtEUR.format(sum)}</span>
        <span class="cat-share mono">${fmtPct.format(share)}\u00a0%</span>
      </div>
      <div class="cat-body">
        <table class="entries">
          <thead><tr>
            <th style="width:44%">Position</th>
            <th class="r" style="width:18%">Wert</th>
            <th class="r" style="width:18%">Δ letzter Snapshot</th>
            <th class="r" style="width:14%">Sparrate / Monat</th>
            <th class="r" style="width:120px">Aktionen</th>
          </tr></thead>
          <tbody></tbody>
        </table>
        <div class="cat-foot">
          <span class="count mono">${state.entries[c.id].length} Position(en) · ${fmtEUR.format(state.entries[c.id].reduce((a,e)=>a+(Number(e.sparrate)||0),0))} / Mo</span>
          <button class="add-btn" data-add="${c.id}">+ Eintrag hinzufügen</button>
        </div>
      </div>
    `;
    const tbody = section.querySelector('tbody');
    for (const e of state.entries[c.id]){
      totalEntries++;
      const tr = document.createElement('tr');
      tr.className = 'entry';
      tr.dataset.id = e.id;
      tr.dataset.cat = c.id;
      const isEmpty = !e.value || e.value === 0;
      const delta = deltas[e.id];
      let deltaCell = '<span class="delta-cell none">—</span>';
      if (delta !== undefined){
        const dir = delta > 0.005 ? 'up' : delta < -0.005 ? 'down' : 'flat';
        const arrow = dir==='up'?'▲':dir==='down'?'▼':'·';
        const sign = delta >= 0 ? '+' : '−';
        deltaCell = `<span class="delta-cell ${dir}">${arrow}\u00a0${sign}${fmtEUR.format(Math.abs(delta))}</span>`;
      }
      const isWinner = e.id === winnerId && delta > 0.005;
      const isLoser = e.id === loserId && delta < -0.005;
      const sparEmpty = !e.sparrate || e.sparrate === 0;
      const noteOn = e.note && e.note.trim().length;
      tr.innerHTML = `
        <td>
          <div class="ename">
            <span class="ename-text">${escapeHtml(e.name)}</span>
            ${isWinner ? '<span class="winner">★ Gewinner</span>' : ''}
            ${isLoser ? '<span class="loser">▼ Verlierer</span>' : ''}
            ${noteOn ? `<span class="ename-note">${escapeHtml(e.note)}</span>` : ''}
          </div>
        </td>
        <td class="r"><span class="eval mono ${isEmpty?'empty':''}" data-edit="${e.id}" data-cat="${c.id}">${fmtEUR.format(e.value||0)}</span></td>
        <td class="r">${deltaCell}</td>
        <td class="r"><span class="spar-cell mono ${sparEmpty?'empty':''}" data-spar="${e.id}" data-cat="${c.id}">${sparEmpty?'+ Rate':fmtEUR.format(e.sparrate)}</span></td>
        <td class="actions">
          <button class="iconbtn ${noteOn?'note-on':''}" title="Notiz bearbeiten" data-note="${e.id}" data-cat="${c.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
          </button>
          <button class="iconbtn" title="Umbenennen" data-rename="${e.id}" data-cat="${c.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M4 20h4l10-10-4-4L4 16v4z"/></svg>
          </button>
          <button class="iconbtn danger" title="Löschen" data-del="${e.id}" data-cat="${c.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    }
    root.appendChild(section);
  }
  document.getElementById('entries-count').textContent = totalEntries + ' Einträge';
}

/* ACCORDION INTERACTIONS */
document.getElementById('accordion').addEventListener('click', (ev) => {
  const t = ev.target;
  const toggle = t.closest('[data-toggle]');
  const editVal = t.closest('[data-edit]');
  const delBtn = t.closest('[data-del]');
  const renameBtn = t.closest('[data-rename]');
  const addBtn = t.closest('[data-add]');
  const sparBtn = t.closest('[data-spar]');
  const noteBtn = t.closest('[data-note]');
  if (editVal){ ev.stopPropagation(); startEdit(editVal); return; }
  if (delBtn){ ev.stopPropagation(); doDelete(delBtn.dataset.cat, delBtn.dataset.del); return; }
  if (renameBtn){ ev.stopPropagation(); startRename(renameBtn.dataset.cat, renameBtn.dataset.rename); return; }
  if (sparBtn){ ev.stopPropagation(); startSparEdit(sparBtn); return; }
  if (noteBtn){ ev.stopPropagation(); startNoteEdit(noteBtn.dataset.cat, noteBtn.dataset.note); return; }
  if (addBtn){ ev.stopPropagation(); showAddForm(addBtn); return; }
  if (toggle){
    const id = toggle.dataset.toggle;
    state.settings.openCats[id] = !state.settings.openCats[id];
    saveState();
    renderAccordion();
  }
});

function startEdit(span){
  const id = span.dataset.edit;
  const catId = span.dataset.cat;
  const entry = state.entries[catId].find(e => e.id === id);
  if (!entry) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.className = 'eval-input mono';
  input.value = entry.value ? fmtNum2.format(entry.value) : '';
  input.placeholder = '0,00';
  span.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    entry.value = parseNum(input.value);
    saveState();
    renderAll();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape'){ done = true; renderAll(); }
  });
}

function startSparEdit(span){
  const id = span.dataset.spar;
  const catId = span.dataset.cat;
  const entry = state.entries[catId].find(e => e.id === id);
  if (!entry) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.className = 'spar-input mono';
  input.value = entry.sparrate ? fmtNum2.format(entry.sparrate) : '';
  input.placeholder = '0,00';
  span.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    entry.sparrate = parseNum(input.value);
    saveState();
    renderAll();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape'){ done = true; renderAll(); }
  });
}

function startNoteEdit(catId, entryId){
  const entry = state.entries[catId].find(e => e.id === entryId);
  if (!entry) return;
  const tr = document.querySelector(`tr.entry[data-id="${entryId}"]`);
  if (!tr) return;
  const cell = tr.querySelector('.ename');
  // open inline note editor below the row
  const existing = tr.nextSibling;
  if (existing && existing.classList && existing.classList.contains('note-edit-row')){
    existing.remove();
    return;
  }
  const editRow = document.createElement('tr');
  editRow.className = 'note-edit-row';
  editRow.innerHTML = `
    <td colspan="5" style="padding:8px 14px;background:var(--bg-1);border-bottom:1px solid var(--line)">
      <input type="text" class="note-input-row" placeholder="Notiz zu &quot;${escapeHtml(entry.name)}&quot; (z. B. Strategie, Sparplan-Info, Zinssatz, …)" value="${escapeHtml(entry.note||'')}" maxlength="200">
    </td>
  `;
  tr.parentNode.insertBefore(editRow, tr.nextSibling);
  const input = editRow.querySelector('input');
  input.focus();
  input.select();
  let done = false;
  const commit = (cancel) => {
    if (done) return;
    done = true;
    if (!cancel){
      entry.note = input.value.trim();
      saveState();
    }
    renderAll();
  };
  input.addEventListener('blur', () => commit(false));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit(false);
    else if (e.key === 'Escape') commit(true);
  });
}

function startRename(catId, entryId){
  const entry = state.entries[catId].find(e => e.id === entryId);
  if (!entry) return;
  const tr = document.querySelector(`tr.entry[data-id="${entryId}"]`);
  if (!tr) return;
  const nameSpan = tr.querySelector('.ename-text');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'eval-input';
  input.style.width = '220px';
  input.style.textAlign = 'left';
  input.style.fontFamily = "'Inter'";
  input.value = entry.name;
  nameSpan.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const commit = (cancel) => {
    if (done) return;
    done = true;
    if (!cancel){ const v = input.value.trim(); if (v){ entry.name = v; saveState(); } }
    renderAll();
  };
  input.addEventListener('blur', () => commit(false));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit(false);
    else if (e.key === 'Escape') commit(true);
  });
}

function doDelete(catId, entryId){
  const arr = state.entries[catId];
  const idx = arr.findIndex(e => e.id === entryId);
  if (idx < 0) return;
  const entry = arr[idx];
  if (!confirm(`Eintrag „${entry.name}" wirklich löschen?`)) return;
  arr.splice(idx,1);
  saveState();
  renderAll();
}

function showAddForm(btn){
  const cat = btn.dataset.add;
  const foot = btn.closest('.cat-foot');
  const existing = foot.parentElement.querySelector('.addform');
  if (existing){ existing.remove(); foot.parentElement.querySelector('.addform-note')?.remove(); return; }
  const form = document.createElement('div');
  form.className = 'addform';
  form.innerHTML = `
    <input type="text" class="nm" placeholder="Bezeichnung (z. B. ETF World)">
    <input type="text" class="val mono" placeholder="Wert (0,00 €)" inputmode="decimal">
    <input type="text" class="spar mono" placeholder="Sparrate / Mo" inputmode="decimal">
    <button class="btn primary">Hinzufügen</button>
    <button class="btn" data-cancel>Abbrechen</button>
  `;
  const noteWrap = document.createElement('div');
  noteWrap.className = 'addform-note';
  noteWrap.innerHTML = `<textarea class="nt" placeholder="Optionale Notiz zu diesem Asset (z. B. &quot;Auszahlplan ab 2030&quot;, &quot;Zinssatz 3,5 %&quot;)" maxlength="200"></textarea>`;
  foot.parentElement.insertBefore(form, foot);
  foot.parentElement.insertBefore(noteWrap, foot);
  const nm = form.querySelector('.nm');
  const vl = form.querySelector('.val');
  const sp = form.querySelector('.spar');
  const nt = noteWrap.querySelector('.nt');
  nm.focus();
  const submit = () => {
    const name = nm.value.trim();
    if (!name){ nm.focus(); nm.style.borderColor = 'var(--red)'; return; }
    state.entries[cat].push({
      id: uid(), name,
      value: parseNum(vl.value),
      note: nt.value.trim(),
      sparrate: parseNum(sp.value),
    });
    saveState();
    renderAll();
  };
  form.querySelector('.btn.primary').addEventListener('click', submit);
  form.querySelector('[data-cancel]').addEventListener('click', () => { form.remove(); noteWrap.remove(); });
  [nm,vl,sp,nt].forEach(i => i.addEventListener('keydown', e => {
    if (e.key === 'Enter' && i !== nt) submit();
    else if (e.key === 'Escape'){ form.remove(); noteWrap.remove(); }
  }));
}

/* ============================================================
   ALLOCATION DONUT + LEGEND
   ============================================================ */
let donutChart;
const donutLabelsPlugin = {
  id: 'donutLabels',
  afterDatasetsDraw(chart, args, opts){
    if (chart.config.type !== 'doughnut') return;
    if (opts && opts.disabled) return;
    const {ctx} = chart;
    const meta = chart.getDatasetMeta(0);
    const data = chart.data.datasets[0].data;
    const tot = data.reduce((a,b)=>a+(Number(b)||0),0);
    if (tot <= 0) return;
    ctx.save();
    ctx.font = "600 12.5px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < meta.data.length; i++){
      const arc = meta.data[i];
      const val = Number(data[i])||0;
      const pct = (val/tot)*100;
      if (pct < 3) continue;
      const {x,y,startAngle,endAngle,outerRadius,innerRadius} = arc.getProps(['x','y','startAngle','endAngle','outerRadius','innerRadius'], true);
      const mid = (startAngle + endAngle) / 2;
      const r = (outerRadius + innerRadius) / 2;
      const label = Math.round(pct) + '\u00a0%';
      // Segment zu schmal f\u00fcr das Label? Dann lieber weglassen als quetschen \u2014
      // die Legende darunter zeigt den exakten Wert ohnehin.
      const arcLen = (endAngle - startAngle) * r;
      if (ctx.measureText(label).width > arcLen * 0.80) continue;
      const lx = x + Math.cos(mid) * r;
      const ly = y + Math.sin(mid) * r;
      ctx.shadowColor = 'rgba(4,16,28,.6)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, lx, ly);
      ctx.shadowColor = 'transparent';
    }
    ctx.restore();
  }
};
const donutCenterPlugin = {
  id: 'donutCenter',
  afterDraw(chart, args, opts){
    if (chart.config.type !== 'doughnut') return;
    if (opts && opts.disabled) return;
    const {ctx, chartArea} = chart;
    if (!chartArea) return;
    const data = chart.data.datasets[0].data;
    const tot = data.reduce((a,b)=>a+(Number(b)||0),0);
    if (tot <= 0) return;
    const cx = (chartArea.left + chartArea.right) / 2;
    const cy = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#6b7280'; ctx.font = "500 9.5px 'Inter', system-ui, sans-serif";
    ctx.fillText('GESAMT', cx, cy - 14);
    ctx.fillStyle = '#0b0d12'; ctx.font = "600 16px 'JetBrains Mono', ui-monospace, monospace";
    const lbl = tot >= 1_000_000 ? (tot/1_000_000).toFixed(2).replace('.',',') + '\u00a0Mio\u00a0€'
              : tot >= 100_000 ? Math.round(tot/1000) + '.000\u00a0€'
              : fmtEUR0.format(tot);
    ctx.fillText(lbl, cx, cy + 5);
    ctx.restore();
  }
};
Chart.register(donutLabelsPlugin, donutCenterPlugin);

function renderAllocation(){
  const sums = CATS.map(c => ({ ...c, sum: catSum(c.id) }));
  const t = sums.reduce((a,b)=>a+b.sum,0);
  const legend = document.getElementById('alloc-legend');
  legend.innerHTML = '';
  for (const s of sums){
    const pct = t > 0 ? (s.sum/t*100) : 0;
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <span class="sw ${s.sw}"></span>
      <span class="name">${s.label}</span>
      <span class="pct mono">${fmtPct.format(pct)}\u00a0%</span>
      <span class="val mono">${fmtEUR.format(s.sum)}</span>
    `;
    legend.appendChild(row);
  }
  const empty = document.getElementById('donut-empty');
  if (empty) empty.style.display = (t <= 0) ? '' : 'none';

  const ctx = document.getElementById('donut-chart');
  const data = sums.map(s => s.sum);
  const colors = sums.map(s => s.color);
  const allZero = t === 0;
  const finalData = allZero ? [1,1,1] : data;
  if (donutChart){
    donutChart.data.datasets[0].data = finalData;
    donutChart.data.datasets[0].backgroundColor = allZero ? ['#d1d5dc','#d1d5dc','#d1d5dc'] : colors;
    donutChart.options.plugins.donutLabels = { disabled: allZero };
    donutChart.options.plugins.donutCenter = { disabled: allZero };
    donutChart.update('none');
    return;
  }
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sums.map(s => s.label),
      datasets: [{
        data: finalData,
        backgroundColor: allZero ? ['#d1d5dc','#d1d5dc','#d1d5dc'] : colors,
        borderColor: '#ffffff', borderWidth: 2, hoverOffset: 6,
      }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'62%', layout:{ padding: 4 },
      plugins:{
        legend:{display:false},
        donutLabels:{ disabled: allZero },
        donutCenter:{ disabled: allZero },
        tooltip:{
          backgroundColor:'#0b0d12', borderColor:'#454a52', borderWidth:1,
          titleFont:{family:'Inter',size:11,weight:'600'}, bodyFont:{family:'Inter',size:12},
          padding:10, displayColors:false,
          callbacks:{ label:(c) => {
            if (allZero) return '—';
            const v = c.parsed; const tt = data.reduce((a,b)=>a+b,0);
            const pct = tt>0?(v/tt*100):0;
            return ` ${fmtEUR.format(v)}  ·  ${fmtPct.format(pct)} %`;
          }}
        }
      }
    }
  });
}

/* ============================================================
   HISTORY LINE CHART
   ============================================================ */
let lineChart;
let currentRange = 'ALL';
function rangeStart(range){
  if (range === 'ALL') return 0;
  const now = Date.now();
  const map = { '3M':90, '6M':180, '1Y':365, '3Y':365*3, '5Y':365*5 };
  return now - (map[range]||0) * 86400000;
}
/* Weicher Leuchtpunkt am aktuellen Wert — nur für den Verlaufschart */
const lineGlowPlugin = {
  id: 'lineGlow',
  afterDatasetsDraw(chart){
    if (chart.canvas.id !== 'line-chart') return;
    const meta = chart.getDatasetMeta(0);
    const point = meta && meta.data[meta.data.length - 1];
    if (!point) return;
    const {ctx} = chart;
    ctx.save();
    const r = 16;
    const g = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, r);
    g.addColorStop(0, 'rgba(5,80,208,.35)');
    g.addColorStop(1, 'rgba(5,80,208,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};
Chart.register(lineGlowPlugin);
function renderLineChart(){
  const ctx = document.getElementById('line-chart');
  const snaps = [...state.snapshots].sort((a,b)=>new Date(a.t)-new Date(b.t));
  const fromTs = rangeStart(currentRange);
  let filtered = snaps.filter(s => new Date(s.t).getTime() >= fromTs);
  const empty = document.getElementById('line-empty');
  if (empty) empty.style.display = filtered.length ? 'none' : '';
  const labels = filtered.map(s => fmtDate.format(new Date(s.t)));
  const values = filtered.map(s => s.value);
  if (filtered.length){
    labels.push('jetzt');
    values.push(total());
  }
  const datasets = [{
    label:'Vermögen', data: values, borderColor:'#0550d0',
    backgroundColor:(c)=>{ const {chart}=c;const {ctx,chartArea}=chart;
      if (!chartArea) return 'rgba(5,80,208,.04)';
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0,'rgba(5,80,208,.20)'); g.addColorStop(1,'rgba(5,80,208,0)'); return g; },
    fill:true, cubicInterpolationMode:'monotone', borderWidth:2.5,
    borderCapStyle:'round', borderJoinStyle:'round',
    pointRadius:(c)=> c.dataIndex === values.length-1 ? 5 : 2.5,
    pointHoverRadius:6, pointHitRadius:10,
    pointBackgroundColor:(c)=> c.dataIndex === values.length-1 ? '#0550d0' : '#ffffff',
    pointBorderColor:'#0550d0', pointBorderWidth:1.5,
  }];
  if (lineChart){
    lineChart.data.labels = labels;
    lineChart.data.datasets = datasets;
    lineChart.update('none');
    return;
  }
  lineChart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ display:false },
        tooltip:{
          backgroundColor:'#0b0d12', borderColor:'#454a52', borderWidth:1,
          titleFont:{family:'Inter',size:11,weight:'600'}, bodyFont:{family:'Inter',size:12},
          padding:10, displayColors:false,
          callbacks:{
            label:(c)=> `  ${fmtEUR.format(c.parsed.y)}`,
            afterBody:(items) => {
              const i = items[0].dataIndex;
              const snap = filtered[i];
              if (snap && snap.note) return '\n„' + snap.note + '"';
              return '';
            }
          }
        }
      },
      scales:{
        x:{ grid:{ display:false }, border:{display:false}, ticks:{ color:'#6b7280', font:{family:'Inter',size:10}, maxRotation:0, autoSkipPadding:18, maxTicksLimit:8 } },
        y:{ grid:{ color:'rgba(11,13,18,.05)', drawTicks:false }, border:{display:false}, ticks:{ color:'#6b7280', font:{family:'Inter',size:10}, padding:8, maxTicksLimit:5, callback:(v)=> fmtEUR0.format(v) } }
      }
    }
  });
}

document.getElementById('range-seg').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-range]');
  if (!b) return;
  document.querySelectorAll('#range-seg button').forEach(x=>x.classList.toggle('on', x===b));
  currentRange = b.dataset.range;
  renderLineChart();
});

/* snapshot save flow */
const snapSave = document.getElementById('snap-save');
const snapNoteInput = document.getElementById('snap-note-input');
document.getElementById('snap-btn').addEventListener('click', () => {
  snapNoteInput.value = '';
  snapSave.classList.add('show');
  snapNoteInput.focus();
});
document.getElementById('snap-cancel').addEventListener('click', () => snapSave.classList.remove('show'));
document.getElementById('snap-confirm').addEventListener('click', commitSnapshot);
snapNoteInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') commitSnapshot();
  else if (e.key === 'Escape') snapSave.classList.remove('show');
});
function commitSnapshot(){
  const v = total();
  const entriesMap = {};
  for (const c of CATS) for (const e of state.entries[c.id]) entriesMap[e.id] = Number(e.value)||0;
  const snap = {
    id: uid(),
    t: new Date().toISOString(),
    value: v,
    note: snapNoteInput.value.trim(),
    entries: entriesMap,
    breakdown: Object.fromEntries(CATS.map(c => [c.id, catSum(c.id)])),
  };
  state.snapshots.push(snap);
  saveState();
  snapSave.classList.remove('show');
  renderAll();
}

/* ============================================================
   SCENARIO PROJECTION (3 lines)
   ============================================================ */
let scenChart;
const scenRealToggle = document.getElementById('scen-real');
scenRealToggle.classList.toggle('on', !!state.settings.scenarioReal);
scenRealToggle.addEventListener('click', () => {
  state.settings.scenarioReal = !state.settings.scenarioReal;
  scenRealToggle.classList.toggle('on', state.settings.scenarioReal);
  saveState();
  renderScenario();
});
['scen-start','scen-rate','scen-years','scen-inf'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => renderScenario());
});
function syncScenarioAutoInputs(){
  // Only auto-fill if field is empty/zero
  const startEl = document.getElementById('scen-start');
  if (parseNum(startEl.value) === 0) startEl.value = fmtNum2.format(total());
  const rateEl = document.getElementById('scen-rate');
  if (parseNum(rateEl.value) === 0){
    const ts = totalSparrate();
    if (ts > 0) rateEl.value = fmtNum2.format(ts);
  }
  const infEl = document.getElementById('scen-inf');
  if (parseNum(infEl.value) === 0) infEl.value = fmtPct.format(state.settings.inflationRate);
}
function projectFV(start, monthlyRate, years, ratePa){
  // Monthly compounded; contributions at end of month
  const i = ratePa/12;
  const months = Math.round(years*12);
  const arr = new Array(years+1);
  let bal = start;
  arr[0] = bal;
  let m = 0;
  for (let y = 1; y <= years; y++){
    for (let k = 0; k < 12; k++){
      bal = bal * (1 + i) + monthlyRate;
      m++;
    }
    arr[y] = bal;
  }
  return arr;
}
function renderScenario(){
  syncScenarioAutoInputs();
  const start = parseNum(document.getElementById('scen-start').value);
  const rate  = parseNum(document.getElementById('scen-rate').value);
  const years = Math.max(1, Math.round(parseNum(document.getElementById('scen-years').value)));
  const inf   = parseNum(document.getElementById('scen-inf').value)/100;
  state.settings.inflationRate = parseNum(document.getElementById('scen-inf').value);
  saveState();

  const labels = []; for (let y=0;y<=years;y++) labels.push('+' + y + ' J');
  const opt  = projectFV(start, rate, years, 0.10);
  const real = projectFV(start, rate, years, 0.06);
  const pess = projectFV(start, rate, years, 0.03);

  const datasets = [
    { label:'Optimistisch · 10 % p.a.', data:opt,  borderColor:'#16a34a', backgroundColor:'rgba(22,163,74,.06)', borderWidth:2, pointRadius:0, tension:.2, fill:false },
    { label:'Realistisch · 6 % p.a.',   data:real, borderColor:'#0550d0', backgroundColor:'rgba(5,80,208,.06)', borderWidth:2, pointRadius:0, tension:.2, fill:false },
    { label:'Pessimistisch · 3 % p.a.', data:pess, borderColor:'#dc2626', backgroundColor:'rgba(220,38,38,.05)', borderWidth:2, pointRadius:0, tension:.2, fill:false },
  ];
  const ctx = document.getElementById('scen-chart');
  if (scenChart){ scenChart.data.labels = labels; scenChart.data.datasets = datasets; scenChart.update('none'); }
  else scenChart = new Chart(ctx, { type:'line', data:{labels,datasets}, options:{
    responsive:true, maintainAspectRatio:false,
    interaction:{mode:'index',intersect:false},
    plugins:{
      legend:{ display:true, position:'bottom', align:'start', labels:{ color:'#6b7280', font:{family:'Inter',size:10.5,weight:'500'}, boxWidth:10, boxHeight:10, padding:10, usePointStyle:false } },
      tooltip:{ backgroundColor:'#0b0d12', borderColor:'#454a52', borderWidth:1, titleFont:{family:'Inter',size:11,weight:'600'}, bodyFont:{family:'Inter',size:11}, padding:9, displayColors:true, boxWidth:8, boxHeight:8,
        callbacks:{ label:(c)=> `  ${c.dataset.label}: ${fmtEUR0.format(c.parsed.y)}` } }
    },
    scales:{
      x:{ grid:{color:'rgba(11,13,18,.05)',drawTicks:false}, border:{display:false}, ticks:{color:'#6b7280',font:{family:'Inter',size:10},autoSkipPadding:18}},
      y:{ grid:{color:'rgba(11,13,18,.05)',drawTicks:false}, border:{display:false}, ticks:{color:'#6b7280',font:{family:'Inter',size:10},padding:6,callback:(v)=>fmtEUR0.format(v)}}
    }
  }});

  // results cells
  const realFactor = state.settings.scenarioReal ? Math.pow(1+inf, years) : 1;
  const endOpt  = opt[opt.length-1];
  const endReal = real[real.length-1];
  const endPess = pess[pess.length-1];
  const resHtml = `
    <div class="cell">
      <div class="k"><span class="sw swatch-pess"></span>Pessimistisch · 3 %</div>
      <div class="v">${fmtEUR0.format(endPess)}</div>
      ${state.settings.scenarioReal ? `<div class="vr">real: ${fmtEUR0.format(endPess/realFactor)}</div>` : `<div class="vr">+ ${fmtEUR0.format(endPess - start)} Zuwachs</div>`}
    </div>
    <div class="cell">
      <div class="k"><span class="sw swatch-real"></span>Realistisch · 6 %</div>
      <div class="v">${fmtEUR0.format(endReal)}</div>
      ${state.settings.scenarioReal ? `<div class="vr">real: ${fmtEUR0.format(endReal/realFactor)}</div>` : `<div class="vr">+ ${fmtEUR0.format(endReal - start)} Zuwachs</div>`}
    </div>
    <div class="cell">
      <div class="k"><span class="sw swatch-opt"></span>Optimistisch · 10 %</div>
      <div class="v">${fmtEUR0.format(endOpt)}</div>
      ${state.settings.scenarioReal ? `<div class="vr">real: ${fmtEUR0.format(endOpt/realFactor)}</div>` : `<div class="vr">+ ${fmtEUR0.format(endOpt - start)} Zuwachs</div>`}
    </div>
  `;
  document.getElementById('scen-result').innerHTML = resHtml;
}

/* ============================================================
   PORTFOLIO RADAR (6 dims)
   ============================================================ */
let radarChart;
function computeRadar(){
  const t = total();
  if (t <= 0) return null;
  const liq = catSum('LIQUIDE')/t;
  const kap = catSum('KAPITALMARKT')/t;
  const sac = catSum('SACHWERTE')/t;
  // Diversifikation across 3 classes (HHI normalized)
  const N = 3; const minHHI = 1/N;
  const hhi = liq*liq + kap*kap + sac*sac;
  const divScore = Math.max(0, Math.min(100, (1-(hhi-minHHI)/(1-minHHI))*100));
  // Wachstum: share of Kapitalmarkt
  const growth = kap*100;
  // Liquidität: Liquide-Anteil, but ceiling at 30% = 100 (keine ÜBER-Liquidität nötig)
  const liquidity = Math.min(100, liq*100/0.30 * 100);
  // Stabilität: Sachwerte + Festgeld
  let festgeld = 0;
  for (const e of state.entries.LIQUIDE) if (/festgeld/i.test(e.name)) festgeld += Number(e.value)||0;
  const stab = ((sac*t + festgeld)/t)*100;
  // Konzentration⁻¹: 100 if no single asset >30%, scaled
  let maxAsset = 0;
  for (const c of CATS) for (const e of state.entries[c.id]){
    const w = (Number(e.value)||0)/t; if (w > maxAsset) maxAsset = w;
  }
  // 0% asset => 100, 50% asset => 0
  const concInv = Math.max(0, Math.min(100, (1 - Math.min(1, maxAsset/0.5))*100));
  // Zielerreichung
  const target = Number(state.settings.target)||0;
  const reach = target > 0 ? Math.min(100, t/target*100) : 0;
  return {
    labels: ['Diversifikation', 'Wachstum', 'Liquidität', 'Stabilität', 'Konzentration⁻¹', 'Zielerreichung'],
    values: [divScore, growth, liquidity, stab, concInv, reach].map(v=>Math.round(v)),
  };
}
function renderRadar(){
  const ctx = document.getElementById('radar-chart');
  const r = computeRadar();
  const empty = document.getElementById('radar-empty');
  if (empty) empty.style.display = r ? 'none' : '';
  const labels = r ? r.labels : ['Diversifikation', 'Wachstum', 'Liquidität', 'Stabilität', 'Konzentration⁻¹', 'Zielerreichung'];
  const values = r ? r.values : [25,25,25,25,25,25];
  const data = {
    labels,
    datasets: [{
      label:'Portfolio',
      data: values,
      borderColor:'#0550d0',
      backgroundColor:'rgba(5,80,208,.14)',
      borderWidth:2,
      pointBackgroundColor:'#0550d0',
      pointRadius:3.5,
      pointHoverRadius:5,
    }]
  };
  if (radarChart){ radarChart.data = data; radarChart.update('none'); return; }
  radarChart = new Chart(ctx, {
    type:'radar', data,
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{ backgroundColor:'#0b0d12', borderColor:'#454a52', borderWidth:1, titleFont:{family:'Inter',size:11,weight:'600'}, bodyFont:{family:'Inter',size:12}, padding:10,
          callbacks:{ label:(c)=> '  Score: ' + c.parsed.r + ' / 100' } }
      },
      scales:{
        r:{
          min:0, max:100,
          angleLines:{ color:'rgba(11,13,18,.07)' },
          grid:{ color:'rgba(11,13,18,.05)' },
          pointLabels:{ color:'#454a52', font:{family:'Inter',size:12,weight:'500'}, padding:8 },
          ticks:{ display:false, stepSize:25, backdropColor:'transparent' },
        }
      }
    }
  });
}

/* ============================================================
   SPARRATEN OVERVIEW
   ============================================================ */
function renderSparOverview(){
  const allEntries = CATS.flatMap(c => state.entries[c.id].map(e => ({...e, cat:c}))).filter(e => Number(e.sparrate)>0);
  const total = allEntries.reduce((a,e)=>a+Number(e.sparrate),0);
  const perCat = Object.fromEntries(CATS.map(c => [c.id, 0]));
  for (const e of allEntries) perCat[e.cat.id] += Number(e.sparrate);
  const summary = document.getElementById('spar-summary');
  summary.innerHTML = `
    <div class="cell">
      <div class="k">Monatlich</div>
      <div class="v acid">${fmtEUR.format(total)}</div>
      <div class="vr">${allEntries.length} Sparpläne</div>
    </div>
    <div class="cell">
      <div class="k">Jährlich</div>
      <div class="v">${fmtEUR.format(total*12)}</div>
      <div class="vr">12 × Monatsrate</div>
    </div>
    <div class="cell">
      <div class="k">Auf 10 Jahre · ohne Zins</div>
      <div class="v muted">${fmtEUR0.format(total*12*10)}</div>
      <div class="vr">reine Einzahlungen</div>
    </div>
    <div class="cell">
      <div class="k">Auf 10 Jahre · 6 % Zinseszins</div>
      <div class="v">${fmtEUR0.format(projectFV(0, total, 10, 0.06)[10])}</div>
      <div class="vr">monatlicher Plan</div>
    </div>
  `;
  const list = document.getElementById('spar-list');
  list.innerHTML = '';
  if (!allEntries.length){
    list.innerHTML = '<div class="empty">Noch keine Sparraten hinterlegt. Klick in den Kategorien auf „+ Rate" hinter einem Asset.</div>';
    return;
  }
  for (const e of allEntries.sort((a,b)=>b.sparrate-a.sparrate)){
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <span class="sw ${e.cat.sw}"></span>
      <span class="name">${escapeHtml(e.name)}</span>
      <span class="cat">${e.cat.label}</span>
      <span class="v">${fmtEUR.format(e.sparrate)} / Mo</span>
    `;
    list.appendChild(row);
  }
}

/* ============================================================
   TARGET / ZIELWERT
   ============================================================ */
const targetInput = document.getElementById('target-input');
targetInput.value = state.settings.target ? fmtNum2.format(state.settings.target) : '';
targetInput.addEventListener('change', () => {
  state.settings.target = parseNum(targetInput.value);
  targetInput.value = state.settings.target ? fmtNum2.format(state.settings.target) : '';
  saveState();
  renderTarget();
  renderRadar();
});
targetInput.addEventListener('focus', () => targetInput.select());
function renderTarget(){
  const target = Number(state.settings.target)||0;
  const t = total();
  const bar = document.getElementById('target-bar');
  const pct = document.getElementById('target-pct');
  const meta = document.getElementById('target-meta');
  if (target <= 0){
    bar.style.width = '0%';
    pct.textContent = '—';
    meta.textContent = 'noch nicht gesetzt';
    return;
  }
  const p = Math.min(100, t/target*100);
  bar.style.width = p + '%';
  pct.textContent = fmtPct.format(p) + ' %';
  const missing = target - t;
  meta.textContent = missing > 0 ? `noch ${fmtEUR.format(missing)} bis zum Ziel` : `Ziel erreicht — Überschuss ${fmtEUR.format(-missing)}`;
}

/* ============================================================
   SNAPSHOT HISTORY
   ============================================================ */
function renderSnapshotList(){
  const root = document.getElementById('snap-list');
  root.innerHTML = '';
  const sorted = [...state.snapshots].sort((a,b)=>new Date(b.t)-new Date(a.t));
  document.getElementById('snap-count').textContent = sorted.length + (sorted.length===1?' Eintrag':' Einträge');
  if (!sorted.length){
    root.innerHTML = '<div class="snap-empty">Noch keine Snapshots — speichere oben deinen ersten Stand.</div>';
    return;
  }
  for (let i=0;i<sorted.length;i++){
    const s = sorted[i];
    const prev = sorted[i+1];
    let dir = 'flat', deltaTxt = '—';
    if (prev){
      const d = s.value - prev.value;
      const p = prev.value === 0 ? 0 : (d/prev.value*100);
      dir = d>0.005?'up':d<-0.005?'down':'flat';
      const sign = d>=0?'+':'−';
      deltaTxt = `${sign}${fmtEUR.format(Math.abs(d))} · ${sign}${fmtPct.format(Math.abs(p))} %`;
    }
    const row = document.createElement('div');
    row.className = 'snap-row';
    const noteHtml = s.note ? `<span class="note" data-note-snap="${s.id}" title="Notiz bearbeiten">„${escapeHtml(s.note)}"</span>`
                            : `<span class="note" data-note-snap="${s.id}" style="color:var(--ink-4)" title="Notiz hinzufügen">+ Notiz</span>`;
    row.innerHTML = `
      <span class="d">${fmtDateTime.format(new Date(s.t))}</span>
      ${noteHtml}
      <span class="dl ${dir}">${deltaTxt}</span>
      <span class="v">${fmtEUR.format(s.value)}</span>
      <button class="x" title="Snapshot löschen" data-snap-del="${s.id}">×</button>
    `;
    root.appendChild(row);
  }
}
document.getElementById('snap-list').addEventListener('click', (ev) => {
  const del = ev.target.closest('[data-snap-del]');
  if (del){
    const id = del.dataset.snapDel;
    if (!confirm('Snapshot wirklich löschen?')) return;
    state.snapshots = state.snapshots.filter(s => s.id !== id);
    saveState();
    renderAll();
    return;
  }
  const note = ev.target.closest('[data-note-snap]');
  if (note){
    const id = note.dataset.noteSnap;
    const snap = state.snapshots.find(s => s.id === id);
    if (!snap) return;
    const row = note.closest('.snap-row');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'note-input';
    input.value = snap.note || '';
    input.placeholder = 'Notiz zu diesem Snapshot…';
    input.maxLength = 200;
    note.replaceWith(input);
    input.focus(); input.select();
    let done = false;
    const commit = (cancel) => {
      if (done) return; done = true;
      if (!cancel){ snap.note = input.value.trim(); saveState(); }
      renderSnapshotList();
    };
    input.addEventListener('blur', () => commit(false));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') commit(false);
      else if (e.key === 'Escape') commit(true);
    });
  }
});

