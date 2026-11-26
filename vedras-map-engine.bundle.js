/* Vedras Reiche WebGL2 Map Engine Bundle (Decision 0123) — generated from browsergame/engine/map/browser-bundle.ts */
"use strict";(()=>{var po=Object.create;var an=Object.defineProperty;var go=Object.getOwnPropertyDescriptor;var bo=Object.getOwnPropertyNames;var vo=Object.getPrototypeOf,yo=Object.prototype.hasOwnProperty;var xo=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var wo=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of bo(e))!yo.call(t,i)&&i!==r&&an(t,i,{get:()=>e[i],enumerable:!(o=go(e,i))||o.enumerable});return t};var Pr=(t,e,r)=>(r=t!=null?po(vo(t)):{},wo(e||!t||!t.__esModule?an(r,"default",{value:t,enumerable:!0}):r,t));var Zt=xo((pi,Kt)=>{"use strict";(function(t){"use strict";let e="geography-v2.1.2",r="geography-v2.1.1",o=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],i=Object.freeze(["ocean","coastal_water","icy_ocean","stormy_ocean","frozen_tundra","tundra","snowfields","highland","grassland","pasture","sparse_pasture","savanna","jungle","moor","marshland","swamp","rocky_badlands","badlands","rocky_desert","sandy_rocky_desert","sandy_desert","desert","clay_desert","sandy_badlands","wasteland","semi_desert"]),n=Object.freeze(["cold","grassland","savanna","arid","wetland","jungle"]),s=[["Welt / Wasser","water.fraction","Wasser-Zielanteil",.25,.05,.65,.01,"Statistischer Wasseranteil statt exakter Quote jedes Kartenausschnitts"],["Welt / Wasser","water.scale","Gr\xF6\xDFe der Wasserlandschaften",18,5,85,1,"H\xF6her bedeutet gr\xF6\xDFere zusammenh\xE4ngende Meere und Seen"],["Welt / Wasser","water.coastDetail","K\xFCstenunregelm\xE4\xDFigkeit",.28,0,.65,.01,"Kleinr\xE4umige Buchten und Vorspr\xFCnge"],["Welt / Wasser","water.lakeInfluence","Binnengew\xE4sser",.1,0,.4,.01,"Mehr kleine Seen durch Wasserwert-Absenkung"],["Welt / Wasser","water.stormChance","St\xFCrmischer Ozean (dauerhaft)",.22,0,.8,.01,"Fester Terrain-Typ ohne dynamisches Wetter"],["Welt / Wasser","water.iceTemperature","Temperaturgrenze eisiger Ozean",.19,0,.5,.01,"Nur Ozean ohne direkte Landber\xFChrung"],["Klima","climate.scale","Gr\xF6\xDFe der Klimazonen",23,6,90,1,"Zusammenhang von Temperatur und Feuchtigkeit"],["Klima","climate.temperature","Mittlere Temperatur",.57,.15,.9,.01,"Normierter Temperatur-Grundwert"],["Klima","climate.tempVariation","Temperaturabweichung",.43,0,.9,.01,"Regional unterschiedliche W\xE4rme"],["Klima","climate.humidity","Mittlere Feuchtigkeit",.51,.1,.9,.01,"Normierter Feuchtigkeits-Grundwert"],["Klima","climate.humidityVariation","Feuchteabweichung",.49,0,.9,.01,"Regionale Trockenheit und Regengebiete"],["Klima","climate.coastalHumidity","Wassern\xE4he-Feuchtebonus",.12,0,.35,.01,"Verblasst mit der Entfernung von Wasser"],["Biome / Geologie","biomes.targetHexes","Biom-Zielgr\xF6\xDFe in Hexen",60,15,250,1,"Unregelm\xE4\xDFige, grob zusammenh\xE4ngende Biomkerne; keine feste Mindestgr\xF6\xDFe"],["Biome / Geologie","biomes.borderWarp","Biomgrenzen verformen",.32,0,.9,.01,"Weg von perfekten geometrischen Regionen"],["Biome / Geologie","biomes.dryThreshold","Trockenheitsgrenze",.31,.12,.6,.01,"Ab wann warme Gebiete arid werden"],["Biome / Geologie","biomes.wetThreshold","Feuchtgebietsgrenze",.72,.5,.95,.01,"Ab wann passende Biome Moor/Sumpf/Marschland werden"],["Biome / Geologie","geology.scale","Gr\xF6\xDFe der Boden-Unterregionen",7,2,30,1,"Sand, Stein, Lehm und Mischb\xF6den in zusammenh\xE4ngenden Feldern"],["Biome / Geologie","geology.sandBias","Sandanteil in Trockenregionen",.5,0,1,.01,"Verschiebt die W\xFCstenuntertypen"],["Relief","relief.hillFraction","H\xFCgel-Zielanteil",.31,0,.75,.01,"Statistisch, nicht pro Ausschnitt erzwungen"],["Relief","relief.mountainFraction","Berg-Zielanteil",.075,0,.25,.005,"Feste unpassierbare Berghexe, keine Umverteilung bei Erweiterung"],["Relief","relief.scale","Reliefregionen",14,4,45,1,"Zusammenh\xE4ngende H\xFCgel- und Berglandschaften"],["Relief","relief.chainLength","L\xE4nge der Bergformationen",23,5,70,1,"L\xE4ngliche Gebirgsstrukturen statt verstreuter Einzelberge"],["Relief","relief.chainWidth","Breite der Gebirgsz\xFCge",.4,.05,.95,.01,"Breiter oder schmaler Gebirgskern"],["Relief","relief.hillVariation","H\xFCgelprofil-Variation",.65,0,1,.01,"Von sanften Kuppen bis steilen R\xFCcken"],["Gew\xE4sser / Fl\xFCsse","rivers.sourcesPer100","Flussquellen pro 100 Landhexe",.75,0,5,.05,"Zielwert f\xFCr die Zahl nat\xFCrlicher Flussl\xE4ufe"],["Gew\xE4sser / Fl\xFCsse","rivers.minLength","Mindestl\xE4nge eines Flusses",5,2,25,1,"Flusswege werden grafisch an HEXKANTEN dargestellt"],["Gew\xE4sser / Fl\xFCsse","rivers.maxLength","Maximale Fluss-Routenl\xE4nge",28,10,50,1,"Lokale Flussroute, unabh\xE4ngig vom Kartenausschnitt"],["Gew\xE4sser / Fl\xFCsse","rivers.meander","Flusskr\xFCmmung",.25,0,1,.01,"Varianz zwischen geeigneten Abflussnachbarn"],["Vegetation","forest.coverage","Waldintensit\xE4t",.36,0,.9,.01,"Bewaldungswahrscheinlichkeit; tats\xE4chlicher Waldanteil wird auf der Karte angezeigt"],["Vegetation","forest.patchScale","Gr\xF6\xDFe der Waldgruppen",8,2,30,1,"R\xE4umlicher Zusammenhang lichter und dichter W\xE4lder"],["Vegetation","forest.denseThreshold","Schwelle dichter Wald",.72,.35,.95,.01,"Ab welcher regionalen Dichte ein Wald als dicht gilt"],["Klima / Details","climate.coastalDecay","Feuchtereichweite der K\xFCsten",3,1,20,.5,"Entfernung, \xFCber die Gew\xE4sser die Landfeuchte beeinflussen"],["Biomgrenzen","biomes.snowHumidity","Schneefelder ab Feuchte",.6,.25,.9,.01,"Niedrigere Werte schaffen mehr Schneefelder statt gefrorener Tundra"],["Biomgrenzen","biomes.coldBoundary","Grenze kalter Biome",.29,.1,.48,.01,"K\xE4ltebiome gegen\xFCber gem\xE4\xDFigten Regionen"],["Biomgrenzen","biomes.warmBoundary","Grenze der Savannen",.66,.45,.85,.01,"Warmregionen gegen\xFCber Grasland"],["Biomgrenzen","biomes.jungleWarmBoundary","Dschungel-W\xE4rmegrenze",.68,.45,.9,.01,"Dschungel kann direkt an W\xFCste grenzen"],["Biomgrenzen","biomes.aridWarmBoundary","Temperaturgrenze trockener W\xFCsten",.48,.3,.8,.01,"Arides Biom nur bei ausreichend warmer Temperatur"],["Biomgrenzen","biomes.wetlandBoundary","Zus\xE4tzliche Feuchtgebietsgrenze",.67,.45,.9,.01,"Warme/gem\xE4\xDFigte Feuchtregionen"],["Biomgrenzen","biomes.regionClimateMix","Regionale Klimakoh\xE4renz",.82,.3,1,.01,"Gro\xDFe Biomregionen statt kleinteiliger Einzelhexe"],["Biomgrenzen","biomes.semiDesertMargin","\xDCbergang Halbw\xFCste zu W\xFCste",.045,0,.18,.005,"Breite der Halbw\xFCstenzone in ariden Regionen"],["Boden-Untertypen","geology.grassSparseHumidity","Karges Weideland bis Feuchte",.36,.1,.7,.01,"Trockenere Grasregionen erzeugen karges Weideland"],["Boden-Untertypen","geology.pastureSoil","Weideland nach Bodenwert",.37,0,1,.01,"Untertyp-Mischung innerhalb Grasregionen"],["Boden-Untertypen","geology.highlandColdMargin","Hochland in K\xE4ltegebieten",0,0,.3,.01,"Erweitert die Hochland-Zone in k\xFChlere Bereiche der kalten Biomfamilie; 0 beh\xE4lt die alte Verteilung"],["Boden-Untertypen","geology.highlandSoil","Hochland-Reliefschwelle",.62,.2,1,.01,"Hochland-Bodentextur in markanten k\xFChlen Reliefgebieten; weiterhin nur flat/hills/mountain"],["Boden-Untertypen","geology.swampWarmBoundary","Sumpf ab Temperatur",.64,.3,.8,.01,"Niedrigere Werte ersetzen Moor und Marschland durch Sumpf"],["Boden-Untertypen","geology.wetlandSoil","Moor/Marschland nach Bodenwert",.5,0,1,.01,"Steuert die Untertypen in gem\xE4\xDFigten Feuchtgebieten"],["Boden-Untertypen","geology.aridPatchMix","Vielfalt der W\xFCsten-Untertypen",0,0,1,.05,"0 = bisheriges Bodenrauschen; 1 = gleichm\xE4\xDFig gewichtete, zusammenh\xE4ngende geologische Teilregionen"],["Boden-Untertypen","geology.aridRockyBadlands","Steinige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridBadlands","Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridRockyDesert","Steinw\xFCste Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyRocky","Sandig-steinige W\xFCste Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyDesert","Sandw\xFCste Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridDesert","W\xFCstenboden Gewicht",14,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridClay","Lehmw\xFCste Gewicht",12,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridSandyBadlands","Sandige Badlands Gewicht",11,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Boden-Untertypen","geology.aridWasteland","\xD6dland Gewicht",15,0,100,1,"Relativer Anteil innerhalb trockener W\xFCstenregionen"],["Vegetation","forest.lightThreshold","Grenze lichter Wald",.12,.02,.4,.01,"Dichte f\xFCr lichte Waldklassen"],["Vegetation","forest.denseFactor","Dichtefaktor dichter Wald",.65,.4,1,.01,"Zusammen mit der Waldschwelle ergibt dies dichten Wald"],["Fundorte / Tiere","features.ironPer1000","Eisenvorkommen pro 1000 Landhexe",27,0,150,1,"Geologische Rohstoffvorkommen (Testverteilung)"],["Fundorte / Tiere","features.animalsPer1000","Tieranteil: Tierhexe pro 1000 geeignete Landhexe",75,0,250,1,"Tierhexe insgesamt; Tierart folgt dem Habitat"],["Fundorte / Tiere","features.ruinsPer1000","Ruinen pro 1000 Landhexe",6,0,40,1,"Erkundbare Orte; weitere Fundorttypen bleiben erg\xE4nzbar"],["Fundorte / Tiere","features.wrecksPer1000","Schiffswracks pro 1000 Wasserhexe",5,0,40,1,"Besondere Erkundungsorte im Wasser"],["Fundorte / Tiere","features.oasesPer1000","Oasen pro 1000 W\xFCstenhexe",12,0,80,1,"Seltene Besonderheiten in ariden Landschaften"],["Fundorte / Tiere","features.obelisksPer1000","Obelisken pro 1000 Landhexe",2,0,25,1,"Sehr seltene Besonderheiten"]],l=[],d=(_,W=0,E=1)=>Math.min(E,Math.max(W,_)),a=(_,W)=>_+","+W;function c(_){let W=2166136261;for(let E=0;E<_.length;E++)W^=_.charCodeAt(E),W=Math.imul(W,16777619);return W>>>0}let h=Object.create(null);function f(_){let W=typeof _=="string"?_:String(_),E=h[W];return E===void 0&&(E=c(W),h[W]=E),E}function m(_,W,E,q){let u=_^Math.imul(W+32767,374761393)^Math.imul(E+65521,668265263)^q;return u=Math.imul(u^u>>>15,2246822519),u=Math.imul(u^u>>>13,3266489917),(u^u>>>16)>>>0}function g(_,W,E,q){return m(_,W,E,f(q))}let x=(_,W,E,q)=>m(_,W,E,f(q))/4294967296,S=_=>_*_*(3-2*_);function I(_,W,E){let q=W.reduce((p,[,y])=>p+E[y],0);if(q<=0)return W[0][0];let u=d(_,0,.999999999)*q;for(let[p,y]of W)if(u-=E[y],u<0)return p;return W[W.length-1][0]}let D=(_,W,E)=>_+(W-_)*E;function v(_,W,E,q,u){let p=W/q,y=E/q,k=Math.floor(p),F=Math.floor(y),H=S(p-k),$=S(y-F),N=f(u),se=1/4294967296,ue=m(_,k,F,N)*se,Q=m(_,k+1,F,N)*se,Re=m(_,k,F+1,N)*se,z=m(_,k+1,F+1,N)*se;return D(D(ue,Q,H),D(Re,z,H),$)}function M(){return s.map(([_,W,E,q,u,p,y,k])=>({group:_,id:W,label:E,defaultValue:q,min:u,max:p,step:y,help:k}))}function j(){return Object.fromEntries(s.map(_=>[_[1],_[3]]))}function w(_){if(_!==void 0&&(typeof _!="object"||_===null||Array.isArray(_)))throw Error("Ung\xFCltige Parameterdatei.");let W=j();for(let[,E,,q,u,p]of s){if(_?.[E]===void 0)continue;let y=Number(_[E]);if(!Number.isFinite(y)||y<u||y>p)throw RangeError("Parameter au\xDFerhalb des g\xFCltigen Bereichs: "+E);W[E]=y}if(W["relief.mountainFraction"]+W["relief.hillFraction"]>.95)throw RangeError("H\xFCgel- und Berganteil d\xFCrfen zusammen maximal 95 % ausmachen.");return W}function b(_){if(!Array.isArray(_)||!_.length)throw RangeError("Mindestens eine generierte Welt f\xFCr die Statistik erforderlich.");let W=_.map(q=>q?.stats??q);if(W.some(q=>!q||!Number.isFinite(q.total)||q.total<=0||!Number.isFinite(q.land)||q.land<0||q.land>q.total||!q.biomes||!q.terrains))throw TypeError("Ung\xFCltige Weltstatistik.");function E(q,u,p){let y=[...new Set([...q,...W.flatMap(F=>Object.keys(F[u]))])],k=W.reduce((F,H)=>F+H[p],0);return Object.fromEntries(y.map(F=>{let H=W.map(N=>N[u][F]||0),$=H.reduce((N,se)=>N+se,0);return[F,{total:$,mean:$/W.length,percent:k?100*$/k:0,worldsPresent:H.filter(N=>N>0).length}]}))}return{generatorVersion:e,samples:W.length,meanHexes:W.reduce((q,u)=>q+u.total,0)/W.length,meanLand:W.reduce((q,u)=>q+u.land,0)/W.length,biomes:E(n,"biomes","land"),terrains:E(i,"terrains","total")}}function R(_){if(!_||typeof _.id!="string"||!/^extension\.[a-z0-9_.]+$/.test(_.id)||s.some(W=>W[1]===_.id))throw Error("Neue Parameter ben\xF6tigen eine eindeutige extension.*-ID.");for(let W of["defaultValue","min","max","step"])if(!Number.isFinite(_[W]))throw Error("Ung\xFCltiger Erweiterungsparameter: "+W);if(_.min>_.defaultValue||_.defaultValue>_.max||_.step<=0)throw Error("Ung\xFCltige Parametergrenzen.");s.push([String(_.group||"Erweiterungen"),_.id,String(_.label||_.id),_.defaultValue,_.min,_.max,_.step,String(_.help||"")])}function L(_){if(!_||!/^extension\.[a-z0-9_.]+$/.test(_.id)||typeof _.place!="function"||l.some(W=>W.id===_.id))throw Error("Ung\xFCltige Feature-Erweiterung.");l.push(_)}function C(_,W){return o.map(([E,q])=>W.get(a(_.q+E,_.r+q))).filter(Boolean)}function G(_,W,E,q,u,p=null,y=null){if(_==="arid"){if(E>u["biomes.dryThreshold"]-u["biomes.semiDesertMargin"])return"semi_desert";let k=D(q,y===null?q:y,u["geology.aridPatchMix"]),F=d(k+(u["geology.sandBias"]-.5)*.36);return I(F,[["rocky_badlands","geology.aridRockyBadlands"],["badlands","geology.aridBadlands"],["rocky_desert","geology.aridRockyDesert"],["sandy_rocky_desert","geology.aridSandyRocky"],["sandy_desert","geology.aridSandyDesert"],["desert","geology.aridDesert"],["clay_desert","geology.aridClay"],["sandy_badlands","geology.aridSandyBadlands"],["wasteland","geology.aridWasteland"]],u)}return _==="grassland"?E<u["geology.grassSparseHumidity"]?"sparse_pasture":q<u["geology.pastureSoil"]?"pasture":"grassland":_==="cold"?p&&p.hill>u["geology.highlandSoil"]&&W>=u["biomes.coldBoundary"]-u["geology.highlandColdMargin"]?"highland":W<u["biomes.coldBoundary"]-.04?E>u["biomes.snowHumidity"]?"snowfields":"frozen_tundra":W<u["biomes.coldBoundary"]&&E>.8?"snowfields":"tundra":_==="wetland"?W>u["geology.swampWarmBoundary"]?"swamp":W<.38?"moor":E>.85?"marshland":q>u["geology.wetlandSoil"]?"moor":"marshland":_==="jungle"?"jungle":_==="savanna"?E<.33?"semi_desert":"savanna":"grassland"}function ee(_,W,E){return _<E["biomes.coldBoundary"]?"cold":W>E["biomes.wetThreshold"]?_>E["biomes.jungleWarmBoundary"]?"jungle":"wetland":W<E["biomes.dryThreshold"]&&_>E["biomes.aridWarmBoundary"]?"arid":_>E["biomes.warmBoundary"]?"savanna":W>E["biomes.wetlandBoundary"]?"wetland":"grassland"}function B(_,W,E,q){let u=Math.sqrt(q["biomes.targetHexes"]),p=q["biomes.borderWarp"]*u,y=W+p*(v(_,W,E,u*.72,"warp-a")-.5)*2,k=E+p*(v(_,W,E,u*.72,"warp-b")-.5)*2,F=Math.floor(y/u),H=Math.floor(k/u),$=1/0,N=null;for(let se=-1;se<=1;se++)for(let ue=-1;ue<=1;ue++){let Q=F+ue,Re=H+se,z=(Q+.5+(x(_,Q,Re,"jit-q")-.5)*.72)*u,J=(Re+.5+(x(_,Q,Re,"jit-r")-.5)*.72)*u,te=(y-z)*(y-z)+(k-J)*(k-J);te<$&&($=te,N={id:a(Q,Re),x:z,y:J})}return N}let P=(_,W)=>Math.max(Math.abs(_.q-W.q),Math.abs(_.r-W.r),Math.abs(_.q+_.r-W.q-W.r));function Y(_,W,E,q,u=()=>!0){if(E<=0)return 1/0;let p=[];for(let y=0;y<1900;y++){let k=Math.floor((x(_,y,0,"sampleQ:"+W)-.5)*6900),F=Math.floor((x(_,y,1,"sampleR:"+W)-.5)*6900);u(k,F)&&p.push(q(k,F))}return p.length?(p.sort((y,k)=>k-y),p[Math.min(p.length-1,Math.floor(d(E)*p.length))]):1/0}function le(_,W){if(typeof _!="string"||_.length<1||_.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let E=w(W),q=c(r+":"+_),u={...E,"biomes.targetHexes":Math.max(5,E["geology.scale"]*1.5)},p=new Map,y=new Map,k=new Map,F=(A,U)=>a(A,U),H=(A,U)=>d(E["climate.temperature"]+(v(q,A,U,E["climate.scale"],"temp")-.5)*2*E["climate.tempVariation"]),$=(A,U)=>d(E["climate.humidity"]+(v(q,A,U,E["climate.scale"]*.9,"wet")-.5)*2*E["climate.humidityVariation"]);function N(A,U){let Z=v(q,A,U,E["water.scale"],"sea"),ge=v(q,A,U,Math.max(3,E["water.scale"]*.45),"sea-mid"),T=v(q,A,U,Math.max(2,E["water.scale"]*.21),"shore"),O=.2+.3*E["water.coastDetail"];return(Z+ge)*.5*(1-O)+T*O}function se(A,U){let Z=v(q,A,U,4.2,"lakes");return N(A,U)-Math.max(0,Z-.68)*E["water.lakeInfluence"]}let ue=Y(q,"water",E["water.fraction"],(A,U)=>-N(A,U));function Q(A,U){let Z=F(A,U);if(p.has(Z))return p.get(Z);let ge=-se(A,U)>=ue;return p.set(Z,ge),ge}function Re(A,U){let Z=F(A,U);if(y.has(Z))return y.get(Z);let ge=v(q,A,U,E["relief.scale"],"relief"),T=Math.max(6,E["relief.chainLength"]),O=A+(v(q,A,U,T*.58,"m-warp-q")-.5)*11,ne=U+(v(q,A,U,T*.58,"m-warp-r")-.5)*11,V=1-Math.abs(v(q,O*.56+ne*.36,ne*1.18,T,"ridge")-.5)*2,fe=1-Math.abs(v(q,O*.34-ne*.74,O*1.08,T*1.25,"ridge-b")-.5)*2,ce=Math.max(V,fe*.86),de=Math.pow(ce,3.6),Se=1-Math.abs(v(q,A*.92+U*.28,U*.96,7.5,"m-pass-a")-.5)*2,Ve=1-Math.abs(v(q,A*.28-U*.92,A*.96,8.2,"m-pass-b")-.5)*2,Ee=Math.max(Se,Ve),ze=Ee>.82?Math.pow((Ee-.82)/.18,.7)*.62:0,Qe=.92-.14*d(E["relief.chainWidth"],.05,.95),Je=d(de*Qe+ge*(1-Qe)-ze,0,1),st=d(ce*.65+ge*.35,0,1),pt={mass:ge,mountain:Je,oreBelt:st,hill:ge*.75+v(q,A,U,E["relief.scale"]*.46,"hills")*.25};return y.set(Z,pt),pt}let z=Y(q,"mountain",E["relief.mountainFraction"],(A,U)=>Re(A,U).mountain,(A,U)=>!Q(A,U)),J=(A,U)=>!Q(A,U)&&Re(A,U).mountain>=z,te=new Map,ve=(A,U)=>{let Z=F(A,U);if(te.has(Z))return te.get(Z);if(!J(A,U))return te.set(Z,!1),!1;let ge=!1;for(let T=-2;T<=2&&!ge;T++){let O=Math.max(-2,-T-2),ne=Math.min(2,-T+2);for(let V=O;V<=ne;V++)if(!(T===0&&V===0)&&!J(A+T,U+V)){ge=!0;break}}return te.set(Z,ge),ge},ye=Y(q,"hills",E["relief.hillFraction"],(A,U)=>Re(A,U).hill,(A,U)=>!Q(A,U)&&!ve(A,U)),be=(A,U)=>!Q(A,U)&&!ve(A,U)&&Re(A,U).hill>=ye,We=Math.min(16,Math.max(3,Math.ceil(E["climate.coastalDecay"]*3))),xe=new Map;function Ae(A,U){let Z=F(A,U);if(xe.has(Z))return xe.get(Z);if(Q(A,U))return xe.set(Z,0),0;let ge=We+1;e:for(let T=1;T<=We;T++)for(let O=-T;O<=T;O++){let ne=Math.max(-T,-O-T),V=Math.min(T,-O+T);for(let fe=ne;fe<=V;fe++)if(Math.max(Math.abs(O),Math.abs(fe),Math.abs(O+fe))===T&&Q(A+O,U+fe)){ge=T;break e}}return xe.set(Z,ge),ge}let pe=new Map;function Ie(A,U){let Z=F(A,U);if(k.has(Z))return k.get(Z);let ge=H(A,U),T=$(A,U),O=Ae(A,U),ne=d(T+E["climate.coastalHumidity"]*Math.exp(-O/E["climate.coastalDecay"])),V=B(q,A,U,E);pe.has(V.id)||pe.set(V.id,{t:H(V.x,V.y),h:$(V.x,V.y)});let fe=pe.get(V.id),ce=E["biomes.regionClimateMix"],de=d(fe.t*ce+ge*(1-ce)),Se=d(fe.h*ce+ne*(1-ce)),Ve=ee(de,Se,E),Ee=v(q,A,U,E["geology.scale"],"soil"),ze=Re(A,U),Qe=(Ve==="arid"&&E["geology.aridPatchMix"]>0?B(q,A,U,u):null)?.id.split(",").map(Number),Je=Qe?x(q,Qe[0],Qe[1],"arid-patch"):null,st={t:ge,h:ne,center:V,family:Ve,soil:Ee,landRelief:ze,aridPatch:Je,riverPotential:d(ne*.68+ze.mass*.18+Math.min(O,15)/30)};return k.set(Z,st),st}function qe(A,U){return Q(A,U)?o.some(([Z,ge])=>!Q(A+Z,U+ge))?"coastal_water":H(A,U)<E["water.iceTemperature"]?"icy_ocean":v(q,A,U,E["water.scale"]*.8,"storm")>1-E["water.stormChance"]?"stormy_ocean":"ocean":"land"}function Be(A){let U=(Z,ge)=>x(q,A.q,A.r,"feature:"+Z)<ge/1e3;A.surfaceClass==="land"&&A.reliefClass!=="mountain"?(U("iron",E["features.ironPer1000"])&&Ie(A.q,A.r).landRelief.oreBelt>.3&&A.features.push("iron"),["grassland","savanna","wetland","jungle"].includes(A.baseBiome)&&U("animals",E["features.animalsPer1000"])&&(A.baseBiome==="wetland"||A.baseBiome==="jungle"?A.features.push("pigs"):A.baseBiome==="savanna"||A.terrainId==="sparse_pasture"?A.features.push("horses"):A.features.push(x(q,A.q,A.r,"species")>.5?"pigs":"horses")),U("ruins",E["features.ruinsPer1000"])&&A.features.push("ruins"),U("obelisk",E["features.obelisksPer1000"])&&A.features.push("obelisk"),A.baseBiome==="arid"&&U("oasis",E["features.oasesPer1000"])&&A.features.push("oasis")):A.surfaceClass!=="land"&&U("wreck",E["features.wrecksPer1000"])&&A.features.push("wreck");for(let Z of l)Z.place({hex:A,config:E,seed:_,random:ge=>x(q,A.q,A.r,Z.id+":"+ge)})&&A.features.push(Z.id);return A}function Le(A,U){let Z=qe(A,U),ge=Z==="land",T=ge?Ie(A,U):null,O=ge&&ve(A,U),ne=ge&&!O&&be(A,U),V=ge?T.family==="jungle"?1:T.family==="grassland"?.86:T.family==="wetland"?.76:T.family==="savanna"?.46:T.family==="cold"?.25:.08:0,fe=ge?(v(q,A,U,E["forest.patchScale"],"forest")-.5)*1.6+E["forest.coverage"]-.3+(T.h-.5)*.35:0,ce=O?0:T?.family==="jungle"?Math.max(.76,d(fe)):d(fe)*V,de=O?"none":T?.family==="jungle"||ce>=E["forest.denseThreshold"]*E["forest.denseFactor"]?"dense_forest":ce>E["forest.lightThreshold"]?"light_forest":"none";return{q:A,r:U,temperature:T?.t??H(A,U),humidity:T?.h??$(A,U),regionId:T?.center.id??"",baseBiome:T?.family??null,terrainId:ge?G(T.family,T.t,T.h,T.soil,E,T.landRelief,T.aridPatch):Z,surfaceClass:Z,reliefClass:O?"mountain":ne?"hills":"flat",hillProfile:ne?["rounded","steep","chain","plateau","ridge"][Math.floor(x(q,Math.floor(A/3),Math.floor(U/3),"hill-style")*5)]:null,hillStrength:ne?d(T.landRelief.hill*E["relief.hillVariation"]+(1-E["relief.hillVariation"])*.4):0,mountainClass:O?"massif":null,forestDensity:ce,forestClass:de,riverPotential:T?.riverPotential??0,river:!1,riverEdges:[],features:[]}}function Xe(A,U,Z,ge){let T=E["rivers.maxLength"],O=E["rivers.minLength"],ne=T+1,V=2*T+2,fe=(ie,he)=>ie>=A&&ie<A+Z&&he>=U&&he<U+ge,ce=A-V,de=U-V,Se=Z+2*V,Ve=ge+2*V,Ee=new Int16Array(Se*Ve);Ee.fill(-1);let ze=new Int32Array(Se*Ve),ut=new Int32Array(Se*Ve),Qe=0,Je=0;for(let ie=0;ie<Ve;ie++){let he=de+ie,_e=ie*Se;for(let we=0;we<Se;we++){let Te=ce+we;Q(Te,he)&&(Ee[_e+we]=0,ze[Je]=Te,ut[Je]=he,Je++)}}for(;Qe<Je;){let ie=ze[Qe],he=ut[Qe];Qe++;let _e=Ee[(he-de)*Se+(ie-ce)];if(_e>=T)continue;let we=_e+1;for(let Te=0;Te<6;Te++){let me=ie+o[Te][0],He=he+o[Te][1],Ue=me-ce,$e=He-de;if(Ue<0||Ue>=Se||$e<0||$e>=Ve)continue;let Ye=$e*Se+Ue;Ee[Ye]>=0||ve(me,He)||(Ee[Ye]=we,ze[Je]=me,ut[Je]=He,Je++)}}let st=[],pt=new Map,Rr=E["rivers.sourcesPer100"]/100,Er=f("river-source"),re=f("river-turn"),ae=1/4294967296;function Ce(ie,he){for(let[_e,we]of[[ie,he],[he,ie]]){if(!fe(_e.q,_e.r)||Q(_e.q,_e.r))continue;let Te=o.findIndex(([Ue,$e])=>_e.q+Ue===we.q&&_e.r+$e===we.r);if(Te<0)continue;let me=F(_e.q,_e.r),He=pt.get(me);He||(He=[],pt.set(me,He)),He.includes(Te)||He.push(Te)}}for(let ie=U-ne;ie<U+ge+ne;ie++)for(let he=A-ne;he<A+Z+ne;he++){if(m(q,he,ie,Er)*ae>=Rr||Ee[(ie-de)*Se+(he-ce)]<O||Q(he,ie)||ve(he,ie)||Ie(he,ie).riverPotential<.36)continue;let we=[{q:he,r:ie}],Te={q:he,r:ie};for(let me=0;me<T;me++){let He=Ee[(Te.r-de)*Se+(Te.q-ce)];if(He<=0)break;let Ue=null,$e=1/0;for(let Ye=0;Ye<6;Ye++){let _t=Te.q+o[Ye][0],Ke=Te.r+o[Ye][1],yt=_t-ce,bt=Ke-de;if(yt<0||yt>=Se||bt<0||bt>=Ve||Ee[bt*Se+yt]!==He-1)continue;let at=Re(_t,Ke).hill*(1-E["rivers.meander"])+m(q,_t,Ke,re)*ae*E["rivers.meander"];at<$e&&($e=at,Ue={q:_t,r:Ke})}if(!Ue)break;Te=Ue,we.push(Te)}if(!(!Q(Te.q,Te.r)||we.length-1<O)&&we.some(me=>fe(me.q,me.r))){st.push(we.map(me=>[me.q,me.r]));for(let me=1;me<we.length;me++)Ce(we[me-1],we[me])}}for(let ie of pt.values())ie.sort((he,_e)=>he-_e);return{routes:st,edgesByKey:pt}}function Ge(A,U){return Be(Le(A,U))}return{c:E,s:q,spot:F,wet:Q,relief:Re,isMountain:ve,isHill:be,field:Ie,surface:qe,buildBaseCell:Le,attachFeatures:Be,sampleCell:Ge,traceRivers:Xe}}function oe(_,W={}){if(typeof _!="string"||_.length<1||_.length>256)throw Error("World Seed muss 1\u2013256 Zeichen lang sein.");let E=W.width===void 0?100:Number(W.width),q=W.height===void 0?80:Number(W.height),u=W.originQ===void 0?0:Number(W.originQ),p=W.originR===void 0?0:Number(W.originR);if(!Number.isSafeInteger(E)||!Number.isSafeInteger(q)||E<10||q<10||E*q>6e4)throw RangeError("Kartenausschnitt mindestens 10\xD710, maximal 60.000 Hexfelder.");if(!Number.isSafeInteger(u)||!Number.isSafeInteger(p)||Math.abs(u)>1e6||Math.abs(p)>1e6)throw RangeError("Ung\xFCltige Weltkoordinaten.");let y=le(_,W.config),{c:k,s:F,spot:H,wet:$,relief:N,isMountain:se,field:ue,buildBaseCell:Q,attachFeatures:Re}=y,z=[],J=new Map;for(let T=p;T<p+q;T++)for(let O=u;O<u+E;O++){let ne=Q(O,T);z.push(ne),J.set(H(O,T),ne)}let te=k["rivers.maxLength"],ve=k["rivers.minLength"],ye=te+1,be=2*te+2,We=new Map,xe=[];for(let T=p-be;T<p+q+be;T++)for(let O=u-be;O<u+E+be;O++)$(O,T)&&(We.set(H(O,T),0),xe.push({q:O,r:T}));let Ae=u-be,pe=u+E+be-1,Ie=p-be,qe=p+q+be-1;for(let T=0;T<xe.length;T++){let O=xe[T],ne=We.get(H(O.q,O.r));if(!(ne>=te))for(let[V,fe]of o){let ce=O.q+V,de=O.r+fe,Se=H(ce,de);ce<Ae||ce>pe||de<Ie||de>qe||se(ce,de)||We.has(Se)||(We.set(Se,ne+1),xe.push({q:ce,r:de}))}}let Be=[],Le=[];function Xe(T,O){for(let[ne,V]of[[T,O],[O,T]]){let fe=J.get(H(ne.q,ne.r));if(!fe||fe.surfaceClass!=="land")continue;fe.river=!0;let ce=o.findIndex(([de,Se])=>ne.q+de===V.q&&ne.r+Se===V.r);ce>=0&&!fe.riverEdges.includes(ce)&&fe.riverEdges.push(ce)}}for(let T=p-ye;T<p+q+ye;T++)for(let O=u-ye;O<u+E+ye;O++){if($(O,T)||se(O,T)||x(F,O,T,"river-source")>=k["rivers.sourcesPer100"]/100)continue;let ne=We.get(H(O,T));if(ne===void 0||ne<ve||ue(O,T).riverPotential<.36)continue;let V=[{q:O,r:T}],fe={q:O,r:T};for(let ce=0;ce<te;ce++){let de=We.get(H(fe.q,fe.r));if(de===0)break;let Se=o.map(([Ee,ze])=>({q:fe.q+Ee,r:fe.r+ze})).filter(Ee=>We.get(H(Ee.q,Ee.r))===de-1);if(!Se.length)break;let Ve=Ee=>N(Ee.q,Ee.r).hill*(1-k["rivers.meander"])+x(F,Ee.q,Ee.r,"river-turn")*k["rivers.meander"];Se.sort((Ee,ze)=>Ve(Ee)-Ve(ze)),fe=Se[0],V.push(fe)}if(!(!$(fe.q,fe.r)||V.length-1<ve)&&V.some(ce=>J.has(H(ce.q,ce.r)))){Le.push(V),V.every(ce=>J.has(H(ce.q,ce.r)))&&Be.push(V.map(ce=>[ce.q,ce.r]));for(let ce=1;ce<V.length;ce++)Xe(V[ce-1],V[ce])}}for(let T of z)Re(T),T.riverEdges.sort((O,ne)=>O-ne);let Ge=z.filter(T=>T.surfaceClass==="land").length,A={total:z.length,land:Ge,water:z.length-Ge,coast:0,hills:0,mountains:0,rivers:Be.length,riverCrossingCount:Le.length,riverHexes:0,forest:0,forestEligible:0,forestPercentLand:0,forestPercentEligible:0,biomes:{},terrains:{},features:{}},U=new Map;for(let T of z){T.surfaceClass==="coastal_water"&&A.coast++,T.reliefClass==="hills"&&A.hills++,T.reliefClass==="mountain"&&A.mountains++,T.river&&A.riverHexes++,T.forestClass!=="none"&&A.forest++,T.baseBiome&&(A.biomes[T.baseBiome]=(A.biomes[T.baseBiome]||0)+1,U.set(T.regionId,(U.get(T.regionId)||0)+1)),T.surfaceClass==="land"&&T.reliefClass!=="mountain"&&["grassland","savanna","jungle","wetland","cold"].includes(T.baseBiome)&&A.forestEligible++,A.terrains[T.terrainId]=(A.terrains[T.terrainId]||0)+1;for(let O of T.features)A.features[O]=(A.features[O]||0)+1}A.forestPercentLand=Ge?+(100*A.forest/Ge).toFixed(1):0,A.forestPercentEligible=A.forestEligible?+(100*A.forest/A.forestEligible).toFixed(1):0;let Z=[...U.values()].sort((T,O)=>T-O);A.biomeRegions={count:Z.length,min:Z[0]||0,average:Z.length?+(Ge/Z.length).toFixed(1):0,median:Z.length?Z[Math.floor(Z.length/2)]:0,max:Z.at(-1)||0,within30to90:Z.filter(T=>T>=30&&T<=90).length};function ge(T){let O=new Set,ne=0;for(let V of z){let fe=H(V.q,V.r);if(O.has(fe)||!T(V))continue;let ce=[V];O.add(fe);for(let de=0;de<ce.length;de++)for(let Se of C(ce[de],J)){let Ve=H(Se.q,Se.r);T(Se)&&!O.has(Ve)&&(O.add(Ve),ce.push(Se))}ne=Math.max(ne,ce.length)}return ne}return A.connectedLandPercent=Ge?+(100*ge(T=>T.surfaceClass==="land")/Ge).toFixed(1):0,A.largestWaterBody=ge(T=>T.surfaceClass!=="land"),{version:e,seed:_,width:E,height:q,originQ:u,originR:p,config:k,cells:z,riverPaths:Be,riverPreviewPaths:Le.map(T=>T.map(O=>[O.q,O.r])),stats:A,riverGeometry:"hex-edges"}}let X={VERSION:e,DIRS:o,TERRAIN_IDS:i,BIOME_IDS:n,parameterSchema:M,defaultConfig:j,normalizeConfig:w,aggregateDistributions:b,registerParameter:R,registerFeature:L,createPointSampler:le,generateWorld:oe,getWorldCell:(_,W,E)=>{let q=_.originQ??0,u=_.originR??0;return W<q||E<u||W>=q+_.width||E>=u+_.height?null:_.cells[(E-u)*_.width+(W-q)]??null}};typeof Kt<"u"&&Kt.exports&&(Kt.exports=X),t.VedrasGeography=X})(typeof window<"u"?window:globalThis)});var uo=Pr(Zt());var _o=Math.sqrt(3),Ze=256/_o,De=.85,je=1.5*Ze,ln=je*De,Me=16,Pe=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];function ke(t,e){return{x:256*(t+e*.5),y:ln*e}}function et(t,e){let r=e/ln,o=t/256-r*.5,i=-o-r,n=Math.round(o),s=Math.round(r),l=Math.round(i),d=Math.abs(n-o),a=Math.abs(s-r),c=Math.abs(l-i);return d>a&&d>c?n=-s-l:a>c&&(s=-n-l),{q:n===0?0:n,r:s===0?0:s}}function tt(t,e,r,o){let i=t-r,n=e-o;return(Math.abs(i)+Math.abs(i+n)+Math.abs(n))/2}function At(t,e,r){return{x:r.x+(t-r.viewportWidth*.5)/r.zoom,y:r.y+(e-r.viewportHeight*.5)/r.zoom}}function kt(t,e,r){return{x:(t-r.x)*r.zoom+r.viewportWidth*.5,y:(e-r.y)*r.zoom+r.viewportHeight*.5}}function Wt(t,e,r=Me){return{cq:Math.floor(t/r),cr:Math.floor(e/r)}}function vt(t,e){return`${t},${e}`}function Fe(t,e){return`${t},${e}`}function Ar(t,e=2){let r=t.viewportWidth*.5/t.zoom,o=t.viewportHeight*.5/t.zoom,i=[{x:t.x-r,y:t.y-o},{x:t.x+r,y:t.y-o},{x:t.x-r,y:t.y+o},{x:t.x+r,y:t.y+o}],n=1/0,s=-1/0,l=1/0,d=-1/0;for(let a of i){let c=et(a.x,a.y);c.q<n&&(n=c.q),c.q>s&&(s=c.q),c.r<l&&(l=c.r),c.r>d&&(d=c.r)}return{minQ:n-e,maxQ:s+e,minR:l-e,maxR:d+e}}function cn(t,e=Me,r=3){let o=Ar(t,r),i=Math.floor(o.minQ/e),n=Math.floor(o.maxQ/e),s=Math.floor(o.minR/e),l=Math.floor(o.maxR/e),d=et(t.x,t.y),a=d.q/e,c=d.r/e,h=[];for(let f=s;f<=l;f++)for(let m=i;m<=n;m++){let g=m+.5-a,x=f+.5-c;h.push({cq:m,cr:f,dist2:g*g+x*x})}return h.sort((f,m)=>f.dist2-m.dist2),h.map(({cq:f,cr:m})=>({cq:f,cr:m}))}function un(t,e,r,o=0){let i=(t^Math.imul(e,374761393)^Math.imul(r,668265263)^Math.imul(o,2246822519))>>>0;return i=Math.imul(i^i>>>15,2246822519)>>>0,i=Math.imul(i^i>>>13,3266489917)>>>0,(i^i>>>16)>>>0}function kr(t){let e=2166136261;for(let r=0;r<t.length;r++)e^=t.charCodeAt(r),e=Math.imul(e,16777619)>>>0;return e>>>0}function Qt(t,e){let r=256*(t+e*.5),o=je*e,i=[];for(let n=0;n<6;n++){let s=-Math.PI/2+n*Math.PI/3;i.push({x:r+Ze*Math.cos(s),y:(o+Ze*Math.sin(s))*De})}return i}function lt(t,e,r){let o=Qt(t,e),i=o[(r%6+6)%6],n=o[((r+1)%6+6)%6];return{a:i,b:n,mid:{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}}function ot(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Pe[s][0]===i&&Pe[s][1]===n)return s;return-1}function Ft(t,e,r,o){return t<r||t===r&&e<=o?{q1:t,r1:e,q2:r,r2:o,key:`${t},${e}|${r},${o}`}:{q1:r,r1:o,q2:t,r2:e,key:`${r},${o}|${t},${e}`}}function dn(t,e){let r=et(t,e),o=0,i=1/0;for(let a=0;a<6;a++){let{mid:c}=lt(r.q,r.r,a),h=t-c.x,f=e-c.y,m=h*h+f*f;m<i&&(i=m,o=a)}let[n,s]=Pe[o],l=Ft(r.q,r.r,r.q+n,r.r+s),d=ot(l.q1,l.r1,l.q2,l.r2);return{q1:l.q1,r1:l.r1,q2:l.q2,r2:l.r2,dir:d}}var ct={mode:"canopy",canopyCover:.82,canopyVariation:.15,gladeRate:.1,edgeStrength:.72,openTreeChance:.18},er=new Set(["dead_trees","snow_dead_trees"]),Fr=new Set(["fallen_logs","snow_fallen_logs"]),So=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs"]),Co=new Set(["dead_trees","snow_dead_trees","fallen_logs","snow_fallen_logs","deadwood"]),Jt=new Set(["snowfields","frozen_tundra","tundra","highland"]);var fn=new Set(["savanna","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),mn=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert","dry_ground"]),Ct=new Set(["snowfields","frozen_tundra"]),Lt=new Set(["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),Lr=new Set(["sparse_pasture","pasture","grassland","savanna","dry_ground","rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"]),pn=new Set(["grassland","pasture","sparse_pasture","moor","marshland","swamp"]),Mo=new Set([...pn,"savanna","jungle"]);function rt(t,e,r){return t<e?e:t>r?r:t}function K(t,e,r,o=0,i=97,n=513,s=11){let l=(t|0)^Math.imul(e+i,374761393)^Math.imul(r+n,668265263)^Math.imul(o+s,2246822519);return l^=l>>>13,l=Math.imul(l,1274126177),((l^l>>>16)>>>0)/4294967296}function Dt(t){return!!t&&t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(t.id??"")}function Ro(t){return!!t&&t.family==="stones"&&/^boulder_(?:2[1-9]|3[0-5])$/.test(t.id??"")}var It=new Set(["ocean","coastal_water","stormy_ocean"]);function xt(t){return t?t.tags?.includes("water_boulder")?!0:t.kind==="rock"&&t.family==="stones"&&/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(t.id??""):!1}function tr(t){if(!t)return!1;if(t.kind==="ground_decal"||t.family==="ground_decal")return!0;let e=t.tags??[];return e.includes("micro_decal")||e.includes("ground_decal")}function Dr(t){return t?t.tags?.includes("bush_20_29")?!0:/^(?:existing_)?bush_2[0-9]$/.test(t.id??""):!1}function Ir(t){return!!t&&(t.family==="reeds"||/^(?:existing_)?schilf\d+$/i.test(t.id??""))}function rr(t){return!!t&&t.kind==="rock"&&(t.family==="stones"||/^boulder[_-]?\d+$/i.test(t.id??""))}function nr(t){return!!t&&t.kind==="ground_cover"&&/^dry_patch_(?:0[1-9]|1[0-5])$/.test(t.id??"")}function qr(t){return!!t&&t.family==="savanna_trees"&&/^existing_schirmakazie_?\d+$/.test(t.id??"")}function gn(t){return t==="semi_desert"?.42:t==="savanna"?.38:t==="sparse_pasture"||t==="sandy_desert"||t==="rocky_desert"||t==="sandy_rocky_desert"||t==="desert"?.34:t==="clay_desert"||t==="badlands"||t==="sandy_badlands"||t==="rocky_badlands"||t==="wasteland"||t==="dry_ground"?.3:t==="pasture"?.06:t==="grassland"?.04:Lr.has(t)?.14:0}function Br(t){if(!t||t.kind==="mountain")return 1;let e=t.kind==="tree"?.5:.7;return t.family==="stones"&&(t.kind==="rock"||t.kind==="cluster")?e*1.2*(Dt(t)?.32:.25):Co.has(t.family??"")?e:e*1.2}function or(t){let e=t?.family??"";return e==="snow_conifers"||e==="snow_dead_trees"||e==="snow_fallen_logs"||e==="snow_deadwood"||e==="snow_bushes"||e==="snow_mountains"}function Mt(t){if(!t||t.kind==="mountain")return 1;let e=Br(t),r=t.family??"",o=qt(t)==="cacti"?1.55:1;return er.has(r)?.58*e:Fr.has(r)?.71*e:r==="deadwood"?.72*e:t.kind==="tree"?t.sizeClass==="giant"?.65*e*1.1:(t.sizeClass==="large"?.69:t.sizeClass==="medium"?.72:.77)*e*1.1:t.kind==="shrub"?(t.sizeClass==="medium"?.73:t.sizeClass==="large"?.71:.82)*e*o:t.kind==="cluster"?.77*e*o:t.kind==="ground_decal"?.46*e:t.kind==="ground_cover"?.84*e*o:(t.kind==="special"?.85:1)*e*o}function bn(t){return!!t&&t.kind==="tree"&&!er.has(t.family??"")}function vn(t){return!!t&&So.has(t.family??"")}function yn(t){let e=t?.family??"";return er.has(e)?"dead_trees":Fr.has(e)?"fallen_logs":null}function xn(t){let e=t?.family??"";return er.has(e)?.11:Fr.has(e)?.16:e==="deadwood"?.4:t?.kind==="cluster"?.76:t?.kind==="shrub"?.93:t?.kind==="ground_cover"?1.1:1}function wn(t){let e=Math.max(1,t);return{dead_trees:Math.max(1,Math.floor(e/16)),fallen_logs:Math.max(1,Math.floor(e/15))}}function _n(t){return(String(t.sourceReference??"").match(/(?:^|[/\\:\s])((?:cactus|kaktus|cacti|sukkulent(?:e|en)?|boulder|dry[_ -]?patch)[_ -]?\d{1,2})\.(?:png|webp|jpe?g|avif)(?:\s|$)/i)?.[1]??"").toLowerCase().replace(/[ -]/g,"_")}function qt(t){let e=_n(t);return/^(?:cactus|kaktus|cacti)_?\d{1,2}$/.test(e)||/^(?:cactus|kaktus|cacti)(?:[_-]?\d+)?$/i.test(t.id??"")?"cacti":/^sukkulent(?:e|en)?_?\d{1,2}$/.test(e)?"succulents":t.family??""}function Bt(t){let e=String(t.id??""),r=_n(t);return xt(t)||/^boulder_(?:5[5-9]|6\d|7[0-4])$/.test(r)?It:/^dry_patch_(?:0[1-9]|1[0-5])$/.test(r)||nr(t)?Lr:/^boulder_(?:2[1-9]|3[0-5])$/.test(r)?Jt:/^boulder_(?:3[6-9]|4\d|5[0-4])$/.test(r)?fn:Ro(t)||t.family==="snow_bushes"||/^snowy_bush(?:_\d+)?$/.test(e)||t.family==="snow"&&/^snow_patch_\d+/i.test(e)?Jt:Dt(t)?fn:/^(?:existing_)?baumstumpf_(?:1[6-9]|20)$/.test(e)?Mo:/^snow_mountain_\d+$/.test(e)||t.family==="snow_mountains"?new Set(["snowfields","frozen_tundra"]):/^(?:existing_)?berg_(?:1[4-6])$/.test(e)?new Set(["snowfields"]):/^(?:existing_)?berg_(?:1[7-9]|2[01])$/.test(e)?pn:/^ice_block_0?[1-5]$/.test(e)||/^(?:existing_)?eisblock_0?[1-5]$/.test(e)||t.family==="ice_blocks"?new Set(["snowfields","frozen_tundra","tundra"]):null}function Sn(t,e){let r=e.nature.presets??{},o=t.terrainPresetId?r[t.terrainPresetId]:void 0,i=new Set([...o?.categoryIds??o?.allowedTerrainCategories??[],...t.allowedTerrainCategories??[]]),n=new Set([...o?.typeIds??o?.allowedTerrainTypes??[],...t.allowedTerrainTypes??[]]),s=new Set([...o?.excludeIds??o?.excludedTerrainTypes??[],...t.excludedTerrainTypes??[]]),l=new Set;for(let[d,a]of Object.entries(e.terrain.byType))s.has(d)||(a.categoryId&&i.has(a.categoryId)||n.has(d))&&l.add(d);return l}function Wr(t,e,r,o,i,n=!1){if(!e)return!1;let s=o.terrain.byType[e];if(xt(t))return It.has(e);if(s&&s.materialClass!=="ground")return!1;let d=i?i.ecoFamily:qt(t),a=e,c=i?i.strict:Bt(t);if(c)return c.has(a);let h=n||r.some(x=>{let S=o.terrain.byType[x]?.materialClass;return S==="water"||S==="shoreline"}),f=r.some(x=>x==="jungle"||x==="savanna"),m=r.some(x=>x==="moor"||x==="swamp"||x==="marshland");if(d==="mangroves")return(a==="swamp"||a==="marshland")&&(h||f);if(d==="palms")return a==="jungle"||a==="savanna"||a==="tropical_coast"||Lt.has(a);if(d==="jungle_trees"||d==="tropical_bushes")return a==="jungle";if(d==="savanna_trees")return a==="savanna"||a==="semi_desert"||qr(t)&&Lt.has(a);if(d==="cacti")return a==="rocky_desert"||a==="sandy_desert"||a==="clay_desert"||a==="desert"||a==="semi_desert"||a==="sandy_rocky_desert"||a==="savanna";if(d==="succulents")return a==="savanna"||a==="semi_desert"||a==="rocky_desert"||a==="sandy_desert"||a==="sandy_rocky_desert"||a==="badlands"||a==="desert";if(d==="ferns")return a==="forest_floor"||a==="grassland"||a==="pasture"||a==="moor"||a==="swamp"||a==="marshland"||a==="jungle";if(d==="reeds")return a==="moor"||a==="swamp"||a==="marshland"||(a==="grassland"||a==="pasture"||a==="sparse_pasture")&&(h||m);if(d==="cold_bushes")return a==="tundra"||a==="frozen_tundra"||a==="highland";if(d==="snow_conifers"||d==="snow_dead_trees"||d==="snow_deadwood"||d==="snow_fallen_logs")return Jt.has(a);if(d==="riparian_trees")return a==="moor"||a==="swamp"||a==="marshland"||(a==="grassland"||a==="pasture")&&(h||m);let g=/(?:snow|schnee|verschneit|winter)/i.test([t.id??"",...t.tags??[]].join(" "));return(a==="snowfields"||a==="frozen_tundra")&&!g?!1:d==="dry_patches"?Lr.has(a):Dr(t)?!(a==="jungle"||a==="moor"||a==="swamp"||a==="marshland"||a==="snowfields"||a==="frozen_tundra"):d==="dry_bushes"?!(a==="jungle"||a==="moor"||a==="swamp"||a==="marshland"||a==="tundra"||a==="highland"):d==="herbs"?!(a==="jungle"||a==="swamp"||a==="marshland"||a==="ocean"||a==="snowfields"||a==="frozen_tundra"):d==="flowering_bushes"||d==="temperate_bushes"||d==="heath"?!(a==="jungle"||a==="rocky_desert"||a==="sandy_desert"||a==="clay_desert"):!0}function Cn(t,e,r,o,i){if(t.kind==="mountain"||t.artStatus==="deprecated"||(t.placement?.density??0)<=0||(t.placement?.weight??1)<=0)return!1;let n=r.baseBiome,s=r.biome||n;if(xt(t))return It.has(n)&&e.has(n);if(Dt(t)&&(n==="jungle"||s==="jungle"))return!1;let l=o.terrain.byType[n],d=o.terrain.byType[s];if(l?.materialClass!=="ground"||d?.materialClass!=="ground")return!1;let a=i?i.strict:Bt(t);if(a){if(!a.has(n))return!1}else if(t.family==="stones"&&(n==="snowfields"||n==="frozen_tundra"))return!1;let c=n==="jungle"||n==="savanna",h=r.forestClass==="light_forest"||r.forestClass==="dense_forest",f=i?i.ecoFamily:qt(t),m=s==="jungle",g=n==="moor"||n==="swamp"||n==="marshland";if(m&&!c||t.family==="palms"&&(!(c||Lt.has(n))||g||Jt.has(n))||(t.family==="jungle_trees"||t.family==="tropical_bushes")&&!m||h&&(f==="cacti"||f==="succulents"||f==="dry_bushes")||!(e.has(s)||e.has(n)||h&&e.has("forest_floor")&&t.family!=="palms"))return!1;let S=!!r.hasRiverEdge;return a?Wr(t,n,r.neighborTypes,o,i,S):t.family!=="jungle_trees"&&t.family!=="tropical_bushes"&&!Wr(t,n,r.neighborTypes,o,i,S)?!1:Wr(t,s,r.neighborTypes,o,i,S)}function Mn(t,e,r,o){if(t.kind!=="mountain"||!r)return!1;let i=o.terrain.byType[r];if(!i||i.materialClass!=="ground")return!1;let n=Bt(t);return n&&!n.has(r)?!1:e.has(r)}function Eo(t,e){let r=e.terrain.byType[t];if(r?.materialClass==="water"||r?.materialClass==="shoreline"||t==="ocean"||t==="coastal_water"||t==="icy_ocean"||t==="stormy_ocean"||t==="coast")return 0;if(t==="jungle")return 1;if(t==="forest_floor")return .98;switch(r?.categoryId){case"grass_pasture":return .9;case"wetlands":return .83;case"warm_regions":return .75;case"cold_regions":return t==="snowfields"?.35:.7;case"arid_regions":return t==="savanna"||t==="semi_desert"?.36:.15;case"demo_regions":return t==="hilly_ground"||t==="mountain_ground"?.6:.67;default:return .55}}function hn(t,e,r){let o=e/3,i=r/3,n=Math.floor(o),s=Math.floor(i),l=o-n,d=i-s,a=l*l*(3-2*l),c=d*d*(3-2*d),h=K(t,n,s,2301,8191,4093,17),f=K(t,n+1,s,2301,8191,4093,17),m=K(t,n,s+1,2301,8191,4093,17),g=K(t,n+1,s+1,2301,8191,4093,17);return 2*((h+(f-h)*a)*(1-c)+(m+(g-m)*a)*c)-1}function Rn(t,e,r,o){let i=new Map,n=o?.mode==="classic"||o?.mode==="dense"?o.mode:ct.mode,s=rt(o?.canopyCover??ct.canopyCover,.35,.98),l=rt(o?.canopyVariation??ct.canopyVariation,0,.3),d=rt(o?.gladeRate??ct.gladeRate,0,.3),a=rt(o?.edgeStrength??ct.edgeStrength,0,1);for(let c of t){let h=Fe(c.q,c.r),f=c.terrainId==="jungle",m=Eo(c.terrainId,e),g=rt(c.forestDensity||0,0,1),x,S;if(f){let I=.5+.5*hn(r+137,c.q,c.r),D=.5+.5*Math.sin(c.q*.62-c.r*.44+r%71)*Math.cos(c.q*.37+c.r*.71),v=rt(.46+.42*I+.14*D,.36,.98),M=g>.01?rt(g*(.68+.34*v),.32,.98):v;x=M>=.62?"dense_forest":"light_forest",S=M}else x=c.forestClass??(c.forestDensity>=.65?"dense_forest":c.forestDensity>.08?"light_forest":"none"),S=x==="none"?0:g>.01?g:x==="dense_forest"?1:.44;i.set(h,{q:c.q,r:c.r,key:h,baseBiome:c.terrainId,biome:f?"jungle":c.terrainId,jungle:f,suitability:m,forestMode:n,forestClass:m>0?x:"none",baseDensity:m>0?S:0,edgeInfluence:0,density:0,canopyCoverage:0,glade:!1,gladeX:0,gladeY:0,gladeRadius:0})}for(let c of i.values()){if(!c.suitability)continue;let h=0;for(let[f,m]of Pe){let g=i.get(Fe(c.q+f,c.r+m));g&&g.baseDensity>h&&(h=g.baseDensity)}c.edgeInfluence=rt(h*(c.baseDensity?.18:.48)*a*c.suitability,0,.46),c.density=rt(c.baseDensity+c.edgeInfluence,0,1)}if(n==="canopy"&&d>0){let c=rt(d*.55,0,.19),h=[];for(let f of i.values()){if(f.forestClass!=="dense_forest")continue;let m=0;for(let[I,D]of Pe)i.get(Fe(f.q+I,f.r+D))?.forestClass==="dense_forest"&&m++;if(m<2)continue;let g=K(r,f.q,f.r,1864,8191,4093,17),x=f.jungle?c*.62:c;if(g>=x)continue;let S=!1;for(let I=-2;I<=2&&!S;I++)for(let D=-2;D<=2;D++){if(D===0&&I===0||Math.abs(D+I)>2)continue;let v=i.get(Fe(f.q+D,f.r+I));if(!(!v||v.forestClass!=="dense_forest")&&K(r,v.q,v.r,1864,8191,4093,17)<g){S=!0;break}}S||h.push(f)}for(let f of h){f.glade=!0;let m=f.jungle?.45:.84;if(K(r,f.q,f.r,1954,8191,4093,17)<m){let g=null,x=1/0;for(let[S,I]of Pe){let D=i.get(Fe(f.q+S,f.r+I));if(!D||D.forestClass!=="dense_forest"||D.jungle!==f.jungle)continue;let v=K(r,D.q,D.r,1953,8191,4093,17);v<x&&(x=v,g=D)}g&&(g.glade=!0)}}}for(let c of i.values()){if(!c.suitability)continue;if(c.glade){c.gladeX=Math.round((K(r,c.q,c.r,2041,8191,4093,17)-.5)*52),c.gladeY=Math.round((K(r,c.q,c.r,2042,8191,4093,17)-.5)*40);let g=c.jungle?46:58;c.gladeRadius=g+Math.round(K(r,c.q,c.r,2043,8191,4093,17)*18)}let h=c.forestClass==="dense_forest"?1:c.forestClass==="light_forest"?c.jungle?.62:.49:c.edgeInfluence>.08?.17:0,f=hn(r,c.q,c.r),m=rt(s+l*f,.12,.98);c.canopyCoverage=rt(m*h*(.58+.42*c.density)*c.suitability*(c.glade?c.jungle?.34:.24:1),0,.98)}return i}function En(t){if(!t?.suitability)return 0;if(t.glade)return Math.max(3,Math.min(6,Math.round(3+3*(t.baseDensity||t.density||0))));if(t.forestMode==="classic")return t.forestClass==="dense_forest"?5+Math.round(2*t.density):t.forestClass==="light_forest"?3+Math.round(2*t.density):t.density>.18?1:0;let e=t.canopyCoverage||0;return t.forestClass==="dense_forest"?t.forestMode==="canopy"?Math.max(6,Math.round(6+e*21)):Math.max(5,Math.round(5+e*15)):t.forestClass==="light_forest"?t.forestMode==="canopy"?Math.max(3,Math.round(3+e*15)):Math.max(3,Math.round(3+e*11)):t.density>.18?2:t.density>.1?1:0}function Tn(t){return t?.suitability?t.glade?12:t.forestMode==="canopy"?t.forestClass==="dense_forest"?36:t.forestClass==="light_forest"?22:t.edgeInfluence>.1?6:4:t.forestMode==="dense"?t.forestClass==="dense_forest"?27:t.forestClass==="light_forest"?18:t.edgeInfluence>.1?5:4:t.forestClass==="dense_forest"?11:t.forestClass==="light_forest"?7:t.edgeInfluence>.1?5:4:0}function Ur(t,e,r){if(!t?.glade)return!1;let o=t.gladeRadius||65,i=(e-t.gladeX)/o,n=(r-t.gladeY)/(o*.9);return i*i+n*n<.94*.94}function Pn(t,e){return e?.jungle?!(t==="savanna_trees"||t==="conifers"||t==="snow_conifers"||t==="deciduous_trees"||t==="dry_bushes"):!0}function Ut(t,e,r,o){let i=o==="ground_cover"?727:o==="shrub"?311:o==="tree"?521:101,n=.5*K(t,e,r,i,173,311,79);for(let[s,l]of Pe)n+=.5/6*K(t,e+s,r+l,i,173,311,79);return rt(1+(n-.5)*1.5,.6,1.4)}function An(t,e,r,o,i,n){let l=(o==="ground_cover"?737:o==="shrub"?313:o==="tree"?521:149)+17,d=(K(t,e,r,l,173,311,79)-.5)*154,a=(K(t,e,r,l+1,173,311,79)-.5)*146,c=K(t,e,r,i*127+n*2+17,173,311,79),h=K(t,e,r,i*127+n*2+18,173,311,79),f=(c-.5)*242,m=(h-.5)*258,g=n>=26?0:o==="tree"?.43:.68,x=o==="tree"?170:126,S=d+(c-.5)*x,I=a+(h-.5)*x;return{dx:f*(1-g)+S*g,dy:m*(1-g)+I*g}}function ir(t,e,r=0){let o=Math.abs(t),i=Math.abs(e);return i<=Ze-r&&o<=Math.min(128,Math.sqrt(3)*(Ze-i))-r}function kn(t,e,r,o){return o?.forestClass==="dense_forest"&&!o.glade||o?.forestClass==="light_forest"?!1:K(t,Math.floor(e/2),Math.floor(r/2),601,613,1379,41)<.16}var ar=128,Ht=78,Et={enabled:!0,strength:Ht,lighting:!0,style:"sculpted"},Hr=168,Or=127,Gt=Hr+Or;function dt(t,e,r){return t<e?e:t>r?r:t}function Rt(t){let e=dt(t,0,1);return e*e*(3-2*e)}function Wn(t){let e=(t|0)^1831565813;return e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296}function sr(t,e,r){let o=Math.imul(t,374761393)^Math.imul(e,668265263)^Math.imul(r,1442695041)|0;return o=Math.imul(o^o>>>13,1274126177),((o^o>>>16)>>>0)/4294967296}function Gr(t,e,r){let o=Math.floor(t),i=Math.floor(e),n=t-o,s=e-i,l=n*n*n*(n*(n*6-15)+10),d=s*s*s*(s*(s*6-15)+10),a=sr(o,i,r),c=sr(o+1,i,r),h=sr(o,i+1,r),f=sr(o+1,i+1,r);return(a+(c-a)*l)*(1-d)+(h+(f-h)*l)*d}function To(t,e,r){let o=Gr(t/380,e/380,r^324508639),i=(t*.7986355-e*.601815)/195,n=(t*.601815+e*.7986355)/195,s=Gr(i,n,r^610839777),l=(t*.3255682-e*.9455186)/105,d=(t*.9455186+e*.3255682)/105,a=Gr(l,d,r^916255320);return{plainSwell:o*.78+s*.22,ridgeDetail:o*.34+s*.46+a*.2}}function Fn(t,e){return t?e.terrain.byType[t.terrainId]?.materialClass==="water":!1}function Po(t,e){if(t.terrainId==="jungle"||t.terrainId==="snowfields"||t.terrainId==="frozen_tundra")return 0;let r=e.terrain.byType[t.terrainId];if(r?.materialClass==="water")return 0;let o=t.forestClass;if(o!=="dense_forest"&&o!=="light_forest")return 0;let i=r?.categoryId??"";return(i==="wetlands"?.3:i==="cold_regions"?.25:i==="arid_regions"?.22:.72)*(o==="dense_forest"?1:.58)}function Ln(t,e,r,o=Ht,i="sculpted"){let n=[],s=[];for(let d=0;d<t.length;d++){let a=t[d],c=256*(a.q+a.r*.5),h=je*a.r;if(Fn(a,e)){s.push({x:c,y:h});continue}if(a.reliefClass!=="hills")continue;let f=dt(a.hillStrength??.7,0,1);if(f<=0)continue;let m=(Math.imul(a.q,73856093)^Math.imul(a.r,19349663)^r)>>>0,g=(Wn(m)-.5)*1.7,x=a.hillProfile||"rounded",S=x==="ridge"||x==="chain"?560:440;n.push({x:c,y:h,ca:Math.cos(g),sa:Math.sin(g),shape:x,weight:.42+.58*f,reach:S})}let l=o>0?i==="sculpted"?112*(o/100):67*(o/100)*1.2:0;return{hills:n,waters:s,strengthPct:o,heightGain:l,seedInt:r,style:i}}function Dn(t,e,r){let o=e*t.ca+r*t.sa,i=-e*t.sa+r*t.ca;return t.shape==="ridge"?Math.exp(-.5*((o/305)**2+(i/112)**2)):t.shape==="chain"?Math.exp(-.5*((o/280)**2+(i/146)**2)):t.shape==="steep"?Math.exp(-.68*Math.pow(Math.hypot(o/172,i/158),3.1)):t.shape==="plateau"?1-Rt((Math.hypot(o/188,i/170)-.55)/.78):Math.exp(-.5*((o/176)**2+(i/180)**2))}function In(t,e,r,o,i,n,s,l){if(n<=0||e<=.004)return 0;if(l==="classic")return t<=1e-4?0:n*(1-Math.exp(-t*.55))*e;let{plainSwell:d,ridgeDetail:a}=To(r,o,s),c=Math.max(0,d-.38)*14*(i/100)*e;if(t<=1e-4)return c;let h=1-Math.exp(-t*.76),f=n*h*(.76+.42*a)*e;return Math.min(ar,f+c*.55)}function qn(t,e,r){if(t.heightGain<=0)return 0;let o=0,i=t.waters,n=Gt*Gt;for(let a=0;a<i.length;a++){let c=i[a],h=e-c.x,f=r-c.y;if(Math.abs(h)>Gt||Math.abs(f)>Gt)continue;let m=h*h+f*f;if(m<n){let g=1-Rt((Math.sqrt(m)-Hr)/Or);g>o&&(o=g)}}let s=1-o;if(s<=.004)return 0;let l=0,d=t.hills;for(let a=0;a<d.length;a++){let c=d[a],h=e-c.x,f=r-c.y;Math.abs(h)>c.reach||Math.abs(f)>c.reach||(l+=Dn(c,h,f)*c.weight)}return In(l,s,e,r,t.strengthPct,t.heightGain,t.seedInt,t.style)}function Bn(t){let e=t.step??16,r=Math.max(4,Math.min(220,Math.ceil(t.width/e)+1)),o=Math.max(4,Math.min(170,Math.ceil(t.height/e)+1)),i=t.width/(r-1),n=t.height/(o-1),s=1/i,l=1/n,d=r*o,a=new Float32Array(d),c=new Float32Array(d),h=new Float32Array(d),f=new Float32Array(d),m=new Float32Array(d),g=new Float32Array(d),x=new Float32Array(d),S=520,I=Math.floor((t.top-S)/je)-2,D=Math.ceil((t.top+t.height+S)/je)+2,v=t.reliefStyle??"sculpted",M=t.reliefStrength??Ht,j=M>0?v==="sculpted"?112*(M/100):67*(M/100)*1.2:0,w=(L,C,G,ee,B,P)=>{let Y=Math.max(0,Math.floor((C-P-t.left)*s)),le=Math.min(r-1,Math.ceil((C+P-t.left)*s)),oe=Math.max(0,Math.floor((G-P-t.top)*l)),X=Math.min(o-1,Math.ceil((G+P-t.top)*l)),_=P*P;for(let W=oe;W<=X;W++){let E=t.top+W*n-G,q=E*E,u=W*r;for(let p=Y;p<=le;p++){let y=t.left+p*i-C,k=y*y+q;if(k>=_)continue;let F=1-Rt((Math.sqrt(k)-ee)/B);F>L[u+p]&&(L[u+p]=F)}}};for(let L=I;L<=D;L++){let C=Math.floor((t.left-S)/256-L*.5)-2,G=Math.ceil((t.left+t.width+S)/256-L*.5)+2;for(let ee=C;ee<=G;ee++){let B=t.lookupHex(ee,L);if(!B||B.fogState===0)continue;let P=256*(ee+L*.5),Y=je*L;if(Fn(B,t.manifest)){w(h,P,Y,Hr,Or,Gt),w(f,P,Y,108,48,160);continue}if((B.terrainId==="snowfields"||B.terrainId==="frozen_tundra"||B.terrainId==="jungle")&&w(f,P,Y,108,48,160),j>0&&B.reliefClass==="hills"){let X=dt(B.hillStrength??.7,0,1);if(X>0){let _=(Math.imul(ee,73856093)^Math.imul(L,19349663)^t.seedInt)>>>0,W=(Wn(_)-.5)*1.7,E=B.hillProfile||"rounded",q=E==="ridge"||E==="chain"?560:440,u={x:P,y:Y,ca:Math.cos(W),sa:Math.sin(W),shape:E,weight:.42+.58*X,reach:q},p=Math.max(0,Math.floor((P-q-t.left)*s)),y=Math.min(r-1,Math.ceil((P+q-t.left)*s)),k=Math.max(0,Math.floor((Y-q-t.top)*l)),F=Math.min(o-1,Math.ceil((Y+q-t.top)*l));for(let H=k;H<=F;H++){let $=t.top+H*n-Y,N=H*r;for(let se=p;se<=y;se++){let ue=t.left+se*i-P,Q=Dn(u,ue,$);Q>1e-4&&(a[N+se]+=Q*u.weight)}}}}let oe=Po(B,t.manifest);if(oe>.01){let _=Math.max(0,Math.floor((P-172-t.left)*s)),W=Math.min(r-1,Math.ceil((P+172-t.left)*s)),E=Math.max(0,Math.floor((Y-172-t.top)*l)),q=Math.min(o-1,Math.ceil((Y+172-t.top)*l)),u=29584;for(let p=E;p<=q;p++){let y=t.top+p*n-Y,k=y*y,F=p*r;for(let H=_;H<=W;H++){let $=t.left+H*i-P,N=$*$+k;if(N>=u)continue;let se=1-Rt((Math.sqrt(N)-110)/56);if(se>0){let ue=F+H,Q=m[ue]+se*1.15;m[ue]=Q>1?1:Q,oe>g[ue]&&(g[ue]=oe)}}}if(B.glade){let p=P+(B.gladeX??0),y=Y+(B.gladeY??0),k=B.gladeRadius??64,F=[[0,0,1],[.38,-.25,.6],[-.34,.28,.67]];for(let[H,$,N]of F){let se=p+k*H,ue=y+k*$,Q=k*N,Re=Q*Q,z=Math.max(0,Math.floor((se-Q-t.left)*s)),J=Math.min(r-1,Math.ceil((se+Q-t.left)*s)),te=Math.max(0,Math.floor((ue-Q-t.top)*l)),ve=Math.min(o-1,Math.ceil((ue+Q-t.top)*l));for(let ye=te;ye<=ve;ye++){let be=t.top+ye*n-ue,We=be*be,xe=ye*r;for(let Ae=z;Ae<=J;Ae++){let pe=t.left+Ae*i-se,Ie=pe*pe+We;if(Ie>=Re)continue;let qe=1-Rt((Math.sqrt(Ie)-Q*.14)/(Q*.86)),Be=xe+Ae;qe>x[Be]&&(x[Be]=qe)}}}}}}}for(let L=0;L<o;L++){let C=t.top+L*n,G=L*r;for(let ee=0;ee<r;ee++){let B=G+ee,P=1-h[B];if(P<=.004||j<=0)continue;let Y=t.left+ee*i;c[B]=In(a[B],P,Y,C,M,j,t.seedInt,v)}}let b=new Uint8Array(d*4),R=Math.max(1,(i+n)*.5);for(let L=0;L<o;L++){let C=L>0?L-1:0,G=L<o-1?L+1:o-1,ee=Math.max(1,(G-C)*n),B=L*r;for(let P=0;P<r;P++){let Y=P>0?P-1:0,le=P<r-1?P+1:r-1,oe=Math.max(1,(le-Y)*i),X=B+P,_=c[X],W=c[B+Y],E=c[B+le],q=c[C*r+P],u=c[G*r+P],p=(E-W)/oe,y=(u-q)/ee,k;if(v==="sculpted"){let N=((W+E+q+u)*.25-_)/R,se=dt(-N*1.45,-.1,.12);k=dt(1-2.45*p-.65*y+se,.6,1.36)}else k=dt(1-2.15*p-.48*y,.66,1.32);let F=1-f[X],H=m[X]>.01&&F>.01?Rt((m[X]-.12)/.72)*g[X]*(1-x[X]*.94)*F:0,$=X*4;b[$]=Math.round(dt(_/ar,0,1)*255),b[$+1]=Math.round(dt((k-.52)/.96,0,1)*255),b[$+2]=Math.round(dt(H,0,1)*255),b[$+3]=Math.round(dt(1-h[X],0,1)*255)}}return{left:t.left,top:t.top,width:t.width,height:t.height,cols:r,rows:o,step:e,rgba:b,heights:c}}function Un(t,e,r){if(!t)return 0;let o=(e-t.left)/t.width*(t.cols-1),i=(r-t.top)/t.height*(t.rows-1);if(o<0||i<0||o>=t.cols-1||i>=t.rows-1)return 0;let n=Math.floor(o),s=Math.floor(i),l=o-n,d=i-s,a=s*t.cols+n,c=t.heights[a],h=t.heights[a+1],f=t.heights[a+t.cols],m=t.heights[a+t.cols+1];return(c*(1-l)+h*l)*(1-d)+(f*(1-l)+m*l)*d}var Nr=65536,lr=16,ft={earth:{r:151/255,g:125/255,b:93/255,rock:.22},forest:{r:113/255,g:111/255,b:84/255,rock:.26},rock:{r:166/255,g:157/255,b:137/255,rock:.92},marsh:{r:96/255,g:108/255,b:74/255,rock:.14},sand:{r:185/255,g:150/255,b:105/255,rock:.24},frost:{r:177/255,g:186/255,b:186/255,rock:.3}};function Ao(t){if(!t)return ft.earth;let e=String(t.terrainId||"").toLowerCase(),r=t.reliefClass;return/snow|frozen|tundra|glaci|icefield|winter/.test(e)?ft.frost:r==="mountain"||/mountain|highland|cliff|stone|rock|alpine|ridge/.test(e)?ft.rock:/swamp|marsh|bog|mire|wetland|moor/.test(e)?ft.marsh:/desert|dune|arid|savanna|dry|steppe|badland|waste/.test(e)?ft.sand:/forest|wood|jungle|taiga/.test(e)||(t.forestDensity??0)>.25||t.forestClass&&t.forestClass!=="none"?ft.forest:r==="hills"?ft.rock:ft.earth}var ko=`#version 300 es
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
`,Wo=`#version 300 es
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
`;function cr(t,e){return{x:256*(t+e*.5),y:je*e}}function Ot(t,e){let r=cr(t,e),o=[];for(let i=0;i<6;i++){let n=-Math.PI/2+i*Math.PI/3;o.push({x:r.x+Ze*Math.cos(n),y:r.y+Ze*Math.sin(n)})}return o}function Xr(t,e,r,o){let i=r-t,n=o-e;for(let s=0;s<6;s++)if(Pe[s][0]===i&&Pe[s][1]===n)return s;return-1}function Fo(t,e,r){let o=Ot(t,e),i=o[r],n=o[(r+1)%6];return{x:(i.x+n.x)*.5,y:(i.y+n.y)*.5}}function Lo(t,e){return Math.abs(t.x-e.x)<.001&&Math.abs(t.y-e.y)<.001}function Gn(t,e){for(let r=0;r<6;r++)if(Lo(t[r],e))return r;return-1}function Vr(t,e,r,o){let i=Ot(t,e),n=Gn(i,r),s=Gn(i,o);if(n<0||s<0)return[r,o];let l=(s-n+6)%6,d=(n-s+6)%6,a=l<=d?1:-1,c=Math.min(l,d),h=[];for(let f=0;f<=c;f++)h.push(i[(n+a*f+12)%6]);return h}function zr(t,e=34,r=!0){if(t.length<3)return t;let o=[t[0]],i=Math.max(12,Math.min(70,e))*.5,n=r?t.length-2:t.length-1;for(let l=1;l<n;l++){let d=t[l-1],a=t[l],c=t[l+1],h=a.x-d.x,f=a.y-d.y,m=c.x-a.x,g=c.y-a.y,x=Math.hypot(h,f),S=Math.hypot(m,g);if(x<1e-4||S<1e-4)continue;if((h*m+f*g)/(x*S)>.995){o.push(a);continue}let D=Math.min(x*.4,S*.4,i*1.4+14),v={x:a.x-h/x*D,y:a.y-f/x*D},M={x:a.x+m/S*D,y:a.y+g/S*D};o.push(v);for(let j=1;j<6;j++){let w=j/6,b=1-w;o.push({x:b*b*v.x+2*b*w*a.x+w*w*M.x,y:b*b*v.y+2*b*w*a.y+w*w*M.y})}o.push(M)}r&&t.length>=2?o.push(t[t.length-2],t[t.length-1]):o.push(t[t.length-1]);let s=[];for(let l=0;l<o.length;l++)(l===0||Math.hypot(o[l].x-s[s.length-1].x,o[l].y-s[s.length-1].y)>1e-4)&&s.push(o[l]);return s}function Nt(t,e=34){let r=t.hexes;if(!r||r.length<2)return null;let o=r.length-1,i=[];for(let P=0;P<o;P++){let[Y,le]=r[P],[oe,X]=r[P+1],_=Xr(Y,le,oe,X);if(_<0)return null;let W=Ot(Y,le);i.push([W[_],W[(_+1)%6]])}let n=Xr(r[0][0],r[0][1],r[1][0],r[1][1]),s=t.corner??(n+3)%6,l=Ot(r[0][0],r[0][1])[s],d=i.map(()=>[1/0,1/0]),a=i.map(()=>[0,0]);for(let P=0;P<2;P++)d[0][P]=Vr(r[0][0],r[0][1],l,i[0][P]).length-1;for(let P=1;P<o;P++)for(let Y=0;Y<2;Y++)for(let le=0;le<2;le++){let oe=Vr(r[P][0],r[P][1],i[P-1][le],i[P][Y]).length-1,X=d[P-1][le]+oe;X<d[P][Y]&&(d[P][Y]=X,a[P][Y]=le)}let c=new Array(o),h=d[o-1][0]<=d[o-1][1]?0:1;for(let P=o-1;P>=0;P--)c[P]=i[P][h],h=a[P][h];let f=[];for(let P=0;P<o;P++){let Y=P===0?l:c[P-1],le=c[P],oe=Vr(r[P][0],r[P][1],Y,le);for(let X=0;X<oe.length;X++)f.push(oe[X])}let m=r[o-1],g=r[o],x=Xr(m[0],m[1],g[0],g[1]);if(x<0)return null;let S=Fo(m[0],m[1],x),I=cr(m[0],m[1]),D=cr(g[0],g[1]),v=D.x-I.x,M=D.y-I.y,j=Math.hypot(v,M)||1,w=v/j,b=M/j,R=Math.max(46,e*2.15);if(f.length>=2){let P=f[f.length-1];f[f.length-1]={x:S.x*.64+P.x*.36-w*38,y:S.y*.64+P.y*.36-b*38}}let L={x:S.x+w*R,y:S.y+b*R};f.push(S,L);let C=[];for(let P=0;P<f.length;P++)(P===0||Math.hypot(f[P].x-C[C.length-1].x,f[P].y-C[C.length-1].y)>1e-4)&&C.push(f[P]);let G=zr(C,e,!1);if(G.length<2)return null;let ee=G.length-2,B=1/0;for(let P=0;P<G.length;P++){let Y=(G[P].x-S.x)**2+(G[P].y-S.y)**2;Y<B&&(B=Y,ee=P)}return{id:t.id,points:G,mouthCrossIdx:ee,mouthCrossPos:S,mouthDirX:w,mouthDirY:b,mouthReach:R,width:e,hasMouth:!0}}function Yr(t,e=34){if(!t||t.length===0)return[];let r=d=>`${Math.round(d.x*2)},${Math.round(d.y*2)}`,o=[],i=new Set,n=new Map;for(let d of t){let a=(d.dir%6+6)%6,c=Ot(d.q,d.r),h=c[a],f=c[(a+1)%6],m=r(h),g=r(f),x=m<g?`${m}|${g}`:`${g}|${m}`;if(i.has(x))continue;i.add(x);let S=o.length;o.push({a:h,b:f,ka:m,kb:g,used:!1});let I=n.get(m)??[];I.push(S),n.set(m,I);let D=n.get(g)??[];D.push(S),n.set(g,D)}let s=[],l=(d,a)=>{let c=o[d];c.used=!0;let h=a?[c.a,c.b]:[c.b,c.a],f=a?c.kb:c.ka;for(;;){let m=n.get(f);if(!m)break;let g=-1;for(let S of m)if(!o[S].used){g=S;break}if(g<0)break;let x=o[g];x.used=!0,x.ka===f?(h.push(x.b),f=x.kb):(h.push(x.a),f=x.ka)}return h};for(let d=0;d<2;d++)for(let a=0;a<o.length;a++)if(!o[a].used)if(d===0){let c=n.get(o[a].ka)?.length??0,h=n.get(o[a].kb)?.length??0;if(c!==1&&h!==1)continue;let f=l(a,c===1);s.push({id:`edge_${a}`,points:zr(f,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}else{let c=l(a,!0);s.push({id:`edge_${a}`,points:zr(c,e,!1),mouthCrossIdx:-1,width:e,hasMouth:!1})}return s}var ur=class{constructor(e){this.verts=new Float32Array(Nr*lr);this.vertCount=0;this.courseCache=new Map;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate river shaders");if(e.shaderSource(r,ko),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`River VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,Wo),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`River FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate river program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`River link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate river VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let l=lr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,l,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,l,16),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,l,32),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,l,48),e.bindVertexArray(null);let d=a=>{let c=e.getUniformLocation(i,a);if(!c)throw new Error(`Missing river uniform: ${a}`);return c};this.uCamCenter=d("u_camCenter"),this.uViewportSize=d("u_viewportSize"),this.uZoom=d("u_zoom"),this.uCoastalWaterLayer=d("u_coastalWaterLayer"),this.uTime=d("u_time"),this.uWindEnabled=d("u_windEnabled"),this.uPassMode=d("u_passMode"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0)}getCachedCourse(e,r=34){let o=`${e.id}@${r}`;if(this.courseCache.has(o))return this.courseCache.get(o)??null;let i=Nt(e,r);if(this.courseCache.set(o,i),this.courseCache.size>512){let n=this.courseCache.keys().next().value;n!==void 0&&this.courseCache.delete(n)}return i}pushVertex(e,r,o,i,n,s,l,d,a,c,h,f,m){if(this.vertCount>=Nr)return;let g=this.vertCount*lr,x=this.verts;x[g++]=e,x[g++]=r,x[g++]=o,x[g++]=i,x[g++]=n,x[g++]=s,x[g++]=l,x[g++]=d,x[g++]=a,x[g++]=c,x[g++]=h,x[g++]=f,x[g++]=m.r,x[g++]=m.g,x[g++]=m.b,x[g++]=m.rock,this.vertCount++}sampleBankPalette(e,r,o){if(!o)return ft.earth;let i=et(e,r*De),n=0,s=0,l=0,d=0,a=0;for(let c=-1;c<6;c++){let h=c<0?i.q:i.q+Pe[c][0],f=c<0?i.r:i.r+Pe[c][1],m=o(h,f);if(!m)continue;let g=m.terrainId;if(g==="ocean"||g==="coastal_water"||g==="stormy_ocean"||g==="icy_ocean")continue;let x=cr(h,f),S=Math.hypot(e-x.x,r-x.y);if(S>380)continue;let I=Math.max(0,Math.min(1,1-Math.max(0,S-35)/345)),D=I*I*(3-2*I),v=D*D,M=Ao(m);s+=M.r*v,l+=M.g*v,d+=M.b*v,a+=M.rock*v,n+=v}return n<1e-4?ft.earth:{r:s/n,g:l/n,b:d/n,rock:a/n}}emitCourse(e,r,o,i,n){let s=e.points,l=s.length;if(l<2)return;let d=e.width*.5*n,a=e.mouthCrossPos??(e.hasMouth&&e.mouthCrossIdx>=0?s[e.mouthCrossIdx]:null),c=e.hasMouth?s[l-1]:null,h=a&&c?c.x-a.x:0,f=a&&c?c.y-a.y:0,m=Math.hypot(h,f)||1,g=e.mouthDirX??h/m,x=e.mouthDirY??f/m,S=Math.max(24,e.mouthReach??m),I=new Float32Array(l);for(let C=1;C<l;C++)I[C]=I[C-1]+Math.hypot(s[C].x-s[C-1].x,s[C].y-s[C-1].y);let D=Math.max(1,I[l-1]),v=new Float32Array(l),M=new Float32Array(l),j=new Float32Array(l),w=new Float32Array(l),b=new Array(l);for(let C=0;C<l;C++){let G=s[C>0?C-1:0],ee=s[C<l-1?C+1:l-1],B=ee.x-G.x,P=ee.y-G.y,Y=Math.hypot(B,P)||1;v[C]=B/Y,M[C]=P/Y,j[C]=-P/Y,w[C]=B/Y,b[C]=this.sampleBankPalette(s[C].x,s[C].y,i)}let R=(C,G,ee)=>{let B=r(C,G),P=C,Y=(G-B)*De,le=I[ee]/D,oe=d*(e.hasMouth?.78+.3*le:1),X=1,_=1;if(a&&e.hasMouth){let u=(C-a.x)*g+(G-a.y)*x,p=Math.max(0,Math.min(1,(u+34)/(34+S*.72))),y=p*p*(3-2*p);oe*=1+.55*y;let k=Math.max(0,Math.min(1,(u+6)/(S+6)));X=1-k*k*(3-2*k);let F=Math.max(0,Math.min(1,(u+76)/58));_=1-F*F*(3-2*F)}let W=et(C,G*De),E=o(W.q,W.r);return{wx:P,wy:Y,halfW:oe,mouthFade:X,landFade:_,fogDim:E===0?0:E===1?.65:1}},L=34;{let C=s[0],G=-v[0],ee=-M[0],B=R(C.x,C.y,0);if(B.fogDim>0){let P=B.halfW+L,Y=10;for(let le=0;le<Y;le++){let oe=-Math.PI*.5+le/Y*Math.PI,X=-Math.PI*.5+(le+1)/Y*Math.PI,_=(G*Math.cos(oe)+j[0]*Math.sin(oe))*P,W=(ee*Math.cos(oe)+w[0]*Math.sin(oe))*P,E=(G*Math.cos(X)+j[0]*Math.sin(X))*P,q=(ee*Math.cos(X)+w[0]*Math.sin(X))*P,u=R(C.x+_,C.y+W,0),p=R(C.x+E,C.y+q,0),y=Math.sin(oe)>=0?1:-1,k=Math.sin(X)>=0?1:-1;this.pushVertex(B.wx,B.wy,C.x,C.y,0,B.halfW,B.mouthFade,B.landFade,B.fogDim,0,v[0],M[0],b[0]),this.pushVertex(u.wx,u.wy,C.x+_,C.y+W,y*P,B.halfW,u.mouthFade,u.landFade,B.fogDim,-Math.cos(oe)*P,v[0],M[0],b[0]),this.pushVertex(p.wx,p.wy,C.x+E,C.y+q,k*P,B.halfW,p.mouthFade,p.landFade,B.fogDim,-Math.cos(X)*P,v[0],M[0],b[0])}}}for(let C=0;C<l-1&&!(this.vertCount+6>Nr);C++){let G=s[C],ee=s[C+1],B=R(G.x,G.y,C),P=R(ee.x,ee.y,C+1);if(B.fogDim===0&&P.fogDim===0)continue;let Y=B.fogDim>0?B.fogDim:P.fogDim,le=P.fogDim>0?P.fogDim:B.fogDim,oe=B.halfW+L*(.28+.72*B.landFade),X=P.halfW+L*(.28+.72*P.landFade),_=G.x-j[C]*oe,W=G.y-w[C]*oe,E=G.x+j[C]*oe,q=G.y+w[C]*oe,u=ee.x-j[C+1]*X,p=ee.y-w[C+1]*X,y=ee.x+j[C+1]*X,k=ee.y+w[C+1]*X,F=R(_,W,C),H=R(E,q,C),$=R(u,p,C+1),N=R(y,k,C+1);this.pushVertex(F.wx,F.wy,_,W,-oe,B.halfW,F.mouthFade,F.landFade,Y,I[C],v[C],M[C],b[C]),this.pushVertex(H.wx,H.wy,E,q,oe,B.halfW,H.mouthFade,H.landFade,Y,I[C],v[C],M[C],b[C]),this.pushVertex(N.wx,N.wy,y,k,X,P.halfW,N.mouthFade,N.landFade,le,I[C+1],v[C+1],M[C+1],b[C+1]),this.pushVertex(F.wx,F.wy,_,W,-oe,B.halfW,F.mouthFade,F.landFade,Y,I[C],v[C],M[C],b[C]),this.pushVertex(N.wx,N.wy,y,k,X,P.halfW,N.mouthFade,N.landFade,le,I[C+1],v[C+1],M[C+1],b[C+1]),this.pushVertex($.wx,$.wy,u,p,-X,P.halfW,$.mouthFade,$.landFade,le,I[C+1],v[C+1],M[C+1],b[C+1])}if(!e.hasMouth){let C=s[l-1],G=v[l-1],ee=M[l-1],B=R(C.x,C.y,l-1);if(B.fogDim>0){let P=B.halfW+L,Y=10;for(let le=0;le<Y;le++){let oe=-Math.PI*.5+le/Y*Math.PI,X=-Math.PI*.5+(le+1)/Y*Math.PI,_=(G*Math.cos(oe)+j[l-1]*Math.sin(oe))*P,W=(ee*Math.cos(oe)+w[l-1]*Math.sin(oe))*P,E=(G*Math.cos(X)+j[l-1]*Math.sin(X))*P,q=(ee*Math.cos(X)+w[l-1]*Math.sin(X))*P,u=R(C.x+_,C.y+W,l-1),p=R(C.x+E,C.y+q,l-1),y=Math.sin(oe)>=0?1:-1,k=Math.sin(X)>=0?1:-1;this.pushVertex(B.wx,B.wy,C.x,C.y,0,B.halfW,1,1,B.fogDim,I[l-1],G,ee,b[l-1]),this.pushVertex(u.wx,u.wy,C.x+_,C.y+W,y*P,B.halfW,1,1,B.fogDim,I[l-1]+Math.cos(oe)*P,G,ee,b[l-1]),this.pushVertex(p.wx,p.wy,C.x+E,C.y+q,k*P,B.halfW,1,1,B.fogDim,I[l-1]+Math.cos(X)*P,G,ee,b[l-1])}}}}render(e){let{cam:r,assets:o,routes:i,manualEdges:n=[],sampleReliefHeight:s,lookupFog:l,lookupHex:d,timeSec:a,windAnimation:c=!0}=e;if(i.length===0&&n.length===0)return 0;this.vertCount=0;let h=r.zoom<.35?1+(.35-r.zoom)*1.4:1;for(let m=0;m<i.length;m++){let g=this.getCachedCourse(i[m],34);g&&this.emitCourse(g,s,l,d,h)}if(n.length>0){let m=Yr(n,34);for(let g=0;g<m.length;g++)this.emitCourse(m[g],s,l,d,h)}if(this.vertCount===0)return 0;let{gl:f}=this;return f.enable(f.BLEND),f.blendEquation(f.FUNC_ADD),f.blendFunc(f.ONE,f.ONE_MINUS_SRC_ALPHA),f.useProgram(this.program),f.bindVertexArray(this.vao),f.bindBuffer(f.ARRAY_BUFFER,this.vbo),f.bufferSubData(f.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*lr)),f.activeTexture(f.TEXTURE0),f.bindTexture(f.TEXTURE_2D_ARRAY,o.terrainArray),f.uniform2f(this.uCamCenter,r.x,r.y),f.uniform2f(this.uViewportSize,r.viewportWidth,r.viewportHeight),f.uniform1f(this.uZoom,r.zoom),f.uniform1i(this.uCoastalWaterLayer,o.coastalWaterLayer),f.uniform1f(this.uTime,a),f.uniform1f(this.uWindEnabled,c?1:0),f.uniform1f(this.uPassMode,0),f.drawArrays(f.TRIANGLES,0,this.vertCount),f.uniform1f(this.uPassMode,1),f.drawArrays(f.TRIANGLES,0,this.vertCount),2}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var Do=Pe.map(([t,e])=>[t+e*.5,je*e/256]),Io=new Set(["grassland","pasture","sparse_pasture","highland","forest_floor"]),qo=new Set(["moor","marshland","swamp"]);function dr(t){let e=t<0?0:t>1?1:t;return .68+Math.pow(e,1.45)*2.42}function jr(t,e,r){return t.kind==="mountain"?3:tr(t)?0:t.kind==="tree"?r>=66?2:1:rr(t)||xt(t)||t.kind==="rock"?r>=54||e>=72?2:r>=30||e>=38?1:0:t.family==="cacti"||t.kind==="cluster"&&r>=48?1:0}function $r(t){return tr(t)?0:t.kind==="mountain"?.44:rr(t)||xt(t)||t.kind==="rock"?1:t.kind==="tree"||t.family==="cacti"?.72:t.kind==="shrub"||t.kind==="cluster"?.58:t.kind==="ground_cover"||nr(t)||Ir(t)?.3:.55}var Bo=256*256*Math.sqrt(3)/2,Xt=class{constructor(e,r,o={}){this.fogOverride=null;this.rawCellChunks=new Map;this.chunks=new Map;this.allCandidates=[];this.candidatesByTerrain=new Map;this.candidatesByTerrainForest=new Map;this.decalCandidatesByTerrain=new Map;this.mountainCandidates=[];this.waterBoulderCandidates=[];this.reedCandidates=[];this.revision=1;this.manifest=e,this.provider=r,this.maxCachedChunks=o.maxCachedChunks??256,this.seedIntValue=kr(o.worldSeed??"vedras-welt-01"),this.reliefConfig={...Et,...o.reliefStrength!==void 0?{strength:o.reliefStrength}:{},...o.reliefConfig??{}},this.forestConfig={...ct,...o.forestConfig??{}},this.indexManifestSprites()}get seedInt(){return this.seedIntValue}get loadedChunkCount(){return this.chunks.size}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunks.clear(),this.revision++}setReliefConfig(e){let r=this.reliefConfig.enabled?this.reliefConfig.strength:0,o=this.reliefConfig.style??"sculpted";this.reliefConfig={...this.reliefConfig,...e};let i=this.reliefConfig.enabled?this.reliefConfig.strength:0,n=this.reliefConfig.style??"sculpted";(r!==i||o!==n)&&(this.chunks.clear(),this.revision++)}setProvider(e,r){this.provider=e,this.fogOverride=null,r!==void 0&&(this.seedIntValue=kr(r)),this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}clearCache(){this.rawCellChunks.clear(),this.chunks.clear(),this.revision++}invalidateChunkAt(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=vt(o,i);this.rawCellChunks.delete(n),this.chunks.delete(n);let s=e-o*Me,l=r-i*Me,d=[0],a=[0];s<=2&&d.push(-1),s>=Me-3&&d.push(1),l<=2&&a.push(-1),l>=Me-3&&a.push(1);for(let c of d)for(let h of a)c===0&&h===0||this.chunks.delete(vt(o+c,i+h));this.revision++}setHexFogState(e,r,o){let{cq:i,cr:n}=Wt(e,r,Me),s=vt(i,n),l=e-i*Me,a=(r-n*Me)*Me+l,c=this.chunks.get(s)?.cells[a],h=this.rawCellChunks.get(s)?.[a],f=c??h;return!f||f.fogState===o?!1:(c&&(c.fogState=o),h&&(h.fogState=o),this.revision++,!0)}reapplyFog(e){this.fogOverride=e;for(let r of this.chunks.values())for(let o of r.cells)o&&(o.fogState=e(o.q,o.r));for(let r of this.rawCellChunks.values())for(let o of r)o&&(o.fogState=e(o.q,o.r));this.revision++}lookupHex(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=vt(o,i),l=this.chunks.get(n)?.cells??this.rawCellChunks.get(n);if(!l)return;let d=e-o*Me,a=r-i*Me;if(!(d<0||d>=Me||a<0||a>=Me))return l[a*Me+d]}lookupTerrainHex(e,r){return this.lookupHex(e,r)??this.lookupRawHex(e,r)}resolveTerrainLayer(e,r,o){let i=this.manifest.terrain.byType[e]??this.manifest.terrain.byType.grassland;if(!i||i.layers.length===0)return 0;if(i.layers.length===1)return i.layers[0];let n=un(this.seedIntValue,r,o,101)%i.layers.length;return i.layers[n]}isWaterTerrain(e){return this.manifest.terrain.byType[e]?.materialClass==="water"}prepareVisibleFrame(e,r=6,o=!0){let i=cn(e,Me,2),n=0,s=0,l=[];for(let{cq:b,cr:R}of i){let L=vt(b,R),C=this.chunks.get(L);C?(this.chunks.delete(L),this.chunks.set(L,C),l.push(C)):n<r?(C=this.buildChunk(b,R),this.chunks.set(L,C),n++,this.revision++,l.push(C)):s++}for(;this.chunks.size>this.maxCachedChunks;){let b=this.chunks.keys().next().value;if(b===void 0)break;this.chunks.delete(b)}let d=this.maxCachedChunks*2;for(;this.rawCellChunks.size>d;){let b=this.rawCellChunks.keys().next().value;if(b===void 0)break;this.rawCellChunks.delete(b)}let a=e.viewportWidth*.5/e.zoom+420,c=e.viewportHeight*.5/e.zoom+420,h=e.x-a,f=e.x+a,m=e.y-c,g=e.y+c,x=[],S=[],I=[],D=new Set;for(let b of l){for(let R of b.shorelines){if(R.x<h||R.x>f||R.y<m||R.y>g)continue;let L=this.lookupHex(R.q,R.r),C=L?L.fogState:0;C!==0&&(x.push(R),S.push(C))}for(let R of b.riverRoutes)D.has(R.id)||(D.add(R.id),I.push(R))}if(!o)return{sprites:[],fogStates:[],decals:[],decalFogStates:[],shorelines:x,shoreFogStates:S,riverRoutes:I,chunksLoadedThisFrame:n,hasPendingChunks:s>0};let v=[],M=[];for(let b of l){for(let R of b.sprites)R.x<h||R.x>f||R.y<m||R.y>g||v.push(R);for(let R of b.decals)R.x<h||R.x>f||R.y<m||R.y>g||M.push(R)}v.sort((b,R)=>(b.sortY??b.y)-(R.sortY??R.y)||b.x-R.x);let j=new Array(v.length);for(let b=0;b<v.length;b++){let R=v[b],L=this.lookupHex(R.q,R.r);j[b]=L?L.fogState:0}let w=new Array(M.length);for(let b=0;b<M.length;b++){let R=M[b],L=this.lookupHex(R.q,R.r);w[b]=L?L.fogState:0}return{sprites:v,fogStates:j,decals:M,decalFogStates:w,shorelines:x,shoreFogStates:S,riverRoutes:I,chunksLoadedThisFrame:n,hasPendingChunks:s>0}}getOrFetchRawCells(e,r){let o=vt(e,r),i=this.rawCellChunks.get(o);if(i)return i;let n=e*Me,s=r*Me,l=this.provider({cq:e,cr:r,chunkSize:Me}),d=new Array(Me*Me),a=this.fogOverride;for(let c of l){let h=c.q-n,f=c.r-s;h<0||h>=Me||f<0||f>=Me||(a&&(c.fogState=a(c.q,c.r)),d[f*Me+h]=c)}return this.rawCellChunks.set(o,d),d}lookupRawHex(e,r){let{cq:o,cr:i}=Wt(e,r,Me),n=this.getOrFetchRawCells(o,i),s=e-o*Me,l=r-i*Me;return n[l*Me+s]}indexManifestSprites(){let e=Object.entries(this.manifest.nature.sprites).sort((o,i)=>o[0].localeCompare(i[0])),r=[];for(let[o,i]of e){let n=Sn(i,this.manifest),s=i.worldWidth*Mt(i),l=.72*s*s/Bo,d=0,a=o.replace(/^assets\//,"");for(let f=0;f<a.length;f++)d=Math.imul(d,31)+a.charCodeAt(f)|0;let c=i.kind==="tree"?"tree":i.kind==="shrub"?"shrub":i.kind==="ground_cover"?"ground_cover":"other",h={key:o,entry:i,allowedTypes:n,effectiveWidth:s,crownAreaRatio:l,pathSalt:d,pre:{strict:Bt(i),ecoFamily:qt(i)},pScale:Br(i),chanceMult:xn(i),minSpacing:i.placement?.minSpacing??28,edgeMargin:i.placement?.edgeMargin??12,pKind:c,isCanopy:bn(i),isBoulder:rr(i),isWaterBoulder:xt(i),isWarmBoulder:Dt(i),isGroundDecal:tr(i),isDryPatch:nr(i),isAcacia:qr(i),isAccent:vn(i),isSnowFamily:or(i),isBush20to29:Dr(i),isReed:Ir(i),isHerb:i.family==="herbs",accentGroup:yn(i)};if(i.kind==="mountain")this.mountainCandidates.push(h);else if(h.isWaterBoulder)i.artStatus!=="deprecated"&&this.waterBoulderCandidates.push(h);else if(h.isGroundDecal){if(i.artStatus!=="deprecated"&&(i.placement?.density??.25)>0&&n.size>0)for(let f of n){let m=this.decalCandidatesByTerrain.get(f);m||(m=[],this.decalCandidatesByTerrain.set(f,m)),m.push(h)}}else if(i.artStatus!=="deprecated"&&(i.placement?.density??0)>0&&(i.placement?.weight??1)>0&&n.size>0){this.allCandidates.push(h),h.isReed&&this.reedCandidates.push(h);for(let f of n){let m=this.candidatesByTerrain.get(f);m||(m=[],this.candidatesByTerrain.set(f,m)),m.push(h)}n.has("forest_floor")&&i.family!=="palms"&&r.push(h)}}for(let o of Object.keys(this.manifest.terrain.byType)){let i=this.candidatesByTerrain.get(o)??[];if(r.length===0)this.candidatesByTerrainForest.set(o,i);else{let n=new Set(i),s=[...i];for(let l of r)n.has(l)||(n.add(l),s.push(l));this.candidatesByTerrainForest.set(o,s)}}}createPlacedSprite(e,r,o,i,n,s,l){let d=e.entry,a=e.effectiveWidth*s,c=a*d.aspect,h=e.isGroundDecal?void 0:this.manifest.shadows.sprites[e.key],f=n*De,m=d.kind==="mountain",g=Math.round(i*3)^Math.round(n*5)|0,S=!m&&!e.isAccent&&!e.accentGroup&&K(this.seedIntValue,r,o,g+811)<.5,I=i/(256*2.6),D=n/(256*2.6),v=Math.floor(I),M=Math.floor(D),j=I-v,w=D-M,b=j*j*(3-2*j),R=w*w*(3-2*w),L=K(this.seedIntValue,v,M,913),C=K(this.seedIntValue,v+1,M,913),G=K(this.seedIntValue,v,M+1,913),ee=K(this.seedIntValue,v+1,M+1,913),B=L+(C-L)*b+(G+(ee-G)*b-(L+(C-L)*b))*R,P=K(this.seedIntValue,r,o,g+823),Y=B*.6+P*.4,le=m||e.isBoulder||e.isWaterBoulder||e.isGroundDecal||e.isAccent?0:e.isReed?.82:d.kind==="tree"?.62:d.family==="cacti"?.08:d.kind==="shrub"?.42:d.kind==="ground_cover"?.24:0;return{x:i,y:f-l*De,sortY:f,width:a,height:c,anchorX:d.anchor[0],anchorY:d.anchor[1],page:d.page,u0:d.uv[0],v0:d.uv[1],u1:d.uv[2],v1:d.uv[3],q:r,r:o,isMountain:m,isWaterBoulder:e.isWaterBoulder||void 0,isGroundDecal:e.isGroundDecal||void 0,isSnowFamily:e.isSnowFamily,flipX:S,tintHash:Y,swayAmp:le,shadowTier:jr(d,a,c),selfShadeWeight:$r(d),shadowPage:h?h.page:-1,shadowU0:h?h.uv[0]:0,shadowV0:h?h.uv[1]:0,shadowU1:h?h.uv[2]:0,shadowV1:h?h.uv[3]:0,shadowMinX:h?h.boundsInSpriteWidth[0]:0,shadowMinY:h?h.boundsInSpriteWidth[1]:0,shadowMaxX:h?h.boundsInSpriteWidth[2]:0,shadowMaxY:h?h.boundsInSpriteWidth[3]:0}}buildChunk(e,r){let o=e*Me,i=r*Me,n=this.seedIntValue,s=this.getOrFetchRawCells(e,r),l=[],d=[];for(let u=-2;u<Me+2;u++)for(let p=-2;p<Me+2;p++){let y=o+p,k=i+u,F=this.lookupRawHex(y,k);F&&(l.push(F),p>=0&&p<Me&&u>=0&&u<Me&&d.push(F))}let a=Rn(l,this.manifest,n,this.forestConfig);for(let u of d){let p=a.get(Fe(u.q,u.r));p&&(u.forestClass=p.forestClass,u.glade=p.glade,u.gladeX=p.gladeX,u.gladeY=p.gladeY,u.gladeRadius=p.gladeRadius)}let c=[],h=this.manifest.infrastructure.sprites;for(let u of d){if(this.isWaterTerrain(u.terrainId)||Ct.has(u.terrainId))continue;let p=ke(u.q,u.r);for(let y=0;y<6;y++){let[k,F]=Pe[y],H=this.lookupRawHex(u.q+k,u.r+F);if(!H||!this.isWaterTerrain(H.terrainId)||H.terrainId==="icy_ocean")continue;let $=`shorelines/shore_v105_edge_0${y+1}`,N=h[$];N&&c.push({x:p.x,y:p.y,q:u.q,r:u.r,side:y,page:N.page,u0:N.uv[0],v0:N.uv[1],u1:N.uv[2],v1:N.uv[3]})}}let f=this.provider.getRiverRoutesForChunk?.(e,r,Me)??[],m=[];for(let u=0;u<f.length;u++){let p=Nt(f[u],34);if(!p||p.points.length<2)continue;let y=1/0,k=-1/0,F=1/0,H=-1/0;for(let $=0;$<p.points.length;$++){let N=p.points[$];N.x<y&&(y=N.x),N.x>k&&(k=N.x),N.y<F&&(F=N.y),N.y>H&&(H=N.y)}m.push({course:p,minX:y-90,maxX:k+90,minY:F-90,maxY:H+90})}let g=(u,p)=>{if(m.length===0)return 1/0;let y=1/0;for(let k=0;k<m.length;k++){let F=m[k];if(u<F.minX||u>F.maxX||p<F.minY||p>F.maxY)continue;let H=F.course.points;for(let $=1;$<H.length;$++){let N=H[$-1],se=H[$],ue=se.x-N.x,Q=se.y-N.y,Re=ue*ue+Q*Q,z=Re>1e-6?((u-N.x)*ue+(p-N.y)*Q)/Re:0;z<0?z=0:z>1&&(z=1);let J=u-(N.x+z*ue),te=p-(N.y+z*Q),ve=J*J+te*te;ve<y&&(y=ve)}}return y<1/0?Math.sqrt(y):1/0},x=this.reliefConfig.enabled?this.reliefConfig.strength:0,S=this.reliefConfig.style??"sculpted",I=Ln(l,this.manifest,n,x,S),D=(u,p)=>qn(I,u,p),v=[],M=new Set,j=[],w=new Map,b=(u,p,y,k,F,H,$,N)=>{v.push(this.createPlacedSprite(u,p,y,k,F,H,$));let se={x:k,y:F,pScale:u.pScale,minSpacing:u.minSpacing,visualHalfW:u.effectiveWidth*H*.5,isCanopy:u.isCanopy,isBoulder:u.isBoulder},ue=Fe(p,y),Q=w.get(ue);Q||(Q=[],w.set(ue,Q)),Q.push(se),N.push(se)};if(this.mountainCandidates.length>0){let u=new Set(d.map(p=>Fe(p.q,p.r)));for(let p of l){if(p.reliefClass!=="mountain"||p.occupied)continue;let y=this.mountainCandidates.filter(Q=>Mn(Q.entry,Q.allowedTypes,p.terrainId,this.manifest)),k=y.length>0?y:this.mountainCandidates,F=Math.floor(K(n,p.q,p.r,2002)*k.length),H=k[F%k.length],$=256*(p.q+p.r*.5),N=je*p.r+20,se=Math.max(72,(H.entry.mountain?.coreRadius??.32)*H.effectiveWidth);j.push({ux:$,uy:N,coreR2:se*se});let ue=Fe(p.q,p.r);if(M.add(ue),u.has(ue)){let Q=D($,N);v.push(this.createPlacedSprite(H,p.q,p.r,$,N,1,Q))}}}let R=d.filter(u=>!this.isWaterTerrain(u.terrainId)).length,L=wn(R),C={dead_trees:0,fallen_logs:0},G=(u,p,y,k)=>{let F=u/y,H=p/y,$=Math.floor(F),N=Math.floor(H),se=F-$,ue=H-N,Q=se*se*(3-2*se),Re=ue*ue*(3-2*ue),z=K(n,$,N,k),J=K(n,$+1,N,k),te=K(n,$,N+1,k),ve=K(n,$+1,N+1,k),ye=z+(J-z)*Q,be=te+(ve-te)*Q;return ye+(be-ye)*Re},ee=(u,p,y,k)=>K(n,p,y,k+u.pathSalt),B=(u,p,y=null)=>{if(y!==null)return y;if(u.isWaterBoulder)return dr(p)*1.28;if(u.isBoulder)return dr(p);let k=u.entry.scaleRange[0]??.85,F=u.entry.scaleRange[1]??1.15,H=u.entry.kind==="tree"?Math.min(k,.76):u.entry.kind==="shrub"?Math.min(k,.74):k,$=u.entry.kind==="tree"?Math.max(F,1.2):u.entry.kind==="shrub"?Math.max(F,1.22):F;return H+($-H)*p},P=(u,p)=>{for(let y=0;y<j.length;y++){let k=j[y],F=u-k.ux,H=p-k.uy;if(F*F+H*H<k.coreR2)return!0}return!1},Y=(u,p,y,k,F)=>{if(y.length===0)return!0;let H=256*.5-(F+Math.min(74,k*.72));for(let $=0;$<y.length;$++){let[N,se]=Do[y[$]];if(u*N+p*se>H)return!1}return!0},le=(u,p,y,k)=>{if(m.length===0||y.isWaterBoulder)return!1;let F=g(u,p);return F===1/0?!1:y.isReed?F<21:F<24+Math.min(38,k*.45)},oe=(u,p,y,k,F,H,$,N,se=null,ue,Q=[],Re=34)=>{let z=u.entry,J=ue??u.edgeMargin,te=K(n,p.q,p.r,$*47+7),ve=B(u,te,se),ye=u.effectiveWidth*ve*.5,be=u.pKind,We=u.pScale,xe=u.minSpacing,Ae=u.isCanopy,pe=z.kind==="tree";for(let Ie=0;Ie<28;Ie++){let{dx:qe,dy:Be}=An(n,p.q,p.r,be,$,Ie);if(!ir(qe,Be,J)||!Y(qe,Be,Q,ye,Re)||pe&&Ur(H,qe,Be))continue;let Le=y+qe,Xe=k+Be;if(P(Le,Xe)||le(Le,Xe,u,ye))continue;let Ge=!1;for(let U=0;U<F.length;U++){let Z=F[U],ge=Math.sqrt(We*Z.pScale),T=Ae&&Z.isCanopy,O=T?N:Math.max(.85,N),ne=Math.max(T&&O<.6?10:14,Math.max(xe,Z.minSpacing)*O*ge);!T&&(u.isBoulder||Z.isBoulder)&&(ne=Math.max(ne,(ye+Z.visualHalfW)*.56));let V=Le-Z.x,fe=Xe-Z.y;if(V*V+fe*fe<ne*ne){Ge=!0;break}}if(Ge)continue;let A=D(Le,Xe);return b(u,p.q,p.r,Le,Xe,ve,A,F),{ux:Le,uy:Xe,scale:ve,halfW:ye}}return null},X=(u,p,y,k,F,H,$,N,se,ue,Q,Re,z,J,te,ve=[],ye=34)=>{let be=te??u.edgeMargin,We=K(n,p.q,p.r,z*53+13),xe=B(u,We,ue),Ae=u.effectiveWidth*xe*.5,pe=u.pScale,Ie=u.minSpacing,qe=u.entry.kind==="tree",Be=K(n,p.q,p.r,z*61+19)*Math.PI*2,Le=Math.max(N,$*.68+Ae*.44),Xe=Math.max(se,Le+28);for(let Ge=0;Ge<20;Ge++){let A=K(n,p.q,p.r,z*71+Ge*11+3),U=K(n,p.q,p.r,z*73+Ge*13+5),Z=Be+Ge*2.3999632+(U-.5)*.42,ge=Le+(Xe-Le)*A,T=F+Math.cos(Z)*ge,O=H+Math.sin(Z)*ge*.78,ne=T-y,V=O-k;if(!ir(ne,V,be)||!Y(ne,V,ve,Ae,ye)||qe&&Ur(Re,ne,V)||P(T,O)||le(T,O,u,Ae))continue;let fe=!1;for(let de=0;de<Q.length;de++){let Se=Q[de],Ve=Math.sqrt(pe*Se.pScale),Ee=Math.max(10,Math.max(Ie,Se.minSpacing)*J*Ve);(u.isBoulder||Se.isBoulder)&&(Ee=Math.max(Ee,(Ae+Se.visualHalfW)*.56));let ze=T-Se.x,ut=O-Se.y;if(ze*ze+ut*ut<Ee*Ee){fe=!0;break}}if(fe)continue;let ce=D(T,O);return b(u,p.q,p.r,T,O,xe,ce,Q),{ux:T,uy:O,scale:xe,halfW:Ae}}return null},_=(u,p)=>{for(let y=-2;y<=2;y++)for(let k=-2;k<=2;k++){if(tt(0,0,k,y)>2)continue;let F=this.lookupRawHex(u+k,p+y);if(F&&F.terrainId==="coastal_water")return!0}return!1};if(this.waterBoulderCandidates.length>0){let u=this.waterBoulderCandidates;for(let p of d){if(p.occupied||!It.has(p.terrainId)||p.terrainId!=="coastal_water"&&!_(p.q,p.r))continue;let y=.45+1.2*G(p.q,p.r,3.2,4107),k=p.terrainId==="coastal_water"?.27:p.terrainId==="stormy_ocean"?.19:.15,F=Math.min(.48,k*y);if(K(n,p.q,p.r,4111)>=F)continue;let H=[];for(let te=0;te<6;te++){let[ve,ye]=Pe[te],be=this.lookupRawHex(p.q+ve,p.r+ye);be&&!this.isWaterTerrain(be.terrainId)&&H.push(te)}let $=256*(p.q+p.r*.5),N=je*p.r,se=[];for(let te=-1;te<=1;te++)for(let ve=-1;ve<=1;ve++){let ye=w.get(Fe(p.q+ve,p.r+te));if(ye)for(let be=0;be<ye.length;be++)se.push(ye[be])}let ue=Math.floor(K(n,p.q,p.r,4113)*u.length),Q=u[ue%u.length],Re=1,z=oe(Q,p,$,N,se,void 0,Re++,.85,null,20,H,30);if(!z)continue;let J=K(n,p.q,p.r,4117);if(J<.48){let te=J<.18?2:1;for(let ve=0;ve<te;ve++){let ye=Math.floor(K(n,p.q,p.r,4121+ve*7)*u.length),be=u[ye%u.length],We=K(n,p.q,p.r,4129+ve*11),xe=Math.max(.55,Math.min(2.35,z.scale*(.4+.46*We)));X(be,p,$,N,z.ux,z.uy,z.halfW,Math.max(24,z.scale*20),Math.max(64,z.scale*38),xe,se,void 0,Re++,.62,18,H,30)}}}}let W=this.forestConfig.mode,E=this.forestConfig.openTreeChance;for(let u of d){let p=Fe(u.q,u.r);if(u.occupied||M.has(p)||this.isWaterTerrain(u.terrainId))continue;let y=a.get(p);if(kn(n,u.q,u.r,y))continue;let k=[],F=[];for(let re=0;re<6;re++){let[ae,Ce]=Pe[re],ie=this.lookupRawHex(u.q+ae,u.r+Ce);ie&&(k.push(ie.terrainId),this.isWaterTerrain(ie.terrainId)&&F.push(re))}let H=y?.forestClass??"none",$=H==="dense_forest"||H==="light_forest",N=H==="light_forest"||!$&&(y?.edgeInfluence??0)>.1,se=!!(u.riverEdges&&u.riverEdges.length>0),ue=mn.has(u.terrainId),Q=qo.has(u.terrainId),Re=ue||u.terrainId==="semi_desert"||u.terrainId==="savanna",z=$?this.candidatesByTerrainForest.get(u.terrainId)??this.allCandidates:this.candidatesByTerrain.get(u.terrainId)??this.allCandidates;if(z.length===0)continue;let J={baseBiome:u.terrainId,biome:y?.biome??u.terrainId,forestClass:H,neighborTypes:k,hasRiverEdge:se},te=Lt.has(u.terrainId),ve=[],ye=[],be=[],We=[],xe=[],Ae=[],pe=[],Ie=!1;for(let re=0;re<z.length;re++){let ae=z[re],Ce=ae.entry;Pn(Ce.family,y)&&Cn(Ce,ae.allowedTypes,J,this.manifest,ae.pre)&&(u.terrainId==="tundra"&&Ce.family==="snow_conifers"&&ee(ae,u.q,u.r,973)>=.02||(Ie=!0,ae.isCanopy?te&&(Ce.family==="palms"||ae.isAcacia)?ve.push(ae):ye.push(ae):ae.isBoulder?(be.push(ae),ae.isWarmBoulder&&We.push(ae)):ae.isDryPatch?xe.push(ae):Ce.family==="snow"?Ae.push(ae):pe.push(ae)))}if(!Ie)continue;ye.sort((re,ae)=>{let Ce=re.entry.placement,ie=ae.entry.placement,he=ee(re,u.q,u.r,301)/Math.max(.04,(Ce.density??.12)*Math.min(1,Ce.weight??1)),_e=ee(ae,u.q,u.r,301)/Math.max(.04,(ie.density??.12)*Math.min(1,ie.weight??1));return he-_e}),pe.sort((re,ae)=>ee(re,u.q,u.r,302)-ee(ae,u.q,u.r,302));let qe=pe.filter(re=>(re.pKind==="shrub"||re.pKind==="ground_cover")&&!re.isAccent&&!re.accentGroup&&!(ue&&(re.isBush20to29||re.isHerb))),Be=En(y);Be>1&&Ut(n,u.q,u.r,"tree")<.58&&Be--;let Le=Tn(y),Xe=G(u.q,u.r,4.2,5107),Ge=G(u.q,u.r,1.9,5119),A=Math.pow(Xe*.68+Ge*.32,1.35),U=$?1:.14+1.76*A,Z=$?Le:Math.max(Le,10),ge=W==="canopy"?H==="dense_forest"?.34:H==="light_forest"?.59:.88:W==="dense"?H==="dense_forest"?.52:H==="light_forest"?.73:1:H==="dense_forest"?.72:H==="light_forest"?.92:1,T=256*(u.q+u.r*.5),O=je*u.r,ne=[];for(let re=-1;re<=1;re++)for(let ae=-1;ae<=1;ae++){let Ce=w.get(Fe(u.q+ae,u.r+re));if(Ce)for(let ie=0;ie<Ce.length;ie++)ne.push(Ce[ie])}let V=0,fe=0,ce=0,de=1,Se=(re,ae)=>{if($||V>=Z)return;let Ce=K(n,u.q,u.r,5201+de*17);if(ae.length>0&&Ce<.46){let _e=U>1.08&&Ce<.2?2:1;for(let we=0;we<_e&&V<Z;we++){let Te=Math.floor(K(n,u.q,u.r,5211+we*7)*ae.length),me=ae[Te%ae.length],He=K(n,u.q,u.r,5221+we*9),Ue=Math.max(.5,Math.min(1.85,re.scale*(.38+.44*He)));X(me,u,T,O,re.ux,re.uy,re.halfW,Math.max(20,re.halfW*.72),Math.max(52,re.halfW*1.45),Ue,ne,y,de++,.55,void 0,F)&&V++}}let ie=Re&&xe.length>0?ue?xe:[...xe,...qe]:qe,he=K(n,u.q,u.r,5237+de*13);if(ie.length>0&&he<.62){let _e=1+Math.floor(K(n,u.q,u.r,5243)*(U>1.05?2:1));for(let we=0;we<_e&&V<Z;we++){let Te=Math.floor(K(n,u.q,u.r,5251+we*11)*ie.length),me=ie[Te%ie.length],He=K(n,u.q,u.r,5261+we*7),Ue=me.entry.scaleRange[0]??.85,$e=me.entry.scaleRange[1]??1.15,Ye=(Ue+($e-Ue)*He)*.92;X(me,u,T,O,re.ux,re.uy,re.halfW,Math.max(20,re.halfW*.76),Math.max(54,re.halfW*1.38+18),Ye,ne,y,de++,.5,void 0,F)&&V++}}},Ee=We.length>0&&K(n,u.q,u.r,1607)<.85?We:be,ze=Ee.reduce((re,ae)=>Math.max(re,ae.entry.placement?.density??0),0),ut=$?1:.72+.48*U,Qe=Math.min(.44,ze*(We.length>0?2.5:1.15)*ut);if(We.length>0&&V<Z&&K(n,u.q,u.r,1601)<Qe){let re=Math.floor(K(n,u.q,u.r,1602)*Ee.length);for(let ae=0;ae<Ee.length;ae++){let Ce=Ee[(re+ae)%Ee.length],ie=oe(Ce,u,T,O,ne,y,de++,1,null,void 0,F);if(ie){V++,Se(ie,Ee);break}}}if(ve.length>0&&V<Z&&K(n,u.q,u.r,1751)<.065*(.75+.45*U)){let re=ve.filter(he=>he.entry.family==="palms"),ae=ve.filter(he=>he.isAcacia),Ce=K(n,u.q,u.r,1752)<.5?[re,ae]:[ae,re],ie=!1;for(let he of Ce){if(!he.length||ie)continue;let _e=Math.floor(K(n,u.q,u.r,1753)*he.length);for(let we=0;we<he.length;we++){let Te=he[(_e+we)%he.length],me=oe(Te,u,T,O,ne,y,de++,1,null,void 0,F);if(me){if(V++,ie=!0,K(n,u.q,u.r,1759)<.45){let He=1+Math.floor(K(n,u.q,u.r,1763)*2);for(let Ue=0;Ue<He&&V<Z;Ue++){let $e=he[(_e+Ue+1)%he.length];X($e,u,T,O,me.ux,me.uy,me.halfW,22,56,null,ne,y,de++,.54,void 0,F)&&V++}}break}}}}let Je=Math.min(.58,gn(u.terrainId)*(.76+.44*U));if(xe.length>0&&V<Z&&K(n,u.q,u.r,1831)<Je){let re=Math.floor(K(n,u.q,u.r,1832)*xe.length);for(let ae=0;ae<xe.length;ae++){let Ce=xe[(re+ae)%xe.length],ie=oe(Ce,u,T,O,ne,y,de++,.9,null,void 0,F);if(ie){V++;let he=K(n,u.q,u.r,1837);if(!$&&he<.52&&V<Z){let _e=he<.22&&U>.95?2:1;for(let we=0;we<_e&&V<Z;we++){let Te=xe[(re+1+we+Math.floor(he*11))%xe.length],me=K(n,u.q,u.r,1843+we*7),He=Te.entry.scaleRange[0]??.8,Ue=Te.entry.scaleRange[1]??1.15,$e=(He+(Ue-He)*me)*(.76+.3*me);X(Te,u,T,O,ie.ux,ie.uy,ie.halfW,16,44,$e,ne,y,de++,.48,void 0,F)&&V++}}break}}}let st=W==="canopy"&&$?y?.canopyCoverage??0:0,pt=st?Math.max(Be,Le-2):Be;for(let re=0;re<pt&&V<Le&&ye.length>0&&!(fe>=Be&&(!st||ce>=st));re++){let ae=ye[re%Math.min(ye.length,5)],Ce=null;if(N){let he=K(n,u.q,u.r,de*47+7);Ce=B(ae,he,null)*(.76+.16*he)}let ie=oe(ae,u,T,O,ne,y,de++,ge,Ce,void 0,F);ie&&(fe++,V++,ce+=ae.crownAreaRatio*ie.scale*ie.scale)}let Rr=Math.min(.68,E*(.62+.62*U));if(!Be&&!y?.glade&&ye.length>0&&E>0&&ee(ye[0],u.q,u.r,311)<Rr&&V<Z){let re=oe(ye[0],u,T,O,ne,y,de++,1,null,void 0,F);if(re){V++;let ae=K(n,u.q,u.r,5301),Ce=E>.25?.64:.52;if(ae<Ce){let ie=1+Math.floor(K(n,u.q,u.r,5303)*3),he=Math.min(ye.length,4);for(let _e=0;_e<ie&&V<Z;_e++){let we=ye[(_e+1)%he];X(we,u,T,O,re.ux,re.uy,re.halfW,24,62,null,ne,y,de++,.52,void 0,F)&&V++}if(qe.length>0&&V<Z){let _e=K(n,u.q,u.r,5311)<.55?2:1;for(let we=0;we<_e&&V<Z;we++){let Te=Math.floor(K(n,u.q,u.r,5317+we*7)*qe.length),me=qe[Te%qe.length];X(me,u,T,O,re.ux,re.uy,re.halfW,18,48,null,ne,y,de++,.48,void 0,F)&&V++}}else if(be.length>0&&V<Z&&K(n,u.q,u.r,5323)<.35){let _e=be[Math.floor(K(n,u.q,u.r,5329)*be.length)];X(_e,u,T,O,re.ux,re.uy,re.halfW,20,48,.62+K(n,u.q,u.r,5333)*.45,ne,y,de++,.52,void 0,F)&&V++}}}}let Er=$?1:.72+.48*U;if(We.length===0&&be.length>0&&V<Z&&K(n,u.q,u.r,1601)<Math.min(.36,ze*1.15*Er)){let re=Math.floor(K(n,u.q,u.r,1602)*be.length);for(let ae=0;ae<be.length;ae++){let Ce=be[(re+ae)%be.length],ie=oe(Ce,u,T,O,ne,y,de++,1,null,void 0,F);if(ie){V++,Se(ie,be);break}}}if(Ae.length>0&&V<Z){let re=u.terrainId==="snowfields"||u.terrainId==="frozen_tundra"?.58:u.terrainId==="highland"?.25:.14;if(K(n,u.q,u.r,1643)<re){let ae=Math.floor(K(n,u.q,u.r,1644)*Ae.length);for(let Ce=0;Ce<Ae.length;Ce++){let ie=Ae[(ae+Ce)%Ae.length];if(oe(ie,u,T,O,ne,y,de++,ge,null,void 0,F)){V++;break}}}}if(pe.length>0&&V<Z){let re=H==="dense_forest"?1.2:N?1.28:.58+.62*U,ae=Ut(n,u.q,u.r,"shrub"),Ce=Ut(n,u.q,u.r,"ground_cover"),ie=Ut(n,u.q,u.r,"other"),he=!1,_e=!1,we=!1,Te=pe.filter(me=>me.isReed);for(let me of pe){if(V>=Z)break;let He=me.entry,Ue=me.accentGroup;if(Ue&&(he||C[Ue]>=L[Ue]))continue;let $e=me.pKind==="shrub"?ae:me.pKind==="ground_cover"?Ce:ie,Ye=1;me.isBush20to29?ue?Ye=.022:u.terrainId==="savanna"?Ye=.55:u.terrainId==="semi_desert"?Ye=.92:(Io.has(u.terrainId)||$)&&(Ye=1.32):me.isHerb&&ue?Ye=.3:me.isReed&&(Q?Ye=1.65:(se||F.length>0)&&(Ye=1.35));let _t=Math.min(.86,(He.placement?.density??.15)*Math.min(1,He.placement?.weight??1)*re*me.chanceMult*Ye*$e);if(ee(me,u.q,u.r,312)>=_t)continue;let Ke=oe(me,u,T,O,ne,y,de++,ge,null,void 0,F);if(Ke){if(V++,Ue)C[Ue]++,he=!0;else if(me.isAccent)he=!0;else if(me.isReed&&!we&&Te.length>0&&V<Z){if(K(n,u.q,u.r,5501+de*13)<.74){we=!0;let bt=1+Math.floor(K(n,u.q,u.r,5507)*3);for(let at=0;at<bt&&V<Z;at++){let Tr=Math.floor(K(n,u.q,u.r,5519+at*7)*Te.length),nt=Te[Tr%Te.length],Yt=K(n,u.q,u.r,5527+at*11),St=nt.entry.scaleRange[0]??.85,jt=nt.entry.scaleRange[1]??1.15,$t=(St+(jt-St)*Yt)*(.78+.3*Yt);X(nt,u,T,O,Ke.ux,Ke.uy,Ke.halfW,14,38,$t,ne,y,de++,.42,void 0,F)&&V++}}}else if(!$&&!_e&&me.pKind==="shrub"&&!(ue&&me.isBush20to29)&&qe.length>0&&V<Z){let yt=K(n,u.q,u.r,5401+de*19);if(yt<.5){_e=!0;let bt=qe.filter(nt=>nt.entry.family===He.family),at=bt.length>0?bt:qe,Tr=yt<.22&&U>.9?2:1;for(let nt=0;nt<Tr&&V<Z;nt++){let Yt=Math.floor(K(n,u.q,u.r,5413+nt*11)*at.length),St=at[Yt%at.length],jt=K(n,u.q,u.r,5423+nt*7),$t=St.entry.scaleRange[0]??.85,ho=St.entry.scaleRange[1]??1.15,mo=($t+(ho-$t)*jt)*(.72+.3*jt);X(St,u,T,O,Ke.ux,Ke.uy,Ke.halfW,15,40,mo,ne,y,de++,.46,void 0,F)&&V++}if(be.length>0&&V<Z&&K(n,u.q,u.r,5437)<.22){let nt=be[Math.floor(K(n,u.q,u.r,5441)*be.length)];X(nt,u,T,O,Ke.ux,Ke.uy,Ke.halfW,18,42,.55+K(n,u.q,u.r,5443)*.48,ne,y,de++,.52,void 0,F)&&V++}}}}}}if(se&&!ue&&!Ct.has(u.terrainId)&&this.reedCandidates.length>0&&V<Z&&K(n,u.q,u.r,5601)<.68){let re=this.reedCandidates,ae=Math.floor(K(n,u.q,u.r,5609)*re.length),Ce=re[ae%re.length],ie=oe(Ce,u,T,O,ne,y,de++,.7,null,void 0,F);if(ie){V++;let he=1+Math.floor(K(n,u.q,u.r,5617)*2);for(let _e=0;_e<he&&V<Z;_e++){let we=re[(ae+_e+1)%re.length];X(we,u,T,O,ie.ux,ie.uy,ie.halfW,14,36,null,ne,y,de++,.42,void 0,F)&&V++}}}}let q=[];if(this.decalCandidatesByTerrain.size>0)for(let u of d){if(this.isWaterTerrain(u.terrainId)||u.reliefClass==="mountain"||Ct.has(u.terrainId))continue;let p=this.decalCandidatesByTerrain.get(u.terrainId);if(!p||p.length===0)continue;let y=Math.sin(u.q*.31+u.r*.19+n%53)*Math.cos(u.q*.17-u.r*.37+n%29),k=Math.sin(u.q*.67-u.r*.53+n%97)*.45,F=.5+.5*(y*.72+k*.28),H=K(n,u.q,u.r,7091),N=u.terrainId.includes("desert")||u.terrainId.includes("badlands")||u.terrainId.includes("savanna")||u.terrainId.includes("semi_arid")||u.terrainId.includes("dry")?.14+F*.26:.18+F*.32;if(H>=N)continue;let se=256*(u.q+u.r*.5),ue=je*u.r,Re=Pe.some(([xe,Ae])=>{let pe=this.lookupRawHex(u.q+xe,u.r+Ae);return pe?this.isWaterTerrain(pe.terrainId):!1})?46:28,z=u.forestDensity??0,J=F>.68&&H<N*.42?2:1,te=this.manifest.terrain.byType[u.terrainId]?.avgColor,ve=te?(Math.max(0,Math.min(255,Math.round(te[0])))&255)<<16|(Math.max(0,Math.min(255,Math.round(te[1])))&255)<<8|Math.max(0,Math.min(255,Math.round(te[2])))&255:0,ye=[];for(let xe=0;xe<p.length;xe++){let Ae=p[xe],pe=Ae.entry.tags??[];pe.includes("meadow_decal")&&z>.42||pe.includes("woodland_decal")&&z<.2&&u.terrainId!=="forest_floor"&&u.terrainId!=="swamp"&&u.terrainId!=="marsh"&&u.terrainId!=="marshland"&&u.terrainId!=="moor"&&u.terrainId!=="jungle"||ye.push(Ae)}if(ye.length===0)continue;let be=new Set,We=[];for(let xe=0;xe<J;xe++){let Ae=Math.floor(K(n,u.q,u.r,7109+xe*31)*ye.length),pe=ye[Ae%ye.length];if(be.has(pe.key))continue;let Ie=pe.pathSalt+xe*1777,qe=(K(n,u.q,u.r,Ie+7121+xe*7)-.5)*148,Be=(K(n,u.q,u.r,Ie+7129+xe*7)-.5)*148,Le=se+qe,Xe=ue+Be;if(!ir(qe,Be,Re)||g(Le,Xe)<54||We.some(ce=>Math.hypot(ce.ux-Le,ce.uy-Xe)<44))continue;let Ge=pe.entry.tags??[],A=K(n,u.q,u.r,Ie+7151),U=pe.entry.scaleRange[0]??.56,Z=pe.entry.scaleRange[1]??1.16,ge=U+(Z-U)*A,T=.86+K(n,u.q,u.r,Ie+7163)*.28,O=K(n,u.q,u.r,Ie+7177)*Math.PI*2,ne=Ge.includes("terrain_tint"),V=Ge.includes("rock_decal")||Ge.includes("woodland_decal")||Ge.includes("wetland_decal"),fe=this.createPlacedSprite(pe,u.q,u.r,Le,Xe,ge,D(Le,Xe));fe.width*=T,fe.height/=Math.sqrt(T),fe.rotationRad=O,ve>0&&(ne?(fe.terrainTintRgb=ve,fe.terrainTintMix=.96):V&&(fe.terrainTintRgb=ve,fe.terrainTintMix=.28)),q.push(fe),be.add(pe.key),We.push({ux:Le,uy:Xe})}}return v.sort((u,p)=>(u.sortY??u.y)-(p.sortY??p.y)||u.x-p.x),{cq:e,cr:r,key:vt(e,r),originQ:o,originR:i,cells:s,sprites:v,decals:q,shorelines:c,riverRoutes:f}}};var Tt=Object.freeze({"water.fraction":.22,"water.iceTemperature":.28,"climate.scale":11,"climate.temperature":.55,"climate.tempVariation":.72,"climate.humidity":.5,"climate.humidityVariation":.72,"biomes.coldBoundary":.34,"biomes.warmBoundary":.76,"biomes.aridWarmBoundary":.4,"biomes.dryThreshold":.31,"biomes.wetThreshold":.73,"biomes.wetlandBoundary":.72,"biomes.jungleWarmBoundary":.82,"biomes.regionClimateMix":.58,"biomes.targetHexes":50,"biomes.snowHumidity":.4,"biomes.semiDesertMargin":.015,"geology.highlandColdMargin":.15,"geology.grassSparseHumidity":.28,"geology.pastureSoil":.22,"geology.swampWarmBoundary":.5,"geology.aridPatchMix":1,"geology.aridRockyBadlands":16,"geology.aridDesert":20,"geology.aridSandyBadlands":20});var On=Pr(Zt());var ht=32,Uo=32;function Go(t){return t==="mountain"||t==="hills"?t:"flat"}function Hn(t,e){return t==="dense_forest"||t==="light_forest"?t:e>=.65?"dense_forest":e>.08?"light_forest":"none"}function Nn(t){let e=t.geographyConfig===null?void 0:t.geographyConfig??{...Tt},r=On.default.createPointSampler(t.seed,e),o=t.halfExtent,i=t.fogPolicy??(()=>2),n=t.overrides,s=new Map,l=(a,c)=>{let h=`${a},${c}`,f=s.get(h);if(f)return s.delete(h),s.set(h,f),f;let m=a*ht,g=c*ht,x=r.traceRivers(m,g,ht,ht),S=[],I=new Set;for(let v=0;v<x.routes.length;v++){let M=x.routes[v];if(!M||M.length<2)continue;let j=M[0],w=M[M.length-1],b=`${j[0]},${j[1]}->${w[0]},${w[1]}:${M.length}`;I.has(b)||(I.add(b),S.push({id:b,hexes:M}))}let D={routes:S,edgesByKey:x.edgesByKey};for(s.set(h,D);s.size>Uo;){let v=s.keys().next().value;if(v===void 0)break;s.delete(v)}return D},d=({cq:a,cr:c,chunkSize:h})=>{let f=a*h,m=c*h,g=[];for(let x=0;x<h;x++){let S=m+x;if(o!==void 0&&Math.abs(S)>o)continue;let I=Math.floor(S/ht);for(let D=0;D<h;D++){let v=f+D;if(o!==void 0&&Math.abs(v)>o)continue;let M=Math.floor(v/ht),j=l(M,I),w=r.sampleCell(v,S),b=Fe(v,S),R=i(v,S),L=n?.get(b),C=L?.reliefClass??Go(w.reliefClass),G=L?.forestDensity!==void 0?L.forestDensity:w.forestDensity>0?w.forestDensity:0,ee=L?.forestClass??(L?.forestDensity!==void 0?Hn(void 0,G):Hn(w.forestClass,G)),B=j.edgesByKey.get(b);g.push({q:v,r:S,terrainId:L?.terrainId??w.terrainId,reliefClass:C,hillProfile:L?.hillProfile!==void 0?L.hillProfile:C==="hills"?w.hillProfile??"rounded":null,hillStrength:L?.hillStrength!==void 0?L.hillStrength:C==="hills"?Math.max(.35,w.hillStrength||.72):0,forestClass:ee,forestDensity:G,fogState:L?.fogState??R,occupied:L?.occupied,riverEdges:L?.riverEdges!==void 0?L.riverEdges:B&&B.length>0?[...B]:void 0})}}return g};return d.getRiverRoutesForChunk=(a,c,h)=>{let f=a*h,m=f+h-1,g=c*h,x=g+h-1,S=Math.floor(f/ht),I=Math.floor(m/ht),D=Math.floor(g/ht),v=Math.floor(x/ht),M=[],j=new Set;for(let w=D;w<=v;w++)for(let b=S;b<=I;b++){let R=l(b,w);for(let L of R.routes){if(j.has(L.id))continue;let C=!1;for(let G=0;G<L.hexes.length;G++){let[ee,B]=L.hexes[G];if(ee>=f&&ee<=m&&B>=g&&B<=x){C=!0;break}}C&&(j.add(L.id),M.push(L))}}return M},d}var zn=Pr(Zt());var Oe=[.24,.62,.96],fr=[.92,.28,.3],Ho=[.22,.78,.48],Xn=[.94,.72,.22],Oo=new Set(["grassland","pasture","sparse_pasture","swamp","marshland","moor"]);function hr(t){return t.surfaceClass!=="land"}function wt(t){return!hr(t)&&t.reliefClass!=="mountain"}function Vt(t,e,r,o){let i=t.sampleCell(e,r);if(o==="harbor"){if(!hr(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:"Hafen ben\xF6tigt Wasserhex"};let l=[];for(let[d,a]of Pe){let c=t.sampleCell(e+d,r+a);wt(c)&&l.push({q:e+d,r:r+a})}return{center:{q:e,r},buildingKind:o,valid:l.length>0,yieldPercent:100,bonusHexes:l,reason:l.length>0?void 0:"Kein angrenzendes bebaubares Land"}}if(!wt(i))return{center:{q:e,r},buildingKind:o,valid:!1,yieldPercent:100,bonusHexes:[],reason:i.reliefClass==="mountain"?"Gebirge unbebaubar (D0121)":"Wasserhex unbebaubar"};let n=[],s=0;if(o==="farm"||o==="lumber_camp"||o==="quarry")for(let l=-2;l<=2;l++)for(let d=-2;d<=2;d++){if(tt(0,0,d,l)>2)continue;let a=e+d,c=r+l,h=t.sampleCell(a,c);o==="farm"?wt(h)&&Oo.has(h.terrainId)&&(n.push({q:a,r:c}),s+=5):o==="lumber_camp"?wt(h)&&h.forestDensity>.08&&(n.push({q:a,r:c}),s+=5):o==="quarry"&&(h.reliefClass==="hills"||h.reliefClass==="mountain")&&(n.push({q:a,r:c}),s+=10)}return{center:{q:e,r},buildingKind:o,valid:!0,yieldPercent:100+Math.min(50,s),bonusHexes:n}}function it(t,e,r,o){for(let i=0;i<=32;i++)for(let n=-i;n<=i;n++)for(let s=-i;s<=i;s++){if(tt(0,0,s,n)!==i)continue;let l=e+s,d=r+n,a=t.sampleCell(l,d);if(wt(a)&&(!o||o(a)))return{q:l,r:d}}return{q:e,r}}function No(t,e,r){for(let o=0;o<=45;o++)for(let i=-o;i<=o;i++)for(let n=-o;n<=o;n++){if(tt(0,0,n,i)!==o)continue;let s=e+n,l=r+i,d=t.sampleCell(s,l);if(hr(d))for(let[a,c]of Pe){let h=t.sampleCell(s+a,l+c);if(wt(h))return{water:{q:s,r:l},land:{q:s+a,r:l+c}}}}return{water:{q:e,r},land:{q:e+1,r}}}function gt(t,e,r,o,i,n,s,l=!1){let d=[];for(let a=-i;a<=i;a++)for(let c=-i;c<=i;c++){if(tt(0,0,c,a)>i)continue;let h=o.q+c,f=o.r+a,m=Fe(h,f);if(r.has(m))continue;let g=t.sampleCell(h,f);!l&&!wt(g)||g.reliefClass!=="mountain"&&(r.add(m),e.push({q:h,r:f,ownerId:n,color:s}),d.push({q:h,r:f}))}return d}function Pt(t,e,r){let o=[],i=t.q,n=t.r,s=0;for(;(i!==e.q||n!==e.r)&&s++<40;){let l=0,d=1/0;for(let h=0;h<6;h++){let f=i+Pe[h][0],m=n+Pe[h][1],g=tt(f,m,e.q,e.r);g<d&&(d=g,l=h)}let a=i+Pe[l][0],c=n+Pe[l][1];o.push({q1:i,r1:n,q2:a,r2:c,tier:r}),i=a,n=c}return o}function Kr(t,e,r=0,o="player"){let i=new Set(t.map(d=>Fe(d.q,d.r))),n=new Set,s=[],l=0;for(let d of t)for(let a=0;a<6;a++){let c=d.q+Pe[a][0],h=d.r+Pe[a][1];if(i.has(Fe(c,h)))continue;let f=Ft(d.q,d.r,c,h);n.has(f.key)||(n.add(f.key),l++,s.push({q1:f.q1,r1:f.r1,q2:f.q2,r2:f.r2,kind:e,isGate:r>0&&l%r===0,ownerId:o}))}return s}function Vn(t,e,r){let o=[],i=t,n=e,s=0;for(let l=0;l<r;l++)if(o.push({q:i,r:n,dir:s}),l%2===0)s=(s+1)%6;else{let d=(s+1)%6;i+=Pe[d][0],n+=Pe[d][1],s=(s+5)%6}return o}function Yn(t,e="vedras-welt-01",r){let o=r===void 0?Tt:r===null?void 0:r,i=zn.default.createPointSampler(e,o);if(t==="fresh-start"){let w=it(i,0,0),b=[];return gt(i,b,new Set,w,1,"player",Oe),{id:t,title:"1. Leerer Spielstart (Tag 1)",subtitle:"Hauptstadt Au\xDFenposten V \xB7 7 Starthexe \xB7 enger FoW-Kreis \xB7 1 Sp\xE4her",seed:e,cameraCenter:w,cameraZoom:.78,defaultFogMode:"realistic-fow",visibleCenters:[{q:w.q,r:w.r,visR:3,expR:5}],scene:{territory:b,buildings:[{id:"cap-1",q:w.q,r:w.r,kind:"capital",label:"Vedrashaupthof",level:5,ownerId:"player",factionColor:Oe}],units:[{id:"scout-1",q:w.q+1,r:w.r,kind:"scout",label:"Sp\xE4her I",ownerId:"player",factionColor:Oe,marchPath:[{q:w.q+1,r:w.r},{q:w.q+2,r:w.r},{q:w.q+3,r:w.r-1}]}],sites:[{id:"site-1",q:w.q-2,r:w.r+1,family:"fauna",label:"Hirschrudel"}]}}}if(t==="fortress-siege"){let w=it(i,108,-70),b=it(i,w.q+7,w.r-1),R=[],L=new Set,C=gt(i,R,L,w,3,"player",Oe);gt(i,R,L,b,3,"enemy",fr);let G=it(i,w.q+2,w.r),ee=Kr(C.filter(oe=>tt(oe.q,oe.r,w.q,w.r)<=1),"stone",3,"player");ee.length>0&&(ee[0].breached=!0);let B=[...Pt(w,G,"stone"),...Pt(G,b,"packed")],P={q:G.q+2,r:G.r},Y=[{id:"blue-cap",q:w.q,r:w.r,kind:"capital",label:"Eisenwacht",level:10,ownerId:"player",factionColor:Oe},{id:"blue-fort",q:G.q,r:G.r,kind:"fortress",label:"Ostfestung",level:4,ownerId:"player",factionColor:Oe,rangeRadius:2},{id:"red-cap",q:b.q,r:b.r,kind:"capital",label:"Rotfels",level:9,ownerId:"enemy",factionColor:fr}],le=[{id:"u-blue-def",q:G.q,r:G.r+1,kind:"army",label:"Entsatzheer",strength:340,ownerId:"player",factionColor:Oe,marchPath:[{q:w.q+1,r:w.r+1},{q:G.q,r:G.r+1}]},{id:"u-red-siege",q:P.q,r:P.r,kind:"siege_army",label:"Belagerungszug",strength:480,rams:15,ownerId:"enemy",factionColor:fr,inCombat:!0,marchPath:[P,{q:G.q+1,r:G.r}]}];return{id:t,title:"3. Belagerung & Festungskampf (M17/M24)",subtitle:"Steinmauern v7 + Tore \xB7 Festungsbeschuss-Radius \xB7 Rammbock-Belagerung",seed:e,cameraCenter:{q:Math.round((w.q+b.q)/2),r:Math.round((w.r+b.r)/2)},cameraZoom:.68,defaultFogMode:"all-visible",visibleCenters:[{q:w.q,r:w.r,visR:6,expR:12},{q:G.q,r:G.r,visR:5,expR:10}],scene:{territory:R,rivers:Vn(w.q-2,w.r-3,7),roads:B,walls:ee,buildings:Y,units:le}}}if(t==="coastal-harbors"){let w=No(i,2,-2),b=[],R=new Set;gt(i,b,R,w.land,2,"player",Oe,!1),gt(i,b,R,w.water,2,"player",Oe,!0);let L={q:w.water.q+1,r:w.water.r};for(let[ee,B]of Pe){let P=i.sampleCell(w.water.q+ee,w.water.r+B);if(hr(P)){L={q:w.water.q+ee,r:w.water.r+B};break}}let C=[{id:"coastal-cap",q:w.land.q,r:w.land.r,kind:"capital",label:"Hafenmark",level:7,ownerId:"player",factionColor:Oe},{id:"harbor-1",q:w.water.q,r:w.water.r,kind:"harbor",label:"Nordhafen",level:3,ownerId:"player",factionColor:Oe}],G=[{id:"boat-1",q:L.q,r:L.r,kind:"boat",label:"Kutter I (Fangplatz)",ownerId:"player",factionColor:Oe,marchPath:[w.water,L]},{id:"scout-sea",q:w.water.q,r:w.water.r-1,kind:"scout",label:"See-Sp\xE4her",ownerId:"player",factionColor:Oe}];return{id:t,title:"4. K\xFCstenreich, H\xE4fen & Fischerei (M23)",subtitle:"Hafen auf K\xFCstenhex \xB7 Wasserclaims \xB7 Fischerboote & See-Sp\xE4her",seed:e,cameraCenter:w.water,cameraZoom:.72,defaultFogMode:"all-visible",visibleCenters:[{q:w.water.q,r:w.water.r,visR:6,expR:11}],scene:{territory:b,roads:Pt(w.land,{q:w.land.q-2,r:w.land.r+1},"packed"),buildings:C,units:G}}}if(t==="strategic-empires"){let w=[{id:"player",name:"Krone Vedra",color:Oe,q:0,r:0},{id:"crimson",name:"Blutmark",color:fr,q:14,r:-8},{id:"emerald",name:"Gr\xFCnwald",color:Ho,q:-12,r:8},{id:"gold",name:"Sonnenbund",color:Xn,q:8,r:10}],b=[],R=new Set,L=[],C=[];for(let G of w){let ee=it(i,G.q,G.r);gt(i,b,R,ee,5,G.id,G.color),L.push({id:`emp-${G.id}`,q:ee.q,r:ee.r,kind:"capital",label:G.name,level:12,ownerId:G.id,factionColor:G.color}),C.push({id:`army-${G.id}`,q:ee.q+2,r:ee.r-1,kind:"army",label:`Heer ${G.name}`,strength:520,ownerId:G.id,factionColor:G.color})}return{id:t,title:"5. 103k-Hex Strategie\xFCbersicht (4 Reiche)",subtitle:"Strategie-Zoom (0,16\xD7) mit 4 Reichen \u2014 stufenlos in den Detail-Zoom hineinzoombar",seed:e,cameraCenter:{q:2,r:2},cameraZoom:.16,defaultFogMode:"all-visible",visibleCenters:w.map(G=>({q:G.q,r:G.r,visR:9,expR:15})),scene:{territory:b,buildings:L,units:C}}}let n=it(i,110,-70),s=it(i,n.q+4,n.r-1),l=it(i,n.q-3,n.r+3),d=[],a=new Set,c=gt(i,d,a,n,2,"player",Oe);gt(i,d,a,s,2,"player",Oe),gt(i,d,a,l,2,"player",Oe);let h=it(i,n.q+1,n.r),f=it(i,n.q-1,n.r,w=>w.forestDensity>.1),m=it(i,n.q,n.r+2),g=it(i,s.q+1,s.r),x=[{id:"cap",q:n.q,r:n.r,kind:"capital",label:"Vedrasburg",level:10,ownerId:"player",factionColor:Oe},{id:"town-2",q:s.q,r:s.r,kind:"settlement",centerStage:"city",label:"Ostfurt",level:6,ownerId:"player",factionColor:Oe},{id:"town-3",q:l.q,r:l.r,kind:"settlement",centerStage:"settlement",label:"Waldenau",level:4,ownerId:"player",factionColor:Oe,constructionProgress:.62},{id:"farm-1",q:h.q,r:h.r,kind:"farm",label:"Bauernhof",level:4,ownerId:"player",factionColor:Oe,yieldPercent:Vt(i,h.q,h.r,"farm").yieldPercent},{id:"lumber-1",q:f.q,r:f.r,kind:"lumber_camp",label:"Holzf\xE4ller",level:3,ownerId:"player",factionColor:Oe,yieldPercent:Vt(i,f.q,f.r,"lumber_camp").yieldPercent},{id:"quarry-1",q:m.q,r:m.r,kind:"quarry",label:"Steinbruch",level:2,ownerId:"player",factionColor:Oe,yieldPercent:Vt(i,m.q,m.r,"quarry").yieldPercent},{id:"fort-1",q:g.q,r:g.r,kind:"fortress",label:"Grenzfeste",level:3,ownerId:"player",factionColor:Oe,rangeRadius:2}],S=c.filter(w=>tt(w.q,w.r,n.q,n.r)===0),I=Kr(S,"stone",2,"player"),D=Kr([l],"palisade",3,"player"),v=[...Pt(n,s,"stone"),...Pt(n,l,"packed"),...Pt(n,m,"trail")],M=[{id:"merch-1",q:n.q+1,r:n.r-1,kind:"merchant",label:"H\xE4ndlerzug",ownerId:"player",factionColor:Xn,marchPath:[n,{q:n.q+2,r:n.r-1},s]},{id:"army-1",q:s.q,r:s.r+1,kind:"army",label:"1. Garde",strength:260,ownerId:"player",factionColor:Oe}],j=[{id:"site-mine",q:n.q+2,r:n.r+2,family:"forgotten_mine",label:"Vergessene Mine"},{id:"site-obelisk",q:n.q-2,r:n.r-1,family:"obelisk",label:"Alter Obelisk"}];return{id:"prosperous-realm",title:"2. Bl\xFChendes Reich (3 Zentren, Stra\xDFen & Mauern)",subtitle:"Steinmauern v7 + Palisaden + Tore \xB7 Pfad/Weg/Stra\xDFe \xB7 Fluss \xB7 D0121-Ertragsboni",seed:e,cameraCenter:n,cameraZoom:.7,defaultFogMode:"all-visible",visibleCenters:[{q:n.q,r:n.r,visR:5,expR:10},{q:s.q,r:s.r,visR:4,expR:8},{q:l.q,r:l.r,visR:4,expR:8}],scene:{territory:d,rivers:Vn(n.q-2,n.r-2,8),roads:v,walls:[...I,...D],buildings:x,units:M,sites:j}}}var jn=[{id:"prosperous-realm",label:"Bl\xFChendes Reich (Alles live)"},{id:"fresh-start",label:"Leerer Spielstart (Tag 1)"},{id:"fortress-siege",label:"Belagerung & Festungskampf"},{id:"coastal-harbors",label:"K\xFCstenreich & H\xE4fen"},{id:"strategic-empires",label:"103k Strategie-\xDCbersicht"}];function $n(t,e,r,o,i){if(o==="all-visible"||i?.has(Fe(e,r)))return 2;let n=0;for(let s of t.visibleCenters){let l=tt(s.q,s.r,e,r);if(l<=s.visR)return 2;l<=s.expR&&n<1&&(n=1)}return n}function Xo(t,e="auto"){if(e==="desktop"||e==="mobile")return e;if(t.getParameter(t.MAX_TEXTURE_SIZE)<4096)return"mobile";if(typeof navigator<"u"){let o=navigator;if(typeof o.deviceMemory=="number"&&o.deviceMemory<=4||/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))return"mobile"}return"desktop"}async function mr(t,e){let r=await fetch(t,{cache:"force-cache"});if(!r.ok)throw new Error(`Failed to fetch game asset ${t} (HTTP ${r.status})`);let o=await r.blob();return e?createImageBitmap(o,{resizeWidth:e.width,resizeHeight:e.height,resizeQuality:"high",premultiplyAlpha:"none"}):createImageBitmap(o,{premultiplyAlpha:"none"})}function Zr(t,e,r,o,i){let n=t.createTexture();if(!n)throw new Error("Failed to allocate WebGL2 atlas texture");return t.bindTexture(t.TEXTURE_2D,n),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),t.generateMipmap(t.TEXTURE_2D),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),o&&i>1&&t.texParameterf(t.TEXTURE_2D,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,i)),n}async function Qr(t,e,r="auto",o){let i=e.replace(/\/+$/,""),n=await fetch(`${i}/manifest.json`,{cache:"no-cache"});if(!n.ok)throw new Error(`Game asset manifest not found at ${i}/manifest.json (HTTP ${n.status}). Run 'npm run assets:sync' first.`);let s=await n.json();if(s.schema!=="vedras-game-assets-v1")throw new Error(`Unsupported game asset manifest schema: ${s.schema}`);let l=Xo(t,r),d=l==="mobile"?Math.min(256,s.terrain.textureSize):s.terrain.textureSize,a=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),c=a?t.getParameter(a.MAX_TEXTURE_MAX_ANISOTROPY_EXT):1,h=s.terrain.layers.length+s.nature.pages.length+s.shadows.pages.length+s.infrastructure.pages.length+(s.clouds.files.length>0?1:0),f=0,m=Y=>{f+=1,o?.(f,h,Y)},g=t.createTexture();if(!g)throw new Error("Failed to allocate WebGL2 terrain TEXTURE_2D_ARRAY");t.bindTexture(t.TEXTURE_2D_ARRAY,g);let x=Math.max(1,s.terrain.layers.length),S=Math.floor(Math.log2(d))+1;t.texStorage3D(t.TEXTURE_2D_ARRAY,S,t.RGBA8,d,d,x),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);let I=d!==s.terrain.textureSize?{width:d,height:d}:void 0,D=s.terrain.layers;for(let Y=0;Y<D.length;Y+=8){let le=D.slice(Y,Y+8),oe=await Promise.all(le.map(X=>mr(`${i}/${X.file}`,I)));t.bindTexture(t.TEXTURE_2D_ARRAY,g);for(let X=0;X<le.length;X++){let _=oe[X];t.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,le[X].layer,d,d,1,t.RGBA,t.UNSIGNED_BYTE,_),_.close(),m(`Terrain ${le[X].terrainTypeId}`)}}t.bindTexture(t.TEXTURE_2D_ARRAY,g),t.generateMipmap(t.TEXTURE_2D_ARRAY),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_S,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_WRAP_T,t.REPEAT),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.texParameteri(t.TEXTURE_2D_ARRAY,t.TEXTURE_MAG_FILTER,t.LINEAR),a&&c>1&&t.texParameterf(t.TEXTURE_2D_ARRAY,a.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,c));let v=l==="mobile"?.5:1,M=async(Y,le)=>(await Promise.all(Y.map(X=>mr(`${i}/${X.file}`,v<1?{width:Math.max(256,Math.round(X.width*v)),height:Math.max(256,Math.round(X.height*v))}:void 0)))).map((X,_)=>{let W=Zr(t,X,t.CLAMP_TO_EDGE,a,c);return X.close(),m(`${le} ${_+1}/${Y.length}`),W}),[j,w,b]=await Promise.all([M(s.nature.pages,"Natur-Atlas"),M(s.shadows.pages,"Schatten-Atlas"),M(s.infrastructure.pages,"Infra-Atlas")]),R=null,L=null;if(s.clouds.files.length>0){let Y=s.clouds.files.find(_=>_.id.startsWith("cloud_base"))??s.clouds.files[0],le=s.clouds.files.find(_=>_.id.startsWith("cloud_edge")),[oe,X]=await Promise.all([mr(`${i}/${Y.file}`),le?mr(`${i}/${le.file}`):Promise.resolve(null)]);R=Zr(t,oe,t.REPEAT,a,c),oe.close(),X&&(L=Zr(t,X,t.REPEAT,a,c),X.close()),m("Nebel-Wolken")}let G=s.terrain.byType.forest_floor?.layers?.[0]??0,B=(s.terrain.byType.coastal_water??s.terrain.byType.ocean)?.layers?.[0]??0;return{manifest:s,vramTier:l,terrainArray:g,terrainLayerSize:d,forestFloorLayer:G,coastalWaterLayer:B,naturePages:j,shadowPages:w,infraPages:b,cloudTexture:R,cloudEdgeTexture:L,dispose:()=>{t.deleteTexture(g);for(let Y of j)t.deleteTexture(Y);for(let Y of w)t.deleteTexture(Y);for(let Y of b)t.deleteTexture(Y);R&&t.deleteTexture(R),L&&t.deleteTexture(L)}}}var Vo=316/384;function Kn(t,e){return{x:256*(t+e*.5),y:je*e}}function zo(t,e,r,o){let i=e.x-t.x,n=e.y-t.y,s=o.x-r.x,l=o.y-r.y,d=i*l-n*s;if(Math.abs(d)<1e-9)return null;let a=r.x-t.x,c=r.y-t.y,h=(a*l-c*s)/d,f=(a*n-c*i)/d;return h<0||h>1||f<0||f>1?null:{x:t.x+h*i,y:t.y+h*n}}function Zn(t){let{roads:e,routes:r=[],manualRivers:o=[],lookupFog:i}=t;if(e.length===0||r.length===0&&o.length===0)return[];let n=[];for(let l of r){let d=Nt(l,34);d&&d.points.length>=2&&n.push(d)}if(o.length>0){let l=Yr(o,34);for(let d of l)d.points.length>=2&&n.push(d)}if(n.length===0)return[];let s=[];for(let l of e){let d=ot(l.q1,l.r1,l.q2,l.r2);if(d<0)continue;let a=i(l.q1,l.r1),c=i(l.q2,l.r2),h=a>=c?a:c;if(h===0)continue;let f=Kn(l.q1,l.r1),m=Kn(l.q2,l.r2),g=m.x-f.x,x=m.y-f.y,S=Math.hypot(g,x)||1,I=[];for(let v of n){let M=v.points,j=Math.max(18,v.width*.72);for(let w=1;w<M.length;w++){let b=M[w-1],R=M[w],L=zo(f,m,b,R);if(!L)continue;let C=R.x-b.x,G=R.y-b.y;Math.abs(g*G-x*C)/(S*(Math.hypot(C,G)||1))<=.16||I.some(B=>Math.hypot(B.x-L.x,B.y-L.y)<j)||s.some(B=>Math.hypot(B.ux-L.x,B.uy-L.y)<j)||I.push({x:L.x,y:L.y,width:v.width})}}let D=l.tier==="stone"?"stone":"timber";for(let v of I)s.push({ux:v.x,uy:v.y,dir:d,material:D,tier:l.tier,length:Math.max(96,v.width+64),fogState:h})}return s}function Qn(t){let{manifest:e,crossings:r,sampleReliefHeight:o}=t;if(r.length===0)return[];let i=e.infrastructure.sprites,n=[];for(let s of r){let l=String(s.dir).padStart(2,"0"),d=`bridges/${s.material}/bridge_dir_${l}`,a=`bridges/${s.material==="stone"?"timber":"stone"}/bridge_dir_${l}`,c=i[d]??i[a];if(!c)continue;let h=s.length/Vo,f=s.uy*De,m=o?o(s.ux,s.uy)*De:0,g=f-m,x=e.shadows.sprites[`bridge_shadow:axis${s.dir%3}`],S=100,I=x?{shadowPage:x.page,shadowU0:x.uv[0],shadowV0:x.uv[1],shadowU1:x.uv[2],shadowV1:x.uv[3],shadowRelLeft:x.boundsInSpriteWidth[0]*S,shadowRelTop:x.boundsInSpriteWidth[1]*S,shadowWidth:(x.boundsInSpriteWidth[2]-x.boundsInSpriteWidth[0])*S,shadowHeight:(x.boundsInSpriteWidth[3]-x.boundsInSpriteWidth[1])*S}:{};n.push({x:s.ux,y:g,relLeft:-h*.5,relTop:-h*.5,width:h,height:h,page:c.page,u0:c.uv[0],v0:c.uv[1],u1:c.uv[2],v1:c.uv[3],sortY:f-26,fogState:s.fogState,...I})}return n}var Yo={"buildings/centers/outpost":156,"buildings/centers/settlement":170,"buildings/centers/city":182,"buildings/centers/metropolis":190,"buildings/centers/capital_t1":192,"buildings/tier1/farm":174,"buildings/tier1/lumber_camp":164,"buildings/tier1/quarry":172,"buildings/tier1/iron_mine":168,"buildings/tier1/fortress":182,"buildings/tier1/watchtower":100,"buildings/tier1/harbor":184},jo={"buildings/centers/outpost":[.5,.72],"buildings/centers/settlement":[.5,.72],"buildings/centers/city":[.5,.71],"buildings/centers/metropolis":[.5,.72],"buildings/centers/capital_t1":[.5,.74],"buildings/tier1/farm":[.5,.7],"buildings/tier1/lumber_camp":[.5,.72],"buildings/tier1/quarry":[.5,.68],"buildings/tier1/iron_mine":[.5,.72],"buildings/tier1/fortress":[.5,.74],"buildings/tier1/watchtower":[.5,.87],"buildings/tier1/harbor":[.5,.7]};function $o(t,e,r,o){let i=t.infrastructure.sprites,n=Math.max(1,Math.min(4,Math.round(r||1))),s=[];if(e==="capital")for(let l=n;l>=1;l--)s.push(`buildings/centers/capital_t${l}`);else if(e==="settlement")o&&s.push(`buildings/centers/${o}`),n>=4&&s.push("buildings/centers/metropolis"),n>=3&&s.push("buildings/centers/city"),n>=2&&s.push("buildings/centers/settlement"),s.push("buildings/centers/outpost"),s.push("buildings/centers/settlement");else for(let l=n;l>=1;l--)s.push(`buildings/tier${l}/${e}`);for(let l of s)if(i[l])return l;return null}function Jn(t){let{manifest:e,buildings:r,lookupFog:o,sampleReliefHeight:i}=t,n=[],s=new Set;if(!r.length)return{sprites:n,coveredBuildingIds:s};let l=e.infrastructure.sprites;for(let d of r){let a=o(d.q,d.r);if(a===0)continue;let c=$o(e,d.kind,d.level,d.centerStage);if(!c)continue;let h=l[c];if(!h)continue;s.add(d.id);let f=ke(d.q,d.r),m=f.x,g=f.y/De,x=i?i(m,g)*De:0,S=f.y-x,I=Yo[c]??200,[D,v]=h.sourceSize,M=D>0?v/D:1,j=I*M,[w,b]=jo[c]??[.5,.72],R=e.shadows.sprites[`building_shadow:${c}`],L=R?{shadowPage:R.page,shadowU0:R.uv[0],shadowV0:R.uv[1],shadowU1:R.uv[2],shadowV1:R.uv[3],shadowRelLeft:R.boundsInSpriteWidth[0]*I,shadowRelTop:R.boundsInSpriteWidth[1]*I,shadowWidth:(R.boundsInSpriteWidth[2]-R.boundsInSpriteWidth[0])*I,shadowHeight:(R.boundsInSpriteWidth[3]-R.boundsInSpriteWidth[1])*I}:{};n.push({x:m,y:S,relLeft:-I*w,relTop:-j*b,width:I,height:j,page:h.page,u0:h.uv[0],v0:h.uv[1],u1:h.uv[2],v1:h.uv[3],sortY:f.y+8,fogState:a,...L})}return n.sort((d,a)=>d.sortY-a.sortY||d.x-a.x),{sprites:n,coveredBuildingIds:s}}var pr=.08,gr=2,eo=.15,Jr=.21;function en(t){return t>=Jr?0:t<=eo?1:(Jr-t)/(Jr-eo)}function to(t){return en(t)>=.5?"strategic":"detail"}function br(t,e,r){return t<e?e:t>r?r:t}var vr=class{constructor(e,r,o,i){this.activePointers=new Map;this.dragPointerId=null;this.dragStartScreen={x:0,y:0};this.dragLastScreen={x:0,y:0};this.draggedDistance=0;this.pinchStartDist=0;this.pinchStartZoom=1;this.lastHoverKey="";this.onWheel=e=>{e.preventDefault();let r=this.canvasCoords(e),o=Math.exp(-e.deltaY*.0014);this.zoomAtScreenPoint(r.x,r.y,this.state.zoom*o)};this.onPointerDown=e=>{if(e.button!==0&&e.pointerType==="mouse")return;this.canvas.setPointerCapture(e.pointerId);let r=this.canvasCoords(e);if(this.activePointers.set(e.pointerId,r),this.activePointers.size===1)this.dragPointerId=e.pointerId,this.dragStartScreen=r,this.dragLastScreen=r,this.draggedDistance=0;else if(this.activePointers.size===2){this.dragPointerId=null;let o=[...this.activePointers.values()];this.pinchStartDist=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y),this.pinchStartZoom=this.state.zoom}};this.onPointerMove=e=>{let r=this.canvasCoords(e);if(this.activePointers.has(e.pointerId)&&this.activePointers.set(e.pointerId,r),this.activePointers.size===2){let o=[...this.activePointers.values()],i=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);if(this.pinchStartDist>8){let n=(o[0].x+o[1].x)*.5,s=(o[0].y+o[1].y)*.5;this.zoomAtScreenPoint(n,s,this.pinchStartZoom*(i/this.pinchStartDist))}return}if(this.dragPointerId===e.pointerId){let o=r.x-this.dragLastScreen.x,i=r.y-this.dragLastScreen.y;this.dragLastScreen=r,this.draggedDistance+=Math.hypot(o,i),this.state.x-=o/this.state.zoom,this.state.y-=i/this.state.zoom,this.callbacks.onChange();return}if(this.callbacks.onHexHover){let o=At(r.x,r.y,this.state),i=et(o.x,o.y),n=`${i.q},${i.r}`;n!==this.lastHoverKey&&(this.lastHoverKey=n,this.callbacks.onHexHover(i))}};this.onPointerUp=e=>{let r=this.dragPointerId===e.pointerId,o=this.draggedDistance,i=this.canvasCoords(e);if(this.activePointers.delete(e.pointerId),r&&(this.dragPointerId=null),this.activePointers.size===1){let[n,s]=[...this.activePointers.entries()][0];this.dragPointerId=n,this.dragLastScreen=s,this.draggedDistance=999}if(r&&o<7&&(this.callbacks.onHexClick||this.callbacks.onWorldClick)){let n=At(i.x,i.y,this.state),s=et(n.x,n.y);this.callbacks.onHexClick?.(s),this.callbacks.onWorldClick?.({wx:n.x,wy:n.y,hex:s})}};this.onPointerLeave=()=>{this.lastHoverKey!==""&&this.callbacks.onHexHover&&(this.lastHoverKey="",this.callbacks.onHexHover(null))};this.canvas=e,this.callbacks=i;let n=ke(r.q,r.r),s=e.getBoundingClientRect();this.state={x:n.x,y:n.y,zoom:br(o,pr,gr),viewportWidth:Math.max(1,s.width||e.clientWidth||1280),viewportHeight:Math.max(1,s.height||e.clientHeight||720),dpr:Math.min(2,window.devicePixelRatio||1)},this.attach()}syncViewport(){let e=this.canvas.getBoundingClientRect(),r=Math.max(1,Math.round(e.width)),o=Math.max(1,Math.round(e.height)),i=Math.min(2,window.devicePixelRatio||1),n=Math.max(1,Math.round(r*i)),s=Math.max(1,Math.round(o*i)),l=this.state.viewportWidth!==r||this.state.viewportHeight!==o||this.state.dpr!==i||this.canvas.width!==n||this.canvas.height!==s;return l&&(this.state.viewportWidth=r,this.state.viewportHeight=o,this.state.dpr=i,this.canvas.width=n,this.canvas.height=s),l}centerOnHex(e,r,o){let i=ke(e,r);this.state.x=i.x,this.state.y=i.y,typeof o=="number"&&Number.isFinite(o)&&(this.state.zoom=br(o,pr,gr)),this.callbacks.onChange()}setZoom(e){this.state.zoom=br(e,pr,gr),this.callbacks.onChange()}zoomAtScreenPoint(e,r,o){let i=br(o,pr,gr);if(Math.abs(i-this.state.zoom)<1e-5)return;let n=At(e,r,this.state);this.state.zoom=i;let s=At(e,r,this.state);this.state.x+=n.x-s.x,this.state.y+=n.y-s.y,this.callbacks.onChange()}canvasCoords(e){let r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}attach(){this.canvas.style.touchAction="none",this.canvas.addEventListener("wheel",this.onWheel,{passive:!1}),this.canvas.addEventListener("pointerdown",this.onPointerDown),this.canvas.addEventListener("pointermove",this.onPointerMove),this.canvas.addEventListener("pointerup",this.onPointerUp),this.canvas.addEventListener("pointercancel",this.onPointerUp),this.canvas.addEventListener("pointerleave",this.onPointerLeave)}destroy(){this.canvas.removeEventListener("wheel",this.onWheel),this.canvas.removeEventListener("pointerdown",this.onPointerDown),this.canvas.removeEventListener("pointermove",this.onPointerMove),this.canvas.removeEventListener("pointerup",this.onPointerUp),this.canvas.removeEventListener("pointercancel",this.onPointerUp),this.canvas.removeEventListener("pointerleave",this.onPointerLeave)}};var ro={isEmpty:!0,occupiedHexKeys:new Set,segments:[],discs:[]};function yr(t,e,r){return t<e?e:t>r?r:t}function Ko(t,e,r,o,i,n){let s=i-r,l=n-o,d=s*s+l*l,a=d>1e-6?yr(((t-r)*s+(e-o)*l)/d,0,1):0,c=r+a*s,h=o+a*l,f=t-c,m=e-h;return f*f+m*m}function tn(t){if(!t)return ro;let e=new Set,r=[],o=[];if(t.buildings&&t.buildings.length>0)for(let i of t.buildings){e.add(Fe(i.q,i.r));let n=ke(i.q,i.r),s=i.kind==="capital"||i.kind==="fortress"?104:88;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-64,maxX:n.x+s+64,minY:n.y-s-64,maxY:n.y+s+64})}if(t.sites&&t.sites.length>0)for(let i of t.sites){let n=ke(i.q,i.r),s=58;o.push({cx:n.x,cy:n.y,radius:s,minX:n.x-s-56,maxX:n.x+s+56,minY:n.y-s-56,maxY:n.y+s+56})}if(t.walls&&t.walls.length>0)for(let i of t.walls){let n=ot(i.q1,i.r1,i.q2,i.r2);if(n<0)continue;let{a:s,b:l}=lt(i.q1,i.r1,n),d=i.isGate?i.kind==="stone"?24:20:i.kind==="stone"?18:14,a=i.kind==="stone"?26:16,c=a+64;r.push({ax:s.x,ay:s.y,bx:l.x,by:l.y,halfWidth:d,pierRadius:a,minX:Math.min(s.x,l.x)-c,maxX:Math.max(s.x,l.x)+c,minY:Math.min(s.y,l.y)-c,maxY:Math.max(s.y,l.y)+c,kind:"wall"})}if(t.roads&&t.roads.length>0)for(let i of t.roads){let n=ke(i.q1,i.r1),s=ke(i.q2,i.r2),l=i.tier==="stone"?30:i.tier==="packed"?24:18,d=l+56;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:l,pierRadius:l,minX:Math.min(n.x,s.x)-d,maxX:Math.max(n.x,s.x)+d,minY:Math.min(n.y,s.y)-d,maxY:Math.max(n.y,s.y)+d,kind:"road"})}if(t.rivers&&t.rivers.length>0)for(let i of t.rivers){let{a:n,b:s}=lt(i.q,i.r,i.dir),l=22,d=l+48;r.push({ax:n.x,ay:n.y,bx:s.x,by:s.y,halfWidth:l,pierRadius:20,minX:Math.min(n.x,s.x)-d,maxX:Math.max(n.x,s.x)+d,minY:Math.min(n.y,s.y)-d,maxY:Math.max(n.y,s.y)+d,kind:"river"})}return e.size===0&&r.length===0&&o.length===0?ro:{isEmpty:!1,occupiedHexKeys:e,segments:r,discs:o}}function rn(t,e){if(e.isEmpty)return!1;if(e.occupiedHexKeys.has(Fe(t.q,t.r)))return!0;if(t.isMountain)return!1;let r=t.x,o=t.sortY??t.y,i=yr(t.width*.42,12,48),n=yr(t.width*.34,10,34),s=yr(t.width*.28,8,26),l=e.discs;for(let a=0;a<l.length;a++){let c=l[a];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let h=r-c.cx,f=o-c.cy,m=c.radius+n*.6;if(h*h+f*f<=m*m)return!0}let d=e.segments;for(let a=0;a<d.length;a++){let c=d[a];if(r<c.minX||r>c.maxX||o<c.minY||o>c.maxY)continue;let h=c.kind==="wall"?i:c.kind==="road"?n:s,f=c.halfWidth+h+(c.kind==="wall"?8:4);if(Ko(r,o,c.ax,c.ay,c.bx,c.by)<=f*f)return!0;if(c.kind==="wall"){let m=c.pierRadius+i+6,g=m*m,x=r-c.ax,S=o-c.ay;if(x*x+S*S<=g)return!0;let I=r-c.bx,D=o-c.by;if(I*I+D*D<=g)return!0}}return!1}function Zo(t,e=1){return`rgba(${Math.round(t[0]*255)},${Math.round(t[1]*255)},${Math.round(t[2]*255)},${e})`}function xr(t,e,r,o,i,n,s=.86){t.font=`600 ${n}px system-ui, -apple-system, sans-serif`;let l=t.measureText(o),d=Math.max(6,n*.55),a=Math.max(3,n*.3),c=l.width+d*2,h=n+a*2,f=e-c*.5,m=r-h*.5,g=Math.min(8,h*.45);t.beginPath(),t.roundRect(f,m,c,h,g),t.fillStyle=`rgba(12, 17, 23, ${s})`,t.fill(),t.lineWidth=1.4,t.strokeStyle=Zo(i,.9),t.stroke(),t.fillStyle="#f4efe4",t.textAlign="center",t.textBaseline="middle",t.fillText(o,e,r+.5)}var nn=new WeakSet;function no(t){let{canvas:e,cam:r,scene:o,lookupFog:i,strategicBlend:n,timeSec:s}=t,l=Math.max(1,Math.round(r.viewportWidth*r.dpr)),d=Math.max(1,Math.round(r.viewportHeight*r.dpr));if(!!!(o&&(o.buildings&&o.buildings.length>0||o.sites&&o.sites.length>0||o.units&&o.units.length>0))){(nn.has(e)||e.width!==l||e.height!==d)&&(e.width=l,e.height=d,nn.delete(e));return}(e.width!==l||e.height!==d)&&(e.width=l,e.height=d);let c=e.getContext("2d");if(!c)return;c.setTransform(r.dpr,0,0,r.dpr,0,0),c.clearRect(0,0,r.viewportWidth,r.viewportHeight),nn.add(e);let h=n>=.5;if(o?.buildings)for(let f of o.buildings){let m=i(f.q,f.r);if(m===0)continue;let g=f.kind==="capital"||f.kind==="settlement",x=g||f.kind==="fortress"||f.kind==="harbor";if(h&&!x)continue;let S=ke(f.q,f.r),I=kt(S.x,S.y,r);if(I.x<-120||I.x>r.viewportWidth+120||I.y<-80||I.y>r.viewportHeight+80)continue;let D=typeof f.yieldPercent=="number"&&!h?` \xB7 ${f.yieldPercent}%`:"",v=g?`\u2605 ${f.label} (R${f.level})`:`${f.label} L${f.level}${D}`,M=h?-18:Math.max(30,(g?56:50)*r.zoom);if(xr(c,I.x,I.y+M,v,f.factionColor,g?h?12:12.5:10.5,m===1?.65:.88),typeof f.constructionProgress=="number"&&f.constructionProgress>0&&f.constructionProgress<1&&!h){let b=I.x-27,R=I.y+M+13;c.fillStyle="rgba(10, 15, 22, 0.85)",c.fillRect(b,R,54,5),c.fillStyle="#f59e0b",c.fillRect(b+1,R+1,52*f.constructionProgress,3)}}if(o.sites&&!h&&r.zoom>=.45)for(let f of o.sites){if(i(f.q,f.r)===0)continue;let m=ke(f.q,f.r),g=kt(m.x,m.y,r);g.x<-80||g.x>r.viewportWidth+80||g.y<-50||g.y>r.viewportHeight+50||xr(c,g.x,g.y+20,f.label,[.85,.68,.35],10,.78)}if(o.units)for(let f of o.units){if(i(f.q,f.r)<2)continue;let m=ke(f.q,f.r);if(f.marchPath&&f.marchPath.length>=2){let I=ke(f.marchPath[0].q,f.marchPath[0].r),D=ke(f.marchPath[1].q,f.marchPath[1].r),v=s*.14%1;m={x:I.x+(D.x-I.x)*v,y:I.y+(D.y-I.y)*v}}let g=kt(m.x,m.y,r);if(g.x<-100||g.x>r.viewportWidth+100||g.y<-60||g.y>r.viewportHeight+60)continue;let x=f.kind==="siege_army"?"\u2694":f.kind==="army"?"\u{1F6E1}":f.kind==="scout"?"\u{1F441}":f.kind==="boat"?"\u26F5":"\u2696",S=typeof f.strength=="number"?` ${f.strength}${f.rams?` + ${f.rams}R`:""}`:"";xr(c,g.x,g.y-Math.max(20,34*r.zoom),`${x} ${f.label}${S}`,f.factionColor,h?10.5:11,.92)}if(o.buildPreview){let f=o.buildPreview,m=ke(f.center.q,f.center.r),g=kt(m.x,m.y,r),x=f.yieldPercent-100,S=f.valid?`${f.buildingKind} \xB7 Ertrag ${f.yieldPercent}% (+${x}% R2)`:`Nicht baubar: ${f.reason??"ung\xFCltig"}`;xr(c,g.x,g.y-34,S,f.valid?[.25,.92,.55]:[.95,.3,.35],11.5,.92)}}var oo=`#version 300 es
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
`,Qo=`#version 300 es
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
`,Jo=`#version 300 es
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
`,io=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 p = POS[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`,ei=`#version 300 es
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
`,ti=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_shoreTex;
void main() {
  vec4 c = texture(u_shoreTex, v_uv);
  if (c.a < 0.005) discard;
  fragColor = c;
}
`;function zt(t,e,r,o){let i=t.createShader(t.VERTEX_SHADER),n=t.createShader(t.FRAGMENT_SHADER);if(!i||!n)throw new Error(`Failed to create ${o} shaders`);if(t.shaderSource(i,e),t.compileShader(i),!t.getShaderParameter(i,t.COMPILE_STATUS))throw new Error(`${o} VS error: ${t.getShaderInfoLog(i)}`);if(t.shaderSource(n,r),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`${o} FS error: ${t.getShaderInfoLog(n)}`);let s=t.createProgram();if(!s)throw new Error(`Failed to create ${o} program`);if(t.attachShader(s,i),t.attachShader(s,n),t.linkProgram(s),t.deleteShader(i),t.deleteShader(n),!t.getProgramParameter(s,t.LINK_STATUS))throw new Error(`${o} link error: ${t.getProgramInfoLog(s)}`);return s}var ri=`#version 300 es
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
`,ni=`#version 300 es
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
`,wr=class{constructor(e){this.instanceData=new Float32Array(16384*16);this.shadowFbo=null;this.shadowTex=null;this.shadowW=0;this.shadowH=0;this.lastHasCrossShadows=!1;this.shoreFbo=null;this.shoreTex=null;this.shoreW=0;this.shoreH=0;this.gl=e,this.spriteProg=zt(e,oo,Qo,"sprite"),this.shadowMaskProg=zt(e,oo,Jo,"shadow-mask"),this.compositeProg=zt(e,io,ei,"shadow-composite"),this.shoreCompositeProg=zt(e,io,ti,"shore-composite"),this.surfProg=zt(e,ri,ni,"water-surf");let r=e.createVertexArray(),o=e.createVertexArray(),i=e.createBuffer();if(!r||!o||!i)throw new Error("Failed to allocate WebGL2 sprite batcher buffers");this.vao=r,this.compositeVao=o,this.instanceVbo=i,e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let n=64;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,n,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,n,16),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,n,32),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,4,e.FLOAT,!1,n,48),e.vertexAttribDivisor(3,1),e.bindVertexArray(null);let s=(l,d)=>{let a=e.getUniformLocation(l,d);if(!a)throw new Error(`Missing uniform ${d}`);return a};this.spCam=s(this.spriteProg,"u_camCenter"),this.spView=s(this.spriteProg,"u_viewportSize"),this.spZoom=s(this.spriteProg,"u_zoom"),this.spScaleY=s(this.spriteProg,"u_scaleY"),this.spShearX=s(this.spriteProg,"u_shearX"),this.spTime=s(this.spriteProg,"u_time"),this.spWindEnabled=s(this.spriteProg,"u_windEnabled"),this.spCanvasSize=s(this.spriteProg,"u_canvasSize"),this.spMtnShadowOpacity=s(this.spriteProg,"u_mtnShadowOpacity"),this.spSelfShadow=s(this.spriteProg,"u_selfShadow"),this.spNaturePolish=s(this.spriteProg,"u_naturePolish"),this.spSpriteSat=s(this.spriteProg,"u_spriteSat"),this.spSpriteBright=s(this.spriteProg,"u_spriteBright"),this.spSpriteContrast=s(this.spriteProg,"u_spriteContrast"),this.spColorGradeAll=s(this.spriteProg,"u_colorGradeAll"),this.spDecalPass=s(this.spriteProg,"u_decalPass"),e.useProgram(this.spriteProg),e.uniform1iv(e.getUniformLocation(this.spriteProg,"u_atlases"),new Int32Array([0,1,2,3,4,5,6,7])),e.uniform1i(e.getUniformLocation(this.spriteProg,"u_mtnShadowMask"),8),this.shCam=s(this.shadowMaskProg,"u_camCenter"),this.shView=s(this.shadowMaskProg,"u_viewportSize"),this.shZoom=s(this.shadowMaskProg,"u_zoom"),this.shScaleY=s(this.shadowMaskProg,"u_scaleY"),this.shShearX=s(this.shadowMaskProg,"u_shearX"),this.shTime=s(this.shadowMaskProg,"u_time"),this.shWindEnabled=s(this.shadowMaskProg,"u_windEnabled"),this.shDecalPass=s(this.shadowMaskProg,"u_decalPass"),this.sfCam=s(this.surfProg,"u_camCenter"),this.sfView=s(this.surfProg,"u_viewportSize"),this.sfZoom=s(this.surfProg,"u_zoom"),this.sfTime=s(this.surfProg,"u_time"),this.sfWindEnabled=s(this.surfProg,"u_windEnabled"),e.useProgram(this.shadowMaskProg),e.uniform1i(e.getUniformLocation(this.shadowMaskProg,"u_atlas"),0),this.compOpacity=s(this.compositeProg,"u_shadowOpacity"),e.useProgram(this.compositeProg),e.uniform1i(e.getUniformLocation(this.compositeProg,"u_shadowMask"),0),e.useProgram(this.shoreCompositeProg),e.uniform1i(e.getUniformLocation(this.shoreCompositeProg,"u_shoreTex"),0)}ensureShadowFbo(e,r){let o=Math.max(2,Math.round(e*.5)),i=Math.max(2,Math.round(r*.5));if(this.shadowFbo&&this.shadowW===o&&this.shadowH===i)return;let{gl:n}=this;this.shadowTex&&n.deleteTexture(this.shadowTex),this.shadowFbo&&n.deleteFramebuffer(this.shadowFbo);let s=n.createTexture(),l=n.createFramebuffer();if(!s||!l)throw new Error("Failed to allocate shadow FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,l),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shadowTex=s,this.shadowFbo=l,this.shadowW=o,this.shadowH=i}ensureShoreFbo(e,r){let o=Math.max(2,e),i=Math.max(2,r);if(this.shoreFbo&&this.shoreW===o&&this.shoreH===i)return;let{gl:n}=this;this.shoreTex&&n.deleteTexture(this.shoreTex),this.shoreFbo&&n.deleteFramebuffer(this.shoreFbo);let s=n.createTexture(),l=n.createFramebuffer();if(!s||!l)throw new Error("Failed to allocate shoreline FBO");n.bindTexture(n.TEXTURE_2D,s),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,o,i,0,n.RGBA,n.UNSIGNED_BYTE,null),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.bindFramebuffer(n.FRAMEBUFFER,l),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,s,0),n.bindFramebuffer(n.FRAMEBUFFER,null),this.shoreTex=s,this.shoreFbo=l,this.shoreW=o,this.shoreH=i}renderShadows(e){let{cam:r,sprites:o,fogStates:i,walls:n=[],shadowPages:s,shadowOpacity:l,detailOpacity:d}=e;if(this.lastHasCrossShadows=!1,l<=.005||d<=.01||s.length===0||o.length===0&&n.length===0)return{drawCalls:0,renderedShadows:0};let{gl:a,instanceData:c}=this;this.ensureShadowFbo(a.canvas.width,a.canvas.height);let h=0,f=0,m=new Array(s.length).fill(0);for(let v=0;v<o.length;v++){let M=o[v];M.shadowPage<0||M.shadowPage>=s.length||i[v]!==0&&m[M.shadowPage]++}for(let v=0;v<n.length;v++){let M=n[v],j=M.shadowPage??-1;j<0||j>=s.length||M.fogState===0||m[j]++}let g=new Array(s.length).fill(0),x=0;for(let v=0;v<s.length;v++)g[v]=x,x+=m[v];if(x===0)return{drawCalls:0,renderedShadows:0};let S=[...g],I=Math.min(x,16384);for(let v=0;v<o.length;v++){let M=o[v],j=M.shadowPage;if(j<0||j>=s.length)continue;let w=i[v];if(w===0)continue;let b=S[j];if(b>=I)continue;S[j]=b+1,h++;let R=M.shadowTier??(M.isMountain?3:0);R>0&&f++;let L=b*16,C=(M.shadowMaxX-M.shadowMinX)*M.width,G=(M.shadowMaxY-M.shadowMinY)*M.width;c[L]=M.x,c[L+1]=M.y,c[L+2]=M.shadowMinX*M.width,c[L+3]=M.shadowMinY*M.width,c[L+4]=C,c[L+5]=G,c[L+6]=w===1?d*.65:d,c[L+7]=R,c[L+8]=M.shadowU0,c[L+9]=M.shadowV0,c[L+10]=M.shadowU1,c[L+11]=M.shadowV1,c[L+12]=.5,c[L+13]=0,c[L+14]=0,c[L+15]=0}for(let v=0;v<n.length;v++){let M=n[v],j=M.shadowPage??-1;if(j<0||j>=s.length||M.fogState===0)continue;let w=S[j];if(w>=I)continue;S[j]=w+1,h++,f++;let b=w*16;c[b]=M.x,c[b+1]=M.y,c[b+2]=M.shadowRelLeft??0,c[b+3]=M.shadowRelTop??0,c[b+4]=M.shadowWidth??0,c[b+5]=M.shadowHeight??0,c[b+6]=M.fogState===1?d*.65:d,c[b+7]=2,c[b+8]=M.shadowU0??0,c[b+9]=M.shadowV0??0,c[b+10]=M.shadowU1??0,c[b+11]=M.shadowV1??0,c[b+12]=.5,c[b+13]=0,c[b+14]=0,c[b+15]=0}this.lastHasCrossShadows=f>0,a.bindBuffer(a.ARRAY_BUFFER,this.instanceVbo),a.bufferSubData(a.ARRAY_BUFFER,0,c.subarray(0,I*16)),a.bindFramebuffer(a.FRAMEBUFFER,this.shadowFbo),a.viewport(0,0,this.shadowW,this.shadowH),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),a.enable(a.BLEND),a.blendEquation(a.MAX),a.blendFunc(a.ONE,a.ONE),a.useProgram(this.shadowMaskProg),a.bindVertexArray(this.vao),a.uniform2f(this.shCam,r.x,r.y),a.uniform2f(this.shView,r.viewportWidth,r.viewportHeight),a.uniform1f(this.shZoom,r.zoom),a.uniform1f(this.shScaleY,1),a.uniform1f(this.shShearX,0),a.uniform1f(this.shTime,0),a.uniform1f(this.shWindEnabled,0),a.uniform1f(this.shDecalPass,0);let D=0;a.activeTexture(a.TEXTURE0);for(let v=0;v<s.length;v++){let M=g[v],j=Math.min(S[v],I),w=j-M;w<=0||(a.bindTexture(a.TEXTURE_2D,s[v]),M===0||a.bufferSubData(a.ARRAY_BUFFER,0,c.subarray(M*16,j*16)),a.drawArraysInstanced(a.TRIANGLES,0,6,w),D++)}return a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,a.canvas.width,a.canvas.height),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ONE_MINUS_SRC_ALPHA),a.useProgram(this.compositeProg),a.bindVertexArray(this.compositeVao),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,this.shadowTex),a.uniform1f(this.compOpacity,l),a.drawArrays(a.TRIANGLES,0,3),D++,{drawCalls:D,renderedShadows:h}}renderWorldSprites(e){let{cam:r,sprites:o,fogStates:i,naturePages:n,walls:s=[],infraPages:l=[],detailOpacity:d,objectScaleY:a,objectShearX:c,shadowOpacity:h=.54,mountainShadowOnSprites:f=!0,spriteSelfShadow:m=.68,naturePolish:g=.4,spriteSaturation:x=1,spriteBrightness:S=1,spriteContrast:I=1,timeSec:D=0,windAnimation:v=!0,isDecalPass:M=!1}=e,j=o.length>0&&n.length>0,w=s.length>0&&l.length>0;if(d<=.01||!j&&!w)return{drawCalls:0,renderedSprites:0};let{gl:b,instanceData:R}=this;b.enable(b.BLEND),b.blendEquation(b.FUNC_ADD),b.blendFunc(b.ONE,b.ONE_MINUS_SRC_ALPHA),b.useProgram(this.spriteProg),b.bindVertexArray(this.vao),b.bindBuffer(b.ARRAY_BUFFER,this.instanceVbo),b.uniform2f(this.spCam,r.x,r.y),b.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),b.uniform1f(this.spZoom,r.zoom),b.uniform1f(this.spScaleY,a),b.uniform1f(this.spShearX,c),b.uniform1f(this.spTime,D),b.uniform1f(this.spWindEnabled,v?1:0),b.uniform2f(this.spCanvasSize,b.canvas.width,b.canvas.height);let L=f&&this.lastHasCrossShadows&&this.shadowTex!==null?h:0;b.uniform1f(this.spMtnShadowOpacity,L),b.uniform1f(this.spSelfShadow,m),b.uniform1f(this.spNaturePolish,g),b.uniform1f(this.spSpriteSat,x),b.uniform1f(this.spSpriteBright,S),b.uniform1f(this.spSpriteContrast,I),b.uniform1f(this.spColorGradeAll,1),b.uniform1f(this.spDecalPass,M?1:0);let C=n[0]??l[0];b.activeTexture(b.TEXTURE8),b.bindTexture(b.TEXTURE_2D,this.shadowTex??C);let G=0,ee=0,B=0,P=[],Y=new Map,le=()=>{if(B<=0)return;for(let u=0;u<P.length;u++)b.activeTexture(b.TEXTURE0+u),b.bindTexture(b.TEXTURE_2D,P[u]);let q=P[0]??C;for(let u=P.length;u<8;u++)b.activeTexture(b.TEXTURE0+u),b.bindTexture(b.TEXTURE_2D,q);b.bufferSubData(b.ARRAY_BUFFER,0,R.subarray(0,B*16)),b.drawArraysInstanced(b.TRIANGLES,0,6,B),G++,ee+=B,B=0,P=[],Y.clear()},oe=q=>{let u=Y.get(q);return u===void 0?((P.length>=8||B>=16384)&&le(),u=P.length,P.push(q),Y.set(q,u)):B>=16384&&(le(),u=0,P.push(q),Y.set(q,0)),u},X=0,_=0,W=j?o.length:0,E=w?s.length:0;for(;X<W||_<E;){let q=!1;if(X>=W)q=!0;else if(_<E){let u=o[X].sortY??o[X].y;s[_].sortY<u&&(q=!0)}if(q){let u=s[_++];if(u.fogState===0||u.page<0||u.page>=l.length)continue;let p=oe(l[u.page]),y=(u.fogState===1?1:0)|4|16,k=B*16;R[k]=u.x,R[k+1]=u.y,R[k+2]=u.relLeft,R[k+3]=u.relTop,R[k+4]=u.width,R[k+5]=u.height,R[k+6]=d,R[k+7]=p*256+y,R[k+8]=u.u0,R[k+9]=u.v0,R[k+10]=u.u1,R[k+11]=u.v1,R[k+12]=.5,R[k+13]=0,R[k+14]=0,R[k+15]=0,B++}else{let u=X++,p=i[u];if(p===0)continue;let y=o[u];if(y.page<0||y.page>=n.length)continue;let k=oe(n[y.page]),F=y.shadowTier??(y.isMountain?3:0),H=y.selfShadeWeight??(y.isGroundDecal?0:y.isMountain?.52:.72),$=Math.max(0,Math.min(7,Math.round(H*7))),N=(p===1?1:0)|(F&3)<<3|($&7)<<5;y.isMountain||(N|=2,y.isSnowFamily&&(N|=4));let se=!!y.flipX,ue=se?1-y.anchorX:y.anchorX,Q=B*16;R[Q]=y.x,R[Q+1]=y.y,R[Q+2]=-y.width*ue,R[Q+3]=-y.height*y.anchorY,R[Q+4]=y.width,R[Q+5]=y.height,R[Q+6]=d,R[Q+7]=k*256+N,R[Q+8]=se?y.u1:y.u0,R[Q+9]=y.v0,R[Q+10]=se?y.u0:y.u1,R[Q+11]=y.v1,R[Q+12]=y.tintHash??.5,R[Q+13]=M?y.rotationRad??0:y.swayAmp??0,R[Q+14]=M?y.terrainTintRgb??0:0,R[Q+15]=M?y.terrainTintMix??0:0,B++}}return le(),{drawCalls:G,renderedSprites:ee}}renderWallSprites(e){return this.renderWorldSprites({cam:e.cam,sprites:[],fogStates:[],naturePages:[],walls:e.walls,infraPages:e.infraPages,detailOpacity:e.detailOpacity,objectScaleY:1,objectShearX:0,shadowOpacity:e.shadowOpacity,mountainShadowOnSprites:e.mountainShadowOnSprites})}renderShorelines(e){let{cam:r,shorelines:o,fogStates:i,infraPages:n,projectY:s}=e;if(o.length===0||n.length===0)return{drawCalls:0,renderedShorelines:0};let{gl:l,instanceData:d}=this;this.ensureShoreFbo(l.canvas.width,l.canvas.height),l.bindFramebuffer(l.FRAMEBUFFER,this.shoreFbo),l.viewport(0,0,this.shoreW,this.shoreH),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.enable(l.BLEND),l.blendEquation(l.MAX),l.blendFunc(l.ONE,l.ONE),l.useProgram(this.spriteProg),l.bindVertexArray(this.vao),l.bindBuffer(l.ARRAY_BUFFER,this.instanceVbo),l.uniform2f(this.spCam,r.x,r.y),l.uniform2f(this.spView,r.viewportWidth,r.viewportHeight),l.uniform1f(this.spZoom,r.zoom),l.uniform1f(this.spScaleY,1),l.uniform1f(this.spShearX,0),l.uniform1f(this.spTime,0),l.uniform1f(this.spWindEnabled,0),l.uniform2f(this.spCanvasSize,this.shoreW,this.shoreH),l.uniform1f(this.spMtnShadowOpacity,0),l.uniform1f(this.spSelfShadow,0),l.uniform1f(this.spNaturePolish,0),l.uniform1f(this.spSpriteSat,1),l.uniform1f(this.spSpriteBright,1),l.uniform1f(this.spSpriteContrast,1),l.uniform1f(this.spColorGradeAll,0),l.uniform1f(this.spDecalPass,0);let a=Math.min(n.length,8);for(let S=0;S<8;S++)l.activeTexture(l.TEXTURE0+S),l.bindTexture(l.TEXTURE_2D,n[S<a?S:0]);l.activeTexture(l.TEXTURE8),l.bindTexture(l.TEXTURE_2D,n[0]);let c=0,h=0,f=0,m=()=>{f<=0||(l.bufferSubData(l.ARRAY_BUFFER,0,d.subarray(0,f*16)),l.drawArraysInstanced(l.TRIANGLES,0,6,f),c++,h+=f,f=0)},g=512,x=512*s;for(let S=0;S<o.length;S++){let I=i[S];if(I===0)continue;let D=o[S];if(D.page<0||D.page>=a)continue;f>=16384&&m();let v=f*16;d[v]=D.x,d[v+1]=D.y,d[v+2]=-g*.5,d[v+3]=-x*.5,d[v+4]=g,d[v+5]=x,d[v+6]=1,d[v+7]=D.page*256+4+24+(I===1?1:0),d[v+8]=D.u0,d[v+9]=D.v0,d[v+10]=D.u1,d[v+11]=D.v1,d[v+12]=.5,d[v+13]=0,d[v+14]=0,d[v+15]=0,f++}return m(),l.bindFramebuffer(l.FRAMEBUFFER,null),l.viewport(0,0,l.canvas.width,l.canvas.height),l.blendEquation(l.FUNC_ADD),l.blendFunc(l.ONE,l.ONE_MINUS_SRC_ALPHA),h>0&&(l.useProgram(this.shoreCompositeProg),l.bindVertexArray(this.compositeVao),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,this.shoreTex),l.drawArrays(l.TRIANGLES,0,3),c++),{drawCalls:c,renderedShorelines:h}}renderWaterSurfRings(e){let{cam:r,sprites:o,fogStates:i,detailOpacity:n,timeSec:s,windAnimation:l}=e;if(n<=.02||o.length===0)return 0;let{gl:d,instanceData:a}=this,c=0;for(let h=0;h<o.length;h++){let f=o[h];if(!f.isWaterBoulder)continue;let m=i[h];if(m===0)continue;if(c>=16384)break;let g=f.width*.68,x=f.width*.25,S=c*16;a[S]=f.x,a[S+1]=f.y-f.height*.04,a[S+2]=-g,a[S+3]=-x,a[S+4]=g*2,a[S+5]=x*2,a[S+6]=n,a[S+7]=m===1?1:0,a[S+8]=0,a[S+9]=0,a[S+10]=0,a[S+11]=0,a[S+12]=f.tintHash??.5,a[S+13]=0,a[S+14]=0,a[S+15]=0,c++}return c===0?0:(d.enable(d.BLEND),d.blendEquation(d.FUNC_ADD),d.blendFunc(d.ONE,d.ONE_MINUS_SRC_ALPHA),d.useProgram(this.surfProg),d.bindVertexArray(this.vao),d.bindBuffer(d.ARRAY_BUFFER,this.instanceVbo),d.uniform2f(this.sfCam,r.x,r.y),d.uniform2f(this.sfView,r.viewportWidth,r.viewportHeight),d.uniform1f(this.sfZoom,r.zoom),d.uniform1f(this.sfTime,s),d.uniform1f(this.sfWindEnabled,l?1:0),d.bufferSubData(d.ARRAY_BUFFER,0,a.subarray(0,c*16)),d.drawArraysInstanced(d.TRIANGLES,0,6,c),1)}dispose(){let{gl:e}=this;this.shadowTex&&e.deleteTexture(this.shadowTex),this.shadowFbo&&e.deleteFramebuffer(this.shadowFbo),this.shoreTex&&e.deleteTexture(this.shoreTex),this.shoreFbo&&e.deleteFramebuffer(this.shoreFbo),e.deleteBuffer(this.instanceVbo),e.deleteVertexArray(this.vao),e.deleteVertexArray(this.compositeVao),e.deleteProgram(this.spriteProg),e.deleteProgram(this.shadowMaskProg),e.deleteProgram(this.compositeProg),e.deleteProgram(this.shoreCompositeProg),e.deleteProgram(this.surfProg)}};var mt=256,oi=`#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_ndc;
void main() {
  v_ndc = POS[gl_VertexID];
  gl_Position = vec4(v_ndc, 0.0, 1.0);
}
`,ii=`#version 300 es
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
const float PROJ_Y = ${De.toFixed(4)};
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
`,si=`#version 300 es
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
const float PROJ_Y = ${De.toFixed(4)};
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
`;function on(t,e,r){let o=t.createShader(e);if(!o)throw new Error("Failed to allocate WebGL2 shader");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS)){let i=t.getShaderInfoLog(o)||"Unknown shader error";throw t.deleteShader(o),new Error(`Terrain shader compile error:
${i}`)}return o}var _r=class{constructor(e){this.cellBuf=new Uint8Array(mt*mt*4);this.lastMinQ=Number.NaN;this.lastMinR=Number.NaN;this.lastSpanQ=0;this.lastSpanR=0;this.lastDataRevision=-1;this.hasUnknownCells=!1;this.surfaceWin=null;this.lastSurfaceRevision=-1;this.lastSurfaceStrength=-1;this.lastSurfaceStyle="sculpted";this.gl=e;let r=on(e,e.VERTEX_SHADER,oi),o=on(e,e.FRAGMENT_SHADER,ii),i=e.createProgram();if(!i)throw new Error("Failed to create terrain program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS)){let h=e.getProgramInfoLog(i)||"Unknown link error";throw e.deleteShader(r),e.deleteProgram(i),new Error(`Terrain program link error:
${h}`)}this.program=i;let n=on(e,e.FRAGMENT_SHADER,si),s=e.createProgram();if(!s)throw e.deleteShader(r),e.deleteShader(n),new Error("Failed to create cloud overlay program");if(e.attachShader(s,r),e.attachShader(s,n),e.linkProgram(s),e.deleteShader(r),e.deleteShader(n),!e.getProgramParameter(s,e.LINK_STATUS)){let h=e.getProgramInfoLog(s)||"Unknown link error";throw e.deleteProgram(s),new Error(`Cloud overlay program link error:
${h}`)}this.cloudProgram=s;let l=e.createVertexArray();if(!l)throw new Error("Failed to create terrain VAO");this.vao=l;let d=e.createTexture();if(!d)throw new Error("Failed to allocate terrain cell data texture");this.cellTex=d,e.bindTexture(e.TEXTURE_2D,d),e.texStorage2D(e.TEXTURE_2D,1,e.RGBA8UI,mt,mt),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let a=e.createTexture();if(!a)throw new Error("Failed to allocate surface field texture");this.surfaceTex=a,e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let c=(h,f)=>{let m=e.getUniformLocation(h,f);if(!m)throw new Error(`Missing terrain uniform: ${f}`);return m};this.uCamCenter=c(i,"u_camCenter"),this.uViewportSize=c(i,"u_viewportSize"),this.uZoom=c(i,"u_zoom"),this.uTime=c(i,"u_time"),this.uGridOrigin=c(i,"u_gridOrigin"),this.uGridSize=c(i,"u_gridSize"),this.uForestFloorLayer=c(i,"u_forestFloorLayer"),this.uShowGrid=c(i,"u_showGrid"),this.uHoverHex=c(i,"u_hoverHex"),this.uSurfaceRect=c(i,"u_surfaceRect"),this.uEdgeBand=c(i,"u_edgeBand"),this.uWaterHexMode=c(i,"u_waterHexMode"),this.uReliefEnabled=c(i,"u_reliefEnabled"),this.uReliefLighting=c(i,"u_reliefLighting"),this.uWindEnabled=c(i,"u_windEnabled"),e.useProgram(i),e.uniform1i(e.getUniformLocation(i,"u_terrainArray"),0),e.uniform1i(e.getUniformLocation(i,"u_cellData"),1),e.uniform1i(e.getUniformLocation(i,"u_surfaceField"),3),this.cuCamCenter=c(s,"u_camCenter"),this.cuViewportSize=c(s,"u_viewportSize"),this.cuZoom=c(s,"u_zoom"),this.cuTime=c(s,"u_time"),this.cuGridOrigin=c(s,"u_gridOrigin"),this.cuGridSize=c(s,"u_gridSize"),this.cuHasClouds=c(s,"u_hasClouds"),this.cuHasCloudEdge=c(s,"u_hasCloudEdge"),this.cuWindEnabled=c(s,"u_windEnabled"),e.useProgram(s),e.uniform1i(e.getUniformLocation(s,"u_cellData"),1),e.uniform1i(e.getUniformLocation(s,"u_cloudTex"),2),e.uniform1i(e.getUniformLocation(s,"u_cloudEdgeTex"),4)}invalidateWindow(){this.lastDataRevision=-1,this.lastSurfaceRevision=-1}sampleReliefHeight(e,r){return Un(this.surfaceWin,e,r)}render(e){let{gl:r,program:o,vao:i,cellTex:n,surfaceTex:s,cellBuf:l}=this,{cam:d,assets:a,lookupHex:c,resolveTerrainLayer:h,isWaterTerrain:f,seedInt:m,dataRevision:g,timeSec:x,showGrid:S,hoverHex:I,edgeBand:D=28,waterSampling:v="hex",reliefEnabled:M=!0,reliefStrength:j=Ht,reliefLighting:w=!0,reliefStyle:b="sculpted",windAnimation:R=!0}=e,L=Ar(d,4),C=L.maxQ-L.minQ+1,G=L.maxR-L.minR+1,ee=L.minQ,B=L.minR;C>mt&&(ee=Math.floor((L.minQ+L.maxQ)/2)-Math.floor(mt/2),C=mt),G>mt&&(B=Math.floor((L.minR+L.maxR)/2)-Math.floor(mt/2),G=mt);let P=!1;if(ee!==this.lastMinQ||B!==this.lastMinR||C!==this.lastSpanQ||G!==this.lastSpanR||g!==this.lastDataRevision){let p=0,y=!1;for(let k=0;k<G;k++){let F=B+k;for(let H=0;H<C;H++){let $=ee+H,N=c($,F);if(!N||N.fogState===0)y=!0,l[p++]=0,l[p++]=0,l[p++]=0,l[p++]=0;else{let se=f(N.terrainId)?1:0,ue=Ct.has(N.terrainId)?2:0,Q=N.terrainId==="icy_ocean"?4:0;l[p++]=h(N.terrainId,$,F)&255,l[p++]=0,l[p++]=N.fogState,l[p++]=se|ue|Q}}}this.hasUnknownCells=y,r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texSubImage2D(r.TEXTURE_2D,0,0,0,C,G,r.RGBA_INTEGER,r.UNSIGNED_BYTE,l.subarray(0,C*G*4)),this.lastMinQ=ee,this.lastMinR=B,this.lastSpanQ=C,this.lastSpanR=G,this.lastDataRevision=g,P=!0}let Y=M?j:0,le=d.viewportWidth*.5/d.zoom,oe=d.viewportHeight*.5/(d.zoom*De),X=d.x-le-140,_=d.x+le+140,W=d.y/De-oe-180,E=d.y/De+oe+220;if(!this.surfaceWin||this.lastSurfaceRevision!==g||this.lastSurfaceStrength!==Y||this.lastSurfaceStyle!==b||X<this.surfaceWin.left||_>this.surfaceWin.left+this.surfaceWin.width||W<this.surfaceWin.top||E>this.surfaceWin.top+this.surfaceWin.height||this.surfaceWin.width>(_-X)*3.5){let p=Math.max(384,(_-X)*.35),y=Math.max(384,(E-W)*.35),k=X-p,F=W-y,H=_-X+p*2,$=E-W+y*2,N=Math.max(16,Math.ceil(Math.max(H/200,$/150)));this.surfaceWin=Bn({left:k,top:F,width:H,height:$,step:N,lookupHex:c,manifest:a.manifest,seedInt:m,reliefStrength:Y,reliefStyle:b}),this.lastSurfaceRevision=g,this.lastSurfaceStrength=Y,this.lastSurfaceStyle=b,r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,this.surfaceWin.cols,this.surfaceWin.rows,0,r.RGBA,r.UNSIGNED_BYTE,this.surfaceWin.rgba)}r.useProgram(o),r.bindVertexArray(i),r.disable(r.BLEND),r.activeTexture(r.TEXTURE0),r.bindTexture(r.TEXTURE_2D_ARRAY,a.terrainArray),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE3),r.bindTexture(r.TEXTURE_2D,s),r.uniform2f(this.uCamCenter,d.x,d.y),r.uniform2f(this.uViewportSize,d.viewportWidth,d.viewportHeight),r.uniform1f(this.uZoom,d.zoom),r.uniform1f(this.uTime,x),r.uniform2i(this.uGridOrigin,ee,B),r.uniform2i(this.uGridSize,C,G),r.uniform1i(this.uForestFloorLayer,a.forestFloorLayer),r.uniform1f(this.uShowGrid,S?1:0),r.uniform2i(this.uHoverHex,I?I.q:-999999,I?I.r:-999999);let u=this.surfaceWin;return r.uniform4f(this.uSurfaceRect,u?u.left:0,u?u.top:0,u?u.width:1,u?u.height:1),r.uniform1f(this.uEdgeBand,Math.max(8,Math.min(48,D))),r.uniform1f(this.uWaterHexMode,v==="hex"?1:0),r.uniform1f(this.uReliefEnabled,M?1:0),r.uniform1f(this.uReliefLighting,w?1:0),r.uniform1f(this.uWindEnabled,R?1:0),r.drawArrays(r.TRIANGLES,0,3),{visibleHexes:C*G,uploaded:P}}renderCloudOverlay(e){if(!this.hasUnknownCells||this.lastSpanQ<=0||this.lastSpanR<=0)return 0;let{gl:r,cloudProgram:o,vao:i,cellTex:n}=this,{cam:s,assets:l,timeSec:d,windAnimation:a=!0}=e;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(o),r.bindVertexArray(i),r.activeTexture(r.TEXTURE1),r.bindTexture(r.TEXTURE_2D,n),r.activeTexture(r.TEXTURE2),r.bindTexture(r.TEXTURE_2D,l.cloudTexture),r.activeTexture(r.TEXTURE4),r.bindTexture(r.TEXTURE_2D,l.cloudEdgeTexture??l.cloudTexture),r.uniform2f(this.cuCamCenter,s.x,s.y),r.uniform2f(this.cuViewportSize,s.viewportWidth,s.viewportHeight),r.uniform1f(this.cuZoom,s.zoom),r.uniform1f(this.cuTime,d),r.uniform2i(this.cuGridOrigin,this.lastMinQ,this.lastMinR),r.uniform2i(this.cuGridSize,this.lastSpanQ,this.lastSpanR),r.uniform1f(this.cuHasClouds,l.cloudTexture?1:0),r.uniform1f(this.cuHasCloudEdge,l.cloudEdgeTexture?1:0),r.uniform1f(this.cuWindEnabled,a?1:0),r.drawArrays(r.TRIANGLES,0,3),1}dispose(){this.gl.deleteTexture(this.cellTex),this.gl.deleteTexture(this.surfaceTex),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program),this.gl.deleteProgram(this.cloudProgram)}};var so=65536,Sr=6,ai=`#version 300 es
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
`,li=`#version 300 es
precision highp float;
in vec4 v_color;
out vec4 fragColor;
void main() {
  // Premultiplied alpha output
  fragColor = vec4(v_color.rgb * v_color.a, v_color.a);
}
`,ao={trail:{shoulderWidth:32,coreWidth:16,shoulderColor:[.56,.46,.31,.34],coreColor:[.64,.54,.37,.78]},packed:{shoulderWidth:40,coreWidth:24,shoulderColor:[.47,.39,.28,.45],coreColor:[.69,.6,.45,.88]},stone:{shoulderWidth:46,coreWidth:31,shoulderColor:[.33,.32,.28,.58],coreColor:[.65,.63,.57,.96]}},Cr=class{constructor(e){this.verts=new Float32Array(so*Sr);this.vertCount=0;this.gl=e;let r=e.createShader(e.VERTEX_SHADER),o=e.createShader(e.FRAGMENT_SHADER);if(!r||!o)throw new Error("Failed to allocate vector shaders");if(e.shaderSource(r,ai),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(`Vector VS error: ${e.getShaderInfoLog(r)}`);if(e.shaderSource(o,li),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(`Vector FS error: ${e.getShaderInfoLog(o)}`);let i=e.createProgram();if(!i)throw new Error("Failed to allocate vector program");if(e.attachShader(i,r),e.attachShader(i,o),e.linkProgram(i),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(`Vector link error: ${e.getProgramInfoLog(i)}`);this.program=i;let n=e.createVertexArray(),s=e.createBuffer();if(!n||!s)throw new Error("Failed to allocate vector VAO/VBO");this.vao=n,this.vbo=s,e.bindVertexArray(n),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,this.verts.byteLength,e.DYNAMIC_DRAW);let l=Sr*4;e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,l,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,l,8),e.bindVertexArray(null);let d=a=>{let c=e.getUniformLocation(i,a);if(!c)throw new Error(`Missing vector uniform: ${a}`);return c};this.uCamCenter=d("u_camCenter"),this.uViewportSize=d("u_viewportSize"),this.uZoom=d("u_zoom")}pushTri(e,r,o,i,n,s,l,d,a,c){if(this.vertCount+3>so)return;let h=this.vertCount*Sr,f=this.verts;f[h++]=e,f[h++]=r,f[h++]=l,f[h++]=d,f[h++]=a,f[h++]=c,f[h++]=o,f[h++]=i,f[h++]=l,f[h++]=d,f[h++]=a,f[h++]=c,f[h++]=n,f[h++]=s,f[h++]=l,f[h++]=d,f[h++]=a,f[h++]=c,this.vertCount+=3}pushSegment(e,r,o,i){let n=r.x-e.x,s=r.y-e.y,l=Math.hypot(n,s);if(l<1e-4)return;let d=-s/l*(o*.5),a=n/l*(o*.5),[c,h,f,m]=i;this.pushTri(e.x-d,e.y-a,e.x+d,e.y+a,r.x+d,r.y+a,c,h,f,m),this.pushTri(e.x-d,e.y-a,r.x+d,r.y+a,r.x-d,r.y-a,c,h,f,m)}pushDisc(e,r,o,i,n,s){let[l,d,a,c]=s;for(let h=0;h<n;h++){let f=h/n*Math.PI*2,m=(h+1)/n*Math.PI*2;this.pushTri(e,r,e+Math.cos(f)*o,r+Math.sin(f)*i,e+Math.cos(m)*o,r+Math.sin(m)*i,l,d,a,c)}}pushHexFill(e,r,o,i=1){let n=ke(e,r),s=Qt(e,r),[l,d,a,c]=o;for(let h=0;h<6;h++){let f=s[h],m=s[(h+1)%6],g=n.x+(f.x-n.x)*i,x=n.y+(f.y-n.y)*i,S=n.x+(m.x-n.x)*i,I=n.y+(m.y-n.y)*i;this.pushTri(n.x,n.y,g,x,S,I,l,d,a,c)}}flush(e){if(this.vertCount===0)return 0;let{gl:r}=this;return r.enable(r.BLEND),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.useProgram(this.program),r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferSubData(r.ARRAY_BUFFER,0,this.verts.subarray(0,this.vertCount*Sr)),r.uniform2f(this.uCamCenter,e.x,e.y),r.uniform2f(this.uViewportSize,e.viewportWidth,e.viewportHeight),r.uniform1f(this.uZoom,e.zoom),r.drawArrays(r.TRIANGLES,0,this.vertCount),this.vertCount=0,1}renderGroundPass(e){let{cam:r,scene:o,lookupFog:i,strategicBlend:n,sampleReliefHeight:s}=e;if(!o)return 0;this.vertCount=0;let l=d=>s?{x:d.x,y:d.y-s(d.x,d.y/De)*De}:d;if(o.territory&&o.territory.length>0){let d=new Map;for(let f of o.territory)d.set(Fe(f.q,f.r),f.ownerId);let a=.08+n*.24,c=Math.max(7,10/Math.max(.2,r.zoom*1.1)),h=.75+n*.2;for(let f of o.territory){let m=i(f.q,f.r);if(m===0)continue;let g=m===1?.65:1,[x,S,I]=f.color;this.pushHexFill(f.q,f.r,[x,S,I,a*g],.98);for(let D=0;D<6;D++){let[v,M]=Pe[D];if(d.get(Fe(f.q+v,f.r+M))!==f.ownerId){let{a:w,b}=lt(f.q,f.r,D),R=ke(f.q,f.r),L={x:w.x+(R.x-w.x)*.05,y:w.y+(R.y-w.y)*.05},C={x:b.x+(R.x-b.x)*.05,y:b.y+(R.y-b.y)*.05};this.pushSegment(L,C,c,[x,S,I,h*g])}}}}if(o.buildings&&o.buildings.length>0&&n<.85){let d=1-n*.85;for(let a of o.buildings){let c=i(a.q,a.r);if(c===0)continue;let h=(c===1?.65:1)*d,f=l(ke(a.q,a.r)),g=a.kind==="capital"||a.kind==="settlement"||a.kind==="fortress"?106:78,x=g*.72;this.pushDisc(f.x,f.y+4,g*1.18,x*1.18,18,[.42,.36,.26,.22*h]),this.pushDisc(f.x,f.y+4,g*.88,x*.88,16,[.48,.42,.31,.36*h])}}if(o.roads&&o.roads.length>0&&n<.85){let d=1-n*.8,a=new Map,c={trail:1,packed:2,stone:3},h=s?4:1;for(let f of o.roads){let m=i(f.q1,f.r1),g=i(f.q2,f.r2);if(m===0&&g===0)continue;let x=(m===2||g===2?1:.68)*d,S=ke(f.q1,f.r1),I=ke(f.q2,f.r2),D=ao[f.tier],v=[];for(let M=0;M<=h;M++){let j=M/h;v.push(l({x:S.x+(I.x-S.x)*j,y:S.y+(I.y-S.y)*j}))}for(let M=0;M<h;M++)this.pushSegment(v[M],v[M+1],D.shoulderWidth+16,[.44,.37,.25,.18*x]);for(let M=0;M<h;M++)this.pushSegment(v[M],v[M+1],D.shoulderWidth,[D.shoulderColor[0],D.shoulderColor[1],D.shoulderColor[2],D.shoulderColor[3]*x]);for(let M=0;M<h;M++)this.pushSegment(v[M],v[M+1],D.coreWidth,[D.coreColor[0],D.coreColor[1],D.coreColor[2],D.coreColor[3]*x]),M>0&&this.pushDisc(v[M].x,v[M].y,D.coreWidth*.5,D.coreWidth*.5,8,[D.coreColor[0],D.coreColor[1],D.coreColor[2],D.coreColor[3]*x]);for(let[M,j,w]of[[f.q1,f.r1,v[0]],[f.q2,f.r2,v[h]]]){let b=Fe(M,j),R=a.get(b);(!R||c[f.tier]>c[R.tier])&&a.set(b,{pt:w,tier:f.tier,dim:x})}}for(let f of a.values()){let m=ao[f.tier];this.pushDisc(f.pt.x,f.pt.y,(m.shoulderWidth+10)*.52,(m.shoulderWidth+10)*.45,12,[.44,.37,.25,.16*f.dim]),this.pushDisc(f.pt.x,f.pt.y,m.coreWidth*.54,m.coreWidth*.46,12,[m.coreColor[0],m.coreColor[1],m.coreColor[2],m.coreColor[3]*f.dim])}}if(o.buildPreview){let d=o.buildPreview;for(let c of d.bonusHexes)this.pushHexFill(c.q,c.r,[.22,.82,.48,.24],.92);let a=d.valid?[.25,.92,.55,.42]:[.95,.28,.34,.45];this.pushHexFill(d.center.q,d.center.r,a,.96)}if(o.selectedHex){let d=Qt(o.selectedHex.q,o.selectedHex.r),a=Math.max(5,6/Math.max(.25,r.zoom));for(let c=0;c<6;c++)this.pushSegment(d[c],d[(c+1)%6],a,[1,.85,.3,.95])}return this.flush(r)}renderTacticalPass(e){let{cam:r,scene:o,lookupFog:i,timeSec:n,coveredBuildingIds:s}=e;if(!o)return 0;if(this.vertCount=0,o.buildings)for(let l of o.buildings){let d=i(l.q,l.r);if(d===0)continue;let a=d===1?.65:1,c=ke(l.q,l.r),[h,f,m]=l.factionColor;if(l.rangeRadius&&l.rangeRadius>0){let v=l.rangeRadius*240,M=v*.85,j=36;for(let w=0;w<j;w+=2){let b=w/j*Math.PI*2,R=(w+1)/j*Math.PI*2;this.pushSegment({x:c.x+Math.cos(b)*v,y:c.y+Math.sin(b)*M},{x:c.x+Math.cos(R)*v,y:c.y+Math.sin(R)*M},Math.max(4,3.5/Math.max(.2,r.zoom)),[h,f,m,.45*a])}}if(s?.has(l.id))continue;let g=l.kind==="capital"||l.kind==="settlement",x=l.kind==="fortress"||l.kind==="watchtower",S=g?78:x?64:52,I=g?68:x?76:42;this.pushDisc(c.x-10,c.y+8,S*1.12,S*.62,16,[.05,.07,.09,.45*a]),this.pushDisc(c.x,c.y+4,S,S*.56,6,[.34,.32,.29,.96*a]);let D=S*.68;this.pushTri(c.x-D,c.y+6,c.x+D,c.y+6,c.x+D,c.y-I*.65,.78*a,.74*a,.66*a,.98),this.pushTri(c.x-D,c.y+6,c.x+D,c.y-I*.65,c.x-D,c.y-I*.65,.66*a,.62*a,.55*a,.98),this.pushTri(c.x-D*1.18,c.y-I*.62,c.x+D*1.18,c.y-I*.62,c.x,c.y-I*1.25,h*a,f*a,m*a,.98),(g||x)&&this.pushTri(c.x-14,c.y-I*.95,c.x+14,c.y-I*.95,c.x,c.y-I*1.55,.96*a,.8*a,.34*a,.98)}if(o.sites)for(let l of o.sites){if(i(l.q,l.r)===0)continue;let a=ke(l.q,l.r),c=26,h=l.family==="fauna"?[.85,.58,.25,.9]:l.family==="forgotten_mine"?[.62,.76,.92,.9]:[.76,.54,.96,.9];this.pushTri(a.x,a.y-c,a.x+c,a.y,a.x,a.y+c,h[0],h[1],h[2],h[3]),this.pushTri(a.x,a.y-c,a.x,a.y+c,a.x-c,a.y,h[0]*.8,h[1]*.8,h[2]*.8,h[3])}if(o.units)for(let l of o.units){if(i(l.q,l.r)<2)continue;let[a,c,h]=l.factionColor,f=ke(l.q,l.r);if(l.marchPath&&l.marchPath.length>=2){let m=l.marchPath.map(R=>ke(R.q,R.r));for(let R=0;R<m.length-1;R++)this.pushSegment(m[R],m[R+1],Math.max(8,6/Math.max(.2,r.zoom)),[a,c,h,.78]);let g=m[m.length-1],x=m[m.length-2],S=g.x-x.x,I=g.y-x.y,D=Math.hypot(S,I)||1,v=S/D,M=I/D,j=g,w={x:g.x-v*28,y:g.y-M*28};this.pushTri(j.x,j.y,w.x-M*18,w.y+v*18,w.x+M*18,w.y-v*18,a,c,h,.95);let b=n*.14%1;f={x:m[0].x+(m[1].x-m[0].x)*b,y:m[0].y+(m[1].y-m[0].y)*b}}if(l.inCombat){let m=1+.22*Math.sin(n*5);this.pushDisc(f.x,f.y,56*m,44*m,20,[.98,.26,.22,.35])}this.pushDisc(f.x,f.y+6,36,22,16,[.04,.06,.08,.55]),this.pushDisc(f.x,f.y-16,32,32,18,[.95,.88,.68,.98]),this.pushDisc(f.x,f.y-16,26,26,18,[a,c,h,.98])}if(o.walls)for(let l of o.walls){if(!l.breached)continue;let d=ot(l.q1,l.r1,l.q2,l.r2);if(d<0)continue;let{mid:a}=lt(l.q1,l.r1,d),c=1+.18*Math.sin(n*4.5);this.pushDisc(a.x,a.y,32*c,24*c,14,[.96,.35,.16,.62])}return this.flush(r)}dispose(){this.gl.deleteBuffer(this.vbo),this.gl.deleteVertexArray(this.vao),this.gl.deleteProgram(this.program)}};var ci=[[140,148,6,78.368581],[28,210,14,78.184291],[141,148,134,78.815709],[141,148,134,141.631419],[28,210,14,203.815709],[141,148,6,141.184291]],ui=[[156,167,14,89],[40,216,20,82],[156,167,142,89],[156,167,142,152],[40,216,20,208],[156,167,14,152]],di={palisade:{cornerW:25,cornerH:76,endW:23,endH:76,south:3.5},stone:{cornerW:46,cornerH:84,endW:46,endH:84,south:9.5}};function fi(t,e,r,o){let i=t.infrastructure.sprites,n=[];e==="stone"?(o?(n.push(`walls/stone/gates/v1/gate_dir${r}`),r===5&&n.push("walls/stone/gates/v1/gate_dir2"),n.push(`walls/stone/v7/edge_dir${r}`)):n.push(`walls/stone/v7/edge_dir${r}`),n.push(`walls/palisade/edge_dir${r}`)):(o&&n.push(`walls/palisade/gates/v1/gate_dir${r}`),n.push(`walls/palisade/edge_dir${r}`));for(let s of n)if(i[s])return s;return null}function hi(t,e,r){let o=t.infrastructure.sprites,i=e==="stone"?"corner_post":r?"end_post":"corner_post",n=e==="stone"?[`walls/stone/v7/${i}`,`walls/palisade/${i}`]:[`walls/palisade/${i}`];for(let s of n)if(o[s])return s;return null}function lo(t,e){let r=t.shadows.sprites[e];if(!r)return{};let[o,i,n,s]=r.boundsInSpriteWidth,l=100;return{shadowPage:r.page,shadowU0:r.uv[0],shadowV0:r.uv[1],shadowU1:r.uv[2],shadowV1:r.uv[3],shadowRelLeft:o*l,shadowRelTop:i*l,shadowWidth:(n-o)*l,shadowHeight:(s-i)*l}}function co(t,e,r){if(!e.length)return[];let o=[],i=new Map;for(let n of e){let s=ot(n.q1,n.r1,n.q2,n.r2);if(s<0)continue;let l=r(n.q1,n.r1),d=r(n.q2,n.r2),a=l>=d?l:d;if(a===0)continue;let{a:c,b:h,mid:f}=lt(n.q1,n.r1,s),m=fi(t,n.kind,s,!!n.isGate);if(m){let g=t.infrastructure.sprites[m],x=m.includes("/stone/"),[S,I,D,v]=x?ui[s]:ci[s],M=Math.abs(h.x-c.x)<=1e-6?x?5.5:3.5:0,j=x?"stone":"palisade";o.push({x:c.x,y:c.y,relLeft:-D,relTop:-v+M,width:S,height:I,page:g.page,u0:g.uv[0],v0:g.uv[1],u1:g.uv[2],v1:g.uv[3],sortY:f.y,fogState:a,...lo(t,`wall_shadow:${j}:dir${s}`)})}for(let g of[c,h]){let x=`${Math.round(g.x*10)},${Math.round(g.y*10)}`,S=i.get(x);S||(S={x:g.x,y:g.y,degree:0,hasPalisade:!1,hasStone:!1,fog:a},i.set(x,S)),S.degree++,n.kind==="palisade"&&(S.hasPalisade=!0),n.kind==="stone"&&(S.hasStone=!0),a>S.fog&&(S.fog=a)}}for(let n of i.values()){let s=n.hasStone&&!n.hasPalisade?"stone":"palisade",l=n.degree===1,d=hi(t,s,l);if(!d)continue;let a=t.infrastructure.sprites[d],c=di[s],h=l?c.endW:c.cornerW,f=l?c.endH:c.cornerH;o.push({x:n.x,y:n.y,relLeft:-h*.5,relTop:-f+c.south,width:h,height:f,page:a.page,u0:a.uv[0],v0:a.uv[1],u1:a.uv[2],v1:a.uv[3],sortY:n.y+1,fogState:n.fog,...lo(t,`wall_shadow:${s}:post`)})}return o.sort((n,s)=>n.sortY-s.sortY||n.x-s.x),o}var sn={naturePolish:.4,spriteSaturation:1,spriteBrightness:1,spriteContrast:1,edgeBand:28,waterSampling:"hex",mountainShadowOnSprites:!0,spriteSelfShadow:.68,windAnimation:!0},Mr=class{constructor(e,r,o={}){this.overlayCanvas=null;this.assets=null;this.chunkManager=null;this.dynamicScene=null;this.infrastructureClearance=tn(null);this.cachedWallSprites=[];this.wallCacheRevision=-1;this.cachedBridgeSprites=[];this.bridgeCacheKey="";this.cachedBuildingSprites=[];this.buildingCacheKey="";this.coveredBuildingIds=new Set;this.cachedInfraSprites=[];this.sceneRevision=0;this.hoverHex=null;this.rafId=null;this.dirty=!0;this.destroyed=!1;this.resizeObserver=null;this.startTimeMs=performance.now();this.frameTimes=[];this.lastFrameTimestamp=performance.now();this.lastMetricsEmit=0;this.hasPendingStream=!1;this.lastAmbientRenderMs=0;this.onContextLost=e=>{e.preventDefault(),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null)};this.onTick=e=>{if(this.rafId=null,this.destroyed)return;if(!this.dirty&&!this.hasPendingStream&&!this.hasActiveUnitAnimations()&&this.visualConfig.windAnimation!==!1&&e-this.lastAmbientRenderMs<15.5){this.rafId=requestAnimationFrame(this.onTick);return}this.lastAmbientRenderMs=e,(this.renderFrame(e)||this.dirty)&&(this.rafId=requestAnimationFrame(this.onTick))};this.canvas=e,this.provider=r,this.options=o,this.worldSeed=o.worldSeed??"vedras-welt-01",this.showHexGrid=o.showHexGrid??!1,this.shadowOpacity=o.shadowOpacity??.54,this.forestConfig={...ct,...o.forestConfig??{}},this.reliefConfig={...Et,...o.reliefConfig??{}},this.visualConfig={...sn,...o.visualConfig??{}};let i=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!i)throw new Error("WebGL2 ist in diesem Browser nicht verf\xFCgbar. Vedras Reiche ben\xF6tigt WebGL2.");this.gl=i,this.terrainPass=new _r(i),this.riverPass=new ur(i),this.vectorPass=new Cr(i),this.spriteBatcher=new wr(i),this.camera=new vr(e,o.initialCenter??{q:0,r:0},o.initialZoom??.72,{onChange:()=>{this.requestRender()},onHexHover:n=>{this.hoverHex=n,this.requestRender(),o.onHexHover?.(n)},onHexClick:n=>{o.onHexClick?.(n)},onWorldClick:n=>{o.onWorldClick?.(n)}}),e.addEventListener("webglcontextlost",this.onContextLost,!1),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(()=>{this.camera.syncViewport()&&this.requestRender()}),this.resizeObserver.observe(e))}attachOverlayCanvas(e){this.overlayCanvas=e,this.requestRender()}async init(){let r=this.options.assetsBaseUrl??void 0??"/game-assets",o=await Qr(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed){o.dispose();return}this.assets=o,this.chunkManager=new Xt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.camera.syncViewport(),this.requestRender()}async reloadAssets(e){let r=e??this.options.assetsBaseUrl??"/game-assets",o=await Qr(this.gl,r,this.options.vramTier??"auto",this.options.onLoadProgress);if(this.destroyed)return o.dispose(),o.manifest;let i=this.assets;return this.assets=o,this.chunkManager=new Xt(o.manifest,this.provider,{worldSeed:this.worldSeed,maxCachedChunks:o.vramTier==="mobile"?128:256,forestConfig:this.forestConfig,reliefConfig:this.reliefConfig}),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.bridgeCacheKey="",this.buildingCacheKey="",i?.dispose(),this.requestRender(),o.manifest}getManifest(){return this.assets?.manifest??null}invalidateChunkAt(e,r){this.chunkManager&&(this.chunkManager.invalidateChunkAt(e,r),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.buildingCacheKey="",this.requestRender())}setWorldProvider(e,r){this.provider=e,r!==void 0&&(this.worldSeed=r),this.chunkManager&&(this.chunkManager.setProvider(e,this.worldSeed),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.bridgeCacheKey="",this.buildingCacheKey=""),this.requestRender()}setDynamicScene(e){this.dynamicScene=e,this.sceneRevision++,this.wallCacheRevision=-1,this.buildingCacheKey="",this.infrastructureClearance=tn(e),this.requestRender()}reapplyFog(e){this.chunkManager&&(this.chunkManager.reapplyFog(e),this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.buildingCacheKey="",this.requestRender())}setHexFogState(e,r,o){this.chunkManager&&this.chunkManager.setHexFogState(e,r,o)&&(this.terrainPass.invalidateWindow(),this.wallCacheRevision=-1,this.buildingCacheKey="",this.requestRender())}centerOnHex(e,r,o){this.camera.centerOnHex(e,r,o),this.requestRender()}setZoom(e){this.camera.setZoom(e),this.requestRender()}setShowHexGrid(e){this.showHexGrid=e,this.requestRender()}setShadowOpacity(e){this.shadowOpacity=Math.max(0,Math.min(.85,e)),this.requestRender()}getForestConfig(){return{...this.forestConfig}}setForestConfig(e){this.forestConfig={...this.forestConfig,...e},this.chunkManager&&(this.chunkManager.setForestConfig(this.forestConfig),this.terrainPass.invalidateWindow()),this.requestRender()}getReliefConfig(){return{...this.reliefConfig}}setReliefConfig(e){this.reliefConfig={...this.reliefConfig,...e},this.chunkManager&&this.chunkManager.setReliefConfig(this.reliefConfig),this.requestRender()}getVisualConfig(){return{...this.visualConfig}}setVisualConfig(e){this.visualConfig={...this.visualConfig,...e},this.requestRender()}getVramTier(){return this.assets?.vramTier??null}lookupHex(e,r){return this.chunkManager?.lookupHex(e,r)}hasActiveUnitAnimations(){let e=this.dynamicScene?.units;if(e&&e.length>0)for(let r=0;r<e.length;r++){let o=e[r];if(o.inCombat||o.marchPath&&o.marchPath.length>=2)return!0}return!1}hasActiveAnimations(){return this.visualConfig.windAnimation!==!1||this.hasActiveUnitAnimations()}requestRender(){this.dirty=!0,!(this.destroyed||!this.assets||!this.chunkManager)&&this.rafId===null&&(this.rafId=requestAnimationFrame(this.onTick))}renderFrame(e){let r=this.assets,o=this.chunkManager;if(!r||!o)return!1;this.dirty=!1;let i=performance.now(),n=Math.max(.1,e-this.lastFrameTimestamp);this.lastFrameTimestamp=e,n<250&&(this.frameTimes.push(n),this.frameTimes.length>30&&this.frameTimes.shift()),this.camera.syncViewport();let s=this.camera.state,l=this.gl;l.viewport(0,0,l.canvas.width,l.canvas.height);let d=(e-this.startTimeMs)*.001,a=en(s.zoom),c=1-a,h=c>.02,f=this.visualConfig.windAnimation!==!1,{sprites:m,fogStates:g,decals:x,decalFogStates:S,shorelines:I,shoreFogStates:D,riverRoutes:v,chunksLoadedThisFrame:M,hasPendingChunks:j}=o.prepareVisibleFrame(s,h?2:6,h),w=(z,J)=>{let te=o.lookupTerrainHex(z,J);return te?te.fogState:0},b=performance.now(),R=this.terrainPass.render({cam:s,assets:r,lookupHex:(z,J)=>o.lookupTerrainHex(z,J),resolveTerrainLayer:(z,J,te)=>o.resolveTerrainLayer(z,J,te),isWaterTerrain:z=>o.isWaterTerrain(z),seedInt:o.seedInt,dataRevision:o.revision,timeSec:d,showGrid:this.showHexGrid,hoverHex:this.hoverHex,edgeBand:this.visualConfig.edgeBand,waterSampling:this.visualConfig.waterSampling,reliefEnabled:this.reliefConfig.enabled,reliefStrength:this.reliefConfig.strength,reliefLighting:this.reliefConfig.lighting,reliefStyle:this.reliefConfig.style??"sculpted",windAnimation:f}),L=this.spriteBatcher.renderShorelines({cam:s,shorelines:I,fogStates:D,infraPages:r.infraPages,projectY:De}),C=this.riverPass.render({cam:s,assets:r,routes:v,manualEdges:this.dynamicScene?.rivers,sampleReliefHeight:(z,J)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(z,J):0,lookupFog:w,lookupHex:(z,J)=>o.lookupTerrainHex(z,J),timeSec:d,windAnimation:f}),G=this.vectorPass.renderGroundPass({cam:s,scene:this.dynamicScene,lookupFog:w,strategicBlend:a,sampleReliefHeight:(z,J)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(z,J):0}),ee=performance.now(),B=m,P=g;if(!this.infrastructureClearance.isEmpty&&m.length>0){B=[],P=[];for(let z=0;z<m.length;z++){let J=m[z];rn(J,this.infrastructureClearance)||(B.push(J),P.push(g[z]))}}let Y=this.dynamicScene?.customSprites;if(h&&Y&&Y.length>0){let z=[];for(let J=0;J<B.length;J++)z.push({sprite:B[J],fog:P[J]});for(let J of Y){let te=r.manifest.nature.sprites[J.spriteKey];if(!te)continue;let ve=ke(J.q,J.r),ye=ve.x+(J.offsetX??0),be=ve.y+(J.offsetY??0),We=this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(ye,be/De)*De:0,xe=(J.worldWidthOverride??te.worldWidth)*Mt(te)*(J.scale??1),Ae=xe*te.aspect,pe=r.manifest.shadows.sprites[J.spriteKey],Ie=J.anchorOverride??te.anchor;z.push({sprite:{x:ye,y:be-We,sortY:be,width:xe,height:Ae,anchorX:Ie[0],anchorY:Ie[1],page:te.page,u0:te.uv[0],v0:te.uv[1],u1:te.uv[2],v1:te.uv[3],q:J.q,r:J.r,isMountain:te.kind==="mountain",isSnowFamily:or(te),shadowTier:jr(te,xe,Ae),selfShadeWeight:$r(te),shadowPage:pe?pe.page:-1,shadowU0:pe?pe.uv[0]:0,shadowV0:pe?pe.uv[1]:0,shadowU1:pe?pe.uv[2]:0,shadowV1:pe?pe.uv[3]:0,shadowMinX:pe?pe.boundsInSpriteWidth[0]:0,shadowMinY:pe?pe.boundsInSpriteWidth[1]:0,shadowMaxX:pe?pe.boundsInSpriteWidth[2]:0,shadowMaxY:pe?pe.boundsInSpriteWidth[3]:0},fog:w(J.q,J.r)})}z.sort((J,te)=>(J.sprite.sortY??J.sprite.y)-(te.sprite.sortY??te.sprite.y)||J.sprite.x-te.sprite.x),B=z.map(J=>J.sprite),P=z.map(J=>J.fog)}let le=this.sceneRevision*1000003+o.revision,oe=!1;this.wallCacheRevision!==le&&(this.cachedWallSprites=this.dynamicScene?.walls&&this.dynamicScene.walls.length>0?co(r.manifest,this.dynamicScene.walls,w):[],this.wallCacheRevision=le,oe=!0);let X=this.dynamicScene?.roads,_=this.dynamicScene?.rivers,W=!!(X&&X.length>0)&&(v.length>0||!!(_&&_.length>0)),E=W?v.map(z=>z.id).join(","):"",q=W?`${le}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}|${E}`:"";if(this.bridgeCacheKey!==q){if(W&&X){let z=Zn({roads:X,routes:v,manualRivers:_,lookupFog:w});this.cachedBridgeSprites=Qn({manifest:r.manifest,crossings:z,sampleReliefHeight:(J,te)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(J,te):0})}else this.cachedBridgeSprites=[];this.bridgeCacheKey=q,oe=!0}let u=this.dynamicScene?.buildings,p=!!(u&&u.length>0),y=p?`${le}|${this.reliefConfig.enabled?this.reliefConfig.strength.toFixed(2):"flat"}`:"";if(this.buildingCacheKey!==y){if(p&&u){let z=Jn({manifest:r.manifest,buildings:u,lookupFog:w,sampleReliefHeight:(J,te)=>this.reliefConfig.enabled?this.terrainPass.sampleReliefHeight(J,te):0});this.cachedBuildingSprites=z.sprites,this.coveredBuildingIds=z.coveredBuildingIds}else this.cachedBuildingSprites=[],this.coveredBuildingIds=new Set;this.buildingCacheKey=y,oe=!0}if(oe){let z=[];this.cachedWallSprites.length>0&&z.push(this.cachedWallSprites),this.cachedBridgeSprites.length>0&&z.push(this.cachedBridgeSprites),this.cachedBuildingSprites.length>0&&z.push(this.cachedBuildingSprites),z.length===0?this.cachedInfraSprites=[]:z.length===1?this.cachedInfraSprites=z[0]:this.cachedInfraSprites=z.flat().sort((J,te)=>J.sortY-te.sortY||J.x-te.x)}let k=0;if(h&&x.length>0){let z=x,J=S;if(!this.infrastructureClearance.isEmpty){z=[],J=[];for(let te=0;te<x.length;te++){let ve=x[te];rn(ve,this.infrastructureClearance)||(z.push(ve),J.push(S[te]))}}z.length>0&&(k=this.spriteBatcher.renderWorldSprites({cam:s,sprites:z,fogStates:J,naturePages:r.naturePages,detailOpacity:c,objectScaleY:1,objectShearX:0,shadowOpacity:0,mountainShadowOnSprites:!1,spriteSelfShadow:0,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:d,windAnimation:!1,isDecalPass:!0}).drawCalls)}let F=this.spriteBatcher.renderShadows({cam:s,sprites:B,fogStates:P,walls:this.cachedInfraSprites,shadowPages:r.shadowPages,shadowOpacity:this.shadowOpacity,detailOpacity:c}),H=performance.now(),$=this.spriteBatcher.renderWaterSurfRings({cam:s,sprites:B,fogStates:P,detailOpacity:c,timeSec:d,windAnimation:f}),N=this.spriteBatcher.renderWorldSprites({cam:s,sprites:B,fogStates:P,naturePages:r.naturePages,walls:this.cachedInfraSprites,infraPages:r.infraPages,detailOpacity:c,objectScaleY:r.manifest.projection.objectDisplayScaleY,objectShearX:r.manifest.projection.objectDisplayShearX,shadowOpacity:this.shadowOpacity,mountainShadowOnSprites:this.visualConfig.mountainShadowOnSprites,spriteSelfShadow:this.visualConfig.spriteSelfShadow??.68,naturePolish:this.visualConfig.naturePolish,spriteSaturation:this.visualConfig.spriteSaturation,spriteBrightness:this.visualConfig.spriteBrightness,spriteContrast:this.visualConfig.spriteContrast,timeSec:d,windAnimation:f}),se=this.terrainPass.renderCloudOverlay({cam:s,assets:r,timeSec:d,windAnimation:f}),ue=this.vectorPass.renderTacticalPass({cam:s,scene:this.dynamicScene,lookupFog:w,timeSec:d,coveredBuildingIds:c>.35?this.coveredBuildingIds:void 0});this.overlayCanvas&&no({canvas:this.overlayCanvas,cam:s,scene:this.dynamicScene,lookupFog:w,strategicBlend:a,timeSec:d});let Q=performance.now();this.hasPendingStream=j||M>0;let Re=this.hasPendingStream||this.hasActiveAnimations();if(this.options.onMetrics&&(!Re||e-this.lastMetricsEmit>=200)){this.lastMetricsEmit=e;let z=this.frameTimes.length>0?this.frameTimes.reduce((te,ve)=>te+ve,0)/this.frameTimes.length:Math.max(16.6,Q-i),J={fps:Math.min(120,Math.round(1e3/Math.max(8,z))),frameMs:Number((Q-i).toFixed(2)),terrainPassMs:Number((ee-b).toFixed(2)),shadowPassMs:Number((H-ee).toFixed(2)),spritePassMs:Number((Q-H).toFixed(2)),drawCalls:1+L.drawCalls+C+G+k+F.drawCalls+$+N.drawCalls+se+ue,visibleHexes:R.visibleHexes,renderedSprites:N.renderedSprites,renderedShadows:F.renderedShadows,loadedChunks:o.loadedChunkCount,mode:to(s.zoom),strategicBlend:Number(a.toFixed(2)),vramTier:r.vramTier,zoom:Number(s.zoom.toFixed(2)),centerHex:et(s.x,s.y)};this.options.onMetrics(J)}return Re}destroy(){this.destroyed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.resizeObserver?.disconnect(),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),this.camera.destroy(),this.terrainPass.dispose(),this.riverPass.dispose(),this.vectorPass.dispose(),this.spriteBatcher.dispose(),this.assets?.dispose(),this.assets=null}};var fo={VedrasMapEngine:Mr,createGeographyV2ChunkProvider:Nn,createSandboxScenario:Yn,computeScenarioFog:$n,evaluateDecision0121BuildPreview:Vt,SANDBOX_SCENARIO_LIST:jn,VIELFALT_MIX_OVERRIDES:Tt,DEFAULT_FOREST_CONFIG:ct,DEFAULT_RELIEF_CONFIG:Et,DEFAULT_VISUAL_CONFIG:sn,computeBoulderSpawnScale:dr,sizeFactor:Mt,GeographyV2:uo.default,hexMath:{HEX_WIDTH:256,HEX_NEIGHBOR_DIRS:Pe,axialToWorld:ke,worldToAxial:et,hexDistance:tt,hexKey:Fe,hexEdgeEndpoints:lt,canonicalEdgePair:Ft,neighborDirection:ot,pickNearestHexEdge:dn}};typeof window<"u"&&(window.VedrasMapEngineLib=fo);var Rs=fo;})();
