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

const TYPECOLOR={villa:'#C0392B',apartment:'#2E86C1',plot:'#8E44AD',unknown:'#87939f'};
const esc=PropertyUtils.escapeHtml;
const STATUS_LABEL={ready:'Reported ready / resale',uc:'Reported under construction',mixed:'Mixed phases / towers',unknown:'Stage not confirmed'};
const CORR_TRANSIT={
  East:'Purple operates through Whitefield. Blue ORR is under construction; Red Hebbal–Sarjapur remains a proposal with Union approval unverified.',
  North:'Blue airport corridor is under construction. Compare station access and interchange time separately from airport-road proximity.',
  South:'Green and Yellow operate. Pink is under construction. Check the station and section relevant to the property.',
  Central:'Purple and Green operate; Pink is under construction.',
  West:'Purple and Green operate. Orange and Grey form Union-approved Phase 3; approval is not an opening guarantee.'
};
function upcomingSchedule(p){return p.upcoming?'<div style="margin-top:5px"><small>Reported upcoming project. Confirm the registered phase, construction stage and payment terms.</small></div>':'';}
function nearestMetro(p){
  if(p.legacyReview)return '<div style="margin-top:5px;color:#e6b800"><b>Metro distances withheld:</b> this restored legacy point needs identity/location review. Confirm the parcel and entrance before assessing station access.</div>';
  const best=PropertyUtils.nearestStations(p,METRO,(a,b,c,d)=>L.latLng(a,b).distanceTo(L.latLng(c,d)));
  const labels={op:'Operating',uc:'Under construction',approved:'Union-approved Phase 3',proposed:'Other proposal (Union approval unverified)'};
  return '<div style="margin-top:5px;border-top:1px solid #333;padding-top:4px"><b>Nearest metro by stage</b> <small>(straight-line to station point; not walking distance)</small>'+Object.keys(labels).map(k=>best[k]?'<div>'+labels[k]+': <b>'+esc(best[k].station)+'</b> ('+esc(best[k].line)+') — '+(best[k].d/1000).toFixed(1)+' km</div>':'').join('')+'</div>';
}
function priceStr(p){return p.min==null?'not confirmed':'₹'+p.min+(p.max==null?'+':'–'+p.max)+' Cr';}
function sourceLink(url,label){return /^https:\/\//.test(url||'')?'<a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(label)+'</a>':'';}
function popup(p){
  const sources=(p.sources||[]).map((u,i)=>sourceLink(u,'Source '+(i+1))).join(' · ');
  const fields=p.fieldReview||{};
  return (p.legacyReview?'<div style="color:#e6b800"><b>Restored legacy listing — needs review</b><br>'+esc(p.legacyReviewReason)+'</div>':'')+'<b>'+esc(p.name)+'</b> '+(p.upcoming?'<span class="rn">★</span>':'')+'<br><small>'+esc(p.dev)+' · '+esc(p.corr)+' · '+esc(p.area)+'</small>'+
    '<div style="margin-top:4px">'+esc(cap(p.type))+' · '+esc(p.config)+'</div>'+
    '<div>Project-wide asking range <b>'+priceStr(p)+'</b> (unverified; not a 3 BHK quote)</div>'+
    '<div><b>'+esc(STATUS_LABEL[p.status]||STATUS_LABEL.unknown)+'</b></div>'+
    '<div><b>Completion / target:</b> '+esc(p.poss)+'</div>'+
    nearestMetro(p)+
    '<div style="margin-top:5px"><b>Corridor context</b><br>'+esc(CORR_TRANSIT[p.corr]||'Compare the individual station connections.')+'</div>'+
    '<div style="margin-top:5px"><small>Pin: '+esc(p.coordinateQuality||p.geo)+'<br>'+esc(p.coordinateSource||'Source not recorded')+'</small></div>'+
    '<div style="margin-top:4px;color:#e6b800"><small>Stage evidence: '+esc(fields.stage||'Not checked')+'<br>Price: '+esc(fields.price||'Not checked')+'<br>3 BHK availability, gate-to-station walk and all-in price: not checked.</small></div>'+
    (p.auditNote?'<p>'+esc(p.auditNote)+'</p>':'')+
    '<div><small>Catalogue reviewed '+esc(p.checkedDate||'date unknown')+'; inherited fields may be older. '+sources+' · <a href="research.html">Full catalogue &amp; coverage gaps</a></small></div>'+upcomingSchedule(p);
}
function cap(s){return s==='unknown'?'Product not confirmed':s.charAt(0).toUpperCase()+s.slice(1);}
const bandOverlap=PropertyUtils.bandOverlap;
const projYear=PropertyUtils.projectYear;
const compBucket=PropertyUtils.completionBucket;
function getChecked(cls){return Array.from(document.querySelectorAll('.'+cls+':checked')).map(e=>e.value);}
let shownMarkers=[];
function activeChips(id){var c=document.getElementById(id);if(!c)return [];return Array.from(c.querySelectorAll('.chip.active')).map(x=>x.getAttribute('data-val'));}
function highlightRow(i){document.querySelectorAll('.lrow.active').forEach(r=>r.classList.remove('active'));var r=document.getElementById('lrow-'+i);if(r){r.classList.add('active');r.scrollIntoView({block:'nearest'});}}
function focusProp(i){var s=shownMarkers[i];if(!s)return;highlightRow(i);if(propLayer.zoomToShowLayer&&s.marker){propLayer.zoomToShowLayer(s.marker,function(){if(s.marker.openPopup)s.marker.openPopup();});}else{map.setView([s.lat,s.lng],15);if(s.marker&&s.marker.openPopup)s.marker.openPopup();}}
function renderProps(){
  propLayer.clearLayers(); shownMarkers=[];
  const types=getChecked('fType'),stats=getChecked('fStatus'),bands=getChecked('fBand'),comps=getChecked('fComplete');
  const devs=activeChips('devChips'),corrs=activeChips('corrChips');
  const sEl=document.getElementById('search'),q=(sEl&&sEl.value?sEl.value:'').trim().toLowerCase();
  const srtEl=document.getElementById('sort'),sort=srtEl?srtEl.value:'def';
  const showLabels=document.getElementById('lLabels').checked;
  let list=PROPS.filter(p=>PropertyUtils.validPin(p)&&types.includes(p.type)&&stats.includes(p.status)&&bandOverlap(bands,p.min,p.max)&&comps.includes(compBucket(p))
    &&(devs.length===0||devs.includes(p.dev))&&(corrs.length===0||corrs.includes(p.corr))
    &&(q===''||[p.name,p.dev,p.area,p.corr,...(p.aliases||[])].join(' ').toLowerCase().indexOf(q)>=0));
  if(sort==='pmin')list.sort((a,b)=>(a.min==null?1e9:a.min)-(b.min==null?1e9:b.min));
  else if(sort==='pmax')list.sort((a,b)=>(b.max==null?(b.min==null?-1:b.min):b.max)-(a.max==null?(a.min==null?-1:a.min):a.max));
  else if(sort==='soon')list.sort((a,b)=>PropertyUtils.dateCompare(a,b)||(a.min==null?1e9:a.min)-(b.min==null?1e9:b.min));
  else if(sort==='late')list.sort((a,b)=>PropertyUtils.dateCompare(a,b,true));
  else if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  let rows='';
  list.forEach(p=>{
    const i=shownMarkers.length;
    const mk=L.circleMarker([p.lat,p.lng],{radius:8,weight:p.upcoming||p.legacyReview?3:2,color:p.legacyReview?'#e6b800':p.upcoming?'#e9c46a':'#fff',dashArray:p.legacyReview?'3,3':null,fillColor:TYPECOLOR[p.type],fillOpacity:p.legacyReview?0.55:1})
      .bindPopup(popup(p))
      .bindTooltip((p.upcoming?'★ ':'')+p.name,{permanent:showLabels,direction:'right',className:'plabel',offset:[8,0]});
    mk.on('popupopen',function(){highlightRow(i);});
    propLayer.addLayer(mk);
    shownMarkers.push({lat:p.lat,lng:p.lng,marker:mk});
    rows+='<div class="lrow" id="lrow-'+i+'" onclick="focusProp('+i+')"><span class="dot" style="background:'+TYPECOLOR[p.type]+'"></span> '+(p.upcoming?'★ ':'')+'<b>'+esc(p.name)+'</b>'+(p.legacyReview?' <span style="color:#e6b800">Needs review</span>':'')+'<br><span class="lmeta">'+esc(p.dev)+' · '+esc(p.area)+' · '+priceStr(p)+' · '+esc(STATUS_LABEL[p.status]||STATUS_LABEL.unknown)+'</span></div>';
  });
  document.getElementById('count').textContent=shownMarkers.length+' of '+PROPS.length+' shown'+((devs.length||corrs.length||q)?' · filtered':'');
  var lb=document.getElementById('listBody'); if(lb) lb.innerHTML=rows;
  var lc=document.getElementById('lcount'); if(lc) lc.textContent=shownMarkers.length;
}

/* build builder + corridor chips */
function buildChips(id,vals){var c=document.getElementById(id);if(!c)return;c.innerHTML=vals.map(v=>'<span class="chip active" data-val="'+v+'">'+v+'</span>').join('');c.addEventListener('click',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('chip')){e.target.classList.toggle('active');renderProps();}});}
buildChips('devChips',Array.from(new Set(PROPS.map(p=>p.dev))).sort());
buildChips('corrChips',['East','North','South','Central','West','Unknown']);

/* default layers on */
[metroLayer,krideLayer,propLayer].forEach(l=>l.addTo(map));
const requestedProject=new URLSearchParams(window.location.search).get('project');
if(requestedProject)document.getElementById('search').value=requestedProject;
renderProps();
if(requestedProject&&shownMarkers.length===1)focusProp(0);

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
