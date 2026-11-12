# Brócolis da feira: talo grosso que abre em galhos, cada galho com uma copa de botões.
# Referência: guarnição do Beef Steak (cook-soundtrack). Ver docs/cozinha/pipeline-blender.md.
import math

import lib
import parts

VIEW = {"elev": 28}


def build():
    high = []
    trunk = lib.cylinder("trunk", 0.17, 0.13, 0.55, 16, loc=(0, 0, 0.275))
    lib.subsurf(trunk, 1)
    lib.assign(trunk, parts.M("stalk", lambda: lib.ramp_mat(
        "talo", [(0, "#d6e8a0"), (1, "#8dbf55")], rough=0.5, spec=0.4, by="height", scale=5,
        bump=0.1, sss=0.1)))
    high.append(trunk)
    # copa em domo: um florete no topo, um anel de 7 em volta e mais baixo, galhos abertos
    high += parts.floret(0.24, (0, 0, 0.5), seed=1, stem=0.3)
    for i in range(7):
        a = i / 7 * math.tau + 0.3
        rr = 0.3 + 0.03 * (i % 2)
        high += parts.floret(0.19 + 0.025 * (i % 3), (rr * math.cos(a), rr * math.sin(a), 0.42),
                             seed=10 + i, stem=0.18)
    return [{"name": "broccoli", "high": high, "tris": 3000, "voxel": 0.014, "size": 512}]
