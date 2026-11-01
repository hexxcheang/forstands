import sys
def t(x, y, s, cls, anchor="middle", extra=""):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{extra}>{s}</text>'
def hdim(x1, x2, y, label, ty=None):
    ty = y - 22 if ty is None else ty
    return (f'<g class="dim"><line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}"/><line x1="{x1}" y1="{y-25}" x2="{x1}" y2="{y+25}"/><line x1="{x2}" y1="{y-25}" x2="{x2}" y2="{y+25}"/></g>' + t((x1+x2)/2, ty, label, "td"))
def vdim(x, y1, y2, label, side="left"):
    tx = x - 28 if side == "left" else x + 30
    return (f'<g class="dim"><line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}"/><line x1="{x-25}" y1="{y1}" x2="{x+25}" y2="{y1}"/><line x1="{x-25}" y1="{y2}" x2="{x+25}" y2="{y2}"/></g>' + t(tx, (y1+y2)/2 + 14, label, "td", "end" if side == "left" else "start"))
H = 1000
sv = lambda h: H - h
SH = [330, 600]
# front: x from 0 to 1400
f = [f'<rect x="-60" y="{H}" width="1520" height="10" class="floor"/>',
     f'<rect x="65" y="{sv(60)}" width="1270" height="58" rx="20" class="bronze"/>',
     f'<rect x="75" y="{sv(48)}" width="1250" height="5" class="led"/>',
     f'<rect x="15" y="{sv(880)}" width="1370" height="820" rx="10" class="body"/>',
     f'<rect x="35" y="{sv(860)}" width="1330" height="760" class="inner"/>']
for x in (370, 1030):
    f.append(f'<rect x="{x-15}" y="{sv(880)}" width="30" height="820" class="body"/>')
f.append(f'<rect x="15" y="{sv(100)}" width="1370" height="40" class="body"/>')
f.append(f'<rect x="385" y="{sv(880)}" width="630" height="820" class="body"/>')
f.append(f'<text x="420" y="{sv(540)}" class="lus" textLength="560" lengthAdjust="spacing">LUSANO</text>')
for h in SH:
    f.append(f'<rect x="35" y="{sv(h+12)}" width="320" height="25" rx="6" class="shelf"/>')
    f.append(f'<rect x="1045" y="{sv(h+12)}" width="340" height="25" rx="6" class="shelf"/>')
f.append(f'<rect x="0" y="{sv(1000)}" width="1400" height="120" rx="8" class="stone"/>')
f.append(f'<rect x="-70" y="{sv(1010)}" width="1540" height="10" rx="3" class="goldc"/>')
LUS = {325: ('#E3D5C7', '#B88A4E'), 450: ('#E4E6E7', '#4a4a4a'), 575: ('#151515', '#555555'), 825: ('#3a3a3a', '#1a0f0d'), 950: ('#A08A74', '#1a0f0d'), 1075: ('#4A4F5C', '#1a0f0d')}
for x in (325, 450, 575, 700, 825, 950, 1075):
    if x == 700:
        f.append(f'<rect x="{x-43}" y="{sv(940)-43}" width="86" height="86" rx="4" class="halop"/><circle cx="{x}" cy="{sv(940)}" r="30" class="halok"/>')
    else:
        face, band = LUS[x]
        f.append(f'<rect x="{x-43}" y="{sv(940)-43}" width="86" height="86" rx="3" fill="{face}" stroke="#29221F" stroke-width="2"/><rect x="{x-43}" y="{sv(940)-11}" width="86" height="22" fill="{band}"/><rect x="{x-43}" y="{sv(940)-5}" width="86" height="10" fill="#1a0f0d"/>')

LOCKX = (-380, -190, 0, 190, 380, 570)
for dx in LOCKX:
    x = 700 + dx
    f.append(f'<rect x="{x-85}" y="{sv(1022)}" width="170" height="12" class="bronze"/><rect x="{x-75}" y="{sv(1572)}" width="150" height="550" class="door"/><rect x="{x-44}" y="{sv(1512)}" width="78" height="410" rx="8" class="lockb"/>')
