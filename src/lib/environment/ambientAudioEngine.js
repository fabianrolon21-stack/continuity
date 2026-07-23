// ═══════════════════════════════════════════════
// AMBIENT AUDIO ENGINE (Package 018 — Immersive Environment)
// Procedural ambient soundscapes using Web Audio API.
// No audio files needed — generates nature, interior,
// and fantasy soundscapes from oscillators and noise.
//
// Sounds:
//   Nature:  birds, wind, rain, water, crickets
//   Interior: fireplace, cafe, library, paper
//   Fantasy: chimes, forest
// ═══════════════════════════════════════════════

export const AMBIENT_SOUNDS = {
  // Nature
  birds:     { label: 'Birds',     category: 'nature',    icon: 'bird' },
  wind:      { label: 'Wind',      category: 'nature',    icon: 'wind' },
  rain:      { label: 'Rain',      category: 'nature',    icon: 'cloud' },
  water:     { label: 'Water',     category: 'nature',    icon: 'cloud' },
  crickets:  { label: 'Crickets',  category: 'nature',    icon: 'star' },
  // Interior
  fireplace: { label: 'Fireplace', category: 'interior', icon: 'heart' },
  cafe:       { label: 'Café',      category: 'interior', icon: 'coffee' },
  library:    { label: 'Library',   category: 'interior', icon: 'book' },
  paper:      { label: 'Paper',     category: 'interior', icon: 'book' },
  // Fantasy
  chimes:     { label: 'Chimes',    category: 'fantasy',  icon: 'sparkle' },
  forest:     { label: 'Forest',    category: 'fantasy',  icon: 'tree' },
};

