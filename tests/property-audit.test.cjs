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
  assert(!/ \/ /.test(p.name),'Compound project still mapped: '+p.name);
}
for(const r of catalogue){
  assert.equal(Boolean(r.map_name),mapNames.has(r.builder+'|'+r.property_name),r.property_name);
  if(r.map_name){assert.equal(r.line_distances.length,lines.length,r.property_name);}
  if(['Excluded commercial','Unresolved / umbrella'].includes(r.record_kind)){assert.equal(r.map_name,null,r.property_name);assert.equal(r.line_distances.length,0);}
}
for(const name of ['Goyal Orchid','Reliaable Developers','Sizzle Properties','Trifecta Fait Pour','Trifecta Adatto','Prestige Oakville'])assert(!props.some(p=>p.name===name),name);
for(const name of ['Wonderwall','New Dawn','Rohan Vasantha','Brigade Golden Triangle','Trifecta Starlight']){
  const p=props.find(p=>p.name===name);if(p)assert.equal(p.status,'ready',name);
}
assert.equal(props.find(p=>p.name==='2G Tula').status,'mixed');
for(const b of builders){assert.equal(b.historically_exhaustive,false);assert(b.source_urls.length,b.builder);}
for(const name of ['Habitat Crest','Tata New Haven','SMR Vinay Heritage','Candeur Rise','Sumadhura Eden Garden','The Green Sky'])assert(catalogue.some(r=>r.property_name===name),name);
console.log('PASS: date/filter rules, all four metro stages, map admission, provenance, exclusions, builder coverage and resumed omissions.');
console.log(JSON.stringify({builders:builders.length,catalogue:catalogue.length,mapped:props.length}));
