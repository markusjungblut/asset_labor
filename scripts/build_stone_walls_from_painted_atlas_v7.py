#!/usr/bin/env python3
"""Use new hand-painted medieval stone art, fitted to PALISADE V5 hex geometry.
No stone-v1/v6 pixel reuse. Requires Pillow, numpy and opencv-python-headless.
Run: python scripts/build_stone_walls_from_painted_atlas_v7.py
"""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import cv2, math, numpy as np, json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/walls/stone/v7'
ATLAS=np.asarray(Image.open(OUT/'source_atlas.png').convert('RGB'))
OUT.mkdir(exist_ok=True)
HEX=256; R=HEX/math.sqrt(3); PY=.85; DPR=3
DIRS=((1,-1),(1,0),(0,1),(-1,1),(-1,0),(0,-1))
# Geometrically derived from palisade v5 via projected canonical edge.
# enlarge transparent padding for the 24-unit thick stone masonry
META=((156,167,14,89),(40,216,20,82),(156,167,142,89),
      (156,167,142,152),(40,216,20,208),(156,167,14,152))
JOIN={"corner_post":(46,84),"end_post":(38,82)}

def isolated(k):
    row,col=divmod(k,2)
    cell=ATLAS[row*362:(row+1)*362,col*543:(col+1)*543]
    cut=np.uint8(np.min(cell,axis=2)<235)*255
    cut=cv2.morphologyEx(cut,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
    cnts,_=cv2.findContours(cut,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    if not cnts: raise RuntimeError('No art in cell '+str(k))
    outline=max(cnts,key=cv2.contourArea)
    mask=np.zeros_like(cut)
    cv2.drawContours(mask,[outline],-1,255,cv2.FILLED)
    x,y,w,h=cv2.boundingRect(outline)
    # no copied checkerboard: outer RGB fully discarded
    rgb=cell.astype(np.float32).copy()
    # recover pale stone edge pixels from color mixed with white canvas
    alpha=cv2.GaussianBlur(mask.astype(np.float32)/255,(3,3),.48)
    alpha=np.clip(alpha,0,1)
    corrected=(rgb-251*(1-alpha[:,:,None]))/np.maximum(alpha[:,:,None],.2)
    corrected=np.uint8(np.clip(corrected,0,255))
    rgba=np.dstack([corrected,np.uint8(np.round(alpha*255))])
    return rgba,(x,y,w,h)

def baseline(rgba,bb):
    x0,y0,w,h=bb
    m=rgba[:,:,3]>128
    pts=[]
    for x in range(x0+round(w*.09),x0+round(w*.91),8):
        ys=np.where(m[:,x])[0]
        if len(ys)>0: pts.append((x,np.percentile(ys,99.5)))
    X,Y=np.array(pts).T
    # remove extreme/pillar samples after preliminary fit
    a,b=np.polyfit(X,Y,1)
    for _ in range(2):
        good=np.abs(Y-(a*X+b))<12
        a,b=np.polyfit(X[good],Y[good],1)
    return (a,b)

def render_diag(k,dir):
    src,bb=isolated(k)
    x0,y0,w0,h0=bb
    slope,intercept=baseline(src,bb)
    W,H,ax,ay=META[dir]
    leftx,rightx=(14,142)
    if dir==0: lefty,righty=89,152
    elif dir==2: lefty,righty=152,89
    elif dir==3: lefty,righty=89,152
    elif dir==5: lefty,righty=152,89
    sl=x0; sr=x0+w0-1
    yleft=slope*sl+intercept
    yright=slope*sr+intercept
    # Exterior height approximately equals 62 wall + 11 merlon canonical units.
    hsource=np.median([(slope*x+intercept-y0) for x in (sl,sr)])
    htarget=73*DPR
    # cv2 three-point affine preserves all original stone painting/brick detail
    srcPts=np.float32([[sl,yleft],[sr,yright],[sl,yleft-hsource]])
    dstPts=np.float32([[leftx*DPR,lefty*DPR],[rightx*DPR,righty*DPR],[leftx*DPR,lefty*DPR-htarget]])
    matrix=cv2.getAffineTransform(srcPts,dstPts)
    target=cv2.warpAffine(src,matrix,(W*DPR,H*DPR),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_CONSTANT,borderValue=(0,0,0,0))
    # Nothing outside of the lower canonical hex-edge line is permitted.
    ys,xs=np.indices(target.shape[:2]); foot=(lefty*DPR+(righty-lefty)*(xs-leftx*DPR)/(rightx-leftx))
    # retain slight hand-painted base irregularity but never extend below ground
    target[ys>foot,3]=0
    target[ys>foot,:3]=0
    return target,{'source_bbox':bb,'src_baseline':[float(slope),float(intercept)],'target_foot':[[leftx,lefty],[rightx,righty]],'source_height':float(hsource)}

def render_vertical(k,dir):
    src,bb=isolated(k)
    x,y,w,h=bb
    W,H,ax,ay=META[dir]
    # real projected hex edge endpoints are y=82..208, upright height=73 units
    outw=24*DPR
    xdest=(W*DPR-outw)//2
    ydest=3*DPR
    fullh=H*DPR - ydest - 6*DPR
    crop=src[y:y+h,x:x+w].copy()
    transformed=cv2.resize(crop,(outw,fullh),interpolation=cv2.INTER_CUBIC)
    target=np.zeros((H*DPR,W*DPR,4),np.uint8)
    target[ydest:ydest+fullh,xdest:xdest+outw]=transformed
    # bottom must rest directly on projected southern shared hex foot y=208
    # east/west images represent their upright edge's full projection
    return target,{'source_bbox':bb,'target_foot':[20,208]}

def render_post(k,name):
    src,bb=isolated(k)
    x,y,w,h=bb
    W,H=JOIN[name]
    cropped=src[y:y+h,x:x+w]
    target=cv2.resize(cropped,(W*DPR,H*DPR),interpolation=cv2.INTER_CUBIC)
    return target,{'source_bbox':bb}

def write_rgba(out,name):
    out=out.copy()
    out[out[:,:,3]<9]=0
    # color in fully transparent pixel does not matter, force true zero
    out[out[:,:,3]==0,:3]=0
    im=Image.fromarray(out,'RGBA')
    im.save(OUT/(name+'.png'),optimize=True)
    return im

sprites={};reports={}
for d in range(6):
    k=d
    res,rep=render_vertical(k,d) if d in (1,4) else render_diag(k,d)
    sprites[d]=write_rgba(res,'edge_dir'+str(d));reports['edge_dir'+str(d)]=rep
joins={}
for k,name in [(6,'corner_post'),(7,'end_post')]:
    res,rep=render_post(k,name)
    joins[name]=write_rgba(res,name);reports[name]=rep

# Accurate axial projection / exact same position rules as palisade v5 renderer.
def pos(q,r):return (HEX*(q+r/2),1.5*R*r)
def verts(q,r):
    x,y=pos(q,r)
    return [(x+R*math.cos(-math.pi/2+i*math.pi/3),y+R*math.sin(-math.pi/2+i*math.pi/3)) for i in range(6)]
def edge(d):
    v=verts(0,0); return v[d],v[(d+1)%6]
preview=Image.new('RGB',(1800,1280),(48,62,53));d=ImageDraw.Draw(preview)
try:
    font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',24)
    smaller=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
except OSError:font=smaller=ImageFont.load_default()
def panel(cx,cy,title,edge_dirs,zoom=1.55):
    x0,y0=cx-415,cy-280;x1,y1=cx+415,cy+280
    d.rounded_rectangle((x0,y0,x1,y1),radius=10,fill=(72,86,70),outline=(113,132,104),width=3)
    project=lambda x,y:(cx+x*zoom,cy+y*PY*zoom)
    for q,r in [(0,0)]+list(DIRS):
        poly=[project(*p) for p in verts(q,r)]
        d.line(poly+[poly[0]],fill=(100,121,96),width=2)
    nodes={};drawables=[]
    for i in edge_dirs:
        a,b=edge(i)
        for p in [a,b]:
            key=(round(p[0],5),round(p[1],5));nodes[key]=(p,nodes.get(key,(p,0))[1]+1)
        drawables.append(((a[1]+b[1])/2,0,i,a))
    for p,degree in nodes.values():drawables.append((p[1],1,degree,p))
    drawables.sort(key=lambda z:(z[0],z[1]))
    canvas=Image.new('RGBA',preview.size,(0,0,0,0))
    for _,typ,idx,p in drawables:
        x,y=project(*p)
        if typ==0:
            W,H,ax,ay=META[idx];asset=sprites[idx];px=x-ax*zoom;py=y-ay*zoom
        else:
            name='corner_post' if idx>1 else 'end_post'
            W,H=JOIN[name];asset=joins[name];px=x-W*zoom/2;py=y-H*zoom
        z=asset.resize((max(1,round(W*zoom)),max(1,round(H*zoom))),Image.Resampling.LANCZOS)
        canvas.alpha_composite(z,(round(px),round(py)))
    preview.paste(Image.alpha_composite(preview.convert('RGBA'),canvas).convert('RGB'))
    d.text((x0+15,y0+12),title,font=font,fill='#f5f2e9')
    for p,degree in nodes.values():
        x,y=project(*p);d.ellipse((x-2,y-2,x+2,y+2),fill=(250,196,64))
    d.text((x0+15,y1-28),'Gelbe Punkte = exakte Hex-Eckpunkte',font=smaller,fill='#dadaca')
panel(460,332,'Neues Steinbild · alle sechs Richtungen',list(range(6)),1.62)
panel(1340,332,'Offene Kette · 0, 1, 2',[0,1,2],1.62)
panel(460,959,'Südhälfte und Seiten',[1,2,3,4],1.50)
panel(1340,959,'Zwei Kanten und offene Enden',[0,1],1.50)
preview.save(OUT/'geometry_preview.png',optimize=True)
(OUT/'geometry_report.json').write_text(json.dumps({'origin':'fresh generated atlas, NOT old stone v6', 'reference':'palisade v5 canonical projection', 'metadata':META,'joins':JOIN,'details':reports},indent=2))
print(OUT)
