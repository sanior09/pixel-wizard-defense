/**
 * Retro 8-bit Web Audio Synthesizer for "อัศวินเวทมนตร์พิทักษ์ปราสาท"
 */
(function (global) {
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    unlock() {
      if (!this.ctx) {
        const AudioCtx = global.AudioContext || global.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    _tone(freqStart, freqEnd, duration, type = 'square', gainLevel = 0.08, delay = 0) {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
      }
      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    }

    playShoot() {
      this._tone(680, 320, 0.11, 'triangle', 0.09);
      this._tone(960, 520, 0.08, 'sine', 0.05, 0.02);
    }

    playMonsterHit() {
      this._tone(523.25, 783.99, 0.09, 'square', 0.07);
      this._tone(1046.5, 1318.5, 0.12, 'triangle', 0.07, 0.05);
    }

    playAllyPenalty() {
      this._tone(240, 110, 0.18, 'sawtooth', 0.09);
      this._tone(170, 90, 0.22, 'square', 0.07, 0.08);
    }

    playStart() {
      this._tone(392, 392, 0.09, 'square', 0.07, 0);
      this._tone(523.25, 523.25, 0.09, 'square', 0.07, 0.09);
      this._tone(659.25, 659.25, 0.09, 'square', 0.07, 0.18);
      this._tone(783.99, 1046.5, 0.22, 'triangle', 0.09, 0.27);
    }

    playTick() {
      this._tone(880, 880, 0.05, 'square', 0.04);
    }

    playGameOver() {
      this._tone(659.25, 659.25, 0.12, 'triangle', 0.08, 0);
      this._tone(523.25, 523.25, 0.12, 'triangle', 0.08, 0.13);
      this._tone(392.0, 392.0, 0.14, 'triangle', 0.08, 0.26);
      this._tone(523.25, 783.99, 0.32, 'square', 0.07, 0.42);
    }
  }

  global.SoundFX = new SoundEngine();
})(window);
