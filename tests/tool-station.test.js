import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createToolTable, TOOL_TABLE } from "../src/tool-station.js";
import { solidIntersection } from "../src/placement.js";

test("the outside table is centered in front of the door and both tools rest above its surface", () => {
  const scene = new THREE.Group();
  const { station, tools } = createToolTable(scene);
  scene.updateWorldMatrix(true, true);
  assert.equal(station.position.x, 0);
  assert.ok(station.position.z > 8 && station.position.z < 21);
  const bounds = Object.values(tools).map(({ model }) =>
    new THREE.Box3().setFromObject(model),
  );
  for (const b of bounds) {
    assert.ok(b.min.y > TOOL_TABLE.height + 0.09);
    assert.ok(
      b.min.x > -TOOL_TABLE.width / 2 && b.max.x < TOOL_TABLE.width / 2,
    );
    assert.ok(
      b.min.z > TOOL_TABLE.z - TOOL_TABLE.depth / 2 &&
        b.max.z < TOOL_TABLE.z + TOOL_TABLE.depth / 2,
    );
  }
  assert.equal(solidIntersection(...bounds), false);
});
