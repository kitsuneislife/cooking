import test from "node:test";
import assert from "node:assert/strict";
import { THREE, worley, limb, colorize } from "./kit.js";

test("worley stays within one cell of a center", () => {
  for (let i = 0; i < 200; i++) {
    const d = worley(i * 0.37, i * 0.91);
    assert.ok(d >= 0 && d < 1.5, `distance ${d}`);
  }
});

test("limb spans from a to b", () => {
  const a = new THREE.Vector3(0.2, 0, -0.1), b = new THREE.Vector3(0.5, 1.2, 0.3);
  const geo = limb(a, b, 0.03, 0.02); geo.computeBoundingBox();
  const c = geo.boundingBox.getCenter(new THREE.Vector3());
  assert.ok(c.distanceTo(a.clone().lerp(b, 0.5)) < 0.03);
  assert.ok(geo.boundingBox.max.y > 1.19 && geo.boundingBox.min.y < 0.01);
});

test("colorize writes one color per vertex", () => {
  const geo = colorize(new THREE.BoxGeometry(), (c, x, y) => c.setRGB(y + 0.5, 0, 0));
  const col = geo.attributes.color;
  assert.equal(col.count, geo.attributes.position.count);
  for (let i = 0; i < col.count; i++) assert.equal(col.getX(i), geo.attributes.position.getY(i) + 0.5);
});
