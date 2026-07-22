// ═══════════════════════════════════════════════
// AUDIO ENGINE (Package B — Audio Engine)
// Procedural ambient music using Web Audio API.
// No audio files needed — generates soundscapes from oscillators.
//
// Tracks:
//   8 Bit Classic  — Square wave, chiptune arpeggios (C major)
//   Piano Calm     — Sine wave, soft sustained pads (A minor)
//   Violin Warm    — Sawtooth wave, filtered pads (D major)
//   Mysterious Jazz — Triangle wave, minor progressions (D minor)
//
// Features: crossfade, volume, auto-tone, persistent across navigation.
// ═══════════════════════════════════════════════

import { getTimePeriod, TIME_PERIODS } from './timeOfDay';

// ── Track Definitions ──

const NOTE_FREQ = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
  Fs3: 185.00, Fs4: 369.99, Bb3: 233.08, Bb4: 466.16, Cs4: 277.18, Cs5: 554.37,
};

const TRACKS = {
  '8bit': {
    label: '8 Bit Classic',
    oscillatorType: 'square',
    color: 'hsl(42 63% 55%)',
    // C major progression — bright, playful
    chords: [
      [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4],
      [NOTE_FREQ.F4, NOTE_FREQ.A4, NOTE_FREQ.C5],
      [NOTE_FREQ.G4, NOTE_FREQ.B4, NOTE_FREQ.D5],
      [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4],
    ],
    chordDuration: 0.4,    // fast arpeggio feel
    noteGap: 0.05,
    filterFreq: 3000,
  },
  'piano': {
    label: 'Piano Calm',
    oscillatorType: 'sine',
    color: 'hsl(199 56% 64%)',
    // A minor — soft, reflective
    chords: [
      [NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.E4],
      [NOTE_FREQ.F3, NOTE_FREQ.A3, NOTE_FREQ.C4],
      [NOTE_FREQ.G3, NOTE_FREQ.B3, NOTE_FREQ.D4],
      [NOTE_FREQ.E3, NOTE_FREQ.G3, NOTE_FREQ.B3],
    ],
    chordDuration: 3.0,    // slow, sustained
    noteGap: 0,
    filterFreq: 2000,
  },
  'violin': {
    label: 'Violin Warm',
    oscillatorType: 'sawtooth',
    color: 'hsl(120 40% 58%)',
    // D major — warm, full
    chords: [
      [NOTE_FREQ.D3, NOTE_FREQ.Fs3, NOTE_FREQ.A3],
      [NOTE_FREQ.G3, NOTE_FREQ.B3, NOTE_FREQ.D4],
      [NOTE_FREQ.A3, NOTE_FREQ.Cs4, NOTE_FREQ.E4],
      [NOTE_FREQ.D3, NOTE_FREQ.Fs3, NOTE_FREQ.A3],
    ],
    chordDuration: 3.5,
    noteGap: 0,
    filterFreq: 1200,      // warmer, filtered
  },
  'jazz': {
    label: 'Mysterious Jazz',
    oscillatorType: 'triangle',
    color: 'hsl(265 41% 64%)',
    // D minor — moody, slightly dissonant
    chords: [
      [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3],
      [NOTE_FREQ.G3, NOTE_FREQ.Bb3, NOTE_FREQ.D4],
      [NOTE_FREQ.A3, NOTE_FREQ.C4, NOTE_FREQ.E4],
      [NOTE_FREQ.D3, NOTE_FREQ.F3, NOTE_FREQ.A3],
    ],
    chordDuration: 2.5,
    noteGap: 0,
    filterFreq: 1500,
  },
};

// Auto-tone: map time period to track
const PERIOD_TRACK_MAP = {
  [TIME_PERIODS.MORNING]: 'piano',
  [TIME_PERIODS.AFTERNOON]: '8bit',
  [TIME_PERIODS.EVENING]: 'jazz',
  [TIME_PERIODS.NIGHT]: 'violin',
};

// ── Audio Engine Singleton ──

