# Leva 4: louça e panelas das estações. Tigela de misturar, prato de servir, wok, frigideiras
# do varal (azul-piscina e coral), tigelinha de molho, tigela de amido com a colher, tigela de
# arroz (a tigela e o arroz separados, porque o arroz some quando o jogador serve), cúpula e
# tábua. Cada peça é escrita no referencial local do procedural que ela troca (src/three/kit.js),
# com as mesmas medidas: o que o jogo calcula por dentro (líquido da tigela, fundo do wok, tampo
# da tábua) continua valendo. Referência: panela de esmalte azul-piscina com borda de inox,
# tigela branca de fundo azulado, prato branco de aba azul (docs/inspiracao/cooking-mama-cuisine.md).
import math
import random

import bmesh
from mathutils import Matrix

import lib
import parts
from parts import M

VIEW = {"elev": 40, "azim": -10, "fill": 0.6}


def bowl_profile(R, H):
    """O perfil de bowlGeo (kit.js), com pé e borda enrolada: fora e dentro separados."""
    outer = [(0.0, 0.0), (R * 0.4, 0.0), (R * 0.47, 0.01), (R * 0.5, 0.05), (R * 0.56, 0.07),
             (R * 0.86, H * 0.45), (R * 0.98, H * 0.88), (R * 1.005, H - 0.005), (R * 1.0, H + 0.03)]
    inner = [(R * 1.0, H + 0.03), (R * 0.965, H + 0.035), (R * 0.93, H * 0.96), (R * 0.82, H * 0.5),
             (R * 0.42, H * 0.14), (0.0, H * 0.12)]
    return outer, inner


def band(name, prof_r, y0, y1, m, seg=64):
    """Faixa pintada: um anel fino e fechado por cima da louça, entre as alturas y0 e y1. Só
    vai para a textura (fica fora do "shell")."""
    a, b = prof_r(y0), prof_r(y1)
    o = lib.lathe(name, [(a, y0), (a + 0.006, y0), (b + 0.006, y1), (b, y1), (a, y0)], seg)
    return lib.assign(lib.solid([o], name), m)


def wall_r(outer):
    def r(y):  # raio de fora na altura y, interpolando o perfil
        for (r0, y0), (r1, y1) in zip(outer, outer[1:]):
            if y0 <= y <= y1 and y1 > y0:
                return r0 + (r1 - r0) * (y - y0) / (y1 - y0)
        return outer[-1][0]
    return r


def mixing_bowl():
    """Tigela de misturar (R 1,1, H 0,75): azul-céu de bolinhas brancas, borda creme e o
    fundo de dentro clareando para o creme, como a tigela da batedeira da referência."""
    outer, inner = bowl_profile(1.1, 0.75)
    # no jogo, azul claro com bolinha leu como tigela branca: azul cheio por fora, azulado por dentro
    o = lib.assign(lib.lathe("bowl_out", outer[:-2], 96), parts.dotted("#5fb4e2", "#fffaf2", 7.0, 0.22))
    rim = lib.assign(lib.lathe("bowl_rim", outer[-3:] + inner[1:2], 96), parts.enamel("#fffaf2"))
    i = lib.assign(lib.lathe("bowl_in", inner[1:], 96), M("bowl_in", lambda: lib.ramp_mat(
        "tigela_dentro", [(0, "#9fd0ee"), (0.6, "#c4e3f5"), (1, "#eef7fc")], rough=0.12, spec=0.6,
        coat=0.6, by="height", scale=2, bump=0)))
    return [lib.solid([o, rim, i], "bowl_body")]


