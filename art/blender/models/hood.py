# Coifa acima do fogão: esmalte azul-piscina com barra creme e chaminé, como a da cozinha
# do vídeo (inferência dos quadros). Nas medidas do jogo, já acima do fogão (x = 3,8).
import lib
import parts

X = 3.8
VIEW = {"elev": 10, "azim": -25}


def build():
    aqua = parts.M("aqua", lambda: lib.ramp_mat(
        "esmalte_piscina", [(0, "#6fcfd0"), (0.6, "#8fdcda"), (1, "#c4f0ec")], rough=0.22, spec=0.6,
        coat=0.5, by="height", scale=2, bump=0.01))
    cream = parts.ceramic("#fff6ec")
    canopy = lib.box("canopy", 4.4, 1.4, 2.3, at=(X, 8.3, -2.05), bevel=0.12, seg=4)
    for v in canopy.data.vertices:  # tronco de pirâmide: o topo estreita até a chaminé
        if v.co.z > 0:
            v.co.x *= 0.38
            v.co.y *= 0.55
    hi = [lib.assign(canopy, aqua)]
    hi.append(lib.assign(lib.box("lip", 4.6, 0.32, 2.45, at=(X, 7.62, -2.0), bevel=0.1, seg=4), aqua))
    hi.append(lib.assign(lib.box("band", 4.64, 0.08, 2.49, at=(X, 7.84, -2.0), bevel=0.03, seg=2), cream))
    hi.append(lib.assign(lib.box("chimney", 1.65, 4.2, 1.25, at=(X, 11.0, -2.55), bevel=0.06, seg=3), aqua))
    hi.append(lib.assign(lib.box("collar", 1.8, 0.16, 1.4, at=(X, 9.12, -2.55), bevel=0.05, seg=3), cream))
    for dx in (-0.45, 0, 0.45):  # frestas de ventilação na frente
        hi.append(lib.assign(lib.box(f"vent{dx}", 0.24, 0.05, 0.05, at=(X + dx, 8.05, -0.86), bevel=0.02),
                             parts.ceramic("#4fb3b6")))
    return [{"name": "hood", "high": hi, "tris": 3000, "size": 512, "extrusion": 0.03, "samples": 48}]
