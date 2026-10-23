import * as THREE from "three";
import { APPLIANCE_PLACEMENTS } from "./room-layout.js";
import {
  box,
  cylinder,
  sphere,
  plant,
  cabinet,
  table,
  book,
  palette as P,
} from "./models.js";

function part(parent, name, build) {
  const group = new THREE.Group();
  group.name = name;
  group.userData.solid = true;
  parent.add(group);
  build(group);
  return group;
}

function livingFurniture(g) {
  part(g, "sofa", (sofa) => {
    sofa.position.set(-5.25, 0, -3.3);
    sofa.rotation.y = Math.PI / 2;
    box(sofa, 3.6, 0.55, 1.35, 0, 0.6, 0, "#6e7651", 0.17);
    box(sofa, 3.6, 1.45, 0.32, 0, 1.15, -0.65, "#7d835d", 0.15);
    for (const side of [-1, 1]) {
      box(sofa, 0.3, 0.8, 1.55, side * 1.8, 0.95, 0, "#8e9369", 0.13);
      box(sofa, 1.65, 0.2, 1.18, side * 0.86, 0.94, 0.03, "#93956c", 0.12);
      box(
        sofa,
        0.68,
        0.68,
        0.18,
        side * 1.02,
        1.4,
        -0.38,
        side < 0 ? "#bf914e" : "#c8b38a",
        0.12,
      ).rotation.z = side * 0.2;
      for (const end of [-1, 1])
        cylinder(
          sofa,
          0.07,
          0.06,
          0.4,
          side * 1.5,
          0.2,
          end * 0.5,
          P.walnut,
          8,
        );
    }
  });
  // Rugs are decorative floor coverings, not obstacles for objects standing on them.
  box(g, 3.2, 0.022, 4.3, -2.85, 0.01, -2.6, "#b29761", 0.04);
  box(g, 2.95, 0.025, 4.05, -2.85, 0.025, -2.6, "#9e8051", 0.03);
  part(g, "coffee-table", (coffee) => {
    table(coffee, -2.9, -3.0, 2.2, 1.3, 0.82, "#b58a55");
    book(coffee, -3.3, 0.96, -3.15, "#66734e", 0.17);
    book(coffee, -2.7, 0.97, -3.15, "#ad7543", -0.12);
    cylinder(coffee, 0.13, 0.1, 0.2, -2.3, 1.0, -2.8, "#e2cf9c");
  });
  part(g, "bookcase", (shelf) => {
    shelf.position.set(-3.15, 0, -6.25);
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
  });
  part(g, "floor-plant", (p) => plant(p, 6.1, -2.55, 1.1));
}

function diningFurniture(g) {
  part(g, "dining-set", (dining) => {
    table(dining, -3.8, -3.4, 3.3, 2.1, 1.5, "#bd9359");
    for (const z of [-4.9, -1.9])
      for (const x of [-4.5, -3.0]) {
        box(dining, 0.88, 0.12, 0.82, x, 0.84, z, "#967744", 0.05);
        box(
          dining,
          0.88,
          1.16,
          0.12,
          x,
          1.34,
          z + (z < -3 ? -0.4 : 0.4),
          "#a8844e",
          0.05,
        );
        for (const side of [-1, 1])
          for (const end of [-1, 1])
            box(
              dining,
              0.08,
              0.8,
              0.08,
              x + side * 0.32,
              0.4,
              z + end * 0.3,
              P.walnut,
            );
      }
    for (const x of [-4.4, -3.1]) {
      cylinder(dining, 0.3, 0.3, 0.035, x, 1.61, -3.4, "#e2d0a0");
      cylinder(dining, 0.21, 0.21, 0.04, x, 1.635, -3.4, "#eee1bc");
      cylinder(dining, 0.09, 0.07, 0.19, x + 0.35, 1.7, -3.4, "#b5bf9a", 18);
    }
    // A low centerpiece leaves a clear view of appliances on the back counters.
    sphere(dining, 0.28, -3.8, 1.65, -3.4, "#9f7c44", [1, 0.35, 1]);
    for (let i = 0; i < 3; i++)
      sphere(dining, 0.095, -3.95 + i * 0.14, 1.76, -3.4, "#bda15d");
  });
  part(g, "floor-plant", (p) => plant(p, 6.1, 2.2, 1.0));
}

