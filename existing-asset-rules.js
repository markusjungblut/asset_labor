/* Bestandserkennung für reale Dateien – keine Bildkopien, keine Freigabe durch Dateinamen. */
'use strict';
window.VedrasExistingAssets = (() => {
 const definitions = [
  [/^affenbrotbaum(\d+)$/, 'Affenbrotbaum', 'savanna_trees', 'tree', 'large'],
  [/^ahorn(\d+)$/, 'Ahorn', 'deciduous_trees', 'tree', 'medium'],
  [/^besenheide(\d+)$/, 'Besenheide', 'heath', 'ground_cover', 'small'],
  [/^birke(\d+)$/, 'Birke', 'deciduous_trees', 'tree', 'medium'],
  [/^buche(\d+)$/, 'Buche', 'deciduous_trees', 'tree', 'large'],
  [/^eiche(\d+)$/, 'Eiche', 'deciduous_trees', 'tree', 'large'],
  [/^esche(\d+)$/, 'Esche', 'deciduous_trees', 'tree', 'large'],
  [/^ginster(\d+)$/, 'Ginster', 'flowering_bushes', 'shrub', 'small'],
  [/^haselstrauch(\d+)$/, 'Haselstrauch', 'temperate_bushes', 'shrub', 'medium'],
  [/^holunder_(\d+)$/, 'Holunder', 'temperate_bushes', 'shrub', 'medium'],
  [/^linde(\d+)$/, 'Linde', 'deciduous_trees', 'tree', 'large'],
  [/^larche(\d+)$/, 'Lärche', 'conifers', 'tree', 'large'],
  [/^schirmakazie(\d+)$/, 'Schirmakazie', 'savanna_trees', 'tree', 'large'],
  [/^schlehe(\d+)$/, 'Schlehe', 'temperate_bushes', 'shrub', 'medium'],
  [/^tanne_(\d+)$/, 'Tanne', 'conifers', 'tree', 'large'],
  [/^thymian_(\d+)$/, 'Thymian', 'herbs', 'ground_cover', 'tiny'],
  [/^wacholder_?(\d+)$/, 'Wacholder', 'conifers', 'shrub', 'medium'],
  [/^(?:marula|marula[-_]?baum)_?(\d+)$/, 'Marulabaum', 'savanna_trees', 'tree', 'large'],
  [/^weissdorn(\d+)$/, 'Weißdorn', 'flowering_bushes', 'shrub', 'medium'],
  [/^wildrose(\d+)$/, 'Wildrose', 'flowering_bushes', 'shrub', 'medium'],
  [/^zeder(\d+)$/, 'Zeder', 'conifers', 'tree', 'large'],
  [/^zypresse(\d+)$/, 'Zypresse', 'conifers', 'tree', 'large'],
  [/^palme_(\d+)$/, 'Palme (Art offen)', 'palms', 'tree', 'large'],
  [/^berg_(\d+)$/, 'Berg (Typ offen)', 'mountains', 'mountain', 'giant'],
 ];
 const habitat = {
  savanna_trees:[['warm_regions','arid_regions'],.07,130],
  deciduous_trees:[['grass_pasture','wetlands','cold_regions'],.14,90],
  heath:[['cold_regions','grass_pasture'],.25,26],
  flowering_bushes:[['grass_pasture','warm_regions'],.19,42],
  temperate_bushes:[['grass_pasture','wetlands'],.22,43],
  conifers:[['cold_regions','grass_pasture'],.15,86],
  snow_conifers:[['cold_regions'],.12,92],
  herbs:[['grass_pasture','warm_regions','arid_regions'],.24,23],
  // Küstenpalmen stehen auf Land, nicht auf Wasser-Hexfeldern.
  palms:[['warm_regions','wetlands'],.13,96],
  dry_bushes:[['arid_regions','warm_regions','grass_pasture'],.19,45],
  jungle_trees:[['warm_regions'],.06,132],
 };
 const stem = name => String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').toLowerCase().replace(/\.(?:png|webp|jpe?g|svg|gif|avif)$/i,'');
 function classify(asset) {
  if (asset?.category !== 'nature' || !/\.(?:png|webp|jpe?g|svg|gif|avif)$/i.test(asset.name || '')) return null;
  const base = stem(asset.name);
  const journal = /^tree_(1[2-9])$/.exec(base);
  if (journal) return {id:'journal_tree_'+journal[1],name:'Kapokbaum (Journal '+journal[1]+')',family:'jungle_trees',kind:'special',sizeClass:'giant',apiOnly:true,confirmedSpecies:true,group:'kapok'};
  const snowy = /^tanne_schnee_(\d+)$/.exec(base);
  if (snowy && Number(snowy[1])>=1 && Number(snowy[1])<=10) {
   const pine=Number(snowy[1])<=5;
   return {id:'existing_'+base,name:pine?'Verschneite Kiefer':'Verschneite Tanne',family:'snow_conifers',kind:'tree',sizeClass:'large',apiOnly:false,confirmedSpecies:false,group:pine?'snow_pine':'snow_fir'};
  }
  const bush = /^bush_(\d+)$/.exec(base);
  if (bush && Number(bush[1])>=1 && Number(bush[1])<=41) {
   const n=Number(bush[1]),cluster=n>=34,dry=n>=20&&n<=29;
   // Bei den trockenen Büschen ist nur die GrößenSPANNE bekannt: Unterteilung zunächst vorläufig.
   const size=cluster?'medium':dry?(n<=24?'medium':'small'):[5,6,15].includes(n)?'small':([7,8,9,10,17,18,19].includes(n)?'large':'medium');
   return {id:'existing_'+base,name:cluster?'Buschgruppe '+n:dry?'Trockener Busch '+n:'Busch '+n,family:dry?'dry_bushes':'temperate_bushes',kind:cluster?'cluster':'shrub',sizeClass:size,apiOnly:false,confirmedSpecies:true,group:cluster?'bush_group':dry?'dry_bush':'temperate_bush',provisionalSize:dry};
  }
  const palm=/^palme_(\d+)$/.exec(base);
  if(palm && Number(palm[1])>=1 && Number(palm[1])<=11){
   const smaller=Number(palm[1])<=5;
   return {id:'existing_'+base,name:smaller?'Palme (kleinere Variante)':'Palme (größere Variante)',family:'palms',kind:'tree',sizeClass:smaller?'medium':'large',apiOnly:false,confirmedSpecies:false};
  }
  for (const [pattern,name,family,kind,sizeClass] of definitions) {
   if (pattern.test(base)) return {id:'existing_'+base,name,family,kind,sizeClass,apiOnly:false,confirmedSpecies:!name.includes('offen')};
  }
  return null;
 }
 const isJournal = asset => !!classify(asset)?.apiOnly;
 // Nur Testkarten-Verteilung: Kandidaten und Testgrafiken bleiben ohne Produktionsfreigabe nutzbar.
 const canAutoPlaceInTest = (asset, meta, terrainTypes) =>
  asset?.category==='nature' && !isJournal(asset) && !!meta &&
  meta.kind!=='mountain' && meta.artStatus!=='deprecated' &&
  meta.placement?.density>0 && meta.placement?.weight>0 &&
  terrainTypes?.size>0;
 function metadata(info, tmpl, filename) {
  const mountain=info.kind==='mountain',ground=info.kind==='ground_cover',tree=info.kind==='tree';
  const [categories,baseDensity,baseSpacing]=habitat[info.family]||[[],0,info.kind==='tree'?90:44];
  const cluster=info.group==='bush_group';
  const density=cluster?0.10:baseDensity;
  const groupSpacing=cluster?80:baseSpacing;
  const isSmallPalm=info.family==='palms'&&info.sizeClass==='medium';
  const actualDensity=info.family==='palms'?(isSmallPalm?0.17:0.12):density;
  const spacing=info.family==='palms'?(isSmallPalm?76:105):groupSpacing;
  const targetHeight=window.VedrasSpritePlanner?.targetHeight(info.kind,info.sizeClass)||75;
  return {
   ...tmpl, id:info.id, family:info.family, kind:info.kind, sizeClass:info.sizeClass,
   sizeMode:mountain||info.apiOnly?'manual':'class',targetHeight,
   logicalWidth:mountain?360:ground?28:tree?110:52,
   description:info.apiOnly
    ?'Kapokbaum – Journal-Spezialasset für die API; nicht für automatisches oder manuelles Platzieren auf der Weltkarte freigegeben.'
    :info.name+' – vorhandene Grafik; Biomfreigaben/Größen bleiben im Labor veränderbar.'+(info.provisionalSize?' Größe innerhalb der trockenen Buschreihe vorläufig.':''),
   sourceReference:'Bestandsdatei: '+filename,
   anchor:mountain?{x:.5,y:.67}:{x:.5,y:.96},
   shadow:{...tmpl.shadow,mode:mountain||ground||info.apiOnly?'none':tree?'generic_medium_round':'generic_small_round'},
   terrainPresetId:'',allowedTerrainCategories:info.apiOnly?[]:categories,allowedTerrainTypes:[],excludedTerrainTypes:[],
   placement:{...tmpl.placement,weight:info.apiOnly?0:1,density:info.apiOnly?0:actualDensity,minSpacing:spacing,canCluster:cluster||(!mountain&&!tree&&!info.apiOnly)},
   artStatus:'candidate',
   tags:info.apiOnly?['existing','journal_api','no_auto_spawn','kapok']:[
    'existing','needs_art_review',...(info.confirmedSpecies?[]:['needs_species_review']),
    ...(info.group?[info.group]:[]),...(info.provisionalSize?['size_provisional']:[]),
    ...(info.family==='palms'?[isSmallPalm?'palm_small':'palm_large']:[]),
    ...(info.name==='Tanne'?['reassignable_conifer']:[])
   ],
   ...(mountain?{mountain:{radius:1,coreRadius:0,shadowOpacity:.23,flatten:true}}:{})
  };
 }
 return {classify,isJournal,metadata,canAutoPlaceInTest};
})();
