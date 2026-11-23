/* Phase 2.8r – independent, strictly bounded RGBA editor-composite auditor.
 * Diagnostic only: never publishes a tile or changes a sprite/ground pixel.
 * Analyse ORIGINAL pre-encode Canvas ImageData, not PNG-decoded copies.
 */
(function(root){
"use strict";
const SCHEMA="vedras-editor-composite-rgba-audit-v1";
const CHANNELS=["r","g","b","a"];
const DELTA=["1","2","3-4","5-16","17-64","65-255"];
const ALPHA=["transparent","low","mid","high","opaque"];
const MAX_PIXELS=3500000;
function validate(width,height,images){
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
  width<1||height<1||width*height>MAX_PIXELS)
  throw Error("Editor-RGBA-Audit benötigt begrenzte Original-Pixeldimensionen.");
 const length=width*height*4;
 for(const x of images)
  if(!(x instanceof Uint8ClampedArray)||x.length!==length)
   throw Error("Editor-RGBA-Audit benötigt vier bzw. zwei identisch große Uint8ClampedArray-Puffer.");
}
const bin=d=>d===1?0:d===2?1:d<=4?2:d<=16?3:d<=64?4:5;
const alphaBin=(a,b)=>{
 const m=Math.max(a,b);
 return m===0?0:m<64?1:m<192?2:m<255?3:4;
};
const same=(a,b,i)=>a[i]===b[i]&&a[i+1]===b[i+1]&&
 a[i+2]===b[i+2]&&a[i+3]===b[i+3];
function fresh(width,height,cols,rows){
 return {different:0,painted:0,maxDelta:0,
  channels:{r:0,g:0,b:0,a:0},
  differentRGBOnly:0,differentAlphaOnly:0,differentRGBAndAlpha:0,
  maxDeltaBins:Object.fromEntries(DELTA.map(n=>[n,0])),
  alphaBins:Object.fromEntries(ALPHA.map(n=>[n,0])),
  bbox:null,
  heatmap:{columns:cols,rows,counts:Array(cols*rows).fill(0)},
  maxAbsDeltaPerChannel:{r:0,g:0,b:0,a:0}};
}
function ingest(target,a,b,i,x,y,width,height,cols,rows){
 if(a[i+3]||b[i+3])target.painted++;
 if(same(a,b,i))return false;
 target.different++;
 let d=0,rgb=false,alpha=false;
 for(let c=0;c<4;c++){
  const v=Math.abs(a[i+c]-b[i+c]);
  if(v){target.channels[CHANNELS[c]]++;
   target.maxAbsDeltaPerChannel[CHANNELS[c]]=Math.max(
    target.maxAbsDeltaPerChannel[CHANNELS[c]],v);
   if(c===3)alpha=true;else rgb=true;
   d=Math.max(d,v);
  }
 }
 if(rgb&&alpha)target.differentRGBAndAlpha++;
 else if(rgb)target.differentRGBOnly++;
 else target.differentAlphaOnly++;
 target.maxDelta=Math.max(target.maxDelta,d);
 target.maxDeltaBins[DELTA[bin(d)]]++;
 target.alphaBins[ALPHA[alphaBin(a[i+3],b[i+3])]]++;
 if(!target.bbox)target.bbox={left:x,top:y,right:x,bottom:y};
 else{
  target.bbox.left=Math.min(target.bbox.left,x);
  target.bbox.top=Math.min(target.bbox.top,y);
  target.bbox.right=Math.max(target.bbox.right,x);
  target.bbox.bottom=Math.max(target.bbox.bottom,y);
 }
 const bx=Math.min(cols-1,Math.floor(x*cols/width)),
  by=Math.min(rows-1,Math.floor(y*rows/height));
 target.heatmap.counts[by*cols+bx]++;
 return true;
}
function compare({width,height,world,editor,columns=32,rows=16}={}){
 validate(width,height,[world,editor]);
 if(!Number.isSafeInteger(columns)||columns<1||columns>64||
  !Number.isSafeInteger(rows)||rows<1||rows>64)
  throw Error("Editor-RGBA-Audit benötigt begrenzte Heatmap-Abmessungen.");
 const out=fresh(width,height,columns,rows);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;
  ingest(out,world,editor,i,x,y,width,height,columns,rows);
 }
 return out;
}
function paired({width,height,worldBare,editorBare,worldShaded,editorShaded,
 columns=32,rows=16}={}){
 validate(width,height,[worldBare,editorBare,worldShaded,editorShaded]);
 const bare=compare({width,height,world:worldBare,editor:editorBare,columns,rows});
 const shaded=compare({width,height,world:worldShaded,editor:editorShaded,columns,rows});
 const transitions={
  introduced:0,resolved:0,persistent:0,neverDifferent:0,
  worldShadeTouched:0,editorShadeTouched:0,
  shadeTouchedBoth:0,shadeTouchedWorldOnly:0,
  shadeTouchedEditorOnly:0,shadeTouchedNeither:0,
  shadedMismatchOnTouched:0,shadedMismatchOnUntouched:0,
  backgroundOnlyMismatch:0,
  // Histograms limited to 32x16 for deterministic CI logging / artifact.
  introducedHeatmap:Array(columns*rows).fill(0),
  shadeOnlyHeatmap:Array(columns*rows).fill(0)
 };
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;
  const b=!same(worldBare,editorBare,i),s=!same(worldShaded,editorShaded,i),
   w=!same(worldBare,worldShaded,i),e=!same(editorBare,editorShaded,i);
  if(b&&s)transitions.persistent++;
  else if(b)transitions.resolved++;
  else if(s)transitions.introduced++;
  else transitions.neverDifferent++;
  if(w)transitions.worldShadeTouched++;
  if(e)transitions.editorShadeTouched++;
  if(w&&e)transitions.shadeTouchedBoth++;
  else if(w)transitions.shadeTouchedWorldOnly++;
  else if(e)transitions.shadeTouchedEditorOnly++;
  else transitions.shadeTouchedNeither++;
  if(s){
   if(w||e)transitions.shadedMismatchOnTouched++;
   else transitions.shadedMismatchOnUntouched++;
   if(!w&&!e&&b)transitions.backgroundOnlyMismatch++;
  }
  const idx=Math.min(rows-1,Math.floor(y*rows/height))*columns+
   Math.min(columns-1,Math.floor(x*columns/width));
  if(!b&&s)transitions.introducedHeatmap[idx]++;
  if(w||e)transitions.shadeOnlyHeatmap[idx]++;
 }
 const total=width*height;
 if(transitions.introduced+transitions.resolved+transitions.persistent+
   transitions.neverDifferent!==total||
  transitions.shadeTouchedBoth+transitions.shadeTouchedWorldOnly+
   transitions.shadeTouchedEditorOnly+transitions.shadeTouchedNeither!==total||
  Object.values(bare.maxDeltaBins).reduce((a,b)=>a+b,0)!==bare.different||
  Object.values(shaded.maxDeltaBins).reduce((a,b)=>a+b,0)!==shaded.different)
  throw Error("Editor-RGBA-Audit verletzt die eigenen Zähl-Invarianten.");
 return {schema:SCHEMA,width,height,columns,rows,bare,shaded,transitions,
  parityPassed:bare.different===0&&shaded.different===0,
  complete:false,readyForViewer:false};
}
const api={SCHEMA,compare,paired};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasEditorCompositeAudit=api;
})(typeof window!=="undefined"?window:globalThis);
