/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var Co=Object.create;var hn=Object.defineProperty;var Ro=Object.getOwnPropertyDescriptor;var Mo=Object.getOwnPropertyNames;var Eo=Object.getPrototypeOf,To=Object.prototype.hasOwnProperty;var Po=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var Ao=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Mo(e))!To.call(t,i)&&i!==r&&hn(t,i,{get:()=>e[i],enumerable:!(o=Ro(e,i))||o.enumerable});return t};var Lr=(t,e,r)=>(r=t!=null?Co(Eo(t)):{},Ao(e||!t||!t.__esModule?hn(r,"default",{value:t,enumerable:!0}):r,t));var Kt=Po((Wi,$t)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],i=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),a=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],l=[],c=(v,W=0,R=1)=>Math.min(R,Math.max(W,v)),s=(v,W)=>v+","+W;function u(v){let W=2166136261;for(let R=0;R<v.length;R++)W^=v.charCodeAt(R),W=Math.imul(W,16777619);return W>>>0}let h=Object.create(null);function f(v){let W=typeof v=="string"?v:String(v),R=h[W];return R===void 0&&(R=u(W),h[W]=R),R}function m(v,W,R,I){let k=v^Math.imul(W+32767,374761393)^Math.imul(R+65521,668265263)^I;return k=Math.imul(k^k>>>15,2246822519),k=Math.imul(k^k>>>13,3266489917),(k^k>>>16)>>>0}function p(v,W,R,I){return m(v,W,R,f(I))}let b=(v,W,R,I)=>m(v,W,R,f(I))/4294967296,_=v=>v*v*(3-2*v);function A(v,W,R){let I=W.reduce((d,[,g])=>d+R[g],0);if(I<=0)return W[0][0];let k=c(v,0,.999999999)*I;for(let[d,g]of W)if(k-=R[g],k<0)return d;return W[W.length-1][0]}let D=(v,W,R)=>v+(W-v)*R;function x(v,W,R,I,k){let d=W/I,g=R/I,S=Math.floor(d),q=Math.floor(g),F=_(d-S),z=_(g-q),G=f(k),J=1/4294967296,ge=m(v,S,q,G)*J,Z=m(v,S+1,q,G)*J,ve=m(v,S,q+1,G)*J,Ce=m(v,S+1,q+1,G)*J;return D(D(ge,Z,F),D(ve,Ce,F),z)}function M(){return a.map(([v,W,R,I,k,d,g,S])=>({group:v,id:W,label:R,defaultValue:I,min:k,max:d,step:g,help:S}))}function X(){return Object.fromEntries(a.map(v=>[v[1],v[3]]))}function w(v){if(v!==void 0&&(typeof v!="object"||v===null||Array.isArray(v)))throw Error("Ung\xFCltige Parameterdatei.");let W=X();for(let[,R,,I,k,d]of a){if(v?.[R]===void 0)continue;let g=Number(v[R]);if(!Number.isFinite(g)||g<k||g>d)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+R);W[R]=g}if(W["relief.mountainFraction"]+W["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return W}function y(v){if(!Array.isArray(v)||!v.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let W=v.map(I=>I?.stats??I);if(W.some(I=>!I||!Number.isFinite(I.total)||I.total<=0||!Number.isFinite(I.land)||I.land<0||I.land>I.total||!I.biomes||!I.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function R(I,k,d){let g=[...new Set([...I,...W.flatMap(q=>Object.keys(q[k]))])],S=W.reduce((q,F)=>q+F[d],0);return Object.fromEntries(g.map(q=>{let F=W.map(G=>G[k][q]||0),z=F.reduce((G,J)=>G+J,0);return[q,{total:z,mean:z/W.length,percent:S?100*z/S:0,worldsPresent:F.filter(G=>G>0).length}]}))}return{generatorVersion:e,samples:W.length,meanHexes:W.reduce((I,k)=>I+k.total,0)/W.length,meanLand:W.reduce((I,k)=>I+k.land,0)/W.length,biomes:R(n,"biomes","land"),terrains:R(i,"terrains","total")}}function E(v){if(!v||typeof v.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(v.id)||a.some(W=>W[1]===v.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let W of["defaultValue","min","max","step"])if(!Number.isFinite(v[W]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+W);if(v.min>v.defaultValue||v.defaultValue>v.max||v.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");a.push([String(v.group||"Erweiterungen"),v.id,String(v.label||v.id),v.defaultValue,v.min,v.max,v.step,String(v.help||"")])}function L(v){if(!v||!/^extension\.[a-z0-9_.]+$/.test(v.id)||typeof v.place!="function"||l.some(W=>W.id===v.id))throw Error("Ung\xFCltige Feature-Erweiterung.");l.push(v)}function T(v,W){return o.map(([R,I])=>W.get(s(v.q+R,v.r+I))).filter(Boolean)}function H(v,W,R,I,k,d=null,g=null){if(v==="arid"){if(R>k["biomes.dryThreshold"]-k["biomes.semiDesertMargin"])return"semi_desert";let S=D(I,g===null?I:g,k["geology.aridPatchMix"]),q=c(S+(k["geology.sandBias"]-.5)*.36);return A(q,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],k)}return v==="grassland"?R<k["geology.grassSparseHumidity"]?"sparse_pasture":I<k["geology.pastureSoil"]?"pasture":"grassland":v==="cold"?d&&d.hill>k["geology.highlandSoil"]&&W>=k["biomes.coldBoundary"]-k["geology.highlandColdMargin"]?"highland":W<k["biomes.coldBoundary"]-.04?R>k["biomes.snowHumidity"]?"snowfields":"frozen_tundra":W<k["biomes.coldBoundary"]&&R>.8?"snowfields":"tundra":v==="wetland"?W>k["geology.swampWarmBoundary"]?"swamp":W<.38?"moor":R>.85?"marshland":I>k["geology.wetlandSoil"]?"moor":"marshland":v==="jungle"?"jungle":v==="savanna"?R<.33?"semi_desert":"savanna":"grassland"}function Q(v,W,R){return v<R["biomes.coldBoundary"]?"cold":W>R["biomes.wetThreshold"]?v>R["biomes.jungleWarmBoundary"]?"jungle":"wetland":W<R["biomes.dryThreshold"]&&v>R["biomes.aridWarmBoundary"]?"arid":v>R["biomes.warmBoundary"]?"savanna":W>R["biomes.wetlandBoundary"]?"wetland":"grassland"}function N(v,W,R,I){let k=Math.sqrt(I["biomes.targetHexes"]),d=I["biomes.borderWarp"]*k,g=W+d*(x(v,W,R,k*.72,"warp-a")-.5)*2,S=R+d*(x(v,W,R,k*.72,"warp-b")-.5)*2,q=Math.floor(g/k),F=Math.floor(S/k),z=1/0,G=null;for(let J=-1;J<=1;J++)for(let ge=-1;ge<=1;ge++){let Z=q+ge,ve=F+J,Ce=(Z+.5+(b(v,Z,ve,"jit-q")-.5)*.72)*k,de=(ve+.5+(b(v,Z,ve,"jit-r")-.5)*.72)*k,ie=(g-Ce)*(g-Ce)+(S-de)*(S-de);ie<z&&(z=ie,G={id:s(Z,ve),x:Ce,y:de})}return G}let Y=(v,W)=>Math.max(Math.abs(v.q-W.q),Math.abs(v.r-W.r),Math.abs(v.q+v.r-W.q-W.r));function C(v,W,R,I,k=()=>!0){if(R<=0)return 1/0;let d=[];for(let g=0;g<1900;g++){let S=Math.floor((b(v,g,0,"sampleQ:"+W)-.5)*6900),q=Math.floor((b(v,g,1,"sampleR:"+W)-.5)*6900);k(S,q)&&d.push(I(S,q))}return d.length?(d.sort((g,S)=>S-g),d[Math.min(d.length-1,Math.floor(c(R)*d.length))]):1/0}function oe(v,W){if(typeof v!="string"||v.length<1||v.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let R=w(W),I=u(r+":"+v),k={...R,"biomes.targetHexes":Math.max(5,R["geology.scale"]*1.5)},d=new Map,g=new Map,S=new Map,q=(P,O)=>s(P,O),F=(P,O)=>c(R["climate.temperature"]+(x(I,P,O,R["climate.scale"],"temp")-.5)*2*R["climate.tempVariation"]),z=(P,O)=>c(R["climate.humidity"]+(x(I,P,O,R["climate.scale"]*.9,"wet")-.5)*2*R["climate.humidityVariation"]);function G(P,O){let se=x(I,P,O,R["water.scale"],"sea"),te=x(I,P,O,Math.max(3,R["water.scale"]*.45),"sea-mid"),B=x(I,P,O,Math.max(2,R["water.scale"]*.21),"shore"),U=.2+.3*R["water.coastDetail"];return(se+te)*.5*(1-U)+B*U}function J(P,O){let se=x(I,P,O,4.2,"lakes");return G(P,O)-Math.max(0,se-.68)*R["water.lakeInfluence"]}let ge=C(I,"water",R["water.fraction"],(P,O)=>-G(P,O));function Z(P,O){let se=q(P,O);if(d.has(se))return d.get(se);let te=-J(P,O)>=ge;return d.set(se,te),te}function ve(P,O){let se=q(P,O);if(g.has(se))return g.get(se);let te=x(I,P,O,R["relief.scale"],"relief"),B=Math.max(6,R["relief.chainLength"]),U=P+(x(I,P,O,B*.58,"m-warp-q")-.5)*11,ae=O+(x(I,P,O,B*.58,"m-warp-r")-.5)*11,re=1-Math.abs(x(I,U*.56+ae*.36,ae*1.18,B,"ridge")-.5)*2,$=1-Math.abs(x(I,U*.34-ae*.74,U*1.08,B*1.25,"ridge-b")-.5)*2,le=Math.max(re,$*.86),Ae=Math.pow(le,3.6),pe=1-Math.abs(x(I,P*.92+O*.28,O*.96,7.5,"m-pass-a")-.5)*2,qe=1-Math.abs(x(I,P*.28-O*.92,P*.96,8.2,"m-pass-b")-.5)*2,Be=Math.max(pe,qe),Xe=Be>.82?Math.pow((Be-.82)/.18,.7)*.62:0,je=.92-.14*c(R["relief.chainWidth"],.05,.95),et=c(Ae*je+te*(1-je)-Xe,0,1),mt=c(le*.65+te*.35,0,1),st={mass:te,mountain:et,oreBelt:mt,hill:te*.75+x(I,P,O,R["relief.scale"]*.46,"hills")*.25};return g.set(se,st),st}let Ce=C(I,"mountain",R["relief.mountainFraction"],(P,O)=>ve(P,O).mountain,(P,O)=>!Z(P,O)),de=(P,O)=>!Z(P,O)&&ve(P,O).mountain>=Ce,ie=new Map,j=(P,O)=>{let se=q(P,O);if(ie.has(se))return ie.get(se);if(!de(P,O))return ie.set(se,!1),!1;let te=!1;for(let B=-2;B<=2&&!te;B++){let U=Math.max(-2,-B-2),ae=Math.min(2,-B+2);for(let re=U;re<=ae;re++)if(!(B===0&&re===0)&&!de(P+B,O+re)){te=!0;break}}return ie.set(se,te),te},ee=C(I,"hills",R["relief.hillFraction"],(P,O)=>ve(P,O).hill,(P,O)=>!Z(P,O)&&!j(P,O)),me=(P,O)=>!Z(P,O)&&!j(P,O)&&ve(P,O).hill>=ee,ye=Math.min(16,Math.max(3,Math.ceil(R["climate.coastalDecay"]*3))),Le=new Map;function Se(P,O){let se=q(P,O);if(Le.has(se))return Le.get(se);if(Z(P,O))return Le.set(se,0),0;let te=ye+1;e:for(let B=1;B<=ye;B++)for(let U=-B;U<=B;U++){let ae=Math.max(-B,-U-B),re=Math.min(B,-U+B);for(let $=ae;$<=re;$++)if(Math.max(Math.abs(U),Math.abs($),Math.abs(U+$))===B&&Z(P+U,O+$)){te=B;break e}}return Le.set(se,te),te}let ke=new Map;function Ee(P,O){let se=q(P,O);if(S.has(se))return S.get(se);let te=F(P,O),B=z(P,O),U=Se(P,O),ae=c(B+R["climate.coastalHumidity"]*Math.exp(-U/R["climate.coastalDecay"])),re=N(I,P,O,R);ke.has(re.id)||ke.set(re.id,{t:F(re.x,re.y),h:z(re.x,re.y)});let $=ke.get(re.id),le=R["biomes.regionClimateMix"],Ae=c($.t*le+te*(1-le)),pe=c($.h*le+ae*(1-le)),qe=Q(Ae,pe,R),Be=x(I,P,O,R["geology.scale"],"soil"),Xe=ve(P,O),je=(qe==="arid"&&R["geology.aridPatchMix"]>0?N(I,P,O,k):null)?.id.split(",").map(Number),et=je?b(I,je[0],je[1],"arid-patch"):null,mt={t:te,h:ae,center:re,family:qe,soil:Be,landRelief:Xe,aridPatch:et,riverPotential:c(ae*.68+Xe.mass*.18+Math.min(U,15)/30)};return S.set(se,mt),mt}function Re(P,O){return Z(P,O)?o.some(([se,te])=>!Z(P+se,O+te))?"coastal_water":F(P,O)<R["water.iceTemperature"]?"icy_ocean":x(I,P,O,R["water.scale"]*.8,"storm")>1-R["water.stormChance"]?"stormy_ocean":"ocean":"land"}function We(P){let O=(se,te)=>b(I,P.q,P.r,"feature:"+se)<te/1e3;P.surfaceClass==="land"&&P.reliefClass!=="mountain"?(O("iron",R["features.ironPer1000"])&&Ee(P.q,P.r).landRelief.oreBelt>.3&&P.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(P.baseBiome)&&O("animals",R["features.animalsPer1000"])&&(P.baseBiome==="wetland"||P.baseBiome==="jungle"?P.features.push("pigs"):P.baseBiome==="savanna"||P.terrainId==="sparse_pasture"?P.features.push("horses"):P.features.push(b(I,P.q,P.r,"species")>.5?"pigs":"horses")),O("ruins",R["features.ruinsPer1000"])&&P.features.push("ruins"),O("obelisk",R["features.obelisksPer1000"])&&P.features.push("obelisk"),P.baseBiome==="arid"&&O("oasis",R["features.oasesPer1000"])&&P.features.push("oasis")):P.surfaceClass!=="land"&&O("wreck",R["features.wrecksPer1000"])&&P.features.push("wreck");for(let se of l)se.place({hex:P,config:R,seed:v,random:te=>b(I,P.q,P.r,se.id+":"+te)})&&P.features.push(se.id);return P}function Ve(P,O){let se=Re(P,O),te=se==="land",B=te?Ee(P,O):null,U=te&&j(P,O),ae=te&&!U&&me(P,O),re=te?B.family==="jungle"?1:B.family==="grassland"?.86:B.family==="wetland"?.76:B.family==="savanna"?.46:B.family==="cold"?.25:.08:0,$=te?(x(I,P,O,R["forest.patchScale"],"forest")-.5)*1.6+R["forest.coverage"]-.3+(B.h-.5)*.35:0,le=U?0:B?.family==="jungle"?Math.max(.76,c($)):c($)*re,Ae=U?"none":B?.family==="jungle"||le>=R["forest.denseThreshold"]*R["forest.denseFactor"]?"dense_forest":le>R["forest.lightThreshold"]?"light_forest":"none";return{q:P,r:O,temperature:B?.t??F(P,O),humidity:B?.h??z(P,O),regionId:B?.center.id??"",baseBiome:B?.family??null,terrainId:te?H(B.family,B.t,B.h,B.soil,R,B.landRelief,B.aridPatch):se,surfaceClass:se,reliefClass:U?"mountain":ae?"hills":"flat",hillProfile:ae?["rounded","steep","chain","plateau","ridge"][Math.floor(b(I,Math.floor(P/3),Math.floor(O/3),"hill-style")*5)]:null,hillStrength:ae?c(B.landRelief.hill*R["relief.hillVariation"]+(1-R["relief.hillVariation"])*.4):0,mountainClass:U?"massif":null,forestDensity:le,forestClass:Ae,riverPotential:B?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function Ge(P,O,se,te){let B=R["rivers.maxLength"],U=R["rivers.minLength"],ae=B+1,re=2*B+2,$=(he,ce)=>he>=P&&he<P+se&&ce>=O&&ce<O+te,le=P-re,Ae=O-re,pe=se+2*re,qe=te+2*re,Be=new Int16Array(pe*qe);Be.fill(-1);let Xe=new Int32Array(pe*qe),at=new Int32Array(pe*qe),je=0,et=0;for(let he=0;he<qe;he++){let ce=Ae+he,xe=he*pe;for(let _e=0;_e<pe;_e++){let be=le+_e;Z(be,ce)&&(Be[xe+_e]=0,Xe[et]=be,at[et]=ce,et++)}}for(;je<et;){let he=Xe[je],ce=at[je];je++;let xe=Be[(ce-Ae)*pe+(he-le)];if(xe>=B)continue;let _e=xe+1;for(let be=0;be<6;be++){let Te=he+o[be][0],we=ce+o[be][1],ze=Te-le,Oe=we-Ae;if(ze<0||ze>=pe||Oe<0||Oe>=qe)continue;let Ke=Oe*pe+ze;Be[Ke]>=0||j(Te,we)||(Be[Ke]=_e,Xe[et]=Te,at[et]=we,et++)}}let mt=[],st=new Map,Ar=R["rivers.sourcesPer100"]/100,kr=f("river-source"),Wr=f("river-turn"),ne=1/4294967296;function fe(he,ce){for(let[xe,_e]of[[he,ce],[ce,he]]){if(!$(xe.q,xe.r)||Z(xe.q,xe.r))continue;let be=o.findIndex(([ze,Oe])=>xe.q+ze===_e.q&&xe.r+Oe===_e.r);if(be<0)continue;let Te=q(xe.q,xe.r),we=st.get(Te);we||(we=[],st.set(Te,we)),we.includes(be)||we.push(be)}}for(let he=O-ae;he<O+te+ae;he++)for(let ce=P-ae;ce<P+se+ae;ce++){if(m(I,ce,he,kr)*ne>=Ar||Be[(he-Ae)*pe+(ce-le)]<U||Z(ce,he)||j(ce,he)||Ee(ce,he).riverPotential<.36)continue;let _e=[{q:ce,r:he}],be={q:ce,r:he};for(let Te=0;Te<B;Te++){let we=Be[(be.r-Ae)*pe+(be.q-le)];if(we<=0)break;let ze=null,Oe=1/0;for(let Ke=0;Ke<6;Ke++){let Ze=be.q+o[Ke][0],_t=be.r+o[Ke][1],Qe=Ze-le,vt=_t-Ae;if(Qe<0||Qe>=pe||vt<0||vt>=qe||Be[vt*pe+Qe]!==we-1)continue;let yt=ve(Ze,_t).hill*(1-R["rivers.meander"])+m(I,Ze,_t,Wr)*ne*R["rivers.meander"];yt<Oe&&(Oe=yt,ze={q:Ze,r:_t})}if(!ze)break;be=ze,_e.push(be)}if(!(!Z(be.q,be.r)||_e.length-1<U)&&_e.some(Te=>$(Te.q,Te.r))){mt.push(_e.map(Te=>[Te.q,Te.r]));for(let Te=1;Te<_e.length;Te++)fe(_e[Te-1],_e[Te])}}for(let he of st.values())he.sort((ce,xe)=>ce-xe);return{routes:mt,edgesByKey:st}}function Ue(P,O){return We(Ve(P,O))}return{c:R,s:I,spot:q,wet:Z,relief:ve,isMountain:j,isHill:me,field:Ee,surface:Re,buildBaseCell:Ve,attachFeatures:We,sampleCell:Ue,traceRivers:Ge}}function ue(v,W={}){if(typeof v!="string"||v.length<1||v.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let R=W.width===void 0?100:Number(W.width),I=W.height===void 0?80:Number(W.height),k=W.originQ===void 0?0:Number(W.originQ),d=W.originR===void 0?0:Number(W.originR);if(!Number.isSafeInteger(R)||!Number.isSafeInteger(I)||R<10||I<10||R*I>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(k)||!Number.isSafeInteger(d)||Math.abs(k)>1e6||Math.abs(d)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let g=oe(v,W.config),{c:S,s:q,spot:F,wet:z,relief:G,isMountain:J,field:ge,buildBaseCell:Z,attachFeatures:ve}=g,Ce=[],de=new Map;for(let B=d;B<d+I;B++)for(let U=k;U<k+R;U++){let ae=Z(U,B);Ce.push(ae),de.set(F(U,B),ae)}let ie=S["rivers.maxLength"],j=S["rivers.minLength"],ee=ie+1,me=2*ie+2,ye=new Map,Le=[];for(let B=d-me;B<d+I+me;B++)for(let U=k-me;U<k+R+me;U++)z(U,B)&&(ye.set(F(U,B),0),Le.push({q:U,r:B}));let Se=k-me,ke=k+R+me-1,Ee=d-me,Re=d+I+me-1;for(let B=0;B<Le.length;B++){let U=Le[B],ae=ye.get(F(U.q,U.r));if(!(ae>=ie))for(let[re,$]of o){let le=U.q+re,Ae=U.r+$,pe=F(le,Ae);le<Se||le>ke||Ae<Ee||Ae>Re||J(le,Ae)||ye.has(pe)||(ye.set(pe,ae+1),Le.push({q:le,r:Ae}))}}let We=[],Ve=[];function Ge(B,U){for(let[ae,re]of[[B,U],[U,B]]){let $=de.get(F(ae.q,ae.r));if(!$||$.surfaceClass!=="land")continue;$.river=!0;let le=o.findIndex(([Ae,pe])=>ae.q+Ae===re.q&&ae.r+pe===re.r);le>=0&&!$.riverEdges.includes(le)&&$.riverEdges.push(le)}}for(let B=d-ee;B<d+I+ee;B++)for(let U=k-ee;U<k+R+ee;U++){if(z(U,B)||J(U,B)||b(q,U,B,"river-source")>=S["rivers.sourcesPer100"]/100)continue;let ae=ye.get(F(U,B));if(ae===void 0||ae<j||ge(U,B).riverPotential<.36)continue;let re=[{q:U,r:B}],$={q:U,r:B};for(let le=0;le<ie;le++){let Ae=ye.get(F($.q,$.r));if(Ae===0)break;let pe=o.map(([Be,Xe])=>({q:$.q+Be,r:$.r+Xe})).filter(Be=>ye.get(F(Be.q,Be.r))===Ae-1);if(!pe.length)break;let qe=Be=>G(Be.q,Be.r).hill*(1-S["rivers.meander"])+b(q,Be.q,Be.r,"river-turn")*S["rivers.meander"];pe.sort((Be,Xe)=>qe(Be)-qe(Xe)),$=pe[0],re.push($)}if(!(!z($.q,$.r)||re.length-1<j)&&re.some(le=>de.has(F(le.q,le.r)))){Ve.push(re),re.every(le=>de.has(F(le.q,le.r)))&&We.push(re.map(le=>[le.q,le.r]));for(let le=1;le<re.length;le++)Ge(re[le-1],re[le])}}for(let B of Ce)ve(B),B.riverEdges.sort((U,ae)=>U-ae);let Ue=Ce.filter(B=>B.surfaceClass==="land").length,P={total:Ce.length,land:Ue,water:Ce.length-Ue,coast:0,hills:0,mountains:0,rivers:We.length,riverCrossingCount:Ve.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},O=new Map;for(let B of Ce){B.surfaceClass==="coastal_water"&&P.coast++,B.reliefClass==="hills"&&P.hills++,B.reliefClass==="mountain"&&P.mountains++,B.river&&P.riverHexes++,B.forestClass!=="none"&&P.forest++,B.baseBiome&&(P.biomes[B.baseBiome]=(P.biomes[B.baseBiome]||0)+1,O.set(B.regionId,(O.get(B.regionId)||0)+1)),B.surfaceClass==="land"&&B.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(B.baseBiome)&&P.forestEligible++,P.terrains[B.terrainId]=(P.terrains[B.terrainId]||0)+1;for(let U of B.features)P.features[U]=(P.features[U]||0)+1}P.forestPercentLand=Ue?+(100*P.forest/Ue).toFixed(1):0,P.forestPercentEligible=P.forestEligible?+(100*P.forest/P.forestEligible).toFixed(1):0;let se=[...O.values()].sort((B,U)=>B-U);P.biomeRegions={count:se.length,min:se[0]||0,average:se.length?+(Ue/se.length).toFixed(1):0,median:se.length?se[Math.floor(se.length/2)]:0,max:se.at(-1)||0,within30to90:se.filter(B=>B>=30&&B<=90).length};function te(B){let U=new Set,ae=0;for(let re of Ce){let $=F(re.q,re.r);if(U.has($)||!B(re))continue;let le=[re];U.add($);for(let Ae=0;Ae<le.length;Ae++)for(let pe of T(le[Ae],de)){let qe=F(pe.q,pe.r);B(pe)&&!U.has(qe)&&(U.add(qe),le.push(pe))}ae=Math.max(ae,le.length)}return ae}return P.connectedLandPercent=Ue?+(100*te(B=>B.surfaceClass==="land")/Ue).toFixed(1):0,P.largestWaterBody=te(B=>B.surfaceClass!=="land"),{version:e,seed:v,width:R,height:I,originQ:k,originR:d,config:S,cells:Ce,riverPaths:We,riverPreviewPaths:Ve.map(B=>B.map(U=>[U.q,U.r])),stats:P,riverGeometry:"hex-edges"}}let V={VERSION:e,DIRS:o,TERRAIN_IDS:i,BIOME_IDS:n,parameterSchema:M,defaultConfig:X,normalizeConfig:w,aggregateDistributions:y,registerParameter:E,registerFeature:L,createPointSampler:oe,generateWorld:ue,getWorldCell:(v,W,R)=>{let I=v.originQ??0,k=v.originR??0;return W<I||R<k||W>=I+v.width||R>=k+v.height?null:v.cells[(R-k)*v.width+(W-I)]??null}};typeof $t<"u"&&$t.exports&&($t.exports=V),t.VedrasGeography=V})(typeof window<"u"?window:globalThis)});var xo=Lr(Kt());var ko=Math.sqrt(3),$e=256/ko,De=.85,Ye=1.5*$e,mn=Ye*De,Me=16,Pe=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function Ie(t,e){return{x:256*(t+e*.5),y:mn*e}}function Je(t,e){let r=e/mn,o=t/256-r*.5,i=-o-r,n=Math.round(o),a=Math.round(r),l=Math.round(i),c=Math.abs(n-o),s=Math.abs(a-r),u=Math.abs(l-i);return c>s&&c>u?n=-a-l:s>u&&(a=-n-l),{q:n===0?0:n,r:a===0?0:a}}function tt(t,e,r,o){let i=t-r,n=e-o;return(Math.abs(i)+Math.abs(i+n)+Math.abs(n))/2}function At(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function kt(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function Wt(t,e,r=Me){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function bt(t,e){return`${t},${e}`}function Fe(t,e){return`${t},${e}`}function Dr(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,i=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,a=-1/0,l=1/0,c=-1/0;for(let s of i){let u=Je(s.x,s.y);u.q<n&&(n=u.q),u.q>a&&(a=u.q),u.r<l&&(l=u.r),u.r>c&&(c=u.r)}return{minQ:n-e,maxQ:a+e,minR:l-e,maxR:c+e}}function pn(t,e=Me,r=3){let o=Dr(t,r),i=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),a=Math.floor(o.minR/e),l=Math.floor(o.maxR/e),c=Je(t.x,t.y),s=c.q/e,u=c.r/e,h=[];for(let f=a;f<=l;f++)for(let m=i;m<=n;m++){let p=m+.5-s,b=f+.5-u;h.push({cq:m,cr:f,dist2:p*p+b*b})}return h.sort((f,m)=>f.dist2-m.dist2),h.map(({cq:f,cr:m})=>({cq:f,cr:m}))}function gn(t,e,r,o=0){let i=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return i=Math.imul(i^i>>>15,2246822519)>>>0,i=Math.imul(i^i>>>13,3266489917)>>>0,(i^i>>>16)>>>0}function Ir(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function Zt(t,e){let r=256*(t+e*.5),o=Ye*e,i=[];for(let n=0;n<6;n++){let a=-Math.PI/2+n*Math.PI/3;i.push({x:r+$e*Math.cos(a),y:(o+$e*Math.sin(a))*De})}return i}function lt(t,e,r){let o=Zt(t,e),i=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a:i,b:n,mid:{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}}function ot(t,e,r,o){let i=r-t,n=o-e;for(let a=0;a<6;a++)if(Pe[a][0]===i&&Pe[a][1]===n)return a;return-1}function Ft(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function bn(t,e){let r=Je(t,e),o=0,i=1/0;for(let s=0;s<6;s++){let{mid:u}=lt(r.q,r.r,s),h=t-u.x,f=e-u.y,m=h*h+f*f;m<i&&(i=m,o=s)}let[n,a]=Pe[o],l=Ft(r.q,r.r,r.q+n,r.r+a),c=ot(l.q1,l.r1,l.q2,l.r2);return{q1:l.q1,r1:l.r1,q2:l.q2,r2:l.r2,dir:c}}var ct={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},Jt=new Set(["dead_trees","snow_dead_trees"]),qr=new Set(["fallen_logs","snow_fallen_logs"]),Wo=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),Fo=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),Qt=new Set(["snowfields","frozen_tundra","tundra","highland"]);var vn=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),wn=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),Ct=new Set(["snowfields","frozen_tundra"]),Lt=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),Ur=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),_n=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),Lo=new Set([..._n,"savanna","jungle"]);function rt(t,e,r){return t<e?e:t>r?r:t}function K(t,e,r,o=0,i=97,n=513,a=11){let l=(t|0)^Math.imul(e+i,374761393)^Math.imul(r+n,668265263)^Math.imul(o+a,2246822519);return l^=l>>>13,l=Math.imul(l,1274126177),((l^l>>>16)>>>0)/4294967296}function Dt(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function Do(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var It=new Set(["ocean","coastal_water","stormy_ocean"]);function xt(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function er(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function Hr(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function Gr(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function tr(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function rr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function Or(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function Sn(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:Ur.has(t)?.14:0}function Nr(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*(Dt(t)?.32:.25):Fo.has(t.family??"")?e:e*1.2}function nr(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"||e==="snow_mountains"}function Rt(t){if(!t||t.kind==="mountain")return 1;let e=Nr(t),r=t.family??"",o=Bt(t)==="cacti"?1.55:1;return Jt.has(r)?.58*e:qr.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.tags?.includes("round_cactus")||/^(?:existing_)?cactus_0?[12]$/.test(t.id??"")||t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_decal"?1.05:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function Cn(t){return!!t&&t.kind==="tree"&&!Jt.has(t.family??"")}function Rn(t){return!!t&&Wo.has(t.family??"")}function Mn(t){let e=t?.family??"";return Jt.has(e)?"dead_trees":qr.has(e)?"fallen_logs":null}function En(t){let e=t?.family??"";return Jt.has(e)?.11:qr.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function Tn(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function Pn(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function Bt(t){let e=Pn(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}var yn=new Set(["snowfields","frozen_tundra","tundra","highland"]),Io=new Set(["highland","tundra","grassland","pasture","sparse_pasture","forest_floor","moor","marshland","swamp"]),An=new Set(["desert","sandy_desert","rocky_desert","sandy_rocky_desert","clay_desert","badlands","sandy_badlands","rocky_badlands","semi_desert","wasteland","savanna","dry_ground"]),Bo=new Set([..._n,"forest_floor","highland","jungle",...An]);function kn(t){if(!t||t.kind!=="mountain")return!1;let e=String(t.id??"");if(t.family==="snow_mountains"||/^snow_mountain_\d+$/.test(e)||/^(?:existing_)?berg_(?:0?[1-9]|1[0-6])$/.test(e))return!0;let r=t.tags??[];return r.includes("arctic_snow_mountain")||r.includes("alpine_snow_mountain")||r.includes("snow_tipped_mountain")}function qt(t){let e=String(t.id??""),r=Pn(t);return xt(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?It:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||rr(t)?Ur:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?Qt:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?vn:Do(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?Qt:Dt(t)?vn:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?Lo:/^snow_mountain_\d+$/.test(e)||t.family==="snow_mountains"||/^(?:existing_)?berg_(?:1[4-6])$/.test(e)||/^(?:existing_)?berg_0?[1-4]$/.test(e)?yn:/^(?:existing_)?berg_(?:0?[5-9]|1[0-3])$/.test(e)?Io:/^desert_mountain_\d+$/.test(e)||t.family==="desert_mountains"?An:/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?Bo:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function Wn(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,i=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),a=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),l=new Set;for(let[c,s]of Object.entries(e.terrain.byType))a.has(c)||(s.categoryId&&i.has(s.categoryId)||n.has(c))&&l.add(c);return l}function Br(t,e,r,o,i,n=!1){if(!e)return!1;let a=o.terrain.byType[e];if(xt(t))return It.has(e);if(a&&a.materialClass!=="ground")return!1;let c=i?i.ecoFamily:Bt(t),s=e,u=i?i.strict:qt(t);if(u)return u.has(s);let h=n||r.some(b=>{let _=o.terrain.byType[b]?.materialClass;return _==="water"||_==="shoreline"}),f=r.some(b=>b==="jungle"||b==="savanna"),m=r.some(b=>b==="moor"||b==="swamp"||b==="marshland");if(c==="mangroves")return(s==="swamp"||s==="marshland")&&(h||f);if(c==="palms")return s==="jungle"||s==="savanna"||s==="tropical_coast"||Lt.has(s);if(c==="jungle_trees"||c==="tropical_bushes")return s==="jungle";if(c==="savanna_trees")return s==="savanna"||s==="semi_desert"||Or(t)&&Lt.has(s);if(c==="cacti")return s==="rocky_desert"||s==="sandy_desert"||s==="clay_desert"||s==="desert"||s==="semi_desert"||s==="sandy_rocky_desert"||s==="savanna";if(c==="succulents")return s==="savanna"||s==="semi_desert"||s==="rocky_desert"||s==="sandy_desert"||s==="sandy_rocky_desert"||s==="badlands"||s==="desert";if(c==="ferns")return s==="forest_floor"||s==="grassland"||s==="pasture"||s==="moor"||s==="swamp"||s==="marshland"||s==="jungle";if(c==="reeds")return s==="moor"||s==="swamp"||s==="marshland"||(s==="grassland"||s==="pasture"||s==="sparse_pasture")&&(h||m);if(c==="cold_bushes")return s==="tundra"||s==="frozen_tundra"||s==="highland";if(c==="snow_conifers"||c==="snow_dead_trees"||c==="snow_deadwood"||c==="snow_fallen_logs")return Qt.has(s);if(c==="riparian_trees")return s==="moor"||s==="swamp"||s==="marshland"||(s==="grassland"||s==="pasture")&&(h||m);let p=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(s==="snowfields"||s==="frozen_tundra")&&!p?!1:c==="dry_patches"?Ur.has(s):Hr(t)?!(s==="jungle"||s==="moor"||s==="swamp"||s==="marshland"||s==="snowfields"||s==="frozen_tundra"):c==="dry_bushes"?!(s==="jungle"||s==="moor"||s==="swamp"||s==="marshland"||s==="tundra"||s==="highland"):c==="herbs"?!(s==="jungle"||s==="swamp"||s==="marshland"||s==="ocean"||s==="snowfields"||s==="frozen_tundra"):c==="flowering_bushes"||c==="temperate_bushes"||c==="heath"?!(s==="jungle"||s==="rocky_desert"||s==="sandy_desert"||s==="clay_desert"):!0}function Fn(t,e,r,o,i){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,a=r.biome||n;if(xt(t))return It.has(n)&&e.has(n);if(Dt(t)&&(n==="jungle"||a==="jungle"))return!1;let l=o.terrain.byType[n],c=o.terrain.byType[a];if(l?.materialClass!=="ground"||c?.materialClass!=="ground")return!1;let s=i?i.strict:qt(t);if(s){if(!s.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let u=n==="jungle"||n==="savanna",h=r.forestClass==="light_forest"||r.forestClass==="dense_forest",f=i?i.ecoFamily:Bt(t),m=a==="jungle",p=n==="moor"||n==="swamp"||n==="marshland";if(m&&!u||t.family==="palms"&&(!(u||Lt.has(n))||p||Qt.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!m||h&&(f==="cacti"||f==="succulents"||f==="dry_bushes")||!(e.has(a)||e.has(n)||h&&e.has("forest_floor")&&t.family!=="palms"))return!1;let _=!!r.hasRiverEdge;return s?Br(t,n,r.neighborTypes,o,i,_):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!Br(t,n,r.neighborTypes,o,i,_)?!1:Br(t,a,r.neighborTypes,o,i,_)}function Ln(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let i=o.terrain.byType[r];if(!i||i.materialClass!=="ground")return!1;let n=qt(t);return n&&!n.has(r)?!1:e.has(r)}function qo(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function xn(t,e,r){let o=e/3,i=r/3,n=Math.floor(o),a=Math.floor(i),l=o-n,c=i-a,s=l*l*(3-2*l),u=c*c*(3-2*c),h=K(t,n,a,2301,8191,4093,17),f=K(t,n+1,a,2301,8191,4093,17),m=K(t,n,a+1,2301,8191,4093,17),p=K(t,n+1,a+1,2301,8191,4093,17);return 2*((h+(f-h)*s)*(1-u)+(m+(p-m)*s)*u)-1}function Dn(t,e,r,o){let i=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:ct.mode,a=rt(o?.canopyCover??ct.canopyCover,.35,.98),l=rt(o?.canopyVariation??ct.canopyVariation,0,.3),c=rt(o?.gladeRate??ct.gladeRate,0,.3),s=rt(o?.edgeStrength??ct.edgeStrength,0,1);for(let u of t){let h=Fe(u.q,u.r),f=u.terrainId==="jungle",m=qo(u.terrainId,e),p=rt(u.forestDensity||0,0,1),b,_;if(f){let A=.5+.5*xn(r+137,u.q,u.r),D=.5+.5*Math.sin(u.q*.62-u.r*.44+r%71)*Math.cos(u.q*.37+u.r*.71),x=rt(.46+.42*A+.14*D,.36,.98),M=p>.01?rt(p*(.68+.34*x),.32,.98):x;b=M>=.62?"dense_forest":"light_forest",_=M}else b=u.forestClass??(u.forestDensity>=.65?"dense_forest":u.forestDensity>.08?"light_forest":"none"),_=b==="none"?0:p>.01?p:b==="dense_forest"?1:.44;i.set(h,{q:u.q,r:u.r,key:h,baseBiome:u.terrainId,biome:f?"jungle":u.terrainId,jungle:f,suitability:m,forestMode:n,forestClass:m>0?b:"none",baseDensity:m>0?_:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let u of i.values()){if(!u.suitability)continue;let h=0;for(let[f,m]of Pe){let p=i.get(Fe(u.q+f,u.r+m));p&&p.baseDensity>h&&(h=p.baseDensity)}u.edgeInfluence=rt(h*(u.baseDensity?.18:.48)*s*u.suitability,0,.46),u.density=rt(u.baseDensity+u.edgeInfluence,0,1)}if(n==="canopy"&&c>0){let u=rt(c*.55,0,.19),h=[];for(let f of i.values()){if(f.forestClass!=="dense_forest")continue;let m=0;for(let[A,D]of Pe)i.get(Fe(f.q+A,f.r+D))?.forestClass==="dense_forest"&&m++;if(m<2)continue;let p=K(r,f.q,f.r,1864,8191,4093,17),b=f.jungle?u*.62:u;if(p>=b)continue;let _=!1;for(let A=-2;A<=2&&!_;A++)for(let D=-2;D<=2;D++){if(D===0&&A===0||Math.abs(D+A)>2)continue;let x=i.get(Fe(f.q+D,f.r+A));if(!(!x||x.forestClass!=="dense_forest")&&K(r,x.q,x.r,1864,8191,4093,17)<p){_=!0;break}}_||h.push(f)}for(let f of h){f.glade=!0;let m=f.jungle?.45:.84;if(K(r,f.q,f.r,1954,8191,4093,17)<m){let p=null,b=1/0;for(let[_,A]of Pe){let D=i.get(Fe(f.q+_,f.r+A));if(!D||D.forestClass!=="dense_forest"||D.jungle!==f.jungle)continue;let x=K(r,D.q,D.r,1953,8191,4093,17);x<b&&(b=x,p=D)}p&&(p.glade=!0)}}}for(let u of i.values()){if(!u.suitability)continue;if(u.glade){u.gladeX=Math.round((K(r,u.q,u.r,2041,8191,4093,17)-.5)*52),u.gladeY=Math.round((K(r,u.q,u.r,2042,8191,4093,17)-.5)*40);let p=u.jungle?46:58;u.gladeRadius=p+Math.round(K(r,u.q,u.r,2043,8191,4093,17)*18)}let h=u.forestClass==="dense_forest"?1:u.forestClass==="light_forest"?u.jungle?.62:.49:u.edgeInfluence>.08?.17:0,f=xn(r,u.q,u.r),m=rt(a+l*f,.12,.98);u.canopyCoverage=rt(m*h*(.58+.42*u.density)*u.suitability*(u.glade?u.jungle?.34:.24:1),0,.98)}return i}function In(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function Bn(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function Xr(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,i=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return i*i+n*n<.94*.94}function qn(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function Ut(t,e,r,o){let i=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*K(t,e,r,i,173,311,79);for(let[a,l]of Pe)n+=.5/6*K(t,e+a,r+l,i,173,311,79);return rt(1+(n-.5)*1.5,.6,1.4)}function Un(t,e,r,o,i,n){let l=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,c=(K(t,e,r,l,173,311,79)-.5)*154,s=(K(t,e,r,l+1,173,311,79)-.5)*146,u=K(t,e,r,i*127+n*2+17,173,311,79),h=K(t,e,r,i*127+n*2+18,173,311,79),f=(u-.5)*242,m=(h-.5)*258,p=n>=26?0:o==="tree"?.43:.68,b=o==="tree"?170:126,_=c+(u-.5)*b,A=s+(h-.5)*b;return{dx:f*(1-p)+_*p,dy:m*(1-p)+A*p}}function or(t,e,r=0){let o=Math.abs(t),i=Math.abs(e);return i<=$e-r&&o<=Math.min(128,Math.sqrt(3)*($e-i))-r}function Hn(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:K(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var ar=128,Gt=78,Et={enabled:!0,strength:Gt,lighting:!0,style:"sculpted"},zr=168,Yr=127,Ht=zr+Yr;function ut(t,e,r){return t<e?e:t>r?r:t}function Mt(t){let e=ut(t,0,1);return e*e*(3-2*e)}function Gn(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function ir(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function Vr(t,e,r){let o=Math.floor(t),i=Math.floor(e),n=t-o,a=e-i,l=n*n*n*(n*(n*6-15)+10),c=a*a*a*(a*(a*6-15)+10),s=ir(o,i,r),u=ir(o+1,i,r),h=ir(o,i+1,r),f=ir(o+1,i+1,r);return(s+(u-s)*l)*(1-c)+(h+(f-h)*l)*c}function Uo(t,e,r){let o=Vr(t/380,e/380,r^324508639),i=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,a=Vr(i,n,r^610839777),l=(t*.3255682-e*.9455186)/105,c=(t*.9455186+e*.3255682)/105,s=Vr(l,c,r^916255320);return{plainSwell:o*.78+a*.22,ridgeDetail:o*.34+a*.46+s*.2}}function On(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function Ho(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let i=r?.categoryId??"";return(i==="wetlands"?.3:i==="cold_regions"?.25:i==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function Nn(t,e,r,o=Gt,i="sculpted"){let n=[],a=[];for(let c=0;c<t.length;c++){let s=t[c],u=256*(s.q+s.r*.5),h=Ye*s.r;if(On(s,e)){a.push({x:u,y:h});continue}if(s.reliefClass!=="hills")continue;let f=ut(s.hillStrength??.7,0,1);if(f<=0)continue;let m=(Math.imul(s.q,73856093)^Math.imul(s.r,19349663)^r)>>>0,p=(Gn(m)-.5)*1.7,b=s.hillProfile||"rounded",_=b==="ridge"||b==="chain"?560:440;n.push({x:u,y:h,ca:Math.cos(p),sa:Math.sin(p),shape:b,weight:.42+.58*f,reach:_})}let l=o>0?i==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:a,strengthPct:o,heightGain:l,seedInt:r,style:i}}function Xn(t,e,r){let o=e*t.ca+r*t.sa,i=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(i/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(i/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,i/158),3.1)):t.shape==="plateau"?1-Mt((Math.hypot(o/188,i/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(i/180)**2))}function Vn(t,e,r,o,i,n,a,l){if(n<=0||e<=.004)return 0;if(l==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:c,ridgeDetail:s}=Uo(r,o,a),u=Math.max(0,c-.38)*14*(i/100)*e;if(t<=1e-4)return u;let h=1-Math.exp(-t*.76),f=n*h*(.76+.42*s)*e;return Math.min(ar,f+u*.55)}function zn(t,e,r){if(t.heightGain<=0)return 0;let o=0,i=t.waters,n=Ht*Ht;for(let s=0;s<i.length;s++){let u=i[s],h=e-u.x,f=r-u.y;if(Math.abs(h)>Ht||Math.abs(f)>Ht)continue;let m=h*h+f*f;if(m<n){let p=1-Mt((Math.sqrt(m)-zr)/Yr);p>o&&(o=p)}}let a=1-o;if(a<=.004)return 0;let l=0,c=t.hills;for(let s=0;s<c.length;s++){let u=c[s],h=e-u.x,f=r-u.y;Math.abs(h)>u.reach||Math.abs(f)>u.reach||(l+=Xn(u,h,f)*u.weight)}return Vn(l,a,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function Yn(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),i=t.width/(r-1),n=t.height/(o-1),a=1/i,l=1/n,c=r*o,s=new Float32Array(c),u=new Float32Array(c),h=new Float32Array(c),f=new Float32Array(c),m=new Float32Array(c),p=new Float32Array(c),b=new Float32Array(c),_=520,A=Math.floor((t.top-_)/Ye)-2,D=Math.ceil((t.top+t.height+_)/Ye)+2,x=t.reliefStyle??"sculpted",M=t.reliefStrength??Gt,X=M>0?x==="sculpted"?112*(M/100):67*(M/100)*1.2:0,w=(L,T,H,Q,N,Y)=>{let C=Math.max(0,Math.floor((T-Y-t.left)*a)),oe=Math.min(r-1,Math.ceil((T+Y-t.left)*a)),ue=Math.max(0,Math.floor((H-Y-t.top)*l)),V=Math.min(o-1,Math.ceil((H+Y-t.top)*l)),v=Y*Y;for(let W=ue;W<=V;W++){let R=t.top+W*n-H,I=R*R,k=W*r;for(let d=C;d<=oe;d++){let g=t.left+d*i-T,S=g*g+I;if(S>=v)continue;let q=1-Mt((Math.sqrt(S)-Q)/N);q>L[k+d]&&(L[k+d]=q)}}};for(let L=A;L<=D;L++){let T=Math.floor((t.left-_)/256-L*.5)-2,H=Math.ceil((t.left+t.width+_)/256-L*.5)+2;for(let Q=T;Q<=H;Q++){let N=t.lookupHex(Q,L);if(!N||N.fogState===0)continue;let Y=256*(Q+L*.5),C=Ye*L;if(On(N,t.manifest)){w(h,Y,C,zr,Yr,Ht),w(f,Y,C,108,48,160);continue}if((N.terrainId==="snowfields"||N.terrainId==="frozen_tundra"||N.terrainId==="jungle")&&w(f,Y,C,108,48,160),X>0&&N.reliefClass==="hills"){let V=ut(N.hillStrength??.7,0,1);if(V>0){let v=(Math.imul(Q,73856093)^Math.imul(L,19349663)^t.seedInt)>>>0,W=(Gn(v)-.5)*1.7,R=N.hillProfile||"rounded",I=R==="ridge"||R==="chain"?560:440,k={x:Y,y:C,ca:Math.cos(W),sa:Math.sin(W),shape:R,weight:.42+.58*V,reach:I},d=Math.max(0,Math.floor((Y-I-t.left)*a)),g=Math.min(r-1,Math.ceil((Y+I-t.left)*a)),S=Math.max(0,Math.floor((C-I-t.top)*l)),q=Math.min(o-1,Math.ceil((C+I-t.top)*l));for(let F=S;F<=q;F++){let z=t.top+F*n-C,G=F*r;for(let J=d;J<=g;J++){let ge=t.left+J*i-Y,Z=Xn(k,ge,z);Z>1e-4&&(s[G+J]+=Z*k.weight)}}}}let ue=Ho(N,t.manifest);if(ue>.01){let v=Math.max(0,Math.floor((Y-172-t.left)*a)),W=Math.min(r-1,Math.ceil((Y+172-t.left)*a)),R=Math.max(0,Math.floor((C-172-t.top)*l)),I=Math.min(o-1,Math.ceil((C+172-t.top)*l)),k=29584;for(let d=R;d<=I;d++){let g=t.top+d*n-C,S=g*g,q=d*r;for(let F=v;F<=W;F++){let z=t.left+F*i-Y,G=z*z+S;if(G>=k)continue;let J=1-Mt((Math.sqrt(G)-110)/56);if(J>0){let ge=q+F,Z=m[ge]+J*1.15;m[ge]=Z>1?1:Z,ue>p[ge]&&(p[ge]=ue)}}}if(N.glade){let d=Y+(N.gladeX??0),g=C+(N.gladeY??0),S=N.gladeRadius??64,q=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[F,z,G]of q){let J=d+S*F,ge=g+S*z,Z=S*G,ve=Z*Z,Ce=Math.max(0,Math.floor((J-Z-t.left)*a)),de=Math.min(r-1,Math.ceil((J+Z-t.left)*a)),ie=Math.max(0,Math.floor((ge-Z-t.top)*l)),j=Math.min(o-1,Math.ceil((ge+Z-t.top)*l));for(let ee=ie;ee<=j;ee++){let me=t.top+ee*n-ge,ye=me*me,Le=ee*r;for(let Se=Ce;Se<=de;Se++){let ke=t.left+Se*i-J,Ee=ke*ke+ye;if(Ee>=ve)continue;let Re=1-Mt((Math.sqrt(Ee)-Z*.14)/(Z*.86)),We=Le+Se;Re>b[We]&&(b[We]=Re)}}}}}}}for(let L=0;L<o;L++){let T=t.top+L*n,H=L*r;for(let Q=0;Q<r;Q++){let N=H+Q,Y=1-h[N];if(Y<=.004||X<=0)continue;let C=t.left+Q*i;u[N]=Vn(s[N],Y,C,T,M,X,t.seedInt,x)}}let y=new Uint8Array(c*4),E=Math.max(1,(i+n)*.5);for(let L=0;L<o;L++){let T=L>0?L-1:0,H=L<o-1?L+1:o-1,Q=Math.max(1,(H-T)*n),N=L*r;for(let Y=0;Y<r;Y++){let C=Y>0?Y-1:0,oe=Y<r-1?Y+1:r-1,ue=Math.max(1,(oe-C)*i),V=N+Y,v=u[V],W=u[N+C],R=u[N+oe],I=u[T*r+Y],k=u[H*r+Y],d=(R-W)/ue,g=(k-I)/Q,S;if(x==="sculpted"){let G=((W+R+I+k)*.25-v)/E,J=ut(-G*1.45,-.1,.12);S=ut(1-2.45*d-.65*g+J,.6,1.36)}else S=ut(1-2.15*d-.48*g,.66,1.32);let q=1-f[V],F=m[V]>.01&&q>.01?Mt((m[V]-.12)/.72)*p[V]*(1-b[V]*.94)*q:0,z=V*4;y[z]=Math.round(ut(v/ar,0,1)*255),y[z+1]=Math.round(ut((S-.52)/.96,0,1)*255),y[z+2]=Math.round(ut(F,0,1)*255),y[z+3]=Math.round(ut(1-h[V],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:y,heights:u}}function jn(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),i=(r-t.top)/t.height*(t.rows-1);if(o<0||i<0||o>=t.cols-1||i>=t.rows-1)return 0;let n=Math.floor(o),a=Math.floor(i),l=o-n,c=i-a,s=a*t.cols+n,u=t.heights[s],h=t.heights[s+1],f=t.heights[s+t.cols],m=t.heights[s+t.cols+1];return(u*(1-l)+h*l)*(1-c)+(f*(1-l)+m*l)*c}var jr=65536,sr=16,dt={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function Go(t){if(!t)return dt.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?dt.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?dt.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?dt.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?dt.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?dt.forest:r==="hills"?dt.rock:dt.earth}var Oo=`#version 300 es
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
`,No=`#version 300 es
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
`;function ur(t,e){return{x:256*(t+e*.5),y:Ye*e}}function lr(t,e){let r=ur(t,e),o=[];for(let i=0;i<6;i++){let n=-Math.PI/2+i*Math.PI/3;o.push({x:r.x+$e*Math.cos(n),y:r.y+$e*Math.sin(n)})}return o}function $r(t,e,r,o){let i=r-t,n=o-e;for(let a=0;a<6;a++)if(Pe[a][0]===i&&Pe[a][1]===n)return a;return-1}function Xo(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function $n(t,e){for(let r=0;r<6;r++)if(Xo(t[r],e))return r;return-1}function Kr(t,e,r,o){let i=lr(t,e),n=$n(i,r),a=$n(i,o);if(n<0||a<0)return[r,o];let l=(a-n+6)%6,c=(n-a+6)%6,s=l<=c?1:-1,u=Math.min(l,c),h=[];for(let f=0;f<=u;f++)h.push(i[(n+s*f+12)%6]);return h}function Zr(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],i=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let l=1;l<n;l++){let c=t[l-1],s=t[l],u=t[l+1],h=s.x-c.x,f=s.y-c.y,m=u.x-s.x,p=u.y-s.y,b=Math.hypot(h,f),_=Math.hypot(m,p);if(b<1e-4||_<1e-4)continue;if((h*m+f*p)/(b*_)>.995){o.push(s);continue}let D=Math.min(b*.16,_*.16,Math.max(12,i*.85)),x={x:s.x-h/b*D,y:s.y-f/b*D},M={x:s.x+m/_*D,y:s.y+p/_*D};o.push(x);for(let X=1;X<6;X++){let w=X/6,y=1-w;o.push({x:y*y*x.x+2*y*w*s.x+w*w*M.x,y:y*y*x.y+2*y*w*s.y+w*w*M.y})}o.push(M)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let a=[];for(let l=0;l<o.length;l++)(l===0||Math.hypot(o[l].x-a[a.length-1].x,o[l].y-a[a.length-1].y)>1e-4)&&a.push(o[l]);return a}function Vo(t,e){let r=Je(t.x,t.y*De),o=$e*1.15,i=[];for(let n=-1;n<6;n++){let a=n<0?r.q:r.q+Pe[n][0],l=n<0?r.r:r.r+Pe[n][1],c=ur(a,l);Math.hypot(t.x-c.x,t.y-c.y)<=o&&e(a,l)&&i.push(c)}return i}function Ot(t,e=34,r){let o=t.hexes;if(!o||o.length<2)return null;let i=o.length-1,n=[];for(let C=0;C<i;C++){let[oe,ue]=o[C],[V,v]=o[C+1],W=$r(oe,ue,V,v);if(W<0)return null;let R=lr(oe,ue);n.push([R[W],R[(W+1)%6]])}let a=$r(o[0][0],o[0][1],o[1][0],o[1][1]),l=t.corner??(a+3)%6,c=lr(o[0][0],o[0][1])[l],s=n.map(()=>[1/0,1/0]),u=n.map(()=>[0,0]);for(let C=0;C<2;C++)s[0][C]=Kr(o[0][0],o[0][1],c,n[0][C]).length-1;for(let C=1;C<i;C++)for(let oe=0;oe<2;oe++)for(let ue=0;ue<2;ue++){let V=Kr(o[C][0],o[C][1],n[C-1][ue],n[C][oe]).length-1,v=s[C-1][ue]+V;v<s[C][oe]&&(s[C][oe]=v,u[C][oe]=ue)}let h=new Array(i),f=s[i-1][0]<=s[i-1][1]?0:1;for(let C=i-1;C>=0;C--)h[C]=n[C][f],f=u[C][f];let m=[];for(let C=0;C<i;C++){let oe=C===0?c:h[C-1],ue=h[C],V=Kr(o[C][0],o[C][1],oe,ue);for(let v=0;v<V.length;v++)(m.length===0||Math.hypot(V[v].x-m[m.length-1].x,V[v].y-m[m.length-1].y)>1e-4)&&m.push(V[v])}if(m.length<2)return null;let p=o[i-1],b=o[i];if($r(p[0],p[1],b[0],b[1])<0)return null;let A=m.length-1,D=ur(b[0],b[1]);if(r)for(let C=1;C<m.length;C++){let oe=Vo(m[C],r);if(oe.length>0){A=C;let ue=0,V=0;for(let v=0;v<oe.length;v++)ue+=oe[v].x,V+=oe[v].y;D={x:ue/oe.length,y:V/oe.length};break}}let x=m.slice(0,A+1),M=x[x.length-1],X=D.x-M.x,w=D.y-M.y,y=Math.hypot(X,w)||1,E=X/y,L=w/y,T=Math.max(54,e*2.15),H={x:M.x+E*T,y:M.y+L*T};x.push(H);let Q=Zr(x,e,!1);if(Q.length<2)return null;let N=Q.length-2,Y=1/0;for(let C=0;C<Q.length;C++){let oe=(Q[C].x-M.x)**2+(Q[C].y-M.y)**2;oe<Y&&(Y=oe,N=C)}return{id:t.id,points:Q,mouthCrossIdx:N,mouthCrossPos:M,mouthDirX:E,mouthDirY:L,mouthReach:T,width:e,hasMouth:!0}}function Qr(t,e=34){if(!t||t.length===0)return[];let r=c=>`${Math.round(c.x*2)},${Math.round(c.y*2)}`,o=[],i=new Set,n=new Map;for(let c of t){let s=(c.dir%6+6)%6,u=lr(c.q,c.r),h=u[s],f=u[(s+1)%6],m=r(h),p=r(f),b=m<p?`${m}|${p}`:`${p}|${m}`;if(i.has(b))continue;i.add(b);let _=o.length;o.push({a:h,b:f,ka:m,kb:p,used:!1});let A=n.get(m)??[];A.push(_),n.set(m,A);let D=n.get(p)??[];D.push(_),n.set(p,D)}let a=[],l=(c,s)=>{let u=o[c];u.used=!0;let h=s?[u.a,u.b]:[u.b,u.a],f=s?u.kb:u.ka;for(;;){let m=n.get(f);if(!m)break;let p=-1;for(let _ of m)if(!o[_].used){p=_;break}if(p<0)break;let b=o[p];b.used=!0,b.ka===f?(h.push(b.b),f=b.kb):(h.push(b.a),f=b.ka)}return h};for(let c=0;c<2;c++)for(let s=0;s<o.length;s++)if(!o[s].used)if(c===0){let u=n.get(o[s].ka)?.length??0,h=n.get(o[s].kb)?.length??0;if(u!==1&&h!==1)continue;let f=l(s,u===1);a.push({id:`edge_${s}`,points:Zr(f,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let u=l(s,!0);a.push({id:`edge_${s}`,points:Zr(u,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return a}var cr=class{constructor(e){this.verts=new Float32Array(jr*sr);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,Oo),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,No),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate river program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),a=e.createBuffer();if(!n||!a)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=a,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let l=sr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,l,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,l,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,l,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,l,48),e.bindVertexArray(null);let c=s=>{let u=e.getUniformLocation(i,s);if(!u)throw new Error(`Missing river uniform: ${s}`);return u};this.uCamCenter=c("u_camCenter"),this.uViewportSize=c("u_viewportSize"),this.uZoom=c("u_zoom"),this.uCoastalWaterLayer=c("u_coastalWaterLayer"),this.uTime=c("u_time"),this.uWindEnabled=c("u_windEnabled"),this.uPassMode=c("u_passMode"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0)}getCachedCourse(e,r=34,o){let i=`${e.id}@${r}@${o?"w":"0"}`;if(this.courseCache.has(i))return this.courseCache.get(i)??null;let n=Ot(e,r,o);if(this.courseCache.set(i,n),this.courseCache.size>512){let a=this.courseCache.keys().next().value;a!==void 0&&this.courseCache.delete(a)}return n}pushVertex(e,r,o,i,n,a,l,c,s,u,h,f,m){if(this.vertCount>=jr)return;let p=this.vertCount*sr,b=this.verts;b[p++]=e,b[p++]=r,b[p++]=o,b[p++]=i,b[p++]=n,b[p++]=a,b[p++]=l,b[p++]=c,b[p++]=s,b[p++]=u,b[p++]=h,b[p++]=f,b[p++]=m.r,b[p++]=m.g,b[p++]=m.b,b[p++]=m.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return dt.earth;let i=Je(e,r*De),n=0,a=0,l=0,c=0,s=0;for(let u=-1;u<6;u++){let h=u<0?i.q:i.q+Pe[u][0],f=u<0?i.r:i.r+Pe[u][1],m=o(h,f);if(!m)continue;let p=m.terrainId;if(p==="ocean"||p==="coastal_water"||p==="stormy_ocean"||p==="icy_ocean")continue;let b=ur(h,f),_=Math.hypot(e-b.x,r-b.y);if(_>380)continue;let A=Math.max(0,Math.min(1,1-Math.max(0,_-35)/345)),D=A*A*(3-2*A),x=D*D,M=Go(m);a+=M.r*x,l+=M.g*x,c+=M.b*x,s+=M.rock*x,n+=x}return n<1e-4?dt.earth:{r:a/n,g:l/n,b:c/n,rock:s/n}}emitCourse(e,r,o,i,n){let a=e.points,l=a.length;if(l<2)return;let c=e.width*.5*n,s=e.mouthCrossPos??(e.hasMouth&&e.mouthCrossIdx>=0?a[e.mouthCrossIdx]:null),u=e.hasMouth?a[l-1]:null,h=s&&u?u.x-s.x:0,f=s&&u?u.y-s.y:0,m=Math.hypot(h,f)||1,p=e.mouthDirX??h/m,b=e.mouthDirY??f/m,_=Math.max(24,e.mouthReach??m),A=new Float32Array(l);for(let T=1;T<l;T++)A[T]=A[T-1]+Math.hypot(a[T].x-a[T-1].x,a[T].y-a[T-1].y);let D=Math.max(1,A[l-1]),x=new Float32Array(l),M=new Float32Array(l),X=new Float32Array(l),w=new Float32Array(l),y=new Array(l);for(let T=0;T<l;T++){let H=a[T>0?T-1:0],Q=a[T<l-1?T+1:l-1],N=Q.x-H.x,Y=Q.y-H.y,C=Math.hypot(N,Y)||1;x[T]=N/C,M[T]=Y/C,X[T]=-Y/C,w[T]=N/C,y[T]=this.sampleBankPalette(a[T].x,a[T].y,i)}let E=(T,H,Q)=>{let N=r(T,H),Y=T,C=(H-N)*De,oe=A[Q]/D,ue=c*(e.hasMouth?.68+.4*oe:1),V=1,v=1;if(e.hasMouth&&A[Q]<26){let k=Math.max(0,Math.min(1,A[Q]/26)),d=k*k*(3-2*k);V*=d,v*=d,ue*=.58+.42*d}else if(!e.hasMouth){let k=Math.min(A[Q],D-A[Q]);if(k<18){let d=Math.max(0,Math.min(1,k/18)),g=d*d*(3-2*d);V*=g,v*=g,ue*=.72+.28*g}}if(s&&e.hasMouth){let k=(T-s.x)*p+(H-s.y)*b,d=Math.max(0,Math.min(1,(k+28)/(28+_*.72))),g=d*d*(3-2*d);ue*=1+.48*g;let S=Math.max(0,Math.min(1,k/_));V*=1-S*S*(3-2*S);let q=Math.max(0,Math.min(1,(k+58)/52));v*=1-q*q*(3-2*q)}let W=Je(T,H*De),R=o(W.q,W.r);return{wx:Y,wy:C,halfW:ue,mouthFade:V,landFade:v,fogDim:R===0?0:R===1?.65:1}},L=34;for(let T=0;T<l-1&&!(this.vertCount+6>jr);T++){let H=a[T],Q=a[T+1],N=E(H.x,H.y,T),Y=E(Q.x,Q.y,T+1);if(N.fogDim===0&&Y.fogDim===0)continue;let C=N.fogDim>0?N.fogDim:Y.fogDim,oe=Y.fogDim>0?Y.fogDim:N.fogDim,ue=N.halfW+L*(.28+.72*N.landFade),V=Y.halfW+L*(.28+.72*Y.landFade),v=H.x-X[T]*ue,W=H.y-w[T]*ue,R=H.x+X[T]*ue,I=H.y+w[T]*ue,k=Q.x-X[T+1]*V,d=Q.y-w[T+1]*V,g=Q.x+X[T+1]*V,S=Q.y+w[T+1]*V,q=E(v,W,T),F=E(R,I,T),z=E(k,d,T+1),G=E(g,S,T+1);this.pushVertex(q.wx,q.wy,v,W,-ue,N.halfW,q.mouthFade,q.landFade,C,A[T],x[T],M[T],y[T]),this.pushVertex(F.wx,F.wy,R,I,ue,N.halfW,F.mouthFade,F.landFade,C,A[T],x[T],M[T],y[T]),this.pushVertex(G.wx,G.wy,g,S,V,Y.halfW,G.mouthFade,G.landFade,oe,A[T+1],x[T+1],M[T+1],y[T+1]),this.pushVertex(q.wx,q.wy,v,W,-ue,N.halfW,q.mouthFade,q.landFade,C,A[T],x[T],M[T],y[T]),this.pushVertex(G.wx,G.wy,g,S,V,Y.halfW,G.mouthFade,G.landFade,oe,A[T+1],x[T+1],M[T+1],y[T+1]),this.pushVertex(z.wx,z.wy,k,d,-V,Y.halfW,z.mouthFade,z.landFade,oe,A[T+1],x[T+1],M[T+1],y[T+1])}}render(e){let{cam:r,assets:o,routes:i,manualEdges:n=[],sampleReliefHeight:a,lookupFog:l,lookupHex:c,timeSec:s,windAnimation:u=!0}=e;if(i.length===0&&n.length===0)return 0;this.vertCount=0;let h=r.zoom<.35?1+(.35-r.zoom)*1.4:1,f=c?(p,b)=>{let _=c(p,b);if(!_)return!1;let A=_.terrainId;return A==="ocean"||A==="coastal_water"||A==="stormy_ocean"||A==="icy_ocean"}:void 0;for(let p=0;p<i.length;p++){let b=this.getCachedCourse(i[p],34,f);b&&this.emitCourse(b,a,l,c,h)}if(n.length>0){let p=Qr(n,34);for(let b=0;b<p.length;b++)this.emitCourse(p[b],a,l,c,h)}if(this.vertCount===0)return 0;let{gl:m}=this;return m.enable(m.BLEND),m.blendEquation(m.FUNC_ADD),m.blendFunc(m.ONE,m.ONE_MINUS_SRC_ALPHA),m.useProgram(this.program),m.bindVertexArray(this.vao),m.bindBuffer(m.ARRAY_BUFFER,this.vbo),m.bufferSubData(m.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*sr)),m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D_ARRAY,o.terrainArray),m.uniform2f(this.uCamCenter,r.x,r.y),m.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),m.uniform1f(this.uZoom,r.zoom),m.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),m.uniform1f(this.uTime,s),m.uniform1f(this.uWindEnabled,u?1:0),m.uniform1f(this.uPassMode,0),m.drawArrays(m.TRIANGLES,0,this.vertCount),m.uniform1f(this.uPassMode,1),m.drawArrays(m.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var zo=Pe.map(([t,e])=>[t+e*.5,Ye*e/256]),Yo=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),jo=new Set(["moor","marshland","swamp"]);function dr(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function Jr(t,e,r){return t.kind==="mountain"?3:er(t)?0:t.kind==="tree"?r>=66?2:1:tr(t)||xt(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function en(t){return er(t)?0:t.kind==="mountain"?.44:tr(t)||xt(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||rr(t)||Gr(t)?.3:.55}var $o=256*256*Math.sqrt(3)/2,Nt=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=Ir(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...Et,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...ct,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let i=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==i||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=Ir(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=bt(o,i);this.rawCellChunks.delete(n),this.chunks.delete(n);let a=e-o*Me,l=r-i*Me,c=[0],s=[0];a<=2&&c.push(-1),a>=Me-3&&c.push(1),l<=2&&s.push(-1),l>=Me-3&&s.push(1);for(let u of c)for(let h of s)u===0&&h===0||this.chunks.delete(bt(o+u,i+h));this.revision++}setHexFogState(e,r,o){let{cq:i,cr:n}=Wt(e,r,Me),a=bt(i,n),l=e-i*Me,s=(r-n*Me)*Me+l,u=this.chunks.get(a)?.cells[s],h=this.rawCellChunks.get(a)?.[s],f=u??h;return!f||f.fogState===o?!1:(u&&(u.fogState=o),h&&(h.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=bt(o,i),l=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!l)return;let c=e-o*Me,s=r-i*Me;if(!(c<0||c>=Me||s<0||s>=Me))return l[s*Me+c]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let i=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!i||i.layers.length===0)return 0;if(i.layers.length===1)return i.layers[0];let n=gn(this.seedIntValue,r,o,101)%i.layers.length;return i.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let i=pn(e,Me,2),n=0,a=0,l=[];for(let{cq:y,cr:E}of i){let L=bt(y,E),T=this.chunks.get(L);T?(this.chunks.delete(L),this.chunks.set(L,T),l.push(T)):n<r?(T=this.buildChunk(y,E),this.chunks.set(L,T),n++,this.revision++,l.push(T)):a++}for(;this.chunks.size>this.maxCachedChunks;){let y=this.chunks.keys().next().value;if(y===void 0)break;this.chunks.delete(y)}let c=this.maxCachedChunks*2;for(;this.rawCellChunks.size>c;){let y=this.rawCellChunks.keys().next().value;if(y===void 0)break;this.rawCellChunks.delete(y)}let s=e.viewportWidth*.5/e.zoom+420,u=e.viewportHeight*.5/e.zoom+420,h=e.x-s,f=e.x+s,m=e.y-u,p=e.y+u,b=[],_=[],A=[],D=new Set;for(let y of l){for(let E of y.shorelines){if(E.x<h||E.x>f||E.y<m||E.y>p)continue;let L=this.lookupHex(E.q,E.r),T=L?L.fogState:0;T!==0&&(b.push(E),_.push(T))}for(let E of y.riverRoutes)D.has(E.id)||(D.add(E.id),A.push(E))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:b,shoreFogStates:_,riverRoutes:A,chunksLoadedThisFrame:n,hasPendingChunks:a>0};let x=[],M=[];for(let y of l){for(let E of y.sprites)E.x<h||E.x>f||E.y<m||E.y>p||x.push(E);for(let E of y.decals)E.x<h||E.x>f||E.y<m||E.y>p||M.push(E)}x.sort((y,E)=>(y.sortY??y.y)-(E.sortY??E.y)||y.x-E.x);let X=new Array(x.length);for(let y=0;y<x.length;y++){let E=x[y],L=this.lookupHex(E.q,E.r);X[y]=L?L.fogState:0}let w=new Array(M.length);for(let y=0;y<M.length;y++){let E=M[y],L=this.lookupHex(E.q,E.r);w[y]=L?L.fogState:0}return{sprites:x,fogStates:X,decals:M,decalFogStates:w,shorelines:b,shoreFogStates:_,riverRoutes:A,chunksLoadedThisFrame:n,hasPendingChunks:a>0}}getOrFetchRawCells(e,r){let o=bt(e,r),i=this.rawCellChunks.get(o);if(i)return i;let n=e*Me,a=r*Me,l=this.provider({cq:e,cr:r,chunkSize:Me}),c=new Array(Me*Me),s=this.fogOverride;for(let u of l){let h=u.q-n,f=u.r-a;h<0||h>=Me||f<0||f>=Me||(s&&(u.fogState=s(u.q,u.r)),c[f*Me+h]=u)}return this.rawCellChunks.set(o,c),c}lookupRawHex(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=this.getOrFetchRawCells(o,i),a=e-o*Me,l=r-i*Me;return n[l*Me+a]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,i)=>o[0].localeCompare(i[0])),r=[];for(let[o,i]of e){let n=Wn(i,this.manifest),a=i.worldWidth*Rt(i),l=.72*a*a/$o,c=0,s=o.replace(/^assets\//,"");for(let f=0;f<s.length;f++)c=Math.imul(c,31)+s.charCodeAt(f)|0;let u=i.kind==="tree"?"tree":i.kind==="shrub"?"shrub":i.kind==="ground_cover"?"ground_cover":"other",h={key:o,entry:i,allowedTypes:n,effectiveWidth:a,crownAreaRatio:l,pathSalt:c,pre:{strict:qt(i),ecoFamily:Bt(i)},pScale:Nr(i),chanceMult:En(i),minSpacing:i.placement?.minSpacing??28,edgeMargin:i.placement?.edgeMargin??12,pKind:u,isCanopy:Cn(i),isBoulder:tr(i),isWaterBoulder:xt(i),isWarmBoulder:Dt(i),isGroundDecal:er(i),isDryPatch:rr(i),isAcacia:Or(i),isAccent:Rn(i),isSnowFamily:nr(i),isBush20to29:Hr(i),isReed:Gr(i),isHerb:i.family==="herbs",accentGroup:Mn(i)};if(i.kind==="mountain")this.mountainCandidates.push(h);else if(h.isWaterBoulder)i.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(h);else if(h.isGroundDecal){if(i.artStatus!=="deprecated"&&(i.placement?.density??.25)>0&&n.size>0)for(let f of n){let m=this.decalCandidatesByTerrain.get(f);m||(m=[],this.decalCandidatesByTerrain.set(f,m)),m.push(h)}}else if(i.artStatus!=="deprecated"&&(i.placement?.density??0)>0&&(i.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(h),h.isReed&&this.reedCandidates.push(h);for(let f of n){let m=this.candidatesByTerrain.get(f);m||(m=[],this.candidatesByTerrain.set(f,m)),m.push(h)}n.has("forest_floor")&&i.family!=="palms"&&r.push(h)}}for(let o of Object.keys(this.manifest.terrain.byType)){let i=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,i);else{let n=new Set(i),a=[...i];for(let l of r)n.has(l)||(n.add(l),a.push(l));this.candidatesByTerrainForest.set(o,a)}}}createPlacedSprite(e,r,o,i,n,a,l){let c=e.entry,s=e.effectiveWidth*a,u=s*c.aspect,h=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],f=n*De,m=c.kind==="mountain",p=Math.round(i*3)^Math.round(n*5)|0,_=!m&&!e.isAccent&&!e.accentGroup&&K(this.seedIntValue,r,o,p+811)<.5,A=i/(256*2.6),D=n/(256*2.6),x=Math.floor(A),M=Math.floor(D),X=A-x,w=D-M,y=X*X*(3-2*X),E=w*w*(3-2*w),L=K(this.seedIntValue,x,M,913),T=K(this.seedIntValue,x+1,M,913),H=K(this.seedIntValue,x,M+1,913),Q=K(this.seedIntValue,x+1,M+1,913),N=L+(T-L)*y+(H+(Q-H)*y-(L+(T-L)*y))*E,Y=K(this.seedIntValue,r,o,p+823),C=N*.6+Y*.4,oe=m||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:c.kind==="tree"?.62:c.family==="cacti"?.08:c.kind==="shrub"?.42:c.kind==="ground_cover"?.24:0;return{x:i,y:f-l*De,sortY:f,width:s,height:u,anchorX:c.anchor[0],anchorY:c.anchor[1],page:c.page,u0:c.uv[0],v0:c.uv[1],u1:c.uv[2],v1:c.uv[3],q:r,r:o,isMountain:m,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:_,tintHash:C,swayAmp:oe,shadowTier:Jr(c,s,u),selfShadeWeight:en(c),shadowPage:h?h.page:-1,shadowU0:h?h.uv[0]:0,shadowV0:h?h.uv[1]:0,shadowU1:h?h.uv[2]:0,shadowV1:h?h.uv[3]:0,shadowMinX:h?h.boundsInSpriteWidth[0]:0,shadowMinY:h?h.boundsInSpriteWidth[1]:0,shadowMaxX:h?h.boundsInSpriteWidth[2]:0,shadowMaxY:h?h.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*Me,i=r*Me,n=this.seedIntValue,a=this.getOrFetchRawCells(e,r),l=[],c=[];for(let d=-2;d<Me+2;d++)for(let g=-2;g<Me+2;g++){let S=o+g,q=i+d,F=this.lookupRawHex(S,q);F&&(l.push(F),g>=0&&g<Me&&d>=0&&d<Me&&c.push(F))}let s=Dn(l,this.manifest,n,this.forestConfig);for(let d of c){let g=s.get(Fe(d.q,d.r));g&&(d.forestClass=g.forestClass,d.glade=g.glade,d.gladeX=g.gladeX,d.gladeY=g.gladeY,d.gladeRadius=g.gladeRadius)}let u=[],h=this.manifest.infrastructure.sprites;for(let d of c){if(this.isWaterTerrain(d.terrainId)||Ct.has(d.terrainId))continue;let g=Ie(d.q,d.r);for(let S=0;S<6;S++){let[q,F]=Pe[S],z=this.lookupRawHex(d.q+q,d.r+F);if(!z||!this.isWaterTerrain(z.terrainId)||z.terrainId==="icy_ocean")continue;let G=`shorelines/shore_v105_edge_0${S+1}`,J=h[G];J&&u.push({x:g.x,y:g.y,q:d.q,r:d.r,side:S,page:J.page,u0:J.uv[0],v0:J.uv[1],u1:J.uv[2],v1:J.uv[3]})}}let f=this.provider.getRiverRoutesForChunk?.(e,r,Me)??[],m=[],p=(d,g)=>{let S=this.lookupRawHex(d,g);return S?this.isWaterTerrain(S.terrainId):!1};for(let d=0;d<f.length;d++){let g=Ot(f[d],34,p);if(!g||g.points.length<2)continue;let S=1/0,q=-1/0,F=1/0,z=-1/0;for(let G=0;G<g.points.length;G++){let J=g.points[G];J.x<S&&(S=J.x),J.x>q&&(q=J.x),J.y<F&&(F=J.y),J.y>z&&(z=J.y)}m.push({course:g,minX:S-90,maxX:q+90,minY:F-90,maxY:z+90})}let b=(d,g)=>{if(m.length===0)return 1/0;let S=1/0;for(let q=0;q<m.length;q++){let F=m[q];if(d<F.minX||d>F.maxX||g<F.minY||g>F.maxY)continue;let z=F.course.points;for(let G=1;G<z.length;G++){let J=z[G-1],ge=z[G],Z=ge.x-J.x,ve=ge.y-J.y,Ce=Z*Z+ve*ve,de=Ce>1e-6?((d-J.x)*Z+(g-J.y)*ve)/Ce:0;de<0?de=0:de>1&&(de=1);let ie=d-(J.x+de*Z),j=g-(J.y+de*ve),ee=ie*ie+j*j;ee<S&&(S=ee)}}return S<1/0?Math.sqrt(S):1/0},_=this.reliefConfig.enabled?this.reliefConfig.strength:0,A=this.reliefConfig.style??"sculpted",D=Nn(l,this.manifest,n,_,A),x=(d,g)=>zn(D,d,g),M=[],X=new Set,w=[],y=new Map,E=(d,g,S,q,F,z,G,J)=>{M.push(this.createPlacedSprite(d,g,S,q,F,z,G));let ge={x:q,y:F,pScale:d.pScale,minSpacing:d.minSpacing,visualHalfW:d.effectiveWidth*z*.5,isCanopy:d.isCanopy,isBoulder:d.isBoulder},Z=Fe(g,S),ve=y.get(Z);ve||(ve=[],y.set(Z,ve)),ve.push(ge),J.push(ge)};if(this.mountainCandidates.length>0){let d=new Set(c.map(g=>Fe(g.q,g.r)));for(let g of l){if(g.reliefClass!=="mountain"||g.occupied)continue;let S=this.mountainCandidates.filter(de=>Ln(de.entry,de.allowedTypes,g.terrainId,this.manifest)),q=this.mountainCandidates.filter(de=>!kn(de.entry)),F=S.length>0?S:q.length>0?q:this.mountainCandidates,z=0;for(let de=0;de<F.length;de++)z+=Math.max(.1,F[de].entry.placement?.weight??1);let G=K(n,g.q,g.r,2002)*z,J=F[0];for(let de=0;de<F.length;de++)if(G-=Math.max(.1,F[de].entry.placement?.weight??1),G<=0){J=F[de];break}let ge=256*(g.q+g.r*.5),Z=Ye*g.r+20,ve=Math.max(72,(J.entry.mountain?.coreRadius??.32)*J.effectiveWidth);w.push({ux:ge,uy:Z,coreR2:ve*ve});let Ce=Fe(g.q,g.r);if(X.add(Ce),d.has(Ce)){let de=x(ge,Z);M.push(this.createPlacedSprite(J,g.q,g.r,ge,Z,1,de))}}}let L=c.filter(d=>!this.isWaterTerrain(d.terrainId)).length,T=Tn(L),H={dead_trees:0,fallen_logs:0},Q=(d,g,S,q)=>{let F=d/S,z=g/S,G=Math.floor(F),J=Math.floor(z),ge=F-G,Z=z-J,ve=ge*ge*(3-2*ge),Ce=Z*Z*(3-2*Z),de=K(n,G,J,q),ie=K(n,G+1,J,q),j=K(n,G,J+1,q),ee=K(n,G+1,J+1,q),me=de+(ie-de)*ve,ye=j+(ee-j)*ve;return me+(ye-me)*Ce},N=(d,g,S,q)=>K(n,g,S,q+d.pathSalt),Y=(d,g,S=null)=>{if(S!==null)return S;if(d.isWaterBoulder)return dr(g)*1.28;if(d.isBoulder)return dr(g);let q=d.entry.scaleRange[0]??.85,F=d.entry.scaleRange[1]??1.15,z=d.entry.kind==="tree"?Math.min(q,.76):d.entry.kind==="shrub"?Math.min(q,.74):q,G=d.entry.kind==="tree"?Math.max(F,1.2):d.entry.kind==="shrub"?Math.max(F,1.22):F;return z+(G-z)*g},C=(d,g)=>{for(let S=0;S<w.length;S++){let q=w[S],F=d-q.ux,z=g-q.uy;if(F*F+z*z<q.coreR2)return!0}return!1},oe=(d,g,S,q,F)=>{if(S.length===0)return!0;let z=256*.5-(F+Math.min(74,q*.72));for(let G=0;G<S.length;G++){let[J,ge]=zo[S[G]];if(d*J+g*ge>z)return!1}return!0},ue=(d,g,S,q)=>{if(m.length===0||S.isWaterBoulder)return!1;let F=b(d,g);return F===1/0?!1:S.isReed?F<21:F<24+Math.min(38,q*.45)},V=(d,g,S,q,F,z,G,J,ge=null,Z,ve=[],Ce=34)=>{let de=d.entry,ie=Z??d.edgeMargin,j=K(n,g.q,g.r,G*47+7),ee=Y(d,j,ge),me=d.effectiveWidth*ee*.5,ye=d.pKind,Le=d.pScale,Se=d.minSpacing,ke=d.isCanopy,Ee=de.kind==="tree";for(let Re=0;Re<28;Re++){let{dx:We,dy:Ve}=Un(n,g.q,g.r,ye,G,Re);if(!or(We,Ve,ie)||!oe(We,Ve,ve,me,Ce)||Ee&&Xr(z,We,Ve))continue;let Ge=S+We,Ue=q+Ve;if(C(Ge,Ue)||ue(Ge,Ue,d,me))continue;let P=!1;for(let se=0;se<F.length;se++){let te=F[se],B=Math.sqrt(Le*te.pScale),U=ke&&te.isCanopy,ae=U?J:Math.max(.85,J),re=Math.max(U&&ae<.6?10:14,Math.max(Se,te.minSpacing)*ae*B);!U&&(d.isBoulder||te.isBoulder)&&(re=Math.max(re,(me+te.visualHalfW)*.56));let $=Ge-te.x,le=Ue-te.y;if($*$+le*le<re*re){P=!0;break}}if(P)continue;let O=x(Ge,Ue);return E(d,g.q,g.r,Ge,Ue,ee,O,F),{ux:Ge,uy:Ue,scale:ee,halfW:me}}return null},v=(d,g,S,q,F,z,G,J,ge,Z,ve,Ce,de,ie,j,ee=[],me=34)=>{let ye=j??d.edgeMargin,Le=K(n,g.q,g.r,de*53+13),Se=Y(d,Le,Z),ke=d.effectiveWidth*Se*.5,Ee=d.pScale,Re=d.minSpacing,We=d.entry.kind==="tree",Ve=K(n,g.q,g.r,de*61+19)*Math.PI*2,Ge=Math.max(J,G*.68+ke*.44),Ue=Math.max(ge,Ge+28);for(let P=0;P<20;P++){let O=K(n,g.q,g.r,de*71+P*11+3),se=K(n,g.q,g.r,de*73+P*13+5),te=Ve+P*2.3999632+(se-.5)*.42,B=Ge+(Ue-Ge)*O,U=F+Math.cos(te)*B,ae=z+Math.sin(te)*B*.78,re=U-S,$=ae-q;if(!or(re,$,ye)||!oe(re,$,ee,ke,me)||We&&Xr(Ce,re,$)||C(U,ae)||ue(U,ae,d,ke))continue;let le=!1;for(let pe=0;pe<ve.length;pe++){let qe=ve[pe],Be=Math.sqrt(Ee*qe.pScale),Xe=Math.max(10,Math.max(Re,qe.minSpacing)*ie*Be);(d.isBoulder||qe.isBoulder)&&(Xe=Math.max(Xe,(ke+qe.visualHalfW)*.56));let at=U-qe.x,je=ae-qe.y;if(at*at+je*je<Xe*Xe){le=!0;break}}if(le)continue;let Ae=x(U,ae);return E(d,g.q,g.r,U,ae,Se,Ae,ve),{ux:U,uy:ae,scale:Se,halfW:ke}}return null},W=(d,g)=>{for(let S=-2;S<=2;S++)for(let q=-2;q<=2;q++){if(tt(0,0,q,S)>2)continue;let F=this.lookupRawHex(d+q,g+S);if(F&&F.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let d=this.waterBoulderCandidates;for(let g of c){if(g.occupied||!It.has(g.terrainId)||g.terrainId!=="coastal_water"&&!W(g.q,g.r))continue;let S=.45+1.2*Q(g.q,g.r,3.2,4107),q=g.terrainId==="coastal_water"?.27:g.terrainId==="stormy_ocean"?.19:.15,F=Math.min(.48,q*S);if(K(n,g.q,g.r,4111)>=F)continue;let z=[];for(let j=0;j<6;j++){let[ee,me]=Pe[j],ye=this.lookupRawHex(g.q+ee,g.r+me);ye&&!this.isWaterTerrain(ye.terrainId)&&z.push(j)}let G=256*(g.q+g.r*.5),J=Ye*g.r,ge=[];for(let j=-1;j<=1;j++)for(let ee=-1;ee<=1;ee++){let me=y.get(Fe(g.q+ee,g.r+j));if(me)for(let ye=0;ye<me.length;ye++)ge.push(me[ye])}let Z=Math.floor(K(n,g.q,g.r,4113)*d.length),ve=d[Z%d.length],Ce=1,de=V(ve,g,G,J,ge,void 0,Ce++,.85,null,20,z,30);if(!de)continue;let ie=K(n,g.q,g.r,4117);if(ie<.48){let j=ie<.18?2:1;for(let ee=0;ee<j;ee++){let me=Math.floor(K(n,g.q,g.r,4121+ee*7)*d.length),ye=d[me%d.length],Le=K(n,g.q,g.r,4129+ee*11),Se=Math.max(.55,Math.min(2.35,de.scale*(.4+.46*Le)));v(ye,g,G,J,de.ux,de.uy,de.halfW,Math.max(24,de.scale*20),Math.max(64,de.scale*38),Se,ge,void 0,Ce++,.62,18,z,30)}}}}let R=this.forestConfig.mode,I=this.forestConfig.openTreeChance;for(let d of c){let g=Fe(d.q,d.r);if(d.occupied||X.has(g)||this.isWaterTerrain(d.terrainId))continue;let S=s.get(g);if(Hn(n,d.q,d.r,S))continue;let q=[],F=[];for(let ne=0;ne<6;ne++){let[fe,he]=Pe[ne],ce=this.lookupRawHex(d.q+fe,d.r+he);ce&&(q.push(ce.terrainId),this.isWaterTerrain(ce.terrainId)&&F.push(ne))}let z=S?.forestClass??"none",G=z==="dense_forest"||z==="light_forest",J=z==="light_forest"||!G&&(S?.edgeInfluence??0)>.1,ge=!!(d.riverEdges&&d.riverEdges.length>0),Z=wn.has(d.terrainId),ve=jo.has(d.terrainId),Ce=Z||d.terrainId==="semi_desert"||d.terrainId==="savanna",de=G?this.candidatesByTerrainForest.get(d.terrainId)??this.allCandidates:this.candidatesByTerrain.get(d.terrainId)??this.allCandidates;if(de.length===0)continue;let ie={baseBiome:d.terrainId,biome:S?.biome??d.terrainId,forestClass:z,neighborTypes:q,hasRiverEdge:ge},j=Lt.has(d.terrainId),ee=[],me=[],ye=[],Le=[],Se=[],ke=[],Ee=[],Re=!1;for(let ne=0;ne<de.length;ne++){let fe=de[ne],he=fe.entry;qn(he.family,S)&&Fn(he,fe.allowedTypes,ie,this.manifest,fe.pre)&&(d.terrainId==="tundra"&&he.family==="snow_conifers"&&N(fe,d.q,d.r,973)>=.02||(Re=!0,fe.isCanopy?j&&(he.family==="palms"||fe.isAcacia)?ee.push(fe):me.push(fe):fe.isBoulder?(ye.push(fe),fe.isWarmBoulder&&Le.push(fe)):fe.isDryPatch?Se.push(fe):he.family==="snow"?ke.push(fe):Ee.push(fe)))}if(!Re)continue;me.sort((ne,fe)=>{let he=ne.entry.placement,ce=fe.entry.placement,xe=N(ne,d.q,d.r,301)/Math.max(.04,(he.density??.12)*Math.min(1,he.weight??1)),_e=N(fe,d.q,d.r,301)/Math.max(.04,(ce.density??.12)*Math.min(1,ce.weight??1));return xe-_e}),Ee.sort((ne,fe)=>N(ne,d.q,d.r,302)-N(fe,d.q,d.r,302));let We=Ee.filter(ne=>(ne.pKind==="shrub"||ne.pKind==="ground_cover")&&!ne.isAccent&&!ne.accentGroup&&!(Z&&(ne.isBush20to29||ne.isHerb))),Ve=In(S);Ve>1&&Ut(n,d.q,d.r,"tree")<.58&&Ve--;let Ge=Bn(S),Ue=Q(d.q,d.r,4.2,5107),P=Q(d.q,d.r,1.9,5119),O=Math.pow(Ue*.68+P*.32,1.35),se=G?1:.14+1.76*O,te=G?Ge:Math.max(Ge,10),B=R==="canopy"?z==="dense_forest"?.34:z==="light_forest"?.59:.88:R==="dense"?z==="dense_forest"?.52:z==="light_forest"?.73:1:z==="dense_forest"?.72:z==="light_forest"?.92:1,U=256*(d.q+d.r*.5),ae=Ye*d.r,re=[];for(let ne=-1;ne<=1;ne++)for(let fe=-1;fe<=1;fe++){let he=y.get(Fe(d.q+fe,d.r+ne));if(he)for(let ce=0;ce<he.length;ce++)re.push(he[ce])}let $=0,le=0,Ae=0,pe=1,qe=(ne,fe)=>{if(G||$>=te)return;let he=K(n,d.q,d.r,5201+pe*17);if(fe.length>0&&he<.46){let _e=se>1.08&&he<.2?2:1;for(let be=0;be<_e&&$<te;be++){let Te=Math.floor(K(n,d.q,d.r,5211+be*7)*fe.length),we=fe[Te%fe.length],ze=K(n,d.q,d.r,5221+be*9),Oe=Math.max(.5,Math.min(1.85,ne.scale*(.38+.44*ze)));v(we,d,U,ae,ne.ux,ne.uy,ne.halfW,Math.max(20,ne.halfW*.72),Math.max(52,ne.halfW*1.45),Oe,re,S,pe++,.55,void 0,F)&&$++}}let ce=Ce&&Se.length>0?Z?Se:[...Se,...We]:We,xe=K(n,d.q,d.r,5237+pe*13);if(ce.length>0&&xe<.62){let _e=1+Math.floor(K(n,d.q,d.r,5243)*(se>1.05?2:1));for(let be=0;be<_e&&$<te;be++){let Te=Math.floor(K(n,d.q,d.r,5251+be*11)*ce.length),we=ce[Te%ce.length],ze=K(n,d.q,d.r,5261+be*7),Oe=we.entry.scaleRange[0]??.85,Ke=we.entry.scaleRange[1]??1.15,Ze=(Oe+(Ke-Oe)*ze)*.92;v(we,d,U,ae,ne.ux,ne.uy,ne.halfW,Math.max(20,ne.halfW*.76),Math.max(54,ne.halfW*1.38+18),Ze,re,S,pe++,.5,void 0,F)&&$++}}},Xe=Le.length>0&&K(n,d.q,d.r,1607)<.85?Le:ye,at=Xe.reduce((ne,fe)=>Math.max(ne,fe.entry.placement?.density??0),0),je=G?1:.72+.48*se,et=Math.min(.44,at*(Le.length>0?2.5:1.15)*je);if(Le.length>0&&$<te&&K(n,d.q,d.r,1601)<et){let ne=Math.floor(K(n,d.q,d.r,1602)*Xe.length);for(let fe=0;fe<Xe.length;fe++){let he=Xe[(ne+fe)%Xe.length],ce=V(he,d,U,ae,re,S,pe++,1,null,void 0,F);if(ce){$++,qe(ce,Xe);break}}}if(ee.length>0&&$<te&&K(n,d.q,d.r,1751)<.065*(.75+.45*se)){let ne=ee.filter(xe=>xe.entry.family==="palms"),fe=ee.filter(xe=>xe.isAcacia),he=K(n,d.q,d.r,1752)<.5?[ne,fe]:[fe,ne],ce=!1;for(let xe of he){if(!xe.length||ce)continue;let _e=Math.floor(K(n,d.q,d.r,1753)*xe.length);for(let be=0;be<xe.length;be++){let Te=xe[(_e+be)%xe.length],we=V(Te,d,U,ae,re,S,pe++,1,null,void 0,F);if(we){if($++,ce=!0,K(n,d.q,d.r,1759)<.45){let ze=1+Math.floor(K(n,d.q,d.r,1763)*2);for(let Oe=0;Oe<ze&&$<te;Oe++){let Ke=xe[(_e+Oe+1)%xe.length];v(Ke,d,U,ae,we.ux,we.uy,we.halfW,22,56,null,re,S,pe++,.54,void 0,F)&&$++}}break}}}}let mt=Math.min(.58,Sn(d.terrainId)*(.76+.44*se));if(Se.length>0&&$<te&&K(n,d.q,d.r,1831)<mt){let ne=Math.floor(K(n,d.q,d.r,1832)*Se.length);for(let fe=0;fe<Se.length;fe++){let he=Se[(ne+fe)%Se.length],ce=V(he,d,U,ae,re,S,pe++,.9,null,void 0,F);if(ce){$++;let xe=K(n,d.q,d.r,1837);if(!G&&xe<.52&&$<te){let _e=xe<.22&&se>.95?2:1;for(let be=0;be<_e&&$<te;be++){let Te=Se[(ne+1+be+Math.floor(xe*11))%Se.length],we=K(n,d.q,d.r,1843+be*7),ze=Te.entry.scaleRange[0]??.8,Oe=Te.entry.scaleRange[1]??1.15,Ke=(ze+(Oe-ze)*we)*(.76+.3*we);v(Te,d,U,ae,ce.ux,ce.uy,ce.halfW,16,44,Ke,re,S,pe++,.48,void 0,F)&&$++}}break}}}let st=R==="canopy"&&G?S?.canopyCoverage??0:0,Ar=st?Math.max(Ve,Ge-2):Ve;for(let ne=0;ne<Ar&&$<Ge&&me.length>0&&!(le>=Ve&&(!st||Ae>=st));ne++){let fe=me[ne%Math.min(me.length,5)],he=null;if(J){let xe=K(n,d.q,d.r,pe*47+7);he=Y(fe,xe,null)*(.76+.16*xe)}let ce=V(fe,d,U,ae,re,S,pe++,B,he,void 0,F);ce&&(le++,$++,Ae+=fe.crownAreaRatio*ce.scale*ce.scale)}let kr=Math.min(.68,I*(.62+.62*se));if(!Ve&&!S?.glade&&me.length>0&&I>0&&N(me[0],d.q,d.r,311)<kr&&$<te){let ne=V(me[0],d,U,ae,re,S,pe++,1,null,void 0,F);if(ne){$++;let fe=K(n,d.q,d.r,5301),he=I>.25?.64:.52;if(fe<he){let ce=1+Math.floor(K(n,d.q,d.r,5303)*3),xe=Math.min(me.length,4);for(let _e=0;_e<ce&&$<te;_e++){let be=me[(_e+1)%xe];v(be,d,U,ae,ne.ux,ne.uy,ne.halfW,24,62,null,re,S,pe++,.52,void 0,F)&&$++}if(We.length>0&&$<te){let _e=K(n,d.q,d.r,5311)<.55?2:1;for(let be=0;be<_e&&$<te;be++){let Te=Math.floor(K(n,d.q,d.r,5317+be*7)*We.length),we=We[Te%We.length];v(we,d,U,ae,ne.ux,ne.uy,ne.halfW,18,48,null,re,S,pe++,.48,void 0,F)&&$++}}else if(ye.length>0&&$<te&&K(n,d.q,d.r,5323)<.35){let _e=ye[Math.floor(K(n,d.q,d.r,5329)*ye.length)];v(_e,d,U,ae,ne.ux,ne.uy,ne.halfW,20,48,.62+K(n,d.q,d.r,5333)*.45,re,S,pe++,.52,void 0,F)&&$++}}}}let Wr=G?1:.72+.48*se;if(Le.length===0&&ye.length>0&&$<te&&K(n,d.q,d.r,1601)<Math.min(.36,at*1.15*Wr)){let ne=Math.floor(K(n,d.q,d.r,1602)*ye.length);for(let fe=0;fe<ye.length;fe++){let he=ye[(ne+fe)%ye.length],ce=V(he,d,U,ae,re,S,pe++,1,null,void 0,F);if(ce){$++,qe(ce,ye);break}}}if(ke.length>0&&$<te){let ne=d.terrainId==="snowfields"||d.terrainId==="frozen_tundra"?.58:d.terrainId==="highland"?.25:.14;if(K(n,d.q,d.r,1643)<ne){let fe=Math.floor(K(n,d.q,d.r,1644)*ke.length);for(let he=0;he<ke.length;he++){let ce=ke[(fe+he)%ke.length];if(V(ce,d,U,ae,re,S,pe++,B,null,void 0,F)){$++;break}}}}if(Ee.length>0&&$<te){let ne=z==="dense_forest"?1.2:J?1.28:.58+.62*se,fe=Ut(n,d.q,d.r,"shrub"),he=Ut(n,d.q,d.r,"ground_cover"),ce=Ut(n,d.q,d.r,"other"),xe=!1,_e=!1,be=!1,Te=Ee.filter(we=>we.isReed);for(let we of Ee){if($>=te)break;let ze=we.entry,Oe=we.accentGroup;if(Oe&&(xe||H[Oe]>=T[Oe]))continue;let Ke=we.pKind==="shrub"?fe:we.pKind==="ground_cover"?he:ce,Ze=1;we.isBush20to29?Z?Ze=.022:d.terrainId==="savanna"?Ze=.55:d.terrainId==="semi_desert"?Ze=.92:(Yo.has(d.terrainId)||G)&&(Ze=1.32):we.isHerb&&Z?Ze=.3:we.isReed&&(ve?Ze=1.65:(ge||F.length>0)&&(Ze=1.35));let _t=Math.min(.86,(ze.placement?.density??.15)*Math.min(1,ze.placement?.weight??1)*ne*we.chanceMult*Ze*Ke);if(N(we,d.q,d.r,312)>=_t)continue;let Qe=V(we,d,U,ae,re,S,pe++,B,null,void 0,F);if(Qe){if($++,Oe)H[Oe]++,xe=!0;else if(we.isAccent)xe=!0;else if(we.isReed&&!be&&Te.length>0&&$<te){if(K(n,d.q,d.r,5501+pe*13)<.74){be=!0;let yt=1+Math.floor(K(n,d.q,d.r,5507)*3);for(let gt=0;gt<yt&&$<te;gt++){let Fr=Math.floor(K(n,d.q,d.r,5519+gt*7)*Te.length),nt=Te[Fr%Te.length],zt=K(n,d.q,d.r,5527+gt*11),St=nt.entry.scaleRange[0]??.85,Yt=nt.entry.scaleRange[1]??1.15,jt=(St+(Yt-St)*zt)*(.78+.3*zt);v(nt,d,U,ae,Qe.ux,Qe.uy,Qe.halfW,14,38,jt,re,S,pe++,.42,void 0,F)&&$++}}}else if(!G&&!_e&&we.pKind==="shrub"&&!(Z&&we.isBush20to29)&&We.length>0&&$<te){let vt=K(n,d.q,d.r,5401+pe*19);if(vt<.5){_e=!0;let yt=We.filter(nt=>nt.entry.family===ze.family),gt=yt.length>0?yt:We,Fr=vt<.22&&se>.9?2:1;for(let nt=0;nt<Fr&&$<te;nt++){let zt=Math.floor(K(n,d.q,d.r,5413+nt*11)*gt.length),St=gt[zt%gt.length],Yt=K(n,d.q,d.r,5423+nt*7),jt=St.entry.scaleRange[0]??.85,_o=St.entry.scaleRange[1]??1.15,So=(jt+(_o-jt)*Yt)*(.72+.3*Yt);v(St,d,U,ae,Qe.ux,Qe.uy,Qe.halfW,15,40,So,re,S,pe++,.46,void 0,F)&&$++}if(ye.length>0&&$<te&&K(n,d.q,d.r,5437)<.22){let nt=ye[Math.floor(K(n,d.q,d.r,5441)*ye.length)];v(nt,d,U,ae,Qe.ux,Qe.uy,Qe.halfW,18,42,.55+K(n,d.q,d.r,5443)*.48,re,S,pe++,.52,void 0,F)&&$++}}}}}}if(ge&&!Z&&!Ct.has(d.terrainId)&&this.reedCandidates.length>0&&$<te&&K(n,d.q,d.r,5601)<.68){let ne=this.reedCandidates,fe=Math.floor(K(n,d.q,d.r,5609)*ne.length),he=ne[fe%ne.length],ce=V(he,d,U,ae,re,S,pe++,.7,null,void 0,F);if(ce){$++;let xe=1+Math.floor(K(n,d.q,d.r,5617)*2);for(let _e=0;_e<xe&&$<te;_e++){let be=ne[(fe+_e+1)%ne.length];v(be,d,U,ae,ce.ux,ce.uy,ce.halfW,14,36,null,re,S,pe++,.42,void 0,F)&&$++}}}}let k=[];if(this.decalCandidatesByTerrain.size>0)for(let d of c){if(this.isWaterTerrain(d.terrainId)||d.reliefClass==="mountain"||Ct.has(d.terrainId))continue;let g=this.decalCandidatesByTerrain.get(d.terrainId);if(!g||g.length===0)continue;let S=Math.sin(d.q*.31+d.r*.19+n%53)*Math.cos(d.q*.17-d.r*.37+n%29),q=Math.sin(d.q*.67-d.r*.53+n%97)*.45,F=.5+.5*(S*.72+q*.28),z=K(n,d.q,d.r,7091),J=d.terrainId.includes("desert")||d.terrainId.includes("badlands")||d.terrainId.includes("savanna")||d.terrainId.includes("semi_arid")||d.terrainId.includes("dry")?.38+F*.38:.48+F*.38;if(z>=J)continue;let ge=256*(d.q+d.r*.5),Z=Ye*d.r,Ce=Pe.some(([Se,ke])=>{let Ee=this.lookupRawHex(d.q+Se,d.r+ke);return Ee?this.isWaterTerrain(Ee.terrainId):!1})?46:28,de=d.forestDensity??0,ie=F>.52&&z<J*.58?2:1,j=this.manifest.terrain.byType[d.terrainId]?.avgColor,ee=j?(Math.max(0,Math.min(255,Math.round(j[0])))&255)<<16|(Math.max(0,Math.min(255,Math.round(j[1])))&255)<<8|Math.max(0,Math.min(255,Math.round(j[2])))&255:0,me=[];for(let Se=0;Se<g.length;Se++){let ke=g[Se],Ee=ke.entry.tags??[];Ee.includes("meadow_decal")&&de>.42||Ee.includes("woodland_decal")&&de<.2&&d.terrainId!=="forest_floor"&&d.terrainId!=="swamp"&&d.terrainId!=="marsh"&&d.terrainId!=="marshland"&&d.terrainId!=="moor"&&d.terrainId!=="jungle"||me.push(ke)}if(me.length===0)continue;let ye=new Set,Le=[];for(let Se=0;Se<ie;Se++){let ke=Math.floor(K(n,d.q,d.r,7109+Se*31)*me.length),Ee=me[ke%me.length];if(ye.has(Ee.key))continue;let Re=Ee.pathSalt+Se*1777,We=(K(n,d.q,d.r,Re+7121+Se*7)-.5)*148,Ve=(K(n,d.q,d.r,Re+7129+Se*7)-.5)*148,Ge=ge+We,Ue=Z+Ve;if(!or(We,Ve,Ce)||b(Ge,Ue)<54||Le.some(Ae=>Math.hypot(Ae.ux-Ge,Ae.uy-Ue)<38))continue;let P=Ee.entry.tags??[],O=K(n,d.q,d.r,Re+7151),se=Math.max(.78,Ee.entry.scaleRange[0]??.78),te=Math.max(1.32,Ee.entry.scaleRange[1]??1.32),B=se+(te-se)*O,U=.86+K(n,d.q,d.r,Re+7163)*.28,ae=K(n,d.q,d.r,Re+7177)*Math.PI*2,re=P.includes("terrain_tint"),$=P.includes("rock_decal")||P.includes("woodland_decal")||P.includes("wetland_decal"),le=this.createPlacedSprite(Ee,d.q,d.r,Ge,Ue,B,x(Ge,Ue));le.width*=U,le.height/=Math.sqrt(U),le.rotationRad=ae,ee>0&&(re?(le.terrainTintRgb=ee,le.terrainTintMix=.96):$&&(le.terrainTintRgb=ee,le.terrainTintMix=.28)),k.push(le),ye.add(Ee.key),Le.push({ux:Ge,uy:Ue})}}return M.sort((d,g)=>(d.sortY??d.y)-(g.sortY??g.y)||d.x-g.x),{cq:e,cr:r,key:bt(e,r),originQ:o,originR:i,cells:a,sprites:M,decals:k,shorelines:u,riverRoutes:f}}};var Tt=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var Zn=Lr(Kt());var ft=32,Ko=32;function Zo(t){return t==="mountain"||t==="hills"?t:"flat"}function Kn(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function Qn(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Tt},r=Zn.default.createPointSampler(t.seed,e),o=t.halfExtent,i=t.fogPolicy??(()=>2),n=t.overrides,a=new Map,l=(s,u)=>{let h=`${s},${u}`,f=a.get(h);if(f)return a.delete(h),a.set(h,f),f;let m=s*ft,p=u*ft,b=r.traceRivers(m,p,ft,ft),_=[],A=new Set;for(let x=0;x<b.routes.length;x++){let M=b.routes[x];if(!M||M.length<2)continue;let X=M[0],w=M[M.length-1],y=`${X[0]},${X[1]}->${w[0]},${w[1]}:${M.length}`;A.has(y)||(A.add(y),_.push({id:y,hexes:M}))}let D={routes:_,edgesByKey:b.edgesByKey};for(a.set(h,D);a.size>Ko;){let x=a.keys().next().value;if(x===void 0)break;a.delete(x)}return D},c=({cq:s,cr:u,chunkSize:h})=>{let f=s*h,m=u*h,p=[];for(let b=0;b<h;b++){let _=m+b;if(o!==void 0&&Math.abs(_)>o)continue;let A=Math.floor(_/ft);for(let D=0;D<h;D++){let x=f+D;if(o!==void 0&&Math.abs(x)>o)continue;let M=Math.floor(x/ft),X=l(M,A),w=r.sampleCell(x,_),y=Fe(x,_),E=i(x,_),L=n?.get(y),T=L?.reliefClass??Zo(w.reliefClass),H=L?.forestDensity!==void 0?L.forestDensity:w.forestDensity>0?w.forestDensity:0,Q=L?.forestClass??(L?.forestDensity!==void 0?Kn(void 0,H):Kn(w.forestClass,H)),N=X.edgesByKey.get(y);p.push({q:x,r:_,terrainId:L?.terrainId??w.terrainId,reliefClass:T,hillProfile:L?.hillProfile!==void 0?L.hillProfile:T==="hills"?w.hillProfile??"rounded":null,hillStrength:L?.hillStrength!==void 0?L.hillStrength:T==="hills"?Math.max(.35,w.hillStrength||.72):0,forestClass:Q,forestDensity:H,fogState:L?.fogState??E,occupied:L?.occupied,riverEdges:L?.riverEdges!==void 0?L.riverEdges:N&&N.length>0?[...N]:void 0})}}return p};return c.getRiverRoutesForChunk=(s,u,h)=>{let f=s*h,m=f+h-1,p=u*h,b=p+h-1,_=Math.floor(f/ft),A=Math.floor(m/ft),D=Math.floor(p/ft),x=Math.floor(b/ft),M=[],X=new Set;for(let w=D;w<=x;w++)for(let y=_;y<=A;y++){let E=l(y,w);for(let L of E.routes){if(X.has(L.id))continue;let T=!1;for(let H=0;H<L.hexes.length;H++){let[Q,N]=L.hexes[H];if(Q>=f&&Q<=m&&N>=p&&N<=b){T=!0;break}}T&&(X.add(L.id),M.push(L))}}return M},c}var to=Lr(Kt());var Ne=[.24,.62,.96],fr=[.92,.28,.3],Qo=[.22,.78,.48],Jn=[.94,.72,.22],Jo=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function hr(t){return t.surfaceClass!=="land"}function wt(t){return!hr(t)&&t.reliefClass!=="mountain"}function Xt(t,e,r,o){let i=t.sampleCell(e,r);if(o==="harbor"){if(!hr(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let l=[];for(let[c,s]of Pe){let u=t.sampleCell(e+c,r+s);wt(u)&&l.push({q:e+c,r:r+s})}return{center:{q:e,r},buildingKind:o,valid:l.length>0,yieldPercent:100,bonusHexes:l,reason:l.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!wt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:i.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],a=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let l=-2;l<=2;l++)for(let c=-2;c<=2;c++){if(tt(0,0,c,l)>2)continue;let s=e+c,u=r+l,h=t.sampleCell(s,u);o==="farm"?wt(h)&&Jo.has(h.terrainId)&&(n.push({q:s,r:u}),a+=5):o==="lumber_camp"?wt(h)&&h.forestDensity>.08&&(n.push({q:s,r:u}),a+=5):o==="quarry"&&(h.reliefClass==="hills"||h.reliefClass==="mountain")&&(n.push({q:s,r:u}),a+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,a),bonusHexes:n}}function it(t,e,r,o){for(let i=0;i<=32;i++)for(let n=-i;n<=i;n++)for(let a=-i;a<=i;a++){if(tt(0,0,a,n)!==i)continue;let l=e+a,c=r+n,s=t.sampleCell(l,c);if(wt(s)&&(!o||o(s)))return{q:l,r:c}}return{q:e,r}}function ei(t,e,r){for(let o=0;o<=45;o++)for(let i=-o;i<=o;i++)for(let n=-o;n<=o;n++){if(tt(0,0,n,i)!==o)continue;let a=e+n,l=r+i,c=t.sampleCell(a,l);if(hr(c))for(let[s,u]of Pe){let h=t.sampleCell(a+s,l+u);if(wt(h))return{water:{q:a,r:l},land:{q:a+s,r:l+u}}}}return{water:{q:e,r},land:{q:e+1,r}}}function pt(t,e,r,o,i,n,a,l=!1){let c=[];for(let s=-i;s<=i;s++)for(let u=-i;u<=i;u++){if(tt(0,0,u,s)>i)continue;let h=o.q+u,f=o.r+s,m=Fe(h,f);if(r.has(m))continue;let p=t.sampleCell(h,f);!l&&!wt(p)||p.reliefClass!=="mountain"&&(r.add(m),e.push({q:h,r:f,ownerId:n,color:a}),c.push({q:h,r:f}))}return c}function Pt(t,e,r){let o=[],i=t.q,n=t.r,a=0;for(;(i!==e.q||n!==e.r)&&a++<40;){let l=0,c=1/0;for(let h=0;h<6;h++){let f=i+Pe[h][0],m=n+Pe[h][1],p=tt(f,m,e.q,e.r);p<c&&(c=p,l=h)}let s=i+Pe[l][0],u=n+Pe[l][1];o.push({q1:i,r1:n,q2:s,r2:u,tier:r}),i=s,n=u}return o}function tn(t,e,r=0,o="player"){let i=new Set(t.map(c=>Fe(c.q,c.r))),n=new Set,a=[],l=0;for(let c of t)for(let s=0;s<6;s++){let u=c.q+Pe[s][0],h=c.r+Pe[s][1];if(i.has(Fe(u,h)))continue;let f=Ft(c.q,c.r,u,h);n.has(f.key)||(n.add(f.key),l++,a.push({q1:f.q1,r1:f.r1,q2:f.q2,r2:f.r2,kind:e,isGate:r>0&&l%r===0,ownerId:o}))}return a}function eo(t,e,r){let o=[],i=t,n=e,a=0;for(let l=0;l<r;l++)if(o.push({q:i,r:n,dir:a}),l%2===0)a=(a+1)%6;else{let c=(a+1)%6;i+=Pe[c][0],n+=Pe[c][1],a=(a+5)%6}return o}function ro(t,e="vedras-welt-01",r){let o=r===void 0?Tt:r===null?void 0:r,i=to.default.createPointSampler(e,o);if(t==="fresh-start"){let w=it(i,0,0),y=[];return pt(i,y,new Set,w,1,"player",Ne),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:w,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:w.q,r:w.r,visR:3,expR:5}],scene:{territory:y,buildings:[{id:"cap-1",q:w.q,r:w.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:Ne}],units:[{id:"scout-1",q:w.q+1,r:w.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:Ne,marchPath:[{q:w.q+1,r:w.r},{q:w.q+2,r:w.r},{q:w.q+3,r:w.r-1}]}],sites:[{id:"site-1",q:w.q-2,r:w.r+1,family:"fauna",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let w=it(i,108,-70),y=it(i,w.q+7,w.r-1),E=[],L=new Set,T=pt(i,E,L,w,3,"player",Ne);pt(i,E,L,y,3,"enemy",fr);let H=it(i,w.q+2,w.r),Q=tn(T.filter(ue=>tt(ue.q,ue.r,w.q,w.r)<=1),"stone",3,"player");Q.length>0&&(Q[0].breached=!0);let N=[...Pt(w,H,"stone"),...Pt(H,y,"packed")],Y={q:H.q+2,r:H.r},C=[{id:"blue-cap",q:w.q,r:w.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:Ne},{id:"blue-fort",q:H.q,r:H.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:Ne,rangeRadius:2},{id:"red-cap",q:y.q,r:y.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:fr}],oe=[{id:"u-blue-def",q:H.q,r:H.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:Ne,marchPath:[{q:w.q+1,r:w.r+1},{q:H.q,r:H.r+1}]},{id:"u-red-siege",q:Y.q,r:Y.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:fr,inCombat:!0,marchPath:[Y,{q:H.q+1,r:H.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((w.q+y.q)/2),r:Math.round((w.r+y.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:w.q,r:w.r,visR:6,expR:12},{q:H.q,r:H.r,visR:5,expR:10}],scene:{territory:E,rivers:eo(w.q-2,w.r-3,7),roads:N,walls:Q,buildings:C,units:oe}}}if(t==="coastal-harbors"){let w=ei(i,2,-2),y=[],E=new Set;pt(i,y,E,w.land,2,"player",Ne,!1),pt(i,y,E,w.water,2,"player",Ne,!0);let L={q:w.water.q+1,r:w.water.r};for(let[Q,N]of Pe){let Y=i.sampleCell(w.water.q+Q,w.water.r+N);if(hr(Y)){L={q:w.water.q+Q,r:w.water.r+N};break}}let T=[{id:"coastal-cap",q:w.land.q,r:w.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:Ne},{id:"harbor-1",q:w.water.q,r:w.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:Ne}],H=[{id:"boat-1",q:L.q,r:L.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:Ne,marchPath:[w.water,L]},{id:"scout-sea",q:w.water.q,r:w.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:Ne}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:w.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:w.water.q,r:w.water.r,visR:6,expR:11}],scene:{territory:y,roads:Pt(w.land,{q:w.land.q-2,r:w.land.r+1},"packed"),buildings:T,units:H}}}if(t==="strategic-empires"){let w=[{id:"player",name:"Krone Vedra",color:Ne,q:0,r:0},{id:"crimson",name:"Blutmark",color:fr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:Qo,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:Jn,q:8,r:10}],y=[],E=new Set,L=[],T=[];for(let H of w){let Q=it(i,H.q,H.r);pt(i,y,E,Q,5,H.id,H.color),L.push({id:`emp-${H.id}`,q:Q.q,r:Q.r,kind:"capital",label:H.name,level:12,ownerId:H.id,factionColor:H.color}),T.push({id:`army-${H.id}`,q:Q.q+2,r:Q.r-1,kind:"army",label:`Heer ${H.name}`,strength:520,ownerId:H.id,factionColor:H.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:w.map(H=>({q:H.q,r:H.r,visR:9,expR:15})),scene:{territory:y,buildings:L,units:T}}}let n=it(i,110,-70),a=it(i,n.q+4,n.r-1),l=it(i,n.q-3,n.r+3),c=[],s=new Set,u=pt(i,c,s,n,2,"player",Ne);pt(i,c,s,a,2,"player",Ne),pt(i,c,s,l,2,"player",Ne);let h=it(i,n.q+1,n.r),f=it(i,n.q-1,n.r,w=>w.forestDensity>.1),m=it(i,n.q,n.r+2),p=it(i,a.q+1,a.r),b=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:Ne},{id:"town-2",q:a.q,r:a.r,kind:"settlement",centerStage:"city",label:"Ostfurt",level:6,ownerId:"player",factionColor:Ne},{id:"town-3",q:l.q,r:l.r,kind:"settlement",centerStage:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:Ne,constructionProgress:.62},{id:"farm-1",q:h.q,r:h.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:Ne,yieldPercent:Xt(i,h.q,h.r,"farm").yieldPercent},{id:"lumber-1",q:f.q,r:f.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:Ne,yieldPercent:Xt(i,f.q,f.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:m.q,r:m.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:Ne,yieldPercent:Xt(i,m.q,m.r,"quarry").yieldPercent},{id:"fort-1",q:p.q,r:p.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:Ne,rangeRadius:2}],_=u.filter(w=>tt(w.q,w.r,n.q,n.r)===0),A=tn(_,"stone",2,"player"),D=tn([l],"palisade",3,"player"),x=[...Pt(n,a,"stone"),...Pt(n,l,"packed"),...Pt(n,m,"trail")],M=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:Jn,marchPath:[n,{q:n.q+2,r:n.r-1},a]},{id:"army-1",q:a.q,r:a.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:Ne}],X=[{id:"site-mine",q:n.q+2,r:n.r+2,family:"forgotten_mine",label:"Vergessene Mine"},{id:"site-obelisk",q:n.q-2,r:n.r-1,family:"obelisk",label:"Alter Obelisk"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:a.q,r:a.r,visR:4,expR:8},{q:l.q,r:l.r,visR:4,expR:8}],scene:{territory:c,rivers:eo(n.q-2,n.r-2,8),roads:x,walls:[...A,...D],buildings:b,units:M,sites:X}}}var no=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function oo(t,e,r,o,i){if(o==="all-visible"||i?.has(Fe(e,r)))return 2;let n=0;for(let a of t.visibleCenters){let l=tt(a.q,a.r,e,r);if(l<=a.visR)return 2;l<=a.expR&&n<1&&(n=1)}return n}function ti(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function mr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function rn(t,e,r,o,i){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&i>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,i)),n}async function nn(t,e,r="auto",o){let i=e.replace(/\/+$/,""),n=await fetch(`${i}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${i}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let a=await n.json();if(a.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${a.schema}`);let l=ti(t,r),c=l==="mobile"?Math.min(256,a.terrain.textureSize):a.terrain.textureSize,s=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),u=s?t.getParameter(s.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,h=a.terrain.layers.length+a.nature.pages.length+a.shadows.pages.length+a.infrastructure.pages.length+(a.clouds.files.length>0?1:0),f=0,m=C=>{f+=1,o?.(f,h,C)},p=t.createTexture();if(!p)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,p);let b=Math.max(1,a.terrain.layers.length),_=Math.floor(Math.log2(c))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,_,t.RGBA8,c,c,b),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let A=c!==a.terrain.textureSize?{width:c,height:c}:void 0,D=a.terrain.layers;for(let C=0;C<D.length;C+=8){let oe=D.slice(C,C+8),ue=await Promise.all(oe.map(V=>mr(`${i}/${V.file}`,A)));t.bindTexture(t.TEXTURE_2D_ARRAY,p);for(let V=0;V<oe.length;V++){let v=ue[V];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,oe[V].layer,c,c,1,t.RGBA,t.UNSIGNED_BYTE,v),v.close(),m(`Terrain ${oe[V].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,p),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),s&&u>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,s.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,u));let x=l==="mobile"?.5:1,M=async(C,oe)=>(await Promise.all(C.map(V=>mr(`${i}/${V.file}`,x<1?{width:Math.max(256,Math.round(V.width*x)),height:Math.max(256,Math.round(V.height*x))}:void 0)))).map((V,v)=>{let W=rn(t,V,t.CLAMP_TO_EDGE,s,u);return V.close(),m(`${oe} ${v+1}/${C.length}`),W}),[X,w,y]=await Promise.all([M(a.nature.pages,"Natur-Atlas"),M(a.shadows.pages,"Schatten-Atlas"),M(a.infrastructure.pages,"Infra-Atlas")]),E=null,L=null;if(a.clouds.files.length>0){let C=a.clouds.files.find(v=>v.id.startsWith("cloud_base"))??a.clouds.files[0],oe=a.clouds.files.find(v=>v.id.startsWith("cloud_edge")),[ue,V]=await Promise.all([mr(`${i}/${C.file}`),oe?mr(`${i}/${oe.file}`):Promise.resolve(null)]);E=rn(t,ue,t.REPEAT,s,u),ue.close(),V&&(L=rn(t,V,t.REPEAT,s,u),V.close()),m("Nebel-Wolken")}let H=a.terrain.byType.forest_floor?.layers?.[0]??0,N=(a.terrain.byType.coastal_water??a.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:a,vramTier:l,terrainArray:p,terrainLayerSize:c,forestFloorLayer:H,coastalWaterLayer:N,naturePages:X,shadowPages:w,infraPages:y,cloudTexture:E,cloudEdgeTexture:L,dispose:()=>{t.deleteTexture(p);for(let C of X)t.deleteTexture(C);for(let C of w)t.deleteTexture(C);for(let C of y)t.deleteTexture(C);E&&t.deleteTexture(E),L&&t.deleteTexture(L)}}}var ri=316/384;function io(t,e){return{x:256*(t+e*.5),y:Ye*e}}function ni(t,e,r,o){let i=e.x-t.x,n=e.y-t.y,a=o.x-r.x,l=o.y-r.y,c=i*l-n*a;if(Math.abs(c)<1e-9)return null;let s=r.x-t.x,u=r.y-t.y,h=(s*l-u*a)/c,f=(s*n-u*i)/c;return h<0||h>1||f<0||f>1?null:{x:t.x+h*i,y:t.y+h*n}}function ao(t){let{roads:e,routes:r=[],manualRivers:o=[],lookupFog:i,isWaterHex:n}=t;if(e.length===0||r.length===0&&o.length===0)return[];let a=[];for(let c of r){let s=Ot(c,34,n);s&&s.points.length>=2&&a.push(s)}if(o.length>0){let c=Qr(o,34);for(let s of c)s.points.length>=2&&a.push(s)}if(a.length===0)return[];let l=[];for(let c of e){let s=ot(c.q1,c.r1,c.q2,c.r2);if(s<0)continue;let u=i(c.q1,c.r1),h=i(c.q2,c.r2),f=u>=h?u:h;if(f===0)continue;let m=io(c.q1,c.r1),p=io(c.q2,c.r2),b=p.x-m.x,_=p.y-m.y,A=Math.hypot(b,_)||1,D=[];for(let M of a){let X=M.points,w=Math.max(18,M.width*.72);for(let y=1;y<X.length;y++){let E=X[y-1],L=X[y],T=ni(m,p,E,L);if(!T)continue;let H=L.x-E.x,Q=L.y-E.y;Math.abs(b*Q-_*H)/(A*(Math.hypot(H,Q)||1))<=.16||D.some(Y=>Math.hypot(Y.x-T.x,Y.y-T.y)<w)||l.some(Y=>Math.hypot(Y.ux-T.x,Y.uy-T.y)<w)||D.push({x:T.x,y:T.y,width:M.width})}}let x=c.tier==="stone"?"stone":"timber";for(let M of D)l.push({ux:M.x,uy:M.y,dir:s,material:x,tier:c.tier,length:Math.max(96,M.width+64),fogState:f})}return l}function so(t){let{manifest:e,crossings:r,sampleReliefHeight:o}=t;if(r.length===0)return[];let i=e.infrastructure.sprites,n=[];for(let a of r){let l=String(a.dir).padStart(2,"0"),c=`bridges/${a.material}/bridge_dir_${l}`,s=`bridges/${a.material==="stone"?"timber":"stone"}/bridge_dir_${l}`,u=i[c]??i[s];if(!u)continue;let h=a.length/ri,f=a.uy*De,m=o?o(a.ux,a.uy)*De:0,p=f-m,b=e.shadows.sprites[`bridge_shadow:axis${a.dir%3}`],_=100,A=b?{shadowPage:b.page,shadowU0:b.uv[0],shadowV0:b.uv[1],shadowU1:b.uv[2],shadowV1:b.uv[3],shadowRelLeft:b.boundsInSpriteWidth[0]*_,shadowRelTop:b.boundsInSpriteWidth[1]*_,shadowWidth:(b.boundsInSpriteWidth[2]-b.boundsInSpriteWidth[0])*_,shadowHeight:(b.boundsInSpriteWidth[3]-b.boundsInSpriteWidth[1])*_}:{};n.push({x:a.ux,y:p,relLeft:-h*.5,relTop:-h*.5,width:h,height:h,page:u.page,u0:u.uv[0],v0:u.uv[1],u1:u.uv[2],v1:u.uv[3],sortY:f-26,fogState:a.fogState,...A})}return n}var oi={"buildings/centers/outpost":156,"buildings/centers/settlement":170,"buildings/centers/city":182,"buildings/centers/metropolis":190,"buildings/centers/capital_t1":192,"buildings/tier1/farm":174,"buildings/tier1/lumber_camp":164,"buildings/tier1/quarry":172,"buildings/tier1/iron_mine":168,"buildings/tier1/fortress":182,"buildings/tier1/watchtower":100,"buildings/tier1/harbor":184},ii={"buildings/centers/outpost":[.5,.72],"buildings/centers/settlement":[.5,.72],"buildings/centers/city":[.5,.71],"buildings/centers/metropolis":[.5,.72],"buildings/centers/capital_t1":[.5,.74],"buildings/tier1/farm":[.5,.7],"buildings/tier1/lumber_camp":[.5,.72],"buildings/tier1/quarry":[.5,.68],"buildings/tier1/iron_mine":[.5,.72],"buildings/tier1/fortress":[.5,.74],"buildings/tier1/watchtower":[.5,.87],"buildings/tier1/harbor":[.5,.7]};function ai(t,e,r,o){let i=t.infrastructure.sprites,n=Math.max(1,Math.min(4,Math.round(r||1))),a=[];if(e==="capital")for(let l=n;l>=1;l--)a.push(`buildings/centers/capital_t${l}`);else if(e==="settlement")o&&a.push(`buildings/centers/${o}`),n>=4&&a.push("buildings/centers/metropolis"),n>=3&&a.push("buildings/centers/city"),n>=2&&a.push("buildings/centers/settlement"),a.push("buildings/centers/outpost"),a.push("buildings/centers/settlement");else for(let l=n;l>=1;l--)a.push(`buildings/tier${l}/${e}`);for(let l of a)if(i[l])return l;return null}function lo(t){let{manifest:e,buildings:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],a=new Set;if(!r.length)return{sprites:n,coveredBuildingIds:a};let l=e.infrastructure.sprites;for(let c of r){let s=o(c.q,c.r);if(s===0)continue;let u=ai(e,c.kind,c.level,c.centerStage);if(!u)continue;let h=l[u];if(!h)continue;a.add(c.id);let f=Ie(c.q,c.r),m=f.x,p=f.y/De,b=i?i(m,p)*De:0,_=f.y-b,A=oi[u]??200,[D,x]=h.sourceSize,M=D>0?x/D:1,X=A*M,[w,y]=ii[u]??[.5,.72],E=e.shadows.sprites[`building_shadow:${u}`],L=E?{shadowPage:E.page,shadowU0:E.uv[0],shadowV0:E.uv[1],shadowU1:E.uv[2],shadowV1:E.uv[3],shadowRelLeft:E.boundsInSpriteWidth[0]*A,shadowRelTop:E.boundsInSpriteWidth[1]*A,shadowWidth:(E.boundsInSpriteWidth[2]-E.boundsInSpriteWidth[0])*A,shadowHeight:(E.boundsInSpriteWidth[3]-E.boundsInSpriteWidth[1])*A}:{};n.push({x:m,y:_,relLeft:-A*w,relTop:-X*y,width:A,height:X,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:f.y+8,fogState:s,...L})}return n.sort((c,s)=>c.sortY-s.sortY||c.x-s.x),{sprites:n,coveredBuildingIds:a}}var pr=.08,gr=2,co=.15,on=.21;function an(t){return t>=on?0:t<=co?1:(on-t)/(on-co)}function uo(t){return an(t)>=.5?"strategic":"detail"}function br(t,e,r){return t<e?e:t>r?r:t}var vr=class{constructor(e,r,o,i){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],i=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,a=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,a,this.pinchStartZoom*(i/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,i=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,i),this.state.x-=o/this.state.zoom,this.state.y-=i/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=At(r.x,r.y,this.state),i=Je(o.x,o.y),n=`${i.q},${i.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(i))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,i=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,a]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=a,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=At(i.x,i.y,this.state),a=Je(n.x,n.y);this.callbacks.onHexClick?.(a),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:a})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=i;let n=Ie(r.q,r.r),a=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:br(o,pr,gr),viewportWidth:Math.max(1,a.width||e.clientWidth||1280),viewportHeight:Math.max(1,a.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),i=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*i)),a=Math.max(1,Math.round(o*i)),l=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==i||this.canvas.width!==n||this.canvas.height!==a;return l&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=i,this.canvas.width=n,this.canvas.height=a),l}centerOnHex(e,r,o){let i=Ie(e,r);this.state.x=i.x,this.state.y=i.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=br(o,pr,gr)),this.callbacks.onChange()}setZoom(e){this.state.zoom=br(e,pr,gr),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let i=br(o,pr,gr);if(Math.abs(i-this.state.zoom)<1e-5)return;let n=At(e,r,this.state);this.state.zoom=i;let a=At(e,r,this.state);this.state.x+=n.x-a.x,this.state.y+=n.y-a.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var fo={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function yr(t,e,r){return t<e?e:t>r?r:t}function si(t,e,r,o,i,n){let a=i-r,l=n-o,c=a*a+l*l,s=c>1e-6?yr(((t-r)*a+(e-o)*l)/c,0,1):0,u=r+s*a,h=o+s*l,f=t-u,m=e-h;return f*f+m*m}function sn(t){if(!t)return fo;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let i of t.buildings){e.add(Fe(i.q,i.r));let n=Ie(i.q,i.r),a=i.kind==="capital"||i.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:a,minX:n.x-a-64,maxX:n.x+a+64,minY:n.y-a-64,maxY:n.y+a+64})}if(t.sites&&t.sites.length>0)for(let i of t.sites){let n=Ie(i.q,i.r),a=58;o.push({cx:n.x,cy:n.y,radius:a,minX:n.x-a-56,maxX:n.x+a+56,minY:n.y-a-56,maxY:n.y+a+56})}if(t.walls&&t.walls.length>0)for(let i of t.walls){let n=ot(i.q1,i.r1,i.q2,i.r2);if(n<0)continue;let{a,b:l}=lt(i.q1,i.r1,n),c=i.isGate?i.kind==="stone"?24:20:i.kind==="stone"?18:14,s=i.kind==="stone"?26:16,u=s+64;r.push({ax:a.x,ay:a.y,bx:l.x,by:l.y,halfWidth:c,pierRadius:s,minX:Math.min(a.x,l.x)-u,maxX:Math.max(a.x,l.x)+u,minY:Math.min(a.y,l.y)-u,maxY:Math.max(a.y,l.y)+u,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let i of t.roads){let n=Ie(i.q1,i.r1),a=Ie(i.q2,i.r2),l=i.tier==="stone"?30:i.tier==="packed"?24:18,c=l+56;r.push({ax:n.x,ay:n.y,bx:a.x,by:a.y,halfWidth:l,pierRadius:l,minX:Math.min(n.x,a.x)-c,maxX:Math.max(n.x,a.x)+c,minY:Math.min(n.y,a.y)-c,maxY:Math.max(n.y,a.y)+c,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let i of t.rivers){let{a:n,b:a}=lt(i.q,i.r,i.dir),l=22,c=l+48;r.push({ax:n.x,ay:n.y,bx:a.x,by:a.y,halfWidth:l,pierRadius:20,minX:Math.min(n.x,a.x)-c,maxX:Math.max(n.x,a.x)+c,minY:Math.min(n.y,a.y)-c,maxY:Math.max(n.y,a.y)+c,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?fo:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function ln(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(Fe(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,i=yr(t.width*.42,12,48),n=yr(t.width*.34,10,34),a=yr(t.width*.28,8,26),l=e.discs;for(let s=0;s<l.length;s++){let u=l[s];if(r<u.minX||r>u.maxX||o<u.minY||o>u.maxY)continue;let h=r-u.cx,f=o-u.cy,m=u.radius+n*.6;if(h*h+f*f<=m*m)return!0}let c=e.segments;for(let s=0;s<c.length;s++){let u=c[s];if(r<u.minX||r>u.maxX||o<u.minY||o>u.maxY)continue;let h=u.kind==="wall"?i:u.kind==="road"?n:a,f=u.halfWidth+h+(u.kind==="wall"?8:4);if(si(r,o,u.ax,u.ay,u.bx,u.by)<=f*f)return!0;if(u.kind==="wall"){let m=u.pierRadius+i+6,p=m*m,b=r-u.ax,_=o-u.ay;if(b*b+_*_<=p)return!0;let A=r-u.bx,D=o-u.by;if(A*A+D*D<=p)return!0}}return!1}function li(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function xr(t,e,r,o,i,n,a=.86){t.font=`600 ${n}px system-ui, -apple-system, sans-serif`;let l=t.measureText(o),c=Math.max(6,n*.55),s=Math.max(3,n*.3),u=l.width+c*2,h=n+s*2,f=e-u*.5,m=r-h*.5,p=Math.min(8,h*.45);t.beginPath(),t.roundRect(f,m,u,h,p),t.fillStyle=`rgba(12, 17, 23, ${a})`,t.fill(),t.lineWidth=1.4,t.strokeStyle=li(i,.9),t.stroke(),t.fillStyle="#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5)}var cn=new WeakSet;function ho(t){let{canvas:e,cam:r,scene:o,lookupFog:i,strategicBlend:n,timeSec:a}=t,l=Math.max(1,Math.round(r.viewportWidth*r.dpr)),c=Math.max(1,Math.round(r.viewportHeight*r.dpr)),s=!!(o&&(o.buildings&&o.buildings.length>0||o.sites&&o.sites.length>0||o.units&&o.units.length>0));if(!o||!s){(cn.has(e)||e.width!==l||e.height!==c)&&(e.width=l,e.height=c,cn.delete(e));return}(e.width!==l||e.height!==c)&&(e.width=l,e.height=c);let u=e.getContext("2d");if(!u)return;u.setTransform(r.dpr,0,0,r.dpr,0,0),u.clearRect(0,0,r.viewportWidth,r.viewportHeight),cn.add(e);let h=n>=.5;if(o.buildings)for(let f of o.buildings){let m=i(f.q,f.r);if(m===0)continue;let p=f.kind==="capital"||f.kind==="settlement",b=p||f.kind==="fortress"||f.kind==="harbor";if(h&&!b)continue;let _=Ie(f.q,f.r),A=kt(_.x,_.y,r);if(A.x<-120||A.x>r.viewportWidth+120||A.y<-80||A.y>r.viewportHeight+80)continue;let D=typeof f.yieldPercent=="number"&&!h?` \xB7 ${f.yieldPercent}%`:"",x=p?`\u2605 ${f.label} (R${f.level})`:`${f.label} L${f.level}${D}`,M=h?-18:Math.max(30,(p?56:50)*r.zoom);if(xr(u,A.x,A.y+M,x,f.factionColor,p?h?12:12.5:10.5,m===1?.65:.88),typeof f.constructionProgress=="number"&&f.constructionProgress>0&&f.constructionProgress<1&&!h){let y=A.x-27,E=A.y+M+13;u.fillStyle="rgba(10, 15, 22, 0.85)",u.fillRect(y,E,54,5),u.fillStyle="#f59e0b",u.fillRect(y+1,E+1,52*f.constructionProgress,3)}}if(o.sites&&!h&&r.zoom>=.45)for(let f of o.sites){if(i(f.q,f.r)===0)continue;let m=Ie(f.q,f.r),p=kt(m.x,m.y,r);p.x<-80||p.x>r.viewportWidth+80||p.y<-50||p.y>r.viewportHeight+50||xr(u,p.x,p.y+20,f.label,[.85,.68,.35],10,.78)}if(o.units)for(let f of o.units){if(i(f.q,f.r)<2)continue;let m=Ie(f.q,f.r);if(f.marchPath&&f.marchPath.length>=2){let A=Ie(f.marchPath[0].q,f.marchPath[0].r),D=Ie(f.marchPath[1].q,f.marchPath[1].r),x=a*.14%1;m={x:A.x+(D.x-A.x)*x,y:A.y+(D.y-A.y)*x}}let p=kt(m.x,m.y,r);if(p.x<-100||p.x>r.viewportWidth+100||p.y<-60||p.y>r.viewportHeight+60)continue;let b=f.kind==="siege_army"?"\u2694":f.kind==="army"?"\u{1F6E1}":f.kind==="scout"?"\u{1F441}":f.kind==="boat"?"\u26F5":"\u2696",_=typeof f.strength=="number"?` ${f.strength}${f.rams?` + ${f.rams}R`:""}`:"";xr(u,p.x,p.y-Math.max(20,34*r.zoom),`${b} ${f.label}${_}`,f.factionColor,h?10.5:11,.92)}if(o.buildPreview){let f=o.buildPreview,m=Ie(f.center.q,f.center.r),p=kt(m.x,m.y,r),b=f.yieldPercent-100,_=f.valid?`${f.buildingKind} \xB7 Ertrag ${f.yieldPercent}% (+${b}% R2)`:`Nicht baubar: ${f.reason??"ung\xFCltig"}`;xr(u,p.x,p.y-34,_,f.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var wr=65536,_r=12,ci={trail:{tierIndex:0,width:19,shoulder:32,outer:44,rough:.16,opacity:.78},packed:{tierIndex:1,width:28,shoulder:38,outer:48,rough:.075,opacity:.87},stone:{tierIndex:2,width:34,shoulder:43,outer:52,rough:.028,opacity:.96}},ui=["trail","packed","stone"],di=`#version 300 es
precision highp float;

layout(location = 0) in vec4 a_pos;    // xy = projected world pos, zw = local offset (u, v)
layout(location = 1) in vec4 a_widths; // x = coreHalf, y = shoulderHalf, z = outerHalf, w = edgeT (-1 for nodes)
layout(location = 2) in vec4 a_extra;  // x = fogDim, y = signedSide, z = alongWU, w = unused

uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;

out vec2 v_local;
out vec4 v_widths;
out vec3 v_extra;

void main() {
  vec2 screenOffset = (a_pos.xy - u_camCenter) * u_zoom;
  vec2 ndc = vec2(
    screenOffset.x / (u_viewportSize.x * 0.5),
    -screenOffset.y / (u_viewportSize.y * 0.5)
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_local = a_pos.zw;
  v_widths = a_widths;
  v_extra = a_extra.xyz;
}
`,fi=`#version 300 es
precision highp float;

in vec2 v_local;
in vec4 v_widths;
in vec3 v_extra;

uniform float u_tier;

out vec4 fragColor;

void main() {
  float coreHalf = v_widths.x;
  float shoulderHalf = v_widths.y;
  float outerHalf = v_widths.z;
  float edgeT = v_widths.w;
  float fogDim = v_extra.x;
  float signedSide = v_extra.y;

  float d = length(v_local);
  if (d > outerHalf) discard;

  float outerCov = 1.0 - smoothstep(shoulderHalf * 0.82, outerHalf, d);
  float shoulderCov = 1.0 - smoothstep(coreHalf * 0.88, shoulderHalf, d);
  float coreCov = 1.0 - smoothstep(max(1.0, coreHalf - 2.6), coreHalf + 1.8, d);

  // Smooth fade at hex centers so wheel ruts / kerbs dissolve naturally into multi-way junctions (roads.js:191)
  float edgeMask = edgeT >= 0.0
    ? smoothstep(0.06, 0.19, edgeT) * smoothstep(0.06, 0.19, 1.0 - edgeT)
    : 0.0;

  float detailFeat = 0.0;
  if (u_tier < 0.5) {
    // Trail: single subtle asymmetric worn footpath groove (roads.js:185)
    float rutOffset = 0.22 * coreHalf;
    float rDist = abs(signedSide - rutOffset);
    detailFeat = exp(-(rDist * rDist) / 9.0) * edgeMask * coreCov;
  } else if (u_tier < 1.5) {
    // Packed earth road: twin parallel carriage wheel ruts (roads.js:185: +/-0.24 * width)
    float rutOffset = 0.48 * coreHalf;
    float dL = abs(signedSide + rutOffset);
    float dR = abs(signedSide - rutOffset);
    float rL = exp(-(dL * dL) / 8.5);
    float rR = exp(-(dR * dR) / 8.5);
    detailFeat = max(rL, rR) * edgeMask * coreCov;
  } else {
    // Stone road: dressed kerb border along both flanks of the paved strip
    float kerbDist = abs(abs(signedSide) - (coreHalf - 2.3));
    detailFeat = (1.0 - smoothstep(1.2, 3.4, kerbDist)) * edgeMask * coreCov;
  }

  float vergeMask = clamp(max(outerCov * 0.36, shoulderCov * 0.78), 0.0, 1.0);
  float hasRoad = step(0.004, max(vergeMask, coreCov));
  fragColor = vec4(vergeMask, clamp(coreCov, 0.0, 1.0), clamp(detailFeat, 0.0, 1.0), fogDim * hasRoad);
}
`,hi=`#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(pos, 0.0, 1.0);
  v_uv = pos * 0.5 + 0.5;
}
`,mi=`#version 300 es
precision highp float;

in vec2 v_uv;

uniform sampler2D u_roadMaskTex;
uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;
uniform float u_tier;
uniform float u_opacity;
uniform float u_fade;

out vec4 fragColor;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// World-anchored medieval Voronoi cobblestone masonry (zero stretch across junctions/curves!)
void voronoiCobble(vec2 p, out float edgeDist, out float cellHash, out vec2 toCenter) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  float md = 8.0;
  float md2 = 8.0;
  vec2 bestVec = vec2(0.0);
  vec2 bestCell = n;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 cell = n + g;
      vec2 o = 0.16 + 0.68 * hash22(cell);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) {
        md2 = md;
        md = d;
        bestVec = r;
        bestCell = cell;
      } else if (d < md2) {
        md2 = d;
      }
    }
  }
  edgeDist = sqrt(md2) - sqrt(md);
  cellHash = hash21(bestCell + vec2(19.7, 41.3));
  toCenter = bestVec;
}

void main() {
  vec4 m = texture(u_roadMaskTex, v_uv);
  float verge = m.r;
  float core = m.g;
  float feat = m.b;
  float fogDim = m.a;
  if (verge + core < 0.005 || fogDim < 0.01) discard;

  // Reconstruct world-space coordinate so soil grains & cobblestones stay 100% locked while panning/zooming.
  vec2 ndc = v_uv * 2.0 - 1.0;
  vec2 wp = u_camCenter + vec2(ndc.x, -ndc.y) * (u_viewportSize * 0.5) / max(u_zoom, 0.05);
  vec2 uw = vec2(wp.x, wp.y / 0.85);

  float fine = vnoise(uw * 0.42);
  float med = vnoise(uw * 0.13 + vec2(17.3, 9.1));
  float macro = vnoise(uw * 0.036 + vec2(43.1, 29.7));
  float vein = sin(uw.x * 0.19 + uw.y * 0.065) * cos(uw.y * 0.15 - uw.x * 0.042);

  // Subtle pebbles / earth flecks matching roads.js:206-214
  float pebNoise = vnoise(uw * 0.62 + vec2(71.4, 13.8));
  float darkSpeck = smoothstep(0.76, 0.90, vnoise(uw * 0.55 + vec2(5.2, 88.6)));
  float lightSpeck = smoothstep(0.78, 0.92, pebNoise);

  vec3 col;
  float alpha;

  if (u_tier < 0.5) {
    // \u2500\u2500 Tier 0: Trail (Trampelpfad \xB7 eingelaufene Erde) \u2500\u2500
    vec3 edgeCol = vec3(88.0, 70.0, 44.0) / 255.0;
    vec3 bankCol = vec3(163.0, 136.0, 92.0) / 255.0;
    vec3 coreCol = vec3(156.0, 133.0, 93.0) / 255.0;
    float delta = (fine - 0.5) * 0.11 + (med - 0.5) * 0.14 + (macro - 0.5) * 0.12 + vein * 0.024;
    coreCol += vec3(delta, delta * 0.91, delta * 0.78);
    // Subtle dark/light soil grains & pebbles
    coreCol = mix(coreCol, vec3(0.32, 0.28, 0.20), darkSpeck * 0.24);
    coreCol = mix(coreCol, vec3(0.90, 0.84, 0.68), lightSpeck * 0.22);
    // Single worn footpath groove
    coreCol = mix(coreCol, coreCol * 0.78, feat * 0.42);

    // Porous organic margin so meadow grass / forest moss naturally peeks through
    float porosity = 0.66 + 0.34 * (0.5 * fine + 0.5 * med);
    float edgeBreakup = smoothstep(0.18, 0.82, core + (med - 0.5) * 0.32);
    float coreA = edgeBreakup * u_opacity * porosity;
    float bankA = verge * 0.34 * (0.78 + 0.22 * macro);
    vec3 vergeRgb = mix(edgeCol, bankCol, smoothstep(0.15, 0.72, verge));
    alpha = clamp(max(bankA, coreA), 0.0, 0.92);
    col = mix(vergeRgb, coreCol, clamp(coreA / max(alpha, 0.001), 0.0, 1.0));
  } else if (u_tier < 1.5) {
    // \u2500\u2500 Tier 1: Packed Road (Befestigter Erdweg \xB7 parallele Fahrspuren) \u2500\u2500
    vec3 edgeCol = vec3(84.0, 68.0, 47.0) / 255.0;
    vec3 bankCol = vec3(148.0, 125.0, 90.0) / 255.0;
    vec3 coreCol = vec3(168.0, 148.0, 114.0) / 255.0;
    float delta = (fine - 0.5) * 0.10 + (med - 0.5) * 0.13 + (macro - 0.5) * 0.10 + vein * 0.022;
    coreCol += vec3(delta, delta * 0.91, delta * 0.79);
    coreCol = mix(coreCol, vec3(0.35, 0.30, 0.22), darkSpeck * 0.28);
    coreCol = mix(coreCol, vec3(0.92, 0.86, 0.71), lightSpeck * 0.28);

    // Twin indented carriage wheel ruts + subtle sunlit raised center strip!
    float rutShade = feat * 0.52;
    float crestSun = smoothstep(0.65, 0.95, core) * (1.0 - feat) * 0.07;
    coreCol = coreCol * (1.0 - rutShade * 0.34) + vec3(0.14, 0.12, 0.08) * crestSun;

    float porosity = 0.80 + 0.20 * (0.5 * fine + 0.5 * med);
    float edgeBreakup = smoothstep(0.12, 0.78, core + (med - 0.5) * 0.18);
    float coreA = edgeBreakup * u_opacity * porosity;
    float bankA = verge * 0.44 * (0.82 + 0.18 * macro);
    vec3 vergeRgb = mix(edgeCol, bankCol, smoothstep(0.14, 0.72, verge));
    alpha = clamp(max(bankA, coreA), 0.0, 0.95);
    col = mix(vergeRgb, coreCol, clamp(coreA / max(alpha, 0.001), 0.0, 1.0));
  } else {
    // \u2500\u2500 Tier 2: Stone Road (Steinstra\xDFe \xB7 mittelalterliches Kopfsteinpflaster) \u2500\u2500
    vec3 edgeCol = vec3(74.0, 70.0, 58.0) / 255.0;
    vec3 bankCol = vec3(132.0, 125.0, 104.0) / 255.0;

    float edgeDist;
    float cellHash;
    vec2 toCenter;
    // Scale ~0.155 -> ~6.5 WU cobbles (~5 stones across the 34 WU stone road!)
    voronoiCobble(uw * 0.155, edgeDist, cellHash, toCenter);

    // Individual weathered medieval limestone / granite / warm cobble stone tints
    vec3 stoneCool = vec3(144.0, 143.0, 134.0) / 255.0;
    vec3 stoneWarm = vec3(168.0, 159.0, 140.0) / 255.0;
    vec3 stonePale = vec3(178.0, 173.0, 158.0) / 255.0;
    vec3 stoneCol = mix(stoneCool, stoneWarm, cellHash);
    if (cellHash > 0.72) {
      stoneCol = mix(stoneCol, stonePale, (cellHash - 0.72) * 2.4);
    }
    stoneCol += vec3((fine - 0.5) * 0.07 + (macro - 0.5) * 0.09);

    // 142\xB0 right-side sun bevel shading on each cobble stone crown
    vec2 sunDir = normalize(vec2(0.79, -0.61));
    float bevel = dot(normalize(toCenter + vec2(1e-4)), -sunDir);
    stoneCol *= 1.0 + bevel * 0.14;

    // Dark recessed earthy-mossy mortar seams between cobblestones
    float mortar = 1.0 - smoothstep(0.055, 0.155, edgeDist);
    vec3 mortarCol = mix(vec3(0.28, 0.27, 0.23), vec3(0.30, 0.34, 0.24), macro * 0.55);
    vec3 coreCol = mix(stoneCol, mortarCol, mortar * 0.76);

    // Dressed lighter kerb edge blocks along the stone road flanks
    coreCol = mix(coreCol, stonePale * (1.0 + (fine - 0.5) * 0.08), feat * 0.34 * (1.0 - mortar * 0.6));

    // Slightly softer paved edge into gravel shoulder apron
    float coreA = smoothstep(0.10, 0.72, core) * u_opacity;
    float bankA = verge * 0.52 * (0.85 + 0.15 * macro);
    vec3 vergeRgb = mix(edgeCol, bankCol, smoothstep(0.12, 0.68, verge));
    alpha = clamp(max(bankA, coreA), 0.0, 0.98);
    col = mix(vergeRgb, coreCol, clamp(coreA / max(alpha, 0.001), 0.0, 1.0));
  }

  // Apply Fog-of-War dimming & strategic zoom fade
  float finalAlpha = alpha * u_fade;
  vec3 litCol = col * fogDim;
  fragColor = vec4(litCol * finalAlpha, finalAlpha);
}
`;function un(t,e,r=0){let o=Math.imul(t+37,374761393)^Math.imul(e+91,668265263)^Math.imul(r+7,2246822519);return o^=o>>>13,o=Math.imul(o,1274126177),(o^o>>>16)>>>0}function Sr(t,e){return{x:256*(t+e*.5),y:Ye*e}}function pi(t,e,r,o,i=14){let n=t>r||t===r&&e>o,a=n?r:t,l=n?o:e,c=n?t:r,s=n?e:o,u=Sr(a,l),h=Sr(c,s),f=h.x-u.x,m=h.y-u.y,p=Math.hypot(f,m)||1,b=-m/p,_=f/p,D=(un(a+c,l+s,un(a-c,l-s,11))%2001/1e3-1)*4.2,x=[];for(let M=0;M<=i;M++){let X=M/i,w=D*Math.sin(X*2*Math.PI);x.push({x:u.x+f*X+b*w,y:u.y+m*X+_*w})}return x}var Cr=class{constructor(e){this.verts=new Float32Array(wr*_r);this.vertCount=0;this.maskFbo=null;this.maskTex=null;this.maskW=0;this.maskH=0;this.gl=e,this.maskProg=this.compileProgram(di,fi,"RoadMask"),this.compProg=this.compileProgram(hi,mi,"RoadComp");let r=e.createVertexArray(),o=e.createBuffer(),i=e.createVertexArray();if(!r||!o||!i)throw new Error("Failed to allocate RoadPass VAO/VBO");this.vao=r,this.vbo=o,this.compVao=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let n=_r*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.bindVertexArray(null);let a=(l,c)=>{let s=e.getUniformLocation(l,c);if(!s)throw new Error(`Missing road uniform: ${c}`);return s};this.uMaskCamCenter=a(this.maskProg,"u_camCenter"),this.uMaskViewportSize=a(this.maskProg,"u_viewportSize"),this.uMaskZoom=a(this.maskProg,"u_zoom"),this.uMaskTier=a(this.maskProg,"u_tier"),this.uCompCamCenter=a(this.compProg,"u_camCenter"),this.uCompViewportSize=a(this.compProg,"u_viewportSize"),this.uCompZoom=a(this.compProg,"u_zoom"),this.uCompTier=a(this.compProg,"u_tier"),this.uCompOpacity=a(this.compProg,"u_opacity"),this.uCompFade=a(this.compProg,"u_fade"),e.useProgram(this.compProg),e.uniform1i(e.getUniformLocation(this.compProg,"u_roadMaskTex"),0)}compileProgram(e,r,o){let{gl:i}=this,n=i.createShader(i.VERTEX_SHADER),a=i.createShader(i.FRAGMENT_SHADER);if(!n||!a)throw new Error(`Failed to allocate ${o} shaders`);if(i.shaderSource(n,e),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw new Error(`${o} VS error: ${i.getShaderInfoLog(n)}`);if(i.shaderSource(a,r),i.compileShader(a),!i.getShaderParameter(a,i.COMPILE_STATUS))throw new Error(`${o} FS error: ${i.getShaderInfoLog(a)}`);let l=i.createProgram();if(!l)throw new Error(`Failed to allocate ${o} program`);if(i.attachShader(l,n),i.attachShader(l,a),i.linkProgram(l),i.deleteShader(n),i.deleteShader(a),!i.getProgramParameter(l,i.LINK_STATUS))throw new Error(`${o} link error: ${i.getProgramInfoLog(l)}`);return l}ensureMaskFbo(e,r){let o=Math.max(1,e),i=Math.max(1,r);if(this.maskFbo&&this.maskW===o&&this.maskH===i)return;let{gl:n}=this;this.maskTex&&n.deleteTexture(this.maskTex),this.maskFbo&&n.deleteFramebuffer(this.maskFbo);let a=n.createTexture(),l=n.createFramebuffer();if(!a||!l)throw new Error("Failed to allocate RoadPass mask FBO");n.bindTexture(n.TEXTURE_2D,a),n.texImage2D(n.TEXTURE_2D,0,n.RGBA8,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,l),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,a,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.maskTex=a,this.maskFbo=l,this.maskW=o,this.maskH=i}pushVert(e,r,o,i,n,a,l,c,s,u,h){if(this.vertCount>=wr)return;let f=this.vertCount*_r,m=this.verts;m[f++]=e,m[f++]=r,m[f++]=o,m[f++]=i,m[f++]=n,m[f++]=a,m[f++]=l,m[f++]=c,m[f++]=s,m[f++]=u,m[f++]=h,m[f++]=0,this.vertCount++}emitTierGeometry(e,r,o,i){this.vertCount=0;let n=r.width*.5,a=r.shoulder*.5,l=r.outer*.5,c=r.rough,s=(f,m)=>{let p=i?i(f,m):0;return{x:f,y:(m-p)*De}},u=new Map;for(let f=0;f<e.length;f++){let m=e[f],p=o(m.q1,m.r1),b=o(m.q2,m.r2);if(p===0&&b===0)continue;let _=p===2||b===2?1:.66,A=pi(m.q1,m.r1,m.q2,m.r2,14),D=A.length,x=un(m.q1+m.q2,m.r1+m.r2,r.tierIndex+3)%628/100,M=Fe(m.q1,m.r1),X=Sr(m.q1,m.r1),w=u.get(M);(!w||_>w.fogDim)&&u.set(M,{ux:X.x,uy:X.y,fogDim:_});let y=Fe(m.q2,m.r2),E=Sr(m.q2,m.r2),L=u.get(y);(!L||_>L.fogDim)&&u.set(y,{ux:E.x,uy:E.y,fogDim:_});let T=new Float32Array(D),H=new Float32Array(D),Q=new Float32Array(D),N=new Float32Array(D),Y=new Float32Array(D);for(let C=0;C<D;C++){C>0&&(Q[C]=Q[C-1]+Math.hypot(A[C].x-A[C-1].x,A[C].y-A[C-1].y));let oe=A[Math.max(0,C-1)],ue=A[Math.min(D-1,C+1)],V=ue.x-oe.x,v=ue.y-oe.y,W=Math.hypot(V,v)||1;T[C]=-v/W,H[C]=V/W;let R=C/(D-1),I=Math.sin(Math.PI*R);N[C]=n*(1+c*I*(.69*Math.sin(R*12+x)+.36*Math.cos(R*17+x))),Y[C]=n*(1+c*I*(.63*Math.cos(R*11+x)-.32*Math.sin(R*18+x)))}for(let C=0;C<D-1&&!(this.vertCount+6>wr);C++){let oe=C/(D-1),ue=(C+1)/(D-1),V=A[C],v=A[C+1],W=s(V.x-T[C]*l,V.y-H[C]*l),R=s(V.x+T[C]*l,V.y+H[C]*l),I=s(v.x-T[C+1]*l,v.y-H[C+1]*l),k=s(v.x+T[C+1]*l,v.y+H[C+1]*l);this.pushVert(W.x,W.y,-l,0,N[C],a,l,oe,_,-l,Q[C]),this.pushVert(R.x,R.y,l,0,Y[C],a,l,oe,_,l,Q[C]),this.pushVert(k.x,k.y,l,0,Y[C+1],a,l,ue,_,l,Q[C+1]),this.pushVert(W.x,W.y,-l,0,N[C],a,l,oe,_,-l,Q[C]),this.pushVert(k.x,k.y,l,0,Y[C+1],a,l,ue,_,l,Q[C+1]),this.pushVert(I.x,I.y,-l,0,N[C+1],a,l,ue,_,-l,Q[C+1])}}let h=14;for(let f of u.values()){let m=s(f.ux,f.uy);for(let p=0;p<h&&!(this.vertCount+3>wr);p++){let b=p/h*Math.PI*2,_=(p+1)/h*Math.PI*2,A=Math.cos(b)*l,D=Math.sin(b)*l,x=Math.cos(_)*l,M=Math.sin(_)*l,X=s(f.ux+A,f.uy+D),w=s(f.ux+x,f.uy+M);this.pushVert(m.x,m.y,0,0,n*1.03,a*1.02,l,-1,f.fogDim,0,0),this.pushVert(X.x,X.y,A,D,n*1.03,a*1.02,l,-1,f.fogDim,0,0),this.pushVert(w.x,w.y,x,M,n*1.03,a*1.02,l,-1,f.fogDim,0,0)}}}render(e){let{cam:r,roads:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:a}=e;if(!o||o.length===0||n>=.85)return 0;let l=1-n*.82,{gl:c}=this,s=c.canvas.width,u=c.canvas.height;if(s<=0||u<=0)return 0;let h={trail:[],packed:[],stone:[]};for(let m=0;m<o.length;m++){let p=o[m];(h[p.tier]??h.trail).push(p)}this.ensureMaskFbo(s,u);let f=0;for(let m of ui){let p=h[m];if(p.length===0)continue;let b=ci[m];this.emitTierGeometry(p,b,i,a),this.vertCount!==0&&(c.bindFramebuffer(c.FRAMEBUFFER,this.maskFbo),c.viewport(0,0,this.maskW,this.maskH),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT),c.enable(c.BLEND),c.blendEquation(c.MAX),c.blendFunc(c.ONE,c.ONE),c.useProgram(this.maskProg),c.bindVertexArray(this.vao),c.bindBuffer(c.ARRAY_BUFFER,this.vbo),c.bufferSubData(c.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*_r)),c.uniform2f(this.uMaskCamCenter,r.x,r.y),c.uniform2f(this.uMaskViewportSize,r.viewportWidth,r.viewportHeight),c.uniform1f(this.uMaskZoom,r.zoom),c.uniform1f(this.uMaskTier,b.tierIndex),c.drawArrays(c.TRIANGLES,0,this.vertCount),f++,c.bindFramebuffer(c.FRAMEBUFFER,null),c.viewport(0,0,s,u),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),c.useProgram(this.compProg),c.bindVertexArray(this.compVao),c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,this.maskTex),c.uniform2f(this.uCompCamCenter,r.x,r.y),c.uniform2f(this.uCompViewportSize,r.viewportWidth,r.viewportHeight),c.uniform1f(this.uCompZoom,r.zoom),c.uniform1f(this.uCompTier,b.tierIndex),c.uniform1f(this.uCompOpacity,b.opacity),c.uniform1f(this.uCompFade,l),c.drawArrays(c.TRIANGLES,0,3),f++)}return c.bindVertexArray(null),f}dispose(){let{gl:e}=this;this.maskTex&&e.deleteTexture(this.maskTex),this.maskFbo&&e.deleteFramebuffer(this.maskFbo),e.deleteBuffer(this.vbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compVao),e.deleteProgram(this.maskProg),e.deleteProgram(this.compProg)}};var mo=`#version 300 es
precision highp float;

// Unit quad [0..1] x [0..1] (2 triangles, 6 vertices)
const vec2 QUAD[6] = vec2[6](
  vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(0.0, 1.0),
  vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0)
);

layout(location = 0) in vec4 a_geom0;  // x=anchorX, y=anchorY, z=relLeft, w=relTop
layout(location = 1) in vec4 a_geom1;  // x=width, y=height, z=alpha, w=pageIdx*256 + flags8
layout(location = 2) in vec4 a_uvRect; // u0, v0, u1, v1
layout(location = 3) in vec4 a_extra;  // x=tintHash(0..1), y=swayAmp(0..1) or decalRotRad, z=packedTerrainRgb24, w=terrainTintMix(0..1)

uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;
uniform float u_scaleY;
uniform float u_shearX;
uniform float u_time;
uniform float u_windEnabled;
uniform float u_decalPass;

out vec2 v_uv;
out vec2 v_footUv;
out vec2 v_localCorner;
out float v_alpha;
out float v_tint;
out vec4 v_terrainTint; // rgb=local terrain avgColor (0..1), a=tintMix (0..1)
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

  vec2 tilted;
  if (u_decalPass > 0.5) {
    // True 0..360-deg flat-on-ground isometric rotation around decal center (zero repetition!)
    float c = cos(a_extra.y);
    float s = sin(a_extra.y);
    tilted = vec2(local.x * c - local.y * s, (local.x * s + local.y * c) * 0.84);
  } else {
    // Subtle GPU canopy breeze sway (trunk at corner.y == 1.0 stays 100% rooted!)
    if (u_windEnabled > 0.5 && a_extra.y > 0.005) {
      float phase = a_geom0.x * 0.017 + a_geom0.y * 0.013 + a_extra.x * 6.2831;
      float gust = sin(u_time * 1.45 + phase) * 0.68 + sin(u_time * 2.75 + phase * 1.6) * 0.32;
      float bend = (1.0 - corner.y) * (1.0 - corner.y) * a_extra.y;
      local.x += gust * bend * min(6.5, a_geom1.y * 0.038);
    }

    // Subtle artist perspective tilt for organic nature sprites; upright masonry stays exact!
    tilted = isWallOrFlat
      ? local
      : vec2(local.x + local.y * u_shearX, local.y * u_scaleY);
  }

  vec2 world = a_geom0.xy + tilted;
  vec2 screenOffset = (world - u_camCenter) * u_zoom;
  vec2 ndc = vec2(screenOffset.x / (u_viewportSize.x * 0.5), -screenOffset.y / (u_viewportSize.y * 0.5));
  gl_Position = vec4(ndc, 0.0, 1.0);

  // Screen UV of the sprite's ground foot (for exact foot-gated cross-sprite cast shadows).
  vec2 footOffset = (a_geom0.xy - u_camCenter) * u_zoom;
  vec2 footNdc = vec2(footOffset.x / (u_viewportSize.x * 0.5), -footOffset.y / (u_viewportSize.y * 0.5));
  v_footUv = footNdc * 0.5 + 0.5;

  // Unpack 24-bit terrain RGB once per vertex for terrain-adaptive ground decals
  float pRgb = max(0.0, a_extra.z);
  float tR = floor(pRgb / 65536.0);
  float tG = floor(mod(pRgb, 65536.0) / 256.0);
  float tB = mod(pRgb, 256.0);
  v_terrainTint = vec4(vec3(tR, tG, tB) / 255.0, clamp(a_extra.w, 0.0, 1.0));

  v_localCorner = corner;
  v_uv = mix(a_uvRect.xy, a_uvRect.zw, corner);
  v_alpha = a_geom1.z;
  v_tint = a_extra.x;
}
`,gi=`#version 300 es
precision highp float;
in vec2 v_uv;
in vec2 v_footUv;
in vec2 v_localCorner;
in float v_alpha;
in float v_tint;
in vec4 v_terrainTint;
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
uniform float u_decalPass;

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

  // 0. Terrain-adaptive coloring for ground decals (desert cracks adopt exact local sand/badlands hue!)
  if (u_decalPass > 0.5 && v_terrainTint.a > 0.005) {
    vec3 terrCol = v_terrainTint.rgb;
    float mixAmt = v_terrainTint.a;
    if (mixAmt >= 0.80) {
      // Full terrain-adaptive arid crack fissures: deep shaded cracks + subtle soil-tone stone rims!
      float tLum = dot(col, vec3(0.299, 0.587, 0.114));
      float shadeFactor = mix(0.32, 0.94, smoothstep(0.18, 0.92, tLum));
      col = mix(col, clamp(terrCol * shadeFactor, 0.0, 1.0), mixAmt);
      a = clamp(a * 1.12, 0.0, 1.0);
    } else {
      // Subtle soil-hue harmony for pebbles, woodland leaves & moss
      float terrLum = max(0.28, dot(terrCol, vec3(0.299, 0.587, 0.114)));
      vec3 harmonized = clamp(col * (terrCol / terrLum), 0.0, 1.0);
      col = mix(col, harmonized, mixAmt);
    }
  }

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
`,bi=`#version 300 es
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
`,po=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,vi=`#version 300 es
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
`,yi=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function Vt(t,e,r,o){let i=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!i||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(i)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let a=t.createProgram();if(!a)throw new Error(`Failed to create ${o} program`);if(t.attachShader(a,i),t.attachShader(a,n),t.linkProgram(a),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(a,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(a)}`);return a}var xi=`#version 300 es
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
`,wi=`#version 300 es
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
`,Rr=class{constructor(e){this.instanceData=new Float32Array(16384*16);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=Vt(e,mo,gi,"sprite"),this.shadowMaskProg=Vt(e,mo,bi,"shadow-mask"),this.compositeProg=Vt(e,po,vi,"shadow-composite"),this.shoreCompositeProg=Vt(e,po,yi,"shore-composite"),this.surfProg=Vt(e,xi,wi,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),i=e.createBuffer();if(!r||!o||!i)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=64;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let a=(l,c)=>{let s=e.getUniformLocation(l,c);if(!s)throw new Error(`Missing uniform ${c}`);return s};this.spCam=a(this.spriteProg,"u_camCenter"),this.spView=a(this.spriteProg,"u_viewportSize"),this.spZoom=a(this.spriteProg,"u_zoom"),this.spScaleY=a(this.spriteProg,"u_scaleY"),this.spShearX=a(this.spriteProg,"u_shearX"),this.spTime=a(this.spriteProg,"u_time"),this.spWindEnabled=a(this.spriteProg,"u_windEnabled"),this.spCanvasSize=a(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=a(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=a(this.spriteProg,"u_selfShadow"),this.spNaturePolish=a(this.spriteProg,"u_naturePolish"),this.spSpriteSat=a(this.spriteProg,"u_spriteSat"),this.spSpriteBright=a(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=a(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=a(this.spriteProg,"u_colorGradeAll"),this.spDecalPass=a(this.spriteProg,"u_decalPass"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=a(this.shadowMaskProg,"u_camCenter"),this.shView=a(this.shadowMaskProg,"u_viewportSize"),this.shZoom=a(this.shadowMaskProg,"u_zoom"),this.shScaleY=a(this.shadowMaskProg,"u_scaleY"),this.shShearX=a(this.shadowMaskProg,"u_shearX"),this.shTime=a(this.shadowMaskProg,"u_time"),this.shWindEnabled=a(this.shadowMaskProg,"u_windEnabled"),this.shDecalPass=a(this.shadowMaskProg,"u_decalPass"),this.sfCam=a(this.surfProg,"u_camCenter"),this.sfView=a(this.surfProg,"u_viewportSize"),this.sfZoom=a(this.surfProg,"u_zoom"),this.sfTime=a(this.surfProg,"u_time"),this.sfWindEnabled=a(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=a(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),i=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===i)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let a=n.createTexture(),l=n.createFramebuffer();if(!a||!l)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,a),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,l),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,a,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=a,this.shadowFbo=l,this.shadowW=o,this.shadowH=i}ensureShoreFbo(e,r){let o=Math.max(2,e),i=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===i)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let a=n.createTexture(),l=n.createFramebuffer();if(!a||!l)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,a),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,l),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,a,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=a,this.shoreFbo=l,this.shoreW=o,this.shoreH=i}renderShadows(e){let{cam:r,sprites:o,fogStates:i,walls:n=[],shadowPages:a,shadowOpacity:l,detailOpacity:c}=e;if(this.lastHasCrossShadows=!1,l<=.005||c<=.01||a.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:s,instanceData:u}=this;this.ensureShadowFbo(s.canvas.width,s.canvas.height);let h=0,f=0,m=new Array(a.length).fill(0);for(let x=0;x<o.length;x++){let M=o[x];M.shadowPage<0||M.shadowPage>=a.length||i[x]!==0&&m[M.shadowPage]++}for(let x=0;x<n.length;x++){let M=n[x],X=M.shadowPage??-1;X<0||X>=a.length||M.fogState===0||m[X]++}let p=new Array(a.length).fill(0),b=0;for(let x=0;x<a.length;x++)p[x]=b,b+=m[x];if(b===0)return{drawCalls:0,renderedShadows:0};let _=[...p],A=Math.min(b,16384);for(let x=0;x<o.length;x++){let M=o[x],X=M.shadowPage;if(X<0||X>=a.length)continue;let w=i[x];if(w===0)continue;let y=_[X];if(y>=A)continue;_[X]=y+1,h++;let E=M.shadowTier??(M.isMountain?3:0);E>0&&f++;let L=y*16,T=(M.shadowMaxX-M.shadowMinX)*M.width,H=(M.shadowMaxY-M.shadowMinY)*M.width;u[L]=M.x,u[L+1]=M.y,u[L+2]=M.shadowMinX*M.width,u[L+3]=M.shadowMinY*M.width,u[L+4]=T,u[L+5]=H,u[L+6]=w===1?c*.65:c,u[L+7]=E,u[L+8]=M.shadowU0,u[L+9]=M.shadowV0,u[L+10]=M.shadowU1,u[L+11]=M.shadowV1,u[L+12]=.5,u[L+13]=0,u[L+14]=0,u[L+15]=0}for(let x=0;x<n.length;x++){let M=n[x],X=M.shadowPage??-1;if(X<0||X>=a.length||M.fogState===0)continue;let w=_[X];if(w>=A)continue;_[X]=w+1,h++,f++;let y=w*16;u[y]=M.x,u[y+1]=M.y,u[y+2]=M.shadowRelLeft??0,u[y+3]=M.shadowRelTop??0,u[y+4]=M.shadowWidth??0,u[y+5]=M.shadowHeight??0,u[y+6]=M.fogState===1?c*.65:c,u[y+7]=2,u[y+8]=M.shadowU0??0,u[y+9]=M.shadowV0??0,u[y+10]=M.shadowU1??0,u[y+11]=M.shadowV1??0,u[y+12]=.5,u[y+13]=0,u[y+14]=0,u[y+15]=0}this.lastHasCrossShadows=f>0,s.bindBuffer(s.ARRAY_BUFFER,this.instanceVbo),s.bufferSubData(s.ARRAY_BUFFER,0,u.subarray(0,A*16)),s.bindFramebuffer(s.FRAMEBUFFER,this.shadowFbo),s.viewport(0,0,this.shadowW,this.shadowH),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),s.enable(s.BLEND),s.blendEquation(s.MAX),s.blendFunc(s.ONE,s.ONE),s.useProgram(this.shadowMaskProg),s.bindVertexArray(this.vao),s.uniform2f(this.shCam,r.x,r.y),s.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),s.uniform1f(this.shZoom,r.zoom),s.uniform1f(this.shScaleY,1),s.uniform1f(this.shShearX,0),s.uniform1f(this.shTime,0),s.uniform1f(this.shWindEnabled,0),s.uniform1f(this.shDecalPass,0);let D=0;s.activeTexture(s.TEXTURE0);for(let x=0;x<a.length;x++){let M=p[x],X=Math.min(_[x],A),w=X-M;w<=0||(s.bindTexture(s.TEXTURE_2D,a[x]),M===0||s.bufferSubData(s.ARRAY_BUFFER,0,u.subarray(M*16,X*16)),s.drawArraysInstanced(s.TRIANGLES,0,6,w),D++)}return s.bindFramebuffer(s.FRAMEBUFFER,null),s.viewport(0,0,s.canvas.width,s.canvas.height),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ONE_MINUS_SRC_ALPHA),s.useProgram(this.compositeProg),s.bindVertexArray(this.compositeVao),s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,this.shadowTex),s.uniform1f(this.compOpacity,l),s.drawArrays(s.TRIANGLES,0,3),D++,{drawCalls:D,renderedShadows:h}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:i,naturePages:n,walls:a=[],infraPages:l=[],detailOpacity:c,objectScaleY:s,objectShearX:u,shadowOpacity:h=.54,mountainShadowOnSprites:f=!0,spriteSelfShadow:m=.68,naturePolish:p=.4,spriteSaturation:b=1,spriteBrightness:_=1,spriteContrast:A=1,timeSec:D=0,windAnimation:x=!0,isDecalPass:M=!1}=e,X=o.length>0&&n.length>0,w=a.length>0&&l.length>0;if(c<=.01||!X&&!w)return{drawCalls:0,renderedSprites:0};let{gl:y,instanceData:E}=this;y.enable(y.BLEND),y.blendEquation(y.FUNC_ADD),y.blendFunc(y.ONE,y.ONE_MINUS_SRC_ALPHA),y.useProgram(this.spriteProg),y.bindVertexArray(this.vao),y.bindBuffer(y.ARRAY_BUFFER,this.instanceVbo),y.uniform2f(this.spCam,r.x,r.y),y.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),y.uniform1f(this.spZoom,r.zoom),y.uniform1f(this.spScaleY,s),y.uniform1f(this.spShearX,u),y.uniform1f(this.spTime,D),y.uniform1f(this.spWindEnabled,x?1:0),y.uniform2f(this.spCanvasSize,y.canvas.width,y.canvas.height);let L=f&&this.lastHasCrossShadows&&this.shadowTex!==null?h:0;y.uniform1f(this.spMtnShadowOpacity,L),y.uniform1f(this.spSelfShadow,m),y.uniform1f(this.spNaturePolish,p),y.uniform1f(this.spSpriteSat,b),y.uniform1f(this.spSpriteBright,_),y.uniform1f(this.spSpriteContrast,A),y.uniform1f(this.spColorGradeAll,1),y.uniform1f(this.spDecalPass,M?1:0);let T=n[0]??l[0];y.activeTexture(y.TEXTURE8),y.bindTexture(y.TEXTURE_2D,this.shadowTex??T);let H=0,Q=0,N=0,Y=[],C=new Map,oe=()=>{if(N<=0)return;for(let k=0;k<Y.length;k++)y.activeTexture(y.TEXTURE0+k),y.bindTexture(y.TEXTURE_2D,Y[k]);let I=Y[0]??T;for(let k=Y.length;k<8;k++)y.activeTexture(y.TEXTURE0+k),y.bindTexture(y.TEXTURE_2D,I);y.bufferSubData(y.ARRAY_BUFFER,0,E.subarray(0,N*16)),y.drawArraysInstanced(y.TRIANGLES,0,6,N),H++,Q+=N,N=0,Y=[],C.clear()},ue=I=>{let k=C.get(I);return k===void 0?((Y.length>=8||N>=16384)&&oe(),k=Y.length,Y.push(I),C.set(I,k)):N>=16384&&(oe(),k=0,Y.push(I),C.set(I,0)),k},V=0,v=0,W=X?o.length:0,R=w?a.length:0;for(;V<W||v<R;){let I=!1;if(V>=W)I=!0;else if(v<R){let k=o[V].sortY??o[V].y;a[v].sortY<k&&(I=!0)}if(I){let k=a[v++];if(k.fogState===0||k.page<0||k.page>=l.length)continue;let d=ue(l[k.page]),g=(k.fogState===1?1:0)|4|16,S=N*16;E[S]=k.x,E[S+1]=k.y,E[S+2]=k.relLeft,E[S+3]=k.relTop,E[S+4]=k.width,E[S+5]=k.height,E[S+6]=c,E[S+7]=d*256+g,E[S+8]=k.u0,E[S+9]=k.v0,E[S+10]=k.u1,E[S+11]=k.v1,E[S+12]=.5,E[S+13]=0,E[S+14]=0,E[S+15]=0,N++}else{let k=V++,d=i[k];if(d===0)continue;let g=o[k];if(g.page<0||g.page>=n.length)continue;let S=ue(n[g.page]),q=g.shadowTier??(g.isMountain?3:0),F=g.selfShadeWeight??(g.isGroundDecal?0:g.isMountain?.52:.72),z=Math.max(0,Math.min(7,Math.round(F*7))),G=(d===1?1:0)|(q&3)<<3|(z&7)<<5;g.isMountain||(G|=2,g.isSnowFamily&&(G|=4));let J=!!g.flipX,ge=J?1-g.anchorX:g.anchorX,Z=N*16;E[Z]=g.x,E[Z+1]=g.y,E[Z+2]=-g.width*ge,E[Z+3]=-g.height*g.anchorY,E[Z+4]=g.width,E[Z+5]=g.height,E[Z+6]=c,E[Z+7]=S*256+G,E[Z+8]=J?g.u1:g.u0,E[Z+9]=g.v0,E[Z+10]=J?g.u0:g.u1,E[Z+11]=g.v1,E[Z+12]=g.tintHash??.5,E[Z+13]=M?g.rotationRad??0:g.swayAmp??0,E[Z+14]=M?g.terrainTintRgb??0:0,E[Z+15]=M?g.terrainTintMix??0:0,N++}}return oe(),{drawCalls:H,renderedSprites:Q}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:i,infraPages:n,projectY:a}=e;if(o.length===0||n.length===0)return{drawCalls:0,renderedShorelines:0};let{gl:l,instanceData:c}=this;this.ensureShoreFbo(l.canvas.width,l.canvas.height),l.bindFramebuffer(l.FRAMEBUFFER,this.shoreFbo),l.viewport(0,0,this.shoreW,this.shoreH),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.enable(l.BLEND),l.blendEquation(l.MAX),l.blendFunc(l.ONE,l.ONE),l.useProgram(this.spriteProg),l.bindVertexArray(this.vao),l.bindBuffer(l.ARRAY_BUFFER,this.instanceVbo),l.uniform2f(this.spCam,r.x,r.y),l.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),l.uniform1f(this.spZoom,r.zoom),l.uniform1f(this.spScaleY,1),l.uniform1f(this.spShearX,0),l.uniform1f(this.spTime,0),l.uniform1f(this.spWindEnabled,0),l.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),l.uniform1f(this.spMtnShadowOpacity,0),l.uniform1f(this.spSelfShadow,0),l.uniform1f(this.spNaturePolish,0),l.uniform1f(this.spSpriteSat,1),l.uniform1f(this.spSpriteBright,1),l.uniform1f(this.spSpriteContrast,1),l.uniform1f(this.spColorGradeAll,0),l.uniform1f(this.spDecalPass,0);let s=Math.min(n.length,8);for(let _=0;_<8;_++)l.activeTexture(l.TEXTURE0+_),l.bindTexture(l.TEXTURE_2D,n[_<s?_:0]);l.activeTexture(l.TEXTURE8),l.bindTexture(l.TEXTURE_2D,n[0]);let u=0,h=0,f=0,m=()=>{f<=0||(l.bufferSubData(l.ARRAY_BUFFER,0,c.subarray(0,f*16)),l.drawArraysInstanced(l.TRIANGLES,0,6,f),u++,h+=f,f=0)},p=512,b=512*a;for(let _=0;_<o.length;_++){let A=i[_];if(A===0)continue;let D=o[_];if(D.page<0||D.page>=s)continue;f>=16384&&m();let x=f*16;c[x]=D.x,c[x+1]=D.y,c[x+2]=-p*.5,c[x+3]=-b*.5,c[x+4]=p,c[x+5]=b,c[x+6]=1,c[x+7]=D.page*256+4+24+(A===1?1:0),c[x+8]=D.u0,c[x+9]=D.v0,c[x+10]=D.u1,c[x+11]=D.v1,c[x+12]=.5,c[x+13]=0,c[x+14]=0,c[x+15]=0,f++}return m(),l.bindFramebuffer(l.FRAMEBUFFER,null),l.viewport(0,0,l.canvas.width,l.canvas.height),l.blendEquation(l.FUNC_ADD),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),h>0&&(l.useProgram(this.shoreCompositeProg),l.bindVertexArray(this.compositeVao),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.shoreTex),l.drawArrays(l.TRIANGLES,0,3),u++),{drawCalls:u,renderedShorelines:h}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:i,detailOpacity:n,timeSec:a,windAnimation:l}=e;if(n<=.02||o.length===0)return 0;let{gl:c,instanceData:s}=this,u=0;for(let h=0;h<o.length;h++){let f=o[h];if(!f.isWaterBoulder)continue;let m=i[h];if(m===0)continue;if(u>=16384)break;let p=f.width*.68,b=f.width*.25,_=u*16;s[_]=f.x,s[_+1]=f.y-f.height*.04,s[_+2]=-p,s[_+3]=-b,s[_+4]=p*2,s[_+5]=b*2,s[_+6]=n,s[_+7]=m===1?1:0,s[_+8]=0,s[_+9]=0,s[_+10]=0,s[_+11]=0,s[_+12]=f.tintHash??.5,s[_+13]=0,s[_+14]=0,s[_+15]=0,u++}return u===0?0:(c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),c.useProgram(this.surfProg),c.bindVertexArray(this.vao),c.bindBuffer(c.ARRAY_BUFFER,this.instanceVbo),c.uniform2f(this.sfCam,r.x,r.y),c.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),c.uniform1f(this.sfZoom,r.zoom),c.uniform1f(this.sfTime,a),c.uniform1f(this.sfWindEnabled,l?1:0),c.bufferSubData(c.ARRAY_BUFFER,0,s.subarray(0,u*16)),c.drawArraysInstanced(c.TRIANGLES,0,6,u),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var ht=256,_i=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,Si=`#version 300 es
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
uniform vec4 u_surfaceRect;    // (left, top, width, height) in unprojected world space
uniform float u_edgeBand;      // autotile.js edgeWidth (default 28.0)
uniform float u_waterHexMode;  // 1.0 = 'hex' motif-safe water, 0.0 = 'repeat'
uniform float u_reliefEnabled; // 1.0 = active 2.5D hill warp, 0.0 = flat
uniform float u_reliefLighting;// 1.0 = directional slope lighting from right
uniform float u_windEnabled;   // 1.0 = subtle animated water shimmer

uniform sampler2DArray u_terrainArray;
uniform usampler2D u_cellData;     // R=terrainLayer, G=unused, B=fog(0/1/2), A=flags (bit0=water, bit1=snowNoBeach, bit2=icyWater)
uniform sampler2D u_surfaceField;  // R=height/RELIEF_MAX_H, G=(shade-0.52)/0.96, B=organicForestMask, A=landMask

const float HEX_W = ${256 .toFixed(4)};
const float HEX_R = ${$e.toFixed(6)};
const float PROJ_Y = ${De.toFixed(4)};
const float ROW_STEP = ${(1.5*$e).toFixed(6)};
const float TEX_WORLD_SIZE = 256.0;
const float WATER_HEX_COVER = ${(2*$e).toFixed(4)}; // 295.603 (autotile.js:87)
const float RELIEF_MAX_H = ${ar.toFixed(2)};

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
  float coastalWeightSum = 0.0;
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
      if ((cDat[k].a & 8u) != 0u) coastalWeightSum += w;
      mixWeightSum += w;
    }
  }

  // Fallback to home cell if pixel lies right on an isolated known cell edge
  vec3 knownColor = vec3(0.0);
  float coastalFrac = 0.0;
  if (mixWeightSum > 0.001) {
    knownColor = terrainSum / mixWeightSum;
    coastalFrac = clamp(coastalWeightSum / mixWeightSum, 0.0, 1.0);
  } else if (homeCell.b > 0u) {
    knownColor = sampleHexTerrain(homeCell, uPos, homeCenter, dUdx, dUdy);
    coastalFrac = ((homeCell.a & 8u) != 0u) ? 1.0 : 0.0;
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
  float warmCoastDist = 999.0;
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
      if (homeIsWater) warmCoastDist = max(0.0, effDist);
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

  // Lively GPU animated water waves, coastal caustics & gentle rolling shoreline surf ripples
  if (effectiveWater && u_windEnabled > 0.5 && normKnown > 0.05) {
    float icyDamp = ((homeCell.a & 4u) != 0u) ? 0.30 : 1.0;
    float w1 = sin(uPos.x * 0.042 + uPos.y * 0.028 + u_time * 1.45);
    float w2 = cos(uPos.x * 0.027 - uPos.y * 0.051 + u_time * 1.05);
    float w3 = sin(uPos.x * 0.078 - uPos.y * 0.064 - u_time * 1.85);
    float shimmer = w1 * w2 * 0.72 + w3 * 0.28;

    // Coastal water breathes noticeably livelier than deep calm ocean (smooth Voronoi coastalFrac!)
    float coastBoost = mix(1.0, 2.35, coastalFrac) * icyDamp;
    float glint = pow(clamp(shimmer * 0.5 + 0.5, 0.0, 1.0), 3.2);
    vec3 causticTint = mix(vec3(0.032, 0.046, 0.052), vec3(0.085, 0.145, 0.150), coastalFrac);
    knownColor = knownColor * (1.0 + shimmer * 0.042 * coastBoost)
               + causticTint * glint * (0.45 + 0.95 * coastalFrac) * icyDamp;

    // Rhythmic gently lapping surf bands rolling shoreward across shallow warm coastal water
    if (warmCoastDist < 62.0 && icyDamp > 0.5) {
      float shoreEnv = smoother5(1.0 - warmCoastDist / 62.0);
      float wNoise = autotileSmoothField(uPos * 0.85 + vec2(u_time * 0.14, -u_time * 0.10)) * 5.2;
      float wavePhase = (warmCoastDist + wNoise) * 0.24 + u_time * 2.25;
      float crest = pow(max(0.0, sin(wavePhase)), 4.0);
      float innerLap = pow(max(0.0, sin(wavePhase * 0.55 + 1.3)), 3.0) * smoother5(1.0 - warmCoastDist / 26.0);
      float foamStrength = clamp((crest * 0.24 + innerLap * 0.28) * shoreEnv, 0.0, 0.42);
      knownColor = mix(knownColor, vec3(0.84, 0.94, 0.94), foamStrength);
    }
    knownColor = clamp(knownColor, 0.0, 1.0);
  }

  // Explored-only Fog-of-War darkening & cool desaturation.
  float luma = dot(knownColor, vec3(0.299, 0.587, 0.114));
  vec3 exploredColor = mix(vec3(luma), knownColor, 0.58) * vec3(0.68, 0.72, 0.78);
  vec3 litTerrain = mix(exploredColor, knownColor, normVis);

  // Layer 1 keeps terrain crisp beneath Layer 4 sprites; billowing clouds & cloud_edge puffs
  // are composited in Layer 4b (renderCloudOverlay) ABOVE sprites so zero crowns ever poke through!
  // Still fill fully unknown terrain base softly with neutral cloud tone so unexplored margins never flash black.
  vec3 color = mix(vec3(0.76, 0.79, 0.84), litTerrain, smoothstep(0.0, 0.22, normKnown));

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
`,Ci=`#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

in vec2 v_ndc;
out vec4 fragColor;

uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;
uniform float u_time;
uniform ivec2 u_gridOrigin;
uniform ivec2 u_gridSize;
uniform float u_hasClouds;
uniform float u_hasCloudEdge;
uniform float u_windEnabled;

uniform usampler2D u_cellData;
uniform sampler2D u_cloudTex;
uniform sampler2D u_cloudEdgeTex;

const float HEX_W = ${256 .toFixed(4)};
const float HEX_R = ${$e.toFixed(6)};
const float PROJ_Y = ${De.toFixed(4)};
const float ROW_STEP = ${(1.5*$e).toFixed(6)};

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

float smoother5(float t) {
  float c = clamp(t, 0.0, 1.0);
  return c * c * c * (c * (6.0 * c - 15.0) + 10.0);
}

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

void main() {
  vec2 screenOffset = vec2(v_ndc.x, -v_ndc.y) * (u_viewportSize * 0.5);
  vec2 worldPos = u_camCenter + screenOffset / u_zoom;
  vec2 rawUPos = vec2(worldPos.x, worldPos.y / PROJ_Y);

  // Broad billowing multi-octave domain warp for Fog-of-War cloud frontier (breaks straight hex & chunk edges!)
  float cwX = autotileSmoothField(rawUPos * 0.28 + vec2(17.4, -31.2)) * 46.0
            + autotileSmoothField(rawUPos * 0.78 + vec2(-23.1, 14.9)) * 18.0;
  float cwY = autotileSmoothField(rawUPos * 0.28 + vec2(-37.8, 29.5)) * 46.0
            + autotileSmoothField(rawUPos * 0.78 + vec2(19.7, -41.3)) * 18.0;
  vec2 fogWarpedPos = rawUPos + vec2(cwX, cwY);

  // Sample 7-cell neighborhood around warped position so large billowing clouds cross hex lines seamlessly!
  ivec2 centerHex = axialRound(fogWarpedPos);
  float cFogD2[7];
  uint cFogState[7];
  vec2 cPos0 = hexCenterUnproj(centerHex);
  vec2 f0v = fogWarpedPos - cPos0;
  cFogD2[0] = dot(f0v, f0v);
  cFogState[0] = fetchCell(centerHex).b;
  float minFogD2 = cFogD2[0];
  bool anyUnknown = (cFogState[0] == 0u);

  for (int i = 0; i < 6; i++) {
    ivec2 nh = centerHex + DIRS[i];
    vec2 np = hexCenterUnproj(nh);
    vec2 fv = fogWarpedPos - np;
    float fd2 = dot(fv, fv);
    uint fs = fetchCell(nh).b;
    cFogD2[i + 1] = fd2;
    cFogState[i + 1] = fs;
    if (fd2 < minFogD2) minFogD2 = fd2;
    if (fs == 0u) anyUnknown = true;
  }

  // Fast GPU early-out across open known territory
  if (!anyUnknown) discard;

  float fogTotalW = 0.0;
  float knownWeight = 0.0;
  for (int k = 0; k < 7; k++) {
    float fDelta = (cFogD2[k] - minFogD2) / (2.0 * HEX_W);
    float fw = fDelta >= 84.0 ? 0.0 : smoother5(1.0 - fDelta / 84.0);
    if (fw > 0.001) {
      fogTotalW += fw;
      if (cFogState[k] > 0u) knownWeight += fw;
    }
  }
  float normKnown = fogTotalW > 0.001 ? clamp(knownWeight / fogTotalW, 0.0, 1.0) : 0.0;
  if (normKnown > 0.992) discard;

  vec3 fogBase = vec3(0.76, 0.79, 0.84);
  float edgePuff = 0.0;
  float frontierBand = smoothstep(0.0, 0.18, normKnown) * smoothstep(1.0, 0.78, normKnown);
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
  float cloudAlpha = 1.0 - reveal;
  float cloudShadow = cloudAlpha * smoothstep(0.02, 0.42, normKnown) * 0.24;
  float outAlpha = clamp(cloudAlpha + cloudShadow * (1.0 - cloudAlpha), 0.0, 1.0);
  if (outAlpha < 0.004) discard;

  // Exact premultiplied composite: out = fogBase * cloudAlpha + dst * (1 - cloudAlpha) * (1 - cloudShadow)
  fragColor = vec4(fogBase * cloudAlpha, outAlpha);
}
`;function dn(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${i}`)}return o}var Mr=class{constructor(e){this.cellBuf=new Uint8Array(ht*ht*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.hasUnknownCells=!1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=dn(e,e.VERTEX_SHADER,_i),o=dn(e,e.FRAGMENT_SHADER,Si),i=e.createProgram();if(!i)throw new Error("Failed to create terrain program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let h=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteShader(r),e.deleteProgram(i),new Error(`Terrain program link error:
${h}`)}this.program=i;let n=dn(e,e.FRAGMENT_SHADER,Ci),a=e.createProgram();if(!a)throw e.deleteShader(r),e.deleteShader(n),new Error("Failed to create cloud overlay program");if(e.attachShader(a,r),e.attachShader(a,n),e.linkProgram(a),e.deleteShader(r),e.deleteShader(n),!e.getProgramParameter(a,e.LINK_STATUS)){let h=e.getProgramInfoLog(a)||"Unknown link error";throw e.deleteProgram(a),new Error(`Cloud overlay program link error:
${h}`)}this.cloudProgram=a;let l=e.createVertexArray();if(!l)throw new Error("Failed to create terrain VAO");this.vao=l;let c=e.createTexture();if(!c)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=c,e.bindTexture(e.TEXTURE_2D,c),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,ht,ht),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let s=e.createTexture();if(!s)throw new Error("Failed to allocate surface field texture");this.surfaceTex=s,e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let u=(h,f)=>{let m=e.getUniformLocation(h,f);if(!m)throw new Error(`Missing terrain uniform: ${f}`);return m};this.uCamCenter=u(i,"u_camCenter"),this.uViewportSize=u(i,"u_viewportSize"),this.uZoom=u(i,"u_zoom"),this.uTime=u(i,"u_time"),this.uGridOrigin=u(i,"u_gridOrigin"),this.uGridSize=u(i,"u_gridSize"),this.uForestFloorLayer=u(i,"u_forestFloorLayer"),this.uShowGrid=u(i,"u_showGrid"),this.uHoverHex=u(i,"u_hoverHex"),this.uSurfaceRect=u(i,"u_surfaceRect"),this.uEdgeBand=u(i,"u_edgeBand"),this.uWaterHexMode=u(i,"u_waterHexMode"),this.uReliefEnabled=u(i,"u_reliefEnabled"),this.uReliefLighting=u(i,"u_reliefLighting"),this.uWindEnabled=u(i,"u_windEnabled"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(i,"u_cellData"),1),e.uniform1i(e.getUniformLocation(i,"u_surfaceField"),3),this.cuCamCenter=u(a,"u_camCenter"),this.cuViewportSize=u(a,"u_viewportSize"),this.cuZoom=u(a,"u_zoom"),this.cuTime=u(a,"u_time"),this.cuGridOrigin=u(a,"u_gridOrigin"),this.cuGridSize=u(a,"u_gridSize"),this.cuHasClouds=u(a,"u_hasClouds"),this.cuHasCloudEdge=u(a,"u_hasCloudEdge"),this.cuWindEnabled=u(a,"u_windEnabled"),e.useProgram(a),e.uniform1i(e.getUniformLocation(a,"u_cellData"),1),e.uniform1i(e.getUniformLocation(a,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(a,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return jn(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:i,cellTex:n,surfaceTex:a,cellBuf:l}=this,{cam:c,assets:s,lookupHex:u,resolveTerrainLayer:h,isWaterTerrain:f,seedInt:m,dataRevision:p,timeSec:b,showGrid:_,hoverHex:A,edgeBand:D=28,waterSampling:x="hex",reliefEnabled:M=!0,reliefStrength:X=Gt,reliefLighting:w=!0,reliefStyle:y="sculpted",windAnimation:E=!0}=e,L=Dr(c,4),T=L.maxQ-L.minQ+1,H=L.maxR-L.minR+1,Q=L.minQ,N=L.minR;T>ht&&(Q=Math.floor((L.minQ+L.maxQ)/2)-Math.floor(ht/2),T=ht),H>ht&&(N=Math.floor((L.minR+L.maxR)/2)-Math.floor(ht/2),H=ht);let Y=!1;if(Q!==this.lastMinQ||N!==this.lastMinR||T!==this.lastSpanQ||H!==this.lastSpanR||p!==this.lastDataRevision){let d=0,g=!1;for(let S=0;S<H;S++){let q=N+S;for(let F=0;F<T;F++){let z=Q+F,G=u(z,q);if(!G||G.fogState===0)g=!0,l[d++]=0,l[d++]=0,l[d++]=0,l[d++]=0;else{let J=f(G.terrainId)?1:0,ge=Ct.has(G.terrainId)?2:0,Z=G.terrainId==="icy_ocean"?4:0,ve=G.terrainId==="coastal_water"||G.terrainId==="coastal_waters"||G.terrainId==="coast"?8:0;l[d++]=h(G.terrainId,z,q)&255,l[d++]=0,l[d++]=G.fogState,l[d++]=J|ge|Z|ve}}}this.hasUnknownCells=g,r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,T,H,r.RGBA_INTEGER,r.UNSIGNED_BYTE,l.subarray(0,T*H*4)),this.lastMinQ=Q,this.lastMinR=N,this.lastSpanQ=T,this.lastSpanR=H,this.lastDataRevision=p,Y=!0}let C=M?X:0,oe=c.viewportWidth*.5/c.zoom,ue=c.viewportHeight*.5/(c.zoom*De),V=c.x-oe-140,v=c.x+oe+140,W=c.y/De-ue-180,R=c.y/De+ue+220;if(!this.surfaceWin||this.lastSurfaceRevision!==p||this.lastSurfaceStrength!==C||this.lastSurfaceStyle!==y||V<this.surfaceWin.left||v>this.surfaceWin.left+this.surfaceWin.width||W<this.surfaceWin.top||R>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(v-V)*3.5){let d=Math.max(384,(v-V)*.35),g=Math.max(384,(R-W)*.35),S=V-d,q=W-g,F=v-V+d*2,z=R-W+g*2,G=Math.max(16,Math.ceil(Math.max(F/200,z/150)));this.surfaceWin=Yn({left:S,top:q,width:F,height:z,step:G,lookupHex:u,manifest:s.manifest,seedInt:m,reliefStrength:C,reliefStyle:y}),this.lastSurfaceRevision=p,this.lastSurfaceStrength=C,this.lastSurfaceStyle=y,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,a),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(i),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,s.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,a),r.uniform2f(this.uCamCenter,c.x,c.y),r.uniform2f(this.uViewportSize,c.viewportWidth,c.viewportHeight),r.uniform1f(this.uZoom,c.zoom),r.uniform1f(this.uTime,b),r.uniform2i(this.uGridOrigin,Q,N),r.uniform2i(this.uGridSize,T,H),r.uniform1i(this.uForestFloorLayer,s.forestFloorLayer),r.uniform1f(this.uShowGrid,_?1:0),r.uniform2i(this.uHoverHex,A?A.q:-999999,A?A.r:-999999);let k=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,k?k.left:0,k?k.top:0,k?k.width:1,k?k.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,D))),r.uniform1f(this.uWaterHexMode,x==="hex"?1:0),r.uniform1f(this.uReliefEnabled,M?1:0),r.uniform1f(this.uReliefLighting,w?1:0),r.uniform1f(this.uWindEnabled,E?1:0),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:T*H,uploaded:Y}}renderCloudOverlay(e){if(!this.hasUnknownCells||this.lastSpanQ<=0||this.lastSpanR<=0)return 0;let{gl:r,cloudProgram:o,vao:i,cellTex:n}=this,{cam:a,assets:l,timeSec:c,windAnimation:s=!0}=e;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(o),r.bindVertexArray(i),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,l.cloudTexture),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,l.cloudEdgeTexture??l.cloudTexture),r.uniform2f(this.cuCamCenter,a.x,a.y),r.uniform2f(this.cuViewportSize,a.viewportWidth,a.viewportHeight),r.uniform1f(this.cuZoom,a.zoom),r.uniform1f(this.cuTime,c),r.uniform2i(this.cuGridOrigin,this.lastMinQ,this.lastMinR),r.uniform2i(this.cuGridSize,this.lastSpanQ,this.lastSpanR),r.uniform1f(this.cuHasClouds,l.cloudTexture?1:0),r.uniform1f(this.cuHasCloudEdge,l.cloudEdgeTexture?1:0),r.uniform1f(this.cuWindEnabled,s?1:0),r.drawArrays(r.TRIANGLES,0,3),1}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program),this.gl.deleteProgram(this.cloudProgram)}};var go=65536,Er=6,Ri=`#version 300 es
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
`,Mi=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,Tr=class{constructor(e){this.verts=new Float32Array(go*Er);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,Ri),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,Mi),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate vector program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),a=e.createBuffer();if(!n||!a)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=a,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let l=Er*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,l,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,l,8),e.bindVertexArray(null);let c=s=>{let u=e.getUniformLocation(i,s);if(!u)throw new Error(`Missing vector uniform: ${s}`);return u};this.uCamCenter=c("u_camCenter"),this.uViewportSize=c("u_viewportSize"),this.uZoom=c("u_zoom")}pushTri(e,r,o,i,n,a,l,c,s,u){if(this.vertCount+3>go)return;let h=this.vertCount*Er,f=this.verts;f[h++]=e,f[h++]=r,f[h++]=l,f[h++]=c,f[h++]=s,f[h++]=u,f[h++]=o,f[h++]=i,f[h++]=l,f[h++]=c,f[h++]=s,f[h++]=u,f[h++]=n,f[h++]=a,f[h++]=l,f[h++]=c,f[h++]=s,f[h++]=u,this.vertCount+=3}pushSegment(e,r,o,i){let n=r.x-e.x,a=r.y-e.y,l=Math.hypot(n,a);if(l<1e-4)return;let c=-a/l*(o*.5),s=n/l*(o*.5),[u,h,f,m]=i;this.pushTri(e.x-c,e.y-s,e.x+c,e.y+s,r.x+c,r.y+s,u,h,f,m),this.pushTri(e.x-c,e.y-s,r.x+c,r.y+s,r.x-c,r.y-s,u,h,f,m)}pushDisc(e,r,o,i,n,a){let[l,c,s,u]=a;for(let h=0;h<n;h++){let f=h/n*Math.PI*2,m=(h+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(f)*o,r+Math.sin(f)*i,e+Math.cos(m)*o,r+Math.sin(m)*i,l,c,s,u)}}pushHexFill(e,r,o,i=1){let n=Ie(e,r),a=Zt(e,r),[l,c,s,u]=o;for(let h=0;h<6;h++){let f=a[h],m=a[(h+1)%6],p=n.x+(f.x-n.x)*i,b=n.y+(f.y-n.y)*i,_=n.x+(m.x-n.x)*i,A=n.y+(m.y-n.y)*i;this.pushTri(n.x,n.y,p,b,_,A,l,c,s,u)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Er)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:a}=e;if(!o)return 0;this.vertCount=0;let l=c=>a?{x:c.x,y:c.y-a(c.x,c.y/De)*De}:c;if(o.territory&&o.territory.length>0){let c=new Map;for(let f of o.territory)c.set(Fe(f.q,f.r),f.ownerId);let s=.08+n*.24,u=Math.max(7,10/Math.max(.2,r.zoom*1.1)),h=.75+n*.2;for(let f of o.territory){let m=i(f.q,f.r);if(m===0)continue;let p=m===1?.65:1,[b,_,A]=f.color;this.pushHexFill(f.q,f.r,[b,_,A,s*p],.98);for(let D=0;D<6;D++){let[x,M]=Pe[D];if(c.get(Fe(f.q+x,f.r+M))!==f.ownerId){let{a:w,b:y}=lt(f.q,f.r,D),E=Ie(f.q,f.r),L={x:w.x+(E.x-w.x)*.05,y:w.y+(E.y-w.y)*.05},T={x:y.x+(E.x-y.x)*.05,y:y.y+(E.y-y.y)*.05};this.pushSegment(L,T,u,[b,_,A,h*p])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let c=1-n*.85;for(let s of o.buildings){let u=i(s.q,s.r);if(u===0)continue;let h=(u===1?.65:1)*c,f=l(Ie(s.q,s.r)),p=s.kind==="capital"||s.kind==="settlement"||s.kind==="fortress"?106:78,b=p*.72;this.pushDisc(f.x,f.y+4,p*1.18,b*1.18,18,[.42,.36,.26,.22*h]),this.pushDisc(f.x,f.y+4,p*.88,b*.88,16,[.48,.42,.31,.36*h])}}if(o.buildPreview){let c=o.buildPreview;for(let u of c.bonusHexes)this.pushHexFill(u.q,u.r,[.22,.82,.48,.24],.92);let s=c.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(c.center.q,c.center.r,s,.96)}if(o.selectedHex){let c=Zt(o.selectedHex.q,o.selectedHex.r),s=Math.max(5,6/Math.max(.25,r.zoom));for(let u=0;u<6;u++)this.pushSegment(c[u],c[(u+1)%6],s,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:i,timeSec:n,coveredBuildingIds:a}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let l of o.buildings){let c=i(l.q,l.r);if(c===0)continue;let s=c===1?.65:1,u=Ie(l.q,l.r),[h,f,m]=l.factionColor;if(l.rangeRadius&&l.rangeRadius>0){let x=l.rangeRadius*240,M=x*.85,X=36;for(let w=0;w<X;w+=2){let y=w/X*Math.PI*2,E=(w+1)/X*Math.PI*2;this.pushSegment({x:u.x+Math.cos(y)*x,y:u.y+Math.sin(y)*M},{x:u.x+Math.cos(E)*x,y:u.y+Math.sin(E)*M},Math.max(4,3.5/Math.max(.2,r.zoom)),[h,f,m,.45*s])}}if(a?.has(l.id))continue;let p=l.kind==="capital"||l.kind==="settlement",b=l.kind==="fortress"||l.kind==="watchtower",_=p?78:b?64:52,A=p?68:b?76:42;this.pushDisc(u.x-10,u.y+8,_*1.12,_*.62,16,[.05,.07,.09,.45*s]),this.pushDisc(u.x,u.y+4,_,_*.56,6,[.34,.32,.29,.96*s]);let D=_*.68;this.pushTri(u.x-D,u.y+6,u.x+D,u.y+6,u.x+D,u.y-A*.65,.78*s,.74*s,.66*s,.98),this.pushTri(u.x-D,u.y+6,u.x+D,u.y-A*.65,u.x-D,u.y-A*.65,.66*s,.62*s,.55*s,.98),this.pushTri(u.x-D*1.18,u.y-A*.62,u.x+D*1.18,u.y-A*.62,u.x,u.y-A*1.25,h*s,f*s,m*s,.98),(p||b)&&this.pushTri(u.x-14,u.y-A*.95,u.x+14,u.y-A*.95,u.x,u.y-A*1.55,.96*s,.8*s,.34*s,.98)}if(o.sites)for(let l of o.sites){if(i(l.q,l.r)===0)continue;let s=Ie(l.q,l.r),u=26,h=l.family==="fauna"?[.85,.58,.25,.9]:l.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(s.x,s.y-u,s.x+u,s.y,s.x,s.y+u,h[0],h[1],h[2],h[3]),this.pushTri(s.x,s.y-u,s.x,s.y+u,s.x-u,s.y,h[0]*.8,h[1]*.8,h[2]*.8,h[3])}if(o.units)for(let l of o.units){if(i(l.q,l.r)<2)continue;let[s,u,h]=l.factionColor,f=Ie(l.q,l.r);if(l.marchPath&&l.marchPath.length>=2){let m=l.marchPath.map(E=>Ie(E.q,E.r));for(let E=0;E<m.length-1;E++)this.pushSegment(m[E],m[E+1],Math.max(8,6/Math.max(.2,r.zoom)),[s,u,h,.78]);let p=m[m.length-1],b=m[m.length-2],_=p.x-b.x,A=p.y-b.y,D=Math.hypot(_,A)||1,x=_/D,M=A/D,X=p,w={x:p.x-x*28,y:p.y-M*28};this.pushTri(X.x,X.y,w.x-M*18,w.y+x*18,w.x+M*18,w.y-x*18,s,u,h,.95);let y=n*.14%1;f={x:m[0].x+(m[1].x-m[0].x)*y,y:m[0].y+(m[1].y-m[0].y)*y}}if(l.inCombat){let m=1+.22*Math.sin(n*5);this.pushDisc(f.x,f.y,56*m,44*m,20,[.98,.26,.22,.35])}this.pushDisc(f.x,f.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(f.x,f.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(f.x,f.y-16,26,26,18,[s,u,h,.98])}if(o.walls)for(let l of o.walls){if(!l.breached)continue;let c=ot(l.q1,l.r1,l.q2,l.r2);if(c<0)continue;let{mid:s}=lt(l.q1,l.r1,c),u=1+.18*Math.sin(n*4.5);this.pushDisc(s.x,s.y,32*u,24*u,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Ei=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],bo=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],Ti={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function Pi(t,e,r,o){let i=t.infrastructure.sprites,n=[];e==="stone"?(o?(n.push(`walls/stone/gates/v1/gate_dir${r}`),r===5&&n.push("walls/stone/gates/v1/gate_dir2"),n.push(`walls/stone/v7/edge_dir${r}`)):n.push(`walls/stone/v7/edge_dir${r}`),n.push(`walls/palisade/edge_dir${r}`)):(o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`));for(let a of n)if(i[a])return a;return null}function Ai(t,e,r){let o=t.infrastructure.sprites,i=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${i}`,`walls/palisade/${i}`]:[`walls/palisade/${i}`];for(let a of n)if(o[a])return a;return null}function vo(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,i,n,a]=r.boundsInSpriteWidth,l=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*l,shadowRelTop:i*l,shadowWidth:(n-o)*l,shadowHeight:(a-i)*l}}function yo(t,e,r){if(!e.length)return[];let o=[],i=new Map;for(let n of e){let a=ot(n.q1,n.r1,n.q2,n.r2);if(a<0)continue;let l=r(n.q1,n.r1),c=r(n.q2,n.r2),s=l>=c?l:c;if(s===0)continue;let{a:u,b:h,mid:f}=lt(n.q1,n.r1,a),m=Pi(t,n.kind,a,!!n.isGate);if(m){let p=t.infrastructure.sprites[m],b=m.includes("/stone/"),[_,A,D,x]=b?bo[a]:Ei[a],M=h.x-u.x,X=h.y-u.y,w=Math.hypot(M,X)||1,y=-X/w,E=M/w;(E<0||Math.abs(E)<1e-9&&y<0)&&(y=-y,E=-E);let L=b?24:16,T=y*L,H=E*L*.62,Q=Math.abs(M)>1e-6?(H-X/M*T)*.5:b?5.5:3.5,N=x;if(b){let C=bo[(a+3)%6][3];N=(x+C-X)*.5}let Y=b?"stone":"palisade";o.push({x:u.x,y:u.y,relLeft:-D,relTop:-N+Q,width:_,height:A,page:p.page,u0:p.uv[0],v0:p.uv[1],u1:p.uv[2],v1:p.uv[3],sortY:f.y,fogState:s,...vo(t,`wall_shadow:${Y}:dir${a}`)})}for(let p of[u,h]){let b=`${Math.round(p.x*10)},${Math.round(p.y*10)}`,_=i.get(b);_||(_={x:p.x,y:p.y,degree:0,hasPalisade:!1,hasStone:!1,fog:s},i.set(b,_)),_.degree++,n.kind==="palisade"&&(_.hasPalisade=!0),n.kind==="stone"&&(_.hasStone=!0),s>_.fog&&(_.fog=s)}}for(let n of i.values()){let a=n.hasStone&&!n.hasPalisade?"stone":"palisade",l=n.degree===1,c=Ai(t,a,l);if(!c)continue;let s=t.infrastructure.sprites[c],u=Ti[a],h=l?u.endW:u.cornerW,f=l?u.endH:u.cornerH;o.push({x:n.x,y:n.y,relLeft:-h*.5,relTop:-f+u.south,width:h,height:f,page:s.page,u0:s.uv[0],v0:s.uv[1],u1:s.uv[2],v1:s.uv[3],sortY:n.y+1,fogState:n.fog,...vo(t,`wall_shadow:${a}:post`)})}return o.sort((n,a)=>n.sortY-a.sortY||n.x-a.x),o}var fn={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0},Pr=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=sn(null);this.cachedWallSprites=[];this.wallCacheRevision=-1;this.cachedBridgeSprites=[];this.bridgeCacheKey="";this.cachedBuildingSprites=[];this.buildingCacheKey="";this.coveredBuildingIds=new Set;this.cachedInfraSprites=[];this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...ct,...o.forestConfig??{}},this.reliefConfig={...Et,...o.reliefConfig??{}},this.visualConfig={...fn,...o.visualConfig??{}};let i=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!i)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=i,this.terrainPass=new Mr(i),this.roadPass=new Cr(i),this.riverPass=new cr(i),this.vectorPass=new Tr(i),this.spriteBatcher=new Rr(i),this.camera=new vr(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await nn(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new Nt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await nn(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let i=this.assets;return this.assets=o,this.chunkManager=new Nt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.bridgeCacheKey="",this.buildingCacheKey="",i?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.buildingCacheKey="",this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.bridgeCacheKey="",this.buildingCacheKey=""),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheRevision=-1,this.buildingCacheKey="",this.infrastructureClearance=sn(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.buildingCacheKey="",this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.buildingCacheKey="",this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let r=0;r<e.length;r++){let o=e[r];if(o.inCombat||o.marchPath&&o.marchPath.length>=2)return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let i=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let a=this.camera.state,l=this.gl;l.viewport(0,0,l.canvas.width,l.canvas.height);let c=(e-this.startTimeMs)*.001,s=an(a.zoom),u=1-s,h=u>.02,f=this.visualConfig.windAnimation!==!1,{sprites:m,fogStates:p,decals:b,decalFogStates:_,shorelines:A,shoreFogStates:D,riverRoutes:x,chunksLoadedThisFrame:M,hasPendingChunks:X}=o.prepareVisibleFrame(a,h?2:6,h),w=(ie,j)=>{let ee=o.lookupTerrainHex(ie,j);return ee?ee.fogState:0},y=performance.now(),E=this.terrainPass.render({cam:a,assets:r,lookupHex:(ie,j)=>o.lookupTerrainHex(ie,j),resolveTerrainLayer:(ie,j,ee)=>o.resolveTerrainLayer(ie,j,ee),isWaterTerrain:ie=>o.isWaterTerrain(ie),seedInt:o.seedInt,dataRevision:o.revision,timeSec:c,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:f}),L=this.spriteBatcher.renderShorelines({cam:a,shorelines:A,fogStates:D,infraPages:r.infraPages,projectY:De}),T=(ie,j)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(ie,j):0,H=this.roadPass.render({cam:a,roads:this.dynamicScene?.roads,lookupFog:w,strategicBlend:s,sampleReliefHeight:T}),Q=this.riverPass.render({cam:a,assets:r,routes:x,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:T,lookupFog:w,lookupHex:(ie,j)=>o.lookupTerrainHex(ie,j),timeSec:c,windAnimation:f}),N=this.vectorPass.renderGroundPass({cam:a,scene:this.dynamicScene,lookupFog:w,strategicBlend:s,sampleReliefHeight:T}),Y=performance.now(),C=m,oe=p;if(!this.infrastructureClearance.isEmpty&&m.length>0){C=[],oe=[];for(let ie=0;ie<m.length;ie++){let j=m[ie];ln(j,this.infrastructureClearance)||(C.push(j),oe.push(p[ie]))}}let ue=this.dynamicScene?.customSprites;if(h&&ue&&ue.length>0){let ie=[];for(let j=0;j<C.length;j++)ie.push({sprite:C[j],fog:oe[j]});for(let j of ue){let ee=r.manifest.nature.sprites[j.spriteKey];if(!ee)continue;let me=Ie(j.q,j.r),ye=me.x+(j.offsetX??0),Le=me.y+(j.offsetY??0),Se=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(ye,Le/De)*De:0,ke=(j.worldWidthOverride??ee.worldWidth)*Rt(ee)*(j.scale??1),Ee=ke*ee.aspect,Re=r.manifest.shadows.sprites[j.spriteKey],We=j.anchorOverride??ee.anchor;ie.push({sprite:{x:ye,y:Le-Se,sortY:Le,width:ke,height:Ee,anchorX:We[0],anchorY:We[1],page:ee.page,u0:ee.uv[0],v0:ee.uv[1],u1:ee.uv[2],v1:ee.uv[3],q:j.q,r:j.r,isMountain:ee.kind==="mountain",isSnowFamily:nr(ee),shadowTier:Jr(ee,ke,Ee),selfShadeWeight:en(ee),shadowPage:Re?Re.page:-1,shadowU0:Re?Re.uv[0]:0,shadowV0:Re?Re.uv[1]:0,shadowU1:Re?Re.uv[2]:0,shadowV1:Re?Re.uv[3]:0,shadowMinX:Re?Re.boundsInSpriteWidth[0]:0,shadowMinY:Re?Re.boundsInSpriteWidth[1]:0,shadowMaxX:Re?Re.boundsInSpriteWidth[2]:0,shadowMaxY:Re?Re.boundsInSpriteWidth[3]:0},fog:w(j.q,j.r)})}ie.sort((j,ee)=>(j.sprite.sortY??j.sprite.y)-(ee.sprite.sortY??ee.sprite.y)||j.sprite.x-ee.sprite.x),C=ie.map(j=>j.sprite),oe=ie.map(j=>j.fog)}let V=this.sceneRevision*1000003+o.revision,v=!1;this.wallCacheRevision!==V&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?yo(r.manifest,this.dynamicScene.walls,w):[],this.wallCacheRevision=V,v=!0);let W=this.dynamicScene?.roads,R=this.dynamicScene?.rivers,I=!!(W&&W.length>0)&&(x.length>0||!!(R&&R.length>0)),k=I?x.map(ie=>ie.id).join(","):"",d=I?`${V}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}|${k}`:"";if(this.bridgeCacheKey!==d){if(I&&W){let ie=ao({roads:W,routes:x,manualRivers:R,lookupFog:w,isWaterHex:(j,ee)=>{let me=o.lookupTerrainHex(j,ee);return me?o.isWaterTerrain(me.terrainId):!1}});this.cachedBridgeSprites=so({manifest:r.manifest,crossings:ie,sampleReliefHeight:T})}else this.cachedBridgeSprites=[];this.bridgeCacheKey=d,v=!0}let g=this.dynamicScene?.buildings,S=!!(g&&g.length>0),q=S?`${V}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.buildingCacheKey!==q){if(S&&g){let ie=lo({manifest:r.manifest,buildings:g,lookupFog:w,sampleReliefHeight:(j,ee)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(j,ee):0});this.cachedBuildingSprites=ie.sprites,this.coveredBuildingIds=ie.coveredBuildingIds}else this.cachedBuildingSprites=[],this.coveredBuildingIds=new Set;this.buildingCacheKey=q,v=!0}if(v){let ie=[];this.cachedWallSprites.length>0&&ie.push(this.cachedWallSprites),this.cachedBridgeSprites.length>0&&ie.push(this.cachedBridgeSprites),this.cachedBuildingSprites.length>0&&ie.push(this.cachedBuildingSprites),ie.length===0?this.cachedInfraSprites=[]:ie.length===1?this.cachedInfraSprites=ie[0]:this.cachedInfraSprites=ie.flat().sort((j,ee)=>j.sortY-ee.sortY||j.x-ee.x)}let F=0;if(h&&b.length>0){let ie=b,j=_;if(!this.infrastructureClearance.isEmpty){ie=[],j=[];for(let ee=0;ee<b.length;ee++){let me=b[ee];ln(me,this.infrastructureClearance)||(ie.push(me),j.push(_[ee]))}}ie.length>0&&(F=this.spriteBatcher.renderWorldSprites({cam:a,sprites:ie,fogStates:j,naturePages:r.naturePages,detailOpacity:u,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:c,windAnimation:!1,isDecalPass:!0}).drawCalls)}let z=this.spriteBatcher.renderShadows({cam:a,sprites:C,fogStates:oe,walls:this.cachedInfraSprites,shadowPages:r.shadowPages,shadowOpacity:this.shadowOpacity,detailOpacity:u}),G=performance.now(),J=this.spriteBatcher.renderWaterSurfRings({cam:a,sprites:C,fogStates:oe,detailOpacity:u,timeSec:c,windAnimation:f}),ge=this.spriteBatcher.renderWorldSprites({cam:a,sprites:C,fogStates:oe,naturePages:r.naturePages,walls:this.cachedInfraSprites,infraPages:r.infraPages,detailOpacity:u,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:this.shadowOpacity,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:c,windAnimation:f}),Z=this.terrainPass.renderCloudOverlay({cam:a,assets:r,timeSec:c,windAnimation:f}),ve=this.vectorPass.renderTacticalPass({cam:a,scene:this.dynamicScene,lookupFog:w,timeSec:c,coveredBuildingIds:u>.35?this.coveredBuildingIds:void 0});this.overlayCanvas&&ho({canvas:this.overlayCanvas,cam:a,scene:this.dynamicScene,lookupFog:w,strategicBlend:s,timeSec:c});let Ce=performance.now();this.hasPendingStream=X||M>0;let de=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!de||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let ie=this.frameTimes.length>0?this.frameTimes.reduce((ee,me)=>ee+me,0)/this.frameTimes.length:Math.max(16.6,Ce-i),j={fps:Math.min(120,Math.round(1e3/Math.max(8,ie))),frameMs:Number((Ce-i).toFixed(2)),terrainPassMs:Number((Y-y).toFixed(2)),shadowPassMs:Number((G-Y).toFixed(2)),spritePassMs:Number((Ce-G).toFixed(2)),drawCalls:1+L.drawCalls+H+Q+N+F+z.drawCalls+J+ge.drawCalls+Z+ve,visibleHexes:E.visibleHexes,renderedSprites:ge.renderedSprites,renderedShadows:z.renderedShadows,loadedChunks:o.loadedChunkCount,mode:uo(a.zoom),strategicBlend:Number(s.toFixed(2)),vramTier:r.vramTier,zoom:Number(a.zoom.toFixed(2)),centerHex:Je(a.x,a.y)};this.options.onMetrics(j)}return de}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.roadPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.assets?.dispose(),this.assets=null}};var wo={VedrasMapEngine:Pr,createGeographyV2ChunkProvider:Qn,createSandboxScenario:ro,computeScenarioFog:oo,evaluateDecision0121BuildPreview:Xt,SANDBOX_SCENARIO_LIST:no,VIELFALT_MIX_OVERRIDES:Tt,DEFAULT_FOREST_CONFIG:ct,DEFAULT_RELIEF_CONFIG:Et,DEFAULT_VISUAL_CONFIG:fn,computeBoulderSpawnScale:dr,sizeFactor:Rt,GeographyV2:xo.default,hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:Pe,axialToWorld:Ie,worldToAxial:Je,hexDistance:tt,hexKey:Fe,hexEdgeEndpoints:lt,canonicalEdgePair:Ft,neighborDirection:ot,pickNearestHexEdge:bn}};typeof window<"u"&&(window.VedrasMapEngineLib=wo);var za=wo;})();
