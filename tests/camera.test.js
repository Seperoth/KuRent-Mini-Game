import test from "node:test";
import assert from "node:assert/strict";
import { HouseCamera, CAMERA_STOPS, MENU_CAMERA } from "../src/camera.js";

test("room viewpoints follow a continuous forward path at eye level", () => {
  assert.equal(CAMERA_STOPS.length, 4);
  for (let i = 1; i < 4; i++) {
    assert.ok(CAMERA_STOPS[i].position[2] < CAMERA_STOPS[i - 1].position[2]);
    assert.equal(CAMERA_STOPS[i].position[0], 0);
    assert.ok(
      Math.abs(CAMERA_STOPS[i].position[1] - CAMERA_STOPS[i - 1].position[1]) <
        0.2,
    );
    assert.ok(CAMERA_STOPS[i].target[2] < CAMERA_STOPS[i].position[2]);
  }
});
test("camera travel interpolates position, target, and field of view without jumping", () => {
  const camera = new HouseCamera();
  camera.travel(0, 0, true);
  camera.travel(1, 100);
  assert.deepEqual(camera.update(100), CAMERA_STOPS[0]);
  const middle = camera.update(625);
  assert.ok(
    middle.position[2] > CAMERA_STOPS[1].position[2] &&
      middle.position[2] < CAMERA_STOPS[0].position[2],
  );
  assert.deepEqual(camera.update(1150), CAMERA_STOPS[1]);
  assert.equal(camera.transition, null);
});
test("changing destination during travel continues from the current viewpoint", () => {
  const camera = new HouseCamera();
  camera.travel(0, 0, true);
  camera.travel(3, 0);
  camera.update(400);
  const current = structuredClone(camera.pose);
  camera.travel(1, 400);
  assert.deepEqual(camera.update(400), current);
  assert.deepEqual(camera.update(1450), CAMERA_STOPS[1]);
});
test("invalid room requests are rejected and reduced motion snaps to each destination", () => {
  const camera = new HouseCamera(true);
  assert.equal(camera.travel(4), false);
  assert.equal(camera.travel(-1), false);
  assert.equal(camera.travel(1.5), false);
  camera.travel(2, 0);
  assert.deepEqual(camera.pose, CAMERA_STOPS[2]);
  assert.equal(camera.transition, null);
  camera.showMenu();
  assert.deepEqual(camera.pose, MENU_CAMERA);
});
