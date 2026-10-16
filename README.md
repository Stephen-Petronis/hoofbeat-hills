# Hoofbeat Hills

An 8-bit pastel pony racer in the spirit of NES Excitebike. Gallop rolling hills as a unicorn or a pegasus, time your jumps and landings past the brambles, and win the Rainbow Cup.

**Play:** open `index.html` in any browser, or turn on GitHub Pages for this repo and visit the site. On iPad, open it in Safari and use Share → Add to Home Screen for a full-screen app icon.

## How to play

The horse always runs on its own. You only steer and jump.

| | Keyboard | Touch |
|---|---|---|
| Jump (hold to glide or hover) | Space | JUMP |
| Change lane | ↑ ↓ | ▲ ▼ |
| Dive (in the air) | ↓ | ▼ |
| Pause | P | II |

## Racers

- **Unicorn**: fastest on the ground, double jump.
- **Pegasus**: hold jump to glide; strong on uphills, and auto-hops obstacles during speed bursts.
- **Skeleton Horse (secret)**: beat the Level 8 boss to unlock. Every level turns to Halloween, ghost hover, fire trail.

## Features

- Uphill slows you, downhill builds turbo speed; dive onto downslopes for a boost
- Chapters of three races plus a boss (Moon Queen, Dragon Pony), getting harder each chapter
- Six worlds: Sunrise Meadow, Twilight Glen, Candy Cove, Crystal Peaks, Cloud Summit, Spooky Hollow
- Turbo speedways, giant mountain ridges and a skeleton-horse Halloween level
- Gems, bubble shields, gem magnets, super rainbows, cloud platforms and combos
- Sticker book for manes, hats and trails; photo mode; ghost of your best run
- Free Run: endless relaxed running; run into standing ponies to build a herd of up to 5 (the camera zooms out), warned obstacles and world-changing orbs
- Two-player split screen; bouncy mode for little riders
- Per-world music that speeds up each level

## Editing

The game is one self-contained `index.html`. The source is split into parts in `src/`. Edit those, then run `./build.sh` to rebuild `index.html`. Game feel lives in the `CONFIG` block at the top of `src/b_core.js`.
