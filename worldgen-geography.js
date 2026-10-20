/* Vedras Reiche – shared, versioned geographic world builder.
 * CANONICAL: browsergame/public/worldgen-geography.js
 * MIRROR: asset_labor/worldgen-geography.js – keep byte-for-byte identical.
 * Browser and Node/CommonJS; no renderer, network, gameplay or asset dependencies.
 * Worldgen is an explicit pre-game world-build step, not a tile-on-first-visit hook.
 */
(function (root) {
  "use strict";
  const VERSION = "geography-v2.1.0";
  const DIRS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
  const definitions = [
    ["Welt / Wasser","water.fraction","Wasser-Zielanteil",0.25,0.05,0.65,0.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],
    ["Welt / Wasser","water.scale","Größe der Wasserlandschaften",25,5,85,1,"Höher bedeutet größere zusammenhängende Meere und Seen"],
    ["Welt / Wasser","water.coastDetail","Küstenunregelmäßigkeit",0.28,0,0.65,0.01,"Kleinräumige Buchten und Vorsprünge"],
    ["Welt / Wasser","water.lakeInfluence","Binnengewässer",0.10,0,0.4,0.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],
    ["Welt / Wasser","water.stormChance","Stürmischer Ozean (dauerhaft)",0.22,0,0.8,0.01,"Fester Terrain-Typ ohne dynamisches Wetter"],
    ["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",0.19,0,0.5,0.01,"Nur Ozean ohne direkte Landberührung"],
    ["Klima","climate.scale","Größe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],
    ["Klima","climate.temperature","Mittlere Temperatur",0.57,0.15,0.9,0.01,"Normierter Temperatur-Grundwert"],
    ["Klima","climate.tempVariation","Temperaturabweichung",0.43,0,0.9,0.01,"Regional unterschiedliche Wärme"],
    ["Klima","climate.humidity","Mittlere Feuchtigkeit",0.51,0.1,0.9,0.01,"Normierter Feuchtigkeits-Grundwert"],
    ["Klima","climate.humidityVariation","Feuchteabweichung",0.49,0,0.9,0.01,"Regionale Trockenheit und Regengebiete"],
    ["Klima","climate.coastalHumidity","Wassernähe-Feuchtebonus",0.12,0,0.35,0.01,"Verblasst mit der Entfernung von Wasser"],
    ["Biome / Geologie","biomes.targetHexes","Biom-Zielgröße in Hexen",60,15,250,1,"Unregelmäßige, grob zusammenhängende Biomkerne; keine feste Mindestgröße"],
    ["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",0.32,0,0.9,0.01,"Weg von perfekten geometrischen Regionen"],
    ["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",0.31,0.12,0.6,0.01,"Ab wann warme Gebiete arid werden"],
    ["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",0.72,0.5,0.95,0.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],
    ["Biome / Geologie","geology.scale","Größe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischböden in zusammenhängenden Feldern"],
    ["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",0.50,0,1,0.01,"Verschiebt die Wüstenuntertypen"],
    ["Relief","relief.hillFraction","Hügel-Zielanteil",0.31,0,0.75,0.01,"Statistisch, nicht pro Ausschnitt erzwungen"],
    ["Relief","relief.mountainFraction","Berg-Zielanteil",0.075,0,0.25,0.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],
    ["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenhängende Hügel- und Berglandschaften"],
    ["Relief","relief.chainLength","Länge der Bergformationen",23,5,70,1,"Längliche Gebirgsstrukturen statt verstreuter Einzelberge"],
    ["Relief","relief.chainWidth","Breite der Gebirgszüge",0.4,0.05,0.95,0.01,"Breiter oder schmaler Gebirgskern"],
    ["Relief","relief.hillVariation","Hügelprofil-Variation",0.65,0,1,0.01,"Von sanften Kuppen bis steilen Rücken"],
    ["Gewässer / Flüsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",0.75,0,5,0.05,"Zielwert für die Zahl natürlicher Flussläufe"],
    ["Gewässer / Flüsse","rivers.minLength","Mindestlänge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],
    ["Gewässer / Flüsse","rivers.maxLength","Maximale Fluss-Routenlänge",28,10,50,1,"Lokale Flussroute, unabhängig vom Kartenausschnitt"],
    ["Gewässer / Flüsse","rivers.meander","Flusskrümmung",0.25,0,1,0.01,"Varianz zwischen geeigneten Abflussnachbarn"],
    ["Vegetation","forest.coverage","Waldintensität",0.36,0,0.9,0.01,"Bewaldungswahrscheinlichkeit; tatsächlicher Waldanteil wird auf der Karte angezeigt"],
    ["Vegetation","forest.patchScale","Größe der Waldgruppen",8,2,30,1,"Räumlicher Zusammenhang lichter und dichter Wälder"],
    ["Vegetation","forest.denseThreshold","Schwelle dichter Wald",0.72,0.35,0.95,0.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],
    ["Klima / Details","climate.coastalDecay","Feuchtereichweite der Küsten",3,1,20,0.5,"Entfernung, über die Gewässer die Landfeuchte beeinflussen"],
    ["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",0.29,0.1,0.48,0.01,"Kältebiome gegenüber gemäßigten Regionen"],
    ["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",0.66,0.45,0.85,0.01,"Warmregionen gegenüber Grasland"],
    ["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-Wärmegrenze",0.68,0.45,0.9,0.01,"Dschungel kann direkt an Wüste grenzen"],
    ["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener Wüsten",0.48,0.3,0.8,0.01,"Arides Biom nur bei ausreichend warmer Temperatur"],
    ["Biomgrenzen","biomes.wetlandBoundary","Zusätzliche Feuchtgebietsgrenze",0.67,0.45,0.9,0.01,"Warme/gemäßigte Feuchtregionen"],
    ["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakohärenz",0.82,0.3,1,0.01,"Große Biomregionen statt kleinteiliger Einzelhexe"],
    ["Biomgrenzen","biomes.semiDesertMargin","Übergang Halbwüste zu Wüste",0.045,0,0.18,0.005,"Breite der Halbwüstenzone in ariden Regionen"],
    ["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",0.36,0.1,0.7,0.01,"Trockenere Grasregionen erzeugen karges Weideland"],
    ["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",0.37,0,1,0.01,"Untertyp-Mischung innerhalb Grasregionen"],
    ["Boden-Untertypen","geology.highlandSoil","Hochland-Gesteinsausprägung",0.78,0.2,1,0.01,"Materialausprägung in kühlen Regionen; kein echtes Höhenmodell"],
    ["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",0.50,0,1,0.01,"Steuert die Untertypen in gemäßigten Feuchtgebieten"],
    ["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Boden-Untertypen","geology.aridRockyDesert","Steinwüste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige Wüste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Boden-Untertypen","geology.aridDesert","Wüstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Boden-Untertypen","geology.aridClay","Lehmwüste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Boden-Untertypen","geology.aridWasteland","Ödland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener Wüstenregionen"],
    ["Vegetation","forest.lightThreshold","Grenze lichter Wald",0.12,0.02,0.4,0.01,"Dichte für lichte Waldklassen"],
    ["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",0.65,0.4,1,0.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],
    ["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],
    ["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],
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
  function chooseWeighted(value,entries,c) {
    const total=entries.reduce((n,[,name])=>n+c[name],0);
    if(total<=0)return entries[0][0];
    let remaining=clamp(value,0,.999999999)*total;
    for(const [id,name] of entries){remaining-=c[name];if(remaining<0)return id;}
    return entries[entries.length-1][0];
  }
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
      if(h>c["biomes.dryThreshold"]-c["biomes.semiDesertMargin"])return "semi_desert";
      const s=clamp(soil+(c["geology.sandBias"]-.5)*.36);
      return chooseWeighted(s,[
        ["rocky_badlands","geology.aridRockyBadlands"],
        ["badlands","geology.aridBadlands"],
        ["rocky_desert","geology.aridRockyDesert"],
        ["sandy_rocky_desert","geology.aridSandyRocky"],
        ["desert","geology.aridDesert"],
        ["clay_desert","geology.aridClay"],
        ["sandy_badlands","geology.aridSandyBadlands"],
        ["wasteland","geology.aridWasteland"]
      ],c);
    }
    if(family==="grassland"){
      if(h<c["geology.grassSparseHumidity"])return "sparse_pasture";
      if(soil<c["geology.pastureSoil"])return "pasture";
      return "grassland";
    }
    if(family==="cold"){
      if(t<.14)return h>.55?"snowfields":"frozen_tundra";
      if(t<.25)return h>.8?"snowfields":"tundra";
      return soil>c["geology.highlandSoil"]?"highland":"tundra";
    }
    if(family==="wetland")return t>.64?"swamp":t<.38?"moor":h>.85?"marshland":soil>c["geology.wetlandSoil"]?"moor":"marshland";
    if(family==="jungle")return "jungle";
    if(family==="savanna")return h<.33?"semi_desert":"savanna";
    return "grassland";
  }
  function biomeFamily(t,h,c) {
    if(t<c["biomes.coldBoundary"])return "cold";
    if(h>c["biomes.wetThreshold"])return t>c["biomes.jungleWarmBoundary"]?"jungle":"wetland";
    if(h<c["biomes.dryThreshold"]&&t>c["biomes.aridWarmBoundary"])return "arid";
    if(t>c["biomes.warmBoundary"])return "savanna";
    if(h>c["biomes.wetlandBoundary"])return "wetland";
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

  // Sampling uses fixed absolute world coordinates. A crop can NEVER change
  // water, relief or climate already generated elsewhere.
  const hexDist=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),
    Math.abs(a.q+a.r-b.q-b.r));
  function globalCut(seed,label,part,score,eligible=()=>true){
    if(part<=0)return Infinity;
    const values=[];
    for(let i=0;i<1900;i++){
      const q=Math.floor((unit(seed,i,0,"sampleQ:"+label)-.5)*6900);
      const r=Math.floor((unit(seed,i,1,"sampleR:"+label)-.5)*6900);
      if(eligible(q,r))values.push(score(q,r));
    }
    if(!values.length)return Infinity;
    values.sort((a,b)=>b-a);
    return values[Math.min(values.length-1,Math.floor(clamp(part)*values.length))];
  }
  function generateWorld(seed, options={}) {
    if(typeof seed!=="string"||seed.length<1||seed.length>256)
      throw Error("World Seed muss 1–256 Zeichen lang sein.");
    const width=options.width===undefined?100:Number(options.width);
    const height=options.height===undefined?80:Number(options.height);
    const originQ=options.originQ===undefined?0:Number(options.originQ);
    const originR=options.originR===undefined?0:Number(options.originR);
    if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
       width<10||height<10||width*height>60000)
      throw RangeError("Kartenausschnitt mindestens 10×10, maximal 60.000 Hexfelder.");
    if(!Number.isSafeInteger(originQ)||!Number.isSafeInteger(originR)||
       Math.abs(originQ)>1000000||Math.abs(originR)>1000000)
      throw RangeError("Ungültige Weltkoordinaten.");
    const c=normalizeConfig(options.config),s=hashString(VERSION+":"+seed);
    const cacheWater=new Map(),cacheRelief=new Map(),cacheField=new Map();
    const spot=(q,r)=>key(q,r);
    const temperature=(q,r)=>clamp(c["climate.temperature"]+
      (noise(s,q,r,c["climate.scale"],"temp")-.5)*2*c["climate.tempVariation"]);
    const humidity=(q,r)=>clamp(c["climate.humidity"]+
      (noise(s,q,r,c["climate.scale"]*.9,"wet")-.5)*2*c["climate.humidityVariation"]);
    function waterScore(q,r) {
      const wide=noise(s,q,r,c["water.scale"],"sea");
      const detail=noise(s,q,r,Math.max(2,c["water.scale"]*.21),"shore");
      const lakes=noise(s,q,r,4.2,"lakes");
      // Lower values mean water; MORE lakeInfluence means MORE water.
      return wide*(1-c["water.coastDetail"])+detail*c["water.coastDetail"]-
        Math.max(0,lakes-.68)*c["water.lakeInfluence"];
    }
    // Calibrate the core ocean share independently of the small-lake bonus.
    // Increasing the lake control can ADD lakes, not delete existing water.
    const waterCut=globalCut(s,"water",c["water.fraction"],(q,r)=>{
      const wide=noise(s,q,r,c["water.scale"],"sea");
      const detail=noise(s,q,r,Math.max(2,c["water.scale"]*.21),"shore");
      return -(wide*(1-c["water.coastDetail"])+detail*c["water.coastDetail"]);
    });
    function wet(q,r){
      const k=spot(q,r);if(cacheWater.has(k))return cacheWater.get(k);
      const v=-waterScore(q,r)>=waterCut;cacheWater.set(k,v);return v;
    }
    function relief(q,r){
      const k=spot(q,r);if(cacheRelief.has(k))return cacheRelief.get(k);
      const mass=noise(s,q,r,c["relief.scale"],"relief");
      const ridge=1-Math.abs(noise(s,q*.58+r*.3,r*1.5,
        c["relief.chainLength"],"ridge")-.5)*2;
      const obj={mass,mountain:(mass*.60+ridge*.40)*c["relief.chainWidth"]+
        mass*(1-c["relief.chainWidth"]),
        hill:mass*.75+noise(s,q,r,c["relief.scale"]*.46,"hills")*.25};
      cacheRelief.set(k,obj);return obj;
    }
    const mountainCut=globalCut(s,"mountain",c["relief.mountainFraction"],
      (q,r)=>relief(q,r).mountain,(q,r)=>!wet(q,r));
    const isMountain=(q,r)=>!wet(q,r)&&relief(q,r).mountain>=mountainCut;
    const hillCut=globalCut(s,"hills",c["relief.hillFraction"],
      (q,r)=>relief(q,r).hill,(q,r)=>!wet(q,r)&&!isMountain(q,r));
    const isHill=(q,r)=>!wet(q,r)&&!isMountain(q,r)&&relief(q,r).hill>=hillCut;
    // The water-distance calculation includes neighbors OUTSIDE the preview.
    const searchRadius=Math.min(16,Math.max(3,Math.ceil(c["climate.coastalDecay"]*3)));
    const distances=new Map();
    function distanceToWater(q,r){
      const k=spot(q,r);if(distances.has(k))return distances.get(k);
      if(wet(q,r)){distances.set(k,0);return 0;}
      let found=searchRadius+1;
      search:for(let d=1;d<=searchRadius;d++){
        for(let a=-d;a<=d;a++){
          const minB=Math.max(-d,-a-d),maxB=Math.min(d,-a+d);
          for(let b=minB;b<=maxB;b++){
            if(Math.max(Math.abs(a),Math.abs(b),Math.abs(a+b))!==d)continue;
            if(wet(q+a,r+b)){found=d;break search;}
          }
        }
      }
      distances.set(k,found);return found;
    }
    const regions=new Map();
    function field(q,r){
      const k=spot(q,r);if(cacheField.has(k))return cacheField.get(k);
      const t=temperature(q,r),baseHumidity=humidity(q,r),
        distance=distanceToWater(q,r);
      const h=clamp(baseHumidity+c["climate.coastalHumidity"]*
        Math.exp(-distance/c["climate.coastalDecay"]));
      const center=region(s,q,r,c);
      if(!regions.has(center.id))regions.set(center.id,
        {t:temperature(center.x,center.y),h:humidity(center.x,center.y)});
      const avg=regions.get(center.id),mix=c["biomes.regionClimateMix"];
      const biomeT=clamp(avg.t*mix+t*(1-mix));
      const biomeH=clamp(avg.h*mix+h*(1-mix));
      const family=biomeFamily(biomeT,biomeH,c),
        soil=noise(s,q,r,c["geology.scale"],"soil"),
        landRelief=relief(q,r);
      const result={t,h,center,family,soil,landRelief,
        riverPotential:clamp(h*.68+landRelief.mass*.18+
          Math.min(distance,15)/30)};
      cacheField.set(k,result);return result;
    }
    function surface(q,r){
      if(!wet(q,r))return "land";
      if(DIRS.some(([dq,dr])=>!wet(q+dq,r+dr)))return "coastal_water";
      if(temperature(q,r)<c["water.iceTemperature"])return "icy_ocean";
      // This is a permanent OCEAN TERRAIN, not a dynamic weather event.
      return noise(s,q,r,c["water.scale"]*.8,"storm")>
        1-c["water.stormChance"]?"stormy_ocean":"ocean";
    }
    const cells=[],byKey=new Map();
    for(let r=originR;r<originR+height;r++)
      for(let q=originQ;q<originQ+width;q++){
        const surfaceClass=surface(q,r),land=surfaceClass==="land",
          info=land?field(q,r):null;
        const mountain=land&&isMountain(q,r),hills=land&&!mountain&&isHill(q,r);
        const suit=!land?0:info.family==="jungle"?1:
          info.family==="grassland"?.86:info.family==="wetland"?.76:
          info.family==="savanna"?.46:info.family==="cold"?.25:.08;
        const value=land?(noise(s,q,r,c["forest.patchScale"],"forest")-.5)*1.6+
          c["forest.coverage"]-.3+(info.h-.5)*.35:0;
        const forestDensity=mountain?0:info?.family==="jungle"?Math.max(.76,clamp(value)):clamp(value)*suit;
        const forestClass=mountain?"none":info?.family==="jungle"?"dense_forest":
          forestDensity>=c["forest.denseThreshold"]*c["forest.denseFactor"]?"dense_forest":
          forestDensity>c["forest.lightThreshold"]?"light_forest":"none";
        const cell={q,r,temperature:info?.t??temperature(q,r),
          humidity:info?.h??humidity(q,r),regionId:info?.center.id??"",
          baseBiome:info?.family??null,
          terrainId:land?terrainFrom(info.family,info.t,info.h,info.soil,c):surfaceClass,
          surfaceClass,reliefClass:mountain?"mountain":hills?"hills":"flat",
          hillProfile:hills?["rounded","steep","chain","plateau","ridge"][
            Math.floor(unit(s,Math.floor(q/3),Math.floor(r/3),"hill-style")*5)]:null,
          hillStrength:hills?clamp(info.landRelief.hill*c["relief.hillVariation"]+
            (1-c["relief.hillVariation"])*.4):0,
          mountainClass:mountain?"massif":null,
          forestDensity,forestClass,riverPotential:info?.riverPotential??0,
          river:false,riverEdges:[],features:[]};
        cells.push(cell);byKey.set(spot(q,r),cell);
      }
    // Route topology uses axial adjacency. The graphics renderer explicitly
    // builds a continuous path ALONG HEX SIDES/CORNERS from each route.
    const maxLength=c["rivers.maxLength"],minLength=c["rivers.minLength"];
    const halo=maxLength+1,extent=2*maxLength+2;
    const distanceGrid=new Map(),queue=[];
    for(let r=originR-extent;r<originR+height+extent;r++)
      for(let q=originQ-extent;q<originQ+width+extent;q++)
        if(wet(q,r)){distanceGrid.set(spot(q,r),0);queue.push({q,r});}
    const minQ=originQ-extent,maxQ=originQ+width+extent-1,
      minR=originR-extent,maxR=originR+height+extent-1;
    for(let i=0;i<queue.length;i++){
      const n=queue[i],d=distanceGrid.get(spot(n.q,n.r));
      if(d>=maxLength)continue;
      for(const [dq,dr] of DIRS){
        const q=n.q+dq,r=n.r+dr,k=spot(q,r);
        if(q<minQ||q>maxQ||r<minR||r>maxR||isMountain(q,r))continue;
        if(!distanceGrid.has(k)){distanceGrid.set(k,d+1);queue.push({q,r});}
      }
    }
    const riverPaths=[],countedRoutes=[];
    function markEdge(a,b){
      for(const [p,o] of [[a,b],[b,a]]){
        const cell=byKey.get(spot(p.q,p.r));
        if(!cell||cell.surfaceClass!=="land")continue;
        cell.river=true;
        const index=DIRS.findIndex(([dq,dr])=>p.q+dq===o.q&&p.r+dr===o.r);
        if(index>=0&&!cell.riverEdges.includes(index))cell.riverEdges.push(index);
      }
    }
    for(let r=originR-halo;r<originR+height+halo;r++)
      for(let q=originQ-halo;q<originQ+width+halo;q++){
        if(wet(q,r)||isMountain(q,r))continue;
        if(unit(s,q,r,"river-source")>=c["rivers.sourcesPer100"]/100)continue;
        const distance=distanceGrid.get(spot(q,r));
        if(distance===undefined||distance<minLength||field(q,r).riverPotential<.36)continue;
        const route=[{q,r}];let current={q,r};
        for(let n=0;n<maxLength;n++){
          const d=distanceGrid.get(spot(current.q,current.r));
          if(d===0)break;
          const eligible=DIRS.map(([dq,dr])=>
            ({q:current.q+dq,r:current.r+dr}))
            .filter(p=>distanceGrid.get(spot(p.q,p.r))===d-1);
          if(!eligible.length)break;
          const score=p=>relief(p.q,p.r).hill*(1-c["rivers.meander"])+
            unit(s,p.q,p.r,"river-turn")*c["rivers.meander"];
          eligible.sort((a,b)=>score(a)-score(b));
          current=eligible[0];route.push(current);
        }
        if(!wet(current.q,current.r)||route.length-1<minLength)continue;
        if(!route.some(p=>byKey.has(spot(p.q,p.r))))continue;
        countedRoutes.push(route);
        // Existing edge renderer needs source-to-real-water paths wholly
        // inside its small test scene; partial segments remain as riverEdges.
        if(route.every(p=>byKey.has(spot(p.q,p.r))))
          riverPaths.push(route.map(p=>[p.q,p.r]));
        for(let n=1;n<route.length;n++)markEdge(route[n-1],route[n]);
      }
    // Habitat-first animals: the adjustable count refers to ALL animal types.
    for(const x of cells){
      const chance=(name,per1000)=>unit(s,x.q,x.r,"feature:"+name)<per1000/1000;
      if(x.surfaceClass==="land"&&x.reliefClass!=="mountain"){
        if(chance("iron",c["features.ironPer1000"])&&
          field(x.q,x.r).landRelief.mountain>.30)x.features.push("iron");
        if(["grassland","savanna","wetland","jungle"].includes(x.baseBiome)&&
          chance("animals",c["features.animalsPer1000"])){
          if(x.baseBiome==="wetland"||x.baseBiome==="jungle")x.features.push("pigs");
          else if(x.baseBiome==="savanna"||x.terrainId==="sparse_pasture")
            x.features.push("horses");
          else x.features.push(unit(s,x.q,x.r,"species")>.5?"pigs":"horses");
        }
        if(chance("ruins",c["features.ruinsPer1000"]))x.features.push("ruins");
        if(chance("obelisk",c["features.obelisksPer1000"]))x.features.push("obelisk");
        if(x.baseBiome==="arid"&&chance("oasis",c["features.oasesPer1000"]))
          x.features.push("oasis");
      }else if(x.surfaceClass!=="land"&&chance("wreck",c["features.wrecksPer1000"]))
        x.features.push("wreck");
      for(const ext of extraFeatures)
        if(ext.place({hex:x,config:c,seed,random:salt=>
          unit(s,x.q,x.r,ext.id+":"+salt)}))x.features.push(ext.id);
      x.riverEdges.sort((a,b)=>a-b);
    }
    const totalLand=cells.filter(x=>x.surfaceClass==="land").length;
    const stats={total:cells.length,land:totalLand,water:cells.length-totalLand,
      coast:0,hills:0,mountains:0,rivers:riverPaths.length,
      riverCrossingCount:countedRoutes.length,riverHexes:0,forest:0,
      forestEligible:0,forestPercentLand:0,forestPercentEligible:0,
      biomes:{},terrains:{},features:{}},cores=new Map();
    for(const x of cells){
      if(x.surfaceClass==="coastal_water")stats.coast++;
      if(x.reliefClass==="hills")stats.hills++;
      if(x.reliefClass==="mountain")stats.mountains++;
      if(x.river)stats.riverHexes++;
      if(x.forestClass!=="none")stats.forest++;
      if(x.baseBiome){
        stats.biomes[x.baseBiome]=(stats.biomes[x.baseBiome]||0)+1;
        cores.set(x.regionId,(cores.get(x.regionId)||0)+1);
      }
      if(x.surfaceClass==="land"&&x.reliefClass!=="mountain"&&
        ["grassland","savanna","jungle","wetland","cold"].includes(x.baseBiome))
        stats.forestEligible++;
      stats.terrains[x.terrainId]=(stats.terrains[x.terrainId]||0)+1;
      for(const f of x.features)stats.features[f]=(stats.features[f]||0)+1;
    }
    stats.forestPercentLand=totalLand?+(100*stats.forest/totalLand).toFixed(1):0;
    stats.forestPercentEligible=stats.forestEligible?
      +(100*stats.forest/stats.forestEligible).toFixed(1):0;
    const sizes=[...cores.values()].sort((a,b)=>a-b);
    stats.biomeRegions={count:sizes.length,min:sizes[0]||0,
      average:sizes.length?+(totalLand/sizes.length).toFixed(1):0,
      median:sizes.length?sizes[Math.floor(sizes.length/2)]:0,
      max:sizes.at(-1)||0,within30to90:sizes.filter(n=>n>=30&&n<=90).length};
    function largestComponent(predicate){
      const visited=new Set();let maximum=0;
      for(const x of cells){
        const k=spot(x.q,x.r);if(visited.has(k)||!predicate(x))continue;
        const queue=[x];visited.add(k);
        for(let i=0;i<queue.length;i++)
          for(const n of neighbours(queue[i],byKey)){
            const id=spot(n.q,n.r);
            if(predicate(n)&&!visited.has(id)){visited.add(id);queue.push(n);}
          }
        maximum=Math.max(maximum,queue.length);
      }
      return maximum;
    }
    stats.connectedLandPercent=totalLand?
      +(100*largestComponent(x=>x.surfaceClass==="land")/totalLand).toFixed(1):0;
    stats.largestWaterBody=largestComponent(x=>x.surfaceClass!=="land");
    return {version:VERSION,seed,width,height,originQ,originR,config:c,
      cells,riverPaths,stats,riverGeometry:"hex-edges"};
  }
  const api={VERSION,DIRS,parameterSchema,defaultConfig,normalizeConfig,
    registerParameter,registerFeature,generateWorld,getWorldCell:(world,q,r)=>{
      const oq=world.originQ??0,or=world.originR??0;
      if(q<oq||r<or||q>=oq+world.width||r>=or+world.height)return null;
      return world.cells[(r-or)*world.width+(q-oq)]??null;
    }};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.VedrasGeography=api;
})(typeof window!=="undefined"?window:globalThis);
