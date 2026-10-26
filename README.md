# KuRent — install and play on Windows

A home-maintenance survival game with an amber woodland theme, a live 3D house menu, and furnished 3D rooms. Move through the house with a forward-facing camera: **outside → living room → dining room → bedroom**.

## Download and install

**[Download KuRent 0.0.2 for Windows (.exe)](https://github.com/Seperoth/KuRent-Mini-Game/releases/download/v0.0.2/KuRent-Setup-0.0.2.exe)** · [Latest release](https://github.com/Seperoth/KuRent-Mini-Game/releases/latest)

1. Download **KuRent-Setup-0.0.2.exe** using the link above (Windows, 64-bit/x64; about 113 MB).
2. Open the downloaded installer and follow the setup steps.
3. Launch **KuRent** from your desktop or Start Menu, then choose **START**.

**Everything needed to play is included:** the application runtime, game code, 3D models, artwork, fonts, and sound effects. Players do not need Node.js, npm, Python, Git, Electron, or any other library setup. The installed game works offline without a game account or web server.

Players only need the **.exe installer**. The source ZIP files on GitHub are for developers. Installation creates desktop and Start Menu shortcuts, and KuRent can be removed through Windows Settings → Apps.

For future updates, close KuRent and run the new version's installer from [Releases](https://github.com/Seperoth/KuRent-Mini-Game/releases/latest). Updates are installed manually.

The current installer is unsigned. Optional SHA-256 checksums are provided with the [0.0.2 release](https://github.com/Seperoth/KuRent-Mini-Game/releases/tag/v0.0.2).

## About version 0.0.2

Version 0.0.2 includes room-specific appliance placement, repairs on the objects' visible surfaces, a large arc-shaped tool display, and difficulty increases every 30 seconds. Hold repairs start at 2–3 seconds and increase by 0.2 seconds per level. See the [release notes](docs/RELEASE-0.0.2.md) for the full changes.

## Controls and game rules

- **W:** glide forward to the next room. **S:** glide back toward the outside. These are the only room movement controls; the right-side house map displays room status.
- Choose **pliers** or **gloves** at the table in front of the outside door. Both tools are modeled on the table. Carry one tool at a time; return outside to swap. A large arc-shaped dock shows the equipped tool.
- **Start** transitions from the live 3D house menu to a **three-second loading screen**. The survival clock starts afterward.
- **Pliers:** hold an amber appliance continuously for the displayed time, initially **2–3 seconds**, adding **0.2 seconds per level** up to the existing **7-second maximum**. For example, level 2 uses 2.2–3.2 seconds and level 3 uses 2.4–3.4 seconds. A fault keeps the duration assigned when it appeared. Releasing, changing rooms, or pausing resets an unfinished hold. Keyboard players can focus an appliance and hold Space.
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

## For developers

Source setup, build commands, packaging, tests, and application structure are in [DEVELOPMENT.md](DEVELOPMENT.md). These steps are only needed to change or build the game.