function bedroomFurniture(g) {
  part(g, "back-door", (door) => {
    box(door, 3.15, 4.55, 0.16, 0, 2.28, -6.87, "#876441", 0.025);
    for (const side of [-1, 1]) {
      box(door, 1.27, 1.65, 0.05, side * 0.75, 3.18, -6.75, "#99744b", 0.02);
      box(door, 1.27, 1.65, 0.05, side * 0.75, 1.17, -6.75, "#99744b", 0.02);
    }
    sphere(door, 0.075, 1.13, 2.1, -6.68, "#c7a45d");
  });
  part(g, "bed", (bed) => {
    const x = -3.65,
      z = -3.65;
    box(bed, 3.3, 0.2, 4.8, x, 0.3, z, P.walnut, 0.07);
    box(bed, 3.1, 0.42, 4.6, x, 0.65, z, "#ded0af", 0.18);
    box(bed, 3.45, 1.95, 0.25, x, 1.1, -6.12, "#89623f", 0.16);
    box(bed, 3.05, 0.22, 3.25, x, 0.95, -3.0, "#a29158", 0.12);
    box(bed, 1.4, 0.18, 3.27, x + 0.2, 1.07, -3.0, "#c6ac6d", 0.06);
    for (const px of [x - 0.75, x + 0.75])
      box(bed, 1.25, 0.28, 0.85, px, 1.02, -5.25, "#e1d2ad", 0.17);
  });
  box(g, 4.2, 0.022, 5.15, -3.7, 0.01, -3.6, "#917c55", 0.04);
  part(g, "desk-chair", (chair) => {
    box(chair, 0.83, 0.12, 0.76, 4.6, 0.8, -2.2, "#7d7651", 0.07);
    box(chair, 0.83, 0.95, 0.12, 4.6, 1.18, -1.88, "#8b835a", 0.07);
    for (const side of [-1, 1])
      for (const end of [-1, 1])
        box(
          chair,
          0.08,
          0.75,
          0.08,
          4.6 + side * 0.3,
          0.38,
          -2.2 + end * 0.27,
          P.walnut,
        );
  });
  part(g, "wardrobe", (wardrobe) => {
    box(wardrobe, 2.1, 4.1, 0.8, 5.75, 2.05, -6.25, "#775737", 0.07);
    for (const side of [-1, 1]) {
      box(wardrobe, 0.95, 3.8, 0.04, 5.75 + side * 0.5, 2.05, -5.83, "#8d6942");
      box(wardrobe, 0.06, 0.35, 0.1, 5.75 + side * 0.09, 2, -5.72, "#c3a062");
    }
  });
  part(g, "floor-plant", (p) => plant(p, 6.2, 1.15, 0.95));
}

export function createRoomFixtures(room) {
  const fixtures = new THREE.Group();
  fixtures.name = `${room}-fixtures`;
  if (room === "living") livingFurniture(fixtures);
  else if (room === "dining") diningFurniture(fixtures);
  else if (room === "bedroom") bedroomFurniture(fixtures);
  else throw new Error(`Unknown furnished room ${room}`);
  for (const [kind, placement] of Object.entries(APPLIANCE_PLACEMENTS[room])) {
    if (["floor", "wall"].includes(placement.surface)) continue;
    const support = part(fixtures, `support-${kind}`, (g) => {
      g.position.set(placement.x, 0, placement.z);
      if (placement.surface === "cabinet")
        cabinet(g, 0, 0, placement.width, placement.depth, placement.height);
      else {
        table(
          g,
          0,
          0,
          placement.width,
          placement.depth,
          placement.height,
          placement.surface === "ironing-table" ? "#a29d77" : P.oak,
        );
        if (placement.surface === "ironing-table")
          box(
            g,
            placement.width - 0.12,
            0.035,
            placement.depth - 0.12,
            0,
            placement.height + 0.11,
            0,
            "#c7bd91",
            0.08,
          );
      }
    });
    support.userData.supports = kind;
    support.updateWorldMatrix(true, true);
    support.userData.surfaceTop = new THREE.Box3().setFromObject(support).max.y;
  }
  fixtures.updateWorldMatrix(true, true);
  fixtures.userData.solids = fixtures.children.filter(
    (child) => child.userData.solid,
  );
  return fixtures;
}
