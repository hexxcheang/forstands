import sys
def t(x, y, s, cls, anchor="middle", extra=""):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{extra}>{s}</text>'
def hdim(x1, x2, y, label, ty=None):
    ty = y - 22 if ty is None else ty
    return (f'<g class="dim"><line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}"/><line x1="{x1}" y1="{y-25}" x2="{x1}" y2="{y+25}"/><line x1="{x2}" y1="{y-25}" x2="{x2}" y2="{y+25}"/></g>' + t((x1+x2)/2, ty, label, "td"))
def vdim(x, y1, y2, label, side="left"):
    tx = x - 28 if side == "left" else x + 30
    return (f'<g class="dim"><line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}"/><line x1="{x-25}" y1="{y1}" x2="{x+25}" y2="{y1}"/><line x1="{x-25}" y1="{y2}" x2="{x+25}" y2="{y2}"/></g>' + t(tx, (y1+y2)/2 + 14, label, "td", "end" if side == "left" else "start"))

# the switch row along the front face, in drawing x (700 = the centre): Noble, Halo, the S8 panel at the centre, Prestige
SWROW = [(211, 'noble-champagne'), (317, 'noble-ivory'), (423, 'noble-onyx'), (529, 'halo'), (700, 's8'), (871, 'prestige-onyx'), (977, 'prestige-champagne'), (1083, 'prestige-midnight')]
SWCOL = {'noble-champagne': ('#E3D5C7', '#B88A4E'), 'noble-ivory': ('#E4E6E7', '#4a4a4a'), 'noble-onyx': ('#151515', '#555555'),
         'prestige-onyx': ('#3a3a3a', '#1a0f0d'), 'prestige-champagne': ('#A08A74', '#1a0f0d'), 'prestige-midnight': ('#4A4F5C', '#1a0f0d')}
def switch_svg(x, y, k):
    if k == 'halo':
        return f'<rect x="{x-43}" y="{y-43}" width="86" height="86" rx="4" class="halop"/><circle cx="{x}" cy="{y}" r="30" class="halok"/>'
    if k == 's8':   # 216 x 116: the 8-inch screen (172 x 108) and the speaker strip with the home key
        x0, y0 = x - 108, y - 58
        tiles = ''.join(f'<rect x="{x0 + 22 + i * 34}" y="{y0 + 22}" width="28" height="{70 if i else 70}" rx="4" fill="#3a3a40"/>' for i in range(4))
        ribs = ''.join(f'<rect x="{x0 + 181 + i * 5}" y="{y0 + 4}" width="3" height="80" fill="#2b2c30"/>' for i in range(6))
        return (f'<rect x="{x0}" y="{y0}" width="216" height="116" rx="4" fill="#0b0b0d" stroke="#29221F" stroke-width="2"/>'
                f'<rect x="{x0 + 4}" y="{y0 + 4}" width="172" height="108" rx="2" fill="#17181d"/>{tiles}{ribs}'
                f'<rect x="{x0 + 180}" y="{y0 + 88}" width="32" height="24" fill="none" stroke="#6b6862" stroke-width="2"/>')
    face, band = SWCOL[k]
    return f'<rect x="{x-43}" y="{y-43}" width="86" height="86" rx="3" fill="{face}" stroke="#29221F" stroke-width="2"/><rect x="{x-43}" y="{y-11}" width="86" height="22" fill="{band}"/><rect x="{x-43}" y="{y-5}" width="86" height="10" fill="#1a0f0d"/>'

H = 1000                 # the floor line in the drawing
Z = 840                  # top of the marble; the gold top brings the counter to 850
sv = lambda h: H - h
U = Z - 120              # underside of the top
SH = [307, 513]          # shelves, evenly spaced in the lower body
# front: x from 0 to 1400
f = [f'<rect x="-60" y="{H}" width="1520" height="10" class="floor"/>',
     f'<rect x="65" y="{sv(60)}" width="1270" height="58" rx="20" class="bronze"/>',
     f'<rect x="75" y="{sv(48)}" width="1250" height="5" class="led"/>',
     f'<rect x="15" y="{sv(Z-120)}" width="1370" height="{U - 60}" rx="10" class="body"/>',
     f'<rect x="35" y="{sv(Z-140)}" width="1330" height="{U - 120}" class="inner"/>']
for x in (370, 1030):
    f.append(f'<rect x="{x-15}" y="{sv(Z-120)}" width="30" height="{U - 60}" class="body"/>')
f.append(f'<rect x="15" y="{sv(100)}" width="1370" height="40" class="body"/>')
f.append(f'<rect x="385" y="{sv(Z-120)}" width="630" height="{U - 60}" class="body"/>')
f.append(f'<text x="420" y="{sv(round(100 + (U - 100) * .57))}" class="lus" textLength="560" lengthAdjust="spacing">LUSANO</text>')
for h in SH:
    f.append(f'<rect x="35" y="{sv(h+12)}" width="320" height="25" rx="6" class="shelf"/>')
    f.append(f'<rect x="1045" y="{sv(h+12)}" width="340" height="25" rx="6" class="shelf"/>')
