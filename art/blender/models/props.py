# Miudezas da cozinha, já nas posições do jogo (src/three/sets.js): relógio de parede,
# vaso de manjericão no tampo, saleiro e pimenteiro, pote de colheres de pau e o pano de
# prato pendurado na beira da bancada. Cada uma é uma malha com a sua textura.
import math

import lib
import parts

VIEW = {"elev": 20, "azim": 0, "fill": 0.5}


def clock():
    hi = []
    face = lib.cylinder("clock_face", 0.75, 0.75, 0.12, 48)
    face.rotation_euler.x = math.pi / 2
    face.location = lib.T(14.8, 6.6, -3.05)
    hi.append(lib.assign(face, parts.ceramic("#fffaf0")))
    rim = parts.torus("clock_rim", 0.76, 0.08, 48, 12)
    rim.rotation_euler.x = math.pi / 2
    rim.location = lib.T(14.8, 6.6, -3.0)
    hi.append(lib.assign(rim, parts.ceramic("#e5484d")))
    for i in range(12):
        a = i / 12 * math.tau
        big = i % 3 == 0
        t = lib.box(f"tick{i}", 0.05 if not big else 0.07, 0.12 if not big else 0.18, 0.03,
                    at=(14.8 + math.sin(a) * 0.58, 6.6 + math.cos(a) * 0.58, -2.98), bevel=0.01)
        t.rotation_euler.y = a
        hi.append(lib.assign(t, parts.ceramic("#f483a6" if big else "#7fc6c0")))
    for n, (L, a) in enumerate(((0.38, 1.0), (0.55, -0.5))):
        hand = lib.box(f"hand{n}", 0.06, L, 0.025, at=(14.8 + math.sin(a) * L / 2, 6.6 + math.cos(a) * L / 2, -2.96 + n * 0.02), bevel=0.01)
        hand.rotation_euler.y = a
        hi.append(lib.assign(hand, parts.ceramic("#30353b")))
    pin = lib.sphere("clock_pin", 0.06, 16, 8, loc=lib.T(14.8, 6.6, -2.93), scale=(1, 0.5, 1))
    hi.append(lib.assign(pin, parts.ceramic("#e5484d")))
    return hi


def shakers():
    prof = [(0, 0), (0.2, 0), (0.22, 0.04), (0.22, 0.48), (0.16, 0.6), (0.12, 0.7), (0, 0.72)]
    hi = []
    for x, c in ((11.6, "#fffaf0"), (12.1, "#3a2a22")):
        b = lib.lathe(f"shaker{x}", prof, 32)
        b.location = lib.T(x, 0, -1.6)
        hi.append(lib.assign(b, parts.ceramic(c)))
        band = lib.lathe(f"shakerband{x}", [(0.223, 0.2), (0.223, 0.3)], 32)
        band.location = lib.T(x, 0, -1.6)
        hi.append(lib.assign(band, parts.ceramic("#e5484d")))
    return hi


def crock():
    hi = []
    pot = lib.lathe("crock", [(0, 0), (0.4, 0), (0.44, 0.06), (0.45, 1.05), (0.48, 1.1), (0.42, 1.12), (0.38, 0.12), (0, 0.12)], 40)
    pot.location = lib.T(-9.6, 0, -2.2)
    hi.append(lib.assign(pot, parts.ceramic("#2a8199")))
    stripe = lib.lathe("crockstripe", [(0.452, 0.75), (0.452, 0.85)], 40)
    stripe.location = lib.T(-9.6, 0, -2.2)
    hi.append(lib.assign(stripe, parts.ceramic("#fff6e3")))
    for i in range(3):  # colheres de pau de pé, a concha para cima
        lean = (i - 1) * 0.16
        h = lib.cylinder(f"spoonh{i}", 0.04, 0.035, 1.7, 10)
        bowl = lib.sphere(f"spoonb{i}", 0.17, 20, 10, scale=(1, 0.4, 1.35))
        for o, y in ((h, 0.95), (bowl, 1.95)):
            o.rotation_euler.y = lean
            o.location = lib.T(-9.6 + (i - 1) * 0.1 + math.sin(lean) * (y - 0.1), 0.1 + math.cos(lean) * (y - 0.1),
                               -2.2 + (i - 1) * 0.05)
            hi.append(lib.assign(o, parts.wood("spoon", (("#c98a4b", 0), ("#dca468", 0.5), ("#e8b97c", 1)))))
    return hi


def towel():
    """Pano de prato listrado: deita no tampo, dobra na quina e cai na frente do armário."""
    def shape(x, s):  # s de -1,1 (ponta de cima, no tampo) a 1,1 (ponta de baixo)
        t = s + 1.1  # 0 a 2,2 ao longo do pano
        wob = math.sin(x * 6) * 0.03
        if t < 0.7:
            return (-9.7 + x, 0.015, 2.3 + t + wob * 0.2)
        if t < 0.7 + math.pi * 0.08:
            a = (t - 0.7) / 0.08
            return (-9.7 + x, -0.08 + math.cos(a) * 0.095, 3.0 + math.sin(a) * 0.095 + wob * 0.2)
        return (-9.7 + x, -0.08 - (t - 0.7 - math.pi * 0.08), 3.095 + wob)
    stripes = parts.M("towel", lambda: lib.pattern_mat("pano_listrado", "stripes", "#fff8ee", "#ef6b70",
                                                        scale=7, axis="Y", rough=0.9))
    return [parts.fabric("towel", 1.3, 2.2, 10, 40, shape, stripes, thick=0.02)]


def build():
    common = {"size": 512, "extrusion": 0.03, "samples": 48}
    return [
        {"name": "clock", "high": clock(), "tris": 1000, **common},
        {"name": "basil", "high": parts.pot_plant((13.4, 0, -2.2), 0.9, "#d9693a", ("#2a8a34", "#62c456"), 22, 14, "basil"),
         "tris": 3000, **common},
        {"name": "shakers", "high": shakers(), "tris": 1500, **common},
        {"name": "crock", "high": crock(), "tris": 2500, **common},
        {"name": "towel", "high": towel(), "tris": 1800, **common},
    ]
