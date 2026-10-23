import * as THREE from "three";
import { HouseCamera } from "./camera.js";
import {
  applianceModel,
  box,
  cylinder,
  sphere,
  plant,
  cabinet,
  table,
  book,
  material,
  palette as P,
} from "./models.js";

const ROOM_Z = { living: 0, dining: -14, bedroom: -28 };
const SLOTS = [
  [-4.7, -0.5],
  [4.7, -0.5],
  [4.7, -5.1],
  [-4.7, -5.1],
  [-2.6, -5.4],
  [2.6, -5.4],
];

function floorTexture(checkered = false) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (checkered) {
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 ? "#a68c63" : "#d2b98c";
        ctx.fillRect(x * 64, y * 64, 64, 64);
        ctx.strokeStyle = "#8e775150";
        ctx.strokeRect(x * 64, y * 64, 64, 64);
      }
  } else {
    for (let y = 0; y < 12; y++) {
      ctx.fillStyle = ["#9c7047", "#a87c50", "#b18457", "#a17449"][y % 4];
      ctx.fillRect(0, y * 44, 512, 44);
      ctx.fillStyle = "#54392355";
      ctx.fillRect(0, y * 44, 512, 2);
      for (let x = 0; x < 3; x++) {
        ctx.fillRect(x * 210 + (y % 2) * 90, y * 44, 2, 44);
      }
      ctx.strokeStyle = "#65462d1c";
      ctx.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(0, y * 44 + 8 + k * 6);
        ctx.bezierCurveTo(
          170,
          y * 44 + k * 6,
          280,
          y * 44 + 15 + k * 6,
          512,
          y * 44 + 8 + k * 6,
        );
        ctx.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  return texture;
}

function wallPicture(group, x, z, rotation, color = "#7c8250") {
  const g = new THREE.Group();
  g.position.set(x, 3.3, z);
  g.rotation.y = rotation;
  group.add(g);
  box(g, 1.35, 1.75, 0.12, 0, 0, 0, P.walnut);
  box(g, 1.16, 1.55, 0.025, 0, 0, 0.08, "#d9c99b");
  sphere(g, 0.25, 0.2, 0.34, 0.105, "#c99a53", [1, 1, 0.02]);
  const hill = sphere(g, 0.55, -0.2, -0.42, 0.11, color, [1, 0.65, 0.02]);
  sphere(g, 0.45, 0.35, -0.48, 0.12, "#8d8f59", [1, 0.7, 0.02]);
}

function windowFrame(group, x, y, z, rotation = 0, width = 2.45, height = 2.6) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotation;
  group.add(g);
  box(g, width + 0.25, height + 0.25, 0.15, 0, 0, 0, P.walnut);
  box(g, width, height, 0.08, 0, 0, 0.1, "#698279", 0.01, {
    emissive: "#3c5c58",
    emissiveIntensity: 0.3,
  });
  box(g, 0.09, height, 0.09, 0, 0, 0.19, "#d6c390");
  box(g, width, 0.09, 0.09, 0, 0, 0.19, "#d6c390");
  box(g, width + 0.45, 0.13, 0.4, 0, -height / 2 - 0.07, 0.16, P.honey);
  cylinder(
    g,
    0.04,
    0.04,
    width + 0.8,
    0,
    height / 2 + 0.25,
    0.2,
    P.brass,
    10,
  ).rotation.z = Math.PI / 2;
  for (const side of [-1, 1]) {
    box(
      g,
      0.48,
      height + 0.35,
      0.18,
      side * (width / 2 + 0.12),
      0.03,
      0.26,
      "#95704d",
      0.06,
    );
    for (let i = 0; i < 4; i++)
      box(
        g,
        0.025,
        height + 0.28,
        0.04,
        side * (width / 2 - 0.06 + i * 0.1),
        0.03,
        0.37,
        "#b78d5a",
        0.01,
      );
  }
}

