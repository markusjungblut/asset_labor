/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var ho=Object.create;var sn=Object.defineProperty;var mo=Object.getOwnPropertyDescriptor;var po=Object.getOwnPropertyNames;var go=Object.getPrototypeOf,bo=Object.prototype.hasOwnProperty;var vo=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var yo=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of po(e))!bo.call(t,i)&&i!==r&&sn(t,i,{get:()=>e[i],enumerable:!(o=mo(e,i))||o.enumerable});return t};var Pr=(t,e,r)=>(r=t!=null?ho(go(t)):{},yo(e||!t||!t.__esModule?sn(r,"default",{value:t,enumerable:!0}):r,t));var Zt=vo((ui,Kt)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],i=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),s=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],u=[],c=(_,A=0,R=1)=>Math.min(R,Math.max(A,_)),a=(_,A)=>_+","+A;function d(_){let A=2166136261;for(let R=0;R<_.length;R++)A^=_.charCodeAt(R),A=Math.imul(A,16777619);return A>>>0}let h=Object.create(null);function f(_){let A=typeof _=="string"?_:String(_),R=h[A];return R===void 0&&(R=d(A),h[A]=R),R}function m(_,A,R,I){let l=_^Math.imul(A+32767,374761393)^Math.imul(R+65521,668265263)^I;return l=Math.imul(l^l>>>15,2246822519),l=Math.imul(l^l>>>13,3266489917),(l^l>>>16)>>>0}function b(_,A,R,I){return m(_,A,R,f(I))}let x=(_,A,R,I)=>m(_,A,R,f(I))/4294967296,w=_=>_*_*(3-2*_);function U(_,A,R){let I=A.reduce((p,[,y])=>p+R[y],0);if(I<=0)return A[0][0];let l=c(_,0,.999999999)*I;for(let[p,y]of A)if(l-=R[y],l<0)return p;return A[A.length-1][0]}let q=(_,A,R)=>_+(A-_)*R;function v(_,A,R,I,l){let p=A/I,y=R/I,k=Math.floor(p),W=Math.floor(y),O=w(p-k),K=w(y-W),X=f(l),oe=1/4294967296,j=m(_,k,W,X)*oe,F=m(_,k+1,W,X)*oe,ie=m(_,k,W+1,X)*oe,le=m(_,k+1,W+1,X)*oe;return q(q(j,F,O),q(ie,le,O),K)}function M(){return s.map(([_,A,R,I,l,p,y,k])=>({group:_,id:A,label:R,defaultValue:I,min:l,max:p,step:y,help:k}))}function $(){return Object.fromEntries(s.map(_=>[_[1],_[3]]))}function S(_){if(_!==void 0&&(typeof _!="object"||_===null||Array.isArray(_)))throw Error("Ung\xFCltige Parameterdatei.");let A=$();for(let[,R,,I,l,p]of s){if(_?.[R]===void 0)continue;let y=Number(_[R]);if(!Number.isFinite(y)||y<l||y>p)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+R);A[R]=y}if(A["relief.mountainFraction"]+A["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return A}function g(_){if(!Array.isArray(_)||!_.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let A=_.map(I=>I?.stats??I);if(A.some(I=>!I||!Number.isFinite(I.total)||I.total<=0||!Number.isFinite(I.land)||I.land<0||I.land>I.total||!I.biomes||!I.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function R(I,l,p){let y=[...new Set([...I,...A.flatMap(W=>Object.keys(W[l]))])],k=A.reduce((W,O)=>W+O[p],0);return Object.fromEntries(y.map(W=>{let O=A.map(X=>X[l][W]||0),K=O.reduce((X,oe)=>X+oe,0);return[W,{total:K,mean:K/A.length,percent:k?100*K/k:0,worldsPresent:O.filter(X=>X>0).length}]}))}return{generatorVersion:e,samples:A.length,meanHexes:A.reduce((I,l)=>I+l.total,0)/A.length,meanLand:A.reduce((I,l)=>I+l.land,0)/A.length,biomes:R(n,"biomes","land"),terrains:R(i,"terrains","total")}}function L(_){if(!_||typeof _.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(_.id)||s.some(A=>A[1]===_.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let A of["defaultValue","min","max","step"])if(!Number.isFinite(_[A]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+A);if(_.min>_.defaultValue||_.defaultValue>_.max||_.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");s.push([String(_.group||"Erweiterungen"),_.id,String(_.label||_.id),_.defaultValue,_.min,_.max,_.step,String(_.help||"")])}function D(_){if(!_||!/^extension\.[a-z0-9_.]+$/.test(_.id)||typeof _.place!="function"||u.some(A=>A.id===_.id))throw Error("Ung\xFCltige Feature-Erweiterung.");u.push(_)}function C(_,A){return o.map(([R,I])=>A.get(a(_.q+R,_.r+I))).filter(Boolean)}function H(_,A,R,I,l,p=null,y=null){if(_==="arid"){if(R>l["biomes.dryThreshold"]-l["biomes.semiDesertMargin"])return"semi_desert";let k=q(I,y===null?I:y,l["geology.aridPatchMix"]),W=c(k+(l["geology.sandBias"]-.5)*.36);return U(W,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],l)}return _==="grassland"?R<l["geology.grassSparseHumidity"]?"sparse_pasture":I<l["geology.pastureSoil"]?"pasture":"grassland":_==="cold"?p&&p.hill>l["geology.highlandSoil"]&&A>=l["biomes.coldBoundary"]-l["geology.highlandColdMargin"]?"highland":A<l["biomes.coldBoundary"]-.04?R>l["biomes.snowHumidity"]?"snowfields":"frozen_tundra":A<l["biomes.coldBoundary"]&&R>.8?"snowfields":"tundra":_==="wetland"?A>l["geology.swampWarmBoundary"]?"swamp":A<.38?"moor":R>.85?"marshland":I>l["geology.wetlandSoil"]?"moor":"marshland":_==="jungle"?"jungle":_==="savanna"?R<.33?"semi_desert":"savanna":"grassland"}function J(_,A,R){return _<R["biomes.coldBoundary"]?"cold":A>R["biomes.wetThreshold"]?_>R["biomes.jungleWarmBoundary"]?"jungle":"wetland":A<R["biomes.dryThreshold"]&&_>R["biomes.aridWarmBoundary"]?"arid":_>R["biomes.warmBoundary"]?"savanna":A>R["biomes.wetlandBoundary"]?"wetland":"grassland"}function B(_,A,R,I){let l=Math.sqrt(I["biomes.targetHexes"]),p=I["biomes.borderWarp"]*l,y=A+p*(v(_,A,R,l*.72,"warp-a")-.5)*2,k=R+p*(v(_,A,R,l*.72,"warp-b")-.5)*2,W=Math.floor(y/l),O=Math.floor(k/l),K=1/0,X=null;for(let oe=-1;oe<=1;oe++)for(let j=-1;j<=1;j++){let F=W+j,ie=O+oe,le=(F+.5+(x(_,F,ie,"jit-q")-.5)*.72)*l,Pe=(ie+.5+(x(_,F,ie,"jit-r")-.5)*.72)*l,xe=(y-le)*(y-le)+(k-Pe)*(k-Pe);xe<K&&(K=xe,X={id:a(F,ie),x:le,y:Pe})}return X}let T=(_,A)=>Math.max(Math.abs(_.q-A.q),Math.abs(_.r-A.r),Math.abs(_.q+_.r-A.q-A.r));function Y(_,A,R,I,l=()=>!0){if(R<=0)return 1/0;let p=[];for(let y=0;y<1900;y++){let k=Math.floor((x(_,y,0,"sampleQ:"+A)-.5)*6900),W=Math.floor((x(_,y,1,"sampleR:"+A)-.5)*6900);l(k,W)&&p.push(I(k,W))}return p.length?(p.sort((y,k)=>k-y),p[Math.min(p.length-1,Math.floor(c(R)*p.length))]):1/0}function ae(_,A){if(typeof _!="string"||_.length<1||_.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let R=S(A),I=d(r+":"+_),l={...R,"biomes.targetHexes":Math.max(5,R["geology.scale"]*1.5)},p=new Map,y=new Map,k=new Map,W=(P,G)=>a(P,G),O=(P,G)=>c(R["climate.temperature"]+(v(I,P,G,R["climate.scale"],"temp")-.5)*2*R["climate.tempVariation"]),K=(P,G)=>c(R["climate.humidity"]+(v(I,P,G,R["climate.scale"]*.9,"wet")-.5)*2*R["climate.humidityVariation"]);function X(P,G){let Q=v(I,P,G,R["water.scale"],"sea"),me=v(I,P,G,Math.max(3,R["water.scale"]*.45),"sea-mid"),E=v(I,P,G,Math.max(2,R["water.scale"]*.21),"shore"),N=.2+.3*R["water.coastDetail"];return(Q+me)*.5*(1-N)+E*N}function oe(P,G){let Q=v(I,P,G,4.2,"lakes");return X(P,G)-Math.max(0,Q-.68)*R["water.lakeInfluence"]}let j=Y(I,"water",R["water.fraction"],(P,G)=>-X(P,G));function F(P,G){let Q=W(P,G);if(p.has(Q))return p.get(Q);let me=-oe(P,G)>=j;return p.set(Q,me),me}function ie(P,G){let Q=W(P,G);if(y.has(Q))return y.get(Q);let me=v(I,P,G,R["relief.scale"],"relief"),E=Math.max(6,R["relief.chainLength"]),N=P+(v(I,P,G,E*.58,"m-warp-q")-.5)*11,te=G+(v(I,P,G,E*.58,"m-warp-r")-.5)*11,z=1-Math.abs(v(I,N*.56+te*.36,te*1.18,E,"ridge")-.5)*2,de=1-Math.abs(v(I,N*.34-te*.74,N*1.08,E*1.25,"ridge-b")-.5)*2,ce=Math.max(z,de*.86),ue=Math.pow(ce,3.6),Se=1-Math.abs(v(I,P*.92+G*.28,G*.96,7.5,"m-pass-a")-.5)*2,Ve=1-Math.abs(v(I,P*.28-G*.92,P*.96,8.2,"m-pass-b")-.5)*2,Re=Math.max(Se,Ve),ze=Re>.82?Math.pow((Re-.82)/.18,.7)*.62:0,Qe=.92-.14*c(R["relief.chainWidth"],.05,.95),Je=c(ue*Qe+me*(1-Qe)-ze,0,1),st=c(ce*.65+me*.35,0,1),pt={mass:me,mountain:Je,oreBelt:st,hill:me*.75+v(I,P,G,R["relief.scale"]*.46,"hills")*.25};return y.set(Q,pt),pt}let le=Y(I,"mountain",R["relief.mountainFraction"],(P,G)=>ie(P,G).mountain,(P,G)=>!F(P,G)),Pe=(P,G)=>!F(P,G)&&ie(P,G).mountain>=le,xe=new Map,we=(P,G)=>{let Q=W(P,G);if(xe.has(Q))return xe.get(Q);if(!Pe(P,G))return xe.set(Q,!1),!1;let me=!1;for(let E=-2;E<=2&&!me;E++){let N=Math.max(-2,-E-2),te=Math.min(2,-E+2);for(let z=N;z<=te;z++)if(!(E===0&&z===0)&&!Pe(P+E,G+z)){me=!0;break}}return xe.set(Q,me),me},pe=Y(I,"hills",R["relief.hillFraction"],(P,G)=>ie(P,G).hill,(P,G)=>!F(P,G)&&!we(P,G)),ge=(P,G)=>!F(P,G)&&!we(P,G)&&ie(P,G).hill>=pe,be=Math.min(16,Math.max(3,Math.ceil(R["climate.coastalDecay"]*3))),ve=new Map;function We(P,G){let Q=W(P,G);if(ve.has(Q))return ve.get(Q);if(F(P,G))return ve.set(Q,0),0;let me=be+1;e:for(let E=1;E<=be;E++)for(let N=-E;N<=E;N++){let te=Math.max(-E,-N-E),z=Math.min(E,-N+E);for(let de=te;de<=z;de++)if(Math.max(Math.abs(N),Math.abs(de),Math.abs(N+de))===E&&F(P+N,G+de)){me=E;break e}}return ve.set(Q,me),me}let Ae=new Map;function Oe(P,G){let Q=W(P,G);if(k.has(Q))return k.get(Q);let me=O(P,G),E=K(P,G),N=We(P,G),te=c(E+R["climate.coastalHumidity"]*Math.exp(-N/R["climate.coastalDecay"])),z=B(I,P,G,R);Ae.has(z.id)||Ae.set(z.id,{t:O(z.x,z.y),h:K(z.x,z.y)});let de=Ae.get(z.id),ce=R["biomes.regionClimateMix"],ue=c(de.t*ce+me*(1-ce)),Se=c(de.h*ce+te*(1-ce)),Ve=J(ue,Se,R),Re=v(I,P,G,R["geology.scale"],"soil"),ze=ie(P,G),Qe=(Ve==="arid"&&R["geology.aridPatchMix"]>0?B(I,P,G,l):null)?.id.split(",").map(Number),Je=Qe?x(I,Qe[0],Qe[1],"arid-patch"):null,st={t:me,h:te,center:z,family:Ve,soil:Re,landRelief:ze,aridPatch:Je,riverPotential:c(te*.68+ze.mass*.18+Math.min(N,15)/30)};return k.set(Q,st),st}function De(P,G){return F(P,G)?o.some(([Q,me])=>!F(P+Q,G+me))?"coastal_water":O(P,G)<R["water.iceTemperature"]?"icy_ocean":v(I,P,G,R["water.scale"]*.8,"storm")>1-R["water.stormChance"]?"stormy_ocean":"ocean":"land"}function Ie(P){let G=(Q,me)=>x(I,P.q,P.r,"feature:"+Q)<me/1e3;P.surfaceClass==="land"&&P.reliefClass!=="mountain"?(G("iron",R["features.ironPer1000"])&&Oe(P.q,P.r).landRelief.oreBelt>.3&&P.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(P.baseBiome)&&G("animals",R["features.animalsPer1000"])&&(P.baseBiome==="wetland"||P.baseBiome==="jungle"?P.features.push("pigs"):P.baseBiome==="savanna"||P.terrainId==="sparse_pasture"?P.features.push("horses"):P.features.push(x(I,P.q,P.r,"species")>.5?"pigs":"horses")),G("ruins",R["features.ruinsPer1000"])&&P.features.push("ruins"),G("obelisk",R["features.obelisksPer1000"])&&P.features.push("obelisk"),P.baseBiome==="arid"&&G("oasis",R["features.oasesPer1000"])&&P.features.push("oasis")):P.surfaceClass!=="land"&&G("wreck",R["features.wrecksPer1000"])&&P.features.push("wreck");for(let Q of u)Q.place({hex:P,config:R,seed:_,random:me=>x(I,P.q,P.r,Q.id+":"+me)})&&P.features.push(Q.id);return P}function Le(P,G){let Q=De(P,G),me=Q==="land",E=me?Oe(P,G):null,N=me&&we(P,G),te=me&&!N&&ge(P,G),z=me?E.family==="jungle"?1:E.family==="grassland"?.86:E.family==="wetland"?.76:E.family==="savanna"?.46:E.family==="cold"?.25:.08:0,de=me?(v(I,P,G,R["forest.patchScale"],"forest")-.5)*1.6+R["forest.coverage"]-.3+(E.h-.5)*.35:0,ce=N?0:E?.family==="jungle"?Math.max(.76,c(de)):c(de)*z,ue=N?"none":E?.family==="jungle"||ce>=R["forest.denseThreshold"]*R["forest.denseFactor"]?"dense_forest":ce>R["forest.lightThreshold"]?"light_forest":"none";return{q:P,r:G,temperature:E?.t??O(P,G),humidity:E?.h??K(P,G),regionId:E?.center.id??"",baseBiome:E?.family??null,terrainId:me?H(E.family,E.t,E.h,E.soil,R,E.landRelief,E.aridPatch):Q,surfaceClass:Q,reliefClass:N?"mountain":te?"hills":"flat",hillProfile:te?["rounded","steep","chain","plateau","ridge"][Math.floor(x(I,Math.floor(P/3),Math.floor(G/3),"hill-style")*5)]:null,hillStrength:te?c(E.landRelief.hill*R["relief.hillVariation"]+(1-R["relief.hillVariation"])*.4):0,mountainClass:N?"massif":null,forestDensity:ce,forestClass:ue,riverPotential:E?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function Xe(P,G,Q,me){let E=R["rivers.maxLength"],N=R["rivers.minLength"],te=E+1,z=2*E+2,de=(ne,fe)=>ne>=P&&ne<P+Q&&fe>=G&&fe<G+me,ce=P-z,ue=G-z,Se=Q+2*z,Ve=me+2*z,Re=new Int16Array(Se*Ve);Re.fill(-1);let ze=new Int32Array(Se*Ve),ut=new Int32Array(Se*Ve),Qe=0,Je=0;for(let ne=0;ne<Ve;ne++){let fe=ue+ne,_e=ne*Se;for(let ye=0;ye<Se;ye++){let Ee=ce+ye;F(Ee,fe)&&(Re[_e+ye]=0,ze[Je]=Ee,ut[Je]=fe,Je++)}}for(;Qe<Je;){let ne=ze[Qe],fe=ut[Qe];Qe++;let _e=Re[(fe-ue)*Se+(ne-ce)];if(_e>=E)continue;let ye=_e+1;for(let Ee=0;Ee<6;Ee++){let he=ne+o[Ee][0],Ue=fe+o[Ee][1],qe=he-ce,$e=Ue-ue;if(qe<0||qe>=Se||$e<0||$e>=Ve)continue;let Ye=$e*Se+qe;Re[Ye]>=0||we(he,Ue)||(Re[Ye]=ye,ze[Je]=he,ut[Je]=Ue,Je++)}}let st=[],pt=new Map,Rr=R["rivers.sourcesPer100"]/100,Er=f("river-source"),ee=f("river-turn"),se=1/4294967296;function Ce(ne,fe){for(let[_e,ye]of[[ne,fe],[fe,ne]]){if(!de(_e.q,_e.r)||F(_e.q,_e.r))continue;let Ee=o.findIndex(([qe,$e])=>_e.q+qe===ye.q&&_e.r+$e===ye.r);if(Ee<0)continue;let he=W(_e.q,_e.r),Ue=pt.get(he);Ue||(Ue=[],pt.set(he,Ue)),Ue.includes(Ee)||Ue.push(Ee)}}for(let ne=G-te;ne<G+me+te;ne++)for(let fe=P-te;fe<P+Q+te;fe++){if(m(I,fe,ne,Er)*se>=Rr||Re[(ne-ue)*Se+(fe-ce)]<N||F(fe,ne)||we(fe,ne)||Oe(fe,ne).riverPotential<.36)continue;let ye=[{q:fe,r:ne}],Ee={q:fe,r:ne};for(let he=0;he<E;he++){let Ue=Re[(Ee.r-ue)*Se+(Ee.q-ce)];if(Ue<=0)break;let qe=null,$e=1/0;for(let Ye=0;Ye<6;Ye++){let _t=Ee.q+o[Ye][0],Ke=Ee.r+o[Ye][1],yt=_t-ce,bt=Ke-ue;if(yt<0||yt>=Se||bt<0||bt>=Ve||Re[bt*Se+yt]!==Ue-1)continue;let at=ie(_t,Ke).hill*(1-R["rivers.meander"])+m(I,_t,Ke,ee)*se*R["rivers.meander"];at<$e&&($e=at,qe={q:_t,r:Ke})}if(!qe)break;Ee=qe,ye.push(Ee)}if(!(!F(Ee.q,Ee.r)||ye.length-1<N)&&ye.some(he=>de(he.q,he.r))){st.push(ye.map(he=>[he.q,he.r]));for(let he=1;he<ye.length;he++)Ce(ye[he-1],ye[he])}}for(let ne of pt.values())ne.sort((fe,_e)=>fe-_e);return{routes:st,edgesByKey:pt}}function Be(P,G){return Ie(Le(P,G))}return{c:R,s:I,spot:W,wet:F,relief:ie,isMountain:we,isHill:ge,field:Oe,surface:De,buildBaseCell:Le,attachFeatures:Ie,sampleCell:Be,traceRivers:Xe}}function re(_,A={}){if(typeof _!="string"||_.length<1||_.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let R=A.width===void 0?100:Number(A.width),I=A.height===void 0?80:Number(A.height),l=A.originQ===void 0?0:Number(A.originQ),p=A.originR===void 0?0:Number(A.originR);if(!Number.isSafeInteger(R)||!Number.isSafeInteger(I)||R<10||I<10||R*I>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(l)||!Number.isSafeInteger(p)||Math.abs(l)>1e6||Math.abs(p)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let y=ae(_,A.config),{c:k,s:W,spot:O,wet:K,relief:X,isMountain:oe,field:j,buildBaseCell:F,attachFeatures:ie}=y,le=[],Pe=new Map;for(let E=p;E<p+I;E++)for(let N=l;N<l+R;N++){let te=F(N,E);le.push(te),Pe.set(O(N,E),te)}let xe=k["rivers.maxLength"],we=k["rivers.minLength"],pe=xe+1,ge=2*xe+2,be=new Map,ve=[];for(let E=p-ge;E<p+I+ge;E++)for(let N=l-ge;N<l+R+ge;N++)K(N,E)&&(be.set(O(N,E),0),ve.push({q:N,r:E}));let We=l-ge,Ae=l+R+ge-1,Oe=p-ge,De=p+I+ge-1;for(let E=0;E<ve.length;E++){let N=ve[E],te=be.get(O(N.q,N.r));if(!(te>=xe))for(let[z,de]of o){let ce=N.q+z,ue=N.r+de,Se=O(ce,ue);ce<We||ce>Ae||ue<Oe||ue>De||oe(ce,ue)||be.has(Se)||(be.set(Se,te+1),ve.push({q:ce,r:ue}))}}let Ie=[],Le=[];function Xe(E,N){for(let[te,z]of[[E,N],[N,E]]){let de=Pe.get(O(te.q,te.r));if(!de||de.surfaceClass!=="land")continue;de.river=!0;let ce=o.findIndex(([ue,Se])=>te.q+ue===z.q&&te.r+Se===z.r);ce>=0&&!de.riverEdges.includes(ce)&&de.riverEdges.push(ce)}}for(let E=p-pe;E<p+I+pe;E++)for(let N=l-pe;N<l+R+pe;N++){if(K(N,E)||oe(N,E)||x(W,N,E,"river-source")>=k["rivers.sourcesPer100"]/100)continue;let te=be.get(O(N,E));if(te===void 0||te<we||j(N,E).riverPotential<.36)continue;let z=[{q:N,r:E}],de={q:N,r:E};for(let ce=0;ce<xe;ce++){let ue=be.get(O(de.q,de.r));if(ue===0)break;let Se=o.map(([Re,ze])=>({q:de.q+Re,r:de.r+ze})).filter(Re=>be.get(O(Re.q,Re.r))===ue-1);if(!Se.length)break;let Ve=Re=>X(Re.q,Re.r).hill*(1-k["rivers.meander"])+x(W,Re.q,Re.r,"river-turn")*k["rivers.meander"];Se.sort((Re,ze)=>Ve(Re)-Ve(ze)),de=Se[0],z.push(de)}if(!(!K(de.q,de.r)||z.length-1<we)&&z.some(ce=>Pe.has(O(ce.q,ce.r)))){Le.push(z),z.every(ce=>Pe.has(O(ce.q,ce.r)))&&Ie.push(z.map(ce=>[ce.q,ce.r]));for(let ce=1;ce<z.length;ce++)Xe(z[ce-1],z[ce])}}for(let E of le)ie(E),E.riverEdges.sort((N,te)=>N-te);let Be=le.filter(E=>E.surfaceClass==="land").length,P={total:le.length,land:Be,water:le.length-Be,coast:0,hills:0,mountains:0,rivers:Ie.length,riverCrossingCount:Le.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},G=new Map;for(let E of le){E.surfaceClass==="coastal_water"&&P.coast++,E.reliefClass==="hills"&&P.hills++,E.reliefClass==="mountain"&&P.mountains++,E.river&&P.riverHexes++,E.forestClass!=="none"&&P.forest++,E.baseBiome&&(P.biomes[E.baseBiome]=(P.biomes[E.baseBiome]||0)+1,G.set(E.regionId,(G.get(E.regionId)||0)+1)),E.surfaceClass==="land"&&E.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(E.baseBiome)&&P.forestEligible++,P.terrains[E.terrainId]=(P.terrains[E.terrainId]||0)+1;for(let N of E.features)P.features[N]=(P.features[N]||0)+1}P.forestPercentLand=Be?+(100*P.forest/Be).toFixed(1):0,P.forestPercentEligible=P.forestEligible?+(100*P.forest/P.forestEligible).toFixed(1):0;let Q=[...G.values()].sort((E,N)=>E-N);P.biomeRegions={count:Q.length,min:Q[0]||0,average:Q.length?+(Be/Q.length).toFixed(1):0,median:Q.length?Q[Math.floor(Q.length/2)]:0,max:Q.at(-1)||0,within30to90:Q.filter(E=>E>=30&&E<=90).length};function me(E){let N=new Set,te=0;for(let z of le){let de=O(z.q,z.r);if(N.has(de)||!E(z))continue;let ce=[z];N.add(de);for(let ue=0;ue<ce.length;ue++)for(let Se of C(ce[ue],Pe)){let Ve=O(Se.q,Se.r);E(Se)&&!N.has(Ve)&&(N.add(Ve),ce.push(Se))}te=Math.max(te,ce.length)}return te}return P.connectedLandPercent=Be?+(100*me(E=>E.surfaceClass==="land")/Be).toFixed(1):0,P.largestWaterBody=me(E=>E.surfaceClass!=="land"),{version:e,seed:_,width:R,height:I,originQ:l,originR:p,config:k,cells:le,riverPaths:Ie,riverPreviewPaths:Le.map(E=>E.map(N=>[N.q,N.r])),stats:P,riverGeometry:"hex-edges"}}let V={VERSION:e,DIRS:o,TERRAIN_IDS:i,BIOME_IDS:n,parameterSchema:M,defaultConfig:$,normalizeConfig:S,aggregateDistributions:g,registerParameter:L,registerFeature:D,createPointSampler:ae,generateWorld:re,getWorldCell:(_,A,R)=>{let I=_.originQ??0,l=_.originR??0;return A<I||R<l||A>=I+_.width||R>=l+_.height?null:_.cells[(R-l)*_.width+(A-I)]??null}};typeof Kt<"u"&&Kt.exports&&(Kt.exports=V),t.VedrasGeography=V})(typeof window<"u"?window:globalThis)});var lo=Pr(Zt());var xo=Math.sqrt(3),Ze=256/xo,Ge=.85,je=1.5*Ze,an=je*Ge,Me=16,Te=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function ke(t,e){return{x:256*(t+e*.5),y:an*e}}function et(t,e){let r=e/an,o=t/256-r*.5,i=-o-r,n=Math.round(o),s=Math.round(r),u=Math.round(i),c=Math.abs(n-o),a=Math.abs(s-r),d=Math.abs(u-i);return c>a&&c>d?n=-s-u:a>d&&(s=-n-u),{q:n===0?0:n,r:s===0?0:s}}function tt(t,e,r,o){let i=t-r,n=e-o;return(Math.abs(i)+Math.abs(i+n)+Math.abs(n))/2}function At(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function kt(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function Wt(t,e,r=Me){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function vt(t,e){return`${t},${e}`}function Fe(t,e){return`${t},${e}`}function Ar(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,i=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,s=-1/0,u=1/0,c=-1/0;for(let a of i){let d=et(a.x,a.y);d.q<n&&(n=d.q),d.q>s&&(s=d.q),d.r<u&&(u=d.r),d.r>c&&(c=d.r)}return{minQ:n-e,maxQ:s+e,minR:u-e,maxR:c+e}}function ln(t,e=Me,r=3){let o=Ar(t,r),i=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),s=Math.floor(o.minR/e),u=Math.floor(o.maxR/e),c=et(t.x,t.y),a=c.q/e,d=c.r/e,h=[];for(let f=s;f<=u;f++)for(let m=i;m<=n;m++){let b=m+.5-a,x=f+.5-d;h.push({cq:m,cr:f,dist2:b*b+x*x})}return h.sort((f,m)=>f.dist2-m.dist2),h.map(({cq:f,cr:m})=>({cq:f,cr:m}))}function cn(t,e,r,o=0){let i=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return i=Math.imul(i^i>>>15,2246822519)>>>0,i=Math.imul(i^i>>>13,3266489917)>>>0,(i^i>>>16)>>>0}function kr(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function Qt(t,e){let r=256*(t+e*.5),o=je*e,i=[];for(let n=0;n<6;n++){let s=-Math.PI/2+n*Math.PI/3;i.push({x:r+Ze*Math.cos(s),y:(o+Ze*Math.sin(s))*Ge})}return i}function lt(t,e,r){let o=Qt(t,e),i=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a:i,b:n,mid:{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}}function ot(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Te[s][0]===i&&Te[s][1]===n)return s;return-1}function Ft(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function un(t,e){let r=et(t,e),o=0,i=1/0;for(let a=0;a<6;a++){let{mid:d}=lt(r.q,r.r,a),h=t-d.x,f=e-d.y,m=h*h+f*f;m<i&&(i=m,o=a)}let[n,s]=Te[o],u=Ft(r.q,r.r,r.q+n,r.r+s),c=ot(u.q1,u.r1,u.q2,u.r2);return{q1:u.q1,r1:u.r1,q2:u.q2,r2:u.r2,dir:c}}var ct={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},er=new Set(["dead_trees","snow_dead_trees"]),Fr=new Set(["fallen_logs","snow_fallen_logs"]),wo=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),_o=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),Jt=new Set(["snowfields","frozen_tundra","tundra","highland"]);var dn=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),hn=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),Ct=new Set(["snowfields","frozen_tundra"]),Lt=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),Lr=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),mn=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),So=new Set([...mn,"savanna","jungle"]);function rt(t,e,r){return t<e?e:t>r?r:t}function Z(t,e,r,o=0,i=97,n=513,s=11){let u=(t|0)^Math.imul(e+i,374761393)^Math.imul(r+n,668265263)^Math.imul(o+s,2246822519);return u^=u>>>13,u=Math.imul(u,1274126177),((u^u>>>16)>>>0)/4294967296}function Dt(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function Co(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var It=new Set(["ocean","coastal_water","stormy_ocean"]);function xt(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function tr(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function Dr(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function Ir(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function rr(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function nr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function qr(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function pn(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:Lr.has(t)?.14:0}function Br(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*(Dt(t)?.32:.25):_o.has(t.family??"")?e:e*1.2}function or(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"}function Mt(t){if(!t||t.kind==="mountain")return 1;let e=Br(t),r=t.family??"",o=qt(t)==="cacti"?1.55:1;return er.has(r)?.58*e:Fr.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_decal"?.46*e:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function gn(t){return!!t&&t.kind==="tree"&&!er.has(t.family??"")}function bn(t){return!!t&&wo.has(t.family??"")}function vn(t){let e=t?.family??"";return er.has(e)?"dead_trees":Fr.has(e)?"fallen_logs":null}function yn(t){let e=t?.family??"";return er.has(e)?.11:Fr.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function xn(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function wn(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function qt(t){let e=wn(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}function Bt(t){let e=String(t.id??""),r=wn(t);return xt(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?It:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||nr(t)?Lr:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?Jt:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?dn:Co(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?Jt:Dt(t)?dn:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?So:/^(?:existing_)?berg_(?:1[4-6])$/.test(e)?new Set(["snowfields"]):/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?mn:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function _n(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,i=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),s=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),u=new Set;for(let[c,a]of Object.entries(e.terrain.byType))s.has(c)||(a.categoryId&&i.has(a.categoryId)||n.has(c))&&u.add(c);return u}function Wr(t,e,r,o,i,n=!1){if(!e)return!1;let s=o.terrain.byType[e];if(xt(t))return It.has(e);if(s&&s.materialClass!=="ground")return!1;let c=i?i.ecoFamily:qt(t),a=e,d=i?i.strict:Bt(t);if(d)return d.has(a);let h=n||r.some(x=>{let w=o.terrain.byType[x]?.materialClass;return w==="water"||w==="shoreline"}),f=r.some(x=>x==="jungle"||x==="savanna"),m=r.some(x=>x==="moor"||x==="swamp"||x==="marshland");if(c==="mangroves")return(a==="swamp"||a==="marshland")&&(h||f);if(c==="palms")return a==="jungle"||a==="savanna"||a==="tropical_coast"||Lt.has(a);if(c==="jungle_trees"||c==="tropical_bushes")return a==="jungle";if(c==="savanna_trees")return a==="savanna"||a==="semi_desert"||qr(t)&&Lt.has(a);if(c==="cacti")return a==="rocky_desert"||a==="sandy_desert"||a==="clay_desert"||a==="desert"||a==="semi_desert"||a==="sandy_rocky_desert"||a==="savanna";if(c==="succulents")return a==="savanna"||a==="semi_desert"||a==="rocky_desert"||a==="sandy_desert"||a==="sandy_rocky_desert"||a==="badlands"||a==="desert";if(c==="ferns")return a==="forest_floor"||a==="grassland"||a==="pasture"||a==="moor"||a==="swamp"||a==="marshland"||a==="jungle";if(c==="reeds")return a==="moor"||a==="swamp"||a==="marshland"||(a==="grassland"||a==="pasture"||a==="sparse_pasture")&&(h||m);if(c==="cold_bushes")return a==="tundra"||a==="frozen_tundra"||a==="highland";if(c==="snow_conifers"||c==="snow_dead_trees"||c==="snow_deadwood"||c==="snow_fallen_logs")return Jt.has(a);if(c==="riparian_trees")return a==="moor"||a==="swamp"||a==="marshland"||(a==="grassland"||a==="pasture")&&(h||m);let b=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(a==="snowfields"||a==="frozen_tundra")&&!b?!1:c==="dry_patches"?Lr.has(a):Dr(t)?!(a==="jungle"||a==="moor"||a==="swamp"||a==="marshland"||a==="snowfields"||a==="frozen_tundra"):c==="dry_bushes"?!(a==="jungle"||a==="moor"||a==="swamp"||a==="marshland"||a==="tundra"||a==="highland"):c==="herbs"?!(a==="jungle"||a==="swamp"||a==="marshland"||a==="ocean"||a==="snowfields"||a==="frozen_tundra"):c==="flowering_bushes"||c==="temperate_bushes"||c==="heath"?!(a==="jungle"||a==="rocky_desert"||a==="sandy_desert"||a==="clay_desert"):!0}function Sn(t,e,r,o,i){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,s=r.biome||n;if(xt(t))return It.has(n)&&e.has(n);if(Dt(t)&&(n==="jungle"||s==="jungle"))return!1;let u=o.terrain.byType[n],c=o.terrain.byType[s];if(u?.materialClass!=="ground"||c?.materialClass!=="ground")return!1;let a=i?i.strict:Bt(t);if(a){if(!a.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let d=n==="jungle"||n==="savanna",h=r.forestClass==="light_forest"||r.forestClass==="dense_forest",f=i?i.ecoFamily:qt(t),m=s==="jungle",b=n==="moor"||n==="swamp"||n==="marshland";if(m&&!d||t.family==="palms"&&(!(d||Lt.has(n))||b||Jt.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!m||h&&(f==="cacti"||f==="succulents"||f==="dry_bushes")||!(e.has(s)||e.has(n)||h&&e.has("forest_floor")&&t.family!=="palms"))return!1;let w=!!r.hasRiverEdge;return a?Wr(t,n,r.neighborTypes,o,i,w):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!Wr(t,n,r.neighborTypes,o,i,w)?!1:Wr(t,s,r.neighborTypes,o,i,w)}function Cn(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let i=o.terrain.byType[r];if(!i||i.materialClass!=="ground")return!1;let n=Bt(t);return n&&!n.has(r)?!1:e.has(r)}function Mo(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function fn(t,e,r){let o=e/3,i=r/3,n=Math.floor(o),s=Math.floor(i),u=o-n,c=i-s,a=u*u*(3-2*u),d=c*c*(3-2*c),h=Z(t,n,s,2301,8191,4093,17),f=Z(t,n+1,s,2301,8191,4093,17),m=Z(t,n,s+1,2301,8191,4093,17),b=Z(t,n+1,s+1,2301,8191,4093,17);return 2*((h+(f-h)*a)*(1-d)+(m+(b-m)*a)*d)-1}function Mn(t,e,r,o){let i=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:ct.mode,s=rt(o?.canopyCover??ct.canopyCover,.35,.98),u=rt(o?.canopyVariation??ct.canopyVariation,0,.3),c=rt(o?.gladeRate??ct.gladeRate,0,.3),a=rt(o?.edgeStrength??ct.edgeStrength,0,1);for(let d of t){let h=Fe(d.q,d.r),f=d.terrainId==="jungle",m=Mo(d.terrainId,e),b=rt(d.forestDensity||0,0,1),x,w;if(f){let U=.5+.5*fn(r+137,d.q,d.r),q=.5+.5*Math.sin(d.q*.62-d.r*.44+r%71)*Math.cos(d.q*.37+d.r*.71),v=rt(.46+.42*U+.14*q,.36,.98),M=b>.01?rt(b*(.68+.34*v),.32,.98):v;x=M>=.62?"dense_forest":"light_forest",w=M}else x=d.forestClass??(d.forestDensity>=.65?"dense_forest":d.forestDensity>.08?"light_forest":"none"),w=x==="none"?0:b>.01?b:x==="dense_forest"?1:.44;i.set(h,{q:d.q,r:d.r,key:h,baseBiome:d.terrainId,biome:f?"jungle":d.terrainId,jungle:f,suitability:m,forestMode:n,forestClass:m>0?x:"none",baseDensity:m>0?w:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let d of i.values()){if(!d.suitability)continue;let h=0;for(let[f,m]of Te){let b=i.get(Fe(d.q+f,d.r+m));b&&b.baseDensity>h&&(h=b.baseDensity)}d.edgeInfluence=rt(h*(d.baseDensity?.18:.48)*a*d.suitability,0,.46),d.density=rt(d.baseDensity+d.edgeInfluence,0,1)}if(n==="canopy"&&c>0){let d=rt(c*.55,0,.19),h=[];for(let f of i.values()){if(f.forestClass!=="dense_forest")continue;let m=0;for(let[U,q]of Te)i.get(Fe(f.q+U,f.r+q))?.forestClass==="dense_forest"&&m++;if(m<2)continue;let b=Z(r,f.q,f.r,1864,8191,4093,17),x=f.jungle?d*.62:d;if(b>=x)continue;let w=!1;for(let U=-2;U<=2&&!w;U++)for(let q=-2;q<=2;q++){if(q===0&&U===0||Math.abs(q+U)>2)continue;let v=i.get(Fe(f.q+q,f.r+U));if(!(!v||v.forestClass!=="dense_forest")&&Z(r,v.q,v.r,1864,8191,4093,17)<b){w=!0;break}}w||h.push(f)}for(let f of h){f.glade=!0;let m=f.jungle?.45:.84;if(Z(r,f.q,f.r,1954,8191,4093,17)<m){let b=null,x=1/0;for(let[w,U]of Te){let q=i.get(Fe(f.q+w,f.r+U));if(!q||q.forestClass!=="dense_forest"||q.jungle!==f.jungle)continue;let v=Z(r,q.q,q.r,1953,8191,4093,17);v<x&&(x=v,b=q)}b&&(b.glade=!0)}}}for(let d of i.values()){if(!d.suitability)continue;if(d.glade){d.gladeX=Math.round((Z(r,d.q,d.r,2041,8191,4093,17)-.5)*52),d.gladeY=Math.round((Z(r,d.q,d.r,2042,8191,4093,17)-.5)*40);let b=d.jungle?46:58;d.gladeRadius=b+Math.round(Z(r,d.q,d.r,2043,8191,4093,17)*18)}let h=d.forestClass==="dense_forest"?1:d.forestClass==="light_forest"?d.jungle?.62:.49:d.edgeInfluence>.08?.17:0,f=fn(r,d.q,d.r),m=rt(s+u*f,.12,.98);d.canopyCoverage=rt(m*h*(.58+.42*d.density)*d.suitability*(d.glade?d.jungle?.34:.24:1),0,.98)}return i}function Rn(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function En(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function Ur(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,i=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return i*i+n*n<.94*.94}function Tn(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function Ut(t,e,r,o){let i=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*Z(t,e,r,i,173,311,79);for(let[s,u]of Te)n+=.5/6*Z(t,e+s,r+u,i,173,311,79);return rt(1+(n-.5)*1.5,.6,1.4)}function Pn(t,e,r,o,i,n){let u=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,c=(Z(t,e,r,u,173,311,79)-.5)*154,a=(Z(t,e,r,u+1,173,311,79)-.5)*146,d=Z(t,e,r,i*127+n*2+17,173,311,79),h=Z(t,e,r,i*127+n*2+18,173,311,79),f=(d-.5)*242,m=(h-.5)*258,b=n>=26?0:o==="tree"?.43:.68,x=o==="tree"?170:126,w=c+(d-.5)*x,U=a+(h-.5)*x;return{dx:f*(1-b)+w*b,dy:m*(1-b)+U*b}}function ir(t,e,r=0){let o=Math.abs(t),i=Math.abs(e);return i<=Ze-r&&o<=Math.min(128,Math.sqrt(3)*(Ze-i))-r}function An(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:Z(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var ar=128,Ht=78,Et={enabled:!0,strength:Ht,lighting:!0,style:"sculpted"},Hr=168,Or=127,Gt=Hr+Or;function dt(t,e,r){return t<e?e:t>r?r:t}function Rt(t){let e=dt(t,0,1);return e*e*(3-2*e)}function kn(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function sr(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function Gr(t,e,r){let o=Math.floor(t),i=Math.floor(e),n=t-o,s=e-i,u=n*n*n*(n*(n*6-15)+10),c=s*s*s*(s*(s*6-15)+10),a=sr(o,i,r),d=sr(o+1,i,r),h=sr(o,i+1,r),f=sr(o+1,i+1,r);return(a+(d-a)*u)*(1-c)+(h+(f-h)*u)*c}function Ro(t,e,r){let o=Gr(t/380,e/380,r^324508639),i=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,s=Gr(i,n,r^610839777),u=(t*.3255682-e*.9455186)/105,c=(t*.9455186+e*.3255682)/105,a=Gr(u,c,r^916255320);return{plainSwell:o*.78+s*.22,ridgeDetail:o*.34+s*.46+a*.2}}function Wn(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function Eo(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let i=r?.categoryId??"";return(i==="wetlands"?.3:i==="cold_regions"?.25:i==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function Fn(t,e,r,o=Ht,i="sculpted"){let n=[],s=[];for(let c=0;c<t.length;c++){let a=t[c],d=256*(a.q+a.r*.5),h=je*a.r;if(Wn(a,e)){s.push({x:d,y:h});continue}if(a.reliefClass!=="hills")continue;let f=dt(a.hillStrength??.7,0,1);if(f<=0)continue;let m=(Math.imul(a.q,73856093)^Math.imul(a.r,19349663)^r)>>>0,b=(kn(m)-.5)*1.7,x=a.hillProfile||"rounded",w=x==="ridge"||x==="chain"?560:440;n.push({x:d,y:h,ca:Math.cos(b),sa:Math.sin(b),shape:x,weight:.42+.58*f,reach:w})}let u=o>0?i==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:s,strengthPct:o,heightGain:u,seedInt:r,style:i}}function Ln(t,e,r){let o=e*t.ca+r*t.sa,i=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(i/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(i/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,i/158),3.1)):t.shape==="plateau"?1-Rt((Math.hypot(o/188,i/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(i/180)**2))}function Dn(t,e,r,o,i,n,s,u){if(n<=0||e<=.004)return 0;if(u==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:c,ridgeDetail:a}=Ro(r,o,s),d=Math.max(0,c-.38)*14*(i/100)*e;if(t<=1e-4)return d;let h=1-Math.exp(-t*.76),f=n*h*(.76+.42*a)*e;return Math.min(ar,f+d*.55)}function In(t,e,r){if(t.heightGain<=0)return 0;let o=0,i=t.waters,n=Gt*Gt;for(let a=0;a<i.length;a++){let d=i[a],h=e-d.x,f=r-d.y;if(Math.abs(h)>Gt||Math.abs(f)>Gt)continue;let m=h*h+f*f;if(m<n){let b=1-Rt((Math.sqrt(m)-Hr)/Or);b>o&&(o=b)}}let s=1-o;if(s<=.004)return 0;let u=0,c=t.hills;for(let a=0;a<c.length;a++){let d=c[a],h=e-d.x,f=r-d.y;Math.abs(h)>d.reach||Math.abs(f)>d.reach||(u+=Ln(d,h,f)*d.weight)}return Dn(u,s,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function qn(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),i=t.width/(r-1),n=t.height/(o-1),s=1/i,u=1/n,c=r*o,a=new Float32Array(c),d=new Float32Array(c),h=new Float32Array(c),f=new Float32Array(c),m=new Float32Array(c),b=new Float32Array(c),x=new Float32Array(c),w=520,U=Math.floor((t.top-w)/je)-2,q=Math.ceil((t.top+t.height+w)/je)+2,v=t.reliefStyle??"sculpted",M=t.reliefStrength??Ht,$=M>0?v==="sculpted"?112*(M/100):67*(M/100)*1.2:0,S=(D,C,H,J,B,T)=>{let Y=Math.max(0,Math.floor((C-T-t.left)*s)),ae=Math.min(r-1,Math.ceil((C+T-t.left)*s)),re=Math.max(0,Math.floor((H-T-t.top)*u)),V=Math.min(o-1,Math.ceil((H+T-t.top)*u)),_=T*T;for(let A=re;A<=V;A++){let R=t.top+A*n-H,I=R*R,l=A*r;for(let p=Y;p<=ae;p++){let y=t.left+p*i-C,k=y*y+I;if(k>=_)continue;let W=1-Rt((Math.sqrt(k)-J)/B);W>D[l+p]&&(D[l+p]=W)}}};for(let D=U;D<=q;D++){let C=Math.floor((t.left-w)/256-D*.5)-2,H=Math.ceil((t.left+t.width+w)/256-D*.5)+2;for(let J=C;J<=H;J++){let B=t.lookupHex(J,D);if(!B||B.fogState===0)continue;let T=256*(J+D*.5),Y=je*D;if(Wn(B,t.manifest)){S(h,T,Y,Hr,Or,Gt),S(f,T,Y,108,48,160);continue}if((B.terrainId==="snowfields"||B.terrainId==="frozen_tundra"||B.terrainId==="jungle")&&S(f,T,Y,108,48,160),$>0&&B.reliefClass==="hills"){let V=dt(B.hillStrength??.7,0,1);if(V>0){let _=(Math.imul(J,73856093)^Math.imul(D,19349663)^t.seedInt)>>>0,A=(kn(_)-.5)*1.7,R=B.hillProfile||"rounded",I=R==="ridge"||R==="chain"?560:440,l={x:T,y:Y,ca:Math.cos(A),sa:Math.sin(A),shape:R,weight:.42+.58*V,reach:I},p=Math.max(0,Math.floor((T-I-t.left)*s)),y=Math.min(r-1,Math.ceil((T+I-t.left)*s)),k=Math.max(0,Math.floor((Y-I-t.top)*u)),W=Math.min(o-1,Math.ceil((Y+I-t.top)*u));for(let O=k;O<=W;O++){let K=t.top+O*n-Y,X=O*r;for(let oe=p;oe<=y;oe++){let j=t.left+oe*i-T,F=Ln(l,j,K);F>1e-4&&(a[X+oe]+=F*l.weight)}}}}let re=Eo(B,t.manifest);if(re>.01){let _=Math.max(0,Math.floor((T-172-t.left)*s)),A=Math.min(r-1,Math.ceil((T+172-t.left)*s)),R=Math.max(0,Math.floor((Y-172-t.top)*u)),I=Math.min(o-1,Math.ceil((Y+172-t.top)*u)),l=29584;for(let p=R;p<=I;p++){let y=t.top+p*n-Y,k=y*y,W=p*r;for(let O=_;O<=A;O++){let K=t.left+O*i-T,X=K*K+k;if(X>=l)continue;let oe=1-Rt((Math.sqrt(X)-110)/56);if(oe>0){let j=W+O,F=m[j]+oe*1.15;m[j]=F>1?1:F,re>b[j]&&(b[j]=re)}}}if(B.glade){let p=T+(B.gladeX??0),y=Y+(B.gladeY??0),k=B.gladeRadius??64,W=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[O,K,X]of W){let oe=p+k*O,j=y+k*K,F=k*X,ie=F*F,le=Math.max(0,Math.floor((oe-F-t.left)*s)),Pe=Math.min(r-1,Math.ceil((oe+F-t.left)*s)),xe=Math.max(0,Math.floor((j-F-t.top)*u)),we=Math.min(o-1,Math.ceil((j+F-t.top)*u));for(let pe=xe;pe<=we;pe++){let ge=t.top+pe*n-j,be=ge*ge,ve=pe*r;for(let We=le;We<=Pe;We++){let Ae=t.left+We*i-oe,Oe=Ae*Ae+be;if(Oe>=ie)continue;let De=1-Rt((Math.sqrt(Oe)-F*.14)/(F*.86)),Ie=ve+We;De>x[Ie]&&(x[Ie]=De)}}}}}}}for(let D=0;D<o;D++){let C=t.top+D*n,H=D*r;for(let J=0;J<r;J++){let B=H+J,T=1-h[B];if(T<=.004||$<=0)continue;let Y=t.left+J*i;d[B]=Dn(a[B],T,Y,C,M,$,t.seedInt,v)}}let g=new Uint8Array(c*4),L=Math.max(1,(i+n)*.5);for(let D=0;D<o;D++){let C=D>0?D-1:0,H=D<o-1?D+1:o-1,J=Math.max(1,(H-C)*n),B=D*r;for(let T=0;T<r;T++){let Y=T>0?T-1:0,ae=T<r-1?T+1:r-1,re=Math.max(1,(ae-Y)*i),V=B+T,_=d[V],A=d[B+Y],R=d[B+ae],I=d[C*r+T],l=d[H*r+T],p=(R-A)/re,y=(l-I)/J,k;if(v==="sculpted"){let X=((A+R+I+l)*.25-_)/L,oe=dt(-X*1.45,-.1,.12);k=dt(1-2.45*p-.65*y+oe,.6,1.36)}else k=dt(1-2.15*p-.48*y,.66,1.32);let W=1-f[V],O=m[V]>.01&&W>.01?Rt((m[V]-.12)/.72)*b[V]*(1-x[V]*.94)*W:0,K=V*4;g[K]=Math.round(dt(_/ar,0,1)*255),g[K+1]=Math.round(dt((k-.52)/.96,0,1)*255),g[K+2]=Math.round(dt(O,0,1)*255),g[K+3]=Math.round(dt(1-h[V],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:g,heights:d}}function Bn(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),i=(r-t.top)/t.height*(t.rows-1);if(o<0||i<0||o>=t.cols-1||i>=t.rows-1)return 0;let n=Math.floor(o),s=Math.floor(i),u=o-n,c=i-s,a=s*t.cols+n,d=t.heights[a],h=t.heights[a+1],f=t.heights[a+t.cols],m=t.heights[a+t.cols+1];return(d*(1-u)+h*u)*(1-c)+(f*(1-u)+m*u)*c}var Nr=65536,lr=16,ft={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function To(t){if(!t)return ft.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?ft.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?ft.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?ft.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?ft.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?ft.forest:r==="hills"?ft.rock:ft.earth}var Po=`#version 300 es
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
`,Ao=`#version 300 es
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
`;function cr(t,e){return{x:256*(t+e*.5),y:je*e}}function Ot(t,e){let r=cr(t,e),o=[];for(let i=0;i<6;i++){let n=-Math.PI/2+i*Math.PI/3;o.push({x:r.x+Ze*Math.cos(n),y:r.y+Ze*Math.sin(n)})}return o}function Xr(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Te[s][0]===i&&Te[s][1]===n)return s;return-1}function ko(t,e,r){let o=Ot(t,e),i=o[r],n=o[(r+1)%6];return{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}function Wo(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function Un(t,e){for(let r=0;r<6;r++)if(Wo(t[r],e))return r;return-1}function Vr(t,e,r,o){let i=Ot(t,e),n=Un(i,r),s=Un(i,o);if(n<0||s<0)return[r,o];let u=(s-n+6)%6,c=(n-s+6)%6,a=u<=c?1:-1,d=Math.min(u,c),h=[];for(let f=0;f<=d;f++)h.push(i[(n+a*f+12)%6]);return h}function zr(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],i=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let u=1;u<n;u++){let c=t[u-1],a=t[u],d=t[u+1],h=a.x-c.x,f=a.y-c.y,m=d.x-a.x,b=d.y-a.y,x=Math.hypot(h,f),w=Math.hypot(m,b);if(x<1e-4||w<1e-4)continue;if((h*m+f*b)/(x*w)>.995){o.push(a);continue}let q=Math.min(x*.4,w*.4,i*1.4+14),v={x:a.x-h/x*q,y:a.y-f/x*q},M={x:a.x+m/w*q,y:a.y+b/w*q};o.push(v);for(let $=1;$<6;$++){let S=$/6,g=1-S;o.push({x:g*g*v.x+2*g*S*a.x+S*S*M.x,y:g*g*v.y+2*g*S*a.y+S*S*M.y})}o.push(M)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let s=[];for(let u=0;u<o.length;u++)(u===0||Math.hypot(o[u].x-s[s.length-1].x,o[u].y-s[s.length-1].y)>1e-4)&&s.push(o[u]);return s}function Nt(t,e=34){let r=t.hexes;if(!r||r.length<2)return null;let o=r.length-1,i=[];for(let T=0;T<o;T++){let[Y,ae]=r[T],[re,V]=r[T+1],_=Xr(Y,ae,re,V);if(_<0)return null;let A=Ot(Y,ae);i.push([A[_],A[(_+1)%6]])}let n=Xr(r[0][0],r[0][1],r[1][0],r[1][1]),s=t.corner??(n+3)%6,u=Ot(r[0][0],r[0][1])[s],c=i.map(()=>[1/0,1/0]),a=i.map(()=>[0,0]);for(let T=0;T<2;T++)c[0][T]=Vr(r[0][0],r[0][1],u,i[0][T]).length-1;for(let T=1;T<o;T++)for(let Y=0;Y<2;Y++)for(let ae=0;ae<2;ae++){let re=Vr(r[T][0],r[T][1],i[T-1][ae],i[T][Y]).length-1,V=c[T-1][ae]+re;V<c[T][Y]&&(c[T][Y]=V,a[T][Y]=ae)}let d=new Array(o),h=c[o-1][0]<=c[o-1][1]?0:1;for(let T=o-1;T>=0;T--)d[T]=i[T][h],h=a[T][h];let f=[];for(let T=0;T<o;T++){let Y=T===0?u:d[T-1],ae=d[T],re=Vr(r[T][0],r[T][1],Y,ae);for(let V=0;V<re.length;V++)f.push(re[V])}let m=r[o-1],b=r[o],x=Xr(m[0],m[1],b[0],b[1]);if(x<0)return null;let w=ko(m[0],m[1],x),U=cr(m[0],m[1]),q=cr(b[0],b[1]),v=q.x-U.x,M=q.y-U.y,$=Math.hypot(v,M)||1,S=v/$,g=M/$,L=Math.max(46,e*2.15);if(f.length>=2){let T=f[f.length-1];f[f.length-1]={x:w.x*.64+T.x*.36-S*38,y:w.y*.64+T.y*.36-g*38}}let D={x:w.x+S*L,y:w.y+g*L};f.push(w,D);let C=[];for(let T=0;T<f.length;T++)(T===0||Math.hypot(f[T].x-C[C.length-1].x,f[T].y-C[C.length-1].y)>1e-4)&&C.push(f[T]);let H=zr(C,e,!1);if(H.length<2)return null;let J=H.length-2,B=1/0;for(let T=0;T<H.length;T++){let Y=(H[T].x-w.x)**2+(H[T].y-w.y)**2;Y<B&&(B=Y,J=T)}return{id:t.id,points:H,mouthCrossIdx:J,mouthCrossPos:w,mouthDirX:S,mouthDirY:g,mouthReach:L,width:e,hasMouth:!0}}function Yr(t,e=34){if(!t||t.length===0)return[];let r=c=>`${Math.round(c.x*2)},${Math.round(c.y*2)}`,o=[],i=new Set,n=new Map;for(let c of t){let a=(c.dir%6+6)%6,d=Ot(c.q,c.r),h=d[a],f=d[(a+1)%6],m=r(h),b=r(f),x=m<b?`${m}|${b}`:`${b}|${m}`;if(i.has(x))continue;i.add(x);let w=o.length;o.push({a:h,b:f,ka:m,kb:b,used:!1});let U=n.get(m)??[];U.push(w),n.set(m,U);let q=n.get(b)??[];q.push(w),n.set(b,q)}let s=[],u=(c,a)=>{let d=o[c];d.used=!0;let h=a?[d.a,d.b]:[d.b,d.a],f=a?d.kb:d.ka;for(;;){let m=n.get(f);if(!m)break;let b=-1;for(let w of m)if(!o[w].used){b=w;break}if(b<0)break;let x=o[b];x.used=!0,x.ka===f?(h.push(x.b),f=x.kb):(h.push(x.a),f=x.ka)}return h};for(let c=0;c<2;c++)for(let a=0;a<o.length;a++)if(!o[a].used)if(c===0){let d=n.get(o[a].ka)?.length??0,h=n.get(o[a].kb)?.length??0;if(d!==1&&h!==1)continue;let f=u(a,d===1);s.push({id:`edge_${a}`,points:zr(f,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let d=u(a,!0);s.push({id:`edge_${a}`,points:zr(d,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return s}var ur=class{constructor(e){this.verts=new Float32Array(Nr*lr);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,Po),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,Ao),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate river program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=lr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,u,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,u,48),e.bindVertexArray(null);let c=a=>{let d=e.getUniformLocation(i,a);if(!d)throw new Error(`Missing river uniform: ${a}`);return d};this.uCamCenter=c("u_camCenter"),this.uViewportSize=c("u_viewportSize"),this.uZoom=c("u_zoom"),this.uCoastalWaterLayer=c("u_coastalWaterLayer"),this.uTime=c("u_time"),this.uWindEnabled=c("u_windEnabled"),this.uPassMode=c("u_passMode"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0)}getCachedCourse(e,r=34){let o=`${e.id}@${r}`;if(this.courseCache.has(o))return this.courseCache.get(o)??null;let i=Nt(e,r);if(this.courseCache.set(o,i),this.courseCache.size>512){let n=this.courseCache.keys().next().value;n!==void 0&&this.courseCache.delete(n)}return i}pushVertex(e,r,o,i,n,s,u,c,a,d,h,f,m){if(this.vertCount>=Nr)return;let b=this.vertCount*lr,x=this.verts;x[b++]=e,x[b++]=r,x[b++]=o,x[b++]=i,x[b++]=n,x[b++]=s,x[b++]=u,x[b++]=c,x[b++]=a,x[b++]=d,x[b++]=h,x[b++]=f,x[b++]=m.r,x[b++]=m.g,x[b++]=m.b,x[b++]=m.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return ft.earth;let i=et(e,r*Ge),n=0,s=0,u=0,c=0,a=0;for(let d=-1;d<6;d++){let h=d<0?i.q:i.q+Te[d][0],f=d<0?i.r:i.r+Te[d][1],m=o(h,f);if(!m)continue;let b=m.terrainId;if(b==="ocean"||b==="coastal_water"||b==="stormy_ocean"||b==="icy_ocean")continue;let x=cr(h,f),w=Math.hypot(e-x.x,r-x.y);if(w>380)continue;let U=Math.max(0,Math.min(1,1-Math.max(0,w-35)/345)),q=U*U*(3-2*U),v=q*q,M=To(m);s+=M.r*v,u+=M.g*v,c+=M.b*v,a+=M.rock*v,n+=v}return n<1e-4?ft.earth:{r:s/n,g:u/n,b:c/n,rock:a/n}}emitCourse(e,r,o,i,n){let s=e.points,u=s.length;if(u<2)return;let c=e.width*.5*n,a=e.mouthCrossPos??(e.hasMouth&&e.mouthCrossIdx>=0?s[e.mouthCrossIdx]:null),d=e.hasMouth?s[u-1]:null,h=a&&d?d.x-a.x:0,f=a&&d?d.y-a.y:0,m=Math.hypot(h,f)||1,b=e.mouthDirX??h/m,x=e.mouthDirY??f/m,w=Math.max(24,e.mouthReach??m),U=new Float32Array(u);for(let C=1;C<u;C++)U[C]=U[C-1]+Math.hypot(s[C].x-s[C-1].x,s[C].y-s[C-1].y);let q=Math.max(1,U[u-1]),v=new Float32Array(u),M=new Float32Array(u),$=new Float32Array(u),S=new Float32Array(u),g=new Array(u);for(let C=0;C<u;C++){let H=s[C>0?C-1:0],J=s[C<u-1?C+1:u-1],B=J.x-H.x,T=J.y-H.y,Y=Math.hypot(B,T)||1;v[C]=B/Y,M[C]=T/Y,$[C]=-T/Y,S[C]=B/Y,g[C]=this.sampleBankPalette(s[C].x,s[C].y,i)}let L=(C,H,J)=>{let B=r(C,H),T=C,Y=(H-B)*Ge,ae=U[J]/q,re=c*(e.hasMouth?.78+.3*ae:1),V=1,_=1;if(a&&e.hasMouth){let l=(C-a.x)*b+(H-a.y)*x,p=Math.max(0,Math.min(1,(l+34)/(34+w*.72))),y=p*p*(3-2*p);re*=1+.55*y;let k=Math.max(0,Math.min(1,(l+6)/(w+6)));V=1-k*k*(3-2*k);let W=Math.max(0,Math.min(1,(l+76)/58));_=1-W*W*(3-2*W)}let A=et(C,H*Ge),R=o(A.q,A.r);return{wx:T,wy:Y,halfW:re,mouthFade:V,landFade:_,fogDim:R===0?0:R===1?.65:1}},D=34;{let C=s[0],H=-v[0],J=-M[0],B=L(C.x,C.y,0);if(B.fogDim>0){let T=B.halfW+D,Y=10;for(let ae=0;ae<Y;ae++){let re=-Math.PI*.5+ae/Y*Math.PI,V=-Math.PI*.5+(ae+1)/Y*Math.PI,_=(H*Math.cos(re)+$[0]*Math.sin(re))*T,A=(J*Math.cos(re)+S[0]*Math.sin(re))*T,R=(H*Math.cos(V)+$[0]*Math.sin(V))*T,I=(J*Math.cos(V)+S[0]*Math.sin(V))*T,l=L(C.x+_,C.y+A,0),p=L(C.x+R,C.y+I,0),y=Math.sin(re)>=0?1:-1,k=Math.sin(V)>=0?1:-1;this.pushVertex(B.wx,B.wy,C.x,C.y,0,B.halfW,B.mouthFade,B.landFade,B.fogDim,0,v[0],M[0],g[0]),this.pushVertex(l.wx,l.wy,C.x+_,C.y+A,y*T,B.halfW,l.mouthFade,l.landFade,B.fogDim,-Math.cos(re)*T,v[0],M[0],g[0]),this.pushVertex(p.wx,p.wy,C.x+R,C.y+I,k*T,B.halfW,p.mouthFade,p.landFade,B.fogDim,-Math.cos(V)*T,v[0],M[0],g[0])}}}for(let C=0;C<u-1&&!(this.vertCount+6>Nr);C++){let H=s[C],J=s[C+1],B=L(H.x,H.y,C),T=L(J.x,J.y,C+1);if(B.fogDim===0&&T.fogDim===0)continue;let Y=B.fogDim>0?B.fogDim:T.fogDim,ae=T.fogDim>0?T.fogDim:B.fogDim,re=B.halfW+D*(.28+.72*B.landFade),V=T.halfW+D*(.28+.72*T.landFade),_=H.x-$[C]*re,A=H.y-S[C]*re,R=H.x+$[C]*re,I=H.y+S[C]*re,l=J.x-$[C+1]*V,p=J.y-S[C+1]*V,y=J.x+$[C+1]*V,k=J.y+S[C+1]*V,W=L(_,A,C),O=L(R,I,C),K=L(l,p,C+1),X=L(y,k,C+1);this.pushVertex(W.wx,W.wy,_,A,-re,B.halfW,W.mouthFade,W.landFade,Y,U[C],v[C],M[C],g[C]),this.pushVertex(O.wx,O.wy,R,I,re,B.halfW,O.mouthFade,O.landFade,Y,U[C],v[C],M[C],g[C]),this.pushVertex(X.wx,X.wy,y,k,V,T.halfW,X.mouthFade,X.landFade,ae,U[C+1],v[C+1],M[C+1],g[C+1]),this.pushVertex(W.wx,W.wy,_,A,-re,B.halfW,W.mouthFade,W.landFade,Y,U[C],v[C],M[C],g[C]),this.pushVertex(X.wx,X.wy,y,k,V,T.halfW,X.mouthFade,X.landFade,ae,U[C+1],v[C+1],M[C+1],g[C+1]),this.pushVertex(K.wx,K.wy,l,p,-V,T.halfW,K.mouthFade,K.landFade,ae,U[C+1],v[C+1],M[C+1],g[C+1])}if(!e.hasMouth){let C=s[u-1],H=v[u-1],J=M[u-1],B=L(C.x,C.y,u-1);if(B.fogDim>0){let T=B.halfW+D,Y=10;for(let ae=0;ae<Y;ae++){let re=-Math.PI*.5+ae/Y*Math.PI,V=-Math.PI*.5+(ae+1)/Y*Math.PI,_=(H*Math.cos(re)+$[u-1]*Math.sin(re))*T,A=(J*Math.cos(re)+S[u-1]*Math.sin(re))*T,R=(H*Math.cos(V)+$[u-1]*Math.sin(V))*T,I=(J*Math.cos(V)+S[u-1]*Math.sin(V))*T,l=L(C.x+_,C.y+A,u-1),p=L(C.x+R,C.y+I,u-1),y=Math.sin(re)>=0?1:-1,k=Math.sin(V)>=0?1:-1;this.pushVertex(B.wx,B.wy,C.x,C.y,0,B.halfW,1,1,B.fogDim,U[u-1],H,J,g[u-1]),this.pushVertex(l.wx,l.wy,C.x+_,C.y+A,y*T,B.halfW,1,1,B.fogDim,U[u-1]+Math.cos(re)*T,H,J,g[u-1]),this.pushVertex(p.wx,p.wy,C.x+R,C.y+I,k*T,B.halfW,1,1,B.fogDim,U[u-1]+Math.cos(V)*T,H,J,g[u-1])}}}}render(e){let{cam:r,assets:o,routes:i,manualEdges:n=[],sampleReliefHeight:s,lookupFog:u,lookupHex:c,timeSec:a,windAnimation:d=!0}=e;if(i.length===0&&n.length===0)return 0;this.vertCount=0;let h=r.zoom<.35?1+(.35-r.zoom)*1.4:1;for(let m=0;m<i.length;m++){let b=this.getCachedCourse(i[m],34);b&&this.emitCourse(b,s,u,c,h)}if(n.length>0){let m=Yr(n,34);for(let b=0;b<m.length;b++)this.emitCourse(m[b],s,u,c,h)}if(this.vertCount===0)return 0;let{gl:f}=this;return f.enable(f.BLEND),f.blendEquation(f.FUNC_ADD),f.blendFunc(f.ONE,f.ONE_MINUS_SRC_ALPHA),f.useProgram(this.program),f.bindVertexArray(this.vao),f.bindBuffer(f.ARRAY_BUFFER,this.vbo),f.bufferSubData(f.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*lr)),f.activeTexture(f.TEXTURE0),f.bindTexture(f.TEXTURE_2D_ARRAY,o.terrainArray),f.uniform2f(this.uCamCenter,r.x,r.y),f.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),f.uniform1f(this.uZoom,r.zoom),f.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),f.uniform1f(this.uTime,a),f.uniform1f(this.uWindEnabled,d?1:0),f.uniform1f(this.uPassMode,0),f.drawArrays(f.TRIANGLES,0,this.vertCount),f.uniform1f(this.uPassMode,1),f.drawArrays(f.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Fo=Te.map(([t,e])=>[t+e*.5,je*e/256]),Lo=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),Do=new Set(["moor","marshland","swamp"]);function dr(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function jr(t,e,r){return t.kind==="mountain"?3:tr(t)?0:t.kind==="tree"?r>=66?2:1:rr(t)||xt(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function $r(t){return tr(t)?0:t.kind==="mountain"?.44:rr(t)||xt(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||nr(t)||Ir(t)?.3:.55}var Io=256*256*Math.sqrt(3)/2,Xt=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=kr(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...Et,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...ct,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let i=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==i||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=kr(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=vt(o,i);this.rawCellChunks.delete(n),this.chunks.delete(n);let s=e-o*Me,u=r-i*Me,c=[0],a=[0];s<=2&&c.push(-1),s>=Me-3&&c.push(1),u<=2&&a.push(-1),u>=Me-3&&a.push(1);for(let d of c)for(let h of a)d===0&&h===0||this.chunks.delete(vt(o+d,i+h));this.revision++}setHexFogState(e,r,o){let{cq:i,cr:n}=Wt(e,r,Me),s=vt(i,n),u=e-i*Me,a=(r-n*Me)*Me+u,d=this.chunks.get(s)?.cells[a],h=this.rawCellChunks.get(s)?.[a],f=d??h;return!f||f.fogState===o?!1:(d&&(d.fogState=o),h&&(h.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=vt(o,i),u=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!u)return;let c=e-o*Me,a=r-i*Me;if(!(c<0||c>=Me||a<0||a>=Me))return u[a*Me+c]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let i=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!i||i.layers.length===0)return 0;if(i.layers.length===1)return i.layers[0];let n=cn(this.seedIntValue,r,o,101)%i.layers.length;return i.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let i=ln(e,Me,2),n=0,s=0,u=[];for(let{cq:g,cr:L}of i){let D=vt(g,L),C=this.chunks.get(D);C?(this.chunks.delete(D),this.chunks.set(D,C),u.push(C)):n<r?(C=this.buildChunk(g,L),this.chunks.set(D,C),n++,this.revision++,u.push(C)):s++}for(;this.chunks.size>this.maxCachedChunks;){let g=this.chunks.keys().next().value;if(g===void 0)break;this.chunks.delete(g)}let c=this.maxCachedChunks*2;for(;this.rawCellChunks.size>c;){let g=this.rawCellChunks.keys().next().value;if(g===void 0)break;this.rawCellChunks.delete(g)}let a=e.viewportWidth*.5/e.zoom+420,d=e.viewportHeight*.5/e.zoom+420,h=e.x-a,f=e.x+a,m=e.y-d,b=e.y+d,x=[],w=[],U=[],q=new Set;for(let g of u){for(let L of g.shorelines){if(L.x<h||L.x>f||L.y<m||L.y>b)continue;let D=this.lookupHex(L.q,L.r),C=D?D.fogState:0;C!==0&&(x.push(L),w.push(C))}for(let L of g.riverRoutes)q.has(L.id)||(q.add(L.id),U.push(L))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:x,shoreFogStates:w,riverRoutes:U,chunksLoadedThisFrame:n,hasPendingChunks:s>0};let v=[],M=[];for(let g of u){for(let L of g.sprites)L.x<h||L.x>f||L.y<m||L.y>b||v.push(L);for(let L of g.decals)L.x<h||L.x>f||L.y<m||L.y>b||M.push(L)}v.sort((g,L)=>(g.sortY??g.y)-(L.sortY??L.y)||g.x-L.x);let $=new Array(v.length);for(let g=0;g<v.length;g++){let L=v[g],D=this.lookupHex(L.q,L.r);$[g]=D?D.fogState:0}let S=new Array(M.length);for(let g=0;g<M.length;g++){let L=M[g],D=this.lookupHex(L.q,L.r);S[g]=D?D.fogState:0}return{sprites:v,fogStates:$,decals:M,decalFogStates:S,shorelines:x,shoreFogStates:w,riverRoutes:U,chunksLoadedThisFrame:n,hasPendingChunks:s>0}}getOrFetchRawCells(e,r){let o=vt(e,r),i=this.rawCellChunks.get(o);if(i)return i;let n=e*Me,s=r*Me,u=this.provider({cq:e,cr:r,chunkSize:Me}),c=new Array(Me*Me),a=this.fogOverride;for(let d of u){let h=d.q-n,f=d.r-s;h<0||h>=Me||f<0||f>=Me||(a&&(d.fogState=a(d.q,d.r)),c[f*Me+h]=d)}return this.rawCellChunks.set(o,c),c}lookupRawHex(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=this.getOrFetchRawCells(o,i),s=e-o*Me,u=r-i*Me;return n[u*Me+s]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,i)=>o[0].localeCompare(i[0])),r=[];for(let[o,i]of e){let n=_n(i,this.manifest),s=i.worldWidth*Mt(i),u=.72*s*s/Io,c=0,a=o.replace(/^assets\//,"");for(let f=0;f<a.length;f++)c=Math.imul(c,31)+a.charCodeAt(f)|0;let d=i.kind==="tree"?"tree":i.kind==="shrub"?"shrub":i.kind==="ground_cover"?"ground_cover":"other",h={key:o,entry:i,allowedTypes:n,effectiveWidth:s,crownAreaRatio:u,pathSalt:c,pre:{strict:Bt(i),ecoFamily:qt(i)},pScale:Br(i),chanceMult:yn(i),minSpacing:i.placement?.minSpacing??28,edgeMargin:i.placement?.edgeMargin??12,pKind:d,isCanopy:gn(i),isBoulder:rr(i),isWaterBoulder:xt(i),isWarmBoulder:Dt(i),isGroundDecal:tr(i),isDryPatch:nr(i),isAcacia:qr(i),isAccent:bn(i),isSnowFamily:or(i),isBush20to29:Dr(i),isReed:Ir(i),isHerb:i.family==="herbs",accentGroup:vn(i)};if(i.kind==="mountain")this.mountainCandidates.push(h);else if(h.isWaterBoulder)i.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(h);else if(h.isGroundDecal){if(i.artStatus!=="deprecated"&&(i.placement?.density??.25)>0&&n.size>0)for(let f of n){let m=this.decalCandidatesByTerrain.get(f);m||(m=[],this.decalCandidatesByTerrain.set(f,m)),m.push(h)}}else if(i.artStatus!=="deprecated"&&(i.placement?.density??0)>0&&(i.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(h),h.isReed&&this.reedCandidates.push(h);for(let f of n){let m=this.candidatesByTerrain.get(f);m||(m=[],this.candidatesByTerrain.set(f,m)),m.push(h)}n.has("forest_floor")&&i.family!=="palms"&&r.push(h)}}for(let o of Object.keys(this.manifest.terrain.byType)){let i=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,i);else{let n=new Set(i),s=[...i];for(let u of r)n.has(u)||(n.add(u),s.push(u));this.candidatesByTerrainForest.set(o,s)}}}createPlacedSprite(e,r,o,i,n,s,u){let c=e.entry,a=e.effectiveWidth*s,d=a*c.aspect,h=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],f=n*Ge,m=c.kind==="mountain",b=Math.round(i*3)^Math.round(n*5)|0,w=!m&&!e.isAccent&&!e.accentGroup&&Z(this.seedIntValue,r,o,b+811)<.5,U=i/(256*2.6),q=n/(256*2.6),v=Math.floor(U),M=Math.floor(q),$=U-v,S=q-M,g=$*$*(3-2*$),L=S*S*(3-2*S),D=Z(this.seedIntValue,v,M,913),C=Z(this.seedIntValue,v+1,M,913),H=Z(this.seedIntValue,v,M+1,913),J=Z(this.seedIntValue,v+1,M+1,913),B=D+(C-D)*g+(H+(J-H)*g-(D+(C-D)*g))*L,T=Z(this.seedIntValue,r,o,b+823),Y=B*.6+T*.4,ae=m||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:c.kind==="tree"?.62:c.family==="cacti"?.08:c.kind==="shrub"?.42:c.kind==="ground_cover"?.24:0;return{x:i,y:f-u*Ge,sortY:f,width:a,height:d,anchorX:c.anchor[0],anchorY:c.anchor[1],page:c.page,u0:c.uv[0],v0:c.uv[1],u1:c.uv[2],v1:c.uv[3],q:r,r:o,isMountain:m,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:w,tintHash:Y,swayAmp:ae,shadowTier:jr(c,a,d),selfShadeWeight:$r(c),shadowPage:h?h.page:-1,shadowU0:h?h.uv[0]:0,shadowV0:h?h.uv[1]:0,shadowU1:h?h.uv[2]:0,shadowV1:h?h.uv[3]:0,shadowMinX:h?h.boundsInSpriteWidth[0]:0,shadowMinY:h?h.boundsInSpriteWidth[1]:0,shadowMaxX:h?h.boundsInSpriteWidth[2]:0,shadowMaxY:h?h.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*Me,i=r*Me,n=this.seedIntValue,s=this.getOrFetchRawCells(e,r),u=[],c=[];for(let l=-2;l<Me+2;l++)for(let p=-2;p<Me+2;p++){let y=o+p,k=i+l,W=this.lookupRawHex(y,k);W&&(u.push(W),p>=0&&p<Me&&l>=0&&l<Me&&c.push(W))}let a=Mn(u,this.manifest,n,this.forestConfig);for(let l of c){let p=a.get(Fe(l.q,l.r));p&&(l.forestClass=p.forestClass,l.glade=p.glade,l.gladeX=p.gladeX,l.gladeY=p.gladeY,l.gladeRadius=p.gladeRadius)}let d=[],h=this.manifest.infrastructure.sprites;for(let l of c){if(this.isWaterTerrain(l.terrainId)||Ct.has(l.terrainId))continue;let p=ke(l.q,l.r);for(let y=0;y<6;y++){let[k,W]=Te[y],O=this.lookupRawHex(l.q+k,l.r+W);if(!O||!this.isWaterTerrain(O.terrainId)||O.terrainId==="icy_ocean")continue;let K=`shorelines/shore_v105_edge_0${y+1}`,X=h[K];X&&d.push({x:p.x,y:p.y,q:l.q,r:l.r,side:y,page:X.page,u0:X.uv[0],v0:X.uv[1],u1:X.uv[2],v1:X.uv[3]})}}let f=this.provider.getRiverRoutesForChunk?.(e,r,Me)??[],m=[];for(let l=0;l<f.length;l++){let p=Nt(f[l],34);if(!p||p.points.length<2)continue;let y=1/0,k=-1/0,W=1/0,O=-1/0;for(let K=0;K<p.points.length;K++){let X=p.points[K];X.x<y&&(y=X.x),X.x>k&&(k=X.x),X.y<W&&(W=X.y),X.y>O&&(O=X.y)}m.push({course:p,minX:y-90,maxX:k+90,minY:W-90,maxY:O+90})}let b=(l,p)=>{if(m.length===0)return 1/0;let y=1/0;for(let k=0;k<m.length;k++){let W=m[k];if(l<W.minX||l>W.maxX||p<W.minY||p>W.maxY)continue;let O=W.course.points;for(let K=1;K<O.length;K++){let X=O[K-1],oe=O[K],j=oe.x-X.x,F=oe.y-X.y,ie=j*j+F*F,le=ie>1e-6?((l-X.x)*j+(p-X.y)*F)/ie:0;le<0?le=0:le>1&&(le=1);let Pe=l-(X.x+le*j),xe=p-(X.y+le*F),we=Pe*Pe+xe*xe;we<y&&(y=we)}}return y<1/0?Math.sqrt(y):1/0},x=this.reliefConfig.enabled?this.reliefConfig.strength:0,w=this.reliefConfig.style??"sculpted",U=Fn(u,this.manifest,n,x,w),q=(l,p)=>In(U,l,p),v=[],M=new Set,$=[],S=new Map,g=(l,p,y,k,W,O,K,X)=>{v.push(this.createPlacedSprite(l,p,y,k,W,O,K));let oe={x:k,y:W,pScale:l.pScale,minSpacing:l.minSpacing,visualHalfW:l.effectiveWidth*O*.5,isCanopy:l.isCanopy,isBoulder:l.isBoulder},j=Fe(p,y),F=S.get(j);F||(F=[],S.set(j,F)),F.push(oe),X.push(oe)};if(this.mountainCandidates.length>0){let l=new Set(c.map(p=>Fe(p.q,p.r)));for(let p of u){if(p.reliefClass!=="mountain"||p.occupied)continue;let y=this.mountainCandidates.filter(F=>Cn(F.entry,F.allowedTypes,p.terrainId,this.manifest)),k=y.length>0?y:this.mountainCandidates,W=Math.floor(Z(n,p.q,p.r,2002)*k.length),O=k[W%k.length],K=256*(p.q+p.r*.5),X=je*p.r+20,oe=Math.max(72,(O.entry.mountain?.coreRadius??.32)*O.effectiveWidth);$.push({ux:K,uy:X,coreR2:oe*oe});let j=Fe(p.q,p.r);if(M.add(j),l.has(j)){let F=q(K,X);v.push(this.createPlacedSprite(O,p.q,p.r,K,X,1,F))}}}let L=c.filter(l=>!this.isWaterTerrain(l.terrainId)).length,D=xn(L),C={dead_trees:0,fallen_logs:0},H=(l,p,y,k)=>{let W=l/y,O=p/y,K=Math.floor(W),X=Math.floor(O),oe=W-K,j=O-X,F=oe*oe*(3-2*oe),ie=j*j*(3-2*j),le=Z(n,K,X,k),Pe=Z(n,K+1,X,k),xe=Z(n,K,X+1,k),we=Z(n,K+1,X+1,k),pe=le+(Pe-le)*F,ge=xe+(we-xe)*F;return pe+(ge-pe)*ie},J=(l,p,y,k)=>Z(n,p,y,k+l.pathSalt),B=(l,p,y=null)=>{if(y!==null)return y;if(l.isWaterBoulder)return dr(p)*1.28;if(l.isBoulder)return dr(p);let k=l.entry.scaleRange[0]??.85,W=l.entry.scaleRange[1]??1.15,O=l.entry.kind==="tree"?Math.min(k,.76):l.entry.kind==="shrub"?Math.min(k,.74):k,K=l.entry.kind==="tree"?Math.max(W,1.2):l.entry.kind==="shrub"?Math.max(W,1.22):W;return O+(K-O)*p},T=(l,p)=>{for(let y=0;y<$.length;y++){let k=$[y],W=l-k.ux,O=p-k.uy;if(W*W+O*O<k.coreR2)return!0}return!1},Y=(l,p,y,k,W)=>{if(y.length===0)return!0;let O=256*.5-(W+Math.min(74,k*.72));for(let K=0;K<y.length;K++){let[X,oe]=Fo[y[K]];if(l*X+p*oe>O)return!1}return!0},ae=(l,p,y,k)=>{if(m.length===0||y.isWaterBoulder)return!1;let W=b(l,p);return W===1/0?!1:y.isReed?W<21:W<24+Math.min(38,k*.45)},re=(l,p,y,k,W,O,K,X,oe=null,j,F=[],ie=34)=>{let le=l.entry,Pe=j??l.edgeMargin,xe=Z(n,p.q,p.r,K*47+7),we=B(l,xe,oe),pe=l.effectiveWidth*we*.5,ge=l.pKind,be=l.pScale,ve=l.minSpacing,We=l.isCanopy,Ae=le.kind==="tree";for(let Oe=0;Oe<28;Oe++){let{dx:De,dy:Ie}=Pn(n,p.q,p.r,ge,K,Oe);if(!ir(De,Ie,Pe)||!Y(De,Ie,F,pe,ie)||Ae&&Ur(O,De,Ie))continue;let Le=y+De,Xe=k+Ie;if(T(Le,Xe)||ae(Le,Xe,l,pe))continue;let Be=!1;for(let G=0;G<W.length;G++){let Q=W[G],me=Math.sqrt(be*Q.pScale),E=We&&Q.isCanopy,N=E?X:Math.max(.85,X),te=Math.max(E&&N<.6?10:14,Math.max(ve,Q.minSpacing)*N*me);!E&&(l.isBoulder||Q.isBoulder)&&(te=Math.max(te,(pe+Q.visualHalfW)*.56));let z=Le-Q.x,de=Xe-Q.y;if(z*z+de*de<te*te){Be=!0;break}}if(Be)continue;let P=q(Le,Xe);return g(l,p.q,p.r,Le,Xe,we,P,W),{ux:Le,uy:Xe,scale:we,halfW:pe}}return null},V=(l,p,y,k,W,O,K,X,oe,j,F,ie,le,Pe,xe,we=[],pe=34)=>{let ge=xe??l.edgeMargin,be=Z(n,p.q,p.r,le*53+13),ve=B(l,be,j),We=l.effectiveWidth*ve*.5,Ae=l.pScale,Oe=l.minSpacing,De=l.entry.kind==="tree",Ie=Z(n,p.q,p.r,le*61+19)*Math.PI*2,Le=Math.max(X,K*.68+We*.44),Xe=Math.max(oe,Le+28);for(let Be=0;Be<20;Be++){let P=Z(n,p.q,p.r,le*71+Be*11+3),G=Z(n,p.q,p.r,le*73+Be*13+5),Q=Ie+Be*2.3999632+(G-.5)*.42,me=Le+(Xe-Le)*P,E=W+Math.cos(Q)*me,N=O+Math.sin(Q)*me*.78,te=E-y,z=N-k;if(!ir(te,z,ge)||!Y(te,z,we,We,pe)||De&&Ur(ie,te,z)||T(E,N)||ae(E,N,l,We))continue;let de=!1;for(let ue=0;ue<F.length;ue++){let Se=F[ue],Ve=Math.sqrt(Ae*Se.pScale),Re=Math.max(10,Math.max(Oe,Se.minSpacing)*Pe*Ve);(l.isBoulder||Se.isBoulder)&&(Re=Math.max(Re,(We+Se.visualHalfW)*.56));let ze=E-Se.x,ut=N-Se.y;if(ze*ze+ut*ut<Re*Re){de=!0;break}}if(de)continue;let ce=q(E,N);return g(l,p.q,p.r,E,N,ve,ce,F),{ux:E,uy:N,scale:ve,halfW:We}}return null},_=(l,p)=>{for(let y=-2;y<=2;y++)for(let k=-2;k<=2;k++){if(tt(0,0,k,y)>2)continue;let W=this.lookupRawHex(l+k,p+y);if(W&&W.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let l=this.waterBoulderCandidates;for(let p of c){if(p.occupied||!It.has(p.terrainId)||p.terrainId!=="coastal_water"&&!_(p.q,p.r))continue;let y=.45+1.2*H(p.q,p.r,3.2,4107),k=p.terrainId==="coastal_water"?.27:p.terrainId==="stormy_ocean"?.19:.15,W=Math.min(.48,k*y);if(Z(n,p.q,p.r,4111)>=W)continue;let O=[];for(let xe=0;xe<6;xe++){let[we,pe]=Te[xe],ge=this.lookupRawHex(p.q+we,p.r+pe);ge&&!this.isWaterTerrain(ge.terrainId)&&O.push(xe)}let K=256*(p.q+p.r*.5),X=je*p.r,oe=[];for(let xe=-1;xe<=1;xe++)for(let we=-1;we<=1;we++){let pe=S.get(Fe(p.q+we,p.r+xe));if(pe)for(let ge=0;ge<pe.length;ge++)oe.push(pe[ge])}let j=Math.floor(Z(n,p.q,p.r,4113)*l.length),F=l[j%l.length],ie=1,le=re(F,p,K,X,oe,void 0,ie++,.85,null,20,O,30);if(!le)continue;let Pe=Z(n,p.q,p.r,4117);if(Pe<.48){let xe=Pe<.18?2:1;for(let we=0;we<xe;we++){let pe=Math.floor(Z(n,p.q,p.r,4121+we*7)*l.length),ge=l[pe%l.length],be=Z(n,p.q,p.r,4129+we*11),ve=Math.max(.55,Math.min(2.35,le.scale*(.4+.46*be)));V(ge,p,K,X,le.ux,le.uy,le.halfW,Math.max(24,le.scale*20),Math.max(64,le.scale*38),ve,oe,void 0,ie++,.62,18,O,30)}}}}let A=this.forestConfig.mode,R=this.forestConfig.openTreeChance;for(let l of c){let p=Fe(l.q,l.r);if(l.occupied||M.has(p)||this.isWaterTerrain(l.terrainId))continue;let y=a.get(p);if(An(n,l.q,l.r,y))continue;let k=[],W=[];for(let ee=0;ee<6;ee++){let[se,Ce]=Te[ee],ne=this.lookupRawHex(l.q+se,l.r+Ce);ne&&(k.push(ne.terrainId),this.isWaterTerrain(ne.terrainId)&&W.push(ee))}let O=y?.forestClass??"none",K=O==="dense_forest"||O==="light_forest",X=O==="light_forest"||!K&&(y?.edgeInfluence??0)>.1,oe=!!(l.riverEdges&&l.riverEdges.length>0),j=hn.has(l.terrainId),F=Do.has(l.terrainId),ie=j||l.terrainId==="semi_desert"||l.terrainId==="savanna",le=K?this.candidatesByTerrainForest.get(l.terrainId)??this.allCandidates:this.candidatesByTerrain.get(l.terrainId)??this.allCandidates;if(le.length===0)continue;let Pe={baseBiome:l.terrainId,biome:y?.biome??l.terrainId,forestClass:O,neighborTypes:k,hasRiverEdge:oe},xe=Lt.has(l.terrainId),we=[],pe=[],ge=[],be=[],ve=[],We=[],Ae=[],Oe=!1;for(let ee=0;ee<le.length;ee++){let se=le[ee],Ce=se.entry;Tn(Ce.family,y)&&Sn(Ce,se.allowedTypes,Pe,this.manifest,se.pre)&&(l.terrainId==="tundra"&&Ce.family==="snow_conifers"&&J(se,l.q,l.r,973)>=.02||(Oe=!0,se.isCanopy?xe&&(Ce.family==="palms"||se.isAcacia)?we.push(se):pe.push(se):se.isBoulder?(ge.push(se),se.isWarmBoulder&&be.push(se)):se.isDryPatch?ve.push(se):Ce.family==="snow"?We.push(se):Ae.push(se)))}if(!Oe)continue;pe.sort((ee,se)=>{let Ce=ee.entry.placement,ne=se.entry.placement,fe=J(ee,l.q,l.r,301)/Math.max(.04,(Ce.density??.12)*Math.min(1,Ce.weight??1)),_e=J(se,l.q,l.r,301)/Math.max(.04,(ne.density??.12)*Math.min(1,ne.weight??1));return fe-_e}),Ae.sort((ee,se)=>J(ee,l.q,l.r,302)-J(se,l.q,l.r,302));let De=Ae.filter(ee=>(ee.pKind==="shrub"||ee.pKind==="ground_cover")&&!ee.isAccent&&!ee.accentGroup&&!(j&&(ee.isBush20to29||ee.isHerb))),Ie=Rn(y);Ie>1&&Ut(n,l.q,l.r,"tree")<.58&&Ie--;let Le=En(y),Xe=H(l.q,l.r,4.2,5107),Be=H(l.q,l.r,1.9,5119),P=Math.pow(Xe*.68+Be*.32,1.35),G=K?1:.14+1.76*P,Q=K?Le:Math.max(Le,10),me=A==="canopy"?O==="dense_forest"?.34:O==="light_forest"?.59:.88:A==="dense"?O==="dense_forest"?.52:O==="light_forest"?.73:1:O==="dense_forest"?.72:O==="light_forest"?.92:1,E=256*(l.q+l.r*.5),N=je*l.r,te=[];for(let ee=-1;ee<=1;ee++)for(let se=-1;se<=1;se++){let Ce=S.get(Fe(l.q+se,l.r+ee));if(Ce)for(let ne=0;ne<Ce.length;ne++)te.push(Ce[ne])}let z=0,de=0,ce=0,ue=1,Se=(ee,se)=>{if(K||z>=Q)return;let Ce=Z(n,l.q,l.r,5201+ue*17);if(se.length>0&&Ce<.46){let _e=G>1.08&&Ce<.2?2:1;for(let ye=0;ye<_e&&z<Q;ye++){let Ee=Math.floor(Z(n,l.q,l.r,5211+ye*7)*se.length),he=se[Ee%se.length],Ue=Z(n,l.q,l.r,5221+ye*9),qe=Math.max(.5,Math.min(1.85,ee.scale*(.38+.44*Ue)));V(he,l,E,N,ee.ux,ee.uy,ee.halfW,Math.max(20,ee.halfW*.72),Math.max(52,ee.halfW*1.45),qe,te,y,ue++,.55,void 0,W)&&z++}}let ne=ie&&ve.length>0?j?ve:[...ve,...De]:De,fe=Z(n,l.q,l.r,5237+ue*13);if(ne.length>0&&fe<.62){let _e=1+Math.floor(Z(n,l.q,l.r,5243)*(G>1.05?2:1));for(let ye=0;ye<_e&&z<Q;ye++){let Ee=Math.floor(Z(n,l.q,l.r,5251+ye*11)*ne.length),he=ne[Ee%ne.length],Ue=Z(n,l.q,l.r,5261+ye*7),qe=he.entry.scaleRange[0]??.85,$e=he.entry.scaleRange[1]??1.15,Ye=(qe+($e-qe)*Ue)*.92;V(he,l,E,N,ee.ux,ee.uy,ee.halfW,Math.max(20,ee.halfW*.76),Math.max(54,ee.halfW*1.38+18),Ye,te,y,ue++,.5,void 0,W)&&z++}}},Re=be.length>0&&Z(n,l.q,l.r,1607)<.85?be:ge,ze=Re.reduce((ee,se)=>Math.max(ee,se.entry.placement?.density??0),0),ut=K?1:.72+.48*G,Qe=Math.min(.44,ze*(be.length>0?2.5:1.15)*ut);if(be.length>0&&z<Q&&Z(n,l.q,l.r,1601)<Qe){let ee=Math.floor(Z(n,l.q,l.r,1602)*Re.length);for(let se=0;se<Re.length;se++){let Ce=Re[(ee+se)%Re.length],ne=re(Ce,l,E,N,te,y,ue++,1,null,void 0,W);if(ne){z++,Se(ne,Re);break}}}if(we.length>0&&z<Q&&Z(n,l.q,l.r,1751)<.065*(.75+.45*G)){let ee=we.filter(fe=>fe.entry.family==="palms"),se=we.filter(fe=>fe.isAcacia),Ce=Z(n,l.q,l.r,1752)<.5?[ee,se]:[se,ee],ne=!1;for(let fe of Ce){if(!fe.length||ne)continue;let _e=Math.floor(Z(n,l.q,l.r,1753)*fe.length);for(let ye=0;ye<fe.length;ye++){let Ee=fe[(_e+ye)%fe.length],he=re(Ee,l,E,N,te,y,ue++,1,null,void 0,W);if(he){if(z++,ne=!0,Z(n,l.q,l.r,1759)<.45){let Ue=1+Math.floor(Z(n,l.q,l.r,1763)*2);for(let qe=0;qe<Ue&&z<Q;qe++){let $e=fe[(_e+qe+1)%fe.length];V($e,l,E,N,he.ux,he.uy,he.halfW,22,56,null,te,y,ue++,.54,void 0,W)&&z++}}break}}}}let Je=Math.min(.58,pn(l.terrainId)*(.76+.44*G));if(ve.length>0&&z<Q&&Z(n,l.q,l.r,1831)<Je){let ee=Math.floor(Z(n,l.q,l.r,1832)*ve.length);for(let se=0;se<ve.length;se++){let Ce=ve[(ee+se)%ve.length],ne=re(Ce,l,E,N,te,y,ue++,.9,null,void 0,W);if(ne){z++;let fe=Z(n,l.q,l.r,1837);if(!K&&fe<.52&&z<Q){let _e=fe<.22&&G>.95?2:1;for(let ye=0;ye<_e&&z<Q;ye++){let Ee=ve[(ee+1+ye+Math.floor(fe*11))%ve.length],he=Z(n,l.q,l.r,1843+ye*7),Ue=Ee.entry.scaleRange[0]??.8,qe=Ee.entry.scaleRange[1]??1.15,$e=(Ue+(qe-Ue)*he)*(.76+.3*he);V(Ee,l,E,N,ne.ux,ne.uy,ne.halfW,16,44,$e,te,y,ue++,.48,void 0,W)&&z++}}break}}}let st=A==="canopy"&&K?y?.canopyCoverage??0:0,pt=st?Math.max(Ie,Le-2):Ie;for(let ee=0;ee<pt&&z<Le&&pe.length>0&&!(de>=Ie&&(!st||ce>=st));ee++){let se=pe[ee%Math.min(pe.length,5)],Ce=null;if(X){let fe=Z(n,l.q,l.r,ue*47+7);Ce=B(se,fe,null)*(.76+.16*fe)}let ne=re(se,l,E,N,te,y,ue++,me,Ce,void 0,W);ne&&(de++,z++,ce+=se.crownAreaRatio*ne.scale*ne.scale)}let Rr=Math.min(.68,R*(.62+.62*G));if(!Ie&&!y?.glade&&pe.length>0&&R>0&&J(pe[0],l.q,l.r,311)<Rr&&z<Q){let ee=re(pe[0],l,E,N,te,y,ue++,1,null,void 0,W);if(ee){z++;let se=Z(n,l.q,l.r,5301),Ce=R>.25?.64:.52;if(se<Ce){let ne=1+Math.floor(Z(n,l.q,l.r,5303)*3),fe=Math.min(pe.length,4);for(let _e=0;_e<ne&&z<Q;_e++){let ye=pe[(_e+1)%fe];V(ye,l,E,N,ee.ux,ee.uy,ee.halfW,24,62,null,te,y,ue++,.52,void 0,W)&&z++}if(De.length>0&&z<Q){let _e=Z(n,l.q,l.r,5311)<.55?2:1;for(let ye=0;ye<_e&&z<Q;ye++){let Ee=Math.floor(Z(n,l.q,l.r,5317+ye*7)*De.length),he=De[Ee%De.length];V(he,l,E,N,ee.ux,ee.uy,ee.halfW,18,48,null,te,y,ue++,.48,void 0,W)&&z++}}else if(ge.length>0&&z<Q&&Z(n,l.q,l.r,5323)<.35){let _e=ge[Math.floor(Z(n,l.q,l.r,5329)*ge.length)];V(_e,l,E,N,ee.ux,ee.uy,ee.halfW,20,48,.62+Z(n,l.q,l.r,5333)*.45,te,y,ue++,.52,void 0,W)&&z++}}}}let Er=K?1:.72+.48*G;if(be.length===0&&ge.length>0&&z<Q&&Z(n,l.q,l.r,1601)<Math.min(.36,ze*1.15*Er)){let ee=Math.floor(Z(n,l.q,l.r,1602)*ge.length);for(let se=0;se<ge.length;se++){let Ce=ge[(ee+se)%ge.length],ne=re(Ce,l,E,N,te,y,ue++,1,null,void 0,W);if(ne){z++,Se(ne,ge);break}}}if(We.length>0&&z<Q){let ee=l.terrainId==="snowfields"||l.terrainId==="frozen_tundra"?.58:l.terrainId==="highland"?.25:.14;if(Z(n,l.q,l.r,1643)<ee){let se=Math.floor(Z(n,l.q,l.r,1644)*We.length);for(let Ce=0;Ce<We.length;Ce++){let ne=We[(se+Ce)%We.length];if(re(ne,l,E,N,te,y,ue++,me,null,void 0,W)){z++;break}}}}if(Ae.length>0&&z<Q){let ee=O==="dense_forest"?1.2:X?1.28:.58+.62*G,se=Ut(n,l.q,l.r,"shrub"),Ce=Ut(n,l.q,l.r,"ground_cover"),ne=Ut(n,l.q,l.r,"other"),fe=!1,_e=!1,ye=!1,Ee=Ae.filter(he=>he.isReed);for(let he of Ae){if(z>=Q)break;let Ue=he.entry,qe=he.accentGroup;if(qe&&(fe||C[qe]>=D[qe]))continue;let $e=he.pKind==="shrub"?se:he.pKind==="ground_cover"?Ce:ne,Ye=1;he.isBush20to29?j?Ye=.022:l.terrainId==="savanna"?Ye=.55:l.terrainId==="semi_desert"?Ye=.92:(Lo.has(l.terrainId)||K)&&(Ye=1.32):he.isHerb&&j?Ye=.3:he.isReed&&(F?Ye=1.65:(oe||W.length>0)&&(Ye=1.35));let _t=Math.min(.86,(Ue.placement?.density??.15)*Math.min(1,Ue.placement?.weight??1)*ee*he.chanceMult*Ye*$e);if(J(he,l.q,l.r,312)>=_t)continue;let Ke=re(he,l,E,N,te,y,ue++,me,null,void 0,W);if(Ke){if(z++,qe)C[qe]++,fe=!0;else if(he.isAccent)fe=!0;else if(he.isReed&&!ye&&Ee.length>0&&z<Q){if(Z(n,l.q,l.r,5501+ue*13)<.74){ye=!0;let bt=1+Math.floor(Z(n,l.q,l.r,5507)*3);for(let at=0;at<bt&&z<Q;at++){let Tr=Math.floor(Z(n,l.q,l.r,5519+at*7)*Ee.length),nt=Ee[Tr%Ee.length],Yt=Z(n,l.q,l.r,5527+at*11),St=nt.entry.scaleRange[0]??.85,jt=nt.entry.scaleRange[1]??1.15,$t=(St+(jt-St)*Yt)*(.78+.3*Yt);V(nt,l,E,N,Ke.ux,Ke.uy,Ke.halfW,14,38,$t,te,y,ue++,.42,void 0,W)&&z++}}}else if(!K&&!_e&&he.pKind==="shrub"&&!(j&&he.isBush20to29)&&De.length>0&&z<Q){let yt=Z(n,l.q,l.r,5401+ue*19);if(yt<.5){_e=!0;let bt=De.filter(nt=>nt.entry.family===Ue.family),at=bt.length>0?bt:De,Tr=yt<.22&&G>.9?2:1;for(let nt=0;nt<Tr&&z<Q;nt++){let Yt=Math.floor(Z(n,l.q,l.r,5413+nt*11)*at.length),St=at[Yt%at.length],jt=Z(n,l.q,l.r,5423+nt*7),$t=St.entry.scaleRange[0]??.85,uo=St.entry.scaleRange[1]??1.15,fo=($t+(uo-$t)*jt)*(.72+.3*jt);V(St,l,E,N,Ke.ux,Ke.uy,Ke.halfW,15,40,fo,te,y,ue++,.46,void 0,W)&&z++}if(ge.length>0&&z<Q&&Z(n,l.q,l.r,5437)<.22){let nt=ge[Math.floor(Z(n,l.q,l.r,5441)*ge.length)];V(nt,l,E,N,Ke.ux,Ke.uy,Ke.halfW,18,42,.55+Z(n,l.q,l.r,5443)*.48,te,y,ue++,.52,void 0,W)&&z++}}}}}}if(oe&&!j&&!Ct.has(l.terrainId)&&this.reedCandidates.length>0&&z<Q&&Z(n,l.q,l.r,5601)<.68){let ee=this.reedCandidates,se=Math.floor(Z(n,l.q,l.r,5609)*ee.length),Ce=ee[se%ee.length],ne=re(Ce,l,E,N,te,y,ue++,.7,null,void 0,W);if(ne){z++;let fe=1+Math.floor(Z(n,l.q,l.r,5617)*2);for(let _e=0;_e<fe&&z<Q;_e++){let ye=ee[(se+_e+1)%ee.length];V(ye,l,E,N,ne.ux,ne.uy,ne.halfW,14,36,null,te,y,ue++,.42,void 0,W)&&z++}}}}let I=[];if(this.decalCandidatesByTerrain.size>0)for(let l of c){if(this.isWaterTerrain(l.terrainId)||l.reliefClass==="mountain"||Ct.has(l.terrainId))continue;let p=this.decalCandidatesByTerrain.get(l.terrainId);if(!p||p.length===0)continue;let y=Math.sin(l.q*.31+l.r*.19+n%53)*Math.cos(l.q*.17-l.r*.37+n%29),k=Math.sin(l.q*.67-l.r*.53+n%97)*.45,W=.5+.5*(y*.72+k*.28),O=Z(n,l.q,l.r,7091),X=l.terrainId.includes("desert")||l.terrainId.includes("badlands")||l.terrainId.includes("savanna")||l.terrainId.includes("semi_arid")||l.terrainId.includes("dry")?.14+W*.26:.18+W*.32;if(O>=X)continue;let oe=256*(l.q+l.r*.5),j=je*l.r,ie=Te.some(([ve,We])=>{let Ae=this.lookupRawHex(l.q+ve,l.r+We);return Ae?this.isWaterTerrain(Ae.terrainId):!1})?46:28,le=l.forestDensity??0,Pe=W>.68&&O<X*.42?2:1,xe=this.manifest.terrain.byType[l.terrainId]?.avgColor,we=xe?(Math.max(0,Math.min(255,Math.round(xe[0])))&255)<<16|(Math.max(0,Math.min(255,Math.round(xe[1])))&255)<<8|Math.max(0,Math.min(255,Math.round(xe[2])))&255:0,pe=[];for(let ve=0;ve<p.length;ve++){let We=p[ve],Ae=We.entry.tags??[];Ae.includes("meadow_decal")&&le>.42||Ae.includes("woodland_decal")&&le<.2&&l.terrainId!=="forest_floor"&&l.terrainId!=="swamp"&&l.terrainId!=="marsh"&&l.terrainId!=="marshland"&&l.terrainId!=="moor"&&l.terrainId!=="jungle"||pe.push(We)}if(pe.length===0)continue;let ge=new Set,be=[];for(let ve=0;ve<Pe;ve++){let We=Math.floor(Z(n,l.q,l.r,7109+ve*31)*pe.length),Ae=pe[We%pe.length];if(ge.has(Ae.key))continue;let Oe=Ae.pathSalt+ve*1777,De=(Z(n,l.q,l.r,Oe+7121+ve*7)-.5)*148,Ie=(Z(n,l.q,l.r,Oe+7129+ve*7)-.5)*148,Le=oe+De,Xe=j+Ie;if(!ir(De,Ie,ie)||b(Le,Xe)<54||be.some(ce=>Math.hypot(ce.ux-Le,ce.uy-Xe)<44))continue;let Be=Ae.entry.tags??[],P=Z(n,l.q,l.r,Oe+7151),G=Ae.entry.scaleRange[0]??.56,Q=Ae.entry.scaleRange[1]??1.16,me=G+(Q-G)*P,E=.86+Z(n,l.q,l.r,Oe+7163)*.28,N=Z(n,l.q,l.r,Oe+7177)*Math.PI*2,te=Be.includes("terrain_tint"),z=Be.includes("rock_decal")||Be.includes("woodland_decal")||Be.includes("wetland_decal"),de=this.createPlacedSprite(Ae,l.q,l.r,Le,Xe,me,q(Le,Xe));de.width*=E,de.height/=Math.sqrt(E),de.rotationRad=N,we>0&&(te?(de.terrainTintRgb=we,de.terrainTintMix=.96):z&&(de.terrainTintRgb=we,de.terrainTintMix=.28)),I.push(de),ge.add(Ae.key),be.push({ux:Le,uy:Xe})}}return v.sort((l,p)=>(l.sortY??l.y)-(p.sortY??p.y)||l.x-p.x),{cq:e,cr:r,key:vt(e,r),originQ:o,originR:i,cells:s,sprites:v,decals:I,shorelines:d,riverRoutes:f}}};var Tt=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var Hn=Pr(Zt());var ht=32,qo=32;function Bo(t){return t==="mountain"||t==="hills"?t:"flat"}function Gn(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function On(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Tt},r=Hn.default.createPointSampler(t.seed,e),o=t.halfExtent,i=t.fogPolicy??(()=>2),n=t.overrides,s=new Map,u=(a,d)=>{let h=`${a},${d}`,f=s.get(h);if(f)return s.delete(h),s.set(h,f),f;let m=a*ht,b=d*ht,x=r.traceRivers(m,b,ht,ht),w=[],U=new Set;for(let v=0;v<x.routes.length;v++){let M=x.routes[v];if(!M||M.length<2)continue;let $=M[0],S=M[M.length-1],g=`${$[0]},${$[1]}->${S[0]},${S[1]}:${M.length}`;U.has(g)||(U.add(g),w.push({id:g,hexes:M}))}let q={routes:w,edgesByKey:x.edgesByKey};for(s.set(h,q);s.size>qo;){let v=s.keys().next().value;if(v===void 0)break;s.delete(v)}return q},c=({cq:a,cr:d,chunkSize:h})=>{let f=a*h,m=d*h,b=[];for(let x=0;x<h;x++){let w=m+x;if(o!==void 0&&Math.abs(w)>o)continue;let U=Math.floor(w/ht);for(let q=0;q<h;q++){let v=f+q;if(o!==void 0&&Math.abs(v)>o)continue;let M=Math.floor(v/ht),$=u(M,U),S=r.sampleCell(v,w),g=Fe(v,w),L=i(v,w),D=n?.get(g),C=D?.reliefClass??Bo(S.reliefClass),H=D?.forestDensity!==void 0?D.forestDensity:S.forestDensity>0?S.forestDensity:0,J=D?.forestClass??(D?.forestDensity!==void 0?Gn(void 0,H):Gn(S.forestClass,H)),B=$.edgesByKey.get(g);b.push({q:v,r:w,terrainId:D?.terrainId??S.terrainId,reliefClass:C,hillProfile:D?.hillProfile!==void 0?D.hillProfile:C==="hills"?S.hillProfile??"rounded":null,hillStrength:D?.hillStrength!==void 0?D.hillStrength:C==="hills"?Math.max(.35,S.hillStrength||.72):0,forestClass:J,forestDensity:H,fogState:D?.fogState??L,occupied:D?.occupied,riverEdges:D?.riverEdges!==void 0?D.riverEdges:B&&B.length>0?[...B]:void 0})}}return b};return c.getRiverRoutesForChunk=(a,d,h)=>{let f=a*h,m=f+h-1,b=d*h,x=b+h-1,w=Math.floor(f/ht),U=Math.floor(m/ht),q=Math.floor(b/ht),v=Math.floor(x/ht),M=[],$=new Set;for(let S=q;S<=v;S++)for(let g=w;g<=U;g++){let L=u(g,S);for(let D of L.routes){if($.has(D.id))continue;let C=!1;for(let H=0;H<D.hexes.length;H++){let[J,B]=D.hexes[H];if(J>=f&&J<=m&&B>=b&&B<=x){C=!0;break}}C&&($.add(D.id),M.push(D))}}return M},c}var Vn=Pr(Zt());var He=[.24,.62,.96],fr=[.92,.28,.3],Uo=[.22,.78,.48],Nn=[.94,.72,.22],Go=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function hr(t){return t.surfaceClass!=="land"}function wt(t){return!hr(t)&&t.reliefClass!=="mountain"}function Vt(t,e,r,o){let i=t.sampleCell(e,r);if(o==="harbor"){if(!hr(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let u=[];for(let[c,a]of Te){let d=t.sampleCell(e+c,r+a);wt(d)&&u.push({q:e+c,r:r+a})}return{center:{q:e,r},buildingKind:o,valid:u.length>0,yieldPercent:100,bonusHexes:u,reason:u.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!wt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:i.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],s=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let u=-2;u<=2;u++)for(let c=-2;c<=2;c++){if(tt(0,0,c,u)>2)continue;let a=e+c,d=r+u,h=t.sampleCell(a,d);o==="farm"?wt(h)&&Go.has(h.terrainId)&&(n.push({q:a,r:d}),s+=5):o==="lumber_camp"?wt(h)&&h.forestDensity>.08&&(n.push({q:a,r:d}),s+=5):o==="quarry"&&(h.reliefClass==="hills"||h.reliefClass==="mountain")&&(n.push({q:a,r:d}),s+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,s),bonusHexes:n}}function it(t,e,r,o){for(let i=0;i<=32;i++)for(let n=-i;n<=i;n++)for(let s=-i;s<=i;s++){if(tt(0,0,s,n)!==i)continue;let u=e+s,c=r+n,a=t.sampleCell(u,c);if(wt(a)&&(!o||o(a)))return{q:u,r:c}}return{q:e,r}}function Ho(t,e,r){for(let o=0;o<=45;o++)for(let i=-o;i<=o;i++)for(let n=-o;n<=o;n++){if(tt(0,0,n,i)!==o)continue;let s=e+n,u=r+i,c=t.sampleCell(s,u);if(hr(c))for(let[a,d]of Te){let h=t.sampleCell(s+a,u+d);if(wt(h))return{water:{q:s,r:u},land:{q:s+a,r:u+d}}}}return{water:{q:e,r},land:{q:e+1,r}}}function gt(t,e,r,o,i,n,s,u=!1){let c=[];for(let a=-i;a<=i;a++)for(let d=-i;d<=i;d++){if(tt(0,0,d,a)>i)continue;let h=o.q+d,f=o.r+a,m=Fe(h,f);if(r.has(m))continue;let b=t.sampleCell(h,f);!u&&!wt(b)||b.reliefClass!=="mountain"&&(r.add(m),e.push({q:h,r:f,ownerId:n,color:s}),c.push({q:h,r:f}))}return c}function Pt(t,e,r){let o=[],i=t.q,n=t.r,s=0;for(;(i!==e.q||n!==e.r)&&s++<40;){let u=0,c=1/0;for(let h=0;h<6;h++){let f=i+Te[h][0],m=n+Te[h][1],b=tt(f,m,e.q,e.r);b<c&&(c=b,u=h)}let a=i+Te[u][0],d=n+Te[u][1];o.push({q1:i,r1:n,q2:a,r2:d,tier:r}),i=a,n=d}return o}function Kr(t,e,r=0,o="player"){let i=new Set(t.map(c=>Fe(c.q,c.r))),n=new Set,s=[],u=0;for(let c of t)for(let a=0;a<6;a++){let d=c.q+Te[a][0],h=c.r+Te[a][1];if(i.has(Fe(d,h)))continue;let f=Ft(c.q,c.r,d,h);n.has(f.key)||(n.add(f.key),u++,s.push({q1:f.q1,r1:f.r1,q2:f.q2,r2:f.r2,kind:e,isGate:r>0&&u%r===0,ownerId:o}))}return s}function Xn(t,e,r){let o=[],i=t,n=e,s=0;for(let u=0;u<r;u++)if(o.push({q:i,r:n,dir:s}),u%2===0)s=(s+1)%6;else{let c=(s+1)%6;i+=Te[c][0],n+=Te[c][1],s=(s+5)%6}return o}function zn(t,e="vedras-welt-01",r){let o=r===void 0?Tt:r===null?void 0:r,i=Vn.default.createPointSampler(e,o);if(t==="fresh-start"){let S=it(i,0,0),g=[];return gt(i,g,new Set,S,1,"player",He),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:S,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:S.q,r:S.r,visR:3,expR:5}],scene:{territory:g,buildings:[{id:"cap-1",q:S.q,r:S.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:He}],units:[{id:"scout-1",q:S.q+1,r:S.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:He,marchPath:[{q:S.q+1,r:S.r},{q:S.q+2,r:S.r},{q:S.q+3,r:S.r-1}]}],sites:[{id:"site-1",q:S.q-2,r:S.r+1,family:"fauna",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let S=it(i,108,-70),g=it(i,S.q+7,S.r-1),L=[],D=new Set,C=gt(i,L,D,S,3,"player",He);gt(i,L,D,g,3,"enemy",fr);let H=it(i,S.q+2,S.r),J=Kr(C.filter(re=>tt(re.q,re.r,S.q,S.r)<=1),"stone",3,"player");J.length>0&&(J[0].breached=!0);let B=[...Pt(S,H,"stone"),...Pt(H,g,"packed")],T={q:H.q+2,r:H.r},Y=[{id:"blue-cap",q:S.q,r:S.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:He},{id:"blue-fort",q:H.q,r:H.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:He,rangeRadius:2},{id:"red-cap",q:g.q,r:g.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:fr}],ae=[{id:"u-blue-def",q:H.q,r:H.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:He,marchPath:[{q:S.q+1,r:S.r+1},{q:H.q,r:H.r+1}]},{id:"u-red-siege",q:T.q,r:T.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:fr,inCombat:!0,marchPath:[T,{q:H.q+1,r:H.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((S.q+g.q)/2),r:Math.round((S.r+g.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:S.q,r:S.r,visR:6,expR:12},{q:H.q,r:H.r,visR:5,expR:10}],scene:{territory:L,rivers:Xn(S.q-2,S.r-3,7),roads:B,walls:J,buildings:Y,units:ae}}}if(t==="coastal-harbors"){let S=Ho(i,2,-2),g=[],L=new Set;gt(i,g,L,S.land,2,"player",He,!1),gt(i,g,L,S.water,2,"player",He,!0);let D={q:S.water.q+1,r:S.water.r};for(let[J,B]of Te){let T=i.sampleCell(S.water.q+J,S.water.r+B);if(hr(T)){D={q:S.water.q+J,r:S.water.r+B};break}}let C=[{id:"coastal-cap",q:S.land.q,r:S.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:He},{id:"harbor-1",q:S.water.q,r:S.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:He}],H=[{id:"boat-1",q:D.q,r:D.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:He,marchPath:[S.water,D]},{id:"scout-sea",q:S.water.q,r:S.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:He}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:S.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:S.water.q,r:S.water.r,visR:6,expR:11}],scene:{territory:g,roads:Pt(S.land,{q:S.land.q-2,r:S.land.r+1},"packed"),buildings:C,units:H}}}if(t==="strategic-empires"){let S=[{id:"player",name:"Krone Vedra",color:He,q:0,r:0},{id:"crimson",name:"Blutmark",color:fr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:Uo,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:Nn,q:8,r:10}],g=[],L=new Set,D=[],C=[];for(let H of S){let J=it(i,H.q,H.r);gt(i,g,L,J,5,H.id,H.color),D.push({id:`emp-${H.id}`,q:J.q,r:J.r,kind:"capital",label:H.name,level:12,ownerId:H.id,factionColor:H.color}),C.push({id:`army-${H.id}`,q:J.q+2,r:J.r-1,kind:"army",label:`Heer ${H.name}`,strength:520,ownerId:H.id,factionColor:H.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:S.map(H=>({q:H.q,r:H.r,visR:9,expR:15})),scene:{territory:g,buildings:D,units:C}}}let n=it(i,110,-70),s=it(i,n.q+4,n.r-1),u=it(i,n.q-3,n.r+3),c=[],a=new Set,d=gt(i,c,a,n,2,"player",He);gt(i,c,a,s,2,"player",He),gt(i,c,a,u,2,"player",He);let h=it(i,n.q+1,n.r),f=it(i,n.q-1,n.r,S=>S.forestDensity>.1),m=it(i,n.q,n.r+2),b=it(i,s.q+1,s.r),x=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:He},{id:"town-2",q:s.q,r:s.r,kind:"settlement",label:"Ostfurt",level:6,ownerId:"player",factionColor:He},{id:"town-3",q:u.q,r:u.r,kind:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:He,constructionProgress:.62},{id:"farm-1",q:h.q,r:h.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:He,yieldPercent:Vt(i,h.q,h.r,"farm").yieldPercent},{id:"lumber-1",q:f.q,r:f.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:He,yieldPercent:Vt(i,f.q,f.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:m.q,r:m.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:He,yieldPercent:Vt(i,m.q,m.r,"quarry").yieldPercent},{id:"fort-1",q:b.q,r:b.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:He,rangeRadius:2}],w=d.filter(S=>tt(S.q,S.r,n.q,n.r)===0),U=Kr(w,"stone",2,"player"),q=Kr([u],"palisade",3,"player"),v=[...Pt(n,s,"stone"),...Pt(n,u,"packed"),...Pt(n,m,"trail")],M=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:Nn,marchPath:[n,{q:n.q+2,r:n.r-1},s]},{id:"army-1",q:s.q,r:s.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:He}],$=[{id:"site-mine",q:n.q+2,r:n.r+2,family:"forgotten_mine",label:"Vergessene Mine"},{id:"site-obelisk",q:n.q-2,r:n.r-1,family:"obelisk",label:"Alter Obelisk"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:s.q,r:s.r,visR:4,expR:8},{q:u.q,r:u.r,visR:4,expR:8}],scene:{territory:c,rivers:Xn(n.q-2,n.r-2,8),roads:v,walls:[...U,...q],buildings:x,units:M,sites:$}}}var Yn=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function jn(t,e,r,o,i){if(o==="all-visible"||i?.has(Fe(e,r)))return 2;let n=0;for(let s of t.visibleCenters){let u=tt(s.q,s.r,e,r);if(u<=s.visR)return 2;u<=s.expR&&n<1&&(n=1)}return n}function Oo(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function mr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function Zr(t,e,r,o,i){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&i>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,i)),n}async function Qr(t,e,r="auto",o){let i=e.replace(/\/+$/,""),n=await fetch(`${i}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${i}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let s=await n.json();if(s.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${s.schema}`);let u=Oo(t,r),c=u==="mobile"?Math.min(256,s.terrain.textureSize):s.terrain.textureSize,a=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),d=a?t.getParameter(a.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,h=s.terrain.layers.length+s.nature.pages.length+s.shadows.pages.length+s.infrastructure.pages.length+(s.clouds.files.length>0?1:0),f=0,m=Y=>{f+=1,o?.(f,h,Y)},b=t.createTexture();if(!b)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,b);let x=Math.max(1,s.terrain.layers.length),w=Math.floor(Math.log2(c))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,w,t.RGBA8,c,c,x),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let U=c!==s.terrain.textureSize?{width:c,height:c}:void 0,q=s.terrain.layers;for(let Y=0;Y<q.length;Y+=8){let ae=q.slice(Y,Y+8),re=await Promise.all(ae.map(V=>mr(`${i}/${V.file}`,U)));t.bindTexture(t.TEXTURE_2D_ARRAY,b);for(let V=0;V<ae.length;V++){let _=re[V];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,ae[V].layer,c,c,1,t.RGBA,t.UNSIGNED_BYTE,_),_.close(),m(`Terrain ${ae[V].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,b),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),a&&d>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,a.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,d));let v=u==="mobile"?.5:1,M=async(Y,ae)=>(await Promise.all(Y.map(V=>mr(`${i}/${V.file}`,v<1?{width:Math.max(256,Math.round(V.width*v)),height:Math.max(256,Math.round(V.height*v))}:void 0)))).map((V,_)=>{let A=Zr(t,V,t.CLAMP_TO_EDGE,a,d);return V.close(),m(`${ae} ${_+1}/${Y.length}`),A}),[$,S,g]=await Promise.all([M(s.nature.pages,"Natur-Atlas"),M(s.shadows.pages,"Schatten-Atlas"),M(s.infrastructure.pages,"Infra-Atlas")]),L=null,D=null;if(s.clouds.files.length>0){let Y=s.clouds.files.find(_=>_.id.startsWith("cloud_base"))??s.clouds.files[0],ae=s.clouds.files.find(_=>_.id.startsWith("cloud_edge")),[re,V]=await Promise.all([mr(`${i}/${Y.file}`),ae?mr(`${i}/${ae.file}`):Promise.resolve(null)]);L=Zr(t,re,t.REPEAT,a,d),re.close(),V&&(D=Zr(t,V,t.REPEAT,a,d),V.close()),m("Nebel-Wolken")}let H=s.terrain.byType.forest_floor?.layers?.[0]??0,B=(s.terrain.byType.coastal_water??s.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:s,vramTier:u,terrainArray:b,terrainLayerSize:c,forestFloorLayer:H,coastalWaterLayer:B,naturePages:$,shadowPages:S,infraPages:g,cloudTexture:L,cloudEdgeTexture:D,dispose:()=>{t.deleteTexture(b);for(let Y of $)t.deleteTexture(Y);for(let Y of S)t.deleteTexture(Y);for(let Y of g)t.deleteTexture(Y);L&&t.deleteTexture(L),D&&t.deleteTexture(D)}}}var No=316/384;function $n(t,e){return{x:256*(t+e*.5),y:je*e}}function Xo(t,e,r,o){let i=e.x-t.x,n=e.y-t.y,s=o.x-r.x,u=o.y-r.y,c=i*u-n*s;if(Math.abs(c)<1e-9)return null;let a=r.x-t.x,d=r.y-t.y,h=(a*u-d*s)/c,f=(a*n-d*i)/c;return h<0||h>1||f<0||f>1?null:{x:t.x+h*i,y:t.y+h*n}}function Kn(t){let{roads:e,routes:r=[],manualRivers:o=[],lookupFog:i}=t;if(e.length===0||r.length===0&&o.length===0)return[];let n=[];for(let u of r){let c=Nt(u,34);c&&c.points.length>=2&&n.push(c)}if(o.length>0){let u=Yr(o,34);for(let c of u)c.points.length>=2&&n.push(c)}if(n.length===0)return[];let s=[];for(let u of e){let c=ot(u.q1,u.r1,u.q2,u.r2);if(c<0)continue;let a=i(u.q1,u.r1),d=i(u.q2,u.r2),h=a>=d?a:d;if(h===0)continue;let f=$n(u.q1,u.r1),m=$n(u.q2,u.r2),b=m.x-f.x,x=m.y-f.y,w=Math.hypot(b,x)||1,U=[];for(let v of n){let M=v.points,$=Math.max(18,v.width*.72);for(let S=1;S<M.length;S++){let g=M[S-1],L=M[S],D=Xo(f,m,g,L);if(!D)continue;let C=L.x-g.x,H=L.y-g.y;Math.abs(b*H-x*C)/(w*(Math.hypot(C,H)||1))<=.16||U.some(B=>Math.hypot(B.x-D.x,B.y-D.y)<$)||s.some(B=>Math.hypot(B.ux-D.x,B.uy-D.y)<$)||U.push({x:D.x,y:D.y,width:v.width})}}let q=u.tier==="stone"?"stone":"timber";for(let v of U)s.push({ux:v.x,uy:v.y,dir:c,material:q,tier:u.tier,length:Math.max(96,v.width+64),fogState:h})}return s}function Zn(t){let{manifest:e,crossings:r,sampleReliefHeight:o}=t;if(r.length===0)return[];let i=e.infrastructure.sprites,n=[];for(let s of r){let u=String(s.dir).padStart(2,"0"),c=`bridges/${s.material}/bridge_dir_${u}`,a=`bridges/${s.material==="stone"?"timber":"stone"}/bridge_dir_${u}`,d=i[c]??i[a];if(!d)continue;let h=s.length/No,f=s.uy*Ge,m=o?o(s.ux,s.uy)*Ge:0,b=f-m,x=e.shadows.sprites[`bridge_shadow:axis${s.dir%3}`],w=100,U=x?{shadowPage:x.page,shadowU0:x.uv[0],shadowV0:x.uv[1],shadowU1:x.uv[2],shadowV1:x.uv[3],shadowRelLeft:x.boundsInSpriteWidth[0]*w,shadowRelTop:x.boundsInSpriteWidth[1]*w,shadowWidth:(x.boundsInSpriteWidth[2]-x.boundsInSpriteWidth[0])*w,shadowHeight:(x.boundsInSpriteWidth[3]-x.boundsInSpriteWidth[1])*w}:{};n.push({x:s.ux,y:b,relLeft:-h*.5,relTop:-h*.5,width:h,height:h,page:d.page,u0:d.uv[0],v0:d.uv[1],u1:d.uv[2],v1:d.uv[3],sortY:f-26,fogState:s.fogState,...U})}return n}var pr=.08,gr=2,Qn=.15,Jr=.21;function en(t){return t>=Jr?0:t<=Qn?1:(Jr-t)/(Jr-Qn)}function Jn(t){return en(t)>=.5?"strategic":"detail"}function br(t,e,r){return t<e?e:t>r?r:t}var vr=class{constructor(e,r,o,i){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],i=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,s=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,s,this.pinchStartZoom*(i/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,i=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,i),this.state.x-=o/this.state.zoom,this.state.y-=i/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=At(r.x,r.y,this.state),i=et(o.x,o.y),n=`${i.q},${i.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(i))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,i=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,s]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=s,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=At(i.x,i.y,this.state),s=et(n.x,n.y);this.callbacks.onHexClick?.(s),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:s})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=i;let n=ke(r.q,r.r),s=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:br(o,pr,gr),viewportWidth:Math.max(1,s.width||e.clientWidth||1280),viewportHeight:Math.max(1,s.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),i=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*i)),s=Math.max(1,Math.round(o*i)),u=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==i||this.canvas.width!==n||this.canvas.height!==s;return u&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=i,this.canvas.width=n,this.canvas.height=s),u}centerOnHex(e,r,o){let i=ke(e,r);this.state.x=i.x,this.state.y=i.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=br(o,pr,gr)),this.callbacks.onChange()}setZoom(e){this.state.zoom=br(e,pr,gr),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let i=br(o,pr,gr);if(Math.abs(i-this.state.zoom)<1e-5)return;let n=At(e,r,this.state);this.state.zoom=i;let s=At(e,r,this.state);this.state.x+=n.x-s.x,this.state.y+=n.y-s.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var eo={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function yr(t,e,r){return t<e?e:t>r?r:t}function Vo(t,e,r,o,i,n){let s=i-r,u=n-o,c=s*s+u*u,a=c>1e-6?yr(((t-r)*s+(e-o)*u)/c,0,1):0,d=r+a*s,h=o+a*u,f=t-d,m=e-h;return f*f+m*m}function tn(t){if(!t)return eo;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let i of t.buildings){e.add(Fe(i.q,i.r));let n=ke(i.q,i.r),s=i.kind==="capital"||i.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-64,maxX:n.x+s+64,minY:n.y-s-64,maxY:n.y+s+64})}if(t.sites&&t.sites.length>0)for(let i of t.sites){let n=ke(i.q,i.r),s=58;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-56,maxX:n.x+s+56,minY:n.y-s-56,maxY:n.y+s+56})}if(t.walls&&t.walls.length>0)for(let i of t.walls){let n=ot(i.q1,i.r1,i.q2,i.r2);if(n<0)continue;let{a:s,b:u}=lt(i.q1,i.r1,n),c=i.isGate?i.kind==="stone"?24:20:i.kind==="stone"?18:14,a=i.kind==="stone"?26:16,d=a+64;r.push({ax:s.x,ay:s.y,bx:u.x,by:u.y,halfWidth:c,pierRadius:a,minX:Math.min(s.x,u.x)-d,maxX:Math.max(s.x,u.x)+d,minY:Math.min(s.y,u.y)-d,maxY:Math.max(s.y,u.y)+d,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let i of t.roads){let n=ke(i.q1,i.r1),s=ke(i.q2,i.r2),u=i.tier==="stone"?30:i.tier==="packed"?24:18,c=u+56;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:u,minX:Math.min(n.x,s.x)-c,maxX:Math.max(n.x,s.x)+c,minY:Math.min(n.y,s.y)-c,maxY:Math.max(n.y,s.y)+c,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let i of t.rivers){let{a:n,b:s}=lt(i.q,i.r,i.dir),u=22,c=u+48;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:20,minX:Math.min(n.x,s.x)-c,maxX:Math.max(n.x,s.x)+c,minY:Math.min(n.y,s.y)-c,maxY:Math.max(n.y,s.y)+c,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?eo:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function rn(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(Fe(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,i=yr(t.width*.42,12,48),n=yr(t.width*.34,10,34),s=yr(t.width*.28,8,26),u=e.discs;for(let a=0;a<u.length;a++){let d=u[a];if(r<d.minX||r>d.maxX||o<d.minY||o>d.maxY)continue;let h=r-d.cx,f=o-d.cy,m=d.radius+n*.6;if(h*h+f*f<=m*m)return!0}let c=e.segments;for(let a=0;a<c.length;a++){let d=c[a];if(r<d.minX||r>d.maxX||o<d.minY||o>d.maxY)continue;let h=d.kind==="wall"?i:d.kind==="road"?n:s,f=d.halfWidth+h+(d.kind==="wall"?8:4);if(Vo(r,o,d.ax,d.ay,d.bx,d.by)<=f*f)return!0;if(d.kind==="wall"){let m=d.pierRadius+i+6,b=m*m,x=r-d.ax,w=o-d.ay;if(x*x+w*w<=b)return!0;let U=r-d.bx,q=o-d.by;if(U*U+q*q<=b)return!0}}return!1}function zo(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function xr(t,e,r,o,i,n,s=.86){t.font=`600 ${n}px system-ui, -apple-system, sans-serif`;let u=t.measureText(o),c=Math.max(6,n*.55),a=Math.max(3,n*.3),d=u.width+c*2,h=n+a*2,f=e-d*.5,m=r-h*.5,b=Math.min(8,h*.45);t.beginPath(),t.roundRect(f,m,d,h,b),t.fillStyle=`rgba(12, 17, 23, ${s})`,t.fill(),t.lineWidth=1.4,t.strokeStyle=zo(i,.9),t.stroke(),t.fillStyle="#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5)}function to(t){let{canvas:e,cam:r,scene:o,lookupFog:i,strategicBlend:n,timeSec:s}=t,u=Math.max(1,Math.round(r.viewportWidth*r.dpr)),c=Math.max(1,Math.round(r.viewportHeight*r.dpr));(e.width!==u||e.height!==c)&&(e.width=u,e.height=c);let a=e.getContext("2d");if(!a||(a.setTransform(r.dpr,0,0,r.dpr,0,0),a.clearRect(0,0,r.viewportWidth,r.viewportHeight),!o))return;let d=n>=.5;if(o.buildings)for(let h of o.buildings){let f=i(h.q,h.r);if(f===0)continue;let m=h.kind==="capital"||h.kind==="settlement",b=m||h.kind==="fortress"||h.kind==="harbor";if(d&&!b)continue;let x=ke(h.q,h.r),w=kt(x.x,x.y,r);if(w.x<-120||w.x>r.viewportWidth+120||w.y<-80||w.y>r.viewportHeight+80)continue;let U=typeof h.yieldPercent=="number"&&!d?` \xB7 ${h.yieldPercent}%`:"",q=m?`\u2605 ${h.label} (R${h.level})`:`${h.label} L${h.level}${U}`,v=d?-18:-Math.max(40,74*r.zoom);if(xr(a,w.x,w.y+v,q,h.factionColor,m?d?12:12.5:10.5,f===1?.65:.88),typeof h.constructionProgress=="number"&&h.constructionProgress>0&&h.constructionProgress<1&&!d){let S=w.x-27,g=w.y+v+13;a.fillStyle="rgba(10, 15, 22, 0.85)",a.fillRect(S,g,54,5),a.fillStyle="#f59e0b",a.fillRect(S+1,g+1,52*h.constructionProgress,3)}}if(o.sites&&!d&&r.zoom>=.45)for(let h of o.sites){if(i(h.q,h.r)===0)continue;let f=ke(h.q,h.r),m=kt(f.x,f.y,r);m.x<-80||m.x>r.viewportWidth+80||m.y<-50||m.y>r.viewportHeight+50||xr(a,m.x,m.y+20,h.label,[.85,.68,.35],10,.78)}if(o.units)for(let h of o.units){if(i(h.q,h.r)<2)continue;let f=ke(h.q,h.r);if(h.marchPath&&h.marchPath.length>=2){let w=ke(h.marchPath[0].q,h.marchPath[0].r),U=ke(h.marchPath[1].q,h.marchPath[1].r),q=s*.14%1;f={x:w.x+(U.x-w.x)*q,y:w.y+(U.y-w.y)*q}}let m=kt(f.x,f.y,r);if(m.x<-100||m.x>r.viewportWidth+100||m.y<-60||m.y>r.viewportHeight+60)continue;let b=h.kind==="siege_army"?"\u2694":h.kind==="army"?"\u{1F6E1}":h.kind==="scout"?"\u{1F441}":h.kind==="boat"?"\u26F5":"\u2696",x=typeof h.strength=="number"?` ${h.strength}${h.rams?` + ${h.rams}R`:""}`:"";xr(a,m.x,m.y-Math.max(20,34*r.zoom),`${b} ${h.label}${x}`,h.factionColor,d?10.5:11,.92)}if(o.buildPreview){let h=o.buildPreview,f=ke(h.center.q,h.center.r),m=kt(f.x,f.y,r),b=h.yieldPercent-100,x=h.valid?`${h.buildingKind} \xB7 Ertrag ${h.yieldPercent}% (+${b}% R2)`:`Nicht baubar: ${h.reason??"ung\xFCltig"}`;xr(a,m.x,m.y-34,x,h.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var ro=`#version 300 es
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
`,Yo=`#version 300 es
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
      // Full terrain-adaptive arid crack fissures: dark shaded cracks + warm sunlit edges in exact soil tone!
      float tLum = dot(col, vec3(0.299, 0.587, 0.114));
      float shadeFactor = mix(0.46, 1.18, clamp((tLum - 0.14) / 0.72, 0.0, 1.0));
      col = mix(col, clamp(terrCol * shadeFactor, 0.0, 1.0), mixAmt);
      // Softly integrate fissures into desert sand so they read like etched terrain rather than stickers
      a *= 0.84;
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
`,jo=`#version 300 es
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
`,no=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,$o=`#version 300 es
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
`,Ko=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function zt(t,e,r,o){let i=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!i||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(i)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let s=t.createProgram();if(!s)throw new Error(`Failed to create ${o} program`);if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(s)}`);return s}var Zo=`#version 300 es
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
`,Qo=`#version 300 es
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
`,wr=class{constructor(e){this.instanceData=new Float32Array(16384*16);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=zt(e,ro,Yo,"sprite"),this.shadowMaskProg=zt(e,ro,jo,"shadow-mask"),this.compositeProg=zt(e,no,$o,"shadow-composite"),this.shoreCompositeProg=zt(e,no,Ko,"shore-composite"),this.surfProg=zt(e,Zo,Qo,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),i=e.createBuffer();if(!r||!o||!i)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=64;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let s=(u,c)=>{let a=e.getUniformLocation(u,c);if(!a)throw new Error(`Missing uniform ${c}`);return a};this.spCam=s(this.spriteProg,"u_camCenter"),this.spView=s(this.spriteProg,"u_viewportSize"),this.spZoom=s(this.spriteProg,"u_zoom"),this.spScaleY=s(this.spriteProg,"u_scaleY"),this.spShearX=s(this.spriteProg,"u_shearX"),this.spTime=s(this.spriteProg,"u_time"),this.spWindEnabled=s(this.spriteProg,"u_windEnabled"),this.spCanvasSize=s(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=s(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=s(this.spriteProg,"u_selfShadow"),this.spNaturePolish=s(this.spriteProg,"u_naturePolish"),this.spSpriteSat=s(this.spriteProg,"u_spriteSat"),this.spSpriteBright=s(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=s(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=s(this.spriteProg,"u_colorGradeAll"),this.spDecalPass=s(this.spriteProg,"u_decalPass"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=s(this.shadowMaskProg,"u_camCenter"),this.shView=s(this.shadowMaskProg,"u_viewportSize"),this.shZoom=s(this.shadowMaskProg,"u_zoom"),this.shScaleY=s(this.shadowMaskProg,"u_scaleY"),this.shShearX=s(this.shadowMaskProg,"u_shearX"),this.shTime=s(this.shadowMaskProg,"u_time"),this.shWindEnabled=s(this.shadowMaskProg,"u_windEnabled"),this.shDecalPass=s(this.shadowMaskProg,"u_decalPass"),this.sfCam=s(this.surfProg,"u_camCenter"),this.sfView=s(this.surfProg,"u_viewportSize"),this.sfZoom=s(this.surfProg,"u_zoom"),this.sfTime=s(this.surfProg,"u_time"),this.sfWindEnabled=s(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=s(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),i=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===i)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=s,this.shadowFbo=u,this.shadowW=o,this.shadowH=i}ensureShoreFbo(e,r){let o=Math.max(2,e),i=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===i)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=s,this.shoreFbo=u,this.shoreW=o,this.shoreH=i}renderShadows(e){let{cam:r,sprites:o,fogStates:i,walls:n=[],shadowPages:s,shadowOpacity:u,detailOpacity:c}=e;if(this.lastHasCrossShadows=!1,u<=.005||c<=.01||s.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:a,instanceData:d}=this;this.ensureShadowFbo(a.canvas.width,a.canvas.height);let h=0,f=0,m=new Array(s.length).fill(0);for(let v=0;v<o.length;v++){let M=o[v];M.shadowPage<0||M.shadowPage>=s.length||i[v]!==0&&m[M.shadowPage]++}for(let v=0;v<n.length;v++){let M=n[v],$=M.shadowPage??-1;$<0||$>=s.length||M.fogState===0||m[$]++}let b=new Array(s.length).fill(0),x=0;for(let v=0;v<s.length;v++)b[v]=x,x+=m[v];if(x===0)return{drawCalls:0,renderedShadows:0};let w=[...b],U=Math.min(x,16384);for(let v=0;v<o.length;v++){let M=o[v],$=M.shadowPage;if($<0||$>=s.length)continue;let S=i[v];if(S===0)continue;let g=w[$];if(g>=U)continue;w[$]=g+1,h++;let L=M.shadowTier??(M.isMountain?3:0);L>0&&f++;let D=g*16,C=(M.shadowMaxX-M.shadowMinX)*M.width,H=(M.shadowMaxY-M.shadowMinY)*M.width;d[D]=M.x,d[D+1]=M.y,d[D+2]=M.shadowMinX*M.width,d[D+3]=M.shadowMinY*M.width,d[D+4]=C,d[D+5]=H,d[D+6]=S===1?c*.65:c,d[D+7]=L,d[D+8]=M.shadowU0,d[D+9]=M.shadowV0,d[D+10]=M.shadowU1,d[D+11]=M.shadowV1,d[D+12]=.5,d[D+13]=0,d[D+14]=0,d[D+15]=0}for(let v=0;v<n.length;v++){let M=n[v],$=M.shadowPage??-1;if($<0||$>=s.length||M.fogState===0)continue;let S=w[$];if(S>=U)continue;w[$]=S+1,h++,f++;let g=S*16;d[g]=M.x,d[g+1]=M.y,d[g+2]=M.shadowRelLeft??0,d[g+3]=M.shadowRelTop??0,d[g+4]=M.shadowWidth??0,d[g+5]=M.shadowHeight??0,d[g+6]=M.fogState===1?c*.65:c,d[g+7]=2,d[g+8]=M.shadowU0??0,d[g+9]=M.shadowV0??0,d[g+10]=M.shadowU1??0,d[g+11]=M.shadowV1??0,d[g+12]=.5,d[g+13]=0,d[g+14]=0,d[g+15]=0}this.lastHasCrossShadows=f>0,a.bindBuffer(a.ARRAY_BUFFER,this.instanceVbo),a.bufferSubData(a.ARRAY_BUFFER,0,d.subarray(0,U*16)),a.bindFramebuffer(a.FRAMEBUFFER,this.shadowFbo),a.viewport(0,0,this.shadowW,this.shadowH),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.enable(a.BLEND),a.blendEquation(a.MAX),a.blendFunc(a.ONE,a.ONE),a.useProgram(this.shadowMaskProg),a.bindVertexArray(this.vao),a.uniform2f(this.shCam,r.x,r.y),a.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),a.uniform1f(this.shZoom,r.zoom),a.uniform1f(this.shScaleY,1),a.uniform1f(this.shShearX,0),a.uniform1f(this.shTime,0),a.uniform1f(this.shWindEnabled,0),a.uniform1f(this.shDecalPass,0);let q=0;a.activeTexture(a.TEXTURE0);for(let v=0;v<s.length;v++){let M=b[v],$=Math.min(w[v],U),S=$-M;S<=0||(a.bindTexture(a.TEXTURE_2D,s[v]),M===0||a.bufferSubData(a.ARRAY_BUFFER,0,d.subarray(M*16,$*16)),a.drawArraysInstanced(a.TRIANGLES,0,6,S),q++)}return a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,a.canvas.width,a.canvas.height),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.compositeProg),a.bindVertexArray(this.compositeVao),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,this.shadowTex),a.uniform1f(this.compOpacity,u),a.drawArrays(a.TRIANGLES,0,3),q++,{drawCalls:q,renderedShadows:h}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:i,naturePages:n,walls:s=[],infraPages:u=[],detailOpacity:c,objectScaleY:a,objectShearX:d,shadowOpacity:h=.54,mountainShadowOnSprites:f=!0,spriteSelfShadow:m=.68,naturePolish:b=.4,spriteSaturation:x=1,spriteBrightness:w=1,spriteContrast:U=1,timeSec:q=0,windAnimation:v=!0,isDecalPass:M=!1}=e,$=o.length>0&&n.length>0,S=s.length>0&&u.length>0;if(c<=.01||!$&&!S)return{drawCalls:0,renderedSprites:0};let{gl:g,instanceData:L}=this;g.enable(g.BLEND),g.blendEquation(g.FUNC_ADD),g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA),g.useProgram(this.spriteProg),g.bindVertexArray(this.vao),g.bindBuffer(g.ARRAY_BUFFER,this.instanceVbo),g.uniform2f(this.spCam,r.x,r.y),g.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),g.uniform1f(this.spZoom,r.zoom),g.uniform1f(this.spScaleY,a),g.uniform1f(this.spShearX,d),g.uniform1f(this.spTime,q),g.uniform1f(this.spWindEnabled,v?1:0),g.uniform2f(this.spCanvasSize,g.canvas.width,g.canvas.height);let D=f&&this.lastHasCrossShadows&&this.shadowTex!==null?h:0;g.uniform1f(this.spMtnShadowOpacity,D),g.uniform1f(this.spSelfShadow,m),g.uniform1f(this.spNaturePolish,b),g.uniform1f(this.spSpriteSat,x),g.uniform1f(this.spSpriteBright,w),g.uniform1f(this.spSpriteContrast,U),g.uniform1f(this.spColorGradeAll,1),g.uniform1f(this.spDecalPass,M?1:0);let C=n[0]??u[0];g.activeTexture(g.TEXTURE8),g.bindTexture(g.TEXTURE_2D,this.shadowTex??C);let H=0,J=0,B=0,T=[],Y=new Map,ae=()=>{if(B<=0)return;for(let l=0;l<T.length;l++)g.activeTexture(g.TEXTURE0+l),g.bindTexture(g.TEXTURE_2D,T[l]);let I=T[0]??C;for(let l=T.length;l<8;l++)g.activeTexture(g.TEXTURE0+l),g.bindTexture(g.TEXTURE_2D,I);g.bufferSubData(g.ARRAY_BUFFER,0,L.subarray(0,B*16)),g.drawArraysInstanced(g.TRIANGLES,0,6,B),H++,J+=B,B=0,T=[],Y.clear()},re=I=>{let l=Y.get(I);return l===void 0?((T.length>=8||B>=16384)&&ae(),l=T.length,T.push(I),Y.set(I,l)):B>=16384&&(ae(),l=0,T.push(I),Y.set(I,0)),l},V=0,_=0,A=$?o.length:0,R=S?s.length:0;for(;V<A||_<R;){let I=!1;if(V>=A)I=!0;else if(_<R){let l=o[V].sortY??o[V].y;s[_].sortY<l&&(I=!0)}if(I){let l=s[_++];if(l.fogState===0||l.page<0||l.page>=u.length)continue;let p=re(u[l.page]),y=(l.fogState===1?1:0)|4|16,k=B*16;L[k]=l.x,L[k+1]=l.y,L[k+2]=l.relLeft,L[k+3]=l.relTop,L[k+4]=l.width,L[k+5]=l.height,L[k+6]=c,L[k+7]=p*256+y,L[k+8]=l.u0,L[k+9]=l.v0,L[k+10]=l.u1,L[k+11]=l.v1,L[k+12]=.5,L[k+13]=0,L[k+14]=0,L[k+15]=0,B++}else{let l=V++,p=i[l];if(p===0)continue;let y=o[l];if(y.page<0||y.page>=n.length)continue;let k=re(n[y.page]),W=y.shadowTier??(y.isMountain?3:0),O=y.selfShadeWeight??(y.isGroundDecal?0:y.isMountain?.52:.72),K=Math.max(0,Math.min(7,Math.round(O*7))),X=(p===1?1:0)|(W&3)<<3|(K&7)<<5;y.isMountain||(X|=2,y.isSnowFamily&&(X|=4));let oe=!!y.flipX,j=oe?1-y.anchorX:y.anchorX,F=B*16;L[F]=y.x,L[F+1]=y.y,L[F+2]=-y.width*j,L[F+3]=-y.height*y.anchorY,L[F+4]=y.width,L[F+5]=y.height,L[F+6]=c,L[F+7]=k*256+X,L[F+8]=oe?y.u1:y.u0,L[F+9]=y.v0,L[F+10]=oe?y.u0:y.u1,L[F+11]=y.v1,L[F+12]=y.tintHash??.5,L[F+13]=M?y.rotationRad??0:y.swayAmp??0,L[F+14]=M?y.terrainTintRgb??0:0,L[F+15]=M?y.terrainTintMix??0:0,B++}}return ae(),{drawCalls:H,renderedSprites:J}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:i,infraPages:n,projectY:s}=e;if(o.length===0||n.length===0)return{drawCalls:0,renderedShorelines:0};let{gl:u,instanceData:c}=this;this.ensureShoreFbo(u.canvas.width,u.canvas.height),u.bindFramebuffer(u.FRAMEBUFFER,this.shoreFbo),u.viewport(0,0,this.shoreW,this.shoreH),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),u.enable(u.BLEND),u.blendEquation(u.MAX),u.blendFunc(u.ONE,u.ONE),u.useProgram(this.spriteProg),u.bindVertexArray(this.vao),u.bindBuffer(u.ARRAY_BUFFER,this.instanceVbo),u.uniform2f(this.spCam,r.x,r.y),u.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),u.uniform1f(this.spZoom,r.zoom),u.uniform1f(this.spScaleY,1),u.uniform1f(this.spShearX,0),u.uniform1f(this.spTime,0),u.uniform1f(this.spWindEnabled,0),u.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),u.uniform1f(this.spMtnShadowOpacity,0),u.uniform1f(this.spSelfShadow,0),u.uniform1f(this.spNaturePolish,0),u.uniform1f(this.spSpriteSat,1),u.uniform1f(this.spSpriteBright,1),u.uniform1f(this.spSpriteContrast,1),u.uniform1f(this.spColorGradeAll,0),u.uniform1f(this.spDecalPass,0);let a=Math.min(n.length,8);for(let w=0;w<8;w++)u.activeTexture(u.TEXTURE0+w),u.bindTexture(u.TEXTURE_2D,n[w<a?w:0]);u.activeTexture(u.TEXTURE8),u.bindTexture(u.TEXTURE_2D,n[0]);let d=0,h=0,f=0,m=()=>{f<=0||(u.bufferSubData(u.ARRAY_BUFFER,0,c.subarray(0,f*16)),u.drawArraysInstanced(u.TRIANGLES,0,6,f),d++,h+=f,f=0)},b=512,x=512*s;for(let w=0;w<o.length;w++){let U=i[w];if(U===0)continue;let q=o[w];if(q.page<0||q.page>=a)continue;f>=16384&&m();let v=f*16;c[v]=q.x,c[v+1]=q.y,c[v+2]=-b*.5,c[v+3]=-x*.5,c[v+4]=b,c[v+5]=x,c[v+6]=1,c[v+7]=q.page*256+4+24+(U===1?1:0),c[v+8]=q.u0,c[v+9]=q.v0,c[v+10]=q.u1,c[v+11]=q.v1,c[v+12]=.5,c[v+13]=0,c[v+14]=0,c[v+15]=0,f++}return m(),u.bindFramebuffer(u.FRAMEBUFFER,null),u.viewport(0,0,u.canvas.width,u.canvas.height),u.blendEquation(u.FUNC_ADD),u.blendFunc(u.ONE,u.ONE_MINUS_SRC_ALPHA),h>0&&(u.useProgram(this.shoreCompositeProg),u.bindVertexArray(this.compositeVao),u.activeTexture(u.TEXTURE0),u.bindTexture(u.TEXTURE_2D,this.shoreTex),u.drawArrays(u.TRIANGLES,0,3),d++),{drawCalls:d,renderedShorelines:h}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:i,detailOpacity:n,timeSec:s,windAnimation:u}=e;if(n<=.02||o.length===0)return 0;let{gl:c,instanceData:a}=this,d=0;for(let h=0;h<o.length;h++){let f=o[h];if(!f.isWaterBoulder)continue;let m=i[h];if(m===0)continue;if(d>=16384)break;let b=f.width*.68,x=f.width*.25,w=d*16;a[w]=f.x,a[w+1]=f.y-f.height*.04,a[w+2]=-b,a[w+3]=-x,a[w+4]=b*2,a[w+5]=x*2,a[w+6]=n,a[w+7]=m===1?1:0,a[w+8]=0,a[w+9]=0,a[w+10]=0,a[w+11]=0,a[w+12]=f.tintHash??.5,a[w+13]=0,a[w+14]=0,a[w+15]=0,d++}return d===0?0:(c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),c.useProgram(this.surfProg),c.bindVertexArray(this.vao),c.bindBuffer(c.ARRAY_BUFFER,this.instanceVbo),c.uniform2f(this.sfCam,r.x,r.y),c.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),c.uniform1f(this.sfZoom,r.zoom),c.uniform1f(this.sfTime,s),c.uniform1f(this.sfWindEnabled,u?1:0),c.bufferSubData(c.ARRAY_BUFFER,0,a.subarray(0,d*16)),c.drawArraysInstanced(c.TRIANGLES,0,6,d),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var mt=256,Jo=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,ei=`#version 300 es
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
const float HEX_R = ${Ze.toFixed(6)};
const float PROJ_Y = ${Ge.toFixed(4)};
const float ROW_STEP = ${(1.5*Ze).toFixed(6)};
const float TEX_WORLD_SIZE = 256.0;
const float WATER_HEX_COVER = ${(2*Ze).toFixed(4)}; // 295.603 (autotile.js:87)
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
`,ti=`#version 300 es
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
const float HEX_R = ${Ze.toFixed(6)};
const float PROJ_Y = ${Ge.toFixed(4)};
const float ROW_STEP = ${(1.5*Ze).toFixed(6)};

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
`;function nn(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${i}`)}return o}var _r=class{constructor(e){this.cellBuf=new Uint8Array(mt*mt*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.hasUnknownCells=!1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=nn(e,e.VERTEX_SHADER,Jo),o=nn(e,e.FRAGMENT_SHADER,ei),i=e.createProgram();if(!i)throw new Error("Failed to create terrain program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let h=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteShader(r),e.deleteProgram(i),new Error(`Terrain program link error:
${h}`)}this.program=i;let n=nn(e,e.FRAGMENT_SHADER,ti),s=e.createProgram();if(!s)throw e.deleteShader(r),e.deleteShader(n),new Error("Failed to create cloud overlay program");if(e.attachShader(s,r),e.attachShader(s,n),e.linkProgram(s),e.deleteShader(r),e.deleteShader(n),!e.getProgramParameter(s,e.LINK_STATUS)){let h=e.getProgramInfoLog(s)||"Unknown link error";throw e.deleteProgram(s),new Error(`Cloud overlay program link error:
${h}`)}this.cloudProgram=s;let u=e.createVertexArray();if(!u)throw new Error("Failed to create terrain VAO");this.vao=u;let c=e.createTexture();if(!c)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=c,e.bindTexture(e.TEXTURE_2D,c),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,mt,mt),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let a=e.createTexture();if(!a)throw new Error("Failed to allocate surface field texture");this.surfaceTex=a,e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let d=(h,f)=>{let m=e.getUniformLocation(h,f);if(!m)throw new Error(`Missing terrain uniform: ${f}`);return m};this.uCamCenter=d(i,"u_camCenter"),this.uViewportSize=d(i,"u_viewportSize"),this.uZoom=d(i,"u_zoom"),this.uTime=d(i,"u_time"),this.uGridOrigin=d(i,"u_gridOrigin"),this.uGridSize=d(i,"u_gridSize"),this.uForestFloorLayer=d(i,"u_forestFloorLayer"),this.uShowGrid=d(i,"u_showGrid"),this.uHoverHex=d(i,"u_hoverHex"),this.uSurfaceRect=d(i,"u_surfaceRect"),this.uEdgeBand=d(i,"u_edgeBand"),this.uWaterHexMode=d(i,"u_waterHexMode"),this.uReliefEnabled=d(i,"u_reliefEnabled"),this.uReliefLighting=d(i,"u_reliefLighting"),this.uWindEnabled=d(i,"u_windEnabled"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(i,"u_cellData"),1),e.uniform1i(e.getUniformLocation(i,"u_surfaceField"),3),this.cuCamCenter=d(s,"u_camCenter"),this.cuViewportSize=d(s,"u_viewportSize"),this.cuZoom=d(s,"u_zoom"),this.cuTime=d(s,"u_time"),this.cuGridOrigin=d(s,"u_gridOrigin"),this.cuGridSize=d(s,"u_gridSize"),this.cuHasClouds=d(s,"u_hasClouds"),this.cuHasCloudEdge=d(s,"u_hasCloudEdge"),this.cuWindEnabled=d(s,"u_windEnabled"),e.useProgram(s),e.uniform1i(e.getUniformLocation(s,"u_cellData"),1),e.uniform1i(e.getUniformLocation(s,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(s,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return Bn(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:i,cellTex:n,surfaceTex:s,cellBuf:u}=this,{cam:c,assets:a,lookupHex:d,resolveTerrainLayer:h,isWaterTerrain:f,seedInt:m,dataRevision:b,timeSec:x,showGrid:w,hoverHex:U,edgeBand:q=28,waterSampling:v="hex",reliefEnabled:M=!0,reliefStrength:$=Ht,reliefLighting:S=!0,reliefStyle:g="sculpted",windAnimation:L=!0}=e,D=Ar(c,4),C=D.maxQ-D.minQ+1,H=D.maxR-D.minR+1,J=D.minQ,B=D.minR;C>mt&&(J=Math.floor((D.minQ+D.maxQ)/2)-Math.floor(mt/2),C=mt),H>mt&&(B=Math.floor((D.minR+D.maxR)/2)-Math.floor(mt/2),H=mt);let T=!1;if(J!==this.lastMinQ||B!==this.lastMinR||C!==this.lastSpanQ||H!==this.lastSpanR||b!==this.lastDataRevision){let p=0,y=!1;for(let k=0;k<H;k++){let W=B+k;for(let O=0;O<C;O++){let K=J+O,X=d(K,W);if(!X||X.fogState===0)y=!0,u[p++]=0,u[p++]=0,u[p++]=0,u[p++]=0;else{let oe=f(X.terrainId)?1:0,j=Ct.has(X.terrainId)?2:0,F=X.terrainId==="icy_ocean"?4:0;u[p++]=h(X.terrainId,K,W)&255,u[p++]=0,u[p++]=X.fogState,u[p++]=oe|j|F}}}this.hasUnknownCells=y,r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,C,H,r.RGBA_INTEGER,r.UNSIGNED_BYTE,u.subarray(0,C*H*4)),this.lastMinQ=J,this.lastMinR=B,this.lastSpanQ=C,this.lastSpanR=H,this.lastDataRevision=b,T=!0}let Y=M?$:0,ae=c.viewportWidth*.5/c.zoom,re=c.viewportHeight*.5/(c.zoom*Ge),V=c.x-ae-140,_=c.x+ae+140,A=c.y/Ge-re-180,R=c.y/Ge+re+220;if(!this.surfaceWin||this.lastSurfaceRevision!==b||this.lastSurfaceStrength!==Y||this.lastSurfaceStyle!==g||V<this.surfaceWin.left||_>this.surfaceWin.left+this.surfaceWin.width||A<this.surfaceWin.top||R>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(_-V)*3.5){let p=Math.max(384,(_-V)*.35),y=Math.max(384,(R-A)*.35),k=V-p,W=A-y,O=_-V+p*2,K=R-A+y*2,X=Math.max(16,Math.ceil(Math.max(O/200,K/150)));this.surfaceWin=qn({left:k,top:W,width:O,height:K,step:X,lookupHex:d,manifest:a.manifest,seedInt:m,reliefStrength:Y,reliefStyle:g}),this.lastSurfaceRevision=b,this.lastSurfaceStrength=Y,this.lastSurfaceStyle=g,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(i),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,a.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.uniform2f(this.uCamCenter,c.x,c.y),r.uniform2f(this.uViewportSize,c.viewportWidth,c.viewportHeight),r.uniform1f(this.uZoom,c.zoom),r.uniform1f(this.uTime,x),r.uniform2i(this.uGridOrigin,J,B),r.uniform2i(this.uGridSize,C,H),r.uniform1i(this.uForestFloorLayer,a.forestFloorLayer),r.uniform1f(this.uShowGrid,w?1:0),r.uniform2i(this.uHoverHex,U?U.q:-999999,U?U.r:-999999);let l=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,l?l.left:0,l?l.top:0,l?l.width:1,l?l.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,q))),r.uniform1f(this.uWaterHexMode,v==="hex"?1:0),r.uniform1f(this.uReliefEnabled,M?1:0),r.uniform1f(this.uReliefLighting,S?1:0),r.uniform1f(this.uWindEnabled,L?1:0),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:C*H,uploaded:T}}renderCloudOverlay(e){if(!this.hasUnknownCells||this.lastSpanQ<=0||this.lastSpanR<=0)return 0;let{gl:r,cloudProgram:o,vao:i,cellTex:n}=this,{cam:s,assets:u,timeSec:c,windAnimation:a=!0}=e;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(o),r.bindVertexArray(i),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,u.cloudTexture),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,u.cloudEdgeTexture??u.cloudTexture),r.uniform2f(this.cuCamCenter,s.x,s.y),r.uniform2f(this.cuViewportSize,s.viewportWidth,s.viewportHeight),r.uniform1f(this.cuZoom,s.zoom),r.uniform1f(this.cuTime,c),r.uniform2i(this.cuGridOrigin,this.lastMinQ,this.lastMinR),r.uniform2i(this.cuGridSize,this.lastSpanQ,this.lastSpanR),r.uniform1f(this.cuHasClouds,u.cloudTexture?1:0),r.uniform1f(this.cuHasCloudEdge,u.cloudEdgeTexture?1:0),r.uniform1f(this.cuWindEnabled,a?1:0),r.drawArrays(r.TRIANGLES,0,3),1}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program),this.gl.deleteProgram(this.cloudProgram)}};var oo=65536,Sr=6,ri=`#version 300 es
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
`,ni=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,io={trail:{shoulderWidth:32,coreWidth:16,shoulderColor:[.56,.46,.31,.34],coreColor:[.64,.54,.37,.78]},packed:{shoulderWidth:40,coreWidth:24,shoulderColor:[.47,.39,.28,.45],coreColor:[.69,.6,.45,.88]},stone:{shoulderWidth:46,coreWidth:31,shoulderColor:[.33,.32,.28,.58],coreColor:[.65,.63,.57,.96]}},Cr=class{constructor(e){this.verts=new Float32Array(oo*Sr);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,ri),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,ni),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate vector program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=Sr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,8),e.bindVertexArray(null);let c=a=>{let d=e.getUniformLocation(i,a);if(!d)throw new Error(`Missing vector uniform: ${a}`);return d};this.uCamCenter=c("u_camCenter"),this.uViewportSize=c("u_viewportSize"),this.uZoom=c("u_zoom")}pushTri(e,r,o,i,n,s,u,c,a,d){if(this.vertCount+3>oo)return;let h=this.vertCount*Sr,f=this.verts;f[h++]=e,f[h++]=r,f[h++]=u,f[h++]=c,f[h++]=a,f[h++]=d,f[h++]=o,f[h++]=i,f[h++]=u,f[h++]=c,f[h++]=a,f[h++]=d,f[h++]=n,f[h++]=s,f[h++]=u,f[h++]=c,f[h++]=a,f[h++]=d,this.vertCount+=3}pushSegment(e,r,o,i){let n=r.x-e.x,s=r.y-e.y,u=Math.hypot(n,s);if(u<1e-4)return;let c=-s/u*(o*.5),a=n/u*(o*.5),[d,h,f,m]=i;this.pushTri(e.x-c,e.y-a,e.x+c,e.y+a,r.x+c,r.y+a,d,h,f,m),this.pushTri(e.x-c,e.y-a,r.x+c,r.y+a,r.x-c,r.y-a,d,h,f,m)}pushDisc(e,r,o,i,n,s){let[u,c,a,d]=s;for(let h=0;h<n;h++){let f=h/n*Math.PI*2,m=(h+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(f)*o,r+Math.sin(f)*i,e+Math.cos(m)*o,r+Math.sin(m)*i,u,c,a,d)}}pushHexFill(e,r,o,i=1){let n=ke(e,r),s=Qt(e,r),[u,c,a,d]=o;for(let h=0;h<6;h++){let f=s[h],m=s[(h+1)%6],b=n.x+(f.x-n.x)*i,x=n.y+(f.y-n.y)*i,w=n.x+(m.x-n.x)*i,U=n.y+(m.y-n.y)*i;this.pushTri(n.x,n.y,b,x,w,U,u,c,a,d)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Sr)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s}=e;if(!o)return 0;this.vertCount=0;let u=c=>s?{x:c.x,y:c.y-s(c.x,c.y/Ge)*Ge}:c;if(o.territory&&o.territory.length>0){let c=new Map;for(let f of o.territory)c.set(Fe(f.q,f.r),f.ownerId);let a=.08+n*.24,d=Math.max(7,10/Math.max(.2,r.zoom*1.1)),h=.75+n*.2;for(let f of o.territory){let m=i(f.q,f.r);if(m===0)continue;let b=m===1?.65:1,[x,w,U]=f.color;this.pushHexFill(f.q,f.r,[x,w,U,a*b],.98);for(let q=0;q<6;q++){let[v,M]=Te[q];if(c.get(Fe(f.q+v,f.r+M))!==f.ownerId){let{a:S,b:g}=lt(f.q,f.r,q),L=ke(f.q,f.r),D={x:S.x+(L.x-S.x)*.05,y:S.y+(L.y-S.y)*.05},C={x:g.x+(L.x-g.x)*.05,y:g.y+(L.y-g.y)*.05};this.pushSegment(D,C,d,[x,w,U,h*b])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let c=1-n*.85;for(let a of o.buildings){let d=i(a.q,a.r);if(d===0)continue;let h=(d===1?.65:1)*c,f=u(ke(a.q,a.r)),b=a.kind==="capital"||a.kind==="settlement"||a.kind==="fortress"?106:78,x=b*.72;this.pushDisc(f.x,f.y+4,b*1.18,x*1.18,18,[.42,.36,.26,.22*h]),this.pushDisc(f.x,f.y+4,b*.88,x*.88,16,[.48,.42,.31,.36*h])}}if(o.roads&&o.roads.length>0&&n<.85){let c=1-n*.8,a=new Map,d={trail:1,packed:2,stone:3},h=s?4:1;for(let f of o.roads){let m=i(f.q1,f.r1),b=i(f.q2,f.r2);if(m===0&&b===0)continue;let x=(m===2||b===2?1:.68)*c,w=ke(f.q1,f.r1),U=ke(f.q2,f.r2),q=io[f.tier],v=[];for(let M=0;M<=h;M++){let $=M/h;v.push(u({x:w.x+(U.x-w.x)*$,y:w.y+(U.y-w.y)*$}))}for(let M=0;M<h;M++)this.pushSegment(v[M],v[M+1],q.shoulderWidth+16,[.44,.37,.25,.18*x]);for(let M=0;M<h;M++)this.pushSegment(v[M],v[M+1],q.shoulderWidth,[q.shoulderColor[0],q.shoulderColor[1],q.shoulderColor[2],q.shoulderColor[3]*x]);for(let M=0;M<h;M++)this.pushSegment(v[M],v[M+1],q.coreWidth,[q.coreColor[0],q.coreColor[1],q.coreColor[2],q.coreColor[3]*x]),M>0&&this.pushDisc(v[M].x,v[M].y,q.coreWidth*.5,q.coreWidth*.5,8,[q.coreColor[0],q.coreColor[1],q.coreColor[2],q.coreColor[3]*x]);for(let[M,$,S]of[[f.q1,f.r1,v[0]],[f.q2,f.r2,v[h]]]){let g=Fe(M,$),L=a.get(g);(!L||d[f.tier]>d[L.tier])&&a.set(g,{pt:S,tier:f.tier,dim:x})}}for(let f of a.values()){let m=io[f.tier];this.pushDisc(f.pt.x,f.pt.y,(m.shoulderWidth+10)*.52,(m.shoulderWidth+10)*.45,12,[.44,.37,.25,.16*f.dim]),this.pushDisc(f.pt.x,f.pt.y,m.coreWidth*.54,m.coreWidth*.46,12,[m.coreColor[0],m.coreColor[1],m.coreColor[2],m.coreColor[3]*f.dim])}}if(o.buildPreview){let c=o.buildPreview;for(let d of c.bonusHexes)this.pushHexFill(d.q,d.r,[.22,.82,.48,.24],.92);let a=c.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(c.center.q,c.center.r,a,.96)}if(o.selectedHex){let c=Qt(o.selectedHex.q,o.selectedHex.r),a=Math.max(5,6/Math.max(.25,r.zoom));for(let d=0;d<6;d++)this.pushSegment(c[d],c[(d+1)%6],a,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:i,timeSec:n}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let s of o.buildings){let u=i(s.q,s.r);if(u===0)continue;let c=u===1?.65:1,a=ke(s.q,s.r),[d,h,f]=s.factionColor;if(s.rangeRadius&&s.rangeRadius>0){let q=s.rangeRadius*240,v=q*.85,M=36;for(let $=0;$<M;$+=2){let S=$/M*Math.PI*2,g=($+1)/M*Math.PI*2;this.pushSegment({x:a.x+Math.cos(S)*q,y:a.y+Math.sin(S)*v},{x:a.x+Math.cos(g)*q,y:a.y+Math.sin(g)*v},Math.max(4,3.5/Math.max(.2,r.zoom)),[d,h,f,.45*c])}}let m=s.kind==="capital"||s.kind==="settlement",b=s.kind==="fortress"||s.kind==="watchtower",x=m?78:b?64:52,w=m?68:b?76:42;this.pushDisc(a.x-10,a.y+8,x*1.12,x*.62,16,[.05,.07,.09,.45*c]),this.pushDisc(a.x,a.y+4,x,x*.56,6,[.34,.32,.29,.96*c]);let U=x*.68;this.pushTri(a.x-U,a.y+6,a.x+U,a.y+6,a.x+U,a.y-w*.65,.78*c,.74*c,.66*c,.98),this.pushTri(a.x-U,a.y+6,a.x+U,a.y-w*.65,a.x-U,a.y-w*.65,.66*c,.62*c,.55*c,.98),this.pushTri(a.x-U*1.18,a.y-w*.62,a.x+U*1.18,a.y-w*.62,a.x,a.y-w*1.25,d*c,h*c,f*c,.98),(m||b)&&this.pushTri(a.x-14,a.y-w*.95,a.x+14,a.y-w*.95,a.x,a.y-w*1.55,.96*c,.8*c,.34*c,.98)}if(o.sites)for(let s of o.sites){if(i(s.q,s.r)===0)continue;let c=ke(s.q,s.r),a=26,d=s.family==="fauna"?[.85,.58,.25,.9]:s.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(c.x,c.y-a,c.x+a,c.y,c.x,c.y+a,d[0],d[1],d[2],d[3]),this.pushTri(c.x,c.y-a,c.x,c.y+a,c.x-a,c.y,d[0]*.8,d[1]*.8,d[2]*.8,d[3])}if(o.units)for(let s of o.units){if(i(s.q,s.r)<2)continue;let[c,a,d]=s.factionColor,h=ke(s.q,s.r);if(s.marchPath&&s.marchPath.length>=2){let f=s.marchPath.map(g=>ke(g.q,g.r));for(let g=0;g<f.length-1;g++)this.pushSegment(f[g],f[g+1],Math.max(8,6/Math.max(.2,r.zoom)),[c,a,d,.78]);let m=f[f.length-1],b=f[f.length-2],x=m.x-b.x,w=m.y-b.y,U=Math.hypot(x,w)||1,q=x/U,v=w/U,M=m,$={x:m.x-q*28,y:m.y-v*28};this.pushTri(M.x,M.y,$.x-v*18,$.y+q*18,$.x+v*18,$.y-q*18,c,a,d,.95);let S=n*.14%1;h={x:f[0].x+(f[1].x-f[0].x)*S,y:f[0].y+(f[1].y-f[0].y)*S}}if(s.inCombat){let f=1+.22*Math.sin(n*5);this.pushDisc(h.x,h.y,56*f,44*f,20,[.98,.26,.22,.35])}this.pushDisc(h.x,h.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(h.x,h.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(h.x,h.y-16,26,26,18,[c,a,d,.98])}if(o.walls)for(let s of o.walls){if(!s.breached)continue;let u=ot(s.q1,s.r1,s.q2,s.r2);if(u<0)continue;let{mid:c}=lt(s.q1,s.r1,u),a=1+.18*Math.sin(n*4.5);this.pushDisc(c.x,c.y,32*a,24*a,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var oi=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],ii=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],si={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function ai(t,e,r,o){let i=t.infrastructure.sprites,n=[];e==="stone"?(o?(n.push(`walls/stone/gates/v1/gate_dir${r}`),r===5&&n.push("walls/stone/gates/v1/gate_dir2"),n.push(`walls/stone/v7/edge_dir${r}`)):n.push(`walls/stone/v7/edge_dir${r}`),n.push(`walls/palisade/edge_dir${r}`)):(o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`));for(let s of n)if(i[s])return s;return null}function li(t,e,r){let o=t.infrastructure.sprites,i=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${i}`,`walls/palisade/${i}`]:[`walls/palisade/${i}`];for(let s of n)if(o[s])return s;return null}function so(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,i,n,s]=r.boundsInSpriteWidth,u=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*u,shadowRelTop:i*u,shadowWidth:(n-o)*u,shadowHeight:(s-i)*u}}function ao(t,e,r){if(!e.length)return[];let o=[],i=new Map;for(let n of e){let s=ot(n.q1,n.r1,n.q2,n.r2);if(s<0)continue;let u=r(n.q1,n.r1),c=r(n.q2,n.r2),a=u>=c?u:c;if(a===0)continue;let{a:d,b:h,mid:f}=lt(n.q1,n.r1,s),m=ai(t,n.kind,s,!!n.isGate);if(m){let b=t.infrastructure.sprites[m],x=m.includes("/stone/"),[w,U,q,v]=x?ii[s]:oi[s],M=Math.abs(h.x-d.x)<=1e-6?x?5.5:3.5:0,$=x?"stone":"palisade";o.push({x:d.x,y:d.y,relLeft:-q,relTop:-v+M,width:w,height:U,page:b.page,u0:b.uv[0],v0:b.uv[1],u1:b.uv[2],v1:b.uv[3],sortY:f.y,fogState:a,...so(t,`wall_shadow:${$}:dir${s}`)})}for(let b of[d,h]){let x=`${Math.round(b.x*10)},${Math.round(b.y*10)}`,w=i.get(x);w||(w={x:b.x,y:b.y,degree:0,hasPalisade:!1,hasStone:!1,fog:a},i.set(x,w)),w.degree++,n.kind==="palisade"&&(w.hasPalisade=!0),n.kind==="stone"&&(w.hasStone=!0),a>w.fog&&(w.fog=a)}}for(let n of i.values()){let s=n.hasStone&&!n.hasPalisade?"stone":"palisade",u=n.degree===1,c=li(t,s,u);if(!c)continue;let a=t.infrastructure.sprites[c],d=si[s],h=u?d.endW:d.cornerW,f=u?d.endH:d.cornerH;o.push({x:n.x,y:n.y,relLeft:-h*.5,relTop:-f+d.south,width:h,height:f,page:a.page,u0:a.uv[0],v0:a.uv[1],u1:a.uv[2],v1:a.uv[3],sortY:n.y+1,fogState:n.fog,...so(t,`wall_shadow:${s}:post`)})}return o.sort((n,s)=>n.sortY-s.sortY||n.x-s.x),o}var on={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0},Mr=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=tn(null);this.cachedWallSprites=[];this.wallCacheRevision=-1;this.cachedBridgeSprites=[];this.bridgeCacheKey="";this.cachedInfraSprites=[];this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...ct,...o.forestConfig??{}},this.reliefConfig={...Et,...o.reliefConfig??{}},this.visualConfig={...on,...o.visualConfig??{}};let i=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!i)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=i,this.terrainPass=new _r(i),this.riverPass=new ur(i),this.vectorPass=new Cr(i),this.spriteBatcher=new wr(i),this.camera=new vr(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await Qr(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new Xt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await Qr(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let i=this.assets;return this.assets=o,this.chunkManager=new Xt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,i?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheRevision=-1,this.infrastructureClearance=tn(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let r=0;r<e.length;r++){let o=e[r];if(o.inCombat||o.marchPath&&o.marchPath.length>=2)return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let i=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let s=this.camera.state,u=this.gl;u.viewport(0,0,u.canvas.width,u.canvas.height);let c=(e-this.startTimeMs)*.001,a=en(s.zoom),d=1-a,h=d>.02,f=this.visualConfig.windAnimation!==!1,{sprites:m,fogStates:b,decals:x,decalFogStates:w,shorelines:U,shoreFogStates:q,riverRoutes:v,chunksLoadedThisFrame:M,hasPendingChunks:$}=o.prepareVisibleFrame(s,h?2:6,h),S=(j,F)=>{let ie=o.lookupTerrainHex(j,F);return ie?ie.fogState:0},g=performance.now(),L=this.terrainPass.render({cam:s,assets:r,lookupHex:(j,F)=>o.lookupTerrainHex(j,F),resolveTerrainLayer:(j,F,ie)=>o.resolveTerrainLayer(j,F,ie),isWaterTerrain:j=>o.isWaterTerrain(j),seedInt:o.seedInt,dataRevision:o.revision,timeSec:c,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:f}),D=this.spriteBatcher.renderShorelines({cam:s,shorelines:U,fogStates:q,infraPages:r.infraPages,projectY:Ge}),C=this.riverPass.render({cam:s,assets:r,routes:v,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:(j,F)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(j,F):0,lookupFog:S,lookupHex:(j,F)=>o.lookupTerrainHex(j,F),timeSec:c,windAnimation:f}),H=this.vectorPass.renderGroundPass({cam:s,scene:this.dynamicScene,lookupFog:S,strategicBlend:a,sampleReliefHeight:(j,F)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(j,F):0}),J=performance.now(),B=m,T=b;if(!this.infrastructureClearance.isEmpty&&m.length>0){B=[],T=[];for(let j=0;j<m.length;j++){let F=m[j];rn(F,this.infrastructureClearance)||(B.push(F),T.push(b[j]))}}let Y=this.dynamicScene?.customSprites;if(h&&Y&&Y.length>0){let j=[];for(let F=0;F<B.length;F++)j.push({sprite:B[F],fog:T[F]});for(let F of Y){let ie=r.manifest.nature.sprites[F.spriteKey];if(!ie)continue;let le=ke(F.q,F.r),Pe=le.x+(F.offsetX??0),xe=le.y+(F.offsetY??0),we=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(Pe,xe/Ge)*Ge:0,pe=(F.worldWidthOverride??ie.worldWidth)*Mt(ie)*(F.scale??1),ge=pe*ie.aspect,be=r.manifest.shadows.sprites[F.spriteKey],ve=F.anchorOverride??ie.anchor;j.push({sprite:{x:Pe,y:xe-we,sortY:xe,width:pe,height:ge,anchorX:ve[0],anchorY:ve[1],page:ie.page,u0:ie.uv[0],v0:ie.uv[1],u1:ie.uv[2],v1:ie.uv[3],q:F.q,r:F.r,isMountain:ie.kind==="mountain",isSnowFamily:or(ie),shadowTier:jr(ie,pe,ge),selfShadeWeight:$r(ie),shadowPage:be?be.page:-1,shadowU0:be?be.uv[0]:0,shadowV0:be?be.uv[1]:0,shadowU1:be?be.uv[2]:0,shadowV1:be?be.uv[3]:0,shadowMinX:be?be.boundsInSpriteWidth[0]:0,shadowMinY:be?be.boundsInSpriteWidth[1]:0,shadowMaxX:be?be.boundsInSpriteWidth[2]:0,shadowMaxY:be?be.boundsInSpriteWidth[3]:0},fog:S(F.q,F.r)})}j.sort((F,ie)=>(F.sprite.sortY??F.sprite.y)-(ie.sprite.sortY??ie.sprite.y)||F.sprite.x-ie.sprite.x),B=j.map(F=>F.sprite),T=j.map(F=>F.fog)}let ae=this.sceneRevision*1000003+o.revision,re=!1;this.wallCacheRevision!==ae&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?ao(r.manifest,this.dynamicScene.walls,S):[],this.wallCacheRevision=ae,re=!0);let V=this.dynamicScene?.roads,_=this.dynamicScene?.rivers,A=!!(V&&V.length>0)&&(v.length>0||!!(_&&_.length>0)),R=A?v.map(j=>j.id).join(","):"",I=A?`${ae}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}|${R}`:"";if(this.bridgeCacheKey!==I){if(A&&V){let j=Kn({roads:V,routes:v,manualRivers:_,lookupFog:S});this.cachedBridgeSprites=Zn({manifest:r.manifest,crossings:j,sampleReliefHeight:(F,ie)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(F,ie):0})}else this.cachedBridgeSprites=[];this.bridgeCacheKey=I,re=!0}re&&(this.cachedBridgeSprites.length===0?this.cachedInfraSprites=this.cachedWallSprites:this.cachedWallSprites.length===0?this.cachedInfraSprites=this.cachedBridgeSprites:this.cachedInfraSprites=[...this.cachedWallSprites,...this.cachedBridgeSprites].sort((j,F)=>j.sortY-F.sortY||j.x-F.x));let l=0;if(h&&x.length>0){let j=x,F=w;if(!this.infrastructureClearance.isEmpty){j=[],F=[];for(let ie=0;ie<x.length;ie++){let le=x[ie];rn(le,this.infrastructureClearance)||(j.push(le),F.push(w[ie]))}}j.length>0&&(l=this.spriteBatcher.renderWorldSprites({cam:s,sprites:j,fogStates:F,naturePages:r.naturePages,detailOpacity:d,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:c,windAnimation:!1,isDecalPass:!0}).drawCalls)}let p=this.spriteBatcher.renderShadows({cam:s,sprites:B,fogStates:T,walls:this.cachedInfraSprites,shadowPages:r.shadowPages,shadowOpacity:this.shadowOpacity,detailOpacity:d}),y=performance.now(),k=this.spriteBatcher.renderWaterSurfRings({cam:s,sprites:B,fogStates:T,detailOpacity:d,timeSec:c,windAnimation:f}),W=this.spriteBatcher.renderWorldSprites({cam:s,sprites:B,fogStates:T,naturePages:r.naturePages,walls:this.cachedInfraSprites,infraPages:r.infraPages,detailOpacity:d,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:this.shadowOpacity,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:c,windAnimation:f}),O=this.terrainPass.renderCloudOverlay({cam:s,assets:r,timeSec:c,windAnimation:f}),K=this.vectorPass.renderTacticalPass({cam:s,scene:this.dynamicScene,lookupFog:S,timeSec:c});this.overlayCanvas&&to({canvas:this.overlayCanvas,cam:s,scene:this.dynamicScene,lookupFog:S,strategicBlend:a,timeSec:c});let X=performance.now();this.hasPendingStream=$||M>0;let oe=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!oe||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let j=this.frameTimes.length>0?this.frameTimes.reduce((ie,le)=>ie+le,0)/this.frameTimes.length:Math.max(16.6,X-i),F={fps:Math.min(120,Math.round(1e3/Math.max(8,j))),frameMs:Number((X-i).toFixed(2)),terrainPassMs:Number((J-g).toFixed(2)),shadowPassMs:Number((y-J).toFixed(2)),spritePassMs:Number((X-y).toFixed(2)),drawCalls:1+D.drawCalls+C+H+l+p.drawCalls+k+W.drawCalls+O+K,visibleHexes:L.visibleHexes,renderedSprites:W.renderedSprites,renderedShadows:p.renderedShadows,loadedChunks:o.loadedChunkCount,mode:Jn(s.zoom),strategicBlend:Number(a.toFixed(2)),vramTier:r.vramTier,zoom:Number(s.zoom.toFixed(2)),centerHex:et(s.x,s.y)};this.options.onMetrics(F)}return oe}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.assets?.dispose(),this.assets=null}};var co={VedrasMapEngine:Mr,createGeographyV2ChunkProvider:On,createSandboxScenario:zn,computeScenarioFog:jn,evaluateDecision0121BuildPreview:Vt,SANDBOX_SCENARIO_LIST:Yn,VIELFALT_MIX_OVERRIDES:Tt,DEFAULT_FOREST_CONFIG:ct,DEFAULT_RELIEF_CONFIG:Et,DEFAULT_VISUAL_CONFIG:on,computeBoulderSpawnScale:dr,sizeFactor:Mt,GeographyV2:lo.default,hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:Te,axialToWorld:ke,worldToAxial:et,hexDistance:tt,hexKey:Fe,hexEdgeEndpoints:lt,canonicalEdgePair:Ft,neighborDirection:ot,pickNearestHexEdge:un}};typeof window<"u"&&(window.VedrasMapEngineLib=co);var vs=co;})();
