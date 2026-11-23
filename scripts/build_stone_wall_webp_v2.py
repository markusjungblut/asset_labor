#!/usr/bin/env python3
"""Offline authoring tool for the eight *raster* stone wall sprites.

Usage: python3 scripts/build_stone_wall_webp_v2.py IMAGEGEN_MASTER.png
The six SVG-independent direction images use the same immutable hex-edge
bounds/anchors as palisade v5. Runtime loads only the WebP outputs.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
import random
import sys

SOURCE = Path(sys.argv[1])
OUT = Path("assets/walls/stone")
OUT.mkdir(parents=True, exist_ok=True)
im = Image.open(SOURCE).convert("RGBA")
pixels = np.asarray(im).astype(np.float32).copy()
distance = np.sqrt(np.sum((255-pixels[:,:,:3])**2, axis=2))
pixels[:,:,3] *= np.clip((distance-24)/40,0,1)
clean = Image.fromarray(pixels.astype("uint8"),"RGBA")

REGIONS = {
 "dir0":(887,30,1275,405),
 "dir2":(18,3,422,407),
 "dir3":(452,457,863,808),
 "dir5":(1320,25,1715,398),
 "corner":(923,477,1233,820),
 "end":(1401,480,1620,805),
}
# Source A/B are the exact ground feet in the painted sheet.
# Target A/B are the canonical stone edge footpoints from walls.js.
SLOPES = {
 0:("dir0",(906,214),(1260,389),(14,89),(142,152),.38),
 2:("dir2",(31,385),(395,205),(14,152),(142,89),.36),
 3:("dir3",(470,640),(839,793),(14,89),(142,152),.38),
 5:("dir5",(1337,384),(1702,214),(14,152),(142,89),.37),
}
for direction,(key,A,B,first,last,vertical) in SLOPES.items():
    region=REGIONS[key]
    sx=(last[0]-first[0])/(B[0]-A[0])
    skew=((last[1]-first[1])-vertical*(B[1]-A[1]))/(B[0]-A[0])
    inverse=(1/sx,0,A[0]-first[0]/sx-region[0],
             -skew/(vertical*sx),1/vertical,
             A[1]-region[1]-first[1]/vertical+skew*first[0]/(vertical*sx))
    out=clean.crop(region).transform((156,167),Image.Transform.AFFINE,inverse,
                                     resample=Image.Resampling.BICUBIC)
    out.save(OUT/f"edge_dir{direction}.webp","WEBP",quality=58,method=6)

SCALE=4
def polygon(draw,coords,color,outline=None,width=1):
    xy=[(round(x*SCALE),round(y*SCALE)) for x,y in coords]
    draw.polygon(xy,fill=color)
    if outline:
        draw.line(xy+[xy[0]],fill=outline,width=max(1,round(width*SCALE)))
def stroke(draw,coords,color,width=.8):
    draw.line([(round(x*SCALE),round(y*SCALE)) for x,y in coords],
              fill=color,width=max(1,round(width*SCALE)))
def vertical_edge(direction):
    # Two independently painted edge-on directions: narrow perspective
    # walkway and raised, rectangular merlons over material-textured masonry.
    rng=random.Random(8100+direction)
    out=Image.new("RGBA",(40*SCALE,216*SCALE))
    draw=ImageDraw.Draw(out)
    polygon(draw,[(8,82),(20,82),(20,208),(8,208)],(74,73,67,255),(61,61,55,255))
    polygon(draw,[(20,82),(32,82),(32,208),(20,208)],(90,88,79,255),(60,59,56,255))
    for course in range(4):
        y0=70-course*14
        for k in range(7):
            y=max(82,y0+k*20)
            z=min(208,y0+k*20+19)
            if y>=z: continue
            tone=rng.randrange(-22,23)
            polygon(draw,[(8.4,y+.8),(19,y+.8),(19,z-.7),(8.4,z-.7)],
                    (126+tone,118+tone,104+tone,255),(68,65,60,255),.5)
            polygon(draw,[(20.8,y+.8),(31.5,y+.8),(31.5,z-.7),(20.8,z-.7)],
                    (91+tone,88+tone,79+tone,255),(59,59,54,255),.5)
            stroke(draw,[(9.2,y+2),(15.7,y+2.3)],(198,186,161,150),.45)
    polygon(draw,[(8,20),(32,20),(32,146),(8,146)],
            (162,149,127,255),(80,75,67,255),.9)
    for k in range(8):
        y=20+k*126/8
        tone=rng.randrange(-13,14)
        polygon(draw,[(8.8,y+.4),(31.2,y+.4),(31.2,y+14.9),(8.8,y+14.9)],
                (170+tone,157+tone,133+tone,255),(101,93,79,255),.65)
        stroke(draw,[(11,y+1.2),(27,y+1.7)],(214,197,168,150),.55)
        if k%2==0:stroke(draw,[(20,y+2.4),(20,y+12)],(105,97,84,155),.6)
    for k in range(7):
        y=20+k*18
        for x in [4,25]:
            tone=rng.randrange(-11,12)
            polygon(draw,[(x+1,y+2),(x+10,y+2),(x+10,y+14.2),(x+1,y+14.2)],
                    (165+tone,153+tone,132+tone,255),(74,69,63,255),.95)
            polygon(draw,[(x+10,y+2),(x+12,y+5),(x+12,y+15.6),(x+10,y+14.2)],
                    (104+tone,97+tone,86+tone,255),(69,66,60,255),.65)
            polygon(draw,[(x+1,y+2),(x+3,y-1.5),(x+12,y-1.5),(x+10,y+2)],
                    (205+tone,190+tone,165+tone,255),(114,103,90,255),.6)
            stroke(draw,[(x+3,y+5),(x+8,y+5)],(227,210,179,170),.65)
    stroke(draw,[(8,207),(32,207)],(51,55,49,255),2)
    out=out.resize((40,216),Image.Resampling.LANCZOS)
    out.save(OUT/f"edge_dir{direction}.webp","WEBP",quality=58,method=6)
for direction in (1,4):
    vertical_edge(direction)

for key,stem,width,height in (("corner","corner_post",40,80),
                              ("end","end_post",34,80)):
    crop=clean.crop(REGIONS[key])
    crop=crop.crop(crop.getchannel("A").getbbox())
    crop.thumbnail((width-2,height),Image.Resampling.LANCZOS)
    out=Image.new("RGBA",(width,height))
    out.alpha_composite(crop,((width-crop.width)//2,height-crop.height))
    out.save(OUT/f"{stem}.webp","WEBP",quality=58,method=6)
print("Stone walls v2:",*[f.name for f in sorted(OUT.glob("*.webp"))])
