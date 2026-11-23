#!/usr/bin/env python3
"""Six stone-wall raster images, built FROM the exact v5 palisade foot geometry.

Unlike stone v1-v5, this never warps or traces finished stone paintings.
Each stone course, crenel, and cutout is authored directly in a canonical
hex-edge coordinate system; after rasterisation each image is independent.
No HTML/CSS rotation; no JPEG/keyed-white masks. Transparent RGBA throughout.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math, random, json, hashlib

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/walls/stone/v6"
OUT.mkdir(parents=True,exist_ok=True)
HEX=256
R=HEX/math.sqrt(3)
PY=.85
S=6  # render at 6 px/world-unit, export at 3 px/world-unit
DIRS=((1,-1),(1,0),(0,1),(-1,1),(-1,0),(0,-1))
# Rectangles and original hex-corner foot anchors in world units. The 0-5
# order and projected edge deltas are exactly river.js + app.js PROJECT_Y=.85.
META=((156,167,14,89),(40,216,20,82),(156,167,142,89),
      (156,167,142,152),(40,216,20,208),(156,167,14,152))
PAL_META=((140,148,6,78.368581),(28,210,14,78.184291),
          (141,148,134,78.815709),(141,148,134,141.631419),
          (28,210,14,203.815709),(141,148,6,141.184291))
WALL_HEIGHT=62
MERLON_HEIGHT=11
WIDTH=22
SEED=97026
def pos(q,r):
    return (HEX*(q+r/2),1.5*R*r)
def verts(q,r):
    x,y=pos(q,r)
    return [(x+R*math.cos(-math.pi/2+i*math.pi/3),
             y+R*math.sin(-math.pi/2+i*math.pi/3)) for i in range(6)]
def edge(dir):
    v=verts(0,0);return v[dir],v[(dir+1)%6]
def local_ends(dir):
    a,b=edge(dir);w,h,ax,ay=META[dir]
    return (ax,ay),(ax+b[0]-a[0],ay+(b[1]-a[1])*PY)
def new_im(w,h):
    return Image.new("RGBA",(w*S,h*S),(0,0,0,0))
def rgb(r,g,b,a=255):
    return (int(r),int(g),int(b),a)
def poly(d,p,c):
    d.polygon([(round(x*S),round(y*S)) for x,y in p],fill=c)
def line(d,p,c,w=.7):
    d.line([(round(x*S),round(y*S)) for x,y in p],fill=c,width=max(1,round(w*S)),joint="curve")
def rect(d,box,c):
    d.rectangle(tuple(round(z*S) for z in box),fill=c)
def ellipse(d,b,c):
    d.ellipse(tuple(round(z*S) for z in b),fill=c)
def finish(im,dir_or_name):
    # The geometry is rendered on transparent pixels and premultiplied during
    # downsample: no white matte or JPG color fringe can be introduced.
    from PIL import ImageChops
    a=im.getchannel("A")
    prem=Image.new("RGBA",im.size)
    prem.paste(im,(0,0),a)
    # Premultiplied-color edge-safe resampling, with RGBA separation.
    chans=[prem.getchannel(c).resize((im.width//2,im.height//2),Image.Resampling.LANCZOS) for c in "RGB"]
    alpha=a.resize((im.width//2,im.height//2),Image.Resampling.LANCZOS)
    import numpy as np
    arr=np.stack([np.asarray(c,dtype=np.float32) for c in chans],axis=2)
    aa=np.asarray(alpha,dtype=np.float32)
    # Pasting with alpha leaves premultiplied RGB, restore for PNG.
    nz=aa>0
    arr[nz]*=255/aa[nz,None]
    arr=np.clip(arr,0,255).astype("uint8")
    out=Image.fromarray(np.dstack([arr,aa.astype("uint8")]),"RGBA")
    out.save(OUT/(dir_or_name+".png"),optimize=True)
    return out
def jitter(rng,base,delta=13):
    k=rng.randint(-delta,delta)
    return rgb(*(max(0,min(230,v+k)) for v in base))
def draw_brick(d,rng,shape,base):
    # Constant mortar joints, slightly varied ashlars, no post-generated
    # bending: every course is parametrised along the same segment.
    poly(d,shape,rgb(46,47,44))
    cx=sum(x for x,_ in shape)/4;cy=sum(y for _,y in shape)/4
    t=jitter(rng,base,9)
    poly(d,shape,t)
    line(d,[shape[0],shape[1]],rgb(177,173,151,225),.50)
    line(d,[shape[1],shape[2]],rgb(52,52,49,200),.65)
    line(d,[shape[2],shape[3]],rgb(49,50,48,185),.55)
    # Sparse mineral flecks are deliberately midtone; no 245-255 white.
    for i in range(5):
        x=cx+rng.uniform(-2.5,2.5)
        y=cy+rng.uniform(-2.3,2.3)
        tone=jitter(rng,(111,106,94),15)
        ellipse(d,(x-.26,y-.23,x+.26,y+.23),tone)
def draw_direction(dir):
    w,h,ax,ay=META[dir]
    im=new_im(w,h);d=ImageDraw.Draw(im,"RGBA")
    rng=random.Random(SEED+dir//3)  # paired courses share material variation
    a,b=local_ends(dir)
    vx=b[0]-a[0];vy=b[1]-a[1]
    length=math.hypot(vx,vy)
    nx,ny=-vy/length,vx/length
    if ny<0 or abs(ny)<1e-9 and nx<0:nx,ny=-nx,-ny
    near=(nx*WIDTH*.43,ny*WIDTH*.43*.62)
    back=(-near[0],-near[1])
    def P(t,z=0,offset=near):
        return (a[0]+vx*t+offset[0],a[1]+vy*t+offset[1]-z)
    def quad(t0,t1,z0,z1,off=near):
        return [P(t0,z0,off),P(t1,z0,off),
                P(t1,z1,off),P(t0,z1,off)]
    # Exact symmetry: the endcaps and blocks are inset identically in each
    # direction, while a separate shared-vertex pier seals every endpoint.
    inset=7.5 / length
    if dir in (1,4):
        # Edge-on 2.5D is intentionally separate: an exactly straight X
        # silhouette and a single full-depth wall ribbon. Existing v4/v5
        # edge-on art curved, and its crenels were inconsistent.
        top=min(a[1],b[1]);bottom=max(a[1],b[1])
        x=a[0];x0=x-WIDTH*.42;x1=x+WIDTH*.42
        rect(d,(x0,top-WALL_HEIGHT,x1,bottom),rgb(64,65,60))
        rect(d,(x0+.8,top-WALL_HEIGHT+1,x1-1,bottom-.9),rgb(100,99,89))
        # Straight vertically aligned course and stone texture; alternating
        # bond pattern without any drifting column coordinates.
        for k in range(16):
            y=top-WALL_HEIGHT+2+k*(bottom-top+WALL_HEIGHT-3)/16
            if y>bottom-2:break
            hh=(bottom-top+WALL_HEIGHT-3)/16
            for j,(u,v) in enumerate(((x0+1,x), (x+.45,x1-1))):
                if (k+j)%5==0:continue
                bx=[(u,y+.5),(v,y+.5),(v,y+hh-.6),(u,y+hh-.6)]
                draw_brick(d,rng,bx,(111,109,98))
        line(d,[(x0,top-WALL_HEIGHT),(x0,bottom)],rgb(43,43,41),1.1)
        line(d,[(x1,top-WALL_HEIGHT),(x1,bottom)],rgb(48,48,45),1.1)
        # Far-to-near upright merlons: small caps, never oblique roofs.
        for j in range(7):
            yy=top-WALL_HEIGHT+8+j*(bottom-top-14)/6
            rect(d,(x0-1,yy-MERLON_HEIGHT,x1+1,yy+1),rgb(60,61,55))
            rect(d,(x0,yy-MERLON_HEIGHT+1,x1-.8,yy),jitter(rng,(130,125,110),5))
            line(d,[(x0,yy-MERLON_HEIGHT+1),(x1-.8,yy-MERLON_HEIGHT+1)],
                 rgb(174,167,144),1.1)
        # Bottom of ribbon must follow the true near vertex, with zero
        # lateral bend. Posts are separate so the last pixels are masked.
    else:
        # A single planar face: source ground A and B define every course,
        # every upper edge and each upright merlon. Nothing may deform it.
        poly(d,[P(inset,0,back),P(1-inset,0,back),
                P(1-inset,WALL_HEIGHT,back),P(inset,WALL_HEIGHT,back)],rgb(63,64,59))
        poly(d,quad(inset,1-inset,0,WALL_HEIGHT),rgb(65,66,62))
        rows=5
        for row in range(rows):
            z0=row*WALL_HEIGHT/rows+.55
            z1=(row+1)*WALL_HEIGHT/rows-.72
            count=10
            for j in range(count):
                t0=inset+(1-2*inset)*(j+(0.5 if row%2 else 0))/count
                t1=inset+(1-2*inset)*(j+1+(0.5 if row%2 else 0))/count
                t0=max(inset,t0);t1=min(1-inset,t1)
                if t1-t0<.02:continue
                t0+=.003;t1-=.003
                brick=quad(t0,t1,z0,z1)
                draw_brick(d,rng,brick,(120,119,107))
        # Low parapet coping with narrow, subdued top, rather than a visible
        # birds-eye top face of the former hand-painted crenellations.
        poly(d,[P(inset,WALL_HEIGHT-2),P(1-inset,WALL_HEIGHT-2),
                P(1-inset,WALL_HEIGHT+1),P(inset,WALL_HEIGHT+1)],rgb(85,85,77))
        line(d,[P(inset,WALL_HEIGHT+1),P(1-inset,WALL_HEIGHT+1)],
             rgb(174,171,150),1.3)
        count=6
        for k in range(count):
            center=(k+.5)/count
            half=.31/count
            lo=max(inset,center-half);hi=min(1-inset,center+half)
            if hi<lo:continue
            poly(d,quad(lo,hi,WALL_HEIGHT-1,WALL_HEIGHT+MERLON_HEIGHT),
                 jitter(rng,(132,128,112),6))
            line(d,[P(lo,WALL_HEIGHT+MERLON_HEIGHT),P(hi,WALL_HEIGHT+MERLON_HEIGHT)],
                 rgb(180,173,151),1.1)
            line(d,[P(hi,WALL_HEIGHT-1),P(hi,WALL_HEIGHT+MERLON_HEIGHT)],
                 rgb(66,66,62),.85)
        # A controlled dirtline, integrated in the geometry. No semi-opaque
        # white matte, snowlike grass or halo on the bottom edge.
        line(d,[P(inset,.6),P(1-inset,.6)],rgb(64,64,56),.85)
    return finish(im,f"edge_dir{dir}")
def draw_join(name):
    w,h=(30,74) if name=="corner_post" else (26,74)
    im=new_im(w,h); d=ImageDraw.Draw(im,"RGBA")
    rng=random.Random(SEED+100+(name!="corner_post"))
    xmin=3;xmax=w-3
    ground=h-.4
    zbase=61
    poly(d,[(xmin,ground),(xmax,ground),(xmax,ground-zbase),
            (xmin,ground-zbase)],rgb(76,77,69))
    # Two lit faces and aligned courses form ONE straight shared-vertex pier.
    rect(d,(xmin+1,ground-zbase+1,xmax-1,ground),rgb(115,111,99))
    rect(d,(w*.53,ground-zbase+1,xmax-1,ground),rgb(91,91,83))
    for j in range(5):
        low=ground-(j+1)*zbase/5+.6
        high=ground-j*zbase/5-.7
        for bx,ex,t in ((xmin+1,w*.53,(133,128,112)),
                        (w*.53+.7,xmax-1,(105,104,94))):
            draw_brick(d,rng,[(bx,low),(ex,low),(ex,high),(bx,high)],t)
    # A small, solid square crenel, not an elevated block viewed from above.
    rect(d,(xmin-1,ground-zbase-12,xmax+1,ground-zbase+1),rgb(76,75,69))
    rect(d,(xmin,ground-zbase-11,xmax,ground-zbase),
         rgb(138,132,115))
    line(d,[(xmin,ground-zbase-11),(xmax,ground-zbase-11)],
         rgb(179,171,149),1.1)
    return finish(im,name)
sprites={i:draw_direction(i) for i in range(6)}
joins={name:draw_join(name) for name in ("corner_post","end_post")}
# Rendering proof: no invented coordinates; hex vertices and projections are
# shared with river.js, app.js; independent images are placed by walls.js math.
preview=Image.new("RGBA",(1700,1280),(35,49,39,255))
d=ImageDraw.Draw(preview)
try:
    font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",24)
    small=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",17)
except OSError:
    font=ImageFont.load_default();small=font
def panel(cx,cy,label,segments,zoom=1.62):
    x0,y0=cx-391,cy-263;x1,y1=cx+391,cy+265
    d.rounded_rectangle((x0,y0,x1,y1),radius=16,fill=(66,84,62),
                        outline=(142,163,131),width=3)
    project=lambda x,y:(cx+x*zoom,cy+y*PY*zoom)
    # All seven ground polygons are real axial coordinates, not artist paths.
    for q,r in [(0,0)]+list(DIRS):
        v=[project(*p) for p in verts(q,r)]
        d.line(v+[v[0]],fill=(98,124,88),width=2)
    elements=[];nodes={}
    for di in segments:
        a,b=edge(di)
        for p in [a,b]:
            key=(round(p[0],5),round(p[1],5))
            nodes[key]=(p,nodes.get(key,(p,0))[1]+1)
        elements.append(((a[1]+b[1])/2,"edge",di,a))
    for p,deg in nodes.values():elements.append((p[1],"join",deg,p))
    elements.sort(key=lambda v:v[0])
    overlay=Image.new("RGBA",preview.size,(0,0,0,0))
    for sort,typ,key,p in elements:
        px,py=project(*p)
        if typ=="edge":
            im=sprites[key]
            w,h,ax,ay=META[key]
            dest=(round(px-ax*zoom),round(py-ay*zoom))
            size=(round(w*zoom),round(h*zoom))
        else:
            name="corner_post" if key>1 else "end_post"
            im=joins[name]
            width=30 if key>1 else 26
            dest=(round(px-width*zoom/2),round(py-74*zoom))
            size=(round(width*zoom),round(74*zoom))
        scaled=im.resize(size,Image.Resampling.LANCZOS)
        overlay.alpha_composite(scaled,dest)
    preview.alpha_composite(overlay)
    for p,deg in nodes.values():
        xx,yy=project(*p)
        d.ellipse((xx-2,yy-2,xx+2,yy+2),fill=(229,179,59))
    d.text((x0+18,y0+18),label,font=font,fill=(242,241,222))
    d.text((x0+18,y1-32),"Gelb = kanonischer Hexvertex",font=small,fill=(231,222,184))
panel(429,336,"A · Geschlossen / sechs Richtungen",list(range(6)))
panel(1271,336,"B · Offene Kette / echte Ecken",[0,1,2])
panel(429,962,"C · Geschlossen / andere Zoomstufe",list(range(6)),1.50)
panel(1271,962,"D · Suedhaelfte und Ost/West",[1,2,3,4],1.50)
preview.convert("RGB").save(OUT/"real-hex-v6-preview.png",optimize=True)
report={"source":"river.js canonical 256-unit axial hex, app.js PY=.85",
        "basis":"palisade v5 coordinate/anchor convention",
        "segments":6,"joins":2,"material":"new procedural ashlar; no previous stone geometry",
        "metadata":[list(v) for v in META],
        "files":{p.name:{"size":Image.open(p).size,
            "sha256":hashlib.sha256(p.read_bytes()).hexdigest()} for p in OUT.glob("*.png")},
        "topology":{str(i):[list(p) for p in local_ends(i)] for i in range(6)}}
(OUT/"geometry_report.json").write_text(json.dumps(report,indent=2)+"\n")
print("NEW STONE V6. Six sprites, two joints, four real-coordinate render scenes.")
print("Preview",OUT/"real-hex-v6-preview.png")
