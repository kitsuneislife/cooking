# Peças reaproveitadas entre os modelos: prato, paninho, florete, folha, roseta de creme, limão.
# Uma peça nova que aparece em mais de um prato entra aqui, não copiada em cada modelo.
import math
import random

import bmesh
from mathutils import Matrix, Vector

import lib

_mats = {}


def M(key, make):
    """Material criado uma vez e reaproveitado (mesmo material = menos draw calls no jogo)."""
    if key not in _mats:
        _mats[key] = make()
    return _mats[key]


# ---------- louça e mesa ----------

def plate(r=1.6, name="plate"):
    """Prato branco de borda azul, como o da tela de prato pronto do vídeo de referência."""
    prof = [(0.0, 0.0), (r * 0.62, 0.0), (r * 0.66, 0.03), (r * 0.72, 0.08), (r * 0.98, 0.16),
            (r, 0.17), (r * 0.99, 0.19), (r * 0.72, 0.11), (r * 0.62, 0.05), (0.0, 0.05)]
    p = lib.assign(lib.lathe(name, prof, 64), M("plate", lambda: lib.ramp_mat(
        "porcelana", [(0, "#ffffff"), (1, "#eef1f6")], rough=0.18, spec=0.6, scale=2, bump=0)))
    band = [(r * 0.86, 0.137), (r * 0.94, 0.156), (r * 0.94, 0.161), (r * 0.86, 0.142)]
    b = lib.assign(lib.lathe(name + "_rim", band, 64), M("rim", lambda: lib.mat(
        "borda", "#3f7fd6", rough=0.2, spec=0.6)))
    b.location.z = 0.012
    return [p, b]


def cloth(size=4.2, colors=("#ff9fbf", "#ffffff"), name="cloth", seed=1):
    """Paninho xadrez com dobras leves embaixo do prato (o 'enfeite conta' da referência)."""
    bm = bmesh.new()
    bm.loops.layers.uv.new()  # calc_uvs só preenche se a camada de UV já existe
    bmesh.ops.create_grid(bm, x_segments=24, y_segments=24, size=size / 2, calc_uvs=True)
    o = lib.from_bmesh(name, bm)
    o.rotation_euler.z = math.radians(18)
    lib.displace(o, 0.05, 0.9, seed, axis=2)
    o.location.z = -0.02

    def make():
        m = lib.mat("xadrez", colors[0], rough=0.85, spec=0.2)
        n, l = m.node_tree.nodes, m.node_tree.links
        ch = n.new("ShaderNodeTexChecker")
        ch.inputs["Scale"].default_value = 9
        ch.inputs["Color1"].default_value = (*lib.hex_rgb(colors[0]), 1)
        ch.inputs["Color2"].default_value = (*lib.hex_rgb(colors[1]), 1)
        tc = n.new("ShaderNodeTexCoord")
        l.new(tc.outputs["UV"], ch.inputs["Vector"])  # UV: as dobras não entortam o xadrez
        l.new(ch.outputs["Color"], n["Principled BSDF"].inputs["Base Color"])
        return m
    return lib.assign(o, M("cloth" + colors[0], make))


# ---------- montes de comida ----------

def on_dome(n, R, H, center=(0, 0, 0), seed=0, depth=(0.75, 1.0)):
    """n pontos espalhados num monte (domo) de raio R e altura H, com a normal da superfície.
    depth < 1 afunda a peça no monte, para não ficar buraco entre as de cima."""
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        d = R * math.sqrt(rnd.random()) * 0.92
        a = rnd.uniform(0, math.tau)
        k = rnd.uniform(*depth)
        z = H * (1 - (d / R) ** 2) ** 0.8 * k
        nrm = Vector((2 * d / R * math.cos(a) * H / R, 2 * d / R * math.sin(a) * H / R, 1)).normalized()
        out.append((Vector(center) + Vector((d * math.cos(a), d * math.sin(a), z)), nrm, rnd))
    return out


