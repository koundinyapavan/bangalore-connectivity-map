"""Rebuild mapped properties and coverage from the checked-in audit inputs (no network)."""
import json, math, pathlib, re, collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
def read(n):return json.loads((ROOT/'audit'/n).read_text())
def write(n,x):(ROOT/'audit'/n).write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
def norm(s):return re.sub('[^a-z0-9]','',s.lower().replace('&','and'))
def dist(a,b):
 x,y=map(math.radians,a);u,v=map(math.radians,b)
 return 6371*2*math.asin(min(1,math.sqrt(math.sin((u-x)/2)**2+math.cos(x)*math.cos(u)*math.sin((v-y)/2)**2)))
rs=read('properties.json');legacy=read('legacy-properties.json');lines=read('metro-snapshot.json');sources=read('sources.json')
base=read('pr-base-properties.json')
legacy_by_name={(p['dev'],norm(p['name'])):p for p in legacy}
# Explicit aliases only; no fuzzy joins that might combine different parcels.
aliases={'Prestige Park Grove':'Prestige Park Grove (Residences)','Prestige Park Grove - The Willows':'The Willows @ Park Grove','Prestige Evergreen at Raintree Park':'Prestige Evergreen','Sobha City':'Sobha City (Athena)','Shriram Samruddhi':'Sriram Samruddhi','House of Hiranandani Devanahalli':'House of Hiranandani','Adarsh Palm Retreat Mayberry':'Adarsh Mayberry','L&T South City':'L&T South City','Godrej Aveline':'Godrej Avaline'}
completed={'Wonderwall','New Dawn','Felicity','Brigade Golden Triangle','Rohan Vasantha','Trifecta Starlight','Trifecta Sollievo','Trifecta Esplanade','Trifecta Verdure','Trifecta Joli','Trifecta Bueno','Trifecta Beaumonde'}
primary_labels={'Official catalogue','Official catalogue matched'}
mapped=[];removed=[]
for r in rs:
 r['line_distances']=[];r['map_name']=None
 if r.get('legacy_restoration'):continue
 x,y=r.get('longitude'),r.get('latitude')
 pin=isinstance(x,(int,float)) and isinstance(y,(int,float)) and 77.2<x<78.1 and 12.6<y<13.5
 allowed=r['record_kind'] not in ['Excluded commercial','Excluded wrong-city','Unresolved / umbrella']
 if pin and allowed:
  for l in lines:
   station=min(l['pts'],key=lambda s:dist((y,x),(s[1],s[2])))
   name=l['name'].split(' Line')[0];stage='Operating' if l['status']=='op' else 'Under construction' if l['status']=='uc' else 'Union-approved Phase 3' if name in ['Orange','Grey'] else 'State-approved proposal; Union approval not verified'
   r['line_distances'].append(dict(line=name,metro_status=stage,station=station[0],aerial_km=round(dist((y,x),(station[1],station[2])),3)))
 r['nearest_running_or_uc']=min((d for d in r['line_distances'] if d['metro_status'] in ['Operating','Under construction']),key=lambda d:d['aerial_km'],default=None)
 # Catalogue canonicalisation must not erase an inherited map listing. Consult
 # each saved exact alias as well as the small set of explicit legacy overrides.
 legacy_names=[r['property_name'],*r.get('aliases',[]),aliases.get(r['property_name'],'')]
 matches={p['name']:p for name in legacy_names if (p:=legacy_by_name.get((r['builder'],norm(name))))}
 # An already-deduplicated phase alias may have its own identical legacy row.
 # Never select arbitrarily between rows with different pins or housing data.
 signatures={tuple(p.get(k) for k in ['lat','lng','type','corr','min','max','status','poss','config']) for p in matches.values()}
 assert len(signatures)<=1, f"Ambiguous legacy aliases for {r['builder']}: {r['property_name']}"
 old=legacy_by_name.get((r['builder'],norm(r['property_name']))) or next(iter(matches.values()),None)
 official=r['evidence'] in primary_labels or r['record_origin']=='Resumed catalogue audit'
 # Preserve named legacy pins with a visible provenance warning. Admit new pins only
 # when a developer identity and a separately sourced project-level point both exist.
 admission=pin and allowed and (old is not None or official) and not r.get('coordinate_quality','').startswith('Approximate')
 r['map_admission']='Mapped: inherited data, fields need verification' if admission and old else 'Mapped: sourced identity and project-level point; fields may be unknown' if admission else 'Not mapped: '+('excluded commercial / unresolved identity' if not allowed else 'no resolved project point' if not pin else 'identity requires primary-source review')
 if not admission:continue
 p=dict(old) if old else dict(name=r['property_name'],dev=r['builder'],type='unknown',corr='Unknown',area=r.get('area',''),min=None,max=None,status='unknown',poss='Not confirmed',config='Not confirmed',upcoming=False,geo='sourced',meta='none')
 p.update(name=r['property_name'],lat=y,lng=x)
 p['aliases']=list(dict.fromkeys(name for name in [*r.get('aliases',[]),old['name'] if old else ''] if name and name!=p['name']))
 typ=r.get('property_type')
 if typ in ['apartment','villa','plot']:p['type']=typ
 st=r['stage_reported']
 if r['property_name'] in completed or st.startswith('Completed on developer catalogue'):
  p.update(status='ready',poss='Completed on developer catalogue; verify tower OC',upcoming=False)
 if st.startswith('Mixed:'):p.update(status='mixed',poss=st,upcoming=False)
 if r['property_name']=='Akme Ballet':p.update(status='unknown',poss='Legacy under-construction label disputed; completion not independently established',upcoming=False)
 # Recovered launch/sales labels do not by themselves prove construction on site.
 if not old and p['status']=='unknown':p['poss']='Not confirmed'
 p['sources']=[u for u in r['sources'] if u.startswith('https://')]
 p['coordinateSource']=r.get('coordinate_source','');p['coordinateQuality']=r['coordinate_quality']
 p['stageSource']=next((u for u in p['sources'] if 'github.com/' not in u),None) if st.startswith(('Completed on','Mixed:')) else None
 p['fieldReview']={'identity':r['evidence'],'coordinates':r['coordinate_quality'],'stage':st,'price':'Inherited, unverified project-wide asking range' if old and p['min'] is not None else 'Unknown','configuration':'Inherited; 3 BHK availability unverified' if old else 'Unknown','possession':'Inherited target; not independently verified' if old else 'Unknown'}
 p['fieldSources']={'identity':{'urls':p['sources'],'reviewed':'2026-10-25','claim':r['evidence']},'coordinates':{'source':p['coordinateSource'],'quality':p['coordinateQuality']},'stage':{'source':p['stageSource'],'claim':st},'price':{'source':'https://github.com/projectescape/bangalore-connectivity-map/blob/4ac25831fd277c15d9e7d9f962e621a7d2fff10d/data.js' if old else None,'quote_date':None,'verified':False},'possession':{'source':p['stageSource'],'verified':False}}
 p['legacyName']=old['name'] if old else None
 p['legacyNames']=list(matches)
 p['checkedDate']='2026-10-25';p['auditNote']=r.get('review_note','');p['legacy']=old is not None
 r['map_name']=p['name'];mapped.append(p)
