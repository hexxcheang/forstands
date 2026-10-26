import sys
OUT, TPL = sys.argv[1], sys.argv[2]

def t(x, y, s, cls, anchor="middle", extra=""):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{extra}>{s}</text>'

def hdim(x1, x2, y, label, ty=None):
    ty = y - 30 if ty is None else ty
    return (f'<g class="dim"><line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}"/>'
            f'<line x1="{x1}" y1="{y-40}" x2="{x1}" y2="{y+40}"/><line x1="{x2}" y1="{y-40}" x2="{x2}" y2="{y+40}"/></g>'
            + t((x1+x2)/2, ty, label, "t-dim"))

def vdim(x, y1, y2, label, side="left"):
    tx = x - 40 if side == "left" else x + 50
    anchor = "end" if side == "left" else "start"
    return (f'<g class="dim"><line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}"/>'
            f'<line x1="{x-40}" y1="{y1}" x2="{x+40}" y2="{y1}"/><line x1="{x-40}" y1="{y2}" x2="{x+40}" y2="{y2}"/></g>'
            + t(tx, (y1+y2)/2 + 20, label, "t-dim", anchor))

W, D = 4877, 2134
LB = 120          # lightbox depth
CW = 150          # carpentry wall depth
PW = (W - LB) / 4 # carpentry panel width, 1189.25

# ---------------- Plan ----------------
p = []
p.append(hdim(0, W, -420, "16 ft · 4,877 mm"))
p.append(t(W/2, -110, "BACK · NEIGHBOUR", "t-zone"))
p.append(t(1900, 2330, "FRONT · OPEN TO THE AISLE", "t-zone"))
p.append(t(5150, D/2, "SIDE · OPEN", "t-zone", extra=f' transform="rotate(90 5150 {D/2})"'))
p.append(vdim(-200, 0, D, "7 ft", "left"))
p.append(f'<rect x="0" y="0" width="{W}" height="{D}" class="booth"/>')
for cx in (850, 2950):
    p.append(f'<circle cx="{cx}" cy="1350" r="700" class="rug"/>')
# carpentry wall
p.append(f'<rect x="{LB}" y="0" width="{W-LB}" height="{CW}" class="cw"/>')
for i in range(1, 4):
    x = LB + i*PW
    p.append(f'<line x1="{x:.0f}" y1="0" x2="{x:.0f}" y2="{CW}" class="joint"/>')
names = ["Lusano Prestige", "Lusano Noble + Halo", "Nova+ Pro + S8", "Folio + Ark"]
subs = ["3 switches", "2 switches · Halo", "3 switches · S8 panel", "4 switches"]
for i in range(4):
    x = LB + i*PW
    p.append(f'<rect x="{x+15:.0f}" y="{CW}" width="{PW-30:.0f}" height="30" class="fa"/>')
    p.append(t(f"{x+PW/2:.0f}", 100, f"C{i+1}", "t-in2"))
    p.append(t(f"{x+PW/2:.0f}", 580, names[i], "t-lab"))
    p.append(t(f"{x+PW/2:.0f}", 670, subs[i], "t-sub"))
# fabric lightbox
p.append(f'<rect x="0" y="0" width="{LB}" height="{D}" class="lbx"/>')
p.append(f'<rect x="{LB}" y="{CW+30}" width="30" height="{D-CW-60}" class="lface"/>')
p.append(t(78, D/2, "FABRIC LIGHTBOX", "t-bay", extra=f' transform="rotate(-90 78 {D/2})"'))
p.append('<circle cx="420" cy="1860" r="300" class="tree"/><circle cx="420" cy="1860" r="200" class="pot"/>')
p.append(t(420, 2250, "Olive tree", "t-sub"))
# tables and chairs
for cx, chairs in ((850, (200, 1100)), (2950, (2300, 3200))):
    for c in chairs:
        p.append(f'<rect x="{c}" y="1150" width="400" height="400" rx="70" class="chair"/>')
    p.append(f'<circle cx="{cx}" cy="1350" r="300" class="table"/>')
p.append(t(850, 1365, "T1", "t-on"))
p.append(t(2950, 1365, "T2", "t-on"))
p.append(hdim(1500, 2300, 1760, "800 path", ty=1850))
# one two-sided stand at 45 degrees across the front right corner
p.append('<g transform="translate(4277 1534) rotate(-45)">'
         '<rect x="-500" y="-300" width="1000" height="600" class="plate"/>'
         '<rect x="-500" y="-100" width="1000" height="200" class="body"/>'
         '<rect x="-485" y="100" width="970" height="30" class="fa"/>'
         '<rect x="-485" y="-130" width="970" height="30" class="fb"/>'
         + t(0, 26, "STAND", "t-in") + '</g>')
p.append(t(4560, 2250, "Aisle face: control panels", "t-sub"))
p.append(t(3900, 930, "Inside face: smart locks", "t-sub"))
p.append(t(3900, 1010, "faces the tables", "t-sub"))
plan = f'<svg viewBox="-460 -520 5860 2940" class="dwg" role="img" aria-label="Top view: a fabric lightbox on the left 7 ft side, a one-sided carpentry product wall along the 16 ft back, two tables with chairs in the centre, and one two-sided stand set at 45 degrees across the front right corner">{"".join(p)}</svg>'

