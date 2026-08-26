/* ============================================================
   tools.js — Alle Finanz-Rechner-Tools (CAGR, Inflation, FIRE, Monte Carlo, …)
   Teil der Vermögensaufstellung — automatisch aus index.html ausgelagert.
   ============================================================ */

/* ============================================================
   TOOL A — CAGR
   ============================================================ */
function calcCAGR(){
  const s = parseNum(document.getElementById('cagr-start').value);
  const e = parseNum(document.getElementById('cagr-end').value);
  const y = parseNum(document.getElementById('cagr-years').value);
  const out = document.getElementById('cagr-out');
  const abs = document.getElementById('cagr-abs');
  const mult = document.getElementById('cagr-mult');
  if (s <= 0 || y <= 0){
    out.textContent='—'; abs.textContent='—'; mult.textContent='—';
    out.className='v muted'; abs.className='v muted'; return;
  }
  const cagr = (Math.pow(e/s, 1/y) - 1) * 100;
  const gain = e - s;
  out.textContent = (cagr>=0?'+':'−') + fmtPct.format(Math.abs(cagr)) + '\u00a0%';
  out.className = 'v ' + (cagr>=0?'up':'down');
  abs.textContent = (gain>=0?'+':'−') + fmtEUR.format(Math.abs(gain));
  abs.className = 'v ' + (gain>=0?'up':'down');
  mult.textContent = '×\u00a0' + fmtNum2.format(e/s);
}
['cagr-start','cagr-end','cagr-years'].forEach(id => document.getElementById(id).addEventListener('input', calcCAGR));

/* ============================================================
   TOOL B — Inflation
   ============================================================ */
function calcInflation(){
  const n = parseNum(document.getElementById('inf-nom').value);
  const r = parseNum(document.getElementById('inf-rate').value)/100;
  const y = parseNum(document.getElementById('inf-years').value);
  const real = n / Math.pow(1+r, y);
  const loss = n - real;
  const lp = n>0 ? (loss/n*100) : 0;
  document.getElementById('inf-real').textContent  = fmtEUR.format(real);
  document.getElementById('inf-loss').textContent  = '−' + fmtEUR.format(Math.abs(loss));
  document.getElementById('inf-lossp').textContent = '−' + fmtPct.format(Math.abs(lp)) + '\u00a0%';
}
['inf-nom','inf-rate','inf-years'].forEach(id => document.getElementById(id).addEventListener('input', calcInflation));

/* ============================================================
   TOOL C — Zielrechner
   ============================================================ */
function calcGoal(){
  const target = parseNum(document.getElementById('goal-target').value);
  const start  = parseNum(document.getElementById('goal-start').value);
  const rate   = parseNum(document.getElementById('goal-rate').value);
  const r      = parseNum(document.getElementById('goal-r').value)/100;
  const mOut = document.getElementById('goal-months');
  const dOut = document.getElementById('goal-date');
  const invOut = document.getElementById('goal-inv');
  if (target <= 0 || (rate <= 0 && start >= target)){
    mOut.textContent='—'; dOut.textContent='—'; invOut.textContent='—'; return;
  }
  if (start >= target){ mOut.textContent='0'; dOut.textContent=fmtDate.format(new Date()); invOut.textContent=fmtEUR.format(0); return; }
  if (rate <= 0){ mOut.textContent='—'; dOut.textContent='—'; invOut.textContent='—'; return; }
  // Solve n: target = start*(1+i)^n + rate*((1+i)^n -1)/i
  const i = r/12;
  let n;
  if (i === 0){
    n = (target - start) / rate;
  } else {
    const num = target * i + rate;
    const den = start * i + rate;
    if (den <= 0 || num/den <= 1){ mOut.textContent='—'; dOut.textContent='—'; invOut.textContent='—'; return; }
    n = Math.log(num/den) / Math.log(1+i);
  }
  if (!isFinite(n) || n <= 0){ mOut.textContent='—'; dOut.textContent='—'; invOut.textContent='—'; return; }
  const months = Math.ceil(n);
  const d = new Date(); d.setMonth(d.getMonth() + months);
  const years = Math.floor(months/12);
  const rem = months % 12;
  mOut.textContent = `${months}  ·  ${years} J ${rem} M`;
  dOut.textContent = fmtDate.format(d);
  invOut.textContent = fmtEUR.format(rate * months);
}
['goal-target','goal-start','goal-rate','goal-r'].forEach(id => document.getElementById(id).addEventListener('input', calcGoal));

