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

/* ------------------------- LEVEL 3 · THE BOOK --------------------- */
/* Two people who do not walk anywhere: they stand where they stand.
   Their leg frames are all the same array, so the shared animation
   code works on them without a special case. */

/* The art teacher, at her easel on the balcony. Bun, grey at the
   temples, an apron over her kurta. */
const TUTOR_TOP = [
  '......hhhh......',
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '.....dddddd.....',
  '....sdddddds....',
  '....saaaaaas....',
  '....saaaaaas....',
  '....saaaaaas....',
  '....dddddddd....',
  '...dddddddddd...',
  '....pppppppp....'
];
const TUTOR_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....sss..sss....',
  '....sss..sss....', '....fff..fff....', '...ffff..ffff...'
];

/* Her husband, at the computer in the front room. Thinning grey hair
   and a pair of glasses. */
const HUSBAND_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhaaeaaeaaSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '..hhssssssssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '.....dddddd.....',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const HUSBAND_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* Same frames whichever animation asks for them. */
const still = rows => ({ idle: rows, stride: rows, pass: rows, jump: rows });

/* ---------------------------- KRISHNA JI --------------------------- */
/* The guide. Appears at the start of a level to say what it is about.
   Read top to bottom: peacock feather, crown, blue skin, garland,
   flute, and a yellow dhoti.
   Extra palette letters: k = skin, g = garland, b = flute. */
const KRISHNA_TOP = [
  '.......pp.......',
  '......pppp......',
  '.......pp.......',
  '....aaaaaaaa....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhkkkkkkkkKh..',
  '..hhkeekkeekKh..',
  '..hhkkkkkkkkKh..',
  '..hhkkkmmkkkKh..',
  '...hhkkkkkkKh...',
  '....hkkkkkkh....',
  '......kkkk......',
  '...gggkkkkggg...',
  '..kkkkkkkkkkkk..',
  '..kbbbbbbbbbbk..',
  '..kkgkkkkkkgkk..',
  '...kkkkkkkkkk...',
  '....dddddddd....',
  '...dddddddddd...',
  '..dddddddddddd..',
  '..dddddddddddd..',
  '...DDDDDDDDDD...'
];
const KRISHNA_LEGS_IDLE = [
  '.....kk..kk.....', '.....kk..kk.....',
  '....kkk..kkk....', '...kkkk..kkkk...'
];

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
  },

  tutor: {
    id: 'tutor',
    name: 'Aunty',
    era: 'level 3 · at the easel',
    note: 'Bun, grey at the temples, a paint-stained apron. Never stops working.',
    top: TUTOR_TOP,
    legs: still(TUTOR_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2e2730', H: '#9a939e',
      d: '#c98a3a', D: '#a86e28', p: '#463f56', f: '#5a4a3a',
      a: '#e8e2d2', b: '#5a4a3a', c: '#c98a3a'
    }
  },

  husband: {
    id: 'husband',
    name: 'Uncle',
    era: 'level 3 · at the computer',
    note: 'Thinning grey hair, glasses, and something on the screen he will not look up from.',
    top: HUSBAND_TOP,
    legs: still(HUSBAND_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#8f8a84', H: '#aaa49e',
      d: '#dfe3e8', D: '#c2c7cd', p: '#4a4f5c', f: '#2a2620',
      a: '#8a7a3a', b: '#2a2620', c: '#dfe3e8'
    }
  },

  krishna: {
    id: 'krishna',
    name: 'Krishna ji',
    era: 'the guide',
    note: 'Peacock feather, crown, flute and garland. Opens every level.',
    top: KRISHNA_TOP,
    legs: still(KRISHNA_LEGS_IDLE),
    palette: {
      ...BASE,
      k: '#7fa3e0', K: '#6285c4',
      h: '#1a1726', H: '#332c44',
      e: '#141019', m: '#c0555c',
      a: '#f2c53d', p: '#2f9c8f',
      d: '#f5c542', D: '#d9a51f',
      g: '#f6efdd', b: '#dcb877',
      s: '#7fa3e0', S: '#6285c4', f: '#7fa3e0', c: '#f5c542'
    }
  }
};

const ANIMATIONS = {
  idle: { frames: ['idle', 'idle'], bob: [0, 1], fps: 2.2 },
  walk: { frames: ['stride', 'pass', 'strideM', 'pass'], bob: [0, -1, 0, -1], fps: 8 },
  jump: { frames: ['jump'], bob: [0], fps: 1 }
};

const ORDER = ['child', 'teen', 'adult'];
