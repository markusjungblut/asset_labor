/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var ao=Object.create;var nn=Object.defineProperty;var lo=Object.getOwnPropertyDescriptor;var co=Object.getOwnPropertyNames;var uo=Object.getPrototypeOf,fo=Object.prototype.hasOwnProperty;var ho=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var mo=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of co(e))!fo.call(t,i)&&i!==r&&nn(t,i,{get:()=>e[i],enumerable:!(o=lo(e,i))||o.enumerable});return t};var Tr=(t,e,r)=>(r=t!=null?ao(uo(t)):{},mo(e||!t||!t.__esModule?nn(r,"default",{value:t,enumerable:!0}):r,t));var Kt=ho((oi,$t)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],i=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),a=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],c=[],l=(S,F=0,w=1)=>Math.min(w,Math.max(F,S)),s=(S,F)=>S+","+F;function d(S){let F=2166136261;for(let w=0;w<S.length;w++)F^=S.charCodeAt(w),F=Math.imul(F,16777619);return F>>>0}let f=Object.create(null);function h(S){let F=typeof S=="string"?S:String(S),w=f[F];return w===void 0&&(w=d(F),f[F]=w),w}function p(S,F,w,R){let u=S^Math.imul(F+32767,374761393)^Math.imul(w+65521,668265263)^R;return u=Math.imul(u^u>>>15,2246822519),u=Math.imul(u^u>>>13,3266489917),(u^u>>>16)>>>0}function v(S,F,w,R){return p(S,F,w,h(R))}let y=(S,F,w,R)=>p(S,F,w,h(R))/4294967296,_=S=>S*S*(3-2*S);function U(S,F,w){let R=F.reduce((m,[,b])=>m+w[b],0);if(R<=0)return F[0][0];let u=l(S,0,.999999999)*R;for(let[m,b]of F)if(u-=w[b],u<0)return m;return F[F.length-1][0]}let G=(S,F,w)=>S+(F-S)*w;function T(S,F,w,R,u){let m=F/R,b=w/R,E=Math.floor(m),C=Math.floor(b),D=_(m-E),H=_(b-C),z=h(u),ne=1/4294967296,J=p(S,E,C,z)*ne,ee=p(S,E+1,C,z)*ne,ae=p(S,E,C+1,z)*ne,fe=p(S,E+1,C+1,z)*ne;return G(G(J,ee,D),G(ae,fe,D),H)}function W(){return a.map(([S,F,w,R,u,m,b,E])=>({group:S,id:F,label:w,defaultValue:R,min:u,max:m,step:b,help:E}))}function V(){return Object.fromEntries(a.map(S=>[S[1],S[3]]))}function g(S){if(S!==void 0&&(typeof S!="object"||S===null||Array.isArray(S)))throw Error("Ung\xFCltige Parameterdatei.");let F=V();for(let[,w,,R,u,m]of a){if(S?.[w]===void 0)continue;let b=Number(S[w]);if(!Number.isFinite(b)||b<u||b>m)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+w);F[w]=b}if(F["relief.mountainFraction"]+F["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return F}function M(S){if(!Array.isArray(S)||!S.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let F=S.map(R=>R?.stats??R);if(F.some(R=>!R||!Number.isFinite(R.total)||R.total<=0||!Number.isFinite(R.land)||R.land<0||R.land>R.total||!R.biomes||!R.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function w(R,u,m){let b=[...new Set([...R,...F.flatMap(C=>Object.keys(C[u]))])],E=F.reduce((C,D)=>C+D[m],0);return Object.fromEntries(b.map(C=>{let D=F.map(z=>z[u][C]||0),H=D.reduce((z,ne)=>z+ne,0);return[C,{total:H,mean:H/F.length,percent:E?100*H/E:0,worldsPresent:D.filter(z=>z>0).length}]}))}return{generatorVersion:e,samples:F.length,meanHexes:F.reduce((R,u)=>R+u.total,0)/F.length,meanLand:F.reduce((R,u)=>R+u.land,0)/F.length,biomes:w(n,"biomes","land"),terrains:w(i,"terrains","total")}}function x(S){if(!S||typeof S.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(S.id)||a.some(F=>F[1]===S.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let F of["defaultValue","min","max","step"])if(!Number.isFinite(S[F]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+F);if(S.min>S.defaultValue||S.defaultValue>S.max||S.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");a.push([String(S.group||"Erweiterungen"),S.id,String(S.label||S.id),S.defaultValue,S.min,S.max,S.step,String(S.help||"")])}function A(S){if(!S||!/^extension\.[a-z0-9_.]+$/.test(S.id)||typeof S.place!="function"||c.some(F=>F.id===S.id))throw Error("Ung\xFCltige Feature-Erweiterung.");c.push(S)}function I(S,F){return o.map(([w,R])=>F.get(s(S.q+w,S.r+R))).filter(Boolean)}function L(S,F,w,R,u,m=null,b=null){if(S==="arid"){if(w>u["biomes.dryThreshold"]-u["biomes.semiDesertMargin"])return"semi_desert";let E=G(R,b===null?R:b,u["geology.aridPatchMix"]),C=l(E+(u["geology.sandBias"]-.5)*.36);return U(C,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],u)}return S==="grassland"?w<u["geology.grassSparseHumidity"]?"sparse_pasture":R<u["geology.pastureSoil"]?"pasture":"grassland":S==="cold"?m&&m.hill>u["geology.highlandSoil"]&&F>=u["biomes.coldBoundary"]-u["geology.highlandColdMargin"]?"highland":F<u["biomes.coldBoundary"]-.04?w>u["biomes.snowHumidity"]?"snowfields":"frozen_tundra":F<u["biomes.coldBoundary"]&&w>.8?"snowfields":"tundra":S==="wetland"?F>u["geology.swampWarmBoundary"]?"swamp":F<.38?"moor":w>.85?"marshland":R>u["geology.wetlandSoil"]?"moor":"marshland":S==="jungle"?"jungle":S==="savanna"?w<.33?"semi_desert":"savanna":"grassland"}function B(S,F,w){return S<w["biomes.coldBoundary"]?"cold":F>w["biomes.wetThreshold"]?S>w["biomes.jungleWarmBoundary"]?"jungle":"wetland":F<w["biomes.dryThreshold"]&&S>w["biomes.aridWarmBoundary"]?"arid":S>w["biomes.warmBoundary"]?"savanna":F>w["biomes.wetlandBoundary"]?"wetland":"grassland"}function N(S,F,w,R){let u=Math.sqrt(R["biomes.targetHexes"]),m=R["biomes.borderWarp"]*u,b=F+m*(T(S,F,w,u*.72,"warp-a")-.5)*2,E=w+m*(T(S,F,w,u*.72,"warp-b")-.5)*2,C=Math.floor(b/u),D=Math.floor(E/u),H=1/0,z=null;for(let ne=-1;ne<=1;ne++)for(let J=-1;J<=1;J++){let ee=C+J,ae=D+ne,fe=(ee+.5+(y(S,ee,ae,"jit-q")-.5)*.72)*u,Ee=(ae+.5+(y(S,ee,ae,"jit-r")-.5)*.72)*u,_e=(b-fe)*(b-fe)+(E-Ee)*(E-Ee);_e<H&&(H=_e,z={id:s(ee,ae),x:fe,y:Ee})}return z}let K=(S,F)=>Math.max(Math.abs(S.q-F.q),Math.abs(S.r-F.r),Math.abs(S.q+S.r-F.q-F.r));function $(S,F,w,R,u=()=>!0){if(w<=0)return 1/0;let m=[];for(let b=0;b<1900;b++){let E=Math.floor((y(S,b,0,"sampleQ:"+F)-.5)*6900),C=Math.floor((y(S,b,1,"sampleR:"+F)-.5)*6900);u(E,C)&&m.push(R(E,C))}return m.length?(m.sort((b,E)=>E-b),m[Math.min(m.length-1,Math.floor(l(w)*m.length))]):1/0}function ie(S,F){if(typeof S!="string"||S.length<1||S.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let w=g(F),R=d(r+":"+S),u={...w,"biomes.targetHexes":Math.max(5,w["geology.scale"]*1.5)},m=new Map,b=new Map,E=new Map,C=(k,q)=>s(k,q),D=(k,q)=>l(w["climate.temperature"]+(T(R,k,q,w["climate.scale"],"temp")-.5)*2*w["climate.tempVariation"]),H=(k,q)=>l(w["climate.humidity"]+(T(R,k,q,w["climate.scale"]*.9,"wet")-.5)*2*w["climate.humidityVariation"]);function z(k,q){let j=T(R,k,q,w["water.scale"],"sea"),he=T(R,k,q,Math.max(3,w["water.scale"]*.45),"sea-mid"),P=T(R,k,q,Math.max(2,w["water.scale"]*.21),"shore"),O=.2+.3*w["water.coastDetail"];return(j+he)*.5*(1-O)+P*O}function ne(k,q){let j=T(R,k,q,4.2,"lakes");return z(k,q)-Math.max(0,j-.68)*w["water.lakeInfluence"]}let J=$(R,"water",w["water.fraction"],(k,q)=>-z(k,q));function ee(k,q){let j=C(k,q);if(m.has(j))return m.get(j);let he=-ne(k,q)>=J;return m.set(j,he),he}function ae(k,q){let j=C(k,q);if(b.has(j))return b.get(j);let he=T(R,k,q,w["relief.scale"],"relief"),P=Math.max(6,w["relief.chainLength"]),O=k+(T(R,k,q,P*.58,"m-warp-q")-.5)*11,te=q+(T(R,k,q,P*.58,"m-warp-r")-.5)*11,X=1-Math.abs(T(R,O*.56+te*.36,te*1.18,P,"ridge")-.5)*2,pe=1-Math.abs(T(R,O*.34-te*.74,O*1.08,P*1.25,"ridge-b")-.5)*2,le=Math.max(X,pe*.86),se=Math.pow(le,3.6),xe=1-Math.abs(T(R,k*.92+q*.28,q*.96,7.5,"m-pass-a")-.5)*2,He=1-Math.abs(T(R,k*.28-q*.92,k*.96,8.2,"m-pass-b")-.5)*2,Ce=Math.max(xe,He),Xe=Ce>.82?Math.pow((Ce-.82)/.18,.7)*.62:0,Ze=.92-.14*l(w["relief.chainWidth"],.05,.95),Qe=l(se*Ze+he*(1-Ze)-Xe,0,1),ot=l(le*.65+he*.35,0,1),pt={mass:he,mountain:Qe,oreBelt:ot,hill:he*.75+T(R,k,q,w["relief.scale"]*.46,"hills")*.25};return b.set(j,pt),pt}let fe=$(R,"mountain",w["relief.mountainFraction"],(k,q)=>ae(k,q).mountain,(k,q)=>!ee(k,q)),Ee=(k,q)=>!ee(k,q)&&ae(k,q).mountain>=fe,_e=new Map,ve=(k,q)=>{let j=C(k,q);if(_e.has(j))return _e.get(j);if(!Ee(k,q))return _e.set(j,!1),!1;let he=!1;for(let P=-2;P<=2&&!he;P++){let O=Math.max(-2,-P-2),te=Math.min(2,-P+2);for(let X=O;X<=te;X++)if(!(P===0&&X===0)&&!Ee(k+P,q+X)){he=!0;break}}return _e.set(j,he),he},ye=$(R,"hills",w["relief.hillFraction"],(k,q)=>ae(k,q).hill,(k,q)=>!ee(k,q)&&!ve(k,q)),ge=(k,q)=>!ee(k,q)&&!ve(k,q)&&ae(k,q).hill>=ye,We=Math.min(16,Math.max(3,Math.ceil(w["climate.coastalDecay"]*3))),Te=new Map;function De(k,q){let j=C(k,q);if(Te.has(j))return Te.get(j);if(ee(k,q))return Te.set(j,0),0;let he=We+1;e:for(let P=1;P<=We;P++)for(let O=-P;O<=P;O++){let te=Math.max(-P,-O-P),X=Math.min(P,-O+P);for(let pe=te;pe<=X;pe++)if(Math.max(Math.abs(O),Math.abs(pe),Math.abs(O+pe))===P&&ee(k+O,q+pe)){he=P;break e}}return Te.set(j,he),he}let Oe=new Map;function Ne(k,q){let j=C(k,q);if(E.has(j))return E.get(j);let he=D(k,q),P=H(k,q),O=De(k,q),te=l(P+w["climate.coastalHumidity"]*Math.exp(-O/w["climate.coastalDecay"])),X=N(R,k,q,w);Oe.has(X.id)||Oe.set(X.id,{t:D(X.x,X.y),h:H(X.x,X.y)});let pe=Oe.get(X.id),le=w["biomes.regionClimateMix"],se=l(pe.t*le+he*(1-le)),xe=l(pe.h*le+te*(1-le)),He=B(se,xe,w),Ce=T(R,k,q,w["geology.scale"],"soil"),Xe=ae(k,q),Ze=(He==="arid"&&w["geology.aridPatchMix"]>0?N(R,k,q,u):null)?.id.split(",").map(Number),Qe=Ze?y(R,Ze[0],Ze[1],"arid-patch"):null,ot={t:he,h:te,center:X,family:He,soil:Ce,landRelief:Xe,aridPatch:Qe,riverPotential:l(te*.68+Xe.mass*.18+Math.min(O,15)/30)};return E.set(j,ot),ot}function Ie(k,q){return ee(k,q)?o.some(([j,he])=>!ee(k+j,q+he))?"coastal_water":D(k,q)<w["water.iceTemperature"]?"icy_ocean":T(R,k,q,w["water.scale"]*.8,"storm")>1-w["water.stormChance"]?"stormy_ocean":"ocean":"land"}function qe(k){let q=(j,he)=>y(R,k.q,k.r,"feature:"+j)<he/1e3;k.surfaceClass==="land"&&k.reliefClass!=="mountain"?(q("iron",w["features.ironPer1000"])&&Ne(k.q,k.r).landRelief.oreBelt>.3&&k.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(k.baseBiome)&&q("animals",w["features.animalsPer1000"])&&(k.baseBiome==="wetland"||k.baseBiome==="jungle"?k.features.push("pigs"):k.baseBiome==="savanna"||k.terrainId==="sparse_pasture"?k.features.push("horses"):k.features.push(y(R,k.q,k.r,"species")>.5?"pigs":"horses")),q("ruins",w["features.ruinsPer1000"])&&k.features.push("ruins"),q("obelisk",w["features.obelisksPer1000"])&&k.features.push("obelisk"),k.baseBiome==="arid"&&q("oasis",w["features.oasesPer1000"])&&k.features.push("oasis")):k.surfaceClass!=="land"&&q("wreck",w["features.wrecksPer1000"])&&k.features.push("wreck");for(let j of c)j.place({hex:k,config:w,seed:S,random:he=>y(R,k.q,k.r,j.id+":"+he)})&&k.features.push(j.id);return k}function Be(k,q){let j=Ie(k,q),he=j==="land",P=he?Ne(k,q):null,O=he&&ve(k,q),te=he&&!O&&ge(k,q),X=he?P.family==="jungle"?1:P.family==="grassland"?.86:P.family==="wetland"?.76:P.family==="savanna"?.46:P.family==="cold"?.25:.08:0,pe=he?(T(R,k,q,w["forest.patchScale"],"forest")-.5)*1.6+w["forest.coverage"]-.3+(P.h-.5)*.35:0,le=O?0:P?.family==="jungle"?Math.max(.76,l(pe)):l(pe)*X,se=O?"none":P?.family==="jungle"||le>=w["forest.denseThreshold"]*w["forest.denseFactor"]?"dense_forest":le>w["forest.lightThreshold"]?"light_forest":"none";return{q:k,r:q,temperature:P?.t??D(k,q),humidity:P?.h??H(k,q),regionId:P?.center.id??"",baseBiome:P?.family??null,terrainId:he?L(P.family,P.t,P.h,P.soil,w,P.landRelief,P.aridPatch):j,surfaceClass:j,reliefClass:O?"mountain":te?"hills":"flat",hillProfile:te?["rounded","steep","chain","plateau","ridge"][Math.floor(y(R,Math.floor(k/3),Math.floor(q/3),"hill-style")*5)]:null,hillStrength:te?l(P.landRelief.hill*w["relief.hillVariation"]+(1-w["relief.hillVariation"])*.4):0,mountainClass:O?"massif":null,forestDensity:le,forestClass:se,riverPotential:P?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function Ke(k,q,j,he){let P=w["rivers.maxLength"],O=w["rivers.minLength"],te=P+1,X=2*P+2,pe=(re,ue)=>re>=k&&re<k+j&&ue>=q&&ue<q+he,le=k-X,se=q-X,xe=j+2*X,He=he+2*X,Ce=new Int16Array(xe*He);Ce.fill(-1);let Xe=new Int32Array(xe*He),ct=new Int32Array(xe*He),Ze=0,Qe=0;for(let re=0;re<He;re++){let ue=se+re,be=re*xe;for(let me=0;me<xe;me++){let Me=le+me;ee(Me,ue)&&(Ce[be+me]=0,Xe[Qe]=Me,ct[Qe]=ue,Qe++)}}for(;Ze<Qe;){let re=Xe[Ze],ue=ct[Ze];Ze++;let be=Ce[(ue-se)*xe+(re-le)];if(be>=P)continue;let me=be+1;for(let Me=0;Me<6;Me++){let de=re+o[Me][0],Fe=ue+o[Me][1],ke=de-le,Ye=Fe-se;if(ke<0||ke>=xe||Ye<0||Ye>=He)continue;let Ve=Ye*xe+ke;Ce[Ve]>=0||ve(de,Fe)||(Ce[Ve]=me,Xe[Qe]=de,ct[Qe]=Fe,Qe++)}}let ot=[],pt=new Map,Mr=w["rivers.sourcesPer100"]/100,Rr=h("river-source"),Q=h("river-turn"),oe=1/4294967296;function we(re,ue){for(let[be,me]of[[re,ue],[ue,re]]){if(!pe(be.q,be.r)||ee(be.q,be.r))continue;let Me=o.findIndex(([ke,Ye])=>be.q+ke===me.q&&be.r+Ye===me.r);if(Me<0)continue;let de=C(be.q,be.r),Fe=pt.get(de);Fe||(Fe=[],pt.set(de,Fe)),Fe.includes(Me)||Fe.push(Me)}}for(let re=q-te;re<q+he+te;re++)for(let ue=k-te;ue<k+j+te;ue++){if(p(R,ue,re,Rr)*oe>=Mr||Ce[(re-se)*xe+(ue-le)]<O||ee(ue,re)||ve(ue,re)||Ne(ue,re).riverPotential<.36)continue;let me=[{q:ue,r:re}],Me={q:ue,r:re};for(let de=0;de<P;de++){let Fe=Ce[(Me.r-se)*xe+(Me.q-le)];if(Fe<=0)break;let ke=null,Ye=1/0;for(let Ve=0;Ve<6;Ve++){let _t=Me.q+o[Ve][0],je=Me.r+o[Ve][1],yt=_t-le,bt=je-se;if(yt<0||yt>=xe||bt<0||bt>=He||Ce[bt*xe+yt]!==Fe-1)continue;let it=ae(_t,je).hill*(1-w["rivers.meander"])+p(R,_t,je,Q)*oe*w["rivers.meander"];it<Ye&&(Ye=it,ke={q:_t,r:je})}if(!ke)break;Me=ke,me.push(Me)}if(!(!ee(Me.q,Me.r)||me.length-1<O)&&me.some(de=>pe(de.q,de.r))){ot.push(me.map(de=>[de.q,de.r]));for(let de=1;de<me.length;de++)we(me[de-1],me[de])}}for(let re of pt.values())re.sort((ue,be)=>ue-be);return{routes:ot,edgesByKey:pt}}function Ge(k,q){return qe(Be(k,q))}return{c:w,s:R,spot:C,wet:ee,relief:ae,isMountain:ve,isHill:ge,field:Ne,surface:Ie,buildBaseCell:Be,attachFeatures:qe,sampleCell:Ge,traceRivers:Ke}}function ce(S,F={}){if(typeof S!="string"||S.length<1||S.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let w=F.width===void 0?100:Number(F.width),R=F.height===void 0?80:Number(F.height),u=F.originQ===void 0?0:Number(F.originQ),m=F.originR===void 0?0:Number(F.originR);if(!Number.isSafeInteger(w)||!Number.isSafeInteger(R)||w<10||R<10||w*R>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(u)||!Number.isSafeInteger(m)||Math.abs(u)>1e6||Math.abs(m)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let b=ie(S,F.config),{c:E,s:C,spot:D,wet:H,relief:z,isMountain:ne,field:J,buildBaseCell:ee,attachFeatures:ae}=b,fe=[],Ee=new Map;for(let P=m;P<m+R;P++)for(let O=u;O<u+w;O++){let te=ee(O,P);fe.push(te),Ee.set(D(O,P),te)}let _e=E["rivers.maxLength"],ve=E["rivers.minLength"],ye=_e+1,ge=2*_e+2,We=new Map,Te=[];for(let P=m-ge;P<m+R+ge;P++)for(let O=u-ge;O<u+w+ge;O++)H(O,P)&&(We.set(D(O,P),0),Te.push({q:O,r:P}));let De=u-ge,Oe=u+w+ge-1,Ne=m-ge,Ie=m+R+ge-1;for(let P=0;P<Te.length;P++){let O=Te[P],te=We.get(D(O.q,O.r));if(!(te>=_e))for(let[X,pe]of o){let le=O.q+X,se=O.r+pe,xe=D(le,se);le<De||le>Oe||se<Ne||se>Ie||ne(le,se)||We.has(xe)||(We.set(xe,te+1),Te.push({q:le,r:se}))}}let qe=[],Be=[];function Ke(P,O){for(let[te,X]of[[P,O],[O,P]]){let pe=Ee.get(D(te.q,te.r));if(!pe||pe.surfaceClass!=="land")continue;pe.river=!0;let le=o.findIndex(([se,xe])=>te.q+se===X.q&&te.r+xe===X.r);le>=0&&!pe.riverEdges.includes(le)&&pe.riverEdges.push(le)}}for(let P=m-ye;P<m+R+ye;P++)for(let O=u-ye;O<u+w+ye;O++){if(H(O,P)||ne(O,P)||y(C,O,P,"river-source")>=E["rivers.sourcesPer100"]/100)continue;let te=We.get(D(O,P));if(te===void 0||te<ve||J(O,P).riverPotential<.36)continue;let X=[{q:O,r:P}],pe={q:O,r:P};for(let le=0;le<_e;le++){let se=We.get(D(pe.q,pe.r));if(se===0)break;let xe=o.map(([Ce,Xe])=>({q:pe.q+Ce,r:pe.r+Xe})).filter(Ce=>We.get(D(Ce.q,Ce.r))===se-1);if(!xe.length)break;let He=Ce=>z(Ce.q,Ce.r).hill*(1-E["rivers.meander"])+y(C,Ce.q,Ce.r,"river-turn")*E["rivers.meander"];xe.sort((Ce,Xe)=>He(Ce)-He(Xe)),pe=xe[0],X.push(pe)}if(!(!H(pe.q,pe.r)||X.length-1<ve)&&X.some(le=>Ee.has(D(le.q,le.r)))){Be.push(X),X.every(le=>Ee.has(D(le.q,le.r)))&&qe.push(X.map(le=>[le.q,le.r]));for(let le=1;le<X.length;le++)Ke(X[le-1],X[le])}}for(let P of fe)ae(P),P.riverEdges.sort((O,te)=>O-te);let Ge=fe.filter(P=>P.surfaceClass==="land").length,k={total:fe.length,land:Ge,water:fe.length-Ge,coast:0,hills:0,mountains:0,rivers:qe.length,riverCrossingCount:Be.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},q=new Map;for(let P of fe){P.surfaceClass==="coastal_water"&&k.coast++,P.reliefClass==="hills"&&k.hills++,P.reliefClass==="mountain"&&k.mountains++,P.river&&k.riverHexes++,P.forestClass!=="none"&&k.forest++,P.baseBiome&&(k.biomes[P.baseBiome]=(k.biomes[P.baseBiome]||0)+1,q.set(P.regionId,(q.get(P.regionId)||0)+1)),P.surfaceClass==="land"&&P.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(P.baseBiome)&&k.forestEligible++,k.terrains[P.terrainId]=(k.terrains[P.terrainId]||0)+1;for(let O of P.features)k.features[O]=(k.features[O]||0)+1}k.forestPercentLand=Ge?+(100*k.forest/Ge).toFixed(1):0,k.forestPercentEligible=k.forestEligible?+(100*k.forest/k.forestEligible).toFixed(1):0;let j=[...q.values()].sort((P,O)=>P-O);k.biomeRegions={count:j.length,min:j[0]||0,average:j.length?+(Ge/j.length).toFixed(1):0,median:j.length?j[Math.floor(j.length/2)]:0,max:j.at(-1)||0,within30to90:j.filter(P=>P>=30&&P<=90).length};function he(P){let O=new Set,te=0;for(let X of fe){let pe=D(X.q,X.r);if(O.has(pe)||!P(X))continue;let le=[X];O.add(pe);for(let se=0;se<le.length;se++)for(let xe of I(le[se],Ee)){let He=D(xe.q,xe.r);P(xe)&&!O.has(He)&&(O.add(He),le.push(xe))}te=Math.max(te,le.length)}return te}return k.connectedLandPercent=Ge?+(100*he(P=>P.surfaceClass==="land")/Ge).toFixed(1):0,k.largestWaterBody=he(P=>P.surfaceClass!=="land"),{version:e,seed:S,width:w,height:R,originQ:u,originR:m,config:E,cells:fe,riverPaths:qe,riverPreviewPaths:Be.map(P=>P.map(O=>[O.q,O.r])),stats:k,riverGeometry:"hex-edges"}}let Z={VERSION:e,DIRS:o,TERRAIN_IDS:i,BIOME_IDS:n,parameterSchema:W,defaultConfig:V,normalizeConfig:g,aggregateDistributions:M,registerParameter:x,registerFeature:A,createPointSampler:ie,generateWorld:ce,getWorldCell:(S,F,w)=>{let R=S.originQ??0,u=S.originR??0;return F<R||w<u||F>=R+S.width||w>=u+S.height?null:S.cells[(w-u)*S.width+(F-R)]??null}};typeof $t<"u"&&$t.exports&&($t.exports=Z),t.VedrasGeography=Z})(typeof window<"u"?window:globalThis)});var no=Tr(Kt());var po=Math.sqrt(3),Je=256/po,ze=.85,$e=1.5*Je,on=$e*ze,Se=16,Re=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function Pe(t,e){return{x:256*(t+e*.5),y:on*e}}function et(t,e){let r=e/on,o=t/256-r*.5,i=-o-r,n=Math.round(o),a=Math.round(r),c=Math.round(i),l=Math.abs(n-o),s=Math.abs(a-r),d=Math.abs(c-i);return l>s&&l>d?n=-a-c:s>d&&(a=-n-c),{q:n===0?0:n,r:a===0?0:a}}function tt(t,e,r,o){let i=t-r,n=e-o;return(Math.abs(i)+Math.abs(i+n)+Math.abs(n))/2}function Pt(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function At(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function kt(t,e,r=Se){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function vt(t,e){return`${t},${e}`}function Ae(t,e){return`${t},${e}`}function Pr(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,i=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,a=-1/0,c=1/0,l=-1/0;for(let s of i){let d=et(s.x,s.y);d.q<n&&(n=d.q),d.q>a&&(a=d.q),d.r<c&&(c=d.r),d.r>l&&(l=d.r)}return{minQ:n-e,maxQ:a+e,minR:c-e,maxR:l+e}}function sn(t,e=Se,r=3){let o=Pr(t,r),i=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),a=Math.floor(o.minR/e),c=Math.floor(o.maxR/e),l=et(t.x,t.y),s=l.q/e,d=l.r/e,f=[];for(let h=a;h<=c;h++)for(let p=i;p<=n;p++){let v=p+.5-s,y=h+.5-d;f.push({cq:p,cr:h,dist2:v*v+y*y})}return f.sort((h,p)=>h.dist2-p.dist2),f.map(({cq:h,cr:p})=>({cq:h,cr:p}))}function an(t,e,r,o=0){let i=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return i=Math.imul(i^i>>>15,2246822519)>>>0,i=Math.imul(i^i>>>13,3266489917)>>>0,(i^i>>>16)>>>0}function Ar(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function Zt(t,e){let r=256*(t+e*.5),o=$e*e,i=[];for(let n=0;n<6;n++){let a=-Math.PI/2+n*Math.PI/3;i.push({x:r+Je*Math.cos(a),y:(o+Je*Math.sin(a))*ze})}return i}function st(t,e,r){let o=Zt(t,e),i=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a:i,b:n,mid:{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}}function ut(t,e,r,o){let i=r-t,n=o-e;for(let a=0;a<6;a++)if(Re[a][0]===i&&Re[a][1]===n)return a;return-1}function Wt(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function ln(t,e){let r=et(t,e),o=0,i=1/0;for(let s=0;s<6;s++){let{mid:d}=st(r.q,r.r,s),f=t-d.x,h=e-d.y,p=f*f+h*h;p<i&&(i=p,o=s)}let[n,a]=Re[o],c=Wt(r.q,r.r,r.q+n,r.r+a),l=ut(c.q1,c.r1,c.q2,c.r2);return{q1:c.q1,r1:c.r1,q2:c.q2,r2:c.r2,dir:l}}var lt={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},Jt=new Set(["dead_trees","snow_dead_trees"]),Wr=new Set(["fallen_logs","snow_fallen_logs"]),go=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),bo=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),Qt=new Set(["snowfields","frozen_tundra","tundra","highland"]);var cn=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),un=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),Lt=new Set(["snowfields","frozen_tundra"]),Ft=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),Fr=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),dn=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),vo=new Set([...dn,"savanna","jungle"]);function at(t,e,r){return t<e?e:t>r?r:t}function Y(t,e,r,o=0,i=97,n=513,a=11){let c=(t|0)^Math.imul(e+i,374761393)^Math.imul(r+n,668265263)^Math.imul(o+a,2246822519);return c^=c>>>13,c=Math.imul(c,1274126177),((c^c>>>16)>>>0)/4294967296}function It(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function yo(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var Dt=new Set(["ocean","coastal_water","stormy_ocean"]);function xt(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function er(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function Lr(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function Ir(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function tr(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function rr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function Dr(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function fn(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:Fr.has(t)?.14:0}function qr(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*(It(t)?.32:.25):bo.has(t.family??"")?e:e*1.2}function nr(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"}function Ct(t){if(!t||t.kind==="mountain")return 1;let e=qr(t),r=t.family??"",o=qt(t)==="cacti"?1.55:1;return Jt.has(r)?.58*e:Wr.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function hn(t){return!!t&&t.kind==="tree"&&!Jt.has(t.family??"")}function mn(t){return!!t&&go.has(t.family??"")}function pn(t){let e=t?.family??"";return Jt.has(e)?"dead_trees":Wr.has(e)?"fallen_logs":null}function gn(t){let e=t?.family??"";return Jt.has(e)?.11:Wr.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function bn(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function vn(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function qt(t){let e=vn(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}function Bt(t){let e=String(t.id??""),r=vn(t);return xt(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?Dt:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||rr(t)?Fr:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?Qt:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?cn:yo(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?Qt:It(t)?cn:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?vo:/^(?:existing_)?berg_(?:1[4-6])$/.test(e)?new Set(["snowfields"]):/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?dn:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function yn(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,i=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),a=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),c=new Set;for(let[l,s]of Object.entries(e.terrain.byType))a.has(l)||(s.categoryId&&i.has(s.categoryId)||n.has(l))&&c.add(l);return c}function kr(t,e,r,o,i,n=!1){if(!e)return!1;let a=o.terrain.byType[e];if(xt(t))return Dt.has(e);if(a&&a.materialClass!=="ground")return!1;let l=i?i.ecoFamily:qt(t),s=e,d=i?i.strict:Bt(t);if(d)return d.has(s);let f=n||r.some(y=>{let _=o.terrain.byType[y]?.materialClass;return _==="water"||_==="shoreline"}),h=r.some(y=>y==="jungle"||y==="savanna"),p=r.some(y=>y==="moor"||y==="swamp"||y==="marshland");if(l==="mangroves")return(s==="swamp"||s==="marshland")&&(f||h);if(l==="palms")return s==="jungle"||s==="savanna"||s==="tropical_coast"||Ft.has(s);if(l==="jungle_trees"||l==="tropical_bushes")return s==="jungle";if(l==="savanna_trees")return s==="savanna"||s==="semi_desert"||Dr(t)&&Ft.has(s);if(l==="cacti")return s==="rocky_desert"||s==="sandy_desert"||s==="clay_desert"||s==="desert"||s==="semi_desert"||s==="sandy_rocky_desert"||s==="savanna";if(l==="succulents")return s==="savanna"||s==="semi_desert"||s==="rocky_desert"||s==="sandy_desert"||s==="sandy_rocky_desert"||s==="badlands"||s==="desert";if(l==="ferns")return s==="forest_floor"||s==="grassland"||s==="pasture"||s==="moor"||s==="swamp"||s==="marshland"||s==="jungle";if(l==="reeds")return s==="moor"||s==="swamp"||s==="marshland"||(s==="grassland"||s==="pasture"||s==="sparse_pasture")&&(f||p);if(l==="cold_bushes")return s==="tundra"||s==="frozen_tundra"||s==="highland";if(l==="snow_conifers"||l==="snow_dead_trees"||l==="snow_deadwood"||l==="snow_fallen_logs")return Qt.has(s);if(l==="riparian_trees")return s==="moor"||s==="swamp"||s==="marshland"||(s==="grassland"||s==="pasture")&&(f||p);let v=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(s==="snowfields"||s==="frozen_tundra")&&!v?!1:l==="dry_patches"?Fr.has(s):Lr(t)?!(s==="jungle"||s==="moor"||s==="swamp"||s==="marshland"||s==="snowfields"||s==="frozen_tundra"):l==="dry_bushes"?!(s==="jungle"||s==="moor"||s==="swamp"||s==="marshland"||s==="tundra"||s==="highland"):l==="herbs"?!(s==="jungle"||s==="swamp"||s==="marshland"||s==="ocean"||s==="snowfields"||s==="frozen_tundra"):l==="flowering_bushes"||l==="temperate_bushes"||l==="heath"?!(s==="jungle"||s==="rocky_desert"||s==="sandy_desert"||s==="clay_desert"):!0}function xn(t,e,r,o,i){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,a=r.biome||n;if(xt(t))return Dt.has(n)&&e.has(n);if(It(t)&&(n==="jungle"||a==="jungle"))return!1;let c=o.terrain.byType[n],l=o.terrain.byType[a];if(c?.materialClass!=="ground"||l?.materialClass!=="ground")return!1;let s=i?i.strict:Bt(t);if(s){if(!s.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let d=n==="jungle"||n==="savanna",f=r.forestClass==="light_forest"||r.forestClass==="dense_forest",h=i?i.ecoFamily:qt(t),p=a==="jungle",v=n==="moor"||n==="swamp"||n==="marshland";if(p&&!d||t.family==="palms"&&(!(d||Ft.has(n))||v||Qt.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!p||f&&(h==="cacti"||h==="succulents"||h==="dry_bushes")||!(e.has(a)||e.has(n)||f&&e.has("forest_floor")&&t.family!=="palms"))return!1;let _=!!r.hasRiverEdge;return s?kr(t,n,r.neighborTypes,o,i,_):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!kr(t,n,r.neighborTypes,o,i,_)?!1:kr(t,a,r.neighborTypes,o,i,_)}function wn(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let i=o.terrain.byType[r];if(!i||i.materialClass!=="ground")return!1;let n=Bt(t);return n&&!n.has(r)?!1:e.has(r)}function xo(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function wo(t,e,r){let o=e/3,i=r/3,n=Math.floor(o),a=Math.floor(i),c=o-n,l=i-a,s=c*c*(3-2*c),d=l*l*(3-2*l),f=Y(t,n,a,2301,8191,4093,17),h=Y(t,n+1,a,2301,8191,4093,17),p=Y(t,n,a+1,2301,8191,4093,17),v=Y(t,n+1,a+1,2301,8191,4093,17);return 2*((f+(h-f)*s)*(1-d)+(p+(v-p)*s)*d)-1}function _n(t,e,r,o){let i=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:lt.mode,a=at(o?.canopyCover??lt.canopyCover,.35,.98),c=at(o?.canopyVariation??lt.canopyVariation,0,.3),l=at(o?.gladeRate??lt.gladeRate,0,.3),s=at(o?.edgeStrength??lt.edgeStrength,0,1);for(let d of t){let f=Ae(d.q,d.r),h=d.terrainId==="jungle",p=xo(d.terrainId,e),v=h?"dense_forest":d.forestClass??(d.forestDensity>=.65?"dense_forest":d.forestDensity>.08?"light_forest":"none"),y=at(d.forestDensity||0,0,1),_=v==="none"?0:y>.01?y:v==="dense_forest"?1:.44;i.set(f,{q:d.q,r:d.r,key:f,baseBiome:d.terrainId,biome:h?"jungle":d.terrainId,jungle:h,suitability:p,forestMode:n,forestClass:p>0?v:"none",baseDensity:p>0?_:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let d of i.values()){if(!d.suitability)continue;let f=0;for(let[h,p]of Re){let v=i.get(Ae(d.q+h,d.r+p));v&&v.baseDensity>f&&(f=v.baseDensity)}d.edgeInfluence=at(f*(d.baseDensity?.18:.48)*s*d.suitability,0,.46),d.density=at(d.baseDensity+d.edgeInfluence,0,1)}if(n==="canopy"&&l>0){let d=at(l*.55,0,.19),f=[];for(let h of i.values()){if(h.forestClass!=="dense_forest"||h.jungle)continue;let p=0;for(let[_,U]of Re)i.get(Ae(h.q+_,h.r+U))?.forestClass==="dense_forest"&&p++;if(p<2)continue;let v=Y(r,h.q,h.r,1864,8191,4093,17);if(v>=d)continue;let y=!1;for(let _=-2;_<=2&&!y;_++)for(let U=-2;U<=2;U++){if(U===0&&_===0||Math.abs(U+_)>2)continue;let G=i.get(Ae(h.q+U,h.r+_));if(!(!G||G.forestClass!=="dense_forest"||G.jungle)&&Y(r,G.q,G.r,1864,8191,4093,17)<v){y=!0;break}}y||f.push(h)}for(let h of f)if(h.glade=!0,Y(r,h.q,h.r,1954,8191,4093,17)<.84){let p=null,v=1/0;for(let[y,_]of Re){let U=i.get(Ae(h.q+y,h.r+_));if(!U||U.forestClass!=="dense_forest"||U.jungle)continue;let G=Y(r,U.q,U.r,1953,8191,4093,17);G<v&&(v=G,p=U)}p&&(p.glade=!0)}}for(let d of i.values()){if(!d.suitability)continue;d.glade&&(d.gladeX=Math.round((Y(r,d.q,d.r,2041,8191,4093,17)-.5)*52),d.gladeY=Math.round((Y(r,d.q,d.r,2042,8191,4093,17)-.5)*40),d.gladeRadius=58+Math.round(Y(r,d.q,d.r,2043,8191,4093,17)*18));let f=d.forestClass==="dense_forest"?1:d.forestClass==="light_forest"?.49:d.edgeInfluence>.08?.17:0,h=wo(r,d.q,d.r),p=at(a+c*h,.12,.98);d.canopyCoverage=at(p*f*(.58+.42*d.density)*d.suitability*(d.glade?.24:1),0,.98)}return i}function Sn(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function Cn(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function Br(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,i=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return i*i+n*n<.94*.94}function Mn(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function Ut(t,e,r,o){let i=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*Y(t,e,r,i,173,311,79);for(let[a,c]of Re)n+=.5/6*Y(t,e+a,r+c,i,173,311,79);return at(1+(n-.5)*1.5,.6,1.4)}function Rn(t,e,r,o,i,n){let c=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,l=(Y(t,e,r,c,173,311,79)-.5)*154,s=(Y(t,e,r,c+1,173,311,79)-.5)*146,d=Y(t,e,r,i*127+n*2+17,173,311,79),f=Y(t,e,r,i*127+n*2+18,173,311,79),h=(d-.5)*242,p=(f-.5)*258,v=n>=26?0:o==="tree"?.43:.68,y=o==="tree"?170:126,_=l+(d-.5)*y,U=s+(f-.5)*y;return{dx:h*(1-v)+_*v,dy:p*(1-v)+U*v}}function or(t,e,r=0){let o=Math.abs(t),i=Math.abs(e);return i<=Je-r&&o<=Math.min(128,Math.sqrt(3)*(Je-i))-r}function En(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:Y(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var sr=128,Ht=78,Rt={enabled:!0,strength:Ht,lighting:!0,style:"sculpted"},Gr=168,Hr=127,Gt=Gr+Hr;function dt(t,e,r){return t<e?e:t>r?r:t}function Mt(t){let e=dt(t,0,1);return e*e*(3-2*e)}function Tn(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function ir(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function Ur(t,e,r){let o=Math.floor(t),i=Math.floor(e),n=t-o,a=e-i,c=n*n*n*(n*(n*6-15)+10),l=a*a*a*(a*(a*6-15)+10),s=ir(o,i,r),d=ir(o+1,i,r),f=ir(o,i+1,r),h=ir(o+1,i+1,r);return(s+(d-s)*c)*(1-l)+(f+(h-f)*c)*l}function _o(t,e,r){let o=Ur(t/380,e/380,r^324508639),i=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,a=Ur(i,n,r^610839777),c=(t*.3255682-e*.9455186)/105,l=(t*.9455186+e*.3255682)/105,s=Ur(c,l,r^916255320);return{plainSwell:o*.78+a*.22,ridgeDetail:o*.34+a*.46+s*.2}}function Pn(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function So(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let i=r?.categoryId??"";return(i==="wetlands"?.3:i==="cold_regions"?.25:i==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function An(t,e,r,o=Ht,i="sculpted"){let n=[],a=[];for(let l=0;l<t.length;l++){let s=t[l],d=256*(s.q+s.r*.5),f=$e*s.r;if(Pn(s,e)){a.push({x:d,y:f});continue}if(s.reliefClass!=="hills")continue;let h=dt(s.hillStrength??.7,0,1);if(h<=0)continue;let p=(Math.imul(s.q,73856093)^Math.imul(s.r,19349663)^r)>>>0,v=(Tn(p)-.5)*1.7,y=s.hillProfile||"rounded",_=y==="ridge"||y==="chain"?560:440;n.push({x:d,y:f,ca:Math.cos(v),sa:Math.sin(v),shape:y,weight:.42+.58*h,reach:_})}let c=o>0?i==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:a,strengthPct:o,heightGain:c,seedInt:r,style:i}}function kn(t,e,r){let o=e*t.ca+r*t.sa,i=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(i/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(i/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,i/158),3.1)):t.shape==="plateau"?1-Mt((Math.hypot(o/188,i/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(i/180)**2))}function Wn(t,e,r,o,i,n,a,c){if(n<=0||e<=.004)return 0;if(c==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:l,ridgeDetail:s}=_o(r,o,a),d=Math.max(0,l-.38)*14*(i/100)*e;if(t<=1e-4)return d;let f=1-Math.exp(-t*.76),h=n*f*(.76+.42*s)*e;return Math.min(sr,h+d*.55)}function Fn(t,e,r){if(t.heightGain<=0)return 0;let o=0,i=t.waters,n=Gt*Gt;for(let s=0;s<i.length;s++){let d=i[s],f=e-d.x,h=r-d.y;if(Math.abs(f)>Gt||Math.abs(h)>Gt)continue;let p=f*f+h*h;if(p<n){let v=1-Mt((Math.sqrt(p)-Gr)/Hr);v>o&&(o=v)}}let a=1-o;if(a<=.004)return 0;let c=0,l=t.hills;for(let s=0;s<l.length;s++){let d=l[s],f=e-d.x,h=r-d.y;Math.abs(f)>d.reach||Math.abs(h)>d.reach||(c+=kn(d,f,h)*d.weight)}return Wn(c,a,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function Ln(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),i=t.width/(r-1),n=t.height/(o-1),a=1/i,c=1/n,l=r*o,s=new Float32Array(l),d=new Float32Array(l),f=new Float32Array(l),h=new Float32Array(l),p=new Float32Array(l),v=new Float32Array(l),y=new Float32Array(l),_=520,U=Math.floor((t.top-_)/$e)-2,G=Math.ceil((t.top+t.height+_)/$e)+2,T=t.reliefStyle??"sculpted",W=t.reliefStrength??Ht,V=W>0?T==="sculpted"?112*(W/100):67*(W/100)*1.2:0,g=(A,I,L,B,N,K)=>{let $=Math.max(0,Math.floor((I-K-t.left)*a)),ie=Math.min(r-1,Math.ceil((I+K-t.left)*a)),ce=Math.max(0,Math.floor((L-K-t.top)*c)),Z=Math.min(o-1,Math.ceil((L+K-t.top)*c)),S=K*K;for(let F=ce;F<=Z;F++){let w=t.top+F*n-L,R=w*w,u=F*r;for(let m=$;m<=ie;m++){let b=t.left+m*i-I,E=b*b+R;if(E>=S)continue;let C=1-Mt((Math.sqrt(E)-B)/N);C>A[u+m]&&(A[u+m]=C)}}};for(let A=U;A<=G;A++){let I=Math.floor((t.left-_)/256-A*.5)-2,L=Math.ceil((t.left+t.width+_)/256-A*.5)+2;for(let B=I;B<=L;B++){let N=t.lookupHex(B,A);if(!N||N.fogState===0)continue;let K=256*(B+A*.5),$=$e*A;if(Pn(N,t.manifest)){g(f,K,$,Gr,Hr,Gt),g(h,K,$,108,48,160);continue}if((N.terrainId==="snowfields"||N.terrainId==="frozen_tundra"||N.terrainId==="jungle")&&g(h,K,$,108,48,160),V>0&&N.reliefClass==="hills"){let Z=dt(N.hillStrength??.7,0,1);if(Z>0){let S=(Math.imul(B,73856093)^Math.imul(A,19349663)^t.seedInt)>>>0,F=(Tn(S)-.5)*1.7,w=N.hillProfile||"rounded",R=w==="ridge"||w==="chain"?560:440,u={x:K,y:$,ca:Math.cos(F),sa:Math.sin(F),shape:w,weight:.42+.58*Z,reach:R},m=Math.max(0,Math.floor((K-R-t.left)*a)),b=Math.min(r-1,Math.ceil((K+R-t.left)*a)),E=Math.max(0,Math.floor(($-R-t.top)*c)),C=Math.min(o-1,Math.ceil(($+R-t.top)*c));for(let D=E;D<=C;D++){let H=t.top+D*n-$,z=D*r;for(let ne=m;ne<=b;ne++){let J=t.left+ne*i-K,ee=kn(u,J,H);ee>1e-4&&(s[z+ne]+=ee*u.weight)}}}}let ce=So(N,t.manifest);if(ce>.01){let S=Math.max(0,Math.floor((K-172-t.left)*a)),F=Math.min(r-1,Math.ceil((K+172-t.left)*a)),w=Math.max(0,Math.floor(($-172-t.top)*c)),R=Math.min(o-1,Math.ceil(($+172-t.top)*c)),u=29584;for(let m=w;m<=R;m++){let b=t.top+m*n-$,E=b*b,C=m*r;for(let D=S;D<=F;D++){let H=t.left+D*i-K,z=H*H+E;if(z>=u)continue;let ne=1-Mt((Math.sqrt(z)-110)/56);if(ne>0){let J=C+D,ee=p[J]+ne*1.15;p[J]=ee>1?1:ee,ce>v[J]&&(v[J]=ce)}}}if(N.glade){let m=K+(N.gladeX??0),b=$+(N.gladeY??0),E=N.gladeRadius??64,C=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[D,H,z]of C){let ne=m+E*D,J=b+E*H,ee=E*z,ae=ee*ee,fe=Math.max(0,Math.floor((ne-ee-t.left)*a)),Ee=Math.min(r-1,Math.ceil((ne+ee-t.left)*a)),_e=Math.max(0,Math.floor((J-ee-t.top)*c)),ve=Math.min(o-1,Math.ceil((J+ee-t.top)*c));for(let ye=_e;ye<=ve;ye++){let ge=t.top+ye*n-J,We=ge*ge,Te=ye*r;for(let De=fe;De<=Ee;De++){let Oe=t.left+De*i-ne,Ne=Oe*Oe+We;if(Ne>=ae)continue;let Ie=1-Mt((Math.sqrt(Ne)-ee*.14)/(ee*.86)),qe=Te+De;Ie>y[qe]&&(y[qe]=Ie)}}}}}}}for(let A=0;A<o;A++){let I=t.top+A*n,L=A*r;for(let B=0;B<r;B++){let N=L+B,K=1-f[N];if(K<=.004||V<=0)continue;let $=t.left+B*i;d[N]=Wn(s[N],K,$,I,W,V,t.seedInt,T)}}let M=new Uint8Array(l*4),x=Math.max(1,(i+n)*.5);for(let A=0;A<o;A++){let I=A>0?A-1:0,L=A<o-1?A+1:o-1,B=Math.max(1,(L-I)*n),N=A*r;for(let K=0;K<r;K++){let $=K>0?K-1:0,ie=K<r-1?K+1:r-1,ce=Math.max(1,(ie-$)*i),Z=N+K,S=d[Z],F=d[N+$],w=d[N+ie],R=d[I*r+K],u=d[L*r+K],m=(w-F)/ce,b=(u-R)/B,E;if(T==="sculpted"){let z=((F+w+R+u)*.25-S)/x,ne=dt(-z*1.45,-.1,.12);E=dt(1-2.45*m-.65*b+ne,.6,1.36)}else E=dt(1-2.15*m-.48*b,.66,1.32);let C=1-h[Z],D=p[Z]>.01&&C>.01?Mt((p[Z]-.12)/.72)*v[Z]*(1-y[Z]*.94)*C:0,H=Z*4;M[H]=Math.round(dt(S/sr,0,1)*255),M[H+1]=Math.round(dt((E-.52)/.96,0,1)*255),M[H+2]=Math.round(dt(D,0,1)*255),M[H+3]=Math.round(dt(1-f[Z],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:M,heights:d}}function In(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),i=(r-t.top)/t.height*(t.rows-1);if(o<0||i<0||o>=t.cols-1||i>=t.rows-1)return 0;let n=Math.floor(o),a=Math.floor(i),c=o-n,l=i-a,s=a*t.cols+n,d=t.heights[s],f=t.heights[s+1],h=t.heights[s+t.cols],p=t.heights[s+t.cols+1];return(d*(1-c)+f*c)*(1-l)+(h*(1-c)+p*c)*l}var Or=65536,ar=16,ft={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function Co(t){if(!t)return ft.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?ft.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?ft.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?ft.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?ft.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?ft.forest:r==="hills"?ft.rock:ft.earth}var Mo=`#version 300 es
precision highp float;

layout(location = 0) in vec4 a_pos;    // xy = projected world pos, zw = unprojected world pos
layout(location = 1) in vec4 a_params; // x = crossDist, y = halfW, z = mouthFade, w = landFade
layout(location = 2) in vec4 a_flow;   // x = fogDim, y = flowAlong, z = tx, w = ty
layout(location = 3) in vec4 a_bank;   // rgb = biome bank color, a = rockMix (0..1)

uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;

out vec2 v_uPos;
out float v_crossDist;
out float v_halfW;
out float v_mouthFade;
out float v_landFade;
out float v_fogDim;
out float v_flowAlong;
out vec2 v_tangent;
out vec4 v_bank;

void main() {
  vec2 screenOffset = (a_pos.xy - u_camCenter) * u_zoom;
  vec2 ndc = vec2(
    screenOffset.x / (u_viewportSize.x * 0.5),
    -screenOffset.y / (u_viewportSize.y * 0.5)
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_uPos = a_pos.zw;
  v_crossDist = a_params.x;
  v_halfW = a_params.y;
  v_mouthFade = a_params.z;
  v_landFade = a_params.w;
  v_fogDim = a_flow.x;
  v_flowAlong = a_flow.y;
  v_tangent = a_flow.zw;
  v_bank = a_bank;
}
`,Ro=`#version 300 es
precision highp float;
precision highp sampler2DArray;

in vec2 v_uPos;
in float v_crossDist;
in float v_halfW;
in float v_mouthFade;
in float v_landFade;
in float v_fogDim;
in float v_flowAlong;
in vec2 v_tangent;
in vec4 v_bank;

out vec4 fragColor;

uniform sampler2DArray u_terrainArray;
uniform int u_coastalWaterLayer;
uniform float u_time;
uniform float u_windEnabled;
uniform float u_passMode; // 0.0 = 2.5D sculpted river-banks.js riverbed, 1.0 = downstream flowing water core

float smooth3(float t) {
  float c = clamp(t, 0.0, 1.0);
  return c * c * (3.0 - 2.0 * c);
}

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.53);
  return fract(p.x * p.y);
}

// World-anchored Voronoi rock/earth facets matching asset_labor/river-banks.js:147-159
vec2 bankFacets(vec2 p) {
  const float pitch = 29.0;
  vec2 g = floor(p / pitch);
  float first = 1e9;
  float second = 1e9;
  float tint = 0.0;
  for (int iy = -1; iy <= 1; iy++) {
    for (int ix = -1; ix <= 1; ix++) {
      vec2 cell = g + vec2(float(ix), float(iy));
      float jx = hash21(cell + vec2(29.0, -11.0)) - 0.5;
      float jy = hash21(cell + vec2(-12.0, 17.0)) - 0.5;
      vec2 fp = (cell + vec2(0.5) + vec2(jx, jy) * 0.72) * pitch;
      float dist = length(p - fp);
      if (dist < first) {
        second = first;
        first = dist;
        tint = hash21(cell + vec2(7.0, 3.0)) * 2.0 - 1.0;
      } else if (dist < second) {
        second = dist;
      }
    }
  }
  float crack = 1.0 - smooth3((second - first - 1.25) / 3.5);
  return vec2(tint, clamp(crack, 0.0, 1.0));
}

// Sparse tangent-aligned elliptical riverside pebbles matching asset_labor/river-banks.js:127-142
float bankDebris(vec2 p, vec2 tDir) {
  const float pitch = 19.0;
  vec2 g = floor(p / pitch);
  float cov = 0.0;
  for (int iy = -1; iy <= 1; iy++) {
    for (int ix = -1; ix <= 1; ix++) {
      vec2 cell = g + vec2(float(ix), float(iy));
      float s = hash21(cell);
      if (s > 0.34) continue;
      float jx = hash21(cell + vec2(17.0, -31.0)) - 0.5;
      float jy = hash21(cell + vec2(-39.0, 13.0)) - 0.5;
      vec2 c = (cell + vec2(0.5) + vec2(jx, jy) * 0.42) * pitch;
      vec2 d = p - c;
      float al = dot(d, tDir);
      float ac = -d.x * tDir.y + d.y * tDir.x;
      float wide = 3.1 + hash21(cell + vec2(7.0, 0.0)) * 2.4;
      float high = 1.6 + hash21(cell + vec2(0.0, -6.0)) * 1.5;
      float ell = length(vec2(al / wide, ac / high));
      cov = max(cov, 1.0 - smooth3((ell - 0.55) / 0.45));
    }
  }
  return cov;
}

// Exact asset_labor/river.js:173-179 distance-field smooth water alpha
float riverAlphaAt(float dist, float halfW) {
  float inner = max(2.0, halfW - 3.0);
  float outer = halfW + 11.5;
  if (dist <= inner) return 0.985;
  if (dist >= outer) return 0.0;
  float t = (dist - inner) / (outer - inner);
  return 0.985 * (1.0 - smooth3(t));
}

void main() {
  // Organic world-anchored bank meander (exact river-banks.js:165-166)
  float bankWarp = 2.1 * sin(v_uPos.x * 0.061 + v_uPos.y * 0.043)
                 + 1.35 * sin(v_uPos.x * 0.123 - v_uPos.y * 0.079)
                 + 0.8 * sin(v_uPos.x * 0.23 + v_uPos.y * 0.17);
  float absCross = abs(v_crossDist);
  vec2 tDir = normalize(v_tangent + vec2(1e-5, 0.0));

  if (u_passMode < 0.5) {
    // Pass A: Full 1:1 GPU port of asset_labor/river-banks.js biome-aware sculpted 2.5D riverbed!
    // Calibrated cleanly within 34 WU outer corridor (smaller than 56.7 WU fillet curvature -> zero bend foldover!).
    if (v_landFade < 0.005) discard;
    float d = absCross - v_halfW + bankWarp;
    if (d < -1.5 || d > 33.5) discard;

    float enter = smooth3((d + 0.8) / 2.6);
    float foot = (1.0 - smooth3((d - 1.2) / 6.2)) * enter;
    float wall = (1.0 - smooth3((d - 12.0) / 6.5)) * smooth3((d - 0.2) / 4.2);
    float crest = exp(-pow((d - 16.2) / 3.8, 2.0));
    float shoulder = (1.0 - smooth3((d - 18.5) / 13.5)) * smooth3((d - 15.0) / 5.0);
    if (foot + wall + crest + shoulder < 0.002) discard;

    float rockMix = clamp(v_bank.a * 0.82 + 0.20, 0.0, 1.0);
    vec2 fc = bankFacets(v_uPos);
    float broken = fc.y * rockMix;
    float looseBand = 1.0 - smooth3(abs(d - 20.0) / 11.5);
    float stone = looseBand * rockMix * bankDebris(v_uPos, tDir);

    // Directional 142-deg lighting from upper-right: inward slope of western bank catches sun,
    // opposite eastern bank recesses into rich sculpted earth/rock shadow!
    float sideSign = v_crossDist >= 0.0 ? 1.0 : -1.0;
    float dirLight = clamp(-sideSign * ((-tDir.y) * 0.79 + tDir.x * (-0.58)), -1.0, 1.0);

    float bankStrength = 0.84;
    float a = clamp(
      bankStrength * (foot * 0.68 + wall * 0.84 + crest * 0.66 + shoulder * 0.26 + stone * 0.34),
      0.0,
      0.90
    ) * v_mouthFade * v_landFade;
    if (a < 0.004) discard;

    float rockShade = fc.x * 0.20 * rockMix - broken * 0.24 + stone * 0.26;
    float tone = 1.0
      + wall * (-0.16 + dirLight * 0.28 + rockShade)
      + foot * (-0.38)
      + crest * (0.28 + dirLight * 0.12)
      + shoulder * (0.04 + fc.x * 0.04);

    float stoneBlend = clamp((wall + crest * 0.4) * rockMix * 0.34 + stone * 0.56, 0.0, 0.68);
    vec3 stoneCol = vec3(173.0 / 255.0, 163.0 / 255.0, 142.0 / 255.0);
    vec3 bankCol = clamp(mix(v_bank.rgb, stoneCol, stoneBlend) * tone, 0.0, 1.0);

    if (v_fogDim < 0.95) {
      float luma = dot(bankCol, vec3(0.299, 0.587, 0.114));
      bankCol = mix(vec3(luma), bankCol, 0.55) * vec3(0.68, 0.72, 0.78);
    }
    fragColor = vec4(bankCol * a, a);
    return;
  }

  // Pass B: True source-to-mouth flowing river channel (v_flowAlong increases strictly toward mouth!)
  float dWater = max(0.0, absCross + bankWarp * 0.52);
  float coreA = riverAlphaAt(dWater, v_halfW);
  float a = coreA * v_mouthFade;
  if (a < 0.006) discard;

  float centerFactor = 1.0 - clamp(dWater / max(6.0, v_halfW), 0.0, 1.0);
  float tFlow = u_windEnabled > 0.5 ? u_time : 0.0;
  // Faster central thalweg current (26 WU/s) & calmer shallow banks (14 WU/s), ALWAYS moving source -> mouth!
  float flowRate = mix(14.0, 26.0, centerFactor);
  float s1 = v_flowAlong - tFlow * flowRate;
  float s2 = v_flowAlong - tFlow * flowRate * 0.64 + 83.0;

  // Channel-aligned UVs ensure the water texture flows downstream around EVERY bend in all 360 deg!
  vec2 uv1 = vec2(v_crossDist / 165.0 + sin(v_flowAlong * 0.014) * 0.045, s1 / 210.0);
  vec2 uv2 = vec2(-v_crossDist / 195.0 + 0.37, s2 / 245.0 + 0.19);
  vec3 w1 = texture(u_terrainArray, vec3(uv1, float(u_coastalWaterLayer))).rgb;
  vec3 w2 = texture(u_terrainArray, vec3(uv2, float(u_coastalWaterLayer))).rgb;
  vec3 waterCol = mix(w1, w2, 0.42);

  // Shallow translucent gravel/bank-tinted water edges transitioning into deeper river-blue center!
  float shallow = smoothstep(0.45, 1.0, 1.0 - centerFactor) * v_landFade;
  waterCol = mix(waterCol * mix(0.92, 1.03, centerFactor), mix(waterCol, v_bank.rgb * 0.74, 0.32), shallow * 0.62);

  if (u_windEnabled > 0.5) {
    // Elongated downstream current filaments & sun-glint ripples visibly drifting toward the river mouth
    float streak1 = sin(s1 * 0.105 + sin(v_crossDist * 0.16) * 1.4) * cos(v_crossDist * 0.24);
    float streak2 = sin(s2 * 0.072 - v_crossDist * 0.11);
    float current = streak1 * 0.65 + streak2 * 0.35;
    float glint = max(0.0, current - 0.52) * (0.45 + 0.55 * centerFactor);
    waterCol = clamp(
      waterCol * (1.0 + current * 0.048) + vec3(0.09, 0.12, 0.13) * glint,
      0.0,
      1.0
    );
  }

  if (v_fogDim < 0.95) {
    float luma = dot(waterCol, vec3(0.299, 0.587, 0.114));
    waterCol = mix(vec3(luma), waterCol, 0.58) * vec3(0.68, 0.72, 0.78);
  }

  fragColor = vec4(waterCol * a, a);
}
`;function lr(t,e){return{x:256*(t+e*.5),y:$e*e}}function Ot(t,e){let r=lr(t,e),o=[];for(let i=0;i<6;i++){let n=-Math.PI/2+i*Math.PI/3;o.push({x:r.x+Je*Math.cos(n),y:r.y+Je*Math.sin(n)})}return o}function Nr(t,e,r,o){let i=r-t,n=o-e;for(let a=0;a<6;a++)if(Re[a][0]===i&&Re[a][1]===n)return a;return-1}function Eo(t,e,r){let o=Ot(t,e),i=o[r],n=o[(r+1)%6];return{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}function To(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function Dn(t,e){for(let r=0;r<6;r++)if(To(t[r],e))return r;return-1}function Xr(t,e,r,o){let i=Ot(t,e),n=Dn(i,r),a=Dn(i,o);if(n<0||a<0)return[r,o];let c=(a-n+6)%6,l=(n-a+6)%6,s=c<=l?1:-1,d=Math.min(c,l),f=[];for(let h=0;h<=d;h++)f.push(i[(n+s*h+12)%6]);return f}function Vr(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],i=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let c=1;c<n;c++){let l=t[c-1],s=t[c],d=t[c+1],f=s.x-l.x,h=s.y-l.y,p=d.x-s.x,v=d.y-s.y,y=Math.hypot(f,h),_=Math.hypot(p,v);if(y<1e-4||_<1e-4)continue;if((f*p+h*v)/(y*_)>.995){o.push(s);continue}let G=Math.min(y*.4,_*.4,i*1.4+14),T={x:s.x-f/y*G,y:s.y-h/y*G},W={x:s.x+p/_*G,y:s.y+v/_*G};o.push(T);for(let V=1;V<6;V++){let g=V/6,M=1-g;o.push({x:M*M*T.x+2*M*g*s.x+g*g*W.x,y:M*M*T.y+2*M*g*s.y+g*g*W.y})}o.push(W)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let a=[];for(let c=0;c<o.length;c++)(c===0||Math.hypot(o[c].x-a[a.length-1].x,o[c].y-a[a.length-1].y)>1e-4)&&a.push(o[c]);return a}function zr(t,e=34){let r=t.hexes;if(!r||r.length<2)return null;let o=r.length-1,i=[];for(let I=0;I<o;I++){let[L,B]=r[I],[N,K]=r[I+1],$=Nr(L,B,N,K);if($<0)return null;let ie=Ot(L,B);i.push([ie[$],ie[($+1)%6]])}let n=Nr(r[0][0],r[0][1],r[1][0],r[1][1]),a=t.corner??(n+3)%6,c=Ot(r[0][0],r[0][1])[a],l=i.map(()=>[1/0,1/0]),s=i.map(()=>[0,0]);for(let I=0;I<2;I++)l[0][I]=Xr(r[0][0],r[0][1],c,i[0][I]).length-1;for(let I=1;I<o;I++)for(let L=0;L<2;L++)for(let B=0;B<2;B++){let N=Xr(r[I][0],r[I][1],i[I-1][B],i[I][L]).length-1,K=l[I-1][B]+N;K<l[I][L]&&(l[I][L]=K,s[I][L]=B)}let d=new Array(o),f=l[o-1][0]<=l[o-1][1]?0:1;for(let I=o-1;I>=0;I--)d[I]=i[I][f],f=s[I][f];let h=[];for(let I=0;I<o;I++){let L=I===0?c:d[I-1],B=d[I],N=Xr(r[I][0],r[I][1],L,B);for(let K=0;K<N.length;K++)h.push(N[K])}let p=r[o-1],v=r[o],y=Nr(p[0],p[1],v[0],v[1]);if(y<0)return null;let _=Eo(p[0],p[1],y),U=lr(p[0],p[1]),G=lr(v[0],v[1]),T=G.x-U.x,W=G.y-U.y,V=Math.hypot(T,W)||1,g=Math.max(28,e*1.85),M={x:_.x+T/V*g,y:_.y+W/V*g};h.push(_,M);let x=[];for(let I=0;I<h.length;I++)(I===0||Math.hypot(h[I].x-x[x.length-1].x,h[I].y-x[x.length-1].y)>1e-4)&&x.push(h[I]);let A=Vr(x,e,!0);return A.length<2?null:{id:t.id,points:A,mouthCrossIdx:A.length-2,width:e,hasMouth:!0}}function Po(t,e=34){if(!t||t.length===0)return[];let r=l=>`${Math.round(l.x*2)},${Math.round(l.y*2)}`,o=[],i=new Set,n=new Map;for(let l of t){let s=(l.dir%6+6)%6,d=Ot(l.q,l.r),f=d[s],h=d[(s+1)%6],p=r(f),v=r(h),y=p<v?`${p}|${v}`:`${v}|${p}`;if(i.has(y))continue;i.add(y);let _=o.length;o.push({a:f,b:h,ka:p,kb:v,used:!1});let U=n.get(p)??[];U.push(_),n.set(p,U);let G=n.get(v)??[];G.push(_),n.set(v,G)}let a=[],c=(l,s)=>{let d=o[l];d.used=!0;let f=s?[d.a,d.b]:[d.b,d.a],h=s?d.kb:d.ka;for(;;){let p=n.get(h);if(!p)break;let v=-1;for(let _ of p)if(!o[_].used){v=_;break}if(v<0)break;let y=o[v];y.used=!0,y.ka===h?(f.push(y.b),h=y.kb):(f.push(y.a),h=y.ka)}return f};for(let l=0;l<2;l++)for(let s=0;s<o.length;s++)if(!o[s].used)if(l===0){let d=n.get(o[s].ka)?.length??0,f=n.get(o[s].kb)?.length??0;if(d!==1&&f!==1)continue;let h=c(s,d===1);a.push({id:`edge_${s}`,points:Vr(h,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let d=c(s,!0);a.push({id:`edge_${s}`,points:Vr(d,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return a}var cr=class{constructor(e){this.verts=new Float32Array(Or*ar);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,Mo),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,Ro),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate river program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),a=e.createBuffer();if(!n||!a)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=a,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let c=ar*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,c,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,c,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,c,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,c,48),e.bindVertexArray(null);let l=s=>{let d=e.getUniformLocation(i,s);if(!d)throw new Error(`Missing river uniform: ${s}`);return d};this.uCamCenter=l("u_camCenter"),this.uViewportSize=l("u_viewportSize"),this.uZoom=l("u_zoom"),this.uCoastalWaterLayer=l("u_coastalWaterLayer"),this.uTime=l("u_time"),this.uWindEnabled=l("u_windEnabled"),this.uPassMode=l("u_passMode"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0)}getCachedCourse(e,r=34){let o=`${e.id}@${r}`;if(this.courseCache.has(o))return this.courseCache.get(o)??null;let i=zr(e,r);if(this.courseCache.set(o,i),this.courseCache.size>512){let n=this.courseCache.keys().next().value;n!==void 0&&this.courseCache.delete(n)}return i}pushVertex(e,r,o,i,n,a,c,l,s,d,f,h,p){if(this.vertCount>=Or)return;let v=this.vertCount*ar,y=this.verts;y[v++]=e,y[v++]=r,y[v++]=o,y[v++]=i,y[v++]=n,y[v++]=a,y[v++]=c,y[v++]=l,y[v++]=s,y[v++]=d,y[v++]=f,y[v++]=h,y[v++]=p.r,y[v++]=p.g,y[v++]=p.b,y[v++]=p.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return ft.earth;let i=et(e,r*ze),n=0,a=0,c=0,l=0,s=0;for(let d=-1;d<6;d++){let f=d<0?i.q:i.q+Re[d][0],h=d<0?i.r:i.r+Re[d][1],p=o(f,h);if(!p)continue;let v=p.terrainId;if(v==="ocean"||v==="coastal_water"||v==="stormy_ocean"||v==="icy_ocean")continue;let y=lr(f,h),_=Math.hypot(e-y.x,r-y.y);if(_>380)continue;let U=Math.max(0,Math.min(1,1-Math.max(0,_-35)/345)),G=U*U*(3-2*U),T=G*G,W=Co(p);a+=W.r*T,c+=W.g*T,l+=W.b*T,s+=W.rock*T,n+=T}return n<1e-4?ft.earth:{r:a/n,g:c/n,b:l/n,rock:s/n}}emitCourse(e,r,o,i,n){let a=e.points,c=a.length;if(c<2)return;let l=e.width*.5*n,s=e.hasMouth&&e.mouthCrossIdx>=0?a[e.mouthCrossIdx]:null,d=e.hasMouth?a[c-1]:null,f=s&&d?d.x-s.x:0,h=s&&d?d.y-s.y:0,p=f*f+h*h||1,v=Math.sqrt(p),y=new Float32Array(c);for(let x=1;x<c;x++)y[x]=y[x-1]+Math.hypot(a[x].x-a[x-1].x,a[x].y-a[x-1].y);let _=Math.max(1,y[c-1]),U=new Float32Array(c),G=new Float32Array(c),T=new Float32Array(c),W=new Float32Array(c),V=new Array(c);for(let x=0;x<c;x++){let A=a[x>0?x-1:0],I=a[x<c-1?x+1:c-1],L=I.x-A.x,B=I.y-A.y,N=Math.hypot(L,B)||1;U[x]=L/N,G[x]=B/N,T[x]=-B/N,W[x]=L/N,V[x]=this.sampleBankPalette(a[x].x,a[x].y,i)}let g=(x,A,I)=>{let L=r(x,A),B=x,N=(A-L)*ze,K=y[I]/_,$=l*(e.hasMouth?.78+.3*K:1),ie=1,ce=1;if(s&&d){let w=(x-s.x)*f+(A-s.y)*h,R=Math.max(0,Math.min(1,w/p));ie=1-R*R*(3-2*R);let u=w/v,m=Math.max(0,Math.min(1,(u+22)/22));ce=1-m*m*(3-2*m)}let Z=et(x,A*ze),S=o(Z.q,Z.r);return{wx:B,wy:N,halfW:$,mouthFade:ie,landFade:ce,fogDim:S===0?0:S===1?.65:1}},M=34;{let x=a[0],A=-U[0],I=-G[0],L=g(x.x,x.y,0);if(L.fogDim>0){let B=L.halfW+M,N=10;for(let K=0;K<N;K++){let $=-Math.PI*.5+K/N*Math.PI,ie=-Math.PI*.5+(K+1)/N*Math.PI,ce=(A*Math.cos($)+T[0]*Math.sin($))*B,Z=(I*Math.cos($)+W[0]*Math.sin($))*B,S=(A*Math.cos(ie)+T[0]*Math.sin(ie))*B,F=(I*Math.cos(ie)+W[0]*Math.sin(ie))*B,w=g(x.x+ce,x.y+Z,0),R=g(x.x+S,x.y+F,0),u=Math.sin($)>=0?1:-1,m=Math.sin(ie)>=0?1:-1;this.pushVertex(L.wx,L.wy,x.x,x.y,0,L.halfW,L.mouthFade,L.landFade,L.fogDim,0,U[0],G[0],V[0]),this.pushVertex(w.wx,w.wy,x.x+ce,x.y+Z,u*B,L.halfW,w.mouthFade,w.landFade,L.fogDim,-Math.cos($)*B,U[0],G[0],V[0]),this.pushVertex(R.wx,R.wy,x.x+S,x.y+F,m*B,L.halfW,R.mouthFade,R.landFade,L.fogDim,-Math.cos(ie)*B,U[0],G[0],V[0])}}}for(let x=0;x<c-1&&!(this.vertCount+6>Or);x++){let A=a[x],I=a[x+1],L=g(A.x,A.y,x),B=g(I.x,I.y,x+1);if(L.fogDim===0&&B.fogDim===0)continue;let N=L.fogDim>0?L.fogDim:B.fogDim,K=B.fogDim>0?B.fogDim:L.fogDim,$=L.halfW+M,ie=B.halfW+M,ce=A.x-T[x]*$,Z=A.y-W[x]*$,S=A.x+T[x]*$,F=A.y+W[x]*$,w=I.x-T[x+1]*ie,R=I.y-W[x+1]*ie,u=I.x+T[x+1]*ie,m=I.y+W[x+1]*ie,b=g(ce,Z,x),E=g(S,F,x),C=g(w,R,x+1),D=g(u,m,x+1);this.pushVertex(b.wx,b.wy,ce,Z,-$,L.halfW,b.mouthFade,b.landFade,N,y[x],U[x],G[x],V[x]),this.pushVertex(E.wx,E.wy,S,F,$,L.halfW,E.mouthFade,E.landFade,N,y[x],U[x],G[x],V[x]),this.pushVertex(D.wx,D.wy,u,m,ie,B.halfW,D.mouthFade,D.landFade,K,y[x+1],U[x+1],G[x+1],V[x+1]),this.pushVertex(b.wx,b.wy,ce,Z,-$,L.halfW,b.mouthFade,b.landFade,N,y[x],U[x],G[x],V[x]),this.pushVertex(D.wx,D.wy,u,m,ie,B.halfW,D.mouthFade,D.landFade,K,y[x+1],U[x+1],G[x+1],V[x+1]),this.pushVertex(C.wx,C.wy,w,R,-ie,B.halfW,C.mouthFade,C.landFade,K,y[x+1],U[x+1],G[x+1],V[x+1])}if(!e.hasMouth){let x=a[c-1],A=U[c-1],I=G[c-1],L=g(x.x,x.y,c-1);if(L.fogDim>0){let B=L.halfW+M,N=10;for(let K=0;K<N;K++){let $=-Math.PI*.5+K/N*Math.PI,ie=-Math.PI*.5+(K+1)/N*Math.PI,ce=(A*Math.cos($)+T[c-1]*Math.sin($))*B,Z=(I*Math.cos($)+W[c-1]*Math.sin($))*B,S=(A*Math.cos(ie)+T[c-1]*Math.sin(ie))*B,F=(I*Math.cos(ie)+W[c-1]*Math.sin(ie))*B,w=g(x.x+ce,x.y+Z,c-1),R=g(x.x+S,x.y+F,c-1),u=Math.sin($)>=0?1:-1,m=Math.sin(ie)>=0?1:-1;this.pushVertex(L.wx,L.wy,x.x,x.y,0,L.halfW,1,1,L.fogDim,y[c-1],A,I,V[c-1]),this.pushVertex(w.wx,w.wy,x.x+ce,x.y+Z,u*B,L.halfW,1,1,L.fogDim,y[c-1]+Math.cos($)*B,A,I,V[c-1]),this.pushVertex(R.wx,R.wy,x.x+S,x.y+F,m*B,L.halfW,1,1,L.fogDim,y[c-1]+Math.cos(ie)*B,A,I,V[c-1])}}}}render(e){let{cam:r,assets:o,routes:i,manualEdges:n=[],sampleReliefHeight:a,lookupFog:c,lookupHex:l,timeSec:s,windAnimation:d=!0}=e;if(i.length===0&&n.length===0)return 0;this.vertCount=0;let f=r.zoom<.35?1+(.35-r.zoom)*1.4:1;for(let p=0;p<i.length;p++){let v=this.getCachedCourse(i[p],34);v&&this.emitCourse(v,a,c,l,f)}if(n.length>0){let p=Po(n,34);for(let v=0;v<p.length;v++)this.emitCourse(p[v],a,c,l,f)}if(this.vertCount===0)return 0;let{gl:h}=this;return h.enable(h.BLEND),h.blendEquation(h.FUNC_ADD),h.blendFunc(h.ONE,h.ONE_MINUS_SRC_ALPHA),h.useProgram(this.program),h.bindVertexArray(this.vao),h.bindBuffer(h.ARRAY_BUFFER,this.vbo),h.bufferSubData(h.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*ar)),h.activeTexture(h.TEXTURE0),h.bindTexture(h.TEXTURE_2D_ARRAY,o.terrainArray),h.uniform2f(this.uCamCenter,r.x,r.y),h.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),h.uniform1f(this.uZoom,r.zoom),h.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),h.uniform1f(this.uTime,s),h.uniform1f(this.uWindEnabled,d?1:0),h.uniform1f(this.uPassMode,0),h.drawArrays(h.TRIANGLES,0,this.vertCount),h.uniform1f(this.uPassMode,1),h.drawArrays(h.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Ao=Re.map(([t,e])=>[t+e*.5,$e*e/256]),ko=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),Wo=new Set(["moor","marshland","swamp"]);function ur(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function Yr(t,e,r){return t.kind==="mountain"?3:er(t)?0:t.kind==="tree"?r>=66?2:1:tr(t)||xt(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function jr(t){return er(t)?0:t.kind==="mountain"?.44:tr(t)||xt(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||rr(t)||Ir(t)?.3:.55}var Fo=256*256*Math.sqrt(3)/2,Nt=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=Ar(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...Rt,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...lt,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let i=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==i||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=Ar(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:i}=kt(e,r,Se),n=vt(o,i);this.rawCellChunks.delete(n),this.chunks.delete(n);let a=e-o*Se,c=r-i*Se,l=[0],s=[0];a<=2&&l.push(-1),a>=Se-3&&l.push(1),c<=2&&s.push(-1),c>=Se-3&&s.push(1);for(let d of l)for(let f of s)d===0&&f===0||this.chunks.delete(vt(o+d,i+f));this.revision++}setHexFogState(e,r,o){let{cq:i,cr:n}=kt(e,r,Se),a=vt(i,n),c=e-i*Se,s=(r-n*Se)*Se+c,d=this.chunks.get(a)?.cells[s],f=this.rawCellChunks.get(a)?.[s],h=d??f;return!h||h.fogState===o?!1:(d&&(d.fogState=o),f&&(f.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:i}=kt(e,r,Se),n=vt(o,i),c=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!c)return;let l=e-o*Se,s=r-i*Se;if(!(l<0||l>=Se||s<0||s>=Se))return c[s*Se+l]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let i=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!i||i.layers.length===0)return 0;if(i.layers.length===1)return i.layers[0];let n=an(this.seedIntValue,r,o,101)%i.layers.length;return i.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let i=sn(e,Se,2),n=0,a=0,c=[];for(let{cq:M,cr:x}of i){let A=vt(M,x),I=this.chunks.get(A);I?(this.chunks.delete(A),this.chunks.set(A,I),c.push(I)):n<r?(I=this.buildChunk(M,x),this.chunks.set(A,I),n++,this.revision++,c.push(I)):a++}for(;this.chunks.size>this.maxCachedChunks;){let M=this.chunks.keys().next().value;if(M===void 0)break;this.chunks.delete(M)}let l=this.maxCachedChunks*2;for(;this.rawCellChunks.size>l;){let M=this.rawCellChunks.keys().next().value;if(M===void 0)break;this.rawCellChunks.delete(M)}let s=e.viewportWidth*.5/e.zoom+420,d=e.viewportHeight*.5/e.zoom+420,f=e.x-s,h=e.x+s,p=e.y-d,v=e.y+d,y=[],_=[],U=[],G=new Set;for(let M of c){for(let x of M.shorelines){if(x.x<f||x.x>h||x.y<p||x.y>v)continue;let A=this.lookupHex(x.q,x.r),I=A?A.fogState:0;I!==0&&(y.push(x),_.push(I))}for(let x of M.riverRoutes)G.has(x.id)||(G.add(x.id),U.push(x))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:y,shoreFogStates:_,riverRoutes:U,chunksLoadedThisFrame:n,hasPendingChunks:a>0};let T=[],W=[];for(let M of c){for(let x of M.sprites)x.x<f||x.x>h||x.y<p||x.y>v||T.push(x);for(let x of M.decals)x.x<f||x.x>h||x.y<p||x.y>v||W.push(x)}T.sort((M,x)=>(M.sortY??M.y)-(x.sortY??x.y)||M.x-x.x);let V=new Array(T.length);for(let M=0;M<T.length;M++){let x=T[M],A=this.lookupHex(x.q,x.r);V[M]=A?A.fogState:0}let g=new Array(W.length);for(let M=0;M<W.length;M++){let x=W[M],A=this.lookupHex(x.q,x.r);g[M]=A?A.fogState:0}return{sprites:T,fogStates:V,decals:W,decalFogStates:g,shorelines:y,shoreFogStates:_,riverRoutes:U,chunksLoadedThisFrame:n,hasPendingChunks:a>0}}getOrFetchRawCells(e,r){let o=vt(e,r),i=this.rawCellChunks.get(o);if(i)return i;let n=e*Se,a=r*Se,c=this.provider({cq:e,cr:r,chunkSize:Se}),l=new Array(Se*Se),s=this.fogOverride;for(let d of c){let f=d.q-n,h=d.r-a;f<0||f>=Se||h<0||h>=Se||(s&&(d.fogState=s(d.q,d.r)),l[h*Se+f]=d)}return this.rawCellChunks.set(o,l),l}lookupRawHex(e,r){let{cq:o,cr:i}=kt(e,r,Se),n=this.getOrFetchRawCells(o,i),a=e-o*Se,c=r-i*Se;return n[c*Se+a]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,i)=>o[0].localeCompare(i[0])),r=[];for(let[o,i]of e){let n=yn(i,this.manifest),a=i.worldWidth*Ct(i),c=.72*a*a/Fo,l=0,s=o.replace(/^assets\//,"");for(let h=0;h<s.length;h++)l=Math.imul(l,31)+s.charCodeAt(h)|0;let d=i.kind==="tree"?"tree":i.kind==="shrub"?"shrub":i.kind==="ground_cover"?"ground_cover":"other",f={key:o,entry:i,allowedTypes:n,effectiveWidth:a,crownAreaRatio:c,pathSalt:l,pre:{strict:Bt(i),ecoFamily:qt(i)},pScale:qr(i),chanceMult:gn(i),minSpacing:i.placement?.minSpacing??28,edgeMargin:i.placement?.edgeMargin??12,pKind:d,isCanopy:hn(i),isBoulder:tr(i),isWaterBoulder:xt(i),isWarmBoulder:It(i),isGroundDecal:er(i),isDryPatch:rr(i),isAcacia:Dr(i),isAccent:mn(i),isSnowFamily:nr(i),isBush20to29:Lr(i),isReed:Ir(i),isHerb:i.family==="herbs",accentGroup:pn(i)};if(i.kind==="mountain")this.mountainCandidates.push(f);else if(f.isWaterBoulder)i.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(f);else if(f.isGroundDecal){if(i.artStatus!=="deprecated"&&(i.placement?.density??.25)>0&&n.size>0)for(let h of n){let p=this.decalCandidatesByTerrain.get(h);p||(p=[],this.decalCandidatesByTerrain.set(h,p)),p.push(f)}}else if(i.artStatus!=="deprecated"&&(i.placement?.density??0)>0&&(i.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(f),f.isReed&&this.reedCandidates.push(f);for(let h of n){let p=this.candidatesByTerrain.get(h);p||(p=[],this.candidatesByTerrain.set(h,p)),p.push(f)}n.has("forest_floor")&&i.family!=="palms"&&r.push(f)}}for(let o of Object.keys(this.manifest.terrain.byType)){let i=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,i);else{let n=new Set(i),a=[...i];for(let c of r)n.has(c)||(n.add(c),a.push(c));this.candidatesByTerrainForest.set(o,a)}}}createPlacedSprite(e,r,o,i,n,a,c){let l=e.entry,s=e.effectiveWidth*a,d=s*l.aspect,f=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],h=n*ze,p=l.kind==="mountain",v=Math.round(i*3)^Math.round(n*5)|0,_=!p&&!e.isAccent&&!e.accentGroup&&Y(this.seedIntValue,r,o,v+811)<.5,U=i/(256*2.6),G=n/(256*2.6),T=Math.floor(U),W=Math.floor(G),V=U-T,g=G-W,M=V*V*(3-2*V),x=g*g*(3-2*g),A=Y(this.seedIntValue,T,W,913),I=Y(this.seedIntValue,T+1,W,913),L=Y(this.seedIntValue,T,W+1,913),B=Y(this.seedIntValue,T+1,W+1,913),N=A+(I-A)*M+(L+(B-L)*M-(A+(I-A)*M))*x,K=Y(this.seedIntValue,r,o,v+823),$=N*.6+K*.4,ie=p||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:l.kind==="tree"?.62:l.family==="cacti"?.08:l.kind==="shrub"?.42:l.kind==="ground_cover"?.24:0;return{x:i,y:h-c*ze,sortY:h,width:s,height:d,anchorX:l.anchor[0],anchorY:l.anchor[1],page:l.page,u0:l.uv[0],v0:l.uv[1],u1:l.uv[2],v1:l.uv[3],q:r,r:o,isMountain:p,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:_,tintHash:$,swayAmp:ie,shadowTier:Yr(l,s,d),selfShadeWeight:jr(l),shadowPage:f?f.page:-1,shadowU0:f?f.uv[0]:0,shadowV0:f?f.uv[1]:0,shadowU1:f?f.uv[2]:0,shadowV1:f?f.uv[3]:0,shadowMinX:f?f.boundsInSpriteWidth[0]:0,shadowMinY:f?f.boundsInSpriteWidth[1]:0,shadowMaxX:f?f.boundsInSpriteWidth[2]:0,shadowMaxY:f?f.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*Se,i=r*Se,n=this.seedIntValue,a=this.getOrFetchRawCells(e,r),c=[],l=[];for(let u=-2;u<Se+2;u++)for(let m=-2;m<Se+2;m++){let b=o+m,E=i+u,C=this.lookupRawHex(b,E);C&&(c.push(C),m>=0&&m<Se&&u>=0&&u<Se&&l.push(C))}let s=_n(c,this.manifest,n,this.forestConfig);for(let u of l){let m=s.get(Ae(u.q,u.r));m&&(u.forestClass=m.forestClass,u.glade=m.glade,u.gladeX=m.gladeX,u.gladeY=m.gladeY,u.gladeRadius=m.gladeRadius)}let d=[],f=this.manifest.infrastructure.sprites;for(let u of l){if(this.isWaterTerrain(u.terrainId)||Lt.has(u.terrainId))continue;let m=Pe(u.q,u.r);for(let b=0;b<6;b++){let[E,C]=Re[b],D=this.lookupRawHex(u.q+E,u.r+C);if(!D||!this.isWaterTerrain(D.terrainId)||D.terrainId==="icy_ocean")continue;let H=`shorelines/shore_v105_edge_0${b+1}`,z=f[H];z&&d.push({x:m.x,y:m.y,q:u.q,r:u.r,side:b,page:z.page,u0:z.uv[0],v0:z.uv[1],u1:z.uv[2],v1:z.uv[3]})}}let h=this.provider.getRiverRoutesForChunk?.(e,r,Se)??[],p=[];for(let u=0;u<h.length;u++){let m=zr(h[u],34);if(!m||m.points.length<2)continue;let b=1/0,E=-1/0,C=1/0,D=-1/0;for(let H=0;H<m.points.length;H++){let z=m.points[H];z.x<b&&(b=z.x),z.x>E&&(E=z.x),z.y<C&&(C=z.y),z.y>D&&(D=z.y)}p.push({course:m,minX:b-90,maxX:E+90,minY:C-90,maxY:D+90})}let v=(u,m)=>{if(p.length===0)return 1/0;let b=1/0;for(let E=0;E<p.length;E++){let C=p[E];if(u<C.minX||u>C.maxX||m<C.minY||m>C.maxY)continue;let D=C.course.points;for(let H=1;H<D.length;H++){let z=D[H-1],ne=D[H],J=ne.x-z.x,ee=ne.y-z.y,ae=J*J+ee*ee,fe=ae>1e-6?((u-z.x)*J+(m-z.y)*ee)/ae:0;fe<0?fe=0:fe>1&&(fe=1);let Ee=u-(z.x+fe*J),_e=m-(z.y+fe*ee),ve=Ee*Ee+_e*_e;ve<b&&(b=ve)}}return b<1/0?Math.sqrt(b):1/0},y=this.reliefConfig.enabled?this.reliefConfig.strength:0,_=this.reliefConfig.style??"sculpted",U=An(c,this.manifest,n,y,_),G=(u,m)=>Fn(U,u,m),T=[],W=new Set,V=[],g=new Map,M=(u,m,b,E,C,D,H,z)=>{T.push(this.createPlacedSprite(u,m,b,E,C,D,H));let ne={x:E,y:C,pScale:u.pScale,minSpacing:u.minSpacing,visualHalfW:u.effectiveWidth*D*.5,isCanopy:u.isCanopy,isBoulder:u.isBoulder},J=Ae(m,b),ee=g.get(J);ee||(ee=[],g.set(J,ee)),ee.push(ne),z.push(ne)};if(this.mountainCandidates.length>0){let u=new Set(l.map(m=>Ae(m.q,m.r)));for(let m of c){if(m.reliefClass!=="mountain"||m.occupied)continue;let b=this.mountainCandidates.filter(ee=>wn(ee.entry,ee.allowedTypes,m.terrainId,this.manifest)),E=b.length>0?b:this.mountainCandidates,C=Math.floor(Y(n,m.q,m.r,2002)*E.length),D=E[C%E.length],H=256*(m.q+m.r*.5),z=$e*m.r+20,ne=Math.max(72,(D.entry.mountain?.coreRadius??.32)*D.effectiveWidth);V.push({ux:H,uy:z,coreR2:ne*ne});let J=Ae(m.q,m.r);if(W.add(J),u.has(J)){let ee=G(H,z);T.push(this.createPlacedSprite(D,m.q,m.r,H,z,1,ee))}}}let x=l.filter(u=>!this.isWaterTerrain(u.terrainId)).length,A=bn(x),I={dead_trees:0,fallen_logs:0},L=(u,m,b,E)=>{let C=u/b,D=m/b,H=Math.floor(C),z=Math.floor(D),ne=C-H,J=D-z,ee=ne*ne*(3-2*ne),ae=J*J*(3-2*J),fe=Y(n,H,z,E),Ee=Y(n,H+1,z,E),_e=Y(n,H,z+1,E),ve=Y(n,H+1,z+1,E),ye=fe+(Ee-fe)*ee,ge=_e+(ve-_e)*ee;return ye+(ge-ye)*ae},B=(u,m,b,E)=>Y(n,m,b,E+u.pathSalt),N=(u,m,b=null)=>{if(b!==null)return b;if(u.isWaterBoulder)return ur(m)*1.28;if(u.isBoulder)return ur(m);let E=u.entry.scaleRange[0]??.85,C=u.entry.scaleRange[1]??1.15,D=u.entry.kind==="tree"?Math.min(E,.76):u.entry.kind==="shrub"?Math.min(E,.74):E,H=u.entry.kind==="tree"?Math.max(C,1.2):u.entry.kind==="shrub"?Math.max(C,1.22):C;return D+(H-D)*m},K=(u,m)=>{for(let b=0;b<V.length;b++){let E=V[b],C=u-E.ux,D=m-E.uy;if(C*C+D*D<E.coreR2)return!0}return!1},$=(u,m,b,E,C)=>{if(b.length===0)return!0;let D=256*.5-(C+Math.min(74,E*.72));for(let H=0;H<b.length;H++){let[z,ne]=Ao[b[H]];if(u*z+m*ne>D)return!1}return!0},ie=(u,m,b,E)=>{if(p.length===0||b.isWaterBoulder)return!1;let C=v(u,m);return C===1/0?!1:b.isReed?C<21:C<24+Math.min(38,E*.45)},ce=(u,m,b,E,C,D,H,z,ne=null,J,ee=[],ae=34)=>{let fe=u.entry,Ee=J??u.edgeMargin,_e=Y(n,m.q,m.r,H*47+7),ve=N(u,_e,ne),ye=u.effectiveWidth*ve*.5,ge=u.pKind,We=u.pScale,Te=u.minSpacing,De=u.isCanopy,Oe=fe.kind==="tree";for(let Ne=0;Ne<28;Ne++){let{dx:Ie,dy:qe}=Rn(n,m.q,m.r,ge,H,Ne);if(!or(Ie,qe,Ee)||!$(Ie,qe,ee,ye,ae)||Oe&&Br(D,Ie,qe))continue;let Be=b+Ie,Ke=E+qe;if(K(Be,Ke)||ie(Be,Ke,u,ye))continue;let Ge=!1;for(let q=0;q<C.length;q++){let j=C[q],he=Math.sqrt(We*j.pScale),P=De&&j.isCanopy,O=P?z:Math.max(.85,z),te=Math.max(P&&O<.6?10:14,Math.max(Te,j.minSpacing)*O*he);!P&&(u.isBoulder||j.isBoulder)&&(te=Math.max(te,(ye+j.visualHalfW)*.56));let X=Be-j.x,pe=Ke-j.y;if(X*X+pe*pe<te*te){Ge=!0;break}}if(Ge)continue;let k=G(Be,Ke);return M(u,m.q,m.r,Be,Ke,ve,k,C),{ux:Be,uy:Ke,scale:ve,halfW:ye}}return null},Z=(u,m,b,E,C,D,H,z,ne,J,ee,ae,fe,Ee,_e,ve=[],ye=34)=>{let ge=_e??u.edgeMargin,We=Y(n,m.q,m.r,fe*53+13),Te=N(u,We,J),De=u.effectiveWidth*Te*.5,Oe=u.pScale,Ne=u.minSpacing,Ie=u.entry.kind==="tree",qe=Y(n,m.q,m.r,fe*61+19)*Math.PI*2,Be=Math.max(z,H*.68+De*.44),Ke=Math.max(ne,Be+28);for(let Ge=0;Ge<20;Ge++){let k=Y(n,m.q,m.r,fe*71+Ge*11+3),q=Y(n,m.q,m.r,fe*73+Ge*13+5),j=qe+Ge*2.3999632+(q-.5)*.42,he=Be+(Ke-Be)*k,P=C+Math.cos(j)*he,O=D+Math.sin(j)*he*.78,te=P-b,X=O-E;if(!or(te,X,ge)||!$(te,X,ve,De,ye)||Ie&&Br(ae,te,X)||K(P,O)||ie(P,O,u,De))continue;let pe=!1;for(let se=0;se<ee.length;se++){let xe=ee[se],He=Math.sqrt(Oe*xe.pScale),Ce=Math.max(10,Math.max(Ne,xe.minSpacing)*Ee*He);(u.isBoulder||xe.isBoulder)&&(Ce=Math.max(Ce,(De+xe.visualHalfW)*.56));let Xe=P-xe.x,ct=O-xe.y;if(Xe*Xe+ct*ct<Ce*Ce){pe=!0;break}}if(pe)continue;let le=G(P,O);return M(u,m.q,m.r,P,O,Te,le,ee),{ux:P,uy:O,scale:Te,halfW:De}}return null},S=(u,m)=>{for(let b=-2;b<=2;b++)for(let E=-2;E<=2;E++){if(tt(0,0,E,b)>2)continue;let C=this.lookupRawHex(u+E,m+b);if(C&&C.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let u=this.waterBoulderCandidates;for(let m of l){if(m.occupied||!Dt.has(m.terrainId)||m.terrainId!=="coastal_water"&&!S(m.q,m.r))continue;let b=.45+1.2*L(m.q,m.r,3.2,4107),E=m.terrainId==="coastal_water"?.27:m.terrainId==="stormy_ocean"?.19:.15,C=Math.min(.48,E*b);if(Y(n,m.q,m.r,4111)>=C)continue;let D=[];for(let _e=0;_e<6;_e++){let[ve,ye]=Re[_e],ge=this.lookupRawHex(m.q+ve,m.r+ye);ge&&!this.isWaterTerrain(ge.terrainId)&&D.push(_e)}let H=256*(m.q+m.r*.5),z=$e*m.r,ne=[];for(let _e=-1;_e<=1;_e++)for(let ve=-1;ve<=1;ve++){let ye=g.get(Ae(m.q+ve,m.r+_e));if(ye)for(let ge=0;ge<ye.length;ge++)ne.push(ye[ge])}let J=Math.floor(Y(n,m.q,m.r,4113)*u.length),ee=u[J%u.length],ae=1,fe=ce(ee,m,H,z,ne,void 0,ae++,.85,null,20,D,30);if(!fe)continue;let Ee=Y(n,m.q,m.r,4117);if(Ee<.48){let _e=Ee<.18?2:1;for(let ve=0;ve<_e;ve++){let ye=Math.floor(Y(n,m.q,m.r,4121+ve*7)*u.length),ge=u[ye%u.length],We=Y(n,m.q,m.r,4129+ve*11),Te=Math.max(.55,Math.min(2.35,fe.scale*(.4+.46*We)));Z(ge,m,H,z,fe.ux,fe.uy,fe.halfW,Math.max(24,fe.scale*20),Math.max(64,fe.scale*38),Te,ne,void 0,ae++,.62,18,D,30)}}}}let F=this.forestConfig.mode,w=this.forestConfig.openTreeChance;for(let u of l){let m=Ae(u.q,u.r);if(u.occupied||W.has(m)||this.isWaterTerrain(u.terrainId))continue;let b=s.get(m);if(En(n,u.q,u.r,b))continue;let E=[],C=[];for(let Q=0;Q<6;Q++){let[oe,we]=Re[Q],re=this.lookupRawHex(u.q+oe,u.r+we);re&&(E.push(re.terrainId),this.isWaterTerrain(re.terrainId)&&C.push(Q))}let D=b?.forestClass??"none",H=D==="dense_forest"||D==="light_forest",z=D==="light_forest"||!H&&(b?.edgeInfluence??0)>.1,ne=!!(u.riverEdges&&u.riverEdges.length>0),J=un.has(u.terrainId),ee=Wo.has(u.terrainId),ae=J||u.terrainId==="semi_desert"||u.terrainId==="savanna",fe=H?this.candidatesByTerrainForest.get(u.terrainId)??this.allCandidates:this.candidatesByTerrain.get(u.terrainId)??this.allCandidates;if(fe.length===0)continue;let Ee={baseBiome:u.terrainId,biome:b?.biome??u.terrainId,forestClass:D,neighborTypes:E,hasRiverEdge:ne},_e=Ft.has(u.terrainId),ve=[],ye=[],ge=[],We=[],Te=[],De=[],Oe=[],Ne=!1;for(let Q=0;Q<fe.length;Q++){let oe=fe[Q],we=oe.entry;Mn(we.family,b)&&xn(we,oe.allowedTypes,Ee,this.manifest,oe.pre)&&(u.terrainId==="tundra"&&we.family==="snow_conifers"&&B(oe,u.q,u.r,973)>=.02||(Ne=!0,oe.isCanopy?_e&&(we.family==="palms"||oe.isAcacia)?ve.push(oe):ye.push(oe):oe.isBoulder?(ge.push(oe),oe.isWarmBoulder&&We.push(oe)):oe.isDryPatch?Te.push(oe):we.family==="snow"?De.push(oe):Oe.push(oe)))}if(!Ne)continue;ye.sort((Q,oe)=>{let we=Q.entry.placement,re=oe.entry.placement,ue=B(Q,u.q,u.r,301)/Math.max(.04,(we.density??.12)*Math.min(1,we.weight??1)),be=B(oe,u.q,u.r,301)/Math.max(.04,(re.density??.12)*Math.min(1,re.weight??1));return ue-be}),Oe.sort((Q,oe)=>B(Q,u.q,u.r,302)-B(oe,u.q,u.r,302));let Ie=Oe.filter(Q=>(Q.pKind==="shrub"||Q.pKind==="ground_cover")&&!Q.isAccent&&!Q.accentGroup&&!(J&&(Q.isBush20to29||Q.isHerb))),qe=Sn(b);qe>1&&Ut(n,u.q,u.r,"tree")<.58&&qe--;let Be=Cn(b),Ke=L(u.q,u.r,4.2,5107),Ge=L(u.q,u.r,1.9,5119),k=Math.pow(Ke*.68+Ge*.32,1.35),q=H?1:.14+1.76*k,j=H?Be:Math.max(Be,10),he=F==="canopy"?D==="dense_forest"?.34:D==="light_forest"?.59:.88:F==="dense"?D==="dense_forest"?.52:D==="light_forest"?.73:1:D==="dense_forest"?.72:D==="light_forest"?.92:1,P=256*(u.q+u.r*.5),O=$e*u.r,te=[];for(let Q=-1;Q<=1;Q++)for(let oe=-1;oe<=1;oe++){let we=g.get(Ae(u.q+oe,u.r+Q));if(we)for(let re=0;re<we.length;re++)te.push(we[re])}let X=0,pe=0,le=0,se=1,xe=(Q,oe)=>{if(H||X>=j)return;let we=Y(n,u.q,u.r,5201+se*17);if(oe.length>0&&we<.46){let be=q>1.08&&we<.2?2:1;for(let me=0;me<be&&X<j;me++){let Me=Math.floor(Y(n,u.q,u.r,5211+me*7)*oe.length),de=oe[Me%oe.length],Fe=Y(n,u.q,u.r,5221+me*9),ke=Math.max(.5,Math.min(1.85,Q.scale*(.38+.44*Fe)));Z(de,u,P,O,Q.ux,Q.uy,Q.halfW,Math.max(20,Q.halfW*.72),Math.max(52,Q.halfW*1.45),ke,te,b,se++,.55,void 0,C)&&X++}}let re=ae&&Te.length>0?J?Te:[...Te,...Ie]:Ie,ue=Y(n,u.q,u.r,5237+se*13);if(re.length>0&&ue<.62){let be=1+Math.floor(Y(n,u.q,u.r,5243)*(q>1.05?2:1));for(let me=0;me<be&&X<j;me++){let Me=Math.floor(Y(n,u.q,u.r,5251+me*11)*re.length),de=re[Me%re.length],Fe=Y(n,u.q,u.r,5261+me*7),ke=de.entry.scaleRange[0]??.85,Ye=de.entry.scaleRange[1]??1.15,Ve=(ke+(Ye-ke)*Fe)*.92;Z(de,u,P,O,Q.ux,Q.uy,Q.halfW,Math.max(20,Q.halfW*.76),Math.max(54,Q.halfW*1.38+18),Ve,te,b,se++,.5,void 0,C)&&X++}}},Ce=We.length>0&&Y(n,u.q,u.r,1607)<.85?We:ge,Xe=Ce.reduce((Q,oe)=>Math.max(Q,oe.entry.placement?.density??0),0),ct=H?1:.72+.48*q,Ze=Math.min(.44,Xe*(We.length>0?2.5:1.15)*ct);if(We.length>0&&X<j&&Y(n,u.q,u.r,1601)<Ze){let Q=Math.floor(Y(n,u.q,u.r,1602)*Ce.length);for(let oe=0;oe<Ce.length;oe++){let we=Ce[(Q+oe)%Ce.length],re=ce(we,u,P,O,te,b,se++,1,null,void 0,C);if(re){X++,xe(re,Ce);break}}}if(ve.length>0&&X<j&&Y(n,u.q,u.r,1751)<.065*(.75+.45*q)){let Q=ve.filter(ue=>ue.entry.family==="palms"),oe=ve.filter(ue=>ue.isAcacia),we=Y(n,u.q,u.r,1752)<.5?[Q,oe]:[oe,Q],re=!1;for(let ue of we){if(!ue.length||re)continue;let be=Math.floor(Y(n,u.q,u.r,1753)*ue.length);for(let me=0;me<ue.length;me++){let Me=ue[(be+me)%ue.length],de=ce(Me,u,P,O,te,b,se++,1,null,void 0,C);if(de){if(X++,re=!0,Y(n,u.q,u.r,1759)<.45){let Fe=1+Math.floor(Y(n,u.q,u.r,1763)*2);for(let ke=0;ke<Fe&&X<j;ke++){let Ye=ue[(be+ke+1)%ue.length];Z(Ye,u,P,O,de.ux,de.uy,de.halfW,22,56,null,te,b,se++,.54,void 0,C)&&X++}}break}}}}let Qe=Math.min(.58,fn(u.terrainId)*(.76+.44*q));if(Te.length>0&&X<j&&Y(n,u.q,u.r,1831)<Qe){let Q=Math.floor(Y(n,u.q,u.r,1832)*Te.length);for(let oe=0;oe<Te.length;oe++){let we=Te[(Q+oe)%Te.length],re=ce(we,u,P,O,te,b,se++,.9,null,void 0,C);if(re){X++;let ue=Y(n,u.q,u.r,1837);if(!H&&ue<.52&&X<j){let be=ue<.22&&q>.95?2:1;for(let me=0;me<be&&X<j;me++){let Me=Te[(Q+1+me+Math.floor(ue*11))%Te.length],de=Y(n,u.q,u.r,1843+me*7),Fe=Me.entry.scaleRange[0]??.8,ke=Me.entry.scaleRange[1]??1.15,Ye=(Fe+(ke-Fe)*de)*(.76+.3*de);Z(Me,u,P,O,re.ux,re.uy,re.halfW,16,44,Ye,te,b,se++,.48,void 0,C)&&X++}}break}}}let ot=F==="canopy"&&H?b?.canopyCoverage??0:0,pt=ot?Math.max(qe,Be-2):qe;for(let Q=0;Q<pt&&X<Be&&ye.length>0&&!(pe>=qe&&(!ot||le>=ot));Q++){let oe=ye[Q%Math.min(ye.length,5)],we=null;if(z){let ue=Y(n,u.q,u.r,se*47+7);we=N(oe,ue,null)*(.76+.16*ue)}let re=ce(oe,u,P,O,te,b,se++,he,we,void 0,C);re&&(pe++,X++,le+=oe.crownAreaRatio*re.scale*re.scale)}let Mr=Math.min(.68,w*(.62+.62*q));if(!qe&&!b?.glade&&ye.length>0&&w>0&&B(ye[0],u.q,u.r,311)<Mr&&X<j){let Q=ce(ye[0],u,P,O,te,b,se++,1,null,void 0,C);if(Q){X++;let oe=Y(n,u.q,u.r,5301),we=w>.25?.64:.52;if(oe<we){let re=1+Math.floor(Y(n,u.q,u.r,5303)*3),ue=Math.min(ye.length,4);for(let be=0;be<re&&X<j;be++){let me=ye[(be+1)%ue];Z(me,u,P,O,Q.ux,Q.uy,Q.halfW,24,62,null,te,b,se++,.52,void 0,C)&&X++}if(Ie.length>0&&X<j){let be=Y(n,u.q,u.r,5311)<.55?2:1;for(let me=0;me<be&&X<j;me++){let Me=Math.floor(Y(n,u.q,u.r,5317+me*7)*Ie.length),de=Ie[Me%Ie.length];Z(de,u,P,O,Q.ux,Q.uy,Q.halfW,18,48,null,te,b,se++,.48,void 0,C)&&X++}}else if(ge.length>0&&X<j&&Y(n,u.q,u.r,5323)<.35){let be=ge[Math.floor(Y(n,u.q,u.r,5329)*ge.length)];Z(be,u,P,O,Q.ux,Q.uy,Q.halfW,20,48,.62+Y(n,u.q,u.r,5333)*.45,te,b,se++,.52,void 0,C)&&X++}}}}let Rr=H?1:.72+.48*q;if(We.length===0&&ge.length>0&&X<j&&Y(n,u.q,u.r,1601)<Math.min(.36,Xe*1.15*Rr)){let Q=Math.floor(Y(n,u.q,u.r,1602)*ge.length);for(let oe=0;oe<ge.length;oe++){let we=ge[(Q+oe)%ge.length],re=ce(we,u,P,O,te,b,se++,1,null,void 0,C);if(re){X++,xe(re,ge);break}}}if(De.length>0&&X<j){let Q=u.terrainId==="snowfields"||u.terrainId==="frozen_tundra"?.58:u.terrainId==="highland"?.25:.14;if(Y(n,u.q,u.r,1643)<Q){let oe=Math.floor(Y(n,u.q,u.r,1644)*De.length);for(let we=0;we<De.length;we++){let re=De[(oe+we)%De.length];if(ce(re,u,P,O,te,b,se++,he,null,void 0,C)){X++;break}}}}if(Oe.length>0&&X<j){let Q=D==="dense_forest"?1.2:z?1.28:.58+.62*q,oe=Ut(n,u.q,u.r,"shrub"),we=Ut(n,u.q,u.r,"ground_cover"),re=Ut(n,u.q,u.r,"other"),ue=!1,be=!1,me=!1,Me=Oe.filter(de=>de.isReed);for(let de of Oe){if(X>=j)break;let Fe=de.entry,ke=de.accentGroup;if(ke&&(ue||I[ke]>=A[ke]))continue;let Ye=de.pKind==="shrub"?oe:de.pKind==="ground_cover"?we:re,Ve=1;de.isBush20to29?J?Ve=.022:u.terrainId==="savanna"?Ve=.55:u.terrainId==="semi_desert"?Ve=.92:(ko.has(u.terrainId)||H)&&(Ve=1.32):de.isHerb&&J?Ve=.3:de.isReed&&(ee?Ve=1.65:(ne||C.length>0)&&(Ve=1.35));let _t=Math.min(.86,(Fe.placement?.density??.15)*Math.min(1,Fe.placement?.weight??1)*Q*de.chanceMult*Ve*Ye);if(B(de,u.q,u.r,312)>=_t)continue;let je=ce(de,u,P,O,te,b,se++,he,null,void 0,C);if(je){if(X++,ke)I[ke]++,ue=!0;else if(de.isAccent)ue=!0;else if(de.isReed&&!me&&Me.length>0&&X<j){if(Y(n,u.q,u.r,5501+se*13)<.74){me=!0;let bt=1+Math.floor(Y(n,u.q,u.r,5507)*3);for(let it=0;it<bt&&X<j;it++){let Er=Math.floor(Y(n,u.q,u.r,5519+it*7)*Me.length),rt=Me[Er%Me.length],zt=Y(n,u.q,u.r,5527+it*11),St=rt.entry.scaleRange[0]??.85,Yt=rt.entry.scaleRange[1]??1.15,jt=(St+(Yt-St)*zt)*(.78+.3*zt);Z(rt,u,P,O,je.ux,je.uy,je.halfW,14,38,jt,te,b,se++,.42,void 0,C)&&X++}}}else if(!H&&!be&&de.pKind==="shrub"&&!(J&&de.isBush20to29)&&Ie.length>0&&X<j){let yt=Y(n,u.q,u.r,5401+se*19);if(yt<.5){be=!0;let bt=Ie.filter(rt=>rt.entry.family===Fe.family),it=bt.length>0?bt:Ie,Er=yt<.22&&q>.9?2:1;for(let rt=0;rt<Er&&X<j;rt++){let zt=Math.floor(Y(n,u.q,u.r,5413+rt*11)*it.length),St=it[zt%it.length],Yt=Y(n,u.q,u.r,5423+rt*7),jt=St.entry.scaleRange[0]??.85,io=St.entry.scaleRange[1]??1.15,so=(jt+(io-jt)*Yt)*(.72+.3*Yt);Z(St,u,P,O,je.ux,je.uy,je.halfW,15,40,so,te,b,se++,.46,void 0,C)&&X++}if(ge.length>0&&X<j&&Y(n,u.q,u.r,5437)<.22){let rt=ge[Math.floor(Y(n,u.q,u.r,5441)*ge.length)];Z(rt,u,P,O,je.ux,je.uy,je.halfW,18,42,.55+Y(n,u.q,u.r,5443)*.48,te,b,se++,.52,void 0,C)&&X++}}}}}}if(ne&&!J&&!Lt.has(u.terrainId)&&this.reedCandidates.length>0&&X<j&&Y(n,u.q,u.r,5601)<.68){let Q=this.reedCandidates,oe=Math.floor(Y(n,u.q,u.r,5609)*Q.length),we=Q[oe%Q.length],re=ce(we,u,P,O,te,b,se++,.7,null,void 0,C);if(re){X++;let ue=1+Math.floor(Y(n,u.q,u.r,5617)*2);for(let be=0;be<ue&&X<j;be++){let me=Q[(oe+be+1)%Q.length];Z(me,u,P,O,re.ux,re.uy,re.halfW,14,36,null,te,b,se++,.42,void 0,C)&&X++}}}}let R=[];if(this.decalCandidatesByTerrain.size>0)for(let u of l){if(this.isWaterTerrain(u.terrainId)||u.reliefClass==="mountain")continue;let m=this.decalCandidatesByTerrain.get(u.terrainId);if(!m||m.length===0)continue;let b=256*(u.q+u.r*.5),E=$e*u.r,C=0;for(let D=0;D<m.length&&C<3;D++){let H=m[D],z=Math.min(.75,(H.entry.placement?.density??.35)*Math.min(1,H.entry.placement?.weight??1));if(Y(n,u.q,u.r,H.pathSalt+7103)>=z)continue;let ne=(Y(n,u.q,u.r,H.pathSalt+7121+C*7)-.5)*148,J=(Y(n,u.q,u.r,H.pathSalt+7129+C*7)-.5)*148,ee=b+ne,ae=E+J;if(!or(ne,J,28)||v(ee,ae)<28)continue;let fe=Y(n,u.q,u.r,H.pathSalt+7151),Ee=H.entry.scaleRange[0]??.85,_e=H.entry.scaleRange[1]??1.15,ve=Ee+(_e-Ee)*fe;R.push(this.createPlacedSprite(H,u.q,u.r,ee,ae,ve,G(ee,ae))),C++}}return T.sort((u,m)=>(u.sortY??u.y)-(m.sortY??m.y)||u.x-m.x),{cq:e,cr:r,key:vt(e,r),originQ:o,originR:i,cells:a,sprites:T,decals:R,shorelines:d,riverRoutes:h}}};var Et=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var Bn=Tr(Kt());var ht=32,Lo=32;function Io(t){return t==="mountain"||t==="hills"?t:"flat"}function qn(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function Un(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Et},r=Bn.default.createPointSampler(t.seed,e),o=t.halfExtent,i=t.fogPolicy??(()=>2),n=t.overrides,a=new Map,c=(s,d)=>{let f=`${s},${d}`,h=a.get(f);if(h)return a.delete(f),a.set(f,h),h;let p=s*ht,v=d*ht,y=r.traceRivers(p,v,ht,ht),_=[],U=new Set;for(let T=0;T<y.routes.length;T++){let W=y.routes[T];if(!W||W.length<2)continue;let V=W[0],g=W[W.length-1],M=`${V[0]},${V[1]}->${g[0]},${g[1]}:${W.length}`;U.has(M)||(U.add(M),_.push({id:M,hexes:W}))}let G={routes:_,edgesByKey:y.edgesByKey};for(a.set(f,G);a.size>Lo;){let T=a.keys().next().value;if(T===void 0)break;a.delete(T)}return G},l=({cq:s,cr:d,chunkSize:f})=>{let h=s*f,p=d*f,v=[];for(let y=0;y<f;y++){let _=p+y;if(o!==void 0&&Math.abs(_)>o)continue;let U=Math.floor(_/ht);for(let G=0;G<f;G++){let T=h+G;if(o!==void 0&&Math.abs(T)>o)continue;let W=Math.floor(T/ht),V=c(W,U),g=r.sampleCell(T,_),M=Ae(T,_),x=i(T,_),A=n?.get(M),I=A?.reliefClass??Io(g.reliefClass),L=A?.forestDensity!==void 0?A.forestDensity:g.forestDensity>0?g.forestDensity:0,B=A?.forestClass??(A?.forestDensity!==void 0?qn(void 0,L):qn(g.forestClass,L)),N=V.edgesByKey.get(M);v.push({q:T,r:_,terrainId:A?.terrainId??g.terrainId,reliefClass:I,hillProfile:A?.hillProfile!==void 0?A.hillProfile:I==="hills"?g.hillProfile??"rounded":null,hillStrength:A?.hillStrength!==void 0?A.hillStrength:I==="hills"?Math.max(.35,g.hillStrength||.72):0,forestClass:B,forestDensity:L,fogState:A?.fogState??x,occupied:A?.occupied,riverEdges:A?.riverEdges!==void 0?A.riverEdges:N&&N.length>0?[...N]:void 0})}}return v};return l.getRiverRoutesForChunk=(s,d,f)=>{let h=s*f,p=h+f-1,v=d*f,y=v+f-1,_=Math.floor(h/ht),U=Math.floor(p/ht),G=Math.floor(v/ht),T=Math.floor(y/ht),W=[],V=new Set;for(let g=G;g<=T;g++)for(let M=_;M<=U;M++){let x=c(M,g);for(let A of x.routes){if(V.has(A.id))continue;let I=!1;for(let L=0;L<A.hexes.length;L++){let[B,N]=A.hexes[L];if(B>=h&&B<=p&&N>=v&&N<=y){I=!0;break}}I&&(V.add(A.id),W.push(A))}}return W},l}var On=Tr(Kt());var Le=[.24,.62,.96],dr=[.92,.28,.3],Do=[.22,.78,.48],Gn=[.94,.72,.22],qo=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function fr(t){return t.surfaceClass!=="land"}function wt(t){return!fr(t)&&t.reliefClass!=="mountain"}function Xt(t,e,r,o){let i=t.sampleCell(e,r);if(o==="harbor"){if(!fr(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let c=[];for(let[l,s]of Re){let d=t.sampleCell(e+l,r+s);wt(d)&&c.push({q:e+l,r:r+s})}return{center:{q:e,r},buildingKind:o,valid:c.length>0,yieldPercent:100,bonusHexes:c,reason:c.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!wt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:i.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],a=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let c=-2;c<=2;c++)for(let l=-2;l<=2;l++){if(tt(0,0,l,c)>2)continue;let s=e+l,d=r+c,f=t.sampleCell(s,d);o==="farm"?wt(f)&&qo.has(f.terrainId)&&(n.push({q:s,r:d}),a+=5):o==="lumber_camp"?wt(f)&&f.forestDensity>.08&&(n.push({q:s,r:d}),a+=5):o==="quarry"&&(f.reliefClass==="hills"||f.reliefClass==="mountain")&&(n.push({q:s,r:d}),a+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,a),bonusHexes:n}}function nt(t,e,r,o){for(let i=0;i<=32;i++)for(let n=-i;n<=i;n++)for(let a=-i;a<=i;a++){if(tt(0,0,a,n)!==i)continue;let c=e+a,l=r+n,s=t.sampleCell(c,l);if(wt(s)&&(!o||o(s)))return{q:c,r:l}}return{q:e,r}}function Bo(t,e,r){for(let o=0;o<=45;o++)for(let i=-o;i<=o;i++)for(let n=-o;n<=o;n++){if(tt(0,0,n,i)!==o)continue;let a=e+n,c=r+i,l=t.sampleCell(a,c);if(fr(l))for(let[s,d]of Re){let f=t.sampleCell(a+s,c+d);if(wt(f))return{water:{q:a,r:c},land:{q:a+s,r:c+d}}}}return{water:{q:e,r},land:{q:e+1,r}}}function gt(t,e,r,o,i,n,a,c=!1){let l=[];for(let s=-i;s<=i;s++)for(let d=-i;d<=i;d++){if(tt(0,0,d,s)>i)continue;let f=o.q+d,h=o.r+s,p=Ae(f,h);if(r.has(p))continue;let v=t.sampleCell(f,h);!c&&!wt(v)||v.reliefClass!=="mountain"&&(r.add(p),e.push({q:f,r:h,ownerId:n,color:a}),l.push({q:f,r:h}))}return l}function Tt(t,e,r){let o=[],i=t.q,n=t.r,a=0;for(;(i!==e.q||n!==e.r)&&a++<40;){let c=0,l=1/0;for(let f=0;f<6;f++){let h=i+Re[f][0],p=n+Re[f][1],v=tt(h,p,e.q,e.r);v<l&&(l=v,c=f)}let s=i+Re[c][0],d=n+Re[c][1];o.push({q1:i,r1:n,q2:s,r2:d,tier:r}),i=s,n=d}return o}function $r(t,e,r=0,o="player"){let i=new Set(t.map(l=>Ae(l.q,l.r))),n=new Set,a=[],c=0;for(let l of t)for(let s=0;s<6;s++){let d=l.q+Re[s][0],f=l.r+Re[s][1];if(i.has(Ae(d,f)))continue;let h=Wt(l.q,l.r,d,f);n.has(h.key)||(n.add(h.key),c++,a.push({q1:h.q1,r1:h.r1,q2:h.q2,r2:h.r2,kind:e,isGate:r>0&&c%r===0,ownerId:o}))}return a}function Hn(t,e,r){let o=[],i=t,n=e,a=0;for(let c=0;c<r;c++)if(o.push({q:i,r:n,dir:a}),c%2===0)a=(a+1)%6;else{let l=(a+1)%6;i+=Re[l][0],n+=Re[l][1],a=(a+5)%6}return o}function Nn(t,e="vedras-welt-01",r){let o=r===void 0?Et:r===null?void 0:r,i=On.default.createPointSampler(e,o);if(t==="fresh-start"){let g=nt(i,0,0),M=[];return gt(i,M,new Set,g,1,"player",Le),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:g,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:g.q,r:g.r,visR:3,expR:5}],scene:{territory:M,buildings:[{id:"cap-1",q:g.q,r:g.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:Le}],units:[{id:"scout-1",q:g.q+1,r:g.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:Le,marchPath:[{q:g.q+1,r:g.r},{q:g.q+2,r:g.r},{q:g.q+3,r:g.r-1}]}],sites:[{id:"site-1",q:g.q-2,r:g.r+1,family:"fauna",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let g=nt(i,108,-70),M=nt(i,g.q+7,g.r-1),x=[],A=new Set,I=gt(i,x,A,g,3,"player",Le);gt(i,x,A,M,3,"enemy",dr);let L=nt(i,g.q+2,g.r),B=$r(I.filter(ce=>tt(ce.q,ce.r,g.q,g.r)<=1),"stone",3,"player");B.length>0&&(B[0].breached=!0);let N=[...Tt(g,L,"stone"),...Tt(L,M,"packed")],K={q:L.q+2,r:L.r},$=[{id:"blue-cap",q:g.q,r:g.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:Le},{id:"blue-fort",q:L.q,r:L.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:Le,rangeRadius:2},{id:"red-cap",q:M.q,r:M.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:dr}],ie=[{id:"u-blue-def",q:L.q,r:L.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:Le,marchPath:[{q:g.q+1,r:g.r+1},{q:L.q,r:L.r+1}]},{id:"u-red-siege",q:K.q,r:K.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:dr,inCombat:!0,marchPath:[K,{q:L.q+1,r:L.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((g.q+M.q)/2),r:Math.round((g.r+M.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:g.q,r:g.r,visR:6,expR:12},{q:L.q,r:L.r,visR:5,expR:10}],scene:{territory:x,rivers:Hn(g.q-2,g.r-3,7),roads:N,walls:B,buildings:$,units:ie}}}if(t==="coastal-harbors"){let g=Bo(i,2,-2),M=[],x=new Set;gt(i,M,x,g.land,2,"player",Le,!1),gt(i,M,x,g.water,2,"player",Le,!0);let A={q:g.water.q+1,r:g.water.r};for(let[B,N]of Re){let K=i.sampleCell(g.water.q+B,g.water.r+N);if(fr(K)){A={q:g.water.q+B,r:g.water.r+N};break}}let I=[{id:"coastal-cap",q:g.land.q,r:g.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:Le},{id:"harbor-1",q:g.water.q,r:g.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:Le}],L=[{id:"boat-1",q:A.q,r:A.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:Le,marchPath:[g.water,A]},{id:"scout-sea",q:g.water.q,r:g.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:Le}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:g.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:g.water.q,r:g.water.r,visR:6,expR:11}],scene:{territory:M,roads:Tt(g.land,{q:g.land.q-2,r:g.land.r+1},"packed"),buildings:I,units:L}}}if(t==="strategic-empires"){let g=[{id:"player",name:"Krone Vedra",color:Le,q:0,r:0},{id:"crimson",name:"Blutmark",color:dr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:Do,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:Gn,q:8,r:10}],M=[],x=new Set,A=[],I=[];for(let L of g){let B=nt(i,L.q,L.r);gt(i,M,x,B,5,L.id,L.color),A.push({id:`emp-${L.id}`,q:B.q,r:B.r,kind:"capital",label:L.name,level:12,ownerId:L.id,factionColor:L.color}),I.push({id:`army-${L.id}`,q:B.q+2,r:B.r-1,kind:"army",label:`Heer ${L.name}`,strength:520,ownerId:L.id,factionColor:L.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:g.map(L=>({q:L.q,r:L.r,visR:9,expR:15})),scene:{territory:M,buildings:A,units:I}}}let n=nt(i,110,-70),a=nt(i,n.q+4,n.r-1),c=nt(i,n.q-3,n.r+3),l=[],s=new Set,d=gt(i,l,s,n,2,"player",Le);gt(i,l,s,a,2,"player",Le),gt(i,l,s,c,2,"player",Le);let f=nt(i,n.q+1,n.r),h=nt(i,n.q-1,n.r,g=>g.forestDensity>.1),p=nt(i,n.q,n.r+2),v=nt(i,a.q+1,a.r),y=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:Le},{id:"town-2",q:a.q,r:a.r,kind:"settlement",label:"Ostfurt",level:6,ownerId:"player",factionColor:Le},{id:"town-3",q:c.q,r:c.r,kind:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:Le,constructionProgress:.62},{id:"farm-1",q:f.q,r:f.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:Le,yieldPercent:Xt(i,f.q,f.r,"farm").yieldPercent},{id:"lumber-1",q:h.q,r:h.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:Le,yieldPercent:Xt(i,h.q,h.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:p.q,r:p.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:Le,yieldPercent:Xt(i,p.q,p.r,"quarry").yieldPercent},{id:"fort-1",q:v.q,r:v.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:Le,rangeRadius:2}],_=d.filter(g=>tt(g.q,g.r,n.q,n.r)===0),U=$r(_,"stone",2,"player"),G=$r([c],"palisade",3,"player"),T=[...Tt(n,a,"stone"),...Tt(n,c,"packed"),...Tt(n,p,"trail")],W=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:Gn,marchPath:[n,{q:n.q+2,r:n.r-1},a]},{id:"army-1",q:a.q,r:a.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:Le}],V=[{id:"site-mine",q:n.q+2,r:n.r+2,family:"forgotten_mine",label:"Vergessene Mine"},{id:"site-obelisk",q:n.q-2,r:n.r-1,family:"obelisk",label:"Alter Obelisk"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:a.q,r:a.r,visR:4,expR:8},{q:c.q,r:c.r,visR:4,expR:8}],scene:{territory:l,rivers:Hn(n.q-2,n.r-2,8),roads:T,walls:[...U,...G],buildings:y,units:W,sites:V}}}var Xn=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function Vn(t,e,r,o,i){if(o==="all-visible"||i?.has(Ae(e,r)))return 2;let n=0;for(let a of t.visibleCenters){let c=tt(a.q,a.r,e,r);if(c<=a.visR)return 2;c<=a.expR&&n<1&&(n=1)}return n}function Uo(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function hr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function Kr(t,e,r,o,i){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&i>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,i)),n}async function Zr(t,e,r="auto",o){let i=e.replace(/\/+$/,""),n=await fetch(`${i}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${i}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let a=await n.json();if(a.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${a.schema}`);let c=Uo(t,r),l=c==="mobile"?Math.min(256,a.terrain.textureSize):a.terrain.textureSize,s=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),d=s?t.getParameter(s.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,f=a.terrain.layers.length+a.nature.pages.length+a.shadows.pages.length+a.infrastructure.pages.length+(a.clouds.files.length>0?1:0),h=0,p=$=>{h+=1,o?.(h,f,$)},v=t.createTexture();if(!v)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,v);let y=Math.max(1,a.terrain.layers.length),_=Math.floor(Math.log2(l))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,_,t.RGBA8,l,l,y),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let U=l!==a.terrain.textureSize?{width:l,height:l}:void 0,G=a.terrain.layers;for(let $=0;$<G.length;$+=8){let ie=G.slice($,$+8),ce=await Promise.all(ie.map(Z=>hr(`${i}/${Z.file}`,U)));t.bindTexture(t.TEXTURE_2D_ARRAY,v);for(let Z=0;Z<ie.length;Z++){let S=ce[Z];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,ie[Z].layer,l,l,1,t.RGBA,t.UNSIGNED_BYTE,S),S.close(),p(`Terrain ${ie[Z].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,v),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),s&&d>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,s.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,d));let T=c==="mobile"?.5:1,W=async($,ie)=>(await Promise.all($.map(Z=>hr(`${i}/${Z.file}`,T<1?{width:Math.max(256,Math.round(Z.width*T)),height:Math.max(256,Math.round(Z.height*T))}:void 0)))).map((Z,S)=>{let F=Kr(t,Z,t.CLAMP_TO_EDGE,s,d);return Z.close(),p(`${ie} ${S+1}/${$.length}`),F}),[V,g,M]=await Promise.all([W(a.nature.pages,"Natur-Atlas"),W(a.shadows.pages,"Schatten-Atlas"),W(a.infrastructure.pages,"Infra-Atlas")]),x=null,A=null;if(a.clouds.files.length>0){let $=a.clouds.files.find(S=>S.id.startsWith("cloud_base"))??a.clouds.files[0],ie=a.clouds.files.find(S=>S.id.startsWith("cloud_edge")),[ce,Z]=await Promise.all([hr(`${i}/${$.file}`),ie?hr(`${i}/${ie.file}`):Promise.resolve(null)]);x=Kr(t,ce,t.REPEAT,s,d),ce.close(),Z&&(A=Kr(t,Z,t.REPEAT,s,d),Z.close()),p("Nebel-Wolken")}let L=a.terrain.byType.forest_floor?.layers?.[0]??0,N=(a.terrain.byType.coastal_water??a.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:a,vramTier:c,terrainArray:v,terrainLayerSize:l,forestFloorLayer:L,coastalWaterLayer:N,naturePages:V,shadowPages:g,infraPages:M,cloudTexture:x,cloudEdgeTexture:A,dispose:()=>{t.deleteTexture(v);for(let $ of V)t.deleteTexture($);for(let $ of g)t.deleteTexture($);for(let $ of M)t.deleteTexture($);x&&t.deleteTexture(x),A&&t.deleteTexture(A)}}}var mr=.08,pr=2,zn=.15,Qr=.21;function Jr(t){return t>=Qr?0:t<=zn?1:(Qr-t)/(Qr-zn)}function Yn(t){return Jr(t)>=.5?"strategic":"detail"}function gr(t,e,r){return t<e?e:t>r?r:t}var br=class{constructor(e,r,o,i){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],i=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,a=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,a,this.pinchStartZoom*(i/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,i=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,i),this.state.x-=o/this.state.zoom,this.state.y-=i/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=Pt(r.x,r.y,this.state),i=et(o.x,o.y),n=`${i.q},${i.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(i))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,i=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,a]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=a,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=Pt(i.x,i.y,this.state),a=et(n.x,n.y);this.callbacks.onHexClick?.(a),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:a})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=i;let n=Pe(r.q,r.r),a=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:gr(o,mr,pr),viewportWidth:Math.max(1,a.width||e.clientWidth||1280),viewportHeight:Math.max(1,a.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),i=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*i)),a=Math.max(1,Math.round(o*i)),c=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==i||this.canvas.width!==n||this.canvas.height!==a;return c&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=i,this.canvas.width=n,this.canvas.height=a),c}centerOnHex(e,r,o){let i=Pe(e,r);this.state.x=i.x,this.state.y=i.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=gr(o,mr,pr)),this.callbacks.onChange()}setZoom(e){this.state.zoom=gr(e,mr,pr),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let i=gr(o,mr,pr);if(Math.abs(i-this.state.zoom)<1e-5)return;let n=Pt(e,r,this.state);this.state.zoom=i;let a=Pt(e,r,this.state);this.state.x+=n.x-a.x,this.state.y+=n.y-a.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var jn={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function vr(t,e,r){return t<e?e:t>r?r:t}function Go(t,e,r,o,i,n){let a=i-r,c=n-o,l=a*a+c*c,s=l>1e-6?vr(((t-r)*a+(e-o)*c)/l,0,1):0,d=r+s*a,f=o+s*c,h=t-d,p=e-f;return h*h+p*p}function en(t){if(!t)return jn;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let i of t.buildings){e.add(Ae(i.q,i.r));let n=Pe(i.q,i.r),a=i.kind==="capital"||i.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:a,minX:n.x-a-64,maxX:n.x+a+64,minY:n.y-a-64,maxY:n.y+a+64})}if(t.sites&&t.sites.length>0)for(let i of t.sites){let n=Pe(i.q,i.r),a=58;o.push({cx:n.x,cy:n.y,radius:a,minX:n.x-a-56,maxX:n.x+a+56,minY:n.y-a-56,maxY:n.y+a+56})}if(t.walls&&t.walls.length>0)for(let i of t.walls){let n=ut(i.q1,i.r1,i.q2,i.r2);if(n<0)continue;let{a,b:c}=st(i.q1,i.r1,n),l=i.isGate?i.kind==="stone"?24:20:i.kind==="stone"?18:14,s=i.kind==="stone"?26:16,d=s+64;r.push({ax:a.x,ay:a.y,bx:c.x,by:c.y,halfWidth:l,pierRadius:s,minX:Math.min(a.x,c.x)-d,maxX:Math.max(a.x,c.x)+d,minY:Math.min(a.y,c.y)-d,maxY:Math.max(a.y,c.y)+d,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let i of t.roads){let n=Pe(i.q1,i.r1),a=Pe(i.q2,i.r2),c=i.tier==="stone"?30:i.tier==="packed"?24:18,l=c+56;r.push({ax:n.x,ay:n.y,bx:a.x,by:a.y,halfWidth:c,pierRadius:c,minX:Math.min(n.x,a.x)-l,maxX:Math.max(n.x,a.x)+l,minY:Math.min(n.y,a.y)-l,maxY:Math.max(n.y,a.y)+l,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let i of t.rivers){let{a:n,b:a}=st(i.q,i.r,i.dir),c=22,l=c+48;r.push({ax:n.x,ay:n.y,bx:a.x,by:a.y,halfWidth:c,pierRadius:20,minX:Math.min(n.x,a.x)-l,maxX:Math.max(n.x,a.x)+l,minY:Math.min(n.y,a.y)-l,maxY:Math.max(n.y,a.y)+l,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?jn:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function tn(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(Ae(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,i=vr(t.width*.42,12,48),n=vr(t.width*.34,10,34),a=vr(t.width*.28,8,26),c=e.discs;for(let s=0;s<c.length;s++){let d=c[s];if(r<d.minX||r>d.maxX||o<d.minY||o>d.maxY)continue;let f=r-d.cx,h=o-d.cy,p=d.radius+n*.6;if(f*f+h*h<=p*p)return!0}let l=e.segments;for(let s=0;s<l.length;s++){let d=l[s];if(r<d.minX||r>d.maxX||o<d.minY||o>d.maxY)continue;let f=d.kind==="wall"?i:d.kind==="road"?n:a,h=d.halfWidth+f+(d.kind==="wall"?8:4);if(Go(r,o,d.ax,d.ay,d.bx,d.by)<=h*h)return!0;if(d.kind==="wall"){let p=d.pierRadius+i+6,v=p*p,y=r-d.ax,_=o-d.ay;if(y*y+_*_<=v)return!0;let U=r-d.bx,G=o-d.by;if(U*U+G*G<=v)return!0}}return!1}function Ho(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function yr(t,e,r,o,i,n,a=.86){t.font=`600 ${n}px system-ui, -apple-system, sans-serif`;let c=t.measureText(o),l=Math.max(6,n*.55),s=Math.max(3,n*.3),d=c.width+l*2,f=n+s*2,h=e-d*.5,p=r-f*.5,v=Math.min(8,f*.45);t.beginPath(),t.roundRect(h,p,d,f,v),t.fillStyle=`rgba(12, 17, 23, ${a})`,t.fill(),t.lineWidth=1.4,t.strokeStyle=Ho(i,.9),t.stroke(),t.fillStyle="#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5)}function $n(t){let{canvas:e,cam:r,scene:o,lookupFog:i,strategicBlend:n,timeSec:a}=t,c=Math.max(1,Math.round(r.viewportWidth*r.dpr)),l=Math.max(1,Math.round(r.viewportHeight*r.dpr));(e.width!==c||e.height!==l)&&(e.width=c,e.height=l);let s=e.getContext("2d");if(!s||(s.setTransform(r.dpr,0,0,r.dpr,0,0),s.clearRect(0,0,r.viewportWidth,r.viewportHeight),!o))return;let d=n>=.5;if(o.buildings)for(let f of o.buildings){let h=i(f.q,f.r);if(h===0)continue;let p=f.kind==="capital"||f.kind==="settlement",v=p||f.kind==="fortress"||f.kind==="harbor";if(d&&!v)continue;let y=Pe(f.q,f.r),_=At(y.x,y.y,r);if(_.x<-120||_.x>r.viewportWidth+120||_.y<-80||_.y>r.viewportHeight+80)continue;let U=typeof f.yieldPercent=="number"&&!d?` \xB7 ${f.yieldPercent}%`:"",G=p?`\u2605 ${f.label} (R${f.level})`:`${f.label} L${f.level}${U}`,T=d?-18:-Math.max(40,74*r.zoom);if(yr(s,_.x,_.y+T,G,f.factionColor,p?d?12:12.5:10.5,h===1?.65:.88),typeof f.constructionProgress=="number"&&f.constructionProgress>0&&f.constructionProgress<1&&!d){let g=_.x-27,M=_.y+T+13;s.fillStyle="rgba(10, 15, 22, 0.85)",s.fillRect(g,M,54,5),s.fillStyle="#f59e0b",s.fillRect(g+1,M+1,52*f.constructionProgress,3)}}if(o.sites&&!d&&r.zoom>=.45)for(let f of o.sites){if(i(f.q,f.r)===0)continue;let h=Pe(f.q,f.r),p=At(h.x,h.y,r);p.x<-80||p.x>r.viewportWidth+80||p.y<-50||p.y>r.viewportHeight+50||yr(s,p.x,p.y+20,f.label,[.85,.68,.35],10,.78)}if(o.units)for(let f of o.units){if(i(f.q,f.r)<2)continue;let h=Pe(f.q,f.r);if(f.marchPath&&f.marchPath.length>=2){let _=Pe(f.marchPath[0].q,f.marchPath[0].r),U=Pe(f.marchPath[1].q,f.marchPath[1].r),G=a*.14%1;h={x:_.x+(U.x-_.x)*G,y:_.y+(U.y-_.y)*G}}let p=At(h.x,h.y,r);if(p.x<-100||p.x>r.viewportWidth+100||p.y<-60||p.y>r.viewportHeight+60)continue;let v=f.kind==="siege_army"?"\u2694":f.kind==="army"?"\u{1F6E1}":f.kind==="scout"?"\u{1F441}":f.kind==="boat"?"\u26F5":"\u2696",y=typeof f.strength=="number"?` ${f.strength}${f.rams?` + ${f.rams}R`:""}`:"";yr(s,p.x,p.y-Math.max(20,34*r.zoom),`${v} ${f.label}${y}`,f.factionColor,d?10.5:11,.92)}if(o.buildPreview){let f=o.buildPreview,h=Pe(f.center.q,f.center.r),p=At(h.x,h.y,r),v=f.yieldPercent-100,y=f.valid?`${f.buildingKind} \xB7 Ertrag ${f.yieldPercent}% (+${v}% R2)`:`Nicht baubar: ${f.reason??"ung\xFCltig"}`;yr(s,p.x,p.y-34,y,f.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var Kn=`#version 300 es
precision highp float;

// Unit quad [0..1] x [0..1] (2 triangles, 6 vertices)
const vec2 QUAD[6] = vec2[6](
  vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0),
  vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0)
);

layout(location = 0) in vec4 a_geom0;  // x=anchorX, y=anchorY, z=relLeft, w=relTop
layout(location = 1) in vec4 a_geom1;  // x=width, y=height, z=alpha, w=pageIdx*256 + flags8
layout(location = 2) in vec4 a_uvRect; // u0, v0, u1, v1
layout(location = 3) in vec2 a_extra;  // x=tintHash(0..1), y=swayAmp(0..1)

uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;
uniform float u_scaleY;
uniform float u_shearX;
uniform float u_time;
uniform float u_windEnabled;

out vec2 v_uv;
out vec2 v_footUv;
out vec2 v_localCorner;
out float v_alpha;
out float v_tint;
flat out int v_page;
flat out int v_flags;

void main() {
  int packed = int(floor(a_geom1.w + 0.5));
  v_page = packed >> 8;
  v_flags = packed & 255;
  bool isWallOrFlat = ((v_flags & 2) == 0) && ((v_flags & 4) != 0);

  vec2 corner = QUAD[gl_VertexID];
  // Local offset relative to the sprite's ground anchor (in world units).
  vec2 local = vec2(a_geom0.z + corner.x * a_geom1.x, a_geom0.w + corner.y * a_geom1.y);

  // Subtle GPU canopy breeze sway (trunk at corner.y == 1.0 stays 100% rooted!)
  if (u_windEnabled > 0.5 && a_extra.y > 0.005) {
    float phase = a_geom0.x * 0.017 + a_geom0.y * 0.013 + a_extra.x * 6.2831;
    float gust = sin(u_time * 1.45 + phase) * 0.68 + sin(u_time * 2.75 + phase * 1.6) * 0.32;
    float bend = (1.0 - corner.y) * (1.0 - corner.y) * a_extra.y;
    local.x += gust * bend * min(6.5, a_geom1.y * 0.038);
  }

  // Subtle artist perspective tilt for organic nature sprites; upright masonry stays exact!
  vec2 tilted = isWallOrFlat
    ? local
    : vec2(local.x + local.y * u_shearX, local.y * u_scaleY);
  vec2 world = a_geom0.xy + tilted;
  vec2 screenOffset = (world - u_camCenter) * u_zoom;
  vec2 ndc = vec2(screenOffset.x / (u_viewportSize.x * 0.5), -screenOffset.y / (u_viewportSize.y * 0.5));
  gl_Position = vec4(ndc, 0.0, 1.0);

  // Screen UV of the sprite's ground foot (for exact foot-gated cross-sprite cast shadows).
  vec2 footOffset = (a_geom0.xy - u_camCenter) * u_zoom;
  vec2 footNdc = vec2(footOffset.x / (u_viewportSize.x * 0.5), -footOffset.y / (u_viewportSize.y * 0.5));
  v_footUv = footNdc * 0.5 + 0.5;

  v_localCorner = corner;
  v_uv = mix(a_uvRect.xy, a_uvRect.zw, corner);
  v_alpha = a_geom1.z;
  v_tint = a_extra.x;
}
`,Oo=`#version 300 es
precision highp float;
in vec2 v_uv;
in vec2 v_footUv;
in vec2 v_localCorner;
in float v_alpha;
in float v_tint;
flat in int v_page;
flat in int v_flags;
out vec4 fragColor;

uniform sampler2D u_atlases[8];
uniform sampler2D u_mtnShadowMask;
uniform vec2 u_canvasSize;
uniform float u_mtnShadowOpacity;
uniform float u_selfShadow;
uniform float u_naturePolish;
uniform float u_spriteSat;
uniform float u_spriteBright;
uniform float u_spriteContrast;
uniform float u_colorGradeAll;

vec4 sampleAtlas(int idx, vec2 uv) {
  if (idx == 0) return texture(u_atlases[0], uv);
  if (idx == 1) return texture(u_atlases[1], uv);
  if (idx == 2) return texture(u_atlases[2], uv);
  if (idx == 3) return texture(u_atlases[3], uv);
  if (idx == 4) return texture(u_atlases[4], uv);
  if (idx == 5) return texture(u_atlases[5], uv);
  if (idx == 6) return texture(u_atlases[6], uv);
  return texture(u_atlases[7], uv);
}

void main() {
  vec4 tex = sampleAtlas(v_page, v_uv);
  float a = tex.a * v_alpha;
  if (a < 0.015) discard;
  vec3 col = tex.rgb;

  bool fogDim = (v_flags & 1) != 0;
  bool applyPolish = ((v_flags >> 1) & 1) != 0;
  bool auxBit = ((v_flags >> 2) & 1) != 0;
  bool isSnow = applyPolish && auxBit;
  bool isWallOrFlat = (!applyPolish) && auxBit;
  int shadowTier = (v_flags >> 3) & 3;
  float selfShadeW = float((v_flags >> 5) & 7) / 7.0;

  // 1. Live asset_labor polish.js:natureFilter + organic per-instance tint + user Sprite color adjustments
  if (applyPolish || (!isWallOrFlat && u_colorGradeAll > 0.5)) {
    float p = applyPolish ? u_naturePolish : 0.0;
    float sat = (1.0 - (isSnow ? 0.06 : 0.18) * p) * u_spriteSat;
    float bright = (1.0 - (isSnow ? 0.015 : 0.065) * p) * u_spriteBright;
    float contrast = (1.0 + 0.045 * p) * u_spriteContrast;
    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(luma), col, sat);
    col = col * bright;
    col = clamp((col - 0.5) * contrast + 0.5, 0.0, 1.0);
    if (applyPolish) {
      float tBias = (v_tint - 0.5) * 2.0;
      float instBright = 1.0 + tBias * 0.055;
      vec3 instWarm = vec3(1.0 + tBias * 0.032, 1.0 + tBias * 0.008, 1.0 - tBias * 0.028);
      col = clamp(col * instBright * instWarm, 0.0, 1.0);
    }
  }

  // 2. Luminance-aware 2.5D directional self-shadow & base contact AO (upper-right sun -> 142\xB0 cast shadow).
  //    Darkens ONLY bright unshaded shadow-side pixels so already-dark painted shadows are preserved!
  if (selfShadeW > 0.01 && u_selfShadow > 0.005 && !isWallOrFlat) {
    float curLuma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float brightGuard = smoothstep(0.11, 0.50, curLuma);
    float leftFlank = smoothstep(0.60, 0.04, v_localCorner.x);
    float lowerLeft = smoothstep(0.42, 0.96, v_localCorner.y)
                    * (0.32 + 0.68 * smoothstep(0.80, 0.12, v_localCorner.x));
    float baseContactAo = smoothstep(0.82, 0.995, v_localCorner.y)
                        * (0.50 + 0.50 * leftFlank);
    float mask = clamp(leftFlank * 0.48 + lowerLeft * 0.44 + baseContactAo * 0.34, 0.0, 1.0);
    float selfAmt = clamp(mask * brightGuard * selfShadeW * u_selfShadow * 0.70, 0.0, 0.62);
    // Subtle cool atmospheric shadow tint matching sky-fill bounce light
    col *= vec3(1.0 - selfAmt * 1.06, 1.0 - selfAmt * 1.00, 1.0 - selfAmt * 0.87);
  }

  // 3. Hierarchical 3-tier foot-gated cast-shadow darkening (mountains + boulders + tall trees + walls).
  //    Strict receiverTier < casterTier prevents self-shadowing; v_footUv gating protects foreground tips!
  if (shadowTier < 3 && u_mtnShadowOpacity > 0.005) {
    if (v_footUv.x >= 0.0 && v_footUv.x <= 1.0 && v_footUv.y >= 0.0 && v_footUv.y <= 1.0) {
      vec4 footMask = texture(u_mtnShadowMask, v_footUv);
      vec2 pxUv = clamp(gl_FragCoord.xy / max(u_canvasSize, vec2(1.0)), 0.0, 1.0);
      vec4 pxMask = texture(u_mtnShadowMask, pxUv);

      // Tier 3 (R): Mountain shadow reaches all non-mountain sprites (Tier 0, 1, 2)
      float mtnGate = smoothstep(0.06, 0.20, footMask.r);
      float mtnCov = max(pxMask.r, footMask.r * 0.62) * mtnGate;

      // Tier 2 (G) & Tier 1 (B): Giant boulders / tall trees / walls & medium casters
      float objFoot = 0.0;
      float objPx = 0.0;
      if (shadowTier <= 1) {
        objFoot = max(objFoot, footMask.g * 0.90);
        objPx = max(objPx, pxMask.g * 0.90);
      }
      if (shadowTier == 0) {
        objFoot = max(objFoot, footMask.b * 0.84);
        objPx = max(objPx, pxMask.b * 0.84);
      }
      float objGate = smoothstep(0.08, 0.24, objFoot);
      float heightEase = mix(0.76, 1.0, smoothstep(0.12, 0.88, v_localCorner.y));
      float objCov = max(objPx, objFoot * 0.72) * heightEase * objGate;

      float effCov = max(mtnCov, objCov);
      if (effCov > 0.005) {
        float shadeA = clamp(effCov * u_mtnShadowOpacity, 0.0, 0.88);
        col = mix(col, vec3(0.0), shadeA);
      }
    }
  }

  // 4. Fog-of-War explored dimming
  if (fogDim) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, 0.52) * vec3(0.66, 0.70, 0.77);
  }

  fragColor = vec4(col * a, a); // premultiplied output
}
`,No=`#version 300 es
precision highp float;
in vec2 v_uv;
in float v_alpha;
flat in int v_flags;
out vec4 fragColor;

uniform sampler2D u_atlas;

void main() {
  float a = texture(u_atlas, v_uv).a * v_alpha;
  if (a < 0.01) discard;
  // 3-tier RGBA8 shadow union mask (gl.MAX):
  //   R = Tier 3 (mountains)
  //   G = Tier 2 (giant boulders, tall trees, stone/palisade walls)
  //   B = Tier 1 (medium boulders, medium trees, cacti)
  //   A = Unified MAX of ALL shadows (Tier 0..3) composited once onto ground terrain
  int tier = v_flags & 3;
  float r = (tier == 3) ? a : 0.0;
  float g = (tier == 2) ? a : 0.0;
  float b = (tier == 1) ? a : 0.0;
  fragColor = vec4(r, g, b, a);
}
`,Zn=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,Xo=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shadowMask;
uniform float u_shadowOpacity;
void main() {
  float cov = texture(u_shadowMask, v_uv).a;
  float a = clamp(cov * u_shadowOpacity, 0.0, 0.88);
  if (a < 0.005) discard;
  // Unified neutral shadow black matching asset_labor/shadow-tone.js:54
  fragColor = vec4(0.0, 0.0, 0.0, a);
}
`,Vo=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function Vt(t,e,r,o){let i=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!i||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(i)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let a=t.createProgram();if(!a)throw new Error(`Failed to create ${o} program`);if(t.attachShader(a,i),t.attachShader(a,n),t.linkProgram(a),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(a,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(a)}`);return a}var zo=`#version 300 es
precision highp float;
const vec2 QUAD[6] = vec2[6](
  vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0),
  vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0)
);
layout(location = 0) in vec4 a_geom0; // x=anchorX, y=anchorY, z=-rx, w=-ry
layout(location = 1) in vec4 a_geom1; // x=2*rx, y=2*ry, z=alpha, w=fogDim
layout(location = 3) in vec2 a_extra; // x=seed(0..1), y=unused
uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;
out vec2 v_local;
out float v_alpha;
out float v_fogDim;
out float v_seed;
void main() {
  vec2 corner = QUAD[gl_VertexID];
  vec2 world = a_geom0.xy + vec2(a_geom0.z + corner.x * a_geom1.x, a_geom0.w + corner.y * a_geom1.y);
  vec2 screenOffset = (world - u_camCenter) * u_zoom;
  vec2 ndc = vec2(screenOffset.x / (u_viewportSize.x * 0.5), -screenOffset.y / (u_viewportSize.y * 0.5));
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_local = corner * 2.0 - 1.0;
  v_alpha = a_geom1.z;
  v_fogDim = a_geom1.w;
  v_seed = a_extra.x;
}
`,Yo=`#version 300 es
precision highp float;
in vec2 v_local;
in float v_alpha;
in float v_fogDim;
in float v_seed;
uniform float u_time;
uniform float u_windEnabled;
out vec4 fragColor;
void main() {
  float r = length(v_local);
  if (r > 1.0 || r < 0.22) discard;
  float ang = atan(v_local.y, v_local.x);
  float wobble = sin(ang * 4.0 + v_seed * 19.0) * 0.065
               + cos(ang * 7.0 - v_seed * 11.0 + u_time * 0.9 * u_windEnabled) * 0.042;
  float rw = r + wobble;
  // Soft inner waterline seafoam collar hugging the submerged rock base
  float collar = exp(-pow((rw - 0.55) / 0.12, 2.0)) * 0.42;
  // Two slow outward-breathing surf ripples breaking away from the reef boulder
  float ph1 = fract(u_time * 0.22 * u_windEnabled + v_seed);
  float ph2 = fract(ph1 + 0.5);
  float r1 = 0.50 + ph1 * 0.44;
  float r2 = 0.50 + ph2 * 0.44;
  float w1 = exp(-pow((rw - r1) / 0.055, 2.0)) * sin(ph1 * 3.14159265) * 0.34;
  float w2 = exp(-pow((rw - r2) / 0.055, 2.0)) * sin(ph2 * 3.14159265) * 0.34;
  float foamBreak = 0.68 + 0.32 * sin(ang * 6.0 + v_seed * 23.0 + rw * 8.0);
  float outerFade = smoothstep(1.0, 0.78, r) * smoothstep(0.22, 0.42, r);
  float alpha = clamp((collar + w1 + w2) * foamBreak * outerFade * v_alpha, 0.0, 0.52);
  if (alpha < 0.01) discard;
  vec3 col = mix(vec3(0.66, 0.87, 0.91), vec3(0.92, 0.96, 0.98), clamp(collar * 1.45 + w1 + w2, 0.0, 1.0));
  if (v_fogDim > 0.5) {
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 0.55) * vec3(0.68, 0.72, 0.78);
  }
  fragColor = vec4(col * alpha, alpha);
}
`,xr=class{constructor(e){this.instanceData=new Float32Array(16384*14);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=Vt(e,Kn,Oo,"sprite"),this.shadowMaskProg=Vt(e,Kn,No,"shadow-mask"),this.compositeProg=Vt(e,Zn,Xo,"shadow-composite"),this.shoreCompositeProg=Vt(e,Zn,Vo,"shore-composite"),this.surfProg=Vt(e,zo,Yo,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),i=e.createBuffer();if(!r||!o||!i)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=56;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,2,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let a=(c,l)=>{let s=e.getUniformLocation(c,l);if(!s)throw new Error(`Missing uniform ${l}`);return s};this.spCam=a(this.spriteProg,"u_camCenter"),this.spView=a(this.spriteProg,"u_viewportSize"),this.spZoom=a(this.spriteProg,"u_zoom"),this.spScaleY=a(this.spriteProg,"u_scaleY"),this.spShearX=a(this.spriteProg,"u_shearX"),this.spTime=a(this.spriteProg,"u_time"),this.spWindEnabled=a(this.spriteProg,"u_windEnabled"),this.spCanvasSize=a(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=a(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=a(this.spriteProg,"u_selfShadow"),this.spNaturePolish=a(this.spriteProg,"u_naturePolish"),this.spSpriteSat=a(this.spriteProg,"u_spriteSat"),this.spSpriteBright=a(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=a(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=a(this.spriteProg,"u_colorGradeAll"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=a(this.shadowMaskProg,"u_camCenter"),this.shView=a(this.shadowMaskProg,"u_viewportSize"),this.shZoom=a(this.shadowMaskProg,"u_zoom"),this.shScaleY=a(this.shadowMaskProg,"u_scaleY"),this.shShearX=a(this.shadowMaskProg,"u_shearX"),this.shTime=a(this.shadowMaskProg,"u_time"),this.shWindEnabled=a(this.shadowMaskProg,"u_windEnabled"),this.sfCam=a(this.surfProg,"u_camCenter"),this.sfView=a(this.surfProg,"u_viewportSize"),this.sfZoom=a(this.surfProg,"u_zoom"),this.sfTime=a(this.surfProg,"u_time"),this.sfWindEnabled=a(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=a(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),i=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===i)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let a=n.createTexture(),c=n.createFramebuffer();if(!a||!c)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,a),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,c),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,a,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=a,this.shadowFbo=c,this.shadowW=o,this.shadowH=i}ensureShoreFbo(e,r){let o=Math.max(2,e),i=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===i)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let a=n.createTexture(),c=n.createFramebuffer();if(!a||!c)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,a),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,c),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,a,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=a,this.shoreFbo=c,this.shoreW=o,this.shoreH=i}renderShadows(e){let{cam:r,sprites:o,fogStates:i,walls:n=[],shadowPages:a,shadowOpacity:c,detailOpacity:l}=e;if(this.lastHasCrossShadows=!1,c<=.005||l<=.01||a.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:s,instanceData:d}=this;this.ensureShadowFbo(s.canvas.width,s.canvas.height);let f=0,h=0,p=new Array(a.length).fill(0);for(let T=0;T<o.length;T++){let W=o[T];W.shadowPage<0||W.shadowPage>=a.length||i[T]!==0&&p[W.shadowPage]++}for(let T=0;T<n.length;T++){let W=n[T],V=W.shadowPage??-1;V<0||V>=a.length||W.fogState===0||p[V]++}let v=new Array(a.length).fill(0),y=0;for(let T=0;T<a.length;T++)v[T]=y,y+=p[T];if(y===0)return{drawCalls:0,renderedShadows:0};let _=[...v],U=Math.min(y,16384);for(let T=0;T<o.length;T++){let W=o[T],V=W.shadowPage;if(V<0||V>=a.length)continue;let g=i[T];if(g===0)continue;let M=_[V];if(M>=U)continue;_[V]=M+1,f++;let x=W.shadowTier??(W.isMountain?3:0);x>0&&h++;let A=M*14,I=(W.shadowMaxX-W.shadowMinX)*W.width,L=(W.shadowMaxY-W.shadowMinY)*W.width;d[A]=W.x,d[A+1]=W.y,d[A+2]=W.shadowMinX*W.width,d[A+3]=W.shadowMinY*W.width,d[A+4]=I,d[A+5]=L,d[A+6]=g===1?l*.65:l,d[A+7]=x,d[A+8]=W.shadowU0,d[A+9]=W.shadowV0,d[A+10]=W.shadowU1,d[A+11]=W.shadowV1,d[A+12]=.5,d[A+13]=0}for(let T=0;T<n.length;T++){let W=n[T],V=W.shadowPage??-1;if(V<0||V>=a.length||W.fogState===0)continue;let g=_[V];if(g>=U)continue;_[V]=g+1,f++,h++;let M=g*14;d[M]=W.x,d[M+1]=W.y,d[M+2]=W.shadowRelLeft??0,d[M+3]=W.shadowRelTop??0,d[M+4]=W.shadowWidth??0,d[M+5]=W.shadowHeight??0,d[M+6]=W.fogState===1?l*.65:l,d[M+7]=2,d[M+8]=W.shadowU0??0,d[M+9]=W.shadowV0??0,d[M+10]=W.shadowU1??0,d[M+11]=W.shadowV1??0,d[M+12]=.5,d[M+13]=0}this.lastHasCrossShadows=h>0,s.bindBuffer(s.ARRAY_BUFFER,this.instanceVbo),s.bufferSubData(s.ARRAY_BUFFER,0,d.subarray(0,U*14)),s.bindFramebuffer(s.FRAMEBUFFER,this.shadowFbo),s.viewport(0,0,this.shadowW,this.shadowH),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),s.enable(s.BLEND),s.blendEquation(s.MAX),s.blendFunc(s.ONE,s.ONE),s.useProgram(this.shadowMaskProg),s.bindVertexArray(this.vao),s.uniform2f(this.shCam,r.x,r.y),s.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),s.uniform1f(this.shZoom,r.zoom),s.uniform1f(this.shScaleY,1),s.uniform1f(this.shShearX,0),s.uniform1f(this.shTime,0),s.uniform1f(this.shWindEnabled,0);let G=0;s.activeTexture(s.TEXTURE0);for(let T=0;T<a.length;T++){let W=v[T],V=Math.min(_[T],U),g=V-W;g<=0||(s.bindTexture(s.TEXTURE_2D,a[T]),W===0||s.bufferSubData(s.ARRAY_BUFFER,0,d.subarray(W*14,V*14)),s.drawArraysInstanced(s.TRIANGLES,0,6,g),G++)}return s.bindFramebuffer(s.FRAMEBUFFER,null),s.viewport(0,0,s.canvas.width,s.canvas.height),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ONE_MINUS_SRC_ALPHA),s.useProgram(this.compositeProg),s.bindVertexArray(this.compositeVao),s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,this.shadowTex),s.uniform1f(this.compOpacity,c),s.drawArrays(s.TRIANGLES,0,3),G++,{drawCalls:G,renderedShadows:f}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:i,naturePages:n,walls:a=[],infraPages:c=[],detailOpacity:l,objectScaleY:s,objectShearX:d,shadowOpacity:f=.54,mountainShadowOnSprites:h=!0,spriteSelfShadow:p=.68,naturePolish:v=.4,spriteSaturation:y=1,spriteBrightness:_=1,spriteContrast:U=1,timeSec:G=0,windAnimation:T=!0}=e,W=o.length>0&&n.length>0,V=a.length>0&&c.length>0;if(l<=.01||!W&&!V)return{drawCalls:0,renderedSprites:0};let{gl:g,instanceData:M}=this;g.enable(g.BLEND),g.blendEquation(g.FUNC_ADD),g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA),g.useProgram(this.spriteProg),g.bindVertexArray(this.vao),g.bindBuffer(g.ARRAY_BUFFER,this.instanceVbo),g.uniform2f(this.spCam,r.x,r.y),g.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),g.uniform1f(this.spZoom,r.zoom),g.uniform1f(this.spScaleY,s),g.uniform1f(this.spShearX,d),g.uniform1f(this.spTime,G),g.uniform1f(this.spWindEnabled,T?1:0),g.uniform2f(this.spCanvasSize,g.canvas.width,g.canvas.height);let x=h&&this.lastHasCrossShadows&&this.shadowTex!==null?f:0;g.uniform1f(this.spMtnShadowOpacity,x),g.uniform1f(this.spSelfShadow,p),g.uniform1f(this.spNaturePolish,v),g.uniform1f(this.spSpriteSat,y),g.uniform1f(this.spSpriteBright,_),g.uniform1f(this.spSpriteContrast,U),g.uniform1f(this.spColorGradeAll,1);let A=n[0]??c[0];g.activeTexture(g.TEXTURE8),g.bindTexture(g.TEXTURE_2D,this.shadowTex??A);let I=0,L=0,B=0,N=[],K=new Map,$=()=>{if(B<=0)return;for(let R=0;R<N.length;R++)g.activeTexture(g.TEXTURE0+R),g.bindTexture(g.TEXTURE_2D,N[R]);let w=N[0]??A;for(let R=N.length;R<8;R++)g.activeTexture(g.TEXTURE0+R),g.bindTexture(g.TEXTURE_2D,w);g.bufferSubData(g.ARRAY_BUFFER,0,M.subarray(0,B*14)),g.drawArraysInstanced(g.TRIANGLES,0,6,B),I++,L+=B,B=0,N=[],K.clear()},ie=w=>{let R=K.get(w);return R===void 0?((N.length>=8||B>=16384)&&$(),R=N.length,N.push(w),K.set(w,R)):B>=16384&&($(),R=0,N.push(w),K.set(w,0)),R},ce=0,Z=0,S=W?o.length:0,F=V?a.length:0;for(;ce<S||Z<F;){let w=!1;if(ce>=S)w=!0;else if(Z<F){let R=o[ce].sortY??o[ce].y;a[Z].sortY<R&&(w=!0)}if(w){let R=a[Z++];if(R.fogState===0||R.page<0||R.page>=c.length)continue;let u=ie(c[R.page]),m=(R.fogState===1?1:0)|4|16,b=B*14;M[b]=R.x,M[b+1]=R.y,M[b+2]=R.relLeft,M[b+3]=R.relTop,M[b+4]=R.width,M[b+5]=R.height,M[b+6]=l,M[b+7]=u*256+m,M[b+8]=R.u0,M[b+9]=R.v0,M[b+10]=R.u1,M[b+11]=R.v1,M[b+12]=.5,M[b+13]=0,B++}else{let R=ce++,u=i[R];if(u===0)continue;let m=o[R];if(m.page<0||m.page>=n.length)continue;let b=ie(n[m.page]),E=m.shadowTier??(m.isMountain?3:0),C=m.selfShadeWeight??(m.isGroundDecal?0:m.isMountain?.52:.72),D=Math.max(0,Math.min(7,Math.round(C*7))),H=(u===1?1:0)|(E&3)<<3|(D&7)<<5;m.isMountain||(H|=2,m.isSnowFamily&&(H|=4));let z=!!m.flipX,ne=z?1-m.anchorX:m.anchorX,J=B*14;M[J]=m.x,M[J+1]=m.y,M[J+2]=-m.width*ne,M[J+3]=-m.height*m.anchorY,M[J+4]=m.width,M[J+5]=m.height,M[J+6]=l,M[J+7]=b*256+H,M[J+8]=z?m.u1:m.u0,M[J+9]=m.v0,M[J+10]=z?m.u0:m.u1,M[J+11]=m.v1,M[J+12]=m.tintHash??.5,M[J+13]=m.swayAmp??0,B++}}return $(),{drawCalls:I,renderedSprites:L}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:i,infraPages:n,projectY:a}=e;if(o.length===0||n.length===0)return{drawCalls:0,renderedShorelines:0};let{gl:c,instanceData:l}=this;this.ensureShoreFbo(c.canvas.width,c.canvas.height),c.bindFramebuffer(c.FRAMEBUFFER,this.shoreFbo),c.viewport(0,0,this.shoreW,this.shoreH),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT),c.enable(c.BLEND),c.blendEquation(c.MAX),c.blendFunc(c.ONE,c.ONE),c.useProgram(this.spriteProg),c.bindVertexArray(this.vao),c.bindBuffer(c.ARRAY_BUFFER,this.instanceVbo),c.uniform2f(this.spCam,r.x,r.y),c.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),c.uniform1f(this.spZoom,r.zoom),c.uniform1f(this.spScaleY,1),c.uniform1f(this.spShearX,0),c.uniform1f(this.spTime,0),c.uniform1f(this.spWindEnabled,0),c.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),c.uniform1f(this.spMtnShadowOpacity,0),c.uniform1f(this.spSelfShadow,0),c.uniform1f(this.spNaturePolish,0),c.uniform1f(this.spSpriteSat,1),c.uniform1f(this.spSpriteBright,1),c.uniform1f(this.spSpriteContrast,1),c.uniform1f(this.spColorGradeAll,0);let s=Math.min(n.length,8);for(let _=0;_<8;_++)c.activeTexture(c.TEXTURE0+_),c.bindTexture(c.TEXTURE_2D,n[_<s?_:0]);c.activeTexture(c.TEXTURE8),c.bindTexture(c.TEXTURE_2D,n[0]);let d=0,f=0,h=0,p=()=>{h<=0||(c.bufferSubData(c.ARRAY_BUFFER,0,l.subarray(0,h*14)),c.drawArraysInstanced(c.TRIANGLES,0,6,h),d++,f+=h,h=0)},v=512,y=512*a;for(let _=0;_<o.length;_++){let U=i[_];if(U===0)continue;let G=o[_];if(G.page<0||G.page>=s)continue;h>=16384&&p();let T=h*14;l[T]=G.x,l[T+1]=G.y,l[T+2]=-v*.5,l[T+3]=-y*.5,l[T+4]=v,l[T+5]=y,l[T+6]=1,l[T+7]=G.page*256+4+24+(U===1?1:0),l[T+8]=G.u0,l[T+9]=G.v0,l[T+10]=G.u1,l[T+11]=G.v1,l[T+12]=.5,l[T+13]=0,h++}return p(),c.bindFramebuffer(c.FRAMEBUFFER,null),c.viewport(0,0,c.canvas.width,c.canvas.height),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),f>0&&(c.useProgram(this.shoreCompositeProg),c.bindVertexArray(this.compositeVao),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,this.shoreTex),c.drawArrays(c.TRIANGLES,0,3),d++),{drawCalls:d,renderedShorelines:f}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:i,detailOpacity:n,timeSec:a,windAnimation:c}=e;if(n<=.02||o.length===0)return 0;let{gl:l,instanceData:s}=this,d=0;for(let f=0;f<o.length;f++){let h=o[f];if(!h.isWaterBoulder)continue;let p=i[f];if(p===0)continue;if(d>=16384)break;let v=h.width*.68,y=h.width*.25,_=d*14;s[_]=h.x,s[_+1]=h.y-h.height*.04,s[_+2]=-v,s[_+3]=-y,s[_+4]=v*2,s[_+5]=y*2,s[_+6]=n,s[_+7]=p===1?1:0,s[_+8]=0,s[_+9]=0,s[_+10]=0,s[_+11]=0,s[_+12]=h.tintHash??.5,s[_+13]=0,d++}return d===0?0:(l.enable(l.BLEND),l.blendEquation(l.FUNC_ADD),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),l.useProgram(this.surfProg),l.bindVertexArray(this.vao),l.bindBuffer(l.ARRAY_BUFFER,this.instanceVbo),l.uniform2f(this.sfCam,r.x,r.y),l.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),l.uniform1f(this.sfZoom,r.zoom),l.uniform1f(this.sfTime,a),l.uniform1f(this.sfWindEnabled,c?1:0),l.bufferSubData(l.ARRAY_BUFFER,0,s.subarray(0,d*14)),l.drawArraysInstanced(l.TRIANGLES,0,6,d),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var mt=256,jo=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,$o=`#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2DArray;

