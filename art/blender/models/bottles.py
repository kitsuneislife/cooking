# Leva 6: vidros e garrafas. Garrafa alta de gargalo fino (shoyu, gergelim, teriyaki, azeite,
# cachaça, ketchup), garrafa bojuda (molho de ostra), vidro de boca larga (mel, molho de tomate),
# potinho de tempero (cardamomo e os temperos em pó que virão) e o par saleiro e pimenteiro.
#
# Só o formato vem daqui. A cor do vidro, do líquido e da tampa muda por ingrediente, então o
# vidro e o líquido saem lisos (o jogo põe o material) e a tampa sai assada quase branca, com os
# frisos no normal map: o jogo tinge por cima. O rótulo continua em código (labelTexture), nas
# medidas de BOTTLE_SHAPES (src/three/kit.js). Cada peça tem a base na origem, como o procedural
# que troca. Referência: saleiros de porcelana branca com tampa colorida em domo e letras da cor
# da tampa, e os potes de vidro grosso (docs/inspiracao/cooking-mama-cuisine.md).
import math

import bpy

import lib
import parts
from parts import M

VIEW = {"elev": 22, "azim": -20, "fill": 0.85}
SEG = 32  # gomos do torno no jogo: a garrafa é pequena na tela


def glass():
    """Só para a prévia: no jogo o vidro é um material de código, tingido por ingrediente."""
    def make():
        m = lib.mat("vidro", "#dfeef0", rough=0.05, spec=0.8, coat=1.0)
        p = m.node_tree.nodes["Principled BSDF"]
        p.inputs["Alpha"].default_value = 0.35
        m.surface_render_method = "BLENDED"
        return m
    return M("glass", make)


def liquid(color):
    return M("liquid" + color, lambda: lib.mat("liquido" + color, color, rough=0.15, spec=0.6))


def tint_base():
    """Tampa quase branca: o jogo multiplica pela cor do ingrediente; o vão do friso escurece."""
    return M("tint", lambda: lib.ramp_mat("tampa_clara", [(0, "#e6e6e6"), (0.6, "#f6f6f6"), (1, "#ffffff")],
                                          rough=0.3, spec=0.5, by="height", scale=3, bump=0.01))


def vessel(name, outer, fill, cap, ridges, ridge_zone, color):
    """Vidro, conteúdo e tampa. A tampa high tem os frisos; o casco é o torno liso."""
    g = lib.assign(lib.lathe(name + "_glass", outer, SEG), glass())
    f = lib.assign(lib.lathe(name + "_" + ("fill" if name in ("jar", "spice") else "liquid"), fill, SEG), liquid(color))
    hi = lib.assign(parts.ridged(name + "_cap_high", cap, ridges, 0.016, *ridge_zone), tint_base())
    shell = lib.lathe(name + "_cap_shell", cap, SEG)
    return g, f, hi, shell


# Perfis (raio, altura), de baixo para cima, fechados no eixo. O vidro tem fundo com pé e
# quina arredondada, ombro curvo e um anel no gargalo; o conteúdo fica uns 3 cm por dentro.
TALL = [(0.0, 0.035), (0.3, 0.0), (0.37, 0.012), (0.396, 0.05), (0.4, 0.12), (0.4, 0.98), (0.388, 1.08),
        (0.35, 1.19), (0.28, 1.31), (0.2, 1.42), (0.145, 1.51), (0.126, 1.58), (0.145, 1.6), (0.148, 1.625),
        (0.128, 1.645), (0.122, 1.66), (0.122, 1.8), (0.0, 1.8)]
TALL_FILL = [(0.0, 0.05), (0.33, 0.03), (0.37, 0.07), (0.372, 0.98), (0.355, 1.1), (0.31, 1.2), (0.0, 1.2)]
TALL_CAP = [(0.122, 1.66), (0.158, 1.662), (0.166, 1.68), (0.166, 1.885), (0.156, 1.912), (0.12, 1.926), (0.0, 1.93)]

