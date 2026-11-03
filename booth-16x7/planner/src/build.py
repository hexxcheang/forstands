import sys
# the sample board, drawn to scale (1 unit = 1 mm): a side view and a face view
def t(x, y, s, anchor="middle"): return f'<text x="{x}" y="{y}" text-anchor="{anchor}">{s}</text>'
def vdim(x, y1, y2, label, side="left"):
    tx = x - 18 if side == "left" else x + 18
    return (f'<g class="dim"><line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}"/><line x1="{x-16}" y1="{y1}" x2="{x+16}" y2="{y1}"/><line x1="{x-16}" y1="{y2}" x2="{x+16}" y2="{y2}"/></g>'
            + t(tx, (y1 + y2) / 2 + 12, label, "end" if side == "left" else "start"))
def hdim(x1, x2, y, label):
    return (f'<g class="dim"><line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}"/><line x1="{x1}" y1="{y-16}" x2="{x1}" y2="{y+16}"/><line x1="{x2}" y1="{y-16}" x2="{x2}" y2="{y+16}"/></g>'
            + t((x1 + x2) / 2, y + 50, label))
H, BH, BD, T = 1200, 220, 450, 30
sv = lambda h: H - h
side = [f'<rect x="-60" y="{H}" width="570" height="8" class="flr"/>',
        f'<polygon points="0,{H} {BD},{H} {BD/2+30},{sv(BH)} {BD/2-30},{sv(BH)}" class="bas"/>',
        f'<rect x="{BD/2 - T/2}" y="0" width="{T}" height="{H - BH + 40}" class="pnl"/>',
        f'<rect x="{BD/2 - T/2 - 3}" y="-12" width="{T + 6}" height="12" class="cap"/>',
        f'<rect x="{BD/2 + T/2}" y="{sv(940)}" width="8" height="86" class="smp"/><rect x="{BD/2 - T/2 - 8}" y="{sv(940)}" width="8" height="86" class="smp"/>',
        vdim(-30, 0, H, "1,200"), vdim(BD + 30, sv(BH), H, "220", "right"), hdim(0, BD, H + 40, "450 base, front to back"),
        t(BD / 2 + 70, sv(600), "30 board", "start")]
side_svg = f'<svg viewBox="-200 -60 760 1360" class="dwg" role="img" aria-label="Side of the sample board: a 30 mm board 1,200 tall, on a triangular base 450 front to back and 220 high">{"".join(side)}</svg>'
W = 1000
face = [f'<rect x="-60" y="{H}" width="{W + 120}" height="8" class="flr"/>',
        f'<rect x="0" y="{sv(BH)}" width="{W}" height="{BH}" class="bas"/>',
        f'<rect x="0" y="0" width="{W}" height="{H - BH}" class="pnl"/>',
        f'<rect x="-3" y="-12" width="{W + 6}" height="12" class="cap"/>',
        t(W / 2, 140, "LUSANO"), t(W / 2, 185, "brand header")]
cols = 7
for r in range(4):
    for k in range(cols):
        x = W / 2 - (cols - 1) * 60 + k * 120
        face.append(f'<rect x="{x-43}" y="{sv(900 + 43 - r * 135) }" width="86" height="86" rx="3" class="smp"/>')
face += [hdim(0, W, H + 40, "1,000"), vdim(-30, 0, H, "1,200")]
face_svg = f'<svg viewBox="-200 -60 1320 1360" class="dwg" role="img" aria-label="Face of a 1,000 mm sample board: a brand header and four rows of seven switch samples above the base">{"".join(face)}</svg>'

html = open(sys.argv[1]).read()
html = html.replace("{{SIDE}}", side_svg).replace("{{FACE}}", face_svg).replace("{{PLANNER}}", open("planner.js").read()).replace("{{PAGE}}", open("page.js").read())
open(sys.argv[2], "w").write(html)
print("ok", len(html))
