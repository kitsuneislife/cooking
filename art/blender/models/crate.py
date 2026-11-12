# Caixote de feira de ripas, com fresta entre as tábuas e quina de reforço. Medidas do
# caixote mais comum da banca (src/three/sets.js, stall): o jogo estica a largura para o
# tamanho da lista. A origem é o meio do fundo; o papel colorido continua no jogo.
import lib
import parts

W, D = 2.33, 1.3
VIEW = {"elev": 35, "azim": -25}


def build():
    pine = parts.wood("pine", (("#d9a466", 0), ("#e8bc80", 0.5), ("#f2cc94", 1)))
    dark = parts.wood("pinedark", (("#c48c52", 0), ("#d6a066", 0.5), ("#e2b47a", 1)))
    hi = []
    for i in range(3):  # fundo de três ripas
        hi.append(lib.assign(lib.box(f"floor{i}", W, 0.08, D / 3 - 0.04, at=(0, 0.04, -D / 2 + D / 3 * (i + 0.5)), bevel=0.02), pine))
    hi.append(lib.assign(lib.box("front", W - 0.2, 0.2, 0.08, at=(0, 0.17, D / 2 - 0.04), bevel=0.025), pine))
    for y in (0.17, 0.45):  # fundo alto de duas ripas
        hi.append(lib.assign(lib.box(f"back{y}", W - 0.2, 0.2, 0.08, at=(0, y, -D / 2 + 0.04), bevel=0.025), pine))
    for s in (-1, 1):
        x = s * (W / 2 - 0.04)
        for y in (0.15, 0.37):  # laterais com fresta
            hi.append(lib.assign(lib.box(f"side{s}{y}", 0.08, 0.17, D - 0.16, at=(x, y, 0), bevel=0.025), pine))
        for z in (-D / 2 + 0.05, D / 2 - 0.05):  # quinas de reforço, a de trás mais alta
            h = 0.58 if z < 0 else 0.3
            hi.append(lib.assign(lib.box(f"corner{s}{z}", 0.12, h, 0.1, at=(x, h / 2, z), bevel=0.025), dark))
    return [{"name": "crate", "high": hi, "tris": 1500, "size": 512, "extrusion": 0.02, "samples": 48}]
