# Manga da feira: inteira com o rubor vermelho no ombro e amarelo-esverdeado na ponta, e uma
# banda cortada em "porco-espinho" (cubinhos saltados), o jeito mais apetitoso de mostrar a polpa.
# Referência: frutas da Fruit Salad e do Smoothie.
import math
import random

import bmesh

import lib
import parts

VIEW = {"elev": 38}


def skin():
    return parts.M("mangoskin", lambda: lib.ramp_mat(
        "casca_manga", [(0.0, "#a9b83a"), (0.35, "#f2b233"), (0.62, "#f07a2a"), (0.85, "#d8402f"),
                        (1, "#b8303a")], rough=0.32, spec=0.55, by="height", axis="Y", scale=3,
        bump=0.12, bump_scale=70, coat=0.15))


def flesh():
    return parts.M("mangoflesh", lambda: lib.ramp_mat(
        "polpa_manga", [(0, "#ff9a12"), (0.6, "#ffb52a"), (1, "#ffc94a")], rough=0.18, spec=0.6,
        scale=6, bump=0.15, bump_scale=30, sss=0.35))


def build():
    rnd = random.Random(4)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=5, radius=0.5)
    for v in bm.verts:  # rim de manga: comprida, barriga de um lado, bico do outro
        x, y, z = v.co
        v.co = (x * 0.8 + 0.08 * (y / 0.5) ** 2, y * 1.25 + 0.05 * max(0, x / 0.5), z * 0.72)
    whole = lib.assign(lib.from_bmesh("mango", bm), skin())
    lib.displace(whole, 0.012, 3, seed=2)
    whole.location = (-0.45, 0.2, 0.36)
    whole.rotation_euler = (0, 0, 0.35)
    stem = lib.cylinder("mango_stem", 0.03, 0.022, 0.08, 10, loc=(-0.62, 0.82, 0.38))
    stem.rotation_euler = (math.radians(-70), 0, 0.35)
    lib.assign(stem, parts.M("woodstem", lambda: lib.mat("cabinho", "#5a3d1e", rough=0.8)))

    # banda cortada: casca em concha embaixo, cubinhos de polpa em grade saltando para fora
    cheek = lib.sphere("cheek_skin", 0.5, 40, 20, scale=(0.75, 1.15, 0.38))
    bm = bmesh.new()
    bm.from_mesh(cheek.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > 0.001], context="VERTS")
    bm.to_mesh(cheek.data)
    bm.free()
    sol = cheek.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = 0.03
    lib.assign(cheek, skin())
    cheek.location = (0.55, -0.15, 0.2)
    cubes = [cheek]
    for i in range(-2, 3):
        for j in range(-3, 4):
            u, w = i * 0.135, j * 0.135
            if (u / 0.36) ** 2 + (w / 0.56) ** 2 > 1:
                continue
            c = lib.cylinder(f"cube{i}_{j}", 0.085, 0.085, 0.16, 4)  # prisma quadrado
            bev = c.modifiers.new("bev", "BEVEL")
            bev.width, bev.segments = 0.025, 3
            lib.subsurf(c, 1)
            lean = 0.55  # a casca virada do avesso abre os cubos em leque
            c.rotation_euler = (-w * lean * 2, u * lean * 2, math.pi / 4 + rnd.uniform(-0.08, 0.08))
            c.location = (0.55 + u * 1.15, -0.15 + w * 1.12, 0.26 - 0.25 * (u * u + w * w))
            cubes.append(lib.assign(c, flesh()))
    return [
        {"name": "mango", "high": [whole, stem], "tris": 1600, "size": 512},
        {"name": "mango_cheek", "high": cubes, "tris": 2600, "voxel": 0.012, "size": 512},
    ]
