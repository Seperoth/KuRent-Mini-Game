# KuRent 0.0.2 — Windows desktop application

A home-maintenance survival game with an amber woodland theme, a live 3D house menu, and furnished 3D rooms. Move through the house with a forward-facing camera: **outside → living room → dining room → bedroom**.

## Play the application

Build the installer with `npm run package`. The output is **`release/KuRent-Setup-0.0.2.exe`**. It installs KuRent for the current Windows user and creates Start Menu and desktop shortcuts. `release/win-unpacked/KuRent.exe` runs the application directly from its unpacked folder; keep that folder's files together.

Version 0.0.2 fixes overlapping room furniture and appliances. Each appliance type has a reserved floor, counter, desk, or wall location appropriate to its size. All six locations in every room are checked together for intersections, support fit, and visibility from the room camera. Random starting rosters and later additions use these same locations. Repair labels include the appliance name and move apart when crowded, with a connector pointing to the appliance. The original 0.0.1 source checkpoint and installer remain available.

The installed application works offline. All artwork, 3D models, fonts, game code, and sound effects are included. No web server, browser, account, or Node.js installation is needed to play.

The installer is a local unsigned build; no code-signing certificate is configured.

## Controls and game rules

- **W:** glide forward to the next room. **S:** glide back toward the outside. These are the only room movement controls; the right-side house map displays room status.
- Choose **pliers** or **gloves** at the table in front of the outside door. Both tools are modeled on the table. Carry one tool at a time; return outside to swap. A large arc-shaped dock shows the equipped tool.
- **Start** transitions from the live 3D house menu to a **three-second loading screen**. The survival clock starts afterward.
- **Pliers:** hold an amber appliance continuously for the displayed time, initially 3–4 seconds and increasing toward 7 seconds. Releasing, changing rooms, or pausing resets an unfinished hold. Keyboard players can focus an appliance and hold Space.
- **Gloves:** click an amber appliance repeatedly for its displayed number of taps.
- Repair clicks and holds use the appliance's actual visible 3D surfaces. Hovering outlines its shape in gold; the old floating rectangular targets are removed. Radio controls, TV screens/stands, kettle bodies and other visible appliance parts can be selected. Empty space and furniture in front of an appliance do not count. Labels remain informational, and targets are disabled while the camera moves. Keyboard players can still focus an appliance with Tab.
- Each indoor room starts with **3 random appliances**. Level 1 faults arrive every **10–12 seconds**. Each new level reduces the interval range by a random **1–2 seconds**, down to **2 seconds**.
- New faults have **20 seconds** to repair at level 1, reduced by **2 seconds per level**, down to **4 seconds**. Existing faults keep the deadline assigned when they appeared.
- Each overdue appliance starts at **₱1/sec**, plus **₱5/sec for every level after level 1**. Every **10 seconds that appliance remains overdue** adds another **₱2/sec** to its leak. The current level applies to all leaking appliances; overdue age is tracked separately for each appliance. Repairing stops its leak and resets that age.
- Survive without excess consumption reaching **₱5,000**.
- Every **30 seconds**, faults arrive faster, repairs take more work, and each indoor room gains an appliance until it has six (at 1:30). Difficulty continues increasing afterward.
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
- `npm test` checks gameplay rules, camera motion, appliance placement, surface picking and furniture occlusion against the actual 3D geometry at both supported window sizes.
- `npm run test:desktop` runs a hidden native application test against the built `file://` renderer. It checks the 3D menu, three-second loading transition, native bridge isolation, keyboard-only room navigation, pause, and saved leaderboard. It also advances the real game loop to six appliances per room, then checks all targets and repair labels at 1440×900 and 1024×650. Real mouse movement and presses verify the radio, TV and kettle surfaces, their hover outlines, and missed clicks in empty space. Reports and screenshots are written to `artifacts/`. Running the unpacked application's executable with `--smoke-test` performs the same checks against the packaged renderer and writes the report to `%TEMP%/kurent-packaged-check/`.

For additional browser interaction checks, run the development server, open `/tests/browser.html`, and click **Run browser checks**. These use deterministic faults, isolated in-memory storage, and an accelerated clock. Test pages are excluded from the production build.

## Visual direction

The supplied menu reference establishes the centered white **KURENT** title, stacked **START / LEADERBOARD / EXIT** options, deep brown overlay, and translucent amber ribbons. The menu now looks toward the same 3D house used in gameplay. This palette and typography continue through the HUD, loading screen, tool station, repair indicators, leaderboard, pause screen, and results.

[The user-supplied Airplane Chefs video](https://www.youtube.com/watch?v=uC3Mmml-Cjc) informs the forward-facing perspective and smooth camera travel between viewpoints. House artwork, models, rooms, and repair gameplay are original code-native assets.

## Application structure

- `desktop/`: Electron main process and narrowly scoped, isolated preload bridge.
- `src/engine.js`: survival and repair rules, independent of rendering.
- `src/camera.js`: smooth camera travel, interrupted transitions, and reduced motion.
- `src/world.js` and `src/models.js`: Three.js house, lighting, and appliances.
- `src/room-layout.js`, `src/furniture.js`, and `src/placement.js`: room-specific furniture and appliance locations, support heights, and overlap/visibility checks.
- `src/tool-station.js`: outside table and 3D pliers/gloves models.
- `src/picking.js`: nearest visible appliance surface selection, furniture occlusion, and label projection.
- `src/main.js` and `src/style.css`: menu, controls, HUD, and game screens.

Renderer code has no Node.js access. The application uses context isolation, sandboxing, a content security policy, and blocked external navigation. Native bridge methods only close the application and toggle its full-screen view.
