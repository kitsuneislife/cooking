# Renderiza um modelo de referência (cook-soundtrack) na mesma luz e câmera dos nossos,
# só para comparar. Nada daqui entra no jogo.
# Uso: blender -b -P art/blender/ref.py -- "<pasta do modelo>" <saida.png>
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402

folder, out = sys.argv[sys.argv.index("--") + 1:][:2]
lib.reset()
bpy.ops.wm.obj_import(filepath=os.path.join(folder, "model.obj"))
lib.studio()
lib.render(out)
