# Base comum dos modelos feitos no Blender: cena de estúdio, materiais, bake e exportação.
# Roda com o Blender em modo background, chamado por build.py. Ver docs/cozinha/pipeline-blender.md.
import math
import os

import bmesh
import bpy
from mathutils import Vector, noise

ROOT = os.path.dirname(os.path.abspath(__file__))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "BLENDER_EEVEE"
    s.render.film_transparent = True
    s.render.resolution_x = s.render.resolution_y = 768
    s.view_settings.view_transform = "Standard"  # cor saturada de brinquedo, sem desbotar
    s.unit_settings.scale_length = 1
    return s


# ---------- materiais ----------

def mat(name, color, rough=0.5, spec=0.5, sss=0.0, coat=0.0, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*hex_rgb(color), 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = spec
    p.inputs["Subsurface Weight"].default_value = sss
    p.inputs["Coat Weight"].default_value = coat
    return m


def hex_rgb(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb)


def ramp_mat(name, stops, rough=0.5, spec=0.5, sss=0.0, coat=0.0, scale=4.0, by="noise",
             bump=0.15, bump_scale=None, axis="Z", cells=None):
    """Cor em degradê. by="noise" mancha a superfície, by="height" pinta de baixo para cima
    (oclusão e sol pintados), by="radial" do centro para a borda. cells=escala liga o relevo
    de bolinhas (Voronoi) no lugar do ruído."""
    m = mat(name, stops[0][1], rough, spec, sss, coat)
    t = m.node_tree
    n, l = t.nodes, t.links
    p = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord")
    ramp = n.new("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = stops[0][0], (*hex_rgb(stops[0][1]), 1)
    els[1].position, els[1].color = stops[-1][0], (*hex_rgb(stops[-1][1]), 1)
    for pos, col in stops[1:-1]:
        e = els.new(pos)
        e.color = (*hex_rgb(col), 1)
    nz = n.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = 6
    l.new(tc.outputs["Object"], nz.inputs["Vector"])
    if by == "noise":
        l.new(nz.outputs["Fac"], ramp.inputs["Fac"])
    elif by == "wave":  # veio de madeira: faixas torcidas por ruído, ao longo de `axis`
        wv = n.new("ShaderNodeTexWave")
        wv.wave_type, wv.bands_direction = "BANDS", axis
        wv.inputs["Scale"].default_value = scale
        wv.inputs["Distortion"].default_value = 6
        wv.inputs["Detail"].default_value = 3
        l.new(tc.outputs["Object"], wv.inputs["Vector"])
        l.new(wv.outputs["Fac"], ramp.inputs["Fac"])
    else:
        sep = n.new("ShaderNodeSeparateXYZ")
        l.new(tc.outputs["Generated"], sep.inputs["Vector"])
        if by == "height":
            src = sep.outputs[axis]
        else:  # radial: distância ao centro no plano XY
            vm = n.new("ShaderNodeVectorMath")
            vm.operation = "DISTANCE"
            vm.inputs[1].default_value = (0.5, 0.5, 0.5)
            l.new(tc.outputs["Generated"], vm.inputs[0])
            src = vm.outputs["Value"]
        mix = n.new("ShaderNodeMath")
        mix.operation = "MULTIPLY_ADD"  # ruído leve por cima do degradê, nada é liso
        mix.inputs[1].default_value = 0.15
        l.new(nz.outputs["Fac"], mix.inputs[0])
        l.new(src, mix.inputs[2])
        l.new(mix.outputs[0], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], p.inputs["Base Color"])
    if cells:  # bolinhas (botões, vesículas, poros): relevo de células e vão escurecido
        vo = n.new("ShaderNodeTexVoronoi")
        vo.inputs["Scale"].default_value = cells
        l.new(tc.outputs["Object"], vo.inputs["Vector"])
        dark = n.new("ShaderNodeMix")
        dark.data_type, dark.blend_type = "RGBA", "MULTIPLY"
        gap = n.new("ShaderNodeMapRange")
        gap.inputs["To Min"].default_value, gap.inputs["To Max"].default_value = 1.0, 0.45
        l.new(vo.outputs["Distance"], gap.inputs["Value"])
        dark.inputs["Factor"].default_value = 1.0
        l.new(ramp.outputs["Color"], dark.inputs["A"])
        l.new(gap.outputs["Result"], dark.inputs["B"])
        l.new(dark.outputs["Result"], p.inputs["Base Color"])
        bn = n.new("ShaderNodeBump")
        bn.invert = True
        bn.inputs["Strength"].default_value = bump or 0.6
        l.new(vo.outputs["Distance"], bn.inputs["Height"])
        l.new(bn.outputs["Normal"], p.inputs["Normal"])
    elif bump:
        bn = n.new("ShaderNodeBump")
        bn.inputs["Strength"].default_value = bump
        nz2 = n.new("ShaderNodeTexNoise")
        nz2.inputs["Scale"].default_value = bump_scale or scale * 6
        nz2.inputs["Detail"].default_value = 4
        l.new(tc.outputs["Object"], nz2.inputs["Vector"])
        l.new(nz2.outputs["Fac"], bn.inputs["Height"])
        l.new(bn.outputs["Normal"], p.inputs["Normal"])
    return m


def pattern_mat(name, kind, c1, c2, scale=8.0, rough=0.85, spec=0.3, coat=0.0, axis="X"):
    """Tecido e louça estampados, pela UV (a dobra não entorta o desenho): "stripes" são
    listras ao longo de `axis` da UV; "gingham" é o xadrez de toalha, com o cruzamento
    das faixas mais escuro."""
    m = mat(name, c1, rough, spec, coat=coat)
    n, l = m.node_tree.nodes, m.node_tree.links
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(tc.outputs["UV"], sep.inputs["Vector"])

    def band(src):  # 0 ou 1, alternando `scale` vezes na UV
        mul = n.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        mul.inputs[1].default_value = scale
        l.new(src, mul.inputs[0])
        md = n.new("ShaderNodeMath")
        md.operation = "PINGPONG"
        md.inputs[1].default_value = 1.0
        l.new(mul.outputs[0], md.inputs[0])
        st = n.new("ShaderNodeMath")
        st.operation = "GREATER_THAN"
        st.inputs[1].default_value = 0.5
        l.new(md.outputs[0], st.inputs[0])
        return st.outputs[0]

    fac = band(sep.outputs[axis])
    if kind == "gingham":
        other = band(sep.outputs["Y" if axis == "X" else "X"])
        avg = n.new("ShaderNodeMath")
        avg.operation = "ADD"
        l.new(fac, avg.inputs[0])
        l.new(other, avg.inputs[1])
        half = n.new("ShaderNodeMath")
        half.operation = "MULTIPLY"
        half.inputs[1].default_value = 0.5
        l.new(avg.outputs[0], half.inputs[0])
        fac = half.outputs[0]
    mx = n.new("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.inputs["A"].default_value = (*hex_rgb(c1), 1)
    mx.inputs["B"].default_value = (*hex_rgb(c2), 1)
    l.new(fac, mx.inputs["Factor"])
    l.new(mx.outputs["Result"], n["Principled BSDF"].inputs["Base Color"])
    return m


def assign(obj, m):
    obj.data.materials.clear()
    obj.data.materials.append(m)
    return obj


# ---------- geometria ----------

def link(obj, parent=None):
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    return obj


def from_bmesh(name, bm, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        me.shade_smooth()
    return link(bpy.data.objects.new(name, me))


def sphere(name, r=1.0, seg=32, rings=16, loc=(0, 0, 0), scale=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    o = from_bmesh(name, bm)
    o.location, o.scale = loc, scale
    return o


def cylinder(name, r1, r2, depth, seg=32, loc=(0, 0, 0), caps=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=caps, segments=seg, radius1=r1, radius2=r2, depth=depth)
    o = from_bmesh(name, bm)
    o.location = loc
    return o


def lathe(name, profile, seg=48):
    """Sólido de revolução: profile = [(raio, altura), ...] de baixo para cima."""
    bm = bmesh.new()
    rings = []
    for i in range(seg):
        a = i / seg * math.tau
        rings.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for r, z in profile])
    for i in range(seg):
        a, b = rings[i], rings[(i + 1) % seg]
        for j in range(len(profile) - 1):
            bm.faces.new((a[j], b[j], b[j + 1], a[j + 1]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return from_bmesh(name, bm)


def T(x, y, z):
    """Coordenada do jogo (three.js, Y para cima, câmera em +Z) para o Blender (Z para cima).
    O cenário é escrito nas unidades e eixos do jogo, para casar com src/three/sets.js."""
    return Vector((x, -z, y))


def box(name, w, h, d, at=(0, 0, 0), bevel=0.04, seg=2):
    """Caixa de quinas arredondadas, medida no jogo: w em x, h em altura, d em profundidade."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    o = from_bmesh(name, bm, smooth=False)
    if bevel:
        b = o.modifiers.new("bev", "BEVEL")
        b.width, b.segments, b.limit_method = min(bevel, w / 2.1, h / 2.1, d / 2.1), seg, "NONE"
    o.location = T(*at)
    return o


def displace(obj, amount, scale=1.0, seed=0, axis=None):
    """Deforma com ruído (nada é perfeito). axis=None empurra ao longo da normal."""
    off = Vector((seed * 7.1, seed * 3.3, seed * 5.7))
    for v in obj.data.vertices:
        d = noise.noise(v.co * scale + off)
        if axis is None:
            v.co += v.normal * d * amount
        else:
            v.co[axis] += d * amount
    obj.data.update()
    return obj


def subsurf(obj, levels=2):
    m = obj.modifiers.new("sub", "SUBSURF")
    m.levels = m.render_levels = levels
    return obj


def apply_all(obj):
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def join(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
        if o.modifiers:
            apply_all(o)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = name
    return objs[0]


def solid(objs, name):
    """Junta as faixas de um perfil (fora, borda, dentro) num sólido fechado e só então acerta
    as normais: em superfície aberta o recalc chuta o lado, e o miolo da panela assou preto."""
    o = join(objs, name)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    o.data.shade_smooth()
    return o


def empty(name):
    return link(bpy.data.objects.new(name, None))


# ---------- estúdio e render ----------

def bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs if o.type == "MESH" for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def studio(elev=50, azim=-30, fill=0.8):
    """Luz clara e macia de cozinha de brinquedo (como no vídeo de referência) e câmera 3/4."""
    s = bpy.context.scene
    bpy.context.view_layer.update()  # matrix_world só vale depois do update
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (*hex_rgb("#fff4e6"), 1)
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6
    s.world = w
    for name, loc, power, size in (("key", (2.5, -3, 5), 750, 4), ("rim", (-3, 3, 3), 300, 3)):
        lt = bpy.data.lights.new(name, "AREA")
        lt.energy, lt.size = power, size
        o = link(bpy.data.objects.new(name, lt))
        o.location = loc
        o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    cam = bpy.data.cameras.new("cam")
    cam.lens = 60
    s.camera = link(bpy.data.objects.new("cam", cam))
    return frame([o for o in s.objects if o.type == "MESH"], elev, azim, fill)


def frame(objs, elev=50, azim=-30, fill=0.8):
    """Aponta a câmera do estúdio para `objs` (a foto de perto de cada peça usa de novo)."""
    co = bpy.context.scene.camera
    lo, hi = bounds(objs)
    c = (lo + hi) / 2
    r = (hi - lo).length / 2
    e, a = math.radians(elev), math.radians(azim)
    d = r * fill / math.sin(math.atan(18 / co.data.lens))
    co.location = c + Vector((math.cos(e) * math.sin(a), -math.cos(e) * math.cos(a), math.sin(e))) * d
    co.rotation_euler = (c - co.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()
    return co


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def stats(objs):
    deg = bpy.context.evaluated_depsgraph_get()
    tris = 0
    for o in objs:
        if o.type == "MESH":
            me = o.evaluated_get(deg).to_mesh()
            me.calc_loop_triangles()
            tris += len(me.loop_triangles)
    return tris


# ---------- low poly: o modelo que vai para o jogo ----------

def make_low(name, high, tris, voxel=None):
    """Junta as peças do modelo detalhado num casco só e simplifica até `tris` triângulos.
    voxel funde as peças num volume (bom para montes de comida); None mantém a forma."""
    deg = bpy.context.evaluated_depsgraph_get()
    bm = bmesh.new()
    for o in high:
        me = o.evaluated_get(deg).to_mesh()
        me.transform(o.matrix_world)
        bm.from_mesh(me)
        o.evaluated_get(deg).to_mesh_clear()
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    low = link(bpy.data.objects.new(name, me))
    if voxel:
        r = low.modifiers.new("remesh", "REMESH")
        r.mode, r.voxel_size, r.use_smooth_shade = "VOXEL", voxel, True
    deg = bpy.context.evaluated_depsgraph_get()
    count = stats([low])
    if count > tris:
        d = low.modifiers.new("dec", "DECIMATE")
        d.ratio = tris / count
    deg = bpy.context.evaluated_depsgraph_get()
    flat = bpy.data.meshes.new_from_object(low.evaluated_get(deg))
    low.modifiers.clear()
    low.data = flat
    flat.shade_smooth()
    return low


# ---------- bake: detalhe do modelo rico vira textura no modelo simples ----------

def _image(name, size, data):
    img = bpy.data.images.new(name, size, size, alpha=False)
    if data:
        img.colorspace_settings.name = "Non-Color"
    return img


def bake(high, low, size=1024, texdir=None, extrusion=0.04, roughness=True, unwrap=True, samples=16,
         rough=0.5, metal=0.0, coat=0.0, ao=10.0):
    """Assa o modelo detalhado (high) nas texturas do low: cor com oclusão pintada,
    relevo (normal map) e brilho (roughness). É o caminho da referência: forma simples,
    textura rica. unwrap=False mantém a UV que o low já tem (placa que repete no jogo).
    roughness=False usa o valor fixo `rough`. metal e coat valem para a peça toda: o high
    de metal é pintado como não-metal (cor de metal assa preta) e o low vira metal aqui;
    peça de metal não assa o brilho, para o glTF não ler o metal do canal da rugosidade.
    ao é o alcance da oclusão: o padrão (10) escurece o fundo inteiro de uma tigela, então
    louça funda pede um alcance do tamanho do vão (uns 0,4)."""
    import numpy as np

    s = bpy.context.scene
    s.world.light_settings.distance = ao
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = samples  # superfície lisa e grande (cenário) pede mais: a oclusão sai granulada
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = low
    low.select_set(True)
    if unwrap:
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.01)
        bpy.ops.object.mode_set(mode="OBJECT")

    m = bpy.data.materials.new(low.name + "_baked")
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    p = n["Principled BSDF"]
    assign(low, m)
    imgs = {}
    kinds = [("col", "DIFFUSE", False), ("ao", "AO", True), ("nor", "NORMAL", True)]
    if roughness:
        kinds.append(("rough", "ROUGHNESS", True))
    for key, kind, data in kinds:
        img = _image(f"{low.name}_{key}", size, data)
        node = n.new("ShaderNodeTexImage")
        node.image = img
        n.active = node
        for h in high:
            h.hide_set(False)
            h.select_set(True)
        low.select_set(True)
        bpy.context.view_layer.objects.active = low
        bpy.ops.object.bake(type=kind, pass_filter={"COLOR"}, use_selected_to_active=True,
                            cage_extrusion=extrusion, max_ray_distance=extrusion * 4, margin=8)
        imgs[key] = (img, node)

    # Oclusão pintada na cor, como nas texturas da referência (vão mais escuro).
    col, ao = imgs["col"][0], imgs.pop("ao")
    a = np.empty(size * size * 4, np.float32)
    b = np.empty_like(a)
    col.pixels.foreach_get(a)
    ao[0].pixels.foreach_get(b)
    a[0::4] *= 0.5 + 0.5 * b[0::4]
    a[1::4] *= 0.5 + 0.5 * b[1::4]
    a[2::4] *= 0.5 + 0.5 * b[2::4]
    col.pixels.foreach_set(a)
    n.remove(ao[1])
    bpy.data.images.remove(ao[0])

    l.new(imgs["col"][1].outputs["Color"], p.inputs["Base Color"])
    nm = n.new("ShaderNodeNormalMap")
    l.new(imgs["nor"][1].outputs["Color"], nm.inputs["Color"])
    l.new(nm.outputs["Normal"], p.inputs["Normal"])
    if roughness:
        sep = n.new("ShaderNodeSeparateColor")
        l.new(imgs["rough"][1].outputs["Color"], sep.inputs["Color"])
        l.new(sep.outputs["Green"], p.inputs["Roughness"])
    else:
        p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.5
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = 0.08

    for key, (img, _) in imgs.items():
        img.pack()
        if texdir:
            img.filepath_raw = os.path.join(texdir, f"{img.name}.png")
            img.file_format = "PNG"
            img.save()
    for h in high:
        h.hide_render = True
        h.hide_set(True)
    s.render.engine = "BLENDER_EEVEE"
    return m


def export_glb(objs, path):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.hide_set(False)
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path, use_selection=True, export_format="GLB",
                              export_apply=True, export_image_format="WEBP")
    return os.path.getsize(path)