class AmbientAudioEngine {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._noiseBuffer = null;
    this._activeSounds = new Map(); // soundId -> { nodes[], stopFns[] }
    this._volume = 0.3;
    this._enabled = false;
  }

  _ensureContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(this._ctx.destination);
      this._noiseBuffer = this._createNoiseBuffer(2);
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  _createNoiseBuffer(duration = 2) {
    const ctx = this._ensureContext();
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // ── Sound generators ──

  _startBirds() {
    const ctx = this._ensureContext();
    const stopFns = [];
    const chirp = () => {
      if (!this._activeSounds.has('birds')) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startFreq = 2000 + Math.random() * 2000;
      const endFreq = startFreq + (Math.random() - 0.5) * 1000;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(100, endFreq), ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain).connect(this._masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      const nextDelay = 500 + Math.random() * 3000;
      const timeout = setTimeout(chirp, nextDelay);
      stopFns.push(() => clearTimeout(timeout));
    };
    const initialTimeout = setTimeout(chirp, 200);
    stopFns.push(() => clearTimeout(initialTimeout));
    return { stopFns };
  }

  _startWind() {
    const ctx = this._ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    source.connect(filter).connect(gain).connect(this._masterGain);
    source.start();
    // Slowly modulate filter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 150;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    return { stopFns: [], nodes: [source, filter, gain, lfo, lfoGain], stop: () => { try { source.stop(); lfo.stop(); } catch(e){} } };
  }

  _startRain() {
    const ctx = this._ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0.06;
    source.connect(filter).connect(gain).connect(this._masterGain);
    source.start();
    return { stopFns: [], nodes: [source, filter, gain], stop: () => { try { source.stop(); } catch(e){} } };
  }

  _startWater() {
    const ctx = this._ensureContext();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 120;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    osc.connect(filter).connect(gain).connect(this._masterGain);
    osc.start();
    // Modulate frequency for flowing effect
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start();
    return { stopFns: [], nodes: [osc, filter, gain, lfo, lfoGain], stop: () => { try { osc.stop(); lfo.stop(); } catch(e){} } };
  }

  _startCrickets() {
    const ctx = this._ensureContext();
    const interval = setInterval(() => {
      if (!this._activeSounds.has('crickets')) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 4000 + Math.random() * 500;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.01);
      gain.gain.setValueAtTime(0.015, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain).connect(this._masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }, 180);
    return { stopFns: [() => clearInterval(interval)] };
  }

  _startFireplace() {
    const ctx = this._ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    source.connect(filter).connect(gain).connect(this._masterGain);
    source.start();
    // Random crackle
    const crackleInterval = setInterval(() => {
      if (!this._activeSounds.has('fireplace')) return;
      const burst = ctx.createBufferSource();
      burst.buffer = this._noiseBuffer;
      burst.loop = false;
      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(0, ctx.currentTime);
      burstGain.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.02, ctx.currentTime + 0.005);
      burstGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03 + Math.random() * 0.02);
      burst.connect(burstGain).connect(this._masterGain);
      burst.start();
      burst.stop(ctx.currentTime + 0.1);
    }, 400 + Math.random() * 800);
    return { stopFns: [() => { clearInterval(crackleInterval); try { source.stop(); } catch(e){} }] };
  }

  _startCafe() {
    const ctx = this._ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    const gain = ctx.createGain();
    gain.gain.value = 0.02;
    source.connect(filter).connect(gain).connect(this._masterGain);
    source.start();
    return { stopFns: [], nodes: [source, filter, gain], stop: () => { try { source.stop(); } catch(e){} } };
  }

  _startLibrary() {
    const ctx = this._ensureContext();
    const source = ctx.createBufferSource();
    source.buffer = this._noiseBuffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    const gain = ctx.createGain();
    gain.gain.value = 0.008;
    source.connect(filter).connect(gain).connect(this._masterGain);
    source.start();
    return { stopFns: [], nodes: [source, filter, gain], stop: () => { try { source.stop(); } catch(e){} } };
  }

  _startPaper() {
    const ctx = this._ensureContext();
    const interval = setInterval(() => {
      if (!this._activeSounds.has('paper')) return;
      const burst = ctx.createBufferSource();
      burst.buffer = this._noiseBuffer;
      burst.loop = false;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      burst.connect(filter).connect(gain).connect(this._masterGain);
      burst.start();
      burst.stop(ctx.currentTime + 0.2);
    }, 8000 + Math.random() * 12000);
    return { stopFns: [() => clearInterval(interval)] };
  }

  _startChimes() {
    const ctx = this._ensureContext();
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00];
    const playChime = () => {
      if (!this._activeSounds.has('chimes')) return;
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.connect(gain).connect(this._masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 2.5);
      const nextDelay = 3000 + Math.random() * 6000;
      const timeout = setTimeout(playChime, nextDelay);
      // Store timeout cleanup
      const entry = this._activeSounds.get('chimes');
      if (entry) entry.stopFns.push(() => clearTimeout(timeout));
    };
    const initialTimeout = setTimeout(playChime, 500);
    return { stopFns: [() => clearTimeout(initialTimeout)] };
  }

  _startForest() {
    // Combination of birds + wind
    const birds = this._startBirds();
    const wind = this._startWind();
    return {
      stopFns: [...birds.stopFns, ...wind.stopFns],
      stop: wind.stop,
      isComposite: true,
    };
  }

  // ── Public API ──

  play(soundId) {
    if (!AMBIENT_SOUNDS[soundId]) return;
    if (this._activeSounds.has(soundId)) return;
    this._enabled = true;
    const ctx = this._ensureContext();
    const generator = this[`_start${soundId.charAt(0).toUpperCase() + soundId.slice(1)}`];
    if (!generator) return;
    const entry = generator.call(this);
    this._activeSounds.set(soundId, entry);
  }

  stop(soundId) {
    const entry = this._activeSounds.get(soundId);
    if (!entry) return;
    if (entry.stopFns) entry.stopFns.forEach(fn => { try { fn(); } catch(e){} });
    if (entry.stop) entry.stop();
    if (entry.nodes) entry.nodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch(e){} });
    this._activeSounds.delete(soundId);
  }

  stopAll() {
    for (const soundId of [...this._activeSounds.keys()]) {
      this.stop(soundId);
    }
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

  isPlaying(soundId) {
    return this._activeSounds.has(soundId);
  }

  getActiveSounds() {
    return [...this._activeSounds.keys()];
  }

  get isEnabled() { return this._enabled; }
}

export const ambientAudioEngine = new AmbientAudioEngine();