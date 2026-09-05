# Ayrisha's Adventures

A birthday gift: a browser platformer that walks through Ayrisha's life,
one level per chapter of it. She starts as a baby being born in Bangalore
in 2002 and grows up as the levels go by.

**This file is the handover.** Read the *Rules* section before writing a
line of content — most of it is not obvious from the code, and all of it
came from the person this game is for correcting me.

---

## Running it

```bash
cd ~/Workspace/CutuBday2026
python3 serve.py            # http://localhost:8777
```

Use `serve.py`, not `python3 -m http.server`. The built-in server sends no
cache headers, so Chrome will happily keep running an older build after
you edit a file — which looks exactly like "my change did nothing". This
one sends `no-store`.

| URL | What it opens |
|---|---|
| `/` | Title screen → the whole game |
| `/game.html?level=N` | Jump straight to a level (1-based, testing only) |
| `/character-lab.html` | **Spoilers.** Every sprite, for review. Never share this. |

Controls: **← →** move, **SPACE** jump / pump the bellows, **ENTER** advance
dialogue, **M** mute.

---

## Where it is now

| # | Level | Contains |
|---|---|---|
| 1 | **The Birth** — Bangalore, 6 Sept 2002 | Two acts: Papa across a flooded city, then Mumma. Ends on the birth. |
| 2 | **Let's go to school** — AECS Layout | Mango tree (climb for 3 mangoes), Ryan International, a guard who won't open the gate without them. |
| 3 | **Let's go see our art tutor** | Four scenes: the walk, inside the house (Uncle, a TV playing Kid vs Kat), the balcony, a painting mini-game, the book. |
| 4 | **Let's go to the music class** — Yelahanka | Jigyasa Centre. Piano lesson, a bow that goes too far, harmonium lesson. |
| — | **Growing up** (interlude, no landing page) | Ice cream → bakery → Ryan International → Mallya Aditi → music school → music degree. **She changes from child to teen at the degree**, then it simply ends. |
| 5 | **College entrance exams** — Kota | Allen, a physics class and a projectile lesson, the hostel night, Anam, Friends Bazar, the Sunday test, home. |

Next up (not built): **college**. Krishna ji's closing line in Level 5 sets
it up — *"let's go to college now, and have a good time."*

---

## Rules

These are hard-won. Breaking them has been the main source of rework.

**Never name a place in the writing.** Manipal, Ryan International, AECS
Layout, Jigyasa, Allen — every one of them appears *only* on a signboard
in the world. The narration says "the hospital", "the gate", "the centre".

**Never assert what we don't know.** No time of day at the birth (we don't
know if it was day or night — the art is deliberately an ambiguous
overcast). No invented detail about her family, her school, or what
anyone was thinking. If a fact isn't given, the writing works around it.

**Landing pages give nothing away.** A level card is a number, a short
title, and START. No objective lists that spoil what happens. If the
player genuinely needs to know something (the mangoes), tell them *in the
world*, at the moment it matters.

**Krishna ji is the narrator.** He appears centre-screen, standing on the
ground, and says what a level is about. His box is bottom-right so the
middle of the screen stays clear for him. He is *not* drawn into ending
scenes — he covered the family at the birth.

**Two kinds of text, and they behave differently:**
- **Narration** — a caption with no speaker, plays itself on a timer,
  ignores input. Used for scene-setting between beats.
- **Dialogue** — has a speaker and a portrait, waits for ENTER. Used when
  somebody is talking *to her*.
- A line can be `lock: true` — ignores input and dismisses itself, so a
  moment (the book arriving, the bow) plays out and can't be mashed past.

**Transitions are conversation and fades, never full-screen cards.** The
story-card overlay was removed entirely.

**Keep the surprise.** `index.html` shows only the child sprite and never
hints that she grows. `character-lab.html` is the only place the whole
cast appears, and it carries a spoiler warning.

---

## How it fits together

```
index.html          title screen
game.html           the game — loads every script, holds every overlay
character-lab.html  internal sprite review page

js/
  characters.js   every sprite, as 16-wide pixel row strings
  sprites.js      row strings → canvas, with an auto-generated outline
  engine.js       input, tilemap collision, camera, tile rendering
  scene.js        shared canvas helpers, sky, parallax
  audio.js        everything synthesised — no sound files at all
  dialogue.js     the dialogue box, portraits, locked lines
  game.js         CHAPTERS, scene flow, all props, all ending scenes
  art.js          Level 3's painting board
  physics.js      Level 5's projectile lesson
  piano.js        Level 4's piano lesson
  harmonium.js    Level 4's harmonium lesson
  levels/
    builder.js    makeBuilder — levels are assembled from chunks
    level1..5.js, growing.js
```

### Adding a level

It's a data change. Append to `CHAPTERS` in `game.js`:

```js
{
  id: 'level6', number: 6,
  title: 'Let’s go to college', subtitle: '', blurb: '', objectives: [],
  acts: [
    { intro: SCRIPT.l6guide, outro: [], seamless: true,
      build: buildAct6a, char: 'adult', tuning: TEEN_TUNING,
      music: 'morning', hud: 'AYRISHA',
      goalLines: [ /* a conversation when she reaches the goal */ ] }
  ],
  ending: 'someEnding',   // a key in ENDINGS, or null for an interlude
  close: SCRIPT.l6done
}
```

