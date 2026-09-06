/* ------------------------------------------------------------------
   Game shell: chapters, scene flow, and world rendering.

   A chapter is one level: some opening cards, one or more playable
   acts, an ending scene, and some closing cards. Adding a level means
   adding an entry to CHAPTERS, not touching the flow code.
------------------------------------------------------------------- */

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const hudAct = document.getElementById('hud-act');
const muteBtn = document.getElementById('mute');
const hudCollect = document.getElementById('hud-collect');
const noteEl = document.getElementById('note');
const levelCard = document.getElementById('levelcard');
const fadeEl = document.getElementById('fade');
const artEl = document.getElementById('artboard');
const pianoEl = document.getElementById('piano');
const harmEl = document.getElementById('harmonium');
const physEl = document.getElementById('physics');
const testEl = document.getElementById('testpaper');
const jigEl = document.getElementById('jigsaw');
const codeEl = document.getElementById('codeboard');
const trayEl = document.getElementById('tray');
const fpsEl = document.getElementById('fps');
const mooEl = document.getElementById('moodle');
const mcEl = document.getElementById('blocks');
const catEl = document.getElementById('catboard');

/* The real cover, for the moment she is given it. */
const BOOK_IMG = new Image();
BOOK_IMG.src = 'assets/images/painting-nature.jpg';

/* ============================ THE SCRIPT ==========================
   All the words in one place, so they are easy to rewrite.
   Nothing here asserts a detail we do not actually know.
------------------------------------------------------------------ */
const SCRIPT = {
  /* Level 1 */
  l1act1:     [{ who: 'Krishna ji', char: 'krishna', text: 'Let\u2019s take Papa to the hospital.' }],
  l1act1done: [{ who: 'Krishna ji', char: 'krishna', text: 'Act 1 complete.' }],
  l1act2:     [{ who: 'Krishna ji', char: 'krishna',
                 text: 'Let\u2019s take Mumma to the hospital. Be gentle \u2014 ' +
                       'she cannot walk fast.' }],
  /* Nothing here: reaching the hospital just fades into the birth. */
  l1act2done: [],
  /* Said after the birth has actually played, not before it. */
  l1done:     [{ who: 'Krishna ji', char: 'krishna', text: 'Ayrisha was born.' },
               { who: 'Krishna ji', char: 'krishna', text: 'Our kuchupuchu precious bacha.', sweet: true },
               { who: 'Krishna ji', char: 'krishna', text: 'Level 1 complete.' }],

  /* Level 2 */
  l2done1:    [{ text: 'You made it to the class!' }],
  l2done:     [{ text: 'Have a great day at school.', sweet: true }],

  /* Level 3 */
  l3done:     [{ who: 'Krishna ji', char: 'krishna', text: 'Level 3 complete.' }],

  /* Level 4 */
  l4guide:    [{ who: 'Krishna ji', char: 'krishna',
                 text: 'Hey little Ayrisha, let\u2019s go to the music classes.' }],
  l4done:     [{ who: 'Krishna ji', char: 'krishna', text: 'Level 4 complete.' }],

  /* The growing-up interlude */
  growEnd:    [],

  /* Level 5 */
  l5guide: [{ who: 'Krishna ji', char: 'krishna',
              text: 'My child, all the best.', sweet: true }],
  l5test:  [{ text: 'Sunday. The test.' }],
  l5welldone: [{ who: 'Physics sir', char: 'physicsteacher', text: 'You did well.' }],

  l5done:  [{ who: 'Krishna ji', char: 'krishna', text: 'Level 5 complete.' }],

  /* Level 6 */
  l6guide: [{ who: 'Krishna ji', char: 'krishna',
              text: 'Four years. Go and have a good time.', sweet: true }],
  l6done:  [{ who: 'Krishna ji', char: 'krishna', text: 'Level 6 complete.' }],

  /* Level 7. Krishna ji does not come to this one. */
  l7go: [
    { who: 'Friend from Moodle', char: 'moodlefriend',
      text: 'Hey, let\u2019s go. Today is our presentation in front of the ' +
            'head of the incubator cell.' },
    { who: 'Ayrisha', char: 'teen', text: 'Yes, come on. Let\u2019s go.' },
    { who: 'Friend from Moodle', char: 'moodlefriend',
      text: 'I have heard the head of the incubator is a little rude.' },
    { who: 'Ayrisha', char: 'teen',
      text: 'Yeah, we will handle it. Let\u2019s go.' }
  ],
  l7done:  [{ text: 'Level 7 complete.' }],

  /* Level 8 */
  l8walk:  [{ text: 'Out of the gate, and the same road back she took every evening.' }],
  l8mine:  [{ who: 'Ayrisha', char: 'teen', text: 'Right. Let\u2019s play Minecraft.' }],
  l8done:  [{ text: 'Level 8 complete.' }],

  /* Level 9 */
  l9walk:  [{ text: 'She has never once got down this road in under twenty minutes.' }],
  l9tree:  [{ text: 'Something is yowling, four branches up.' }],
  l9go: [
    { who: 'Shantanu', char: 'shantanu', text: 'Was that you up a tree?' },
    { who: 'Ayrisha', char: 'teen', text: 'It was the cat up the tree.' },
    { who: 'Shantanu', char: 'shantanu', text: 'Right. Let\u2019s go to KFC.' },
    { who: 'Ayrisha', char: 'teen', text: 'Let\u2019s go to KFC.' }
  ],
  l9done:  [{ text: 'Level 9 complete.' }],

  /* Level 10 */
  l10walk: [{ text: 'A show on at the auditorium that afternoon, and an hour to kill.' }],
  l10done: [{ text: 'Level 10 complete.' }],

  /* Level 11 */
  l11queue: [{ text: 'Everybody in her year, in one corridor, waiting to be called.' }],
  l11done:  [{ text: 'Level 11 complete.' }],

  /* Level 12 */
  l12morning: [{ text: 'Noida. The first morning of it.' }],
  l12done:    []
};

/* ============================= CHAPTERS =========================== */
const CHILD_TUNING  = { maxSpeed: 1.7,  accel: 0.36, jumpV: -5.6, w: 8 };
const PAPA_TUNING   = { maxSpeed: 2.15, accel: 0.5,  jumpV: -7.4, w: 10 };
const TEEN_TUNING   = { maxSpeed: 1.95, accel: 0.42, jumpV: -6.4, w: 9 };
const MUMMA_TUNING  = { maxSpeed: 1.35, accel: 0.3,  friction: 0.28, jumpV: -4.9, w: 11 };

const CHAPTERS = [
  {
    id: 'level1',
    number: 1,
    title: 'Bangalore',
    subtitle: '6th September, 2002',
    blurb: '',
    objectives: [],
    acts: [
      { intro: SCRIPT.l1act1, outro: SCRIPT.l1act1done,
        build: buildAct1, char: 'officer', tuning: PAPA_TUNING,
        music: 'rush', hud: 'PAPA' },
      { intro: SCRIPT.l1act2, outro: SCRIPT.l1act2done,
        build: buildAct2, char: 'mother', tuning: MUMMA_TUNING,
        music: 'careful', hud: 'MUMMA' }
    ],
    ending: 'birth',
    close: SCRIPT.l1done
  },
  {
    id: 'level2',
    number: 2,
    title: "Let's go to school",
    subtitle: '',
    blurb: '',
    objectives: [],
    acts: [
      { intro: [], outro: SCRIPT.l2done1,
        build: buildLevel2, char: 'child', tuning: CHILD_TUNING,
        music: 'morning', hud: 'AYRISHA' }
    ],
    ending: 'classroom',
    close: SCRIPT.l2done
  },
  {
    id: 'level3',
    number: 3,
    title: 'Let\u2019s go see our art tutor',
    subtitle: '',
    blurb: '',
    objectives: [],          // nothing here gives away what she gets
    acts: [
      { intro: [{ who: 'Krishna ji', char: 'krishna',
                  text: 'Let\u2019s catch up with the art tutor.' }],
        outro: [], seamless: true,
        build: buildAct3a, char: 'child', tuning: CHILD_TUNING,
        music: 'afternoon', hud: 'AYRISHA' },
      { intro: [], outro: [], seamless: true,
        build: buildAct3b, char: 'child', tuning: CHILD_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Aunty', char: 'tutor',
            text: 'Hello Ayrisha, I\u2019m glad you made it. How are you?' },
          { who: 'Ayrisha', char: 'child',
            text: 'Hello, good evening. I am good.' },
          { who: 'Aunty', char: 'tutor',
            text: 'Okay, let\u2019s get started with our art classes.' }
        ] },
      { type: 'art', intro: [], outro: [], seamless: true, music: 'indoors' }
    ],
    ending: 'book',
    close: SCRIPT.l3done
  },
  {
    id: 'level4',
    number: 4,
    title: "Let's go to the music class",
    subtitle: '',
    blurb: '',
    objectives: [],
    acts: [
      { intro: SCRIPT.l4guide, outro: [], seamless: true,
        build: buildAct4a, char: 'child', tuning: CHILD_TUNING,
        music: 'morning', hud: 'AYRISHA' },
      { intro: [], outro: [], seamless: true,
        build: buildAct4b, char: 'child', tuning: CHILD_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Teacher', char: 'musicteacher',
            text: 'Ayrisha, hello! How was your school?' },
          { who: 'Ayrisha', char: 'child', text: 'Yeah, my school was good.' },
          { who: 'Teacher', char: 'musicteacher',
            text: 'Okay, let\u2019s start with our piano lessons.' },
          { who: 'Ayrisha', char: 'child', text: 'Yes, let\u2019s go!' }
        ] },
      { type: 'piano', intro: [], outro: [], seamless: true, music: 'indoors' },
      { intro: [], outro: [], seamless: true,
        build: buildAct4c, char: 'child', tuning: CHILD_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Teacher', char: 'musicteacher', text: 'Everyone, bow down.' },
          /* she bows here, and does not stop in time */
          { who: 'Ayrisha', char: 'child', text: 'Namaste, teacher!',
            lock: true, wait: 3000, on() { startPlayerBow(); } },
          { who: 'Ayrisha', char: 'child',
            text: 'Oh! I hit the ground when I bowed down.' },
          { who: 'Teacher', char: 'musicteacher',
            text: 'So cutely you bow down! Gently next time.' },
          { who: 'Teacher', char: 'musicteacher',
            text: 'Now \u2014 let us start the harmonium.' }
        ] },
      { type: 'harmonium', intro: [], outro: [], seamless: true, music: 'indoors' }
    ],
    ending: 'musicdone',
    close: SCRIPT.l4done
  },
  {
    id: 'growing',
    interlude: true,          // no landing page; it just happens
    number: 0,
    title: '',
    subtitle: '', blurb: '', objectives: [],
    acts: [
      { intro: [], outro: SCRIPT.growEnd, seamless: true,
        build: buildGrowing, char: 'child', tuning: CHILD_TUNING,
        autoWalk: true, music: 'afternoon', hud: '' }
    ],
    ending: 'flight',
    close: []
  },
  {
    id: 'level5',
    number: 5,
    /* The flight already showed where she landed, on the boards. The
       card gives nothing else away, least of all what she is here for. */
    title: 'Let\u2019s go to class',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      { intro: SCRIPT.l5guide, outro: [], seamless: true,
        build: buildAct5a, char: 'teen', tuning: TEEN_TUNING,
        music: 'afternoon', hud: 'AYRISHA' },

      { intro: [], outro: [], seamless: true,
        build: buildAct5b, char: 'teen', tuning: TEEN_TUNING,
        music: 'indoors', hud: 'AYRISHA \u00b7 class',
        goalLines: [
          { who: 'Physics sir', char: 'physicsteacher',
            text: 'Good morning. Projectile motion \u2014 open your books.' },
          { who: 'Physics sir', char: 'physicsteacher',
            text: 'Range equals v squared, sine two theta, over g. That is all it is.' },
          { who: 'Physics sir', char: 'physicsteacher',
            text: 'Ayrisha. Come to the board and land three of them.' },
          { who: 'Ayrisha', char: 'teen', text: 'Yes sir.' }
        ] },

      /* sir has the last word on it before she goes back to the hostel */
      { type: 'physics', intro: [], outro: SCRIPT.l5welldone,
        seamless: true, music: 'indoors' },

      { intro: [], outro: [], seamless: true,
        build: buildAct5hostel, char: 'teen', tuning: TEEN_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Anam', char: 'anam', text: 'Hey! Hi! I am Anam!' },
          { who: 'Ayrisha', char: 'teen', text: 'Hello. I am Ayrisha.' },
          { who: 'Anam', char: 'anam',
            text: 'Let us go to Friends Bazar and have a cold coffee.' },
          { who: 'Ayrisha', char: 'teen', text: 'Yes. Let us go.' }
        ] },

      { intro: [], outro: [], seamless: true,
        build: buildAct5c, char: 'teen', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA \u00b7 with Anam',
        goalLines: [
          { who: 'Cold coffee man', char: 'coffeeman',
            text: 'What do you guys want today?' },
          { who: 'Ayrisha', char: 'teen', text: 'Two cold coffees, please.' },
          { who: 'Cold coffee man', char: 'coffeeman',
            text: 'Two big ones. Here you are.',
            on() { giveItem('coldcoffee'); if (mate) mate.carry = 'coldcoffee'; } },
          { who: 'Anam', char: 'anam',
            text: 'This is the best thing that has happened all week.' },
          { who: 'Ayrisha', char: 'teen', text: 'It is Tuesday, Anam.' },
          { who: 'Anam', char: 'anam', text: 'I know.' }
        ] },

      { intro: SCRIPT.l5test, outro: [], seamless: true,
        build: buildAct5d, char: 'teen', tuning: TEEN_TUNING,
        music: 'careful', hud: 'AYRISHA \u00b7 the test',
        goalLines: [
          { text: 'Three hours. Physics, chemistry, maths.' }
        ] },

      { type: 'test', intro: [], outro: [], seamless: true, music: 'careful' },

      /* and outside afterwards, with nothing at all left to do */
      { intro: [], outro: [], seamless: true,
        build: buildAct5out, char: 'teen', tuning: TEEN_TUNING,
        music: 'afternoon', hud: 'AYRISHA \u00b7 with Anam',
        goalLines: [
          { who: 'Ayrisha', char: 'teen', text: 'That is it. That was the last one.' },
          { who: 'Anam', char: 'anam', text: 'Today we get to sleep a little.' },
          { who: 'Ayrisha', char: 'teen', text: 'A little. Yes.' }
        ] },

      /* the way home: a train out, and then a flight */
      { type: 'scene', scene: 'trainaway', intro: [], outro: [], seamless: true },
      { type: 'scene', scene: 'flighthome', intro: [], outro: [], seamless: true },

      /* home: her own street, and then her own front door */
      { intro: [], outro: [], seamless: true,
        build: buildAct5home, char: 'teen', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA',
        goalLines: [{ text: 'Home. The same door, the same everything.' }] },

      /* her room, and a box on the floor she has not opened in two years */
      { intro: [], outro: [], seamless: true,
        build: buildAct5room, char: 'teen', tuning: TEEN_TUNING,
        music: 'lullaby', hud: 'AYRISHA \u00b7 her room',
        goalLines: [
          { text: 'Her room, exactly as she left it.' },
          { who: 'Ayrisha', char: 'teen',
            text: 'A box I have not opened in two years.' },
          { who: 'Ayrisha', char: 'teen', text: 'Let\u2019s solve a puzzle.',
            on() { if (level && level.meta.box) level.meta.box.open = true; } }
        ] },

      { type: 'jigsaw', intro: [], outro: [], seamless: true,
        music: 'lullaby' },

      /* the dining table, Papa, and the last word */
      { type: 'scene', scene: 'diningtable', intro: [], outro: [], seamless: true }
    ],
    ending: 'flightcollege',
    close: SCRIPT.l5done
  },
  {
    id: 'level6',
    number: 6,
    title: 'Let\u2019s go to college',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      /* it started in her bedroom, and stayed there for months */
      { type: 'scene', scene: 'onlinecollege', intro: SCRIPT.l6guide,
        outro: [], seamless: true },

      /* and then a morning when the gate was open, and Shantanu */
      { intro: [], outro: [], seamless: true,
        build: buildAct6a, char: 'teen', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA',
        goalLines: [
          { who: 'Shantanu', char: 'shantanu',
            text: 'Hey! We finally met in person.' },
          { who: 'Ayrisha', char: 'teen',
            text: 'Yes! It is so nice to meet you in person.' },
          { who: 'Shantanu', char: 'shantanu',
            text: 'Cafeteria? I have not eaten anything I did not make in a year.' },
          { who: 'Ayrisha', char: 'teen', text: 'Let\u2019s go.' }
        ] },

      /* the cafeteria, and a chocolate cake */
      { intro: [], outro: [], seamless: true,
        build: buildAct6cafe, char: 'teen', tuning: TEEN_TUNING,
        music: 'indoors', hud: 'AYRISHA \u00b7 with Shantanu',
        goalLines: [
          { who: 'Cafeteria', char: 'cafeman', text: 'Yes? What will it be?' },
          { who: 'Ayrisha', char: 'teen',
            text: 'One chocolate cake, please.' },
          { who: 'Cafeteria', char: 'cafeman', text: 'Good choice. Here.',
            on() { giveItem('choccake'); } },
          { text: 'She ate it with her hands, and got most of it on them.',
            on() { carried = ['chocfingers']; } },
          { who: 'Shantanu', char: 'shantanu', text: 'Show your hands.' },
          { text: 'She held them up.' },
          { who: 'Shantanu', char: 'shantanu', text: 'Your hands look so cute.' },
          /* she does not say anything for a moment */
          { text: '\u2026' },
          { who: 'Ayrisha', char: 'teen', text: 'Thank you.' }
        ] },

      /* out of the cafeteria, and the third of them */
      { intro: [], outro: [], seamless: true,
        build: buildAct6akash, char: 'teen', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA \u00b7 with Shantanu',
        goalLines: [
          { text: 'And then everybody else, all morning, all the way down.' }
        ] }
    ],
    ending: null,
    close: SCRIPT.l6done
  },
  {
    id: 'level7',
    number: 7,
    title: 'Incubation',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      /* the incubator cell, and her friend already in it */
      { intro: [], outro: [], seamless: true,
        build: buildAct7cell, char: 'teen', tuning: TEEN_TUNING,
        music: 'indoors', hud: 'AYRISHA \u00b7 the cell',
        goalLines: [
          { who: 'Ayrisha', char: 'teen', text: 'This one is free. Let\u2019s start.' }
        ] },

      /* and when it is built, he comes to fetch her */
      { type: 'moodle', intro: [], outro: SCRIPT.l7go,
        seamless: true, music: 'indoors' },

      /* out, across, and in through the doors, together */
      { intro: [], outro: [], seamless: true,
        build: buildAct7audi, char: 'teen', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA \u00b7 with a friend',
        goalLines: [
          { text: 'They went in.' }
        ] },

      /* and presented it */
      { type: 'scene', scene: 'presentation', intro: [], outro: [],
        seamless: true }
    ],
    ending: null,
    close: SCRIPT.l7done
  },
  {
    id: 'level8',
    number: 8,
    title: 'Let\u2019s play some games today',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      /* college to the hostel */
      { intro: SCRIPT.l8walk, outro: [], seamless: true,
        build: buildAct8walk, char: 'teen', tuning: TEEN_TUNING,
        music: 'afternoon', hud: 'AYRISHA' },

      /* her room, and the machine at the end of it */
      { intro: [], outro: [], seamless: true,
        build: buildAct8room, char: 'teen', tuning: TEEN_TUNING,
        music: 'indoors', hud: 'AYRISHA \u00b7 her room',
        goalLines: [
          { who: 'Ayrisha', char: 'teen', text: 'Let\u2019s play some games today.' }
        ] },

      /* one, and then the other */
      { type: 'fps', intro: [], outro: SCRIPT.l8mine,
        seamless: true, music: 'careful' },
      { type: 'blocks', intro: [], outro: [], seamless: true, music: 'lullaby' },

      /* and then somebody knocks */
      { type: 'scene', scene: 'biryaninight', intro: [], outro: [],
        seamless: true }
    ],
    ending: null,
    close: SCRIPT.l8done
  },
  {
    id: 'level9',
    number: 9,
    title: 'The cats',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      /* down the road, stopping for every one of them */
      { intro: SCRIPT.l9walk, outro: [], seamless: true,
        build: buildAct9street, char: 'teen', tuning: TEEN_TUNING,
        music: 'afternoon', hud: 'AYRISHA',
        goalLines: SCRIPT.l9tree },

      { type: 'cat', intro: [], outro: SCRIPT.l9go,
        seamless: true, music: 'morning' },

      /* and down to the end of the road, the two of them */
      { intro: [], outro: [], seamless: true,
        build: buildAct9kfc, char: 'teen', tuning: TEEN_TUNING,
        music: 'afternoon', hud: 'AYRISHA \u00b7 with Shantanu',
        goalLines: [
          { text: 'They went in.' }
        ] }
    ],
    ending: null,
    close: SCRIPT.l9done
  },
  {
    id: 'level10',
    number: 10,
    title: 'An hour to kill',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      /* down the road to the juice corner, the two of them */
      { intro: SCRIPT.l10walk, outro: [], seamless: true,
        build: buildAct10juice, char: 'teen', tuning: TEEN_TUNING,
        music: 'afternoon', hud: 'AYRISHA \u00b7 with Shantanu',
        goalLines: [
          { who: 'Juice corner', char: 'juiceman',
            text: 'Juice? Mosambi, watermelon, anything you want.' },
          { who: 'Ayrisha', char: 'teen', text: 'Just ice, actually. A cup of ice.' },
          { who: 'Juice corner', char: 'juiceman', text: 'Only ice?' },
          { who: 'Ayrisha', char: 'teen', text: 'Only ice.' },
          { who: 'Juice corner', char: 'juiceman', text: 'Take it, take it.',
            on() { giveItem('ice'); } },
          /* Neither of them asks. Both of them packed it. */
          { text: 'She took the bottle out of her bag. The vodka was ' +
                  'already in it.' },
          { text: 'The ice went in on top.', on() { carried = ['bottle']; } },
          { who: 'Shantanu', char: 'shantanu', text: 'Right. Auditorium.' }
        ] },

      /* and along to the auditorium */
      { intro: [], outro: [], seamless: true,
        build: buildAct10audi, char: 'teen', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA \u00b7 with Shantanu',
        goalLines: [
          { text: 'They went in and sat as far back as the room allowed.' }
        ] },

      { type: 'scene', scene: 'backrow', intro: [], outro: [], seamless: true }
    ],
    ending: null,
    close: SCRIPT.l10done
  },
  {
    id: 'level11',
    number: 11,
    title: 'Four years, and then a room',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      /* the years, coming off a calendar */
      { type: 'scene', scene: 'calendar', intro: [], outro: [], seamless: true },

      /* the corridor, and the room at the end of it */
      { intro: SCRIPT.l11queue, outro: [], seamless: true,
        build: buildAct11interview, char: 'teen', tuning: TEEN_TUNING,
        music: 'careful', hud: 'AYRISHA \u00b7 the interview',
        goalLines: [
          { who: 'Interviewer', char: 'physicsteacher',
            text: 'Sit down. One problem, and talk me through it as you go.' },
          { who: 'Ayrisha', char: 'teen', text: 'Yes.' }
        ] },

      { type: 'code', task: 'interview', intro: [], outro: [],
        seamless: true, music: 'careful' },

      /* and then the poppers */
      { type: 'scene', scene: 'congrats', intro: [], outro: [], seamless: true },

      /* and that is the chapter */
      { type: 'scene', scene: 'chapterend', intro: [], outro: [], seamless: true }
    ],
    ending: null,
    close: SCRIPT.l11done
  },
  {
    id: 'level12',
    number: 12,
    title: 'The first morning',
    subtitle: '',
    blurb: '', objectives: [],
    acts: [
      /* north, and this time she is not coming back for a while */
      { type: 'scene', scene: 'flightnoida', intro: [], outro: [], seamless: true },

      /* out of the society and into the cab */
      { intro: SCRIPT.l12morning, outro: [], seamless: true,
        build: buildAct12society, char: 'noida', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA',
        goalLines: [
          { text: 'The cab was already waiting.' }
        ] },

      { type: 'scene', scene: 'cabride', intro: [], outro: [], seamless: true },

      /* out of it, coffee, and in through the doors */
      { intro: [], outro: [], seamless: true,
        build: buildAct12office, char: 'noida', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA \u00b7 first day',
        goalLines: [
          { text: 'And she walked in.' }
        ] },

      { type: 'scene', scene: 'adventure', intro: [], outro: [], seamless: true }
    ],
    ending: null,
    close: SCRIPT.l12done
  }
];

/* ============================== STATE ============================= */
let state = 'story';          // 'story' | 'play' | 'ending' | 'end'
let level = null;
let player = null;
let cam = null;
let spawnX = 0;
let chapterIdx = 0;
let actIdx = 0;
let ending = null;
let endingT = 0;
let endingDone = false;
/* true while an ENDINGS scene is being used as a mid-level cutscene */
let sceneAct = false;
let bookGiven = false;
let musicDone = false;
let kotaDone = false;
const dinner = { done: false, rising: false, up: 0, krishnaOn: false, krishna: 0 };
let onlineDone = false;
let presentDone = false;
const present = { beat: 0 };
let biryaniDone = false;
const night8 = { phase: 'knock' };
let backDone = false;
const back10 = { laugh: 0 };
const cal = { flying: [], at: 0, next: 0 };
let congratsDone = false;
const pop = { t: 0, bits: [] };
const chap = { done: false, adult: false, phase: 'year', pt: 0, t: 0, on: false };
let advDone = false;
const adv = { on: 0, card: 0 };
let bookT = 0;
let skyline = [];
let rain = [];

/* --------------------------- GROWING UP --------------------------
   She changes sprite mid-stride. Her feet stay where they are and the
   extra height goes upward, so it reads as growing rather than as a
   swap.
------------------------------------------------------------------ */
let growFlash = 0;
/* Frames the world stands still for, so a moment gets to play out
   instead of being walked straight through. */
let holdT = 0;
/* A landmark she stops in front of. The sign is the whole point, so she
   waits there until the player takes her on. */
let paused = null;

/* She grows twice: into the teenager on the walk out of childhood, and
   into the adult at her graduation. Both are Krishna ji's doing. */
function growUp(into) {
  player.char = CHARACTERS[into || 'teen'];
  player.h = frameHeight(player.char, 'idle');
  growFlash = 1;
  Sound.play('checkpoint');
}

/* The screen dims under her first, so the light has something to read
   against: on a bright afternoon sky a glow alone is nearly invisible.
   Drawn before she is, then the light itself is drawn over her. */
