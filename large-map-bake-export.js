/* Read-only, bounded ZIP32 packaging of verified geography-bake receipts.
 * Sector archives are not yet accepted by the existing Frozen-Map viewer.
 */
(function(root){
'use strict';
const SCHEMA='vedras-geography-bake-sector-v1';
const COLLECTION='vedras-geography-bake-collection-v1';
const MAX_TILES=32,DEFAULT_TILES=16,MAX_BYTES=512*1024*1024;
function create({world,plan,planner=root.VedrasLargeMapBakePlan,
 sourceAdapter=root.VedrasLargeMapBakeSource,
 receiptVerifier=root.VedrasLargeMapBakeRunner,
 packageApi=root.VedrasFrozenMapPackage,
 runner,store,digest,sectorSize=DEFAULT_TILES}={}){
 if(!planner?.validatePlan||!sourceAdapter?.create||
    !receiptVerifier?.validateReceipt||!packageApi?.zipEntries||
    typeof runner?.expected!=='function'||typeof store?.get!=='function'||
    !Number.isSafeInteger(sectorSize)||sectorSize<1||sectorSize>MAX_TILES)
  throw Error('Sektorexport benötigt vollständige, überprüfbare PNG-Quellen.');
 const source=sourceAdapter.create(world,plan,{planner});
 if(plan.source.fingerprint!==source.source.fingerprint)
  throw Error('Renderplan passt nicht zur Geografiewelt.');
 planner.validatePlan(plan);
 const total=plan.tileCount,sectorCount=Math.ceil(total/sectorSize);
 function descriptor(index){
  if(!Number.isSafeInteger(index)||index<0||index>=sectorCount)
   throw Error('Ungültiger Sektorindex.');
  const start=index*sectorSize,end=Math.min(total,start+sectorSize);
  return {index,start,end,tileCount:end-start,
   filename:'vedras-sector-'+String(index).padStart(4,'0')+'.zip'};
 }
 const sectors=Array.from({length:sectorCount},(_,i)=>descriptor(i));
 async function verified(tile){
  const expected=runner.expected(tile.id);
  if(expected?.sourceFingerprint!==plan.source.fingerprint||
     expected?.tileId!==tile.id)
   throw Error('Fremde Renderrevision oder Kachelreferenz: '+tile.id);
  const receipt=await store.get(expected.key);
  if(!receipt)return {tile,status:'missing'};
  try{
   await receiptVerifier.validateReceipt(receipt,expected,{digest});
   return {tile,status:'verified',receipt,expected};
  }catch(error){
   return {tile,status:'invalid',reason:String(error?.message||error)};
  }
 }
 async function audit({onProgress=()=>{}}={}){
  let done=0,valid=0,missing=0,invalid=0;
  const missingIds=[],invalidTiles=[];
  for(const tile of plan.tiles){
   const item=await verified(tile);
   done++;
   if(item.status==='verified')valid++;
   else if(item.status==='missing'){missing++;missingIds.push(tile.id);}
   else{invalid++;invalidTiles.push({id:tile.id,reason:item.reason});}
   if(done%16===0||done===total)
    onProgress({done,total,valid,missing,invalid});
  }
  return {stage:'receipt-audit',expectedTiles:total,verifiedTiles:valid,
   missing,invalid,missingIds,invalidTiles,
   allVerified:valid===total,readyForViewer:false};
 }
 async function exportSector(index,{onProgress=()=>{}}={}){
  const sector=descriptor(index),tiles=[],entries=[],owned=new Map(),routes=new Map();
  let byteSize=0;
  for(let i=sector.start;i<sector.end;i++){
   const tile=plan.tiles[i],result=await verified(tile);
   if(result.status!=='verified')throw Error(
    'Sektor '+index+' enthält keine gültige Kachel '+tile.id+': '+
    result.status+(result.reason?' '+result.reason:''));
   const record=result.receipt,context=source.contextFor(tile.id),layers=[];
   for(const cell of context.ownerCells){
    const key=cell.q+','+cell.r;
    if(owned.has(key))throw Error('Sektor enthält doppelte Hex-Owner.');
    owned.set(key,cell);
   }
   for(const route of context.riverPaths)routes.set(JSON.stringify(route),route);
   for(const l of record.layers){
    const name='tiles/near/'+tile.id.replace(',','_')+'.'+l.layer+'.png';
    byteSize+=l.png.size;
    if(byteSize>MAX_BYTES)throw Error('Sektor überschreitet 512 MiB PNG-Budget.');
    entries.push({name,blob:l.png});
    layers.push({layer:l.layer,file:name,pad:l.pad,crop:l.crop||null,
     width:l.width,height:l.height,bytes:l.png.size,sha256:l.sha256});
   }
   tiles.push({id:tile.id,x:tile.x,y:tile.y,size:tile.size,
    revision:record.revision,layers});
   onProgress({index,done:i-sector.start+1,total:sector.tileCount});
  }
  const first=runner.expected(plan.tiles[sector.start].id);
  const manifest={schema:SCHEMA,format:'vedras-static-game-map-sector',
   stage:'verified-sector',complete:true,readyForViewer:false,
   source:plan.source,grid:plan.grid,projectY:.85,
   rendererRevision:first.rendererRevision,catalogRevision:first.catalogRevision,
   mode:first.mode,sector,tiles,cells:[...owned.values()],
   riverPaths:[...routes.values()],expectedWorldHexes:world.cells.length,
   note:'Verified raster/semantics sector. Needs future sector-aware game viewer/importer.'
  };
  const json=JSON.stringify(manifest);
  if(new TextEncoder().encode(json).byteLength>16*1024*1024)
   throw Error('Sektor-JSON größer als 16 MiB.');
  const blob=await packageApi.zipEntries([
   {name:'manifest.json',blob:new Blob([json],{type:'application/json'})},
   ...entries
  ]);
  if(!(blob instanceof Blob)||blob.size>MAX_BYTES)
   throw Error('Sektor-ZIP überschreitet den sicheren Speicherrahmen.');
  return {sector,filename:sector.filename,blob,manifest,
   tiles:tiles.length,ownedCells:owned.size,pngBytes:byteSize};
 }
 async function exportCollectionIndex({onProgress=()=>{}}={}){
  const auditResult=await audit({onProgress});
  if(!auditResult.allVerified)throw Error(
   'Weltindex verweigert: '+auditResult.missing+' fehlende und '+
   auditResult.invalid+' ungültige Bildkacheln.');
  // Index does NOT prove the corresponding ZIPs were exported/downloaded.
  const index={schema:COLLECTION,stage:'verified-receipts',
   readyForViewer:false,sectorsPackaged:false,
   source:plan.source,grid:plan.grid,sectorSize,sectorCount,
   expectedTiles:total,verifiedTiles:auditResult.verifiedTiles,
   sectors,geographicWorld:{version:world.version,seed:world.seed,
    width:world.width,height:world.height,
    originQ:world.originQ,originR:world.originR,
    config:world.config,cells:world.cells,riverPaths:world.riverPaths},
   note:'Semantic world + expected sector ZIPs. Not a playable atlas until all sector packages are verified and imported.'
  };
  const raw=JSON.stringify(index);
  if(new TextEncoder().encode(raw).byteLength>64*1024*1024)
   throw Error('Weltindex größer als 64 MiB.');
  return {filename:'vedras-geografie-sektoren.json',
   blob:new Blob([raw],{type:'application/json'}),index};
 }
 return {total,sectorCount,sectorSize,sectors,descriptor,
  audit,exportSector,exportCollectionIndex};
}
const api={SCHEMA,COLLECTION,MAX_TILES,create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeExport=api;
})(typeof window!=='undefined'?window:globalThis);
