/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var fa=Object.create;var Ln=Object.defineProperty;var ha=Object.getOwnPropertyDescriptor;var ma=Object.getOwnPropertyNames;var pa=Object.getPrototypeOf,ga=Object.prototype.hasOwnProperty;var ba=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var va=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of ma(e))!ga.call(t,a)&&a!==r&&Ln(t,a,{get:()=>e[a],enumerable:!(o=ha(e,a))||o.enumerable});return t};var tn=(t,e,r)=>(r=t!=null?fa(pa(t)):{},va(e||!t||!t.__esModule?Ln(r,"default",{value:t,enumerable:!0}):r,t));var hr=ba((Yi,fr)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],a=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),s=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],u=[],i=(_,F=0,A=1)=>Math.min(A,Math.max(F,_)),l=(_,F)=>_+","+F;function c(_){let F=2166136261;for(let A=0;A<_.length;A++)F^=_.charCodeAt(A),F=Math.imul(F,16777619);return F>>>0}let f=Object.create(null);function h(_){let F=typeof _=="string"?_:String(_),A=f[F];return A===void 0&&(A=c(F),f[F]=A),A}function m(_,F,A,I){let k=_^Math.imul(F+32767,374761393)^Math.imul(A+65521,668265263)^I;return k=Math.imul(k^k>>>15,2246822519),k=Math.imul(k^k>>>13,3266489917),(k^k>>>16)>>>0}function g(_,F,A,I){return m(_,F,A,h(I))}let p=(_,F,A,I)=>m(_,F,A,h(I))/4294967296,b=_=>_*_*(3-2*_);function S(_,F,A){let I=F.reduce((d,[,v])=>d+A[v],0);if(I<=0)return F[0][0];let k=i(_,0,.999999999)*I;for(let[d,v]of F)if(k-=A[v],k<0)return d;return F[F.length-1][0]}let P=(_,F,A)=>_+(F-_)*A;function x(_,F,A,I,k){let d=F/I,v=A/I,M=Math.floor(d),G=Math.floor(v),U=b(d-M),Y=b(v-G),j=h(k),Z=1/4294967296,le=m(_,M,G,j)*Z,J=m(_,M+1,G,j)*Z,ge=m(_,M,G+1,j)*Z,he=m(_,M+1,G+1,j)*Z;return P(P(le,J,U),P(ge,he,U),Y)}function w(){return s.map(([_,F,A,I,k,d,v,M])=>({group:_,id:F,label:A,defaultValue:I,min:k,max:d,step:v,help:M}))}function H(){return Object.fromEntries(s.map(_=>[_[1],_[3]]))}function W(_){if(_!==void 0&&(typeof _!="object"||_===null||Array.isArray(_)))throw Error("Ung\xFCltige Parameterdatei.");let F=H();for(let[,A,,I,k,d]of s){if(_?.[A]===void 0)continue;let v=Number(_[A]);if(!Number.isFinite(v)||v<k||v>d)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+A);F[A]=v}if(F["relief.mountainFraction"]+F["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return F}function y(_){if(!Array.isArray(_)||!_.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let F=_.map(I=>I?.stats??I);if(F.some(I=>!I||!Number.isFinite(I.total)||I.total<=0||!Number.isFinite(I.land)||I.land<0||I.land>I.total||!I.biomes||!I.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function A(I,k,d){let v=[...new Set([...I,...F.flatMap(G=>Object.keys(G[k]))])],M=F.reduce((G,U)=>G+U[d],0);return Object.fromEntries(v.map(G=>{let U=F.map(j=>j[k][G]||0),Y=U.reduce((j,Z)=>j+Z,0);return[G,{total:Y,mean:Y/F.length,percent:M?100*Y/M:0,worldsPresent:U.filter(j=>j>0).length}]}))}return{generatorVersion:e,samples:F.length,meanHexes:F.reduce((I,k)=>I+k.total,0)/F.length,meanLand:F.reduce((I,k)=>I+k.land,0)/F.length,biomes:A(n,"biomes","land"),terrains:A(a,"terrains","total")}}function E(_){if(!_||typeof _.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(_.id)||s.some(F=>F[1]===_.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let F of["defaultValue","min","max","step"])if(!Number.isFinite(_[F]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+F);if(_.min>_.defaultValue||_.defaultValue>_.max||_.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");s.push([String(_.group||"Erweiterungen"),_.id,String(_.label||_.id),_.defaultValue,_.min,_.max,_.step,String(_.help||"")])}function D(_){if(!_||!/^extension\.[a-z0-9_.]+$/.test(_.id)||typeof _.place!="function"||u.some(F=>F.id===_.id))throw Error("Ung\xFCltige Feature-Erweiterung.");u.push(_)}function C(_,F){return o.map(([A,I])=>F.get(l(_.q+A,_.r+I))).filter(Boolean)}function L(_,F,A,I,k,d=null,v=null){if(_==="arid"){if(A>k["biomes.dryThreshold"]-k["biomes.semiDesertMargin"])return"semi_desert";let M=P(I,v===null?I:v,k["geology.aridPatchMix"]),G=i(M+(k["geology.sandBias"]-.5)*.36);return S(G,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],k)}return _==="grassland"?A<k["geology.grassSparseHumidity"]?"sparse_pasture":I<k["geology.pastureSoil"]?"pasture":"grassland":_==="cold"?d&&d.hill>k["geology.highlandSoil"]&&F>=k["biomes.coldBoundary"]-k["geology.highlandColdMargin"]?"highland":F<k["biomes.coldBoundary"]-.04?A>k["biomes.snowHumidity"]?"snowfields":"frozen_tundra":F<k["biomes.coldBoundary"]&&A>.8?"snowfields":"tundra":_==="wetland"?F>k["geology.swampWarmBoundary"]?"swamp":F<.38?"moor":A>.85?"marshland":I>k["geology.wetlandSoil"]?"moor":"marshland":_==="jungle"?"jungle":_==="savanna"?A<.33?"semi_desert":"savanna":"grassland"}function O(_,F,A){return _<A["biomes.coldBoundary"]?"cold":F>A["biomes.wetThreshold"]?_>A["biomes.jungleWarmBoundary"]?"jungle":"wetland":F<A["biomes.dryThreshold"]&&_>A["biomes.aridWarmBoundary"]?"arid":_>A["biomes.warmBoundary"]?"savanna":F>A["biomes.wetlandBoundary"]?"wetland":"grassland"}function B(_,F,A,I){let k=Math.sqrt(I["biomes.targetHexes"]),d=I["biomes.borderWarp"]*k,v=F+d*(x(_,F,A,k*.72,"warp-a")-.5)*2,M=A+d*(x(_,F,A,k*.72,"warp-b")-.5)*2,G=Math.floor(v/k),U=Math.floor(M/k),Y=1/0,j=null;for(let Z=-1;Z<=1;Z++)for(let le=-1;le<=1;le++){let J=G+le,ge=U+Z,he=(J+.5+(p(_,J,ge,"jit-q")-.5)*.72)*k,se=(ge+.5+(p(_,J,ge,"jit-r")-.5)*.72)*k,Re=(v-he)*(v-he)+(M-se)*(M-se);Re<Y&&(Y=Re,j={id:l(J,ge),x:he,y:se})}return j}let N=(_,F)=>Math.max(Math.abs(_.q-F.q),Math.abs(_.r-F.r),Math.abs(_.q+_.r-F.q-F.r));function R(_,F,A,I,k=()=>!0){if(A<=0)return 1/0;let d=[];for(let v=0;v<1900;v++){let M=Math.floor((p(_,v,0,"sampleQ:"+F)-.5)*6900),G=Math.floor((p(_,v,1,"sampleR:"+F)-.5)*6900);k(M,G)&&d.push(I(M,G))}return d.length?(d.sort((v,M)=>M-v),d[Math.min(d.length-1,Math.floor(i(A)*d.length))]):1/0}function q(_,F){if(typeof _!="string"||_.length<1||_.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let A=W(F),I=c(r+":"+_),k={...A,"biomes.targetHexes":Math.max(5,A["geology.scale"]*1.5)},d=new Map,v=new Map,M=new Map,G=(T,z)=>l(T,z),U=(T,z)=>i(A["climate.temperature"]+(x(I,T,z,A["climate.scale"],"temp")-.5)*2*A["climate.tempVariation"]),Y=(T,z)=>i(A["climate.humidity"]+(x(I,T,z,A["climate.scale"]*.9,"wet")-.5)*2*A["climate.humidityVariation"]);function j(T,z){let oe=x(I,T,z,A["water.scale"],"sea"),te=x(I,T,z,Math.max(3,A["water.scale"]*.45),"sea-mid"),V=x(I,T,z,Math.max(2,A["water.scale"]*.21),"shore"),K=.2+.3*A["water.coastDetail"];return(oe+te)*.5*(1-K)+V*K}function Z(T,z){let oe=x(I,T,z,4.2,"lakes");return j(T,z)-Math.max(0,oe-.68)*A["water.lakeInfluence"]}let le=R(I,"water",A["water.fraction"],(T,z)=>-j(T,z));function J(T,z){let oe=G(T,z);if(d.has(oe))return d.get(oe);let te=-Z(T,z)>=le;return d.set(oe,te),te}function ge(T,z){let oe=G(T,z);if(v.has(oe))return v.get(oe);let te=x(I,T,z,A["relief.scale"],"relief"),V=Math.max(6,A["relief.chainLength"]),K=T+(x(I,T,z,V*.58,"m-warp-q")-.5)*11,ie=z+(x(I,T,z,V*.58,"m-warp-r")-.5)*11,Q=1-Math.abs(x(I,K*.56+ie*.36,ie*1.18,V,"ridge")-.5)*2,ee=1-Math.abs(x(I,K*.34-ie*.74,K*1.08,V*1.25,"ridge-b")-.5)*2,ce=Math.max(Q,ee*.86),Ce=Math.pow(ce,3.6),de=1-Math.abs(x(I,T*.92+z*.28,z*.96,7.5,"m-pass-a")-.5)*2,Ue=1-Math.abs(x(I,T*.28-z*.92,T*.96,8.2,"m-pass-b")-.5)*2,qe=Math.max(de,Ue),He=qe>.82?Math.pow((qe-.82)/.18,.7)*.62:0,Ze=.92-.14*i(A["relief.chainWidth"],.05,.95),ot=i(Ce*Ze+te*(1-Ze)-He,0,1),wt=i(ce*.65+te*.35,0,1),ft={mass:te,mountain:ot,oreBelt:wt,hill:te*.75+x(I,T,z,A["relief.scale"]*.46,"hills")*.25};return v.set(oe,ft),ft}let he=R(I,"mountain",A["relief.mountainFraction"],(T,z)=>ge(T,z).mountain,(T,z)=>!J(T,z)),se=(T,z)=>!J(T,z)&&ge(T,z).mountain>=he,Re=new Map,ve=(T,z)=>{let oe=G(T,z);if(Re.has(oe))return Re.get(oe);if(!se(T,z))return Re.set(oe,!1),!1;let te=!1;for(let V=-2;V<=2&&!te;V++){let K=Math.max(-2,-V-2),ie=Math.min(2,-V+2);for(let Q=K;Q<=ie;Q++)if(!(V===0&&Q===0)&&!se(T+V,z+Q)){te=!0;break}}return Re.set(oe,te),te},xe=R(I,"hills",A["relief.hillFraction"],(T,z)=>ge(T,z).hill,(T,z)=>!J(T,z)&&!ve(T,z)),be=(T,z)=>!J(T,z)&&!ve(T,z)&&ge(T,z).hill>=xe,ye=Math.min(16,Math.max(3,Math.ceil(A["climate.coastalDecay"]*3))),De=new Map;function we(T,z){let oe=G(T,z);if(De.has(oe))return De.get(oe);if(J(T,z))return De.set(oe,0),0;let te=ye+1;e:for(let V=1;V<=ye;V++)for(let K=-V;K<=V;K++){let ie=Math.max(-V,-K-V),Q=Math.min(V,-K+V);for(let ee=ie;ee<=Q;ee++)if(Math.max(Math.abs(K),Math.abs(ee),Math.abs(K+ee))===V&&J(T+K,z+ee)){te=V;break e}}return De.set(oe,te),te}let Ie=new Map;function Ae(T,z){let oe=G(T,z);if(M.has(oe))return M.get(oe);let te=U(T,z),V=Y(T,z),K=we(T,z),ie=i(V+A["climate.coastalHumidity"]*Math.exp(-K/A["climate.coastalDecay"])),Q=B(I,T,z,A);Ie.has(Q.id)||Ie.set(Q.id,{t:U(Q.x,Q.y),h:Y(Q.x,Q.y)});let ee=Ie.get(Q.id),ce=A["biomes.regionClimateMix"],Ce=i(ee.t*ce+te*(1-ce)),de=i(ee.h*ce+ie*(1-ce)),Ue=O(Ce,de,A),qe=x(I,T,z,A["geology.scale"],"soil"),He=ge(T,z),Ze=(Ue==="arid"&&A["geology.aridPatchMix"]>0?B(I,T,z,k):null)?.id.split(",").map(Number),ot=Ze?p(I,Ze[0],Ze[1],"arid-patch"):null,wt={t:te,h:ie,center:Q,family:Ue,soil:qe,landRelief:He,aridPatch:ot,riverPotential:i(ie*.68+He.mass*.18+Math.min(K,15)/30)};return M.set(oe,wt),wt}function Oe(T,z){return J(T,z)?o.some(([oe,te])=>!J(T+oe,z+te))?"coastal_water":U(T,z)<A["water.iceTemperature"]?"icy_ocean":x(I,T,z,A["water.scale"]*.8,"storm")>1-A["water.stormChance"]?"stormy_ocean":"ocean":"land"}function We(T){let z=(oe,te)=>p(I,T.q,T.r,"feature:"+oe)<te/1e3;T.surfaceClass==="land"&&T.reliefClass!=="mountain"?(z("iron",A["features.ironPer1000"])&&Ae(T.q,T.r).landRelief.oreBelt>.3&&T.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(T.baseBiome)&&z("animals",A["features.animalsPer1000"])&&(T.baseBiome==="wetland"||T.baseBiome==="jungle"?T.features.push("pigs"):T.baseBiome==="savanna"||T.terrainId==="sparse_pasture"?T.features.push("horses"):T.features.push(p(I,T.q,T.r,"species")>.5?"pigs":"horses")),z("ruins",A["features.ruinsPer1000"])&&T.features.push("ruins"),z("obelisk",A["features.obelisksPer1000"])&&T.features.push("obelisk"),T.baseBiome==="arid"&&z("oasis",A["features.oasesPer1000"])&&T.features.push("oasis")):T.surfaceClass!=="land"&&z("wreck",A["features.wrecksPer1000"])&&T.features.push("wreck");for(let oe of u)oe.place({hex:T,config:A,seed:_,random:te=>p(I,T.q,T.r,oe.id+":"+te)})&&T.features.push(oe.id);return T}function Ge(T,z){let oe=Oe(T,z),te=oe==="land",V=te?Ae(T,z):null,K=te&&ve(T,z),ie=te&&!K&&be(T,z),Q=te?V.family==="jungle"?1:V.family==="grassland"?.86:V.family==="wetland"?.76:V.family==="savanna"?.46:V.family==="cold"?.25:.08:0,ee=te?(x(I,T,z,A["forest.patchScale"],"forest")-.5)*1.6+A["forest.coverage"]-.3+(V.h-.5)*.35:0,ce=K?0:V?.family==="jungle"?Math.max(.76,i(ee)):i(ee)*Q,Ce=K?"none":V?.family==="jungle"||ce>=A["forest.denseThreshold"]*A["forest.denseFactor"]?"dense_forest":ce>A["forest.lightThreshold"]?"light_forest":"none";return{q:T,r:z,temperature:V?.t??U(T,z),humidity:V?.h??Y(T,z),regionId:V?.center.id??"",baseBiome:V?.family??null,terrainId:te?L(V.family,V.t,V.h,V.soil,A,V.landRelief,V.aridPatch):oe,surfaceClass:oe,reliefClass:K?"mountain":ie?"hills":"flat",hillProfile:ie?["rounded","steep","chain","plateau","ridge"][Math.floor(p(I,Math.floor(T/3),Math.floor(z/3),"hill-style")*5)]:null,hillStrength:ie?i(V.landRelief.hill*A["relief.hillVariation"]+(1-A["relief.hillVariation"])*.4):0,mountainClass:K?"massif":null,forestDensity:ce,forestClass:Ce,riverPotential:V?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function ae(T,z,oe,te){let V=A["rivers.maxLength"],K=A["rivers.minLength"],ie=V+1,Q=2*V+2,ee=(pe,fe)=>pe>=T&&pe<T+oe&&fe>=z&&fe<z+te,ce=T-Q,Ce=z-Q,de=oe+2*Q,Ue=te+2*Q,qe=new Int16Array(de*Ue);qe.fill(-1);let He=new Int32Array(de*Ue),et=new Int32Array(de*Ue),Ze=0,ot=0;for(let pe=0;pe<Ue;pe++){let fe=Ce+pe,Me=pe*de;for(let Te=0;Te<de;Te++){let Se=ce+Te;J(Se,fe)&&(qe[Me+Te]=0,He[ot]=Se,et[ot]=fe,ot++)}}for(;Ze<ot;){let pe=He[Ze],fe=et[Ze];Ze++;let Me=qe[(fe-Ce)*de+(pe-ce)];if(Me>=V)continue;let Te=Me+1;for(let Se=0;Se<6;Se++){let Le=pe+o[Se][0],Ee=fe+o[Se][1],ze=Le-ce,Ne=Ee-Ce;if(ze<0||ze>=de||Ne<0||Ne>=Ue)continue;let tt=Ne*de+ze;qe[tt]>=0||ve(Le,Ee)||(qe[tt]=Te,He[ot]=Le,et[ot]=Ee,ot++)}}let wt=[],ft=new Map,Zr=A["rivers.sourcesPer100"]/100,Qr=h("river-source"),Jr=h("river-turn"),ue=1/4294967296;function me(pe,fe){for(let[Me,Te]of[[pe,fe],[fe,pe]]){if(!ee(Me.q,Me.r)||J(Me.q,Me.r))continue;let Se=o.findIndex(([ze,Ne])=>Me.q+ze===Te.q&&Me.r+Ne===Te.r);if(Se<0)continue;let Le=G(Me.q,Me.r),Ee=ft.get(Le);Ee||(Ee=[],ft.set(Le,Ee)),Ee.includes(Se)||Ee.push(Se)}}for(let pe=z-ie;pe<z+te+ie;pe++)for(let fe=T-ie;fe<T+oe+ie;fe++){if(m(I,fe,pe,Qr)*ue>=Zr||qe[(pe-Ce)*de+(fe-ce)]<K||J(fe,pe)||ve(fe,pe)||Ae(fe,pe).riverPotential<.36)continue;let Te=[{q:fe,r:pe}],Se={q:fe,r:pe};for(let Le=0;Le<V;Le++){let Ee=qe[(Se.r-Ce)*de+(Se.q-ce)];if(Ee<=0)break;let ze=null,Ne=1/0;for(let tt=0;tt<6;tt++){let rt=Se.q+o[tt][0],Wt=Se.r+o[tt][1],nt=rt-ce,Mt=Wt-Ce;if(nt<0||nt>=de||Mt<0||Mt>=Ue||qe[Mt*de+nt]!==Ee-1)continue;let Et=ge(rt,Wt).hill*(1-A["rivers.meander"])+m(I,rt,Wt,Jr)*ue*A["rivers.meander"];Et<Ne&&(Ne=Et,ze={q:rt,r:Wt})}if(!ze)break;Se=ze,Te.push(Se)}if(!(!J(Se.q,Se.r)||Te.length-1<K)&&Te.some(Le=>ee(Le.q,Le.r))){wt.push(Te.map(Le=>[Le.q,Le.r]));for(let Le=1;Le<Te.length;Le++)me(Te[Le-1],Te[Le])}}for(let pe of ft.values())pe.sort((fe,Me)=>fe-Me);return{routes:wt,edgesByKey:ft}}function ne(T,z){return We(Ge(T,z))}return{c:A,s:I,spot:G,wet:J,relief:ge,isMountain:ve,isHill:be,field:Ae,surface:Oe,buildBaseCell:Ge,attachFeatures:We,sampleCell:ne,traceRivers:ae}}function $(_,F={}){if(typeof _!="string"||_.length<1||_.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let A=F.width===void 0?100:Number(F.width),I=F.height===void 0?80:Number(F.height),k=F.originQ===void 0?0:Number(F.originQ),d=F.originR===void 0?0:Number(F.originR);if(!Number.isSafeInteger(A)||!Number.isSafeInteger(I)||A<10||I<10||A*I>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(k)||!Number.isSafeInteger(d)||Math.abs(k)>1e6||Math.abs(d)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let v=q(_,F.config),{c:M,s:G,spot:U,wet:Y,relief:j,isMountain:Z,field:le,buildBaseCell:J,attachFeatures:ge}=v,he=[],se=new Map;for(let V=d;V<d+I;V++)for(let K=k;K<k+A;K++){let ie=J(K,V);he.push(ie),se.set(U(K,V),ie)}let Re=M["rivers.maxLength"],ve=M["rivers.minLength"],xe=Re+1,be=2*Re+2,ye=new Map,De=[];for(let V=d-be;V<d+I+be;V++)for(let K=k-be;K<k+A+be;K++)Y(K,V)&&(ye.set(U(K,V),0),De.push({q:K,r:V}));let we=k-be,Ie=k+A+be-1,Ae=d-be,Oe=d+I+be-1;for(let V=0;V<De.length;V++){let K=De[V],ie=ye.get(U(K.q,K.r));if(!(ie>=Re))for(let[Q,ee]of o){let ce=K.q+Q,Ce=K.r+ee,de=U(ce,Ce);ce<we||ce>Ie||Ce<Ae||Ce>Oe||Z(ce,Ce)||ye.has(de)||(ye.set(de,ie+1),De.push({q:ce,r:Ce}))}}let We=[],Ge=[];function ae(V,K){for(let[ie,Q]of[[V,K],[K,V]]){let ee=se.get(U(ie.q,ie.r));if(!ee||ee.surfaceClass!=="land")continue;ee.river=!0;let ce=o.findIndex(([Ce,de])=>ie.q+Ce===Q.q&&ie.r+de===Q.r);ce>=0&&!ee.riverEdges.includes(ce)&&ee.riverEdges.push(ce)}}for(let V=d-xe;V<d+I+xe;V++)for(let K=k-xe;K<k+A+xe;K++){if(Y(K,V)||Z(K,V)||p(G,K,V,"river-source")>=M["rivers.sourcesPer100"]/100)continue;let ie=ye.get(U(K,V));if(ie===void 0||ie<ve||le(K,V).riverPotential<.36)continue;let Q=[{q:K,r:V}],ee={q:K,r:V};for(let ce=0;ce<Re;ce++){let Ce=ye.get(U(ee.q,ee.r));if(Ce===0)break;let de=o.map(([qe,He])=>({q:ee.q+qe,r:ee.r+He})).filter(qe=>ye.get(U(qe.q,qe.r))===Ce-1);if(!de.length)break;let Ue=qe=>j(qe.q,qe.r).hill*(1-M["rivers.meander"])+p(G,qe.q,qe.r,"river-turn")*M["rivers.meander"];de.sort((qe,He)=>Ue(qe)-Ue(He)),ee=de[0],Q.push(ee)}if(!(!Y(ee.q,ee.r)||Q.length-1<ve)&&Q.some(ce=>se.has(U(ce.q,ce.r)))){Ge.push(Q),Q.every(ce=>se.has(U(ce.q,ce.r)))&&We.push(Q.map(ce=>[ce.q,ce.r]));for(let ce=1;ce<Q.length;ce++)ae(Q[ce-1],Q[ce])}}for(let V of he)ge(V),V.riverEdges.sort((K,ie)=>K-ie);let ne=he.filter(V=>V.surfaceClass==="land").length,T={total:he.length,land:ne,water:he.length-ne,coast:0,hills:0,mountains:0,rivers:We.length,riverCrossingCount:Ge.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},z=new Map;for(let V of he){V.surfaceClass==="coastal_water"&&T.coast++,V.reliefClass==="hills"&&T.hills++,V.reliefClass==="mountain"&&T.mountains++,V.river&&T.riverHexes++,V.forestClass!=="none"&&T.forest++,V.baseBiome&&(T.biomes[V.baseBiome]=(T.biomes[V.baseBiome]||0)+1,z.set(V.regionId,(z.get(V.regionId)||0)+1)),V.surfaceClass==="land"&&V.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(V.baseBiome)&&T.forestEligible++,T.terrains[V.terrainId]=(T.terrains[V.terrainId]||0)+1;for(let K of V.features)T.features[K]=(T.features[K]||0)+1}T.forestPercentLand=ne?+(100*T.forest/ne).toFixed(1):0,T.forestPercentEligible=T.forestEligible?+(100*T.forest/T.forestEligible).toFixed(1):0;let oe=[...z.values()].sort((V,K)=>V-K);T.biomeRegions={count:oe.length,min:oe[0]||0,average:oe.length?+(ne/oe.length).toFixed(1):0,median:oe.length?oe[Math.floor(oe.length/2)]:0,max:oe.at(-1)||0,within30to90:oe.filter(V=>V>=30&&V<=90).length};function te(V){let K=new Set,ie=0;for(let Q of he){let ee=U(Q.q,Q.r);if(K.has(ee)||!V(Q))continue;let ce=[Q];K.add(ee);for(let Ce=0;Ce<ce.length;Ce++)for(let de of C(ce[Ce],se)){let Ue=U(de.q,de.r);V(de)&&!K.has(Ue)&&(K.add(Ue),ce.push(de))}ie=Math.max(ie,ce.length)}return ie}return T.connectedLandPercent=ne?+(100*te(V=>V.surfaceClass==="land")/ne).toFixed(1):0,T.largestWaterBody=te(V=>V.surfaceClass!=="land"),{version:e,seed:_,width:A,height:I,originQ:k,originR:d,config:M,cells:he,riverPaths:We,riverPreviewPaths:Ge.map(V=>V.map(K=>[K.q,K.r])),stats:T,riverGeometry:"hex-edges"}}let X={VERSION:e,DIRS:o,TERRAIN_IDS:a,BIOME_IDS:n,parameterSchema:w,defaultConfig:H,normalizeConfig:W,aggregateDistributions:y,registerParameter:E,registerFeature:D,createPointSampler:q,generateWorld:$,getWorldCell:(_,F,A)=>{let I=_.originQ??0,k=_.originR??0;return F<I||A<k||F>=I+_.width||A>=k+_.height?null:_.cells[(A-k)*_.width+(F-I)]??null}};typeof fr<"u"&&fr.exports&&(fr.exports=X),t.VedrasGeography=X})(typeof window<"u"?window:globalThis)});var la=tn(hr());var ya=Math.sqrt(3),Qe=256/ya,Pe=.85,Ye=1.5*Qe,In=Ye*Pe,Fe=16,_e=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function ke(t,e){return{x:256*(t+e*.5),y:In*e}}function $e(t,e){let r=e/In,o=t/256-r*.5,a=-o-r,n=Math.round(o),s=Math.round(r),u=Math.round(a),i=Math.abs(n-o),l=Math.abs(s-r),c=Math.abs(u-a);return i>l&&i>c?n=-s-u:l>c&&(s=-n-u),{q:n===0?0:n,r:s===0?0:s}}function je(t,e,r,o){let a=t-r,n=e-o;return(Math.abs(a)+Math.abs(a+n)+Math.abs(n))/2}function Nt(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function st(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function Xt(t,e,r=Fe){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function Ct(t,e){return`${t},${e}`}function Be(t,e){return`${t},${e}`}function Tt(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,a=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,s=-1/0,u=1/0,i=-1/0;for(let l of a){let c=$e(l.x,l.y);c.q<n&&(n=c.q),c.q>s&&(s=c.q),c.r<u&&(u=c.r),c.r>i&&(i=c.r)}return{minQ:n-e,maxQ:s+e,minR:u-e,maxR:i+e}}function Dn(t,e=Fe,r=3){let o=Tt(t,r),a=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),s=Math.floor(o.minR/e),u=Math.floor(o.maxR/e),i=$e(t.x,t.y),l=i.q/e,c=i.r/e,f=[];for(let h=s;h<=u;h++)for(let m=a;m<=n;m++){let g=m+.5-l,p=h+.5-c;f.push({cq:m,cr:h,dist2:g*g+p*p})}return f.sort((h,m)=>h.dist2-m.dist2),f.map(({cq:h,cr:m})=>({cq:h,cr:m}))}function Bn(t,e,r,o=0){let a=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return a=Math.imul(a^a>>>15,2246822519)>>>0,a=Math.imul(a^a>>>13,3266489917)>>>0,(a^a>>>16)>>>0}function rn(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function mr(t,e){let r=256*(t+e*.5),o=Ye*e,a=[];for(let n=0;n<6;n++){let s=-Math.PI/2+n*Math.PI/3;a.push({x:r+Qe*Math.cos(s),y:(o+Qe*Math.sin(s))*Pe})}return a}function ht(t,e,r){let o=mr(t,e),a=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a,b:n,mid:{x:(a.x+n.x)*.5,y:(a.y+n.y)*.5}}}function lt(t,e,r,o){let a=r-t,n=o-e;for(let s=0;s<6;s++)if(_e[s][0]===a&&_e[s][1]===n)return s;return-1}function Je(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function qn(t,e){let r=$e(t,e),o=0,a=1/0;for(let l=0;l<6;l++){let{mid:c}=ht(r.q,r.r,l),f=t-c.x,h=e-c.y,m=f*f+h*h;m<a&&(a=m,o=l)}let[n,s]=_e[o],u=Je(r.q,r.r,r.q+n,r.r+s),i=lt(u.q1,u.r1,u.q2,u.r2);return{q1:u.q1,r1:u.r1,q2:u.q2,r2:u.r2,dir:i}}var mt={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},gr=new Set(["dead_trees","snow_dead_trees"]),on=new Set(["fallen_logs","snow_fallen_logs"]),xa=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),wa=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),pr=new Set(["snowfields","frozen_tundra","tundra","highland"]);var Hn=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),On=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),At=new Set(["snowfields","frozen_tundra"]),zt=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),an=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),Vn=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),Sa=new Set([...Vn,"savanna","jungle"]);function at(t,e,r){return t<e?e:t>r?r:t}function re(t,e,r,o=0,a=97,n=513,s=11){let u=(t|0)^Math.imul(e+a,374761393)^Math.imul(r+n,668265263)^Math.imul(o+s,2246822519);return u^=u>>>13,u=Math.imul(u,1274126177),((u^u>>>16)>>>0)/4294967296}function Yt(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function _a(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var Kt=new Set(["ocean","coastal_water","stormy_ocean"]);function Pt(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function br(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function sn(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function ln(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function vr(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function yr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function cn(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function Nn(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:an.has(t)?.14:0}function un(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*(Yt(t)?.32:.25):wa.has(t.family??"")?e:e*1.2}function xr(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"||e==="snow_mountains"}function Lt(t){if(!t||t.kind==="mountain")return 1;let e=un(t),r=t.family??"",o=$t(t)==="cacti"?1.55:1;return gr.has(r)?.58*e:on.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.tags?.includes("round_cactus")||/^(?:existing_)?cactus_0?[12]$/.test(t.id??"")||t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_decal"?1.05:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function Xn(t){return!!t&&t.kind==="tree"&&!gr.has(t.family??"")}function zn(t){return!!t&&xa.has(t.family??"")}function Yn(t){let e=t?.family??"";return gr.has(e)?"dead_trees":on.has(e)?"fallen_logs":null}function Kn(t){let e=t?.family??"";return gr.has(e)?.11:on.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function $n(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function jn(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function $t(t){let e=jn(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}var Un=new Set(["snowfields","frozen_tundra","tundra","highland"]),Ca=new Set(["highland","tundra","grassland","pasture","sparse_pasture","forest_floor","moor","marshland","swamp"]),Zn=new Set(["desert","sandy_desert","rocky_desert","sandy_rocky_desert","clay_desert","badlands","sandy_badlands","rocky_badlands","semi_desert","wasteland","savanna","dry_ground"]),Ra=new Set([...Vn,"forest_floor","highland","jungle",...Zn]);function Qn(t){if(!t||t.kind!=="mountain")return!1;let e=String(t.id??"");if(t.family==="snow_mountains"||/^snow_mountain_\d+$/.test(e)||/^(?:existing_)?berg_(?:0?[1-9]|1[0-6])$/.test(e))return!0;let r=t.tags??[];return r.includes("arctic_snow_mountain")||r.includes("alpine_snow_mountain")||r.includes("snow_tipped_mountain")}function jt(t){let e=String(t.id??""),r=jn(t);return Pt(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?Kt:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||yr(t)?an:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?pr:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?Hn:_a(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?pr:Yt(t)?Hn:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?Sa:/^snow_mountain_\d+$/.test(e)||t.family==="snow_mountains"||/^(?:existing_)?berg_(?:1[4-6])$/.test(e)||/^(?:existing_)?berg_0?[1-4]$/.test(e)?Un:/^(?:existing_)?berg_(?:0?[5-9]|1[0-3])$/.test(e)?Ca:/^desert_mountain_\d+$/.test(e)||t.family==="desert_mountains"?Zn:/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?Ra:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function Jn(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,a=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),s=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),u=new Set;for(let[i,l]of Object.entries(e.terrain.byType))s.has(i)||(l.categoryId&&a.has(l.categoryId)||n.has(i))&&u.add(i);return u}function nn(t,e,r,o,a,n=!1){if(!e)return!1;let s=o.terrain.byType[e];if(Pt(t))return Kt.has(e);if(s&&s.materialClass!=="ground")return!1;let i=a?a.ecoFamily:$t(t),l=e,c=a?a.strict:jt(t);if(c)return c.has(l);let f=n||r.some(p=>{let b=o.terrain.byType[p]?.materialClass;return b==="water"||b==="shoreline"}),h=r.some(p=>p==="jungle"||p==="savanna"),m=r.some(p=>p==="moor"||p==="swamp"||p==="marshland");if(i==="mangroves")return(l==="swamp"||l==="marshland")&&(f||h);if(i==="palms")return l==="jungle"||l==="savanna"||l==="tropical_coast"||zt.has(l);if(i==="jungle_trees"||i==="tropical_bushes")return l==="jungle";if(i==="savanna_trees")return l==="savanna"||l==="semi_desert"||cn(t)&&zt.has(l);if(i==="cacti")return l==="rocky_desert"||l==="sandy_desert"||l==="clay_desert"||l==="desert"||l==="semi_desert"||l==="sandy_rocky_desert"||l==="savanna";if(i==="succulents")return l==="savanna"||l==="semi_desert"||l==="rocky_desert"||l==="sandy_desert"||l==="sandy_rocky_desert"||l==="badlands"||l==="desert";if(i==="ferns")return l==="forest_floor"||l==="grassland"||l==="pasture"||l==="moor"||l==="swamp"||l==="marshland"||l==="jungle";if(i==="reeds")return l==="moor"||l==="swamp"||l==="marshland"||(l==="grassland"||l==="pasture"||l==="sparse_pasture")&&(f||m);if(i==="cold_bushes")return l==="tundra"||l==="frozen_tundra"||l==="highland";if(i==="snow_conifers"||i==="snow_dead_trees"||i==="snow_deadwood"||i==="snow_fallen_logs")return pr.has(l);if(i==="riparian_trees")return l==="moor"||l==="swamp"||l==="marshland"||(l==="grassland"||l==="pasture")&&(f||m);let g=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(l==="snowfields"||l==="frozen_tundra")&&!g?!1:i==="dry_patches"?an.has(l):sn(t)?!(l==="jungle"||l==="moor"||l==="swamp"||l==="marshland"||l==="snowfields"||l==="frozen_tundra"):i==="dry_bushes"?!(l==="jungle"||l==="moor"||l==="swamp"||l==="marshland"||l==="tundra"||l==="highland"):i==="herbs"?!(l==="jungle"||l==="swamp"||l==="marshland"||l==="ocean"||l==="snowfields"||l==="frozen_tundra"):i==="flowering_bushes"||i==="temperate_bushes"||i==="heath"?!(l==="jungle"||l==="rocky_desert"||l==="sandy_desert"||l==="clay_desert"):!0}function eo(t,e,r,o,a){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,s=r.biome||n;if(Pt(t))return Kt.has(n)&&e.has(n);if(Yt(t)&&(n==="jungle"||s==="jungle"))return!1;let u=o.terrain.byType[n],i=o.terrain.byType[s];if(u?.materialClass!=="ground"||i?.materialClass!=="ground")return!1;let l=a?a.strict:jt(t);if(l){if(!l.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let c=n==="jungle"||n==="savanna",f=r.forestClass==="light_forest"||r.forestClass==="dense_forest",h=a?a.ecoFamily:$t(t),m=s==="jungle",g=n==="moor"||n==="swamp"||n==="marshland";if(m&&!c||t.family==="palms"&&(!(c||zt.has(n))||g||pr.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!m||f&&(h==="cacti"||h==="succulents"||h==="dry_bushes")||!(e.has(s)||e.has(n)||f&&e.has("forest_floor")&&t.family!=="palms"))return!1;let b=!!r.hasRiverEdge;return l?nn(t,n,r.neighborTypes,o,a,b):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!nn(t,n,r.neighborTypes,o,a,b)?!1:nn(t,s,r.neighborTypes,o,a,b)}function to(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let a=o.terrain.byType[r];if(!a||a.materialClass!=="ground")return!1;let n=jt(t);return n&&!n.has(r)?!1:e.has(r)}function Ma(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function Gn(t,e,r){let o=e/3,a=r/3,n=Math.floor(o),s=Math.floor(a),u=o-n,i=a-s,l=u*u*(3-2*u),c=i*i*(3-2*i),f=re(t,n,s,2301,8191,4093,17),h=re(t,n+1,s,2301,8191,4093,17),m=re(t,n,s+1,2301,8191,4093,17),g=re(t,n+1,s+1,2301,8191,4093,17);return 2*((f+(h-f)*l)*(1-c)+(m+(g-m)*l)*c)-1}function ro(t,e,r,o){let a=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:mt.mode,s=at(o?.canopyCover??mt.canopyCover,.35,.98),u=at(o?.canopyVariation??mt.canopyVariation,0,.3),i=at(o?.gladeRate??mt.gladeRate,0,.3),l=at(o?.edgeStrength??mt.edgeStrength,0,1);for(let c of t){let f=Be(c.q,c.r),h=c.terrainId==="jungle",m=Ma(c.terrainId,e),g=at(c.forestDensity||0,0,1),p,b;if(h){let S=.5+.5*Gn(r+137,c.q,c.r),P=.5+.5*Math.sin(c.q*.62-c.r*.44+r%71)*Math.cos(c.q*.37+c.r*.71),x=at(.46+.42*S+.14*P,.36,.98),w=g>.01?at(g*(.68+.34*x),.32,.98):x;p=w>=.62?"dense_forest":"light_forest",b=w}else p=c.forestClass??(c.forestDensity>=.65?"dense_forest":c.forestDensity>.08?"light_forest":"none"),b=p==="none"?0:g>.01?g:p==="dense_forest"?1:.44;a.set(f,{q:c.q,r:c.r,key:f,baseBiome:c.terrainId,biome:h?"jungle":c.terrainId,jungle:h,suitability:m,forestMode:n,forestClass:m>0?p:"none",baseDensity:m>0?b:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let c of a.values()){if(!c.suitability)continue;let f=0;for(let[h,m]of _e){let g=a.get(Be(c.q+h,c.r+m));g&&g.baseDensity>f&&(f=g.baseDensity)}c.edgeInfluence=at(f*(c.baseDensity?.18:.48)*l*c.suitability,0,.46),c.density=at(c.baseDensity+c.edgeInfluence,0,1)}if(n==="canopy"&&i>0){let c=at(i*.55,0,.19),f=[];for(let h of a.values()){if(h.forestClass!=="dense_forest")continue;let m=0;for(let[S,P]of _e)a.get(Be(h.q+S,h.r+P))?.forestClass==="dense_forest"&&m++;if(m<2)continue;let g=re(r,h.q,h.r,1864,8191,4093,17),p=h.jungle?c*.62:c;if(g>=p)continue;let b=!1;for(let S=-2;S<=2&&!b;S++)for(let P=-2;P<=2;P++){if(P===0&&S===0||Math.abs(P+S)>2)continue;let x=a.get(Be(h.q+P,h.r+S));if(!(!x||x.forestClass!=="dense_forest")&&re(r,x.q,x.r,1864,8191,4093,17)<g){b=!0;break}}b||f.push(h)}for(let h of f){h.glade=!0;let m=h.jungle?.45:.84;if(re(r,h.q,h.r,1954,8191,4093,17)<m){let g=null,p=1/0;for(let[b,S]of _e){let P=a.get(Be(h.q+b,h.r+S));if(!P||P.forestClass!=="dense_forest"||P.jungle!==h.jungle)continue;let x=re(r,P.q,P.r,1953,8191,4093,17);x<p&&(p=x,g=P)}g&&(g.glade=!0)}}}for(let c of a.values()){if(!c.suitability)continue;if(c.glade){c.gladeX=Math.round((re(r,c.q,c.r,2041,8191,4093,17)-.5)*52),c.gladeY=Math.round((re(r,c.q,c.r,2042,8191,4093,17)-.5)*40);let g=c.jungle?46:58;c.gladeRadius=g+Math.round(re(r,c.q,c.r,2043,8191,4093,17)*18)}let f=c.forestClass==="dense_forest"?1:c.forestClass==="light_forest"?c.jungle?.62:.49:c.edgeInfluence>.08?.17:0,h=Gn(r,c.q,c.r),m=at(s+u*h,.12,.98);c.canopyCoverage=at(m*f*(.58+.42*c.density)*c.suitability*(c.glade?c.jungle?.34:.24:1),0,.98)}return a}function no(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function oo(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function dn(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,a=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return a*a+n*n<.94*.94}function ao(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function Zt(t,e,r,o){let a=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*re(t,e,r,a,173,311,79);for(let[s,u]of _e)n+=.5/6*re(t,e+s,r+u,a,173,311,79);return at(1+(n-.5)*1.5,.6,1.4)}function io(t,e,r,o,a,n){let u=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,i=(re(t,e,r,u,173,311,79)-.5)*154,l=(re(t,e,r,u+1,173,311,79)-.5)*146,c=re(t,e,r,a*127+n*2+17,173,311,79),f=re(t,e,r,a*127+n*2+18,173,311,79),h=(c-.5)*242,m=(f-.5)*258,g=n>=26?0:o==="tree"?.43:.68,p=o==="tree"?170:126,b=i+(c-.5)*p,S=l+(f-.5)*p;return{dx:h*(1-g)+b*g,dy:m*(1-g)+S*g}}function wr(t,e,r=0){let o=Math.abs(t),a=Math.abs(e);return a<=Qe-r&&o<=Math.min(128,Math.sqrt(3)*(Qe-a))-r}function so(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:re(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var _r=128,Jt=78,Dt={enabled:!0,strength:Jt,lighting:!0,style:"sculpted"},hn=168,mn=127,Qt=hn+mn;function gt(t,e,r){return t<e?e:t>r?r:t}function It(t){let e=gt(t,0,1);return e*e*(3-2*e)}function lo(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function Sr(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function fn(t,e,r){let o=Math.floor(t),a=Math.floor(e),n=t-o,s=e-a,u=n*n*n*(n*(n*6-15)+10),i=s*s*s*(s*(s*6-15)+10),l=Sr(o,a,r),c=Sr(o+1,a,r),f=Sr(o,a+1,r),h=Sr(o+1,a+1,r);return(l+(c-l)*u)*(1-i)+(f+(h-f)*u)*i}function Ea(t,e,r){let o=fn(t/380,e/380,r^324508639),a=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,s=fn(a,n,r^610839777),u=(t*.3255682-e*.9455186)/105,i=(t*.9455186+e*.3255682)/105,l=fn(u,i,r^916255320);return{plainSwell:o*.78+s*.22,ridgeDetail:o*.34+s*.46+l*.2}}function co(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function Ta(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let a=r?.categoryId??"";return(a==="wetlands"?.3:a==="cold_regions"?.25:a==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function uo(t,e,r,o=Jt,a="sculpted"){let n=[],s=[];for(let i=0;i<t.length;i++){let l=t[i],c=256*(l.q+l.r*.5),f=Ye*l.r;if(co(l,e)){s.push({x:c,y:f});continue}if(l.reliefClass!=="hills")continue;let h=gt(l.hillStrength??.7,0,1);if(h<=0)continue;let m=(Math.imul(l.q,73856093)^Math.imul(l.r,19349663)^r)>>>0,g=(lo(m)-.5)*1.7,p=l.hillProfile||"rounded",b=p==="ridge"||p==="chain"?560:440;n.push({x:c,y:f,ca:Math.cos(g),sa:Math.sin(g),shape:p,weight:.42+.58*h,reach:b})}let u=o>0?a==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:s,strengthPct:o,heightGain:u,seedInt:r,style:a}}function fo(t,e,r){let o=e*t.ca+r*t.sa,a=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(a/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(a/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,a/158),3.1)):t.shape==="plateau"?1-It((Math.hypot(o/188,a/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(a/180)**2))}function ho(t,e,r,o,a,n,s,u){if(n<=0||e<=.004)return 0;if(u==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:i,ridgeDetail:l}=Ea(r,o,s),c=Math.max(0,i-.38)*14*(a/100)*e;if(t<=1e-4)return c;let f=1-Math.exp(-t*.76),h=n*f*(.76+.42*l)*e;return Math.min(_r,h+c*.55)}function mo(t,e,r){if(t.heightGain<=0)return 0;let o=0,a=t.waters,n=Qt*Qt;for(let l=0;l<a.length;l++){let c=a[l],f=e-c.x,h=r-c.y;if(Math.abs(f)>Qt||Math.abs(h)>Qt)continue;let m=f*f+h*h;if(m<n){let g=1-It((Math.sqrt(m)-hn)/mn);g>o&&(o=g)}}let s=1-o;if(s<=.004)return 0;let u=0,i=t.hills;for(let l=0;l<i.length;l++){let c=i[l],f=e-c.x,h=r-c.y;Math.abs(f)>c.reach||Math.abs(h)>c.reach||(u+=fo(c,f,h)*c.weight)}return ho(u,s,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function po(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),a=t.width/(r-1),n=t.height/(o-1),s=1/a,u=1/n,i=r*o,l=new Float32Array(i),c=new Float32Array(i),f=new Float32Array(i),h=new Float32Array(i),m=new Float32Array(i),g=new Float32Array(i),p=new Float32Array(i),b=520,S=Math.floor((t.top-b)/Ye)-2,P=Math.ceil((t.top+t.height+b)/Ye)+2,x=t.reliefStyle??"sculpted",w=t.reliefStrength??Jt,H=w>0?x==="sculpted"?112*(w/100):67*(w/100)*1.2:0,W=(D,C,L,O,B,N)=>{let R=Math.max(0,Math.floor((C-N-t.left)*s)),q=Math.min(r-1,Math.ceil((C+N-t.left)*s)),$=Math.max(0,Math.floor((L-N-t.top)*u)),X=Math.min(o-1,Math.ceil((L+N-t.top)*u)),_=N*N;for(let F=$;F<=X;F++){let A=t.top+F*n-L,I=A*A,k=F*r;for(let d=R;d<=q;d++){let v=t.left+d*a-C,M=v*v+I;if(M>=_)continue;let G=1-It((Math.sqrt(M)-O)/B);G>D[k+d]&&(D[k+d]=G)}}};for(let D=S;D<=P;D++){let C=Math.floor((t.left-b)/256-D*.5)-2,L=Math.ceil((t.left+t.width+b)/256-D*.5)+2;for(let O=C;O<=L;O++){let B=t.lookupHex(O,D);if(!B||B.fogState===0)continue;let N=256*(O+D*.5),R=Ye*D;if(co(B,t.manifest)){W(f,N,R,hn,mn,Qt),W(h,N,R,108,48,160);continue}if((B.terrainId==="snowfields"||B.terrainId==="frozen_tundra"||B.terrainId==="jungle")&&W(h,N,R,108,48,160),H>0&&B.reliefClass==="hills"){let X=gt(B.hillStrength??.7,0,1);if(X>0){let _=(Math.imul(O,73856093)^Math.imul(D,19349663)^t.seedInt)>>>0,F=(lo(_)-.5)*1.7,A=B.hillProfile||"rounded",I=A==="ridge"||A==="chain"?560:440,k={x:N,y:R,ca:Math.cos(F),sa:Math.sin(F),shape:A,weight:.42+.58*X,reach:I},d=Math.max(0,Math.floor((N-I-t.left)*s)),v=Math.min(r-1,Math.ceil((N+I-t.left)*s)),M=Math.max(0,Math.floor((R-I-t.top)*u)),G=Math.min(o-1,Math.ceil((R+I-t.top)*u));for(let U=M;U<=G;U++){let Y=t.top+U*n-R,j=U*r;for(let Z=d;Z<=v;Z++){let le=t.left+Z*a-N,J=fo(k,le,Y);J>1e-4&&(l[j+Z]+=J*k.weight)}}}}let $=Ta(B,t.manifest);if($>.01){let _=Math.max(0,Math.floor((N-172-t.left)*s)),F=Math.min(r-1,Math.ceil((N+172-t.left)*s)),A=Math.max(0,Math.floor((R-172-t.top)*u)),I=Math.min(o-1,Math.ceil((R+172-t.top)*u)),k=29584;for(let d=A;d<=I;d++){let v=t.top+d*n-R,M=v*v,G=d*r;for(let U=_;U<=F;U++){let Y=t.left+U*a-N,j=Y*Y+M;if(j>=k)continue;let Z=1-It((Math.sqrt(j)-110)/56);if(Z>0){let le=G+U,J=m[le]+Z*1.15;m[le]=J>1?1:J,$>g[le]&&(g[le]=$)}}}if(B.glade){let d=N+(B.gladeX??0),v=R+(B.gladeY??0),M=B.gladeRadius??64,G=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[U,Y,j]of G){let Z=d+M*U,le=v+M*Y,J=M*j,ge=J*J,he=Math.max(0,Math.floor((Z-J-t.left)*s)),se=Math.min(r-1,Math.ceil((Z+J-t.left)*s)),Re=Math.max(0,Math.floor((le-J-t.top)*u)),ve=Math.min(o-1,Math.ceil((le+J-t.top)*u));for(let xe=Re;xe<=ve;xe++){let be=t.top+xe*n-le,ye=be*be,De=xe*r;for(let we=he;we<=se;we++){let Ie=t.left+we*a-Z,Ae=Ie*Ie+ye;if(Ae>=ge)continue;let Oe=1-It((Math.sqrt(Ae)-J*.14)/(J*.86)),We=De+we;Oe>p[We]&&(p[We]=Oe)}}}}}}}for(let D=0;D<o;D++){let C=t.top+D*n,L=D*r;for(let O=0;O<r;O++){let B=L+O,N=1-f[B];if(N<=.004||H<=0)continue;let R=t.left+O*a;c[B]=ho(l[B],N,R,C,w,H,t.seedInt,x)}}let y=new Uint8Array(i*4),E=Math.max(1,(a+n)*.5);for(let D=0;D<o;D++){let C=D>0?D-1:0,L=D<o-1?D+1:o-1,O=Math.max(1,(L-C)*n),B=D*r;for(let N=0;N<r;N++){let R=N>0?N-1:0,q=N<r-1?N+1:r-1,$=Math.max(1,(q-R)*a),X=B+N,_=c[X],F=c[B+R],A=c[B+q],I=c[C*r+N],k=c[L*r+N],d=(A-F)/$,v=(k-I)/O,M;if(x==="sculpted"){let j=((F+A+I+k)*.25-_)/E,Z=gt(-j*1.45,-.1,.12);M=gt(1-2.45*d-.65*v+Z,.6,1.36)}else M=gt(1-2.15*d-.48*v,.66,1.32);let G=1-h[X],U=m[X]>.01&&G>.01?It((m[X]-.12)/.72)*g[X]*(1-p[X]*.94)*G:0,Y=X*4;y[Y]=Math.round(gt(_/_r,0,1)*255),y[Y+1]=Math.round(gt((M-.52)/.96,0,1)*255),y[Y+2]=Math.round(gt(U,0,1)*255),y[Y+3]=Math.round(gt(1-f[X],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:y,heights:c}}function go(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),a=(r-t.top)/t.height*(t.rows-1);if(o<0||a<0||o>=t.cols-1||a>=t.rows-1)return 0;let n=Math.floor(o),s=Math.floor(a),u=o-n,i=a-s,l=s*t.cols+n,c=t.heights[l],f=t.heights[l+1],h=t.heights[l+t.cols],m=t.heights[l+t.cols+1];return(c*(1-u)+f*u)*(1-i)+(h*(1-u)+m*u)*i}var pn=65536,Cr=16,bt={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function Aa(t){if(!t)return bt.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?bt.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?bt.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?bt.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?bt.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?bt.forest:r==="hills"?bt.rock:bt.earth}var Pa=`#version 300 es
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
`,ka=`#version 300 es
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
`;function tr(t,e){return{x:256*(t+e*.5),y:Ye*e}}function qt(t,e){let r=tr(t,e),o=[];for(let a=0;a<6;a++){let n=-Math.PI/2+a*Math.PI/3;o.push({x:r.x+Qe*Math.cos(n),y:r.y+Qe*Math.sin(n)})}return o}function er(t,e,r,o){let a=r-t,n=o-e;for(let s=0;s<6;s++)if(_e[s][0]===a&&_e[s][1]===n)return s;return-1}function Wa(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function bo(t,e){for(let r=0;r<6;r++)if(Wa(t[r],e))return r;return-1}function Bt(t,e,r,o){let a=qt(t,e),n=bo(a,r),s=bo(a,o);if(n<0||s<0)return[r,o];let u=(s-n+6)%6,i=(n-s+6)%6,l=u<=i?1:-1,c=Math.min(u,i),f=[];for(let h=0;h<=c;h++)f.push(a[(n+l*h+12)%6]);return f}function gn(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],a=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let u=1;u<n;u++){let i=t[u-1],l=t[u],c=t[u+1],f=l.x-i.x,h=l.y-i.y,m=c.x-l.x,g=c.y-l.y,p=Math.hypot(f,h),b=Math.hypot(m,g);if(p<1e-4||b<1e-4)continue;if((f*m+h*g)/(p*b)>.995){o.push(l);continue}let P=Math.min(p*.16,b*.16,Math.max(12,a*.85)),x={x:l.x-f/p*P,y:l.y-h/p*P},w={x:l.x+m/b*P,y:l.y+g/b*P};o.push(x);for(let H=1;H<6;H++){let W=H/6,y=1-W;o.push({x:y*y*x.x+2*y*W*l.x+W*W*w.x,y:y*y*x.y+2*y*W*l.y+W*W*w.y})}o.push(w)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let s=[];for(let u=0;u<o.length;u++)(u===0||Math.hypot(o[u].x-s[s.length-1].x,o[u].y-s[s.length-1].y)>1e-4)&&s.push(o[u]);return s}function vo(t,e){let r=$e(t.x,t.y*Pe),o=Qe*1.15,a=[];for(let n=-1;n<6;n++){let s=n<0?r.q:r.q+_e[n][0],u=n<0?r.r:r.r+_e[n][1],i=tr(s,u);Math.hypot(t.x-i.x,t.y-i.y)<=o&&e(s,u)&&a.push(i)}return a}function rr(t,e=34,r){let o=t.hexes;if(!o||o.length<2)return null;let a=o.length-1,n=[];for(let R=0;R<a;R++){let[q,$]=o[R],[X,_]=o[R+1],F=er(q,$,X,_);if(F<0)return null;let A=qt(q,$);n.push([A[F],A[(F+1)%6]])}let s=er(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,i=qt(o[0][0],o[0][1])[u],l=n.map(()=>[1/0,1/0]),c=n.map(()=>[0,0]);for(let R=0;R<2;R++)l[0][R]=Bt(o[0][0],o[0][1],i,n[0][R]).length-1;for(let R=1;R<a;R++)for(let q=0;q<2;q++)for(let $=0;$<2;$++){let X=Bt(o[R][0],o[R][1],n[R-1][$],n[R][q]).length-1,_=l[R-1][$]+X;_<l[R][q]&&(l[R][q]=_,c[R][q]=$)}let f=new Array(a),h=l[a-1][0]<=l[a-1][1]?0:1;for(let R=a-1;R>=0;R--)f[R]=n[R][h],h=c[R][h];let m=[];for(let R=0;R<a;R++){let q=R===0?i:f[R-1],$=f[R],X=Bt(o[R][0],o[R][1],q,$);for(let _=0;_<X.length;_++)(m.length===0||Math.hypot(X[_].x-m[m.length-1].x,X[_].y-m[m.length-1].y)>1e-4)&&m.push(X[_])}if(m.length<2)return null;let g=o[a-1],p=o[a];if(er(g[0],g[1],p[0],p[1])<0)return null;let S=m.length-1,P=tr(p[0],p[1]);if(r)for(let R=1;R<m.length;R++){let q=vo(m[R],r);if(q.length>0){S=R;let $=0,X=0;for(let _=0;_<q.length;_++)$+=q[_].x,X+=q[_].y;P={x:$/q.length,y:X/q.length};break}}let x=m.slice(0,S+1),w=x[x.length-1],H=P.x-w.x,W=P.y-w.y,y=Math.hypot(H,W)||1,E=H/y,D=W/y,C=Math.max(54,e*2.15),L={x:w.x+E*C,y:w.y+D*C};x.push(L);let O=gn(x,e,!1);if(O.length<2)return null;let B=O.length-2,N=1/0;for(let R=0;R<O.length;R++){let q=(O[R].x-w.x)**2+(O[R].y-w.y)**2;q<N&&(N=q,B=R)}return{id:t.id,points:O,mouthCrossIdx:B,mouthCrossPos:w,mouthDirX:E,mouthDirY:D,mouthReach:C,width:e,hasMouth:!0}}function yo(t,e){let r=new Set,o=t.hexes;if(!o||o.length<2)return r;let a=o.length-1,n=[];for(let b=0;b<a;b++){let[S,P]=o[b],[x,w]=o[b+1],H=er(S,P,x,w);if(H<0)return r;let W=qt(S,P);n.push([W[H],W[(H+1)%6]])}let s=er(o[0][0],o[0][1],o[1][0],o[1][1]),u=t.corner??(s+3)%6,i=qt(o[0][0],o[0][1])[u],l=n.map(()=>[1/0,1/0]),c=n.map(()=>[0,0]);for(let b=0;b<2;b++)l[0][b]=Bt(o[0][0],o[0][1],i,n[0][b]).length-1;for(let b=1;b<a;b++)for(let S=0;S<2;S++)for(let P=0;P<2;P++){let x=Bt(o[b][0],o[b][1],n[b-1][P],n[b][S]).length-1,w=l[b-1][P]+x;w<l[b][S]&&(l[b][S]=w,c[b][S]=P)}let f=new Array(a),h=l[a-1][0]<=l[a-1][1]?0:1;for(let b=a-1;b>=0;b--)f[b]=n[b][h],h=c[b][h];let m=[];for(let b=0;b<a;b++){let S=b===0?i:f[b-1],P=f[b],x=Bt(o[b][0],o[b][1],S,P);for(let w=0;w<x.length;w++)(m.length===0||Math.hypot(x[w].x-m[m.length-1].x,x[w].y-m[m.length-1].y)>1e-4)&&m.push(x[w])}if(m.length<2)return r;let g=m.length-1;if(e){for(let b=1;b<m.length;b++)if(vo(m[b],e).length>0){g=b;break}}let p=256*.56;for(let b=0;b<g;b++){let S=(m[b].x+m[b+1].x)*.5,P=(m[b].y+m[b+1].y)*.5,x=$e(S,P*Pe),w=[];for(let H=-1;H<6;H++){let W=H<0?x.q:x.q+_e[H][0],y=H<0?x.r:x.r+_e[H][1],E=tr(W,y),D=Math.hypot(S-E.x,P-E.y);D<=p&&w.push({q:W,r:y,d:D})}if(w.sort((H,W)=>H.d-W.d),w.length>=2){let H=w[0],W=w[1],E=H.q<W.q||H.q===W.q&&H.r<=W.r?`${H.q},${H.r}|${W.q},${W.r}`:`${W.q},${W.r}|${H.q},${H.r}`;r.add(E)}}return r}function bn(t,e=34){if(!t||t.length===0)return[];let r=i=>`${Math.round(i.x*2)},${Math.round(i.y*2)}`,o=[],a=new Set,n=new Map;for(let i of t){let l=(i.dir%6+6)%6,c=qt(i.q,i.r),f=c[l],h=c[(l+1)%6],m=r(f),g=r(h),p=m<g?`${m}|${g}`:`${g}|${m}`;if(a.has(p))continue;a.add(p);let b=o.length;o.push({a:f,b:h,ka:m,kb:g,used:!1});let S=n.get(m)??[];S.push(b),n.set(m,S);let P=n.get(g)??[];P.push(b),n.set(g,P)}let s=[],u=(i,l)=>{let c=o[i];c.used=!0;let f=l?[c.a,c.b]:[c.b,c.a],h=l?c.kb:c.ka;for(;;){let m=n.get(h);if(!m)break;let g=-1;for(let b of m)if(!o[b].used){g=b;break}if(g<0)break;let p=o[g];p.used=!0,p.ka===h?(f.push(p.b),h=p.kb):(f.push(p.a),h=p.ka)}return f};for(let i=0;i<2;i++)for(let l=0;l<o.length;l++)if(!o[l].used)if(i===0){let c=n.get(o[l].ka)?.length??0,f=n.get(o[l].kb)?.length??0;if(c!==1&&f!==1)continue;let h=u(l,c===1);s.push({id:`edge_${l}`,points:gn(h,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let c=u(l,!0);s.push({id:`edge_${l}`,points:gn(c,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return s}var Rr=class{constructor(e){this.verts=new Float32Array(pn*Cr);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,Pa),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,ka),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let a=e.createProgram();if(!a)throw new Error("Failed to allocate river program");if(e.attachShader(a,r),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(a)}`);this.program=a;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=Cr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,u,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,u,48),e.bindVertexArray(null);let i=l=>{let c=e.getUniformLocation(a,l);if(!c)throw new Error(`Missing river uniform: ${l}`);return c};this.uCamCenter=i("u_camCenter"),this.uViewportSize=i("u_viewportSize"),this.uZoom=i("u_zoom"),this.uCoastalWaterLayer=i("u_coastalWaterLayer"),this.uTime=i("u_time"),this.uWindEnabled=i("u_windEnabled"),this.uPassMode=i("u_passMode"),e.useProgram(a),e.uniform1i(e.getUniformLocation(a,"u_terrainArray"),0)}getCachedCourse(e,r=34,o){let a=`${e.id}@${r}@${o?"w":"0"}`;if(this.courseCache.has(a))return this.courseCache.get(a)??null;let n=rr(e,r,o);if(this.courseCache.set(a,n),this.courseCache.size>512){let s=this.courseCache.keys().next().value;s!==void 0&&this.courseCache.delete(s)}return n}pushVertex(e,r,o,a,n,s,u,i,l,c,f,h,m){if(this.vertCount>=pn)return;let g=this.vertCount*Cr,p=this.verts;p[g++]=e,p[g++]=r,p[g++]=o,p[g++]=a,p[g++]=n,p[g++]=s,p[g++]=u,p[g++]=i,p[g++]=l,p[g++]=c,p[g++]=f,p[g++]=h,p[g++]=m.r,p[g++]=m.g,p[g++]=m.b,p[g++]=m.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return bt.earth;let a=$e(e,r*Pe),n=0,s=0,u=0,i=0,l=0;for(let c=-1;c<6;c++){let f=c<0?a.q:a.q+_e[c][0],h=c<0?a.r:a.r+_e[c][1],m=o(f,h);if(!m)continue;let g=m.terrainId;if(g==="ocean"||g==="coastal_water"||g==="stormy_ocean"||g==="icy_ocean")continue;let p=tr(f,h),b=Math.hypot(e-p.x,r-p.y);if(b>380)continue;let S=Math.max(0,Math.min(1,1-Math.max(0,b-35)/345)),P=S*S*(3-2*S),x=P*P,w=Aa(m);s+=w.r*x,u+=w.g*x,i+=w.b*x,l+=w.rock*x,n+=x}return n<1e-4?bt.earth:{r:s/n,g:u/n,b:i/n,rock:l/n}}emitCourse(e,r,o,a,n){let s=e.points,u=s.length;if(u<2)return;let i=e.width*.5*n,l=e.mouthCrossPos??(e.hasMouth&&e.mouthCrossIdx>=0?s[e.mouthCrossIdx]:null),c=e.hasMouth?s[u-1]:null,f=l&&c?c.x-l.x:0,h=l&&c?c.y-l.y:0,m=Math.hypot(f,h)||1,g=e.mouthDirX??f/m,p=e.mouthDirY??h/m,b=Math.max(24,e.mouthReach??m),S=new Float32Array(u);for(let C=1;C<u;C++)S[C]=S[C-1]+Math.hypot(s[C].x-s[C-1].x,s[C].y-s[C-1].y);let P=Math.max(1,S[u-1]),x=new Float32Array(u),w=new Float32Array(u),H=new Float32Array(u),W=new Float32Array(u),y=new Array(u);for(let C=0;C<u;C++){let L=s[C>0?C-1:0],O=s[C<u-1?C+1:u-1],B=O.x-L.x,N=O.y-L.y,R=Math.hypot(B,N)||1;x[C]=B/R,w[C]=N/R,H[C]=-N/R,W[C]=B/R,y[C]=this.sampleBankPalette(s[C].x,s[C].y,a)}let E=(C,L,O)=>{let B=r(C,L),N=C,R=(L-B)*Pe,q=S[O]/P,$=i*(e.hasMouth?.68+.4*q:1),X=1,_=1;if(e.hasMouth&&S[O]<26){let k=Math.max(0,Math.min(1,S[O]/26)),d=k*k*(3-2*k);X*=d,_*=d,$*=.58+.42*d}else if(!e.hasMouth){let k=Math.min(S[O],P-S[O]);if(k<18){let d=Math.max(0,Math.min(1,k/18)),v=d*d*(3-2*d);X*=v,_*=v,$*=.72+.28*v}}if(l&&e.hasMouth){let k=(C-l.x)*g+(L-l.y)*p,d=Math.max(0,Math.min(1,(k+28)/(28+b*.72))),v=d*d*(3-2*d);$*=1+.48*v;let M=Math.max(0,Math.min(1,k/b));X*=1-M*M*(3-2*M);let G=Math.max(0,Math.min(1,(k+58)/52));_*=1-G*G*(3-2*G)}let F=$e(C,L*Pe),A=o(F.q,F.r);return{wx:N,wy:R,halfW:$,mouthFade:X,landFade:_,fogDim:A===0?0:A===1?.65:1}},D=34;for(let C=0;C<u-1&&!(this.vertCount+6>pn);C++){let L=s[C],O=s[C+1],B=E(L.x,L.y,C),N=E(O.x,O.y,C+1);if(B.fogDim===0&&N.fogDim===0)continue;let R=B.fogDim>0?B.fogDim:N.fogDim,q=N.fogDim>0?N.fogDim:B.fogDim,$=B.halfW+D*(.28+.72*B.landFade),X=N.halfW+D*(.28+.72*N.landFade),_=L.x-H[C]*$,F=L.y-W[C]*$,A=L.x+H[C]*$,I=L.y+W[C]*$,k=O.x-H[C+1]*X,d=O.y-W[C+1]*X,v=O.x+H[C+1]*X,M=O.y+W[C+1]*X,G=E(_,F,C),U=E(A,I,C),Y=E(k,d,C+1),j=E(v,M,C+1);this.pushVertex(G.wx,G.wy,_,F,-$,B.halfW,G.mouthFade,G.landFade,R,S[C],x[C],w[C],y[C]),this.pushVertex(U.wx,U.wy,A,I,$,B.halfW,U.mouthFade,U.landFade,R,S[C],x[C],w[C],y[C]),this.pushVertex(j.wx,j.wy,v,M,X,N.halfW,j.mouthFade,j.landFade,q,S[C+1],x[C+1],w[C+1],y[C+1]),this.pushVertex(G.wx,G.wy,_,F,-$,B.halfW,G.mouthFade,G.landFade,R,S[C],x[C],w[C],y[C]),this.pushVertex(j.wx,j.wy,v,M,X,N.halfW,j.mouthFade,j.landFade,q,S[C+1],x[C+1],w[C+1],y[C+1]),this.pushVertex(Y.wx,Y.wy,k,d,-X,N.halfW,Y.mouthFade,Y.landFade,q,S[C+1],x[C+1],w[C+1],y[C+1])}}render(e){let{cam:r,assets:o,routes:a,manualEdges:n=[],sampleReliefHeight:s,lookupFog:u,lookupHex:i,timeSec:l,windAnimation:c=!0}=e;if(a.length===0&&n.length===0)return 0;this.vertCount=0;let f=r.zoom<.35?1+(.35-r.zoom)*1.4:1,h=i?(g,p)=>{let b=i(g,p);if(!b)return!1;let S=b.terrainId;return S==="ocean"||S==="coastal_water"||S==="stormy_ocean"||S==="icy_ocean"}:void 0;for(let g=0;g<a.length;g++){let p=this.getCachedCourse(a[g],34,h);p&&this.emitCourse(p,s,u,i,f)}if(n.length>0){let g=bn(n,34);for(let p=0;p<g.length;p++)this.emitCourse(g[p],s,u,i,f)}if(this.vertCount===0)return 0;let{gl:m}=this;return m.enable(m.BLEND),m.blendEquation(m.FUNC_ADD),m.blendFunc(m.ONE,m.ONE_MINUS_SRC_ALPHA),m.useProgram(this.program),m.bindVertexArray(this.vao),m.bindBuffer(m.ARRAY_BUFFER,this.vbo),m.bufferSubData(m.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Cr)),m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D_ARRAY,o.terrainArray),m.uniform2f(this.uCamCenter,r.x,r.y),m.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),m.uniform1f(this.uZoom,r.zoom),m.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),m.uniform1f(this.uTime,l),m.uniform1f(this.uWindEnabled,c?1:0),m.uniform1f(this.uPassMode,0),m.drawArrays(m.TRIANGLES,0,this.vertCount),m.uniform1f(this.uPassMode,1),m.drawArrays(m.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Fa=_e.map(([t,e])=>[t+e*.5,Ye*e/256]),La=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),Ia=new Set(["moor","marshland","swamp"]);function Mr(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function vn(t,e,r){return t.kind==="mountain"?3:br(t)?0:t.kind==="tree"?r>=66?2:1:vr(t)||Pt(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function yn(t){return br(t)?0:t.kind==="mountain"?.44:vr(t)||Pt(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||yr(t)||ln(t)?.3:.55}var Da=.24;function xo(t,e){if(e?.includes("terrain_tint")||e?.includes("arid_decal"))return!0;let r=t.toLowerCase();return r.includes("crack")||r.includes("fissure")}function Ba(t,e,r){return xo(t,e)?r*Math.PI*2:(r*2-1)*Da}var qa=256*256*Math.sqrt(3)/2,nr=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=rn(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...Dt,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...mt,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let a=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==a||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=rn(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:a}=Xt(e,r,Fe),n=Ct(o,a);this.rawCellChunks.delete(n),this.chunks.delete(n);let s=e-o*Fe,u=r-a*Fe,i=[0],l=[0];s<=2&&i.push(-1),s>=Fe-3&&i.push(1),u<=2&&l.push(-1),u>=Fe-3&&l.push(1);for(let c of i)for(let f of l)c===0&&f===0||this.chunks.delete(Ct(o+c,a+f));this.revision++}setHexFogState(e,r,o){let{cq:a,cr:n}=Xt(e,r,Fe),s=Ct(a,n),u=e-a*Fe,l=(r-n*Fe)*Fe+u,c=this.chunks.get(s)?.cells[l],f=this.rawCellChunks.get(s)?.[l],h=c??f;return!h||h.fogState===o?!1:(c&&(c.fogState=o),f&&(f.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:a}=Xt(e,r,Fe),n=Ct(o,a),u=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!u)return;let i=e-o*Fe,l=r-a*Fe;if(!(i<0||i>=Fe||l<0||l>=Fe))return u[l*Fe+i]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let a=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!a||a.layers.length===0)return 0;if(a.layers.length===1)return a.layers[0];let n=Bn(this.seedIntValue,r,o,101)%a.layers.length;return a.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let a=Dn(e,Fe,2),n=0,s=0,u=[];for(let{cq:y,cr:E}of a){let D=Ct(y,E),C=this.chunks.get(D);C?(this.chunks.delete(D),this.chunks.set(D,C),u.push(C)):n<r?(C=this.buildChunk(y,E),this.chunks.set(D,C),n++,this.revision++,u.push(C)):s++}for(;this.chunks.size>this.maxCachedChunks;){let y=this.chunks.keys().next().value;if(y===void 0)break;this.chunks.delete(y)}let i=this.maxCachedChunks*2;for(;this.rawCellChunks.size>i;){let y=this.rawCellChunks.keys().next().value;if(y===void 0)break;this.rawCellChunks.delete(y)}let l=e.viewportWidth*.5/e.zoom+420,c=e.viewportHeight*.5/e.zoom+420,f=e.x-l,h=e.x+l,m=e.y-c,g=e.y+c,p=[],b=[],S=[],P=new Set;for(let y of u){for(let E of y.shorelines){if(E.x<f||E.x>h||E.y<m||E.y>g)continue;let D=this.lookupHex(E.q,E.r),C=D?D.fogState:0;C!==0&&(p.push(E),b.push(C))}for(let E of y.riverRoutes)P.has(E.id)||(P.add(E.id),S.push(E))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:p,shoreFogStates:b,riverRoutes:S,chunksLoadedThisFrame:n,hasPendingChunks:s>0};let x=[],w=[];for(let y of u){for(let E of y.sprites)E.x<f||E.x>h||E.y<m||E.y>g||x.push(E);for(let E of y.decals)E.x<f||E.x>h||E.y<m||E.y>g||w.push(E)}x.sort((y,E)=>(y.sortY??y.y)-(E.sortY??E.y)||y.x-E.x);let H=new Array(x.length);for(let y=0;y<x.length;y++){let E=x[y],D=this.lookupHex(E.q,E.r);H[y]=D?D.fogState:0}let W=new Array(w.length);for(let y=0;y<w.length;y++){let E=w[y],D=this.lookupHex(E.q,E.r);W[y]=D?D.fogState:0}return{sprites:x,fogStates:H,decals:w,decalFogStates:W,shorelines:p,shoreFogStates:b,riverRoutes:S,chunksLoadedThisFrame:n,hasPendingChunks:s>0}}getOrFetchRawCells(e,r){let o=Ct(e,r),a=this.rawCellChunks.get(o);if(a)return a;let n=e*Fe,s=r*Fe,u=this.provider({cq:e,cr:r,chunkSize:Fe}),i=new Array(Fe*Fe),l=this.fogOverride;for(let c of u){let f=c.q-n,h=c.r-s;f<0||f>=Fe||h<0||h>=Fe||(l&&(c.fogState=l(c.q,c.r)),i[h*Fe+f]=c)}return this.rawCellChunks.set(o,i),i}lookupRawHex(e,r){let{cq:o,cr:a}=Xt(e,r,Fe),n=this.getOrFetchRawCells(o,a),s=e-o*Fe,u=r-a*Fe;return n[u*Fe+s]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,a)=>o[0].localeCompare(a[0])),r=[];for(let[o,a]of e){let n=Jn(a,this.manifest),s=a.worldWidth*Lt(a),u=.72*s*s/qa,i=0,l=o.replace(/^assets\//,"");for(let h=0;h<l.length;h++)i=Math.imul(i,31)+l.charCodeAt(h)|0;let c=a.kind==="tree"?"tree":a.kind==="shrub"?"shrub":a.kind==="ground_cover"?"ground_cover":"other",f={key:o,entry:a,allowedTypes:n,effectiveWidth:s,crownAreaRatio:u,pathSalt:i,pre:{strict:jt(a),ecoFamily:$t(a)},pScale:un(a),chanceMult:Kn(a),minSpacing:a.placement?.minSpacing??28,edgeMargin:a.placement?.edgeMargin??12,pKind:c,isCanopy:Xn(a),isBoulder:vr(a),isWaterBoulder:Pt(a),isWarmBoulder:Yt(a),isGroundDecal:br(a),isDryPatch:yr(a),isAcacia:cn(a),isAccent:zn(a),isSnowFamily:xr(a),isBush20to29:sn(a),isReed:ln(a),isHerb:a.family==="herbs",accentGroup:Yn(a)};if(a.kind==="mountain")this.mountainCandidates.push(f);else if(f.isWaterBoulder)a.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(f);else if(f.isGroundDecal){if(a.artStatus!=="deprecated"&&(a.placement?.density??.25)>0&&n.size>0)for(let h of n){let m=this.decalCandidatesByTerrain.get(h);m||(m=[],this.decalCandidatesByTerrain.set(h,m)),m.push(f)}}else if(a.artStatus!=="deprecated"&&(a.placement?.density??0)>0&&(a.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(f),f.isReed&&this.reedCandidates.push(f);for(let h of n){let m=this.candidatesByTerrain.get(h);m||(m=[],this.candidatesByTerrain.set(h,m)),m.push(f)}n.has("forest_floor")&&a.family!=="palms"&&r.push(f)}}for(let o of Object.keys(this.manifest.terrain.byType)){let a=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,a);else{let n=new Set(a),s=[...a];for(let u of r)n.has(u)||(n.add(u),s.push(u));this.candidatesByTerrainForest.set(o,s)}}}createPlacedSprite(e,r,o,a,n,s,u){let i=e.entry,l=e.effectiveWidth*s,c=l*i.aspect,f=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],h=n*Pe,m=i.kind==="mountain",g=Math.round(a*3)^Math.round(n*5)|0,p=e.isGroundDecal&&xo(e.key,i.tags),S=!m&&!e.isAccent&&!e.accentGroup&&(!e.isGroundDecal||p)&&re(this.seedIntValue,r,o,g+811)<.5,P=a/(256*2.6),x=n/(256*2.6),w=Math.floor(P),H=Math.floor(x),W=P-w,y=x-H,E=W*W*(3-2*W),D=y*y*(3-2*y),C=re(this.seedIntValue,w,H,913),L=re(this.seedIntValue,w+1,H,913),O=re(this.seedIntValue,w,H+1,913),B=re(this.seedIntValue,w+1,H+1,913),N=C+(L-C)*E+(O+(B-O)*E-(C+(L-C)*E))*D,R=re(this.seedIntValue,r,o,g+823),q=N*.6+R*.4,$=m||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:i.kind==="tree"?.62:i.family==="cacti"?.08:i.kind==="shrub"?.42:i.kind==="ground_cover"?.24:0;return{x:a,y:h-u*Pe,sortY:h,width:l,height:c,anchorX:i.anchor[0],anchorY:i.anchor[1],page:i.page,u0:i.uv[0],v0:i.uv[1],u1:i.uv[2],v1:i.uv[3],q:r,r:o,isMountain:m,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:S,tintHash:q,swayAmp:$,shadowTier:vn(i,l,c),selfShadeWeight:yn(i),shadowPage:f?f.page:-1,shadowU0:f?f.uv[0]:0,shadowV0:f?f.uv[1]:0,shadowU1:f?f.uv[2]:0,shadowV1:f?f.uv[3]:0,shadowMinX:f?f.boundsInSpriteWidth[0]:0,shadowMinY:f?f.boundsInSpriteWidth[1]:0,shadowMaxX:f?f.boundsInSpriteWidth[2]:0,shadowMaxY:f?f.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*Fe,a=r*Fe,n=this.seedIntValue,s=this.getOrFetchRawCells(e,r),u=[],i=[];for(let d=-2;d<Fe+2;d++)for(let v=-2;v<Fe+2;v++){let M=o+v,G=a+d,U=this.lookupRawHex(M,G);U&&(u.push(U),v>=0&&v<Fe&&d>=0&&d<Fe&&i.push(U))}let l=ro(u,this.manifest,n,this.forestConfig);for(let d of i){let v=l.get(Be(d.q,d.r));v&&(d.forestClass=v.forestClass,d.glade=v.glade,d.gladeX=v.gladeX,d.gladeY=v.gladeY,d.gladeRadius=v.gladeRadius)}let c=[],f=this.manifest.infrastructure.sprites;for(let d of i){if(this.isWaterTerrain(d.terrainId)||At.has(d.terrainId))continue;let v=ke(d.q,d.r);for(let M=0;M<6;M++){let[G,U]=_e[M],Y=this.lookupRawHex(d.q+G,d.r+U);if(!Y||!this.isWaterTerrain(Y.terrainId)||Y.terrainId==="icy_ocean")continue;let j=0;for(let J of[5,1]){let[ge,he]=_e[(M+J)%6],se=this.lookupRawHex(d.q+ge,d.r+he);se&&(At.has(se.terrainId)||se.terrainId==="icy_ocean")&&j++}if(j>=2)continue;let Z=`shorelines/shore_v105_edge_0${M+1}`,le=f[Z];le&&c.push({x:v.x,y:v.y,q:d.q,r:d.r,side:M,alpha:j===1?.42:1,page:le.page,u0:le.uv[0],v0:le.uv[1],u1:le.uv[2],v1:le.uv[3]})}}let h=this.provider.getRiverRoutesForChunk?.(e,r,Fe)??[],m=[],g=(d,v)=>{let M=this.lookupRawHex(d,v);return M?this.isWaterTerrain(M.terrainId):!1};for(let d=0;d<h.length;d++){let v=rr(h[d],34,g);if(!v||v.points.length<2)continue;let M=1/0,G=-1/0,U=1/0,Y=-1/0;for(let j=0;j<v.points.length;j++){let Z=v.points[j];Z.x<M&&(M=Z.x),Z.x>G&&(G=Z.x),Z.y<U&&(U=Z.y),Z.y>Y&&(Y=Z.y)}m.push({course:v,minX:M-90,maxX:G+90,minY:U-90,maxY:Y+90})}let p=(d,v)=>{if(m.length===0)return 1/0;let M=1/0;for(let G=0;G<m.length;G++){let U=m[G];if(d<U.minX||d>U.maxX||v<U.minY||v>U.maxY)continue;let Y=U.course.points;for(let j=1;j<Y.length;j++){let Z=Y[j-1],le=Y[j],J=le.x-Z.x,ge=le.y-Z.y,he=J*J+ge*ge,se=he>1e-6?((d-Z.x)*J+(v-Z.y)*ge)/he:0;se<0?se=0:se>1&&(se=1);let Re=d-(Z.x+se*J),ve=v-(Z.y+se*ge),xe=Re*Re+ve*ve;xe<M&&(M=xe)}}return M<1/0?Math.sqrt(M):1/0},b=this.reliefConfig.enabled?this.reliefConfig.strength:0,S=this.reliefConfig.style??"sculpted",P=uo(u,this.manifest,n,b,S),x=(d,v)=>mo(P,d,v),w=[],H=new Set,W=[],y=new Map,E=(d,v,M,G,U,Y,j,Z)=>{w.push(this.createPlacedSprite(d,v,M,G,U,Y,j));let le={x:G,y:U,pScale:d.pScale,minSpacing:d.minSpacing,visualHalfW:d.effectiveWidth*Y*.5,isCanopy:d.isCanopy,isBoulder:d.isBoulder},J=Be(v,M),ge=y.get(J);ge||(ge=[],y.set(J,ge)),ge.push(le),Z.push(le)};if(this.mountainCandidates.length>0){let d=new Set(i.map(v=>Be(v.q,v.r)));for(let v of u){if(v.reliefClass!=="mountain"||v.occupied)continue;let M=this.mountainCandidates.filter(se=>to(se.entry,se.allowedTypes,v.terrainId,this.manifest)),G=this.mountainCandidates.filter(se=>!Qn(se.entry)),U=M.length>0?M:G.length>0?G:this.mountainCandidates,Y=0;for(let se=0;se<U.length;se++)Y+=Math.max(.1,U[se].entry.placement?.weight??1);let j=re(n,v.q,v.r,2002)*Y,Z=U[0];for(let se=0;se<U.length;se++)if(j-=Math.max(.1,U[se].entry.placement?.weight??1),j<=0){Z=U[se];break}let le=256*(v.q+v.r*.5),J=Ye*v.r+20,ge=Math.max(72,(Z.entry.mountain?.coreRadius??.32)*Z.effectiveWidth);W.push({ux:le,uy:J,coreR2:ge*ge});let he=Be(v.q,v.r);if(H.add(he),d.has(he)){let se=x(le,J);w.push(this.createPlacedSprite(Z,v.q,v.r,le,J,1,se))}}}let D=i.filter(d=>!this.isWaterTerrain(d.terrainId)).length,C=$n(D),L={dead_trees:0,fallen_logs:0},O=(d,v,M,G)=>{let U=d/M,Y=v/M,j=Math.floor(U),Z=Math.floor(Y),le=U-j,J=Y-Z,ge=le*le*(3-2*le),he=J*J*(3-2*J),se=re(n,j,Z,G),Re=re(n,j+1,Z,G),ve=re(n,j,Z+1,G),xe=re(n,j+1,Z+1,G),be=se+(Re-se)*ge,ye=ve+(xe-ve)*ge;return be+(ye-be)*he},B=(d,v,M,G)=>re(n,v,M,G+d.pathSalt),N=(d,v,M=null)=>{if(M!==null)return M;if(d.isWaterBoulder)return Mr(v)*1.28;if(d.isBoulder)return Mr(v);let G=d.entry.scaleRange[0]??.85,U=d.entry.scaleRange[1]??1.15,Y=d.entry.kind==="tree"?Math.min(G,.76):d.entry.kind==="shrub"?Math.min(G,.74):G,j=d.entry.kind==="tree"?Math.max(U,1.2):d.entry.kind==="shrub"?Math.max(U,1.22):U;return Y+(j-Y)*v},R=(d,v)=>{for(let M=0;M<W.length;M++){let G=W[M],U=d-G.ux,Y=v-G.uy;if(U*U+Y*Y<G.coreR2)return!0}return!1},q=(d,v,M,G,U)=>{if(M.length===0)return!0;let Y=256*.5-(U+Math.min(74,G*.72));for(let j=0;j<M.length;j++){let[Z,le]=Fa[M[j]];if(d*Z+v*le>Y)return!1}return!0},$=(d,v,M,G)=>{if(m.length===0||M.isWaterBoulder)return!1;let U=p(d,v);return U===1/0?!1:M.isReed?U<21:U<24+Math.min(38,G*.45)},X=(d,v,M,G,U,Y,j,Z,le=null,J,ge=[],he=34)=>{let se=d.entry,Re=J??d.edgeMargin,ve=re(n,v.q,v.r,j*47+7),xe=N(d,ve,le),be=d.effectiveWidth*xe*.5,ye=d.pKind,De=d.pScale,we=d.minSpacing,Ie=d.isCanopy,Ae=se.kind==="tree";for(let Oe=0;Oe<28;Oe++){let{dx:We,dy:Ge}=io(n,v.q,v.r,ye,j,Oe);if(!wr(We,Ge,Re)||!q(We,Ge,ge,be,he)||Ae&&dn(Y,We,Ge))continue;let ae=M+We,ne=G+Ge;if(R(ae,ne)||$(ae,ne,d,be))continue;let T=!1;for(let oe=0;oe<U.length;oe++){let te=U[oe],V=Math.sqrt(De*te.pScale),K=Ie&&te.isCanopy,ie=K?Z:Math.max(.85,Z),Q=Math.max(K&&ie<.6?10:14,Math.max(we,te.minSpacing)*ie*V);!K&&(d.isBoulder||te.isBoulder)&&(Q=Math.max(Q,(be+te.visualHalfW)*.56));let ee=ae-te.x,ce=ne-te.y;if(ee*ee+ce*ce<Q*Q){T=!0;break}}if(T)continue;let z=x(ae,ne);return E(d,v.q,v.r,ae,ne,xe,z,U),{ux:ae,uy:ne,scale:xe,halfW:be}}return null},_=(d,v,M,G,U,Y,j,Z,le,J,ge,he,se,Re,ve,xe=[],be=34)=>{let ye=ve??d.edgeMargin,De=re(n,v.q,v.r,se*53+13),we=N(d,De,J),Ie=d.effectiveWidth*we*.5,Ae=d.pScale,Oe=d.minSpacing,We=d.entry.kind==="tree",Ge=re(n,v.q,v.r,se*61+19)*Math.PI*2,ae=Math.max(Z,j*.68+Ie*.44),ne=Math.max(le,ae+28);for(let T=0;T<20;T++){let z=re(n,v.q,v.r,se*71+T*11+3),oe=re(n,v.q,v.r,se*73+T*13+5),te=Ge+T*2.3999632+(oe-.5)*.42,V=ae+(ne-ae)*z,K=U+Math.cos(te)*V,ie=Y+Math.sin(te)*V*.78,Q=K-M,ee=ie-G;if(!wr(Q,ee,ye)||!q(Q,ee,xe,Ie,be)||We&&dn(he,Q,ee)||R(K,ie)||$(K,ie,d,Ie))continue;let ce=!1;for(let de=0;de<ge.length;de++){let Ue=ge[de],qe=Math.sqrt(Ae*Ue.pScale),He=Math.max(10,Math.max(Oe,Ue.minSpacing)*Re*qe);(d.isBoulder||Ue.isBoulder)&&(He=Math.max(He,(Ie+Ue.visualHalfW)*.56));let et=K-Ue.x,Ze=ie-Ue.y;if(et*et+Ze*Ze<He*He){ce=!0;break}}if(ce)continue;let Ce=x(K,ie);return E(d,v.q,v.r,K,ie,we,Ce,ge),{ux:K,uy:ie,scale:we,halfW:Ie}}return null},F=(d,v)=>{for(let M=-2;M<=2;M++)for(let G=-2;G<=2;G++){if(je(0,0,G,M)>2)continue;let U=this.lookupRawHex(d+G,v+M);if(U&&U.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let d=this.waterBoulderCandidates;for(let v of i){if(v.occupied||!Kt.has(v.terrainId)||v.terrainId!=="coastal_water"&&!F(v.q,v.r))continue;let M=.45+1.2*O(v.q,v.r,3.2,4107),G=v.terrainId==="coastal_water"?.27:v.terrainId==="stormy_ocean"?.19:.15,U=Math.min(.48,G*M);if(re(n,v.q,v.r,4111)>=U)continue;let Y=[];for(let ve=0;ve<6;ve++){let[xe,be]=_e[ve],ye=this.lookupRawHex(v.q+xe,v.r+be);ye&&!this.isWaterTerrain(ye.terrainId)&&Y.push(ve)}let j=256*(v.q+v.r*.5),Z=Ye*v.r,le=[];for(let ve=-1;ve<=1;ve++)for(let xe=-1;xe<=1;xe++){let be=y.get(Be(v.q+xe,v.r+ve));if(be)for(let ye=0;ye<be.length;ye++)le.push(be[ye])}let J=Math.floor(re(n,v.q,v.r,4113)*d.length),ge=d[J%d.length],he=1,se=X(ge,v,j,Z,le,void 0,he++,.85,null,20,Y,30);if(!se)continue;let Re=re(n,v.q,v.r,4117);if(Re<.48){let ve=Re<.18?2:1;for(let xe=0;xe<ve;xe++){let be=Math.floor(re(n,v.q,v.r,4121+xe*7)*d.length),ye=d[be%d.length],De=re(n,v.q,v.r,4129+xe*11),we=Math.max(.55,Math.min(2.35,se.scale*(.4+.46*De)));_(ye,v,j,Z,se.ux,se.uy,se.halfW,Math.max(24,se.scale*20),Math.max(64,se.scale*38),we,le,void 0,he++,.62,18,Y,30)}}}}let A=this.forestConfig.mode,I=this.forestConfig.openTreeChance;for(let d of i){let v=Be(d.q,d.r);if(d.occupied||H.has(v)||this.isWaterTerrain(d.terrainId))continue;let M=l.get(v);if(so(n,d.q,d.r,M))continue;let G=[],U=[];for(let ue=0;ue<6;ue++){let[me,pe]=_e[ue],fe=this.lookupRawHex(d.q+me,d.r+pe);fe&&(G.push(fe.terrainId),this.isWaterTerrain(fe.terrainId)&&U.push(ue))}let Y=M?.forestClass??"none",j=Y==="dense_forest"||Y==="light_forest",Z=Y==="light_forest"||!j&&(M?.edgeInfluence??0)>.1,le=!!(d.riverEdges&&d.riverEdges.length>0),J=On.has(d.terrainId),ge=Ia.has(d.terrainId),he=J||d.terrainId==="semi_desert"||d.terrainId==="savanna",se=j?this.candidatesByTerrainForest.get(d.terrainId)??this.allCandidates:this.candidatesByTerrain.get(d.terrainId)??this.allCandidates;if(se.length===0)continue;let Re={baseBiome:d.terrainId,biome:M?.biome??d.terrainId,forestClass:Y,neighborTypes:G,hasRiverEdge:le},ve=zt.has(d.terrainId),xe=[],be=[],ye=[],De=[],we=[],Ie=[],Ae=[],Oe=!1;for(let ue=0;ue<se.length;ue++){let me=se[ue],pe=me.entry;ao(pe.family,M)&&eo(pe,me.allowedTypes,Re,this.manifest,me.pre)&&(d.terrainId==="tundra"&&pe.family==="snow_conifers"&&B(me,d.q,d.r,973)>=.02||(Oe=!0,me.isCanopy?ve&&(pe.family==="palms"||me.isAcacia)?xe.push(me):be.push(me):me.isBoulder?(ye.push(me),me.isWarmBoulder&&De.push(me)):me.isDryPatch?we.push(me):pe.family==="snow"?Ie.push(me):Ae.push(me)))}if(!Oe)continue;be.sort((ue,me)=>{let pe=ue.entry.placement,fe=me.entry.placement,Me=B(ue,d.q,d.r,301)/Math.max(.04,(pe.density??.12)*Math.min(1,pe.weight??1)),Te=B(me,d.q,d.r,301)/Math.max(.04,(fe.density??.12)*Math.min(1,fe.weight??1));return Me-Te}),Ae.sort((ue,me)=>B(ue,d.q,d.r,302)-B(me,d.q,d.r,302));let We=Ae.filter(ue=>(ue.pKind==="shrub"||ue.pKind==="ground_cover")&&!ue.isAccent&&!ue.accentGroup&&!(J&&(ue.isBush20to29||ue.isHerb))),Ge=no(M);Ge>1&&Zt(n,d.q,d.r,"tree")<.58&&Ge--;let ae=oo(M),ne=O(d.q,d.r,4.2,5107),T=O(d.q,d.r,1.9,5119),z=Math.pow(ne*.68+T*.32,1.35),oe=j?1:.14+1.76*z,te=j?ae:Math.max(ae,10),V=A==="canopy"?Y==="dense_forest"?.34:Y==="light_forest"?.59:.88:A==="dense"?Y==="dense_forest"?.52:Y==="light_forest"?.73:1:Y==="dense_forest"?.72:Y==="light_forest"?.92:1,K=256*(d.q+d.r*.5),ie=Ye*d.r,Q=[];for(let ue=-1;ue<=1;ue++)for(let me=-1;me<=1;me++){let pe=y.get(Be(d.q+me,d.r+ue));if(pe)for(let fe=0;fe<pe.length;fe++)Q.push(pe[fe])}let ee=0,ce=0,Ce=0,de=1,Ue=(ue,me)=>{if(j||ee>=te)return;let pe=re(n,d.q,d.r,5201+de*17);if(me.length>0&&pe<.46){let Te=oe>1.08&&pe<.2?2:1;for(let Se=0;Se<Te&&ee<te;Se++){let Le=Math.floor(re(n,d.q,d.r,5211+Se*7)*me.length),Ee=me[Le%me.length],ze=re(n,d.q,d.r,5221+Se*9),Ne=Math.max(.5,Math.min(1.85,ue.scale*(.38+.44*ze)));_(Ee,d,K,ie,ue.ux,ue.uy,ue.halfW,Math.max(20,ue.halfW*.72),Math.max(52,ue.halfW*1.45),Ne,Q,M,de++,.55,void 0,U)&&ee++}}let fe=he&&we.length>0?J?we:[...we,...We]:We,Me=re(n,d.q,d.r,5237+de*13);if(fe.length>0&&Me<.62){let Te=1+Math.floor(re(n,d.q,d.r,5243)*(oe>1.05?2:1));for(let Se=0;Se<Te&&ee<te;Se++){let Le=Math.floor(re(n,d.q,d.r,5251+Se*11)*fe.length),Ee=fe[Le%fe.length],ze=re(n,d.q,d.r,5261+Se*7),Ne=Ee.entry.scaleRange[0]??.85,tt=Ee.entry.scaleRange[1]??1.15,rt=(Ne+(tt-Ne)*ze)*.92;_(Ee,d,K,ie,ue.ux,ue.uy,ue.halfW,Math.max(20,ue.halfW*.76),Math.max(54,ue.halfW*1.38+18),rt,Q,M,de++,.5,void 0,U)&&ee++}}},He=De.length>0&&re(n,d.q,d.r,1607)<.85?De:ye,et=He.reduce((ue,me)=>Math.max(ue,me.entry.placement?.density??0),0),Ze=j?1:.72+.48*oe,ot=Math.min(.44,et*(De.length>0?2.5:1.15)*Ze);if(De.length>0&&ee<te&&re(n,d.q,d.r,1601)<ot){let ue=Math.floor(re(n,d.q,d.r,1602)*He.length);for(let me=0;me<He.length;me++){let pe=He[(ue+me)%He.length],fe=X(pe,d,K,ie,Q,M,de++,1,null,void 0,U);if(fe){ee++,Ue(fe,He);break}}}if(xe.length>0&&ee<te&&re(n,d.q,d.r,1751)<.065*(.75+.45*oe)){let ue=xe.filter(Me=>Me.entry.family==="palms"),me=xe.filter(Me=>Me.isAcacia),pe=re(n,d.q,d.r,1752)<.5?[ue,me]:[me,ue],fe=!1;for(let Me of pe){if(!Me.length||fe)continue;let Te=Math.floor(re(n,d.q,d.r,1753)*Me.length);for(let Se=0;Se<Me.length;Se++){let Le=Me[(Te+Se)%Me.length],Ee=X(Le,d,K,ie,Q,M,de++,1,null,void 0,U);if(Ee){if(ee++,fe=!0,re(n,d.q,d.r,1759)<.45){let ze=1+Math.floor(re(n,d.q,d.r,1763)*2);for(let Ne=0;Ne<ze&&ee<te;Ne++){let tt=Me[(Te+Ne+1)%Me.length];_(tt,d,K,ie,Ee.ux,Ee.uy,Ee.halfW,22,56,null,Q,M,de++,.54,void 0,U)&&ee++}}break}}}}let wt=Math.min(.58,Nn(d.terrainId)*(.76+.44*oe));if(we.length>0&&ee<te&&re(n,d.q,d.r,1831)<wt){let ue=Math.floor(re(n,d.q,d.r,1832)*we.length);for(let me=0;me<we.length;me++){let pe=we[(ue+me)%we.length],fe=X(pe,d,K,ie,Q,M,de++,.9,null,void 0,U);if(fe){ee++;let Me=re(n,d.q,d.r,1837);if(!j&&Me<.52&&ee<te){let Te=Me<.22&&oe>.95?2:1;for(let Se=0;Se<Te&&ee<te;Se++){let Le=we[(ue+1+Se+Math.floor(Me*11))%we.length],Ee=re(n,d.q,d.r,1843+Se*7),ze=Le.entry.scaleRange[0]??.8,Ne=Le.entry.scaleRange[1]??1.15,tt=(ze+(Ne-ze)*Ee)*(.76+.3*Ee);_(Le,d,K,ie,fe.ux,fe.uy,fe.halfW,16,44,tt,Q,M,de++,.48,void 0,U)&&ee++}}break}}}let ft=A==="canopy"&&j?M?.canopyCoverage??0:0,Zr=ft?Math.max(Ge,ae-2):Ge;for(let ue=0;ue<Zr&&ee<ae&&be.length>0&&!(ce>=Ge&&(!ft||Ce>=ft));ue++){let me=be[ue%Math.min(be.length,5)],pe=null;if(Z){let Me=re(n,d.q,d.r,de*47+7);pe=N(me,Me,null)*(.76+.16*Me)}let fe=X(me,d,K,ie,Q,M,de++,V,pe,void 0,U);fe&&(ce++,ee++,Ce+=me.crownAreaRatio*fe.scale*fe.scale)}let Qr=Math.min(.68,I*(.62+.62*oe));if(!Ge&&!M?.glade&&be.length>0&&I>0&&B(be[0],d.q,d.r,311)<Qr&&ee<te){let ue=X(be[0],d,K,ie,Q,M,de++,1,null,void 0,U);if(ue){ee++;let me=re(n,d.q,d.r,5301),pe=I>.25?.64:.52;if(me<pe){let fe=1+Math.floor(re(n,d.q,d.r,5303)*3),Me=Math.min(be.length,4);for(let Te=0;Te<fe&&ee<te;Te++){let Se=be[(Te+1)%Me];_(Se,d,K,ie,ue.ux,ue.uy,ue.halfW,24,62,null,Q,M,de++,.52,void 0,U)&&ee++}if(We.length>0&&ee<te){let Te=re(n,d.q,d.r,5311)<.55?2:1;for(let Se=0;Se<Te&&ee<te;Se++){let Le=Math.floor(re(n,d.q,d.r,5317+Se*7)*We.length),Ee=We[Le%We.length];_(Ee,d,K,ie,ue.ux,ue.uy,ue.halfW,18,48,null,Q,M,de++,.48,void 0,U)&&ee++}}else if(ye.length>0&&ee<te&&re(n,d.q,d.r,5323)<.35){let Te=ye[Math.floor(re(n,d.q,d.r,5329)*ye.length)];_(Te,d,K,ie,ue.ux,ue.uy,ue.halfW,20,48,.62+re(n,d.q,d.r,5333)*.45,Q,M,de++,.52,void 0,U)&&ee++}}}}let Jr=j?1:.72+.48*oe;if(De.length===0&&ye.length>0&&ee<te&&re(n,d.q,d.r,1601)<Math.min(.36,et*1.15*Jr)){let ue=Math.floor(re(n,d.q,d.r,1602)*ye.length);for(let me=0;me<ye.length;me++){let pe=ye[(ue+me)%ye.length],fe=X(pe,d,K,ie,Q,M,de++,1,null,void 0,U);if(fe){ee++,Ue(fe,ye);break}}}if(Ie.length>0&&ee<te){let ue=d.terrainId==="snowfields"||d.terrainId==="frozen_tundra"?.58:d.terrainId==="highland"?.25:.14;if(re(n,d.q,d.r,1643)<ue){let me=Math.floor(re(n,d.q,d.r,1644)*Ie.length);for(let pe=0;pe<Ie.length;pe++){let fe=Ie[(me+pe)%Ie.length];if(X(fe,d,K,ie,Q,M,de++,V,null,void 0,U)){ee++;break}}}}if(Ae.length>0&&ee<te){let ue=Y==="dense_forest"?1.2:Z?1.28:.58+.62*oe,me=Zt(n,d.q,d.r,"shrub"),pe=Zt(n,d.q,d.r,"ground_cover"),fe=Zt(n,d.q,d.r,"other"),Me=!1,Te=!1,Se=!1,Le=Ae.filter(Ee=>Ee.isReed);for(let Ee of Ae){if(ee>=te)break;let ze=Ee.entry,Ne=Ee.accentGroup;if(Ne&&(Me||L[Ne]>=C[Ne]))continue;let tt=Ee.pKind==="shrub"?me:Ee.pKind==="ground_cover"?pe:fe,rt=1;Ee.isBush20to29?J?rt=.022:d.terrainId==="savanna"?rt=.55:d.terrainId==="semi_desert"?rt=.92:(La.has(d.terrainId)||j)&&(rt=1.32):Ee.isHerb&&J?rt=.3:Ee.isReed&&(ge?rt=1.65:(le||U.length>0)&&(rt=1.35));let Wt=Math.min(.86,(ze.placement?.density??.15)*Math.min(1,ze.placement?.weight??1)*ue*Ee.chanceMult*rt*tt);if(B(Ee,d.q,d.r,312)>=Wt)continue;let nt=X(Ee,d,K,ie,Q,M,de++,V,null,void 0,U);if(nt){if(ee++,Ne)L[Ne]++,Me=!0;else if(Ee.isAccent)Me=!0;else if(Ee.isReed&&!Se&&Le.length>0&&ee<te){if(re(n,d.q,d.r,5501+de*13)<.74){Se=!0;let Et=1+Math.floor(re(n,d.q,d.r,5507)*3);for(let _t=0;_t<Et&&ee<te;_t++){let en=Math.floor(re(n,d.q,d.r,5519+_t*7)*Le.length),it=Le[en%Le.length],cr=re(n,d.q,d.r,5527+_t*11),Ft=it.entry.scaleRange[0]??.85,ur=it.entry.scaleRange[1]??1.15,dr=(Ft+(ur-Ft)*cr)*(.78+.3*cr);_(it,d,K,ie,nt.ux,nt.uy,nt.halfW,14,38,dr,Q,M,de++,.42,void 0,U)&&ee++}}}else if(!j&&!Te&&Ee.pKind==="shrub"&&!(J&&Ee.isBush20to29)&&We.length>0&&ee<te){let Mt=re(n,d.q,d.r,5401+de*19);if(Mt<.5){Te=!0;let Et=We.filter(it=>it.entry.family===ze.family),_t=Et.length>0?Et:We,en=Mt<.22&&oe>.9?2:1;for(let it=0;it<en&&ee<te;it++){let cr=Math.floor(re(n,d.q,d.r,5413+it*11)*_t.length),Ft=_t[cr%_t.length],ur=re(n,d.q,d.r,5423+it*7),dr=Ft.entry.scaleRange[0]??.85,ua=Ft.entry.scaleRange[1]??1.15,da=(dr+(ua-dr)*ur)*(.72+.3*ur);_(Ft,d,K,ie,nt.ux,nt.uy,nt.halfW,15,40,da,Q,M,de++,.46,void 0,U)&&ee++}if(ye.length>0&&ee<te&&re(n,d.q,d.r,5437)<.22){let it=ye[Math.floor(re(n,d.q,d.r,5441)*ye.length)];_(it,d,K,ie,nt.ux,nt.uy,nt.halfW,18,42,.55+re(n,d.q,d.r,5443)*.48,Q,M,de++,.52,void 0,U)&&ee++}}}}}}if(le&&!J&&!At.has(d.terrainId)&&this.reedCandidates.length>0&&ee<te&&re(n,d.q,d.r,5601)<.68){let ue=this.reedCandidates,me=Math.floor(re(n,d.q,d.r,5609)*ue.length),pe=ue[me%ue.length],fe=X(pe,d,K,ie,Q,M,de++,.7,null,void 0,U);if(fe){ee++;let Me=1+Math.floor(re(n,d.q,d.r,5617)*2);for(let Te=0;Te<Me&&ee<te;Te++){let Se=ue[(me+Te+1)%ue.length];_(Se,d,K,ie,fe.ux,fe.uy,fe.halfW,14,36,null,Q,M,de++,.42,void 0,U)&&ee++}}}}let k=[];if(this.decalCandidatesByTerrain.size>0)for(let d of i){if(this.isWaterTerrain(d.terrainId)||d.reliefClass==="mountain"||At.has(d.terrainId))continue;let v=this.decalCandidatesByTerrain.get(d.terrainId);if(!v||v.length===0)continue;let M=Math.sin(d.q*.31+d.r*.19+n%53)*Math.cos(d.q*.17-d.r*.37+n%29),G=Math.sin(d.q*.67-d.r*.53+n%97)*.45,U=.5+.5*(M*.72+G*.28),Y=re(n,d.q,d.r,7091),Z=d.terrainId.includes("desert")||d.terrainId.includes("badlands")||d.terrainId.includes("savanna")||d.terrainId.includes("semi_arid")||d.terrainId.includes("dry")?.38+U*.38:.48+U*.38;if(Y>=Z)continue;let le=256*(d.q+d.r*.5),J=Ye*d.r,he=_e.some(([we,Ie])=>{let Ae=this.lookupRawHex(d.q+we,d.r+Ie);return Ae?this.isWaterTerrain(Ae.terrainId):!1})?46:28,se=d.forestDensity??0,Re=U>.52&&Y<Z*.58?2:1,ve=this.manifest.terrain.byType[d.terrainId]?.avgColor,xe=ve?(Math.max(0,Math.min(255,Math.round(ve[0])))&255)<<16|(Math.max(0,Math.min(255,Math.round(ve[1])))&255)<<8|Math.max(0,Math.min(255,Math.round(ve[2])))&255:0,be=[];for(let we=0;we<v.length;we++){let Ie=v[we],Ae=Ie.entry.tags??[];Ae.includes("meadow_decal")&&se>.42||Ae.includes("woodland_decal")&&se<.2&&d.terrainId!=="forest_floor"&&d.terrainId!=="swamp"&&d.terrainId!=="marsh"&&d.terrainId!=="marshland"&&d.terrainId!=="moor"&&d.terrainId!=="jungle"||be.push(Ie)}if(be.length===0)continue;let ye=new Set,De=[];for(let we=0;we<Re;we++){let Ie=Math.floor(re(n,d.q,d.r,7109+we*31)*be.length),Ae=be[Ie%be.length];if(ye.has(Ae.key))continue;let Oe=Ae.pathSalt+we*1777,We=(re(n,d.q,d.r,Oe+7121+we*7)-.5)*148,Ge=(re(n,d.q,d.r,Oe+7129+we*7)-.5)*148,ae=le+We,ne=J+Ge;if(!wr(We,Ge,he)||p(ae,ne)<54||De.some(Ce=>Math.hypot(Ce.ux-ae,Ce.uy-ne)<38))continue;let T=Ae.entry.tags??[],z=re(n,d.q,d.r,Oe+7151),oe=Math.max(.78,Ae.entry.scaleRange[0]??.78),te=Math.max(1.32,Ae.entry.scaleRange[1]??1.32),V=oe+(te-oe)*z,K=.86+re(n,d.q,d.r,Oe+7163)*.28,ie=Ba(Ae.key,T,re(n,d.q,d.r,Oe+7177)),Q=T.includes("terrain_tint"),ee=T.includes("rock_decal")||T.includes("woodland_decal")||T.includes("wetland_decal"),ce=this.createPlacedSprite(Ae,d.q,d.r,ae,ne,V,x(ae,ne));ce.width*=K,ce.height/=Math.sqrt(K),ce.rotationRad=ie,xe>0&&(Q?(ce.terrainTintRgb=xe,ce.terrainTintMix=.96):ee&&(ce.terrainTintRgb=xe,ce.terrainTintMix=.28)),k.push(ce),ye.add(Ae.key),De.push({ux:ae,uy:ne})}}return w.sort((d,v)=>(d.sortY??d.y)-(v.sortY??v.y)||d.x-v.x),{cq:e,cr:r,key:Ct(e,r),originQ:o,originR:a,cells:s,sprites:w,decals:k,shorelines:c,riverRoutes:h}}};var Ht=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var So=tn(hr());var vt=32,Ha=32;function Ua(t){return t==="mountain"||t==="hills"?t:"flat"}function wo(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function _o(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Ht},r=So.default.createPointSampler(t.seed,e),o=t.halfExtent,a=t.fogPolicy??(()=>2),n=t.overrides,s=new Map,u=(l,c)=>{let f=`${l},${c}`,h=s.get(f);if(h)return s.delete(f),s.set(f,h),h;let m=l*vt,g=c*vt,p=r.traceRivers(m,g,vt,vt),b=[],S=new Set;for(let x=0;x<p.routes.length;x++){let w=p.routes[x];if(!w||w.length<2)continue;let H=w[0],W=w[w.length-1],y=`${H[0]},${H[1]}->${W[0]},${W[1]}:${w.length}`;S.has(y)||(S.add(y),b.push({id:y,hexes:w}))}let P={routes:b,edgesByKey:p.edgesByKey};for(s.set(f,P);s.size>Ha;){let x=s.keys().next().value;if(x===void 0)break;s.delete(x)}return P},i=({cq:l,cr:c,chunkSize:f})=>{let h=l*f,m=c*f,g=[];for(let p=0;p<f;p++){let b=m+p;if(o!==void 0&&Math.abs(b)>o)continue;let S=Math.floor(b/vt);for(let P=0;P<f;P++){let x=h+P;if(o!==void 0&&Math.abs(x)>o)continue;let w=Math.floor(x/vt),H=u(w,S),W=r.sampleCell(x,b),y=Be(x,b),E=a(x,b),D=n?.get(y),C=D?.reliefClass??Ua(W.reliefClass),L=D?.forestDensity!==void 0?D.forestDensity:W.forestDensity>0?W.forestDensity:0,O=D?.forestClass??(D?.forestDensity!==void 0?wo(void 0,L):wo(W.forestClass,L)),B=H.edgesByKey.get(y);g.push({q:x,r:b,terrainId:D?.terrainId??W.terrainId,reliefClass:C,hillProfile:D?.hillProfile!==void 0?D.hillProfile:C==="hills"?W.hillProfile??"rounded":null,hillStrength:D?.hillStrength!==void 0?D.hillStrength:C==="hills"?Math.max(.35,W.hillStrength||.72):0,forestClass:O,forestDensity:L,fogState:D?.fogState??E,occupied:D?.occupied,riverEdges:D?.riverEdges!==void 0?D.riverEdges:B&&B.length>0?[...B]:void 0})}}return g};return i.getRiverRoutesForChunk=(l,c,f)=>{let h=l*f,m=h+f-1,g=c*f,p=g+f-1,b=Math.floor(h/vt),S=Math.floor(m/vt),P=Math.floor(g/vt),x=Math.floor(p/vt),w=[],H=new Set;for(let W=P;W<=x;W++)for(let y=b;y<=S;y++){let E=u(y,W);for(let D of E.routes){if(H.has(D.id))continue;let C=!1;for(let L=0;L<D.hexes.length;L++){let[O,B]=D.hexes[L];if(O>=h&&O<=m&&B>=g&&B<=p){C=!0;break}}C&&(H.add(D.id),w.push(D))}}return w},i}var Ga=new Set(["ocean","coastal_water","stormy_ocean","icy_ocean"]);function pt(t){return!!(t&&Ga.has(t))}function Rt(t){let e=new Set,{routes:r=[],manualRivers:o=[],isWaterHex:a}=t;for(let n=0;n<r.length;n++){let s=yo(r[n],a);for(let u of s)e.add(u)}for(let n=0;n<o.length;n++){let s=o[n],u=_e[(s.dir%6+6)%6];if(!u)continue;let i=Je(s.q,s.r,s.q+u[0],s.r+u[1]);e.add(i.key)}return e}function Er(t){let{q1:e,r1:r,q2:o,r2:a,isGate:n=!1,lookupHex:s,occupiedRiverEdges:u,existingRoads:i=[]}=t;if(je(e,r,o,a)!==1)return{ok:!1,code:"not_adjacent",reason:"Nur direkt benachbarte Hexfelder teilen eine Mauerkante."};let l=s(e,r),c=s(o,a);if(!l||!c)return{ok:!1,code:"missing_hex",reason:"Kante liegt au\xDFerhalb der geladenen Karte."};if(pt(l.terrainId)||pt(c.terrainId))return{ok:!1,code:"water_forbidden",reason:"An Wasser-/K\xFCstenwasserkanten ist keine Mauer erlaubt."};if(l.reliefClass==="mountain"||c.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Auf Bergkanten ist keine Mauer erlaubt."};let f=Je(e,r,o,a);return u.has(f.key)?{ok:!1,code:"river_edge_forbidden",reason:"Auf einer Flusskante ist keine Mauer erlaubt (Eckanschluss an benachbarter Landkante bleibt zul\xE4ssig)."}:!n&&i.length>0&&i.some(m=>Je(m.q1,m.r1,m.q2,m.r2).key===f.key)?{ok:!1,code:"road_requires_gate",reason:"\xDCber eine bestehende Stra\xDFe muss ein Tor statt einer geschlossenen Mauer gesetzt werden."}:{ok:!0}}function Tr(t){let{q:e,r,dir:o,lookupHex:a,existingWalls:n=[]}=t,s=_e[(o%6+6)%6];if(!s)return{ok:!1,code:"not_adjacent",reason:"Ung\xFCltige Flusskanten-Richtung."};let u=e+s[0],i=r+s[1],l=a(e,r),c=a(u,i);if(!l||!c)return{ok:!1,code:"missing_hex",reason:"Flusskante liegt au\xDFerhalb der geladenen Karte."};if(pt(l.terrainId)||pt(c.terrainId))return{ok:!1,code:"water_forbidden",reason:"Flusskanten verlaufen nur zwischen Land-Hexen (M\xFCndungen enden an der K\xFCstenecke)."};let f=Je(e,r,u,i);return n.some(m=>Je(m.q1,m.r1,m.q2,m.r2).key===f.key)?{ok:!1,code:"wall_edge_forbidden",reason:"Auf einer bestehenden Mauerkante kann kein Fluss liegen."}:{ok:!0}}function Ar(t){let{q1:e,r1:r,q2:o,r2:a,lookupHex:n,existingWalls:s=[]}=t;if(je(e,r,o,a)!==1)return{ok:!1,code:"not_adjacent",reason:"Stra\xDFen verbinden nur direkt benachbarte Hexfelder."};let u=n(e,r),i=n(o,a);if(!u||!i)return{ok:!1,code:"missing_hex",reason:"Stra\xDFensegment liegt au\xDFerhalb der geladenen Karte."};if(pt(u.terrainId)||pt(i.terrainId))return{ok:!1,code:"water_forbidden",reason:"Stra\xDFen k\xF6nnen nicht auf Wasser gelegt werden."};if(u.reliefClass==="mountain"||i.reliefClass==="mountain")return{ok:!1,code:"mountain_forbidden",reason:"Stra\xDFen k\xF6nnen nicht \xFCber Gebirge gelegt werden."};let l=Je(e,r,o,a);return s.some(f=>!f.isGate&&Je(f.q1,f.r1,f.q2,f.r2).key===l.key)?{ok:!1,code:"closed_wall_blocks_road",reason:"Eine geschlossene Mauer blockiert diese Kante \u2014 erst ein Tor setzen."}:{ok:!0}}var Mo=tn(hr());var Xe=[.24,.62,.96],Pr=[.92,.28,.3],Oa=[.22,.78,.48],Co=[.94,.72,.22],Va=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function Gt(t){return t.surfaceClass!=="land"}function yt(t){return!Gt(t)&&t.reliefClass!=="mountain"}function or(t,e,r,o){let a=t.sampleCell(e,r);if(o==="harbor"){if(!Gt(a))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let u=[];for(let[i,l]of _e){let c=t.sampleCell(e+i,r+l);yt(c)&&u.push({q:e+i,r:r+l})}return{center:{q:e,r},buildingKind:o,valid:u.length>0,yieldPercent:100,bonusHexes:u,reason:u.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!yt(a))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:a.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],s=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let u=-2;u<=2;u++)for(let i=-2;i<=2;i++){if(je(0,0,i,u)>2)continue;let l=e+i,c=r+u,f=t.sampleCell(l,c);o==="farm"?yt(f)&&Va.has(f.terrainId)&&(n.push({q:l,r:c}),s+=5):o==="lumber_camp"?yt(f)&&f.forestDensity>.08&&(n.push({q:l,r:c}),s+=5):o==="quarry"&&(f.reliefClass==="hills"||f.reliefClass==="mountain")&&(n.push({q:l,r:c}),s+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,s),bonusHexes:n}}function Ke(t,e,r,o){for(let a=0;a<=32;a++)for(let n=-a;n<=a;n++)for(let s=-a;s<=a;s++){if(je(0,0,s,n)!==a)continue;let u=e+s,i=r+n,l=t.sampleCell(u,i);if(yt(l)&&(!o||o(l)))return{q:u,r:i}}return{q:e,r}}function Na(t,e,r){for(let o=0;o<=45;o++)for(let a=-o;a<=o;a++)for(let n=-o;n<=o;n++){if(je(0,0,n,a)!==o)continue;let s=e+n,u=r+a,i=t.sampleCell(s,u);if(Gt(i))for(let[l,c]of _e){let f=t.sampleCell(s+l,u+c);if(yt(f))return{water:{q:s,r:u},land:{q:s+l,r:u+c}}}}return{water:{q:e,r},land:{q:e+1,r}}}function St(t,e,r,o,a,n,s,u=!1){let i=[];for(let l=-a;l<=a;l++)for(let c=-a;c<=a;c++){if(je(0,0,c,l)>a)continue;let f=o.q+c,h=o.r+l,m=Be(f,h);if(r.has(m))continue;let g=t.sampleCell(f,h);!u&&!yt(g)||g.reliefClass!=="mountain"&&(r.add(m),e.push({q:f,r:h,ownerId:n,color:s}),i.push({q:f,r:h}))}return i}function Ut(t,e,r){let o=[],a=t.q,n=t.r,s=0;for(;(a!==e.q||n!==e.r)&&s++<40;){let u=0,i=1/0;for(let f=0;f<6;f++){let h=a+_e[f][0],m=n+_e[f][1],g=je(h,m,e.q,e.r);g<i&&(i=g,u=f)}let l=a+_e[u][0],c=n+_e[u][1];o.push({q1:a,r1:n,q2:l,r2:c,tier:r}),a=l,n=c}return o}function xn(t,e,r=0,o="player",a){let n=new Set(t.map(c=>Be(c.q,c.r))),s=new Set,u=new Set;if(a?.roads)for(let c of a.roads)u.add(Je(c.q1,c.r1,c.q2,c.r2).key);let i=[],l=0;for(let c of t)for(let f=0;f<6;f++){let h=c.q+_e[f][0],m=c.r+_e[f][1];if(n.has(Be(h,m)))continue;let g=Je(c.q,c.r,h,m);if(s.has(g.key)||(s.add(g.key),a?.occupiedRiverEdges?.has(g.key)))continue;if(a?.sampler){let b=a.sampler.sampleCell(g.q1,g.r1),S=a.sampler.sampleCell(g.q2,g.r2);if(!yt(b)||!yt(S))continue}l++;let p=u.has(g.key);i.push({q1:g.q1,r1:g.r1,q2:g.q2,r2:g.r2,kind:e,isGate:p||r>0&&l%r===0,ownerId:o})}return i}function Ro(t,e,r,o){let a=[],n=t,s=e,u=0;for(let i=0;i<r;i++){let l=_e[u];if(o&&l){let c=o.sampleCell(n,s),f=o.sampleCell(n+l[0],s+l[1]);if(Gt(c)||Gt(f))break}if(a.push({q:n,r:s,dir:u}),i%2===0)u=(u+1)%6;else{let c=(u+1)%6;n+=_e[c][0],s+=_e[c][1],u=(u+5)%6}}return a}function Eo(t,e="vedras-welt-01",r){let o=r===void 0?Ht:r===null?void 0:r,a=Mo.default.createPointSampler(e,o);if(t==="fresh-start"){let L=Ke(a,0,0),O=Ke(a,L.q-2,L.r+1),B=[];return St(a,B,new Set,L,1,"player",Xe),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:L,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:L.q,r:L.r,visR:3,expR:5}],scene:{territory:B,buildings:[{id:"cap-1",q:L.q,r:L.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:Xe}],units:[{id:"scout-1",q:L.q+1,r:L.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:Xe,marchPath:[{q:L.q+1,r:L.r},{q:L.q+2,r:L.r},{q:L.q+3,r:L.r-1}]}],sites:[{id:"site-1",q:O.q,r:O.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let L=Ke(a,108,-70),O=Ke(a,L.q+7,L.r-1),B=[],N=new Set,R=St(a,B,N,L,3,"player",Xe);St(a,B,N,O,3,"enemy",Pr);let q=Ke(a,L.q+2,L.r),$=[...Ut(L,q,"stone"),...Ut(q,O,"packed")],X=Ro(L.q-2,L.r-3,7,a),_=Rt({manualRivers:X}),F=xn(R.filter(d=>je(d.q,d.r,L.q,L.r)<=1),"stone",3,"player",{sampler:a,occupiedRiverEdges:_,roads:$});F.length>0&&(F[0].breached=!0);let A={q:q.q+2,r:q.r},I=[{id:"blue-cap",q:L.q,r:L.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:Xe},{id:"blue-fort",q:q.q,r:q.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:Xe,rangeRadius:2},{id:"red-cap",q:O.q,r:O.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:Pr}],k=[{id:"u-blue-def",q:q.q,r:q.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:Xe,marchPath:[{q:L.q+1,r:L.r+1},{q:q.q,r:q.r+1}]},{id:"u-red-siege",q:A.q,r:A.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:Pr,inCombat:!0,marchPath:[A,{q:q.q+1,r:q.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((L.q+O.q)/2),r:Math.round((L.r+O.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:L.q,r:L.r,visR:6,expR:12},{q:q.q,r:q.r,visR:5,expR:10}],scene:{territory:B,rivers:X,roads:$,walls:F,buildings:I,units:k}}}if(t==="coastal-harbors"){let L=Na(a,2,-2),O=[],B=new Set;St(a,O,B,L.land,2,"player",Xe,!1),St(a,O,B,L.water,2,"player",Xe,!0);let N={q:L.water.q+1,r:L.water.r};for(let[$,X]of _e){let _=a.sampleCell(L.water.q+$,L.water.r+X);if(Gt(_)){N={q:L.water.q+$,r:L.water.r+X};break}}let R=[{id:"coastal-cap",q:L.land.q,r:L.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:Xe},{id:"harbor-1",q:L.water.q,r:L.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:Xe}],q=[{id:"boat-1",q:N.q,r:N.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:Xe,marchPath:[L.water,N]},{id:"scout-sea",q:L.water.q,r:L.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:Xe}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:L.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:L.water.q,r:L.water.r,visR:6,expR:11}],scene:{territory:O,roads:Ut(L.land,{q:L.land.q-2,r:L.land.r+1},"packed"),buildings:R,units:q}}}if(t==="sites-and-fauna"){let L=Ke(a,0,0,q=>(q.terrainId==="grassland"||q.terrainId==="pasture")&&q.forestDensity<.25),O=new Set,B=(q,$,X)=>{let _=L.q+q,F=L.r+$;for(let I=0;I<=4;I++)for(let k=-I;k<=I;k++)for(let d=-I;d<=I;d++){if(je(0,0,d,k)!==I)continue;let v=_+d,M=F+k,G=Be(v,M);if(O.has(G))continue;let U=a.sampleCell(v,M);if(yt(U)&&(!X||X(U)))return O.add(G),{q:v,r:M}}let A=Ke(a,_,F);return O.add(Be(A.q,A.r)),A},R=[{id:"fauna-deer-1",dq:0,dr:0,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel (animiert)"},{id:"fauna-horse-1",dq:1,dr:0,family:"fauna",faunaSpecies:"horse",label:"Wildpferde (animiert)"},{id:"site-sc-1",dq:-1,dr:0,family:"stone_circle",variantIndex:0,label:"Steinkreis I"},{id:"site-wt-1",dq:-1,dr:1,family:"watchtower_ruin",variantIndex:0,label:"Wachturmruine I"},{id:"site-mine-1",dq:0,dr:1,family:"forgotten_iron_mine",variantIndex:0,label:"Vergessene Eisenmine I"},{id:"site-house-1",dq:1,dr:-1,family:"abandoned_house",variantIndex:0,label:"Verlassenes Haus I"},{id:"site-barn-1",dq:0,dr:-1,family:"dilapidated_barn",variantIndex:1,label:"Verfallene Scheune II"},{id:"site-water-1",dq:-1,dr:2,family:"waterhole",variantIndex:0,label:"Wasserloch I"},{id:"site-oasis-1",dq:2,dr:-1,family:"oasis",variantIndex:0,label:"Oase I"},{id:"site-obelisk-1",dq:2,dr:0,family:"obelisk",variantIndex:0,label:"Alter Obelisk I"},{id:"site-iron-1",dq:1,dr:1,family:"iron_deposit",variantIndex:0,label:"Eisenvorkommen I"},{id:"site-wt-2",dq:-2,dr:1,family:"watchtower_ruin",variantIndex:2,label:"Wachturmruine III"},{id:"site-mine-2",dq:-2,dr:2,family:"forgotten_iron_mine",variantIndex:3,label:"Vergessene Eisenmine IV"},{id:"site-house-2",dq:2,dr:-2,family:"abandoned_house",variantIndex:2,label:"Verlassenes Haus III"},{id:"site-barn-2",dq:1,dr:-2,family:"dilapidated_barn",variantIndex:3,label:"Verfallene Scheune IV"},{id:"site-obelisk-2",dq:3,dr:-1,family:"obelisk",variantIndex:3,label:"Gebrochener Obelisk IV"},{id:"site-sc-2",dq:-2,dr:0,family:"stone_circle",variantIndex:2,label:"Runen-Steinkreis III"},{id:"site-oasis-2",dq:2,dr:1,family:"oasis",variantIndex:4,label:"Brunnen-Oase V"},{id:"site-iron-2",dq:0,dr:2,family:"iron_deposit",variantIndex:2,label:"Eisenvorkommen III"},{id:"site-water-2",dq:-1,dr:-1,family:"waterhole",variantIndex:3,label:"Seerosen-Wasserloch IV"}].map(q=>{let $=B(q.dq,q.dr);return{id:q.id,q:$.q,r:$.r,family:q.family,faunaSpecies:q.faunaSpecies,variantIndex:q.variantIndex,label:q.label}});return{id:t,title:"5. M22 Fundorte (9\xD75 Varianten) & Animierte Fauna",subtitle:"Alle 9 M22-Fundorttypen (je 5 handgemalte Varianten + Schatten) \xB7 Civ-Style Hirsch- & Pferdeherden",seed:e,cameraCenter:L,cameraZoom:.74,defaultFogMode:"all-visible",visibleCenters:[{q:L.q,r:L.r,visR:8,expR:12}],scene:{sites:R}}}if(t==="strategic-empires"){let L=[{id:"player",name:"Krone Vedra",color:Xe,q:0,r:0},{id:"crimson",name:"Blutmark",color:Pr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:Oa,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:Co,q:8,r:10}],O=[],B=new Set,N=[],R=[];for(let q of L){let $=Ke(a,q.q,q.r);St(a,O,B,$,5,q.id,q.color),N.push({id:`emp-${q.id}`,q:$.q,r:$.r,kind:"capital",label:q.name,level:12,ownerId:q.id,factionColor:q.color}),R.push({id:`army-${q.id}`,q:$.q+2,r:$.r-1,kind:"army",label:`Heer ${q.name}`,strength:520,ownerId:q.id,factionColor:q.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:L.map(q=>({q:q.q,r:q.r,visR:9,expR:15})),scene:{territory:O,buildings:N,units:R}}}let n=Ke(a,110,-70),s=Ke(a,n.q+4,n.r-1),u=Ke(a,n.q-3,n.r+3),i=[],l=new Set,c=St(a,i,l,n,2,"player",Xe);St(a,i,l,s,2,"player",Xe),St(a,i,l,u,2,"player",Xe);let f=Ke(a,n.q+1,n.r),h=Ke(a,n.q-1,n.r,L=>L.forestDensity>.1),m=Ke(a,n.q,n.r+2),g=Ke(a,s.q+1,s.r),p=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:Xe},{id:"town-2",q:s.q,r:s.r,kind:"settlement",centerStage:"city",label:"Ostfurt",level:6,ownerId:"player",factionColor:Xe},{id:"town-3",q:u.q,r:u.r,kind:"settlement",centerStage:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:Xe,constructionProgress:.62},{id:"farm-1",q:f.q,r:f.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:Xe,yieldPercent:or(a,f.q,f.r,"farm").yieldPercent},{id:"lumber-1",q:h.q,r:h.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:Xe,yieldPercent:or(a,h.q,h.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:m.q,r:m.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:Xe,yieldPercent:or(a,m.q,m.r,"quarry").yieldPercent},{id:"fort-1",q:g.q,r:g.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:Xe,rangeRadius:2}],b=[...Ut(n,s,"stone"),...Ut(n,u,"packed"),...Ut(n,m,"trail")],S=Ro(n.q-2,n.r-2,8,a),P=Rt({manualRivers:S}),x=c.filter(L=>je(L.q,L.r,n.q,n.r)===0),w=xn(x,"stone",2,"player",{sampler:a,occupiedRiverEdges:P,roads:b}),H=xn([u],"palisade",3,"player",{sampler:a,occupiedRiverEdges:P,roads:b}),W=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:Co,marchPath:[n,{q:n.q+2,r:n.r-1},s]},{id:"army-1",q:s.q,r:s.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:Xe}],y=Ke(a,n.q+2,n.r+2),E=Ke(a,n.q-2,n.r-1),D=Ke(a,n.q+1,n.r+2),C=[{id:"site-mine",q:y.q,r:y.r,family:"forgotten_iron_mine",label:"Vergessene Eisenmine"},{id:"site-obelisk",q:E.q,r:E.r,family:"obelisk",label:"Alter Obelisk"},{id:"site-deer",q:D.q,r:D.r,family:"fauna",faunaSpecies:"deer",label:"Hirschrudel"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:s.q,r:s.r,visR:4,expR:8},{q:u.q,r:u.r,visR:4,expR:8}],scene:{territory:i,rivers:S,roads:b,walls:[...w,...H],buildings:p,units:W,sites:C}}}var To=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"sites-and-fauna",label:"M22 Fundorte & Animierte Fauna"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function Ao(t,e,r,o,a){if(o==="all-visible"||a?.has(Be(e,r)))return 2;let n=0;for(let s of t.visibleCenters){let u=je(s.q,s.r,e,r);if(u<=s.visR)return 2;u<=s.expR&&n<1&&(n=1)}return n}var kt={SMOKE:0,LEAF:1,BIRD:2,BIRD_SHADOW:3,SNOW:4,SAND:5,WIND:6},Wo=1536,kr=12,Xa=new Set(["capital","settlement","farm","lumber_camp","iron_mine","barracks","academy","trade_office","harbor","fortress","restored_dwelling"]),Po=new Set(["snowfields","frozen_tundra","icy_ocean","tundra"]),za=new Set(["desert","sand_desert","dry_plains","steppe","badlands","savanna"]),Ya=new Set(["forest","deciduous_forest","woodland","dense_forest","jungle","rainforest","boreal_forest","taiga","swamp"]),Ka=new Set(["grassland","plains","meadow","hills","steppe","highland","farmland","savanna"]);function $a(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function ct(t,e,r){return $a(t,e,r)/4294967295}function ut(t){let e=t<0?0:t>1?1:t;return e*e*(3-2*e)}function ja(t){return t.kind==="capital"||t.centerStage==="metropolis"||t.centerStage==="city"?{dx:12,dy:-46}:t.kind==="fortress"?{dx:-10,dy:-44}:t.kind==="settlement"?t.centerStage==="outpost"?{dx:6,dy:-28}:{dx:8,dy:-36}:t.kind==="farm"||t.kind==="restored_dwelling"?{dx:6,dy:-28}:{dx:5,dy:-32}}function Za(t){let{cam:e,detailOpacity:r,timeSec:o,animate:a,lookupHex:n,isWaterTerrain:s,buildings:u,sampleReliefHeight:i,seedInt:l=1337}=t,c=t.out??[];if(c.length=0,r<=.04||e.zoom<.22)return c;let f=O=>{c.length<Wo&&c.push(O)},h=ut((e.zoom-.22)/.26)*Math.min(1,r),m=a?o:4.25,g=e.viewportWidth*.5/Math.max(.08,e.zoom)+220,p=e.viewportHeight*.5/Math.max(.08,e.zoom)+220,b=e.x-g,S=e.x+g,P=e.y-p,x=e.y+p;if(u&&u.length>0)for(let O=0;O<u.length;O++){let B=u[O],N=n(B.q,B.r);if(!N||N.fogState===0)continue;let R=B.kind;if(!Xa.has(R))continue;let q=ke(B.q,B.r),$=i?i(q.x,q.y/Pe)*Pe:0,X=ja(B),_=q.x+X.dx,F=q.y-$+X.dy;if(_<b||_>S||F<P||F>x)continue;let A=N.fogState===1?.58:1,I=B.kind==="capital"||B.centerStage==="metropolis"||B.centerStage==="city"?6:4,k=5.4;for(let d=0;d<I;d++){let v=ct(B.q*17+d,B.r*31+O,l^257),M=((m/k+d/I+v)%1+1)%1,G=M*64,U=Math.sin(M*6.8+v*12)*(3.5+M*8.5),Y=-M*24+U,j=10+M*28,le=ut(M/.16)*(1-ut((M-.44)/.56))*.46*A*h;le<.01||f({x:_+Y,y:F-G,width:j*1.18,height:j*.94,r:.9,g:.89,b:.86,alpha:le,kind:kt.SMOKE,rotRad:(v-.5)*1.4+M*.65,animPhase:M,seed:v})}}let w=Tt(e,1),H=w.maxQ-w.minQ+1,W=w.maxR-w.minR+1;if(H*W<=900){let O=ut((e.zoom-.32)/.28);for(let B=w.minR;B<=w.maxR;B++)for(let N=w.minQ;N<=w.maxQ;N++){let R=n(N,B);if(!R||R.fogState===0)continue;let q=ke(N,B);if(q.x<b||q.x>S||q.y<P||q.y>x)continue;let $=i?i(q.x,q.y/Pe)*Pe:0,X=q.y-$,_=R.fogState===1?.55:1,F=R.terrainId;if(!s(F)&&(Ya.has(F)||R.forestClass==="dense_forest"||R.forestClass==="light_forest"||R.forestDensity>=.35)&&O>.02){let I=F==="jungle"||F==="rainforest",k=F==="taiga"||F==="boreal_forest",d=I?3:2;for(let v=0;v<d;v++){let M=ct(N*23+v,B*41,l^514),G=ct(N*37+v,B*19,l^521),U=5.6+M*3.4,Y=((m/U+G)%1+1)%1,j=(M-.5)*124,Z=(G-.5)*84-52,le=Math.sin(Y*11.5+M*18)*13-Y*14,J=Y*58,he=ut(Y/.16)*(1-ut((Y-.68)/.32))*.78*_*O*h;if(he<.015)continue;let se=.44,Re=.58,ve=.24;I?(se=.32,Re=.57,ve=.22):k?(se=.46,Re=.44,ve=.25):M>.68&&(se=.74,Re=.58,ve=.24);let xe=6+G*3;f({x:q.x+j+le,y:X+Z+J,width:xe*1.35,height:xe,r:se,g:Re,b:ve,alpha:he,kind:kt.LEAF,rotRad:Math.sin(Y*9+G*10)*.95+(M-.5)*.8,animPhase:Y*14+M*6.283,seed:M})}}if(Po.has(F)){let I=F==="snowfields"?4:3;for(let k=0;k<I;k++){let d=ct(N*29+k,B*53,l^771),v=ct(N*61+k,B*17,l^777),M=5.2+d*3,G=((m/M+v)%1+1)%1,U=(d-.5)*150-G*42+Math.sin(G*6.5+v*14)*9,Y=(v-.5)*100-44+G*72,Z=ut(G/.18)*(1-ut((G-.72)/.28))*.68*_*h;if(Z<.015)continue;let le=4.4+d*3.6;f({x:q.x+U,y:X+Y,width:le,height:le,r:.95,g:.97,b:1,alpha:Z,kind:kt.SNOW,rotRad:0,animPhase:G,seed:d})}}if(za.has(F)){let I=ct(N*43,B*67,l^1028);if(I<.62){let k=ct(N*19,B*83,l^1033),d=4.8+k*2.8,v=((m/d+I)%1+1)%1,M=(v-.5)*126,G=(v-.5)*28,Y=ut(v/.24)*(1-ut((v-.66)/.34))*.32*_*h;if(Y>=.01){let j=F==="desert"||F==="sand_desert";f({x:q.x+(k-.5)*56-M,y:X+(I-.5)*58+G,width:68+k*48,height:15+k*9,r:j?.9:.8,g:j?.8:.72,b:j?.58:.52,alpha:Y,kind:kt.SAND,rotRad:-.22,animPhase:v*8+k*6.28,seed:k})}}}if(Ka.has(F)){let I=ct(N*71,B*97,l^1285);if(I<.22){let k=ct(N*13,B*47,l^1289),d=6.2+k*3.5,v=((m/d+I*5)%1+1)%1,G=ut(v/.22)*(1-ut((v-.62)/.38))*.15*_*h;G>=.008&&f({x:q.x+(k-.5)*44-(v-.5)*145,y:X-12+(I-.11)*90+(v-.5)*26,width:82+k*46,height:22+k*10,r:.94,g:.96,b:.95,alpha:G,kind:kt.WIND,rotRad:-.18,animPhase:v,seed:k})}}}}let y=680,E=Math.floor(b/y)-1,D=Math.floor(S/y)+1,C=Math.floor(P/y)-1,L=Math.floor(x/y)+1;if((D-E+1)*(L-C+1)<=81)for(let O=C;O<=L;O++)for(let B=E;B<=D;B++){let N=ct(B*59,O*83,l^1542);if(N>.56)continue;let R=ct(B*31,O*47,l^1553),q=ct(B*73,O*29,l^1561),$=190+R*170,X=110+q*115,_=(.055+R*.035)*(q>.5?1:-1),F=m*_+N*Math.PI*2,A=(B+.5)*y+Math.cos(F)*$,I=(O+.5)*y+Math.sin(F)*X;if(A<b||A>S||I<P||I>x)continue;let k=$e(A,I),d=n(k.q,k.r);if(!d||d.fogState===0)continue;let v=s(d.terrainId)||d.terrainId==="coastal_water"||d.terrainId==="beach";if(!v)for(let he=0;he<6;he++){let[se,Re]=_e[he],ve=n(k.q+se,k.r+Re);if(ve&&s(ve.terrainId)){v=!0;break}}if(Po.has(d.terrainId)&&N>.2)continue;let G=-Math.sin(F)*$*_,U=Math.cos(F)*X*_,Y=Math.atan2(U,G),j=Y+Math.PI*.5,Z=d.fogState===1?.55:1,le=v?3:3+(R>.55?1:0),J=-42,ge=32;for(let he=0;he<le;he++){let se=he%2===0?1:-1,Re=Math.ceil(he/2),ve=-Re*22,xe=se*Re*19+Math.sin(m*.9+he*2.1+R*6)*4.5,be=Math.cos(Y),ye=Math.sin(Y),De=A+be*ve-ye*xe,we=I+ye*ve+be*xe,Oe=(m*.42+he*.27+q)%1>.52?-.18+Math.sin(m*1.4+he)*.06:Math.sin(m*6.8+he*1.7+R*5)*.62,We=(v?20:16)*(.9+.2*(he===0?1:q)),Ge=.84*Z*h;f({x:De+J,y:we+ge,width:We*.95,height:We*.55,r:.05,g:.07,b:.11,alpha:.22*Z*h,kind:kt.BIRD_SHADOW,rotRad:j,animPhase:Oe,seed:R}),f({x:De,y:we,width:We,height:We*.72,r:v?.96:.22,g:v?.97:.23,b:v?.98:.25,alpha:Ge,kind:kt.BIRD,rotRad:j,animPhase:Oe,seed:q})}}return c}var Qa=`#version 300 es
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
`,Ja=`#version 300 es
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
`;function ko(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate ambient VFX shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let a=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Ambient VFX shader compile error:
${a}`)}return o}var Wr=class{constructor(e){this.instanceData=new Float32Array(Wo*kr);this.scratchParticles=[];this.gl=e;let r=ko(e,e.VERTEX_SHADER,Qa),o=ko(e,e.FRAGMENT_SHADER,Ja),a=e.createProgram();if(!a)throw new Error("Failed to allocate ambient VFX program");if(e.attachShader(a,r),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(a,e.LINK_STATUS)){let c=e.getProgramInfoLog(a)||"Unknown link error";throw e.deleteProgram(a),new Error(`Ambient VFX program link error:
${c}`)}this.prog=a;let n=c=>{let f=e.getUniformLocation(a,c);if(!f)throw new Error(`Missing ambient VFX uniform: ${c}`);return f};this.uCam=n("u_camCenter"),this.uView=n("u_viewportSize"),this.uZoom=n("u_zoom");let s=e.createVertexArray(),u=e.createBuffer(),i=e.createBuffer();if(!s||!u||!i)throw new Error("Failed to allocate ambient VFX buffers");this.vao=s,this.quadVbo=u,this.instanceVbo=i,e.bindVertexArray(s),e.bindBuffer(e.ARRAY_BUFFER,u),e.bufferData(e.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let l=kr*4;for(let c=1;c<=3;c++)e.enableVertexAttribArray(c),e.vertexAttribPointer(c,4,e.FLOAT,!1,l,(c-1)*16),e.vertexAttribDivisor(c,1);e.bindVertexArray(null)}render(e){let r=Za({...e,out:this.scratchParticles}),o=r.length;if(o===0)return{drawCalls:0,particleCount:0};let{gl:a,instanceData:n}=this;for(let s=0;s<o;s++){let u=r[s],i=s*kr;n[i]=u.x,n[i+1]=u.y,n[i+2]=u.width,n[i+3]=u.height,n[i+4]=u.r,n[i+5]=u.g,n[i+6]=u.b,n[i+7]=u.alpha,n[i+8]=u.kind,n[i+9]=u.rotRad,n[i+10]=u.animPhase,n[i+11]=u.seed}return a.useProgram(this.prog),a.bindVertexArray(this.vao),a.enable(a.BLEND),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.uniform2f(this.uCam,e.cam.x,e.cam.y),a.uniform2f(this.uView,e.cam.viewportWidth,e.cam.viewportHeight),a.uniform1f(this.uZoom,e.cam.zoom),a.bindBuffer(a.ARRAY_BUFFER,this.instanceVbo),a.bufferSubData(a.ARRAY_BUFFER,0,n.subarray(0,o*kr)),a.drawArraysInstanced(a.TRIANGLES,0,6,o),a.bindVertexArray(null),{drawCalls:1,particleCount:o}}dispose(){let{gl:e}=this;e.deleteBuffer(this.instanceVbo),e.deleteBuffer(this.quadVbo),e.deleteVertexArray(this.vao),e.deleteProgram(this.prog)}};var ar=512,Lo={deer:{spriteKey:"actors/fauna/deer",herdSize:4,baseWidth:66,pastureRx:68,pastureRy:48,strideHz:2.35,hopAmp:.34,cycleMinSec:9.5,cycleMaxSec:14},horse:{spriteKey:"actors/fauna/horse",herdSize:4,baseWidth:74,pastureRx:74,pastureRy:52,strideHz:2.65,hopAmp:.44,cycleMinSec:8.5,cycleMaxSec:13},sheep:{spriteKey:"actors/fauna/sheep",herdSize:5,baseWidth:52,pastureRx:62,pastureRy:44,strideHz:2.45,hopAmp:.24,cycleMinSec:10.5,cycleMaxSec:15}};function ei(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function Ot(t,e,r){return ei(t,e,r)/4294967295}function ti(t){let e=t<0?0:t>1?1:t;return e*e*(3-2*e)}function ri(t,e){if(t.family!=="fauna")return null;let r=e.infrastructure.sprites,o=t.faunaSpecies;if(o){let n=Lo[o];if(n&&r[n.spriteKey])return o}let a=(t.label||"").toLowerCase();return(a.includes("pferd")||a.includes("horse")||a.includes("gest\xFCt"))&&r["actors/fauna/horse"]?"horse":(a.includes("schaf")||a.includes("sheep")||a.includes("herde"))&&r["actors/fauna/sheep"]?"sheep":r["actors/fauna/deer"]?"deer":r["actors/fauna/horse"]?"horse":null}function wn(t,e,r,o,a,n,s){let u=(o%6+6)%6,i=r/Math.max(1,a)*Math.PI*2,l=(Ot(t*19+r,e*31+u,911)-.5)*1.45,c=i+u*.92+l,f=.28+.68*Ot(t*7+u,e*13+r,3571);return{ox:Math.cos(c)*n*f,oy:Math.sin(c)*s*f}}function ni(t){let{q:e,r,memberIdx:o,herdSize:a,profile:n,frameCount:s,timeSec:u,animate:i}=t,l=e*73+o*17,c=r*89+o*29,f=n.cycleMinSec+(n.cycleMaxSec-n.cycleMinSec)*Ot(l,c,101),h=Ot(l,c,202)*f*6,m=i?u+h:h,g=Math.floor(m/f),p=(m-g*f)/f,b=wn(e,r,o,g,a,n.pastureRx,n.pastureRy),S=wn(e,r,o,g+1,a,n.pastureRx,n.pastureRy),P=wn(e,r,o,g-1,a,n.pastureRx,n.pastureRy),x=o===0?1.07:.86+.18*Ot(l,c,303),w=Ot(l,c,404),H=b.ox,W=b.oy,y=0,E=0,D="idle",C=b.ox<P.ox;if(p<.44)D="graze",E=s>=2?1:0,y=0;else if(p<.56)D="idle",E=0,C=S.ox<b.ox;else if(p<.88){D="walk";let L=(p-.56)/.32,O=ti(L);H=b.ox+(S.ox-b.ox)*O,W=b.oy+(S.oy-b.oy)*O,C=S.ox<b.ox;let B=s>=4?s-2:0,N=m*n.strideHz;if(B>=2){let $=B>2?B*.5:1;E=2+Math.floor(N*$)%B}else s>=2&&(E=Math.floor(N)%s);let R=Math.sin(L*Math.PI),q=.5-.5*Math.cos(N*Math.PI*2);y=i?q*n.hopAmp*R:0}else D="idle",H=S.ox,W=S.oy,C=S.ox<b.ox,E=0;return{ox:H,oy:W,hopLift:y,frameIndex:E,flipX:C,scaleFactor:x,tintHash:w,behavior:D}}function Io(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:a,timeSec:n,animate:s}=t,u=[],i=new Set;if(!r||r.length===0)return{actors:u,coveredSiteIds:i};let l=e.infrastructure.sprites;for(let c=0;c<r.length;c++){let f=r[c];if(f.family!=="fauna")continue;let h=o(f.q,f.r);if(h===0)continue;let m=ri(f,e);if(!m)continue;let g=Lo[m];if(!g)continue;let p=l[g.spriteKey];if(!p)continue;i.add(f.id);let b=Math.max(1,p.frameCount??4),S=p.frameSize?p.frameSize[0]:Math.max(1,p.sourceSize[0]/b),x=(p.frameSize?p.frameSize[1]:p.sourceSize[1])/Math.max(1,S),w=ke(f.q,f.r);for(let H=0;H<g.herdSize&&!(u.length>=ar);H++){let W=ni({q:f.q,r:f.r,memberIdx:H,herdSize:g.herdSize,profile:g,frameCount:b,timeSec:n,animate:s}),y=w.x+W.ox,E=w.y+W.oy,D=a?a(y,E/Pe)*Pe:0,C=g.baseWidth*W.scaleFactor,L=C*x;u.push({x:y,groundY:E,y:E-D-W.hopLift,hopLift:Math.max(0,W.hopLift),width:C,height:L,frameIndex:W.frameIndex,frameCount:b,flipX:W.flipX,tintHash:W.tintHash,behavior:W.behavior,fogState:h,page:p.page,u0:p.uv[0],v0:p.uv[1],u1:p.uv[2],v1:p.uv[3]})}}return u.sort((c,f)=>c.groundY-f.groundY||c.x-f.x),{actors:u,coveredSiteIds:i}}var oi=`#version 300 es
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
`,ai=`#version 300 es
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
`,ii=`#version 300 es
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
`,si=`#version 300 es
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
`;function Fo(t,e,r){let o=(u,i)=>{let l=t.createShader(u);if(!l)throw new Error("Failed to create AnimatedActorPass shader.");if(t.shaderSource(l,i),t.compileShader(l),!t.getShaderParameter(l,t.COMPILE_STATUS)){let c=t.getShaderInfoLog(l)??"unknown";throw t.deleteShader(l),new Error(`AnimatedActorPass shader compile failed: ${c}`)}return l},a=o(t.VERTEX_SHADER,e),n=o(t.FRAGMENT_SHADER,r),s=t.createProgram();if(!s)throw new Error("Failed to link AnimatedActorPass program.");if(t.attachShader(s,a),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(a),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS)){let u=t.getProgramInfoLog(s)??"unknown";throw t.deleteProgram(s),new Error(`AnimatedActorPass link failed: ${u}`)}return s}var Fr=class{constructor(e){this.shadowData=new Float32Array(ar*5);this.actorData=new Float32Array(ar*10);this.gl=e;let r=new Float32Array([0,0,1,0,0,1,1,0,1,1,0,1]),o=e.createBuffer();if(!o)throw new Error("AnimatedActorPass quad VBO alloc failed.");this.quadVbo=o,e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),this.shadowProgram=Fo(e,oi,ai),this.shLocCam=e.getUniformLocation(this.shadowProgram,"uCamCenter"),this.shLocViewport=e.getUniformLocation(this.shadowProgram,"uViewportLogical"),this.shLocZoom=e.getUniformLocation(this.shadowProgram,"uZoom");let a=e.createVertexArray(),n=e.createBuffer();if(!a||!n)throw new Error("AnimatedActorPass shadow VAO alloc failed.");this.shadowVao=a,this.shadowVbo=n,e.bindVertexArray(a),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,this.shadowData.byteLength,e.DYNAMIC_DRAW);let s=20;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,s,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,1,e.FLOAT,!1,s,16),e.vertexAttribDivisor(2,1),this.actorProgram=Fo(e,ii,si),this.acLocCam=e.getUniformLocation(this.actorProgram,"uCamCenter"),this.acLocViewport=e.getUniformLocation(this.actorProgram,"uViewportLogical"),this.acLocZoom=e.getUniformLocation(this.actorProgram,"uZoom"),this.acLocAtlas=e.getUniformLocation(this.actorProgram,"uAtlas"),this.acLocDetail=e.getUniformLocation(this.actorProgram,"uDetailOpacity"),this.acLocPolish=e.getUniformLocation(this.actorProgram,"uNaturePolish");let u=e.createVertexArray(),i=e.createBuffer();if(!u||!i)throw new Error("AnimatedActorPass actor VAO alloc failed.");this.actorVao=u,this.actorVbo=i,e.bindVertexArray(u),e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.actorData.byteLength,e.DYNAMIC_DRAW);let l=40;e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,l,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,l,16),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,2,e.FLOAT,!1,l,32),e.vertexAttribDivisor(3,1),e.bindVertexArray(null)}render(e){let{cam:r,assets:o,actors:a,detailOpacity:n,shadowOpacity:s,naturePolish:u}=e;if(a.length===0||n<=.03)return{drawCalls:0,renderedActors:0};let i=this.gl,l=0;if(i.enable(i.BLEND),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA),s>.02){let m=0,g=this.shadowData;for(let p=0;p<a.length&&m<ar;p++){let b=a[p],S=Math.max(.68,1-b.hopLift*.04),P=b.width*.36*S,x=b.width*.14*S,w=m*5;g[w]=b.x-b.width*.12,g[w+1]=b.y+b.hopLift+2,g[w+2]=P,g[w+3]=x,g[w+4]=s*.74*S*n*(b.fogState===1?.55:1),m++}m>0&&(i.useProgram(this.shadowProgram),i.uniform2f(this.shLocCam,r.x,r.y),i.uniform2f(this.shLocViewport,r.viewportWidth,r.viewportHeight),i.uniform1f(this.shLocZoom,r.zoom),i.bindVertexArray(this.shadowVao),i.bindBuffer(i.ARRAY_BUFFER,this.shadowVbo),i.bufferSubData(i.ARRAY_BUFFER,0,g.subarray(0,m*5)),i.drawArraysInstanced(i.TRIANGLES,0,6,m),l++)}i.useProgram(this.actorProgram),i.uniform2f(this.acLocCam,r.x,r.y),i.uniform2f(this.acLocViewport,r.viewportWidth,r.viewportHeight),i.uniform1f(this.acLocZoom,r.zoom),i.uniform1i(this.acLocAtlas,0),i.uniform1f(this.acLocDetail,n),i.uniform1f(this.acLocPolish,u),i.bindVertexArray(this.actorVao);let c=this.actorData,f=0,h=0;for(;h<a.length;){let m=a[h].page,g=o.infraPages[m],p=0;for(;h<a.length&&a[h].page===m&&p<ar;){let b=a[h++];if(!g)continue;let S=b.x-b.width*.5,P=b.y-b.height*.92,x=(b.u1-b.u0)/b.frameCount,w=x*.004,H=b.u0+x*b.frameIndex+w,W=b.u0+x*(b.frameIndex+1)-w,y=p*10;c[y]=S,c[y+1]=P,c[y+2]=b.width,c[y+3]=b.height,c[y+4]=b.flipX?W:H,c[y+5]=b.v0,c[y+6]=b.flipX?H:W,c[y+7]=b.v1,c[y+8]=b.fogState,c[y+9]=b.tintHash,p++}p>0&&g&&(i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,g),i.bindBuffer(i.ARRAY_BUFFER,this.actorVbo),i.bufferSubData(i.ARRAY_BUFFER,0,c.subarray(0,p*10)),i.drawArraysInstanced(i.TRIANGLES,0,6,p),l++,f+=p)}return i.bindVertexArray(null),{drawCalls:l,renderedActors:f}}dispose(){this.gl.deleteBuffer(this.quadVbo),this.gl.deleteBuffer(this.shadowVbo),this.gl.deleteVertexArray(this.shadowVao),this.gl.deleteProgram(this.shadowProgram),this.gl.deleteBuffer(this.actorVbo),this.gl.deleteVertexArray(this.actorVao),this.gl.deleteProgram(this.actorProgram)}};function li(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function Lr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function Sn(t,e,r,o,a){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&a>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,a)),n}async function _n(t,e,r="auto",o){let a=e.replace(/\/+$/,""),n=await fetch(`${a}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${a}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let s=await n.json();if(s.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${s.schema}`);let u=li(t,r),i=u==="mobile"?Math.min(256,s.terrain.textureSize):s.terrain.textureSize,l=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),c=l?t.getParameter(l.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,f=s.terrain.layers.length+s.nature.pages.length+s.shadows.pages.length+s.infrastructure.pages.length+(s.clouds.files.length>0?1:0),h=0,m=R=>{h+=1,o?.(h,f,R)},g=t.createTexture();if(!g)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,g);let p=Math.max(1,s.terrain.layers.length),b=Math.floor(Math.log2(i))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,b,t.RGBA8,i,i,p),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let S=i!==s.terrain.textureSize?{width:i,height:i}:void 0,P=s.terrain.layers;for(let R=0;R<P.length;R+=8){let q=P.slice(R,R+8),$=await Promise.all(q.map(X=>Lr(`${a}/${X.file}`,S)));t.bindTexture(t.TEXTURE_2D_ARRAY,g);for(let X=0;X<q.length;X++){let _=$[X];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,q[X].layer,i,i,1,t.RGBA,t.UNSIGNED_BYTE,_),_.close(),m(`Terrain ${q[X].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,g),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),l&&c>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,l.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,c));let x=u==="mobile"?.5:1,w=async(R,q)=>(await Promise.all(R.map(X=>Lr(`${a}/${X.file}`,x<1?{width:Math.max(256,Math.round(X.width*x)),height:Math.max(256,Math.round(X.height*x))}:void 0)))).map((X,_)=>{let F=Sn(t,X,t.CLAMP_TO_EDGE,l,c);return X.close(),m(`${q} ${_+1}/${R.length}`),F}),[H,W,y]=await Promise.all([w(s.nature.pages,"Natur-Atlas"),w(s.shadows.pages,"Schatten-Atlas"),w(s.infrastructure.pages,"Infra-Atlas")]),E=null,D=null;if(s.clouds.files.length>0){let R=s.clouds.files.find(_=>_.id.startsWith("cloud_base"))??s.clouds.files[0],q=s.clouds.files.find(_=>_.id.startsWith("cloud_edge")),[$,X]=await Promise.all([Lr(`${a}/${R.file}`),q?Lr(`${a}/${q.file}`):Promise.resolve(null)]);E=Sn(t,$,t.REPEAT,l,c),$.close(),X&&(D=Sn(t,X,t.REPEAT,l,c),X.close()),m("Nebel-Wolken")}let L=s.terrain.byType.forest_floor?.layers?.[0]??0,B=(s.terrain.byType.coastal_water??s.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:s,vramTier:u,terrainArray:g,terrainLayerSize:i,forestFloorLayer:L,coastalWaterLayer:B,naturePages:H,shadowPages:W,infraPages:y,cloudTexture:E,cloudEdgeTexture:D,dispose:()=>{t.deleteTexture(g);for(let R of H)t.deleteTexture(R);for(let R of W)t.deleteTexture(R);for(let R of y)t.deleteTexture(R);E&&t.deleteTexture(E),D&&t.deleteTexture(D)}}}var ci=316/384;function Do(t,e){return{x:256*(t+e*.5),y:Ye*e}}function ui(t,e,r,o){let a=e.x-t.x,n=e.y-t.y,s=o.x-r.x,u=o.y-r.y,i=a*u-n*s;if(Math.abs(i)<1e-9)return null;let l=r.x-t.x,c=r.y-t.y,f=(l*u-c*s)/i,h=(l*n-c*a)/i;return f<0||f>1||h<0||h>1?null:{x:t.x+f*a,y:t.y+f*n}}function Bo(t){let{roads:e,routes:r=[],manualRivers:o=[],lookupFog:a,isWaterHex:n}=t;if(e.length===0||r.length===0&&o.length===0)return[];let s=[];for(let i of r){let l=rr(i,34,n);l&&l.points.length>=2&&s.push(l)}if(o.length>0){let i=bn(o,34);for(let l of i)l.points.length>=2&&s.push(l)}if(s.length===0)return[];let u=[];for(let i of e){let l=lt(i.q1,i.r1,i.q2,i.r2);if(l<0)continue;let c=a(i.q1,i.r1),f=a(i.q2,i.r2),h=c>=f?c:f;if(h===0)continue;let m=Do(i.q1,i.r1),g=Do(i.q2,i.r2),p=g.x-m.x,b=g.y-m.y,S=Math.hypot(p,b)||1,P=[];for(let w of s){let H=w.points,W=Math.max(18,w.width*.72);for(let y=1;y<H.length;y++){let E=H[y-1],D=H[y],C=ui(m,g,E,D);if(!C)continue;let L=D.x-E.x,O=D.y-E.y;Math.abs(p*O-b*L)/(S*(Math.hypot(L,O)||1))<=.16||P.some(N=>Math.hypot(N.x-C.x,N.y-C.y)<W)||u.some(N=>Math.hypot(N.ux-C.x,N.uy-C.y)<W)||P.push({x:C.x,y:C.y,width:w.width})}}let x=i.tier==="stone"?"stone":"timber";for(let w of P)u.push({ux:w.x,uy:w.y,dir:l,material:x,tier:i.tier,length:Math.max(96,w.width+64),fogState:h})}return u}function qo(t){let{manifest:e,crossings:r,sampleReliefHeight:o}=t;if(r.length===0)return[];let a=e.infrastructure.sprites,n=[];for(let s of r){let u=String(s.dir).padStart(2,"0"),i=`bridges/${s.material}/bridge_dir_${u}`,l=`bridges/${s.material==="stone"?"timber":"stone"}/bridge_dir_${u}`,c=a[i]??a[l];if(!c)continue;let f=s.length/ci,h=s.uy*Pe,m=o?o(s.ux,s.uy)*Pe:0,g=h-m,p=e.shadows.sprites[`bridge_shadow:axis${s.dir%3}`],b=100,S=p?{shadowPage:p.page,shadowU0:p.uv[0],shadowV0:p.uv[1],shadowU1:p.uv[2],shadowV1:p.uv[3],shadowRelLeft:p.boundsInSpriteWidth[0]*b,shadowRelTop:p.boundsInSpriteWidth[1]*b,shadowWidth:(p.boundsInSpriteWidth[2]-p.boundsInSpriteWidth[0])*b,shadowHeight:(p.boundsInSpriteWidth[3]-p.boundsInSpriteWidth[1])*b}:{};n.push({x:s.ux,y:g,relLeft:-f*.5,relTop:-f*.5,width:f,height:f,page:c.page,u0:c.uv[0],v0:c.uv[1],u1:c.uv[2],v1:c.uv[3],sortY:h-26,fogState:s.fogState,...S})}return n}var di={"buildings/centers/outpost":156,"buildings/centers/settlement":170,"buildings/centers/city":182,"buildings/centers/metropolis":190,"buildings/centers/capital_t1":192,"buildings/tier1/farm":174,"buildings/tier1/lumber_camp":164,"buildings/tier1/quarry":172,"buildings/tier1/iron_mine":168,"buildings/tier1/fortress":182,"buildings/tier1/watchtower":100,"buildings/tier1/harbor":184},fi={"buildings/centers/outpost":[.5,.72],"buildings/centers/settlement":[.5,.72],"buildings/centers/city":[.5,.71],"buildings/centers/metropolis":[.5,.72],"buildings/centers/capital_t1":[.5,.74],"buildings/tier1/farm":[.5,.7],"buildings/tier1/lumber_camp":[.5,.72],"buildings/tier1/quarry":[.5,.68],"buildings/tier1/iron_mine":[.5,.72],"buildings/tier1/fortress":[.5,.74],"buildings/tier1/watchtower":[.5,.87],"buildings/tier1/harbor":[.5,.7]};function hi(t,e,r,o){let a=t.infrastructure.sprites,n=Math.max(1,Math.min(4,Math.round(r||1))),s=[];if(e==="capital")for(let u=n;u>=1;u--)s.push(`buildings/centers/capital_t${u}`);else if(e==="settlement")o&&s.push(`buildings/centers/${o}`),n>=4&&s.push("buildings/centers/metropolis"),n>=3&&s.push("buildings/centers/city"),n>=2&&s.push("buildings/centers/settlement"),s.push("buildings/centers/outpost"),s.push("buildings/centers/settlement");else for(let u=n;u>=1;u--)s.push(`buildings/tier${u}/${e}`);for(let u of s)if(a[u])return u;return null}function Ho(t){let{manifest:e,buildings:r,lookupFog:o,sampleReliefHeight:a}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredBuildingIds:s};let u=e.infrastructure.sprites;for(let i of r){let l=o(i.q,i.r);if(l===0)continue;let c=hi(e,i.kind,i.level,i.centerStage);if(!c)continue;let f=u[c];if(!f)continue;s.add(i.id);let h=ke(i.q,i.r),m=h.x,g=h.y/Pe,p=a?a(m,g)*Pe:0,b=h.y-p,S=di[c]??200,[P,x]=f.sourceSize,w=P>0?x/P:1,H=S*w,[W,y]=fi[c]??[.5,.72],E=e.shadows.sprites[`building_shadow:${c}`],D=E?{shadowPage:E.page,shadowU0:E.uv[0],shadowV0:E.uv[1],shadowU1:E.uv[2],shadowV1:E.uv[3],shadowRelLeft:E.boundsInSpriteWidth[0]*S,shadowRelTop:E.boundsInSpriteWidth[1]*S,shadowWidth:(E.boundsInSpriteWidth[2]-E.boundsInSpriteWidth[0])*S,shadowHeight:(E.boundsInSpriteWidth[3]-E.boundsInSpriteWidth[1])*S}:{};n.push({x:m,y:b,relLeft:-S*W,relTop:-H*y,width:S,height:H,page:f.page,u0:f.uv[0],v0:f.uv[1],u1:f.uv[2],v1:f.uv[3],sortY:h.y+8,fogState:l,...D})}return n.sort((i,l)=>i.sortY-l.sortY||i.x-l.x),{sprites:n,coveredBuildingIds:s}}var Ir=.08,Dr=2,Uo=.15,Cn=.21;function Rn(t){return t>=Cn?0:t<=Uo?1:(Cn-t)/(Cn-Uo)}function Go(t){return Rn(t)>=.5?"strategic":"detail"}function Br(t,e,r){return t<e?e:t>r?r:t}var qr=class{constructor(e,r,o,a){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],a=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,s=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,s,this.pinchStartZoom*(a/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,a=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,a),this.state.x-=o/this.state.zoom,this.state.y-=a/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=Nt(r.x,r.y,this.state),a=$e(o.x,o.y),n=`${a.q},${a.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(a))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,a=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,s]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=s,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=Nt(a.x,a.y,this.state),s=$e(n.x,n.y);this.callbacks.onHexClick?.(s),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:s})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=a;let n=ke(r.q,r.r),s=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:Br(o,Ir,Dr),viewportWidth:Math.max(1,s.width||e.clientWidth||1280),viewportHeight:Math.max(1,s.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),a=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*a)),s=Math.max(1,Math.round(o*a)),u=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==a||this.canvas.width!==n||this.canvas.height!==s;return u&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=a,this.canvas.width=n,this.canvas.height=s),u}centerOnHex(e,r,o){let a=ke(e,r);this.state.x=a.x,this.state.y=a.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=Br(o,Ir,Dr)),this.callbacks.onChange()}setZoom(e){this.state.zoom=Br(e,Ir,Dr),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let a=Br(o,Ir,Dr);if(Math.abs(a-this.state.zoom)<1e-5)return;let n=Nt(e,r,this.state);this.state.zoom=a;let s=Nt(e,r,this.state);this.state.x+=n.x-s.x,this.state.y+=n.y-s.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var Oo={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function Hr(t,e,r){return t<e?e:t>r?r:t}function mi(t,e,r,o,a,n){let s=a-r,u=n-o,i=s*s+u*u,l=i>1e-6?Hr(((t-r)*s+(e-o)*u)/i,0,1):0,c=r+l*s,f=o+l*u,h=t-c,m=e-f;return h*h+m*m}function Mn(t){if(!t)return Oo;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let a of t.buildings){e.add(Be(a.q,a.r));let n=ke(a.q,a.r),s=a.kind==="capital"||a.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-64,maxX:n.x+s+64,minY:n.y-s-64,maxY:n.y+s+64})}if(t.sites&&t.sites.length>0)for(let a of t.sites){let n=ke(a.q,a.r),s=a.family==="fauna"?80:78;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-56,maxX:n.x+s+56,minY:n.y-s-56,maxY:n.y+s+56})}if(t.walls&&t.walls.length>0)for(let a of t.walls){let n=lt(a.q1,a.r1,a.q2,a.r2);if(n<0)continue;let{a:s,b:u}=ht(a.q1,a.r1,n),i=a.isGate?a.kind==="stone"?24:20:a.kind==="stone"?18:14,l=a.kind==="stone"?26:16,c=l+64;r.push({ax:s.x,ay:s.y,bx:u.x,by:u.y,halfWidth:i,pierRadius:l,minX:Math.min(s.x,u.x)-c,maxX:Math.max(s.x,u.x)+c,minY:Math.min(s.y,u.y)-c,maxY:Math.max(s.y,u.y)+c,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let a of t.roads){let n=ke(a.q1,a.r1),s=ke(a.q2,a.r2),u=a.tier==="stone"?30:a.tier==="packed"?24:18,i=u+56;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:u,minX:Math.min(n.x,s.x)-i,maxX:Math.max(n.x,s.x)+i,minY:Math.min(n.y,s.y)-i,maxY:Math.max(n.y,s.y)+i,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let a of t.rivers){let{a:n,b:s}=ht(a.q,a.r,a.dir),u=22,i=u+48;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:u,pierRadius:20,minX:Math.min(n.x,s.x)-i,maxX:Math.max(n.x,s.x)+i,minY:Math.min(n.y,s.y)-i,maxY:Math.max(n.y,s.y)+i,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?Oo:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function En(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(Be(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,a=Hr(t.width*.42,12,48),n=Hr(t.width*.34,10,34),s=Hr(t.width*.28,8,26),u=e.discs;for(let l=0;l<u.length;l++){let c=u[l];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let f=r-c.cx,h=o-c.cy,m=c.radius+n*.6;if(f*f+h*h<=m*m)return!0}let i=e.segments;for(let l=0;l<i.length;l++){let c=i[l];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let f=c.kind==="wall"?a:c.kind==="road"?n:s,h=c.halfWidth+f+(c.kind==="wall"?8:4);if(mi(r,o,c.ax,c.ay,c.bx,c.by)<=h*h)return!0;if(c.kind==="wall"){let m=c.pierRadius+a+6,g=m*m,p=r-c.ax,b=o-c.ay;if(p*p+b*b<=g)return!0;let S=r-c.bx,P=o-c.by;if(S*S+P*P<=g)return!0}}return!1}function Vo(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function pi(t,e,r){return!(t.x1+r<e.x0||e.x1+r<t.x0||t.y1+r<e.y0||e.y1+r<t.y0)}function Ur(t,e,r,o,a,n,s=.86,u=!1){t.font=u?`700 ${n}px Georgia, "Palatino Linotype", "Book Antiqua", serif`:`600 ${n}px system-ui, -apple-system, sans-serif`;let i=t.measureText(o),l=Math.max(6,n*.58),c=Math.max(3,n*.32),f=i.width+l*2,h=n+c*2,m=e-f*.5,g=r-h*.5,p=Math.min(8,h*.45);return t.beginPath(),t.roundRect(m,g,f,h,p),t.fillStyle=u?`rgba(26, 20, 15, ${Math.min(.92,s+.04)})`:`rgba(12, 17, 23, ${s})`,t.fill(),t.lineWidth=u?1.6:1.4,t.strokeStyle=u?Vo([a[0]*.65+.32,a[1]*.65+.27,a[2]*.65+.16],.92):Vo(a,.9),t.stroke(),t.fillStyle=u?"#f4e8cd":"#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5),{x0:m,y0:g,x1:m+f,y1:g+h}}function gi(t,e,r,o,a,n){let s=e.scale*Math.max(.7,Math.min(1.35,a/.135)),u=e.fogState===1?.62:1,i=n*u;if(!(i<.03)){if(t.save(),t.translate(r,o),t.lineCap="round",t.lineJoin="round",e.kind==="peak"){let l=13.5*s,c=12.5*s;t.beginPath(),t.moveTo(0,-c),t.lineTo(l,c*.36),t.lineTo(l*.08,c*.36),t.closePath(),t.fillStyle=`rgba(236, 224, 198, ${.58*i})`,t.fill(),t.beginPath(),t.moveTo(0,-c),t.lineTo(l*.08,c*.36),t.lineTo(-l,c*.36),t.closePath(),t.fillStyle=`rgba(62, 46, 33, ${.42*i})`,t.fill(),t.beginPath(),t.moveTo(-l,c*.36),t.quadraticCurveTo(-l*.35,-c*.25,0,-c),t.quadraticCurveTo(l*.38,-c*.22,l,c*.36),t.moveTo(0,-c),t.quadraticCurveTo(-l*.08,-c*.15,l*.08,c*.34),t.strokeStyle=`rgba(48, 34, 22, ${.74*i})`,t.lineWidth=Math.max(1,1.2*s),t.stroke(),t.beginPath(),t.moveTo(-l*.15,-c*.35),t.lineTo(-l*.56,c*.18),t.moveTo(-l*.05,-c*.05),t.lineTo(-l*.3,c*.28),t.strokeStyle=`rgba(48, 34, 22, ${.46*i})`,t.lineWidth=Math.max(.75,.85*s),t.stroke()}else if(e.kind==="hill"){let l=12.2*s,c=5.8*s;t.beginPath(),t.moveTo(-l,c*.35),t.quadraticCurveTo(0,-c*1.2,l,c*.35),t.strokeStyle=`rgba(68, 50, 32, ${.62*i})`,t.lineWidth=Math.max(.95,1.12*s),t.stroke(),t.beginPath(),t.moveTo(-l*.55,-c*.15),t.lineTo(-l*.72,c*.28),t.moveTo(-l*.22,-c*.35),t.lineTo(-l*.38,c*.22),t.strokeStyle=`rgba(68, 50, 32, ${.42*i})`,t.lineWidth=Math.max(.75,.85*s),t.stroke()}else if(e.kind==="forest"||e.kind==="jungle"){let l=5.4*s,c=e.kind==="jungle"?`rgba(46, 94, 52, ${.46*i})`:`rgba(68, 98, 58, ${.44*i})`,f=e.kind==="jungle"?`rgba(24, 48, 28, ${.72*i})`:`rgba(38, 52, 30, ${.68*i})`,h=`rgba(218, 224, 184, ${.28*i})`,m=[[-l*.92,.9*s,l*.86],[l*.92,1*s,l*.84],[0,-l*.45,l*1.04]];for(let[g,p,b]of m)t.beginPath(),t.arc(g,p,b,Math.PI*.95,Math.PI*2.05),t.fillStyle=c,t.fill(),t.strokeStyle=f,t.lineWidth=Math.max(.9,1.02*s),t.stroke(),t.beginPath(),t.arc(g+b*.15,p-b*.08,b*.62,-Math.PI*.42,.12),t.strokeStyle=h,t.lineWidth=Math.max(.7,.8*s),t.stroke();t.beginPath(),t.moveTo(-l*1.55,l*.48),t.lineTo(l*1.55,l*.48),t.strokeStyle=`rgba(48, 36, 24, ${.46*i})`,t.lineWidth=Math.max(.75,.85*s),t.stroke()}else if(e.kind==="taiga"){let l=11*s,c=4.6*s,f=[[-3.8*s,1.2*s,.86],[3.1*s,.4*s,1.02]];for(let[h,m,g]of f)t.beginPath(),t.moveTo(h,m-l*g),t.lineTo(h+c*g,m+2.4*s),t.lineTo(h-c*g,m+2.4*s),t.closePath(),t.fillStyle=`rgba(48, 76, 62, ${.48*i})`,t.fill(),t.strokeStyle=`rgba(28, 44, 36, ${.7*i})`,t.lineWidth=Math.max(.85,.95*s),t.stroke()}else if(e.kind==="dune"){let l=13*s,c=4.4*s;t.beginPath(),t.moveTo(-l,c*.3),t.bezierCurveTo(-l*.35,-c,l*.25,-c*.85,l,c*.35),t.moveTo(-l*.65,c*.85),t.quadraticCurveTo(0,c*.1,l*.72,c*.95),t.strokeStyle=`rgba(116, 82, 40, ${.56*i})`,t.lineWidth=Math.max(.9,1*s),t.stroke()}else if(e.kind==="wave"){let l=14*s,c=2.2*s;t.beginPath(),t.moveTo(-l,-.8),t.quadraticCurveTo(-l*.67,-c-.8,-l*.33,-.8),t.quadraticCurveTo(0,c-.8,l*.33,-.8),t.quadraticCurveTo(l*.67,-c-.8,l,-.8),t.strokeStyle=`rgba(220, 236, 238, ${.28*i})`,t.lineWidth=Math.max(.85,.95*s),t.stroke(),t.beginPath(),t.moveTo(-l,.4),t.quadraticCurveTo(-l*.67,-c+.4,-l*.33,.4),t.quadraticCurveTo(0,c+.4,l*.33,.4),t.quadraticCurveTo(l*.67,-c+.4,l,.4),t.strokeStyle=`rgba(16, 40, 56, ${.46*i})`,t.lineWidth=Math.max(.9,1*s),t.stroke()}t.restore()}}function bi(t,e,r,o,a){if(a<.04)return;t.save(),t.translate(e,r);let n=`rgba(38, 27, 17, ${.9*a})`,s=`rgba(236, 216, 168, ${.94*a})`,u=`rgba(244, 232, 202, ${.46*a})`;t.beginPath(),t.arc(0,0,o*1.18,0,Math.PI*2),t.fillStyle=u,t.fill(),t.strokeStyle=`rgba(74, 54, 34, ${.32*a})`,t.lineWidth=1,t.stroke(),t.beginPath(),t.arc(0,0,o*.74,0,Math.PI*2),t.strokeStyle=n,t.lineWidth=1.25,t.stroke(),t.beginPath(),t.arc(0,0,o*.64,0,Math.PI*2),t.strokeStyle=`rgba(56, 40, 26, ${.55*a})`,t.lineWidth=.8,t.stroke();let i=o*.62,l=o*.13;for(let g=0;g<4;g++)t.save(),t.rotate(Math.PI*.25+g*Math.PI*.5),t.beginPath(),t.moveTo(0,-i),t.lineTo(l,0),t.lineTo(0,0),t.closePath(),t.fillStyle=s,t.fill(),t.beginPath(),t.moveTo(0,-i),t.lineTo(-l,0),t.lineTo(0,0),t.closePath(),t.fillStyle=n,t.fill(),t.restore();let c=o*.94,f=o*.18;for(let g=0;g<4;g++)t.save(),t.rotate(g*Math.PI*.5),t.beginPath(),t.moveTo(0,-c),t.lineTo(f,0),t.lineTo(0,0),t.closePath(),t.fillStyle=g===0?`rgba(218, 178, 92, ${.95*a})`:s,t.fill(),t.strokeStyle=n,t.lineWidth=.8,t.stroke(),t.beginPath(),t.moveTo(0,-c),t.lineTo(-f,0),t.lineTo(0,0),t.closePath(),t.fillStyle=n,t.fill(),t.restore();t.beginPath(),t.arc(0,0,o*.11,0,Math.PI*2),t.fillStyle=s,t.fill(),t.strokeStyle=n,t.lineWidth=1,t.stroke(),t.font=`700 ${Math.round(o*.34)}px Georgia, "Palatino Linotype", serif`,t.textAlign="center",t.textBaseline="middle";let h=o*1.18,m=[["N",0,-h],["O",h,0],["S",0,h],["W",-h,0]];for(let[g,p,b]of m)t.lineWidth=2.8,t.strokeStyle=`rgba(244, 232, 204, ${.85*a})`,t.strokeText(g,p,b),t.fillStyle=n,t.fillText(g,p,b);t.restore()}function vi(t,e,r,o,a,n){let s=e.tier===3?e.isWater?18:16:e.tier===2?e.isWater?15:13.5:11.5,u=e.isWater?e.name:e.name.toUpperCase(),i=e.tier===3?e.isWater?3.8:3.4:e.tier===2?2.6:1.8;t.font=e.isWater?`italic 600 ${s}px Georgia, "Palatino Linotype", "Book Antiqua", serif`:`700 ${s}px Georgia, "Palatino Linotype", "Book Antiqua", serif`;let l=Array.from(u),c=l.map(D=>t.measureText(D).width),f=0;for(let D=0;D<c.length;D++)f+=c[D]+(D<c.length-1?i:0);let h=Math.abs(Math.cos(e.angleRad)),m=Math.abs(Math.sin(e.angleRad)),g=f*.5,p=s*.65+Math.abs(e.arcBend)*f*.16,b=g*h+p*m,S=g*m+p*h,P={x0:r-b,y0:o-S,x1:r+b,y1:o+S};for(let D=0;D<n.length;D++)if(pi(P,n[D],10))return null;let x=a*(e.fogState===1?.66:.94);if(x<.04)return null;t.save(),t.translate(r,o),t.rotate(e.angleRad),t.textAlign="center",t.textBaseline="middle",t.lineJoin="round";let w=e.isWater?`rgba(232, 241, 240, ${x})`:`rgba(42, 28, 17, ${x})`,H=e.isWater?`rgba(14, 34, 46, ${.74*x})`:`rgba(243, 232, 205, ${.84*x})`,W=e.isWater?3.2:3.6,y=e.arcBend*Math.min(f*.24,24),E=-f*.5;for(let D=0;D<l.length;D++){let C=c[D],L=E+C*.5,O=f>1?L/(f*.5):0,B=y*(O*O-.35),N=f>1?2*y*O/Math.max(12,f*.5):0,R=Math.atan(N);t.save(),t.translate(L,B),t.rotate(R),t.lineWidth=W,t.strokeStyle=H,t.strokeText(l[D],0,0),t.fillStyle=w,t.fillText(l[D],0,0),t.restore(),E+=C+i}return t.restore(),P}var Tn=new WeakSet;function No(t){let{canvas:e,cam:r,scene:o,lookupFog:a,strategicBlend:n,timeSec:s,strategicCartography:u}=t,i=Math.max(1,Math.round(r.viewportWidth*r.dpr)),l=Math.max(1,Math.round(r.viewportHeight*r.dpr)),c=!!(o&&(o.buildings&&o.buildings.length>0||o.sites&&o.sites.length>0||o.units&&o.units.length>0||o.buildPreview)),f=!!(u&&n>.04);if(!c&&!f){(Tn.has(e)||e.width!==i||e.height!==l)&&(e.width=i,e.height=l,Tn.delete(e));return}(e.width!==i||e.height!==l)&&(e.width=i,e.height=l);let h=e.getContext("2d");if(!h)return;h.setTransform(r.dpr,0,0,r.dpr,0,0),h.clearRect(0,0,r.viewportWidth,r.viewportHeight),Tn.add(e);let m=n>=.5,g=[];if(f&&u){let p=Math.min(1,Math.max(0,(n-.04)/.65));if(p>.02)for(let S=0;S<u.stamps.length;S++){let P=u.stamps[S],x=st(P.x,P.y,r);x.x<-36||x.x>r.viewportWidth+36||x.y<-36||x.y>r.viewportHeight+36||gi(h,P,x.x,x.y,r.zoom,p)}}if(o?.buildings)for(let p of o.buildings){let b=a(p.q,p.r);if(b===0)continue;let S=p.kind==="capital"||p.kind==="settlement",P=S||p.kind==="fortress"||p.kind==="harbor";if(m&&!P)continue;let x=ke(p.q,p.r),w=st(x.x,x.y,r);if(w.x<-120||w.x>r.viewportWidth+120||w.y<-80||w.y>r.viewportHeight+80)continue;let H=typeof p.yieldPercent=="number"&&!m?` \xB7 ${p.yieldPercent}%`:"",W=S?`\u2605 ${p.label} (R${p.level})`:`${p.label} L${p.level}${H}`,y=m?-18:Math.max(30,(S?56:50)*r.zoom),E=Ur(h,w.x,w.y+y,W,p.factionColor,S?m?12:12.5:10.5,b===1?.65:.88,m&&!!u);if(g.push(E),typeof p.constructionProgress=="number"&&p.constructionProgress>0&&p.constructionProgress<1&&!m){let L=w.x-27,O=w.y+y+13;h.fillStyle="rgba(10, 15, 22, 0.85)",h.fillRect(L,O,54,5),h.fillStyle="#f59e0b",h.fillRect(L+1,O+1,52*p.constructionProgress,3)}}if(f&&u){let p=Math.min(1,Math.max(0,(n-.12)/.62));if(p>.03){let S=r.viewportWidth-58,P=58;if(r.viewportWidth>=320&&r.viewportHeight>=240&&g.push({x0:S-29*1.5,y0:P-29*1.5,x1:S+29*1.5,y1:P+29*1.5}),o?.units)for(let H of o.units){if(a(H.q,H.r)<2)continue;let W=ke(H.q,H.r),y=st(W.x,W.y,r);g.push({x0:y.x-76,y0:y.y-44,x1:y.x+76,y1:y.y-6})}let x=0,w=16;for(let H=0;H<u.regions.length&&x<w;H++){let W=u.regions[H],y=st(W.x,W.y,r);if(y.x<68||y.x>r.viewportWidth-68||y.y<42||y.y>r.viewportHeight-92)continue;let E=vi(h,W,y.x,y.y,p,g);E&&(g.push(E),x++)}r.viewportWidth>=320&&r.viewportHeight>=240&&bi(h,S,P,29,p*.92)}}if(o?.sites&&!m&&r.zoom>=.45)for(let p of o.sites){if(a(p.q,p.r)===0)continue;let b=ke(p.q,p.r),S=st(b.x,b.y,r);if(S.x<-80||S.x>r.viewportWidth+80||S.y<-50||S.y>r.viewportHeight+50)continue;let P=Math.max(30,(p.family==="fauna"?64:54)*r.zoom);Ur(h,S.x,S.y+P,p.label,p.family==="fauna"?[.55,.84,.48]:[.85,.68,.35],10,.78)}if(o?.units)for(let p of o.units){if(a(p.q,p.r)<2)continue;let b=ke(p.q,p.r);if(p.marchPath&&p.marchPath.length>=2){let w=ke(p.marchPath[0].q,p.marchPath[0].r),H=ke(p.marchPath[1].q,p.marchPath[1].r),W=s*.14%1;b={x:w.x+(H.x-w.x)*W,y:w.y+(H.y-w.y)*W}}let S=st(b.x,b.y,r);if(S.x<-100||S.x>r.viewportWidth+100||S.y<-60||S.y>r.viewportHeight+60)continue;let P=p.kind==="siege_army"?"\u2694":p.kind==="army"?"\u{1F6E1}":p.kind==="scout"?"\u{1F441}":p.kind==="boat"?"\u26F5":"\u2696",x=typeof p.strength=="number"?` ${p.strength}${p.rams?` + ${p.rams}R`:""}`:"";Ur(h,S.x,S.y-Math.max(20,34*r.zoom),`${P} ${p.label}${x}`,p.factionColor,m?10.5:11,.92)}if(o?.buildPreview){let p=o.buildPreview,b=ke(p.center.q,p.center.r),S=st(b.x,b.y,r),P=p.yieldPercent-100,x=p.valid?`${p.buildingKind} \xB7 Ertrag ${p.yieldPercent}% (+${P}% R2)`:`Nicht baubar: ${p.reason??"ung\xFCltig"}`;Ur(h,S.x,S.y-34,x,p.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var Gr=65536,Or=12,yi={trail:{tierIndex:0,width:19,shoulder:32,outer:44,rough:.16,opacity:.78},packed:{tierIndex:1,width:28,shoulder:38,outer:48,rough:.075,opacity:.87},stone:{tierIndex:2,width:34,shoulder:43,outer:52,rough:.028,opacity:.96}},xi=["trail","packed","stone"],wi=`#version 300 es
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
`,Si=`#version 300 es
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
`,_i=`#version 300 es
precision highp float;

out vec2 v_uv;

void main() {
  vec2 pos = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(pos, 0.0, 1.0);
  v_uv = pos * 0.5 + 0.5;
}
`,Ci=`#version 300 es
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
`;function An(t,e,r=0){let o=Math.imul(t+37,374761393)^Math.imul(e+91,668265263)^Math.imul(r+7,2246822519);return o^=o>>>13,o=Math.imul(o,1274126177),(o^o>>>16)>>>0}function Vr(t,e){return{x:256*(t+e*.5),y:Ye*e}}function Ri(t,e,r,o,a=14){let n=t>r||t===r&&e>o,s=n?r:t,u=n?o:e,i=n?t:r,l=n?e:o,c=Vr(s,u),f=Vr(i,l),h=f.x-c.x,m=f.y-c.y,g=Math.hypot(h,m)||1,p=-m/g,b=h/g,P=(An(s+i,u+l,An(s-i,u-l,11))%2001/1e3-1)*4.2,x=[];for(let w=0;w<=a;w++){let H=w/a,W=P*Math.sin(H*2*Math.PI);x.push({x:c.x+h*H+p*W,y:c.y+m*H+b*W})}return x}var Nr=class{constructor(e){this.verts=new Float32Array(Gr*Or);this.vertCount=0;this.maskFbo=null;this.maskTex=null;this.maskW=0;this.maskH=0;this.gl=e,this.maskProg=this.compileProgram(wi,Si,"RoadMask"),this.compProg=this.compileProgram(_i,Ci,"RoadComp");let r=e.createVertexArray(),o=e.createBuffer(),a=e.createVertexArray();if(!r||!o||!a)throw new Error("Failed to allocate RoadPass VAO/VBO");this.vao=r,this.vbo=o,this.compVao=a,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let n=Or*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.bindVertexArray(null);let s=(u,i)=>{let l=e.getUniformLocation(u,i);if(!l)throw new Error(`Missing road uniform: ${i}`);return l};this.uMaskCamCenter=s(this.maskProg,"u_camCenter"),this.uMaskViewportSize=s(this.maskProg,"u_viewportSize"),this.uMaskZoom=s(this.maskProg,"u_zoom"),this.uMaskTier=s(this.maskProg,"u_tier"),this.uCompCamCenter=s(this.compProg,"u_camCenter"),this.uCompViewportSize=s(this.compProg,"u_viewportSize"),this.uCompZoom=s(this.compProg,"u_zoom"),this.uCompTier=s(this.compProg,"u_tier"),this.uCompOpacity=s(this.compProg,"u_opacity"),this.uCompFade=s(this.compProg,"u_fade"),e.useProgram(this.compProg),e.uniform1i(e.getUniformLocation(this.compProg,"u_roadMaskTex"),0)}compileProgram(e,r,o){let{gl:a}=this,n=a.createShader(a.VERTEX_SHADER),s=a.createShader(a.FRAGMENT_SHADER);if(!n||!s)throw new Error(`Failed to allocate ${o} shaders`);if(a.shaderSource(n,e),a.compileShader(n),!a.getShaderParameter(n,a.COMPILE_STATUS))throw new Error(`${o} VS error: ${a.getShaderInfoLog(n)}`);if(a.shaderSource(s,r),a.compileShader(s),!a.getShaderParameter(s,a.COMPILE_STATUS))throw new Error(`${o} FS error: ${a.getShaderInfoLog(s)}`);let u=a.createProgram();if(!u)throw new Error(`Failed to allocate ${o} program`);if(a.attachShader(u,n),a.attachShader(u,s),a.linkProgram(u),a.deleteShader(n),a.deleteShader(s),!a.getProgramParameter(u,a.LINK_STATUS))throw new Error(`${o} link error: ${a.getProgramInfoLog(u)}`);return u}ensureMaskFbo(e,r){let o=Math.max(1,e),a=Math.max(1,r);if(this.maskFbo&&this.maskW===o&&this.maskH===a)return;let{gl:n}=this;this.maskTex&&n.deleteTexture(this.maskTex),this.maskFbo&&n.deleteFramebuffer(this.maskFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate RoadPass mask FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA8,o,a,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.maskTex=s,this.maskFbo=u,this.maskW=o,this.maskH=a}pushVert(e,r,o,a,n,s,u,i,l,c,f){if(this.vertCount>=Gr)return;let h=this.vertCount*Or,m=this.verts;m[h++]=e,m[h++]=r,m[h++]=o,m[h++]=a,m[h++]=n,m[h++]=s,m[h++]=u,m[h++]=i,m[h++]=l,m[h++]=c,m[h++]=f,m[h++]=0,this.vertCount++}emitTierGeometry(e,r,o,a){this.vertCount=0;let n=r.width*.5,s=r.shoulder*.5,u=r.outer*.5,i=r.rough,l=(h,m)=>{let g=a?a(h,m):0;return{x:h,y:(m-g)*Pe}},c=new Map;for(let h=0;h<e.length;h++){let m=e[h],g=o(m.q1,m.r1),p=o(m.q2,m.r2);if(g===0&&p===0)continue;let b=g===2||p===2?1:.66,S=Ri(m.q1,m.r1,m.q2,m.r2,14),P=S.length,x=An(m.q1+m.q2,m.r1+m.r2,r.tierIndex+3)%628/100,w=Be(m.q1,m.r1),H=Vr(m.q1,m.r1),W=c.get(w);(!W||b>W.fogDim)&&c.set(w,{ux:H.x,uy:H.y,fogDim:b});let y=Be(m.q2,m.r2),E=Vr(m.q2,m.r2),D=c.get(y);(!D||b>D.fogDim)&&c.set(y,{ux:E.x,uy:E.y,fogDim:b});let C=new Float32Array(P),L=new Float32Array(P),O=new Float32Array(P),B=new Float32Array(P),N=new Float32Array(P);for(let R=0;R<P;R++){R>0&&(O[R]=O[R-1]+Math.hypot(S[R].x-S[R-1].x,S[R].y-S[R-1].y));let q=S[Math.max(0,R-1)],$=S[Math.min(P-1,R+1)],X=$.x-q.x,_=$.y-q.y,F=Math.hypot(X,_)||1;C[R]=-_/F,L[R]=X/F;let A=R/(P-1),I=Math.sin(Math.PI*A);B[R]=n*(1+i*I*(.69*Math.sin(A*12+x)+.36*Math.cos(A*17+x))),N[R]=n*(1+i*I*(.63*Math.cos(A*11+x)-.32*Math.sin(A*18+x)))}for(let R=0;R<P-1&&!(this.vertCount+6>Gr);R++){let q=R/(P-1),$=(R+1)/(P-1),X=S[R],_=S[R+1],F=l(X.x-C[R]*u,X.y-L[R]*u),A=l(X.x+C[R]*u,X.y+L[R]*u),I=l(_.x-C[R+1]*u,_.y-L[R+1]*u),k=l(_.x+C[R+1]*u,_.y+L[R+1]*u);this.pushVert(F.x,F.y,-u,0,B[R],s,u,q,b,-u,O[R]),this.pushVert(A.x,A.y,u,0,N[R],s,u,q,b,u,O[R]),this.pushVert(k.x,k.y,u,0,N[R+1],s,u,$,b,u,O[R+1]),this.pushVert(F.x,F.y,-u,0,B[R],s,u,q,b,-u,O[R]),this.pushVert(k.x,k.y,u,0,N[R+1],s,u,$,b,u,O[R+1]),this.pushVert(I.x,I.y,-u,0,B[R+1],s,u,$,b,-u,O[R+1])}}let f=14;for(let h of c.values()){let m=l(h.ux,h.uy);for(let g=0;g<f&&!(this.vertCount+3>Gr);g++){let p=g/f*Math.PI*2,b=(g+1)/f*Math.PI*2,S=Math.cos(p)*u,P=Math.sin(p)*u,x=Math.cos(b)*u,w=Math.sin(b)*u,H=l(h.ux+S,h.uy+P),W=l(h.ux+x,h.uy+w);this.pushVert(m.x,m.y,0,0,n*1.03,s*1.02,u,-1,h.fogDim,0,0),this.pushVert(H.x,H.y,S,P,n*1.03,s*1.02,u,-1,h.fogDim,0,0),this.pushVert(W.x,W.y,x,w,n*1.03,s*1.02,u,-1,h.fogDim,0,0)}}}render(e){let{cam:r,roads:o,lookupFog:a,strategicBlend:n,sampleReliefHeight:s}=e;if(!o||o.length===0||n>=.85)return 0;let u=1-n*.82,{gl:i}=this,l=i.canvas.width,c=i.canvas.height;if(l<=0||c<=0)return 0;let f={trail:[],packed:[],stone:[]};for(let m=0;m<o.length;m++){let g=o[m];(f[g.tier]??f.trail).push(g)}this.ensureMaskFbo(l,c);let h=0;for(let m of xi){let g=f[m];if(g.length===0)continue;let p=yi[m];this.emitTierGeometry(g,p,a,s),this.vertCount!==0&&(i.bindFramebuffer(i.FRAMEBUFFER,this.maskFbo),i.viewport(0,0,this.maskW,this.maskH),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.enable(i.BLEND),i.blendEquation(i.MAX),i.blendFunc(i.ONE,i.ONE),i.useProgram(this.maskProg),i.bindVertexArray(this.vao),i.bindBuffer(i.ARRAY_BUFFER,this.vbo),i.bufferSubData(i.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Or)),i.uniform2f(this.uMaskCamCenter,r.x,r.y),i.uniform2f(this.uMaskViewportSize,r.viewportWidth,r.viewportHeight),i.uniform1f(this.uMaskZoom,r.zoom),i.uniform1f(this.uMaskTier,p.tierIndex),i.drawArrays(i.TRIANGLES,0,this.vertCount),h++,i.bindFramebuffer(i.FRAMEBUFFER,null),i.viewport(0,0,l,c),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),i.useProgram(this.compProg),i.bindVertexArray(this.compVao),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.maskTex),i.uniform2f(this.uCompCamCenter,r.x,r.y),i.uniform2f(this.uCompViewportSize,r.viewportWidth,r.viewportHeight),i.uniform1f(this.uCompZoom,r.zoom),i.uniform1f(this.uCompTier,p.tierIndex),i.uniform1f(this.uCompOpacity,p.opacity),i.uniform1f(this.uCompFade,u),i.drawArrays(i.TRIANGLES,0,3),h++)}return i.bindVertexArray(null),h}dispose(){let{gl:e}=this;this.maskTex&&e.deleteTexture(this.maskTex),this.maskFbo&&e.deleteFramebuffer(this.maskFbo),e.deleteBuffer(this.vbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compVao),e.deleteProgram(this.maskProg),e.deleteProgram(this.compProg)}};var Xo={watchtower_ruin:{worldW:150,anchor:[.5,.79],sortBiasY:6},forgotten_iron_mine:{worldW:178,anchor:[.5,.74],sortBiasY:6},abandoned_house:{worldW:168,anchor:[.5,.75],sortBiasY:6},dilapidated_barn:{worldW:172,anchor:[.5,.74],sortBiasY:6},waterhole:{worldW:178,anchor:[.5,.56],sortBiasY:-18},oasis:{worldW:194,anchor:[.5,.67],sortBiasY:4},obelisk:{worldW:102,anchor:[.5,.85],sortBiasY:8},stone_circle:{worldW:180,anchor:[.5,.66],sortBiasY:4},iron_deposit:{worldW:162,anchor:[.5,.75],sortBiasY:6}};function zo(t){return t==="fauna"?null:t==="forgotten_mine"?"forgotten_iron_mine":t in Xo?t:null}function Mi(t,e,r){let o=t*374761393+e*668265263|0;for(let a=0;a<r.length;a++)o=Math.imul(o^r.charCodeAt(a),1274126177)+2654435769|0;return o^=o>>>15,o=Math.imul(o,2246822519),o^=o>>>13,o>>>0}function Ei(t,e){let r=t.infrastructure.sprites,o=[];for(let a=1;a<=5;a++){let n=`sites/${e}/${e}_${String(a).padStart(2,"0")}`;r[n]&&o.push(n)}return o}function Ti(t,e){let r=zo(e.family);if(!r)return null;let o=Ei(t,r);if(o.length===0)return null;let a=e.variantIndex!==void 0?(Math.floor(e.variantIndex)%o.length+o.length)%o.length:Mi(e.q,e.r,r)%o.length;return o[a]}function Yo(t){let{manifest:e,sites:r,lookupFog:o,sampleReliefHeight:a}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredSiteIds:s};let u=e.infrastructure.sprites;for(let i of r){let l=o(i.q,i.r);if(l===0)continue;let c=zo(i.family);if(!c)continue;let f=Ti(e,i);if(!f)continue;let h=u[f];if(!h)continue;s.add(i.id);let m=Xo[c],g=ke(i.q,i.r),p=g.x,b=g.y/Pe,S=a?a(p,b)*Pe:0,P=g.y-S,[x,w]=h.sourceSize,H=x>0?w/x:1,W=m.worldW;c==="obelisk"&&(H<1.3?W=152:H<2.1?W=112:W=92);let y=W*H,[E,D]=m.anchor,C=e.shadows.sprites[`site_shadow:${f}`],L=C?{shadowPage:C.page,shadowU0:C.uv[0],shadowV0:C.uv[1],shadowU1:C.uv[2],shadowV1:C.uv[3],shadowRelLeft:C.boundsInSpriteWidth[0]*W,shadowRelTop:C.boundsInSpriteWidth[1]*W,shadowWidth:(C.boundsInSpriteWidth[2]-C.boundsInSpriteWidth[0])*W,shadowHeight:(C.boundsInSpriteWidth[3]-C.boundsInSpriteWidth[1])*W}:{};n.push({x:p,y:P,relLeft:-W*E,relTop:-y*D,width:W,height:y,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:g.y+m.sortBiasY,fogState:l,...L})}return n.sort((i,l)=>i.sortY-l.sortY||i.x-l.x),{sprites:n,coveredSiteIds:s}}var Ko=`#version 300 es
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
`,Ai=`#version 300 es
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
`,Pi=`#version 300 es
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
`,$o=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,ki=`#version 300 es
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
`,Wi=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function ir(t,e,r,o){let a=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!a||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(a,e),t.compileShader(a),!t.getShaderParameter(a,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(a)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let s=t.createProgram();if(!s)throw new Error(`Failed to create ${o} program`);if(t.attachShader(s,a),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(a),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(s)}`);return s}var Fi=`#version 300 es
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
`,Li=`#version 300 es
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
`,Xr=class{constructor(e){this.instanceData=new Float32Array(16384*16);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=ir(e,Ko,Ai,"sprite"),this.shadowMaskProg=ir(e,Ko,Pi,"shadow-mask"),this.compositeProg=ir(e,$o,ki,"shadow-composite"),this.shoreCompositeProg=ir(e,$o,Wi,"shore-composite"),this.surfProg=ir(e,Fi,Li,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),a=e.createBuffer();if(!r||!o||!a)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=a,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=64;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let s=(u,i)=>{let l=e.getUniformLocation(u,i);if(!l)throw new Error(`Missing uniform ${i}`);return l};this.spCam=s(this.spriteProg,"u_camCenter"),this.spView=s(this.spriteProg,"u_viewportSize"),this.spZoom=s(this.spriteProg,"u_zoom"),this.spScaleY=s(this.spriteProg,"u_scaleY"),this.spShearX=s(this.spriteProg,"u_shearX"),this.spTime=s(this.spriteProg,"u_time"),this.spWindEnabled=s(this.spriteProg,"u_windEnabled"),this.spCanvasSize=s(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=s(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=s(this.spriteProg,"u_selfShadow"),this.spNaturePolish=s(this.spriteProg,"u_naturePolish"),this.spSpriteSat=s(this.spriteProg,"u_spriteSat"),this.spSpriteBright=s(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=s(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=s(this.spriteProg,"u_colorGradeAll"),this.spDecalPass=s(this.spriteProg,"u_decalPass"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=s(this.shadowMaskProg,"u_camCenter"),this.shView=s(this.shadowMaskProg,"u_viewportSize"),this.shZoom=s(this.shadowMaskProg,"u_zoom"),this.shScaleY=s(this.shadowMaskProg,"u_scaleY"),this.shShearX=s(this.shadowMaskProg,"u_shearX"),this.shTime=s(this.shadowMaskProg,"u_time"),this.shWindEnabled=s(this.shadowMaskProg,"u_windEnabled"),this.shDecalPass=s(this.shadowMaskProg,"u_decalPass"),this.sfCam=s(this.surfProg,"u_camCenter"),this.sfView=s(this.surfProg,"u_viewportSize"),this.sfZoom=s(this.surfProg,"u_zoom"),this.sfTime=s(this.surfProg,"u_time"),this.sfWindEnabled=s(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=s(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),a=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===a)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,a,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=s,this.shadowFbo=u,this.shadowW=o,this.shadowH=a}ensureShoreFbo(e,r){let o=Math.max(2,e),a=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===a)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let s=n.createTexture(),u=n.createFramebuffer();if(!s||!u)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,a,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=s,this.shoreFbo=u,this.shoreW=o,this.shoreH=a}renderShadows(e){let{cam:r,sprites:o,fogStates:a,walls:n=[],shadowPages:s,shadowOpacity:u,detailOpacity:i}=e;if(this.lastHasCrossShadows=!1,u<=.005||i<=.01||s.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:l,instanceData:c}=this;this.ensureShadowFbo(l.canvas.width,l.canvas.height);let f=0,h=0,m=new Array(s.length).fill(0);for(let x=0;x<o.length;x++){let w=o[x];w.shadowPage<0||w.shadowPage>=s.length||a[x]!==0&&m[w.shadowPage]++}for(let x=0;x<n.length;x++){let w=n[x],H=w.shadowPage??-1;H<0||H>=s.length||w.fogState===0||m[H]++}let g=new Array(s.length).fill(0),p=0;for(let x=0;x<s.length;x++)g[x]=p,p+=m[x];if(p===0)return{drawCalls:0,renderedShadows:0};let b=[...g],S=Math.min(p,16384);for(let x=0;x<o.length;x++){let w=o[x],H=w.shadowPage;if(H<0||H>=s.length)continue;let W=a[x];if(W===0)continue;let y=b[H];if(y>=S)continue;b[H]=y+1,f++;let E=w.shadowTier??(w.isMountain?3:0);E>0&&h++;let D=y*16,C=(w.shadowMaxX-w.shadowMinX)*w.width,L=(w.shadowMaxY-w.shadowMinY)*w.width;c[D]=w.x,c[D+1]=w.y,c[D+2]=w.shadowMinX*w.width,c[D+3]=w.shadowMinY*w.width,c[D+4]=C,c[D+5]=L,c[D+6]=W===1?i*.65:i,c[D+7]=E,c[D+8]=w.shadowU0,c[D+9]=w.shadowV0,c[D+10]=w.shadowU1,c[D+11]=w.shadowV1,c[D+12]=.5,c[D+13]=0,c[D+14]=0,c[D+15]=0}for(let x=0;x<n.length;x++){let w=n[x],H=w.shadowPage??-1;if(H<0||H>=s.length||w.fogState===0)continue;let W=b[H];if(W>=S)continue;b[H]=W+1,f++,h++;let y=W*16;c[y]=w.x,c[y+1]=w.y,c[y+2]=w.shadowRelLeft??0,c[y+3]=w.shadowRelTop??0,c[y+4]=w.shadowWidth??0,c[y+5]=w.shadowHeight??0,c[y+6]=w.fogState===1?i*.65:i,c[y+7]=2,c[y+8]=w.shadowU0??0,c[y+9]=w.shadowV0??0,c[y+10]=w.shadowU1??0,c[y+11]=w.shadowV1??0,c[y+12]=.5,c[y+13]=0,c[y+14]=0,c[y+15]=0}this.lastHasCrossShadows=h>0,l.bindBuffer(l.ARRAY_BUFFER,this.instanceVbo),l.bufferSubData(l.ARRAY_BUFFER,0,c.subarray(0,S*16)),l.bindFramebuffer(l.FRAMEBUFFER,this.shadowFbo),l.viewport(0,0,this.shadowW,this.shadowH),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.enable(l.BLEND),l.blendEquation(l.MAX),l.blendFunc(l.ONE,l.ONE),l.useProgram(this.shadowMaskProg),l.bindVertexArray(this.vao),l.uniform2f(this.shCam,r.x,r.y),l.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),l.uniform1f(this.shZoom,r.zoom),l.uniform1f(this.shScaleY,1),l.uniform1f(this.shShearX,0),l.uniform1f(this.shTime,0),l.uniform1f(this.shWindEnabled,0),l.uniform1f(this.shDecalPass,0);let P=0;l.activeTexture(l.TEXTURE0);for(let x=0;x<s.length;x++){let w=g[x],H=Math.min(b[x],S),W=H-w;W<=0||(l.bindTexture(l.TEXTURE_2D,s[x]),w===0||l.bufferSubData(l.ARRAY_BUFFER,0,c.subarray(w*16,H*16)),l.drawArraysInstanced(l.TRIANGLES,0,6,W),P++)}return l.bindFramebuffer(l.FRAMEBUFFER,null),l.viewport(0,0,l.canvas.width,l.canvas.height),l.blendEquation(l.FUNC_ADD),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),l.useProgram(this.compositeProg),l.bindVertexArray(this.compositeVao),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.shadowTex),l.uniform1f(this.compOpacity,u),l.drawArrays(l.TRIANGLES,0,3),P++,{drawCalls:P,renderedShadows:f}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:a,naturePages:n,walls:s=[],infraPages:u=[],detailOpacity:i,objectScaleY:l,objectShearX:c,shadowOpacity:f=.54,mountainShadowOnSprites:h=!0,spriteSelfShadow:m=.68,naturePolish:g=.4,spriteSaturation:p=1,spriteBrightness:b=1,spriteContrast:S=1,timeSec:P=0,windAnimation:x=!0,isDecalPass:w=!1}=e,H=o.length>0&&n.length>0,W=s.length>0&&u.length>0;if(i<=.01||!H&&!W)return{drawCalls:0,renderedSprites:0};let{gl:y,instanceData:E}=this;y.enable(y.BLEND),y.blendEquation(y.FUNC_ADD),y.blendFunc(y.ONE,y.ONE_MINUS_SRC_ALPHA),y.useProgram(this.spriteProg),y.bindVertexArray(this.vao),y.bindBuffer(y.ARRAY_BUFFER,this.instanceVbo),y.uniform2f(this.spCam,r.x,r.y),y.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),y.uniform1f(this.spZoom,r.zoom),y.uniform1f(this.spScaleY,l),y.uniform1f(this.spShearX,c),y.uniform1f(this.spTime,P),y.uniform1f(this.spWindEnabled,x?1:0),y.uniform2f(this.spCanvasSize,y.canvas.width,y.canvas.height);let D=h&&this.lastHasCrossShadows&&this.shadowTex!==null?f:0;y.uniform1f(this.spMtnShadowOpacity,D),y.uniform1f(this.spSelfShadow,m),y.uniform1f(this.spNaturePolish,g),y.uniform1f(this.spSpriteSat,p),y.uniform1f(this.spSpriteBright,b),y.uniform1f(this.spSpriteContrast,S),y.uniform1f(this.spColorGradeAll,1),y.uniform1f(this.spDecalPass,w?1:0);let C=n[0]??u[0];y.activeTexture(y.TEXTURE8),y.bindTexture(y.TEXTURE_2D,this.shadowTex??C);let L=0,O=0,B=0,N=[],R=new Map,q=()=>{if(B<=0)return;for(let k=0;k<N.length;k++)y.activeTexture(y.TEXTURE0+k),y.bindTexture(y.TEXTURE_2D,N[k]);let I=N[0]??C;for(let k=N.length;k<8;k++)y.activeTexture(y.TEXTURE0+k),y.bindTexture(y.TEXTURE_2D,I);y.bufferSubData(y.ARRAY_BUFFER,0,E.subarray(0,B*16)),y.drawArraysInstanced(y.TRIANGLES,0,6,B),L++,O+=B,B=0,N=[],R.clear()},$=I=>{let k=R.get(I);return k===void 0?((N.length>=8||B>=16384)&&q(),k=N.length,N.push(I),R.set(I,k)):B>=16384&&(q(),k=0,N.push(I),R.set(I,0)),k},X=0,_=0,F=H?o.length:0,A=W?s.length:0;for(;X<F||_<A;){let I=!1;if(X>=F)I=!0;else if(_<A){let k=o[X].sortY??o[X].y;s[_].sortY<k&&(I=!0)}if(I){let k=s[_++];if(k.fogState===0||k.page<0||k.page>=u.length)continue;let d=$(u[k.page]),v=(k.fogState===1?1:0)|4|16,M=B*16;E[M]=k.x,E[M+1]=k.y,E[M+2]=k.relLeft,E[M+3]=k.relTop,E[M+4]=k.width,E[M+5]=k.height,E[M+6]=i,E[M+7]=d*256+v,E[M+8]=k.u0,E[M+9]=k.v0,E[M+10]=k.u1,E[M+11]=k.v1,E[M+12]=.5,E[M+13]=0,E[M+14]=0,E[M+15]=0,B++}else{let k=X++,d=a[k];if(d===0)continue;let v=o[k];if(v.page<0||v.page>=n.length)continue;let M=$(n[v.page]),G=v.shadowTier??(v.isMountain?3:0),U=v.selfShadeWeight??(v.isGroundDecal?0:v.isMountain?.52:.72),Y=Math.max(0,Math.min(7,Math.round(U*7))),j=(d===1?1:0)|(G&3)<<3|(Y&7)<<5;v.isMountain||(j|=2,v.isSnowFamily&&(j|=4));let Z=!!v.flipX,le=Z?1-v.anchorX:v.anchorX,J=B*16;E[J]=v.x,E[J+1]=v.y,E[J+2]=-v.width*le,E[J+3]=-v.height*v.anchorY,E[J+4]=v.width,E[J+5]=v.height,E[J+6]=i,E[J+7]=M*256+j,E[J+8]=Z?v.u1:v.u0,E[J+9]=v.v0,E[J+10]=Z?v.u0:v.u1,E[J+11]=v.v1,E[J+12]=v.tintHash??.5,E[J+13]=w?v.rotationRad??0:v.swayAmp??0,E[J+14]=w?v.terrainTintRgb??0:0,E[J+15]=w?v.terrainTintMix??0:0,B++}}return q(),{drawCalls:L,renderedSprites:O}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:a,infraPages:n,projectY:s,opacityScale:u=1}=e;if(o.length===0||n.length===0||u<=.02)return{drawCalls:0,renderedShorelines:0};let{gl:i,instanceData:l}=this;this.ensureShoreFbo(i.canvas.width,i.canvas.height),i.bindFramebuffer(i.FRAMEBUFFER,this.shoreFbo),i.viewport(0,0,this.shoreW,this.shoreH),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.enable(i.BLEND),i.blendEquation(i.MAX),i.blendFunc(i.ONE,i.ONE),i.useProgram(this.spriteProg),i.bindVertexArray(this.vao),i.bindBuffer(i.ARRAY_BUFFER,this.instanceVbo),i.uniform2f(this.spCam,r.x,r.y),i.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),i.uniform1f(this.spZoom,r.zoom),i.uniform1f(this.spScaleY,1),i.uniform1f(this.spShearX,0),i.uniform1f(this.spTime,0),i.uniform1f(this.spWindEnabled,0),i.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),i.uniform1f(this.spMtnShadowOpacity,0),i.uniform1f(this.spSelfShadow,0),i.uniform1f(this.spNaturePolish,0),i.uniform1f(this.spSpriteSat,1),i.uniform1f(this.spSpriteBright,1),i.uniform1f(this.spSpriteContrast,1),i.uniform1f(this.spColorGradeAll,0),i.uniform1f(this.spDecalPass,0);let c=Math.min(n.length,8);for(let S=0;S<8;S++)i.activeTexture(i.TEXTURE0+S),i.bindTexture(i.TEXTURE_2D,n[S<c?S:0]);i.activeTexture(i.TEXTURE8),i.bindTexture(i.TEXTURE_2D,n[0]);let f=0,h=0,m=0,g=()=>{m<=0||(i.bufferSubData(i.ARRAY_BUFFER,0,l.subarray(0,m*16)),i.drawArraysInstanced(i.TRIANGLES,0,6,m),f++,h+=m,m=0)},p=512,b=512*s;for(let S=0;S<o.length;S++){let P=a[S];if(P===0)continue;let x=o[S];if(x.page<0||x.page>=c)continue;m>=16384&&g();let w=m*16;l[w]=x.x,l[w+1]=x.y,l[w+2]=-p*.5,l[w+3]=-b*.5,l[w+4]=p,l[w+5]=b,l[w+6]=(x.alpha??1)*u,l[w+7]=x.page*256+4+24+(P===1?1:0),l[w+8]=x.u0,l[w+9]=x.v0,l[w+10]=x.u1,l[w+11]=x.v1,l[w+12]=.5,l[w+13]=0,l[w+14]=0,l[w+15]=0,m++}return g(),i.bindFramebuffer(i.FRAMEBUFFER,null),i.viewport(0,0,i.canvas.width,i.canvas.height),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),h>0&&(i.useProgram(this.shoreCompositeProg),i.bindVertexArray(this.compositeVao),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.shoreTex),i.drawArrays(i.TRIANGLES,0,3),f++),{drawCalls:f,renderedShorelines:h}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:a,detailOpacity:n,timeSec:s,windAnimation:u}=e;if(n<=.02||o.length===0)return 0;let{gl:i,instanceData:l}=this,c=0;for(let f=0;f<o.length;f++){let h=o[f];if(!h.isWaterBoulder)continue;let m=a[f];if(m===0)continue;if(c>=16384)break;let g=h.width*.68,p=h.width*.25,b=c*16;l[b]=h.x,l[b+1]=h.y-h.height*.04,l[b+2]=-g,l[b+3]=-p,l[b+4]=g*2,l[b+5]=p*2,l[b+6]=n,l[b+7]=m===1?1:0,l[b+8]=0,l[b+9]=0,l[b+10]=0,l[b+11]=0,l[b+12]=h.tintHash??.5,l[b+13]=0,l[b+14]=0,l[b+15]=0,c++}return c===0?0:(i.enable(i.BLEND),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),i.useProgram(this.surfProg),i.bindVertexArray(this.vao),i.bindBuffer(i.ARRAY_BUFFER,this.instanceVbo),i.uniform2f(this.sfCam,r.x,r.y),i.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),i.uniform1f(this.sfZoom,r.zoom),i.uniform1f(this.sfTime,s),i.uniform1f(this.sfWindEnabled,u?1:0),i.bufferSubData(i.ARRAY_BUFFER,0,l.subarray(0,c*16)),i.drawArraysInstanced(i.TRIANGLES,0,6,c),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var Pn=new Set(["ocean","coastal_water","coastal_waters","coast","stormy_ocean","deep_water","lake"]),jo=new Set(["jungle","rainforest"]),Zo=new Set(["taiga","boreal_forest"]),Qo=new Set(["forest","deciduous_forest","woodland","dense_forest"]),Jo=new Set(["desert","sand_desert","sandy_desert","semi_desert","badlands","sandy_badlands","rocky_badlands"]),ea=new Set(["snowfields","frozen_tundra","tundra"]),ta=new Set(["swamp","marsh","marshland","moor","bog","wetland"]);function ra(t){let e=t.terrainId;return e==="icy_ocean"||Pn.has(e)?7:t.reliefClass==="mountain"||e==="mountain"||e==="alpine"||e==="high_mountains"?3:ea.has(e)?5:Jo.has(e)||e==="dry_plains"||e==="steppe"||e==="savanna"?4:ta.has(e)?6:jo.has(e)||Zo.has(e)||Qo.has(e)||t.forestClass==="dense_forest"||t.forestDensity>=.55?1:t.reliefClass==="hills"||e==="hills"||e==="highland"?2:0}function Ii(t){let e=t.terrainId;return e==="icy_ocean"?"icy_sea":Pn.has(e)?"sea":t.reliefClass==="mountain"||e==="mountain"||e==="alpine"||e==="high_mountains"?"mountains":ta.has(e)?"wetland":jo.has(e)?"jungle":Zo.has(e)?"taiga":ea.has(e)?"snow":Jo.has(e)?"desert":Qo.has(e)||t.forestClass==="dense_forest"||t.forestDensity>=.58?"forest":t.reliefClass==="hills"||e==="hills"||e==="highland"?"hills":"plains"}function lr(t,e,r){let o=Math.imul(t|0,374761393)+Math.imul(e|0,668265263)+Math.imul(r|0,2147483647)|0;return o=Math.imul(o^o>>>13,1274126177),(o^o>>>16)>>>0}function zr(t,e,r){return lr(t,e,r)/4294967295}var sr={sea:{prefixes:["Silber","Azur","Sturm","Kronen","Nebel","Bernstein","K\xF6nigs","West","Ost","S\xFCd","Wellen","Handels","Klippen","Morgen","Tiefen","Segel"],largeSuffixes:["meer","see","ozean","wasser"],smallSuffixes:["bucht","sund","golf","meerenge"],standalone:["Meer der St\xFCrme","Spiegelndes Meer","Altes Handelsmeer","Golf der Kronen","Stille See","Bucht der M\xF6wen"],largeThreshold:64,minHexes:16,priorityBoost:1.35},icy_sea:{prefixes:["Eis","Frost","Gletscher","Nord","Treibeis","Schnee","Wei\xDF","Winter","K\xE4lte","Raureif"],largeSuffixes:["meer","eismeer","see"],smallSuffixes:["sund","bucht","fjord","wasser"],standalone:["N\xF6rdliches Eismeer","Schweigende Eisseen","Frostige Durchfahrt","Bucht der Gletscher"],largeThreshold:45,minHexes:12,priorityBoost:1.25},mountains:{prefixes:["Grau","Eisen","Silber","Nebel","Drachen","Stein","Donner","Frost","Raben","Adler","Schatten","Sturm","Wolken","Felsen","Kalt","Hoch"],largeSuffixes:["gebirge","kamm","grat","massiv","r\xFCcken"],smallSuffixes:["gipfel","spitzen","fels","joch","zinnen"],standalone:["Graue Zinnen","R\xFCckgrat der Welt","Z\xE4hne des Nordens","Hohe Nebelspitzen","Eiserner Wall"],largeThreshold:22,minHexes:7,priorityBoost:1.4},forest:{prefixes:["Gr\xFCn","Tiefen","Eichen","Schatten","Hirsch","K\xF6nigs","Dornen","Nebel","Moos","Silber","Buchen","Farn","Elfen","J\xE4ger","Linden","Dunkel"],largeSuffixes:["wald","forst","mark","dickicht"],smallSuffixes:["hain","holz","geh\xF6lz","grund"],standalone:["Alter K\xF6nigsforst","Fl\xFCsternder Wald","Gr\xFCne Tiefen","Hain der Hirsche","Dichter Schattenforst"],largeThreshold:28,minHexes:8,priorityBoost:1.15},jungle:{prefixes:["Smaragd","Regen","Ranken","Farn","Gr\xFCn","Dampf","Wild","Palmen","Tropen","Moos","Nebel","Fluss"],largeSuffixes:["urwald","dickicht","dschungel","wildnis"],smallSuffixes:["forst","hain","gr\xFCn","tal"],standalone:["Smaragddickicht","Wilder Regenforst","Gr\xFCnes Labyrinth","Tiefes Rankenland"],largeThreshold:24,minHexes:8,priorityBoost:1.18},taiga:{prefixes:["Nord","Tannen","Winter","Kiefern","Grau","B\xE4ren","Fichten","Frost","Wolfs","Harz","Kalt","Boreal"],largeSuffixes:["forst","taiga","wald","mark"],smallSuffixes:["grund","h\xF6h","tann","holz"],standalone:["N\xF6rdlicher Tannenforst","Wolfs-Taiga","Graue Fichtenweiten","Stiller Winterwald"],largeThreshold:26,minHexes:8,priorityBoost:1.12},desert:{prefixes:["Sonnen","Gold","Glut","Sand","Ocker","Staub","Feuer","D\xFCrre","S\xFCd","W\xFCsten","Kupfer","Aschen","Rot","Karg"],largeSuffixes:["w\xFCste","\xF6de","steppe","weite"],smallSuffixes:["d\xFCnen","sand","tal","senke"],standalone:["Gro\xDFe Sonnenw\xFCste","Goldene D\xFCnen","Flirrende Glut\xF6de","Staubiges S\xFCdland","Ockerfarbene Weiten"],largeThreshold:26,minHexes:8,priorityBoost:1.22},snow:{prefixes:["Frost","Wei\xDF","Schnee","Nord","Winter","Eis","K\xE4lte","Gletscher","Reif","Sturm","Silber","Schneesturm"],largeSuffixes:["weiten","mark","tundra","\xF6de","land"],smallSuffixes:["feld","grund","kuppe","senke"],standalone:["Ewige Schneefelder","Hohe Frostmark","Wei\xDFe Nordweiten","Eisige Tundra","Land des Raureifs"],largeThreshold:28,minHexes:8,priorityBoost:1.2},wetland:{prefixes:["Nebel","Schilf","Schwarz","Binsen","Weiden","Grau","Torf","Frosch","Moor","Dunkel","T\xFCmpel","Brack"],largeSuffixes:["moor","marsch","sumpf","bruch"],smallSuffixes:["ried","lache","grund","senke"],standalone:["Gro\xDFes Nebelmoor","Schilfige Marsch","Stilles Weidenried","Schwarzer Bruch"],largeThreshold:18,minHexes:6,priorityBoost:1.1},hills:{prefixes:["Wind","Stein","Kupfer","Wacht","Heide","Sonnen","Hoch","Falken","Gr\xFCn","Klippen","Fels","Morgen"],largeSuffixes:["hochland","h\xF6hen","h\xFCgel","kamm"],smallSuffixes:["kuppen","r\xFCcken","h\xE4nge","b\xFChl"],standalone:["Windige H\xF6hen","Altes Hochland","Falkenh\xFCgel","Steinige Heide"],largeThreshold:22,minHexes:10,priorityBoost:.96},plains:{prefixes:["Gr\xFCn","Weizen","Sonnen","Kron","Weit","S\xFCd","Gold","Auen","Grenz","Mittel","Korn","Wiesen","Frei","Tal","Friedens"],largeSuffixes:["mark","land","ebene","steppe","auen"],smallSuffixes:["feld","grund","weide","flur"],standalone:["Goldene Ebene","Weites Kronland","Gr\xFCne Auen","Sonnige Grenzmark","Fruchtbare Weiten"],largeThreshold:34,minHexes:14,priorityBoost:.92}};function Di(t){let{kind:e,hexCount:r,seedHash:o,usedNames:a}=t,n=sr[e],u=r>=n.largeThreshold?n.largeSuffixes:n.smallSuffixes;for(let f=0;f<12;f++){let h=lr(o,f*31+7,2654435761),m=lr(o^1367130551,f*47+13,2246822507),g;if(f===0&&h%7===0&&n.standalone.length>0)g=n.standalone[m%n.standalone.length];else{let p=n.prefixes[h%n.prefixes.length],b=u[m%u.length];if(p.toLowerCase().includes(b.toLowerCase().slice(0,4))||b.toLowerCase().includes(p.toLowerCase().slice(0,4))){let S=u[(m+1)%u.length];g=`${p}${S}`}else g=`${p}${b}`}if(!a||!a.has(g))return a?.add(g),g}let i=n.prefixes[o%n.prefixes.length],l=u[(o>>>8)%u.length],c=`${i}${l}`;return a?.add(c),c}var dt=8,Vt=104;function kn(t,e,r){let o=Tt(t,6),a=Math.floor(o.minQ/dt)*dt-dt,n=Math.ceil(o.maxQ/dt)*dt+dt,s=Math.floor(o.minR/dt)*dt-dt,u=Math.ceil(o.maxR/dt)*dt+dt;if(n-a+1>Vt){let i=Math.floor((a+n)/2),l=Math.floor(Vt/2);a=i-l,n=a+Vt-1}if(u-s+1>Vt){let i=Math.floor((s+u)/2),l=Math.floor(Vt/2);s=i-l,u=s+Vt-1}return{key:`${r}|${e}|${a},${n},${s},${u}`,minQ:a,maxQ:n,minR:s,maxR:u}}function na(t){let{cam:e,lookupHex:r,seedInt:o,dataRevision:a}=t,n=kn(e,a,o),{minQ:s,maxQ:u,minR:i,maxR:l}=n,c=u-s+1,f=l-i+1,h=c*f,m=new Array(h),g=new Array(h),p=[];for(let W=0;W<f;W++){let y=i+W,E=W*c;for(let D=0;D<c;D++){let C=s+D,L=r(C,y),O=E+D;if(!L||L.fogState===0){m[O]=void 0,g[O]=null;continue}m[O]=L;let B=Ii(L);g[O]=B;let N=zr(C*37,y*73,o^16807),R=zr(C*89,y*29,o^29377),q=ke(C,y),$=(R-.5)*90,X=(zr(C*19,y*53,o^6627)-.5)*65,_=L.fogState===1?1:2;if(B==="mountains")N<.78&&p.push({kind:"peak",x:q.x+$*.45,y:q.y+X*.4,scale:.82+R*.44,seed:R,fogState:_});else if(B==="hills")N<.34&&p.push({kind:"hill",x:q.x+$*.5,y:q.y+X*.45,scale:.8+R*.35,seed:R,fogState:_});else if(B==="forest"||B==="taiga"||B==="jungle")N<.44&&p.push({kind:B,x:q.x+$*.55,y:q.y+X*.5,scale:.8+R*.42,seed:R,fogState:_});else if(B==="desert")N<.24&&p.push({kind:"dune",x:q.x+$*.5,y:q.y+X*.4,scale:.85+R*.35,seed:R,fogState:_});else if((B==="sea"||B==="icy_sea")&&N<.085){let F=!1;for(let A=0;A<6;A++){let[I,k]=_e[A],d=r(C+I,y+k);if(d&&d.fogState>0&&d.terrainId!=="icy_ocean"&&!Pn.has(d.terrainId)){F=!0;break}}F||p.push({kind:"wave",x:q.x+$*.4,y:q.y+X*.4,scale:.85+R*.38,seed:R,fogState:_})}}}let b=new Uint8Array(h),S=new Int32Array(h),P=[];for(let W=0;W<h;W++){if(b[W])continue;let y=g[W];if(!y)continue;b[W]=1;let E=0,D=0;S[D++]=W;let C=[];for(;E<D;){let L=S[E++];C.push(L);let O=Math.floor(L/c),B=L-O*c;for(let N=0;N<6;N++){let[R,q]=_e[N],$=B+R,X=O+q;if($<0||$>=c||X<0||X>=f)continue;let _=X*c+$;b[_]||g[_]!==y||(b[_]=1,S[D++]=_)}}C.length>=sr[y].minHexes&&P.push({kind:y,indices:C})}P.sort((W,y)=>y.indices.length*sr[y.kind].priorityBoost-W.indices.length*sr[W.kind].priorityBoost);let x=new Set,w=[],H=Math.min(P.length,42);for(let W=0;W<H;W++){let y=P[W],{kind:E,indices:D}=y,C=D.length,L=0,O=0,B=0,N=4294967295,R=0,q=0,$=new Float64Array(C),X=new Float64Array(C),_=new Uint8Array(C);for(let z=0;z<C;z++){let oe=D[z],te=Math.floor(oe/c),V=oe-te*c,K=s+V,ie=i+te,Q=ke(K,ie);$[z]=Q.x,X[z]=Q.y,L+=Q.x,O+=Q.y;let ee=m[oe];ee&&ee.fogState===2&&B++;let ce=!0;for(let de=0;de<6;de++){let[Ue,qe]=_e[de],He=V+Ue,et=te+qe;if(He<0||He>=c||et<0||et>=f||g[et*c+He]!==E){ce=!1;break}}_[z]=ce?1:0;let Ce=lr(K*19349663,ie*83492791,o^739982445);Ce<N&&(N=Ce,R=K,q=ie)}let F=L/C,A=O/C,I=F,k=A,d=1/0,v=1/0,M=0,G=-1;for(let z=0;z<C;z++){let oe=$[z]-F,te=X[z]-A,V=oe*oe+te*te;V<v&&(v=V,M=z),_[z]&&V<d&&(d=V,G=z)}if(G>=0){let z=$[G],oe=X[G];d<57600?(I=F*.55+z*.45,k=A*.55+oe*.45):(I=z,k=oe)}else I=$[M],k=X[M];let U=st(I,k,e),Y=Math.min(92,e.viewportWidth*.14),j=52,Z=96;if(!(U.x>=Y&&U.x<=e.viewportWidth-Y&&U.y>=j&&U.y<=e.viewportHeight-Z)&&C>=14){let z=0,oe=0,te=0;for(let V=0;V<C;V++){let K=st($[V],X[V],e);K.x>=Y&&K.x<=e.viewportWidth-Y&&K.y>=j&&K.y<=e.viewportHeight-Z&&(z+=$[V],oe+=X[V],te++)}if(te>=6){let V=z/te,K=oe/te,ie=1/0,Q=-1,ee=1/0,ce=-1;for(let Ce=0;Ce<C;Ce++){let de=st($[Ce],X[Ce],e);if(de.x<Y||de.x>e.viewportWidth-Y||de.y<j||de.y>e.viewportHeight-Z)continue;let Ue=$[Ce]-V,qe=X[Ce]-K,He=Ue*Ue+qe*qe;He<ee&&(ee=He,ce=Ce),_[Ce]&&He<ie&&(ie=He,Q=Ce)}Q>=0?(I=$[Q],k=X[Q]):ce>=0&&(I=$[ce],k=X[ce])}}let J=0,ge=0,he=0;for(let z=0;z<C;z++){let oe=$[z]-I,te=X[z]-k;J+=oe*oe,ge+=te*te,he+=oe*te}J/=C,ge/=C,he/=C;let se=J+ge,Re=J-ge,ve=Math.sqrt(Math.max(0,Re*Re*.25+he*he)),xe=Math.max(1,se*.5+ve),be=Math.max(1,se*.5-ve),ye=(xe-be)/(xe+be),De=Math.sqrt(xe)*3.1,we=.5*Math.atan2(2*he,Re);we>Math.PI*.5&&(we-=Math.PI),we<-Math.PI*.5&&(we+=Math.PI);let Ie=Math.max(-.52,Math.min(.52,we)),Ae=ye<.22?Ie*.25:Ie*Math.min(1,ye*1.45),We=(zr(R,q,o^1597463007)-.5)*.22,Ge=sr[E],ae=C>=Ge.largeThreshold*1.45?3:C>=Ge.largeThreshold*.72?2:1,ne=lr(R*131071,q*524287,o^E.charCodeAt(0)*997),T=Di({kind:E,hexCount:C,seedHash:ne,usedNames:x});w.push({id:`${E}:${R},${q}`,kind:E,name:T,x:I,y:k,hexCount:C,spanWorld:De,angleRad:Ae,arcBend:We,tier:ae,isWater:E==="sea"||E==="icy_sea",fogState:B>0?2:1})}return{windowKey:n.key,regions:w,stamps:p}}var xt=256,Bi=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,qi=`#version 300 es
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
const float HEX_R = ${Qe.toFixed(6)};
const float PROJ_Y = ${Pe.toFixed(4)};
const float ROW_STEP = ${(1.5*Qe).toFixed(6)};
const float TEX_WORLD_SIZE = 256.0;
const float WATER_HEX_COVER = ${(2*Qe).toFixed(4)}; // 295.603 (autotile.js:87)
const float RELIEF_MAX_H = ${_r.toFixed(2)};

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
`,Hi=`#version 300 es
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

uniform usampler2D u_cellData;
uniform sampler2D u_cloudTex;
uniform sampler2D u_cloudEdgeTex;

const float HEX_W = ${256 .toFixed(4)};
const float HEX_R = ${Qe.toFixed(6)};
const float PROJ_Y = ${Pe.toFixed(4)};
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

  // Warm unexplored clouds into aged sepia-parchment terra-incognita during Strategic Atlas zoom!
  if (u_strategicBlend > 0.005) {
    float pLuma = dot(fogBase, vec3(0.299, 0.587, 0.114));
    vec3 parchmentFog = vec3(0.84, 0.78, 0.65) * (0.86 + pLuma * 0.24);
    parchmentFog = mix(parchmentFog, vec3(0.46, 0.37, 0.27), frontierBand * 0.22);
    fogBase = mix(fogBase, parchmentFog, u_strategicBlend);
  }

  // Exact premultiplied composite: out = fogBase * cloudAlpha + dst * (1 - cloudAlpha) * (1 - cloudShadow)
  fragColor = vec4(fogBase * cloudAlpha, outAlpha);
}
`;function Wn(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let a=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${a}`)}return o}var Yr=class{constructor(e){this.cellBuf=new Uint8Array(xt*xt*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.hasUnknownCells=!1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=Wn(e,e.VERTEX_SHADER,Bi),o=Wn(e,e.FRAGMENT_SHADER,qi),a=e.createProgram();if(!a)throw new Error("Failed to create terrain program");if(e.attachShader(a,r),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(o),!e.getProgramParameter(a,e.LINK_STATUS)){let f=e.getProgramInfoLog(a)||"Unknown link error";throw e.deleteShader(r),e.deleteProgram(a),new Error(`Terrain program link error:
${f}`)}this.program=a;let n=Wn(e,e.FRAGMENT_SHADER,Hi),s=e.createProgram();if(!s)throw e.deleteShader(r),e.deleteShader(n),new Error("Failed to create cloud overlay program");if(e.attachShader(s,r),e.attachShader(s,n),e.linkProgram(s),e.deleteShader(r),e.deleteShader(n),!e.getProgramParameter(s,e.LINK_STATUS)){let f=e.getProgramInfoLog(s)||"Unknown link error";throw e.deleteProgram(s),new Error(`Cloud overlay program link error:
${f}`)}this.cloudProgram=s;let u=e.createVertexArray();if(!u)throw new Error("Failed to create terrain VAO");this.vao=u;let i=e.createTexture();if(!i)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=i,e.bindTexture(e.TEXTURE_2D,i),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,xt,xt),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let l=e.createTexture();if(!l)throw new Error("Failed to allocate surface field texture");this.surfaceTex=l,e.bindTexture(e.TEXTURE_2D,l),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let c=(f,h)=>{let m=e.getUniformLocation(f,h);if(!m)throw new Error(`Missing terrain uniform: ${h}`);return m};this.uCamCenter=c(a,"u_camCenter"),this.uViewportSize=c(a,"u_viewportSize"),this.uZoom=c(a,"u_zoom"),this.uTime=c(a,"u_time"),this.uGridOrigin=c(a,"u_gridOrigin"),this.uGridSize=c(a,"u_gridSize"),this.uForestFloorLayer=c(a,"u_forestFloorLayer"),this.uShowGrid=c(a,"u_showGrid"),this.uHoverHex=c(a,"u_hoverHex"),this.uSurfaceRect=c(a,"u_surfaceRect"),this.uEdgeBand=c(a,"u_edgeBand"),this.uWaterHexMode=c(a,"u_waterHexMode"),this.uReliefEnabled=c(a,"u_reliefEnabled"),this.uReliefLighting=c(a,"u_reliefLighting"),this.uWindEnabled=c(a,"u_windEnabled"),this.uStrategicBlend=c(a,"u_strategicBlend"),e.useProgram(a),e.uniform1i(e.getUniformLocation(a,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(a,"u_cellData"),1),e.uniform1i(e.getUniformLocation(a,"u_surfaceField"),3),this.cuCamCenter=c(s,"u_camCenter"),this.cuViewportSize=c(s,"u_viewportSize"),this.cuZoom=c(s,"u_zoom"),this.cuTime=c(s,"u_time"),this.cuGridOrigin=c(s,"u_gridOrigin"),this.cuGridSize=c(s,"u_gridSize"),this.cuHasClouds=c(s,"u_hasClouds"),this.cuHasCloudEdge=c(s,"u_hasCloudEdge"),this.cuWindEnabled=c(s,"u_windEnabled"),this.cuStrategicBlend=c(s,"u_strategicBlend"),e.useProgram(s),e.uniform1i(e.getUniformLocation(s,"u_cellData"),1),e.uniform1i(e.getUniformLocation(s,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(s,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return go(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:a,cellTex:n,surfaceTex:s,cellBuf:u}=this,{cam:i,assets:l,lookupHex:c,resolveTerrainLayer:f,isWaterTerrain:h,seedInt:m,dataRevision:g,timeSec:p,showGrid:b,hoverHex:S,edgeBand:P=28,waterSampling:x="hex",reliefEnabled:w=!0,reliefStrength:H=Jt,reliefLighting:W=!0,reliefStyle:y="sculpted",windAnimation:E=!0,strategicBlend:D=0}=e,C=Tt(i,4),L=C.maxQ-C.minQ+1,O=C.maxR-C.minR+1,B=C.minQ,N=C.minR;L>xt&&(B=Math.floor((C.minQ+C.maxQ)/2)-Math.floor(xt/2),L=xt),O>xt&&(N=Math.floor((C.minR+C.maxR)/2)-Math.floor(xt/2),O=xt);let R=!1;if(B!==this.lastMinQ||N!==this.lastMinR||L!==this.lastSpanQ||O!==this.lastSpanR||g!==this.lastDataRevision){let v=0,M=!1;for(let G=0;G<O;G++){let U=N+G;for(let Y=0;Y<L;Y++){let j=B+Y,Z=c(j,U);if(!Z||Z.fogState===0)M=!0,u[v++]=0,u[v++]=0,u[v++]=0,u[v++]=0;else{let le=h(Z.terrainId)?1:0,J=At.has(Z.terrainId)?2:0,ge=Z.terrainId==="icy_ocean"?4:0,he=Z.terrainId==="coastal_water"||Z.terrainId==="coastal_waters"||Z.terrainId==="coast"?8:0;u[v++]=f(Z.terrainId,j,U)&255,u[v++]=ra(Z)&255,u[v++]=Z.fogState,u[v++]=le|J|ge|he}}}this.hasUnknownCells=M,r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,L,O,r.RGBA_INTEGER,r.UNSIGNED_BYTE,u.subarray(0,L*O*4)),this.lastMinQ=B,this.lastMinR=N,this.lastSpanQ=L,this.lastSpanR=O,this.lastDataRevision=g,R=!0}let q=w?H:0,$=i.viewportWidth*.5/i.zoom,X=i.viewportHeight*.5/(i.zoom*Pe),_=i.x-$-140,F=i.x+$+140,A=i.y/Pe-X-180,I=i.y/Pe+X+220;if(!this.surfaceWin||this.lastSurfaceRevision!==g||this.lastSurfaceStrength!==q||this.lastSurfaceStyle!==y||_<this.surfaceWin.left||F>this.surfaceWin.left+this.surfaceWin.width||A<this.surfaceWin.top||I>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(F-_)*3.5){let v=Math.max(384,(F-_)*.35),M=Math.max(384,(I-A)*.35),G=_-v,U=A-M,Y=F-_+v*2,j=I-A+M*2,Z=Math.max(16,Math.ceil(Math.max(Y/200,j/150)));this.surfaceWin=po({left:G,top:U,width:Y,height:j,step:Z,lookupHex:c,manifest:l.manifest,seedInt:m,reliefStrength:q,reliefStyle:y}),this.lastSurfaceRevision=g,this.lastSurfaceStrength=q,this.lastSurfaceStyle=y,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(a),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,l.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.uniform2f(this.uCamCenter,i.x,i.y),r.uniform2f(this.uViewportSize,i.viewportWidth,i.viewportHeight),r.uniform1f(this.uZoom,i.zoom),r.uniform1f(this.uTime,p),r.uniform2i(this.uGridOrigin,B,N),r.uniform2i(this.uGridSize,L,O),r.uniform1i(this.uForestFloorLayer,l.forestFloorLayer),r.uniform1f(this.uShowGrid,b?1:0),r.uniform2i(this.uHoverHex,S?S.q:-999999,S?S.r:-999999);let d=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,d?d.left:0,d?d.top:0,d?d.width:1,d?d.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,P))),r.uniform1f(this.uWaterHexMode,x==="hex"?1:0),r.uniform1f(this.uReliefEnabled,w?1:0),r.uniform1f(this.uReliefLighting,W?1:0),r.uniform1f(this.uWindEnabled,E?1:0),r.uniform1f(this.uStrategicBlend,Math.max(0,Math.min(1,D))),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:L*O,uploaded:R}}renderCloudOverlay(e){if(!this.hasUnknownCells||this.lastSpanQ<=0||this.lastSpanR<=0)return 0;let{gl:r,cloudProgram:o,vao:a,cellTex:n}=this,{cam:s,assets:u,timeSec:i,windAnimation:l=!0,strategicBlend:c=0}=e;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(o),r.bindVertexArray(a),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,u.cloudTexture),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,u.cloudEdgeTexture??u.cloudTexture),r.uniform2f(this.cuCamCenter,s.x,s.y),r.uniform2f(this.cuViewportSize,s.viewportWidth,s.viewportHeight),r.uniform1f(this.cuZoom,s.zoom),r.uniform1f(this.cuTime,i),r.uniform2i(this.cuGridOrigin,this.lastMinQ,this.lastMinR),r.uniform2i(this.cuGridSize,this.lastSpanQ,this.lastSpanR),r.uniform1f(this.cuHasClouds,u.cloudTexture?1:0),r.uniform1f(this.cuHasCloudEdge,u.cloudEdgeTexture?1:0),r.uniform1f(this.cuWindEnabled,l?1:0),r.uniform1f(this.cuStrategicBlend,Math.max(0,Math.min(1,c))),r.drawArrays(r.TRIANGLES,0,3),1}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program),this.gl.deleteProgram(this.cloudProgram)}};var oa=65536,Kr=6,Ui=`#version 300 es
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
`,Gi=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,$r=class{constructor(e){this.verts=new Float32Array(oa*Kr);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,Ui),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,Gi),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let a=e.createProgram();if(!a)throw new Error("Failed to allocate vector program");if(e.attachShader(a,r),e.attachShader(a,o),e.linkProgram(a),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(a)}`);this.program=a;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let u=Kr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,u,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,u,8),e.bindVertexArray(null);let i=l=>{let c=e.getUniformLocation(a,l);if(!c)throw new Error(`Missing vector uniform: ${l}`);return c};this.uCamCenter=i("u_camCenter"),this.uViewportSize=i("u_viewportSize"),this.uZoom=i("u_zoom")}pushTri(e,r,o,a,n,s,u,i,l,c){if(this.vertCount+3>oa)return;let f=this.vertCount*Kr,h=this.verts;h[f++]=e,h[f++]=r,h[f++]=u,h[f++]=i,h[f++]=l,h[f++]=c,h[f++]=o,h[f++]=a,h[f++]=u,h[f++]=i,h[f++]=l,h[f++]=c,h[f++]=n,h[f++]=s,h[f++]=u,h[f++]=i,h[f++]=l,h[f++]=c,this.vertCount+=3}pushSegment(e,r,o,a){let n=r.x-e.x,s=r.y-e.y,u=Math.hypot(n,s);if(u<1e-4)return;let i=-s/u*(o*.5),l=n/u*(o*.5),[c,f,h,m]=a;this.pushTri(e.x-i,e.y-l,e.x+i,e.y+l,r.x+i,r.y+l,c,f,h,m),this.pushTri(e.x-i,e.y-l,r.x+i,r.y+l,r.x-i,r.y-l,c,f,h,m)}pushDisc(e,r,o,a,n,s){let[u,i,l,c]=s;for(let f=0;f<n;f++){let h=f/n*Math.PI*2,m=(f+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(h)*o,r+Math.sin(h)*a,e+Math.cos(m)*o,r+Math.sin(m)*a,u,i,l,c)}}pushHexFill(e,r,o,a=1){let n=ke(e,r),s=mr(e,r),[u,i,l,c]=o;for(let f=0;f<6;f++){let h=s[f],m=s[(f+1)%6],g=n.x+(h.x-n.x)*a,p=n.y+(h.y-n.y)*a,b=n.x+(m.x-n.x)*a,S=n.y+(m.y-n.y)*a;this.pushTri(n.x,n.y,g,p,b,S,u,i,l,c)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Kr)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:a,strategicBlend:n,sampleReliefHeight:s}=e;if(!o)return 0;this.vertCount=0;let u=i=>s?{x:i.x,y:i.y-s(i.x,i.y/Pe)*Pe}:i;if(o.territory&&o.territory.length>0){let i=new Map;for(let h of o.territory)i.set(Be(h.q,h.r),h.ownerId);let l=.08+n*.24,c=Math.max(7,10/Math.max(.2,r.zoom*1.1)),f=.75+n*.2;for(let h of o.territory){let m=a(h.q,h.r);if(m===0)continue;let g=m===1?.65:1,[p,b,S]=h.color;this.pushHexFill(h.q,h.r,[p,b,S,l*g],.98);for(let P=0;P<6;P++){let[x,w]=_e[P];if(i.get(Be(h.q+x,h.r+w))!==h.ownerId){let{a:W,b:y}=ht(h.q,h.r,P),E=ke(h.q,h.r),D={x:W.x+(E.x-W.x)*.05,y:W.y+(E.y-W.y)*.05},C={x:y.x+(E.x-y.x)*.05,y:y.y+(E.y-y.y)*.05};this.pushSegment(D,C,c,[p,b,S,f*g])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let i=1-n*.85;for(let l of o.buildings){let c=a(l.q,l.r);if(c===0)continue;let f=(c===1?.65:1)*i,h=u(ke(l.q,l.r)),g=l.kind==="capital"||l.kind==="settlement"||l.kind==="fortress"?106:78,p=g*.72;this.pushDisc(h.x,h.y+4,g*1.18,p*1.18,18,[.42,.36,.26,.22*f]),this.pushDisc(h.x,h.y+4,g*.88,p*.88,16,[.48,.42,.31,.36*f])}}if(o.buildPreview){let i=o.buildPreview;for(let c of i.bonusHexes)this.pushHexFill(c.q,c.r,[.22,.82,.48,.24],.92);let l=i.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(i.center.q,i.center.r,l,.96)}if(o.selectedHex){let i=mr(o.selectedHex.q,o.selectedHex.r),l=Math.max(5,6/Math.max(.25,r.zoom));for(let c=0;c<6;c++)this.pushSegment(i[c],i[(c+1)%6],l,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:a,timeSec:n,coveredBuildingIds:s,coveredSiteIds:u}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let i of o.buildings){let l=a(i.q,i.r);if(l===0)continue;let c=l===1?.65:1,f=ke(i.q,i.r),[h,m,g]=i.factionColor;if(i.rangeRadius&&i.rangeRadius>0){let w=i.rangeRadius*240,H=w*.85,W=36;for(let y=0;y<W;y+=2){let E=y/W*Math.PI*2,D=(y+1)/W*Math.PI*2;this.pushSegment({x:f.x+Math.cos(E)*w,y:f.y+Math.sin(E)*H},{x:f.x+Math.cos(D)*w,y:f.y+Math.sin(D)*H},Math.max(4,3.5/Math.max(.2,r.zoom)),[h,m,g,.45*c])}}if(s?.has(i.id))continue;let p=i.kind==="capital"||i.kind==="settlement",b=i.kind==="fortress"||i.kind==="watchtower",S=p?78:b?64:52,P=p?68:b?76:42;this.pushDisc(f.x-10,f.y+8,S*1.12,S*.62,16,[.05,.07,.09,.45*c]),this.pushDisc(f.x,f.y+4,S,S*.56,6,[.34,.32,.29,.96*c]);let x=S*.68;this.pushTri(f.x-x,f.y+6,f.x+x,f.y+6,f.x+x,f.y-P*.65,.78*c,.74*c,.66*c,.98),this.pushTri(f.x-x,f.y+6,f.x+x,f.y-P*.65,f.x-x,f.y-P*.65,.66*c,.62*c,.55*c,.98),this.pushTri(f.x-x*1.18,f.y-P*.62,f.x+x*1.18,f.y-P*.62,f.x,f.y-P*1.25,h*c,m*c,g*c,.98),(p||b)&&this.pushTri(f.x-14,f.y-P*.95,f.x+14,f.y-P*.95,f.x,f.y-P*1.55,.96*c,.8*c,.34*c,.98)}if(o.sites)for(let i of o.sites){if(u?.has(i.id)||a(i.q,i.r)===0)continue;let c=ke(i.q,i.r),f=26,h=i.family==="fauna"?[.85,.58,.25,.9]:i.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(c.x,c.y-f,c.x+f,c.y,c.x,c.y+f,h[0],h[1],h[2],h[3]),this.pushTri(c.x,c.y-f,c.x,c.y+f,c.x-f,c.y,h[0]*.8,h[1]*.8,h[2]*.8,h[3])}if(o.units)for(let i of o.units){if(a(i.q,i.r)<2)continue;let[c,f,h]=i.factionColor,m=ke(i.q,i.r);if(i.marchPath&&i.marchPath.length>=2){let g=i.marchPath.map(D=>ke(D.q,D.r));for(let D=0;D<g.length-1;D++)this.pushSegment(g[D],g[D+1],Math.max(8,6/Math.max(.2,r.zoom)),[c,f,h,.78]);let p=g[g.length-1],b=g[g.length-2],S=p.x-b.x,P=p.y-b.y,x=Math.hypot(S,P)||1,w=S/x,H=P/x,W=p,y={x:p.x-w*28,y:p.y-H*28};this.pushTri(W.x,W.y,y.x-H*18,y.y+w*18,y.x+H*18,y.y-w*18,c,f,h,.95);let E=n*.14%1;m={x:g[0].x+(g[1].x-g[0].x)*E,y:g[0].y+(g[1].y-g[0].y)*E}}if(i.inCombat){let g=1+.22*Math.sin(n*5);this.pushDisc(m.x,m.y,56*g,44*g,20,[.98,.26,.22,.35])}this.pushDisc(m.x,m.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(m.x,m.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(m.x,m.y-16,26,26,18,[c,f,h,.98])}if(o.walls)for(let i of o.walls){if(!i.breached)continue;let l=lt(i.q1,i.r1,i.q2,i.r2);if(l<0)continue;let{mid:c}=ht(i.q1,i.r1,l),f=1+.18*Math.sin(n*4.5);this.pushDisc(c.x,c.y,32*f,24*f,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Oi=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],aa=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],Vi={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function Ni(t,e,r,o){let a=t.infrastructure.sprites,n=[];e==="stone"?(o?(n.push(`walls/stone/gates/v1/gate_dir${r}`),r===5&&n.push("walls/stone/gates/v1/gate_dir2"),n.push(`walls/stone/v7/edge_dir${r}`)):n.push(`walls/stone/v7/edge_dir${r}`),n.push(`walls/palisade/edge_dir${r}`)):(o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`));for(let s of n)if(a[s])return s;return null}function Xi(t,e,r){let o=t.infrastructure.sprites,a=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${a}`,`walls/palisade/${a}`]:[`walls/palisade/${a}`];for(let s of n)if(o[s])return s;return null}function ia(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,a,n,s]=r.boundsInSpriteWidth,u=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*u,shadowRelTop:a*u,shadowWidth:(n-o)*u,shadowHeight:(s-a)*u}}function sa(t,e,r,o){if(!e.length)return[];let a=[],n=o?.occupiedRiverEdges,s=o?.lookupHex,u=new Map;for(let i of e){let l=lt(i.q1,i.r1,i.q2,i.r2);if(l<0)continue;if(n&&n.size>0){let S=Je(i.q1,i.r1,i.q2,i.r2);if(n.has(S.key))continue}if(s){let S=s(i.q1,i.r1),P=s(i.q2,i.r2);if(S&&(pt(S.terrainId)||S.reliefClass==="mountain")||P&&(pt(P.terrainId)||P.reliefClass==="mountain"))continue}let c=r(i.q1,i.r1),f=r(i.q2,i.r2),h=c>=f?c:f;if(h===0)continue;let{a:m,b:g,mid:p}=ht(i.q1,i.r1,l),b=Ni(t,i.kind,l,!!i.isGate);if(b){let S=t.infrastructure.sprites[b],P=b.includes("/stone/"),[x,w,H,W]=P?aa[l]:Oi[l],y=g.x-m.x,E=g.y-m.y,D=Math.hypot(y,E)||1,C=-E/D,L=y/D;(L<0||Math.abs(L)<1e-9&&C<0)&&(C=-C,L=-L);let O=P?24:16,B=C*O,N=L*O*.62,R=Math.abs(y)>1e-6?(N-E/y*B)*.5:P?5.5:3.5,q=W;if(P){let X=aa[(l+3)%6][3];q=(W+X-E)*.5}let $=P?"stone":"palisade";a.push({x:m.x,y:m.y,relLeft:-H,relTop:-q+R,width:x,height:w,page:S.page,u0:S.uv[0],v0:S.uv[1],u1:S.uv[2],v1:S.uv[3],sortY:p.y,fogState:h,...ia(t,`wall_shadow:${$}:dir${l}`)})}for(let S of[m,g]){let P=`${Math.round(S.x*10)},${Math.round(S.y*10)}`,x=u.get(P);x||(x={x:S.x,y:S.y,degree:0,hasPalisade:!1,hasStone:!1,fog:h},u.set(P,x)),x.degree++,i.kind==="palisade"&&(x.hasPalisade=!0),i.kind==="stone"&&(x.hasStone=!0),h>x.fog&&(x.fog=h)}}for(let i of u.values()){let l=i.hasStone&&!i.hasPalisade?"stone":"palisade",c=i.degree===1,f=Xi(t,l,c);if(!f)continue;let h=t.infrastructure.sprites[f],m=Vi[l],g=c?m.endW:m.cornerW,p=c?m.endH:m.cornerH;a.push({x:i.x,y:i.y,relLeft:-g*.5,relTop:-p+m.south,width:g,height:p,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:i.y+1,fogState:i.fog,...ia(t,`wall_shadow:${l}:post`)})}return a.sort((i,l)=>i.sortY-l.sortY||i.x-l.x),a}var Fn={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0,showGroundDecals:!0,showAmbientVfx:!0,showProvisionalSites:!0,showStrategicCartography:!0},jr=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=Mn(null);this.cachedWallSprites=[];this.wallCacheKey="";this.cachedOccupiedRiverEdges=new Set;this.riverEdgesCacheKey="";this.lastVisibleRiverRoutes=[];this.cachedBridgeSprites=[];this.bridgeCacheKey="";this.cachedBuildingSprites=[];this.buildingCacheKey="";this.coveredBuildingIds=new Set;this.cachedSiteSprites=[];this.siteCacheKey="";this.coveredSiteIds=new Set;this.cachedInfraSprites=[];this.cachedStrategicCartography=null;this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...mt,...o.forestConfig??{}},this.reliefConfig={...Dt,...o.reliefConfig??{}},this.visualConfig={...Fn,...o.visualConfig??{}};let a=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!a)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=a,this.terrainPass=new Yr(a),this.roadPass=new Nr(a),this.riverPass=new Rr(a),this.vectorPass=new $r(a),this.spriteBatcher=new Xr(a),this.animatedActorPass=new Fr(a),this.ambientVfxPass=new Wr(a),this.camera=new qr(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await _n(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new nr(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await _n(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let a=this.assets;return this.assets=o,this.chunkManager=new nr(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",a?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.riverEdgesCacheKey="",this.bridgeCacheKey="",this.buildingCacheKey="",this.siteCacheKey=""),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheKey="",this.riverEdgesCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.infrastructureClearance=Mn(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheKey="",this.buildingCacheKey="",this.siteCacheKey="",this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}getOccupiedRiverEdgeKeys(){if(!this.riverEdgesCacheKey&&this.chunkManager){let e=this.chunkManager;this.cachedOccupiedRiverEdges=Rt({routes:this.lastVisibleRiverRoutes,manualRivers:this.dynamicScene?.rivers,isWaterHex:(r,o)=>{let a=e.lookupTerrainHex(r,o);return a?e.isWaterTerrain(a.terrainId):!1}})}return this.cachedOccupiedRiverEdges}validateWallPlacement(e,r,o,a,n=!1){return Er({q1:e,r1:r,q2:o,r2:a,isGate:n,lookupHex:(s,u)=>this.chunkManager?.lookupTerrainHex(s,u),occupiedRiverEdges:this.getOccupiedRiverEdgeKeys(),existingRoads:this.dynamicScene?.roads})}validateRoadPlacement(e,r,o,a){return Ar({q1:e,r1:r,q2:o,r2:a,lookupHex:(n,s)=>this.chunkManager?.lookupTerrainHex(n,s),existingWalls:this.dynamicScene?.walls})}validateRiverPlacement(e,r,o){return Tr({q:e,r,dir:o,lookupHex:(a,n)=>this.chunkManager?.lookupTerrainHex(a,n),existingWalls:this.dynamicScene?.walls})}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let o=0;o<e.length;o++){let a=e[o];if(a.inCombat||a.marchPath&&a.marchPath.length>=2)return!0}let r=this.dynamicScene?.sites;if(r&&r.length>0){for(let o=0;o<r.length;o++)if(r[o].family==="fauna")return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let a=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let s=this.camera.state,u=this.gl;u.viewport(0,0,u.canvas.width,u.canvas.height);let i=(e-this.startTimeMs)*.001,l=Rn(s.zoom),c=1-l,f=c>.02,h=this.visualConfig.windAnimation!==!1,m=this.visualConfig.showStrategicCartography!==!1,g=m?l:0,{sprites:p,fogStates:b,decals:S,decalFogStates:P,shorelines:x,shoreFogStates:w,riverRoutes:H,chunksLoadedThisFrame:W,hasPendingChunks:y}=o.prepareVisibleFrame(s,f?2:6,f),E=(ae,ne)=>{let T=o.lookupTerrainHex(ae,ne);return T?T.fogState:0},D=performance.now(),C=this.terrainPass.render({cam:s,assets:r,lookupHex:(ae,ne)=>o.lookupTerrainHex(ae,ne),resolveTerrainLayer:(ae,ne,T)=>o.resolveTerrainLayer(ae,ne,T),isWaterTerrain:ae=>o.isWaterTerrain(ae),seedInt:o.seedInt,dataRevision:o.revision,timeSec:i,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:h,strategicBlend:g}),L=this.spriteBatcher.renderShorelines({cam:s,shorelines:x,fogStates:w,infraPages:r.infraPages,projectY:Pe,opacityScale:1-g}),O=(ae,ne)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(ae,ne):0,B=this.roadPass.render({cam:s,roads:this.dynamicScene?.roads,lookupFog:E,strategicBlend:l,sampleReliefHeight:O}),N=this.riverPass.render({cam:s,assets:r,routes:H,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:O,lookupFog:E,lookupHex:(ae,ne)=>o.lookupTerrainHex(ae,ne),timeSec:i,windAnimation:h}),R=this.vectorPass.renderGroundPass({cam:s,scene:this.dynamicScene,lookupFog:E,strategicBlend:l,sampleReliefHeight:O}),q=performance.now(),$=p,X=b;if(!this.infrastructureClearance.isEmpty&&p.length>0){$=[],X=[];for(let ae=0;ae<p.length;ae++){let ne=p[ae];En(ne,this.infrastructureClearance)||($.push(ne),X.push(b[ae]))}}let _=this.dynamicScene?.customSprites;if(f&&_&&_.length>0){let ae=[];for(let ne=0;ne<$.length;ne++)ae.push({sprite:$[ne],fog:X[ne]});for(let ne of _){let T=r.manifest.nature.sprites[ne.spriteKey];if(!T)continue;let z=ke(ne.q,ne.r),oe=z.x+(ne.offsetX??0),te=z.y+(ne.offsetY??0),V=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(oe,te/Pe)*Pe:0,K=(ne.worldWidthOverride??T.worldWidth)*Lt(T)*(ne.scale??1),ie=K*T.aspect,Q=r.manifest.shadows.sprites[ne.spriteKey],ee=ne.anchorOverride??T.anchor;ae.push({sprite:{x:oe,y:te-V,sortY:te,width:K,height:ie,anchorX:ee[0],anchorY:ee[1],page:T.page,u0:T.uv[0],v0:T.uv[1],u1:T.uv[2],v1:T.uv[3],q:ne.q,r:ne.r,isMountain:T.kind==="mountain",isSnowFamily:xr(T),shadowTier:vn(T,K,ie),selfShadeWeight:yn(T),shadowPage:Q?Q.page:-1,shadowU0:Q?Q.uv[0]:0,shadowV0:Q?Q.uv[1]:0,shadowU1:Q?Q.uv[2]:0,shadowV1:Q?Q.uv[3]:0,shadowMinX:Q?Q.boundsInSpriteWidth[0]:0,shadowMinY:Q?Q.boundsInSpriteWidth[1]:0,shadowMaxX:Q?Q.boundsInSpriteWidth[2]:0,shadowMaxY:Q?Q.boundsInSpriteWidth[3]:0},fog:E(ne.q,ne.r)})}ae.sort((ne,T)=>(ne.sprite.sortY??ne.sprite.y)-(T.sprite.sortY??T.sprite.y)||ne.sprite.x-T.sprite.x),$=ae.map(ne=>ne.sprite),X=ae.map(ne=>ne.fog)}let F=this.sceneRevision*1000003+o.revision,A=this.dynamicScene?.rivers,I=H.map(ae=>ae.id).join(",");this.lastVisibleRiverRoutes=H;let k=`${F}|${I}`;this.riverEdgesCacheKey!==k&&(this.cachedOccupiedRiverEdges=Rt({routes:H,manualRivers:A,isWaterHex:(ae,ne)=>{let T=o.lookupTerrainHex(ae,ne);return T?o.isWaterTerrain(T.terrainId):!1}}),this.riverEdgesCacheKey=k);let d=!1,v=`${F}|${I}`;this.wallCacheKey!==v&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?sa(r.manifest,this.dynamicScene.walls,E,{occupiedRiverEdges:this.cachedOccupiedRiverEdges,lookupHex:(ae,ne)=>o.lookupTerrainHex(ae,ne)}):[],this.wallCacheKey=v,d=!0);let M=this.dynamicScene?.roads,G=!!(M&&M.length>0)&&(H.length>0||!!(A&&A.length>0)),U=G?`${F}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}|${I}`:"";if(this.bridgeCacheKey!==U){if(G&&M){let ae=Bo({roads:M,routes:H,manualRivers:A,lookupFog:E,isWaterHex:(ne,T)=>{let z=o.lookupTerrainHex(ne,T);return z?o.isWaterTerrain(z.terrainId):!1}});this.cachedBridgeSprites=qo({manifest:r.manifest,crossings:ae,sampleReliefHeight:O})}else this.cachedBridgeSprites=[];this.bridgeCacheKey=U,d=!0}let Y=this.dynamicScene?.buildings,j=!!(Y&&Y.length>0),Z=j?`${F}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.buildingCacheKey!==Z){if(j&&Y){let ae=Ho({manifest:r.manifest,buildings:Y,lookupFog:E,sampleReliefHeight:(ne,T)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(ne,T):0});this.cachedBuildingSprites=ae.sprites,this.coveredBuildingIds=ae.coveredBuildingIds}else this.cachedBuildingSprites=[],this.coveredBuildingIds=new Set;this.buildingCacheKey=Z,d=!0}let le=this.dynamicScene?.sites,J=!!(le&&le.length>0),ge=this.visualConfig.showProvisionalSites!==!1,he=J&&ge?`${F}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.siteCacheKey!==he){if(J&&ge&&le){let ae=Yo({manifest:r.manifest,sites:le,lookupFog:E,sampleReliefHeight:O});this.cachedSiteSprites=ae.sprites,this.coveredSiteIds=ae.coveredSiteIds}else this.cachedSiteSprites=[],this.coveredSiteIds=new Set;this.siteCacheKey=he,d=!0}if(d){let ae=[];this.cachedWallSprites.length>0&&ae.push(this.cachedWallSprites),this.cachedBridgeSprites.length>0&&ae.push(this.cachedBridgeSprites),this.cachedBuildingSprites.length>0&&ae.push(this.cachedBuildingSprites),this.cachedSiteSprites.length>0&&ae.push(this.cachedSiteSprites),ae.length===0?this.cachedInfraSprites=[]:ae.length===1?this.cachedInfraSprites=ae[0]:this.cachedInfraSprites=ae.flat().sort((ne,T)=>ne.sortY-T.sortY||ne.x-T.x)}let se=0;if(f&&this.visualConfig.showGroundDecals!==!1&&S.length>0){let ae=S,ne=P;if(!this.infrastructureClearance.isEmpty){ae=[],ne=[];for(let T=0;T<S.length;T++){let z=S[T];En(z,this.infrastructureClearance)||(ae.push(z),ne.push(P[T]))}}ae.length>0&&(se=this.spriteBatcher.renderWorldSprites({cam:s,sprites:ae,fogStates:ne,naturePages:r.naturePages,detailOpacity:c,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:i,windAnimation:!1,isDecalPass:!0}).drawCalls)}let Re=this.spriteBatcher.renderShadows({cam:s,sprites:$,fogStates:X,walls:this.cachedInfraSprites,shadowPages:r.shadowPages,shadowOpacity:this.shadowOpacity,detailOpacity:c}),ve=performance.now(),xe=this.spriteBatcher.renderWaterSurfRings({cam:s,sprites:$,fogStates:X,detailOpacity:c,timeSec:i,windAnimation:h}),be=this.spriteBatcher.renderWorldSprites({cam:s,sprites:$,fogStates:X,naturePages:r.naturePages,walls:this.cachedInfraSprites,infraPages:r.infraPages,detailOpacity:c,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:this.shadowOpacity,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:i,windAnimation:h}),ye=f&&J?Io({manifest:r.manifest,sites:le,lookupFog:E,sampleReliefHeight:O,timeSec:i,animate:h}):{actors:[],coveredSiteIds:new Set},De=this.animatedActorPass.render({cam:s,assets:r,actors:ye.actors,detailOpacity:c,shadowOpacity:this.shadowOpacity,naturePolish:this.visualConfig.naturePolish}),we=f&&this.visualConfig.showAmbientVfx!==!1?this.ambientVfxPass.render({cam:s,detailOpacity:c,timeSec:i,animate:h,lookupHex:(ae,ne)=>o.lookupTerrainHex(ae,ne),isWaterTerrain:ae=>o.isWaterTerrain(ae),buildings:this.dynamicScene?.buildings,sampleReliefHeight:O,seedInt:o.seedInt}):{drawCalls:0,particleCount:0},Ie=this.terrainPass.renderCloudOverlay({cam:s,assets:r,timeSec:i,windAnimation:h,strategicBlend:g}),Ae;if(c>.35)if(ye.coveredSiteIds.size===0)Ae=this.coveredSiteIds;else if(this.coveredSiteIds.size===0)Ae=ye.coveredSiteIds;else{let ae=new Set(this.coveredSiteIds);for(let ne of ye.coveredSiteIds)ae.add(ne);Ae=ae}let Oe=this.vectorPass.renderTacticalPass({cam:s,scene:this.dynamicScene,lookupFog:E,timeSec:i,coveredBuildingIds:c>.35?this.coveredBuildingIds:void 0,coveredSiteIds:Ae});if(this.overlayCanvas){let ae=null;if(m&&l>.04){let ne=kn(s,o.revision,o.seedInt).key;(!this.cachedStrategicCartography||this.cachedStrategicCartography.windowKey!==ne)&&(this.cachedStrategicCartography=na({cam:s,lookupHex:(T,z)=>o.lookupTerrainHex(T,z),seedInt:o.seedInt,dataRevision:o.revision})),ae=this.cachedStrategicCartography}No({canvas:this.overlayCanvas,cam:s,scene:this.dynamicScene,lookupFog:E,strategicBlend:l,timeSec:i,strategicCartography:ae})}let We=performance.now();this.hasPendingStream=y||W>0;let Ge=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!Ge||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let ae=this.frameTimes.length>0?this.frameTimes.reduce((T,z)=>T+z,0)/this.frameTimes.length:Math.max(16.6,We-a),ne={fps:Math.min(120,Math.round(1e3/Math.max(8,ae))),frameMs:Number((We-a).toFixed(2)),terrainPassMs:Number((q-D).toFixed(2)),shadowPassMs:Number((ve-q).toFixed(2)),spritePassMs:Number((We-ve).toFixed(2)),drawCalls:1+L.drawCalls+B+N+R+se+Re.drawCalls+xe+be.drawCalls+De.drawCalls+we.drawCalls+Ie+Oe,visibleHexes:C.visibleHexes,renderedSprites:be.renderedSprites+De.renderedActors,renderedShadows:Re.renderedShadows,loadedChunks:o.loadedChunkCount,mode:Go(s.zoom),strategicBlend:Number(l.toFixed(2)),vramTier:r.vramTier,zoom:Number(s.zoom.toFixed(2)),centerHex:$e(s.x,s.y)};this.options.onMetrics(ne)}return Ge}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.roadPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.animatedActorPass.dispose(),this.ambientVfxPass.dispose(),this.assets?.dispose(),this.assets=null}};var ca={VedrasMapEngine:jr,createGeographyV2ChunkProvider:_o,createSandboxScenario:Eo,computeScenarioFog:Ao,evaluateDecision0121BuildPreview:or,SANDBOX_SCENARIO_LIST:To,VIELFALT_MIX_OVERRIDES:Ht,DEFAULT_FOREST_CONFIG:mt,DEFAULT_RELIEF_CONFIG:Dt,DEFAULT_VISUAL_CONFIG:Fn,computeBoulderSpawnScale:Mr,sizeFactor:Lt,GeographyV2:la.default,placementRules:{isWaterTerrainId:pt,collectOccupiedRiverEdgeKeys:Rt,validateWallEdgePlacement:Er,validateRoadEdgePlacement:Ar,validateRiverEdgePlacement:Tr},hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:_e,axialToWorld:ke,worldToAxial:$e,hexDistance:je,hexKey:Be,hexEdgeEndpoints:ht,canonicalEdgePair:Je,neighborDirection:lt,pickNearestHexEdge:qn}};typeof window<"u"&&(window.VedrasMapEngineLib=ca);var El=ca;})();
