/* Optional test deps: jsdom, leaflet, leaflet.markercluster.
 * AUDIT_TEST_MODULES may point to an external node_modules directory. */
const path=require('node:path');
const dependency=name=>require.resolve(process.env.AUDIT_TEST_MODULES?path.join(process.env.AUDIT_TEST_MODULES,name):name);
const {JSDOM,VirtualConsole}=require(dependency('jsdom'));
const assert=require('node:assert/strict'),fs=require('node:fs');
const summary=JSON.parse(fs.readFileSync(path.join(__dirname,'../audit/summary.json'),'utf8'));
const base='http://127.0.0.1:8765/';
async function wait(fn,label){for(let i=0;i<150;i++){if(fn())return;await new Promise(r=>setTimeout(r,30));}throw Error('Timed out: '+label)}
(async()=>{
 const server=require('node:http').createServer((req,res)=>{try{const filename=require('node:path').join(process.cwd(),decodeURIComponent(req.url.split('?')[0]));const body=fs.readFileSync(filename);res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript':filename.endsWith('.json')?'application/json':filename.endsWith('.css')?'text/css':'text/html');res.end(body)}catch{res.writeHead(404);res.end()}});await new Promise(r=>server.listen(8765,'127.0.0.1',r));server.unref();
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const catalogue=await JSDOM.fromURL(base+'research.html',{resources:'usable',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=u=>fetch(new URL(u,base));}});
 const w=catalogue.window,d=w.document;
 await wait(()=>d.querySelector('#rows tr'),'catalogue');
 assert.equal(d.querySelectorAll('#builder option').length,64);
 const input=(id,value,event='change')=>{d.getElementById(id).value=value;d.getElementById(id).dispatchEvent(new w.Event(event))};
 input('line','Purple');input('distance','0.5');input('query','Brigade Woods','input');
 assert.equal(d.querySelectorAll('#rows tr').length,1);assert.match(d.getElementById('rows').textContent,/Operating/);
 input('query','','input');input('line','');input('builder','Tata Housing');assert.match(d.getElementById('rows').textContent,/New Haven/);
 input('builder','');input('admission','');input('query','Oakville','input');assert.equal(d.querySelectorAll('#rows a[href^="index.html"]').length,1);assert.match(d.getElementById('rows').textContent,/Restored legacy listing/);
 input('query','Sumadhura The Olympus','input');assert.equal(d.querySelectorAll('#rows a[href^="index.html"]').length,0);assert.match(d.getElementById('rows').textContent,/Hyderabad/);
 input('admission','');input('query','<img onerror="throw Error()">','input');assert.equal(d.querySelectorAll('#rows img').length,0);
 catalogue.window.close();
 // Execute the real Leaflet and cluster libraries; JSDOM checks DOM/logic, not layout.
 let html=await (await fetch(base+'index.html?project=Brigade%20Woods')).text();
 html=html.replace(/<link[^>]+href="https:[^"]+"[^>]*>/g,'').replace(/<script src="https:[^"]+"><\/script>/g,'');
 html=html.replace('</head>','<script>'+fs.readFileSync(dependency('leaflet/dist/leaflet-src.js'),'utf8')+'</script><script>'+fs.readFileSync(dependency('leaflet.markercluster/dist/leaflet.markercluster-src.js'),'utf8')+'</script></head>');
 const mapdom=new JSDOM(html,{url:base+'index.html?project=Brigade%20Woods',resources:'usable',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.SVGSVGElement.prototype.createSVGRect=()=>({});w.HTMLElement.prototype.scrollIntoView=()=>{};

 }});
 const mw=mapdom.window,md=mw.document;
 await wait(()=>md.getElementById('count').textContent.includes('1 of'),'map');
 assert.match(md.getElementById('listBody').textContent,/Brigade Woods/);
 const popup=mw.eval("popup(PROPS.find(p=>p.name==='Brigade Woods'))");
 for(const t of ['Operating','Under construction','Union-approved','Other proposal','not a 3 BHK quote'])assert(popup.includes(t),t);
 md.getElementById('reset').click();await wait(()=>md.getElementById('count').textContent.startsWith(summary.mapped_records+' of'),'reset');
 for(const [query,name] of [['NCC Ivory Heights','NCC Urban Ivory Heights'],['NCC Urban (Aster Park)','NCC Aster Park'],['TE Windmills of Your Mind','Windmills of Your Mind'],['Karle Town Centre (Zenith)','Karle Zenith Residences']]){
  md.getElementById('search').value=query;md.getElementById('search').dispatchEvent(new mw.Event('input'));
  assert(md.getElementById('count').textContent.startsWith('1 of'),query);
  assert.match(md.getElementById('listBody').textContent,new RegExp(name),query);
  const p=mw.eval('PROPS.find(p=>p.name==='+JSON.stringify(name)+')');
  if(query.startsWith('NCC'))assert.equal(p.type,'apartment',query);assert.equal(p.legacy,true,query);
 }
 md.getElementById('reset').click();
 const audit=JSON.parse(fs.readFileSync(path.join(__dirname,'../audit/removal-audit.json'),'utf8'));
 for(const record of audit.filter(r=>r.missing_from_published_expansion&&r.current_map_names.length)){
  md.getElementById('search').value=record.original_name;md.getElementById('search').dispatchEvent(new mw.Event('input'));
  assert(record.current_map_names.some(name=>md.getElementById('listBody').textContent.includes(name)),record.original_name);
 }
 md.getElementById('reset').click();
 const uncertain=mw.eval("popup(PROPS.find(p=>p.name==='Purva Eminora'))");
 assert(uncertain.includes('Restored legacy listing'));assert(uncertain.includes('Metro distances withheld'));assert(!uncertain.includes('Nearest metro by stage'));
 for(const status of ['ready','uc','mixed']){const el=md.querySelector('.fStatus[value="'+status+'"]');el.checked=false;el.dispatchEvent(new mw.Event('change'));}
 assert.match(md.getElementById('listBody').textContent,/Stage not confirmed/);
 assert(!md.getElementById('listBody').textContent.includes('Reported ready'));
 mapdom.window.close();server.close();assert.deepEqual(errors,[]);
 console.log('PASS: real Leaflet/cluster script initialization, catalogue load, 63 builders, line/distance/search filters, source rendering, withheld pins, map deep-link, four-stage popup renderer, reset and unknown-status filtering; no JSDOM errors. Layout and visual rendering are not covered.');
})().catch(e=>{console.error(e);process.exit(1)});