function ceilingLamp(group, z, style = "simple") {
  cylinder(group, 0.025, 0.025, 0.65, 0, 5.45, z, P.brass, 8);
  cylinder(
    group,
    0.18,
    0.66,
    0.35,
    0,
    4.99,
    z,
    style === "simple" ? "#775239" : "#52624a",
    24,
  );
  cylinder(group, 0.59, 0.59, 0.04, 0, 4.81, z, "#f4d38b", 24, {
    emissive: "#ffd087",
    emissiveIntensity: 1,
  });
  const light = new THREE.PointLight("#ffe0a0", 55, 15, 2);
  light.position.set(0, 4.55, z);
  group.add(light);
}

function makeRoomShell(group, room) {
  const colors = { living: "#b49770", dining: "#c2a47b", bedroom: "#a89a78" };
  const floor = material("#ffffff", { map: floorTexture(room === "dining") });
  box(group, 14, 0.18, 14, 0, -0.1, 0, floor, 0);
  for (const side of [-1, 1]) {
    box(group, 0.22, 5.9, 14, side * 7, 2.95, 0, colors[room], 0);
    box(group, 0.28, 1.15, 14, side * 6.96, 0.57, 0, "#6d4a30", 0);
    box(group, 0.31, 0.1, 14, side * 6.94, 1.18, 0, P.honey, 0);
    box(group, 0.32, 0.16, 14, side * 6.93, 0.1, 0, P.walnut, 0);
    for (let i = -6; i <= 6; i += 1.2)
      box(group, 0.015, 0.88, 0.04, side * 6.78, 0.6, i, "#8f6540", 0);
    box(group, 0.32, 0.18, 14, side * 6.9, 5.65, 0, "#785337", 0);
  }
  box(group, 14, 0.2, 14, 0, 5.9, 0, "#9c855f", 0);
  for (const z of [-4.5, 2]) box(group, 14, 0.24, 0.2, 0, 5.65, z, P.walnut, 0);
  // The central doorways remain open, making camera travel continuous.
  for (const side of [-1, 1]) {
    box(group, 5.2, 5.8, 0.22, side * 4.4, 2.9, -7, colors[room], 0);
    box(group, 5.2, 1.15, 0.27, side * 4.4, 0.575, -6.96, "#6d4a30", 0);
    box(group, 0.17, 4.8, 0.3, side * 1.7, 2.4, -6.86, P.honey, 0.01);
  }
  box(group, 3.45, 1.1, 0.24, 0, 5.25, -7, colors[room], 0);
  box(group, 3.55, 0.18, 0.34, 0, 4.72, -6.85, P.honey, 0.01);
  ceilingLamp(group, 1.7);
  ceilingLamp(group, -4.1, "green");
  windowFrame(group, -6.82, 3.25, -2, Math.PI / 2);
  windowFrame(group, 6.82, 3.25, -3.3, -Math.PI / 2);
  group.userData.pedestals = [];
  for (const [i, [x, z]] of SLOTS.entries()) {
    const pedestal = new THREE.Group();
    pedestal.position.set(x, 0, z);
    group.add(pedestal);
    cabinet(pedestal, 0, 0, i >= 4 ? 1.35 : 1.9, 1.0, 1.4);
    group.userData.pedestals.push(pedestal);
  }
  wallPicture(
    group,
    -4.6,
    -6.81,
    0,
    room === "bedroom" ? "#6f7660" : "#826843",
  );
  wallPicture(group, 4.6, -6.81, 0, "#7c8250");
}