# Complete restoration pass: uncertainty may qualify an old listing, but must
# not silently delete it. Reuse only the original point, visibly marked for
# review, and suppress station-distance claims for these uncertain markers.
legacy_source='https://github.com/projectescape/bangalore-connectivity-map/blob/4ac25831fd277c15d9e7d9f962e621a7d2fff10d/data.js'
restored=[]
for old in legacy:
 if any(p['dev']==old['dev'] and old['name'] in p['legacyNames'] for p in mapped):continue
 candidates=[r for r in rs if r['builder']==old['dev'] and any(norm(n)==norm(old['name']) for n in [r['property_name'],*r.get('aliases',[])])]
 assert len(candidates)<=1, f"Ambiguous restoration: {old['name']}"
 if candidates:r=candidates[0]
 else:
  r=dict(builder=old['dev'],property_name=old['name'],aliases=[],record_origin='PR #3',evidence='Inherited combined listing; distinct projects require separate checks',sources=[legacy_source],area=old['area'],property_type=old['type'],stage_reported=old['status']+' (inherited; unverified)',record_kind='Legacy combined listing',review_note='Original combined listing restored for continuity. This point and price range must not be assigned to each named project.',line_distances=[],nearest_running_or_uc=None,buyer_fit='Not established',checked_date='2026-10-25',availability='Not checked',three_bhk='Not checked',walk_route='Not checked',exhaustive=False,identity_review='Inherited listing; identity and parcel need review')
  rs.append(r)
 reason='approximate legacy point' if old['geo']=='approx' else 'combined legacy listing' if r['record_kind']=='Legacy combined listing' else 'unresolved legacy identity / location'
 quality='Restored '+reason+'; original coordinates retained, not a verified project entrance'
 r.update(latitude=old['lat'],longitude=old['lng'],coordinate_source=legacy_source,coordinate_quality=quality,legacy_restoration=True,line_distances=[],nearest_running_or_uc=None,map_name=r['property_name'],map_admission='Restored legacy listing for review: '+reason+'. Metro distances withheld.')
 p=dict(old)
 p.update(name=r['property_name'],aliases=list(dict.fromkeys(n for n in [*r.get('aliases',[]),old['name']] if n!=r['property_name'])),legacy=True,legacyName=old['name'],legacyNames=[old['name']],legacyReview=True,legacyReviewReason=reason,sources=list(dict.fromkeys([*r.get('sources',[]),legacy_source])),coordinateSource=legacy_source,coordinateQuality=quality,stageSource=None,checkedDate='2026-10-25',auditNote='Restored original listing. '+r.get('review_note',''))
 p['fieldReview']={'identity':'Inherited listing retained for continuity; unresolved','coordinates':quality,'stage':r.get('stage_reported','Inherited; unverified'),'price':'Inherited unverified range; may combine products/projects','configuration':'Inherited; current availability unverified','possession':'Inherited target; unverified'}
 p['fieldSources']={'identity':{'urls':p['sources'],'claim':'Legacy listing, not newly verified'},'coordinates':{'source':legacy_source,'quality':quality},'stage':{'source':legacy_source,'verified':False},'price':{'source':legacy_source,'quote_date':None,'verified':False},'possession':{'source':legacy_source,'verified':False}}
 mapped.append(p);restored.append(old['name'])