/* ============================================================
   TOOL D — FIRE / Entnahme-Rechner
   ============================================================ */
let fireChart;
function calcFire(){
  const cap = parseNum(document.getElementById('fire-cap').value);
  const out = parseNum(document.getElementById('fire-out').value);
  const r   = parseNum(document.getElementById('fire-r').value)/100;
  const yEl = document.getElementById('fire-years');
  const dEl = document.getElementById('fire-date');
  const tEl = document.getElementById('fire-total');
  const ctx = document.getElementById('fire-chart');
  if (cap <= 0 || out <= 0){
    yEl.textContent='—'; dEl.textContent='—'; tEl.textContent='—';
    drawFireChart(ctx, [], []); return;
  }
  const i = r/12;
  // Check if sustainable: monthly return > monthly out → infinite
  if (i > 0 && cap*i >= out){
    yEl.innerHTML = '<span style="color:var(--positive)">∞ unbegrenzt</span>';
    yEl.className = 'v up';
    dEl.textContent = '—';
    tEl.textContent = 'Rendite deckt Entnahme';
    drawFireChart(ctx, [], []);
    return;
  }
  let bal = cap; let m = 0; const series = [bal]; const labels = ['0'];
  const max = 1200; // cap at 100 years
  while (bal > 0 && m < max){
    bal = bal*(1+i) - out;
    m++;
    if (m % 12 === 0 || bal <= 0){ series.push(Math.max(0,bal)); labels.push(Math.floor(m/12)+' J'); }
  }
  if (bal <= 0){
    yEl.textContent = `${Math.floor(m/12)} J ${m%12} M`;
    yEl.className = 'v';
    const d = new Date(); d.setMonth(d.getMonth()+m);
    dEl.textContent = fmtDate.format(d);
    tEl.textContent = fmtEUR0.format(out*m);
    drawFireChart(ctx, labels, series);
  } else {
    yEl.textContent = '> 100 Jahre';
    dEl.textContent = '—';
    tEl.textContent = '—';
    drawFireChart(ctx, labels, series);
  }
}
function drawFireChart(ctx, labels, data){
  if (fireChart){ fireChart.data.labels = labels; fireChart.data.datasets[0].data = data; fireChart.update('none'); return; }
  fireChart = new Chart(ctx, {
    type:'line', data:{labels, datasets:[{ data, borderColor:'#1e40af', backgroundColor:'rgba(30,64,175,.10)', fill:true, pointRadius:0, borderWidth:1.8, tension:.2 }]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#09090b',borderColor:'#3f3f46',borderWidth:1, titleFont:{family:'Inter',size:11},bodyFont:{family:'Inter',size:11},padding:8, callbacks:{ label:(c)=>' ' + fmtEUR0.format(c.parsed.y) } } },
      scales:{
        x:{ grid:{color:'rgba(9,9,11,.05)',drawTicks:false},border:{display:false},ticks:{color:'#71717a',font:{family:'Inter',size:9},autoSkipPadding:20}},
        y:{ grid:{color:'rgba(9,9,11,.05)',drawTicks:false},border:{display:false},ticks:{color:'#71717a',font:{family:'Inter',size:9},padding:4,callback:(v)=>fmtEUR0.format(v)}}
      }
    }
  });
}
['fire-cap','fire-out','fire-r'].forEach(id => document.getElementById(id).addEventListener('input', calcFire));

/* ============================================================
   TOOL E — Monte Carlo
   ============================================================ */
let mcChart;
let mcRunning = false;
function randn(){
  let u=0,v=0;
  while(u===0) u=Math.random();
  while(v===0) v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}
