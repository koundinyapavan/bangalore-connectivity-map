const map = L.map('map',{zoomControl:true}).setView([12.99,77.63],11);
const BASE={
  light:L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}),
  dark:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,maxNativeZoom:16,attribution:'Tiles © Esri'}),
  sat:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,maxNativeZoom:19,attribution:'Imagery © Esri, Maxar'})
};
BASE.light.addTo(map);
const BaseCtl=L.control({position:'bottomleft'});
BaseCtl.onAdd=function(){
  const d=L.DomUtil.create('div','basemap-ctl');
  d.innerHTML='<button data-b="light" class="on">Map</button><button data-b="dark">Dark</button><button data-b="sat">Satellite</button>';
  L.DomEvent.disableClickPropagation(d);
  d.addEventListener('click',function(e){
    const b=e.target.getAttribute&&e.target.getAttribute('data-b'); if(!b) return;
    Object.keys(BASE).forEach(k=>{if(map.hasLayer(BASE[k]))map.removeLayer(BASE[k]);});
    BASE[b].addTo(map); BASE[b].bringToBack();
    d.querySelectorAll('button').forEach(x=>x.classList.remove('on')); e.target.classList.add('on');
  });
  return d;
};
BaseCtl.addTo(map);


/* ---------------- PROPERTIES ---------------- */

