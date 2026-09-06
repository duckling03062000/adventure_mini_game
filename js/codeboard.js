/* ------------------------------------------------------------------
   The code board — Level 6.

   Used twice, for two different things:

     'moodle'    the incubator cell, and the college's own Moodle
     'interview' 2023, and a room with somebody watching her type

   Both are the same puzzle: the lines of a function are on the bench in
   the wrong order, and they have to go into the body in the right one.
   Click a line, click the slot it belongs in. A wrong slot does nothing
   at all, so there is no way to break it and no way to fail it.

   The code is real and it runs. Nobody is going to read it that
   closely, but it should still be right.
------------------------------------------------------------------- */

const CODE_TASKS = {
  moodle: {
    eyebrow: 'the incubator cell, and the college’s own Moodle',
    title: 'Attendance from the Moodle logs',
    brief: 'The lines are on the bench in the wrong order. ' +
           'Click a line, then click where it goes.',
    signature: 'def attendance(logs, roll):',
    lines: [
      'seen = set()',
      'for entry in logs:',
      '    if entry.roll != roll:',
      '        continue',
      '    seen.add(entry.date)',
      'return len(seen) / TOTAL_CLASSES'
    ]
  },
  interview: {
    eyebrow: '2023. A room, a laptop, and somebody watching her type',
    title: 'Reverse a linked list',
    brief: 'They gave her a whiteboard and forty minutes. ' +
           'Click a line, then click where it goes.',
    signature: 'def reverse(head):',
    lines: [
      'prev = None',
      'while head:',
      '    nxt = head.next',
      '    head.next = prev',
      '    prev = head',
      '    head = nxt',
      'return prev'
    ]
  }
};

const CodeBoard = (() => {
  let board, task, slots = [], chips = [], picked = null, placed = 0, onDone;

  function build(container, done, which) {
    onDone = done;
    board = container;
    task = CODE_TASKS[which] || CODE_TASKS.moodle;
    picked = null;
    placed = 0;
    slots = [];
    chips = [];

    board.querySelector('.code-eyebrow').textContent = task.eyebrow;
    board.querySelector('.code-title').textContent = task.title;
    board.querySelector('.code-brief').textContent = task.brief;

    const list = board.querySelector('.code-slots');
    const bank = board.querySelector('.code-bank');
    list.innerHTML = '';
    bank.innerHTML = '';

    // the signature is given: it is the body she has to put in order
    const sig = document.createElement('li');
    sig.className = 'code-sig';
    sig.textContent = task.signature;
    list.appendChild(sig);

    task.lines.forEach((_, i) => {
      const li = document.createElement('li');
      li.className = 'code-slot';
      li.onclick = () => drop(i);
      list.appendChild(li);
      slots.push(li);
    });

    /* Tipped onto the bench, and never already in order. */
    let order;
    do {
      order = task.lines.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    } while (order.every((v, i) => v === i));

    for (const i of order) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'code-chip';
      b.textContent = task.lines[i];
      b.onclick = () => pick(i, b);
      chips[i] = b;
      bank.appendChild(b);
    }
    count();
  }

  function pick(i, el) {
    if (!chips[i] || chips[i].dataset.done) return;
    const again = picked === i;
    for (const c of chips) c && c.classList.remove('is-picked');
    if (again) { picked = null; return; }
    picked = i;
    el.classList.add('is-picked');
    if (typeof Sound !== 'undefined') Sound.play('talk');
  }

  function drop(slot) {
    if (picked == null) return;
    if (picked !== slot) {
      slots[slot].classList.add('is-nope');
      setTimeout(() => slots[slot].classList.remove('is-nope'), 240);
      return;
    }
    slots[slot].textContent = task.lines[slot];
    slots[slot].classList.add('is-filled');
    chips[picked].dataset.done = '1';
    chips[picked].remove();
    picked = null;
    placed++;
    if (typeof Sound !== 'undefined') Sound.play('pickup');
    count();

    if (placed === task.lines.length) {
      board.querySelector('.code-slots').classList.add('is-done');
      if (typeof Sound !== 'undefined') Sound.play('clear');
      setTimeout(() => {
        board.querySelector('.code-slots').classList.remove('is-done');
        onDone && onDone();
      }, 1500);
    }
  }

  function count() {
    const left = task.lines.length - placed;
    board.querySelector('.code-count').textContent =
      left ? `${left} line${left === 1 ? '' : 's'} still on the bench`
           : 'it compiles';
    board.classList.toggle('art-ready', !left);
  }

  return { build };
})();
