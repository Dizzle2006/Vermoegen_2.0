/* ============================================================
   main-dashboard.js — Bootstrap & Render-Aufruf für das Dashboard
   ============================================================ */

/* ---------- Uhr ---------- */
function tickClock(){
  const el = document.getElementById('clock');
  if (!el) return;
  const parts = fmtClock.formatToParts(new Date());
  const get = (t) => parts.find(p=>p.type===t)?.value || '';
  el.innerHTML = `<b>${get('day')}.${get('month')}.${get('year')}</b> · ${get('hour')}:${get('minute')}:${get('second')}`;
}
setInterval(tickClock, 1000); tickClock();

/* ---------- Bootstrap Inputs (nur Dashboard-Felder) ---------- */
function bootstrapInputs(){
  if (typeof targetInput !== 'undefined' && targetInput) {
    targetInput.value = state.settings.target ? fmtNum2.format(state.settings.target) : '';
  }
  if (typeof benchInput !== 'undefined' && benchInput) {
    benchInput.value = fmtPct.format(state.settings.benchmarkRate);
  }
  if (typeof benchEl !== 'undefined' && benchEl) {
    benchEl.classList.toggle('on', !!state.settings.benchmarkOn);
  }
  if (typeof scenRealToggle !== 'undefined' && scenRealToggle) {
    scenRealToggle.classList.toggle('on', !!state.settings.scenarioReal);
  }
  const startEl = document.getElementById('scen-start');
  if (startEl && parseNum(startEl.value) === 0) startEl.value = fmtNum2.format(total());
  const rateEl = document.getElementById('scen-rate');
  if (rateEl && parseNum(rateEl.value) === 0){
    const ts = totalSparrate();
    rateEl.value = ts > 0 ? fmtNum2.format(ts) : '0,00';
  }
  const infEl = document.getElementById('scen-inf');
  if (infEl) infEl.value = fmtPct.format(state.settings.inflationRate);
}

function renderAll(){
  renderTotal();
  renderAccordion();
  renderAllocation();
  renderLineChart();
  renderScenario();
  renderRadar();
  renderSparOverview();
  renderTarget();
  renderSnapshotList();
}

bootstrapInputs();
renderAll();