function livingFurniture(g) {
  const sofa = new THREE.Group();
  sofa.position.set(-5, 0, -3);
  sofa.rotation.y = Math.PI / 2;
  g.add(sofa);
  box(sofa, 3.6, 0.55, 1.35, 0, 0.6, 0, "#6e7651", 0.17);
  box(sofa, 3.6, 1.45, 0.32, 0, 1.15, -0.65, "#7d835d", 0.15);
  for (const side of [-1, 1]) {
    box(sofa, 0.3, 0.8, 1.55, side * 1.8, 0.95, 0, "#8e9369", 0.13);
    box(sofa, 1.65, 0.2, 1.18, side * 0.86, 0.94, 0.03, "#93956c", 0.12);
    const pillow = box(
      sofa,
      0.68,
      0.68,
      0.18,
      side * 1.02,
      1.4,
      -0.38,
      side < 0 ? "#bf914e" : "#c8b38a",
      0.12,
    );
    pillow.rotation.z = side * 0.2;
    for (const end of [-1, 1])
      cylinder(sofa, 0.07, 0.06, 0.4, side * 1.5, 0.2, end * 0.5, P.walnut, 8);
  }
  box(g, 3.3, 0.025, 4.6, -2.6, 0.015, -2.5, "#b29761", 0.04);
  box(g, 2.96, 0.03, 4.25, -2.6, 0.03, -2.5, "#9e8051", 0.03);
  table(g, -2.5, -2.3, 2.5, 1.45, 0.85, "#b58a55");
  book(g, -2.8, 0.98, -2.4, "#66734e", 0.17);
  book(g, -2.1, 1, -2.4, "#ad7543", -0.12);
  cylinder(g, 0.13, 0.1, 0.2, -2.2, 1.04, -1.95, "#e2cf9c");
  plant(g, 5.45, -3.2, 1.45);
  const shelf = new THREE.Group();
  shelf.position.set(5.95, 0, -5.5);
  shelf.rotation.y = -Math.PI / 2;
  g.add(shelf);
  box(shelf, 1.8, 3.1, 0.75, 0, 1.55, 0, P.walnut, 0.02);
  for (let i = 0; i < 4; i++) {
    box(shelf, 1.65, 0.1, 0.8, 0, 0.25 + i * 0.73, 0.05, P.oak);
    for (let j = 0; j < 5; j++)
      box(
        shelf,
        0.17,
        0.48 + (j % 2) * 0.08,
        0.42,
        -0.6 + j * 0.25,
        0.55 + i * 0.73,
        0.13,
        ["#ad854b", "#73805c", "#b89b68"][j % 3],
      );
  }
}

function diningFurniture(g) {
  table(g, -3.6, -3.1, 3.9, 2.6, 1.58, "#bd9359");
  for (const z of [-4.9, -1.3])
    for (const x of [-4.5, -2.7]) {
      box(g, 0.92, 0.12, 0.9, x, 0.88, z, "#967744", 0.05);
      box(
        g,
        0.92,
        1.25,
        0.12,
        x,
        1.45,
        z + (z < -3 ? -0.4 : 0.4),
        "#a8844e",
        0.05,
      );
      for (const side of [-1, 1])
        for (const end of [-1, 1])
          box(
            g,
            0.08,
            0.85,
            0.08,
            x + side * 0.34,
            0.43,
            z + end * 0.32,
            P.walnut,
          );
    }
  for (const x of [-4.4, -2.8]) {
    cylinder(g, 0.34, 0.34, 0.035, x, 1.69, -3.1, "#e2d0a0");
    cylinder(g, 0.24, 0.24, 0.04, x, 1.715, -3.1, "#eee1bc");
    cylinder(g, 0.095, 0.075, 0.22, x + 0.45, 1.8, -3.1, "#b5bf9a", 18);
  }
  cylinder(g, 0.2, 0.25, 0.45, -3.6, 1.87, -3.1, "#b98b53");
  plant(g, -3.6, -3.1, 0.44, 2.1);
  const shelf = new THREE.Group();
  shelf.position.set(6.1, 0, -3.6);
  shelf.rotation.y = -Math.PI / 2;
  g.add(shelf);
  cabinet(shelf, 0, 0, 2.1, 1.0, 1.5, "#65704b");
  box(shelf, 1.4, 0.08, 0.55, 0, 1.59, 0.1, "#495443", 0.1);
  cylinder(shelf, 0.045, 0.045, 0.6, 0.36, 1.9, -0.1, P.brass).rotation.z = 0.3;
  box(shelf, 2.1, 0.8, 0.45, 0, 3.65, -0.3, "#7c8259", 0.05);
  plant(g, 5.7, 3.1, 1.35);
}

