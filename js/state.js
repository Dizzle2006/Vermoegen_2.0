/* ============================================================
   state.js — State & localStorage Persistence
   Teil der Vermögensaufstellung — automatisch aus index.html ausgelagert.
   ============================================================ */

/* ============================================================
   STATE & PERSISTENCE
   ============================================================ */
const LS_KEY = 'vermoegen.v2';
const LS_KEY_OLD = 'vermoegen.v1';
const CATS = [
  { id:'LIQUIDE',     label:'Liquide',     color:'#0891b2', sw:'sw-liq' },
  { id:'KAPITALMARKT',label:'Kapitalmarkt',color:'#1e40af', sw:'sw-kap' },
  { id:'SACHWERTE',   label:'Sachwerte',   color:'#b45309', sw:'sw-sac' },
];
const LOCKED = {
  LIQUIDE:      ['Trade Republic Tagesgeld','Festgeld'],
  KAPITALMARKT: ['Maxblue Depot','Cominvest Depot','Trade Republic Depot'],
  SACHWERTE:    ['Gold','Sachwerte'],
};

function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }

function defaultState(){
  const entries = {};
  for (const c of CATS){
    entries[c.id] = LOCKED[c.id].map(n => ({ id: uid(), name:n, value:0, locked:true, note:'', sparrate:0 }));
  }
  return {
    entries,
    snapshots: [],
    settings: {
      benchmarkRate: 7.0, benchmarkOn: false,
      inflationRate: 2.5,
      target: 0,
      openCats: {LIQUIDE:true,KAPITALMARKT:true,SACHWERTE:true},
      scenarioReal: false,
    },
  };
}

function migrateV1(v1){
  // bring v1 state shape forward into v2 — pads new fields
  if (!v1 || typeof v1 !== 'object') return defaultState();
  const s = defaultState();
  if (v1.entries){
    for (const c of CATS){
      const v1Cat = v1.entries[c.id] || [];
      s.entries[c.id] = [];
      for (const e of v1Cat){
        s.entries[c.id].push({
          id: e.id || uid(),
          name: e.name,
          value: Number(e.value) || 0,
          locked: !!e.locked,
          note: e.note || '',
          sparrate: Number(e.sparrate) || 0,
        });
      }

    }
  }
  if (Array.isArray(v1.snapshots)){
    s.snapshots = v1.snapshots.map(sn => ({
      id: sn.id || uid(),
      t: sn.t,
      value: Number(sn.value) || 0,
      note: sn.note || '',
      entries: sn.entries || {},
      breakdown: sn.breakdown || {},
    }));
  }
  if (v1.settings){
    Object.assign(s.settings, v1.settings);
  }
  return s;
}

function loadState(){
  try{
    let raw = localStorage.getItem(LS_KEY);
    let s;
    if (!raw){
      const rawV1 = localStorage.getItem(LS_KEY_OLD);
      if (rawV1){
        s = migrateV1(JSON.parse(rawV1));
        localStorage.setItem(LS_KEY, JSON.stringify(s));
        return s;
      }
      return defaultState();
    }
    s = JSON.parse(raw);
    // Ensure category arrays exist + pad missing fields (no auto re-adding deleted locked entries)
    for (const c of CATS){
      if (!s.entries[c.id]) s.entries[c.id] = [];
      for (const e of s.entries[c.id]){
        if (e.note === undefined) e.note = '';
        if (e.sparrate === undefined) e.sparrate = 0;
      }
    }
    s.snapshots = (s.snapshots||[]).map(sn => Object.assign({ note:'', entries:{}, breakdown:{} }, sn));
    s.settings = Object.assign({
      benchmarkRate:7, benchmarkOn:false,
      inflationRate:2.5,
      target:0,
      openCats:{LIQUIDE:true,KAPITALMARKT:true,SACHWERTE:true},
      scenarioReal:false,
    }, s.settings || {});
    return s;
  }catch(err){
    console.warn('State corrupt, reset', err);
    return defaultState();
  }
}
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
let state = loadState();

