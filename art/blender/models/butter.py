# Leva 7: tablete de manteiga embrulhado (item novo, das receitas que ainda não são jogáveis).
# Papel dourado, a ponta dobrada como aba de envelope e a emenda escondida embaixo. O rótulo é uma folha com UV inteira deitada no topo, para o jogo
# pintar (packTex), como as outras embalagens de packs.py. Base no chão, centro na origem.
import bmesh

import lib
import parts
from parts import M

VIEW = {"elev": 35, "azim": -25, "fill": 0.7}
W, D, H = 0.9, 0.42, 0.34  # comprido em x, da frente para trás em y, alto em z


def paper():
    # papel dourado de manteiga: a cor cheia é o que separa o tablete de uma caixa branca
    return M("butter_paper", lambda: lib.ramp_mat("papel_manteiga", [(0, "#e8b43e"), (0.5, "#f2c95a"), (1, "#f8dc86")],
                                                  rough=0.35, spec=0.6, scale=5, bump=0.12, bump_scale=40))


def flap(name, side):
    """Aba de envelope na ponta: a folha desce do alto da face x = side * W / 2 e afina até uma
    ponta arredondada. Fina e colada na face, dentro do chanfro, para não sair pela quina."""
    y, top, tip = D / 2 - 0.04, H - 0.04, 0.1
    pts = [(-y, top), (y, top), (0.05, tip + 0.03), (0.0, tip), (-0.05, tip + 0.03)]
    bm = bmesh.new()
    x0, x1 = side * (W / 2 + 0.001), side * (W / 2 + 0.005)
    a = [bm.verts.new((x0, py, pz)) for py, pz in pts]
    b = [bm.verts.new((x1, py, pz)) for py, pz in pts]
    bm.faces.new(a)
    bm.faces.new(b[::-1])
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = lib.from_bmesh(name, bm, smooth=False)
    bev = o.modifiers.new("bev", "BEVEL")
    bev.width, bev.segments, bev.limit_method = 0.0015, 2, "NONE"
    return o


def build():
    block = lib.box("butter_block", W, H, D, at=(0, H / 2, 0), bevel=0.035, seg=3)
    lib.apply_all(block)
    lib.displace(block, 0.006, 7.0, 4)  # o papel não fica esticado de todo
    flaps = [flap(f"butter_flap{s}", s) for s in (-1, 1)]
    high = [lib.assign(o, paper()) for o in [block] + flaps]  # a emenda fica embaixo, como no tablete de verdade
    label = parts.label_panel("butter_label", 0.66, 0.26, (0, 0.03, H + 0.012), face="top", seg=2)
    return [
        {"name": "butter", "high": high, "tris": 600, "size": 512, "extrusion": 0.03, "samples": 32, "ao": 0.3,
         "coat": 0.2},
        {"name": "butter_label", "high": [label], "keep": True},
    ]
