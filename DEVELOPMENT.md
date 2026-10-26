# KuRent developer guide

To install and play, use the [Windows installer](https://github.com/Seperoth/KuRent-Mini-Game/releases/latest). This guide is for changing the source code and building releases.

## Run from source

Requires Node.js 22.12+ and Windows for the Windows installer. From the repository root:

```sh
npm ci
npm run desktop
```

- `npm run desktop` builds and launches the desktop application.
- `npm start` launches the most recent build.
- `npm run dev` serves a browser development preview.
- `npm run build` creates the offline renderer in `dist/`.
- `npm run package` builds the Windows x64 NSIS installer and unpacked application.

## Package an install-and-play release

```sh
npm ci
npm test
npm run test:desktop
npm run package
```

Distribute **`release/KuRent-Setup-<version>.exe`** to players through GitHub Releases. This single installer includes the Electron/Chromium runtime, bundled renderer, local fonts, models, artwork, and sound effects. Players do not run these commands or install development dependencies. The installed game loads `dist/index.html` locally and works offline.

The installer installs for the current Windows user and creates desktop and Start Menu shortcuts. The packaging configuration is in `electron-builder.yml`. No code-signing certificate is currently configured.

`release/win-unpacked/KuRent.exe` is useful for checking the packaged game before distribution. Keep that entire folder together when running it; the executable depends on the runtime files beside it. Players should download the installer.

For a new release, update the version in `package.json` and `package-lock.json`, run validation, build the installer, and publish it with checksums on a matching version tag. Put the installer link first in the release notes and update the README's versioned download link. Keep build output out of Git; source archives are optional developer downloads. Published release tags and installers should retain their original version identity.

## Validation

- `npm test` checks gameplay rules, camera motion, appliance placement, surface picking, and furniture occlusion against the actual 3D geometry at both supported window sizes.
- `npm run test:desktop` runs a hidden native application test against the built `file://` renderer. It checks the 3D menu, three-second loading transition, native bridge isolation, keyboard-only room navigation, pause, and saved leaderboard. It also advances the real game loop to six appliances per room, then checks all targets and repair labels at 1440×900 and 1024×650. Real mouse movement and presses verify the radio, TV, and kettle surfaces, their hover outlines, and missed clicks in empty space. Reports and screenshots are written to `artifacts/`.
- Running the unpacked application's executable with `--smoke-test` performs the same checks against the packaged renderer and writes the report to `%TEMP%/kurent-packaged-check/`.

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
