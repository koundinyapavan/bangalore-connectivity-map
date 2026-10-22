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

/* ---------------- METRO ---------------- */
const METRO = [
  {name:'Purple Line',color:'#7B2D8E',status:'op',pts:[['Challaghatta',12.89738,77.46124],['Kengeri',12.90799,77.47599],['Kengeri Bus Terminal',12.91464,77.48770],['Pattanagere',12.92428,77.49831],['Jnanabharathi',12.93545,77.51218],['Rajarajeshwari Nagar',12.93669,77.51956],['Nayandahalli',12.94183,77.52516],['Mysuru Road',12.94673,77.53007],['Deepanjali Nagar',12.95221,77.53710],['Attiguppe',12.96210,77.53371],['Vijayanagar',12.97082,77.53736],['Hosahalli',12.97432,77.54510],['Magadi Road',12.97566,77.55541],['Majestic',12.97569,77.57284],['Central College',12.97428,77.58395],['Vidhana Soudha',12.97969,77.59263],['Cubbon Park',12.98090,77.59747],['MG Road',12.97577,77.60597],['Trinity',12.97303,77.61684],['Halasuru',12.97636,77.62671],['Indiranagar',12.97826,77.63853],['Swami Vivekananda Road',12.98591,77.64500],['Baiyappanahalli',12.99067,77.65259],['Benniganahalli',12.99637,77.66826],['KR Puram',12.99992,77.67761],['Mahadevapura',12.99656,77.69271],['Garudacharpalya',12.99349,77.70370],['Hoodi',12.98878,77.71136],['Seetharam Palya',12.98097,77.70871],['Kundalahalli',12.97761,77.71552],['Nallurhalli',12.97663,77.72475],['Sri Sathya Sai Hospital',12.98103,77.72761],['Pattandur Agrahara',12.98762,77.73774],['Kadugodi Tree Park',12.98571,77.74684],['Hopefarm Channasandra',12.98735,77.75380],['Whitefield Kadugodi',12.99563,77.75780]]},
  {name:'Green Line',color:'#00953B',status:'op',pts:[['Madavara',13.05738,77.47296],['Chikkabidarakallu',13.05242,77.48789],['Manjunathanagar',13.05015,77.49439],['Nagasandra',13.04811,77.50012],['Dasarahalli',13.04354,77.51238],['Jalahalli',13.03958,77.51984],['Peenya Industry',13.03645,77.52545],['Peenya',13.03299,77.53347],['Goraguntepalya',13.02849,77.54087],['Yeshwantpur',13.02331,77.54986],['Sandal Soap Factory',13.01473,77.55403],['Mahalakshmi',13.00834,77.54883],['Rajajinagar',13.00035,77.54975],['Mahakavi Kuvempu Road',12.99850,77.55695],['Srirampura',12.99653,77.56336],['Sampige Road',12.99055,77.57080],['Majestic',12.97569,77.57284],['Chickpete',12.96755,77.57479],['KR Market',12.96016,77.57448],['National College',12.95061,77.57374],['Lalbagh',12.94627,77.57994],['South End Circle',12.93832,77.58007],['Jayanagar',12.92967,77.58018],['RV Road',12.92159,77.58026],['Banashankari',12.91554,77.57363],['JP Nagar',12.90756,77.57306],['Yelachenahalli',12.89605,77.57016],['Konanakunte Cross',12.88891,77.56278],['Doddakallasandra',12.88464,77.55282],['Vajarahalli',12.87749,77.54482],['Thalaghattapura',12.87137,77.53844],['Silk Institute',12.86167,77.52998]]},
  {name:'Yellow Line',color:'#E0A800',status:'op',pts:[['RV Road',12.92159,77.58026],['Ragigudda',12.91900,77.58409],['Jayadeva Hospital',12.91673,77.60009],['BTM Layout',12.91649,77.60806],['Central Silk Board',12.91649,77.62047],['Bommanahalli',12.91065,77.62640],['Hongasandra',12.90162,77.63195],['Kudlu Gate',12.89002,77.63918],['Singasandra',12.88066,77.64482],['Hosa Road',12.87016,77.65275],['Beratena Agrahara',12.86368,77.65790],['Electronic City',12.85624,77.66378],['Konappana Agrahara',12.85624,77.66378],['Huskur Road',12.83888,77.67743],['Hebbagodi',12.82897,77.68140],['Bommasandra',12.81931,77.68833]]},
  {name:'Pink Line (UC)',color:'#E6007E',status:'uc',pts:[['Kalena Agrahara',12.866,77.5915],['Hulimavu',12.88,77.596],['IIM Bangalore',12.8935,77.601],['JP Nagar 4th Phase',12.908,77.5985],['Jayadeva Hospital',12.918,77.6],['Tavarekere',12.929,77.5995],['Dairy Circle',12.943,77.6025],['Lakkasandra',12.953,77.601],['Vellara Junction',12.965,77.605],['MG Road',12.9757,77.6069],['Shivaji Nagar',12.9855,77.6045],['Cantonment',12.996,77.601],['Pottery Town',13.0045,77.6115],['Tannery Road',13.0095,77.618],['Venkateshpura',13.0175,77.621],['Kadugondanahalli',13.026,77.622],['Nagawara',13.043,77.6205]]},
  {name:'Blue Line — ORR + Airport (UC)',color:'#29A3DD',status:'uc',pts:[['Central Silk Board',12.91649,77.62047],['HSR Layout',12.91640,77.63308],['Agara',12.92118,77.64414],['Ibbaluru',12.91650,77.64650],['Bellandur',12.92799,77.68077],['Kadubeesanahalli',12.93500,77.69600],['Kodibeesanahalli',12.94200,77.69750],['Marathahalli',12.95654,77.70111],['ISRO',12.97022,77.70031],['Doddanekkundi',12.98240,77.70908],['DRDO Sports Complex',12.98582,77.69100],['Saraswathi Nagar',12.99385,77.68552],['KR Puram',12.99992,77.67761],['Kasturi Nagar',13.00401,77.66318],['Horamavu',13.01735,77.65958],['Kalyan Nagar',13.02251,77.64757],['HBR Layout',13.04140,77.62506],['Nagawara',13.03974,77.62470],['Veerannapalya',13.04117,77.61819],['Kempapura',13.04373,77.60540],['Hebbal',13.04256,77.58622],['Kodigehalli',13.06200,77.59000],['Jakkur Cross',13.06992,77.59325],['Yelahanka',13.10194,77.60036],['Bagalur Cross',13.12200,77.61057],['Bettahalasuru',13.15200,77.61800],['Chikkajala',13.17276,77.63336],['Doddajala',13.18343,77.65222],['Airport City',13.19836,77.68699],['Kempegowda International Airport',13.19860,77.70630]]},
  {name:'Orange Line (Phase 3, planned)',color:'#E8720C',status:'pl',pts:[['JP Nagar 4th Phase',12.90635,77.59955],['Kadirenahalli',12.91552,77.56266],['Hosakerehalli',12.92217,77.53626],['Nagarbhavi',12.97193,77.51275],['Sumanahalli',12.98775,77.51911],['Nandini Layout',13.01366,77.53394],['Kempapura Hebbal',13.05291,77.60149]]},
  {name:'Red Line (proposed, Hebbal–Sarjapur)',color:'#D64545',status:'pl',pts:[['Hebbal',13.03536,77.59879],['Nagawara',13.04216,77.61358],['Kalyan Nagar',13.02399,77.64329],['KR Puram',13.01700,77.70443],['Marathahalli',12.95692,77.70113],['Bellandur',12.93043,77.67840],['Ibbaluru',12.91650,77.64650],['Agara',12.92306,77.64645],['Carmelaram',12.90615,77.70658],['Sarjapur',12.85756,77.78641]]}
];

