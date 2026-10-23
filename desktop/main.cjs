const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const smokeTest = process.argv.includes("--smoke-test");
if (smokeTest)
  app.setPath("userData", path.join(app.getPath("temp"), "kurent-smoke-test"));
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 650,
    title: "KuRent",
    backgroundColor: "#1b1409",
    show: false,
    icon: path.join(__dirname, "../assets/icon.ico"),
    titleBarStyle: "hidden",
    titleBarOverlay: { color: "#181208", symbolColor: "#e8dcc3", height: 32 },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: !smokeTest,
      offscreen: smokeTest,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event) => event.preventDefault());
  mainWindow.once("ready-to-show", () => {
    if (!smokeTest) mainWindow.show();
  });
  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  return mainWindow;
}

ipcMain.handle("kurent:exit", (event) => {
  if (mainWindow && event.sender === mainWindow.webContents) mainWindow.close();
});
ipcMain.handle("kurent:fullscreen", (event) => {
  if (mainWindow && event.sender === mainWindow.webContents) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
    return mainWindow.isFullScreen();
  }
  return false;
});

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  const win = createWindow();
  if (!smokeTest) return;
  // Exercise the packaged file:// renderer and the isolated native bridge.
  const errors = [];
  win.webContents.on("console-message", (details) => {
    if (details.level === "error") errors.push(details.message);
  });
  await new Promise((resolve) =>
    win.webContents.once("did-finish-load", resolve),
  );
  await win.webContents.insertCSS("* { animation-duration: 0s !important; }");
  await new Promise((resolve) => setTimeout(resolve, 1600));
  const initial = await win.webContents.executeJavaScript(`({
    title: document.title,
    desktop: window.kurent?.desktop === true,
    menu: document.querySelector('#menu-screen')?.hidden === false,
    canvas: !!document.querySelector('canvas'),
    threeReady: document.body.dataset.renderer,
    hasNodeAccess: typeof window.require !== 'undefined',
    buttons: [...document.querySelectorAll('.menu-choice')].map(el => el.textContent.trim()),
  })`);
  const image = await win.webContents.capturePage();
  const artifactDir = app.isPackaged
    ? path.join(app.getPath("temp"), "kurent-packaged-check")
    : path.join(__dirname, "../artifacts");
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, "desktop-menu.png"), image.toPNG());
  await win.webContents.executeJavaScript(
    `document.querySelector('[data-action="start"]').click();document.querySelector('[data-tool="pliers"]').click();`,
  );
  const roomChecks = [];
  for (let room = 0; room < 4; room++) {
    if (room)
      await win.webContents.executeJavaScript(
        `document.querySelector('[data-room-index="${room}"]').click()`,
      );
    await new Promise((resolve) => setTimeout(resolve, 1250));
    roomChecks.push(
      await win.webContents.executeJavaScript(`({
      room: document.querySelector('#current-room').textContent,
      stationVisible: !document.querySelector('#station').hidden,
      hotspots: [...document.querySelectorAll('.room-task-group:not([hidden]) .appliance-button')].map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,visible:!el.classList.contains('out-of-view')})),
    })`),
    );
    fs.writeFileSync(
      path.join(artifactDir, "desktop-room-" + room + ".png"),
      (await win.webContents.capturePage()).toPNG(),
    );
  }
  await win.webContents.executeJavaScript(
    `document.querySelector('#pause-button').click()`,
  );
  const pausedTime = await win.webContents.executeJavaScript(
    `document.querySelector('#timer').textContent`,
  );
  await new Promise((resolve) => setTimeout(resolve, 450));
  const paused =
    pausedTime ===
    (await win.webContents.executeJavaScript(
      `document.querySelector('#timer').textContent`,
    ));
  await win.webContents.executeJavaScript(`
    document.querySelector('[data-action="close-dialog"]').click();
    // Accelerate only this hidden test, through the real game loop and progression.
    (() => {
      const nativeRAF = window.requestAnimationFrame.bind(window);
      let previous = performance.now(), clock = previous;
      window.__smokeRate = 100;
      window.requestAnimationFrame = callback => nativeRAF(now => {
        clock += (now - previous) * window.__smokeRate;
        previous = now;
        callback(clock);
      });
    })();
  `);
  let fullRoster = false;
  for (let attempt = 0; attempt < 55; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fullRoster = await win.webContents.executeJavaScript(
      `document.querySelectorAll('[data-appliance]').length === 18 && document.querySelectorAll('.faulty').length === 18`,
    );
    if (fullRoster) break;
  }
  await win.webContents.executeJavaScript(`window.__smokeRate = 1`);
  const fullRoomChecks = [];
  for (const width of [1440, 1024]) {
    win.setSize(width, width === 1440 ? 900 : 650);
    for (let room = 1; room < 4; room++) {
      await win.webContents.executeJavaScript(
        `document.querySelector('[data-room-index="${room}"]').click()`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1250));
      fullRoomChecks.push(
        await win.webContents.executeJavaScript(`({
        room: document.querySelector('#current-room').textContent,
        width: innerWidth,
        height: innerHeight,
        placementIssues: document.body.dataset.placementIssues,
        labels: [...document.querySelectorAll('.room-task-group:not([hidden]) .task-tag')].map(el => {
          const r = el.getBoundingClientRect();
          return {x:r.x, y:r.y, width:r.width, height:r.height};
        }),
        targets: [...document.querySelectorAll('.room-task-group:not([hidden]) .appliance-button')].map(el => ({
          visible: !el.classList.contains('out-of-view'),
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
        })),
      })`),
      );
      fs.writeFileSync(
        path.join(artifactDir, "desktop-full-" + width + "-" + room + ".png"),
        (await win.webContents.capturePage()).toPNG(),
      );
    }
  }
  await win.webContents.executeJavaScript(
    `document.querySelector('#pause-button').click()`,
  );
  await win.webContents.executeJavaScript(
    `document.querySelector('[data-action="quit"]').click();document.querySelector('[data-action="finish"]').click();document.querySelector('.result-links [data-action="leaderboard"]').click();`,
  );
  const saved = await win.webContents.executeJavaScript(
    `document.querySelectorAll('.score-row').length>0`,
  );
  const roomsValid = roomChecks.every(
    (r, i) =>
      r.stationVisible === (i === 0) &&
      (i === 0 ||
        (r.hotspots.length === 3 &&
          r.hotspots.every((h) => h.visible && h.x > 0 && h.y > 80) &&
          new Set(r.hotspots.map((h) => Math.round(h.x))).size === 3)),
  );
  const labelsValid = fullRoomChecks.every((room) =>
    room.labels.every(
      (a, index) =>
        a.x >= 0 &&
        a.x + a.width <= room.width &&
        a.y > 100 &&
        a.y + a.height < room.height - 80 &&
        room.labels
          .slice(index + 1)
          .every(
            (b) =>
              !(
                a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y
              ),
          ),
    ),
  );
  const report = {
    ...initial,
    roomChecks,
    paused,
    fullRoster,
    fullRoomChecks,
    labelsValid,
    saved,
    errors,
    passed:
      initial.desktop &&
      initial.menu &&
      initial.threeReady === "webgl" &&
      !initial.hasNodeAccess &&
      errors.length === 0 &&
      roomsValid &&
      paused &&
      fullRoster &&
      labelsValid &&
      fullRoomChecks.every(
        (r) =>
          r.placementIssues === "0" &&
          r.targets.length === 6 &&
          r.targets.every((t) => t.visible),
      ) &&
      saved,
  };
  fs.writeFileSync(
    path.join(artifactDir, "desktop-smoke.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  app.exit(report.passed ? 0 : 1);
});
app.on("window-all-closed", () => app.quit());
