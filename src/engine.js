export const LIMIT = 20_000;
export const GRACE = 60;
export const DIFFICULTY_INTERVAL = 120;
export const ROOMS = ["outside", "living", "dining", "bedroom"];
export const ROOM_NAMES = ["Outside", "Living room", "Dining room", "Bedroom"];

const CATALOG = {
  living: [
    ["tv", "Television"],
    ["fan", "Standing fan"],
    ["lamp", "Table lamp"],
    ["ac", "Air conditioner"],
    ["radio", "Radio"],
    ["purifier", "Air purifier"],
  ],
  dining: [
    ["fridge", "Refrigerator"],
    ["microwave", "Microwave"],
    ["kettle", "Electric kettle"],
    ["toaster", "Toaster"],
    ["blender", "Blender"],
    ["rice", "Rice cooker"],
  ],
  bedroom: [
    ["fan", "Standing fan"],
    ["lamp", "Bedside lamp"],
    ["ac", "Air conditioner"],
    ["laptop", "Laptop"],
    ["console", "Game console"],
    ["iron", "Iron"],
  ],
};

export function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const secs = total % 60;
  return `${hours ? `${String(hours).padStart(2, "0")}:` : ""}${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function createGame(random = Math.random) {
  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const catalogs = Object.fromEntries(
    Object.entries(CATALOG).map(([room, items]) => [room, shuffle(items)]),
  );
  let nextId = 0;
  const state = {
    status: "ready",
    time: 0,
    bill: 0,
    level: 1,
    room: 0,
    tool: null,
    appliances: [],
    repaired: 0,
    nextFault: 8,
    hold: null,
    revision: 0,
    lastEvent: null,
  };

  function addAppliance(room, index) {
    const [kind, name] = catalogs[room][index];
    state.appliances.push({
      id: `appliance-${nextId++}`,
      room,
      kind,
      name,
      slot: index,
      fault: null,
    });
  }
  for (const room of ROOMS.slice(1))
    for (let i = 0; i < 3; i++) addAppliance(room, i);

  function equip(tool) {
    if (state.room !== 0 || !["pliers", "gloves"].includes(tool)) return false;
    cancelHold();
    state.tool = tool;
    state.revision++;
    return true;
  }
  function move(room) {
    if (room < 0 || room > 3 || !Number.isInteger(room)) return false;
    cancelHold();
    state.room = room;
    return true;
  }
  function start() {
    state.status = "playing";
  }
  function pause() {
    if (state.status === "playing") {
      state.status = "paused";
      cancelHold();
    }
  }
  function resume() {
    if (state.status === "paused") state.status = "playing";
  }
  function faultAppliance() {
    const available = state.appliances.filter((a) => !a.fault);
    if (!available.length) return null;
    const item = available[Math.floor(random() * available.length)];
    const method = random() > 0.5 ? "hold" : "click";
    const holdMin = Math.min(6, 3 + (state.level - 1) * 0.5);
    item.fault = {
      method,
      deadline: state.time + GRACE,
      progress: 0,
      required:
        method === "hold"
          ? Math.min(7, holdMin + random())
          : Math.min(12, 5 + state.level),
    };
    state.lastEvent = {
      type: "fault",
      id: item.id,
      room: item.room,
      time: state.time,
    };
    state.revision++;
    return item;
  }
  function repair(item) {
    item.fault = null;
    state.hold = null;
    state.repaired++;
    state.lastEvent = {
      type: "repair",
      id: item.id,
      room: item.room,
      time: state.time,
    };
    state.revision++;
  }
  function interact(id, action) {
    const item = state.appliances.find((a) => a.id === id);
    if (state.status !== "playing" || !item || ROOMS[state.room] !== item.room)
      return "unavailable";
    if (!item.fault) return "healthy";
    const requiredTool = item.fault.method === "hold" ? "pliers" : "gloves";
    if (state.tool !== requiredTool) return requiredTool;
    if (item.fault.method === "hold" && action === "hold") {
      state.hold = id;
      return "holding";
    }
    if (item.fault.method === "click" && action === "click") {
      item.fault.progress++;
      if (item.fault.progress >= item.fault.required) {
        repair(item);
        return "repaired";
      }
      return "clicked";
    }
    return "wrong-action";
  }
  function cancelHold() {
    if (state.hold) {
      const item = state.appliances.find((a) => a.id === state.hold);
      if (item?.fault) item.fault.progress = 0;
      state.hold = null;
    }
  }
  function tick(delta) {
    if (state.status !== "playing" || delta <= 0) return;
    const previousTime = state.time;
    state.time += delta;
    for (const item of state.appliances) {
      if (item.fault && item.fault.deadline < state.time) {
        // Integrate only the time after this fault's grace period has ended.
        state.bill += state.time - Math.max(previousTime, item.fault.deadline);
      }
    }
    if (state.bill >= LIMIT) {
      state.bill = LIMIT;
      state.status = "over";
      cancelHold();
      state.revision++;
      return;
    }
    const nextLevel = 1 + Math.floor(state.time / DIFFICULTY_INTERVAL);
    if (nextLevel > state.level) {
      for (let level = state.level + 1; level <= nextLevel; level++) {
        if (level <= 4)
          for (const room of ROOMS.slice(1)) addAppliance(room, level + 1);
      }
      state.level = nextLevel;
      state.lastEvent = { type: "level", time: state.time };
      state.revision++;
    }
    if (state.hold) {
      const item = state.appliances.find((a) => a.id === state.hold);
      if (item?.fault) {
        item.fault.progress += delta;
        if (item.fault.progress >= item.fault.required) repair(item);
      }
    }
    if (state.time >= state.nextFault) {
      faultAppliance();
      state.nextFault =
        state.time + Math.max(5, 19 - state.level * 2) + random() * 5;
    }
  }
  return {
    state,
    start,
    pause,
    resume,
    equip,
    move,
    interact,
    cancelHold,
    tick,
  };
}

export function readScores(storage) {
  try {
    const parsed = JSON.parse(storage.getItem("kurent-scores") || "[]");
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (s) =>
              Number.isFinite(s.time) &&
              s.time >= 0 &&
              Number.isFinite(s.repairs),
          )
          .sort((a, b) => b.time - a.time)
          .slice(0, 10)
      : [];
  } catch {
    return [];
  }
}

export function saveScore(storage, score) {
  const scores = [...readScores(storage), score]
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);
  try {
    storage.setItem("kurent-scores", JSON.stringify(scores));
  } catch {
    /* The game also works without browser storage. */
  }
  return scores;
}
