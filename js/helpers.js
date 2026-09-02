/* ============================================================
   helpers.js — Format-Helfer (de-DE) + Berechnungen
   Teil der Vermögensaufstellung — automatisch aus index.html ausgelagert.
   ============================================================ */

/* ============================================================
   FORMAT HELPERS (de-DE)
   ============================================================ */
const fmtEUR  = new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', minimumFractionDigits:2, maximumFractionDigits:2 });
const fmtEUR0 = new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', minimumFractionDigits:0, maximumFractionDigits:0 });
const fmtNum2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits:2, maximumFractionDigits:2 });
const fmtPct  = new Intl.NumberFormat('de-DE', { minimumFractionDigits:2, maximumFractionDigits:2 });
const fmtPct0 = new Intl.NumberFormat('de-DE', { minimumFractionDigits:0, maximumFractionDigits:0 });
const fmtDate = new Intl.DateTimeFormat('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' });
const fmtDateTime = new Intl.DateTimeFormat('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
const fmtMonthYear = new Intl.DateTimeFormat('de-DE', { month:'long', year:'numeric' });
const fmtClock = new Intl.DateTimeFormat('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });

function parseNum(str){
  if (str === null || str === undefined) return 0;
  if (typeof str === 'number') return isFinite(str) ? str : 0;
  let s = String(str).trim();
  if (!s) return 0;
  s = s.replace(/\s/g,'').replace(/\u00a0/g,'').replace(/€/g,'').replace(/%/g,'');
  if (s.includes(',')){ s = s.replace(/\./g,'').replace(',', '.'); }
  else if ((s.match(/\./g)||[]).length > 1){ s = s.replace(/\./g,''); }
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}
function compactEUR(v){
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return (v/1_000_000).toFixed(2).replace('.',',') + '\u00a0Mio\u00a0€';
  if (abs >= 100_000)   return Math.round(v/1000) + '\u00a0Tsd\u00a0€';
  if (abs >= 10_000)    return Math.round(v/100)/10 + '\u00a0Tsd\u00a0€'.replace('.',',');
  return fmtEUR0.format(v);
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function fmtSignedEUR(v){
  const sign = v >= 0 ? '+' : '−';
  return sign + fmtEUR.format(Math.abs(v));
}
function fmtSignedPct(v){
  const sign = v >= 0 ? '+' : '−';
  return sign + fmtPct.format(Math.abs(v)) + '\u00a0%';
}

/* ============================================================
   COMPUTATION
   ============================================================ */
function catSum(catId){ return state.entries[catId].reduce((a,e)=>a + (Number(e.value)||0), 0); }
function total(){ return CATS.reduce((a,c)=>a + catSum(c.id), 0); }
/* Geldwerte = alles außer Sachwerte (Liquide + Kapitalmarkt). */
function moneyTotal(){ return catSum('LIQUIDE') + catSum('KAPITALMARKT'); }
/* Sachwerte allein (Gold, Immobilien, …). */
function tangibleTotal(){ return catSum('SACHWERTE'); }
/* Geldwert-Anteil eines Snapshots — nutzt das Kategorie-Breakdown,
   fällt für alte Snapshots ohne Breakdown auf den Gesamtwert zurück. */
function snapshotMoneyValue(snap){
  if (!snap) return 0;
  const b = snap.breakdown;
  if (b && (b.LIQUIDE !== undefined || b.KAPITALMARKT !== undefined)){
    return (Number(b.LIQUIDE)||0) + (Number(b.KAPITALMARKT)||0);
  }
  return Number(snap.value)||0;
}
function lastSnapshot(){
  if (!state.snapshots.length) return null;
  return [...state.snapshots].sort((a,b)=>new Date(b.t)-new Date(a.t))[0];
}
function prevSnapshot(){
  if (state.snapshots.length < 2) return null;
  return [...state.snapshots].sort((a,b)=>new Date(b.t)-new Date(a.t))[1];
}
function totalSparrate(){
  let s = 0;
  for (const c of CATS) for (const e of state.entries[c.id]) s += Number(e.sparrate)||0;
  return s;
}
function findEntry(entryId){
  for (const c of CATS){
    const e = state.entries[c.id].find(x => x.id === entryId);
    if (e) return { entry:e, cat:c };
  }
  return null;
}

