/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ANSI/ISA-18.2 Audible Alarm Tone Generator
 * Section 9.4: Proper Settings for Audible Alarm Tones (500Hz to 3000Hz, distinct pitches & envelopes)
 */

import { AlarmSeverity } from '../types/hmi';

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isSilenced: boolean = false;
  private activeOscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setSilenced(silenced: boolean) {
    this.isSilenced = silenced;
    if (silenced) {
      this.stopAlarmTone();
    }
  }

  public getSilenced(): boolean {
    return this.isSilenced;
  }

  public playAlarmTone(severity: AlarmSeverity) {
    if (this.isSilenced) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Configure frequencies according to ISA 18.2 recommendations (500Hz - 3000Hz)
      switch (severity) {
        case 'URGENT':
          // Rapid dual-pitch warble 1800Hz <-> 2400Hz
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2400, now);
          osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
          osc.frequency.exponentialRampToValueAtTime(2400, now + 0.3);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
          break;

        case 'HIGH':
          // 1200Hz pulsing chime
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.38);
          break;

        case 'MEDIUM':
          // 850Hz alert ping
          osc.type = 'sine';
          osc.frequency.setValueAtTime(850, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.28);
          break;

        case 'LOW':
        default:
          // 600Hz soft prompt
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
      }
    } catch {
      // Audio playback silently guarded if blocked by browser policy until user gesture
    }
  }

  public playClick() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  public stopAlarmTone() {
    if (this.activeOscillator) {
      try {
        this.activeOscillator.stop();
        this.activeOscillator.disconnect();
      } catch {
        // ignore
      }
      this.activeOscillator = null;
    }
  }
}

export const soundService = new SoundService();