f.append(f'<rect x="0" y="{sv(Z)}" width="1400" height="120" rx="8" class="stone"/>')
f.append(f'<rect x="-70" y="{sv(Z+10)}" width="1540" height="10" rx="3" class="goldc"/>')
LUS = {325: ('#E3D5C7', '#B88A4E'), 450: ('#E4E6E7', '#4a4a4a'), 575: ('#151515', '#555555'), 825: ('#3a3a3a', '#1a0f0d'), 950: ('#A08A74', '#1a0f0d'), 1075: ('#4A4F5C', '#1a0f0d')}
for x, k in SWROW:
    f.append(switch_svg(x, sv(Z-60), k))
# the standard layout: six locks staggered, back row and front row, in mm (x along, z towards the front)
LOCKS = LOCKS_STD = ((-445, -77), (-225, 104), (-30, -79), (188, 92), (391, -69), (601, 99))
BALL = (-608, 116)
for dx, dz in sorted(LOCKS, key=lambda l: l[1]):   # back row first, so the front row draws over it
    x = 700 + dx
    f.append(f'<rect x="{x-85}" y="{sv(Z+22)}" width="170" height="12" class="bronze"/><rect x="{x-75}" y="{sv(Z+572)}" width="150" height="550" class="door"/><rect x="{x-44}" y="{sv(Z+512)}" width="78" height="410" rx="8" class="lockb"/>')
bx = 700 + BALL[0]
f.append(f'<rect x="{bx-60}" y="{sv(Z+44)}" width="120" height="22" rx="6" class="bronze"/><circle cx="{bx}" cy="{sv(Z+132)}" r="100" class="ballc"/>')
f.append(f'<rect x="25" y="{sv(U)+2}" width="1350" height="5" class="led"/>')
f.append(hdim(-70, 1470, sv(Z + 610), "1,540 gold top"))
f.append(hdim(0, 1400, H + 300, "1,400 marble and body", ty=H + 360))
f.append(t(700, H + 230, "front edge: Lusano Noble · Halo · S8 panel · Lusano Prestige", "td"))
f.append(hdim(15, 370, H + 90, "355 curved shelves", ty=H + 150))
f.append(hdim(370, 1030, H + 90, "660 closed, lit logo", ty=H + 150))
f.append(hdim(1030, 1385, H + 90, "355 curved shelves", ty=H + 150))
f.append(vdim(-60, sv(Z + 10), H, "850"))
f.append(vdim(1460, sv(Z), sv(Z-120), "120 top", "right"))
f.append(vdim(1530, sv(Z+572), sv(Z+22), "550 door", "right"))
f.append(t(1575, sv(Z+5) + 10, "10 gold top", "td", "start"))
f.append(t(1560, sv(Z+200), "locks 78 × 410", "td", "start"))
f.append(vdim(1460, sv(60), H, "60 base", "right"))
for h in SH:
    f.append(t(1460, sv(h) + 12, f"shelf {h}", "td", "start"))
front = f'<svg viewBox="-260 -510 2160 1910" class="dwg" role="img" aria-label="Front elevation with dimensions">{"".join(f)}</svg>'

# end: z from 0 (back) to 500 (front)
e = [f'<rect x="-60" y="{H}" width="620" height="10" class="floor"/>',
     f'<rect x="65" y="{sv(60)}" width="370" height="58" rx="20" class="bronze"/>',
     f'<rect x="75" y="{sv(48)}" width="350" height="5" class="led"/>',
     f'<rect x="15" y="{sv(Z-120)}" width="470" height="{U - 60}" rx="10" class="body"/>',
     f'<rect x="250" y="{sv(Z-120)}" width="235" height="{U - 100}" class="inner"/>',
     f'<rect x="0" y="{sv(Z)}" width="500" height="120" rx="8" class="stone"/>',
     f'<rect x="-25" y="{sv(Z+10)}" width="550" height="10" rx="3" class="goldc"/>',
     f'<rect x="25" y="{sv(U)+2}" width="450" height="5" class="led"/>',
     f'<rect x="125" y="{sv(Z+22)}" width="150" height="12" class="bronze"/><rect x="177" y="{sv(Z+572)}" width="45" height="550" class="door"/><rect x="222" y="{sv(Z+512)}" width="70" height="410" class="lockb"/><rect x="147" y="{sv(Z+457)}" width="30" height="320" class="lockb"/>',
     f'<rect x="500" y="{sv(Z-17)}" width="6" height="86" class="sw"/>']
