# Leva 5: utensílios das estações. Faca, colher de pau, batedor, espátula de wok, rolo de
# massa, peneira, socador, colher bailarina, cortador de pizza e a concha do varal. Cada um no
# referencial local do procedural que troca (src/three/kit.js e gear.js): a ponta, o fio e o eixo
# ficam onde os minijogos esperam. Metal e plástico são peças separadas, porque o metal vale
# para a malha inteira (ver lib.bake). Referência: utensílio grosso, liso e arredondado, inox
# claro com cabo colorido (docs/inspiracao/cooking-mama-cuisine.md).
import math

import bmesh

import lib
import parts
from parts import M

VIEW = {"elev": 35, "azim": -15, "fill": 0.6}


def red():
    return parts.enamel("#e8453c", "#ff9a8f", "#c3332c")


def sheet(name, nx, ny, x0, x1, ybot, ytop, half, zoff=lambda x, y: 0.0):
    """Chapa (lâmina, espátula) no plano xy do jogo: entre ybot(x) e ytop(x), com meia
    espessura half(x, v) (v = 0 embaixo, 1 em cima) e curvatura zoff(x, y)."""
    bm = bmesh.new()
    F, B = [], []
    for i in range(nx + 1):
        x = x0 + (x1 - x0) * i / nx
        fr, bk = [], []
        for j in range(ny + 1):
            v = j / ny
            y = ybot(x) + (ytop(x) - ybot(x)) * v
            t, z = half(x, v), zoff(x, y)
            fr.append(bm.verts.new(lib.T(x, y, z + t)))
            bk.append(bm.verts.new(lib.T(x, y, z - t)))
        F.append(fr)
        B.append(bk)
    for i in range(nx):
        for j in range(ny):
            bm.faces.new((F[i][j], F[i + 1][j], F[i + 1][j + 1], F[i][j + 1]))
            bm.faces.new((B[i][j + 1], B[i + 1][j + 1], B[i + 1][j], B[i][j]))
        for j in (0, ny):  # bordas de baixo e de cima
            bm.faces.new((F[i][j], B[i][j], B[i + 1][j], F[i + 1][j]))
    for i in (0, nx):  # pontas
        for j in range(ny):
            bm.faces.new((F[i][j], F[i][j + 1], B[i][j + 1], B[i][j]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return lib.from_bmesh(name, bm)


def bezier_y(p0, c, p1):
    """y da curva quadrática p0-c-p1 em função de x (x monótono na curva)."""
    def y(x):
        lo, hi = 0.0, 1.0
        f = lambda t: (1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * c[0] + t * t * p1[0]  # noqa: E731
        up = p1[0] > p0[0]
        for _ in range(40):
            mid = (lo + hi) / 2
            if (f(mid) < x) == up:
                lo = mid
            else:
                hi = mid
        t = (lo + hi) / 2
        return (1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * c[1] + t * t * p1[1]
    return y


def knife():
    """Faca do chef (forma de build.knife, no plano xy, ponta em +x): lâmina que afina até o
    fio, reforço de inox e cabo vermelho com rebites dourados."""
    bot = bezier_y((1.35, -0.15), (2.2, -0.12), (2.55, 0.34))
    top = bezier_y((2.55, 0.34), (2.05, 0.5), (1.4, 0.52))
    yb = lambda x: -0.15 if x <= 1.35 else bot(x)  # noqa: E731
    yt = lambda x: 0.52 if x <= 1.4 else top(x)  # noqa: E731
    half = lambda x, v: (0.006 + 0.03 * (v * v * (3 - 2 * v))) * (1 - (x / 2.56) ** 6)  # fio fino, lombo grosso  # noqa: E731
    blade = lib.assign(sheet("knife_blade", 40, 8, 0.0, 2.55, yb, yt, half), parts.steel())
    bolster = lib.assign(lib.box("knife_bolster", 0.2, 0.72, 0.24, at=(-0.07, 0.185, 0), bevel=0.07, seg=3), parts.steel())
    handle = lib.assign(lib.box("knife_grip", 1.3, 0.5, 0.32, at=(-0.82, 0.17, 0), bevel=0.15, seg=4), red())
    gold = M("rivet", lambda: lib.ramp_mat("rebite", [(0, "#d9a441"), (1, "#fbe2a0")], rough=0.2, spec=0.7,
                                           by="height", scale=4, bump=0))
    rivets = []
    for x in (-0.42, -0.82, -1.22):
        for z in (0.16, -0.16):
            r = lib.sphere(f"knife_rivet{x}{z}", 0.06, 16, 8, loc=lib.T(x, 0.17, z), scale=(1, 0.45, 1))
            rivets.append(lib.assign(r, gold))
    return [blade, bolster], [handle] + rivets


def whisk():
    """Batedor de arame (build.whisk): quatro laços de inox que se abrem perto da ponta
    (y = -1,36), anel de arremate e cabo menta com argola para pendurar."""
    wires = []
    for k in range(4):
        pts = []
        for s in range(41):  # meia volta descendo por +x e subindo por -x
            u = s / 20 if s <= 20 else (40 - s) / 20
            side = 1 if s <= 20 else -1
            x = side * 0.31 * math.sin(math.pi * u ** 1.4)
            y = -1.36 * (1 - (1 - u) ** 2)
            a = k / 4 * math.pi
            pts.append((x * math.cos(a), y, x * math.sin(a)))
        wires.append(lib.assign(parts.tube(f"whisk_wire{k}", pts, 0.018, 6), parts.steel()))
    ferrule = lib.assign(lib.lathe("whisk_ferrule", [(0.0, -0.04), (0.04, -0.04), (0.06, 0.06), (0.065, 0.14), (0.0, 0.14)], 20), parts.steel())
    grip = lib.lathe("whisk_grip", [(0.0, 0.12), (0.07, 0.12), (0.085, 0.2), (0.075, 0.6), (0.095, 0.92), (0.08, 1.0), (0.0, 1.02)], 20)
    lib.assign(grip, parts.enamel("#7fd0c4", "#c9f1ea", "#5bb3a6"))
    loop = parts.torus("whisk_loop", 0.08, 0.018, 20, 6)
    loop.rotation_euler.x = math.pi / 2
    loop.location = lib.T(0, 1.08, 0)
    lib.assign(loop, parts.steel())
    return wires + [ferrule, loop], [grip]


def spatula():
    """Espátula de wok (build.spatula): pá de inox em concha, pescoço inclinado e cabo de
    madeira com ponteira vermelha. A ponta fica na origem."""
    yb = bezier_y((-0.32, 0.0), (0.0, -0.06), (0.32, 0.0))
    yt = lambda x: 0.62 * math.sqrt(max(0.0, 1 - (abs(x) / 0.33) ** 4))  # noqa: E731
    head = sheet("spatula_head", 16, 8, -0.32, 0.32, yb, yt, lambda x, v: 0.012 + 0.004 * v, lambda x, y: x * x * 0.6)
    lib.assign(head, parts.steel())
    neck = lib.lathe("spatula_neck", [(0.0, -0.4), (0.04, -0.4), (0.035, 0.3), (0.045, 0.37), (0.0, 0.37)], 12)
    parts.xform([neck], (0, 0.95, 0.12), (0.3, 0, 0))
    lib.assign(neck, parts.steel())
    grip = lib.lathe("spatula_grip", [(0.0, -0.5), (0.07, -0.5), (0.085, -0.4), (0.08, 0.3), (0.09, 0.45), (0.06, 0.52), (0.0, 0.53)], 20)
    tip = lib.lathe("spatula_cap", [(0.0, 0.42), (0.092, 0.42), (0.092, 0.5), (0.065, 0.54), (0.0, 0.545)], 20)
    grip.scale = tip.scale = (1, 0.85, 1)
    parts.xform([grip, tip], (0, 1.7, 0.38), (0.3, 0, 0))
    lib.assign(grip, parts.wood("handle", (("#b06e35", 0), ("#c98a4b", 0.5), ("#dca468", 1))))
    lib.assign(tip, red())
    return [head, neck], [grip, tip]


def rolling_pin():
    """Rolo de massa (gear.rollingPin): corpo de madeira clara com as pontas arredondadas e
    cabos vermelhos com um friso creme. Eixo em x, raio 0,24."""
    body = lib.lathe("pin_body", [(0.0, -1.16), (0.19, -1.16), (0.235, -1.13), (0.245, -1.0), (0.245, 1.0),
                                  (0.235, 1.13), (0.19, 1.16), (0.0, 1.16)], 40)
    lib.assign(body, parts.wood("maple", (("#e3b47a", 0), ("#ecc48e", 0.5), ("#f4d4a2", 1))))
    out = [body]
    for s in (-1, 1):
        prof = [(0.0, 1.13), (0.05, 1.13), (0.05, 1.3), (0.1, 1.33), (0.115, 1.55), (0.1, 1.79), (0.05, 1.84), (0.0, 1.85)]
        h = lib.lathe(f"pin_handle{s}", [(r, s * z) for r, z in prof], 28)
        ring = lib.lathe(f"pin_ring{s}", [(r, s * z) for r, z in [(0.11, 1.38), (0.118, 1.4), (0.118, 1.44), (0.11, 1.46), (0.11, 1.38)]], 28)
        out += [lib.assign(lib.solid([h], f"pin_handle{s}"), red()), lib.assign(lib.solid([ring], f"pin_ring{s}"), parts.ceramic("#fff6e3"))]
    return parts.xform(out, (0, 0, 0), (0, 0, -math.pi / 2))  # y do torno vira x


def sieve():
    """Peneira (gear.sieve): aro de inox com orelha de apoio do lado oposto ao cabo. A tela
    fica no jogo (é transparente)."""
    ring = lib.assign(parts.torus("sieve_rim", 0.62, 0.05, 64, 10), parts.steel())
    neck = lib.assign(parts.tube("sieve_neck", [(0.6, 0.0, 0.0), (0.75, 0.02, 0.0), (0.85, 0.03, 0.0)], 0.04, 10), parts.steel())
    ear = lib.assign(parts.tube("sieve_ear", [(-0.6, 0.0, 0.12), (-0.78, 0.0, 0.1), (-0.82, 0.0, 0.0), (-0.78, 0.0, -0.1), (-0.6, 0.0, -0.12)],
                                0.03, 8), parts.steel())
    grip = lib.lathe("sieve_grip", [(0.0, -0.5), (0.05, -0.5), (0.07, -0.42), (0.065, 0.3), (0.075, 0.45), (0.05, 0.52), (0.0, 0.53)], 20)
    parts.xform([grip], (1.28, 0.03, 0), (0, 0, -math.pi / 2))
    return [ring, neck, ear], [lib.assign(grip, red())]


def muddler():
    """Socador de madeira (gear.muddler): perfil do jogo com dois frisos vermelhos no cabo e
    a ponta escurecida de uso. A ponta fica na origem."""
    prof = [(0.0, 0.0), (0.18, 0.0), (0.2, 0.03), (0.2, 0.3), (0.11, 0.5), (0.1, 1.5), (0.16, 1.7), (0.14, 1.95), (0.08, 1.99), (0.0, 2.0)]
    body = lib.lathe("muddler", prof, 32)
    lib.assign(body, M("muddlerwood", lambda: lib.ramp_mat(
        "socador", [(0, "#8a5228"), (0.12, "#b5773e"), (0.3, "#d29a5c"), (1, "#e2b073")], rough=0.5, spec=0.4,
        coat=0.15, by="height", scale=3, bump=0.04, bump_scale=60)))
    bands = [lib.assign(lib.solid([lib.lathe(f"muddler_band{k}", [(0.0, y), (0.112, y), (0.112, y + 0.05), (0.0, y + 0.05)], 32)],
                                  f"muddler_band{k}"), red()) for k, y in enumerate((1.25, 1.36))]
    return [body] + bands


def bar_spoon():
    """Colher bailarina (gear.barSpoon): haste torcida de inox, concha pequena na ponta
    (origem) e bolinha vermelha em cima."""
    bm = bmesh.new()
    rings, n = [], 120
    for k in range(n + 1):  # haste quadrada que gira 12 voltas: o brilho corre em espiral
        y = 0.28 + (2.45 - 0.28) * k / n
        a = k / n * 12 * math.tau
        rings.append([bm.verts.new(lib.T(0.022 * math.cos(a + q * math.pi / 2), y, 0.022 * math.sin(a + q * math.pi / 2)))
                      for q in range(4)])
    for k in range(n):
        for q in range(4):
            bm.faces.new((rings[k][q], rings[k][(q + 1) % 4], rings[k + 1][(q + 1) % 4], rings[k + 1][q]))
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    stem = lib.assign(lib.from_bmesh("barspoon_stem", bm), parts.steel())
    head = parts.spoon_bowl("barspoon_head", 0.13, 0.18, 0.045)
    head.location = lib.T(0, 0.18, 0)
    lib.assign(head, parts.steel())
    neck = lib.assign(lib.lathe("barspoon_neck", [(0.0, 0.3), (0.03, 0.3), (0.02, 0.36), (0.0, 0.37)], 12), parts.steel())
    cap = lib.assign(lib.sphere("barspoon_cap", 0.075, 24, 12, loc=lib.T(0, 2.52, 0)), red())
    return [stem, head, neck], [cap]


def pizza_wheel():
    """Cortador de pizza (gear.pizzaWheel): disco de inox à parte (o jogo gira), garfo de
    inox dos dois lados do disco e cabo vermelho com cubo creme."""
    disc = lib.lathe("wheel_disc", [(0.0, -0.022), (0.27, -0.022), (0.34, 0.0), (0.27, 0.022), (0.0, 0.022)], 64)
    disc = lib.solid([disc], "wheel_disc")
    parts.xform([disc], (0, 0, 0), (math.pi / 2, 0, 0))  # eixo do torno (y) vira z
    lib.assign(disc, parts.steel())
    fork = []
    for z in (-0.045, 0.045):
        f = lib.box(f"wheel_fork{z}", 0.1, 0.62, 0.025, at=(0, 0.31, z), bevel=0.012, seg=2)  # a placa sobe do cubo
        parts.xform([f], (0, 0.34, 0), (0, 0, -0.75))
        fork.append(lib.assign(f, parts.steel()))
    hub = lib.solid([lib.lathe("wheel_hub", [(0.0, -0.075), (0.085, -0.075), (0.085, 0.075), (0.0, 0.075)], 24)], "wheel_hub")
    parts.xform([hub], (0, 0.34, 0), (math.pi / 2, 0, 0))
    lib.assign(hub, parts.ceramic("#fff6e3"))
    grip = lib.lathe("wheel_grip", [(0.0, -0.42), (0.07, -0.42), (0.095, -0.3), (0.085, 0.0), (0.1, 0.3), (0.075, 0.42), (0.0, 0.43)], 24)
    parts.xform([grip], (0.72, 0.95, 0), (0, 0, -1.0))
    lib.assign(grip, red())
    return [disc], fork, [hub, grip]


def ladle():
    """Concha do varal (sets.hangingSet): cabo com gancho em cima e a cuba de inox com
    espessura, aberta para cima, em (-0,26, -1,75)."""
    cup = lib.lathe("ladle_cup", [(0.0, -0.28), (0.12, -0.262), (0.21, -0.19), (0.27, -0.08), (0.285, 0.0), (0.262, 0.0),
                                  (0.248, -0.07), (0.19, -0.18), (0.1, -0.24), (0.0, -0.255)], 40)
    cup = lib.solid([cup], "ladle_cup")
    cup.location = lib.T(-0.26, -1.75, 0)
    arm = parts.tube("ladle_arm", [(0.0, -0.06, 0), (0.0, -0.2, 0), (0.0, -1.0, 0), (-0.02, -1.5, 0), (-0.06, -1.62, 0),
                                   (-0.1, -1.66, 0)], lambda t: 0.04 - 0.012 * t, 10)
    hook = parts.tube("ladle_hook", [(0.0, -0.06, 0), (-0.06, 0.0, 0), (0.0, 0.06, 0), (0.06, 0.0, 0), (0.03, -0.04, 0)], 0.025, 8)
    return [lib.assign(o, parts.steel()) for o in (cup, arm, hook)]


def build():
    kb, kh = knife()
    wk_m, wk_h = whisk()
    sh, sg = spatula()
    sv_m, sv_h = sieve()
    bs_m, bs_c = bar_spoon()
    wd, wf, wh = pizza_wheel()
    layout = [  # x de cada item só no Blender (ver parts.shift)
        (0, kb + kh), (4, parts.wooden_spoon("spoon")), (7, wk_m + wk_h), (10, sh + sg), (14, rolling_pin()),
        (19, sv_m + sv_h), (23, muddler()), (26, bs_m + bs_c), (29, wd + wf + wh), (32, ladle()),
    ]
    for x, objs in layout:
        parts.shift(objs, x)
    parts.shift(wd, 1.5)  # o disco gira no jogo: longe do garfo, para a oclusão não manchar um lado
    spoon = layout[1][1]
    metal = {"metal": 1.0, "roughness": False, "rough": 0.2, "extrusion": 0.02, "samples": 32, "ao": 0.3}
    plain = {"extrusion": 0.02, "samples": 32, "coat": 0.5, "ao": 0.3}
    P = lambda name, high, x, tris, size, kind: {"name": name, "high": high, "origin": (x, 0, 0), "tris": tris, "size": size, **kind}  # noqa: E731
    return [
        P("knife_blade", kb, 0, 1200, 512, metal),
        P("knife_handle", kh, 0, 1200, 256, plain),
        P("spoon", spoon, 4, 1200, 256, {**plain, "coat": 0.15}),
        P("whisk_wire", wk_m, 7, 2400, 256, metal),
        P("whisk_handle", wk_h, 7, 500, 256, plain),
        P("spatula_head", sh, 10, 900, 256, metal),
        P("spatula_handle", sg, 10, 700, 256, {**plain, "coat": 0.15}),
        P("pin", layout[4][1], 14, 2000, 512, {**plain, "coat": 0.2}),
        P("sieve_rim", sv_m, 19, 1500, 256, metal),
        P("sieve_handle", sv_h, 19, 500, 256, plain),
        P("muddler", layout[6][1], 23, 900, 256, {**plain, "coat": 0.15}),
        P("barspoon", bs_m, 26, 1500, 256, metal),
        P("barspoon_cap", bs_c, 26, 300, 128, plain),
        P("wheel_disc", wd, 30.5, 400, 256, {**metal, "rough": 0.12}),
        P("wheel_fork", wf, 29, 300, 128, metal),
        P("wheel_handle", wh, 29, 900, 256, plain),
        P("ladle", layout[9][1], 32, 1500, 256, metal),
    ]
