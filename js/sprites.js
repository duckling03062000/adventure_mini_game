/* ------------------------------------------------------------------
   Pixel sprite renderer.
   Row strings -> offscreen canvas, with an auto-generated outline and
   a soft contact shadow. Everything is nearest-neighbour so it stays
   crisp at any integer scale.
------------------------------------------------------------------- */

const OUTLINE = '#241b26';

function mirrorRows(rows) {
  return rows.map(r => r.split('').reverse().join(''));
}

/* Compose head+torso with a named leg frame. `strideM` = mirrored stride,
   which gives the walk cycle a real left-right beat instead of a shuffle. */
function composeFrame(char, legName) {
  const legs = legName === 'strideM'
    ? mirrorRows(char.legs.stride)
    : char.legs[legName];
  return char.top.concat(legs);
}

/* Paint an outline into every transparent pixel touching a solid one. */
function outlineMask(rows) {
  const h = rows.length, w = rows[0].length;
  const mask = [];
  for (let y = 0; y < h; y++) {
    mask.push([]);
    for (let x = 0; x < w; x++) {
      if (rows[y][x] !== '.') { mask[y].push(false); continue; }
      const near =
        (y > 0     && rows[y - 1][x] !== '.') ||
        (y < h - 1 && rows[y + 1][x] !== '.') ||
        (x > 0     && rows[y][x - 1] !== '.') ||
        (x < w - 1 && rows[y][x + 1] !== '.');
      mask[y].push(near);
    }
  }
  return mask;
}

const _cache = new Map();

/* Returns a canvas containing one rendered frame (transparent background). */
function renderFrame(char, legName, scale) {
  const key = `${char.id}|${legName}|${scale}|${Object.values(char.palette).join('')}`;
  if (_cache.has(key)) return _cache.get(key);

  const rows = composeFrame(char, legName);
  const w = rows[0].length, h = rows.length;
  const pad = 1; // room for the outline

  const cv = document.createElement('canvas');
  cv.width = (w + pad * 2) * scale;
  cv.height = (h + pad * 2) * scale;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const mask = outlineMask(rows);
  ctx.fillStyle = OUTLINE;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (mask[y][x]) ctx.fillRect((x + pad) * scale, (y + pad) * scale, scale, scale);

  // bottom edge of the sprite also gets an outline so feet sit on the ground
  for (let x = 0; x < w; x++)
    if (rows[h - 1][x] !== '.') ctx.fillRect((x + pad) * scale, (h + pad) * scale, scale, scale);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = rows[y][x];
      if (c === '.') continue;
      ctx.fillStyle = char.palette[c] || '#ff00ff';
      ctx.fillRect((x + pad) * scale, (y + pad) * scale, scale, scale);
    }
  }

  _cache.set(key, cv);
  return cv;
}

function clearSpriteCache() { _cache.clear(); }

/* Sprite height in pixels (pre-scale) — used to keep all three ages
   standing on the same ground line so the growth reads correctly. */
function frameHeight(char, legName) {
  return composeFrame(char, legName).length;
}

/* Draw a character bottom-centred at (x, groundY). */
function drawCharacter(ctx, char, legName, scale, x, groundY, bob) {
  const cv = renderFrame(char, legName, scale);
  const pad = 1;
  const dx = Math.round(x - cv.width / 2);
  const dy = Math.round(groundY - cv.height + pad * scale + (bob || 0) * scale);

  // contact shadow
  const shW = 13 * scale;
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#1b1526';
  ctx.beginPath();
  ctx.ellipse(x, groundY + scale * 0.5, shW / 2, scale * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, dx, dy);
}
