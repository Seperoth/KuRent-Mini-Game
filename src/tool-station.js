import * as THREE from "three";
import { box, cylinder, torus, table, palette as P } from "./models.js";

export const TOOL_TABLE = {
  x: 0,
  z: 12.3,
  width: 4.8,
  depth: 1.8,
  height: 1.35,
};

export function createToolTable(parent) {
  const station = new THREE.Group();
  station.name = "outside-tool-table";
  station.position.set(TOOL_TABLE.x, 0, TOOL_TABLE.z);
  parent.add(station);
  table(
    station,
    0,
    0,
    TOOL_TABLE.width,
    TOOL_TABLE.depth,
    TOOL_TABLE.height,
    "#a77845",
  );
  const tools = {};
  for (const [kind, x] of [
    ["pliers", -1.12],
    ["gloves", 1.12],
  ]) {
    const tool = new THREE.Group();
    tool.name = kind;
    tool.position.set(x, TOOL_TABLE.height + 0.19, 0);
    tool.rotation.x = -Math.PI / 2;
    station.add(tool);
    if (kind === "pliers") {
      for (const side of [-1, 1]) {
        box(
          tool,
          0.17,
          0.78,
          0.13,
          side * 0.2,
          -0.32,
          0,
          "#b57b38",
          0.07,
        ).rotation.z = side * 0.28;
        box(
          tool,
          0.14,
          0.42,
          0.12,
          side * 0.13,
          0.2,
          0,
          "#b6b2a0",
          0.025,
        ).rotation.z = -side * 0.35;
        box(
          tool,
          0.15,
          0.24,
          0.12,
          side * 0.12,
          0.49,
          0,
          "#d2c8ae",
          0.015,
        ).rotation.z = side * 0.2;
      }
      cylinder(tool, 0.12, 0.12, 0.16, 0, 0.03, 0.02, P.brass, 16).rotation.x =
        Math.PI / 2;
    } else {
      for (const side of [-1, 1]) {
        const glove = new THREE.Group();
        glove.position.x = side * 0.28;
        glove.rotation.z = -side * 0.12;
        tool.add(glove);
        box(glove, 0.43, 0.51, 0.13, 0, -0.03, 0, "#dac690", 0.09);
        box(glove, 0.44, 0.17, 0.14, 0, -0.36, 0, "#8d783f", 0.035);
        for (let finger = 0; finger < 4; finger++)
          box(
            glove,
            0.085,
            0.32 - Math.abs(finger - 1.5) * 0.04,
            0.12,
            -0.15 + finger * 0.1,
            0.33,
            0,
            "#e2d1a4",
            0.04,
          );
        box(
          glove,
          0.13,
          0.3,
          0.12,
          -side * 0.25,
          0.03,
          0,
          "#dac690",
          0.05,
        ).rotation.z = -side * 0.5;
      }
    }
    const halo = torus(
      station,
      0.74,
      0.015,
      x,
      TOOL_TABLE.height + 0.115,
      0,
      "#e1bd6b",
    );
    halo.rotation.x = -Math.PI / 2;
    halo.visible = false;
    tools[kind] = { model: tool, halo };
  }
  return { station, tools };
}
