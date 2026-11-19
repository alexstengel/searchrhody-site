import re, cairosvg
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
FR=instantiateVariableFont(TTFont('fonts/Fraunces.ttf'),{'opsz':72,'wght':800,'SOFT':0,'WONK':0})
IN=instantiateVariableFont(TTFont('fonts/Inter.ttf'),{'opsz':14,'wght':450})
def shape(font,text,size,track=0):
    """return list of (glyphname,xadvance-unit) simple shaping with kerning via GPOS skipped"""
    cmap=font.getBestCmap(); gs=font.getGlyphSet(); upm=font['head'].unitsPerEm
    s=size/upm; x=0; parts=[]
    for ch in text:
        g=cmap[ord(ch)]; parts.append((g,x)); x+=gs[g].width*s+track
    return parts,x-track,s,gs
def text_path(font,text,size,ox,oy,track=0):
    parts,w,s,gs=shape(font,text,size,track)
    pen=SVGPathPen(gs)
    for g,x in parts:
        tp=TransformPen(pen,(s,0,0,-s,ox+x,oy)); gs[g].draw(tp)
    return pen.getCommands(),w
def bounds(font,text,size):
    parts,w,s,gs=shape(font,text,size); bp=BoundsPen(gs)
    for g,x in parts: gs[g].draw(TransformPen(bp,(s,0,0,s,x,0)))
    return bp.bounds
pin=open('searchrhody-pin.svg').read()
pin_inner=re.search(r'<defs>.*</svg>',pin,re.S).group(0).replace('</svg>','')
# pin artwork in viewBox 60 50 960 1230 -> width 960 height 1230
def pin_group(x,y,h,ids=''):
    sc=h/1230
    inner=pin_inner.replace('sr-wave','sr-wave'+ids).replace('sr-c','sr-c'+ids)
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({sc:.5f}) translate(-60 -50)">{inner}</g>'
def stacked(bg='#F7F5EF',search='#142C3E',rhody='#F46934',tag='#142C3E'):
    W=1400
    pinh=420; pinw=pinh*960/1230
    target=pinw*3.45
    _,w0=text_path(FR,'SearchRhody',100,0,0); word_size=100*target/w0
    _,wa=text_path(FR,'Search',word_size,0,0)
    wx=(W-target)/2
    bb=bounds(FR,'SearchRhody',word_size)  # (xmin,ymin,xmax,ymax) y-up
    gap=pinh*0.08
    wy=30+pinh+gap+bb[3]
    sa,_=text_path(FR,'Search',word_size,wx,wy); sb,_=text_path(FR,'Rhody',word_size,wx+wa,wy)
    _,t0=text_path(IN,'Local visibility, made simple.',100,0,0,0)
    tsz=100*target*0.79/t0
    ty=wy-bb[1]+tsz*1.25
    tt,tw=text_path(IN,'Local visibility, made simple.',tsz,0,0,0)
    tt,_=text_path(IN,'Local visibility, made simple.',tsz,(W-tw)/2,ty,0)
    H=ty+tsz*0.6+40
    body=[f'<rect width="{W}" height="{H:.0f}" fill="{bg}"/>' if bg else '',
          pin_group((W-pinw)/2,30,pinh),
          f'<path fill="{search}" d="{sa}"/>',f'<path fill="{rhody}" d="{sb}"/>',f'<path fill="{tag}" d="{tt}"/>']
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H:.0f}" role="img" aria-labelledby="sr-t"><title id="sr-t">SearchRhody. Local visibility, made simple.</title>'+''.join(body)+'</svg>'
open('searchrhody-logo-stacked.svg','w').write(stacked())
cairosvg.svg2png(url='searchrhody-logo-stacked.svg',write_to='searchrhody-logo-stacked.png',output_width=1400)