# Two original-base names were confirmed to refer to developments outside
# Bengaluru. Preserve them in the catalogue/ledger, without false Bengaluru pins.
wrong_city={
 ('Sumadhura','Sumadhura The Olympus'):('Hyderabad','https://sumadhuragroup.com/residential/hyderabad/the-olympus'),
 ('Lodha','Lodha Fiorenza'):('Mumbai','https://www.lodhagroup.com/projects/residential-property-in-goregaon/lodha-fiorenza/location')}
for (builder,name),(city,url) in wrong_city.items():
 r=next((r for r in rs if r['builder']==builder and r['property_name']==name),None)
 if r is None:
  r=dict(builder=builder,property_name=name,aliases=[],record_origin='PR base',evidence='Developer confirms another city',sources=[url],area=city,property_type='apartment',stage_reported='Not checked',record_kind='Excluded wrong-city',review_note='Original Bengaluru pin was incorrect. Preserved as an excluded catalogue record; no equivalence assumed with similarly named Bengaluru projects.',latitude=None,longitude=None,coordinate_source='',coordinate_quality='Incorrect Bengaluru pin withheld',line_distances=[],nearest_running_or_uc=None,checked_date='2026-10-25',availability='Not checked',three_bhk='Not checked',walk_route='Not checked',exhaustive=False,identity_review='Developer city confirmed',buyer_fit='Outside Bengaluru');rs.append(r)
 r.update(map_name=None,map_admission='Excluded from Bengaluru map: developer confirms '+city)
rs.sort(key=lambda r:(r['builder'].lower(),r['property_name'].lower()))
# Ensure the map doesn't silently retain a compound entry or a quarantined placeholder.
assert len({(p['dev'],norm(p['name'])) for p in mapped})==len(mapped)
write('properties.json',rs)
s=(ROOT/'data.js').read_text();end=s.index('\n];')+len('\n];')
(ROOT/'data.js').write_text('const PROPS = '+'[\n'+',\n'.join('  '+json.dumps(p,ensure_ascii=False,separators=(',',':')) for p in mapped)+'\n]'+';'+s[end:])
write('legacy-disposition.json',[{'original_name':p['name'],'builder':p['dev'],'mapped_as':[m['name'] for m in mapped if p['name'] in m['legacyNames'] and m['dev']==p['dev']],'outcome':'retained / corrected (including explicit aliases)' if any(p['name'] in m['legacyNames'] and m['dev']==p['dev'] for m in mapped) else 'withheld or split: original approximate, compound or unresolved identity; see full catalogue'} for p in legacy])
# Account for the union of both source snapshots, including changes made before
# the expansion. Saved aliases make renames distinguishable from true removals.
before=read('pre-restoration-map.json');ledger=[]
originals={(p['dev'],p['name']):p for p in [*base,*legacy]}
for (builder,name),old in originals.items():
 names={norm(name)}
 for r in rs:
  if r['builder']==builder and any(norm(n)==norm(name) for n in [r['property_name'],*r.get('aliases',[])]):names.add(norm(r['property_name']))
 initial=[p for p in before if p['dev']==builder and (norm(p['name']) in names or p.get('legacyName')==name)]
 current=[p for p in mapped if p['dev']==builder and (name in p['legacyNames'] or norm(p['name']) in names)]
 prior=next((p for p in legacy if p['dev']==builder and p['name']==name),None)
 original_base=next((p for p in base if p['dev']==builder and p['name']==name),None)
 changes={k:{'pr_base':original_base.get(k),'before_expansion':prior.get(k)} for k in ['lat','lng','area','type','min','max','status','poss','config','geo'] if prior and original_base and prior.get(k)!=original_base.get(k)}
 excluded=wrong_city.get((builder,name))
 assert current or excluded, 'Unaccounted original listing: '+name
 ledger.append(dict(builder=builder,original_name=name,in_pr_base=original_base is not None,in_pre_expansion=prior is not None,missing_from_published_expansion=not bool(initial),published_expansion_names=[p['name'] for p in initial],current_map_names=[p['name'] for p in current],outcome='Excluded wrong-city, retained in catalogue' if excluded else 'Restored with explicit review warning' if any(p.get('legacyReview') for p in current) else 'Retained / restored, including aliases',exclusion_source=excluded[1] if excluded else None,changes_before_expansion=changes))