def serving_plate():
    """Prato de servir (raio 1,97): porcelana branca, aba azul com filetes dourados e uma
    coroa de pintinhas brancas, e um pé por baixo."""
    porcelain = M("porcelain", lambda: lib.ramp_mat(
        "porcelana", [(0, "#fffdf9"), (0.7, "#fbfbfa"), (1, "#eef2f7")], rough=0.1, spec=0.6, coat=0.7,
        by="radial", scale=2, bump=0))
    well = lib.assign(lib.lathe("plate_well", [(0.0, 0.08), (1.15, 0.08), (1.24, 0.11), (1.3, 0.14)], 96), porcelain)
    rimp = [(1.3, 0.14), (1.6, 0.19), (1.9, 0.24), (1.97, 0.25)]
    rim = lib.assign(lib.lathe("plate_rim", rimp, 96), parts.enamel("#7cc4e8", "#a9dbf2", "#68b4dc"))
    under = lib.assign(lib.lathe("plate_under", [(1.97, 0.25), (1.995, 0.235), (1.99, 0.21), (1.7, 0.1),
                                                 (1.22, 0.03), (1.18, 0.0), (1.08, 0.0), (1.04, 0.025), (0.0, 0.035)], 96), porcelain)
    gold = M("gold", lambda: lib.ramp_mat("ouro", [(0, "#d9a441"), (0.5, "#f3c86a"), (1, "#fbe2a0")],
                                          rough=0.2, spec=0.7, scale=12, bump=0))
    out = [lib.solid([well, rim, under], "plate_body")]
    for k, (r, y) in enumerate(((1.31, 0.141), (1.62, 0.193), (1.95, 0.247))):
        t = parts.torus(f"plate_gold{k}", r, 0.016, 96, 6)
        t.location.z = y + 0.004
        out.append(lib.assign(t, gold))
    white = parts.ceramic("#fffaf2")
    for k in range(28):  # coroa de pintinhas no meio da aba, seguindo a inclinação
        a = k / 28 * math.tau
        r = 1.78
        d = lib.sphere(f"plate_dot{k}", 0.035, 12, 6, scale=(1, 1, 0.25))
        d.location = (r * math.cos(a), r * math.sin(a), 0.19 + (r - 1.6) / 0.3 * 0.05 + 0.006)
        d.rotation_euler = (0, -0.17, a)  # deita na aba, que sobe para fora
        out.append(lib.assign(d, white))
    return out


def handle(name, start, rot_z, neck_len, grip_len, grip_r, wood_key="handle"):
    """Cabo de panela: pescoço de inox e empunhadura de madeira com ponteira e furo de pendurar."""
    neck = lib.lathe(name + "_neck", [(0.0, 0.0), (0.1, 0.0), (0.085, neck_len * 0.5), (0.075, neck_len), (0.0, neck_len)], 16)
    lib.assign(neck, parts.steel())
    L = grip_len
    grip = lib.lathe(name + "_grip", [(0.0, 0.0), (grip_r * 0.8, 0.0), (grip_r, 0.06), (grip_r * 0.92, L * 0.4),
                                      (grip_r * 1.08, L * 0.85), (grip_r, L - 0.04), (grip_r * 0.6, L), (0.0, L)], 24)
    grip.location.z = neck_len - 0.02
    grip.scale = (1, 0.8, 1)  # empunhadura achatada, como cabo de verdade
    lib.assign(grip, parts.wood(wood_key, (("#b06e35", 0), ("#c98a4b", 0.5), ("#dca468", 1))))
    hole = parts.torus(name + "_ring", grip_r * 0.45, grip_r * 0.12, 20, 8)
    hole.rotation_euler.x = math.pi / 2
    hole.location.z = neck_len + L - 0.18
    lib.assign(hole, parts.ceramic("#5a3420"))
    objs = [neck, grip, hole]
    return parts.xform(objs, start, (0, 0, rot_z))