f.append(f'<rect x="40" y="{sv(1044)}" width="120" height="22" rx="6" class="bronze"/><circle cx="100" cy="{sv(1132)}" r="100" class="ballc"/>')
f.append(f'<rect x="25" y="{sv(880)+2}" width="1350" height="5" class="led"/>')
f.append(hdim(-70, 1470, -600, "1,540 gold top"))
f.append(hdim(0, 1400, H + 300, "1,400 marble and body", ty=H + 360))
f.append(t(700, H + 230, "front edge: Lusano Noble · Halo · Lusano Prestige", "td"))
f.append(hdim(15, 370, H + 90, "355 curved shelves", ty=H + 150))
f.append(hdim(370, 1030, H + 90, "660 closed, lit logo", ty=H + 150))
f.append(hdim(1030, 1385, H + 90, "355 curved shelves", ty=H + 150))
f.append(vdim(-60, 0, H, "1,000"))
f.append(vdim(1460, sv(1000), sv(880), "120 top", "right"))
f.append(vdim(1530, sv(1572), sv(1022), "550 door", "right"))
f.append(t(1530, sv(1005) + 10, "10 gold top", "td", "start"))
f.append(t(1560, sv(1200), "locks 78 × 410", "td", "start"))
f.append(vdim(1460, sv(60), H, "60 base", "right"))
for h in SH:
    f.append(t(1460, sv(h) + 12, f"shelf {h}", "td", "start"))
front = f'<svg viewBox="-260 -660 2160 2060" class="dwg" role="img" aria-label="Front elevation with dimensions">{"".join(f)}</svg>'

# end: z from 0 (back) to 500 (front)
e = [f'<rect x="-60" y="{H}" width="620" height="10" class="floor"/>',
     f'<rect x="65" y="{sv(60)}" width="370" height="58" rx="20" class="bronze"/>',
     f'<rect x="75" y="{sv(48)}" width="350" height="5" class="led"/>',
     f'<rect x="15" y="{sv(880)}" width="470" height="820" rx="10" class="body"/>',
     f'<rect x="250" y="{sv(880)}" width="235" height="780" class="inner"/>',
     f'<rect x="0" y="{sv(1000)}" width="500" height="120" rx="8" class="stone"/>',
     f'<rect x="-25" y="{sv(1010)}" width="550" height="10" rx="3" class="goldc"/>',
     f'<rect x="25" y="{sv(880)+2}" width="450" height="5" class="led"/>',
     f'<rect x="125" y="{sv(1022)}" width="150" height="12" class="bronze"/><rect x="177" y="{sv(1572)}" width="45" height="550" class="door"/><rect x="222" y="{sv(1512)}" width="70" height="410" class="lockb"/><rect x="147" y="{sv(1457)}" width="30" height="320" class="lockb"/>',
     f'<rect x="500" y="{sv(983)}" width="6" height="86" class="sw"/>']
for h in SH:
    e.append(f'<rect x="250" y="{sv(h+12)}" width="235" height="25" rx="6" class="shelf"/>')
e.append(t(132, sv(500), "closed", "td"))
e.append(t(368, sv(780), "open", "td"))
e.append(hdim(-25, 525, -600, "550 gold top"))
e.append(hdim(0, 500, H + 90, "500 marble", ty=H + 150))
e.append(vdim(-80, sv(1010), H, "1,010"))
end = f'<svg viewBox="-260 -660 900 1900" class="dwg narrow" role="img" aria-label="End elevation: 500 deep, closed at the back, open shelves at the front">{"".join(e)}</svg>'

# plan: top down, front at the bottom
p = [f'<rect x="-70" y="-25" width="1540" height="550" rx="165" class="goldc"/>', f'<rect x="0" y="0" width="1400" height="500" rx="150" class="marbleo"/>']
for dx in (-380, -190, 0, 190, 380, 570):
    x = 700 + dx
    p.append(f'<rect x="{x-85}" y="125" width="170" height="150" class="bronze"/><rect x="{x-75}" y="178" width="150" height="45" class="door"/><rect x="{x-44}" y="223" width="78" height="70" class="lockb"/>')
p.append('<circle cx="100" cy="220" r="100" class="ballc"/>')
for x in (325, 450, 575, 700, 825, 950, 1075):
    p.append(f'<rect x="{x-43}" y="500" width="86" height="8" class="{"halop" if x == 700 else "sw"}"/>')
p.append(t(800, 75, "6 Lenovo locks, each on its own stand", "td"))
p.append(t(100, -60, "ball light", "td"))
p.append(t(700, 580, "FRONT EDGE · NOBLE · HALO · PRESTIGE", "tz"))
p.append(hdim(-70, 1470, -110, "1,540 gold top (marble 1,400, dashed)"))
p.append(vdim(-110, -25, 525, "550"))
p.append('<path d="M1470 140 A165 165 0 0 0 1305 -25" class="radius"/>')
p.append(t(1500, 60, "R165", "td", "start"))
plan = f'<svg viewBox="-300 -190 2160 840" class="dwg" role="img" aria-label="Plan from above: 1,400 by 500, three locks on door panels on the top, with the switches on the front edge">{"".join(p)}</svg>'

html = open(sys.argv[1]).read()
html = html.replace("{{FRONT}}", front).replace("{{END}}", end).replace("{{PLAN}}", plan).replace("{{SCENE}}", open("table2.js").read())
open(sys.argv[2], "w").write(html)
print("ok", len(html))
