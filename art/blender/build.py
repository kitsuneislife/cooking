# Monta um modelo, assa o detalhe no low poly, exporta o .glb do jogo e renderiza a prévia.
# Uso: blender -b -P art/blender/build.py -- <modelo> <pasta das prévias>
# Saídas: public/models/<modelo>.glb, <pasta>/<modelo>_high.png, <modelo>.png e <modelo>.json
import importlib
import json
import os
import sys

import bpy

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
import lib  # noqa: E402

name, outdir = sys.argv[sys.argv.index("--") + 1:][:2]
os.makedirs(outdir, exist_ok=True)
lib.reset()
mod = importlib.import_module(f"models.{name}")
spec = mod.build()

high = [o for p in spec for o in p["high"]]
lib.studio(**getattr(mod, "VIEW", {}))  # VIEW no modelo troca o ângulo da câmera
lib.render(os.path.join(outdir, f"{name}_high.png"))
high_tris = lib.stats(high)

lows = []
for p in spec:
    if p.get("keep"):  # cor lisa, exporta como está
        lows += p["high"]
        continue
    low = lib.make_low(p["name"], p["high"], p["tris"], p.get("voxel"))
    lib.bake(p["high"], low, p.get("size", 1024), roughness=p.get("roughness", True))
    lows.append(low)

glb = os.path.join(ROOT, "..", "..", "public", "models", f"{name}.glb")
os.makedirs(os.path.dirname(glb), exist_ok=True)
size = lib.export_glb(lows, glb)
lib.render(os.path.join(outdir, f"{name}.png"))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(outdir, f"{name}.blend"))
info = {"model": name, "high_tris": high_tris, "game_tris": lib.stats(lows), "glb_kb": round(size / 1024)}
with open(os.path.join(outdir, f"{name}.json"), "w") as f:
    json.dump(info, f)
print("RESULT", json.dumps(info))
