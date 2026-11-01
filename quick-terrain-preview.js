/* Step 16B: inexpensive, clearly PROVISIONAL material preview for an
 * uncached camera region. This is not a replacement for blended terrain,
 * coast/river banks, shadows or sharp WorldTiles.
 *
 * Never renders an unknown/explored cell. A caller still must apply its
 * existing authorized Fog hex clipping. Draws no speculative off-map data,
 * requests no assets, changes no terrain source, and allocates no tile cache.
 */
'use strict';
window.VedrasQuickTerrainPreview=(()=>{
 const R=256/Math.sqrt(3),MAX_HEX_DRAWS=128;
 const key=c=>c.q+','+c.r;
 const finite=v=>Number.isFinite(v);
 function onscreen(c,v){
  const zoom=v.zoom,py=v.projectY||1;
  const x=v.width/2+v.panX+c.x*zoom,
   y=v.height/2+v.panY+c.y*zoom*py,
   rx=(c.radius||R)*zoom,ry=rx*py;
  return x+rx>=0&&x-rx<=v.width&&y+ry>=0&&y-ry<=v.height;
 }
 function hexPath(g,c,v){
  const atmosphere=window.VedrasFogAtmosphere;
  if(atmosphere?.hexPath){
   atmosphere.hexPath(g,c,v,0);
   return;
  }
  const zoom=v.zoom,py=v.projectY||1;
  const x=v.width/2+v.panX+c.x*zoom,
   y=v.height/2+v.panY+c.y*zoom*py;
  const rx=(c.radius||R)*zoom,ry=rx*py;
  for(let i=0;i<6;i++){
   const theta=-Math.PI/2+i*Math.PI/3;
   const px=x+Math.cos(theta)*rx,yy=y+Math.sin(theta)*ry;
   if(i===0)g.moveTo(px,yy);else g.lineTo(px,yy);
  }
  g.closePath();
 }
 // Returns only the visible Hex IDs that really received a decoded texture.
 // Counts are presented separately from exact WorldTile/Scenery readiness.
 function paint(g,view,fog,assetForCell,{limit=MAX_HEX_DRAWS}={}){
  const drawn=new Set();
  if(!g||!Array.isArray(fog)||typeof assetForCell!=='function'||
     !view||!finite(view.zoom)||view.zoom<=0||view.zoom<.47||
     !finite(view.width)||!finite(view.height))return drawn;
  // Large far-zoom overviews already have the cheap far LOD path. Prevent
  // the preview itself from issuing hundreds of Canvas clips per frame.
  let processed=0;
  for(const c of fog){
   if(c?.visibility!=='visible'||!onscreen(c,view))continue;
   if(processed>=limit)break;
   processed++;
   const asset=assetForCell(c),img=asset?.img;
   // HTMLImageElement.width may be a configured layout width while its
   // naturalWidth is still zero. Never draw an undecoded image.
   const naturalW=typeof img?.naturalWidth==='number'?img.naturalWidth:img?.width;
   const naturalH=typeof img?.naturalHeight==='number'?img.naturalHeight:img?.height;
   if(!(naturalW>0&&naturalH>0))continue;
   const py=view.projectY||1,rx=(c.radius||R)*view.zoom,
    ry=rx*py,
    x=view.width/2+view.panX+c.x*view.zoom,
    y=view.height/2+view.panY+c.y*view.zoom*py;
   g.save();
   try{
    g.beginPath();hexPath(g,c,view);g.clip();
    // Direct native drawImage; no 850k-pixel autotile material mixing, no
    // getImageData, no new canvas/bitmap, no tile Worker / LRU mutations.
    g.drawImage(img,x-rx,y-ry,rx*2,ry*2);
    drawn.add(key(c));
   }finally{g.restore();}
  }
  return drawn;
 }
 return {paint};
})();
