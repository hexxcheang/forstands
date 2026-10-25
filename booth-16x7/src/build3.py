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
# carpentry wall
p.append(f'<rect x="{LB}" y="0" width="{W-LB}" height="{CW}" class="cw"/>')
for i in range(1, 4):
    x = LB + i*PW
    p.append(f'<line x1="{x:.0f}" y1="0" x2="{x:.0f}" y2="{CW}" class="joint"/>')
names = ["Lusano Prestige", "Lusano Noble + Halo", "Nova+ Pro + S8", "Folio + Ark"]
subs = ["9 switches", "3 switches · Halo", "8 switches · S8 panel", "8 switches"]
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
# tables and chairs
for cx, chairs in ((850, (200, 1100)), (2950, (2300, 3200))):
    for c in chairs:
        p.append(f'<rect x="{c}" y="1150" width="400" height="400" rx="70" class="chair"/>')
    p.append(f'<circle cx="{cx}" cy="1350" r="300" class="table"/>')
p.append(t(850, 1365, "T1", "t-on"))
p.append(t(2950, 1365, "T2", "t-on"))
p.append(hdim(1500, 2300, 1760, "800 path", ty=1850))
# front corner L of two two-sided stands
p.append('<rect x="3677" y="1734" width="1000" height="200" class="body"/>')
p.append('<rect x="4477" y="734" width="200" height="1000" class="body"/>')
p.append('<rect x="3692" y="1934" width="970" height="30" class="fa"/>')
p.append('<rect x="3692" y="1704" width="770" height="30" class="fb"/>')
p.append('<rect x="4677" y="749" width="30" height="1185" class="fa"/>')
p.append('<rect x="4447" y="749" width="30" height="955" class="fb"/>')
p.append(t(4177, 1862, "S1", "t-in"))
p.append(t(4577, 1234, "S2", "t-in", extra=' transform="rotate(-90 4577 1234)" dy="28"'))
p.append(t(3990, 1010, "INSIDE THE L", "t-bay"))
p.append(t(3990, 1120, "S2: S1 panel", "t-sub2"))
p.append(t(3990, 1210, "S1: packages", "t-sub2"))
p.append(t(4177, 2240, "Aisle: control panels", "t-sub"))
p.append(t(4990, 1234, "Aisle: smart locks", "t-sub", extra=' transform="rotate(90 4990 1234)"'))
plan = f'<svg viewBox="-460 -520 5860 2940" class="dwg" role="img" aria-label="Top view: a fabric lightbox on the left 7 ft side, a one-sided carpentry product wall along the 16 ft back, two tables with chairs in the centre, and an L of two two-sided stands at the front right corner">{"".join(p)}</svg>'

# ---------------- Elevation pieces (1.8 m, same layout as the 3D artwork) ----------------
H = 1800
def sv(h): return H - h
def sq(cx, cyh, w, h, cls="sw"):
    return f'<rect x="{cx-w/2:.0f}" y="{sv(cyh)-h/2:.0f}" width="{w}" height="{h}" class="{cls}"/>'
def top(cx, toph, w, h, cls):
    return f'<rect x="{cx-w/2:.0f}" y="{sv(toph):.0f}" width="{w}" height="{h}" class="{cls}"/>'

def products(c, kind):
    g = []
    if kind == "prestige":
        for r, hh in enumerate((1250, 1100, 950)):
            for k in range(3): g.append(sq(c-150+k*150, hh, 86, 86))
    elif kind == "noble":
        for k in range(3): g.append(sq(c-200+k*200, 1240, 90, 90))
        g.append(f'<circle cx="{c:.0f}" cy="{sv(1010)}" r="62" class="halo"/>')
    elif kind == "nova":
        for hh in (1270, 1130):
            for k in range(4): g.append(sq(c-225+k*150, hh, 86, 86))
        g.append(sq(c, 950, 234, 128, "pnl"))
    elif kind == "folio":
        for hh in (1250, 1030):
            for k in range(4): g.append(sq(c-225+k*150, hh, 86, 86))
    elif kind == "panels":
        g.append(sq(c-170, 1110, 300, 190, "pnl")); g.append(sq(c+190, 1110, 230, 140, "pnl"))
    elif kind == "locks":
        for k in range(6): g.append(top(c-300+k*120, 1330, 64, 300, "lk"))
    elif kind == "s1":
        g.append(sq(c-150, 1100, 130, 130, "pnl"))
        g.append(top(c+58, 1160, 36, 90, "sw")); g.append(top(c+93, 1150, 18, 70, "sw"))
        g.append(f'<circle cx="{c+210:.0f}" cy="{sv(1110)}" r="40" class="sw"/>')
    elif kind == "packages":
        for k in range(3): g.append(top(c-247.5+k*245, 1330, 225, 460, "card"))
    return "".join(g)

