/* ============================================================
   main-tools.js — Bootstrap & Render-Aufruf für die Tools-Seite
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

/* ---------- Bootstrap (Tool-Vorbelegungen aus State) ---------- */
function bootstrapToolInputs(){
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('fire-cap', fmtNum2.format(total()));
  set('cf-start', fmtNum2.format(total()));
  set('cf-rate',  fmtNum2.format(totalSparrate()));
  set('mc-start', fmtNum2.format(total()));
  set('mc-rate',  fmtNum2.format(totalSparrate()));
  set('mc-target', state.settings.target ? fmtNum2.format(state.settings.target) : '0,00');
}

/* ---------- Help-Popovers (Dashboard liefert das sonst — auf der Tools-Seite brauchen wir's hier) ---------- */
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

/* ---------- Tool-Navigation: Anker in URL = Solo-Modus (nur ein Tool sichtbar) ---------- */
function applyHashMode(){
  const h = location.hash.replace('#','');
  document.querySelectorAll('.tool').forEach(t => t.classList.remove('focused'));
  if (h){
    const el = document.getElementById(h);
    if (el){
      document.body.setAttribute('data-mode','solo');
      el.classList.add('focused');
      // Titel im Topbar anpassen
      const title = el.querySelector('.t-title')?.textContent;
      const nameEl = document.querySelector('.brand .name');
      if (title && nameEl) nameEl.textContent = title.toUpperCase();
      window.scrollTo(0,0);
      return;
    }
  }
  document.body.setAttribute('data-mode','index');
}
window.addEventListener('hashchange', applyHashMode);

bootstrapToolInputs();
calcCAGR();
calcInflation();
calcGoal();
calcFire();
renderDrawdown();
calcDiversification();
renderCashflow();
renderReport();

applyHashMode();
