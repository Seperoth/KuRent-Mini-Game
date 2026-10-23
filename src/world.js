import * as THREE from "three";
import { HouseCamera } from "./camera.js";
import {
  box,
  cylinder,
  sphere,
  plant,
  material,
  palette as P,
} from "./models.js";

import { ROOM_Z } from "./room-layout.js";
import { createRoomFixtures } from "./furniture.js";
import { createPlacedAppliance, auditPlacements } from "./placement.js";
import { createToolTable } from "./tool-station.js";

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
  wallPicture(
    group,
    -4.6,
    -6.81,
    0,
    room === "bedroom" ? "#6f7660" : "#826843",
  );
  wallPicture(group, 4.6, -6.81, 0, "#7c8250");
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
  g.userData.toolStation = createToolTable(g);
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
    this.toolStation = exterior(this.scene).userData.toolStation;
    this.rooms = {};
    this.roomFixtures = {};
    for (const [name, z] of Object.entries(ROOM_Z)) {
      const group = new THREE.Group();
      group.position.z = z;
      this.rooms[name] = group;
      this.scene.add(group);
      makeRoomShell(group, name);
      const fixtures = createRoomFixtures(name);
      group.add(fixtures);
      this.roomFixtures[name] = fixtures;
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
      const assembly = createPlacedAppliance(
        item,
        this.roomFixtures[item.room],
      );
      const { root, model } = assembly;
      this.rooms[item.room].add(root);
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
      halo.position.y = model.position.y + 0.015;
      root.add(halo);
      halo.visible = false;
      this.models.set(item.id, {
        ...assembly,
        halo,
        center,
        height: size.y,
        width: size.x,
        room: item.room,
      });
    }
    for (const [id, value] of this.models) {
      if (!appliances.some((item) => item.id === id)) {
        value.root.removeFromParent();
        value.halo.geometry.dispose();
        value.halo.material.dispose();
        this.models.delete(id);
      }
    }

    this.placementIssues = Object.entries(this.roomFixtures).flatMap(
      ([room, fixtures]) =>
        auditPlacements(
          [...this.models.values()].filter((value) => value.room === room),
          fixtures,
        ),
    );
    document.body.dataset.placementIssues = String(this.placementIssues.length);
    if (this.placementIssues.length)
      console.error("Appliance placement:", ...this.placementIssues);
  }

  reset() {
    for (const value of this.models.values()) {
      value.root.removeFromParent();
      value.halo.geometry.dispose();
      value.halo.material.dispose();
    }
    this.models.clear();
    this.placementIssues = [];
    document.body.dataset.placementIssues = "0";
  }
  render(now, state) {
    for (const [kind, value] of Object.entries(this.toolStation.tools))
      value.halo.visible = state.tool === kind;
    const pose = this.controls.update(now);
    this.camera.position.set(...pose.position);
    this.camera.lookAt(...pose.target);
    if (this.camera.fov !== pose.fov) {
      this.camera.fov = pose.fov;
      this.camera.updateProjectionMatrix();
    }
    const projected = [];
    const time = now / 1000;
    if (state.room === 0 && state.status !== "ready") {
      for (const [kind, value] of Object.entries(this.toolStation.tools)) {
        const anchor = value.model.getWorldPosition(new THREE.Vector3());
        anchor.project(this.camera);
        projected.push({
          id: `tool-${kind}`,
          tool: kind,
          x: (anchor.x * 0.5 + 0.5) * this.width,
          y: (-anchor.y * 0.5 + 0.5) * this.height,
          scale: Math.max(0.7, Math.min(1.2, this.width / 1440)),
          visible: anchor.z < 1 && anchor.z > -1,
        });
      }
    }
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