def face(x0, w, name, sub, kind, canopy_cls="body"):
    c = x0 + w / 2
    g = [f'<rect x="{x0:.0f}" y="0" width="{w:.0f}" height="{H}" class="f-bg"/>',
         f'<rect x="{x0:.0f}" y="{sv(550)}" width="{w:.0f}" height="500" fill="url(#lat)"/>',
         f'<rect x="{x0:.0f}" y="{sv(50)}" width="{w:.0f}" height="50" class="kick"/>']
    g.append(t(f"{c:.0f}", sv(1590), name, "e-name"))
    g.append(t(f"{c:.0f}", sv(1515), sub, "e-sub"))
    g.append(f'<rect x="{c-400:.0f}" y="{sv(1350)}" width="800" height="500" class="cass"/>')
    g.append(f'<polygon points="{c-400:.0f},{sv(1360)} {c+400:.0f},{sv(1360)} {c+400:.0f},{sv(1180)} {c-400:.0f},{sv(1180)}" class="beam"/>')
    g.append(f'<rect x="{c-420:.0f}" y="{sv(1390)}" width="840" height="30" class="body"/>')
    g.append(f'<rect x="{c-400:.0f}" y="{sv(1364)}" width="800" height="5" class="dl"/>')
    g.append(products(c, kind))
    g.append(f'<rect x="{c-400:.0f}" y="{sv(800)}" width="420" height="24" class="ln"/><rect x="{c-400:.0f}" y="{sv(755)}" width="300" height="20" class="ln"/><rect x="{c-400:.0f}" y="{sv(695)}" width="360" height="16" class="ln"/>')
    g.append(f'<rect x="{c+290:.0f}" y="{sv(840)}" width="110" height="110" class="qr"/>')
    g.append(f'<line x1="{x0:.0f}" y1="0" x2="{x0:.0f}" y2="{H}" class="seam"/>')
    return "".join(g)

def lightbox(x0, w):
    return (f'<rect x="{x0:.0f}" y="0" width="{w:.0f}" height="{H}" class="lbx-e"/>'
            f'<rect x="{x0:.0f}" y="0" width="{w:.0f}" height="{H}" fill="url(#glow)"/>'
            + t(f"{x0+w/2:.0f}", 330, "MAXSEN", "lb-mark")
            + t(f"{x0+w/2:.0f}", 720, "The art of", "lb-big")
            + t(f"{x0+w/2:.0f}", 920, "a single touch.", "lb-big lb-it")
            + t(f"{x0+w/2:.0f}", 1060, "SMART HOME · SINGAPORE", "lb-small")
            + f'<circle cx="{x0+w/2:.0f}" cy="1360" r="150" class="lb-halo"/>')

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
heads = [("Lusano Prestige", "SWAROVSKI CRYSTALS"), ("Lusano Noble", "WITH THE HALO DIMMER"), ("Nova+ Pro", "A NAME ON EVERY KEY"), ("Folio + Ark", "SLIM AND SIMPLE")]
parts = [f'<rect x="0" y="0" width="{LB}" height="{H}" class="lbx-e"/>']
for i in range(4):
    parts.append(face(LB + i*PW, PW, heads[i][0], heads[i][1], kinds[i], "fas"))
elevBack = elev(parts, W, "Carpentry wall as seen from inside the booth, with the lightbox edge on the left")
parts = [lightbox(0, D - CW), f'<rect x="{D-CW}" y="0" width="{CW}" height="{H}" class="cw"/>']
elevLB = elev(parts, D, "Fabric lightbox as seen from inside the booth")
parts = [face(0, 1000, "Control panels", "ONE QUIET SCREEN", "panels"),
         f'<line x1="1000" y1="0" x2="1000" y2="{H}" class="fold"/>',
         face(1000, 1000, "Smart locks", "LENOVO · MYDIGITALLOCK", "locks")]
