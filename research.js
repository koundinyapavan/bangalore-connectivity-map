'use strict';
const $=id=>document.getElementById(id), esc=PropertyUtils.escapeHtml;
let catalogue=[],limit=100;
function link(url,label){return /^https:\/\//.test(url||'')?'<a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(label)+'</a>':'';}
function renderCatalogue(){
  const query=$('query').value.trim().toLowerCase(),builder=$('builder').value,line=$('line').value,range=$('distance').value,admission=$('admission').value;
  const rows=catalogue.filter(r=>{
    if(builder&&r.builder!==builder)return false;
    if(query&&![r.builder,r.property_name,r.area,...r.aliases].join(' ').toLowerCase().includes(query))return false;
    if(admission==='mapped'&&!r.map_name||admission==='unmapped'&&r.map_name)return false;
    if(line){const d=r.line_distances.find(x=>x.line===line);if(!d||range!=='all'&&d.aerial_km>Number(range))return false;}
    return true;
  });
  $('count').textContent=rows.length+' matching records · showing '+Math.min(limit,rows.length)+'. Phases may share a campus.';
  $('rows').innerHTML=rows.slice(0,limit).map(r=>{
    const distances=line?r.line_distances.filter(d=>d.line===line):[...r.line_distances].sort((a,b)=>a.aerial_km-b.aerial_km).slice(0,2);
    const metro=distances.map(d=>'<div><b>'+esc(d.line)+'</b> · '+esc(d.station)+' · '+d.aerial_km.toFixed(2)+' km<small>'+esc(d.metro_status)+'</small></div>').join('')||'Location unresolved; no distance claim';
    const point=Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)?r.latitude.toFixed(6)+', '+r.longitude.toFixed(6):'Coordinates withheld / not found';
    return '<tr><td><b>'+esc(r.property_name)+'</b><small>'+esc(r.builder)+' · '+esc(r.area)+'</small><span class="tag">'+esc(r.record_kind)+'</span>'+(r.aliases.length?'<small>Aliases: '+esc(r.aliases.join('; '))+'</small>':'')+(r.map_name?'<p><a href="index.html?project='+encodeURIComponent(r.map_name)+'">Locate on map →</a></p>':'')+'</td>'+
      '<td>'+esc(r.property_type)+'<small>'+esc(r.stage_reported)+'</small><small>3 BHK / live stock / price: not checked</small>'+(r.review_note?'<p class="warning">'+esc(r.review_note)+'</p>':'')+'</td>'+
      '<td>'+metro+'<small>Station-point aerial distance; gate and route unverified.</small></td>'+
      '<td>'+esc(r.evidence)+'<small>'+r.sources.map((u,i)=>link(u,'Source '+(i+1))).join(' · ')+'</small><small>'+esc(point)+'<br>'+esc(r.coordinate_quality)+'</small><small>'+link(r.coordinate_source,'Coordinate source')+'</small><small>'+esc(r.map_admission)+'</small></td></tr>';
  }).join('');
  $('more').hidden=rows.length<=limit;
}
async function loadCatalogue(){
  try{
    const responses=await Promise.all(['properties','builders','summary'].map(n=>fetch('audit/'+n+'.json').then(r=>{if(!r.ok)throw Error(n+' could not be loaded');return r.json();})));
    const [properties,builders,summary]=responses;catalogue=properties;
    $('summary').textContent=summary.catalogue_records+' catalogue records · '+summary.builders+' builders · '+summary.mapped_records+' mapped · '+summary.unmapped_catalogue_records+' without map admission. Historical completeness not established.';
    for(const b of builders){const o=document.createElement('option');o.value=b.builder;o.textContent=b.builder;$('builder').appendChild(o);}
    for(const name of ['Purple','Blue','Green','Pink','Yellow','Orange','Grey','Red']){const o=document.createElement('option');o.value=name;o.textContent=name;$('line').appendChild(o);}
    $('builders').innerHTML=builders.map(b=>'<tr><td><b>'+esc(b.builder)+'</b></td><td>'+b.original_map_records+'</td><td>'+b.catalogue_records+'<small>'+b.mapped_records+' mapped</small></td><td>'+esc(b.coverage)+'<small>'+esc(b.retrieval)+'</small><small>'+esc(b.coverage_note)+'</small><small>'+b.source_urls.map((u,i)=>link(u,'Source '+(i+1))).join(' · ')+'</small></td></tr>').join('');
    for(const id of ['query','builder','line','distance','admission'])$(id).addEventListener(id==='query'?'input':'change',()=>{limit=100;renderCatalogue();});
    $('more').addEventListener('click',()=>{limit+=100;renderCatalogue();});renderCatalogue();
  }catch(error){$('summary').textContent='Catalogue could not load. Serve this folder over HTTP, or open the JSON files directly. '+error.message;}
}
loadCatalogue();