class AudioEngine {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._currentTrack = null;
    this._currentVoices = [];
    this._volume = 0.5;
    this._isPlaying = false;
    this._autoTone = true;
    this._autoToneInterval = null;
    this._chordIndex = 0;
    this._schedulerInterval = null;
  }

  _ensureContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._volume;
      this._masterGain.connect(this._ctx.destination);
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  _clearVoices() {
    for (const voice of this._currentVoices) {
      try {
        if (voice.gainNode) {
          voice.gainNode.gain.cancelScheduledValues(this._ctx.currentTime);
          voice.gainNode.gain.linearRampToValueAtTime(0, this._ctx.currentTime + 0.5);
        }
        const oscs = voice.oscillators || [];
        setTimeout(() => {
          oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch (e) {} });
          try { voice.gainNode?.disconnect(); } catch (e) {}
          try { voice.filter?.disconnect(); } catch (e) {}
        }, 600);
      } catch (e) {}
    }
    this._currentVoices = [];
  }

  _playChord(trackId, fadeIn = false) {
    const track = TRACKS[trackId];
    if (!track) return;
    const ctx = this._ensureContext();
    const now = ctx.currentTime;

    const chord = track.chords[this._chordIndex % track.chords.length];
    this._chordIndex++;

    const voice = {
      oscillators: [],
      gainNode: ctx.createGain(),
      filter: ctx.createBiquadFilter(),
    };

    voice.filter.type = 'lowpass';
    voice.filter.frequency.value = track.filterFreq;
    voice.filter.connect(voice.gainNode);
    voice.gainNode.connect(this._masterGain);

    const targetGain = fadeIn ? 0 : 0.15;
    voice.gainNode.gain.setValueAtTime(0, now);
    voice.gainNode.gain.linearRampToValueAtTime(targetGain, now + (fadeIn ? 2 : 0.3));

    for (const freq of chord) {
      const osc = ctx.createOscillator();
      osc.type = track.oscillatorType;
      osc.frequency.value = freq;
      osc.connect(voice.filter);
      osc.start(now);
      voice.oscillators.push(osc);
    }

    this._currentVoices.push(voice);

    // Schedule next chord
    const scheduleNext = () => {
      this._clearVoices();
      if (this._isPlaying && this._currentTrack === trackId) {
        this._playChord(trackId);
      }
    };

    const delay = (track.chordDuration + track.noteGap) * 1000;
    this._schedulerTimeout = setTimeout(scheduleNext, delay);
  }

  play(trackId) {
    const ctx = this._ensureContext();
    this._isPlaying = true;

    // Crossfade: clear current, start new
    this._clearVoices();
    clearTimeout(this._schedulerTimeout);

    this._currentTrack = trackId;
    this._chordIndex = 0;
    this._playChord(trackId, true);

    // Start auto-tone checker
    this._startAutoToneChecker();
  }

  stop() {
    this._isPlaying = false;
    this._clearVoices();
    clearTimeout(this._schedulerTimeout);
    this._stopAutoToneChecker();

    // Fade out master
    if (this._masterGain && this._ctx) {
      const now = this._ctx.currentTime;
      this._masterGain.gain.cancelScheduledValues(now);
      this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now);
      this._masterGain.gain.linearRampToValueAtTime(0, now + 0.5);
      setTimeout(() => {
        if (this._masterGain && !this._isPlaying) {
          this._masterGain.gain.value = this._volume;
        }
      }, 600);
    }
  }

  setVolume(vol) {
    this._volume = vol;
    if (this._masterGain && this._ctx && this._isPlaying) {
      const now = this._ctx.currentTime;
      this._masterGain.gain.cancelScheduledValues(now);
      this._masterGain.gain.linearRampToValueAtTime(vol, now + 0.2);
    }
  }

  setAutoTone(enabled) {
    this._autoTone = enabled;
    if (enabled) {
      this._startAutoToneChecker();
    } else {
      this._stopAutoToneChecker();
    }
  }

  _startAutoToneChecker() {
    this._stopAutoToneChecker();
    if (!this._autoTone) return;

    // Check every 5 minutes
    this._autoToneInterval = setInterval(() => {
      if (!this._isPlaying || !this._autoTone) return;
      const period = getTimePeriod();
      const recommendedTrack = PERIOD_TRACK_MAP[period];
      if (recommendedTrack && recommendedTrack !== this._currentTrack) {
        this.play(recommendedTrack);
      }
    }, 5 * 60 * 1000);
  }

  _stopAutoToneChecker() {
    if (this._autoToneInterval) {
      clearInterval(this._autoToneInterval);
      this._autoToneInterval = null;
    }
  }

  getTrackForCurrentPeriod() {
    const period = getTimePeriod();
    return PERIOD_TRACK_MAP[period] || 'piano';
  }

  get isPlaying() { return this._isPlaying; }
  get currentTrack() { return this._currentTrack; }
  get volume() { return this._volume; }
}

// Singleton — persists across navigation
export const audioEngine = new AudioEngine();
export { TRACKS, PERIOD_TRACK_MAP };