import * as THREE from "three";
import { applianceModel } from "./models.js";
import {
  appliancePlacement,
  AISLE_HALF_WIDTH,
  SURFACE_GAP,
} from "./room-layout.js";

export function createPlacedAppliance(item, fixtures) {
  const placement = appliancePlacement(item.room, item.kind);
  const root = new THREE.Group();
  root.name = item.id;
  root.position.set(placement.x, 0, placement.z);
  const model = applianceModel(item.kind);
  root.add(model);
  model.rotation.y =
    placement.surface === "wall"
      ? 0
      : Math.atan2(-placement.x, 5.5 - placement.z);
  model.updateWorldMatrix(true, true);
  const initialBounds = new THREE.Box3().setFromObject(model);
  const support = fixtures.getObjectByName(`support-${item.kind}`);
  const top =
    placement.surface === "wall"
      ? placement.y
      : support?.userData.surfaceTop || 0;
  model.position.y = top + SURFACE_GAP - initialBounds.min.y;
  root.updateWorldMatrix(true, true);
  return { root, model, placement, support };
}

export function solidIntersection(a, b, epsilon = 0.006) {
  return (
    Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x) > epsilon &&
    Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y) > epsilon &&
    Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z) > epsilon
  );
}

export function auditPlacements(
  assemblies,
  fixtures,
  { visibility = false } = {},
) {
  fixtures.updateWorldMatrix(true, true);
  const issues = [];
  const solids = fixtures.userData.solids;
  const furnitureBounds = solids.map((object) => ({
    object,
    bounds: new THREE.Box3().setFromObject(object),
  }));
  const measured = assemblies.map((assembly) => {
    assembly.root.updateWorldMatrix(true, true);
    return {
      ...assembly,
      bounds: new THREE.Box3().setFromObject(assembly.model),
    };
  });
  for (const [i, assembly] of measured.entries()) {
    const { bounds, root, placement, support } = assembly;
    for (const furniture of furnitureBounds) {
      if (solidIntersection(bounds, furniture.bounds))
        issues.push(`${root.name} intersects ${furniture.object.name}`);
    }
    for (const other of measured.slice(i + 1))
      if (solidIntersection(bounds, other.bounds))
        issues.push(`${root.name} intersects ${other.root.name}`);
    if (bounds.min.y < -0.001) issues.push(`${root.name} intersects the floor`);
    if (
      placement.surface !== "wall" &&
      bounds.min.x < AISLE_HALF_WIDTH &&
      bounds.max.x > -AISLE_HALF_WIDTH
    )
      issues.push(`${root.name} obstructs the central aisle`);
    if (support) {
      const host = new THREE.Box3().setFromObject(support),
        tolerance = 0.015;
      if (
        bounds.min.x < host.min.x - tolerance ||
        bounds.max.x > host.max.x + tolerance ||
        bounds.min.z < host.min.z - tolerance ||
        bounds.max.z > host.max.z + tolerance
      )
        issues.push(`${root.name} overhangs its support`);
    }
    if (visibility) {
      const origin = fixtures
        .getWorldPosition(new THREE.Vector3())
        .add(new THREE.Vector3(0, 3.15, 5.5));
      const center = bounds.getCenter(new THREE.Vector3()),
        height = bounds.max.y - bounds.min.y;
      const obstacles = [
        ...solids,
        ...measured
          .filter((other) => other !== assembly)
          .map((other) => other.root),
      ];
      let visible = 0;
      for (const fraction of [0.5, 0.72, 0.92]) {
        const target = center.clone();
        target.y = bounds.min.y + height * fraction;
        const distance = origin.distanceTo(target);
        const ray = new THREE.Raycaster(
          origin,
          target.sub(origin).normalize(),
          0,
          distance - 0.025,
        );
        if (!ray.intersectObjects(obstacles, true).length) visible++;
      }
      if (visible < 2)
        issues.push(`${root.name} is hidden by furniture or another appliance`);
    }
  }
  return issues;
}