const TYPECOLOR={villa:'#C0392B',apartment:'#2E86C1',plot:'#8E44AD'};
const CORR_TRANSIT={
  East:'ORR/Whitefield tech belt — Purple metro (live) + Blue ORR (~2027) + Kanaka suburban (~2029). Sarjapur end: no near-term metro (Red 3A ~2033+).',
  North:'Airport/Manyata corridor — Blue airport metro (2028–29) + Sampige/Kanaka suburban (~2029). Devanahalli is not an ORR commute.',
  South:'Bannerghatta / E-City / Kanakapura — Pink (elevated ~Nov 2026, Bannerghatta Rd) · Yellow (live, E-City/Hosur Rd) · Green (live, Kanakapura).',
  Central:'Central Bengaluru — Purple/Green (live) + Pink (elevated ~Nov 2026, UG 2027–28).',
  West:'West Bengaluru — Purple/Green metro (live).'
};
function upcomingSchedule(p){
  if(!p.upcoming) return '';
  return '<div style="margin-top:5px;border-top:1px solid #333;padding-top:4px"><span class="rn">Upcoming project</span> — usually sold on a construction-linked payment plan (pay in slabs as it is built), so you can enter before completion while the metro / suburban-rail / ring-road network matures around it.</div>';
}
const METRO_STATUS={op:'running',uc:'under construction',pl:'planned'};
function nearestMetro(p){
  const here=L.latLng(p.lat,p.lng), best={};
  METRO.forEach(l=>l.pts.forEach(s=>{
    const k=l.status==='op'?'op':'up', d=here.distanceTo(L.latLng(s[1],s[2]));
    if(!best[k]||d<best[k].d||(d===best[k].d&&l.status==='uc'))best[k]={d:d,stn:s[0],line:l.name.replace(/ \(.*\)$/,''),status:l.status};
  }));
  const row=(label,b)=>b?'<div>'+label+' <b>'+b.stn+'</b> ('+b.line+(b.status!=='op'?', '+METRO_STATUS[b.status]:'')+') — '+(b.d/1000).toFixed(1)+' km</div>':'';
  return '<div style="margin-top:5px;border-top:1px solid #333;padding-top:4px"><b>Nearest metro</b> <small>(straight-line)</small>'+row('Running:',best.op)+row('Upcoming:',best.up)+'</div>';
}
function popup(p){
  const st=p.status==='uc'?'<span class="pill uc">Under construction</span>':'<span class="pill op">Ready / resale</span>';
  const geo=p.geo==='verified'?'<span style="color:#2ec27e">GPS-verified (site visit)</span>':p.geo==='osm'?'<span style="color:#7fbfff">OpenStreetMap project footprint (Oct 2026)</span>':p.geo==='geocoded'?'<span style="color:#7fbfff">geocoded via Google Places (project-level)</span>':'<span style="color:#e6b800">approx (locality-level)</span>';
  return '<b>'+p.name+'</b> '+(p.upcoming?'<span class="rn">★</span>':'')+'<br><small>'+p.dev+' · '+p.corr+' · '+p.area+'</small>'+
    '<div style="margin-top:4px">'+cap(p.type)+' · '+p.config+'</div>'+
    '<div>Price <b>₹'+p.min+'–'+p.max+' Cr</b> · '+st+'</div>'+
    '<div><b>Completion:</b> '+p.poss+'</div>'+
    nearestMetro(p)+
    '<div style="margin-top:5px;border-top:1px solid #333;padding-top:4px"><b>Transit (by ~2030)</b><br>'+(CORR_TRANSIT[p.corr]||'')+'</div>'+
    '<div style="margin-top:4px"><small>Pin: '+geo+' — verify exact plot</small></div>'+
    upcomingSchedule(p);
}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function bandOverlap(sel,min,max){
  const R={lo:[0,3],mid:[3,6],hi:[6,999]};
  return sel.some(k=>R[k][0]<=max && min<=R[k][1]);
}
function projYear(p){const m=(p.poss||'').match(/20\d\d/g);if(m)return Math.max.apply(null,m.map(Number));return p.status==='ready'?2025:2030;}
function compBucket(p){const y=projYear(p);if(p.status==='ready'||y<=2026)return 'ready';if(y<=2028)return 'y2728';if(y<=2031)return 'y2931';return 'y32';}
function getChecked(cls){return Array.from(document.querySelectorAll('.'+cls+':checked')).map(e=>e.value);}
let shownMarkers=[];
function activeChips(id){var c=document.getElementById(id);if(!c)return [];return Array.from(c.querySelectorAll('.chip.active')).map(x=>x.getAttribute('data-val'));}
function projDate(p){var m=(p.poss||'').match(/20\d\d/g);return m?Math.max.apply(null,m.map(Number)):(p.status==='ready'?2025:2030);}
function highlightRow(i){document.querySelectorAll('.lrow.active').forEach(r=>r.classList.remove('active'));var r=document.getElementById('lrow-'+i);if(r){r.classList.add('active');r.scrollIntoView({block:'nearest'});}}
function focusProp(i){var s=shownMarkers[i];if(!s)return;highlightRow(i);if(propLayer.zoomToShowLayer&&s.marker){propLayer.zoomToShowLayer(s.marker,function(){if(s.marker.openPopup)s.marker.openPopup();});}else{map.setView([s.lat,s.lng],15);if(s.marker&&s.marker.openPopup)s.marker.openPopup();}}
function renderProps(){
  propLayer.clearLayers(); shownMarkers=[];
  const types=getChecked('fType'),stats=getChecked('fStatus'),bands=getChecked('fBand'),comps=getChecked('fComplete');
  const devs=activeChips('devChips'),corrs=activeChips('corrChips');
  const sEl=document.getElementById('search'),q=(sEl&&sEl.value?sEl.value:'').trim().toLowerCase();
  const srtEl=document.getElementById('sort'),sort=srtEl?srtEl.value:'def';
  const showLabels=document.getElementById('lLabels').checked;
  let list=PROPS.filter(p=>types.includes(p.type)&&stats.includes(p.status)&&bandOverlap(bands,p.min,p.max)&&comps.includes(compBucket(p))
    &&(devs.length===0||devs.includes(p.dev))&&(corrs.length===0||corrs.includes(p.corr))
    &&(q===''||(p.name+' '+p.dev+' '+p.area+' '+p.corr).toLowerCase().indexOf(q)>=0));
  if(sort==='pmin')list.sort((a,b)=>a.min-b.min);
  else if(sort==='pmax')list.sort((a,b)=>b.max-a.max);
  else if(sort==='soon')list.sort((a,b)=>projDate(a)-projDate(b)||a.min-b.min);
  else if(sort==='late')list.sort((a,b)=>projDate(b)-projDate(a));
  else if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  let rows='';
  list.forEach(p=>{
    const i=shownMarkers.length;
    const mk=L.circleMarker([p.lat,p.lng],{radius:8,weight:p.upcoming?3:2,color:p.upcoming?'#e9c46a':'#fff',fillColor:TYPECOLOR[p.type],fillOpacity:1})
      .bindPopup(popup(p))
      .bindTooltip((p.upcoming?'★ ':'')+p.name,{permanent:showLabels,direction:'right',className:'plabel',offset:[8,0]});
    mk.on('popupopen',function(){highlightRow(i);});
    propLayer.addLayer(mk);
    shownMarkers.push({lat:p.lat,lng:p.lng,marker:mk});
    rows+='<div class="lrow" id="lrow-'+i+'" onclick="focusProp('+i+')"><span class="dot" style="background:'+TYPECOLOR[p.type]+'"></span> '+(p.upcoming?'★ ':'')+'<b>'+p.name+'</b><br><span class="lmeta">'+p.dev+' · '+p.area+' · ₹'+p.min+'–'+p.max+' Cr · '+(p.status==='uc'?('UC '+p.poss):'Ready')+'</span></div>';
  });
  document.getElementById('count').textContent=shownMarkers.length+' of '+PROPS.length+' shown'+((devs.length||corrs.length||q)?' · filtered':'');
  var lb=document.getElementById('listBody'); if(lb) lb.innerHTML=rows;
  var lc=document.getElementById('lcount'); if(lc) lc.textContent=shownMarkers.length;
}