in vec2 v_ndc;
out vec4 fragColor;

uniform vec2 u_camCenter;      // projected world center
uniform vec2 u_viewportSize;   // CSS viewport width, height
uniform float u_zoom;
uniform float u_time;
uniform ivec2 u_gridOrigin;    // (minQ, minR)
uniform ivec2 u_gridSize;      // (spanQ, spanR)
uniform int u_forestFloorLayer;
uniform float u_showGrid;
uniform ivec2 u_hoverHex;      // (-999999, -999999) when none
uniform float u_hasClouds;
uniform float u_hasCloudEdge;
uniform vec4 u_surfaceRect;    // (left, top, width, height) in unprojected world space
uniform float u_edgeBand;      // autotile.js edgeWidth (default 28.0)
uniform float u_waterHexMode;  // 1.0 = 'hex' motif-safe water, 0.0 = 'repeat'
uniform float u_reliefEnabled; // 1.0 = active 2.5D hill warp, 0.0 = flat
uniform float u_reliefLighting;// 1.0 = directional slope lighting from right
uniform float u_windEnabled;   // 1.0 = subtle animated water shimmer

uniform sampler2DArray u_terrainArray;
uniform usampler2D u_cellData;     // R=terrainLayer, G=unused, B=fog(0/1/2), A=flags (bit0=water, bit1=snowNoBeach, bit2=icyWater)
uniform sampler2D u_cloudTex;
uniform sampler2D u_cloudEdgeTex;
uniform sampler2D u_surfaceField;  // R=height/RELIEF_MAX_H, G=(shade-0.52)/0.96, B=organicForestMask, A=landMask

