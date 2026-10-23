import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  APPLIANCE_PLACEMENTS,
  ROOM_Z,
  SURFACE_GAP,
} from "../src/room-layout.js";
import { createRoomFixtures } from "../src/furniture.js";
import {
  createPlacedAppliance,
  auditPlacements,
  solidIntersection,
} from "../src/placement.js";

function furnishedRoom(room) {
  const root = new THREE.Group();
  root.position.z = ROOM_Z[room];
  const fixtures = createRoomFixtures(room);
  root.add(fixtures);
  const appliances = Object.keys(APPLIANCE_PLACEMENTS[room]).map(
    (kind, slot) => {
      const assembly = createPlacedAppliance(
        { id: `${room}-${kind}`, room, kind, slot },
        fixtures,
      );
      root.add(assembly.root);
      return assembly;
    },
  );
  root.updateWorldMatrix(true, true);
  return { root, fixtures, appliances };
}

for (const room of Object.keys(ROOM_Z)) {
  test(`${room}: all six appliances clear furniture, each other, supports and the camera aisle`, () => {
    const { fixtures, appliances } = furnishedRoom(room);
    assert.deepEqual(
      auditPlacements(appliances, fixtures, { visibility: true }),
      [],
    );
    // Checks actual model geometry, including plants, chairs, bed and cabinet tops.
    const solids = fixtures.userData.solids;
    for (const [i, a] of solids.entries()) {
      for (const b of solids.slice(i + 1)) {
        assert.equal(
          solidIntersection(
            new THREE.Box3().setFromObject(a),
            new THREE.Box3().setFromObject(b),
          ),
          false,
          `${a.name} intersects ${b.name}`,
        );
      }
    }
    for (const { model, placement, support } of appliances) {
      const bounds = new THREE.Box3().setFromObject(model);
      const base =
        placement.surface === "wall"
          ? placement.y
          : support?.userData.surfaceTop || 0;
      assert.ok(
        Math.abs(bounds.min.y - base - SURFACE_GAP) < 0.0001,
        "appliance rests on the intended surface",
      );
      assert.ok(
        bounds.min.x > -6.89 && bounds.max.x < 6.89,
        "appliance clears the side walls",
      );
      assert.ok(
        bounds.min.z > ROOM_Z[room] - 6.89,
        "appliance clears the back wall",
      );
      for (const aspect of [1440 / 900, 1024 / 650]) {
        const camera = new THREE.PerspectiveCamera(66, aspect, 0.1, 180);
        camera.position.set(0, 3.15, ROOM_Z[room] + 5.5);
        camera.lookAt(0, 2.65, ROOM_Z[room] - 5.8);
        camera.updateMatrixWorld();
        for (const x of [bounds.min.x, bounds.max.x])
          for (const y of [bounds.min.y, bounds.max.y])
            for (const z of [bounds.min.z, bounds.max.z]) {
              const point = new THREE.Vector3(x, y, z).project(camera);
              assert.ok(
                Math.abs(point.x) < 1 && Math.abs(point.y) < 1,
                `${model.name || placement.surface} appliance stays fully inside the viewport`,
              );
            }
      }
    }
  });

  test(`${room}: shuffled starts and progression never move an existing appliance`, () => {
    const { fixtures, appliances } = furnishedRoom(room);
    for (const [index, assembly] of appliances.entries()) {
      const kind = Object.keys(APPLIANCE_PLACEMENTS[room])[index];
      for (let slot = 0; slot < 6; slot++) {
        const shuffled = createPlacedAppliance(
          { id: "shuffled", room, kind, slot },
          fixtures,
        );
        assert.deepEqual(
          shuffled.root.position.toArray(),
          assembly.root.position.toArray(),
        );
        assert.deepEqual(
          shuffled.model.position.toArray(),
          assembly.model.position.toArray(),
        );
      }
    }
    // Every possible initial roster is a subset of the verified six-item layout.
    for (let mask = 0; mask < 64; mask++) {
      const subset = appliances.filter((_, index) => mask & (1 << index));
      assert.deepEqual(auditPlacements(subset, fixtures), []);
    }
  });
}

test("placement audit detects a deliberately embedded appliance", () => {
  const { fixtures, appliances } = furnishedRoom("bedroom");
  const iron = appliances.find((a) => a.root.name === "bedroom-iron");
  iron.root.position.set(-3.65, -0.7, -3.65);
  assert.ok(
    auditPlacements(appliances, fixtures).some((issue) =>
      issue.includes("intersects bed"),
    ),
  );
});
