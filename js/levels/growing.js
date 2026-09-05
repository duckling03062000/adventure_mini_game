/* ------------------------------------------------------------------
   GROWING UP — the interlude between Level 4 and Level 5.

   Not a level. She walks it herself, left to right, past the things
   that happened. At the music degree the light takes her and she
   comes out the other side a teenager, and then it simply ends — the
   next level says where she is.
------------------------------------------------------------------- */

function buildGrowing() {
  const b = makeBuilder();

  b.flat(6);
  const iceX = b.x;
  b.prop('icecream', iceX);
  b.flat(14);

  const bakeX = b.x;
  b.prop('bakery', bakeX);
  b.flat(14);

  const ryan = b.x;
  b.prop('schoolgate', ryan);
  b.flat(14);

  const mallya = b.x;
  b.prop('mallyasign', mallya);
  b.flat(14);

  const schoolX = b.x;
  b.prop('musicschool', schoolX);
  b.flat(13);

  const degreeX = b.x;
  b.prop('degree', degreeX);
  b.flat(14);

  return b.build({
    goalX: (degreeX + 12) * 16,
    name: 'growing',
    theme: 'afternoon',
    triggers: [
      { x: iceX - 3,    lines: [{ text: 'An ice cream on the way home.' }] },
      { x: bakeX - 3,   lines: [{ text: 'Puffs and marble cake from the bakery.' }] },
      { x: ryan - 3,    lines: [{ text: 'Ryan International.' }] },
      { x: mallya - 3,  lines: [{ text: 'Then Mallya Aditi.' }] },
      { x: schoolX - 3, lines: [{ text: 'Music school.' }] },
      /* the light takes her here */
      { x: degreeX - 3, lines: [{ text: 'A music degree.' }], grow: true }
    ],
    tileStyles: {
      '#': { fill: '#9c8f76', top: '#b7a98d' },
      'C': { fill: '#cbb894', top: '#e0cfab' }
    }
  });
}