function drawGrowDim() {
  if (!player || !cam) return;
  const dim = Math.max(growFlash, magicDim());
  if (dim <= 0.01) return;
  ctx.save();
  ctx.fillStyle = `rgba(22,17,36,${0.55 * dim})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const x = player.x - cam.x, y = player.y - cam.y - player.h / 2;
  if (growFlash <= 0.01) { ctx.restore(); return; }
  const g = ctx.createRadialGradient(x, y, 2, x, y, 44);
  g.addColorStop(0, `rgba(255,244,196,${0.75 * growFlash})`);
  g.addColorStop(0.5, `rgba(255,214,120,${0.30 * growFlash})`);
  g.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 50, y - 50, 100, 100);
  ctx.restore();
}

function drawGrowFlash() {
  if (growFlash <= 0.01) return;
  growFlash *= 0.967;
  if (!player || !cam) return;
  const x = player.x - cam.x, y = player.y - cam.y - player.h / 2;
  const t = performance.now() / 1000;
  const grew = 1 - growFlash;                 // how far through the beat
  ctx.save();

  // a hot core right on her, so she is lit from inside the dimmed scene
  ctx.globalCompositeOperation = 'lighter';
  const core = ctx.createRadialGradient(x, y, 1, x, y, 26);
  core.addColorStop(0, `rgba(255,252,236,${0.85 * growFlash})`);
  core.addColorStop(1, 'rgba(255,236,170,0)');
  ctx.fillStyle = core;
  ctx.fillRect(x - 30, y - 34, 60, 68);
  ctx.globalCompositeOperation = 'source-over';

  // a ring opening outward, so the change reads as something happening
  ctx.globalAlpha = growFlash * 0.9;
  ctx.strokeStyle = '#fff6cf';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 6 + grew * 46, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = growFlash * 0.45;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, 6 + grew * 70, 0, Math.PI * 2); ctx.stroke();

  // and specks of light lifting off her
  for (let i = 0; i < 14; i++) {
    const a = t * 1.6 + i * 0.45;
    const rr = 8 + grew * 30 + (i % 3) * 6;
    ctx.globalAlpha = growFlash * (0.45 + 0.45 * Math.sin(t * 3 + i));
    ctx.fillStyle = i % 3 ? '#fff0b8' : '#ffd7e6';
    ctx.fillRect(Math.round(x + Math.cos(a) * rr),
                 Math.round(y + Math.sin(a) * rr * 0.8 - grew * 14), 2, 2);
  }
  ctx.restore();
}

/* ========================= SCRIPTED WALKS ========================
   Some beats are hers to play out rather than the player's to walk.
   `script` is a list of steps run in order; she walks herself between
   the places they name and the player is not in charge until it ends.

     { to: <tile>, ... }   walk there first
     { say: [lines] }      a caption, which plays itself
     { sleep: <seconds> }  she is asleep: the room dims, and Zzz
     { alarm: true }       the clock goes off and wakes her
------------------------------------------------------------------ */
const script = { on: false, steps: null, at: 0, waiting: false };
const sleepState = { on: false, t: 0, until: 0 };
const alarmState = { t: 0 };
/* The sun coming up outside, washing the room warm. */
const dawnState = { on: false, t: 0, until: 0 };

function startScript(steps) {
  script.on = true;
  script.steps = steps;
  script.at = -1;
  script.waiting = false;
  sleepState.on = false;
  nextScriptStep();
}

function nextScriptStep() {
  script.at++;
  script.waiting = false;
  const st = script.steps && script.steps[script.at];
  if (!st) { script.on = false; sleepState.on = false; return; }

  if (st.sleep) {
    sleepState.on = true;
    sleepState.t = 0;
    sleepState.until = st.sleep;
  } else if (!st.stayAsleep) {
    sleepState.on = false;
  }

  if (st.dawn) { dawnState.on = true; dawnState.t = 0; dawnState.until = st.dawn; }

  if (st.alarm) { alarmState.t = 1; Sound.play('alarm'); }
}

/* A step speaks on arrival, never on departure: saying it first sent
   the caption and the whole step past her while she was still standing
   at the last place. Speaking does not advance the step either, so a
   step can say something and then go on to sleep through it. */
function speakStep(st) {
  if (!st.say || st.said) return false;
  st.said = true;
  script.waiting = true;
  narrate(st.say, () => {
    script.waiting = false;
    if (st.sleep) sleepState.t = 0;      // the beat comes after the line
    if (st.dawn) dawnState.t = 0;
  });
  return true;
}

function updateScript(dt) {
  if (!script.on || !player) return true;
  const st = script.steps[script.at];
  if (!st) { script.on = false; return false; }

  if (sleepState.on) sleepState.t += dt / 60;
  if (dawnState.on) dawnState.t += dt / 60;
  if (alarmState.t > 0) alarmState.t -= dt / 90;

  if (script.waiting) { player.vx = 0; player.anim = 'idle'; return true; }

  /* Walk to where the step happens, if it names somewhere. */
  if (st.to != null) {
    const target = st.to * TILE;
    const d = target - player.x;
    if (Math.abs(d) > 2) {
      player.facing = d > 0 ? 1 : -1;
      controlActor(player, level, dt, d > 0 ? 1 : -1);
      return true;
    }
    player.x = target;
    player.vx = 0;
    player.anim = 'idle';
    st.to = null;                    // arrived: do not walk it again
  }
  if (speakStep(st)) return true;

  if (st.sleep) {
    player.anim = 'idle';
    player.vx = 0;
    if (sleepState.t < sleepState.until) return true;
  }
  if (st.dawn && dawnState.t < dawnState.until) { player.vx = 0; return true; }

  nextScriptStep();
  return true;
}

/* She is asleep: the room goes down, and three slow Zzz go up. */
function drawSleep() {
  if (!sleepState.on || !player || !cam) return;
  const fade = Math.min(1, sleepState.t * 2);
  ctx.save();
  ctx.fillStyle = `rgba(18,15,32,${0.5 * fade})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const x = Math.round(player.x - cam.x) + 9;
  const y = Math.round(player.y - cam.y) - player.h - 2;
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  for (let i = 0; i < 3; i++) {
    const p = ((sleepState.t * 0.55 + i * 0.34) % 1);
    ctx.globalAlpha = fade * Math.sin(p * Math.PI) * 0.9;
    ctx.fillStyle = '#cfd6f0';
    ctx.fillText('z', x + p * 12, y - p * 18);
  }
  ctx.restore();
}

/* Morning, coming up outside and getting into the room. Held once it
   has arrived: the rest of the day happens in daylight. */
function drawDawn() {
  if (!dawnState.on) return;
  const p = Math.min(1, dawnState.t / Math.max(0.01, dawnState.until));
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, VIEW_W, VIEW_H);
  g.addColorStop(0, `rgba(255,214,150,${0.36 * p})`);
  g.addColorStop(0.6, `rgba(255,228,180,${0.16 * p})`);
  g.addColorStop(1, `rgba(255,240,210,${0.06 * p})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // and a shaft of it coming through the doorway
  ctx.globalAlpha = 0.22 * p;
  ctx.fillStyle = '#fff0c8';
  ctx.beginPath();
  ctx.moveTo(VIEW_W, 20); ctx.lineTo(VIEW_W, 96);
  ctx.lineTo(VIEW_W - 150, VIEW_H); ctx.lineTo(VIEW_W - 62, VIEW_H);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* The alarm going off, over the whole room. */
function drawAlarm() {
  if (alarmState.t <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alarmState.t) * 0.28 * (Math.sin(alarmState.t * 34) > 0 ? 1 : 0.3);
  ctx.fillStyle = '#ffd9a0';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.restore();
}

/* ========================== A COMPANION =========================
   Somebody walking the level with her. She keeps a step behind and
   stops when Ayrisha stops, so it reads as the two of them going
   somewhere together rather than an NPC being dragged along.
------------------------------------------------------------------ */
let mate = null;

function startCompanion(charName, tuning) {
  mate = new Actor(charName, player.x - 26, player.y, tuning);
  mate.auto = false;
  mate.carry = null;
}

function updateCompanion(dt) {
  if (!mate || !player || !level) return;
  const want = player.x - 24 * (player.facing < 0 ? -1 : 1);
  const d = want - mate.x;
  const dir = Math.abs(d) < 6 ? 0 : (d > 0 ? 1 : -1);

  /* She has to get over what Ayrisha gets over. Look at the tile she is
     about to walk into and the one she would land on, and jump for a
     wall in the way, a hole to clear, or a ledge Ayrisha is up on. */
  if (dir !== 0 && mate.onGround) {
    const solid = (px, py) =>
      level.isSolid(Math.floor(px / TILE), Math.floor(py / TILE));
    const ahead = mate.x + dir * (mate.w / 2 + 7);
    const blocked = solid(ahead, mate.y - 6) || solid(ahead, mate.y - 14);
    const hole = !solid(ahead + dir * 6, mate.y + 4) &&
                 !solid(ahead + dir * 6, mate.y + 20);
    const ledge = player.y < mate.y - 10 && Math.abs(d) < 60;
    if (blocked || hole || ledge) { mate.jump = true; mate.holdJump = true; }
  }
  if (mate.vy > 0) mate.holdJump = false;      // let go at the top

  controlActor(mate, level, dt, dir);
  if (!dir) { mate.vx *= 0.6; }

  /* And a safety net. Falling down a hole or getting hopelessly stuck
     should never strand her: she catches up off screen instead. */
  const behind = Math.abs(player.x - mate.x) > VIEW_W * 0.75;
  if (mate.y > level.pxH + 20 || behind) {
    mate.x = player.x - 24 * (player.facing < 0 ? -1 : 1);
    mate.y = player.y;
    mate.vx = 0;
    mate.vy = 0;
  }
}

function drawCompanion() {
  if (!mate || !cam) return;
  drawActor(ctx, mate, cam);
  if (mate.carry) {
    const sx = Math.round(mate.x - cam.x);
    const sy = Math.round(mate.y - cam.y);
    const f = mate.facing < 0 ? -1 : 1;
    CARRY_ITEMS[mate.carry] && CARRY_ITEMS[mate.carry](sx + f * 8, sy - 8);
  }
}

/* ========================== THE CHANGING =========================
   Krishna ji walks into the world beside her, tells her what she has
   done, then takes out a peacock feather, steps in, and touches her
   head with it. That is what turns the child into the teenager.

   It runs in phases rather than off one clock, because the talking
   waits for the player and everything else does not:

     in      he fades in beside her, the world dims
     talk    three lines, advanced with ENTER
     raise   he steps closer, the feather comes out and reaches her
     after   the touch lands, she changes, the light goes out of it
     out     he fades away and the daylight comes back
------------------------------------------------------------------ */
const MAGIC_IN = 1.5, MAGIC_RAISE = 2.2, MAGIC_AFTER = 2.0, MAGIC_OUT = 1.8;
const MAGIC_FAR = -46, MAGIC_NEAR = -26;    // where he stands, before and after

const MAGIC_LINES = [
  { who: 'Krishna ji', char: 'krishna',
    text: 'Hey little girl. You have grown up so much.' },
  { who: 'Krishna ji', char: 'krishna',
    text: 'You studied so well, and you got a music degree also.' }
];

/* t is a free-running clock for the aura and the petals and never
   stops; pt is time inside the current phase. */
const magic = { on: false, t: 0, pt: 0, phase: 'off', into: 'teen', lines: null };

function magicPhase(name) { magic.phase = name; magic.pt = 0; }

function startMagic(opts = {}) {
  magic.on = true;
  magic.t = 0;
  magic.into = opts.into || 'teen';
  magic.lines = opts.lines || MAGIC_LINES;
  magicPhase('in');
  dropFocus();
  Sound.play('confirm');
}

function updateMagic(dt) {
  if (!magic.on) return;
  magic.t += dt / 60;
  if (magic.phase === 'talk') return;      // that one ends when he does
  magic.pt += dt / 60;

  if (magic.phase === 'in' && magic.pt >= MAGIC_IN) {
    magicPhase('talk');
    Dialogue.start(magic.lines, () => magicPhase('raise'), { pos: 'bottomright' });
  } else if (magic.phase === 'raise' && magic.pt >= MAGIC_RAISE) {
    magicPhase('after');
    growUp(magic.into);                    // the feather has reached her
  } else if (magic.phase === 'after' && magic.pt >= MAGIC_AFTER) {
    magicPhase('out');
  } else if (magic.phase === 'out' && magic.pt >= MAGIC_OUT) {
    magic.on = false;
    magicPhase('off');
  }
}

/* How dark the world goes: up as he arrives, held while he is here,
   and let go as he leaves. */
function magicDim() {
  if (!magic.on) return 0;
  if (magic.phase === 'in') return Math.min(1, magic.pt / MAGIC_IN);
  if (magic.phase === 'out') return Math.max(0, 1 - magic.pt / MAGIC_OUT);
  return 1;
}

/* A peacock feather: a thin stem with the eye at the tip. */
function drawFeather(x0, y0, x1, y1, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.strokeStyle = '#7a9a5c';                    // stem
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();

  // the barbs, thickening toward the eye
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len, ny = dx / len;
  ctx.strokeStyle = 'rgba(122,154,92,.7)';
  for (let i = 2; i < 10; i++) {
    const f = i / 11, w = 1 + f * 4.5;
    const bx = x0 + dx * f, by = y0 + dy * f;
    ctx.beginPath();
    ctx.moveTo(bx - nx * w, by - ny * w);
    ctx.lineTo(bx + nx * w, by + ny * w);
    ctx.stroke();
  }

  // the eye
  ctx.fillStyle = '#1f5a3f';
  ctx.beginPath(); ctx.ellipse(x1, y1, 6, 4.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3f8f6a';
  ctx.beginPath(); ctx.ellipse(x1, y1, 4.6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a5a9c';
  ctx.beginPath(); ctx.ellipse(x1, y1, 3, 2.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9a227';
  ctx.beginPath(); ctx.ellipse(x1, y1, 1.6, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f6e3a8';
  ctx.fillRect(Math.round(x1) - 1, Math.round(y1) - 1, 1, 1);
  ctx.restore();
}

function drawMagic() {
  if (!magic.on || !player || !cam) return;
  const t = magic.t, fade = magicDim();
  const base = Math.round(player.y - cam.y);
  const px = Math.round(player.x - cam.x);

  /* He stands to her left, facing the way she walks, so he is looking
     at her. On the raise he steps in close enough to reach her. */
  const step = magic.phase === 'in' || magic.phase === 'talk' ? 0
             : magic.phase === 'raise' ? Math.min(1, magic.pt / (MAGIC_RAISE * 0.55))
             : 1;
  const kx = Math.round(px + MAGIC_FAR + (MAGIC_NEAR - MAGIC_FAR) * step);
  const rise = magic.phase === 'in' ? (1 - Math.min(1, magic.pt / MAGIC_IN)) * 10 : 0;
  const ky = base + rise;

  ctx.save();
  ctx.globalAlpha = fade;

  const char = CHARACTERS.krishna;
  const h = frameHeight(char, 'idle');
  const cy = ky - h / 2;

  const glow = ctx.createRadialGradient(kx, cy, 4, kx, cy, 58);
  glow.addColorStop(0, 'rgba(255,236,170,.60)');
  glow.addColorStop(0.45, 'rgba(255,214,120,.22)');
  glow.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(kx - 66, cy - 66, 132, 132);
  ctx.strokeStyle = `rgba(255,229,150,${0.32 * fade})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(kx, cy, 32 + Math.sin(t * 1.2) * 2, 0, Math.PI * 2);
  ctx.stroke();

  drawCharacter(ctx, char, 'idle', 1, kx, ky, 0);

  for (let i = 0; i < 10; i++) {                  // petals, as when he narrates
    const a = t * 0.7 + i * 0.63;
    const r = 30 + (i % 4) * 8;
    ctx.globalAlpha = fade * (0.25 + 0.3 * Math.sin(t * 2.4 + i));
    ctx.fillStyle = i % 3 ? '#ffe9a8' : '#f6c9d8';
    ctx.fillRect(Math.round(kx + Math.cos(a) * r),
                 Math.round(cy + Math.sin(a) * r * 0.7), 2, 2);
  }
  ctx.restore();
}

/* Drawn after she is, because a feather resting on the top of her head
   is in front of her hair, not behind it. */
function drawMagicFeather() {
  if (!magic.on || !player || !cam) return;
  if (magic.phase !== 'raise' && magic.phase !== 'after') return;
  const t = magic.t, fade = magicDim();
  const base = Math.round(player.y - cam.y);
  const px = Math.round(player.x - cam.x);
  const step = magic.phase === 'raise'
    ? Math.min(1, magic.pt / (MAGIC_RAISE * 0.55)) : 1;
  const kx = Math.round(px + MAGIC_FAR + (MAGIC_NEAR - MAGIC_FAR) * step);
  const ky = base;

  /* He holds it up first, then brings it down onto the top of her
     head. It keeps its full length throughout and swings rather than
     growing, or it reads as a spark instead of a thing he is holding. */
  {
    const grip = { x: kx + 9, y: ky - 17 };
    const up = { x: grip.x + 5, y: grip.y - 21 };            // held up
    const head = { x: px - 2, y: base - player.h + 1 };      // her head
    let reach, alpha = fade;
    if (magic.phase === 'raise') {
      const p = Math.min(1, magic.pt / MAGIC_RAISE);
      reach = p * p * (3 - 2 * p);                           // eases in, settles
    } else {
      reach = 1;
      alpha = fade * Math.max(0, 1 - magic.pt / MAGIC_AFTER);
    }
    const tipX = up.x + (head.x - up.x) * reach;
    const tipY = up.y + (head.y - up.y) * reach;

    // the light at the tip goes down first, so the eye stays on top of it
    ctx.save();
    ctx.globalAlpha = alpha * (0.35 + 0.65 * reach);
    const g = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 4 + reach * 7);
    g.addColorStop(0, 'rgba(255,252,232,.85)');
    g.addColorStop(1, 'rgba(255,226,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(tipX - 14, tipY - 14, 28, 28);
    ctx.restore();

    drawFeather(grip.x, grip.y, tipX, tipY, alpha);

    ctx.save();
    for (let i = 0; i < 8; i++) {
      const a = t * 2.2 + i * 0.79;
      const r = 5 + reach * 9;
      ctx.globalAlpha = alpha * (0.3 + 0.5 * Math.sin(t * 3.4 + i)) * reach;
      ctx.fillStyle = i % 2 ? '#fff0b8' : '#ffd7e6';
      ctx.fillRect(Math.round(tipX + Math.cos(a) * r),
                   Math.round(tipY + Math.sin(a) * r * 0.8), 1, 1);
    }
    ctx.restore();
  }
}

/* ======================= WHAT SHE CARRIES =========================
   Something she is given goes into her hands and stays there, so a
   gift is seen rather than described. Drawn over her, and mirrored
   with her, so it always sits on the hand nearest the camera.
------------------------------------------------------------------ */
let carried = [];

function giveItem(name) {
  if (!carried.includes(name)) carried.push(name);
  Sound.play('pickup');
}

function dropCarried() { carried = []; }

/* She is 22 pixels tall, so these have to stay small enough to read as
   things in her hands rather than things she is standing behind. They
   sit at hand height and get the same dark outline the sprites do. */
const CARRY_OUTLINE = '#241b26';

