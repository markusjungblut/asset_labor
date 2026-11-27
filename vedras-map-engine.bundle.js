/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var $o=Object.create;var En=Object.defineProperty;var Zo=Object.getOwnPropertyDescriptor;var Qo=Object.getOwnPropertyNames;var Jo=Object.getPrototypeOf,ei=Object.prototype.hasOwnProperty;var ti=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var ri=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Qo(e))!ei.call(t,i)&&i!==r&&En(t,i,{get:()=>e[i],enumerable:!(o=Zo(e,i))||o.enumerable});return t};var $r=(t,e,r)=>(r=t!=null?$o(Jo(t)):{},ri(e||!t||!t.__esModule?En(r,"default",{value:t,enumerable:!0}):r,t));var cr=ti((Ma,lr)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],i=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),s=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],u=[],a=(w,k=0,M=1)=>Math.min(M,Math.max(k,w)),l=(w,k)=>w+","+k;function c(w){let k=2166136261;for(let M=0;M<w.length;M++)k^=w.charCodeAt(M),k=Math.imul(k,16777619);return k>>>0}let h=Object.create(null);function f(w){let k=typeof w=="string"?w:String(w),M=h[k];return M===void 0&&(M=c(k),h[k]=M),M}function m(w,k,M,W){let E=w^Math.imul(k+32767,374761393)^Math.imul(M+65521,668265263)^W;return E=Math.imul(E^E>>>15,2246822519),E=Math.imul(E^E>>>13,3266489917),(E^E>>>16)>>>0}function p(w,k,M,W){return m(w,k,M,f(W))}let v=(w,k,M,W)=>m(w,k,M,f(W))/4294967296,g=w=>w*w*(3-2*w);function C(w,k,M){let W=k.reduce((d,[,b])=>d+M[b],0);if(W<=0)return k[0][0];let E=a(w,0,.999999999)*W;for(let[d,b]of k)if(E-=M[b],E<0)return d;return k[k.length-1][0]}let P=(w,k,M)=>w+(k-w)*M;function y(w,k,M,W,E){let d=k/W,b=M/W,_=Math.floor(d),H=Math.floor(b),q=g(d-_),K=g(b-H),X=f(E),Z=1/4294967296,le=m(w,_,H,X)*Z,$=m(w,_+1,H,X)*Z,be=m(w,_,H+1,X)*Z,ge=m(w,_+1,H+1,X)*Z;return P(P(le,$,q),P(be,ge,q),K)}function S(){return s.map(([w,k,M,W,E,d,b,_])=>({group:w,id:k,label:M,defaultValue:W,min:E,max:d,step:b,help:_}))}function G(){return Object.fromEntries(s.map(w=>[w[1],w[3]]))}function L(w){if(w!==void 0&&(typeof w!="object"||w===null||Array.isArray(w)))throw Error("Ung\xFCltige Parameterdatei.");let k=G();for(let[,M,,W,E,d]of s){if(w?.[M]===void 0)continue;let b=Number(w[M]);if(!Number.isFinite(b)||b<E||b>d)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+M);k[M]=b}if(k["relief.mountainFraction"]+k["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return k}function x(w){if(!Array.isArray(w)||!w.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let k=w.map(W=>W?.stats??W);if(k.some(W=>!W||!Number.isFinite(W.total)||W.total<=0||!Number.isFinite(W.land)||W.land<0||W.land>W.total||!W.biomes||!W.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function M(W,E,d){let b=[...new Set([...W,...k.flatMap(H=>Object.keys(H[E]))])],_=k.reduce((H,q)=>H+q[d],0);return Object.fromEntries(b.map(H=>{let q=k.map(X=>X[E][H]||0),K=q.reduce((X,Z)=>X+Z,0);return[H,{total:K,mean:K/k.length,percent:_?100*K/_:0,worldsPresent:q.filter(X=>X>0).length}]}))}return{generatorVersion:e,samples:k.length,meanHexes:k.reduce((W,E)=>W+E.total,0)/k.length,meanLand:k.reduce((W,E)=>W+E.land,0)/k.length,biomes:M(n,"biomes","land"),terrains:M(i,"terrains","total")}}function T(w){if(!w||typeof w.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(w.id)||s.some(k=>k[1]===w.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let k of["defaultValue","min","max","step"])if(!Number.isFinite(w[k]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+k);if(w.min>w.defaultValue||w.defaultValue>w.max||w.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");s.push([String(w.group||"Erweiterungen"),w.id,String(w.label||w.id),w.defaultValue,w.min,w.max,w.step,String(w.help||"")])}function D(w){if(!w||!/^extension\.[a-z0-9_.]+$/.test(w.id)||typeof w.place!="function"||u.some(k=>k.id===w.id))throw Error("Ung\xFCltige Feature-Erweiterung.");u.push(w)}function A(w,k){return o.map(([M,W])=>k.get(l(w.q+M,w.r+W))).filter(Boolean)}function F(w,k,M,W,E,d=null,b=null){if(w==="arid"){if(M>E["biomes.dryThreshold"]-E["biomes.semiDesertMargin"])return"semi_desert";let _=P(W,b===null?W:b,E["geology.aridPatchMix"]),H=a(_+(E["geology.sandBias"]-.5)*.36);return C(H,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],E)}return w==="grassland"?M<E["geology.grassSparseHumidity"]?"sparse_pasture":W<E["geology.pastureSoil"]?"pasture":"grassland":w==="cold"?d&&d.hill>E["geology.highlandSoil"]&&k>=E["biomes.coldBoundary"]-E["geology.highlandColdMargin"]?"highland":k<E["biomes.coldBoundary"]-.04?M>E["biomes.snowHumidity"]?"snowfields":"frozen_tundra":k<E["biomes.coldBoundary"]&&M>.8?"snowfields":"tundra":w==="wetland"?k>E["geology.swampWarmBoundary"]?"swamp":k<.38?"moor":M>.85?"marshland":W>E["geology.wetlandSoil"]?"moor":"marshland":w==="jungle"?"jungle":w==="savanna"?M<.33?"semi_desert":"savanna":"grassland"}function Y(w,k,M){return w<M["biomes.coldBoundary"]?"cold":k>M["biomes.wetThreshold"]?w>M["biomes.jungleWarmBoundary"]?"jungle":"wetland":k<M["biomes.dryThreshold"]&&w>M["biomes.aridWarmBoundary"]?"arid":w>M["biomes.warmBoundary"]?"savanna":k>M["biomes.wetlandBoundary"]?"wetland":"grassland"}function U(w,k,M,W){let E=Math.sqrt(W["biomes.targetHexes"]),d=W["biomes.borderWarp"]*E,b=k+d*(y(w,k,M,E*.72,"warp-a")-.5)*2,_=M+d*(y(w,k,M,E*.72,"warp-b")-.5)*2,H=Math.floor(b/E),q=Math.floor(_/E),K=1/0,X=null;for(let Z=-1;Z<=1;Z++)for(let le=-1;le<=1;le++){let $=H+le,be=q+Z,ge=($+.5+(v(w,$,be,"jit-q")-.5)*.72)*E,oe=(be+.5+(v(w,$,be,"jit-r")-.5)*.72)*E,Pe=(b-ge)*(b-ge)+(_-oe)*(_-oe);Pe<K&&(K=Pe,X={id:l($,be),x:ge,y:oe})}return X}let N=(w,k)=>Math.max(Math.abs(w.q-k.q),Math.abs(w.r-k.r),Math.abs(w.q+w.r-k.q-k.r));function R(w,k,M,W,E=()=>!0){if(M<=0)return 1/0;let d=[];for(let b=0;b<1900;b++){let _=Math.floor((v(w,b,0,"sampleQ:"+k)-.5)*6900),H=Math.floor((v(w,b,1,"sampleR:"+k)-.5)*6900);E(_,H)&&d.push(W(_,H))}return d.length?(d.sort((b,_)=>_-b),d[Math.min(d.length-1,Math.floor(a(M)*d.length))]):1/0}function B(w,k){if(typeof w!="string"||w.length<1||w.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let M=L(k),W=c(r+":"+w),E={...M,"biomes.targetHexes":Math.max(5,M["geology.scale"]*1.5)},d=new Map,b=new Map,_=new Map,H=(I,j)=>l(I,j),q=(I,j)=>a(M["climate.temperature"]+(y(W,I,j,M["climate.scale"],"temp")-.5)*2*M["climate.tempVariation"]),K=(I,j)=>a(M["climate.humidity"]+(y(W,I,j,M["climate.scale"]*.9,"wet")-.5)*2*M["climate.humidityVariation"]);function X(I,j){let ce=y(W,I,j,M["water.scale"],"sea"),ne=y(W,I,j,Math.max(3,M["water.scale"]*.45),"sea-mid"),O=y(W,I,j,Math.max(2,M["water.scale"]*.21),"shore"),V=.2+.3*M["water.coastDetail"];return(ce+ne)*.5*(1-V)+O*V}function Z(I,j){let ce=y(W,I,j,4.2,"lakes");return X(I,j)-Math.max(0,ce-.68)*M["water.lakeInfluence"]}let le=R(W,"water",M["water.fraction"],(I,j)=>-X(I,j));function $(I,j){let ce=H(I,j);if(d.has(ce))return d.get(ce);let ne=-Z(I,j)>=le;return d.set(ce,ne),ne}function be(I,j){let ce=H(I,j);if(b.has(ce))return b.get(ce);let ne=y(W,I,j,M["relief.scale"],"relief"),O=Math.max(6,M["relief.chainLength"]),V=I+(y(W,I,j,O*.58,"m-warp-q")-.5)*11,ie=j+(y(W,I,j,O*.58,"m-warp-r")-.5)*11,ae=1-Math.abs(y(W,V*.56+ie*.36,ie*1.18,O,"ridge")-.5)*2,ee=1-Math.abs(y(W,V*.34-ie*.74,V*1.08,O*1.25,"ridge-b")-.5)*2,ue=Math.max(ae,ee*.86),Ie=Math.pow(ue,3.6),pe=1-Math.abs(y(W,I*.92+j*.28,j*.96,7.5,"m-pass-a")-.5)*2,Ge=1-Math.abs(y(W,I*.28-j*.92,I*.96,8.2,"m-pass-b")-.5)*2,He=Math.max(pe,Ge),Xe=He>.82?Math.pow((He-.82)/.18,.7)*.62:0,Ze=.92-.14*a(M["relief.chainWidth"],.05,.95),nt=a(Ie*Ze+ne*(1-Ze)-Xe,0,1),yt=a(ue*.65+ne*.35,0,1),ut={mass:ne,mountain:nt,oreBelt:yt,hill:ne*.75+y(W,I,j,M["relief.scale"]*.46,"hills")*.25};return b.set(ce,ut),ut}let ge=R(W,"mountain",M["relief.mountainFraction"],(I,j)=>be(I,j).mountain,(I,j)=>!$(I,j)),oe=(I,j)=>!$(I,j)&&be(I,j).mountain>=ge,Pe=new Map,ye=(I,j)=>{let ce=H(I,j);if(Pe.has(ce))return Pe.get(ce);if(!oe(I,j))return Pe.set(ce,!1),!1;let ne=!1;for(let O=-2;O<=2&&!ne;O++){let V=Math.max(-2,-O-2),ie=Math.min(2,-O+2);for(let ae=V;ae<=ie;ae++)if(!(O===0&&ae===0)&&!oe(I+O,j+ae)){ne=!0;break}}return Pe.set(ce,ne),ne},xe=R(W,"hills",M["relief.hillFraction"],(I,j)=>be(I,j).hill,(I,j)=>!$(I,j)&&!ye(I,j)),ve=(I,j)=>!$(I,j)&&!ye(I,j)&&be(I,j).hill>=xe,we=Math.min(16,Math.max(3,Math.ceil(M["climate.coastalDecay"]*3))),Be=new Map;function _e(I,j){let ce=H(I,j);if(Be.has(ce))return Be.get(ce);if($(I,j))return Be.set(ce,0),0;let ne=we+1;e:for(let O=1;O<=we;O++)for(let V=-O;V<=O;V++){let ie=Math.max(-O,-V-O),ae=Math.min(O,-V+O);for(let ee=ie;ee<=ae;ee++)if(Math.max(Math.abs(V),Math.abs(ee),Math.abs(V+ee))===O&&$(I+V,j+ee)){ne=O;break e}}return Be.set(ce,ne),ne}let qe=new Map;function Te(I,j){let ce=H(I,j);if(_.has(ce))return _.get(ce);let ne=q(I,j),O=K(I,j),V=_e(I,j),ie=a(O+M["climate.coastalHumidity"]*Math.exp(-V/M["climate.coastalDecay"])),ae=U(W,I,j,M);qe.has(ae.id)||qe.set(ae.id,{t:q(ae.x,ae.y),h:K(ae.x,ae.y)});let ee=qe.get(ae.id),ue=M["biomes.regionClimateMix"],Ie=a(ee.t*ue+ne*(1-ue)),pe=a(ee.h*ue+ie*(1-ue)),Ge=Y(Ie,pe,M),He=y(W,I,j,M["geology.scale"],"soil"),Xe=be(I,j),Ze=(Ge==="arid"&&M["geology.aridPatchMix"]>0?U(W,I,j,E):null)?.id.split(",").map(Number),nt=Ze?v(W,Ze[0],Ze[1],"arid-patch"):null,yt={t:ne,h:ie,center:ae,family:Ge,soil:He,landRelief:Xe,aridPatch:nt,riverPotential:a(ie*.68+Xe.mass*.18+Math.min(V,15)/30)};return _.set(ce,yt),yt}function Ue(I,j){return $(I,j)?o.some(([ce,ne])=>!$(I+ce,j+ne))?"coastal_water":q(I,j)<M["water.iceTemperature"]?"icy_ocean":y(W,I,j,M["water.scale"]*.8,"storm")>1-M["water.stormChance"]?"stormy_ocean":"ocean":"land"}function Q(I){let j=(ce,ne)=>v(W,I.q,I.r,"feature:"+ce)<ne/1e3;I.surfaceClass==="land"&&I.reliefClass!=="mountain"?(j("iron",M["features.ironPer1000"])&&Te(I.q,I.r).landRelief.oreBelt>.3&&I.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(I.baseBiome)&&j("animals",M["features.animalsPer1000"])&&(I.baseBiome==="wetland"||I.baseBiome==="jungle"?I.features.push("pigs"):I.baseBiome==="savanna"||I.terrainId==="sparse_pasture"?I.features.push("horses"):I.features.push(v(W,I.q,I.r,"species")>.5?"pigs":"horses")),j("ruins",M["features.ruinsPer1000"])&&I.features.push("ruins"),j("obelisk",M["features.obelisksPer1000"])&&I.features.push("obelisk"),I.baseBiome==="arid"&&j("oasis",M["features.oasesPer1000"])&&I.features.push("oasis")):I.surfaceClass!=="land"&&j("wreck",M["features.wrecksPer1000"])&&I.features.push("wreck");for(let ce of u)ce.place({hex:I,config:M,seed:w,random:ne=>v(W,I.q,I.r,ce.id+":"+ne)})&&I.features.push(ce.id);return I}function re(I,j){let ce=Ue(I,j),ne=ce==="land",O=ne?Te(I,j):null,V=ne&&ye(I,j),ie=ne&&!V&&ve(I,j),ae=ne?O.family==="jungle"?1:O.family==="grassland"?.86:O.family==="wetland"?.76:O.family==="savanna"?.46:O.family==="cold"?.25:.08:0,ee=ne?(y(W,I,j,M["forest.patchScale"],"forest")-.5)*1.6+M["forest.coverage"]-.3+(O.h-.5)*.35:0,ue=V?0:O?.family==="jungle"?Math.max(.76,a(ee)):a(ee)*ae,Ie=V?"none":O?.family==="jungle"||ue>=M["forest.denseThreshold"]*M["forest.denseFactor"]?"dense_forest":ue>M["forest.lightThreshold"]?"light_forest":"none";return{q:I,r:j,temperature:O?.t??q(I,j),humidity:O?.h??K(I,j),regionId:O?.center.id??"",baseBiome:O?.family??null,terrainId:ne?F(O.family,O.t,O.h,O.soil,M,O.landRelief,O.aridPatch):ce,surfaceClass:ce,reliefClass:V?"mountain":ie?"hills":"flat",hillProfile:ie?["rounded","steep","chain","plateau","ridge"][Math.floor(v(W,Math.floor(I/3),Math.floor(j/3),"hill-style")*5)]:null,hillStrength:ie?a(O.landRelief.hill*M["relief.hillVariation"]+(1-M["relief.hillVariation"])*.4):0,mountainClass:V?"massif":null,forestDensity:ue,forestClass:Ie,riverPotential:O?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function fe(I,j,ce,ne){let O=M["rivers.maxLength"],V=M["rivers.minLength"],ie=O+1,ae=2*O+2,ee=(me,de)=>me>=I&&me<I+ce&&de>=j&&de<j+ne,ue=I-ae,Ie=j-ae,pe=ce+2*ae,Ge=ne+2*ae,He=new Int16Array(pe*Ge);He.fill(-1);let Xe=new Int32Array(pe*Ge),ct=new Int32Array(pe*Ge),Ze=0,nt=0;for(let me=0;me<Ge;me++){let de=Ie+me,Ce=me*pe;for(let Ee=0;Ee<pe;Ee++){let Se=ue+Ee;$(Se,de)&&(He[Ce+Ee]=0,Xe[nt]=Se,ct[nt]=de,nt++)}}for(;Ze<nt;){let me=Xe[Ze],de=ct[Ze];Ze++;let Ce=He[(de-Ie)*pe+(me-ue)];if(Ce>=O)continue;let Ee=Ce+1;for(let Se=0;Se<6;Se++){let Le=me+o[Se][0],Me=de+o[Se][1],ze=Le-ue,Ve=Me-Ie;if(ze<0||ze>=pe||Ve<0||Ve>=Ge)continue;let et=Ve*pe+ze;He[et]>=0||ye(Le,Me)||(He[et]=Ee,Xe[nt]=Le,ct[nt]=Me,nt++)}}let yt=[],ut=new Map,zr=M["rivers.sourcesPer100"]/100,Yr=f("river-source"),Kr=f("river-turn"),se=1/4294967296;function he(me,de){for(let[Ce,Ee]of[[me,de],[de,me]]){if(!ee(Ce.q,Ce.r)||$(Ce.q,Ce.r))continue;let Se=o.findIndex(([ze,Ve])=>Ce.q+ze===Ee.q&&Ce.r+Ve===Ee.r);if(Se<0)continue;let Le=H(Ce.q,Ce.r),Me=ut.get(Le);Me||(Me=[],ut.set(Le,Me)),Me.includes(Se)||Me.push(Se)}}for(let me=j-ie;me<j+ne+ie;me++)for(let de=I-ie;de<I+ce+ie;de++){if(m(W,de,me,Yr)*se>=zr||He[(me-Ie)*pe+(de-ue)]<V||$(de,me)||ye(de,me)||Te(de,me).riverPotential<.36)continue;let Ee=[{q:de,r:me}],Se={q:de,r:me};for(let Le=0;Le<O;Le++){let Me=He[(Se.r-Ie)*pe+(Se.q-ue)];if(Me<=0)break;let ze=null,Ve=1/0;for(let et=0;et<6;et++){let tt=Se.q+o[et][0],Pt=Se.r+o[et][1],rt=tt-ue,Ct=Pt-Ie;if(rt<0||rt>=pe||Ct<0||Ct>=Ge||He[Ct*pe+rt]!==Me-1)continue;let Rt=be(tt,Pt).hill*(1-M["rivers.meander"])+m(W,tt,Pt,Kr)*se*M["rivers.meander"];Rt<Ve&&(Ve=Rt,ze={q:tt,r:Pt})}if(!ze)break;Se=ze,Ee.push(Se)}if(!(!$(Se.q,Se.r)||Ee.length-1<V)&&Ee.some(Le=>ee(Le.q,Le.r))){yt.push(Ee.map(Le=>[Le.q,Le.r]));for(let Le=1;Le<Ee.length;Le++)he(Ee[Le-1],Ee[Le])}}for(let me of ut.values())me.sort((de,Ce)=>de-Ce);return{routes:yt,edgesByKey:ut}}function Fe(I,j){return Q(re(I,j))}return{c:M,s:W,spot:H,wet:$,relief:be,isMountain:ye,isHill:ve,field:Te,surface:Ue,buildBaseCell:re,attachFeatures:Q,sampleCell:Fe,traceRivers:fe}}function J(w,k={}){if(typeof w!="string"||w.length<1||w.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let M=k.width===void 0?100:Number(k.width),W=k.height===void 0?80:Number(k.height),E=k.originQ===void 0?0:Number(k.originQ),d=k.originR===void 0?0:Number(k.originR);if(!Number.isSafeInteger(M)||!Number.isSafeInteger(W)||M<10||W<10||M*W>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(E)||!Number.isSafeInteger(d)||Math.abs(E)>1e6||Math.abs(d)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let b=B(w,k.config),{c:_,s:H,spot:q,wet:K,relief:X,isMountain:Z,field:le,buildBaseCell:$,attachFeatures:be}=b,ge=[],oe=new Map;for(let O=d;O<d+W;O++)for(let V=E;V<E+M;V++){let ie=$(V,O);ge.push(ie),oe.set(q(V,O),ie)}let Pe=_["rivers.maxLength"],ye=_["rivers.minLength"],xe=Pe+1,ve=2*Pe+2,we=new Map,Be=[];for(let O=d-ve;O<d+W+ve;O++)for(let V=E-ve;V<E+M+ve;V++)K(V,O)&&(we.set(q(V,O),0),Be.push({q:V,r:O}));let _e=E-ve,qe=E+M+ve-1,Te=d-ve,Ue=d+W+ve-1;for(let O=0;O<Be.length;O++){let V=Be[O],ie=we.get(q(V.q,V.r));if(!(ie>=Pe))for(let[ae,ee]of o){let ue=V.q+ae,Ie=V.r+ee,pe=q(ue,Ie);ue<_e||ue>qe||Ie<Te||Ie>Ue||Z(ue,Ie)||we.has(pe)||(we.set(pe,ie+1),Be.push({q:ue,r:Ie}))}}let Q=[],re=[];function fe(O,V){for(let[ie,ae]of[[O,V],[V,O]]){let ee=oe.get(q(ie.q,ie.r));if(!ee||ee.surfaceClass!=="land")continue;ee.river=!0;let ue=o.findIndex(([Ie,pe])=>ie.q+Ie===ae.q&&ie.r+pe===ae.r);ue>=0&&!ee.riverEdges.includes(ue)&&ee.riverEdges.push(ue)}}for(let O=d-xe;O<d+W+xe;O++)for(let V=E-xe;V<E+M+xe;V++){if(K(V,O)||Z(V,O)||v(H,V,O,"river-source")>=_["rivers.sourcesPer100"]/100)continue;let ie=we.get(q(V,O));if(ie===void 0||ie<ye||le(V,O).riverPotential<.36)continue;let ae=[{q:V,r:O}],ee={q:V,r:O};for(let ue=0;ue<Pe;ue++){let Ie=we.get(q(ee.q,ee.r));if(Ie===0)break;let pe=o.map(([He,Xe])=>({q:ee.q+He,r:ee.r+Xe})).filter(He=>we.get(q(He.q,He.r))===Ie-1);if(!pe.length)break;let Ge=He=>X(He.q,He.r).hill*(1-_["rivers.meander"])+v(H,He.q,He.r,"river-turn")*_["rivers.meander"];pe.sort((He,Xe)=>Ge(He)-Ge(Xe)),ee=pe[0],ae.push(ee)}if(!(!K(ee.q,ee.r)||ae.length-1<ye)&&ae.some(ue=>oe.has(q(ue.q,ue.r)))){re.push(ae),ae.every(ue=>oe.has(q(ue.q,ue.r)))&&Q.push(ae.map(ue=>[ue.q,ue.r]));for(let ue=1;ue<ae.length;ue++)fe(ae[ue-1],ae[ue])}}for(let O of ge)be(O),O.riverEdges.sort((V,ie)=>V-ie);let Fe=ge.filter(O=>O.surfaceClass==="land").length,I={total:ge.length,land:Fe,water:ge.length-Fe,coast:0,hills:0,mountains:0,rivers:Q.length,riverCrossingCount:re.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},j=new Map;for(let O of ge){O.surfaceClass==="coastal_water"&&I.coast++,O.reliefClass==="hills"&&I.hills++,O.reliefClass==="mountain"&&I.mountains++,O.river&&I.riverHexes++,O.forestClass!=="none"&&I.forest++,O.baseBiome&&(I.biomes[O.baseBiome]=(I.biomes[O.baseBiome]||0)+1,j.set(O.regionId,(j.get(O.regionId)||0)+1)),O.surfaceClass==="land"&&O.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(O.baseBiome)&&I.forestEligible++,I.terrains[O.terrainId]=(I.terrains[O.terrainId]||0)+1;for(let V of O.features)I.features[V]=(I.features[V]||0)+1}I.forestPercentLand=Fe?+(100*I.forest/Fe).toFixed(1):0,I.forestPercentEligible=I.forestEligible?+(100*I.forest/I.forestEligible).toFixed(1):0;let ce=[...j.values()].sort((O,V)=>O-V);I.biomeRegions={count:ce.length,min:ce[0]||0,average:ce.length?+(Fe/ce.length).toFixed(1):0,median:ce.length?ce[Math.floor(ce.length/2)]:0,max:ce.at(-1)||0,within30to90:ce.filter(O=>O>=30&&O<=90).length};function ne(O){let V=new Set,ie=0;for(let ae of ge){let ee=q(ae.q,ae.r);if(V.has(ee)||!O(ae))continue;let ue=[ae];V.add(ee);for(let Ie=0;Ie<ue.length;Ie++)for(let pe of A(ue[Ie],oe)){let Ge=q(pe.q,pe.r);O(pe)&&!V.has(Ge)&&(V.add(Ge),ue.push(pe))}ie=Math.max(ie,ue.length)}return ie}return I.connectedLandPercent=Fe?+(100*ne(O=>O.surfaceClass==="land")/Fe).toFixed(1):0,I.largestWaterBody=ne(O=>O.surfaceClass!=="land"),{version:e,seed:w,width:M,height:W,originQ:E,originR:d,config:_,cells:ge,riverPaths:Q,riverPreviewPaths:re.map(O=>O.map(V=>[V.q,V.r])),stats:I,riverGeometry:"hex-edges"}}let z={VERSION:e,DIRS:o,TERRAIN_IDS:i,BIOME_IDS:n,parameterSchema:S,defaultConfig:G,normalizeConfig:L,aggregateDistributions:x,registerParameter:T,registerFeature:D,createPointSampler:B,generateWorld:J,getWorldCell:(w,k,M)=>{let W=w.originQ??0,E=w.originR??0;return k<W||M<E||k>=W+w.width||M>=E+w.height?null:w.cells[(M-E)*w.width+(k-W)]??null}};typeof lr<"u"&&lr.exports&&(lr.exports=z),t.VedrasGeography=z})(typeof window<"u"?window:globalThis)});var zo=$r(cr());var ni=Math.sqrt(3),Qe=256/ni,Ae=.85,Ye=1.5*Qe,An=Ye*Ae,ke=16,Re=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function We(t,e){return{x:256*(t+e*.5),y:An*e}}function je(t,e){let r=e/An,o=t/256-r*.5,i=-o-r,n=Math.round(o),s=Math.round(r),u=Math.round(i),a=Math.abs(n-o),l=Math.abs(s-r),c=Math.abs(u-i);return a>l&&a>c?n=-s-u:l>c&&(s=-n-u),{q:n===0?0:n,r:s===0?0:s}}function $e(t,e,r,o){let i=t-r,n=e-o;return(Math.abs(i)+Math.abs(i+n)+Math.abs(n))/2}function Ht(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function Gt(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function Ot(t,e,r=ke){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function St(t,e){return`${t},${e}`}function De(t,e){return`${t},${e}`}function Vt(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,i=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,s=-1/0,u=1/0,a=-1/0;for(let l of i){let c=je(l.x,l.y);c.q<n&&(n=c.q),c.q>s&&(s=c.q),c.r<u&&(u=c.r),c.r>a&&(a=c.r)}return{minQ:n-e,maxQ:s+e,minR:u-e,maxR:a+e}}function Pn(t,e=ke,r=3){let o=Vt(t,r),i=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),s=Math.floor(o.minR/e),u=Math.floor(o.maxR/e),a=je(t.x,t.y),l=a.q/e,c=a.r/e,h=[];for(let f=s;f<=u;f++)for(let m=i;m<=n;m++){let p=m+.5-l,v=f+.5-c;h.push({cq:m,cr:f,dist2:p*p+v*v})}return h.sort((f,m)=>f.dist2-m.dist2),h.map(({cq:f,cr:m})=>({cq:f,cr:m}))}function Tn(t,e,r,o=0){let i=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return i=Math.imul(i^i>>>15,2246822519)>>>0,i=Math.imul(i^i>>>13,3266489917)>>>0,(i^i>>>16)>>>0}function Zr(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function ur(t,e){let r=256*(t+e*.5),o=Ye*e,i=[];for(let n=0;n<6;n++){let s=-Math.PI/2+n*Math.PI/3;i.push({x:r+Qe*Math.cos(s),y:(o+Qe*Math.sin(s))*Ae})}return i}function dt(t,e,r){let o=ur(t,e),i=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a:i,b:n,mid:{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}}function at(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Re[s][0]===i&&Re[s][1]===n)return s;return-1}function Je(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function kn(t,e){let r=je(t,e),o=0,i=1/0;for(let l=0;l<6;l++){let{mid:c}=dt(r.q,r.r,l),h=t-c.x,f=e-c.y,m=h*h+f*f;m<i&&(i=m,o=l)}let[n,s]=Re[o],u=Je(r.q,r.r,r.q+n,r.r+s),a=at(u.q1,u.r1,u.q2,u.r2);return{q1:u.q1,r1:u.r1,q2:u.q2,r2:u.r2,dir:a}}var ft={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},fr=new Set(["dead_trees","snow_dead_trees"]),Jr=new Set(["fallen_logs","snow_fallen_logs"]),oi=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),ii=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),dr=new Set(["snowfields","frozen_tundra","tundra","highland"]);var Wn=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),In=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),Mt=new Set(["snowfields","frozen_tundra"]),Nt=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),en=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),Dn=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),ai=new Set([...Dn,"savanna","jungle"]);function ot(t,e,r){return t<e?e:t>r?r:t}function te(t,e,r,o=0,i=97,n=513,s=11){let u=(t|0)^Math.imul(e+i,374761393)^Math.imul(r+n,668265263)^Math.imul(o+s,2246822519);return u^=u>>>13,u=Math.imul(u,1274126177),((u^u>>>16)>>>0)/4294967296}function Xt(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function si(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var zt=new Set(["ocean","coastal_water","stormy_ocean"]);function Et(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function hr(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function tn(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function rn(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function mr(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function pr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function nn(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function qn(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:en.has(t)?.14:0}function on(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*(Xt(t)?.32:.25):ii.has(t.family??"")?e:e*1.2}function gr(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"||e==="snow_mountains"}function kt(t){if(!t||t.kind==="mountain")return 1;let e=on(t),r=t.family??"",o=Yt(t)==="cacti"?1.55:1;return fr.has(r)?.58*e:Jr.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.tags?.includes("round_cactus")||/^(?:existing_)?cactus_0?[12]$/.test(t.id??"")||t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_decal"?1.05:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function Bn(t){return!!t&&t.kind==="tree"&&!fr.has(t.family??"")}function Un(t){return!!t&&oi.has(t.family??"")}function Hn(t){let e=t?.family??"";return fr.has(e)?"dead_trees":Jr.has(e)?"fallen_logs":null}function Gn(t){let e=t?.family??"";return fr.has(e)?.11:Jr.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function On(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function Vn(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function Yt(t){let e=Vn(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}var Fn=new Set(["snowfields","frozen_tundra","tundra","highland"]),li=new Set(["highland","tundra","grassland","pasture","sparse_pasture","forest_floor","moor","marshland","swamp"]),Nn=new Set(["desert","sandy_desert","rocky_desert","sandy_rocky_desert","clay_desert","badlands","sandy_badlands","rocky_badlands","semi_desert","wasteland","savanna","dry_ground"]),ci=new Set([...Dn,"forest_floor","highland","jungle",...Nn]);function Xn(t){if(!t||t.kind!=="mountain")return!1;let e=String(t.id??"");if(t.family==="snow_mountains"||/^snow_mountain_\d+$/.test(e)||/^(?:existing_)?berg_(?:0?[1-9]|1[0-6])$/.test(e))return!0;let r=t.tags??[];return r.includes("arctic_snow_mountain")||r.includes("alpine_snow_mountain")||r.includes("snow_tipped_mountain")}function Kt(t){let e=String(t.id??""),r=Vn(t);return Et(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?zt:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||pr(t)?en:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?dr:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?Wn:si(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?dr:Xt(t)?Wn:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?ai:/^snow_mountain_\d+$/.test(e)||t.family==="snow_mountains"||/^(?:existing_)?berg_(?:1[4-6])$/.test(e)||/^(?:existing_)?berg_0?[1-4]$/.test(e)?Fn:/^(?:existing_)?berg_(?:0?[5-9]|1[0-3])$/.test(e)?li:/^desert_mountain_\d+$/.test(e)||t.family==="desert_mountains"?Nn:/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?ci:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function zn(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,i=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),s=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),u=new Set;for(let[a,l]of Object.entries(e.terrain.byType))s.has(a)||(l.categoryId&&i.has(l.categoryId)||n.has(a))&&u.add(a);return u}function Qr(t,e,r,o,i,n=!1){if(!e)return!1;let s=o.terrain.byType[e];if(Et(t))return zt.has(e);if(s&&s.materialClass!=="ground")return!1;let a=i?i.ecoFamily:Yt(t),l=e,c=i?i.strict:Kt(t);if(c)return c.has(l);let h=n||r.some(v=>{let g=o.terrain.byType[v]?.materialClass;return g==="water"||g==="shoreline"}),f=r.some(v=>v==="jungle"||v==="savanna"),m=r.some(v=>v==="moor"||v==="swamp"||v==="marshland");if(a==="mangroves")return(l==="swamp"||l==="marshland")&&(h||f);if(a==="palms")return l==="jungle"||l==="savanna"||l==="tropical_coast"||Nt.has(l);if(a==="jungle_trees"||a==="tropical_bushes")return l==="jungle";if(a==="savanna_trees")return l==="savanna"||l==="semi_desert"||nn(t)&&Nt.has(l);if(a==="cacti")return l==="rocky_desert"||l==="sandy_desert"||l==="clay_desert"||l==="desert"||l==="semi_desert"||l==="sandy_rocky_desert"||l==="savanna";if(a==="succulents")return l==="savanna"||l==="semi_desert"||l==="rocky_desert"||l==="sandy_desert"||l==="sandy_rocky_desert"||l==="badlands"||l==="desert";if(a==="ferns")return l==="forest_floor"||l==="grassland"||l==="pasture"||l==="moor"||l==="swamp"||l==="marshland"||l==="jungle";if(a==="reeds")return l==="moor"||l==="swamp"||l==="marshland"||(l==="grassland"||l==="pasture"||l==="sparse_pasture")&&(h||m);if(a==="cold_bushes")return l==="tundra"||l==="frozen_tundra"||l==="highland";if(a==="snow_conifers"||a==="snow_dead_trees"||a==="snow_deadwood"||a==="snow_fallen_logs")return dr.has(l);if(a==="riparian_trees")return l==="moor"||l==="swamp"||l==="marshland"||(l==="grassland"||l==="pasture")&&(h||m);let p=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(l==="snowfields"||l==="frozen_tundra")&&!p?!1:a==="dry_patches"?en.has(l):tn(t)?!(l==="jungle"||l==="moor"||l==="swamp"||l==="marshland"||l==="snowfields"||l==="frozen_tundra"):a==="dry_bushes"?!(l==="jungle"||l==="moor"||l==="swamp"||l==="marshland"||l==="tundra"||l==="highland"):a==="herbs"?!(l==="jungle"||l==="swamp"||l==="marshland"||l==="ocean"||l==="snowfields"||l==="frozen_tundra"):a==="flowering_bushes"||a==="temperate_bushes"||a==="heath"?!(l==="jungle"||l==="rocky_desert"||l==="sandy_desert"||l==="clay_desert"):!0}function Yn(t,e,r,o,i){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,s=r.biome||n;if(Et(t))return zt.has(n)&&e.has(n);if(Xt(t)&&(n==="jungle"||s==="jungle"))return!1;let u=o.terrain.byType[n],a=o.terrain.byType[s];if(u?.materialClass!=="ground"||a?.materialClass!=="ground")return!1;let l=i?i.strict:Kt(t);if(l){if(!l.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let c=n==="jungle"||n==="savanna",h=r.forestClass==="light_forest"||r.forestClass==="dense_forest",f=i?i.ecoFamily:Yt(t),m=s==="jungle",p=n==="moor"||n==="swamp"||n==="marshland";if(m&&!c||t.family==="palms"&&(!(c||Nt.has(n))||p||dr.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!m||h&&(f==="cacti"||f==="succulents"||f==="dry_bushes")||!(e.has(s)||e.has(n)||h&&e.has("forest_floor")&&t.family!=="palms"))return!1;let g=!!r.hasRiverEdge;return l?Qr(t,n,r.neighborTypes,o,i,g):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!Qr(t,n,r.neighborTypes,o,i,g)?!1:Qr(t,s,r.neighborTypes,o,i,g)}function Kn(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let i=o.terrain.byType[r];if(!i||i.materialClass!=="ground")return!1;let n=Kt(t);return n&&!n.has(r)?!1:e.has(r)}function ui(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function Ln(t,e,r){let o=e/3,i=r/3,n=Math.floor(o),s=Math.floor(i),u=o-n,a=i-s,l=u*u*(3-2*u),c=a*a*(3-2*a),h=te(t,n,s,2301,8191,4093,17),f=te(t,n+1,s,2301,8191,4093,17),m=te(t,n,s+1,2301,8191,4093,17),p=te(t,n+1,s+1,2301,8191,4093,17);return 2*((h+(f-h)*l)*(1-c)+(m+(p-m)*l)*c)-1}function jn(t,e,r,o){let i=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:ft.mode,s=ot(o?.canopyCover??ft.canopyCover,.35,.98),u=ot(o?.canopyVariation??ft.canopyVariation,0,.3),a=ot(o?.gladeRate??ft.gladeRate,0,.3),l=ot(o?.edgeStrength??ft.edgeStrength,0,1);for(let c of t){let h=De(c.q,c.r),f=c.terrainId==="jungle",m=ui(c.terrainId,e),p=ot(c.forestDensity||0,0,1),v,g;if(f){let C=.5+.5*Ln(r+137,c.q,c.r),P=.5+.5*Math.sin(c.q*.62-c.r*.44+r%71)*Math.cos(c.q*.37+c.r*.71),y=ot(.46+.42*C+.14*P,.36,.98),S=p>.01?ot(p*(.68+.34*y),.32,.98):y;v=S>=.62?"dense_forest":"light_forest",g=S}else v=c.forestClass??(c.forestDensity>=.65?"dense_forest":c.forestDensity>.08?"light_forest":"none"),g=v==="none"?0:p>.01?p:v==="dense_forest"?1:.44;i.set(h,{q:c.q,r:c.r,key:h,baseBiome:c.terrainId,biome:f?"jungle":c.terrainId,jungle:f,suitability:m,forestMode:n,forestClass:m>0?v:"none",baseDensity:m>0?g:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let c of i.values()){if(!c.suitability)continue;let h=0;for(let[f,m]of Re){let p=i.get(De(c.q+f,c.r+m));p&&p.baseDensity>h&&(h=p.baseDensity)}c.edgeInfluence=ot(h*(c.baseDensity?.18:.48)*l*c.suitability,0,.46),c.density=ot(c.baseDensity+c.edgeInfluence,0,1)}if(n==="canopy"&&a>0){let c=ot(a*.55,0,.19),h=[];for(let f of i.values()){if(f.forestClass!=="dense_forest")continue;let m=0;for(let[C,P]of Re)i.get(De(f.q+C,f.r+P))?.forestClass==="dense_forest"&&m++;if(m<2)continue;let p=te(r,f.q,f.r,1864,8191,4093,17),v=f.jungle?c*.62:c;if(p>=v)continue;let g=!1;for(let C=-2;C<=2&&!g;C++)for(let P=-2;P<=2;P++){if(P===0&&C===0||Math.abs(P+C)>2)continue;let y=i.get(De(f.q+P,f.r+C));if(!(!y||y.forestClass!=="dense_forest")&&te(r,y.q,y.r,1864,8191,4093,17)<p){g=!0;break}}g||h.push(f)}for(let f of h){f.glade=!0;let m=f.jungle?.45:.84;if(te(r,f.q,f.r,1954,8191,4093,17)<m){let p=null,v=1/0;for(let[g,C]of Re){let P=i.get(De(f.q+g,f.r+C));if(!P||P.forestClass!=="dense_forest"||P.jungle!==f.jungle)continue;let y=te(r,P.q,P.r,1953,8191,4093,17);y<v&&(v=y,p=P)}p&&(p.glade=!0)}}}for(let c of i.values()){if(!c.suitability)continue;if(c.glade){c.gladeX=Math.round((te(r,c.q,c.r,2041,8191,4093,17)-.5)*52),c.gladeY=Math.round((te(r,c.q,c.r,2042,8191,4093,17)-.5)*40);let p=c.jungle?46:58;c.gladeRadius=p+Math.round(te(r,c.q,c.r,2043,8191,4093,17)*18)}let h=c.forestClass==="dense_forest"?1:c.forestClass==="light_forest"?c.jungle?.62:.49:c.edgeInfluence>.08?.17:0,f=Ln(r,c.q,c.r),m=ot(s+u*f,.12,.98);c.canopyCoverage=ot(m*h*(.58+.42*c.density)*c.suitability*(c.glade?c.jungle?.34:.24:1),0,.98)}return i}function $n(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function Zn(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function an(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,i=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return i*i+n*n<.94*.94}function Qn(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function jt(t,e,r,o){let i=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*te(t,e,r,i,173,311,79);for(let[s,u]of Re)n+=.5/6*te(t,e+s,r+u,i,173,311,79);return ot(1+(n-.5)*1.5,.6,1.4)}function Jn(t,e,r,o,i,n){let u=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,a=(te(t,e,r,u,173,311,79)-.5)*154,l=(te(t,e,r,u+1,173,311,79)-.5)*146,c=te(t,e,r,i*127+n*2+17,173,311,79),h=te(t,e,r,i*127+n*2+18,173,311,79),f=(c-.5)*242,m=(h-.5)*258,p=n>=26?0:o==="tree"?.43:.68,v=o==="tree"?170:126,g=a+(c-.5)*v,C=l+(h-.5)*v;return{dx:f*(1-p)+g*p,dy:m*(1-p)+C*p}}function br(t,e,r=0){let o=Math.abs(t),i=Math.abs(e);return i<=Qe-r&&o<=Math.min(128,Math.sqrt(3)*(Qe-i))-r}function eo(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:te(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var yr=128,Zt=78,Ft={enabled:!0,strength:Zt,lighting:!0,style:"sculpted"},ln=168,cn=127,$t=ln+cn;function mt(t,e,r){return t<e?e:t>r?r:t}function Wt(t){let e=mt(t,0,1);return e*e*(3-2*e)}function to(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function vr(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function sn(t,e,r){let o=Math.floor(t),i=Math.floor(e),n=t-o,s=e-i,u=n*n*n*(n*(n*6-15)+10),a=s*s*s*(s*(s*6-15)+10),l=vr(o,i,r),c=vr(o+1,i,r),h=vr(o,i+1,r),f=vr(o+1,i+1,r);return(l+(c-l)*u)*(1-a)+(h+(f-h)*u)*a}function di(t,e,r){let o=sn(t/380,e/380,r^324508639),i=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,s=sn(i,n,r^610839777),u=(t*.3255682-e*.9455186)/105,a=(t*.9455186+e*.3255682)/105,l=sn(u,a,r^916255320);return{plainSwell:o*.78+s*.22,ridgeDetail:o*.34+s*.46+l*.2}}function ro(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function fi(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let i=r?.categoryId??"";return(i==="wetlands"?.3:i==="cold_regions"?.25:i==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function no(t,e,r,o=Zt,i="sculpted"){let n=[],s=[];for(let a=0;a<t.length;a++){let l=t[a],c=256*(l.q+l.r*.5),h=Ye*l.r;if(ro(l,e)){s.push({x:c,y:h});continue}if(l.reliefClass!=="hills")continue;let f=mt(l.hillStrength??.7,0,1);if(f<=0)continue;let m=(Math.imul(l.q,73856093)^Math.imul(l.r,19349663)^r)>>>0,p=(to(m)-.5)*1.7,v=l.hillProfile||"rounded",g=v==="ridge"||v==="chain"?560:440;n.push({x:c,y:h,ca:Math.cos(p),sa:Math.sin(p),shape:v,weight:.42+.58*f,reach:g})}let u=o>0?i==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:s,strengthPct:o,heightGain:u,seedInt:r,style:i}}function oo(t,e,r){let o=e*t.ca+r*t.sa,i=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(i/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(i/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,i/158),3.1)):t.shape==="plateau"?1-Wt((Math.hypot(o/188,i/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(i/180)**2))}function io(t,e,r,o,i,n,s,u){if(n<=0||e<=.004)return 0;if(u==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:a,ridgeDetail:l}=di(r,o,s),c=Math.max(0,a-.38)*14*(i/100)*e;if(t<=1e-4)return c;let h=1-Math.exp(-t*.76),f=n*h*(.76+.42*l)*e;return Math.min(yr,f+c*.55)}function ao(t,e,r){if(t.heightGain<=0)return 0;let o=0,i=t.waters,n=$t*$t;for(let l=0;l<i.length;l++){let c=i[l],h=e-c.x,f=r-c.y;if(Math.abs(h)>$t||Math.abs(f)>$t)continue;let m=h*h+f*f;if(m<n){let p=1-Wt((Math.sqrt(m)-ln)/cn);p>o&&(o=p)}}let s=1-o;if(s<=.004)return 0;let u=0,a=t.hills;for(let l=0;l<a.length;l++){let c=a[l],h=e-c.x,f=r-c.y;Math.abs(h)>c.reach||Math.abs(f)>c.reach||(u+=oo(c,h,f)*c.weight)}return io(u,s,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function so(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),i=t.width/(r-1),n=t.height/(o-1),s=1/i,u=1/n,a=r*o,l=new Float32Array(a),c=new Float32Array(a),h=new Float32Array(a),f=new Float32Array(a),m=new Float32Array(a),p=new Float32Array(a),v=new Float32Array(a),g=520,C=Math.floor((t.top-g)/Ye)-2,P=Math.ceil((t.top+t.height+g)/Ye)+2,y=t.reliefStyle??"sculpted",S=t.reliefStrength??Zt,G=S>0?y==="sculpted"?112*(S/100):67*(S/100)*1.2:0,L=(D,A,F,Y,U,N)=>{let R=Math.max(0,Math.floor((A-N-t.left)*s)),B=Math.min(r-1,Math.ceil((A+N-t.left)*s)),J=Math.max(0,Math.floor((F-N-t.top)*u)),z=Math.min(o-1,Math.ceil((F+N-t.top)*u)),w=N*N;for(let k=J;k<=z;k++){let M=t.top+k*n-F,W=M*M,E=k*r;for(let d=R;d<=B;d++){let b=t.left+d*i-A,_=b*b+W;if(_>=w)continue;let H=1-Wt((Math.sqrt(_)-Y)/U);H>D[E+d]&&(D[E+d]=H)}}};for(let D=C;D<=P;D++){let A=Math.floor((t.left-g)/256-D*.5)-2,F=Math.ceil((t.left+t.width+g)/256-D*.5)+2;for(let Y=A;Y<=F;Y++){let U=t.lookupHex(Y,D);if(!U||U.fogState===0)continue;let N=256*(Y+D*.5),R=Ye*D;if(ro(U,t.manifest)){L(h,N,R,ln,cn,$t),L(f,N,R,108,48,160);continue}if((U.terrainId==="snowfields"||U.terrainId==="frozen_tundra"||U.terrainId==="jungle")&&L(f,N,R,108,48,160),G>0&&U.reliefClass==="hills"){let z=mt(U.hillStrength??.7,0,1);if(z>0){let w=(Math.imul(Y,73856093)^Math.imul(D,19349663)^t.seedInt)>>>0,k=(to(w)-.5)*1.7,M=U.hillProfile||"rounded",W=M==="ridge"||M==="chain"?560:440,E={x:N,y:R,ca:Math.cos(k),sa:Math.sin(k),shape:M,weight:.42+.58*z,reach:W},d=Math.max(0,Math.floor((N-W-t.left)*s)),b=Math.min(r-1,Math.ceil((N+W-t.left)*s)),_=Math.max(0,Math.floor((R-W-t.top)*u)),H=Math.min(o-1,Math.ceil((R+W-t.top)*u));for(let q=_;q<=H;q++){let K=t.top+q*n-R,X=q*r;for(let Z=d;Z<=b;Z++){let le=t.left+Z*i-N,$=oo(E,le,K);$>1e-4&&(l[X+Z]+=$*E.weight)}}}}let J=fi(U,t.manifest);if(J>.01){let w=Math.max(0,Math.floor((N-172-t.left)*s)),k=Math.min(r-1,Math.ceil((N+172-t.left)*s)),M=Math.max(0,Math.floor((R-172-t.top)*u)),W=Math.min(o-1,Math.ceil((R+172-t.top)*u)),E=29584;for(let d=M;d<=W;d++){let b=t.top+d*n-R,_=b*b,H=d*r;for(let q=w;q<=k;q++){let K=t.left+q*i-N,X=K*K+_;if(X>=E)continue;let Z=1-Wt((Math.sqrt(X)-110)/56);if(Z>0){let le=H+q,$=m[le]+Z*1.15;m[le]=$>1?1:$,J>p[le]&&(p[le]=J)}}}if(U.glade){let d=N+(U.gladeX??0),b=R+(U.gladeY??0),_=U.gladeRadius??64,H=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[q,K,X]of H){let Z=d+_*q,le=b+_*K,$=_*X,be=$*$,ge=Math.max(0,Math.floor((Z-$-t.left)*s)),oe=Math.min(r-1,Math.ceil((Z+$-t.left)*s)),Pe=Math.max(0,Math.floor((le-$-t.top)*u)),ye=Math.min(o-1,Math.ceil((le+$-t.top)*u));for(let xe=Pe;xe<=ye;xe++){let ve=t.top+xe*n-le,we=ve*ve,Be=xe*r;for(let _e=ge;_e<=oe;_e++){let qe=t.left+_e*i-Z,Te=qe*qe+we;if(Te>=be)continue;let Ue=1-Wt((Math.sqrt(Te)-$*.14)/($*.86)),Q=Be+_e;Ue>v[Q]&&(v[Q]=Ue)}}}}}}}for(let D=0;D<o;D++){let A=t.top+D*n,F=D*r;for(let Y=0;Y<r;Y++){let U=F+Y,N=1-h[U];if(N<=.004||G<=0)continue;let R=t.left+Y*i;c[U]=io(l[U],N,R,A,S,G,t.seedInt,y)}}let x=new Uint8Array(a*4),T=Math.max(1,(i+n)*.5);for(let D=0;D<o;D++){let A=D>0?D-1:0,F=D<o-1?D+1:o-1,Y=Math.max(1,(F-A)*n),U=D*r;for(let N=0;N<r;N++){let R=N>0?N-1:0,B=N<r-1?N+1:r-1,J=Math.max(1,(B-R)*i),z=U+N,w=c[z],k=c[U+R],M=c[U+B],W=c[A*r+N],E=c[F*r+N],d=(M-k)/J,b=(E-W)/Y,_;if(y==="sculpted"){let X=((k+M+W+E)*.25-w)/T,Z=mt(-X*1.45,-.1,.12);_=mt(1-2.45*d-.65*b+Z,.6,1.36)}else _=mt(1-2.15*d-.48*b,.66,1.32);let H=1-f[z],q=m[z]>.01&&H>.01?Wt((m[z]-.12)/.72)*p[z]*(1-v[z]*.94)*H:0,K=z*4;x[K]=Math.round(mt(w/yr,0,1)*255),x[K+1]=Math.round(mt((_-.52)/.96,0,1)*255),x[K+2]=Math.round(mt(q,0,1)*255),x[K+3]=Math.round(mt(1-h[z],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:x,heights:c}}function lo(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),i=(r-t.top)/t.height*(t.rows-1);if(o<0||i<0||o>=t.cols-1||i>=t.rows-1)return 0;let n=Math.floor(o),s=Math.floor(i),u=o-n,a=i-s,l=s*t.cols+n,c=t.heights[l],h=t.heights[l+1],f=t.heights[l+t.cols],m=t.heights[l+t.cols+1];return(c*(1-u)+h*u)*(1-a)+(f*(1-u)+m*u)*a}var un=65536,xr=16,pt={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function hi(t){if(!t)return pt.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?pt.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?pt.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?pt.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?pt.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?pt.forest:r==="hills"?pt.rock:pt.earth}var mi=`#version 300 es
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
`,pi=`#version 300 es
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
`;function Jt(t,e){return{x:256*(t+e*.5),y:Ye*e}}function It(t,e){let r=Jt(t,e),o=[];for(let i=0;i<6;i++){let n=-Math.PI/2+i*Math.PI/3;o.push({x:r.x+Qe*Math.cos(n),y:r.y+Qe*Math.sin(n)})}return o}function Qt(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Re[s][0]===i&&Re[s][1]===n)return s;return-1}function gi(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function co(t,e){for(let r=0;r<6;r++)if(gi(t[r],e))return r;return-1}function Lt(t,e,r,o){let i=It(t,e),n=co(i,r),s=co(i,o);if(n<0||s<0)return[r,o];let u=(s-n+6)%6,a=(n-s+6)%6,l=u<=a?1:-1,c=Math.min(u,a),h=[];for(let f=0;f<=c;f++)h.push(i[(n+l*f+12)%6]);return h}function dn(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],i=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let u=1;u<n;u++){let a=t[u-1],l=t[u],c=t[u+1],h=l.x-a.x,f=l.y-a.y,m=c.x-l.x,p=c.y-l.y,v=Math.hypot(h,f),g=Math.hypot(m,p);if(v<1e-4||g<1e-4)continue;if((h*m+f*p)/(v*g)>.995){o.push(l);continue}let P=Math.min(v*.16,g*.16,Math.max(12,i*.85)),y={x:l.x-h/v*P,y:l.y-f/v*P},S={x:l.x+m/g*P,y:l.y+p/g*P};o.push(y);for(let G=1;G<6;G++){let L=G/6,x=1-L;o.push({x:x*x*y.x+2*x*L*l.x+L*L*S.x,y:x*x*y.y+2*x*L*l.y+L*L*S.y})}o.push(S)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let s=[];for(let u=0;u<o.length;u++)(u===0||Math.hypot(o[u].x-s[s.length-1].x,o[u].y-s[s.length-1].y)>1e-4)&&s.push(o[u]);return s}function uo(t,e){let r=je(t.x,t.y*Ae),o=Qe*1.15,i=[];for(let n=-1;n<6;n++){let s=n<0?r.q:r.q+Re[n][0],u=n<0?r.r:r.r+Re[n][1],a=Jt(s,u);Math.hypot(t.x-a.x,t.y-a.y)<=o&&e(s,u)&&i.push(a)}return i}function er(t,e=34,r){let o=t.hexes;if(!o||o.length<2)return null;let i=o.length-1,n=[];for(let R=0;R<i;R++){let[B,J]=o[R],[z,w]=o[R+1],k=Qt(B,J,z,w);if(k<0)return null;let M=It(B,J);n.push([M[k],M[(k+1)%6]])}let s=Qt(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,a=It(o[0][0],o[0][1])[u],l=n.map(()=>[1/0,1/0]),c=n.map(()=>[0,0]);for(let R=0;R<2;R++)l[0][R]=Lt(o[0][0],o[0][1],a,n[0][R]).length-1;for(let R=1;R<i;R++)for(let B=0;B<2;B++)for(let J=0;J<2;J++){let z=Lt(o[R][0],o[R][1],n[R-1][J],n[R][B]).length-1,w=l[R-1][J]+z;w<l[R][B]&&(l[R][B]=w,c[R][B]=J)}let h=new Array(i),f=l[i-1][0]<=l[i-1][1]?0:1;for(let R=i-1;R>=0;R--)h[R]=n[R][f],f=c[R][f];let m=[];for(let R=0;R<i;R++){let B=R===0?a:h[R-1],J=h[R],z=Lt(o[R][0],o[R][1],B,J);for(let w=0;w<z.length;w++)(m.length===0||Math.hypot(z[w].x-m[m.length-1].x,z[w].y-m[m.length-1].y)>1e-4)&&m.push(z[w])}if(m.length<2)return null;let p=o[i-1],v=o[i];if(Qt(p[0],p[1],v[0],v[1])<0)return null;let C=m.length-1,P=Jt(v[0],v[1]);if(r)for(let R=1;R<m.length;R++){let B=uo(m[R],r);if(B.length>0){C=R;let J=0,z=0;for(let w=0;w<B.length;w++)J+=B[w].x,z+=B[w].y;P={x:J/B.length,y:z/B.length};break}}let y=m.slice(0,C+1),S=y[y.length-1],G=P.x-S.x,L=P.y-S.y,x=Math.hypot(G,L)||1,T=G/x,D=L/x,A=Math.max(54,e*2.15),F={x:S.x+T*A,y:S.y+D*A};y.push(F);let Y=dn(y,e,!1);if(Y.length<2)return null;let U=Y.length-2,N=1/0;for(let R=0;R<Y.length;R++){let B=(Y[R].x-S.x)**2+(Y[R].y-S.y)**2;B<N&&(N=B,U=R)}return{id:t.id,points:Y,mouthCrossIdx:U,mouthCrossPos:S,mouthDirX:T,mouthDirY:D,mouthReach:A,width:e,hasMouth:!0}}function fo(t,e){let r=new Set,o=t.hexes;if(!o||o.length<2)return r;let i=o.length-1,n=[];for(let g=0;g<i;g++){let[C,P]=o[g],[y,S]=o[g+1],G=Qt(C,P,y,S);if(G<0)return r;let L=It(C,P);n.push([L[G],L[(G+1)%6]])}let s=Qt(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,a=It(o[0][0],o[0][1])[u],l=n.map(()=>[1/0,1/0]),c=n.map(()=>[0,0]);for(let g=0;g<2;g++)l[0][g]=Lt(o[0][0],o[0][1],a,n[0][g]).length-1;for(let g=1;g<i;g++)for(let C=0;C<2;C++)for(let P=0;P<2;P++){let y=Lt(o[g][0],o[g][1],n[g-1][P],n[g][C]).length-1,S=l[g-1][P]+y;S<l[g][C]&&(l[g][C]=S,c[g][C]=P)}let h=new Array(i),f=l[i-1][0]<=l[i-1][1]?0:1;for(let g=i-1;g>=0;g--)h[g]=n[g][f],f=c[g][f];let m=[];for(let g=0;g<i;g++){let C=g===0?a:h[g-1],P=h[g],y=Lt(o[g][0],o[g][1],C,P);for(let S=0;S<y.length;S++)(m.length===0||Math.hypot(y[S].x-m[m.length-1].x,y[S].y-m[m.length-1].y)>1e-4)&&m.push(y[S])}if(m.length<2)return r;let p=m.length-1;if(e){for(let g=1;g<m.length;g++)if(uo(m[g],e).length>0){p=g;break}}let v=256*.56;for(let g=0;g<p;g++){let C=(m[g].x+m[g+1].x)*.5,P=(m[g].y+m[g+1].y)*.5,y=je(C,P*Ae),S=[];for(let G=-1;G<6;G++){let L=G<0?y.q:y.q+Re[G][0],x=G<0?y.r:y.r+Re[G][1],T=Jt(L,x),D=Math.hypot(C-T.x,P-T.y);D<=v&&S.push({q:L,r:x,d:D})}if(S.sort((G,L)=>G.d-L.d),S.length>=2){let G=S[0],L=S[1],T=G.q<L.q||G.q===L.q&&G.r<=L.r?`${G.q},${G.r}|${L.q},${L.r}`:`${L.q},${L.r}|${G.q},${G.r}`;r.add(T)}}return r}function fn(t,e=34){if(!t||t.length===0)return[];let r=a=>`${Math.round(a.x*2)},${Math.round(a.y*2)}`,o=[],i=new Set,n=new Map;for(let a of t){let l=(a.dir%6+6)%6,c=It(a.q,a.r),h=c[l],f=c[(l+1)%6],m=r(h),p=r(f),v=m<p?`${m}|${p}`:`${p}|${m}`;if(i.has(v))continue;i.add(v);let g=o.length;o.push({a:h,b:f,ka:m,kb:p,used:!1});let C=n.get(m)??[];C.push(g),n.set(m,C);let P=n.get(p)??[];P.push(g),n.set(p,P)}let s=[],u=(a,l)=>{let c=o[a];c.used=!0;let h=l?[c.a,c.b]:[c.b,c.a],f=l?c.kb:c.ka;for(;;){let m=n.get(f);if(!m)break;let p=-1;for(let g of m)if(!o[g].used){p=g;break}if(p<0)break;let v=o[p];v.used=!0,v.ka===f?(h.push(v.b),f=v.kb):(h.push(v.a),f=v.ka)}return h};for(let a=0;a<2;a++)for(let l=0;l<o.length;l++)if(!o[l].used)if(a===0){let c=n.get(o[l].ka)?.length??0,h=n.get(o[l].kb)?.length??0;if(c!==1&&h!==1)continue;let f=u(l,c===1);s.push({id:`edge_${l}`,points:dn(f,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let c=u(l,!0);s.push({id:`edge_${l}`,points:dn(c,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return s}var wr=class{constructor(e){this.verts=new Float32Array(un*xr);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,mi),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,pi),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate river program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=xr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,u,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,u,48),e.bindVertexArray(null);let a=l=>{let c=e.getUniformLocation(i,l);if(!c)throw new Error(`Missing river uniform: ${l}`);return c};this.uCamCenter=a("u_camCenter"),this.uViewportSize=a("u_viewportSize"),this.uZoom=a("u_zoom"),this.uCoastalWaterLayer=a("u_coastalWaterLayer"),this.uTime=a("u_time"),this.uWindEnabled=a("u_windEnabled"),this.uPassMode=a("u_passMode"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0)}getCachedCourse(e,r=34,o){let i=`${e.id}@${r}@${o?"w":"0"}`;if(this.courseCache.has(i))return this.courseCache.get(i)??null;let n=er(e,r,o);if(this.courseCache.set(i,n),this.courseCache.size>512){let s=this.courseCache.keys().next().value;s!==void 0&&this.courseCache.delete(s)}return n}pushVertex(e,r,o,i,n,s,u,a,l,c,h,f,m){if(this.vertCount>=un)return;let p=this.vertCount*xr,v=this.verts;v[p++]=e,v[p++]=r,v[p++]=o,v[p++]=i,v[p++]=n,v[p++]=s,v[p++]=u,v[p++]=a,v[p++]=l,v[p++]=c,v[p++]=h,v[p++]=f,v[p++]=m.r,v[p++]=m.g,v[p++]=m.b,v[p++]=m.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return pt.earth;let i=je(e,r*Ae),n=0,s=0,u=0,a=0,l=0;for(let c=-1;c<6;c++){let h=c<0?i.q:i.q+Re[c][0],f=c<0?i.r:i.r+Re[c][1],m=o(h,f);if(!m)continue;let p=m.terrainId;if(p==="ocean"||p==="coastal_water"||p==="stormy_ocean"||p==="icy_ocean")continue;let v=Jt(h,f),g=Math.hypot(e-v.x,r-v.y);if(g>380)continue;let C=Math.max(0,Math.min(1,1-Math.max(0,g-35)/345)),P=C*C*(3-2*C),y=P*P,S=hi(m);s+=S.r*y,u+=S.g*y,a+=S.b*y,l+=S.rock*y,n+=y}return n<1e-4?pt.earth:{r:s/n,g:u/n,b:a/n,rock:l/n}}emitCourse(e,r,o,i,n){let s=e.points,u=s.length;if(u<2)return;let a=e.width*.5*n,l=e.mouthCrossPos??(e.hasMouth&&e.mouthCrossIdx>=0?s[e.mouthCrossIdx]:null),c=e.hasMouth?s[u-1]:null,h=l&&c?c.x-l.x:0,f=l&&c?c.y-l.y:0,m=Math.hypot(h,f)||1,p=e.mouthDirX??h/m,v=e.mouthDirY??f/m,g=Math.max(24,e.mouthReach??m),C=new Float32Array(u);for(let A=1;A<u;A++)C[A]=C[A-1]+Math.hypot(s[A].x-s[A-1].x,s[A].y-s[A-1].y);let P=Math.max(1,C[u-1]),y=new Float32Array(u),S=new Float32Array(u),G=new Float32Array(u),L=new Float32Array(u),x=new Array(u);for(let A=0;A<u;A++){let F=s[A>0?A-1:0],Y=s[A<u-1?A+1:u-1],U=Y.x-F.x,N=Y.y-F.y,R=Math.hypot(U,N)||1;y[A]=U/R,S[A]=N/R,G[A]=-N/R,L[A]=U/R,x[A]=this.sampleBankPalette(s[A].x,s[A].y,i)}let T=(A,F,Y)=>{let U=r(A,F),N=A,R=(F-U)*Ae,B=C[Y]/P,J=a*(e.hasMouth?.68+.4*B:1),z=1,w=1;if(e.hasMouth&&C[Y]<26){let E=Math.max(0,Math.min(1,C[Y]/26)),d=E*E*(3-2*E);z*=d,w*=d,J*=.58+.42*d}else if(!e.hasMouth){let E=Math.min(C[Y],P-C[Y]);if(E<18){let d=Math.max(0,Math.min(1,E/18)),b=d*d*(3-2*d);z*=b,w*=b,J*=.72+.28*b}}if(l&&e.hasMouth){let E=(A-l.x)*p+(F-l.y)*v,d=Math.max(0,Math.min(1,(E+28)/(28+g*.72))),b=d*d*(3-2*d);J*=1+.48*b;let _=Math.max(0,Math.min(1,E/g));z*=1-_*_*(3-2*_);let H=Math.max(0,Math.min(1,(E+58)/52));w*=1-H*H*(3-2*H)}let k=je(A,F*Ae),M=o(k.q,k.r);return{wx:N,wy:R,halfW:J,mouthFade:z,landFade:w,fogDim:M===0?0:M===1?.65:1}},D=34;for(let A=0;A<u-1&&!(this.vertCount+6>un);A++){let F=s[A],Y=s[A+1],U=T(F.x,F.y,A),N=T(Y.x,Y.y,A+1);if(U.fogDim===0&&N.fogDim===0)continue;let R=U.fogDim>0?U.fogDim:N.fogDim,B=N.fogDim>0?N.fogDim:U.fogDim,J=U.halfW+D*(.28+.72*U.landFade),z=N.halfW+D*(.28+.72*N.landFade),w=F.x-G[A]*J,k=F.y-L[A]*J,M=F.x+G[A]*J,W=F.y+L[A]*J,E=Y.x-G[A+1]*z,d=Y.y-L[A+1]*z,b=Y.x+G[A+1]*z,_=Y.y+L[A+1]*z,H=T(w,k,A),q=T(M,W,A),K=T(E,d,A+1),X=T(b,_,A+1);this.pushVertex(H.wx,H.wy,w,k,-J,U.halfW,H.mouthFade,H.landFade,R,C[A],y[A],S[A],x[A]),this.pushVertex(q.wx,q.wy,M,W,J,U.halfW,q.mouthFade,q.landFade,R,C[A],y[A],S[A],x[A]),this.pushVertex(X.wx,X.wy,b,_,z,N.halfW,X.mouthFade,X.landFade,B,C[A+1],y[A+1],S[A+1],x[A+1]),this.pushVertex(H.wx,H.wy,w,k,-J,U.halfW,H.mouthFade,H.landFade,R,C[A],y[A],S[A],x[A]),this.pushVertex(X.wx,X.wy,b,_,z,N.halfW,X.mouthFade,X.landFade,B,C[A+1],y[A+1],S[A+1],x[A+1]),this.pushVertex(K.wx,K.wy,E,d,-z,N.halfW,K.mouthFade,K.landFade,B,C[A+1],y[A+1],S[A+1],x[A+1])}}render(e){let{cam:r,assets:o,routes:i,manualEdges:n=[],sampleReliefHeight:s,lookupFog:u,lookupHex:a,timeSec:l,windAnimation:c=!0}=e;if(i.length===0&&n.length===0)return 0;this.vertCount=0;let h=r.zoom<.35?1+(.35-r.zoom)*1.4:1,f=a?(p,v)=>{let g=a(p,v);if(!g)return!1;let C=g.terrainId;return C==="ocean"||C==="coastal_water"||C==="stormy_ocean"||C==="icy_ocean"}:void 0;for(let p=0;p<i.length;p++){let v=this.getCachedCourse(i[p],34,f);v&&this.emitCourse(v,s,u,a,h)}if(n.length>0){let p=fn(n,34);for(let v=0;v<p.length;v++)this.emitCourse(p[v],s,u,a,h)}if(this.vertCount===0)return 0;let{gl:m}=this;return m.enable(m.BLEND),m.blendEquation(m.FUNC_ADD),m.blendFunc(m.ONE,m.ONE_MINUS_SRC_ALPHA),m.useProgram(this.program),m.bindVertexArray(this.vao),m.bindBuffer(m.ARRAY_BUFFER,this.vbo),m.bufferSubData(m.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*xr)),m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D_ARRAY,o.terrainArray),m.uniform2f(this.uCamCenter,r.x,r.y),m.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),m.uniform1f(this.uZoom,r.zoom),m.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),m.uniform1f(this.uTime,l),m.uniform1f(this.uWindEnabled,c?1:0),m.uniform1f(this.uPassMode,0),m.drawArrays(m.TRIANGLES,0,this.vertCount),m.uniform1f(this.uPassMode,1),m.drawArrays(m.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var bi=Re.map(([t,e])=>[t+e*.5,Ye*e/256]),vi=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),yi=new Set(["moor","marshland","swamp"]);function Sr(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function hn(t,e,r){return t.kind==="mountain"?3:hr(t)?0:t.kind==="tree"?r>=66?2:1:mr(t)||Et(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function mn(t){return hr(t)?0:t.kind==="mountain"?.44:mr(t)||Et(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||pr(t)||rn(t)?.3:.55}var xi=.24;function ho(t,e){if(e?.includes("terrain_tint")||e?.includes("arid_decal"))return!0;let r=t.toLowerCase();return r.includes("crack")||r.includes("fissure")}function wi(t,e,r){return ho(t,e)?r*Math.PI*2:(r*2-1)*xi}var Si=256*256*Math.sqrt(3)/2,tr=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=Zr(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...Ft,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...ft,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let i=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==i||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=Zr(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:i}=Ot(e,r,ke),n=St(o,i);this.rawCellChunks.delete(n),this.chunks.delete(n);let s=e-o*ke,u=r-i*ke,a=[0],l=[0];s<=2&&a.push(-1),s>=ke-3&&a.push(1),u<=2&&l.push(-1),u>=ke-3&&l.push(1);for(let c of a)for(let h of l)c===0&&h===0||this.chunks.delete(St(o+c,i+h));this.revision++}setHexFogState(e,r,o){let{cq:i,cr:n}=Ot(e,r,ke),s=St(i,n),u=e-i*ke,l=(r-n*ke)*ke+u,c=this.chunks.get(s)?.cells[l],h=this.rawCellChunks.get(s)?.[l],f=c??h;return!f||f.fogState===o?!1:(c&&(c.fogState=o),h&&(h.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:i}=Ot(e,r,ke),n=St(o,i),u=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!u)return;let a=e-o*ke,l=r-i*ke;if(!(a<0||a>=ke||l<0||l>=ke))return u[l*ke+a]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let i=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!i||i.layers.length===0)return 0;if(i.layers.length===1)return i.layers[0];let n=Tn(this.seedIntValue,r,o,101)%i.layers.length;return i.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let i=Pn(e,ke,2),n=0,s=0,u=[];for(let{cq:x,cr:T}of i){let D=St(x,T),A=this.chunks.get(D);A?(this.chunks.delete(D),this.chunks.set(D,A),u.push(A)):n<r?(A=this.buildChunk(x,T),this.chunks.set(D,A),n++,this.revision++,u.push(A)):s++}for(;this.chunks.size>this.maxCachedChunks;){let x=this.chunks.keys().next().value;if(x===void 0)break;this.chunks.delete(x)}let a=this.maxCachedChunks*2;for(;this.rawCellChunks.size>a;){let x=this.rawCellChunks.keys().next().value;if(x===void 0)break;this.rawCellChunks.delete(x)}let l=e.viewportWidth*.5/e.zoom+420,c=e.viewportHeight*.5/e.zoom+420,h=e.x-l,f=e.x+l,m=e.y-c,p=e.y+c,v=[],g=[],C=[],P=new Set;for(let x of u){for(let T of x.shorelines){if(T.x<h||T.x>f||T.y<m||T.y>p)continue;let D=this.lookupHex(T.q,T.r),A=D?D.fogState:0;A!==0&&(v.push(T),g.push(A))}for(let T of x.riverRoutes)P.has(T.id)||(P.add(T.id),C.push(T))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:v,shoreFogStates:g,riverRoutes:C,chunksLoadedThisFrame:n,hasPendingChunks:s>0};let y=[],S=[];for(let x of u){for(let T of x.sprites)T.x<h||T.x>f||T.y<m||T.y>p||y.push(T);for(let T of x.decals)T.x<h||T.x>f||T.y<m||T.y>p||S.push(T)}y.sort((x,T)=>(x.sortY??x.y)-(T.sortY??T.y)||x.x-T.x);let G=new Array(y.length);for(let x=0;x<y.length;x++){let T=y[x],D=this.lookupHex(T.q,T.r);G[x]=D?D.fogState:0}let L=new Array(S.length);for(let x=0;x<S.length;x++){let T=S[x],D=this.lookupHex(T.q,T.r);L[x]=D?D.fogState:0}return{sprites:y,fogStates:G,decals:S,decalFogStates:L,shorelines:v,shoreFogStates:g,riverRoutes:C,chunksLoadedThisFrame:n,hasPendingChunks:s>0}}getOrFetchRawCells(e,r){let o=St(e,r),i=this.rawCellChunks.get(o);if(i)return i;let n=e*ke,s=r*ke,u=this.provider({cq:e,cr:r,chunkSize:ke}),a=new Array(ke*ke),l=this.fogOverride;for(let c of u){let h=c.q-n,f=c.r-s;h<0||h>=ke||f<0||f>=ke||(l&&(c.fogState=l(c.q,c.r)),a[f*ke+h]=c)}return this.rawCellChunks.set(o,a),a}lookupRawHex(e,r){let{cq:o,cr:i}=Ot(e,r,ke),n=this.getOrFetchRawCells(o,i),s=e-o*ke,u=r-i*ke;return n[u*ke+s]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,i)=>o[0].localeCompare(i[0])),r=[];for(let[o,i]of e){let n=zn(i,this.manifest),s=i.worldWidth*kt(i),u=.72*s*s/Si,a=0,l=o.replace(/^assets\//,"");for(let f=0;f<l.length;f++)a=Math.imul(a,31)+l.charCodeAt(f)|0;let c=i.kind==="tree"?"tree":i.kind==="shrub"?"shrub":i.kind==="ground_cover"?"ground_cover":"other",h={key:o,entry:i,allowedTypes:n,effectiveWidth:s,crownAreaRatio:u,pathSalt:a,pre:{strict:Kt(i),ecoFamily:Yt(i)},pScale:on(i),chanceMult:Gn(i),minSpacing:i.placement?.minSpacing??28,edgeMargin:i.placement?.edgeMargin??12,pKind:c,isCanopy:Bn(i),isBoulder:mr(i),isWaterBoulder:Et(i),isWarmBoulder:Xt(i),isGroundDecal:hr(i),isDryPatch:pr(i),isAcacia:nn(i),isAccent:Un(i),isSnowFamily:gr(i),isBush20to29:tn(i),isReed:rn(i),isHerb:i.family==="herbs",accentGroup:Hn(i)};if(i.kind==="mountain")this.mountainCandidates.push(h);else if(h.isWaterBoulder)i.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(h);else if(h.isGroundDecal){if(i.artStatus!=="deprecated"&&(i.placement?.density??.25)>0&&n.size>0)for(let f of n){let m=this.decalCandidatesByTerrain.get(f);m||(m=[],this.decalCandidatesByTerrain.set(f,m)),m.push(h)}}else if(i.artStatus!=="deprecated"&&(i.placement?.density??0)>0&&(i.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(h),h.isReed&&this.reedCandidates.push(h);for(let f of n){let m=this.candidatesByTerrain.get(f);m||(m=[],this.candidatesByTerrain.set(f,m)),m.push(h)}n.has("forest_floor")&&i.family!=="palms"&&r.push(h)}}for(let o of Object.keys(this.manifest.terrain.byType)){let i=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,i);else{let n=new Set(i),s=[...i];for(let u of r)n.has(u)||(n.add(u),s.push(u));this.candidatesByTerrainForest.set(o,s)}}}createPlacedSprite(e,r,o,i,n,s,u){let a=e.entry,l=e.effectiveWidth*s,c=l*a.aspect,h=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],f=n*Ae,m=a.kind==="mountain",p=Math.round(i*3)^Math.round(n*5)|0,v=e.isGroundDecal&&ho(e.key,a.tags),C=!m&&!e.isAccent&&!e.accentGroup&&(!e.isGroundDecal||v)&&te(this.seedIntValue,r,o,p+811)<.5,P=i/(256*2.6),y=n/(256*2.6),S=Math.floor(P),G=Math.floor(y),L=P-S,x=y-G,T=L*L*(3-2*L),D=x*x*(3-2*x),A=te(this.seedIntValue,S,G,913),F=te(this.seedIntValue,S+1,G,913),Y=te(this.seedIntValue,S,G+1,913),U=te(this.seedIntValue,S+1,G+1,913),N=A+(F-A)*T+(Y+(U-Y)*T-(A+(F-A)*T))*D,R=te(this.seedIntValue,r,o,p+823),B=N*.6+R*.4,J=m||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:a.kind==="tree"?.62:a.family==="cacti"?.08:a.kind==="shrub"?.42:a.kind==="ground_cover"?.24:0;return{x:i,y:f-u*Ae,sortY:f,width:l,height:c,anchorX:a.anchor[0],anchorY:a.anchor[1],page:a.page,u0:a.uv[0],v0:a.uv[1],u1:a.uv[2],v1:a.uv[3],q:r,r:o,isMountain:m,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:C,tintHash:B,swayAmp:J,shadowTier:hn(a,l,c),selfShadeWeight:mn(a),shadowPage:h?h.page:-1,shadowU0:h?h.uv[0]:0,shadowV0:h?h.uv[1]:0,shadowU1:h?h.uv[2]:0,shadowV1:h?h.uv[3]:0,shadowMinX:h?h.boundsInSpriteWidth[0]:0,shadowMinY:h?h.boundsInSpriteWidth[1]:0,shadowMaxX:h?h.boundsInSpriteWidth[2]:0,shadowMaxY:h?h.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*ke,i=r*ke,n=this.seedIntValue,s=this.getOrFetchRawCells(e,r),u=[],a=[];for(let d=-2;d<ke+2;d++)for(let b=-2;b<ke+2;b++){let _=o+b,H=i+d,q=this.lookupRawHex(_,H);q&&(u.push(q),b>=0&&b<ke&&d>=0&&d<ke&&a.push(q))}let l=jn(u,this.manifest,n,this.forestConfig);for(let d of a){let b=l.get(De(d.q,d.r));b&&(d.forestClass=b.forestClass,d.glade=b.glade,d.gladeX=b.gladeX,d.gladeY=b.gladeY,d.gladeRadius=b.gladeRadius)}let c=[],h=this.manifest.infrastructure.sprites;for(let d of a){if(this.isWaterTerrain(d.terrainId)||Mt.has(d.terrainId))continue;let b=We(d.q,d.r);for(let _=0;_<6;_++){let[H,q]=Re[_],K=this.lookupRawHex(d.q+H,d.r+q);if(!K||!this.isWaterTerrain(K.terrainId)||K.terrainId==="icy_ocean")continue;let X=0;for(let $ of[5,1]){let[be,ge]=Re[(_+$)%6],oe=this.lookupRawHex(d.q+be,d.r+ge);oe&&(Mt.has(oe.terrainId)||oe.terrainId==="icy_ocean")&&X++}if(X>=2)continue;let Z=`shorelines/shore_v105_edge_0${_+1}`,le=h[Z];le&&c.push({x:b.x,y:b.y,q:d.q,r:d.r,side:_,alpha:X===1?.42:1,page:le.page,u0:le.uv[0],v0:le.uv[1],u1:le.uv[2],v1:le.uv[3]})}}let f=this.provider.getRiverRoutesForChunk?.(e,r,ke)??[],m=[],p=(d,b)=>{let _=this.lookupRawHex(d,b);return _?this.isWaterTerrain(_.terrainId):!1};for(let d=0;d<f.length;d++){let b=er(f[d],34,p);if(!b||b.points.length<2)continue;let _=1/0,H=-1/0,q=1/0,K=-1/0;for(let X=0;X<b.points.length;X++){let Z=b.points[X];Z.x<_&&(_=Z.x),Z.x>H&&(H=Z.x),Z.y<q&&(q=Z.y),Z.y>K&&(K=Z.y)}m.push({course:b,minX:_-90,maxX:H+90,minY:q-90,maxY:K+90})}let v=(d,b)=>{if(m.length===0)return 1/0;let _=1/0;for(let H=0;H<m.length;H++){let q=m[H];if(d<q.minX||d>q.maxX||b<q.minY||b>q.maxY)continue;let K=q.course.points;for(let X=1;X<K.length;X++){let Z=K[X-1],le=K[X],$=le.x-Z.x,be=le.y-Z.y,ge=$*$+be*be,oe=ge>1e-6?((d-Z.x)*$+(b-Z.y)*be)/ge:0;oe<0?oe=0:oe>1&&(oe=1);let Pe=d-(Z.x+oe*$),ye=b-(Z.y+oe*be),xe=Pe*Pe+ye*ye;xe<_&&(_=xe)}}return _<1/0?Math.sqrt(_):1/0},g=this.reliefConfig.enabled?this.reliefConfig.strength:0,C=this.reliefConfig.style??"sculpted",P=no(u,this.manifest,n,g,C),y=(d,b)=>ao(P,d,b),S=[],G=new Set,L=[],x=new Map,T=(d,b,_,H,q,K,X,Z)=>{S.push(this.createPlacedSprite(d,b,_,H,q,K,X));let le={x:H,y:q,pScale:d.pScale,minSpacing:d.minSpacing,visualHalfW:d.effectiveWidth*K*.5,isCanopy:d.isCanopy,isBoulder:d.isBoulder},$=De(b,_),be=x.get($);be||(be=[],x.set($,be)),be.push(le),Z.push(le)};if(this.mountainCandidates.length>0){let d=new Set(a.map(b=>De(b.q,b.r)));for(let b of u){if(b.reliefClass!=="mountain"||b.occupied)continue;let _=this.mountainCandidates.filter(oe=>Kn(oe.entry,oe.allowedTypes,b.terrainId,this.manifest)),H=this.mountainCandidates.filter(oe=>!Xn(oe.entry)),q=_.length>0?_:H.length>0?H:this.mountainCandidates,K=0;for(let oe=0;oe<q.length;oe++)K+=Math.max(.1,q[oe].entry.placement?.weight??1);let X=te(n,b.q,b.r,2002)*K,Z=q[0];for(let oe=0;oe<q.length;oe++)if(X-=Math.max(.1,q[oe].entry.placement?.weight??1),X<=0){Z=q[oe];break}let le=256*(b.q+b.r*.5),$=Ye*b.r+20,be=Math.max(72,(Z.entry.mountain?.coreRadius??.32)*Z.effectiveWidth);L.push({ux:le,uy:$,coreR2:be*be});let ge=De(b.q,b.r);if(G.add(ge),d.has(ge)){let oe=y(le,$);S.push(this.createPlacedSprite(Z,b.q,b.r,le,$,1,oe))}}}let D=a.filter(d=>!this.isWaterTerrain(d.terrainId)).length,A=On(D),F={dead_trees:0,fallen_logs:0},Y=(d,b,_,H)=>{let q=d/_,K=b/_,X=Math.floor(q),Z=Math.floor(K),le=q-X,$=K-Z,be=le*le*(3-2*le),ge=$*$*(3-2*$),oe=te(n,X,Z,H),Pe=te(n,X+1,Z,H),ye=te(n,X,Z+1,H),xe=te(n,X+1,Z+1,H),ve=oe+(Pe-oe)*be,we=ye+(xe-ye)*be;return ve+(we-ve)*ge},U=(d,b,_,H)=>te(n,b,_,H+d.pathSalt),N=(d,b,_=null)=>{if(_!==null)return _;if(d.isWaterBoulder)return Sr(b)*1.28;if(d.isBoulder)return Sr(b);let H=d.entry.scaleRange[0]??.85,q=d.entry.scaleRange[1]??1.15,K=d.entry.kind==="tree"?Math.min(H,.76):d.entry.kind==="shrub"?Math.min(H,.74):H,X=d.entry.kind==="tree"?Math.max(q,1.2):d.entry.kind==="shrub"?Math.max(q,1.22):q;return K+(X-K)*b},R=(d,b)=>{for(let _=0;_<L.length;_++){let H=L[_],q=d-H.ux,K=b-H.uy;if(q*q+K*K<H.coreR2)return!0}return!1},B=(d,b,_,H,q)=>{if(_.length===0)return!0;let K=256*.5-(q+Math.min(74,H*.72));for(let X=0;X<_.length;X++){let[Z,le]=bi[_[X]];if(d*Z+b*le>K)return!1}return!0},J=(d,b,_,H)=>{if(m.length===0||_.isWaterBoulder)return!1;let q=v(d,b);return q===1/0?!1:_.isReed?q<21:q<24+Math.min(38,H*.45)},z=(d,b,_,H,q,K,X,Z,le=null,$,be=[],ge=34)=>{let oe=d.entry,Pe=$??d.edgeMargin,ye=te(n,b.q,b.r,X*47+7),xe=N(d,ye,le),ve=d.effectiveWidth*xe*.5,we=d.pKind,Be=d.pScale,_e=d.minSpacing,qe=d.isCanopy,Te=oe.kind==="tree";for(let Ue=0;Ue<28;Ue++){let{dx:Q,dy:re}=Jn(n,b.q,b.r,we,X,Ue);if(!br(Q,re,Pe)||!B(Q,re,be,ve,ge)||Te&&an(K,Q,re))continue;let fe=_+Q,Fe=H+re;if(R(fe,Fe)||J(fe,Fe,d,ve))continue;let I=!1;for(let ce=0;ce<q.length;ce++){let ne=q[ce],O=Math.sqrt(Be*ne.pScale),V=qe&&ne.isCanopy,ie=V?Z:Math.max(.85,Z),ae=Math.max(V&&ie<.6?10:14,Math.max(_e,ne.minSpacing)*ie*O);!V&&(d.isBoulder||ne.isBoulder)&&(ae=Math.max(ae,(ve+ne.visualHalfW)*.56));let ee=fe-ne.x,ue=Fe-ne.y;if(ee*ee+ue*ue<ae*ae){I=!0;break}}if(I)continue;let j=y(fe,Fe);return T(d,b.q,b.r,fe,Fe,xe,j,q),{ux:fe,uy:Fe,scale:xe,halfW:ve}}return null},w=(d,b,_,H,q,K,X,Z,le,$,be,ge,oe,Pe,ye,xe=[],ve=34)=>{let we=ye??d.edgeMargin,Be=te(n,b.q,b.r,oe*53+13),_e=N(d,Be,$),qe=d.effectiveWidth*_e*.5,Te=d.pScale,Ue=d.minSpacing,Q=d.entry.kind==="tree",re=te(n,b.q,b.r,oe*61+19)*Math.PI*2,fe=Math.max(Z,X*.68+qe*.44),Fe=Math.max(le,fe+28);for(let I=0;I<20;I++){let j=te(n,b.q,b.r,oe*71+I*11+3),ce=te(n,b.q,b.r,oe*73+I*13+5),ne=re+I*2.3999632+(ce-.5)*.42,O=fe+(Fe-fe)*j,V=q+Math.cos(ne)*O,ie=K+Math.sin(ne)*O*.78,ae=V-_,ee=ie-H;if(!br(ae,ee,we)||!B(ae,ee,xe,qe,ve)||Q&&an(ge,ae,ee)||R(V,ie)||J(V,ie,d,qe))continue;let ue=!1;for(let pe=0;pe<be.length;pe++){let Ge=be[pe],He=Math.sqrt(Te*Ge.pScale),Xe=Math.max(10,Math.max(Ue,Ge.minSpacing)*Pe*He);(d.isBoulder||Ge.isBoulder)&&(Xe=Math.max(Xe,(qe+Ge.visualHalfW)*.56));let ct=V-Ge.x,Ze=ie-Ge.y;if(ct*ct+Ze*Ze<Xe*Xe){ue=!0;break}}if(ue)continue;let Ie=y(V,ie);return T(d,b.q,b.r,V,ie,_e,Ie,be),{ux:V,uy:ie,scale:_e,halfW:qe}}return null},k=(d,b)=>{for(let _=-2;_<=2;_++)for(let H=-2;H<=2;H++){if($e(0,0,H,_)>2)continue;let q=this.lookupRawHex(d+H,b+_);if(q&&q.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let d=this.waterBoulderCandidates;for(let b of a){if(b.occupied||!zt.has(b.terrainId)||b.terrainId!=="coastal_water"&&!k(b.q,b.r))continue;let _=.45+1.2*Y(b.q,b.r,3.2,4107),H=b.terrainId==="coastal_water"?.27:b.terrainId==="stormy_ocean"?.19:.15,q=Math.min(.48,H*_);if(te(n,b.q,b.r,4111)>=q)continue;let K=[];for(let ye=0;ye<6;ye++){let[xe,ve]=Re[ye],we=this.lookupRawHex(b.q+xe,b.r+ve);we&&!this.isWaterTerrain(we.terrainId)&&K.push(ye)}let X=256*(b.q+b.r*.5),Z=Ye*b.r,le=[];for(let ye=-1;ye<=1;ye++)for(let xe=-1;xe<=1;xe++){let ve=x.get(De(b.q+xe,b.r+ye));if(ve)for(let we=0;we<ve.length;we++)le.push(ve[we])}let $=Math.floor(te(n,b.q,b.r,4113)*d.length),be=d[$%d.length],ge=1,oe=z(be,b,X,Z,le,void 0,ge++,.85,null,20,K,30);if(!oe)continue;let Pe=te(n,b.q,b.r,4117);if(Pe<.48){let ye=Pe<.18?2:1;for(let xe=0;xe<ye;xe++){let ve=Math.floor(te(n,b.q,b.r,4121+xe*7)*d.length),we=d[ve%d.length],Be=te(n,b.q,b.r,4129+xe*11),_e=Math.max(.55,Math.min(2.35,oe.scale*(.4+.46*Be)));w(we,b,X,Z,oe.ux,oe.uy,oe.halfW,Math.max(24,oe.scale*20),Math.max(64,oe.scale*38),_e,le,void 0,ge++,.62,18,K,30)}}}}let M=this.forestConfig.mode,W=this.forestConfig.openTreeChance;for(let d of a){let b=De(d.q,d.r);if(d.occupied||G.has(b)||this.isWaterTerrain(d.terrainId))continue;let _=l.get(b);if(eo(n,d.q,d.r,_))continue;let H=[],q=[];for(let se=0;se<6;se++){let[he,me]=Re[se],de=this.lookupRawHex(d.q+he,d.r+me);de&&(H.push(de.terrainId),this.isWaterTerrain(de.terrainId)&&q.push(se))}let K=_?.forestClass??"none",X=K==="dense_forest"||K==="light_forest",Z=K==="light_forest"||!X&&(_?.edgeInfluence??0)>.1,le=!!(d.riverEdges&&d.riverEdges.length>0),$=In.has(d.terrainId),be=yi.has(d.terrainId),ge=$||d.terrainId==="semi_desert"||d.terrainId==="savanna",oe=X?this.candidatesByTerrainForest.get(d.terrainId)??this.allCandidates:this.candidatesByTerrain.get(d.terrainId)??this.allCandidates;if(oe.length===0)continue;let Pe={baseBiome:d.terrainId,biome:_?.biome??d.terrainId,forestClass:K,neighborTypes:H,hasRiverEdge:le},ye=Nt.has(d.terrainId),xe=[],ve=[],we=[],Be=[],_e=[],qe=[],Te=[],Ue=!1;for(let se=0;se<oe.length;se++){let he=oe[se],me=he.entry;Qn(me.family,_)&&Yn(me,he.allowedTypes,Pe,this.manifest,he.pre)&&(d.terrainId==="tundra"&&me.family==="snow_conifers"&&U(he,d.q,d.r,973)>=.02||(Ue=!0,he.isCanopy?ye&&(me.family==="palms"||he.isAcacia)?xe.push(he):ve.push(he):he.isBoulder?(we.push(he),he.isWarmBoulder&&Be.push(he)):he.isDryPatch?_e.push(he):me.family==="snow"?qe.push(he):Te.push(he)))}if(!Ue)continue;ve.sort((se,he)=>{let me=se.entry.placement,de=he.entry.placement,Ce=U(se,d.q,d.r,301)/Math.max(.04,(me.density??.12)*Math.min(1,me.weight??1)),Ee=U(he,d.q,d.r,301)/Math.max(.04,(de.density??.12)*Math.min(1,de.weight??1));return Ce-Ee}),Te.sort((se,he)=>U(se,d.q,d.r,302)-U(he,d.q,d.r,302));let Q=Te.filter(se=>(se.pKind==="shrub"||se.pKind==="ground_cover")&&!se.isAccent&&!se.accentGroup&&!($&&(se.isBush20to29||se.isHerb))),re=$n(_);re>1&&jt(n,d.q,d.r,"tree")<.58&&re--;let fe=Zn(_),Fe=Y(d.q,d.r,4.2,5107),I=Y(d.q,d.r,1.9,5119),j=Math.pow(Fe*.68+I*.32,1.35),ce=X?1:.14+1.76*j,ne=X?fe:Math.max(fe,10),O=M==="canopy"?K==="dense_forest"?.34:K==="light_forest"?.59:.88:M==="dense"?K==="dense_forest"?.52:K==="light_forest"?.73:1:K==="dense_forest"?.72:K==="light_forest"?.92:1,V=256*(d.q+d.r*.5),ie=Ye*d.r,ae=[];for(let se=-1;se<=1;se++)for(let he=-1;he<=1;he++){let me=x.get(De(d.q+he,d.r+se));if(me)for(let de=0;de<me.length;de++)ae.push(me[de])}let ee=0,ue=0,Ie=0,pe=1,Ge=(se,he)=>{if(X||ee>=ne)return;let me=te(n,d.q,d.r,5201+pe*17);if(he.length>0&&me<.46){let Ee=ce>1.08&&me<.2?2:1;for(let Se=0;Se<Ee&&ee<ne;Se++){let Le=Math.floor(te(n,d.q,d.r,5211+Se*7)*he.length),Me=he[Le%he.length],ze=te(n,d.q,d.r,5221+Se*9),Ve=Math.max(.5,Math.min(1.85,se.scale*(.38+.44*ze)));w(Me,d,V,ie,se.ux,se.uy,se.halfW,Math.max(20,se.halfW*.72),Math.max(52,se.halfW*1.45),Ve,ae,_,pe++,.55,void 0,q)&&ee++}}let de=ge&&_e.length>0?$?_e:[..._e,...Q]:Q,Ce=te(n,d.q,d.r,5237+pe*13);if(de.length>0&&Ce<.62){let Ee=1+Math.floor(te(n,d.q,d.r,5243)*(ce>1.05?2:1));for(let Se=0;Se<Ee&&ee<ne;Se++){let Le=Math.floor(te(n,d.q,d.r,5251+Se*11)*de.length),Me=de[Le%de.length],ze=te(n,d.q,d.r,5261+Se*7),Ve=Me.entry.scaleRange[0]??.85,et=Me.entry.scaleRange[1]??1.15,tt=(Ve+(et-Ve)*ze)*.92;w(Me,d,V,ie,se.ux,se.uy,se.halfW,Math.max(20,se.halfW*.76),Math.max(54,se.halfW*1.38+18),tt,ae,_,pe++,.5,void 0,q)&&ee++}}},Xe=Be.length>0&&te(n,d.q,d.r,1607)<.85?Be:we,ct=Xe.reduce((se,he)=>Math.max(se,he.entry.placement?.density??0),0),Ze=X?1:.72+.48*ce,nt=Math.min(.44,ct*(Be.length>0?2.5:1.15)*Ze);if(Be.length>0&&ee<ne&&te(n,d.q,d.r,1601)<nt){let se=Math.floor(te(n,d.q,d.r,1602)*Xe.length);for(let he=0;he<Xe.length;he++){let me=Xe[(se+he)%Xe.length],de=z(me,d,V,ie,ae,_,pe++,1,null,void 0,q);if(de){ee++,Ge(de,Xe);break}}}if(xe.length>0&&ee<ne&&te(n,d.q,d.r,1751)<.065*(.75+.45*ce)){let se=xe.filter(Ce=>Ce.entry.family==="palms"),he=xe.filter(Ce=>Ce.isAcacia),me=te(n,d.q,d.r,1752)<.5?[se,he]:[he,se],de=!1;for(let Ce of me){if(!Ce.length||de)continue;let Ee=Math.floor(te(n,d.q,d.r,1753)*Ce.length);for(let Se=0;Se<Ce.length;Se++){let Le=Ce[(Ee+Se)%Ce.length],Me=z(Le,d,V,ie,ae,_,pe++,1,null,void 0,q);if(Me){if(ee++,de=!0,te(n,d.q,d.r,1759)<.45){let ze=1+Math.floor(te(n,d.q,d.r,1763)*2);for(let Ve=0;Ve<ze&&ee<ne;Ve++){let et=Ce[(Ee+Ve+1)%Ce.length];w(et,d,V,ie,Me.ux,Me.uy,Me.halfW,22,56,null,ae,_,pe++,.54,void 0,q)&&ee++}}break}}}}let yt=Math.min(.58,qn(d.terrainId)*(.76+.44*ce));if(_e.length>0&&ee<ne&&te(n,d.q,d.r,1831)<yt){let se=Math.floor(te(n,d.q,d.r,1832)*_e.length);for(let he=0;he<_e.length;he++){let me=_e[(se+he)%_e.length],de=z(me,d,V,ie,ae,_,pe++,.9,null,void 0,q);if(de){ee++;let Ce=te(n,d.q,d.r,1837);if(!X&&Ce<.52&&ee<ne){let Ee=Ce<.22&&ce>.95?2:1;for(let Se=0;Se<Ee&&ee<ne;Se++){let Le=_e[(se+1+Se+Math.floor(Ce*11))%_e.length],Me=te(n,d.q,d.r,1843+Se*7),ze=Le.entry.scaleRange[0]??.8,Ve=Le.entry.scaleRange[1]??1.15,et=(ze+(Ve-ze)*Me)*(.76+.3*Me);w(Le,d,V,ie,de.ux,de.uy,de.halfW,16,44,et,ae,_,pe++,.48,void 0,q)&&ee++}}break}}}let ut=M==="canopy"&&X?_?.canopyCoverage??0:0,zr=ut?Math.max(re,fe-2):re;for(let se=0;se<zr&&ee<fe&&ve.length>0&&!(ue>=re&&(!ut||Ie>=ut));se++){let he=ve[se%Math.min(ve.length,5)],me=null;if(Z){let Ce=te(n,d.q,d.r,pe*47+7);me=N(he,Ce,null)*(.76+.16*Ce)}let de=z(he,d,V,ie,ae,_,pe++,O,me,void 0,q);de&&(ue++,ee++,Ie+=he.crownAreaRatio*de.scale*de.scale)}let Yr=Math.min(.68,W*(.62+.62*ce));if(!re&&!_?.glade&&ve.length>0&&W>0&&U(ve[0],d.q,d.r,311)<Yr&&ee<ne){let se=z(ve[0],d,V,ie,ae,_,pe++,1,null,void 0,q);if(se){ee++;let he=te(n,d.q,d.r,5301),me=W>.25?.64:.52;if(he<me){let de=1+Math.floor(te(n,d.q,d.r,5303)*3),Ce=Math.min(ve.length,4);for(let Ee=0;Ee<de&&ee<ne;Ee++){let Se=ve[(Ee+1)%Ce];w(Se,d,V,ie,se.ux,se.uy,se.halfW,24,62,null,ae,_,pe++,.52,void 0,q)&&ee++}if(Q.length>0&&ee<ne){let Ee=te(n,d.q,d.r,5311)<.55?2:1;for(let Se=0;Se<Ee&&ee<ne;Se++){let Le=Math.floor(te(n,d.q,d.r,5317+Se*7)*Q.length),Me=Q[Le%Q.length];w(Me,d,V,ie,se.ux,se.uy,se.halfW,18,48,null,ae,_,pe++,.48,void 0,q)&&ee++}}else if(we.length>0&&ee<ne&&te(n,d.q,d.r,5323)<.35){let Ee=we[Math.floor(te(n,d.q,d.r,5329)*we.length)];w(Ee,d,V,ie,se.ux,se.uy,se.halfW,20,48,.62+te(n,d.q,d.r,5333)*.45,ae,_,pe++,.52,void 0,q)&&ee++}}}}let Kr=X?1:.72+.48*ce;if(Be.length===0&&we.length>0&&ee<ne&&te(n,d.q,d.r,1601)<Math.min(.36,ct*1.15*Kr)){let se=Math.floor(te(n,d.q,d.r,1602)*we.length);for(let he=0;he<we.length;he++){let me=we[(se+he)%we.length],de=z(me,d,V,ie,ae,_,pe++,1,null,void 0,q);if(de){ee++,Ge(de,we);break}}}if(qe.length>0&&ee<ne){let se=d.terrainId==="snowfields"||d.terrainId==="frozen_tundra"?.58:d.terrainId==="highland"?.25:.14;if(te(n,d.q,d.r,1643)<se){let he=Math.floor(te(n,d.q,d.r,1644)*qe.length);for(let me=0;me<qe.length;me++){let de=qe[(he+me)%qe.length];if(z(de,d,V,ie,ae,_,pe++,O,null,void 0,q)){ee++;break}}}}if(Te.length>0&&ee<ne){let se=K==="dense_forest"?1.2:Z?1.28:.58+.62*ce,he=jt(n,d.q,d.r,"shrub"),me=jt(n,d.q,d.r,"ground_cover"),de=jt(n,d.q,d.r,"other"),Ce=!1,Ee=!1,Se=!1,Le=Te.filter(Me=>Me.isReed);for(let Me of Te){if(ee>=ne)break;let ze=Me.entry,Ve=Me.accentGroup;if(Ve&&(Ce||F[Ve]>=A[Ve]))continue;let et=Me.pKind==="shrub"?he:Me.pKind==="ground_cover"?me:de,tt=1;Me.isBush20to29?$?tt=.022:d.terrainId==="savanna"?tt=.55:d.terrainId==="semi_desert"?tt=.92:(vi.has(d.terrainId)||X)&&(tt=1.32):Me.isHerb&&$?tt=.3:Me.isReed&&(be?tt=1.65:(le||q.length>0)&&(tt=1.35));let Pt=Math.min(.86,(ze.placement?.density??.15)*Math.min(1,ze.placement?.weight??1)*se*Me.chanceMult*tt*et);if(U(Me,d.q,d.r,312)>=Pt)continue;let rt=z(Me,d,V,ie,ae,_,pe++,O,null,void 0,q);if(rt){if(ee++,Ve)F[Ve]++,Ce=!0;else if(Me.isAccent)Ce=!0;else if(Me.isReed&&!Se&&Le.length>0&&ee<ne){if(te(n,d.q,d.r,5501+pe*13)<.74){Se=!0;let Rt=1+Math.floor(te(n,d.q,d.r,5507)*3);for(let wt=0;wt<Rt&&ee<ne;wt++){let jr=Math.floor(te(n,d.q,d.r,5519+wt*7)*Le.length),it=Le[jr%Le.length],ir=te(n,d.q,d.r,5527+wt*11),Tt=it.entry.scaleRange[0]??.85,ar=it.entry.scaleRange[1]??1.15,sr=(Tt+(ar-Tt)*ir)*(.78+.3*ir);w(it,d,V,ie,rt.ux,rt.uy,rt.halfW,14,38,sr,ae,_,pe++,.42,void 0,q)&&ee++}}}else if(!X&&!Ee&&Me.pKind==="shrub"&&!($&&Me.isBush20to29)&&Q.length>0&&ee<ne){let Ct=te(n,d.q,d.r,5401+pe*19);if(Ct<.5){Ee=!0;let Rt=Q.filter(it=>it.entry.family===ze.family),wt=Rt.length>0?Rt:Q,jr=Ct<.22&&ce>.9?2:1;for(let it=0;it<jr&&ee<ne;it++){let ir=Math.floor(te(n,d.q,d.r,5413+it*11)*wt.length),Tt=wt[ir%wt.length],ar=te(n,d.q,d.r,5423+it*7),sr=Tt.entry.scaleRange[0]??.85,Ko=Tt.entry.scaleRange[1]??1.15,jo=(sr+(Ko-sr)*ar)*(.72+.3*ar);w(Tt,d,V,ie,rt.ux,rt.uy,rt.halfW,15,40,jo,ae,_,pe++,.46,void 0,q)&&ee++}if(we.length>0&&ee<ne&&te(n,d.q,d.r,5437)<.22){let it=we[Math.floor(te(n,d.q,d.r,5441)*we.length)];w(it,d,V,ie,rt.ux,rt.uy,rt.halfW,18,42,.55+te(n,d.q,d.r,5443)*.48,ae,_,pe++,.52,void 0,q)&&ee++}}}}}}if(le&&!$&&!Mt.has(d.terrainId)&&this.reedCandidates.length>0&&ee<ne&&te(n,d.q,d.r,5601)<.68){let se=this.reedCandidates,he=Math.floor(te(n,d.q,d.r,5609)*se.length),me=se[he%se.length],de=z(me,d,V,ie,ae,_,pe++,.7,null,void 0,q);if(de){ee++;let Ce=1+Math.floor(te(n,d.q,d.r,5617)*2);for(let Ee=0;Ee<Ce&&ee<ne;Ee++){let Se=se[(he+Ee+1)%se.length];w(Se,d,V,ie,de.ux,de.uy,de.halfW,14,36,null,ae,_,pe++,.42,void 0,q)&&ee++}}}}let E=[];if(this.decalCandidatesByTerrain.size>0)for(let d of a){if(this.isWaterTerrain(d.terrainId)||d.reliefClass==="mountain"||Mt.has(d.terrainId))continue;let b=this.decalCandidatesByTerrain.get(d.terrainId);if(!b||b.length===0)continue;let _=Math.sin(d.q*.31+d.r*.19+n%53)*Math.cos(d.q*.17-d.r*.37+n%29),H=Math.sin(d.q*.67-d.r*.53+n%97)*.45,q=.5+.5*(_*.72+H*.28),K=te(n,d.q,d.r,7091),Z=d.terrainId.includes("desert")||d.terrainId.includes("badlands")||d.terrainId.includes("savanna")||d.terrainId.includes("semi_arid")||d.terrainId.includes("dry")?.38+q*.38:.48+q*.38;if(K>=Z)continue;let le=256*(d.q+d.r*.5),$=Ye*d.r,ge=Re.some(([_e,qe])=>{let Te=this.lookupRawHex(d.q+_e,d.r+qe);return Te?this.isWaterTerrain(Te.terrainId):!1})?46:28,oe=d.forestDensity??0,Pe=q>.52&&K<Z*.58?2:1,ye=this.manifest.terrain.byType[d.terrainId]?.avgColor,xe=ye?(Math.max(0,Math.min(255,Math.round(ye[0])))&255)<<16|(Math.max(0,Math.min(255,Math.round(ye[1])))&255)<<8|Math.max(0,Math.min(255,Math.round(ye[2])))&255:0,ve=[];for(let _e=0;_e<b.length;_e++){let qe=b[_e],Te=qe.entry.tags??[];Te.includes("meadow_decal")&&oe>.42||Te.includes("woodland_decal")&&oe<.2&&d.terrainId!=="forest_floor"&&d.terrainId!=="swamp"&&d.terrainId!=="marsh"&&d.terrainId!=="marshland"&&d.terrainId!=="moor"&&d.terrainId!=="jungle"||ve.push(qe)}if(ve.length===0)continue;let we=new Set,Be=[];for(let _e=0;_e<Pe;_e++){let qe=Math.floor(te(n,d.q,d.r,7109+_e*31)*ve.length),Te=ve[qe%ve.length];if(we.has(Te.key))continue;let Ue=Te.pathSalt+_e*1777,Q=(te(n,d.q,d.r,Ue+7121+_e*7)-.5)*148,re=(te(n,d.q,d.r,Ue+7129+_e*7)-.5)*148,fe=le+Q,Fe=$+re;if(!br(Q,re,ge)||v(fe,Fe)<54||Be.some(Ie=>Math.hypot(Ie.ux-fe,Ie.uy-Fe)<38))continue;let I=Te.entry.tags??[],j=te(n,d.q,d.r,Ue+7151),ce=Math.max(.78,Te.entry.scaleRange[0]??.78),ne=Math.max(1.32,Te.entry.scaleRange[1]??1.32),O=ce+(ne-ce)*j,V=.86+te(n,d.q,d.r,Ue+7163)*.28,ie=wi(Te.key,I,te(n,d.q,d.r,Ue+7177)),ae=I.includes("terrain_tint"),ee=I.includes("rock_decal")||I.includes("woodland_decal")||I.includes("wetland_decal"),ue=this.createPlacedSprite(Te,d.q,d.r,fe,Fe,O,y(fe,Fe));ue.width*=V,ue.height/=Math.sqrt(V),ue.rotationRad=ie,xe>0&&(ae?(ue.terrainTintRgb=xe,ue.terrainTintMix=.96):ee&&(ue.terrainTintRgb=xe,ue.terrainTintMix=.28)),E.push(ue),we.add(Te.key),Be.push({ux:fe,uy:Fe})}}return S.sort((d,b)=>(d.sortY??d.y)-(b.sortY??b.y)||d.x-b.x),{cq:e,cr:r,key:St(e,r),originQ:o,originR:i,cells:s,sprites:S,decals:E,shorelines:c,riverRoutes:f}}};var Dt=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var po=$r(cr());var gt=32,_i=32;function Ci(t){return t==="mountain"||t==="hills"?t:"flat"}function mo(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function go(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Dt},r=po.default.createPointSampler(t.seed,e),o=t.halfExtent,i=t.fogPolicy??(()=>2),n=t.overrides,s=new Map,u=(l,c)=>{let h=`${l},${c}`,f=s.get(h);if(f)return s.delete(h),s.set(h,f),f;let m=l*gt,p=c*gt,v=r.traceRivers(m,p,gt,gt),g=[],C=new Set;for(let y=0;y<v.routes.length;y++){let S=v.routes[y];if(!S||S.length<2)continue;let G=S[0],L=S[S.length-1],x=`${G[0]},${G[1]}->${L[0]},${L[1]}:${S.length}`;C.has(x)||(C.add(x),g.push({id:x,hexes:S}))}let P={routes:g,edgesByKey:v.edgesByKey};for(s.set(h,P);s.size>_i;){let y=s.keys().next().value;if(y===void 0)break;s.delete(y)}return P},a=({cq:l,cr:c,chunkSize:h})=>{let f=l*h,m=c*h,p=[];for(let v=0;v<h;v++){let g=m+v;if(o!==void 0&&Math.abs(g)>o)continue;let C=Math.floor(g/gt);for(let P=0;P<h;P++){let y=f+P;if(o!==void 0&&Math.abs(y)>o)continue;let S=Math.floor(y/gt),G=u(S,C),L=r.sampleCell(y,g),x=De(y,g),T=i(y,g),D=n?.get(x),A=D?.reliefClass??Ci(L.reliefClass),F=D?.forestDensity!==void 0?D.forestDensity:L.forestDensity>0?L.forestDensity:0,Y=D?.forestClass??(D?.forestDensity!==void 0?mo(void 0,F):mo(L.forestClass,F)),U=G.edgesByKey.get(x);p.push({q:y,r:g,terrainId:D?.terrainId??L.terrainId,reliefClass:A,hillProfile:D?.hillProfile!==void 0?D.hillProfile:A==="hills"?L.hillProfile??"rounded":null,hillStrength:D?.hillStrength!==void 0?D.hillStrength:A==="hills"?Math.max(.35,L.hillStrength||.72):0,forestClass:Y,forestDensity:F,fogState:D?.fogState??T,occupied:D?.occupied,riverEdges:D?.riverEdges!==void 0?D.riverEdges:U&&U.length>0?[...U]:void 0})}}return p};return a.getRiverRoutesForChunk=(l,c,h)=>{let f=l*h,m=f+h-1,p=c*h,v=p+h-1,g=Math.floor(f/gt),C=Math.floor(m/gt),P=Math.floor(p/gt),y=Math.floor(v/gt),S=[],G=new Set;for(let L=P;L<=y;L++)for(let x=g;x<=C;x++){let T=u(x,L);for(let D of T.routes){if(G.has(D.id))continue;let A=!1;for(let F=0;F<D.hexes.length;F++){let[Y,U]=D.hexes[F];if(Y>=f&&Y<=m&&U>=p&&U<=v){A=!0;break}}A&&(G.add(D.id),S.push(D))}}return S},a}var Ri=new Set(["ocean","coastal_water","stormy_ocean","icy_ocean"]);function ht(t){return!!(t&&Ri.has(t))}function _t(t){let e=new Set,{routes:r=[],manualRivers:o=[],isWaterHex:i}=t;for(let n=0;n<r.length;n++){let s=fo(r[n],i);for(let u of s)e.add(u)}for(let n=0;n<o.length;n++){let s=o[n],u=Re[(s.dir%6+6)%6];if(!u)continue;let a=Je(s.q,s.r,s.q+u[0],s.r+u[1]);e.add(a.key)}return e}function _r(t){let{q1:e,r1:r,q2:o,r2:i,isGate:n=!1,lookupHex:s,occupiedRiverEdges:u,existingRoads:a=[]}=t;if($e(e,r,o,i)!==1)return{ok:!1,code:"not_adjacent",reason:"Nur direkt benachbarte Hexfelder teilen eine Mauerkante."};let l=s(e,r),c=s(o,i);if(!l||!c)return{ok:!1,code:"missing_hex",reason:"Kante liegt au\xDFerhalb der geladenen Karte."};if(ht(l.terrainId)||ht(c.terrainId))return{ok:!1,code:"water_forbidden",reason:"An Wasser-/K\xFCstenwasserkanten ist keine Mauer erlaubt."};if(l.reliefClass==="mountain"||c.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Auf Bergkanten ist keine Mauer erlaubt."};let h=Je(e,r,o,i);return u.has(h.key)?{ok:!1,code:"river_edge_forbidden",reason:"Auf einer Flusskante ist keine Mauer erlaubt (Eckanschluss an benachbarter Landkante bleibt zul\xE4ssig)."}:!n&&a.length>0&&a.some(m=>Je(m.q1,m.r1,m.q2,m.r2).key===h.key)?{ok:!1,code:"road_requires_gate",reason:"\xDCber eine bestehende Stra\xDFe muss ein Tor statt einer geschlossenen Mauer gesetzt werden."}:{ok:!0}}function Cr(t){let{q:e,r,dir:o,lookupHex:i,existingWalls:n=[]}=t,s=Re[(o%6+6)%6];if(!s)return{ok:!1,code:"not_adjacent",reason:"Ung\xFCltige Flusskanten-Richtung."};let u=e+s[0],a=r+s[1],l=i(e,r),c=i(u,a);if(!l||!c)return{ok:!1,code:"missing_hex",reason:"Flusskante liegt au\xDFerhalb der geladenen Karte."};if(ht(l.terrainId)||ht(c.terrainId))return{ok:!1,code:"water_forbidden",reason:"Flusskanten verlaufen nur zwischen Land-Hexen (M\xFCndungen enden an der K\xFCstenecke)."};let h=Je(e,r,u,a);return n.some(m=>Je(m.q1,m.r1,m.q2,m.r2).key===h.key)?{ok:!1,code:"wall_edge_forbidden",reason:"Auf einer bestehenden Mauerkante kann kein Fluss liegen."}:{ok:!0}}function Rr(t){let{q1:e,r1:r,q2:o,r2:i,lookupHex:n,existingWalls:s=[]}=t;if($e(e,r,o,i)!==1)return{ok:!1,code:"not_adjacent",reason:"Stra\xDFen verbinden nur direkt benachbarte Hexfelder."};let u=n(e,r),a=n(o,i);if(!u||!a)return{ok:!1,code:"missing_hex",reason:"Stra\xDFensegment liegt au\xDFerhalb der geladenen Karte."};if(ht(u.terrainId)||ht(a.terrainId))return{ok:!1,code:"water_forbidden",reason:"Stra\xDFen k\xF6nnen nicht auf Wasser gelegt werden."};if(u.reliefClass==="mountain"||a.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Stra\xDFen k\xF6nnen nicht \xFCber Gebirge gelegt werden."};let l=Je(e,r,o,i);return s.some(h=>!h.isGate&&Je(h.q1,h.r1,h.q2,h.r2).key===l.key)?{ok:!1,code:"closed_wall_blocks_road",reason:"Eine geschlossene Mauer blockiert diese Kante \u2014 erst ein Tor setzen."}:{ok:!0}}var yo=$r(cr());var Ne=[.24,.62,.96],Mr=[.92,.28,.3],Mi=[.22,.78,.48],bo=[.94,.72,.22],Ei=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function Bt(t){return t.surfaceClass!=="land"}function bt(t){return!Bt(t)&&t.reliefClass!=="mountain"}function rr(t,e,r,o){let i=t.sampleCell(e,r);if(o==="harbor"){if(!Bt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let u=[];for(let[a,l]of Re){let c=t.sampleCell(e+a,r+l);bt(c)&&u.push({q:e+a,r:r+l})}return{center:{q:e,r},buildingKind:o,valid:u.length>0,yieldPercent:100,bonusHexes:u,reason:u.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!bt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:i.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],s=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let u=-2;u<=2;u++)for(let a=-2;a<=2;a++){if($e(0,0,a,u)>2)continue;let l=e+a,c=r+u,h=t.sampleCell(l,c);o==="farm"?bt(h)&&Ei.has(h.terrainId)&&(n.push({q:l,r:c}),s+=5):o==="lumber_camp"?bt(h)&&h.forestDensity>.08&&(n.push({q:l,r:c}),s+=5):o==="quarry"&&(h.reliefClass==="hills"||h.reliefClass==="mountain")&&(n.push({q:l,r:c}),s+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,s),bonusHexes:n}}function Ke(t,e,r,o){for(let i=0;i<=32;i++)for(let n=-i;n<=i;n++)for(let s=-i;s<=i;s++){if($e(0,0,s,n)!==i)continue;let u=e+s,a=r+n,l=t.sampleCell(u,a);if(bt(l)&&(!o||o(l)))return{q:u,r:a}}return{q:e,r}}function Ai(t,e,r){for(let o=0;o<=45;o++)for(let i=-o;i<=o;i++)for(let n=-o;n<=o;n++){if($e(0,0,n,i)!==o)continue;let s=e+n,u=r+i,a=t.sampleCell(s,u);if(Bt(a))for(let[l,c]of Re){let h=t.sampleCell(s+l,u+c);if(bt(h))return{water:{q:s,r:u},land:{q:s+l,r:u+c}}}}return{water:{q:e,r},land:{q:e+1,r}}}function xt(t,e,r,o,i,n,s,u=!1){let a=[];for(let l=-i;l<=i;l++)for(let c=-i;c<=i;c++){if($e(0,0,c,l)>i)continue;let h=o.q+c,f=o.r+l,m=De(h,f);if(r.has(m))continue;let p=t.sampleCell(h,f);!u&&!bt(p)||p.reliefClass!=="mountain"&&(r.add(m),e.push({q:h,r:f,ownerId:n,color:s}),a.push({q:h,r:f}))}return a}function qt(t,e,r){let o=[],i=t.q,n=t.r,s=0;for(;(i!==e.q||n!==e.r)&&s++<40;){let u=0,a=1/0;for(let h=0;h<6;h++){let f=i+Re[h][0],m=n+Re[h][1],p=$e(f,m,e.q,e.r);p<a&&(a=p,u=h)}let l=i+Re[u][0],c=n+Re[u][1];o.push({q1:i,r1:n,q2:l,r2:c,tier:r}),i=l,n=c}return o}function pn(t,e,r=0,o="player",i){let n=new Set(t.map(c=>De(c.q,c.r))),s=new Set,u=new Set;if(i?.roads)for(let c of i.roads)u.add(Je(c.q1,c.r1,c.q2,c.r2).key);let a=[],l=0;for(let c of t)for(let h=0;h<6;h++){let f=c.q+Re[h][0],m=c.r+Re[h][1];if(n.has(De(f,m)))continue;let p=Je(c.q,c.r,f,m);if(s.has(p.key)||(s.add(p.key),i?.occupiedRiverEdges?.has(p.key)))continue;if(i?.sampler){let g=i.sampler.sampleCell(p.q1,p.r1),C=i.sampler.sampleCell(p.q2,p.r2);if(!bt(g)||!bt(C))continue}l++;let v=u.has(p.key);a.push({q1:p.q1,r1:p.r1,q2:p.q2,r2:p.r2,kind:e,isGate:v||r>0&&l%r===0,ownerId:o})}return a}function vo(t,e,r,o){let i=[],n=t,s=e,u=0;for(let a=0;a<r;a++){let l=Re[u];if(o&&l){let c=o.sampleCell(n,s),h=o.sampleCell(n+l[0],s+l[1]);if(Bt(c)||Bt(h))break}if(i.push({q:n,r:s,dir:u}),a%2===0)u=(u+1)%6;else{let c=(u+1)%6;n+=Re[c][0],s+=Re[c][1],u=(u+5)%6}}return i}function xo(t,e="vedras-welt-01",r){let o=r===void 0?Dt:r===null?void 0:r,i=yo.default.createPointSampler(e,o);if(t==="fresh-start"){let F=Ke(i,0,0),Y=Ke(i,F.q-2,F.r+1),U=[];return xt(i,U,new Set,F,1,"player",Ne),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:F,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:F.q,r:F.r,visR:3,expR:5}],scene:{territory:U,buildings:[{id:"cap-1",q:F.q,r:F.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:Ne}],units:[{id:"scout-1",q:F.q+1,r:F.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:Ne,marchPath:[{q:F.q+1,r:F.r},{q:F.q+2,r:F.r},{q:F.q+3,r:F.r-1}]}],sites:[{id:"site-1",q:Y.q,r:Y.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let F=Ke(i,108,-70),Y=Ke(i,F.q+7,F.r-1),U=[],N=new Set,R=xt(i,U,N,F,3,"player",Ne);xt(i,U,N,Y,3,"enemy",Mr);let B=Ke(i,F.q+2,F.r),J=[...qt(F,B,"stone"),...qt(B,Y,"packed")],z=vo(F.q-2,F.r-3,7,i),w=_t({manualRivers:z}),k=pn(R.filter(d=>$e(d.q,d.r,F.q,F.r)<=1),"stone",3,"player",{sampler:i,occupiedRiverEdges:w,roads:J});k.length>0&&(k[0].breached=!0);let M={q:B.q+2,r:B.r},W=[{id:"blue-cap",q:F.q,r:F.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:Ne},{id:"blue-fort",q:B.q,r:B.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:Ne,rangeRadius:2},{id:"red-cap",q:Y.q,r:Y.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:Mr}],E=[{id:"u-blue-def",q:B.q,r:B.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:Ne,marchPath:[{q:F.q+1,r:F.r+1},{q:B.q,r:B.r+1}]},{id:"u-red-siege",q:M.q,r:M.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:Mr,inCombat:!0,marchPath:[M,{q:B.q+1,r:B.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((F.q+Y.q)/2),r:Math.round((F.r+Y.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:F.q,r:F.r,visR:6,expR:12},{q:B.q,r:B.r,visR:5,expR:10}],scene:{territory:U,rivers:z,roads:J,walls:k,buildings:W,units:E}}}if(t==="coastal-harbors"){let F=Ai(i,2,-2),Y=[],U=new Set;xt(i,Y,U,F.land,2,"player",Ne,!1),xt(i,Y,U,F.water,2,"player",Ne,!0);let N={q:F.water.q+1,r:F.water.r};for(let[J,z]of Re){let w=i.sampleCell(F.water.q+J,F.water.r+z);if(Bt(w)){N={q:F.water.q+J,r:F.water.r+z};break}}let R=[{id:"coastal-cap",q:F.land.q,r:F.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:Ne},{id:"harbor-1",q:F.water.q,r:F.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:Ne}],B=[{id:"boat-1",q:N.q,r:N.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:Ne,marchPath:[F.water,N]},{id:"scout-sea",q:F.water.q,r:F.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:Ne}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:F.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:F.water.q,r:F.water.r,visR:6,expR:11}],scene:{territory:Y,roads:qt(F.land,{q:F.land.q-2,r:F.land.r+1},"packed"),buildings:R,units:B}}}if(t==="sites-and-fauna"){let F=Ke(i,0,0,B=>(B.terrainId==="grassland"||B.terrainId==="pasture")&&B.forestDensity<.25),Y=new Set,U=(B,J,z)=>{let w=F.q+B,k=F.r+J;for(let W=0;W<=4;W++)for(let E=-W;E<=W;E++)for(let d=-W;d<=W;d++){if($e(0,0,d,E)!==W)continue;let b=w+d,_=k+E,H=De(b,_);if(Y.has(H))continue;let q=i.sampleCell(b,_);if(bt(q)&&(!z||z(q)))return Y.add(H),{q:b,r:_}}let M=Ke(i,w,k);return Y.add(De(M.q,M.r)),M},R=[{id:"fauna-deer-1",dq:0,dr:0,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel (animiert)"},{id:"fauna-horse-1",dq:1,dr:0,family:"fauna",faunaSpecies:"horse",label:"Wildpferde (animiert)"},{id:"site-sc-1",dq:-1,dr:0,family:"stone_circle",variantIndex:0,label:"Steinkreis I"},{id:"site-wt-1",dq:-1,dr:1,family:"watchtower_ruin",variantIndex:0,label:"Wachturmruine I"},{id:"site-mine-1",dq:0,dr:1,family:"forgotten_iron_mine",variantIndex:0,label:"Vergessene Eisenmine I"},{id:"site-house-1",dq:1,dr:-1,family:"abandoned_house",variantIndex:0,label:"Verlassenes Haus I"},{id:"site-barn-1",dq:0,dr:-1,family:"dilapidated_barn",variantIndex:1,label:"Verfallene Scheune II"},{id:"site-water-1",dq:-1,dr:2,family:"waterhole",variantIndex:0,label:"Wasserloch I"},{id:"site-oasis-1",dq:2,dr:-1,family:"oasis",variantIndex:0,label:"Oase I"},{id:"site-obelisk-1",dq:2,dr:0,family:"obelisk",variantIndex:0,label:"Alter Obelisk I"},{id:"site-iron-1",dq:1,dr:1,family:"iron_deposit",variantIndex:0,label:"Eisenvorkommen I"},{id:"site-wt-2",dq:-2,dr:1,family:"watchtower_ruin",variantIndex:2,label:"Wachturmruine III"},{id:"site-mine-2",dq:-2,dr:2,family:"forgotten_iron_mine",variantIndex:3,label:"Vergessene Eisenmine IV"},{id:"site-house-2",dq:2,dr:-2,family:"abandoned_house",variantIndex:2,label:"Verlassenes Haus III"},{id:"site-barn-2",dq:1,dr:-2,family:"dilapidated_barn",variantIndex:3,label:"Verfallene Scheune IV"},{id:"site-obelisk-2",dq:3,dr:-1,family:"obelisk",variantIndex:3,label:"Gebrochener Obelisk IV"},{id:"site-sc-2",dq:-2,dr:0,family:"stone_circle",variantIndex:2,label:"Runen-Steinkreis III"},{id:"site-oasis-2",dq:2,dr:1,family:"oasis",variantIndex:4,label:"Brunnen-Oase V"},{id:"site-iron-2",dq:0,dr:2,family:"iron_deposit",variantIndex:2,label:"Eisenvorkommen III"},{id:"site-water-2",dq:-1,dr:-1,family:"waterhole",variantIndex:3,label:"Seerosen-Wasserloch IV"}].map(B=>{let J=U(B.dq,B.dr);return{id:B.id,q:J.q,r:J.r,family:B.family,faunaSpecies:B.faunaSpecies,variantIndex:B.variantIndex,label:B.label}});return{id:t,title:"5. M22 Fundorte (9\xD75 Varianten) & Animierte Fauna",subtitle:"Alle 9 M22-Fundorttypen (je 5 handgemalte Varianten + Schatten) \xB7 Civ-Style Hirsch- & Pferdeherden",seed:e,cameraCenter:F,cameraZoom:.74,defaultFogMode:"all-visible",visibleCenters:[{q:F.q,r:F.r,visR:8,expR:12}],scene:{sites:R}}}if(t==="strategic-empires"){let F=[{id:"player",name:"Krone Vedra",color:Ne,q:0,r:0},{id:"crimson",name:"Blutmark",color:Mr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:Mi,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:bo,q:8,r:10}],Y=[],U=new Set,N=[],R=[];for(let B of F){let J=Ke(i,B.q,B.r);xt(i,Y,U,J,5,B.id,B.color),N.push({id:`emp-${B.id}`,q:J.q,r:J.r,kind:"capital",label:B.name,level:12,ownerId:B.id,factionColor:B.color}),R.push({id:`army-${B.id}`,q:J.q+2,r:J.r-1,kind:"army",label:`Heer ${B.name}`,strength:520,ownerId:B.id,factionColor:B.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:F.map(B=>({q:B.q,r:B.r,visR:9,expR:15})),scene:{territory:Y,buildings:N,units:R}}}let n=Ke(i,110,-70),s=Ke(i,n.q+4,n.r-1),u=Ke(i,n.q-3,n.r+3),a=[],l=new Set,c=xt(i,a,l,n,2,"player",Ne);xt(i,a,l,s,2,"player",Ne),xt(i,a,l,u,2,"player",Ne);let h=Ke(i,n.q+1,n.r),f=Ke(i,n.q-1,n.r,F=>F.forestDensity>.1),m=Ke(i,n.q,n.r+2),p=Ke(i,s.q+1,s.r),v=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:Ne},{id:"town-2",q:s.q,r:s.r,kind:"settlement",centerStage:"city",label:"Ostfurt",level:6,ownerId:"player",factionColor:Ne},{id:"town-3",q:u.q,r:u.r,kind:"settlement",centerStage:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:Ne,constructionProgress:.62},{id:"farm-1",q:h.q,r:h.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:Ne,yieldPercent:rr(i,h.q,h.r,"farm").yieldPercent},{id:"lumber-1",q:f.q,r:f.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:Ne,yieldPercent:rr(i,f.q,f.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:m.q,r:m.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:Ne,yieldPercent:rr(i,m.q,m.r,"quarry").yieldPercent},{id:"fort-1",q:p.q,r:p.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:Ne,rangeRadius:2}],g=[...qt(n,s,"stone"),...qt(n,u,"packed"),...qt(n,m,"trail")],C=vo(n.q-2,n.r-2,8,i),P=_t({manualRivers:C}),y=c.filter(F=>$e(F.q,F.r,n.q,n.r)===0),S=pn(y,"stone",2,"player",{sampler:i,occupiedRiverEdges:P,roads:g}),G=pn([u],"palisade",3,"player",{sampler:i,occupiedRiverEdges:P,roads:g}),L=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:bo,marchPath:[n,{q:n.q+2,r:n.r-1},s]},{id:"army-1",q:s.q,r:s.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:Ne}],x=Ke(i,n.q+2,n.r+2),T=Ke(i,n.q-2,n.r-1),D=Ke(i,n.q+1,n.r+2),A=[{id:"site-mine",q:x.q,r:x.r,family:"forgotten_iron_mine",label:"Vergessene Eisenmine"},{id:"site-obelisk",q:T.q,r:T.r,family:"obelisk",label:"Alter Obelisk"},{id:"site-deer",q:D.q,r:D.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:s.q,r:s.r,visR:4,expR:8},{q:u.q,r:u.r,visR:4,expR:8}],scene:{territory:a,rivers:C,roads:g,walls:[...S,...G],buildings:v,units:L,sites:A}}}var wo=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"sites-and-fauna",label:"M22 Fundorte & Animierte Fauna"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function So(t,e,r,o,i){if(o==="all-visible"||i?.has(De(e,r)))return 2;let n=0;for(let s of t.visibleCenters){let u=$e(s.q,s.r,e,r);if(u<=s.visR)return 2;u<=s.expR&&n<1&&(n=1)}return n}var At={SMOKE:0,LEAF:1,BIRD:2,BIRD_SHADOW:3,SNOW:4,SAND:5,WIND:6},Ro=1536,Er=12,Pi=new Set(["capital","settlement","farm","lumber_camp","iron_mine","barracks","academy","trade_office","harbor","fortress","restored_dwelling"]),_o=new Set(["snowfields","frozen_tundra","icy_ocean","tundra"]),Ti=new Set(["desert","sand_desert","dry_plains","steppe","badlands","savanna"]),ki=new Set(["forest","deciduous_forest","woodland","dense_forest","jungle","rainforest","boreal_forest","taiga","swamp"]),Wi=new Set(["grassland","plains","meadow","hills","steppe","highland","farmland","savanna"]);function Fi(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function st(t,e,r){return Fi(t,e,r)/4294967295}function lt(t){let e=t<0?0:t>1?1:t;return e*e*(3-2*e)}function Li(t){return t.kind==="capital"||t.centerStage==="metropolis"||t.centerStage==="city"?{dx:12,dy:-46}:t.kind==="fortress"?{dx:-10,dy:-44}:t.kind==="settlement"?t.centerStage==="outpost"?{dx:6,dy:-28}:{dx:8,dy:-36}:t.kind==="farm"||t.kind==="restored_dwelling"?{dx:6,dy:-28}:{dx:5,dy:-32}}function Ii(t){let{cam:e,detailOpacity:r,timeSec:o,animate:i,lookupHex:n,isWaterTerrain:s,buildings:u,sampleReliefHeight:a,seedInt:l=1337}=t,c=t.out??[];if(c.length=0,r<=.04||e.zoom<.22)return c;let h=Y=>{c.length<Ro&&c.push(Y)},f=lt((e.zoom-.22)/.26)*Math.min(1,r),m=i?o:4.25,p=e.viewportWidth*.5/Math.max(.08,e.zoom)+220,v=e.viewportHeight*.5/Math.max(.08,e.zoom)+220,g=e.x-p,C=e.x+p,P=e.y-v,y=e.y+v;if(u&&u.length>0)for(let Y=0;Y<u.length;Y++){let U=u[Y],N=n(U.q,U.r);if(!N||N.fogState===0)continue;let R=U.kind;if(!Pi.has(R))continue;let B=We(U.q,U.r),J=a?a(B.x,B.y/Ae)*Ae:0,z=Li(U),w=B.x+z.dx,k=B.y-J+z.dy;if(w<g||w>C||k<P||k>y)continue;let M=N.fogState===1?.58:1,W=U.kind==="capital"||U.centerStage==="metropolis"||U.centerStage==="city"?6:4,E=5.4;for(let d=0;d<W;d++){let b=st(U.q*17+d,U.r*31+Y,l^257),_=((m/E+d/W+b)%1+1)%1,H=_*64,q=Math.sin(_*6.8+b*12)*(3.5+_*8.5),K=-_*24+q,X=10+_*28,le=lt(_/.16)*(1-lt((_-.44)/.56))*.46*M*f;le<.01||h({x:w+K,y:k-H,width:X*1.18,height:X*.94,r:.9,g:.89,b:.86,alpha:le,kind:At.SMOKE,rotRad:(b-.5)*1.4+_*.65,animPhase:_,seed:b})}}let S=Vt(e,1),G=S.maxQ-S.minQ+1,L=S.maxR-S.minR+1;if(G*L<=900){let Y=lt((e.zoom-.32)/.28);for(let U=S.minR;U<=S.maxR;U++)for(let N=S.minQ;N<=S.maxQ;N++){let R=n(N,U);if(!R||R.fogState===0)continue;let B=We(N,U);if(B.x<g||B.x>C||B.y<P||B.y>y)continue;let J=a?a(B.x,B.y/Ae)*Ae:0,z=B.y-J,w=R.fogState===1?.55:1,k=R.terrainId;if(!s(k)&&(ki.has(k)||R.forestClass==="dense_forest"||R.forestClass==="light_forest"||R.forestDensity>=.35)&&Y>.02){let W=k==="jungle"||k==="rainforest",E=k==="taiga"||k==="boreal_forest",d=W?3:2;for(let b=0;b<d;b++){let _=st(N*23+b,U*41,l^514),H=st(N*37+b,U*19,l^521),q=5.6+_*3.4,K=((m/q+H)%1+1)%1,X=(_-.5)*124,Z=(H-.5)*84-52,le=Math.sin(K*11.5+_*18)*13-K*14,$=K*58,ge=lt(K/.16)*(1-lt((K-.68)/.32))*.78*w*Y*f;if(ge<.015)continue;let oe=.44,Pe=.58,ye=.24;W?(oe=.32,Pe=.57,ye=.22):E?(oe=.46,Pe=.44,ye=.25):_>.68&&(oe=.74,Pe=.58,ye=.24);let xe=6+H*3;h({x:B.x+X+le,y:z+Z+$,width:xe*1.35,height:xe,r:oe,g:Pe,b:ye,alpha:ge,kind:At.LEAF,rotRad:Math.sin(K*9+H*10)*.95+(_-.5)*.8,animPhase:K*14+_*6.283,seed:_})}}if(_o.has(k)){let W=k==="snowfields"?4:3;for(let E=0;E<W;E++){let d=st(N*29+E,U*53,l^771),b=st(N*61+E,U*17,l^777),_=5.2+d*3,H=((m/_+b)%1+1)%1,q=(d-.5)*150-H*42+Math.sin(H*6.5+b*14)*9,K=(b-.5)*100-44+H*72,Z=lt(H/.18)*(1-lt((H-.72)/.28))*.68*w*f;if(Z<.015)continue;let le=4.4+d*3.6;h({x:B.x+q,y:z+K,width:le,height:le,r:.95,g:.97,b:1,alpha:Z,kind:At.SNOW,rotRad:0,animPhase:H,seed:d})}}if(Ti.has(k)){let W=st(N*43,U*67,l^1028);if(W<.62){let E=st(N*19,U*83,l^1033),d=4.8+E*2.8,b=((m/d+W)%1+1)%1,_=(b-.5)*126,H=(b-.5)*28,K=lt(b/.24)*(1-lt((b-.66)/.34))*.32*w*f;if(K>=.01){let X=k==="desert"||k==="sand_desert";h({x:B.x+(E-.5)*56-_,y:z+(W-.5)*58+H,width:68+E*48,height:15+E*9,r:X?.9:.8,g:X?.8:.72,b:X?.58:.52,alpha:K,kind:At.SAND,rotRad:-.22,animPhase:b*8+E*6.28,seed:E})}}}if(Wi.has(k)){let W=st(N*71,U*97,l^1285);if(W<.22){let E=st(N*13,U*47,l^1289),d=6.2+E*3.5,b=((m/d+W*5)%1+1)%1,H=lt(b/.22)*(1-lt((b-.62)/.38))*.15*w*f;H>=.008&&h({x:B.x+(E-.5)*44-(b-.5)*145,y:z-12+(W-.11)*90+(b-.5)*26,width:82+E*46,height:22+E*10,r:.94,g:.96,b:.95,alpha:H,kind:At.WIND,rotRad:-.18,animPhase:b,seed:E})}}}}let x=680,T=Math.floor(g/x)-1,D=Math.floor(C/x)+1,A=Math.floor(P/x)-1,F=Math.floor(y/x)+1;if((D-T+1)*(F-A+1)<=81)for(let Y=A;Y<=F;Y++)for(let U=T;U<=D;U++){let N=st(U*59,Y*83,l^1542);if(N>.56)continue;let R=st(U*31,Y*47,l^1553),B=st(U*73,Y*29,l^1561),J=190+R*170,z=110+B*115,w=(.055+R*.035)*(B>.5?1:-1),k=m*w+N*Math.PI*2,M=(U+.5)*x+Math.cos(k)*J,W=(Y+.5)*x+Math.sin(k)*z;if(M<g||M>C||W<P||W>y)continue;let E=je(M,W),d=n(E.q,E.r);if(!d||d.fogState===0)continue;let b=s(d.terrainId)||d.terrainId==="coastal_water"||d.terrainId==="beach";if(!b)for(let ge=0;ge<6;ge++){let[oe,Pe]=Re[ge],ye=n(E.q+oe,E.r+Pe);if(ye&&s(ye.terrainId)){b=!0;break}}if(_o.has(d.terrainId)&&N>.2)continue;let H=-Math.sin(k)*J*w,q=Math.cos(k)*z*w,K=Math.atan2(q,H),X=K+Math.PI*.5,Z=d.fogState===1?.55:1,le=b?3:3+(R>.55?1:0),$=-42,be=32;for(let ge=0;ge<le;ge++){let oe=ge%2===0?1:-1,Pe=Math.ceil(ge/2),ye=-Pe*22,xe=oe*Pe*19+Math.sin(m*.9+ge*2.1+R*6)*4.5,ve=Math.cos(K),we=Math.sin(K),Be=M+ve*ye-we*xe,_e=W+we*ye+ve*xe,Ue=(m*.42+ge*.27+B)%1>.52?-.18+Math.sin(m*1.4+ge)*.06:Math.sin(m*6.8+ge*1.7+R*5)*.62,Q=(b?20:16)*(.9+.2*(ge===0?1:B)),re=.84*Z*f;h({x:Be+$,y:_e+be,width:Q*.95,height:Q*.55,r:.05,g:.07,b:.11,alpha:.22*Z*f,kind:At.BIRD_SHADOW,rotRad:X,animPhase:Ue,seed:R}),h({x:Be,y:_e,width:Q,height:Q*.72,r:b?.96:.22,g:b?.97:.23,b:b?.98:.25,alpha:re,kind:At.BIRD,rotRad:X,animPhase:Ue,seed:B})}}return c}var Di=`#version 300 es
precision highp float;

layout(location = 0) in vec2 a_corner;      // 0..1 quad corner
layout(location = 1) in vec4 a_posSize;     // worldX, worldY, width, height
layout(location = 2) in vec4 a_colorAlpha;  // r, g, b, alpha
layout(location = 3) in vec4 a_params;      // kind, rotRad, animPhase, seed

uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;

out vec2 v_local;
out vec4 v_colorAlpha;
out vec4 v_params;

void main() {
  vec2 centered = (a_corner - 0.5) * a_posSize.zw;
  float c = cos(a_params.y);
  float s = sin(a_params.y);
  vec2 rotated = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
  vec2 worldPos = a_posSize.xy + rotated;
  vec2 screenPx = (worldPos - u_camCenter) * u_zoom + u_viewportSize * 0.5;
  vec2 ndc = (screenPx / u_viewportSize) * 2.0 - 1.0;
  gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
  v_local = a_corner;
  v_colorAlpha = a_colorAlpha;
  v_params = a_params;
}
`,qi=`#version 300 es
precision highp float;

in vec2 v_local;
in vec4 v_colorAlpha;
in vec4 v_params;

out vec4 fragColor;

void main() {
  vec2 uv = v_local * 2.0 - 1.0;
  int kind = int(v_params.x + 0.5);
  float anim = v_params.z;
  float seed = v_params.w;

  vec3 col = v_colorAlpha.rgb;
  float a = v_colorAlpha.a;
  float mask = 0.0;

  if (kind == 0) {
    // Soft multi-lobe billowing chimney smoke puff with subtle warm right-side sun highlight
    vec2 p1 = vec2(-0.18, 0.10);
    vec2 p2 = vec2(0.20, 0.04);
    vec2 p3 = vec2(0.02, -0.18);
    float d = min(
      length(uv - p1) / 0.66,
      min(length(uv - p2) / 0.60, length(uv - p3) / 0.58)
    );
    float puff = smoothstep(1.0, 0.16, d);
    mask = puff * puff;
    col *= clamp(0.90 + 0.15 * uv.x - 0.08 * uv.y, 0.72, 1.08);
  } else if (kind == 1) {
    // Painterly tumbling falling forest leaf
    float tilt = 0.42 + 0.58 * abs(cos(anim));
    float lx = uv.x;
    float ly = (uv.y - 0.16 * lx * lx) / max(0.32, tilt);
    float halfW = max(0.0, (1.0 - lx * lx) * 0.62);
    mask = smoothstep(halfW + 0.16, max(0.0, halfW - 0.16), abs(ly))
         * smoothstep(1.0, 0.70, abs(lx));
    col *= clamp(0.88 + 0.22 * uv.x, 0.70, 1.12);
  } else if (kind == 2) {
    // Graceful curved soaring bird / coastal seagull silhouette with flap-glide wings
    float ax = abs(uv.x);
    float wingCenterY = -0.10 + 0.30 * sin(ax * 2.45) + anim * ax * ax * 0.58 - 0.18 * ax;
    float wingHalfH = mix(0.16, 0.032, smoothstep(0.0, 0.92, ax));
    float wings = smoothstep(0.10, -0.04, abs(uv.y - wingCenterY) - wingHalfH)
                * smoothstep(0.98, 0.80, ax);
    float body = smoothstep(0.46, 0.14, length(vec2(uv.x * 3.6, (uv.y + 0.06) * 2.0)));
    mask = max(wings, body);
    col *= clamp(0.92 + 0.14 * uv.x - 0.10 * uv.y, 0.75, 1.10);
  } else if (kind == 3) {
    // Soft aerial ground shadow beneath soaring bird
    float d = length(vec2(uv.x * 1.05, uv.y * 1.75));
    mask = smoothstep(1.0, 0.12, d);
  } else if (kind == 4) {
    // Delicate drifting arctic snow crystal
    float d = length(uv);
    mask = smoothstep(1.0, 0.14, d) * (0.55 + 0.45 * smoothstep(0.48, 0.05, d));
  } else if (kind == 5) {
    // Low-lying blowing desert sand wisp
    float waveY = sin(uv.x * 3.2 + anim) * 0.22;
    float horizEnv = smoothstep(1.0, 0.20, abs(uv.x));
    float streak = smoothstep(0.44 * horizEnv + 0.06, 0.04, abs(uv.y - waveY)) * horizEnv;
    float grain = 0.74 + 0.26 * sin(uv.x * 17.0 + seed * 22.0);
    mask = streak * grain;
  } else {
    // Delicate translucent wind-gust ribbon
    float curveY = sin(uv.x * 3.4 + seed * 6.2831) * 0.34;
    float headTail = smoothstep(-1.0, -0.15, uv.x) * smoothstep(1.0, 0.10, uv.x);
    float bandW = 0.09 + 0.11 * headTail;
    mask = smoothstep(bandW, 0.015, abs(uv.y - curveY)) * headTail;
  }

  float outA = a * mask;
  if (outA < 0.004) discard;
  fragColor = vec4(col * outA, outA);
}
`;function Co(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate ambient VFX shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Ambient VFX shader compile error:
${i}`)}return o}var Ar=class{constructor(e){this.instanceData=new Float32Array(Ro*Er);this.scratchParticles=[];this.gl=e;let r=Co(e,e.VERTEX_SHADER,Di),o=Co(e,e.FRAGMENT_SHADER,qi),i=e.createProgram();if(!i)throw new Error("Failed to allocate ambient VFX program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let c=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteProgram(i),new Error(`Ambient VFX program link error:
${c}`)}this.prog=i;let n=c=>{let h=e.getUniformLocation(i,c);if(!h)throw new Error(`Missing ambient VFX uniform: ${c}`);return h};this.uCam=n("u_camCenter"),this.uView=n("u_viewportSize"),this.uZoom=n("u_zoom");let s=e.createVertexArray(),u=e.createBuffer(),a=e.createBuffer();if(!s||!u||!a)throw new Error("Failed to allocate ambient VFX buffers");this.vao=s,this.quadVbo=u,this.instanceVbo=a,e.bindVertexArray(s),e.bindBuffer(e.ARRAY_BUFFER,u),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let l=Er*4;for(let c=1;c<=3;c++)e.enableVertexAttribArray(c),e.vertexAttribPointer(c,4,e.FLOAT,!1,l,(c-1)*16),e.vertexAttribDivisor(c,1);e.bindVertexArray(null)}render(e){let r=Ii({...e,out:this.scratchParticles}),o=r.length;if(o===0)return{drawCalls:0,particleCount:0};let{gl:i,instanceData:n}=this;for(let s=0;s<o;s++){let u=r[s],a=s*Er;n[a]=u.x,n[a+1]=u.y,n[a+2]=u.width,n[a+3]=u.height,n[a+4]=u.r,n[a+5]=u.g,n[a+6]=u.b,n[a+7]=u.alpha,n[a+8]=u.kind,n[a+9]=u.rotRad,n[a+10]=u.animPhase,n[a+11]=u.seed}return i.useProgram(this.prog),i.bindVertexArray(this.vao),i.enable(i.BLEND),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),i.uniform2f(this.uCam,e.cam.x,e.cam.y),i.uniform2f(this.uView,e.cam.viewportWidth,e.cam.viewportHeight),i.uniform1f(this.uZoom,e.cam.zoom),i.bindBuffer(i.ARRAY_BUFFER,this.instanceVbo),i.bufferSubData(i.ARRAY_BUFFER,0,n.subarray(0,o*Er)),i.drawArraysInstanced(i.TRIANGLES,0,6,o),i.bindVertexArray(null),{drawCalls:1,particleCount:o}}dispose(){let{gl:e}=this;e.deleteBuffer(this.instanceVbo),e.deleteBuffer(this.quadVbo),e.deleteVertexArray(this.vao),e.deleteProgram(this.prog)}};var nr=512,Eo={deer:{spriteKey:"actors/fauna/deer",herdSize:4,baseWidth:66,pastureRx:68,pastureRy:48,strideHz:2.35,hopAmp:.34,cycleMinSec:9.5,cycleMaxSec:14},horse:{spriteKey:"actors/fauna/horse",herdSize:4,baseWidth:74,pastureRx:74,pastureRy:52,strideHz:2.65,hopAmp:.44,cycleMinSec:8.5,cycleMaxSec:13},sheep:{spriteKey:"actors/fauna/sheep",herdSize:5,baseWidth:52,pastureRx:62,pastureRy:44,strideHz:2.45,hopAmp:.24,cycleMinSec:10.5,cycleMaxSec:15}};function Bi(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function Ut(t,e,r){return Bi(t,e,r)/4294967295}function Ui(t){let e=t<0?0:t>1?1:t;return e*e*(3-2*e)}function Hi(t,e){if(t.family!=="fauna")return null;let r=e.infrastructure.sprites,o=t.faunaSpecies;if(o){let n=Eo[o];if(n&&r[n.spriteKey])return o}let i=(t.label||"").toLowerCase();return(i.includes("pferd")||i.includes("horse")||i.includes("gest\xFCt"))&&r["actors/fauna/horse"]?"horse":(i.includes("schaf")||i.includes("sheep")||i.includes("herde"))&&r["actors/fauna/sheep"]?"sheep":r["actors/fauna/deer"]?"deer":r["actors/fauna/horse"]?"horse":null}function gn(t,e,r,o,i,n,s){let u=(o%6+6)%6,a=r/Math.max(1,i)*Math.PI*2,l=(Ut(t*19+r,e*31+u,911)-.5)*1.45,c=a+u*.92+l,h=.28+.68*Ut(t*7+u,e*13+r,3571);return{ox:Math.cos(c)*n*h,oy:Math.sin(c)*s*h}}function Gi(t){let{q:e,r,memberIdx:o,herdSize:i,profile:n,frameCount:s,timeSec:u,animate:a}=t,l=e*73+o*17,c=r*89+o*29,h=n.cycleMinSec+(n.cycleMaxSec-n.cycleMinSec)*Ut(l,c,101),f=Ut(l,c,202)*h*6,m=a?u+f:f,p=Math.floor(m/h),v=(m-p*h)/h,g=gn(e,r,o,p,i,n.pastureRx,n.pastureRy),C=gn(e,r,o,p+1,i,n.pastureRx,n.pastureRy),P=gn(e,r,o,p-1,i,n.pastureRx,n.pastureRy),y=o===0?1.07:.86+.18*Ut(l,c,303),S=Ut(l,c,404),G=g.ox,L=g.oy,x=0,T=0,D="idle",A=g.ox<P.ox;if(v<.44)D="graze",T=s>=2?1:0,x=0;else if(v<.56)D="idle",T=0,A=C.ox<g.ox;else if(v<.88){D="walk";let F=(v-.56)/.32,Y=Ui(F);G=g.ox+(C.ox-g.ox)*Y,L=g.oy+(C.oy-g.oy)*Y,A=C.ox<g.ox;let U=s>=4?s-2:0,N=m*n.strideHz;if(U>=2){let J=U>2?U*.5:1;T=2+Math.floor(N*J)%U}else s>=2&&(T=Math.floor(N)%s);let R=Math.sin(F*Math.PI),B=.5-.5*Math.cos(N*Math.PI*2);x=a?B*n.hopAmp*R:0}else D="idle",G=C.ox,L=C.oy,A=C.ox<g.ox,T=0;return{ox:G,oy:L,hopLift:x,frameIndex:T,flipX:A,scaleFactor:y,tintHash:S,behavior:D}}function Ao(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:i,timeSec:n,animate:s}=t,u=[],a=new Set;if(!r||r.length===0)return{actors:u,coveredSiteIds:a};let l=e.infrastructure.sprites;for(let c=0;c<r.length;c++){let h=r[c];if(h.family!=="fauna")continue;let f=o(h.q,h.r);if(f===0)continue;let m=Hi(h,e);if(!m)continue;let p=Eo[m];if(!p)continue;let v=l[p.spriteKey];if(!v)continue;a.add(h.id);let g=Math.max(1,v.frameCount??4),C=v.frameSize?v.frameSize[0]:Math.max(1,v.sourceSize[0]/g),y=(v.frameSize?v.frameSize[1]:v.sourceSize[1])/Math.max(1,C),S=We(h.q,h.r);for(let G=0;G<p.herdSize&&!(u.length>=nr);G++){let L=Gi({q:h.q,r:h.r,memberIdx:G,herdSize:p.herdSize,profile:p,frameCount:g,timeSec:n,animate:s}),x=S.x+L.ox,T=S.y+L.oy,D=i?i(x,T/Ae)*Ae:0,A=p.baseWidth*L.scaleFactor,F=A*y;u.push({x,groundY:T,y:T-D-L.hopLift,hopLift:Math.max(0,L.hopLift),width:A,height:F,frameIndex:L.frameIndex,frameCount:g,flipX:L.flipX,tintHash:L.tintHash,behavior:L.behavior,fogState:f,page:v.page,u0:v.uv[0],v0:v.uv[1],u1:v.uv[2],v1:v.uv[3]})}}return u.sort((c,h)=>c.groundY-h.groundY||c.x-h.x),{actors:u,coveredSiteIds:a}}var Oi=`#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aPosSize; // (cx, cy, rx, ry)
layout(location = 2) in float aAlpha;

uniform vec2 uCamCenter;
uniform vec2 uViewportLogical;
uniform float uZoom;

out vec2 vLocal;
out float vAlpha;

void main() {
  vLocal = aCorner * 2.0 - 1.0;
  vAlpha = aAlpha;
  vec2 worldPos = aPosSize.xy + vLocal * aPosSize.zw;
  vec2 screenPx = (worldPos - uCamCenter) * uZoom + uViewportLogical * 0.5;
  vec2 ndc = vec2(
    (screenPx.x / uViewportLogical.x) * 2.0 - 1.0,
    1.0 - (screenPx.y / uViewportLogical.y) * 2.0
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`,Vi=`#version 300 es
precision highp float;

in vec2 vLocal;
in float vAlpha;
out vec4 fragColor;

void main() {
  float d2 = dot(vLocal, vLocal);
  if (d2 >= 1.0) discard;
  float soft = pow(1.0 - d2, 1.65);
  fragColor = vec4(0.06, 0.09, 0.13, soft * vAlpha);
}
`,Ni=`#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;   // (0..1, 0..1)
layout(location = 1) in vec4 aRect;     // (left, top, width, height)
layout(location = 2) in vec4 aUv;       // (u0, v0, u1, v1) - u0>u1 flips X!
layout(location = 3) in vec2 aMeta;     // (fogState, tintHash)

uniform vec2 uCamCenter;
uniform vec2 uViewportLogical;
uniform float uZoom;

out vec2 vUv;
out float vFog;
out float vTint;

void main() {
  vec2 worldPos = aRect.xy + aCorner * aRect.zw;
  vec2 screenPx = (worldPos - uCamCenter) * uZoom + uViewportLogical * 0.5;
  vec2 ndc = vec2(
    (screenPx.x / uViewportLogical.x) * 2.0 - 1.0,
    1.0 - (screenPx.y / uViewportLogical.y) * 2.0
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
  vUv = mix(aUv.xy, aUv.zw, aCorner);
  vFog = aMeta.x;
  vTint = aMeta.y;
}
`,Xi=`#version 300 es
precision highp float;

uniform sampler2D uAtlas;
uniform float uDetailOpacity;
uniform float uNaturePolish;

in vec2 vUv;
in float vFog;
in float vTint;
out vec4 fragColor;

void main() {
  vec4 tex = texture(uAtlas, vUv);
  float alpha = tex.a * uDetailOpacity;
  if (alpha < 0.04) discard;

  vec3 col = tex.rgb;
  // Subtle organic per-animal coat variation (+-6% brightness, gentle warm/cool shift)
  float varB = 0.94 + vTint * 0.12;
  vec3 varTint = mix(vec3(0.97, 0.98, 1.02), vec3(1.04, 1.00, 0.95), vTint);
  col = clamp(col * varB * varTint, 0.0, 1.0);

  // Harmonize gently with map palette (matches polish.js cohesion)
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, 1.0 - 0.10 * uNaturePolish);

  // Explored Fog-of-War dimming
  if (vFog < 1.5) {
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(l) * vec3(0.84, 0.90, 1.04), 0.45) * 0.68;
  }

  fragColor = vec4(col, alpha);
}
`;function Mo(t,e,r){let o=(u,a)=>{let l=t.createShader(u);if(!l)throw new Error("Failed to create AnimatedActorPass shader.");if(t.shaderSource(l,a),t.compileShader(l),!t.getShaderParameter(l,t.COMPILE_STATUS)){let c=t.getShaderInfoLog(l)??"unknown";throw t.deleteShader(l),new Error(`AnimatedActorPass shader compile failed: ${c}`)}return l},i=o(t.VERTEX_SHADER,e),n=o(t.FRAGMENT_SHADER,r),s=t.createProgram();if(!s)throw new Error("Failed to link AnimatedActorPass program.");if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS)){let u=t.getProgramInfoLog(s)??"unknown";throw t.deleteProgram(s),new Error(`AnimatedActorPass link failed: ${u}`)}return s}var Pr=class{constructor(e){this.shadowData=new Float32Array(nr*5);this.actorData=new Float32Array(nr*10);this.gl=e;let r=new Float32Array([0,0,1,0,0,1,1,0,1,1,0,1]),o=e.createBuffer();if(!o)throw new Error("AnimatedActorPass quad VBO alloc failed.");this.quadVbo=o,e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),this.shadowProgram=Mo(e,Oi,Vi),this.shLocCam=e.getUniformLocation(this.shadowProgram,"uCamCenter"),this.shLocViewport=e.getUniformLocation(this.shadowProgram,"uViewportLogical"),this.shLocZoom=e.getUniformLocation(this.shadowProgram,"uZoom");let i=e.createVertexArray(),n=e.createBuffer();if(!i||!n)throw new Error("AnimatedActorPass shadow VAO alloc failed.");this.shadowVao=i,this.shadowVbo=n,e.bindVertexArray(i),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,this.shadowData.byteLength,e.DYNAMIC_DRAW);let s=20;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,s,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,1,e.FLOAT,!1,s,16),e.vertexAttribDivisor(2,1),this.actorProgram=Mo(e,Ni,Xi),this.acLocCam=e.getUniformLocation(this.actorProgram,"uCamCenter"),this.acLocViewport=e.getUniformLocation(this.actorProgram,"uViewportLogical"),this.acLocZoom=e.getUniformLocation(this.actorProgram,"uZoom"),this.acLocAtlas=e.getUniformLocation(this.actorProgram,"uAtlas"),this.acLocDetail=e.getUniformLocation(this.actorProgram,"uDetailOpacity"),this.acLocPolish=e.getUniformLocation(this.actorProgram,"uNaturePolish");let u=e.createVertexArray(),a=e.createBuffer();if(!u||!a)throw new Error("AnimatedActorPass actor VAO alloc failed.");this.actorVao=u,this.actorVbo=a,e.bindVertexArray(u),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.actorData.byteLength,e.DYNAMIC_DRAW);let l=40;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,l,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,l,16),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,2,e.FLOAT,!1,l,32),e.vertexAttribDivisor(3,1),e.bindVertexArray(null)}render(e){let{cam:r,assets:o,actors:i,detailOpacity:n,shadowOpacity:s,naturePolish:u}=e;if(i.length===0||n<=.03)return{drawCalls:0,renderedActors:0};let a=this.gl,l=0;if(a.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA),s>.02){let m=0,p=this.shadowData;for(let v=0;v<i.length&&m<nr;v++){let g=i[v],C=Math.max(.68,1-g.hopLift*.04),P=g.width*.36*C,y=g.width*.14*C,S=m*5;p[S]=g.x-g.width*.12,p[S+1]=g.y+g.hopLift+2,p[S+2]=P,p[S+3]=y,p[S+4]=s*.74*C*n*(g.fogState===1?.55:1),m++}m>0&&(a.useProgram(this.shadowProgram),a.uniform2f(this.shLocCam,r.x,r.y),a.uniform2f(this.shLocViewport,r.viewportWidth,r.viewportHeight),a.uniform1f(this.shLocZoom,r.zoom),a.bindVertexArray(this.shadowVao),a.bindBuffer(a.ARRAY_BUFFER,this.shadowVbo),a.bufferSubData(a.ARRAY_BUFFER,0,p.subarray(0,m*5)),a.drawArraysInstanced(a.TRIANGLES,0,6,m),l++)}a.useProgram(this.actorProgram),a.uniform2f(this.acLocCam,r.x,r.y),a.uniform2f(this.acLocViewport,r.viewportWidth,r.viewportHeight),a.uniform1f(this.acLocZoom,r.zoom),a.uniform1i(this.acLocAtlas,0),a.uniform1f(this.acLocDetail,n),a.uniform1f(this.acLocPolish,u),a.bindVertexArray(this.actorVao);let c=this.actorData,h=0,f=0;for(;f<i.length;){let m=i[f].page,p=o.infraPages[m],v=0;for(;f<i.length&&i[f].page===m&&v<nr;){let g=i[f++];if(!p)continue;let C=g.x-g.width*.5,P=g.y-g.height*.92,y=(g.u1-g.u0)/g.frameCount,S=y*.004,G=g.u0+y*g.frameIndex+S,L=g.u0+y*(g.frameIndex+1)-S,x=v*10;c[x]=C,c[x+1]=P,c[x+2]=g.width,c[x+3]=g.height,c[x+4]=g.flipX?L:G,c[x+5]=g.v0,c[x+6]=g.flipX?G:L,c[x+7]=g.v1,c[x+8]=g.fogState,c[x+9]=g.tintHash,v++}v>0&&p&&(a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,p),a.bindBuffer(a.ARRAY_BUFFER,this.actorVbo),a.bufferSubData(a.ARRAY_BUFFER,0,c.subarray(0,v*10)),a.drawArraysInstanced(a.TRIANGLES,0,6,v),l++,h+=v)}return a.bindVertexArray(null),{drawCalls:l,renderedActors:h}}dispose(){this.gl.deleteBuffer(this.quadVbo),this.gl.deleteBuffer(this.shadowVbo),this.gl.deleteVertexArray(this.shadowVao),this.gl.deleteProgram(this.shadowProgram),this.gl.deleteBuffer(this.actorVbo),this.gl.deleteVertexArray(this.actorVao),this.gl.deleteProgram(this.actorProgram)}};function zi(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function Tr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function bn(t,e,r,o,i){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&i>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,i)),n}async function vn(t,e,r="auto",o){let i=e.replace(/\/+$/,""),n=await fetch(`${i}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${i}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let s=await n.json();if(s.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${s.schema}`);let u=zi(t,r),a=u==="mobile"?Math.min(256,s.terrain.textureSize):s.terrain.textureSize,l=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),c=l?t.getParameter(l.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,h=s.terrain.layers.length+s.nature.pages.length+s.shadows.pages.length+s.infrastructure.pages.length+(s.clouds.files.length>0?1:0),f=0,m=R=>{f+=1,o?.(f,h,R)},p=t.createTexture();if(!p)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,p);let v=Math.max(1,s.terrain.layers.length),g=Math.floor(Math.log2(a))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,g,t.RGBA8,a,a,v),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let C=a!==s.terrain.textureSize?{width:a,height:a}:void 0,P=s.terrain.layers;for(let R=0;R<P.length;R+=8){let B=P.slice(R,R+8),J=await Promise.all(B.map(z=>Tr(`${i}/${z.file}`,C)));t.bindTexture(t.TEXTURE_2D_ARRAY,p);for(let z=0;z<B.length;z++){let w=J[z];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,B[z].layer,a,a,1,t.RGBA,t.UNSIGNED_BYTE,w),w.close(),m(`Terrain ${B[z].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,p),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),l&&c>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,l.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,c));let y=u==="mobile"?.5:1,S=async(R,B)=>(await Promise.all(R.map(z=>Tr(`${i}/${z.file}`,y<1?{width:Math.max(256,Math.round(z.width*y)),height:Math.max(256,Math.round(z.height*y))}:void 0)))).map((z,w)=>{let k=bn(t,z,t.CLAMP_TO_EDGE,l,c);return z.close(),m(`${B} ${w+1}/${R.length}`),k}),[G,L,x]=await Promise.all([S(s.nature.pages,"Natur-Atlas"),S(s.shadows.pages,"Schatten-Atlas"),S(s.infrastructure.pages,"Infra-Atlas")]),T=null,D=null;if(s.clouds.files.length>0){let R=s.clouds.files.find(w=>w.id.startsWith("cloud_base"))??s.clouds.files[0],B=s.clouds.files.find(w=>w.id.startsWith("cloud_edge")),[J,z]=await Promise.all([Tr(`${i}/${R.file}`),B?Tr(`${i}/${B.file}`):Promise.resolve(null)]);T=bn(t,J,t.REPEAT,l,c),J.close(),z&&(D=bn(t,z,t.REPEAT,l,c),z.close()),m("Nebel-Wolken")}let F=s.terrain.byType.forest_floor?.layers?.[0]??0,U=(s.terrain.byType.coastal_water??s.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:s,vramTier:u,terrainArray:p,terrainLayerSize:a,forestFloorLayer:F,coastalWaterLayer:U,naturePages:G,shadowPages:L,infraPages:x,cloudTexture:T,cloudEdgeTexture:D,dispose:()=>{t.deleteTexture(p);for(let R of G)t.deleteTexture(R);for(let R of L)t.deleteTexture(R);for(let R of x)t.deleteTexture(R);T&&t.deleteTexture(T),D&&t.deleteTexture(D)}}}var Yi=316/384;function Po(t,e){return{x:256*(t+e*.5),y:Ye*e}}function Ki(t,e,r,o){let i=e.x-t.x,n=e.y-t.y,s=o.x-r.x,u=o.y-r.y,a=i*u-n*s;if(Math.abs(a)<1e-9)return null;let l=r.x-t.x,c=r.y-t.y,h=(l*u-c*s)/a,f=(l*n-c*i)/a;return h<0||h>1||f<0||f>1?null:{x:t.x+h*i,y:t.y+h*n}}function To(t){let{roads:e,routes:r=[],manualRivers:o=[],lookupFog:i,isWaterHex:n}=t;if(e.length===0||r.length===0&&o.length===0)return[];let s=[];for(let a of r){let l=er(a,34,n);l&&l.points.length>=2&&s.push(l)}if(o.length>0){let a=fn(o,34);for(let l of a)l.points.length>=2&&s.push(l)}if(s.length===0)return[];let u=[];for(let a of e){let l=at(a.q1,a.r1,a.q2,a.r2);if(l<0)continue;let c=i(a.q1,a.r1),h=i(a.q2,a.r2),f=c>=h?c:h;if(f===0)continue;let m=Po(a.q1,a.r1),p=Po(a.q2,a.r2),v=p.x-m.x,g=p.y-m.y,C=Math.hypot(v,g)||1,P=[];for(let S of s){let G=S.points,L=Math.max(18,S.width*.72);for(let x=1;x<G.length;x++){let T=G[x-1],D=G[x],A=Ki(m,p,T,D);if(!A)continue;let F=D.x-T.x,Y=D.y-T.y;Math.abs(v*Y-g*F)/(C*(Math.hypot(F,Y)||1))<=.16||P.some(N=>Math.hypot(N.x-A.x,N.y-A.y)<L)||u.some(N=>Math.hypot(N.ux-A.x,N.uy-A.y)<L)||P.push({x:A.x,y:A.y,width:S.width})}}let y=a.tier==="stone"?"stone":"timber";for(let S of P)u.push({ux:S.x,uy:S.y,dir:l,material:y,tier:a.tier,length:Math.max(96,S.width+64),fogState:f})}return u}function ko(t){let{manifest:e,crossings:r,sampleReliefHeight:o}=t;if(r.length===0)return[];let i=e.infrastructure.sprites,n=[];for(let s of r){let u=String(s.dir).padStart(2,"0"),a=`bridges/${s.material}/bridge_dir_${u}`,l=`bridges/${s.material==="stone"?"timber":"stone"}/bridge_dir_${u}`,c=i[a]??i[l];if(!c)continue;let h=s.length/Yi,f=s.uy*Ae,m=o?o(s.ux,s.uy)*Ae:0,p=f-m,v=e.shadows.sprites[`bridge_shadow:axis${s.dir%3}`],g=100,C=v?{shadowPage:v.page,shadowU0:v.uv[0],shadowV0:v.uv[1],shadowU1:v.uv[2],shadowV1:v.uv[3],shadowRelLeft:v.boundsInSpriteWidth[0]*g,shadowRelTop:v.boundsInSpriteWidth[1]*g,shadowWidth:(v.boundsInSpriteWidth[2]-v.boundsInSpriteWidth[0])*g,shadowHeight:(v.boundsInSpriteWidth[3]-v.boundsInSpriteWidth[1])*g}:{};n.push({x:s.ux,y:p,relLeft:-h*.5,relTop:-h*.5,width:h,height:h,page:c.page,u0:c.uv[0],v0:c.uv[1],u1:c.uv[2],v1:c.uv[3],sortY:f-26,fogState:s.fogState,...C})}return n}var ji={"buildings/centers/outpost":156,"buildings/centers/settlement":170,"buildings/centers/city":182,"buildings/centers/metropolis":190,"buildings/centers/capital_t1":192,"buildings/tier1/farm":174,"buildings/tier1/lumber_camp":164,"buildings/tier1/quarry":172,"buildings/tier1/iron_mine":168,"buildings/tier1/fortress":182,"buildings/tier1/watchtower":100,"buildings/tier1/harbor":184},$i={"buildings/centers/outpost":[.5,.72],"buildings/centers/settlement":[.5,.72],"buildings/centers/city":[.5,.71],"buildings/centers/metropolis":[.5,.72],"buildings/centers/capital_t1":[.5,.74],"buildings/tier1/farm":[.5,.7],"buildings/tier1/lumber_camp":[.5,.72],"buildings/tier1/quarry":[.5,.68],"buildings/tier1/iron_mine":[.5,.72],"buildings/tier1/fortress":[.5,.74],"buildings/tier1/watchtower":[.5,.87],"buildings/tier1/harbor":[.5,.7]};function Zi(t,e,r,o){let i=t.infrastructure.sprites,n=Math.max(1,Math.min(4,Math.round(r||1))),s=[];if(e==="capital")for(let u=n;u>=1;u--)s.push(`buildings/centers/capital_t${u}`);else if(e==="settlement")o&&s.push(`buildings/centers/${o}`),n>=4&&s.push("buildings/centers/metropolis"),n>=3&&s.push("buildings/centers/city"),n>=2&&s.push("buildings/centers/settlement"),s.push("buildings/centers/outpost"),s.push("buildings/centers/settlement");else for(let u=n;u>=1;u--)s.push(`buildings/tier${u}/${e}`);for(let u of s)if(i[u])return u;return null}function Wo(t){let{manifest:e,buildings:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredBuildingIds:s};let u=e.infrastructure.sprites;for(let a of r){let l=o(a.q,a.r);if(l===0)continue;let c=Zi(e,a.kind,a.level,a.centerStage);if(!c)continue;let h=u[c];if(!h)continue;s.add(a.id);let f=We(a.q,a.r),m=f.x,p=f.y/Ae,v=i?i(m,p)*Ae:0,g=f.y-v,C=ji[c]??200,[P,y]=h.sourceSize,S=P>0?y/P:1,G=C*S,[L,x]=$i[c]??[.5,.72],T=e.shadows.sprites[`building_shadow:${c}`],D=T?{shadowPage:T.page,shadowU0:T.uv[0],shadowV0:T.uv[1],shadowU1:T.uv[2],shadowV1:T.uv[3],shadowRelLeft:T.boundsInSpriteWidth[0]*C,shadowRelTop:T.boundsInSpriteWidth[1]*C,shadowWidth:(T.boundsInSpriteWidth[2]-T.boundsInSpriteWidth[0])*C,shadowHeight:(T.boundsInSpriteWidth[3]-T.boundsInSpriteWidth[1])*C}:{};n.push({x:m,y:g,relLeft:-C*L,relTop:-G*x,width:C,height:G,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:f.y+8,fogState:l,...D})}return n.sort((a,l)=>a.sortY-l.sortY||a.x-l.x),{sprites:n,coveredBuildingIds:s}}var kr=.08,Wr=2,Fo=.15,yn=.21;function xn(t){return t>=yn?0:t<=Fo?1:(yn-t)/(yn-Fo)}function Lo(t){return xn(t)>=.5?"strategic":"detail"}function Fr(t,e,r){return t<e?e:t>r?r:t}var Lr=class{constructor(e,r,o,i){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],i=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,s=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,s,this.pinchStartZoom*(i/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,i=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,i),this.state.x-=o/this.state.zoom,this.state.y-=i/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=Ht(r.x,r.y,this.state),i=je(o.x,o.y),n=`${i.q},${i.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(i))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,i=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,s]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=s,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=Ht(i.x,i.y,this.state),s=je(n.x,n.y);this.callbacks.onHexClick?.(s),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:s})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=i;let n=We(r.q,r.r),s=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:Fr(o,kr,Wr),viewportWidth:Math.max(1,s.width||e.clientWidth||1280),viewportHeight:Math.max(1,s.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),i=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*i)),s=Math.max(1,Math.round(o*i)),u=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==i||this.canvas.width!==n||this.canvas.height!==s;return u&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=i,this.canvas.width=n,this.canvas.height=s),u}centerOnHex(e,r,o){let i=We(e,r);this.state.x=i.x,this.state.y=i.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=Fr(o,kr,Wr)),this.callbacks.onChange()}setZoom(e){this.state.zoom=Fr(e,kr,Wr),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let i=Fr(o,kr,Wr);if(Math.abs(i-this.state.zoom)<1e-5)return;let n=Ht(e,r,this.state);this.state.zoom=i;let s=Ht(e,r,this.state);this.state.x+=n.x-s.x,this.state.y+=n.y-s.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var Io={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function Ir(t,e,r){return t<e?e:t>r?r:t}function Qi(t,e,r,o,i,n){let s=i-r,u=n-o,a=s*s+u*u,l=a>1e-6?Ir(((t-r)*s+(e-o)*u)/a,0,1):0,c=r+l*s,h=o+l*u,f=t-c,m=e-h;return f*f+m*m}function wn(t){if(!t)return Io;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let i of t.buildings){e.add(De(i.q,i.r));let n=We(i.q,i.r),s=i.kind==="capital"||i.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-64,maxX:n.x+s+64,minY:n.y-s-64,maxY:n.y+s+64})}if(t.sites&&t.sites.length>0)for(let i of t.sites){let n=We(i.q,i.r),s=i.family==="fauna"?80:78;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-56,maxX:n.x+s+56,minY:n.y-s-56,maxY:n.y+s+56})}if(t.walls&&t.walls.length>0)for(let i of t.walls){let n=at(i.q1,i.r1,i.q2,i.r2);if(n<0)continue;let{a:s,b:u}=dt(i.q1,i.r1,n),a=i.isGate?i.kind==="stone"?24:20:i.kind==="stone"?18:14,l=i.kind==="stone"?26:16,c=l+64;r.push({ax:s.x,ay:s.y,bx:u.x,by:u.y,halfWidth:a,pierRadius:l,minX:Math.min(s.x,u.x)-c,maxX:Math.max(s.x,u.x)+c,minY:Math.min(s.y,u.y)-c,maxY:Math.max(s.y,u.y)+c,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let i of t.roads){let n=We(i.q1,i.r1),s=We(i.q2,i.r2),u=i.tier==="stone"?30:i.tier==="packed"?24:18,a=u+56;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:u,minX:Math.min(n.x,s.x)-a,maxX:Math.max(n.x,s.x)+a,minY:Math.min(n.y,s.y)-a,maxY:Math.max(n.y,s.y)+a,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let i of t.rivers){let{a:n,b:s}=dt(i.q,i.r,i.dir),u=22,a=u+48;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:20,minX:Math.min(n.x,s.x)-a,maxX:Math.max(n.x,s.x)+a,minY:Math.min(n.y,s.y)-a,maxY:Math.max(n.y,s.y)+a,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?Io:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function Sn(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(De(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,i=Ir(t.width*.42,12,48),n=Ir(t.width*.34,10,34),s=Ir(t.width*.28,8,26),u=e.discs;for(let l=0;l<u.length;l++){let c=u[l];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let h=r-c.cx,f=o-c.cy,m=c.radius+n*.6;if(h*h+f*f<=m*m)return!0}let a=e.segments;for(let l=0;l<a.length;l++){let c=a[l];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let h=c.kind==="wall"?i:c.kind==="road"?n:s,f=c.halfWidth+h+(c.kind==="wall"?8:4);if(Qi(r,o,c.ax,c.ay,c.bx,c.by)<=f*f)return!0;if(c.kind==="wall"){let m=c.pierRadius+i+6,p=m*m,v=r-c.ax,g=o-c.ay;if(v*v+g*g<=p)return!0;let C=r-c.bx,P=o-c.by;if(C*C+P*P<=p)return!0}}return!1}function Ji(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function Dr(t,e,r,o,i,n,s=.86){t.font=`600 ${n}px system-ui, -apple-system, sans-serif`;let u=t.measureText(o),a=Math.max(6,n*.55),l=Math.max(3,n*.3),c=u.width+a*2,h=n+l*2,f=e-c*.5,m=r-h*.5,p=Math.min(8,h*.45);t.beginPath(),t.roundRect(f,m,c,h,p),t.fillStyle=`rgba(12, 17, 23, ${s})`,t.fill(),t.lineWidth=1.4,t.strokeStyle=Ji(i,.9),t.stroke(),t.fillStyle="#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5)}var _n=new WeakSet;function Do(t){let{canvas:e,cam:r,scene:o,lookupFog:i,strategicBlend:n,timeSec:s}=t,u=Math.max(1,Math.round(r.viewportWidth*r.dpr)),a=Math.max(1,Math.round(r.viewportHeight*r.dpr)),l=!!(o&&(o.buildings&&o.buildings.length>0||o.sites&&o.sites.length>0||o.units&&o.units.length>0));if(!o||!l){(_n.has(e)||e.width!==u||e.height!==a)&&(e.width=u,e.height=a,_n.delete(e));return}(e.width!==u||e.height!==a)&&(e.width=u,e.height=a);let c=e.getContext("2d");if(!c)return;c.setTransform(r.dpr,0,0,r.dpr,0,0),c.clearRect(0,0,r.viewportWidth,r.viewportHeight),_n.add(e);let h=n>=.5;if(o.buildings)for(let f of o.buildings){let m=i(f.q,f.r);if(m===0)continue;let p=f.kind==="capital"||f.kind==="settlement",v=p||f.kind==="fortress"||f.kind==="harbor";if(h&&!v)continue;let g=We(f.q,f.r),C=Gt(g.x,g.y,r);if(C.x<-120||C.x>r.viewportWidth+120||C.y<-80||C.y>r.viewportHeight+80)continue;let P=typeof f.yieldPercent=="number"&&!h?` \xB7 ${f.yieldPercent}%`:"",y=p?`\u2605 ${f.label} (R${f.level})`:`${f.label} L${f.level}${P}`,S=h?-18:Math.max(30,(p?56:50)*r.zoom);if(Dr(c,C.x,C.y+S,y,f.factionColor,p?h?12:12.5:10.5,m===1?.65:.88),typeof f.constructionProgress=="number"&&f.constructionProgress>0&&f.constructionProgress<1&&!h){let x=C.x-27,T=C.y+S+13;c.fillStyle="rgba(10, 15, 22, 0.85)",c.fillRect(x,T,54,5),c.fillStyle="#f59e0b",c.fillRect(x+1,T+1,52*f.constructionProgress,3)}}if(o.sites&&!h&&r.zoom>=.45)for(let f of o.sites){if(i(f.q,f.r)===0)continue;let m=We(f.q,f.r),p=Gt(m.x,m.y,r);if(p.x<-80||p.x>r.viewportWidth+80||p.y<-50||p.y>r.viewportHeight+50)continue;let v=Math.max(30,(f.family==="fauna"?64:54)*r.zoom);Dr(c,p.x,p.y+v,f.label,f.family==="fauna"?[.55,.84,.48]:[.85,.68,.35],10,.78)}if(o.units)for(let f of o.units){if(i(f.q,f.r)<2)continue;let m=We(f.q,f.r);if(f.marchPath&&f.marchPath.length>=2){let C=We(f.marchPath[0].q,f.marchPath[0].r),P=We(f.marchPath[1].q,f.marchPath[1].r),y=s*.14%1;m={x:C.x+(P.x-C.x)*y,y:C.y+(P.y-C.y)*y}}let p=Gt(m.x,m.y,r);if(p.x<-100||p.x>r.viewportWidth+100||p.y<-60||p.y>r.viewportHeight+60)continue;let v=f.kind==="siege_army"?"\u2694":f.kind==="army"?"\u{1F6E1}":f.kind==="scout"?"\u{1F441}":f.kind==="boat"?"\u26F5":"\u2696",g=typeof f.strength=="number"?` ${f.strength}${f.rams?` + ${f.rams}R`:""}`:"";Dr(c,p.x,p.y-Math.max(20,34*r.zoom),`${v} ${f.label}${g}`,f.factionColor,h?10.5:11,.92)}if(o.buildPreview){let f=o.buildPreview,m=We(f.center.q,f.center.r),p=Gt(m.x,m.y,r),v=f.yieldPercent-100,g=f.valid?`${f.buildingKind} \xB7 Ertrag ${f.yieldPercent}% (+${v}% R2)`:`Nicht baubar: ${f.reason??"ung\xFCltig"}`;Dr(c,p.x,p.y-34,g,f.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var qr=65536,Br=12,ea={trail:{tierIndex:0,width:19,shoulder:32,outer:44,rough:.16,opacity:.78},packed:{tierIndex:1,width:28,shoulder:38,outer:48,rough:.075,opacity:.87},stone:{tierIndex:2,width:34,shoulder:43,outer:52,rough:.028,opacity:.96}},ta=["trail","packed","stone"],ra=`#version 300 es
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
`,na=`#version 300 es
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
`,oa=`#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(pos, 0.0, 1.0);
  v_uv = pos * 0.5 + 0.5;
}
`,ia=`#version 300 es
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
`;function Cn(t,e,r=0){let o=Math.imul(t+37,374761393)^Math.imul(e+91,668265263)^Math.imul(r+7,2246822519);return o^=o>>>13,o=Math.imul(o,1274126177),(o^o>>>16)>>>0}function Ur(t,e){return{x:256*(t+e*.5),y:Ye*e}}function aa(t,e,r,o,i=14){let n=t>r||t===r&&e>o,s=n?r:t,u=n?o:e,a=n?t:r,l=n?e:o,c=Ur(s,u),h=Ur(a,l),f=h.x-c.x,m=h.y-c.y,p=Math.hypot(f,m)||1,v=-m/p,g=f/p,P=(Cn(s+a,u+l,Cn(s-a,u-l,11))%2001/1e3-1)*4.2,y=[];for(let S=0;S<=i;S++){let G=S/i,L=P*Math.sin(G*2*Math.PI);y.push({x:c.x+f*G+v*L,y:c.y+m*G+g*L})}return y}var Hr=class{constructor(e){this.verts=new Float32Array(qr*Br);this.vertCount=0;this.maskFbo=null;this.maskTex=null;this.maskW=0;this.maskH=0;this.gl=e,this.maskProg=this.compileProgram(ra,na,"RoadMask"),this.compProg=this.compileProgram(oa,ia,"RoadComp");let r=e.createVertexArray(),o=e.createBuffer(),i=e.createVertexArray();if(!r||!o||!i)throw new Error("Failed to allocate RoadPass VAO/VBO");this.vao=r,this.vbo=o,this.compVao=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let n=Br*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.bindVertexArray(null);let s=(u,a)=>{let l=e.getUniformLocation(u,a);if(!l)throw new Error(`Missing road uniform: ${a}`);return l};this.uMaskCamCenter=s(this.maskProg,"u_camCenter"),this.uMaskViewportSize=s(this.maskProg,"u_viewportSize"),this.uMaskZoom=s(this.maskProg,"u_zoom"),this.uMaskTier=s(this.maskProg,"u_tier"),this.uCompCamCenter=s(this.compProg,"u_camCenter"),this.uCompViewportSize=s(this.compProg,"u_viewportSize"),this.uCompZoom=s(this.compProg,"u_zoom"),this.uCompTier=s(this.compProg,"u_tier"),this.uCompOpacity=s(this.compProg,"u_opacity"),this.uCompFade=s(this.compProg,"u_fade"),e.useProgram(this.compProg),e.uniform1i(e.getUniformLocation(this.compProg,"u_roadMaskTex"),0)}compileProgram(e,r,o){let{gl:i}=this,n=i.createShader(i.VERTEX_SHADER),s=i.createShader(i.FRAGMENT_SHADER);if(!n||!s)throw new Error(`Failed to allocate ${o} shaders`);if(i.shaderSource(n,e),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw new Error(`${o} VS error: ${i.getShaderInfoLog(n)}`);if(i.shaderSource(s,r),i.compileShader(s),!i.getShaderParameter(s,i.COMPILE_STATUS))throw new Error(`${o} FS error: ${i.getShaderInfoLog(s)}`);let u=i.createProgram();if(!u)throw new Error(`Failed to allocate ${o} program`);if(i.attachShader(u,n),i.attachShader(u,s),i.linkProgram(u),i.deleteShader(n),i.deleteShader(s),!i.getProgramParameter(u,i.LINK_STATUS))throw new Error(`${o} link error: ${i.getProgramInfoLog(u)}`);return u}ensureMaskFbo(e,r){let o=Math.max(1,e),i=Math.max(1,r);if(this.maskFbo&&this.maskW===o&&this.maskH===i)return;let{gl:n}=this;this.maskTex&&n.deleteTexture(this.maskTex),this.maskFbo&&n.deleteFramebuffer(this.maskFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate RoadPass mask FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA8,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.maskTex=s,this.maskFbo=u,this.maskW=o,this.maskH=i}pushVert(e,r,o,i,n,s,u,a,l,c,h){if(this.vertCount>=qr)return;let f=this.vertCount*Br,m=this.verts;m[f++]=e,m[f++]=r,m[f++]=o,m[f++]=i,m[f++]=n,m[f++]=s,m[f++]=u,m[f++]=a,m[f++]=l,m[f++]=c,m[f++]=h,m[f++]=0,this.vertCount++}emitTierGeometry(e,r,o,i){this.vertCount=0;let n=r.width*.5,s=r.shoulder*.5,u=r.outer*.5,a=r.rough,l=(f,m)=>{let p=i?i(f,m):0;return{x:f,y:(m-p)*Ae}},c=new Map;for(let f=0;f<e.length;f++){let m=e[f],p=o(m.q1,m.r1),v=o(m.q2,m.r2);if(p===0&&v===0)continue;let g=p===2||v===2?1:.66,C=aa(m.q1,m.r1,m.q2,m.r2,14),P=C.length,y=Cn(m.q1+m.q2,m.r1+m.r2,r.tierIndex+3)%628/100,S=De(m.q1,m.r1),G=Ur(m.q1,m.r1),L=c.get(S);(!L||g>L.fogDim)&&c.set(S,{ux:G.x,uy:G.y,fogDim:g});let x=De(m.q2,m.r2),T=Ur(m.q2,m.r2),D=c.get(x);(!D||g>D.fogDim)&&c.set(x,{ux:T.x,uy:T.y,fogDim:g});let A=new Float32Array(P),F=new Float32Array(P),Y=new Float32Array(P),U=new Float32Array(P),N=new Float32Array(P);for(let R=0;R<P;R++){R>0&&(Y[R]=Y[R-1]+Math.hypot(C[R].x-C[R-1].x,C[R].y-C[R-1].y));let B=C[Math.max(0,R-1)],J=C[Math.min(P-1,R+1)],z=J.x-B.x,w=J.y-B.y,k=Math.hypot(z,w)||1;A[R]=-w/k,F[R]=z/k;let M=R/(P-1),W=Math.sin(Math.PI*M);U[R]=n*(1+a*W*(.69*Math.sin(M*12+y)+.36*Math.cos(M*17+y))),N[R]=n*(1+a*W*(.63*Math.cos(M*11+y)-.32*Math.sin(M*18+y)))}for(let R=0;R<P-1&&!(this.vertCount+6>qr);R++){let B=R/(P-1),J=(R+1)/(P-1),z=C[R],w=C[R+1],k=l(z.x-A[R]*u,z.y-F[R]*u),M=l(z.x+A[R]*u,z.y+F[R]*u),W=l(w.x-A[R+1]*u,w.y-F[R+1]*u),E=l(w.x+A[R+1]*u,w.y+F[R+1]*u);this.pushVert(k.x,k.y,-u,0,U[R],s,u,B,g,-u,Y[R]),this.pushVert(M.x,M.y,u,0,N[R],s,u,B,g,u,Y[R]),this.pushVert(E.x,E.y,u,0,N[R+1],s,u,J,g,u,Y[R+1]),this.pushVert(k.x,k.y,-u,0,U[R],s,u,B,g,-u,Y[R]),this.pushVert(E.x,E.y,u,0,N[R+1],s,u,J,g,u,Y[R+1]),this.pushVert(W.x,W.y,-u,0,U[R+1],s,u,J,g,-u,Y[R+1])}}let h=14;for(let f of c.values()){let m=l(f.ux,f.uy);for(let p=0;p<h&&!(this.vertCount+3>qr);p++){let v=p/h*Math.PI*2,g=(p+1)/h*Math.PI*2,C=Math.cos(v)*u,P=Math.sin(v)*u,y=Math.cos(g)*u,S=Math.sin(g)*u,G=l(f.ux+C,f.uy+P),L=l(f.ux+y,f.uy+S);this.pushVert(m.x,m.y,0,0,n*1.03,s*1.02,u,-1,f.fogDim,0,0),this.pushVert(G.x,G.y,C,P,n*1.03,s*1.02,u,-1,f.fogDim,0,0),this.pushVert(L.x,L.y,y,S,n*1.03,s*1.02,u,-1,f.fogDim,0,0)}}}render(e){let{cam:r,roads:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s}=e;if(!o||o.length===0||n>=.85)return 0;let u=1-n*.82,{gl:a}=this,l=a.canvas.width,c=a.canvas.height;if(l<=0||c<=0)return 0;let h={trail:[],packed:[],stone:[]};for(let m=0;m<o.length;m++){let p=o[m];(h[p.tier]??h.trail).push(p)}this.ensureMaskFbo(l,c);let f=0;for(let m of ta){let p=h[m];if(p.length===0)continue;let v=ea[m];this.emitTierGeometry(p,v,i,s),this.vertCount!==0&&(a.bindFramebuffer(a.FRAMEBUFFER,this.maskFbo),a.viewport(0,0,this.maskW,this.maskH),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.enable(a.BLEND),a.blendEquation(a.MAX),a.blendFunc(a.ONE,a.ONE),a.useProgram(this.maskProg),a.bindVertexArray(this.vao),a.bindBuffer(a.ARRAY_BUFFER,this.vbo),a.bufferSubData(a.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Br)),a.uniform2f(this.uMaskCamCenter,r.x,r.y),a.uniform2f(this.uMaskViewportSize,r.viewportWidth,r.viewportHeight),a.uniform1f(this.uMaskZoom,r.zoom),a.uniform1f(this.uMaskTier,v.tierIndex),a.drawArrays(a.TRIANGLES,0,this.vertCount),f++,a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,l,c),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.compProg),a.bindVertexArray(this.compVao),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,this.maskTex),a.uniform2f(this.uCompCamCenter,r.x,r.y),a.uniform2f(this.uCompViewportSize,r.viewportWidth,r.viewportHeight),a.uniform1f(this.uCompZoom,r.zoom),a.uniform1f(this.uCompTier,v.tierIndex),a.uniform1f(this.uCompOpacity,v.opacity),a.uniform1f(this.uCompFade,u),a.drawArrays(a.TRIANGLES,0,3),f++)}return a.bindVertexArray(null),f}dispose(){let{gl:e}=this;this.maskTex&&e.deleteTexture(this.maskTex),this.maskFbo&&e.deleteFramebuffer(this.maskFbo),e.deleteBuffer(this.vbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compVao),e.deleteProgram(this.maskProg),e.deleteProgram(this.compProg)}};var qo={watchtower_ruin:{worldW:150,anchor:[.5,.79],sortBiasY:6},forgotten_iron_mine:{worldW:178,anchor:[.5,.74],sortBiasY:6},abandoned_house:{worldW:168,anchor:[.5,.75],sortBiasY:6},dilapidated_barn:{worldW:172,anchor:[.5,.74],sortBiasY:6},waterhole:{worldW:178,anchor:[.5,.56],sortBiasY:-18},oasis:{worldW:194,anchor:[.5,.67],sortBiasY:4},obelisk:{worldW:102,anchor:[.5,.85],sortBiasY:8},stone_circle:{worldW:180,anchor:[.5,.66],sortBiasY:4},iron_deposit:{worldW:162,anchor:[.5,.75],sortBiasY:6}};function Bo(t){return t==="fauna"?null:t==="forgotten_mine"?"forgotten_iron_mine":t in qo?t:null}function sa(t,e,r){let o=t*374761393+e*668265263|0;for(let i=0;i<r.length;i++)o=Math.imul(o^r.charCodeAt(i),1274126177)+2654435769|0;return o^=o>>>15,o=Math.imul(o,2246822519),o^=o>>>13,o>>>0}function la(t,e){let r=t.infrastructure.sprites,o=[];for(let i=1;i<=5;i++){let n=`sites/${e}/${e}_${String(i).padStart(2,"0")}`;r[n]&&o.push(n)}return o}function ca(t,e){let r=Bo(e.family);if(!r)return null;let o=la(t,r);if(o.length===0)return null;let i=e.variantIndex!==void 0?(Math.floor(e.variantIndex)%o.length+o.length)%o.length:sa(e.q,e.r,r)%o.length;return o[i]}function Uo(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredSiteIds:s};let u=e.infrastructure.sprites;for(let a of r){let l=o(a.q,a.r);if(l===0)continue;let c=Bo(a.family);if(!c)continue;let h=ca(e,a);if(!h)continue;let f=u[h];if(!f)continue;s.add(a.id);let m=qo[c],p=We(a.q,a.r),v=p.x,g=p.y/Ae,C=i?i(v,g)*Ae:0,P=p.y-C,[y,S]=f.sourceSize,G=y>0?S/y:1,L=m.worldW;c==="obelisk"&&(G<1.3?L=152:G<2.1?L=112:L=92);let x=L*G,[T,D]=m.anchor,A=e.shadows.sprites[`site_shadow:${h}`],F=A?{shadowPage:A.page,shadowU0:A.uv[0],shadowV0:A.uv[1],shadowU1:A.uv[2],shadowV1:A.uv[3],shadowRelLeft:A.boundsInSpriteWidth[0]*L,shadowRelTop:A.boundsInSpriteWidth[1]*L,shadowWidth:(A.boundsInSpriteWidth[2]-A.boundsInSpriteWidth[0])*L,shadowHeight:(A.boundsInSpriteWidth[3]-A.boundsInSpriteWidth[1])*L}:{};n.push({x:v,y:P,relLeft:-L*T,relTop:-x*D,width:L,height:x,page:f.page,u0:f.uv[0],v0:f.uv[1],u1:f.uv[2],v1:f.uv[3],sortY:p.y+m.sortBiasY,fogState:l,...F})}return n.sort((a,l)=>a.sortY-l.sortY||a.x-l.x),{sprites:n,coveredSiteIds:s}}var Ho=`#version 300 es
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
`,ua=`#version 300 es
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
`,da=`#version 300 es
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
`,Go=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,fa=`#version 300 es
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
`,ha=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function or(t,e,r,o){let i=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!i||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(i)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let s=t.createProgram();if(!s)throw new Error(`Failed to create ${o} program`);if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(s)}`);return s}var ma=`#version 300 es
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
`,pa=`#version 300 es
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
`,Gr=class{constructor(e){this.instanceData=new Float32Array(16384*16);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=or(e,Ho,ua,"sprite"),this.shadowMaskProg=or(e,Ho,da,"shadow-mask"),this.compositeProg=or(e,Go,fa,"shadow-composite"),this.shoreCompositeProg=or(e,Go,ha,"shore-composite"),this.surfProg=or(e,ma,pa,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),i=e.createBuffer();if(!r||!o||!i)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=64;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let s=(u,a)=>{let l=e.getUniformLocation(u,a);if(!l)throw new Error(`Missing uniform ${a}`);return l};this.spCam=s(this.spriteProg,"u_camCenter"),this.spView=s(this.spriteProg,"u_viewportSize"),this.spZoom=s(this.spriteProg,"u_zoom"),this.spScaleY=s(this.spriteProg,"u_scaleY"),this.spShearX=s(this.spriteProg,"u_shearX"),this.spTime=s(this.spriteProg,"u_time"),this.spWindEnabled=s(this.spriteProg,"u_windEnabled"),this.spCanvasSize=s(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=s(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=s(this.spriteProg,"u_selfShadow"),this.spNaturePolish=s(this.spriteProg,"u_naturePolish"),this.spSpriteSat=s(this.spriteProg,"u_spriteSat"),this.spSpriteBright=s(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=s(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=s(this.spriteProg,"u_colorGradeAll"),this.spDecalPass=s(this.spriteProg,"u_decalPass"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=s(this.shadowMaskProg,"u_camCenter"),this.shView=s(this.shadowMaskProg,"u_viewportSize"),this.shZoom=s(this.shadowMaskProg,"u_zoom"),this.shScaleY=s(this.shadowMaskProg,"u_scaleY"),this.shShearX=s(this.shadowMaskProg,"u_shearX"),this.shTime=s(this.shadowMaskProg,"u_time"),this.shWindEnabled=s(this.shadowMaskProg,"u_windEnabled"),this.shDecalPass=s(this.shadowMaskProg,"u_decalPass"),this.sfCam=s(this.surfProg,"u_camCenter"),this.sfView=s(this.surfProg,"u_viewportSize"),this.sfZoom=s(this.surfProg,"u_zoom"),this.sfTime=s(this.surfProg,"u_time"),this.sfWindEnabled=s(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=s(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),i=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===i)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=s,this.shadowFbo=u,this.shadowW=o,this.shadowH=i}ensureShoreFbo(e,r){let o=Math.max(2,e),i=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===i)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=s,this.shoreFbo=u,this.shoreW=o,this.shoreH=i}renderShadows(e){let{cam:r,sprites:o,fogStates:i,walls:n=[],shadowPages:s,shadowOpacity:u,detailOpacity:a}=e;if(this.lastHasCrossShadows=!1,u<=.005||a<=.01||s.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:l,instanceData:c}=this;this.ensureShadowFbo(l.canvas.width,l.canvas.height);let h=0,f=0,m=new Array(s.length).fill(0);for(let y=0;y<o.length;y++){let S=o[y];S.shadowPage<0||S.shadowPage>=s.length||i[y]!==0&&m[S.shadowPage]++}for(let y=0;y<n.length;y++){let S=n[y],G=S.shadowPage??-1;G<0||G>=s.length||S.fogState===0||m[G]++}let p=new Array(s.length).fill(0),v=0;for(let y=0;y<s.length;y++)p[y]=v,v+=m[y];if(v===0)return{drawCalls:0,renderedShadows:0};let g=[...p],C=Math.min(v,16384);for(let y=0;y<o.length;y++){let S=o[y],G=S.shadowPage;if(G<0||G>=s.length)continue;let L=i[y];if(L===0)continue;let x=g[G];if(x>=C)continue;g[G]=x+1,h++;let T=S.shadowTier??(S.isMountain?3:0);T>0&&f++;let D=x*16,A=(S.shadowMaxX-S.shadowMinX)*S.width,F=(S.shadowMaxY-S.shadowMinY)*S.width;c[D]=S.x,c[D+1]=S.y,c[D+2]=S.shadowMinX*S.width,c[D+3]=S.shadowMinY*S.width,c[D+4]=A,c[D+5]=F,c[D+6]=L===1?a*.65:a,c[D+7]=T,c[D+8]=S.shadowU0,c[D+9]=S.shadowV0,c[D+10]=S.shadowU1,c[D+11]=S.shadowV1,c[D+12]=.5,c[D+13]=0,c[D+14]=0,c[D+15]=0}for(let y=0;y<n.length;y++){let S=n[y],G=S.shadowPage??-1;if(G<0||G>=s.length||S.fogState===0)continue;let L=g[G];if(L>=C)continue;g[G]=L+1,h++,f++;let x=L*16;c[x]=S.x,c[x+1]=S.y,c[x+2]=S.shadowRelLeft??0,c[x+3]=S.shadowRelTop??0,c[x+4]=S.shadowWidth??0,c[x+5]=S.shadowHeight??0,c[x+6]=S.fogState===1?a*.65:a,c[x+7]=2,c[x+8]=S.shadowU0??0,c[x+9]=S.shadowV0??0,c[x+10]=S.shadowU1??0,c[x+11]=S.shadowV1??0,c[x+12]=.5,c[x+13]=0,c[x+14]=0,c[x+15]=0}this.lastHasCrossShadows=f>0,l.bindBuffer(l.ARRAY_BUFFER,this.instanceVbo),l.bufferSubData(l.ARRAY_BUFFER,0,c.subarray(0,C*16)),l.bindFramebuffer(l.FRAMEBUFFER,this.shadowFbo),l.viewport(0,0,this.shadowW,this.shadowH),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.enable(l.BLEND),l.blendEquation(l.MAX),l.blendFunc(l.ONE,l.ONE),l.useProgram(this.shadowMaskProg),l.bindVertexArray(this.vao),l.uniform2f(this.shCam,r.x,r.y),l.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),l.uniform1f(this.shZoom,r.zoom),l.uniform1f(this.shScaleY,1),l.uniform1f(this.shShearX,0),l.uniform1f(this.shTime,0),l.uniform1f(this.shWindEnabled,0),l.uniform1f(this.shDecalPass,0);let P=0;l.activeTexture(l.TEXTURE0);for(let y=0;y<s.length;y++){let S=p[y],G=Math.min(g[y],C),L=G-S;L<=0||(l.bindTexture(l.TEXTURE_2D,s[y]),S===0||l.bufferSubData(l.ARRAY_BUFFER,0,c.subarray(S*16,G*16)),l.drawArraysInstanced(l.TRIANGLES,0,6,L),P++)}return l.bindFramebuffer(l.FRAMEBUFFER,null),l.viewport(0,0,l.canvas.width,l.canvas.height),l.blendEquation(l.FUNC_ADD),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),l.useProgram(this.compositeProg),l.bindVertexArray(this.compositeVao),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.shadowTex),l.uniform1f(this.compOpacity,u),l.drawArrays(l.TRIANGLES,0,3),P++,{drawCalls:P,renderedShadows:h}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:i,naturePages:n,walls:s=[],infraPages:u=[],detailOpacity:a,objectScaleY:l,objectShearX:c,shadowOpacity:h=.54,mountainShadowOnSprites:f=!0,spriteSelfShadow:m=.68,naturePolish:p=.4,spriteSaturation:v=1,spriteBrightness:g=1,spriteContrast:C=1,timeSec:P=0,windAnimation:y=!0,isDecalPass:S=!1}=e,G=o.length>0&&n.length>0,L=s.length>0&&u.length>0;if(a<=.01||!G&&!L)return{drawCalls:0,renderedSprites:0};let{gl:x,instanceData:T}=this;x.enable(x.BLEND),x.blendEquation(x.FUNC_ADD),x.blendFunc(x.ONE,x.ONE_MINUS_SRC_ALPHA),x.useProgram(this.spriteProg),x.bindVertexArray(this.vao),x.bindBuffer(x.ARRAY_BUFFER,this.instanceVbo),x.uniform2f(this.spCam,r.x,r.y),x.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),x.uniform1f(this.spZoom,r.zoom),x.uniform1f(this.spScaleY,l),x.uniform1f(this.spShearX,c),x.uniform1f(this.spTime,P),x.uniform1f(this.spWindEnabled,y?1:0),x.uniform2f(this.spCanvasSize,x.canvas.width,x.canvas.height);let D=f&&this.lastHasCrossShadows&&this.shadowTex!==null?h:0;x.uniform1f(this.spMtnShadowOpacity,D),x.uniform1f(this.spSelfShadow,m),x.uniform1f(this.spNaturePolish,p),x.uniform1f(this.spSpriteSat,v),x.uniform1f(this.spSpriteBright,g),x.uniform1f(this.spSpriteContrast,C),x.uniform1f(this.spColorGradeAll,1),x.uniform1f(this.spDecalPass,S?1:0);let A=n[0]??u[0];x.activeTexture(x.TEXTURE8),x.bindTexture(x.TEXTURE_2D,this.shadowTex??A);let F=0,Y=0,U=0,N=[],R=new Map,B=()=>{if(U<=0)return;for(let E=0;E<N.length;E++)x.activeTexture(x.TEXTURE0+E),x.bindTexture(x.TEXTURE_2D,N[E]);let W=N[0]??A;for(let E=N.length;E<8;E++)x.activeTexture(x.TEXTURE0+E),x.bindTexture(x.TEXTURE_2D,W);x.bufferSubData(x.ARRAY_BUFFER,0,T.subarray(0,U*16)),x.drawArraysInstanced(x.TRIANGLES,0,6,U),F++,Y+=U,U=0,N=[],R.clear()},J=W=>{let E=R.get(W);return E===void 0?((N.length>=8||U>=16384)&&B(),E=N.length,N.push(W),R.set(W,E)):U>=16384&&(B(),E=0,N.push(W),R.set(W,0)),E},z=0,w=0,k=G?o.length:0,M=L?s.length:0;for(;z<k||w<M;){let W=!1;if(z>=k)W=!0;else if(w<M){let E=o[z].sortY??o[z].y;s[w].sortY<E&&(W=!0)}if(W){let E=s[w++];if(E.fogState===0||E.page<0||E.page>=u.length)continue;let d=J(u[E.page]),b=(E.fogState===1?1:0)|4|16,_=U*16;T[_]=E.x,T[_+1]=E.y,T[_+2]=E.relLeft,T[_+3]=E.relTop,T[_+4]=E.width,T[_+5]=E.height,T[_+6]=a,T[_+7]=d*256+b,T[_+8]=E.u0,T[_+9]=E.v0,T[_+10]=E.u1,T[_+11]=E.v1,T[_+12]=.5,T[_+13]=0,T[_+14]=0,T[_+15]=0,U++}else{let E=z++,d=i[E];if(d===0)continue;let b=o[E];if(b.page<0||b.page>=n.length)continue;let _=J(n[b.page]),H=b.shadowTier??(b.isMountain?3:0),q=b.selfShadeWeight??(b.isGroundDecal?0:b.isMountain?.52:.72),K=Math.max(0,Math.min(7,Math.round(q*7))),X=(d===1?1:0)|(H&3)<<3|(K&7)<<5;b.isMountain||(X|=2,b.isSnowFamily&&(X|=4));let Z=!!b.flipX,le=Z?1-b.anchorX:b.anchorX,$=U*16;T[$]=b.x,T[$+1]=b.y,T[$+2]=-b.width*le,T[$+3]=-b.height*b.anchorY,T[$+4]=b.width,T[$+5]=b.height,T[$+6]=a,T[$+7]=_*256+X,T[$+8]=Z?b.u1:b.u0,T[$+9]=b.v0,T[$+10]=Z?b.u0:b.u1,T[$+11]=b.v1,T[$+12]=b.tintHash??.5,T[$+13]=S?b.rotationRad??0:b.swayAmp??0,T[$+14]=S?b.terrainTintRgb??0:0,T[$+15]=S?b.terrainTintMix??0:0,U++}}return B(),{drawCalls:F,renderedSprites:Y}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:i,infraPages:n,projectY:s}=e;if(o.length===0||n.length===0)return{drawCalls:0,renderedShorelines:0};let{gl:u,instanceData:a}=this;this.ensureShoreFbo(u.canvas.width,u.canvas.height),u.bindFramebuffer(u.FRAMEBUFFER,this.shoreFbo),u.viewport(0,0,this.shoreW,this.shoreH),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),u.enable(u.BLEND),u.blendEquation(u.MAX),u.blendFunc(u.ONE,u.ONE),u.useProgram(this.spriteProg),u.bindVertexArray(this.vao),u.bindBuffer(u.ARRAY_BUFFER,this.instanceVbo),u.uniform2f(this.spCam,r.x,r.y),u.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),u.uniform1f(this.spZoom,r.zoom),u.uniform1f(this.spScaleY,1),u.uniform1f(this.spShearX,0),u.uniform1f(this.spTime,0),u.uniform1f(this.spWindEnabled,0),u.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),u.uniform1f(this.spMtnShadowOpacity,0),u.uniform1f(this.spSelfShadow,0),u.uniform1f(this.spNaturePolish,0),u.uniform1f(this.spSpriteSat,1),u.uniform1f(this.spSpriteBright,1),u.uniform1f(this.spSpriteContrast,1),u.uniform1f(this.spColorGradeAll,0),u.uniform1f(this.spDecalPass,0);let l=Math.min(n.length,8);for(let g=0;g<8;g++)u.activeTexture(u.TEXTURE0+g),u.bindTexture(u.TEXTURE_2D,n[g<l?g:0]);u.activeTexture(u.TEXTURE8),u.bindTexture(u.TEXTURE_2D,n[0]);let c=0,h=0,f=0,m=()=>{f<=0||(u.bufferSubData(u.ARRAY_BUFFER,0,a.subarray(0,f*16)),u.drawArraysInstanced(u.TRIANGLES,0,6,f),c++,h+=f,f=0)},p=512,v=512*s;for(let g=0;g<o.length;g++){let C=i[g];if(C===0)continue;let P=o[g];if(P.page<0||P.page>=l)continue;f>=16384&&m();let y=f*16;a[y]=P.x,a[y+1]=P.y,a[y+2]=-p*.5,a[y+3]=-v*.5,a[y+4]=p,a[y+5]=v,a[y+6]=P.alpha??1,a[y+7]=P.page*256+4+24+(C===1?1:0),a[y+8]=P.u0,a[y+9]=P.v0,a[y+10]=P.u1,a[y+11]=P.v1,a[y+12]=.5,a[y+13]=0,a[y+14]=0,a[y+15]=0,f++}return m(),u.bindFramebuffer(u.FRAMEBUFFER,null),u.viewport(0,0,u.canvas.width,u.canvas.height),u.blendEquation(u.FUNC_ADD),u.blendFunc(u.ONE,u.ONE_MINUS_SRC_ALPHA),h>0&&(u.useProgram(this.shoreCompositeProg),u.bindVertexArray(this.compositeVao),u.activeTexture(u.TEXTURE0),u.bindTexture(u.TEXTURE_2D,this.shoreTex),u.drawArrays(u.TRIANGLES,0,3),c++),{drawCalls:c,renderedShorelines:h}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:i,detailOpacity:n,timeSec:s,windAnimation:u}=e;if(n<=.02||o.length===0)return 0;let{gl:a,instanceData:l}=this,c=0;for(let h=0;h<o.length;h++){let f=o[h];if(!f.isWaterBoulder)continue;let m=i[h];if(m===0)continue;if(c>=16384)break;let p=f.width*.68,v=f.width*.25,g=c*16;l[g]=f.x,l[g+1]=f.y-f.height*.04,l[g+2]=-p,l[g+3]=-v,l[g+4]=p*2,l[g+5]=v*2,l[g+6]=n,l[g+7]=m===1?1:0,l[g+8]=0,l[g+9]=0,l[g+10]=0,l[g+11]=0,l[g+12]=f.tintHash??.5,l[g+13]=0,l[g+14]=0,l[g+15]=0,c++}return c===0?0:(a.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.surfProg),a.bindVertexArray(this.vao),a.bindBuffer(a.ARRAY_BUFFER,this.instanceVbo),a.uniform2f(this.sfCam,r.x,r.y),a.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),a.uniform1f(this.sfZoom,r.zoom),a.uniform1f(this.sfTime,s),a.uniform1f(this.sfWindEnabled,u?1:0),a.bufferSubData(a.ARRAY_BUFFER,0,l.subarray(0,c*16)),a.drawArraysInstanced(a.TRIANGLES,0,6,c),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var vt=256,ga=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,ba=`#version 300 es
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
const float HEX_R = ${Qe.toFixed(6)};
const float PROJ_Y = ${Ae.toFixed(4)};
const float ROW_STEP = ${(1.5*Qe).toFixed(6)};
const float TEX_WORLD_SIZE = 256.0;
const float WATER_HEX_COVER = ${(2*Qe).toFixed(4)}; // 295.603 (autotile.js:87)
const float RELIEF_MAX_H = ${yr.toFixed(2)};

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
  vec3 forestFloorCol = vec3(0.0);
  if (forestMask > 0.01 && normKnown > 0.01) {
    forestFloorCol = textureGrad(
      u_terrainArray,
      vec3(uPos / TEX_WORLD_SIZE, float(u_forestFloorLayer)),
      dUdx / TEX_WORLD_SIZE,
      dUdy / TEX_WORLD_SIZE
    ).rgb;
    knownColor = mix(knownColor, forestFloorCol, forestMask);
  }

  // Continuous zero-gap GPU shoreline feathering + seamless morphing between normal coasts & arctic snow/ice fjords!
  bool effectiveWater = homeIsWater;
  float warmCoastDist = 999.0;
  float coastArcticBlend = 0.0;
  if (minOppD2 < 1e18 && normKnown > 0.01) {
    float coastDist = (minOppD2 - minMixD2) / (2.0 * HEX_W);
    float organicEdge = autotileSmoothField(uPos * 1.9) * 4.5;

    // Continuous 7-cell Gaussian arctic weight (0 = warm beach, 1 = snowfields/frozen_tundra/icy_ocean fjord)
    // Eliminates hard notches/gaps wherever snowfield coasts meet temperate grassland/forest coasts!
    const float invTwoArcSig2 = 1.0 / (2.0 * 72.0 * 72.0);
    float arcticLandW = 0.0;
    float totalLandW = 0.0;
    float icyWaterW = 0.0;
    float totalWaterW = 0.0;
    for (int k = 0; k < 7; k++) {
      if (cDat[k].b == 0u) continue;
      vec2 dv0 = uPos - cPos[k];
      float wg = exp(-dot(dv0, dv0) * invTwoArcSig2);
      if ((cDat[k].a & 1u) != 0u) {
        totalWaterW += wg;
        if ((cDat[k].a & 4u) != 0u) icyWaterW += wg;
      } else {
        totalLandW += wg;
        if ((cDat[k].a & 2u) != 0u) arcticLandW += wg;
      }
    }
    float landArcticFrac = totalLandW > 0.0005 ? (arcticLandW / totalLandW) : 0.0;
    float waterIcyFrac = totalWaterW > 0.0005 ? (icyWaterW / totalWaterW) : 0.0;
    float arcticWeight = smoother5(clamp(max(landArcticFrac, waterIcyFrac) * 1.18 - 0.09, 0.0, 1.0));
    coastArcticBlend = arcticWeight;

    if (arcticWeight > 0.002) {
      // Smoothly scale organic fjord warp by arcticWeight so it matches the Voronoi shore at 0 and curves naturally at 1!
      float awX = autotileSmoothField(uPos * 0.72) * 18.0
                + autotileSmoothField(uPos * 1.95 + vec2(31.7, -19.3)) * 7.5;
      float awY = autotileSmoothField(uPos * 0.72 + vec2(-43.1, 27.9)) * 18.0
                + autotileSmoothField(uPos * 1.95 + vec2(-14.2, 53.6)) * 7.5;
      vec2 arcticPos = uPos + vec2(awX, awY) * arcticWeight;
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
        if (forestMask > 0.01) {
          landCol = mix(landCol, forestFloorCol, forestMask);
        }
        vec3 waterCol = waterColSum / waterMass;

        // Unified C0-continuous signed coastline distance: morphs seamlessly from Voronoi shore -> glacial fjord!
        float sdWarm = (homeIsWater ? -coastDist : coastDist) + organicEdge;
        float sdArctic = (landFrac - 0.44) * 145.0;
        float sdCoast = mix(sdWarm, sdArctic, arcticWeight);

        float coastSoft = mix(7.5, 17.5, arcticWeight);
        float tLand = smoother5((sdCoast + coastSoft * 0.5) / coastSoft);
        effectiveWater = tLand < 0.38;

        float warmW = 1.0 - arcticWeight;
        float wDist = max(0.0, -sdCoast);
        if (effectiveWater) warmCoastDist = wDist;

        // Warm beach feathering fades gracefully to 0 as arcticWeight rises toward snowfields
        if (warmW > 0.005) {
          float tSand = smoother5(1.0 - clamp(sdCoast, 0.0, 16.0) / 16.0) * warmW;
          landCol = mix(landCol, vec3(0.75, 0.69, 0.54), tSand * 0.44);
          float tShallowWarm = smoother5(1.0 - min(wDist, 18.0) / 18.0) * warmW;
          float tFoamWarm = smoother5(1.0 - min(wDist, 5.5) / 5.5);
          vec3 warmShallow = mix(vec3(0.46, 0.67, 0.68), vec3(0.84, 0.87, 0.82), tFoamWarm * 0.55);
          waterCol = mix(waterCol, warmShallow, tShallowWarm * 0.36);
        }

        // Shallow turquoise-ice shelf fading gently into deep arctic water
        float tShelf = smoother5(1.0 - min(wDist, 42.0) / 42.0) * (1.0 - tLand) * arcticWeight;
        vec3 shelfWater = mix(waterCol, vec3(0.50, 0.73, 0.83), tShelf * 0.56);

        // Subtle glacial cliff-foot AO right at the waterline + bright snow-drift lip on shore
        float cliffAo = exp(-pow(sdCoast / 6.2, 2.0)) * 0.24 * arcticWeight;
        float snowLip = exp(-pow((sdCoast - 10.5) / 10.0, 2.0)) * 0.52 * arcticWeight;
        vec3 iceLand = mix(landCol, vec3(0.90, 0.95, 0.99), snowLip);

        knownColor = mix(shelfWater, iceLand, tLand) * (1.0 - cliffAo);
      }
    } else {
      // Under-feather beneath shore_v105_edge_01..06 eliminating corner gaps & harsh seams!
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
    float icyDamp = ((homeCell.a & 4u) != 0u) ? 0.30 : mix(1.0, 0.42, coastArcticBlend);
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
    if (warmCoastDist < 62.0 && icyDamp > 0.38) {
      float shoreEnv = smoother5(1.0 - warmCoastDist / 62.0) * (1.0 - coastArcticBlend * 0.72);
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
`,va=`#version 300 es
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
const float HEX_R = ${Qe.toFixed(6)};
const float PROJ_Y = ${Ae.toFixed(4)};
const float ROW_STEP = ${(1.5*Qe).toFixed(6)};

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
`;function Rn(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${i}`)}return o}var Or=class{constructor(e){this.cellBuf=new Uint8Array(vt*vt*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.hasUnknownCells=!1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=Rn(e,e.VERTEX_SHADER,ga),o=Rn(e,e.FRAGMENT_SHADER,ba),i=e.createProgram();if(!i)throw new Error("Failed to create terrain program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let h=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteShader(r),e.deleteProgram(i),new Error(`Terrain program link error:
${h}`)}this.program=i;let n=Rn(e,e.FRAGMENT_SHADER,va),s=e.createProgram();if(!s)throw e.deleteShader(r),e.deleteShader(n),new Error("Failed to create cloud overlay program");if(e.attachShader(s,r),e.attachShader(s,n),e.linkProgram(s),e.deleteShader(r),e.deleteShader(n),!e.getProgramParameter(s,e.LINK_STATUS)){let h=e.getProgramInfoLog(s)||"Unknown link error";throw e.deleteProgram(s),new Error(`Cloud overlay program link error:
${h}`)}this.cloudProgram=s;let u=e.createVertexArray();if(!u)throw new Error("Failed to create terrain VAO");this.vao=u;let a=e.createTexture();if(!a)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=a,e.bindTexture(e.TEXTURE_2D,a),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,vt,vt),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let l=e.createTexture();if(!l)throw new Error("Failed to allocate surface field texture");this.surfaceTex=l,e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let c=(h,f)=>{let m=e.getUniformLocation(h,f);if(!m)throw new Error(`Missing terrain uniform: ${f}`);return m};this.uCamCenter=c(i,"u_camCenter"),this.uViewportSize=c(i,"u_viewportSize"),this.uZoom=c(i,"u_zoom"),this.uTime=c(i,"u_time"),this.uGridOrigin=c(i,"u_gridOrigin"),this.uGridSize=c(i,"u_gridSize"),this.uForestFloorLayer=c(i,"u_forestFloorLayer"),this.uShowGrid=c(i,"u_showGrid"),this.uHoverHex=c(i,"u_hoverHex"),this.uSurfaceRect=c(i,"u_surfaceRect"),this.uEdgeBand=c(i,"u_edgeBand"),this.uWaterHexMode=c(i,"u_waterHexMode"),this.uReliefEnabled=c(i,"u_reliefEnabled"),this.uReliefLighting=c(i,"u_reliefLighting"),this.uWindEnabled=c(i,"u_windEnabled"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(i,"u_cellData"),1),e.uniform1i(e.getUniformLocation(i,"u_surfaceField"),3),this.cuCamCenter=c(s,"u_camCenter"),this.cuViewportSize=c(s,"u_viewportSize"),this.cuZoom=c(s,"u_zoom"),this.cuTime=c(s,"u_time"),this.cuGridOrigin=c(s,"u_gridOrigin"),this.cuGridSize=c(s,"u_gridSize"),this.cuHasClouds=c(s,"u_hasClouds"),this.cuHasCloudEdge=c(s,"u_hasCloudEdge"),this.cuWindEnabled=c(s,"u_windEnabled"),e.useProgram(s),e.uniform1i(e.getUniformLocation(s,"u_cellData"),1),e.uniform1i(e.getUniformLocation(s,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(s,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return lo(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:i,cellTex:n,surfaceTex:s,cellBuf:u}=this,{cam:a,assets:l,lookupHex:c,resolveTerrainLayer:h,isWaterTerrain:f,seedInt:m,dataRevision:p,timeSec:v,showGrid:g,hoverHex:C,edgeBand:P=28,waterSampling:y="hex",reliefEnabled:S=!0,reliefStrength:G=Zt,reliefLighting:L=!0,reliefStyle:x="sculpted",windAnimation:T=!0}=e,D=Vt(a,4),A=D.maxQ-D.minQ+1,F=D.maxR-D.minR+1,Y=D.minQ,U=D.minR;A>vt&&(Y=Math.floor((D.minQ+D.maxQ)/2)-Math.floor(vt/2),A=vt),F>vt&&(U=Math.floor((D.minR+D.maxR)/2)-Math.floor(vt/2),F=vt);let N=!1;if(Y!==this.lastMinQ||U!==this.lastMinR||A!==this.lastSpanQ||F!==this.lastSpanR||p!==this.lastDataRevision){let d=0,b=!1;for(let _=0;_<F;_++){let H=U+_;for(let q=0;q<A;q++){let K=Y+q,X=c(K,H);if(!X||X.fogState===0)b=!0,u[d++]=0,u[d++]=0,u[d++]=0,u[d++]=0;else{let Z=f(X.terrainId)?1:0,le=Mt.has(X.terrainId)?2:0,$=X.terrainId==="icy_ocean"?4:0,be=X.terrainId==="coastal_water"||X.terrainId==="coastal_waters"||X.terrainId==="coast"?8:0;u[d++]=h(X.terrainId,K,H)&255,u[d++]=0,u[d++]=X.fogState,u[d++]=Z|le|$|be}}}this.hasUnknownCells=b,r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,A,F,r.RGBA_INTEGER,r.UNSIGNED_BYTE,u.subarray(0,A*F*4)),this.lastMinQ=Y,this.lastMinR=U,this.lastSpanQ=A,this.lastSpanR=F,this.lastDataRevision=p,N=!0}let R=S?G:0,B=a.viewportWidth*.5/a.zoom,J=a.viewportHeight*.5/(a.zoom*Ae),z=a.x-B-140,w=a.x+B+140,k=a.y/Ae-J-180,M=a.y/Ae+J+220;if(!this.surfaceWin||this.lastSurfaceRevision!==p||this.lastSurfaceStrength!==R||this.lastSurfaceStyle!==x||z<this.surfaceWin.left||w>this.surfaceWin.left+this.surfaceWin.width||k<this.surfaceWin.top||M>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(w-z)*3.5){let d=Math.max(384,(w-z)*.35),b=Math.max(384,(M-k)*.35),_=z-d,H=k-b,q=w-z+d*2,K=M-k+b*2,X=Math.max(16,Math.ceil(Math.max(q/200,K/150)));this.surfaceWin=so({left:_,top:H,width:q,height:K,step:X,lookupHex:c,manifest:l.manifest,seedInt:m,reliefStrength:R,reliefStyle:x}),this.lastSurfaceRevision=p,this.lastSurfaceStrength=R,this.lastSurfaceStyle=x,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(i),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,l.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.uniform2f(this.uCamCenter,a.x,a.y),r.uniform2f(this.uViewportSize,a.viewportWidth,a.viewportHeight),r.uniform1f(this.uZoom,a.zoom),r.uniform1f(this.uTime,v),r.uniform2i(this.uGridOrigin,Y,U),r.uniform2i(this.uGridSize,A,F),r.uniform1i(this.uForestFloorLayer,l.forestFloorLayer),r.uniform1f(this.uShowGrid,g?1:0),r.uniform2i(this.uHoverHex,C?C.q:-999999,C?C.r:-999999);let E=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,E?E.left:0,E?E.top:0,E?E.width:1,E?E.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,P))),r.uniform1f(this.uWaterHexMode,y==="hex"?1:0),r.uniform1f(this.uReliefEnabled,S?1:0),r.uniform1f(this.uReliefLighting,L?1:0),r.uniform1f(this.uWindEnabled,T?1:0),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:A*F,uploaded:N}}renderCloudOverlay(e){if(!this.hasUnknownCells||this.lastSpanQ<=0||this.lastSpanR<=0)return 0;let{gl:r,cloudProgram:o,vao:i,cellTex:n}=this,{cam:s,assets:u,timeSec:a,windAnimation:l=!0}=e;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(o),r.bindVertexArray(i),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,u.cloudTexture),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,u.cloudEdgeTexture??u.cloudTexture),r.uniform2f(this.cuCamCenter,s.x,s.y),r.uniform2f(this.cuViewportSize,s.viewportWidth,s.viewportHeight),r.uniform1f(this.cuZoom,s.zoom),r.uniform1f(this.cuTime,a),r.uniform2i(this.cuGridOrigin,this.lastMinQ,this.lastMinR),r.uniform2i(this.cuGridSize,this.lastSpanQ,this.lastSpanR),r.uniform1f(this.cuHasClouds,u.cloudTexture?1:0),r.uniform1f(this.cuHasCloudEdge,u.cloudEdgeTexture?1:0),r.uniform1f(this.cuWindEnabled,l?1:0),r.drawArrays(r.TRIANGLES,0,3),1}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program),this.gl.deleteProgram(this.cloudProgram)}};var Oo=65536,Vr=6,ya=`#version 300 es
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
`,xa=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,Nr=class{constructor(e){this.verts=new Float32Array(Oo*Vr);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,ya),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,xa),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate vector program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=Vr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,8),e.bindVertexArray(null);let a=l=>{let c=e.getUniformLocation(i,l);if(!c)throw new Error(`Missing vector uniform: ${l}`);return c};this.uCamCenter=a("u_camCenter"),this.uViewportSize=a("u_viewportSize"),this.uZoom=a("u_zoom")}pushTri(e,r,o,i,n,s,u,a,l,c){if(this.vertCount+3>Oo)return;let h=this.vertCount*Vr,f=this.verts;f[h++]=e,f[h++]=r,f[h++]=u,f[h++]=a,f[h++]=l,f[h++]=c,f[h++]=o,f[h++]=i,f[h++]=u,f[h++]=a,f[h++]=l,f[h++]=c,f[h++]=n,f[h++]=s,f[h++]=u,f[h++]=a,f[h++]=l,f[h++]=c,this.vertCount+=3}pushSegment(e,r,o,i){let n=r.x-e.x,s=r.y-e.y,u=Math.hypot(n,s);if(u<1e-4)return;let a=-s/u*(o*.5),l=n/u*(o*.5),[c,h,f,m]=i;this.pushTri(e.x-a,e.y-l,e.x+a,e.y+l,r.x+a,r.y+l,c,h,f,m),this.pushTri(e.x-a,e.y-l,r.x+a,r.y+l,r.x-a,r.y-l,c,h,f,m)}pushDisc(e,r,o,i,n,s){let[u,a,l,c]=s;for(let h=0;h<n;h++){let f=h/n*Math.PI*2,m=(h+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(f)*o,r+Math.sin(f)*i,e+Math.cos(m)*o,r+Math.sin(m)*i,u,a,l,c)}}pushHexFill(e,r,o,i=1){let n=We(e,r),s=ur(e,r),[u,a,l,c]=o;for(let h=0;h<6;h++){let f=s[h],m=s[(h+1)%6],p=n.x+(f.x-n.x)*i,v=n.y+(f.y-n.y)*i,g=n.x+(m.x-n.x)*i,C=n.y+(m.y-n.y)*i;this.pushTri(n.x,n.y,p,v,g,C,u,a,l,c)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Vr)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s}=e;if(!o)return 0;this.vertCount=0;let u=a=>s?{x:a.x,y:a.y-s(a.x,a.y/Ae)*Ae}:a;if(o.territory&&o.territory.length>0){let a=new Map;for(let f of o.territory)a.set(De(f.q,f.r),f.ownerId);let l=.08+n*.24,c=Math.max(7,10/Math.max(.2,r.zoom*1.1)),h=.75+n*.2;for(let f of o.territory){let m=i(f.q,f.r);if(m===0)continue;let p=m===1?.65:1,[v,g,C]=f.color;this.pushHexFill(f.q,f.r,[v,g,C,l*p],.98);for(let P=0;P<6;P++){let[y,S]=Re[P];if(a.get(De(f.q+y,f.r+S))!==f.ownerId){let{a:L,b:x}=dt(f.q,f.r,P),T=We(f.q,f.r),D={x:L.x+(T.x-L.x)*.05,y:L.y+(T.y-L.y)*.05},A={x:x.x+(T.x-x.x)*.05,y:x.y+(T.y-x.y)*.05};this.pushSegment(D,A,c,[v,g,C,h*p])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let a=1-n*.85;for(let l of o.buildings){let c=i(l.q,l.r);if(c===0)continue;let h=(c===1?.65:1)*a,f=u(We(l.q,l.r)),p=l.kind==="capital"||l.kind==="settlement"||l.kind==="fortress"?106:78,v=p*.72;this.pushDisc(f.x,f.y+4,p*1.18,v*1.18,18,[.42,.36,.26,.22*h]),this.pushDisc(f.x,f.y+4,p*.88,v*.88,16,[.48,.42,.31,.36*h])}}if(o.buildPreview){let a=o.buildPreview;for(let c of a.bonusHexes)this.pushHexFill(c.q,c.r,[.22,.82,.48,.24],.92);let l=a.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(a.center.q,a.center.r,l,.96)}if(o.selectedHex){let a=ur(o.selectedHex.q,o.selectedHex.r),l=Math.max(5,6/Math.max(.25,r.zoom));for(let c=0;c<6;c++)this.pushSegment(a[c],a[(c+1)%6],l,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:i,timeSec:n,coveredBuildingIds:s,coveredSiteIds:u}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let a of o.buildings){let l=i(a.q,a.r);if(l===0)continue;let c=l===1?.65:1,h=We(a.q,a.r),[f,m,p]=a.factionColor;if(a.rangeRadius&&a.rangeRadius>0){let S=a.rangeRadius*240,G=S*.85,L=36;for(let x=0;x<L;x+=2){let T=x/L*Math.PI*2,D=(x+1)/L*Math.PI*2;this.pushSegment({x:h.x+Math.cos(T)*S,y:h.y+Math.sin(T)*G},{x:h.x+Math.cos(D)*S,y:h.y+Math.sin(D)*G},Math.max(4,3.5/Math.max(.2,r.zoom)),[f,m,p,.45*c])}}if(s?.has(a.id))continue;let v=a.kind==="capital"||a.kind==="settlement",g=a.kind==="fortress"||a.kind==="watchtower",C=v?78:g?64:52,P=v?68:g?76:42;this.pushDisc(h.x-10,h.y+8,C*1.12,C*.62,16,[.05,.07,.09,.45*c]),this.pushDisc(h.x,h.y+4,C,C*.56,6,[.34,.32,.29,.96*c]);let y=C*.68;this.pushTri(h.x-y,h.y+6,h.x+y,h.y+6,h.x+y,h.y-P*.65,.78*c,.74*c,.66*c,.98),this.pushTri(h.x-y,h.y+6,h.x+y,h.y-P*.65,h.x-y,h.y-P*.65,.66*c,.62*c,.55*c,.98),this.pushTri(h.x-y*1.18,h.y-P*.62,h.x+y*1.18,h.y-P*.62,h.x,h.y-P*1.25,f*c,m*c,p*c,.98),(v||g)&&this.pushTri(h.x-14,h.y-P*.95,h.x+14,h.y-P*.95,h.x,h.y-P*1.55,.96*c,.8*c,.34*c,.98)}if(o.sites)for(let a of o.sites){if(u?.has(a.id)||i(a.q,a.r)===0)continue;let c=We(a.q,a.r),h=26,f=a.family==="fauna"?[.85,.58,.25,.9]:a.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(c.x,c.y-h,c.x+h,c.y,c.x,c.y+h,f[0],f[1],f[2],f[3]),this.pushTri(c.x,c.y-h,c.x,c.y+h,c.x-h,c.y,f[0]*.8,f[1]*.8,f[2]*.8,f[3])}if(o.units)for(let a of o.units){if(i(a.q,a.r)<2)continue;let[c,h,f]=a.factionColor,m=We(a.q,a.r);if(a.marchPath&&a.marchPath.length>=2){let p=a.marchPath.map(D=>We(D.q,D.r));for(let D=0;D<p.length-1;D++)this.pushSegment(p[D],p[D+1],Math.max(8,6/Math.max(.2,r.zoom)),[c,h,f,.78]);let v=p[p.length-1],g=p[p.length-2],C=v.x-g.x,P=v.y-g.y,y=Math.hypot(C,P)||1,S=C/y,G=P/y,L=v,x={x:v.x-S*28,y:v.y-G*28};this.pushTri(L.x,L.y,x.x-G*18,x.y+S*18,x.x+G*18,x.y-S*18,c,h,f,.95);let T=n*.14%1;m={x:p[0].x+(p[1].x-p[0].x)*T,y:p[0].y+(p[1].y-p[0].y)*T}}if(a.inCombat){let p=1+.22*Math.sin(n*5);this.pushDisc(m.x,m.y,56*p,44*p,20,[.98,.26,.22,.35])}this.pushDisc(m.x,m.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(m.x,m.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(m.x,m.y-16,26,26,18,[c,h,f,.98])}if(o.walls)for(let a of o.walls){if(!a.breached)continue;let l=at(a.q1,a.r1,a.q2,a.r2);if(l<0)continue;let{mid:c}=dt(a.q1,a.r1,l),h=1+.18*Math.sin(n*4.5);this.pushDisc(c.x,c.y,32*h,24*h,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var wa=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],Vo=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],Sa={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function _a(t,e,r,o){let i=t.infrastructure.sprites,n=[];e==="stone"?(o?(n.push(`walls/stone/gates/v1/gate_dir${r}`),r===5&&n.push("walls/stone/gates/v1/gate_dir2"),n.push(`walls/stone/v7/edge_dir${r}`)):n.push(`walls/stone/v7/edge_dir${r}`),n.push(`walls/palisade/edge_dir${r}`)):(o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`));for(let s of n)if(i[s])return s;return null}function Ca(t,e,r){let o=t.infrastructure.sprites,i=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${i}`,`walls/palisade/${i}`]:[`walls/palisade/${i}`];for(let s of n)if(o[s])return s;return null}function No(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,i,n,s]=r.boundsInSpriteWidth,u=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*u,shadowRelTop:i*u,shadowWidth:(n-o)*u,shadowHeight:(s-i)*u}}function Xo(t,e,r,o){if(!e.length)return[];let i=[],n=o?.occupiedRiverEdges,s=o?.lookupHex,u=new Map;for(let a of e){let l=at(a.q1,a.r1,a.q2,a.r2);if(l<0)continue;if(n&&n.size>0){let C=Je(a.q1,a.r1,a.q2,a.r2);if(n.has(C.key))continue}if(s){let C=s(a.q1,a.r1),P=s(a.q2,a.r2);if(C&&(ht(C.terrainId)||C.reliefClass==="mountain")||P&&(ht(P.terrainId)||P.reliefClass==="mountain"))continue}let c=r(a.q1,a.r1),h=r(a.q2,a.r2),f=c>=h?c:h;if(f===0)continue;let{a:m,b:p,mid:v}=dt(a.q1,a.r1,l),g=_a(t,a.kind,l,!!a.isGate);if(g){let C=t.infrastructure.sprites[g],P=g.includes("/stone/"),[y,S,G,L]=P?Vo[l]:wa[l],x=p.x-m.x,T=p.y-m.y,D=Math.hypot(x,T)||1,A=-T/D,F=x/D;(F<0||Math.abs(F)<1e-9&&A<0)&&(A=-A,F=-F);let Y=P?24:16,U=A*Y,N=F*Y*.62,R=Math.abs(x)>1e-6?(N-T/x*U)*.5:P?5.5:3.5,B=L;if(P){let z=Vo[(l+3)%6][3];B=(L+z-T)*.5}let J=P?"stone":"palisade";i.push({x:m.x,y:m.y,relLeft:-G,relTop:-B+R,width:y,height:S,page:C.page,u0:C.uv[0],v0:C.uv[1],u1:C.uv[2],v1:C.uv[3],sortY:v.y,fogState:f,...No(t,`wall_shadow:${J}:dir${l}`)})}for(let C of[m,p]){let P=`${Math.round(C.x*10)},${Math.round(C.y*10)}`,y=u.get(P);y||(y={x:C.x,y:C.y,degree:0,hasPalisade:!1,hasStone:!1,fog:f},u.set(P,y)),y.degree++,a.kind==="palisade"&&(y.hasPalisade=!0),a.kind==="stone"&&(y.hasStone=!0),f>y.fog&&(y.fog=f)}}for(let a of u.values()){let l=a.hasStone&&!a.hasPalisade?"stone":"palisade",c=a.degree===1,h=Ca(t,l,c);if(!h)continue;let f=t.infrastructure.sprites[h],m=Sa[l],p=c?m.endW:m.cornerW,v=c?m.endH:m.cornerH;i.push({x:a.x,y:a.y,relLeft:-p*.5,relTop:-v+m.south,width:p,height:v,page:f.page,u0:f.uv[0],v0:f.uv[1],u1:f.uv[2],v1:f.uv[3],sortY:a.y+1,fogState:a.fog,...No(t,`wall_shadow:${l}:post`)})}return i.sort((a,l)=>a.sortY-l.sortY||a.x-l.x),i}var Mn={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0,showGroundDecals:!0,showAmbientVfx:!0,showProvisionalSites:!0},Xr=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=wn(null);this.cachedWallSprites=[];this.wallCacheKey="";this.cachedOccupiedRiverEdges=new Set;this.riverEdgesCacheKey="";this.lastVisibleRiverRoutes=[];this.cachedBridgeSprites=[];this.bridgeCacheKey="";this.cachedBuildingSprites=[];this.buildingCacheKey="";this.coveredBuildingIds=new Set;this.cachedSiteSprites=[];this.siteCacheKey="";this.coveredSiteIds=new Set;this.cachedInfraSprites=[];this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...ft,...o.forestConfig??{}},this.reliefConfig={...Ft,...o.reliefConfig??{}},this.visualConfig={...Mn,...o.visualConfig??{}};let i=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!i)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=i,this.terrainPass=new Or(i),this.roadPass=new Hr(i),this.riverPass=new wr(i),this.vectorPass=new Nr(i),this.spriteBatcher=new Gr(i),this.animatedActorPass=new Pr(i),this.ambientVfxPass=new Ar(i),this.camera=new Lr(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await vn(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new tr(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await vn(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let i=this.assets;return this.assets=o,this.chunkManager=new tr(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",i?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey=""),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.infrastructureClearance=wn(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}getOccupiedRiverEdgeKeys(){if(!this.riverEdgesCacheKey&&this.chunkManager){let e=this.chunkManager;this.cachedOccupiedRiverEdges=_t({routes:this.lastVisibleRiverRoutes,manualRivers:this.dynamicScene?.rivers,isWaterHex:(r,o)=>{let i=e.lookupTerrainHex(r,o);return i?e.isWaterTerrain(i.terrainId):!1}})}return this.cachedOccupiedRiverEdges}validateWallPlacement(e,r,o,i,n=!1){return _r({q1:e,r1:r,q2:o,r2:i,isGate:n,lookupHex:(s,u)=>this.chunkManager?.lookupTerrainHex(s,u),occupiedRiverEdges:this.getOccupiedRiverEdgeKeys(),existingRoads:this.dynamicScene?.roads})}validateRoadPlacement(e,r,o,i){return Rr({q1:e,r1:r,q2:o,r2:i,lookupHex:(n,s)=>this.chunkManager?.lookupTerrainHex(n,s),existingWalls:this.dynamicScene?.walls})}validateRiverPlacement(e,r,o){return Cr({q:e,r,dir:o,lookupHex:(i,n)=>this.chunkManager?.lookupTerrainHex(i,n),existingWalls:this.dynamicScene?.walls})}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let o=0;o<e.length;o++){let i=e[o];if(i.inCombat||i.marchPath&&i.marchPath.length>=2)return!0}let r=this.dynamicScene?.sites;if(r&&r.length>0){for(let o=0;o<r.length;o++)if(r[o].family==="fauna")return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let i=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let s=this.camera.state,u=this.gl;u.viewport(0,0,u.canvas.width,u.canvas.height);let a=(e-this.startTimeMs)*.001,l=xn(s.zoom),c=1-l,h=c>.02,f=this.visualConfig.windAnimation!==!1,{sprites:m,fogStates:p,decals:v,decalFogStates:g,shorelines:C,shoreFogStates:P,riverRoutes:y,chunksLoadedThisFrame:S,hasPendingChunks:G}=o.prepareVisibleFrame(s,h?2:6,h),L=(Q,re)=>{let fe=o.lookupTerrainHex(Q,re);return fe?fe.fogState:0},x=performance.now(),T=this.terrainPass.render({cam:s,assets:r,lookupHex:(Q,re)=>o.lookupTerrainHex(Q,re),resolveTerrainLayer:(Q,re,fe)=>o.resolveTerrainLayer(Q,re,fe),isWaterTerrain:Q=>o.isWaterTerrain(Q),seedInt:o.seedInt,dataRevision:o.revision,timeSec:a,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:f}),D=this.spriteBatcher.renderShorelines({cam:s,shorelines:C,fogStates:P,infraPages:r.infraPages,projectY:Ae}),A=(Q,re)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(Q,re):0,F=this.roadPass.render({cam:s,roads:this.dynamicScene?.roads,lookupFog:L,strategicBlend:l,sampleReliefHeight:A}),Y=this.riverPass.render({cam:s,assets:r,routes:y,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:A,lookupFog:L,lookupHex:(Q,re)=>o.lookupTerrainHex(Q,re),timeSec:a,windAnimation:f}),U=this.vectorPass.renderGroundPass({cam:s,scene:this.dynamicScene,lookupFog:L,strategicBlend:l,sampleReliefHeight:A}),N=performance.now(),R=m,B=p;if(!this.infrastructureClearance.isEmpty&&m.length>0){R=[],B=[];for(let Q=0;Q<m.length;Q++){let re=m[Q];Sn(re,this.infrastructureClearance)||(R.push(re),B.push(p[Q]))}}let J=this.dynamicScene?.customSprites;if(h&&J&&J.length>0){let Q=[];for(let re=0;re<R.length;re++)Q.push({sprite:R[re],fog:B[re]});for(let re of J){let fe=r.manifest.nature.sprites[re.spriteKey];if(!fe)continue;let Fe=We(re.q,re.r),I=Fe.x+(re.offsetX??0),j=Fe.y+(re.offsetY??0),ce=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(I,j/Ae)*Ae:0,ne=(re.worldWidthOverride??fe.worldWidth)*kt(fe)*(re.scale??1),O=ne*fe.aspect,V=r.manifest.shadows.sprites[re.spriteKey],ie=re.anchorOverride??fe.anchor;Q.push({sprite:{x:I,y:j-ce,sortY:j,width:ne,height:O,anchorX:ie[0],anchorY:ie[1],page:fe.page,u0:fe.uv[0],v0:fe.uv[1],u1:fe.uv[2],v1:fe.uv[3],q:re.q,r:re.r,isMountain:fe.kind==="mountain",isSnowFamily:gr(fe),shadowTier:hn(fe,ne,O),selfShadeWeight:mn(fe),shadowPage:V?V.page:-1,shadowU0:V?V.uv[0]:0,shadowV0:V?V.uv[1]:0,shadowU1:V?V.uv[2]:0,shadowV1:V?V.uv[3]:0,shadowMinX:V?V.boundsInSpriteWidth[0]:0,shadowMinY:V?V.boundsInSpriteWidth[1]:0,shadowMaxX:V?V.boundsInSpriteWidth[2]:0,shadowMaxY:V?V.boundsInSpriteWidth[3]:0},fog:L(re.q,re.r)})}Q.sort((re,fe)=>(re.sprite.sortY??re.sprite.y)-(fe.sprite.sortY??fe.sprite.y)||re.sprite.x-fe.sprite.x),R=Q.map(re=>re.sprite),B=Q.map(re=>re.fog)}let z=this.sceneRevision*1000003+o.revision,w=this.dynamicScene?.rivers,k=y.map(Q=>Q.id).join(",");this.lastVisibleRiverRoutes=y;let M=`${z}|${k}`;this.riverEdgesCacheKey!==M&&(this.cachedOccupiedRiverEdges=_t({routes:y,manualRivers:w,isWaterHex:(Q,re)=>{let fe=o.lookupTerrainHex(Q,re);return fe?o.isWaterTerrain(fe.terrainId):!1}}),this.riverEdgesCacheKey=M);let W=!1,E=`${z}|${k}`;this.wallCacheKey!==E&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?Xo(r.manifest,this.dynamicScene.walls,L,{occupiedRiverEdges:this.cachedOccupiedRiverEdges,lookupHex:(Q,re)=>o.lookupTerrainHex(Q,re)}):[],this.wallCacheKey=E,W=!0);let d=this.dynamicScene?.roads,b=!!(d&&d.length>0)&&(y.length>0||!!(w&&w.length>0)),_=b?`${z}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}|${k}`:"";if(this.bridgeCacheKey!==_){if(b&&d){let Q=To({roads:d,routes:y,manualRivers:w,lookupFog:L,isWaterHex:(re,fe)=>{let Fe=o.lookupTerrainHex(re,fe);return Fe?o.isWaterTerrain(Fe.terrainId):!1}});this.cachedBridgeSprites=ko({manifest:r.manifest,crossings:Q,sampleReliefHeight:A})}else this.cachedBridgeSprites=[];this.bridgeCacheKey=_,W=!0}let H=this.dynamicScene?.buildings,q=!!(H&&H.length>0),K=q?`${z}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.buildingCacheKey!==K){if(q&&H){let Q=Wo({manifest:r.manifest,buildings:H,lookupFog:L,sampleReliefHeight:(re,fe)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(re,fe):0});this.cachedBuildingSprites=Q.sprites,this.coveredBuildingIds=Q.coveredBuildingIds}else this.cachedBuildingSprites=[],this.coveredBuildingIds=new Set;this.buildingCacheKey=K,W=!0}let X=this.dynamicScene?.sites,Z=!!(X&&X.length>0),le=this.visualConfig.showProvisionalSites!==!1,$=Z&&le?`${z}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.siteCacheKey!==$){if(Z&&le&&X){let Q=Uo({manifest:r.manifest,sites:X,lookupFog:L,sampleReliefHeight:A});this.cachedSiteSprites=Q.sprites,this.coveredSiteIds=Q.coveredSiteIds}else this.cachedSiteSprites=[],this.coveredSiteIds=new Set;this.siteCacheKey=$,W=!0}if(W){let Q=[];this.cachedWallSprites.length>0&&Q.push(this.cachedWallSprites),this.cachedBridgeSprites.length>0&&Q.push(this.cachedBridgeSprites),this.cachedBuildingSprites.length>0&&Q.push(this.cachedBuildingSprites),this.cachedSiteSprites.length>0&&Q.push(this.cachedSiteSprites),Q.length===0?this.cachedInfraSprites=[]:Q.length===1?this.cachedInfraSprites=Q[0]:this.cachedInfraSprites=Q.flat().sort((re,fe)=>re.sortY-fe.sortY||re.x-fe.x)}let be=0;if(h&&this.visualConfig.showGroundDecals!==!1&&v.length>0){let Q=v,re=g;if(!this.infrastructureClearance.isEmpty){Q=[],re=[];for(let fe=0;fe<v.length;fe++){let Fe=v[fe];Sn(Fe,this.infrastructureClearance)||(Q.push(Fe),re.push(g[fe]))}}Q.length>0&&(be=this.spriteBatcher.renderWorldSprites({cam:s,sprites:Q,fogStates:re,naturePages:r.naturePages,detailOpacity:c,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:a,windAnimation:!1,isDecalPass:!0}).drawCalls)}let ge=this.spriteBatcher.renderShadows({cam:s,sprites:R,fogStates:B,walls:this.cachedInfraSprites,shadowPages:r.shadowPages,shadowOpacity:this.shadowOpacity,detailOpacity:c}),oe=performance.now(),Pe=this.spriteBatcher.renderWaterSurfRings({cam:s,sprites:R,fogStates:B,detailOpacity:c,timeSec:a,windAnimation:f}),ye=this.spriteBatcher.renderWorldSprites({cam:s,sprites:R,fogStates:B,naturePages:r.naturePages,walls:this.cachedInfraSprites,infraPages:r.infraPages,detailOpacity:c,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:this.shadowOpacity,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:a,windAnimation:f}),xe=h&&Z?Ao({manifest:r.manifest,sites:X,lookupFog:L,sampleReliefHeight:A,timeSec:a,animate:f}):{actors:[],coveredSiteIds:new Set},ve=this.animatedActorPass.render({cam:s,assets:r,actors:xe.actors,detailOpacity:c,shadowOpacity:this.shadowOpacity,naturePolish:this.visualConfig.naturePolish}),we=h&&this.visualConfig.showAmbientVfx!==!1?this.ambientVfxPass.render({cam:s,detailOpacity:c,timeSec:a,animate:f,lookupHex:(Q,re)=>o.lookupTerrainHex(Q,re),isWaterTerrain:Q=>o.isWaterTerrain(Q),buildings:this.dynamicScene?.buildings,sampleReliefHeight:A,seedInt:o.seedInt}):{drawCalls:0,particleCount:0},Be=this.terrainPass.renderCloudOverlay({cam:s,assets:r,timeSec:a,windAnimation:f}),_e;if(c>.35)if(xe.coveredSiteIds.size===0)_e=this.coveredSiteIds;else if(this.coveredSiteIds.size===0)_e=xe.coveredSiteIds;else{let Q=new Set(this.coveredSiteIds);for(let re of xe.coveredSiteIds)Q.add(re);_e=Q}let qe=this.vectorPass.renderTacticalPass({cam:s,scene:this.dynamicScene,lookupFog:L,timeSec:a,coveredBuildingIds:c>.35?this.coveredBuildingIds:void 0,coveredSiteIds:_e});this.overlayCanvas&&Do({canvas:this.overlayCanvas,cam:s,scene:this.dynamicScene,lookupFog:L,strategicBlend:l,timeSec:a});let Te=performance.now();this.hasPendingStream=G||S>0;let Ue=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!Ue||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let Q=this.frameTimes.length>0?this.frameTimes.reduce((fe,Fe)=>fe+Fe,0)/this.frameTimes.length:Math.max(16.6,Te-i),re={fps:Math.min(120,Math.round(1e3/Math.max(8,Q))),frameMs:Number((Te-i).toFixed(2)),terrainPassMs:Number((N-x).toFixed(2)),shadowPassMs:Number((oe-N).toFixed(2)),spritePassMs:Number((Te-oe).toFixed(2)),drawCalls:1+D.drawCalls+F+Y+U+be+ge.drawCalls+Pe+ye.drawCalls+ve.drawCalls+we.drawCalls+Be+qe,visibleHexes:T.visibleHexes,renderedSprites:ye.renderedSprites+ve.renderedActors,renderedShadows:ge.renderedShadows,loadedChunks:o.loadedChunkCount,mode:Lo(s.zoom),strategicBlend:Number(l.toFixed(2)),vramTier:r.vramTier,zoom:Number(s.zoom.toFixed(2)),centerHex:je(s.x,s.y)};this.options.onMetrics(re)}return Ue}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.roadPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.animatedActorPass.dispose(),this.ambientVfxPass.dispose(),this.assets?.dispose(),this.assets=null}};var Yo={VedrasMapEngine:Xr,createGeographyV2ChunkProvider:go,createSandboxScenario:xo,computeScenarioFog:So,evaluateDecision0121BuildPreview:rr,SANDBOX_SCENARIO_LIST:wo,VIELFALT_MIX_OVERRIDES:Dt,DEFAULT_FOREST_CONFIG:ft,DEFAULT_RELIEF_CONFIG:Ft,DEFAULT_VISUAL_CONFIG:Mn,computeBoulderSpawnScale:Sr,sizeFactor:kt,GeographyV2:zo.default,placementRules:{isWaterTerrainId:ht,collectOccupiedRiverEdgeKeys:_t,validateWallEdgePlacement:_r,validateRoadEdgePlacement:Rr,validateRiverEdgePlacement:Cr},hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:Re,axialToWorld:We,worldToAxial:je,hexDistance:$e,hexKey:De,hexEdgeEndpoints:dt,canonicalEdgePair:Je,neighborDirection:at,pickNearestHexEdge:kn}};typeof window<"u"&&(window.VedrasMapEngineLib=Yo);var rl=Yo;})();