/* ---------------- K-RIDE SUBURBAN ---------------- */
const KRIDE = [
  {name:'Sampige Line · C1 · KSR ↔ Devanahalli/Airport (41.4 km) — tendering/early civil · off.2026 → realistic 2032–34',color:'#6B8E23',pts:[['KSR Bengaluru',12.9772,77.5700],['Srirampura',12.9930,77.5660],['Malleswaram',13.0030,77.5670],['Yeshwantpur',13.0230,77.5540],['Muthyal Nagar',13.0300,77.5560],['Lottegollahalli',13.0400,77.5620],['Kodigehalli',13.0620,77.5820],['Judicial Layout',13.0800,77.5850],['Yelahanka',13.1007,77.5963],['Nitte Meenakshi',13.1250,77.5980],['Bettahalasoor',13.1550,77.6050],['Doddajala',13.2000,77.6550],['Airport Trumpet',13.2200,77.6900],['Devanahalli',13.2480,77.7100]]},
  {name:'Mallige Line · C2 · Baiyyappanahalli ↔ Chikkabanavara (25 km) — UC (L&T viaduct) · off.2026 → realistic 2030–32',color:'#2563EB',pts:[['Baiyyappanahalli',12.9960,77.6540],['Kasturi Nagar',13.0050,77.6620],['Seva Nagar',13.0060,77.6470],['Banaswadi',13.0150,77.6470],['Kaveri Nagar',13.0300,77.6320],['Nagawara',13.0430,77.6200],['Kanaka Nagar',13.0380,77.6060],['Hebbal',13.0358,77.5920],['Lottegollahalli',13.0400,77.5620],['Yeshwantpur',13.0230,77.5540],['Jalahalli',13.0470,77.5450],['Shettyhalli',13.0620,77.5300],['Myadarahalli',13.0660,77.5150],['Chikkabanavara',13.0720,77.5030]]},
  {name:'Parijaata Line · C3 · Kengeri ↔ Whitefield (35.5 km) — tendering · off.2026 → realistic 2032–35',color:'#B91C1C',pts:[['Kengeri',12.9090,77.4850],['RV College',12.9230,77.4990],['Jnanabharati',12.9370,77.5130],['Nayandahalli',12.9450,77.5300],['Krishnadevaraya',12.9520,77.5470],['Jagjeevanram Nagar',12.9650,77.5620],['KSR Bengaluru',12.9772,77.5700],['Kumara Park',12.9880,77.5830],['Bengaluru Cantt',12.9990,77.5980],['Bengaluru East',12.9950,77.6220],['Baiyyappanahalli',12.9960,77.6540],['Krishnarajapura',13.0076,77.6961],['Hoodi',12.9920,77.7150],['Whitefield',12.9976,77.7581]]},
  {name:'Kanaka Line · C4 · Heelalige ↔ Rajankunte via Bellandur/Marathahalli (46.3 km) — UC (L&T viaduct) · off.2026 → realistic 2030–33',color:'#A0522D',pts:[['Heelalige',12.7920,77.6820],['Bommasandra',12.8070,77.6800],['Singena Agrahara',12.8180,77.6820],['Huskur',12.8380,77.6850],['Ambedkar Nagar',12.8600,77.6950],['Carmelaram',12.9050,77.7150],['Bellandur Road',12.9350,77.7000],['Marathahalli',12.9560,77.7010],['Doddanekundi',12.9770,77.6960],['Kaggadasapura',12.9900,77.6720],['Benniganahalli',12.9950,77.6600],['Channasandra',13.0200,77.6650],['Horamavu',13.0270,77.6480],['Hennur',13.0420,77.6400],['Thanisandra',13.0620,77.6250],['R.K.Hegde Nagar',13.0720,77.6200],['Jakkur',13.0800,77.6050],['Yelahanka',13.1007,77.5963],['Muddanahalli',13.1500,77.5600],['Rajankunte',13.2400,77.5250]]},
];