ROUND = [(0.0, 0.035), (0.4, 0.0), (0.48, 0.015), (0.53, 0.07), (0.55, 0.18), (0.55, 0.62), (0.535, 0.73),
         (0.48, 0.85), (0.38, 0.95), (0.26, 1.03), (0.195, 1.09), (0.18, 1.15), (0.2, 1.17), (0.203, 1.195),
         (0.182, 1.215), (0.178, 1.23), (0.178, 1.33), (0.0, 1.33)]
ROUND_FILL = [(0.0, 0.05), (0.42, 0.03), (0.52, 0.09), (0.522, 0.62), (0.505, 0.73), (0.44, 0.84), (0.0, 0.84)]
ROUND_CAP = [(0.178, 1.225), (0.214, 1.227), (0.222, 1.245), (0.222, 1.415), (0.21, 1.44), (0.16, 1.452), (0.0, 1.456)]

JAR = [(0.0, 0.035), (0.4, 0.0), (0.47, 0.015), (0.508, 0.07), (0.52, 0.16), (0.52, 0.76), (0.505, 0.85),
       (0.462, 0.91), (0.435, 0.94), (0.435, 1.04), (0.0, 1.04)]
JAR_FILL = [(0.0, 0.05), (0.43, 0.03), (0.49, 0.09), (0.492, 0.76), (0.47, 0.84), (0.0, 0.86)]
JAR_LID = [(0.435, 0.955), (0.468, 0.958), (0.48, 0.975), (0.48, 1.095), (0.468, 1.12), (0.4, 1.136),
           (0.2, 1.146), (0.0, 1.15)]

SPICE = [(0.0, 0.03), (0.22, 0.0), (0.262, 0.012), (0.28, 0.05), (0.28, 0.66), (0.27, 0.71), (0.252, 0.735),
         (0.25, 0.8), (0.0, 0.8)]
SPICE_FILL = [(0.0, 0.04), (0.23, 0.025), (0.252, 0.06), (0.252, 0.54), (0.15, 0.575), (0.0, 0.59)]
SPICE_LID = [(0.25, 0.745), (0.285, 0.748), (0.295, 0.765), (0.295, 0.92), (0.284, 0.942), (0.2, 0.952),
             (0.0, 0.955)]

# Saleiro: corpo de pino gordo e tampa em domo, como os da referência.
SHAKER = [(0.0, 0.0), (0.2, 0.0), (0.235, 0.02), (0.25, 0.06), (0.255, 0.16), (0.246, 0.3), (0.218, 0.45),
          (0.202, 0.55), (0.205, 0.6), (0.0, 0.6)]
SHAKER_CAP = [(0.198, 0.585), (0.218, 0.59), (0.224, 0.63), (0.218, 0.69), (0.195, 0.765), (0.152, 0.82),
              (0.09, 0.854), (0.0, 0.865)]


def holes(name, cap, n_ring, ring, m, r=0.016):
    """Furinhos escuros no topo da tampa (o centro e um anel), número ímpar (lição 6)."""
    out = []
    top = cap
    for k in range(n_ring + 1):
        if k == 0:
            x, y = 0.0, 0.0
        else:
            a = (k - 1) / n_ring * math.tau
            x, y = ring * math.cos(a), ring * math.sin(a)
        d = math.hypot(x, y)
        z = height_at(top, d) + 0.004
        h = lib.cylinder(f"{name}_hole{k}", r, r, 0.006, 12, loc=(x, y, z))
        tilt = math.atan(abs(slope_at(top, d)))  # deita para fora, com o domo
        h.rotation_euler = (0, tilt, math.atan2(y, x)) if d else (0, 0, 0)
        out.append(lib.assign(h, m))
    return out


def height_at(prof, d):
    """Altura do perfil de tampa no raio d (o perfil desce em raio ao subir)."""
    for (r0, z0), (r1, z1) in zip(prof, prof[1:]):
        if r1 <= d <= r0 and r0 > r1:
            return z0 + (z1 - z0) * (r0 - d) / (r0 - r1)
    return prof[-1][1]


