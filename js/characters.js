/* ------------------------------------------------------------------
   Ayrisha's Adventures — character definitions
   Sprites are authored as pixel-art "row strings", 16 columns wide.

   Legend
     .  transparent      s  skin          S  skin shadow
     h  hair             H  hair shine    e  eye
     m  mouth            d  outfit top    D  outfit shadow
     p  legwear          f  shoes         a  accent (headphones)

   Each stage = a static TOP (head + torso) plus swappable LEG frames,
   so the walk cycle stays identical as she grows.

   SPOILER NOTE: only `child` is ever shown on the title screen.
   The later stages are revealed by playing.
------------------------------------------------------------------- */

/* Black hair, black eyes, warm skin — shared across every stage so she
   reads as one person. Only the outfit changes with the era. */
const BASE = {
  h: '#17141c', H: '#3a3444', s: '#e8b78d', S: '#c9906a',
  e: '#120f16', m: '#b5605e'
};

/* ---------------------------- STAGE 1 ---------------------------- */
/* Ponytail, sticking out to one side. Short and round. */
const CHILD_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhhh.',
  '..hhhhhhhhhhhhhh',
  '..hhssssssssHh.h',
  '..hhssssssssHh.h',
  '..hhseesseesSh.h',
  '..hhssssssssSh.h',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '.....dddddd.....',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '....dddddddd....',
  '...dddddddddd...'
];
const CHILD_LEGS = {
  idle:   ['....sss..sss....', '....sss..sss....', '....fff..fff....', '...ffff..ffff...'],
  stride: ['...sss..sss.....', '..sss....sss....', '..fff....ff.....', '.ffff....fff....'],
  pass:   ['....sss.sss.....', '.....ss.ss......', '.....ff.ff......', '....fff.fff.....'],
  jump:   ['...sss....sss...', '..sss......ss...', '.fff.......fff..', '.fff.......fff..']
};

/* ---------------------------- STAGE 2 ---------------------------- */
/* Blunt bob, cut at the jaw. Headphones never come off. */
const TEEN_TOP = [
  '....aaaaaaaa....',
  '...ahhhhhhhha...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '.aahssssssssHaa.',
  '.aahssssssssHaa.',
  '.aahseesseeshaa.',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '..hhssssssssSh..',
  '..hhssssssssSh..',
  '..hhhhssssHhhh..',
  '......ssss......',
  '.....dddddd.....',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const TEEN_LEGS = {
  idle: [
    '....ppp..ppp....', '....ppp..ppp....', '....sss..sss....',
    '....sss..sss....', '....fff..fff....', '...ffff..ffff...'
  ],
  stride: [
    '...ppp..ppp.....', '..ppp....ppp....', '..sss....sss....',
    '..sss....sss....', '..fff....ff.....', '.ffff....fff....'
  ],
  pass: [
    '....ppp.ppp.....', '....ppp.ppp.....', '.....ss.ss......',
    '.....ss.ss......', '.....ff.ff......', '....fff.fff.....'
  ],
  jump: [
    '...ppp....ppp...', '..ppp......pp...', '..sss......sss..',
    '.sss.......sss..', '.fff.......fff..', 'ffff.......ffff.'
  ]
};

/* ---------------------------- STAGE 3 ---------------------------- */
/* Long hair, well past the shoulders. */
const ADULT_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '..hhssssssssSh..',
  '..hhssssssssSh..',
  '...hhssssssSh...',
  '..hh..ssss..hh..',
  '..hh.dddddd.hh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '...hsddddddsh...',
  '....sdddddds....',
  '.....dddddd.....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const ADULT_LEGS = {
  idle: [
    '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....', '....sss..sss....',
    '....sss..sss....', '....fff..fff....', '...ffff..ffff...'
  ],
  stride: [
    '...ppp..ppp.....', '..ppp....ppp....', '..ppp....ppp....', '..sss....sss....',
    '..sss....sss....', '..fff....ff.....', '.ffff....fff....'
  ],
  pass: [
    '....ppp.ppp.....', '....ppp.ppp.....', '....ppp.ppp.....', '.....ss.ss......',
    '.....ss.ss......', '.....ff.ff......', '....fff.fff.....'
  ],
  jump: [
    '...ppp....ppp...', '..ppp......ppp..', '..ppp......pp...', '..sss......sss..',
    '.sss.......sss..', '.fff.......fff..', 'ffff.......ffff.'
  ]
};


/* ------------------------- LEVEL 1 · 2002 ------------------------- */
/* Her parents. Extra palette letters: c = cap, b = belt / boots.     */

/* Papa — army officer. Peaked cap, epaulettes, ribbon bar, tall boots.
   Tallest sprite in the game. */