def wok():
    """Wok azul-piscina por fora, borda de inox enrolada, granito cinza-azulado por dentro e
    alça de madeira; o lado oposto tem uma alcinha. Mesmo fundo de dentro do jogo
    (floor(r) = 0,06 + 0,27 r²), que o refogado usa para assentar."""
    outer = [(0.0, 0.0), (0.4, 0.0), (0.8, 0.12), (1.15, 0.35), (1.4, 0.62), (1.48, 0.72), (1.5, 0.75)]
    body = lib.assign(lib.lathe("wok_out", outer, 96), parts.enamel("#38b7da", "#7fd6ee", "#2290b4"))
    rim = lib.assign(lib.lathe("wok_rim", [(1.5, 0.75), (1.535, 0.77), (1.525, 0.805), (1.48, 0.81), (1.45, 0.785)], 96), parts.steel())
    inner = [(1.45, 0.785), (1.12, 0.42), (0.78, 0.2), (0.4, 0.09), (0.0, 0.07)]
    inside = lib.assign(lib.lathe("wok_in", inner, 96), parts.speckled("#8e9dad", "#eef3f8"))
    out = [lib.solid([body, rim, inside], "wok_body")]
    out += handle("wok_handle", (1.47, 0.74, 0), -math.pi / 2 + 0.16, 0.45, 1.25, 0.12)
    loop = parts.tube("wok_loop", [(-1.47 - 0.22 * math.sin(a), 0.72 + 0.04 * math.sin(a), 0.22 * math.cos(a))
                                   for a in [i / 10 * math.pi for i in range(11)]], 0.045, 10)
    out.append(lib.assign(loop, parts.enamel("#38b7da", "#7fd6ee", "#2290b4")))
    return out


def pan(color, name, top, bottom):
    """Frigideira do varal (perfil de build.pan): esmalte por fora, granito por dentro."""
    outer = [(0.0, 0.0), (0.9, 0.0), (1.0, 0.02), (1.08, 0.08), (1.13, 0.2), (1.18, 0.36), (1.22, 0.44), (1.25, 0.47)]
    inner = [(1.25, 0.47), (1.21, 0.5), (1.14, 0.46), (1.07, 0.24), (1.01, 0.14), (0.9, 0.1), (0.0, 0.1)]
    out = [lib.solid([lib.assign(lib.lathe(name + "_out", outer, 64), parts.enamel(color, top, bottom)),
                      lib.assign(lib.lathe(name + "_in", inner, 64), parts.speckled("#8e9dad", "#eef3f8"))], name + "_body")]
    return out + handle(name + "_handle", (1.2, 0.4, 0), -math.pi / 2 + 0.14, 0.3, 1.35, 0.13, "panhandle")


def sauce_bowl():
    """Tigelinha de molho (R 0,95, H 0,62): branca com dois filetes vermelhos. O molho de
    dentro fica no jogo (stir.js tinge a cor)."""
    outer, inner = bowl_profile(0.95, 0.62)
    white = parts.enamel("#fffaf2", "#ffffff", "#efe8dc")
    out = [lib.solid([lib.assign(lib.lathe("sauce_out", outer, 64), white),
                      lib.assign(lib.lathe("sauce_in", inner, 64), white)], "sauce_body")]
    r = wall_r(outer)
    red = parts.ceramic("#e5484d")
    out += [band("sauce_band0", r, 0.47, 0.5, red), band("sauce_band1", r, 0.53, 0.545, red)]
    return out


def starch():
    """Tigela de amido: menta por fora, creme por dentro, um monte de pó com a colher de pau
    enterrada (posição de build.cornstarch)."""
    outer, inner = bowl_profile(1.0, 0.62)
    out = [lib.solid([lib.assign(lib.lathe("starch_out", outer, 64), parts.enamel("#a9e6d4", "#d8f6ec", "#86cdb8")),
                      lib.assign(lib.lathe("starch_in", inner, 64), parts.ceramic("#fbf3e2"))], "starch_body")]
    heap = lib.lathe("starch_heap", [(0.0, 0.5), (0.93, 0.56), (0.65, 0.68), (0.4, 0.86), (0.18, 0.99), (0.0, 1.02)], 64)
    heap = lib.solid([heap], "starch_heap")
    lib.subsurf(heap, 1)
    lib.apply_all(heap)
    lib.displace(heap, 0.025, 6.0, 3)
    out.append(lib.assign(heap, M("powder", lambda: lib.ramp_mat(
        "amido", [(0, "#efe9dc"), (0.5, "#fbf8f1"), (1, "#ffffff")], rough=0.95, spec=0.2, scale=18,
        bump=0.35, bump_scale=160))))
    out += parts.xform(parts.wooden_spoon("starch_spoon"), (0.3, 0.86, 0.05), (0.15, 0, -0.95))
    return out


