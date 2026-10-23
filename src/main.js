import "@fontsource/montserrat/latin-900.css";
import "@fontsource/anton/latin-400.css";
import "@fontsource/barlow-condensed/latin-400.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "./style.css";
import { version as APP_VERSION } from "../package.json";
import {
  createGame,
  formatTime,
  ROOMS,
  ROOM_NAMES,
  LIMIT,
  readScores,
  saveScore,
} from "./engine.js";
import { icon } from "./art.js";
import { HouseWorld } from "./world.js";
import menuHouse from "./menu-house.svg";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem: () => {} };
  }
})();
let game = createGame(),
  scores = readScores(storage),
  savedRun = false,
  activeDialog = null;
let lastRevision = -1,
  lastEvent = null,
  lastFrame = 0,
  lastHUDFrame = 0,
  toastTimer;
let soundEnabled = storage.getItem("kurent-sound") === "true",
  audioContext,
  previousFocus,
  suppressClickId = null;
const roomIcons = ["home", "sofa", "dining", "bed"];
const descriptions = [
  "YOUR TOOLS. YOUR FIRST LINE OF DEFENSE.",
  "A LITTLE COMFORT. A LOT OF CURRENT.",
  "KEEP THE HEART OF THE HOUSE RUNNING.",
  "REST EASY. KEEP THE BILL IN CHECK.",
];

$("#app").innerHTML = `
  <div id="scene-root"><canvas id="house-canvas" aria-label="A warm, furnished 3D house viewed from a forward-facing camera"></canvas><div class="scene-vignette"></div></div>
  <div class="window-bar" id="window-bar"><span>${icon("bolt", 13)} KURENT</span></div>
  <main id="menu-screen" class="menu-screen">
    <img class="menu-illustration" src="${menuHouse}" alt="An illustrated woodland house with a porch, mailbox, and garden at dusk" />
    <div class="menu-shade"></div><svg class="amber-ribbons" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><path d="M-200 1020C70 570 480 590 220 210S390 50 880-240"/><path d="M-70 980C190 550 400 640 310 350S450 70 800-160"/><path d="M1560-200C1170 140 1410 370 1720 510"/></svg>
    <div class="menu-content"><h1>KURENT</h1><nav class="menu-options" aria-label="Main menu"><button class="menu-choice" data-action="start">START</button><button class="menu-choice" data-action="leaderboard">LEADERBOARD</button><button class="menu-choice" data-action="exit">EXIT</button></nav></div>
    <div class="menu-footer"><div><button data-action="sound" class="sound-toggle" aria-label="Turn sound on">${icon("mute", 19)}</button><span class="footer-line"></span><button data-action="help">HOW TO PLAY</button></div><span class="menu-tagline">KEEP THE LIGHTS ON. KEEP THE CURRENT DOWN.</span><button class="menu-best" data-action="leaderboard">${icon("trophy", 16)} PERSONAL BEST <b id="personal-best">00:00</b></button></div>
    <span class="build-label">KURENT · ${APP_VERSION}</span>
  </main>
  <main id="game-screen" class="game-screen" hidden>
    <header class="game-top"><button class="game-wordmark" data-action="pause">K<span>U</span>RENT<small>ENDLESS SURVIVAL</small></button><section class="survival-hud"><span class="hud-label">${icon("clock", 15)} SURVIVAL TIME</span><strong id="timer">00:00</strong><span class="level-label" id="level-label">LEVEL 01</span></section><section class="consumption-hud"><div><span class="hud-label">EXCESS CONSUMPTION</span><span class="limit-label">LIMIT ₱20,000</span></div><strong id="bill">₱0</strong><span id="leak-rate">ALL SYSTEMS CALM</span><div class="bill-track"><span id="bill-progress"></span></div></section><div class="game-actions"><button data-action="help" aria-label="How to play" title="How to play">${icon("help", 21)}</button><button id="pause-button" data-action="pause" aria-label="Pause game" title="Pause (Esc)">${icon("pause", 22)}</button></div></header>
    <div class="room-heading"><span id="room-number">01 / 04</span><h2 id="current-room">Outside</h2><p id="room-description">${descriptions[0]}</p></div>
    <div id="appliance-layers">${ROOMS.slice(1)
      .map(
        (room) =>
          `<section class="room-task-group" data-room="${room}" id="appliances-${room}" aria-label="${room} appliances" hidden></section>`,
      )
      .join("")}</div>
    <nav class="house-map" aria-label="Change room"><span class="map-label">YOUR HOUSE</span>${ROOM_NAMES.map((name, i) => `<button data-room-index="${i}" aria-label="Go to ${name}"><span class="map-icon">${icon(roomIcons[i], 19)}</span><span>${name}</span><b id="room-count-${i}"></b></button>`).join("")}<small id="appliance-count">9 appliances</small></nav>
    <section class="tool-station" id="station" aria-label="Outside tool station"><div class="station-copy"><span class="eyebrow">BEFORE YOU HEAD INSIDE</span><h3>CHOOSE YOUR TOOL</h3><p>You can carry one. Swap here anytime.</p></div><button class="tool-pick" data-tool="pliers">${icon("pliers", 29)}<span><b>PLIERS</b><small>HOLD TO REPAIR</small></span><i>${icon("check", 15)}</i></button><button class="tool-pick" data-tool="gloves">${icon("gloves", 29)}<span><b>GLOVES</b><small>TAP TO REPAIR</small></span><i>${icon("check", 15)}</i></button></section>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <footer class="play-dock"><button class="equipped-tool" data-action="go-outside" id="equipped-tool">${icon("bag", 24)}<span><small>YOUR TOOL</small><b>NOT EQUIPPED</b></span><span class="swap-hint">SWAP OUTSIDE ${icon("arrow", 12)}</span></button><div class="movement-controls"><button data-action="down" aria-label="Previous room (S)"><kbd>S</kbd><span>PREVIOUS ROOM</span></button><span class="movement-line"></span><button data-action="up" aria-label="Next room (W)"><span>NEXT ROOM</span><kbd>W</kbd></button></div><div class="run-info"><span id="difficulty-label">NEXT LEVEL IN 02:00</span><span><b id="repair-count">0</b> REPAIRED <i></i><b id="attention-count">0</b> NEED ATTENTION</span></div></footer>
  </main>
  <div class="dialog-backdrop" id="dialog-backdrop" hidden><section class="dialog" id="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"></section></div>
`;

