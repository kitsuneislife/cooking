# Banca da feira (fase 1): balcão de tábuas com a faixa vermelha, três degraus para os
# caixotes, postes com pomo e o toldo listrado com barrado em ondas. Nas medidas do grupo da
# feira em src/three/sets.js (o balcão em y de -3,6 a 0). Os caixotes de cada partida, as
# bandeirinhas e as lâmpadas que piscam continuam no jogo.
import math
import random

import lib
import parts

VIEW = {"elev": 18, "azim": -15, "fill": 0.55}


def stand():
    rnd = random.Random(2)
    tones = [parts.wood(f"stand{i}", stops) for i, stops in enumerate([
        (("#d89a58", 0), ("#dea464", 0.5), ("#e6b073", 1)), (("#e2a866", 0), ("#e8b272", 0.5), ("#eebc80", 1)),
        (("#d39758", 0), ("#d9a062", 0.5), ("#e0aa6c", 1))])]  # degradê curto: em área grande, veio forte vira mancha
    hi = [lib.assign(lib.box("body", 17.8, 3.5, 5.8, at=(0, -1.85, -0.1), bevel=0.05), tones[0])]
    for i in range(10):  # tampo de tábuas
        d = 6 / 10
        hi.append(lib.assign(lib.box(f"top{i}", 18, 0.2, d - 0.03, at=(0, -0.1 - rnd.uniform(0, 0.01), -3 + d * (i + 0.5)),
                                     bevel=0.04, seg=2), tones[i % 3]))
    for i in range(30):  # frente de tábuas em pé
        w = 18 / 30
        hi.append(lib.assign(lib.box(f"front{i}", w - 0.035, 3.4, 0.12, at=(-9 + w * (i + 0.5), -1.9, 2.94 + rnd.uniform(0, 0.02)),
                                     bevel=0.03, seg=2), tones[(i * 7) % 3]))
    red = parts.ceramic("#e5484d")
    cream = parts.ceramic("#fff6e3")
    hi.append(lib.assign(lib.box("band", 18.3, 0.9, 0.2, at=(0, -0.7, 3.05), bevel=0.06, seg=3), red))
    for y in (-0.27, -1.13):
        hi.append(lib.assign(lib.box(f"pipe{y}", 18.34, 0.07, 0.22, at=(0, y, 3.07), bevel=0.03, seg=2), cream))
    for tier in range(3):  # degraus onde o jogo assenta os caixotes
        h = 0.2 + tier * 1.15
        z = -tier * 1.5 + 0.9
        hi.append(lib.assign(lib.box(f"step{tier}", 13.6, h, 1.6, at=(0, h / 2 - 0.05, z), bevel=0.06, seg=2), tones[tier % 3]))
        hi.append(lib.assign(lib.box(f"nose{tier}", 13.7, 0.12, 0.14, at=(0, h - 0.1, z + 0.78), bevel=0.04, seg=2), cream))
    for x in (-9, 9):  # postes torneados com pomo
        for z in (2.6, -3.5):
            p = lib.lathe(f"post{x}_{z}", [(0, 0), (0.2, 0), (0.2, 0.3), (0.15, 0.4), (0.15, 9.6), (0.2, 9.7),
                                           (0.2, 9.8), (0, 9.8)], 16)
            p.location = lib.T(x, -3.6, z)
            hi.append(lib.assign(p, tones[1]))
            hi.append(lib.assign(lib.sphere(f"knob{x}_{z}", 0.24, 20, 10, loc=lib.T(x, 6.4, z)), red))
    return hi


def awning():
    th = -math.pi / 2 + 0.45  # mesma inclinação do toldo antigo

    def shape(x, y):
        z = -math.sin((y + 3.5) / 7 * math.pi) * 0.6
        if y < -3.3:  # barrado em arcos
            y -= 0.35 * abs(math.sin(x * 1.6))
        return (x, 6.8 + y * math.cos(th) - z * math.sin(th), -0.4 + y * math.sin(th) + z * math.cos(th))
    stripes = parts.M("awning", lambda: lib.pattern_mat("toldo", "stripes", "#e5484d", "#fff6e3",
                                                         scale=16 / 19.5, axis="X", rough=0.75))
    return [parts.fabric("awning", 19.5, 7, 78, 14, shape, stripes, thick=0.05)]


def build():
    return [
        {"name": "stand", "high": stand(), "tris": 9000, "size": 1024, "extrusion": 0.03, "samples": 48},
        {"name": "awning", "high": awning(), "tris": 4000, "size": 512, "extrusion": 0.03, "samples": 48,
         "roughness": False},
    ]
