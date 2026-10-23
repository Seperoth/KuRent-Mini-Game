export const LIMIT = 5_000;
export const GRACE = 20;
export const DIFFICULTY_INTERVAL = 30;
export const MIN_FAULT_INTERVAL = 2;
export const MIN_GRACE = 4;
export function graceForLevel(level) {
  return Math.max(MIN_GRACE, GRACE - 2 * (level - 1));
}
export function leakRate(item, time, level) {
  if (!item.fault || time + 1e-8 < item.fault.deadline) return 0;
  const steps = Math.floor((time - item.fault.deadline + 1e-8) / 10);
  return 1 + 5 * (level - 1) + steps * 2;
}
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
    nextFault: 10 + random() * 2,
    faultReduction: 0,
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
      deadline: state.time + graceForLevel(state.level),
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
  function processEvents() {
    const nextLevel = 1 + Math.floor((state.time + 1e-8) / DIFFICULTY_INTERVAL);
    if (nextLevel > state.level) {
      for (let level = state.level + 1; level <= nextLevel; level++) {
        state.faultReduction += 1 + random();
        if (level <= 4)
          for (const room of ROOMS.slice(1)) addAppliance(room, level + 1);
      }
      state.level = nextLevel;
      state.lastEvent = { type: "level", time: state.time };
      state.revision++;
    }
    if (state.time + 1e-8 >= state.nextFault) {
      faultAppliance();
      const minimum = Math.max(MIN_FAULT_INTERVAL, 10 - state.faultReduction);
      const maximum = Math.max(MIN_FAULT_INTERVAL, 12 - state.faultReduction);
      state.nextFault = state.time + minimum + random() * (maximum - minimum);
    }
  }
  function tick(delta) {
    if (state.status !== "playing" || !Number.isFinite(delta) || delta <= 0)
      return;
    const end = state.time + delta;
    processEvents();
    // Split at each rate change, deadline, level, fault and completed repair.
    // A long frame must charge the same amount as many short frames.
    while (state.time < end - 1e-9 && state.status === "playing") {
      let boundary = Math.min(
        end,
        state.level * DIFFICULTY_INTERVAL,
        state.nextFault,
      );
      let rate = 0;
      for (const item of state.appliances) {
        if (!item.fault) continue;
        if (item.fault.deadline > state.time + 1e-8)
          boundary = Math.min(boundary, item.fault.deadline);
        else {
          const steps = Math.floor(
            (state.time - item.fault.deadline + 1e-8) / 10,
          );
          boundary = Math.min(boundary, item.fault.deadline + (steps + 1) * 10);
        }
        rate += leakRate(item, state.time, state.level);
      }
      const held = state.appliances.find(
        (item) => item.id === state.hold && item.fault,
      );
      if (held)
        boundary = Math.min(
          boundary,
          state.time + held.fault.required - held.fault.progress,
        );
      if (rate > 0)
        boundary = Math.min(
          boundary,
          state.time + Math.max(0, LIMIT - state.bill) / rate,
        );
      const elapsed = Math.max(0, boundary - state.time);
      state.bill = Math.min(LIMIT, state.bill + elapsed * rate);
      if (held) held.fault.progress += elapsed;
      state.time = boundary;
      if (state.bill >= LIMIT - 1e-7) {
        state.bill = LIMIT;
        state.status = "over";
        cancelHold();
        state.revision++;
        return;
      }
      if (held && held.fault.progress >= held.fault.required - 1e-8)
        repair(held);
      processEvents();
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