function pctile(sortedArr, p){
  const n = sortedArr.length;
  const i = (p/100)*(n-1);
  const lo = Math.floor(i), hi = Math.ceil(i);
  if (lo === hi) return sortedArr[lo];
  return sortedArr[lo] + (sortedArr[hi]-sortedArr[lo])*(i-lo);
}
async function runMC(){
  if (mcRunning) return;
  mcRunning = true;
  const start = parseNum(document.getElementById('mc-start').value);
  const rate  = parseNum(document.getElementById('mc-rate').value);
  const years = Math.max(1, Math.round(parseNum(document.getElementById('mc-years').value)));
  const mu    = parseNum(document.getElementById('mc-mu').value)/100;
  const sigma = Math.max(0, parseNum(document.getElementById('mc-sigma').value)/100);
  const target = parseNum(document.getElementById('mc-target').value);
  const PATHS = 1000;
  const months = years*12;
  const muM = mu/12;
  const sigmaM = sigma/Math.sqrt(12);
  // store full paths but only year-end values for chart
  const yearMatrix = []; // shape [PATHS][years+1]
  let successCount = 0;
  const progLabel = document.getElementById('mc-prog-label');
  const progFill = document.getElementById('mc-prog-fill');
  progLabel.textContent = 'läuft…';
  // run chunked to keep UI responsive
  const chunk = 80;
  for (let p = 0; p < PATHS; p += chunk){
    await new Promise(res => setTimeout(res, 0));
    const end = Math.min(PATHS, p+chunk);
    for (let k = p; k < end; k++){
      let bal = start;
      const row = new Array(years+1);
      row[0] = bal;
      for (let y = 1; y <= years; y++){
        for (let m = 0; m < 12; m++){
          const r = muM + sigmaM*randn();
          bal = bal*(1+r) + rate;
        }
        row[y] = bal;
      }
      yearMatrix.push(row);
      if (target > 0 && row[years] >= target) successCount++;
    }
    const pct = Math.round(end/PATHS*100);
    progFill.style.width = pct + '%';
    progLabel.textContent = pct + ' %';
  }
  // build percentile bands
  const labels = []; for (let y=0;y<=years;y++) labels.push('+' + y + ' J');
  const bands = { p10:[], p25:[], p50:[], p75:[], p90:[] };
  for (let y = 0; y <= years; y++){
    const col = yearMatrix.map(r => r[y]).sort((a,b)=>a-b);
    bands.p10.push(pctile(col,10));
    bands.p25.push(pctile(col,25));
    bands.p50.push(pctile(col,50));
    bands.p75.push(pctile(col,75));
    bands.p90.push(pctile(col,90));
  }
  drawMCChart(labels, bands);
  document.getElementById('mc-med').textContent = fmtEUR0.format(bands.p50[years]);
  document.getElementById('mc-p10p90').textContent = fmtEUR0.format(bands.p10[years]) + ' / ' + fmtEUR0.format(bands.p90[years]);
  if (target > 0){
    const pct = successCount/PATHS*100;
    const el = document.getElementById('mc-success');
    el.textContent = fmtPct.format(pct) + '\u00a0%';
    el.className = 'v ' + (pct>=70?'up':pct>=40?'amber':'down');
  } else {
    document.getElementById('mc-success').textContent = '— (Ziel angeben)';
    document.getElementById('mc-success').className = 'v muted';
  }
  progLabel.textContent = 'fertig · 1.000 Pfade';
  mcRunning = false;
}
function drawMCChart(labels, b){
  const ctx = document.getElementById('mc-chart');
  const datasets = [
    { label:'P90', data:b.p90, borderColor:'rgba(30,64,175,.30)', borderWidth:1, pointRadius:0, fill:'+1', backgroundColor:'rgba(30,64,175,.07)', tension:.2 },
    { label:'P75', data:b.p75, borderColor:'rgba(30,64,175,.50)', borderWidth:1, pointRadius:0, fill:'+1', backgroundColor:'rgba(30,64,175,.10)', tension:.2 },
    { label:'P50', data:b.p50, borderColor:'#1e40af', borderWidth:2, pointRadius:0, fill:'+1', backgroundColor:'rgba(30,64,175,.10)', tension:.2 },
    { label:'P25', data:b.p25, borderColor:'rgba(220,38,38,.50)', borderWidth:1, pointRadius:0, fill:'+1', backgroundColor:'rgba(220,38,38,.10)', tension:.2 },
    { label:'P10', data:b.p10, borderColor:'rgba(220,38,38,.30)', borderWidth:1, pointRadius:0, fill:false, tension:.2 },
  ];
  if (mcChart){ mcChart.data.labels = labels; mcChart.data.datasets = datasets; mcChart.update('none'); return; }
  mcChart = new Chart(ctx, { type:'line', data:{labels,datasets}, options:{
    responsive:true, maintainAspectRatio:false,
    interaction:{mode:'index',intersect:false},
    plugins:{
      legend:{display:false},
      tooltip:{ backgroundColor:'#09090b',borderColor:'#3f3f46',borderWidth:1, titleFont:{family:'Inter',size:11},bodyFont:{family:'Inter',size:11},padding:8, callbacks:{ label:(c)=>'  ' + c.dataset.label + ': ' + fmtEUR0.format(c.parsed.y) } }
    },
    scales:{
      x:{ grid:{color:'rgba(9,9,11,.05)',drawTicks:false},border:{display:false},ticks:{color:'#71717a',font:{family:'Inter',size:9},autoSkipPadding:20}},
      y:{ grid:{color:'rgba(9,9,11,.05)',drawTicks:false},border:{display:false},ticks:{color:'#71717a',font:{family:'Inter',size:9},padding:4,callback:(v)=>fmtEUR0.format(v)}}
    }
  }});
}
document.getElementById('mc-run').addEventListener('click', runMC);

