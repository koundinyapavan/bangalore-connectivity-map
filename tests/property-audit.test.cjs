const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const u=require('../property-utils.js');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,'audit',n),'utf8'));
const source=fs.readFileSync(path.join(root,'data.js'),'utf8');
const context={};vm.createContext(context);
vm.runInContext(source.slice(0,source.indexOf('const KRIDE'))+';this.props=PROPS;this.lines=METRO;',context);
const {props,lines}=context;
const catalogue=read('properties.json'),builders=read('builders.json'),summary=read('summary.json');

assert.equal(u.projectYear({status:'uc',poss:'Not confirmed'}),null);
assert.equal(u.projectYear({status:'ready',poss:'Ready'}),null);
assert.equal(u.projectYear({status:'mixed',poss:'Block B 2027; A ready'}),null);
assert.equal(u.projectYear({status:'unknown',poss:'2030 marketing estimate'}),null);
assert.equal(u.completionBucket({status:'uc',poss:'Aug 2026'}),'target26');
assert.equal(u.completionBucket({status:'ready',poss:'Completed'}),'ready');
assert.equal(u.completionBucket({status:'mixed',poss:'Block A ready; B Dec 2027'}),'unknown');
assert.equal(u.completionBucket({status:'unknown',poss:'2028 advertised'}),'unknown');
assert.equal(u.completionBucket({status:'uc',poss:'Confirm with builder'}),'unknown');
assert.equal(u.bandOverlap(['lo'],null,null),false);
assert.equal(u.bandOverlap(['unknown'],null,null),true);
assert.equal(u.bandOverlap([],1,3),false);
assert.equal(u.bandOverlap(['unknown'],1,3),false);
for(const descending of [false,true]){
  assert(u.dateCompare({poss:'Unknown'},{poss:'2032'},descending)>0);
  assert(u.dateCompare({poss:'2028'},{poss:'Unknown'},descending)<0);
}
const synthetic=[
  {name:'Purple Line',status:'op',pts:[['Running',1,1]]},
  {name:'Blue Line',status:'uc',pts:[['Construction',2,2]]},
  {name:'Orange Line',status:'pl',pts:[['Approved',3,3]]},
  {name:'Red Line',status:'pl',pts:[['Proposal',0,0]]}
];
const nearest=u.nearestStations({lat:0,lng:0},synthetic,(a,b,c,d)=>Math.hypot(c-a,d-b));
assert.deepEqual(Object.keys(nearest).sort(),['approved','op','proposed','uc']);
assert.equal(nearest.uc.station,'Construction');
assert.equal(nearest.proposed.d,0);
assert.equal(u.escapeHtml('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');

assert.equal(builders.length,63);
assert.equal(summary.catalogue_records,catalogue.length);
assert.equal(summary.mapped_records,props.length);
assert.equal(new Set(props.map(p=>p.dev+'|'+p.name.toLowerCase())).size,props.length);
const mapNames=new Set(props.map(p=>p.dev+'|'+p.name));
for(const p of props){
  assert(u.validPin(p),p.name);
  assert(['ready','uc','mixed','unknown'].includes(p.status),p.name);
  assert(['villa','apartment','plot','unknown'].includes(p.type),p.name);
  assert(p.sources.length&&p.coordinateSource&&p.fieldReview,p.name);
  if(!p.legacy){assert.equal(p.min,null,p.name);assert.equal(p.max,null,p.name);assert.notEqual(p.geo,'verified');}
  if(/ \/ /.test(p.name))assert.equal(p.legacyReview,true,'Unflagged combined listing: '+p.name);
  if(p.legacyReview){
    const old=read('legacy-properties.json').find(o=>o.dev===p.dev&&o.name===p.legacyName);
    assert(old,p.name);assert.equal(p.lat,old.lat);assert.equal(p.lng,old.lng);
    assert(p.coordinateQuality.startsWith('Restored '),p.name);
  }
}
for(const r of catalogue){
  assert.equal(Boolean(r.map_name),mapNames.has(r.builder+'|'+r.property_name),r.property_name);
  if(r.map_name){assert.equal(r.line_distances.length,r.legacy_restoration?0:lines.length,r.property_name);}
  if(['Excluded commercial','Excluded wrong-city'].includes(r.record_kind)){assert.equal(r.map_name,null,r.property_name);assert.equal(r.line_distances.length,0);}
  if(r.record_kind==='Unresolved / umbrella'&&r.map_name)assert.equal(props.find(p=>p.name===r.map_name&&p.dev===r.builder).legacyReview,true);
}
for(const name of ['Trifecta Fait Pour','Trifecta Adatto','Sumadhura The Olympus','Lodha Fiorenza'])assert(!props.some(p=>p.name===name),name);
for(const name of ['Goyal Orchid','Reliaable Developers','Sizzle Properties','Prestige Oakville','Purva Eminora','Sattva City / Park Cubix'])assert.equal(props.find(p=>p.name===name).legacyReview,true,name);
for(const name of ['Wonderwall','New Dawn','Rohan Vasantha','Brigade Golden Triangle','Trifecta Starlight']){
  const p=props.find(p=>p.name===name);if(p)assert.equal(p.status,'ready',name);
}
assert.equal(props.find(p=>p.name==='2G Tula').status,'mixed');
// Every unambiguous legacy identity with a usable, non-quarantined pin must
// survive a catalogue rename, along with its original type/corridor/config.
const norm=s=>s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
let preserved=0;
for(const old of read('legacy-properties.json')){
  const matches=catalogue.filter(r=>r.builder===old.dev&&[r.property_name,...r.aliases].some(name=>norm(name)===norm(old.name)));
  if(matches.length!==1)continue;
  const r=matches[0];
  if(['Excluded commercial','Unresolved / umbrella'].includes(r.record_kind)||r.coordinate_quality.startsWith('Approximate')||!u.validPin({lat:r.latitude,lng:r.longitude}))continue;
  const p=props.find(p=>p.dev===old.dev&&p.name===r.property_name);
  assert(p,`Lost legacy listing after rename: ${old.name}`);
  assert(p.legacyNames.includes(old.name),old.name);
  assert.equal(p.corr,old.corr,old.name);
  assert.equal(p.config,old.config,old.name);
  assert(p.name===old.name||p.aliases.includes(old.name),old.name);
  preserved++;
}
assert(preserved>200);
for(const old of read('legacy-properties.json'))assert(props.some(p=>p.dev===old.dev&&p.legacyNames.includes(old.name)),`Original listing missing: ${old.name}`);
const removals=read('removal-audit.json');
assert.equal(removals.length,278);
assert.equal(removals.filter(r=>r.in_pr_base).length,155);
assert.equal(removals.filter(r=>r.in_pre_expansion).length,276);
assert.equal(removals.filter(r=>r.missing_from_published_expansion).length,46);
for(const r of removals)assert(r.current_map_names.length||r.outcome==='Excluded wrong-city, retained in catalogue'&&r.exclusion_source,r.original_name);
for(const [name,legacy] of [['NCC Aster Park','NCC Urban (Aster Park)'],['NCC Urban Ivory Heights','NCC Ivory Heights'],['Karle Zenith Residences','Karle Town Centre (Zenith)'],['Pursuit of a Radical Rhapsody','TE Pursuit of a Radical Rhapsody']]){
  const p=props.find(p=>p.name===name);
  assert(p,name);assert.equal(p.legacyName,legacy);assert(p.aliases.includes(legacy));
}
for(const b of builders){assert.equal(b.historically_exhaustive,false);assert(b.source_urls.length,b.builder);}
for(const name of ['Habitat Crest','Tata New Haven','SMR Vinay Heritage','Candeur Rise','Sumadhura Eden Garden','The Green Sky'])assert(catalogue.some(r=>r.property_name===name),name);
console.log('PASS: date/filter rules, all four metro stages, map admission, provenance, exclusions, builder coverage and resumed omissions.');
console.log(JSON.stringify({builders:builders.length,catalogue:catalogue.length,mapped:props.length}));