/* build builder + corridor chips */
function buildChips(id,vals){var c=document.getElementById(id);if(!c)return;c.innerHTML=vals.map(v=>'<span class="chip active" data-val="'+v+'">'+v+'</span>').join('');c.addEventListener('click',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('chip')){e.target.classList.toggle('active');renderProps();}});}
buildChips('devChips',Array.from(new Set(PROPS.map(p=>p.dev))).sort());
buildChips('corrChips',['East','North','South','Central','West']);

/* default layers on */
[metroLayer,krideLayer,propLayer].forEach(l=>l.addTo(map));
renderProps();

/* wire filters */
document.querySelectorAll('.fType,.fStatus,.fBand,.fComplete').forEach(el=>el.addEventListener('change',renderProps));
document.getElementById('lLabels').addEventListener('change',renderProps);
document.getElementById('search').addEventListener('input',renderProps);
document.getElementById('sort').addEventListener('change',renderProps);
document.getElementById('reset').addEventListener('click',function(){
  document.querySelectorAll('.fType,.fStatus,.fBand,.fComplete').forEach(e=>e.checked=true);
  document.querySelectorAll('.chip').forEach(c=>c.classList.add('active'));
  document.getElementById('search').value=''; document.getElementById('sort').value='def';
  renderProps();
});

/* collapsible panels + mobile default */
document.querySelectorAll('.collapse').forEach(b=>b.addEventListener('click',function(){var p=document.getElementById(this.getAttribute('data-target'));if(!p)return;p.classList.toggle('collapsed');this.textContent=p.classList.contains('collapsed')?'+':'–';}));
if(window.innerWidth<820){var _v=document.getElementById('verdict');if(_v){_v.classList.add('collapsed');var _vb=_v.querySelector('.collapse');if(_vb)_vb.textContent='+';}}

function bind(id,layer){document.getElementById(id).addEventListener('change',e=>{e.target.checked?layer.addTo(map):map.removeLayer(layer);});}
bind('lMetro',metroLayer);bind('lKride',krideLayer);bind('lRoads',roadsLayer);bind('lBott',bottLayer);bind('lRings',ringsLayer);bind('lSchools',schoolLayer);bind('lHosp',hospLayer);

/* per-line filters for the transit layers */
function lineFilters(containerId,items,parentLayer,labelOf,swatch){
  const box=document.getElementById(containerId); if(!box) return [];
  return items.map(it=>{
    const lab=document.createElement('label'), cb=document.createElement('input');
    cb.type='checkbox'; cb.checked=true;
    const sw=document.createElement('span'); sw.className='sw'; sw.style.borderTopColor=swatch(it);
    if(it.status&&it.status!=='op') sw.style.borderTopStyle=it.status==='uc'?'dashed':'dotted';
    lab.appendChild(cb); lab.appendChild(sw); lab.appendChild(document.createTextNode(labelOf(it)));
    function set(on){ cb.checked=on; lab.classList.toggle('off',!on); on?parentLayer.addLayer(it.grp):parentLayer.removeLayer(it.grp); }
    cb.addEventListener('change',()=>set(cb.checked));
    box.appendChild(lab);
    return {it:it,set:set};
  });
}
const shortName=n=>n.replace(/\s*\(.*?\)/g,'').replace(/ — .*$/,'').replace(/ · .*$/,'');
const metroCtl=lineFilters('metroSub',METRO,metroLayer,l=>shortName(l.name)+({op:'',uc:' · under construction',pl:' · planned'}[l.status]),l=>l.color);
lineFilters('krideSub',KRIDE,krideLayer,l=>shortName(l.name),l=>l.color);
lineFilters('roadsSub',ROADS,roadsLayer,r=>shortName(r.name).replace(/ \/ .*$/,'').replace(/^Proposed /,''),r=>r.color);
(function(){
  const q=document.getElementById('metroQuick'); if(!q) return;
  [['All',()=>true],['Running',l=>l.status==='op'],['Upcoming',l=>l.status!=='op'],['None',()=>false]].forEach(([t,fn])=>{
    const b=document.createElement('span'); b.className='chip'; b.textContent=t;
    b.addEventListener('click',()=>{
      metroCtl.forEach(c=>c.set(fn(c.it)));
      const m=document.getElementById('lMetro'); if(t!=='None'&&!m.checked){m.checked=true;metroLayer.addTo(map);}
    });
    q.appendChild(b);
  });
})();
