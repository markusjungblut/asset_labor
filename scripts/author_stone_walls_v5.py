#!/usr/bin/env python3
"""Author six re-anchored independent stone sprites and actual-Hex preview.

The source wall paintings are retained as texture/relief material, but the
geometry is reconstructed from river.js: HEX=256, R=HEX/sqrt(3), axial
vertices and the app's PROJECT_Y=.85. Output graphics are separate RGBA
PNGs (not a rotated/scaled runtime mesh). Palisade v5 is never modified.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math, statistics, json, shutil

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/walls/stone"
OUT=SOURCE/"v5"
OUT.mkdir(parents=True,exist_ok=True)
PREVIEW=OUT/"actual-hex-preview.png"
DIRS=((1,-1),(1,0),(0,1),(-1,1),(-1,0),(0,-1))
HEX=256; R=HEX/math.sqrt(3); PY=.85; SCALE=3
META=((156,167,14,89),(40,216,20,82),(156,167,142,89),
      (156,167,142,152),(40,216,20,208),(156,167,14,152))
def vertices(q,r):
    px=HEX*(q+r/2);py=1.5*R*r
    return [(px+R*math.cos(-math.pi/2+i*math.pi/3),
             py+R*math.sin(-math.pi/2+i*math.pi/3)) for i in range(6)]
def ends(dir):
    a,b=vertices(0,0)[dir],vertices(0,0)[(dir+1)%6]
    return a,b
def expected_anchors(dir):
    a,b=ends(dir); _,_,ax,ay=META[dir]
    return (ax*SCALE,ay*SCALE),(ax*SCALE+(b[0]-a[0])*SCALE,
         ay*SCALE+(b[1]-a[1])*PY*SCALE)
def foot_samples(im,x0,x1):
    pix=im.load();W,H=im.size; result=[]
    for x in range(max(1,x0),min(W-1,x1),2):
        for y in range(H-1,0,-1):
            red,green,blue,alpha=pix[x,y]
            # Solid ashlar, not green foreground vegetation or light fringes.
            if (alpha>215 and red>62 and red+3>=green and green+8>=blue
                and red<218 and green<211):
                result.append((x,y));break
    return result
def estimate_baseline(im,dir):
    (x0,y0),(x1,y1)=expected_anchors(dir)
    slope=(y1-y0)/(x1-x0)
    def offset_in_window(left,right):
        found=foot_samples(im,left,right)
        if len(found)<6: raise RuntimeError(f"dir{dir} insufficient ground pixels at {left}")
        # Ground/front-face bias: footprint() creates a 24-world-unit
        # thick wall, with the near face ~20px below centre at 3x.
        # Keep that volume, do not force the visible lowest pixel onto centre.
        residual=[(y0+slope*(x-x0)+20)-y for x,y in found]
        return statistics.median(residual),statistics.median([x for x,_ in found]),len(found)
    left=offset_in_window(55,107)
    right=offset_in_window(360,413)
    return left,right
def reanchor(im,dir):
    if dir in (1,4):
        return im.copy(),{"dir":dir,"correction":"depth-aligned upright original"}
    left,right=estimate_baseline(im,dir)
    dx=right[1]-left[1]
    dy=right[0]-left[0]
    if not 100<dx<400 or abs(dy)>85:
        raise RuntimeError(f"dir{dir}: unsafe re-projection dx={dx},dy={dy}")
    slope=dy/dx; intercept=left[0]-slope*left[1]
    # Pillow expects output->input. Move each X column vertically only:
    # posts and stone joints remain upright, the wall slope is now correct.
    out=im.transform(im.size,Image.Transform.AFFINE,
        (1,0,0,-slope,1,-intercept),resample=Image.Resampling.BICUBIC)
    after_l,after_r=estimate_baseline(out,dir)
    if max(abs(after_l[0]),abs(after_r[0]))>9:
        raise RuntimeError(f"dir{dir}: residual foot error after reprojection: "
                           f"{after_l[0]:.2f},{after_r[0]:.2f} px")
    return out,{"dir":dir,
      "source_foot_offsets_px":[round(left[0],2),round(right[0],2)],
      "reproject_slope_px_per_px":round(slope,5),
      "output_foot_offsets_px":[round(after_l[0],2),round(after_r[0],2)],
      "projected_true_feet_px":[[round(v,3) for v in p] for p in expected_anchors(dir)]}

originals={};corrected={};report=[]
for dir,(w,h,ax,ay) in enumerate(META):
    im=Image.open(SOURCE/f"edge_dir{dir}.png").convert("RGBA")
    if im.size!=(w*3,h*3):raise RuntimeError(f"dir{dir}: unexpected source size {im.size}")
    originals[dir]=im
    new,info=reanchor(im,dir)
    corrected[dir]=new
    new.save(OUT/f"edge_dir{dir}.png",optimize=True)
    report.append(info)
for stem in ("corner_post","end_post"):
    shutil.copy2(SOURCE/(stem+".png"),OUT/(stem+".png"))

# Exact app preview: geometry is the canonical vertex path from river.js;
# Y screen projection = worldY*.85, image placement = foot - anchor.
# Ground vertices are also drawn to expose attachment errors.
W,H=1640,930; canvas=Image.new("RGB",(W,H),(34,46,39))
draw=ImageDraw.Draw(canvas)
try:
    font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",22)
    small=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",15)
except OSError:
    font=ImageFont.load_default();small=font
def paint_panel(images,cx,cy,label):
    zoom=2.08
    projection=lambda x,y:(cx+x*zoom,cy+y*PY*zoom)
    draw.rounded_rectangle((cx-385,65,cx+385,875),radius=22,fill=(57,77,57),
                           outline=(119,142,106),width=2)
    for q,r in [(0,0)]+list(DIRS):
        pts=[projection(x,y) for x,y in vertices(q,r)]
        draw.line(pts+[pts[0]],fill=(103,127,92),width=2)
    ring=[((0,0),(dq,dr),i) for i,(dq,dr) in enumerate(DIRS)]
    nodes={}
    sprites=[]
    for _,_,dir in ring:
        a,b=ends(dir)
        midpoint=((a[0]+b[0])/2,(a[1]+b[1])/2)
        sprites.append((midpoint[1],midpoint[0],"edge",dir,a))
        for node in [a,b]:
            key=(round(node[0],4),round(node[1],4))
            nodes[key]=(node,nodes.get(key,(None,0))[1]+1)
    for node,degree in nodes.values():
        sprites.append((node[1],node[0],"join",degree,node))
    sprites.sort(key=lambda obj:(obj[0],obj[1]))
    foreground=Image.new("RGBA",(W,H))
    for y,x,typ,index,world in sprites:
        xx,yy=projection(*world)
        if typ=="edge":
            _,_,ax,ay=META[index]; img=images[index]
            width=round(img.width*zoom/3);height=round(img.height*zoom/3)
            scaled=img.resize((width,height),Image.Resampling.LANCZOS)
            at=(round(xx-ax*zoom),round(yy-ay*zoom))
        else:
            stem="corner_post" if index>1 else "end_post"
            img=Image.open(OUT/(stem+".png")).convert("RGBA")
            worldw=34 if index>1 else 30
            worldh=74
            scaled=img.resize((round(worldw*zoom),round(worldh*zoom)),Image.Resampling.LANCZOS)
            at=(round(xx-scaled.width/2),round(yy-scaled.height))
        foreground.alpha_composite(scaled,at)
    canvas.paste(foreground,(0,0),foreground)
    for node,degree in nodes.values():
        x,y=projection(*node)
        draw.ellipse((x-3,y-3,x+3,y+3),fill=(235,205,90))
    draw.text((cx-335,93),label,fill=(245,245,228),font=font)
    draw.text((cx-335,843),"Goldpunkte = exakte Hex-Eckkoordinaten",fill=(221,227,210),font=small)

paint_panel(originals,415,460,"V4 • Originale • echte Kartenkoordinaten")
paint_panel(corrected,1225,460,"V5 • rekonstruierte Sockellinien")
canvas.save(PREVIEW,optimize=True)
(OUT/"projection_report.json").write_text(json.dumps(report,indent=2)+"\n")
print("STONE V5 PROTOTYPES AND PREVIEW FROM REAL RIVER.JS COORDINATES")
for item in report:print(item)