# ---------------- Elevation pieces (1.8 m, same layout as the 3D artwork) ----------------
H = 1800
def sv(h): return H - h
def sq(cx, cyh, w, h, cls="sw"):
    return f'<rect x="{cx-w/2:.0f}" y="{sv(cyh)-h/2:.0f}" width="{w}" height="{h}" class="{cls}"/>'
def top(cx, toph, w, h, cls):
    return f'<rect x="{cx-w/2:.0f}" y="{sv(toph):.0f}" width="{w}" height="{h}" class="{cls}"/>'

ROW = 1100
def products(c, kind):
    g = []
    if kind == "prestige":
        for k in range(3): g.append(sq(c-200+k*200, ROW, 86, 86))
    elif kind == "noble":
        g.append(sq(c-210, ROW, 90, 90)); g.append(sq(c+210, ROW, 90, 90))
        g.append(f'<circle cx="{c:.0f}" cy="{sv(ROW)}" r="62" class="halo"/>')
    elif kind == "nova":
        for k in range(3): g.append(sq(c-300+k*140, ROW, 86, 86))
        g.append(sq(c+200, ROW, 234, 128, "pnl"))
    elif kind == "folio":
        for k in range(4): g.append(sq(c-240+k*160, ROW, 86, 86))
    elif kind == "panels":
        g.append(sq(c-140, ROW, 300, 190, "pnl")); g.append(sq(c+190, ROW, 230, 140, "pnl"))
    elif kind == "secure":
        for k in range(3): g.append(top(c-270+k*120, 1250, 60, 300, "lk"))
        g.append(sq(c+220, ROW, 130, 130, "pnl"))
    return "".join(g)

def face(x0, w, name, sub, kind, canopy_cls="body", cupboard=False):
    c = x0 + w / 2
    g = [f'<rect x="{x0:.0f}" y="0" width="{w:.0f}" height="{H-50}" class="f-bg"/>',
         f'<rect x="{x0+30:.0f}" y="{H-50}" width="{w-60:.0f}" height="50" class="kick"/>',
         f'<rect x="{x0+30:.0f}" y="{H-18}" width="{w-60:.0f}" height="6" class="dl"/>']
    g.append(t(f"{c:.0f}", sv(1560), name, "e-name"))
    g.append(f'<rect x="{c-400:.0f}" y="{sv(1350)}" width="800" height="500" class="niche"/>')
    g.append(f'<polygon points="{c-400:.0f},{sv(1344)} {c+400:.0f},{sv(1344)} {c+400:.0f},{sv(1150)} {c-400:.0f},{sv(1150)}" class="beam"/>')
    g.append(f'<rect x="{c-400:.0f}" y="{sv(1350)}" width="800" height="6" class="lip"/>')
    g.append(products(c, kind))
    if cupboard:
        g.append(f'<rect x="{c-520:.0f}" y="{sv(640)}" width="1040" height="560" class="door"/><line x1="{c:.0f}" y1="{sv(640)}" x2="{c:.0f}" y2="{sv(80)}" class="doorl"/>')
        g.append(t(f"{c:.0f}", sv(380), "staff cupboard", "e-sub"))
    g.append(f'<line x1="{x0:.0f}" y1="0" x2="{x0:.0f}" y2="{H-50}" class="gap"/>')
    return "".join(g)

def lightbox(x0, w):
    return (f'<image href="assets/lightbox-photo.jpg" x="{x0:.0f}" y="0" width="{w:.0f}" height="{H}" preserveAspectRatio="xMidYMid slice" opacity=".9"/>'
            f'<rect x="{x0:.0f}" y="0" width="{w:.0f}" height="{H}" class="lbx-frame"/>'
            + t(f"{x0+w/2:.0f}", 1650, "MAXSEN", "lb-mark2"))

DEFS = ('<defs><pattern id="lat" width="120" height="200" patternUnits="userSpaceOnUse"><path d="M0 100 L60 0 L120 100 L60 200 Z" class="latp"/></pattern>'
        '<radialGradient id="glow" cx="50%" cy="45%" r="70%"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></radialGradient></defs>')

def elev(parts, width, label):
    g = [DEFS] + parts
    g.append(f'<rect x="-100" y="{H}" width="{width+200}" height="16" class="floor"/>')
    g.append(f'<line x1="-100" y1="0" x2="{width+100}" y2="0" class="limit"/>')
    g.append(t(width+90, -22, "1.8 m limit", "t-lim", "end"))
    g.append(vdim(-60, 0, H, "1.8 m", "left"))
    return f'<svg viewBox="-460 -110 {width+560} {H+190}" class="dwg elev" role="img" aria-label="{label}">{"".join(g)}</svg>'

