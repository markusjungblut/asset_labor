"""Paint native RGBA timber gate sprites from the accepted v5 timber sources.

No SVG rasterization, no runtime image transforms. Each facade uses sampled
painted wood pixels, its own directional texture and original baseline.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/walls/palisade'
OUT=SRC/'gates/v1'
OUT.mkdir(parents=True,exist_ok=True)

def mix(a,b,t):
    return a*(1-t)+b*t

def texture_beam(out, polygon, texture, shade=1.0):
    # Raster paint the beam from the same original timber grain, not a flat
    # geometric fill. Dark bevel and bright right-hand edge are baked in.
    h,w=out.shape[:2]
    mask=Image.new('L',(w,h),0)
    ImageDraw.Draw(mask).polygon(polygon,fill=255)
    m=np.asarray(mask,dtype=np.float32)/255
    if not np.any(m): return
    ys,xs=np.nonzero(m)
    x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
    bw,bh=x1-x0+1,y1-y0+1
    grain=np.asarray(Image.fromarray(texture).resize((max(1,bw),max(1,bh)),Image.Resampling.BICUBIC),dtype=np.float32)
    a=m[y0:y1+1,x0:x1+1,None]
    er=np.asarray(mask.filter(ImageFilter.MinFilter(5)),dtype=np.float32)/255
    rim=(m-er)[y0:y1+1,x0:x1+1,None]
    light=np.linspace(.83,1.14,bw,dtype=np.float32)[None,:,None]
    rgb=np.clip(grain*shade*light*(1-rim*.32),0,255)
    cut=out[y0:y1+1,x0:x1+1]
    cut[:,:,:3]=np.clip(cut[:,:,:3]*(1-a)+rgb*a,0,255).astype(np.uint8)
    cut[:,:,3]=np.maximum(cut[:,:,3],(a[:,:,0]*255).astype(np.uint8))

def face(dir, src):
    h,w=src.shape[:2];out=src.copy()
    # Find real opaque silhouette endpoints from the original painting.
    valid=src[:,:,3]>128
    xs=np.flatnonzero(valid.any(axis=0))
    xleft,xright=int(xs[0]),int(xs[-1])
    span=xright-xleft
    x0=round(xleft+span*.24);x1=round(xleft+span*.76)
    # A robust straight facade line follows the same original ground slope.
    yb=np.array([np.where(valid[:,x])[0].max() if valid[:,x].any() else 0 for x in range(w)])
    xt=np.arange(x0,x1+1)
    coef=np.polyfit(xt,yb[xt],1)
    slope=float(coef[0]); b0=float(np.polyval(coef,x0))
    base=lambda x: b0+slope*(x-x0)
    gateheight=145
    # Repaint leaves with actual vertical wood grain. The gate leaf bottoms
    # retain the exact stepped alpha boundary of the original posts.
    for x in xt:
        bottom=int(yb[x]); top=int(round(base(x)-gateheight))
        if bottom<=top:continue
        # Use continuous shaft grain, excluding pointed pale tips.
        source_top=max(0,bottom-135)
        source=src[source_top:bottom+1,x,:3]
        if len(source)<2:continue
        sample=np.asarray(Image.fromarray(source[:,None,:]).resize((1,bottom-top+1),Image.Resampling.BICUBIC))[:,0,:]
        out[:top,x]=0
        tint=.84 if dir in (0,3) else .91
        out[top:bottom+1,x,:3]=np.clip(sample*tint,0,255).astype(np.uint8)
        out[top:bottom+1,x,3]=255
        out[bottom+1:,x]=0
    # Grain sample for braces from the original fully painted shaft.
    cx=(x0+x1)//2; cy=int(yb[cx])
    tex=src[max(0,cy-119):cy-22,max(0,cx-8):cx+9,:3]
    # Place wide, weathered wooden cross-bars and matching diagonal bracing.
    def point(x,dy):return (int(x),int(round(base(x)+dy)))
    def beam(xa,xb,ya,yb,width,shade=1):
        polygon=[point(xa,ya-width/2),point(xb,yb-width/2),point(xb,yb+width/2),point(xa,ya+width/2)]
        texture_beam(out,polygon,tex,shade)
    mid=(x0+x1)//2
    for xa,xb,ya,yb in [(x0+5,mid-5,-35,-111),(mid+5,x1-5,-111,-35)]:
        beam(xa,xb,ya,yb,11,.98)
    for yy in (-119,-25):
        beam(x0+1,mid-2,yy,yy,14,.92)
        beam(mid+2,x1-1,yy,yy,14,.92)
    # Upper lintel is an actual textured beam, not a row of ordinary spikes.
    beam(x0-3,x1+3,-145,-145,17,1.13)
    # Center door seam, hinges and latches drawn directly into RGBA pixels.
    im=Image.fromarray(out,'RGBA')
    draw=ImageDraw.Draw(im)
    draw.line([point(mid,-135),point(mid,-3)],fill=(48,28,17,255),width=4)
    draw.line([point(mid+3,-135),point(mid+3,-3)],fill=(154,99,51,255),width=1)
    for xa,xb in [(x0+3,x0+27),(x1-27,x1-3)]:
        for yy in (-119,-25):
            draw.polygon([point(xa,yy-4),point(xb,yy-4),point(xb,yy+4),point(xa,yy+4)],fill=(58,48,38,255))
            draw.line([point(xa,yy-4),point(xb,yy-4)],fill=(124,111,87,255),width=1)
            for xx in (xa+4,xb-4):
                px,py=point(xx,yy);draw.ellipse((px-1,py-1,px+1,py+1),fill=(181,155,115,255))
    for xx in (mid-12,mid+12):
        px,py=point(xx,-70)
        draw.ellipse((px-4,py-5,px+4,py+5),outline=(55,44,34,255),width=3)
        draw.arc((px-4,py-5,px+4,py+5),200,345,fill=(160,142,112,255),width=1)
    return im

def edge_on(src):
    h,w=src.shape[:2];out=src.copy()
    # Widen the middle timber assembly while leaving both original ends and
    # vertical anchor unchanged. There is deliberately no visible door face.
    y0,y1=220,405
    for y in range(y0,y1):
        a=np.flatnonzero(src[y,:,3]>0)
        if not len(a):continue
        l,r=int(a[0]),int(a[-1]); row=src[y:y+1,l:r+1]
        t=min(1,(y-y0)/22,(y1-1-y)/22)
        factor=1+.50*max(0,t)
        width=min(w-4,round((r-l+1)*factor))
        dst=(w-width)//2
        out[y]=0
        out[y,dst:dst+width]=np.asarray(Image.fromarray(row,'RGBA').resize((width,1),Image.Resampling.LANCZOS))[0]
    # Timber gate crosspieces follow the top-down projected silhouette.
    crop=src[408:505,30:54,:3]
    for y in (253,372):
        a=np.flatnonzero(out[y,:,3]>128)
        if len(a)<8:continue
        l,r=int(a[0]),int(a[-1])
        texture_beam(out,[(l,y),(r,y),(r,y+10),(l,y+10)],crop,1.10)
    return Image.fromarray(out,'RGBA')

for d in range(6):
    original=Image.open(SRC/f'edge_dir{d}.webp').convert('RGBA')
    pixels=np.asarray(original)
    result=edge_on(pixels) if d in (1,4) else face(d,pixels)
    assert result.size==original.size
    result.save(OUT/f'gate_dir{d}.png',optimize=True)
    print(d,result.size,result.getbbox())
# Human-review contact sheet, not loaded into the editor.
sheet=Image.new('RGBA',(1000,800),(89,116,68,255))
for d in range(6):
    im=Image.open(OUT/f'gate_dir{d}.png').convert('RGBA')
    im.thumbnail((310,365))
    x=(d%3)*333+(333-im.width)//2
    y=(d//3)*400+(400-im.height)//2
    sheet.alpha_composite(im,(x,y))
sheet.save(ROOT/'timber-gate-preview.png')
