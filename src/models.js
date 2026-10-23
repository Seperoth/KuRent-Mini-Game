import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const materials = new Map();
const geometries = new Map();
export const palette = {
  walnut: "#543724",
  oak: "#9d6c3f",
  honey: "#ca9b5e",
  cream: "#e4cfa4",
  plaster: "#bc9b72",
  brass: "#b38b47",
  dark: "#292a22",
  glass: "#72948b",
  rust: "#a65835",
  olive: "#72734a",
  linen: "#d7c5a3",
  black: "#24241e",
};
export function material(color, options = {}) {
  const key = `${color}-${JSON.stringify(options)}`;
  if (!materials.has(key))
    materials.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.78,
        metalness: 0.02,
        ...options,
      }),
    );
  return materials.get(key);
}
function geometry(key, create) {
  if (!geometries.has(key)) geometries.set(key, create());
  return geometries.get(key);
}
export function box(
  parent,
  width,
  height,
  depth,
  x,
  y,
  z,
  color,
  radius = 0.025,
  options = {},
) {
  const key = `box-${width}-${height}-${depth}-${radius}`;
  const geo = geometry(key, () =>
    radius
      ? new RoundedBoxGeometry(
          width,
          height,
          depth,
          1,
          Math.min(radius, width / 3, height / 3, depth / 3),
        )
      : new THREE.BoxGeometry(width, height, depth),
  );
  const mesh = new THREE.Mesh(
    geo,
    typeof color === "string" ? material(color, options) : color,
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function cylinder(
  parent,
  top,
  bottom,
  height,
  x,
  y,
  z,
  color,
  segments = 20,
  options = {},
) {
  const key = `cyl-${top}-${bottom}-${height}-${segments}`;
  const mesh = new THREE.Mesh(
    geometry(
      key,
      () => new THREE.CylinderGeometry(top, bottom, height, segments),
    ),
    material(color, options),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function sphere(parent, radius, x, y, z, color, scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(
    geometry(
      `sphere-${radius}`,
      () => new THREE.SphereGeometry(radius, 14, 10),
    ),
    material(color),
  );
  mesh.position.set(x, y, z);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
export function torus(parent, radius, tube, x, y, z, color) {
  const mesh = new THREE.Mesh(
    geometry(
      `torus-${radius}-${tube}`,
      () => new THREE.TorusGeometry(radius, tube, 8, 28),
    ),
    material(color),
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export function plant(parent, x, z, size = 1, y = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.setScalar(size);
  parent.add(group);
  cylinder(group, 0.25, 0.18, 0.46, 0, 0.23, 0, "#9f6239");
  cylinder(group, 0.28, 0.28, 0.08, 0, 0.45, 0, "#b77c49");
  for (let i = 0; i < 7; i++) {
    const angle = i * 2.4;
    const leaf = sphere(
      group,
      0.26,
      Math.sin(angle) * 0.24,
      0.8 + i * 0.1,
      Math.cos(angle) * 0.24,
      i % 2 ? "#647446" : "#7b8552",
      [0.55, 1.5, 0.55],
    );
    leaf.rotation.z = Math.sin(angle) * 0.55;
  }
  cylinder(group, 0.022, 0.022, 1.2, 0, 1, 0, "#70774b", 6);
  return group;
}

export function cabinet(
  parent,
  x,
  z,
  width = 2.4,
  depth = 1.1,
  height = 1.45,
  color = palette.oak,
) {
  box(parent, width, height, depth, x, height / 2, z, color, 0.035);
  box(
    parent,
    width + 0.13,
    0.12,
    depth + 0.1,
    x,
    height + 0.04,
    z,
    palette.honey,
  );
  for (const side of [-1, 1]) {
    box(
      parent,
      width / 2 - 0.12,
      height - 0.22,
      0.045,
      x + (side * width) / 4,
      height / 2,
      z + depth / 2 + 0.025,
      color,
    );
    box(
      parent,
      0.065,
      0.21,
      0.08,
      x + side * 0.13,
      height / 2 + 0.12,
      z + depth / 2 + 0.07,
      palette.brass,
    );
  }
}

export function table(parent, x, z, width, depth, height, color = palette.oak) {
  box(parent, width, 0.18, depth, x, height, z, color, 0.08);
  for (const side of [-1, 1])
    for (const end of [-1, 1])
      box(
        parent,
        0.15,
        height,
        0.15,
        x + side * (width / 2 - 0.2),
        height / 2,
        z + end * (depth / 2 - 0.2),
        palette.walnut,
      );
}

export function book(parent, x, y, z, color, rotation = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotation;
  parent.add(g);
  box(g, 0.5, 0.075, 0.7, 0, 0, 0, color);
  box(g, 0.44, 0.045, 0.64, 0.015, 0, 0, palette.cream);
  return g;
}

function knobs(group, count, startX, y, z, color = palette.brass) {
  for (let i = 0; i < count; i++) {
    const knob = cylinder(
      group,
      0.045,
      0.045,
      0.05,
      startX + i * 0.16,
      y,
      z,
      color,
      12,
    );
    knob.rotation.x = Math.PI / 2;
  }
}

export function applianceModel(kind) {
  const g = new THREE.Group();
  const light = { emissive: "#6c9d81", emissiveIntensity: 0.35 };
  switch (kind) {
    case "tv":
      box(g, 1.85, 1.1, 0.16, 0, 0.85, 0, "#343a32", 0.055);
      box(g, 1.69, 0.94, 0.025, 0, 0.85, 0.095, "#6b8a7b", 0.025, {
        emissive: "#42634e",
        emissiveIntensity: 0.3,
      });
      box(g, 1.4, 0.025, 0.025, 0, 1.04, 0.12, "#9cad8b");
      box(g, 0.15, 0.3, 0.1, 0, 0.2, 0, palette.black);
      box(g, 0.75, 0.055, 0.35, 0, 0.045, 0.04, "#343a32");
      break;
    case "fan": {
      cylinder(g, 0.38, 0.44, 0.09, 0, 0.05, 0, "#b6bd9d");
      cylinder(g, 0.045, 0.055, 1.12, 0, 0.64, 0, "#8a9d80");
      const head = new THREE.Group();
      head.position.y = 1.52;
      g.add(head);
      const ring = torus(head, 0.45, 0.027, 0, 0, 0.03, "#aebb99");
      torus(head, 0.35, 0.012, 0, 0, 0.065, "#aebb99");
      torus(head, 0.22, 0.012, 0, 0, 0.08, "#aebb99");
      for (let i = 0; i < 8; i++) {
        const spoke = box(head, 0.012, 0.89, 0.012, 0, 0, 0.09, "#aebb99", 0);
        spoke.rotation.z = (i * Math.PI) / 4;
      }
      const blades = new THREE.Group();
      head.add(blades);
      for (let i = 0; i < 3; i++) {
        const blade = sphere(
          blades,
          0.2,
          Math.sin(i * 2.1) * 0.2,
          Math.cos(i * 2.1) * 0.2,
          0,
          "#6c8c74",
          [1, 1.7, 0.14],
        );
        blade.rotation.z = -i * 2.1;
      }
      sphere(head, 0.09, 0, 0, 0.12, "#798e75", [1, 1, 0.6]);
      g.userData.blades = blades;
      break;
    }
    case "lamp":
      cylinder(g, 0.24, 0.3, 0.06, 0, 0.035, 0, palette.brass);
      cylinder(g, 0.025, 0.025, 0.75, 0, 0.42, 0, palette.brass);
      cylinder(g, 0.25, 0.47, 0.48, 0, 0.98, 0, "#e4c68b", 28, {
        emissive: "#9c6929",
        emissiveIntensity: 0.38,
      });
      sphere(g, 0.13, 0, 0.87, 0, "#ffdda1");
      break;
    case "ac":
      box(g, 1.65, 0.58, 0.42, 0, 0.3, 0, "#e4ddc3", 0.09);
      box(g, 1.4, 0.13, 0.06, 0, 0.13, 0.23, "#74836b");
      for (let i = 0; i < 3; i++)
        box(g, 1.3, 0.014, 0.04, 0, 0.1 + i * 0.035, 0.27, "#b9baa0", 0);
      box(g, 0.07, 0.025, 0.015, 0.6, 0.37, 0.23, "#b5cb7e", 0.01, light);
      break;
    case "radio":
      box(g, 1.25, 0.66, 0.38, 0, 0.35, 0, "#98623d", 0.09);
      cylinder(g, 0.23, 0.23, 0.025, -0.23, 0.35, 0.205, "#434b39").rotation.x =
        Math.PI / 2;
      torus(g, 0.18, 0.012, -0.23, 0.35, 0.23, "#9d9c6f");
      box(g, 0.37, 0.12, 0.025, 0.29, 0.48, 0.205, "#c4b784");
      knobs(g, 2, 0.2, 0.24, 0.23);
      cylinder(
        g,
        0.012,
        0.012,
        0.85,
        0.4,
        1.03,
        -0.05,
        palette.brass,
        8,
      ).rotation.z = -0.2;
      break;
    case "purifier":
      box(g, 0.68, 1.25, 0.58, 0, 0.64, 0, "#dedac1", 0.15);
      for (let i = 0; i < 7; i++)
        box(g, 0.46, 0.025, 0.035, 0, 0.6 + i * 0.065, 0.305, "#8d9b7b", 0.01);
      cylinder(
        g,
        0.07,
        0.07,
        0.025,
        0,
        0.28,
        0.31,
        "#adbb8e",
        16,
        light,
      ).rotation.x = Math.PI / 2;
      break;
    case "fridge":
      box(g, 1.18, 2.45, 0.95, 0, 1.24, 0, "#b3c0a5", 0.12);
      box(g, 1.08, 0.71, 0.07, 0, 2.03, 0.51, "#cad3b8", 0.045);
      box(g, 1.08, 1.48, 0.07, 0, 0.89, 0.51, "#cad3b8", 0.045);
      box(g, 0.055, 0.33, 0.1, -0.37, 2.04, 0.6, "#6e8066");
      box(g, 0.055, 0.6, 0.1, -0.37, 1.12, 0.6, "#6e8066");
      box(g, 0.3, 0.32, 0.016, 0.15, 1.14, 0.56, "#e5cd8e");
      break;
    case "microwave":
      box(g, 1.25, 0.68, 0.7, 0, 0.36, 0, "#d6d7bd", 0.06);
      box(g, 0.88, 0.49, 0.025, -0.1, 0.36, 0.37, "#344b3b");
      box(g, 0.73, 0.36, 0.015, -0.1, 0.36, 0.39, "#71846c", 0.015);
      box(g, 0.12, 0.09, 0.025, 0.49, 0.55, 0.37, "#9cb08b", 0.01, light);
      knobs(g, 1, 0.49, 0.29, 0.38);
      break;
    case "kettle":
      cylinder(g, 0.31, 0.38, 0.6, 0, 0.4, 0, "#9fae83");
      cylinder(g, 0.3, 0.3, 0.06, 0, 0.73, 0, "#798b65");
      sphere(g, 0.065, 0, 0.79, 0, palette.walnut);
      torus(g, 0.29, 0.055, 0.33, 0.43, 0, "#515f45").rotation.y = Math.PI / 2;
      cylinder(g, 0.09, 0.14, 0.37, -0.32, 0.47, 0, "#9fae83").rotation.z =
        -0.8;
      cylinder(g, 0.35, 0.4, 0.06, 0, 0.06, 0, "#394c37");
      break;
    case "toaster":
      box(g, 0.95, 0.56, 0.6, 0, 0.3, 0, "#ddc49a", 0.14);
      box(g, 0.6, 0.02, 0.1, 0, 0.59, 0.12, palette.walnut);
      box(g, 0.6, 0.02, 0.1, 0, 0.59, -0.12, palette.walnut);
      box(g, 0.49, 0.32, 0.075, 0, 0.65, -0.12, "#bd8645", 0.08);
      knobs(g, 1, 0.36, 0.23, 0.32);
      break;
    case "blender":
      cylinder(g, 0.28, 0.35, 0.24, 0, 0.14, 0, "#7e9776");
      cylinder(g, 0.33, 0.23, 0.67, 0, 0.61, 0, "#b5cbb2", 20, {
        transparent: true,
        opacity: 0.8,
      });
      cylinder(g, 0.28, 0.2, 0.28, 0, 0.42, 0, "#d8b876");
      cylinder(g, 0.36, 0.36, 0.07, 0, 0.98, 0, "#708a65");
      torus(g, 0.2, 0.04, 0.36, 0.68, 0, "#819d76").rotation.y = Math.PI / 2;
      break;
    case "rice":
      sphere(g, 0.46, 0, 0.35, 0, "#dbdec1", [1, 0.75, 1]);
      cylinder(g, 0.4, 0.45, 0.08, 0, 0.61, 0, "#bac69d");
      box(g, 0.27, 0.07, 0.12, 0, 0.69, 0, "#6e845a");
      box(g, 0.25, 0.15, 0.04, 0, 0.35, 0.43, "#8aa072");
      box(g, 0.12, 0.12, 0.04, -0.51, 0.4, 0, palette.walnut);
      box(g, 0.12, 0.12, 0.04, 0.51, 0.4, 0, palette.walnut);
      break;
    case "laptop":
      box(g, 1.2, 0.055, 0.79, 0, 0.05, 0.1, "#9aab98");
      box(g, 1.18, 0.77, 0.05, 0, 0.43, -0.27, "#344d3d");
      box(g, 1.06, 0.65, 0.02, 0, 0.43, -0.235, "#8ea991", 0.015, light);
      for (let i = 0; i < 4; i++)
        box(g, 0.85, 0.01, 0.035, 0, 0.086, -0.07 + i * 0.1, "#5b725b", 0);
      break;
    case "console":
      box(g, 1.3, 0.65, 0.12, 0, 0.35, 0, "#9fa885", 0.09);
      box(g, 0.84, 0.54, 0.025, 0, 0.35, 0.076, "#3a4f3a", 0.03);
      box(g, 0.72, 0.43, 0.02, 0, 0.35, 0.095, "#719574", 0.02, light);
      knobs(g, 1, -0.55, 0.37, 0.09);
      knobs(g, 1, 0.55, 0.31, 0.09);
      break;
    case "iron":
      box(g, 0.55, 0.13, 0.95, 0, 0.1, 0, "#aebca0", 0.12);
      box(g, 0.43, 0.27, 0.65, 0, 0.26, -0.07, "#c8d3b1", 0.12);
      torus(g, 0.24, 0.065, 0, 0.51, -0.1, "#758c66").scale.z = 0.6;
      break;
    default:
      box(g, 0.7, 0.7, 0.7, 0, 0.35, 0, palette.cream);
  }
  return g;
}
