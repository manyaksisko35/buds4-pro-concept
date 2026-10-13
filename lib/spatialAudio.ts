const NOTES = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 698.46];
const STEP = 0.32;

export class SpatialDemo {
  private ctx: AudioContext;
  private panner: PannerNode;
  private bus: GainNode;
  private master: GainNode;
  private timer = 0;
  private next = 0;
  private i = 0;

  constructor() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    this.panner = new PannerNode(ctx, {
      panningModel: 'HRTF',
      distanceModel: 'inverse',
      refDistance: 1,
      maxDistance: 20,
      rolloffFactor: 0.6,
      positionX: 0,
      positionY: 0,
      positionZ: -1.6,
    });
    this.panner.connect(this.master);
    this.bus = ctx.createGain();
    this.bus.gain.value = 0.9;
    this.bus.connect(this.panner);

    this.next = ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 60);
    this.schedule();
    this.master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.15);
  }

  private pluck(t: number, f: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o2.type = 'sine';
    o.frequency.value = f;
    o2.frequency.value = f * 2.01;
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    g.connect(this.bus);
    o.start(t);
    o2.start(t);
    o.stop(t + 0.6);
    o2.stop(t + 0.6);
  }

  private tick(t: number) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * 0.04);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / len) ** 3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;
    const g = ctx.createGain();
    g.gain.value = 0.25;
    src.connect(hp).connect(g).connect(this.bus);
    src.start(t);
  }

  private schedule() {
    const horizon = this.ctx.currentTime + 0.25;
    while (this.next < horizon) {
      this.pluck(this.next, NOTES[this.i % NOTES.length]);
      if (this.i % 2 === 0) this.tick(this.next + STEP / 2);
      this.i++;
      this.next += STEP;
    }
  }

  setScene(sourceAngle: number, headYaw: number) {
    const t = this.ctx.currentTime;
    const r = 1.6;
    this.panner.positionX.setTargetAtTime(Math.sin(sourceAngle) * r, t, 0.03);
    this.panner.positionZ.setTargetAtTime(-Math.cos(sourceAngle) * r, t, 0.03);
    const l = this.ctx.listener;
    const fx = Math.sin(headYaw);
    const fz = -Math.cos(headYaw);
    if (l.forwardX) {
      l.forwardX.setTargetAtTime(fx, t, 0.03);
      l.forwardY.setTargetAtTime(0, t, 0.03);
      l.forwardZ.setTargetAtTime(fz, t, 0.03);
      l.upX.setTargetAtTime(0, t, 0.03);
      l.upY.setTargetAtTime(1, t, 0.03);
      l.upZ.setTargetAtTime(0, t, 0.03);
    } else {
      l.setOrientation(fx, 0, fz, 0, 1, 0);
    }
  }

  stop() {
    window.clearInterval(this.timer);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    window.setTimeout(() => void this.ctx.close(), 500);
  }
}
