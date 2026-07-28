// ═══════════════════════════════════════════════
// AMBIENT AUDIO ENGINE (Package 018 — Immersive Environment)
// Procedural ambient soundscapes using Web Audio API.
// No audio files needed — generates nature, interior,
// and urban soundscapes from oscillators and noise.
//
// Mixing: every generator declares an explicit level in
// LEVELS so the whole bed stays balanced and audible.
// ═══════════════════════════════════════════════

export const AMBIENT_SOUNDS = {
  // Nature
  birds:        { label: 'Birds',        category: 'nature',   icon: 'bird' },
  owls:         { label: 'Owls',         category: 'nature',   icon: 'moon' },
  wind:         { label: 'Wind',         category: 'nature',   icon: 'wind' },
  rain:         { label: 'Rain',         category: 'nature',   icon: 'cloud' },
  thunder:      { label: 'Thunder',      category: 'nature',   icon: 'zap' },
  water:        { label: 'Stream',       category: 'nature',   icon: 'droplet' },
  ocean:        { label: 'Ocean',        category: 'nature',   icon: 'waves' },
  crickets:     { label: 'Crickets',     category: 'nature',   icon: 'star' },
  leaves:       { label: 'Leaves',       category: 'nature',   icon: 'leaf' },
  forest:       { label: 'Forest',       category: 'nature',   icon: 'tree' },
  // Interior
  fireplace:    { label: 'Fireplace',    category: 'interior', icon: 'flame' },
  campfire:     { label: 'Campfire',     category: 'interior', icon: 'flame' },
  cafe:         { label: 'Café',         category: 'interior', icon: 'coffee' },
  library:      { label: 'Library',      category: 'interior', icon: 'book' },
  paper:        { label: 'Paper',        category: 'interior', icon: 'book' },
  // Urban
  cars_passing: { label: 'Cars Passing', category: 'urban',    icon: 'car' },
  train:        { label: 'Distant Train',category: 'urban',    icon: 'train' },
  city:         { label: 'City Ambience',category: 'urban',    icon: 'building' },
  // Fantasy
  chimes:       { label: 'Chimes',       category: 'fantasy',  icon: 'sparkle' },
};

// ── Mix levels (post-master). Tuned so any combination stays audible. ──
const LEVELS = {
  birdChirp: 0.30,
  owlHoot: 0.28,
  wind: 0.22,
  rainBed: 0.26,
  thunderRumble: 0.55,
  water: 0.20,
  oceanBed: 0.28,
  cricketChirp: 0.10,
  leaves: 0.18,
  fireBed: 0.20,
  fireCrackle: 0.22,
  cafeBed: 0.14,
  cafeClink: 0.10,
  libraryBed: 0.08,
  paperRustle: 0.14,
  carWhoosh: 0.34,
  trainRumble: 0.30,
  cityBed: 0.16,
  chime: 0.26,
};

