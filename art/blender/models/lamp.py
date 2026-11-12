# Luminária pendente de esmalte, em três cores (vermelha, amarela e menta): cúpula com aro
# creme, miolo branco e fio. A lâmpada que brilha e a luz ficam no jogo (src/three/sets.js).
import lib
import parts

COLORS = {"lamp_red": "#e5484d", "lamp_yellow": "#ffd23f", "lamp_mint": "#7fc6c0"}
VIEW = {"elev": 15, "azim": -20}


def lamp(x, color, name):
    shade = [(0.12, 0.62), (0.26, 0.57), (0.5, 0.36), (0.72, 0.1), (0.82, 0.0)]
    inner = [(r * 0.96, z - 0.02) for r, z in shade]
    hi = []
    o = lib.lathe(name + "_shade", shade, 48)
    o.location = lib.T(x, 0, 0)
    hi.append(lib.assign(o, parts.M("enamel" + color, lambda: lib.ramp_mat(
        "esmalte" + color, [(0, color), (0.75, color), (1, "#ffffff")], rough=0.2, spec=0.6, coat=0.6,
        by="height", scale=2, bump=0.01))))
    i = lib.lathe(name + "_inner", inner, 48)
    i.location = lib.T(x, 0, 0)
    hi.append(lib.assign(i, parts.ceramic("#fffaf2")))
    rim = parts.torus(name + "_rim", 0.82, 0.03, 48, 8)
    rim.location = lib.T(x, 0, 0)
    hi.append(lib.assign(rim, parts.ceramic("#fff6e3")))
    cap = lib.lathe(name + "_cap", [(0.2, 0.6), (0.2, 0.72), (0.08, 0.8), (0, 0.8)], 24)
    cap.location = lib.T(x, 0, 0)
    hi.append(lib.assign(cap, parts.ceramic("#fff6e3")))
    cord = lib.cylinder(name + "_cord", 0.025, 0.025, 5.6, 8, loc=lib.T(x, 3.6, 0))
    hi.append(lib.assign(cord, parts.ceramic("#3a2618")))
    return hi


def build():
    return [{"name": n, "high": lamp(i * 3.0, c, n), "tris": 1500, "size": 256, "extrusion": 0.02,
             "samples": 48, "origin": (i * 3.0, 0, 0)} for i, (n, c) in enumerate(COLORS.items())]
