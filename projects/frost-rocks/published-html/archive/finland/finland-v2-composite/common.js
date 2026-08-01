// Frost Rocks — v2 composite shared helpers.
// Stylized SVG "photos" + nav icons + screen router + lightweight telemetry.
// No external calls. All events live in-memory + localStorage so Andy can see + export them.
(function(){
  const PAL=[['#7d8a72','#54634d'],['#8a8378','#63594e'],['#9a8f6f','#736743'],
             ['#a89e84','#7c7057'],['#6f7f84','#4d5f66'],['#9c7d63','#6f5540']];
  function rockPhoto(i){
    const [a,b]=PAL[i%PAL.length];
    const id='rp'+Math.random().toString(36).slice(2,7);
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id})"/>
      <path d="M0,58 Q28,44 52,56 T100,50 V100 H0 Z" fill="rgba(0,0,0,.16)"/>
      <path d="M8,26 L44,32 M16,48 L58,50 M12,72 L62,68 M30,15 L70,22" stroke="rgba(255,255,255,.22)" stroke-width="2.2"/>
      <circle cx="72" cy="30" r="9" fill="rgba(255,255,255,.12)"/>
    </svg>`;
  }
  const ICONS={
    map:`<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>`,
    list:`<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>`,
    star:`<path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9L12 3Z"/>`,
    user:`<path d="M4 20a8 8 0 0 1 16 0"/><circle cx="12" cy="8" r="4"/>`,
    book:`<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M19 3v16"/>`,
    plus:`<path d="M12 5v14M5 12h14"/>`,
    x:`<path d="M6 6l12 12M18 6 6 18"/>`,
    flip:`<path d="M3 7h13a4 4 0 0 1 0 8h-3"/><path d="m6 12-3 3 3 3"/>`,
    bolt:`<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>`,
    image:`<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>`,
    chart:`<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>`,
    activity:`<path d="M3 12h4l3 8 4-16 3 8h4"/>`
  };
  function ico(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`;}

  function hydrate(){
    document.querySelectorAll('[data-rock]').forEach((el,i)=>{el.innerHTML=rockPhoto(parseInt(el.getAttribute('data-rock'))||i);});
    document.querySelectorAll('[data-ico]').forEach(el=>{el.innerHTML=ico(el.getAttribute('data-ico'));});
  }

  // ---- Router -------------------------------------------------------------
  function go(id,meta){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const t=document.getElementById(id); if(t)t.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(b=>b.classList.remove('on'));
    document.querySelectorAll('[data-nav="'+id+'"]').forEach(b=>b.classList.add('on'));
    window.scrollTo(0,0);
    log('screen',Object.assign({to:id},meta||{}));
  }
  function reveal(btn){const c=btn.closest('[data-revealwrap]')||document;const r=c.querySelector('.reveal');if(r)r.classList.add('show');}

  // ---- Telemetry ----------------------------------------------------------
  // Instrumentation is a first-class design output of this prototype (FR-V2-INSTR).
  // We answer specific questions, not "log everything":
  //   - capture speed (tap-to-shutter ms), library-bail rate, enrich vs shoot-and-go
  //   - which of 3 review doors is used, revisit follow-through
  const KEY='fr_v2_events';
  let events=[];
  try{events=JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){events=[];}
  const listeners=[];
  function log(type,data){
    const e={t:Date.now(),type:type,data:data||{}};
    events.push(e);
    try{localStorage.setItem(KEY,JSON.stringify(events.slice(-500)));}catch(_){}
    listeners.forEach(fn=>{try{fn(e);}catch(_){}});
    return e;
  }
  function onLog(fn){listeners.push(fn);}
  function allEvents(){return events.slice();}
  function clearEvents(){events=[];try{localStorage.removeItem(KEY);}catch(_){}listeners.forEach(fn=>{try{fn(null);}catch(_){}});}
  function exportEvents(){
    const blob=new Blob([JSON.stringify(events,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download='frost-rocks-events.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  // Derived metrics for the debug panel.
  function metrics(){
    const cap=events.filter(e=>e.type==='capture');
    const shots=cap.filter(e=>e.data.action==='shutter');
    const bails=cap.filter(e=>e.data.action==='library');
    const speeds=shots.map(e=>e.data.ms).filter(v=>typeof v==='number');
    const avg=speeds.length?Math.round(speeds.reduce((a,b)=>a+b,0)/speeds.length):null;
    const saves=events.filter(e=>e.type==='save');
    const enriched=saves.filter(e=>e.data.enriched).length;
    const rev=events.filter(e=>e.type==='review_open');
    const byDoor={map:0,timeline:0,nav:0};
    rev.forEach(e=>{if(byDoor[e.data.door]!=null)byDoor[e.data.door]++;});
    const revisits=events.filter(e=>e.type==='revisit_done').length;
    return {
      captures:shots.length,
      libraryBails:bails.length,
      avgShutterMs:avg,
      saves:saves.length,
      enriched:enriched,
      enrichPct:saves.length?Math.round(100*enriched/saves.length):null,
      reviewDoors:byDoor,
      revisitsDone:revisits
    };
  }

  window.FR={rockPhoto,ico,hydrate,go,reveal,log,onLog,allEvents,clearEvents,exportEvents,metrics};
  document.addEventListener('DOMContentLoaded',hydrate);
})();