def slope_at(prof, d):
    for (r0, z0), (r1, z1) in zip(prof, prof[1:]):
        if r1 <= d <= r0 and r0 > r1:
            return (z0 - z1) / (r0 - r1)
    return 0.0


def shaker(name, cap_color, light, text, size):
    porcelain = M("porcelain", lambda: lib.ramp_mat(
        "porcelana", [(0, "#e9eef4"), (0.35, "#fbfcfd"), (1, "#fffdf8")], rough=0.12, spec=0.6, coat=0.6,
        by="height", scale=2, bump=0))
    cap_m = M("cap" + cap_color, lambda: lib.ramp_mat(
        "tampa" + cap_color, [(0, cap_color), (0.8, cap_color), (1, light)], rough=0.15, spec=0.6,
        coat=0.6, by="height", scale=2, bump=0))
    ink = M("ink" + cap_color, lambda: lib.mat("letra" + cap_color, cap_color, rough=0.3))
    dark = M("hole", lambda: lib.mat("furo", "#3a2a2a", rough=0.6))
    body = lib.assign(lib.lathe(name + "_body", SHAKER, 48), porcelain)
    cap = lib.assign(lib.lathe(name + "_cap", SHAKER_CAP, 48), cap_m)
    letters = parts.lettering(name + "_text", text, SHAKER, 0.27, size, ink)
    return [body, cap, letters] + holes(name, SHAKER_CAP, 6, 0.085, dark)


def build():
    # a faixa dos frisos vai de vértice a vértice da parede da tampa: entre eles não há vértice
    tall = parts.shift(list(vessel("tall", TALL, TALL_FILL, TALL_CAP, 40, (1.68, 1.885), "#5a2a12")), 0)
    rnd = parts.shift(list(vessel("round", ROUND, ROUND_FILL, ROUND_CAP, 48, (1.245, 1.415), "#5e3416")), 1.6)
    jar = parts.shift(list(vessel("jar", JAR, JAR_FILL, JAR_LID, 72, (0.975, 1.095), "#e89a10")), 3.2)
    spc = parts.shift(list(vessel("spice", SPICE, SPICE_FILL, SPICE_LID, 36, (0.765, 0.92), "#93b060")), 4.6)
    spc += parts.shift(holes("spice", SPICE_LID, 6, 0.1, M("hole", lambda: lib.mat("furo", "#3a2a2a", rough=0.6)),
                             0.018), 4.6)
    salt = parts.shift(shaker("salt", "#3ea6e0", "#8fd2f4", "SAL", 0.14), 5.8)
    pepper = parts.shift(shaker("pepper", "#e5484d", "#ff9a9a", "PIMENTA", 0.085), 6.6)
    cap = {"extrusion": 0.02, "samples": 32, "ao": 0.15, "size": 256, "coat": 0.4, "rough": 0.3}
    out = []
    for key, items, x, tris in (("tall", tall, 0, 600), ("round", rnd, 1.6, 600), ("jar", jar, 3.2, 700),
                                ("spice", spc, 4.6, 600)):
        g, f, hi, shell = items[:4]
        out += [
            {"name": g.name, "high": [g], "keep": True, "origin": (x, 0, 0)},
            {"name": f.name, "high": [f], "keep": True, "origin": (x, 0, 0)},
            {"name": key + "_cap", "high": [hi] + items[4:], "shell": [shell], "tris": tris, "origin": (x, 0, 0), **cap},
        ]
    sh = {"extrusion": 0.02, "samples": 32, "ao": 0.2, "size": 512, "coat": 0.5}
    out += [
        {"name": "shaker_salt", "high": salt, "shell": salt[:2], "tris": 1000, "origin": (5.8, 0, 0), **sh},
        {"name": "shaker_pepper", "high": pepper, "shell": pepper[:2], "tris": 1000, "origin": (6.6, 0, 0), **sh},
    ]
    return out