write('removal-audit.json',ledger)
def cell(value):return str(value).replace('|','\\|').replace('\n',' ')
missing=[r for r in ledger if r['missing_from_published_expansion']]
report=['# Complete PR #3 listing-removal audit','',
'Compared the PR base `5dc75f0` (155 listings), the pre-expansion head `4ac2583` (276 listings), the published expanded map `1ad4d7e` (486 markers), and the corrected generated map. The two input lists contain 278 distinct builder/name pairs.','',
'**All 278 original identities are accounted for.** All 276 pre-expansion listing names are represented again on the map, including saved aliases and one identical duplicate phase row. Of the 46 names absent from the published expansion, 44 markers are restored and two confirmed wrong-city entries remain excluded from the Bengaluru map.','',
'Uncertain inherited points are restored with a dashed amber marker and review warning. Their original coordinates are retained for continuity, and metro-distance claims are withheld. Existing approximate points are distinct from newly sourced project points. No claim of a verified parcel, available home or safe walk is created by restoration.','',
'## Every listing missing from the published expansion','',
'| Builder | Earlier listing name | Resolution | Current map name |',
'|---|---|---|---|']
for r in missing:
 report.append('| '+' | '.join(cell(x) for x in [r['builder'],r['original_name'],r['outcome'],'; '.join(r['current_map_names']) or 'Excluded; retained in catalogue'])+' |')
report.extend(['','## Earlier field and point changes','',
'The earlier PR commits changed fields on 31 names shared by the base and pre-expansion snapshots. These changes are separately recorded; they were not mistaken for removals. The full before/after values are in `changes_before_expansion` in [removal-audit.json](removal-audit.json).','',
'| Earlier listing | Fields changed before the expansion |','|---|---|'])
for r in ledger:
 if r['changes_before_expansion']:report.append('| '+cell(r['original_name'])+' | '+', '.join(r['changes_before_expansion'])+' |')