const OFFICER_TOP = [
  '....cccccccc....',
  '...cccccccccc...',
  '..cccccccccccc..',
  '..aaaaaaaaaaaa..',
  '..hhssssssssSh..',
  '..hhssssssssSh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '...aaddddddaa...',
  '...sdddddddds...',
  '...sddaaaadds...',
  '...sdddddddds...',
  '...sdddddddds...',
  '...sbbbbbbbbs...',
  '....dddddddd....',
  '....pppppppp....',
  '....pppppppp....'
];
const OFFICER_LEGS = {
  idle: [
    '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
    '....fff..fff....', '....fff..fff....', '....fff..fff....', '....fff..fff....',
    '...ffff..ffff...'
  ],
  stride: [
    '...ppp..ppp.....', '..ppp....ppp....', '..ppp....ppp....', '..ppp....ppp....',
    '..fff....fff....', '..fff....fff....', '..fff....ff.....', '..fff....ff.....',
    '.ffff....fff....'
  ],
  pass: [
    '....ppp.ppp.....', '....ppp.ppp.....', '....ppp.ppp.....', '....ppp.ppp.....',
    '.....ff.ff......', '.....ff.ff......', '.....ff.ff......', '.....ff.ff......',
    '....fff.fff.....'
  ],
  jump: [
    '...ppp....ppp...', '..ppp......ppp..', '..ppp......ppp..', '..ppp......pp...',
    '..fff......fff..', '..fff......fff..', '.fff.......fff..', '.fff.......fff..',
    'ffff.......ffff.'
  ]
};

/* Mumma — a plain frock, and black hair grown well past the hem.
   The hair runs from row 0 all the way down to row 24, framing her the
   whole height of the sprite: it is the first thing you notice. */
const MOTHER_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '..hhssssssssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '..hh..ssss..hh..',
  '..hh.dddddd.hh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '..hhddddddddhh..',
  '..hhddddddddhh..',
  '..hhddddddddhh..',
  '..hhddddddddhh..',
  '..hhddddddddhh..'
];
const MOTHER_LEGS = {
  idle: [
    '..hhddddddddhh..', '...hDDDDDDDDh...', '....ss....ss....',
    '....ss....ss....', '....ff....ff....', '...fff....fff...'
  ],
  stride: [
    '..hhddddddddhh..', '...hDDDDDDDDh...', '...ss......ss...',
    '..ss.......ss...', '..fff......ff...', '.fff.......fff..'
  ],
  pass: [
    '..hhddddddddhh..', '...hDDDDDDDDh...', '.....ss..ss.....',
    '.....ss..ss.....', '.....ff..ff.....', '....fff..fff....'
  ],
  jump: [
    '..hhddddddddhh..', '...hDDDDDDDDh...', '...ss......ss...',
    '..ss........ss..', '..fff.......ff..', '.fff........fff.'
  ]
};

/* --------------------------------------------------------------- */

const CHARACTERS = {
  child: {
    id: 'child',
    name: 'Little Ayrisha',
    era: 'the beginning · school · the first piano lesson',
    note: 'Ponytail, tiny steps, permanently mid-thought. Shortest and roundest of the three.',
    top: CHILD_TOP,
    legs: CHILD_LEGS,
    palette: { ...BASE, d: '#ff9ec4', D: '#e0789f', p: '#ff9ec4', f: '#6a4fbf', a: '#ffd166' }
  },
  teen: {
    id: 'teen',
    name: 'Teen Ayrisha',
    era: 'the bob cut · scales and recitals · finding her sound',
    note: 'Blunt bob at the jaw, headphones permanently on. Taller, slimmer, done talking to you.',
    top: TEEN_TOP,
    legs: TEEN_LEGS,
    palette: { ...BASE, d: '#63cfc0', D: '#46a89b', p: '#3f4a7a', f: '#2b2f45', a: '#ffcf4d' }
  },
  adult: {
    id: 'adult',
    name: 'Ayrisha Now',
    era: 'the degree · college · her people · today',
    note: 'Long hair past the shoulders. Full height, walks like she knows where she is going.',
    top: ADULT_TOP,
    legs: ADULT_LEGS,
    palette: { ...BASE, d: '#8f7ad9', D: '#6f5bb5', p: '#2f3550', f: '#1f2333', a: '#ffd166' }
  },

  officer: {
    id: 'officer',
    name: 'Papa',
    era: '6 September 2002 · racing across the city',
    note: 'Army officer. Cap, epaulettes, ribbon bar, boots that were not built for running.',
    top: OFFICER_TOP,
    legs: OFFICER_LEGS,
    palette: {
      ...BASE,
      d: '#5c6b3f', D: '#44502e', p: '#4e5c36', f: '#2a2620',
      b: '#2a2620', c: '#3f4a2b', a: '#d4a53a'
    }
  },

  mother: {
    id: 'mother',
    name: 'Mumma',
    era: '6 September 2002 · the longest walk',
    note: 'Plain frock, and black hair down past the hem. Slower and lower than everyone else, on purpose.',
    top: MOTHER_TOP,
    legs: MOTHER_LEGS,
    palette: {
      ...BASE,
      d: '#5b7fc4', D: '#43619b', p: '#5b7fc4', f: '#3a3040',
      b: '#3a3040', c: '#5b7fc4', a: '#e8b93c'
    }
  }
};

const ANIMATIONS = {
  idle: { frames: ['idle', 'idle'], bob: [0, 1], fps: 2.2 },
  walk: { frames: ['stride', 'pass', 'strideM', 'pass'], bob: [0, -1, 0, -1], fps: 8 },
  jump: { frames: ['jump'], bob: [0], fps: 1 }
};

const ORDER = ['child', 'teen', 'adult'];