function bedroomFurniture(g) {
  // The last room ends at a closed timber door rather than an empty corridor.
  box(g, 3.15, 4.55, 0.16, 0, 2.28, -6.87, "#876441", 0.025);
  for (const side of [-1, 1]) {
    box(g, 1.27, 1.65, 0.05, side * 0.75, 3.18, -6.75, "#99744b", 0.02);
    box(g, 1.27, 1.65, 0.05, side * 0.75, 1.17, -6.75, "#99744b", 0.02);
  }
  sphere(g, 0.075, 1.13, 2.1, -6.68, "#c7a45d");
  box(g, 4.15, 0.2, 5.0, -3.45, 0.3, -3.6, P.walnut, 0.07);
  box(g, 3.95, 0.42, 4.8, -3.45, 0.65, -3.6, "#ded0af", 0.18);
  box(g, 4.3, 2.2, 0.25, -3.45, 1.2, -6.05, "#89623f", 0.16);
  box(g, 3.91, 0.22, 3.4, -3.45, 0.95, -2.95, "#a29158", 0.12);
  box(g, 1.55, 0.18, 3.42, -3.2, 1.07, -2.95, "#c6ac6d", 0.06);
  for (const x of [-4.45, -2.5])
    box(g, 1.7, 0.28, 0.93, x, 1.02, -5.3, "#e1d2ad", 0.17);
  box(g, 4.5, 0.03, 5.4, -3.45, 0.03, -3.45, "#917c55", 0.04);
  const desk = new THREE.Group();
  desk.position.set(5.7, 0, -3.4);
  desk.rotation.y = -Math.PI / 2;
  g.add(desk);
  table(desk, 0, 0, 2.4, 1.3, 1.5, "#a37c4b");
  book(desk, -0.7, 1.65, 0, "#72805b");
  box(desk, 0.9, 0.12, 0.8, 0, 0.8, 1.35, "#7d7651", 0.07);
  box(desk, 0.9, 1.2, 0.15, 0, 1.35, 1.71, "#8b835a", 0.07);
  for (const side of [-1, 1])
    box(desk, 0.08, 0.75, 0.08, side * 0.35, 0.38, 1.35, P.walnut);
  plant(g, -5.9, 2.4, 1.4);
  box(g, 2.3, 4.1, 0.95, 5.9, 2.05, -5.6, "#775737", 0.07);
  box(g, 1.04, 3.8, 0.04, 5.35, 2.05, -5.1, "#8d6942");
  box(g, 1.04, 3.8, 0.04, 6.45, 2.05, -5.1, "#8d6942");
  box(g, 0.06, 0.35, 0.1, 5.92, 2, -5, "#c3a062");
  box(g, 0.06, 0.35, 0.1, 6.07, 2, -5, "#c3a062");
}

function tree(parent, x, z, size = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(size);
  parent.add(g);
  cylinder(g, 0.22, 0.42, 5, 0, 2.5, 0, "#5b4225", 8);
  for (let i = 0; i < 5; i++) {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.8, 1),
      material(["#4c582c", "#596337", "#656b3a"][i % 3]),
    );
    mesh.position.set(
      Math.sin(i * 2.4) * 1.2,
      4.8 + i * 0.38,
      Math.cos(i * 2.4) * 0.8,
    );
    mesh.scale.y = 1.2;
    mesh.castShadow = true;
    g.add(mesh);
  }
}

