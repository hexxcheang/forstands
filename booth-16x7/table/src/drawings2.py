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
     f'<rect x="15" y="{sv(900)}" width="1370" height="840" rx="10" class="body"/>',
     f'<rect x="35" y="{sv(880)}" width="1330" height="780" class="inner"/>']
for x in (370, 1030):
    f.append(f'<rect x="{x-15}" y="{sv(900)}" width="30" height="840" class="body"/>')
f.append(f'<rect x="15" y="{sv(100)}" width="1370" height="40" class="body"/>')
f.append(f'<rect x="385" y="{sv(900)}" width="630" height="840" class="body"/>')
f.append(f'<polygon points="700,{sv(735)} 750,{sv(706)} 750,{sv(648)} 700,{sv(619)} 650,{sv(648)} 650,{sv(706)}" class="logo"/>')
f.append(t(700, sv(485), "MAXSEN", "wordlit"))
for h in SH:
    f.append(f'<rect x="35" y="{sv(h+12)}" width="320" height="25" class="shelf"/>')
    f.append(f'<rect x="1045" y="{sv(h+12)}" width="340" height="25" rx="6" class="shelf"/>')
f.append(f'<rect x="0" y="{sv(1000)}" width="1400" height="100" rx="24" class="stone"/>')
f.append(f'<rect x="25" y="{sv(900)+2}" width="1350" height="5" class="led"/>')
f.append(hdim(0, 1400, -70, "1,400"))
f.append(hdim(15, 370, H + 90, "355 shelves", ty=H + 150))
f.append(hdim(370, 1030, H + 90, "660 closed, lit logo", ty=H + 150))
f.append(hdim(1030, 1385, H + 90, "355 curved shelves", ty=H + 150))
f.append(vdim(-60, 0, H, "1,000"))
f.append(vdim(1460, sv(1000), sv(900), "100 top", "right"))
f.append(vdim(1460, sv(60), H, "60 base", "right"))
for h in SH:
    f.append(t(1460, sv(h) + 12, f"shelf {h}", "td", "start"))
front = f'<svg viewBox="-260 -150 2080 1370" class="dwg" role="img" aria-label="Front elevation with dimensions">{"".join(f)}</svg>'

# end: z from 0 (back) to 600 (front)
e = [f'<rect x="-60" y="{H}" width="720" height="10" class="floor"/>',
     f'<rect x="65" y="{sv(60)}" width="470" height="58" rx="20" class="bronze"/>',
     f'<rect x="75" y="{sv(48)}" width="450" height="5" class="led"/>',
     f'<rect x="15" y="{sv(900)}" width="570" height="840" rx="10" class="body"/>',
     f'<rect x="0" y="{sv(1000)}" width="600" height="100" rx="24" class="stone"/>',
     f'<rect x="25" y="{sv(900)+2}" width="550" height="5" class="led"/>']
e.append(hdim(0, 600, -70, "600 (to confirm)"))
e.append(vdim(-60, 0, H, "1,000"))
e.append(t(300, sv(500), "LEFT END", "tz"))
end = f'<svg viewBox="-260 -150 1000 1370" class="dwg narrow" role="img" aria-label="End elevation">{"".join(e)}</svg>'

# plan: top down, front at the bottom
p = [f'<rect x="0" y="0" width="1400" height="600" rx="150" class="stone"/>',
     f'<rect x="100" y="225" width="1200" height="150" class="oak"/>']
for i, x in enumerate((260, 480, 700, 920, 1140)):
    p.append(f'<rect x="{x-43}" y="{(375+600)/2-43:.0f}" width="86" height="86" rx="6" class="sw"/>')
p.append(t(700, 315, "150 oak strip, down the middle", "tdw"))
p.append(t(700, 640 + 20, "FRONT · SWITCH ROW", "tz"))
p.append(hdim(0, 1400, -70, "1,400"))
p.append(vdim(-60, 0, 600, "600"))
p.append(vdim(1460, 225, 375, "150", "right"))
p.append('<path d="M1400 150 A150 150 0 0 0 1250 0" class="radius"/>')
p.append(t(1430, 80, "R150", "td", "start"))
plan = f'<svg viewBox="-260 -150 2080 870" class="dwg" role="img" aria-label="Plan from above: the 150 mm oak strip down the middle of the top, with five switches set in front of it">{"".join(p)}</svg>'

html = open(sys.argv[1]).read()
html = html.replace("{{FRONT}}", front).replace("{{END}}", end).replace("{{PLAN}}", plan).replace("{{SCENE}}", open("table2.js").read())
open(sys.argv[2], "w").write(html)
print("ok", len(html))