class AmbientAudioEngine {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._noiseBuffer = null;
    this._activeSounds = new Map();
    this._volume = 0.6;
    this._enabled = false;
    this._pendingResume = false;
  }

  _ensureContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(this._ctx.destination);
      this._noiseBuffer = this._buildNoiseBuffer(this._ctx, 3);
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
      this._armGestureResume();
    }
    return this._ctx;
  }

  // Browsers block audio until the user interacts. If the context is still
  // suspended, resume it on the very next gesture so saved ambience is heard.
  _armGestureResume() {
    if (this._pendingResume) return;
    this._pendingResume = true;
    const resume = () => {
      this._ctx?.resume();
      this._pendingResume = false;
      ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
        window.removeEventListener(ev, resume)
      );
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
      window.addEventListener(ev, resume, { once: true })
    );
  }

  _buildNoiseBuffer(ctx, duration) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // ── Building blocks ──

  // Continuous filtered-noise bed
  _noiseBed(soundId, { type = 'lowpass', freq = 400, q = null, level = 0.2, lfoRate = 0, lfoDepth = 0 }) {
    const ctx = this._ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    if (q !== null) filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(level, ctx.currentTime + 1.5);
    source.connect(filter).connect(gain).connect(this._masterGain);
    source.start();

    let lfo = null, lfoGain = null;
    if (lfoRate > 0) {
      lfo = ctx.createOscillator();
      lfo.frequency.value = lfoRate;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = lfoDepth;
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start();
    }

    return {
      stopFns: [],
      stop: () => {
        try {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
          setTimeout(() => {
            try { source.stop(); lfo?.stop(); } catch (e) {}
            [source, filter, gain, lfo, lfoGain].forEach(n => { try { n?.disconnect(); } catch (e) {} });
          }, 500);
        } catch (e) {}
      },
    };
  }

  // Repeating one-shot event on a randomized schedule
  _recurring(soundId, minMs, maxMs, fire) {
    let timeout = null;
    const cancelled = () => !this._activeSounds.has(soundId);
    const tick = () => {
      if (cancelled()) return;
      try { fire(this._ensureContext()); } catch (e) {}
      timeout = setTimeout(tick, minMs + Math.random() * (maxMs - minMs));
    };
    timeout = setTimeout(tick, 300 + Math.random() * 1200);
    return { stopFns: [() => clearTimeout(timeout)] };
  }

  _tone(ctx, { type = 'sine', freq, endFreq = null, level, attack = 0.02, duration = 0.3 }) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + duration * 0.6);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(this._masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  _noiseBurst(ctx, { type = 'lowpass', freq = 800, q = null, level, attack = 0.01, duration = 0.3, sweepTo = null }) {
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    const now = ctx.currentTime;
    filter.frequency.setValueAtTime(freq, now);
    if (sweepTo) filter.frequency.linearRampToValueAtTime(sweepTo, now + duration);
    if (q !== null) filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.connect(filter).connect(gain).connect(this._masterGain);
    src.start(now);
    src.stop(now + duration + 0.05);
  }

  // ── Generators ──

  _birds() {
    return this._recurring('birds', 700, 3800, (ctx) => {
      const start = 2000 + Math.random() * 2000;
      this._tone(ctx, { freq: start, endFreq: start + (Math.random() - 0.5) * 1200, level: LEVELS.birdChirp, duration: 0.16 });
      if (Math.random() < 0.4) {
        setTimeout(() => this._tone(ctx, { freq: start * 1.1, endFreq: start * 0.9, level: LEVELS.birdChirp * 0.8, duration: 0.14 }), 180);
      }
    });
  }

  _owls() {
    return this._recurring('owls', 6000, 15000, (ctx) => {
      this._tone(ctx, { freq: 400, endFreq: 340, level: LEVELS.owlHoot, attack: 0.08, duration: 0.7 });
      setTimeout(() => this._tone(ctx, { freq: 380, endFreq: 320, level: LEVELS.owlHoot * 0.85, attack: 0.08, duration: 0.9 }), 850);
    });
  }

  _wind() {
    return this._noiseBed('wind', { freq: 420, level: LEVELS.wind, lfoRate: 0.08, lfoDepth: 220 });
  }

  _rain() {
    return this._noiseBed('rain', { type: 'bandpass', freq: 2400, q: 0.4, level: LEVELS.rainBed });
  }

  _thunder() {
    // Rain bed plus occasional distant rumble
    const bed = this._noiseBed('thunder', { type: 'bandpass', freq: 2200, q: 0.4, level: LEVELS.rainBed * 0.7 });
    const rumbles = this._recurring('thunder', 14000, 38000, (ctx) => {
      this._noiseBurst(ctx, { freq: 220, sweepTo: 60, level: LEVELS.thunderRumble, attack: 0.35, duration: 2.6 });
    });
    return { stopFns: rumbles.stopFns, stop: bed.stop };
  }

  _water() {
    const bed = this._noiseBed('water', { type: 'bandpass', freq: 1100, q: 0.7, level: LEVELS.water, lfoRate: 0.4, lfoDepth: 350 });
    const trickles = this._recurring('water', 1200, 3600, (ctx) => {
      this._tone(ctx, { freq: 900 + Math.random() * 700, endFreq: 400, level: LEVELS.water * 0.5, duration: 0.2 });
    });
    return { stopFns: trickles.stopFns, stop: bed.stop };
  }

  _ocean() {
    // Slow swelling wave motion via a very low LFO on the filter
    return this._noiseBed('ocean', { freq: 700, level: LEVELS.oceanBed, lfoRate: 0.12, lfoDepth: 480 });
  }

  _crickets() {
    return this._recurring('crickets', 150, 260, (ctx) => {
      this._tone(ctx, { type: 'square', freq: 4000 + Math.random() * 600, level: LEVELS.cricketChirp, attack: 0.008, duration: 0.05 });
    });
  }

  _leaves() {
    return this._noiseBed('leaves', { type: 'highpass', freq: 2600, level: LEVELS.leaves, lfoRate: 0.22, lfoDepth: 900 });
  }

  _forest() {
    const wind = this._noiseBed('forest', { freq: 380, level: LEVELS.wind * 0.8, lfoRate: 0.07, lfoDepth: 180 });
    const birds = this._recurring('forest', 1200, 5000, (ctx) => {
      const start = 2200 + Math.random() * 1800;
      this._tone(ctx, { freq: start, endFreq: start - 600, level: LEVELS.birdChirp * 0.9, duration: 0.16 });
    });
    return { stopFns: birds.stopFns, stop: wind.stop };
  }

  _fireplace() {
    const bed = this._noiseBed('fireplace', { freq: 320, level: LEVELS.fireBed });
    const crackle = this._recurring('fireplace', 250, 900, (ctx) => {
      this._noiseBurst(ctx, { type: 'bandpass', freq: 1400 + Math.random() * 1600, q: 1.2, level: LEVELS.fireCrackle * (0.6 + Math.random() * 0.6), duration: 0.06 });
    });
    return { stopFns: crackle.stopFns, stop: bed.stop };
  }

  _campfire() {
    const bed = this._noiseBed('campfire', { freq: 300, level: LEVELS.fireBed });
    const crackle = this._recurring('campfire', 180, 700, (ctx) => {
      this._noiseBurst(ctx, { type: 'bandpass', freq: 1200 + Math.random() * 2000, q: 1.0, level: LEVELS.fireCrackle, duration: 0.07 });
    });
    const nightBed = this._noiseBed('campfire_night', { type: 'highpass', freq: 3000, level: 0.05 });
    return { stopFns: crackle.stopFns, stop: () => { bed.stop(); nightBed.stop(); } };
  }

  _cafe() {
    const murmur = this._noiseBed('cafe', { freq: 260, level: LEVELS.cafeBed, lfoRate: 0.3, lfoDepth: 90 });
    const clinks = this._recurring('cafe', 3000, 9000, (ctx) => {
      this._tone(ctx, { freq: 2400 + Math.random() * 1400, level: LEVELS.cafeClink, attack: 0.004, duration: 0.22 });
    });
    return { stopFns: clinks.stopFns, stop: murmur.stop };
  }

  _library() {
    return this._noiseBed('library', { freq: 180, level: LEVELS.libraryBed });
  }

  _paper() {
    return this._recurring('paper', 7000, 16000, (ctx) => {
      this._noiseBurst(ctx, { type: 'highpass', freq: 1800, level: LEVELS.paperRustle, attack: 0.02, duration: 0.22 });
    });
  }

  // Cars passing — a doppler whoosh that sweeps in and out
  _cars_passing() {
    const roadBed = this._noiseBed('cars_passing', { freq: 200, level: LEVELS.cityBed * 0.5 });
    const passes = this._recurring('cars_passing', 3500, 11000, (ctx) => {
      const now = ctx.currentTime;
      const duration = 1.6 + Math.random() * 1.2;
      const near = 0.45 * duration; // moment the car is closest

      const src = ctx.createBufferSource();
      src.buffer = this._noiseBuffer;
      src.loop = true;

      // Body of the car: band-passed noise sweeping down in pitch (doppler)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 0.8;
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.linearRampToValueAtTime(1500, now + near);
      filter.frequency.linearRampToValueAtTime(450, now + duration);

      // Approach / recede volume envelope
      const gain = ctx.createGain();
      const peak = LEVELS.carWhoosh * (0.7 + Math.random() * 0.5);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + near);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Stereo sweep left-to-right (or right-to-left)
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        panner.pan.setValueAtTime(-dir, now);
        panner.pan.linearRampToValueAtTime(dir, now + duration);
        src.connect(filter).connect(gain).connect(panner).connect(this._masterGain);
      } else {
        src.connect(filter).connect(gain).connect(this._masterGain);
      }

      src.start(now);
      src.stop(now + duration + 0.1);
      setTimeout(() => {
        [src, filter, gain, panner].forEach(n => { try { n?.disconnect(); } catch (e) {} });
      }, (duration + 0.3) * 1000);
    });
    return { stopFns: passes.stopFns, stop: roadBed.stop };
  }

  _train() {
    const bed = this._noiseBed('train', { freq: 150, level: LEVELS.cityBed * 0.4 });
    const passes = this._recurring('train', 20000, 50000, (ctx) => {
      this._noiseBurst(ctx, { freq: 160, sweepTo: 260, level: LEVELS.trainRumble, attack: 2.0, duration: 6.5 });
      setTimeout(() => this._tone(ctx, { freq: 320, endFreq: 280, level: LEVELS.trainRumble * 0.5, attack: 0.15, duration: 1.4 }), 1500);
    });
    return { stopFns: passes.stopFns, stop: bed.stop };
  }

  _city() {
    const bed = this._noiseBed('city', { freq: 240, level: LEVELS.cityBed, lfoRate: 0.05, lfoDepth: 80 });
    const events = this._recurring('city', 5000, 14000, (ctx) => {
      if (Math.random() < 0.5) {
        this._noiseBurst(ctx, { type: 'bandpass', freq: 900, q: 0.8, level: LEVELS.carWhoosh * 0.5, attack: 0.4, duration: 1.6, sweepTo: 400 });
      } else {
        this._tone(ctx, { freq: 700 + Math.random() * 300, level: LEVELS.cityBed * 0.8, attack: 0.05, duration: 0.5 });
      }
    });
    return { stopFns: events.stopFns, stop: bed.stop };
  }

  _chimes() {
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.0];
    return this._recurring('chimes', 3000, 8000, (ctx) => {
      this._tone(ctx, { freq: freqs[Math.floor(Math.random() * freqs.length)], level: LEVELS.chime, attack: 0.01, duration: 2.4 });
    });
  }

  // Explicit map — handles multi-word ids like cars_passing
  get _generators() {
    return {
      birds: this._birds, owls: this._owls, wind: this._wind, rain: this._rain,
      thunder: this._thunder, water: this._water, ocean: this._ocean,
      crickets: this._crickets, leaves: this._leaves, forest: this._forest,
      fireplace: this._fireplace, campfire: this._campfire, cafe: this._cafe,
      library: this._library, paper: this._paper,
      cars_passing: this._cars_passing, train: this._train, city: this._city,
      chimes: this._chimes,
    };
  }

  // ── Public API ──

  play(soundId) {
    if (!AMBIENT_SOUNDS[soundId] || this._activeSounds.has(soundId)) return;
    const generator = this._generators[soundId];
    if (!generator) return;
    this._enabled = true;
    this._ensureContext();
    // Register first so _recurring's cancellation guard sees an active sound
    this._activeSounds.set(soundId, { stopFns: [] });
    const entry = generator.call(this);
    this._activeSounds.set(soundId, entry);
  }

  stop(soundId) {
    const entry = this._activeSounds.get(soundId);
    if (!entry) return;
    this._activeSounds.delete(soundId);
    entry.stopFns?.forEach(fn => { try { fn(); } catch (e) {} });
    try { entry.stop?.(); } catch (e) {}
  }

  stopAll() {
    [...this._activeSounds.keys()].forEach(id => this.stop(id));
    this._enabled = false;
  }

  setVolume(vol) {
    this._volume = vol;
    if (this._masterGain && this._ctx) {
      const now = this._ctx.currentTime;
      this._masterGain.gain.cancelScheduledValues(now);
      this._masterGain.gain.linearRampToValueAtTime(vol, now + 0.2);
    }
  }

  isPlaying(soundId) { return this._activeSounds.has(soundId); }
  getActiveSounds() { return [...this._activeSounds.keys()]; }
  get volume() { return this._volume; }
  get isEnabled() { return this._enabled; }
}

export const ambientAudioEngine = new AmbientAudioEngine();