for h in SH:
    e.append(f'<rect x="250" y="{sv(h+12)}" width="235" height="25" rx="6" class="shelf"/>')
e.append(t(132, sv(420), "closed", "td"))
e.append(t(368, sv(U - 90), "open", "td"))
e.append(hdim(-25, 525, sv(Z + 610), "550 gold top"))
e.append(hdim(0, 500, H + 90, "500 marble", ty=H + 150))
e.append(vdim(-80, sv(Z + 10), H, "850"))
end = f'<svg viewBox="-260 -510 900 1750" class="dwg narrow" role="img" aria-label="End elevation: 500 deep, closed at the back, open shelves at the front">{"".join(e)}</svg>'

# plan: top down, front at the bottom
p = [f'<rect x="-70" y="-25" width="1540" height="550" rx="165" class="goldc"/>', f'<rect x="0" y="0" width="1400" height="500" rx="150" class="marbleo"/>']
for dx, dz in LOCKS:
    x, y = 700 + dx, 250 + dz
    p.append(f'<rect x="{x-85}" y="{y-75}" width="170" height="150" class="bronze"/><rect x="{x-75}" y="{y-22}" width="150" height="45" class="door"/><rect x="{x-44}" y="{y+23}" width="78" height="70" class="lockb"/>')
p.append(f'<circle cx="{700 + BALL[0]}" cy="{250 + BALL[1]}" r="100" class="ballc"/>')
for x, k in SWROW:
    p.append(f'<rect x="{x - (108 if k == "s8" else 43)}" y="500" width="{216 if k == "s8" else 86}" height="{14 if k == "s8" else 8}" class="{"halop" if k == "halo" else "sw"}"/>')
p.append(t(800, -60, "6 Lenovo locks, staggered in two rows", "td"))
p.append(t(700 + BALL[0], 250 + BALL[1] + 14, "ball light", "td"))
p.append(t(700, 580, "FRONT EDGE · NOBLE · HALO · S8 · PRESTIGE", "tz"))
p.append(hdim(-70, 1470, -110, "1,540 gold top (marble 1,400, dashed)"))
p.append(vdim(-110, -25, 525, "550"))
p.append('<path d="M1470 140 A165 165 0 0 0 1305 -25" class="radius"/>')
p.append(t(1500, 60, "R165", "td", "start"))
plan = f'<svg viewBox="-300 -190 2160 840" class="dwg" role="img" aria-label="Plan from above: 1,400 by 500, six locks staggered in two rows and the ball light at the front left on the top, with the switches on the front edge">{"".join(p)}</svg>'


# ---------- the marble-block forms: square or rounded in plan, no gold, the marble a share of the 850 height ----------
def keep_on(x, z, rounded, ext=(-85, 85, -75, 143), W=1400, Dd=500, R=150, m=4):
    """Keep a footprint on the top, as the 3D model does: (x, z) in mm from the centre, front positive."""
    x0, x1, z0, z1 = ext
    x = max(-W / 2 + m - x0, min(x, W / 2 - m - x1)); z = max(-Dd / 2 + m - z0, min(z, Dd / 2 - m - z1))
    if rounded:
        for sx in (-1, 1):
            for sz in (-1, 1):
                ax, az = sx * (W / 2 - R), sz * (Dd / 2 - R)
                px, pz = x + (x1 if sx > 0 else x0), z + (z1 if sz > 0 else z0)
                if (px - ax) * sx > 0 and (pz - az) * sz > 0:
                    dx, dz = px - ax, pz - az; d = (dx * dx + dz * dz) ** .5; lim = R - m
                    if d > lim: k = (d - lim) / d; x -= dx * k; z -= dz * k
    return round(x), round(z)