def place(o, loc, nrm, spin):
    """Assenta a peça na superfície: Z da peça segue a normal, gira em torno dela."""
    o.matrix_basis = (Matrix.Translation(loc) @ nrm.to_track_quat("Z", "Y").to_matrix().to_4x4()
                      @ Matrix.Rotation(spin, 4, "Z") @ o.matrix_basis)
    return o


def dome(name, R, H, center, m):
    """Recheio do monte: some atrás das peças e tampa os buracos entre elas."""
    prof = [(0.0, 0.0)] + [(R * (1 - i / 8) ** 0.5, H * i / 8) for i in range(9)]
    o = lib.lathe(name, prof, 32)
    o.location = center
    return lib.assign(o, m)


# ---------- vegetais ----------

def floret(r=0.3, loc=(0, 0, 0), seed=0, stem=0.35):
    """Florete de brócolis: talo claro e copa de botões com degradê (escuro em cima,
    verde-amarelado embaixo), como a guarnição da referência."""
    rnd = random.Random(seed)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=5, radius=r)  # sem polo: o polo da UV sphere marca o topo
    top = lib.from_bmesh(f"floret{seed}", bm)
    top.scale = (1, 1, 0.72)
    lib.displace(top, r * 0.12, 2.2 / r, seed)       # cachos
    lib.displace(top, r * 0.06, 9 / r, seed + 9)     # botões
    lib.assign(top, M("bud", lambda: lib.ramp_mat(
        "botoes", [(0.0, "#b5d468"), (0.35, "#5c9a34"), (0.7, "#2f6e2a"), (1, "#24572a")],
        rough=0.8, spec=0.3, by="height", scale=9, bump=0.8, cells=140)))
    top.location = (loc[0], loc[1], loc[2] + stem + r * 0.3)
    st = lib.cylinder(f"stem{seed}", r * 0.32, r * 0.22, stem, 12,
                      loc=(loc[0], loc[1], loc[2] + stem / 2))
    lib.subsurf(st, 1)
    lib.assign(st, M("stalk", lambda: lib.ramp_mat(
        "talo", [(0, "#d6e8a0"), (1, "#8dbf55")], rough=0.5, spec=0.4, by="height", scale=5,
        bump=0.1, sss=0.1)))
    tilt = Matrix.Rotation(rnd.uniform(-0.25, 0.25), 4, "X") @ Matrix.Rotation(rnd.uniform(-0.25, 0.25), 4, "Y")
    for o in (top, st):
        o.matrix_basis = Matrix.Translation(loc) @ tilt @ Matrix.Translation(-Vector(loc)) @ o.matrix_basis
    return [top, st]


def leaf(L=0.5, color=("#2f8a34", "#5dbb4a"), name="leaf", cup=0.25):
    """Folha com contorno pontudo, nervura central e concha (hortelã, coentro, manjericão)."""
    bm = bmesh.new()
    rows, cols = 10, 6
    grid = []
    for i in range(rows + 1):
        t = i / rows
        w = math.sin(math.pi * t ** 0.8) * L * 0.36
        row = []
        for j in range(cols + 1):
            u = j / cols * 2 - 1
            z = cup * L * u * u - 0.08 * L * math.sin(math.pi * t)
            row.append(bm.verts.new((u * w, t * L, z)))
        grid.append(row)
    for i in range(rows):
        for j in range(cols):
            bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
    o = lib.from_bmesh(name, bm)
    sol = o.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = L * 0.03
    return lib.assign(o, M("leaf" + color[0], lambda: lib.ramp_mat(
        "folha", [(0, color[0]), (1, color[1])], rough=0.35, spec=0.5, by="height", axis="Y",
        scale=6, bump=0.25, sss=0.1)))


# ---------- confeitaria ----------