const float HEX_W = ${256 .toFixed(4)};
const float HEX_R = ${Je.toFixed(6)};
const float PROJ_Y = ${ze.toFixed(4)};
const float ROW_STEP = ${(1.5*Je).toFixed(6)};
const float TEX_WORLD_SIZE = 256.0;
const float WATER_HEX_COVER = ${(2*Je).toFixed(4)}; // 295.603 (autotile.js:87)
const float RELIEF_MAX_H = ${sr.toFixed(2)};

const ivec2 DIRS[6] = ivec2[6](
  ivec2(1, -1),
  ivec2(1, 0),
  ivec2(0, 1),
  ivec2(-1, 1),
  ivec2(-1, 0),
  ivec2(0, -1)
);

vec2 hexCenterUnproj(ivec2 h) {
  return vec2(HEX_W * (float(h.x) + float(h.y) * 0.5), ROW_STEP * float(h.y));
}

ivec2 axialRound(vec2 uPos) {
  float rf = uPos.y / ROW_STEP;
  float qf = uPos.x / HEX_W - rf * 0.5;
  float sf = -qf - rf;
  float rq = round(qf);
  float rr = round(rf);
  float rs = round(sf);
  float dq = abs(rq - qf);
  float dr = abs(rr - rf);
  float ds = abs(rs - sf);
  if (dq > dr && dq > ds) {
    rq = -rr - rs;
  } else if (dr > ds) {
    rr = -rq - rs;
  }
  return ivec2(int(rq), int(rr));
}

