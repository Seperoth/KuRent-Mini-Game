// Each type owns an appropriate, permanently reserved location. Randomizing the
// appliance roster never randomizes a refrigerator into a bedside-table slot.
export const ROOM_Z = { living: 0, dining: -14, bedroom: -28 };
export const AISLE_HALF_WIDTH = 1.7;
export const SURFACE_GAP = 0.018;

export const APPLIANCE_PLACEMENTS = {
  living: {
    radio: {
      x: -4.5,
      z: -0.15,
      surface: "cabinet",
      width: 1.9,
      depth: 1.3,
      height: 1.1,
    },
    fan: { x: 4.8, z: -0.75, surface: "floor" },
    tv: {
      x: 4.9,
      z: -4.5,
      surface: "cabinet",
      width: 2.5,
      depth: 1.3,
      height: 1.0,
    },
    purifier: { x: -2.45, z: -0.1, surface: "floor" },
    lamp: {
      x: 2.5,
      z: -2.5,
      surface: "table",
      width: 1.4,
      depth: 1.4,
      height: 1.0,
    },
    ac: { x: 4.5, z: -6.66, surface: "wall", y: 4.35 },
  },
  dining: {
    fridge: { x: -4.15, z: -0.4, surface: "floor" },
    microwave: {
      x: 3.9,
      z: -0.5,
      surface: "cabinet",
      width: 2.1,
      depth: 1.35,
      height: 1.3,
    },
    kettle: {
      x: 5.2,
      z: -3.0,
      surface: "cabinet",
      width: 1.85,
      depth: 1.25,
      height: 1.3,
    },
    toaster: {
      x: 4.9,
      z: -5.8,
      surface: "cabinet",
      width: 1.85,
      depth: 1.25,
      height: 1.3,
    },
    blender: {
      x: -4.95,
      z: -6.25,
      surface: "cabinet",
      width: 1.8,
      depth: 1.0,
      height: 1.3,
    },
    rice: {
      x: -2.6,
      z: -6.25,
      surface: "cabinet",
      width: 1.3,
      depth: 1.0,
      height: 1.3,
    },
  },
  bedroom: {
    lamp: {
      x: -6.1,
      z: -5.1,
      surface: "cabinet",
      width: 1.2,
      depth: 1.35,
      height: 0.9,
    },
    ac: { x: -4.1, z: -6.66, surface: "wall", y: 4.35 },
    fan: { x: 4.8, z: -0.75, surface: "floor" },
    laptop: {
      x: 4.6,
      z: -3.8,
      surface: "desk",
      width: 2.3,
      depth: 1.4,
      height: 1.45,
    },
    console: {
      x: 3.0,
      z: -6.0,
      surface: "cabinet",
      width: 1.7,
      depth: 1.0,
      height: 1.05,
    },
    iron: {
      x: -4.7,
      z: -0.2,
      surface: "ironing-table",
      width: 2.0,
      depth: 1.3,
      height: 1.05,
    },
  },
};

export function appliancePlacement(room, kind) {
  const placement = APPLIANCE_PLACEMENTS[room]?.[kind];
  if (!placement) throw new Error(`No appliance placement for ${room}/${kind}`);
  return placement;
}