def rosette(r=0.25, h=0.35, ridges=8, twist=2.2, color="#fff6e4", name="rosette"):
    """Roseta de creme de bico pitanga: espiral com sulcos, a ponta virada."""
    bm = bmesh.new()
    seg, rings = 64, 20
    grid = []
    for k in range(rings + 1):
        t = k / rings
        R = r * (1 - t ** 1.6) + 0.004
        row = []
        for i in range(seg):
            a = i / seg * math.tau
            rr = R * (1 + 0.16 * math.cos(ridges * a + twist * t * math.tau))
            row.append(bm.verts.new((rr * math.cos(a) + t * t * r * 0.25, rr * math.sin(a), t * h)))
        grid.append(row)
    for k in range(rings):
        for i in range(seg):
            j = (i + 1) % seg
            bm.faces.new((grid[k][i], grid[k][j], grid[k + 1][j], grid[k + 1][i]))
    bmesh.ops.contextual_create(bm, geom=grid[0])
    o = lib.from_bmesh(name, bm)
    return lib.assign(o, M("cream", lambda: lib.ramp_mat(
        "creme", [(0, "#f3e2c2"), (1, color)], rough=0.4, spec=0.45, by="height", scale=3,
        bump=0.05, sss=0.3)))


# ---------- cenário (medidas e posições do jogo, por lib.T) ----------

def ceramic(color, name=None):
    """Louça esmaltada de brinquedo: cor lisa com um degradê leve e brilho de esmalte."""
    return M("ceramic" + color, lambda: lib.ramp_mat(
        name or "ceramica" + color, [(0, color), (0.7, color), (1, "#ffffff")], rough=0.18,
        spec=0.6, coat=0.5, scale=2, bump=0.01))


def wood(key="honey", stops=(("#d99a52", 0), ("#e8b46c", 0.5), ("#f2c886", 1))):
    return M("wood" + key, lambda: lib.ramp_mat(
        "madeira_" + key, [(p, c) for c, p in stops], rough=0.5, spec=0.4, coat=0.15, by="wave",
        axis="Y", scale=2.2, bump=0.05, bump_scale=40))