def rice_bowl():
    """Tigela de arroz: porcelana branca com pintas e filete anil, pé e borda redonda."""
    outer = [(0.0, 0.0), (0.38, 0.0), (0.42, 0.01), (0.44, 0.06), (0.48, 0.07), (0.8, 0.3), (0.97, 0.6), (1.0, 0.7), (1.0, 0.74)]
    inner = [(1.0, 0.74), (0.965, 0.75), (0.93, 0.7), (0.78, 0.38), (0.4, 0.14), (0.0, 0.12)]
    out = [lib.solid([lib.assign(lib.lathe("ricebowl_out", outer, 72), parts.dotted("#fbfaf6", "#3f5fae", 8.0, 0.13)),
                      lib.assign(lib.lathe("ricebowl_in", inner, 72), parts.ceramic("#fbfdff"))], "ricebowl_body")]
    out.append(band("ricebowl_band", wall_r(outer), 0.6, 0.64, parts.ceramic("#3f5fae"), 72))
    out.append(band("ricebowl_foot", wall_r(outer), 0.02, 0.06, parts.ceramic("#3f5fae"), 72))
    return out


def rice():
    """Monte de arroz (dome de build.rice): domo e uns 600 grãos deitados nele, assados num
    casco só. Os grãos são grandes e claros, com o vão levemente dourado."""
    R = 0.92
    dome = lambda r: 0.66 + 0.4 * (1 - (r / R) ** 2)  # noqa: E731
    m = M("rice", lambda: lib.ramp_mat("arroz", [(0, "#efe6d2"), (0.5, "#fffcf4"), (1, "#ffffff")],
                                       rough=0.45, spec=0.5, sss=0.2, scale=20, bump=0.05))
    base = lib.lathe("rice_dome", [(R * (1 - i / 8), dome(R * (1 - i / 8))) for i in range(9)], 48)
    base.data.transform(Matrix.Translation((0, 0, -0.02)))  # o vão fica por baixo dos grãos
    out = [lib.assign(base, M("rice_gap", lambda: lib.mat("arroz_vao", "#f3ead6", rough=0.6)))]
    # casco do jogo: um domo liso na altura média dos grãos (em voxel, os grãos viraram farelo)
    cap = lib.solid([lib.lathe("rice_cap", [(0.0, 0.6), (R + 0.03, 0.6)] + [(R * (1 - i / 10) + 0.03 * (1 - i / 10), dome(R * (1 - i / 10)) + 0.03)
                                                                          for i in range(11)], 48)], "rice_cap")
    rnd = random.Random(5)
    for i in range(600):
        a, r = rnd.uniform(0, math.tau), math.sqrt(rnd.random()) * R * 0.97
        g = lib.sphere(f"grain{i}", 1.0, 10, 6, scale=(0.032, 0.032, 0.07))
        g.rotation_euler = (math.pi / 2 + rnd.uniform(-0.5, 0.5), 0, rnd.uniform(0, math.tau))
        g.location = (r * math.cos(a), r * math.sin(a), dome(r) - 0.005 + rnd.uniform(0, 0.025))
        out.append(lib.assign(g, m))
    return out, cap


