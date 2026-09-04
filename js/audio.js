/* ------------------------------------------------------------------
   Audio — everything is synthesised with the Web Audio API, so the
   game ships with no sound files at all.

   Browsers refuse to make noise until the user interacts, so nothing
   here starts until Sound.unlock() is called from a real click/keypress.
------------------------------------------------------------------- */

const Sound = (() => {
  let ctx = null;
  let master, musicGain, sfxGain;
  let started = false;
  let muted = false;

  /* --- music scheduler state --- */
  let songTimer = null;
  let step = 0;
  let nextNoteTime = 0;
  let currentSong = null;

  const MASTER_LEVEL = 1.0;
  const A4 = 440;
  /* note name -> frequency, e.g. n('D4') */
  function n(name) {
    const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    const semis = map[m[1]] + acc + (parseInt(m[3], 10) - 4) * 12 - 9;
    return A4 * Math.pow(2, semis / 12);
  }

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    // master -> compressor -> out. The compressor lets the mix sit loud
    // without the music and a burst of sfx clipping when they collide.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;
    comp.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = MASTER_LEVEL;
    master.connect(comp);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.62;
    musicGain.connect(master);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.95;
    sfxGain.connect(master);
  }

  /* Call from a click / keydown handler. */
  function unlock() {
    init();
    if (ctx.state === 'suspended') ctx.resume();
    started = true;
  }

  /* ------------------------------ VOICES --------------------------- */

  /* A single enveloped oscillator note. */
  function tone(freq, when, dur, opts = {}) {
    if (!ctx) return;
    const {
      type = 'square', gain = 0.25, dest = sfxGain,
      attack = 0.005, release = dur * 0.6, slideTo = null, detune = 0
    } = opts;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, when);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, when + dur);

    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur + release);

    osc.connect(g).connect(dest);
    osc.start(when);
    osc.stop(when + dur + release + 0.02);
  }

  /* Filtered noise — footsteps, landings, rain. */
  function noise(when, dur, opts = {}) {
    if (!ctx) return;
    const { gain = 0.2, freq = 1200, q = 1, type = 'lowpass', dest = sfxGain } = opts;
    const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = freq;
    filt.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    src.connect(filt).connect(g).connect(dest);
    src.start(when);
    src.stop(when + dur);
  }

  /* ------------------------------- SFX ----------------------------- */
  const SFX = {
    jump() {
      const t = ctx.currentTime;
      tone(n('D4'), t, 0.06, { type: 'square', gain: 0.5, slideTo: n('A5'), release: 0.05 });
    },
    land() {
      const t = ctx.currentTime;
      noise(t, 0.09, { gain: 0.34, freq: 420, type: 'lowpass' });
    },
    step() {
      const t = ctx.currentTime;
      noise(t, 0.035, { gain: 0.13, freq: 900, type: 'bandpass', q: 1.4 });
    },
    pickup() {
      const t = ctx.currentTime;
      tone(n('E5'), t, 0.07, { type: 'triangle', gain: 0.48 });
      tone(n('B5'), t + 0.07, 0.11, { type: 'triangle', gain: 0.44 });
    },
    hurt() {
      const t = ctx.currentTime;
      tone(n('A3'), t, 0.14, { type: 'sawtooth', gain: 0.38, slideTo: n('D3') });
    },
    checkpoint() {
      const t = ctx.currentTime;
      ['D5', 'F#5', 'A5'].forEach((nn, i) =>
        tone(n(nn), t + i * 0.07, 0.09, { type: 'triangle', gain: 0.44 }));
    },
    /* the level-clear fanfare */
    clear() {
      const t = ctx.currentTime;
      const mel = ['D5', 'F#5', 'A5', 'D6', 'A5', 'D6'];
      const times = [0, 0.12, 0.24, 0.38, 0.54, 0.66];
      const durs = [0.1, 0.1, 0.12, 0.14, 0.1, 0.5];
      mel.forEach((nn, i) => {
        tone(n(nn), t + times[i], durs[i], { type: 'square', gain: 0.5, release: 0.18 });
        tone(n(nn), t + times[i], durs[i], { type: 'triangle', gain: 0.34, detune: -6 });
      });
      tone(n('D3'), t, 1.2, { type: 'triangle', gain: 0.38, release: 0.5 });
    },
    /* one soft blip per line of dialogue */
    talk() {
      const t = ctx.currentTime;
      tone(n('A4'), t, 0.035, { type: 'triangle', gain: 0.22, release: 0.04 });
      tone(n('E5'), t + 0.03, 0.04, { type: 'triangle', gain: 0.15, release: 0.05 });
    },
    /* pressed START — also the first thing you should ever hear, so it
       doubles as proof the audio actually works */
    confirm() {
      const t = ctx.currentTime;
      tone(n('D5'), t, 0.09, { type: 'square', gain: 0.42 });
      tone(n('A5'), t + 0.09, 0.16, { type: 'square', gain: 0.38, release: 0.2 });
      tone(n('D4'), t, 0.3, { type: 'triangle', gain: 0.3, release: 0.25 });
    },
    /* a brush stroke — very short, very soft, so 108 of them in a row
       stay pleasant rather than becoming a woodpecker */
    brush() {
      const t = ctx.currentTime;
      noise(t, 0.045, { gain: 0.1, freq: 2200, type: 'bandpass', q: 0.8 });
      tone(220 + Math.random() * 180, t, 0.03, { type: 'sine', gain: 0.07 });
    },
    /* a school bell, two struck tones with a long tail */
    bell() {
      const t = ctx.currentTime;
      [0, 0.34].forEach(off => {
        tone(n('F#5'), t + off, 0.5, { type: 'sine', gain: 0.44, release: 0.7 });
        tone(n('C#6'), t + off, 0.4, { type: 'sine', gain: 0.26, release: 0.6 });
        tone(n('F#4'), t + off, 0.6, { type: 'triangle', gain: 0.26, release: 0.8 });
      });
    },
    /* the newborn's first cry, as a soft rising motif — not a literal cry */
    birth() {
      const t = ctx.currentTime;
      ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'].forEach((nn, i) =>
        tone(n(nn), t + i * 0.16, 0.3, { type: 'sine', gain: 0.46, release: 0.4 }));
    }
  };

  function play(name) {
    if (!started || muted || !ctx) return;
    if (SFX[name]) SFX[name]();
  }

  /* ------------------------------ MUSIC ---------------------------- */
  /* Songs are step sequences. 16 steps per bar, one entry per step:
     [bassNote|null, leadNote|null].  null = rest. */

  const SONGS = {
    /* Act 1 — night, rain, urgency. D minor, driving. */
    rush: {
      bpm: 132,
      bass: ['D2', null, 'D2', null, 'A2', null, 'D2', null,
             'Bb1', null, 'Bb1', null, 'F2', null, 'A2', null],
      lead: ['D4', 'F4', 'A4', 'F4', 'D4', null, 'C4', 'D4',
             'Bb3', 'D4', 'F4', 'D4', 'A3', null, 'C4', null],
      leadType: 'square'
    },
    /* Act 2 — slower, warmer, careful. Same key, half the pace. */
    careful: {
      bpm: 96,
      bass: ['D2', null, null, null, 'Bb1', null, null, null,
             'F2', null, null, null, 'A2', null, null, null],
      lead: ['A4', null, 'F4', null, 'D4', null, null, null,
             'F4', null, 'A4', null, 'D5', null, null, null],
      leadType: 'triangle'
    },
    /* Level 3, outdoors — warm, unhurried. C major, strolling. */
    afternoon: {
      bpm: 100,
      bass: ['C2', null, 'G2', null, 'A2', null, null, null,
             'F2', null, 'C2', null, 'G2', null, null, null],
      lead: ['E4', 'G4', 'C5', null, 'B4', null, 'A4', 'G4',
             'A4', 'C5', 'E5', null, 'D5', 'B4', null, null],
      leadType: 'triangle'
    },
    /* Level 3, inside the house — quiet, sparse, someone else's home. */
    indoors: {
      bpm: 82,
      bass: ['F2', null, null, null, 'C2', null, null, null,
             'D2', null, null, null, 'Bb1', null, null, null],
      lead: ['A4', null, null, 'C5', null, null, 'F4', null,
             'G4', null, null, 'A4', null, null, null, null],
      leadType: 'sine'
    },
    /* Level 2 — morning, dry, bright. D major, walking pace. */
    morning: {
      bpm: 112,
      bass: ['D2', null, 'A2', null, 'D2', null, null, null,
             'G2', null, 'D2', null, 'A2', null, null, null],
      lead: ['F#4', 'A4', 'D5', null, 'E5', null, 'C#5', 'D5',
             'B4', 'D5', 'G4', null, 'A4', 'F#4', null, null],
      leadType: 'triangle'
    },
    /* The hospital, after. D major, quiet and hopeful. */
    lullaby: {
      bpm: 76,
      bass: ['D2', null, null, null, 'G2', null, null, null,
             'A2', null, null, null, 'D2', null, null, null],
      lead: ['D5', null, 'F#5', null, 'A5', null, 'F#5', null,
             'E5', null, 'D5', null, 'A4', null, null, null],
      leadType: 'sine'
    }
  };

  function scheduler() {
    if (!currentSong) return;
    const song = SONGS[currentSong];
    const stepDur = 60 / song.bpm / 4; // 16th notes

    while (nextNoteTime < ctx.currentTime + 0.12) {
      const i = step % 16;
      const b = song.bass[i], l = song.lead[i];
      if (b) tone(n(b), nextNoteTime, stepDur * 1.6,
                  { type: 'triangle', gain: 0.62, dest: musicGain, release: 0.08 });
      if (l) tone(n(l), nextNoteTime, stepDur * 0.8,
                  { type: song.leadType, gain: 0.32, dest: musicGain, release: 0.06 });
      nextNoteTime += stepDur;
      step++;
    }
  }

  function playMusic(name) {
    if (!started || !ctx) return;
    if (currentSong === name) return;
    currentSong = name;
    step = 0;
    nextNoteTime = ctx.currentTime + 0.05;
    if (!songTimer) songTimer = setInterval(scheduler, 25);
  }

  function stopMusic() {
    currentSong = null;
    clearInterval(songTimer);
    songTimer = null;
  }

  function setMuted(v) {
    muted = v;
    if (master) master.gain.value = v ? 0 : MASTER_LEVEL;
  }
  function isMuted() { return muted; }
  function toggleMute() { setMuted(!muted); return muted; }

  /* Peak level on the master bus, for checking the graph really is
     producing signal rather than silently scheduling nothing. */
  let analyser = null;
  function meter() {
    if (!ctx) return -1;
    if (!analyser) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      master.connect(analyser);
    }
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    let peak = 0;
    for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
    return +peak.toFixed(4);
  }

  /* Diagnostics — the audio graph is otherwise invisible from outside. */
  function debug() {
    return {
      ctx: !!ctx,
      state: ctx ? ctx.state : 'none',
      started, muted,
      song: currentSong,
      timer: !!songTimer,
      now: ctx ? +ctx.currentTime.toFixed(2) : -1,
      next: +nextNoteTime.toFixed(2)
    };
  }

  return { unlock, play, playMusic, stopMusic, toggleMute, isMuted, setMuted, debug, meter };
})();
