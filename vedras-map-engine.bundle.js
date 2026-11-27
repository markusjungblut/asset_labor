/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var Go=Object.create;var Sn=Object.defineProperty;var Oo=Object.getOwnPropertyDescriptor;var Vo=Object.getOwnPropertyNames;var No=Object.getPrototypeOf,Xo=Object.prototype.hasOwnProperty;var zo=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var Yo=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Vo(e))!Xo.call(t,i)&&i!==r&&Sn(t,i,{get:()=>e[i],enumerable:!(o=Oo(e,i))||o.enumerable});return t};var Nr=(t,e,r)=>(r=t!=null?Go(No(t)):{},Yo(e||!t||!t.__esModule?Sn(r,"default",{value:t,enumerable:!0}):r,t));var ir=zo((aa,or)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],i=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),s=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],u=[],a=(w,I=0,M=1)=>Math.min(M,Math.max(I,w)),l=(w,I)=>w+","+I;function c(w){let I=2166136261;for(let M=0;M<w.length;M++)I^=w.charCodeAt(M),I=Math.imul(I,16777619);return I>>>0}let h=Object.create(null);function d(w){let I=typeof w=="string"?w:String(w),M=h[I];return M===void 0&&(M=c(I),h[I]=M),M}function m(w,I,M,D){let W=w^Math.imul(I+32767,374761393)^Math.imul(M+65521,668265263)^D;return W=Math.imul(W^W>>>15,2246822519),W=Math.imul(W^W>>>13,3266489917),(W^W>>>16)>>>0}function p(w,I,M,D){return m(w,I,M,d(D))}let b=(w,I,M,D)=>m(w,I,M,d(D))/4294967296,g=w=>w*w*(3-2*w);function S(w,I,M){let D=I.reduce((f,[,v])=>f+M[v],0);if(D<=0)return I[0][0];let W=a(w,0,.999999999)*D;for(let[f,v]of I)if(W-=M[v],W<0)return f;return I[I.length-1][0]}let T=(w,I,M)=>w+(I-w)*M;function y(w,I,M,D,W){let f=I/D,v=M/D,E=Math.floor(f),G=Math.floor(v),q=g(f-E),$=g(v-G),V=d(W),J=1/4294967296,pe=m(w,E,G,V)*J,ee=m(w,E+1,G,V)*J,be=m(w,E,G+1,V)*J,Ee=m(w,E+1,G+1,V)*J;return T(T(pe,ee,q),T(be,Ee,q),$)}function _(){return s.map(([w,I,M,D,W,f,v,E])=>({group:w,id:I,label:M,defaultValue:D,min:W,max:f,step:v,help:E}))}function B(){return Object.fromEntries(s.map(w=>[w[1],w[3]]))}function k(w){if(w!==void 0&&(typeof w!="object"||w===null||Array.isArray(w)))throw Error("Ung\xFCltige Parameterdatei.");let I=B();for(let[,M,,D,W,f]of s){if(w?.[M]===void 0)continue;let v=Number(w[M]);if(!Number.isFinite(v)||v<W||v>f)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+M);I[M]=v}if(I["relief.mountainFraction"]+I["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return I}function x(w){if(!Array.isArray(w)||!w.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let I=w.map(D=>D?.stats??D);if(I.some(D=>!D||!Number.isFinite(D.total)||D.total<=0||!Number.isFinite(D.land)||D.land<0||D.land>D.total||!D.biomes||!D.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function M(D,W,f){let v=[...new Set([...D,...I.flatMap(G=>Object.keys(G[W]))])],E=I.reduce((G,q)=>G+q[f],0);return Object.fromEntries(v.map(G=>{let q=I.map(V=>V[W][G]||0),$=q.reduce((V,J)=>V+J,0);return[G,{total:$,mean:$/I.length,percent:E?100*$/E:0,worldsPresent:q.filter(V=>V>0).length}]}))}return{generatorVersion:e,samples:I.length,meanHexes:I.reduce((D,W)=>D+W.total,0)/I.length,meanLand:I.reduce((D,W)=>D+W.land,0)/I.length,biomes:M(n,"biomes","land"),terrains:M(i,"terrains","total")}}function P(w){if(!w||typeof w.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(w.id)||s.some(I=>I[1]===w.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let I of["defaultValue","min","max","step"])if(!Number.isFinite(w[I]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+I);if(w.min>w.defaultValue||w.defaultValue>w.max||w.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");s.push([String(w.group||"Erweiterungen"),w.id,String(w.label||w.id),w.defaultValue,w.min,w.max,w.step,String(w.help||"")])}function L(w){if(!w||!/^extension\.[a-z0-9_.]+$/.test(w.id)||typeof w.place!="function"||u.some(I=>I.id===w.id))throw Error("Ung\xFCltige Feature-Erweiterung.");u.push(w)}function C(w,I){return o.map(([M,D])=>I.get(l(w.q+M,w.r+D))).filter(Boolean)}function A(w,I,M,D,W,f=null,v=null){if(w==="arid"){if(M>W["biomes.dryThreshold"]-W["biomes.semiDesertMargin"])return"semi_desert";let E=T(D,v===null?D:v,W["geology.aridPatchMix"]),G=a(E+(W["geology.sandBias"]-.5)*.36);return S(G,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],W)}return w==="grassland"?M<W["geology.grassSparseHumidity"]?"sparse_pasture":D<W["geology.pastureSoil"]?"pasture":"grassland":w==="cold"?f&&f.hill>W["geology.highlandSoil"]&&I>=W["biomes.coldBoundary"]-W["geology.highlandColdMargin"]?"highland":I<W["biomes.coldBoundary"]-.04?M>W["biomes.snowHumidity"]?"snowfields":"frozen_tundra":I<W["biomes.coldBoundary"]&&M>.8?"snowfields":"tundra":w==="wetland"?I>W["geology.swampWarmBoundary"]?"swamp":I<.38?"moor":M>.85?"marshland":D>W["geology.wetlandSoil"]?"moor":"marshland":w==="jungle"?"jungle":w==="savanna"?M<.33?"semi_desert":"savanna":"grassland"}function Y(w,I,M){return w<M["biomes.coldBoundary"]?"cold":I>M["biomes.wetThreshold"]?w>M["biomes.jungleWarmBoundary"]?"jungle":"wetland":I<M["biomes.dryThreshold"]&&w>M["biomes.aridWarmBoundary"]?"arid":w>M["biomes.warmBoundary"]?"savanna":I>M["biomes.wetlandBoundary"]?"wetland":"grassland"}function X(w,I,M,D){let W=Math.sqrt(D["biomes.targetHexes"]),f=D["biomes.borderWarp"]*W,v=I+f*(y(w,I,M,W*.72,"warp-a")-.5)*2,E=M+f*(y(w,I,M,W*.72,"warp-b")-.5)*2,G=Math.floor(v/W),q=Math.floor(E/W),$=1/0,V=null;for(let J=-1;J<=1;J++)for(let pe=-1;pe<=1;pe++){let ee=G+pe,be=q+J,Ee=(ee+.5+(b(w,ee,be,"jit-q")-.5)*.72)*W,de=(be+.5+(b(w,ee,be,"jit-r")-.5)*.72)*W,Ie=(v-Ee)*(v-Ee)+(E-de)*(E-de);Ie<$&&($=Ie,V={id:l(ee,be),x:Ee,y:de})}return V}let K=(w,I)=>Math.max(Math.abs(w.q-I.q),Math.abs(w.r-I.r),Math.abs(w.q+w.r-I.q-I.r));function R(w,I,M,D,W=()=>!0){if(M<=0)return 1/0;let f=[];for(let v=0;v<1900;v++){let E=Math.floor((b(w,v,0,"sampleQ:"+I)-.5)*6900),G=Math.floor((b(w,v,1,"sampleR:"+I)-.5)*6900);W(E,G)&&f.push(D(E,G))}return f.length?(f.sort((v,E)=>E-v),f[Math.min(f.length-1,Math.floor(a(M)*f.length))]):1/0}function H(w,I){if(typeof w!="string"||w.length<1||w.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let M=k(I),D=c(r+":"+w),W={...M,"biomes.targetHexes":Math.max(5,M["geology.scale"]*1.5)},f=new Map,v=new Map,E=new Map,G=(F,z)=>l(F,z),q=(F,z)=>a(M["climate.temperature"]+(y(D,F,z,M["climate.scale"],"temp")-.5)*2*M["climate.tempVariation"]),$=(F,z)=>a(M["climate.humidity"]+(y(D,F,z,M["climate.scale"]*.9,"wet")-.5)*2*M["climate.humidityVariation"]);function V(F,z){let ae=y(D,F,z,M["water.scale"],"sea"),j=y(D,F,z,Math.max(3,M["water.scale"]*.45),"sea-mid"),U=y(D,F,z,Math.max(2,M["water.scale"]*.21),"shore"),N=.2+.3*M["water.coastDetail"];return(ae+j)*.5*(1-N)+U*N}function J(F,z){let ae=y(D,F,z,4.2,"lakes");return V(F,z)-Math.max(0,ae-.68)*M["water.lakeInfluence"]}let pe=R(D,"water",M["water.fraction"],(F,z)=>-V(F,z));function ee(F,z){let ae=G(F,z);if(f.has(ae))return f.get(ae);let j=-J(F,z)>=pe;return f.set(ae,j),j}function be(F,z){let ae=G(F,z);if(v.has(ae))return v.get(ae);let j=y(D,F,z,M["relief.scale"],"relief"),U=Math.max(6,M["relief.chainLength"]),N=F+(y(D,F,z,U*.58,"m-warp-q")-.5)*11,se=z+(y(D,F,z,U*.58,"m-warp-r")-.5)*11,oe=1-Math.abs(y(D,N*.56+se*.36,se*1.18,U,"ridge")-.5)*2,Z=1-Math.abs(y(D,N*.34-se*.74,N*1.08,U*1.25,"ridge-b")-.5)*2,ce=Math.max(oe,Z*.86),ke=Math.pow(ce,3.6),me=1-Math.abs(y(D,F*.92+z*.28,z*.96,7.5,"m-pass-a")-.5)*2,Ge=1-Math.abs(y(D,F*.28-z*.92,F*.96,8.2,"m-pass-b")-.5)*2,He=Math.max(me,Ge),Xe=He>.82?Math.pow((He-.82)/.18,.7)*.62:0,$e=.92-.14*a(M["relief.chainWidth"],.05,.95),nt=a(ke*$e+j*(1-$e)-Xe,0,1),bt=a(ce*.65+j*.35,0,1),lt={mass:j,mountain:nt,oreBelt:bt,hill:j*.75+y(D,F,z,M["relief.scale"]*.46,"hills")*.25};return v.set(ae,lt),lt}let Ee=R(D,"mountain",M["relief.mountainFraction"],(F,z)=>be(F,z).mountain,(F,z)=>!ee(F,z)),de=(F,z)=>!ee(F,z)&&be(F,z).mountain>=Ee,Ie=new Map,Ce=(F,z)=>{let ae=G(F,z);if(Ie.has(ae))return Ie.get(ae);if(!de(F,z))return Ie.set(ae,!1),!1;let j=!1;for(let U=-2;U<=2&&!j;U++){let N=Math.max(-2,-U-2),se=Math.min(2,-U+2);for(let oe=N;oe<=se;oe++)if(!(U===0&&oe===0)&&!de(F+U,z+oe)){j=!0;break}}return Ie.set(ae,j),j},we=R(D,"hills",M["relief.hillFraction"],(F,z)=>be(F,z).hill,(F,z)=>!ee(F,z)&&!Ce(F,z)),ge=(F,z)=>!ee(F,z)&&!Ce(F,z)&&be(F,z).hill>=we,ve=Math.min(16,Math.max(3,Math.ceil(M["climate.coastalDecay"]*3))),Be=new Map;function Se(F,z){let ae=G(F,z);if(Be.has(ae))return Be.get(ae);if(ee(F,z))return Be.set(ae,0),0;let j=ve+1;e:for(let U=1;U<=ve;U++)for(let N=-U;N<=U;N++){let se=Math.max(-U,-N-U),oe=Math.min(U,-N+U);for(let Z=se;Z<=oe;Z++)if(Math.max(Math.abs(N),Math.abs(Z),Math.abs(N+Z))===U&&ee(F+N,z+Z)){j=U;break e}}return Be.set(ae,j),j}let De=new Map;function te(F,z){let ae=G(F,z);if(E.has(ae))return E.get(ae);let j=q(F,z),U=$(F,z),N=Se(F,z),se=a(U+M["climate.coastalHumidity"]*Math.exp(-N/M["climate.coastalDecay"])),oe=X(D,F,z,M);De.has(oe.id)||De.set(oe.id,{t:q(oe.x,oe.y),h:$(oe.x,oe.y)});let Z=De.get(oe.id),ce=M["biomes.regionClimateMix"],ke=a(Z.t*ce+j*(1-ce)),me=a(Z.h*ce+se*(1-ce)),Ge=Y(ke,me,M),He=y(D,F,z,M["geology.scale"],"soil"),Xe=be(F,z),$e=(Ge==="arid"&&M["geology.aridPatchMix"]>0?X(D,F,z,W):null)?.id.split(",").map(Number),nt=$e?b(D,$e[0],$e[1],"arid-patch"):null,bt={t:j,h:se,center:oe,family:Ge,soil:He,landRelief:Xe,aridPatch:nt,riverPotential:a(se*.68+Xe.mass*.18+Math.min(N,15)/30)};return E.set(ae,bt),bt}function ne(F,z){return ee(F,z)?o.some(([ae,j])=>!ee(F+ae,z+j))?"coastal_water":q(F,z)<M["water.iceTemperature"]?"icy_ocean":y(D,F,z,M["water.scale"]*.8,"storm")>1-M["water.stormChance"]?"stormy_ocean":"ocean":"land"}function le(F){let z=(ae,j)=>b(D,F.q,F.r,"feature:"+ae)<j/1e3;F.surfaceClass==="land"&&F.reliefClass!=="mountain"?(z("iron",M["features.ironPer1000"])&&te(F.q,F.r).landRelief.oreBelt>.3&&F.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(F.baseBiome)&&z("animals",M["features.animalsPer1000"])&&(F.baseBiome==="wetland"||F.baseBiome==="jungle"?F.features.push("pigs"):F.baseBiome==="savanna"||F.terrainId==="sparse_pasture"?F.features.push("horses"):F.features.push(b(D,F.q,F.r,"species")>.5?"pigs":"horses")),z("ruins",M["features.ruinsPer1000"])&&F.features.push("ruins"),z("obelisk",M["features.obelisksPer1000"])&&F.features.push("obelisk"),F.baseBiome==="arid"&&z("oasis",M["features.oasesPer1000"])&&F.features.push("oasis")):F.surfaceClass!=="land"&&z("wreck",M["features.wrecksPer1000"])&&F.features.push("wreck");for(let ae of u)ae.place({hex:F,config:M,seed:w,random:j=>b(D,F.q,F.r,ae.id+":"+j)})&&F.features.push(ae.id);return F}function Fe(F,z){let ae=ne(F,z),j=ae==="land",U=j?te(F,z):null,N=j&&Ce(F,z),se=j&&!N&&ge(F,z),oe=j?U.family==="jungle"?1:U.family==="grassland"?.86:U.family==="wetland"?.76:U.family==="savanna"?.46:U.family==="cold"?.25:.08:0,Z=j?(y(D,F,z,M["forest.patchScale"],"forest")-.5)*1.6+M["forest.coverage"]-.3+(U.h-.5)*.35:0,ce=N?0:U?.family==="jungle"?Math.max(.76,a(Z)):a(Z)*oe,ke=N?"none":U?.family==="jungle"||ce>=M["forest.denseThreshold"]*M["forest.denseFactor"]?"dense_forest":ce>M["forest.lightThreshold"]?"light_forest":"none";return{q:F,r:z,temperature:U?.t??q(F,z),humidity:U?.h??$(F,z),regionId:U?.center.id??"",baseBiome:U?.family??null,terrainId:j?A(U.family,U.t,U.h,U.soil,M,U.landRelief,U.aridPatch):ae,surfaceClass:ae,reliefClass:N?"mountain":se?"hills":"flat",hillProfile:se?["rounded","steep","chain","plateau","ridge"][Math.floor(b(D,Math.floor(F/3),Math.floor(z/3),"hill-style")*5)]:null,hillStrength:se?a(U.landRelief.hill*M["relief.hillVariation"]+(1-M["relief.hillVariation"])*.4):0,mountainClass:N?"massif":null,forestDensity:ce,forestClass:ke,riverPotential:U?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function Ue(F,z,ae,j){let U=M["rivers.maxLength"],N=M["rivers.minLength"],se=U+1,oe=2*U+2,Z=(he,ue)=>he>=F&&he<F+ae&&ue>=z&&ue<z+j,ce=F-oe,ke=z-oe,me=ae+2*oe,Ge=j+2*oe,He=new Int16Array(me*Ge);He.fill(-1);let Xe=new Int32Array(me*Ge),st=new Int32Array(me*Ge),$e=0,nt=0;for(let he=0;he<Ge;he++){let ue=ke+he,xe=he*me;for(let Re=0;Re<me;Re++){let ye=ce+Re;ee(ye,ue)&&(He[xe+Re]=0,Xe[nt]=ye,st[nt]=ue,nt++)}}for(;$e<nt;){let he=Xe[$e],ue=st[$e];$e++;let xe=He[(ue-ke)*me+(he-ce)];if(xe>=U)continue;let Re=xe+1;for(let ye=0;ye<6;ye++){let Ae=he+o[ye][0],_e=ue+o[ye][1],ze=Ae-ce,Ve=_e-ke;if(ze<0||ze>=me||Ve<0||Ve>=Ge)continue;let Je=Ve*me+ze;He[Je]>=0||Ce(Ae,_e)||(He[Je]=Re,Xe[nt]=Ae,st[nt]=_e,nt++)}}let bt=[],lt=new Map,Hr=M["rivers.sourcesPer100"]/100,Gr=d("river-source"),Or=d("river-turn"),ie=1/4294967296;function fe(he,ue){for(let[xe,Re]of[[he,ue],[ue,he]]){if(!Z(xe.q,xe.r)||ee(xe.q,xe.r))continue;let ye=o.findIndex(([ze,Ve])=>xe.q+ze===Re.q&&xe.r+Ve===Re.r);if(ye<0)continue;let Ae=G(xe.q,xe.r),_e=lt.get(Ae);_e||(_e=[],lt.set(Ae,_e)),_e.includes(ye)||_e.push(ye)}}for(let he=z-se;he<z+j+se;he++)for(let ue=F-se;ue<F+ae+se;ue++){if(m(D,ue,he,Gr)*ie>=Hr||He[(he-ke)*me+(ue-ce)]<N||ee(ue,he)||Ce(ue,he)||te(ue,he).riverPotential<.36)continue;let Re=[{q:ue,r:he}],ye={q:ue,r:he};for(let Ae=0;Ae<U;Ae++){let _e=He[(ye.r-ke)*me+(ye.q-ce)];if(_e<=0)break;let ze=null,Ve=1/0;for(let Je=0;Je<6;Je++){let et=ye.q+o[Je][0],Rt=ye.r+o[Je][1],rt=et-ce,St=Rt-ke;if(rt<0||rt>=me||St<0||St>=Ge||He[St*me+rt]!==_e-1)continue;let _t=be(et,Rt).hill*(1-M["rivers.meander"])+m(D,et,Rt,Or)*ie*M["rivers.meander"];_t<Ve&&(Ve=_t,ze={q:et,r:Rt})}if(!ze)break;ye=ze,Re.push(ye)}if(!(!ee(ye.q,ye.r)||Re.length-1<N)&&Re.some(Ae=>Z(Ae.q,Ae.r))){bt.push(Re.map(Ae=>[Ae.q,Ae.r]));for(let Ae=1;Ae<Re.length;Ae++)fe(Re[Ae-1],Re[Ae])}}for(let he of lt.values())he.sort((ue,xe)=>ue-xe);return{routes:bt,edgesByKey:lt}}function qe(F,z){return le(Fe(F,z))}return{c:M,s:D,spot:G,wet:ee,relief:be,isMountain:Ce,isHill:ge,field:te,surface:ne,buildBaseCell:Fe,attachFeatures:le,sampleCell:qe,traceRivers:Ue}}function re(w,I={}){if(typeof w!="string"||w.length<1||w.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let M=I.width===void 0?100:Number(I.width),D=I.height===void 0?80:Number(I.height),W=I.originQ===void 0?0:Number(I.originQ),f=I.originR===void 0?0:Number(I.originR);if(!Number.isSafeInteger(M)||!Number.isSafeInteger(D)||M<10||D<10||M*D>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(W)||!Number.isSafeInteger(f)||Math.abs(W)>1e6||Math.abs(f)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let v=H(w,I.config),{c:E,s:G,spot:q,wet:$,relief:V,isMountain:J,field:pe,buildBaseCell:ee,attachFeatures:be}=v,Ee=[],de=new Map;for(let U=f;U<f+D;U++)for(let N=W;N<W+M;N++){let se=ee(N,U);Ee.push(se),de.set(q(N,U),se)}let Ie=E["rivers.maxLength"],Ce=E["rivers.minLength"],we=Ie+1,ge=2*Ie+2,ve=new Map,Be=[];for(let U=f-ge;U<f+D+ge;U++)for(let N=W-ge;N<W+M+ge;N++)$(N,U)&&(ve.set(q(N,U),0),Be.push({q:N,r:U}));let Se=W-ge,De=W+M+ge-1,te=f-ge,ne=f+D+ge-1;for(let U=0;U<Be.length;U++){let N=Be[U],se=ve.get(q(N.q,N.r));if(!(se>=Ie))for(let[oe,Z]of o){let ce=N.q+oe,ke=N.r+Z,me=q(ce,ke);ce<Se||ce>De||ke<te||ke>ne||J(ce,ke)||ve.has(me)||(ve.set(me,se+1),Be.push({q:ce,r:ke}))}}let le=[],Fe=[];function Ue(U,N){for(let[se,oe]of[[U,N],[N,U]]){let Z=de.get(q(se.q,se.r));if(!Z||Z.surfaceClass!=="land")continue;Z.river=!0;let ce=o.findIndex(([ke,me])=>se.q+ke===oe.q&&se.r+me===oe.r);ce>=0&&!Z.riverEdges.includes(ce)&&Z.riverEdges.push(ce)}}for(let U=f-we;U<f+D+we;U++)for(let N=W-we;N<W+M+we;N++){if($(N,U)||J(N,U)||b(G,N,U,"river-source")>=E["rivers.sourcesPer100"]/100)continue;let se=ve.get(q(N,U));if(se===void 0||se<Ce||pe(N,U).riverPotential<.36)continue;let oe=[{q:N,r:U}],Z={q:N,r:U};for(let ce=0;ce<Ie;ce++){let ke=ve.get(q(Z.q,Z.r));if(ke===0)break;let me=o.map(([He,Xe])=>({q:Z.q+He,r:Z.r+Xe})).filter(He=>ve.get(q(He.q,He.r))===ke-1);if(!me.length)break;let Ge=He=>V(He.q,He.r).hill*(1-E["rivers.meander"])+b(G,He.q,He.r,"river-turn")*E["rivers.meander"];me.sort((He,Xe)=>Ge(He)-Ge(Xe)),Z=me[0],oe.push(Z)}if(!(!$(Z.q,Z.r)||oe.length-1<Ce)&&oe.some(ce=>de.has(q(ce.q,ce.r)))){Fe.push(oe),oe.every(ce=>de.has(q(ce.q,ce.r)))&&le.push(oe.map(ce=>[ce.q,ce.r]));for(let ce=1;ce<oe.length;ce++)Ue(oe[ce-1],oe[ce])}}for(let U of Ee)be(U),U.riverEdges.sort((N,se)=>N-se);let qe=Ee.filter(U=>U.surfaceClass==="land").length,F={total:Ee.length,land:qe,water:Ee.length-qe,coast:0,hills:0,mountains:0,rivers:le.length,riverCrossingCount:Fe.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},z=new Map;for(let U of Ee){U.surfaceClass==="coastal_water"&&F.coast++,U.reliefClass==="hills"&&F.hills++,U.reliefClass==="mountain"&&F.mountains++,U.river&&F.riverHexes++,U.forestClass!=="none"&&F.forest++,U.baseBiome&&(F.biomes[U.baseBiome]=(F.biomes[U.baseBiome]||0)+1,z.set(U.regionId,(z.get(U.regionId)||0)+1)),U.surfaceClass==="land"&&U.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(U.baseBiome)&&F.forestEligible++,F.terrains[U.terrainId]=(F.terrains[U.terrainId]||0)+1;for(let N of U.features)F.features[N]=(F.features[N]||0)+1}F.forestPercentLand=qe?+(100*F.forest/qe).toFixed(1):0,F.forestPercentEligible=F.forestEligible?+(100*F.forest/F.forestEligible).toFixed(1):0;let ae=[...z.values()].sort((U,N)=>U-N);F.biomeRegions={count:ae.length,min:ae[0]||0,average:ae.length?+(qe/ae.length).toFixed(1):0,median:ae.length?ae[Math.floor(ae.length/2)]:0,max:ae.at(-1)||0,within30to90:ae.filter(U=>U>=30&&U<=90).length};function j(U){let N=new Set,se=0;for(let oe of Ee){let Z=q(oe.q,oe.r);if(N.has(Z)||!U(oe))continue;let ce=[oe];N.add(Z);for(let ke=0;ke<ce.length;ke++)for(let me of C(ce[ke],de)){let Ge=q(me.q,me.r);U(me)&&!N.has(Ge)&&(N.add(Ge),ce.push(me))}se=Math.max(se,ce.length)}return se}return F.connectedLandPercent=qe?+(100*j(U=>U.surfaceClass==="land")/qe).toFixed(1):0,F.largestWaterBody=j(U=>U.surfaceClass!=="land"),{version:e,seed:w,width:M,height:D,originQ:W,originR:f,config:E,cells:Ee,riverPaths:le,riverPreviewPaths:Fe.map(U=>U.map(N=>[N.q,N.r])),stats:F,riverGeometry:"hex-edges"}}let O={VERSION:e,DIRS:o,TERRAIN_IDS:i,BIOME_IDS:n,parameterSchema:_,defaultConfig:B,normalizeConfig:k,aggregateDistributions:x,registerParameter:P,registerFeature:L,createPointSampler:H,generateWorld:re,getWorldCell:(w,I,M)=>{let D=w.originQ??0,W=w.originR??0;return I<D||M<W||I>=D+w.width||M>=W+w.height?null:w.cells[(M-W)*w.width+(I-D)]??null}};typeof or<"u"&&or.exports&&(or.exports=O),t.VedrasGeography=O})(typeof window<"u"?window:globalThis)});var qo=Nr(ir());var Ko=Math.sqrt(3),Ze=256/Ko,Te=.85,Ye=1.5*Ze,_n=Ye*Te,Pe=16,Me=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function We(t,e){return{x:256*(t+e*.5),y:_n*e}}function tt(t,e){let r=e/_n,o=t/256-r*.5,i=-o-r,n=Math.round(o),s=Math.round(r),u=Math.round(i),a=Math.abs(n-o),l=Math.abs(s-r),c=Math.abs(u-i);return a>l&&a>c?n=-s-u:l>c&&(s=-n-u),{q:n===0?0:n,r:s===0?0:s}}function je(t,e,r,o){let i=t-r,n=e-o;return(Math.abs(i)+Math.abs(i+n)+Math.abs(n))/2}function qt(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function Bt(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function Ut(t,e,r=Pe){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function xt(t,e){return`${t},${e}`}function Le(t,e){return`${t},${e}`}function Xr(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,i=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,s=-1/0,u=1/0,a=-1/0;for(let l of i){let c=tt(l.x,l.y);c.q<n&&(n=c.q),c.q>s&&(s=c.q),c.r<u&&(u=c.r),c.r>a&&(a=c.r)}return{minQ:n-e,maxQ:s+e,minR:u-e,maxR:a+e}}function Cn(t,e=Pe,r=3){let o=Xr(t,r),i=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),s=Math.floor(o.minR/e),u=Math.floor(o.maxR/e),a=tt(t.x,t.y),l=a.q/e,c=a.r/e,h=[];for(let d=s;d<=u;d++)for(let m=i;m<=n;m++){let p=m+.5-l,b=d+.5-c;h.push({cq:m,cr:d,dist2:p*p+b*b})}return h.sort((d,m)=>d.dist2-m.dist2),h.map(({cq:d,cr:m})=>({cq:d,cr:m}))}function Rn(t,e,r,o=0){let i=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return i=Math.imul(i^i>>>15,2246822519)>>>0,i=Math.imul(i^i>>>13,3266489917)>>>0,(i^i>>>16)>>>0}function zr(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function ar(t,e){let r=256*(t+e*.5),o=Ye*e,i=[];for(let n=0;n<6;n++){let s=-Math.PI/2+n*Math.PI/3;i.push({x:r+Ze*Math.cos(s),y:(o+Ze*Math.sin(s))*Te})}return i}function ct(t,e,r){let o=ar(t,e),i=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a:i,b:n,mid:{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}}function at(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Me[s][0]===i&&Me[s][1]===n)return s;return-1}function Qe(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function Mn(t,e){let r=tt(t,e),o=0,i=1/0;for(let l=0;l<6;l++){let{mid:c}=ct(r.q,r.r,l),h=t-c.x,d=e-c.y,m=h*h+d*d;m<i&&(i=m,o=l)}let[n,s]=Me[o],u=Qe(r.q,r.r,r.q+n,r.r+s),a=at(u.q1,u.r1,u.q2,u.r2);return{q1:u.q1,r1:u.r1,q2:u.q2,r2:u.r2,dir:a}}var ut={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},lr=new Set(["dead_trees","snow_dead_trees"]),Kr=new Set(["fallen_logs","snow_fallen_logs"]),jo=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),$o=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),sr=new Set(["snowfields","frozen_tundra","tundra","highland"]);var En=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),An=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),Et=new Set(["snowfields","frozen_tundra"]),Ht=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),jr=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),kn=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),Zo=new Set([...kn,"savanna","jungle"]);function ot(t,e,r){return t<e?e:t>r?r:t}function Q(t,e,r,o=0,i=97,n=513,s=11){let u=(t|0)^Math.imul(e+i,374761393)^Math.imul(r+n,668265263)^Math.imul(o+s,2246822519);return u^=u>>>13,u=Math.imul(u,1274126177),((u^u>>>16)>>>0)/4294967296}function Gt(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function Qo(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var Ot=new Set(["ocean","coastal_water","stormy_ocean"]);function Ct(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function cr(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function $r(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function Zr(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function ur(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function dr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function Qr(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function Wn(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:jr.has(t)?.14:0}function Jr(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*(Gt(t)?.32:.25):$o.has(t.family??"")?e:e*1.2}function fr(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"||e==="snow_mountains"}function Tt(t){if(!t||t.kind==="mountain")return 1;let e=Jr(t),r=t.family??"",o=Vt(t)==="cacti"?1.55:1;return lr.has(r)?.58*e:Kr.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.tags?.includes("round_cactus")||/^(?:existing_)?cactus_0?[12]$/.test(t.id??"")||t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_decal"?1.05:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function Fn(t){return!!t&&t.kind==="tree"&&!lr.has(t.family??"")}function Ln(t){return!!t&&jo.has(t.family??"")}function In(t){let e=t?.family??"";return lr.has(e)?"dead_trees":Kr.has(e)?"fallen_logs":null}function Dn(t){let e=t?.family??"";return lr.has(e)?.11:Kr.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function qn(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function Bn(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function Vt(t){let e=Bn(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}var Tn=new Set(["snowfields","frozen_tundra","tundra","highland"]),Jo=new Set(["highland","tundra","grassland","pasture","sparse_pasture","forest_floor","moor","marshland","swamp"]),Un=new Set(["desert","sandy_desert","rocky_desert","sandy_rocky_desert","clay_desert","badlands","sandy_badlands","rocky_badlands","semi_desert","wasteland","savanna","dry_ground"]),ei=new Set([...kn,"forest_floor","highland","jungle",...Un]);function Hn(t){if(!t||t.kind!=="mountain")return!1;let e=String(t.id??"");if(t.family==="snow_mountains"||/^snow_mountain_\d+$/.test(e)||/^(?:existing_)?berg_(?:0?[1-9]|1[0-6])$/.test(e))return!0;let r=t.tags??[];return r.includes("arctic_snow_mountain")||r.includes("alpine_snow_mountain")||r.includes("snow_tipped_mountain")}function Nt(t){let e=String(t.id??""),r=Bn(t);return Ct(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?Ot:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||dr(t)?jr:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?sr:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?En:Qo(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?sr:Gt(t)?En:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?Zo:/^snow_mountain_\d+$/.test(e)||t.family==="snow_mountains"||/^(?:existing_)?berg_(?:1[4-6])$/.test(e)||/^(?:existing_)?berg_0?[1-4]$/.test(e)?Tn:/^(?:existing_)?berg_(?:0?[5-9]|1[0-3])$/.test(e)?Jo:/^desert_mountain_\d+$/.test(e)||t.family==="desert_mountains"?Un:/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?ei:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function Gn(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,i=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),s=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),u=new Set;for(let[a,l]of Object.entries(e.terrain.byType))s.has(a)||(l.categoryId&&i.has(l.categoryId)||n.has(a))&&u.add(a);return u}function Yr(t,e,r,o,i,n=!1){if(!e)return!1;let s=o.terrain.byType[e];if(Ct(t))return Ot.has(e);if(s&&s.materialClass!=="ground")return!1;let a=i?i.ecoFamily:Vt(t),l=e,c=i?i.strict:Nt(t);if(c)return c.has(l);let h=n||r.some(b=>{let g=o.terrain.byType[b]?.materialClass;return g==="water"||g==="shoreline"}),d=r.some(b=>b==="jungle"||b==="savanna"),m=r.some(b=>b==="moor"||b==="swamp"||b==="marshland");if(a==="mangroves")return(l==="swamp"||l==="marshland")&&(h||d);if(a==="palms")return l==="jungle"||l==="savanna"||l==="tropical_coast"||Ht.has(l);if(a==="jungle_trees"||a==="tropical_bushes")return l==="jungle";if(a==="savanna_trees")return l==="savanna"||l==="semi_desert"||Qr(t)&&Ht.has(l);if(a==="cacti")return l==="rocky_desert"||l==="sandy_desert"||l==="clay_desert"||l==="desert"||l==="semi_desert"||l==="sandy_rocky_desert"||l==="savanna";if(a==="succulents")return l==="savanna"||l==="semi_desert"||l==="rocky_desert"||l==="sandy_desert"||l==="sandy_rocky_desert"||l==="badlands"||l==="desert";if(a==="ferns")return l==="forest_floor"||l==="grassland"||l==="pasture"||l==="moor"||l==="swamp"||l==="marshland"||l==="jungle";if(a==="reeds")return l==="moor"||l==="swamp"||l==="marshland"||(l==="grassland"||l==="pasture"||l==="sparse_pasture")&&(h||m);if(a==="cold_bushes")return l==="tundra"||l==="frozen_tundra"||l==="highland";if(a==="snow_conifers"||a==="snow_dead_trees"||a==="snow_deadwood"||a==="snow_fallen_logs")return sr.has(l);if(a==="riparian_trees")return l==="moor"||l==="swamp"||l==="marshland"||(l==="grassland"||l==="pasture")&&(h||m);let p=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(l==="snowfields"||l==="frozen_tundra")&&!p?!1:a==="dry_patches"?jr.has(l):$r(t)?!(l==="jungle"||l==="moor"||l==="swamp"||l==="marshland"||l==="snowfields"||l==="frozen_tundra"):a==="dry_bushes"?!(l==="jungle"||l==="moor"||l==="swamp"||l==="marshland"||l==="tundra"||l==="highland"):a==="herbs"?!(l==="jungle"||l==="swamp"||l==="marshland"||l==="ocean"||l==="snowfields"||l==="frozen_tundra"):a==="flowering_bushes"||a==="temperate_bushes"||a==="heath"?!(l==="jungle"||l==="rocky_desert"||l==="sandy_desert"||l==="clay_desert"):!0}function On(t,e,r,o,i){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,s=r.biome||n;if(Ct(t))return Ot.has(n)&&e.has(n);if(Gt(t)&&(n==="jungle"||s==="jungle"))return!1;let u=o.terrain.byType[n],a=o.terrain.byType[s];if(u?.materialClass!=="ground"||a?.materialClass!=="ground")return!1;let l=i?i.strict:Nt(t);if(l){if(!l.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let c=n==="jungle"||n==="savanna",h=r.forestClass==="light_forest"||r.forestClass==="dense_forest",d=i?i.ecoFamily:Vt(t),m=s==="jungle",p=n==="moor"||n==="swamp"||n==="marshland";if(m&&!c||t.family==="palms"&&(!(c||Ht.has(n))||p||sr.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!m||h&&(d==="cacti"||d==="succulents"||d==="dry_bushes")||!(e.has(s)||e.has(n)||h&&e.has("forest_floor")&&t.family!=="palms"))return!1;let g=!!r.hasRiverEdge;return l?Yr(t,n,r.neighborTypes,o,i,g):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!Yr(t,n,r.neighborTypes,o,i,g)?!1:Yr(t,s,r.neighborTypes,o,i,g)}function Vn(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let i=o.terrain.byType[r];if(!i||i.materialClass!=="ground")return!1;let n=Nt(t);return n&&!n.has(r)?!1:e.has(r)}function ti(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function Pn(t,e,r){let o=e/3,i=r/3,n=Math.floor(o),s=Math.floor(i),u=o-n,a=i-s,l=u*u*(3-2*u),c=a*a*(3-2*a),h=Q(t,n,s,2301,8191,4093,17),d=Q(t,n+1,s,2301,8191,4093,17),m=Q(t,n,s+1,2301,8191,4093,17),p=Q(t,n+1,s+1,2301,8191,4093,17);return 2*((h+(d-h)*l)*(1-c)+(m+(p-m)*l)*c)-1}function Nn(t,e,r,o){let i=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:ut.mode,s=ot(o?.canopyCover??ut.canopyCover,.35,.98),u=ot(o?.canopyVariation??ut.canopyVariation,0,.3),a=ot(o?.gladeRate??ut.gladeRate,0,.3),l=ot(o?.edgeStrength??ut.edgeStrength,0,1);for(let c of t){let h=Le(c.q,c.r),d=c.terrainId==="jungle",m=ti(c.terrainId,e),p=ot(c.forestDensity||0,0,1),b,g;if(d){let S=.5+.5*Pn(r+137,c.q,c.r),T=.5+.5*Math.sin(c.q*.62-c.r*.44+r%71)*Math.cos(c.q*.37+c.r*.71),y=ot(.46+.42*S+.14*T,.36,.98),_=p>.01?ot(p*(.68+.34*y),.32,.98):y;b=_>=.62?"dense_forest":"light_forest",g=_}else b=c.forestClass??(c.forestDensity>=.65?"dense_forest":c.forestDensity>.08?"light_forest":"none"),g=b==="none"?0:p>.01?p:b==="dense_forest"?1:.44;i.set(h,{q:c.q,r:c.r,key:h,baseBiome:c.terrainId,biome:d?"jungle":c.terrainId,jungle:d,suitability:m,forestMode:n,forestClass:m>0?b:"none",baseDensity:m>0?g:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let c of i.values()){if(!c.suitability)continue;let h=0;for(let[d,m]of Me){let p=i.get(Le(c.q+d,c.r+m));p&&p.baseDensity>h&&(h=p.baseDensity)}c.edgeInfluence=ot(h*(c.baseDensity?.18:.48)*l*c.suitability,0,.46),c.density=ot(c.baseDensity+c.edgeInfluence,0,1)}if(n==="canopy"&&a>0){let c=ot(a*.55,0,.19),h=[];for(let d of i.values()){if(d.forestClass!=="dense_forest")continue;let m=0;for(let[S,T]of Me)i.get(Le(d.q+S,d.r+T))?.forestClass==="dense_forest"&&m++;if(m<2)continue;let p=Q(r,d.q,d.r,1864,8191,4093,17),b=d.jungle?c*.62:c;if(p>=b)continue;let g=!1;for(let S=-2;S<=2&&!g;S++)for(let T=-2;T<=2;T++){if(T===0&&S===0||Math.abs(T+S)>2)continue;let y=i.get(Le(d.q+T,d.r+S));if(!(!y||y.forestClass!=="dense_forest")&&Q(r,y.q,y.r,1864,8191,4093,17)<p){g=!0;break}}g||h.push(d)}for(let d of h){d.glade=!0;let m=d.jungle?.45:.84;if(Q(r,d.q,d.r,1954,8191,4093,17)<m){let p=null,b=1/0;for(let[g,S]of Me){let T=i.get(Le(d.q+g,d.r+S));if(!T||T.forestClass!=="dense_forest"||T.jungle!==d.jungle)continue;let y=Q(r,T.q,T.r,1953,8191,4093,17);y<b&&(b=y,p=T)}p&&(p.glade=!0)}}}for(let c of i.values()){if(!c.suitability)continue;if(c.glade){c.gladeX=Math.round((Q(r,c.q,c.r,2041,8191,4093,17)-.5)*52),c.gladeY=Math.round((Q(r,c.q,c.r,2042,8191,4093,17)-.5)*40);let p=c.jungle?46:58;c.gladeRadius=p+Math.round(Q(r,c.q,c.r,2043,8191,4093,17)*18)}let h=c.forestClass==="dense_forest"?1:c.forestClass==="light_forest"?c.jungle?.62:.49:c.edgeInfluence>.08?.17:0,d=Pn(r,c.q,c.r),m=ot(s+u*d,.12,.98);c.canopyCoverage=ot(m*h*(.58+.42*c.density)*c.suitability*(c.glade?c.jungle?.34:.24:1),0,.98)}return i}function Xn(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function zn(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function en(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,i=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return i*i+n*n<.94*.94}function Yn(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function Xt(t,e,r,o){let i=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*Q(t,e,r,i,173,311,79);for(let[s,u]of Me)n+=.5/6*Q(t,e+s,r+u,i,173,311,79);return ot(1+(n-.5)*1.5,.6,1.4)}function Kn(t,e,r,o,i,n){let u=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,a=(Q(t,e,r,u,173,311,79)-.5)*154,l=(Q(t,e,r,u+1,173,311,79)-.5)*146,c=Q(t,e,r,i*127+n*2+17,173,311,79),h=Q(t,e,r,i*127+n*2+18,173,311,79),d=(c-.5)*242,m=(h-.5)*258,p=n>=26?0:o==="tree"?.43:.68,b=o==="tree"?170:126,g=a+(c-.5)*b,S=l+(h-.5)*b;return{dx:d*(1-p)+g*p,dy:m*(1-p)+S*p}}function hr(t,e,r=0){let o=Math.abs(t),i=Math.abs(e);return i<=Ze-r&&o<=Math.min(128,Math.sqrt(3)*(Ze-i))-r}function jn(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:Q(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var pr=128,Yt=78,At={enabled:!0,strength:Yt,lighting:!0,style:"sculpted"},rn=168,nn=127,zt=rn+nn;function ft(t,e,r){return t<e?e:t>r?r:t}function Pt(t){let e=ft(t,0,1);return e*e*(3-2*e)}function $n(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function mr(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function tn(t,e,r){let o=Math.floor(t),i=Math.floor(e),n=t-o,s=e-i,u=n*n*n*(n*(n*6-15)+10),a=s*s*s*(s*(s*6-15)+10),l=mr(o,i,r),c=mr(o+1,i,r),h=mr(o,i+1,r),d=mr(o+1,i+1,r);return(l+(c-l)*u)*(1-a)+(h+(d-h)*u)*a}function ri(t,e,r){let o=tn(t/380,e/380,r^324508639),i=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,s=tn(i,n,r^610839777),u=(t*.3255682-e*.9455186)/105,a=(t*.9455186+e*.3255682)/105,l=tn(u,a,r^916255320);return{plainSwell:o*.78+s*.22,ridgeDetail:o*.34+s*.46+l*.2}}function Zn(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function ni(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let i=r?.categoryId??"";return(i==="wetlands"?.3:i==="cold_regions"?.25:i==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function Qn(t,e,r,o=Yt,i="sculpted"){let n=[],s=[];for(let a=0;a<t.length;a++){let l=t[a],c=256*(l.q+l.r*.5),h=Ye*l.r;if(Zn(l,e)){s.push({x:c,y:h});continue}if(l.reliefClass!=="hills")continue;let d=ft(l.hillStrength??.7,0,1);if(d<=0)continue;let m=(Math.imul(l.q,73856093)^Math.imul(l.r,19349663)^r)>>>0,p=($n(m)-.5)*1.7,b=l.hillProfile||"rounded",g=b==="ridge"||b==="chain"?560:440;n.push({x:c,y:h,ca:Math.cos(p),sa:Math.sin(p),shape:b,weight:.42+.58*d,reach:g})}let u=o>0?i==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:s,strengthPct:o,heightGain:u,seedInt:r,style:i}}function Jn(t,e,r){let o=e*t.ca+r*t.sa,i=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(i/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(i/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,i/158),3.1)):t.shape==="plateau"?1-Pt((Math.hypot(o/188,i/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(i/180)**2))}function eo(t,e,r,o,i,n,s,u){if(n<=0||e<=.004)return 0;if(u==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:a,ridgeDetail:l}=ri(r,o,s),c=Math.max(0,a-.38)*14*(i/100)*e;if(t<=1e-4)return c;let h=1-Math.exp(-t*.76),d=n*h*(.76+.42*l)*e;return Math.min(pr,d+c*.55)}function to(t,e,r){if(t.heightGain<=0)return 0;let o=0,i=t.waters,n=zt*zt;for(let l=0;l<i.length;l++){let c=i[l],h=e-c.x,d=r-c.y;if(Math.abs(h)>zt||Math.abs(d)>zt)continue;let m=h*h+d*d;if(m<n){let p=1-Pt((Math.sqrt(m)-rn)/nn);p>o&&(o=p)}}let s=1-o;if(s<=.004)return 0;let u=0,a=t.hills;for(let l=0;l<a.length;l++){let c=a[l],h=e-c.x,d=r-c.y;Math.abs(h)>c.reach||Math.abs(d)>c.reach||(u+=Jn(c,h,d)*c.weight)}return eo(u,s,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function ro(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),i=t.width/(r-1),n=t.height/(o-1),s=1/i,u=1/n,a=r*o,l=new Float32Array(a),c=new Float32Array(a),h=new Float32Array(a),d=new Float32Array(a),m=new Float32Array(a),p=new Float32Array(a),b=new Float32Array(a),g=520,S=Math.floor((t.top-g)/Ye)-2,T=Math.ceil((t.top+t.height+g)/Ye)+2,y=t.reliefStyle??"sculpted",_=t.reliefStrength??Yt,B=_>0?y==="sculpted"?112*(_/100):67*(_/100)*1.2:0,k=(L,C,A,Y,X,K)=>{let R=Math.max(0,Math.floor((C-K-t.left)*s)),H=Math.min(r-1,Math.ceil((C+K-t.left)*s)),re=Math.max(0,Math.floor((A-K-t.top)*u)),O=Math.min(o-1,Math.ceil((A+K-t.top)*u)),w=K*K;for(let I=re;I<=O;I++){let M=t.top+I*n-A,D=M*M,W=I*r;for(let f=R;f<=H;f++){let v=t.left+f*i-C,E=v*v+D;if(E>=w)continue;let G=1-Pt((Math.sqrt(E)-Y)/X);G>L[W+f]&&(L[W+f]=G)}}};for(let L=S;L<=T;L++){let C=Math.floor((t.left-g)/256-L*.5)-2,A=Math.ceil((t.left+t.width+g)/256-L*.5)+2;for(let Y=C;Y<=A;Y++){let X=t.lookupHex(Y,L);if(!X||X.fogState===0)continue;let K=256*(Y+L*.5),R=Ye*L;if(Zn(X,t.manifest)){k(h,K,R,rn,nn,zt),k(d,K,R,108,48,160);continue}if((X.terrainId==="snowfields"||X.terrainId==="frozen_tundra"||X.terrainId==="jungle")&&k(d,K,R,108,48,160),B>0&&X.reliefClass==="hills"){let O=ft(X.hillStrength??.7,0,1);if(O>0){let w=(Math.imul(Y,73856093)^Math.imul(L,19349663)^t.seedInt)>>>0,I=($n(w)-.5)*1.7,M=X.hillProfile||"rounded",D=M==="ridge"||M==="chain"?560:440,W={x:K,y:R,ca:Math.cos(I),sa:Math.sin(I),shape:M,weight:.42+.58*O,reach:D},f=Math.max(0,Math.floor((K-D-t.left)*s)),v=Math.min(r-1,Math.ceil((K+D-t.left)*s)),E=Math.max(0,Math.floor((R-D-t.top)*u)),G=Math.min(o-1,Math.ceil((R+D-t.top)*u));for(let q=E;q<=G;q++){let $=t.top+q*n-R,V=q*r;for(let J=f;J<=v;J++){let pe=t.left+J*i-K,ee=Jn(W,pe,$);ee>1e-4&&(l[V+J]+=ee*W.weight)}}}}let re=ni(X,t.manifest);if(re>.01){let w=Math.max(0,Math.floor((K-172-t.left)*s)),I=Math.min(r-1,Math.ceil((K+172-t.left)*s)),M=Math.max(0,Math.floor((R-172-t.top)*u)),D=Math.min(o-1,Math.ceil((R+172-t.top)*u)),W=29584;for(let f=M;f<=D;f++){let v=t.top+f*n-R,E=v*v,G=f*r;for(let q=w;q<=I;q++){let $=t.left+q*i-K,V=$*$+E;if(V>=W)continue;let J=1-Pt((Math.sqrt(V)-110)/56);if(J>0){let pe=G+q,ee=m[pe]+J*1.15;m[pe]=ee>1?1:ee,re>p[pe]&&(p[pe]=re)}}}if(X.glade){let f=K+(X.gladeX??0),v=R+(X.gladeY??0),E=X.gladeRadius??64,G=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[q,$,V]of G){let J=f+E*q,pe=v+E*$,ee=E*V,be=ee*ee,Ee=Math.max(0,Math.floor((J-ee-t.left)*s)),de=Math.min(r-1,Math.ceil((J+ee-t.left)*s)),Ie=Math.max(0,Math.floor((pe-ee-t.top)*u)),Ce=Math.min(o-1,Math.ceil((pe+ee-t.top)*u));for(let we=Ie;we<=Ce;we++){let ge=t.top+we*n-pe,ve=ge*ge,Be=we*r;for(let Se=Ee;Se<=de;Se++){let De=t.left+Se*i-J,te=De*De+ve;if(te>=be)continue;let ne=1-Pt((Math.sqrt(te)-ee*.14)/(ee*.86)),le=Be+Se;ne>b[le]&&(b[le]=ne)}}}}}}}for(let L=0;L<o;L++){let C=t.top+L*n,A=L*r;for(let Y=0;Y<r;Y++){let X=A+Y,K=1-h[X];if(K<=.004||B<=0)continue;let R=t.left+Y*i;c[X]=eo(l[X],K,R,C,_,B,t.seedInt,y)}}let x=new Uint8Array(a*4),P=Math.max(1,(i+n)*.5);for(let L=0;L<o;L++){let C=L>0?L-1:0,A=L<o-1?L+1:o-1,Y=Math.max(1,(A-C)*n),X=L*r;for(let K=0;K<r;K++){let R=K>0?K-1:0,H=K<r-1?K+1:r-1,re=Math.max(1,(H-R)*i),O=X+K,w=c[O],I=c[X+R],M=c[X+H],D=c[C*r+K],W=c[A*r+K],f=(M-I)/re,v=(W-D)/Y,E;if(y==="sculpted"){let V=((I+M+D+W)*.25-w)/P,J=ft(-V*1.45,-.1,.12);E=ft(1-2.45*f-.65*v+J,.6,1.36)}else E=ft(1-2.15*f-.48*v,.66,1.32);let G=1-d[O],q=m[O]>.01&&G>.01?Pt((m[O]-.12)/.72)*p[O]*(1-b[O]*.94)*G:0,$=O*4;x[$]=Math.round(ft(w/pr,0,1)*255),x[$+1]=Math.round(ft((E-.52)/.96,0,1)*255),x[$+2]=Math.round(ft(q,0,1)*255),x[$+3]=Math.round(ft(1-h[O],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:x,heights:c}}function no(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),i=(r-t.top)/t.height*(t.rows-1);if(o<0||i<0||o>=t.cols-1||i>=t.rows-1)return 0;let n=Math.floor(o),s=Math.floor(i),u=o-n,a=i-s,l=s*t.cols+n,c=t.heights[l],h=t.heights[l+1],d=t.heights[l+t.cols],m=t.heights[l+t.cols+1];return(c*(1-u)+h*u)*(1-a)+(d*(1-u)+m*u)*a}var on=65536,gr=16,ht={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function oi(t){if(!t)return ht.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?ht.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?ht.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?ht.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?ht.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?ht.forest:r==="hills"?ht.rock:ht.earth}var ii=`#version 300 es
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
`,ai=`#version 300 es
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
`;function jt(t,e){return{x:256*(t+e*.5),y:Ye*e}}function Wt(t,e){let r=jt(t,e),o=[];for(let i=0;i<6;i++){let n=-Math.PI/2+i*Math.PI/3;o.push({x:r.x+Ze*Math.cos(n),y:r.y+Ze*Math.sin(n)})}return o}function Kt(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Me[s][0]===i&&Me[s][1]===n)return s;return-1}function si(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function oo(t,e){for(let r=0;r<6;r++)if(si(t[r],e))return r;return-1}function kt(t,e,r,o){let i=Wt(t,e),n=oo(i,r),s=oo(i,o);if(n<0||s<0)return[r,o];let u=(s-n+6)%6,a=(n-s+6)%6,l=u<=a?1:-1,c=Math.min(u,a),h=[];for(let d=0;d<=c;d++)h.push(i[(n+l*d+12)%6]);return h}function an(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],i=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let u=1;u<n;u++){let a=t[u-1],l=t[u],c=t[u+1],h=l.x-a.x,d=l.y-a.y,m=c.x-l.x,p=c.y-l.y,b=Math.hypot(h,d),g=Math.hypot(m,p);if(b<1e-4||g<1e-4)continue;if((h*m+d*p)/(b*g)>.995){o.push(l);continue}let T=Math.min(b*.16,g*.16,Math.max(12,i*.85)),y={x:l.x-h/b*T,y:l.y-d/b*T},_={x:l.x+m/g*T,y:l.y+p/g*T};o.push(y);for(let B=1;B<6;B++){let k=B/6,x=1-k;o.push({x:x*x*y.x+2*x*k*l.x+k*k*_.x,y:x*x*y.y+2*x*k*l.y+k*k*_.y})}o.push(_)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let s=[];for(let u=0;u<o.length;u++)(u===0||Math.hypot(o[u].x-s[s.length-1].x,o[u].y-s[s.length-1].y)>1e-4)&&s.push(o[u]);return s}function io(t,e){let r=tt(t.x,t.y*Te),o=Ze*1.15,i=[];for(let n=-1;n<6;n++){let s=n<0?r.q:r.q+Me[n][0],u=n<0?r.r:r.r+Me[n][1],a=jt(s,u);Math.hypot(t.x-a.x,t.y-a.y)<=o&&e(s,u)&&i.push(a)}return i}function $t(t,e=34,r){let o=t.hexes;if(!o||o.length<2)return null;let i=o.length-1,n=[];for(let R=0;R<i;R++){let[H,re]=o[R],[O,w]=o[R+1],I=Kt(H,re,O,w);if(I<0)return null;let M=Wt(H,re);n.push([M[I],M[(I+1)%6]])}let s=Kt(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,a=Wt(o[0][0],o[0][1])[u],l=n.map(()=>[1/0,1/0]),c=n.map(()=>[0,0]);for(let R=0;R<2;R++)l[0][R]=kt(o[0][0],o[0][1],a,n[0][R]).length-1;for(let R=1;R<i;R++)for(let H=0;H<2;H++)for(let re=0;re<2;re++){let O=kt(o[R][0],o[R][1],n[R-1][re],n[R][H]).length-1,w=l[R-1][re]+O;w<l[R][H]&&(l[R][H]=w,c[R][H]=re)}let h=new Array(i),d=l[i-1][0]<=l[i-1][1]?0:1;for(let R=i-1;R>=0;R--)h[R]=n[R][d],d=c[R][d];let m=[];for(let R=0;R<i;R++){let H=R===0?a:h[R-1],re=h[R],O=kt(o[R][0],o[R][1],H,re);for(let w=0;w<O.length;w++)(m.length===0||Math.hypot(O[w].x-m[m.length-1].x,O[w].y-m[m.length-1].y)>1e-4)&&m.push(O[w])}if(m.length<2)return null;let p=o[i-1],b=o[i];if(Kt(p[0],p[1],b[0],b[1])<0)return null;let S=m.length-1,T=jt(b[0],b[1]);if(r)for(let R=1;R<m.length;R++){let H=io(m[R],r);if(H.length>0){S=R;let re=0,O=0;for(let w=0;w<H.length;w++)re+=H[w].x,O+=H[w].y;T={x:re/H.length,y:O/H.length};break}}let y=m.slice(0,S+1),_=y[y.length-1],B=T.x-_.x,k=T.y-_.y,x=Math.hypot(B,k)||1,P=B/x,L=k/x,C=Math.max(54,e*2.15),A={x:_.x+P*C,y:_.y+L*C};y.push(A);let Y=an(y,e,!1);if(Y.length<2)return null;let X=Y.length-2,K=1/0;for(let R=0;R<Y.length;R++){let H=(Y[R].x-_.x)**2+(Y[R].y-_.y)**2;H<K&&(K=H,X=R)}return{id:t.id,points:Y,mouthCrossIdx:X,mouthCrossPos:_,mouthDirX:P,mouthDirY:L,mouthReach:C,width:e,hasMouth:!0}}function ao(t,e){let r=new Set,o=t.hexes;if(!o||o.length<2)return r;let i=o.length-1,n=[];for(let g=0;g<i;g++){let[S,T]=o[g],[y,_]=o[g+1],B=Kt(S,T,y,_);if(B<0)return r;let k=Wt(S,T);n.push([k[B],k[(B+1)%6]])}let s=Kt(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,a=Wt(o[0][0],o[0][1])[u],l=n.map(()=>[1/0,1/0]),c=n.map(()=>[0,0]);for(let g=0;g<2;g++)l[0][g]=kt(o[0][0],o[0][1],a,n[0][g]).length-1;for(let g=1;g<i;g++)for(let S=0;S<2;S++)for(let T=0;T<2;T++){let y=kt(o[g][0],o[g][1],n[g-1][T],n[g][S]).length-1,_=l[g-1][T]+y;_<l[g][S]&&(l[g][S]=_,c[g][S]=T)}let h=new Array(i),d=l[i-1][0]<=l[i-1][1]?0:1;for(let g=i-1;g>=0;g--)h[g]=n[g][d],d=c[g][d];let m=[];for(let g=0;g<i;g++){let S=g===0?a:h[g-1],T=h[g],y=kt(o[g][0],o[g][1],S,T);for(let _=0;_<y.length;_++)(m.length===0||Math.hypot(y[_].x-m[m.length-1].x,y[_].y-m[m.length-1].y)>1e-4)&&m.push(y[_])}if(m.length<2)return r;let p=m.length-1;if(e){for(let g=1;g<m.length;g++)if(io(m[g],e).length>0){p=g;break}}let b=256*.56;for(let g=0;g<p;g++){let S=(m[g].x+m[g+1].x)*.5,T=(m[g].y+m[g+1].y)*.5,y=tt(S,T*Te),_=[];for(let B=-1;B<6;B++){let k=B<0?y.q:y.q+Me[B][0],x=B<0?y.r:y.r+Me[B][1],P=jt(k,x),L=Math.hypot(S-P.x,T-P.y);L<=b&&_.push({q:k,r:x,d:L})}if(_.sort((B,k)=>B.d-k.d),_.length>=2){let B=_[0],k=_[1],P=B.q<k.q||B.q===k.q&&B.r<=k.r?`${B.q},${B.r}|${k.q},${k.r}`:`${k.q},${k.r}|${B.q},${B.r}`;r.add(P)}}return r}function sn(t,e=34){if(!t||t.length===0)return[];let r=a=>`${Math.round(a.x*2)},${Math.round(a.y*2)}`,o=[],i=new Set,n=new Map;for(let a of t){let l=(a.dir%6+6)%6,c=Wt(a.q,a.r),h=c[l],d=c[(l+1)%6],m=r(h),p=r(d),b=m<p?`${m}|${p}`:`${p}|${m}`;if(i.has(b))continue;i.add(b);let g=o.length;o.push({a:h,b:d,ka:m,kb:p,used:!1});let S=n.get(m)??[];S.push(g),n.set(m,S);let T=n.get(p)??[];T.push(g),n.set(p,T)}let s=[],u=(a,l)=>{let c=o[a];c.used=!0;let h=l?[c.a,c.b]:[c.b,c.a],d=l?c.kb:c.ka;for(;;){let m=n.get(d);if(!m)break;let p=-1;for(let g of m)if(!o[g].used){p=g;break}if(p<0)break;let b=o[p];b.used=!0,b.ka===d?(h.push(b.b),d=b.kb):(h.push(b.a),d=b.ka)}return h};for(let a=0;a<2;a++)for(let l=0;l<o.length;l++)if(!o[l].used)if(a===0){let c=n.get(o[l].ka)?.length??0,h=n.get(o[l].kb)?.length??0;if(c!==1&&h!==1)continue;let d=u(l,c===1);s.push({id:`edge_${l}`,points:an(d,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let c=u(l,!0);s.push({id:`edge_${l}`,points:an(c,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return s}var br=class{constructor(e){this.verts=new Float32Array(on*gr);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,ii),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,ai),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate river program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=gr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,u,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,u,48),e.bindVertexArray(null);let a=l=>{let c=e.getUniformLocation(i,l);if(!c)throw new Error(`Missing river uniform: ${l}`);return c};this.uCamCenter=a("u_camCenter"),this.uViewportSize=a("u_viewportSize"),this.uZoom=a("u_zoom"),this.uCoastalWaterLayer=a("u_coastalWaterLayer"),this.uTime=a("u_time"),this.uWindEnabled=a("u_windEnabled"),this.uPassMode=a("u_passMode"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0)}getCachedCourse(e,r=34,o){let i=`${e.id}@${r}@${o?"w":"0"}`;if(this.courseCache.has(i))return this.courseCache.get(i)??null;let n=$t(e,r,o);if(this.courseCache.set(i,n),this.courseCache.size>512){let s=this.courseCache.keys().next().value;s!==void 0&&this.courseCache.delete(s)}return n}pushVertex(e,r,o,i,n,s,u,a,l,c,h,d,m){if(this.vertCount>=on)return;let p=this.vertCount*gr,b=this.verts;b[p++]=e,b[p++]=r,b[p++]=o,b[p++]=i,b[p++]=n,b[p++]=s,b[p++]=u,b[p++]=a,b[p++]=l,b[p++]=c,b[p++]=h,b[p++]=d,b[p++]=m.r,b[p++]=m.g,b[p++]=m.b,b[p++]=m.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return ht.earth;let i=tt(e,r*Te),n=0,s=0,u=0,a=0,l=0;for(let c=-1;c<6;c++){let h=c<0?i.q:i.q+Me[c][0],d=c<0?i.r:i.r+Me[c][1],m=o(h,d);if(!m)continue;let p=m.terrainId;if(p==="ocean"||p==="coastal_water"||p==="stormy_ocean"||p==="icy_ocean")continue;let b=jt(h,d),g=Math.hypot(e-b.x,r-b.y);if(g>380)continue;let S=Math.max(0,Math.min(1,1-Math.max(0,g-35)/345)),T=S*S*(3-2*S),y=T*T,_=oi(m);s+=_.r*y,u+=_.g*y,a+=_.b*y,l+=_.rock*y,n+=y}return n<1e-4?ht.earth:{r:s/n,g:u/n,b:a/n,rock:l/n}}emitCourse(e,r,o,i,n){let s=e.points,u=s.length;if(u<2)return;let a=e.width*.5*n,l=e.mouthCrossPos??(e.hasMouth&&e.mouthCrossIdx>=0?s[e.mouthCrossIdx]:null),c=e.hasMouth?s[u-1]:null,h=l&&c?c.x-l.x:0,d=l&&c?c.y-l.y:0,m=Math.hypot(h,d)||1,p=e.mouthDirX??h/m,b=e.mouthDirY??d/m,g=Math.max(24,e.mouthReach??m),S=new Float32Array(u);for(let C=1;C<u;C++)S[C]=S[C-1]+Math.hypot(s[C].x-s[C-1].x,s[C].y-s[C-1].y);let T=Math.max(1,S[u-1]),y=new Float32Array(u),_=new Float32Array(u),B=new Float32Array(u),k=new Float32Array(u),x=new Array(u);for(let C=0;C<u;C++){let A=s[C>0?C-1:0],Y=s[C<u-1?C+1:u-1],X=Y.x-A.x,K=Y.y-A.y,R=Math.hypot(X,K)||1;y[C]=X/R,_[C]=K/R,B[C]=-K/R,k[C]=X/R,x[C]=this.sampleBankPalette(s[C].x,s[C].y,i)}let P=(C,A,Y)=>{let X=r(C,A),K=C,R=(A-X)*Te,H=S[Y]/T,re=a*(e.hasMouth?.68+.4*H:1),O=1,w=1;if(e.hasMouth&&S[Y]<26){let W=Math.max(0,Math.min(1,S[Y]/26)),f=W*W*(3-2*W);O*=f,w*=f,re*=.58+.42*f}else if(!e.hasMouth){let W=Math.min(S[Y],T-S[Y]);if(W<18){let f=Math.max(0,Math.min(1,W/18)),v=f*f*(3-2*f);O*=v,w*=v,re*=.72+.28*v}}if(l&&e.hasMouth){let W=(C-l.x)*p+(A-l.y)*b,f=Math.max(0,Math.min(1,(W+28)/(28+g*.72))),v=f*f*(3-2*f);re*=1+.48*v;let E=Math.max(0,Math.min(1,W/g));O*=1-E*E*(3-2*E);let G=Math.max(0,Math.min(1,(W+58)/52));w*=1-G*G*(3-2*G)}let I=tt(C,A*Te),M=o(I.q,I.r);return{wx:K,wy:R,halfW:re,mouthFade:O,landFade:w,fogDim:M===0?0:M===1?.65:1}},L=34;for(let C=0;C<u-1&&!(this.vertCount+6>on);C++){let A=s[C],Y=s[C+1],X=P(A.x,A.y,C),K=P(Y.x,Y.y,C+1);if(X.fogDim===0&&K.fogDim===0)continue;let R=X.fogDim>0?X.fogDim:K.fogDim,H=K.fogDim>0?K.fogDim:X.fogDim,re=X.halfW+L*(.28+.72*X.landFade),O=K.halfW+L*(.28+.72*K.landFade),w=A.x-B[C]*re,I=A.y-k[C]*re,M=A.x+B[C]*re,D=A.y+k[C]*re,W=Y.x-B[C+1]*O,f=Y.y-k[C+1]*O,v=Y.x+B[C+1]*O,E=Y.y+k[C+1]*O,G=P(w,I,C),q=P(M,D,C),$=P(W,f,C+1),V=P(v,E,C+1);this.pushVertex(G.wx,G.wy,w,I,-re,X.halfW,G.mouthFade,G.landFade,R,S[C],y[C],_[C],x[C]),this.pushVertex(q.wx,q.wy,M,D,re,X.halfW,q.mouthFade,q.landFade,R,S[C],y[C],_[C],x[C]),this.pushVertex(V.wx,V.wy,v,E,O,K.halfW,V.mouthFade,V.landFade,H,S[C+1],y[C+1],_[C+1],x[C+1]),this.pushVertex(G.wx,G.wy,w,I,-re,X.halfW,G.mouthFade,G.landFade,R,S[C],y[C],_[C],x[C]),this.pushVertex(V.wx,V.wy,v,E,O,K.halfW,V.mouthFade,V.landFade,H,S[C+1],y[C+1],_[C+1],x[C+1]),this.pushVertex($.wx,$.wy,W,f,-O,K.halfW,$.mouthFade,$.landFade,H,S[C+1],y[C+1],_[C+1],x[C+1])}}render(e){let{cam:r,assets:o,routes:i,manualEdges:n=[],sampleReliefHeight:s,lookupFog:u,lookupHex:a,timeSec:l,windAnimation:c=!0}=e;if(i.length===0&&n.length===0)return 0;this.vertCount=0;let h=r.zoom<.35?1+(.35-r.zoom)*1.4:1,d=a?(p,b)=>{let g=a(p,b);if(!g)return!1;let S=g.terrainId;return S==="ocean"||S==="coastal_water"||S==="stormy_ocean"||S==="icy_ocean"}:void 0;for(let p=0;p<i.length;p++){let b=this.getCachedCourse(i[p],34,d);b&&this.emitCourse(b,s,u,a,h)}if(n.length>0){let p=sn(n,34);for(let b=0;b<p.length;b++)this.emitCourse(p[b],s,u,a,h)}if(this.vertCount===0)return 0;let{gl:m}=this;return m.enable(m.BLEND),m.blendEquation(m.FUNC_ADD),m.blendFunc(m.ONE,m.ONE_MINUS_SRC_ALPHA),m.useProgram(this.program),m.bindVertexArray(this.vao),m.bindBuffer(m.ARRAY_BUFFER,this.vbo),m.bufferSubData(m.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*gr)),m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D_ARRAY,o.terrainArray),m.uniform2f(this.uCamCenter,r.x,r.y),m.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),m.uniform1f(this.uZoom,r.zoom),m.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),m.uniform1f(this.uTime,l),m.uniform1f(this.uWindEnabled,c?1:0),m.uniform1f(this.uPassMode,0),m.drawArrays(m.TRIANGLES,0,this.vertCount),m.uniform1f(this.uPassMode,1),m.drawArrays(m.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var li=Me.map(([t,e])=>[t+e*.5,Ye*e/256]),ci=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),ui=new Set(["moor","marshland","swamp"]);function vr(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function ln(t,e,r){return t.kind==="mountain"?3:cr(t)?0:t.kind==="tree"?r>=66?2:1:ur(t)||Ct(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function cn(t){return cr(t)?0:t.kind==="mountain"?.44:ur(t)||Ct(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||dr(t)||Zr(t)?.3:.55}var di=256*256*Math.sqrt(3)/2,Zt=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=zr(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...At,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...ut,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let i=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==i||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=zr(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:i}=Ut(e,r,Pe),n=xt(o,i);this.rawCellChunks.delete(n),this.chunks.delete(n);let s=e-o*Pe,u=r-i*Pe,a=[0],l=[0];s<=2&&a.push(-1),s>=Pe-3&&a.push(1),u<=2&&l.push(-1),u>=Pe-3&&l.push(1);for(let c of a)for(let h of l)c===0&&h===0||this.chunks.delete(xt(o+c,i+h));this.revision++}setHexFogState(e,r,o){let{cq:i,cr:n}=Ut(e,r,Pe),s=xt(i,n),u=e-i*Pe,l=(r-n*Pe)*Pe+u,c=this.chunks.get(s)?.cells[l],h=this.rawCellChunks.get(s)?.[l],d=c??h;return!d||d.fogState===o?!1:(c&&(c.fogState=o),h&&(h.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:i}=Ut(e,r,Pe),n=xt(o,i),u=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!u)return;let a=e-o*Pe,l=r-i*Pe;if(!(a<0||a>=Pe||l<0||l>=Pe))return u[l*Pe+a]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let i=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!i||i.layers.length===0)return 0;if(i.layers.length===1)return i.layers[0];let n=Rn(this.seedIntValue,r,o,101)%i.layers.length;return i.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let i=Cn(e,Pe,2),n=0,s=0,u=[];for(let{cq:x,cr:P}of i){let L=xt(x,P),C=this.chunks.get(L);C?(this.chunks.delete(L),this.chunks.set(L,C),u.push(C)):n<r?(C=this.buildChunk(x,P),this.chunks.set(L,C),n++,this.revision++,u.push(C)):s++}for(;this.chunks.size>this.maxCachedChunks;){let x=this.chunks.keys().next().value;if(x===void 0)break;this.chunks.delete(x)}let a=this.maxCachedChunks*2;for(;this.rawCellChunks.size>a;){let x=this.rawCellChunks.keys().next().value;if(x===void 0)break;this.rawCellChunks.delete(x)}let l=e.viewportWidth*.5/e.zoom+420,c=e.viewportHeight*.5/e.zoom+420,h=e.x-l,d=e.x+l,m=e.y-c,p=e.y+c,b=[],g=[],S=[],T=new Set;for(let x of u){for(let P of x.shorelines){if(P.x<h||P.x>d||P.y<m||P.y>p)continue;let L=this.lookupHex(P.q,P.r),C=L?L.fogState:0;C!==0&&(b.push(P),g.push(C))}for(let P of x.riverRoutes)T.has(P.id)||(T.add(P.id),S.push(P))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:b,shoreFogStates:g,riverRoutes:S,chunksLoadedThisFrame:n,hasPendingChunks:s>0};let y=[],_=[];for(let x of u){for(let P of x.sprites)P.x<h||P.x>d||P.y<m||P.y>p||y.push(P);for(let P of x.decals)P.x<h||P.x>d||P.y<m||P.y>p||_.push(P)}y.sort((x,P)=>(x.sortY??x.y)-(P.sortY??P.y)||x.x-P.x);let B=new Array(y.length);for(let x=0;x<y.length;x++){let P=y[x],L=this.lookupHex(P.q,P.r);B[x]=L?L.fogState:0}let k=new Array(_.length);for(let x=0;x<_.length;x++){let P=_[x],L=this.lookupHex(P.q,P.r);k[x]=L?L.fogState:0}return{sprites:y,fogStates:B,decals:_,decalFogStates:k,shorelines:b,shoreFogStates:g,riverRoutes:S,chunksLoadedThisFrame:n,hasPendingChunks:s>0}}getOrFetchRawCells(e,r){let o=xt(e,r),i=this.rawCellChunks.get(o);if(i)return i;let n=e*Pe,s=r*Pe,u=this.provider({cq:e,cr:r,chunkSize:Pe}),a=new Array(Pe*Pe),l=this.fogOverride;for(let c of u){let h=c.q-n,d=c.r-s;h<0||h>=Pe||d<0||d>=Pe||(l&&(c.fogState=l(c.q,c.r)),a[d*Pe+h]=c)}return this.rawCellChunks.set(o,a),a}lookupRawHex(e,r){let{cq:o,cr:i}=Ut(e,r,Pe),n=this.getOrFetchRawCells(o,i),s=e-o*Pe,u=r-i*Pe;return n[u*Pe+s]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,i)=>o[0].localeCompare(i[0])),r=[];for(let[o,i]of e){let n=Gn(i,this.manifest),s=i.worldWidth*Tt(i),u=.72*s*s/di,a=0,l=o.replace(/^assets\//,"");for(let d=0;d<l.length;d++)a=Math.imul(a,31)+l.charCodeAt(d)|0;let c=i.kind==="tree"?"tree":i.kind==="shrub"?"shrub":i.kind==="ground_cover"?"ground_cover":"other",h={key:o,entry:i,allowedTypes:n,effectiveWidth:s,crownAreaRatio:u,pathSalt:a,pre:{strict:Nt(i),ecoFamily:Vt(i)},pScale:Jr(i),chanceMult:Dn(i),minSpacing:i.placement?.minSpacing??28,edgeMargin:i.placement?.edgeMargin??12,pKind:c,isCanopy:Fn(i),isBoulder:ur(i),isWaterBoulder:Ct(i),isWarmBoulder:Gt(i),isGroundDecal:cr(i),isDryPatch:dr(i),isAcacia:Qr(i),isAccent:Ln(i),isSnowFamily:fr(i),isBush20to29:$r(i),isReed:Zr(i),isHerb:i.family==="herbs",accentGroup:In(i)};if(i.kind==="mountain")this.mountainCandidates.push(h);else if(h.isWaterBoulder)i.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(h);else if(h.isGroundDecal){if(i.artStatus!=="deprecated"&&(i.placement?.density??.25)>0&&n.size>0)for(let d of n){let m=this.decalCandidatesByTerrain.get(d);m||(m=[],this.decalCandidatesByTerrain.set(d,m)),m.push(h)}}else if(i.artStatus!=="deprecated"&&(i.placement?.density??0)>0&&(i.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(h),h.isReed&&this.reedCandidates.push(h);for(let d of n){let m=this.candidatesByTerrain.get(d);m||(m=[],this.candidatesByTerrain.set(d,m)),m.push(h)}n.has("forest_floor")&&i.family!=="palms"&&r.push(h)}}for(let o of Object.keys(this.manifest.terrain.byType)){let i=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,i);else{let n=new Set(i),s=[...i];for(let u of r)n.has(u)||(n.add(u),s.push(u));this.candidatesByTerrainForest.set(o,s)}}}createPlacedSprite(e,r,o,i,n,s,u){let a=e.entry,l=e.effectiveWidth*s,c=l*a.aspect,h=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],d=n*Te,m=a.kind==="mountain",p=Math.round(i*3)^Math.round(n*5)|0,g=!m&&!e.isAccent&&!e.accentGroup&&Q(this.seedIntValue,r,o,p+811)<.5,S=i/(256*2.6),T=n/(256*2.6),y=Math.floor(S),_=Math.floor(T),B=S-y,k=T-_,x=B*B*(3-2*B),P=k*k*(3-2*k),L=Q(this.seedIntValue,y,_,913),C=Q(this.seedIntValue,y+1,_,913),A=Q(this.seedIntValue,y,_+1,913),Y=Q(this.seedIntValue,y+1,_+1,913),X=L+(C-L)*x+(A+(Y-A)*x-(L+(C-L)*x))*P,K=Q(this.seedIntValue,r,o,p+823),R=X*.6+K*.4,H=m||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:a.kind==="tree"?.62:a.family==="cacti"?.08:a.kind==="shrub"?.42:a.kind==="ground_cover"?.24:0;return{x:i,y:d-u*Te,sortY:d,width:l,height:c,anchorX:a.anchor[0],anchorY:a.anchor[1],page:a.page,u0:a.uv[0],v0:a.uv[1],u1:a.uv[2],v1:a.uv[3],q:r,r:o,isMountain:m,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:g,tintHash:R,swayAmp:H,shadowTier:ln(a,l,c),selfShadeWeight:cn(a),shadowPage:h?h.page:-1,shadowU0:h?h.uv[0]:0,shadowV0:h?h.uv[1]:0,shadowU1:h?h.uv[2]:0,shadowV1:h?h.uv[3]:0,shadowMinX:h?h.boundsInSpriteWidth[0]:0,shadowMinY:h?h.boundsInSpriteWidth[1]:0,shadowMaxX:h?h.boundsInSpriteWidth[2]:0,shadowMaxY:h?h.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*Pe,i=r*Pe,n=this.seedIntValue,s=this.getOrFetchRawCells(e,r),u=[],a=[];for(let f=-2;f<Pe+2;f++)for(let v=-2;v<Pe+2;v++){let E=o+v,G=i+f,q=this.lookupRawHex(E,G);q&&(u.push(q),v>=0&&v<Pe&&f>=0&&f<Pe&&a.push(q))}let l=Nn(u,this.manifest,n,this.forestConfig);for(let f of a){let v=l.get(Le(f.q,f.r));v&&(f.forestClass=v.forestClass,f.glade=v.glade,f.gladeX=v.gladeX,f.gladeY=v.gladeY,f.gladeRadius=v.gladeRadius)}let c=[],h=this.manifest.infrastructure.sprites;for(let f of a){if(this.isWaterTerrain(f.terrainId)||Et.has(f.terrainId))continue;let v=We(f.q,f.r);for(let E=0;E<6;E++){let[G,q]=Me[E],$=this.lookupRawHex(f.q+G,f.r+q);if(!$||!this.isWaterTerrain($.terrainId)||$.terrainId==="icy_ocean")continue;let V=`shorelines/shore_v105_edge_0${E+1}`,J=h[V];J&&c.push({x:v.x,y:v.y,q:f.q,r:f.r,side:E,page:J.page,u0:J.uv[0],v0:J.uv[1],u1:J.uv[2],v1:J.uv[3]})}}let d=this.provider.getRiverRoutesForChunk?.(e,r,Pe)??[],m=[],p=(f,v)=>{let E=this.lookupRawHex(f,v);return E?this.isWaterTerrain(E.terrainId):!1};for(let f=0;f<d.length;f++){let v=$t(d[f],34,p);if(!v||v.points.length<2)continue;let E=1/0,G=-1/0,q=1/0,$=-1/0;for(let V=0;V<v.points.length;V++){let J=v.points[V];J.x<E&&(E=J.x),J.x>G&&(G=J.x),J.y<q&&(q=J.y),J.y>$&&($=J.y)}m.push({course:v,minX:E-90,maxX:G+90,minY:q-90,maxY:$+90})}let b=(f,v)=>{if(m.length===0)return 1/0;let E=1/0;for(let G=0;G<m.length;G++){let q=m[G];if(f<q.minX||f>q.maxX||v<q.minY||v>q.maxY)continue;let $=q.course.points;for(let V=1;V<$.length;V++){let J=$[V-1],pe=$[V],ee=pe.x-J.x,be=pe.y-J.y,Ee=ee*ee+be*be,de=Ee>1e-6?((f-J.x)*ee+(v-J.y)*be)/Ee:0;de<0?de=0:de>1&&(de=1);let Ie=f-(J.x+de*ee),Ce=v-(J.y+de*be),we=Ie*Ie+Ce*Ce;we<E&&(E=we)}}return E<1/0?Math.sqrt(E):1/0},g=this.reliefConfig.enabled?this.reliefConfig.strength:0,S=this.reliefConfig.style??"sculpted",T=Qn(u,this.manifest,n,g,S),y=(f,v)=>to(T,f,v),_=[],B=new Set,k=[],x=new Map,P=(f,v,E,G,q,$,V,J)=>{_.push(this.createPlacedSprite(f,v,E,G,q,$,V));let pe={x:G,y:q,pScale:f.pScale,minSpacing:f.minSpacing,visualHalfW:f.effectiveWidth*$*.5,isCanopy:f.isCanopy,isBoulder:f.isBoulder},ee=Le(v,E),be=x.get(ee);be||(be=[],x.set(ee,be)),be.push(pe),J.push(pe)};if(this.mountainCandidates.length>0){let f=new Set(a.map(v=>Le(v.q,v.r)));for(let v of u){if(v.reliefClass!=="mountain"||v.occupied)continue;let E=this.mountainCandidates.filter(de=>Vn(de.entry,de.allowedTypes,v.terrainId,this.manifest)),G=this.mountainCandidates.filter(de=>!Hn(de.entry)),q=E.length>0?E:G.length>0?G:this.mountainCandidates,$=0;for(let de=0;de<q.length;de++)$+=Math.max(.1,q[de].entry.placement?.weight??1);let V=Q(n,v.q,v.r,2002)*$,J=q[0];for(let de=0;de<q.length;de++)if(V-=Math.max(.1,q[de].entry.placement?.weight??1),V<=0){J=q[de];break}let pe=256*(v.q+v.r*.5),ee=Ye*v.r+20,be=Math.max(72,(J.entry.mountain?.coreRadius??.32)*J.effectiveWidth);k.push({ux:pe,uy:ee,coreR2:be*be});let Ee=Le(v.q,v.r);if(B.add(Ee),f.has(Ee)){let de=y(pe,ee);_.push(this.createPlacedSprite(J,v.q,v.r,pe,ee,1,de))}}}let L=a.filter(f=>!this.isWaterTerrain(f.terrainId)).length,C=qn(L),A={dead_trees:0,fallen_logs:0},Y=(f,v,E,G)=>{let q=f/E,$=v/E,V=Math.floor(q),J=Math.floor($),pe=q-V,ee=$-J,be=pe*pe*(3-2*pe),Ee=ee*ee*(3-2*ee),de=Q(n,V,J,G),Ie=Q(n,V+1,J,G),Ce=Q(n,V,J+1,G),we=Q(n,V+1,J+1,G),ge=de+(Ie-de)*be,ve=Ce+(we-Ce)*be;return ge+(ve-ge)*Ee},X=(f,v,E,G)=>Q(n,v,E,G+f.pathSalt),K=(f,v,E=null)=>{if(E!==null)return E;if(f.isWaterBoulder)return vr(v)*1.28;if(f.isBoulder)return vr(v);let G=f.entry.scaleRange[0]??.85,q=f.entry.scaleRange[1]??1.15,$=f.entry.kind==="tree"?Math.min(G,.76):f.entry.kind==="shrub"?Math.min(G,.74):G,V=f.entry.kind==="tree"?Math.max(q,1.2):f.entry.kind==="shrub"?Math.max(q,1.22):q;return $+(V-$)*v},R=(f,v)=>{for(let E=0;E<k.length;E++){let G=k[E],q=f-G.ux,$=v-G.uy;if(q*q+$*$<G.coreR2)return!0}return!1},H=(f,v,E,G,q)=>{if(E.length===0)return!0;let $=256*.5-(q+Math.min(74,G*.72));for(let V=0;V<E.length;V++){let[J,pe]=li[E[V]];if(f*J+v*pe>$)return!1}return!0},re=(f,v,E,G)=>{if(m.length===0||E.isWaterBoulder)return!1;let q=b(f,v);return q===1/0?!1:E.isReed?q<21:q<24+Math.min(38,G*.45)},O=(f,v,E,G,q,$,V,J,pe=null,ee,be=[],Ee=34)=>{let de=f.entry,Ie=ee??f.edgeMargin,Ce=Q(n,v.q,v.r,V*47+7),we=K(f,Ce,pe),ge=f.effectiveWidth*we*.5,ve=f.pKind,Be=f.pScale,Se=f.minSpacing,De=f.isCanopy,te=de.kind==="tree";for(let ne=0;ne<28;ne++){let{dx:le,dy:Fe}=Kn(n,v.q,v.r,ve,V,ne);if(!hr(le,Fe,Ie)||!H(le,Fe,be,ge,Ee)||te&&en($,le,Fe))continue;let Ue=E+le,qe=G+Fe;if(R(Ue,qe)||re(Ue,qe,f,ge))continue;let F=!1;for(let ae=0;ae<q.length;ae++){let j=q[ae],U=Math.sqrt(Be*j.pScale),N=De&&j.isCanopy,se=N?J:Math.max(.85,J),oe=Math.max(N&&se<.6?10:14,Math.max(Se,j.minSpacing)*se*U);!N&&(f.isBoulder||j.isBoulder)&&(oe=Math.max(oe,(ge+j.visualHalfW)*.56));let Z=Ue-j.x,ce=qe-j.y;if(Z*Z+ce*ce<oe*oe){F=!0;break}}if(F)continue;let z=y(Ue,qe);return P(f,v.q,v.r,Ue,qe,we,z,q),{ux:Ue,uy:qe,scale:we,halfW:ge}}return null},w=(f,v,E,G,q,$,V,J,pe,ee,be,Ee,de,Ie,Ce,we=[],ge=34)=>{let ve=Ce??f.edgeMargin,Be=Q(n,v.q,v.r,de*53+13),Se=K(f,Be,ee),De=f.effectiveWidth*Se*.5,te=f.pScale,ne=f.minSpacing,le=f.entry.kind==="tree",Fe=Q(n,v.q,v.r,de*61+19)*Math.PI*2,Ue=Math.max(J,V*.68+De*.44),qe=Math.max(pe,Ue+28);for(let F=0;F<20;F++){let z=Q(n,v.q,v.r,de*71+F*11+3),ae=Q(n,v.q,v.r,de*73+F*13+5),j=Fe+F*2.3999632+(ae-.5)*.42,U=Ue+(qe-Ue)*z,N=q+Math.cos(j)*U,se=$+Math.sin(j)*U*.78,oe=N-E,Z=se-G;if(!hr(oe,Z,ve)||!H(oe,Z,we,De,ge)||le&&en(Ee,oe,Z)||R(N,se)||re(N,se,f,De))continue;let ce=!1;for(let me=0;me<be.length;me++){let Ge=be[me],He=Math.sqrt(te*Ge.pScale),Xe=Math.max(10,Math.max(ne,Ge.minSpacing)*Ie*He);(f.isBoulder||Ge.isBoulder)&&(Xe=Math.max(Xe,(De+Ge.visualHalfW)*.56));let st=N-Ge.x,$e=se-Ge.y;if(st*st+$e*$e<Xe*Xe){ce=!0;break}}if(ce)continue;let ke=y(N,se);return P(f,v.q,v.r,N,se,Se,ke,be),{ux:N,uy:se,scale:Se,halfW:De}}return null},I=(f,v)=>{for(let E=-2;E<=2;E++)for(let G=-2;G<=2;G++){if(je(0,0,G,E)>2)continue;let q=this.lookupRawHex(f+G,v+E);if(q&&q.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let f=this.waterBoulderCandidates;for(let v of a){if(v.occupied||!Ot.has(v.terrainId)||v.terrainId!=="coastal_water"&&!I(v.q,v.r))continue;let E=.45+1.2*Y(v.q,v.r,3.2,4107),G=v.terrainId==="coastal_water"?.27:v.terrainId==="stormy_ocean"?.19:.15,q=Math.min(.48,G*E);if(Q(n,v.q,v.r,4111)>=q)continue;let $=[];for(let Ce=0;Ce<6;Ce++){let[we,ge]=Me[Ce],ve=this.lookupRawHex(v.q+we,v.r+ge);ve&&!this.isWaterTerrain(ve.terrainId)&&$.push(Ce)}let V=256*(v.q+v.r*.5),J=Ye*v.r,pe=[];for(let Ce=-1;Ce<=1;Ce++)for(let we=-1;we<=1;we++){let ge=x.get(Le(v.q+we,v.r+Ce));if(ge)for(let ve=0;ve<ge.length;ve++)pe.push(ge[ve])}let ee=Math.floor(Q(n,v.q,v.r,4113)*f.length),be=f[ee%f.length],Ee=1,de=O(be,v,V,J,pe,void 0,Ee++,.85,null,20,$,30);if(!de)continue;let Ie=Q(n,v.q,v.r,4117);if(Ie<.48){let Ce=Ie<.18?2:1;for(let we=0;we<Ce;we++){let ge=Math.floor(Q(n,v.q,v.r,4121+we*7)*f.length),ve=f[ge%f.length],Be=Q(n,v.q,v.r,4129+we*11),Se=Math.max(.55,Math.min(2.35,de.scale*(.4+.46*Be)));w(ve,v,V,J,de.ux,de.uy,de.halfW,Math.max(24,de.scale*20),Math.max(64,de.scale*38),Se,pe,void 0,Ee++,.62,18,$,30)}}}}let M=this.forestConfig.mode,D=this.forestConfig.openTreeChance;for(let f of a){let v=Le(f.q,f.r);if(f.occupied||B.has(v)||this.isWaterTerrain(f.terrainId))continue;let E=l.get(v);if(jn(n,f.q,f.r,E))continue;let G=[],q=[];for(let ie=0;ie<6;ie++){let[fe,he]=Me[ie],ue=this.lookupRawHex(f.q+fe,f.r+he);ue&&(G.push(ue.terrainId),this.isWaterTerrain(ue.terrainId)&&q.push(ie))}let $=E?.forestClass??"none",V=$==="dense_forest"||$==="light_forest",J=$==="light_forest"||!V&&(E?.edgeInfluence??0)>.1,pe=!!(f.riverEdges&&f.riverEdges.length>0),ee=An.has(f.terrainId),be=ui.has(f.terrainId),Ee=ee||f.terrainId==="semi_desert"||f.terrainId==="savanna",de=V?this.candidatesByTerrainForest.get(f.terrainId)??this.allCandidates:this.candidatesByTerrain.get(f.terrainId)??this.allCandidates;if(de.length===0)continue;let Ie={baseBiome:f.terrainId,biome:E?.biome??f.terrainId,forestClass:$,neighborTypes:G,hasRiverEdge:pe},Ce=Ht.has(f.terrainId),we=[],ge=[],ve=[],Be=[],Se=[],De=[],te=[],ne=!1;for(let ie=0;ie<de.length;ie++){let fe=de[ie],he=fe.entry;Yn(he.family,E)&&On(he,fe.allowedTypes,Ie,this.manifest,fe.pre)&&(f.terrainId==="tundra"&&he.family==="snow_conifers"&&X(fe,f.q,f.r,973)>=.02||(ne=!0,fe.isCanopy?Ce&&(he.family==="palms"||fe.isAcacia)?we.push(fe):ge.push(fe):fe.isBoulder?(ve.push(fe),fe.isWarmBoulder&&Be.push(fe)):fe.isDryPatch?Se.push(fe):he.family==="snow"?De.push(fe):te.push(fe)))}if(!ne)continue;ge.sort((ie,fe)=>{let he=ie.entry.placement,ue=fe.entry.placement,xe=X(ie,f.q,f.r,301)/Math.max(.04,(he.density??.12)*Math.min(1,he.weight??1)),Re=X(fe,f.q,f.r,301)/Math.max(.04,(ue.density??.12)*Math.min(1,ue.weight??1));return xe-Re}),te.sort((ie,fe)=>X(ie,f.q,f.r,302)-X(fe,f.q,f.r,302));let le=te.filter(ie=>(ie.pKind==="shrub"||ie.pKind==="ground_cover")&&!ie.isAccent&&!ie.accentGroup&&!(ee&&(ie.isBush20to29||ie.isHerb))),Fe=Xn(E);Fe>1&&Xt(n,f.q,f.r,"tree")<.58&&Fe--;let Ue=zn(E),qe=Y(f.q,f.r,4.2,5107),F=Y(f.q,f.r,1.9,5119),z=Math.pow(qe*.68+F*.32,1.35),ae=V?1:.14+1.76*z,j=V?Ue:Math.max(Ue,10),U=M==="canopy"?$==="dense_forest"?.34:$==="light_forest"?.59:.88:M==="dense"?$==="dense_forest"?.52:$==="light_forest"?.73:1:$==="dense_forest"?.72:$==="light_forest"?.92:1,N=256*(f.q+f.r*.5),se=Ye*f.r,oe=[];for(let ie=-1;ie<=1;ie++)for(let fe=-1;fe<=1;fe++){let he=x.get(Le(f.q+fe,f.r+ie));if(he)for(let ue=0;ue<he.length;ue++)oe.push(he[ue])}let Z=0,ce=0,ke=0,me=1,Ge=(ie,fe)=>{if(V||Z>=j)return;let he=Q(n,f.q,f.r,5201+me*17);if(fe.length>0&&he<.46){let Re=ae>1.08&&he<.2?2:1;for(let ye=0;ye<Re&&Z<j;ye++){let Ae=Math.floor(Q(n,f.q,f.r,5211+ye*7)*fe.length),_e=fe[Ae%fe.length],ze=Q(n,f.q,f.r,5221+ye*9),Ve=Math.max(.5,Math.min(1.85,ie.scale*(.38+.44*ze)));w(_e,f,N,se,ie.ux,ie.uy,ie.halfW,Math.max(20,ie.halfW*.72),Math.max(52,ie.halfW*1.45),Ve,oe,E,me++,.55,void 0,q)&&Z++}}let ue=Ee&&Se.length>0?ee?Se:[...Se,...le]:le,xe=Q(n,f.q,f.r,5237+me*13);if(ue.length>0&&xe<.62){let Re=1+Math.floor(Q(n,f.q,f.r,5243)*(ae>1.05?2:1));for(let ye=0;ye<Re&&Z<j;ye++){let Ae=Math.floor(Q(n,f.q,f.r,5251+ye*11)*ue.length),_e=ue[Ae%ue.length],ze=Q(n,f.q,f.r,5261+ye*7),Ve=_e.entry.scaleRange[0]??.85,Je=_e.entry.scaleRange[1]??1.15,et=(Ve+(Je-Ve)*ze)*.92;w(_e,f,N,se,ie.ux,ie.uy,ie.halfW,Math.max(20,ie.halfW*.76),Math.max(54,ie.halfW*1.38+18),et,oe,E,me++,.5,void 0,q)&&Z++}}},Xe=Be.length>0&&Q(n,f.q,f.r,1607)<.85?Be:ve,st=Xe.reduce((ie,fe)=>Math.max(ie,fe.entry.placement?.density??0),0),$e=V?1:.72+.48*ae,nt=Math.min(.44,st*(Be.length>0?2.5:1.15)*$e);if(Be.length>0&&Z<j&&Q(n,f.q,f.r,1601)<nt){let ie=Math.floor(Q(n,f.q,f.r,1602)*Xe.length);for(let fe=0;fe<Xe.length;fe++){let he=Xe[(ie+fe)%Xe.length],ue=O(he,f,N,se,oe,E,me++,1,null,void 0,q);if(ue){Z++,Ge(ue,Xe);break}}}if(we.length>0&&Z<j&&Q(n,f.q,f.r,1751)<.065*(.75+.45*ae)){let ie=we.filter(xe=>xe.entry.family==="palms"),fe=we.filter(xe=>xe.isAcacia),he=Q(n,f.q,f.r,1752)<.5?[ie,fe]:[fe,ie],ue=!1;for(let xe of he){if(!xe.length||ue)continue;let Re=Math.floor(Q(n,f.q,f.r,1753)*xe.length);for(let ye=0;ye<xe.length;ye++){let Ae=xe[(Re+ye)%xe.length],_e=O(Ae,f,N,se,oe,E,me++,1,null,void 0,q);if(_e){if(Z++,ue=!0,Q(n,f.q,f.r,1759)<.45){let ze=1+Math.floor(Q(n,f.q,f.r,1763)*2);for(let Ve=0;Ve<ze&&Z<j;Ve++){let Je=xe[(Re+Ve+1)%xe.length];w(Je,f,N,se,_e.ux,_e.uy,_e.halfW,22,56,null,oe,E,me++,.54,void 0,q)&&Z++}}break}}}}let bt=Math.min(.58,Wn(f.terrainId)*(.76+.44*ae));if(Se.length>0&&Z<j&&Q(n,f.q,f.r,1831)<bt){let ie=Math.floor(Q(n,f.q,f.r,1832)*Se.length);for(let fe=0;fe<Se.length;fe++){let he=Se[(ie+fe)%Se.length],ue=O(he,f,N,se,oe,E,me++,.9,null,void 0,q);if(ue){Z++;let xe=Q(n,f.q,f.r,1837);if(!V&&xe<.52&&Z<j){let Re=xe<.22&&ae>.95?2:1;for(let ye=0;ye<Re&&Z<j;ye++){let Ae=Se[(ie+1+ye+Math.floor(xe*11))%Se.length],_e=Q(n,f.q,f.r,1843+ye*7),ze=Ae.entry.scaleRange[0]??.8,Ve=Ae.entry.scaleRange[1]??1.15,Je=(ze+(Ve-ze)*_e)*(.76+.3*_e);w(Ae,f,N,se,ue.ux,ue.uy,ue.halfW,16,44,Je,oe,E,me++,.48,void 0,q)&&Z++}}break}}}let lt=M==="canopy"&&V?E?.canopyCoverage??0:0,Hr=lt?Math.max(Fe,Ue-2):Fe;for(let ie=0;ie<Hr&&Z<Ue&&ge.length>0&&!(ce>=Fe&&(!lt||ke>=lt));ie++){let fe=ge[ie%Math.min(ge.length,5)],he=null;if(J){let xe=Q(n,f.q,f.r,me*47+7);he=K(fe,xe,null)*(.76+.16*xe)}let ue=O(fe,f,N,se,oe,E,me++,U,he,void 0,q);ue&&(ce++,Z++,ke+=fe.crownAreaRatio*ue.scale*ue.scale)}let Gr=Math.min(.68,D*(.62+.62*ae));if(!Fe&&!E?.glade&&ge.length>0&&D>0&&X(ge[0],f.q,f.r,311)<Gr&&Z<j){let ie=O(ge[0],f,N,se,oe,E,me++,1,null,void 0,q);if(ie){Z++;let fe=Q(n,f.q,f.r,5301),he=D>.25?.64:.52;if(fe<he){let ue=1+Math.floor(Q(n,f.q,f.r,5303)*3),xe=Math.min(ge.length,4);for(let Re=0;Re<ue&&Z<j;Re++){let ye=ge[(Re+1)%xe];w(ye,f,N,se,ie.ux,ie.uy,ie.halfW,24,62,null,oe,E,me++,.52,void 0,q)&&Z++}if(le.length>0&&Z<j){let Re=Q(n,f.q,f.r,5311)<.55?2:1;for(let ye=0;ye<Re&&Z<j;ye++){let Ae=Math.floor(Q(n,f.q,f.r,5317+ye*7)*le.length),_e=le[Ae%le.length];w(_e,f,N,se,ie.ux,ie.uy,ie.halfW,18,48,null,oe,E,me++,.48,void 0,q)&&Z++}}else if(ve.length>0&&Z<j&&Q(n,f.q,f.r,5323)<.35){let Re=ve[Math.floor(Q(n,f.q,f.r,5329)*ve.length)];w(Re,f,N,se,ie.ux,ie.uy,ie.halfW,20,48,.62+Q(n,f.q,f.r,5333)*.45,oe,E,me++,.52,void 0,q)&&Z++}}}}let Or=V?1:.72+.48*ae;if(Be.length===0&&ve.length>0&&Z<j&&Q(n,f.q,f.r,1601)<Math.min(.36,st*1.15*Or)){let ie=Math.floor(Q(n,f.q,f.r,1602)*ve.length);for(let fe=0;fe<ve.length;fe++){let he=ve[(ie+fe)%ve.length],ue=O(he,f,N,se,oe,E,me++,1,null,void 0,q);if(ue){Z++,Ge(ue,ve);break}}}if(De.length>0&&Z<j){let ie=f.terrainId==="snowfields"||f.terrainId==="frozen_tundra"?.58:f.terrainId==="highland"?.25:.14;if(Q(n,f.q,f.r,1643)<ie){let fe=Math.floor(Q(n,f.q,f.r,1644)*De.length);for(let he=0;he<De.length;he++){let ue=De[(fe+he)%De.length];if(O(ue,f,N,se,oe,E,me++,U,null,void 0,q)){Z++;break}}}}if(te.length>0&&Z<j){let ie=$==="dense_forest"?1.2:J?1.28:.58+.62*ae,fe=Xt(n,f.q,f.r,"shrub"),he=Xt(n,f.q,f.r,"ground_cover"),ue=Xt(n,f.q,f.r,"other"),xe=!1,Re=!1,ye=!1,Ae=te.filter(_e=>_e.isReed);for(let _e of te){if(Z>=j)break;let ze=_e.entry,Ve=_e.accentGroup;if(Ve&&(xe||A[Ve]>=C[Ve]))continue;let Je=_e.pKind==="shrub"?fe:_e.pKind==="ground_cover"?he:ue,et=1;_e.isBush20to29?ee?et=.022:f.terrainId==="savanna"?et=.55:f.terrainId==="semi_desert"?et=.92:(ci.has(f.terrainId)||V)&&(et=1.32):_e.isHerb&&ee?et=.3:_e.isReed&&(be?et=1.65:(pe||q.length>0)&&(et=1.35));let Rt=Math.min(.86,(ze.placement?.density??.15)*Math.min(1,ze.placement?.weight??1)*ie*_e.chanceMult*et*Je);if(X(_e,f.q,f.r,312)>=Rt)continue;let rt=O(_e,f,N,se,oe,E,me++,U,null,void 0,q);if(rt){if(Z++,Ve)A[Ve]++,xe=!0;else if(_e.isAccent)xe=!0;else if(_e.isReed&&!ye&&Ae.length>0&&Z<j){if(Q(n,f.q,f.r,5501+me*13)<.74){ye=!0;let _t=1+Math.floor(Q(n,f.q,f.r,5507)*3);for(let yt=0;yt<_t&&Z<j;yt++){let Vr=Math.floor(Q(n,f.q,f.r,5519+yt*7)*Ae.length),it=Ae[Vr%Ae.length],tr=Q(n,f.q,f.r,5527+yt*11),Mt=it.entry.scaleRange[0]??.85,rr=it.entry.scaleRange[1]??1.15,nr=(Mt+(rr-Mt)*tr)*(.78+.3*tr);w(it,f,N,se,rt.ux,rt.uy,rt.halfW,14,38,nr,oe,E,me++,.42,void 0,q)&&Z++}}}else if(!V&&!Re&&_e.pKind==="shrub"&&!(ee&&_e.isBush20to29)&&le.length>0&&Z<j){let St=Q(n,f.q,f.r,5401+me*19);if(St<.5){Re=!0;let _t=le.filter(it=>it.entry.family===ze.family),yt=_t.length>0?_t:le,Vr=St<.22&&ae>.9?2:1;for(let it=0;it<Vr&&Z<j;it++){let tr=Math.floor(Q(n,f.q,f.r,5413+it*11)*yt.length),Mt=yt[tr%yt.length],rr=Q(n,f.q,f.r,5423+it*7),nr=Mt.entry.scaleRange[0]??.85,Uo=Mt.entry.scaleRange[1]??1.15,Ho=(nr+(Uo-nr)*rr)*(.72+.3*rr);w(Mt,f,N,se,rt.ux,rt.uy,rt.halfW,15,40,Ho,oe,E,me++,.46,void 0,q)&&Z++}if(ve.length>0&&Z<j&&Q(n,f.q,f.r,5437)<.22){let it=ve[Math.floor(Q(n,f.q,f.r,5441)*ve.length)];w(it,f,N,se,rt.ux,rt.uy,rt.halfW,18,42,.55+Q(n,f.q,f.r,5443)*.48,oe,E,me++,.52,void 0,q)&&Z++}}}}}}if(pe&&!ee&&!Et.has(f.terrainId)&&this.reedCandidates.length>0&&Z<j&&Q(n,f.q,f.r,5601)<.68){let ie=this.reedCandidates,fe=Math.floor(Q(n,f.q,f.r,5609)*ie.length),he=ie[fe%ie.length],ue=O(he,f,N,se,oe,E,me++,.7,null,void 0,q);if(ue){Z++;let xe=1+Math.floor(Q(n,f.q,f.r,5617)*2);for(let Re=0;Re<xe&&Z<j;Re++){let ye=ie[(fe+Re+1)%ie.length];w(ye,f,N,se,ue.ux,ue.uy,ue.halfW,14,36,null,oe,E,me++,.42,void 0,q)&&Z++}}}}let W=[];if(this.decalCandidatesByTerrain.size>0)for(let f of a){if(this.isWaterTerrain(f.terrainId)||f.reliefClass==="mountain"||Et.has(f.terrainId))continue;let v=this.decalCandidatesByTerrain.get(f.terrainId);if(!v||v.length===0)continue;let E=Math.sin(f.q*.31+f.r*.19+n%53)*Math.cos(f.q*.17-f.r*.37+n%29),G=Math.sin(f.q*.67-f.r*.53+n%97)*.45,q=.5+.5*(E*.72+G*.28),$=Q(n,f.q,f.r,7091),J=f.terrainId.includes("desert")||f.terrainId.includes("badlands")||f.terrainId.includes("savanna")||f.terrainId.includes("semi_arid")||f.terrainId.includes("dry")?.38+q*.38:.48+q*.38;if($>=J)continue;let pe=256*(f.q+f.r*.5),ee=Ye*f.r,Ee=Me.some(([Se,De])=>{let te=this.lookupRawHex(f.q+Se,f.r+De);return te?this.isWaterTerrain(te.terrainId):!1})?46:28,de=f.forestDensity??0,Ie=q>.52&&$<J*.58?2:1,Ce=this.manifest.terrain.byType[f.terrainId]?.avgColor,we=Ce?(Math.max(0,Math.min(255,Math.round(Ce[0])))&255)<<16|(Math.max(0,Math.min(255,Math.round(Ce[1])))&255)<<8|Math.max(0,Math.min(255,Math.round(Ce[2])))&255:0,ge=[];for(let Se=0;Se<v.length;Se++){let De=v[Se],te=De.entry.tags??[];te.includes("meadow_decal")&&de>.42||te.includes("woodland_decal")&&de<.2&&f.terrainId!=="forest_floor"&&f.terrainId!=="swamp"&&f.terrainId!=="marsh"&&f.terrainId!=="marshland"&&f.terrainId!=="moor"&&f.terrainId!=="jungle"||ge.push(De)}if(ge.length===0)continue;let ve=new Set,Be=[];for(let Se=0;Se<Ie;Se++){let De=Math.floor(Q(n,f.q,f.r,7109+Se*31)*ge.length),te=ge[De%ge.length];if(ve.has(te.key))continue;let ne=te.pathSalt+Se*1777,le=(Q(n,f.q,f.r,ne+7121+Se*7)-.5)*148,Fe=(Q(n,f.q,f.r,ne+7129+Se*7)-.5)*148,Ue=pe+le,qe=ee+Fe;if(!hr(le,Fe,Ee)||b(Ue,qe)<54||Be.some(ke=>Math.hypot(ke.ux-Ue,ke.uy-qe)<38))continue;let F=te.entry.tags??[],z=Q(n,f.q,f.r,ne+7151),ae=Math.max(.78,te.entry.scaleRange[0]??.78),j=Math.max(1.32,te.entry.scaleRange[1]??1.32),U=ae+(j-ae)*z,N=.86+Q(n,f.q,f.r,ne+7163)*.28,se=Q(n,f.q,f.r,ne+7177)*Math.PI*2,oe=F.includes("terrain_tint"),Z=F.includes("rock_decal")||F.includes("woodland_decal")||F.includes("wetland_decal"),ce=this.createPlacedSprite(te,f.q,f.r,Ue,qe,U,y(Ue,qe));ce.width*=N,ce.height/=Math.sqrt(N),ce.rotationRad=se,we>0&&(oe?(ce.terrainTintRgb=we,ce.terrainTintMix=.96):Z&&(ce.terrainTintRgb=we,ce.terrainTintMix=.28)),W.push(ce),ve.add(te.key),Be.push({ux:Ue,uy:qe})}}return _.sort((f,v)=>(f.sortY??f.y)-(v.sortY??v.y)||f.x-v.x),{cq:e,cr:r,key:xt(e,r),originQ:o,originR:i,cells:s,sprites:_,decals:W,shorelines:c,riverRoutes:d}}};var Ft=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var lo=Nr(ir());var mt=32,fi=32;function hi(t){return t==="mountain"||t==="hills"?t:"flat"}function so(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function co(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Ft},r=lo.default.createPointSampler(t.seed,e),o=t.halfExtent,i=t.fogPolicy??(()=>2),n=t.overrides,s=new Map,u=(l,c)=>{let h=`${l},${c}`,d=s.get(h);if(d)return s.delete(h),s.set(h,d),d;let m=l*mt,p=c*mt,b=r.traceRivers(m,p,mt,mt),g=[],S=new Set;for(let y=0;y<b.routes.length;y++){let _=b.routes[y];if(!_||_.length<2)continue;let B=_[0],k=_[_.length-1],x=`${B[0]},${B[1]}->${k[0]},${k[1]}:${_.length}`;S.has(x)||(S.add(x),g.push({id:x,hexes:_}))}let T={routes:g,edgesByKey:b.edgesByKey};for(s.set(h,T);s.size>fi;){let y=s.keys().next().value;if(y===void 0)break;s.delete(y)}return T},a=({cq:l,cr:c,chunkSize:h})=>{let d=l*h,m=c*h,p=[];for(let b=0;b<h;b++){let g=m+b;if(o!==void 0&&Math.abs(g)>o)continue;let S=Math.floor(g/mt);for(let T=0;T<h;T++){let y=d+T;if(o!==void 0&&Math.abs(y)>o)continue;let _=Math.floor(y/mt),B=u(_,S),k=r.sampleCell(y,g),x=Le(y,g),P=i(y,g),L=n?.get(x),C=L?.reliefClass??hi(k.reliefClass),A=L?.forestDensity!==void 0?L.forestDensity:k.forestDensity>0?k.forestDensity:0,Y=L?.forestClass??(L?.forestDensity!==void 0?so(void 0,A):so(k.forestClass,A)),X=B.edgesByKey.get(x);p.push({q:y,r:g,terrainId:L?.terrainId??k.terrainId,reliefClass:C,hillProfile:L?.hillProfile!==void 0?L.hillProfile:C==="hills"?k.hillProfile??"rounded":null,hillStrength:L?.hillStrength!==void 0?L.hillStrength:C==="hills"?Math.max(.35,k.hillStrength||.72):0,forestClass:Y,forestDensity:A,fogState:L?.fogState??P,occupied:L?.occupied,riverEdges:L?.riverEdges!==void 0?L.riverEdges:X&&X.length>0?[...X]:void 0})}}return p};return a.getRiverRoutesForChunk=(l,c,h)=>{let d=l*h,m=d+h-1,p=c*h,b=p+h-1,g=Math.floor(d/mt),S=Math.floor(m/mt),T=Math.floor(p/mt),y=Math.floor(b/mt),_=[],B=new Set;for(let k=T;k<=y;k++)for(let x=g;x<=S;x++){let P=u(x,k);for(let L of P.routes){if(B.has(L.id))continue;let C=!1;for(let A=0;A<L.hexes.length;A++){let[Y,X]=L.hexes[A];if(Y>=d&&Y<=m&&X>=p&&X<=b){C=!0;break}}C&&(B.add(L.id),_.push(L))}}return _},a}var mi=new Set(["ocean","coastal_water","stormy_ocean","icy_ocean"]);function dt(t){return!!(t&&mi.has(t))}function wt(t){let e=new Set,{routes:r=[],manualRivers:o=[],isWaterHex:i}=t;for(let n=0;n<r.length;n++){let s=ao(r[n],i);for(let u of s)e.add(u)}for(let n=0;n<o.length;n++){let s=o[n],u=Me[(s.dir%6+6)%6];if(!u)continue;let a=Qe(s.q,s.r,s.q+u[0],s.r+u[1]);e.add(a.key)}return e}function yr(t){let{q1:e,r1:r,q2:o,r2:i,isGate:n=!1,lookupHex:s,occupiedRiverEdges:u,existingRoads:a=[]}=t;if(je(e,r,o,i)!==1)return{ok:!1,code:"not_adjacent",reason:"Nur direkt benachbarte Hexfelder teilen eine Mauerkante."};let l=s(e,r),c=s(o,i);if(!l||!c)return{ok:!1,code:"missing_hex",reason:"Kante liegt au\xDFerhalb der geladenen Karte."};if(dt(l.terrainId)||dt(c.terrainId))return{ok:!1,code:"water_forbidden",reason:"An Wasser-/K\xFCstenwasserkanten ist keine Mauer erlaubt."};if(l.reliefClass==="mountain"||c.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Auf Bergkanten ist keine Mauer erlaubt."};let h=Qe(e,r,o,i);return u.has(h.key)?{ok:!1,code:"river_edge_forbidden",reason:"Auf einer Flusskante ist keine Mauer erlaubt (Eckanschluss an benachbarter Landkante bleibt zul\xE4ssig)."}:!n&&a.length>0&&a.some(m=>Qe(m.q1,m.r1,m.q2,m.r2).key===h.key)?{ok:!1,code:"road_requires_gate",reason:"\xDCber eine bestehende Stra\xDFe muss ein Tor statt einer geschlossenen Mauer gesetzt werden."}:{ok:!0}}function xr(t){let{q:e,r,dir:o,lookupHex:i,existingWalls:n=[]}=t,s=Me[(o%6+6)%6];if(!s)return{ok:!1,code:"not_adjacent",reason:"Ung\xFCltige Flusskanten-Richtung."};let u=e+s[0],a=r+s[1],l=i(e,r),c=i(u,a);if(!l||!c)return{ok:!1,code:"missing_hex",reason:"Flusskante liegt au\xDFerhalb der geladenen Karte."};if(dt(l.terrainId)||dt(c.terrainId))return{ok:!1,code:"water_forbidden",reason:"Flusskanten verlaufen nur zwischen Land-Hexen (M\xFCndungen enden an der K\xFCstenecke)."};let h=Qe(e,r,u,a);return n.some(m=>Qe(m.q1,m.r1,m.q2,m.r2).key===h.key)?{ok:!1,code:"wall_edge_forbidden",reason:"Auf einer bestehenden Mauerkante kann kein Fluss liegen."}:{ok:!0}}function wr(t){let{q1:e,r1:r,q2:o,r2:i,lookupHex:n,existingWalls:s=[]}=t;if(je(e,r,o,i)!==1)return{ok:!1,code:"not_adjacent",reason:"Stra\xDFen verbinden nur direkt benachbarte Hexfelder."};let u=n(e,r),a=n(o,i);if(!u||!a)return{ok:!1,code:"missing_hex",reason:"Stra\xDFensegment liegt au\xDFerhalb der geladenen Karte."};if(dt(u.terrainId)||dt(a.terrainId))return{ok:!1,code:"water_forbidden",reason:"Stra\xDFen k\xF6nnen nicht auf Wasser gelegt werden."};if(u.reliefClass==="mountain"||a.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Stra\xDFen k\xF6nnen nicht \xFCber Gebirge gelegt werden."};let l=Qe(e,r,o,i);return s.some(h=>!h.isGate&&Qe(h.q1,h.r1,h.q2,h.r2).key===l.key)?{ok:!1,code:"closed_wall_blocks_road",reason:"Eine geschlossene Mauer blockiert diese Kante \u2014 erst ein Tor setzen."}:{ok:!0}}var ho=Nr(ir());var Ne=[.24,.62,.96],Sr=[.92,.28,.3],pi=[.22,.78,.48],uo=[.94,.72,.22],gi=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function It(t){return t.surfaceClass!=="land"}function pt(t){return!It(t)&&t.reliefClass!=="mountain"}function Qt(t,e,r,o){let i=t.sampleCell(e,r);if(o==="harbor"){if(!It(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let u=[];for(let[a,l]of Me){let c=t.sampleCell(e+a,r+l);pt(c)&&u.push({q:e+a,r:r+l})}return{center:{q:e,r},buildingKind:o,valid:u.length>0,yieldPercent:100,bonusHexes:u,reason:u.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!pt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:i.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],s=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let u=-2;u<=2;u++)for(let a=-2;a<=2;a++){if(je(0,0,a,u)>2)continue;let l=e+a,c=r+u,h=t.sampleCell(l,c);o==="farm"?pt(h)&&gi.has(h.terrainId)&&(n.push({q:l,r:c}),s+=5):o==="lumber_camp"?pt(h)&&h.forestDensity>.08&&(n.push({q:l,r:c}),s+=5):o==="quarry"&&(h.reliefClass==="hills"||h.reliefClass==="mountain")&&(n.push({q:l,r:c}),s+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,s),bonusHexes:n}}function Ke(t,e,r,o){for(let i=0;i<=32;i++)for(let n=-i;n<=i;n++)for(let s=-i;s<=i;s++){if(je(0,0,s,n)!==i)continue;let u=e+s,a=r+n,l=t.sampleCell(u,a);if(pt(l)&&(!o||o(l)))return{q:u,r:a}}return{q:e,r}}function bi(t,e,r){for(let o=0;o<=45;o++)for(let i=-o;i<=o;i++)for(let n=-o;n<=o;n++){if(je(0,0,n,i)!==o)continue;let s=e+n,u=r+i,a=t.sampleCell(s,u);if(It(a))for(let[l,c]of Me){let h=t.sampleCell(s+l,u+c);if(pt(h))return{water:{q:s,r:u},land:{q:s+l,r:u+c}}}}return{water:{q:e,r},land:{q:e+1,r}}}function vt(t,e,r,o,i,n,s,u=!1){let a=[];for(let l=-i;l<=i;l++)for(let c=-i;c<=i;c++){if(je(0,0,c,l)>i)continue;let h=o.q+c,d=o.r+l,m=Le(h,d);if(r.has(m))continue;let p=t.sampleCell(h,d);!u&&!pt(p)||p.reliefClass!=="mountain"&&(r.add(m),e.push({q:h,r:d,ownerId:n,color:s}),a.push({q:h,r:d}))}return a}function Lt(t,e,r){let o=[],i=t.q,n=t.r,s=0;for(;(i!==e.q||n!==e.r)&&s++<40;){let u=0,a=1/0;for(let h=0;h<6;h++){let d=i+Me[h][0],m=n+Me[h][1],p=je(d,m,e.q,e.r);p<a&&(a=p,u=h)}let l=i+Me[u][0],c=n+Me[u][1];o.push({q1:i,r1:n,q2:l,r2:c,tier:r}),i=l,n=c}return o}function un(t,e,r=0,o="player",i){let n=new Set(t.map(c=>Le(c.q,c.r))),s=new Set,u=new Set;if(i?.roads)for(let c of i.roads)u.add(Qe(c.q1,c.r1,c.q2,c.r2).key);let a=[],l=0;for(let c of t)for(let h=0;h<6;h++){let d=c.q+Me[h][0],m=c.r+Me[h][1];if(n.has(Le(d,m)))continue;let p=Qe(c.q,c.r,d,m);if(s.has(p.key)||(s.add(p.key),i?.occupiedRiverEdges?.has(p.key)))continue;if(i?.sampler){let g=i.sampler.sampleCell(p.q1,p.r1),S=i.sampler.sampleCell(p.q2,p.r2);if(!pt(g)||!pt(S))continue}l++;let b=u.has(p.key);a.push({q1:p.q1,r1:p.r1,q2:p.q2,r2:p.r2,kind:e,isGate:b||r>0&&l%r===0,ownerId:o})}return a}function fo(t,e,r,o){let i=[],n=t,s=e,u=0;for(let a=0;a<r;a++){let l=Me[u];if(o&&l){let c=o.sampleCell(n,s),h=o.sampleCell(n+l[0],s+l[1]);if(It(c)||It(h))break}if(i.push({q:n,r:s,dir:u}),a%2===0)u=(u+1)%6;else{let c=(u+1)%6;n+=Me[c][0],s+=Me[c][1],u=(u+5)%6}}return i}function mo(t,e="vedras-welt-01",r){let o=r===void 0?Ft:r===null?void 0:r,i=ho.default.createPointSampler(e,o);if(t==="fresh-start"){let A=Ke(i,0,0),Y=Ke(i,A.q-2,A.r+1),X=[];return vt(i,X,new Set,A,1,"player",Ne),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:A,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:A.q,r:A.r,visR:3,expR:5}],scene:{territory:X,buildings:[{id:"cap-1",q:A.q,r:A.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:Ne}],units:[{id:"scout-1",q:A.q+1,r:A.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:Ne,marchPath:[{q:A.q+1,r:A.r},{q:A.q+2,r:A.r},{q:A.q+3,r:A.r-1}]}],sites:[{id:"site-1",q:Y.q,r:Y.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let A=Ke(i,108,-70),Y=Ke(i,A.q+7,A.r-1),X=[],K=new Set,R=vt(i,X,K,A,3,"player",Ne);vt(i,X,K,Y,3,"enemy",Sr);let H=Ke(i,A.q+2,A.r),re=[...Lt(A,H,"stone"),...Lt(H,Y,"packed")],O=fo(A.q-2,A.r-3,7,i),w=wt({manualRivers:O}),I=un(R.filter(f=>je(f.q,f.r,A.q,A.r)<=1),"stone",3,"player",{sampler:i,occupiedRiverEdges:w,roads:re});I.length>0&&(I[0].breached=!0);let M={q:H.q+2,r:H.r},D=[{id:"blue-cap",q:A.q,r:A.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:Ne},{id:"blue-fort",q:H.q,r:H.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:Ne,rangeRadius:2},{id:"red-cap",q:Y.q,r:Y.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:Sr}],W=[{id:"u-blue-def",q:H.q,r:H.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:Ne,marchPath:[{q:A.q+1,r:A.r+1},{q:H.q,r:H.r+1}]},{id:"u-red-siege",q:M.q,r:M.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:Sr,inCombat:!0,marchPath:[M,{q:H.q+1,r:H.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((A.q+Y.q)/2),r:Math.round((A.r+Y.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:A.q,r:A.r,visR:6,expR:12},{q:H.q,r:H.r,visR:5,expR:10}],scene:{territory:X,rivers:O,roads:re,walls:I,buildings:D,units:W}}}if(t==="coastal-harbors"){let A=bi(i,2,-2),Y=[],X=new Set;vt(i,Y,X,A.land,2,"player",Ne,!1),vt(i,Y,X,A.water,2,"player",Ne,!0);let K={q:A.water.q+1,r:A.water.r};for(let[re,O]of Me){let w=i.sampleCell(A.water.q+re,A.water.r+O);if(It(w)){K={q:A.water.q+re,r:A.water.r+O};break}}let R=[{id:"coastal-cap",q:A.land.q,r:A.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:Ne},{id:"harbor-1",q:A.water.q,r:A.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:Ne}],H=[{id:"boat-1",q:K.q,r:K.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:Ne,marchPath:[A.water,K]},{id:"scout-sea",q:A.water.q,r:A.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:Ne}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:A.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:A.water.q,r:A.water.r,visR:6,expR:11}],scene:{territory:Y,roads:Lt(A.land,{q:A.land.q-2,r:A.land.r+1},"packed"),buildings:R,units:H}}}if(t==="sites-and-fauna"){let A=Ke(i,0,0,H=>(H.terrainId==="grassland"||H.terrainId==="pasture")&&H.forestDensity<.25),Y=new Set,X=(H,re,O)=>{let w=A.q+H,I=A.r+re;for(let D=0;D<=4;D++)for(let W=-D;W<=D;W++)for(let f=-D;f<=D;f++){if(je(0,0,f,W)!==D)continue;let v=w+f,E=I+W,G=Le(v,E);if(Y.has(G))continue;let q=i.sampleCell(v,E);if(pt(q)&&(!O||O(q)))return Y.add(G),{q:v,r:E}}let M=Ke(i,w,I);return Y.add(Le(M.q,M.r)),M},R=[{id:"fauna-deer-1",dq:0,dr:0,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel (animiert)"},{id:"fauna-horse-1",dq:1,dr:0,family:"fauna",faunaSpecies:"horse",label:"Wildpferde (animiert)"},{id:"site-sc-1",dq:-1,dr:0,family:"stone_circle",variantIndex:0,label:"Steinkreis I"},{id:"site-wt-1",dq:-1,dr:1,family:"watchtower_ruin",variantIndex:0,label:"Wachturmruine I"},{id:"site-mine-1",dq:0,dr:1,family:"forgotten_iron_mine",variantIndex:0,label:"Vergessene Eisenmine I"},{id:"site-house-1",dq:1,dr:-1,family:"abandoned_house",variantIndex:0,label:"Verlassenes Haus I"},{id:"site-barn-1",dq:0,dr:-1,family:"dilapidated_barn",variantIndex:1,label:"Verfallene Scheune II"},{id:"site-water-1",dq:-1,dr:2,family:"waterhole",variantIndex:0,label:"Wasserloch I"},{id:"site-oasis-1",dq:2,dr:-1,family:"oasis",variantIndex:0,label:"Oase I"},{id:"site-obelisk-1",dq:2,dr:0,family:"obelisk",variantIndex:0,label:"Alter Obelisk I"},{id:"site-iron-1",dq:1,dr:1,family:"iron_deposit",variantIndex:0,label:"Eisenvorkommen I"},{id:"site-wt-2",dq:-2,dr:1,family:"watchtower_ruin",variantIndex:2,label:"Wachturmruine III"},{id:"site-mine-2",dq:-2,dr:2,family:"forgotten_iron_mine",variantIndex:3,label:"Vergessene Eisenmine IV"},{id:"site-house-2",dq:2,dr:-2,family:"abandoned_house",variantIndex:2,label:"Verlassenes Haus III"},{id:"site-barn-2",dq:1,dr:-2,family:"dilapidated_barn",variantIndex:3,label:"Verfallene Scheune IV"},{id:"site-obelisk-2",dq:3,dr:-1,family:"obelisk",variantIndex:3,label:"Gebrochener Obelisk IV"},{id:"site-sc-2",dq:-2,dr:0,family:"stone_circle",variantIndex:2,label:"Runen-Steinkreis III"},{id:"site-oasis-2",dq:2,dr:1,family:"oasis",variantIndex:4,label:"Brunnen-Oase V"},{id:"site-iron-2",dq:0,dr:2,family:"iron_deposit",variantIndex:2,label:"Eisenvorkommen III"},{id:"site-water-2",dq:-1,dr:-1,family:"waterhole",variantIndex:3,label:"Seerosen-Wasserloch IV"}].map(H=>{let re=X(H.dq,H.dr);return{id:H.id,q:re.q,r:re.r,family:H.family,faunaSpecies:H.faunaSpecies,variantIndex:H.variantIndex,label:H.label}});return{id:t,title:"5. M22 Fundorte (9\xD75 Varianten) & Animierte Fauna",subtitle:"Alle 9 M22-Fundorttypen (je 5 handgemalte Varianten + Schatten) \xB7 Civ-Style Hirsch- & Pferdeherden",seed:e,cameraCenter:A,cameraZoom:.74,defaultFogMode:"all-visible",visibleCenters:[{q:A.q,r:A.r,visR:8,expR:12}],scene:{sites:R}}}if(t==="strategic-empires"){let A=[{id:"player",name:"Krone Vedra",color:Ne,q:0,r:0},{id:"crimson",name:"Blutmark",color:Sr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:pi,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:uo,q:8,r:10}],Y=[],X=new Set,K=[],R=[];for(let H of A){let re=Ke(i,H.q,H.r);vt(i,Y,X,re,5,H.id,H.color),K.push({id:`emp-${H.id}`,q:re.q,r:re.r,kind:"capital",label:H.name,level:12,ownerId:H.id,factionColor:H.color}),R.push({id:`army-${H.id}`,q:re.q+2,r:re.r-1,kind:"army",label:`Heer ${H.name}`,strength:520,ownerId:H.id,factionColor:H.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:A.map(H=>({q:H.q,r:H.r,visR:9,expR:15})),scene:{territory:Y,buildings:K,units:R}}}let n=Ke(i,110,-70),s=Ke(i,n.q+4,n.r-1),u=Ke(i,n.q-3,n.r+3),a=[],l=new Set,c=vt(i,a,l,n,2,"player",Ne);vt(i,a,l,s,2,"player",Ne),vt(i,a,l,u,2,"player",Ne);let h=Ke(i,n.q+1,n.r),d=Ke(i,n.q-1,n.r,A=>A.forestDensity>.1),m=Ke(i,n.q,n.r+2),p=Ke(i,s.q+1,s.r),b=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:Ne},{id:"town-2",q:s.q,r:s.r,kind:"settlement",centerStage:"city",label:"Ostfurt",level:6,ownerId:"player",factionColor:Ne},{id:"town-3",q:u.q,r:u.r,kind:"settlement",centerStage:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:Ne,constructionProgress:.62},{id:"farm-1",q:h.q,r:h.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:Ne,yieldPercent:Qt(i,h.q,h.r,"farm").yieldPercent},{id:"lumber-1",q:d.q,r:d.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:Ne,yieldPercent:Qt(i,d.q,d.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:m.q,r:m.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:Ne,yieldPercent:Qt(i,m.q,m.r,"quarry").yieldPercent},{id:"fort-1",q:p.q,r:p.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:Ne,rangeRadius:2}],g=[...Lt(n,s,"stone"),...Lt(n,u,"packed"),...Lt(n,m,"trail")],S=fo(n.q-2,n.r-2,8,i),T=wt({manualRivers:S}),y=c.filter(A=>je(A.q,A.r,n.q,n.r)===0),_=un(y,"stone",2,"player",{sampler:i,occupiedRiverEdges:T,roads:g}),B=un([u],"palisade",3,"player",{sampler:i,occupiedRiverEdges:T,roads:g}),k=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:uo,marchPath:[n,{q:n.q+2,r:n.r-1},s]},{id:"army-1",q:s.q,r:s.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:Ne}],x=Ke(i,n.q+2,n.r+2),P=Ke(i,n.q-2,n.r-1),L=Ke(i,n.q+1,n.r+2),C=[{id:"site-mine",q:x.q,r:x.r,family:"forgotten_iron_mine",label:"Vergessene Eisenmine"},{id:"site-obelisk",q:P.q,r:P.r,family:"obelisk",label:"Alter Obelisk"},{id:"site-deer",q:L.q,r:L.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:s.q,r:s.r,visR:4,expR:8},{q:u.q,r:u.r,visR:4,expR:8}],scene:{territory:a,rivers:S,roads:g,walls:[..._,...B],buildings:b,units:k,sites:C}}}var po=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"sites-and-fauna",label:"M22 Fundorte & Animierte Fauna"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function go(t,e,r,o,i){if(o==="all-visible"||i?.has(Le(e,r)))return 2;let n=0;for(let s of t.visibleCenters){let u=je(s.q,s.r,e,r);if(u<=s.visR)return 2;u<=s.expR&&n<1&&(n=1)}return n}var Jt=512,vo={deer:{spriteKey:"actors/fauna/deer",herdSize:4,baseWidth:66,pastureRx:68,pastureRy:48,strideHz:4.2,hopAmp:2.6,cycleMinSec:9,cycleMaxSec:13.5},horse:{spriteKey:"actors/fauna/horse",herdSize:4,baseWidth:74,pastureRx:74,pastureRy:52,strideHz:5,hopAmp:3.2,cycleMinSec:8,cycleMaxSec:12},sheep:{spriteKey:"actors/fauna/sheep",herdSize:5,baseWidth:52,pastureRx:62,pastureRy:44,strideHz:4.6,hopAmp:2,cycleMinSec:10,cycleMaxSec:14.5}};function vi(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function Dt(t,e,r){return vi(t,e,r)/4294967295}function yi(t){let e=t<0?0:t>1?1:t;return e*e*(3-2*e)}function xi(t,e){if(t.family!=="fauna")return null;let r=e.infrastructure.sprites,o=t.faunaSpecies;if(o){let n=vo[o];if(n&&r[n.spriteKey])return o}let i=(t.label||"").toLowerCase();return(i.includes("pferd")||i.includes("horse")||i.includes("gest\xFCt"))&&r["actors/fauna/horse"]?"horse":(i.includes("schaf")||i.includes("sheep")||i.includes("herde"))&&r["actors/fauna/sheep"]?"sheep":r["actors/fauna/deer"]?"deer":r["actors/fauna/horse"]?"horse":null}function dn(t,e,r,o,i,n,s){let u=(o%6+6)%6,a=r/Math.max(1,i)*Math.PI*2,l=(Dt(t*19+r,e*31+u,911)-.5)*1.45,c=a+u*.92+l,h=.28+.68*Dt(t*7+u,e*13+r,3571);return{ox:Math.cos(c)*n*h,oy:Math.sin(c)*s*h}}function wi(t){let{q:e,r,memberIdx:o,herdSize:i,profile:n,frameCount:s,timeSec:u,animate:a}=t,l=e*73+o*17,c=r*89+o*29,h=n.cycleMinSec+(n.cycleMaxSec-n.cycleMinSec)*Dt(l,c,101),d=Dt(l,c,202)*h*6,m=a?u+d:d,p=Math.floor(m/h),b=(m-p*h)/h,g=dn(e,r,o,p,i,n.pastureRx,n.pastureRy),S=dn(e,r,o,p+1,i,n.pastureRx,n.pastureRy),T=dn(e,r,o,p-1,i,n.pastureRx,n.pastureRy),y=o===0?1.07:.86+.18*Dt(l,c,303),_=Dt(l,c,404),B=g.ox,k=g.oy,x=0,P=0,L="idle",C=g.ox<T.ox;if(b<.42)L="graze",P=s>=2?1:0,x=-(a?Math.max(0,Math.sin((m*1.9+o*1.3)*Math.PI*2)):0)*1.1;else if(b<.56)L="idle",P=0,C=S.ox<g.ox;else if(b<.88){L="walk";let A=yi((b-.56)/.32);B=g.ox+(S.ox-g.ox)*A,k=g.oy+(S.oy-g.oy)*A,C=S.ox<g.ox;let Y=m*n.strideHz;s>=4?P=Math.floor(Y)%2===0?2:3:s>=2&&(P=Math.floor(Y)%s),x=Math.abs(Math.sin(Y*Math.PI))*n.hopAmp}else L="idle",B=S.ox,k=S.oy,C=S.ox<g.ox,P=0;return{ox:B,oy:k,hopLift:x,frameIndex:P,flipX:C,scaleFactor:y,tintHash:_,behavior:L}}function yo(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:i,timeSec:n,animate:s}=t,u=[],a=new Set;if(!r||r.length===0)return{actors:u,coveredSiteIds:a};let l=e.infrastructure.sprites;for(let c=0;c<r.length;c++){let h=r[c];if(h.family!=="fauna")continue;let d=o(h.q,h.r);if(d===0)continue;let m=xi(h,e);if(!m)continue;let p=vo[m];if(!p)continue;let b=l[p.spriteKey];if(!b)continue;a.add(h.id);let g=Math.max(1,b.frameCount??4),S=b.frameSize?b.frameSize[0]:Math.max(1,b.sourceSize[0]/g),y=(b.frameSize?b.frameSize[1]:b.sourceSize[1])/Math.max(1,S),_=We(h.q,h.r);for(let B=0;B<p.herdSize&&!(u.length>=Jt);B++){let k=wi({q:h.q,r:h.r,memberIdx:B,herdSize:p.herdSize,profile:p,frameCount:g,timeSec:n,animate:s}),x=_.x+k.ox,P=_.y+k.oy,L=i?i(x,P/Te)*Te:0,C=p.baseWidth*k.scaleFactor,A=C*y;u.push({x,groundY:P,y:P-L-k.hopLift,hopLift:Math.max(0,k.hopLift),width:C,height:A,frameIndex:k.frameIndex,frameCount:g,flipX:k.flipX,tintHash:k.tintHash,behavior:k.behavior,fogState:d,page:b.page,u0:b.uv[0],v0:b.uv[1],u1:b.uv[2],v1:b.uv[3]})}}return u.sort((c,h)=>c.groundY-h.groundY||c.x-h.x),{actors:u,coveredSiteIds:a}}var Si=`#version 300 es
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
`,_i=`#version 300 es
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
`,Ci=`#version 300 es
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
`,Ri=`#version 300 es
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
`;function bo(t,e,r){let o=(u,a)=>{let l=t.createShader(u);if(!l)throw new Error("Failed to create AnimatedActorPass shader.");if(t.shaderSource(l,a),t.compileShader(l),!t.getShaderParameter(l,t.COMPILE_STATUS)){let c=t.getShaderInfoLog(l)??"unknown";throw t.deleteShader(l),new Error(`AnimatedActorPass shader compile failed: ${c}`)}return l},i=o(t.VERTEX_SHADER,e),n=o(t.FRAGMENT_SHADER,r),s=t.createProgram();if(!s)throw new Error("Failed to link AnimatedActorPass program.");if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS)){let u=t.getProgramInfoLog(s)??"unknown";throw t.deleteProgram(s),new Error(`AnimatedActorPass link failed: ${u}`)}return s}var _r=class{constructor(e){this.shadowData=new Float32Array(Jt*5);this.actorData=new Float32Array(Jt*10);this.gl=e;let r=new Float32Array([0,0,1,0,0,1,1,0,1,1,0,1]),o=e.createBuffer();if(!o)throw new Error("AnimatedActorPass quad VBO alloc failed.");this.quadVbo=o,e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),this.shadowProgram=bo(e,Si,_i),this.shLocCam=e.getUniformLocation(this.shadowProgram,"uCamCenter"),this.shLocViewport=e.getUniformLocation(this.shadowProgram,"uViewportLogical"),this.shLocZoom=e.getUniformLocation(this.shadowProgram,"uZoom");let i=e.createVertexArray(),n=e.createBuffer();if(!i||!n)throw new Error("AnimatedActorPass shadow VAO alloc failed.");this.shadowVao=i,this.shadowVbo=n,e.bindVertexArray(i),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,this.shadowData.byteLength,e.DYNAMIC_DRAW);let s=20;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,s,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,1,e.FLOAT,!1,s,16),e.vertexAttribDivisor(2,1),this.actorProgram=bo(e,Ci,Ri),this.acLocCam=e.getUniformLocation(this.actorProgram,"uCamCenter"),this.acLocViewport=e.getUniformLocation(this.actorProgram,"uViewportLogical"),this.acLocZoom=e.getUniformLocation(this.actorProgram,"uZoom"),this.acLocAtlas=e.getUniformLocation(this.actorProgram,"uAtlas"),this.acLocDetail=e.getUniformLocation(this.actorProgram,"uDetailOpacity"),this.acLocPolish=e.getUniformLocation(this.actorProgram,"uNaturePolish");let u=e.createVertexArray(),a=e.createBuffer();if(!u||!a)throw new Error("AnimatedActorPass actor VAO alloc failed.");this.actorVao=u,this.actorVbo=a,e.bindVertexArray(u),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.actorData.byteLength,e.DYNAMIC_DRAW);let l=40;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,l,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,l,16),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,2,e.FLOAT,!1,l,32),e.vertexAttribDivisor(3,1),e.bindVertexArray(null)}render(e){let{cam:r,assets:o,actors:i,detailOpacity:n,shadowOpacity:s,naturePolish:u}=e;if(i.length===0||n<=.03)return{drawCalls:0,renderedActors:0};let a=this.gl,l=0;if(a.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA),s>.02){let m=0,p=this.shadowData;for(let b=0;b<i.length&&m<Jt;b++){let g=i[b],S=Math.max(.68,1-g.hopLift*.04),T=g.width*.36*S,y=g.width*.14*S,_=m*5;p[_]=g.x-g.width*.12,p[_+1]=g.y+g.hopLift+2,p[_+2]=T,p[_+3]=y,p[_+4]=s*.74*S*n*(g.fogState===1?.55:1),m++}m>0&&(a.useProgram(this.shadowProgram),a.uniform2f(this.shLocCam,r.x,r.y),a.uniform2f(this.shLocViewport,r.viewportWidth,r.viewportHeight),a.uniform1f(this.shLocZoom,r.zoom),a.bindVertexArray(this.shadowVao),a.bindBuffer(a.ARRAY_BUFFER,this.shadowVbo),a.bufferSubData(a.ARRAY_BUFFER,0,p.subarray(0,m*5)),a.drawArraysInstanced(a.TRIANGLES,0,6,m),l++)}a.useProgram(this.actorProgram),a.uniform2f(this.acLocCam,r.x,r.y),a.uniform2f(this.acLocViewport,r.viewportWidth,r.viewportHeight),a.uniform1f(this.acLocZoom,r.zoom),a.uniform1i(this.acLocAtlas,0),a.uniform1f(this.acLocDetail,n),a.uniform1f(this.acLocPolish,u),a.bindVertexArray(this.actorVao);let c=this.actorData,h=0,d=0;for(;d<i.length;){let m=i[d].page,p=o.infraPages[m],b=0;for(;d<i.length&&i[d].page===m&&b<Jt;){let g=i[d++];if(!p)continue;let S=g.x-g.width*.5,T=g.y-g.height*.92,y=(g.u1-g.u0)/g.frameCount,_=y*.004,B=g.u0+y*g.frameIndex+_,k=g.u0+y*(g.frameIndex+1)-_,x=b*10;c[x]=S,c[x+1]=T,c[x+2]=g.width,c[x+3]=g.height,c[x+4]=g.flipX?k:B,c[x+5]=g.v0,c[x+6]=g.flipX?B:k,c[x+7]=g.v1,c[x+8]=g.fogState,c[x+9]=g.tintHash,b++}b>0&&p&&(a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,p),a.bindBuffer(a.ARRAY_BUFFER,this.actorVbo),a.bufferSubData(a.ARRAY_BUFFER,0,c.subarray(0,b*10)),a.drawArraysInstanced(a.TRIANGLES,0,6,b),l++,h+=b)}return a.bindVertexArray(null),{drawCalls:l,renderedActors:h}}dispose(){this.gl.deleteBuffer(this.quadVbo),this.gl.deleteBuffer(this.shadowVbo),this.gl.deleteVertexArray(this.shadowVao),this.gl.deleteProgram(this.shadowProgram),this.gl.deleteBuffer(this.actorVbo),this.gl.deleteVertexArray(this.actorVao),this.gl.deleteProgram(this.actorProgram)}};function Mi(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function Cr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function fn(t,e,r,o,i){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&i>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,i)),n}async function hn(t,e,r="auto",o){let i=e.replace(/\/+$/,""),n=await fetch(`${i}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${i}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let s=await n.json();if(s.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${s.schema}`);let u=Mi(t,r),a=u==="mobile"?Math.min(256,s.terrain.textureSize):s.terrain.textureSize,l=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),c=l?t.getParameter(l.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,h=s.terrain.layers.length+s.nature.pages.length+s.shadows.pages.length+s.infrastructure.pages.length+(s.clouds.files.length>0?1:0),d=0,m=R=>{d+=1,o?.(d,h,R)},p=t.createTexture();if(!p)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,p);let b=Math.max(1,s.terrain.layers.length),g=Math.floor(Math.log2(a))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,g,t.RGBA8,a,a,b),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let S=a!==s.terrain.textureSize?{width:a,height:a}:void 0,T=s.terrain.layers;for(let R=0;R<T.length;R+=8){let H=T.slice(R,R+8),re=await Promise.all(H.map(O=>Cr(`${i}/${O.file}`,S)));t.bindTexture(t.TEXTURE_2D_ARRAY,p);for(let O=0;O<H.length;O++){let w=re[O];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,H[O].layer,a,a,1,t.RGBA,t.UNSIGNED_BYTE,w),w.close(),m(`Terrain ${H[O].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,p),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),l&&c>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,l.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,c));let y=u==="mobile"?.5:1,_=async(R,H)=>(await Promise.all(R.map(O=>Cr(`${i}/${O.file}`,y<1?{width:Math.max(256,Math.round(O.width*y)),height:Math.max(256,Math.round(O.height*y))}:void 0)))).map((O,w)=>{let I=fn(t,O,t.CLAMP_TO_EDGE,l,c);return O.close(),m(`${H} ${w+1}/${R.length}`),I}),[B,k,x]=await Promise.all([_(s.nature.pages,"Natur-Atlas"),_(s.shadows.pages,"Schatten-Atlas"),_(s.infrastructure.pages,"Infra-Atlas")]),P=null,L=null;if(s.clouds.files.length>0){let R=s.clouds.files.find(w=>w.id.startsWith("cloud_base"))??s.clouds.files[0],H=s.clouds.files.find(w=>w.id.startsWith("cloud_edge")),[re,O]=await Promise.all([Cr(`${i}/${R.file}`),H?Cr(`${i}/${H.file}`):Promise.resolve(null)]);P=fn(t,re,t.REPEAT,l,c),re.close(),O&&(L=fn(t,O,t.REPEAT,l,c),O.close()),m("Nebel-Wolken")}let A=s.terrain.byType.forest_floor?.layers?.[0]??0,X=(s.terrain.byType.coastal_water??s.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:s,vramTier:u,terrainArray:p,terrainLayerSize:a,forestFloorLayer:A,coastalWaterLayer:X,naturePages:B,shadowPages:k,infraPages:x,cloudTexture:P,cloudEdgeTexture:L,dispose:()=>{t.deleteTexture(p);for(let R of B)t.deleteTexture(R);for(let R of k)t.deleteTexture(R);for(let R of x)t.deleteTexture(R);P&&t.deleteTexture(P),L&&t.deleteTexture(L)}}}var Ei=316/384;function xo(t,e){return{x:256*(t+e*.5),y:Ye*e}}function Ti(t,e,r,o){let i=e.x-t.x,n=e.y-t.y,s=o.x-r.x,u=o.y-r.y,a=i*u-n*s;if(Math.abs(a)<1e-9)return null;let l=r.x-t.x,c=r.y-t.y,h=(l*u-c*s)/a,d=(l*n-c*i)/a;return h<0||h>1||d<0||d>1?null:{x:t.x+h*i,y:t.y+h*n}}function wo(t){let{roads:e,routes:r=[],manualRivers:o=[],lookupFog:i,isWaterHex:n}=t;if(e.length===0||r.length===0&&o.length===0)return[];let s=[];for(let a of r){let l=$t(a,34,n);l&&l.points.length>=2&&s.push(l)}if(o.length>0){let a=sn(o,34);for(let l of a)l.points.length>=2&&s.push(l)}if(s.length===0)return[];let u=[];for(let a of e){let l=at(a.q1,a.r1,a.q2,a.r2);if(l<0)continue;let c=i(a.q1,a.r1),h=i(a.q2,a.r2),d=c>=h?c:h;if(d===0)continue;let m=xo(a.q1,a.r1),p=xo(a.q2,a.r2),b=p.x-m.x,g=p.y-m.y,S=Math.hypot(b,g)||1,T=[];for(let _ of s){let B=_.points,k=Math.max(18,_.width*.72);for(let x=1;x<B.length;x++){let P=B[x-1],L=B[x],C=Ti(m,p,P,L);if(!C)continue;let A=L.x-P.x,Y=L.y-P.y;Math.abs(b*Y-g*A)/(S*(Math.hypot(A,Y)||1))<=.16||T.some(K=>Math.hypot(K.x-C.x,K.y-C.y)<k)||u.some(K=>Math.hypot(K.ux-C.x,K.uy-C.y)<k)||T.push({x:C.x,y:C.y,width:_.width})}}let y=a.tier==="stone"?"stone":"timber";for(let _ of T)u.push({ux:_.x,uy:_.y,dir:l,material:y,tier:a.tier,length:Math.max(96,_.width+64),fogState:d})}return u}function So(t){let{manifest:e,crossings:r,sampleReliefHeight:o}=t;if(r.length===0)return[];let i=e.infrastructure.sprites,n=[];for(let s of r){let u=String(s.dir).padStart(2,"0"),a=`bridges/${s.material}/bridge_dir_${u}`,l=`bridges/${s.material==="stone"?"timber":"stone"}/bridge_dir_${u}`,c=i[a]??i[l];if(!c)continue;let h=s.length/Ei,d=s.uy*Te,m=o?o(s.ux,s.uy)*Te:0,p=d-m,b=e.shadows.sprites[`bridge_shadow:axis${s.dir%3}`],g=100,S=b?{shadowPage:b.page,shadowU0:b.uv[0],shadowV0:b.uv[1],shadowU1:b.uv[2],shadowV1:b.uv[3],shadowRelLeft:b.boundsInSpriteWidth[0]*g,shadowRelTop:b.boundsInSpriteWidth[1]*g,shadowWidth:(b.boundsInSpriteWidth[2]-b.boundsInSpriteWidth[0])*g,shadowHeight:(b.boundsInSpriteWidth[3]-b.boundsInSpriteWidth[1])*g}:{};n.push({x:s.ux,y:p,relLeft:-h*.5,relTop:-h*.5,width:h,height:h,page:c.page,u0:c.uv[0],v0:c.uv[1],u1:c.uv[2],v1:c.uv[3],sortY:d-26,fogState:s.fogState,...S})}return n}var Pi={"buildings/centers/outpost":156,"buildings/centers/settlement":170,"buildings/centers/city":182,"buildings/centers/metropolis":190,"buildings/centers/capital_t1":192,"buildings/tier1/farm":174,"buildings/tier1/lumber_camp":164,"buildings/tier1/quarry":172,"buildings/tier1/iron_mine":168,"buildings/tier1/fortress":182,"buildings/tier1/watchtower":100,"buildings/tier1/harbor":184},Ai={"buildings/centers/outpost":[.5,.72],"buildings/centers/settlement":[.5,.72],"buildings/centers/city":[.5,.71],"buildings/centers/metropolis":[.5,.72],"buildings/centers/capital_t1":[.5,.74],"buildings/tier1/farm":[.5,.7],"buildings/tier1/lumber_camp":[.5,.72],"buildings/tier1/quarry":[.5,.68],"buildings/tier1/iron_mine":[.5,.72],"buildings/tier1/fortress":[.5,.74],"buildings/tier1/watchtower":[.5,.87],"buildings/tier1/harbor":[.5,.7]};function ki(t,e,r,o){let i=t.infrastructure.sprites,n=Math.max(1,Math.min(4,Math.round(r||1))),s=[];if(e==="capital")for(let u=n;u>=1;u--)s.push(`buildings/centers/capital_t${u}`);else if(e==="settlement")o&&s.push(`buildings/centers/${o}`),n>=4&&s.push("buildings/centers/metropolis"),n>=3&&s.push("buildings/centers/city"),n>=2&&s.push("buildings/centers/settlement"),s.push("buildings/centers/outpost"),s.push("buildings/centers/settlement");else for(let u=n;u>=1;u--)s.push(`buildings/tier${u}/${e}`);for(let u of s)if(i[u])return u;return null}function _o(t){let{manifest:e,buildings:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredBuildingIds:s};let u=e.infrastructure.sprites;for(let a of r){let l=o(a.q,a.r);if(l===0)continue;let c=ki(e,a.kind,a.level,a.centerStage);if(!c)continue;let h=u[c];if(!h)continue;s.add(a.id);let d=We(a.q,a.r),m=d.x,p=d.y/Te,b=i?i(m,p)*Te:0,g=d.y-b,S=Pi[c]??200,[T,y]=h.sourceSize,_=T>0?y/T:1,B=S*_,[k,x]=Ai[c]??[.5,.72],P=e.shadows.sprites[`building_shadow:${c}`],L=P?{shadowPage:P.page,shadowU0:P.uv[0],shadowV0:P.uv[1],shadowU1:P.uv[2],shadowV1:P.uv[3],shadowRelLeft:P.boundsInSpriteWidth[0]*S,shadowRelTop:P.boundsInSpriteWidth[1]*S,shadowWidth:(P.boundsInSpriteWidth[2]-P.boundsInSpriteWidth[0])*S,shadowHeight:(P.boundsInSpriteWidth[3]-P.boundsInSpriteWidth[1])*S}:{};n.push({x:m,y:g,relLeft:-S*k,relTop:-B*x,width:S,height:B,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:d.y+8,fogState:l,...L})}return n.sort((a,l)=>a.sortY-l.sortY||a.x-l.x),{sprites:n,coveredBuildingIds:s}}var Rr=.08,Mr=2,Co=.15,mn=.21;function pn(t){return t>=mn?0:t<=Co?1:(mn-t)/(mn-Co)}function Ro(t){return pn(t)>=.5?"strategic":"detail"}function Er(t,e,r){return t<e?e:t>r?r:t}var Tr=class{constructor(e,r,o,i){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],i=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,s=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,s,this.pinchStartZoom*(i/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,i=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,i),this.state.x-=o/this.state.zoom,this.state.y-=i/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=qt(r.x,r.y,this.state),i=tt(o.x,o.y),n=`${i.q},${i.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(i))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,i=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,s]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=s,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=qt(i.x,i.y,this.state),s=tt(n.x,n.y);this.callbacks.onHexClick?.(s),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:s})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=i;let n=We(r.q,r.r),s=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:Er(o,Rr,Mr),viewportWidth:Math.max(1,s.width||e.clientWidth||1280),viewportHeight:Math.max(1,s.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),i=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*i)),s=Math.max(1,Math.round(o*i)),u=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==i||this.canvas.width!==n||this.canvas.height!==s;return u&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=i,this.canvas.width=n,this.canvas.height=s),u}centerOnHex(e,r,o){let i=We(e,r);this.state.x=i.x,this.state.y=i.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=Er(o,Rr,Mr)),this.callbacks.onChange()}setZoom(e){this.state.zoom=Er(e,Rr,Mr),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let i=Er(o,Rr,Mr);if(Math.abs(i-this.state.zoom)<1e-5)return;let n=qt(e,r,this.state);this.state.zoom=i;let s=qt(e,r,this.state);this.state.x+=n.x-s.x,this.state.y+=n.y-s.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var Mo={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function Pr(t,e,r){return t<e?e:t>r?r:t}function Wi(t,e,r,o,i,n){let s=i-r,u=n-o,a=s*s+u*u,l=a>1e-6?Pr(((t-r)*s+(e-o)*u)/a,0,1):0,c=r+l*s,h=o+l*u,d=t-c,m=e-h;return d*d+m*m}function gn(t){if(!t)return Mo;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let i of t.buildings){e.add(Le(i.q,i.r));let n=We(i.q,i.r),s=i.kind==="capital"||i.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-64,maxX:n.x+s+64,minY:n.y-s-64,maxY:n.y+s+64})}if(t.sites&&t.sites.length>0)for(let i of t.sites){let n=We(i.q,i.r),s=i.family==="fauna"?80:78;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-56,maxX:n.x+s+56,minY:n.y-s-56,maxY:n.y+s+56})}if(t.walls&&t.walls.length>0)for(let i of t.walls){let n=at(i.q1,i.r1,i.q2,i.r2);if(n<0)continue;let{a:s,b:u}=ct(i.q1,i.r1,n),a=i.isGate?i.kind==="stone"?24:20:i.kind==="stone"?18:14,l=i.kind==="stone"?26:16,c=l+64;r.push({ax:s.x,ay:s.y,bx:u.x,by:u.y,halfWidth:a,pierRadius:l,minX:Math.min(s.x,u.x)-c,maxX:Math.max(s.x,u.x)+c,minY:Math.min(s.y,u.y)-c,maxY:Math.max(s.y,u.y)+c,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let i of t.roads){let n=We(i.q1,i.r1),s=We(i.q2,i.r2),u=i.tier==="stone"?30:i.tier==="packed"?24:18,a=u+56;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:u,minX:Math.min(n.x,s.x)-a,maxX:Math.max(n.x,s.x)+a,minY:Math.min(n.y,s.y)-a,maxY:Math.max(n.y,s.y)+a,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let i of t.rivers){let{a:n,b:s}=ct(i.q,i.r,i.dir),u=22,a=u+48;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:20,minX:Math.min(n.x,s.x)-a,maxX:Math.max(n.x,s.x)+a,minY:Math.min(n.y,s.y)-a,maxY:Math.max(n.y,s.y)+a,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?Mo:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function bn(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(Le(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,i=Pr(t.width*.42,12,48),n=Pr(t.width*.34,10,34),s=Pr(t.width*.28,8,26),u=e.discs;for(let l=0;l<u.length;l++){let c=u[l];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let h=r-c.cx,d=o-c.cy,m=c.radius+n*.6;if(h*h+d*d<=m*m)return!0}let a=e.segments;for(let l=0;l<a.length;l++){let c=a[l];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let h=c.kind==="wall"?i:c.kind==="road"?n:s,d=c.halfWidth+h+(c.kind==="wall"?8:4);if(Wi(r,o,c.ax,c.ay,c.bx,c.by)<=d*d)return!0;if(c.kind==="wall"){let m=c.pierRadius+i+6,p=m*m,b=r-c.ax,g=o-c.ay;if(b*b+g*g<=p)return!0;let S=r-c.bx,T=o-c.by;if(S*S+T*T<=p)return!0}}return!1}function Fi(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function Ar(t,e,r,o,i,n,s=.86){t.font=`600 ${n}px system-ui, -apple-system, sans-serif`;let u=t.measureText(o),a=Math.max(6,n*.55),l=Math.max(3,n*.3),c=u.width+a*2,h=n+l*2,d=e-c*.5,m=r-h*.5,p=Math.min(8,h*.45);t.beginPath(),t.roundRect(d,m,c,h,p),t.fillStyle=`rgba(12, 17, 23, ${s})`,t.fill(),t.lineWidth=1.4,t.strokeStyle=Fi(i,.9),t.stroke(),t.fillStyle="#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5)}var vn=new WeakSet;function Eo(t){let{canvas:e,cam:r,scene:o,lookupFog:i,strategicBlend:n,timeSec:s}=t,u=Math.max(1,Math.round(r.viewportWidth*r.dpr)),a=Math.max(1,Math.round(r.viewportHeight*r.dpr)),l=!!(o&&(o.buildings&&o.buildings.length>0||o.sites&&o.sites.length>0||o.units&&o.units.length>0));if(!o||!l){(vn.has(e)||e.width!==u||e.height!==a)&&(e.width=u,e.height=a,vn.delete(e));return}(e.width!==u||e.height!==a)&&(e.width=u,e.height=a);let c=e.getContext("2d");if(!c)return;c.setTransform(r.dpr,0,0,r.dpr,0,0),c.clearRect(0,0,r.viewportWidth,r.viewportHeight),vn.add(e);let h=n>=.5;if(o.buildings)for(let d of o.buildings){let m=i(d.q,d.r);if(m===0)continue;let p=d.kind==="capital"||d.kind==="settlement",b=p||d.kind==="fortress"||d.kind==="harbor";if(h&&!b)continue;let g=We(d.q,d.r),S=Bt(g.x,g.y,r);if(S.x<-120||S.x>r.viewportWidth+120||S.y<-80||S.y>r.viewportHeight+80)continue;let T=typeof d.yieldPercent=="number"&&!h?` \xB7 ${d.yieldPercent}%`:"",y=p?`\u2605 ${d.label} (R${d.level})`:`${d.label} L${d.level}${T}`,_=h?-18:Math.max(30,(p?56:50)*r.zoom);if(Ar(c,S.x,S.y+_,y,d.factionColor,p?h?12:12.5:10.5,m===1?.65:.88),typeof d.constructionProgress=="number"&&d.constructionProgress>0&&d.constructionProgress<1&&!h){let x=S.x-27,P=S.y+_+13;c.fillStyle="rgba(10, 15, 22, 0.85)",c.fillRect(x,P,54,5),c.fillStyle="#f59e0b",c.fillRect(x+1,P+1,52*d.constructionProgress,3)}}if(o.sites&&!h&&r.zoom>=.45)for(let d of o.sites){if(i(d.q,d.r)===0)continue;let m=We(d.q,d.r),p=Bt(m.x,m.y,r);if(p.x<-80||p.x>r.viewportWidth+80||p.y<-50||p.y>r.viewportHeight+50)continue;let b=Math.max(30,(d.family==="fauna"?64:54)*r.zoom);Ar(c,p.x,p.y+b,d.label,d.family==="fauna"?[.55,.84,.48]:[.85,.68,.35],10,.78)}if(o.units)for(let d of o.units){if(i(d.q,d.r)<2)continue;let m=We(d.q,d.r);if(d.marchPath&&d.marchPath.length>=2){let S=We(d.marchPath[0].q,d.marchPath[0].r),T=We(d.marchPath[1].q,d.marchPath[1].r),y=s*.14%1;m={x:S.x+(T.x-S.x)*y,y:S.y+(T.y-S.y)*y}}let p=Bt(m.x,m.y,r);if(p.x<-100||p.x>r.viewportWidth+100||p.y<-60||p.y>r.viewportHeight+60)continue;let b=d.kind==="siege_army"?"\u2694":d.kind==="army"?"\u{1F6E1}":d.kind==="scout"?"\u{1F441}":d.kind==="boat"?"\u26F5":"\u2696",g=typeof d.strength=="number"?` ${d.strength}${d.rams?` + ${d.rams}R`:""}`:"";Ar(c,p.x,p.y-Math.max(20,34*r.zoom),`${b} ${d.label}${g}`,d.factionColor,h?10.5:11,.92)}if(o.buildPreview){let d=o.buildPreview,m=We(d.center.q,d.center.r),p=Bt(m.x,m.y,r),b=d.yieldPercent-100,g=d.valid?`${d.buildingKind} \xB7 Ertrag ${d.yieldPercent}% (+${b}% R2)`:`Nicht baubar: ${d.reason??"ung\xFCltig"}`;Ar(c,p.x,p.y-34,g,d.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var kr=65536,Wr=12,Li={trail:{tierIndex:0,width:19,shoulder:32,outer:44,rough:.16,opacity:.78},packed:{tierIndex:1,width:28,shoulder:38,outer:48,rough:.075,opacity:.87},stone:{tierIndex:2,width:34,shoulder:43,outer:52,rough:.028,opacity:.96}},Ii=["trail","packed","stone"],Di=`#version 300 es
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
`,qi=`#version 300 es
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
`,Bi=`#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(pos, 0.0, 1.0);
  v_uv = pos * 0.5 + 0.5;
}
`,Ui=`#version 300 es
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
`;function yn(t,e,r=0){let o=Math.imul(t+37,374761393)^Math.imul(e+91,668265263)^Math.imul(r+7,2246822519);return o^=o>>>13,o=Math.imul(o,1274126177),(o^o>>>16)>>>0}function Fr(t,e){return{x:256*(t+e*.5),y:Ye*e}}function Hi(t,e,r,o,i=14){let n=t>r||t===r&&e>o,s=n?r:t,u=n?o:e,a=n?t:r,l=n?e:o,c=Fr(s,u),h=Fr(a,l),d=h.x-c.x,m=h.y-c.y,p=Math.hypot(d,m)||1,b=-m/p,g=d/p,T=(yn(s+a,u+l,yn(s-a,u-l,11))%2001/1e3-1)*4.2,y=[];for(let _=0;_<=i;_++){let B=_/i,k=T*Math.sin(B*2*Math.PI);y.push({x:c.x+d*B+b*k,y:c.y+m*B+g*k})}return y}var Lr=class{constructor(e){this.verts=new Float32Array(kr*Wr);this.vertCount=0;this.maskFbo=null;this.maskTex=null;this.maskW=0;this.maskH=0;this.gl=e,this.maskProg=this.compileProgram(Di,qi,"RoadMask"),this.compProg=this.compileProgram(Bi,Ui,"RoadComp");let r=e.createVertexArray(),o=e.createBuffer(),i=e.createVertexArray();if(!r||!o||!i)throw new Error("Failed to allocate RoadPass VAO/VBO");this.vao=r,this.vbo=o,this.compVao=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let n=Wr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.bindVertexArray(null);let s=(u,a)=>{let l=e.getUniformLocation(u,a);if(!l)throw new Error(`Missing road uniform: ${a}`);return l};this.uMaskCamCenter=s(this.maskProg,"u_camCenter"),this.uMaskViewportSize=s(this.maskProg,"u_viewportSize"),this.uMaskZoom=s(this.maskProg,"u_zoom"),this.uMaskTier=s(this.maskProg,"u_tier"),this.uCompCamCenter=s(this.compProg,"u_camCenter"),this.uCompViewportSize=s(this.compProg,"u_viewportSize"),this.uCompZoom=s(this.compProg,"u_zoom"),this.uCompTier=s(this.compProg,"u_tier"),this.uCompOpacity=s(this.compProg,"u_opacity"),this.uCompFade=s(this.compProg,"u_fade"),e.useProgram(this.compProg),e.uniform1i(e.getUniformLocation(this.compProg,"u_roadMaskTex"),0)}compileProgram(e,r,o){let{gl:i}=this,n=i.createShader(i.VERTEX_SHADER),s=i.createShader(i.FRAGMENT_SHADER);if(!n||!s)throw new Error(`Failed to allocate ${o} shaders`);if(i.shaderSource(n,e),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw new Error(`${o} VS error: ${i.getShaderInfoLog(n)}`);if(i.shaderSource(s,r),i.compileShader(s),!i.getShaderParameter(s,i.COMPILE_STATUS))throw new Error(`${o} FS error: ${i.getShaderInfoLog(s)}`);let u=i.createProgram();if(!u)throw new Error(`Failed to allocate ${o} program`);if(i.attachShader(u,n),i.attachShader(u,s),i.linkProgram(u),i.deleteShader(n),i.deleteShader(s),!i.getProgramParameter(u,i.LINK_STATUS))throw new Error(`${o} link error: ${i.getProgramInfoLog(u)}`);return u}ensureMaskFbo(e,r){let o=Math.max(1,e),i=Math.max(1,r);if(this.maskFbo&&this.maskW===o&&this.maskH===i)return;let{gl:n}=this;this.maskTex&&n.deleteTexture(this.maskTex),this.maskFbo&&n.deleteFramebuffer(this.maskFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate RoadPass mask FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA8,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.maskTex=s,this.maskFbo=u,this.maskW=o,this.maskH=i}pushVert(e,r,o,i,n,s,u,a,l,c,h){if(this.vertCount>=kr)return;let d=this.vertCount*Wr,m=this.verts;m[d++]=e,m[d++]=r,m[d++]=o,m[d++]=i,m[d++]=n,m[d++]=s,m[d++]=u,m[d++]=a,m[d++]=l,m[d++]=c,m[d++]=h,m[d++]=0,this.vertCount++}emitTierGeometry(e,r,o,i){this.vertCount=0;let n=r.width*.5,s=r.shoulder*.5,u=r.outer*.5,a=r.rough,l=(d,m)=>{let p=i?i(d,m):0;return{x:d,y:(m-p)*Te}},c=new Map;for(let d=0;d<e.length;d++){let m=e[d],p=o(m.q1,m.r1),b=o(m.q2,m.r2);if(p===0&&b===0)continue;let g=p===2||b===2?1:.66,S=Hi(m.q1,m.r1,m.q2,m.r2,14),T=S.length,y=yn(m.q1+m.q2,m.r1+m.r2,r.tierIndex+3)%628/100,_=Le(m.q1,m.r1),B=Fr(m.q1,m.r1),k=c.get(_);(!k||g>k.fogDim)&&c.set(_,{ux:B.x,uy:B.y,fogDim:g});let x=Le(m.q2,m.r2),P=Fr(m.q2,m.r2),L=c.get(x);(!L||g>L.fogDim)&&c.set(x,{ux:P.x,uy:P.y,fogDim:g});let C=new Float32Array(T),A=new Float32Array(T),Y=new Float32Array(T),X=new Float32Array(T),K=new Float32Array(T);for(let R=0;R<T;R++){R>0&&(Y[R]=Y[R-1]+Math.hypot(S[R].x-S[R-1].x,S[R].y-S[R-1].y));let H=S[Math.max(0,R-1)],re=S[Math.min(T-1,R+1)],O=re.x-H.x,w=re.y-H.y,I=Math.hypot(O,w)||1;C[R]=-w/I,A[R]=O/I;let M=R/(T-1),D=Math.sin(Math.PI*M);X[R]=n*(1+a*D*(.69*Math.sin(M*12+y)+.36*Math.cos(M*17+y))),K[R]=n*(1+a*D*(.63*Math.cos(M*11+y)-.32*Math.sin(M*18+y)))}for(let R=0;R<T-1&&!(this.vertCount+6>kr);R++){let H=R/(T-1),re=(R+1)/(T-1),O=S[R],w=S[R+1],I=l(O.x-C[R]*u,O.y-A[R]*u),M=l(O.x+C[R]*u,O.y+A[R]*u),D=l(w.x-C[R+1]*u,w.y-A[R+1]*u),W=l(w.x+C[R+1]*u,w.y+A[R+1]*u);this.pushVert(I.x,I.y,-u,0,X[R],s,u,H,g,-u,Y[R]),this.pushVert(M.x,M.y,u,0,K[R],s,u,H,g,u,Y[R]),this.pushVert(W.x,W.y,u,0,K[R+1],s,u,re,g,u,Y[R+1]),this.pushVert(I.x,I.y,-u,0,X[R],s,u,H,g,-u,Y[R]),this.pushVert(W.x,W.y,u,0,K[R+1],s,u,re,g,u,Y[R+1]),this.pushVert(D.x,D.y,-u,0,X[R+1],s,u,re,g,-u,Y[R+1])}}let h=14;for(let d of c.values()){let m=l(d.ux,d.uy);for(let p=0;p<h&&!(this.vertCount+3>kr);p++){let b=p/h*Math.PI*2,g=(p+1)/h*Math.PI*2,S=Math.cos(b)*u,T=Math.sin(b)*u,y=Math.cos(g)*u,_=Math.sin(g)*u,B=l(d.ux+S,d.uy+T),k=l(d.ux+y,d.uy+_);this.pushVert(m.x,m.y,0,0,n*1.03,s*1.02,u,-1,d.fogDim,0,0),this.pushVert(B.x,B.y,S,T,n*1.03,s*1.02,u,-1,d.fogDim,0,0),this.pushVert(k.x,k.y,y,_,n*1.03,s*1.02,u,-1,d.fogDim,0,0)}}}render(e){let{cam:r,roads:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s}=e;if(!o||o.length===0||n>=.85)return 0;let u=1-n*.82,{gl:a}=this,l=a.canvas.width,c=a.canvas.height;if(l<=0||c<=0)return 0;let h={trail:[],packed:[],stone:[]};for(let m=0;m<o.length;m++){let p=o[m];(h[p.tier]??h.trail).push(p)}this.ensureMaskFbo(l,c);let d=0;for(let m of Ii){let p=h[m];if(p.length===0)continue;let b=Li[m];this.emitTierGeometry(p,b,i,s),this.vertCount!==0&&(a.bindFramebuffer(a.FRAMEBUFFER,this.maskFbo),a.viewport(0,0,this.maskW,this.maskH),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.enable(a.BLEND),a.blendEquation(a.MAX),a.blendFunc(a.ONE,a.ONE),a.useProgram(this.maskProg),a.bindVertexArray(this.vao),a.bindBuffer(a.ARRAY_BUFFER,this.vbo),a.bufferSubData(a.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Wr)),a.uniform2f(this.uMaskCamCenter,r.x,r.y),a.uniform2f(this.uMaskViewportSize,r.viewportWidth,r.viewportHeight),a.uniform1f(this.uMaskZoom,r.zoom),a.uniform1f(this.uMaskTier,b.tierIndex),a.drawArrays(a.TRIANGLES,0,this.vertCount),d++,a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,l,c),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.compProg),a.bindVertexArray(this.compVao),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,this.maskTex),a.uniform2f(this.uCompCamCenter,r.x,r.y),a.uniform2f(this.uCompViewportSize,r.viewportWidth,r.viewportHeight),a.uniform1f(this.uCompZoom,r.zoom),a.uniform1f(this.uCompTier,b.tierIndex),a.uniform1f(this.uCompOpacity,b.opacity),a.uniform1f(this.uCompFade,u),a.drawArrays(a.TRIANGLES,0,3),d++)}return a.bindVertexArray(null),d}dispose(){let{gl:e}=this;this.maskTex&&e.deleteTexture(this.maskTex),this.maskFbo&&e.deleteFramebuffer(this.maskFbo),e.deleteBuffer(this.vbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compVao),e.deleteProgram(this.maskProg),e.deleteProgram(this.compProg)}};var To={watchtower_ruin:{worldW:150,anchor:[.5,.79],sortBiasY:6},forgotten_iron_mine:{worldW:178,anchor:[.5,.74],sortBiasY:6},abandoned_house:{worldW:168,anchor:[.5,.75],sortBiasY:6},dilapidated_barn:{worldW:172,anchor:[.5,.74],sortBiasY:6},waterhole:{worldW:178,anchor:[.5,.56],sortBiasY:-18},oasis:{worldW:194,anchor:[.5,.67],sortBiasY:4},obelisk:{worldW:102,anchor:[.5,.85],sortBiasY:8},stone_circle:{worldW:180,anchor:[.5,.66],sortBiasY:4},iron_deposit:{worldW:162,anchor:[.5,.75],sortBiasY:6}};function Po(t){return t==="fauna"?null:t==="forgotten_mine"?"forgotten_iron_mine":t in To?t:null}function Gi(t,e,r){let o=t*374761393+e*668265263|0;for(let i=0;i<r.length;i++)o=Math.imul(o^r.charCodeAt(i),1274126177)+2654435769|0;return o^=o>>>15,o=Math.imul(o,2246822519),o^=o>>>13,o>>>0}function Oi(t,e){let r=t.infrastructure.sprites,o=[];for(let i=1;i<=5;i++){let n=`sites/${e}/${e}_${String(i).padStart(2,"0")}`;r[n]&&o.push(n)}return o}function Vi(t,e){let r=Po(e.family);if(!r)return null;let o=Oi(t,r);if(o.length===0)return null;let i=e.variantIndex!==void 0?(Math.floor(e.variantIndex)%o.length+o.length)%o.length:Gi(e.q,e.r,r)%o.length;return o[i]}function Ao(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredSiteIds:s};let u=e.infrastructure.sprites;for(let a of r){let l=o(a.q,a.r);if(l===0)continue;let c=Po(a.family);if(!c)continue;let h=Vi(e,a);if(!h)continue;let d=u[h];if(!d)continue;s.add(a.id);let m=To[c],p=We(a.q,a.r),b=p.x,g=p.y/Te,S=i?i(b,g)*Te:0,T=p.y-S,[y,_]=d.sourceSize,B=y>0?_/y:1,k=m.worldW;c==="obelisk"&&(B<1.3?k=152:B<2.1?k=112:k=92);let x=k*B,[P,L]=m.anchor,C=e.shadows.sprites[`site_shadow:${h}`],A=C?{shadowPage:C.page,shadowU0:C.uv[0],shadowV0:C.uv[1],shadowU1:C.uv[2],shadowV1:C.uv[3],shadowRelLeft:C.boundsInSpriteWidth[0]*k,shadowRelTop:C.boundsInSpriteWidth[1]*k,shadowWidth:(C.boundsInSpriteWidth[2]-C.boundsInSpriteWidth[0])*k,shadowHeight:(C.boundsInSpriteWidth[3]-C.boundsInSpriteWidth[1])*k}:{};n.push({x:b,y:T,relLeft:-k*P,relTop:-x*L,width:k,height:x,page:d.page,u0:d.uv[0],v0:d.uv[1],u1:d.uv[2],v1:d.uv[3],sortY:p.y+m.sortBiasY,fogState:l,...A})}return n.sort((a,l)=>a.sortY-l.sortY||a.x-l.x),{sprites:n,coveredSiteIds:s}}var ko=`#version 300 es
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
`,Ni=`#version 300 es
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
`,Xi=`#version 300 es
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
`,Wo=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,zi=`#version 300 es
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
`,Yi=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function er(t,e,r,o){let i=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!i||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(i)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let s=t.createProgram();if(!s)throw new Error(`Failed to create ${o} program`);if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(s)}`);return s}var Ki=`#version 300 es
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
`,ji=`#version 300 es
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
`,Ir=class{constructor(e){this.instanceData=new Float32Array(16384*16);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=er(e,ko,Ni,"sprite"),this.shadowMaskProg=er(e,ko,Xi,"shadow-mask"),this.compositeProg=er(e,Wo,zi,"shadow-composite"),this.shoreCompositeProg=er(e,Wo,Yi,"shore-composite"),this.surfProg=er(e,Ki,ji,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),i=e.createBuffer();if(!r||!o||!i)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=64;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let s=(u,a)=>{let l=e.getUniformLocation(u,a);if(!l)throw new Error(`Missing uniform ${a}`);return l};this.spCam=s(this.spriteProg,"u_camCenter"),this.spView=s(this.spriteProg,"u_viewportSize"),this.spZoom=s(this.spriteProg,"u_zoom"),this.spScaleY=s(this.spriteProg,"u_scaleY"),this.spShearX=s(this.spriteProg,"u_shearX"),this.spTime=s(this.spriteProg,"u_time"),this.spWindEnabled=s(this.spriteProg,"u_windEnabled"),this.spCanvasSize=s(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=s(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=s(this.spriteProg,"u_selfShadow"),this.spNaturePolish=s(this.spriteProg,"u_naturePolish"),this.spSpriteSat=s(this.spriteProg,"u_spriteSat"),this.spSpriteBright=s(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=s(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=s(this.spriteProg,"u_colorGradeAll"),this.spDecalPass=s(this.spriteProg,"u_decalPass"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=s(this.shadowMaskProg,"u_camCenter"),this.shView=s(this.shadowMaskProg,"u_viewportSize"),this.shZoom=s(this.shadowMaskProg,"u_zoom"),this.shScaleY=s(this.shadowMaskProg,"u_scaleY"),this.shShearX=s(this.shadowMaskProg,"u_shearX"),this.shTime=s(this.shadowMaskProg,"u_time"),this.shWindEnabled=s(this.shadowMaskProg,"u_windEnabled"),this.shDecalPass=s(this.shadowMaskProg,"u_decalPass"),this.sfCam=s(this.surfProg,"u_camCenter"),this.sfView=s(this.surfProg,"u_viewportSize"),this.sfZoom=s(this.surfProg,"u_zoom"),this.sfTime=s(this.surfProg,"u_time"),this.sfWindEnabled=s(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=s(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),i=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===i)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=s,this.shadowFbo=u,this.shadowW=o,this.shadowH=i}ensureShoreFbo(e,r){let o=Math.max(2,e),i=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===i)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=s,this.shoreFbo=u,this.shoreW=o,this.shoreH=i}renderShadows(e){let{cam:r,sprites:o,fogStates:i,walls:n=[],shadowPages:s,shadowOpacity:u,detailOpacity:a}=e;if(this.lastHasCrossShadows=!1,u<=.005||a<=.01||s.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:l,instanceData:c}=this;this.ensureShadowFbo(l.canvas.width,l.canvas.height);let h=0,d=0,m=new Array(s.length).fill(0);for(let y=0;y<o.length;y++){let _=o[y];_.shadowPage<0||_.shadowPage>=s.length||i[y]!==0&&m[_.shadowPage]++}for(let y=0;y<n.length;y++){let _=n[y],B=_.shadowPage??-1;B<0||B>=s.length||_.fogState===0||m[B]++}let p=new Array(s.length).fill(0),b=0;for(let y=0;y<s.length;y++)p[y]=b,b+=m[y];if(b===0)return{drawCalls:0,renderedShadows:0};let g=[...p],S=Math.min(b,16384);for(let y=0;y<o.length;y++){let _=o[y],B=_.shadowPage;if(B<0||B>=s.length)continue;let k=i[y];if(k===0)continue;let x=g[B];if(x>=S)continue;g[B]=x+1,h++;let P=_.shadowTier??(_.isMountain?3:0);P>0&&d++;let L=x*16,C=(_.shadowMaxX-_.shadowMinX)*_.width,A=(_.shadowMaxY-_.shadowMinY)*_.width;c[L]=_.x,c[L+1]=_.y,c[L+2]=_.shadowMinX*_.width,c[L+3]=_.shadowMinY*_.width,c[L+4]=C,c[L+5]=A,c[L+6]=k===1?a*.65:a,c[L+7]=P,c[L+8]=_.shadowU0,c[L+9]=_.shadowV0,c[L+10]=_.shadowU1,c[L+11]=_.shadowV1,c[L+12]=.5,c[L+13]=0,c[L+14]=0,c[L+15]=0}for(let y=0;y<n.length;y++){let _=n[y],B=_.shadowPage??-1;if(B<0||B>=s.length||_.fogState===0)continue;let k=g[B];if(k>=S)continue;g[B]=k+1,h++,d++;let x=k*16;c[x]=_.x,c[x+1]=_.y,c[x+2]=_.shadowRelLeft??0,c[x+3]=_.shadowRelTop??0,c[x+4]=_.shadowWidth??0,c[x+5]=_.shadowHeight??0,c[x+6]=_.fogState===1?a*.65:a,c[x+7]=2,c[x+8]=_.shadowU0??0,c[x+9]=_.shadowV0??0,c[x+10]=_.shadowU1??0,c[x+11]=_.shadowV1??0,c[x+12]=.5,c[x+13]=0,c[x+14]=0,c[x+15]=0}this.lastHasCrossShadows=d>0,l.bindBuffer(l.ARRAY_BUFFER,this.instanceVbo),l.bufferSubData(l.ARRAY_BUFFER,0,c.subarray(0,S*16)),l.bindFramebuffer(l.FRAMEBUFFER,this.shadowFbo),l.viewport(0,0,this.shadowW,this.shadowH),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.enable(l.BLEND),l.blendEquation(l.MAX),l.blendFunc(l.ONE,l.ONE),l.useProgram(this.shadowMaskProg),l.bindVertexArray(this.vao),l.uniform2f(this.shCam,r.x,r.y),l.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),l.uniform1f(this.shZoom,r.zoom),l.uniform1f(this.shScaleY,1),l.uniform1f(this.shShearX,0),l.uniform1f(this.shTime,0),l.uniform1f(this.shWindEnabled,0),l.uniform1f(this.shDecalPass,0);let T=0;l.activeTexture(l.TEXTURE0);for(let y=0;y<s.length;y++){let _=p[y],B=Math.min(g[y],S),k=B-_;k<=0||(l.bindTexture(l.TEXTURE_2D,s[y]),_===0||l.bufferSubData(l.ARRAY_BUFFER,0,c.subarray(_*16,B*16)),l.drawArraysInstanced(l.TRIANGLES,0,6,k),T++)}return l.bindFramebuffer(l.FRAMEBUFFER,null),l.viewport(0,0,l.canvas.width,l.canvas.height),l.blendEquation(l.FUNC_ADD),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),l.useProgram(this.compositeProg),l.bindVertexArray(this.compositeVao),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.shadowTex),l.uniform1f(this.compOpacity,u),l.drawArrays(l.TRIANGLES,0,3),T++,{drawCalls:T,renderedShadows:h}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:i,naturePages:n,walls:s=[],infraPages:u=[],detailOpacity:a,objectScaleY:l,objectShearX:c,shadowOpacity:h=.54,mountainShadowOnSprites:d=!0,spriteSelfShadow:m=.68,naturePolish:p=.4,spriteSaturation:b=1,spriteBrightness:g=1,spriteContrast:S=1,timeSec:T=0,windAnimation:y=!0,isDecalPass:_=!1}=e,B=o.length>0&&n.length>0,k=s.length>0&&u.length>0;if(a<=.01||!B&&!k)return{drawCalls:0,renderedSprites:0};let{gl:x,instanceData:P}=this;x.enable(x.BLEND),x.blendEquation(x.FUNC_ADD),x.blendFunc(x.ONE,x.ONE_MINUS_SRC_ALPHA),x.useProgram(this.spriteProg),x.bindVertexArray(this.vao),x.bindBuffer(x.ARRAY_BUFFER,this.instanceVbo),x.uniform2f(this.spCam,r.x,r.y),x.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),x.uniform1f(this.spZoom,r.zoom),x.uniform1f(this.spScaleY,l),x.uniform1f(this.spShearX,c),x.uniform1f(this.spTime,T),x.uniform1f(this.spWindEnabled,y?1:0),x.uniform2f(this.spCanvasSize,x.canvas.width,x.canvas.height);let L=d&&this.lastHasCrossShadows&&this.shadowTex!==null?h:0;x.uniform1f(this.spMtnShadowOpacity,L),x.uniform1f(this.spSelfShadow,m),x.uniform1f(this.spNaturePolish,p),x.uniform1f(this.spSpriteSat,b),x.uniform1f(this.spSpriteBright,g),x.uniform1f(this.spSpriteContrast,S),x.uniform1f(this.spColorGradeAll,1),x.uniform1f(this.spDecalPass,_?1:0);let C=n[0]??u[0];x.activeTexture(x.TEXTURE8),x.bindTexture(x.TEXTURE_2D,this.shadowTex??C);let A=0,Y=0,X=0,K=[],R=new Map,H=()=>{if(X<=0)return;for(let W=0;W<K.length;W++)x.activeTexture(x.TEXTURE0+W),x.bindTexture(x.TEXTURE_2D,K[W]);let D=K[0]??C;for(let W=K.length;W<8;W++)x.activeTexture(x.TEXTURE0+W),x.bindTexture(x.TEXTURE_2D,D);x.bufferSubData(x.ARRAY_BUFFER,0,P.subarray(0,X*16)),x.drawArraysInstanced(x.TRIANGLES,0,6,X),A++,Y+=X,X=0,K=[],R.clear()},re=D=>{let W=R.get(D);return W===void 0?((K.length>=8||X>=16384)&&H(),W=K.length,K.push(D),R.set(D,W)):X>=16384&&(H(),W=0,K.push(D),R.set(D,0)),W},O=0,w=0,I=B?o.length:0,M=k?s.length:0;for(;O<I||w<M;){let D=!1;if(O>=I)D=!0;else if(w<M){let W=o[O].sortY??o[O].y;s[w].sortY<W&&(D=!0)}if(D){let W=s[w++];if(W.fogState===0||W.page<0||W.page>=u.length)continue;let f=re(u[W.page]),v=(W.fogState===1?1:0)|4|16,E=X*16;P[E]=W.x,P[E+1]=W.y,P[E+2]=W.relLeft,P[E+3]=W.relTop,P[E+4]=W.width,P[E+5]=W.height,P[E+6]=a,P[E+7]=f*256+v,P[E+8]=W.u0,P[E+9]=W.v0,P[E+10]=W.u1,P[E+11]=W.v1,P[E+12]=.5,P[E+13]=0,P[E+14]=0,P[E+15]=0,X++}else{let W=O++,f=i[W];if(f===0)continue;let v=o[W];if(v.page<0||v.page>=n.length)continue;let E=re(n[v.page]),G=v.shadowTier??(v.isMountain?3:0),q=v.selfShadeWeight??(v.isGroundDecal?0:v.isMountain?.52:.72),$=Math.max(0,Math.min(7,Math.round(q*7))),V=(f===1?1:0)|(G&3)<<3|($&7)<<5;v.isMountain||(V|=2,v.isSnowFamily&&(V|=4));let J=!!v.flipX,pe=J?1-v.anchorX:v.anchorX,ee=X*16;P[ee]=v.x,P[ee+1]=v.y,P[ee+2]=-v.width*pe,P[ee+3]=-v.height*v.anchorY,P[ee+4]=v.width,P[ee+5]=v.height,P[ee+6]=a,P[ee+7]=E*256+V,P[ee+8]=J?v.u1:v.u0,P[ee+9]=v.v0,P[ee+10]=J?v.u0:v.u1,P[ee+11]=v.v1,P[ee+12]=v.tintHash??.5,P[ee+13]=_?v.rotationRad??0:v.swayAmp??0,P[ee+14]=_?v.terrainTintRgb??0:0,P[ee+15]=_?v.terrainTintMix??0:0,X++}}return H(),{drawCalls:A,renderedSprites:Y}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:i,infraPages:n,projectY:s}=e;if(o.length===0||n.length===0)return{drawCalls:0,renderedShorelines:0};let{gl:u,instanceData:a}=this;this.ensureShoreFbo(u.canvas.width,u.canvas.height),u.bindFramebuffer(u.FRAMEBUFFER,this.shoreFbo),u.viewport(0,0,this.shoreW,this.shoreH),u.clearColor(0,0,0,0),u.clear(u.COLOR_BUFFER_BIT),u.enable(u.BLEND),u.blendEquation(u.MAX),u.blendFunc(u.ONE,u.ONE),u.useProgram(this.spriteProg),u.bindVertexArray(this.vao),u.bindBuffer(u.ARRAY_BUFFER,this.instanceVbo),u.uniform2f(this.spCam,r.x,r.y),u.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),u.uniform1f(this.spZoom,r.zoom),u.uniform1f(this.spScaleY,1),u.uniform1f(this.spShearX,0),u.uniform1f(this.spTime,0),u.uniform1f(this.spWindEnabled,0),u.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),u.uniform1f(this.spMtnShadowOpacity,0),u.uniform1f(this.spSelfShadow,0),u.uniform1f(this.spNaturePolish,0),u.uniform1f(this.spSpriteSat,1),u.uniform1f(this.spSpriteBright,1),u.uniform1f(this.spSpriteContrast,1),u.uniform1f(this.spColorGradeAll,0),u.uniform1f(this.spDecalPass,0);let l=Math.min(n.length,8);for(let g=0;g<8;g++)u.activeTexture(u.TEXTURE0+g),u.bindTexture(u.TEXTURE_2D,n[g<l?g:0]);u.activeTexture(u.TEXTURE8),u.bindTexture(u.TEXTURE_2D,n[0]);let c=0,h=0,d=0,m=()=>{d<=0||(u.bufferSubData(u.ARRAY_BUFFER,0,a.subarray(0,d*16)),u.drawArraysInstanced(u.TRIANGLES,0,6,d),c++,h+=d,d=0)},p=512,b=512*s;for(let g=0;g<o.length;g++){let S=i[g];if(S===0)continue;let T=o[g];if(T.page<0||T.page>=l)continue;d>=16384&&m();let y=d*16;a[y]=T.x,a[y+1]=T.y,a[y+2]=-p*.5,a[y+3]=-b*.5,a[y+4]=p,a[y+5]=b,a[y+6]=1,a[y+7]=T.page*256+4+24+(S===1?1:0),a[y+8]=T.u0,a[y+9]=T.v0,a[y+10]=T.u1,a[y+11]=T.v1,a[y+12]=.5,a[y+13]=0,a[y+14]=0,a[y+15]=0,d++}return m(),u.bindFramebuffer(u.FRAMEBUFFER,null),u.viewport(0,0,u.canvas.width,u.canvas.height),u.blendEquation(u.FUNC_ADD),u.blendFunc(u.ONE,u.ONE_MINUS_SRC_ALPHA),h>0&&(u.useProgram(this.shoreCompositeProg),u.bindVertexArray(this.compositeVao),u.activeTexture(u.TEXTURE0),u.bindTexture(u.TEXTURE_2D,this.shoreTex),u.drawArrays(u.TRIANGLES,0,3),c++),{drawCalls:c,renderedShorelines:h}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:i,detailOpacity:n,timeSec:s,windAnimation:u}=e;if(n<=.02||o.length===0)return 0;let{gl:a,instanceData:l}=this,c=0;for(let h=0;h<o.length;h++){let d=o[h];if(!d.isWaterBoulder)continue;let m=i[h];if(m===0)continue;if(c>=16384)break;let p=d.width*.68,b=d.width*.25,g=c*16;l[g]=d.x,l[g+1]=d.y-d.height*.04,l[g+2]=-p,l[g+3]=-b,l[g+4]=p*2,l[g+5]=b*2,l[g+6]=n,l[g+7]=m===1?1:0,l[g+8]=0,l[g+9]=0,l[g+10]=0,l[g+11]=0,l[g+12]=d.tintHash??.5,l[g+13]=0,l[g+14]=0,l[g+15]=0,c++}return c===0?0:(a.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.surfProg),a.bindVertexArray(this.vao),a.bindBuffer(a.ARRAY_BUFFER,this.instanceVbo),a.uniform2f(this.sfCam,r.x,r.y),a.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),a.uniform1f(this.sfZoom,r.zoom),a.uniform1f(this.sfTime,s),a.uniform1f(this.sfWindEnabled,u?1:0),a.bufferSubData(a.ARRAY_BUFFER,0,l.subarray(0,c*16)),a.drawArraysInstanced(a.TRIANGLES,0,6,c),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var gt=256,$i=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,Zi=`#version 300 es
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
const float PROJ_Y = ${Te.toFixed(4)};
const float ROW_STEP = ${(1.5*Ze).toFixed(6)};
const float TEX_WORLD_SIZE = 256.0;
const float WATER_HEX_COVER = ${(2*Ze).toFixed(4)}; // 295.603 (autotile.js:87)
const float RELIEF_MAX_H = ${pr.toFixed(2)};

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
`,Qi=`#version 300 es
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
const float PROJ_Y = ${Te.toFixed(4)};
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
`;function xn(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${i}`)}return o}var Dr=class{constructor(e){this.cellBuf=new Uint8Array(gt*gt*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.hasUnknownCells=!1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=xn(e,e.VERTEX_SHADER,$i),o=xn(e,e.FRAGMENT_SHADER,Zi),i=e.createProgram();if(!i)throw new Error("Failed to create terrain program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let h=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteShader(r),e.deleteProgram(i),new Error(`Terrain program link error:
${h}`)}this.program=i;let n=xn(e,e.FRAGMENT_SHADER,Qi),s=e.createProgram();if(!s)throw e.deleteShader(r),e.deleteShader(n),new Error("Failed to create cloud overlay program");if(e.attachShader(s,r),e.attachShader(s,n),e.linkProgram(s),e.deleteShader(r),e.deleteShader(n),!e.getProgramParameter(s,e.LINK_STATUS)){let h=e.getProgramInfoLog(s)||"Unknown link error";throw e.deleteProgram(s),new Error(`Cloud overlay program link error:
${h}`)}this.cloudProgram=s;let u=e.createVertexArray();if(!u)throw new Error("Failed to create terrain VAO");this.vao=u;let a=e.createTexture();if(!a)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=a,e.bindTexture(e.TEXTURE_2D,a),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,gt,gt),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let l=e.createTexture();if(!l)throw new Error("Failed to allocate surface field texture");this.surfaceTex=l,e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let c=(h,d)=>{let m=e.getUniformLocation(h,d);if(!m)throw new Error(`Missing terrain uniform: ${d}`);return m};this.uCamCenter=c(i,"u_camCenter"),this.uViewportSize=c(i,"u_viewportSize"),this.uZoom=c(i,"u_zoom"),this.uTime=c(i,"u_time"),this.uGridOrigin=c(i,"u_gridOrigin"),this.uGridSize=c(i,"u_gridSize"),this.uForestFloorLayer=c(i,"u_forestFloorLayer"),this.uShowGrid=c(i,"u_showGrid"),this.uHoverHex=c(i,"u_hoverHex"),this.uSurfaceRect=c(i,"u_surfaceRect"),this.uEdgeBand=c(i,"u_edgeBand"),this.uWaterHexMode=c(i,"u_waterHexMode"),this.uReliefEnabled=c(i,"u_reliefEnabled"),this.uReliefLighting=c(i,"u_reliefLighting"),this.uWindEnabled=c(i,"u_windEnabled"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(i,"u_cellData"),1),e.uniform1i(e.getUniformLocation(i,"u_surfaceField"),3),this.cuCamCenter=c(s,"u_camCenter"),this.cuViewportSize=c(s,"u_viewportSize"),this.cuZoom=c(s,"u_zoom"),this.cuTime=c(s,"u_time"),this.cuGridOrigin=c(s,"u_gridOrigin"),this.cuGridSize=c(s,"u_gridSize"),this.cuHasClouds=c(s,"u_hasClouds"),this.cuHasCloudEdge=c(s,"u_hasCloudEdge"),this.cuWindEnabled=c(s,"u_windEnabled"),e.useProgram(s),e.uniform1i(e.getUniformLocation(s,"u_cellData"),1),e.uniform1i(e.getUniformLocation(s,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(s,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return no(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:i,cellTex:n,surfaceTex:s,cellBuf:u}=this,{cam:a,assets:l,lookupHex:c,resolveTerrainLayer:h,isWaterTerrain:d,seedInt:m,dataRevision:p,timeSec:b,showGrid:g,hoverHex:S,edgeBand:T=28,waterSampling:y="hex",reliefEnabled:_=!0,reliefStrength:B=Yt,reliefLighting:k=!0,reliefStyle:x="sculpted",windAnimation:P=!0}=e,L=Xr(a,4),C=L.maxQ-L.minQ+1,A=L.maxR-L.minR+1,Y=L.minQ,X=L.minR;C>gt&&(Y=Math.floor((L.minQ+L.maxQ)/2)-Math.floor(gt/2),C=gt),A>gt&&(X=Math.floor((L.minR+L.maxR)/2)-Math.floor(gt/2),A=gt);let K=!1;if(Y!==this.lastMinQ||X!==this.lastMinR||C!==this.lastSpanQ||A!==this.lastSpanR||p!==this.lastDataRevision){let f=0,v=!1;for(let E=0;E<A;E++){let G=X+E;for(let q=0;q<C;q++){let $=Y+q,V=c($,G);if(!V||V.fogState===0)v=!0,u[f++]=0,u[f++]=0,u[f++]=0,u[f++]=0;else{let J=d(V.terrainId)?1:0,pe=Et.has(V.terrainId)?2:0,ee=V.terrainId==="icy_ocean"?4:0,be=V.terrainId==="coastal_water"||V.terrainId==="coastal_waters"||V.terrainId==="coast"?8:0;u[f++]=h(V.terrainId,$,G)&255,u[f++]=0,u[f++]=V.fogState,u[f++]=J|pe|ee|be}}}this.hasUnknownCells=v,r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,C,A,r.RGBA_INTEGER,r.UNSIGNED_BYTE,u.subarray(0,C*A*4)),this.lastMinQ=Y,this.lastMinR=X,this.lastSpanQ=C,this.lastSpanR=A,this.lastDataRevision=p,K=!0}let R=_?B:0,H=a.viewportWidth*.5/a.zoom,re=a.viewportHeight*.5/(a.zoom*Te),O=a.x-H-140,w=a.x+H+140,I=a.y/Te-re-180,M=a.y/Te+re+220;if(!this.surfaceWin||this.lastSurfaceRevision!==p||this.lastSurfaceStrength!==R||this.lastSurfaceStyle!==x||O<this.surfaceWin.left||w>this.surfaceWin.left+this.surfaceWin.width||I<this.surfaceWin.top||M>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(w-O)*3.5){let f=Math.max(384,(w-O)*.35),v=Math.max(384,(M-I)*.35),E=O-f,G=I-v,q=w-O+f*2,$=M-I+v*2,V=Math.max(16,Math.ceil(Math.max(q/200,$/150)));this.surfaceWin=ro({left:E,top:G,width:q,height:$,step:V,lookupHex:c,manifest:l.manifest,seedInt:m,reliefStrength:R,reliefStyle:x}),this.lastSurfaceRevision=p,this.lastSurfaceStrength=R,this.lastSurfaceStyle=x,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(i),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,l.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.uniform2f(this.uCamCenter,a.x,a.y),r.uniform2f(this.uViewportSize,a.viewportWidth,a.viewportHeight),r.uniform1f(this.uZoom,a.zoom),r.uniform1f(this.uTime,b),r.uniform2i(this.uGridOrigin,Y,X),r.uniform2i(this.uGridSize,C,A),r.uniform1i(this.uForestFloorLayer,l.forestFloorLayer),r.uniform1f(this.uShowGrid,g?1:0),r.uniform2i(this.uHoverHex,S?S.q:-999999,S?S.r:-999999);let W=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,W?W.left:0,W?W.top:0,W?W.width:1,W?W.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,T))),r.uniform1f(this.uWaterHexMode,y==="hex"?1:0),r.uniform1f(this.uReliefEnabled,_?1:0),r.uniform1f(this.uReliefLighting,k?1:0),r.uniform1f(this.uWindEnabled,P?1:0),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:C*A,uploaded:K}}renderCloudOverlay(e){if(!this.hasUnknownCells||this.lastSpanQ<=0||this.lastSpanR<=0)return 0;let{gl:r,cloudProgram:o,vao:i,cellTex:n}=this,{cam:s,assets:u,timeSec:a,windAnimation:l=!0}=e;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(o),r.bindVertexArray(i),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,u.cloudTexture),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,u.cloudEdgeTexture??u.cloudTexture),r.uniform2f(this.cuCamCenter,s.x,s.y),r.uniform2f(this.cuViewportSize,s.viewportWidth,s.viewportHeight),r.uniform1f(this.cuZoom,s.zoom),r.uniform1f(this.cuTime,a),r.uniform2i(this.cuGridOrigin,this.lastMinQ,this.lastMinR),r.uniform2i(this.cuGridSize,this.lastSpanQ,this.lastSpanR),r.uniform1f(this.cuHasClouds,u.cloudTexture?1:0),r.uniform1f(this.cuHasCloudEdge,u.cloudEdgeTexture?1:0),r.uniform1f(this.cuWindEnabled,l?1:0),r.drawArrays(r.TRIANGLES,0,3),1}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program),this.gl.deleteProgram(this.cloudProgram)}};var Fo=65536,qr=6,Ji=`#version 300 es
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
`,ea=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,Br=class{constructor(e){this.verts=new Float32Array(Fo*qr);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,Ji),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,ea),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate vector program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=qr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,8),e.bindVertexArray(null);let a=l=>{let c=e.getUniformLocation(i,l);if(!c)throw new Error(`Missing vector uniform: ${l}`);return c};this.uCamCenter=a("u_camCenter"),this.uViewportSize=a("u_viewportSize"),this.uZoom=a("u_zoom")}pushTri(e,r,o,i,n,s,u,a,l,c){if(this.vertCount+3>Fo)return;let h=this.vertCount*qr,d=this.verts;d[h++]=e,d[h++]=r,d[h++]=u,d[h++]=a,d[h++]=l,d[h++]=c,d[h++]=o,d[h++]=i,d[h++]=u,d[h++]=a,d[h++]=l,d[h++]=c,d[h++]=n,d[h++]=s,d[h++]=u,d[h++]=a,d[h++]=l,d[h++]=c,this.vertCount+=3}pushSegment(e,r,o,i){let n=r.x-e.x,s=r.y-e.y,u=Math.hypot(n,s);if(u<1e-4)return;let a=-s/u*(o*.5),l=n/u*(o*.5),[c,h,d,m]=i;this.pushTri(e.x-a,e.y-l,e.x+a,e.y+l,r.x+a,r.y+l,c,h,d,m),this.pushTri(e.x-a,e.y-l,r.x+a,r.y+l,r.x-a,r.y-l,c,h,d,m)}pushDisc(e,r,o,i,n,s){let[u,a,l,c]=s;for(let h=0;h<n;h++){let d=h/n*Math.PI*2,m=(h+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(d)*o,r+Math.sin(d)*i,e+Math.cos(m)*o,r+Math.sin(m)*i,u,a,l,c)}}pushHexFill(e,r,o,i=1){let n=We(e,r),s=ar(e,r),[u,a,l,c]=o;for(let h=0;h<6;h++){let d=s[h],m=s[(h+1)%6],p=n.x+(d.x-n.x)*i,b=n.y+(d.y-n.y)*i,g=n.x+(m.x-n.x)*i,S=n.y+(m.y-n.y)*i;this.pushTri(n.x,n.y,p,b,g,S,u,a,l,c)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*qr)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s}=e;if(!o)return 0;this.vertCount=0;let u=a=>s?{x:a.x,y:a.y-s(a.x,a.y/Te)*Te}:a;if(o.territory&&o.territory.length>0){let a=new Map;for(let d of o.territory)a.set(Le(d.q,d.r),d.ownerId);let l=.08+n*.24,c=Math.max(7,10/Math.max(.2,r.zoom*1.1)),h=.75+n*.2;for(let d of o.territory){let m=i(d.q,d.r);if(m===0)continue;let p=m===1?.65:1,[b,g,S]=d.color;this.pushHexFill(d.q,d.r,[b,g,S,l*p],.98);for(let T=0;T<6;T++){let[y,_]=Me[T];if(a.get(Le(d.q+y,d.r+_))!==d.ownerId){let{a:k,b:x}=ct(d.q,d.r,T),P=We(d.q,d.r),L={x:k.x+(P.x-k.x)*.05,y:k.y+(P.y-k.y)*.05},C={x:x.x+(P.x-x.x)*.05,y:x.y+(P.y-x.y)*.05};this.pushSegment(L,C,c,[b,g,S,h*p])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let a=1-n*.85;for(let l of o.buildings){let c=i(l.q,l.r);if(c===0)continue;let h=(c===1?.65:1)*a,d=u(We(l.q,l.r)),p=l.kind==="capital"||l.kind==="settlement"||l.kind==="fortress"?106:78,b=p*.72;this.pushDisc(d.x,d.y+4,p*1.18,b*1.18,18,[.42,.36,.26,.22*h]),this.pushDisc(d.x,d.y+4,p*.88,b*.88,16,[.48,.42,.31,.36*h])}}if(o.buildPreview){let a=o.buildPreview;for(let c of a.bonusHexes)this.pushHexFill(c.q,c.r,[.22,.82,.48,.24],.92);let l=a.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(a.center.q,a.center.r,l,.96)}if(o.selectedHex){let a=ar(o.selectedHex.q,o.selectedHex.r),l=Math.max(5,6/Math.max(.25,r.zoom));for(let c=0;c<6;c++)this.pushSegment(a[c],a[(c+1)%6],l,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:i,timeSec:n,coveredBuildingIds:s,coveredSiteIds:u}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let a of o.buildings){let l=i(a.q,a.r);if(l===0)continue;let c=l===1?.65:1,h=We(a.q,a.r),[d,m,p]=a.factionColor;if(a.rangeRadius&&a.rangeRadius>0){let _=a.rangeRadius*240,B=_*.85,k=36;for(let x=0;x<k;x+=2){let P=x/k*Math.PI*2,L=(x+1)/k*Math.PI*2;this.pushSegment({x:h.x+Math.cos(P)*_,y:h.y+Math.sin(P)*B},{x:h.x+Math.cos(L)*_,y:h.y+Math.sin(L)*B},Math.max(4,3.5/Math.max(.2,r.zoom)),[d,m,p,.45*c])}}if(s?.has(a.id))continue;let b=a.kind==="capital"||a.kind==="settlement",g=a.kind==="fortress"||a.kind==="watchtower",S=b?78:g?64:52,T=b?68:g?76:42;this.pushDisc(h.x-10,h.y+8,S*1.12,S*.62,16,[.05,.07,.09,.45*c]),this.pushDisc(h.x,h.y+4,S,S*.56,6,[.34,.32,.29,.96*c]);let y=S*.68;this.pushTri(h.x-y,h.y+6,h.x+y,h.y+6,h.x+y,h.y-T*.65,.78*c,.74*c,.66*c,.98),this.pushTri(h.x-y,h.y+6,h.x+y,h.y-T*.65,h.x-y,h.y-T*.65,.66*c,.62*c,.55*c,.98),this.pushTri(h.x-y*1.18,h.y-T*.62,h.x+y*1.18,h.y-T*.62,h.x,h.y-T*1.25,d*c,m*c,p*c,.98),(b||g)&&this.pushTri(h.x-14,h.y-T*.95,h.x+14,h.y-T*.95,h.x,h.y-T*1.55,.96*c,.8*c,.34*c,.98)}if(o.sites)for(let a of o.sites){if(u?.has(a.id)||i(a.q,a.r)===0)continue;let c=We(a.q,a.r),h=26,d=a.family==="fauna"?[.85,.58,.25,.9]:a.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(c.x,c.y-h,c.x+h,c.y,c.x,c.y+h,d[0],d[1],d[2],d[3]),this.pushTri(c.x,c.y-h,c.x,c.y+h,c.x-h,c.y,d[0]*.8,d[1]*.8,d[2]*.8,d[3])}if(o.units)for(let a of o.units){if(i(a.q,a.r)<2)continue;let[c,h,d]=a.factionColor,m=We(a.q,a.r);if(a.marchPath&&a.marchPath.length>=2){let p=a.marchPath.map(L=>We(L.q,L.r));for(let L=0;L<p.length-1;L++)this.pushSegment(p[L],p[L+1],Math.max(8,6/Math.max(.2,r.zoom)),[c,h,d,.78]);let b=p[p.length-1],g=p[p.length-2],S=b.x-g.x,T=b.y-g.y,y=Math.hypot(S,T)||1,_=S/y,B=T/y,k=b,x={x:b.x-_*28,y:b.y-B*28};this.pushTri(k.x,k.y,x.x-B*18,x.y+_*18,x.x+B*18,x.y-_*18,c,h,d,.95);let P=n*.14%1;m={x:p[0].x+(p[1].x-p[0].x)*P,y:p[0].y+(p[1].y-p[0].y)*P}}if(a.inCombat){let p=1+.22*Math.sin(n*5);this.pushDisc(m.x,m.y,56*p,44*p,20,[.98,.26,.22,.35])}this.pushDisc(m.x,m.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(m.x,m.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(m.x,m.y-16,26,26,18,[c,h,d,.98])}if(o.walls)for(let a of o.walls){if(!a.breached)continue;let l=at(a.q1,a.r1,a.q2,a.r2);if(l<0)continue;let{mid:c}=ct(a.q1,a.r1,l),h=1+.18*Math.sin(n*4.5);this.pushDisc(c.x,c.y,32*h,24*h,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var ta=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],Lo=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],ra={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function na(t,e,r,o){let i=t.infrastructure.sprites,n=[];e==="stone"?(o?(n.push(`walls/stone/gates/v1/gate_dir${r}`),r===5&&n.push("walls/stone/gates/v1/gate_dir2"),n.push(`walls/stone/v7/edge_dir${r}`)):n.push(`walls/stone/v7/edge_dir${r}`),n.push(`walls/palisade/edge_dir${r}`)):(o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`));for(let s of n)if(i[s])return s;return null}function oa(t,e,r){let o=t.infrastructure.sprites,i=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${i}`,`walls/palisade/${i}`]:[`walls/palisade/${i}`];for(let s of n)if(o[s])return s;return null}function Io(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,i,n,s]=r.boundsInSpriteWidth,u=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*u,shadowRelTop:i*u,shadowWidth:(n-o)*u,shadowHeight:(s-i)*u}}function Do(t,e,r,o){if(!e.length)return[];let i=[],n=o?.occupiedRiverEdges,s=o?.lookupHex,u=new Map;for(let a of e){let l=at(a.q1,a.r1,a.q2,a.r2);if(l<0)continue;if(n&&n.size>0){let S=Qe(a.q1,a.r1,a.q2,a.r2);if(n.has(S.key))continue}if(s){let S=s(a.q1,a.r1),T=s(a.q2,a.r2);if(S&&(dt(S.terrainId)||S.reliefClass==="mountain")||T&&(dt(T.terrainId)||T.reliefClass==="mountain"))continue}let c=r(a.q1,a.r1),h=r(a.q2,a.r2),d=c>=h?c:h;if(d===0)continue;let{a:m,b:p,mid:b}=ct(a.q1,a.r1,l),g=na(t,a.kind,l,!!a.isGate);if(g){let S=t.infrastructure.sprites[g],T=g.includes("/stone/"),[y,_,B,k]=T?Lo[l]:ta[l],x=p.x-m.x,P=p.y-m.y,L=Math.hypot(x,P)||1,C=-P/L,A=x/L;(A<0||Math.abs(A)<1e-9&&C<0)&&(C=-C,A=-A);let Y=T?24:16,X=C*Y,K=A*Y*.62,R=Math.abs(x)>1e-6?(K-P/x*X)*.5:T?5.5:3.5,H=k;if(T){let O=Lo[(l+3)%6][3];H=(k+O-P)*.5}let re=T?"stone":"palisade";i.push({x:m.x,y:m.y,relLeft:-B,relTop:-H+R,width:y,height:_,page:S.page,u0:S.uv[0],v0:S.uv[1],u1:S.uv[2],v1:S.uv[3],sortY:b.y,fogState:d,...Io(t,`wall_shadow:${re}:dir${l}`)})}for(let S of[m,p]){let T=`${Math.round(S.x*10)},${Math.round(S.y*10)}`,y=u.get(T);y||(y={x:S.x,y:S.y,degree:0,hasPalisade:!1,hasStone:!1,fog:d},u.set(T,y)),y.degree++,a.kind==="palisade"&&(y.hasPalisade=!0),a.kind==="stone"&&(y.hasStone=!0),d>y.fog&&(y.fog=d)}}for(let a of u.values()){let l=a.hasStone&&!a.hasPalisade?"stone":"palisade",c=a.degree===1,h=oa(t,l,c);if(!h)continue;let d=t.infrastructure.sprites[h],m=ra[l],p=c?m.endW:m.cornerW,b=c?m.endH:m.cornerH;i.push({x:a.x,y:a.y,relLeft:-p*.5,relTop:-b+m.south,width:p,height:b,page:d.page,u0:d.uv[0],v0:d.uv[1],u1:d.uv[2],v1:d.uv[3],sortY:a.y+1,fogState:a.fog,...Io(t,`wall_shadow:${l}:post`)})}return i.sort((a,l)=>a.sortY-l.sortY||a.x-l.x),i}var wn={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0,showGroundDecals:!0},Ur=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=gn(null);this.cachedWallSprites=[];this.wallCacheKey="";this.cachedOccupiedRiverEdges=new Set;this.riverEdgesCacheKey="";this.lastVisibleRiverRoutes=[];this.cachedBridgeSprites=[];this.bridgeCacheKey="";this.cachedBuildingSprites=[];this.buildingCacheKey="";this.coveredBuildingIds=new Set;this.cachedSiteSprites=[];this.siteCacheKey="";this.coveredSiteIds=new Set;this.cachedInfraSprites=[];this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...ut,...o.forestConfig??{}},this.reliefConfig={...At,...o.reliefConfig??{}},this.visualConfig={...wn,...o.visualConfig??{}};let i=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!i)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=i,this.terrainPass=new Dr(i),this.roadPass=new Lr(i),this.riverPass=new br(i),this.vectorPass=new Br(i),this.spriteBatcher=new Ir(i),this.animatedActorPass=new _r(i),this.camera=new Tr(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await hn(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new Zt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await hn(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let i=this.assets;return this.assets=o,this.chunkManager=new Zt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",i?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey=""),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.infrastructureClearance=gn(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}getOccupiedRiverEdgeKeys(){if(!this.riverEdgesCacheKey&&this.chunkManager){let e=this.chunkManager;this.cachedOccupiedRiverEdges=wt({routes:this.lastVisibleRiverRoutes,manualRivers:this.dynamicScene?.rivers,isWaterHex:(r,o)=>{let i=e.lookupTerrainHex(r,o);return i?e.isWaterTerrain(i.terrainId):!1}})}return this.cachedOccupiedRiverEdges}validateWallPlacement(e,r,o,i,n=!1){return yr({q1:e,r1:r,q2:o,r2:i,isGate:n,lookupHex:(s,u)=>this.chunkManager?.lookupTerrainHex(s,u),occupiedRiverEdges:this.getOccupiedRiverEdgeKeys(),existingRoads:this.dynamicScene?.roads})}validateRoadPlacement(e,r,o,i){return wr({q1:e,r1:r,q2:o,r2:i,lookupHex:(n,s)=>this.chunkManager?.lookupTerrainHex(n,s),existingWalls:this.dynamicScene?.walls})}validateRiverPlacement(e,r,o){return xr({q:e,r,dir:o,lookupHex:(i,n)=>this.chunkManager?.lookupTerrainHex(i,n),existingWalls:this.dynamicScene?.walls})}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let o=0;o<e.length;o++){let i=e[o];if(i.inCombat||i.marchPath&&i.marchPath.length>=2)return!0}let r=this.dynamicScene?.sites;if(r&&r.length>0){for(let o=0;o<r.length;o++)if(r[o].family==="fauna")return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let i=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let s=this.camera.state,u=this.gl;u.viewport(0,0,u.canvas.width,u.canvas.height);let a=(e-this.startTimeMs)*.001,l=pn(s.zoom),c=1-l,h=c>.02,d=this.visualConfig.windAnimation!==!1,{sprites:m,fogStates:p,decals:b,decalFogStates:g,shorelines:S,shoreFogStates:T,riverRoutes:y,chunksLoadedThisFrame:_,hasPendingChunks:B}=o.prepareVisibleFrame(s,h?2:6,h),k=(te,ne)=>{let le=o.lookupTerrainHex(te,ne);return le?le.fogState:0},x=performance.now(),P=this.terrainPass.render({cam:s,assets:r,lookupHex:(te,ne)=>o.lookupTerrainHex(te,ne),resolveTerrainLayer:(te,ne,le)=>o.resolveTerrainLayer(te,ne,le),isWaterTerrain:te=>o.isWaterTerrain(te),seedInt:o.seedInt,dataRevision:o.revision,timeSec:a,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:d}),L=this.spriteBatcher.renderShorelines({cam:s,shorelines:S,fogStates:T,infraPages:r.infraPages,projectY:Te}),C=(te,ne)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(te,ne):0,A=this.roadPass.render({cam:s,roads:this.dynamicScene?.roads,lookupFog:k,strategicBlend:l,sampleReliefHeight:C}),Y=this.riverPass.render({cam:s,assets:r,routes:y,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:C,lookupFog:k,lookupHex:(te,ne)=>o.lookupTerrainHex(te,ne),timeSec:a,windAnimation:d}),X=this.vectorPass.renderGroundPass({cam:s,scene:this.dynamicScene,lookupFog:k,strategicBlend:l,sampleReliefHeight:C}),K=performance.now(),R=m,H=p;if(!this.infrastructureClearance.isEmpty&&m.length>0){R=[],H=[];for(let te=0;te<m.length;te++){let ne=m[te];bn(ne,this.infrastructureClearance)||(R.push(ne),H.push(p[te]))}}let re=this.dynamicScene?.customSprites;if(h&&re&&re.length>0){let te=[];for(let ne=0;ne<R.length;ne++)te.push({sprite:R[ne],fog:H[ne]});for(let ne of re){let le=r.manifest.nature.sprites[ne.spriteKey];if(!le)continue;let Fe=We(ne.q,ne.r),Ue=Fe.x+(ne.offsetX??0),qe=Fe.y+(ne.offsetY??0),F=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(Ue,qe/Te)*Te:0,z=(ne.worldWidthOverride??le.worldWidth)*Tt(le)*(ne.scale??1),ae=z*le.aspect,j=r.manifest.shadows.sprites[ne.spriteKey],U=ne.anchorOverride??le.anchor;te.push({sprite:{x:Ue,y:qe-F,sortY:qe,width:z,height:ae,anchorX:U[0],anchorY:U[1],page:le.page,u0:le.uv[0],v0:le.uv[1],u1:le.uv[2],v1:le.uv[3],q:ne.q,r:ne.r,isMountain:le.kind==="mountain",isSnowFamily:fr(le),shadowTier:ln(le,z,ae),selfShadeWeight:cn(le),shadowPage:j?j.page:-1,shadowU0:j?j.uv[0]:0,shadowV0:j?j.uv[1]:0,shadowU1:j?j.uv[2]:0,shadowV1:j?j.uv[3]:0,shadowMinX:j?j.boundsInSpriteWidth[0]:0,shadowMinY:j?j.boundsInSpriteWidth[1]:0,shadowMaxX:j?j.boundsInSpriteWidth[2]:0,shadowMaxY:j?j.boundsInSpriteWidth[3]:0},fog:k(ne.q,ne.r)})}te.sort((ne,le)=>(ne.sprite.sortY??ne.sprite.y)-(le.sprite.sortY??le.sprite.y)||ne.sprite.x-le.sprite.x),R=te.map(ne=>ne.sprite),H=te.map(ne=>ne.fog)}let O=this.sceneRevision*1000003+o.revision,w=this.dynamicScene?.rivers,I=y.map(te=>te.id).join(",");this.lastVisibleRiverRoutes=y;let M=`${O}|${I}`;this.riverEdgesCacheKey!==M&&(this.cachedOccupiedRiverEdges=wt({routes:y,manualRivers:w,isWaterHex:(te,ne)=>{let le=o.lookupTerrainHex(te,ne);return le?o.isWaterTerrain(le.terrainId):!1}}),this.riverEdgesCacheKey=M);let D=!1,W=`${O}|${I}`;this.wallCacheKey!==W&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?Do(r.manifest,this.dynamicScene.walls,k,{occupiedRiverEdges:this.cachedOccupiedRiverEdges,lookupHex:(te,ne)=>o.lookupTerrainHex(te,ne)}):[],this.wallCacheKey=W,D=!0);let f=this.dynamicScene?.roads,v=!!(f&&f.length>0)&&(y.length>0||!!(w&&w.length>0)),E=v?`${O}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}|${I}`:"";if(this.bridgeCacheKey!==E){if(v&&f){let te=wo({roads:f,routes:y,manualRivers:w,lookupFog:k,isWaterHex:(ne,le)=>{let Fe=o.lookupTerrainHex(ne,le);return Fe?o.isWaterTerrain(Fe.terrainId):!1}});this.cachedBridgeSprites=So({manifest:r.manifest,crossings:te,sampleReliefHeight:C})}else this.cachedBridgeSprites=[];this.bridgeCacheKey=E,D=!0}let G=this.dynamicScene?.buildings,q=!!(G&&G.length>0),$=q?`${O}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.buildingCacheKey!==$){if(q&&G){let te=_o({manifest:r.manifest,buildings:G,lookupFog:k,sampleReliefHeight:(ne,le)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(ne,le):0});this.cachedBuildingSprites=te.sprites,this.coveredBuildingIds=te.coveredBuildingIds}else this.cachedBuildingSprites=[],this.coveredBuildingIds=new Set;this.buildingCacheKey=$,D=!0}let V=this.dynamicScene?.sites,J=!!(V&&V.length>0),pe=J?`${O}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.siteCacheKey!==pe){if(J&&V){let te=Ao({manifest:r.manifest,sites:V,lookupFog:k,sampleReliefHeight:C});this.cachedSiteSprites=te.sprites,this.coveredSiteIds=te.coveredSiteIds}else this.cachedSiteSprites=[],this.coveredSiteIds=new Set;this.siteCacheKey=pe,D=!0}if(D){let te=[];this.cachedWallSprites.length>0&&te.push(this.cachedWallSprites),this.cachedBridgeSprites.length>0&&te.push(this.cachedBridgeSprites),this.cachedBuildingSprites.length>0&&te.push(this.cachedBuildingSprites),this.cachedSiteSprites.length>0&&te.push(this.cachedSiteSprites),te.length===0?this.cachedInfraSprites=[]:te.length===1?this.cachedInfraSprites=te[0]:this.cachedInfraSprites=te.flat().sort((ne,le)=>ne.sortY-le.sortY||ne.x-le.x)}let ee=0;if(h&&this.visualConfig.showGroundDecals!==!1&&b.length>0){let te=b,ne=g;if(!this.infrastructureClearance.isEmpty){te=[],ne=[];for(let le=0;le<b.length;le++){let Fe=b[le];bn(Fe,this.infrastructureClearance)||(te.push(Fe),ne.push(g[le]))}}te.length>0&&(ee=this.spriteBatcher.renderWorldSprites({cam:s,sprites:te,fogStates:ne,naturePages:r.naturePages,detailOpacity:c,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:a,windAnimation:!1,isDecalPass:!0}).drawCalls)}let be=this.spriteBatcher.renderShadows({cam:s,sprites:R,fogStates:H,walls:this.cachedInfraSprites,shadowPages:r.shadowPages,shadowOpacity:this.shadowOpacity,detailOpacity:c}),Ee=performance.now(),de=this.spriteBatcher.renderWaterSurfRings({cam:s,sprites:R,fogStates:H,detailOpacity:c,timeSec:a,windAnimation:d}),Ie=this.spriteBatcher.renderWorldSprites({cam:s,sprites:R,fogStates:H,naturePages:r.naturePages,walls:this.cachedInfraSprites,infraPages:r.infraPages,detailOpacity:c,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:this.shadowOpacity,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:a,windAnimation:d}),Ce=h&&J?yo({manifest:r.manifest,sites:V,lookupFog:k,sampleReliefHeight:C,timeSec:a,animate:d}):{actors:[],coveredSiteIds:new Set},we=this.animatedActorPass.render({cam:s,assets:r,actors:Ce.actors,detailOpacity:c,shadowOpacity:this.shadowOpacity,naturePolish:this.visualConfig.naturePolish}),ge=this.terrainPass.renderCloudOverlay({cam:s,assets:r,timeSec:a,windAnimation:d}),ve;if(c>.35)if(Ce.coveredSiteIds.size===0)ve=this.coveredSiteIds;else if(this.coveredSiteIds.size===0)ve=Ce.coveredSiteIds;else{let te=new Set(this.coveredSiteIds);for(let ne of Ce.coveredSiteIds)te.add(ne);ve=te}let Be=this.vectorPass.renderTacticalPass({cam:s,scene:this.dynamicScene,lookupFog:k,timeSec:a,coveredBuildingIds:c>.35?this.coveredBuildingIds:void 0,coveredSiteIds:ve});this.overlayCanvas&&Eo({canvas:this.overlayCanvas,cam:s,scene:this.dynamicScene,lookupFog:k,strategicBlend:l,timeSec:a});let Se=performance.now();this.hasPendingStream=B||_>0;let De=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!De||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let te=this.frameTimes.length>0?this.frameTimes.reduce((le,Fe)=>le+Fe,0)/this.frameTimes.length:Math.max(16.6,Se-i),ne={fps:Math.min(120,Math.round(1e3/Math.max(8,te))),frameMs:Number((Se-i).toFixed(2)),terrainPassMs:Number((K-x).toFixed(2)),shadowPassMs:Number((Ee-K).toFixed(2)),spritePassMs:Number((Se-Ee).toFixed(2)),drawCalls:1+L.drawCalls+A+Y+X+ee+be.drawCalls+de+Ie.drawCalls+we.drawCalls+ge+Be,visibleHexes:P.visibleHexes,renderedSprites:Ie.renderedSprites+we.renderedActors,renderedShadows:be.renderedShadows,loadedChunks:o.loadedChunkCount,mode:Ro(s.zoom),strategicBlend:Number(l.toFixed(2)),vramTier:r.vramTier,zoom:Number(s.zoom.toFixed(2)),centerHex:tt(s.x,s.y)};this.options.onMetrics(ne)}return De}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.roadPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.animatedActorPass.dispose(),this.assets?.dispose(),this.assets=null}};var Bo={VedrasMapEngine:Ur,createGeographyV2ChunkProvider:co,createSandboxScenario:mo,computeScenarioFog:go,evaluateDecision0121BuildPreview:Qt,SANDBOX_SCENARIO_LIST:po,VIELFALT_MIX_OVERRIDES:Ft,DEFAULT_FOREST_CONFIG:ut,DEFAULT_RELIEF_CONFIG:At,DEFAULT_VISUAL_CONFIG:wn,computeBoulderSpawnScale:vr,sizeFactor:Tt,GeographyV2:qo.default,placementRules:{isWaterTerrainId:dt,collectOccupiedRiverEdgeKeys:wt,validateWallEdgePlacement:yr,validateRoadEdgePlacement:wr,validateRiverEdgePlacement:xr},hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:Me,axialToWorld:We,worldToAxial:tt,hexDistance:je,hexKey:Le,hexEdgeEndpoints:ct,canonicalEdgePair:Qe,neighborDirection:at,pickNearestHexEdge:Mn}};typeof window<"u"&&(window.VedrasMapEngineLib=Bo);var Fs=Bo;})();
