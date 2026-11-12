# Receita 8, carne com brócolis no wok, pronta no prato: arroz branco de um lado e o refogado
# brilhante de molho do outro. Referência: Meat and Vegetable Stir-Fry (cook-soundtrack).
# Lição da leva 1: as peças só existem no modelo detalhado; no jogo vira um monte simples com
# tudo assado na textura, como a foto pintada da referência.
import math

import bmesh

import lib
import parts


def beef_mat():
    return parts.M("beef", lambda: lib.ramp_mat(
        "carne_selada", [(0, "#3e1a0c"), (0.35, "#6a3218"), (0.7, "#93522c"), (1, "#b27045")],
        rough=0.22, spec=0.6, scale=7, bump=0.35, bump_scale=25, coat=0.5))


def beef_strip(name, rnd, L=0.56, W=0.19):
    """Tira de contrafilé: fita fina que enrola e torce, borda irregular, brilho de molho."""
    bm = bmesh.new()
    nu, nv = 12, 3
    vs = []
    curl, twist = rnd.uniform(0.6, 1.4), rnd.uniform(-0.6, 0.6)
    for i in range(nu + 1):
        t = i / nu - 0.5
        a = t * curl * math.pi
        row = []
        for j in range(nv + 1):
            s = (j / nv - 0.5) * W * (1 - 0.35 * (2 * t) ** 4)
            x, z = math.sin(a) * L / (curl * math.pi), (1 - math.cos(a)) * L / (curl * math.pi)
            row.append(bm.verts.new((x, s * math.cos(twist * t * 2), z + s * math.sin(twist * t * 2))))
        vs.append(row)
    for i in range(nu):
        for j in range(nv):
            bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]))
    o = lib.from_bmesh(name, bm)
    o.modifiers.new("sol", "SOLIDIFY").thickness = 0.035
    lib.subsurf(o, 1)
    return lib.assign(o, beef_mat())


def build():
    high = []
    plate = parts.plate(1.7)
    cloth = parts.cloth(4.4, ("#7cc6f2", "#ffffff"), seed=2)

    rice_m = parts.M("rice", lambda: lib.ramp_mat(
        "arroz", [(0, "#e9e2cf"), (1, "#ffffff")], rough=0.45, spec=0.4, scale=12, bump=0.1, sss=0.3))
    rc = (-0.55, 0.35, 0.05)
    rice_gap = parts.M("ricegap", lambda: lib.mat("vao_arroz", "#e8dfc8", rough=0.6))
    rice = [parts.dome("rice_base", 0.6, 0.4, rc, rice_gap)]
    for i, (loc, nrm, rnd) in enumerate(parts.on_dome(480, 0.66, 0.44, rc, seed=5, depth=(0.94, 1.02))):
        g = lib.sphere(f"grain{i}", 0.05, 8, 5, scale=(1, 0.42, 0.38))
        rice.append(parts.place(lib.assign(g, rice_m), loc, nrm, rnd.uniform(0, math.tau)))

    sauce = lib.cylinder("sauce", 0.95, 0.9, 0.02, 40, loc=(0.25, -0.15, 0.06))
    lib.displace(sauce, 0.08, 2.5, seed=4, axis=0)
    lib.assign(sauce, parts.M("sauce", lambda: lib.mat("molho", "#5a2810", rough=0.08, spec=0.7, coat=1)))
    fc = (0.3, -0.2, 0.05)
    filler = parts.M("filler", lambda: lib.mat("fundo", "#3a1a0a", rough=0.3))
    food = [sauce, parts.dome("filler", 0.72, 0.36, fc, filler)]
    for i, (loc, nrm, rnd) in enumerate(parts.on_dome(46, 0.82, 0.5, fc, seed=8, depth=(0.8, 1.0))):
        food.append(parts.place(beef_strip(f"beef{i}", rnd), loc, nrm, rnd.uniform(0, math.tau)))
    for i, (loc, nrm, rnd) in enumerate(parts.on_dome(12, 0.78, 0.55, fc, seed=21, depth=(0.9, 1.0))):
        for o in parts.floret(0.17, (0, 0, 0), seed=40 + i, stem=0.1):
            food.append(parts.place(o, loc, nrm, rnd.uniform(0, math.tau)))
    onion_m = parts.M("scallion", lambda: lib.mat("cebolinha", "#5fb83a", rough=0.3))
    seed_m = parts.M("sesame", lambda: lib.mat("gergelim", "#f4e3b5", rough=0.5))
    for i, (loc, nrm, rnd) in enumerate(parts.on_dome(14, 0.8, 0.56, fc, seed=33, depth=(1.0, 1.05))):
        ring = lib.cylinder(f"onion{i}", 0.05, 0.05, 0.03, 12, caps=False)
        ring.modifiers.new("sol", "SOLIDIFY").thickness = 0.012
        food.append(parts.place(lib.assign(ring, onion_m), loc, nrm, 0))
    for i, (loc, nrm, rnd) in enumerate(parts.on_dome(60, 0.8, 0.56, fc, seed=34, depth=(1.02, 1.06))):
        s = lib.sphere(f"sesame{i}", 0.018, 8, 4, scale=(1.5, 1, 0.5))
        food.append(parts.place(lib.assign(s, seed_m), loc, nrm, rnd.uniform(0, math.tau)))

    return [
        {"name": "stirfry_plate", "high": plate, "keep": True},
        {"name": "stirfry_cloth", "high": [cloth], "tris": 1200, "size": 512, "roughness": False},
        {"name": "stirfry_rice", "high": rice, "tris": 1500, "voxel": 0.02, "size": 512},
        {"name": "stirfry_food", "high": food, "tris": 5000, "voxel": 0.018, "size": 1024},
    ]
