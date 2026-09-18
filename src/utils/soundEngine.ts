// Pure Web Audio API Ambient Sound Synthesizer & Chime Engine
// Zero external asset downloads required!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGainNode: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private currentAmbient: string | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientGainNode && this.ctx) {
      this.ambientGainNode.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    }
  }

  // Synthesize white/pink noise for rain and wind
  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // scale volume
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public startAmbient(type: 'rain' | 'forest' | 'waves' | 'lofi') {
    this.initContext();
    if (!this.ctx) return;
    this.stopAmbient();

    this.currentAmbient = type;
    const noiseBuffer = this.createNoiseBuffer();
    if (!noiseBuffer) return;

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    this.ambientGainNode = this.ctx.createGain();
    this.ambientGainNode.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);

    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    } else if (type === 'forest') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);
    } else if (type === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    } else if (type === 'lofi') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    }

    this.noiseSource.connect(filter);
    filter.connect(this.ambientGainNode);
    this.ambientGainNode.connect(this.ctx.destination);

    this.noiseSource.start();
  }

  public stopAmbient() {
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {}
      this.noiseSource = null;
    }
    this.currentAmbient = null;
  }

  // Play a soft organic wooden bloom chime sequence
  public playBloomChime() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 pentatonic bloom chord

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 2.0);
    });
  }

  // Soft click / drop sound for UI button presses
  public playClickSound() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Soft low sad tone for plant wilting
  public playWiltSound() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.8);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  }
}

export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null;
