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
| Power (boss horses) | X | FIRE / MOON |
| Pause | P | II |

## Racers

Swipe the racer list to see everyone.

- **Unicorn**: fastest on flat ground, double jump.
- **Pegasus**: hold jump to glide; strong on uphills, and auto-hops obstacles during speed bursts.
- **Moon Queen** (beat her at level 4): POWER button, Moon Phase. Turns ghostly and runs straight through hills.
- **Dragon Pony** (beat her at level 8): POWER button, Fire Turbo. Blasts forward and smashes through obstacles.
- **Mountain King** (beat him at level 12): press jump on an uphill to charge up it.
- **Skeleton Horse** (secret, beat the level 8 boss): every level turns to Halloween, ghost hover, fire trail.

## Features

- Uphill slows you, downhill builds turbo speed; dive onto downslopes for a boost
- Big jumps and bullet time zoom the camera out and show your landing (white) and dive landing (pink)
- Giant mountains with a slow valley road and a secret high cloud path between the summits
- Chapters of three races plus a boss (Moon Queen, Dragon Pony), getting harder each chapter
- 19 worlds, each with its own rule: bouncy Mushroom Grove, sticky Candy Cove, swimming Splash Lagoon, floaty Starlight Space, hot Ember Volcano, slippery Frosty Peaks, slow Castle Court, Rainbow Road (spinning rainbows and shooting stars), Mirror World (super hard bonus: chrome world, horses reflected in the sky, up/down swapped, inside-out flips, funky K-pop theme; you move on even if you lose), Backwards Bay (everything backwards), Silly Spider Woods (tickly spiders), Pumpkin Patch, Big Apple City, Neon Nights and the originals
- STAR TURBO: the middle button fills from gems, dives, power-ups, combos and flips; when full, tap it to go golden, super fast and unstoppable
- Double-tap jump in the air for a flippy flop (land it for speed and gems)
- Power-ups start Fabulous Mode: rainbow glitter world and a K-pop music drop
- After each boss: the high five, then a Friendship Dance rhythm game in the boss's courtyard that earns a Friendship Charm
- Cloud-hopping sky routes above the low road; the camera pulls way back on mountain tops and big air
- Turbo speedways, giant mountain ridges and a skeleton-horse Halloween level
- Gems, bubble shields, gem magnets, super rainbows, cloud platforms and combos
- Sticker book for manes, hats and trails; photo mode; ghost of your best run
- Free Run: endless relaxed running; run into standing ponies to build a herd of up to 5 (the camera zooms out), warned obstacles and world-changing orbs
- Two-player split screen; bouncy mode for little riders
- Per-world music that speeds up each level

## Editing

The game is one self-contained `index.html`. The source is split into parts in `src/`. Edit those, then run `./build.sh` to rebuild `index.html`. Game feel lives in the `CONFIG` block at the top of `src/b_core.js`.