Act flags: `seamless` (fade instead of a card), `autoWalk` (she walks
herself), `type: 'art' | 'piano' | 'harmonium' | 'physics'` (a mini-game instead of a
playable scene).

### Building a map

```js
const b = makeBuilder();
b.indoors();                     // ceiling + interior wall; outdoors() to leave
b.flat(8);                       // ground
b.gap(2);                        // a hole — 2 tiles is the safe maximum
b.crates(1);                     // a 1-tile obstacle
b.block(2, 1, 'C', 'bench');     // solid tiles with a prop drawn over them
b.ledges(3, 2);                  // one-way platforms
b.checkpoint();
b.prop('tree');
const goal = b.frontage(9, 'S', 'housefront', { doorOffset: 7, openAll: true });
return b.build({ goalX: goal.goalX, theme: 'morning', tileStyles: {...} });
```

Levels can override tile colours (`tileStyles`) and the interior wall
(`interiorWall`), which is how each building looks like a different place
without new tile types.

Level meta also drives behaviour: `npc` (blocks until talked to), `gate`
(a guard who asks first), `tv`, `desk`, `triggers` (one-shot lines),
`pickups`.

### Jump budget

Everything is tuned so nothing is unfair. Check before placing an obstacle:

| Who | Apex | Horizontal reach |
|---|---|---|
| Papa | ~65px (4 tiles) | ~75px |
| Mumma | ~29px (1.8 tiles) | ~40px |
| Child | ~37px (2.3 tiles) | ~45px |
| Teen | ~49px (3 tiles) | ~59px |

Gaps are never more than 2 tiles. Branch platforms on the mango tree are
exactly 2 tiles apart because that is precisely what the child clears.

---

## Sprites

16 columns wide, authored as row strings you can read like ASCII art:

```
'..hhssssssssHh..'   hair, face, hair-shine
'..hhseesseesSh..'   eyes
'..hhsssmmsssSh..'   mouth
```

Letters map to a `palette` on the character. `sprites.js` generates the
dark outline automatically — that's what makes them pop.

A character is a static `top` (head + torso) plus swappable `legs`
(`idle`, `stride`, `pass`, `jump`). The walk mirrors `stride` on beats 3–4
so it's a real gait. Characters who never walk use `still(rows)`.

Ayrisha: **child 22px → teen 26px → adult 29px.** Black hair, black eyes,
slim, same face throughout; only hair and clothes change. Ponytail, then a
bob with headphones, then long hair.

---

## Traps

Every one of these cost real debugging time.

- **Stale JavaScript.** Use `serve.py`. If a change seems to do nothing,
  hard-reload (Cmd+Shift+R) before believing it.
- **Input is consumed on read.** `update()` runs up to five times per
  frame; a non-consuming `tapped()` reported one keypress on every
  substep and advanced five lines of dialogue at once.
- **Buttons steal ENTER.** A hidden overlay's button keeps focus and
  re-fires on ENTER. `dropFocus()` runs whenever the game takes the
  screen back — call it if you add an overlay.
- **The next frame is queued first** in `frame()`. One exception used to
  kill the whole game loop silently.
- **`showStory([])` and `startEnding()` with no ending** both used to
  throw. Empty is legal now; keep it that way.
- **Props draw behind their own tiles** unless listed in `FRONT_PROPS`.
- **Place props relative to where she stops**, not where you imagine she
  stands. The uncle ended up off-screen and the guard inside her.
- **Audio gain staging.** It once measured 0.08 peak — audible in theory,
  silent in practice. `Sound.meter()` returns the master peak; music
  should sit around 0.35.

---

## Audio

No sound files. Everything is Web Audio: `Sound.play(name)` for effects,
`Sound.note('C4')` for a struck piano note, `Sound.playMusic(name)` for
one of six sequenced tracks (`rush`, `careful`, `lullaby`, `morning`,
`afternoon`, `indoors`). `Sound.debug()` and `Sound.meter()` exist because
the graph is otherwise invisible.

Music starts on the START press, not after the intro cards — the game used
to be silent for its first several screens.

---

## Mini-games

All three are DOM overlays over the canvas, and all three are forgiving on
purpose. **There is no failing anything in this game, only finishing it.**

- **The painting** (Level 3) — a pen-and-ink hummingbird from the real book
  cover, 108 squares, 14 watercolours. Any colour anywhere: it's her
  painting. The finished picture is kept and drawn onto the easel in the
  ending.
- **The piano** (Level 4) — Twinkle Twinkle. The next key lights up.
- **The harmonium** (Level 4) — the same idea plus bellows: air leaks
  away, and with none left the reeds go quiet and correct keys don't
  count. SPACE pumps.
- **Projectile motion** (Level 5) — set angle and speed, land three shots
  on the mark. The range equation printed under the sliders is the real
  one, and the first problem is deliberately not 45° so that 45° being
  the maximum is something she finds out.

---

## Assets

`assets/images/painting-nature.jpg` is the real cover of *Painting Nature
in Pen & Ink with Watercolor* by Claudia Nice — the book her art teacher
gave her. It is drawn into Level 3's ending.