/* ============================================================
   TOOL F — Max Drawdown
   ============================================================ */
let ddChart;
function renderDrawdown(){
  const ctx = document.getElementById('dd-chart');
  const snaps = [...state.snapshots].sort((a,b)=>new Date(a.t)-new Date(b.t));
  const depthEl = document.getElementById('dd-depth');
  const periodEl = document.getElementById('dd-period');
  const statusEl = document.getElementById('dd-status');
  if (snaps.length < 2){
    depthEl.textContent = '—'; periodEl.textContent = 'Mind. 2 Snapshots nötig'; statusEl.textContent = '—';
    drawDDChart(ctx, [], []);
    return;
  }
  let peak = snaps[0].value, peakT = snaps[0].t;
  let troughT = snaps[0].t, troughV = snaps[0].value;
  let maxDD = 0, ddPeakT = snaps[0].t, ddTroughT = snaps[0].t;
  const labels = []; const ddSeries = [];
  for (const s of snaps){
    if (s.value > peak){ peak = s.value; peakT = s.t; }
    const dd = peak > 0 ? (s.value - peak)/peak*100 : 0;
    if (dd < maxDD){ maxDD = dd; ddPeakT = peakT; ddTroughT = s.t; }
    labels.push(fmtDate.format(new Date(s.t)));
    ddSeries.push(dd);
  }
  // also add now
  const nowV = total();
  if (nowV > peak){ peak = nowV; }
  const nowDD = peak > 0 ? (nowV - peak)/peak*100 : 0;
  if (nowDD < maxDD){ maxDD = nowDD; ddTroughT = new Date().toISOString(); }
  labels.push('jetzt'); ddSeries.push(nowDD);

  if (maxDD < -0.005){
    depthEl.textContent = fmtPct.format(maxDD) + '\u00a0%';
    depthEl.className = 'v down';
    periodEl.textContent = fmtDate.format(new Date(ddPeakT)) + ' → ' + fmtDate.format(new Date(ddTroughT));
    // status: recovered if last value >= peak at peakT
    const peakValAtDDPeak = snaps.find(s => s.t === ddPeakT)?.value ?? peak;
    if (nowV >= peakValAtDDPeak){
      statusEl.textContent = 'Erholt ✓';
      statusEl.className = 'v up';
    } else {
      const remaining = peakValAtDDPeak - nowV;
      statusEl.textContent = 'Noch ' + fmtEUR0.format(remaining) + ' offen';
      statusEl.className = 'v amber';
    }
  } else {
    depthEl.textContent = fmtPct.format(0) + '\u00a0%';
    depthEl.className = 'v muted';
    periodEl.textContent = 'Kein Drawdown bisher';
    statusEl.textContent = 'Auf Hoch ✓';
    statusEl.className = 'v up';
  }
  drawDDChart(ctx, labels, ddSeries);
}
function drawDDChart(ctx, labels, data){
  const dataset = { data, borderColor:'#dc2626', backgroundColor:'rgba(220,38,38,.12)', fill:'origin', pointRadius:0, borderWidth:1.6, tension:.2 };
  if (ddChart){ ddChart.data.labels = labels; ddChart.data.datasets = [dataset]; ddChart.update('none'); return; }
  ddChart = new Chart(ctx, { type:'line', data:{labels, datasets:[dataset]}, options:{
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false},
      tooltip:{ backgroundColor:'#09090b',borderColor:'#3f3f46',borderWidth:1, titleFont:{family:'Inter',size:11},bodyFont:{family:'Inter',size:11},padding:8, callbacks:{ label:(c)=>'  DD: ' + fmtPct.format(c.parsed.y) + ' %' } } },
    scales:{
      x:{ grid:{color:'rgba(9,9,11,.05)',drawTicks:false},border:{display:false},ticks:{color:'#71717a',font:{family:'Inter',size:9},autoSkipPadding:30,maxRotation:0}},
      y:{ grid:{color:'rgba(9,9,11,.05)',drawTicks:false},border:{display:false},max:0,ticks:{color:'#71717a',font:{family:'Inter',size:9},padding:4,callback:(v)=>fmtPct.format(v)+' %'}}
    }
  }});
}