kinds = ["prestige", "noble", "nova", "folio"]
heads = [("Lusano Prestige", ""), ("Lusano Noble", ""), ("Nova+ Pro", ""), ("Folio + Ark", "")]
parts = [f'<rect x="0" y="0" width="{LB}" height="{H}" class="lbx-e"/>', f'<rect x="{LB}" y="0" width="{W-LB}" height="{H-50}" class="gapbg"/>']
for i in range(4):
    parts.append(face(LB + i*PW + 5, PW - 10, heads[i][0], heads[i][1], kinds[i], "fas", cupboard=(i == 3)))
elevBack = elev(parts, W, "Carpentry wall as seen from inside the booth, with the lightbox edge on the left")
parts = [lightbox(0, D - CW), f'<rect x="{D-CW}" y="0" width="{CW}" height="{H}" class="cw"/>']
elevLB = elev(parts, D, "Fabric lightbox as seen from inside the booth")
elevLout = elev([face(0, 1000, "Control panels", "", "panels")], 1000, "Corner stand, aisle face: control panels")
elevLin = elev([face(0, 1000, "Smart locks", "", "secure")], 1000, "Corner stand, inside face: smart locks and the S1 panel")

# ---------------- Stand section + face zones (1.8 m) ----------------
F = 2060
def sh(h): return F - h
m = []
m.append(f'<rect x="300" y="{sh(8)-8}" width="600" height="16" class="plate-s"/>')
m.append(f'<rect x="540" y="{sh(50)}" width="120" height="42" class="body"/>')
m.append(f'<rect x="500" y="{sh(1800)}" width="200" height="{1750}" class="body"/>')
m.append(f'<rect x="500" y="{sh(1350)}" width="40" height="500" class="niche"/><rect x="660" y="{sh(1350)}" width="40" height="500" class="niche"/>')
m.append(f'<rect x="500" y="{sh(1350)}" width="40" height="8" class="dl"/><rect x="660" y="{sh(1350)}" width="40" height="8" class="dl"/>')
m.append(f'<polygon points="500,{sh(1340)} 430,{sh(1150)} 500,{sh(1150)}" class="beam"/><polygon points="700,{sh(1340)} 770,{sh(1150)} 700,{sh(1150)}" class="beam"/>')
m.append(f'<rect x="420" y="{sh(12)}" width="80" height="8" class="dl"/><rect x="700" y="{sh(12)}" width="80" height="8" class="dl"/>')
m.append(t(600, 70, "SECTION", "t-zone"))
m.append(hdim(500, 700, 190, "200 body", ty=160))
m.append(hdim(300, 900, F+90, "600 base", ty=F+170))
m.append(vdim(250, sh(1800), sh(0), "1,800", "left"))
x0 = 1400
m.append(t(x0+500, 70, "ONE FACE", "t-zone"))
zones = [(1400, 1800, "z-hdr", "1"), (850, 1350, "z-cas", "2"), (50, 850, "z-low", "3"), (0, 50, "z-base", "4")]
m.append(f'<rect x="{x0}" y="{sh(1800)}" width="1000" height="1750" class="f-bg"/>')
for lo, hi, cls, n in zones:
    if cls == "z-cas":
        m.append(f'<rect x="{x0+100}" y="{sh(hi)}" width="800" height="{hi-lo}" class="niche"/><rect x="{x0+100}" y="{sh(hi)}" width="800" height="6" class="lip"/>')
    elif cls == "z-base":
        m.append(f'<rect x="{x0+40}" y="{sh(hi)}" width="920" height="{hi-lo-8}" class="body"/>')
    elif cls == "z-can":
        m.append(f'<rect x="{x0+80}" y="{sh(1390)}" width="840" height="30" class="body"/>')
    else:
        m.append(f'<rect x="{x0}" y="{sh(hi)}" width="1000" height="{hi-lo}" class="{cls} zl"/>')
    cy = sh((lo+hi)/2)
    m.append(f'<circle cx="{x0+1100}" cy="{cy}" r="55" class="callout"/>')
    m.append(t(x0+1100, cy+22, n, "t-call"))
    m.append(f'<line x1="{x0+1000}" y1="{cy}" x2="{x0+1045}" y2="{cy}" class="lead"/>')
m.append(hdim(x0, x0+1000, F+90, "1,000", ty=F+170))
for hh in (1800, 1400, 1350, 850, 50):
    m.append(t(x0-30, sh(hh)+20, f"{hh:,}", "t-dim", "end"))
m.append(f'<rect x="{x0-50}" y="{sh(8)-8}" width="1100" height="16" class="plate-s"/>')
module = f'<svg viewBox="-160 0 2860 2400" class="dwg mod" role="img" aria-label="Two-sided stand: side section and the zones of one face">{"".join(m)}</svg>'

html = open(TPL).read()
scene = open('scene.js').read()
for k, v in (("{{PLAN}}", plan), ("{{BACK}}", elevBack), ("{{LB}}", elevLB), ("{{LOUT}}", elevLout), ("{{LIN}}", elevLin), ("{{MODULE}}", module), ("{{SCENE}}", scene)):
    html = html.replace(k, v)
open(OUT, "w").write(html)
print("ok", len(html))
