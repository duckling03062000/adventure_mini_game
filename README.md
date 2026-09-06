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
| — | **Growing up** (interlude, no landing page) | Ice cream (she asks for blackcurrant, and carries the cone) → bakery (a puff, then marble cake, both in a bag she carries) → Ryan International (hands empty again) → Mallya Aditi → music school → music degree (carried, rolled and tied). She **stops in front of each of the three schools** and goes on when the player presses ENTER. Past the degree **Krishna ji comes, tells her what she has done, and touches her head with a peacock feather**, and that is what turns her into the teenager. Then the flight carries her to Level 5. |
| 5 | **Let's go to class** — Kota | Fourteen acts. The walk to Allen, the classroom, projectile motion, the hostel night (played out, not narrated: desk, bed, alarm, three times over, then the sun comes up and the day runs to evening), Anam on the balcony, Friends Bazar with Anam walking behind her, the Sunday test, outside afterwards, the train out, the flight home, her own street, her room and the puzzle box, the jigsaw, the dining table and Papa. Ends on the flight to college. |
| 6 | **Let's go to college** | Four acts, and only the first day of it. College started online and stayed that way for months (a cutscene in her bedroom). Then a morning when the gate was open, and Shantanu. The cafeteria and a chocolate cake she gets all over her hands. Then Akash, and that was the three of them. |

Next up (not built): **the rest of college**, as Level 7 onwards. It is
being written one level at a time, from what she remembers, so do not
run ahead of it.

Three mini-game boards are built and wired into `MINIGAMES` but nothing
uses them yet: `'code'` (a function body to put back in order, with a
`task` of `'moodle'` or `'interview'`), `'tray'` (a counter order), and
`'fps'` (an aim range). Same for the `counter` character and the
`kfcfront`, `counterspot`, `micstand`, `biryani` and `interviewer`
props. They are the parts bin for the levels still to come.

---

## Rules

These are hard-won. Breaking them has been the main source of rework.

**Never name a place in the writing.** Manipal, Ryan International, AECS
Layout, Jigyasa, Allen — every one of them appears *only* on a signboard
in the world. The narration says "the hospital", "the gate", "the centre".

**Krishna ji's line, the level card, and the world all have to agree.**
The Level 5 card no longer says what she is there for, and Krishna ji no
longer names the city: the flight at the end of the interlude landed on a
board that reads KOTA, and that is where the player learns it.

**When the picture says it, do not also write it.** The flight carries no
narration at all. The two boards under it are the whole caption, and a
line over the top would only repeat them. The same went for the walk:
the schools used to be captioned by name, and every one of those names
was already on the signboard she was standing under. She stops at each
one instead, so the player actually looks at it.

**If she is meant to see it, it has to be on the building.** The music
school on the walk had no name on it at all and read as one more purple
house. It carries `MUSIC_SCHOOL_NAME` now, the same board Level 4 uses.

**Show a gift rather than mention it.** Anything she is given goes into
her hands and stays there: `giveItem('blackcurrant')` from a dialogue
line's `on()` hook, `dropCarried()` when she should be empty-handed
again. See *What she carries*.

**`growUp(into)` takes which stage she becomes**, and
`startMagic({ into, lines })` runs the whole feather beat out in a
level. Only the teenager is used so far.

**She grows up after the degree, not at it, and Krishna ji does it.**
She collects the degree as a child, walks on a few tiles, and then he
appears beside her, says the two lines, steps in, and touches the top
of her head with a peacock feather. The touch is the change. She stands
still for the whole of it and part of it waits on the player, so it is
not on a timer: see *The changing* in `game.js`.

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
hints that she grows. Nothing outside the game shows the later ones.

---

## How it fits together

