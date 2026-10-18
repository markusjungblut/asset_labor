"""v0.10.6 regression: a source-once-per-hex water raster preserves center motifs
and never produces rectangular wrap seams in any water hex interior.
Run: python tests/test_water_sampling_v106.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
source='\n'.join((BASE/f).read_text() for f in ('catalog.js','autotile.js','relief.js'))
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    page=browser.new_page(viewport={'width':1100,'height':780})
    errors=[]; page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content('<html><body><script>'+source+'</script></body></html>')
    result=page.evaluate(r'''(()=>{
      const make=(seed=1)=>{let c=document.createElement('canvas');c.width=c.height=512;
        const ctx=c.getContext('2d');let img=ctx.createImageData(512,512);
        for(let y=0;y<512;y++)for(let x=0;x<512;x++){
          const i=(y*512+x)*4;
          // deliberately wildly incompatible left/right edge pixels:
          const v=Math.round(x/511*230+11*Math.sin(y*.09+seed));
          img.data[i]=Math.max(0,Math.min(255,v));img.data[i+1]=Math.round(v*.6);img.data[i+2]=Math.round(130+v*.25);img.data[i+3]=255;
        }
        // An unmistakable SUNKEN SHIP silhouette in the interior.
        ctx.putImageData(img,0,0);ctx.fillStyle='#ffd717';ctx.fillRect(232,217,48,48);
        ctx.fillStyle='#221a18';ctx.fillRect(241,226,30,30);
        c.naturalWidth=c.naturalHeight=512;return c;
      };
      const img=make(2),img2=make(17);
      const cells=[];for(let r=-2;r<=2;r++)for(let q=-2;q<=2;q++)if(Math.abs(q+r)<=2)cells.push({q,r});
      const asset=(c)=>({path:'ship.png',img});
      const common={resolution:1,band:42,blend:true,irregularity:0,cornerBlend:true,blendVariants:true,materialClassOf:()=> 'water',transitionMode:()=> 'soft_water'};
      const repeat=VedrasAutotile.build(cells,asset,()=> 'ocean',{...common,waterSampling:'repeat'});
      const hex=VedrasAutotile.build(cells,asset,()=> 'ocean',{...common,waterSampling:'hex'});
      const at=(r,x,y)=>{const p=Math.floor((x-r.x)*r.density),q=Math.floor((y-r.y)*r.density);return Array.from(r.canvas.getContext('2d').getImageData(p,q,1,1).data)};
      const jump=(r,x,y)=>Math.max(...at(r,x-1,y).slice(0,3).map((a,i)=>Math.abs(a-at(r,x+1,y)[i])));
      const legacyJump=jump(repeat,256,0),hexJump=jump(hex,256,0);
      const center=at(hex,256,0);
      const src=Array.from(img.getContext('2d').getImageData(256,256,1,1).data);
      // Mixed water categories and 8 variants still work.
      const variants=Array.from({length:8},(_,i)=>({path:`variant_${i}`,img:i%2?img:img2}));
      const varied=VedrasAutotile.build(cells,c=>variants[cells.indexOf(c)%8],c=>cells.indexOf(c)%2?'coastal_water':'ocean',{...common,waterSampling:'hex'});
      const land1=VedrasAutotile.build(cells,asset,()=> 'grassland',{...common,waterSampling:'hex',materialClassOf:()=> 'ground'});
      const land2=VedrasAutotile.build(cells,asset,()=> 'grassland',{...common,waterSampling:'repeat',materialClassOf:()=> 'ground'});
      const pAt=(r,x,y)=>at(r,x,y);
      const landIdentical=pAt(land1,256,0).every((v,i)=>v===pAt(land2,256,0)[i]);
      const c=VedrasCatalog.starter();const catalogueBlend=VedrasCatalog.profile(c,'coastal_water','ocean').mode;
      return {legacyJump,hexJump,center,src,variantCount:varied.materialCount,waterLayer:!!varied.waterLayer,landIdentical,catalogueBlend,waterRelief:VedrasRelief.at(12,21,{...VedrasRelief.defaults(),enabled:true,landMask:()=>0})};
    })()''')
    print(result)
    assert result['legacyJump']>80, 'Legacy did not reproduce repeated rectangular seam'
    assert result['hexJump']<15, 'New mode still has a rectangular seam inside the hex'
    assert result['center'][:3]==result['src'][:3], 'Deliberate centered ship lost or recolored'
    assert result['variantCount']==8 and result['waterLayer']
    assert result['landIdentical'], 'Existing land material sampling changed'
    assert result['catalogueBlend']=='soft_water'
    assert result['waterRelief']==0
    assert not errors, errors
    print('PASS v0.10.6: motif intact; no internal water seam; 8 variants; coast-water mixing; land unchanged; flat water')
    browser.close()