// Exact C\xB2 quintic smootherstep from autotile.js:43
float smoother5(float t) {
  float c = clamp(t, 0.0, 1.0);
  return c * c * c * (c * (6.0 * c - 15.0) + 10.0);
}

// Exact world-anchored organic warp field from autotile.js:44-48
float autotileSmoothField(vec2 p) {
  return 0.62 * sin(p.x * 0.038 + cos(p.y * 0.025) * 1.3) * sin(p.y * 0.029 + p.x * 0.014)
       + 0.27 * sin(p.x * 0.087 - p.y * 0.042) * cos(p.y * 0.075 + p.x * 0.031)
       + 0.11 * sin(p.x * 0.143 + p.y * 0.094);
}

uvec4 fetchCell(ivec2 h) {
  ivec2 idx = h - u_gridOrigin;
  if (idx.x < 0 || idx.y < 0 || idx.x >= u_gridSize.x || idx.y >= u_gridSize.y) {
    return uvec4(0u, 0u, 0u, 0u);
  }
  return texelFetch(u_cellData, idx, 0);
}

vec4 sampleSurface(vec2 uPos) {
  vec2 uv = (uPos - u_surfaceRect.xy) / max(vec2(1.0), u_surfaceRect.zw);
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
    return vec4(0.0, 0.5, 0.0, 1.0);
  }
  return texture(u_surfaceField, uv);
}

