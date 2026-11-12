# Limão da feira: um inteiro, brilhante e de casca com poros, e um meio limão com o miolo à
# mostra (o corte é o que faz ler "limão" na hora). Referência: rodelas do Lemonade.
import bmesh

import lib
import parts

VIEW = {"elev": 35}


def build():
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=5, radius=0.42)
    for v in bm.verts:  # biquinhos nas pontas, formato de limão-taiti levemente ovalado
        t = abs(v.co.x) / 0.42
        v.co.x *= 1.14 + 0.16 * t ** 10
    whole = lib.assign(lib.from_bmesh("lime", bm), parts.lime_mat())
    lib.displace(whole, 0.012, 4, seed=3)
    whole.location = (-0.32, 0.25, 0.4)
    whole.rotation_euler = (0, 0.15, 0.5)

    half = parts.lime_half(0.42)
    for o in half:  # meio limão deitado, corte virado para a câmera
        o.rotation_euler = (1.05, 0, -0.5)
        o.location = (0.5, -0.25, 0.37)
    return [
        {"name": "lime", "high": [whole], "tris": 1200, "size": 512},
        {"name": "lime_half", "high": half, "tris": 1800, "size": 512},
    ]
