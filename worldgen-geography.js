/* Vedras Reiche – shared, versioned geographic world builder.
 * CANONICAL: browsergame/public/worldgen-geography.js
 * MIRROR: asset_labor/worldgen-geography.js – keep byte-for-byte identical.
 * Browser and Node/CommonJS; no renderer, network, gameplay or asset dependencies.
 * Worldgen is an explicit pre-game world-build step, not a tile-on-first-visit hook.
 */
(function (root) {
  "use strict";
  const VERSION = "geography-v2.0.0";
  const DIRS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
  const definitions = [
    ["Welt / Wasser","water.fraction","Wasseranteil",0.25,0.05,0.65,0.01,"Zielanteil Wasser an der Gesamtfläche"],
    ["Welt / Wasser","water.scale","Größe der Wasserlandschaften",25,5,85,1,"Höher bedeutet größere zusammenhängende Meere und Seen"],
    ["Welt / Wasser","water.coastDetail","Küstenunregelmäßigkeit",0.28,0,0.65,0.01,"Kleinräumige Buchten und Vorsprünge"],
    ["Welt / Wasser","water.lakeInfluence","Binnengewässer",0.10,0,0.4,0.01,"Kleinere Seen zusätzlich zu großen Wasserflächen"],
    ["Welt / Wasser","water.stormChance","Stürmischer Ozean",0.22,0,0.8,0.01,"Anteil entsprechender Tiefwasserregionen, keine Wettervorhersage"],
    ["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",0.19,0,0.5,0.01,"Nur Ozean ohne direkte Landberührung"],
    ["Klima","climate.scale","Größe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],
    ["Klima","climate.temperature","Mittlere Temperatur",0.57,0.15,0.9,0.01,"Normierter Temperatur-Grundwert"],
    ["Klima","climate.tempVariation","Temperaturabweichung",0.43,0,0.9,0.01,"Regional unterschiedliche Wärme"],
    ["Klima","climate.latitudeCooling","Breitenabhängige Abkühlung",0.20,0,0.6,0.01,"An beiden Kartenenden kälter"],
    ["Klima","climate.humidity","Mittlere Feuchtigkeit",0.51,0.1,0.9,0.01,"Normierter Feuchtigkeits-Grundwert"],
    ["Klima","climate.humidityVariation","Feuchteabweichung",0.49,0,0.9,0.01,"Regionale Trockenheit und Regengebiete"],
    ["Klima","climate.coastalHumidity","Wassernähe-Feuchtebonus",0.12,0,0.35,0.01,"Verblasst mit der Entfernung von Wasser"],
    ["Biome / Geologie","biomes.targetHexes","Biom-Zielgröße in Hexen",60,15,250,1,"Unregelmäßige, grob zusammenhängende Biomkerne; keine feste Mindestgröße"],
    ["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",0.32,0,0.9,0.01,"Weg von perfekten geometrischen Regionen"],
    ["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",0.31,0.12,0.6,0.01,"Ab wann warme Gebiete arid werden"],
    ["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",0.72,0.5,0.95,0.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],
    ["Biome / Geologie","geology.scale","Größe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischböden in zusammenhängenden Feldern"],
    ["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",0.50,0,1,0.01,"Verschiebt die Wüstenuntertypen"],
    ["Relief","relief.hillFraction","Hügelanteil an Land",0.31,0,0.75,0.01,"Anteil Hügel ohne Berge"],
    ["Relief","relief.mountainFraction","Berganteil an Land",0.075,0,0.25,0.005,"Unpassierbare Bergfelder"],
    ["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenhängende Hügel- und Berglandschaften"],
    ["Relief","relief.chainLength","Länge der Bergformationen",23,5,70,1,"Längliche Gebirgsstrukturen statt verstreuter Einzelberge"],
    ["Relief","relief.chainWidth","Breite der Gebirgszüge",0.4,0.05,0.95,0.01,"Breiter oder schmaler Gebirgskern"],
    ["Relief","relief.hillVariation","Hügelprofil-Variation",0.65,0,1,0.01,"Von sanften Kuppen bis steilen Rücken"],
    ["Gewässer / Flüsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",0.75,0,5,0.05,"Zielwert für die Zahl natürlicher Flussläufe"],
    ["Gewässer / Flüsse","rivers.minLength","Mindestlänge eines Flusses",5,2,25,1,"In Hexverbindungen zur nächsten Wasserfläche"],
    ["Gewässer / Flüsse","rivers.meander","Flusskrümmung",0.25,0,1,0.01,"Varianz zwischen geeigneten Abflussnachbarn"],
    ["Vegetation","forest.coverage","Waldanteil geeigneter Landregionen",0.36,0,0.9,0.01,"Bewaldung als Overlay; Grundbiom bleibt erhalten"],
    ["Vegetation","forest.patchScale","Größe der Waldgruppen",8,2,30,1,"Räumlicher Zusammenhang lichter und dichter Wälder"],
    ["Vegetation","forest.denseThreshold","Schwelle dichter Wald",0.72,0.35,0.95,0.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],
    ["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],
    ["Fundorte / Tiere","features.animalsPer1000","Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Pferde und Schweine als erste Testgruppen"],
    ["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben ergänzbar"],
    ["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],
    ["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 Wüstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],
    ["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]
  ];
  const extraFeatures = [];
  const clamp = (x,a=0,b=1) => Math.min(b,Math.max(a,x));
  const key = (q,r) => q+","+r;
  function hashString(s) {
    let h=2166136261;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function hash(seed,q,r,salt) {
    let h=seed^Math.imul(q+32767,374761393)^Math.imul(r+65521,668265263)^hashString(String(salt));
    h=Math.imul(h^(h>>>15),2246822519);h=Math.imul(h^(h>>>13),3266489917);
    return (h^(h>>>16))>>>0;
  }
  const unit=(seed,q,r,salt)=>hash(seed,q,r,salt)/4294967296;
  const ease=x=>x*x*(3-2*x);
  const mix=(a,b,t)=>a+(b-a)*t;
  function noise(seed,x,y,scale,salt) {
    const px=x/scale,py=y/scale,q=Math.floor(px),r=Math.floor(py),u=ease(px-q),v=ease(py-r);
    return mix(mix(unit(seed,q,r,salt),unit(seed,q+1,r,salt),u),
      mix(unit(seed,q,r+1,salt),unit(seed,q+1,r+1,salt),u),v);
  }
  function parameterSchema(){return definitions.map(([group,id,label,defaultValue,min,max,step,help])=>
    ({group,id,label,defaultValue,min,max,step,help}));}
  function defaultConfig(){return Object.fromEntries(definitions.map(d=>[d[1],d[3]]));}
  function normalizeConfig(raw) {
    if(raw!==undefined&&(typeof raw!=="object"||raw===null||Array.isArray(raw)))throw Error("Ungültige Parameterdatei.");
    const out=defaultConfig();
    for(const [,id,,fallback,min,max] of definitions) {
      if(raw?.[id]===undefined)continue;
      const val=Number(raw[id]);
      if(!Number.isFinite(val)||val<min||val>max)throw RangeError("Parameter außerhalb des gültigen Bereichs: "+id);
      out[id]=val;
    }
    if(out["relief.mountainFraction"]+out["relief.hillFraction"]>0.95)
      throw RangeError("Hügel- und Berganteil dürfen zusammen maximal 95 % ausmachen.");
    return out;
  }
  function registerParameter(def) {
    if(!def||typeof def.id!=="string"||!/^extension\.[a-z0-9_.]+$/.test(def.id)||definitions.some(d=>d[1]===def.id))
      throw Error("Neue Parameter benötigen eine eindeutige extension.*-ID.");
    for(const k of ["defaultValue","min","max","step"])if(!Number.isFinite(def[k]))throw Error("Ungültiger Erweiterungsparameter: "+k);
    if(def.min>def.defaultValue||def.defaultValue>def.max||def.step<=0)throw Error("Ungültige Parametergrenzen.");
    definitions.push([String(def.group||"Erweiterungen"),def.id,String(def.label||def.id),
      def.defaultValue,def.min,def.max,def.step,String(def.help||"")]);
  }
  function registerFeature(def) {
    if(!def||!/^extension\.[a-z0-9_.]+$/.test(def.id)||typeof def.place!=="function"||
       extraFeatures.some(d=>d.id===def.id))throw Error("Ungültige Feature-Erweiterung.");
    extraFeatures.push(def);
  }
  function neighbours(c,lookup){return DIRS.map(([dq,dr])=>lookup.get(key(c.q+dq,c.r+dr))).filter(Boolean);}
  function terrainFrom(family,t,h,soil,c) {
    if(family==="arid"){
      if(h>c["biomes.dryThreshold"]-0.045)return "semi_desert";
      const s=clamp(soil+(c["geology.sandBias"]-.5)*.36);
      if(s<.11)return "rocky_badlands";
      if(s<.22)return "badlands";
      if(s<.33)return "rocky_desert";
      if(s<.48)return "sandy_rocky_desert";
      if(s<.62)return "desert";
      if(s<.74)return "clay_desert";
      if(s<.85)return "sandy_badlands";
      if(s<.94)return "wasteland";
      return "rocky_badlands";
    }
    if(family==="grassland"){
      if(h<.36)return "sparse_pasture";
      if(soil<.37)return "pasture";
      return "grassland";
    }
    if(family==="cold"){
      if(t<.14)return h>.55?"snowfields":"frozen_tundra";
      if(t<.25)return h>.8?"snowfields":"tundra";
      return soil>.78?"highland":"tundra";
    }
    if(family==="wetland")return t>.64?"swamp":t<.38?"moor":h>.85?"marshland":soil>.5?"moor":"marshland";
    if(family==="jungle")return "jungle";
    if(family==="savanna")return h<.33?"semi_desert":"savanna";
    return "grassland";
  }
  function biomeFamily(t,h,c) {
    if(t<.29)return "cold";
    if(h>c["biomes.wetThreshold"])return t>.68?"jungle":"wetland";
    if(h<c["biomes.dryThreshold"]&&t>.48)return "arid";
    if(t>.66)return "savanna";
    if(h>.67)return "wetland";
    return "grassland";
  }
  function region(seed,q,r,c) {
    const span=Math.sqrt(c["biomes.targetHexes"]);
    const warp=c["biomes.borderWarp"]*span;
    const x=q+warp*(noise(seed,q,r,span*.72,"warp-a")-.5)*2;
    const y=r+warp*(noise(seed,q,r,span*.72,"warp-b")-.5)*2;
    const a=Math.floor(x/span),b=Math.floor(y/span);let best=Infinity,picked=null;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const u=a+i,v=b+j,cx=(u+.5+(unit(seed,u,v,"jit-q")-.5)*.72)*span,
        cy=(v+.5+(unit(seed,u,v,"jit-r")-.5)*.72)*span;
      const d=(x-cx)*(x-cx)+(y-cy)*(y-cy);
      if(d<best){best=d;picked={id:key(u,v),x:cx,y:cy};}
    }
    return picked;
  }
  function generateWorld(seed, options={}) {
    if(typeof seed!=="string"||seed.length<1||seed.length>256)throw Error("World Seed muss 1–256 Zeichen lang sein.");
    const width=options.width===undefined?100:Number(options.width);
    const height=options.height===undefined?80:Number(options.height);
    if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<10||height<10||
       width*height>60000)throw RangeError("Weltgröße: mindestens 10×10, maximal 60.000 Hexfelder.");
    const c=normalizeConfig(options.config),s=hashString(VERSION+":"+seed);
    const cells=[],byKey=new Map();
    const temp=(q,r)=>clamp(c["climate.temperature"]+
      (noise(s,q,r,c["climate.scale"],"temp")-.5)*2*c["climate.tempVariation"]-
      Math.abs((r+.5)/height-.5)*2*c["climate.latitudeCooling"]);
    const moisture=(q,r)=>clamp(c["climate.humidity"]+
      (noise(s,q,r,c["climate.scale"]*.9,"wet")-.5)*2*c["climate.humidityVariation"]);
    for(let r=0;r<height;r++)for(let q=0;q<width;q++){
      const wide=noise(s,q,r,c["water.scale"],"sea");
      const detail=noise(s,q,r,Math.max(2,c["water.scale"]*.21),"shore");
      const lakes=noise(s,q,r,4.2,"lakes");
      const waterScore=wide*(1-c["water.coastDetail"])+detail*c["water.coastDetail"]+
        Math.max(0,lakes-.72)*c["water.lakeInfluence"];
      const cell={q,r,waterScore,temperature:temp(q,r),humidity:moisture(q,r),
        regionId:"",baseBiome:null,terrainId:null,surfaceClass:"land",reliefClass:"flat",
        hillProfile:null,hillStrength:0,mountainClass:null,forestClass:"none",
        forestDensity:0,riverPotential:0,river:false,riverEdges:[],features:[]};
      cells.push(cell);byKey.set(key(q,r),cell);
    }
    const count=Math.round(cells.length*c["water.fraction"]);
    const ranked=[...cells].sort((a,b)=>a.waterScore-b.waterScore||hash(s,a.q,a.r,"tie")-hash(s,b.q,b.r,"tie"));
    for(let i=0;i<count;i++)ranked[i].surfaceClass="water";
    // Coast classification is ALWAYS based on all six FINAL neighboring hexes.
    for(const cell of cells)if(cell.surfaceClass==="water"){
      cell.surfaceClass=neighbours(cell,byKey).some(n=>n.surfaceClass==="land")?"coastal_water":"deep_water";
    }
    // Existence of shore never depends on the selected ocean texture.
    for(const cell of cells)if(cell.surfaceClass==="deep_water"){
      const storm=noise(s,cell.q,cell.r,c["water.scale"]*.8,"storm");
      cell.surfaceClass=cell.temperature<c["water.iceTemperature"]?"icy_ocean":
        storm>1-c["water.stormChance"]?"stormy_ocean":"ocean";
    }
    // Multi-source water-distance map for moisture and river routing.
    const distances=new Map(),queue=[];
    for(const cell of cells)if(cell.surfaceClass!=="land"){
      distances.set(key(cell.q,cell.r),0);queue.push(cell);
    }
    for(let i=0;i<queue.length;i++){
      const cur=queue[i],d=distances.get(key(cur.q,cur.r));
      for(const n of neighbours(cur,byKey)){
        const k=key(n.q,n.r);if(!distances.has(k)){distances.set(k,d+1);queue.push(n);}
      }
    }
    const regionClimate=new Map(),mountainRank=[],forestable=[];
    for(const cell of cells){
      if(cell.surfaceClass!=="land"){cell.terrainId=cell.surfaceClass;continue;}
      const distance=distances.get(key(cell.q,cell.r))??100;
      cell.humidity=clamp(cell.humidity+c["climate.coastalHumidity"]*Math.exp(-distance/3));
      const center=region(s,cell.q,cell.r,c);
      cell.regionId=center.id;
      if(!regionClimate.has(center.id))
        regionClimate.set(center.id,{t:temp(center.x,center.y),h:moisture(center.x,center.y)});
      const climate=regionClimate.get(center.id);
      const t=clamp(climate.t*.82+cell.temperature*.18),
        h=clamp(climate.h*.82+cell.humidity*.18);
      const family=biomeFamily(t,h,c),soil=noise(s,cell.q,cell.r,c["geology.scale"],"soil");
      cell.baseBiome=family;
      cell.terrainId=terrainFrom(family,t,h,soil,c);
      const ridge=1-Math.abs(noise(s,cell.q*.58+cell.r*.3,cell.r*1.5,c["relief.chainLength"],"ridge")-.5)*2;
      const mass=noise(s,cell.q,cell.r,c["relief.scale"],"relief");
      const mountainScore=(mass*.60+ridge*.40)*c["relief.chainWidth"]+
        mass*(1-c["relief.chainWidth"]);
      const hillScore=mass*.75+noise(s,cell.q,cell.r,c["relief.scale"]*.46,"hills")*.25;
      cell._mountainScore=mountainScore;cell._hillScore=hillScore;
      mountainRank.push(cell);
      const suitability=family==="grassland"?.86:family==="jungle"?1:
        family==="wetland"?.76:family==="savanna"?.46:family==="cold"?.25:.08;
      const forestNoise=noise(s,cell.q,cell.r,c["forest.patchScale"],"forest");
      const forestValue=clamp((forestNoise-.5)*1.6+c["forest.coverage"]-.3+
        (cell.humidity-.5)*.35)*suitability;
      cell.forestDensity=clamp(forestValue);
      cell.riverPotential=clamp(cell.humidity*.68+mass*.18+Math.min(distance,15)/30);
      forestable.push(cell);
    }
    // Fractions affect LAND only. Mountain always takes precedence over hills.
    const totalLand=mountainRank.length, mountains=Math.round(totalLand*c["relief.mountainFraction"]);
    const sortedM=[...mountainRank].sort((a,b)=>b._mountainScore-a._mountainScore);
    for(let i=0;i<mountains;i++){
      const x=sortedM[i];x.reliefClass="mountain";x.mountainClass="massif";x.forestDensity=0;
    }
    const hills=Math.round(totalLand*c["relief.hillFraction"]);
    const sortedH=mountainRank.filter(x=>x.reliefClass==="flat").sort((a,b)=>b._hillScore-a._hillScore);
    const hillStyles=["rounded","steep","chain","plateau","ridge"];
    for(let i=0;i<Math.min(hills,sortedH.length);i++){
      const x=sortedH[i];x.reliefClass="hills";x.hillStrength=clamp(x._hillScore*c["relief.hillVariation"]+
        (1-c["relief.hillVariation"])*.40);
      x.hillProfile=hillStyles[Math.floor(unit(s,Math.floor(x.q/3),Math.floor(x.r/3),"hill-style")*hillStyles.length)];
    }
    for(const cell of forestable){
      if(cell.reliefClass==="mountain"){cell.forestClass="none";continue;}
      if(cell.baseBiome==="jungle"){cell.forestClass="dense_forest";cell.forestDensity=Math.max(.76,cell.forestDensity);}
      else if(cell.forestDensity>=c["forest.denseThreshold"]*.65)cell.forestClass="dense_forest";
      else if(cell.forestDensity>.12)cell.forestClass="light_forest";
    }
    // A source must be able to reach water via traversable, adjacent hexes.
    const steps=new Map(),streamQueue=[];
    for(const cell of cells)if(cell.surfaceClass!=="land"){steps.set(key(cell.q,cell.r),0);streamQueue.push(cell);}
    for(let i=0;i<streamQueue.length;i++){
      const cur=streamQueue[i],dist=steps.get(key(cur.q,cur.r));
      for(const n of neighbours(cur,byKey)){
        if(n.reliefClass==="mountain")continue;
        const k=key(n.q,n.r);if(!steps.has(k)){steps.set(k,dist+1);streamQueue.push(n);}
      }
    }
    const sources=forestable.filter(x=>x.reliefClass!=="mountain" &&
      (steps.get(key(x.q,x.r))??0)>=c["rivers.minLength"]).sort((a,b)=>
        (b.riverPotential+unit(s,b.q,b.r,"headwater")*.22)-
        (a.riverPotential+unit(s,a.q,a.r,"headwater")*.22));
    const wanted=Math.round(totalLand*c["rivers.sourcesPer100"]/100);
    const riverPaths=[],origins=[];
    for(const candidate of sources){
      if(riverPaths.length>=wanted)break;
      if(origins.some(o=>Math.max(Math.abs(o.q-candidate.q),Math.abs(o.r-candidate.r),
          Math.abs(o.q+o.r-candidate.q-candidate.r))<c["rivers.minLength"]))continue;
      const path=[candidate];let cur=candidate,valid=false;
      for(let n=0;n<width+height+1;n++){
        const dist=steps.get(key(cur.q,cur.r));
        if(dist===0){valid=true;break;}
        const choices=neighbours(cur,byKey).filter(x=>x.reliefClass!=="mountain" &&
          steps.get(key(x.q,x.r))===dist-1).sort((a,b)=>
            (a._hillScore||0)-(b._hillScore||0)+c["rivers.meander"]*
            (unit(s,cur.q,cur.r,key(a.q,a.r))-unit(s,cur.q,cur.r,key(b.q,b.r))));
        if(!choices.length)break;
        cur=choices[0];path.push(cur);
      }
      if(!valid||path.length-1<c["rivers.minLength"])continue;
      riverPaths.push(path.map(x=>[x.q,x.r]));origins.push(candidate);
      for(let i=0;i<path.length;i++){
        const x=path[i];if(x.surfaceClass!=="land")continue;
        x.river=true;
        for(const other of [path[i-1],path[i+1]]){
          if(!other)continue;
          const dir=DIRS.findIndex(([dq,dr])=>x.q+dq===other.q&&x.r+dr===other.r);
          if(dir>=0&&!x.riverEdges.includes(dir))x.riverEdges.push(dir);
        }
      }
    }
    // Geographic features exist before exploration and are independent of sprites.
    for(const x of cells){
      const chance=(type,per1000)=>unit(s,x.q,x.r,"feature:"+type)<per1000/1000;
      if(x.surfaceClass==="land"&&x.reliefClass!=="mountain"){
        if(chance("iron",c["features.ironPer1000"])&&x._mountainScore>.30)x.features.push("iron");
        if(chance("animals",c["features.animalsPer1000"])){
          if(["grassland","savanna"].includes(x.baseBiome))x.features.push("horses");
          else if(["wetland","grassland","jungle"].includes(x.baseBiome))x.features.push("pigs");
        }
        if(chance("ruins",c["features.ruinsPer1000"]))x.features.push("ruins");
        if(chance("obelisk",c["features.obelisksPer1000"]))x.features.push("obelisk");
        if(x.baseBiome==="arid"&&chance("oasis",c["features.oasesPer1000"]))x.features.push("oasis");
      }else if(x.surfaceClass!=="land"&&chance("wreck",c["features.wrecksPer1000"]))
        x.features.push("wreck");
      for(const extension of extraFeatures){
        const placed=extension.place({hex:x,config:c,seed,random:(salt)=>unit(s,x.q,x.r,extension.id+":"+salt)});
        if(placed) x.features.push(extension.id);
      }
      delete x.waterScore;delete x._hillScore;delete x._mountainScore;
    }
    const stats={total:cells.length,land:totalLand,water:cells.length-totalLand,coast:0,
      hills:0,mountains:0,rivers:riverPaths.length,forest:0,biomes:{},terrains:{},features:{}};
    for(const x of cells){
      if(x.surfaceClass==="coastal_water")stats.coast++;
      if(x.reliefClass==="hills")stats.hills++;
      if(x.reliefClass==="mountain")stats.mountains++;
      if(x.forestClass!=="none")stats.forest++;
      if(x.baseBiome)stats.biomes[x.baseBiome]=(stats.biomes[x.baseBiome]||0)+1;
      stats.terrains[x.terrainId]=(stats.terrains[x.terrainId]||0)+1;
      for(const f of x.features)stats.features[f]=(stats.features[f]||0)+1;
    }
    return {version:VERSION,seed,width,height,config:c,cells,riverPaths,stats};
  }
  const api={VERSION,DIRS,parameterSchema,defaultConfig,normalizeConfig,
    registerParameter,registerFeature,generateWorld,getWorldCell:(world,q,r)=>{
      if(q<0||r<0||q>=world.width||r>=world.height)return null;
      return world.cells[r*world.width+q]??null;
    }};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.VedrasGeography=api;
})(typeof window!=="undefined"?window:globalThis);
