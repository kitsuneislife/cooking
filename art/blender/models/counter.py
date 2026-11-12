# Bancada da cozinha: um módulo (tampo de réguas amarelo-mel e armário rosa com gaveta e
# porta de almofada) que o jogo repete de ponta a ponta. Medidas nas unidades do jogo
# (src/three/sets.js): tampo em y = 0, frente das portas em z = 2,6, chão em y = -5,25.
# Referência: a cozinha do menu do vídeo (armário com moldura branca, puxador redondo).
import random

import lib
import parts

W = 4.3  # largura do módulo; o jogo estica para caber a bancada inteira
VIEW = {"elev": 22, "azim": -28}


def build():
    rnd = random.Random(3)
    woods = [parts.M(f"wood{i}", lambda c=c: lib.ramp_mat(
        f"regua{i}", [(0, c[0]), (0.55, c[1]), (1, c[2])], rough=0.45, spec=0.4, coat=0.25,
        by="wave", axis="Y", scale=1.6, bump=0.08, bump_scale=40))
        for i, c in enumerate([("#f1c552", "#f7d26a", "#fbdc80"), ("#f4cb5e", "#f9d876", "#fde28c"),
                               ("#eec04c", "#f5cd64", "#f9d97a")])]
    pink = parts.M("pink", lambda: lib.ramp_mat(
        "porta_rosa", [(0, "#f394b0"), (1, "#f8b0c4")], rough=0.32, spec=0.5, coat=0.35, scale=3,
        bump=0.03, bump_scale=60))
    panel = parts.M("panel", lambda: lib.ramp_mat(
        "almofada", [(0, "#f9bccc"), (1, "#fdd2dd")], rough=0.35, spec=0.5, coat=0.3, scale=3,
        bump=0.03, bump_scale=60))
    cream = parts.M("cream", lambda: lib.ramp_mat(
        "moldura", [(0, "#fbeee2"), (1, "#fff7ef")], rough=0.4, spec=0.45, scale=3, bump=0.02))
    kick = parts.M("kick", lambda: lib.mat("rodape", "#e483a0", rough=0.5))
    knob = parts.M("knob", lambda: lib.mat("puxador", "#fffaf5", rough=0.15, spec=0.6, coat=0.6))

    hi = []
    # tampo: oito réguas de tons alternados, a da frente com a quina bem arredondada
    for i in range(8):
        d = 6.2 / 8
        h = 0.5 - rnd.uniform(0, 0.012)
        z = -3.2 + d * (i + 0.5)
        b = lib.box(f"board{i}", W, h, d - 0.014, at=(0, -h / 2 - rnd.uniform(0, 0.004), z),
                    bevel=0.12 if i == 7 else 0.012, seg=4 if i == 7 else 2)  # réguas coladas: junta fina
        hi.append(lib.assign(b, woods[i % 3]))

    # caixa do armário, rodapé recuado e moldura branca na frente
    hi.append(lib.assign(lib.box("carcass", W, 4.5, 5.6, at=(0, -2.75, -0.2), bevel=0.02), cream))
    hi.append(lib.assign(lib.box("kick", W, 0.42, 0.3, at=(0, -5.04, 2.3), bevel=0.02), kick))
    for y, h in ((-0.62, 0.16), (-1.67, 0.14), (-4.84, 0.16)):
        hi.append(lib.assign(lib.box(f"rail{y}", W, h, 0.08, at=(0, y, 2.64), bevel=0.03), cream))
    for x in (-W / 2 + 0.07, W / 2 - 0.07):
        hi.append(lib.assign(lib.box(f"stile{x}", 0.14, 4.4, 0.08, at=(x, -2.75, 2.64), bevel=0.03), cream))

    # gaveta
    hi.append(lib.assign(lib.box("drawer", W - 0.42, 0.86, 0.1, at=(0, -1.14, 2.69), bevel=0.05, seg=3), pink))
    # porta de almofada: quadro saltado e almofada recuada
    dw, dy, dh = W - 0.42, -3.25, 3.02
    for name, w, h, x, y in (("dtop", dw, 0.36, 0, dy + dh / 2 - 0.18), ("dbot", dw, 0.36, 0, dy - dh / 2 + 0.18),
                             ("dl", 0.36, dh - 0.74, -dw / 2 + 0.18, dy), ("dr", 0.36, dh - 0.74, dw / 2 - 0.18, dy)):
        # montantes entre as travessas: peça sobreposta briga no bake e vira quadrado escuro
        hi.append(lib.assign(lib.box(name, w, h, 0.12, at=(x, y, 2.7), bevel=0.05, seg=3), pink))
    hi.append(lib.assign(lib.box("dpanel", dw - 0.66, dh - 0.66, 0.06, at=(0, dy, 2.67), bevel=0.04, seg=3), panel))

    # puxadores de cerâmica: bolinha achatada
    for n, (x, y) in enumerate(((0, -1.14), (W / 2 - 0.72, -2.25))):
        k = lib.sphere(f"knob{n}", 0.15, 24, 12, loc=lib.T(x, y, 2.83), scale=(1, 0.7, 1))
        hi.append(lib.assign(k, knob))
    return [{"name": "counter", "high": hi, "tris": 2000, "size": 1024, "extrusion": 0.03, "samples": 64}]