elevLout = elev(parts, 2000, "Front corner L, outside faces unfolded")
parts = [face(0, 1000, "Nova S1", "LEAVE AND HOME", "s1"),
         f'<line x1="1000" y1="0" x2="1000" y2="{H}" class="fold"/>',
         face(1000, 1000, "Packages", "THIS MONTH'S OFFERS", "packages")]
elevLin = elev(parts, 2000, "Front corner L, inside faces unfolded")

# ---------------- Stand section + face zones (1.8 m) ----------------
F = 2060
def sh(h): return F - h
m = []
m.append(f'<rect x="400" y="{sh(8)-8}" width="400" height="16" class="plate-s"/>')
m.append(f'<rect x="500" y="{sh(1800)}" width="200" height="{1800-8}" class="body"/>')
m.append(f'<rect x="500" y="{sh(1350)}" width="18" height="500" class="cass"/><rect x="682" y="{sh(1350)}" width="18" height="500" class="cass"/>')
for xx in (470, 700):
    m.append(f'<rect x="{xx}" y="{sh(1390)}" width="30" height="30" class="body"/>')
m.append(f'<polygon points="470,{sh(1362)} 420,{sh(1150)} 500,{sh(1150)} 500,{sh(1362)}" class="beam"/><polygon points="730,{sh(1362)} 780,{sh(1150)} 700,{sh(1150)} 700,{sh(1362)}" class="beam"/>')
for hh in (1250, 1100, 950):
    m.append(f'<rect x="518" y="{sh(hh)-43}" width="50" height="86" class="box"/><rect x="632" y="{sh(hh)-43}" width="50" height="86" class="box"/>')
m.append(t(600, 70, "SECTION", "t-zone"))
m.append(hdim(500, 700, 190, "200 body", ty=160))
m.append(hdim(400, 800, F+90, "400 base", ty=F+170))
m.append(vdim(250, sh(1800), sh(0), "1,800", "left"))
x0 = 1400
m.append(t(x0+500, 70, "ONE FACE", "t-zone"))
zones = [(1400, 1800, "z-hdr", "1"), (1350, 1400, "z-can", "2"), (850, 1350, "z-cas", "3"), (550, 850, "z-inf", "4"), (50, 550, "z-low", "5")]
m.append(f'<rect x="{x0}" y="{sh(1800)}" width="1000" height="1800" class="f-bg"/>')
m.append(f'<rect x="{x0}" y="{sh(1350)}" width="1000" height="500" class="z-band"/>')
for lo, hi, cls, n in zones:
    if cls == "z-cas":
        m.append(f'<rect x="{x0+100}" y="{sh(hi)}" width="800" height="{hi-lo}" class="cass"/>')
    elif cls == "z-can":
        m.append(f'<rect x="{x0+80}" y="{sh(1390)}" width="840" height="30" class="body"/>')
    else:
        m.append(f'<rect x="{x0}" y="{sh(hi)}" width="1000" height="{hi-lo}" class="{cls} zl"/>')
    cy = sh((lo+hi)/2)
    m.append(f'<circle cx="{x0+1100}" cy="{cy}" r="55" class="callout"/>')
    m.append(t(x0+1100, cy+22, n, "t-call"))
    m.append(f'<line x1="{x0+1000}" y1="{cy}" x2="{x0+1045}" y2="{cy}" class="lead"/>')
m.append(hdim(x0, x0+1000, F+90, "1,000", ty=F+170))
for hh in (1800, 1400, 1350, 850, 550):
    m.append(t(x0-30, sh(hh)+20, f"{hh:,}", "t-dim", "end"))
m.append(f'<rect x="{x0-50}" y="{sh(8)-8}" width="1100" height="16" class="plate-s"/>')
module = f'<svg viewBox="-160 0 2860 2400" class="dwg mod" role="img" aria-label="Two-sided stand: side section and the zones of one face">{"".join(m)}</svg>'

html = open(TPL).read()
scene = open('scene.js').read()
for k, v in (("{{PLAN}}", plan), ("{{BACK}}", elevBack), ("{{LB}}", elevLB), ("{{LOUT}}", elevLout), ("{{LIN}}", elevLin), ("{{MODULE}}", module), ("{{SCENE}}", scene)):
    html = html.replace(k, v)
open(OUT, "w").write(html)
print("ok", len(html))
