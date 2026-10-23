import * as THREE from "three";

function isVisible(object) {
  for (let parent = object; parent; parent = parent.parent)
    if (!parent.visible || parent.userData.ignorePicking) return false;
  return true;
}

// The closest visible triangle wins, including furniture that hides an appliance.
// No rectangular proxy geometry is used for pointer interaction.
export class AppliancePicker {
  constructor(room) {
    this.room = room;
    this.ray = new THREE.Raycaster();
    this.owners = new WeakMap();
  }
  setAppliances(appliances) {
    this.owners = new WeakMap();
    for (const { id, model } of appliances)
      model.traverse((object) => {
        if (object.isMesh) this.owners.set(object, id);
      });
  }
  pick(camera, x, y, width, height) {
    if (x < 0 || y < 0 || x > width || y > height) return null;
    this.room.updateWorldMatrix(true, true);
    camera.updateMatrixWorld();
    this.ray.setFromCamera(
      new THREE.Vector2((x / width) * 2 - 1, 1 - (y / height) * 2),
      camera,
    );
    for (const hit of this.ray.intersectObject(this.room, true)) {
      if (!hit.object.isMesh || !isVisible(hit.object)) continue;
      return this.owners.get(hit.object) ?? null;
    }
    return null;
  }
}

// Bounds position labels/progress only; the picker always uses the actual meshes.
export function projectBounds(bounds, camera, width, height) {
  let left = Infinity,
    top = Infinity,
    right = -Infinity,
    bottom = -Infinity;
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new THREE.Vector3(x, y, z).project(camera);
        const px = (point.x * 0.5 + 0.5) * width,
          py = (0.5 - point.y * 0.5) * height;
        left = Math.min(left, px);
        right = Math.max(right, px);
        top = Math.min(top, py);
        bottom = Math.max(bottom, py);
      }
  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    width: right - left,
    height: bottom - top,
  };
}
