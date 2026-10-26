# KuRent 0.0.2 — Windows installer

A home-maintenance survival game for Windows (64-bit/x64).

## Install and play

**[Download KuRent-Setup-0.0.2.exe](https://github.com/Seperoth/KuRent-Mini-Game/releases/download/v0.0.2/KuRent-Setup-0.0.2.exe)** — about 113 MB.

1. Download and open **KuRent-Setup-0.0.2.exe**. Close any running copy of KuRent first.
2. Follow the setup steps.
3. Open **KuRent** from the desktop or Start Menu and select **START**.

**The installer includes everything needed to play.** No Node.js, npm, Python, Git, Electron, extra libraries, or build commands are required. The game works offline after installation, with all models, artwork, fonts, and sound effects included. No game account is needed.

Use **W/S** to move through the house, equip pliers or gloves at the outside table, and repair appliances before excess consumption reaches **₱5,000**. The longest survival runs are saved locally.

## Downloads

| File | Purpose |
| --- | --- |
| [KuRent-Setup-0.0.2.exe](https://github.com/Seperoth/KuRent-Mini-Game/releases/download/v0.0.2/KuRent-Setup-0.0.2.exe) | **Players: download this installer.** |
| [SHA256SUMS.txt](https://github.com/Seperoth/KuRent-Mini-Game/releases/download/v0.0.2/SHA256SUMS.txt) | Optional checksums to verify downloaded files. |
| [KuRent-Source-0.0.2.zip](https://github.com/Seperoth/KuRent-Mini-Game/releases/download/v0.0.2/KuRent-Source-0.0.2.zip) | Source code for developers; unnecessary for installation or play. |

For a later version, close the game and run that version's installer. Updates are installed manually. This release is unsigned.

## Included in this release

- Furnished 3D outside, living room, dining room, and bedroom with smooth camera travel controlled by W/S.
- Live 3D house menu and a three-second loading transition.
- Large arc-shaped tool display and clickable pliers/gloves on the table before the door.
- Room-specific appliance placement, with repair clicks on visible 3D surfaces and matching hover outlines.
- Difficulty increases every 30 seconds. Faults start every 10–12 seconds, with intervals decreasing 1–2 seconds per level to a two-second minimum.
- Repair windows start at 20 seconds and fall two seconds per level to a four-second minimum.
- Overdue appliances leak ₱1/sec, plus ₱5/sec per additional level and ₱2/sec for every ten seconds that appliance remains overdue.
- Hold repairs start at 2–3 seconds and increase 0.2 seconds per level, up to seven seconds.
- Local leaderboard of the ten longest survival runs.

## Validation

41 automated checks and the packaged desktop check passed, including appliance surface selection at 1440×900 and 1024×650. The installer includes the runtime and bundled offline assets. Its download is available without a GitHub sign-in.