/* ---------------- ROADS ---------------- */
const ROADS = [
  {name:'Peripheral Ring Road / Bengaluru Business Corridor (73 km · Tumkur Rd ↔ Hosur Rd, N+E arc; closes the ring with NICE at both ends · off.2029 → realistic 2032–35+)',color:'#8d99ae',dash:'10,8',pts:[[13.0550,77.4750],[13.0780,77.4920],[13.0950,77.5100],[13.1080,77.5360],[13.1220,77.5530],[13.1200,77.5780],[13.1190,77.6050],[13.0950,77.6330],[13.0680,77.6560],[13.0430,77.6900],[13.0190,77.7180],[13.0030,77.7460],[12.9850,77.7620],[12.9550,77.7750],[12.9200,77.7820],[12.8880,77.7760],[12.8660,77.7180],[12.8510,77.6840],[12.8420,77.6600]]},
  {name:'Satellite Town Ring Road / NH-948A (freight bypass, ~288 km)',color:'#6c757d',dash:'4,8',pts:[[13.2300,77.3500],[13.2900,77.5300],[13.2600,77.7100],[13.0700,77.8300],[12.8600,77.8500],[12.7100,77.7000],[12.6600,77.4600],[12.7500,77.3000],[12.9600,77.2500],[13.1200,77.2900],[13.2300,77.3500]]},
  {name:'NICE Peripheral Road (operational · closes the ring with PRR)',color:'#264653',dash:null,pts:[[13.0550,77.4750],[13.0050,77.4700],[12.9550,77.4680],[12.9100,77.4780],[12.8750,77.4900],[12.8550,77.5200],[12.8500,77.5480],[12.8500,77.5850],[12.8450,77.6250],[12.8400,77.6600]]},
  {name:'Proposed Hebbal ↔ Silk Board tunnel (approved 2025, unfunded)',color:'#E67E22',dash:'2,7',pts:[[13.0358,77.5970],[12.9900,77.6050],[12.9500,77.6120],[12.9170,77.6230]]},
];

