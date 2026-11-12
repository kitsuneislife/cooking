# Receita 23, tiramisù: fatia quadrada com camadas de biscoito molhado no café e creme de
# mascarpone, cacau por cima e escorrendo no prato, roseta de creme, hortelã e grãos de café.
# Referência: Chocolate Mousse e Panna Cotta (cook-soundtrack).
import math

import bmesh

import lib
import parts


def slab(name, w, d, h, z, m, seed, wobble=0.02):
    """Camada da fatia: bloco de canto arredondado, borda torta (nada é perfeito)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    o = lib.from_bmesh(name, bm, smooth=False)
    o.scale = (w, d, h)
    bev = o.modifiers.new("bev", "BEVEL")
    bev.width, bev.segments = 0.03, 3
    lib.subsurf(o, 2)
    lib.apply_all(o)
    o.scale = (1, 1, 1)
    for v in o.data.vertices:
        v.co.x *= w
        v.co.y *= d
        v.co.z *= h
    o.data.shade_smooth()
    lib.displace(o, wobble, 3, seed)
    o.location.z = z + h / 2
    return lib.assign(o, m)


def build():
    plate = parts.plate(1.25)
    cloth = parts.cloth(3.4, ("#c9a3e6", "#ffffff"), seed=4)
    sponge = parts.M("sponge", lambda: lib.ramp_mat(
        "biscoito_cafe", [(0, "#5e3518"), (0.5, "#8a5428"), (1, "#b5803f")], rough=0.85, spec=0.2,
        scale=14, bump=0.6, cells=60))
    cream = parts.M("mascarpone", lambda: lib.ramp_mat(
        "mascarpone", [(0, "#f1e2c4"), (1, "#fbf3e2")], rough=0.45, spec=0.35, scale=6,
        bump=0.08, sss=0.3))
    cocoa = parts.M("cocoa", lambda: lib.ramp_mat(
        "cacau", [(0, "#3a1d0e"), (0.6, "#5a301a"), (1, "#7a4426")], rough=1.0, spec=0.1,
        scale=20, bump=0.5, bump_scale=120))

    w, d = 0.95, 0.75
    z = 0.06
    food = []
    for i, (h, m) in enumerate([(0.17, sponge), (0.13, cream), (0.16, sponge), (0.15, cream)]):
        food.append(slab(f"layer{i}", w - i * 0.01, d - i * 0.01, h, z, m, seed=i))
        z += h - 0.01
    food.append(slab("cocoa_top", w - 0.04, d - 0.04, 0.035, z - 0.012, cocoa, seed=9, wobble=0.012))
    top = z + 0.02

    # cacau que caiu no prato, poeira irregular ao redor da fatia
    dust = lib.cylinder("dust", 0.66, 0.66, 0.004, 48, loc=(0.05, -0.05, 0.06))
    lib.displace(dust, 0.12, 3.0, seed=12, axis=0)
    lib.displace(dust, 0.12, 3.0, seed=13, axis=1)
    food.append(lib.assign(dust, cocoa))

    ros = parts.rosette(0.16, 0.24, name="rosette")
    ros.location = (0.2, 0.12, top)
    food.append(ros)
    for i, (rz, off) in enumerate([(0.4, (-0.02, 0.02)), (2.2, (0.04, -0.02))]):
        lf = parts.leaf(0.2, ("#3caa48", "#62c456"), f"mint{i}", cup=0.2)
        lf.rotation_euler = (0.5, 0, rz)
        lf.location = (0.22 + off[0], 0.14 + off[1], top + 0.2)
        food.append(lf)
    bean_m = parts.M("bean", lambda: lib.mat("grao_cafe", "#3b1f10", rough=0.25, spec=0.6, coat=0.5))
    # grãos no prato, não em cima: dois pontos escuros na fatia viram olhinhos
    for i, (x, y, rz) in enumerate([(-0.62, -0.62, 0.4), (-0.45, -0.72, 1.6)]):
        b = lib.sphere(f"bean{i}", 0.06, 16, 8, scale=(1, 0.75, 0.55))
        b.location, b.rotation_euler.z = (x, y, 0.09), rz
        food.append(lib.assign(b, bean_m))
    return [
        {"name": "tiramisu_plate", "high": plate, "keep": True},
        {"name": "tiramisu_cloth", "high": [cloth], "tris": 1200, "size": 512, "roughness": False},
        {"name": "tiramisu_food", "high": food, "tris": 4000, "voxel": 0.012, "size": 1024},
    ]
