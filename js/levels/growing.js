/* ------------------------------------------------------------------
   GROWING UP — the interlude between Level 4 and Level 5.

   Not a level. She walks it herself, left to right, past the things
   that happened. At the music degree the light takes her and she
   comes out the other side a teenager, and then it simply ends — the
   next level says where she is.
------------------------------------------------------------------- */

function buildGrowing() {
  const b = makeBuilder();

  /* a stretch of pavement first, so she walks up to him rather than
     opening the level already mid-conversation */
  b.flat(14);
  const iceX = b.x;
  b.prop('icecream', iceX);
  b.prop('icemanshop', iceX - 2);
  b.flat(14);

  const bakeX = b.x;
  b.prop('bakery', bakeX);
  b.prop('baker', bakeX - 2);
  b.flat(14);

  const ryan = b.x;
  b.prop('schoolgate', ryan);
  b.flat(14);

  const mallya = b.x;
  b.prop('mallyasign', mallya);
  b.flat(14);

  const schoolX = b.x;
  b.prop('musicschool', schoolX);
  b.flat(15);

  const degreeX = b.x;
  b.prop('degree', degreeX);
  b.flat(9);

  /* Room past the degree for the light to take her, and for the teen
     she becomes to walk the last of it herself. */
  const growX = b.x;
  b.flat(13);

  return b.build({
    goalX: (growX + 11) * 16,
    name: 'growing',
    theme: 'afternoon',
    triggers: [
      { x: iceX - 4, talk: true, lines: [
          { who: 'Ice cream man', char: 'icemanshop',
            text: 'Hey, little Ayrisha! What do you want today?' },
          { who: 'Ayrisha', char: 'child', text: 'I want blackcurrant.' },
          { who: 'Ice cream man', char: 'icemanshop',
            text: 'Blackcurrant it is. Here you go.',
            on() { giveItem('blackcurrant'); } }
        ] },
      { x: bakeX - 4, talk: true, lines: [
          { who: 'Baker', char: 'baker', text: 'Hey Ayrisha! Want puffs?' },
          { who: 'Ayrisha', char: 'child', text: 'Yes please.' },
          { who: 'Baker', char: 'baker', text: 'Fresh ones. Take.',
            on() { giveItem('puff'); } },
          { who: 'Ayrisha', char: 'child', text: 'I want marble cake also.' },
          { who: 'Baker', char: 'baker', text: 'Marble cake also. There.',
            on() { giveItem('marblecake'); } }
        ] },
      /* No captions along here: each of these is a signboard, and saying
         the name as well only repeats the picture. She stops at each one
         instead, and goes on when the player takes her on. School is
         where her hands come free. */
      { x: ryan - 3, lines: [], pause: true, on() { dropCarried(); } },
      { x: mallya - 3, lines: [], pause: true },
      { x: schoolX - 3, lines: [], pause: true },
      /* she comes away holding it */
      { x: degreeX - 3, lines: [{ text: 'A music degree.',
                                  on() { giveItem('degree'); } }] },
      /* Krishna ji comes and does it himself. No hold count here: she
         is held for exactly as long as he is there, and part of that
         waits on the player pressing ENTER through what he says. */
      { x: growX, magic: true, lines: [] }
    ],
    tileStyles: {
      '#': { fill: '#9c8f76', top: '#b7a98d' },
      'C': { fill: '#cbb894', top: '#e0cfab' }
    }
  });
}
