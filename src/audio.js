// OOPS! WORLD - Procedural Web Audio Engine (No external files!)
window.OopsWorld = window.OopsWorld || {};

class SoundEngine {
  constructor(storage) {
    this.storage = storage;
    this.ctx = null;
    this.isMuted = false;
    this.soundVolume = 0.8;
    this.musicVolume = 0.5;

    // Music playback state
    this.musicPlaying = false;
    this.musicTimer = null;
    this.musicStep = 0;

    // Load initial settings
    if (this.storage && this.storage.data && this.storage.data.settings) {
      const s = this.storage.data.settings;
      this.soundVolume = s.soundVolume ?? 0.8;
      this.musicVolume = s.musicVolume ?? 0.5;
      this.isMuted = !(s.soundEnabled ?? true);
      this.musicEnabled = s.musicEnabled ?? true;
    } else {
      this.musicEnabled = true;
    }

    // Auto-resume audio on interaction
    const unlock = () => {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend();
        }
      } else {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }
    });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  get now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  tone({ freq = 440, type = 'sine', duration = 0.15, gain = 0.2, endFreq = null, attack = 0.01, decay = 0.05 }) {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const t = this.now;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), t + duration);
      }

      const masterVol = gain * this.soundVolume;
      amp.gain.setValueAtTime(0.001, t);
      amp.gain.linearRampToValueAtTime(masterVol, t + attack);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(amp);
      amp.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  noise({ duration = 0.2, gain = 0.3, filterFreq = 1000, highpass = false }) {
    if (this.isMuted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = highpass ? 'highpass' : 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, this.now);

      const amp = this.ctx.createGain();
      const masterVol = gain * this.soundVolume;
      amp.gain.setValueAtTime(masterVol, this.now);
      amp.gain.exponentialRampToValueAtTime(0.0001, this.now + duration);

      noiseNode.connect(filter);
      filter.connect(amp);
      amp.connect(this.ctx.destination);

      noiseNode.start(this.now);
    } catch (e) {}
  }

  playJump() {
    this.init();
    this.tone({ freq: 260, endFreq: 580, type: 'triangle', duration: 0.16, gain: 0.35, attack: 0.01 });
  }

  playDoubleJump() {
    this.init();
    this.tone({ freq: 520, endFreq: 1040, type: 'sine', duration: 0.2, gain: 0.3, attack: 0.01 });
    setTimeout(() => {
      this.tone({ freq: 780, endFreq: 1300, type: 'triangle', duration: 0.15, gain: 0.25 });
    }, 40);
  }

  playSlide() {
    this.init();
    this.noise({ duration: 0.3, gain: 0.18, filterFreq: 600 });
  }

  playCoin() {
    this.init();
    this.tone({ freq: 987.77, endFreq: 1318.51, type: 'sine', duration: 0.12, gain: 0.28 });
    setTimeout(() => {
      this.tone({ freq: 1318.51, type: 'sine', duration: 0.18, gain: 0.22 });
    }, 60);
  }

  playGem() {
    this.init();
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.tone({ freq, type: 'triangle', duration: 0.14, gain: 0.25 });
      }, idx * 45);
    });
  }

  playStomp() {
    this.init();
    this.tone({ freq: 220, endFreq: 90, type: 'square', duration: 0.14, gain: 0.35 });
    this.noise({ duration: 0.1, gain: 0.25, filterFreq: 400 });
  }

  playPowerup() {
    this.init();
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.tone({ freq, type: 'triangle', duration: 0.18, gain: 0.3 });
      }, i * 50);
    });
  }

  playDamage() {
    this.init();
    this.tone({ freq: 180, endFreq: 40, type: 'sawtooth', duration: 0.28, gain: 0.45 });
    this.noise({ duration: 0.25, gain: 0.4, filterFreq: 800 });
  }

  playShieldBreak() {
    this.init();
    this.tone({ freq: 880, endFreq: 220, type: 'sine', duration: 0.25, gain: 0.35 });
    this.noise({ duration: 0.2, gain: 0.3, filterFreq: 1500, highpass: true });
  }

  playSpeedBoost() {
    this.init();
    this.tone({ freq: 200, endFreq: 900, type: 'sawtooth', duration: 0.35, gain: 0.25 });
  }

  playHeal() {
    this.init();
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, i) => {
      setTimeout(() => {
        this.tone({ freq, type: 'sine', duration: 0.3, gain: 0.25 });
      }, i * 60);
    });
  }

  playWarning() {
    this.init();
    this.tone({ freq: 880, type: 'square', duration: 0.15, gain: 0.35 });
    setTimeout(() => {
      this.tone({ freq: 659.25, type: 'square', duration: 0.18, gain: 0.35 });
    }, 160);
  }

  playGameOver() {
    this.init();
    const freqs = [392, 369.99, 349.23, 311.13, 261.63];
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        this.tone({ freq, endFreq: freq * 0.9, type: 'sawtooth', duration: 0.32, gain: 0.32 });
      }, i * 180);
    });
  }

  playClick() {
    this.init();
    this.tone({ freq: 700, endFreq: 400, type: 'triangle', duration: 0.05, gain: 0.15 });
  }

  startMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    this.musicStep = 0;

    const bpm = 136;
    const stepDuration = (60 / bpm) / 4;

    const bassline = [
      130.81, 0, 130.81, 0, 130.81, 0, 196.00, 0, 130.81, 0, 130.81, 0, 261.63, 0, 196.00, 0,
      98.00, 0, 98.00, 0, 98.00, 0, 146.83, 0, 98.00, 0, 98.00, 0, 196.00, 0, 146.83, 0,
      110.00, 0, 110.00, 0, 110.00, 0, 164.81, 0, 110.00, 0, 110.00, 0, 220.00, 0, 164.81, 0,
      87.31, 0, 87.31, 0, 87.31, 0, 130.81, 0, 87.31, 0, 130.81, 0, 174.61, 0, 196.00, 0
    ];

    const melody = [
      261.63, 0, 329.63, 0, 392.00, 0, 523.25, 0, 392.00, 0, 329.63, 0, 261.63, 329.63, 392.00, 0,
      196.00, 0, 246.94, 0, 293.66, 0, 392.00, 0, 293.66, 0, 246.94, 0, 196.00, 0, 246.94, 0,
      220.00, 0, 261.63, 0, 329.63, 0, 440.00, 0, 329.63, 0, 261.63, 0, 220.00, 261.63, 329.63, 0,
      174.61, 0, 220.00, 0, 261.63, 0, 349.23, 0, 392.00, 0, 329.63, 0, 261.63, 0, 0, 0
    ];

    const playStep = () => {
      if (!this.musicPlaying) return;
      if (this.musicEnabled && !this.isMuted && this.ctx) {
        const bFreq = bassline[this.musicStep % bassline.length];
        const mFreq = melody[this.musicStep % melody.length];

        if (bFreq > 0) {
          this.tone({ freq: bFreq, type: 'triangle', duration: 0.12, gain: 0.18 * this.musicVolume });
        }
        if (mFreq > 0) {
          this.tone({ freq: mFreq, type: 'sine', duration: 0.14, gain: 0.14 * this.musicVolume });
        }
        if (this.musicStep % 2 === 0) {
          this.noise({ duration: 0.03, gain: 0.04 * this.musicVolume, filterFreq: 4000, highpass: true });
        }
      }

      this.musicStep = (this.musicStep + 1) % bassline.length;
      this.musicTimer = setTimeout(playStep, stepDuration * 1000);
    };

    playStep();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.storage) {
      this.storage.updateSettings({ soundEnabled: !muted });
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (this.storage) {
      this.storage.updateSettings({ musicEnabled: enabled });
    }
    if (!enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  setVolumes(soundVol, musicVol) {
    this.soundVolume = soundVol;
    this.musicVolume = musicVol;
    if (this.storage) {
      this.storage.updateSettings({ soundVolume: soundVol, musicVolume: musicVol });
    }
  }
}

window.OopsWorld.SoundEngine = SoundEngine;