```
index.html          title screen
game.html           the game — loads every script, holds every overlay

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
  testpaper.js    Level 5's Sunday test
  jigsaw.js       Level 5's night-sky puzzle
  codeboard.js    Level 6's two code puzzles
  tray.js         Level 6's counter order
  fps.js          Level 6's aim range
  levels/
    builder.js    makeBuilder — levels are assembled from chunks
    level1..6.js, growing.js
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
herself), `type` for an act that is not a playable scene:

- a mini-game: `'art'`, `'piano'`, `'harmonium'`, `'physics'`, `'test'`,
  `'jigsaw'`, `'code'`, `'tray'`, `'fps'`. They all launch the same way,
  off the `MINIGAMES` table in `game.js`: add a row there and a board to
  `game.html` and that is the whole wiring. A mini-game act can carry an
  `intro`, which is spoken before the board opens, and the whole act
  object is handed to the board's `run`, which is how `'code'` gets its
  `task` (`'moodle'` or `'interview'`).
- `'scene'` with a `scene:` key, a cutscene in the middle of a level.
  It runs an `ENDINGS` entry and then hands back to the next act. If it
  is the *last* act it hands on to the level's `ending` instead: the
  train out and the dining table are both scenes, and the dining table
  is last, so it is what starts the flight to college.

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

A level can also carry a `companion` (`{ char, tuning, carry }`) and a
`night` (a scripted sequence, below).

A trigger is a caption by default. Give it `talk: true` and it becomes a
real conversation instead, waiting for ENTER. That is how the two
shopkeepers in the growing-up walk speak to her. Leave the shop and its
shopkeeper two tiles apart and fire the trigger two tiles before him, or
she arrives already mid-sentence.

A trigger also takes `on()` (anything that should happen the moment she
crosses it, with or without a line), `pause: true` (she stops there until
the player presses ENTER, with an optional `note`), `hold: <frames>` (she
stops for a fixed count while a beat plays out), `grow: true` (straight
into the teen), and `magic: true` (Krishna ji arrives and does it
himself). `magic` needs no `hold`: she is held for exactly as long as he
is there, which matters because part of it waits on the player.

### Scripted beats

Some things are hers to play out rather than the player's to walk. A
level meta `night: { x, steps }` starts a script the first time she
crosses `x`, and the player is not in charge again until it ends. Steps
run in order:

```js
{ to: <tile> }        walk there
{ say: [lines] }      a caption, on arrival
{ sleep: <seconds> }  the room dims and three Zzz go up
{ stayAsleep: true }  do not wake her for this step
{ alarm: true }       the clock goes off
{ dawn: <seconds> }   the sun comes up and stays up
```

The hostel night is one of these: desk, bed, alarm, three times over,
then the sun comes up on her in bed and the day runs out to class and
back by evening.

Two things about the step order, both learned the hard way:

- **A step speaks on arrival, not on departure.** Saying it first sent
  the caption and the whole step past her while she was still standing
  at the last place, so she slept at her desk and never reached the bed.
- **Speaking does not advance the step.** A step can say something and
  then go on to sleep or to dawn through it, so the caption plays and
  the beat happens after it.

`controlActor(actor, level, dt, forced)` is what makes this possible:
pass -1, 0 or 1 and the actor is driven from code instead of the
keyboard. It is also how the companion follows.

### A companion

`companion: { char, tuning, carry }` on a level puts somebody else in it.
They keep a step behind her, stop when she stops, and can be handed an
item (`mate.carry = 'coldcoffee'`). Give them `quiet = true` or you get
two sets of footsteps.

**A companion has to be able to get over what she gets over.** A driven
actor does not read the keyboard, so it never jumped and Anam simply
stood at the first crate. She now looks at the tile she is about to walk
into and the one she would land on, and jumps for a wall, a hole, or a
ledge Ayrisha is up on. There is a safety net behind that: fall down a
hole or get hopelessly stuck and she catches up off screen.

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

The two shopkeepers of the growing-up walk are `icemanshop` (paper cap,
striped shirt) and `baker` (tall white hat, red under a floury apron).

### What she carries

`carried` is a list of item names, drawn over her by `drawCarried()` and
cleared at the start of every act. Four exist: `blackcurrant`, `puff`,
`marblecake`, `degree`. Puffs and marble cake share one bag so that both
show at once without two objects fighting for the same hand.

Sizing is the trap. She is 22 pixels tall, so an item drawn at a size
that looks right on its own reads as a crate she is standing behind: the
first bakery bag was a pale slab wider than she is. Keep them under about
10 pixels, give them the sprites' dark outline, hold them out to the side
rather than across her, and never over her face. The dialogue box covers
everything below roughly her chin, so a gift given during a conversation
has to be visible at hand height or above.

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
- **A glow alone is invisible over a bright sky.** The transformation
  light did nothing at all until the scene dimmed underneath it.
  `drawGrowDim()` runs *before* she is drawn and `drawGrowFlash()` after,
  so the dark falls on the world and the light falls on her.
- **An ending scene freezes under its own narration** unless you let it
  run. `update()` returns early while a dialogue is up, so `endingT` used
  to stop dead: the flight's aeroplane hung motionless for its first four
  seconds. Endings now keep advancing under the line.
- **`say()` used to hand every speaker to Krishna ji.** `drawGuide`
  draws Krishna ji and nobody else, so a line with any other speaker
  appeared in the box with his vision glowing behind them. Only
  `char: 'krishna'` goes through the guide now; anyone else gets a plain
  bottom-right box.
- **A scene act at the end of a level used to run off the acts array.**
  The dining table is the last act, so it incremented past the end,
  `startCurrentAct` threw on an undefined act, and the flight to college
  never played: the game sat in `state = 'ending'` with `ending = null`,
  throwing every frame. The last act now falls through to the ending,
  and both `startCurrentAct` and the ending branch guard against it.
  Worth knowing why the automated playthrough missed it: the harness
  wrapped its own interval body in try/catch, and the throw happened
  inside a `fadeThrough` timeout, so no error ever reached it.
- **A splice that ate the carry system.** Replacing a block by index
  from one function to the next section header quietly deleted
  everything in between. If you rewrite a region that way, check what
  actually sat inside it first.
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
- **The test** (Level 5): six questions, two each of physics, chemistry
  and maths, at the level she was actually working at. Every number in
  them works out, and each right answer says why in one line. A wrong
  option greys out and the paper waits.
- **The code board** (Level 6, twice): the body of a function in the
  wrong order, to be put back. The Moodle one counts attendance from the
  logs; the interview one reverses a linked list. Both are real code
  that would run.
- **The tray** (Level 6): the board behind the counter has more on it
  than she asked for. Pick the burger, the fries and the cola; anything
  else simply does not go on the tray.
- **The range** (Level 6): targets come up and go away again. Twelve
  hits ends the round. Missing costs nothing and neither does running
  out of time.
- **The jigsaw** (Level 5): the night sky: the moon, a ringed planet, a
  comet, an observatory on the ridge. The picture is painted in code, so
  there is still only one image file in the whole game. Twelve pieces:
  pick one, click where it goes, and a wrong space does nothing at all.

---

## Assets

`assets/images/painting-nature.jpg` is the real cover of *Painting Nature
in Pen & Ink with Watercolor* by Claudia Nice — the book her art teacher
gave her. It is drawn into Level 3's ending.
