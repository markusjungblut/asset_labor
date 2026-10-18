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
  [/^tanne_schnee_(\d+)$/, 'Schneetanne', 'snow_conifers', 'tree', 'large'],
  [/^tanne_(\d+)$/, 'Tanne', 'conifers', 'tree', 'large'],
  [/^thymian_(\d+)$/, 'Thymian', 'herbs', 'ground_cover', 'tiny'],
  [/^wacholder(\d+)$/, 'Wacholder', 'conifers', 'shrub', 'medium'],
  [/^weissdorn(\d+)$/, 'Weißdorn', 'flowering_bushes', 'shrub', 'medium'],
  [/^wildrose(\d+)$/, 'Wildrose', 'flowering_bushes', 'shrub', 'medium'],
  [/^zeder(\d+)$/, 'Zeder', 'conifers', 'tree', 'large'],
  [/^zypresse(\d+)$/, 'Zypresse', 'conifers', 'tree', 'large'],
  [/^palme_(\d+)$/, 'Palme (Art offen)', 'palms', 'tree', 'large'],
  [/^bush_(\d+)$/, 'Busch (Art offen)', 'unclassified_bushes', 'shrub', 'small'],
  [/^berg_(\d+)$/, 'Berg (Typ offen)', 'mountains', 'mountain', 'giant'],
 ];
 const stem = name => String(name || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').toLowerCase().replace(/\.(?:png|webp|jpe?g|svg|gif|avif)$/i,'');
 function classify(asset) {
  if (asset?.category !== 'nature' || !/\.(?:png|webp|jpe?g|svg|gif|avif)$/i.test(asset.name || '')) return null;
  const base = stem(asset.name);
  const journal = /^tree_(1[2-9])$/.exec(base);
  if (journal) return {id:'journal_tree_'+journal[1],name:'Journal-Spezialbaum '+journal[1],family:'journal_trees',kind:'special',sizeClass:'large',apiOnly:true,confirmedSpecies:false};
  for (const [pattern,name,family,kind,sizeClass] of definitions) {
   if (pattern.test(base)) return {id:'existing_'+base,name,family,kind,sizeClass,apiOnly:false,confirmedSpecies:!name.includes('offen')};
  }
  return null;
 }
 const isJournal = asset => !!classify(asset)?.apiOnly;
 function metadata(info, tmpl, filename) {
  const mountain=info.kind==='mountain',ground=info.kind==='ground_cover',tree=info.kind==='tree';
  return {
   ...tmpl, id:info.id, family:info.family, kind:info.kind, sizeClass:info.sizeClass,
   sizeMode:'manual',
   logicalWidth:mountain?360:ground?28:tree?110:52,
   description:info.apiOnly
    ?'Klassifizierter Journal-Spezialbaum für die API. Keine gewöhnliche Baumart und keine automatische Weltplatzierung.'
    :info.name+' – vorhandene Grafik; Zuordnung nach Dateiname, Silhouette und Biomfreigabe noch nicht geprüft.',
   sourceReference:'Bestandsdatei: '+filename,
   anchor:mountain?{x:.5,y:.67}:{x:.5,y:.96},
   shadow:{...tmpl.shadow,mode:mountain||ground||info.apiOnly?'none':tree?'generic_medium_round':'generic_small_round'},
   terrainPresetId:'',allowedTerrainCategories:[],allowedTerrainTypes:[],excludedTerrainTypes:[],
   placement:{...tmpl.placement,weight:0,density:0,canCluster:false},
   artStatus:'candidate',
   tags:info.apiOnly?['existing','journal_api','no_auto_spawn']:['existing','needs_art_review',...(info.confirmedSpecies?[]:['needs_species_review'])],
   ...(mountain?{mountain:{radius:1,coreRadius:0,shadowOpacity:.23,flatten:true}}:{})
  };
 }
 return {classify,isJournal,metadata};
})();
