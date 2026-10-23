# KuRent 0.0.1 — Windows desktop application

A home-maintenance survival game with an amber woodland theme, an illustrated menu, and furnished 3D rooms. Move through the house with a forward-facing camera: **outside → living room → dining room → bedroom**.

## Play the application

Build the installer with `npm run package`. The output is **`release/KuRent-Setup-0.0.1.exe`**. It installs KuRent for the current Windows user and creates Start Menu and desktop shortcuts. `release/win-unpacked/KuRent.exe` runs the application directly from its unpacked folder; keep that folder's files together.

The installed application works offline. All artwork, 3D models, fonts, game code, and sound effects are included. No web server, browser, account, or Node.js installation is needed to play.

The installer is a local unsigned build; no code-signing certificate is configured.

## Controls and game rules

- **W / Up:** glide forward to the next room. **S / Down:** glide back toward the outside. The house map also switches rooms.
- Choose **pliers** or **gloves** at the outside tool station. Carry one tool at a time; return outside to swap.
- **Pliers:** hold an amber appliance continuously for the displayed time, initially 3–4 seconds and increasing toward 7 seconds. Releasing, changing rooms, or pausing resets an unfinished hold. Keyboard players can focus an appliance and hold Space.
- **Gloves:** click an amber appliance repeatedly for its displayed number of taps.
- Each indoor room starts with **3 random appliances**. New faults have a **60-second grace period**. Afterward, each unresolved fault adds **₱1 per second**. Repairing stops future consumption.
- Survive without excess consumption reaching **₱20,000**.
- Every **2 minutes**, faults arrive faster, repairs take more work, and each indoor room gains an appliance until it has six. Difficulty continues increasing afterward.
- **Escape:** pause or resume. **F11:** toggle full screen in the desktop application. Hiding the application pauses the run.
- The pause menu can finish a run early and save it. The **10 longest runs** are saved locally in the desktop application's profile. Browser development previews keep a separate leaderboard.
- **Exit** on the main menu closes the desktop application.

## Development

Requires Node.js 22.12+ and Windows for the Windows installer.

```sh
npm install
npm run desktop
```

- `npm run desktop` builds and launches the desktop application.
- `npm start` launches the most recent build.
- `npm run dev` serves a browser development preview.
- `npm run build` creates the offline renderer in `dist/`.
- `npm run package` builds the Windows x64 NSIS installer and unpacked application.
- `npm test` checks gameplay rules and camera motion.
- `npm run test:desktop` runs a hidden native application test against the built `file://` renderer. It checks the menu, native bridge isolation, room navigation, projected appliance targets, pause, and saved leaderboard. Reports and screenshots are written to `artifacts/`.

For additional browser interaction checks, run the development server, open `/tests/browser.html`, and click **Run browser checks**. These use deterministic faults, isolated in-memory storage, and an accelerated clock. Test pages are excluded from the production build.

## Visual direction

The supplied menu reference establishes the centered white **KURENT** title, stacked **START / LEADERBOARD / EXIT** options, illustrated woodland home, deep brown overlay, and translucent amber ribbons. This palette and typography continue through the HUD, tool station, repair indicators, leaderboard, pause screen, and results.

[The user-supplied Airplane Chefs video](https://www.youtube.com/watch?v=uC3Mmml-Cjc) informs the forward-facing perspective and smooth camera travel between viewpoints. House artwork, models, rooms, and repair gameplay are original code-native assets.

## Application structure

- `desktop/`: Electron main process and narrowly scoped, isolated preload bridge.
- `src/engine.js`: survival and repair rules, independent of rendering.
- `src/camera.js`: smooth camera travel, interrupted transitions, and reduced motion.
- `src/world.js` and `src/models.js`: Three.js house, furniture, lighting, and appliances.
- `src/menu-house.svg`: original flat house illustration.
- `src/main.js` and `src/style.css`: menu, controls, HUD, and game screens.

Renderer code has no Node.js access. The application uses context isolation, sandboxing, a content security policy, and blocked external navigation. Native bridge methods only close the application and toggle its full-screen view.