function outlined(x, y, w, h, fill) {
  ctx.fillStyle = CARRY_OUTLINE;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

/* A blackcurrant cone in the leading hand. */
function drawCone(cx, base) {
  ctx.fillStyle = CARRY_OUTLINE;
  ctx.beginPath();
  ctx.moveTo(cx - 4, base - 7); ctx.lineTo(cx + 4, base - 7);
  ctx.lineTo(cx, base + 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c9a05f';
  ctx.beginPath();
  ctx.moveTo(cx - 3, base - 6); ctx.lineTo(cx + 3, base - 6);
  ctx.lineTo(cx, base); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ab8146';
  ctx.fillRect(cx - 2, base - 4, 4, 1);

  ctx.fillStyle = CARRY_OUTLINE;                 // the scoop
  ctx.beginPath(); ctx.arc(cx, base - 8, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b3f8f';
  ctx.beginPath(); ctx.arc(cx, base - 8, 2.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9a63c0';
  ctx.fillRect(cx - 2, base - 10, 2, 1);
}

/* One paper bag in the other hand. The bag is kraft brown so the pale
   cake and the golden puff read against it instead of merging into one
   slab, and it hangs beside her rather than across her. */
function drawBakeryBag(cx, base, hasPuff, hasCake) {
  if (hasPuff) {
    outlined(cx - 3, base - 9, 3, 4, '#d8a860');
    ctx.fillStyle = '#b8813f';
    ctx.fillRect(cx - 3, base - 8, 3, 1);
  }
  if (hasCake) {
    outlined(cx + 1, base - 10, 3, 5, '#f3e6cf');
    ctx.fillStyle = '#7c4f34';
    ctx.fillRect(cx + 1, base - 9, 2, 1);
    ctx.fillRect(cx + 2, base - 7, 2, 1);
  }
  outlined(cx - 3, base - 5, 7, 6, '#bf9a6a');     // the bag
  ctx.fillStyle = '#a37f52';
  ctx.fillRect(cx - 3, base - 5, 7, 1);
  ctx.fillRect(cx, base - 4, 1, 5);
}

/* The degree, rolled and tied with a ribbon, carried at her side. It
   hangs vertically in the leading hand: laid across her chest it sat
   over her face, and the whole point is that you can still see her. */
function drawDegree(cx, base) {
  outlined(cx - 2, base - 9, 4, 9, '#f6f1e2');
  ctx.fillStyle = '#e3dbc4';
  ctx.fillRect(cx + 1, base - 9, 1, 9);
  outlined(cx - 3, base - 10, 6, 2, '#e8e0c8');    // the rolled ends
  outlined(cx - 3, base - 1, 6, 2, '#e8e0c8');
  ctx.fillStyle = '#c8402f';                       // ribbon
  ctx.fillRect(cx - 2, base - 6, 4, 2);
  ctx.fillStyle = '#a03226';
  ctx.fillRect(cx - 2, base - 4, 4, 1);
}

/* A tall glass of cold coffee, the way the stall serves it. */
function drawColdCoffee(cx, base) {
  outlined(cx - 3, base - 11, 7, 12, '#e8e4da');     // the glass
  ctx.fillStyle = '#6b4a33';                          // the coffee
  ctx.fillRect(cx - 3, base - 8, 7, 9);
  ctx.fillStyle = '#8a6547';
  ctx.fillRect(cx - 3, base - 8, 7, 1);
  ctx.fillStyle = '#f7f2e2';                          // the froth on top
  ctx.fillRect(cx - 3, base - 11, 7, 3);
  ctx.fillStyle = '#c8402f';                          // and a straw
  ctx.fillRect(cx + 1, base - 16, 2, 6);
}

/* A slice of chocolate cake, on a paper plate. */
function drawChocCake(cx, base) {
  outlined(cx - 5, base - 2, 11, 2, '#e8e4da');       // the plate
  outlined(cx - 4, base - 9, 9, 7, '#4a2c1e');        // the slice
  ctx.fillStyle = '#6b4230';
  ctx.fillRect(cx - 4, base - 7, 9, 1);
  ctx.fillRect(cx - 4, base - 4, 9, 1);
  ctx.fillStyle = '#331e14';                          // the icing on top
  ctx.fillRect(cx - 4, base - 10, 9, 2);
  ctx.fillStyle = '#c8506a';                          // and a cherry
  ctx.fillRect(cx, base - 12, 2, 2);
}

/* What is left on her fingers afterwards. Not held: worn. */
function drawChocFingers() {
  const sx = Math.round(player.x - cam.x);
  const sy = Math.round(player.y - cam.y);
  const f = player.facing < 0 ? -1 : 1;
  const bob = Math.round(Math.sin(player.animTime * 7) * 0.8);
  ctx.fillStyle = '#3d2418';
  for (const dx of [-6, 6]) {
    ctx.fillRect(sx + dx * f, sy - 7 + bob, 2, 2);
    ctx.fillRect(sx + dx * f + (dx > 0 ? 1 : -1), sy - 5 + bob, 1, 1);
  }
  ctx.fillStyle = '#5a3722';
  ctx.fillRect(sx - 2, sy - 13 + bob, 2, 1);          // and a bit on her chin
}

/* A paper cup with ice in it, from the churn on the cart. */
function drawIceCup(cx, base) {
  outlined(cx - 4, base - 11, 9, 12, '#f2eee4');
  ctx.fillStyle = '#dcd6c8';
  ctx.fillRect(cx - 4, base - 11, 9, 2);
  ctx.fillStyle = '#cfe4ef';                          // the ice
  ctx.fillRect(cx - 3, base - 13, 3, 3);
  ctx.fillRect(cx + 1, base - 14, 3, 3);
  ctx.fillRect(cx - 1, base - 11, 3, 3);
  ctx.fillStyle = '#eaf6fb';
  ctx.fillRect(cx - 3, base - 13, 1, 1);
  ctx.fillRect(cx + 1, base - 14, 1, 1);
}

/* Her water bottle. Clear, with ice knocking about in the bottom of it
   and, as everyone works out about four seconds later, not water. */
function drawBottle(cx, base) {
  outlined(cx - 3, base - 17, 7, 17, 'rgba(214,232,240,.75)');
  ctx.fillStyle = 'rgba(240,250,255,.55)';
  ctx.fillRect(cx - 3, base - 17, 2, 17);             // the highlight down it
  outlined(cx - 2, base - 21, 5, 4, '#b8c4d0');       // the neck
  ctx.fillStyle = '#4aa8d8';                          // the cap
  ctx.fillRect(cx - 3, base - 24, 7, 3);
  ctx.fillStyle = '#cfe4ef';                          // and the ice in it
  ctx.fillRect(cx - 2, base - 6, 3, 3);
  ctx.fillRect(cx + 1, base - 9, 2, 2);
  ctx.fillStyle = '#eaf6fb';
  ctx.fillRect(cx - 2, base - 6, 1, 1);
}

/* A takeaway cup with a lid, from the place on the corner. */
function drawCoffeeCup(cx, base) {
  outlined(cx - 3, base - 11, 7, 11, '#f2eee4');
  ctx.fillStyle = '#d8cfbe';
  ctx.fillRect(cx - 3, base - 6, 7, 1);
  ctx.fillStyle = '#6b4a33';                          // the sleeve
  ctx.fillRect(cx - 3, base - 8, 7, 4);
  outlined(cx - 4, base - 14, 9, 3, '#3a3040');       // the lid
  ctx.fillStyle = '#5a4c62';
  ctx.fillRect(cx + 1, base - 15, 2, 1);
}

/* Anything anyone can be handed, by name. */
const CARRY_ITEMS = {
  blackcurrant: drawCone,
  marblecake:   (x, y) => drawBakeryBag(x, y, false, true),
  puff:         (x, y) => drawBakeryBag(x, y, true, false),
  degree:       drawDegree,
  coldcoffee:   drawColdCoffee,
  choccake:     drawChocCake,
  ice:          drawIceCup,
  bottle:       drawBottle,
  coffeecup:    drawCoffeeCup
};

function drawCarried() {
  if (!carried.length || !player || !cam || pbow.on) return;
  const sx = Math.round(player.x - cam.x);
  const sy = Math.round(player.y - cam.y);
  const f = player.facing < 0 ? -1 : 1;
  const bob = Math.round(Math.sin(player.animTime * 7) * 0.8);
  const hand = sy - 8 + bob;

  const puff = carried.includes('puff');
  const cake = carried.includes('marblecake');
  if (puff || cake) drawBakeryBag(sx - f * 10, hand + 3, puff, cake);
  if (carried.includes('blackcurrant')) drawCone(sx + f * 8, hand);
  if (carried.includes('degree')) drawDegree(sx + f * 10, hand + 4);
  if (carried.includes('coldcoffee')) drawColdCoffee(sx + f * 9, hand + 2);
  if (carried.includes('choccake')) drawChocCake(sx + f * 9, hand + 4);
  if (carried.includes('ice')) drawIceCup(sx + f * 9, hand + 3);
  if (carried.includes('bottle')) drawBottle(sx + f * 9, hand + 6);
  if (carried.includes('coffeecup')) drawCoffeeCup(sx + f * 10, hand + 4);
  if (carried.includes('chocfingers')) drawChocFingers();
}

/* ============================ THE BOW =============================
   She folds forward from the feet and puts her head in the floor. It
   happens in the room she is standing in rather than in a cutaway.
------------------------------------------------------------------ */
const pbow = { on: false, t: 0, hit: false };

function startPlayerBow() {
  pbow.on = true;
  pbow.t = 0;
  pbow.hit = false;
}

function drawPlayer() {
  if (!pbow.on) { drawActor(ctx, player, cam); return; }

  pbow.t += 1 / 60;
  const bend = Math.min(1, pbow.t / 0.5);
  const back = pbow.t > 2.0 ? Math.min(1, (pbow.t - 2.0) / 0.6) : 0;
  const angle = (bend - back) * 1.42;      // ~81 degrees, forward

  const sx = Math.round(player.x - cam.x);
  const sy = Math.round(player.y - cam.y);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angle);
  drawCharacter(ctx, player.char, 'idle', 1, 0, 0, 0);
  ctx.restore();

  if (pbow.t > 0.5 && pbow.t < 1.4) {
    if (!pbow.hit) { pbow.hit = true; Sound.play('land'); }
    const p = Math.min(1, (pbow.t - 0.5) / 0.6);
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = '#ffcf4d';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = -0.3 - i * 0.45;
      const r0 = 7 + p * 8, r1 = 16 + p * 14;
      ctx.beginPath();
      ctx.moveTo(sx + 24 + Math.cos(a) * r0, sy - 7 + Math.sin(a) * r0);
      ctx.lineTo(sx + 24 + Math.cos(a) * r1, sy - 7 + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (back >= 1) pbow.on = false;
}

/* ============================== GUIDE =============================
   Krishna ji appears at the start of a level to say what it is about.

   He is drawn at the centre of the screen rather than beside the
   player: he is a vision, not a companion walking along. Unlike the
   between-scene captions this waits for the player - ENTER moves it
   on, because it is being said to her.
------------------------------------------------------------------ */
const guide = { on: false, t: 0, fade: 0 };

function showGuide(lines, after) {
  dropFocus();
  guide.on = true;
  guide.t = 0;
  guide.fade = 0;
  Dialogue.start(lines, () => { guide.on = false; if (after) after(); },
                 { pos: 'bottomright' });
}

function drawGuide(dt) {
  if (!guide.on && guide.fade <= 0) return;
  if (!level || !cam || ending) return;
  guide.t += dt / 60;
  guide.fade += ((guide.on ? 1 : 0) - guide.fade) * 0.07;
  if (guide.fade < 0.01) return;

  const char = CHARACTERS.krishna;
  const h = frameHeight(char, 'idle');
  const x = Math.round(VIEW_W / 2);
  // standing on the ground, centre of the screen — not hovering.
  // During an ending there is no camera, so fall back to the floor line.
  const y = Math.round(GROUND_Y * TILE - cam.y);
  const rise = (1 - guide.fade) * 10;   // steps into place as he appears

  ctx.save();
  ctx.globalAlpha = guide.fade;
  ctx.translate(0, rise);

  // the whole screen dims a little so he reads as a vision
  ctx.fillStyle = `rgba(20,16,34,${0.34 * guide.fade})`;
  ctx.fillRect(-VIEW_W, -VIEW_H, VIEW_W * 3, VIEW_H * 3);

  // aura
  const cy = y - h / 2;
  const glow = ctx.createRadialGradient(x, cy, 4, x, cy, 62);
  glow.addColorStop(0, 'rgba(255,236,170,.55)');
  glow.addColorStop(0.45, 'rgba(255,214,120,.20)');
  glow.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 70, cy - 70, 140, 140);

  // a slow ring of light behind him
  ctx.strokeStyle = `rgba(255,229,150,${0.30 * guide.fade})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, cy, 34 + Math.sin(guide.t * 1.2) * 2, 0, Math.PI * 2);
  ctx.stroke();

  drawCharacter(ctx, char, 'idle', 1, x, y, 0);

  // petals drifting around him
  for (let i = 0; i < 10; i++) {
    const a = guide.t * 0.7 + i * 0.63;
    const r = 30 + (i % 4) * 8;
    ctx.globalAlpha = guide.fade * (0.25 + 0.3 * Math.sin(guide.t * 2.4 + i));
    ctx.fillStyle = i % 3 ? '#ffe9a8' : '#f6c9d8';
    ctx.fillRect(Math.round(x + Math.cos(a) * r),
                 Math.round(cy + Math.sin(a) * r * 0.7), 2, 2);
  }
  ctx.restore();
}

/* ============================ NARRATION ===========================
   Between-scene text is spoken over the world in the dialogue box
   rather than on a card that stops the game. Lines play themselves,
   timed to their length, so a transition never waits on a keypress.

   Any control that still holds keyboard focus would steal ENTER, so
   focus is dropped whenever the game takes the screen back.
------------------------------------------------------------------ */
function dropFocus() {
  const el = document.activeElement;
  if (el && el !== document.body && typeof el.blur === 'function') el.blur();
}

/* Long enough to read without dawdling. */
function readingTime(text) {
  return Math.max(1500, Math.min(4200, 900 + text.length * 55));
}

/* A line with a speaker is delivered by them; a line without one is a
   caption that plays itself.

   Only Krishna ji gets the guide treatment, because `drawGuide` draws
   Krishna ji and nobody else: anyone else speaking through it used to
   appear in the box with his vision behind them. */
function say(lines, after) {
  if (!lines || !lines.length) { if (after) after(); return; }
  if (lines[0].char === 'krishna') showGuide(lines, after);
  else if (lines[0].who) {
    dropFocus();
    Dialogue.start(lines, after, { pos: 'bottomright' });
  } else narrate(lines, after);
}

function narrate(lines, after) {
  dropFocus();
  if (!lines || !lines.length) { if (after) after(); return; }
  Dialogue.start(lines.map(l => ({
    ...l,
    lock: true,
    wait: l.wait || readingTime(l.text)
  })), after);
}

/* ============================== FADE ==============================
   Scenes inside a level hand over through a fade, not a card, so a
   level reads as one continuous stretch rather than a sequence.
------------------------------------------------------------------ */
function fadeThrough(mid, after) {
  fadeEl.classList.add('on');
  setTimeout(() => {
    mid();
    setTimeout(() => {
      fadeEl.classList.remove('on');
      after && after();
    }, 60);
  }, 470);
}

/* ========================== LEVEL LANDING =========================
   Every level opens on its own page: what it is called, what it is
   about, what you actually have to do, and a START button.
------------------------------------------------------------------ */
function showLevelCard(ch) {
  state = 'levelcard';
  hideBoards();
  hudAct.textContent = '';
  hudCollect.textContent = '';
  levelCard.querySelector('.lc-num').textContent = `LEVEL ${ch.number}`;
  levelCard.querySelector('.lc-title').textContent = ch.title;
  const sub = levelCard.querySelector('.lc-sub');
  const blurb = levelCard.querySelector('.lc-blurb');
  const obj = levelCard.querySelector('.lc-obj');
  sub.textContent = ch.subtitle || '';
  blurb.textContent = ch.blurb || '';
  sub.hidden = !ch.subtitle;
  blurb.hidden = !ch.blurb;
  obj.hidden = !(ch.objectives && ch.objectives.length);
  levelCard.querySelector('.lc-list').innerHTML =
    (ch.objectives || []).map(o => `<li>${o}</li>`).join('');
  levelCard.classList.remove('hidden');
}

function beginLevel() {
  if (state !== 'levelcard') return;
  Sound.unlock();
  Sound.play('confirm');
  levelCard.classList.add('hidden');
  const ch = CHAPTERS[chapterIdx];
  // music from the START press, so the game is never silent
  if (ch.acts[0].music) Sound.playMusic(ch.acts[0].music);
  startCurrentAct();
}

/* ============================= CHAPTERS =========================== */
function startChapter(i) {
  chapterIdx = i;
  actIdx = 0;
  ending = null;
  sceneAct = false;
  level = null;
  guide.on = false;
  guide.fade = 0;
  pbow.on = false;
  Sound.stopMusic();
  const ch = CHAPTERS[i];
  if (ch.interlude) {
    // it skips the landing page, so it has to dismiss it itself
    levelCard.classList.add('hidden');
    Sound.unlock();
    if (ch.acts[0].music) Sound.playMusic(ch.acts[0].music);
    startCurrentAct();
    return;
  }
  showLevelCard(ch);
}

/* Every mini-game is a DOM board over the canvas that owns the input
   until it says it is done, so they all start the same way. */
const MINIGAMES = {
  art:       { hud: 'AYRISHA \u00b7 paint it in',   el: () => artEl,
               run: (el, done) => Art.build(el, done) },
  piano:     { hud: 'AYRISHA \u00b7 piano lesson',  el: () => pianoEl,
               run: (el, done) => Piano.build(el, done) },
  harmonium: { hud: 'AYRISHA \u00b7 harmonium',     el: () => harmEl,
               run: (el, done) => Harmonium.build(el, done) },
  physics:   { hud: 'AYRISHA \u00b7 physics class', el: () => physEl,
               run: (el, done) => Physics.build(el, done) },
  test:      { hud: 'AYRISHA \u00b7 the test',      el: () => testEl,
               run: (el, done) => TestPaper.build(el, done) },
  jigsaw:    { hud: 'AYRISHA \u00b7 the puzzle',    el: () => jigEl,
               run: (el, done) => Jigsaw.build(el, done) },
  code:      { hud: 'AYRISHA \u00b7 the project',   el: () => codeEl,
               run: (el, done, a) => CodeBoard.build(el, done, a.task) },
  tray:      { hud: 'AYRISHA \u00b7 the order',     el: () => trayEl,
               run: (el, done) => Tray.build(el, done) },
  fps:       { hud: 'AYRISHA \u00b7 the range',     el: () => fpsEl,
               run: (el, done) => Fps.build(el, done) },
  moodle:    { hud: 'AYRISHA \u00b7 the Moodle',    el: () => mooEl,
               run: (el, done) => Moodle.build(el, done) },
  blocks:    { hud: 'AYRISHA \u00b7 blocks',        el: () => mcEl,
               run: (el, done) => Minecraft.build(el, done) },
  cat:       { hud: 'AYRISHA \u00b7 the cat',       el: () => catEl,
               run: (el, done) => Cat.build(el, done) }
};

const boards = () => [artEl, pianoEl, harmEl, physEl, testEl, jigEl,
                      codeEl, trayEl, fpsEl, mooEl, mcEl, catEl];
function hideBoards() { for (const b of boards()) b.classList.add('hidden'); }

function startCurrentAct(skipIntro) {
  const a = CHAPTERS[chapterIdx].acts[actIdx];
  if (!a) { startEnding(); return; }        // ran off the end of the acts

  const mg = MINIGAMES[a.type];
  if (mg) {
    level = null;
    player = null;
    hudAct.textContent = a.hud || mg.hud;
    hudCollect.textContent = '';
    if (a.music) Sound.playMusic(a.music);
    /* A board can have a line before it, the way a scene does. */
    const open = () => {
      const el = mg.el();
      for (const b of boards()) b.classList.toggle('hidden', b !== el);
      mg.run(el, () => {
        el.classList.add('hidden');
        state = 'transition';
        finishAct();
      }, a);
      state = 'art';
    };
    if (!skipIntro && a.intro && a.intro.length) {
      state = 'transition';
      hideBoards();
      say(a.intro, open);
    } else open();
    return;
  }

  /* A cutscene in the middle of a level: the same machinery an ending
     uses, but it hands back to the next act instead of the next level. */
  if (a.type === 'scene') {
    level = null;
    player = null;
    hideBoards();
    hudAct.textContent = '';
    hudCollect.textContent = '';
    /* Like a board, a scene can have a line spoken before it opens. */
    const roll = () => {
      ending = ENDINGS[a.scene];
      endingT = 0;
      endingDone = false;
      sceneAct = true;
      dropFocus();
      if (ending.music) Sound.playMusic(ending.music);
      if (ending.enter) ending.enter();
      state = 'ending';
    };
    if (!skipIntro && a.intro && a.intro.length) {
      state = 'transition';
      say(a.intro, roll);
    } else roll();
    return;
  }

  hideBoards();
  level = a.build();
  player = new Actor(a.char, 40, GROUND_Y * TILE, a.tuning);
  player.auto = !!a.autoWalk;
  carried = (level.meta.startCarry || []).slice();
  holdT = 0;
  paused = null;
  magic.on = false;
  script.on = false;
  sleepState.on = false;
  dawnState.on = false;
  alarmState.t = 0;
  mate = null;
  spawnX = player.x;
  cam = new Camera(level);
  cam.x = 0;
  if (level.meta.companion) {
    startCompanion(level.meta.companion.char, level.meta.companion.tuning);
    mate.quiet = true;                 // one set of footsteps is enough
    if (level.meta.companion.carry) mate.carry = level.meta.companion.carry;
  }
  buildBackdrop(level);
  hudAct.textContent = a.hud;
  updateCollectHud();
  Sound.playMusic(a.music);
  state = 'play';
  if (!skipIntro) say(a.intro);
}

function finishAct() {
  const ch = CHAPTERS[chapterIdx];
  const a = ch.acts[actIdx];
  const last = actIdx === ch.acts.length - 1;
  if (!a.type) Sound.play('clear');

  const next = last ? startEnding : () => { actIdx++; startCurrentAct(); };
  // speak the closing line over the scene it belongs to, then fade
  say(a.outro, () => fadeThrough(next));
}

function startEnding() {
  musicDone = false;
  kotaDone = false;
  sceneAct = false;
  dinner.done = dinner.rising = dinner.krishnaOn = false;
  dinner.up = dinner.krishna = 0;
  const ch = CHAPTERS[chapterIdx];
  // an interlude has no ending scene: say its last line and move on
  if (!ch.ending) {
    say(ch.close, () => fadeThrough(nextChapter));
    return;
  }
  ending = ENDINGS[ch.ending];
  endingT = 0;
  endingDone = false;
  dropFocus();
  hudAct.textContent = '';
  hudCollect.textContent = '';
  state = 'ending';
  if (ending.music) Sound.playMusic(ending.music);
  if (ending.enter) ending.enter();
}

function nextChapter() {
  if (chapterIdx < CHAPTERS.length - 1) {
    startChapter(chapterIdx + 1);
  } else {
    hudAct.textContent = 'TO BE CONTINUED';
    hudCollect.textContent = '';
    state = 'end';
  }
}

function respawn() {
  Sound.play('hurt');
  const cps = level.meta.checkpoints.filter(c => c * TILE < player.x);
  player.x = cps.length ? cps[cps.length - 1] * TILE : spawnX;
  player.y = (GROUND_Y - 1) * TILE;
  player.vx = 0;
  player.vy = 0;
}

/* ============================== ENDINGS ===========================
   Not playable. The moments the player should just watch.
------------------------------------------------------------------ */
/* The country under the flight: a city that thins out into open, flat
   land. Built once, so it does not shimmer from one frame to the next. */
const FLIGHT_LAND = (() => {
  const items = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let wx = 0; wx < 1040; wx += 6 + Math.floor(rnd() * 9)) {
    const density = wx < 250 ? 1 : wx < 430 ? 0.45 : 0.14;
    if (rnd() > density) continue;
    const tall = wx < 250;
    items.push({ x: wx, w: 4 + Math.floor(rnd() * 6),
                 h: 3 + Math.floor(rnd() * (tall ? 13 : 5)) });
  }
  return items;
})();

/* One flight scene, from one board to another. The country slides past
   underneath while the aeroplane holds its place, and the ground goes
   from the colour of where she left to the colour of where she lands. */
function makeFlight(from, to, opts = {}) {
  const green = opts.green || [104, 128, 82, 78, 100, 62];
  const sand  = opts.sand  || [178, 152, 104, 148, 124, 84];
  return {
    music: opts.music || 'morning',
    dur: 11,
    draw(t) {
      const HORIZON = 116;
      const s = t * 62;             // how much country has gone past

      // dawn, because it is an early flight and the sky is the whole shot
      const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
      g.addColorStop(0, '#25335f');
      g.addColorStop(0.5, '#7d7aa4');
      g.addColorStop(1, '#e9a878');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, HORIZON);

      // the last stars, going out as the flight goes on
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 0.5 - t * 0.05)})`;
      for (let i = 0; i < 22; i++) {
        const sx2 = (i * 71) % VIEW_W;
        const sy = (i * 29) % 52;
        ctx.fillRect(sx2, sy, 1, 1);
      }

      // sun coming up on the right
      const sun = ctx.createRadialGradient(272, HORIZON - 12, 4, 272, HORIZON - 12, 46);
      sun.addColorStop(0, 'rgba(255,226,168,.85)');
      sun.addColorStop(1, 'rgba(255,206,140,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(216, HORIZON - 62, 112, 68);
      ctx.fillStyle = '#ffe0a8';
      ctx.beginPath(); ctx.arc(272, HORIZON - 12, 9, 0, Math.PI * 2); ctx.fill();

      // clouds, going past faster than the ground because they are nearer
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 137 - t * 96) % 460 + 460) % 460 - 70;
        const cy = 38 + (i % 3) * 22;
        ctx.fillStyle = `rgba(255,244,232,${0.16 + (i % 3) * 0.07})`;
        ctx.fillRect(cx, cy, 34, 6);
        ctx.fillRect(cx + 8, cy - 4, 20, 5);
        ctx.fillRect(cx + 14, cy + 5, 26, 4);
      }

      // the ground: green at the start, dry and flat by the end
      const k = Math.max(0, Math.min(1, (s - 230) / 400));
      const mix = (i) => Math.round(green[i] + (sand[i] - green[i]) * k);
      const gg = ctx.createLinearGradient(0, HORIZON, 0, VIEW_H);
      gg.addColorStop(0, `rgb(${mix(0)},${mix(1)},${mix(2)})`);
      gg.addColorStop(1, `rgb(${mix(3)},${mix(4)},${mix(5)})`);
      ctx.fillStyle = gg;
      ctx.fillRect(0, HORIZON, VIEW_W, VIEW_H - HORIZON);
      ctx.fillStyle = `rgba(255,240,210,${0.22 + k * 0.1})`;
      ctx.fillRect(0, HORIZON, VIEW_W, 2);

      // buildings, thinning out into scrub
      const gb = HORIZON + 24;
      for (const it of FLIGHT_LAND) {
        const x = Math.round(it.x - s);
        if (x < -14 || x > VIEW_W + 14) continue;
        ctx.fillStyle = it.h > 7 ? '#6a6472' : '#8b7f6a';
        ctx.fillRect(x, gb - it.h, it.w, it.h);
        ctx.fillStyle = 'rgba(255,238,206,.30)';
        ctx.fillRect(x, gb - it.h, it.w, 1);
      }
      ctx.fillStyle = `rgb(${Math.round(mix(3) * 0.9)},${Math.round(mix(4) * 0.94)},${Math.round(mix(5) * 0.93)})`;
      ctx.fillRect(0, gb, VIEW_W, VIEW_H - gb);

      // the two boards: the place she is leaving, the place she lands
      const fx = 210 - s, tx = 742 - s;
      if (from && fx > -90 && fx < VIEW_W + 90)
        signboard(fx, gb + 10, from.length * 9 + 34, from);
      if (to && tx > -90 && tx < VIEW_W + 90)
        signboard(tx, gb + 10, to.length * 9 + 34, to);

      // The aeroplane holds its place while the country goes by, and
      // starts letting down once the far board is in sight.
      const px = 146;
      const py = 58 + Math.sin(t * 1.5) * 2.6 + Math.max(0, (t - 7) * 3.4);

      // its trail, dotted and going soft behind it
      for (let i = 1; i < 16; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.28 - i * 0.017})`;
        ctx.fillRect(px - 34 - i * 9, py + 4 + Math.sin(t * 1.5 - i * 0.3) * 2.6, 5, 2);
      }

      // tail fin, swept back off the tail cone
      ctx.fillStyle = '#c8402f';
      for (let i = 0; i < 9; i++)
        ctx.fillRect(px - 30 + i, py - 9 + i, 3, 10 - i);
      ctx.fillStyle = '#eef1f5';
      ctx.fillRect(px - 24, py, 42, 8);               // fuselage
      ctx.fillRect(px - 29, py + 2, 6, 5);            // tail cone
      ctx.fillRect(px + 17, py + 1, 8, 6);            // nose
      ctx.fillStyle = '#d6dde5';
      ctx.fillRect(px - 24, py + 6, 49, 2);           // underside
      ctx.fillStyle = '#7f93ad';
      ctx.fillRect(px - 13, py + 8, 26, 3);           // wing
      ctx.fillRect(px - 4, py + 10, 12, 2);
      ctx.fillStyle = '#5f7391';
      ctx.fillRect(px - 6, py + 8, 9, 5);             // engine under the wing
      ctx.fillStyle = '#3a4152';
      for (let i = 0; i < 8; i++) ctx.fillRect(px - 19 + i * 5, py + 2, 2, 2);
      ctx.fillStyle = '#9fd0ee';
      ctx.fillRect(px + 15, py + 2, 3, 2);            // the flight deck

      // a little warmth over the whole thing
      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(30,24,52,.30)');
      v.addColorStop(0.45, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  };
}

/* The box it comes in. The name of the shop is on the lid, the way
   every other name in this game is on a board: big enough to read at
   three times scale, which the first one was not.
------------------------------------------------------------------ */
function drawBiryaniBox(cx, base) {
  const W = 52, H = 26, top = base - H;

  // the box, outlined the way the sprites are
  ctx.fillStyle = '#241b26';
  ctx.fillRect(cx - W / 2 - 1, top - 1, W + 2, H + 2);
  ctx.fillStyle = '#c8402f';
  ctx.fillRect(cx - W / 2, top, W, H);
  ctx.fillStyle = '#a83224';
  ctx.fillRect(cx - W / 2, top, W, 3);
  ctx.fillStyle = '#e05a45';
  ctx.fillRect(cx - W / 2, base - 3, W, 3);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4f1ea';
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillText('BEHROUZ', cx, top + 13);
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillStyle = '#f8d8c8';
  ctx.fillText('BIRYANI', cx, top + 22);
  ctx.textAlign = 'left';

  /* Open, with the rice standing up out of it. */
  ctx.fillStyle = '#241b26';
  ctx.beginPath(); ctx.ellipse(cx, top, W / 2 - 1, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e0c184';
  ctx.beginPath(); ctx.ellipse(cx, top - 1, W / 2 - 3, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9a464';
  ctx.beginPath(); ctx.ellipse(cx, top + 2, W / 2 - 3, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a3f2a'; ctx.fillRect(cx - 13, top - 5, 9, 5);
  ctx.fillStyle = '#a8763f'; ctx.fillRect(cx + 3, top - 4, 8, 4);
  ctx.fillStyle = '#3f8f4a'; ctx.fillRect(cx - 3, top - 7, 4, 3);
}

/* One page of a wall calendar: a red header with the year on it, the
   month under that, and a grid of days. `shade` dims a page that has
   already come off, `torn` gives it a ragged top edge. */
function drawPage(x, y, w, h, month, year, shade, torn) {
  ctx.fillStyle = '#241b26';
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = `rgba(248,246,238,${shade})`;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = `rgba(200,64,47,${shade})`;
  ctx.fillRect(x, y, w, 20);
  ctx.textAlign = 'center';
  ctx.fillStyle = `rgba(248,241,234,${shade})`;
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.fillText(String(year), x + w / 2, y + 14);
  if (month) {
    ctx.fillStyle = `rgba(60,50,70,${shade})`;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(month, x + w / 2, y + 36);
  } else {
    // the last page is the year and nothing else
    ctx.fillStyle = `rgba(60,50,70,${shade})`;
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(String(year), x + w / 2, y + 42);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = `rgba(150,150,168,${shade * 0.8})`;
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 7; c++)
      ctx.fillRect(x + 8 + c * 11, y + 46 + r * 9, 7, 6);
  if (torn) {                                  // the ragged edge it left on
    ctx.fillStyle = `rgba(200,64,47,${shade})`;
    for (let i = 0; i < w; i += 6)
      ctx.fillRect(x + i, y - 2, 3, 3);
  }
}

/* A party popper, going off. */
function drawPopper(x, base, dir) {
  ctx.save();
  ctx.translate(x, base - 14);
  ctx.rotate(dir * -0.7);
  ctx.fillStyle = '#241b26';
  ctx.beginPath();
  ctx.moveTo(-6, -8); ctx.lineTo(6, -8); ctx.lineTo(3, 20); ctx.lineTo(-3, 20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c8402f';
  ctx.beginPath();
  ctx.moveTo(-5, -7); ctx.lineTo(5, -7); ctx.lineTo(2, 19); ctx.lineTo(-2, 19);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(-5, 2, 10, 3);
  ctx.fillRect(-4, 10, 8, 3);
  ctx.restore();
}

/* ------------- Krishna ji, at the end of the college years -------
   The same beat as the growing-up walk, but inside a scene, which has
   no player in it: it draws her itself and grows her itself.
------------------------------------------------------------------ */
const CHAP_LINES = [
  { who: 'Krishna ji', char: 'krishna',
    text: 'You have done all of it. Every one of those years.' },
  { who: 'Krishna ji', char: 'krishna', text: 'Bless you, girl.', sweet: true }
];
const CH_IN = 1.4, CH_RAISE = 2.2, CH_AFTER = 2.2, CH_OUT = 1.8;

function startChapMagic() {
  chap.on = true;
  chap.phase = 'in';
  chap.pt = 0;
  chap.t = 0;
  dropFocus();
  Sound.play('confirm');
}

function chapPhase(name) { chap.phase = name; chap.pt = 0; }

function updateChapMagic(dt) {
  if (!chap.on) return;
  chap.t += dt / 60;
  if (chap.phase === 'talk') return;
  chap.pt += dt / 60;

  if (chap.phase === 'in' && chap.pt >= CH_IN) {
    chapPhase('talk');
    Dialogue.start(CHAP_LINES, () => chapPhase('raise'), { pos: 'bottomright' });
  } else if (chap.phase === 'raise' && chap.pt >= CH_RAISE) {
    chapPhase('after');
    chap.adult = true;                     // the feather has reached her
    growFlash = 1;
    Sound.play('checkpoint');
  } else if (chap.phase === 'after' && chap.pt >= CH_AFTER) {
    chapPhase('out');
  } else if (chap.phase === 'out' && chap.pt >= CH_OUT) {
    chap.on = false;
    chap.done = true;
  }
}

function chapDim() {
  if (!chap.on) return 0;
  if (chap.phase === 'in') return Math.min(1, chap.pt / CH_IN);
  if (chap.phase === 'out') return Math.max(0, 1 - chap.pt / CH_OUT);
  return 1;
}

function drawChapMagic(t, px, base) {
  if (!chap.on) return;
  const fade = chapDim();
  const h = frameHeight(CHARACTERS.krishna, 'idle');
  const step = chap.phase === 'in' || chap.phase === 'talk' ? 0
             : chap.phase === 'raise' ? Math.min(1, chap.pt / (CH_RAISE * 0.55))
             : 1;
  const kx = Math.round(px - 46 + 20 * step);
  const ky = base + (chap.phase === 'in' ? (1 - Math.min(1, chap.pt / CH_IN)) * 10 : 0);
  const cy = ky - h / 2;

  ctx.save();
  ctx.fillStyle = `rgba(22,17,36,${0.5 * fade})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = fade;
  const glow = ctx.createRadialGradient(kx, cy, 4, kx, cy, 58);
  glow.addColorStop(0, 'rgba(255,236,170,.60)');
  glow.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(kx - 66, cy - 66, 132, 132);
  drawCharacter(ctx, CHARACTERS.krishna, 'idle', 1, kx, ky, 0);
  for (let i = 0; i < 10; i++) {
    const a = t * 0.7 + i * 0.63;
    const r = 30 + (i % 4) * 8;
    ctx.globalAlpha = fade * (0.25 + 0.3 * Math.sin(t * 2.4 + i));
    ctx.fillStyle = i % 3 ? '#ffe9a8' : '#f6c9d8';
    ctx.fillRect(Math.round(kx + Math.cos(a) * r),
                 Math.round(cy + Math.sin(a) * r * 0.7), 2, 2);
  }
  ctx.restore();

  const who = chap.adult ? CHARACTERS.adult : CHARACTERS.teen;
  drawCharacter(ctx, who, 'idle', 1, px, base, Math.sin(t * 2) > 0 ? 0 : 1);

  if (chap.phase === 'raise' || chap.phase === 'after') {
    const grip = { x: kx + 9, y: ky - 17 };
    const up = { x: grip.x + 5, y: grip.y - 21 };
    const head = { x: px - 2, y: base - frameHeight(who, 'idle') + 1 };
    let reach, alpha = fade;
    if (chap.phase === 'raise') {
      const p = Math.min(1, chap.pt / CH_RAISE);
      reach = p * p * (3 - 2 * p);
    } else {
      reach = 1;
      alpha = fade * Math.max(0, 1 - chap.pt / CH_AFTER);
    }
    const tipX = up.x + (head.x - up.x) * reach;
    const tipY = up.y + (head.y - up.y) * reach;

    ctx.save();
    ctx.globalAlpha = alpha * (0.35 + 0.65 * reach);
    const gg = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 4 + reach * 7);
    gg.addColorStop(0, 'rgba(255,252,232,.85)');
    gg.addColorStop(1, 'rgba(255,226,150,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(tipX - 14, tipY - 14, 28, 28);
    ctx.restore();

    drawFeather(grip.x, grip.y, tipX, tipY, alpha);
  }

  drawGrowFlashAt(px, base - frameHeight(who, 'idle') / 2);
}

/* The burst of light at a place a scene names, rather than at the
   player, who does not exist inside a cutscene. */
function drawGrowFlashAt(x, y) {
  if (growFlash <= 0.01) return;
  growFlash *= 0.967;
  const t = performance.now() / 1000;
  const grew = 1 - growFlash;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const core = ctx.createRadialGradient(x, y, 1, x, y, 30);
  core.addColorStop(0, `rgba(255,252,236,${0.85 * growFlash})`);
  core.addColorStop(1, 'rgba(255,236,170,0)');
  ctx.fillStyle = core;
  ctx.fillRect(x - 34, y - 40, 68, 80);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = growFlash * 0.9;
  ctx.strokeStyle = '#fff6cf';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 6 + grew * 46, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = growFlash * 0.45;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, 6 + grew * 72, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const a = t * 1.6 + i * 0.45;
    const rr = 8 + grew * 32 + (i % 3) * 6;
    ctx.globalAlpha = growFlash * (0.45 + 0.45 * Math.sin(t * 3 + i));
    ctx.fillStyle = i % 3 ? '#fff0b8' : '#ffd7e6';
    ctx.fillRect(Math.round(x + Math.cos(a) * rr),
                 Math.round(y + Math.sin(a) * rr * 0.8 - grew * 14), 2, 2);
  }
  ctx.restore();
}

