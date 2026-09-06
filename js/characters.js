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

/* ------------------------- LEVEL 2 · NEIGHBOURS ------------------- */
/* The uncle who owns the mango tree, and the guard on the school gate. */
const MUNCLE_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
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
const MUNCLE_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

const GUARD_TOP = [
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
  '...sdddddddds...',
  '...sdddddddds...',
  '...sbbbbbbbbs...',
  '....dddddddd....',
  '....pppppppp....'
];
const GUARD_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....fff..fff....', '....fff..fff....', '....fff..fff....',
  '...ffff..ffff...'
];

/* -------------------------- LEVEL 4 · MUSIC ----------------------- */
/* The music teacher. Bun, glasses, green kurta. */
const MUSICT_TOP = [
  '......hhhh......',
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
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
  '....dddddddd....',
  '...dddddddddd...',
  '....pppppppp....'
];
const MUSICT_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....sss..sss....',
  '....sss..sss....', '....fff..fff....', '...ffff..ffff...'
];

/* --------------------------- LEVEL 5 · KOTA ----------------------- */
/* Anam, who she meets on the hostel balcony. */
const ANAM_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '..hh..ssss..hh..',
  '..hh.dddddd.hh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '...hsddddddsh...',
  '....dddddddd....',
  '....pppppppp....'
];
const ANAM_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The physics sir at Allen. */
const PHYST_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhaaeaaeaaSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
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
const PHYST_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The man at the ice cream parlour. Paper cap, striped shirt. */
const ICEMAN_TOP = [
  '....aaaaaaaa....',
  '...aaaaaaaaaa...',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '.....dddddd.....',
  '....sdddddds....',
  '....sDDDDDDs....',
  '....sdddddds....',
  '....sDDDDDDs....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const ICEMAN_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The man at the bakery. Tall white hat, apron, moustache. */
const BAKER_TOP = [
  '....gggggggg....',
  '....gggggggg....',
  '...gggggggggg...',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '......ssss......',
  '.....dddddd.....',
  '....sdggggds....',
  '....sdggggds....',
  '....sdggggds....',
  '....sdggggds....',
  '.....gggggg.....',
  '.....pppppp.....'
];
const BAKER_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The man at the cold coffee stall in Friends Bazar. */
const COFFEEMAN_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '....ggdddddd....',
  '...sggdddddds...',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const COFFEEMAN_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* Shantanu. College, and then most of the rest of it. */
const SHANTANU_TOP = [
  '....hhhhhhhh....',
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
  '....sddDDdds....',
  '....sddDDdds....',
  '....sddDDdds....',
  '....sddDDdds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const SHANTANU_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* Akash. Glasses, and never without a cap. */
const AKASH_TOP = [
  '...aaaaaaaaaa...',
  '..aaaaaaaaaaaa..',
  '..aaaaaaaaaaaaa.',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhaeeaaeeaSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
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
const AKASH_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The girl behind the counter at the fried chicken place. */
const COUNTER_TOP = [
  '....aaaaaaaa....',
  '...ahhhhhhhha...',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '..hhssssssssSh..',
  '..hhhhssssHhhh..',
  '......ssss......',
  '.....dddddd.....',
  '....sdgggggd....',
  '....sdgggggd....',
  '....sdddddds....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....',
  '.....pppppp.....'
];
const COUNTER_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* Behind the counter in the college cafeteria. */
const CAFEMAN_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '.....dddddd.....',
  '....sdgggggd....',
  '....sdgggggd....',
  '....sdgggggd....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const CAFEMAN_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* Two of the people from the year, met at last in a corridor. */
const CLASSMATE_A_TOP = [
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '..hhssssssssSh..',
  '..hhhhssssHhhh..',
  '...hhssssssh....',
  '......ssss......',
  '.....dddddd.....',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const CLASSMATE_B_TOP = [
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
  '....sdDDDDds....',
  '....sdddddds....',
  '....sdDDDDds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const CLASSMATE_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* Her friend from the Moodle project. He is not named, because
   nobody remembers writing his name down. */
const MFRIEND_TOP = [
  '....hhhhhhhh....',
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
  '....sdddgddds...',
  '....sdddgddds...',
  '....sdddgddds...',
  '....sdddgddds...',
  '.....dddddd.....',
  '.....pppppp.....'
];
const MFRIEND_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The head of the incubator cell. Grey, glasses, and a jacket. */
const HEAD_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhaeeaaeeaSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '....DDdggdDD....',
  '...sDDdggdDDs...',
  '...sDDdggdDDs...',
  '...sDDdggdDDs...',
  '...sDDdggdDDs...',
  '....DDDggDDD....',
  '.....pppppp.....'
];
const HEAD_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The man at the juice corner outside the college gate. */
const JUICEMAN_TOP = [
  '.....hhhhhh.....',
  '...hhhhhhhhhh...',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhseesseesSh..',
  '..hhssssssssSh..',
  '..hhsshhhhssSh..',
  '..hhsssmmsssSh..',
  '...hhssssssSh...',
  '....hssssssh....',
  '......ssss......',
  '....gddddddg....',
  '...sgddddddgs...',
  '....sdddddds....',
  '....sdddddds....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const JUICEMAN_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* The one who was sitting with them in the back row. Not named,
   because what he was is a good friend. */
const GOODFRIEND_TOP = [
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
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
  '....sddDDdds....',
  '....sdddddds....',
  '....sddDDdds....',
  '....sdddddds....',
  '.....dddddd.....',
  '.....pppppp.....'
];
const GOODFRIEND_LEGS_IDLE = [
  '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
  '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
];

/* Noida, and the first day of the job. Same person, same hair. A bucket
   hat, a crop top, jeans, and a pair of sunglasses she does not take off
   for anybody, including the man selling the coffee. */
const NOIDA_TOP = [
  '....aaaaaaaa....',
  '....aaaaaaaa....',
  '..aaaaaaaaaaaa..',
  '.AAAAAAAAAAAAAA.',
  '..hhssssssssHh..',
  '..hhssssssssHh..',
  '..hhGGGGGGGGhh..',
  '..hhwggGGggwhh..',
  '..hhssssssssSh..',
  '..hhsssmmsssSh..',
  '..hhssssssssSh..',
  '...hhssssssSh...',
  '..hh..ssss..hh..',
  '..hh.dddddd.hh..',
  '..hhsddddddshh..',
  '..hhsddddddshh..',
  '...hsddddddsh...',
  '....ssssssss....',
  '.....pppppp.....',
  '....pppppppp....',
  '....pppppppp....',
  '.....pppppp.....'
];
const NOIDA_LEGS = {
  idle: [
    '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
    '....ppp..ppp....', '....fff..fff....', '...ffff..ffff...'
  ],
  stride: [
    '...ppp..ppp.....', '..ppp....ppp....', '..ppp....ppp....', '..ppp....ppp....',
    '..ppp....ppp....', '..fff....ff.....', '.ffff....fff....'
  ],
  pass: [
    '....ppp.ppp.....', '....ppp.ppp.....', '....ppp.ppp.....', '.....pp.pp......',
    '.....pp.pp......', '.....ff.ff......', '....fff.fff.....'
  ],
  jump: [
    '...ppp....ppp...', '..ppp......ppp..', '..ppp......pp...', '..ppp......ppp..',
    '.ppp.......ppp..', '.fff.......fff..', 'ffff.......ffff.'
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

  mangouncle: {
    id: 'mangouncle',
    name: 'Uncle',
    era: 'level 2 · the mango tree',
    note: 'Owns the tree, and is happy for the mangoes to go to school.',
    top: MUNCLE_TOP,
    legs: still(MUNCLE_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2620', H: '#4a423a',
      d: '#5d7fa8', D: '#465f80', p: '#4a4136', f: '#2a2620',
      b: '#2a2620', c: '#5d7fa8'
    }
  },

  guard: {
    id: 'guard',
    name: 'Guard',
    era: 'level 2 · the school gate',
    note: 'Khaki, peaked cap, and a very good memory for who owes him what.',
    top: GUARD_TOP,
    legs: still(GUARD_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#241f1a', H: '#3d352c',
      d: '#a89666', D: '#8a7a4e', p: '#8a7a4e', f: '#2a2620',
      b: '#3a3026', c: '#8a7a4e', a: '#c9a227'
    }
  },

  musicteacher: {
    id: 'musicteacher',
    name: 'Music teacher',
    era: 'level 4 · the piano room',
    note: 'Bun, glasses, green kurta. Counts you in and never rushes you.',
    top: MUSICT_TOP,
    legs: still(MUSICT_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2430', H: '#5a4f60',
      d: '#3f8f6a', D: '#2f6f52', p: '#3a3550', f: '#4a3f36',
      a: '#c9a227', b: '#4a3f36', c: '#3f8f6a'
    }
  },

  physicsteacher: {
    id: 'physicsteacher',
    name: 'Physics sir',
    era: 'level 5 · Allen',
    note: 'Chalk, glasses, and a moustache. Draws the parabola without looking.',
    top: PHYST_TOP,
    legs: still(PHYST_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2620', H: '#4a423a',
      d: '#dfe3e8', D: '#c2c7cd', p: '#3a4152', f: '#2a2620',
      a: '#8a7a3a', b: '#2a2620', c: '#dfe3e8'
    }
  },

  anam: {
    id: 'anam',
    name: 'Anam',
    era: 'level 5 · the hostel balcony',
    note: 'Met on the balcony at some hour that was not really any hour.',
    top: ANAM_TOP,
    legs: still(ANAM_LEGS_IDLE),
    palette: {
      ...BASE,
      d: '#d1663f', D: '#ad4f2f', p: '#3f4a63', f: '#2f2a33',
      b: '#2f2a33', c: '#d1663f', a: '#e8b93c'
    }
  },

  icemanshop: {
    id: 'icemanshop',
    name: 'Ice cream man',
    era: 'growing up \u00b7 the parlour on the way home',
    note: 'Paper cap, striped shirt, and never has to ask her twice.',
    top: ICEMAN_TOP,
    legs: still(ICEMAN_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2620', H: '#4a423a',
      a: '#f4f7fa', d: '#eef2f6', D: '#f2b6c8',
      p: '#3a4152', f: '#2a2620'
    }
  },

  baker: {
    id: 'baker',
    name: 'Baker',
    era: 'growing up \u00b7 the bakery two doors down',
    note: 'Tall white hat and an apron with the afternoon\u2019s flour still on it.',
    top: BAKER_TOP,
    legs: still(BAKER_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#241f1a', H: '#3d352c',
      g: '#f4f1ea', d: '#c8402f', D: '#a53223',
      p: '#4a4136', f: '#2a2620'
    }
  },

  coffeeman: {
    id: 'coffeeman',
    name: 'Cold coffee man',
    era: 'level 5 \u00b7 Friends Bazar',
    note: 'Moustache, and a towel over one shoulder that never comes off.',
    top: COFFEEMAN_TOP,
    legs: still(COFFEEMAN_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#241f1a', H: '#3d352c',
      d: '#5f8f7a', D: '#487060', g: '#e8e2d2',
      p: '#3a3a44', f: '#2a2620'
    }
  },

  shantanu: {
    id: 'shantanu',
    name: 'Shantanu',
    era: 'college \u00b7 and most of what came after',
    note: 'Met in the first week. Orders the biryani, every time.',
    top: SHANTANU_TOP,
    legs: still(SHANTANU_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#231d19', H: '#3d332b',
      d: '#3f6f9c', D: '#2f5578', p: '#33384a', f: '#241f1a'
    }
  },

  akash: {
    id: 'akash',
    name: 'Akash',
    era: 'college \u00b7 the incubator cell',
    note: 'Cap on backwards, glasses, and the good chair in the lab.',
    top: AKASH_TOP,
    legs: still(AKASH_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#241f1a', H: '#3d352c',
      a: '#c8402f', d: '#4f7a52', D: '#3c6040',
      p: '#3a3f4e', f: '#2a2620'
    }
  },

  counter: {
    id: 'counter',
    name: 'At the counter',
    era: 'college \u00b7 the fried chicken place',
    note: 'Red cap, red apron, and asks what you want before you reach the till.',
    top: COUNTER_TOP,
    legs: still(COUNTER_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2620', H: '#4a423a',
      a: '#c8402f', d: '#c8402f', D: '#a33225', g: '#f4f1ea',
      p: '#3a3a44', f: '#2a2620'
    }
  },

  cafeman: {
    id: 'cafeman',
    name: 'Cafeteria',
    era: 'college \u00b7 the cafeteria',
    note: 'Keeps the chocolate cake at the near end of the counter on purpose.',
    top: CAFEMAN_TOP,
    legs: still(CAFEMAN_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2620', H: '#4a423a',
      d: '#4a5f7a', D: '#374a60', g: '#e8e2d2',
      p: '#3a3a44', f: '#2a2620'
    }
  },

  classmateA: {
    id: 'classmateA',
    name: 'Someone from the year',
    era: 'college \u00b7 the first morning',
    note: 'A face off a screen, with the rest of a person attached to it.',
    top: CLASSMATE_A_TOP,
    legs: still(CLASSMATE_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2e2321', H: '#4a3a34',
      d: '#c2699a', D: '#a04d7c', p: '#3a4152', f: '#2a2620'
    }
  },

  classmateB: {
    id: 'classmateB',
    name: 'Someone else from the year',
    era: 'college \u00b7 the first morning',
    note: 'Striped shirt. Waved at absolutely everybody that day.',
    top: CLASSMATE_B_TOP,
    legs: still(CLASSMATE_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#241f1a', H: '#3d352c',
      d: '#e0dbcf', D: '#4f6f9c', p: '#3a3a44', f: '#2a2620'
    }
  },

  moodlefriend: {
    id: 'moodlefriend',
    name: 'Friend from Moodle',
    era: 'college \u00b7 the incubator cell',
    note: 'Friend from the incubator cell. Hears everything before anyone else does.',
    top: MFRIEND_TOP,
    legs: still(MFRIEND_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2118', H: '#453729',
      d: '#5a6f4a', D: '#44553a', g: '#e0dbcf',
      p: '#3a3f4e', f: '#2a2620'
    }
  },

  incubhead: {
    id: 'incubhead',
    name: 'Head of the incubator',
    era: 'college \u00b7 the auditorium',
    note: 'Grey, glasses, and a reputation. Turned out to like the project.',
    top: HEAD_TOP,
    legs: still(HEAD_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#8e8a84', H: '#a8a49e',
      a: '#8a7a3a', d: '#3a4152', D: '#2b3040', g: '#e8e4da',
      p: '#2b3040', f: '#1f2333'
    }
  },

  juiceman: {
    id: 'juiceman',
    name: 'Juice corner',
    era: 'college \u00b7 the road outside the gate',
    note: 'Mosambi, watermelon, anything. Gave her the ice for free and asked no questions.',
    top: JUICEMAN_TOP,
    legs: still(JUICEMAN_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#241f1a', H: '#3d352c',
      d: '#e8dfc8', D: '#c9bfa4', g: '#5f9a3d',
      p: '#3a3a44', f: '#2a2620'
    }
  },

  goodfriend: {
    id: 'goodfriend',
    name: 'A good friend',
    era: 'college \u00b7 the back row',
    note: 'Sat with them in the dark and could not keep his voice down.',
    top: GOODFRIEND_TOP,
    legs: still(GOODFRIEND_LEGS_IDLE),
    palette: {
      ...BASE,
      h: '#2b2620', H: '#463c31',
      d: '#8a6fb5', D: '#6d5594', p: '#33384a', f: '#2a2620'
    }
  },

  noida: {
    id: 'noida',
    name: 'Ayrisha, first day',
    era: 'noida \u00b7 the first morning of the job',
    note: 'Bucket hat, crop top, jeans, and the sunglasses stay on.',
    top: NOIDA_TOP,
    legs: NOIDA_LEGS,
    palette: {
      ...BASE,
      d: '#f2f0ea', D: '#d8d5cc',
      a: '#2b2733', A: '#3d3849',          // the hat, and its brim
      g: '#17141c', G: '#5a5266', w: '#cfe0ee',   // lens, frame, and the glint
      p: '#3f5a86', f: '#f4f1ea'
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
