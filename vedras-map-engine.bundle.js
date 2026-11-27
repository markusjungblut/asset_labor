/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var Ci=Object.create;var Un=Object.defineProperty;var Ri=Object.getOwnPropertyDescriptor;var Mi=Object.getOwnPropertyNames;var Ti=Object.getPrototypeOf,Ei=Object.prototype.hasOwnProperty;var Pi=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var Ai=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Mi(e))!Ei.call(t,i)&&i!==r&&Un(t,i,{get:()=>e[i],enumerable:!(o=Ri(e,i))||o.enumerable});return t};var sn=(t,e,r)=>(r=t!=null?Ci(Ti(t)):{},Ai(e||!t||!t.__esModule?Un(r,"default",{value:t,enumerable:!0}):r,t));var mr=Pi((ss,hr)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],i=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),s=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],u=[],c=(x,F=0,T=1)=>Math.min(T,Math.max(F,x)),a=(x,F)=>x+","+F;function l(x){let F=2166136261;for(let T=0;T<x.length;T++)F^=x.charCodeAt(T),F=Math.imul(F,16777619);return F>>>0}let d=Object.create(null);function h(x){let F=typeof x=="string"?x:String(x),T=d[F];return T===void 0&&(T=l(F),d[F]=T),T}function m(x,F,T,D){let I=x^Math.imul(F+32767,374761393)^Math.imul(T+65521,668265263)^D;return I=Math.imul(I^I>>>15,2246822519),I=Math.imul(I^I>>>13,3266489917),(I^I>>>16)>>>0}function g(x,F,T,D){return m(x,F,T,h(D))}let b=(x,F,T,D)=>m(x,F,T,h(D))/4294967296,p=x=>x*x*(3-2*x);function _(x,F,T){let D=F.reduce((f,[,v])=>f+T[v],0);if(D<=0)return F[0][0];let I=c(x,0,.999999999)*D;for(let[f,v]of F)if(I-=T[v],I<0)return f;return F[F.length-1][0]}let w=(x,F,T)=>x+(F-x)*T;function M(x,F,T,D,I){let f=F/D,v=T/D,L=Math.floor(f),H=Math.floor(v),O=p(f-L),X=p(v-H),$=h(I),j=1/4294967296,J=m(x,L,H,$)*j,V=m(x,L+1,H,$)*j,se=m(x,L,H+1,$)*j,ue=m(x,L+1,H+1,$)*j;return w(w(J,V,O),w(se,ue,O),X)}function y(){return s.map(([x,F,T,D,I,f,v,L])=>({group:x,id:F,label:T,defaultValue:D,min:I,max:f,step:v,help:L}))}function E(){return Object.fromEntries(s.map(x=>[x[1],x[3]]))}function k(x){if(x!==void 0&&(typeof x!="object"||x===null||Array.isArray(x)))throw Error("Ung\xFCltige Parameterdatei.");let F=E();for(let[,T,,D,I,f]of s){if(x?.[T]===void 0)continue;let v=Number(x[T]);if(!Number.isFinite(v)||v<I||v>f)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+T);F[T]=v}if(F["relief.mountainFraction"]+F["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return F}function S(x){if(!Array.isArray(x)||!x.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let F=x.map(D=>D?.stats??D);if(F.some(D=>!D||!Number.isFinite(D.total)||D.total<=0||!Number.isFinite(D.land)||D.land<0||D.land>D.total||!D.biomes||!D.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function T(D,I,f){let v=[...new Set([...D,...F.flatMap(H=>Object.keys(H[I]))])],L=F.reduce((H,O)=>H+O[f],0);return Object.fromEntries(v.map(H=>{let O=F.map($=>$[I][H]||0),X=O.reduce(($,j)=>$+j,0);return[H,{total:X,mean:X/F.length,percent:L?100*X/L:0,worldsPresent:O.filter($=>$>0).length}]}))}return{generatorVersion:e,samples:F.length,meanHexes:F.reduce((D,I)=>D+I.total,0)/F.length,meanLand:F.reduce((D,I)=>D+I.land,0)/F.length,biomes:T(n,"biomes","land"),terrains:T(i,"terrains","total")}}function R(x){if(!x||typeof x.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(x.id)||s.some(F=>F[1]===x.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let F of["defaultValue","min","max","step"])if(!Number.isFinite(x[F]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+F);if(x.min>x.defaultValue||x.defaultValue>x.max||x.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");s.push([String(x.group||"Erweiterungen"),x.id,String(x.label||x.id),x.defaultValue,x.min,x.max,x.step,String(x.help||"")])}function U(x){if(!x||!/^extension\.[a-z0-9_.]+$/.test(x.id)||typeof x.place!="function"||u.some(F=>F.id===x.id))throw Error("Ung\xFCltige Feature-Erweiterung.");u.push(x)}function C(x,F){return o.map(([T,D])=>F.get(a(x.q+T,x.r+D))).filter(Boolean)}function P(x,F,T,D,I,f=null,v=null){if(x==="arid"){if(T>I["biomes.dryThreshold"]-I["biomes.semiDesertMargin"])return"semi_desert";let L=w(D,v===null?D:v,I["geology.aridPatchMix"]),H=c(L+(I["geology.sandBias"]-.5)*.36);return _(H,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],I)}return x==="grassland"?T<I["geology.grassSparseHumidity"]?"sparse_pasture":D<I["geology.pastureSoil"]?"pasture":"grassland":x==="cold"?f&&f.hill>I["geology.highlandSoil"]&&F>=I["biomes.coldBoundary"]-I["geology.highlandColdMargin"]?"highland":F<I["biomes.coldBoundary"]-.04?T>I["biomes.snowHumidity"]?"snowfields":"frozen_tundra":F<I["biomes.coldBoundary"]&&T>.8?"snowfields":"tundra":x==="wetland"?F>I["geology.swampWarmBoundary"]?"swamp":F<.38?"moor":T>.85?"marshland":D>I["geology.wetlandSoil"]?"moor":"marshland":x==="jungle"?"jungle":x==="savanna"?T<.33?"semi_desert":"savanna":"grassland"}function Q(x,F,T){return x<T["biomes.coldBoundary"]?"cold":F>T["biomes.wetThreshold"]?x>T["biomes.jungleWarmBoundary"]?"jungle":"wetland":F<T["biomes.dryThreshold"]&&x>T["biomes.aridWarmBoundary"]?"arid":x>T["biomes.warmBoundary"]?"savanna":F>T["biomes.wetlandBoundary"]?"wetland":"grassland"}function z(x,F,T,D){let I=Math.sqrt(D["biomes.targetHexes"]),f=D["biomes.borderWarp"]*I,v=F+f*(M(x,F,T,I*.72,"warp-a")-.5)*2,L=T+f*(M(x,F,T,I*.72,"warp-b")-.5)*2,H=Math.floor(v/I),O=Math.floor(L/I),X=1/0,$=null;for(let j=-1;j<=1;j++)for(let J=-1;J<=1;J++){let V=H+J,se=O+j,ue=(V+.5+(b(x,V,se,"jit-q")-.5)*.72)*I,te=(se+.5+(b(x,V,se,"jit-r")-.5)*.72)*I,be=(v-ue)*(v-ue)+(L-te)*(L-te);be<X&&(X=be,$={id:a(V,se),x:ue,y:te})}return $}let K=(x,F)=>Math.max(Math.abs(x.q-F.q),Math.abs(x.r-F.r),Math.abs(x.q+x.r-F.q-F.r));function W(x,F,T,D,I=()=>!0){if(T<=0)return 1/0;let f=[];for(let v=0;v<1900;v++){let L=Math.floor((b(x,v,0,"sampleQ:"+F)-.5)*6900),H=Math.floor((b(x,v,1,"sampleR:"+F)-.5)*6900);I(L,H)&&f.push(D(L,H))}return f.length?(f.sort((v,L)=>L-v),f[Math.min(f.length-1,Math.floor(c(T)*f.length))]):1/0}function N(x,F){if(typeof x!="string"||x.length<1||x.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let T=k(F),D=l(r+":"+x),I={...T,"biomes.targetHexes":Math.max(5,T["geology.scale"]*1.5)},f=new Map,v=new Map,L=new Map,H=(G,Y)=>a(G,Y),O=(G,Y)=>c(T["climate.temperature"]+(M(D,G,Y,T["climate.scale"],"temp")-.5)*2*T["climate.tempVariation"]),X=(G,Y)=>c(T["climate.humidity"]+(M(D,G,Y,T["climate.scale"]*.9,"wet")-.5)*2*T["climate.humidityVariation"]);function $(G,Y){let ne=M(D,G,Y,T["water.scale"],"sea"),B=M(D,G,Y,Math.max(3,T["water.scale"]*.45),"sea-mid"),A=M(D,G,Y,Math.max(2,T["water.scale"]*.21),"shore"),q=.2+.3*T["water.coastDetail"];return(ne+B)*.5*(1-q)+A*q}function j(G,Y){let ne=M(D,G,Y,4.2,"lakes");return $(G,Y)-Math.max(0,ne-.68)*T["water.lakeInfluence"]}let J=W(D,"water",T["water.fraction"],(G,Y)=>-$(G,Y));function V(G,Y){let ne=H(G,Y);if(f.has(ne))return f.get(ne);let B=-j(G,Y)>=J;return f.set(ne,B),B}function se(G,Y){let ne=H(G,Y);if(v.has(ne))return v.get(ne);let B=M(D,G,Y,T["relief.scale"],"relief"),A=Math.max(6,T["relief.chainLength"]),q=G+(M(D,G,Y,A*.58,"m-warp-q")-.5)*11,oe=Y+(M(D,G,Y,A*.58,"m-warp-r")-.5)*11,ae=1-Math.abs(M(D,q*.56+oe*.36,oe*1.18,A,"ridge")-.5)*2,re=1-Math.abs(M(D,q*.34-oe*.74,q*1.08,A*1.25,"ridge-b")-.5)*2,le=Math.max(ae,re*.86),we=Math.pow(le,3.6),de=1-Math.abs(M(D,G*.92+Y*.28,Y*.96,7.5,"m-pass-a")-.5)*2,_e=1-Math.abs(M(D,G*.28-Y*.92,G*.96,8.2,"m-pass-b")-.5)*2,Be=Math.max(de,_e),He=Be>.82?Math.pow((Be-.82)/.18,.7)*.62:0,Qe=.92-.14*c(T["relief.chainWidth"],.05,.95),st=c(we*Qe+B*(1-Qe)-He,0,1),St=c(le*.65+B*.35,0,1),ht={mass:B,mountain:st,oreBelt:St,hill:B*.75+M(D,G,Y,T["relief.scale"]*.46,"hills")*.25};return v.set(ne,ht),ht}let ue=W(D,"mountain",T["relief.mountainFraction"],(G,Y)=>se(G,Y).mountain,(G,Y)=>!V(G,Y)),te=(G,Y)=>!V(G,Y)&&se(G,Y).mountain>=ue,be=new Map,ve=(G,Y)=>{let ne=H(G,Y);if(be.has(ne))return be.get(ne);if(!te(G,Y))return be.set(ne,!1),!1;let B=!1;for(let A=-2;A<=2&&!B;A++){let q=Math.max(-2,-A-2),oe=Math.min(2,-A+2);for(let ae=q;ae<=oe;ae++)if(!(A===0&&ae===0)&&!te(G+A,Y+ae)){B=!0;break}}return be.set(ne,B),B},he=W(D,"hills",T["relief.hillFraction"],(G,Y)=>se(G,Y).hill,(G,Y)=>!V(G,Y)&&!ve(G,Y)),me=(G,Y)=>!V(G,Y)&&!ve(G,Y)&&se(G,Y).hill>=he,xe=Math.min(16,Math.max(3,Math.ceil(T["climate.coastalDecay"]*3))),Me=new Map;function ye(G,Y){let ne=H(G,Y);if(Me.has(ne))return Me.get(ne);if(V(G,Y))return Me.set(ne,0),0;let B=xe+1;e:for(let A=1;A<=xe;A++)for(let q=-A;q<=A;q++){let oe=Math.max(-A,-q-A),ae=Math.min(A,-q+A);for(let re=oe;re<=ae;re++)if(Math.max(Math.abs(q),Math.abs(re),Math.abs(q+re))===A&&V(G+q,Y+re)){B=A;break e}}return Me.set(ne,B),B}let Te=new Map;function Se(G,Y){let ne=H(G,Y);if(L.has(ne))return L.get(ne);let B=O(G,Y),A=X(G,Y),q=ye(G,Y),oe=c(A+T["climate.coastalHumidity"]*Math.exp(-q/T["climate.coastalDecay"])),ae=z(D,G,Y,T);Te.has(ae.id)||Te.set(ae.id,{t:O(ae.x,ae.y),h:X(ae.x,ae.y)});let re=Te.get(ae.id),le=T["biomes.regionClimateMix"],we=c(re.t*le+B*(1-le)),de=c(re.h*le+oe*(1-le)),_e=Q(we,de,T),Be=M(D,G,Y,T["geology.scale"],"soil"),He=se(G,Y),Qe=(_e==="arid"&&T["geology.aridPatchMix"]>0?z(D,G,Y,I):null)?.id.split(",").map(Number),st=Qe?b(D,Qe[0],Qe[1],"arid-patch"):null,St={t:B,h:oe,center:ae,family:_e,soil:Be,landRelief:He,aridPatch:st,riverPotential:c(oe*.68+He.mass*.18+Math.min(q,15)/30)};return L.set(ne,St),St}function Ge(G,Y){return V(G,Y)?o.some(([ne,B])=>!V(G+ne,Y+B))?"coastal_water":O(G,Y)<T["water.iceTemperature"]?"icy_ocean":M(D,G,Y,T["water.scale"]*.8,"storm")>1-T["water.stormChance"]?"stormy_ocean":"ocean":"land"}function Ie(G){let Y=(ne,B)=>b(D,G.q,G.r,"feature:"+ne)<B/1e3;G.surfaceClass==="land"&&G.reliefClass!=="mountain"?(Y("iron",T["features.ironPer1000"])&&Se(G.q,G.r).landRelief.oreBelt>.3&&G.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(G.baseBiome)&&Y("animals",T["features.animalsPer1000"])&&(G.baseBiome==="wetland"||G.baseBiome==="jungle"?G.features.push("pigs"):G.baseBiome==="savanna"||G.terrainId==="sparse_pasture"?G.features.push("horses"):G.features.push(b(D,G.q,G.r,"species")>.5?"pigs":"horses")),Y("ruins",T["features.ruinsPer1000"])&&G.features.push("ruins"),Y("obelisk",T["features.obelisksPer1000"])&&G.features.push("obelisk"),G.baseBiome==="arid"&&Y("oasis",T["features.oasesPer1000"])&&G.features.push("oasis")):G.surfaceClass!=="land"&&Y("wreck",T["features.wrecksPer1000"])&&G.features.push("wreck");for(let ne of u)ne.place({hex:G,config:T,seed:x,random:B=>b(D,G.q,G.r,ne.id+":"+B)})&&G.features.push(ne.id);return G}function Oe(G,Y){let ne=Ge(G,Y),B=ne==="land",A=B?Se(G,Y):null,q=B&&ve(G,Y),oe=B&&!q&&me(G,Y),ae=B?A.family==="jungle"?1:A.family==="grassland"?.86:A.family==="wetland"?.76:A.family==="savanna"?.46:A.family==="cold"?.25:.08:0,re=B?(M(D,G,Y,T["forest.patchScale"],"forest")-.5)*1.6+T["forest.coverage"]-.3+(A.h-.5)*.35:0,le=q?0:A?.family==="jungle"?Math.max(.76,c(re)):c(re)*ae,we=q?"none":A?.family==="jungle"||le>=T["forest.denseThreshold"]*T["forest.denseFactor"]?"dense_forest":le>T["forest.lightThreshold"]?"light_forest":"none";return{q:G,r:Y,temperature:A?.t??O(G,Y),humidity:A?.h??X(G,Y),regionId:A?.center.id??"",baseBiome:A?.family??null,terrainId:B?P(A.family,A.t,A.h,A.soil,T,A.landRelief,A.aridPatch):ne,surfaceClass:ne,reliefClass:q?"mountain":oe?"hills":"flat",hillProfile:oe?["rounded","steep","chain","plateau","ridge"][Math.floor(b(D,Math.floor(G/3),Math.floor(Y/3),"hill-style")*5)]:null,hillStrength:oe?c(A.landRelief.hill*T["relief.hillVariation"]+(1-T["relief.hillVariation"])*.4):0,mountainClass:q?"massif":null,forestDensity:le,forestClass:we,riverPotential:A?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function Ue(G,Y,ne,B){let A=T["rivers.maxLength"],q=T["rivers.minLength"],oe=A+1,ae=2*A+2,re=(ge,fe)=>ge>=G&&ge<G+ne&&fe>=Y&&fe<Y+B,le=G-ae,we=Y-ae,de=ne+2*ae,_e=B+2*ae,Be=new Int16Array(de*_e);Be.fill(-1);let He=new Int32Array(de*_e),tt=new Int32Array(de*_e),Qe=0,st=0;for(let ge=0;ge<_e;ge++){let fe=we+ge,Pe=ge*de;for(let We=0;We<de;We++){let Ce=le+We;V(Ce,fe)&&(Be[Pe+We]=0,He[st]=Ce,tt[st]=fe,st++)}}for(;Qe<st;){let ge=He[Qe],fe=tt[Qe];Qe++;let Pe=Be[(fe-we)*de+(ge-le)];if(Pe>=A)continue;let We=Pe+1;for(let Ce=0;Ce<6;Ce++){let Le=ge+o[Ce][0],ke=fe+o[Ce][1],Xe=Le-le,Ve=ke-we;if(Xe<0||Xe>=de||Ve<0||Ve>=_e)continue;let rt=Ve*de+Xe;Be[rt]>=0||ve(Le,ke)||(Be[rt]=We,He[st]=Le,tt[st]=ke,st++)}}let St=[],ht=new Map,rn=T["rivers.sourcesPer100"]/100,nn=h("river-source"),on=h("river-turn"),ce=1/4294967296;function pe(ge,fe){for(let[Pe,We]of[[ge,fe],[fe,ge]]){if(!re(Pe.q,Pe.r)||V(Pe.q,Pe.r))continue;let Ce=o.findIndex(([Xe,Ve])=>Pe.q+Xe===We.q&&Pe.r+Ve===We.r);if(Ce<0)continue;let Le=H(Pe.q,Pe.r),ke=ht.get(Le);ke||(ke=[],ht.set(Le,ke)),ke.includes(Ce)||ke.push(Ce)}}for(let ge=Y-oe;ge<Y+B+oe;ge++)for(let fe=G-oe;fe<G+ne+oe;fe++){if(m(D,fe,ge,nn)*ce>=rn||Be[(ge-we)*de+(fe-le)]<q||V(fe,ge)||ve(fe,ge)||Se(fe,ge).riverPotential<.36)continue;let We=[{q:fe,r:ge}],Ce={q:fe,r:ge};for(let Le=0;Le<A;Le++){let ke=Be[(Ce.r-we)*de+(Ce.q-le)];if(ke<=0)break;let Xe=null,Ve=1/0;for(let rt=0;rt<6;rt++){let nt=Ce.q+o[rt][0],Ft=Ce.r+o[rt][1],ot=nt-le,Et=Ft-we;if(ot<0||ot>=de||Et<0||Et>=_e||Be[Et*de+ot]!==ke-1)continue;let Pt=se(nt,Ft).hill*(1-T["rivers.meander"])+m(D,nt,Ft,on)*ce*T["rivers.meander"];Pt<Ve&&(Ve=Pt,Xe={q:nt,r:Ft})}if(!Xe)break;Ce=Xe,We.push(Ce)}if(!(!V(Ce.q,Ce.r)||We.length-1<q)&&We.some(Le=>re(Le.q,Le.r))){St.push(We.map(Le=>[Le.q,Le.r]));for(let Le=1;Le<We.length;Le++)pe(We[Le-1],We[Le])}}for(let ge of ht.values())ge.sort((fe,Pe)=>fe-Pe);return{routes:St,edgesByKey:ht}}function De(G,Y){return Ie(Oe(G,Y))}return{c:T,s:D,spot:H,wet:V,relief:se,isMountain:ve,isHill:me,field:Se,surface:Ge,buildBaseCell:Oe,attachFeatures:Ie,sampleCell:De,traceRivers:Ue}}function ee(x,F={}){if(typeof x!="string"||x.length<1||x.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let T=F.width===void 0?100:Number(F.width),D=F.height===void 0?80:Number(F.height),I=F.originQ===void 0?0:Number(F.originQ),f=F.originR===void 0?0:Number(F.originR);if(!Number.isSafeInteger(T)||!Number.isSafeInteger(D)||T<10||D<10||T*D>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(I)||!Number.isSafeInteger(f)||Math.abs(I)>1e6||Math.abs(f)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let v=N(x,F.config),{c:L,s:H,spot:O,wet:X,relief:$,isMountain:j,field:J,buildBaseCell:V,attachFeatures:se}=v,ue=[],te=new Map;for(let A=f;A<f+D;A++)for(let q=I;q<I+T;q++){let oe=V(q,A);ue.push(oe),te.set(O(q,A),oe)}let be=L["rivers.maxLength"],ve=L["rivers.minLength"],he=be+1,me=2*be+2,xe=new Map,Me=[];for(let A=f-me;A<f+D+me;A++)for(let q=I-me;q<I+T+me;q++)X(q,A)&&(xe.set(O(q,A),0),Me.push({q,r:A}));let ye=I-me,Te=I+T+me-1,Se=f-me,Ge=f+D+me-1;for(let A=0;A<Me.length;A++){let q=Me[A],oe=xe.get(O(q.q,q.r));if(!(oe>=be))for(let[ae,re]of o){let le=q.q+ae,we=q.r+re,de=O(le,we);le<ye||le>Te||we<Se||we>Ge||j(le,we)||xe.has(de)||(xe.set(de,oe+1),Me.push({q:le,r:we}))}}let Ie=[],Oe=[];function Ue(A,q){for(let[oe,ae]of[[A,q],[q,A]]){let re=te.get(O(oe.q,oe.r));if(!re||re.surfaceClass!=="land")continue;re.river=!0;let le=o.findIndex(([we,de])=>oe.q+we===ae.q&&oe.r+de===ae.r);le>=0&&!re.riverEdges.includes(le)&&re.riverEdges.push(le)}}for(let A=f-he;A<f+D+he;A++)for(let q=I-he;q<I+T+he;q++){if(X(q,A)||j(q,A)||b(H,q,A,"river-source")>=L["rivers.sourcesPer100"]/100)continue;let oe=xe.get(O(q,A));if(oe===void 0||oe<ve||J(q,A).riverPotential<.36)continue;let ae=[{q,r:A}],re={q,r:A};for(let le=0;le<be;le++){let we=xe.get(O(re.q,re.r));if(we===0)break;let de=o.map(([Be,He])=>({q:re.q+Be,r:re.r+He})).filter(Be=>xe.get(O(Be.q,Be.r))===we-1);if(!de.length)break;let _e=Be=>$(Be.q,Be.r).hill*(1-L["rivers.meander"])+b(H,Be.q,Be.r,"river-turn")*L["rivers.meander"];de.sort((Be,He)=>_e(Be)-_e(He)),re=de[0],ae.push(re)}if(!(!X(re.q,re.r)||ae.length-1<ve)&&ae.some(le=>te.has(O(le.q,le.r)))){Oe.push(ae),ae.every(le=>te.has(O(le.q,le.r)))&&Ie.push(ae.map(le=>[le.q,le.r]));for(let le=1;le<ae.length;le++)Ue(ae[le-1],ae[le])}}for(let A of ue)se(A),A.riverEdges.sort((q,oe)=>q-oe);let De=ue.filter(A=>A.surfaceClass==="land").length,G={total:ue.length,land:De,water:ue.length-De,coast:0,hills:0,mountains:0,rivers:Ie.length,riverCrossingCount:Oe.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},Y=new Map;for(let A of ue){A.surfaceClass==="coastal_water"&&G.coast++,A.reliefClass==="hills"&&G.hills++,A.reliefClass==="mountain"&&G.mountains++,A.river&&G.riverHexes++,A.forestClass!=="none"&&G.forest++,A.baseBiome&&(G.biomes[A.baseBiome]=(G.biomes[A.baseBiome]||0)+1,Y.set(A.regionId,(Y.get(A.regionId)||0)+1)),A.surfaceClass==="land"&&A.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(A.baseBiome)&&G.forestEligible++,G.terrains[A.terrainId]=(G.terrains[A.terrainId]||0)+1;for(let q of A.features)G.features[q]=(G.features[q]||0)+1}G.forestPercentLand=De?+(100*G.forest/De).toFixed(1):0,G.forestPercentEligible=G.forestEligible?+(100*G.forest/G.forestEligible).toFixed(1):0;let ne=[...Y.values()].sort((A,q)=>A-q);G.biomeRegions={count:ne.length,min:ne[0]||0,average:ne.length?+(De/ne.length).toFixed(1):0,median:ne.length?ne[Math.floor(ne.length/2)]:0,max:ne.at(-1)||0,within30to90:ne.filter(A=>A>=30&&A<=90).length};function B(A){let q=new Set,oe=0;for(let ae of ue){let re=O(ae.q,ae.r);if(q.has(re)||!A(ae))continue;let le=[ae];q.add(re);for(let we=0;we<le.length;we++)for(let de of C(le[we],te)){let _e=O(de.q,de.r);A(de)&&!q.has(_e)&&(q.add(_e),le.push(de))}oe=Math.max(oe,le.length)}return oe}return G.connectedLandPercent=De?+(100*B(A=>A.surfaceClass==="land")/De).toFixed(1):0,G.largestWaterBody=B(A=>A.surfaceClass!=="land"),{version:e,seed:x,width:T,height:D,originQ:I,originR:f,config:L,cells:ue,riverPaths:Ie,riverPreviewPaths:Oe.map(A=>A.map(q=>[q.q,q.r])),stats:G,riverGeometry:"hex-edges"}}let Z={VERSION:e,DIRS:o,TERRAIN_IDS:i,BIOME_IDS:n,parameterSchema:y,defaultConfig:E,normalizeConfig:k,aggregateDistributions:S,registerParameter:R,registerFeature:U,createPointSampler:N,generateWorld:ee,getWorldCell:(x,F,T)=>{let D=x.originQ??0,I=x.originR??0;return F<D||T<I||F>=D+x.width||T>=I+x.height?null:x.cells[(T-I)*x.width+(F-D)]??null}};typeof hr<"u"&&hr.exports&&(hr.exports=Z),t.VedrasGeography=Z})(typeof window<"u"?window:globalThis)});var xi=sn(mr());var ki=Math.sqrt(3),Je=256/ki,Ee=.85,$e=1.5*Je,On=$e*Ee,Fe=16,Re=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function Ae(t,e){return{x:256*(t+e*.5),y:On*e}}function je(t,e){let r=e/On,o=t/256-r*.5,i=-o-r,n=Math.round(o),s=Math.round(r),u=Math.round(i),c=Math.abs(n-o),a=Math.abs(s-r),l=Math.abs(u-i);return c>a&&c>l?n=-s-u:a>l&&(s=-n-u),{q:n===0?0:n,r:s===0?0:s}}function Ze(t,e,r,o){let i=t-r,n=e-o;return(Math.abs(i)+Math.abs(i+n)+Math.abs(n))/2}function zt(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function ut(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function Xt(t,e,r=Fe){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function Mt(t,e){return`${t},${e}`}function qe(t,e){return`${t},${e}`}function At(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,i=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,s=-1/0,u=1/0,c=-1/0;for(let a of i){let l=je(a.x,a.y);l.q<n&&(n=l.q),l.q>s&&(s=l.q),l.r<u&&(u=l.r),l.r>c&&(c=l.r)}return{minQ:n-e,maxQ:s+e,minR:u-e,maxR:c+e}}function Nn(t,e=Fe,r=3){let o=At(t,r),i=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),s=Math.floor(o.minR/e),u=Math.floor(o.maxR/e),c=je(t.x,t.y),a=c.q/e,l=c.r/e,d=[];for(let h=s;h<=u;h++)for(let m=i;m<=n;m++){let g=m+.5-a,b=h+.5-l;d.push({cq:m,cr:h,dist2:g*g+b*b})}return d.sort((h,m)=>h.dist2-m.dist2),d.map(({cq:h,cr:m})=>({cq:h,cr:m}))}function Vn(t,e,r,o=0){let i=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return i=Math.imul(i^i>>>15,2246822519)>>>0,i=Math.imul(i^i>>>13,3266489917)>>>0,(i^i>>>16)>>>0}function ln(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function pr(t,e){let r=256*(t+e*.5),o=$e*e,i=[];for(let n=0;n<6;n++){let s=-Math.PI/2+n*Math.PI/3;i.push({x:r+Je*Math.cos(s),y:(o+Je*Math.sin(s))*Ee})}return i}function mt(t,e,r){let o=pr(t,e),i=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a:i,b:n,mid:{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}}function dt(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Re[s][0]===i&&Re[s][1]===n)return s;return-1}function et(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function zn(t,e){let r=je(t,e),o=0,i=1/0;for(let a=0;a<6;a++){let{mid:l}=mt(r.q,r.r,a),d=t-l.x,h=e-l.y,m=d*d+h*h;m<i&&(i=m,o=a)}let[n,s]=Re[o],u=et(r.q,r.r,r.q+n,r.r+s),c=dt(u.q1,u.r1,u.q2,u.r2);return{q1:u.q1,r1:u.r1,q2:u.q2,r2:u.r2,dir:c}}var Yn=[{id:"morning",label:"Morgen"},{id:"day",label:"Mittag"},{id:"dusk",label:"Abend"},{id:"night",label:"Nacht"}],$n=[{id:"clear",label:"Klar"},{id:"mist",label:"Nebel"},{id:"rain",label:"Regen"}],_t=48;function cn(t,e,r){return t<e?e:t>r?r:t}function un(t,e,r){return t+(e-t)*r}function gr(t,e,r){return[un(t[0],e[0],r),un(t[1],e[1],r),un(t[2],e[2],r)]}function br(t="day",e="clear",r=!0){let o=t==="day"&&e==="clear",i=[1,1,1],n=[1,1,1],s=[0,0,0],u=1,c=1,a=1,l=0,d=1,h=[1,.94,.82],m=0,g=[.82,.86,.9],b=0,p=[.08,.1,.14],_=0,w=[1,1,1],M=0,y=0;t==="morning"?(i=[.85,.9,1.05],n=[1.13,1.02,.87],s=[.025,.018,.016],u=1.02,c=1.03,a=1.05,d=.94,h=[1,.84,.56],m=.24,g=[.91,.87,.82],b=.16,p=[.16,.18,.26],_=.1,w=[1.05,.96,.88]):t==="dusk"?(i=[.58,.52,.76],n=[1.18,.82,.58],s=[.028,.014,.026],u=.82,c=1.08,a=1.04,l=.42,d=.86,h=[1,.56,.26],m=.34,g=[.68,.52,.54],b=.12,p=[.14,.09,.18],_=.28,w=[.88,.72,.68],M=.68,y=.72):t==="night"&&(i=[.18,.24,.44],n=[.52,.66,.94],s=[.014,.024,.056],u=.62,c=1.12,a=.56,l=1,d=.54,h=[.46,.64,.95],m=.14,g=[.22,.3,.48],b=.12,p=[.04,.06,.14],_=.46,w=[.44,.52,.72],M=1,y=1);let E=0;return e==="mist"?(g=t==="night"?[.28,.36,.52]:t==="dusk"?[.76,.64,.64]:t==="morning"?[.92,.9,.86]:[.84,.88,.91],b=cn(b+.34,0,.58),a*=.82,c*=.92,d*=.68,m*=.65,w=gr(w,[.9,.93,.96],.25)):e==="rain"&&(i=gr(i,[.58,.66,.76],.34),n=gr(n,[.82,.88,.95],.42),u*=t==="night"?.9:.84,c*=1.05,a*=.72,d*=.54,m*=.25,g=t==="night"?[.18,.24,.36]:[.58,.66,.74],b=cn(b+.18,0,.44),p=[.06,.1,.16],_=cn(_+.22,0,.62),w=gr(w,[.68,.74,.82],.48),E=1,y*=.2),r||(M=0),{timeOfDay:t,weather:e,isIdentity:o,shadowTint:i,highlightTint:n,ambientLift:s,brightness:u,contrast:c,saturation:a,nightFactor:l,shadowOpacityScale:d,sunGlowColor:h,sunGlowStrength:m,mistColor:g,mistDensity:b,vignetteColor:p,vignetteStrength:_,cloudTint:w,lanternIntensity:M,rainIntensity:E,fireflyIntensity:y}}function Wi(t){let e=t.kind;return e==="capital"||t.centerStage==="metropolis"?{radius:340,intensity:1.25,offsetY:-18,style:0}:e==="settlement"?t.centerStage==="city"?{radius:295,intensity:1.15,offsetY:-16,style:0}:t.centerStage==="outpost"?{radius:205,intensity:.95,offsetY:-12,style:1}:{radius:255,intensity:1.08,offsetY:-14,style:0}:e==="fortress"?{radius:265,intensity:1.14,offsetY:-16,style:1}:e==="watchtower"?{radius:195,intensity:1.05,offsetY:-22,style:1}:e==="harbor"?{radius:235,intensity:1.04,offsetY:-10,style:0}:e==="barracks"||e==="academy"||e==="trade_office"||e==="iron_mine"?{radius:200,intensity:.96,offsetY:-12,style:0}:e==="farm"||e==="lumber_camp"||e==="quarry"||e==="restored_dwelling"?{radius:175,intensity:.86,offsetY:-10,style:2}:null}function Xn(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967295*Math.PI*2}function Kn(t){let{cam:e,scene:r,lookupFog:o,sampleReliefHeight:i,lanternIntensity:n,strategicBlend:s=0}=t;if(!r||n<=.01)return[];let u=420,c=e.viewportWidth*.5/Math.max(.08,e.zoom)+u,a=e.viewportHeight*.5/Math.max(.08,e.zoom)+u,l=e.x-c,d=e.x+c,h=e.y-a,m=e.y+a,g=[];if(r.buildings)for(let b=0;b<r.buildings.length;b++){let p=r.buildings[b],_=o(p.q,p.r);if(_===0)continue;let w=Wi(p);if(!w)continue;let M=p.kind==="capital"||p.kind==="settlement"||p.kind==="fortress"||p.kind==="harbor";if(s>.65&&!M)continue;let y=Ae(p.q,p.r),E=i?i(y.x,y.y/Ee)*Ee:0,k=y.x,S=y.y-E+w.offsetY*(1-s);if(k<l||k>d||S<h||S>m)continue;let R=_===1?.58:1,U=1+s*.65,C=Math.hypot(k-e.x,S-e.y),P=(M?2.5:1)*w.intensity-C*25e-5;g.push({light:{x:k,y:S,radius:w.radius*U,intensity:w.intensity*n*R,flickerSeed:Xn(p.q,p.r,b+17),style:w.style},score:P})}if(r.walls&&s<.6){let b=1-s/.6;for(let p=0;p<r.walls.length;p++){let _=r.walls[p];if(!_.isGate)continue;let w=Math.max(o(_.q1,_.r1),o(_.q2,_.r2));if(w===0)continue;let M=Ae(_.q1,_.r1),y=Ae(_.q2,_.r2),E=(M.x+y.x)*.5,k=(M.y+y.y)*.5;if(E<l||E>d||k<h||k>m)continue;let S=i?i(E,k/Ee)*Ee:0,R=w===1?.55:1,U=Math.hypot(E-e.x,k-e.y);g.push({light:{x:E,y:k-S-8,radius:165,intensity:.92*n*R*b,flickerSeed:Xn(_.q1+_.q2,_.r1+_.r2,p*31+9),style:1},score:1.2-U*25e-5})}}return g.length>_t&&(g.sort((b,p)=>p.score-b.score),g.length=_t),g.map(b=>b.light)}var pt={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},yr=new Set(["dead_trees","snow_dead_trees"]),fn=new Set(["fallen_logs","snow_fallen_logs"]),Fi=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),Li=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),vr=new Set(["snowfields","frozen_tundra","tundra","highland"]);var jn=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),Jn=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),kt=new Set(["snowfields","frozen_tundra"]),Yt=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),hn=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),eo=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),Ii=new Set([...eo,"savanna","jungle"]);function lt(t,e,r){return t<e?e:t>r?r:t}function ie(t,e,r,o=0,i=97,n=513,s=11){let u=(t|0)^Math.imul(e+i,374761393)^Math.imul(r+n,668265263)^Math.imul(o+s,2246822519);return u^=u>>>13,u=Math.imul(u,1274126177),((u^u>>>16)>>>0)/4294967296}function $t(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function Di(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var Kt=new Set(["ocean","coastal_water","stormy_ocean"]);function Wt(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function xr(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function mn(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function pn(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function wr(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function Sr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function gn(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function to(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:hn.has(t)?.14:0}function bn(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*($t(t)?.32:.25):Li.has(t.family??"")?e:e*1.2}function _r(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"||e==="snow_mountains"}function It(t){if(!t||t.kind==="mountain")return 1;let e=bn(t),r=t.family??"",o=jt(t)==="cacti"?1.55:1;return yr.has(r)?.58*e:fn.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.tags?.includes("round_cactus")||/^(?:existing_)?cactus_0?[12]$/.test(t.id??"")||t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_decal"?1.05:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function ro(t){return!!t&&t.kind==="tree"&&!yr.has(t.family??"")}function no(t){return!!t&&Fi.has(t.family??"")}function oo(t){let e=t?.family??"";return yr.has(e)?"dead_trees":fn.has(e)?"fallen_logs":null}function io(t){let e=t?.family??"";return yr.has(e)?.11:fn.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function ao(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function so(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function jt(t){let e=so(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}var Zn=new Set(["snowfields","frozen_tundra","tundra","highland"]),Bi=new Set(["highland","tundra","grassland","pasture","sparse_pasture","forest_floor","moor","marshland","swamp"]),lo=new Set(["desert","sandy_desert","rocky_desert","sandy_rocky_desert","clay_desert","badlands","sandy_badlands","rocky_badlands","semi_desert","wasteland","savanna","dry_ground"]),qi=new Set([...eo,"forest_floor","highland","jungle",...lo]);function co(t){if(!t||t.kind!=="mountain")return!1;let e=String(t.id??"");if(t.family==="snow_mountains"||/^snow_mountain_\d+$/.test(e)||/^(?:existing_)?berg_(?:0?[1-9]|1[0-6])$/.test(e))return!0;let r=t.tags??[];return r.includes("arctic_snow_mountain")||r.includes("alpine_snow_mountain")||r.includes("snow_tipped_mountain")}function Zt(t){let e=String(t.id??""),r=so(t);return Wt(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?Kt:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||Sr(t)?hn:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?vr:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?jn:Di(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?vr:$t(t)?jn:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?Ii:/^snow_mountain_\d+$/.test(e)||t.family==="snow_mountains"||/^(?:existing_)?berg_(?:1[4-6])$/.test(e)||/^(?:existing_)?berg_0?[1-4]$/.test(e)?Zn:/^(?:existing_)?berg_(?:0?[5-9]|1[0-3])$/.test(e)?Bi:/^desert_mountain_\d+$/.test(e)||t.family==="desert_mountains"?lo:/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?qi:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function uo(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,i=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),s=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),u=new Set;for(let[c,a]of Object.entries(e.terrain.byType))s.has(c)||(a.categoryId&&i.has(a.categoryId)||n.has(c))&&u.add(c);return u}function dn(t,e,r,o,i,n=!1){if(!e)return!1;let s=o.terrain.byType[e];if(Wt(t))return Kt.has(e);if(s&&s.materialClass!=="ground")return!1;let c=i?i.ecoFamily:jt(t),a=e,l=i?i.strict:Zt(t);if(l)return l.has(a);let d=n||r.some(b=>{let p=o.terrain.byType[b]?.materialClass;return p==="water"||p==="shoreline"}),h=r.some(b=>b==="jungle"||b==="savanna"),m=r.some(b=>b==="moor"||b==="swamp"||b==="marshland");if(c==="mangroves")return(a==="swamp"||a==="marshland")&&(d||h);if(c==="palms")return a==="jungle"||a==="savanna"||a==="tropical_coast"||Yt.has(a);if(c==="jungle_trees"||c==="tropical_bushes")return a==="jungle";if(c==="savanna_trees")return a==="savanna"||a==="semi_desert"||gn(t)&&Yt.has(a);if(c==="cacti")return a==="rocky_desert"||a==="sandy_desert"||a==="clay_desert"||a==="desert"||a==="semi_desert"||a==="sandy_rocky_desert"||a==="savanna";if(c==="succulents")return a==="savanna"||a==="semi_desert"||a==="rocky_desert"||a==="sandy_desert"||a==="sandy_rocky_desert"||a==="badlands"||a==="desert";if(c==="ferns")return a==="forest_floor"||a==="grassland"||a==="pasture"||a==="moor"||a==="swamp"||a==="marshland"||a==="jungle";if(c==="reeds")return a==="moor"||a==="swamp"||a==="marshland"||(a==="grassland"||a==="pasture"||a==="sparse_pasture")&&(d||m);if(c==="cold_bushes")return a==="tundra"||a==="frozen_tundra"||a==="highland";if(c==="snow_conifers"||c==="snow_dead_trees"||c==="snow_deadwood"||c==="snow_fallen_logs")return vr.has(a);if(c==="riparian_trees")return a==="moor"||a==="swamp"||a==="marshland"||(a==="grassland"||a==="pasture")&&(d||m);let g=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(a==="snowfields"||a==="frozen_tundra")&&!g?!1:c==="dry_patches"?hn.has(a):mn(t)?!(a==="jungle"||a==="moor"||a==="swamp"||a==="marshland"||a==="snowfields"||a==="frozen_tundra"):c==="dry_bushes"?!(a==="jungle"||a==="moor"||a==="swamp"||a==="marshland"||a==="tundra"||a==="highland"):c==="herbs"?!(a==="jungle"||a==="swamp"||a==="marshland"||a==="ocean"||a==="snowfields"||a==="frozen_tundra"):c==="flowering_bushes"||c==="temperate_bushes"||c==="heath"?!(a==="jungle"||a==="rocky_desert"||a==="sandy_desert"||a==="clay_desert"):!0}function fo(t,e,r,o,i){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,s=r.biome||n;if(Wt(t))return Kt.has(n)&&e.has(n);if($t(t)&&(n==="jungle"||s==="jungle"))return!1;let u=o.terrain.byType[n],c=o.terrain.byType[s];if(u?.materialClass!=="ground"||c?.materialClass!=="ground")return!1;let a=i?i.strict:Zt(t);if(a){if(!a.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let l=n==="jungle"||n==="savanna",d=r.forestClass==="light_forest"||r.forestClass==="dense_forest",h=i?i.ecoFamily:jt(t),m=s==="jungle",g=n==="moor"||n==="swamp"||n==="marshland";if(m&&!l||t.family==="palms"&&(!(l||Yt.has(n))||g||vr.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!m||d&&(h==="cacti"||h==="succulents"||h==="dry_bushes")||!(e.has(s)||e.has(n)||d&&e.has("forest_floor")&&t.family!=="palms"))return!1;let p=!!r.hasRiverEdge;return a?dn(t,n,r.neighborTypes,o,i,p):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!dn(t,n,r.neighborTypes,o,i,p)?!1:dn(t,s,r.neighborTypes,o,i,p)}function ho(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let i=o.terrain.byType[r];if(!i||i.materialClass!=="ground")return!1;let n=Zt(t);return n&&!n.has(r)?!1:e.has(r)}function Hi(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function Qn(t,e,r){let o=e/3,i=r/3,n=Math.floor(o),s=Math.floor(i),u=o-n,c=i-s,a=u*u*(3-2*u),l=c*c*(3-2*c),d=ie(t,n,s,2301,8191,4093,17),h=ie(t,n+1,s,2301,8191,4093,17),m=ie(t,n,s+1,2301,8191,4093,17),g=ie(t,n+1,s+1,2301,8191,4093,17);return 2*((d+(h-d)*a)*(1-l)+(m+(g-m)*a)*l)-1}function mo(t,e,r,o){let i=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:pt.mode,s=lt(o?.canopyCover??pt.canopyCover,.35,.98),u=lt(o?.canopyVariation??pt.canopyVariation,0,.3),c=lt(o?.gladeRate??pt.gladeRate,0,.3),a=lt(o?.edgeStrength??pt.edgeStrength,0,1);for(let l of t){let d=qe(l.q,l.r),h=l.terrainId==="jungle",m=Hi(l.terrainId,e),g=lt(l.forestDensity||0,0,1),b,p;if(h){let _=.5+.5*Qn(r+137,l.q,l.r),w=.5+.5*Math.sin(l.q*.62-l.r*.44+r%71)*Math.cos(l.q*.37+l.r*.71),M=lt(.46+.42*_+.14*w,.36,.98),y=g>.01?lt(g*(.68+.34*M),.32,.98):M;b=y>=.62?"dense_forest":"light_forest",p=y}else b=l.forestClass??(l.forestDensity>=.65?"dense_forest":l.forestDensity>.08?"light_forest":"none"),p=b==="none"?0:g>.01?g:b==="dense_forest"?1:.44;i.set(d,{q:l.q,r:l.r,key:d,baseBiome:l.terrainId,biome:h?"jungle":l.terrainId,jungle:h,suitability:m,forestMode:n,forestClass:m>0?b:"none",baseDensity:m>0?p:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let l of i.values()){if(!l.suitability)continue;let d=0;for(let[h,m]of Re){let g=i.get(qe(l.q+h,l.r+m));g&&g.baseDensity>d&&(d=g.baseDensity)}l.edgeInfluence=lt(d*(l.baseDensity?.18:.48)*a*l.suitability,0,.46),l.density=lt(l.baseDensity+l.edgeInfluence,0,1)}if(n==="canopy"&&c>0){let l=lt(c*.55,0,.19),d=[];for(let h of i.values()){if(h.forestClass!=="dense_forest")continue;let m=0;for(let[_,w]of Re)i.get(qe(h.q+_,h.r+w))?.forestClass==="dense_forest"&&m++;if(m<2)continue;let g=ie(r,h.q,h.r,1864,8191,4093,17),b=h.jungle?l*.62:l;if(g>=b)continue;let p=!1;for(let _=-2;_<=2&&!p;_++)for(let w=-2;w<=2;w++){if(w===0&&_===0||Math.abs(w+_)>2)continue;let M=i.get(qe(h.q+w,h.r+_));if(!(!M||M.forestClass!=="dense_forest")&&ie(r,M.q,M.r,1864,8191,4093,17)<g){p=!0;break}}p||d.push(h)}for(let h of d){h.glade=!0;let m=h.jungle?.45:.84;if(ie(r,h.q,h.r,1954,8191,4093,17)<m){let g=null,b=1/0;for(let[p,_]of Re){let w=i.get(qe(h.q+p,h.r+_));if(!w||w.forestClass!=="dense_forest"||w.jungle!==h.jungle)continue;let M=ie(r,w.q,w.r,1953,8191,4093,17);M<b&&(b=M,g=w)}g&&(g.glade=!0)}}}for(let l of i.values()){if(!l.suitability)continue;if(l.glade){l.gladeX=Math.round((ie(r,l.q,l.r,2041,8191,4093,17)-.5)*52),l.gladeY=Math.round((ie(r,l.q,l.r,2042,8191,4093,17)-.5)*40);let g=l.jungle?46:58;l.gladeRadius=g+Math.round(ie(r,l.q,l.r,2043,8191,4093,17)*18)}let d=l.forestClass==="dense_forest"?1:l.forestClass==="light_forest"?l.jungle?.62:.49:l.edgeInfluence>.08?.17:0,h=Qn(r,l.q,l.r),m=lt(s+u*h,.12,.98);l.canopyCoverage=lt(m*d*(.58+.42*l.density)*l.suitability*(l.glade?l.jungle?.34:.24:1),0,.98)}return i}function po(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function go(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function vn(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,i=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return i*i+n*n<.94*.94}function bo(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function Qt(t,e,r,o){let i=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*ie(t,e,r,i,173,311,79);for(let[s,u]of Re)n+=.5/6*ie(t,e+s,r+u,i,173,311,79);return lt(1+(n-.5)*1.5,.6,1.4)}function vo(t,e,r,o,i,n){let u=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,c=(ie(t,e,r,u,173,311,79)-.5)*154,a=(ie(t,e,r,u+1,173,311,79)-.5)*146,l=ie(t,e,r,i*127+n*2+17,173,311,79),d=ie(t,e,r,i*127+n*2+18,173,311,79),h=(l-.5)*242,m=(d-.5)*258,g=n>=26?0:o==="tree"?.43:.68,b=o==="tree"?170:126,p=c+(l-.5)*b,_=a+(d-.5)*b;return{dx:h*(1-g)+p*g,dy:m*(1-g)+_*g}}function Cr(t,e,r=0){let o=Math.abs(t),i=Math.abs(e);return i<=Je-r&&o<=Math.min(128,Math.sqrt(3)*(Je-i))-r}function yo(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:ie(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var Mr=128,er=78,Bt={enabled:!0,strength:er,lighting:!0,style:"sculpted"},xn=168,wn=127,Jt=xn+wn;function bt(t,e,r){return t<e?e:t>r?r:t}function Dt(t){let e=bt(t,0,1);return e*e*(3-2*e)}function xo(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function Rr(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function yn(t,e,r){let o=Math.floor(t),i=Math.floor(e),n=t-o,s=e-i,u=n*n*n*(n*(n*6-15)+10),c=s*s*s*(s*(s*6-15)+10),a=Rr(o,i,r),l=Rr(o+1,i,r),d=Rr(o,i+1,r),h=Rr(o+1,i+1,r);return(a+(l-a)*u)*(1-c)+(d+(h-d)*u)*c}function Gi(t,e,r){let o=yn(t/380,e/380,r^324508639),i=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,s=yn(i,n,r^610839777),u=(t*.3255682-e*.9455186)/105,c=(t*.9455186+e*.3255682)/105,a=yn(u,c,r^916255320);return{plainSwell:o*.78+s*.22,ridgeDetail:o*.34+s*.46+a*.2}}function wo(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function Ui(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let i=r?.categoryId??"";return(i==="wetlands"?.3:i==="cold_regions"?.25:i==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function So(t,e,r,o=er,i="sculpted"){let n=[],s=[];for(let c=0;c<t.length;c++){let a=t[c],l=256*(a.q+a.r*.5),d=$e*a.r;if(wo(a,e)){s.push({x:l,y:d});continue}if(a.reliefClass!=="hills")continue;let h=bt(a.hillStrength??.7,0,1);if(h<=0)continue;let m=(Math.imul(a.q,73856093)^Math.imul(a.r,19349663)^r)>>>0,g=(xo(m)-.5)*1.7,b=a.hillProfile||"rounded",p=b==="ridge"||b==="chain"?560:440;n.push({x:l,y:d,ca:Math.cos(g),sa:Math.sin(g),shape:b,weight:.42+.58*h,reach:p})}let u=o>0?i==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:s,strengthPct:o,heightGain:u,seedInt:r,style:i}}function _o(t,e,r){let o=e*t.ca+r*t.sa,i=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(i/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(i/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,i/158),3.1)):t.shape==="plateau"?1-Dt((Math.hypot(o/188,i/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(i/180)**2))}function Co(t,e,r,o,i,n,s,u){if(n<=0||e<=.004)return 0;if(u==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:c,ridgeDetail:a}=Gi(r,o,s),l=Math.max(0,c-.38)*14*(i/100)*e;if(t<=1e-4)return l;let d=1-Math.exp(-t*.76),h=n*d*(.76+.42*a)*e;return Math.min(Mr,h+l*.55)}function Ro(t,e,r){if(t.heightGain<=0)return 0;let o=0,i=t.waters,n=Jt*Jt;for(let a=0;a<i.length;a++){let l=i[a],d=e-l.x,h=r-l.y;if(Math.abs(d)>Jt||Math.abs(h)>Jt)continue;let m=d*d+h*h;if(m<n){let g=1-Dt((Math.sqrt(m)-xn)/wn);g>o&&(o=g)}}let s=1-o;if(s<=.004)return 0;let u=0,c=t.hills;for(let a=0;a<c.length;a++){let l=c[a],d=e-l.x,h=r-l.y;Math.abs(d)>l.reach||Math.abs(h)>l.reach||(u+=_o(l,d,h)*l.weight)}return Co(u,s,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function Mo(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),i=t.width/(r-1),n=t.height/(o-1),s=1/i,u=1/n,c=r*o,a=new Float32Array(c),l=new Float32Array(c),d=new Float32Array(c),h=new Float32Array(c),m=new Float32Array(c),g=new Float32Array(c),b=new Float32Array(c),p=520,_=Math.floor((t.top-p)/$e)-2,w=Math.ceil((t.top+t.height+p)/$e)+2,M=t.reliefStyle??"sculpted",y=t.reliefStrength??er,E=y>0?M==="sculpted"?112*(y/100):67*(y/100)*1.2:0,k=(U,C,P,Q,z,K)=>{let W=Math.max(0,Math.floor((C-K-t.left)*s)),N=Math.min(r-1,Math.ceil((C+K-t.left)*s)),ee=Math.max(0,Math.floor((P-K-t.top)*u)),Z=Math.min(o-1,Math.ceil((P+K-t.top)*u)),x=K*K;for(let F=ee;F<=Z;F++){let T=t.top+F*n-P,D=T*T,I=F*r;for(let f=W;f<=N;f++){let v=t.left+f*i-C,L=v*v+D;if(L>=x)continue;let H=1-Dt((Math.sqrt(L)-Q)/z);H>U[I+f]&&(U[I+f]=H)}}};for(let U=_;U<=w;U++){let C=Math.floor((t.left-p)/256-U*.5)-2,P=Math.ceil((t.left+t.width+p)/256-U*.5)+2;for(let Q=C;Q<=P;Q++){let z=t.lookupHex(Q,U);if(!z||z.fogState===0)continue;let K=256*(Q+U*.5),W=$e*U;if(wo(z,t.manifest)){k(d,K,W,xn,wn,Jt),k(h,K,W,108,48,160);continue}if((z.terrainId==="snowfields"||z.terrainId==="frozen_tundra"||z.terrainId==="jungle")&&k(h,K,W,108,48,160),E>0&&z.reliefClass==="hills"){let Z=bt(z.hillStrength??.7,0,1);if(Z>0){let x=(Math.imul(Q,73856093)^Math.imul(U,19349663)^t.seedInt)>>>0,F=(xo(x)-.5)*1.7,T=z.hillProfile||"rounded",D=T==="ridge"||T==="chain"?560:440,I={x:K,y:W,ca:Math.cos(F),sa:Math.sin(F),shape:T,weight:.42+.58*Z,reach:D},f=Math.max(0,Math.floor((K-D-t.left)*s)),v=Math.min(r-1,Math.ceil((K+D-t.left)*s)),L=Math.max(0,Math.floor((W-D-t.top)*u)),H=Math.min(o-1,Math.ceil((W+D-t.top)*u));for(let O=L;O<=H;O++){let X=t.top+O*n-W,$=O*r;for(let j=f;j<=v;j++){let J=t.left+j*i-K,V=_o(I,J,X);V>1e-4&&(a[$+j]+=V*I.weight)}}}}let ee=Ui(z,t.manifest);if(ee>.01){let x=Math.max(0,Math.floor((K-172-t.left)*s)),F=Math.min(r-1,Math.ceil((K+172-t.left)*s)),T=Math.max(0,Math.floor((W-172-t.top)*u)),D=Math.min(o-1,Math.ceil((W+172-t.top)*u)),I=29584;for(let f=T;f<=D;f++){let v=t.top+f*n-W,L=v*v,H=f*r;for(let O=x;O<=F;O++){let X=t.left+O*i-K,$=X*X+L;if($>=I)continue;let j=1-Dt((Math.sqrt($)-110)/56);if(j>0){let J=H+O,V=m[J]+j*1.15;m[J]=V>1?1:V,ee>g[J]&&(g[J]=ee)}}}if(z.glade){let f=K+(z.gladeX??0),v=W+(z.gladeY??0),L=z.gladeRadius??64,H=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[O,X,$]of H){let j=f+L*O,J=v+L*X,V=L*$,se=V*V,ue=Math.max(0,Math.floor((j-V-t.left)*s)),te=Math.min(r-1,Math.ceil((j+V-t.left)*s)),be=Math.max(0,Math.floor((J-V-t.top)*u)),ve=Math.min(o-1,Math.ceil((J+V-t.top)*u));for(let he=be;he<=ve;he++){let me=t.top+he*n-J,xe=me*me,Me=he*r;for(let ye=ue;ye<=te;ye++){let Te=t.left+ye*i-j,Se=Te*Te+xe;if(Se>=se)continue;let Ge=1-Dt((Math.sqrt(Se)-V*.14)/(V*.86)),Ie=Me+ye;Ge>b[Ie]&&(b[Ie]=Ge)}}}}}}}for(let U=0;U<o;U++){let C=t.top+U*n,P=U*r;for(let Q=0;Q<r;Q++){let z=P+Q,K=1-d[z];if(K<=.004||E<=0)continue;let W=t.left+Q*i;l[z]=Co(a[z],K,W,C,y,E,t.seedInt,M)}}let S=new Uint8Array(c*4),R=Math.max(1,(i+n)*.5);for(let U=0;U<o;U++){let C=U>0?U-1:0,P=U<o-1?U+1:o-1,Q=Math.max(1,(P-C)*n),z=U*r;for(let K=0;K<r;K++){let W=K>0?K-1:0,N=K<r-1?K+1:r-1,ee=Math.max(1,(N-W)*i),Z=z+K,x=l[Z],F=l[z+W],T=l[z+N],D=l[C*r+K],I=l[P*r+K],f=(T-F)/ee,v=(I-D)/Q,L;if(M==="sculpted"){let $=((F+T+D+I)*.25-x)/R,j=bt(-$*1.45,-.1,.12);L=bt(1-2.45*f-.65*v+j,.6,1.36)}else L=bt(1-2.15*f-.48*v,.66,1.32);let H=1-h[Z],O=m[Z]>.01&&H>.01?Dt((m[Z]-.12)/.72)*g[Z]*(1-b[Z]*.94)*H:0,X=Z*4;S[X]=Math.round(bt(x/Mr,0,1)*255),S[X+1]=Math.round(bt((L-.52)/.96,0,1)*255),S[X+2]=Math.round(bt(O,0,1)*255),S[X+3]=Math.round(bt(1-d[Z],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:S,heights:l}}function To(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),i=(r-t.top)/t.height*(t.rows-1);if(o<0||i<0||o>=t.cols-1||i>=t.rows-1)return 0;let n=Math.floor(o),s=Math.floor(i),u=o-n,c=i-s,a=s*t.cols+n,l=t.heights[a],d=t.heights[a+1],h=t.heights[a+t.cols],m=t.heights[a+t.cols+1];return(l*(1-u)+d*u)*(1-c)+(h*(1-u)+m*u)*c}var Sn=65536,Tr=16,vt={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function Oi(t){if(!t)return vt.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?vt.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?vt.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?vt.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?vt.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?vt.forest:r==="hills"?vt.rock:vt.earth}var Ni=`#version 300 es
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
`,Vi=`#version 300 es
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
`;function rr(t,e){return{x:256*(t+e*.5),y:$e*e}}function Ht(t,e){let r=rr(t,e),o=[];for(let i=0;i<6;i++){let n=-Math.PI/2+i*Math.PI/3;o.push({x:r.x+Je*Math.cos(n),y:r.y+Je*Math.sin(n)})}return o}function tr(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Re[s][0]===i&&Re[s][1]===n)return s;return-1}function zi(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function Eo(t,e){for(let r=0;r<6;r++)if(zi(t[r],e))return r;return-1}function qt(t,e,r,o){let i=Ht(t,e),n=Eo(i,r),s=Eo(i,o);if(n<0||s<0)return[r,o];let u=(s-n+6)%6,c=(n-s+6)%6,a=u<=c?1:-1,l=Math.min(u,c),d=[];for(let h=0;h<=l;h++)d.push(i[(n+a*h+12)%6]);return d}function _n(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],i=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let u=1;u<n;u++){let c=t[u-1],a=t[u],l=t[u+1],d=a.x-c.x,h=a.y-c.y,m=l.x-a.x,g=l.y-a.y,b=Math.hypot(d,h),p=Math.hypot(m,g);if(b<1e-4||p<1e-4)continue;if((d*m+h*g)/(b*p)>.995){o.push(a);continue}let w=Math.min(b*.16,p*.16,Math.max(12,i*.85)),M={x:a.x-d/b*w,y:a.y-h/b*w},y={x:a.x+m/p*w,y:a.y+g/p*w};o.push(M);for(let E=1;E<6;E++){let k=E/6,S=1-k;o.push({x:S*S*M.x+2*S*k*a.x+k*k*y.x,y:S*S*M.y+2*S*k*a.y+k*k*y.y})}o.push(y)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let s=[];for(let u=0;u<o.length;u++)(u===0||Math.hypot(o[u].x-s[s.length-1].x,o[u].y-s[s.length-1].y)>1e-4)&&s.push(o[u]);return s}function Po(t,e){let r=je(t.x,t.y*Ee),o=Je*1.15,i=[];for(let n=-1;n<6;n++){let s=n<0?r.q:r.q+Re[n][0],u=n<0?r.r:r.r+Re[n][1],c=rr(s,u);Math.hypot(t.x-c.x,t.y-c.y)<=o&&e(s,u)&&i.push(c)}return i}function nr(t,e=34,r){let o=t.hexes;if(!o||o.length<2)return null;let i=o.length-1,n=[];for(let W=0;W<i;W++){let[N,ee]=o[W],[Z,x]=o[W+1],F=tr(N,ee,Z,x);if(F<0)return null;let T=Ht(N,ee);n.push([T[F],T[(F+1)%6]])}let s=tr(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,c=Ht(o[0][0],o[0][1])[u],a=n.map(()=>[1/0,1/0]),l=n.map(()=>[0,0]);for(let W=0;W<2;W++)a[0][W]=qt(o[0][0],o[0][1],c,n[0][W]).length-1;for(let W=1;W<i;W++)for(let N=0;N<2;N++)for(let ee=0;ee<2;ee++){let Z=qt(o[W][0],o[W][1],n[W-1][ee],n[W][N]).length-1,x=a[W-1][ee]+Z;x<a[W][N]&&(a[W][N]=x,l[W][N]=ee)}let d=new Array(i),h=a[i-1][0]<=a[i-1][1]?0:1;for(let W=i-1;W>=0;W--)d[W]=n[W][h],h=l[W][h];let m=[];for(let W=0;W<i;W++){let N=W===0?c:d[W-1],ee=d[W],Z=qt(o[W][0],o[W][1],N,ee);for(let x=0;x<Z.length;x++)(m.length===0||Math.hypot(Z[x].x-m[m.length-1].x,Z[x].y-m[m.length-1].y)>1e-4)&&m.push(Z[x])}if(m.length<2)return null;let g=o[i-1],b=o[i];if(tr(g[0],g[1],b[0],b[1])<0)return null;let _=m.length-1,w=rr(b[0],b[1]);if(r)for(let W=1;W<m.length;W++){let N=Po(m[W],r);if(N.length>0){_=W;let ee=0,Z=0;for(let x=0;x<N.length;x++)ee+=N[x].x,Z+=N[x].y;w={x:ee/N.length,y:Z/N.length};break}}let M=m.slice(0,_+1),y=M[M.length-1],E=w.x-y.x,k=w.y-y.y,S=Math.hypot(E,k)||1,R=E/S,U=k/S,C=Math.max(54,e*2.15),P={x:y.x+R*C,y:y.y+U*C};M.push(P);let Q=_n(M,e,!1);if(Q.length<2)return null;let z=Q.length-2,K=1/0;for(let W=0;W<Q.length;W++){let N=(Q[W].x-y.x)**2+(Q[W].y-y.y)**2;N<K&&(K=N,z=W)}return{id:t.id,points:Q,mouthCrossIdx:z,mouthCrossPos:y,mouthDirX:R,mouthDirY:U,mouthReach:C,width:e,hasMouth:!0}}function Ao(t,e){let r=new Set,o=t.hexes;if(!o||o.length<2)return r;let i=o.length-1,n=[];for(let p=0;p<i;p++){let[_,w]=o[p],[M,y]=o[p+1],E=tr(_,w,M,y);if(E<0)return r;let k=Ht(_,w);n.push([k[E],k[(E+1)%6]])}let s=tr(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,c=Ht(o[0][0],o[0][1])[u],a=n.map(()=>[1/0,1/0]),l=n.map(()=>[0,0]);for(let p=0;p<2;p++)a[0][p]=qt(o[0][0],o[0][1],c,n[0][p]).length-1;for(let p=1;p<i;p++)for(let _=0;_<2;_++)for(let w=0;w<2;w++){let M=qt(o[p][0],o[p][1],n[p-1][w],n[p][_]).length-1,y=a[p-1][w]+M;y<a[p][_]&&(a[p][_]=y,l[p][_]=w)}let d=new Array(i),h=a[i-1][0]<=a[i-1][1]?0:1;for(let p=i-1;p>=0;p--)d[p]=n[p][h],h=l[p][h];let m=[];for(let p=0;p<i;p++){let _=p===0?c:d[p-1],w=d[p],M=qt(o[p][0],o[p][1],_,w);for(let y=0;y<M.length;y++)(m.length===0||Math.hypot(M[y].x-m[m.length-1].x,M[y].y-m[m.length-1].y)>1e-4)&&m.push(M[y])}if(m.length<2)return r;let g=m.length-1;if(e){for(let p=1;p<m.length;p++)if(Po(m[p],e).length>0){g=p;break}}let b=256*.56;for(let p=0;p<g;p++){let _=(m[p].x+m[p+1].x)*.5,w=(m[p].y+m[p+1].y)*.5,M=je(_,w*Ee),y=[];for(let E=-1;E<6;E++){let k=E<0?M.q:M.q+Re[E][0],S=E<0?M.r:M.r+Re[E][1],R=rr(k,S),U=Math.hypot(_-R.x,w-R.y);U<=b&&y.push({q:k,r:S,d:U})}if(y.sort((E,k)=>E.d-k.d),y.length>=2){let E=y[0],k=y[1],R=E.q<k.q||E.q===k.q&&E.r<=k.r?`${E.q},${E.r}|${k.q},${k.r}`:`${k.q},${k.r}|${E.q},${E.r}`;r.add(R)}}return r}function Cn(t,e=34){if(!t||t.length===0)return[];let r=c=>`${Math.round(c.x*2)},${Math.round(c.y*2)}`,o=[],i=new Set,n=new Map;for(let c of t){let a=(c.dir%6+6)%6,l=Ht(c.q,c.r),d=l[a],h=l[(a+1)%6],m=r(d),g=r(h),b=m<g?`${m}|${g}`:`${g}|${m}`;if(i.has(b))continue;i.add(b);let p=o.length;o.push({a:d,b:h,ka:m,kb:g,used:!1});let _=n.get(m)??[];_.push(p),n.set(m,_);let w=n.get(g)??[];w.push(p),n.set(g,w)}let s=[],u=(c,a)=>{let l=o[c];l.used=!0;let d=a?[l.a,l.b]:[l.b,l.a],h=a?l.kb:l.ka;for(;;){let m=n.get(h);if(!m)break;let g=-1;for(let p of m)if(!o[p].used){g=p;break}if(g<0)break;let b=o[g];b.used=!0,b.ka===h?(d.push(b.b),h=b.kb):(d.push(b.a),h=b.ka)}return d};for(let c=0;c<2;c++)for(let a=0;a<o.length;a++)if(!o[a].used)if(c===0){let l=n.get(o[a].ka)?.length??0,d=n.get(o[a].kb)?.length??0;if(l!==1&&d!==1)continue;let h=u(a,l===1);s.push({id:`edge_${a}`,points:_n(h,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let l=u(a,!0);s.push({id:`edge_${a}`,points:_n(l,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return s}var Er=class{constructor(e){this.verts=new Float32Array(Sn*Tr);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,Ni),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,Vi),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate river program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=Tr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,u,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,u,48),e.bindVertexArray(null);let c=a=>{let l=e.getUniformLocation(i,a);if(!l)throw new Error(`Missing river uniform: ${a}`);return l};this.uCamCenter=c("u_camCenter"),this.uViewportSize=c("u_viewportSize"),this.uZoom=c("u_zoom"),this.uCoastalWaterLayer=c("u_coastalWaterLayer"),this.uTime=c("u_time"),this.uWindEnabled=c("u_windEnabled"),this.uPassMode=c("u_passMode"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0)}getCachedCourse(e,r=34,o){let i=`${e.id}@${r}@${o?"w":"0"}`;if(this.courseCache.has(i))return this.courseCache.get(i)??null;let n=nr(e,r,o);if(this.courseCache.set(i,n),this.courseCache.size>512){let s=this.courseCache.keys().next().value;s!==void 0&&this.courseCache.delete(s)}return n}pushVertex(e,r,o,i,n,s,u,c,a,l,d,h,m){if(this.vertCount>=Sn)return;let g=this.vertCount*Tr,b=this.verts;b[g++]=e,b[g++]=r,b[g++]=o,b[g++]=i,b[g++]=n,b[g++]=s,b[g++]=u,b[g++]=c,b[g++]=a,b[g++]=l,b[g++]=d,b[g++]=h,b[g++]=m.r,b[g++]=m.g,b[g++]=m.b,b[g++]=m.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return vt.earth;let i=je(e,r*Ee),n=0,s=0,u=0,c=0,a=0;for(let l=-1;l<6;l++){let d=l<0?i.q:i.q+Re[l][0],h=l<0?i.r:i.r+Re[l][1],m=o(d,h);if(!m)continue;let g=m.terrainId;if(g==="ocean"||g==="coastal_water"||g==="stormy_ocean"||g==="icy_ocean")continue;let b=rr(d,h),p=Math.hypot(e-b.x,r-b.y);if(p>380)continue;let _=Math.max(0,Math.min(1,1-Math.max(0,p-35)/345)),w=_*_*(3-2*_),M=w*w,y=Oi(m);s+=y.r*M,u+=y.g*M,c+=y.b*M,a+=y.rock*M,n+=M}return n<1e-4?vt.earth:{r:s/n,g:u/n,b:c/n,rock:a/n}}emitCourse(e,r,o,i,n){let s=e.points,u=s.length;if(u<2)return;let c=e.width*.5*n,a=e.mouthCrossPos??(e.hasMouth&&e.mouthCrossIdx>=0?s[e.mouthCrossIdx]:null),l=e.hasMouth?s[u-1]:null,d=a&&l?l.x-a.x:0,h=a&&l?l.y-a.y:0,m=Math.hypot(d,h)||1,g=e.mouthDirX??d/m,b=e.mouthDirY??h/m,p=Math.max(24,e.mouthReach??m),_=new Float32Array(u);for(let C=1;C<u;C++)_[C]=_[C-1]+Math.hypot(s[C].x-s[C-1].x,s[C].y-s[C-1].y);let w=Math.max(1,_[u-1]),M=new Float32Array(u),y=new Float32Array(u),E=new Float32Array(u),k=new Float32Array(u),S=new Array(u);for(let C=0;C<u;C++){let P=s[C>0?C-1:0],Q=s[C<u-1?C+1:u-1],z=Q.x-P.x,K=Q.y-P.y,W=Math.hypot(z,K)||1;M[C]=z/W,y[C]=K/W,E[C]=-K/W,k[C]=z/W,S[C]=this.sampleBankPalette(s[C].x,s[C].y,i)}let R=(C,P,Q)=>{let z=r(C,P),K=C,W=(P-z)*Ee,N=_[Q]/w,ee=c*(e.hasMouth?.68+.4*N:1),Z=1,x=1;if(e.hasMouth&&_[Q]<26){let I=Math.max(0,Math.min(1,_[Q]/26)),f=I*I*(3-2*I);Z*=f,x*=f,ee*=.58+.42*f}else if(!e.hasMouth){let I=Math.min(_[Q],w-_[Q]);if(I<18){let f=Math.max(0,Math.min(1,I/18)),v=f*f*(3-2*f);Z*=v,x*=v,ee*=.72+.28*v}}if(a&&e.hasMouth){let I=(C-a.x)*g+(P-a.y)*b,f=Math.max(0,Math.min(1,(I+28)/(28+p*.72))),v=f*f*(3-2*f);ee*=1+.48*v;let L=Math.max(0,Math.min(1,I/p));Z*=1-L*L*(3-2*L);let H=Math.max(0,Math.min(1,(I+58)/52));x*=1-H*H*(3-2*H)}let F=je(C,P*Ee),T=o(F.q,F.r);return{wx:K,wy:W,halfW:ee,mouthFade:Z,landFade:x,fogDim:T===0?0:T===1?.65:1}},U=34;for(let C=0;C<u-1&&!(this.vertCount+6>Sn);C++){let P=s[C],Q=s[C+1],z=R(P.x,P.y,C),K=R(Q.x,Q.y,C+1);if(z.fogDim===0&&K.fogDim===0)continue;let W=z.fogDim>0?z.fogDim:K.fogDim,N=K.fogDim>0?K.fogDim:z.fogDim,ee=z.halfW+U*(.28+.72*z.landFade),Z=K.halfW+U*(.28+.72*K.landFade),x=P.x-E[C]*ee,F=P.y-k[C]*ee,T=P.x+E[C]*ee,D=P.y+k[C]*ee,I=Q.x-E[C+1]*Z,f=Q.y-k[C+1]*Z,v=Q.x+E[C+1]*Z,L=Q.y+k[C+1]*Z,H=R(x,F,C),O=R(T,D,C),X=R(I,f,C+1),$=R(v,L,C+1);this.pushVertex(H.wx,H.wy,x,F,-ee,z.halfW,H.mouthFade,H.landFade,W,_[C],M[C],y[C],S[C]),this.pushVertex(O.wx,O.wy,T,D,ee,z.halfW,O.mouthFade,O.landFade,W,_[C],M[C],y[C],S[C]),this.pushVertex($.wx,$.wy,v,L,Z,K.halfW,$.mouthFade,$.landFade,N,_[C+1],M[C+1],y[C+1],S[C+1]),this.pushVertex(H.wx,H.wy,x,F,-ee,z.halfW,H.mouthFade,H.landFade,W,_[C],M[C],y[C],S[C]),this.pushVertex($.wx,$.wy,v,L,Z,K.halfW,$.mouthFade,$.landFade,N,_[C+1],M[C+1],y[C+1],S[C+1]),this.pushVertex(X.wx,X.wy,I,f,-Z,K.halfW,X.mouthFade,X.landFade,N,_[C+1],M[C+1],y[C+1],S[C+1])}}render(e){let{cam:r,assets:o,routes:i,manualEdges:n=[],sampleReliefHeight:s,lookupFog:u,lookupHex:c,timeSec:a,windAnimation:l=!0}=e;if(i.length===0&&n.length===0)return 0;this.vertCount=0;let d=r.zoom<.35?1+(.35-r.zoom)*1.4:1,h=c?(g,b)=>{let p=c(g,b);if(!p)return!1;let _=p.terrainId;return _==="ocean"||_==="coastal_water"||_==="stormy_ocean"||_==="icy_ocean"}:void 0;for(let g=0;g<i.length;g++){let b=this.getCachedCourse(i[g],34,h);b&&this.emitCourse(b,s,u,c,d)}if(n.length>0){let g=Cn(n,34);for(let b=0;b<g.length;b++)this.emitCourse(g[b],s,u,c,d)}if(this.vertCount===0)return 0;let{gl:m}=this;return m.enable(m.BLEND),m.blendEquation(m.FUNC_ADD),m.blendFunc(m.ONE,m.ONE_MINUS_SRC_ALPHA),m.useProgram(this.program),m.bindVertexArray(this.vao),m.bindBuffer(m.ARRAY_BUFFER,this.vbo),m.bufferSubData(m.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Tr)),m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D_ARRAY,o.terrainArray),m.uniform2f(this.uCamCenter,r.x,r.y),m.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),m.uniform1f(this.uZoom,r.zoom),m.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),m.uniform1f(this.uTime,a),m.uniform1f(this.uWindEnabled,l?1:0),m.uniform1f(this.uPassMode,0),m.drawArrays(m.TRIANGLES,0,this.vertCount),m.uniform1f(this.uPassMode,1),m.drawArrays(m.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Xi=Re.map(([t,e])=>[t+e*.5,$e*e/256]),Yi=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),$i=new Set(["moor","marshland","swamp"]);function Pr(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function Rn(t,e,r){return t.kind==="mountain"?3:xr(t)?0:t.kind==="tree"?r>=66?2:1:wr(t)||Wt(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function Mn(t){return xr(t)?0:t.kind==="mountain"?.44:wr(t)||Wt(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||Sr(t)||pn(t)?.3:.55}var Ki=.24;function ko(t,e){if(e?.includes("terrain_tint")||e?.includes("arid_decal"))return!0;let r=t.toLowerCase();return r.includes("crack")||r.includes("fissure")}function ji(t,e,r){return ko(t,e)?r*Math.PI*2:(r*2-1)*Ki}var Zi=256*256*Math.sqrt(3)/2,or=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=ln(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...Bt,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...pt,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let i=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==i||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=ln(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:i}=Xt(e,r,Fe),n=Mt(o,i);this.rawCellChunks.delete(n),this.chunks.delete(n);let s=e-o*Fe,u=r-i*Fe,c=[0],a=[0];s<=2&&c.push(-1),s>=Fe-3&&c.push(1),u<=2&&a.push(-1),u>=Fe-3&&a.push(1);for(let l of c)for(let d of a)l===0&&d===0||this.chunks.delete(Mt(o+l,i+d));this.revision++}setHexFogState(e,r,o){let{cq:i,cr:n}=Xt(e,r,Fe),s=Mt(i,n),u=e-i*Fe,a=(r-n*Fe)*Fe+u,l=this.chunks.get(s)?.cells[a],d=this.rawCellChunks.get(s)?.[a],h=l??d;return!h||h.fogState===o?!1:(l&&(l.fogState=o),d&&(d.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:i}=Xt(e,r,Fe),n=Mt(o,i),u=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!u)return;let c=e-o*Fe,a=r-i*Fe;if(!(c<0||c>=Fe||a<0||a>=Fe))return u[a*Fe+c]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let i=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!i||i.layers.length===0)return 0;if(i.layers.length===1)return i.layers[0];let n=Vn(this.seedIntValue,r,o,101)%i.layers.length;return i.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let i=Nn(e,Fe,2),n=0,s=0,u=[];for(let{cq:S,cr:R}of i){let U=Mt(S,R),C=this.chunks.get(U);C?(this.chunks.delete(U),this.chunks.set(U,C),u.push(C)):n<r?(C=this.buildChunk(S,R),this.chunks.set(U,C),n++,this.revision++,u.push(C)):s++}for(;this.chunks.size>this.maxCachedChunks;){let S=this.chunks.keys().next().value;if(S===void 0)break;this.chunks.delete(S)}let c=this.maxCachedChunks*2;for(;this.rawCellChunks.size>c;){let S=this.rawCellChunks.keys().next().value;if(S===void 0)break;this.rawCellChunks.delete(S)}let a=e.viewportWidth*.5/e.zoom+420,l=e.viewportHeight*.5/e.zoom+420,d=e.x-a,h=e.x+a,m=e.y-l,g=e.y+l,b=[],p=[],_=[],w=new Set;for(let S of u){for(let R of S.shorelines){if(R.x<d||R.x>h||R.y<m||R.y>g)continue;let U=this.lookupHex(R.q,R.r),C=U?U.fogState:0;C!==0&&(b.push(R),p.push(C))}for(let R of S.riverRoutes)w.has(R.id)||(w.add(R.id),_.push(R))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:b,shoreFogStates:p,riverRoutes:_,chunksLoadedThisFrame:n,hasPendingChunks:s>0};let M=[],y=[];for(let S of u){for(let R of S.sprites)R.x<d||R.x>h||R.y<m||R.y>g||M.push(R);for(let R of S.decals)R.x<d||R.x>h||R.y<m||R.y>g||y.push(R)}M.sort((S,R)=>(S.sortY??S.y)-(R.sortY??R.y)||S.x-R.x);let E=new Array(M.length);for(let S=0;S<M.length;S++){let R=M[S],U=this.lookupHex(R.q,R.r);E[S]=U?U.fogState:0}let k=new Array(y.length);for(let S=0;S<y.length;S++){let R=y[S],U=this.lookupHex(R.q,R.r);k[S]=U?U.fogState:0}return{sprites:M,fogStates:E,decals:y,decalFogStates:k,shorelines:b,shoreFogStates:p,riverRoutes:_,chunksLoadedThisFrame:n,hasPendingChunks:s>0}}getOrFetchRawCells(e,r){let o=Mt(e,r),i=this.rawCellChunks.get(o);if(i)return i;let n=e*Fe,s=r*Fe,u=this.provider({cq:e,cr:r,chunkSize:Fe}),c=new Array(Fe*Fe),a=this.fogOverride;for(let l of u){let d=l.q-n,h=l.r-s;d<0||d>=Fe||h<0||h>=Fe||(a&&(l.fogState=a(l.q,l.r)),c[h*Fe+d]=l)}return this.rawCellChunks.set(o,c),c}lookupRawHex(e,r){let{cq:o,cr:i}=Xt(e,r,Fe),n=this.getOrFetchRawCells(o,i),s=e-o*Fe,u=r-i*Fe;return n[u*Fe+s]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,i)=>o[0].localeCompare(i[0])),r=[];for(let[o,i]of e){let n=uo(i,this.manifest),s=i.worldWidth*It(i),u=.72*s*s/Zi,c=0,a=o.replace(/^assets\//,"");for(let h=0;h<a.length;h++)c=Math.imul(c,31)+a.charCodeAt(h)|0;let l=i.kind==="tree"?"tree":i.kind==="shrub"?"shrub":i.kind==="ground_cover"?"ground_cover":"other",d={key:o,entry:i,allowedTypes:n,effectiveWidth:s,crownAreaRatio:u,pathSalt:c,pre:{strict:Zt(i),ecoFamily:jt(i)},pScale:bn(i),chanceMult:io(i),minSpacing:i.placement?.minSpacing??28,edgeMargin:i.placement?.edgeMargin??12,pKind:l,isCanopy:ro(i),isBoulder:wr(i),isWaterBoulder:Wt(i),isWarmBoulder:$t(i),isGroundDecal:xr(i),isDryPatch:Sr(i),isAcacia:gn(i),isAccent:no(i),isSnowFamily:_r(i),isBush20to29:mn(i),isReed:pn(i),isHerb:i.family==="herbs",accentGroup:oo(i)};if(i.kind==="mountain")this.mountainCandidates.push(d);else if(d.isWaterBoulder)i.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(d);else if(d.isGroundDecal){if(i.artStatus!=="deprecated"&&(i.placement?.density??.25)>0&&n.size>0)for(let h of n){let m=this.decalCandidatesByTerrain.get(h);m||(m=[],this.decalCandidatesByTerrain.set(h,m)),m.push(d)}}else if(i.artStatus!=="deprecated"&&(i.placement?.density??0)>0&&(i.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(d),d.isReed&&this.reedCandidates.push(d);for(let h of n){let m=this.candidatesByTerrain.get(h);m||(m=[],this.candidatesByTerrain.set(h,m)),m.push(d)}n.has("forest_floor")&&i.family!=="palms"&&r.push(d)}}for(let o of Object.keys(this.manifest.terrain.byType)){let i=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,i);else{let n=new Set(i),s=[...i];for(let u of r)n.has(u)||(n.add(u),s.push(u));this.candidatesByTerrainForest.set(o,s)}}}createPlacedSprite(e,r,o,i,n,s,u){let c=e.entry,a=e.effectiveWidth*s,l=a*c.aspect,d=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],h=n*Ee,m=c.kind==="mountain",g=Math.round(i*3)^Math.round(n*5)|0,b=e.isGroundDecal&&ko(e.key,c.tags),_=!m&&!e.isAccent&&!e.accentGroup&&(!e.isGroundDecal||b)&&ie(this.seedIntValue,r,o,g+811)<.5,w=i/(256*2.6),M=n/(256*2.6),y=Math.floor(w),E=Math.floor(M),k=w-y,S=M-E,R=k*k*(3-2*k),U=S*S*(3-2*S),C=ie(this.seedIntValue,y,E,913),P=ie(this.seedIntValue,y+1,E,913),Q=ie(this.seedIntValue,y,E+1,913),z=ie(this.seedIntValue,y+1,E+1,913),K=C+(P-C)*R+(Q+(z-Q)*R-(C+(P-C)*R))*U,W=ie(this.seedIntValue,r,o,g+823),N=K*.6+W*.4,ee=m||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:c.kind==="tree"?.62:c.family==="cacti"?.08:c.kind==="shrub"?.42:c.kind==="ground_cover"?.24:0;return{x:i,y:h-u*Ee,sortY:h,width:a,height:l,anchorX:c.anchor[0],anchorY:c.anchor[1],page:c.page,u0:c.uv[0],v0:c.uv[1],u1:c.uv[2],v1:c.uv[3],q:r,r:o,isMountain:m,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:_,tintHash:N,swayAmp:ee,shadowTier:Rn(c,a,l),selfShadeWeight:Mn(c),shadowPage:d?d.page:-1,shadowU0:d?d.uv[0]:0,shadowV0:d?d.uv[1]:0,shadowU1:d?d.uv[2]:0,shadowV1:d?d.uv[3]:0,shadowMinX:d?d.boundsInSpriteWidth[0]:0,shadowMinY:d?d.boundsInSpriteWidth[1]:0,shadowMaxX:d?d.boundsInSpriteWidth[2]:0,shadowMaxY:d?d.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*Fe,i=r*Fe,n=this.seedIntValue,s=this.getOrFetchRawCells(e,r),u=[],c=[];for(let f=-2;f<Fe+2;f++)for(let v=-2;v<Fe+2;v++){let L=o+v,H=i+f,O=this.lookupRawHex(L,H);O&&(u.push(O),v>=0&&v<Fe&&f>=0&&f<Fe&&c.push(O))}let a=mo(u,this.manifest,n,this.forestConfig);for(let f of c){let v=a.get(qe(f.q,f.r));v&&(f.forestClass=v.forestClass,f.glade=v.glade,f.gladeX=v.gladeX,f.gladeY=v.gladeY,f.gladeRadius=v.gladeRadius)}let l=[],d=this.manifest.infrastructure.sprites;for(let f of c){if(this.isWaterTerrain(f.terrainId)||kt.has(f.terrainId))continue;let v=Ae(f.q,f.r);for(let L=0;L<6;L++){let[H,O]=Re[L],X=this.lookupRawHex(f.q+H,f.r+O);if(!X||!this.isWaterTerrain(X.terrainId)||X.terrainId==="icy_ocean")continue;let $=0;for(let V of[5,1]){let[se,ue]=Re[(L+V)%6],te=this.lookupRawHex(f.q+se,f.r+ue);te&&(kt.has(te.terrainId)||te.terrainId==="icy_ocean")&&$++}if($>=2)continue;let j=`shorelines/shore_v105_edge_0${L+1}`,J=d[j];J&&l.push({x:v.x,y:v.y,q:f.q,r:f.r,side:L,alpha:$===1?.42:1,page:J.page,u0:J.uv[0],v0:J.uv[1],u1:J.uv[2],v1:J.uv[3]})}}let h=this.provider.getRiverRoutesForChunk?.(e,r,Fe)??[],m=[],g=(f,v)=>{let L=this.lookupRawHex(f,v);return L?this.isWaterTerrain(L.terrainId):!1};for(let f=0;f<h.length;f++){let v=nr(h[f],34,g);if(!v||v.points.length<2)continue;let L=1/0,H=-1/0,O=1/0,X=-1/0;for(let $=0;$<v.points.length;$++){let j=v.points[$];j.x<L&&(L=j.x),j.x>H&&(H=j.x),j.y<O&&(O=j.y),j.y>X&&(X=j.y)}m.push({course:v,minX:L-90,maxX:H+90,minY:O-90,maxY:X+90})}let b=(f,v)=>{if(m.length===0)return 1/0;let L=1/0;for(let H=0;H<m.length;H++){let O=m[H];if(f<O.minX||f>O.maxX||v<O.minY||v>O.maxY)continue;let X=O.course.points;for(let $=1;$<X.length;$++){let j=X[$-1],J=X[$],V=J.x-j.x,se=J.y-j.y,ue=V*V+se*se,te=ue>1e-6?((f-j.x)*V+(v-j.y)*se)/ue:0;te<0?te=0:te>1&&(te=1);let be=f-(j.x+te*V),ve=v-(j.y+te*se),he=be*be+ve*ve;he<L&&(L=he)}}return L<1/0?Math.sqrt(L):1/0},p=this.reliefConfig.enabled?this.reliefConfig.strength:0,_=this.reliefConfig.style??"sculpted",w=So(u,this.manifest,n,p,_),M=(f,v)=>Ro(w,f,v),y=[],E=new Set,k=[],S=new Map,R=(f,v,L,H,O,X,$,j)=>{y.push(this.createPlacedSprite(f,v,L,H,O,X,$));let J={x:H,y:O,pScale:f.pScale,minSpacing:f.minSpacing,visualHalfW:f.effectiveWidth*X*.5,isCanopy:f.isCanopy,isBoulder:f.isBoulder},V=qe(v,L),se=S.get(V);se||(se=[],S.set(V,se)),se.push(J),j.push(J)};if(this.mountainCandidates.length>0){let f=new Set(c.map(v=>qe(v.q,v.r)));for(let v of u){if(v.reliefClass!=="mountain"||v.occupied)continue;let L=this.mountainCandidates.filter(te=>ho(te.entry,te.allowedTypes,v.terrainId,this.manifest)),H=this.mountainCandidates.filter(te=>!co(te.entry)),O=L.length>0?L:H.length>0?H:this.mountainCandidates,X=0;for(let te=0;te<O.length;te++)X+=Math.max(.1,O[te].entry.placement?.weight??1);let $=ie(n,v.q,v.r,2002)*X,j=O[0];for(let te=0;te<O.length;te++)if($-=Math.max(.1,O[te].entry.placement?.weight??1),$<=0){j=O[te];break}let J=256*(v.q+v.r*.5),V=$e*v.r+20,se=Math.max(72,(j.entry.mountain?.coreRadius??.32)*j.effectiveWidth);k.push({ux:J,uy:V,coreR2:se*se});let ue=qe(v.q,v.r);if(E.add(ue),f.has(ue)){let te=M(J,V);y.push(this.createPlacedSprite(j,v.q,v.r,J,V,1,te))}}}let U=c.filter(f=>!this.isWaterTerrain(f.terrainId)).length,C=ao(U),P={dead_trees:0,fallen_logs:0},Q=(f,v,L,H)=>{let O=f/L,X=v/L,$=Math.floor(O),j=Math.floor(X),J=O-$,V=X-j,se=J*J*(3-2*J),ue=V*V*(3-2*V),te=ie(n,$,j,H),be=ie(n,$+1,j,H),ve=ie(n,$,j+1,H),he=ie(n,$+1,j+1,H),me=te+(be-te)*se,xe=ve+(he-ve)*se;return me+(xe-me)*ue},z=(f,v,L,H)=>ie(n,v,L,H+f.pathSalt),K=(f,v,L=null)=>{if(L!==null)return L;if(f.isWaterBoulder)return Pr(v)*1.28;if(f.isBoulder)return Pr(v);let H=f.entry.scaleRange[0]??.85,O=f.entry.scaleRange[1]??1.15,X=f.entry.kind==="tree"?Math.min(H,.76):f.entry.kind==="shrub"?Math.min(H,.74):H,$=f.entry.kind==="tree"?Math.max(O,1.2):f.entry.kind==="shrub"?Math.max(O,1.22):O;return X+($-X)*v},W=(f,v)=>{for(let L=0;L<k.length;L++){let H=k[L],O=f-H.ux,X=v-H.uy;if(O*O+X*X<H.coreR2)return!0}return!1},N=(f,v,L,H,O)=>{if(L.length===0)return!0;let X=256*.5-(O+Math.min(74,H*.72));for(let $=0;$<L.length;$++){let[j,J]=Xi[L[$]];if(f*j+v*J>X)return!1}return!0},ee=(f,v,L,H)=>{if(m.length===0||L.isWaterBoulder)return!1;let O=b(f,v);return O===1/0?!1:L.isReed?O<21:O<24+Math.min(38,H*.45)},Z=(f,v,L,H,O,X,$,j,J=null,V,se=[],ue=34)=>{let te=f.entry,be=V??f.edgeMargin,ve=ie(n,v.q,v.r,$*47+7),he=K(f,ve,J),me=f.effectiveWidth*he*.5,xe=f.pKind,Me=f.pScale,ye=f.minSpacing,Te=f.isCanopy,Se=te.kind==="tree";for(let Ge=0;Ge<28;Ge++){let{dx:Ie,dy:Oe}=vo(n,v.q,v.r,xe,$,Ge);if(!Cr(Ie,Oe,be)||!N(Ie,Oe,se,me,ue)||Se&&vn(X,Ie,Oe))continue;let Ue=L+Ie,De=H+Oe;if(W(Ue,De)||ee(Ue,De,f,me))continue;let G=!1;for(let ne=0;ne<O.length;ne++){let B=O[ne],A=Math.sqrt(Me*B.pScale),q=Te&&B.isCanopy,oe=q?j:Math.max(.85,j),ae=Math.max(q&&oe<.6?10:14,Math.max(ye,B.minSpacing)*oe*A);!q&&(f.isBoulder||B.isBoulder)&&(ae=Math.max(ae,(me+B.visualHalfW)*.56));let re=Ue-B.x,le=De-B.y;if(re*re+le*le<ae*ae){G=!0;break}}if(G)continue;let Y=M(Ue,De);return R(f,v.q,v.r,Ue,De,he,Y,O),{ux:Ue,uy:De,scale:he,halfW:me}}return null},x=(f,v,L,H,O,X,$,j,J,V,se,ue,te,be,ve,he=[],me=34)=>{let xe=ve??f.edgeMargin,Me=ie(n,v.q,v.r,te*53+13),ye=K(f,Me,V),Te=f.effectiveWidth*ye*.5,Se=f.pScale,Ge=f.minSpacing,Ie=f.entry.kind==="tree",Oe=ie(n,v.q,v.r,te*61+19)*Math.PI*2,Ue=Math.max(j,$*.68+Te*.44),De=Math.max(J,Ue+28);for(let G=0;G<20;G++){let Y=ie(n,v.q,v.r,te*71+G*11+3),ne=ie(n,v.q,v.r,te*73+G*13+5),B=Oe+G*2.3999632+(ne-.5)*.42,A=Ue+(De-Ue)*Y,q=O+Math.cos(B)*A,oe=X+Math.sin(B)*A*.78,ae=q-L,re=oe-H;if(!Cr(ae,re,xe)||!N(ae,re,he,Te,me)||Ie&&vn(ue,ae,re)||W(q,oe)||ee(q,oe,f,Te))continue;let le=!1;for(let de=0;de<se.length;de++){let _e=se[de],Be=Math.sqrt(Se*_e.pScale),He=Math.max(10,Math.max(Ge,_e.minSpacing)*be*Be);(f.isBoulder||_e.isBoulder)&&(He=Math.max(He,(Te+_e.visualHalfW)*.56));let tt=q-_e.x,Qe=oe-_e.y;if(tt*tt+Qe*Qe<He*He){le=!0;break}}if(le)continue;let we=M(q,oe);return R(f,v.q,v.r,q,oe,ye,we,se),{ux:q,uy:oe,scale:ye,halfW:Te}}return null},F=(f,v)=>{for(let L=-2;L<=2;L++)for(let H=-2;H<=2;H++){if(Ze(0,0,H,L)>2)continue;let O=this.lookupRawHex(f+H,v+L);if(O&&O.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let f=this.waterBoulderCandidates;for(let v of c){if(v.occupied||!Kt.has(v.terrainId)||v.terrainId!=="coastal_water"&&!F(v.q,v.r))continue;let L=.45+1.2*Q(v.q,v.r,3.2,4107),H=v.terrainId==="coastal_water"?.27:v.terrainId==="stormy_ocean"?.19:.15,O=Math.min(.48,H*L);if(ie(n,v.q,v.r,4111)>=O)continue;let X=[];for(let ve=0;ve<6;ve++){let[he,me]=Re[ve],xe=this.lookupRawHex(v.q+he,v.r+me);xe&&!this.isWaterTerrain(xe.terrainId)&&X.push(ve)}let $=256*(v.q+v.r*.5),j=$e*v.r,J=[];for(let ve=-1;ve<=1;ve++)for(let he=-1;he<=1;he++){let me=S.get(qe(v.q+he,v.r+ve));if(me)for(let xe=0;xe<me.length;xe++)J.push(me[xe])}let V=Math.floor(ie(n,v.q,v.r,4113)*f.length),se=f[V%f.length],ue=1,te=Z(se,v,$,j,J,void 0,ue++,.85,null,20,X,30);if(!te)continue;let be=ie(n,v.q,v.r,4117);if(be<.48){let ve=be<.18?2:1;for(let he=0;he<ve;he++){let me=Math.floor(ie(n,v.q,v.r,4121+he*7)*f.length),xe=f[me%f.length],Me=ie(n,v.q,v.r,4129+he*11),ye=Math.max(.55,Math.min(2.35,te.scale*(.4+.46*Me)));x(xe,v,$,j,te.ux,te.uy,te.halfW,Math.max(24,te.scale*20),Math.max(64,te.scale*38),ye,J,void 0,ue++,.62,18,X,30)}}}}let T=this.forestConfig.mode,D=this.forestConfig.openTreeChance;for(let f of c){let v=qe(f.q,f.r);if(f.occupied||E.has(v)||this.isWaterTerrain(f.terrainId))continue;let L=a.get(v);if(yo(n,f.q,f.r,L))continue;let H=[],O=[];for(let ce=0;ce<6;ce++){let[pe,ge]=Re[ce],fe=this.lookupRawHex(f.q+pe,f.r+ge);fe&&(H.push(fe.terrainId),this.isWaterTerrain(fe.terrainId)&&O.push(ce))}let X=L?.forestClass??"none",$=X==="dense_forest"||X==="light_forest",j=X==="light_forest"||!$&&(L?.edgeInfluence??0)>.1,J=!!(f.riverEdges&&f.riverEdges.length>0),V=Jn.has(f.terrainId),se=$i.has(f.terrainId),ue=V||f.terrainId==="semi_desert"||f.terrainId==="savanna",te=$?this.candidatesByTerrainForest.get(f.terrainId)??this.allCandidates:this.candidatesByTerrain.get(f.terrainId)??this.allCandidates;if(te.length===0)continue;let be={baseBiome:f.terrainId,biome:L?.biome??f.terrainId,forestClass:X,neighborTypes:H,hasRiverEdge:J},ve=Yt.has(f.terrainId),he=[],me=[],xe=[],Me=[],ye=[],Te=[],Se=[],Ge=!1;for(let ce=0;ce<te.length;ce++){let pe=te[ce],ge=pe.entry;bo(ge.family,L)&&fo(ge,pe.allowedTypes,be,this.manifest,pe.pre)&&(f.terrainId==="tundra"&&ge.family==="snow_conifers"&&z(pe,f.q,f.r,973)>=.02||(Ge=!0,pe.isCanopy?ve&&(ge.family==="palms"||pe.isAcacia)?he.push(pe):me.push(pe):pe.isBoulder?(xe.push(pe),pe.isWarmBoulder&&Me.push(pe)):pe.isDryPatch?ye.push(pe):ge.family==="snow"?Te.push(pe):Se.push(pe)))}if(!Ge)continue;me.sort((ce,pe)=>{let ge=ce.entry.placement,fe=pe.entry.placement,Pe=z(ce,f.q,f.r,301)/Math.max(.04,(ge.density??.12)*Math.min(1,ge.weight??1)),We=z(pe,f.q,f.r,301)/Math.max(.04,(fe.density??.12)*Math.min(1,fe.weight??1));return Pe-We}),Se.sort((ce,pe)=>z(ce,f.q,f.r,302)-z(pe,f.q,f.r,302));let Ie=Se.filter(ce=>(ce.pKind==="shrub"||ce.pKind==="ground_cover")&&!ce.isAccent&&!ce.accentGroup&&!(V&&(ce.isBush20to29||ce.isHerb))),Oe=po(L);Oe>1&&Qt(n,f.q,f.r,"tree")<.58&&Oe--;let Ue=go(L),De=Q(f.q,f.r,4.2,5107),G=Q(f.q,f.r,1.9,5119),Y=Math.pow(De*.68+G*.32,1.35),ne=$?1:.14+1.76*Y,B=$?Ue:Math.max(Ue,10),A=T==="canopy"?X==="dense_forest"?.34:X==="light_forest"?.59:.88:T==="dense"?X==="dense_forest"?.52:X==="light_forest"?.73:1:X==="dense_forest"?.72:X==="light_forest"?.92:1,q=256*(f.q+f.r*.5),oe=$e*f.r,ae=[];for(let ce=-1;ce<=1;ce++)for(let pe=-1;pe<=1;pe++){let ge=S.get(qe(f.q+pe,f.r+ce));if(ge)for(let fe=0;fe<ge.length;fe++)ae.push(ge[fe])}let re=0,le=0,we=0,de=1,_e=(ce,pe)=>{if($||re>=B)return;let ge=ie(n,f.q,f.r,5201+de*17);if(pe.length>0&&ge<.46){let We=ne>1.08&&ge<.2?2:1;for(let Ce=0;Ce<We&&re<B;Ce++){let Le=Math.floor(ie(n,f.q,f.r,5211+Ce*7)*pe.length),ke=pe[Le%pe.length],Xe=ie(n,f.q,f.r,5221+Ce*9),Ve=Math.max(.5,Math.min(1.85,ce.scale*(.38+.44*Xe)));x(ke,f,q,oe,ce.ux,ce.uy,ce.halfW,Math.max(20,ce.halfW*.72),Math.max(52,ce.halfW*1.45),Ve,ae,L,de++,.55,void 0,O)&&re++}}let fe=ue&&ye.length>0?V?ye:[...ye,...Ie]:Ie,Pe=ie(n,f.q,f.r,5237+de*13);if(fe.length>0&&Pe<.62){let We=1+Math.floor(ie(n,f.q,f.r,5243)*(ne>1.05?2:1));for(let Ce=0;Ce<We&&re<B;Ce++){let Le=Math.floor(ie(n,f.q,f.r,5251+Ce*11)*fe.length),ke=fe[Le%fe.length],Xe=ie(n,f.q,f.r,5261+Ce*7),Ve=ke.entry.scaleRange[0]??.85,rt=ke.entry.scaleRange[1]??1.15,nt=(Ve+(rt-Ve)*Xe)*.92;x(ke,f,q,oe,ce.ux,ce.uy,ce.halfW,Math.max(20,ce.halfW*.76),Math.max(54,ce.halfW*1.38+18),nt,ae,L,de++,.5,void 0,O)&&re++}}},He=Me.length>0&&ie(n,f.q,f.r,1607)<.85?Me:xe,tt=He.reduce((ce,pe)=>Math.max(ce,pe.entry.placement?.density??0),0),Qe=$?1:.72+.48*ne,st=Math.min(.44,tt*(Me.length>0?2.5:1.15)*Qe);if(Me.length>0&&re<B&&ie(n,f.q,f.r,1601)<st){let ce=Math.floor(ie(n,f.q,f.r,1602)*He.length);for(let pe=0;pe<He.length;pe++){let ge=He[(ce+pe)%He.length],fe=Z(ge,f,q,oe,ae,L,de++,1,null,void 0,O);if(fe){re++,_e(fe,He);break}}}if(he.length>0&&re<B&&ie(n,f.q,f.r,1751)<.065*(.75+.45*ne)){let ce=he.filter(Pe=>Pe.entry.family==="palms"),pe=he.filter(Pe=>Pe.isAcacia),ge=ie(n,f.q,f.r,1752)<.5?[ce,pe]:[pe,ce],fe=!1;for(let Pe of ge){if(!Pe.length||fe)continue;let We=Math.floor(ie(n,f.q,f.r,1753)*Pe.length);for(let Ce=0;Ce<Pe.length;Ce++){let Le=Pe[(We+Ce)%Pe.length],ke=Z(Le,f,q,oe,ae,L,de++,1,null,void 0,O);if(ke){if(re++,fe=!0,ie(n,f.q,f.r,1759)<.45){let Xe=1+Math.floor(ie(n,f.q,f.r,1763)*2);for(let Ve=0;Ve<Xe&&re<B;Ve++){let rt=Pe[(We+Ve+1)%Pe.length];x(rt,f,q,oe,ke.ux,ke.uy,ke.halfW,22,56,null,ae,L,de++,.54,void 0,O)&&re++}}break}}}}let St=Math.min(.58,to(f.terrainId)*(.76+.44*ne));if(ye.length>0&&re<B&&ie(n,f.q,f.r,1831)<St){let ce=Math.floor(ie(n,f.q,f.r,1832)*ye.length);for(let pe=0;pe<ye.length;pe++){let ge=ye[(ce+pe)%ye.length],fe=Z(ge,f,q,oe,ae,L,de++,.9,null,void 0,O);if(fe){re++;let Pe=ie(n,f.q,f.r,1837);if(!$&&Pe<.52&&re<B){let We=Pe<.22&&ne>.95?2:1;for(let Ce=0;Ce<We&&re<B;Ce++){let Le=ye[(ce+1+Ce+Math.floor(Pe*11))%ye.length],ke=ie(n,f.q,f.r,1843+Ce*7),Xe=Le.entry.scaleRange[0]??.8,Ve=Le.entry.scaleRange[1]??1.15,rt=(Xe+(Ve-Xe)*ke)*(.76+.3*ke);x(Le,f,q,oe,fe.ux,fe.uy,fe.halfW,16,44,rt,ae,L,de++,.48,void 0,O)&&re++}}break}}}let ht=T==="canopy"&&$?L?.canopyCoverage??0:0,rn=ht?Math.max(Oe,Ue-2):Oe;for(let ce=0;ce<rn&&re<Ue&&me.length>0&&!(le>=Oe&&(!ht||we>=ht));ce++){let pe=me[ce%Math.min(me.length,5)],ge=null;if(j){let Pe=ie(n,f.q,f.r,de*47+7);ge=K(pe,Pe,null)*(.76+.16*Pe)}let fe=Z(pe,f,q,oe,ae,L,de++,A,ge,void 0,O);fe&&(le++,re++,we+=pe.crownAreaRatio*fe.scale*fe.scale)}let nn=Math.min(.68,D*(.62+.62*ne));if(!Oe&&!L?.glade&&me.length>0&&D>0&&z(me[0],f.q,f.r,311)<nn&&re<B){let ce=Z(me[0],f,q,oe,ae,L,de++,1,null,void 0,O);if(ce){re++;let pe=ie(n,f.q,f.r,5301),ge=D>.25?.64:.52;if(pe<ge){let fe=1+Math.floor(ie(n,f.q,f.r,5303)*3),Pe=Math.min(me.length,4);for(let We=0;We<fe&&re<B;We++){let Ce=me[(We+1)%Pe];x(Ce,f,q,oe,ce.ux,ce.uy,ce.halfW,24,62,null,ae,L,de++,.52,void 0,O)&&re++}if(Ie.length>0&&re<B){let We=ie(n,f.q,f.r,5311)<.55?2:1;for(let Ce=0;Ce<We&&re<B;Ce++){let Le=Math.floor(ie(n,f.q,f.r,5317+Ce*7)*Ie.length),ke=Ie[Le%Ie.length];x(ke,f,q,oe,ce.ux,ce.uy,ce.halfW,18,48,null,ae,L,de++,.48,void 0,O)&&re++}}else if(xe.length>0&&re<B&&ie(n,f.q,f.r,5323)<.35){let We=xe[Math.floor(ie(n,f.q,f.r,5329)*xe.length)];x(We,f,q,oe,ce.ux,ce.uy,ce.halfW,20,48,.62+ie(n,f.q,f.r,5333)*.45,ae,L,de++,.52,void 0,O)&&re++}}}}let on=$?1:.72+.48*ne;if(Me.length===0&&xe.length>0&&re<B&&ie(n,f.q,f.r,1601)<Math.min(.36,tt*1.15*on)){let ce=Math.floor(ie(n,f.q,f.r,1602)*xe.length);for(let pe=0;pe<xe.length;pe++){let ge=xe[(ce+pe)%xe.length],fe=Z(ge,f,q,oe,ae,L,de++,1,null,void 0,O);if(fe){re++,_e(fe,xe);break}}}if(Te.length>0&&re<B){let ce=f.terrainId==="snowfields"||f.terrainId==="frozen_tundra"?.58:f.terrainId==="highland"?.25:.14;if(ie(n,f.q,f.r,1643)<ce){let pe=Math.floor(ie(n,f.q,f.r,1644)*Te.length);for(let ge=0;ge<Te.length;ge++){let fe=Te[(pe+ge)%Te.length];if(Z(fe,f,q,oe,ae,L,de++,A,null,void 0,O)){re++;break}}}}if(Se.length>0&&re<B){let ce=X==="dense_forest"?1.2:j?1.28:.58+.62*ne,pe=Qt(n,f.q,f.r,"shrub"),ge=Qt(n,f.q,f.r,"ground_cover"),fe=Qt(n,f.q,f.r,"other"),Pe=!1,We=!1,Ce=!1,Le=Se.filter(ke=>ke.isReed);for(let ke of Se){if(re>=B)break;let Xe=ke.entry,Ve=ke.accentGroup;if(Ve&&(Pe||P[Ve]>=C[Ve]))continue;let rt=ke.pKind==="shrub"?pe:ke.pKind==="ground_cover"?ge:fe,nt=1;ke.isBush20to29?V?nt=.022:f.terrainId==="savanna"?nt=.55:f.terrainId==="semi_desert"?nt=.92:(Yi.has(f.terrainId)||$)&&(nt=1.32):ke.isHerb&&V?nt=.3:ke.isReed&&(se?nt=1.65:(J||O.length>0)&&(nt=1.35));let Ft=Math.min(.86,(Xe.placement?.density??.15)*Math.min(1,Xe.placement?.weight??1)*ce*ke.chanceMult*nt*rt);if(z(ke,f.q,f.r,312)>=Ft)continue;let ot=Z(ke,f,q,oe,ae,L,de++,A,null,void 0,O);if(ot){if(re++,Ve)P[Ve]++,Pe=!0;else if(ke.isAccent)Pe=!0;else if(ke.isReed&&!Ce&&Le.length>0&&re<B){if(ie(n,f.q,f.r,5501+de*13)<.74){Ce=!0;let Pt=1+Math.floor(ie(n,f.q,f.r,5507)*3);for(let Rt=0;Rt<Pt&&re<B;Rt++){let an=Math.floor(ie(n,f.q,f.r,5519+Rt*7)*Le.length),ct=Le[an%Le.length],ur=ie(n,f.q,f.r,5527+Rt*11),Lt=ct.entry.scaleRange[0]??.85,dr=ct.entry.scaleRange[1]??1.15,fr=(Lt+(dr-Lt)*ur)*(.78+.3*ur);x(ct,f,q,oe,ot.ux,ot.uy,ot.halfW,14,38,fr,ae,L,de++,.42,void 0,O)&&re++}}}else if(!$&&!We&&ke.pKind==="shrub"&&!(V&&ke.isBush20to29)&&Ie.length>0&&re<B){let Et=ie(n,f.q,f.r,5401+de*19);if(Et<.5){We=!0;let Pt=Ie.filter(ct=>ct.entry.family===Xe.family),Rt=Pt.length>0?Pt:Ie,an=Et<.22&&ne>.9?2:1;for(let ct=0;ct<an&&re<B;ct++){let ur=Math.floor(ie(n,f.q,f.r,5413+ct*11)*Rt.length),Lt=Rt[ur%Rt.length],dr=ie(n,f.q,f.r,5423+ct*7),fr=Lt.entry.scaleRange[0]??.85,Si=Lt.entry.scaleRange[1]??1.15,_i=(fr+(Si-fr)*dr)*(.72+.3*dr);x(Lt,f,q,oe,ot.ux,ot.uy,ot.halfW,15,40,_i,ae,L,de++,.46,void 0,O)&&re++}if(xe.length>0&&re<B&&ie(n,f.q,f.r,5437)<.22){let ct=xe[Math.floor(ie(n,f.q,f.r,5441)*xe.length)];x(ct,f,q,oe,ot.ux,ot.uy,ot.halfW,18,42,.55+ie(n,f.q,f.r,5443)*.48,ae,L,de++,.52,void 0,O)&&re++}}}}}}if(J&&!V&&!kt.has(f.terrainId)&&this.reedCandidates.length>0&&re<B&&ie(n,f.q,f.r,5601)<.68){let ce=this.reedCandidates,pe=Math.floor(ie(n,f.q,f.r,5609)*ce.length),ge=ce[pe%ce.length],fe=Z(ge,f,q,oe,ae,L,de++,.7,null,void 0,O);if(fe){re++;let Pe=1+Math.floor(ie(n,f.q,f.r,5617)*2);for(let We=0;We<Pe&&re<B;We++){let Ce=ce[(pe+We+1)%ce.length];x(Ce,f,q,oe,fe.ux,fe.uy,fe.halfW,14,36,null,ae,L,de++,.42,void 0,O)&&re++}}}}let I=[];if(this.decalCandidatesByTerrain.size>0)for(let f of c){if(this.isWaterTerrain(f.terrainId)||f.reliefClass==="mountain"||kt.has(f.terrainId))continue;let v=this.decalCandidatesByTerrain.get(f.terrainId);if(!v||v.length===0)continue;let L=Math.sin(f.q*.31+f.r*.19+n%53)*Math.cos(f.q*.17-f.r*.37+n%29),H=Math.sin(f.q*.67-f.r*.53+n%97)*.45,O=.5+.5*(L*.72+H*.28),X=ie(n,f.q,f.r,7091),j=f.terrainId.includes("desert")||f.terrainId.includes("badlands")||f.terrainId.includes("savanna")||f.terrainId.includes("semi_arid")||f.terrainId.includes("dry")?.38+O*.38:.48+O*.38;if(X>=j)continue;let J=256*(f.q+f.r*.5),V=$e*f.r,ue=Re.some(([ye,Te])=>{let Se=this.lookupRawHex(f.q+ye,f.r+Te);return Se?this.isWaterTerrain(Se.terrainId):!1})?46:28,te=f.forestDensity??0,be=O>.52&&X<j*.58?2:1,ve=this.manifest.terrain.byType[f.terrainId]?.avgColor,he=ve?(Math.max(0,Math.min(255,Math.round(ve[0])))&255)<<16|(Math.max(0,Math.min(255,Math.round(ve[1])))&255)<<8|Math.max(0,Math.min(255,Math.round(ve[2])))&255:0,me=[];for(let ye=0;ye<v.length;ye++){let Te=v[ye],Se=Te.entry.tags??[];Se.includes("meadow_decal")&&te>.42||Se.includes("woodland_decal")&&te<.2&&f.terrainId!=="forest_floor"&&f.terrainId!=="swamp"&&f.terrainId!=="marsh"&&f.terrainId!=="marshland"&&f.terrainId!=="moor"&&f.terrainId!=="jungle"||me.push(Te)}if(me.length===0)continue;let xe=new Set,Me=[];for(let ye=0;ye<be;ye++){let Te=Math.floor(ie(n,f.q,f.r,7109+ye*31)*me.length),Se=me[Te%me.length];if(xe.has(Se.key))continue;let Ge=Se.pathSalt+ye*1777,Ie=(ie(n,f.q,f.r,Ge+7121+ye*7)-.5)*148,Oe=(ie(n,f.q,f.r,Ge+7129+ye*7)-.5)*148,Ue=J+Ie,De=V+Oe;if(!Cr(Ie,Oe,ue)||b(Ue,De)<54||Me.some(we=>Math.hypot(we.ux-Ue,we.uy-De)<38))continue;let G=Se.entry.tags??[],Y=ie(n,f.q,f.r,Ge+7151),ne=Math.max(.78,Se.entry.scaleRange[0]??.78),B=Math.max(1.32,Se.entry.scaleRange[1]??1.32),A=ne+(B-ne)*Y,q=.86+ie(n,f.q,f.r,Ge+7163)*.28,oe=ji(Se.key,G,ie(n,f.q,f.r,Ge+7177)),ae=G.includes("terrain_tint"),re=G.includes("rock_decal")||G.includes("woodland_decal")||G.includes("wetland_decal"),le=this.createPlacedSprite(Se,f.q,f.r,Ue,De,A,M(Ue,De));le.width*=q,le.height/=Math.sqrt(q),le.rotationRad=oe,he>0&&(ae?(le.terrainTintRgb=he,le.terrainTintMix=.96):re&&(le.terrainTintRgb=he,le.terrainTintMix=.28)),I.push(le),xe.add(Se.key),Me.push({ux:Ue,uy:De})}}return y.sort((f,v)=>(f.sortY??f.y)-(v.sortY??v.y)||f.x-v.x),{cq:e,cr:r,key:Mt(e,r),originQ:o,originR:i,cells:s,sprites:y,decals:I,shorelines:l,riverRoutes:h}}};var Gt=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var Fo=sn(mr());var yt=32,Qi=32;function Ji(t){return t==="mountain"||t==="hills"?t:"flat"}function Wo(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function Lo(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Gt},r=Fo.default.createPointSampler(t.seed,e),o=t.halfExtent,i=t.fogPolicy??(()=>2),n=t.overrides,s=new Map,u=(a,l)=>{let d=`${a},${l}`,h=s.get(d);if(h)return s.delete(d),s.set(d,h),h;let m=a*yt,g=l*yt,b=r.traceRivers(m,g,yt,yt),p=[],_=new Set;for(let M=0;M<b.routes.length;M++){let y=b.routes[M];if(!y||y.length<2)continue;let E=y[0],k=y[y.length-1],S=`${E[0]},${E[1]}->${k[0]},${k[1]}:${y.length}`;_.has(S)||(_.add(S),p.push({id:S,hexes:y}))}let w={routes:p,edgesByKey:b.edgesByKey};for(s.set(d,w);s.size>Qi;){let M=s.keys().next().value;if(M===void 0)break;s.delete(M)}return w},c=({cq:a,cr:l,chunkSize:d})=>{let h=a*d,m=l*d,g=[];for(let b=0;b<d;b++){let p=m+b;if(o!==void 0&&Math.abs(p)>o)continue;let _=Math.floor(p/yt);for(let w=0;w<d;w++){let M=h+w;if(o!==void 0&&Math.abs(M)>o)continue;let y=Math.floor(M/yt),E=u(y,_),k=r.sampleCell(M,p),S=qe(M,p),R=i(M,p),U=n?.get(S),C=U?.reliefClass??Ji(k.reliefClass),P=U?.forestDensity!==void 0?U.forestDensity:k.forestDensity>0?k.forestDensity:0,Q=U?.forestClass??(U?.forestDensity!==void 0?Wo(void 0,P):Wo(k.forestClass,P)),z=E.edgesByKey.get(S);g.push({q:M,r:p,terrainId:U?.terrainId??k.terrainId,reliefClass:C,hillProfile:U?.hillProfile!==void 0?U.hillProfile:C==="hills"?k.hillProfile??"rounded":null,hillStrength:U?.hillStrength!==void 0?U.hillStrength:C==="hills"?Math.max(.35,k.hillStrength||.72):0,forestClass:Q,forestDensity:P,fogState:U?.fogState??R,occupied:U?.occupied,riverEdges:U?.riverEdges!==void 0?U.riverEdges:z&&z.length>0?[...z]:void 0})}}return g};return c.getRiverRoutesForChunk=(a,l,d)=>{let h=a*d,m=h+d-1,g=l*d,b=g+d-1,p=Math.floor(h/yt),_=Math.floor(m/yt),w=Math.floor(g/yt),M=Math.floor(b/yt),y=[],E=new Set;for(let k=w;k<=M;k++)for(let S=p;S<=_;S++){let R=u(S,k);for(let U of R.routes){if(E.has(U.id))continue;let C=!1;for(let P=0;P<U.hexes.length;P++){let[Q,z]=U.hexes[P];if(Q>=h&&Q<=m&&z>=g&&z<=b){C=!0;break}}C&&(E.add(U.id),y.push(U))}}return y},c}var ea=new Set(["ocean","coastal_water","stormy_ocean","icy_ocean"]);function gt(t){return!!(t&&ea.has(t))}function Tt(t){let e=new Set,{routes:r=[],manualRivers:o=[],isWaterHex:i}=t;for(let n=0;n<r.length;n++){let s=Ao(r[n],i);for(let u of s)e.add(u)}for(let n=0;n<o.length;n++){let s=o[n],u=Re[(s.dir%6+6)%6];if(!u)continue;let c=et(s.q,s.r,s.q+u[0],s.r+u[1]);e.add(c.key)}return e}function Ar(t){let{q1:e,r1:r,q2:o,r2:i,isGate:n=!1,lookupHex:s,occupiedRiverEdges:u,existingRoads:c=[]}=t;if(Ze(e,r,o,i)!==1)return{ok:!1,code:"not_adjacent",reason:"Nur direkt benachbarte Hexfelder teilen eine Mauerkante."};let a=s(e,r),l=s(o,i);if(!a||!l)return{ok:!1,code:"missing_hex",reason:"Kante liegt au\xDFerhalb der geladenen Karte."};if(gt(a.terrainId)||gt(l.terrainId))return{ok:!1,code:"water_forbidden",reason:"An Wasser-/K\xFCstenwasserkanten ist keine Mauer erlaubt."};if(a.reliefClass==="mountain"||l.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Auf Bergkanten ist keine Mauer erlaubt."};let d=et(e,r,o,i);return u.has(d.key)?{ok:!1,code:"river_edge_forbidden",reason:"Auf einer Flusskante ist keine Mauer erlaubt (Eckanschluss an benachbarter Landkante bleibt zul\xE4ssig)."}:!n&&c.length>0&&c.some(m=>et(m.q1,m.r1,m.q2,m.r2).key===d.key)?{ok:!1,code:"road_requires_gate",reason:"\xDCber eine bestehende Stra\xDFe muss ein Tor statt einer geschlossenen Mauer gesetzt werden."}:{ok:!0}}function kr(t){let{q:e,r,dir:o,lookupHex:i,existingWalls:n=[]}=t,s=Re[(o%6+6)%6];if(!s)return{ok:!1,code:"not_adjacent",reason:"Ung\xFCltige Flusskanten-Richtung."};let u=e+s[0],c=r+s[1],a=i(e,r),l=i(u,c);if(!a||!l)return{ok:!1,code:"missing_hex",reason:"Flusskante liegt au\xDFerhalb der geladenen Karte."};if(gt(a.terrainId)||gt(l.terrainId))return{ok:!1,code:"water_forbidden",reason:"Flusskanten verlaufen nur zwischen Land-Hexen (M\xFCndungen enden an der K\xFCstenecke)."};let d=et(e,r,u,c);return n.some(m=>et(m.q1,m.r1,m.q2,m.r2).key===d.key)?{ok:!1,code:"wall_edge_forbidden",reason:"Auf einer bestehenden Mauerkante kann kein Fluss liegen."}:{ok:!0}}function Wr(t){let{q1:e,r1:r,q2:o,r2:i,lookupHex:n,existingWalls:s=[]}=t;if(Ze(e,r,o,i)!==1)return{ok:!1,code:"not_adjacent",reason:"Stra\xDFen verbinden nur direkt benachbarte Hexfelder."};let u=n(e,r),c=n(o,i);if(!u||!c)return{ok:!1,code:"missing_hex",reason:"Stra\xDFensegment liegt au\xDFerhalb der geladenen Karte."};if(gt(u.terrainId)||gt(c.terrainId))return{ok:!1,code:"water_forbidden",reason:"Stra\xDFen k\xF6nnen nicht auf Wasser gelegt werden."};if(u.reliefClass==="mountain"||c.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Stra\xDFen k\xF6nnen nicht \xFCber Gebirge gelegt werden."};let a=et(e,r,o,i);return s.some(d=>!d.isGate&&et(d.q1,d.r1,d.q2,d.r2).key===a.key)?{ok:!1,code:"closed_wall_blocks_road",reason:"Eine geschlossene Mauer blockiert diese Kante \u2014 erst ein Tor setzen."}:{ok:!0}}var Bo=sn(mr());var ze=[.24,.62,.96],Fr=[.92,.28,.3],ta=[.22,.78,.48],Io=[.94,.72,.22],ra=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function Ot(t){return t.surfaceClass!=="land"}function xt(t){return!Ot(t)&&t.reliefClass!=="mountain"}function ir(t,e,r,o){let i=t.sampleCell(e,r);if(o==="harbor"){if(!Ot(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let u=[];for(let[c,a]of Re){let l=t.sampleCell(e+c,r+a);xt(l)&&u.push({q:e+c,r:r+a})}return{center:{q:e,r},buildingKind:o,valid:u.length>0,yieldPercent:100,bonusHexes:u,reason:u.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!xt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:i.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],s=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let u=-2;u<=2;u++)for(let c=-2;c<=2;c++){if(Ze(0,0,c,u)>2)continue;let a=e+c,l=r+u,d=t.sampleCell(a,l);o==="farm"?xt(d)&&ra.has(d.terrainId)&&(n.push({q:a,r:l}),s+=5):o==="lumber_camp"?xt(d)&&d.forestDensity>.08&&(n.push({q:a,r:l}),s+=5):o==="quarry"&&(d.reliefClass==="hills"||d.reliefClass==="mountain")&&(n.push({q:a,r:l}),s+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,s),bonusHexes:n}}function Ke(t,e,r,o){for(let i=0;i<=32;i++)for(let n=-i;n<=i;n++)for(let s=-i;s<=i;s++){if(Ze(0,0,s,n)!==i)continue;let u=e+s,c=r+n,a=t.sampleCell(u,c);if(xt(a)&&(!o||o(a)))return{q:u,r:c}}return{q:e,r}}function na(t,e,r){for(let o=0;o<=45;o++)for(let i=-o;i<=o;i++)for(let n=-o;n<=o;n++){if(Ze(0,0,n,i)!==o)continue;let s=e+n,u=r+i,c=t.sampleCell(s,u);if(Ot(c))for(let[a,l]of Re){let d=t.sampleCell(s+a,u+l);if(xt(d))return{water:{q:s,r:u},land:{q:s+a,r:u+l}}}}return{water:{q:e,r},land:{q:e+1,r}}}function Ct(t,e,r,o,i,n,s,u=!1){let c=[];for(let a=-i;a<=i;a++)for(let l=-i;l<=i;l++){if(Ze(0,0,l,a)>i)continue;let d=o.q+l,h=o.r+a,m=qe(d,h);if(r.has(m))continue;let g=t.sampleCell(d,h);!u&&!xt(g)||g.reliefClass!=="mountain"&&(r.add(m),e.push({q:d,r:h,ownerId:n,color:s}),c.push({q:d,r:h}))}return c}function Ut(t,e,r){let o=[],i=t.q,n=t.r,s=0;for(;(i!==e.q||n!==e.r)&&s++<40;){let u=0,c=1/0;for(let d=0;d<6;d++){let h=i+Re[d][0],m=n+Re[d][1],g=Ze(h,m,e.q,e.r);g<c&&(c=g,u=d)}let a=i+Re[u][0],l=n+Re[u][1];o.push({q1:i,r1:n,q2:a,r2:l,tier:r}),i=a,n=l}return o}function Tn(t,e,r=0,o="player",i){let n=new Set(t.map(l=>qe(l.q,l.r))),s=new Set,u=new Set;if(i?.roads)for(let l of i.roads)u.add(et(l.q1,l.r1,l.q2,l.r2).key);let c=[],a=0;for(let l of t)for(let d=0;d<6;d++){let h=l.q+Re[d][0],m=l.r+Re[d][1];if(n.has(qe(h,m)))continue;let g=et(l.q,l.r,h,m);if(s.has(g.key)||(s.add(g.key),i?.occupiedRiverEdges?.has(g.key)))continue;if(i?.sampler){let p=i.sampler.sampleCell(g.q1,g.r1),_=i.sampler.sampleCell(g.q2,g.r2);if(!xt(p)||!xt(_))continue}a++;let b=u.has(g.key);c.push({q1:g.q1,r1:g.r1,q2:g.q2,r2:g.r2,kind:e,isGate:b||r>0&&a%r===0,ownerId:o})}return c}function Do(t,e,r,o){let i=[],n=t,s=e,u=0;for(let c=0;c<r;c++){let a=Re[u];if(o&&a){let l=o.sampleCell(n,s),d=o.sampleCell(n+a[0],s+a[1]);if(Ot(l)||Ot(d))break}if(i.push({q:n,r:s,dir:u}),c%2===0)u=(u+1)%6;else{let l=(u+1)%6;n+=Re[l][0],s+=Re[l][1],u=(u+5)%6}}return i}function qo(t,e="vedras-welt-01",r){let o=r===void 0?Gt:r===null?void 0:r,i=Bo.default.createPointSampler(e,o);if(t==="fresh-start"){let P=Ke(i,0,0),Q=Ke(i,P.q-2,P.r+1),z=[];return Ct(i,z,new Set,P,1,"player",ze),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:P,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:P.q,r:P.r,visR:3,expR:5}],scene:{territory:z,buildings:[{id:"cap-1",q:P.q,r:P.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:ze}],units:[{id:"scout-1",q:P.q+1,r:P.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:ze,marchPath:[{q:P.q+1,r:P.r},{q:P.q+2,r:P.r},{q:P.q+3,r:P.r-1}]}],sites:[{id:"site-1",q:Q.q,r:Q.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let P=Ke(i,108,-70),Q=Ke(i,P.q+7,P.r-1),z=[],K=new Set,W=Ct(i,z,K,P,3,"player",ze);Ct(i,z,K,Q,3,"enemy",Fr);let N=Ke(i,P.q+2,P.r),ee=[...Ut(P,N,"stone"),...Ut(N,Q,"packed")],Z=Do(P.q-2,P.r-3,7,i),x=Tt({manualRivers:Z}),F=Tn(W.filter(f=>Ze(f.q,f.r,P.q,P.r)<=1),"stone",3,"player",{sampler:i,occupiedRiverEdges:x,roads:ee});F.length>0&&(F[0].breached=!0);let T={q:N.q+2,r:N.r},D=[{id:"blue-cap",q:P.q,r:P.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:ze},{id:"blue-fort",q:N.q,r:N.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:ze,rangeRadius:2},{id:"red-cap",q:Q.q,r:Q.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:Fr}],I=[{id:"u-blue-def",q:N.q,r:N.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:ze,marchPath:[{q:P.q+1,r:P.r+1},{q:N.q,r:N.r+1}]},{id:"u-red-siege",q:T.q,r:T.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:Fr,inCombat:!0,marchPath:[T,{q:N.q+1,r:N.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((P.q+Q.q)/2),r:Math.round((P.r+Q.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:P.q,r:P.r,visR:6,expR:12},{q:N.q,r:N.r,visR:5,expR:10}],scene:{territory:z,rivers:Z,roads:ee,walls:F,buildings:D,units:I}}}if(t==="coastal-harbors"){let P=na(i,2,-2),Q=[],z=new Set;Ct(i,Q,z,P.land,2,"player",ze,!1),Ct(i,Q,z,P.water,2,"player",ze,!0);let K={q:P.water.q+1,r:P.water.r};for(let[ee,Z]of Re){let x=i.sampleCell(P.water.q+ee,P.water.r+Z);if(Ot(x)){K={q:P.water.q+ee,r:P.water.r+Z};break}}let W=[{id:"coastal-cap",q:P.land.q,r:P.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:ze},{id:"harbor-1",q:P.water.q,r:P.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:ze}],N=[{id:"boat-1",q:K.q,r:K.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:ze,marchPath:[P.water,K]},{id:"scout-sea",q:P.water.q,r:P.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:ze}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:P.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:P.water.q,r:P.water.r,visR:6,expR:11}],scene:{territory:Q,roads:Ut(P.land,{q:P.land.q-2,r:P.land.r+1},"packed"),buildings:W,units:N}}}if(t==="sites-and-fauna"){let P=Ke(i,0,0,N=>(N.terrainId==="grassland"||N.terrainId==="pasture")&&N.forestDensity<.25),Q=new Set,z=(N,ee,Z)=>{let x=P.q+N,F=P.r+ee;for(let D=0;D<=4;D++)for(let I=-D;I<=D;I++)for(let f=-D;f<=D;f++){if(Ze(0,0,f,I)!==D)continue;let v=x+f,L=F+I,H=qe(v,L);if(Q.has(H))continue;let O=i.sampleCell(v,L);if(xt(O)&&(!Z||Z(O)))return Q.add(H),{q:v,r:L}}let T=Ke(i,x,F);return Q.add(qe(T.q,T.r)),T},W=[{id:"fauna-deer-1",dq:0,dr:0,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel (animiert)"},{id:"fauna-horse-1",dq:1,dr:0,family:"fauna",faunaSpecies:"horse",label:"Wildpferde (animiert)"},{id:"site-sc-1",dq:-1,dr:0,family:"stone_circle",variantIndex:0,label:"Steinkreis I"},{id:"site-wt-1",dq:-1,dr:1,family:"watchtower_ruin",variantIndex:0,label:"Wachturmruine I"},{id:"site-mine-1",dq:0,dr:1,family:"forgotten_iron_mine",variantIndex:0,label:"Vergessene Eisenmine I"},{id:"site-house-1",dq:1,dr:-1,family:"abandoned_house",variantIndex:0,label:"Verlassenes Haus I"},{id:"site-barn-1",dq:0,dr:-1,family:"dilapidated_barn",variantIndex:1,label:"Verfallene Scheune II"},{id:"site-water-1",dq:-1,dr:2,family:"waterhole",variantIndex:0,label:"Wasserloch I"},{id:"site-oasis-1",dq:2,dr:-1,family:"oasis",variantIndex:0,label:"Oase I"},{id:"site-obelisk-1",dq:2,dr:0,family:"obelisk",variantIndex:0,label:"Alter Obelisk I"},{id:"site-iron-1",dq:1,dr:1,family:"iron_deposit",variantIndex:0,label:"Eisenvorkommen I"},{id:"site-wt-2",dq:-2,dr:1,family:"watchtower_ruin",variantIndex:2,label:"Wachturmruine III"},{id:"site-mine-2",dq:-2,dr:2,family:"forgotten_iron_mine",variantIndex:3,label:"Vergessene Eisenmine IV"},{id:"site-house-2",dq:2,dr:-2,family:"abandoned_house",variantIndex:2,label:"Verlassenes Haus III"},{id:"site-barn-2",dq:1,dr:-2,family:"dilapidated_barn",variantIndex:3,label:"Verfallene Scheune IV"},{id:"site-obelisk-2",dq:3,dr:-1,family:"obelisk",variantIndex:3,label:"Gebrochener Obelisk IV"},{id:"site-sc-2",dq:-2,dr:0,family:"stone_circle",variantIndex:2,label:"Runen-Steinkreis III"},{id:"site-oasis-2",dq:2,dr:1,family:"oasis",variantIndex:4,label:"Brunnen-Oase V"},{id:"site-iron-2",dq:0,dr:2,family:"iron_deposit",variantIndex:2,label:"Eisenvorkommen III"},{id:"site-water-2",dq:-1,dr:-1,family:"waterhole",variantIndex:3,label:"Seerosen-Wasserloch IV"}].map(N=>{let ee=z(N.dq,N.dr);return{id:N.id,q:ee.q,r:ee.r,family:N.family,faunaSpecies:N.faunaSpecies,variantIndex:N.variantIndex,label:N.label}});return{id:t,title:"5. M22 Fundorte (9\xD75 Varianten) & Animierte Fauna",subtitle:"Alle 9 M22-Fundorttypen (je 5 handgemalte Varianten + Schatten) \xB7 Civ-Style Hirsch- & Pferdeherden",seed:e,cameraCenter:P,cameraZoom:.74,defaultFogMode:"all-visible",visibleCenters:[{q:P.q,r:P.r,visR:8,expR:12}],scene:{sites:W}}}if(t==="strategic-empires"){let P=[{id:"player",name:"Krone Vedra",color:ze,q:0,r:0},{id:"crimson",name:"Blutmark",color:Fr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:ta,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:Io,q:8,r:10}],Q=[],z=new Set,K=[],W=[];for(let N of P){let ee=Ke(i,N.q,N.r);Ct(i,Q,z,ee,5,N.id,N.color),K.push({id:`emp-${N.id}`,q:ee.q,r:ee.r,kind:"capital",label:N.name,level:12,ownerId:N.id,factionColor:N.color}),W.push({id:`army-${N.id}`,q:ee.q+2,r:ee.r-1,kind:"army",label:`Heer ${N.name}`,strength:520,ownerId:N.id,factionColor:N.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:P.map(N=>({q:N.q,r:N.r,visR:9,expR:15})),scene:{territory:Q,buildings:K,units:W}}}let n=Ke(i,110,-70),s=Ke(i,n.q+4,n.r-1),u=Ke(i,n.q-3,n.r+3),c=[],a=new Set,l=Ct(i,c,a,n,2,"player",ze);Ct(i,c,a,s,2,"player",ze),Ct(i,c,a,u,2,"player",ze);let d=Ke(i,n.q+1,n.r),h=Ke(i,n.q-1,n.r,P=>P.forestDensity>.1),m=Ke(i,n.q,n.r+2),g=Ke(i,s.q+1,s.r),b=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:ze},{id:"town-2",q:s.q,r:s.r,kind:"settlement",centerStage:"city",label:"Ostfurt",level:6,ownerId:"player",factionColor:ze},{id:"town-3",q:u.q,r:u.r,kind:"settlement",centerStage:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:ze,constructionProgress:.62},{id:"farm-1",q:d.q,r:d.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:ze,yieldPercent:ir(i,d.q,d.r,"farm").yieldPercent},{id:"lumber-1",q:h.q,r:h.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:ze,yieldPercent:ir(i,h.q,h.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:m.q,r:m.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:ze,yieldPercent:ir(i,m.q,m.r,"quarry").yieldPercent},{id:"fort-1",q:g.q,r:g.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:ze,rangeRadius:2}],p=[...Ut(n,s,"stone"),...Ut(n,u,"packed"),...Ut(n,m,"trail")],_=Do(n.q-2,n.r-2,8,i),w=Tt({manualRivers:_}),M=l.filter(P=>Ze(P.q,P.r,n.q,n.r)===0),y=Tn(M,"stone",2,"player",{sampler:i,occupiedRiverEdges:w,roads:p}),E=Tn([u],"palisade",3,"player",{sampler:i,occupiedRiverEdges:w,roads:p}),k=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:Io,marchPath:[n,{q:n.q+2,r:n.r-1},s]},{id:"army-1",q:s.q,r:s.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:ze}],S=Ke(i,n.q+2,n.r+2),R=Ke(i,n.q-2,n.r-1),U=Ke(i,n.q+1,n.r+2),C=[{id:"site-mine",q:S.q,r:S.r,family:"forgotten_iron_mine",label:"Vergessene Eisenmine"},{id:"site-obelisk",q:R.q,r:R.r,family:"obelisk",label:"Alter Obelisk"},{id:"site-deer",q:U.q,r:U.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:s.q,r:s.r,visR:4,expR:8},{q:u.q,r:u.r,visR:4,expR:8}],scene:{territory:c,rivers:_,roads:p,walls:[...y,...E],buildings:b,units:k,sites:C}}}var Ho=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"sites-and-fauna",label:"M22 Fundorte & Animierte Fauna"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function Go(t,e,r,o,i){if(o==="all-visible"||i?.has(qe(e,r)))return 2;let n=0;for(let s of t.visibleCenters){let u=Ze(s.q,s.r,e,r);if(u<=s.visR)return 2;u<=s.expR&&n<1&&(n=1)}return n}var it={SMOKE:0,LEAF:1,BIRD:2,BIRD_SHADOW:3,SNOW:4,SAND:5,WIND:6,RAIN:7,SPLASH:8,FIREFLY:9},No=2400,Lr=12,oa=new Set(["capital","settlement","farm","lumber_camp","iron_mine","barracks","academy","trade_office","harbor","fortress","restored_dwelling"]),Ir=new Set(["snowfields","frozen_tundra","icy_ocean","tundra"]),Uo=new Set(["desert","sand_desert","dry_plains","steppe","badlands","savanna"]),ia=new Set(["forest","deciduous_forest","woodland","dense_forest","jungle","rainforest","boreal_forest","taiga","swamp"]),aa=new Set(["grassland","plains","meadow","hills","steppe","highland","farmland","savanna"]);function sa(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function Ye(t,e,r){return sa(t,e,r)/4294967295}function at(t){let e=t<0?0:t>1?1:t;return e*e*(3-2*e)}function la(t){return t.kind==="capital"||t.centerStage==="metropolis"||t.centerStage==="city"?{dx:12,dy:-46}:t.kind==="fortress"?{dx:-10,dy:-44}:t.kind==="settlement"?t.centerStage==="outpost"?{dx:6,dy:-28}:{dx:8,dy:-36}:t.kind==="farm"||t.kind==="restored_dwelling"?{dx:6,dy:-28}:{dx:5,dy:-32}}function ca(t){let{cam:e,detailOpacity:r,timeSec:o,animate:i,lookupHex:n,isWaterTerrain:s,buildings:u,sampleReliefHeight:c,seedInt:a=1337,rainIntensity:l=0,fireflyIntensity:d=0,nightFactor:h=0,ambientTint:m=[1,1,1]}=t,g=t.out??[];if(g.length=0,r<=.04||e.zoom<.22)return g;let[b,p,_]=m,w=x=>{g.length<No&&(x.kind!==it.FIREFLY&&x.kind!==it.RAIN&&x.kind!==it.SPLASH&&x.kind!==it.BIRD_SHADOW&&(x.r*=b,x.g*=p,x.b*=_),g.push(x))},M=at((e.zoom-.22)/.26)*Math.min(1,r),y=i?o:4.25,E=e.viewportWidth*.5/Math.max(.08,e.zoom)+220,k=e.viewportHeight*.5/Math.max(.08,e.zoom)+220,S=e.x-E,R=e.x+E,U=e.y-k,C=e.y+k;if(u&&u.length>0)for(let x=0;x<u.length;x++){let F=u[x],T=n(F.q,F.r);if(!T||T.fogState===0)continue;let D=F.kind;if(!oa.has(D))continue;let I=Ae(F.q,F.r),f=c?c(I.x,I.y/Ee)*Ee:0,v=la(F),L=I.x+v.dx,H=I.y-f+v.dy;if(L<S||L>R||H<U||H>C)continue;let O=T.fogState===1?.58:1,X=F.kind==="capital"||F.centerStage==="metropolis"||F.centerStage==="city"?6:4,$=5.4;for(let j=0;j<X;j++){let J=Ye(F.q*17+j,F.r*31+x,a^257),V=((y/$+j/X+J)%1+1)%1,se=V*64,ue=Math.sin(V*6.8+J*12)*(3.5+V*8.5),te=-V*24+ue,be=10+V*28,he=at(V/.16)*(1-at((V-.44)/.56))*.46*O*M;he<.01||w({x:L+te,y:H-se,width:be*1.18,height:be*.94,r:.9,g:.89,b:.86,alpha:he,kind:it.SMOKE,rotRad:(J-.5)*1.4+V*.65,animPhase:V,seed:J})}}let P=At(e,1),Q=P.maxQ-P.minQ+1,z=P.maxR-P.minR+1;if(Q*z<=900){let x=at((e.zoom-.32)/.28);for(let F=P.minR;F<=P.maxR;F++)for(let T=P.minQ;T<=P.maxQ;T++){let D=n(T,F);if(!D||D.fogState===0)continue;let I=Ae(T,F);if(I.x<S||I.x>R||I.y<U||I.y>C)continue;let f=c?c(I.x,I.y/Ee)*Ee:0,v=I.y-f,L=D.fogState===1?.55:1,H=D.terrainId,O=!s(H)&&(ia.has(H)||D.forestClass==="dense_forest"||D.forestClass==="light_forest"||D.forestDensity>=.35);if(O&&x>.02){let X=H==="jungle"||H==="rainforest",$=H==="taiga"||H==="boreal_forest",j=X?3:2;for(let J=0;J<j;J++){let V=Ye(T*23+J,F*41,a^514),se=Ye(T*37+J,F*19,a^521),ue=5.6+V*3.4,te=((y/ue+se)%1+1)%1,be=(V-.5)*124,ve=(se-.5)*84-52,he=Math.sin(te*11.5+V*18)*13-te*14,me=te*58,Me=at(te/.16)*(1-at((te-.68)/.32))*.78*L*x*M;if(Me<.015)continue;let ye=.44,Te=.58,Se=.24;X?(ye=.32,Te=.57,Se=.22):$?(ye=.46,Te=.44,Se=.25):V>.68&&(ye=.74,Te=.58,Se=.24);let Ge=6+se*3;w({x:I.x+be+he,y:v+ve+me,width:Ge*1.35,height:Ge,r:ye,g:Te,b:Se,alpha:Me,kind:it.LEAF,rotRad:Math.sin(te*9+se*10)*.95+(V-.5)*.8,animPhase:te*14+V*6.283,seed:V})}}if(Ir.has(H)){let X=H==="snowfields"?4:3,$=l>.25?X+3:X;for(let j=0;j<$;j++){let J=Ye(T*29+j,F*53,a^771),V=Ye(T*61+j,F*17,a^777),se=(l>.25?3.4:5.2)+J*2.8,ue=((y/se+V)%1+1)%1,te=(J-.5)*150-ue*(l>.25?64:42)+Math.sin(ue*6.5+V*14)*9,be=(V-.5)*100-44+ue*78,he=at(ue/.18)*(1-at((ue-.72)/.28))*(.68+l*.16)*L*M;if(he<.015)continue;let me=4.4+J*3.6;w({x:I.x+te,y:v+be,width:me,height:me,r:.95,g:.97,b:1,alpha:he,kind:it.SNOW,rotRad:0,animPhase:ue,seed:J})}}if(Uo.has(H)&&l<.35){let X=Ye(T*43,F*67,a^1028);if(X<.62){let $=Ye(T*19,F*83,a^1033),j=4.8+$*2.8,J=((y/j+X)%1+1)%1,V=(J-.5)*126,se=(J-.5)*28,te=at(J/.24)*(1-at((J-.66)/.34))*.32*L*M;if(te>=.01){let be=H==="desert"||H==="sand_desert"||H==="sandy_desert";w({x:I.x+($-.5)*56-V,y:v+(X-.5)*58+se,width:68+$*48,height:15+$*9,r:be?.9:.8,g:be?.8:.72,b:be?.58:.52,alpha:te,kind:it.SAND,rotRad:-.22,animPhase:J*8+$*6.28,seed:$})}}}if(aa.has(H)){let X=Ye(T*71,F*97,a^1285);if(X<.22){let $=Ye(T*13,F*47,a^1289),j=6.2+$*3.5,J=((y/j+X*5)%1+1)%1,se=at(J/.22)*(1-at((J-.62)/.38))*.15*L*M;se>=.008&&w({x:I.x+($-.5)*44-(J-.5)*145,y:v-12+(X-.11)*90+(J-.5)*26,width:82+$*46,height:22+$*10,r:.94,g:.96,b:.95,alpha:se,kind:it.WIND,rotRad:-.18,animPhase:J,seed:$})}}if(l>.05&&!Ir.has(H)){let X=s(H),$=X?4:3;for(let J=0;J<$;J++){let V=Ye(T*47+J*7,F*89,a^1799),se=Ye(T*83+J*11,F*23,a^1811),ue=.72+V*.36,te=((y/ue+se)%1+1)%1,be=I.x+(V-.5)*176-te*46,ve=v+(se-.5)*118-76+te*168,me=at(te/.14)*(1-at((te-.76)/.24))*.44*l*L*M;if(me>=.015){let xe=.86-h*.18;w({x:be,y:ve,width:2.3+V*1.4,height:36+se*24,r:xe*.88,g:xe*.95,b:Math.min(1,xe*1.06),alpha:me,kind:it.RAIN,rotRad:.25,animPhase:te,seed:V})}}let j=Ye(T*31,F*67,a^1833);if(X||j<.48){let J=X?2:1;for(let V=0;V<J;V++){let se=Ye(T*53+V,F*37,a^1843),ue=Ye(T*17+V,F*71,a^1855),te=.88+se*.44,be=((y/te+ue)%1+1)%1,ve=(1-be)*(X?.5:.28)*l*L*M;if(ve>=.015){let he=9+be*(X?26:16);w({x:I.x+(se-.5)*145,y:v+(ue-.5)*92,width:he,height:he*.54,r:.82,g:.92,b:.98,alpha:ve,kind:it.SPLASH,rotRad:0,animPhase:be,seed:se})}}}}if(d>.08&&!s(H)&&!Ir.has(H)&&!Uo.has(H)&&x>.04){let X=O||H==="swamp"||H==="marshland"||H==="moor"?.72:.24;if(Ye(T*61,F*43,a^2056)<X){let j=O?2:1;for(let J=0;J<j;J++){let V=Ye(T*19+J*5,F*79,a^2065),se=Ye(T*89+J*3,F*29,a^2077),ue=.22+.78*Math.pow(.5+.5*Math.sin(y*(1.8+V*1.4)+se*18),2),te=ue*.88*d*L*x*M;if(te<.03)continue;let be=Math.sin(y*.65+V*14)*28,ve=Math.cos(y*.82+se*12)*16-18,he=10.5+V*5.5;w({x:I.x+(V-.5)*140+be,y:v+(se-.5)*96+ve,width:he,height:he,r:1,g:.88,b:.36,alpha:te,kind:it.FIREFLY,rotRad:0,animPhase:ue,seed:V})}}}}}let K=680,W=Math.floor(S/K)-1,N=Math.floor(R/K)+1,ee=Math.floor(U/K)-1,Z=Math.floor(C/K)+1;if(h<.72&&l<.65&&(N-W+1)*(Z-ee+1)<=81)for(let x=ee;x<=Z;x++)for(let F=W;F<=N;F++){let T=Ye(F*59,x*83,a^1542);if(T>.56)continue;let D=Ye(F*31,x*47,a^1553),I=Ye(F*73,x*29,a^1561),f=190+D*170,v=110+I*115,L=(.055+D*.035)*(I>.5?1:-1),H=y*L+T*Math.PI*2,O=(F+.5)*K+Math.cos(H)*f,X=(x+.5)*K+Math.sin(H)*v;if(O<S||O>R||X<U||X>C)continue;let $=je(O,X),j=n($.q,$.r);if(!j||j.fogState===0)continue;let J=s(j.terrainId)||j.terrainId==="coastal_water"||j.terrainId==="beach";if(!J)for(let Me=0;Me<6;Me++){let[ye,Te]=Re[Me],Se=n($.q+ye,$.r+Te);if(Se&&s(Se.terrainId)){J=!0;break}}if(Ir.has(j.terrainId)&&T>.2)continue;let se=-Math.sin(H)*f*L,ue=Math.cos(H)*v*L,te=Math.atan2(ue,se),be=te+Math.PI*.5,ve=j.fogState===1?.55:1,he=J?3:3+(D>.55?1:0),me=-42,xe=32;for(let Me=0;Me<he;Me++){let ye=Me%2===0?1:-1,Te=Math.ceil(Me/2),Se=-Te*22,Ge=ye*Te*19+Math.sin(y*.9+Me*2.1+D*6)*4.5,Ie=Math.cos(te),Oe=Math.sin(te),Ue=O+Ie*Se-Oe*Ge,De=X+Oe*Se+Ie*Ge,ne=(y*.42+Me*.27+I)%1>.52?-.18+Math.sin(y*1.4+Me)*.06:Math.sin(y*6.8+Me*1.7+D*5)*.62,B=(J?20:16)*(.9+.2*(Me===0?1:I)),A=.84*ve*M;w({x:Ue+me,y:De+xe,width:B*.95,height:B*.55,r:.05,g:.07,b:.11,alpha:.22*ve*M,kind:it.BIRD_SHADOW,rotRad:be,animPhase:ne,seed:D}),w({x:Ue,y:De,width:B,height:B*.72,r:J?.96:.22,g:J?.97:.23,b:J?.98:.25,alpha:A,kind:it.BIRD,rotRad:be,animPhase:ne,seed:I})}}return g}var ua=`#version 300 es
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
`,da=`#version 300 es
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
  } else if (kind == 6) {
    // Delicate translucent wind-gust ribbon
    float curveY = sin(uv.x * 3.4 + seed * 6.2831) * 0.34;
    float headTail = smoothstep(-1.0, -0.15, uv.x) * smoothstep(1.0, 0.10, uv.x);
    float bandW = 0.09 + 0.11 * headTail;
    mask = smoothstep(bandW, 0.015, abs(uv.y - curveY)) * headTail;
  } else if (kind == 7) {
    // Crisp slanted falling raindrop streak with bright drop head and fine tail
    float along = smoothstep(-1.0, 0.45, uv.y) * smoothstep(1.0, 0.48, uv.y);
    float coreX = smoothstep(0.62, 0.08, abs(uv.x));
    mask = along * coreX;
  } else if (kind == 8) {
    // Expanding concentric raindrop impact ripple ring
    float r = length(uv);
    float ringR = 0.22 + anim * 0.68;
    float ring = smoothstep(0.18, 0.03, abs(r - ringR));
    mask = ring * smoothstep(1.0, 0.72, r);
  } else {
    // Glowing nocturnal firefly: radiant pinpoint core + soft golden halo
    float d = length(uv);
    float core = exp(-d * d * 11.0);
    float halo = exp(-d * d * 2.4) * 0.52;
    mask = clamp(core + halo, 0.0, 1.0);
    col = mix(col, vec3(1.0, 0.98, 0.80), clamp(core * 0.85, 0.0, 1.0));
  }

  float outA = a * mask;
  if (outA < 0.004) discard;
  fragColor = vec4(col * outA, outA);
}
`;function Oo(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate ambient VFX shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Ambient VFX shader compile error:
${i}`)}return o}var Dr=class{constructor(e){this.instanceData=new Float32Array(No*Lr);this.scratchParticles=[];this.gl=e;let r=Oo(e,e.VERTEX_SHADER,ua),o=Oo(e,e.FRAGMENT_SHADER,da),i=e.createProgram();if(!i)throw new Error("Failed to allocate ambient VFX program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let l=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteProgram(i),new Error(`Ambient VFX program link error:
${l}`)}this.prog=i;let n=l=>{let d=e.getUniformLocation(i,l);if(!d)throw new Error(`Missing ambient VFX uniform: ${l}`);return d};this.uCam=n("u_camCenter"),this.uView=n("u_viewportSize"),this.uZoom=n("u_zoom");let s=e.createVertexArray(),u=e.createBuffer(),c=e.createBuffer();if(!s||!u||!c)throw new Error("Failed to allocate ambient VFX buffers");this.vao=s,this.quadVbo=u,this.instanceVbo=c,e.bindVertexArray(s),e.bindBuffer(e.ARRAY_BUFFER,u),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let a=Lr*4;for(let l=1;l<=3;l++)e.enableVertexAttribArray(l),e.vertexAttribPointer(l,4,e.FLOAT,!1,a,(l-1)*16),e.vertexAttribDivisor(l,1);e.bindVertexArray(null)}render(e){let r=ca({...e,out:this.scratchParticles}),o=r.length;if(o===0)return{drawCalls:0,particleCount:0};let{gl:i,instanceData:n}=this;for(let s=0;s<o;s++){let u=r[s],c=s*Lr;n[c]=u.x,n[c+1]=u.y,n[c+2]=u.width,n[c+3]=u.height,n[c+4]=u.r,n[c+5]=u.g,n[c+6]=u.b,n[c+7]=u.alpha,n[c+8]=u.kind,n[c+9]=u.rotRad,n[c+10]=u.animPhase,n[c+11]=u.seed}return i.useProgram(this.prog),i.bindVertexArray(this.vao),i.enable(i.BLEND),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),i.uniform2f(this.uCam,e.cam.x,e.cam.y),i.uniform2f(this.uView,e.cam.viewportWidth,e.cam.viewportHeight),i.uniform1f(this.uZoom,e.cam.zoom),i.bindBuffer(i.ARRAY_BUFFER,this.instanceVbo),i.bufferSubData(i.ARRAY_BUFFER,0,n.subarray(0,o*Lr)),i.drawArraysInstanced(i.TRIANGLES,0,6,o),i.bindVertexArray(null),{drawCalls:1,particleCount:o}}dispose(){let{gl:e}=this;e.deleteBuffer(this.instanceVbo),e.deleteBuffer(this.quadVbo),e.deleteVertexArray(this.vao),e.deleteProgram(this.prog)}};var ar=512,zo={deer:{spriteKey:"actors/fauna/deer",herdSize:4,baseWidth:66,pastureRx:68,pastureRy:48,strideHz:2.35,hopAmp:.34,cycleMinSec:9.5,cycleMaxSec:14},horse:{spriteKey:"actors/fauna/horse",herdSize:4,baseWidth:74,pastureRx:74,pastureRy:52,strideHz:2.65,hopAmp:.44,cycleMinSec:8.5,cycleMaxSec:13},sheep:{spriteKey:"actors/fauna/sheep",herdSize:5,baseWidth:52,pastureRx:62,pastureRy:44,strideHz:2.45,hopAmp:.24,cycleMinSec:10.5,cycleMaxSec:15}};function fa(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function Nt(t,e,r){return fa(t,e,r)/4294967295}function ha(t){let e=t<0?0:t>1?1:t;return e*e*(3-2*e)}function ma(t,e){if(t.family!=="fauna")return null;let r=e.infrastructure.sprites,o=t.faunaSpecies;if(o){let n=zo[o];if(n&&r[n.spriteKey])return o}let i=(t.label||"").toLowerCase();return(i.includes("pferd")||i.includes("horse")||i.includes("gest\xFCt"))&&r["actors/fauna/horse"]?"horse":(i.includes("schaf")||i.includes("sheep")||i.includes("herde"))&&r["actors/fauna/sheep"]?"sheep":r["actors/fauna/deer"]?"deer":r["actors/fauna/horse"]?"horse":null}function En(t,e,r,o,i,n,s){let u=(o%6+6)%6,c=r/Math.max(1,i)*Math.PI*2,a=(Nt(t*19+r,e*31+u,911)-.5)*1.45,l=c+u*.92+a,d=.28+.68*Nt(t*7+u,e*13+r,3571);return{ox:Math.cos(l)*n*d,oy:Math.sin(l)*s*d}}function pa(t){let{q:e,r,memberIdx:o,herdSize:i,profile:n,frameCount:s,timeSec:u,animate:c}=t,a=e*73+o*17,l=r*89+o*29,d=n.cycleMinSec+(n.cycleMaxSec-n.cycleMinSec)*Nt(a,l,101),h=Nt(a,l,202)*d*6,m=c?u+h:h,g=Math.floor(m/d),b=(m-g*d)/d,p=En(e,r,o,g,i,n.pastureRx,n.pastureRy),_=En(e,r,o,g+1,i,n.pastureRx,n.pastureRy),w=En(e,r,o,g-1,i,n.pastureRx,n.pastureRy),M=o===0?1.07:.86+.18*Nt(a,l,303),y=Nt(a,l,404),E=p.ox,k=p.oy,S=0,R=0,U="idle",C=p.ox<w.ox;if(b<.44)U="graze",R=s>=2?1:0,S=0;else if(b<.56)U="idle",R=0,C=_.ox<p.ox;else if(b<.88){U="walk";let P=(b-.56)/.32,Q=ha(P);E=p.ox+(_.ox-p.ox)*Q,k=p.oy+(_.oy-p.oy)*Q,C=_.ox<p.ox;let z=s>=4?s-2:0,K=m*n.strideHz;if(z>=2){let ee=z>2?z*.5:1;R=2+Math.floor(K*ee)%z}else s>=2&&(R=Math.floor(K)%s);let W=Math.sin(P*Math.PI),N=.5-.5*Math.cos(K*Math.PI*2);S=c?N*n.hopAmp*W:0}else U="idle",E=_.ox,k=_.oy,C=_.ox<p.ox,R=0;return{ox:E,oy:k,hopLift:S,frameIndex:R,flipX:C,scaleFactor:M,tintHash:y,behavior:U}}function Xo(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:i,timeSec:n,animate:s}=t,u=[],c=new Set;if(!r||r.length===0)return{actors:u,coveredSiteIds:c};let a=e.infrastructure.sprites;for(let l=0;l<r.length;l++){let d=r[l];if(d.family!=="fauna")continue;let h=o(d.q,d.r);if(h===0)continue;let m=ma(d,e);if(!m)continue;let g=zo[m];if(!g)continue;let b=a[g.spriteKey];if(!b)continue;c.add(d.id);let p=Math.max(1,b.frameCount??4),_=b.frameSize?b.frameSize[0]:Math.max(1,b.sourceSize[0]/p),M=(b.frameSize?b.frameSize[1]:b.sourceSize[1])/Math.max(1,_),y=Ae(d.q,d.r);for(let E=0;E<g.herdSize&&!(u.length>=ar);E++){let k=pa({q:d.q,r:d.r,memberIdx:E,herdSize:g.herdSize,profile:g,frameCount:p,timeSec:n,animate:s}),S=y.x+k.ox,R=y.y+k.oy,U=i?i(S,R/Ee)*Ee:0,C=g.baseWidth*k.scaleFactor,P=C*M;u.push({x:S,groundY:R,y:R-U-k.hopLift,hopLift:Math.max(0,k.hopLift),width:C,height:P,frameIndex:k.frameIndex,frameCount:p,flipX:k.flipX,tintHash:k.tintHash,behavior:k.behavior,fogState:h,page:b.page,u0:b.uv[0],v0:b.uv[1],u1:b.uv[2],v1:b.uv[3]})}}return u.sort((l,d)=>l.groundY-d.groundY||l.x-d.x),{actors:u,coveredSiteIds:c}}var ga=`#version 300 es
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
`,ba=`#version 300 es
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
`,va=`#version 300 es
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
`,ya=`#version 300 es
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
`;function Vo(t,e,r){let o=(u,c)=>{let a=t.createShader(u);if(!a)throw new Error("Failed to create AnimatedActorPass shader.");if(t.shaderSource(a,c),t.compileShader(a),!t.getShaderParameter(a,t.COMPILE_STATUS)){let l=t.getShaderInfoLog(a)??"unknown";throw t.deleteShader(a),new Error(`AnimatedActorPass shader compile failed: ${l}`)}return a},i=o(t.VERTEX_SHADER,e),n=o(t.FRAGMENT_SHADER,r),s=t.createProgram();if(!s)throw new Error("Failed to link AnimatedActorPass program.");if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS)){let u=t.getProgramInfoLog(s)??"unknown";throw t.deleteProgram(s),new Error(`AnimatedActorPass link failed: ${u}`)}return s}var Br=class{constructor(e){this.shadowData=new Float32Array(ar*5);this.actorData=new Float32Array(ar*10);this.gl=e;let r=new Float32Array([0,0,1,0,0,1,1,0,1,1,0,1]),o=e.createBuffer();if(!o)throw new Error("AnimatedActorPass quad VBO alloc failed.");this.quadVbo=o,e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),this.shadowProgram=Vo(e,ga,ba),this.shLocCam=e.getUniformLocation(this.shadowProgram,"uCamCenter"),this.shLocViewport=e.getUniformLocation(this.shadowProgram,"uViewportLogical"),this.shLocZoom=e.getUniformLocation(this.shadowProgram,"uZoom");let i=e.createVertexArray(),n=e.createBuffer();if(!i||!n)throw new Error("AnimatedActorPass shadow VAO alloc failed.");this.shadowVao=i,this.shadowVbo=n,e.bindVertexArray(i),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,this.shadowData.byteLength,e.DYNAMIC_DRAW);let s=20;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,s,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,1,e.FLOAT,!1,s,16),e.vertexAttribDivisor(2,1),this.actorProgram=Vo(e,va,ya),this.acLocCam=e.getUniformLocation(this.actorProgram,"uCamCenter"),this.acLocViewport=e.getUniformLocation(this.actorProgram,"uViewportLogical"),this.acLocZoom=e.getUniformLocation(this.actorProgram,"uZoom"),this.acLocAtlas=e.getUniformLocation(this.actorProgram,"uAtlas"),this.acLocDetail=e.getUniformLocation(this.actorProgram,"uDetailOpacity"),this.acLocPolish=e.getUniformLocation(this.actorProgram,"uNaturePolish");let u=e.createVertexArray(),c=e.createBuffer();if(!u||!c)throw new Error("AnimatedActorPass actor VAO alloc failed.");this.actorVao=u,this.actorVbo=c,e.bindVertexArray(u),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,this.actorData.byteLength,e.DYNAMIC_DRAW);let a=40;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,a,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,a,16),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,2,e.FLOAT,!1,a,32),e.vertexAttribDivisor(3,1),e.bindVertexArray(null)}render(e){let{cam:r,assets:o,actors:i,detailOpacity:n,shadowOpacity:s,naturePolish:u}=e;if(i.length===0||n<=.03)return{drawCalls:0,renderedActors:0};let c=this.gl,a=0;if(c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.SRC_ALPHA,c.ONE_MINUS_SRC_ALPHA),s>.02){let m=0,g=this.shadowData;for(let b=0;b<i.length&&m<ar;b++){let p=i[b],_=Math.max(.68,1-p.hopLift*.04),w=p.width*.36*_,M=p.width*.14*_,y=m*5;g[y]=p.x-p.width*.12,g[y+1]=p.y+p.hopLift+2,g[y+2]=w,g[y+3]=M,g[y+4]=s*.74*_*n*(p.fogState===1?.55:1),m++}m>0&&(c.useProgram(this.shadowProgram),c.uniform2f(this.shLocCam,r.x,r.y),c.uniform2f(this.shLocViewport,r.viewportWidth,r.viewportHeight),c.uniform1f(this.shLocZoom,r.zoom),c.bindVertexArray(this.shadowVao),c.bindBuffer(c.ARRAY_BUFFER,this.shadowVbo),c.bufferSubData(c.ARRAY_BUFFER,0,g.subarray(0,m*5)),c.drawArraysInstanced(c.TRIANGLES,0,6,m),a++)}c.useProgram(this.actorProgram),c.uniform2f(this.acLocCam,r.x,r.y),c.uniform2f(this.acLocViewport,r.viewportWidth,r.viewportHeight),c.uniform1f(this.acLocZoom,r.zoom),c.uniform1i(this.acLocAtlas,0),c.uniform1f(this.acLocDetail,n),c.uniform1f(this.acLocPolish,u),c.bindVertexArray(this.actorVao);let l=this.actorData,d=0,h=0;for(;h<i.length;){let m=i[h].page,g=o.infraPages[m],b=0;for(;h<i.length&&i[h].page===m&&b<ar;){let p=i[h++];if(!g)continue;let _=p.x-p.width*.5,w=p.y-p.height*.92,M=(p.u1-p.u0)/p.frameCount,y=M*.004,E=p.u0+M*p.frameIndex+y,k=p.u0+M*(p.frameIndex+1)-y,S=b*10;l[S]=_,l[S+1]=w,l[S+2]=p.width,l[S+3]=p.height,l[S+4]=p.flipX?k:E,l[S+5]=p.v0,l[S+6]=p.flipX?E:k,l[S+7]=p.v1,l[S+8]=p.fogState,l[S+9]=p.tintHash,b++}b>0&&g&&(c.activeTexture(c.TEXTURE0),c.bindTexture(c.TEXTURE_2D,g),c.bindBuffer(c.ARRAY_BUFFER,this.actorVbo),c.bufferSubData(c.ARRAY_BUFFER,0,l.subarray(0,b*10)),c.drawArraysInstanced(c.TRIANGLES,0,6,b),a++,d+=b)}return c.bindVertexArray(null),{drawCalls:a,renderedActors:d}}dispose(){this.gl.deleteBuffer(this.quadVbo),this.gl.deleteBuffer(this.shadowVbo),this.gl.deleteVertexArray(this.shadowVao),this.gl.deleteProgram(this.shadowProgram),this.gl.deleteBuffer(this.actorVbo),this.gl.deleteVertexArray(this.actorVao),this.gl.deleteProgram(this.actorProgram)}};function xa(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function qr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function Pn(t,e,r,o,i){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&i>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,i)),n}async function An(t,e,r="auto",o){let i=e.replace(/\/+$/,""),n=await fetch(`${i}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${i}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let s=await n.json();if(s.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${s.schema}`);let u=xa(t,r),c=u==="mobile"?Math.min(256,s.terrain.textureSize):s.terrain.textureSize,a=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),l=a?t.getParameter(a.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,d=s.terrain.layers.length+s.nature.pages.length+s.shadows.pages.length+s.infrastructure.pages.length+(s.clouds.files.length>0?1:0),h=0,m=W=>{h+=1,o?.(h,d,W)},g=t.createTexture();if(!g)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,g);let b=Math.max(1,s.terrain.layers.length),p=Math.floor(Math.log2(c))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,p,t.RGBA8,c,c,b),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let _=c!==s.terrain.textureSize?{width:c,height:c}:void 0,w=s.terrain.layers;for(let W=0;W<w.length;W+=8){let N=w.slice(W,W+8),ee=await Promise.all(N.map(Z=>qr(`${i}/${Z.file}`,_)));t.bindTexture(t.TEXTURE_2D_ARRAY,g);for(let Z=0;Z<N.length;Z++){let x=ee[Z];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,N[Z].layer,c,c,1,t.RGBA,t.UNSIGNED_BYTE,x),x.close(),m(`Terrain ${N[Z].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,g),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),a&&l>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,a.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,l));let M=u==="mobile"?.5:1,y=async(W,N)=>(await Promise.all(W.map(Z=>qr(`${i}/${Z.file}`,M<1?{width:Math.max(256,Math.round(Z.width*M)),height:Math.max(256,Math.round(Z.height*M))}:void 0)))).map((Z,x)=>{let F=Pn(t,Z,t.CLAMP_TO_EDGE,a,l);return Z.close(),m(`${N} ${x+1}/${W.length}`),F}),[E,k,S]=await Promise.all([y(s.nature.pages,"Natur-Atlas"),y(s.shadows.pages,"Schatten-Atlas"),y(s.infrastructure.pages,"Infra-Atlas")]),R=null,U=null;if(s.clouds.files.length>0){let W=s.clouds.files.find(x=>x.id.startsWith("cloud_base"))??s.clouds.files[0],N=s.clouds.files.find(x=>x.id.startsWith("cloud_edge")),[ee,Z]=await Promise.all([qr(`${i}/${W.file}`),N?qr(`${i}/${N.file}`):Promise.resolve(null)]);R=Pn(t,ee,t.REPEAT,a,l),ee.close(),Z&&(U=Pn(t,Z,t.REPEAT,a,l),Z.close()),m("Nebel-Wolken")}let P=s.terrain.byType.forest_floor?.layers?.[0]??0,z=(s.terrain.byType.coastal_water??s.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:s,vramTier:u,terrainArray:g,terrainLayerSize:c,forestFloorLayer:P,coastalWaterLayer:z,naturePages:E,shadowPages:k,infraPages:S,cloudTexture:R,cloudEdgeTexture:U,dispose:()=>{t.deleteTexture(g);for(let W of E)t.deleteTexture(W);for(let W of k)t.deleteTexture(W);for(let W of S)t.deleteTexture(W);R&&t.deleteTexture(R),U&&t.deleteTexture(U)}}}var wa=`#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  v_uv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`,Sa=`#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_sceneTex;
uniform vec2 u_camCenter;
uniform vec2 u_viewportSize;
uniform float u_zoom;
uniform float u_time;
uniform float u_animate;
uniform float u_strategicBlend;

uniform vec3 u_shadowTint;
uniform vec3 u_highlightTint;
uniform vec3 u_ambientLift;
uniform vec4 u_gradeParams;     // x=brightness, y=contrast, z=saturation, w=nightFactor
uniform vec4 u_sunGlow;         // rgb=color, a=strength
uniform vec4 u_mistParams;      // rgb=color, a=density
uniform vec4 u_vignette;        // rgb=color, a=strength

uniform int u_lightCount;
uniform vec4 u_lights[${_t}];    // xy=worldPos, z=radius, w=intensity
uniform vec2 u_lightMeta[${_t}]; // x=flickerSeed, y=style

float mistWave(vec2 p) {
  return 0.56 * sin(p.x * 0.0029 + cos(p.y * 0.0021) * 1.4) * sin(p.y * 0.0024 - p.x * 0.0012)
       + 0.30 * sin(p.x * 0.0067 - p.y * 0.0044) * cos(p.y * 0.0058 + p.x * 0.0028)
       + 0.14 * sin(p.x * 0.0135 + p.y * 0.0096);
}

void main() {
  vec3 origCol = texture(u_sceneTex, v_uv).rgb;

  vec2 ndc = v_uv * 2.0 - 1.0;
  vec2 screenOffset = vec2(ndc.x, -ndc.y) * (u_viewportSize * 0.5);
  vec2 worldPos = u_camCenter + screenOffset / max(0.05, u_zoom);

  float brightness = u_gradeParams.x;
  float contrast = u_gradeParams.y;
  float saturation = u_gradeParams.z;
  float nightFactor = u_gradeParams.w;

  // 1. Luminance-aware split-tone grading + Purkinje nocturnal color shift
  float luma = dot(origCol, vec3(0.299, 0.587, 0.114));
  float effSat = mix(
    saturation,
    mix(saturation * 0.68, saturation * 1.14, smoothstep(0.26, 0.86, luma)),
    nightFactor
  );
  vec3 desat = mix(vec3(luma), origCol, effSat);
  vec3 toneTint = mix(u_shadowTint, u_highlightTint, smoothstep(0.08, 0.84, luma));
  vec3 graded = desat * toneTint * brightness + u_ambientLift;
  float mid = 0.5 * brightness;
  graded = (graded - mid) * contrast + mid;
  graded = clamp(graded, 0.0, 1.0);

  // 2. Candlelit War-Room Parchment Atlas adaptation when zoomed out at Dusk / Night
  if (u_strategicBlend > 0.02 && nightFactor > 0.15) {
    float candlePool = exp(-dot(ndc * vec2(0.82, 0.96), ndc * vec2(0.82, 0.96)) * 1.25);
    vec3 candleParchment = origCol * vec3(0.82, 0.68, 0.46) + vec3(0.04, 0.024, 0.008);
    float warRoomMix = candlePool * u_strategicBlend * nightFactor * 0.56;
    graded = mix(graded, clamp(candleParchment, 0.0, 1.0), warRoomMix);
  }

  // 3. Directional screen-right Sunrise / Sunset / Moonlit atmospheric glow (canonical right sun!)
  if (u_sunGlow.a > 0.004) {
    float rightBias = smoothstep(-0.40, 1.05, ndc.x * 0.78 + ndc.y * 0.34);
    float lumaWeight = 0.38 + 0.62 * smoothstep(0.14, 0.86, luma);
    float glowAmt = rightBias * u_sunGlow.a * lumaWeight * (1.0 - u_strategicBlend * 0.35);
    // Warm sunlit screen-blend lift that never washes out crisp ink silhouettes
    graded = clamp(graded + u_sunGlow.rgb * glowAmt * (1.0 - graded * 0.48), 0.0, 1.0);
  }

  // 4. Rolling 2-octave world-space valley mist ribbons
  if (u_mistParams.a > 0.004) {
    float tDrift = u_animate > 0.5 ? u_time : 4.25;
    vec2 mPosA = worldPos + vec2(tDrift * 14.0, -tDrift * 5.5);
    vec2 mPosB = worldPos * 1.65 + vec2(-tDrift * 9.0 + 420.0, tDrift * 4.0 - 290.0);
    float wA = mistWave(mPosA) * 0.5 + 0.5;
    float wB = mistWave(mPosB) * 0.5 + 0.5;
    float mistRibbon = smoothstep(0.24, 0.88, wA * 0.68 + wB * 0.32);
    float mistAlpha = u_mistParams.a * (0.28 + 0.72 * mistRibbon) * (1.0 - u_strategicBlend * 0.58);
    graded = mix(graded, u_mistParams.rgb, clamp(mistAlpha, 0.0, 0.62));
  }

  // 5. Physically-plausible dynamic torch, hearth & window lantern pools (Dusk & Night!)
  if (u_lightCount > 0) {
    float tFlick = u_animate > 0.5 ? u_time : 3.7;
    float totalReveal = 0.0;
    float totalCore = 0.0;
    float totalBrazier = 0.0;
    for (int i = 0; i < ${_t}; i++) {
      if (i >= u_lightCount) break;
      vec4 lp = u_lights[i];
      vec2 meta = u_lightMeta[i];
      vec2 dv = worldPos - lp.xy;
      // Subtle 2.5D ground-plane ellipse matching Vedras PROJ_Y foreshortening
      dv.y /= 0.86;
      float d = length(dv);
      if (d < lp.z) {
        float u = 1.0 - d / max(1.0, lp.z);
        float atten = u * u * (0.65 + 0.35 * u);
        float core = exp(-pow(d / max(6.0, lp.z * 0.22), 2.0));
        float flick = 0.93 + 0.07 * sin(tFlick * 5.4 + meta.x) * cos(tFlick * 3.1 + meta.x * 1.7);
        float strength = lp.w * flick;
        totalReveal += atten * strength;
        totalCore += core * strength;
        if (meta.y > 0.5 && meta.y < 1.5) {
          totalBrazier += core * strength;
        }
      }
    }

    if (totalReveal > 0.002) {
      // Reveal true warm daylight surface colors under golden firelight instead of flat orange wash!
      vec3 torchLitOrig = origCol * vec3(1.26, 0.95, 0.58);
      float revealMix = clamp(totalReveal * 0.84, 0.0, 0.92);
      graded = mix(graded, clamp(torchLitOrig, 0.0, 1.0), revealMix);
      // Warm amber hearth glow + slightly livelier ember core on fortress/gate braziers
      vec3 glowCol = mix(vec3(1.0, 0.72, 0.30), vec3(1.0, 0.58, 0.20), clamp(totalBrazier, 0.0, 1.0));
      graded = clamp(graded + glowCol * clamp(totalCore * 0.34, 0.0, 0.48), 0.0, 1.0);
    }
  }

  // 6. Atmospheric edge vignette framing Dusk, Night & Rain
  if (u_vignette.a > 0.004) {
    float vig = smoothstep(0.46, 1.42, length(ndc * vec2(0.95, 0.92)));
    graded = mix(graded, u_vignette.rgb, clamp(vig * u_vignette.a, 0.0, 0.72));
  }

  fragColor = vec4(graded, 1.0);
}
`;function Yo(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate atmosphere shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Atmosphere shader compile error:
${i}`)}return o}var Hr=class{constructor(e){this.sceneFbo=null;this.sceneTex=null;this.fboW=0;this.fboH=0;this.lightsBuf=new Float32Array(_t*4);this.metaBuf=new Float32Array(_t*2);this.gl=e;let r=Yo(e,e.VERTEX_SHADER,wa),o=Yo(e,e.FRAGMENT_SHADER,Sa),i=e.createProgram();if(!i)throw new Error("Failed to allocate atmosphere program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let u=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteProgram(i),new Error(`Atmosphere program link error:
${u}`)}this.prog=i;let n=e.createVertexArray();if(!n)throw new Error("Failed to allocate atmosphere VAO");this.vao=n;let s=u=>{let c=e.getUniformLocation(i,u);if(!c)throw new Error(`Missing atmosphere uniform: ${u}`);return c};this.uSceneTex=s("u_sceneTex"),this.uCamCenter=s("u_camCenter"),this.uViewportSize=s("u_viewportSize"),this.uZoom=s("u_zoom"),this.uTime=s("u_time"),this.uAnimate=s("u_animate"),this.uStrategicBlend=s("u_strategicBlend"),this.uShadowTint=s("u_shadowTint"),this.uHighlightTint=s("u_highlightTint"),this.uAmbientLift=s("u_ambientLift"),this.uGradeParams=s("u_gradeParams"),this.uSunGlow=s("u_sunGlow"),this.uMistParams=s("u_mistParams"),this.uVignette=s("u_vignette"),this.uLightCount=s("u_lightCount"),this.uLights=s("u_lights[0]"),this.uLightMeta=s("u_lightMeta[0]")}ensureSceneFbo(e,r){let o=Math.max(1,e),i=Math.max(1,r);if(this.sceneFbo&&this.fboW===o&&this.fboH===i)return this.sceneFbo;let{gl:n}=this;this.sceneFbo&&n.deleteFramebuffer(this.sceneFbo),this.sceneTex&&n.deleteTexture(this.sceneTex);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)return this.sceneFbo=null,this.sceneTex=null,null;n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA8,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0);let c=n.checkFramebufferStatus(n.FRAMEBUFFER);return n.bindFramebuffer(n.FRAMEBUFFER,null),c!==n.FRAMEBUFFER_COMPLETE?(n.deleteFramebuffer(u),n.deleteTexture(s),this.sceneFbo=null,this.sceneTex=null,null):(this.sceneFbo=u,this.sceneTex=s,this.fboW=o,this.fboH=i,u)}beginScene(e,r){let o=this.ensureSceneFbo(e,r);if(!o)return null;let{gl:i}=this;return i.bindFramebuffer(i.FRAMEBUFFER,o),i.viewport(0,0,this.fboW,this.fboH),o}compositeToScreen(e){if(!this.sceneTex)return 0;let{gl:r}=this,{cam:o,profile:i,lights:n,timeSec:s,animate:u,strategicBlend:c}=e;r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,r.canvas.width,r.canvas.height),r.disable(r.BLEND),r.useProgram(this.prog),r.bindVertexArray(this.vao),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D,this.sceneTex),r.uniform1i(this.uSceneTex,0),r.uniform2f(this.uCamCenter,o.x,o.y),r.uniform2f(this.uViewportSize,o.viewportWidth,o.viewportHeight),r.uniform1f(this.uZoom,o.zoom),r.uniform1f(this.uTime,s),r.uniform1f(this.uAnimate,u?1:0),r.uniform1f(this.uStrategicBlend,c),r.uniform3f(this.uShadowTint,i.shadowTint[0],i.shadowTint[1],i.shadowTint[2]),r.uniform3f(this.uHighlightTint,i.highlightTint[0],i.highlightTint[1],i.highlightTint[2]),r.uniform3f(this.uAmbientLift,i.ambientLift[0],i.ambientLift[1],i.ambientLift[2]),r.uniform4f(this.uGradeParams,i.brightness,i.contrast,i.saturation,i.nightFactor),r.uniform4f(this.uSunGlow,i.sunGlowColor[0],i.sunGlowColor[1],i.sunGlowColor[2],i.sunGlowStrength),r.uniform4f(this.uMistParams,i.mistColor[0],i.mistColor[1],i.mistColor[2],i.mistDensity),r.uniform4f(this.uVignette,i.vignetteColor[0],i.vignetteColor[1],i.vignetteColor[2],i.vignetteStrength);let a=Math.min(n.length,_t);if(r.uniform1i(this.uLightCount,a),a>0){for(let l=0;l<a;l++){let d=n[l],h=l*4;this.lightsBuf[h]=d.x,this.lightsBuf[h+1]=d.y,this.lightsBuf[h+2]=d.radius,this.lightsBuf[h+3]=d.intensity;let m=l*2;this.metaBuf[m]=d.flickerSeed,this.metaBuf[m+1]=d.style}r.uniform4fv(this.uLights,this.lightsBuf),r.uniform2fv(this.uLightMeta,this.metaBuf)}return r.drawArrays(r.TRIANGLES,0,3),1}dispose(){let{gl:e}=this;this.sceneFbo&&e.deleteFramebuffer(this.sceneFbo),this.sceneTex&&e.deleteTexture(this.sceneTex),e.deleteVertexArray(this.vao),e.deleteProgram(this.prog),this.sceneFbo=null,this.sceneTex=null}};var _a=316/384;function $o(t,e){return{x:256*(t+e*.5),y:$e*e}}function Ca(t,e,r,o){let i=e.x-t.x,n=e.y-t.y,s=o.x-r.x,u=o.y-r.y,c=i*u-n*s;if(Math.abs(c)<1e-9)return null;let a=r.x-t.x,l=r.y-t.y,d=(a*u-l*s)/c,h=(a*n-l*i)/c;return d<0||d>1||h<0||h>1?null:{x:t.x+d*i,y:t.y+d*n}}function Ko(t){let{roads:e,routes:r=[],manualRivers:o=[],lookupFog:i,isWaterHex:n}=t;if(e.length===0||r.length===0&&o.length===0)return[];let s=[];for(let c of r){let a=nr(c,34,n);a&&a.points.length>=2&&s.push(a)}if(o.length>0){let c=Cn(o,34);for(let a of c)a.points.length>=2&&s.push(a)}if(s.length===0)return[];let u=[];for(let c of e){let a=dt(c.q1,c.r1,c.q2,c.r2);if(a<0)continue;let l=i(c.q1,c.r1),d=i(c.q2,c.r2),h=l>=d?l:d;if(h===0)continue;let m=$o(c.q1,c.r1),g=$o(c.q2,c.r2),b=g.x-m.x,p=g.y-m.y,_=Math.hypot(b,p)||1,w=[];for(let y of s){let E=y.points,k=Math.max(18,y.width*.72);for(let S=1;S<E.length;S++){let R=E[S-1],U=E[S],C=Ca(m,g,R,U);if(!C)continue;let P=U.x-R.x,Q=U.y-R.y;Math.abs(b*Q-p*P)/(_*(Math.hypot(P,Q)||1))<=.16||w.some(K=>Math.hypot(K.x-C.x,K.y-C.y)<k)||u.some(K=>Math.hypot(K.ux-C.x,K.uy-C.y)<k)||w.push({x:C.x,y:C.y,width:y.width})}}let M=c.tier==="stone"?"stone":"timber";for(let y of w)u.push({ux:y.x,uy:y.y,dir:a,material:M,tier:c.tier,length:Math.max(96,y.width+64),fogState:h})}return u}function jo(t){let{manifest:e,crossings:r,sampleReliefHeight:o}=t;if(r.length===0)return[];let i=e.infrastructure.sprites,n=[];for(let s of r){let u=String(s.dir).padStart(2,"0"),c=`bridges/${s.material}/bridge_dir_${u}`,a=`bridges/${s.material==="stone"?"timber":"stone"}/bridge_dir_${u}`,l=i[c]??i[a];if(!l)continue;let d=s.length/_a,h=s.uy*Ee,m=o?o(s.ux,s.uy)*Ee:0,g=h-m,b=e.shadows.sprites[`bridge_shadow:axis${s.dir%3}`],p=100,_=b?{shadowPage:b.page,shadowU0:b.uv[0],shadowV0:b.uv[1],shadowU1:b.uv[2],shadowV1:b.uv[3],shadowRelLeft:b.boundsInSpriteWidth[0]*p,shadowRelTop:b.boundsInSpriteWidth[1]*p,shadowWidth:(b.boundsInSpriteWidth[2]-b.boundsInSpriteWidth[0])*p,shadowHeight:(b.boundsInSpriteWidth[3]-b.boundsInSpriteWidth[1])*p}:{};n.push({x:s.ux,y:g,relLeft:-d*.5,relTop:-d*.5,width:d,height:d,page:l.page,u0:l.uv[0],v0:l.uv[1],u1:l.uv[2],v1:l.uv[3],sortY:h-26,fogState:s.fogState,..._})}return n}var Ra={"buildings/centers/outpost":156,"buildings/centers/settlement":170,"buildings/centers/city":182,"buildings/centers/metropolis":190,"buildings/centers/capital_t1":192,"buildings/tier1/farm":174,"buildings/tier1/lumber_camp":164,"buildings/tier1/quarry":172,"buildings/tier1/iron_mine":168,"buildings/tier1/fortress":182,"buildings/tier1/watchtower":100,"buildings/tier1/harbor":184},Ma={"buildings/centers/outpost":[.5,.72],"buildings/centers/settlement":[.5,.72],"buildings/centers/city":[.5,.71],"buildings/centers/metropolis":[.5,.72],"buildings/centers/capital_t1":[.5,.74],"buildings/tier1/farm":[.5,.7],"buildings/tier1/lumber_camp":[.5,.72],"buildings/tier1/quarry":[.5,.68],"buildings/tier1/iron_mine":[.5,.72],"buildings/tier1/fortress":[.5,.74],"buildings/tier1/watchtower":[.5,.87],"buildings/tier1/harbor":[.5,.7]};function Ta(t,e,r,o){let i=t.infrastructure.sprites,n=Math.max(1,Math.min(4,Math.round(r||1))),s=[];if(e==="capital")for(let u=n;u>=1;u--)s.push(`buildings/centers/capital_t${u}`);else if(e==="settlement")o&&s.push(`buildings/centers/${o}`),n>=4&&s.push("buildings/centers/metropolis"),n>=3&&s.push("buildings/centers/city"),n>=2&&s.push("buildings/centers/settlement"),s.push("buildings/centers/outpost"),s.push("buildings/centers/settlement");else for(let u=n;u>=1;u--)s.push(`buildings/tier${u}/${e}`);for(let u of s)if(i[u])return u;return null}function Zo(t){let{manifest:e,buildings:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredBuildingIds:s};let u=e.infrastructure.sprites;for(let c of r){let a=o(c.q,c.r);if(a===0)continue;let l=Ta(e,c.kind,c.level,c.centerStage);if(!l)continue;let d=u[l];if(!d)continue;s.add(c.id);let h=Ae(c.q,c.r),m=h.x,g=h.y/Ee,b=i?i(m,g)*Ee:0,p=h.y-b,_=Ra[l]??200,[w,M]=d.sourceSize,y=w>0?M/w:1,E=_*y,[k,S]=Ma[l]??[.5,.72],R=e.shadows.sprites[`building_shadow:${l}`],U=R?{shadowPage:R.page,shadowU0:R.uv[0],shadowV0:R.uv[1],shadowU1:R.uv[2],shadowV1:R.uv[3],shadowRelLeft:R.boundsInSpriteWidth[0]*_,shadowRelTop:R.boundsInSpriteWidth[1]*_,shadowWidth:(R.boundsInSpriteWidth[2]-R.boundsInSpriteWidth[0])*_,shadowHeight:(R.boundsInSpriteWidth[3]-R.boundsInSpriteWidth[1])*_}:{};n.push({x:m,y:p,relLeft:-_*k,relTop:-E*S,width:_,height:E,page:d.page,u0:d.uv[0],v0:d.uv[1],u1:d.uv[2],v1:d.uv[3],sortY:h.y+8,fogState:a,...U})}return n.sort((c,a)=>c.sortY-a.sortY||c.x-a.x),{sprites:n,coveredBuildingIds:s}}var Gr=.08,Ur=2,Qo=.15,kn=.21;function Wn(t){return t>=kn?0:t<=Qo?1:(kn-t)/(kn-Qo)}function Jo(t){return Wn(t)>=.5?"strategic":"detail"}function Or(t,e,r){return t<e?e:t>r?r:t}var Nr=class{constructor(e,r,o,i){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],i=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,s=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,s,this.pinchStartZoom*(i/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,i=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,i),this.state.x-=o/this.state.zoom,this.state.y-=i/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=zt(r.x,r.y,this.state),i=je(o.x,o.y),n=`${i.q},${i.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(i))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,i=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,s]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=s,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=zt(i.x,i.y,this.state),s=je(n.x,n.y);this.callbacks.onHexClick?.(s),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:s})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=i;let n=Ae(r.q,r.r),s=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:Or(o,Gr,Ur),viewportWidth:Math.max(1,s.width||e.clientWidth||1280),viewportHeight:Math.max(1,s.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),i=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*i)),s=Math.max(1,Math.round(o*i)),u=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==i||this.canvas.width!==n||this.canvas.height!==s;return u&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=i,this.canvas.width=n,this.canvas.height=s),u}centerOnHex(e,r,o){let i=Ae(e,r);this.state.x=i.x,this.state.y=i.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=Or(o,Gr,Ur)),this.callbacks.onChange()}setZoom(e){this.state.zoom=Or(e,Gr,Ur),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let i=Or(o,Gr,Ur);if(Math.abs(i-this.state.zoom)<1e-5)return;let n=zt(e,r,this.state);this.state.zoom=i;let s=zt(e,r,this.state);this.state.x+=n.x-s.x,this.state.y+=n.y-s.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var ei={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function Vr(t,e,r){return t<e?e:t>r?r:t}function Ea(t,e,r,o,i,n){let s=i-r,u=n-o,c=s*s+u*u,a=c>1e-6?Vr(((t-r)*s+(e-o)*u)/c,0,1):0,l=r+a*s,d=o+a*u,h=t-l,m=e-d;return h*h+m*m}function Fn(t){if(!t)return ei;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let i of t.buildings){e.add(qe(i.q,i.r));let n=Ae(i.q,i.r),s=i.kind==="capital"||i.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-64,maxX:n.x+s+64,minY:n.y-s-64,maxY:n.y+s+64})}if(t.sites&&t.sites.length>0)for(let i of t.sites){let n=Ae(i.q,i.r),s=i.family==="fauna"?80:78;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-56,maxX:n.x+s+56,minY:n.y-s-56,maxY:n.y+s+56})}if(t.walls&&t.walls.length>0)for(let i of t.walls){let n=dt(i.q1,i.r1,i.q2,i.r2);if(n<0)continue;let{a:s,b:u}=mt(i.q1,i.r1,n),c=i.isGate?i.kind==="stone"?24:20:i.kind==="stone"?18:14,a=i.kind==="stone"?26:16,l=a+64;r.push({ax:s.x,ay:s.y,bx:u.x,by:u.y,halfWidth:c,pierRadius:a,minX:Math.min(s.x,u.x)-l,maxX:Math.max(s.x,u.x)+l,minY:Math.min(s.y,u.y)-l,maxY:Math.max(s.y,u.y)+l,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let i of t.roads){let n=Ae(i.q1,i.r1),s=Ae(i.q2,i.r2),u=i.tier==="stone"?30:i.tier==="packed"?24:18,c=u+56;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:u,minX:Math.min(n.x,s.x)-c,maxX:Math.max(n.x,s.x)+c,minY:Math.min(n.y,s.y)-c,maxY:Math.max(n.y,s.y)+c,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let i of t.rivers){let{a:n,b:s}=mt(i.q,i.r,i.dir),u=22,c=u+48;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:20,minX:Math.min(n.x,s.x)-c,maxX:Math.max(n.x,s.x)+c,minY:Math.min(n.y,s.y)-c,maxY:Math.max(n.y,s.y)+c,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?ei:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function Ln(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(qe(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,i=Vr(t.width*.42,12,48),n=Vr(t.width*.34,10,34),s=Vr(t.width*.28,8,26),u=e.discs;for(let a=0;a<u.length;a++){let l=u[a];if(r<l.minX||r>l.maxX||o<l.minY||o>l.maxY)continue;let d=r-l.cx,h=o-l.cy,m=l.radius+n*.6;if(d*d+h*h<=m*m)return!0}let c=e.segments;for(let a=0;a<c.length;a++){let l=c[a];if(r<l.minX||r>l.maxX||o<l.minY||o>l.maxY)continue;let d=l.kind==="wall"?i:l.kind==="road"?n:s,h=l.halfWidth+d+(l.kind==="wall"?8:4);if(Ea(r,o,l.ax,l.ay,l.bx,l.by)<=h*h)return!0;if(l.kind==="wall"){let m=l.pierRadius+i+6,g=m*m,b=r-l.ax,p=o-l.ay;if(b*b+p*p<=g)return!0;let _=r-l.bx,w=o-l.by;if(_*_+w*w<=g)return!0}}return!1}function ti(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function Pa(t,e,r){return!(t.x1+r<e.x0||e.x1+r<t.x0||t.y1+r<e.y0||e.y1+r<t.y0)}function zr(t,e,r,o,i,n,s=.86,u=!1){t.font=u?`700 ${n}px Georgia, "Palatino Linotype", "Book Antiqua", serif`:`600 ${n}px system-ui, -apple-system, sans-serif`;let c=t.measureText(o),a=Math.max(6,n*.58),l=Math.max(3,n*.32),d=c.width+a*2,h=n+l*2,m=e-d*.5,g=r-h*.5,b=Math.min(8,h*.45);return t.beginPath(),t.roundRect(m,g,d,h,b),t.fillStyle=u?`rgba(26, 20, 15, ${Math.min(.92,s+.04)})`:`rgba(12, 17, 23, ${s})`,t.fill(),t.lineWidth=u?1.6:1.4,t.strokeStyle=u?ti([i[0]*.65+.32,i[1]*.65+.27,i[2]*.65+.16],.92):ti(i,.9),t.stroke(),t.fillStyle=u?"#f4e8cd":"#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5),{x0:m,y0:g,x1:m+d,y1:g+h}}function Aa(t,e,r,o,i,n){let s=e.scale*Math.max(.7,Math.min(1.35,i/.135)),u=e.fogState===1?.62:1,c=n*u;if(!(c<.03)){if(t.save(),t.translate(r,o),t.lineCap="round",t.lineJoin="round",e.kind==="peak"){let a=13.5*s,l=12.5*s;t.beginPath(),t.moveTo(0,-l),t.lineTo(a,l*.36),t.lineTo(a*.08,l*.36),t.closePath(),t.fillStyle=`rgba(236, 224, 198, ${.58*c})`,t.fill(),t.beginPath(),t.moveTo(0,-l),t.lineTo(a*.08,l*.36),t.lineTo(-a,l*.36),t.closePath(),t.fillStyle=`rgba(62, 46, 33, ${.42*c})`,t.fill(),t.beginPath(),t.moveTo(-a,l*.36),t.quadraticCurveTo(-a*.35,-l*.25,0,-l),t.quadraticCurveTo(a*.38,-l*.22,a,l*.36),t.moveTo(0,-l),t.quadraticCurveTo(-a*.08,-l*.15,a*.08,l*.34),t.strokeStyle=`rgba(48, 34, 22, ${.74*c})`,t.lineWidth=Math.max(1,1.2*s),t.stroke(),t.beginPath(),t.moveTo(-a*.15,-l*.35),t.lineTo(-a*.56,l*.18),t.moveTo(-a*.05,-l*.05),t.lineTo(-a*.3,l*.28),t.strokeStyle=`rgba(48, 34, 22, ${.46*c})`,t.lineWidth=Math.max(.75,.85*s),t.stroke()}else if(e.kind==="hill"){let a=12.2*s,l=5.8*s;t.beginPath(),t.moveTo(-a,l*.35),t.quadraticCurveTo(0,-l*1.2,a,l*.35),t.strokeStyle=`rgba(68, 50, 32, ${.62*c})`,t.lineWidth=Math.max(.95,1.12*s),t.stroke(),t.beginPath(),t.moveTo(-a*.55,-l*.15),t.lineTo(-a*.72,l*.28),t.moveTo(-a*.22,-l*.35),t.lineTo(-a*.38,l*.22),t.strokeStyle=`rgba(68, 50, 32, ${.42*c})`,t.lineWidth=Math.max(.75,.85*s),t.stroke()}else if(e.kind==="forest"||e.kind==="jungle"){let a=5.4*s,l=e.kind==="jungle"?`rgba(46, 94, 52, ${.46*c})`:`rgba(68, 98, 58, ${.44*c})`,d=e.kind==="jungle"?`rgba(24, 48, 28, ${.72*c})`:`rgba(38, 52, 30, ${.68*c})`,h=`rgba(218, 224, 184, ${.28*c})`,m=[[-a*.92,.9*s,a*.86],[a*.92,1*s,a*.84],[0,-a*.45,a*1.04]];for(let[g,b,p]of m)t.beginPath(),t.arc(g,b,p,Math.PI*.95,Math.PI*2.05),t.fillStyle=l,t.fill(),t.strokeStyle=d,t.lineWidth=Math.max(.9,1.02*s),t.stroke(),t.beginPath(),t.arc(g+p*.15,b-p*.08,p*.62,-Math.PI*.42,.12),t.strokeStyle=h,t.lineWidth=Math.max(.7,.8*s),t.stroke();t.beginPath(),t.moveTo(-a*1.55,a*.48),t.lineTo(a*1.55,a*.48),t.strokeStyle=`rgba(48, 36, 24, ${.46*c})`,t.lineWidth=Math.max(.75,.85*s),t.stroke()}else if(e.kind==="taiga"){let a=11*s,l=4.6*s,d=[[-3.8*s,1.2*s,.86],[3.1*s,.4*s,1.02]];for(let[h,m,g]of d)t.beginPath(),t.moveTo(h,m-a*g),t.lineTo(h+l*g,m+2.4*s),t.lineTo(h-l*g,m+2.4*s),t.closePath(),t.fillStyle=`rgba(48, 76, 62, ${.48*c})`,t.fill(),t.strokeStyle=`rgba(28, 44, 36, ${.7*c})`,t.lineWidth=Math.max(.85,.95*s),t.stroke()}else if(e.kind==="dune"){let a=13*s,l=4.4*s;t.beginPath(),t.moveTo(-a,l*.3),t.bezierCurveTo(-a*.35,-l,a*.25,-l*.85,a,l*.35),t.moveTo(-a*.65,l*.85),t.quadraticCurveTo(0,l*.1,a*.72,l*.95),t.strokeStyle=`rgba(116, 82, 40, ${.56*c})`,t.lineWidth=Math.max(.9,1*s),t.stroke()}else if(e.kind==="wave"){let a=14*s,l=2.2*s;t.beginPath(),t.moveTo(-a,-.8),t.quadraticCurveTo(-a*.67,-l-.8,-a*.33,-.8),t.quadraticCurveTo(0,l-.8,a*.33,-.8),t.quadraticCurveTo(a*.67,-l-.8,a,-.8),t.strokeStyle=`rgba(220, 236, 238, ${.28*c})`,t.lineWidth=Math.max(.85,.95*s),t.stroke(),t.beginPath(),t.moveTo(-a,.4),t.quadraticCurveTo(-a*.67,-l+.4,-a*.33,.4),t.quadraticCurveTo(0,l+.4,a*.33,.4),t.quadraticCurveTo(a*.67,-l+.4,a,.4),t.strokeStyle=`rgba(16, 40, 56, ${.46*c})`,t.lineWidth=Math.max(.9,1*s),t.stroke()}t.restore()}}function ka(t,e,r,o,i,n=0){if(i<.04)return;t.save(),t.translate(e,r);let s=n>.55,u=s?`rgba(24, 18, 12, ${.92*i})`:`rgba(38, 27, 17, ${.9*i})`,c=s?`rgba(240, 206, 134, ${.95*i})`:`rgba(236, 216, 168, ${.94*i})`,a=s?`rgba(24, 22, 32, ${.62*i})`:`rgba(244, 232, 202, ${.46*i})`;t.beginPath(),t.arc(0,0,o*1.18,0,Math.PI*2),t.fillStyle=a,t.fill(),t.strokeStyle=s?`rgba(226, 186, 108, ${.52*i})`:`rgba(74, 54, 34, ${.32*i})`,t.lineWidth=1,t.stroke(),t.beginPath(),t.arc(0,0,o*.74,0,Math.PI*2),t.strokeStyle=s?c:u,t.lineWidth=1.25,t.stroke(),t.beginPath(),t.arc(0,0,o*.64,0,Math.PI*2),t.strokeStyle=s?`rgba(226, 186, 108, ${.48*i})`:`rgba(56, 40, 26, ${.55*i})`,t.lineWidth=.8,t.stroke();let l=o*.62,d=o*.13;for(let p=0;p<4;p++)t.save(),t.rotate(Math.PI*.25+p*Math.PI*.5),t.beginPath(),t.moveTo(0,-l),t.lineTo(d,0),t.lineTo(0,0),t.closePath(),t.fillStyle=c,t.fill(),t.beginPath(),t.moveTo(0,-l),t.lineTo(-d,0),t.lineTo(0,0),t.closePath(),t.fillStyle=u,t.fill(),t.restore();let h=o*.94,m=o*.18;for(let p=0;p<4;p++)t.save(),t.rotate(p*Math.PI*.5),t.beginPath(),t.moveTo(0,-h),t.lineTo(m,0),t.lineTo(0,0),t.closePath(),t.fillStyle=p===0?`rgba(232, 186, 86, ${.98*i})`:c,t.fill(),t.strokeStyle=u,t.lineWidth=.8,t.stroke(),t.beginPath(),t.moveTo(0,-h),t.lineTo(-m,0),t.lineTo(0,0),t.closePath(),t.fillStyle=u,t.fill(),t.restore();t.beginPath(),t.arc(0,0,o*.11,0,Math.PI*2),t.fillStyle=c,t.fill(),t.strokeStyle=u,t.lineWidth=1,t.stroke(),t.font=`700 ${Math.round(o*.34)}px Georgia, "Palatino Linotype", serif`,t.textAlign="center",t.textBaseline="middle";let g=o*1.18,b=[["N",0,-g],["O",g,0],["S",0,g],["W",-g,0]];for(let[p,_,w]of b)t.lineWidth=2.8,t.strokeStyle=s?`rgba(14, 12, 18, ${.88*i})`:`rgba(244, 232, 204, ${.85*i})`,t.strokeText(p,_,w),t.fillStyle=s?c:u,t.fillText(p,_,w);t.restore()}function Wa(t,e,r,o,i,n,s=0){let u=e.tier===3?e.isWater?18:16:e.tier===2?e.isWater?15:13.5:11.5,c=e.isWater?e.name:e.name.toUpperCase(),a=e.tier===3?e.isWater?3.8:3.4:e.tier===2?2.6:1.8;t.font=e.isWater?`italic 600 ${u}px Georgia, "Palatino Linotype", "Book Antiqua", serif`:`700 ${u}px Georgia, "Palatino Linotype", "Book Antiqua", serif`;let l=Array.from(c),d=l.map(P=>t.measureText(P).width),h=0;for(let P=0;P<d.length;P++)h+=d[P]+(P<d.length-1?a:0);let m=Math.abs(Math.cos(e.angleRad)),g=Math.abs(Math.sin(e.angleRad)),b=h*.5,p=u*.65+Math.abs(e.arcBend)*h*.16,_=b*m+p*g,w=b*g+p*m,M={x0:r-_,y0:o-w,x1:r+_,y1:o+w};for(let P=0;P<n.length;P++)if(Pa(M,n[P],10))return null;let y=i*(e.fogState===1?.66:.94);if(y<.04)return null;t.save(),t.translate(r,o),t.rotate(e.angleRad),t.textAlign="center",t.textBaseline="middle",t.lineJoin="round";let E=s>.55,k=e.isWater?E?`rgba(194, 224, 240, ${y})`:`rgba(232, 241, 240, ${y})`:E?`rgba(244, 224, 178, ${y})`:`rgba(42, 28, 17, ${y})`,S=e.isWater?`rgba(10, 22, 34, ${.84*y})`:E?`rgba(18, 13, 10, ${.86*y})`:`rgba(243, 232, 205, ${.84*y})`,R=e.isWater?3.2:3.6,U=e.arcBend*Math.min(h*.24,24),C=-h*.5;for(let P=0;P<l.length;P++){let Q=d[P],z=C+Q*.5,K=h>1?z/(h*.5):0,W=U*(K*K-.35),N=h>1?2*U*K/Math.max(12,h*.5):0,ee=Math.atan(N);t.save(),t.translate(z,W),t.rotate(ee),t.lineWidth=R,t.strokeStyle=S,t.strokeText(l[P],0,0),t.fillStyle=k,t.fillText(l[P],0,0),t.restore(),C+=Q+a}return t.restore(),M}var In=new WeakSet;function ri(t){let{canvas:e,cam:r,scene:o,lookupFog:i,strategicBlend:n,timeSec:s,strategicCartography:u,nightAtlasBlend:c=0}=t,a=Math.max(1,Math.round(r.viewportWidth*r.dpr)),l=Math.max(1,Math.round(r.viewportHeight*r.dpr)),d=!!(o&&(o.buildings&&o.buildings.length>0||o.sites&&o.sites.length>0||o.units&&o.units.length>0||o.buildPreview)),h=!!(u&&n>.04);if(!d&&!h){(In.has(e)||e.width!==a||e.height!==l)&&(e.width=a,e.height=l,In.delete(e));return}(e.width!==a||e.height!==l)&&(e.width=a,e.height=l);let m=e.getContext("2d");if(!m)return;m.setTransform(r.dpr,0,0,r.dpr,0,0),m.clearRect(0,0,r.viewportWidth,r.viewportHeight),In.add(e);let g=n>=.5,b=[];if(h&&u){let p=Math.min(1,Math.max(0,(n-.04)/.65));if(p>.02)for(let w=0;w<u.stamps.length;w++){let M=u.stamps[w],y=ut(M.x,M.y,r);y.x<-36||y.x>r.viewportWidth+36||y.y<-36||y.y>r.viewportHeight+36||Aa(m,M,y.x,y.y,r.zoom,p)}}if(o?.buildings)for(let p of o.buildings){let _=i(p.q,p.r);if(_===0)continue;let w=p.kind==="capital"||p.kind==="settlement",M=w||p.kind==="fortress"||p.kind==="harbor";if(g&&!M)continue;let y=Ae(p.q,p.r),E=ut(y.x,y.y,r);if(E.x<-120||E.x>r.viewportWidth+120||E.y<-80||E.y>r.viewportHeight+80)continue;let k=typeof p.yieldPercent=="number"&&!g?` \xB7 ${p.yieldPercent}%`:"",S=w?`\u2605 ${p.label} (R${p.level})`:`${p.label} L${p.level}${k}`,R=g?-18:Math.max(30,(w?56:50)*r.zoom),U=zr(m,E.x,E.y+R,S,p.factionColor,w?g?12:12.5:10.5,_===1?.65:.88,g&&!!u);if(b.push(U),typeof p.constructionProgress=="number"&&p.constructionProgress>0&&p.constructionProgress<1&&!g){let Q=E.x-27,z=E.y+R+13;m.fillStyle="rgba(10, 15, 22, 0.85)",m.fillRect(Q,z,54,5),m.fillStyle="#f59e0b",m.fillRect(Q+1,z+1,52*p.constructionProgress,3)}}if(h&&u){let p=Math.min(1,Math.max(0,(n-.12)/.62));if(p>.03){let w=r.viewportWidth-58,M=58;if(r.viewportWidth>=320&&r.viewportHeight>=240&&b.push({x0:w-29*1.5,y0:M-29*1.5,x1:w+29*1.5,y1:M+29*1.5}),o?.units)for(let k of o.units){if(i(k.q,k.r)<2)continue;let S=Ae(k.q,k.r),R=ut(S.x,S.y,r);b.push({x0:R.x-76,y0:R.y-44,x1:R.x+76,y1:R.y-6})}let y=0,E=16;for(let k=0;k<u.regions.length&&y<E;k++){let S=u.regions[k],R=ut(S.x,S.y,r);if(R.x<68||R.x>r.viewportWidth-68||R.y<42||R.y>r.viewportHeight-92)continue;let U=Wa(m,S,R.x,R.y,p,b,c);U&&(b.push(U),y++)}r.viewportWidth>=320&&r.viewportHeight>=240&&ka(m,w,M,29,p*.92,c)}}if(o?.sites&&!g&&r.zoom>=.45)for(let p of o.sites){if(i(p.q,p.r)===0)continue;let _=Ae(p.q,p.r),w=ut(_.x,_.y,r);if(w.x<-80||w.x>r.viewportWidth+80||w.y<-50||w.y>r.viewportHeight+50)continue;let M=Math.max(30,(p.family==="fauna"?64:54)*r.zoom);zr(m,w.x,w.y+M,p.label,p.family==="fauna"?[.55,.84,.48]:[.85,.68,.35],10,.78)}if(o?.units)for(let p of o.units){if(i(p.q,p.r)<2)continue;let _=Ae(p.q,p.r);if(p.marchPath&&p.marchPath.length>=2){let E=Ae(p.marchPath[0].q,p.marchPath[0].r),k=Ae(p.marchPath[1].q,p.marchPath[1].r),S=s*.14%1;_={x:E.x+(k.x-E.x)*S,y:E.y+(k.y-E.y)*S}}let w=ut(_.x,_.y,r);if(w.x<-100||w.x>r.viewportWidth+100||w.y<-60||w.y>r.viewportHeight+60)continue;let M=p.kind==="siege_army"?"\u2694":p.kind==="army"?"\u{1F6E1}":p.kind==="scout"?"\u{1F441}":p.kind==="boat"?"\u26F5":"\u2696",y=typeof p.strength=="number"?` ${p.strength}${p.rams?` + ${p.rams}R`:""}`:"";zr(m,w.x,w.y-Math.max(20,34*r.zoom),`${M} ${p.label}${y}`,p.factionColor,g?10.5:11,.92)}if(o?.buildPreview){let p=o.buildPreview,_=Ae(p.center.q,p.center.r),w=ut(_.x,_.y,r),M=p.yieldPercent-100,y=p.valid?`${p.buildingKind} \xB7 Ertrag ${p.yieldPercent}% (+${M}% R2)`:`Nicht baubar: ${p.reason??"ung\xFCltig"}`;zr(m,w.x,w.y-34,y,p.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var Xr=65536,Yr=12,Fa={trail:{tierIndex:0,width:19,shoulder:32,outer:44,rough:.16,opacity:.78},packed:{tierIndex:1,width:28,shoulder:38,outer:48,rough:.075,opacity:.87},stone:{tierIndex:2,width:34,shoulder:43,outer:52,rough:.028,opacity:.96}},La=["trail","packed","stone"],Ia=`#version 300 es
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
`,Da=`#version 300 es
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
`,Ba=`#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(pos, 0.0, 1.0);
  v_uv = pos * 0.5 + 0.5;
}
`,qa=`#version 300 es
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
`;function Dn(t,e,r=0){let o=Math.imul(t+37,374761393)^Math.imul(e+91,668265263)^Math.imul(r+7,2246822519);return o^=o>>>13,o=Math.imul(o,1274126177),(o^o>>>16)>>>0}function $r(t,e){return{x:256*(t+e*.5),y:$e*e}}function Ha(t,e,r,o,i=14){let n=t>r||t===r&&e>o,s=n?r:t,u=n?o:e,c=n?t:r,a=n?e:o,l=$r(s,u),d=$r(c,a),h=d.x-l.x,m=d.y-l.y,g=Math.hypot(h,m)||1,b=-m/g,p=h/g,w=(Dn(s+c,u+a,Dn(s-c,u-a,11))%2001/1e3-1)*4.2,M=[];for(let y=0;y<=i;y++){let E=y/i,k=w*Math.sin(E*2*Math.PI);M.push({x:l.x+h*E+b*k,y:l.y+m*E+p*k})}return M}var Kr=class{constructor(e){this.verts=new Float32Array(Xr*Yr);this.vertCount=0;this.maskFbo=null;this.maskTex=null;this.maskW=0;this.maskH=0;this.gl=e,this.maskProg=this.compileProgram(Ia,Da,"RoadMask"),this.compProg=this.compileProgram(Ba,qa,"RoadComp");let r=e.createVertexArray(),o=e.createBuffer(),i=e.createVertexArray();if(!r||!o||!i)throw new Error("Failed to allocate RoadPass VAO/VBO");this.vao=r,this.vbo=o,this.compVao=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let n=Yr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.bindVertexArray(null);let s=(u,c)=>{let a=e.getUniformLocation(u,c);if(!a)throw new Error(`Missing road uniform: ${c}`);return a};this.uMaskCamCenter=s(this.maskProg,"u_camCenter"),this.uMaskViewportSize=s(this.maskProg,"u_viewportSize"),this.uMaskZoom=s(this.maskProg,"u_zoom"),this.uMaskTier=s(this.maskProg,"u_tier"),this.uCompCamCenter=s(this.compProg,"u_camCenter"),this.uCompViewportSize=s(this.compProg,"u_viewportSize"),this.uCompZoom=s(this.compProg,"u_zoom"),this.uCompTier=s(this.compProg,"u_tier"),this.uCompOpacity=s(this.compProg,"u_opacity"),this.uCompFade=s(this.compProg,"u_fade"),e.useProgram(this.compProg),e.uniform1i(e.getUniformLocation(this.compProg,"u_roadMaskTex"),0)}compileProgram(e,r,o){let{gl:i}=this,n=i.createShader(i.VERTEX_SHADER),s=i.createShader(i.FRAGMENT_SHADER);if(!n||!s)throw new Error(`Failed to allocate ${o} shaders`);if(i.shaderSource(n,e),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw new Error(`${o} VS error: ${i.getShaderInfoLog(n)}`);if(i.shaderSource(s,r),i.compileShader(s),!i.getShaderParameter(s,i.COMPILE_STATUS))throw new Error(`${o} FS error: ${i.getShaderInfoLog(s)}`);let u=i.createProgram();if(!u)throw new Error(`Failed to allocate ${o} program`);if(i.attachShader(u,n),i.attachShader(u,s),i.linkProgram(u),i.deleteShader(n),i.deleteShader(s),!i.getProgramParameter(u,i.LINK_STATUS))throw new Error(`${o} link error: ${i.getProgramInfoLog(u)}`);return u}ensureMaskFbo(e,r){let o=Math.max(1,e),i=Math.max(1,r);if(this.maskFbo&&this.maskW===o&&this.maskH===i)return;let{gl:n}=this;this.maskTex&&n.deleteTexture(this.maskTex),this.maskFbo&&n.deleteFramebuffer(this.maskFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate RoadPass mask FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA8,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.maskTex=s,this.maskFbo=u,this.maskW=o,this.maskH=i}pushVert(e,r,o,i,n,s,u,c,a,l,d){if(this.vertCount>=Xr)return;let h=this.vertCount*Yr,m=this.verts;m[h++]=e,m[h++]=r,m[h++]=o,m[h++]=i,m[h++]=n,m[h++]=s,m[h++]=u,m[h++]=c,m[h++]=a,m[h++]=l,m[h++]=d,m[h++]=0,this.vertCount++}emitTierGeometry(e,r,o,i){this.vertCount=0;let n=r.width*.5,s=r.shoulder*.5,u=r.outer*.5,c=r.rough,a=(h,m)=>{let g=i?i(h,m):0;return{x:h,y:(m-g)*Ee}},l=new Map;for(let h=0;h<e.length;h++){let m=e[h],g=o(m.q1,m.r1),b=o(m.q2,m.r2);if(g===0&&b===0)continue;let p=g===2||b===2?1:.66,_=Ha(m.q1,m.r1,m.q2,m.r2,14),w=_.length,M=Dn(m.q1+m.q2,m.r1+m.r2,r.tierIndex+3)%628/100,y=qe(m.q1,m.r1),E=$r(m.q1,m.r1),k=l.get(y);(!k||p>k.fogDim)&&l.set(y,{ux:E.x,uy:E.y,fogDim:p});let S=qe(m.q2,m.r2),R=$r(m.q2,m.r2),U=l.get(S);(!U||p>U.fogDim)&&l.set(S,{ux:R.x,uy:R.y,fogDim:p});let C=new Float32Array(w),P=new Float32Array(w),Q=new Float32Array(w),z=new Float32Array(w),K=new Float32Array(w);for(let W=0;W<w;W++){W>0&&(Q[W]=Q[W-1]+Math.hypot(_[W].x-_[W-1].x,_[W].y-_[W-1].y));let N=_[Math.max(0,W-1)],ee=_[Math.min(w-1,W+1)],Z=ee.x-N.x,x=ee.y-N.y,F=Math.hypot(Z,x)||1;C[W]=-x/F,P[W]=Z/F;let T=W/(w-1),D=Math.sin(Math.PI*T);z[W]=n*(1+c*D*(.69*Math.sin(T*12+M)+.36*Math.cos(T*17+M))),K[W]=n*(1+c*D*(.63*Math.cos(T*11+M)-.32*Math.sin(T*18+M)))}for(let W=0;W<w-1&&!(this.vertCount+6>Xr);W++){let N=W/(w-1),ee=(W+1)/(w-1),Z=_[W],x=_[W+1],F=a(Z.x-C[W]*u,Z.y-P[W]*u),T=a(Z.x+C[W]*u,Z.y+P[W]*u),D=a(x.x-C[W+1]*u,x.y-P[W+1]*u),I=a(x.x+C[W+1]*u,x.y+P[W+1]*u);this.pushVert(F.x,F.y,-u,0,z[W],s,u,N,p,-u,Q[W]),this.pushVert(T.x,T.y,u,0,K[W],s,u,N,p,u,Q[W]),this.pushVert(I.x,I.y,u,0,K[W+1],s,u,ee,p,u,Q[W+1]),this.pushVert(F.x,F.y,-u,0,z[W],s,u,N,p,-u,Q[W]),this.pushVert(I.x,I.y,u,0,K[W+1],s,u,ee,p,u,Q[W+1]),this.pushVert(D.x,D.y,-u,0,z[W+1],s,u,ee,p,-u,Q[W+1])}}let d=14;for(let h of l.values()){let m=a(h.ux,h.uy);for(let g=0;g<d&&!(this.vertCount+3>Xr);g++){let b=g/d*Math.PI*2,p=(g+1)/d*Math.PI*2,_=Math.cos(b)*u,w=Math.sin(b)*u,M=Math.cos(p)*u,y=Math.sin(p)*u,E=a(h.ux+_,h.uy+w),k=a(h.ux+M,h.uy+y);this.pushVert(m.x,m.y,0,0,n*1.03,s*1.02,u,-1,h.fogDim,0,0),this.pushVert(E.x,E.y,_,w,n*1.03,s*1.02,u,-1,h.fogDim,0,0),this.pushVert(k.x,k.y,M,y,n*1.03,s*1.02,u,-1,h.fogDim,0,0)}}}render(e){let{cam:r,roads:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s,targetFramebuffer:u=null}=e;if(!o||o.length===0||n>=.85)return 0;let c=1-n*.82,{gl:a}=this,l=a.canvas.width,d=a.canvas.height;if(l<=0||d<=0)return 0;let h={trail:[],packed:[],stone:[]};for(let g=0;g<o.length;g++){let b=o[g];(h[b.tier]??h.trail).push(b)}this.ensureMaskFbo(l,d);let m=0;for(let g of La){let b=h[g];if(b.length===0)continue;let p=Fa[g];this.emitTierGeometry(b,p,i,s),this.vertCount!==0&&(a.bindFramebuffer(a.FRAMEBUFFER,this.maskFbo),a.viewport(0,0,this.maskW,this.maskH),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.enable(a.BLEND),a.blendEquation(a.MAX),a.blendFunc(a.ONE,a.ONE),a.useProgram(this.maskProg),a.bindVertexArray(this.vao),a.bindBuffer(a.ARRAY_BUFFER,this.vbo),a.bufferSubData(a.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Yr)),a.uniform2f(this.uMaskCamCenter,r.x,r.y),a.uniform2f(this.uMaskViewportSize,r.viewportWidth,r.viewportHeight),a.uniform1f(this.uMaskZoom,r.zoom),a.uniform1f(this.uMaskTier,p.tierIndex),a.drawArrays(a.TRIANGLES,0,this.vertCount),m++,a.bindFramebuffer(a.FRAMEBUFFER,u),a.viewport(0,0,l,d),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.compProg),a.bindVertexArray(this.compVao),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,this.maskTex),a.uniform2f(this.uCompCamCenter,r.x,r.y),a.uniform2f(this.uCompViewportSize,r.viewportWidth,r.viewportHeight),a.uniform1f(this.uCompZoom,r.zoom),a.uniform1f(this.uCompTier,p.tierIndex),a.uniform1f(this.uCompOpacity,p.opacity),a.uniform1f(this.uCompFade,c),a.drawArrays(a.TRIANGLES,0,3),m++)}return a.bindVertexArray(null),m}dispose(){let{gl:e}=this;this.maskTex&&e.deleteTexture(this.maskTex),this.maskFbo&&e.deleteFramebuffer(this.maskFbo),e.deleteBuffer(this.vbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compVao),e.deleteProgram(this.maskProg),e.deleteProgram(this.compProg)}};var ni={watchtower_ruin:{worldW:150,anchor:[.5,.79],sortBiasY:6},forgotten_iron_mine:{worldW:178,anchor:[.5,.74],sortBiasY:6},abandoned_house:{worldW:168,anchor:[.5,.75],sortBiasY:6},dilapidated_barn:{worldW:172,anchor:[.5,.74],sortBiasY:6},waterhole:{worldW:178,anchor:[.5,.56],sortBiasY:-18},oasis:{worldW:194,anchor:[.5,.67],sortBiasY:4},obelisk:{worldW:102,anchor:[.5,.85],sortBiasY:8},stone_circle:{worldW:180,anchor:[.5,.66],sortBiasY:4},iron_deposit:{worldW:162,anchor:[.5,.75],sortBiasY:6}};function oi(t){return t==="fauna"?null:t==="forgotten_mine"?"forgotten_iron_mine":t in ni?t:null}function Ga(t,e,r){let o=t*374761393+e*668265263|0;for(let i=0;i<r.length;i++)o=Math.imul(o^r.charCodeAt(i),1274126177)+2654435769|0;return o^=o>>>15,o=Math.imul(o,2246822519),o^=o>>>13,o>>>0}function Ua(t,e){let r=t.infrastructure.sprites,o=[];for(let i=1;i<=5;i++){let n=`sites/${e}/${e}_${String(i).padStart(2,"0")}`;r[n]&&o.push(n)}return o}function Oa(t,e){let r=oi(e.family);if(!r)return null;let o=Ua(t,r);if(o.length===0)return null;let i=e.variantIndex!==void 0?(Math.floor(e.variantIndex)%o.length+o.length)%o.length:Ga(e.q,e.r,r)%o.length;return o[i]}function ii(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredSiteIds:s};let u=e.infrastructure.sprites;for(let c of r){let a=o(c.q,c.r);if(a===0)continue;let l=oi(c.family);if(!l)continue;let d=Oa(e,c);if(!d)continue;let h=u[d];if(!h)continue;s.add(c.id);let m=ni[l],g=Ae(c.q,c.r),b=g.x,p=g.y/Ee,_=i?i(b,p)*Ee:0,w=g.y-_,[M,y]=h.sourceSize,E=M>0?y/M:1,k=m.worldW;l==="obelisk"&&(E<1.3?k=152:E<2.1?k=112:k=92);let S=k*E,[R,U]=m.anchor,C=e.shadows.sprites[`site_shadow:${d}`],P=C?{shadowPage:C.page,shadowU0:C.uv[0],shadowV0:C.uv[1],shadowU1:C.uv[2],shadowV1:C.uv[3],shadowRelLeft:C.boundsInSpriteWidth[0]*k,shadowRelTop:C.boundsInSpriteWidth[1]*k,shadowWidth:(C.boundsInSpriteWidth[2]-C.boundsInSpriteWidth[0])*k,shadowHeight:(C.boundsInSpriteWidth[3]-C.boundsInSpriteWidth[1])*k}:{};n.push({x:b,y:w,relLeft:-k*R,relTop:-S*U,width:k,height:S,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:g.y+m.sortBiasY,fogState:a,...P})}return n.sort((c,a)=>c.sortY-a.sortY||c.x-a.x),{sprites:n,coveredSiteIds:s}}var ai=`#version 300 es
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
`,Na=`#version 300 es
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
`,Va=`#version 300 es
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
`,si=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,za=`#version 300 es
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
`,Xa=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function sr(t,e,r,o){let i=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!i||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(i)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let s=t.createProgram();if(!s)throw new Error(`Failed to create ${o} program`);if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(s)}`);return s}var Ya=`#version 300 es
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
`,$a=`#version 300 es
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
`,jr=class{constructor(e){this.instanceData=new Float32Array(16384*16);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=sr(e,ai,Na,"sprite"),this.shadowMaskProg=sr(e,ai,Va,"shadow-mask"),this.compositeProg=sr(e,si,za,"shadow-composite"),this.shoreCompositeProg=sr(e,si,Xa,"shore-composite"),this.surfProg=sr(e,Ya,$a,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),i=e.createBuffer();if(!r||!o||!i)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=64;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let s=(u,c)=>{let a=e.getUniformLocation(u,c);if(!a)throw new Error(`Missing uniform ${c}`);return a};this.spCam=s(this.spriteProg,"u_camCenter"),this.spView=s(this.spriteProg,"u_viewportSize"),this.spZoom=s(this.spriteProg,"u_zoom"),this.spScaleY=s(this.spriteProg,"u_scaleY"),this.spShearX=s(this.spriteProg,"u_shearX"),this.spTime=s(this.spriteProg,"u_time"),this.spWindEnabled=s(this.spriteProg,"u_windEnabled"),this.spCanvasSize=s(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=s(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=s(this.spriteProg,"u_selfShadow"),this.spNaturePolish=s(this.spriteProg,"u_naturePolish"),this.spSpriteSat=s(this.spriteProg,"u_spriteSat"),this.spSpriteBright=s(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=s(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=s(this.spriteProg,"u_colorGradeAll"),this.spDecalPass=s(this.spriteProg,"u_decalPass"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=s(this.shadowMaskProg,"u_camCenter"),this.shView=s(this.shadowMaskProg,"u_viewportSize"),this.shZoom=s(this.shadowMaskProg,"u_zoom"),this.shScaleY=s(this.shadowMaskProg,"u_scaleY"),this.shShearX=s(this.shadowMaskProg,"u_shearX"),this.shTime=s(this.shadowMaskProg,"u_time"),this.shWindEnabled=s(this.shadowMaskProg,"u_windEnabled"),this.shDecalPass=s(this.shadowMaskProg,"u_decalPass"),this.sfCam=s(this.surfProg,"u_camCenter"),this.sfView=s(this.surfProg,"u_viewportSize"),this.sfZoom=s(this.surfProg,"u_zoom"),this.sfTime=s(this.surfProg,"u_time"),this.sfWindEnabled=s(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=s(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),i=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===i)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=s,this.shadowFbo=u,this.shadowW=o,this.shadowH=i}ensureShoreFbo(e,r){let o=Math.max(2,e),i=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===i)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=s,this.shoreFbo=u,this.shoreW=o,this.shoreH=i}renderShadows(e){let{cam:r,sprites:o,fogStates:i,walls:n=[],shadowPages:s,shadowOpacity:u,detailOpacity:c,targetFramebuffer:a=null}=e;if(this.lastHasCrossShadows=!1,u<=.005||c<=.01||s.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:l,instanceData:d}=this;this.ensureShadowFbo(l.canvas.width,l.canvas.height);let h=0,m=0,g=new Array(s.length).fill(0);for(let y=0;y<o.length;y++){let E=o[y];E.shadowPage<0||E.shadowPage>=s.length||i[y]!==0&&g[E.shadowPage]++}for(let y=0;y<n.length;y++){let E=n[y],k=E.shadowPage??-1;k<0||k>=s.length||E.fogState===0||g[k]++}let b=new Array(s.length).fill(0),p=0;for(let y=0;y<s.length;y++)b[y]=p,p+=g[y];if(p===0)return{drawCalls:0,renderedShadows:0};let _=[...b],w=Math.min(p,16384);for(let y=0;y<o.length;y++){let E=o[y],k=E.shadowPage;if(k<0||k>=s.length)continue;let S=i[y];if(S===0)continue;let R=_[k];if(R>=w)continue;_[k]=R+1,h++;let U=E.shadowTier??(E.isMountain?3:0);U>0&&m++;let C=R*16,P=(E.shadowMaxX-E.shadowMinX)*E.width,Q=(E.shadowMaxY-E.shadowMinY)*E.width;d[C]=E.x,d[C+1]=E.y,d[C+2]=E.shadowMinX*E.width,d[C+3]=E.shadowMinY*E.width,d[C+4]=P,d[C+5]=Q,d[C+6]=S===1?c*.65:c,d[C+7]=U,d[C+8]=E.shadowU0,d[C+9]=E.shadowV0,d[C+10]=E.shadowU1,d[C+11]=E.shadowV1,d[C+12]=.5,d[C+13]=0,d[C+14]=0,d[C+15]=0}for(let y=0;y<n.length;y++){let E=n[y],k=E.shadowPage??-1;if(k<0||k>=s.length||E.fogState===0)continue;let S=_[k];if(S>=w)continue;_[k]=S+1,h++,m++;let R=S*16;d[R]=E.x,d[R+1]=E.y,d[R+2]=E.shadowRelLeft??0,d[R+3]=E.shadowRelTop??0,d[R+4]=E.shadowWidth??0,d[R+5]=E.shadowHeight??0,d[R+6]=E.fogState===1?c*.65:c,d[R+7]=2,d[R+8]=E.shadowU0??0,d[R+9]=E.shadowV0??0,d[R+10]=E.shadowU1??0,d[R+11]=E.shadowV1??0,d[R+12]=.5,d[R+13]=0,d[R+14]=0,d[R+15]=0}this.lastHasCrossShadows=m>0,l.bindBuffer(l.ARRAY_BUFFER,this.instanceVbo),l.bufferSubData(l.ARRAY_BUFFER,0,d.subarray(0,w*16)),l.bindFramebuffer(l.FRAMEBUFFER,this.shadowFbo),l.viewport(0,0,this.shadowW,this.shadowH),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.enable(l.BLEND),l.blendEquation(l.MAX),l.blendFunc(l.ONE,l.ONE),l.useProgram(this.shadowMaskProg),l.bindVertexArray(this.vao),l.uniform2f(this.shCam,r.x,r.y),l.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),l.uniform1f(this.shZoom,r.zoom),l.uniform1f(this.shScaleY,1),l.uniform1f(this.shShearX,0),l.uniform1f(this.shTime,0),l.uniform1f(this.shWindEnabled,0),l.uniform1f(this.shDecalPass,0);let M=0;l.activeTexture(l.TEXTURE0);for(let y=0;y<s.length;y++){let E=b[y],k=Math.min(_[y],w),S=k-E;S<=0||(l.bindTexture(l.TEXTURE_2D,s[y]),E===0||l.bufferSubData(l.ARRAY_BUFFER,0,d.subarray(E*16,k*16)),l.drawArraysInstanced(l.TRIANGLES,0,6,S),M++)}return l.bindFramebuffer(l.FRAMEBUFFER,a),l.viewport(0,0,l.canvas.width,l.canvas.height),l.blendEquation(l.FUNC_ADD),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),l.useProgram(this.compositeProg),l.bindVertexArray(this.compositeVao),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.shadowTex),l.uniform1f(this.compOpacity,u),l.drawArrays(l.TRIANGLES,0,3),M++,{drawCalls:M,renderedShadows:h}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:i,naturePages:n,walls:s=[],infraPages:u=[],detailOpacity:c,objectScaleY:a,objectShearX:l,shadowOpacity:d=.54,mountainShadowOnSprites:h=!0,spriteSelfShadow:m=.68,naturePolish:g=.4,spriteSaturation:b=1,spriteBrightness:p=1,spriteContrast:_=1,timeSec:w=0,windAnimation:M=!0,isDecalPass:y=!1}=e,E=o.length>0&&n.length>0,k=s.length>0&&u.length>0;if(c<=.01||!E&&!k)return{drawCalls:0,renderedSprites:0};let{gl:S,instanceData:R}=this;S.enable(S.BLEND),S.blendEquation(S.FUNC_ADD),S.blendFunc(S.ONE,S.ONE_MINUS_SRC_ALPHA),S.useProgram(this.spriteProg),S.bindVertexArray(this.vao),S.bindBuffer(S.ARRAY_BUFFER,this.instanceVbo),S.uniform2f(this.spCam,r.x,r.y),S.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),S.uniform1f(this.spZoom,r.zoom),S.uniform1f(this.spScaleY,a),S.uniform1f(this.spShearX,l),S.uniform1f(this.spTime,w),S.uniform1f(this.spWindEnabled,M?1:0),S.uniform2f(this.spCanvasSize,S.canvas.width,S.canvas.height);let U=h&&this.lastHasCrossShadows&&this.shadowTex!==null?d:0;S.uniform1f(this.spMtnShadowOpacity,U),S.uniform1f(this.spSelfShadow,m),S.uniform1f(this.spNaturePolish,g),S.uniform1f(this.spSpriteSat,b),S.uniform1f(this.spSpriteBright,p),S.uniform1f(this.spSpriteContrast,_),S.uniform1f(this.spColorGradeAll,1),S.uniform1f(this.spDecalPass,y?1:0);let C=n[0]??u[0];S.activeTexture(S.TEXTURE8),S.bindTexture(S.TEXTURE_2D,this.shadowTex??C);let P=0,Q=0,z=0,K=[],W=new Map,N=()=>{if(z<=0)return;for(let I=0;I<K.length;I++)S.activeTexture(S.TEXTURE0+I),S.bindTexture(S.TEXTURE_2D,K[I]);let D=K[0]??C;for(let I=K.length;I<8;I++)S.activeTexture(S.TEXTURE0+I),S.bindTexture(S.TEXTURE_2D,D);S.bufferSubData(S.ARRAY_BUFFER,0,R.subarray(0,z*16)),S.drawArraysInstanced(S.TRIANGLES,0,6,z),P++,Q+=z,z=0,K=[],W.clear()},ee=D=>{let I=W.get(D);return I===void 0?((K.length>=8||z>=16384)&&N(),I=K.length,K.push(D),W.set(D,I)):z>=16384&&(N(),I=0,K.push(D),W.set(D,0)),I},Z=0,x=0,F=E?o.length:0,T=k?s.length:0;for(;Z<F||x<T;){let D=!1;if(Z>=F)D=!0;else if(x<T){let I=o[Z].sortY??o[Z].y;s[x].sortY<I&&(D=!0)}if(D){let I=s[x++];if(I.fogState===0||I.page<0||I.page>=u.length)continue;let f=ee(u[I.page]),v=(I.fogState===1?1:0)|4|16,L=z*16;R[L]=I.x,R[L+1]=I.y,R[L+2]=I.relLeft,R[L+3]=I.relTop,R[L+4]=I.width,R[L+5]=I.height,R[L+6]=c,R[L+7]=f*256+v,R[L+8]=I.u0,R[L+9]=I.v0,R[L+10]=I.u1,R[L+11]=I.v1,R[L+12]=.5,R[L+13]=0,R[L+14]=0,R[L+15]=0,z++}else{let I=Z++,f=i[I];if(f===0)continue;let v=o[I];if(v.page<0||v.page>=n.length)continue;let L=ee(n[v.page]),H=v.shadowTier??(v.isMountain?3:0),O=v.selfShadeWeight??(v.isGroundDecal?0:v.isMountain?.52:.72),X=Math.max(0,Math.min(7,Math.round(O*7))),$=(f===1?1:0)|(H&3)<<3|(X&7)<<5;v.isMountain||($|=2,v.isSnowFamily&&($|=4));let j=!!v.flipX,J=j?1-v.anchorX:v.anchorX,V=z*16;R[V]=v.x,R[V+1]=v.y,R[V+2]=-v.width*J,R[V+3]=-v.height*v.anchorY,R[V+4]=v.width,R[V+5]=v.height,R[V+6]=c,R[V+7]=L*256+$,R[V+8]=j?v.u1:v.u0,R[V+9]=v.v0,R[V+10]=j?v.u0:v.u1,R[V+11]=v.v1,R[V+12]=v.tintHash??.5,R[V+13]=y?v.rotationRad??0:v.swayAmp??0,R[V+14]=y?v.terrainTintRgb??0:0,R[V+15]=y?v.terrainTintMix??0:0,z++}}return N(),{drawCalls:P,renderedSprites:Q}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:i,infraPages:n,projectY:s,opacityScale:u=1,targetFramebuffer:c=null}=e;if(o.length===0||n.length===0||u<=.02)return{drawCalls:0,renderedShorelines:0};let{gl:a,instanceData:l}=this;this.ensureShoreFbo(a.canvas.width,a.canvas.height),a.bindFramebuffer(a.FRAMEBUFFER,this.shoreFbo),a.viewport(0,0,this.shoreW,this.shoreH),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.enable(a.BLEND),a.blendEquation(a.MAX),a.blendFunc(a.ONE,a.ONE),a.useProgram(this.spriteProg),a.bindVertexArray(this.vao),a.bindBuffer(a.ARRAY_BUFFER,this.instanceVbo),a.uniform2f(this.spCam,r.x,r.y),a.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),a.uniform1f(this.spZoom,r.zoom),a.uniform1f(this.spScaleY,1),a.uniform1f(this.spShearX,0),a.uniform1f(this.spTime,0),a.uniform1f(this.spWindEnabled,0),a.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),a.uniform1f(this.spMtnShadowOpacity,0),a.uniform1f(this.spSelfShadow,0),a.uniform1f(this.spNaturePolish,0),a.uniform1f(this.spSpriteSat,1),a.uniform1f(this.spSpriteBright,1),a.uniform1f(this.spSpriteContrast,1),a.uniform1f(this.spColorGradeAll,0),a.uniform1f(this.spDecalPass,0);let d=Math.min(n.length,8);for(let w=0;w<8;w++)a.activeTexture(a.TEXTURE0+w),a.bindTexture(a.TEXTURE_2D,n[w<d?w:0]);a.activeTexture(a.TEXTURE8),a.bindTexture(a.TEXTURE_2D,n[0]);let h=0,m=0,g=0,b=()=>{g<=0||(a.bufferSubData(a.ARRAY_BUFFER,0,l.subarray(0,g*16)),a.drawArraysInstanced(a.TRIANGLES,0,6,g),h++,m+=g,g=0)},p=512,_=512*s;for(let w=0;w<o.length;w++){let M=i[w];if(M===0)continue;let y=o[w];if(y.page<0||y.page>=d)continue;g>=16384&&b();let E=g*16;l[E]=y.x,l[E+1]=y.y,l[E+2]=-p*.5,l[E+3]=-_*.5,l[E+4]=p,l[E+5]=_,l[E+6]=(y.alpha??1)*u,l[E+7]=y.page*256+4+24+(M===1?1:0),l[E+8]=y.u0,l[E+9]=y.v0,l[E+10]=y.u1,l[E+11]=y.v1,l[E+12]=.5,l[E+13]=0,l[E+14]=0,l[E+15]=0,g++}return b(),a.bindFramebuffer(a.FRAMEBUFFER,c),a.viewport(0,0,a.canvas.width,a.canvas.height),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),m>0&&(a.useProgram(this.shoreCompositeProg),a.bindVertexArray(this.compositeVao),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,this.shoreTex),a.drawArrays(a.TRIANGLES,0,3),h++),{drawCalls:h,renderedShorelines:m}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:i,detailOpacity:n,timeSec:s,windAnimation:u}=e;if(n<=.02||o.length===0)return 0;let{gl:c,instanceData:a}=this,l=0;for(let d=0;d<o.length;d++){let h=o[d];if(!h.isWaterBoulder)continue;let m=i[d];if(m===0)continue;if(l>=16384)break;let g=h.width*.68,b=h.width*.25,p=l*16;a[p]=h.x,a[p+1]=h.y-h.height*.04,a[p+2]=-g,a[p+3]=-b,a[p+4]=g*2,a[p+5]=b*2,a[p+6]=n,a[p+7]=m===1?1:0,a[p+8]=0,a[p+9]=0,a[p+10]=0,a[p+11]=0,a[p+12]=h.tintHash??.5,a[p+13]=0,a[p+14]=0,a[p+15]=0,l++}return l===0?0:(c.enable(c.BLEND),c.blendEquation(c.FUNC_ADD),c.blendFunc(c.ONE,c.ONE_MINUS_SRC_ALPHA),c.useProgram(this.surfProg),c.bindVertexArray(this.vao),c.bindBuffer(c.ARRAY_BUFFER,this.instanceVbo),c.uniform2f(this.sfCam,r.x,r.y),c.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),c.uniform1f(this.sfZoom,r.zoom),c.uniform1f(this.sfTime,s),c.uniform1f(this.sfWindEnabled,u?1:0),c.bufferSubData(c.ARRAY_BUFFER,0,a.subarray(0,l*16)),c.drawArraysInstanced(c.TRIANGLES,0,6,l),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var Bn=new Set(["ocean","coastal_water","coastal_waters","coast","stormy_ocean","deep_water","lake"]),li=new Set(["jungle","rainforest"]),ci=new Set(["taiga","boreal_forest"]),ui=new Set(["forest","deciduous_forest","woodland","dense_forest"]),di=new Set(["desert","sand_desert","sandy_desert","semi_desert","badlands","sandy_badlands","rocky_badlands"]),fi=new Set(["snowfields","frozen_tundra","tundra"]),hi=new Set(["swamp","marsh","marshland","moor","bog","wetland"]);function mi(t){let e=t.terrainId;return e==="icy_ocean"||Bn.has(e)?7:t.reliefClass==="mountain"||e==="mountain"||e==="alpine"||e==="high_mountains"?3:fi.has(e)?5:di.has(e)||e==="dry_plains"||e==="steppe"||e==="savanna"?4:hi.has(e)?6:li.has(e)||ci.has(e)||ui.has(e)||t.forestClass==="dense_forest"||t.forestDensity>=.55?1:t.reliefClass==="hills"||e==="hills"||e==="highland"?2:0}function Ka(t){let e=t.terrainId;return e==="icy_ocean"?"icy_sea":Bn.has(e)?"sea":t.reliefClass==="mountain"||e==="mountain"||e==="alpine"||e==="high_mountains"?"mountains":hi.has(e)?"wetland":li.has(e)?"jungle":ci.has(e)?"taiga":fi.has(e)?"snow":di.has(e)?"desert":ui.has(e)||t.forestClass==="dense_forest"||t.forestDensity>=.58?"forest":t.reliefClass==="hills"||e==="hills"||e==="highland"?"hills":"plains"}function cr(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function Zr(t,e,r){return cr(t,e,r)/4294967295}var lr={sea:{prefixes:["Silber","Azur","Sturm","Kronen","Nebel","Bernstein","K\xF6nigs","West","Ost","S\xFCd","Wellen","Handels","Klippen","Morgen","Tiefen","Segel"],largeSuffixes:["meer","see","ozean","wasser"],smallSuffixes:["bucht","sund","golf","meerenge"],standalone:["Meer der St\xFCrme","Spiegelndes Meer","Altes Handelsmeer","Golf der Kronen","Stille See","Bucht der M\xF6wen"],largeThreshold:64,minHexes:16,priorityBoost:1.35},icy_sea:{prefixes:["Eis","Frost","Gletscher","Nord","Treibeis","Schnee","Wei\xDF","Winter","K\xE4lte","Raureif"],largeSuffixes:["meer","eismeer","see"],smallSuffixes:["sund","bucht","fjord","wasser"],standalone:["N\xF6rdliches Eismeer","Schweigende Eisseen","Frostige Durchfahrt","Bucht der Gletscher"],largeThreshold:45,minHexes:12,priorityBoost:1.25},mountains:{prefixes:["Grau","Eisen","Silber","Nebel","Drachen","Stein","Donner","Frost","Raben","Adler","Schatten","Sturm","Wolken","Felsen","Kalt","Hoch"],largeSuffixes:["gebirge","kamm","grat","massiv","r\xFCcken"],smallSuffixes:["gipfel","spitzen","fels","joch","zinnen"],standalone:["Graue Zinnen","R\xFCckgrat der Welt","Z\xE4hne des Nordens","Hohe Nebelspitzen","Eiserner Wall"],largeThreshold:22,minHexes:7,priorityBoost:1.4},forest:{prefixes:["Gr\xFCn","Tiefen","Eichen","Schatten","Hirsch","K\xF6nigs","Dornen","Nebel","Moos","Silber","Buchen","Farn","Elfen","J\xE4ger","Linden","Dunkel"],largeSuffixes:["wald","forst","mark","dickicht"],smallSuffixes:["hain","holz","geh\xF6lz","grund"],standalone:["Alter K\xF6nigsforst","Fl\xFCsternder Wald","Gr\xFCne Tiefen","Hain der Hirsche","Dichter Schattenforst"],largeThreshold:28,minHexes:8,priorityBoost:1.15},jungle:{prefixes:["Smaragd","Regen","Ranken","Farn","Gr\xFCn","Dampf","Wild","Palmen","Tropen","Moos","Nebel","Fluss"],largeSuffixes:["urwald","dickicht","dschungel","wildnis"],smallSuffixes:["forst","hain","gr\xFCn","tal"],standalone:["Smaragddickicht","Wilder Regenforst","Gr\xFCnes Labyrinth","Tiefes Rankenland"],largeThreshold:24,minHexes:8,priorityBoost:1.18},taiga:{prefixes:["Nord","Tannen","Winter","Kiefern","Grau","B\xE4ren","Fichten","Frost","Wolfs","Harz","Kalt","Boreal"],largeSuffixes:["forst","taiga","wald","mark"],smallSuffixes:["grund","h\xF6h","tann","holz"],standalone:["N\xF6rdlicher Tannenforst","Wolfs-Taiga","Graue Fichtenweiten","Stiller Winterwald"],largeThreshold:26,minHexes:8,priorityBoost:1.12},desert:{prefixes:["Sonnen","Gold","Glut","Sand","Ocker","Staub","Feuer","D\xFCrre","S\xFCd","W\xFCsten","Kupfer","Aschen","Rot","Karg"],largeSuffixes:["w\xFCste","\xF6de","steppe","weite"],smallSuffixes:["d\xFCnen","sand","tal","senke"],standalone:["Gro\xDFe Sonnenw\xFCste","Goldene D\xFCnen","Flirrende Glut\xF6de","Staubiges S\xFCdland","Ockerfarbene Weiten"],largeThreshold:26,minHexes:8,priorityBoost:1.22},snow:{prefixes:["Frost","Wei\xDF","Schnee","Nord","Winter","Eis","K\xE4lte","Gletscher","Reif","Sturm","Silber","Schneesturm"],largeSuffixes:["weiten","mark","tundra","\xF6de","land"],smallSuffixes:["feld","grund","kuppe","senke"],standalone:["Ewige Schneefelder","Hohe Frostmark","Wei\xDFe Nordweiten","Eisige Tundra","Land des Raureifs"],largeThreshold:28,minHexes:8,priorityBoost:1.2},wetland:{prefixes:["Nebel","Schilf","Schwarz","Binsen","Weiden","Grau","Torf","Frosch","Moor","Dunkel","T\xFCmpel","Brack"],largeSuffixes:["moor","marsch","sumpf","bruch"],smallSuffixes:["ried","lache","grund","senke"],standalone:["Gro\xDFes Nebelmoor","Schilfige Marsch","Stilles Weidenried","Schwarzer Bruch"],largeThreshold:18,minHexes:6,priorityBoost:1.1},hills:{prefixes:["Wind","Stein","Kupfer","Wacht","Heide","Sonnen","Hoch","Falken","Gr\xFCn","Klippen","Fels","Morgen"],largeSuffixes:["hochland","h\xF6hen","h\xFCgel","kamm"],smallSuffixes:["kuppen","r\xFCcken","h\xE4nge","b\xFChl"],standalone:["Windige H\xF6hen","Altes Hochland","Falkenh\xFCgel","Steinige Heide"],largeThreshold:22,minHexes:10,priorityBoost:.96},plains:{prefixes:["Gr\xFCn","Weizen","Sonnen","Kron","Weit","S\xFCd","Gold","Auen","Grenz","Mittel","Korn","Wiesen","Frei","Tal","Friedens"],largeSuffixes:["mark","land","ebene","steppe","auen"],smallSuffixes:["feld","grund","weide","flur"],standalone:["Goldene Ebene","Weites Kronland","Gr\xFCne Auen","Sonnige Grenzmark","Fruchtbare Weiten"],largeThreshold:34,minHexes:14,priorityBoost:.92}};function ja(t){let{kind:e,hexCount:r,seedHash:o,usedNames:i}=t,n=lr[e],u=r>=n.largeThreshold?n.largeSuffixes:n.smallSuffixes;for(let d=0;d<12;d++){let h=cr(o,d*31+7,2654435761),m=cr(o^1367130551,d*47+13,2246822507),g;if(d===0&&h%7===0&&n.standalone.length>0)g=n.standalone[m%n.standalone.length];else{let b=n.prefixes[h%n.prefixes.length],p=u[m%u.length];if(b.toLowerCase().includes(p.toLowerCase().slice(0,4))||p.toLowerCase().includes(b.toLowerCase().slice(0,4))){let _=u[(m+1)%u.length];g=`${b}${_}`}else g=`${b}${p}`}if(!i||!i.has(g))return i?.add(g),g}let c=n.prefixes[o%n.prefixes.length],a=u[(o>>>8)%u.length],l=`${c}${a}`;return i?.add(l),l}var ft=8,Vt=104;function qn(t,e,r){let o=At(t,6),i=Math.floor(o.minQ/ft)*ft-ft,n=Math.ceil(o.maxQ/ft)*ft+ft,s=Math.floor(o.minR/ft)*ft-ft,u=Math.ceil(o.maxR/ft)*ft+ft;if(n-i+1>Vt){let c=Math.floor((i+n)/2),a=Math.floor(Vt/2);i=c-a,n=i+Vt-1}if(u-s+1>Vt){let c=Math.floor((s+u)/2),a=Math.floor(Vt/2);s=c-a,u=s+Vt-1}return{key:`${r}|${e}|${i},${n},${s},${u}`,minQ:i,maxQ:n,minR:s,maxR:u}}function pi(t){let{cam:e,lookupHex:r,seedInt:o,dataRevision:i}=t,n=qn(e,i,o),{minQ:s,maxQ:u,minR:c,maxR:a}=n,l=u-s+1,d=a-c+1,h=l*d,m=new Array(h),g=new Array(h),b=[];for(let k=0;k<d;k++){let S=c+k,R=k*l;for(let U=0;U<l;U++){let C=s+U,P=r(C,S),Q=R+U;if(!P||P.fogState===0){m[Q]=void 0,g[Q]=null;continue}m[Q]=P;let z=Ka(P);g[Q]=z;let K=Zr(C*37,S*73,o^16807),W=Zr(C*89,S*29,o^29377),N=Ae(C,S),ee=(W-.5)*90,Z=(Zr(C*19,S*53,o^6627)-.5)*65,x=P.fogState===1?1:2;if(z==="mountains")K<.78&&b.push({kind:"peak",x:N.x+ee*.45,y:N.y+Z*.4,scale:.82+W*.44,seed:W,fogState:x});else if(z==="hills")K<.34&&b.push({kind:"hill",x:N.x+ee*.5,y:N.y+Z*.45,scale:.8+W*.35,seed:W,fogState:x});else if(z==="forest"||z==="taiga"||z==="jungle")K<.44&&b.push({kind:z,x:N.x+ee*.55,y:N.y+Z*.5,scale:.8+W*.42,seed:W,fogState:x});else if(z==="desert")K<.24&&b.push({kind:"dune",x:N.x+ee*.5,y:N.y+Z*.4,scale:.85+W*.35,seed:W,fogState:x});else if((z==="sea"||z==="icy_sea")&&K<.085){let F=!1;for(let T=0;T<6;T++){let[D,I]=Re[T],f=r(C+D,S+I);if(f&&f.fogState>0&&f.terrainId!=="icy_ocean"&&!Bn.has(f.terrainId)){F=!0;break}}F||b.push({kind:"wave",x:N.x+ee*.4,y:N.y+Z*.4,scale:.85+W*.38,seed:W,fogState:x})}}}let p=new Uint8Array(h),_=new Int32Array(h),w=[];for(let k=0;k<h;k++){if(p[k])continue;let S=g[k];if(!S)continue;p[k]=1;let R=0,U=0;_[U++]=k;let C=[];for(;R<U;){let P=_[R++];C.push(P);let Q=Math.floor(P/l),z=P-Q*l;for(let K=0;K<6;K++){let[W,N]=Re[K],ee=z+W,Z=Q+N;if(ee<0||ee>=l||Z<0||Z>=d)continue;let x=Z*l+ee;p[x]||g[x]!==S||(p[x]=1,_[U++]=x)}}C.length>=lr[S].minHexes&&w.push({kind:S,indices:C})}w.sort((k,S)=>S.indices.length*lr[S.kind].priorityBoost-k.indices.length*lr[k.kind].priorityBoost);let M=new Set,y=[],E=Math.min(w.length,42);for(let k=0;k<E;k++){let S=w[k],{kind:R,indices:U}=S,C=U.length,P=0,Q=0,z=0,K=4294967295,W=0,N=0,ee=new Float64Array(C),Z=new Float64Array(C),x=new Uint8Array(C);for(let Y=0;Y<C;Y++){let ne=U[Y],B=Math.floor(ne/l),A=ne-B*l,q=s+A,oe=c+B,ae=Ae(q,oe);ee[Y]=ae.x,Z[Y]=ae.y,P+=ae.x,Q+=ae.y;let re=m[ne];re&&re.fogState===2&&z++;let le=!0;for(let de=0;de<6;de++){let[_e,Be]=Re[de],He=A+_e,tt=B+Be;if(He<0||He>=l||tt<0||tt>=d||g[tt*l+He]!==R){le=!1;break}}x[Y]=le?1:0;let we=cr(q*19349663,oe*83492791,o^739982445);we<K&&(K=we,W=q,N=oe)}let F=P/C,T=Q/C,D=F,I=T,f=1/0,v=1/0,L=0,H=-1;for(let Y=0;Y<C;Y++){let ne=ee[Y]-F,B=Z[Y]-T,A=ne*ne+B*B;A<v&&(v=A,L=Y),x[Y]&&A<f&&(f=A,H=Y)}if(H>=0){let Y=ee[H],ne=Z[H];f<57600?(D=F*.55+Y*.45,I=T*.55+ne*.45):(D=Y,I=ne)}else D=ee[L],I=Z[L];let O=ut(D,I,e),X=Math.min(92,e.viewportWidth*.14),$=52,j=96;if(!(O.x>=X&&O.x<=e.viewportWidth-X&&O.y>=$&&O.y<=e.viewportHeight-j)&&C>=14){let Y=0,ne=0,B=0;for(let A=0;A<C;A++){let q=ut(ee[A],Z[A],e);q.x>=X&&q.x<=e.viewportWidth-X&&q.y>=$&&q.y<=e.viewportHeight-j&&(Y+=ee[A],ne+=Z[A],B++)}if(B>=6){let A=Y/B,q=ne/B,oe=1/0,ae=-1,re=1/0,le=-1;for(let we=0;we<C;we++){let de=ut(ee[we],Z[we],e);if(de.x<X||de.x>e.viewportWidth-X||de.y<$||de.y>e.viewportHeight-j)continue;let _e=ee[we]-A,Be=Z[we]-q,He=_e*_e+Be*Be;He<re&&(re=He,le=we),x[we]&&He<oe&&(oe=He,ae=we)}ae>=0?(D=ee[ae],I=Z[ae]):le>=0&&(D=ee[le],I=Z[le])}}let V=0,se=0,ue=0;for(let Y=0;Y<C;Y++){let ne=ee[Y]-D,B=Z[Y]-I;V+=ne*ne,se+=B*B,ue+=ne*B}V/=C,se/=C,ue/=C;let te=V+se,be=V-se,ve=Math.sqrt(Math.max(0,be*be*.25+ue*ue)),he=Math.max(1,te*.5+ve),me=Math.max(1,te*.5-ve),xe=(he-me)/(he+me),Me=Math.sqrt(he)*3.1,ye=.5*Math.atan2(2*ue,be);ye>Math.PI*.5&&(ye-=Math.PI),ye<-Math.PI*.5&&(ye+=Math.PI);let Te=Math.max(-.52,Math.min(.52,ye)),Se=xe<.22?Te*.25:Te*Math.min(1,xe*1.45),Ie=(Zr(W,N,o^1597463007)-.5)*.22,Oe=lr[R],Ue=C>=Oe.largeThreshold*1.45?3:C>=Oe.largeThreshold*.72?2:1,De=cr(W*131071,N*524287,o^R.charCodeAt(0)*997),G=ja({kind:R,hexCount:C,seedHash:De,usedNames:M});y.push({id:`${R}:${W},${N}`,kind:R,name:G,x:D,y:I,hexCount:C,spanWorld:Me,angleRad:Se,arcBend:Ie,tier:Ue,isWater:R==="sea"||R==="icy_sea",fogState:z>0?2:1})}return{windowKey:n.key,regions:y,stamps:b}}var wt=256,Za=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,Qa=`#version 300 es
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
uniform float u_strategicBlend;// 0.0 = living 2.5D detail, 1.0 = medieval parchment atlas

uniform sampler2DArray u_terrainArray;
uniform usampler2D u_cellData;     // R=terrainLayer, G=unused, B=fog(0/1/2), A=flags (bit0=water, bit1=snowNoBeach, bit2=icyWater)
uniform sampler2D u_surfaceField;  // R=height/RELIEF_MAX_H, G=(shade-0.52)/0.96, B=organicForestMask, A=landMask

const float HEX_W = ${256 .toFixed(4)};
const float HEX_R = ${Je.toFixed(6)};
const float PROJ_Y = ${Ee.toFixed(4)};
const float ROW_STEP = ${(1.5*Je).toFixed(6)};
const float TEX_WORLD_SIZE = 256.0;
const float WATER_HEX_COVER = ${(2*Je).toFixed(4)}; // 295.603 (autotile.js:87)
const float RELIEF_MAX_H = ${Mr.toFixed(2)};

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
  float stratForestSum = 0.0;
  float stratMtnSum = 0.0;
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
      if (cDat[k].g == 1u) stratForestSum += w;
      if (cDat[k].g == 3u) stratMtnSum += w;
      mixWeightSum += w;
    }
  }

  // Fallback to home cell if pixel lies right on an isolated known cell edge
  vec3 knownColor = vec3(0.0);
  float coastalFrac = 0.0;
  float stratForestFrac = 0.0;
  float stratMtnFrac = 0.0;
  if (mixWeightSum > 0.001) {
    knownColor = terrainSum / mixWeightSum;
    coastalFrac = clamp(coastalWeightSum / mixWeightSum, 0.0, 1.0);
    stratForestFrac = clamp(stratForestSum / mixWeightSum, 0.0, 1.0);
    stratMtnFrac = clamp(stratMtnSum / mixWeightSum, 0.0, 1.0);
  } else if (homeCell.b > 0u) {
    knownColor = sampleHexTerrain(homeCell, uPos, homeCenter, dUdx, dUdy);
    coastalFrac = ((homeCell.a & 8u) != 0u) ? 1.0 : 0.0;
    stratForestFrac = homeCell.g == 1u ? 1.0 : 0.0;
    stratMtnFrac = homeCell.g == 3u ? 1.0 : 0.0;
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
  float stratShoreDist = 999.0;
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
    float organicCoastShape = max(arcticWeight, u_strategicBlend * 0.96);

    if (organicCoastShape > 0.002) {
      // Smoothly scale organic fjord/cape warp so Detail warm coasts stay 100% unchanged while
      // Arctic coasts and Strategic Parchment coastlines curve naturally without 60-deg hex facets!
      float warpAmp = mix(18.0, 26.0, u_strategicBlend);
      float awX = autotileSmoothField(uPos * 0.64) * warpAmp
                + autotileSmoothField(uPos * 1.75 + vec2(31.7, -19.3)) * 8.5;
      float awY = autotileSmoothField(uPos * 0.64 + vec2(-43.1, 27.9)) * warpAmp
                + autotileSmoothField(uPos * 1.75 + vec2(-14.2, 53.6)) * 8.5;
      vec2 arcticPos = uPos + vec2(awX, awY) * organicCoastShape;
      const float invTwoSig2 = 1.0 / (2.0 * 64.0 * 64.0);
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

        // Unified C0-continuous signed coastline distance: morphs seamlessly from Voronoi shore -> organic fjord/cape!
        float sdWarm = (homeIsWater ? -coastDist : coastDist) + organicEdge;
        float sdOrganic = (landFrac - 0.45) * 148.0;
        float sdCoast = mix(sdWarm, sdOrganic, organicCoastShape);
        stratShoreDist = abs(sdCoast);

        float coastSoft = mix(7.5, mix(17.5, 11.5, u_strategicBlend * (1.0 - arcticWeight)), organicCoastShape);
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
      stratShoreDist = max(0.0, effDist);
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
  if (effectiveWater && u_windEnabled > 0.5 && normKnown > 0.05 && u_strategicBlend < 0.95) {
    float waveFade = 1.0 - u_strategicBlend;
    float icyDamp = ((homeCell.a & 4u) != 0u) ? 0.30 : mix(1.0, 0.42, coastArcticBlend);
    float w1 = sin(uPos.x * 0.042 + uPos.y * 0.028 + u_time * 1.45);
    float w2 = cos(uPos.x * 0.027 - uPos.y * 0.051 + u_time * 1.05);
    float w3 = sin(uPos.x * 0.078 - uPos.y * 0.064 - u_time * 1.85);
    float shimmer = w1 * w2 * 0.72 + w3 * 0.28;

    // Coastal water breathes noticeably livelier than deep calm ocean (smooth Voronoi coastalFrac!)
    float coastBoost = mix(1.0, 2.35, coastalFrac) * icyDamp * waveFade;
    float glint = pow(clamp(shimmer * 0.5 + 0.5, 0.0, 1.0), 3.2);
    vec3 causticTint = mix(vec3(0.032, 0.046, 0.052), vec3(0.085, 0.145, 0.150), coastalFrac);
    knownColor = knownColor * (1.0 + shimmer * 0.042 * coastBoost)
               + causticTint * glint * (0.45 + 0.95 * coastalFrac) * icyDamp * waveFade;

    // Rhythmic gently lapping surf bands rolling shoreward across shallow warm coastal water
    if (warmCoastDist < 62.0 && icyDamp > 0.38) {
      float shoreEnv = smoother5(1.0 - warmCoastDist / 62.0) * (1.0 - coastArcticBlend * 0.72) * waveFade;
      float wNoise = autotileSmoothField(uPos * 0.85 + vec2(u_time * 0.14, -u_time * 0.10)) * 5.2;
      float wavePhase = (warmCoastDist + wNoise) * 0.24 + u_time * 2.25;
      float crest = pow(max(0.0, sin(wavePhase)), 4.0);
      float innerLap = pow(max(0.0, sin(wavePhase * 0.55 + 1.3)), 3.0) * smoother5(1.0 - warmCoastDist / 26.0);
      float foamStrength = clamp((crest * 0.24 + innerLap * 0.28) * shoreEnv, 0.0, 0.42);
      knownColor = mix(knownColor, vec3(0.84, 0.94, 0.94), foamStrength);
    }
    knownColor = clamp(knownColor, 0.0, 1.0);
  }

  // Medieval Hand-Drawn Cartographic Parchment Atlas Shader (smoothly engages at Strategic Zoom!)
  if (u_strategicBlend > 0.005 && normKnown > 0.01) {
    float pFine = autotileSmoothField(uPos * 0.75 + vec2(17.3, -29.1));
    float pCoarse = autotileSmoothField(uPos * 0.16 + vec2(-41.2, 13.7));
    float paperTone = 0.955 + (pCoarse * 0.58 + pFine * 0.42) * 0.085;
    vec3 vellumBase = vec3(0.90, 0.84, 0.71);
    vec3 sepiaInk = vec3(0.20, 0.14, 0.09);

    vec3 paperCol;
    if (effectiveWater) {
      // Antique Prussian-blue & aged turquoise-vellum nautical sea palette
      bool isIcy = (homeCell.a & 4u) != 0u;
      vec3 deepSea = isIcy ? vec3(0.55, 0.67, 0.74) : vec3(0.24, 0.42, 0.51);
      vec3 shallowSea = isIcy ? vec3(0.67, 0.77, 0.82) : vec3(0.43, 0.61, 0.64);
      float shelfBlend = clamp(coastalFrac * 0.78 + smoother5(1.0 - min(stratShoreDist, 88.0) / 88.0) * 0.55, 0.0, 1.0);
      vec3 atlasSea = mix(deepSea, shallowSea, shelfBlend);
      paperCol = mix(knownColor, atlasSea, 0.74) * paperTone;

      // Hand-engraved copperplate shoreline outline + 3 crisp concentric sea-ripple contours!
      float penW = max(5.2, 1.55 / max(0.08, u_zoom));
      float inkEdge = 1.0 - smoothstep(penW * 0.42, penW * 1.38, stratShoreDist);
      paperCol = mix(paperCol, sepiaInk, inkEdge * 0.68);

      if (stratShoreDist > penW * 0.9 && stratShoreDist < 126.0) {
        float wMod = stratShoreDist + pFine * 4.5;
        float r1 = exp(-pow((wMod - 28.0) / max(3.4, penW * 0.50), 2.0)) * 0.42;
        float r2 = exp(-pow((wMod - 60.0) / max(4.0, penW * 0.58), 2.0)) * 0.29;
        float r3 = exp(-pow((wMod - 96.0) / max(4.6, penW * 0.66), 2.0)) * 0.17;
        float ripple = clamp(r1 + r2 + r3, 0.0, 0.46);
        paperCol = mix(paperCol, vec3(0.11, 0.21, 0.28), ripple);
      }

      // Subtle antique nautical latitude/longitude + 45-deg rhumb hairlines across open sea
      if (stratShoreDist > 38.0) {
        float openFade = smoothstep(38.0, 92.0, stratShoreDist);
        float gridPx = 1.05 / max(0.08, u_zoom);
        float gx = abs(mod(uPos.x + 768.0, 1536.0) - 768.0);
        float gy = abs(mod(uPos.y + 768.0, 1536.0) - 768.0);
        float orthoLine = max(
          1.0 - smoothstep(gridPx * 0.5, gridPx * 1.5, gx),
          1.0 - smoothstep(gridPx * 0.5, gridPx * 1.5, gy)
        );
        float d1 = abs(mod((uPos.x + uPos.y) * 0.7071 + 1536.0, 3072.0) - 1536.0);
        float d2 = abs(mod((uPos.x - uPos.y) * 0.7071 + 1536.0, 3072.0) - 1536.0);
        float rhumbLine = max(
          1.0 - smoothstep(gridPx * 0.45, gridPx * 1.35, d1),
          1.0 - smoothstep(gridPx * 0.45, gridPx * 1.35, d2)
        );
        float chartGrid = clamp(orthoLine * 0.17 + rhumbLine * 0.11, 0.0, 0.22) * openFade;
        paperCol = mix(paperCol, vec3(0.80, 0.75, 0.60), chartGrid);
      }
    } else {
      // Warm hand-tinted medieval watercolor & vellum parchment land atlas
      float baseLuma = dot(knownColor, vec3(0.299, 0.587, 0.114));
      vec3 watercolor = mix(vec3(baseLuma), knownColor, 0.62);
      // Warm parchment harmonization while keeping forests, deserts, snowfields & mountains vividly distinct
      paperCol = mix(watercolor, watercolor * 0.68 + vellumBase * 0.34, 0.54) * paperTone;

      // Subtle deeper sage-emerald watercolor wash for great forest belts
      if (stratForestFrac > 0.05) {
        vec3 forestWash = paperCol * vec3(0.84, 0.91, 0.79);
        paperCol = mix(paperCol, forestWash, stratForestFrac * 0.52);
      }

      // Sculpted warm-parchment / sepia-ink ridge emphasis for mountain chains
      if (stratMtnFrac > 0.05) {
        vec3 mtnWash = mix(paperCol * vec3(0.84, 0.77, 0.67), vec3(0.46, 0.39, 0.32), 0.30);
        paperCol = mix(paperCol, mtnWash, stratMtnFrac * 0.68);
      }

      // Delicate sepia topographic contour rings following the real 2.5D relief height field
      if (u_reliefEnabled > 0.5 && sf.r > 0.08) {
        float contourVal = sf.r * 5.2;
        float fwC = max(0.015, fwidth(contourVal));
        float distLine = abs(fract(contourVal - 0.5) - 0.5) / fwC;
        float contourInk = (1.0 - smoothstep(0.65, 1.55, distLine)) * smoothstep(0.08, 0.24, sf.r);
        paperCol = mix(paperCol, sepiaInk, contourInk * 0.19);
      }

      // Crisp dark-sepia hand-inked coastline pen stroke hugging the organic land edge
      float penW = max(5.2, 1.60 / max(0.08, u_zoom));
      float landEdgeInk = 1.0 - smoothstep(penW * 0.38, penW * 1.40, stratShoreDist);
      paperCol = mix(paperCol, sepiaInk, landEdgeInk * 0.62);
      // Subtle warm parchment inner coastal highlight just inland of the ink stroke
      float innerRim = exp(-pow((stratShoreDist - penW * 2.1) / max(5.0, penW * 1.2), 2.0));
      paperCol = mix(paperCol, vellumBase, innerRim * 0.24);
    }

    // Subtle antique atlas edge vignette framing the parchment view
    float atlasVig = smoothstep(0.66, 1.42, length(v_ndc * vec2(1.0, 0.88)));
    paperCol = mix(paperCol, paperCol * vec3(0.86, 0.80, 0.70), atlasVig * 0.42);

    knownColor = clamp(mix(knownColor, paperCol, u_strategicBlend), 0.0, 1.0);
  }

  // Explored-only Fog-of-War darkening & cool desaturation.
  float luma = dot(knownColor, vec3(0.299, 0.587, 0.114));
  vec3 exploredTint = mix(vec3(0.68, 0.72, 0.78), vec3(0.76, 0.71, 0.62), u_strategicBlend);
  vec3 exploredColor = mix(vec3(luma), knownColor, 0.58) * exploredTint;
  vec3 litTerrain = mix(exploredColor, knownColor, normVis);

  // Layer 1 keeps terrain crisp beneath Layer 4 sprites; billowing clouds & cloud_edge puffs
  // are composited in Layer 4b (renderCloudOverlay) ABOVE sprites so zero crowns ever poke through!
  // Still fill fully unknown terrain base softly with neutral cloud / antique vellum tone.
  vec3 unknownFill = mix(vec3(0.76, 0.79, 0.84), vec3(0.83, 0.77, 0.65), u_strategicBlend);
  vec3 color = mix(unknownFill, litTerrain, smoothstep(0.0, 0.22, normKnown));

  // Optional crisp pointy-top hex outline & hover highlight.
  bool isHovered = (homeHex.x == u_hoverHex.x && homeHex.y == u_hoverHex.y);
  if (u_showGrid > 0.5 || isHovered) {
    vec2 a = abs(exactRel);
    float edgeDist = max(a.x, a.x * 0.5 + a.y * 0.8660254);
    float distFromBorder = abs(HEX_W * 0.5 - edgeDist);
    float pxWidth = 1.15 / max(0.12, u_zoom);
    if (u_showGrid > 0.5 && normKnown > 0.25) {
      float line = 1.0 - smoothstep(pxWidth * 0.6, pxWidth * 1.6, distFromBorder);
      vec3 gridCol = mix(vec3(0.96, 0.92, 0.78), vec3(0.24, 0.18, 0.12), u_strategicBlend * 0.75);
      color = mix(color, gridCol, line * 0.24);
    }
    if (isHovered) {
      float hLine = 1.0 - smoothstep(pxWidth * 1.1, pxWidth * 2.8, distFromBorder);
      color = mix(color, vec3(1.0, 0.86, 0.42), hLine * 0.88);
      color = mix(color, vec3(1.0, 0.94, 0.72), 0.09);
    }
  }

  fragColor = vec4(color, 1.0);
}
`,Ja=`#version 300 es
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
uniform float u_strategicBlend;
uniform vec3 u_cloudTint;

uniform usampler2D u_cellData;
uniform sampler2D u_cloudTex;
uniform sampler2D u_cloudEdgeTex;

const float HEX_W = ${256 .toFixed(4)};
const float HEX_R = ${Je.toFixed(6)};
const float PROJ_Y = ${Ee.toFixed(4)};
const float ROW_STEP = ${(1.5*Je).toFixed(6)};

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

  // Warm unexplored clouds into aged sepia-parchment terra-incognita during Strategic Atlas zoom!
  if (u_strategicBlend > 0.005) {
    float pLuma = dot(fogBase, vec3(0.299, 0.587, 0.114));
    vec3 parchmentFog = vec3(0.84, 0.78, 0.65) * (0.86 + pLuma * 0.24);
    parchmentFog = mix(parchmentFog, vec3(0.46, 0.37, 0.27), frontierBand * 0.22);
    fogBase = mix(fogBase, parchmentFog, u_strategicBlend);
  }

  // Harmonize FoW cloud deck & Terra Incognita parchment softly with Time-of-Day / Weather lighting!
  fogBase = clamp(fogBase * u_cloudTint, 0.0, 1.0);

  // Exact premultiplied composite: out = fogBase * cloudAlpha + dst * (1 - cloudAlpha) * (1 - cloudShadow)
  fragColor = vec4(fogBase * cloudAlpha, outAlpha);
}
`;function Hn(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${i}`)}return o}var Qr=class{constructor(e){this.cellBuf=new Uint8Array(wt*wt*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.hasUnknownCells=!1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=Hn(e,e.VERTEX_SHADER,Za),o=Hn(e,e.FRAGMENT_SHADER,Qa),i=e.createProgram();if(!i)throw new Error("Failed to create terrain program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let d=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteShader(r),e.deleteProgram(i),new Error(`Terrain program link error:
${d}`)}this.program=i;let n=Hn(e,e.FRAGMENT_SHADER,Ja),s=e.createProgram();if(!s)throw e.deleteShader(r),e.deleteShader(n),new Error("Failed to create cloud overlay program");if(e.attachShader(s,r),e.attachShader(s,n),e.linkProgram(s),e.deleteShader(r),e.deleteShader(n),!e.getProgramParameter(s,e.LINK_STATUS)){let d=e.getProgramInfoLog(s)||"Unknown link error";throw e.deleteProgram(s),new Error(`Cloud overlay program link error:
${d}`)}this.cloudProgram=s;let u=e.createVertexArray();if(!u)throw new Error("Failed to create terrain VAO");this.vao=u;let c=e.createTexture();if(!c)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=c,e.bindTexture(e.TEXTURE_2D,c),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,wt,wt),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let a=e.createTexture();if(!a)throw new Error("Failed to allocate surface field texture");this.surfaceTex=a,e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let l=(d,h)=>{let m=e.getUniformLocation(d,h);if(!m)throw new Error(`Missing terrain uniform: ${h}`);return m};this.uCamCenter=l(i,"u_camCenter"),this.uViewportSize=l(i,"u_viewportSize"),this.uZoom=l(i,"u_zoom"),this.uTime=l(i,"u_time"),this.uGridOrigin=l(i,"u_gridOrigin"),this.uGridSize=l(i,"u_gridSize"),this.uForestFloorLayer=l(i,"u_forestFloorLayer"),this.uShowGrid=l(i,"u_showGrid"),this.uHoverHex=l(i,"u_hoverHex"),this.uSurfaceRect=l(i,"u_surfaceRect"),this.uEdgeBand=l(i,"u_edgeBand"),this.uWaterHexMode=l(i,"u_waterHexMode"),this.uReliefEnabled=l(i,"u_reliefEnabled"),this.uReliefLighting=l(i,"u_reliefLighting"),this.uWindEnabled=l(i,"u_windEnabled"),this.uStrategicBlend=l(i,"u_strategicBlend"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(i,"u_cellData"),1),e.uniform1i(e.getUniformLocation(i,"u_surfaceField"),3),this.cuCamCenter=l(s,"u_camCenter"),this.cuViewportSize=l(s,"u_viewportSize"),this.cuZoom=l(s,"u_zoom"),this.cuTime=l(s,"u_time"),this.cuGridOrigin=l(s,"u_gridOrigin"),this.cuGridSize=l(s,"u_gridSize"),this.cuHasClouds=l(s,"u_hasClouds"),this.cuHasCloudEdge=l(s,"u_hasCloudEdge"),this.cuWindEnabled=l(s,"u_windEnabled"),this.cuStrategicBlend=l(s,"u_strategicBlend"),this.cuCloudTint=l(s,"u_cloudTint"),e.useProgram(s),e.uniform1i(e.getUniformLocation(s,"u_cellData"),1),e.uniform1i(e.getUniformLocation(s,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(s,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return To(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:i,cellTex:n,surfaceTex:s,cellBuf:u}=this,{cam:c,assets:a,lookupHex:l,resolveTerrainLayer:d,isWaterTerrain:h,seedInt:m,dataRevision:g,timeSec:b,showGrid:p,hoverHex:_,edgeBand:w=28,waterSampling:M="hex",reliefEnabled:y=!0,reliefStrength:E=er,reliefLighting:k=!0,reliefStyle:S="sculpted",windAnimation:R=!0,strategicBlend:U=0}=e,C=At(c,4),P=C.maxQ-C.minQ+1,Q=C.maxR-C.minR+1,z=C.minQ,K=C.minR;P>wt&&(z=Math.floor((C.minQ+C.maxQ)/2)-Math.floor(wt/2),P=wt),Q>wt&&(K=Math.floor((C.minR+C.maxR)/2)-Math.floor(wt/2),Q=wt);let W=!1;if(z!==this.lastMinQ||K!==this.lastMinR||P!==this.lastSpanQ||Q!==this.lastSpanR||g!==this.lastDataRevision){let v=0,L=!1;for(let H=0;H<Q;H++){let O=K+H;for(let X=0;X<P;X++){let $=z+X,j=l($,O);if(!j||j.fogState===0)L=!0,u[v++]=0,u[v++]=0,u[v++]=0,u[v++]=0;else{let J=h(j.terrainId)?1:0,V=kt.has(j.terrainId)?2:0,se=j.terrainId==="icy_ocean"?4:0,ue=j.terrainId==="coastal_water"||j.terrainId==="coastal_waters"||j.terrainId==="coast"?8:0;u[v++]=d(j.terrainId,$,O)&255,u[v++]=mi(j)&255,u[v++]=j.fogState,u[v++]=J|V|se|ue}}}this.hasUnknownCells=L,r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,P,Q,r.RGBA_INTEGER,r.UNSIGNED_BYTE,u.subarray(0,P*Q*4)),this.lastMinQ=z,this.lastMinR=K,this.lastSpanQ=P,this.lastSpanR=Q,this.lastDataRevision=g,W=!0}let N=y?E:0,ee=c.viewportWidth*.5/c.zoom,Z=c.viewportHeight*.5/(c.zoom*Ee),x=c.x-ee-140,F=c.x+ee+140,T=c.y/Ee-Z-180,D=c.y/Ee+Z+220;if(!this.surfaceWin||this.lastSurfaceRevision!==g||this.lastSurfaceStrength!==N||this.lastSurfaceStyle!==S||x<this.surfaceWin.left||F>this.surfaceWin.left+this.surfaceWin.width||T<this.surfaceWin.top||D>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(F-x)*3.5){let v=Math.max(384,(F-x)*.35),L=Math.max(384,(D-T)*.35),H=x-v,O=T-L,X=F-x+v*2,$=D-T+L*2,j=Math.max(16,Math.ceil(Math.max(X/200,$/150)));this.surfaceWin=Mo({left:H,top:O,width:X,height:$,step:j,lookupHex:l,manifest:a.manifest,seedInt:m,reliefStrength:N,reliefStyle:S}),this.lastSurfaceRevision=g,this.lastSurfaceStrength=N,this.lastSurfaceStyle=S,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(i),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,a.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.uniform2f(this.uCamCenter,c.x,c.y),r.uniform2f(this.uViewportSize,c.viewportWidth,c.viewportHeight),r.uniform1f(this.uZoom,c.zoom),r.uniform1f(this.uTime,b),r.uniform2i(this.uGridOrigin,z,K),r.uniform2i(this.uGridSize,P,Q),r.uniform1i(this.uForestFloorLayer,a.forestFloorLayer),r.uniform1f(this.uShowGrid,p?1:0),r.uniform2i(this.uHoverHex,_?_.q:-999999,_?_.r:-999999);let f=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,f?f.left:0,f?f.top:0,f?f.width:1,f?f.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,w))),r.uniform1f(this.uWaterHexMode,M==="hex"?1:0),r.uniform1f(this.uReliefEnabled,y?1:0),r.uniform1f(this.uReliefLighting,k?1:0),r.uniform1f(this.uWindEnabled,R?1:0),r.uniform1f(this.uStrategicBlend,Math.max(0,Math.min(1,U))),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:P*Q,uploaded:W}}renderCloudOverlay(e){if(!this.hasUnknownCells||this.lastSpanQ<=0||this.lastSpanR<=0)return 0;let{gl:r,cloudProgram:o,vao:i,cellTex:n}=this,{cam:s,assets:u,timeSec:c,windAnimation:a=!0,strategicBlend:l=0,cloudTint:d=[1,1,1]}=e;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(o),r.bindVertexArray(i),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,u.cloudTexture),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,u.cloudEdgeTexture??u.cloudTexture),r.uniform2f(this.cuCamCenter,s.x,s.y),r.uniform2f(this.cuViewportSize,s.viewportWidth,s.viewportHeight),r.uniform1f(this.cuZoom,s.zoom),r.uniform1f(this.cuTime,c),r.uniform2i(this.cuGridOrigin,this.lastMinQ,this.lastMinR),r.uniform2i(this.cuGridSize,this.lastSpanQ,this.lastSpanR),r.uniform1f(this.cuHasClouds,u.cloudTexture?1:0),r.uniform1f(this.cuHasCloudEdge,u.cloudEdgeTexture?1:0),r.uniform1f(this.cuWindEnabled,a?1:0),r.uniform1f(this.cuStrategicBlend,Math.max(0,Math.min(1,l))),r.uniform3f(this.cuCloudTint,d[0],d[1],d[2]),r.drawArrays(r.TRIANGLES,0,3),1}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program),this.gl.deleteProgram(this.cloudProgram)}};var gi=65536,Jr=6,es=`#version 300 es
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
`,ts=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,en=class{constructor(e){this.verts=new Float32Array(gi*Jr);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,es),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,ts),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate vector program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=Jr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,8),e.bindVertexArray(null);let c=a=>{let l=e.getUniformLocation(i,a);if(!l)throw new Error(`Missing vector uniform: ${a}`);return l};this.uCamCenter=c("u_camCenter"),this.uViewportSize=c("u_viewportSize"),this.uZoom=c("u_zoom")}pushTri(e,r,o,i,n,s,u,c,a,l){if(this.vertCount+3>gi)return;let d=this.vertCount*Jr,h=this.verts;h[d++]=e,h[d++]=r,h[d++]=u,h[d++]=c,h[d++]=a,h[d++]=l,h[d++]=o,h[d++]=i,h[d++]=u,h[d++]=c,h[d++]=a,h[d++]=l,h[d++]=n,h[d++]=s,h[d++]=u,h[d++]=c,h[d++]=a,h[d++]=l,this.vertCount+=3}pushSegment(e,r,o,i){let n=r.x-e.x,s=r.y-e.y,u=Math.hypot(n,s);if(u<1e-4)return;let c=-s/u*(o*.5),a=n/u*(o*.5),[l,d,h,m]=i;this.pushTri(e.x-c,e.y-a,e.x+c,e.y+a,r.x+c,r.y+a,l,d,h,m),this.pushTri(e.x-c,e.y-a,r.x+c,r.y+a,r.x-c,r.y-a,l,d,h,m)}pushDisc(e,r,o,i,n,s){let[u,c,a,l]=s;for(let d=0;d<n;d++){let h=d/n*Math.PI*2,m=(d+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(h)*o,r+Math.sin(h)*i,e+Math.cos(m)*o,r+Math.sin(m)*i,u,c,a,l)}}pushHexFill(e,r,o,i=1){let n=Ae(e,r),s=pr(e,r),[u,c,a,l]=o;for(let d=0;d<6;d++){let h=s[d],m=s[(d+1)%6],g=n.x+(h.x-n.x)*i,b=n.y+(h.y-n.y)*i,p=n.x+(m.x-n.x)*i,_=n.y+(m.y-n.y)*i;this.pushTri(n.x,n.y,g,b,p,_,u,c,a,l)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Jr)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s}=e;if(!o)return 0;this.vertCount=0;let u=c=>s?{x:c.x,y:c.y-s(c.x,c.y/Ee)*Ee}:c;if(o.territory&&o.territory.length>0){let c=new Map;for(let h of o.territory)c.set(qe(h.q,h.r),h.ownerId);let a=.08+n*.24,l=Math.max(7,10/Math.max(.2,r.zoom*1.1)),d=.75+n*.2;for(let h of o.territory){let m=i(h.q,h.r);if(m===0)continue;let g=m===1?.65:1,[b,p,_]=h.color;this.pushHexFill(h.q,h.r,[b,p,_,a*g],.98);for(let w=0;w<6;w++){let[M,y]=Re[w];if(c.get(qe(h.q+M,h.r+y))!==h.ownerId){let{a:k,b:S}=mt(h.q,h.r,w),R=Ae(h.q,h.r),U={x:k.x+(R.x-k.x)*.05,y:k.y+(R.y-k.y)*.05},C={x:S.x+(R.x-S.x)*.05,y:S.y+(R.y-S.y)*.05};this.pushSegment(U,C,l,[b,p,_,d*g])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let c=1-n*.85;for(let a of o.buildings){let l=i(a.q,a.r);if(l===0)continue;let d=(l===1?.65:1)*c,h=u(Ae(a.q,a.r)),g=a.kind==="capital"||a.kind==="settlement"||a.kind==="fortress"?106:78,b=g*.72;this.pushDisc(h.x,h.y+4,g*1.18,b*1.18,18,[.42,.36,.26,.22*d]),this.pushDisc(h.x,h.y+4,g*.88,b*.88,16,[.48,.42,.31,.36*d])}}if(o.buildPreview){let c=o.buildPreview;for(let l of c.bonusHexes)this.pushHexFill(l.q,l.r,[.22,.82,.48,.24],.92);let a=c.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(c.center.q,c.center.r,a,.96)}if(o.selectedHex){let c=pr(o.selectedHex.q,o.selectedHex.r),a=Math.max(5,6/Math.max(.25,r.zoom));for(let l=0;l<6;l++)this.pushSegment(c[l],c[(l+1)%6],a,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:i,timeSec:n,coveredBuildingIds:s,coveredSiteIds:u}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let c of o.buildings){let a=i(c.q,c.r);if(a===0)continue;let l=a===1?.65:1,d=Ae(c.q,c.r),[h,m,g]=c.factionColor;if(c.rangeRadius&&c.rangeRadius>0){let y=c.rangeRadius*240,E=y*.85,k=36;for(let S=0;S<k;S+=2){let R=S/k*Math.PI*2,U=(S+1)/k*Math.PI*2;this.pushSegment({x:d.x+Math.cos(R)*y,y:d.y+Math.sin(R)*E},{x:d.x+Math.cos(U)*y,y:d.y+Math.sin(U)*E},Math.max(4,3.5/Math.max(.2,r.zoom)),[h,m,g,.45*l])}}if(s?.has(c.id))continue;let b=c.kind==="capital"||c.kind==="settlement",p=c.kind==="fortress"||c.kind==="watchtower",_=b?78:p?64:52,w=b?68:p?76:42;this.pushDisc(d.x-10,d.y+8,_*1.12,_*.62,16,[.05,.07,.09,.45*l]),this.pushDisc(d.x,d.y+4,_,_*.56,6,[.34,.32,.29,.96*l]);let M=_*.68;this.pushTri(d.x-M,d.y+6,d.x+M,d.y+6,d.x+M,d.y-w*.65,.78*l,.74*l,.66*l,.98),this.pushTri(d.x-M,d.y+6,d.x+M,d.y-w*.65,d.x-M,d.y-w*.65,.66*l,.62*l,.55*l,.98),this.pushTri(d.x-M*1.18,d.y-w*.62,d.x+M*1.18,d.y-w*.62,d.x,d.y-w*1.25,h*l,m*l,g*l,.98),(b||p)&&this.pushTri(d.x-14,d.y-w*.95,d.x+14,d.y-w*.95,d.x,d.y-w*1.55,.96*l,.8*l,.34*l,.98)}if(o.sites)for(let c of o.sites){if(u?.has(c.id)||i(c.q,c.r)===0)continue;let l=Ae(c.q,c.r),d=26,h=c.family==="fauna"?[.85,.58,.25,.9]:c.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(l.x,l.y-d,l.x+d,l.y,l.x,l.y+d,h[0],h[1],h[2],h[3]),this.pushTri(l.x,l.y-d,l.x,l.y+d,l.x-d,l.y,h[0]*.8,h[1]*.8,h[2]*.8,h[3])}if(o.units)for(let c of o.units){if(i(c.q,c.r)<2)continue;let[l,d,h]=c.factionColor,m=Ae(c.q,c.r);if(c.marchPath&&c.marchPath.length>=2){let g=c.marchPath.map(U=>Ae(U.q,U.r));for(let U=0;U<g.length-1;U++)this.pushSegment(g[U],g[U+1],Math.max(8,6/Math.max(.2,r.zoom)),[l,d,h,.78]);let b=g[g.length-1],p=g[g.length-2],_=b.x-p.x,w=b.y-p.y,M=Math.hypot(_,w)||1,y=_/M,E=w/M,k=b,S={x:b.x-y*28,y:b.y-E*28};this.pushTri(k.x,k.y,S.x-E*18,S.y+y*18,S.x+E*18,S.y-y*18,l,d,h,.95);let R=n*.14%1;m={x:g[0].x+(g[1].x-g[0].x)*R,y:g[0].y+(g[1].y-g[0].y)*R}}if(c.inCombat){let g=1+.22*Math.sin(n*5);this.pushDisc(m.x,m.y,56*g,44*g,20,[.98,.26,.22,.35])}this.pushDisc(m.x,m.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(m.x,m.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(m.x,m.y-16,26,26,18,[l,d,h,.98])}if(o.walls)for(let c of o.walls){if(!c.breached)continue;let a=dt(c.q1,c.r1,c.q2,c.r2);if(a<0)continue;let{mid:l}=mt(c.q1,c.r1,a),d=1+.18*Math.sin(n*4.5);this.pushDisc(l.x,l.y,32*d,24*d,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var rs=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],bi=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],ns={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function os(t,e,r,o){let i=t.infrastructure.sprites,n=[];e==="stone"?(o?(n.push(`walls/stone/gates/v1/gate_dir${r}`),r===5&&n.push("walls/stone/gates/v1/gate_dir2"),n.push(`walls/stone/v7/edge_dir${r}`)):n.push(`walls/stone/v7/edge_dir${r}`),n.push(`walls/palisade/edge_dir${r}`)):(o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`));for(let s of n)if(i[s])return s;return null}function is(t,e,r){let o=t.infrastructure.sprites,i=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${i}`,`walls/palisade/${i}`]:[`walls/palisade/${i}`];for(let s of n)if(o[s])return s;return null}function vi(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,i,n,s]=r.boundsInSpriteWidth,u=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*u,shadowRelTop:i*u,shadowWidth:(n-o)*u,shadowHeight:(s-i)*u}}function yi(t,e,r,o){if(!e.length)return[];let i=[],n=o?.occupiedRiverEdges,s=o?.lookupHex,u=new Map;for(let c of e){let a=dt(c.q1,c.r1,c.q2,c.r2);if(a<0)continue;if(n&&n.size>0){let _=et(c.q1,c.r1,c.q2,c.r2);if(n.has(_.key))continue}if(s){let _=s(c.q1,c.r1),w=s(c.q2,c.r2);if(_&&(gt(_.terrainId)||_.reliefClass==="mountain")||w&&(gt(w.terrainId)||w.reliefClass==="mountain"))continue}let l=r(c.q1,c.r1),d=r(c.q2,c.r2),h=l>=d?l:d;if(h===0)continue;let{a:m,b:g,mid:b}=mt(c.q1,c.r1,a),p=os(t,c.kind,a,!!c.isGate);if(p){let _=t.infrastructure.sprites[p],w=p.includes("/stone/"),[M,y,E,k]=w?bi[a]:rs[a],S=g.x-m.x,R=g.y-m.y,U=Math.hypot(S,R)||1,C=-R/U,P=S/U;(P<0||Math.abs(P)<1e-9&&C<0)&&(C=-C,P=-P);let Q=w?24:16,z=C*Q,K=P*Q*.62,W=Math.abs(S)>1e-6?(K-R/S*z)*.5:w?5.5:3.5,N=k;if(w){let Z=bi[(a+3)%6][3];N=(k+Z-R)*.5}let ee=w?"stone":"palisade";i.push({x:m.x,y:m.y,relLeft:-E,relTop:-N+W,width:M,height:y,page:_.page,u0:_.uv[0],v0:_.uv[1],u1:_.uv[2],v1:_.uv[3],sortY:b.y,fogState:h,...vi(t,`wall_shadow:${ee}:dir${a}`)})}for(let _ of[m,g]){let w=`${Math.round(_.x*10)},${Math.round(_.y*10)}`,M=u.get(w);M||(M={x:_.x,y:_.y,degree:0,hasPalisade:!1,hasStone:!1,fog:h},u.set(w,M)),M.degree++,c.kind==="palisade"&&(M.hasPalisade=!0),c.kind==="stone"&&(M.hasStone=!0),h>M.fog&&(M.fog=h)}}for(let c of u.values()){let a=c.hasStone&&!c.hasPalisade?"stone":"palisade",l=c.degree===1,d=is(t,a,l);if(!d)continue;let h=t.infrastructure.sprites[d],m=ns[a],g=l?m.endW:m.cornerW,b=l?m.endH:m.cornerH;i.push({x:c.x,y:c.y,relLeft:-g*.5,relTop:-b+m.south,width:g,height:b,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:c.y+1,fogState:c.fog,...vi(t,`wall_shadow:${a}:post`)})}return i.sort((c,a)=>c.sortY-a.sortY||c.x-a.x),i}var Gn={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0,showGroundDecals:!0,showAmbientVfx:!0,showProvisionalSites:!0,showStrategicCartography:!0,timeOfDay:"day",weather:"clear",showNightLights:!0},tn=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=Fn(null);this.cachedWallSprites=[];this.wallCacheKey="";this.cachedOccupiedRiverEdges=new Set;this.riverEdgesCacheKey="";this.lastVisibleRiverRoutes=[];this.cachedBridgeSprites=[];this.bridgeCacheKey="";this.cachedBuildingSprites=[];this.buildingCacheKey="";this.coveredBuildingIds=new Set;this.cachedSiteSprites=[];this.siteCacheKey="";this.coveredSiteIds=new Set;this.cachedInfraSprites=[];this.cachedStrategicCartography=null;this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...pt,...o.forestConfig??{}},this.reliefConfig={...Bt,...o.reliefConfig??{}},this.visualConfig={...Gn,...o.visualConfig??{}};let i=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!i)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=i,this.terrainPass=new Qr(i),this.roadPass=new Kr(i),this.riverPass=new Er(i),this.vectorPass=new en(i),this.spriteBatcher=new jr(i),this.animatedActorPass=new Br(i),this.ambientVfxPass=new Dr(i),this.atmospherePass=new Hr(i),this.camera=new Nr(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await An(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new or(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await An(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let i=this.assets;return this.assets=o,this.chunkManager=new or(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",i?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey=""),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.infrastructureClearance=Fn(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}getOccupiedRiverEdgeKeys(){if(!this.riverEdgesCacheKey&&this.chunkManager){let e=this.chunkManager;this.cachedOccupiedRiverEdges=Tt({routes:this.lastVisibleRiverRoutes,manualRivers:this.dynamicScene?.rivers,isWaterHex:(r,o)=>{let i=e.lookupTerrainHex(r,o);return i?e.isWaterTerrain(i.terrainId):!1}})}return this.cachedOccupiedRiverEdges}validateWallPlacement(e,r,o,i,n=!1){return Ar({q1:e,r1:r,q2:o,r2:i,isGate:n,lookupHex:(s,u)=>this.chunkManager?.lookupTerrainHex(s,u),occupiedRiverEdges:this.getOccupiedRiverEdgeKeys(),existingRoads:this.dynamicScene?.roads})}validateRoadPlacement(e,r,o,i){return Wr({q1:e,r1:r,q2:o,r2:i,lookupHex:(n,s)=>this.chunkManager?.lookupTerrainHex(n,s),existingWalls:this.dynamicScene?.walls})}validateRiverPlacement(e,r,o){return kr({q:e,r,dir:o,lookupHex:(i,n)=>this.chunkManager?.lookupTerrainHex(i,n),existingWalls:this.dynamicScene?.walls})}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let o=0;o<e.length;o++){let i=e[o];if(i.inCombat||i.marchPath&&i.marchPath.length>=2)return!0}let r=this.dynamicScene?.sites;if(r&&r.length>0){for(let o=0;o<r.length;o++)if(r[o].family==="fauna")return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let i=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let s=this.camera.state,u=this.gl,c=(e-this.startTimeMs)*.001,a=Wn(s.zoom),l=1-a,d=l>.02,h=this.visualConfig.windAnimation!==!1,m=this.visualConfig.showStrategicCartography!==!1,g=m?a:0,b=br(this.visualConfig.timeOfDay??"day",this.visualConfig.weather??"clear",this.visualConfig.showNightLights!==!1),p=this.shadowOpacity*b.shadowOpacityScale,_=b.isIdentity?null:this.atmospherePass.beginScene(u.canvas.width,u.canvas.height);_||(u.bindFramebuffer(u.FRAMEBUFFER,null),u.viewport(0,0,u.canvas.width,u.canvas.height));let{sprites:w,fogStates:M,decals:y,decalFogStates:E,shorelines:k,shoreFogStates:S,riverRoutes:R,chunksLoadedThisFrame:U,hasPendingChunks:C}=o.prepareVisibleFrame(s,d?2:6,d),P=(B,A)=>{let q=o.lookupTerrainHex(B,A);return q?q.fogState:0},Q=performance.now(),z=this.terrainPass.render({cam:s,assets:r,lookupHex:(B,A)=>o.lookupTerrainHex(B,A),resolveTerrainLayer:(B,A,q)=>o.resolveTerrainLayer(B,A,q),isWaterTerrain:B=>o.isWaterTerrain(B),seedInt:o.seedInt,dataRevision:o.revision,timeSec:c,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:h,strategicBlend:g}),K=this.spriteBatcher.renderShorelines({cam:s,shorelines:k,fogStates:S,infraPages:r.infraPages,projectY:Ee,opacityScale:1-g,targetFramebuffer:_}),W=(B,A)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(B,A):0,N=this.roadPass.render({cam:s,roads:this.dynamicScene?.roads,lookupFog:P,strategicBlend:a,sampleReliefHeight:W,targetFramebuffer:_}),ee=this.riverPass.render({cam:s,assets:r,routes:R,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:W,lookupFog:P,lookupHex:(B,A)=>o.lookupTerrainHex(B,A),timeSec:c,windAnimation:h}),Z=this.vectorPass.renderGroundPass({cam:s,scene:this.dynamicScene,lookupFog:P,strategicBlend:a,sampleReliefHeight:W}),x=performance.now(),F=w,T=M;if(!this.infrastructureClearance.isEmpty&&w.length>0){F=[],T=[];for(let B=0;B<w.length;B++){let A=w[B];Ln(A,this.infrastructureClearance)||(F.push(A),T.push(M[B]))}}let D=this.dynamicScene?.customSprites;if(d&&D&&D.length>0){let B=[];for(let A=0;A<F.length;A++)B.push({sprite:F[A],fog:T[A]});for(let A of D){let q=r.manifest.nature.sprites[A.spriteKey];if(!q)continue;let oe=Ae(A.q,A.r),ae=oe.x+(A.offsetX??0),re=oe.y+(A.offsetY??0),le=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(ae,re/Ee)*Ee:0,we=(A.worldWidthOverride??q.worldWidth)*It(q)*(A.scale??1),de=we*q.aspect,_e=r.manifest.shadows.sprites[A.spriteKey],Be=A.anchorOverride??q.anchor;B.push({sprite:{x:ae,y:re-le,sortY:re,width:we,height:de,anchorX:Be[0],anchorY:Be[1],page:q.page,u0:q.uv[0],v0:q.uv[1],u1:q.uv[2],v1:q.uv[3],q:A.q,r:A.r,isMountain:q.kind==="mountain",isSnowFamily:_r(q),shadowTier:Rn(q,we,de),selfShadeWeight:Mn(q),shadowPage:_e?_e.page:-1,shadowU0:_e?_e.uv[0]:0,shadowV0:_e?_e.uv[1]:0,shadowU1:_e?_e.uv[2]:0,shadowV1:_e?_e.uv[3]:0,shadowMinX:_e?_e.boundsInSpriteWidth[0]:0,shadowMinY:_e?_e.boundsInSpriteWidth[1]:0,shadowMaxX:_e?_e.boundsInSpriteWidth[2]:0,shadowMaxY:_e?_e.boundsInSpriteWidth[3]:0},fog:P(A.q,A.r)})}B.sort((A,q)=>(A.sprite.sortY??A.sprite.y)-(q.sprite.sortY??q.sprite.y)||A.sprite.x-q.sprite.x),F=B.map(A=>A.sprite),T=B.map(A=>A.fog)}let I=this.sceneRevision*1000003+o.revision,f=this.dynamicScene?.rivers,v=R.map(B=>B.id).join(",");this.lastVisibleRiverRoutes=R;let L=`${I}|${v}`;this.riverEdgesCacheKey!==L&&(this.cachedOccupiedRiverEdges=Tt({routes:R,manualRivers:f,isWaterHex:(B,A)=>{let q=o.lookupTerrainHex(B,A);return q?o.isWaterTerrain(q.terrainId):!1}}),this.riverEdgesCacheKey=L);let H=!1,O=`${I}|${v}`;this.wallCacheKey!==O&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?yi(r.manifest,this.dynamicScene.walls,P,{occupiedRiverEdges:this.cachedOccupiedRiverEdges,lookupHex:(B,A)=>o.lookupTerrainHex(B,A)}):[],this.wallCacheKey=O,H=!0);let X=this.dynamicScene?.roads,$=!!(X&&X.length>0)&&(R.length>0||!!(f&&f.length>0)),j=$?`${I}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}|${v}`:"";if(this.bridgeCacheKey!==j){if($&&X){let B=Ko({roads:X,routes:R,manualRivers:f,lookupFog:P,isWaterHex:(A,q)=>{let oe=o.lookupTerrainHex(A,q);return oe?o.isWaterTerrain(oe.terrainId):!1}});this.cachedBridgeSprites=jo({manifest:r.manifest,crossings:B,sampleReliefHeight:W})}else this.cachedBridgeSprites=[];this.bridgeCacheKey=j,H=!0}let J=this.dynamicScene?.buildings,V=!!(J&&J.length>0),se=V?`${I}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.buildingCacheKey!==se){if(V&&J){let B=Zo({manifest:r.manifest,buildings:J,lookupFog:P,sampleReliefHeight:(A,q)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(A,q):0});this.cachedBuildingSprites=B.sprites,this.coveredBuildingIds=B.coveredBuildingIds}else this.cachedBuildingSprites=[],this.coveredBuildingIds=new Set;this.buildingCacheKey=se,H=!0}let ue=this.dynamicScene?.sites,te=!!(ue&&ue.length>0),be=this.visualConfig.showProvisionalSites!==!1,ve=te&&be?`${I}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.siteCacheKey!==ve){if(te&&be&&ue){let B=ii({manifest:r.manifest,sites:ue,lookupFog:P,sampleReliefHeight:W});this.cachedSiteSprites=B.sprites,this.coveredSiteIds=B.coveredSiteIds}else this.cachedSiteSprites=[],this.coveredSiteIds=new Set;this.siteCacheKey=ve,H=!0}if(H){let B=[];this.cachedWallSprites.length>0&&B.push(this.cachedWallSprites),this.cachedBridgeSprites.length>0&&B.push(this.cachedBridgeSprites),this.cachedBuildingSprites.length>0&&B.push(this.cachedBuildingSprites),this.cachedSiteSprites.length>0&&B.push(this.cachedSiteSprites),B.length===0?this.cachedInfraSprites=[]:B.length===1?this.cachedInfraSprites=B[0]:this.cachedInfraSprites=B.flat().sort((A,q)=>A.sortY-q.sortY||A.x-q.x)}let he=0;if(d&&this.visualConfig.showGroundDecals!==!1&&y.length>0){let B=y,A=E;if(!this.infrastructureClearance.isEmpty){B=[],A=[];for(let q=0;q<y.length;q++){let oe=y[q];Ln(oe,this.infrastructureClearance)||(B.push(oe),A.push(E[q]))}}B.length>0&&(he=this.spriteBatcher.renderWorldSprites({cam:s,sprites:B,fogStates:A,naturePages:r.naturePages,detailOpacity:l,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:c,windAnimation:!1,isDecalPass:!0}).drawCalls)}let me=this.spriteBatcher.renderShadows({cam:s,sprites:F,fogStates:T,walls:this.cachedInfraSprites,shadowPages:r.shadowPages,shadowOpacity:p,detailOpacity:l,targetFramebuffer:_}),xe=performance.now(),Me=this.spriteBatcher.renderWaterSurfRings({cam:s,sprites:F,fogStates:T,detailOpacity:l,timeSec:c,windAnimation:h}),ye=this.spriteBatcher.renderWorldSprites({cam:s,sprites:F,fogStates:T,naturePages:r.naturePages,walls:this.cachedInfraSprites,infraPages:r.infraPages,detailOpacity:l,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:p,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:c,windAnimation:h}),Te=d&&te?Xo({manifest:r.manifest,sites:ue,lookupFog:P,sampleReliefHeight:W,timeSec:c,animate:h}):{actors:[],coveredSiteIds:new Set},Se=this.animatedActorPass.render({cam:s,assets:r,actors:Te.actors,detailOpacity:l,shadowOpacity:p,naturePolish:this.visualConfig.naturePolish}),Ge=0;if(_){let B=b.lanternIntensity>.01?Kn({cam:s,scene:this.dynamicScene,lookupFog:P,sampleReliefHeight:W,lanternIntensity:b.lanternIntensity,strategicBlend:g}):[];Ge=this.atmospherePass.compositeToScreen({cam:s,profile:b,lights:B,timeSec:c,animate:h,strategicBlend:g})}let Ie=b.isIdentity?[1,1,1]:[Math.min(1.15,.35+b.highlightTint[0]*b.brightness*.65),Math.min(1.15,.35+b.highlightTint[1]*b.brightness*.65),Math.min(1.15,.35+b.highlightTint[2]*b.brightness*.65)],Oe=d&&this.visualConfig.showAmbientVfx!==!1?this.ambientVfxPass.render({cam:s,detailOpacity:l,timeSec:c,animate:h,lookupHex:(B,A)=>o.lookupTerrainHex(B,A),isWaterTerrain:B=>o.isWaterTerrain(B),buildings:this.dynamicScene?.buildings,sampleReliefHeight:W,seedInt:o.seedInt,rainIntensity:b.rainIntensity,fireflyIntensity:b.fireflyIntensity,nightFactor:b.nightFactor,ambientTint:Ie}):{drawCalls:0,particleCount:0},Ue=this.terrainPass.renderCloudOverlay({cam:s,assets:r,timeSec:c,windAnimation:h,strategicBlend:g,cloudTint:b.cloudTint}),De;if(l>.35)if(Te.coveredSiteIds.size===0)De=this.coveredSiteIds;else if(this.coveredSiteIds.size===0)De=Te.coveredSiteIds;else{let B=new Set(this.coveredSiteIds);for(let A of Te.coveredSiteIds)B.add(A);De=B}let G=this.vectorPass.renderTacticalPass({cam:s,scene:this.dynamicScene,lookupFog:P,timeSec:c,coveredBuildingIds:l>.35?this.coveredBuildingIds:void 0,coveredSiteIds:De});if(this.overlayCanvas){let B=null;if(m&&a>.04){let A=qn(s,o.revision,o.seedInt).key;(!this.cachedStrategicCartography||this.cachedStrategicCartography.windowKey!==A)&&(this.cachedStrategicCartography=pi({cam:s,lookupHex:(q,oe)=>o.lookupTerrainHex(q,oe),seedInt:o.seedInt,dataRevision:o.revision})),B=this.cachedStrategicCartography}ri({canvas:this.overlayCanvas,cam:s,scene:this.dynamicScene,lookupFog:P,strategicBlend:a,timeSec:c,strategicCartography:B,nightAtlasBlend:b.nightFactor})}let Y=performance.now();this.hasPendingStream=C||U>0;let ne=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!ne||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let B=this.frameTimes.length>0?this.frameTimes.reduce((q,oe)=>q+oe,0)/this.frameTimes.length:Math.max(16.6,Y-i),A={fps:Math.min(120,Math.round(1e3/Math.max(8,B))),frameMs:Number((Y-i).toFixed(2)),terrainPassMs:Number((x-Q).toFixed(2)),shadowPassMs:Number((xe-x).toFixed(2)),spritePassMs:Number((Y-xe).toFixed(2)),drawCalls:1+K.drawCalls+N+ee+Z+he+me.drawCalls+Me+ye.drawCalls+Se.drawCalls+Ge+Oe.drawCalls+Ue+G,visibleHexes:z.visibleHexes,renderedSprites:ye.renderedSprites+Se.renderedActors,renderedShadows:me.renderedShadows,loadedChunks:o.loadedChunkCount,mode:Jo(s.zoom),strategicBlend:Number(a.toFixed(2)),vramTier:r.vramTier,zoom:Number(s.zoom.toFixed(2)),centerHex:je(s.x,s.y)};this.options.onMetrics(A)}return ne}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.roadPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.animatedActorPass.dispose(),this.ambientVfxPass.dispose(),this.atmospherePass.dispose(),this.assets?.dispose(),this.assets=null}};var wi={VedrasMapEngine:tn,createGeographyV2ChunkProvider:Lo,createSandboxScenario:qo,computeScenarioFog:Go,evaluateDecision0121BuildPreview:ir,SANDBOX_SCENARIO_LIST:Ho,VIELFALT_MIX_OVERRIDES:Gt,DEFAULT_FOREST_CONFIG:pt,DEFAULT_RELIEF_CONFIG:Bt,DEFAULT_VISUAL_CONFIG:Gn,TIME_OF_DAY_PRESETS:Yn,WEATHER_PRESETS:$n,resolveAtmosphereProfile:br,computeBoulderSpawnScale:Pr,sizeFactor:It,GeographyV2:xi.default,placementRules:{isWaterTerrainId:gt,collectOccupiedRiverEdgeKeys:Tt,validateWallEdgePlacement:Ar,validateRoadEdgePlacement:Wr,validateRiverEdgePlacement:kr},hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:Re,axialToWorld:Ae,worldToAxial:je,hexDistance:Ze,hexKey:qe,hexEdgeEndpoints:mt,canonicalEdgePair:et,neighborDirection:dt,pickNearestHexEdge:zn}};typeof window<"u"&&(window.VedrasMapEngineLib=wi);var $l=wi;})();
