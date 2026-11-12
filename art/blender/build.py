# Monta um modelo, assa o detalhe no low poly, exporta o .glb do jogo e renderiza a prévia.
# Uso: blender -b -P art/blender/build.py -- <modelo> <pasta das prévias>
# Saídas: public/models/<modelo>.glb, <pasta>/<modelo>_high.png, <modelo>.png e <modelo>.json
import importlib
import json
import os
import sys

import bpy
from mathutils import Matrix

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

lows, moves = [], []
for p in spec:
    if p.get("keep"):  # cor lisa, exporta como está
        lows += p["high"]
        continue
    # "low" pronto (placa com UV que repete no jogo) ou o casco simplificado do high
    low = p.get("low") or lib.make_low(p["name"], p["high"], p["tris"], p.get("voxel"))
    low.hide_render = False
    lib.bake(p["high"], low, p.get("size", 1024), roughness=p.get("roughness", True),
             extrusion=p.get("extrusion", 0.04), unwrap="low" not in p, samples=p.get("samples", 16))
    lows.append(low)
    # o nó do .glb leva o nome da peça: se uma peça do high já tem esse nome, o Blender daria
    # "spice.001" ao low (e o jogo veria "spice001")
    clash = bpy.data.objects.get(p["name"])
    if clash and clash is not low:
        clash.name = p["name"] + "_high"
    low.name = p["name"]
    if "origin" in p:
        moves.append((low, p["origin"]))
lib.render(os.path.join(outdir, f"{name}.png"))

for low, origin in moves:  # peça do cenário: o nó nasce na origem, e o jogo posiciona
    low.data.transform(Matrix.Translation(-lib.T(*origin)))

glb = os.path.join(ROOT, "..", "..", "public", "models", f"{name}.glb")
os.makedirs(os.path.dirname(glb), exist_ok=True)
size = lib.export_glb(lows, glb)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(outdir, f"{name}.blend"))
info = {"model": name, "high_tris": high_tris, "game_tris": lib.stats(lows), "glb_kb": round(size / 1024)}
with open(os.path.join(outdir, f"{name}.json"), "w") as f:
    json.dump(info, f)
print("RESULT", json.dumps(info))
