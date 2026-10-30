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
SH = [60, 355, 650, 933]
def rr(x, y, w, h, r, cls):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" class="{cls}"/>'

# front elevation
f = []
f.append(f'<rect x="-60" y="{H}" width="1520" height="10" class="floor"/>')
f.append(f'<rect x="90" y="{sv(60)}" width="1220" height="58" class="bronze"/>')
f.append(f'<rect x="100" y="{sv(48)}" width="1200" height="5" class="led"/>')
f.append(f'<rect x="320" y="{sv(958)}" width="760" height="898" class="lam"/>')
f.append(t(700, sv(560), "MAXSEN", "word"))
for x0, x1 in ((30, 320), (1080, 1370)):
    for h in SH:
        th = 27 if h in (60, 933) else 25
        f.append(f'<rect x="{x0}" y="{sv(h+th)}" width="{x1-x0}" height="{th}" class="shelf"/>')
    for px in ((x0 + 50) if x0 < 300 else (x1 - 50),):
        f.append(f'<rect x="{px-8}" y="{sv(958)}" width="16" height="898" class="bronze"/>')
f.append(f'<rect x="0" y="{sv(1000)}" width="1400" height="40" rx="6" class="stone"/>')
f.append(f'<rect x="40" y="{sv(960)+2}" width="1320" height="5" class="led"/>')
f.append(hdim(0, 1400, -70, "1,400"))
f.append(hdim(320, 1080, H + 90, "760 closed centre", ty=H + 150))
f.append(hdim(30, 320, H + 90, "290 shelves", ty=H + 150))
f.append(hdim(1080, 1370, H + 90, "290 shelves", ty=H + 150))
f.append(vdim(-60, 0, H, "1,000"))
f.append(vdim(1460, sv(1000), sv(960), "40 top", "right"))
f.append(vdim(1460, sv(60), H, "60 base", "right"))
for h in (355, 650):
    f.append(t(1460, sv(h) + 10, f"shelf {h}", "td", "start"))
front = f'<svg viewBox="-260 -150 1960 1370" class="dwg" role="img" aria-label="Front elevation with dimensions">{"".join(f)}</svg>'

# end elevation
e = []
e.append(f'<rect x="-60" y="{H}" width="720" height="10" class="floor"/>')
e.append(f'<rect x="90" y="{sv(60)}" width="420" height="58" class="bronze"/>')
e.append(f'<rect x="100" y="{sv(48)}" width="400" height="5" class="led"/>')
e.append(f'<rect x="30" y="{sv(958)}" width="540" height="898" class="lamback"/>')
for h in SH:
    th = 27 if h in (60, 933) else 25
    e.append(f'<rect x="30" y="{sv(h+th)}" width="540" height="{th}" rx="4" class="shelf"/>')
for px in (80, 520):
    e.append(f'<rect x="{px-8}" y="{sv(958)}" width="16" height="898" class="bronze"/>')
e.append(f'<rect x="0" y="{sv(1000)}" width="600" height="40" rx="6" class="stone"/>')
e.append(f'<rect x="40" y="{sv(960)+2}" width="520" height="5" class="led"/>')
e.append(hdim(0, 600, -70, "600 (to confirm)"))
e.append(hdim(30, 570, H + 90, "540 body", ty=H + 150))
e.append(vdim(-60, 0, H, "1,000"))
end = f'<svg viewBox="-260 -150 1000 1370" class="dwg narrow" role="img" aria-label="End elevation, showing the open shelves">{"".join(e)}</svg>'

# plan
p = []
p.append(rr(0, 0, 1400, 600, 150, "stone"))
p.append(rr(30, 30, 1340, 540, 120, "outline"))
p.append(f'<rect x="320" y="30" width="760" height="540" class="lamplan"/>')
for px, pz in ((80, 80), (80, 520), (1320, 80), (1320, 520)):
    p.append(f'<circle cx="{px}" cy="{pz}" r="10" class="bronze"/>')
p.append(t(700, 315, "closed centre", "td"))
p.append(t(175, 315, "shelves", "td")); p.append(t(1225, 315, "shelves", "td"))
p.append(t(700, 660, "FRONT", "tz"))
p.append(hdim(0, 1400, -70, "1,400"))
p.append(vdim(-60, 0, 600, "600"))
p.append('<path d="M1400 150 A150 150 0 0 0 1250 0" class="radius"/>')
p.append(t(1430, 70, "R150", "td", "start"))
plan = f'<svg viewBox="-260 -150 1960 870" class="dwg" role="img" aria-label="Plan from above, with the 150 mm corner radius">{"".join(p)}</svg>'

html = open(sys.argv[1]).read()
html = html.replace("{{FRONT}}", front).replace("{{END}}", end).replace("{{PLAN}}", plan).replace("{{SCENE}}", open("table.js").read())
open(sys.argv[2], "w").write(html)
print("ok", len(html))