report.extend(['','## Confirmed wrong-city exceptions','',
'- **Sumadhura The Olympus**: [developer identifies Hyderabad](https://sumadhuragroup.com/residential/hyderabad/the-olympus). Its earlier Bengaluru point was incorrect.',
'- **Lodha Fiorenza**: [developer identifies Goregaon, Mumbai](https://www.lodhagroup.com/projects/residential-property-in-goregaon/lodha-fiorenza/location). The separate inherited Sadahalli name, Lodha Fiorana, is restored as an unresolved legacy listing; no equivalence is assumed.','',
'Both wrong-city names are searchable in the catalogue with an exclusion reason and source.','',
'## Complete accounting and reproducibility','',
'- [All 278 original identities and outcomes](removal-audit.json)',
'- [All 276 pre-expansion rows](legacy-properties.json) and [their current dispositions](legacy-disposition.json)',
'- [Original PR base: 155 rows](pr-base-properties.json)',
'- [Published pre-restoration map snapshot](pre-restoration-map.json)',
'- [Current counts](summary.json)','',
'Rebuild with `python scripts/build-property-audit.py`. Regression tests require every pre-expansion name to resolve to a current map record, and every original-base identity to be mapped or have a sourced wrong-city exclusion. Searches accept the original aliases.'])
(ROOT/'audit/RESTORATION_REPORT.md').write_text('\n'.join(report)+'\n')
prev=read('builder-baseline.json');builders=[]
resumed_notes={
'Alpine':'Read the official page bundle, including recent and completed arrays: 18 named records. Three names in the original research were insufficient. Current inventory, phase relationships and completeness beyond this public list remain unverified.',
'Candeur':'Read the complete embedded catalogue, filtered city Bengaluru and residential: six names, including omitted Rise and Sunshine. Hyderabad projects excluded. Historical completeness beyond the checked list remains unverified.',
'Habitat':'Six completed residential names recovered from the official indexed page in addition to Eden Heights and Iluminar. Commercial HVP entries excluded. Direct retrieval failed; source-index coverage is limited.',
'Sumadhura':'Read all 32 embedded catalogue items, filtered Bengaluru residential and plotted development. Includes sold-out communities omitted by the initial visible cards. Hyderabad and commercial items excluded. Sold out does not establish an OC; the Folium page itself contains conflicting phase targets.',
'Keya':'Official page lists five completed, one ongoing and three individually named upcoming projects. It mentions four future developments, leaving an unnamed pipeline item unresolved. No locality-centre pin was invented.',
'SMR':'Official catalogue locality labels reveal 16 named Bengaluru records, including older Banaswadi, CV Raman Nagar and Thippasandra communities. Hyderabad communities excluded. Legacy name variations and phase relationships remain to be checked.',
'Tata Housing':'Official city navigation and completed list reveal New Haven, Promont, Promont II, Riva, Raagam and Swaram in addition to Carnatica family records. Family and phase records overlap; these are not 11 independent townships. New Haven has both OC-received and under-construction towers.',
'Durga':'Bengaluru entries recovered from the official project list include Waves, Coral, Saffron Square and Rainbow. Excludes Patna developments. The page repeats some projects with conflicting sales labels; availability is unverified.',
'Total Environment':'Both official public sites were blocked or dynamically empty in direct retrieval. Public homes API returned 401 and was not accessed further. Historical catalogue completeness remains unresolved; secondary leads and inherited names must not be treated as the full portfolio.'}

for b in sorted({p['dev'] for p in legacy}):
 group=[r for r in rs if r['builder']==b];src=[s for s in sources if s['builder']==b]
 extra=[r['property_name'] for r in group if r['record_origin'] not in ['PR #3','PR base','Split compound PR record'] and r['record_kind'] not in ['Unresolved / umbrella','Excluded commercial','Excluded wrong-city']]
 primary=[s for s in src if not any(d in s['url'] for d in ['dosl.in','squareyards.com','magicbricks.com'])]
 substantive=any(s.get('text_characters',0)>1500 or 'Read all' in s.get('retrieval','') or 'Read recent' in s.get('retrieval','') for s in primary)
 base=next((a for a in prev if a['builder']==b),{})
 builders.append(dict(builder=b,original_map_records=sum(p['dev']==b for p in legacy),catalogue_records=len(group),additional_candidate_records=len(extra),mapped_records=sum(p['dev']==b for p in mapped),unmapped_records=sum(r['map_name'] is None for r in group),coverage='Omissions found; full historical completeness not established' if extra else 'No further omission confirmed; completeness not established',retrieval='Substantive public catalogue retrieved' if substantive else 'Limited / blocked / dynamic; supplementary evidence needed',coverage_note=resumed_notes.get(b,base.get('coverage_finding','')),new_candidate_names=extra,source_urls=list(dict.fromkeys(s['url'] for s in src)),checked_date='2026-10-25',historically_exhaustive=False))
write('builders.json',builders)
stats=dict(checked_date='2026-10-25',builders=len(builders),catalogue_records=len(rs),mapped_records=len(mapped),new_mapped_records=sum(not p['legacy'] for p in mapped),retained_or_corrected_legacy_records=sum(p['legacy'] for p in mapped),original_map_records=len(legacy),unmapped_catalogue_records=sum(r['map_name'] is None for r in rs),with_candidate_coordinates=sum(r.get('latitude') is not None for r in rs),source_checks=len(sources),builders_with_additional_candidates=sum(bool(b['additional_candidate_records']) for b in builders),within_3km_of_any_station=sum(any(d['aerial_km']<=3 for d in r['line_distances']) for r in rs),by_line={l:sum(any(d['line']==l and d['aerial_km']<=3 for d in r['line_distances']) for r in rs) for l in ['Purple','Blue','Green','Pink','Yellow','Orange','Grey','Red']})
write('summary.json',stats);print(json.dumps(stats,indent=2))
