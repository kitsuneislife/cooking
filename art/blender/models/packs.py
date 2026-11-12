# Leva 7: embalagens de papel e plástico da despensa. Pote de iogurte com tampa de alumínio,
# caixinha de leite com telhadinho, saco de papel kraft dobrado e lata de tampa de alavanca.
# O formato vem daqui e o rótulo é pintado no jogo (labelTexture e packTex, src/three/foods.js),
# porque o texto e a cor mudam por ingrediente: cada rótulo é uma folha com UV inteira, e as
# peças que mudam de cor (tampa, telhado, lata) saem quase brancas para o jogo tingir.
# Cada peça segue as medidas do procedural que troca (base no chão, centro na origem).
# Referência: docs/inspiracao/cooking-mama-cuisine.md, "Embalagens de perto".
import math

import bmesh
from mathutils import Matrix, Vector, noise

import lib
import parts
from parts import M

VIEW = {"elev": 22, "azim": -20, "fill": 0.7}


def smooth(a, b, t):
    t = min(1.0, max(0.0, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)


def creases(obj, amount, stretch=(14, 14, 2.5), seed=0):
    """Vincos de papel: ruído esticado na vertical, empurrando ao longo da normal."""
    sx, sy, sz = stretch
    off = Vector((seed * 3.1, seed * 1.7, seed * 2.3))
    for v in obj.data.vertices:
        c = v.co
        v.co += v.normal * noise.noise(Vector((c.x * sx, c.y * sy, c.z * sz)) + off) * amount
    obj.data.update()
    return obj


def plastic():
    return parts.ceramic("#f4f1ea", "plastico")


def tintable(key):
    """Quase branco, para o jogo multiplicar pela cor do ingrediente."""
    return M("tint" + key, lambda: lib.ramp_mat("tingir_" + key, [(0, "#d9d6d0"), (0.6, "#ecebe6"), (1, "#f4f3ef")],
                                               rough=0.3, spec=0.6, coat=0.5, by="height", scale=3, bump=0.01))


def kraft():
    return M("kraft", lambda: lib.ramp_mat("kraft", [(0, "#b4824f"), (0.5, "#cc9c65"), (1, "#dfba86")], rough=0.85,
                                           spec=0.3, by="height", scale=3, bump=0.25, bump_scale=70))


def waxed():
    return M("waxed", lambda: lib.ramp_mat("papel_encerado", [(0, "#e4dfd5"), (0.5, "#f3efe7"), (1, "#f8f6f1")],
                                           rough=0.42, spec=0.5, by="height", scale=3, bump=0.03, bump_scale=60))


def tub():
    """Pote de iogurte (tub, foods.js): plástico branco com aro enrolado e pé, tampa de alumínio
    franzida na borda com a lingueta para puxar."""
    prof = [(0.0, 0.02), (0.44, 0.02), (0.455, 0.0), (0.49, 0.0), (0.502, 0.02), (0.507, 0.1), (0.52, 0.112),
            (0.52, 0.14), (0.615, 0.82), (0.64, 0.83), (0.668, 0.845), (0.676, 0.868), (0.668, 0.892),
            (0.64, 0.9), (0.0, 0.9)]
    body = lib.assign(lib.solid([lib.lathe("tub_body", prof, 48)], "tub_body"), plastic())
    foil = lib.lathe("tub_foil", [(0.0, 0.93), (0.6, 0.931), (0.668, 0.924), (0.686, 0.906), (0.68, 0.892),
                                  (0.62, 0.897), (0.0, 0.897)], 72)
    foil = lib.solid([foil], "tub_foil")
    for v in foil.data.vertices:  # franzido do alumínio prensado na borda
        r = math.hypot(v.co.x, v.co.y)
        if r > 0.58:
            a = math.atan2(v.co.y, v.co.x)
            k = smooth(0.58, 0.68, r)
            v.co.z += 0.008 * math.sin(a * 36) * k
            v.co.x *= 1 + 0.01 * math.sin(a * 36) * k
            v.co.y *= 1 + 0.01 * math.sin(a * 36) * k
    foil.data.update()
    tab = lib.box("tub_tab", 0.2, 0.02, 0.16, at=(0, 0, 0), bevel=0.006)
    tab.location = (0.5, -0.5, 0.918)
    tab.rotation_euler = (0.0, 0.12, -math.pi / 4)
    lid = [lib.assign(foil, parts.steel()), lib.assign(tab, parts.steel())]
    r_at = lambda z: 0.52 + 0.095 * (z - 0.14) / 0.68  # noqa: E731
    label = parts.label_band("tub_label", r_at, 0.2, 0.72, seg=24)
    return [body], lid, [label]


def carton():
    """Caixinha de leite (carton, foods.js): papel encerado estufado de leve, quinas macias,
    telhadinho com aba no topo e tampinha de rosca na água da direita."""
    body = lib.box("carton_body", 0.78, 1.15, 0.78, at=(0, 0.575, 0), bevel=0.035, seg=3)
    lib.apply_all(body)
    for v in body.data.vertices:  # o líquido estufa as paredes
        k = 1 + 0.022 * (1 - (2 * (v.co.z - 0.575) / 1.15) ** 2)
        v.co.x *= k
        v.co.y *= k
    body.data.update()
    fin = lib.box("carton_fin", 0.05, 0.17, 0.76, at=(0, 1.5, 0), bevel=0.016)
    bm = bmesh.new()  # telhado: prisma com a cumeeira da frente para trás
    tri = [(-0.395, 1.13), (0.395, 1.13), (0.0, 1.45)]
    front = [bm.verts.new((x, -0.39, z)) for x, z in tri]
    back = [bm.verts.new((x, 0.39, z)) for x, z in tri]
    bm.faces.new(front[::-1])
    bm.faces.new(back)
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((front[i], front[j], back[j], back[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    roof = lib.from_bmesh("carton_gable", bm, smooth=False)
    bev = roof.modifiers.new("bev", "BEVEL")
    bev.width, bev.segments, bev.limit_method = 0.018, 2, "NONE"
    cap = lib.cylinder("carton_cap", 0.1, 0.095, 0.09, 24)
    parts.xform([cap], (0.2, 1.33, 0.12), (0, 0, -0.9))
    white = [lib.assign(body, waxed()), lib.assign(fin, waxed())]
    tinted = [lib.assign(roof, tintable("roof")), lib.assign(cap, tintable("roof"))]
    sides = [parts.label_panel(f"carton_label{i}", 0.72, 1.0, (0, -0.45, 0.575), target=body, turn=i * math.pi / 2, seg=4)
             for i in range(4)]
    label = lib.join(sides, "carton_label")
    return white, tinted, [label]


def sack():
    """Saco de açúcar (sack, foods.js): kraft estufado, mais claro em cima, a boca achatada e
    dobrada duas vezes para a frente, vincos moles na vertical."""
    W, D, H = 0.95, 0.62, 1.04
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=9, use_grid_fill=True)
    for v in bm.verts:
        x, y, t = v.co.x, v.co.y, v.co.z + 0.5
        flat = 1 - 0.62 * smooth(0.5, 1.0, t)  # a boca se achata
        pillow = 1 + 0.14 * (1 - (2 * x) ** 2) * (1 - 0.5 * smooth(0.6, 1.0, t))
        v.co = Vector((x * W * (1 + 0.02 * (1 - t)), y * D * flat * pillow, t * H))
    body = lib.from_bmesh("sack_body", bm)
    lib.subsurf(body, 1)
    lib.apply_all(body)
    creases(body, 0.014, seed=1)
    lib.displace(body, 0.004, 9.0, 2)
    folds = []
    for i, (h, d, y, z, tilt) in enumerate(((0.2, 0.15, H - 0.06, 0.07, 0.35), (0.14, 0.12, H + 0.06, 0.11, 0.6))):
        f = lib.box(f"sack_fold{i}", W * (0.97 - i * 0.03), h, d, at=(0, y, z), bevel=0.06, seg=3)
        f.rotation_euler.x = tilt
        lib.apply_all(f)
        creases(f, 0.008, stretch=(10, 6, 6), seed=3 + i)
        folds.append(f)
    high = [lib.assign(o, kraft()) for o in [body] + folds]
    label = parts.label_panel("sack_label", 0.62, 0.56, (0, -0.6, 0.47), target=body, off=0.006)
    return high, [label]


def tin():
    """Lata de cacau (tin, foods.js): corpo pintado com dois frisos, bordas enroladas de metal
    no pé e tampa de alavanca com o rebaixo em cima."""
    body = lib.solid([lib.lathe("tin_body", [(0.0, 0.045), (0.415, 0.045), (0.42, 0.06), (0.42, 0.11),
                                             (0.428, 0.125), (0.42, 0.14), (0.42, 0.82), (0.428, 0.835),
                                             (0.42, 0.85), (0.42, 0.93), (0.0, 0.93)], 48)], "tin_body")
    rim = lib.solid([lib.lathe("tin_rim", [(0.0, 0.0), (0.4, 0.0), (0.428, 0.01), (0.436, 0.03), (0.428, 0.052),
                                           (0.41, 0.058), (0.0, 0.058)], 48)], "tin_rim")
    lid = lib.solid([lib.lathe("tin_lid", [(0.0, 0.92), (0.425, 0.92), (0.442, 0.935), (0.448, 1.0),
                                           (0.446, 1.05), (0.432, 1.068), (0.4, 1.07), (0.37, 1.055),
                                           (0.35, 1.035), (0.33, 1.045), (0.0, 1.045)], 48)], "tin_lid")
    metal = [lib.assign(rim, parts.steel()), lib.assign(lid, parts.steel())]
    label = parts.label_band("tin_label", lambda z: 0.42, 0.17, 0.79, seg=24)
    return [lib.assign(body, tintable("paint"))], metal, [label]


def build():
    tb, tl, tlab = tub()
    cb, cr, clab = carton()
    sk, slab = sack()
    tn, tm, tnlab = tin()
    parts.shift(tb + tl + tlab, 0)
    parts.shift(cb + cr + clab, 2.5)
    parts.shift(sk + slab, 5)
    parts.shift(tn + tm + tnlab, 7.5)
    common = {"extrusion": 0.03, "samples": 32, "ao": 0.3}
    metal = {"extrusion": 0.03, "samples": 32, "metal": 1.0, "roughness": False, "rough": 0.3, "ao": 0.3}
    return [
        # a feira mostra cada embalagem pequena e em trio: o low fica perto do procedural antigo
        {"name": "tub", "high": tb, "tris": 480, "size": 512, "origin": (0, 0, 0), **common, "coat": 0.5},
        {"name": "tub_lid", "high": tl, "tris": 260, "size": 256, "origin": (0, 0, 0), **metal},
        {"name": "tub_label", "high": tlab, "keep": True, "origin": (0, 0, 0)},
        {"name": "carton", "high": cb, "tris": 600, "size": 512, "origin": (2.5, 0, 0), **common, "coat": 0.2},
        {"name": "carton_roof", "high": cr, "tris": 300, "size": 256, "origin": (2.5, 0, 0), **common, "coat": 0.4},
        {"name": "carton_label", "high": clab, "keep": True, "origin": (2.5, 0, 0)},
        {"name": "sack", "high": sk, "tris": 1200, "size": 512, "origin": (5, 0, 0), **common},
        {"name": "sack_label", "high": slab, "keep": True, "origin": (5, 0, 0)},
        {"name": "tin", "high": tn, "tris": 320, "size": 512, "origin": (7.5, 0, 0), **common, "coat": 0.6},
        {"name": "tin_metal", "high": tm, "tris": 380, "size": 256, "origin": (7.5, 0, 0), **metal},
        {"name": "tin_label", "high": tnlab, "keep": True, "origin": (7.5, 0, 0)},
    ]
