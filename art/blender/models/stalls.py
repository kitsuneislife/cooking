# Fundo da feira: uma fileira de barracas vizinhas (toldo listrado de cada cor, balcão,
# montes de fruta e caixotes) e árvores redondas entre elas. Substitui as barracas pintadas
# no céu. Nas medidas do grupo da feira (src/three/sets.js), atrás da banca, no chão em -3,6.
import math
import random

import lib
import parts

VIEW = {"elev": 12, "azim": 0, "fill": 0.45}
G = -3.6   # chão
Z = -12.0  # fileira


def stall(x, color, fruits, rnd, n):
    hi = []
    wood = parts.wood("far", (("#c08048", 0), ("#d0965c", 0.5), ("#dcaa70", 1)))
    hi.append(lib.assign(lib.box(f"s{n}_counter", 7, 2.4, 2.4, at=(x, G + 1.2, Z), bevel=0.08), wood))
    hi.append(lib.assign(lib.box(f"s{n}_band", 7.1, 0.5, 0.1, at=(x, G + 1.9, Z + 1.22), bevel=0.04), parts.ceramic(color)))
    for dx in (-3.3, 3.3):
        for dz in (-1.0, 1.0):
            hi.append(lib.assign(lib.cylinder(f"s{n}_post{dx}{dz}", 0.1, 0.1, 5.6, 8, loc=lib.T(x + dx, G + 2.8, Z + dz)), wood))

    def roof(u, v):  # toldo inclinado para a frente, com barrado em arcos
        y = G + 5.6 - (v + 1.4) * 0.45
        if v > 1.2:
            y -= 0.22 * abs(math.sin(u * 2.2))
        return (x + u, y, Z + v)
    stripes = parts.M("roof" + color, lambda: lib.pattern_mat("toldo" + color, "stripes", color, "#fff6e3",
                                                               scale=1.6, axis="X", rough=0.75))
    hi.append(parts.fabric(f"s{n}_roof", 7.6, 2.8, 30, 6, roof, stripes, thick=0.05))
    for k, (c1, c2) in enumerate(fruits):  # três montes de fruta no balcão
        cx = x - 2.2 + k * 2.2
        fm = parts.M("fruit" + c1, lambda c1=c1, c2=c2: lib.ramp_mat(
            "fruta" + c1, [(0, c1), (1, c2)], rough=0.35, spec=0.5, coat=0.3, scale=3, bump=0.05))
        for i in range(11):
            a = rnd.uniform(0, math.tau)
            d = rnd.uniform(0, 0.7)
            r = 0.28
            y = G + 2.4 + r * 0.8 + (0.7 - d) * 0.6
            hi.append(lib.assign(lib.sphere(f"s{n}_f{k}_{i}", r, 12, 8, loc=lib.T(cx + math.cos(a) * d, y, Z + 0.3 + math.sin(a) * d * 0.6)), fm))
    return hi


def tree(x, z, s, n, rnd):
    leaf = parts.M("treeleaf", lambda: lib.ramp_mat(
        "copa", [(0, "#3f9a3a"), (0.5, "#5cb84a"), (1, "#8fd46a")], rough=0.8, spec=0.2, by="height", scale=3, bump=0.3))
    hi = [lib.assign(lib.cylinder(f"t{n}_trunk", 0.3 * s, 0.4 * s, 4 * s, 10, loc=lib.T(x, G + 2 * s, z)),
                     parts.wood("trunk", (("#7a4a2a", 0), ("#8f5a34", 0.5), ("#a06a40", 1))))]
    for i in range(6):
        a = i / 6 * math.tau
        b = lib.sphere(f"t{n}_c{i}", 1.4 * s, 16, 10, loc=lib.T(x + math.cos(a) * 1.0 * s, G + 5 * s + rnd.uniform(-0.3, 0.5) * s,
                                                                 z + math.sin(a) * 0.8 * s))
        hi.append(lib.assign(b, leaf))
    hi.append(lib.assign(lib.sphere(f"t{n}_top", 1.6 * s, 16, 10, loc=lib.T(x, G + 6.2 * s, z)), leaf))
    return hi


def build():
    rnd = random.Random(7)
    hi = []
    produce = [[("#ff8a1f", "#ffb347"), ("#e5352d", "#ff6b5a"), ("#7cc242", "#b5e06a")],
               [("#ffd23f", "#fff07a"), ("#7a3fa0", "#a868d0"), ("#e5352d", "#ff7a6a")],
               [("#4cae3a", "#8fd46a"), ("#ff9a1f", "#ffc060"), ("#c8352a", "#f06050")]]
    for n, (x, color) in enumerate([(-30, "#7a5cc8"), (-18, "#2a8199"), (-6, "#ff9a1f"), (6, "#4cbb5f"),
                                    (18, "#2a8199"), (30, "#ff9a1f")]):
        hi += stall(x, color, produce[n % 3], rnd, n)
    for n, (x, z, s) in enumerate([(-24, -14.5, 1.0), (-12, -15, 1.2), (0, -15.5, 1.1), (12, -15, 1.25), (24, -14.5, 1.0)]):
        hi += tree(x, z, s, n, rnd)
    return [{"name": "stalls", "high": hi, "tris": 12000, "size": 1024, "extrusion": 0.2, "samples": 32}]