def cloche():
    """Cúpula de inox (raio 1,62, build.cloche): domo com espessura (aparece por dentro quando
    abre), friso no meio e pegador dourado. O pegador é peça à parte, de ouro."""
    prof = [(1.62, 0.0), (1.6, 0.1)] + [(1.58 * math.cos(i / 16 * math.pi / 2), 0.1 + 1.25 * math.sin(i / 16 * math.pi / 2))
                                        for i in range(1, 17)]
    dome = lib.lathe("cloche_dome", prof, 96)
    sol = dome.modifiers.new("sol", "SOLIDIFY")
    sol.thickness, sol.offset = 0.03, 0
    dome = lib.solid([dome], "cloche_dome")
    lip = parts.torus("cloche_lip", 1.61, 0.05, 96, 10)
    bead = parts.torus("cloche_bead", 1.58 * math.cos(0.5) + 0.01, 0.025, 96, 8)
    bead.location.z = 0.1 + 1.25 * math.sin(0.5)
    stem = lib.lathe("cloche_stem", [(0.12, 1.33), (0.09, 1.38), (0.07, 1.45), (0.0, 1.46)], 24)
    for o in (dome, lip, bead, stem):
        lib.assign(o, parts.steel())
    knob = lib.sphere("cloche_knob", 0.18, 32, 16, scale=(1, 1, 0.6))
    knob.location.z = 1.54
    ring = parts.torus("cloche_knobring", 0.09, 0.03, 32, 8)
    ring.location.z = 1.45
    gold = M("goldmetal", lambda: lib.ramp_mat("ouro_metal", [(0, "#c99437"), (0.5, "#efc161"), (1, "#fbe3a2")],
                                               rough=0.2, spec=0.7, by="height", scale=4, bump=0))
    return [dome, lip, bead, stem], [lib.assign(knob, gold), lib.assign(ring, gold)]


def board():
    """Tábua de cortar (build.board): bloco de réguas coladas em dois tons de madeira, quinas
    bem arredondadas, alça com furo. Tampo em y = 0,26, como no jogo."""
    W, H, r = 1.5, 0.95, 0.25
    pts = []

    def arc(cx, cy, a0, a1, rr, n=8):
        for k in range(n + 1):
            a = a0 + (a1 - a0) * k / n
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    arc(-W + r, -H + r, math.pi, 1.5 * math.pi, r)
    arc(W - r, -H + r, 1.5 * math.pi, 2 * math.pi, r)
    for k in range(13):  # alça: meia lua saindo do lado direito
        a = -math.pi / 2 + k / 12 * math.pi
        pts.append((W + 0.55 * math.cos(a) ** 0.8 if math.cos(a) > 0 else W, 0.32 * math.sin(a)))
    arc(W - r, H - r, 0, 0.5 * math.pi, r)
    arc(-W + r, H - r, 0.5 * math.pi, math.pi, r)
    bm = bmesh.new()
    vs = [bm.verts.new(lib.T(x, 0, -y)) for x, y in pts]  # shape em xy, deitada: y da forma vira -z do jogo
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    f = bm.faces.new([v for v in vs if v.is_valid])
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]:
        v.co.z += 0.26
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    slab = lib.from_bmesh("board_slab", bm, smooth=False)
    cut = lib.cylinder("board_hole", 0.1, 0.1, 1.0, 32, loc=lib.T(W + 0.24, 0.13, 0))
    cut.hide_render = True
    cut.hide_set(True)
    bo = slab.modifiers.new("hole", "BOOLEAN")
    bo.object, bo.solver = cut, "EXACT"
    bv = slab.modifiers.new("bev", "BEVEL")
    bv.width, bv.segments, bv.limit_method, bv.angle_limit = 0.06, 4, "ANGLE", math.radians(40)
    slab.modifiers.new("wn", "WEIGHTED_NORMAL")

    def make():  # réguas: faixas ao longo de x, cada uma com seu tom; veio ondulado por cima
        # veio discreto (lição 15): tons vizinhos; o contraste vem das réguas
        # no jogo, veio largo de scale 1,2 virou listra ondulada: veio fino e quase da mesma cor
        m = lib.ramp_mat("tabua", [(0, "#e6b475"), (0.5, "#eabc80"), (1, "#edc288")], rough=0.45, spec=0.4,
                         coat=0.2, by="wave", axis="Y", scale=4.0, bump=0.02, bump_scale=60)
        n, l = m.node_tree.nodes, m.node_tree.links
        tc = n.new("ShaderNodeTexCoord")
        sep = n.new("ShaderNodeSeparateXYZ")
        l.new(tc.outputs["Object"], sep.inputs["Vector"])
        mul = n.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        mul.inputs[1].default_value = 3.2  # umas 6 réguas na largura
        l.new(sep.outputs["Y"], mul.inputs[0])
        fl = n.new("ShaderNodeMath")
        fl.operation = "FLOOR"
        l.new(mul.outputs[0], fl.inputs[0])
        wn = n.new("ShaderNodeTexWhiteNoise")
        wn.noise_dimensions = "1D"
        l.new(fl.outputs[0], wn.inputs["W"])
        tone = n.new("ShaderNodeMapRange")
        tone.inputs["To Min"].default_value, tone.inputs["To Max"].default_value = 0.78, 1.08
        l.new(wn.outputs["Value"], tone.inputs["Value"])
        mx = n.new("ShaderNodeMix")
        mx.data_type, mx.blend_type = "RGBA", "MULTIPLY"
        mx.inputs["Factor"].default_value = 1.0
        bsdf = n["Principled BSDF"]
        src = bsdf.inputs["Base Color"].links[0].from_socket
        l.new(src, mx.inputs["A"])
        l.new(tone.outputs["Result"], mx.inputs["B"])
        l.new(mx.outputs["Result"], bsdf.inputs["Base Color"])
        return m
    lib.assign(slab, M("board", make))
    return [slab], cut


