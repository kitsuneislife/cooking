# Leva 7: tablete de manteiga embrulhado (item novo, das receitas que ainda não são jogáveis).
# Papel encerado cor de creme, as pontas dobradas em triângulo como embrulho de verdade e a
# emenda do papel por cima. O rótulo é uma folha com UV inteira deitada no topo, para o jogo
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


def flap(name, side, pts):
    """Aba do papel dobrada na ponta: triângulo fino colado na face x = side * W / 2."""
    bm = bmesh.new()
    x0, x1 = side * (W / 2 + 0.002), side * (W / 2 + 0.012)
    a = [bm.verts.new((x0, y, z)) for y, z in pts]
    b = [bm.verts.new((x1, y, z)) for y, z in pts]
    bm.faces.new(a)
    bm.faces.new(b[::-1])
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = lib.from_bmesh(name, bm, smooth=False)
    bev = o.modifiers.new("bev", "BEVEL")
    bev.width, bev.segments, bev.limit_method = 0.004, 1, "NONE"
    return o


def build():
    block = lib.box("butter_block", W, H, D, at=(0, H / 2, 0), bevel=0.035, seg=3)
    lib.apply_all(block)
    lib.displace(block, 0.006, 7.0, 4)  # o papel não fica esticado de todo
    flaps = []
    y, b = D / 2 - 0.035, 0.035  # recolhida pelo chanfro, senão a ponta sai da quina arredondada
    for s in (-1, 1):
        flaps.append(flap(f"butter_flap_top{s}", s, [(-y, H - b), (y, H - b), (0.0, 0.12)]))
        flaps.append(flap(f"butter_flap_low{s}", s, [(y, b), (-y, b), (0.0, 0.2)]))
    seam = lib.box("butter_seam", W - 0.02, 0.01, 0.1, at=(0, H + 0.004, -0.05), bevel=0.004)
    high = [lib.assign(o, paper()) for o in [block, seam] + flaps]
    label = parts.label_panel("butter_label", 0.66, 0.26, (0, 0.03, H + 0.012), face="top", seg=2)
    return [
        {"name": "butter", "high": high, "tris": 600, "size": 512, "extrusion": 0.03, "samples": 32, "ao": 0.3,
         "coat": 0.2},
        {"name": "butter_label", "high": [label], "keep": True},
    ]
