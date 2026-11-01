set -e
cd "$(dirname "$0")"
rm -rf rr && mkdir -p rr
R=/home/user/forstands/booth-16x7/table/renders
F() { node -e "const s=require('fs').readFileSync('table2.js','utf8');const m=s.match(new RegExp('$1: \\\\{ name: [^,]+, f: (\\\\{[^}]+\\\\})'));console.log(JSON.stringify(eval('('+m[1]+')')))"; }
node rt2.js rr/round day:hero,day:front,day:end,day:detail,day:top,day:locks,day:shelf,day:gold,night:hero,night:locks,colour:hero,colour:low,low:ball,high:ball 2400
SHELVES=0 node rt2.js rr/closed day:hero,day:front,day:end,night:hero,colour:hero 2400
FORM=rect node rt2.js rr/rect day:hero,day:top,day:front,day:end,day:shelf,night:hero 2400
FORM=rect SHELVES=0 node rt2.js rr/rect-closed day:hero 2400
FORM=round28 node rt2.js rr/round28 day:hero,day:front,day:end,day:top 2400
FORM=rect28 node rt2.js rr/rect28 day:hero,day:front,day:end,day:top 2400
FORM=round FINISH="$(F porcelain)" node rt2.js rr/finish-porcelain day:hero 2400
FORM=rect FINISH="$(F rosefade)" node rt2.js rr/finish-rosefade day:hero 2400
FORM=round FINISH="$(F midnight)" node rt2.js rr/finish-midnight day:hero 2400
FORM=round FINISH='{"top":"marble","gold":"champagne","body":"dusk","inner":"blush","base":"bronze","stands":"blushGold"}' node rt2.js rr/finish-dusk day:hero 2400
FORM=round28 FINISH="$(F sage)" node rt2.js rr/finish-sage day:hero 2400
FORM=rect28 FINISH="$(F navy)" node rt2.js rr/finish-navy day:hero 2400
FORM=round FINISH="$(F terracotta)" node rt2.js rr/finish-terracotta day:hero 2400
python3 - <<'PY'
from PIL import Image
import os, glob
R='/home/user/forstands/booth-16x7/table/renders/'
for d in sorted(os.listdir('rr')):
    for f in glob.glob('rr/'+d+'/*.png'):
        v=os.path.basename(f)[:-4]
        name = v if d=='round' else (d if d.startswith('finish-') else d+'-'+v)
        Image.open(f).convert('RGB').resize((1600,1000),Image.LANCZOS).save(R+name+'.jpg',quality=86,optimize=True)
print('installed', len(glob.glob('rr/*/*.png')))
PY
