export type AncMode = 'off' | 'ambient' | 'anc';

const NOISE_LEVEL: Record<AncMode, number> = { off: 0.5, ambient: 0.32, anc: 0.025 };
const VOICE_BOOST: Record<AncMode, number> = { off: 0, ambient: 9, anc: 0 };

const CHORDS = [
  [220, 277.18, 329.63],
  [196, 246.94, 293.66],
  [174.61, 220, 261.63],
  [196, 246.94, 329.63],
];

export class AncDemo {
  private ctx: AudioContext;
  private noiseGain: GainNode;
  private voice: BiquadFilterNode;
  private master: GainNode;
  private oscs: OscillatorNode[] = [];
  private sources: AudioScheduledSourceNode[] = [];
  private timer = 0;

  constructor(mode: AncMode) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    this.noiseGain = ctx.createGain();
    this.voice = ctx.createBiquadFilter();
    this.voice.type = 'peaking';
    this.voice.frequency.value = 1400;
    this.voice.Q.value = 0.8;
    this.voice.connect(this.noiseGain).connect(this.master);

    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.2 + (Math.random() * 2 - 1) * 0.08;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    noise.connect(lp).connect(this.voice);
    this.sources.push(noise);

    const rumble = ctx.createOscillator();
    rumble.type = 'sawtooth';
    rumble.frequency.value = 62;
    const rlp = ctx.createBiquadFilter();
    rlp.type = 'lowpass';
    rlp.frequency.value = 180;
    const rg = ctx.createGain();
    rg.gain.value = 0.35;
    rumble.connect(rlp).connect(rg).connect(this.voice);
    this.sources.push(rumble);

    const music = ctx.createGain();
    music.gain.value = 0.07;
    const mlp = ctx.createBiquadFilter();
    mlp.type = 'lowpass';
    mlp.frequency.value = 2400;
    music.connect(mlp).connect(this.master);
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = CHORDS[0][i];
      o.connect(music);
      this.oscs.push(o);
      this.sources.push(o);
    }
    const bass = ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = CHORDS[0][0] / 2;
    const bg = ctx.createGain();
    bg.gain.value = 1.4;
    bass.connect(bg).connect(music);
    this.oscs.push(bass);
    this.sources.push(bass);

    this.sources.forEach((s) => s.start());
    let step = 0;
    this.timer = window.setInterval(() => {
      step = (step + 1) % CHORDS.length;
      const t = ctx.currentTime;
      CHORDS[step].forEach((f, i) => this.oscs[i].frequency.setTargetAtTime(f, t, 0.08));
      this.oscs[3].frequency.setTargetAtTime(CHORDS[step][0] / 2, t, 0.08);
    }, 2000);

    this.setMode(mode, true);
    this.master.gain.setTargetAtTime(0.8, ctx.currentTime, 0.2);
  }

  setMode(mode: AncMode, instant = false) {
    const t = this.ctx.currentTime;
    const k = instant ? 0.01 : 0.35;
    this.noiseGain.gain.setTargetAtTime(NOISE_LEVEL[mode], t, k);
    this.voice.gain.setTargetAtTime(VOICE_BOOST[mode], t, k);
  }

  stop() {
    window.clearInterval(this.timer);
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(0, t, 0.12);
    window.setTimeout(() => {
      this.sources.forEach((s) => {
        try {
          s.stop();
        } catch {}
      });
      void this.ctx.close();
    }, 500);
  }
}
