/* Phase 2.8s – per-original-sprite, per-shadow-layer attribution.
 * Takes REAL pre-encode native RGBA and packed alpha masks captured by the
 * unmodified global lattice draw. Read-only, 36 source sprites max.
 * "Topmost" means last WorldTile original PNG with positive actual alpha,
 * never an invented ownership or claim that an editor source is fixed.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-editor-shadow-attribution-v1";
const MAX_PIXELS=3500000,MAX_MASK_BYTES=8000000;
const same=(a,b,i)=>a[i]===b[i]&&a[i+1]===b[i+1]&&
 a[i+2]===b[i+2]&&a[i+3]===b[i+3];
function check({width,height,originX,originY,
 worldBare,editorBare,worldShaded,editorShaded,
 mountainGround,spriteGround,spriteMasks}){
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
  !(width>0&&height>0&&width*height<=MAX_PIXELS)||
  !Number.isSafeInteger(originX)||!Number.isSafeInteger(originY))
  throw Error("Original-Schattenattribution benötigt begrenzte globale Pixel.");
 const n=width*height*4;
 for(const image of [worldBare,editorBare,worldShaded,editorShaded,
  mountainGround,spriteGround])
  if(!(image instanceof Uint8ClampedArray)||image.length!==n)
   throw Error("Original-Schattenattribution benötigt sechs gleichgroße RGBA-Puffer.");
 if(!Array.isArray(spriteMasks)||spriteMasks.length>36)
  throw Error("Original-Schattenattribution benötigt höchstens 36 Sprite-Masken.");
 let bytes=0;
 const ords=new Set();
 for(const m of spriteMasks){
  if(!m||!Number.isSafeInteger(m.ordinal)||
   ords.has(m.ordinal)||!Number.isSafeInteger(m.x)||!Number.isSafeInteger(m.y)||
   !Number.isSafeInteger(m.width)||!Number.isSafeInteger(m.height)||
   !(m.width>0&&m.height>0&&m.width*m.height<=6500000)||
   !(m.bits instanceof Uint8Array)||
   m.bits.length!==Math.ceil(m.width*m.height/8)||
   typeof m.path!=="string"||!/^assets\/nature\/[\p{L}\p{N}_.-]+\.png$/iu.test(m.path)||
   typeof m.type!=="string"||m.type.length>32)
   throw Error("Original-Schattenattribution verweigert beschädigte Original-Sprite-Masken.");
  ords.add(m.ordinal);bytes+=m.bits.length;
  if(bytes>MAX_MASK_BYTES)
   throw Error("Original-Schattenattribution überschreitet Maskenbudget.");
 }
}
function overlaps(mask,x,y){
 const xx=x-mask.x,yy=y-mask.y;
 if(xx<0||yy<0||xx>=mask.width||yy>=mask.height)return false;
 const p=yy*mask.width+xx;
 return !!(mask.bits[p>>>3]&(1<<(p&7)));
}
function createClass(){
 return {count:0,withoutSprite:0,multipleSprites:0,
  ground:{mountainAndSprite:0,mountainOnly:0,spriteOnly:0,neither:0},
  byTopmost:{},byType:{},bbox:null,samples:[]};
}
function enter(group,{x,y,owner,overlap,groundClass,world,editor,maxDelta,detail}){
 group.count++;
 if(!owner)group.withoutSprite++;
 if(overlap>1)group.multipleSprites++;
 group.ground[groundClass]++;
 const label=owner?owner.ordinal+":"+owner.type+":"+owner.path:"outside-sprite-alpha";
 group.byTopmost[label]=(group.byTopmost[label]||0)+1;
 const type=owner?.type||"none";
 group.byType[type]=(group.byType[type]||0)+1;
 if(!group.bbox)group.bbox={left:x,top:y,right:x,bottom:y};
 else{
  group.bbox.left=Math.min(group.bbox.left,x);
  group.bbox.top=Math.min(group.bbox.top,y);
  group.bbox.right=Math.max(group.bbox.right,x);
  group.bbox.bottom=Math.max(group.bbox.bottom,y);
 }
 if(group.samples.length<12)group.samples.push({x,y,
  maxDelta,top:label,overlap,groundClass,
  ...(world?{world}:{}),...(editor?{editor}:{}),
  ...(detail?{detail}:{})});
}
function digest(g){
 return {...g,
  byTopmost:Object.entries(g.byTopmost).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
   .map(([source,count])=>({source,count})),
  byType:Object.entries(g.byType).sort((a,b)=>b[1]-a[1])
   .map(([type,count])=>({type,count}))};
}
function analyze(args={}){
 check(args);
 const {width,height,originX,originY,
  worldBare,editorBare,worldShaded,editorShaded,
  mountainGround,spriteGround,spriteMasks}=args;
 const editorOnly=createClass(),worldOnly=createClass(),
  severeBare=createClass(),severeShaded=createClass();
 const groups=[editorOnly,worldOnly,severeBare,severeShaded];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,
   worldChanged=!same(worldBare,worldShaded,i),
   editorChanged=!same(editorBare,editorShaded,i);
  let db=0,ds=0;
  for(let c=0;c<4;c++){
   db=Math.max(db,Math.abs(worldBare[i+c]-editorBare[i+c]));
   ds=Math.max(ds,Math.abs(worldShaded[i+c]-editorShaded[i+c]));
  }
  const onlyEditor=editorChanged&&!worldChanged,
   onlyWorld=worldChanged&&!editorChanged,
   badBare=db>64,badShade=ds>64;
  if(!onlyEditor&&!onlyWorld&&!badBare&&!badShade)continue;
  const xx=originX+x,yy=originY+y;
  let top=null,overlap=0;
  for(const mask of spriteMasks){
   if(!overlaps(mask,xx,yy))continue;
   top=mask;overlap++;
  }
  const mountain=mountainGround[i+3]>0,
   sprite=!same(mountainGround,spriteGround,i);
  const groundClass=mountain?
    (sprite?"mountainAndSprite":"mountainOnly"):
    (sprite?"spriteOnly":"neither");
  const opts={x,y,owner:top,overlap,groundClass,
   maxDelta:Math.max(db,ds)};
  if(onlyEditor)enter(editorOnly,opts);
  if(onlyWorld)enter(worldOnly,opts);
  if(badBare)enter(severeBare,{...opts,maxDelta:db,
   world:[...worldBare.slice(i,i+4)],editor:[...editorBare.slice(i,i+4)],
   detail:"without-shadows"});
  if(badShade)enter(severeShaded,{...opts,maxDelta:ds,
   world:[...worldShaded.slice(i,i+4)],editor:[...editorShaded.slice(i,i+4)],
   detail:"with-shadows"});
 }
 const total=width*height;
 for(const g of groups){
  if(g.count>total||g.withoutSprite>g.count||g.multipleSprites>g.count||
   Object.values(g.ground).reduce((a,b)=>a+b,0)!==g.count||
   Object.values(g.byTopmost).reduce((a,b)=>a+b,0)!==g.count)
   throw Error("Original-Schattenattribution verletzt Gruppen-Invarianten.");
 }
 return {schema:SCHEMA,width,height,originX,originY,
  masks:spriteMasks.length,
  editorOnlyShadeTouched:digest(editorOnly),
  worldOnlyShadeTouched:digest(worldOnly),
  severeBare:digest(severeBare),severeShaded:digest(severeShaded),
  // Mask coverage is precise for the WorldTile sprite scratch, but an
  // overlap group does not prove WHY the editor differs.
  ownershipSemantics:"last-positive-alpha-original-sprite-only",
  complete:false,readyForViewer:false};
}
const api={SCHEMA,analyze,overlaps};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasEditorShadowAttribution=api;
})(typeof window!=="undefined"?window:globalThis);