/* ---------------- BOTTLENECKS / HUBS / SOCIAL ---------------- */
const BOTTLE = [['Central Silk Board',12.9170,77.6230],['Iblur Junction',12.9180,77.6650],['Marathahalli Bridge',12.9560,77.7010],['Hebbal Flyover',13.0358,77.5970],['Goraguntepalya',13.0280,77.5370]];
const HUBS = [['Bellandur (ORR)',12.9260,77.6760],['Marathahalli (ORR)',12.9560,77.7010],['Manyata Tech Park',13.0430,77.6200],['Electronic City',12.8450,77.6600]];
const SCHOOLS = [['TISB (Intl School Bangalore)',12.9960,77.7460],['Greenwood High (Sarjapur)',12.8820,77.7920],['Oakridge (Varthur)',12.9050,77.7600],['Inventure Academy',12.8840,77.7720],['Mallya Aditi (Yelahanka)',13.0930,77.5900],['Stonehill Intl (Devanahalli)',13.1550,77.6320],['Canadian Intl (Yelahanka)',13.0840,77.6010]];
const HOSP = [['Sakra World (Bellandur)',12.9300,77.6860],['Narayana Health City (E-City)',12.8030,77.6940],['Manipal Whitefield',12.9660,77.7170],['Aster CMI (Hebbal)',13.0480,77.5930],['Columbia Asia Whitefield',12.9960,77.7500],['Fortis/Apollo (Bannerghatta)',12.8900,77.5990],['Motherhood (Sarjapur)',12.9100,77.6900]];

/* ---------------- PROPERTIES ---------------- */

const TYPECOLOR={villa:'#C0392B',apartment:'#2E86C1',plot:'#8E44AD'};
const CORR_TRANSIT={
  East:'ORR/Whitefield tech belt — Purple metro (live) + Blue ORR (~2028) + Kanaka suburban (~2029). Sarjapur end: no near-term metro (Red 3A ~2033+).',
  North:'Airport/Manyata corridor — Blue airport metro (2027–28) + Sampige/Kanaka suburban (~2029). Devanahalli is not an ORR commute.',
  South:'Bannerghatta / E-City / Kanakapura — Pink (~2026, Bannerghatta) · Yellow (live, E-City/Hosur Rd) · Green (live, Kanakapura).',
  Central:'Central Bengaluru — Purple/Green (live) + Pink (~2026).',
  West:'West Bengaluru — Purple/Green metro (live).'
};
function upcomingSchedule(p){
  if(!p.upcoming) return '';
  return '<div style="margin-top:5px;border-top:1px solid #333;padding-top:4px"><span class="rn">Upcoming project</span> — usually sold on a construction-linked payment plan (pay in slabs as it is built), so you can enter before completion while the metro / suburban-rail / ring-road network matures around it.</div>';
}
function popup(p){
  const st=p.status==='uc'?'<span class="pill uc">Under construction</span>':'<span class="pill op">Ready / resale</span>';
  const geo=p.geo==='verified'?'<span style="color:#2ec27e">GPS-verified (site visit)</span>':p.geo==='geocoded'?'<span style="color:#7fbfff">geocoded via Google Places (project-level)</span>':'<span style="color:#e6b800">approx (locality-level)</span>';
  return '<b>'+p.name+'</b> '+(p.upcoming?'<span class="rn">★</span>':'')+'<br><small>'+p.dev+' · '+p.corr+' · '+p.area+'</small>'+
    '<div style="margin-top:4px">'+cap(p.type)+' · '+p.config+'</div>'+
    '<div>Price <b>₹'+p.min+'–'+p.max+' Cr</b> · '+st+'</div>'+
    '<div><b>Completion:</b> '+p.poss+'</div>'+
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