if (window.kurent?.desktop) document.body.classList.add("desktop");
const world = new HouseWorld($("#house-canvas"), (points, moving) => {
  $("#appliance-layers").classList.toggle("camera-moving", moving);
  for (const point of points) {
    const el = $(`[data-appliance="${point.id}"]`);
    if (!el) continue;
    el.style.left = `${point.x}px`;
    el.style.top = `${point.y}px`;
    el.style.setProperty("--distance-scale", point.scale);
    el.classList.toggle("out-of-view", !point.visible);
  }
});

function tone(type) {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    const notes =
      type === "repair"
        ? [523, 659, 784]
        : type === "fault"
          ? [330, 277]
          : [554];
    notes.forEach((frequency, i) => {
      const o = audioContext.createOscillator(),
        g = audioContext.createGain(),
        t = audioContext.currentTime + i * 0.105;
      o.type = "sine";
      o.frequency.value = frequency;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.04, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g);
      g.connect(audioContext.destination);
      o.start(t);
      o.stop(t + 0.22);
    });
  } catch {
    /* Audio is optional. */
  }
}
function toast(message, mood = "") {
  clearTimeout(toastTimer);
  $("#toast").innerHTML =
    `${icon(mood === "success" ? "check" : "info", 17)}<span>${message}</span>`;
  $("#toast").className = `toast visible ${mood}`;
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3300);
}
function renderAppliances() {
  const state = game.state;
  world.sync(state.appliances);
  for (const room of ROOMS.slice(1)) {
    $(`#appliances-${room}`).innerHTML = state.appliances
      .filter((a) => a.room === room)
      .map(
        (item) =>
          `<button class="appliance-button ${item.fault ? "faulty" : ""}" data-appliance="${item.id}" aria-label="${item.name}${item.fault ? `, needs ${item.fault.method === "hold" ? "pliers, hold" : "gloves, click"} to repair` : ", working normally"}"><span class="target-corners"></span><span class="appliance-name">${item.name}</span>${item.fault ? `<span class="task-tag">${icon(item.fault.method === "hold" ? "pliers" : "gloves", 18)}<span class="task-action">${item.fault.method === "hold" ? `HOLD ${item.fault.required.toFixed(1)}s` : `TAP ${item.fault.required}×`}</span><span class="task-countdown"></span></span><span class="repair-track"><span></span></span>` : ""}</button>`,
      )
      .join("");
  }
  $$(".tool-pick").forEach((el) => {
    const selected = el.dataset.tool === state.tool;
    el.classList.toggle("selected", selected);
    el.setAttribute("aria-pressed", String(selected));
  });
  $("#equipped-tool").innerHTML =
    `${icon(state.tool || "bag", 25)}<span><small>YOUR TOOL</small><b>${state.tool ? state.tool.toUpperCase() : "NOT EQUIPPED"}</b></span><span class="swap-hint">SWAP OUTSIDE ${icon("arrow", 12)}</span>`;
}
function renderRoom(instant = false) {
  const state = game.state,
    ready = state.status === "ready";
  $("#menu-screen").hidden = !ready;
  $("#game-screen").hidden = ready;
  document.body.dataset.mode = ready ? "menu" : "game";
  $("#current-room").textContent = ROOM_NAMES[state.room];
  $("#room-number").textContent =
    `${String(state.room + 1).padStart(2, "0")} / 04`;
  $("#room-description").textContent = descriptions[state.room];
  $("#station").hidden = state.room !== 0;
  $$(".room-task-group").forEach((el) => {
    el.hidden = el.dataset.room !== ROOMS[state.room];
  });
  $$("[data-room-index]").forEach((el) => {
    const selected = Number(el.dataset.roomIndex) === state.room;
    el.classList.toggle("selected", selected);
    el.setAttribute("aria-current", selected ? "location" : "false");
  });
  $$('[data-action="up"]').forEach((el) => (el.disabled = state.room === 3));
  $$('[data-action="down"]').forEach((el) => (el.disabled = state.room === 0));
  if (ready) world.menu(instant);
  else world.travel(state.room, instant);
}
function renderHUD() {
  const state = game.state;
  if (state.revision !== lastRevision) {
    lastRevision = state.revision;
    renderAppliances();
  }
  $("#timer").textContent = formatTime(state.time);
  $("#bill").textContent = `₱${Math.floor(state.bill).toLocaleString("en-US")}`;
  $("#bill-progress").style.width = `${(state.bill / LIMIT) * 100}%`;
  $(".consumption-hud").classList.toggle("danger", state.bill >= LIMIT * 0.75);
  $("#level-label").textContent =
    `LEVEL ${String(state.level).padStart(2, "0")}`;
  $("#difficulty-label").textContent =
    `NEXT LEVEL IN ${formatTime(120 - (state.time % 120))}`;
  $("#repair-count").textContent = state.repaired;
  const faults = state.appliances.filter((a) => a.fault),
    leaking = faults.filter((a) => a.fault.deadline <= state.time).length;
  $("#leak-rate").textContent = leaking
    ? `+₱${leaking}/s LEAKING`
    : faults.length
      ? `${faults.length} REPAIR${faults.length === 1 ? "" : "S"} WAITING`
      : "ALL SYSTEMS CALM";
  $("#leak-rate").classList.toggle("leaking", !!leaking);
  $("#attention-count").textContent = faults.length;
  $("#appliance-count").textContent = `${state.appliances.length} appliances`;
  ROOM_NAMES.forEach((_, i) => {
    const count = faults.filter((a) => a.room === ROOMS[i]).length;
    $(`#room-count-${i}`).textContent = count || "";
  });
  for (const item of faults) {
    const el = $(`[data-appliance="${item.id}"]`);
    if (!el) continue;
    const remaining = Math.ceil(item.fault.deadline - state.time);
    el.classList.toggle("overdue", remaining <= 0);
    el.classList.toggle("holding", state.hold === item.id);
    el.querySelector(".task-countdown").textContent =
      remaining > 0 ? `${remaining}s` : "+₱1/s";
    el.querySelector(".repair-track > span").style.width =
      `${Math.min(100, (item.fault.progress / item.fault.required) * 100)}%`;
    el.querySelector(".task-action").textContent =
      item.fault.method === "click"
        ? `TAP ${Math.max(0, item.fault.required - item.fault.progress)}×`
        : state.hold === item.id
          ? `${Math.max(0, item.fault.required - item.fault.progress).toFixed(1)}s LEFT`
          : `HOLD ${item.fault.required.toFixed(1)}s`;
  }
  if (state.lastEvent && state.lastEvent !== lastEvent) {
    lastEvent = state.lastEvent;
    if (lastEvent.type === "fault") {
      const item = state.appliances.find((a) => a.id === lastEvent.id);
      toast(
        `${item.name} needs care in the ${ROOM_NAMES[ROOMS.indexOf(item.room)].toLowerCase()}.`,
      );
      tone("fault");
    } else if (lastEvent.type === "repair") {
      toast("REPAIR COMPLETE. A little less current.", "success");
      tone("repair");
    } else if (lastEvent.type === "level") {
      toast(
        `LEVEL ${state.level}. ${state.level <= 4 ? "New appliances in every room." : "Faults are arriving faster."}`,
      );
      tone("fault");
    }
  }
  if (state.status === "over" && !savedRun) endRun();
}
function newRun() {
  closeDialog(false);
  game = createGame();
  savedRun = false;
  lastEvent = null;
  lastRevision = -1;
  suppressClickId = null;
  world.reset();
  game.start();
  renderRoom();
  renderHUD();
  toast("Pick a tool at the outside station. Press W to head inside.");
  tone("start");
}
function resetToMenu() {
  closeDialog(false);
  game = createGame();
  savedRun = false;
  lastEvent = null;
  lastRevision = -1;
  suppressClickId = null;
  world.reset();
  renderRoom();
  renderHUD();
}
function navigate(room) {
  if (game.state.status !== "playing") return;
  if (game.move(room)) {
    renderRoom();
    renderHUD();
  }
}
function showDialog(type) {
  previousFocus = document.activeElement;
  if (game.state.status === "playing") game.pause();
  activeDialog = type;
  const close = `<button class="dialog-close" data-action="close-dialog" aria-label="Close">${icon("close", 23)}</button>`;
  let content = "";
  if (type === "help") {
    content = `${close}<span class="eyebrow">KEEP THE CURRENT DOWN</span><h2 id="dialog-title">HOW TO PLAY</h2><p class="dialog-description">One house. Two tools. A bill that won’t wait.</p><div class="guide-steps"><section><b>01</b><div><h3>MOVE THROUGH YOUR HOUSE</h3><p><kbd>W</kbd> moves forward to the next room. <kbd>S</kbd> moves back. Travel outside → living room → dining room → bedroom, or click the house map.</p></div></section><section><b>02</b><div><h3>THE RIGHT TOOL FOR THE JOB</h3><p>Choose <strong>pliers</strong> or <strong>gloves</strong> at the outside station. Carry one tool at a time. Pliers need a continuous <strong>3–7 second hold</strong>; gloves need <strong>repeated clicks</strong>. Release a hold early and it resets.</p></div></section><section><b>03</b><div><h3>DON’T LET THE BILL BUILD</h3><p>Amber appliances have a <strong>60-second grace period</strong>. After that, each one adds <strong>₱1 every second</strong> until repaired. Keep excess consumption below <strong>₱20,000</strong>.</p></div></section><section><b>04</b><div><h3>KEEP GOING</h3><p>Difficulty rises every <strong>2 minutes</strong>: more appliances (up to six per room), faster faults, and harder repairs. <kbd>Esc</kbd> pauses. Survive as long as possible.</p></div></section></div><button class="amber-button wide" data-action="close-dialog">GOT IT ${icon("arrow", 18)}</button>`;
  } else if (type === "leaderboard") {
    scores = readScores(storage);
    content = `${close}<span class="eyebrow">THE LONGEST LIGHTS ON</span><h2 id="dialog-title">LEADERBOARD</h2><p class="dialog-description">Your best survival runs. Saved on this device.</p><div class="leaderboard-table"><div class="score-header"><span>RANK / KEEPER</span><span>REPAIRS</span><span>SURVIVED</span></div>${scores.length ? scores.map((s, i) => `<div class="score-row ${i === 0 ? "first" : ""}"><span><b>${String(i + 1).padStart(2, "0")}</b><span>${i === 0 ? icon("trophy", 16) : ""} YOU <small>${new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></span></span><span>${s.repairs}</span><strong>${formatTime(s.time)}</strong></div>`).join("") : `<div class="empty-scores">${icon("trophy", 42)}<h3>YOUR FIRST RUN AWAITS.</h3><p>Finish a run to put your time on the board.</p></div>`}</div><button class="amber-button wide" data-action="${game.state.status === "ready" || game.state.status === "over" ? "start" : "close-dialog"}">${game.state.status === "ready" || game.state.status === "over" ? "START A NEW RUN" : "BACK TO THE HOUSE"} ${icon("arrow", 18)}</button>`;
  } else if (type === "pause") {
    content = `${close}<span class="eyebrow">TAKE A BREATHER</span><h2 id="dialog-title">PAUSED</h2><p class="dialog-description">The timer and appliances are paused.</p><div class="result-time">${formatTime(game.state.time)}<span>YOUR SURVIVAL TIME</span></div><button class="amber-button wide" data-action="close-dialog">RESUME ${icon("play", 18)}</button><div class="pause-options"><button data-action="help">HOW TO PLAY</button><button data-action="quit">FINISH & SAVE RUN</button></div>`;
  } else if (type === "quit") {
    content = `${close}<span class="eyebrow">CALLING IT A DAY?</span><h2 id="dialog-title">FINISH THIS RUN</h2><p class="dialog-description">Save your survival time and return to the menu.</p><div class="result-time">${formatTime(game.state.time)}<span>${game.state.repaired} APPLIANCES REPAIRED</span></div><button class="amber-button wide" data-action="finish">FINISH & SAVE ${icon("check", 18)}</button><button class="text-button dialog-secondary" data-action="close-dialog">KEEP THE LIGHTS ON</button>`;
  } else if (type === "over") {
    const state = game.state,
      limit = state.bill >= LIMIT,
      best = scores[0]?.time <= state.time;
    content = `<span class="eyebrow">${limit ? "THE BILL HAS LANDED" : "A GOOD DAY’S HOUSEKEEPING"}</span><h2 id="dialog-title">${limit ? "OVER THE LIMIT" : "You kept things running."}</h2><p class="dialog-description">${limit ? "The bill reached ₱20,000. The lights go out, but you can always start again." : "Your survival time is saved. The house will be here when you’re ready."}</p><div class="result-time">${formatTime(state.time)}<span>${best ? "✦ NEW PERSONAL BEST" : "YOUR SURVIVAL TIME"}</span></div><div class="result-stats"><div><b>${state.repaired}</b><span>REPAIRS MADE</span></div><div><b>${state.level}</b><span>LEVEL REACHED</span></div><div><b>₱${Math.floor(state.bill).toLocaleString("en-US")}</b><span>EXCESS CONSUMPTION</span></div></div><button class="amber-button wide" data-action="start">TRY AGAIN ${icon("refresh", 18)}</button><div class="result-links"><button data-action="leaderboard">${icon("trophy", 16)} LEADERBOARD</button><button data-action="menu">MAIN MENU ${icon("arrow", 16)}</button></div>`;
  } else if (type === "exit") {
    content = `<span class="eyebrow">UNTIL NEXT TIME</span><h2 id="dialog-title">THANKS FOR PLAYING</h2><p class="dialog-description">A little care goes a long way.</p><button class="amber-button wide" data-action="close-dialog">BACK TO MENU ${icon("arrow", 18)}</button>`;
  }
  $("#dialog").innerHTML = content;
  $("#dialog").className = `dialog dialog-${type}`;
  $("#dialog-backdrop").hidden = false;
  $("#menu-screen").inert = true;
  $("#game-screen").inert = true;
  $("#dialog").focus();
  renderHUD();
}
function closeDialog(resume = true) {
  $("#dialog-backdrop").hidden = true;
  $("#menu-screen").inert = false;
  $("#game-screen").inert = false;
  activeDialog = null;
  if (resume) game.resume();
  if (previousFocus?.isConnected) previousFocus.focus();
  renderHUD();
}
function endRun() {
  if (savedRun) return;
  savedRun = true;
  game.state.status = "over";
  game.cancelHold();
  scores = saveScore(storage, {
    time: game.state.time,
    repairs: game.state.repaired,
    level: game.state.level,
    date: new Date().toISOString(),
  });
  $("#personal-best").textContent = formatTime(scores[0]?.time || 0);
  showDialog("over");
}
function feedback(result) {
  if (result === "pliers" || result === "gloves")
    toast(`This repair needs ${result}. Swap tools outside.`);
  else if (result === "healthy")
    toast("This appliance is running smoothly.", "success");
  else if (result === "clicked") tone("click");
}
function renderSound() {
  $$(".sound-toggle").forEach((el) => {
    el.innerHTML = icon(soundEnabled ? "volume" : "mute", 19);
    el.setAttribute("aria-label", `Turn sound ${soundEnabled ? "off" : "on"}`);
    el.setAttribute("aria-pressed", String(soundEnabled));
  });
}
document.addEventListener("click", (e) => {
  const tool = e.target.closest("[data-tool]");
  if (tool && game.state.status === "playing") {
    if (game.equip(tool.dataset.tool)) {
      renderHUD();
      toast(
        `${tool.dataset.tool.toUpperCase()} EQUIPPED. ${tool.dataset.tool === "pliers" ? "Hold steadily to repair." : "Tap to repair."}`,
        "success",
      );
      tone("click");
    }
    return;
  }
  const room = e.target.closest("[data-room-index]");
  if (room) {
    navigate(Number(room.dataset.roomIndex));
    return;
  }
  const appliance = e.target.closest("[data-appliance]");
  if (appliance) {
    if (suppressClickId === appliance.dataset.appliance) {
      suppressClickId = null;
      return;
    }
    feedback(game.interact(appliance.dataset.appliance, "click"));
    renderHUD();
    return;
  }
  const button = e.target.closest("[data-action]");
  if (!button) return;
  e.preventDefault();
  const action = button.dataset.action;
  if (action === "start") newRun();
  else if (action === "menu") resetToMenu();
  else if (["help", "leaderboard", "quit"].includes(action)) showDialog(action);
  else if (action === "pause") {
    if (game.state.status === "playing") showDialog("pause");
  } else if (action === "close-dialog") closeDialog();
  else if (action === "finish") endRun();
  else if (action === "up") navigate(game.state.room + 1);
  else if (action === "down") navigate(game.state.room - 1);
  else if (action === "go-outside") navigate(0);
  else if (action === "exit") {
    if (window.kurent?.desktop) window.kurent.exit();
    else showDialog("exit");
  } else if (action === "sound") {
    soundEnabled = !soundEnabled;
    try {
      storage.setItem("kurent-sound", String(soundEnabled));
    } catch {}
    renderSound();
    tone("click");
  }
});
document.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const button = e.target.closest("[data-appliance]");
  if (!button) return;
  const item = game.state.appliances.find(
    (a) => a.id === button.dataset.appliance,
  );
  if (item?.fault?.method === "hold") {
    suppressClickId = item.id;
    feedback(game.interact(item.id, "hold"));
    renderHUD();
  }
});
document.addEventListener("pointerup", () => game.cancelHold());
document.addEventListener("pointercancel", () => game.cancelHold());
document.addEventListener("contextmenu", (e) => {
  if (e.target.closest("[data-appliance]")) e.preventDefault();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "F11" && window.kurent?.desktop) {
    e.preventDefault();
    window.kurent.toggleFullscreen();
    return;
  }
  if (e.key === "Escape") {
    if (activeDialog && activeDialog !== "over") closeDialog();
    else if (game.state.status === "playing") showDialog("pause");
    return;
  }
  if (activeDialog) {
    if (e.key === "Tab") {
      const elements = [
          ...$("#dialog").querySelectorAll('button,a,[tabindex="0"]'),
        ],
        first = elements[0],
        last = elements.at(-1);
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === $("#dialog"))
      ) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    return;
  }
  if (e.key.toLowerCase() === "w" || e.key === "ArrowUp") {
    e.preventDefault();
    navigate(game.state.room + 1);
  }
  if (e.key.toLowerCase() === "s" || e.key === "ArrowDown") {
    e.preventDefault();
    navigate(game.state.room - 1);
  }
  if (e.code === "Space" && e.target.closest("[data-appliance]")) {
    const id = e.target.closest("[data-appliance]").dataset.appliance,
      item = game.state.appliances.find((a) => a.id === id);
    if (item?.fault?.method === "hold") {
      e.preventDefault();
      if (!e.repeat) feedback(game.interact(id, "hold"));
    }
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") game.cancelHold();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && game.state.status === "playing") showDialog("pause");
});
window.addEventListener("blur", () => game.cancelHold());
$("#dialog-backdrop").addEventListener("click", (e) => {
  if (e.target === $("#dialog-backdrop") && activeDialog !== "over")
    closeDialog();
});

function frame(now) {
  if (lastFrame) {
    game.tick(Math.min((now - lastFrame) / 1000, 0.25));
    if (now - lastHUDFrame >= 100 || lastRevision !== game.state.revision) {
      renderHUD();
      lastHUDFrame = now;
    }
  }
  world.render(now, game.state);
  lastFrame = now;
  requestAnimationFrame(frame);
}
$("#personal-best").textContent = formatTime(scores[0]?.time || 0);
renderSound();
renderRoom(true);
renderHUD();
requestAnimationFrame(frame);
