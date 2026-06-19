#!/usr/bin/env python3
"""Branded dark/warm placeholders for subpages. Replace with real photos later."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
HERE = os.path.dirname(__file__)

def font(sz):
    for p in ("/System/Library/Fonts/Helvetica.ttc",
              "/System/Library/Fonts/Supplemental/Arial.ttf"):
        try: return ImageFont.truetype(p, sz)
        except: pass
    return ImageFont.load_default()

def make(name, label, W=1600, H=1067, glow=(0.42,0.36), warm=(198,169,114)):
    base = Image.new("RGB",(W,H))
    px = base.load()
    for y in range(H):
        t=y/H; r=int(12+24*t); g=int(11+18*t); b=int(13+13*t)
        for x in range(W): px[x,y]=(r,g,b)
    gl = Image.new("RGB",(W,H),(0,0,0)); gd=ImageDraw.Draw(gl)
    cx,cy = W*glow[0], H*glow[1]
    for i in range(70,0,-1):
        rr=W*0.5*i/70; a=(1-i/70)**1.6
        gd.ellipse([cx-rr,cy-rr*0.85,cx+rr,cy+rr*0.85], fill=tuple(int(c*a*0.85) for c in warm))
    gl=gl.filter(ImageFilter.GaussianBlur(80))
    b=base.split(); g=gl.split()
    out=Image.merge("RGB",[Image.blend(b[i],g[i],0.55) for i in range(3)])
    noise=Image.effect_noise((W,H),16).convert("L")
    out=Image.merge("RGB",[Image.blend(out.split()[i],noise,0.035) for i in range(3)])
    vig=Image.new("L",(W,H),0); vd=ImageDraw.Draw(vig)
    vd.ellipse([-W*0.25,-H*0.25,W*1.25,H*1.25],fill=255); vig=vig.filter(ImageFilter.GaussianBlur(220))
    out=Image.composite(out,Image.new("RGB",(W,H),(4,3,3)),vig)
    d=ImageDraw.Draw(out)
    d.text((70,H-118),"PLATZHALTER",font=font(22),fill=(150,132,104))
    d.text((70,H-84),label,font=font(34),fill=(230,224,212))
    path=os.path.join(HERE,name); out.save(path,quality=86,optimize=True); print("wrote",name,out.size)

# Service / topic images
make("ph-heizung.jpg","Heizungsbau & Wärmepumpe")
make("ph-heizung-modern.jpg","Heizungsmodernisierung")
make("ph-solar.jpg","Solartechnik & Photovoltaik", warm=(206,180,120))
make("ph-wartung.jpg","Wartung & Service")
make("ph-reparatur.jpg","Reparatur & Notdienst")
# About
make("ph-team.jpg","Unser Team", W=1600, H=1067, glow=(0.5,0.45))
make("ph-werkstatt.jpg","Werkstatt & Material", glow=(0.4,0.4))
make("ph-inhaberin.jpg","Betül Atasoy · Inhaberin", W=1200, H=1500, glow=(0.5,0.4))
# Projects (gallery)
for i,t in enumerate(["Bad · Heilbronn","Heizung · Neubau","Solaranlage","Komplettbad","Sanitär · Altbau","Wärmepumpe"],1):
    make(f"ph-projekt-{i}.jpg", t, W=1200, H=900, glow=(0.45+0.04*(i%3), 0.4))
# Contact map
make("ph-karte.jpg","Gartenstraße 106 · Heilbronn", W=1600, H=900, glow=(0.5,0.5))
