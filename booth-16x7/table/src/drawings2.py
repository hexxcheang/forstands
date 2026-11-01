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
f.append(t(709, sv(560), "LUSANO", "lus"))
for h in SH:
    f.append(f'<rect x="35" y="{sv(h+12)}" width="320" height="25" class="shelf"/>')
    f.append(f'<rect x="1045" y="{sv(h+12)}" width="340" height="25" rx="6" class="shelf"/>')
f.append(f'<rect x="0" y="{sv(1000)}" width="1400" height="120" rx="8" class="stone"/>')
for i, x in enumerate((325, 450, 575, 700, 825, 950, 1075)):
    if x == 700:
        f.append(f'<rect x="{x-43}" y="{sv(940)-43}" width="86" height="86" rx="4" class="halop"/><circle cx="{x}" cy="{sv(940)}" r="30" class="halok"/>')
    else:
        f.append(f'<rect x="{x-43}" y="{sv(940)-43}" width="86" height="86" rx="4" class="sw"/>')
for x in (280, 700, 1120):
    f.append(f'<rect x="{x-120}" y="{sv(1012)}" width="240" height="12" class="bronze"/><rect x="{x-110}" y="{sv(1472)}" width="220" height="460" class="door"/><rect x="{x+3}" y="{sv(1427)}" width="74" height="370" rx="10" class="lockb"/>')
f.append(f'<rect x="25" y="{sv(880)+2}" width="1350" height="5" class="led"/>')
f.append(hdim(0, 1400, -560, "1,400"))
f.append(t(700, H + 230, "front edge: 6 switches + Halo in the centre", "td"))
f.append(hdim(15, 370, H + 90, "355 curved shelves", ty=H + 150))
f.append(hdim(370, 1030, H + 90, "660 closed, lit logo", ty=H + 150))
f.append(hdim(1030, 1385, H + 90, "355 curved shelves", ty=H + 150))
f.append(vdim(-60, 0, H, "1,000"))
f.append(vdim(1460, sv(1000), sv(880), "120 top", "right"))
f.append(t(1460, sv(1300), "locks on top", "td", "start"))
f.append(vdim(1460, sv(60), H, "60 base", "right"))
for h in SH:
    f.append(t(1460, sv(h) + 12, f"shelf {h}", "td", "start"))
front = f'<svg viewBox="-260 -620 2080 1900" class="dwg" role="img" aria-label="Front elevation with dimensions">{"".join(f)}</svg>'

# end: z from 0 (back) to 600 (front)
e = [f'<rect x="-60" y="{H}" width="720" height="10" class="floor"/>',
     f'<rect x="65" y="{sv(60)}" width="470" height="58" rx="20" class="bronze"/>',
     f'<rect x="75" y="{sv(48)}" width="450" height="5" class="led"/>',
     f'<rect x="15" y="{sv(880)}" width="570" height="820" rx="10" class="body"/>',
     f'<rect x="0" y="{sv(1000)}" width="600" height="120" rx="8" class="stone"/>',
     f'<rect x="25" y="{sv(880)+2}" width="550" height="5" class="led"/>',
     f'<rect x="164" y="{sv(1012)}" width="160" height="12" class="bronze"/><rect x="226" y="{sv(1472)}" width="36" height="460" class="door"/><rect x="262" y="{sv(1427)}" width="32" height="370" class="lockb"/>',
     f'<rect x="600" y="{sv(983)}" width="6" height="86" class="sw"/>']
e.append(hdim(0, 600, -560, "600 (to confirm)"))
e.append(vdim(-60, 0, H, "1,000"))
e.append(f'<rect x="300" y="{sv(880)}" width="285" height="820" class="inner"/>')
for h in (330, 600):
    e.append(f'<rect x="300" y="{sv(h+12)}" width="285" height="25" rx="6" class="shelf"/>')
e.append(t(158, sv(500), "closed", "td"))
e.append(t(442, sv(780), "open shelves", "td"))
end = f'<svg viewBox="-260 -620 1000 1840" class="dwg narrow" role="img" aria-label="End elevation">{"".join(e)}</svg>'

# plan: top down, front at the bottom
p = [f'<rect x="0" y="0" width="1400" height="600" rx="150" class="stone"/>',
]
for x in (280, 700, 1120):
    p.append(f'<rect x="{x-120}" y="{360-80}" width="240" height="160" class="bronze"/><rect x="{x-110}" y="{360-18}" width="220" height="36" class="door"/><rect x="{x+3}" y="{360+18}" width="74" height="32" class="lockb"/>')
for x in (325, 450, 575, 700, 825, 950, 1075):
    p.append(f'<rect x="{x-43}" y="600" width="86" height="8" class="{"halop" if x == 700 else "sw"}"/>')
p.append(t(700, 200, "3 Lenovo locks on door panels", "td"))
p.append(t(700, 680, "FRONT EDGE · 6 SWITCHES + HALO", "tz"))
p.append(hdim(0, 1400, -70, "1,400"))
p.append(vdim(-60, 0, 600, "600"))
p.append('<path d="M1400 150 A150 150 0 0 0 1250 0" class="radius"/>')
p.append(t(1430, 80, "R150", "td", "start"))
plan = f'<svg viewBox="-260 -150 2080 870" class="dwg" role="img" aria-label="Plan from above: three locks on door panels on the top, with the switches on the front edge">{"".join(p)}</svg>'

html = open(sys.argv[1]).read()
html = html.replace("{{FRONT}}", front).replace("{{END}}", end).replace("{{PLAN}}", plan).replace("{{SCENE}}", open("table2.js").read())
open(sys.argv[2], "w").write(html)
print("ok", len(html))