// Always uses explicit continuous screen-space derivatives (textureGrad) so mipmap
// selection NEVER spikes into blurry 1-pixel seams along hex borders!
vec3 sampleHexTerrain(uvec4 cell, vec2 samplePos, vec2 hexCenter, vec2 dUdx, vec2 dUdy) {
  float layer = float(cell.r);
  bool isWater = (cell.a & 1u) != 0u;
  if (isWater && u_waterHexMode > 0.5) {
    vec2 localUv = clamp(vec2(0.5) + (samplePos - hexCenter) / WATER_HEX_COVER, 0.004, 0.996);
    return textureGrad(u_terrainArray, vec3(localUv, layer), dUdx / WATER_HEX_COVER, dUdy / WATER_HEX_COVER).rgb;
  }
  vec2 worldUv = samplePos / TEX_WORLD_SIZE;
  return textureGrad(u_terrainArray, vec3(worldUv, layer), dUdx / TEX_WORLD_SIZE, dUdy / TEX_WORLD_SIZE).rgb;
}

void main() {
  vec2 screenOffset = vec2(v_ndc.x, -v_ndc.y) * (u_viewportSize * 0.5);
  vec2 worldPos = u_camCenter + screenOffset / u_zoom;
  vec2 rawUPos = vec2(worldPos.x, worldPos.y / PROJ_Y);

  // Two-iteration 2.5D vertical elevation inversion (zero at water & coastal edges!)
  vec2 uPos = rawUPos;
  vec4 sf = vec4(0.0, 0.5, 0.0, 1.0);
  if (u_reliefEnabled > 0.5) {
    vec4 sf0 = sampleSurface(rawUPos);
    vec2 p1 = vec2(rawUPos.x, rawUPos.y + sf0.r * RELIEF_MAX_H);
    vec4 sf1 = sampleSurface(p1);
    uPos = vec2(rawUPos.x, rawUPos.y + sf1.r * RELIEF_MAX_H);
    sf = sampleSurface(uPos);
  } else {
    sf = sampleSurface(rawUPos);
  }

  // Continuous world-space derivatives computed ONCE outside ALL branches!
  vec2 dUdx = dFdx(uPos);
  vec2 dUdy = dFdy(uPos);

  // Exact home hex (autotile.js:158 hexAt(x, y))
  ivec2 homeHex = axialRound(uPos);
  vec2 homeCenter = hexCenterUnproj(homeHex);
  vec2 exactRel = uPos - homeCenter;
  uvec4 homeCell = fetchCell(homeHex);
  bool homeIsWater = (homeCell.a & 1u) != 0u;

  // Shared world-anchored organic warp for Voronoi candidates (autotile.js:163-164).
  // Use gentle 5 WU warp near coastlines so beaches hug shore_v105 cleanly, and richer
  // 2-octave organic warp (up to 13.5 WU) on interior land<->land borders to break hex regularity!
  float band = max(4.0, u_edgeBand);
  float coastIrr = min(5.0, band * 0.28);
  float warpBase = autotileSmoothField(uPos);
  float warpFine = autotileSmoothField(uPos * 0.55 + vec2(41.3, -27.1));
  float coastWarpOff = warpBase * coastIrr;
  vec2 coastWarpedPos = uPos + vec2(coastWarpOff, coastWarpOff * 0.61);

  // Broad billowing multi-octave domain warp for Fog-of-War cloud frontier (breaks straight hex & chunk edges!)
  float cwX = autotileSmoothField(rawUPos * 0.28 + vec2(17.4, -31.2)) * 46.0
            + autotileSmoothField(rawUPos * 0.78 + vec2(-23.1, 14.9)) * 18.0;
  float cwY = autotileSmoothField(rawUPos * 0.28 + vec2(-37.8, 29.5)) * 46.0
            + autotileSmoothField(rawUPos * 0.78 + vec2(19.7, -41.3)) * 18.0;
  vec2 fogWarpedPos = rawUPos + vec2(cwX, cwY);

  // Gather 7-cell neighborhood (home + 6 axial neighbors)
  ivec2 cHex[7];
  vec2 cPos[7];
  uvec4 cDat[7];
  float cD2[7];
  float cFogD2[7];
  bool cMix[7];

  cHex[0] = homeHex;
  cPos[0] = homeCenter;
  cDat[0] = homeCell;

  // Quick pre-check whether this hex borders water so interior land<->land borders can curve organically
  bool nearCoast = false;
  for (int i = 0; i < 6; i++) {
    ivec2 nh = homeHex + DIRS[i];
    uvec4 nd = fetchCell(nh);
    cHex[i + 1] = nh;
    cPos[i + 1] = hexCenterUnproj(nh);
    cDat[i + 1] = nd;
    bool nIsWater = (nd.a & 1u) != 0u;
    if ((nd.b > 0u) && (nIsWater != homeIsWater)) {
      nearCoast = true;
    }
  }

  float landIrr = (nearCoast || homeIsWater) ? coastIrr : min(13.5, band * 0.48);
  vec2 warpedPos = (nearCoast || homeIsWater)
    ? coastWarpedPos
    : uPos + vec2(warpBase * landIrr + warpFine * (landIrr * 0.45), (warpBase * 0.61 - warpFine * 0.38) * landIrr);

  vec2 d0v = warpedPos - homeCenter;
  cD2[0] = dot(d0v, d0v);
  cMix[0] = homeCell.b > 0u;
  vec2 f0v = fogWarpedPos - homeCenter;
  cFogD2[0] = dot(f0v, f0v);

  float minMixD2 = cMix[0] ? cD2[0] : 1e20;
  float minFogD2 = cFogD2[0];
  float minOppD2 = 1e20;
  uint oppFlags = 0u;

  for (int i = 0; i < 6; i++) {
    vec2 np = cPos[i + 1];
    uvec4 nd = cDat[i + 1];
    vec2 dv = warpedPos - np;
    float d2 = dot(dv, dv);
    vec2 fv = fogWarpedPos - np;
    float fd2 = dot(fv, fv);
    bool nIsWater = (nd.a & 1u) != 0u;
    // Exact autotile.js:149-154 canMix: water blends ONLY with water, land ONLY with land!
    bool compat = (nd.b > 0u) && (nIsWater == homeIsWater);

    cD2[i + 1] = d2;
    cFogD2[i + 1] = fd2;
    cMix[i + 1] = compat;

    if (compat && d2 < minMixD2) minMixD2 = d2;
    if ((nd.b > 0u) && (nIsWater != homeIsWater) && d2 < minOppD2) {
      minOppD2 = d2;
      oppFlags = nd.a;
    }
    if (fd2 < minFogD2) minFogD2 = fd2;
  }

  // Exact autotile.js:170-186 Voronoi squared-distance partition-of-unity!
  // Slightly wider soft transition for ocean <-> coastal_water (1.35x band) for silky waves.
  float effBand = homeIsWater ? max(band, 38.0) : band;
  vec3 terrainSum = vec3(0.0);
  float mixWeightSum = 0.0;
  float fogTotalW = 0.0;
  float knownWeight = 0.0;
  float visibleWeight = 0.0;

  for (int k = 0; k < 7; k++) {
    // Wide 84 WU billowing FoW cloud blending across all 7 cells (zero straight hex/chunk edges!)
    float fDelta = (cFogD2[k] - minFogD2) / (2.0 * HEX_W);
    float fw = fDelta >= 84.0 ? 0.0 : smoother5(1.0 - fDelta / 84.0);
    if (fw > 0.001) {
      fogTotalW += fw;
      if (cDat[k].b > 0u) knownWeight += fw;
      if (cDat[k].b >= 2u) visibleWeight += fw;
    }

    if (!cMix[k]) continue;
    float delta = (cD2[k] - minMixD2) / (2.0 * HEX_W);
    float w = delta >= effBand ? 0.0 : smoother5(1.0 - delta / effBand);
    if (w > 0.001) {
      terrainSum += sampleHexTerrain(cDat[k], uPos, cPos[k], dUdx, dUdy) * w;
      mixWeightSum += w;
    }
  }

  // Fallback to home cell if pixel lies right on an isolated known cell edge
  vec3 knownColor = vec3(0.0);
  if (mixWeightSum > 0.001) {
    knownColor = terrainSum / mixWeightSum;
  } else if (homeCell.b > 0u) {
    knownColor = sampleHexTerrain(homeCell, uPos, homeCenter, dUdx, dUdy);
  }
  float normKnown = fogTotalW > 0.001 ? clamp(knownWeight / fogTotalW, 0.0, 1.0) : 0.0;
  float normVis = knownWeight > 0.001 ? clamp(visibleWeight / knownWeight, 0.0, 1.0) : 0.0;

  // Continuous organic forest-floor layer (forest-ground.js parity: land only, glades cut out)
  float forestMask = homeIsWater ? 0.0 : sf.b;
  if (forestMask > 0.01 && normKnown > 0.01) {
    vec3 fCol = textureGrad(
      u_terrainArray,
      vec3(uPos / TEX_WORLD_SIZE, float(u_forestFloorLayer)),
      dUdx / TEX_WORLD_SIZE,
      dUdy / TEX_WORLD_SIZE
    ).rgb;
    knownColor = mix(knownColor, fCol, forestMask);
  }

  // Continuous zero-gap GPU shoreline feathering + organic curved arctic ice-shelf fjords!
  bool effectiveWater = homeIsWater;
  if (minOppD2 < 1e18 && normKnown > 0.01) {
    float coastDist = (minOppD2 - minMixD2) / (2.0 * HEX_W);
    bool isArcticCoast = ((homeCell.a | oppFlags) & 6u) != 0u;
    if (isArcticCoast) {
      // Smooth isotropic organic coastline warp + 7-cell Gaussian land/water field:
      // rounds off sharp hex vertices into natural curved snow/ice fjords \u2014 ZERO straight hex lines, ZERO warm sand!
      float awX = autotileSmoothField(uPos * 0.72) * 18.0
                + autotileSmoothField(uPos * 1.95 + vec2(31.7, -19.3)) * 7.5;
      float awY = autotileSmoothField(uPos * 0.72 + vec2(-43.1, 27.9)) * 18.0
                + autotileSmoothField(uPos * 1.95 + vec2(-14.2, 53.6)) * 7.5;
      vec2 arcticPos = uPos + vec2(awX, awY);
      const float invTwoSig2 = 1.0 / (2.0 * 62.0 * 62.0);
      float landMass = 0.0;
      float waterMass = 0.0;
      vec3 landColSum = vec3(0.0);
      vec3 waterColSum = vec3(0.0);
      for (int k = 0; k < 7; k++) {
        if (cDat[k].b == 0u) continue;
        vec2 dv = arcticPos - cPos[k];
        float wk = exp(-dot(dv, dv) * invTwoSig2);
        if (wk < 0.0005) continue;
        vec3 sCol = sampleHexTerrain(cDat[k], uPos, cPos[k], dUdx, dUdy);
        if ((cDat[k].a & 1u) != 0u) {
          waterMass += wk;
          waterColSum += sCol * wk;
        } else {
          landMass += wk;
          landColSum += sCol * wk;
        }
      }
      if (landMass > 0.0005 && waterMass > 0.0005) {
        float landFrac = landMass / (landMass + waterMass);
        vec3 landCol = landColSum / landMass;
        vec3 waterCol = waterColSum / waterMass;
        float tLand = smoother5((landFrac - 0.44) / 0.12);
        effectiveWater = tLand < 0.35;

        // Shallow turquoise-ice shelf fading gently into deep arctic water
        float tShelf = smoother5((landFrac - 0.14) / 0.34) * (1.0 - tLand);
        vec3 shelfWater = mix(waterCol, vec3(0.50, 0.73, 0.83), tShelf * 0.56);

        // Subtle glacial cliff-foot AO right at the waterline + bright snow-drift lip on shore
        float cliffAo = exp(-pow((landFrac - 0.445) / 0.042, 2.0)) * 0.24;
        float snowLip = exp(-pow((landFrac - 0.525) / 0.068, 2.0)) * 0.52;
        vec3 iceLand = mix(landCol, vec3(0.90, 0.95, 0.99), snowLip);

        knownColor = mix(shelfWater, iceLand, tLand) * (1.0 - cliffAo);
      }
    } else {
      // Under-feather beneath shore_v105_edge_01..06 eliminating corner gaps & harsh seams!
      float organicEdge = autotileSmoothField(uPos * 1.9) * 4.5;
      float effDist = coastDist + organicEdge;
      if (!homeIsWater && effDist < 16.0) {
        float tSand = smoother5(1.0 - max(0.0, effDist) / 16.0);
        knownColor = mix(knownColor, vec3(0.75, 0.69, 0.54), tSand * 0.44);
      } else if (homeIsWater && effDist < 18.0) {
        float tShallow = smoother5(1.0 - max(0.0, effDist) / 18.0);
        float tFoam = smoother5(1.0 - max(0.0, effDist) / 5.5);
        vec3 shallowCol = mix(vec3(0.46, 0.67, 0.68), vec3(0.84, 0.87, 0.82), tFoam * 0.55);
        knownColor = mix(knownColor, shallowCol, tShallow * 0.36);
      }
    }
  }

  // Macro hand-painted landscape moisture & warmth mottling (breaks tiled wallpaper regularity!)
  if (!effectiveWater && normKnown > 0.02) {
    float mBroad = autotileSmoothField(uPos * 0.095 + vec2(12.7, -8.3));
    float mMed = autotileSmoothField(uPos * 0.27 + vec2(-33.4, 21.9));
    float mFine = autotileSmoothField(uPos * 1.15 + vec2(7.1, 19.3));
    float mottle = mBroad * 0.56 + mMed * 0.32 + mFine * 0.12;
    // Gentle sunlit golden dry patches vs lush slightly cooler damp hollows (never noisy)
    float brightShift = 1.0 + mottle * 0.068;
    vec3 warmCool = vec3(
      1.0 + mBroad * 0.028 + mMed * 0.012,
      1.0 + mBroad * 0.008 - mMed * 0.006,
      1.0 - mBroad * 0.026 + mMed * 0.014
    );
    knownColor = clamp(knownColor * brightShift * warmCool, 0.0, 1.0);
  }

  // Sculpted directional hillside lighting: warm sunlit slopes vs cool atmospheric shadow slopes!
  if (!effectiveWater && u_reliefEnabled > 0.5 && u_reliefLighting > 0.5) {
    float hillShade = 0.52 + sf.g * 0.96;
    // Soft filmic highlight shoulder prevents neon clipping on bright grass/sand at 100% relief
    if (hillShade > 1.0) {
      float hi = hillShade - 1.0;
      hillShade = 1.0 + hi / (1.0 + hi * 1.35);
    }
    float hd = hillShade - 1.0;
    vec3 lightTint = vec3(1.0 + hd * 1.06, 1.0 + hd * 1.01, 1.0 + hd * 0.88);
    knownColor = clamp(knownColor * lightTint, 0.0, 1.0);
  }

  // Subtle GPU animated water shimmer & sun-glint ripple
  if (effectiveWater && u_windEnabled > 0.5 && normKnown > 0.05) {
    float w1 = sin(uPos.x * 0.042 + uPos.y * 0.028 + u_time * 1.35);
    float w2 = cos(uPos.x * 0.027 - uPos.y * 0.051 + u_time * 0.95);
    float shimmer = w1 * w2;
    float icyDamp = ((homeCell.a & 4u) != 0u) ? 0.35 : 1.0;
    knownColor = clamp(
      knownColor * (1.0 + shimmer * 0.032 * icyDamp)
        + vec3(0.022, 0.028, 0.030) * max(0.0, shimmer - 0.55) * icyDamp,
      0.0,
      1.0
    );
  }

  // Explored-only Fog-of-War darkening & cool desaturation.
  float luma = dot(knownColor, vec3(0.299, 0.587, 0.114));
  vec3 exploredColor = mix(vec3(luma), knownColor, 0.58) * vec3(0.68, 0.72, 0.78);
  vec3 litTerrain = mix(exploredColor, knownColor, normVis);

  // Unknown Fog-of-War: seamless mirrored + rotated sunlit cloud deck (cloud_base) + seamless mirrored cloud_edge puffs!
  vec3 fogBase = vec3(0.76, 0.79, 0.84);
  float edgePuff = 0.0;
  float frontierBand = smoothstep(0.0, 0.16, normKnown) * smoothstep(1.0, 0.84, normKnown);
  if (u_hasClouds > 0.5) {
    float drift = u_windEnabled > 0.5 ? u_time : 0.0;
    vec2 uvA = rawUPos / 940.0 + vec2(drift * 0.0022, drift * 0.0009);
    vec2 mUvA = 1.0 - abs(fract(uvA * 0.5) * 2.0 - 1.0);
    vec2 rotP = vec2(rawUPos.x * 0.7986 - rawUPos.y * 0.6018, rawUPos.x * 0.6018 + rawUPos.y * 0.7986);
    vec2 uvB = rotP / 690.0 + vec2(-drift * 0.0014 + 0.31, drift * 0.0011 + 0.17);
    vec2 mUvB = 1.0 - abs(fract(uvB * 0.5) * 2.0 - 1.0);
    vec3 cA = texture(u_cloudTex, mUvA).rgb;
    vec3 cB = texture(u_cloudTex, mUvB).rgb;
    fogBase = mix(cA, cB, 0.42) * vec3(0.95, 0.96, 0.99);
    if (u_hasCloudEdge > 0.5 && frontierBand > 0.002) {
      vec2 eUv1 = rawUPos / 480.0 + vec2(drift * 0.0028, drift * 0.0010);
      vec2 mEUv1 = 1.0 - abs(fract(eUv1 * 0.5) * 2.0 - 1.0);
      vec2 eUv2 = rotP / 360.0 + vec2(-drift * 0.0016 + 0.37, drift * 0.0018 + 0.19);
      vec2 mEUv2 = 1.0 - abs(fract(eUv2 * 0.5) * 2.0 - 1.0);
      vec4 eA = texture(u_cloudEdgeTex, mEUv1);
      vec4 eB = texture(u_cloudEdgeTex, mEUv2);
      edgePuff = clamp(eA.a * 0.72 + eB.a * 0.46, 0.0, 1.0) * frontierBand;
      vec3 edgeCol = (eA.rgb * eA.a + eB.rgb * eB.a * 0.62) / max(0.001, eA.a + eB.a * 0.62);
      fogBase = mix(fogBase, edgeCol, edgePuff * 0.58);
    }
  }

  float frontier = clamp(normKnown * 1.14 - edgePuff * 0.38, 0.0, 1.0);
  float reveal = smoother5((frontier - 0.10) / 0.78);
  float cloudEdgeShadow = (1.0 - reveal) * smoothstep(0.02, 0.38, normKnown) * 0.22;
  vec3 color = mix(fogBase, litTerrain * (1.0 - cloudEdgeShadow), reveal);

  // Optional crisp pointy-top hex outline & hover highlight.
  bool isHovered = (homeHex.x == u_hoverHex.x && homeHex.y == u_hoverHex.y);
  if (u_showGrid > 0.5 || isHovered) {
    vec2 a = abs(exactRel);
    float edgeDist = max(a.x, a.x * 0.5 + a.y * 0.8660254);
    float distFromBorder = abs(HEX_W * 0.5 - edgeDist);
    float pxWidth = 1.15 / max(0.12, u_zoom);
    if (u_showGrid > 0.5 && normKnown > 0.25) {
      float line = 1.0 - smoothstep(pxWidth * 0.6, pxWidth * 1.6, distFromBorder);
      color = mix(color, vec3(0.96, 0.92, 0.78), line * 0.24);
    }
    if (isHovered) {
      float hLine = 1.0 - smoothstep(pxWidth * 1.1, pxWidth * 2.8, distFromBorder);
      color = mix(color, vec3(1.0, 0.86, 0.42), hLine * 0.88);
      color = mix(color, vec3(1.0, 0.94, 0.72), 0.09);
    }
  }

  fragColor = vec4(color, 1.0);
}
`;function Qn(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${i}`)}return o}var wr=class{constructor(e){this.cellBuf=new Uint8Array(mt*mt*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=Qn(e,e.VERTEX_SHADER,jo),o=Qn(e,e.FRAGMENT_SHADER,$o),i=e.createProgram();if(!i)throw new Error("Failed to create terrain program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let s=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteProgram(i),new Error(`Terrain program link error:
${s}`)}this.program=i;let n=e.createVertexArray();if(!n)throw new Error("Failed to create terrain VAO");this.vao=n;let a=e.createTexture();if(!a)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=a,e.bindTexture(e.TEXTURE_2D,a),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,mt,mt),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let c=e.createTexture();if(!c)throw new Error("Failed to allocate surface field texture");this.surfaceTex=c,e.bindTexture(e.TEXTURE_2D,c),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let l=s=>{let d=e.getUniformLocation(i,s);if(!d)throw new Error(`Missing terrain uniform: ${s}`);return d};this.uCamCenter=l("u_camCenter"),this.uViewportSize=l("u_viewportSize"),this.uZoom=l("u_zoom"),this.uTime=l("u_time"),this.uGridOrigin=l("u_gridOrigin"),this.uGridSize=l("u_gridSize"),this.uForestFloorLayer=l("u_forestFloorLayer"),this.uShowGrid=l("u_showGrid"),this.uHoverHex=l("u_hoverHex"),this.uHasClouds=l("u_hasClouds"),this.uHasCloudEdge=l("u_hasCloudEdge"),this.uSurfaceRect=l("u_surfaceRect"),this.uEdgeBand=l("u_edgeBand"),this.uWaterHexMode=l("u_waterHexMode"),this.uReliefEnabled=l("u_reliefEnabled"),this.uReliefLighting=l("u_reliefLighting"),this.uWindEnabled=l("u_windEnabled"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(i,"u_cellData"),1),e.uniform1i(e.getUniformLocation(i,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(i,"u_surfaceField"),3),e.uniform1i(e.getUniformLocation(i,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return In(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:i,cellTex:n,surfaceTex:a,cellBuf:c}=this,{cam:l,assets:s,lookupHex:d,resolveTerrainLayer:f,isWaterTerrain:h,seedInt:p,dataRevision:v,timeSec:y,showGrid:_,hoverHex:U,edgeBand:G=28,waterSampling:T="hex",reliefEnabled:W=!0,reliefStrength:V=Ht,reliefLighting:g=!0,reliefStyle:M="sculpted",windAnimation:x=!0}=e,A=Pr(l,4),I=A.maxQ-A.minQ+1,L=A.maxR-A.minR+1,B=A.minQ,N=A.minR;I>mt&&(B=Math.floor((A.minQ+A.maxQ)/2)-Math.floor(mt/2),I=mt),L>mt&&(N=Math.floor((A.minR+A.maxR)/2)-Math.floor(mt/2),L=mt);let K=!1;if(B!==this.lastMinQ||N!==this.lastMinR||I!==this.lastSpanQ||L!==this.lastSpanR||v!==this.lastDataRevision){let m=0;for(let b=0;b<L;b++){let E=N+b;for(let C=0;C<I;C++){let D=B+C,H=d(D,E);if(!H||H.fogState===0)c[m++]=0,c[m++]=0,c[m++]=0,c[m++]=0;else{let z=h(H.terrainId)?1:0,ne=Lt.has(H.terrainId)?2:0,J=H.terrainId==="icy_ocean"?4:0;c[m++]=f(H.terrainId,D,E)&255,c[m++]=0,c[m++]=H.fogState,c[m++]=z|ne|J}}}r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,I,L,r.RGBA_INTEGER,r.UNSIGNED_BYTE,c.subarray(0,I*L*4)),this.lastMinQ=B,this.lastMinR=N,this.lastSpanQ=I,this.lastSpanR=L,this.lastDataRevision=v,K=!0}let $=W?V:0,ie=l.viewportWidth*.5/l.zoom,ce=l.viewportHeight*.5/(l.zoom*ze),Z=l.x-ie-140,S=l.x+ie+140,F=l.y/ze-ce-180,w=l.y/ze+ce+220;if(!this.surfaceWin||this.lastSurfaceRevision!==v||this.lastSurfaceStrength!==$||this.lastSurfaceStyle!==M||Z<this.surfaceWin.left||S>this.surfaceWin.left+this.surfaceWin.width||F<this.surfaceWin.top||w>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(S-Z)*3.5){let m=Math.max(384,(S-Z)*.35),b=Math.max(384,(w-F)*.35),E=Z-m,C=F-b,D=S-Z+m*2,H=w-F+b*2,z=Math.max(16,Math.ceil(Math.max(D/200,H/150)));this.surfaceWin=Ln({left:E,top:C,width:D,height:H,step:z,lookupHex:d,manifest:s.manifest,seedInt:p,reliefStrength:$,reliefStyle:M}),this.lastSurfaceRevision=v,this.lastSurfaceStrength=$,this.lastSurfaceStyle=M,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,a),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(i),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,s.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,s.cloudTexture),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,a),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,s.cloudEdgeTexture??s.cloudTexture),r.uniform2f(this.uCamCenter,l.x,l.y),r.uniform2f(this.uViewportSize,l.viewportWidth,l.viewportHeight),r.uniform1f(this.uZoom,l.zoom),r.uniform1f(this.uTime,y),r.uniform2i(this.uGridOrigin,B,N),r.uniform2i(this.uGridSize,I,L),r.uniform1i(this.uForestFloorLayer,s.forestFloorLayer),r.uniform1f(this.uShowGrid,_?1:0),r.uniform2i(this.uHoverHex,U?U.q:-999999,U?U.r:-999999),r.uniform1f(this.uHasClouds,s.cloudTexture?1:0),r.uniform1f(this.uHasCloudEdge,s.cloudEdgeTexture?1:0);let u=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,u?u.left:0,u?u.top:0,u?u.width:1,u?u.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,G))),r.uniform1f(this.uWaterHexMode,T==="hex"?1:0),r.uniform1f(this.uReliefEnabled,W?1:0),r.uniform1f(this.uReliefLighting,g?1:0),r.uniform1f(this.uWindEnabled,x?1:0),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:I*L,uploaded:K}}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Jn=65536,_r=6,Ko=`#version 300 es
precision highp float;
layout(location = 0) in vec2 a_worldPos;
layout(location = 1) in vec4 a_color;

uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;

out vec4 v_color;

void main() {
  vec2 screenOffset = (a_worldPos - u_camCenter) * u_zoom;
  vec2 ndc = vec2(screenOffset.x / (u_viewportSize.x * 0.5), -screenOffset.y / (u_viewportSize.y * 0.5));
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_color = a_color;
}
`,Zo=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,eo={trail:{shoulderWidth:32,coreWidth:16,shoulderColor:[.56,.46,.31,.34],coreColor:[.64,.54,.37,.78]},packed:{shoulderWidth:40,coreWidth:24,shoulderColor:[.47,.39,.28,.45],coreColor:[.69,.6,.45,.88]},stone:{shoulderWidth:46,coreWidth:31,shoulderColor:[.33,.32,.28,.58],coreColor:[.65,.63,.57,.96]}},Sr=class{constructor(e){this.verts=new Float32Array(Jn*_r);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,Ko),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,Zo),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate vector program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),a=e.createBuffer();if(!n||!a)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=a,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let c=_r*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,c,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,c,8),e.bindVertexArray(null);let l=s=>{let d=e.getUniformLocation(i,s);if(!d)throw new Error(`Missing vector uniform: ${s}`);return d};this.uCamCenter=l("u_camCenter"),this.uViewportSize=l("u_viewportSize"),this.uZoom=l("u_zoom")}pushTri(e,r,o,i,n,a,c,l,s,d){if(this.vertCount+3>Jn)return;let f=this.vertCount*_r,h=this.verts;h[f++]=e,h[f++]=r,h[f++]=c,h[f++]=l,h[f++]=s,h[f++]=d,h[f++]=o,h[f++]=i,h[f++]=c,h[f++]=l,h[f++]=s,h[f++]=d,h[f++]=n,h[f++]=a,h[f++]=c,h[f++]=l,h[f++]=s,h[f++]=d,this.vertCount+=3}pushSegment(e,r,o,i){let n=r.x-e.x,a=r.y-e.y,c=Math.hypot(n,a);if(c<1e-4)return;let l=-a/c*(o*.5),s=n/c*(o*.5),[d,f,h,p]=i;this.pushTri(e.x-l,e.y-s,e.x+l,e.y+s,r.x+l,r.y+s,d,f,h,p),this.pushTri(e.x-l,e.y-s,r.x+l,r.y+s,r.x-l,r.y-s,d,f,h,p)}pushDisc(e,r,o,i,n,a){let[c,l,s,d]=a;for(let f=0;f<n;f++){let h=f/n*Math.PI*2,p=(f+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(h)*o,r+Math.sin(h)*i,e+Math.cos(p)*o,r+Math.sin(p)*i,c,l,s,d)}}pushHexFill(e,r,o,i=1){let n=Pe(e,r),a=Zt(e,r),[c,l,s,d]=o;for(let f=0;f<6;f++){let h=a[f],p=a[(f+1)%6],v=n.x+(h.x-n.x)*i,y=n.y+(h.y-n.y)*i,_=n.x+(p.x-n.x)*i,U=n.y+(p.y-n.y)*i;this.pushTri(n.x,n.y,v,y,_,U,c,l,s,d)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*_r)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:i,strategicBlend:n}=e;if(!o)return 0;if(this.vertCount=0,o.territory&&o.territory.length>0){let a=new Map;for(let d of o.territory)a.set(Ae(d.q,d.r),d.ownerId);let c=.08+n*.24,l=Math.max(7,10/Math.max(.2,r.zoom*1.1)),s=.75+n*.2;for(let d of o.territory){let f=i(d.q,d.r);if(f===0)continue;let h=f===1?.65:1,[p,v,y]=d.color;this.pushHexFill(d.q,d.r,[p,v,y,c*h],.98);for(let _=0;_<6;_++){let[U,G]=Re[_];if(a.get(Ae(d.q+U,d.r+G))!==d.ownerId){let{a:W,b:V}=st(d.q,d.r,_),g=Pe(d.q,d.r),M={x:W.x+(g.x-W.x)*.05,y:W.y+(g.y-W.y)*.05},x={x:V.x+(g.x-V.x)*.05,y:V.y+(g.y-V.y)*.05};this.pushSegment(M,x,l,[p,v,y,s*h])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let a=1-n*.85;for(let c of o.buildings){let l=i(c.q,c.r);if(l===0)continue;let s=(l===1?.65:1)*a,d=Pe(c.q,c.r),h=c.kind==="capital"||c.kind==="settlement"||c.kind==="fortress"?106:78,p=h*.72;this.pushDisc(d.x,d.y+4,h*1.18,p*1.18,18,[.42,.36,.26,.22*s]),this.pushDisc(d.x,d.y+4,h*.88,p*.88,16,[.48,.42,.31,.36*s])}}if(o.roads&&o.roads.length>0&&n<.85){let a=1-n*.8,c=new Map,l={trail:1,packed:2,stone:3};for(let s of o.roads){let d=i(s.q1,s.r1),f=i(s.q2,s.r2);if(d===0&&f===0)continue;let h=(d===2||f===2?1:.68)*a,p=Pe(s.q1,s.r1),v=Pe(s.q2,s.r2),y=eo[s.tier];this.pushSegment(p,v,y.shoulderWidth+16,[.44,.37,.25,.18*h]),this.pushSegment(p,v,y.shoulderWidth,[y.shoulderColor[0],y.shoulderColor[1],y.shoulderColor[2],y.shoulderColor[3]*h]),this.pushSegment(p,v,y.coreWidth,[y.coreColor[0],y.coreColor[1],y.coreColor[2],y.coreColor[3]*h]);for(let[_,U,G]of[[s.q1,s.r1,p],[s.q2,s.r2,v]]){let T=Ae(_,U),W=c.get(T);(!W||l[s.tier]>l[W.tier])&&c.set(T,{pt:G,tier:s.tier,dim:h})}}for(let s of c.values()){let d=eo[s.tier];this.pushDisc(s.pt.x,s.pt.y,(d.shoulderWidth+10)*.52,(d.shoulderWidth+10)*.45,12,[.44,.37,.25,.16*s.dim]),this.pushDisc(s.pt.x,s.pt.y,d.coreWidth*.54,d.coreWidth*.46,12,[d.coreColor[0],d.coreColor[1],d.coreColor[2],d.coreColor[3]*s.dim])}}if(o.buildPreview){let a=o.buildPreview;for(let l of a.bonusHexes)this.pushHexFill(l.q,l.r,[.22,.82,.48,.24],.92);let c=a.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(a.center.q,a.center.r,c,.96)}if(o.selectedHex){let a=Zt(o.selectedHex.q,o.selectedHex.r),c=Math.max(5,6/Math.max(.25,r.zoom));for(let l=0;l<6;l++)this.pushSegment(a[l],a[(l+1)%6],c,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:i,timeSec:n}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let a of o.buildings){let c=i(a.q,a.r);if(c===0)continue;let l=c===1?.65:1,s=Pe(a.q,a.r),[d,f,h]=a.factionColor;if(a.rangeRadius&&a.rangeRadius>0){let G=a.rangeRadius*240,T=G*.85,W=36;for(let V=0;V<W;V+=2){let g=V/W*Math.PI*2,M=(V+1)/W*Math.PI*2;this.pushSegment({x:s.x+Math.cos(g)*G,y:s.y+Math.sin(g)*T},{x:s.x+Math.cos(M)*G,y:s.y+Math.sin(M)*T},Math.max(4,3.5/Math.max(.2,r.zoom)),[d,f,h,.45*l])}}let p=a.kind==="capital"||a.kind==="settlement",v=a.kind==="fortress"||a.kind==="watchtower",y=p?78:v?64:52,_=p?68:v?76:42;this.pushDisc(s.x-10,s.y+8,y*1.12,y*.62,16,[.05,.07,.09,.45*l]),this.pushDisc(s.x,s.y+4,y,y*.56,6,[.34,.32,.29,.96*l]);let U=y*.68;this.pushTri(s.x-U,s.y+6,s.x+U,s.y+6,s.x+U,s.y-_*.65,.78*l,.74*l,.66*l,.98),this.pushTri(s.x-U,s.y+6,s.x+U,s.y-_*.65,s.x-U,s.y-_*.65,.66*l,.62*l,.55*l,.98),this.pushTri(s.x-U*1.18,s.y-_*.62,s.x+U*1.18,s.y-_*.62,s.x,s.y-_*1.25,d*l,f*l,h*l,.98),(p||v)&&this.pushTri(s.x-14,s.y-_*.95,s.x+14,s.y-_*.95,s.x,s.y-_*1.55,.96*l,.8*l,.34*l,.98)}if(o.sites)for(let a of o.sites){if(i(a.q,a.r)===0)continue;let l=Pe(a.q,a.r),s=26,d=a.family==="fauna"?[.85,.58,.25,.9]:a.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(l.x,l.y-s,l.x+s,l.y,l.x,l.y+s,d[0],d[1],d[2],d[3]),this.pushTri(l.x,l.y-s,l.x,l.y+s,l.x-s,l.y,d[0]*.8,d[1]*.8,d[2]*.8,d[3])}if(o.units)for(let a of o.units){if(i(a.q,a.r)<2)continue;let[l,s,d]=a.factionColor,f=Pe(a.q,a.r);if(a.marchPath&&a.marchPath.length>=2){let h=a.marchPath.map(M=>Pe(M.q,M.r));for(let M=0;M<h.length-1;M++)this.pushSegment(h[M],h[M+1],Math.max(8,6/Math.max(.2,r.zoom)),[l,s,d,.78]);let p=h[h.length-1],v=h[h.length-2],y=p.x-v.x,_=p.y-v.y,U=Math.hypot(y,_)||1,G=y/U,T=_/U,W=p,V={x:p.x-G*28,y:p.y-T*28};this.pushTri(W.x,W.y,V.x-T*18,V.y+G*18,V.x+T*18,V.y-G*18,l,s,d,.95);let g=n*.14%1;f={x:h[0].x+(h[1].x-h[0].x)*g,y:h[0].y+(h[1].y-h[0].y)*g}}if(a.inCombat){let h=1+.22*Math.sin(n*5);this.pushDisc(f.x,f.y,56*h,44*h,20,[.98,.26,.22,.35])}this.pushDisc(f.x,f.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(f.x,f.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(f.x,f.y-16,26,26,18,[l,s,d,.98])}if(o.walls)for(let a of o.walls){if(!a.breached)continue;let c=ut(a.q1,a.r1,a.q2,a.r2);if(c<0)continue;let{mid:l}=st(a.q1,a.r1,c),s=1+.18*Math.sin(n*4.5);this.pushDisc(l.x,l.y,32*s,24*s,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Qo=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],Jo=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],ei={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function ti(t,e,r,o){let i=t.infrastructure.sprites,n=[];if(e==="stone"){if(o){let a=r===5?2:r;n.push(`walls/stone/gates/v1/gate_dir${a}`),n.push(`walls/stone/v7/edge_dir${r}`)}else n.push(`walls/stone/v7/edge_dir${r}`);n.push(`walls/palisade/edge_dir${r}`)}else o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`);for(let a of n)if(i[a])return a;return null}function ri(t,e,r){let o=t.infrastructure.sprites,i=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${i}`,`walls/palisade/${i}`]:[`walls/palisade/${i}`];for(let a of n)if(o[a])return a;return null}function to(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,i,n,a]=r.boundsInSpriteWidth,c=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*c,shadowRelTop:i*c,shadowWidth:(n-o)*c,shadowHeight:(a-i)*c}}function ro(t,e,r){if(!e.length)return[];let o=[],i=new Map;for(let n of e){let a=ut(n.q1,n.r1,n.q2,n.r2);if(a<0)continue;let c=r(n.q1,n.r1),l=r(n.q2,n.r2),s=c>=l?c:l;if(s===0)continue;let{a:d,b:f,mid:h}=st(n.q1,n.r1,a),p=ti(t,n.kind,a,!!n.isGate);if(p){let v=t.infrastructure.sprites[p],y=p.includes("/stone/"),[_,U,G,T]=y?Jo[a]:Qo[a],W=Math.abs(f.x-d.x)<=1e-6?y?5.5:3.5:0,V=y?"stone":"palisade";o.push({x:d.x,y:d.y,relLeft:-G,relTop:-T+W,width:_,height:U,page:v.page,u0:v.uv[0],v0:v.uv[1],u1:v.uv[2],v1:v.uv[3],sortY:h.y,fogState:s,...to(t,`wall_shadow:${V}:dir${a}`)})}for(let v of[d,f]){let y=`${Math.round(v.x*10)},${Math.round(v.y*10)}`,_=i.get(y);_||(_={x:v.x,y:v.y,degree:0,hasPalisade:!1,hasStone:!1,fog:s},i.set(y,_)),_.degree++,n.kind==="palisade"&&(_.hasPalisade=!0),n.kind==="stone"&&(_.hasStone=!0),s>_.fog&&(_.fog=s)}}for(let n of i.values()){let a=n.hasStone&&!n.hasPalisade?"stone":"palisade",c=n.degree===1,l=ri(t,a,c);if(!l)continue;let s=t.infrastructure.sprites[l],d=ei[a],f=c?d.endW:d.cornerW,h=c?d.endH:d.cornerH;o.push({x:n.x,y:n.y,relLeft:-f*.5,relTop:-h+d.south,width:f,height:h,page:s.page,u0:s.uv[0],v0:s.uv[1],u1:s.uv[2],v1:s.uv[3],sortY:n.y+1,fogState:n.fog,...to(t,`wall_shadow:${a}:post`)})}return o.sort((n,a)=>n.sortY-a.sortY||n.x-a.x),o}var rn={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0},Cr=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=en(null);this.cachedWallSprites=[];this.wallCacheRevision=-1;this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...lt,...o.forestConfig??{}},this.reliefConfig={...Rt,...o.reliefConfig??{}},this.visualConfig={...rn,...o.visualConfig??{}};let i=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!i)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=i,this.terrainPass=new wr(i),this.riverPass=new cr(i),this.vectorPass=new Sr(i),this.spriteBatcher=new xr(i),this.camera=new br(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await Zr(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new Nt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await Zr(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let i=this.assets;return this.assets=o,this.chunkManager=new Nt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,i?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheRevision=-1,this.infrastructureClearance=en(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let r=0;r<e.length;r++){let o=e[r];if(o.inCombat||o.marchPath&&o.marchPath.length>=2)return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let i=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let a=this.camera.state,c=this.gl;c.viewport(0,0,c.canvas.width,c.canvas.height);let l=(e-this.startTimeMs)*.001,s=Jr(a.zoom),d=1-s,f=d>.02,h=this.visualConfig.windAnimation!==!1,{sprites:p,fogStates:v,decals:y,decalFogStates:_,shorelines:U,shoreFogStates:G,riverRoutes:T,chunksLoadedThisFrame:W,hasPendingChunks:V}=o.prepareVisibleFrame(a,f?2:6,f),g=(b,E)=>{let C=o.lookupTerrainHex(b,E);return C?C.fogState:0},M=performance.now(),x=this.terrainPass.render({cam:a,assets:r,lookupHex:(b,E)=>o.lookupTerrainHex(b,E),resolveTerrainLayer:(b,E,C)=>o.resolveTerrainLayer(b,E,C),isWaterTerrain:b=>o.isWaterTerrain(b),seedInt:o.seedInt,dataRevision:o.revision,timeSec:l,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:h}),A=this.spriteBatcher.renderShorelines({cam:a,shorelines:U,fogStates:G,infraPages:r.infraPages,projectY:ze}),I=this.riverPass.render({cam:a,assets:r,routes:T,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:(b,E)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(b,E):0,lookupFog:g,lookupHex:(b,E)=>o.lookupTerrainHex(b,E),timeSec:l,windAnimation:h}),L=this.vectorPass.renderGroundPass({cam:a,scene:this.dynamicScene,lookupFog:g,strategicBlend:s}),B=performance.now(),N=p,K=v;if(!this.infrastructureClearance.isEmpty&&p.length>0){N=[],K=[];for(let b=0;b<p.length;b++){let E=p[b];tn(E,this.infrastructureClearance)||(N.push(E),K.push(v[b]))}}let $=this.dynamicScene?.customSprites;if(f&&$&&$.length>0){let b=[];for(let E=0;E<N.length;E++)b.push({sprite:N[E],fog:K[E]});for(let E of $){let C=r.manifest.nature.sprites[E.spriteKey];if(!C)continue;let D=Pe(E.q,E.r),H=D.x+(E.offsetX??0),z=D.y+(E.offsetY??0),ne=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(H,z/ze)*ze:0,J=(E.worldWidthOverride??C.worldWidth)*Ct(C)*(E.scale??1),ee=J*C.aspect,ae=r.manifest.shadows.sprites[E.spriteKey],fe=E.anchorOverride??C.anchor;b.push({sprite:{x:H,y:z-ne,sortY:z,width:J,height:ee,anchorX:fe[0],anchorY:fe[1],page:C.page,u0:C.uv[0],v0:C.uv[1],u1:C.uv[2],v1:C.uv[3],q:E.q,r:E.r,isMountain:C.kind==="mountain",isSnowFamily:nr(C),shadowTier:Yr(C,J,ee),selfShadeWeight:jr(C),shadowPage:ae?ae.page:-1,shadowU0:ae?ae.uv[0]:0,shadowV0:ae?ae.uv[1]:0,shadowU1:ae?ae.uv[2]:0,shadowV1:ae?ae.uv[3]:0,shadowMinX:ae?ae.boundsInSpriteWidth[0]:0,shadowMinY:ae?ae.boundsInSpriteWidth[1]:0,shadowMaxX:ae?ae.boundsInSpriteWidth[2]:0,shadowMaxY:ae?ae.boundsInSpriteWidth[3]:0},fog:g(E.q,E.r)})}b.sort((E,C)=>(E.sprite.sortY??E.sprite.y)-(C.sprite.sortY??C.sprite.y)||E.sprite.x-C.sprite.x),N=b.map(E=>E.sprite),K=b.map(E=>E.fog)}let ie=this.sceneRevision*1000003+o.revision;this.wallCacheRevision!==ie&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?ro(r.manifest,this.dynamicScene.walls,g):[],this.wallCacheRevision=ie);let ce=0;if(f&&y.length>0){let b=y,E=_;if(!this.infrastructureClearance.isEmpty){b=[],E=[];for(let C=0;C<y.length;C++){let D=y[C];tn(D,this.infrastructureClearance)||(b.push(D),E.push(_[C]))}}b.length>0&&(ce=this.spriteBatcher.renderWorldSprites({cam:a,sprites:b,fogStates:E,naturePages:r.naturePages,detailOpacity:d,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:l,windAnimation:!1}).drawCalls)}let Z=this.spriteBatcher.renderShadows({cam:a,sprites:N,fogStates:K,walls:this.cachedWallSprites,shadowPages:r.shadowPages,shadowOpacity:this.shadowOpacity,detailOpacity:d}),S=performance.now(),F=this.spriteBatcher.renderWaterSurfRings({cam:a,sprites:N,fogStates:K,detailOpacity:d,timeSec:l,windAnimation:h}),w=this.spriteBatcher.renderWorldSprites({cam:a,sprites:N,fogStates:K,naturePages:r.naturePages,walls:this.cachedWallSprites,infraPages:r.infraPages,detailOpacity:d,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:this.shadowOpacity,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:l,windAnimation:h}),R=this.vectorPass.renderTacticalPass({cam:a,scene:this.dynamicScene,lookupFog:g,timeSec:l});this.overlayCanvas&&$n({canvas:this.overlayCanvas,cam:a,scene:this.dynamicScene,lookupFog:g,strategicBlend:s,timeSec:l});let u=performance.now();this.hasPendingStream=V||W>0;let m=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!m||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let b=this.frameTimes.length>0?this.frameTimes.reduce((C,D)=>C+D,0)/this.frameTimes.length:Math.max(16.6,u-i),E={fps:Math.min(120,Math.round(1e3/Math.max(8,b))),frameMs:Number((u-i).toFixed(2)),terrainPassMs:Number((B-M).toFixed(2)),shadowPassMs:Number((S-B).toFixed(2)),spritePassMs:Number((u-S).toFixed(2)),drawCalls:1+A.drawCalls+I+L+ce+Z.drawCalls+F+w.drawCalls+R,visibleHexes:x.visibleHexes,renderedSprites:w.renderedSprites,renderedShadows:Z.renderedShadows,loadedChunks:o.loadedChunkCount,mode:Yn(a.zoom),strategicBlend:Number(s.toFixed(2)),vramTier:r.vramTier,zoom:Number(a.zoom.toFixed(2)),centerHex:et(a.x,a.y)};this.options.onMetrics(E)}return m}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.assets?.dispose(),this.assets=null}};var oo={VedrasMapEngine:Cr,createGeographyV2ChunkProvider:Un,createSandboxScenario:Nn,computeScenarioFog:Vn,evaluateDecision0121BuildPreview:Xt,SANDBOX_SCENARIO_LIST:Xn,VIELFALT_MIX_OVERRIDES:Et,DEFAULT_FOREST_CONFIG:lt,DEFAULT_RELIEF_CONFIG:Rt,DEFAULT_VISUAL_CONFIG:rn,computeBoulderSpawnScale:ur,sizeFactor:Ct,GeographyV2:no.default,hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:Re,axialToWorld:Pe,worldToAxial:et,hexDistance:tt,hexKey:Ae,hexEdgeEndpoints:st,canonicalEdgePair:Wt,neighborDirection:ut,pickNearestHexEdge:ln}};typeof window<"u"&&(window.VedrasMapEngineLib=oo);var ls=oo;})();
