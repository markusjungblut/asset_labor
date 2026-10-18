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
  [/^tanne_schnee_(\d+)$/, 'Schneebedeckter Nadelbaum (Art offen)', 'snow_conifers', 'tree', 'large'],
  [/^tanne_(\d+)$/, 'Nadelbaum (Art offen)', 'conifers', 'tree', 'large'],
  [/^thymian_(\d+)$/, 'Thymian', 'herbs', 'ground_cover', 'tiny'],
  [/^wacholder_?(\d+)$/, 'Wacholder', 'conifers', 'shrub', 'medium'],
  [/^(?:marula|marula[-_]?baum)_?(\d+)$/, 'Marulabaum', 'savanna_trees', 'tree', 'large'],
  [/^weissdorn(\d+)$/, 'Weißdorn', 'flowering_bushes', 'shrub', 'medium'],
  [/^wildrose(\d+)$/, 'Wildrose', 'flowering_bushes', 'shrub', 'medium'],
  [/^zeder(\d+)$/, 'Zeder', 'conifers', 'tree', 'large'],
  [/^zypresse(\d+)$/, 'Zypresse', 'conifers', 'tree', 'large'],
  [/^palme_(\d+)$/, 'Palme (Art offen)', 'palms', 'tree', 'large'],
  [/^bush_(\d+)$/, 'Busch (Art offen)', 'unclassified_bushes', 'shrub', 'small'],
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
 };
 const stem = name => String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').toLowerCase().replace(/\.(?:png|webp|jpe?g|svg|gif|avif)$/i,'');
 function classify(asset) {
  if (asset?.category !== 'nature' || !/\.(?:png|webp|jpe?g|svg|gif|avif)$/i.test(asset.name || '')) return null;
  const base = stem(asset.name);
  const journal = /^tree_(1[2-9])$/.exec(base);
  if (journal) return {id:'journal_tree_'+journal[1],name:'Journal-Spezialbaum '+journal[1],family:'journal_trees',kind:'special',sizeClass:'large',apiOnly:true,confirmedSpecies:false};
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
 function metadata(info, tmpl, filename) {
  const mountain=info.kind==='mountain',ground=info.kind==='ground_cover',tree=info.kind==='tree';
  const [categories,baseDensity,baseSpacing]=habitat[info.family]||[[],0,info.kind==='tree'?90:44];
  const isSmallPalm=info.family==='palms'&&info.sizeClass==='medium';
  const density=info.family==='palms'?(isSmallPalm?.17:.12):baseDensity;
  const spacing=info.family==='palms'?(isSmallPalm?76:105):baseSpacing;
  const targetHeight=window.VedrasSpritePlanner?.targetHeight(info.kind,info.sizeClass)||75;
  return {
   ...tmpl, id:info.id, family:info.family, kind:info.kind, sizeClass:info.sizeClass,
   sizeMode:mountain||info.apiOnly?'manual':'class',targetHeight,
   logicalWidth:mountain?360:ground?28:tree?110:52,
   description:info.apiOnly
    ?'Klassifizierter Journal-Spezialbaum für die API. Keine gewöhnliche Baumart und keine automatische Weltplatzierung.'
    :info.name+' – vorhandene Grafik; Zuordnung nach Dateiname, Silhouette und Biomfreigabe noch nicht geprüft.',
   sourceReference:'Bestandsdatei: '+filename,
   anchor:mountain?{x:.5,y:.67}:{x:.5,y:.96},
   shadow:{...tmpl.shadow,mode:mountain||ground||info.apiOnly?'none':tree?'generic_medium_round':'generic_small_round'},
   terrainPresetId:'',allowedTerrainCategories:info.apiOnly?[]:categories,allowedTerrainTypes:[],excludedTerrainTypes:[],
   placement:{...tmpl.placement,weight:info.apiOnly?0:1,density:info.apiOnly?0:density,minSpacing:spacing,canCluster:!mountain&&!tree&&!info.apiOnly},
   artStatus:'candidate',
   tags:info.apiOnly?['existing','journal_api','no_auto_spawn']:['existing','needs_art_review',...(info.confirmedSpecies?[]:['needs_species_review']),...(info.family==='palms'?[isSmallPalm?'palm_small':'palm_large']:[])],
   ...(mountain?{mountain:{radius:1,coreRadius:0,shadowOpacity:.23,flatten:true}}:{})
  };
 }
 return {classify,isJournal,metadata};
})();
