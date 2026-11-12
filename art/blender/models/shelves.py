# Prateleiras da parede da cozinha, já nas posições do jogo (src/three/sets.js): a despensa
# (potes, tigelas, livros e hera), o escorredor de pratos com a fruteira, os potes de tempero
# acima da grelha e o bar (canecas, garrafas, potes e um limoeiro). Cada grupo é uma malha
# com a sua textura assada, e o jogo põe o .glb inteiro na origem da cozinha.
# Referência: prateleiras de parede com potes e plantinhas do vídeo (inferência dos quadros).
import math
import random

import lib
import parts

VIEW = {"elev": 12, "azim": 0, "fill": 0.5}
Z = -2.6  # meio da prateleira; a parede fica em -3,2


def shelf(x, y, w, name):
    """Tábua de madeira mel com duas mãos-francesas brancas."""
    out = [lib.assign(lib.box(name, w, 0.2, 1.1, at=(x, y, Z), bevel=0.05, seg=3), parts.wood())]
    cream = parts.ceramic("#fff6ec")
    for dx in (-w / 2 + 0.6, w / 2 - 0.6):
        out.append(lib.assign(lib.box(f"{name}_wall{dx}", 0.14, 0.75, 0.1, at=(x + dx, y - 0.45, -3.13), bevel=0.03), cream))
        arm = lib.box(f"{name}_arm{dx}", 0.12, 0.1, 0.95, at=(x + dx, y - 0.16, Z - 0.05), bevel=0.03)
        brace = lib.box(f"{name}_brace{dx}", 0.1, 0.1, 0.95, at=(x + dx, y - 0.42, -2.82), bevel=0.03)
        brace.rotation_euler.x = math.radians(-40)
        out += [lib.assign(arm, cream), lib.assign(brace, cream)]
    return out


def pantry():
    hi = shelf(-8, 5.2, 5.5, "pantry1") + shelf(-8, 7.3, 5.5, "pantry2")
    for i, (h, lid) in enumerate([(1.1, "#f483a6"), (0.9, "#7fd3bd"), (1.3, "#ffd23f"), (0.8, "#b9a4f0")]):
        hi += parts.canister((-10 + i * 1.15, 5.3, -2.55), 0.4, h, "#fffaf2", lid, f"can{i}")
    hi += parts.bowl_stack((-6.4, 7.42, -2.55), ["#ef6b4a", "#ffd23f", "#7fc6c0", "#fff6e3"])
    hi += parts.book((-8.9, 8.15, -2.6), 0.35, 1.5, 1.1, "#e5484d", tilt=0.12, name="book1")
    hi += parts.book((-9.3, 8.05, -2.6), 0.3, 1.3, 1.0, "#2a8199", name="book2")
    hi += parts.book((-7.95, 7.95, -2.6), 0.28, 1.1, 0.95, "#ffd23f", tilt=-0.35, name="book3")
    hi += parts.pot_plant((-10.2, 7.4, -2.55), 0.75, "#fff6e3", ("#2b7a30", "#5fbf4a"), 16, 21, "ivy")
    return hi


def plates():
    hi = shelf(11, 5.6, 5, "rack")
    for i in range(5):
        hi += parts.standing_plate((9.0 + i * 0.3, 6.33, -2.55), 0.6, 0.22, f"dish{i}")
    for x in (8.7, 10.5):  # trilho do escorredor
        hi.append(lib.assign(lib.box(f"rackrail{x}", 0.08, 0.35, 0.9, at=(x, 5.88, -2.55), bevel=0.03), parts.ceramic("#fff6ec")))
    bowl = lib.lathe("fruitbowl", [(0, 0), (0.35, 0), (0.77, 0.35), (0.8, 0.37), (0.74, 0.37), (0.33, 0.04), (0, 0.04)], 40)
    bowl.location = lib.T(12.4, 5.72, -2.5)
    hi.append(lib.assign(bowl, parts.ceramic("#7fc6c0")))
    rnd = random.Random(4)
    for i in range(5):  # limões amontoados, a ponta de cada um para um lado
        lm = lib.sphere(f"lemon{i}", 0.22, 24, 14, scale=(1.3, 1, 1))
        lm.rotation_euler.z = rnd.uniform(0, math.tau)
        a = i * 1.3
        lm.location = lib.T(12.4 + math.cos(a) * 0.32, 6.0 + (0.2 if i == 4 else 0), -2.5 + math.sin(a) * 0.26)
        hi.append(lib.assign(lm, parts.M("lemon", lambda: lib.ramp_mat(
            "limao_siciliano", [(0, "#f5c21b"), (0.6, "#ffd93f"), (1, "#fff07a")], rough=0.35, spec=0.5,
            coat=0.3, scale=4, bump=0.3, bump_scale=90))))
    return hi


def spice():
    hi = shelf(18.5, 6.2, 4.5, "spice")
    for i, (h, lid) in enumerate([(1.0, "#ffd23f"), (0.85, "#7fc6c0"), (1.1, "#ef6b4a")]):
        hi += parts.canister((17.3 + i * 1.2, 6.3, -2.55), 0.38, h, "#fffaf2", lid, f"spice{i}")
    return hi


def bar():
    hi = shelf(35, 5.4, 7, "bar1") + shelf(35, 7.5, 7, "bar2")
    for i, c in enumerate(["#f7a9bf", "#9be3c6", "#ffe08a", "#c9b8f2"]):
        hi += parts.mug((32.4 + i * 0.8, 5.5, -2.5), c, f"mug{i}", turn=0.5)
    for i, c in enumerate(["#2f7a44", "#c8352a", "#e8b060", "#3f8fd0", "#7a5cc8"]):
        hi += parts.bottle((36.2 + i * 0.6, 5.5, -2.55 + (i % 2) * 0.12), c, f"bottle{i}")
    for i, (h, lid) in enumerate([(1.0, "#f483a6"), (0.8, "#7a4a2a"), (1.2, "#7fd3bd"), (0.9, "#ef6b4a")]):
        hi += parts.canister((32.6 + i * 1.2, 7.6, -2.55), 0.38, h, "#fffaf2", lid, f"barcan{i}")
    hi += parts.pot_plant((37.8, 7.6, -2.55), 0.8, "#ef6b4a", ("#2b7a30", "#4fae3f"), 18, 31, "lemontree", fruit=4)
    return hi


def build():
    common = {"tris": 5000, "size": 512, "extrusion": 0.03, "samples": 48}
    return [{"name": n, "high": f(), **common} for n, f in
            (("pantry", pantry), ("plates", plates), ("spice", spice), ("bar", bar))]
