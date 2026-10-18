"""Browser regression: cross-water auto tiling, shoreline separation, land-only relief."""
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
script='\n'.join((BASE/n).read_text() for n in ['catalog.js','autotile.js','relief.js'])
page_html='''<!doctype html><html><body><script>'''+script+'''</script></body></html>'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page()
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(page_html)
 result=page.evaluate(r'''(()=>{
 const c=VedrasCatalog.starter();
 c.terrainTypes.push({id:'icy_ocean',name:'Eisiger Ozean',categoryId:'water_coast',materialClass:'ground',transitionProfileId:'organic_ground'});
 c.terrainTypes.push({id:'dry_extra',name:'Lehmtest',categoryId:'arid_regions',materialClass:'ground',transitionProfileId:'organic_ground'});
 const migrated=VedrasCatalog.migrateWaterTypes(c);
 const by=id=>VedrasCatalog.terrainType(c,id);
 if(!migrated||by('icy_ocean').materialClass!=='water'||by('dry_extra').materialClass!=='ground')throw Error('Water migration not scoped correctly');
 const wm=VedrasCatalog.profile(c,'ocean','icy_ocean').mode;
 const wm2=VedrasCatalog.profile(c,'ocean','coastal_water').mode;
 const shore=VedrasCatalog.profile(c,'tundra','ocean').mode;
 const same=VedrasCatalog.profile(c,'icy_ocean','icy_ocean').mode;
 if(wm!=='soft_water'||wm2!=='soft_water'||shore!=='shoreline_required'||same!=='variant')throw Error('Transition modes wrong: '+[wm,wm2,shore,same]);
 const mk=(r,g,b)=>{const cv=document.createElement('canvas');cv.width=cv.height=256;let ct=cv.getContext('2d'),d=ct.createImageData(256,256);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=4*(y*256+x),s=20*Math.sin(x/15+y/18);d.data[i]=r+s;d.data[i+1]=g+s;d.data[i+2]=b+s;d.data[i+3]=255;}ct.putImageData(d,0,0);cv.naturalWidth=256;cv.naturalHeight=256;return cv;};
 const mats={ocean:{path:'ocean.png',img:mk(25,73,154)},coastal_water:{path:'coastal.png',img:mk(14,160,186)},icy_ocean:{path:'icy.png',img:mk(30,104,180)},tundra:{path:'tundra.png',img:mk(118,133,70)}};
 // 7-hex patch: center ocean, east coastal, south icy, north land.
 const cc=[{q:0,r:0,t:'ocean'},{q:1,r:0,t:'coastal_water'},{q:0,r:1,t:'icy_ocean'}, {q:0,r:-1,t:'tundra'},{q:1,r:-1,t:'ocean'},{q:-1,r:0,t:'ocean'},{q:-1,r:1,t:'coastal_water'}];
 const raster=VedrasAutotile.build(cc,x=>mats[x.t],x=>x.t,{band:44,blend:true,blendVariants:true,irregularity:0,resolution:1,transitionMode:(a,b)=>VedrasCatalog.profile(c,a,b).mode,materialClassOf:x=>by(x).materialClass});
 if(!raster?.waterLayer||!raster?.landLayer)throw Error('Missing separate layers');
 const pixel=(layer,x,y)=>{const cv=layer.canvas,ct=cv.getContext('2d');const u=Math.floor((x-layer.x)*layer.density),v=Math.floor((y-layer.y)*layer.density);
 const d=ct.getImageData(u,v,1,1).data;return Array.from(d);};
 const centerSea=pixel(raster.waterLayer,0,0),centerLand=pixel(raster.landLayer,0,0);
 const centerTundra=pixel(raster.landLayer,-128,-221.702503),flatTundra=pixel(raster.waterLayer,-128,-221.702503);
 if(centerSea[3]!==255||centerLand[3]!==0||centerTundra[3]!==255||flatTundra[3]!==0)throw Error('Land/water separation wrong '+JSON.stringify({centerSea,centerLand,centerTundra,flatTundra,at:VedrasAutotile.hexAt(-128,-221.702503)}));
 const atBorder=pixel(raster,128,0);
 const originalSea=pixel(raster,0,0);
 if(atBorder[1]<=originalSea[1]+20)throw Error('Water blend not applied: '+JSON.stringify({atBorder,originalSea}));
 const cfg={...VedrasRelief.defaults(),enabled:true,profile:'rounded',strength:95,center:'0,0',seed:1234,
  landMask:(x,y)=>{const i=VedrasAutotile.hexAt(x,y);const cell=cc.find(t=>t.q+','+t.r===i);return cell&&by(cell.t).materialClass==='ground'?1:0;},maskKey:'water-qa'};
 const baseHeight=VedrasRelief.rawAt(0,0,cfg),seaHeight=VedrasRelief.at(0,0,cfg),landHeight=VedrasRelief.at(-128,-221.702503,cfg);
 if(baseHeight<1||seaHeight!==0||landHeight<=0)throw Error('Land-only height mask invalid');
 cfg.pads=[{x:0,y:0,radius:70,transition:20,height:80}]; // even an accidental building on water never raises water
 if(VedrasRelief.at(0,0,cfg)!==0)throw Error('Building pad raised sea!');
 const deformed=VedrasRelief.make(raster.landLayer,cfg);
 if(!deformed||deformed.canvas.width!==raster.landLayer.canvas.width)throw Error('Relief land-only raster failed');
 return {wm,wm2,shore,same,centerSea,centerLand,centerTundra,atBorder,originalSea,baseHeight,seaHeight,landHeight,migrated,canvasSize:[raster.canvas.width,raster.canvas.height]};
})()''')
 print('WATER TEST RESULT',result)
 assert result['atBorder'][1]>result['originalSea'][1]+20
 assert result['seaHeight']==0
 assert not errors,errors
 browser.close()
 print('PASS: migration + soft water mixes + shoreline exclusion + alpha segregation + zero sea relief + building pad safety')