/* ------------------------------------------------------------------
   GROWING UP — the interlude between Level 4 and Level 5.

   Not a level. She walks it herself, left to right, past the things
   that happened, and somewhere in the middle of it she stops being a
   little girl. That change is the point of the whole game, so it gets
   its own stretch of road and nothing else happens on it.
------------------------------------------------------------------- */

function buildGrowing() {
  const b = makeBuilder();

  b.flat(6);
  const ryan = b.x;
  b.prop('schoolgate', ryan);
  b.flat(14);

  const mallya = b.x;
  b.prop('mallyasign', mallya);
  b.flat(14);

  const pianoX = b.x;
  b.prop('piano', pianoX);
  b.flat(12);

  const harmX = b.x;
  b.prop('harmonium', harmX);
  b.flat(12);

  const fluteX = b.x;
  b.prop('flute', fluteX);
  b.flat(12);

  const degreeX = b.x;
  b.prop('degree', degreeX);
  b.flat(16);

  const kotaX = b.x;
  b.prop('kotasign', kotaX);
  b.flat(16);

  return b.build({
    goalX: (kotaX + 12) * 16,
    name: 'growing',
    theme: 'afternoon',
    /* Captions fire as she reaches each one; she becomes a teenager
       at the degree, because that is when she stopped being small. */
    triggers: [
      { x: ryan - 3,    lines: [{ text: 'Ryan International.' }] },
      { x: mallya - 3,  lines: [{ text: 'Then Mallya Aditi.' }] },
      { x: pianoX - 3,  lines: [{ text: 'Piano lessons.' }] },
      { x: harmX - 3,   lines: [{ text: 'Harmonium lessons.' }] },
      { x: fluteX - 3,  lines: [{ text: 'Flute lessons.' }] },
      { x: degreeX - 3, lines: [{ text: 'A music degree.' }], grow: true },
      { x: kotaX - 4,   lines: [{ text: 'And then — Kota.' }] }
    ],
    tileStyles: {
      '#': { fill: '#9c8f76', top: '#b7a98d' },
      'C': { fill: '#cbb894', top: '#e0cfab' }
    }
  });
}
