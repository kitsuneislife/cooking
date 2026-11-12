# Receita 5, frango com salsa de manga: peito grelhado fatiado em leque, com marca de grelha e
# miolo claro no corte, coberto de salsa (manga, cebola-roxa, pimentão, coentro) e meio limão.
# Referência: Sauteed Chicken e Baked Chicken with Herbs (cook-soundtrack).
import math
import random

import bpy

import lib
import parts
from models.mango import flesh


def grill_mat():
    def make():
        m = lib.ramp_mat("frango_grelhado", [(0, "#c47a32"), (0.5, "#dc9a4c"), (1, "#eab46a")],
                         rough=0.3, spec=0.55, scale=5, bump=0.25, bump_scale=20, coat=0.3)
        n, l = m.node_tree.nodes, m.node_tree.links
        p = n["Principled BSDF"]
        base = p.inputs["Base Color"].links[0].from_socket
        wave = n.new("ShaderNodeTexWave")
        wave.inputs["Scale"].default_value = 3.2
        wave.inputs["Distortion"].default_value = 1.5
        tc = n.new("ShaderNodeTexCoord")
        rot = n.new("ShaderNodeMapping")
        rot.inputs["Rotation"].default_value = (0, 0, math.radians(40))
        l.new(tc.outputs["Object"], rot.inputs["Vector"])
        l.new(rot.outputs["Vector"], wave.inputs["Vector"])
        band = n.new("ShaderNodeMapRange")  # só a crista da onda vira marca de grelha
        band.inputs["From Min"].default_value, band.inputs["From Max"].default_value = 0.78, 0.9
        l.new(wave.outputs["Fac"], band.inputs["Value"])
        mix = n.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.inputs["B"].default_value = (*lib.hex_rgb("#4a230e"), 1)
        l.new(band.outputs["Result"], mix.inputs["Factor"])
        l.new(base, mix.inputs["A"])
        l.new(mix.outputs["Result"], p.inputs["Base Color"])
        return m
    return parts.M("grill", make)


def build():
    rnd = random.Random(7)
    plate = parts.plate(1.7)
    cloth = parts.cloth(4.4, ("#ffd36b", "#ffffff"), seed=3)
    inside = parts.M("chickenin", lambda: lib.ramp_mat(
        "miolo_frango", [(0, "#efd9b8"), (1, "#f8ead2")], rough=0.5, spec=0.35, scale=18,
        bump=0.3, bump_scale=40))

    # peito inteiro, depois fatiado com boolean: a face do corte herda o miolo claro
    breast = lib.sphere("breast", 0.5, 48, 24, scale=(2.4, 1.25, 0.5))
    lib.displace(breast, 0.05, 2.2, seed=1)
    lib.assign(breast, grill_mat())
    food = []
    n_sl = 5
    for i in range(n_sl):
        x0 = -1.2 + i * 2.4 / n_sl
        cut = lib.cylinder(f"cut{i}", 0.5, 0.5, 2.4 / n_sl - 0.04, 4)
        cut.rotation_euler = (0, math.pi / 2, math.pi / 4)
        cut.scale = (2, 2, 1)
        cut.location = (x0 + 1.2 / n_sl, 0, 0)
        lib.assign(cut, inside)
        sl = breast.copy()
        sl.data = breast.data.copy()
        sl.name = f"slice{i}"
        bpy.context.scene.collection.objects.link(sl)
        bo = sl.modifiers.new("cut", "BOOLEAN")
        bo.operation, bo.object, bo.solver = "INTERSECT", cut, "EXACT"
        bo.material_mode = "TRANSFER"
        bpy.context.view_layer.update()
        lib.apply_all(sl)
        cut.hide_render = True
        bpy.data.objects.remove(cut)
        # leque: cada fatia gira um pouco e desliza, mostrando o miolo
        sl.rotation_euler = (0, -0.25, (i - 2) * 0.09)
        sl.location = (i * 0.1 - 0.2, (i - 2) * 0.07, 0.27)
        food.append(sl)
    bpy.data.objects.remove(breast)

    # salsa por cima, no meio do leque
    onion_m = parts.M("redonion", lambda: lib.ramp_mat(
        "cebola_roxa", [(0, "#f2e4f2"), (1, "#8e2f78")], rough=0.15, spec=0.6, scale=9, sss=0.3))
    pepper_m = parts.M("redpepper", lambda: lib.mat("pimentao", "#d8231c", rough=0.15, spec=0.7))
    sc = (0.0, 0, 0.5)
    pieces = [(flesh, 34, 0.12), (lambda: onion_m, 12, 0.085), (lambda: pepper_m, 10, 0.085)]
    for k, (m, count, s) in enumerate(pieces):
        for i, (loc, nrm, r) in enumerate(parts.on_dome(count, 0.7, 0.3, sc, seed=50 + k, depth=(0.7, 1.0))):
            c = lib.cylinder(f"salsa{k}_{i}", s, s, s * 1.5, 4)
            c.modifiers.new("bev", "BEVEL").width = s * 0.3
            lib.subsurf(c, 1)
            c.scale = (1, 1, r.uniform(0.7, 1.2))
            food.append(parts.place(lib.assign(c, m()), loc, nrm, r.uniform(0, math.tau)))
    for i, (loc, nrm, r) in enumerate(parts.on_dome(9, 0.66, 0.32, sc, seed=70, depth=(1.0, 1.1))):
        lf = parts.leaf(0.28, ("#2f8a34", "#5dbb4a"), f"cilantro{i}", cup=0.15)
        food.append(parts.place(lf, loc, nrm, r.uniform(0, math.tau)))

    lime = parts.lime_half(0.34, "lime_side")
    for o in lime:  # na frente do leque, corte virado para a câmera
        o.rotation_euler = (1.05, 0, -0.5)
        o.location = (0.95, -0.85, 0.32)
    return [
        {"name": "chicken_plate", "high": plate, "keep": True},
        {"name": "chicken_cloth", "high": [cloth], "tris": 1200, "size": 512, "roughness": False},
        {"name": "chicken_food", "high": food, "tris": 6000, "voxel": 0.016, "size": 1024},
        {"name": "chicken_lime", "high": lime, "tris": 1200, "size": 512},
    ]
