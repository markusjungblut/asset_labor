"""Compose AI-painted timber gate centers onto the exact v5 palisade sprites.
Original end stakes, canvas, shaft height and projection remain unchanged.
No SVG or procedurally drawn gate components.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/walls/palisade'
OUT=ROOT/'palisade-gate-v4-output'
OUT.mkdir(exist_ok=True)
atlas=Image.open(SRC/'gates/v1/source_atlas_v4.png').convert('RGBA')
def crop(box):
    im=atlas.crop(box)
    a=np.array(im)
    a[:,:,3]=np.where(a[:,:,3]<24,0,np.clip(a[:,:,3].astype(float)*255/253,0,255)).astype('uint8')
    im=Image.fromarray(a)
    bb=im.getchannel('A').point(lambda x:255 if x>128 else 0).getbbox()
    return im.crop(bb)
def color_match(a,ref,weight=.88):
    # Match the local original timber palette, not the old gate style.
    rgb=a[:,:,:3].astype(float)
    m=(a[:,:,3]>200)&(rgb[:,:,0]>rgb[:,:,2]*1.22)&(rgb[:,:,1]>rgb[:,:,2]*1.05)
    r=ref[:,:,:3].astype(float)
    rm=(ref[:,:,3]>200)&(r[:,:,0]>r[:,:,2]*1.22)
    if m.sum()<50 or rm.sum()<50:return a
    p=np.percentile(rgb[m],[20,50,80],axis=0)
    q=np.percentile(r[rm],[20,50,80],axis=0)
    out=rgb.copy()
    for k in range(3):
        v=rgb[:,:,k]
        mapped=np.interp(v,[0,*p[:,k],255],[0,*q[:,k],255])
        out[:,:,k]=v*(1-weight)+mapped*weight
    # Keep iron fittings dark and neutral.
    out[~m]=rgb[~m]
    a=a.copy();a[:,:,:3]=np.clip(out,0,255).astype('uint8')
    return a
def fit_diagonal(d,original):
    # AI-generated gate centers have thicker, irregular poles. Keep the
    # original exterior 2.5 stakes at both ends and reuse its true alpha
    # silhouette. Flatten both painted facade slopes before composition.
    ref=np.array(original)
    h,w=ref.shape[:2]
    descending=d in (0,3)
    tile=crop({0:(0,0,512,512),2:(512,0,1024,512),3:(1024,0,1536,512)}[d])
    if not descending:tile=tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    src=np.array(tile);sh,sw=src.shape[:2]
    def bottom(arr):
        valid=arr[:,:,3]>128
        return np.array([np.where(valid[:,x])[0].max() if valid[:,x].any() else -1 for x in range(arr.shape[1])])
    rb=bottom(ref); sb=bottom(src)
    rx=np.flatnonzero(rb>=0)
    left,right=rx[0],rx[-1]
    # Gate occupies only the middle 52%, leaving the original sharpened
    # stake groups untouched.
    lo=round(left+(right-left)*.24);hi=round(left+(right-left)*.76)
    # Crop the central double leaf (the AI atlas has outer stockade posts).
    sl=round(sw*.24);sr=round(sw*.76)
    out=ref.copy()
    # Match the 145-pixel original log height from tip to foot, retaining
    # the actual original top/bottom contour for a seamless wall transition.
    for x in range(lo,hi+1):
        sx=int(round(sl+(x-lo)/(hi-lo)*(sr-sl)))
        if sb[sx]<0 or rb[x]<0:continue
        ys=np.where(src[:,sx,3]>128)[0]
        yr=np.where(ref[:,x,3]>128)[0]
        if len(ys)<10 or len(yr)<10:continue
        # One vertical resampling of the complete painted central column.
        col=src[ys[0]:ys[-1]+1,sx:sx+1]
        mapped=np.array(Image.fromarray(col).resize((1,yr[-1]-yr[0]+1),Image.Resampling.LANCZOS))[:,0]
        out[yr[0]:yr[-1]+1,x,:3]=mapped[:,:3]
    corrected=color_match(out,ref)
    # Feather only in the two internal transition strips. Preserve alpha
    # and original outside pixels exactly. No global recoloring.
    for x in range(lo,hi+1):
        t=min(1,(x-lo)/6,(hi-x)/6)
        valid=ref[:,x,3]>0
        out[valid,x,:3]=np.clip(ref[valid,x,:3]*(1-t)+corrected[valid,x,:3]*t,0,255).astype('uint8')
    out[:,:,3]=ref[:,:,3]
    # Right-hand illumination: local brightness modulation based on the
    # original stake shading, including the reflected SO facing.
    # Restore the original per-column grain/light envelope in the gate center.
    for x in range(lo+6,hi-5):
        m=ref[:,x,3]>200
        if m.sum()<10:continue
        old=ref[m,x,:3].astype(float)
        new=out[m,x,:3].astype(float)
        # Small correction, never invert or wash out metal details.
        ratio=np.clip(np.mean(old,axis=0)/(np.mean(new,axis=0)+1e-6),.86,1.15)
        wood=new[:,0]>new[:,2]*1.25
        new[wood]*=ratio
        out[m,x,:3]=np.clip(new,0,255).astype('uint8')
    return Image.fromarray(out)
def fit_vertical(d,original):
    ref=np.array(original);h,w=ref.shape[:2]
    tile=crop((0,512,512,1024) if d==1 else (512,512,1024,1024))
    # Only use the generated gatehouse midsection; keep exact original
    # end-on pointed posts at top and bottom.
    sh=tile.height
    center=tile.crop((0,round(sh*.34),tile.width,round(sh*.76)))
    target_h=178
    center=center.resize((min(72,w-6),target_h),Image.Resampling.LANCZOS)
    patch=np.array(center)
    patch=color_match(patch,ref)
    # Bake the AI-painted gatehouse in at the original wall centerline.
    # Feather vertically across the transition to the original palisade.
    y0=224;x0=(w-patch.shape[1])//2
    for y in range(patch.shape[0]):
        t=min(1,y/20,(patch.shape[0]-1-y)/20)
        patch[y,:,3]=(patch[y,:,3].astype(float)*t).astype('uint8')
    result=original.copy()
    result.alpha_composite(Image.fromarray(patch),(x0,y0))
    return result
for d in range(5):
    orig=Image.open(SRC/f'edge_dir{d}.webp').convert('RGBA')
    result=fit_vertical(d,orig) if d in (1,4) else fit_diagonal(d,orig)
    assert result.size==orig.size
    a,b=np.array(orig),np.array(result)
    if d in (1,4):
        assert np.array_equal(a[:224],b[:224]) and np.array_equal(a[402:],b[402:])
    else:
        assert np.array_equal(a[:,:,3],b[:,:,3])
        assert np.array_equal(a[:,:80],b[:,:80]) and np.array_equal(a[:,345:],b[:,345:])
    result.save(OUT/f'gate_dir{d}.png',optimize=True)
    print(d,result.size)
(OUT/'gate_dir5.png').write_bytes((OUT/'gate_dir2.png').read_bytes())
# side-by-side original / new on a neutral terrain-like backdrop
sheet=Image.new('RGBA',(1100,1000),(113,135,85,255))
for d in range(6):
    for i,im in enumerate([Image.open(SRC/f'edge_dir{d}.webp').convert('RGBA'),Image.open(OUT/f'gate_dir{d}.png').convert('RGBA')]):
        im.thumbnail((170,290))
        x=(d%3)*365+i*181+(181-im.width)//2
        y=(d//3)*495+(495-im.height)//2
        sheet.alpha_composite(im,(x,y))
sheet.save(OUT/'comparison.png')
