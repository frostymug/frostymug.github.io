/* Shared fake data + helpers for all four multi-trip prototypes. */
window.TRIPS = [
  { id:'denver',  title:'Denver',            place:'Colorado',       dates:'Oct 2026',        state:'upcoming', count:0,  art:'art-denver',  glyph:'⛰️', note:'Front Range uplift, Fountain Formation' },
  { id:'rapid',   title:'Rapid City',        place:'South Dakota',   dates:'Sep 2026',        state:'upcoming', count:0,  art:'art-rapid',   glyph:'⛰️', note:'Black Hills, Badlands' },
  { id:'door',    title:'Door County',       place:'Wisconsin',      dates:'Aug 2–9, 2026', state:'active', count:3, art:'art-door', glyph:'🪨', note:'Silurian dolomite, Niagara Escarpment' },
  { id:'finland', title:'Finland',           place:'Helsinki → Koli', dates:'Jul 16–25, 2026', state:'previous', count:14, art:'art-finland', glyph:'🪨', note:'~1.9 Ga bedrock, rapakivi, glaciation' },
];
window.CURRENT_TRIP_ID = 'door'; // the present-tense trip (capture writes here)

window.ENCOUNTERS = {
  door: [
    { id:'d3', day:'Today · Sat Aug 2', place:'Cave Point County Park', time:'14:20', glyph:'🪨', note:'Layered shoreline ledges — flat slabs, wave-cut. Dolomite?', x:'62%', y:'40%' },
    { id:'d2', day:'Today · Sat Aug 2', place:'Cave Point County Park', time:'13:58', glyph:'🐚', note:'Fossil-looking texture in the rock face — corals? no idea, curious', x:'58%', y:'46%' },
    { id:'d1', day:'Today · Sat Aug 2', place:'Sturgeon Bay', time:'10:12', glyph:'🪨', note:'Pale gray blocky stone at the harbor wall', x:'40%', y:'66%' },
  ],
  finland: [
    { id:'f14', day:'Fri Jul 25', place:'Fanninpelto', time:'16:40', glyph:'🪨', note:'More rapakivi? pink feldspars, stretched/lens-shaped', x:'55%', y:'35%' },
    { id:'f13', day:'Thu Jul 24', place:'Nuuksio', time:'10:51', glyph:'🪨', note:'Fascinating crystalline structures… quartz inclusions?', x:'30%', y:'52%' },
    { id:'f12', day:'Mon Jul 21', place:'Keskuspuisto', time:'06:41', glyph:'🪨', note:'Banding/foliation + "cleavage?" cracks under a tree root', x:'48%', y:'44%' },
  ],
};

// number formatting helper
window.trip = (id) => window.TRIPS.find(t=>t.id===id);
window.stateChip = (s) => `<span class="chip state-${s}"><span class="dot ${s}"></span>${s}</span>`;

// Render an encounter row
window.encRow = (e) => `
  <div class="enc">
    <div class="thumb"><span>${e.glyph}</span></div>
    <div class="meta">
      <div class="between"><span class="cap mono">${e.place} · ${e.time}</span></div>
      <p class="note">${e.note}</p>
    </div>
  </div>`;

// Render a day-grouped encounter list for one trip
window.tripTimeline = (id) => {
  const list = window.ENCOUNTERS[id] || [];
  if(!list.length) return `<p class="sm ink3" style="padding:8px 0">No encounters yet — this trip is upcoming.</p>`;
  let html=''; let lastDay=null;
  list.forEach(e=>{ if(e.day!==lastDay){ html+=`<div class="daylabel">${e.day}</div>`; lastDay=e.day; } html+=window.encRow(e); });
  return html;
};

// Universal timeline (all trips, newest first, grouped by trip rule)
window.universalTimeline = () => {
  const order=['door','finland']; let html='';
  order.forEach(id=>{
    const t=window.trip(id); const list=window.ENCOUNTERS[id]||[];
    if(!list.length) return;
    html+=`<div class="triprule"><span class="line"></span><span class="lbl">${t.title} · ${t.dates}</span><span class="line"></span></div>`;
    let lastDay=null;
    list.forEach(e=>{ if(e.day!==lastDay){ html+=`<div class="daylabel">${e.day}</div>`; lastDay=e.day; } html+=window.encRow(e); });
  });
  return html;
};

// Map pins for a trip
window.mapPins = (id) => {
  const list=window.ENCOUNTERS[id]||[];
  return list.filter(e=>e.x).map(e=>`<div class="pin" style="left:${e.x}; top:${e.y}">📍</div>`).join('');
};