def fabric(name, w, h, nx, ny, shape, m, thick=0.03):
    """Pano em grade (cortina, bandô, pano de prato, toldo): shape(x, y) devolve o ponto no
    jogo; a UV fica em unidades do pano, então a estampa não estica."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new()
    grid = [[bm.verts.new(lib.T(*shape(-w / 2 + w * i / nx, -h / 2 + h * j / ny))) for j in range(ny + 1)]
            for i in range(nx + 1)]
    for i in range(nx):
        for j in range(ny):
            f = bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
            for loop, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                loop[uv].uv = (w * a / nx, h * b / ny)
    o = lib.from_bmesh(name, bm)
    sol = o.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = thick
    return lib.assign(o, m)


def placed(o, at):
    o.location = lib.T(*at)
    return o


def canister(at, r, h, body, lid, name):
    """Pote de mantimento: corpo de louça de ombro redondo, faixa de rótulo e tampa com pegador."""
    prof = [(0, 0), (r * 0.9, 0), (r, r * 0.12), (r, h * 0.86), (r * 0.9, h), (r * 0.6, h), (0, h)]
    b = placed(lib.lathe(name, prof, 32), at)
    label = placed(lib.lathe(name + "_label", [(r * 1.012, h * 0.3), (r * 1.012, h * 0.62)], 32), at)
    lp = [(0, h), (r * 0.98, h), (r * 1.02, h + 0.06), (r * 0.9, h + 0.12), (r * 0.25, h + 0.14),
          (r * 0.22, h + 0.2), (r * 0.3, h + 0.27), (0, h + 0.3)]
    lt = placed(lib.lathe(name + "_lid", lp, 32), at)
    return [lib.assign(b, ceramic(body)), lib.assign(label, ceramic("#fffaf0")), lib.assign(lt, ceramic(lid))]


def bowl_stack(at, colors, name="bowls"):
    out = []
    for i, c in enumerate(colors):
        prof = [(0.3, 0), (0.6, 0.35), (0.62, 0.37), (0.58, 0.37), (0.29, 0.04), (0, 0.04), (0, 0)]
        b = placed(lib.lathe(f"{name}{i}", prof, 40), (at[0], at[1] + i * 0.12, at[2]))
        out.append(lib.assign(b, ceramic(c)))
    return out


def book(at, w, h, d, color, tilt=0.0, name="book"):
    cover = lib.box(name, w, h, d, at=at, bevel=0.03)
    pages = lib.box(name + "_p", w * 0.8, h * 0.95, d * 0.97, at=(at[0], at[1], at[2] + d * 0.03), bevel=0.01)
    for o in (cover, pages):
        o.rotation_euler.y = -tilt  # tombado para o lado, em torno da profundidade
    return [lib.assign(cover, ceramic(color)),
            lib.assign(pages, M("pages", lambda: lib.mat("paginas", "#fbf3e2", rough=0.8)))]


def pot_plant(at, scale=1.0, pot="#d9693a", leafc=("#2f8a34", "#5dbb4a"), n=16, seed=1, name="plant", fruit=None):
    """Vaso com folhas em roseta (manjericão, hera); `fruit` põe bolinhas (limõezinhos)."""
    rnd = random.Random(seed)
    s = scale
    prof = [(0, 0), (0.36 * s, 0), (0.46 * s, 0.6 * s), (0.53 * s, 0.62 * s), (0.53 * s, 0.76 * s),
            (0.44 * s, 0.76 * s), (0.42 * s, 0.7 * s), (0, 0.7 * s)]
    out = [lib.assign(placed(lib.lathe(name + "_pot", prof, 32), at), ceramic(pot))]
    soil = lib.cylinder(name + "_soil", 0.42 * s, 0.42 * s, 0.02, 24, loc=lib.T(at[0], at[1] + 0.71 * s, at[2]))
    out.append(lib.assign(soil, M("soil", lambda: lib.ramp_mat(
        "terra", [(0, "#4a2e1c"), (1, "#6b4428")], rough=0.95, spec=0.1, scale=30, bump=0.4))))
    base = lib.T(at[0], at[1] + 0.7 * s, at[2])
    for i in range(n):
        lf = leaf(rnd.uniform(0.45, 0.65) * s, leafc, f"{name}_leaf{i}", cup=0.3)
        a = i / n * math.tau + rnd.uniform(-0.2, 0.2)
        lf.rotation_euler = (rnd.uniform(0.25, 1.0), 0, a)  # sai do miolo e abre para fora
        lf.location = base + Vector((0, 0, rnd.uniform(0, 0.35) * s))
        out.append(lf)
    for i in range(fruit or 0):
        a = rnd.uniform(0, math.tau)
        f = lib.sphere(f"{name}_fruit{i}", 0.09 * s, 16, 10, scale=(1.25, 1, 1))
        f.location = base + Vector((math.cos(a) * 0.3 * s, math.sin(a) * 0.3 * s, rnd.uniform(0.25, 0.5) * s))
        out.append(lib.assign(f, ceramic("#ffd23f")))
    return out


def standing_plate(at, r, tilt, name):
    out = plate(r, name)
    for o in out:
        o.rotation_euler = (0, math.pi / 2 - tilt, 0.25)  # de pé, como no escorredor
        o.location = lib.T(*at)
    return out


def mug(at, color, name, turn=0.6):
    prof = [(0, 0), (0.24, 0), (0.27, 0.04), (0.28, 0.5), (0.25, 0.52), (0.23, 0.08), (0, 0.08)]
    body = placed(lib.lathe(name, prof, 32), at)
    handle = torus(name + "_handle", 0.15, 0.045)
    handle.rotation_euler = (math.pi / 2, 0, turn)
    handle.location = lib.T(at[0] + 0.28 * math.cos(turn), at[1] + 0.27, at[2] - 0.28 * math.sin(turn))
    return [lib.assign(body, ceramic(color)), lib.assign(handle, ceramic(color))]


def torus(name, R, r, seg=32, ring=12):
    """Rosca (alça, aro): um círculo girado em torno do eixo."""
    prof = [(R + r * math.cos(t / ring * math.tau), r * math.sin(t / ring * math.tau)) for t in range(ring + 1)]
    return lib.lathe(name, prof, seg)


def bottle(at, color, name):
    prof = [(0, 0), (0.3, 0), (0.32, 0.06), (0.32, 0.85), (0.12, 1.2), (0.1, 1.6), (0.13, 1.62), (0, 1.62)]
    b = placed(lib.lathe(name, prof, 28), at)
    glass = M("bottle" + color, lambda: lib.ramp_mat(
        "garrafa" + color, [(0, color), (0.75, color), (1, "#ffffff")], rough=0.08, spec=0.8,
        coat=0.8, by="height", axis="X", scale=2, bump=0))
    cap = lib.cylinder(name + "_cap", 0.12, 0.12, 0.14, 16, loc=lib.T(at[0], at[1] + 1.66, at[2]))
    label = placed(lib.lathe(name + "_label", [(0.325, 0.3), (0.325, 0.68)], 28), at)
    return [lib.assign(b, glass), lib.assign(cap, M("cork", lambda: lib.mat("rolha", "#c9955c", rough=0.8))),
            lib.assign(label, ceramic("#fff6e3"))]


# ---------- cítricos ----------

def lime_mat():
    return M("limeskin", lambda: lib.ramp_mat(
        "casca_limao", [(0, "#1f5a10"), (0.5, "#2f7a17"), (1, "#5c9e26")], rough=0.3, spec=0.6,
        scale=3, bump=0.35, bump_scale=80, coat=0.2))


def lime_half(r=0.42, name="lime_half", wedges=10):
    """Meio limão: casca, polpa em gomos com vesículas e membrana branca, o miolo à mostra."""
    shell = lib.sphere(name + "_shell", r, 40, 20, scale=(1, 1, 1))
    bm = bmesh.new()
    bm.from_mesh(shell.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > 0.001], context="VERTS")
    bm.to_mesh(shell.data)
    bm.free()
    sol = shell.modifiers.new("sol", "SOLIDIFY")
    sol.thickness = r * 0.12
    lib.assign(shell, lime_mat())
    # membrana logo abaixo dos gomos. Os deslocamentos vão para a malha, não para location: quem
    # usa o meio limão posiciona as partes por location e apagaria o recuo
    pith = lib.cylinder(name + "_pith", r * 0.95, r * 0.95, r * 0.04, 48)
    pith.data.transform(Matrix.Translation((0, 0, -r * 0.03)))
    lib.assign(pith, M("pith", lambda: lib.mat("membrana", "#eef3d0", rough=0.6)))
    parts = [shell, pith]
    for i in range(wedges):
        a0, a1 = (i + 0.08) / wedges * math.tau, (i + 0.92) / wedges * math.tau
        bm = bmesh.new()
        c0 = bm.verts.new((0, 0, 0))
        c1 = bm.verts.new((0, 0, -r * 0.3))
        ring0, ring1 = [], []
        for k in range(7):
            a = a0 + (a1 - a0) * k / 6
            co = Vector((math.cos(a), math.sin(a), 0)) * r * 0.86
            ring0.append(bm.verts.new((co.x, co.y, r * 0.02)))
            ring1.append(bm.verts.new((co.x, co.y, -r * 0.3)))
        for k in range(6):
            bm.faces.new((c0, ring0[k], ring0[k + 1]))
            bm.faces.new((ring0[k], ring1[k], ring1[k + 1], ring0[k + 1]))
        w = lib.from_bmesh(f"{name}_wedge{i}", bm)
        w.data.transform(Matrix.Translation(
            Vector((math.cos((a0 + a1) / 2), math.sin((a0 + a1) / 2), 0)) * r * 0.04))
        lib.assign(w, M("pulp", lambda: lib.ramp_mat(
            # brilho moderado: o corte é plano e, muito liso, espelha a luz e fica branco
            "polpa", [(0, "#c8e86a"), (0.5, "#8fc83a"), (1, "#6fae2a")], rough=0.4, spec=0.35,
            by="radial", scale=40, bump=0.5, cells=55, sss=0.2)))
        parts.append(w)
    return parts
