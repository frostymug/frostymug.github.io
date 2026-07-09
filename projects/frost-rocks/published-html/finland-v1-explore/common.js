// Shared helpers for Frost Rocks v1 explore prototypes.
// Stylized SVG "photos" + nav icons + screen router. No external calls.
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
    graph:`<circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="16" cy="17" r="2.4"/><circle cx="7" cy="16" r="2.4"/><path d="M8 8l8-1M9 15l6 1M7 14V9M17 9v6"/>`,
    sun:`<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>`,
    moon:`<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z"/>`,
    plus:`<path d="M12 5v14M5 12h14"/>`,
    search:`<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>`,
    layers:`<path d="M12 3 2 8l10 5 10-5-10-5ZM2 14l10 5 10-5"/>`
  };
  function ico(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`;}

  // Auto-render any <i data-rock="N"></i> and <i data-ico="name"></i> placeholders
  function hydrate(){
    document.querySelectorAll('[data-rock]').forEach((el,i)=>{
      el.innerHTML=rockPhoto(parseInt(el.getAttribute('data-rock'))||i);
    });
    document.querySelectorAll('[data-ico]').forEach(el=>{
      el.innerHTML=ico(el.getAttribute('data-ico'));
    });
  }

  // Router
  function go(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const t=document.getElementById(id); if(t)t.classList.add('active');
    document.querySelectorAll('[data-nav]').forEach(b=>b.classList.remove('on'));
    document.querySelectorAll('[data-nav="'+id+'"]').forEach(b=>b.classList.add('on'));
    window.scrollTo(0,0);
  }
  function reveal(btn){const c=btn.closest('[data-revealwrap]')||document;const r=c.querySelector('.reveal');if(r)r.classList.add('show');}

  window.FR={rockPhoto,ico,hydrate,go,reveal};
  document.addEventListener('DOMContentLoaded',hydrate);
})();