/* ============================================================
   TOOL G — Diversifikations-Score
   ============================================================ */
function calcDiversification(){
  const t = total();
  const bars = document.getElementById('div-bars');
  const warnBox = document.getElementById('div-warn');
  const num = document.getElementById('div-num');
  const lbl = document.getElementById('div-label');
  bars.innerHTML = ''; warnBox.innerHTML = '';
  if (t <= 0){ num.textContent='—'; num.className='num'; lbl.textContent='Keine Daten'; return; }
  const shares = CATS.map(c => ({ ...c, share: catSum(c.id)/t }));
  const N = CATS.length;
  const hhi = shares.reduce((a,s)=>a + s.share*s.share, 0);
  const minHHI = 1/N;
  let score = Math.round((1 - (hhi - minHHI)/(1 - minHHI)) * 100);
  score = Math.max(0, Math.min(100, score));
  let cls = 'green';
  if (score < 50) cls = 'red'; else if (score < 75) cls = 'amber';
  num.textContent = score; num.className = 'num ' + cls;
  lbl.textContent = cls==='green'?'Gut diversifiziert':cls==='amber'?'Konzentration moderat':'Stark konzentriert';
  for (const s of shares){
    const pc = s.share*100;
    const fillCls = pc>60?'bad':pc>45?'warn':'';
    const div = document.createElement('div');
    div.className='br';
    div.innerHTML = `<span class="lbl">${s.label}</span>
      <span class="track"><span class="fill ${fillCls}" style="width:${Math.min(100,pc)}%;background:${pc>60?'var(--red)':pc>45?'var(--amber)':s.color}"></span></span>
      <span class="pc">${fmtPct.format(pc)}\u00a0%</span>`;
    bars.appendChild(div);
  }
  // category warning
  const heavy = shares.filter(s => s.share > 0.6);
  if (heavy.length){
    const w = document.createElement('div'); w.className='warn-row bad';
    w.innerHTML = `<span class="dot"></span><span><b>${heavy[0].label}</b> hält ${fmtPct.format(heavy[0].share*100)} % — Klumpenrisiko über 60 % der Klasse.</span>`;
    warnBox.appendChild(w);
  }
  // single-asset warning
  let maxAsset = {name:'', share:0, cat:''};
  for (const c of CATS) for (const e of state.entries[c.id]){
    const w = (Number(e.value)||0)/t;
    if (w > maxAsset.share) maxAsset = { name:e.name, share:w, cat:c.label };
  }
  if (maxAsset.share > 0.30){
    const w = document.createElement('div'); w.className='warn-row' + (maxAsset.share>0.45?' bad':'');
    w.innerHTML = `<span class="dot"></span><span><b>${escapeHtml(maxAsset.name)}</b> (${maxAsset.cat}) macht ${fmtPct.format(maxAsset.share*100)} % deines Gesamtvermögens aus — Einzelposition über 30 %.</span>`;
    warnBox.appendChild(w);
  }
}

/* ============================================================
   TOOL H — Cashflow projection
   ============================================================ */
