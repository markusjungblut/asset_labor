/* Bestandserkennung für reale Dateien – keine Bildkopien, keine Freigabe durch Dateinamen. */
'use strict';
window.VedrasExistingAssets = (() => {
 const definitions = [
  [/^(?:dschungel[_ -]?busch|jungle[_ -]?bush)_?(\d+)$/, 'Dschungelbusch', 'jungle_bushes', 'shrub', 'medium'],
  [/^(?:kaktus|cactus|kakteen)_?(\d+)$/, 'Kaktus', 'cacti', 'special', 'medium'],
  [/^(?:farn|fern)_?(\d+)$/, 'Farn', 'ferns', 'ground_cover', 'medium'],
  [/^(?:mangrove|mangroven)_?(\d+)$/, 'Mangrove', 'mangroves', 'tree', 'large'],
  [/^(?:fallen[_ -]?tree|fallen[_ -]?log|umgefallener[_ -]?baum|liegender[_ -]?baum)_?(\d+)$/, 'Umgestürzter Baum', 'fallen_wood', 'special', 'large'],
  [/^dead[_ -]?tree[_ -]?(\d+)$/, 'Toter Baum', 'deadwood', 'special', 'large'],
  [/^affenbrotbaum(\d+)$/, 'Affenbrotbaum', 'savanna_trees', 'tree', 'large'],
  [/^ahorn(\d+)$/, 'Ahorn', 'deciduous_trees', 'tree', 'medium'],
  [/^besenheide(\d+)$/, 'Besenheide', 'heath', 'ground_cover', 'small'],
  [/^birke(\d+)$/, 'Birke', 'deciduous_trees', 'tree', 'medium'],
  [/^buche(\d+)$/, 'Buche', 'deciduous_trees', 'tree', 'large'],
  [/^eiche(\d+)$/, 'Eiche', 'deciduous_trees', 'tree', 'large'],
  [/^esche(\d+)$/, 'Esche', 'deciduous_trees', 'tree', 'large'],
  [/^erle_?(\d+)$/, 'Erle', 'riparian_trees', 'tree', 'large'],
  [/^weide_?(\d+)$/, 'Weide', 'riparian_trees', 'tree', 'large'],
  [/^tundra_zwergstrauch_?(\d+)$/, 'Tundra-Zwergstrauch (Art offen)', 'cold_bushes', 'shrub', 'small'],
  [/^schilf_?(\d+)$/, 'Schilf', 'reeds', 'cluster', 'medium'],
  [/^sukkulent(?:e|en)?_?(\d+)$/, 'Sukkulente (Art offen)', 'succulents', 'ground_cover', 'medium'],
  [/^baumstumpf_?(\d+)$/, 'Baumstumpf', 'deadwood', 'special', 'medium'],
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
  // Palmen sind warme Landvegetation. Moor/Sumpf/Marschland dürfen ohne
  // ausdrückliches tropisches Biom keine Palmen aus dieser Familie tragen.
  palms:[['warm_regions'],.13,96],
  dry_bushes:[['arid_regions','warm_regions','grass_pasture'],.19,45],
  jungle_trees:[['warm_regions'],.06,132],
  riparian_trees:[['wetlands'],.12,114],
  cold_bushes:[[],.21,36],
  reeds:[['wetlands'],.17,50],
  succulents:[['arid_regions'],.12,38],
  deadwood:[['grass_pasture','cold_regions','wetlands','warm_regions'],.045,74],
  snow_deadwood:[[],.045,74],
  fallen_wood:[['grass_pasture','cold_regions','wetlands','warm_regions'],.04,85],
  jungle_bushes:[[],.17,55],
  cacti:[['arid_regions'],.11,70],
  ferns:[['grass_pasture','wetlands'],.20,45],
  mangroves:[[],.07,125],
 };
 // Ground/root placement rules are deliberately stricter than coarse terrain
 // categories. Images can overhang adjacent water, but their root must be on land.
 const allowedBiomes = {
  savanna_trees:['savanna','semi_desert','dry_ground'],
  deciduous_trees:['grassland','pasture','sparse_pasture','forest_floor','hilly_ground'],
  heath:['grassland','pasture','sparse_pasture','moor','tundra','highland'],
  flowering_bushes:['grassland','pasture','sparse_pasture','hilly_ground'],
  temperate_bushes:['grassland','pasture','sparse_pasture','forest_floor','hilly_ground'],
  conifers:['grassland','pasture','sparse_pasture','forest_floor','hilly_ground','highland','tundra'],
  snow_conifers:['snowfields','frozen_tundra','highland'],
  palms:['jungle','savanna','tropical_coast'],
  herbs:['grassland','pasture','sparse_pasture','hilly_ground','savanna','semi_desert','dry_ground'],
  dry_bushes:['savanna','semi_desert','dry_ground','rocky_desert','sandy_desert','clay_desert','badlands','wasteland','sandy_rocky_desert','sandy_badlands','rocky_badlands','desert'],
  jungle_trees:['jungle'],
  jungle_bushes:['jungle'],
  riparian_trees:['marshland','swamp','pasture','grassland'],
  cold_bushes:['tundra','frozen_tundra','highland'],
  reeds:['moor','marshland','swamp'],
  succulents:['savanna','semi_desert','rocky_desert','sandy_desert','clay_desert','badlands','wasteland','sandy_rocky_desert','sandy_badlands','rocky_badlands','desert'],
  deadwood:['grassland','pasture','sparse_pasture','forest_floor','hilly_ground','highland','tundra','moor','marshland','swamp','savanna','jungle'],
  snow_deadwood:['snowfields','frozen_tundra','highland'],
  fallen_wood:['grassland','pasture','sparse_pasture','forest_floor','hilly_ground','highland','tundra','moor','marshland','swamp','savanna','jungle'],
  cacti:['semi_desert','rocky_desert','sandy_desert','clay_desert','sandy_rocky_desert','desert','savanna'],
  ferns:['forest_floor','grassland','pasture','marshland','swamp','jungle'],
  mangroves:['swamp','marshland','mangrove_swamp','tropical_marsh','tropical_coast']
 };
 function habitatAllowed(asset,meta,type,material,context={}){
  if(material!=='ground')return false;
  const family=meta?.family||classify(asset)?.family;
  const allowed=allowedBiomes[family];
  if(allowed&&!allowed.includes(type))return false;
  // Unknown/unclassified material is NEVER automatically placed.
  if(!family||family==='unclassified')return false;
  if(family==='mangroves'&&(!context.coastal||!context.warm))return false;
  return true;
 }
 const stem = name => String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').toLowerCase().replace(/\.(?:png|webp|jpe?g|svg|gif|avif)$/i,'');
 function classify(asset) {
  if (asset?.category !== 'nature' || !/\.(?:png|webp|jpe?g|svg|gif|avif)$/i.test(asset.name || '')) return null;
  const base = stem(asset.name);
  const kapok = /^tree_(1[2-9])$/.exec(base);
  if (kapok) return {id:'kapok_tree_'+kapok[1],name:'Kapokbaum',family:'jungle_trees',kind:'tree',sizeClass:'giant',confirmedSpecies:true,group:'kapok'};
  const snowy = /^tanne_schnee_(\d+)$/.exec(base);
  if (snowy && Number(snowy[1])>=1 && Number(snowy[1])<=10) {
   const pine=Number(snowy[1])<=5;
   return {id:'existing_'+base,name:pine?'Verschneite Kiefer':'Verschneite Tanne',family:'snow_conifers',kind:'tree',sizeClass:'large',confirmedSpecies:false,group:pine?'snow_pine':'snow_fir'};
  }
  // Dead Tree 11–15 are the explicit snowy variants, not bare deadwood.
  const dead=/^dead[_ -]?tree[_ -]?(\d+)$/.exec(base);
  if(dead && Number(dead[1])>=11 && Number(dead[1])<=15)
   return {id:'existing_'+base.replace(/[^a-z0-9_]/g,'_'),name:'Verschneiter toter Baum',family:'snow_deadwood',kind:'special',sizeClass:'large',confirmedSpecies:true};
  const bush = /^bush_(\d+)$/.exec(base);
  if (bush && Number(bush[1])>=1 && Number(bush[1])<=41) {
   const n=Number(bush[1]),cluster=n>=34,dry=n>=20&&n<=29;
   // Bei den trockenen Büschen ist nur die GrößenSPANNE bekannt: Unterteilung zunächst vorläufig.
   const size=cluster?'medium':dry?(n<=24?'medium':'small'):[5,6,15].includes(n)?'small':([7,8,9,10,17,18,19].includes(n)?'large':'medium');
   return {id:'existing_'+base,name:cluster?'Buschgruppe '+n:dry?'Trockener Busch '+n:'Busch '+n,family:dry?'dry_bushes':'temperate_bushes',kind:cluster?'cluster':'shrub',sizeClass:size,confirmedSpecies:true,group:cluster?'bush_group':dry?'dry_bush':'temperate_bush',provisionalSize:dry};
  }
  const palm=/^palme_(\d+)$/.exec(base);
  if(palm && Number(palm[1])>=1 && Number(palm[1])<=11){
   const smaller=Number(palm[1])<=5;
   return {id:'existing_'+base,name:smaller?'Palme (kleinere Variante)':'Palme (größere Variante)',family:'palms',kind:'tree',sizeClass:smaller?'medium':'large',confirmedSpecies:false};
  }
  for (const [pattern,name,family,kind,sizeClass] of definitions) {
   if (pattern.test(base)) return {id:'existing_'+base,name,family,kind,sizeClass,confirmedSpecies:!name.includes('offen')};
  }
  return null;
 }
 // Normale Kapokbäume sind wie andere Baumarten im Labor platzierbar.
 // Testkandidaten benötigen keine Produktionsfreigabe.
 const canAutoPlaceInTest = (asset, meta, terrainTypes) =>
  asset?.category==='nature' && !!meta &&
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
  const targetHeight=info.family==='deadwood'?55:(window.VedrasSpritePlanner?.targetHeight(info.kind,info.sizeClass)||75);
  const restrict={riparian_trees:['pasture'],cold_bushes:['tundra','frozen_tundra','highland'],succulents:['savanna'],
   mangroves:['swamp','marshland'],jungle_bushes:['jungle'],snow_deadwood:['snowfields','frozen_tundra','highland'],
   ferns:['forest_floor','jungle'],cacti:['savanna']};
  const groundWood=info.family==='deadwood';
  return {
   ...tmpl, id:info.id, family:info.family, kind:info.kind, sizeClass:info.sizeClass,
   sizeMode:mountain?'manual':'class',targetHeight,
   logicalWidth:mountain?360:ground?28:tree?110:52,
   description:info.name+' – vorhandene Grafik; Biomfreigaben/Größen bleiben im Labor veränderbar.'+(info.provisionalSize?' Größe innerhalb der trockenen Buschreihe vorläufig.':''),
   sourceReference:'Bestandsdatei: '+filename,
   anchor:mountain?{x:.5,y:.67}:{x:.5,y:.96},
   shadow:{...tmpl.shadow,mode:mountain||ground||groundWood?'none':tree?'generic_medium_round':'generic_small_round'},
   terrainPresetId:'',allowedTerrainCategories:info.group==='kapok'?[]:categories,allowedTerrainTypes:info.group==='kapok'?['jungle']:(restrict[info.family]||[]),excludedTerrainTypes:[],
   placement:{...tmpl.placement,weight:1,density:actualDensity,minSpacing:spacing,canCluster:groundWood?false:(cluster||(!mountain&&!tree))},
   artStatus:'candidate',
   tags:[
    'existing','needs_art_review',...(info.confirmedSpecies?[]:['needs_species_review']),
    ...(info.group?[info.group]:[]),...(info.provisionalSize?['size_provisional']:[]),
    ...(info.family==='palms'?[isSmallPalm?'palm_small':'palm_large']:[]),
    ...(info.name==='Tanne'?['reassignable_conifer']:[])
   ],
   ...(mountain?{mountain:{radius:1,coreRadius:0,shadowOpacity:.23,flatten:true}}:{})
  };
 }
 return {classify,metadata,canAutoPlaceInTest,habitatAllowed,allowedBiomes};
})();
