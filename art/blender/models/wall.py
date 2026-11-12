# Parede atrás da bancada: azulejo esmaltado em pastel misturado, faixa de azulejo com
# florzinha em relevo e filete branco por cima. Sai como uma placa só, com a UV de 0 a 1,
# que o jogo repete ao longo da parede (src/three/sets.js). As cores repetem a cada 6
# colunas, então a placa casa com a vizinha sem emenda.
# Referência: azulejo quadrado pastel da cozinha do vídeo (inferência dos quadros).
import math
import random

import bmesh

import lib
import parts

P = 0.68                  # passo do azulejo
COLS, ROWS = 6, 5         # a placa: 6 colunas, 5 fileiras (3,4 de altura, como no jogo)
BAND = 0.75               # faixa decorada
W, H = COLS * P, ROWS * P + BAND + 0.17
PASTEL = ["#fbc9d6", "#c6efe2", "#fff1b8", "#ddd2f8", "#fffaf4", "#c9e6fb"]
VIEW = {"elev": 5, "azim": 0, "fill": 0.6}


def plate():
    """A placa que vai para o jogo: um quad com UV inteira, na frente do relevo."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new()
    vs = [bm.verts.new(lib.T(x, y, 0.13)) for x, y in ((0, 0), (W, 0), (W, H), (0, H))]
    f = bm.faces.new(vs)
    for loop in f.loops:
        p = loop.vert.co
        loop[uv].uv = (p.x / W, p.z / H)
    o = lib.from_bmesh("wall", bm, smooth=False)
    o.hide_render = True  # fora da foto do high; o build liga de novo para assar
    return o


def build():
    rnd = random.Random(5)
    glaze = [parts.M(c, lambda c=c: lib.ramp_mat(
        "esmalte" + c, [(0, c), (0.6, c), (1, "#ffffff")], rough=0.12, spec=0.6, coat=0.6,
        scale=2.5, bump=0.02, bump_scale=8)) for c in PASTEL]
    grout = parts.M("grout", lambda: lib.ramp_mat(
        "rejunte", [(0, "#efe6df"), (1, "#faf4ef")], rough=0.9, spec=0.2, scale=30, bump=0.3))
    cream = parts.M("cream", lambda: lib.ramp_mat(
        "faixa", [(0, "#fff6ec"), (1, "#fffcf7")], rough=0.15, spec=0.6, coat=0.6, scale=3, bump=0.01))
    petal = parts.M("petal", lambda: lib.mat("petala", "#f2799f", rough=0.18, spec=0.6, coat=0.6))
    core = parts.M("core", lambda: lib.mat("miolo", "#ffd04f", rough=0.2, spec=0.6, coat=0.6))
    mint = parts.M("mint", lambda: lib.mat("canto", "#86d8c1", rough=0.2, spec=0.6, coat=0.6))

    colors = {(c, r): rnd.randrange(len(PASTEL)) for c in range(COLS) for r in range(ROWS)}
    hi = [lib.assign(lib.box("grout", W + 2 * P, H, 0.02, at=(W / 2, H / 2, 0), bevel=0), grout)]
    # uma coluna a mais de cada lado: a oclusão da borda da placa sai igual à do meio
    for c in range(-1, COLS + 1):
        x = P * (c + 0.5)
        for r in range(ROWS):
            t = lib.box(f"tile{c}_{r}", P - 0.045, P - 0.045, 0.07,
                        at=(x, P * (r + 0.5), 0.035 + rnd.uniform(-0.004, 0.004)), bevel=0.03, seg=3)
            hi.append(lib.assign(t, glaze[colors[(c % COLS, r)]]))
        y = ROWS * P + BAND / 2
        hi.append(lib.assign(lib.box(f"band{c}", P - 0.045, BAND - 0.045, 0.07, at=(x, y, 0.035),
                                     bevel=0.03, seg=3), cream))
        for i in range(4):  # florzinha em relevo: quatro pétalas, miolo amarelo
            a = i * 1.5708 + 0.785
            pt = lib.sphere(f"petal{c}_{i}", 0.1, 20, 10, scale=(0.62, 0.28, 1.0))
            pt.rotation_euler = (0, a, 0)
            pt.location = lib.T(x + 0.11 * math.sin(a), y + 0.11 * math.cos(a), 0.075)
            hi.append(lib.assign(pt, petal))
        hi.append(lib.assign(lib.sphere(f"core{c}", 0.06, 20, 10, loc=lib.T(x, y, 0.085), scale=(1, 0.5, 1)), core))
        for yy in (ROWS * P, ROWS * P + BAND):  # bolinha menta onde quatro cantos se encontram
            hi.append(lib.assign(lib.sphere(f"dot{c}_{yy}", 0.1, 20, 10, loc=lib.T(x - P / 2, yy, 0.06),
                                            scale=(1, 0.35, 1)), mint))
    hi.append(lib.assign(lib.box("trim", W + 2 * P, 0.17, 0.14, at=(W / 2, H - 0.085, 0.07), bevel=0.06, seg=4), cream))
    return [{"name": "wall", "high": hi, "low": plate(), "size": 1024, "extrusion": 0.05, "samples": 64}]