function renderCashflow(){
  const start = parseNum(document.getElementById('cf-start').value);
  const rate  = parseNum(document.getElementById('cf-rate').value);
  const r     = parseNum(document.getElementById('cf-r').value)/100;
  const tbody = document.querySelector('#cf-table tbody');
  tbody.innerHTML = '';
  const horizons = [1,3,5,10];
  const i = r/12;
  for (const y of horizons){
    const months = y*12;
    let end;
    if (i === 0) end = start + rate*months;
    else end = start*Math.pow(1+i, months) + rate*((Math.pow(1+i,months)-1)/i);
    const invest = start + rate*months;
    const interest = end - invest;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${y}\u00a0J</td>
      <td class="mono muted">${fmtEUR0.format(invest)}</td>
      <td class="mono acid">${interest>=0?'+':''}${fmtEUR0.format(interest)}</td>
      <td class="mono">${fmtEUR0.format(end)}</td>
    `;
    tbody.appendChild(tr);
  }
}
['cf-start','cf-rate','cf-r'].forEach(id => document.getElementById(id).addEventListener('input', renderCashflow));

/* ============================================================
   TOOL I — Monatlicher Report
   ============================================================ */
function renderReport(){
  const body = document.getElementById('report-body');
  body.innerHTML = '';
  const last = lastSnapshot();
  const prev = prevSnapshot();
  if (!last){
    body.innerHTML = '<div style="color:var(--ink-3);font-size:12px;padding:10px 0;line-height:1.5">Speichere mindestens einen Snapshot, um den ersten Report zu erzeugen.<br>Für vollen Vergleich (Gewinner/Verlierer/Δ pro Klasse) sind <b style="color:var(--ink-2)">zwei</b> Snapshots nötig.</div>';
    return;
  }
  const periodTxt = prev
    ? `${fmtDate.format(new Date(prev.t))} → ${fmtDate.format(new Date(last.t))}`
    : `letzter Snapshot: ${fmtDate.format(new Date(last.t))}`;
  let html = `<div class="periodbar">${periodTxt}</div>`;

  const t = total();
  // Growth vs last snapshot
  const dTot = t - last.value;
  const pTot = last.value === 0 ? 0 : dTot/last.value*100;
  html += `
    <div class="row"><span class="k">Vermögen jetzt</span><span class="v">${fmtEUR.format(t)}</span></div>
    <div class="row"><span class="k">Δ seit letztem Snapshot</span><span class="v ${dTot>=0?'up':'down'}">${fmtSignedEUR(dTot)}<small>${fmtSignedPct(pTot)}</small></span></div>
  `;

  // Winner/loser (need last + entries map)
  if (last.entries){
    let winner=null, loser=null;
    for (const c of CATS) for (const e of state.entries[c.id]){
      const p = last.entries[e.id];
      if (p === undefined) continue;
      const d = (Number(e.value)||0) - Number(p);
      if (!winner || d > winner.d) winner = {name:e.name, cat:c.label, d};
      if (!loser  || d < loser.d)  loser  = {name:e.name, cat:c.label, d};
    }
    if (winner && winner.d > 0.005){
      html += `<div class="row"><span class="k">★ Größter Gewinner</span><span class="v up">${escapeHtml(winner.name)} <small>${winner.cat} · ${fmtSignedEUR(winner.d)}</small></span></div>`;
    }
    if (loser && loser.d < -0.005){
      html += `<div class="row"><span class="k">▼ Größter Verlierer</span><span class="v down">${escapeHtml(loser.name)} <small>${loser.cat} · ${fmtSignedEUR(loser.d)}</small></span></div>`;
    }
  }
  // Per category
  if (last.breakdown){
    for (const c of CATS){
      const now = catSum(c.id);
      const then = Number(last.breakdown[c.id])||0;
      const d = now - then;
      const dir = Math.abs(d) < 0.005 ? '' : (d>0?'up':'down');
      html += `<div class="row"><span class="k">${c.label}</span><span class="v ${dir}">${fmtEUR.format(now)}<small>${d>=0?'+':'−'}${fmtEUR.format(Math.abs(d))}</small></span></div>`;
    }
  }
  // Zielerreichung
  const target = Number(state.settings.target)||0;
  if (target > 0){
    const pct = Math.min(999, t/target*100);
    html += `<div class="row"><span class="k">Zielerreichung</span><span class="v ${pct>=100?'up':''}">${fmtPct.format(pct)} %<small>von ${fmtEUR0.format(target)}</small></span></div>`;
  } else {
    html += `<div class="row"><span class="k">Zielerreichung</span><span class="v" style="color:var(--ink-4)">— <small>kein Zielwert gesetzt</small></span></div>`;
  }
  body.innerHTML = html;
}

/* ============================================================
   AUTO BUTTONS
   ============================================================ */
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('.auto-btn');
  if (!a) return;
  ev.stopPropagation();
  const tgt = a.dataset.auto;
  const totalEUR = total();
  const totalSpar = totalSparrate();
  const target = Number(state.settings.target)||0;
  const map = {
    'goal-target-auto': ['goal-target', target || 500000],
    'goal-start-auto':  ['goal-start', totalEUR],
    'goal-rate-auto':   ['goal-rate', totalSpar],
    'fire-cap-auto':    ['fire-cap', totalEUR],
    'mc-start-auto':    ['mc-start', totalEUR],
    'mc-rate-auto':     ['mc-rate', totalSpar],
    'mc-target-auto':   ['mc-target', target],
    'cf-start-auto':    ['cf-start', totalEUR],
    'cf-rate-auto':     ['cf-rate', totalSpar],
  };
  const m = map[tgt];
  if (!m) return;
  const el = document.getElementById(m[0]);
  el.value = fmtNum2.format(m[1]);
  el.dispatchEvent(new Event('input', {bubbles:true}));
});