function exterior(scene) {
  const g = new THREE.Group();
  scene.add(g);
  box(g, 180, 0.3, 180, 0, -0.35, 0, "#555b30", 0);
  for (let i = 0; i < 11; i++)
    box(
      g,
      3.5,
      0.08,
      1.28,
      Math.sin(i * 1.8) * 0.12,
      -0.08,
      8.5 + i * 1.6,
      "#baaa7f",
      0.08,
    );
  for (const side of [-1, 1]) {
    box(g, 5.4, 5.9, 0.28, side * 4.3, 2.95, 7.12, "#ad8c5c", 0);
    for (let y = 0.5; y < 5.9; y += 0.46)
      box(g, 5.4, 0.035, 0.015, side * 4.3, y, 7.28, "#937344", 0);
    box(g, 0.2, 4.9, 0.37, side * 1.65, 2.45, 7.19, "#d7bc87", 0);
    const w = new THREE.Group();
    w.position.set(side * 4.3, 3.15, 7.35);
    g.add(w);
    box(w, 2.15, 2.6, 0.14, 0, 0, 0, "#5a432b", 0.02);
    box(w, 1.9, 2.34, 0.04, 0, 0, 0.09, "#e6b760", 0, {
      emissive: "#e8b255",
      emissiveIntensity: 0.65,
    });
    box(w, 0.1, 2.34, 0.05, 0, 0, 0.14, "#846f43");
    box(w, 1.9, 0.1, 0.05, 0, 0, 0.14, "#846f43");
    box(w, 2.45, 0.14, 0.4, 0, -1.4, 0.04, "#c6ad78");
    for (const end of [-1, 1])
      box(w, 0.37, 2.7, 0.12, end * 1.32, 0, -0.04, "#6b7045");
    plant(g, side * 2.4, 8.0, 1.4);
  }
  box(g, 3.25, 1.15, 0.3, 0, 5.32, 7.12, "#ad8c5c", 0);
  box(g, 3.65, 0.23, 0.48, 0, 4.85, 7.2, "#d7bc87");
  for (let i = 0; i < 3; i++)
    box(
      g,
      4.0 + i * 0.55,
      0.15,
      1.1,
      0,
      -0.03 - i * 0.09,
      7.6 + i * 0.6,
      "#97815a",
      0.03,
    );
  // Gabled roof; interiors remain fully furnished beneath it.
  const shape = new THREE.Shape();
  shape.moveTo(-7.6, 0);
  shape.lineTo(0, 3.7);
  shape.lineTo(7.6, 0);
  shape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 43,
    bevelEnabled: false,
  });
  const roof = new THREE.Mesh(roofGeo, material("#634c32"));
  roof.position.set(0, 5.9, -35);
  roof.castShadow = true;
  g.add(roof);
  const fascia = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    material("#81643d"),
  );
  fascia.position.set(0, 5.88, 8.03);
  g.add(fascia);
  for (const side of [-1, 1]) {
    const beam = box(g, 8.55, 0.17, 0.2, side * 3.8, 7.7, 8.15, "#b79966", 0);
    beam.rotation.z = side * -0.45;
  }
  box(g, 1.15, 2.5, 1.2, 4.0, 9.1, -2, "#895e3b", 0.03);
  box(g, 1.4, 0.2, 1.42, 4, 10.4, -2, "#5d422b", 0.02);
  // Attic window and timber accents echo the supplied house menu.
  box(g, 1.25, 1.25, 0.1, 0, 7.0, 8.1, "#5b482d");
  box(g, 1.02, 1.02, 0.05, 0, 7.0, 8.18, "#ccaa60", 0.01, {
    emissive: "#b88a35",
    emissiveIntensity: 0.4,
  });
  box(g, 0.08, 1.02, 0.04, 0, 7.0, 8.22, "#665632");
  box(g, 1.02, 0.08, 0.04, 0, 7.0, 8.22, "#665632");
  for (const [x, z, s] of [
    [-13, 12, 1.7],
    [13, 6, 1.7],
    [-16, -5, 1.9],
    [16, -12, 2.1],
    [-11, 28, 1.7],
    [15, 25, 1.9],
    [-23, 20, 2.5],
    [25, 0, 2.5],
    [-17, -25, 2],
    [20, -32, 2],
  ])
    tree(g, x, z, s);
  for (const side of [-1, 1])
    for (let i = 0; i < 9; i++) {
      const x = side * (3.3 + i * 1.2);
      box(g, 0.18, 1.45, 0.15, x, 0.7, 24, "#c3b381", 0.02);
      if (i < 8)
        for (const y of [0.45, 1.03])
          box(g, 1.3, 0.12, 0.12, x + side * 0.6, y, 24, "#c3b381", 0.01);
    }
  const mailbox = new THREE.Group();
  mailbox.position.set(6.8, 0, 20.5);
  mailbox.rotation.y = -0.2;
  g.add(mailbox);
  box(mailbox, 0.25, 2.0, 0.25, 0, 1, 0, "#785333");
  box(mailbox, 1.35, 0.87, 0.85, 0, 2.2, 0, "#98512e", 0.2);
  box(mailbox, 0.8, 0.36, 0.045, 0, 2.24, 0.45, "#653a22", 0.09);
  box(mailbox, 0.1, 0.7, 0.05, 0.73, 2.57, 0.1, "#c5984d");
  box(mailbox, 0.35, 0.22, 0.05, 0.85, 2.82, 0.1, "#c5984d");
  const bench = new THREE.Group();
  bench.position.set(-5.4, 0, 12.5);
  bench.rotation.y = 0.2;
  g.add(bench);
  table(bench, 0, 0, 3.2, 1.2, 1.4, "#a77845");
  box(bench, 1.25, 0.55, 0.65, -0.6, 1.78, 0, "#886236", 0.06);
  box(bench, 0.7, 0.4, 0.5, 0.75, 1.7, 0, "#5c6844", 0.06);
  for (let i = 0; i < 4; i++)
    cylinder(
      bench,
      0.035,
      0.035,
      0.7,
      -0.9 + i * 0.2,
      2.25,
      0,
      ["#a89b68", "#756e46"][i % 2],
      8,
    ).rotation.z = 0.3;
  return g;
}