def form_dwg(frac, rounded, share, name):
    LOCKS = [keep_on(x, z, rounded) for x, z in LOCKS_STD]
    RZ = 850; RT = round(RZ * frac); RU = RZ - RT
    RS = round((100 + RU) / 2)                              # the one shelf in each bay, top at about 316
    r = [f'<rect x="-60" y="{H}" width="1520" height="10" class="floor"/>',
         f'<rect x="65" y="{sv(60)}" width="1270" height="58" rx="6" class="bronze"/>',
         f'<rect x="75" y="{sv(48)}" width="1250" height="5" class="led"/>',
         f'<rect x="15" y="{sv(RU)}" width="1370" height="{RU - 60}" class="body"/>',
         f'<rect x="35" y="{sv(RU - 20)}" width="1330" height="{RU - 120}" class="inner"/>']
    for x in (370, 1030):
        r.append(f'<rect x="{x-15}" y="{sv(RU)}" width="30" height="{RU - 60}" class="body"/>')
    r.append(f'<rect x="15" y="{sv(100)}" width="1370" height="40" class="body"/>')
    r.append(f'<rect x="385" y="{sv(RU)}" width="630" height="{RU - 60}" class="body"/>')
    r.append(f'<text x="420" y="{sv(round(100 + (RU - 100) * .57))}" class="lus" textLength="560" lengthAdjust="spacing">LUSANO</text>')
    r.append(f'<rect x="35" y="{sv(RS + 12)}" width="320" height="25" class="shelf"/><rect x="1045" y="{sv(RS + 12)}" width="320" height="25" class="shelf"/>')
    r.append(f'<rect x="0" y="{sv(RZ)}" width="1400" height="{RT}" rx="{8 if rounded else 3}" class="stone"/>')
    r.append(f'<rect x="25" y="{sv(RU)+2}" width="1350" height="5" class="led"/>')
    for x, k in SWROW:
        r.append(switch_svg(x, sv(RZ - RT / 2), k))
    for dx, dz in sorted(LOCKS, key=lambda l: l[1]):
        x = 700 + dx
        r.append(f'<rect x="{x-85}" y="{sv(RZ+12)}" width="170" height="12" class="bronze"/><rect x="{x-75}" y="{sv(RZ+562)}" width="150" height="550" class="door"/><rect x="{x-44}" y="{sv(RZ+502)}" width="78" height="410" rx="8" class="lockb"/>')
    r.append(f'<rect x="{bx-60}" y="{sv(RZ+22)}" width="120" height="22" rx="6" class="bronze"/><circle cx="{bx + 8}" cy="{sv(RZ+122)}" r="100" class="ballc"/>')
    r.append(hdim(0, 1400, H + 300, "1,400 marble and body", ty=H + 360))
    r.append(hdim(15, 370, H + 90, "355 open bay", ty=H + 150))
    r.append(hdim(370, 1030, H + 90, "660 closed, lit logo", ty=H + 150))
    r.append(hdim(1030, 1385, H + 90, "355 open bay", ty=H + 150))
    r.append(vdim(-60, sv(RZ), H, "850"))
    r.append(vdim(1460, sv(RZ), sv(RU), f"{RT} marble, {share}", "right"))
    r.append(vdim(1460, sv(RU), H, f"{RU} body", "right"))
    r.append(t(1205, sv(RS) + 75, f"shelf {RS}", "td"))
    rfront = f'<svg viewBox="-260 -460 2160 1880" class="dwg" role="img" aria-label="{name}, front elevation: 1,400 long, 850 high, the marble the top {RT} mm with the switches on its face, a {RU} mm wood body with one shelf in each open bay">{"".join(r)}</svg>'
    q = [f'<rect x="0" y="0" width="1400" height="500" rx="{150 if rounded else 6}" class="stonep"/>']
    for dx, dz in LOCKS:
        x, y = 700 + dx, 250 + dz
        q.append(f'<rect x="{x-85}" y="{y-75}" width="170" height="150" class="bronze"/><rect x="{x-75}" y="{y-22}" width="150" height="45" class="door"/><rect x="{x-44}" y="{y+23}" width="78" height="70" class="lockb"/>')
    q.append(f'<circle cx="{bx + 8}" cy="{250 + BALL[1]}" r="100" class="ballc"/>')
    for x, k in SWROW:
        q.append(f'<rect x="{x - (108 if k == "s8" else 43)}" y="500" width="{216 if k == "s8" else 86}" height="{14 if k == "s8" else 8}" class="{"halop" if k == "halo" else "sw"}"/>')
    q.append(hdim(0, 1400, -60, "1,400 marble, " + ("150 mm corner radius" if rounded else "square corners")))
    q.append(vdim(-60, 0, 500, "500"))
    q.append(t(700, 580, "FRONT FACE · NOBLE · HALO · S8 · PRESTIGE", "tz"))
    rplan = f'<svg viewBox="-260 -150 1960 780" class="dwg" role="img" aria-label="{name} from above: a 1,400 by 500 marble top with {'rounded' if rounded else 'square'} corners, the six staggered locks and the ball light">{"".join(q)}</svg>'
    return rfront, rplan

rfront, rplan = form_dwg(3 / 8, False, '3/8', 'Rectangular form')
r28front, r28plan = form_dwg(2 / 8, False, '2/8', 'Rectangular form, marble to 2/8')
o28front, o28plan = form_dwg(2 / 8, True, '2/8', 'Rounded form, marble to 2/8')

html = open(sys.argv[1]).read()
html = html.replace("{{FRONT}}", front).replace("{{END}}", end).replace("{{PLAN}}", plan).replace("{{RFRONT}}", rfront).replace("{{RPLAN}}", rplan).replace("{{R28FRONT}}", r28front).replace("{{R28PLAN}}", r28plan).replace("{{O28FRONT}}", o28front).replace("{{O28PLAN}}", o28plan).replace("{{SCENE}}", open("table2.js").read())
open(sys.argv[2], "w").write(html)
print("ok", len(html))
