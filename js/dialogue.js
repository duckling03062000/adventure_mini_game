/* ------------------------------------------------------------------
   Dialogue.

   A line at a time, advanced with ENTER or a click, with the speaker's
   own sprite beside it. While a conversation is running it swallows
   the input, so the player cannot walk away mid-sentence.
------------------------------------------------------------------- */

const Dialogue = (() => {
  let box, nameEl, textEl, portraitEl;
  let lines = [], idx = 0, onDone = null, active = false;
  let locked = false, lockTimer = null;

  function init() {
    box = document.getElementById('dialogue');
    nameEl = box.querySelector('.dlg-name');
    textEl = box.querySelector('.dlg-text');
    portraitEl = box.querySelector('.dlg-portrait');
    box.addEventListener('click', advance);
  }

  function start(newLines, done, opts = {}) {
    if (!box) init();
    lines = newLines;
    idx = 0;
    onDone = done;
    active = true;
    // position is per conversation: a guide speaks from a corner, a
    // face-to-face conversation from across the bottom
    box.classList.remove('topright', 'bottomright');
    if (opts.pos) box.classList.add(opts.pos);
    box.classList.remove('hidden');
    render();
  }

  function render() {
    const line = lines[idx];
    box.classList.toggle('narration', !line.who);
    box.classList.toggle('sweet', !!line.sweet);

    /* A locked line ignores input entirely and dismisses itself, so the
       moment it belongs to gets to play out instead of being skipped. */
    clearTimeout(lockTimer);
    locked = !!line.lock;
    box.classList.toggle('locked', locked);
    if (locked) {
      lockTimer = setTimeout(() => { locked = false; advance(); }, line.wait || 2800);
    }

    nameEl.textContent = line.who;
    textEl.textContent = line.text;

    portraitEl.innerHTML = '';
    const char = CHARACTERS[line.char];
    if (char) {
      // the speaker's actual sprite, cropped to head and shoulders
      const src = renderFrame(char, 'idle', 4);
      const cv = document.createElement('canvas');
      cv.width = src.width;
      cv.height = Math.min(src.height, 15 * 4);
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      c.drawImage(src, 0, 0);
      portraitEl.appendChild(cv);
    }
    if (typeof Sound !== 'undefined') Sound.play('talk');
    // a line can make something happen the moment it is spoken
    if (line.on) line.on();
  }

  function advance() {
    if (!active || locked) return;
    idx++;
    if (idx >= lines.length) close();
    else render();
  }

  function close() {
    clearTimeout(lockTimer);
    locked = false;
    active = false;
    box.classList.add('hidden');
    const cb = onDone;
    onDone = null;
    if (cb) cb();
  }

  return { init, start, advance, close, get active() { return active; } };
})();
