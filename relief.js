/* Vedras Reiche – Relief-Labor v0.10.1.
 * CPU 2.5D heightfield on the single shared auto-tiled terrain raster.
 * Not full 3D geometry: raised ground silhouette, height-dependent lighting,
 * and ground-anchored objects. The heightfield never restarts at hex edges.
 */
'use strict';
window.VedrasRelief = (()=>{
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const smooth=(v)=>{v=clamp(v,0,1);return v*v*(3-2*v);};
 const G=8; // cached height-grid world units, independent of camera zoom
 const surfaceCache=new Map();
 const geoIndexCache=new WeakMap();
 const noise=(s)=>{let n=(s|0)^0x6d2b79f5;n=Math.imul(n^(n>>>15),1|n);n^=n+Math.imul(n^(n>>>7),61|n);return ((n^(n>>>14))>>>0)/4294967296;};
 const defaults=()=>({enabled:false,mode:'legacy',profile:'rounded',strength:45,lighting:true,connected:true,debug:false,padBuildings:true,seed:43781,center:'0,0'});
 function valid(raw){const d=defaults(),v={...d,...(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{})};
  v.enabled=!!v.enabled;v.lighting=!!v.lighting;v.connected=!!v.connected;v.debug=!!v.debug;v.padBuildings=!!v.padBuildings;
  v.pads=Array.isArray(v.pads)?v.pads.slice(0,60):[];
  v.mode=v.mode==='geography'?'geography':'legacy';
  v.geoHills=Array.isArray(v.geoHills)?v.geoHills:[];
  if(!['rounded','steep','chain','plateau','ridge'].includes(v.profile))v.profile=d.profile;
  v.strength=clamp(Number(v.strength)||0,0,100);v.seed=Number.isInteger(Number(v.seed))?clamp(Number(v.seed),0,2147483647):d.seed;
  if(!/^-?\d+,-?\d+$/.test(v.center))v.center=d.center;return v;
 }
 function center(o){const [q,r]=o.center.split(',').map(Number),R=256/Math.sqrt(3);return {x:256*(q+r/2),y:1.5*R*r};}
 // Smooth world-space value noise: changing a seed must change profile silhouettes,
 // especially the plateau. Interpolation makes contours continuous over hex edges.
 function valueNoise(x,y,seed,scale){const xx=x/scale,yy=y/scale,ix=Math.floor(xx),iy=Math.floor(yy),tx=smooth(xx-ix),ty=smooth(yy-iy);
  const p=(a,b)=>noise((seed|0)^Math.imul(a+12973,374761393)^Math.imul(b+8901,668265263));
  const a=p(ix,iy),b=p(ix+1,iy),c=p(ix,iy+1),d=p(ix+1,iy+1);return 2*(a*(1-tx)*(1-ty)+b*tx*(1-ty)+c*(1-tx)*ty+d*tx*ty)-1;}
 
 // Worldgen v2.1 continuous, coordinate-derived hill regions.
 // Multiple overlapping source hexes produce one seamless heightfield.
 function geographyIndex(hills){
  const found=geoIndexCache.get(hills);if(found)return found;
  const byHex=new Map();
  for(const h of hills){
   if(!Number.isSafeInteger(h?.q)||!Number.isSafeInteger(h?.r))continue;
   byHex.set(h.q+','+h.r,h);
  }
  geoIndexCache.set(hills,byHex);
  return byHex;
 }
 function geoHeight(x,y,o){
  const hills=o.geoHills||[];
  if(!hills.length)return 0;
  const rf=y/(1.5*(256/Math.sqrt(3))),qf=x/256-rf/2;
  const q0=Math.round(qf),r0=Math.round(rf),index=geographyIndex(hills);
  let volume=0;
  for(let r=r0-2;r<=r0+2;r++)for(let q=q0-2;q<=q0+2;q++){
   const h=index.get(q+','+r);
   if(!h)continue;
   const dx=x-256*(q+r/2),dy=y-1.5*(256/Math.sqrt(3))*r;
   const code=((Math.imul(q,73856093)^Math.imul(r,19349663)^o.seed)>>>0);
   const rotation=(noise(code)-.5)*1.7;
   const ca=Math.cos(rotation),sa=Math.sin(rotation),
    u=dx*ca+dy*sa,v=-dx*sa+dy*ca;
   const shape=h.profile||'rounded';
   let w=0;
   if(shape==='ridge')w=Math.exp(-.5*((u/310)**2+(v/116)**2));
   else if(shape==='chain')w=Math.exp(-.5*((u/285)**2+(v/151)**2));
   else if(shape==='steep')w=Math.exp(-.65*Math.pow(Math.hypot(u/175,v/162),3.1));
   else if(shape==='plateau'){
    const distance=Math.hypot(u/191,v/174);
    w=1-smooth((distance-.57)/.82);
   }else w=Math.exp(-.5*((u/180)**2+(v/185)**2));
   const strength=clamp(Number(h.strength)||0,0,1);
   volume+=w*(.38+.62*strength);
  }
  return 67*(o.strength/100)*Math.min(1.28,volume*.74);
 }
 function containsGeographyHills(raster,o){
  const hills=o.geoHills||[];
  if(!hills.length)return false;
  const left=raster.x-390,right=raster.x+raster.width+390;
  const top=raster.y-390,bottom=raster.y+raster.height+390;
  return hills.some(h=>{
   const x=256*(h.q+h.r/2),y=1.5*(256/Math.sqrt(3))*h.r;
   return x>=left&&x<=right&&y>=top&&y<=bottom;
  });
 }

 function rawField(x,y,o){if(!o.enabled||o.strength<=0)return 0;
  if(o.mode==='geography')return geoHeight(x,y,o);
  const c=center(o),dx=x-c.x,dy=y-c.y,wide=o.connected?1.0:.46;
  const phase=(noise(o.seed)-.5)*1.6;
  const v1=valueNoise(x,y,o.seed+177,205),v2=valueNoise(x,y,o.seed+991,105);
  const angle=(noise(o.seed+67)-.5)*.7;
  const cs0=Math.cos(angle),sn0=Math.sin(angle);
  // Distort the world coordinates continuously, never once per hex.
  const wx=dx+v1*39+v2*12,wy=dy+valueNoise(x+177,y-129,o.seed+73,205)*39+valueNoise(x,y,o.seed+333,103)*12;
  const xx=wx*cs0-wy*sn0,yy=wx*sn0+wy*cs0;
  let r=0;
  if(o.profile==='rounded'){
   const ax=194*wide*(.8+noise(o.seed+15)*.4),ay=210*wide*(.8+noise(o.seed+48)*.4);
   r=Math.exp(-.5*(xx*xx/(ax*ax)+yy*yy/(ay*ay)));
  }else if(o.profile==='steep'){
   const ax=156*wide*(.84+noise(o.seed+13)*.32),ay=159*wide*(.82+noise(o.seed+79)*.36);
   r=Math.exp(-Math.pow(Math.hypot(xx/ax,yy/ay),3.2)*.75);
  }else if(o.profile==='plateau'){
   // Seed controls ellipse, crest offset and edge roughness, with no perfect circle.
   const ax=190*wide*(.8+noise(o.seed+22)*.45),ay=190*wide*(.78+noise(o.seed+44)*.49);
   const dist=Math.hypot(xx/ax,yy/ay);
   const irregular=dist+v1*.075+v2*.032;
   r=1-smooth((irregular-.61)/.66);
  }else if(o.profile==='chain'){
   const theta=-.48+phase*.22,cs=Math.cos(theta),sn=Math.sin(theta),a=xx*cs+yy*sn,b=-xx*sn+yy*cs;
   const sigmaA=95*wide,sigmaB=120*wide;
   for(let i=-1;i<=1;i++){const sa=a-i*184*wide,sb=b-Math.sin(i+phase)*44*wide;
    r+=Math.exp(-.5*(sa*sa/(sigmaA*sigmaA)+sb*sb/(sigmaB*sigmaB)))*(.67+noise(o.seed+i+71)*.32);
   }r=1-Math.exp(-r*1.15);
  }else if(o.profile==='ridge'){
   const theta=.56+phase*.25,cs=Math.cos(theta),sn=Math.sin(theta),a=xx*cs+yy*sn,b=-xx*sn+yy*cs;
   const side=b-Math.sin(a/(144*wide)+phase)*57*wide;
   r=Math.exp(-.5*side*side/(88*wide)**2)*Math.exp(-.5*a*a/(345*wide)**2);
   r*=.82+.14*Math.sin(a/(74*wide)+phase);
  }
  return 67*(o.strength/100)*clamp(r,0,1.25);
 }
 function field(x,y,o){let h=rawField(x,y,o);
  if(o.padBuildings&&o.pads?.length)for(const p of o.pads){
   const dist=Math.hypot(x-p.x,y-p.y),r=Number(p.radius)||50,transition=Math.max(8,Number(p.transition)||40);
   if(dist>=r+transition)continue;
   const w=1-smooth((dist-r)/transition);
   h=h*(1-w)+p.height*w;
  }
  // Apply after building pads: a building footprint must NEVER elevate water.
  return h*(typeof o.landMask==='function'?clamp(o.landMask(x,y),0,1):1);
 }
 function gridFor(raster,o){const extra=89,left=raster.x-9,top=raster.y-extra-9,right=raster.x+raster.width+9,bottom=raster.y+raster.height+9;
  const gw=Math.ceil((right-left)/G)+2,gh=Math.ceil((bottom-top)/G)+2,data=new Float32Array(gw*gh);
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++)data[j*gw+i]=field(left+i*G,top+j*G,o);
  function height(x,y){const xx=clamp((x-left)/G,0,gw-1.001),yy=clamp((y-top)/G,0,gh-1.001),ix=Math.floor(xx),iy=Math.floor(yy),tx=xx-ix,ty=yy-iy;
   const n=iy*gw+ix,a=data[n],b=data[n+1],c=data[n+gw],d=data[n+gw+1];return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;
  }
  return {height,left,top,gw,gh};
 }
 function make(source,options){const o=valid(options);if(!o.enabled||o.strength===0||
  (o.mode==='geography'&&!containsGeographyHills(source,o)))return source;
  const sig=JSON.stringify({raster:source._reliefId||source._cacheStamp||source.canvas?.width+'x'+source.canvas?.height,scene:{...options,landMask:undefined},maskKey:options.maskKey||''});
  const cached=surfaceCache.get(sig);if(cached&&cached.base===source)return cached.result;
  const density=source.density,extra=89;const target=document.createElement('canvas');
  target.width=source.canvas.width;target.height=source.canvas.height+Math.ceil(extra*density);
  const src=source.canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,source.canvas.width,source.canvas.height);
  const dstCtx=target.getContext('2d',{willReadFrequently:true}),dst=dstCtx.createImageData(target.width,target.height);
  const S=src.data,D=dst.data,sw=src.width,sh=src.height,dw=dst.width,dh=dst.height;
  const gr=gridFor(source,o),h=gr.height,left=source.x,top=source.y-extra;
  // Sample at destination world coordinates. Invert the projected elevation by two
  // iterations so the asset's ground contact coincides with the warped terrain.
  // Bilinear color/alpha sampling avoids visible half-pixel cracks at shared edges.
  for(let py=0;py<dh;py++){
   const y=top+(py+.5)/density;
   for(let px=0;px<dw;px++){
    const x=left+(px+.5)/density;
    let yy=y+h(x,y);yy=y+h(x,yy);
    const sx=px,sy=(yy-source.y)*density-.5;
    if(sy<0||sy>=sh-1)continue;
    const iy=Math.floor(sy),fy=sy-iy,ix=Math.floor(sx),fx=sx-ix;
    if(ix<0||ix>=sw-1)continue;
    const i=(iy*sw+ix)*4,tx=4*(py*dw+px);
    const w0=(1-fx)*(1-fy),w1=fx*(1-fy),w2=(1-fx)*fy,w3=fx*fy;
    const a=i,b=i+4,c=i+sw*4,d=c+4;
    const alpha=S[a+3]*w0+S[b+3]*w1+S[c+3]*w2+S[d+3]*w3;
    if(alpha<.5)continue;
    D[tx+3]=alpha;
    let shade=1;
    if(o.lighting){
     // Light comes from camera-right. The opposing slope stays in soft shade.
     const gx=(h(x+G,yy)-h(x-G,yy))/(2*G),gy=(h(x,yy+G)-h(x,yy-G))/(2*G);
     shade=clamp(1-1.65*gx-.34*gy,.70,1.28);
    }
    for(let ch=0;ch<3;ch++){
     const v=(S[a+ch]*S[a+3]*w0+S[b+ch]*S[b+3]*w1+S[c+ch]*S[c+3]*w2+S[d+ch]*S[d+3]*w3)/Math.max(.01,alpha);
     D[tx+ch]=o.debug?(ch===0?clamp(65+h(x,yy)*3,0,255):ch===1?clamp(30+h(x,yy)*1.3,0,255):180):clamp(v*shade,0,255);
    }
   }
  }
  dstCtx.putImageData(dst,0,0);
  const result={canvas:target,x:source.x,y:source.y-extra,width:source.width,height:source.height+extra,density:source.density};
  surfaceCache.clear();surfaceCache.set(sig,{base:source,result});return result;
 }
 function at(x,y,o){o=valid(o);return field(x,y,o);}
 return {defaults,valid,at,rawAt:(x,y,o)=>rawField(x,y,valid(o)),make,
  geographyHeight:(x,y,opts)=>geoHeight(x,y,valid(opts)),clear:()=>surfaceCache.clear()};
})();