export class HouseWorld {
  constructor(canvas, onProjection) {
    this.canvas = canvas;
    this.onProjection = onProjection;
    this.models = new Map();
    this.currentRoom = 0;
    this.controls = new HouseCamera(
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#6c6845");
    this.scene.fog = new THREE.Fog("#6c6845", 35, 110);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
    this.scene.add(new THREE.HemisphereLight("#ffeac3", "#54402a", 2.2));
    const sun = new THREE.DirectionalLight("#ffd999", 2.4);
    sun.position.set(-18, 28, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -28;
    sun.shadow.camera.right = 28;
    sun.shadow.camera.top = 28;
    sun.shadow.camera.bottom = -28;
    sun.shadow.normalBias = 0.045;
    sun.shadow.bias = -0.0002;
    this.scene.add(sun);
    exterior(this.scene);
    this.rooms = {};
    for (const [name, z] of Object.entries(ROOM_Z)) {
      const group = new THREE.Group();
      group.position.z = z;
      this.rooms[name] = group;
      this.scene.add(group);
      makeRoomShell(group, name);
      if (name === "living") livingFurniture(group);
      else if (name === "dining") diningFurniture(group);
      else bedroomFurniture(group);
    }
    // Dust catches the same warm light used by the menu.
    const vertices = new Float32Array(130 * 3);
    for (let i = 0; i < 130; i++) {
      vertices[i * 3] = (Math.random() - 0.5) * 25;
      vertices[i * 3 + 1] = 0.5 + Math.random() * 7;
      vertices[i * 3 + 2] = Math.random() * 70 - 36;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    this.dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: "#e6c27e",
        size: 0.025,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    );
    this.scene.add(this.dust);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas.parentElement);
    this.resize();
    document.body.dataset.renderer = "webgl";
  }
  resize() {
    const { width, height } = this.canvas.parentElement.getBoundingClientRect();
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  menu(instant = false) {
    this.controls.showMenu(performance.now(), instant);
  }
  travel(room, instant = false) {
    this.currentRoom = room;
    this.controls.travel(room, performance.now(), instant);
  }
  sync(appliances) {
    for (const item of appliances) {
      if (this.models.has(item.id)) continue;
      const root = new THREE.Group();
      const [x, z] = SLOTS[item.slot];
      root.position.set(x, 0, z + ROOM_Z[item.room]);
      let base = 1.49;
      if (["fan", "fridge", "purifier"].includes(item.kind)) {
        base = 0;
        this.rooms[item.room].userData.pedestals[item.slot].visible = false;
      }
      if (item.kind === "ac") base = 3.95;
      const model = applianceModel(item.kind);
      model.position.y = base;
      if (item.slot === 0) model.rotation.y = 0.25;
      if (item.slot === 1) model.rotation.y = -0.25;
      root.add(model);
      this.scene.add(root);
      root.updateWorldMatrix(true, true);
      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.55, 32),
        new THREE.MeshBasicMaterial({
          color: "#e9b955",
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = base + 0.015;
      root.add(halo);
      halo.visible = false;
      this.models.set(item.id, {
        root,
        model,
        halo,
        center,
        height: size.y,
        width: size.x,
        room: item.room,
      });
    }
    for (const [id, value] of this.models) {
      if (!appliances.some((item) => item.id === id)) {
        this.scene.remove(value.root);
        value.halo.geometry.dispose();
        value.halo.material.dispose();
        this.models.delete(id);
      }
    }
  }
  reset() {
    for (const value of this.models.values()) {
      this.scene.remove(value.root);
      value.halo.geometry.dispose();
      value.halo.material.dispose();
    }
    this.models.clear();
    for (const room of Object.values(this.rooms))
      for (const pedestal of room.userData.pedestals) pedestal.visible = true;
  }
  render(now, state) {
    const pose = this.controls.update(now);
    this.camera.position.set(...pose.position);
    this.camera.lookAt(...pose.target);
    if (this.camera.fov !== pose.fov) {
      this.camera.fov = pose.fov;
      this.camera.updateProjectionMatrix();
    }
    const projected = [];
    const time = now / 1000;
    for (const item of state.appliances) {
      const value = this.models.get(item.id);
      if (!value) continue;
      value.halo.visible = !!item.fault;
      value.halo.material.color.set(
        item.fault && item.fault.deadline <= state.time ? "#e58b4b" : "#efc468",
      );
      value.halo.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
      value.halo.material.opacity = 0.45 + Math.sin(time * 3) * 0.15;
      if (value.model.userData.blades && !item.fault)
        value.model.userData.blades.rotation.z = time * 3;
      if (item.room !== ["outside", "living", "dining", "bedroom"][state.room])
        continue;
      const anchor = value.center.clone();
      anchor.y += value.height * 0.3;
      anchor.project(this.camera);
      const distance = this.camera.position.distanceTo(value.center);
      const scale = Math.max(0.6, Math.min(1.15, 10 / distance));
      projected.push({
        id: item.id,
        x: (anchor.x * 0.5 + 0.5) * this.width,
        y: (-anchor.y * 0.5 + 0.5) * this.height,
        scale,
        visible:
          anchor.z < 1 &&
          anchor.z > -1 &&
          Math.abs(anchor.x) < 1.05 &&
          Math.abs(anchor.y) < 1.1,
      });
    }
    this.onProjection(projected, !!this.controls.transition);
    this.dust.position.y = Math.sin(time * 0.08) * 0.2;
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.observer.disconnect();
    this.renderer.dispose();
  }
}
