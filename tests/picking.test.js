import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { AppliancePicker, projectBounds } from "../src/picking.js";
import { createPlacedAppliance } from "../src/placement.js";
import { createRoomFixtures } from "../src/furniture.js";
import { APPLIANCE_PLACEMENTS, ROOM_Z } from "../src/room-layout.js";

function setup(
  room,
  kinds = Object.keys(APPLIANCE_PLACEMENTS[room]),
  width = 1440,
  height = 900,
) {
  const root = new THREE.Group();
  root.position.z = ROOM_Z[room];
  const fixtures = createRoomFixtures(room);
  root.add(fixtures);
  const appliances = kinds.map((kind) => {
    const assembly = createPlacedAppliance({ id: kind, kind, room }, fixtures);
    root.add(assembly.root);
    return { id: kind, ...assembly };
  });
  root.updateWorldMatrix(true, true);
  const camera = new THREE.PerspectiveCamera(66, width / height, 0.1, 180);
  camera.position.set(0, 3.15, ROOM_Z[room] + 5.5);
  camera.lookAt(0, 2.65, ROOM_Z[room] - 5.8);
  camera.updateMatrixWorld();
  const picker = new AppliancePicker(root);
  picker.setAppliances(appliances);
  const pick = (world) => {
    const p = world.clone().project(camera);
    return picker.pick(
      camera,
      (p.x * 0.5 + 0.5) * width,
      (0.5 - p.y * 0.5) * height,
      width,
      height,
    );
  };
  const localPick = (id, point) =>
    pick(
      appliances
        .find((a) => a.id === id)
        .model.localToWorld(new THREE.Vector3(...point)),
    );
  return {
    root,
    fixtures,
    appliances,
    camera,
    picker,
    pick,
    localPick,
    width,
    height,
  };
}

test("radio body and controls are clickable; the empty area below its antenna is not", () => {
  const { localPick } = setup("living", ["radio"]);
  assert.equal(localPick("radio", [0, 0.35, 0.22]), "radio");
  assert.equal(localPick("radio", [-0.48, 0.2, 0.2]), "radio");
  assert.equal(localPick("radio", [0.45, 0.4, 0.22]), "radio");
  assert.equal(localPick("radio", [-0.35, 1.1, 0]), null);
});
test("the TV screen, edge and stand work while the empty space beside its stand does not", () => {
  const { localPick } = setup("living", ["tv"]);
  for (const point of [
    [0, 0.85, 0.12],
    [-0.82, 1.28, 0.12],
    [0.82, 0.5, 0.12],
    [0, 0.2, 0.08],
    [0.3, 0.05, 0.12],
  ])
    assert.equal(localPick("tv", point), "tv");
  assert.equal(localPick("tv", [0.65, 0.2, 0.1]), null);
});
test("the kettle's body is clickable without making empty upper corners clickable", () => {
  const { localPick } = setup("dining", ["kettle"]);
  assert.equal(localPick("kettle", [0, 0.5, 0.25]), "kettle");
  assert.equal(localPick("kettle", [0.1, 0.3, 0.28]), "kettle");
  assert.equal(localPick("kettle", [0.6, 0.95, 0]), null);
});
test("foreground furniture blocks clicks, hidden furniture and decorative halos do not", () => {
  const { root, appliances, pick, camera } = setup("living", ["radio"]);
  const target = appliances[0].model.localToWorld(
    new THREE.Vector3(0, 0.35, 0.22),
  );
  const blocker = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 0.2),
    new THREE.MeshBasicMaterial(),
  );
  blocker.position.copy(target).lerp(camera.position, 0.3);
  root.add(blocker);
  assert.equal(pick(target), null);
  blocker.visible = false;
  assert.equal(pick(target), "radio");
  blocker.visible = true;
  blocker.userData.ignorePicking = true;
  assert.equal(pick(target), "radio");
});
for (const [width, height] of [
  [1440, 900],
  [1024, 650],
])
  for (const room of Object.keys(ROOM_Z)) {
    test(`${room}: all six appliances have visible surface hits at ${width}×${height}`, () => {
      const { appliances, picker, camera } = setup(
        room,
        undefined,
        width,
        height,
      );
      for (const { id, model } of appliances) {
        const bounds = new THREE.Box3().setFromObject(model);
        const rect = projectBounds(bounds, camera, width, height);
        let hits = 0;
        for (let x = 0; x < 12; x++)
          for (let y = 0; y < 12; y++) {
            if (
              picker.pick(
                camera,
                rect.x - rect.width / 2 + ((x + 0.5) * rect.width) / 12,
                rect.y - rect.height / 2 + ((y + 0.5) * rect.height) / 12,
                width,
                height,
              ) === id
            )
              hits++;
          }
        assert.ok(hits > 0, `${id} should have selectable visible surfaces`);
      }
    });
  }
