# Integrations

## Steam

Full OAuth integration. Connect via Profile → Steam → Connect Steam.

- Syncs your entire library automatically
- Tracks playtime, achievements, and last played
- Cover art from Steam CDN
- Price-per-hour calculation using price paid

---

## RetroAchievements

Connect via Profile → RetroAchievements → enter username and API key.

- Syncs achievements for retro games
- Tracks completion percentage per game
- API key available at https://retroachievements.org/controlpanel.php

---

## RetroArch

Enable via Profile → RetroArch toggle → Sync All Emulators.

### How it works

GameVault reads two types of files:

| File | Location | Contains |
|---|---|---|
| Playlist | `~/.config/retroarch/playlists/*.lpl` | Game list, ROM paths, labels |
| Runtime log | `~/.config/retroarch/playlists/logs/{core}/{game}.lrtl` | Playtime, last played, play count |

### Supported cores (pre-mapped)

| Core | System |
|---|---|
| mGBA, Gambatte, SameBoy | Game Boy / GBA |
| Snes9x, bsnes | SNES |
| Mesen, FCEUmm | NES |
| Mupen64Plus-Next, ParaLLEl N64 | Nintendo 64 |
| melonDS | Nintendo DS |
| Genesis Plus GX, PicoDrive | Sega Genesis |
| Beetle Saturn, Yabause | Sega Saturn |
| Flycast | Dreamcast |
| DuckStation, Beetle PSX, PCSX-ReARMed | PlayStation |
| FinalBurn Neo, MAME | Arcade |

To add a new core, add one line to `CORE_TO_PLATFORM` in `backend/src/services/retroarch.service.ts`:
```typescript
'YourCoreName': 'System Name',
```

### Cover art
Fetched automatically from the libretro thumbnails CDN. No API key needed.

### Notes
- RetroArch games appear in the RetroAchievements platform bucket in the library
- HLTB estimates won't show for RetroArch games (ROM filenames don't match HLTB names)
- Play a game at least once in RetroArch before syncing to get playtime data

---

## Minecraft

Enable via Profile → Add Minecraft World.

- Reads from Prism Launcher instances automatically
- Tracks playtime per world
- Syncs advancements including custom datapacks

Prism Launcher must be installed. See [setup.md](./setup.md) for path locations.

---

## PCSX2, RPCS3, PPSSPP

Enable via Profile toggles. Reads local game files and tracks playtime. No additional config needed beyond enabling the toggle.

---

## HowLongToBeat

No account or API key needed. Data is fetched from an unofficial third-party API.

- Steam games: resolved by exact Steam appId → reliable
- Wishlist games: resolved via Steam store search by name → then appId lookup
- Non-Steam library games: name-based search → may not match for all titles

Data is cached in the database after the first fetch. To refresh stale HLTB data for a wishlist game, open Prisma Studio, find the game in `steam_wishlist`, and set the four HLTB columns to null.

> **Note:** GameVault does not provide, distribute, or facilitate obtaining ROM files.
> Users are responsible for ensuring they have the legal right to use any ROM files
> on their system. Dumping cartridges you own is one legal method.