def build():
    bowl = parts.shift(mixing_bowl(), 0)
    plate = parts.shift(serving_plate(), 5)
    wk = parts.shift(wok(), 10.5)
    pt = parts.shift(pan("#22a58d", "pan_teal", "#6fd3bd", "#15806c"), 16)
    pc = parts.shift(pan("#ef6b4a", "pan_coral", "#ffab8f", "#cc4e30"), 20)
    sb = parts.shift(sauce_bowl(), 24.5)
    st = parts.shift(starch(), 27.5)
    rb = parts.shift(rice_bowl(), 30.5)
    rc, cap = rice()
    parts.shift(rc + [cap], 30.5)
    dome, knob = cloche()
    parts.shift(dome, 35)
    parts.shift(knob, 35)
    bd, cut = board()
    parts.shift(bd + [cut], 40)
    common = {"extrusion": 0.03, "samples": 32, "coat": 0.6, "ao": 0.4}
    metal = {"extrusion": 0.03, "samples": 32, "metal": 1.0, "roughness": False}
    return [
        {"name": "bowl", "high": bowl, "tris": 4000, "size": 1024, "origin": (0, 0, 0), **common},
        {"name": "plate", "high": plate, "shell": plate[:1], "tris": 3000, "size": 1024, "origin": (5, 0, 0), **common},
        {"name": "wok", "high": wk, "tris": 5000, "size": 1024, "origin": (10.5, 0, 0), **common},
        {"name": "pan_teal", "high": pt, "tris": 1600, "size": 512, "origin": (16, 0, 0), **common},
        {"name": "pan_coral", "high": pc, "tris": 1600, "size": 512, "origin": (20, 0, 0), **common},
        {"name": "saucebowl", "high": sb, "shell": sb[:1], "tris": 1600, "size": 512, "origin": (24.5, 0, 0), **common},
        {"name": "starch", "high": st, "tris": 3000, "size": 512, "origin": (27.5, 0, 0), **common, "coat": 0.2},
        # o arroz assa antes da tigela: a parede da tigela escurece a beira do monte
        {"name": "rice", "high": rc, "shell": [cap], "tris": 1500, "size": 1024, "origin": (30.5, 0, 0),
         "extrusion": 0.07, "samples": 32},
        {"name": "ricebowl", "high": rb, "shell": rb[:1], "tris": 2000, "size": 512, "origin": (30.5, 0, 0), **common},
        {"name": "cloche", "high": dome, "tris": 3000, "size": 512, "origin": (35, 0, 0), **metal, "rough": 0.12},
        {"name": "cloche_knob", "high": knob, "tris": 600, "size": 256, "origin": (35, 0, 0), **metal, "rough": 0.18},
        {"name": "board", "high": bd, "tris": 2500, "size": 1024, "origin": (40, 0, 0), **common, "coat": 0.2},
    ]
