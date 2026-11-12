# Janela da cozinha: caixilho branco, bandô de xadrez com barrado em ondas, cortinas franzidas
# presas por fita e dois vasinhos no peitoril. O céu fica no jogo (src/three/sets.js), atrás
# do caixilho. Uma só, que o jogo usa nas duas janelas.
# Referência: janelinha de cortina xadrez da cozinha do vídeo (inferência dos quadros).
import math

import lib
import parts

C = (0, 6.4, -3.1)  # centro da janela no jogo
VIEW = {"elev": 8, "azim": 0, "fill": 0.6}


def at(x, y, z):
    return (C[0] + x, C[1] + y, C[2] + z)


fabric = parts.fabric


def build():
    frame = parts.ceramic("#fffaf0")
    check = parts.M("gingham", lambda: lib.pattern_mat("xadrez_cortina", "gingham", "#fffafa", "#f59ab2", scale=8))
    hi = []
    for w, h, x, y in [(4.6, 0.25, 0, 1.9), (4.6, 0.25, 0, -1.9), (0.25, 4, -2.2, 0), (0.25, 4, 2.2, 0),
                       (0.12, 3.6, 0, 0), (4.2, 0.12, 0, 0.3)]:
        hi.append(lib.assign(lib.box(f"frame{x}_{y}", w, h, 0.3, at=at(x, y, 0), bevel=0.05, seg=3), frame))
    hi.append(lib.assign(lib.box("sill", 5.2, 0.18, 0.9, at=at(0, -2.05, 0.3), bevel=0.06, seg=3), frame))

    for side in (-1, 1):  # cortina franzida, presa na altura da fita
        def curtain(x, y, side=side):
            pinch = 1 - 0.55 * math.exp(-((y + 0.6) ** 2) * 2.2)
            px = (x + side * 0.7) * pinch - side * 0.7
            return at(side * 2.5 + px, -0.1 + y, 0.35 + math.sin(x * 9 + y * 0.5) * 0.12 * pinch)
        hi.append(fabric(f"curtain{side}", 1.4, 4.4, 20, 26, curtain, check))
        tie = parts.torus(f"tie{side}", 0.24, 0.06)
        tie.rotation_euler.x = math.pi / 2 - 0.2
        tie.scale = (1, 0.55, 1)
        tie.location = lib.T(*at(side * 2.15, -0.6, 0.45))
        hi.append(lib.assign(tie, parts.ceramic("#e5484d")))

    def valance(x, y):  # bandô com barrado em ondas e franzido leve
        k = (y + 0.35) / 0.7
        drop = 0.16 * abs(math.sin(x * 3.2)) * (1 - k)
        return at(x, 2.1 + y - drop, 0.42 + 0.05 * math.sin(x * 6.4) + 0.06 * (1 - k))
    hi.append(fabric("valance", 5.6, 0.7, 64, 4, valance, check))

    hi += parts.pot_plant(at(1.4, -1.96, 0.35), 0.6, "#d9693a", ("#2f8a34", "#5dbb4a"), 14, 4, "herb1")
    hi += parts.pot_plant(at(-1.6, -1.96, 0.35), 0.48, "#f2c14a", ("#3f9a3a", "#6fc95a"), 12, 8, "herb2")
    return [{"name": "window", "high": hi, "tris": 5000, "size": 1024, "extrusion": 0.03, "samples": 48,
             "origin": C}]