const ENDINGS = {
  /* --------------------- flights, wherever they go ----------------
     Neither end is named in writing, because there is no writing: the
     boards on the ground below say it, the way every other place in
     this game is named. `makeFlight` is the whole scene; pass it the
     board she leaves from and the board she lands at, and pass null
     for either when that end is not the point. */
  flight: makeFlight('BENGALURU', 'KOTA'),

  /* Coming home the other way: dry country giving way to green. */
  flighthome: makeFlight(null, 'BENGALURU', {
    green: [178, 152, 104, 148, 124, 84],
    sand:  [104, 128, 82, 78, 100, 62]
  }),

  /* And out again, to wherever college turns out to be. */
  /* And out again, for good this time. */
  flightnoida: makeFlight('BENGALURU', 'NOIDA', {
    green: [104, 128, 82, 78, 100, 62],
    sand:  [150, 146, 118, 122, 118, 94]
  }),

  flightcollege: makeFlight('BENGALURU', 'COLLEGE', {
    green: [104, 128, 82, 78, 100, 62],
    sand:  [120, 140, 96, 92, 112, 74]
  }),

  /* ------------------- level 5: the train out ---------------------
     The way out of Kota is a train, and it goes at dusk. She is in one
     of the lit windows. The board on the platform is the only word. */
  trainaway: {
    music: 'careful',
    dur: 9.5,
    enter() { Sound.play('train'); },
    draw(t) {
      const HORIZON = 104, RAIL = 148;
      const s = Math.max(0, (t - 1.2)) * 74;    // it takes a moment to pull away

      const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
      sky.addColorStop(0, '#2b2a52');
      sky.addColorStop(0.55, '#6d5a7e');
      sky.addColorStop(1, '#e0916a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VIEW_W, HORIZON);

      ctx.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 16; i++)
        ctx.fillRect((i * 83) % VIEW_W, (i * 31) % 40, 1, 1);

      // dry country going by, and the low sun behind it
      ctx.fillStyle = '#c47a4e';
      ctx.beginPath(); ctx.arc(250, HORIZON - 6, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8d7355';
      for (let i = 0; i < 30; i++) {
        const x = ((i * 61 - s * 0.45) % 420 + 420) % 420 - 50;
        const h = 6 + (i % 5) * 5;
        ctx.fillRect(x, HORIZON - h, 16, h);
      }
      const gnd = ctx.createLinearGradient(0, HORIZON, 0, RAIL);
      gnd.addColorStop(0, '#9c825e');
      gnd.addColorStop(1, '#7d6748');
      ctx.fillStyle = gnd;
      ctx.fillRect(0, HORIZON, VIEW_W, RAIL - HORIZON);

      // the platform board, going away behind
      const bx = 150 - s;
      if (bx > -90 && bx < VIEW_W + 90) signboard(bx, HORIZON - 30, 90, 'KOTA');

      // the track, with sleepers running past
      ctx.fillStyle = '#5b4b3a';
      ctx.fillRect(0, RAIL, VIEW_W, VIEW_H - RAIL);
      ctx.fillStyle = '#4a3d2f';
      for (let i = 0; i < 40; i++) {
        const x = ((i * 22 - s * 1.6) % 460 + 460) % 460 - 60;
        ctx.fillRect(x, RAIL + 12, 12, 4);
      }
      ctx.fillStyle = '#8b8f96';
      ctx.fillRect(0, RAIL + 8, VIEW_W, 2);
      ctx.fillRect(0, RAIL + 20, VIEW_W, 2);

      /* The carriage, holding its place while the country goes past. */
      const top = RAIL - 54, h = 54;
      ctx.fillStyle = '#2f3f5e';
      ctx.fillRect(-10, top, VIEW_W + 20, h);
      ctx.fillStyle = '#41547a';
      ctx.fillRect(-10, top, VIEW_W + 20, 6);
      ctx.fillStyle = '#233049';
      ctx.fillRect(-10, RAIL - 12, VIEW_W + 20, 12);
      ctx.fillStyle = '#c8a45a';
      ctx.fillRect(-10, top + 30, VIEW_W + 20, 2);

      // lit windows, and her in one of them
      for (let i = 0; i < 6; i++) {
        const wx = 8 + i * 52;
        ctx.fillStyle = '#16203a';
        ctx.fillRect(wx - 2, top + 8, 42, 22);
        ctx.fillStyle = i === 2 ? '#ffe6b4' : '#f0d59a';
        ctx.fillRect(wx, top + 10, 38, 18);
        if (i === 2) {
          ctx.save();
          ctx.beginPath(); ctx.rect(wx, top + 10, 38, 18); ctx.clip();
          drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, wx + 19, top + 40,
                        Math.sin(t * 2.4) > 0 ? 0 : 1);
          ctx.restore();
        }
      }

      // wheels turning under it
      ctx.fillStyle = '#1a2233';
      for (const wx of [40, 78, 232, 270]) {
        ctx.beginPath(); ctx.arc(wx, RAIL + 4, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#4c5a72';
        ctx.lineWidth = 1;
        const a = -s * 0.08;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * 7, RAIL + 4 + Math.sin(a) * 7);
        ctx.lineTo(wx - Math.cos(a) * 7, RAIL + 4 - Math.sin(a) * 7);
        ctx.stroke();
      }

      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(24,18,44,.35)');
      v.addColorStop(0.45, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  },

  /* ------------------ level 5: home, the dining table --------------
     She meant to study at the table and did not last. Papa finds her
     there. Then she gets up, and Krishna ji has the last word. */
  diningtable: {
    music: 'lullaby',
    enter() {
      dinner.done = false;
      dinner.rising = false;
      dinner.krishnaOn = false;
      dinner.up = 0;
      dinner.krishna = 0;
      Dialogue.start([
        { who: 'Papa', char: 'officer',
          text: 'Ayrisha? How are you, beta? How have you been?' },
        { who: 'Ayrisha', char: 'teen',
          text: 'I am good, Papa. I am working hard.' },
        { who: 'Papa', char: 'officer',
          text: 'Do not tire yourself out more. It has been a tough year.' },
        { who: 'Papa', char: 'officer',
          text: 'But you are working hard, and these years will teach ' +
                'you very much.' },
        { who: 'Ayrisha', char: 'teen',
          text: 'Yes, you are right. Thank you, Papa.' }
      ], () => {
        dinner.rising = true;                 // she gets up from the table
        setTimeout(() => {
          dinner.krishnaOn = true;
          Dialogue.start([
            { who: 'Krishna ji', char: 'krishna',
              text: 'You are my favourite child, and you have worked so hard.' },
            { who: 'Krishna ji', char: 'krishna',
              text: 'You are very intelligent. You will do very great in life.' },
            { who: 'Krishna ji', char: 'krishna',
              text: 'Let us go to college now.', sweet: true }
          ], () => { dinner.done = true; });
        }, 1400);
      });
    },
    done() { return dinner.done; },
    draw(t) {
      const FLOOR = 152;

      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#463a52');
      g.addColorStop(1, '#77606f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // a window with the evening outside, and a light over the table
      ctx.fillStyle = '#37304a'; ctx.fillRect(20, 26, 54, 44);
      ctx.fillStyle = '#8d7fa0'; ctx.fillRect(24, 30, 46, 36);
      ctx.fillStyle = '#37304a';
      ctx.fillRect(44, 26, 3, 44); ctx.fillRect(20, 46, 54, 3);

      ctx.fillStyle = '#3a3244'; ctx.fillRect(178, 0, 2, 22);
      ctx.fillStyle = '#f6e3a8';
      ctx.beginPath(); ctx.moveTo(166, 22); ctx.lineTo(192, 22);
      ctx.lineTo(186, 32); ctx.lineTo(172, 32); ctx.closePath(); ctx.fill();
      const lamp = ctx.createRadialGradient(179, 32, 6, 179, 32, 88);
      lamp.addColorStop(0, 'rgba(255,232,170,.30)');
      lamp.addColorStop(1, 'rgba(255,232,170,0)');
      ctx.fillStyle = lamp;
      ctx.fillRect(90, 20, 180, 130);

      ctx.fillStyle = '#5e4d58'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#6e5b67'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      const TT = FLOOR - 30;                   // table top

      /* Her first, then the table over her: she is sitting at the far
         side of it, so the tabletop hides her from the waist down. She
         pivots at the edge of the table, which is what turns a sprite
         standing upright into one with its head down on the wood. */
      if (dinner.rising) dinner.up = Math.min(1, dinner.up + 0.016);
      const slump = (1 - dinner.up) * 1.18;
      ctx.save();
      // nothing of her below the tabletop: she is sitting behind it
      ctx.beginPath(); ctx.rect(0, 0, VIEW_W, TT + 2); ctx.clip();
      ctx.translate(200, TT + 1);
      ctx.rotate(-slump);
      drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 0, 12,
                    dinner.rising ? (Math.sin(t * 2) > 0 ? 0 : 1) : 0);
      ctx.restore();

      // a chair back showing beside her
      ctx.fillStyle = '#6b4630';
      ctx.fillRect(222, TT - 12, 5, 18);

      /* The table. */
      ctx.fillStyle = '#7c5334'; ctx.fillRect(120, TT, 118, 6);
      ctx.fillStyle = '#95693f'; ctx.fillRect(120, TT, 118, 2);
      ctx.fillStyle = '#5f3f28';
      ctx.fillRect(128, TT + 6, 7, 24);
      ctx.fillRect(224, TT + 6, 7, 24);

      // her books, open where she left off
      ctx.fillStyle = '#f2e8d2'; ctx.fillRect(132, TT - 5, 30, 5);
      ctx.fillStyle = '#c8402f'; ctx.fillRect(132, TT - 6, 30, 2);
      ctx.fillStyle = '#dcd2bb'; ctx.fillRect(166, TT - 4, 20, 4);
      ctx.fillStyle = '#3f6f9c'; ctx.fillRect(166, TT - 5, 20, 2);

      // Papa, come to the doorway and then over to her
      const px = 84 + Math.min(1, t / 2.2) * 22;
      drawCharacter(ctx, CHARACTERS.officer, 'idle', 1, px, FLOOR,
                    Math.sin(t * 2) > 0 ? 0 : 1);

      /* And Krishna ji, once Papa has said his piece. */
      if (dinner.krishnaOn) {
        dinner.krishna = Math.min(1, dinner.krishna + 0.02);
        const kx = 270, kh = frameHeight(CHARACTERS.krishna, 'idle');
        const cy = FLOOR - kh / 2;
        ctx.save();
        ctx.globalAlpha = dinner.krishna;
        const glow = ctx.createRadialGradient(kx, cy, 4, kx, cy, 56);
        glow.addColorStop(0, 'rgba(255,236,170,.58)');
        glow.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(kx - 64, cy - 64, 128, 128);
        drawCharacter(ctx, CHARACTERS.krishna, 'idle', 1, kx, FLOOR, 0);
        for (let i = 0; i < 8; i++) {
          const a = t * 0.7 + i * 0.79;
          const r = 26 + (i % 3) * 8;
          ctx.globalAlpha = dinner.krishna * (0.25 + 0.3 * Math.sin(t * 2.4 + i));
          ctx.fillStyle = i % 3 ? '#ffe9a8' : '#f6c9d8';
          ctx.fillRect(Math.round(kx + Math.cos(a) * r),
                       Math.round(cy + Math.sin(a) * r * 0.7), 2, 2);
        }
        ctx.restore();
      }
    }
  },

  /* ---------------- level 6: college, from a bedroom --------------
     It started in her room, in little squares on a screen, and it went
     on like that for months. */
  onlinecollege: {
    music: 'indoors',
    enter() {
      onlineDone = false;
      narrate([
        { text: 'It was covid. Nobody was going anywhere.' },
        { text: 'So college happened on a screen. Every class, every lab, ' +
                'every person in her year, in little squares.' },
        { text: 'And in the evenings they played on the same screen, ' +
                'because that was the only place anyone was.' },
        { text: 'It went on like that for months.' },
        { text: 'And then, one morning, the gates were actually open.' }
      ], () => { onlineDone = true; });
    },
    done() { return onlineDone; },
    draw(t) {
      const FLOOR = 152, DESK = FLOOR - 32;

      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#2b2440');
      g.addColorStop(1, '#4e4360');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // her window, and the morning she is not out in
      ctx.fillStyle = '#241d38'; ctx.fillRect(22, 24, 56, 46);
      ctx.fillStyle = '#7c86ad'; ctx.fillRect(26, 28, 48, 38);
      ctx.fillStyle = '#241d38';
      ctx.fillRect(48, 24, 3, 46); ctx.fillRect(22, 45, 56, 3);

      ctx.fillStyle = '#4a405c'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#584c6c'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      /* Her first, sitting at it, then the desk over her: the desk top
         is what hides everything below her shoulders. */
      ctx.fillStyle = '#3f3550'; ctx.fillRect(118, DESK + 4, 6, 26);   // chair back
      ctx.save();
      // nothing of her below the desk top: she is sitting behind it
      ctx.beginPath(); ctx.rect(0, 0, VIEW_W, DESK + 2); ctx.clip();
      drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 136, DESK + 14,
                    Math.sin(t * 1.6) > 0 ? 0 : 1);
      ctx.restore();

      // the desk, and the laptop on it
      ctx.fillStyle = '#6b5334'; ctx.fillRect(112, DESK, 116, 6);
      ctx.fillStyle = '#7d6340'; ctx.fillRect(112, DESK, 116, 2);
      ctx.fillStyle = '#5a4429'; ctx.fillRect(120, DESK + 6, 6, 26);
      ctx.fillRect(214, DESK + 6, 6, 26);

      const lx = 192, ly = DESK;
      ctx.fillStyle = '#3a4152'; ctx.fillRect(lx - 32, ly - 4, 64, 4);
      ctx.fillStyle = '#2c3240'; ctx.fillRect(lx - 28, ly - 42, 56, 38);

      /* What is on the screen. Class first, and then, later in the
         scene, the game they all played instead of going outside. */
      const on = Math.min(1, t / 1.2);
      const playing = t > 7.5;
      ctx.globalAlpha = on;
      if (!playing) {
        // everybody in their own little square
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            const bx = lx - 25 + c * 13, by = ly - 39 + r * 11;
            const lit = ((r * 4 + c) * 7 + Math.floor(t * 1.4)) % 5 !== 0;
            ctx.globalAlpha = on * (lit ? 1 : 0.45);
            ctx.fillStyle = lit ? '#3e5a86' : '#28313f';
            ctx.fillRect(bx, by, 11, 9);
            ctx.fillStyle = lit ? '#e8b78d' : '#4a5462';
            ctx.beginPath(); ctx.arc(bx + 5.5, by + 3.5, 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(bx + 3, by + 6, 6, 3);
          }
        }
      } else {
        // the game: a dark map, a crosshair, and four names down the side
        const g2 = t - 7.5;
        ctx.fillStyle = '#141b2a'; ctx.fillRect(lx - 25, ly - 39, 50, 32);
        ctx.fillStyle = '#2a3a52';
        ctx.fillRect(lx - 21, ly - 20, 18, 9);
        ctx.fillRect(lx + 4, ly - 26, 15, 15);
        ctx.fillStyle = '#3d5273'; ctx.fillRect(lx - 25, ly - 12, 50, 5);
        ctx.fillStyle = '#c8402f';                       // somebody over there
        ctx.fillRect(lx + 9 + Math.round(Math.sin(g2 * 2) * 3), ly - 30, 3, 5);
        ctx.strokeStyle = '#8fe08f'; ctx.lineWidth = 1;  // the crosshair
        const cx2 = lx + Math.round(Math.sin(g2 * 1.7) * 8);
        ctx.beginPath();
        ctx.moveTo(cx2 - 4, ly - 24); ctx.lineTo(cx2 + 4, ly - 24);
        ctx.moveTo(cx2, ly - 28); ctx.lineTo(cx2, ly - 20);
        ctx.stroke();
        ctx.fillStyle = '#f2c14a';                       // the four of them
        for (let i = 0; i < 4; i++) ctx.fillRect(lx - 24, ly - 38 + i * 4, 8, 2);
        ctx.fillStyle = '#8fe08f'; ctx.fillRect(lx + 14, ly - 38, 10, 2);
      }
      ctx.globalAlpha = 1;

      const glow = ctx.createRadialGradient(lx, ly - 22, 6, lx, ly - 22, 74);
      glow.addColorStop(0, `rgba(150,190,240,${0.24 * on})`);
      glow.addColorStop(1, 'rgba(150,190,240,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 80, ly - 96, 160, 130);

      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(18,14,34,.42)');
      v.addColorStop(0.45, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  },

  /* ---------------- level 7: the presentation --------------------
     A hall, a projector, the two of them at the front of it, and the
     man everyone had warned her about sitting in the first row. */
  presentation: {
    music: 'careful',
    enter() {
      presentDone = false;
      present.beat = 0;
      Dialogue.start([
        { who: 'Ayrisha', char: 'teen',
          text: 'Here is the Moodle project we have been talking about.' },
        { who: 'Ayrisha', char: 'teen',
          text: 'It has more in it than a normal Moodle. You can run quizzes ' +
                'on it, and the teachers can set quizzes for the students.',
          on() { present.beat = 1; } },
        { who: 'Ayrisha', char: 'teen',
          text: 'The students can chat with the teacher here, and get help ' +
                'from them.',
          on() { present.beat = 2; } },
        { who: 'Ayrisha', char: 'teen',
          text: 'And you can hold live classes on it.',
          on() { present.beat = 3; } },
        { who: 'Head of the incubator', char: 'incubhead',
          text: 'This is a very great idea. This seems very nice.',
          on() { present.beat = 4; } },
        { who: 'Ayrisha', char: 'teen', text: 'Thank you.', sweet: true }
      ], () => { presentDone = true; });
    },
    done() { return presentDone; },
    draw(t) {
      const FLOOR = 156, STAGE = FLOOR - 20;

      ctx.fillStyle = '#141020'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = '#211a33'; ctx.fillRect(0, 0, VIEW_W, STAGE);

      /* The screen they are presenting on to. */
      const SX = 96, SY = 20, SW = 168, SH = 92;
      ctx.fillStyle = '#0f0c18'; ctx.fillRect(SX - 4, SY - 4, SW + 8, SH + 8);
      ctx.fillStyle = '#f4f6f9'; ctx.fillRect(SX, SY, SW, SH);

      // the site on it, the one she just built
      ctx.fillStyle = '#5a6b86'; ctx.fillRect(SX, SY, SW, 12);
      ctx.fillStyle = '#f2913a'; ctx.fillRect(SX + 4, SY + 3, 7, 7);
      ctx.fillStyle = '#e8edf4';
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText('MOODLE', SX + 15, SY + 9);
      ctx.fillStyle = '#e3e8ef'; ctx.fillRect(SX, SY + 12, SW, 9);
      ctx.fillStyle = '#7a879c';
      for (let i = 0; i < 4; i++) ctx.fillRect(SX + 6 + i * 26, SY + 16, 18, 2);

      /* Three panels, one for each thing she says it does. */
      const panels = [
        { x: SX + 6,  y: SY + 26, w: 48, h: 58, label: 'QUIZ' },
        { x: SX + 60, y: SY + 26, w: 48, h: 58, label: 'CHAT' },
        { x: SX + 114, y: SY + 26, w: 48, h: 58, label: 'LIVE' }
      ];
      panels.forEach((pn, i) => {
        const lit = present.beat >= i + 1;
        ctx.fillStyle = '#fff'; ctx.fillRect(pn.x, pn.y, pn.w, pn.h);
        ctx.fillStyle = lit ? '#3f8f4a' : '#c8cfd9';
        ctx.fillRect(pn.x, pn.y, pn.w, 8);
        ctx.fillStyle = '#f4f6f9';
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillText(pn.label, pn.x + 4, pn.y + 6);
        ctx.fillStyle = lit ? '#5b6478' : '#dde3ea';
        if (i === 0) {                                  // a quiz: questions
          for (let r = 0; r < 4; r++) {
            ctx.fillRect(pn.x + 5, pn.y + 15 + r * 11, 34, 2);
            ctx.fillStyle = lit ? '#3f8f4a' : '#dde3ea';
            ctx.fillRect(pn.x + 5, pn.y + 19 + r * 11, 5, 4);
            ctx.fillStyle = lit ? '#5b6478' : '#dde3ea';
          }
        } else if (i === 1) {                           // a chat: bubbles
          for (let r = 0; r < 4; r++) {
            const right = r % 2;
            ctx.fillStyle = lit ? (right ? '#3f8f4a' : '#8fa0b8') : '#dde3ea';
            ctx.fillRect(pn.x + (right ? 18 : 5), pn.y + 15 + r * 11, 25, 7);
          }
        } else {                                        // live: a call grid
          for (let r = 0; r < 2; r++)
            for (let c = 0; c < 3; c++) {
              ctx.fillStyle = lit ? '#3e5a86' : '#dde3ea';
              ctx.fillRect(pn.x + 5 + c * 14, pn.y + 15 + r * 22, 11, 18);
            }
        }
        if (lit) {                                      // the one she is on
          ctx.strokeStyle = present.beat === i + 1 ? '#ffcf4d' : 'rgba(63,143,74,.5)';
          ctx.lineWidth = present.beat === i + 1 ? 2 : 1;
          ctx.strokeRect(pn.x - 1, pn.y - 1, pn.w + 2, pn.h + 2);
        }
      });

      // the beam of the projector, coming from the back of the hall
      const beam = ctx.createLinearGradient(SX + SW / 2, SY, SX + SW / 2, VIEW_H);
      beam.addColorStop(0, 'rgba(200,220,255,.10)');
      beam.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = beam;
      ctx.fillRect(SX - 20, SY, SW + 40, VIEW_H - SY);

      /* The stage, and the two of them on it. */
      ctx.fillStyle = '#3a2f4e'; ctx.fillRect(0, STAGE, VIEW_W, FLOOR - STAGE);
      ctx.fillStyle = '#4a3d61'; ctx.fillRect(0, STAGE, VIEW_W, 2);
      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 60, STAGE, bob);
      drawCharacter(ctx, CHARACTERS.moodlefriend, 'idle', 1, 288, STAGE, 1 - bob);

      /* The hall, and him in the front row. */
      ctx.fillStyle = '#0f0b18'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      for (let i = 0; i < 11; i++) {
        const hx = 14 + i * 29;
        ctx.fillStyle = '#241d38';
        ctx.beginPath(); ctx.arc(hx, FLOOR + 14, 5, Math.PI, 0); ctx.fill();
        ctx.fillRect(hx - 5, FLOOR + 14, 10, 10);
      }
      ctx.save();
      ctx.beginPath(); ctx.rect(0, FLOOR - 2, VIEW_W, VIEW_H - FLOOR + 2); ctx.clip();
      drawCharacter(ctx, CHARACTERS.incubhead, 'idle', 1, 160, FLOOR + 26,
                    present.beat >= 4 ? bob : 0);
      ctx.restore();
      if (present.beat >= 4) {
        const gl = ctx.createRadialGradient(160, FLOOR + 8, 4, 160, FLOOR + 8, 44);
        gl.addColorStop(0, 'rgba(255,226,160,.22)');
        gl.addColorStop(1, 'rgba(255,226,160,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(112, FLOOR - 34, 96, 70);
      }

      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(8,5,16,.45)');
      v.addColorStop(0.4, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  },

  /* ------------------ level 8: a knock, and biryani ---------------
     She is still at the machine when somebody knocks. */
  biryaninight: {
    music: 'indoors',
    enter() {
      biryaniDone = false;
      night8.phase = 'knock';
      Sound.play('knock');
      narrate([{ text: 'A knock at the door.' }], () => {
        night8.phase = 'door';
        Dialogue.start([
          { who: 'Ayrisha', char: 'teen', text: 'Yes, Shantanu?' },
          { who: 'Shantanu', char: 'shantanu', text: 'Do you want to get biryani?' },
          { who: 'Ayrisha', char: 'teen', text: 'Yes. Let\u2019s order biryani.' },
          { who: 'Shantanu', char: 'shantanu', text: 'Ordering.',
            on() { night8.phase = 'wait'; } },
          { text: 'Thirty-eight minutes.', lock: true, wait: 1800,
            on() { night8.phase = 'eating'; Sound.play('pickup'); } },
          { who: 'Ayrisha', char: 'teen', text: 'Yes. So nice.', sweet: true },
          { who: 'Shantanu', char: 'shantanu', text: 'Yeah.' }
        ], () => { biryaniDone = true; });
      });
    },
    done() { return biryaniDone; },
    draw(t) {
      const FLOOR = 152;
      const ph = night8.phase;

      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#3b3350');
      g.addColorStop(1, '#5f5273');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // her window, and the evening outside it
      ctx.fillStyle = '#2b2540'; ctx.fillRect(18, 26, 50, 42);
      ctx.fillStyle = '#6b6494'; ctx.fillRect(22, 30, 42, 34);
      ctx.fillStyle = '#2b2540';
      ctx.fillRect(41, 26, 3, 42); ctx.fillRect(18, 45, 50, 3);

      ctx.fillStyle = '#4e4463'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#5c5173'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      /* Her machine, still on, over on the left. */
      const dx = 96;
      ctx.fillStyle = '#4a3f56'; ctx.fillRect(dx - 30, FLOOR - 30, 60, 5);
      ctx.fillStyle = '#211c2c'; ctx.fillRect(dx - 24, FLOOR - 62, 46, 32);
      ctx.fillStyle = '#1c2a3e'; ctx.fillRect(dx - 21, FLOOR - 59, 40, 26);
      ctx.fillStyle = '#8fe08f';
      ctx.fillRect(dx - 4 + Math.round(Math.sin(t * 2) * 4), FLOOR - 48, 2, 2);
      const mg = ctx.createRadialGradient(dx, FLOOR - 46, 4, dx, FLOOR - 46, 50);
      mg.addColorStop(0, 'rgba(120,190,255,.18)');
      mg.addColorStop(1, 'rgba(120,190,255,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(dx - 54, FLOOR - 96, 108, 80);

      /* The door, over on the right. */
      const DX = 252;
      ctx.fillStyle = '#3d2f26'; ctx.fillRect(DX - 22, FLOOR - 58, 44, 58);
      if (ph === 'knock') {
        ctx.fillStyle = '#5a4636'; ctx.fillRect(DX - 19, FLOOR - 55, 38, 55);
        ctx.fillStyle = '#c9a227'; ctx.fillRect(DX + 12, FLOOR - 30, 4, 4);
        // the knock itself
        const k = (t * 3) % 1;
        ctx.strokeStyle = `rgba(255,232,180,${(1 - k) * 0.8})`;
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(DX - 22, FLOOR - 34, i * 9 + k * 9, -0.9, 0.9);
          ctx.stroke();
        }
      } else {
        // open, with the corridor light behind him
        ctx.fillStyle = '#f0d9a8'; ctx.fillRect(DX - 19, FLOOR - 55, 38, 55);
        ctx.fillStyle = '#3d2f26'; ctx.fillRect(DX + 14, FLOOR - 58, 8, 58);
      }

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;

      if (ph === 'knock') {
        drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 128, FLOOR, bob);
      } else if (ph === 'door' || ph === 'wait') {
        drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 206, FLOOR, bob);
        drawCharacter(ctx, CHARACTERS.shantanu, 'idle', 1, 246, FLOOR, 1 - bob);
      } else {
        /* On the floor with it, which is where it always ended up. */
        drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 64, FLOOR, bob);
        drawCharacter(ctx, CHARACTERS.shantanu, 'idle', 1, 256, FLOOR, 1 - bob);
        drawBiryaniBox(128, FLOOR);
        drawBiryaniBox(192, FLOOR);
        const wg = ctx.createRadialGradient(160, FLOOR - 22, 10, 160, FLOOR - 22, 96);
        wg.addColorStop(0, 'rgba(255,220,150,.18)');
        wg.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = wg;
        ctx.fillRect(60, FLOOR - 100, 200, 116);
      }

      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(20,14,36,.36)');
      v.addColorStop(0.45, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  },

  /* ------------------ level 10: the back row ---------------------
     Lights down, something going on at the front of it, and the three
     of them as far away from the front of it as the room allows. */
  backrow: {
    music: 'lullaby',
    enter() {
      backDone = false;
      back10.laugh = 0;
      narrate([{ text: 'Back row. Lights down.' }], () => {
        Dialogue.start([
          { who: 'A good friend', char: 'goodfriend',
            text: 'Wait. Have you guys got alcohol?' },
          { who: 'Ayrisha', char: 'teen', text: 'You wanna try?' },
          { who: 'A good friend', char: 'goodfriend', text: 'Yes. Yes yes yes.' },
          { who: 'Shantanu', char: 'shantanu', text: 'Keep your voice down.' },
          { who: 'A good friend', char: 'goodfriend', text: 'YES.',
            on() { back10.laugh = 1; } },
          { text: 'All three of them, far too loudly, in the back row of a ' +
                  'dark auditorium.', lock: true, wait: 3000 }
        ], () => { backDone = true; });
      });
    },
    done() { return backDone; },
    draw(t) {
      const ROW = 132;

      ctx.fillStyle = '#100c1c'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      /* Something happening a long way down at the front. */
      ctx.fillStyle = '#241b33'; ctx.fillRect(0, 0, VIEW_W, 74);
      const SX = 108, SY = 12, SW = 104, SH = 50;
      ctx.fillStyle = '#0d0a16'; ctx.fillRect(SX - 3, SY - 3, SW + 6, SH + 6);
      ctx.fillStyle = '#4e5f86'; ctx.fillRect(SX, SY, SW, SH);
      ctx.fillStyle = '#6f83ad';
      for (let i = 0; i < 3; i++)
        ctx.fillRect(SX + 8, SY + 10 + i * 12, 40 + (i % 2) * 34, 4);
      const beam = ctx.createLinearGradient(SX + SW / 2, SY + SH, SX + SW / 2, VIEW_H);
      beam.addColorStop(0, 'rgba(150,180,240,.13)');
      beam.addColorStop(1, 'rgba(150,180,240,0)');
      ctx.fillStyle = beam;
      ctx.fillRect(0, SY + SH, VIEW_W, VIEW_H - SY - SH);

      /* Rows of the backs of heads, going away from us. */
      for (let r = 0; r < 4; r++) {
        const y = 82 + r * 12, sc = 1 - r * 0.06;
        for (let i = 0; i < 13; i++) {
          const hx = 10 + i * 25 + (r % 2) * 11;
          ctx.fillStyle = `rgba(30,24,48,${0.75 + r * 0.05})`;
          ctx.beginPath(); ctx.arc(hx, y, 5 * sc, Math.PI, 0); ctx.fill();
          ctx.fillRect(hx - 5 * sc, y, 10 * sc, 7);
        }
      }

      /* Their row, and the seats they are in. */
      ctx.fillStyle = '#1d1730'; ctx.fillRect(0, ROW, VIEW_W, VIEW_H - ROW);
      ctx.fillStyle = '#2a2144';
      for (let i = 0; i < 8; i++) ctx.fillRect(4 + i * 40, ROW + 22, 34, 26);

      const bob = Math.sin(t * (back10.laugh ? 9 : 2)) > 0 ? 0 : 1;
      const shake = back10.laugh ? Math.round(Math.sin(t * 22) * 1.2) : 0;

      /* Clipped at the seat backs, so they are sitting in them. */
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, VIEW_W, ROW + 24); ctx.clip();
      drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 108 + shake, ROW + 30, bob);
      drawCharacter(ctx, CHARACTERS.shantanu, 'idle', 1, 160 - shake, ROW + 30, 1 - bob);
      drawCharacter(ctx, CHARACTERS.goodfriend, 'idle', 1, 212 + shake, ROW + 30, bob);
      ctx.restore();

      // the bottle, going along the row
      drawBottle(134, ROW + 20);

      /* And the noise they were definitely not making. */
      if (back10.laugh) {
        ctx.font = '6px "Press Start 2P", monospace';
        for (let i = 0; i < 9; i++) {
          const p = ((t * 0.9 + i * 0.11) % 1);
          ctx.globalAlpha = Math.sin(p * Math.PI) * 0.85;
          ctx.fillStyle = i % 3 ? '#ffe9a8' : '#f6c9d8';
          ctx.fillText('ha', 96 + i * 15 + Math.sin(p * 6 + i) * 5,
                       ROW + 8 - p * 44);
        }
        ctx.globalAlpha = 1;
      }

      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(8,5,16,.5)');
      v.addColorStop(0.45, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  },

  /* -------------------- level 11: the years ---------------------
     Pages coming off a wall calendar and going past the camera, the
     way years do in a cartoon, because that is how those ones went. */
  calendar: {
    music: 'morning',
    dur: 12,
    enter() { cal.flying = []; cal.at = 0; cal.next = 1.1; },
    draw(t) {
      const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const TOTAL = 48;                       // Jan 2020 to Dec 2023

      /* Tear one off, faster and faster, then stop. */
      while (cal.at < TOTAL && t > cal.next) {
        cal.flying.push({
          m: cal.at % 12, y: 2020 + Math.floor(cal.at / 12),
          x: 0, y2: 0, vx: 1.6 + Math.random() * 2.6,
          vy: -1.4 - Math.random() * 1.6, r: 0,
          vr: (Math.random() - 0.5) * 0.4, a: 1
        });
        cal.at++;
        // 48 of them in about seven seconds, quickening as it goes
        cal.next += Math.max(0.055, 0.3 - cal.at * 0.006);
      }

      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#3f4a68');
      g.addColorStop(1, '#6c7392');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      for (let x = 0; x < VIEW_W; x += 24) ctx.fillRect(x, 0, 10, VIEW_H);

      const CX = 160, CY = 40, CW = 92, CH = 96;

      // the nail it hangs off
      ctx.fillStyle = '#2f3346'; ctx.fillRect(CX - 1, CY - 12, 3, 8);
      ctx.strokeStyle = '#2f3346'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CX - 20, CY); ctx.lineTo(CX, CY - 6); ctx.lineTo(CX + 20, CY);
      ctx.stroke();

      /* The block on the wall. */
      const shown = Math.min(TOTAL - 1, cal.at);
      const month = MONTHS[shown % 12];
      const year = 2020 + Math.floor(shown / 12);
      drawPage(CX - CW / 2, CY, CW, CH, month, year, 1, 0);

      /* And the ones that have come off it. */
      for (const p of cal.flying) {
        p.x += p.vx; p.y2 += p.vy; p.vy += 0.12; p.r += p.vr; p.a -= 0.016;
        if (p.a <= 0) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.a);
        ctx.translate(CX + p.x, CY + 40 + p.y2);
        ctx.rotate(p.r);
        drawPage(-CW / 2, -CH / 2, CW, CH, MONTHS[p.m], p.y, 0.62, 1);
        ctx.restore();
      }
      cal.flying = cal.flying.filter(p => p.a > 0 && p.x < VIEW_W);

      /* The year, big, under all of it. */
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffe9a8';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(year), VIEW_W / 2, VIEW_H - 22);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';

      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(20,20,44,.4)');
      v.addColorStop(0.45, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  },

  /* ------------------- level 11: congratulations ------------------ */
  congrats: {
    music: 'morning',
    enter() {
      congratsDone = false;
      pop.t = 0;
      pop.bits = [];
      Sound.play('clear');
      for (let i = 0; i < 90; i++) {
        pop.bits.push({
          x: i % 2 ? 12 : VIEW_W - 12,
          y: 150,
          vx: (i % 2 ? 1 : -1) * (1.4 + Math.random() * 3.4),
          vy: -3.2 - Math.random() * 3.4,
          r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.5,
          c: ['#ffcf4d', '#ff9ec4', '#8fe08f', '#4aa8d8', '#e04b32'][i % 5],
          w: 2 + Math.floor(Math.random() * 3)
        });
      }
      narrate([
        { text: 'She got it.' },
        { text: 'Software engineer. The first one of them to sign anything.' }
      ], () => { congratsDone = true; });
    },
    done() { return congratsDone; },
    draw(t) {
      const FLOOR = 152;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#3a2f52');
      g.addColorStop(1, '#6b5a78');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = '#584a63'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#665670'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      // a string of little flags across the top
      for (let i = 0; i < 13; i++) {
        const fx = 6 + i * 26, dip = Math.sin(i * 0.9) * 3;
        ctx.fillStyle = ['#ffcf4d', '#ff9ec4', '#8fe08f', '#4aa8d8'][i % 4];
        ctx.beginPath();
        ctx.moveTo(fx, 16 + dip); ctx.lineTo(fx + 14, 16 + dip);
        ctx.lineTo(fx + 7, 30 + dip); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 13; i++) {
        const fx = 6 + i * 26;
        if (i) ctx.lineTo(fx, 16 + Math.sin(i * 0.9) * 3);
        else ctx.moveTo(fx, 16 + Math.sin(i * 0.9) * 3);
      }
      ctx.stroke();

      /* The poppers, and everything that came out of them. */
      drawPopper(10, FLOOR, 1);
      drawPopper(VIEW_W - 10, FLOOR, -1);
      for (const b of pop.bits) {
        b.x += b.vx; b.y += b.vy; b.vy += 0.11; b.r += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -1, b.w, 3);
        ctx.restore();
      }
      pop.bits = pop.bits.filter(b => b.y < VIEW_H + 10);

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.shantanu, 'idle', 1, 96, FLOOR, 1 - bob);
      drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 160, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.goodfriend, 'idle', 1, 224, FLOOR, 1 - bob);

      const gl = ctx.createRadialGradient(160, FLOOR - 24, 8, 160, FLOOR - 24, 92);
      gl.addColorStop(0, 'rgba(255,226,160,.20)');
      gl.addColorStop(1, 'rgba(255,226,160,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(60, FLOOR - 110, 200, 130);

      // and the word itself, bouncing in
      const up = Math.min(1, t / 0.5);
      ctx.save();
      ctx.globalAlpha = up;
      ctx.translate(VIEW_W / 2, 62 - (1 - up) * 22);
      ctx.rotate(Math.sin(t * 2.2) * 0.03);
      ctx.textAlign = 'center';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillStyle = '#241b26';
      ctx.fillText('CONGRATULATIONS', 1, 2);
      ctx.fillStyle = '#ffcf4d';
      ctx.fillText('CONGRATULATIONS', 0, 0);
      ctx.textAlign = 'left';
      ctx.restore();
    }
  },

  /* ------------- level 11: and that is the chapter ----------------
     One last page, 2024 on it, and then he comes for the second and
     last time and she stops being a teenager. */
  chapterend: {
    music: 'lullaby',
    enter() {
      chap.done = false;
      chap.adult = false;
      chap.phase = 'year';
      chap.pt = 0;
      chap.on = false;
      growFlash = 0;
    },
    done() { return chap.done; },
    draw(t) {
      const FLOOR = 152;

      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#2a2a52');
      g.addColorStop(0.55, '#7a72a0');
      g.addColorStop(1, '#e8ae86');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // the college behind her, going quiet for the evening
      ctx.fillStyle = 'rgba(42,34,62,.5)';
      ctx.fillRect(20, 76, 62, 76);
      ctx.fillRect(90, 60, 46, 92);
      ctx.fillRect(144, 84, 58, 68);
      ctx.fillRect(210, 68, 42, 84);
      ctx.fillStyle = 'rgba(255,232,180,.32)';
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 10; c++)
          ctx.fillRect(26 + c * 23, 84 + r * 16, 7, 8);

      ctx.fillStyle = '#4e4a3e'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#5c5749'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      /* The last page: 2024, coming up and then going away again. */
      if (chap.phase === 'year') {
        chap.pt += 1 / 60;
        const p = Math.min(1, chap.pt / 1.1);
        const out = Math.max(0, (chap.pt - 2.6) / 1.0);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p) - out);
        ctx.translate(VIEW_W / 2, 60 + (1 - p) * 14 - out * 30);
        drawPage(-46, -24, 92, 96, '', 2024, 1, 1);
        ctx.restore();
        if (chap.pt > 3.8) { chap.phase = 'wait'; chap.pt = 0; }
      }

      const who = chap.adult ? CHARACTERS.adult : CHARACTERS.teen;
      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      const px = 168;

      /* He comes once the page has gone. */
      if (chap.phase === 'wait') {
        chap.pt += 1 / 60;
        if (chap.pt > 0.6) { startChapMagic(); }
      }

      if (!chap.on) drawCharacter(ctx, who, 'idle', 1, px, FLOOR, bob);
      drawChapMagic(t, px, FLOOR);
    }
  },

  /* ------------------- level 12: the cab ------------------------- */
  cabride: {
    music: 'morning',
    dur: 9,
    draw(t) {
      const HORIZON = 96, ROAD = 138;
      const s = t * 96;

      const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
      sky.addColorStop(0, '#5f7fb4');
      sky.addColorStop(1, '#cfd9e4');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VIEW_W, HORIZON);

      // a flyover city going past
      for (let layer = 0; layer < 2; layer++) {
        const sp = layer ? 0.5 : 0.22;
        for (let i = 0; i < 22; i++) {
          const x = ((i * 46 - s * sp) % 660 + 660) % 660 - 60;
          const h = 22 + ((i * 37) % 52) + layer * 14;
          ctx.fillStyle = layer ? '#93a3bb' : 'rgba(150,166,190,.6)';
          ctx.fillRect(x, HORIZON - h, 34, h);
          if (layer) {
            ctx.fillStyle = 'rgba(255,240,200,.35)';
            for (let r = 0; r < Math.floor(h / 12); r++)
              ctx.fillRect(x + 5, HORIZON - h + 6 + r * 12, 5, 6);
            ctx.fillStyle = '#93a3bb';
          }
        }
      }

      ctx.fillStyle = '#8f9a86'; ctx.fillRect(0, HORIZON, VIEW_W, ROAD - HORIZON);
      // trees on the verge
      for (let i = 0; i < 12; i++) {
        const x = ((i * 62 - s * 0.8) % 760 + 760) % 760 - 60;
        ctx.fillStyle = '#5b4530'; ctx.fillRect(x + 6, ROAD - 26, 4, 26);
        ctx.fillStyle = '#3f7a44';
        ctx.beginPath(); ctx.arc(x + 8, ROAD - 32, 12, 0, Math.PI * 2); ctx.fill();
      }

      // the road, and its dashes
      ctx.fillStyle = '#4a4954'; ctx.fillRect(0, ROAD, VIEW_W, VIEW_H - ROAD);
      ctx.fillStyle = '#5c5b68'; ctx.fillRect(0, ROAD, VIEW_W, 3);
      ctx.fillStyle = '#e8e0c0';
      for (let i = 0; i < 14; i++) {
        const x = ((i * 44 - s * 2.4) % 620 + 620) % 620 - 60;
        ctx.fillRect(x, ROAD + 24, 22, 3);
      }

      /* The cab, holding its place. */
      const cx = 150, by = ROAD + 18 + Math.sin(t * 9) * 0.6;
      ctx.fillStyle = '#f2c14a'; ctx.fillRect(cx - 46, by - 22, 96, 16);
      ctx.fillStyle = '#d8a52f'; ctx.fillRect(cx - 46, by - 22, 96, 3);
      ctx.fillStyle = '#f2c14a';
      ctx.beginPath();
      ctx.moveTo(cx - 30, by - 22); ctx.lineTo(cx + 26, by - 22);
      ctx.lineTo(cx + 16, by - 42); ctx.lineTo(cx - 20, by - 42);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3a4152';
      ctx.fillRect(cx - 26, by - 40, 20, 16);
      ctx.fillRect(cx - 2, by - 40, 16, 16);
      // her in the back of it
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - 2, by - 40, 16, 16); ctx.clip();
      drawCharacter(ctx, CHARACTERS.noida, 'idle', 1, cx + 7, by - 16, 0);
      ctx.restore();
      ctx.fillStyle = '#241b26';
      ctx.beginPath(); ctx.arc(cx - 28, by - 4, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 32, by - 4, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6b6f7c'; ctx.lineWidth = 1;
      for (const wx of [cx - 28, cx + 32]) {
        const a = -s * 0.09;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(a) * 6, by - 4 + Math.sin(a) * 6);
        ctx.lineTo(wx - Math.cos(a) * 6, by - 4 - Math.sin(a) * 6);
        ctx.stroke();
      }
      ctx.fillStyle = '#241b26'; ctx.fillRect(cx - 12, by - 50, 26, 8);
      ctx.fillStyle = '#f4f1ea'; ctx.fillRect(cx - 11, by - 49, 24, 6);
      ctx.fillStyle = '#241b26';
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText('TAXI', cx - 9, by - 44);

      const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      v.addColorStop(0, 'rgba(30,34,60,.28)');
      v.addColorStop(0.45, 'rgba(0,0,0,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  },

  /* -------------- level 12: and it goes on from there ------------- */
  adventure: {
    music: 'lullaby',
    enter() {
      advDone = false;
      adv.on = 0;
      adv.card = 0;
      Dialogue.start([
        { who: 'Krishna ji', char: 'krishna',
          text: 'Good luck, my child. I am always looking after you.' },
        { who: 'Krishna ji', char: 'krishna',
          text: 'You are special, and brilliant, and warm.' },
        { who: 'Krishna ji', char: 'krishna',
          text: 'You will do great.', sweet: true }
      ], () => { adv.card = 1; });
    },
    done(t) { return advDone; },
    draw(t) {
      const FLOOR = 152;

      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#6f8fc4');
      g.addColorStop(0.6, '#c8d6e4');
      g.addColorStop(1, '#e6d8bc');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // the office behind her, glass and morning
      ctx.fillStyle = '#5b6a86'; ctx.fillRect(180, 24, 150, FLOOR - 24);
      ctx.fillStyle = '#a8c6de';
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 8; c++)
          ctx.fillRect(186 + c * 18, 32 + r * 18, 12, 13);
      ctx.fillStyle = '#8f9a86'; ctx.fillRect(0, FLOOR - 6, VIEW_W, 6);
      ctx.fillStyle = '#6f6a5e'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#7d7768'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      adv.on = Math.min(1, adv.on + 0.012);
      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      const px = 118;

      // the world goes down a little so he reads
      ctx.fillStyle = `rgba(22,17,36,${0.42 * adv.on})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      const kx = 62, h = frameHeight(CHARACTERS.krishna, 'idle');
      const cy = FLOOR - h / 2;
      ctx.save();
      ctx.globalAlpha = adv.on;
      const glow = ctx.createRadialGradient(kx, cy, 4, kx, cy, 62);
      glow.addColorStop(0, 'rgba(255,236,170,.62)');
      glow.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(kx - 70, cy - 70, 140, 140);
      drawCharacter(ctx, CHARACTERS.krishna, 'idle', 1, kx, FLOOR, 0);
      for (let i = 0; i < 12; i++) {
        const a = t * 0.7 + i * 0.52;
        const r = 32 + (i % 4) * 9;
        ctx.globalAlpha = adv.on * (0.25 + 0.3 * Math.sin(t * 2.4 + i));
        ctx.fillStyle = i % 3 ? '#ffe9a8' : '#f6c9d8';
        ctx.fillRect(Math.round(kx + Math.cos(a) * r),
                     Math.round(cy + Math.sin(a) * r * 0.7), 2, 2);
      }
      ctx.restore();

      drawCharacter(ctx, CHARACTERS.noida, 'idle', 1, px, FLOOR, bob);
      drawCoffeeCup(px + 11, FLOOR - 4 + bob);      // the coffee, still on her

      /* And the last thing it says. */
      if (adv.card) {
        adv.card = Math.min(120, adv.card + 1);
        const p = Math.min(1, adv.card / 40);
        ctx.save();
        ctx.globalAlpha = p;
        ctx.fillStyle = `rgba(14,10,26,${0.6 * p})`;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        ctx.textAlign = 'center';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#241b26';
        ctx.fillText('AND HER ADVENTURE', VIEW_W / 2 + 1, 84 + 1);
        ctx.fillText('CONTINUES', VIEW_W / 2 + 1, 102 + 1);
        ctx.fillStyle = '#ffcf4d';
        ctx.fillText('AND HER ADVENTURE', VIEW_W / 2, 84);
        ctx.fillText('CONTINUES', VIEW_W / 2, 102);
        ctx.fillStyle = '#ff9ec4';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('\u2665', VIEW_W / 2, 126);
        ctx.textAlign = 'left';
        ctx.restore();
        if (adv.card >= 110) advDone = true;
      }
    }
  },

  /* ---------------------- level 1: the birth ---------------------- */
  birth: {
    dur: 4.5,
    music: 'lullaby',
    enter() { Sound.play('birth'); },
    draw(t) {
      const FLOOR = 150;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#42303f');
      g.addColorStop(1, '#7a555b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // window — the rain has finally eased off
      ctx.fillStyle = '#3b3a44';
      ctx.fillRect(22, 28, 58, 48);
      ctx.fillStyle = '#96a0b0';
      ctx.fillRect(25, 31, 52, 42);
      ctx.fillStyle = '#9aa2b4';
      ctx.fillRect(50, 28, 2, 48);
      ctx.fillRect(22, 50, 58, 2);
      ctx.strokeStyle = 'rgba(90,105,130,.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const rx = 28 + ((i * 13 + t * 9) % 46);
        const ry = 33 + ((i * 17 + t * 26) % 36);
        ctx.moveTo(rx, ry); ctx.lineTo(rx - 1, ry + 4);
      }
      ctx.stroke();

      // wall clock
      ctx.fillStyle = '#e8ddd0';
      ctx.beginPath(); ctx.arc(258, 44, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3b2d33'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(258, 44); ctx.lineTo(258, 37);
      ctx.moveTo(258, 44); ctx.lineTo(263, 47); ctx.stroke();

      ctx.fillStyle = '#5c4048'; ctx.fillRect(0, FLOOR - 6, VIEW_W, 6);
      ctx.fillStyle = '#59414a'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#674a54'; ctx.fillRect(0, FLOOR, VIEW_W, 3);
      ctx.fillStyle = 'rgba(0,0,0,.10)';
      for (let x = 0; x < VIEW_W; x += 24) ctx.fillRect(x, FLOOR + 3, 1, VIEW_H - FLOOR);

      // bed and IV stand
      ctx.fillStyle = '#8e97a8';
      ctx.fillRect(214, 116, 4, 34); ctx.fillRect(300, 120, 4, 30);
      ctx.fillStyle = '#cfd6e2'; ctx.fillRect(214, 126, 90, 9);
      ctx.fillStyle = '#eef1f6'; ctx.fillRect(218, 118, 24, 9);
      ctx.fillStyle = '#a8b0c0'; ctx.fillRect(214, 135, 90, 3);
      ctx.fillStyle = '#8e97a8';
      ctx.fillRect(200, 96, 2, 54); ctx.fillRect(194, 148, 14, 2);
      ctx.fillStyle = '#cfe4d8'; ctx.fillRect(196, 98, 7, 13);

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.mother, 'idle', 1, 122, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.officer, 'idle', 1, 172, FLOOR, bob);

      const p = Math.min(1, t / 2.4);
      const bx = 138, by = FLOOR - 15;
      ctx.save();
      ctx.globalAlpha = 0.22 + 0.2 * Math.sin(t * 3);
      ctx.fillStyle = '#ffd9a0';
      ctx.beginPath(); ctx.arc(bx, by, 12 + p * 14, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (p > 0.4) {
        ctx.globalAlpha = Math.min(1, (p - 0.4) / 0.45);
        ctx.fillStyle = '#f7ecdc'; ctx.fillRect(bx - 8, by - 6, 17, 13);
        ctx.fillStyle = '#e8cfc0'; ctx.fillRect(bx - 8, by + 3, 17, 4);
        ctx.fillStyle = '#f2b6c8'; ctx.fillRect(bx - 8, by - 6, 17, 2);
        ctx.fillStyle = '#e8b78d'; ctx.fillRect(bx - 3, by - 4, 8, 7);
        ctx.fillStyle = '#17141c';
        ctx.fillRect(bx - 3, by - 5, 8, 2);       // her hair, black from day one
        ctx.fillRect(bx - 2, by - 1, 1, 1);
        ctx.fillRect(bx + 3, by - 1, 1, 1);
        ctx.fillStyle = '#b5605e'; ctx.fillRect(bx, by + 1, 2, 1);
        ctx.globalAlpha = 1;
      }

      for (let i = 0; i < 16; i++) {
        const a = t * 0.8 + i * 0.4;
        const r = 26 + (i % 4) * 8 + Math.sin(t * 2 + i) * 3;
        ctx.globalAlpha = 0.3 + 0.35 * Math.sin(t * 3 + i);
        ctx.fillStyle = '#ffe9b8';
        ctx.fillRect(Math.round(bx + Math.cos(a) * r), Math.round(by + Math.sin(a) * r * 0.6), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  },

  /* ------------------------ level 3: the book --------------------- */
  book: {
    music: 'lullaby',
    /* She comes back out to the balcony, and Aunty looks at what she
       made before giving her anything. */
    enter() {
      bookGiven = false;
      bookT = 0;
      Dialogue.start([
        { who: 'Aunty', char: 'tutor', text: 'Oh wow, you did a great job!' },
        { who: 'Ayrisha', char: 'child',
          text: 'Thank you, Aunty. You teach so well.' },
        { who: 'Aunty', char: 'tutor',
          text: 'Yeah, you are a great student. I have a book for you.' },
        { who: 'Ayrisha', char: 'child', text: 'What is it?' },
        /* the book arrives on this line, and it cannot be skipped, so
           the handover actually plays */
        { who: 'Aunty', char: 'tutor', text: 'Here is the book.',
          lock: true, wait: 3600,
          on() { bookGiven = true; bookT = 0; Sound.play('birth'); } }
      ], null);
    },
    /* Long enough after the conversation to actually look at it. */
    done(t) { return bookGiven && !Dialogue.active && bookT > 4.5; },
    draw(t) {
      const FLOOR = 152;

      // the balcony, late afternoon
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#7fbfe0');
      g.addColorStop(0.55, '#f0c98a');
      g.addColorStop(1, '#f6ddb2');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = 'rgba(255,236,170,.55)';
      ctx.beginPath(); ctx.arc(268, 40, 15, 0, Math.PI * 2); ctx.fill();

      // rooftops below the balcony
      ctx.fillStyle = '#a98871';
      for (let i = 0; i < 7; i++) {
        const bx = i * 52 - 20, bh = 24 + ((i * 37) % 26);
        ctx.fillRect(bx, FLOOR - 34 - bh, 44, bh);
      }

      // railing and floor
      ctx.fillStyle = '#b08e70'; ctx.fillRect(0, FLOOR - 36, VIEW_W, 5);
      ctx.fillStyle = '#c9a98a';
      for (let x = 0; x < VIEW_W; x += 8) ctx.fillRect(x, FLOOR - 31, 3, 31);
      ctx.fillStyle = '#9a7550'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#b08a63'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      // her painting, up on the easel where she left it
      ctx.strokeStyle = '#8a6a3f'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(36, FLOOR); ctx.lineTo(46, FLOOR - 46);
      ctx.moveTo(60, FLOOR); ctx.lineTo(50, FLOOR - 46);
      ctx.stroke();
      const [gw, gh] = Art.size;
      const cell = 2;
      ctx.fillStyle = '#fbf6ea';
      ctx.fillRect(30, FLOOR - 74, gw * cell + 6, gh * cell + 6);
      Art.drawTo(ctx, 33, FLOOR - 71, cell);
      ctx.fillStyle = '#6b4a33'; ctx.fillRect(28, FLOOR - 46, gw * cell + 10, 4);

      // the two of them
      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.tutor, 'idle', 1, 122, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.child, 'idle', 1, 168, FLOOR, bob);

      // the book itself, only once she has actually been given it
      if (!bookGiven) return;
      bookT += 1 / 60;
      const p = Math.min(1, bookT / 0.7);
      const bx = 145, by = FLOOR - 50;
      ctx.save();
      ctx.globalAlpha = 0.2 + 0.2 * Math.sin(t * 3);
      ctx.fillStyle = '#fff0c0';
      ctx.beginPath(); ctx.arc(bx, by, 18 + p * 22, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (BOOK_IMG.complete && BOOK_IMG.naturalWidth) {
        // a small overshoot so it lands rather than fades
        const pop = p < 1 ? 1.12 - 0.12 * p : 1;
        const h = (46 + p * 12) * pop;
        const w = h * (BOOK_IMG.naturalWidth / BOOK_IMG.naturalHeight);
        ctx.globalAlpha = Math.min(1, p / 0.6);
        ctx.fillStyle = '#241b26';
        ctx.fillRect(bx - w / 2 - 1, by - h / 2 - 1, w + 2, h + 2);
        ctx.drawImage(BOOK_IMG, bx - w / 2, by - h / 2, w, h);
        ctx.globalAlpha = 1;
      }

      for (let i = 0; i < 14; i++) {
        const a = t * 0.8 + i * 0.45;
        const r = 28 + (i % 4) * 8 + Math.sin(t * 2 + i) * 3;
        ctx.globalAlpha = 0.3 + 0.35 * Math.sin(t * 3 + i);
        ctx.fillStyle = '#fff3c8';
        ctx.fillRect(Math.round(bx + Math.cos(a) * r),
                     Math.round(by + Math.sin(a) * r * 0.6), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  },

  /* ------------------------ level 5: home ------------------------- */
  kotahome: {
    music: 'lullaby',
    enter() {
      kotaDone = false;
      Dialogue.start([
        { text: 'Home. It has not been an easy year.' },
        { who: 'Uncle', char: 'husband',
          text: 'That gudiya \u2014 this time will teach you very much, ' +
                'which will be useful for your whole life.' },
        { who: 'Krishna ji', char: 'krishna',
          text: 'You are very smart. You are intelligent. You can work hard also.' },
        { who: 'Krishna ji', char: 'krishna',
          text: 'You will do great in your life. Let\u2019s go to college now, ' +
                'and have a good time.' }
      ], () => { kotaDone = true; });
    },
    done() { return kotaDone; },
    draw(t) {
      const FLOOR = 150;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#4a3d52');
      g.addColorStop(1, '#7a6472');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // a window with the evening outside
      ctx.fillStyle = '#3b3344'; ctx.fillRect(24, 28, 58, 46);
      ctx.fillStyle = '#8d7fa0'; ctx.fillRect(28, 32, 50, 38);
      ctx.fillStyle = '#3b3344';
      ctx.fillRect(51, 28, 3, 46); ctx.fillRect(24, 50, 58, 3);

      ctx.fillStyle = '#6b5334'; ctx.fillRect(226, 34, 46, 32);
      ctx.fillStyle = '#efe3c8'; ctx.fillRect(229, 37, 40, 26);

      ctx.fillStyle = '#5e4d58'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#6e5b67'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      // her bag, put down by the door
      ctx.fillStyle = '#c4536a'; ctx.fillRect(48, FLOOR - 11, 15, 11);
      ctx.fillStyle = '#9c3d52'; ctx.fillRect(48, FLOOR - 11, 15, 4);

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.husband, 'idle', 1, 118, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 168, FLOOR, bob);

      // a warm light over the two of them
      const gl = ctx.createRadialGradient(143, FLOOR - 26, 6, 143, FLOOR - 26, 74);
      gl.addColorStop(0, 'rgba(255,226,160,.20)');
      gl.addColorStop(1, 'rgba(255,226,160,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(60, FLOOR - 100, 170, 110);
    }
  },

  /* --------------------- level 4: the music room ------------------ */
  musicdone: {
    music: 'lullaby',
    enter() {
      musicDone = false;
      Dialogue.start([
        { who: 'Teacher', char: 'musicteacher',
          text: 'Oh wow, you did so great. You will make a very good musician!' },
        { who: 'Ayrisha', char: 'child', text: 'Thank you, teacher!' }
      ], () => { musicDone = true; });
    },
    done() { return musicDone; },
    draw(t) {
      const FLOOR = 148;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#c8b6d4');
      g.addColorStop(1, '#a692b4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = '#8b769c'; ctx.fillRect(24, 26, 60, 46);
      ctx.fillStyle = '#bfe3ff'; ctx.fillRect(28, 30, 52, 38);
      ctx.fillStyle = '#8b769c';
      ctx.fillRect(52, 26, 3, 46); ctx.fillRect(24, 46, 60, 3);
      ctx.fillStyle = '#6b5334'; ctx.fillRect(232, 30, 44, 34);
      ctx.fillStyle = '#f2e6c8'; ctx.fillRect(235, 33, 38, 28);
      ctx.fillStyle = '#3f8f6a';
      for (let i = 0; i < 5; i++) ctx.fillRect(239 + i * 7, 40, 3, 14);

      ctx.fillStyle = '#7d6a8c'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#8e7a9c'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      drawUpright(ctx, 96, FLOOR);

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.musicteacher, 'idle', 1, 74, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.child, 'idle', 1, 186, FLOOR, bob);

      // a few notes hanging in the air after the lesson
      for (let i = 0; i < 8; i++) {
        const a = t * 0.6 + i * 0.8;
        ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 2 + i);
        ctx.fillStyle = '#ffe9a8';
        const nx = Math.round(150 + Math.cos(a) * (26 + (i % 3) * 10));
        const ny = Math.round(FLOOR - 58 + Math.sin(a * 1.3) * 16);
        ctx.fillRect(nx, ny, 2, 5);
        ctx.fillRect(nx - 2, ny + 5, 4, 2);
      }
      ctx.globalAlpha = 1;
    }
  },

  /* --------------------- level 2: the classroom ------------------- */
  classroom: {
    dur: 4.2,
    music: 'lullaby',
    enter() { Sound.play('bell'); },
    draw(t) {
      const FLOOR = 150;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#cfd6c6');
      g.addColorStop(1, '#a9b39a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // blackboard
      ctx.fillStyle = '#6b5334'; ctx.fillRect(24, 26, 128, 62);
      ctx.fillStyle = '#2f3e33'; ctx.fillRect(28, 30, 120, 54);
      ctx.strokeStyle = 'rgba(240,245,235,.55)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const y = 42 + i * 11;
        ctx.moveTo(38, y); ctx.lineTo(38 + 40 + (i % 3) * 22, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#e8e4d6'; ctx.fillRect(28, 84, 120, 4);

      // window with morning light coming in
      ctx.fillStyle = '#8b8f7d'; ctx.fillRect(206, 30, 76, 56);
      ctx.fillStyle = '#bfe3ff'; ctx.fillRect(210, 34, 68, 48);
      ctx.fillStyle = '#8b8f7d';
      ctx.fillRect(242, 30, 3, 56); ctx.fillRect(206, 56, 76, 3);
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.moveTo(210, 82); ctx.lineTo(278, 82);
      ctx.lineTo(232, FLOOR); ctx.lineTo(150, FLOOR);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      // floor
      ctx.fillStyle = '#8a7256'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#9b8163'; ctx.fillRect(0, FLOOR, VIEW_W, 3);
      ctx.fillStyle = 'rgba(0,0,0,.09)';
      for (let x = 0; x < VIEW_W; x += 26) ctx.fillRect(x, FLOOR + 3, 1, VIEW_H - FLOOR);

      // three desks; hers is the one on the right
      for (const dx of [56, 128, 206]) {
        ctx.fillStyle = '#a8814f'; ctx.fillRect(dx, FLOOR - 17, 44, 6);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(dx + 3, FLOOR - 11, 4, 11);
        ctx.fillRect(dx + 37, FLOOR - 11, 4, 11);
        ctx.fillStyle = '#8a6a3f'; ctx.fillRect(dx + 6, FLOOR - 12, 32, 3);
      }

      // her, arriving at her desk and settling in
      const walk = Math.min(1, t / 1.5);
      const x = 178 + walk * 34;
      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.child, walk < 1 ? 'stride' : 'idle', 1, x, FLOOR, bob);

      // her bag, set down once she gets there
      if (walk >= 1) {
        ctx.globalAlpha = Math.min(1, (t - 1.5) / 0.5);
        ctx.fillStyle = '#c4536a'; ctx.fillRect(196, FLOOR - 9, 12, 9);
        ctx.fillStyle = '#9c3d52'; ctx.fillRect(196, FLOOR - 9, 12, 3);
        ctx.globalAlpha = 1;
      }

      // dust in the light
      for (let i = 0; i < 12; i++) {
        const a = t * 0.5 + i * 0.7;
        ctx.globalAlpha = 0.2 + 0.25 * Math.sin(t * 2 + i);
        ctx.fillStyle = '#fff6d8';
        ctx.fillRect(Math.round(180 + Math.cos(a) * (20 + i * 4)),
                     Math.round(96 + Math.sin(a * 1.3) * 26 + i), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }
};

/* ============================== THEMES ============================ */
const THEMES = {
  monsoon: {
    sky: ['#4d5768', '#626b7c', '#7b8290'],
    far: '#495061', near: '#3c4354', under: '#232833',
    skyline: true, rain: true, windows: 'rgba(242,198,106,.55)',
    glow: 0.13, vignette: 'rgba(30,34,44,.28)'
  },
  afternoon: {
    sky: ['#7fbfe0', '#f0c98a', '#fae3bc'],
    far: '#b3947a', tree: '#86a06d', near: '#8a6a58', under: '#3c302a',
    skyline: false, rain: false, windows: 'rgba(255,224,150,.55)',
    glow: 0.07, vignette: 'rgba(120,70,30,.18)'
  },
  morning: {
    sky: ['#8fd3f4', '#c6e8f7', '#eaf3e0'],
    far: '#9db6a8', near: '#7d9a8a', under: '#4a4436',
    skyline: false, rain: false, windows: 'rgba(255,236,170,.4)',
    glow: 0.05, vignette: 'rgba(255,250,220,.12)'
  }
};
const theme = () => THEMES[(level && level.meta.theme) || 'monsoon'];

/* Skyline (or treeline) generated once per act. */
function buildBackdrop(lv) {
  skyline = [];
  let x = -40;
  let seed = 20020906;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const th = THEMES[lv.meta.theme] || THEMES.monsoon;

  while (x < lv.pxW + 200) {
    if (th.skyline) {
      const w = 26 + Math.floor(rnd() * 34);
      const h = 40 + Math.floor(rnd() * 62);
      skyline.push({ tree: false, x, w, h, lit: Array.from({ length: 12 }, () => rnd() > 0.55) });
      x += w + 4 + Math.floor(rnd() * 10);
    } else {
      // low houses with the odd tree between them
      const isTree = rnd() > 0.5;
      const w = isTree ? 22 : 30 + Math.floor(rnd() * 26);
      const h = isTree ? 46 + Math.floor(rnd() * 22) : 38 + Math.floor(rnd() * 40);
      skyline.push({ tree: isTree, x, w, h, lit: [] });
      x += w + 6 + Math.floor(rnd() * 14);
    }
  }

  rain = th.rain ? Array.from({ length: 90 }, () => ({
    x: Math.random() * VIEW_W, y: Math.random() * VIEW_H,
    len: 5 + Math.random() * 7, v: 4.5 + Math.random() * 3
  })) : [];
}

function drawBackdrop() {
  const th = theme();
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.sky[0]);
  g.addColorStop(0.6, th.sky[1]);
  g.addColorStop(1, th.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (!th.skyline) {
    // sun, and a few clouds drifting the other way to the camera
    ctx.fillStyle = 'rgba(255,241,176,.9)';
    ctx.beginPath(); ctx.arc(VIEW_W * 0.8, 30, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,241,176,.25)';
    ctx.beginPath(); ctx.arc(VIEW_W * 0.8, 30, 22, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 3; i++) {
      const cxp = ((i * 131 - cam.x * 0.12) % (VIEW_W + 120)) - 60;
      drawCloud(ctx, cxp, 24 + (i % 2) * 16, 0.42);
    }
  }

  const base = GROUND_Y * TILE - cam.y + 6;
  const px = cam.x * 0.35;
  for (const b of skyline) {
    const sx = b.x - px;
    if (sx + b.w < -30 || sx > VIEW_W + 30) continue;
    if (b.tree) {
      ctx.fillStyle = '#6f5a3c';
      ctx.fillRect(sx + b.w / 2 - 2, base - b.h * 0.42, 4, b.h * 0.42);
      ctx.fillStyle = th.tree || th.far;
      ctx.beginPath();
      ctx.arc(sx + b.w / 2, base - b.h * 0.62, b.w * 0.52, 0, Math.PI * 2);
      ctx.arc(sx + b.w / 2 - 8, base - b.h * 0.48, b.w * 0.36, 0, Math.PI * 2);
      ctx.arc(sx + b.w / 2 + 8, base - b.h * 0.48, b.w * 0.36, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = th.far;
      ctx.fillRect(sx, base - b.h, b.w, b.h);
      ctx.fillStyle = th.windows;
      for (let i = 0; i < b.lit.length; i++) {
        if (!b.lit[i] || i % 3) continue;
        const wx = sx + 4 + (i % 3) * 8;
        const wy = base - b.h + 7 + Math.floor(i / 3) * 11;
        if (wy < base - 4) ctx.fillRect(wx, wy, 3, 4);
      }
    }
  }

  const px2 = cam.x * 0.6;
  for (let i = 0; i < skyline.length; i += 2) {
    const b = skyline[i];
    if (b.tree) continue;
    const sx = b.x * 0.8 - px2;
    if (sx + b.w < -30 || sx > VIEW_W + 30) continue;
    ctx.fillStyle = th.near;
    ctx.fillRect(sx, base + 4 - b.h * 0.7, b.w * 0.9, b.h * 0.7);
  }

  // everything under the road is underneath the city, not sky
  ctx.fillStyle = th.under;
  ctx.fillRect(0, GROUND_Y * TILE - cam.y, VIEW_W, VIEW_H);

  drawInteriorWalls();
}

/* Indoor stretches get a back wall painted over the sky, so a corridor
   does not show a treeline through it. */
function drawInteriorWalls() {
  for (const span of (level.meta.indoorSpans || [])) {
    const x0 = Math.max(0, span.from * TILE - cam.x);
    const x1 = Math.min(VIEW_W, span.to * TILE - cam.x);
    if (x1 <= x0) continue;
    const top = CEIL_Y * TILE - cam.y;
    const floor = GROUND_Y * TILE - cam.y;

    const iw = level.meta.interiorWall ||
               { top: '#cbb894', bottom: '#bda884', skirt: '#a8946f' };
    const wall = ctx.createLinearGradient(0, top, 0, floor);
    wall.addColorStop(0, iw.top);
    wall.addColorStop(1, iw.bottom);
    ctx.fillStyle = wall;
    ctx.fillRect(x0, top, x1 - x0, floor - top);

    ctx.fillStyle = iw.skirt;           // skirting
    ctx.fillRect(x0, floor - 5, x1 - x0, 5);
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.fillRect(x0, top, x1 - x0, 3);

    // tube lights, so the ceiling is not one blank slab
    const first = Math.floor((cam.x + x0) / 96) * 96;
    for (let wx = first; wx < cam.x + x1 + 96; wx += 96) {
      const lx = wx - cam.x;
      if (lx < x0 - 40 || lx > x1) continue;
      ctx.fillStyle = '#8a7a5c';
      ctx.fillRect(lx + 14, top, 2, 7);
      ctx.fillRect(lx + 34, top, 2, 7);
      ctx.fillStyle = '#fdf6d8';
      ctx.fillRect(lx + 8, top + 7, 34, 4);
      ctx.fillStyle = 'rgba(255,246,200,.14)';
      ctx.fillRect(lx + 2, top + 11, 46, 22);
    }
  }
}

/* =============================== PROPS ============================ */
const FRONT_PROPS = new Set(['bus', 'auto', 'hospital', 'schoolfront', 'desk',
                             'herdesk', 'bench', 'schoolgate', 'blackboard',
                             'noticeboard', 'streetsign', 'mangotree',
                             'housefront', 'housegate', 'bookshelf',
                             'painting', 'doorway', 'railing', 'plantpot',
                             'easel', 'rug', 'mangouncle', 'guardpost', 'tv', 'musicfront', 'musicgate',
                             'instrumentwall', 'musicposter', 'piano',
                             'harmoniumspot', 'mallyasign', 'harmonium',
                             'flute', 'degree', 'kotasign', 'allenfront',
                             'icecream', 'bakery', 'musicschool',
                             'icemanshop', 'baker', 'coffeeman', 'puzzlebox',
                             'shantanuspot', 'akashspot', 'moodlefriendspot', 'counterspot',
                             'classmateA', 'classmateB',
                             'interviewer', 'micstand', 'biryani',
                             'collegegate', 'kfcfront', 'cafecounter', 'audifront',
                             'gamerig', 'cat', 'treecat',
                             'juicecorner', 'juicemanspot', 'goodfriendspot',
                             'towers', 'societygate', 'cab', 'coffeeshop', 'dxcfront',
                             'cafemanspot', 'laptopgrid',
                             'hostelbed', 'studydesk', 'wallclock', 'anamspot',
                             'coffeestall', 'examdesk', 'herexamdesk',
                             'physicsclass']);

function drawProps(layer) {
  const base = GROUND_Y * TILE - cam.y;
  for (const p of level.meta.props) {
    if (FRONT_PROPS.has(p.type) !== (layer === 'front')) continue;
    const sx = p.x * TILE - cam.x;
    if (sx < -180 || sx > VIEW_W + 180) continue;

    switch (p.type) {

      case 'streetlight': {
        ctx.fillStyle = '#2f2a3d';
        ctx.fillRect(sx + 7, base - 46, 3, 46);
        ctx.fillRect(sx + 7, base - 48, 10, 3);
        ctx.fillStyle = '#ffe08a';
        ctx.fillRect(sx + 14, base - 46, 5, 4);
        const grd = ctx.createRadialGradient(sx + 16, base - 44, 2, sx + 16, base - 44, 44);
        grd.addColorStop(0, `rgba(255,215,130,${theme().glow})`);
        grd.addColorStop(1, 'rgba(255,215,130,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(sx - 28, base - 88, 88, 92);
        break;
      }

      case 'checkpoint':
        ctx.fillStyle = '#8e97a8';
        ctx.fillRect(sx + 7, base - 26, 2, 26);
        ctx.fillStyle = player && player.x > p.x * TILE ? '#7bd36b' : '#c4536a';
        ctx.fillRect(sx + 9, base - 26, 10, 7);
        break;

      case 'bus': {
        const w = p.w * TILE, h = p.h * TILE;
        ctx.fillStyle = '#e4dcc6'; ctx.fillRect(sx, base - h, w, h);
        ctx.fillStyle = '#b03a34'; ctx.fillRect(sx, base - h + h * 0.58, w, 7);
        ctx.fillStyle = '#8d2f2a'; ctx.fillRect(sx, base - h, w, 4);
        ctx.fillStyle = '#2b3346';
        for (let i = 0; i < p.w - 1; i++) ctx.fillRect(sx + 5 + i * TILE, base - h + 8, 11, 13);
        ctx.fillStyle = '#1c1a24';
        ctx.fillRect(sx + 6, base - 7, 10, 7);
        ctx.fillRect(sx + w - 16, base - 7, 10, 7);
        ctx.fillStyle = '#6a6255'; ctx.fillRect(sx, base - h + h * 0.58 + 7, w, 2);
        break;
      }

      case 'auto': {
        const w = 2 * TILE;
        ctx.fillStyle = '#111014'; ctx.fillRect(sx + 2, base - 13, w - 4, 10);
        ctx.fillStyle = '#f2c11e'; ctx.fillRect(sx + 1, base - 20, w - 2, 8);
        ctx.fillStyle = '#8a6d10'; ctx.fillRect(sx + 1, base - 20, w - 2, 2);
        ctx.fillStyle = '#2b3346'; ctx.fillRect(sx + 5, base - 18, 9, 5);
        ctx.fillStyle = '#1c1a24';
        ctx.fillRect(sx + 4, base - 5, 6, 5);
        ctx.fillRect(sx + w - 10, base - 5, 6, 5);
        break;
      }

      case 'hospital': {
        const w = p.w * TILE, top = 2 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x, cx = dx + TILE;
        ctx.fillStyle = 'rgba(255,226,150,.7)';
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 18 + r * 22;
            if (wy > base - 84 || (r * 7 + c) % 3 === 0) continue;
            ctx.fillRect(sx + 6 + c * TILE, wy, 6, 8);
          }
        ctx.fillStyle = '#d94f5c';
        ctx.fillRect(cx - 3, top + 8, 7, 21);
        ctx.fillRect(cx - 10, top + 15, 21, 7);
        signboard(cx, base - 78, 86, 'MANIPAL');
        ctx.fillStyle = '#5a627a';
        ctx.fillRect(sx, base - 51, (p.doorX + 2 - p.x) * TILE, 4);
        ctx.fillStyle = '#4a5166'; ctx.fillRect(sx + 2, base - 47, 5, 47);
        ctx.fillStyle = '#ffdca0'; ctx.fillRect(dx, base - 44, 32, 44);
        ctx.fillStyle = '#e8b878'; ctx.fillRect(dx + 15, base - 44, 2, 44);
        break;
      }

      /* ------------------------- level 2 ------------------------- */

      case 'home': {
        ctx.fillStyle = '#d9c8a8'; ctx.fillRect(sx - 6, base - 54, 58, 54);
        ctx.fillStyle = '#b4643f'; ctx.fillRect(sx - 12, base - 62, 70, 9);
        ctx.fillStyle = '#7c5a3a'; ctx.fillRect(sx + 12, base - 30, 15, 30);
        ctx.fillStyle = '#9ec8de'; ctx.fillRect(sx + 2, base - 44, 12, 12);
        ctx.fillRect(sx + 32, base - 44, 12, 12);
        ctx.fillStyle = '#c8b697';
        ctx.fillRect(sx + 2, base - 38, 12, 1); ctx.fillRect(sx + 32, base - 38, 12, 1);
        break;
      }

      case 'tree': {
        ctx.fillStyle = '#6b5236';
        ctx.fillRect(sx + 6, base - 34, 5, 34);
        ctx.fillStyle = '#4e8a4a';
        ctx.beginPath();
        ctx.arc(sx + 8, base - 42, 15, 0, Math.PI * 2);
        ctx.arc(sx - 4, base - 34, 11, 0, Math.PI * 2);
        ctx.arc(sx + 20, base - 34, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#61a45a';
        ctx.beginPath(); ctx.arc(sx + 4, base - 46, 8, 0, Math.PI * 2); ctx.fill();
        break;
      }

      case 'bench': {
        const w = 2 * TILE;
        ctx.fillStyle = '#8a6a3f'; ctx.fillRect(sx, base - 16, w, 5);
        ctx.fillStyle = '#6f5433';
        ctx.fillRect(sx + 2, base - 11, 4, 11);
        ctx.fillRect(sx + w - 6, base - 11, 4, 11);
        ctx.fillRect(sx, base - 24, w, 4);
        break;
      }

      case 'flagpole': {
        ctx.fillStyle = '#b9bfc9'; ctx.fillRect(sx + 7, base - 68, 3, 68);
        ctx.fillStyle = '#e8e2d4'; ctx.fillRect(sx + 2, base - 4, 14, 4);
        ctx.fillStyle = '#f0952a'; ctx.fillRect(sx + 10, base - 68, 22, 5);
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx + 10, base - 63, 22, 5);
        ctx.fillStyle = '#2f7d43'; ctx.fillRect(sx + 10, base - 58, 22, 5);
        break;
      }

      case 'schoolgate': {
        const open = !!(level.meta.gate && level.meta.gate.opened);
        ctx.fillStyle = '#7a8493';
        ctx.fillRect(sx - 2, base - 52, 8, 52);
        ctx.fillRect(sx + 42, base - 52, 8, 52);
        ctx.fillStyle = '#8f99a8'; ctx.fillRect(sx - 6, base - 58, 60, 7);
        ctx.fillStyle = '#9aa4b3';
        if (open) {
          // both leaves folded back against their posts
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(sx + 1 + i * 3, base - 44, 2, 44);
            ctx.fillRect(sx + 44 + i * 3, base - 44, 2, 44);
          }
        } else {
          for (let i = 0; i < 6; i++) ctx.fillRect(sx + 8 + i * 6, base - 44, 3, 44);
          ctx.fillRect(sx + 6, base - 34, 38, 3);
          ctx.fillStyle = '#c8a23a';                 // padlock
          ctx.fillRect(sx + 22, base - 30, 7, 6);
          ctx.fillStyle = '#8f99a8';
          ctx.fillRect(sx + 24, base - 34, 3, 4);
        }
        signboard(sx + 24, base - 84, 112, SCHOOL_NAME);
        break;
      }

      case 'schoolfront': {
        const w = p.w * TILE, top = 2 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = 'rgba(190,220,240,.55)';
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 16 + r * 20;
            if (wy > base - 62) continue;
            ctx.fillRect(sx + 5 + c * TILE, wy, 9, 11);
          }
        ctx.fillStyle = '#b4643f'; ctx.fillRect(sx - 4, top, w + 8, 7);
        ctx.fillStyle = '#5b4a3a'; ctx.fillRect(dx - 2, base - 46, 36, 46);
        ctx.fillStyle = '#f6e8c8'; ctx.fillRect(dx, base - 43, 32, 43);
        ctx.fillStyle = '#c8b48c'; ctx.fillRect(dx + 15, base - 43, 2, 43);
        break;
      }

      case 'mangouncle':
        drawCharacter(ctx, CHARACTERS.mangouncle, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 850) > 0 ? 0 : 1);
        break;

      /* The two shopkeepers of the growing-up walk, each stood outside
         his own place with a small counter to lean on. */
      case 'icemanshop':
      case 'baker': {
        const who = p.type === 'baker' ? CHARACTERS.baker : CHARACTERS.icemanshop;
        ctx.fillStyle = p.type === 'baker' ? '#8a6a44' : '#c98ba0';
        ctx.fillRect(sx - 4, base - 12, 28, 12);
        ctx.fillStyle = p.type === 'baker' ? '#a8834f' : '#e0a6b8';
        ctx.fillRect(sx - 4, base - 12, 28, 2);
        drawCharacter(ctx, who, 'idle', 1, sx + 10, base,
                      Math.sin(performance.now() / 850) > 0 ? 0 : 1);
        break;
      }

      case 'guardpost': {
        drawCharacter(ctx, CHARACTERS.guard, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 900) > 0 ? 0 : 1);
        // his stool, off to one side, so the post looks lived in
        ctx.fillStyle = '#6b5334';
        ctx.fillRect(sx + 20, base - 9, 12, 3);
        ctx.fillRect(sx + 21, base - 6, 2, 6);
        ctx.fillRect(sx + 29, base - 6, 2, 6);
        break;
      }

      case 'streetsign': {
        ctx.fillStyle = '#8e97a8';
        ctx.fillRect(sx + 8, base - 40, 3, 40);
        ctx.fillStyle = '#2f6b8f';
        ctx.fillRect(sx - 22, base - 52, 64, 14);
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.text || LOCALITY, sx + 10, base - 42);
        ctx.textAlign = 'left';
        break;
      }

      case 'mangotree': {
        const w = p.w * TILE;
        const cxp = sx + w / 2;
        // trunk
        ctx.fillStyle = '#6b5236';
        ctx.fillRect(cxp - 6, base - 96, 12, 96);
        ctx.fillStyle = '#5a4429';
        ctx.fillRect(cxp - 6, base - 96, 4, 96);
        // roots
        ctx.fillRect(cxp - 14, base - 6, 9, 6);
        ctx.fillRect(cxp + 6, base - 6, 9, 6);
        // limbs out to each branch platform
        ctx.strokeStyle = '#6b5236';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (const br of p.branches) {
          const bx = (br.x + br.len / 2) * TILE - cam.x;
          const by = br.row * TILE - cam.y;
          ctx.moveTo(cxp, by + 10);
          ctx.lineTo(bx, by + 2);
        }
        ctx.stroke();
        // the branch platforms themselves
        for (const br of p.branches) {
          const bx = br.x * TILE - cam.x;
          const by = br.row * TILE - cam.y;
          ctx.fillStyle = '#7a5f3c';
          ctx.fillRect(bx, by, br.len * TILE, 5);
          ctx.fillStyle = '#8f7148';
          ctx.fillRect(bx, by, br.len * TILE, 2);
        }
        // canopy, drawn last so it sits over the limbs
        ctx.fillStyle = '#3f7a3c';
        for (const [ox, oy, r] of [[0, -104, 40], [-30, -88, 28], [32, -88, 28],
                                   [-16, -116, 26], [18, -116, 26]]) {
          ctx.beginPath();
          ctx.arc(cxp + ox, base + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#4f9448';
        for (const [ox, oy, r] of [[-8, -120, 20], [26, -100, 18], [-34, -98, 16]]) {
          ctx.beginPath();
          ctx.arc(cxp + ox, base + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'housegate': {
        ctx.fillStyle = '#7c6a52';
        ctx.fillRect(sx, base - 30, 4, 30);
        ctx.fillRect(sx + 34, base - 30, 4, 30);
        ctx.fillStyle = '#95815f';
        for (let i = 0; i < 5; i++) ctx.fillRect(sx + 7 + i * 6, base - 24, 3, 24);
        ctx.fillRect(sx + 4, base - 26, 32, 3);
        ctx.fillRect(sx + 4, base - 12, 32, 3);
        break;
      }

      case 'housefront': {
        const w = p.w * TILE, top = 3 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        // sloped roof
        ctx.fillStyle = '#8a4b3a';
        ctx.beginPath();
        ctx.moveTo(sx - 8, top + 4);
        ctx.lineTo(sx + w / 2, top - 16);
        ctx.lineTo(sx + w + 8, top + 4);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6f3b2d';
        ctx.fillRect(sx - 8, top + 4, w + 16, 5);
        // the balcony she will end up on
        ctx.fillStyle = '#b08e70';
        ctx.fillRect(sx + 10, top + 34, 54, 4);
        ctx.fillStyle = '#c9a98a';
        for (let i = 0; i < 8; i++) ctx.fillRect(sx + 12 + i * 7, top + 22, 3, 12);
        // windows
        ctx.fillStyle = '#f5d78e';
        ctx.fillRect(sx + w - 44, top + 20, 15, 17);
        ctx.fillRect(sx + w - 24, top + 20, 15, 17);
        // the front door
        ctx.fillStyle = '#5b3a28'; ctx.fillRect(dx - 3, base - 48, 38, 48);
        ctx.fillStyle = '#7c4f34'; ctx.fillRect(dx, base - 45, 32, 45);
        ctx.fillStyle = '#e8c37a'; ctx.fillRect(dx + 26, base - 25, 3, 3);
        break;
      }

      case 'rug': {
        ctx.fillStyle = '#8a4b52'; ctx.fillRect(sx, base - 4, 74, 4);
        ctx.fillStyle = '#a85e63'; ctx.fillRect(sx + 6, base - 4, 62, 2);
        break;
      }

      case 'deskpc': {
        /* Whoever is at it. `who` names them, `who: null` means the
           station is free, and leaving it out keeps Uncle at his own
           desk in Level 3, which is the only one he sits at. */
        const at = p.who === undefined ? CHARACTERS.husband
                 : p.who ? CHARACTERS[p.who] : null;
        // the desk is deliberately low: at this scale a normal-height
        // one hides a 24px person completely
        if (at) drawCharacter(ctx, at, 'idle', 1, sx + 44, base,
                              Math.sin(performance.now() / 900) > 0 ? 0 : 1);
        const top = base - 14;
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx, top, 60, 4);
        ctx.fillStyle = '#573b28';
        ctx.fillRect(sx + 3, top + 4, 4, 10);
        ctx.fillRect(sx + 53, top + 4, 4, 10);
        // a boxy old monitor, glowing, off to his left
        ctx.fillStyle = '#d8d3c6'; ctx.fillRect(sx + 4, top - 20, 28, 20);
        ctx.fillStyle = '#3a5b6b'; ctx.fillRect(sx + 7, top - 17, 22, 13);
        ctx.fillStyle = 'rgba(150,220,255,.16)';
        ctx.fillRect(sx - 4, top - 27, 44, 28);
        ctx.fillStyle = '#b8b2a4'; ctx.fillRect(sx + 34, top - 3, 20, 3);
        break;
      }

      /* Her machine, with the game already up on it. */
      case 'gamerig': {
        ctx.fillStyle = '#4a3f56'; ctx.fillRect(sx, base - 16, 62, 5);
        ctx.fillStyle = '#3a3145';
        ctx.fillRect(sx + 4, base - 11, 5, 11);
        ctx.fillRect(sx + 53, base - 11, 5, 11);
        // the tower under it, with its light on
        ctx.fillStyle = '#2b2536'; ctx.fillRect(sx + 44, base - 11, 14, 11);
        ctx.fillStyle = '#8fe08f'; ctx.fillRect(sx + 55, base - 9, 2, 2);
        // the monitor
        ctx.fillStyle = '#211c2c'; ctx.fillRect(sx + 6, base - 50, 48, 34);
        ctx.fillStyle = '#0e1420'; ctx.fillRect(sx + 9, base - 47, 42, 28);
        // what is on it
        ctx.fillStyle = '#1c2a3e'; ctx.fillRect(sx + 9, base - 47, 42, 20);
        ctx.fillStyle = '#c8402f';
        ctx.fillRect(sx + 30 + Math.round(Math.sin(performance.now() / 700) * 5),
                     base - 40, 3, 5);
        ctx.strokeStyle = '#8fe08f'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx + 26, base - 36); ctx.lineTo(sx + 34, base - 36);
        ctx.moveTo(sx + 30, base - 40); ctx.lineTo(sx + 30, base - 32);
        ctx.stroke();
        ctx.fillStyle = '#f2c14a';
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillText('VALORANT', sx + 12, base - 22);
        // and the keyboard, lit the way they always are
        ctx.fillStyle = '#2b2536'; ctx.fillRect(sx + 12, base - 15, 36, 4);
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = ['#c8402f', '#f2c14a', '#8fe08f', '#4aa8d8'][i % 4];
          ctx.fillRect(sx + 14 + i * 4, base - 14, 2, 2);
        }
        const gl = ctx.createRadialGradient(sx + 30, base - 34, 4, sx + 30, base - 34, 46);
        gl.addColorStop(0, 'rgba(120,190,255,.20)');
        gl.addColorStop(1, 'rgba(120,190,255,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(sx - 16, base - 80, 92, 74);
        break;
      }

      case 'bookshelf': {
        ctx.fillStyle = '#5f4128'; ctx.fillRect(sx, base - 62, 46, 62);
        ctx.fillStyle = '#3f2b19';
        for (let r = 0; r < 3; r++) ctx.fillRect(sx + 2, base - 58 + r * 19, 42, 3);
        const cols = ['#c8324b', '#3f8f4a', '#3c62b4', '#ef8a3c', '#7d5bbe', '#f5cd24'];
        for (let r = 0; r < 3; r++)
          for (let i = 0; i < 7; i++) {
            ctx.fillStyle = cols[(r * 7 + i) % cols.length];
            ctx.fillRect(sx + 4 + i * 6, base - 55 + r * 19, 4, 13);
          }
        break;
      }

      case 'painting': {
        ctx.fillStyle = '#7c5a34'; ctx.fillRect(sx, base - 60, 40, 32);
        ctx.fillStyle = '#f2e6c8'; ctx.fillRect(sx + 3, base - 57, 34, 26);
        ctx.fillStyle = '#8fb96a'; ctx.fillRect(sx + 3, base - 40, 34, 9);
        ctx.fillStyle = '#e0894a';
        ctx.beginPath(); ctx.arc(sx + 27, base - 48, 5, 0, Math.PI * 2); ctx.fill();
        break;
      }

      case 'doorway': {
        ctx.fillStyle = '#5b3a28'; ctx.fillRect(sx - 4, base - 58, 40, 58);
        ctx.fillStyle = '#f4dfae'; ctx.fillRect(sx, base - 54, 32, 54);
        ctx.fillStyle = 'rgba(255,224,160,.30)';
        ctx.fillRect(sx - 10, base - 62, 52, 62);
        break;
      }

      case 'railing': {
        const w = (p.w || 12) * TILE;
        ctx.fillStyle = '#b08e70'; ctx.fillRect(sx, base - 34, w, 5);
        ctx.fillStyle = '#c9a98a';
        for (let i = 0; i * 8 < w; i++) ctx.fillRect(sx + i * 8, base - 29, 3, 29);
        ctx.fillStyle = '#9b7a5e'; ctx.fillRect(sx, base - 6, w, 6);
        break;
      }

      case 'plantpot': {
        ctx.fillStyle = '#3f8f4a';
        for (const [ox, oy, r] of [[8, -30, 9], [1, -22, 7], [15, -22, 7]]) {
          ctx.beginPath(); ctx.arc(sx + ox, base + oy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#b1633c'; ctx.fillRect(sx + 2, base - 14, 14, 14);
        ctx.fillStyle = '#c9754a'; ctx.fillRect(sx, base - 17, 18, 4);
        break;
      }

      case 'easel': {
        // she stands on the near side, facing into the canvas
        drawCharacter(ctx, CHARACTERS.tutor, 'idle', 1, sx + 6, base,
                      Math.sin(performance.now() / 800) > 0 ? 0 : 1);
        ctx.strokeStyle = '#8a6a3f'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx + 26, base); ctx.lineTo(sx + 36, base - 42);
        ctx.moveTo(sx + 50, base); ctx.lineTo(sx + 40, base - 42);
        ctx.moveTo(sx + 38, base - 20); ctx.lineTo(sx + 47, base - 4);
        ctx.stroke();
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx + 20, base - 40, 36, 4);
        ctx.fillStyle = '#fbf6ea'; ctx.fillRect(sx + 22, base - 66, 32, 27);
        ctx.fillStyle = '#c8324b';
        ctx.beginPath(); ctx.arc(sx + 34, base - 54, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3f8f4a'; ctx.fillRect(sx + 28, base - 47, 20, 5);
        break;
      }

      case 'musicgate': {
        ctx.fillStyle = '#7a6a84';
        ctx.fillRect(sx, base - 34, 5, 34);
        ctx.fillRect(sx + 40, base - 34, 5, 34);
        ctx.fillStyle = '#8f7d9a'; ctx.fillRect(sx - 4, base - 40, 53, 6);
        ctx.fillStyle = '#a08cb0';
        for (let i = 0; i < 6; i++) ctx.fillRect(sx + 8 + i * 6, base - 28, 3, 28);
        break;
      }

      case 'musicfront': {
        const w = p.w * TILE, top = 3 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = '#8e5f7c'; ctx.fillRect(sx - 6, top - 6, w + 12, 9);
        // windows
        ctx.fillStyle = 'rgba(255,240,200,.6)';
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 14 + r * 20;
            if (wy > base - 62) continue;
            ctx.fillRect(sx + 5 + c * TILE, wy, 9, 11);
          }
        // a big treble clef on the wall
        ctx.strokeStyle = '#f6e3a8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx + w - 34, base - 74, 7, 0, Math.PI * 2);
        ctx.moveTo(sx + w - 34, base - 81);
        ctx.lineTo(sx + w - 30, base - 108);
        ctx.stroke();
        signboard(sx + w / 2, base - 58, 118, MUSIC_SCHOOL_NAME);
        // doorway
        ctx.fillStyle = '#4a3040'; ctx.fillRect(dx - 3, base - 46, 38, 46);
        ctx.fillStyle = '#ffdca0'; ctx.fillRect(dx, base - 43, 32, 43);
        ctx.fillStyle = '#e0b98a'; ctx.fillRect(dx + 15, base - 43, 2, 43);
        break;
      }

      case 'instrumentwall': {
        // a guitar and a pair of tablas hung on the wall
        ctx.fillStyle = '#8a5a34';
        ctx.beginPath(); ctx.ellipse(sx + 12, base - 40, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5f3d22';
        ctx.beginPath(); ctx.arc(sx + 12, base - 42, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx + 11, base - 68, 3, 18);
        ctx.fillStyle = '#c9a227'; ctx.fillRect(sx + 10, base - 71, 5, 4);
        ctx.fillStyle = '#b9793f';
        ctx.fillRect(sx + 30, base - 44, 13, 14);
        ctx.fillRect(sx + 46, base - 40, 11, 10);
        ctx.fillStyle = '#efe4cf';
        ctx.fillRect(sx + 30, base - 46, 13, 3);
        ctx.fillRect(sx + 46, base - 42, 11, 3);
        break;
      }

      case 'allenfront': {
        const w = p.w * TILE, top = 3 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = '#9c5f3c'; ctx.fillRect(sx - 6, top - 6, w + 12, 9);
        ctx.fillStyle = 'rgba(255,240,200,.55)';
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 14 + r * 20;
            if (wy > base - 62) continue;
            ctx.fillRect(sx + 5 + c * TILE, wy, 9, 11);
          }
        signboard(sx + w / 2, base - 58, 108, ['ALLEN', 'KOTA']);
        ctx.fillStyle = '#4a3040'; ctx.fillRect(dx - 3, base - 46, 38, 46);
        ctx.fillStyle = '#ffdca0'; ctx.fillRect(dx, base - 43, 32, 43);
        ctx.fillStyle = '#e0b98a'; ctx.fillRect(dx + 15, base - 43, 2, 43);
        break;
      }

      case 'hostelbed': {
        ctx.fillStyle = '#7d6a55'; ctx.fillRect(sx, base - 20, 4, 20);
        ctx.fillRect(sx + 58, base - 16, 4, 16);
        ctx.fillStyle = '#cdbfa6'; ctx.fillRect(sx, base - 14, 62, 8);
        ctx.fillStyle = '#e8dfcc'; ctx.fillRect(sx + 4, base - 19, 18, 6);
        ctx.fillStyle = '#8a6f8f'; ctx.fillRect(sx + 24, base - 15, 36, 3);
        break;
      }

      case 'studydesk': {
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx, base - 17, 58, 4);
        ctx.fillStyle = '#573b28';
        ctx.fillRect(sx + 3, base - 13, 4, 13);
        ctx.fillRect(sx + 51, base - 13, 4, 13);
        // books, papers, and a lamp burning
        ctx.fillStyle = '#c8324b'; ctx.fillRect(sx + 6, base - 24, 7, 7);
        ctx.fillStyle = '#3c62b4'; ctx.fillRect(sx + 14, base - 22, 7, 5);
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 24, base - 19, 18, 2);
        ctx.fillStyle = '#8e97a8'; ctx.fillRect(sx + 47, base - 30, 2, 13);
        ctx.fillStyle = '#e8b93c'; ctx.fillRect(sx + 42, base - 35, 12, 5);
        const gl = ctx.createRadialGradient(sx + 48, base - 30, 3, sx + 48, base - 30, 34);
        gl.addColorStop(0, 'rgba(255,226,140,.30)');
        gl.addColorStop(1, 'rgba(255,226,140,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(sx + 12, base - 64, 74, 66);
        break;
      }

      case 'wallclock': {
        ctx.fillStyle = '#e8ddd0';
        ctx.beginPath(); ctx.arc(sx + 10, base - 54, 11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3b2d33'; ctx.lineWidth = 1;
        const tt = performance.now() / 1000;
        ctx.beginPath();
        ctx.moveTo(sx + 10, base - 54);
        ctx.lineTo(sx + 10 + Math.cos(tt - 1.6) * 7, base - 54 + Math.sin(tt - 1.6) * 7);
        ctx.moveTo(sx + 10, base - 54);
        ctx.lineTo(sx + 10 + Math.cos(tt / 12 - 1.6) * 4.5,
                   base - 54 + Math.sin(tt / 12 - 1.6) * 4.5);
        ctx.stroke();
        break;
      }

      case 'physicsclass': {
        drawCharacter(ctx, CHARACTERS.physicsteacher, 'idle', 1, sx + 66, base,
                      Math.sin(performance.now() / 840) > 0 ? 0 : 1);
        // blackboard with a parabola already on it
        ctx.fillStyle = '#6b5334'; ctx.fillRect(sx - 6, base - 76, 108, 54);
        ctx.fillStyle = '#2f3e33'; ctx.fillRect(sx - 2, base - 72, 100, 46);
        ctx.strokeStyle = 'rgba(240,245,235,.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const u2 = i / 40;
          const px2 = sx + 6 + u2 * 60;
          const py2 = base - 34 - Math.sin(u2 * Math.PI) * 26;
          i ? ctx.lineTo(px2, py2) : ctx.moveTo(px2, py2);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx + 6, base - 34); ctx.lineTo(sx + 70, base - 34);
        ctx.moveTo(sx + 6, base - 34); ctx.lineTo(sx + 6, base - 66);
        ctx.stroke();
        ctx.fillStyle = '#e8e4d6'; ctx.fillRect(sx - 2, base - 26, 100, 4);
        break;
      }

      case 'coffeeman':
        drawCharacter(ctx, CHARACTERS.coffeeman, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 810) > 0 ? 0 : 1);
        break;

      /* The puzzle box on her bedroom floor. Once she has opened it the
         lid is off and the pieces are showing. */
      case 'puzzlebox': {
        const open = !!(level.meta.box && level.meta.box.open);
        ctx.fillStyle = '#3a5f8a'; ctx.fillRect(sx, base - 13, 34, 13);
        ctx.fillStyle = '#2c4a6d'; ctx.fillRect(sx, base - 13, 34, 2);
        if (open) {
          // the lid, leaned against the side, and pieces spilling out
          ctx.fillStyle = '#4a74a4'; ctx.fillRect(sx + 34, base - 20, 4, 20);
          ctx.fillStyle = '#2c4a6d'; ctx.fillRect(sx + 34, base - 20, 4, 2);
          const cols = ['#1d2246', '#cfc7ad', '#d8a86a', '#7d8fc4'];
          for (let i = 0; i < 8; i++) {
            ctx.fillStyle = cols[i % 4];
            ctx.fillRect(sx + 3 + (i % 4) * 8, base - 11 - Math.floor(i / 4) * 6, 6, 5);
          }
        } else {
          ctx.fillStyle = '#4a74a4'; ctx.fillRect(sx - 2, base - 17, 38, 5);
          ctx.fillStyle = '#2c4a6d'; ctx.fillRect(sx - 2, base - 17, 38, 1);
          // a moon and a star printed on the lid
          ctx.fillStyle = '#f4e9c8';
          ctx.beginPath(); ctx.arc(sx + 12, base - 14.5, 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#4a74a4';
          ctx.beginPath(); ctx.arc(sx + 13.4, base - 15.4, 2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f4e9c8';
          ctx.fillRect(sx + 22, base - 15, 2, 2);
        }
        break;
      }

      /* The towers of the society she woke up in. */
      case 'towers': {
        const cols = ['#c8bfae', '#d4cbb8', '#bdb4a3'];
        for (let i = 0; i < 3; i++) {
          const tx = sx + i * 34, th = 96 + (i % 2) * 22;
          ctx.fillStyle = cols[i % 3];
          ctx.fillRect(tx, base - th, 30, th);
          ctx.fillStyle = 'rgba(0,0,0,.12)';
          ctx.fillRect(tx, base - th, 4, th);
          ctx.fillStyle = '#9fc4d8';
          for (let r = 0; r < Math.floor(th / 14) - 1; r++)
            for (let c = 0; c < 3; c++)
              ctx.fillRect(tx + 5 + c * 8, base - th + 8 + r * 14, 5, 8);
          ctx.fillStyle = '#8a8274';
          ctx.fillRect(tx - 2, base - th - 4, 34, 5);
        }
        break;
      }

      /* Its gate, with the name of the place on the board. */
      case 'societygate': {
        ctx.fillStyle = '#9aa08e';
        ctx.fillRect(sx - 2, base - 50, 8, 50);
        ctx.fillRect(sx + 58, base - 50, 8, 50);
        ctx.fillStyle = '#b0b6a2'; ctx.fillRect(sx - 6, base - 58, 76, 9);
        ctx.fillStyle = '#7f8674';
        for (let i = 0; i < 6; i++) ctx.fillRect(sx + 10 + i * 8, base - 40, 3, 40);
        signboard(sx + 32, base - 88, 150, ['LOTUS', 'BOULEVARD']);
        break;
      }

      /* The cab, waiting with its engine going. */
      case 'cab': {
        ctx.fillStyle = '#f2c14a'; ctx.fillRect(sx, base - 20, 66, 14);
        ctx.fillStyle = '#d8a52f'; ctx.fillRect(sx, base - 20, 66, 3);
        ctx.fillStyle = '#f2c14a';
        ctx.beginPath();
        ctx.moveTo(sx + 12, base - 20); ctx.lineTo(sx + 50, base - 20);
        ctx.lineTo(sx + 44, base - 34); ctx.lineTo(sx + 20, base - 34);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3a4152';
        ctx.fillRect(sx + 22, base - 32, 9, 11);
        ctx.fillRect(sx + 33, base - 32, 9, 11);
        ctx.fillStyle = '#241b26';
        ctx.beginPath(); ctx.arc(sx + 15, base - 5, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 51, base - 5, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6b6f7c';
        ctx.beginPath(); ctx.arc(sx + 15, base - 5, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 51, base - 5, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#241b26'; ctx.fillRect(sx + 24, base - 40, 18, 6);
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx + 25, base - 39, 16, 4);
        ctx.fillStyle = '#241b26';
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.fillText('TAXI', sx + 26, base - 35);
        break;
      }

      /* The coffee place on the corner. */
      case 'coffeeshop': {
        ctx.fillStyle = '#2f4a3f'; ctx.fillRect(sx - 6, base - 56, 78, 56);
        ctx.fillStyle = '#3f6152'; ctx.fillRect(sx - 10, base - 66, 86, 11);
        ctx.fillStyle = '#e8dfc8';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('COFFEE', sx + 33, base - 58);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1f3229'; ctx.fillRect(sx + 2, base - 44, 26, 22);
        ctx.fillStyle = '#ffe6b4'; ctx.fillRect(sx + 4, base - 42, 22, 18);
        ctx.fillStyle = '#1f3229'; ctx.fillRect(sx + 42, base - 44, 26, 22);
        ctx.fillStyle = '#ffe6b4'; ctx.fillRect(sx + 44, base - 42, 22, 18);
        ctx.fillStyle = '#5b3a26'; ctx.fillRect(sx + 30, base - 40, 12, 40);
        ctx.fillStyle = '#ffe6b4'; ctx.fillRect(sx + 32, base - 37, 8, 37);
        // a cup on the sign
        const cx2 = sx + 78, cy2 = base - 62;
        ctx.fillStyle = '#f2eee4'; ctx.fillRect(cx2 - 5, cy2, 10, 12);
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(cx2 - 5, cy2 + 4, 10, 4);
        ctx.fillStyle = '#3a3040'; ctx.fillRect(cx2 - 6, cy2 - 3, 12, 3);
        ctx.fillStyle = 'rgba(240,232,214,.5)';
        for (let i = 0; i < 3; i++)
          ctx.fillRect(cx2 - 3 + i * 3,
                       cy2 - 9 - ((performance.now() / 500 + i) % 1) * 5, 1, 3);
        break;
      }

      /* Where she works. Glass, a lawn strip, and the name on the front. */
      case 'dxcfront': {
        const w = p.w * TILE, top = 2 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = '#5b6a86'; ctx.fillRect(sx - 6, top, w + 12, base - top);
        ctx.fillStyle = '#6d7d9c'; ctx.fillRect(sx - 6, top, w + 12, 5);
        ctx.fillStyle = '#a8c6de';
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < p.w; c++) {
            const wy = top + 12 + r * 20;
            if (wy > base - 58) continue;
            ctx.fillRect(sx + 3 + c * TILE, wy, 11, 13);
          }
        ctx.fillStyle = '#3a4152'; ctx.fillRect(dx - 6, base - 52, 50, 52);
        ctx.fillStyle = '#cfe4f4'; ctx.fillRect(dx - 2, base - 48, 42, 48);
        ctx.fillStyle = '#3a4152'; ctx.fillRect(dx + 18, base - 48, 3, 48);
        const gl = ctx.createLinearGradient(dx + 19, base - 48, dx + 19, base + 6);
        gl.addColorStop(0, 'rgba(220,240,255,.30)');
        gl.addColorStop(1, 'rgba(220,240,255,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(dx - 16, base - 48, 72, 54);
        signboard(sx + w / 2, top - 30, 150, ['DXC', 'TECHNOLOGY']);
        break;
      }

      case 'goodfriendspot':
        drawCharacter(ctx, CHARACTERS.goodfriend, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 845) > 0 ? 0 : 1);
        break;

      case 'juicemanspot':
        drawCharacter(ctx, CHARACTERS.juiceman, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 775) > 0 ? 0 : 1);
        break;

      /* The juice corner: a cart, fruit piled on it, and a churn of ice. */
      case 'juicecorner': {
        ctx.fillStyle = '#5f9a3d'; ctx.fillRect(sx - 8, base - 44, 84, 8);
        ctx.fillStyle = '#4a7a30'; ctx.fillRect(sx - 8, base - 44, 84, 2);
        for (let i = 0; i < 8; i++) {                 // the fringe on it
          ctx.fillStyle = i % 2 ? '#f4f1ea' : '#5f9a3d';
          ctx.fillRect(sx - 8 + i * 10.5, base - 36, 10, 5);
        }
        ctx.fillStyle = '#8a6a44'; ctx.fillRect(sx - 6, base - 40, 4, 40);
        ctx.fillRect(sx + 70, base - 40, 4, 40);
        ctx.fillStyle = '#a8834f'; ctx.fillRect(sx - 4, base - 22, 74, 6);
        ctx.fillStyle = '#8a6a44'; ctx.fillRect(sx - 4, base - 16, 74, 16);

        // fruit along the counter
        const fruit = ['#f2c14a', '#e04b32', '#5f9a3d', '#f2913a'];
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = fruit[i % 4];
          ctx.beginPath();
          ctx.arc(sx + 4 + i * 10, base - 26, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        // the ice churn at the near end
        ctx.fillStyle = '#8f99a8'; ctx.fillRect(sx + 2, base - 38, 18, 12);
        ctx.fillStyle = '#cfe4ef'; ctx.fillRect(sx + 4, base - 36, 14, 8);
        ctx.fillStyle = '#eaf6fb';
        ctx.fillRect(sx + 5, base - 35, 4, 3);
        ctx.fillRect(sx + 11, base - 34, 4, 3);

        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx + 30, base - 42, 40, 12);
        ctx.fillStyle = '#4a7a30';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('JUICE', sx + 50, base - 33);
        ctx.textAlign = 'left';
        break;
      }

      case 'cafemanspot':
        drawCharacter(ctx, CHARACTERS.cafeman, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 790) > 0 ? 0 : 1);
        break;

      /* The cafeteria counter, with the cake at the near end of it. */
      case 'cafecounter': {
        ctx.fillStyle = '#7f6a4e'; ctx.fillRect(sx - 6, base - 22, 84, 22);
        ctx.fillStyle = '#9a8362'; ctx.fillRect(sx - 6, base - 22, 84, 3);
        ctx.fillStyle = '#5f4f3a'; ctx.fillRect(sx - 6, base - 8, 84, 3);
        // the glass case
        ctx.fillStyle = 'rgba(206,224,238,.35)';
        ctx.fillRect(sx - 2, base - 44, 40, 22);
        ctx.strokeStyle = '#b8c4d0'; ctx.lineWidth = 1;
        ctx.strokeRect(sx - 2, base - 44, 40, 22);
        // three slices of it, on their plates
        for (let i = 0; i < 3; i++) {
          const cx = sx + 6 + i * 12;
          ctx.fillStyle = '#e8e4da'; ctx.fillRect(cx - 4, base - 26, 9, 2);
          ctx.fillStyle = '#4a2c1e'; ctx.fillRect(cx - 3, base - 33, 7, 7);
          ctx.fillStyle = '#331e14'; ctx.fillRect(cx - 3, base - 34, 7, 2);
          ctx.fillStyle = '#c8506a'; ctx.fillRect(cx, base - 36, 2, 2);
        }
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx + 44, base - 46, 34, 13);
        ctx.fillStyle = '#5f4f3a';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CAFE', sx + 61, base - 37);
        ctx.textAlign = 'left';
        break;
      }

      case 'shantanuspot':
        drawCharacter(ctx, CHARACTERS.shantanu, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 830) > 0 ? 0 : 1);
        break;

      case 'classmateA':
      case 'classmateB':
        drawCharacter(ctx, CHARACTERS[p.type], 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / (p.type === 'classmateA' ? 840 : 720)) > 0 ? 0 : 1);
        break;

      case 'moodlefriendspot':
        drawCharacter(ctx, CHARACTERS.moodlefriend, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 805) > 0 ? 0 : 1);
        break;

      case 'akashspot':
        drawCharacter(ctx, CHARACTERS.akash, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 760) > 0 ? 0 : 1);
        break;

      case 'counterspot':
        drawCharacter(ctx, CHARACTERS.counter, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 800) > 0 ? 0 : 1);
        break;

      case 'interviewer':
        drawCharacter(ctx, CHARACTERS.physicsteacher, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 870) > 0 ? 0 : 1);
        break;

      /* The gate of the college, with its name on the arch. */
      case 'collegegate': {
        ctx.fillStyle = '#7e8a76';
        ctx.fillRect(sx - 2, base - 56, 9, 56);
        ctx.fillRect(sx + 54, base - 56, 9, 56);
        ctx.fillStyle = '#93a08a'; ctx.fillRect(sx - 6, base - 64, 73, 9);
        ctx.fillStyle = '#6d7867';
        for (let i = 0; i < 5; i++) ctx.fillRect(sx + 10 + i * 9, base - 46, 3, 46);
        signboard(sx + 30, base - 92, 108, COLLEGE_NAME);
        break;
      }

      /* A cat. `coat` picks the colour, `asleep` shuts its eyes and
         stops the tail. They are drawn rather than made into sprites
         because a cat is four pixels tall and a sprite grid is not. */
      case 'cat': {
        const COATS = {
          ginger: { body: '#c07840', top: '#d9944f', ear: '#8a5228' },
          black:  { body: '#3a3038', top: '#4a3f48', ear: '#241b26' },
          white:  { body: '#e0dcd2', top: '#f2eee4', ear: '#b8b2a4' },
          tabby:  { body: '#7a6a58', top: '#94836c', ear: '#544838' }
        };
        const co = COATS[p.coat] || COATS.tabby;
        const nap = !!p.asleep;
        const sway = nap ? 0 : Math.sin(performance.now() / 620 + sx) * 2;
        const y = base;

        ctx.fillStyle = '#241b26';                    // tail
        ctx.fillRect(sx - 8, y - 7 + sway, 6, 2);
        ctx.fillRect(sx - 10, y - 10 + sway, 2, 4);
        ctx.fillStyle = '#241b26';                    // body, outlined
        ctx.fillRect(sx - 4, y - 10, 16, 10);
        ctx.fillStyle = co.body; ctx.fillRect(sx - 3, y - 9, 14, 9);
        ctx.fillStyle = co.top;  ctx.fillRect(sx - 3, y - 9, 14, 3);
        ctx.fillStyle = '#241b26';                    // head
        ctx.fillRect(sx + 5, y - 17, 10, 8);
        ctx.fillStyle = co.body; ctx.fillRect(sx + 6, y - 16, 8, 6);
        ctx.fillStyle = '#241b26';                    // ears
        ctx.fillRect(sx + 6, y - 19, 2, 3);
        ctx.fillRect(sx + 12, y - 19, 2, 3);
        ctx.fillStyle = co.ear;
        ctx.fillRect(sx + 6, y - 18, 2, 2);
        ctx.fillRect(sx + 12, y - 18, 2, 2);
        ctx.fillStyle = nap ? '#241b26' : '#8fe08f';  // eyes
        ctx.fillRect(sx + 7, y - 14, 2, nap ? 1 : 2);
        ctx.fillRect(sx + 11, y - 14, 2, nap ? 1 : 2);
        if (nap) {                                    // and a small z
          ctx.fillStyle = 'rgba(210,216,240,.7)';
          ctx.font = '5px "Press Start 2P", monospace';
          ctx.fillText('z', sx + 16, y - 18 - ((performance.now() / 700) % 1) * 6);
        }
        break;
      }

      /* The tree with one of them stuck up it. */
      case 'treecat': {
        ctx.fillStyle = '#5b4530'; ctx.fillRect(sx + 12, base - 62, 9, 62);
        ctx.fillStyle = '#6d5238'; ctx.fillRect(sx + 12, base - 62, 3, 62);
        ctx.fillRect(sx + 2, base - 44, 12, 4);
        ctx.fillRect(sx + 19, base - 54, 12, 4);
        ctx.fillStyle = '#3f7a44';
        for (const [dx, dy, r] of [[16, -72, 22], [1, -62, 15], [31, -60, 15],
                                   [8, -80, 12], [26, -80, 12]]) {
          ctx.beginPath(); ctx.arc(sx + dx, base + dy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#4e9153';
        ctx.beginPath(); ctx.arc(sx + 14, base - 80, 12, 0, Math.PI * 2); ctx.fill();
        // it, up there, looking down
        const y = base - 56;
        ctx.fillStyle = '#241b26'; ctx.fillRect(sx + 20, y - 8, 13, 9);
        ctx.fillStyle = '#c07840'; ctx.fillRect(sx + 21, y - 7, 11, 7);
        ctx.fillStyle = '#241b26'; ctx.fillRect(sx + 27, y - 14, 9, 7);
        ctx.fillStyle = '#c07840'; ctx.fillRect(sx + 28, y - 13, 7, 5);
        ctx.fillStyle = '#241b26';
        ctx.fillRect(sx + 28, y - 16, 2, 3);
        ctx.fillRect(sx + 33, y - 16, 2, 3);
        ctx.fillStyle = '#f2c14a';
        ctx.fillRect(sx + 29, y - 11, 2, 2);
        ctx.fillRect(sx + 33, y - 11, 2, 2);
        // and it is not happy about it
        const p2 = (performance.now() / 900) % 1;
        ctx.globalAlpha = 1 - p2;
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText('!', sx + 40, y - 18 - p2 * 10);
        ctx.globalAlpha = 1;
        break;
      }

      /* The auditorium. Wide steps, a set of doors, and its name up
         over them where every other place in this game keeps it. */
      case 'audifront': {
        const w = p.w * TILE, top = 2 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = '#c9bda6'; ctx.fillRect(sx - 6, top, w + 12, base - top);
        ctx.fillStyle = '#a89b84'; ctx.fillRect(sx - 8, top - 8, w + 16, 10);
        // pillars along the front
        ctx.fillStyle = '#dcd2bd';
        for (let i = 0; i < p.w; i += 3)
          ctx.fillRect(sx + 4 + i * TILE, top + 6, 9, base - top - 32);
        ctx.fillStyle = '#b3a891';
        for (let i = 0; i < p.w; i += 3)
          ctx.fillRect(sx + 4 + i * TILE, top + 6, 9, 3);
        // the doors, standing open
        ctx.fillStyle = '#4a3040'; ctx.fillRect(dx - 4, base - 50, 44, 50);
        ctx.fillStyle = '#1d1526'; ctx.fillRect(dx, base - 46, 36, 46);
        ctx.fillStyle = '#c9a227'; ctx.fillRect(dx + 17, base - 46, 2, 46);
        // and the light coming out of them
        const gl = ctx.createLinearGradient(dx + 18, base - 46, dx + 18, base);
        gl.addColorStop(0, 'rgba(255,232,180,.30)');
        gl.addColorStop(1, 'rgba(255,232,180,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(dx - 10, base - 46, 56, 46);
        signboard(sx + w / 2, top - 34, 128, 'AUDITORIUM');
        break;
      }

      /* The fried chicken place. Red and white stripes, a bucket up on
         the pole, and the whole front of it lit from inside. */
      case 'kfcfront': {
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx - 6, base - 62, 94, 62);
        // the red band across the top, with the name on it
        ctx.fillStyle = '#c8402f'; ctx.fillRect(sx - 10, base - 76, 102, 15);
        ctx.fillStyle = '#a83224'; ctx.fillRect(sx - 10, base - 76, 102, 3);
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KFC', sx + 41, base - 65);
        ctx.textAlign = 'left';

        // the stripes down the front
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = i % 2 ? '#f4f1ea' : '#c8402f';
          ctx.fillRect(sx - 6 + i * 10, base - 61, 10, 6);
        }

        // two lit windows and the door between them
        ctx.fillStyle = '#3a3040'; ctx.fillRect(sx + 2, base - 48, 26, 24);
        ctx.fillStyle = '#ffe6b4'; ctx.fillRect(sx + 4, base - 46, 22, 20);
        ctx.fillStyle = '#3a3040'; ctx.fillRect(sx + 54, base - 48, 26, 24);
        ctx.fillStyle = '#ffe6b4'; ctx.fillRect(sx + 56, base - 46, 22, 20);
        ctx.fillStyle = '#7c4f34'; ctx.fillRect(sx + 32, base - 44, 18, 44);
        ctx.fillStyle = '#ffe6b4'; ctx.fillRect(sx + 34, base - 41, 14, 41);
        ctx.fillStyle = '#c8a06a'; ctx.fillRect(sx + 40, base - 41, 2, 41);

        // the bucket on its pole
        ctx.fillStyle = '#8f99a8'; ctx.fillRect(sx + 94, base - 58, 4, 58);
        const bx = sx + 96, by = base - 82;
        ctx.fillStyle = '#241b26'; ctx.fillRect(bx - 15, by - 1, 30, 26);
        ctx.fillStyle = '#f4f1ea';
        ctx.beginPath();
        ctx.moveTo(bx - 13, by); ctx.lineTo(bx + 13, by);
        ctx.lineTo(bx + 9, by + 24); ctx.lineTo(bx - 9, by + 24);
        ctx.closePath(); ctx.fill();
        for (let i = 0; i < 3; i++) {                 // its stripes
          ctx.fillStyle = '#c8402f';
          ctx.fillRect(bx - 12 + i * 9, by + 2, 4, 21);
        }
        ctx.fillStyle = '#c9a05f';                     // and what is in it
        ctx.fillRect(bx - 9, by - 5, 7, 6);
        ctx.fillRect(bx + 1, by - 6, 8, 7);
        ctx.fillStyle = '#a8763f';
        ctx.fillRect(bx - 4, by - 8, 6, 6);

        // the light spilling out of the front of it
        const gl = ctx.createLinearGradient(sx + 41, base - 46, sx + 41, base + 8);
        gl.addColorStop(0, 'rgba(255,226,160,.26)');
        gl.addColorStop(1, 'rgba(255,226,160,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(sx - 14, base - 46, 110, 54);
        break;
      }

      case 'anamspot': {
        drawCharacter(ctx, CHARACTERS.anam, 'idle', 1, sx + 10, base,
                      Math.sin(performance.now() / 780) > 0 ? 0 : 1);
        break;
      }

      case 'coffeestall': {
        // a roadside stall with a board and two glasses on the counter
        ctx.fillStyle = '#7c4f34'; ctx.fillRect(sx - 6, base - 34, 74, 6);
        ctx.fillStyle = '#5b3a26';
        ctx.fillRect(sx - 4, base - 28, 5, 28);
        ctx.fillRect(sx + 62, base - 28, 5, 28);
        ctx.fillStyle = '#c8a06a'; ctx.fillRect(sx, base - 20, 62, 5);
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx + 8, base - 50, 46, 15);
        ctx.fillStyle = '#5b3a26';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('COLD COFFEE', sx + 31, base - 40);
        ctx.textAlign = 'left';
        for (const gx of [sx + 14, sx + 40]) {
          ctx.fillStyle = '#e8e4da'; ctx.fillRect(gx, base - 32, 9, 12);
          ctx.fillStyle = '#6b4a33'; ctx.fillRect(gx + 1, base - 28, 7, 8);
          ctx.fillStyle = '#f7f2e2'; ctx.fillRect(gx + 1, base - 30, 7, 2);
        }
        break;
      }

      case 'examdesk':
      case 'herexamdesk': {
        const w = 2 * TILE;
        ctx.fillStyle = '#a8814f'; ctx.fillRect(sx, base - 16, w, 5);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(sx + 3, base - 11, 4, 11);
        ctx.fillRect(sx + w - 7, base - 11, 4, 11);
        // an OMR sheet and a pencil
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 6, base - 18, 14, 2);
        ctx.fillStyle = '#c8324b'; ctx.fillRect(sx + 22, base - 18, 6, 1);
        if (p.type === 'herexamdesk') {
          ctx.save();
          ctx.globalAlpha = 0.3 + 0.15 * Math.sin(performance.now() / 400);
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(sx - 4, base - 42, w + 8, 28);
          ctx.restore();
        }
        break;
      }

      case 'icecream': {
        // a little parlour with a cone on the sign
        ctx.fillStyle = '#f2b6c8'; ctx.fillRect(sx - 4, base - 48, 62, 48);
        ctx.fillStyle = '#d9748f'; ctx.fillRect(sx - 8, base - 55, 70, 8);
        ctx.fillStyle = '#fdf6ec'; ctx.fillRect(sx + 6, base - 40, 38, 16);
        ctx.fillStyle = '#c8624b';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ICE CREAM', sx + 25, base - 30);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#7c5a3a'; ctx.fillRect(sx + 18, base - 20, 14, 20);
        // a cone above the door
        ctx.fillStyle = '#e8b97a';
        ctx.beginPath();
        ctx.moveTo(sx + 50, base - 60); ctx.lineTo(sx + 58, base - 60);
        ctx.lineTo(sx + 54, base - 48); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f7dce6';
        ctx.beginPath(); ctx.arc(sx + 54, base - 63, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a8d8c0';
        ctx.beginPath(); ctx.arc(sx + 54, base - 68, 3.6, 0, Math.PI * 2); ctx.fill();
        break;
      }

      case 'bakery': {
        ctx.fillStyle = '#e0c9a0'; ctx.fillRect(sx - 4, base - 50, 66, 50);
        ctx.fillStyle = '#a8763f'; ctx.fillRect(sx - 8, base - 58, 74, 9);
        // striped awning
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = i % 2 ? '#f4f1ea' : '#c8402f';
          ctx.fillRect(sx - 6 + i * 10, base - 49, 10, 6);
        }
        ctx.fillStyle = '#fdf6ec'; ctx.fillRect(sx + 6, base - 40, 44, 14);
        ctx.fillStyle = '#7c4f34';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BAKERY', sx + 28, base - 31);
        ctx.textAlign = 'left';
        // puffs and a marble cake in the window
        ctx.fillStyle = '#d8a860';
        ctx.fillRect(sx + 8, base - 22, 11, 6);
        ctx.fillRect(sx + 22, base - 22, 11, 6);
        ctx.fillStyle = '#f3e6cf'; ctx.fillRect(sx + 38, base - 24, 14, 8);
        ctx.fillStyle = '#7c4f34';
        ctx.fillRect(sx + 38, base - 22, 14, 2);
        ctx.fillRect(sx + 38, base - 19, 14, 2);
        break;
      }

      case 'musicschool': {
        ctx.fillStyle = '#b47a9c'; ctx.fillRect(sx - 4, base - 56, 70, 56);
        ctx.fillStyle = '#8e5f7c'; ctx.fillRect(sx - 8, base - 63, 78, 9);
        ctx.fillStyle = 'rgba(255,240,200,.6)';
        ctx.fillRect(sx + 6, base - 46, 12, 14);
        ctx.fillRect(sx + 44, base - 46, 12, 14);
        ctx.fillStyle = '#4a3040'; ctx.fillRect(sx + 22, base - 30, 20, 30);
        ctx.fillStyle = '#ffdca0'; ctx.fillRect(sx + 24, base - 28, 16, 28);
        // a clef on the wall
        ctx.strokeStyle = '#f6e3a8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx + 31, base - 56, 5, 0, Math.PI * 2);
        ctx.moveTo(sx + 31, base - 61);
        ctx.lineTo(sx + 34, base - 78);
        ctx.stroke();
        // it read as just another building without its name on it
        signboard(sx + 24, base - 92, 118, MUSIC_SCHOOL_NAME);
        break;
      }

      case 'mallyasign': {
        ctx.fillStyle = '#6a7f8f';
        ctx.fillRect(sx + 6, base - 46, 5, 46);
        ctx.fillRect(sx + 38, base - 46, 5, 46);
        signboard(sx + 24, base - 74, 116, ['MALLYA ADITI', 'INTERNATIONAL']);
        break;
      }

      case 'harmonium': {
        // box body, bellows at the back, keys along the front
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx, base - 22, 54, 22);
        ctx.fillStyle = '#8a6242'; ctx.fillRect(sx, base - 26, 54, 4);
        ctx.fillStyle = '#5a3d29'; ctx.fillRect(sx + 40, base - 40, 14, 18);
        ctx.fillStyle = '#c9a227';
        for (let i = 0; i < 3; i++) ctx.fillRect(sx + 42, base - 37 + i * 5, 10, 2);
        ctx.fillStyle = '#fdf8ec'; ctx.fillRect(sx + 3, base - 20, 34, 6);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 6; i++) ctx.fillRect(sx + 6 + i * 5.4, base - 20, 2, 4);
        break;
      }

      case 'flute': {
        // a bansuri on a small stand
        ctx.fillStyle = '#6b5334';
        ctx.fillRect(sx + 4, base - 26, 3, 26);
        ctx.fillRect(sx + 30, base - 26, 3, 26);
        ctx.fillStyle = '#d9b06a';
        ctx.fillRect(sx - 2, base - 30, 44, 5);
        ctx.fillStyle = '#a8813f';
        for (let i = 0; i < 6; i++) ctx.fillRect(sx + 6 + i * 5, base - 29, 2, 2);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(sx - 2, base - 30, 3, 5);
        ctx.fillRect(sx + 39, base - 30, 3, 5);
        break;
      }

      case 'degree': {
        // a rolled certificate with a ribbon, on a stand
        ctx.fillStyle = '#8e97a8'; ctx.fillRect(sx + 18, base - 26, 3, 26);
        ctx.fillStyle = '#f7f2e2';
        ctx.fillRect(sx + 2, base - 58, 36, 32);
        ctx.fillStyle = '#d8cfb6'; ctx.fillRect(sx + 2, base - 58, 36, 3);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 4; i++) ctx.fillRect(sx + 7, base - 50 + i * 5, 26, 1);
        ctx.fillStyle = '#c8402f';
        ctx.beginPath(); ctx.arc(sx + 20, base - 32, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcf4d';
        ctx.beginPath(); ctx.arc(sx + 20, base - 32, 2.5, 0, Math.PI * 2); ctx.fill();
        // a soft glow, because this is the moment she grows
        const gl = ctx.createRadialGradient(sx + 20, base - 42, 4, sx + 20, base - 42, 46);
        gl.addColorStop(0, 'rgba(255,236,170,.28)');
        gl.addColorStop(1, 'rgba(255,236,170,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(sx - 30, base - 90, 100, 96);
        break;
      }

      case 'kotasign': {
        ctx.fillStyle = '#8e97a8'; ctx.fillRect(sx + 14, base - 44, 3, 44);
        ctx.fillStyle = '#2f6b8f'; ctx.fillRect(sx - 14, base - 60, 62, 16);
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KOTA', sx + 17, base - 49);
        ctx.textAlign = 'left';
        // a milestone the way roads in Rajasthan have them
        ctx.fillStyle = '#e8e2d4';
        ctx.fillRect(sx + 34, base - 16, 14, 16);
        ctx.fillStyle = '#c8402f'; ctx.fillRect(sx + 34, base - 16, 14, 5);
        break;
      }

      case 'harmoniumspot': {
        drawCharacter(ctx, CHARACTERS.musicteacher, 'idle', 1, sx + 40, base,
                      Math.sin(performance.now() / 820) > 0 ? 0 : 1);
        // a harmonium sitting on the floor, lid up, bellows at the back
        const hx = sx - 34;
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(hx, base - 20, 50, 20);
        ctx.fillStyle = '#8a6242'; ctx.fillRect(hx, base - 24, 50, 4);
        ctx.fillStyle = '#5a3d29'; ctx.fillRect(hx + 36, base - 38, 14, 18);
        ctx.fillStyle = '#c9a227';
        for (let i = 0; i < 3; i++) ctx.fillRect(hx + 38, base - 35 + i * 5, 10, 2);
        ctx.fillStyle = '#fdf8ec'; ctx.fillRect(hx + 3, base - 18, 30, 6);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 5; i++) ctx.fillRect(hx + 6 + i * 5.4, base - 18, 2, 4);
        // a music stand beside her
        ctx.fillStyle = '#8e97a8';
        ctx.fillRect(sx + 62, base - 40, 2, 40);
        ctx.fillRect(sx + 56, base - 2, 14, 2);
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 52, base - 52, 22, 14);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 3; i++) ctx.fillRect(sx + 55, base - 48 + i * 4, 16, 1);
        break;
      }

      case 'musicposter': {
        ctx.fillStyle = '#5f4128'; ctx.fillRect(sx, base - 58, 42, 30);
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 3, base - 55, 36, 24);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 4; i++) ctx.fillRect(sx + 6, base - 50 + i * 5, 30, 1);
        ctx.fillStyle = '#c8324b';
        ctx.fillRect(sx + 12, base - 46, 3, 3);
        ctx.fillRect(sx + 22, base - 41, 3, 3);
        ctx.fillRect(sx + 30, base - 51, 3, 3);
        break;
      }

      case 'piano': {
        drawCharacter(ctx, CHARACTERS.musicteacher, 'idle', 1, sx + 74, base,
                      Math.sin(performance.now() / 820) > 0 ? 0 : 1);
        drawUpright(ctx, sx, base);
        break;
      }

      case 'tv': {
        const on = !!(level.meta.tv && level.meta.tv.on);
        const t = performance.now() / 1000;
        // stand
        ctx.fillStyle = '#5f4128';
        ctx.fillRect(sx + 4, base - 14, 46, 4);
        ctx.fillRect(sx + 8, base - 10, 5, 10);
        ctx.fillRect(sx + 41, base - 10, 5, 10);
        // set
        ctx.fillStyle = '#d6cfc0';
        ctx.fillRect(sx + 2, base - 48, 50, 34);
        ctx.fillStyle = '#b9b1a1';
        ctx.fillRect(sx + 40, base - 45, 9, 28);
        ctx.fillStyle = '#8f8778';
        ctx.beginPath(); ctx.arc(sx + 44, base - 38, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 44, base - 30, 2.4, 0, Math.PI * 2); ctx.fill();
        // antenna
        ctx.strokeStyle = '#9a9284';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx + 18, base - 48); ctx.lineTo(sx + 10, base - 62);
        ctx.moveTo(sx + 24, base - 48); ctx.lineTo(sx + 34, base - 60);
        ctx.stroke();

        const px = sx + 6, py = base - 44, pw = 32, ph = 26;
        if (!on) {
          ctx.fillStyle = '#2e2b31';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = 'rgba(255,255,255,.05)';
          ctx.fillRect(px + 2, py + 2, 10, ph - 4);
        } else {
          // Kid vs Kat: Coop running, Mr Kat right behind him
          const t2 = performance.now() / 1000;
          ctx.fillStyle = '#cfd8e4';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#b6c2d2';
          ctx.fillRect(px, py, pw, 8);
          ctx.fillStyle = '#8a7a5c';
          ctx.fillRect(px, py + ph - 5, pw, 5);

          const floor = py + ph - 5;
          const run = (t2 * 15) % (pw + 30);
          const bob = Math.abs(Math.sin(t2 * 11)) * 1.5;
          const coopX = Math.round(px + pw + 10 - run);
          const katX = coopX + 13;

          // Coop
          if (coopX > px - 10 && coopX < px + pw) {
            const by = Math.round(floor - bob);
            ctx.fillStyle = '#2e3550';
            ctx.fillRect(coopX + 1, by - 3, 2, 3);
            ctx.fillRect(coopX + 4, by - 3, 2, 3);
            ctx.fillStyle = '#3f7fbf';
            ctx.fillRect(coopX, by - 8, 7, 5);
            ctx.fillStyle = '#f2c9a0';
            ctx.fillRect(coopX + 1, by - 12, 5, 4);
            ctx.fillStyle = '#c0562e';                 // his red hair
            ctx.fillRect(coopX, by - 13, 7, 2);
            ctx.fillRect(coopX, by - 12, 1, 2);
            ctx.fillStyle = '#241b26';
            ctx.fillRect(coopX + 4, by - 11, 1, 1);
          }

          // Mr Kat — hairless, big ears, green eyes
          if (katX > px - 12 && katX < px + pw) {
            const by = Math.round(floor - Math.abs(Math.sin(t2 * 11 + 1)) * 1.5);
            ctx.fillStyle = '#8d8fa8';
            ctx.fillRect(katX + 8, by - 8, 3, 1);      // tail
            ctx.fillRect(katX + 10, by - 10, 1, 2);
            ctx.fillRect(katX + 1, by - 6, 7, 5);      // body
            ctx.fillRect(katX + 1, by - 1, 2, 1);
            ctx.fillRect(katX + 5, by - 1, 2, 1);
            ctx.fillRect(katX, by - 12, 7, 6);         // head
            ctx.fillRect(katX, by - 14, 2, 2);         // ears
            ctx.fillRect(katX + 5, by - 14, 2, 2);
            ctx.fillStyle = '#7fe04a';                 // green eyes
            ctx.fillRect(katX + 1, by - 11, 2, 2);
            ctx.fillRect(katX + 4, by - 11, 2, 2);
            ctx.fillStyle = '#241b26';
            ctx.fillRect(katX + 2, by - 10, 1, 1);
            ctx.fillRect(katX + 5, by - 10, 1, 1);
          }

          // scanlines and a bit of glow into the room
          ctx.fillStyle = 'rgba(0,0,0,.10)';
          for (let yy = 0; yy < ph; yy += 3) ctx.fillRect(px, py + yy, pw, 1);
          ctx.fillStyle = 'rgba(150,210,255,.14)';
          ctx.fillRect(px - 12, py - 10, pw + 24, ph + 26);
        }
        break;
      }

      case 'noticeboard': {
        ctx.fillStyle = '#6b5334'; ctx.fillRect(sx, base - 52, 44, 30);
        ctx.fillStyle = '#d8cba6'; ctx.fillRect(sx + 3, base - 49, 38, 24);
        const cols = ['#c4536a', '#5b7fc4', '#e8b93c', '#4e8a4a'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = cols[i];
          ctx.fillRect(sx + 6 + (i % 2) * 19, base - 45 + Math.floor(i / 2) * 12, 14, 9);
        }
        break;
      }

      case 'blackboard': {
        ctx.fillStyle = '#6b5334'; ctx.fillRect(sx, base - 74, 104, 52);
        ctx.fillStyle = '#2f3e33'; ctx.fillRect(sx + 4, base - 70, 96, 44);
        ctx.strokeStyle = 'rgba(240,245,235,.5)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const y = base - 60 + i * 11;
          ctx.moveTo(sx + 12, y); ctx.lineTo(sx + 12 + 34 + (i % 3) * 18, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#e8e4d6'; ctx.fillRect(sx + 4, base - 26, 96, 4);
        break;
      }

      case 'desk':
      case 'herdesk': {
        const w = 2 * TILE;
        ctx.fillStyle = '#a8814f'; ctx.fillRect(sx, base - 16, w, 5);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(sx + 3, base - 11, 4, 11);
        ctx.fillRect(sx + w - 7, base - 11, 4, 11);
        ctx.fillRect(sx + 5, base - 24, w - 10, 3);
        ctx.fillRect(sx + 5, base - 21, 3, 10);
        if (p.type === 'herdesk') {
          // a warm marker so you can see which desk is the goal
          ctx.save();
          ctx.globalAlpha = 0.3 + 0.15 * Math.sin(performance.now() / 400);
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(sx - 4, base - 44, w + 8, 30);
          ctx.restore();
        }
        break;
      }
    }
  }
}

/* An upright piano: body, lid, keys, and a stool. */
function drawUpright(ctx, x, base) {
  ctx.fillStyle = '#5b3f2e'; ctx.fillRect(x, base - 46, 58, 46);
  ctx.fillStyle = '#6f4e39'; ctx.fillRect(x, base - 46, 58, 5);
  ctx.fillStyle = '#4a3226'; ctx.fillRect(x + 4, base - 39, 50, 16);
  ctx.fillStyle = '#fdf8ec'; ctx.fillRect(x + 4, base - 21, 50, 8);
  ctx.fillStyle = '#241b26';
  for (let i = 0; i < 9; i++) ctx.fillRect(x + 8 + i * 5.4, base - 21, 2, 5);
  ctx.fillStyle = '#3a2820'; ctx.fillRect(x + 4, base - 13, 50, 3);
  ctx.fillStyle = '#6b4a33';
  ctx.fillRect(x + 22, base - 9, 16, 3);
  ctx.fillRect(x + 24, base - 6, 2, 6);
  ctx.fillRect(x + 34, base - 6, 2, 6);
}

/* A small white board with pixel lettering. Takes one line or two —
   a long school name needs the second line to stay legible. */
function signboard(cx, y, w, text) {
  const lines = Array.isArray(text) ? text : [text];
  const h = lines.length > 1 ? 26 : 17;
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(cx - w / 2, y, w, h);
  ctx.fillStyle = '#c8402f';
  ctx.fillRect(cx - w / 2, y, w, 3);
  ctx.fillStyle = '#1d2a44';
  ctx.textAlign = 'center';
  if (lines.length > 1) {
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(lines[0], cx, y + 13);
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText(lines[1], cx, y + 22);
  } else {
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(lines[0], cx, y + 12);
  }
  ctx.textAlign = 'left';
}

/* Mangoes hang off the branches; walking into one takes it. */
function drawPickups() {
  for (const p of (level.meta.pickups || [])) {
    if (p.got) continue;
    const x = p.x - cam.x, y = p.y - cam.y;
    if (x < -20 || x > VIEW_W + 20) continue;
    const sway = Math.sin(performance.now() / 620 + p.x) * 1.2;

    const mx = x + sway;
    ctx.fillStyle = '#4a3a24';                       // stalk
    ctx.fillRect(Math.round(mx), y - 6, 1, 5);
    ctx.fillStyle = '#3f7a3c';                       // leaf
    ctx.fillRect(Math.round(mx) + 1, y - 7, 5, 2);

    ctx.save();
    ctx.translate(mx, y + 2);
    ctx.rotate(-0.42);
    ctx.fillStyle = '#e8a41f';                       // the mango
    ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 4.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d2611f';                       // ripe blush
    ctx.beginPath(); ctx.ellipse(-2, -1, 3.4, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7d982';                       // highlight
    ctx.beginPath(); ctx.ellipse(2.4, 1.2, 1.8, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function collectPickups() {
  const list = level.meta.pickups || [];
  for (const p of list) {
    if (p.got) continue;
    if (Math.abs(p.x - player.x) < 9 &&
        p.y > player.top - 6 && p.y < player.bottom + 4) {
      p.got = true;
      Sound.play('pickup');
      updateCollectHud();
    }
  }
}

/* Has she got everything this level asks for? */
function allCollected() {
  const list = level.meta.pickups || [];
  return list.every(p => p.got);
}

/* The guard on the gate. He asks, she answers, and only then does it
   open — so being turned away is a conversation, not a silent wall. */
function enforceGate() {
  const gate = level.meta.gate;
  if (!gate || gate.opened) return;

  const limit = gate.x * TILE + 8;
  if (player.x > limit) {
    player.x = limit;
    if (player.vx > 0) player.vx = 0;
  }
  if (Dialogue.active || player.x < limit - 46) return;

  if (allCollected()) {
    if (!gate.askedYes) {
      gate.askedYes = true;
      Dialogue.start(gate.linesYes, () => {
        gate.opened = true;
        Sound.play('pickup');
      });
    }
  } else if (!gate.askedNo) {
    gate.askedNo = true;
    Dialogue.start(gate.linesNo);
  } else {
    showNote(gate.note || 'Not yet.');
  }
}

let noteTimer = null;
function showNote(text) {
  if (noteEl.textContent === text && noteEl.classList.contains('show')) return;
  noteEl.textContent = text;
  noteEl.classList.add('show');
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => noteEl.classList.remove('show'), 1800);
}

function updateCollectHud() {
  const list = level.meta.pickups || [];
  if (!list.length) { hudCollect.textContent = ''; return; }
  const got = list.filter(p => p.got).length;
  hudCollect.textContent = `MANGOES ${got}/${list.length}`;
}

function drawRain(dt) {
  if (!rain.length) return;
  ctx.strokeStyle = 'rgba(180,200,255,.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const d of rain) {
    d.y += d.v * dt;
    d.x -= 0.9 * dt;
    if (d.y > VIEW_H) { d.y = -8; d.x = Math.random() * VIEW_W; }
    if (d.x < 0) d.x += VIEW_W;
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 1.6, d.y + d.len);
  }
  ctx.stroke();
}

/* ============================= MAIN LOOP ========================== */
let last = performance.now();
let acc = 0;
const STEP = 1000 / 60;

function frame(now) {
  // queued first: an exception in update or render must not stop the game
  requestAnimationFrame(frame);
  acc += Math.min(100, now - last);
  last = now;
  let steps = 0;
  while (acc >= STEP && steps < 5) { update(1); acc -= STEP; steps++; }
  render();
  Input.endFrame();
}

function update(dt) {
  if (state === 'levelcard') {
    if (Input.tapped('confirm') || Input.tapped('jump')) beginLevel();
    return;
  }
  if (Dialogue.active) {
    // an ending is a scene to watch: it keeps playing under the line
    if (state === 'ending' && ending) endingT += dt / 60;
    // the room keeps breathing under a caption: clock, Zzz, alarm
    if (sleepState.on) sleepState.t += dt / 60;
    if (dawnState.on) dawnState.t += dt / 60;
    if (alarmState.t > 0) alarmState.t -= dt / 90;
    if (chap.on) chap.t += dt / 60;
    // and so does he, or he stands frozen through his own speech
    if (magic.on) magic.t += dt / 60;
    if (Input.tapped('confirm') || Input.tapped('jump')) Dialogue.advance();
    return;
  }
  if (state === 'art') return;   // the board owns the input
  if (Input.tapped('mute')) toggleMute();

  if (state === 'ending') {
    if (!ending) { state = 'end'; return; }
    updateChapMagic(dt);
    endingT += dt / 60;
    const finished = ending.done ? ending.done(endingT) : endingT > ending.dur;
    if (finished && !endingDone) {
      endingDone = true;
      if (sceneAct) {
        /* A cutscene inside a level hands back to the act after it —
           unless it *is* the last act, in which case it hands on to the
           level's ending. Without that it walked off the end of the
           acts array, threw, and the ending never played at all. */
        sceneAct = false;
        const last = actIdx === CHAPTERS[chapterIdx].acts.length - 1;
        fadeThrough(() => {
          ending = null;
          if (last) startEnding();
          else { actIdx++; startCurrentAct(); }
        });
      } else {
        say(CHAPTERS[chapterIdx].close, () => fadeThrough(nextChapter));
      }
    }
    return;
  }
  if (state !== 'play') return;

  // a held beat: she stands still, the scene keeps drawing
  if (holdT > 0 || magic.on) {
    if (holdT > 0) holdT -= dt;
    player.vx = 0;
    player.anim = 'idle';
    updateMagic(dt);
    return;
  }

  // stopped in front of something she should actually look at
  if (paused) {
    player.vx = 0;
    player.anim = 'idle';
    showNote(paused.note || 'Press ENTER to go on');
    if (Input.tapped('confirm')) { paused = null; Sound.play('confirm'); }
    return;
  }

  // a beat she plays out herself
  if (script.on) {
    updateScript(dt);
    cam.follow(player, dt);
    updateCompanion(dt);
    return;
  }

  // the night in the hostel starts the moment she reaches her desk
  const nt = level.meta.night;
  if (nt && !nt.done && player.x > nt.x * TILE) {
    nt.done = true;
    startScript(nt.steps);
    return;
  }

  controlActor(player, level, dt);
  cam.follow(player, dt);
  updateCompanion(dt);
  collectPickups();
  enforceGate();

  if (player.y > level.pxH + 20) respawn();

  // one-shot lines that fire when she walks into somewhere
  for (const tr of (level.meta.triggers || [])) {
    if (!tr.done && player.x > tr.x * TILE) {
      tr.done = true;
      if (tr.on) tr.on();
      if (tr.grow) growUp();
      if (tr.magic) startMagic(typeof tr.magic === 'object' ? tr.magic : {});
      if (tr.pause) paused = tr;
      // `hold` stops her where she stands while the beat plays out
      if (tr.hold) holdT = tr.hold;
      // `talk` is somebody in the world speaking to her, so it waits for
      // ENTER; without it a trigger is a caption that plays itself
      if (tr.talk) Dialogue.start(tr.lines);
      else say(tr.lines);
    }
  }

  // the uncle at the mango tree starts talking as she comes up
  const unc = level.meta.uncle;
  if (unc && !unc.done && player.x > unc.x * TILE) {
    unc.done = true;
    Dialogue.start(unc.lines);
    return;
  }

  // someone standing in the way until she says hello
  const npc = level.meta.npc;
  if (npc && !npc.done) {
    const limit = npc.blockX * TILE;
    if (player.x > limit) {
      player.x = limit;
      if (player.vx > 0) player.vx = 0;
      showNote(npc.prompt || 'Press ENTER to talk');
    }
    if (player.x > limit - 34 && Input.tapped('confirm')) {
      Dialogue.start(npc.lines, () => { npc.done = true; });
      return;
    }
  }

  // her own desk: the night does not go in a straight line
  const desk = level.meta.desk;
  if (desk && !desk.done && player.x > desk.x * TILE) {
    desk.done = true;
    narrate(desk.lines);
    return;
  }

  // the television: she stops, watches, then carries on
  const tv = level.meta.tv;
  if (tv && !tv.done) {
    const limit = tv.x * TILE;
    if (player.x > limit) {
      player.x = limit;
      if (player.vx > 0) player.vx = 0;
    }
    if (player.x > limit - 48) {
      if (!tv.on) {
        showNote(tv.promptOn);
        if (Input.tapped('confirm')) { tv.on = true; Sound.play('pickup'); }
      } else {
        showNote(tv.promptOff);
        if (Input.tapped('confirm')) { tv.done = true; }
      }
    }
    if (!tv.done) return;
  }

  if (player.x >= level.meta.goalX) {
    const act = CHAPTERS[chapterIdx].acts[actIdx];
    state = 'transition';
    if (act.goalLines) {
      Dialogue.start(act.goalLines, finishAct);
    } else {
      finishAct();
    }
  }
}

function render() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // once an ending has begun it stays on screen behind the story cards
  // During an ending he speaks from the box only: the scene is the
  // point, and standing him in the middle of it covers the family.
  if (ending) { ending.draw(endingT); return; }
  if (!level) return;

  drawBackdrop();
  drawProps('back');
  drawTiles(ctx, level, cam);
  drawProps('front');
  drawPickups();
  drawGrowDim();
  drawMagic();
  drawCompanion();
  drawPlayer();
  drawCarried();
  drawMagicFeather();
  drawGrowFlash();
  drawSleep();
  drawDawn();
  drawAlarm();
  drawGuide(1);
  drawRain(1);

  const th = theme();
  const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  v.addColorStop(0, th.vignette);
  v.addColorStop(0.4, 'rgba(0,0,0,0)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

/* ============================== BOOT ============================== */
function toggleMute() {
  muteBtn.textContent = Sound.toggleMute() ? '♪ SOUND OFF' : '♪ SOUND ON';
}
muteBtn.addEventListener('click', () => { Sound.unlock(); toggleMute(); });

function boot() {
  /* ?level=2 jumps straight into a level, for testing. Levels are
     1-based in the URL because that is how they are named on screen. */
  const wanted = parseInt(new URLSearchParams(location.search).get('level'), 10);
  const startAt = Number.isFinite(wanted)
    ? Math.min(CHAPTERS.length, Math.max(1, wanted)) - 1
    : 0;
  startChapter(startAt);
  const kick = () => {
    Sound.unlock();
    removeEventListener('keydown', kick);
    removeEventListener('pointerdown', kick);
  };
  addEventListener('keydown', kick);
  addEventListener('pointerdown', kick);
  document.getElementById('lc-start').addEventListener('click', beginLevel);
  requestAnimationFrame(frame);
}
boot();
