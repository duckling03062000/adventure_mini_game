/* ------------------------------------------------------------------
   The physics class — Level 5, inside Allen.

   Projectile motion, which is what half of first-year mechanics is.
   Set the angle and the speed, launch, and land it on the target. The
   range equation is printed under the controls and it is the real one,
   so the sums she does in her head actually work.

       R = v² · sin(2θ) / g

   Nothing punishes a miss. She can launch as many times as she likes.
------------------------------------------------------------------- */

const PHYSICS = {
  g: 9.8,
  /* Each problem fixes one variable and leaves the other to her. */
  problems: [
    { target: 32, tol: 2.5, lockSpeed: 20, prompt: 'Speed is fixed at 20 m/s. Find the angle. (45° is the farthest it will ever go — so this one is not 45°.)' },
    { target: 62, tol: 3.5, lockAngle: 45, prompt: 'Angle locked at 45°, the best there is. Now find the speed.' },
    { target: 78, tol: 4.0, prompt: 'Both are yours this time. Get it on the mark.' }
  ]
};

const Physics = (() => {
  let board, cv, ctx2, at = 0, onDone = null;
  let angle = 45, speed = 20, flying = false, t = 0, hit = false, raf = 0;

  const W = 640, H = 240, PAD = 30;
  const scaleX = () => (W - PAD * 2) / 100;   // 100 m across the field

  function build(container, done) {
    board = container;
    onDone = done;
    at = 0;
    cv = board.querySelector('.phys-canvas');
    cv.width = W; cv.height = H;
    ctx2 = cv.getContext('2d');

    board.querySelector('.phys-angle').oninput = e => {
      angle = +e.target.value; paint(); readout();
    };
    board.querySelector('.phys-speed').oninput = e => {
      speed = +e.target.value; paint(); readout();
    };
    board.querySelector('.phys-fire').onclick = e => { e.target.blur(); launch(); };

    loadProblem();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function loadProblem() {
    const p = PHYSICS.problems[at];
    angle = p.lockAngle ?? 45;
    speed = p.lockSpeed ?? 20;
    flying = false; hit = false; t = 0;

    const aEl = board.querySelector('.phys-angle');
    const sEl = board.querySelector('.phys-speed');
    aEl.value = angle; sEl.value = speed;
    aEl.disabled = !!p.lockAngle;
    sEl.disabled = !!p.lockSpeed;
    board.querySelector('.phys-row-angle').classList.toggle('locked', !!p.lockAngle);
    board.querySelector('.phys-row-speed').classList.toggle('locked', !!p.lockSpeed);
    board.querySelector('.phys-prompt').textContent = p.prompt;
    board.querySelector('.phys-count').textContent =
      `problem ${at + 1} of ${PHYSICS.problems.length}`;
    readout();
  }

  const rad = d => d * Math.PI / 180;
  const range = () => speed * speed * Math.sin(2 * rad(angle)) / PHYSICS.g;

  function readout() {
    board.querySelector('.phys-a-val').textContent = `${angle}°`;
    board.querySelector('.phys-s-val').textContent = `${speed} m/s`;
    board.querySelector('.phys-range').textContent = `${range().toFixed(1)} m`;
  }

  function launch() {
    if (flying) return;
    flying = true; t = 0; hit = false;
    Sound.play('jump');
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (flying) {
      t += 1 / 60 * 2.2;
      const flight = 2 * speed * Math.sin(rad(angle)) / PHYSICS.g;
      if (t >= flight) {
        flying = false;
        const p = PHYSICS.problems[at];
        if (Math.abs(range() - p.target) <= p.tol) land(true); else land(false);
      }
    }
    paint();
  }

  function land(ok) {
    if (ok) {
      hit = true;
      Sound.play('pickup');
      board.querySelector('.phys-count').textContent = 'on the mark';
      setTimeout(() => {
        at++;
        if (at >= PHYSICS.problems.length) return finish();
        loadProblem();
      }, 900);
    } else {
      Sound.play('hurt');
      board.querySelector('.phys-count').textContent =
        range() < PHYSICS.problems[at].target ? 'short — try again' : 'long — try again';
    }
  }

  function finish() {
    cancelAnimationFrame(raf); raf = 0;
    board.querySelector('.phys-count').textContent = 'all three';
    setTimeout(() => { Sound.play('clear'); onDone && onDone(); }, 700);
  }

  /* ------------------------------ drawing ------------------------- */
  function paint() {
    const p = PHYSICS.problems[at];
    const gy = H - 34, sx = PAD, k = scaleX();

    ctx2.fillStyle = '#eef3fa'; ctx2.fillRect(0, 0, W, H);

    // metre grid, so distance is readable
    ctx2.strokeStyle = 'rgba(60,80,120,.12)';
    ctx2.lineWidth = 1;
    for (let m = 0; m <= 100; m += 10) {
      const x = sx + m * k;
      ctx2.beginPath(); ctx2.moveTo(x, 20); ctx2.lineTo(x, gy); ctx2.stroke();
      ctx2.fillStyle = 'rgba(60,80,120,.45)';
      ctx2.font = '9px Nunito, sans-serif';
      ctx2.fillText(`${m}`, x - 5, gy + 13);
    }

    ctx2.fillStyle = '#8ec97a'; ctx2.fillRect(0, gy, W, H - gy);
    ctx2.fillStyle = '#76b563'; ctx2.fillRect(0, gy, W, 3);

    // the target
    const tx = sx + p.target * k;
    ctx2.fillStyle = hit ? '#4fae4f' : '#c8402f';
    ctx2.fillRect(tx - p.tol * k, gy - 4, p.tol * 2 * k, 4);
    ctx2.fillRect(tx - 1, gy - 26, 3, 26);
    ctx2.beginPath();
    ctx2.moveTo(tx + 2, gy - 26); ctx2.lineTo(tx + 20, gy - 21);
    ctx2.lineTo(tx + 2, gy - 16); ctx2.closePath(); ctx2.fill();

    // the launcher, pointed at the chosen angle
    ctx2.save();
    ctx2.translate(sx, gy);
    ctx2.rotate(-rad(angle));
    ctx2.fillStyle = '#4a5166'; ctx2.fillRect(0, -4, 26, 8);
    ctx2.restore();
    ctx2.fillStyle = '#2f3546';
    ctx2.beginPath(); ctx2.arc(sx, gy, 7, 0, Math.PI * 2); ctx2.fill();

    // the arc it will take, drawn faintly before she commits
    ctx2.strokeStyle = 'rgba(60,80,120,.3)';
    ctx2.setLineDash([3, 4]);
    ctx2.beginPath();
    for (let s = 0; s <= 1.001; s += 0.02) {
      const flight = 2 * speed * Math.sin(rad(angle)) / PHYSICS.g;
      const tt = s * flight;
      const x = sx + speed * Math.cos(rad(angle)) * tt * k;
      const y = gy - (speed * Math.sin(rad(angle)) * tt - 0.5 * PHYSICS.g * tt * tt) * k;
      s === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y);
    }
    ctx2.stroke();
    ctx2.setLineDash([]);

    if (flying) {
      const x = sx + speed * Math.cos(rad(angle)) * t * k;
      const y = gy - (speed * Math.sin(rad(angle)) * t - 0.5 * PHYSICS.g * t * t) * k;
      ctx2.fillStyle = '#e8623f';
      ctx2.beginPath(); ctx2.arc(x, y, 5, 0, Math.PI * 2); ctx2.fill();
    }
  }

  return { build };
})();
